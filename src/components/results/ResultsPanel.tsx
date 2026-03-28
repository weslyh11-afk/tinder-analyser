import { AnalysisResult, PhotoFile } from "@/types";
import ScoreGauge from "./ScoreGauge";
import ScoreBreakdown from "./ScoreBreakdown";
import PhotoResultCard from "./PhotoResultCard";
import BioResultCard from "./BioResultCard";
import EnhancementSection from "./EnhancementSection";
import VibeCard from "./VibeCard";
import FirstImpressionCard from "./FirstImpressionCard";
import IterationTracker from "./IterationTracker";

interface Props {
  result: AnalysisResult;
  photos: PhotoFile[];
  onReset: () => void;
}

export default function ResultsPanel({ result, photos, onReset }: Props) {
  const mainPhoto = photos[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Jouw Profiel Score</h2>
        <button
          onClick={onReset}
          className="text-sm text-gray-400 hover:text-white underline transition-colors"
        >
          Opnieuw analyseren
        </button>
      </div>

      {/* Score gauge + breakdown */}
      <div className="bg-gray-800 rounded-2xl p-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ScoreGauge score={result.totalScore} />
        <div className="flex-1 w-full">
          <ScoreBreakdown result={result} />
        </div>
      </div>

      {/* Iteration tracker (shows only after 2+ analyses) */}
      <IterationTracker currentScore={result.totalScore} />

      {/* First impression */}
      {mainPhoto && result.vibe?.firstImpression && (
        <FirstImpressionCard
          firstImpression={result.vibe.firstImpression}
          mainPhoto={mainPhoto}
        />
      )}

      {/* Vibe check */}
      {result.vibe && <VibeCard vibe={result.vibe} />}

      {/* Per-photo results */}
      <div>
        <h3 className="text-white font-semibold mb-3">Foto Analyse</h3>
        <div className="space-y-3">
          {result.photoScores.map((score) => {
            const photo = photos.find((p) => p.id === score.photoId);
            const index = photos.findIndex((p) => p.id === score.photoId);
            if (!photo) return null;
            return (
              <PhotoResultCard key={score.photoId} score={score} photo={photo} index={index} />
            );
          })}
        </div>
      </div>

      {/* Bio result */}
      <div>
        <h3 className="text-white font-semibold mb-3">Bio Analyse</h3>
        <BioResultCard score={result.bioScore} />
      </div>

      {/* Enhancement */}
      <EnhancementSection result={result} photos={photos} />
    </div>
  );
}
