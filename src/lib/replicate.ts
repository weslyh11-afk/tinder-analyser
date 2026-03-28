import Replicate from "replicate";
import { stripDataUri } from "./imageUtils";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

// philz1337x/clarity-upscaler: sharpens + improves skin/lighting without changing identity
const MODEL_VERSION =
  "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e";

export async function startEnhancement(
  base64: string,
  mimeType: string
): Promise<string> {
  const prediction = await replicate.predictions.create({
    version: MODEL_VERSION,
    input: {
      image: `data:${mimeType};base64,${stripDataUri(base64)}`,
      scale_factor: 2,
      sharpen: 10,
      resemblance: 0.9,  // high = face stays the same
      creativity: 0.15,  // low = subtle improvement only
      prompt: "sharp focus, good lighting, natural skin, professional portrait photo",
      negative_prompt: "blur, noise, bad lighting, oversaturated, distorted face",
      num_inference_steps: 18,
      output_format: "webp",
      output_quality: 90,
    },
  });
  return prediction.id;
}

export async function getPredictionStatus(predictionId: string): Promise<{
  status: string;
  output?: string;
  error?: string;
}> {
  const prediction = await replicate.predictions.get(predictionId);
  return {
    status: prediction.status,
    output: Array.isArray(prediction.output)
      ? prediction.output[0]
      : (prediction.output as string | undefined),
    error: prediction.error as string | undefined,
  };
}
