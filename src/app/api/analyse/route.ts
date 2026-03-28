import { NextRequest, NextResponse } from "next/server";
import { analyseProfile } from "@/lib/claude";
import { computeAnalysisResult } from "@/lib/scoring";
import { getMockAnalysisResult } from "@/lib/mockData";
import { ProfileInput } from "@/types";

const DEMO_MODE = process.env.DEMO_MODE === "true";

export async function POST(req: NextRequest) {
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
    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 1500)); // simulate delay
      return NextResponse.json(getMockAnalysisResult(photos.map((p) => p.id)));
    }
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
