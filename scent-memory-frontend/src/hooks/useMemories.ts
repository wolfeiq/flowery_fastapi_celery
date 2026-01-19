import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { memoriesApi, Memory } from '@/lib/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export const memoryKeys = {
  all: ['memories'] as const,
  lists: () => [...memoryKeys.all, 'list'] as const,
  detail: (id: string) => [...memoryKeys.all, 'detail', id] as const,
};

export function useMemories(): UseQueryResult<Memory[], AxiosError> {
  return useQuery<Memory[], AxiosError>({
    queryKey: memoryKeys.lists(),
    queryFn: memoriesApi.list,
  });
}

export function useMemory(id: string): UseQueryResult<Memory, AxiosError> {
  return useQuery<Memory, AxiosError>({
    queryKey: memoryKeys.detail(id),
    queryFn: () => memoriesApi.get(id),
    enabled: !!id,
  });
}
export function useUploadMemory(): UseMutationResult<Memory, AxiosError, FormData> {
  const queryClient = useQueryClient();

  return useMutation<Memory, AxiosError, FormData>({
    mutationFn: memoriesApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memoryKeys.lists() });
      toast.success('Memory uploaded! Processing in background...');
    },
    onError: (error) => {
      if (error.response?.status !== 429) {
        toast.error('Failed to upload memory');
      }
    },
  });
}