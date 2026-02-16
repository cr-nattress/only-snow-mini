interface ScreenContainerProps {
  children: React.ReactNode;
  className?: string;
  padBottom?: boolean;
}

export function ScreenContainer({ children, className = "", padBottom = true }: ScreenContainerProps) {
  return (
    <div className={`min-h-[calc(100dvh-48px)] md:min-h-[calc(100dvh-56px)] bg-snow-surface ${padBottom ? "pb-20 md:pb-6" : ""} ${className}`}>
      <div className="max-w-2xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {children}
      </div>
    </div>
  );
}
