import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui/card";

interface AreaChartComponentProps {
  data: any[];
  xKey: string;
  yKey: string;
  title: string;
  color?: string;
  height?: number;
}

export const AreaChartComponent: React.FC<AreaChartComponentProps> = ({
  data,
  xKey,
  yKey,
  title,
  color = "#3b82f6",
  height = 300,
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={xKey}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
            }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
