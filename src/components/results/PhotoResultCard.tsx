"use client";

import { useState } from "react";
import { ClaudePhotoScore, PhotoFile } from "@/types";
import Badge from "@/components/ui/Badge";

interface Props {
  score: ClaudePhotoScore;
  photo: PhotoFile;
  index: number;
}

const CRITERIA = [
  {
    key: "jawline",
    label: "Kaak / kin",
    max: 4,
    why: "Onderzoek toont dat kaak/kin-definitie 45% van de aantrekkelijkheidsscore bepaalt (PubMed, orthodontisch onderzoek).",
  },
  {
    key: "smileEyeContact",
    label: "Glimlach + oogcontact",
    max: 4,
    why: "Glimlach verklaart 49% van de variantie bij foto's waar iemand lacht. Oogcontact zónder glimlach is de slechtste combo (Photofeeler studie).",
  },
  {
    key: "lightingSkin",
    label: "Belichting & huid",
    max: 2,
    why: "Egale belichting en huidkwaliteit zijn primaire gezondheidssignalen. Low-contrast foto's verlagen aantrekkelijkheid aantoonbaar (iMotions neuro-studie).",
  },
  {
    key: "background",
    label: "Achtergrond",
    max: 1,
    why: "Rommelige achtergronden verhogen cognitieve belasting, wat aantrekkelijkheid verlaagt (iMotions theta wave onderzoek).",
  },
  {
    key: "lifestyle",
    label: "Lifestyle context",
    max: 1,
    why: "Activiteiten- en outdoor foto's waren de meest voorkomende eigenschap in de best scorende profielen (UOC Barcelona studie van 1.000 Tinder profielen).",
  },
] as const;

export default function PhotoResultCard({ score, photo, index }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showWhy, setShowWhy] = useState<string | null>(null);

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.base64} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
        </div>

        {/* Score summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium text-sm">
              Foto {index + 1}
              {index === 0 && <span className="ml-2 text-xs text-rose-400">(Hoofdfoto)</span>}
            </span>
            <Badge score={score.subtotal} max={12} />
          </div>

          <div className="space-y-1.5">
            {CRITERIA.map(({ key, label, max, why }) => {
              const val = score[key] as number;
              const pct = (val / max) * 100;
              const color = pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-amber-400" : "bg-rose-500";
              return (
                <div key={key}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowWhy(showWhy === key ? null : key)}
                      className="text-gray-400 hover:text-gray-200 text-xs w-32 shrink-0 text-left flex items-center gap-1"
                      title="Klik voor uitleg"
                    >
                      {label}
                      <span className="text-gray-600 text-[10px]">ⓘ</span>
                    </button>
                    <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-gray-400 text-xs w-8 text-right">{val}/{max}</span>
                  </div>
                  {showWhy === key && (
                    <p className="text-xs text-blue-300 mt-1 ml-1 pl-2 border-l border-blue-800">
                      {why}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feedback */}
      {score.feedback.length > 0 && (
        <div className="border-t border-gray-700 px-4 py-3 space-y-3">
          {score.feedback.map((tip, i) => (
            <div key={i}>
              <p className="text-sm text-gray-200 flex gap-2">
                <span className="text-rose-400 shrink-0 mt-0.5">→</span>
                <span>{tip}</span>
              </p>
              {score.feedbackDetail?.[i] && (
                <p className="text-xs text-gray-500 mt-1 ml-5 italic">
                  {score.feedbackDetail[i]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expand toggle for more context */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-xs text-gray-600 hover:text-gray-400 py-2 border-t border-gray-700/50 transition-colors"
      >
        {expanded ? "▲ Minder info" : "▼ Klik op de labels hierboven voor wetenschappelijke uitleg"}
      </button>
    </div>
  );
}
