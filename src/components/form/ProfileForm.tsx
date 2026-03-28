"use client";

interface Props {
  bio: string;
  age: string;
  job: string;
  interests: string;
  onChange: (field: string, value: string) => void;
}

const BIO_IDEAL_MIN = 150;
const BIO_IDEAL_MAX = 300;

export default function ProfileForm({ bio, age, job, interests, onChange }: Props) {
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
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => onChange("bio", e.target.value)}
          placeholder="Paste your Tinder bio here..."
          rows={4}
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 resize-none text-sm"
        />
        <div className={`text-xs mt-1 flex justify-between ${bioColor}`}>
          <span>
            {len < 50
              ? "Too short"
              : len <= BIO_IDEAL_MAX
              ? "Good length"
              : "Getting long"}
          </span>
          <span>{len} chars &mdash; ideal: 150–300</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Age <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => onChange("age", e.target.value)}
            placeholder="e.g. 28"
            min={18}
            max={99}
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Job <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={job}
            onChange={(e) => onChange("job", e.target.value)}
            placeholder="e.g. Designer"
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Interests <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={interests}
          onChange={(e) => onChange("interests", e.target.value)}
          placeholder="e.g. hiking, cooking, photography"
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 text-sm"
        />
      </div>
    </div>
  );
}
