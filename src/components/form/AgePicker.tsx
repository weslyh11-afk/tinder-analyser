"use client";

import { useRef, useEffect, useCallback } from "react";

interface Props {
  value: number | null;
  onChange: (age: number) => void;
  min?: number;
  max?: number;
}

const ITEM_HEIGHT = 44;

export default function AgePicker({ value, onChange, min = 18, max = 80 }: Props) {
  const ages = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const listRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  const scrollToAge = useCallback(
    (age: number, smooth = true) => {
      const el = listRef.current;
      if (!el) return;
      const idx = age - min;
      el.scrollTo({ top: idx * ITEM_HEIGHT, behavior: smooth ? "smooth" : "instant" });
    },
    [min]
  );

  // Init scroll position
  useEffect(() => {
    scrollToAge(value ?? 25, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleScroll() {
    const el = listRef.current;
    if (!el) return;
    clearTimeout((handleScroll as { _t?: ReturnType<typeof setTimeout> })._t);
    (handleScroll as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
      const snapped = Math.max(0, Math.min(ages.length - 1, idx));
      const newAge = min + snapped;
      onChange(newAge);
      // Snap to exact position
      el.scrollTo({ top: snapped * ITEM_HEIGHT, behavior: "smooth" });
    }, 120);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <label className="block text-sm font-medium text-gray-300 self-start">
        Leeftijd
      </label>
      <div className="relative w-full h-[132px] overflow-hidden rounded-xl bg-gray-900 border border-gray-600">
        {/* Selection highlight */}
        <div
          className="absolute left-0 right-0 border-y border-rose-500/50 bg-rose-500/10 pointer-events-none"
          style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
        />
        {/* Fade top */}
        <div className="absolute inset-x-0 top-0 h-11 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none z-10" />
        {/* Fade bottom */}
        <div className="absolute inset-x-0 bottom-0 h-11 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none z-10" />

        {/* Scrollable list */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll scrollbar-none"
          style={{ scrollSnapType: "y mandatory" }}
        >
          {/* Padding items top/bottom so selected item sits in middle */}
          <div style={{ height: ITEM_HEIGHT }} />
          {ages.map((age) => (
            <div
              key={age}
              onClick={() => { onChange(age); scrollToAge(age); }}
              className="flex items-center justify-center cursor-pointer"
              style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
            >
              <span
                className={`text-lg font-semibold transition-colors ${
                  value === age ? "text-white" : "text-gray-500"
                }`}
              >
                {age}
              </span>
            </div>
          ))}
          <div style={{ height: ITEM_HEIGHT }} />
        </div>
      </div>
      {value && (
        <p className="text-xs text-gray-500 self-start">
          Geselecteerd: <span className="text-rose-400 font-medium">{value} jaar</span>
        </p>
      )}
    </div>
  );
}
