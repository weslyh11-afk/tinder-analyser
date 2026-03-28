import { PhotoFile, VibeAnalysis } from "@/types";

interface Props {
  firstImpression: VibeAnalysis["firstImpression"];
  mainPhoto: PhotoFile;
}

const VERDICT_CONFIG = {
  Stopper: {
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    bar: "bg-green-500",
    label: "Stopper ✓",
    sub: "Je hoofdfoto laat mensen stoppen met scrollen",
  },
  Twijfelgeval: {
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    bar: "bg-amber-400",
    label: "Twijfelgeval",
    sub: "Je hoofdfoto trekt niet direct de aandacht",
  },
  Passer: {
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/30",
    bar: "bg-rose-500",
    label: "Passer ✗",
    sub: "Je hoofdfoto wordt waarschijnlijk voorbijgescrold",
  },
};

export default function FirstImpressionCard({ firstImpression, mainPhoto }: Props) {
  const cfg = VERDICT_CONFIG[firstImpression.verdict];

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden">
      <div className="p-5">
        <h3 className="text-white font-semibold mb-4">First Impression (0.3 seconden)</h3>
        <p className="text-xs text-gray-500 mb-4">
          Onderzoek toont dat mensen in 0.3 seconden beslissen of ze stoppen met scrollen.
          Dit is alleen gebaseerd op je hoofdfoto.
        </p>

        <div className="flex gap-4 items-start">
          {/* Main photo thumbnail */}
          <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainPhoto.base64} alt="Hoofdfoto" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 space-y-3">
            {/* Verdict badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${cfg.bg}`}>
              <span className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</span>
            </div>
            <p className={`text-xs ${cfg.color}`}>{cfg.sub}</p>

            {/* Score bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>First impression score</span>
                <span className={cfg.color}>{firstImpression.score}/10</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${cfg.bar} transition-all duration-700`}
                  style={{ width: `${firstImpression.score * 10}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div className="mt-4 bg-gray-700/40 rounded-xl px-4 py-3">
          <p className="text-sm text-gray-200">{firstImpression.reasoning}</p>
        </div>
      </div>
    </div>
  );
}
