import type { User } from '@/lib/api';

export type {
  User,
  RegisterRequest,
  LoginResponse,
  ApiErrorResponse,
  RateLimitError,
} from '@/lib/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar?: boolean;
}

export interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
  logout: () => void;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}
