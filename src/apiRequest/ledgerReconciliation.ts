import {
  ReconciliationItemType,
  ReconciliationRunDetailType,
  ReconciliationRunType,
  ReconciliationTypeRes,
  SettleVnpayBodyType,
} from '@/app/ValidationSchemas/reconciliation.schema';
import http from '@/lib/http';

export const ledgerReconciliationApiRequest = {
  get: (query: { fromDate?: string; toDate?: string } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    return http.get<ReconciliationTypeRes>(`/ledger/reconciliation${qs ? `?${qs}` : ''}`);
  },
  settle: (body: SettleVnpayBodyType) => http.post<{ data: unknown }>('/ledger/vnpay-clearing/settle', body),
  /** chạy đối soát 1 kỳ và LƯU lại (BE ticket #13) */
  runReconciliation: (body: { fromDate?: string; toDate?: string }) =>
    http.post<{ run: ReconciliationRunType }>('/reconciliation/runs', body),
  runs: (query: { fromDate?: string; toDate?: string; branchId?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    });
    const qs = params.toString();
    return http.get<{ data: ReconciliationRunType[] }>(`/reconciliation/runs${qs ? `?${qs}` : ''}`);
  },
  runDetail: (id: number) => http.get<ReconciliationRunDetailType>(`/reconciliation/runs/${id}`),
  resolveItem: (id: number, status: 'RESOLVED' | 'IGNORED') =>
    http.post<{ item: ReconciliationItemType }>(`/reconciliation/items/${id}/status`, { status }),
};
