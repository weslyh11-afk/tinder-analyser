import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { stripDataUri } from "@/lib/imageUtils";

export const maxDuration = 120;

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// philz1337x/clarity-upscaler — sharpen + enhance while keeping identity
const MODEL_VERSION =
  "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e";

export async function POST(req: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN is not configured. Add it to your .env file." },
      { status: 500 }
    );
  }

  let body: { image: string; improvements: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { image, improvements } = body;
  if (!image) {
    return NextResponse.json(
      { error: "Missing required field: image." },
      { status: 400 }
    );
  }

  // Build an enhancement prompt from the analysis improvements
  const basePrompt =
    "professional portrait photo, perfect lighting, flawless clear skin, symmetrical face, sharp jawline, defined cheekbones, bright healthy eyes, even skin tone, no blemishes, no dark circles, perfect grooming, studio lighting, high definition, photorealistic";
  const negativePrompt =
    "blur, noise, bad lighting, oversaturated, distorted face, asymmetric, blemishes, acne, dark circles, wrinkles, uneven skin, low quality";

  try {
    // Start the prediction
    const prediction = await replicate.predictions.create({
      version: MODEL_VERSION,
      input: {
        image: `data:image/jpeg;base64,${stripDataUri(image)}`,
        scale_factor: 2,
        sharpen: 12,
        resemblance: 0.65, // moderate — keeps identity but allows more beautification
        creativity: 0.35,  // higher creativity for visible glow-up changes
        prompt: improvements
          ? `${basePrompt}, ${improvements}`
          : basePrompt,
        negative_prompt: negativePrompt,
        num_inference_steps: 25,
        output_format: "webp",
        output_quality: 95,
      },
    });

    return NextResponse.json({ predictionId: prediction.id });
  } catch (err) {
    console.error("[face-glowup] start error:", err);
    return NextResponse.json(
      { error: "Failed to start glow-up generation. Please try again." },
      { status: 502 }
    );
  }
}

// Poll for result
export async function GET(req: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "REPLICATE_API_TOKEN is not configured." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const predictionId = searchParams.get("predictionId");

  if (!predictionId) {
    return NextResponse.json(
      { error: "predictionId is required." },
      { status: 400 }
    );
  }

  try {
    const prediction = await replicate.predictions.get(predictionId);

    if (prediction.status === "failed" || prediction.status === "canceled") {
      return NextResponse.json({
        status: "failed",
        error: (prediction.error as string) || "Generation failed.",
      });
    }

    if (prediction.status !== "succeeded" || !prediction.output) {
      return NextResponse.json({ status: "processing" });
    }

    const outputUrl = Array.isArray(prediction.output)
      ? prediction.output[0]
      : prediction.output;

    return NextResponse.json({ status: "succeeded", url: outputUrl });
  } catch (err) {
    console.error("[face-glowup] status error:", err);
    return NextResponse.json(
      { status: "failed", error: "Status check failed." }
    );
  }
}
