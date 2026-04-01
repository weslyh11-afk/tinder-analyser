import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert aesthetic facial analyst. Analyze the uploaded face photo with scientific precision. Respond ONLY in valid JSON — no markdown, no explanation. Use the following exact structure.`;

function buildPrompt(gender: string, ageRange: string): string {
  return `Analyze this face photo. The subject is ${gender}, age range ${ageRange}. Use that context for your analysis.

Return ONLY this JSON structure (no extra keys, no prose):

{
  "overall_score": number (1.0-10.0),
  "first_impression": "string — what people perceive in the first 3 seconds",
  "summary": "string — 2-3 sentence overall assessment",
  "categories": {
    "symmetry": {
      "score": number (1.0-10.0),
      "label": "string",
      "details": "string — analysis of facial symmetry"
    },
    "proportions": {
      "score": number,
      "label": "string",
      "details": "string — facial thirds, width-to-height ratio"
    },
    "eyes": {
      "score": number,
      "label": "string",
      "details": "string — shape, spacing, canthal tilt, eye area"
    },
    "nose": {
      "score": number,
      "label": "string",
      "details": "string — bridge, tip, width, projection"
    },
    "jawline": {
      "score": number,
      "label": "string",
      "details": "string — definition, angle, width"
    },
    "lips_mouth": {
      "score": number,
      "label": "string",
      "details": "string — lip ratio, vermillion border, mouth width"
    },
    "skin": {
      "score": number,
      "label": "string",
      "details": "string — texture, tone, visible concerns"
    },
    "cheekbones": {
      "score": number,
      "label": "string",
      "details": "string — prominence, definition"
    },
    "chin": {
      "score": number,
      "label": "string",
      "details": "string — projection, shape"
    },
    "facial_hair_or_grooming": {
      "score": number,
      "label": "string",
      "details": "string — grooming, framing of the face"
    }
  },
  "strengths": ["string", "string", "string"],
  "improvement_areas": [
    {
      "area": "string",
      "suggestion": "string — non-surgical improvement tip"
    }
  ],
  "harmony_score": number (1.0-10.0),
  "masculinity_score": number (1.0-10.0),
  "social_perception": "string — how others likely perceive this person socially"
}

STRICT RULES:
- All scores must be between 1.0 and 10.0.
- Labels: <4 = "Needs Work", 4–6 = "Average", 6–7.5 = "Good", 7.5–8.5 = "Great", 8.5+ = "Exceptional"
- strengths must have exactly 3 items.
- improvement_areas must have at least 2 items with actionable non-surgical tips.
- Be honest and precise. Do not inflate scores.
- Return ONLY the JSON object.`;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body: { image: string; gender: string; ageRange: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { image, gender, ageRange } = body;
  if (!image || !gender || !ageRange) {
    return NextResponse.json(
      { error: "Missing required fields: image, gender, ageRange." },
      { status: 400 }
    );
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: image,
              },
            },
            {
              type: "text",
              text: buildPrompt(gender, ageRange),
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
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[face-analyse] error:", err);
    let message = "Analysis failed. Please try again.";
    if (err instanceof SyntaxError) {
      message = "AI returned an unexpected response. Please try again.";
    } else if (err instanceof Error) {
      if (err.message.includes("401") || err.message.includes("auth")) {
        message = "Invalid API key. Check ANTHROPIC_API_KEY.";
      } else if (
        err.message.includes("timeout") ||
        err.message.includes("ETIMEDOUT")
      ) {
        message = "Analysis took too long. Please try again.";
      }
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
