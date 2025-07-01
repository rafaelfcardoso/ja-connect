
import * as React from "react";

interface ChartContainerProps {
  config: Record<string, any>;
  className?: string;
  children: React.ReactNode;
}

export function ChartContainer({
  config,
  className,
  children,
}: ChartContainerProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
