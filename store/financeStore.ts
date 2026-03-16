import { create } from 'zustand';
import { Account, Category, TransactionFilters } from '@/constants/types';

interface FinanceState {
  accounts: Account[];
  categories: Category[];
  activeFilters: TransactionFilters;

  setAccounts: (accounts: Account[]) => void;
  setCategories: (categories: Category[]) => void;
  setActiveFilters: (filters: Partial<TransactionFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: TransactionFilters = {
  limit: 20,
  offset: 0,
};

export const useFinanceStore = create<FinanceState>((set) => ({
  accounts: [],
  categories: [],
  activeFilters: defaultFilters,

  setAccounts: (accounts) => set({ accounts }),
  setCategories: (categories) => set({ categories }),

  setActiveFilters: (filters) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, ...filters, offset: 0 },
    })),

  resetFilters: () => set({ activeFilters: defaultFilters }),
}));
