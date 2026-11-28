import http from '@/lib/http';
import {
  CustomerDetailResType,
  CustomerListResType,
  CustomerOpenOrdersResType,
  CustomerPointsResType,
  CustomerReportResType,
  RedeemPointsBodyType,
  RedeemPointsResType,
} from '@/app/ValidationSchemas/customer.schema';

export const customerApiRequest = {
  list: (params: { page?: number; limit?: number; search?: string; sort?: 'newest' | 'name' }) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);
    const qs = query.toString();
    return http.get<CustomerListResType>(`/customers${qs ? `?${qs}` : ''}`);
  },
  detail: (id: number) => http.get<CustomerDetailResType>(`/customers/${id}`),
  points: (id: number) => http.get<CustomerPointsResType>(`/customers/${id}/points`),
  openOrders: (id: number) => http.get<CustomerOpenOrdersResType>(`/customers/${id}/open-orders`),
  redeemPoints: (id: number, body: RedeemPointsBodyType & { reason?: string }) =>
    http.post<RedeemPointsResType>(`/customers/${id}/points/redeem`, body),
  updateNote: (id: number, note: string | null) =>
    http.patch<{ message: string; data: { id: number; note: string | null } }>(`/customers/${id}/note`, {
      note,
    }),
  report: (params: { fromDate?: string; toDate?: string; branchId?: number }) => {
    const query = new URLSearchParams();
    if (params.fromDate) query.set('fromDate', params.fromDate);
    if (params.toDate) query.set('toDate', params.toDate);
    if (params.branchId) query.set('branchId', String(params.branchId));
    const qs = query.toString();
    return http.get<CustomerReportResType>(`/customers/report/overview${qs ? `?${qs}` : ''}`);
  },
};
