import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card } from "../ui/card";

interface PieChartComponentProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  title: string;
  height?: number;
}

export const PieChartComponent: React.FC<PieChartComponentProps> = ({
  data,
  dataKey,
  nameKey,
  title,
  height = 300,
}) => {
  console.log(`📊 [PieChart] ${title}:`, data);

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  // Se não há dados, mostrar mensagem
  if (!data || data.length === 0) {
    return (
      <Card className="p-4 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <p className="text-gray-500">Nenhum dado disponível</p>
        </div>
      </Card>
    );
  }

  // Mapeamento de labels para português
  const labelMap: Record<string, string> = {
    total: "Total",
    status_name: "Status",
    service_name: "Serviço",
  };

  // Tooltip customizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            padding: "10px",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", marginBottom: "5px" }}>
            {data.name}
          </p>
          <p style={{ margin: 0, color: data.payload.fill }}>
            {labelMap[dataKey] || "Total"}: {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="p-4 bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
          >
            {data.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
