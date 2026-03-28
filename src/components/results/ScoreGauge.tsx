"use client";

import { useEffect, useState } from "react";

interface Props {
  score: number; // 0-100
}

function getColor(score: number) {
  if (score >= 80) return "#facc15"; // gold
  if (score >= 60) return "#22c55e"; // green
  if (score >= 40) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function getLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Needs Work";
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_FRACTION = 0.75; // 270 degrees of the circle

export default function ScoreGauge({ score }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const color = getColor(score);
  const dashOffset =
    CIRCUMFERENCE - (animatedScore / 100) * CIRCUMFERENCE * ARC_FRACTION;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-[135deg]">
          {/* Track */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="#374151"
            strokeWidth="10"
            strokeDasharray={`${CIRCUMFERENCE * ARC_FRACTION} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
          />
          {/* Progress */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${CIRCUMFERENCE * ARC_FRACTION} ${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out, stroke 0.3s" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-4xl font-bold"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-gray-400 text-xs">/ 100</span>
        </div>
      </div>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ color, backgroundColor: `${color}20` }}
      >
        {getLabel(score)}
      </span>
    </div>
  );
}
