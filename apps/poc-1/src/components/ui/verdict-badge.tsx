interface VerdictBadgeProps {
  verdict: "go" | "maybe" | "skip";
  size?: "sm" | "md" | "lg";
}

const VERDICT_LABELS: Record<string, string> = {
  go: "Go",
  maybe: "Maybe",
  skip: "Skip",
};

export function VerdictBadge({ verdict, size = "md" }: VerdictBadgeProps) {
  const colors = {
    go: "bg-snow-go/10 text-snow-go",
    maybe: "bg-snow-maybe/10 text-snow-maybe",
    skip: "bg-snow-skip/10 text-snow-skip",
  };

  const sizes = {
    sm: "w-12 py-0.5 text-[11px]",
    md: "w-14 py-1 text-xs",
    lg: "w-16 py-1.5 text-sm",
  };

  return (
    <span className={`inline-block rounded-full font-semibold text-center flex-shrink-0 ${colors[verdict]} ${sizes[size]}`}>
      {VERDICT_LABELS[verdict]}
    </span>
  );
}
