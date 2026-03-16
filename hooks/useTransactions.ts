import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from '@tanstack/react-query';
import { transactionsApi } from '@/services/api';
import {
  Transaction,
  PaginatedResponse,
  TransactionFilters,
  CreateTransactionPayload,
} from '@/constants/types';

const LIMIT = 20;

export function useTransactions(filters: Omit<TransactionFilters, 'offset'> = {}) {
  return useInfiniteQuery<PaginatedResponse<Transaction>>({
    queryKey: ['transactions', filters],
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await transactionsApi.list({ ...filters, limit: LIMIT, offset: pageParam });
      return data;
    },
    getNextPageParam: (lastPage) => {
      const { offset, limit, total } = lastPage.pagination;
      const nextOffset = offset + limit;
      return nextOffset < total ? nextOffset : undefined;
    },
    initialPageParam: 0,
    staleTime: 30_000,
  });
}

export function useTransaction(id: string) {
  return useQuery<Transaction>({
    queryKey: ['transactions', id],
    queryFn: async () => {
      const { data } = await transactionsApi.get(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTransactionPayload) => {
      const { data } = await transactionsApi.create(payload);
      return data as Transaction;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<CreateTransactionPayload> }) => {
      const { data } = await transactionsApi.update(id, payload);
      return data as Transaction;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['transactions', id] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await transactionsApi.remove(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['budgets'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function flattenTransactions(
  data: InfiniteData<PaginatedResponse<Transaction>> | undefined,
): Transaction[] {
  return data?.pages.flatMap((page) => page.data) ?? [];
}
