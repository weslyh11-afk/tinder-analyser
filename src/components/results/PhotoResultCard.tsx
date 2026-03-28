import { ClaudePhotoScore, PhotoFile } from "@/types";
import Badge from "@/components/ui/Badge";

interface Props {
  score: ClaudePhotoScore;
  photo: PhotoFile;
  index: number;
}

const CRITERIA = [
  { key: "jawline", label: "Jawline / chin", max: 4 },
  { key: "smileEyeContact", label: "Smile + eye contact", max: 4 },
  { key: "lightingSkin", label: "Lighting & skin", max: 2 },
  { key: "background", label: "Background", max: 1 },
  { key: "lifestyle", label: "Lifestyle context", max: 1 },
] as const;

export default function PhotoResultCard({ score, photo, index }: Props) {
  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.base64}
            alt={`Photo ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Score summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium text-sm">
              Photo {index + 1}
              {index === 0 && (
                <span className="ml-2 text-xs text-rose-400">(Main)</span>
              )}
            </span>
            <Badge score={score.subtotal} max={12} />
          </div>

          <div className="space-y-1.5">
            {CRITERIA.map(({ key, label, max }) => {
              const val = score[key] as number;
              const pct = (val / max) * 100;
              const color =
                pct >= 75
                  ? "bg-green-500"
                  : pct >= 50
                  ? "bg-amber-400"
                  : "bg-rose-500";
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs w-32 shrink-0">
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
      </div>

      {/* Feedback */}
      {score.feedback.length > 0 && (
        <div className="border-t border-gray-700 px-4 py-3 space-y-1">
          {score.feedback.map((tip, i) => (
            <p key={i} className="text-sm text-gray-300 flex gap-2">
              <span className="text-rose-400 shrink-0">→</span>
              {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
