import { useQuery } from '@tanstack/react-query';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { reportsApi } from '@/services/api';
import { CategorySummary, MonthlyTrend, ReportPeriod, ReportSummary } from '@/constants/types';

export interface ReportData {
  summary: ReportSummary;
  byCategory: CategorySummary[];
  monthlyTrends: MonthlyTrend[];
}

function getPeriodDates(period: ReportPeriod, customFrom?: string, customTo?: string) {
  const now = new Date();
  switch (period) {
    case 'this_month':
      return {
        dateFrom: format(startOfMonth(now), 'yyyy-MM-dd'),
        dateTo: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'last_month': {
      const last = subMonths(now, 1);
      return {
        dateFrom: format(startOfMonth(last), 'yyyy-MM-dd'),
        dateTo: format(endOfMonth(last), 'yyyy-MM-dd'),
      };
    }
    case 'last_3_months':
      return {
        dateFrom: format(startOfMonth(subMonths(now, 2)), 'yyyy-MM-dd'),
        dateTo: format(endOfMonth(now), 'yyyy-MM-dd'),
      };
    case 'custom':
      return { dateFrom: customFrom, dateTo: customTo };
  }
}

export function useReports(period: ReportPeriod, customFrom?: string, customTo?: string) {
  const dates = getPeriodDates(period, customFrom, customTo);

  return useQuery<ReportData>({
    queryKey: ['reports', period, dates.dateFrom, dates.dateTo],
    queryFn: async () => {
      const [summaryRes, byCategoryRes, trendRes] = await Promise.all([
        reportsApi.summary(),
        reportsApi.byCategory(dates),
        reportsApi.monthlyTrend(),
      ]);
      return {
        summary: summaryRes.data,
        byCategory: byCategoryRes.data,
        monthlyTrends: trendRes.data,
      };
    },
    staleTime: 5 * 60_000,
  });
}

export function useDashboardSummary() {
  return useQuery<ReportSummary>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await reportsApi.summary();
      return data;
    },
    staleTime: 30_000,
  });
}
