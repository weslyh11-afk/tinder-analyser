"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const MAX = 1000;
      if (width > MAX) {
        height = Math.round((height * MAX) / width);
        width = MAX;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function stripDataUri(b64) {
  return b64.replace(/^data:[^;]+;base64,/, "");
}

function getScoreColor(score) {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-amber-500";
  return "text-red-400";
}

function getBarColor(score) {
  if (score >= 8) return "bg-green-400";
  if (score >= 6) return "bg-amber-500";
  return "bg-red-400";
}

function getRingColor(score) {
  if (score >= 8) return "#4ade80";
  if (score >= 6) return "#f59e0b";
  return "#f87171";
}

function getScoreLabel(score) {
  if (score >= 8.5) return "Exceptional";
  if (score >= 7.5) return "Great";
  if (score >= 6) return "Good";
  if (score >= 4) return "Average";
  return "Needs Work";
}

function formatCategoryName(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Circular Score Gauge ─────────────────────────────────────────────────────

function ScoreGauge({ score, size = 160, strokeWidth = 10, label }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 10) * circumference;
  const color = getRingColor(score);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: "stroke-dashoffset 1.2s ease-out, stroke 0.5s" }}
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-4xl font-bold text-white">{score.toFixed(1)}</span>
        <span className="text-xs text-zinc-400">{label || "/ 10"}</span>
      </div>
    </div>
  );
}

// ── Category Card (expanded with science + ideal + how to improve) ───────────

