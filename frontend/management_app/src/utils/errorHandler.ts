import { AxiosError } from 'axios';

export const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  if (err instanceof AxiosError && err.response?.data?.detail) {
    return err.response.data.detail;
  }
  return defaultMessage;
};
