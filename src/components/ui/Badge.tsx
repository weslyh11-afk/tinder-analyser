interface Props {
  score: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}

function getColor(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 80) return "bg-yellow-400 text-yellow-900";
  if (pct >= 60) return "bg-green-500 text-white";
  if (pct >= 40) return "bg-amber-400 text-amber-900";
  return "bg-rose-500 text-white";
}

const sizeClasses = {
  sm: "text-xs px-2 py-0.5 rounded",
  md: "text-sm px-2.5 py-1 rounded-md",
  lg: "text-base px-3 py-1.5 rounded-lg font-bold",
};

export default function Badge({ score, max = 12, size = "md" }: Props) {
  return (
    <span
      className={`inline-block font-semibold ${getColor(score, max)} ${sizeClasses[size]}`}
    >
      {score}/{max}
    </span>
  );
}
