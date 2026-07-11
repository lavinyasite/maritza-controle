type ShiftType = "M" | "P" | "N" | "R";
type Lang = "pt" | "it";
type Size = "sm" | "md";

interface ShiftBadgeProps {
  type: ShiftType;
  lang: Lang;
  showTime?: boolean;
  size?: Size;
}

const SHIFT_CONFIG: Record<ShiftType, { labelPt: string; labelIt: string; time: string; cssClass: string }> = {
  M: { labelPt: "Manhã",    labelIt: "Mattino",    time: "06-14", cssClass: "shift-morning"   },
  P: { labelPt: "Tarde",    labelIt: "Pomeriggio", time: "14-22", cssClass: "shift-afternoon" },
  N: { labelPt: "Noite",    labelIt: "Notte",      time: "22-06", cssClass: "shift-night"     },
  R: { labelPt: "Folga",    labelIt: "Riposo",     time: "—",     cssClass: "shift-dayoff"    },
};

export default function ShiftBadge({ type, lang, showTime = false, size = "md" }: ShiftBadgeProps) {
  const config = SHIFT_CONFIG[type];
  const label = lang === "it" ? config.labelIt : config.labelPt;

  return (
    <span
      className={`shift-badge ${config.cssClass}`}
      style={size === "sm" ? { fontSize: "0.7rem", padding: "1px 8px" } : undefined}
      aria-label={`${label}${showTime && config.time !== "—" ? ` ${config.time}h` : ""}`}
    >
      {label}
      {showTime && config.time !== "—" && (
        <span style={{ opacity: 0.7, marginLeft: 4, fontFamily: "var(--font-mono)" }}>
          {config.time}
        </span>
      )}
    </span>
  );
}
