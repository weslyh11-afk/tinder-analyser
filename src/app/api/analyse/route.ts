import { NextRequest, NextResponse } from "next/server";
import { analyseProfile } from "@/lib/claude";
import { computeAnalysisResult } from "@/lib/scoring";
import { ProfileInput } from "@/types";

export async function POST(req: NextRequest) {
  let body: ProfileInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { photos, bio, age, job, interests } = body;

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
    const claudeResponse = await analyseProfile({ photos, bio, age, job, interests });
    const result = computeAnalysisResult(claudeResponse, { photos, bio, age, job, interests });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[analyse] error:", err);
    const message = err instanceof SyntaxError
      ? "AI returned an unexpected response. Please try again."
      : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
