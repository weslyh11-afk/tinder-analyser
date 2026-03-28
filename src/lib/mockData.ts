import { AnalysisResult, ClaudePhotoScore } from "@/types";

export function getMockAnalysisResult(photoIds: string[]): AnalysisResult {
  const photoScores: ClaudePhotoScore[] = photoIds.map((id, i) => ({
    photoId: id,
    jawline: i === 0 ? 3 : i === 1 ? 2 : 1,
    smileEyeContact: i === 0 ? 4 : i === 1 ? 2 : 3,
    lightingSkin: i === 0 ? 2 : 1,
    background: i === 1 ? 0 : 1,
    lifestyle: i === 2 ? 1 : 0,
    subtotal: i === 0 ? 10 : i === 1 ? 6 : 6,
    feedback:
      i === 0
        ? [
            "Great eye contact and smile — this is your strongest photo.",
            "The background is slightly cluttered; a plain wall would improve focus on you.",
            "Good lighting overall; moving slightly towards a window would add depth.",
          ]
        : i === 1
        ? [
            "Sunglasses hide your eyes — swap for a photo where your eyes are visible.",
            "This appears to be a group photo as your main image; solo shots perform 36% better.",
            "Low contrast lighting — try outdoors during golden hour for a natural glow.",
          ]
        : [
            "Activity shots are great — this shows personality and lifestyle.",
            "Slightly blurry — make sure your camera is stable for sharper results.",
            "Consider adding a genuine smile to increase perceived trustworthiness.",
          ],
    enhanceable: i === 1,
  }));

  const top5 = [...photoScores]
    .sort((a, b) => b.subtotal - a.subtotal)
    .slice(0, 5);
  const photosTotalPts = top5.reduce((s, p) => s + p.subtotal, 0);

  return {
    photoScores,
    bioScore: {
      text: "Adventure-lover, coffee addict ☕. Ask me about my last trip. Looking for someone to explore the city with.",
      partnerInterest: 6,
      originality: 5,
      adventurousness: 4,
      length: 4,
      noNegativity: 5,
      subtotal: 24,
      feedback: [
        "Great hook — asking a question invites replies and shows curiosity.",
        "\"Coffee addict\" is a mild cliché; replace with something more specific like your favourite spot.",
        "Consider mentioning one concrete thing you want to do with someone — it's more memorable.",
      ],
    },
    completenessScore: {
      photoCountPts: photoIds.length >= 6 ? 10 : photoIds.length * 2,
      bioPts: 4,
      optionalFieldsPts: 1,
      subtotal: Math.min(10, photoIds.length * 2 + 5),
    },
    photosTotalPts,
    totalScore: Math.min(100, photosTotalPts + 24 + Math.min(10, photoIds.length * 2 + 5)),
    worstPhotoIds: photoIds.length > 1 ? [photoIds[1]] : [],
  };
}
