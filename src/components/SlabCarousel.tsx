import { useState, useEffect, useMemo, useCallback, useRef } from "react";

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

const API_URLS = [
  'https://api.pokemontcg.io/v2/cards?q=rarity:"Special Illustration Rare"&pageSize=20&orderBy=-set.releaseDate',
  'https://api.pokemontcg.io/v2/cards?q=rarity:"Illustration Rare"&pageSize=20&orderBy=-set.releaseDate',
  'https://api.pokemontcg.io/v2/cards?q=rarity:"Hyper Rare"&pageSize=20&orderBy=-set.releaseDate',
  'https://api.pokemontcg.io/v2/cards?q=rarity:"Rare Holo" set.series:"Base"&pageSize=15',
  'https://api.pokemontcg.io/v2/cards?q=rarity:"Rare Holo" set.releaseDate:[2003-01-01 TO 2008-12-31]&pageSize=15',
  'https://api.pokemontcg.io/v2/cards?q=rarity:"Ultra Rare"&pageSize=20&orderBy=-set.releaseDate',
  'https://api.pokemontcg.io/v2/cards?q=rarity:"Rare Secret"&pageSize=15&orderBy=-set.releaseDate',
  'https://api.pokemontcg.io/v2/cards?q=rarity:"Rare Rainbow"&pageSize=15&orderBy=-set.releaseDate',
];

const REFETCH_INTERVAL = 5 * 60 * 1000;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fetchAllCards(): Promise<string[]> {
  const results = await Promise.all(
    API_URLS.map((u) => fetch(u).then((r) => r.json()).catch(() => ({ data: [] })))
  );
  const seen = new Set<string>();
  const images: string[] = [];
  for (const r of results) {
    for (const c of r?.data || []) {
      if (c?.id && c?.images?.large && !seen.has(c.id)) {
        seen.add(c.id);
        images.push(c.images.large);
      }
    }
  }
  return shuffle(images);
}

function SlabCard({ imageUrl, fallbackIndex, gradeInfo }: {
  imageUrl?: string;
  fallbackIndex: number;
  gradeInfo: typeof grades[0];
}) {
  return (
    <div
      className="w-[154px] h-[224px] rounded-lg border border-white/10 flex flex-col overflow-hidden shrink-0"
      style={{ background: "#1a1a1a" }}
    >
      <div className="flex-1 m-2 rounded-sm overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
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
        <div className="rounded-sm px-2 py-1.5 flex items-center justify-between" style={{ background: "#1a2744" }}>
          <p className="text-[9px] text-white font-bold tracking-wider leading-none">PSA</p>
          <div className="text-right">
            <p className="text-[14px] font-bold leading-none" style={{ color: "#f59e0b" }}>{gradeInfo.grade}</p>
            <p className="text-[5px] text-white/60 tracking-wider mt-0.5">{gradeInfo.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SlabCarousel() {
  const [cardImages, setCardImages] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const doFetch = useCallback(() => {
    fetchAllCards().then((imgs) => { if (imgs.length) setCardImages(imgs); });
  }, []);

  useEffect(() => {
    doFetch();
    intervalRef.current = setInterval(doFetch, REFETCH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [doFetch]);

  // Split images evenly across 3 columns with no overlap
  const [col1, col2, col3] = useMemo(() => {
    if (!cardImages.length) return [[], [], []];
    const c1: string[] = [], c2: string[] = [], c3: string[] = [];
    cardImages.forEach((img, i) => {
      if (i % 3 === 0) c1.push(img);
      else if (i % 3 === 1) c2.push(img);
      else c3.push(img);
    });
    return [c1, c2, c3];
  }, [cardImages]);

  const renderColumn = (images: string[], direction: "up" | "down", colKey: string, hideOnMobile?: boolean) => {
    // Duplicate for seamless loop
    const items = images.length ? [...images, ...images] : Array.from({ length: 20 }, () => "");
    return (
      <div className={`carousel-col-${direction} flex flex-col gap-4 ${hideOnMobile ? "hidden md:flex" : ""}`}>
        {items.map((url, i) => (
          <SlabCard
            key={`${colKey}-${i}`}
            imageUrl={url || undefined}
            fallbackIndex={i}
            gradeInfo={grades[i % grades.length]}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-around px-4" style={{ opacity: 0.28 }}>
      {renderColumn(col1, "up", "a")}
      {renderColumn(col2, "down", "b")}
      {renderColumn(col3, "up", "c", true)}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, #0a0a0a 85%)" }}
      />
    </div>
  );
}
