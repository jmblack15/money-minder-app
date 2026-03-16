import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '@/services/api';
import { Account, CreateAccountPayload } from '@/constants/types';
import { useFinanceStore } from '@/store/financeStore';

export function useAccounts() {
  const setAccounts = useFinanceStore((s) => s.setAccounts);

  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const { data } = await accountsApi.list();
      setAccounts(data);
      return data;
    },
    staleTime: 60_000,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAccountPayload) => {
      const { data } = await accountsApi.create(payload);
      return data as Account;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await accountsApi.remove(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
