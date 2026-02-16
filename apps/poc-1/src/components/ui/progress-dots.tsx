interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i < current
              ? "bg-snow-primary flex-[2]"
              : "bg-snow-border flex-1"
          }`}
        />
      ))}
    </div>
  );
}
