"use client";

import { useEffect, useState } from "react";

interface Props {
  value: number; // 0-100
  max?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  color = "bg-rose-500",
  label,
  showValue = true,
}: Props) {
  const [width, setWidth] = useState(0);
  const pct = Math.round((value / max) * 100);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 50);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between text-sm mb-1">
          {label && <span className="text-gray-300">{label}</span>}
          {showValue && (
            <span className="text-white font-medium">
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
