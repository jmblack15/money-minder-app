import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { differenceInDays, parseISO } from 'date-fns';
import { savingsApi } from '@/services/api';
import { SavingsGoal, CreateSavingsGoalPayload } from '@/constants/types';

export function useSavingsGoals() {
  return useQuery<SavingsGoal[]>({
    queryKey: ['savings-goals'],
    queryFn: async () => {
      const { data } = await savingsApi.list();
      return data;
    },
    staleTime: 60_000,
  });
}

export function useGoalProgress(goal: SavingsGoal) {
  const percentage =
    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const daysLeft = goal.deadline
    ? differenceInDays(parseISO(goal.deadline), new Date())
    : null;
  const remaining = goal.targetAmount - goal.currentAmount;
  const isCompleted = goal.status === 'COMPLETED' || goal.currentAmount >= goal.targetAmount;
  const isOverdue = daysLeft !== null && daysLeft < 0 && !isCompleted;

  return {
    percentage: Math.min(percentage, 100),
    daysLeft: daysLeft !== null ? Math.max(daysLeft, 0) : null,
    remaining: Math.max(remaining, 0),
    isCompleted,
    isOverdue,
  };
}

export function useCreateSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSavingsGoalPayload) => {
      const { data } = await savingsApi.create(payload);
      return data as SavingsGoal;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
}

export function useContributeToGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      // No dedicated contribute endpoint — update currentAmount via PUT
      const goals = qc.getQueryData<SavingsGoal[]>(['savings-goals']);
      const goal = goals?.find((g) => g.id === id);
      const newAmount = (goal?.currentAmount ?? 0) + amount;
      const { data } = await savingsApi.update(id, { currentAmount: newAmount });
      return data as SavingsGoal;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
}

export function useDeleteSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await savingsApi.remove(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
}
