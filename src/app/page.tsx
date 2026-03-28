"use client";

import { useReducer, useState } from "react";
import { AnalysisResult, PhotoFile } from "@/types";
import { saveSnapshot } from "@/components/results/IterationTracker";
import PhotoUploadGrid from "@/components/upload/PhotoUploadGrid";
import ProfileForm from "@/components/form/ProfileForm";
import { compressForApi } from "@/lib/imageUtils";
import ResultsPanel from "@/components/results/ResultsPanel";
import Spinner from "@/components/ui/Spinner";
import ErrorBanner from "@/components/ui/ErrorBanner";

type AppState =
  | { phase: "input" }
  | { phase: "analysing" }
  | { phase: "results"; result: AnalysisResult; photos: PhotoFile[] }
  | { phase: "error"; message: string };

type Action =
  | { type: "SUBMIT" }
  | { type: "SUCCESS"; result: AnalysisResult; photos: PhotoFile[] }
  | { type: "ERROR"; message: string }
  | { type: "RESET" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SUBMIT":      return { phase: "analysing" };
    case "SUCCESS":     return { phase: "results", result: action.result, photos: action.photos };
    case "ERROR":       return { phase: "error", message: action.message };
    case "RESET":       return { phase: "input" };
  }
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, { phase: "input" });
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [bio, setBio] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [job, setJob] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [height, setHeight] = useState("");
  const [education, setEducation] = useState("");
  const [relationshipGoal, setRelationshipGoal] = useState("");

  function handleFormChange(field: string, value: string | number | string[] | null) {
    if (field === "bio")              setBio(value as string);
    if (field === "age")              setAge(value as number | null);
    if (field === "job")              setJob(value as string);
    if (field === "interests")        setInterests(value as string[]);
    if (field === "height")           setHeight(value as string);
    if (field === "education")        setEducation(value as string);
    if (field === "relationshipGoal") setRelationshipGoal(value as string);
  }

  async function handleSubmit() {
    if (photos.length === 0) {
      dispatch({ type: "ERROR", message: "Upload minimaal één foto." });
      return;
    }
    dispatch({ type: "SUBMIT" });
    try {
      // Compress photos to ~800px/0.7 quality before sending to avoid Vercel's 4.5MB body limit
      const photosForApi = await Promise.all(
        photos.map(async (p) => ({
          ...p,
          base64: await compressForApi(p.base64, p.mimeType),
          mimeType: "image/jpeg" as const,
        }))
      );

      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos: photosForApi,
          bio,
          age: age ?? undefined,
          job: job || undefined,
          interests: interests.length > 0 ? interests.join(", ") : undefined,
          height: height ? Number(height) : undefined,
          education: education || undefined,
          relationshipGoal: relationshipGoal || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch({ type: "ERROR", message: data.error ?? "Analyse mislukt." });
        return;
      }
      // Save to localStorage for iteration tracker
      saveSnapshot({
        date: new Date().toISOString(),
        totalScore: data.totalScore,
        photosTotalPts: data.photosTotalPts,
        bioSubtotal: data.bioScore.subtotal,
        photoCount: photos.length,
      });
      dispatch({ type: "SUCCESS", result: data, photos });
    } catch {
      dispatch({ type: "ERROR", message: "Netwerkfout. Controleer je verbinding en probeer opnieuw." });
    }
  }

  function handleReset() {
    dispatch({ type: "RESET" });
    setPhotos([]);
    setBio("");
    setAge(null);
    setJob("");
    setInterests([]);
    setHeight("");
    setEducation("");
    setRelationshipGoal("");
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Tinder Profile Analyser</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Upload je foto&apos;s en bio. Onze AI analyseert je profiel op basis van wetenschappelijk onderzoek
            en geeft je een eerlijke score met concrete verbeterpunten.
          </p>
        </div>

        {state.phase === "error" && (
          <div className="mb-6">
            <ErrorBanner message={state.message} onDismiss={() => dispatch({ type: "RESET" })} />
          </div>
        )}

        {(state.phase === "input" || state.phase === "error") && (
          <div className="space-y-6">
            <section className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Foto&apos;s</h2>
              <PhotoUploadGrid photos={photos} onChange={setPhotos} />
            </section>

            <section className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Profielinfo</h2>
              <ProfileForm
                bio={bio}
                age={age}
                job={job}
                interests={interests}
                height={height}
                education={education}
                relationshipGoal={relationshipGoal}
                onChange={handleFormChange}
              />
            </section>

            <button
              onClick={handleSubmit}
              disabled={photos.length === 0}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl text-base transition-colors"
            >
              Analyseer mijn profiel
            </button>
            <p className="text-center text-xs text-gray-500">
              Je foto&apos;s worden geanalyseerd door AI en nooit opgeslagen.
            </p>
          </div>
        )}

        {state.phase === "analysing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-gray-400">
            <Spinner size={40} />
            <p className="text-sm">Je profiel wordt geanalyseerd...</p>
            <p className="text-xs text-gray-600">Dit duurt ongeveer 10–15 seconden</p>
          </div>
        )}

        {state.phase === "results" && (
          <ResultsPanel result={state.result} photos={state.photos} onReset={handleReset} />
        )}
      </div>
    </main>
  );
}
