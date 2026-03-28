import {
  AnalysisResult,
  ClaudeAnalysisResponse,
  CompletenessScore,
  ProfileInput,
} from "@/types";

const PHOTO_COUNT_PTS = [0, 2, 4, 6, 8, 8, 10];

export function computeAnalysisResult(
  claude: ClaudeAnalysisResponse,
  input: ProfileInput
): AnalysisResult {
  // Top-5 photo scores by subtotal
  const sorted = [...claude.photos].sort((a, b) => b.subtotal - a.subtotal);
  const top5 = sorted.slice(0, 5);
  const photosTotalPts = top5.reduce((sum, p) => sum + p.subtotal, 0); // max 60

  // Completeness
  const photoCount = input.photos.length;
  const photoCountPts = PHOTO_COUNT_PTS[Math.min(photoCount, 6)] ?? 10;
  const bioPts = input.bio.trim().length > 0 ? 4 : 0;
  const optionalFieldsPts = (input.job ? 1 : 0) + (input.interests ? 1 : 0);

  const completenessScore: CompletenessScore = {
    photoCountPts,
    bioPts,
    optionalFieldsPts,
    subtotal: photoCountPts + bioPts + optionalFieldsPts,
  };

  const totalScore = Math.min(
    100,
    photosTotalPts + claude.bio.subtotal + completenessScore.subtotal
  );

  // Worst 1-2 enhanceable photos
  const worstPhotoIds = claude.photos
    .filter((p) => p.enhanceable)
    .sort((a, b) => a.subtotal - b.subtotal)
    .slice(0, 2)
    .map((p) => p.photoId);

  return {
    photoScores: claude.photos,
    bioScore: claude.bio,
    completenessScore,
    vibe: claude.vibe,
    photosTotalPts,
    totalScore,
    worstPhotoIds,
  };
}
