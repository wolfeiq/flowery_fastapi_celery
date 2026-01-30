import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@/types/auth.types';

export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {

  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (typeof data?.detail === 'string') {
      return data.detail;
    }

    if (error.response?.status === 401) {
      return 'Invalid credentials';
    }
    if (error.response?.status === 403) {
      return 'Access forbidden';
    }
    if (error.response?.status === 404) {
      return 'Resource not found';
    }
    if (error.response?.status === 429) {
      return 'Too many requests. Please try again later';
    }
    if (error.response?.status && error.response.status >= 500) {
      return 'Server error. Please try again later';
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('Network Error') || !navigator.onLine) {
      return 'No internet connection';
    }
    if (error.message.includes('timeout')) {
      return 'Request timeout. Please try again';
    }
    return error.message;
  }

  return fallback;
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

export function getValidationErrors(error: unknown): Record<string, string[]> | null {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    const detail = data?.detail;

    if (
      typeof detail === 'object' &&
      detail !== null &&
      !Array.isArray(detail) &&
      !('message' in detail) 
    ) {
      return detail as unknown as Record<string, string[]>;
    }
  }

  return null;
}
