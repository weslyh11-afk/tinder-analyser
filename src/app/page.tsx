"use client";

import { useReducer, useState } from "react";
import { AnalysisResult, PhotoFile } from "@/types";
import PhotoUploadGrid from "@/components/upload/PhotoUploadGrid";
import ProfileForm from "@/components/form/ProfileForm";
import ResultsPanel from "@/components/results/ResultsPanel";
import Spinner from "@/components/ui/Spinner";
import ErrorBanner from "@/components/ui/ErrorBanner";

// ---------- State machine ----------
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
    case "SUBMIT":
      return { phase: "analysing" };
    case "SUCCESS":
      return { phase: "results", result: action.result, photos: action.photos };
    case "ERROR":
      return { phase: "error", message: action.message };
    case "RESET":
      return { phase: "input" };
  }
}

// ---------- Component ----------
export default function Home() {
  const [state, dispatch] = useReducer(reducer, { phase: "input" });
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [job, setJob] = useState("");
  const [interests, setInterests] = useState("");

  function handleFormChange(field: string, value: string) {
    if (field === "bio") setBio(value);
    if (field === "age") setAge(value);
    if (field === "job") setJob(value);
    if (field === "interests") setInterests(value);
  }

  async function handleSubmit() {
    if (photos.length === 0) {
      dispatch({ type: "ERROR", message: "Please upload at least one photo." });
      return;
    }

    dispatch({ type: "SUBMIT" });

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photos,
          bio,
          age: age ? Number(age) : undefined,
          job: job || undefined,
          interests: interests || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch({ type: "ERROR", message: data.error ?? "Analysis failed." });
        return;
      }

      dispatch({ type: "SUCCESS", result: data, photos });
    } catch {
      dispatch({
        type: "ERROR",
        message: "Network error. Please check your connection and try again.",
      });
    }
  }

  function handleReset() {
    dispatch({ type: "RESET" });
    setPhotos([]);
    setBio("");
    setAge("");
    setJob("");
    setInterests("");
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Tinder Profile Analyser
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Upload your photos and bio. Our AI analyses your profile using
            evidence-based research and gives you an honest score with
            actionable advice.
          </p>
        </div>

        {/* Error banner */}
        {state.phase === "error" && (
          <div className="mb-6">
            <ErrorBanner
              message={state.message}
              onDismiss={() => dispatch({ type: "RESET" })}
            />
          </div>
        )}

        {/* Input form */}
        {(state.phase === "input" || state.phase === "error") && (
          <div className="space-y-6">
            <section className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Photos</h2>
              <PhotoUploadGrid photos={photos} onChange={setPhotos} />
            </section>

            <section className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-4">Profile info</h2>
              <ProfileForm
                bio={bio}
                age={age}
                job={job}
                interests={interests}
                onChange={handleFormChange}
              />
            </section>

            <button
              onClick={handleSubmit}
              disabled={photos.length === 0}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl text-base transition-colors"
            >
              Analyse my profile
            </button>

            <p className="text-center text-xs text-gray-500">
              Your photos are analysed by AI and never stored.
            </p>
          </div>
        )}

        {/* Loading */}
        {state.phase === "analysing" && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-gray-400">
            <Spinner size={40} />
            <p className="text-sm">Analysing your profile...</p>
            <p className="text-xs text-gray-600">This takes about 10–15 seconds</p>
          </div>
        )}

        {/* Results */}
        {state.phase === "results" && (
          <ResultsPanel
            result={state.result}
            photos={state.photos}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  );
}
