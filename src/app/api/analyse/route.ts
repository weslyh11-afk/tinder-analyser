import { NextRequest, NextResponse } from "next/server";
import { analyseProfile } from "@/lib/claude";
import { computeAnalysisResult } from "@/lib/scoring";
import { getMockAnalysisResult } from "@/lib/mockData";
import { ProfileInput } from "@/types";

// Extend Vercel function timeout to 60s — Claude with 6 photos needs 15-30s
export const maxDuration = 60;

const DEMO_MODE = process.env.DEMO_MODE === "true";

export async function POST(req: NextRequest) {
  // In demo mode, skip body parsing entirely to avoid size limits
  if (DEMO_MODE) {
    let photoIds: string[] = [];
    try {
      const body = await req.json();
      photoIds = (body.photos ?? []).map((p: { id: string }) => p.id);
    } catch {
      // ignore — demo doesn't need the body
    }
    await new Promise((r) => setTimeout(r, 1500));
    return NextResponse.json(getMockAnalysisResult(photoIds));
  }

  let body: ProfileInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { photos, bio, age, job, interests, height, education, relationshipGoal } = body;

  if (!photos || photos.length === 0) {
    return NextResponse.json(
      { error: "At least one photo is required." },
      { status: 400 }
    );
  }
  if (photos.length > 6) {
    return NextResponse.json(
      { error: "Maximum 6 photos allowed." },
      { status: 400 }
    );
  }
  for (const p of photos) {
    if (!p.id || !p.base64 || !p.mimeType) {
      return NextResponse.json(
        { error: "Each photo must have id, base64, and mimeType." },
        { status: 400 }
      );
    }
  }

  try {
    const profileInput = { photos, bio, age, job, interests, height, education, relationshipGoal };
    const claudeResponse = await analyseProfile(profileInput);
    const result = computeAnalysisResult(claudeResponse, profileInput);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyse] error:", err);
    const message = err instanceof SyntaxError
      ? "AI returned an unexpected response. Please try again."
      : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
