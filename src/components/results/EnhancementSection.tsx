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

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export default function EnhancementSection({ result, photos }: Props) {
  const { worstPhotoIds, photoScores } = result;
  const [states, setStates] = useState<Record<string, EnhanceState>>(
    Object.fromEntries(worstPhotoIds.map((id) => [id, { status: "idle" }]))
  );

  if (worstPhotoIds.length === 0) {
    return (
      <div className="bg-gray-800 rounded-2xl p-5 text-center text-gray-400 text-sm">
        Je foto&apos;s zijn al goed geoptimaliseerd voor AI-verbetering.
      </div>
    );
  }

  async function enhance(photoId: string) {
    const photo = photos.find((p) => p.id === photoId);
    if (!photo) return;
    setStates((s) => ({ ...s, [photoId]: { status: "loading" } }));

    try {
      // Real mode: send to Replicate via API (base64 in body)
      // Demo mode: photoId via query param only — no body, no size limit issue
      const enhanceUrl = IS_DEMO
        ? `/api/enhance?photoId=${encodeURIComponent(photoId)}`
        : "/api/enhance";

      const startRes = await fetch(enhanceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: IS_DEMO ? undefined : JSON.stringify({ photoId, base64: photo.base64, mimeType: photo.mimeType }),
      });
      if (!startRes.ok) {
        const err = await startRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to start enhancement");
      }
      const { predictionId } = await startRes.json();
      const originalScore = photoScores.find((p) => p.photoId === photoId);

      // Demo mode: resolve client-side, no polling needed
      if (predictionId?.startsWith("demo_")) {
        await new Promise((r) => setTimeout(r, 2500));
        setStates((s) => ({
          ...s,
          [photoId]: {
            status: "done",
            data: {
              photoId,
              originalBase64: photo.base64,
              enhancedUrl: photo.base64,
              newPhotoScore: {
                ...originalScore!,
                subtotal: Math.min(12, (originalScore?.subtotal ?? 6) + 2),
                lightingSkin: Math.min(2, (originalScore?.lightingSkin ?? 1) + 1),
                background: Math.min(1, (originalScore?.background ?? 0) + 1),
              },
              scoreDelta: 2,
            },
          },
        }));
        return;
      }

      const originalSubtotal = originalScore?.subtotal ?? 0;

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
        if (data.status === "failed") throw new Error(data.error ?? "Enhancement failed");
      }
      throw new Error("Enhancement timed out. Probeer opnieuw.");
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
        <h3 className="text-white font-semibold">AI Foto Verbetering</h3>
        <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">Beta</span>
      </div>
      <p className="text-sm text-gray-400">
        Deze foto&apos;s scoorden het laagst en komen in aanmerking voor AI-verbetering.
        De AI verbetert belichting, scherpte en huidkwaliteit zonder je gezicht te veranderen.
      </p>

      {worstPhotoIds.map((photoId) => {
        const photo = photos.find((p) => p.id === photoId)!;
        const state = states[photoId];
        const photoIndex = photos.findIndex((p) => p.id === photoId);

        return (
          <div key={photoId} className="bg-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">Foto {photoIndex + 1}</span>
              {state.status === "done" && (
                <span className="text-green-400 text-sm font-semibold flex items-center gap-1">
                  +{state.data.scoreDelta} pts
                  <Badge score={state.data.newPhotoScore.subtotal} max={12} size="sm" />
                </span>
              )}
            </div>

            {state.status === "idle" && (
              <div className="flex gap-3 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.base64} alt="Origineel" className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div>
                  <button
                    onClick={() => enhance(photoId)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                  >
                    Verbeter deze foto
                  </button>
                  <p className="text-xs text-gray-500 mt-1.5">
                    {IS_DEMO ? "Demo — ~3 seconden" : "Duurt ~30–60 seconden"}
                  </p>
                </div>
              </div>
            )}

            {state.status === "loading" && (
              <div className="flex items-center gap-3 text-gray-400 text-sm py-4">
                <Spinner />
                <span>
                  {IS_DEMO ? "Foto wordt verwerkt..." : "Foto wordt verbeterd... dit duurt ~30–60 seconden"}
                </span>
              </div>
            )}

            {state.status === "done" && (
              <div className="space-y-2">
                <BeforeAfterSlider beforeSrc={photo.base64} afterSrc={state.data.enhancedUrl} />
                <p className="text-xs text-gray-500 text-center">
                  Sleep de handle om voor en na te vergelijken
                  {IS_DEMO && <span className="text-amber-500/70"> (demo: zelfde foto)</span>}
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
              <div className="text-red-400 text-sm flex items-center gap-2">
                <span>{state.message}</span>
                <button
                  onClick={() => setStates((s) => ({ ...s, [photoId]: { status: "idle" } }))}
                  className="underline hover:text-red-300"
                >
                  Opnieuw
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
