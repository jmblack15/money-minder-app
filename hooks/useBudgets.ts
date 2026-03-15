import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetsService, CreateBudgetPayload, UpdateBudgetPayload } from '@/services/budgets';
import { Budget } from '@/types';
import * as Haptics from 'expo-haptics';

export const BUDGETS_KEY = 'budgets';

export interface BudgetWithProgress extends Budget {
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
}

export function useBudgets() {
  return useQuery({
    queryKey: [BUDGETS_KEY],
    queryFn: async () => {
      const budgets = await budgetsService.getAll();
      return budgets.map((b): BudgetWithProgress => {
        const spent = b.spent ?? 0;
        const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
        return {
          ...b,
          percentage,
          status:
            percentage >= 100
              ? 'danger'
              : percentage >= b.alert_at
                ? 'warning'
                : 'safe',
        };
      });
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBudgetPayload) =>
      budgetsService.create(payload),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: [BUDGETS_KEY] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBudgetPayload }) =>
      budgetsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BUDGETS_KEY] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsService.remove(id),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      queryClient.invalidateQueries({ queryKey: [BUDGETS_KEY] });
    },
  });
}
