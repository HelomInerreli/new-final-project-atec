import axios from "axios";
import type {
  DailyMetrics,
  MonthlyMetrics,
  YearlyMetrics,
  ServiceMetric,
  StatusMetric,
  SummaryMetrics,
} from "../types/metrics";

const API_BASE_URL = "http://localhost:8000/api/v1";

// Função para obter o token do localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Configuração padrão para todas as requisições
const getConfig = () => ({
  headers: {
    Authorization: `Bearer ${getAuthToken()}`,
  },
});

export const metricsService = {
  // Métricas diárias
  getDailyMetrics: async (date?: string): Promise<DailyMetrics> => {
    const params = date ? { date } : {};
    const response = await axios.get<DailyMetrics>(
      `${API_BASE_URL}/metrics/daily`,
      { ...getConfig(), params }
    );
    return response.data;
  },

  // Métricas mensais
  getMonthlyMetrics: async (
    year?: number,
    month?: number
  ): Promise<MonthlyMetrics> => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;

    const response = await axios.get<MonthlyMetrics>(
      `${API_BASE_URL}/metrics/monthly`,
      { ...getConfig(), params }
    );
    return response.data;
  },

  // Métricas anuais
  getYearlyMetrics: async (year?: number): Promise<YearlyMetrics> => {
    const params = year ? { year } : {};
    const response = await axios.get<YearlyMetrics>(
      `${API_BASE_URL}/metrics/yearly`,
      { ...getConfig(), params }
    );
    return response.data;
  },

  // Métricas por serviço
  getMetricsByService: async (
    startDate?: string,
    endDate?: string
  ): Promise<ServiceMetric[]> => {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await axios.get<ServiceMetric[]>(
      `${API_BASE_URL}/metrics/by-service`,
      { ...getConfig(), params }
    );
    return response.data;
  },

  // Métricas por status
  getMetricsByStatus: async (
    startDate?: string,
    endDate?: string
  ): Promise<StatusMetric[]> => {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await axios.get<StatusMetric[]>(
      `${API_BASE_URL}/metrics/by-status`,
      { ...getConfig(), params }
    );
    return response.data;
  },

  // Resumo geral
  getSummaryMetrics: async (): Promise<SummaryMetrics> => {
    const response = await axios.get<SummaryMetrics>(
      `${API_BASE_URL}/metrics/summary`,
      getConfig()
    );
    return response.data;
  },
};
