
import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    positive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({ 
  title, 
  value, 
  change,
  icon,
  className 
}: StatCardProps) {
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="card-title">{title}</p>
          <p className="card-value">{value}</p>
          
          {change && (
            <div className="card-footer">
              <span 
                className={cn(
                  "flex items-center",
                  change.positive ? "text-green-500" : "text-red-500"
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={cn(
                    "w-3 h-3 mr-1",
                    !change.positive && "transform rotate-180"
                  )}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
                    clipRule="evenodd"
                  />
                </svg>
                {change.value}
              </span>
              <span className="ml-1">vs. mês anterior</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="rounded-md bg-lexgo-50 p-2.5 text-lexgo-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
