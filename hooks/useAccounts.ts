import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountsService, CreateAccountPayload, UpdateAccountPayload } from '@/services/accounts';
import { useFinanceStore } from '@/store/financeStore';
import * as Haptics from 'expo-haptics';

export const ACCOUNTS_KEY = 'accounts';

export function useAccounts() {
  const setAccounts = useFinanceStore((s) => s.setAccounts);
  return useQuery({
    queryKey: [ACCOUNTS_KEY],
    queryFn: async () => {
      const accounts = await accountsService.getAll();
      setAccounts(accounts);
      return accounts;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) =>
      accountsService.create(payload),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_KEY] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAccountPayload }) =>
      accountsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_KEY] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsService.remove(id),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      queryClient.invalidateQueries({ queryKey: [ACCOUNTS_KEY] });
    },
  });
}
