"use client";

import { useEffect, useState } from "react";
import { ScoreSnapshot } from "@/types";

const STORAGE_KEY = "tinder_analyser_history";
const MAX_SNAPSHOTS = 10;

export function saveSnapshot(snapshot: ScoreSnapshot) {
  if (typeof window === "undefined") return;
  const existing: ScoreSnapshot[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  const updated = [snapshot, ...existing].slice(0, MAX_SNAPSHOTS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function loadSnapshots(): ScoreSnapshot[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
}

interface Props {
  currentScore: number;
}

export default function IterationTracker({ currentScore }: Props) {
  const [history, setHistory] = useState<ScoreSnapshot[]>([]);

  useEffect(() => {
    setHistory(loadSnapshots());
  }, []);

  if (history.length < 2) return null;

  const best = Math.max(...history.map((s) => s.totalScore));
  const first = history[history.length - 1];
  const totalGain = currentScore - first.totalScore;

  return (
    <div className="bg-gray-800 rounded-2xl p-5">
      <h3 className="text-white font-semibold mb-1">Voortgang</h3>
      <p className="text-xs text-gray-500 mb-4">
        Je profiel over de tijd — elke keer dat je analyseert wordt het opgeslagen.
      </p>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{currentScore}</p>
          <p className="text-xs text-gray-500">Nu</p>
        </div>
        <div className="bg-gray-700/50 rounded-xl p-3 text-center">
          <p className={`text-2xl font-bold ${totalGain >= 0 ? "text-green-400" : "text-rose-400"}`}>
            {totalGain >= 0 ? "+" : ""}{totalGain}
          </p>
          <p className="text-xs text-gray-500">Vs. begin</p>
        </div>
        <div className="bg-gray-700/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{best}</p>
          <p className="text-xs text-gray-500">Best ooit</p>
        </div>
      </div>

      {/* History list */}
      <div className="space-y-2">
        {history.map((snap, i) => {
          const isFirst = i === history.length - 1;
          const prev = history[i + 1];
          const delta = prev ? snap.totalScore - prev.totalScore : 0;
          const date = new Date(snap.date).toLocaleDateString("nl-NL", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
          });
          return (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                <span className="text-xs text-gray-400">{history.length - i}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm font-semibold">{snap.totalScore}/100</span>
                  {!isFirst && delta !== 0 && (
                    <span className={`text-xs font-medium ${delta > 0 ? "text-green-400" : "text-rose-400"}`}>
                      {delta > 0 ? "+" : ""}{delta}
                    </span>
                  )}
                  {i === 0 && (
                    <span className="text-xs text-rose-400 font-medium">Nieuwste</span>
                  )}
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${snap.totalScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{date} · {snap.photoCount} foto&apos;s</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
