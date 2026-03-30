import { useState, useEffect, useMemo } from "react";

interface PokemonCard {
  id: string;
  images: { large: string };
}

const grades = [
  { grade: "10", label: "GEM MINT" },
  { grade: "9", label: "MINT" },
  { grade: "8", label: "NM-MT" },
];

const fallbackColors = [
  { from: "#7c3aed", to: "#a855f7" },
  { from: "#2563eb", to: "#60a5fa" },
  { from: "#dc2626", to: "#f87171" },
  { from: "#d97706", to: "#fbbf24" },
  { from: "#059669", to: "#34d399" },
  { from: "#7c3aed", to: "#ec4899" },
  { from: "#2563eb", to: "#7c3aed" },
  { from: "#d97706", to: "#dc2626" },
];

function SlabCard({ imageUrl, fallbackIndex, gradeInfo }: {
  imageUrl?: string;
  fallbackIndex: number;
  gradeInfo: typeof grades[0];
}) {
  return (
    <div
      className="w-[154px] h-[224px] md:w-[154px] md:h-[224px] rounded-lg border border-white/10 flex flex-col overflow-hidden shrink-0"
      style={{ background: "#1a1a1a" }}
    >
      <div className="flex-1 m-2 rounded-sm overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(${135 + fallbackIndex * 20}deg, ${fallbackColors[fallbackIndex % fallbackColors.length].from}, ${fallbackColors[fallbackIndex % fallbackColors.length].to})`,
              opacity: 0.8,
            }}
          />
        )}
      </div>
      <div className="px-2 pb-2">
        <div
          className="rounded-sm px-2 py-1.5 flex items-center justify-between"
          style={{ background: "#1a2744" }}
        >
          <p className="text-[9px] text-white font-bold tracking-wider leading-none">PSA</p>
          <div className="text-right">
            <p className="text-[14px] font-bold leading-none" style={{ color: "#f59e0b" }}>
              {gradeInfo.grade}
            </p>
            <p className="text-[5px] text-white/60 tracking-wider mt-0.5">{gradeInfo.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SlabCarousel() {
  const [cardImages, setCardImages] = useState<string[]>([]);

  useEffect(() => {
    fetch("https://api.pokemontcg.io/v2/cards?q=rarity:rare+supertype:Pok%C3%A9mon&pageSize=30&orderBy=set.releaseDate")
      .then((r) => r.json())
      .then((data) => {
        if (data?.data?.length) {
          setCardImages(data.data.map((c: PokemonCard) => c.images.large));
        }
      })
      .catch(() => {});
  }, []);

  const assignedGrades = useMemo(
    () => Array.from({ length: 30 }, (_, i) => grades[i % grades.length]),
    []
  );

  // 3 columns of 10 cards each, duplicated for seamless loop
  const col1Items = useMemo(() => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    return [...items, ...items];
  }, []);

  const col2Items = useMemo(() => {
    const items = Array.from({ length: 10 }, (_, i) => i + 10);
    return [...items, ...items];
  }, []);

  const col3Items = useMemo(() => {
    const items = Array.from({ length: 10 }, (_, i) => i + 20);
    return [...items, ...items];
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-around px-4" style={{ opacity: 0.15 }}>
      {/* Column 1 - scrolls up (visible on both mobile and desktop) */}
      <div className="carousel-col-up flex flex-col gap-4">
        {col1Items.map((idx, i) => (
          <SlabCard
            key={`a-${i}`}
            imageUrl={cardImages[idx % cardImages.length] || undefined}
            fallbackIndex={idx}
            gradeInfo={assignedGrades[idx % assignedGrades.length]}
          />
        ))}
      </div>
      {/* Column 2 - scrolls down (visible on both mobile and desktop) */}
      <div className="carousel-col-down flex flex-col gap-4">
        {col2Items.map((idx, i) => (
          <SlabCard
            key={`b-${i}`}
            imageUrl={cardImages[idx % cardImages.length] || undefined}
            fallbackIndex={idx}
            gradeInfo={assignedGrades[idx % assignedGrades.length]}
          />
        ))}
      </div>
      {/* Column 3 - scrolls up (desktop only) */}
      <div className="carousel-col-up hidden md:flex flex-col gap-4">
        {col3Items.map((idx, i) => (
          <SlabCard
            key={`c-${i}`}
            imageUrl={cardImages[idx % cardImages.length] || undefined}
            fallbackIndex={idx}
            gradeInfo={assignedGrades[idx % assignedGrades.length]}
          />
        ))}
      </div>
      {/* Radial fade overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 10%, #0a0a0a 70%)",
        }}
      />
    </div>
  );
}
