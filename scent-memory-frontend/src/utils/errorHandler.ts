import { ApiErrorResponse } from '@/types/auth.types';

export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {

  if (isApiError(error)) {

    if (typeof error.response?.data?.detail === 'string') {
      return error.response.data.detail;
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

function isApiError(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}

export function getValidationErrors(error: unknown): Record<string, string[]> | null {
  if (isApiError(error)) {
    const detail = error.response?.data?.detail;
    
    if (typeof detail === 'object' && detail !== null && !Array.isArray(detail)) {
      return detail as Record<string, string[]>;
    }
  }
  
  return null;
}