import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { queryApi, SearchResult, FeedbackRequest } from '@/lib/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export function useSearchMemories(): UseMutationResult<SearchResult, AxiosError, string> {
  return useMutation<SearchResult, AxiosError, string>({
    mutationFn: (query: string) => queryApi.search(query),
    onError: (error) => {
      if (error.response?.status !== 429) {
        toast.error('Search failed');
      }
    },
  });
}

interface SubmitFeedbackInput {
  queryId: string;
  feedback: FeedbackRequest;
}

export function useQueryFeedback(): UseMutationResult<void, AxiosError, SubmitFeedbackInput> {
  return useMutation<void, AxiosError, SubmitFeedbackInput>({
    mutationFn: ({ queryId, feedback }) => queryApi.feedback(queryId, feedback),
    onSuccess: () => {
      toast.success('Feedback submitted!');
    },
    onError: (error) => {
      if (error.response?.status !== 429) {
        toast.error('Failed to submit feedback');
      }
    },
  });
}