const slabColors = [
  { from: "#7c3aed", to: "#a855f7", grade: "10", label: "GEM MINT" },
  { from: "#2563eb", to: "#60a5fa", grade: "9", label: "MINT" },
  { from: "#dc2626", to: "#f87171", grade: "10", label: "GEM MINT" },
  { from: "#d97706", to: "#fbbf24", grade: "8", label: "NM-MT" },
  { from: "#059669", to: "#34d399", grade: "10", label: "GEM MINT" },
  { from: "#7c3aed", to: "#ec4899", grade: "9", label: "MINT" },
  { from: "#2563eb", to: "#7c3aed", grade: "10", label: "GEM MINT" },
  { from: "#d97706", to: "#dc2626", grade: "7", label: "NM" },
];

function SlabCard({ color, index }: { color: typeof slabColors[0]; index: number }) {
  return (
    <div
      className="w-[100px] h-[140px] rounded-lg border border-white/10 flex flex-col overflow-hidden shrink-0"
      style={{ background: "#1a1a1a" }}
    >
      {/* Card art area */}
      <div
        className="flex-1 m-1.5 rounded-sm"
        style={{
          background: `linear-gradient(${135 + index * 20}deg, ${color.from}, ${color.to})`,
          opacity: 0.8,
        }}
      />
      {/* PSA label */}
      <div className="px-1.5 pb-1.5">
        <div className="bg-white/10 rounded-sm px-1 py-0.5 text-center">
          <p className="text-[6px] text-white/40 font-medium tracking-wider">PSA</p>
          <p className="text-[10px] text-white/60 font-medium leading-none">{color.grade}</p>
          <p className="text-[4px] text-white/30 tracking-wider mt-0.5">{color.label}</p>
        </div>
      </div>
    </div>
  );
}

export default function SlabCarousel() {
  const col1 = slabColors;
  const col2 = [...slabColors].reverse();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:flex justify-center gap-4 opacity-[0.12]">
      {/* Column 1 - scrolls up */}
      <div className="carousel-col-up flex flex-col gap-4">
        {[...col1, ...col1].map((c, i) => (
          <SlabCard key={`a-${i}`} color={c} index={i} />
        ))}
      </div>
      {/* Column 2 - scrolls down */}
      <div className="carousel-col-down flex flex-col gap-4">
        {[...col2, ...col2].map((c, i) => (
          <SlabCard key={`b-${i}`} color={c} index={i + 4} />
        ))}
      </div>
      {/* Radial fade overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 20%, hsl(0 0% 4%) 70%)",
        }}
      />
    </div>
  );
}
