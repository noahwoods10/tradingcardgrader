import { useState, useEffect, useMemo } from "react";

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
];

const API_URLS = [
  'https://api.pokemontcg.io/v2/cards?q=rarity:"Special Illustration Rare"&pageSize=24&orderBy=-set.releaseDate',
  'https://api.pokemontcg.io/v2/cards?q=rarity:"Illustration Rare"&pageSize=24&orderBy=-set.releaseDate',
  'https://api.pokemontcg.io/v2/cards?q=rarity:"Rare Holo"&pageSize=24&orderBy=set.releaseDate',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateFallbacks(count: number): string[] {
  return Array.from({ length: count }, () => "");
}

async function fetchCards(): Promise<string[]> {
  const results = await Promise.allSettled(
    API_URLS.map((u) => fetch(u).then((r) => r.json()))
  );
  const seen = new Set<string>();
  const images: string[] = [];
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const c of r.value?.data || []) {
      if (c?.id && c?.images?.large && !seen.has(c.id)) {
        seen.add(c.id);
        images.push(c.images.large);
      }
    }
  }
  return images.length > 0 ? shuffle(images) : [];
}

function SlabCard({ imageUrl, index }: { imageUrl: string; index: number }) {
  const gradeInfo = grades[index % grades.length];
  const isFallback = !imageUrl;

  return (
    <div
      className="w-full rounded-lg border border-white/10 flex flex-col overflow-hidden"
      style={{ background: "#1a1a1a", aspectRatio: "2.5/3.5" }}
    >
      <div className="flex-1 m-1.5 rounded-sm overflow-hidden">
        {isFallback ? (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(${135 + index * 30}deg, ${fallbackColors[index % fallbackColors.length].from}, ${fallbackColors[index % fallbackColors.length].to})`,
              opacity: 0.8,
            }}
          />
        ) : (
          <img src={imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="px-1.5 pb-1.5">
        <div className="rounded-sm px-2 py-1 flex items-center justify-between" style={{ background: "#1a2744" }}>
          <p className="text-[8px] text-white font-bold tracking-wider leading-none">PSA</p>
          <div className="text-right">
            <p className="text-[12px] font-bold leading-none" style={{ color: "#f59e0b" }}>{gradeInfo.grade}</p>
            <p className="text-[5px] text-white/60 tracking-wider mt-0.5">{gradeInfo.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Column({ images, direction, className }: { images: string[]; direction: "up" | "down"; className?: string }) {
  // Render the array twice for seamless loop
  const doubled = [...images, ...images];
  const duration = images.length * 3; // seconds

  return (
    <div className={`relative overflow-hidden ${className || ""}`}>
      <div
        className="flex flex-col gap-3"
        style={{
          animation: `carousel-${direction} ${duration}s linear infinite`,
        }}
      >
        {doubled.map((url, i) => (
          <SlabCard key={`${direction}-${i}`} imageUrl={url} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function SlabCarousel() {
  const [cardImages, setCardImages] = useState<string[]>([]);

  useEffect(() => {
    fetchCards().then((imgs) => setCardImages(imgs));
  }, []);

  const columns = useMemo(() => {
    const pool = cardImages.length > 0 ? cardImages : generateFallbacks(24);
    const cols: string[][] = [[], [], []];
    pool.forEach((img, i) => cols[i % 3].push(img));
    return cols;
  }, [cardImages]);

  // Mobile: 2 columns
  const mobileColumns = useMemo(() => {
    const pool = cardImages.length > 0 ? cardImages : generateFallbacks(24);
    const cols: string[][] = [[], []];
    pool.forEach((img, i) => cols[i % 2].push(img));
    return cols;
  }, [cardImages]);

  return (
    <>
      <style>{`
        @keyframes carousel-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes carousel-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ opacity: 0.25 }}>
        {/* Desktop: 3 columns */}
        <div className="hidden md:grid grid-cols-3 gap-3 px-4 h-full" style={{ position: "absolute", inset: 0 }}>
          <Column images={columns[0]} direction="up" />
          <Column images={columns[1]} direction="down" />
          <Column images={columns[2]} direction="up" />
        </div>

        {/* Mobile: 2 columns */}
        <div className="grid md:hidden grid-cols-2 gap-3 px-4 h-full" style={{ position: "absolute", inset: 0 }}>
          <Column images={mobileColumns[0]} direction="up" />
          <Column images={mobileColumns[1]} direction="down" />
        </div>
      </div>

      {/* Overlay gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: "radial-gradient(ellipse at center, transparent 20%, #0a0a0a 70%)" }}
      />
    </>
  );
}
