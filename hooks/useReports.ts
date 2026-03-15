import { useQuery } from '@tanstack/react-query';
import { reportsService, ReportPeriod } from '@/services/reports';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export const REPORTS_KEY = 'reports';

function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function useReportSummary(period: ReportPeriod) {
  return useQuery({
    queryKey: [REPORTS_KEY, 'summary', period],
    queryFn: () => reportsService.getSummary(period),
    staleTime: 1000 * 60 * 5,
    enabled: !!period.start_date && !!period.end_date,
  });
}

export function useReportByCategory(period: ReportPeriod) {
  return useQuery({
    queryKey: [REPORTS_KEY, 'by-category', period],
    queryFn: () => reportsService.getByCategory(period),
    staleTime: 1000 * 60 * 5,
    enabled: !!period.start_date && !!period.end_date,
  });
}

export function useMonthlyTrend() {
  return useQuery({
    queryKey: [REPORTS_KEY, 'monthly-trend'],
    queryFn: () => reportsService.getMonthlyTrend(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAccountBalances() {
  return useQuery({
    queryKey: [REPORTS_KEY, 'account-balances'],
    queryFn: () => reportsService.getAccountBalances(),
    staleTime: 1000 * 60 * 5,
  });
}

// Utility: get period dates for common presets
export function getPeriodDates(preset: 'this_month' | 'last_month' | 'last_3_months' | 'custom', customStart?: Date, customEnd?: Date): ReportPeriod {
  const now = new Date();
  switch (preset) {
    case 'this_month':
      return {
        start_date: formatDate(startOfMonth(now)),
        end_date: formatDate(endOfMonth(now)),
      };
    case 'last_month': {
      const last = subMonths(now, 1);
      return {
        start_date: formatDate(startOfMonth(last)),
        end_date: formatDate(endOfMonth(last)),
      };
    }
    case 'last_3_months':
      return {
        start_date: formatDate(startOfMonth(subMonths(now, 2))),
        end_date: formatDate(endOfMonth(now)),
      };
    case 'custom':
      return {
        start_date: formatDate(customStart ?? startOfMonth(now)),
        end_date: formatDate(customEnd ?? endOfMonth(now)),
      };
  }
}
