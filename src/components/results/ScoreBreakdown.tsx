import { AnalysisResult } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";

interface Props {
  result: AnalysisResult;
}

export default function ScoreBreakdown({ result }: Props) {
  const { photosTotalPts, bioScore, completenessScore } = result;

  return (
    <div className="bg-gray-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-white font-semibold text-sm uppercase tracking-wider">
        Score Breakdown
      </h3>
      <div className="space-y-3">
        <ProgressBar
          label="Photos"
          value={photosTotalPts}
          max={60}
          color="bg-rose-500"
        />
        <ProgressBar
          label="Bio"
          value={bioScore.subtotal}
          max={30}
          color="bg-purple-500"
        />
        <ProgressBar
          label="Profile completeness"
          value={completenessScore.subtotal}
          max={10}
          color="bg-blue-500"
        />
      </div>

      <div className="border-t border-gray-700 pt-3 text-xs text-gray-400 space-y-1">
        <p>
          Photos: {photosTotalPts}/60 &bull; Bio: {bioScore.subtotal}/30 &bull;
          Completeness: {completenessScore.subtotal}/10
        </p>
        {completenessScore.bioPts === 0 && (
          <p className="text-amber-400">+ Add a bio to gain 4 more points</p>
        )}
        {completenessScore.photoCountPts < 10 && (
          <p className="text-amber-400">
            + Add more photos to gain up to{" "}
            {10 - completenessScore.photoCountPts} more points
          </p>
        )}
      </div>
    </div>
  );
}
