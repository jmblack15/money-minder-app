import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { transactionsService, CreateTransactionPayload, UpdateTransactionPayload } from '@/services/transactions';
import { TransactionFilters } from '@/types';
import * as Haptics from 'expo-haptics';

export const TRANSACTIONS_KEY = 'transactions';

export function useTransactions(filters: Omit<TransactionFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [TRANSACTIONS_KEY, filters],
    queryFn: ({ pageParam }) =>
      transactionsService.getAll({ ...filters, page: pageParam as number, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 1000 * 60 * 2, // 2 min
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: [TRANSACTIONS_KEY, id],
    queryFn: () => transactionsService.getById(id),
    enabled: !!id,
  });
}

export function useRecentTransactions(limit = 5) {
  return useQuery({
    queryKey: [TRANSACTIONS_KEY, 'recent', limit],
    queryFn: () => transactionsService.getAll({ limit, page: 1 }),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      transactionsService.create(payload),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransactionPayload }) =>
      transactionsService.update(id, payload),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsService.remove(id),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}
