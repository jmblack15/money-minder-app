import { useAuthStore } from '@/store/authStore';

export function useCurrency() {
  const currency = useAuthStore((s) => s.user?.currency ?? 'USD');

  function format(amount: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(amount);
  }

  return { currency, format };
}
