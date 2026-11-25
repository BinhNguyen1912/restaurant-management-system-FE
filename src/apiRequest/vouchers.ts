import http from '@/lib/http';
import {
  VoucherListResType,
  VoucherPayloadType,
  VoucherResType,
} from '@/app/ValidationSchemas/voucher.schema';

export const voucherApiRequest = {
  list: (params: { page?: number; limit?: number; search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    return http.get<VoucherListResType>(`/vouchers${qs ? `?${qs}` : ''}`);
  },
  detail: (id: number) => http.get<{ message: string; data: VoucherResType }>(`/vouchers/${id}`),
  create: (body: VoucherPayloadType) =>
    http.post<{ message: string; data: VoucherResType }>('/vouchers', body),
  update: (id: number, body: VoucherPayloadType) =>
    http.put<{ message: string; data: VoucherResType }>(`/vouchers/${id}`, body),
  updateStatus: (id: number, status: 'ACTIVE' | 'INACTIVE') =>
    http.patch<{ message: string; data: VoucherResType }>(`/vouchers/${id}/status`, { status }),
  remove: (id: number) => http.delete<{ message: string }>(`/vouchers/${id}`),
};
