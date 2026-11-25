import {
  DashboardIndicatorQuerySchema,
  DashboardIndicatorType,
} from '@/app/ValidationSchemas/dashboard.model';
import http from '@/lib/http';
import { z } from 'zod';

const indicatorApiRequest = {
  getDashboardIndicators: (
    queryParams: z.infer<typeof DashboardIndicatorQuerySchema>,
  ) =>
    http.post<DashboardIndicatorType>('/dashboard/indicator', {
      fromDate: queryParams.fromDate,
      toDate: queryParams.toDate,
    }),
};
export default indicatorApiRequest;

/** Tổng quan: 4 ô tiền + so sánh doanh thu thuần với kỳ trước / cùng kỳ tháng trước */
export type DashboardOverviewType = {
  message: string;
  data: {
    fromDate: string;
    toDate: string;
    branchId: number | null;
    gross: number;
    tax: number;
    grandTotal: number;
    net: number;
    refund: number;
    orderCount: number;
    previous: { fromDate: string; toDate: string; orderCount: number; net: number };
    lastMonth: { fromDate: string; toDate: string; orderCount: number; net: number };
    changeVsPrevious: number | null;
    changeVsLastMonth: number | null;
  };
};

export const dashboardOverviewApiRequest = {
  get: (query: { fromDate?: string; toDate?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    const qs = params.toString();
    return http.get<DashboardOverviewType>(`/dashboard/overview${qs ? `?${qs}` : ''}`);
  },
};
