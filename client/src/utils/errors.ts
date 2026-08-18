import { isAxiosError } from "axios";

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || fallback;
  }
  return fallback;
};
