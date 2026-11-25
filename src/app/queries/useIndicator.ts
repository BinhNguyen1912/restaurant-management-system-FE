import indicatorApiRequest, { dashboardOverviewApiRequest } from '@/apiRequest/indicator';
import { DashboardIndicatorQuerySchema } from '@/app/ValidationSchemas/dashboard.model';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

export const useDashBoardIndicators = (
  queryParams: z.infer<typeof DashboardIndicatorQuerySchema>,
) => {
  return useQuery({
    queryKey: ['indicators', queryParams],
    queryFn: () => indicatorApiRequest.getDashboardIndicators(queryParams),
  });
};

/** Tổng quan dashboard; nhận ngày dạng `yyyy-MM-dd` (BE tự hiểu kỳ 1 ngày) */
export const useDashboardOverview = (query: { fromDate?: string; toDate?: string } = {}) =>
  useQuery({
    queryKey: ['dashboard-overview', query.fromDate ?? '', query.toDate ?? ''],
    queryFn: () => dashboardOverviewApiRequest.get(query),
    staleTime: 30_000,
  });
