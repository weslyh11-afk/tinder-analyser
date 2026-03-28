import Anthropic from "@anthropic-ai/sdk";
import { ClaudeAnalysisResponse, ClaudePhotoScore, ProfileInput } from "@/types";
import { stripDataUri } from "./imageUtils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert dating profile analyst with deep knowledge of peer-reviewed research on attractiveness and online dating optimisation. You score photos and bios strictly according to a rubric grounded in real studies (SwipeStats 294M swipes, OkCupid 7,140 photo study, PubMed facial attractiveness research, UC Berkeley bio study). Return ONLY valid JSON — no markdown, no commentary.`;

function buildScoringPrompt(input: ProfileInput): string {
  return `Score each photo and the bio using the research-backed rubric below. Return a single JSON object — no extra keys, no prose.

interface Response {
  photos: Array<{
    photoId: string;
    // SCORING (integers only):
    jawline: number;           // 0-4: Visibility and definition of jawline/chin. Research: chin alone explains 45% of facial attractiveness variance (orthodontic study, PubMed). 4=very defined & visible, 3=clear, 2=somewhat visible, 1=obscured or weak, 0=hidden (sunglasses/angle/shadow)
    smileEyeContact: number;   // 0-4: Genuine smile + direct eye contact BOTH present. Research: smile accounts for 49% of attractiveness variance in smiling faces; eye contact + no smile is the WORST combo (Photofeeler 2017). 4=genuine smile+direct eye contact, 3=one of the two strong, 2=both moderate, 1=one present weakly, 0=neither
    lightingSkin: number;      // 0-2: Even, flattering light and visible skin quality. Research: even skin tone is a primary health signal; iMotions neuro study found low-contrast photos trigger lower attraction. 2=excellent natural/window light + clear skin, 1=acceptable, 0=dark/harsh/overexposed
    background: number;        // 0-1: Background quality. Research: cluttered backgrounds increase cognitive load, which decreases attraction (iMotions theta wave study). 1=clean/contextual/adds story, 0=cluttered/distracting/bathroom/bedroom mess
    lifestyle: number;         // 0-1: Photo implies interesting activity, travel, sport, hobby, or environment. Research: outdoor/activity photos were the most common trait in the top-rated profiles (UOC Barcelona study of 1,000 Tinder profiles). 1=clear lifestyle context, 0=neutral/no context
    subtotal: number;          // MUST equal exact sum of jawline+smileEyeContact+lightingSkin+background+lifestyle
    // FEEDBACK — be very specific, reference the photo directly:
    feedback: string[];        // Exactly 3 actionable tips. Be specific: "Your jaw is partially hidden by the camera angle — shoot from slightly below eye level to define your jawline" not "improve your jawline"
    feedbackDetail: string[];  // Exactly 3 explanations of WHY each tip matters, citing the research. E.g. "Research shows chin/jawline definition explains 45% of attractiveness ratings — making it more visible can significantly boost your score."
    enhanceable: boolean;      // true ONLY if lighting, background, or skin quality issues are visible that AI upscaling could realistically fix
  }>;
  bio: {
    text: string;
    partnerInterest: number;   // 0-8: Shows genuine curiosity about the OTHER person. UC Berkeley research: only 20% of profiles do this, but it's the single strongest bio predictor of appeal. 8=strongly asks/invites the reader, 0=entirely self-focused
    originality: number;       // 0-7: Absence of clichés. Common clichés to penalise: "love to laugh", "foodie", "gym rat", "adventure", "I love life", "looking for my partner in crime", "fluent in sarcasm", "dog lover". 7=completely original voice, 0=multiple clichés
    adventurousness: number;   // 0-5: Openness to new experiences (travel, food, activities, meeting people). Research: adventurousness theme correlates with +67% match interest. 5=strong theme, 0=no mention
    length: number;            // 0-5: Ideal = 150-300 chars. Short bios win by 73% (SwipeStats 7,079 profiles). Scoring: blank=0, <50=1, 50-149=3, 150-300=5, 301-500=3, >500=1
    noNegativity: number;      // 0-5: No complaints, demands, deal-breakers, or defensive language ("no hookups", "if you can't handle me", "not here for games"). 5=fully positive, 0=multiple negative elements
    subtotal: number;          // MUST equal exact sum
    feedback: string[];        // Exactly 3 actionable tips, specific to the actual bio text
  };
}

Bio: """${input.bio || "(empty)"}"""
${input.age ? `Age: ${input.age}` : ""}
${input.job ? `Job: ${input.job}` : ""}
${input.height ? `Height: ${input.height}cm` : ""}
${input.education ? `Education: ${input.education}` : ""}
${input.relationshipGoal ? `Looking for: ${input.relationshipGoal}` : ""}
${input.interests ? `Interests: ${input.interests}` : ""}

STRICT RULES:
- subtotal fields must be exact integer sums — never decimals.
- feedback and feedbackDetail must each have EXACTLY 3 strings.
- feedbackDetail must explain the WHY with a research reference for each tip.
- If sunglasses are worn: jawline=0 (eyes hidden), smileEyeContact max 1. Note this explicitly in feedback.
- If it is a group photo: note this is suboptimal (SwipeStats: solo photos get 36% more matches). Lifestyle=0 unless clear solo activity.
- If no face is visible: jawline=0, smileEyeContact=0.
- Bio empty: all bio fields=0, feedback=["Voeg een bio toe — profielen met bio krijgen 4× meer matches.", "Houd het onder de 300 tekens — korte bio's scoren 73% beter (SwipeStats data van 7.079 profielen).", "Toon interesse in de ander, niet alleen in jezelf (UC Berkeley onderzoek)."]
- Return ONLY the JSON object.`;
}

