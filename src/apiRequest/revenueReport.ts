import {
  RevenueByItemTypeRes,
  RevenueReportTypeRes,
} from '@/app/ValidationSchemas/revenue-report.schema';
import http from '@/lib/http';

export type ReportRangeQuery = { fromDate?: string; toDate?: string; branchId?: number };

const toQueryString = (query: ReportRangeQuery) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

export const revenueReportApiRequest = {
  get: (query: ReportRangeQuery = {}) =>
    http.get<RevenueReportTypeRes>(`/reports/revenue${toQueryString(query)}`),
  byItem: (query: ReportRangeQuery = {}) =>
    http.get<RevenueByItemTypeRes>(`/reports/revenue/by-item${toQueryString(query)}`),
  /** Tính lại projection cho kỳ (job đọc sổ cái -> bảng tổng hợp) */
  recompute: (body: ReportRangeQuery = {}) =>
    http.post<{ written: number; cleared: number }>('/reports/revenue/recompute', body),
};
