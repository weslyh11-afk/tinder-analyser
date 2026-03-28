import { ClaudeBioScore } from "@/types";
import Badge from "@/components/ui/Badge";

interface Props {
  score: ClaudeBioScore;
}

const CRITERIA = [
  { key: "partnerInterest", label: "Shows interest in partner", max: 8 },
  { key: "originality", label: "Originality / no clichés", max: 7 },
  { key: "adventurousness", label: "Adventurousness", max: 5 },
  { key: "length", label: "Length (150–300 chars)", max: 5 },
  { key: "noNegativity", label: "No negativity", max: 5 },
] as const;

export default function BioResultCard({ score }: Props) {
  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium">Bio</span>
          <Badge score={score.subtotal} max={30} />
        </div>

        {score.text && score.text !== "(empty)" && (
          <blockquote className="text-gray-400 text-sm italic border-l-2 border-gray-600 pl-3 mb-3 line-clamp-3">
            {score.text}
          </blockquote>
        )}

        <div className="space-y-2">
          {CRITERIA.map(({ key, label, max }) => {
            const val = score[key] as number;
            const pct = (val / max) * 100;
            const color =
              pct >= 75
                ? "bg-green-500"
                : pct >= 50
                ? "bg-amber-400"
                : "bg-purple-500";
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-gray-400 text-xs w-44 shrink-0">
                  {label}
                </span>
                <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-gray-400 text-xs w-8 text-right">
                  {val}/{max}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {score.feedback.length > 0 && (
        <div className="border-t border-gray-700 px-4 py-3 space-y-1">
          {score.feedback.map((tip, i) => (
            <p key={i} className="text-sm text-gray-300 flex gap-2">
              <span className="text-purple-400 shrink-0">→</span>
              {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
