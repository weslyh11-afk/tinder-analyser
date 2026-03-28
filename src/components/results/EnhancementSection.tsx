"use client";

import { useState } from "react";
import { AnalysisResult, EnhancementResult, PhotoFile } from "@/types";
import BeforeAfterSlider from "@/components/comparison/BeforeAfterSlider";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";

interface Props {
  result: AnalysisResult;
  photos: PhotoFile[];
}

type EnhanceState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; data: EnhancementResult }
  | { status: "error"; message: string };

export default function EnhancementSection({ result, photos }: Props) {
  const { worstPhotoIds, photoScores } = result;
  const [states, setStates] = useState<Record<string, EnhanceState>>(
    Object.fromEntries(worstPhotoIds.map((id) => [id, { status: "idle" }]))
  );

  if (worstPhotoIds.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl p-5 text-center text-gray-400 text-sm">
        Your photos are already well-optimised for AI enhancement.
      </div>
    );
  }

  async function enhance(photoId: string) {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;

    setStates((s) => ({ ...s, [photoId]: { status: "loading" } }));

    try {
      const startRes = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, base64: photo.base64, mimeType: photo.mimeType }),
      });
      if (!startRes.ok) throw new Error("Failed to start enhancement");
      const startData = await startRes.json();
      const { predictionId } = startData;

      // Demo mode: predictionId starts with "demo_", result is immediate
      if (predictionId?.startsWith("demo_")) {
        await new Promise((r) => setTimeout(r, 2000));
        const originalScore = photoScores.find((p) => p.photoId === photoId);
        setStates((s) => ({
          ...s,
          [photoId]: {
            status: "done",
            data: {
              photoId,
              originalBase64: photo.base64,
              enhancedUrl: photo.base64, // same image in demo
              newPhotoScore: { ...originalScore!, subtotal: Math.min(12, (originalScore?.subtotal ?? 6) + 2) },
              scoreDelta: 2,
            },
          },
        }));
        return;
      }

      const originalScore = photoScores.find((p) => p.photoId === photoId);
      const originalSubtotal = originalScore?.subtotal ?? 0;

      // Poll every 3s
      for (let attempt = 0; attempt < 30; attempt++) {
        await new Promise((r) => setTimeout(r, 3000));
        const statusRes = await fetch(
          `/api/enhance-status?predictionId=${predictionId}&photoId=${photoId}&originalSubtotal=${originalSubtotal}`
        );
        const data = await statusRes.json();

        if (data.status === "succeeded") {
          setStates((s) => ({ ...s, [photoId]: { status: "done", data: data.result } }));
          return;
        }
        if (data.status === "failed") {
          throw new Error(data.error ?? "Enhancement failed");
        }
      }
      throw new Error("Enhancement timed out. Please try again.");
    } catch (err) {
      setStates((s) => ({
        ...s,
        [photoId]: { status: "error", message: (err as Error).message },
      }));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-white font-semibold">AI Photo Enhancement</h3>
        <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
          Beta
        </span>
      </div>
      <p className="text-sm text-gray-400">
        These photos scored lowest and are candidates for AI improvement. The
        enhancer improves lighting, sharpness, and skin quality without changing
        your face.
      </p>

      {worstPhotoIds.map((photoId) => {
        const photo = photos.find((p) => p.id === photoId)!;
        const state = states[photoId];
        const photoIndex = photos.findIndex((p) => p.id === photoId);

        return (
          <div key={photoId} className="bg-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">
                Photo {photoIndex + 1}
              </span>
              {state.status === "done" && (
                <span className="text-green-400 text-sm font-semibold">
                  +{state.data.scoreDelta} pts
                  <Badge score={state.data.newPhotoScore.subtotal} max={12} size="sm" />
                </span>
              )}
            </div>

            {state.status === "idle" && (
              <div className="flex gap-3 items-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.base64}
                  alt="Original"
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <button
                    onClick={() => enhance(photoId)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                  >
                    Enhance this photo
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Takes ~30–60 seconds
                  </p>
                </div>
              </div>
            )}

            {state.status === "loading" && (
              <div className="flex items-center gap-3 text-gray-400 text-sm py-4">
                <Spinner />
                <span>Enhancing photo... this takes about 30–60 seconds</span>
              </div>
            )}

            {state.status === "done" && (
              <div className="space-y-2">
                <BeforeAfterSlider
                  beforeSrc={photo.base64}
                  afterSrc={state.data.enhancedUrl}
                />
                <p className="text-xs text-gray-500 text-center">
                  Drag the handle to compare before and after
                </p>
                {state.data.newPhotoScore.feedback.map((tip, i) => (
                  <p key={i} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-green-400 shrink-0">✓</span>
                    {tip}
                  </p>
                ))}
              </div>
            )}

            {state.status === "error" && (
              <div className="text-red-400 text-sm">
                {state.message}
                <button
                  onClick={() => setStates((s) => ({ ...s, [photoId]: { status: "idle" } }))}
                  className="ml-2 underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
