import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories';
import { useFinanceStore } from '@/store/financeStore';

export const CATEGORIES_KEY = 'categories';

export function useCategories() {
  const setCategories = useFinanceStore((s) => s.setCategories);
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: async () => {
      const cats = await categoriesService.getAll();
      setCategories(cats);
      return cats;
    },
    staleTime: 1000 * 60 * 10,
  });
}
