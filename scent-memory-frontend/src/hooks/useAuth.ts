import { useQuery, useMutation, useQueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { authApi, LoginResponse, RegisterRequest, User } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';

interface LoginRequest {
  email: string;
  password: string;
}

export function useMe(): UseQueryResult<User, Error> {
  return useQuery<User, Error>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token');
      }
      
      try {
        const userData = await authApi.getMe();
        return userData;
      } catch (error) {
        localStorage.removeItem('token');
        throw error;
      }
    },
    retry: false,
    enabled: typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin(): UseMutationResult<LoginResponse, AxiosError, LoginRequest> {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, AxiosError, LoginRequest>({
    mutationFn: async ({ email, password }) => {
      const response = await authApi.login(email, password);
      return response;
    },
    onSuccess: async (data) => {
      localStorage.setItem('token', data.access_token);
      
      try {
        const userData = await authApi.getMe();

        queryClient.setQueryData(['auth', 'me'], userData);
      
        toast.success('Welcome back!');
        router.push('/dashboard');
      } catch (error) {
        toast.error('Login successful but failed to load user data');
        localStorage.removeItem('token');
      }
    },
    onError: (error) => {
      if (error.response?.status !== 429) {
        toast.error('Invalid credentials');
      }
    },
  });
}

export function useRegister(): UseMutationResult<LoginResponse, AxiosError, RegisterRequest> {
  const router = useRouter();

  return useMutation<LoginResponse, AxiosError, RegisterRequest>({
    mutationFn: async (data) => {
      const response = await authApi.register(data);
      return response;
    },
    onSuccess: () => {
      toast.success('Account created! Please login.');
      router.push('/login');
    },
    onError: (error) => {
      if (error.response?.status !== 429) {
        const detail = error.response?.data;
        const errorMsg = typeof detail === 'object' && detail && 'detail' in detail && typeof detail.detail === 'string'
          ? detail.detail
          : 'Registration failed';
        toast.error(errorMsg);
      }
    },
  });
}


export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    localStorage.removeItem('token');
    queryClient.clear(); // Clear all cache
    toast.success('Logged out successfully');
    router.push('/login');
  };
}