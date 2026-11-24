import {
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
};
