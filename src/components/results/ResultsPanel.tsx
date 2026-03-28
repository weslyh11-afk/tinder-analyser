import { AnalysisResult, PhotoFile } from "@/types";
import ScoreGauge from "./ScoreGauge";
import ScoreBreakdown from "./ScoreBreakdown";
import PhotoResultCard from "./PhotoResultCard";
import BioResultCard from "./BioResultCard";
import EnhancementSection from "./EnhancementSection";

interface Props {
  result: AnalysisResult;
  photos: PhotoFile[];
  onReset: () => void;
}

export default function ResultsPanel({ result, photos, onReset }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Your Profile Score</h2>
        <button
          onClick={onReset}
          className="text-sm text-gray-400 hover:text-white underline transition-colors"
        >
          Analyse again
        </button>
      </div>

      {/* Score gauge + breakdown */}
      <div className="bg-gray-800 rounded-2xl p-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ScoreGauge score={result.totalScore} />
        <div className="flex-1 w-full">
          <ScoreBreakdown result={result} />
        </div>
      </div>

      {/* Per-photo results */}
      <div>
        <h3 className="text-white font-semibold mb-3">Photo Analysis</h3>
        <div className="space-y-3">
          {result.photoScores.map((score) => {
            const photo = photos.find((p) => p.id === score.photoId);
            const index = photos.findIndex((p) => p.id === score.photoId);
            if (!photo) return null;
            return (
              <PhotoResultCard
                key={score.photoId}
                score={score}
                photo={photo}
                index={index}
              />
            );
          })}
        </div>
      </div>

      {/* Bio result */}
      <div>
        <h3 className="text-white font-semibold mb-3">Bio Analysis</h3>
        <BioResultCard score={result.bioScore} />
      </div>

      {/* Enhancement */}
      <EnhancementSection result={result} photos={photos} />
    </div>
  );
}
