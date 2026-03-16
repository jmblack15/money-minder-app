import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '@/services/api';
import { Budget, CreateBudgetPayload } from '@/constants/types';

export function useBudgets() {
  return useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data } = await budgetsApi.list();
      return data;
    },
    staleTime: 60_000,
  });
}

export function useBudgetProgress(budget: Budget) {
  const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
  const isWarning = percentage >= 70 && percentage < 90;
  const isDanger = percentage >= 90;
  const isExceeded = percentage > 100;

  return { percentage: Math.min(percentage, 100), isWarning, isDanger, isExceeded, rawPercentage: percentage };
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBudgetPayload) => {
      const { data } = await budgetsApi.create(payload);
      return data as Budget;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await budgetsApi.remove(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
