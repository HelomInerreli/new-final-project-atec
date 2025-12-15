import React from "react";
import { Card } from "../ui/card";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DashboardFiltersProps {
  onDateRangeChange: (range: DateRange) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  selectedYear?: number;
  selectedMonth?: number;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onDateRangeChange,
  onYearChange,
  onMonthChange,
  selectedYear,
  selectedMonth,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ];

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDateInput = document.getElementById("endDate") as HTMLInputElement;
    if (endDateInput?.value) {
      onDateRangeChange({
        startDate: e.target.value,
        endDate: endDateInput.value,
      });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDateInput = document.getElementById(
      "startDate"
    ) as HTMLInputElement;
    if (startDateInput?.value) {
      onDateRangeChange({
        startDate: startDateInput.value,
        endDate: e.target.value,
      });
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ano
          </label>
          <select
            id="year"
            value={selectedYear || currentYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="month"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mês
          </label>
          <select
            id="month"
            value={selectedMonth || new Date().getMonth() + 1}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data Início
          </label>
          <input
            type="date"
            id="startDate"
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data Fim
          </label>
          <input
            type="date"
            id="endDate"
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </Card>
  );
};
