export interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
    status?: number;
  };
  message?: string;
  code?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface UseMutationResult<TData, TError, TVariables> {
  mutate: (variables: TVariables) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: TError | null;
  data: TData | undefined;
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