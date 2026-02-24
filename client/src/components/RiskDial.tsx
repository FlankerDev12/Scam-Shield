import { useMemo } from "react";
import { cn } from "@/lib/utils";

type RiskTone = "safe" | "suspicious" | "high";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toneFrom(score: number, category?: string): RiskTone {
  const c = (category || "").toLowerCase();
  if (c.includes("high")) return "high";
  if (c.includes("sus")) return "suspicious";
  // fallback by score
  if (score >= 70) return "high";
  if (score >= 35) return "suspicious";
  return "safe";
}

const TONES: Record<
  RiskTone,
  { label: string; color: string; glow: string; chipBg: string; chipFg: string }
> = {
  safe: {
    label: "Safe",
    color: "#34c759",
    glow: "rgba(52,199,89,.35)",
    chipBg: "rgba(52,199,89,.12)",
    chipFg: "rgb(17 94 50)",
  },
  suspicious: {
    label: "Suspicious",
    color: "#ff9f0a",
    glow: "rgba(255,159,10,.35)",
    chipBg: "rgba(255,159,10,.14)",
    chipFg: "rgb(120 53 15)",
  },
  high: {
    label: "High Risk",
    color: "#ff3b30",
    glow: "rgba(255,59,48,.34)",
    chipBg: "rgba(255,59,48,.14)",
    chipFg: "rgb(127 29 29)",
  },
};

export function RiskDial({
  score,
  category,
  className,
}: {
  score: number;
  category?: string;
  className?: string;
}) {
  const pct = clamp(score, 0, 100);
  const tone = toneFrom(pct, category);
  const t = TONES[tone];

  const ring = useMemo(() => {
    const deg = (pct / 100) * 360;
    return `conic-gradient(${t.color} ${deg}deg, rgba(0,0,0,0.08) 0)`;
  }, [pct, t.color]);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative grid place-items-center">
        <div
          className="animate-ring-pop grid place-items-center rounded-[999px] p-[10px]"
          style={{
            background: ring,
            filter: "saturate(1.02)",
            boxShadow: `0 18px 50px ${t.glow}`,
          }}
          aria-label={`Risk score ${pct} out of 100`}
          role="img"
        >
          <div className="glass grain grid h-[210px] w-[210px] place-items-center rounded-[999px] p-6 sm:h-[240px] sm:w-[240px]">
            <div className="text-center">
              <div className="text-[44px] font-semibold leading-none tracking-tight sm:text-[52px]">
                {Math.round(pct)}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">Risk score</div>
              <div
                className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: t.chipBg, color: t.chipFg }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: t.color, boxShadow: `0 0 0 6px ${t.glow}` }}
                />
                {category || t.label}
              </div>
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0 -z-10 rounded-[999px]"
          style={{
            background:
              "radial-gradient(120px 120px at 40% 25%, rgba(255,255,255,.75), transparent 55%), radial-gradient(160px 160px at 60% 75%, rgba(255,255,255,.35), transparent 62%)",
          }}
        />
      </div>
    </div>
  );
}
