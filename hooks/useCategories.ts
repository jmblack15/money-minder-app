import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api';
import { Category, CategoryType } from '@/constants/types';
import { useFinanceStore } from '@/store/financeStore';

export function useCategories(type?: CategoryType) {
  const setCategories = useFinanceStore((s) => s.setCategories);

  return useQuery<Category[]>({
    queryKey: ['categories', type],
    queryFn: async () => {
      const { data } = await categoriesApi.list();
      setCategories(data);
      return type ? (data as Category[]).filter((c) => c.type === type) : data;
    },
    staleTime: 5 * 60_000,
  });
}
