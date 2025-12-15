export interface DailyMetrics {
  date: string;
  total_appointments: number;
  completed: number;
  in_progress: number;
  pending: number;
  average_duration_minutes: number;
}

export interface MonthlyMetrics {
  current_month: {
    year: number;
    month: number;
    total_appointments: number;
    completed: number;
    completion_rate: number;
  };
  previous_month: {
    year: number;
    month: number;
    total_appointments: number;
    completed: number;
    completion_rate: number;
  };
  variations: {
    total_variation_percent: number;
    completed_variation_percent: number;
  };
}

export interface MonthData {
  month: number;
  month_name: string;
  total_appointments: number;
  completed: number;
}

export interface YearlyMetrics {
  year: number;
  monthly_data: MonthData[];
  totals: {
    total_appointments: number;
    completed: number;
    average_per_month: number;
  };
}

export interface ServiceMetric {
  service_id: number;
  service_name: string;
  service_area: string;
  total_appointments: number;
  average_duration_minutes: number;
}

export interface StatusMetric {
  status_id: number;
  status_name: string;
  total: number;
  percentage: number;
}

export interface SummaryMetrics {
  total_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  completion_rate: number;
  cancellation_rate: number;
  top_services: {
    name: string;
    count: number;
  }[];
}
