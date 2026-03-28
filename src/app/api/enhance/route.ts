import { NextRequest, NextResponse } from "next/server";
import { startEnhancement } from "@/lib/replicate";

const DEMO_MODE = process.env.DEMO_MODE === "true";

export async function POST(req: NextRequest) {
  let body: { photoId: string; base64: string; mimeType: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { photoId, base64, mimeType } = body;
  if (!photoId || !base64 || !mimeType) {
    return NextResponse.json(
      { error: "photoId, base64, and mimeType are required." },
      { status: 400 }
    );
  }

  if (DEMO_MODE) {
    // Return the original photo id as the fake predictionId so the status endpoint
    // can pass back the original base64 as the "enhanced" image.
    return NextResponse.json({ predictionId: `demo_${photoId}`, base64 });
  }

  try {
    const predictionId = await startEnhancement(base64, mimeType);
    return NextResponse.json({ predictionId });
  } catch (err) {
    console.error("[enhance] error:", err);
    return NextResponse.json(
      { error: "Failed to start enhancement. Please try again." },
      { status: 502 }
    );
  }
}
