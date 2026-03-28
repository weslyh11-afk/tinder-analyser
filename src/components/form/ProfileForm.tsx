"use client";

import AgePicker from "./AgePicker";
import InterestSelector from "./InterestSelector";

const EDUCATION_OPTIONS = [
  "Middelbare school",
  "MBO",
  "HBO",
  "WO Bachelor",
  "WO Master",
  "PhD",
  "Liever niet zeggen",
];

const RELATIONSHIP_GOALS = [
  { label: "Lange termijn partner", emoji: "💍" },
  { label: "Lange termijn, ook open voor kort", emoji: "🌱" },
  { label: "Korte termijn fun", emoji: "🔥" },
  { label: "Nieuwe vrienden", emoji: "👋" },
  { label: "Nog aan het uitzoeken", emoji: "🤔" },
];

interface Props {
  bio: string;
  age: number | null;
  job: string;
  interests: string[];
  height: string;
  education: string;
  relationshipGoal: string;
  onChange: (field: string, value: string | number | string[] | null) => void;
}

const BIO_IDEAL_MAX = 300;

export default function ProfileForm({
  bio,
  age,
  job,
  interests,
  height,
  education,
  relationshipGoal,
  onChange,
}: Props) {
  const len = bio.length;
  const bioColor =
    len === 0
      ? "text-gray-500"
      : len < 50
      ? "text-red-400"
      : len <= BIO_IDEAL_MAX
      ? "text-green-400"
      : "text-amber-400";

  return (
    <div className="space-y-6">
      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => onChange("bio", e.target.value)}
          placeholder="Plak je Tinder bio hier..."
          rows={4}
          className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 resize-none text-sm"
        />
        <div className={`text-xs mt-1 flex justify-between ${bioColor}`}>
          <span>
            {len === 0 ? "Leeg" : len < 50 ? "Te kort" : len <= BIO_IDEAL_MAX ? "Goede lengte ✓" : "Wordt lang"}
          </span>
          <span>{len} tekens — ideaal: 150–300</span>
        </div>
      </div>

      {/* Age picker + Job */}
      <div className="grid grid-cols-2 gap-4">
        <AgePicker
          value={age}
          onChange={(v) => onChange("age", v)}
        />
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-300">
            Beroep <span className="text-gray-500 font-normal">(optioneel)</span>
          </label>
          <input
            type="text"
            value={job}
            onChange={(e) => onChange("job", e.target.value)}
            placeholder="bijv. Designer"
            className="bg-gray-900 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 text-sm"
          />
        </div>
      </div>

      {/* Height slider */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Lengte{" "}
          <span className="text-gray-500 font-normal">(optioneel)</span>
          {height && (
            <span className="ml-2 text-rose-400 font-semibold">{height} cm</span>
          )}
        </label>
        <input
          type="range"
          min={150}
          max={220}
          value={height || 175}
          onChange={(e) => onChange("height", e.target.value)}
          className="w-full accent-rose-500"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>150 cm</span>
          <span>220 cm</span>
        </div>
        {!height && (
          <p className="text-xs text-gray-600 mt-1">Schuif om je lengte in te stellen</p>
        )}
      </div>

      {/* Education */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Opleiding{" "}
          <span className="text-gray-500 font-normal">(optioneel)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {EDUCATION_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => onChange("education", education === opt ? "" : opt)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                education === opt
                  ? "bg-rose-600 border-rose-600 text-white"
                  : "border-gray-600 text-gray-300 hover:border-rose-400 hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Relationship goal */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Wat zoek je?{" "}
          <span className="text-gray-500 font-normal">(optioneel)</span>
        </label>
        <div className="flex flex-col gap-2">
          {RELATIONSHIP_GOALS.map(({ label, emoji }) => (
            <button
              key={label}
              onClick={() => onChange("relationshipGoal", relationshipGoal === label ? "" : label)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                relationshipGoal === label
                  ? "bg-rose-600/20 border-rose-500 text-white"
                  : "border-gray-700 text-gray-300 hover:border-gray-500"
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="text-sm">{label}</span>
              {relationshipGoal === label && (
                <span className="ml-auto text-rose-400 text-xs font-medium">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <InterestSelector
        selected={interests}
        onChange={(v) => onChange("interests", v)}
      />
    </div>
  );
}