export async function analyseProfile(
  input: ProfileInput
): Promise<ClaudeAnalysisResponse> {
  const content: Anthropic.MessageParam["content"] = [];

  for (const photo of input.photos) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: photo.mimeType,
        data: stripDataUri(photo.base64),
      },
    });
    content.push({
      type: "text",
      text: `The photo above has id: "${photo.id}". Keep this id for your response.`,
    });
  }

  content.push({ type: "text", text: buildScoringPrompt(input) });

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const raw = (response.content[0] as Anthropic.TextBlock).text.trim();
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");

  const parsed: ClaudeAnalysisResponse = JSON.parse(cleaned);

  for (const p of parsed.photos) {
    p.subtotal = p.jawline + p.smileEyeContact + p.lightingSkin + p.background + p.lifestyle;
    if (!p.feedbackDetail) p.feedbackDetail = [];
  }
  parsed.bio.subtotal =
    parsed.bio.partnerInterest +
    parsed.bio.originality +
    parsed.bio.adventurousness +
    parsed.bio.length +
    parsed.bio.noNegativity;

  return parsed;
}

export async function rescorePhoto(
  photoId: string,
  imageUrl: string
): Promise<ClaudePhotoScore> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: imageUrl } },
          {
            type: "text",
            text: `Score this photo (id: "${photoId}") and return ONLY JSON:
{
  photoId: string;
  jawline: number;           // 0-4
  smileEyeContact: number;   // 0-4
  lightingSkin: number;      // 0-2
  background: number;        // 0-1
  lifestyle: number;         // 0-1
  subtotal: number;
  feedback: string[];        // 3 tips
  feedbackDetail: string[];  // 3 research explanations
  enhanceable: boolean;
}`,
          },
        ],
      },
    ],
  });

  const raw = (response.content[0] as Anthropic.TextBlock).text.trim();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  const score: ClaudePhotoScore = JSON.parse(cleaned);
  score.subtotal = score.jawline + score.smileEyeContact + score.lightingSkin + score.background + score.lifestyle;
  if (!score.feedbackDetail) score.feedbackDetail = [];
  return score;
}
