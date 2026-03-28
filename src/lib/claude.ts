import Anthropic from "@anthropic-ai/sdk";
import { ClaudeAnalysisResponse, ClaudePhotoScore, ProfileInput } from "@/types";
import { stripDataUri } from "./imageUtils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert dating profile analyst with deep knowledge of peer-reviewed research on attractiveness and online dating optimisation. You score photos and bios strictly according to a rubric grounded in real studies (SwipeStats 294M swipes, OkCupid 7,140 photo study, PubMed facial attractiveness research, UC Berkeley bio study). Return ONLY valid JSON — no markdown, no commentary.`;

function buildScoringPrompt(input: ProfileInput): string {
  return `Analyse this Tinder profile fully. Return a single JSON object — no extra keys, no prose.

interface Response {
  photos: Array<{
    photoId: string;
    jawline: number;           // 0-4: chin/jawline definition. Research: explains 45% of attractiveness variance (PubMed). 4=very defined, 0=hidden
    smileEyeContact: number;   // 0-4: genuine smile + direct eye contact BOTH present. 4=both strong, 0=neither. Eye contact alone without smile is WORST combo (Photofeeler 2017)
    lightingSkin: number;      // 0-2: even flattering light + skin clarity. Low-contrast photos lower attraction (iMotions neuro-study)
    background: number;        // 0-1: uncluttered, contextual. Clutter raises cognitive load = lower attraction
    lifestyle: number;         // 0-1: shows activity/hobby/environment. Top profiles have this consistently (UOC Barcelona 1,000 profile study)
    subtotal: number;          // EXACT sum of above 5 fields
    feedback: string[];        // EXACTLY 3 specific actionable tips referencing the actual photo
    feedbackDetail: string[];  // EXACTLY 3 research-backed explanations for each tip (cite the study)
    enhanceable: boolean;      // true only if AI upscaling could fix visible lighting/background/skin issues
  }>;
  bio: {
    text: string;
    partnerInterest: number;   // 0-8: curiosity about the OTHER person (UC Berkeley: only 20% of profiles do this)
    originality: number;       // 0-7: absence of clichés ("love to laugh", "foodie", "gym rat", "adventure seeker", "partner in crime")
    adventurousness: number;   // 0-5: openness to new experiences (+67% match interest in studies)
    length: number;            // 0-5: blank=0, <50=1, 50-149=3, 150-300=5, 301-500=3, >500=1
    noNegativity: number;      // 0-5: no complaints/demands/deal-breakers
    subtotal: number;          // EXACT sum
    feedback: string[];        // EXACTLY 3 specific tips referencing the actual bio text
  };
  vibe: {
    vibeLabel: string;         // 2-4 word label e.g. "Avontuurlijk & Warm" or "Serieus & Ambitieus"
    vibeEmoji: string;         // single most fitting emoji
    vibeScore: number;         // 0-10: how compelling/attractive is the overall vibe
    vibeDescription: string;   // 2-3 sentences: what overall impression does this profile make on a potential match?
    unintendedSignals: string[]; // EXACTLY 3 things this profile accidentally communicates that the person probably doesn't want to signal (be honest, e.g. "Je eerste foto suggereert onzekerheid over je uiterlijk doordat je weggekeken hebt")
    conversationHooks: string[]; // EXACTLY 3 specific elements (from bio OR photos) that give a potential match something concrete to message about. Format: "📍 [element]: [why this is a great hook]"
    firstImpression: {
      verdict: "Stopper" | "Twijfelgeval" | "Passer"; // Stopper=would make someone stop scrolling, Twijfelgeval=unsure, Passer=would scroll past
      score: number;           // 0-10 for the FIRST PHOTO ONLY as a standalone impression
      reasoning: string;       // 1-2 sentences: what works/doesn't in the first 0.3 seconds
    };
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
- All subtotal fields = exact integer sums. No decimals.
- feedback, feedbackDetail, unintendedSignals, conversationHooks must each have EXACTLY the specified number of strings.
- unintendedSignals must be honest and specific — NOT generic. Reference actual elements.
- conversationHooks must be concrete elements from THIS profile, not generic advice.
- firstImpression evaluates ONLY the first photo as a standalone 0.3-second judgment.
- vibeDescription must be written as if talking to the user directly ("Je profiel straalt...").
- If sunglasses: jawline=0, smileEyeContact max 1. Flag in feedback.
- If group photo as first: note in unintendedSignals.
- Bio empty: all bio fields=0, feedback=["Voeg een bio toe — profielen met bio krijgen 4× meer matches.", "Houd het onder 300 tekens — korte bio's scoren 73% beter.", "Toon interesse in de ander, niet alleen in jezelf (UC Berkeley)."]
- Return ONLY the JSON object.`;
}

export async function analyseProfile(input: ProfileInput): Promise<ClaudeAnalysisResponse> {
  const content: Anthropic.MessageParam["content"] = [];

  for (const photo of input.photos) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: photo.mimeType, data: stripDataUri(photo.base64) },
    });
    content.push({ type: "text", text: `The photo above has id: "${photo.id}". Keep this id for your response.` });
  }
  content.push({ type: "text", text: buildScoringPrompt(input) });

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
  });

  const raw = (response.content[0] as Anthropic.TextBlock).text.trim();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  const parsed: ClaudeAnalysisResponse = JSON.parse(cleaned);

  for (const p of parsed.photos) {
    p.subtotal = p.jawline + p.smileEyeContact + p.lightingSkin + p.background + p.lifestyle;
    if (!p.feedbackDetail) p.feedbackDetail = [];
  }
  parsed.bio.subtotal =
    parsed.bio.partnerInterest + parsed.bio.originality +
    parsed.bio.adventurousness + parsed.bio.length + parsed.bio.noNegativity;

  if (!parsed.vibe) {
    parsed.vibe = {
      vibeLabel: "Onbekend",
      vibeEmoji: "❓",
      vibeScore: 5,
      vibeDescription: "Kon geen vibe analyse uitvoeren.",
      unintendedSignals: [],
      conversationHooks: [],
      firstImpression: { verdict: "Twijfelgeval", score: 5, reasoning: "" },
    };
  }

  return parsed;
}

export async function rescorePhoto(photoId: string, imageUrl: string): Promise<ClaudePhotoScore> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "url", url: imageUrl } },
        {
          type: "text",
          text: `Score this photo (id: "${photoId}") and return ONLY JSON:
{
  photoId: string;
  jawline: number; smileEyeContact: number; lightingSkin: number;
  background: number; lifestyle: number; subtotal: number;
  feedback: string[]; feedbackDetail: string[]; enhanceable: boolean;
}`,
        },
      ],
    }],
  });

  const raw = (response.content[0] as Anthropic.TextBlock).text.trim();
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  const score: ClaudePhotoScore = JSON.parse(cleaned);
  score.subtotal = score.jawline + score.smileEyeContact + score.lightingSkin + score.background + score.lifestyle;
  if (!score.feedbackDetail) score.feedbackDetail = [];
  return score;
}
