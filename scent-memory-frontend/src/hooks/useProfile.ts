import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { profileApi, Profile, ProfileStats, UpdateProfileRequest } from '@/lib/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export const profileKeys = {
  all: ['profile'] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  stats: () => [...profileKeys.all, 'stats'] as const,
};

export function useProfile(): UseQueryResult<Profile, AxiosError> {
  return useQuery<Profile, AxiosError>({
    queryKey: profileKeys.details(),
    queryFn: profileApi.get,
  });
}

export function useProfileStats(): UseQueryResult<ProfileStats, AxiosError> {
  return useQuery<ProfileStats, AxiosError>({
    queryKey: profileKeys.stats(),
    queryFn: profileApi.stats,
  });
}

export function useUpdateProfile(): UseMutationResult<Profile, AxiosError, UpdateProfileRequest> {
  const queryClient = useQueryClient();

  return useMutation<Profile, AxiosError, UpdateProfileRequest>({
    mutationFn: profileApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.details() });
      queryClient.invalidateQueries({ queryKey: profileKeys.stats() });
      toast.success('Profile updated!');
    },
    onError: (error) => {
      if (error.response?.status !== 429) {
        toast.error('Failed to update profile');
      }
    },
  });
}