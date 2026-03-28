"use client";

import { useState } from "react";
import { VibeAnalysis } from "@/types";

interface Props {
  vibe: VibeAnalysis;
}

export default function VibeCard({ vibe }: Props) {
  const [showSignals, setShowSignals] = useState(false);

  const scoreColor =
    vibe.vibeScore >= 8 ? "text-green-400" :
    vibe.vibeScore >= 6 ? "text-amber-400" :
    "text-rose-400";

  const scoreBg =
    vibe.vibeScore >= 8 ? "bg-green-500/10 border-green-500/30" :
    vibe.vibeScore >= 6 ? "bg-amber-500/10 border-amber-500/30" :
    "bg-rose-500/10 border-rose-500/30";

  return (
    <div className="bg-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Vibe Check</h3>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${scoreBg}`}>
            <span className="text-xl">{vibe.vibeEmoji}</span>
            <span className={`font-bold text-sm ${scoreColor}`}>{vibe.vibeLabel}</span>
            <span className={`text-xs ${scoreColor}`}>{vibe.vibeScore}/10</span>
          </div>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed">{vibe.vibeDescription}</p>
      </div>

      {/* Conversation hooks */}
      {vibe.conversationHooks.length > 0 && (
        <div className="border-t border-gray-700 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            💬 Gespreksstarters in jouw profiel
          </p>
          <div className="space-y-2">
            {vibe.conversationHooks.map((hook, i) => (
              <div key={i} className="bg-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-gray-200">
                {hook}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Dit zijn elementen in je profiel die potentiële matches iets concreets geven om over te beginnen.
          </p>
        </div>
      )}

      {/* Unintended signals — collapsible, honest */}
      <div className="border-t border-gray-700">
        <button
          onClick={() => setShowSignals(!showSignals)}
          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-700/30 transition-colors"
        >
          <span className="text-sm font-medium text-amber-400">
            ⚠️ Wat communiceer je onbedoeld? ({vibe.unintendedSignals.length})
          </span>
          <span className="text-gray-500 text-xs">{showSignals ? "▲ Verbergen" : "▼ Tonen"}</span>
        </button>
        {showSignals && (
          <div className="px-5 pb-4 space-y-2">
            <p className="text-xs text-gray-500 mb-3">
              Dit zijn signalen die je profiel afgeeft die je waarschijnlijk <em>niet</em> wil afgeven.
              Eerlijke feedback — zoals een goede vriend zou geven.
            </p>
            {vibe.unintendedSignals.map((signal, i) => (
              <div key={i} className="flex gap-2 text-sm text-gray-300">
                <span className="text-amber-400 shrink-0 mt-0.5">•</span>
                <span>{signal}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
