import { create } from 'zustand';
import { Account, Category } from '@/types';
import { TransactionFilters } from '@/types';

interface FinanceState {
  accounts: Account[];
  categories: Category[];
  activeFilters: TransactionFilters;
  setAccounts: (accounts: Account[]) => void;
  setCategories: (categories: Category[]) => void;
  setActiveFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: TransactionFilters = {
  limit: 20,
  page: 1,
};

export const useFinanceStore = create<FinanceState>((set) => ({
  accounts: [],
  categories: [],
  activeFilters: DEFAULT_FILTERS,

  setAccounts: (accounts) => set({ accounts }),

  setCategories: (categories) => set({ categories }),

  setActiveFilters: (filters) =>
    set((state) => ({
      activeFilters: { ...state.activeFilters, ...filters, page: 1 },
    })),

  clearFilters: () => set({ activeFilters: DEFAULT_FILTERS }),
}));
