"use client";

const MAX_INTERESTS = 5;

const CATEGORIES: { label: string; emoji: string; items: string[] }[] = [
  {
    label: "Buiten",
    emoji: "🏕️",
    items: ["Wandelen", "Hardlopen", "Kamperen", "Surfen", "Klimmen", "Fietsen", "Yoga", "Zwemmen"],
  },
  {
    label: "Creatief",
    emoji: "🎨",
    items: ["Fotografie", "Muziek", "Schrijven", "Koken", "Kunst", "DIY", "Dansen", "Mode"],
  },
  {
    label: "Film & TV",
    emoji: "🎬",
    items: ["Films", "Series", "Anime", "Documentaires", "Comedy", "Podcasts"],
  },
  {
    label: "Sport",
    emoji: "⚽",
    items: ["Voetbal", "Basketball", "Tennis", "Golf", "Fitness", "Zwemmen", "Boksen"],
  },
  {
    label: "Uitgaan",
    emoji: "🍸",
    items: ["Koffie", "Brunch", "Cocktails", "Wijn", "Foodie", "Uitgaan", "Festivals"],
  },
  {
    label: "Reizen",
    emoji: "✈️",
    items: ["Reizen", "Backpacken", "Roadtrips", "Stad ontdekken", "Kamperen"],
  },
  {
    label: "Huisdieren",
    emoji: "🐾",
    items: ["Honden", "Katten", "Dieren"],
  },
  {
    label: "Gaming & Tech",
    emoji: "🎮",
    items: ["Gaming", "Esports", "Technologie", "Lezen", "Boardgames"],
  },
  {
    label: "Sociaal",
    emoji: "🌍",
    items: ["Vrijwilligerswerk", "Duurzaamheid", "Politiek", "Psychologie"],
  },
];

interface Props {
  selected: string[];
  onChange: (interests: string[]) => void;
}

export default function InterestSelector({ selected, onChange }: Props) {
  function toggle(item: string) {
    if (selected.includes(item)) {
      onChange(selected.filter((i) => i !== item));
    } else if (selected.length < MAX_INTERESTS) {
      onChange([...selected, item]);
    }
  }

  const atMax = selected.length >= MAX_INTERESTS;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          Interesses{" "}
          <span className="text-gray-500 font-normal">(optioneel)</span>
        </label>
        <span
          className={`text-xs font-medium ${
            atMax ? "text-rose-400" : "text-gray-500"
          }`}
        >
          {selected.length}/{MAX_INTERESTS}
        </span>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((item) => (
            <button
              key={item}
              onClick={() => toggle(item)}
              className="flex items-center gap-1 bg-rose-600 text-white text-sm px-3 py-1.5 rounded-full font-medium"
            >
              {item}
              <span className="text-rose-200 text-xs ml-0.5">&times;</span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.label}>
            <p className="text-xs text-gray-500 mb-1.5 font-medium">
              {cat.emoji} {cat.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item) => {
                const isSelected = selected.includes(item);
                const isDisabled = atMax && !isSelected;
                return (
                  <button
                    key={item}
                    onClick={() => toggle(item)}
                    disabled={isDisabled}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? "bg-rose-600 border-rose-600 text-white"
                        : isDisabled
                        ? "border-gray-700 text-gray-600 cursor-not-allowed"
                        : "border-gray-600 text-gray-300 hover:border-rose-400 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {atMax && (
        <p className="text-xs text-rose-400">
          Maximum bereikt. Verwijder een interesse om een andere te kiezen.
        </p>
      )}
    </div>
  );
}