function CategoryCard({ name, score, label, details, science, ideal, howToImprove }) {
  const [barWidth, setBarWidth] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBarWidth((score / 10) * 100), 150);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-200">
          {formatCategoryName(name)}
        </span>
        <span className={`text-lg font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)}
        </span>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${getBarColor(score)}`}
          style={{
            width: `${barWidth}%`,
            transition: "width 0.7s ease-out",
          }}
        />
      </div>
      <span className="text-xs font-medium text-amber-500">{label}</span>
      <p className="text-xs text-zinc-400 leading-relaxed">{details}</p>

      {(science || ideal || howToImprove) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-[11px] text-amber-500/70 hover:text-amber-500 transition-colors text-left flex items-center gap-1"
        >
          <span className="transform transition-transform" style={{ display: "inline-block", transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>
            ▶
          </span>
          {expanded ? "Hide details" : "Science & how to improve"}
        </button>
      )}

      {expanded && (
        <div className="mt-1 space-y-2 border-t border-zinc-800 pt-2">
          {science && (
            <div>
              <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wider mb-0.5">Measurement</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{science}</p>
            </div>
          )}
          {ideal && (
            <div>
              <p className="text-[10px] font-medium text-green-400 uppercase tracking-wider mb-0.5">What a 10/10 looks like</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{ideal}</p>
            </div>
          )}
          {howToImprove && (
            <div>
              <p className="text-[10px] font-medium text-amber-400 uppercase tracking-wider mb-0.5">How to improve</p>
              <p className="text-[11px] text-zinc-300 leading-relaxed">{howToImprove}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function FaceAnalysisPage() {
  const [phase, setPhase] = useState("input"); // input | loading | results | error
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gender, setGender] = useState("Male");
  const [ageRange, setAgeRange] = useState("18-25");
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [glowUpUrl, setGlowUpUrl] = useState(null);
  const [glowUpLoading, setGlowUpLoading] = useState(false);
  const [glowUpError, setGlowUpError] = useState("");

  const handleFile = useCallback((file) => {
    if (!file) return;
    const valid = ["image/jpeg", "image/png", "image/webp"];
    if (!valid.includes(file.type)) {
      setErrorMsg("Only JPG, PNG, and WebP images are supported.");
      setPhase("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Image must be under 10 MB.");
      setPhase("error");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyse = async () => {
    if (!imageFile) return;
    setPhase("loading");

    try {
      const resized = await resizeImage(imageFile);
      const base64 = stripDataUri(resized);

      const res = await fetch("/api/face-analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, gender, ageRange }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResults(data);
      setPhase("results");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setPhase("error");
    }
  };

  const handleGlowUp = async () => {
    if (!imageFile || glowUpLoading) return;
    setGlowUpLoading(true);
    setGlowUpError("");

    try {
      const resized = await resizeImage(imageFile);
      const base64 = stripDataUri(resized);

      // Build improvement hints from analysis results
      const improvements = results?.improvement_areas
        ?.map((item) => item.area)
        .join(", ") || "";

      // Start the glow-up generation
      const startRes = await fetch("/api/face-glowup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, improvements }),
      });
      const startData = await startRes.json();
      if (!startRes.ok) throw new Error(startData.error || "Failed to start glow-up.");

      const predictionId = startData.predictionId;

      // Poll for result
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max
      while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 2000));
        const pollRes = await fetch(`/api/face-glowup?predictionId=${predictionId}`);
        const pollData = await pollRes.json();

        if (pollData.status === "succeeded" && pollData.url) {
          setGlowUpUrl(pollData.url);
          setGlowUpLoading(false);
          return;
        }
        if (pollData.status === "failed") {
          throw new Error(pollData.error || "Glow-up generation failed.");
        }
        attempts++;
      }
      throw new Error("Glow-up took too long. Please try again.");
    } catch (err) {
      setGlowUpError(err.message || "Something went wrong.");
      setGlowUpLoading(false);
    }
  };

  const handleReset = () => {
    setPhase("input");
    setImageFile(null);
    setImagePreview(null);
    setResults(null);
    setErrorMsg("");
    setGlowUpUrl(null);
    setGlowUpLoading(false);
    setGlowUpError("");
  };

  // ── Landing / Input ──────────────────────────────────────────────────────

  if (phase === "input") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center px-4 py-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center">
          Face Analyst <span className="text-amber-500">AI</span>
        </h1>
        <p className="mt-3 text-zinc-400 text-center max-w-md">
          Upload a clear, front-facing photo and get a detailed aesthetic
          breakdown powered by AI.
        </p>

        {/* Upload zone */}
        <label
          className={`mt-10 w-full max-w-md aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${
            dragOver
              ? "border-amber-500 bg-amber-500/10"
              : imagePreview
              ? "border-zinc-700 bg-zinc-900"
              : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover rounded-2xl pointer-events-none"
            />
          ) : (
            <>
              <svg
                className="w-12 h-12 text-zinc-500 mb-3 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16v-8m0 0l-3 3m3-3l3 3M6.75 20.25h10.5A2.25 2.25 0 0019.5 18V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v12a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <p className="text-sm text-zinc-400 pointer-events-none">
                Drag & drop or <span className="text-amber-500 font-medium">click to upload</span>
              </p>
              <p className="text-xs text-zinc-600 mt-1 pointer-events-none">JPG, PNG, or WebP</p>
            </>
          )}
        </label>

        {imagePreview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setImageFile(null);
              setImagePreview(null);
            }}
            className="mt-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Remove photo
          </button>
        )}

        {/* Options */}
        <div className="mt-8 w-full max-w-md space-y-5">
          {/* Gender */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Gender
            </label>
            <div className="flex gap-2">
              {["Male", "Female"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    gender === g
                      ? "bg-amber-500 text-black"
                      : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Age Range
            </label>
            <select
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="18-25">18 – 25</option>
              <option value="26-35">26 – 35</option>
              <option value="36-45">36 – 45</option>
              <option value="46+">46+</option>
            </select>
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyse}
          disabled={!imageFile}
          className={`mt-8 w-full max-w-md py-3.5 rounded-xl text-sm font-semibold transition-all ${
            imageFile
              ? "bg-amber-500 text-black hover:bg-amber-400 active:scale-[0.98]"
              : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
          }`}
        >
          Analyze My Face
        </button>

        <p className="mt-6 text-[11px] text-zinc-600 text-center max-w-sm">
          Your photo is processed in memory and never stored. This tool is for
          personal use and entertainment only.
        </p>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-zinc-800" />
          <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin" />
        </div>
        <p className="text-lg font-medium text-zinc-200">
          Analyzing your facial structure...
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          This usually takes 10–20 seconds
        </p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (phase === "error") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4">
        <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Analysis Failed</h2>
          <p className="text-sm text-zinc-400 mb-6">{errorMsg}</p>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Start Over
            </button>
            <button
              onClick={handleAnalyse}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-amber-500 text-black hover:bg-amber-400 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────

  if (phase === "results" && results) {
    const cats = results.categories || {};
    const categoryKeys = Object.keys(cats);

    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white px-4 py-10">
        <div className="max-w-3xl mx-auto">
          {/* Header: photo + overall score */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Your face"
                className="w-28 h-28 rounded-2xl object-cover border-2 border-zinc-800"
              />
            )}
            <div className="relative flex items-center justify-center">
              <ScoreGauge score={results.overall_score} label="Overall" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold">Your Analysis</h2>
              <p className="text-sm text-zinc-400 mt-1">
                {getScoreLabel(results.overall_score)} —{" "}
                {results.overall_score.toFixed(1)} / 10
              </p>
            </div>
          </div>

          {/* Summary */}
          {results.summary && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {results.summary}
              </p>
            </div>
          )}

          {/* First Impression */}
          {results.first_impression && (
            <div className="bg-zinc-900 border border-amber-500/20 rounded-xl p-5 mb-6">
              <h3 className="text-xs font-medium text-amber-500 uppercase tracking-wider mb-2">
                First Impression
              </h3>
              <p className="text-sm text-zinc-200 italic leading-relaxed">
                &ldquo;{results.first_impression}&rdquo;
              </p>
            </div>
          )}

          {/* Category Cards Grid */}
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
            Detailed Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {categoryKeys.map((key) => (
              <CategoryCard
                key={key}
                name={key}
                score={cats[key].score}
                label={cats[key].label}
                details={cats[key].details}
                science={cats[key].science}
                ideal={cats[key].ideal}
                howToImprove={cats[key].how_to_improve}
              />
            ))}
          </div>

          {/* Strengths */}
          {results.strengths && results.strengths.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
              <h3 className="text-xs font-medium text-green-400 uppercase tracking-wider mb-3">
                Strengths
              </h3>
              <ul className="space-y-2">
                {results.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <svg
                      className="w-4 h-4 text-green-400 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvement Areas (enhanced with current→target, priority, timeframe) */}
          {results.improvement_areas && results.improvement_areas.length > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
              <h3 className="text-xs font-medium text-amber-500 uppercase tracking-wider mb-4">
                Your Glow-Up Plan
              </h3>
              <ul className="space-y-5">
                {results.improvement_areas.map((item, i) => (
                  <li key={i} className="border-l-2 border-amber-500/30 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-zinc-200">
                        {item.area}
                      </p>
                      {item.priority && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          item.priority === "high" ? "bg-red-500/20 text-red-400" :
                          item.priority === "medium" ? "bg-amber-500/20 text-amber-400" :
                          "bg-zinc-700 text-zinc-400"
                        }`}>
                          {item.priority}
                        </span>
                      )}
                    </div>
                    {item.current && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-red-400 font-medium uppercase">Now:</span>
                        <span className="text-[11px] text-zinc-400">{item.current}</span>
                      </div>
                    )}
                    {item.target && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-green-400 font-medium uppercase">Goal:</span>
                        <span className="text-[11px] text-zinc-400">{item.target}</span>
                      </div>
                    )}
                    <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                      {item.suggestion}
                    </p>
                    {item.timeframe && (
                      <p className="text-[11px] text-zinc-500 mt-1">
                        ⏱ {item.timeframe}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What a 10/10 looks like */}
          {results.what_a_10_looks_like && (
            <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-5 mb-6">
              <h3 className="text-xs font-medium text-amber-500 uppercase tracking-wider mb-2">
                What Would Make You a 10/10
              </h3>
              <p className="text-sm text-zinc-200 leading-relaxed">
                {results.what_a_10_looks_like}
              </p>
            </div>
          )}

          {/* Bottom scores: Harmony + Masculinity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {results.harmony_score != null && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <ScoreGauge
                    score={results.harmony_score}
                    size={90}
                    strokeWidth={7}
                    label="Harmony"
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">
                    Facial Harmony
                  </p>
                  <p className={`text-xl font-bold ${getScoreColor(results.harmony_score)}`}>
                    {results.harmony_score.toFixed(1)}
                  </p>
                </div>
              </div>
            )}
            {results.masculinity_score != null && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <ScoreGauge
                    score={results.masculinity_score}
                    size={90}
                    strokeWidth={7}
                    label={gender === "Female" ? "Femininity" : "Masculinity"}
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">
                    {gender === "Female" ? "Femininity" : "Masculinity"}
                  </p>
                  <p className={`text-xl font-bold ${getScoreColor(results.masculinity_score)}`}>
                    {results.masculinity_score.toFixed(1)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Social Perception */}
          {results.social_perception && (
            <div className="bg-zinc-900 border-l-4 border-amber-500 rounded-r-xl p-5 mb-8">
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                Social Perception
              </h3>
              <p className="text-sm text-zinc-200 italic leading-relaxed">
                &ldquo;{results.social_perception}&rdquo;
              </p>
            </div>
          )}

          {/* Glow-Up Section */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
            <h3 className="text-xs font-medium text-amber-500 uppercase tracking-wider mb-3">
              AI Glow-Up Preview
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              See an AI-enhanced version of your face with improved lighting, skin clarity, and definition.
              Your identity stays the same — only subtle enhancements are applied.
            </p>

            {!glowUpUrl && !glowUpLoading && (
              <button
                onClick={handleGlowUp}
                className="w-full py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] transition-all"
              >
                Generate My Glow-Up
              </button>
            )}

            {glowUpLoading && (
              <div className="flex items-center justify-center gap-3 py-6">
                <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-amber-500 animate-spin" />
                <span className="text-sm text-zinc-400">Generating your glow-up... (30-60 seconds)</span>
              </div>
            )}

            {glowUpError && (
              <div className="mt-3">
                <p className="text-xs text-red-400 mb-2">{glowUpError}</p>
                <button
                  onClick={handleGlowUp}
                  className="text-xs text-amber-500 hover:text-amber-400 font-medium"
                >
                  Try again
                </button>
              </div>
            )}

            {glowUpUrl && (
              <div className="mt-2">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Before */}
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Before</p>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Before"
                        className="w-full max-w-[240px] mx-auto rounded-xl border border-zinc-800"
                      />
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="text-2xl text-amber-500 hidden sm:block">→</div>
                  <div className="text-2xl text-amber-500 sm:hidden rotate-90">→</div>

                  {/* After */}
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-green-400 uppercase tracking-wider mb-2">Glow-Up</p>
                    <img
                      src={glowUpUrl}
                      alt="Glow-up preview"
                      className="w-full max-w-[240px] mx-auto rounded-xl border border-green-500/30"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-600 text-center mt-3">
                  AI-enhanced preview — actual results from skincare, grooming, and lifestyle changes will look different.
                </p>
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-amber-500 text-black hover:bg-amber-400 active:scale-[0.98] transition-all"
          >
            Analyze Another Face
          </button>

          <p className="mt-6 text-[11px] text-zinc-600 text-center">
            Results are AI-generated estimates for entertainment purposes only.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
