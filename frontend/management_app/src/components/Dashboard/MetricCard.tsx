import React from "react";
import { Card } from "../ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "border-l-4 border-blue-500",
    green: "border-l-4 border-green-500",
    orange: "border-l-4 border-orange-500",
    red: "border-l-4 border-red-500",
    purple: "border-l-4 border-purple-500",
  };

  return (
    <Card
      className={`p-4 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
        colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        {icon && <div className="ml-4 text-2xl opacity-50">{icon}</div>}
      </div>
    </Card>
  );
};
