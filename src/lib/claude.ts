import Anthropic from "@anthropic-ai/sdk";
import { ClaudeAnalysisResponse, ClaudePhotoScore, ProfileInput } from "@/types";
import { stripDataUri } from "./imageUtils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert dating profile analyst with deep knowledge of research-backed attractiveness and profile optimisation. You will receive between 1 and 6 photos of a Tinder profile and a bio text. Your task is to score each photo and the bio according to a strict rubric and return ONLY a valid JSON object — no markdown fences, no commentary, no extra keys.`;

function buildScoringPrompt(input: ProfileInput): string {
  return `Score each photo and the bio using ONLY the rubric below. Return a single JSON object matching exactly this TypeScript interface — no extra keys, no prose:

interface Response {
  photos: Array<{
    photoId: string;          // the id given before each photo
    jawline: number;          // 0-4: clarity and definition of jawline/chin (45% of attractiveness variance per research)
    smileEyeContact: number;  // 0-4: genuine smile AND direct eye contact both present (49% variance for smiling faces)
    lightingSkin: number;     // 0-2: even flattering light + clear skin presentation
    background: number;       // 0-1: uncluttered, contextually appropriate background
    lifestyle: number;        // 0-1: photo implies interesting activity or environment
    subtotal: number;         // must equal sum of above five fields exactly
    feedback: string[];       // exactly 3 specific, actionable improvement tips (photo-specific, not generic)
    enhanceable: boolean;     // true ONLY if lighting, background, or skin could realistically be improved by AI
  }>;
  bio: {
    text: string;             // echo the bio back verbatim
    partnerInterest: number;  // 0-8: shows curiosity about the other person (UC Berkeley research: profiles doing this get more matches)
    originality: number;      // 0-7: no clichés like "love to laugh", "foodie", "gym rat", "adventure"
    adventurousness: number;  // 0-5: open to new experiences, travel, activities (+67% interest in studies)
    length: number;           // 0-5: ideal 150-300 chars; <50 or blank = 0; >500 = 2; 50-149 = 3
    noNegativity: number;     // 0-5: no complaints, demands, or defensive language
    subtotal: number;         // must equal sum of above five fields exactly
    feedback: string[];       // exactly 3 specific, actionable improvement tips
  };
}

Bio text: """${input.bio || "(empty)"}"""
${input.age ? `Age: ${input.age}` : ""}
${input.job ? `Job: ${input.job}` : ""}
${input.interests ? `Interests: ${input.interests}` : ""}

RULES:
- subtotal fields must be exact arithmetic sums of their component fields.
- Integer values only — no decimals.
- feedback must be concrete and specific (e.g. "Move to a window for natural side-lighting" not "Improve lighting").
- enhanceable is true ONLY when lighting/background/skin defects are clearly visible.
- If bio is empty, set all bio fields to 0 and feedback to ["Add a bio — profiles with bios get 4× more matches.", "Keep it under 300 characters — short bios outperform long ones by 73%.", "Show interest in the other person, not just yourself (UC Berkeley research)."].
- Return ONLY the JSON object. Any text outside the JSON will break parsing.`;
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

  content.push({
    type: "text",
    text: buildScoringPrompt(input),
  });

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const raw = (response.content[0] as Anthropic.TextBlock).text.trim();
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");

  const parsed: ClaudeAnalysisResponse = JSON.parse(cleaned);

  // Recalculate subtotals for safety
  for (const p of parsed.photos) {
    p.subtotal =
      p.jawline + p.smileEyeContact + p.lightingSkin + p.background + p.lifestyle;
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
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "url", url: imageUrl },
          },
          {
            type: "text",
            text: `Score this photo (id: "${photoId}") using this rubric and return ONLY JSON:
{
  photoId: string;
  jawline: number;         // 0-4
  smileEyeContact: number; // 0-4
  lightingSkin: number;    // 0-2
  background: number;      // 0-1
  lifestyle: number;       // 0-1
  subtotal: number;        // exact sum
  feedback: string[];      // 3 tips
  enhanceable: boolean;
}`,
          },
        ],
      },
    ],
  });

  const raw = (response.content[0] as Anthropic.TextBlock).text.trim();
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");

  const score: ClaudePhotoScore = JSON.parse(cleaned);
  score.subtotal =
    score.jawline + score.smileEyeContact + score.lightingSkin + score.background + score.lifestyle;
  return score;
}
