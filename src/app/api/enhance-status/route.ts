import { NextRequest, NextResponse } from "next/server";
import { getPredictionStatus } from "@/lib/replicate";
import { rescorePhoto } from "@/lib/claude";
import { EnhancementResult } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const predictionId = searchParams.get("predictionId");
  const photoId = searchParams.get("photoId");
  const originalSubtotal = Number(searchParams.get("originalSubtotal") ?? "0");

  if (!predictionId || !photoId) {
    return NextResponse.json(
      { error: "predictionId and photoId are required." },
      { status: 400 }
    );
  }

  try {
    const prediction = await getPredictionStatus(predictionId);

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return NextResponse.json({ status: "failed", error: prediction.error });
    }

    if (prediction.status !== "succeeded" || !prediction.output) {
      return NextResponse.json({ status: "processing" });
    }

    const enhancedUrl = prediction.output;
    const newPhotoScore = await rescorePhoto(photoId, enhancedUrl);
    const scoreDelta = newPhotoScore.subtotal - originalSubtotal;

    const result: EnhancementResult = {
      photoId,
      originalBase64: "", // not needed on client, original already in state
      enhancedUrl,
      newPhotoScore,
      scoreDelta,
    };

    return NextResponse.json({ status: "succeeded", result });
  } catch (err) {
    console.error("[enhance-status] error:", err);
    return NextResponse.json(
      { status: "failed", error: "Status check failed." }
    );
  }
}
