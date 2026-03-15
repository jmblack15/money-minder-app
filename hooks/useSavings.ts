import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  savingsService,
  CreateSavingsGoalPayload,
  ContributePayload,
} from '@/services/savings';
import * as Haptics from 'expo-haptics';

export const SAVINGS_KEY = 'savings';

export function useSavings() {
  return useQuery({
    queryKey: [SAVINGS_KEY],
    queryFn: () => savingsService.getAll(),
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSavingsGoalPayload) =>
      savingsService.create(payload),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: [SAVINGS_KEY] });
    },
  });
}

export function useContributeToGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ContributePayload }) =>
      savingsService.contribute(id, payload),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: [SAVINGS_KEY] });
    },
  });
}

export function useDeleteSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => savingsService.remove(id),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      queryClient.invalidateQueries({ queryKey: [SAVINGS_KEY] });
    },
  });
}
