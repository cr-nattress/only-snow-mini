// Renders a colored badge for ski pass types.
// Input: pass name string (e.g. "epic", "ikon", "none")
// Output: colored badge span, or null if pass is "none"
// Side effects: none

const PASS_COLORS: Record<string, string> = {
  epic: "bg-purple-500/15 text-purple-400",
  ikon: "bg-orange-500/15 text-orange-400",
  indy: "bg-cyan-500/15 text-cyan-400",
  mountain_collective: "bg-emerald-500/15 text-emerald-400",
};

const DEFAULT_COLOR = "bg-snow-primary/15 text-snow-primary";

interface PassBadgeProps {
  pass: string;
}

export function PassBadge({ pass }: PassBadgeProps) {
  if (pass === "none" || !pass) return null;

  const label = pass.charAt(0).toUpperCase() + pass.slice(1);
  const color = PASS_COLORS[pass] ?? DEFAULT_COLOR;

  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${color}`}>
      {label}
    </span>
  );
}
