import {
  LedgerEntryListTypeRes,
  LedgerIntegrityTypeRes,
  LedgerRefTypeValue,
} from '@/app/ValidationSchemas/ledger-entry.schema';
import http from '@/lib/http';

export type LedgerEntryQuery = {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
  refType?: LedgerRefTypeValue;
  status?: 'DRAFT' | 'POSTED';
  accountCode?: string;
  search?: string;
};

export const ledgerEntryApiRequest = {
  list: (query: LedgerEntryQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    const qs = params.toString();
    return http.get<LedgerEntryListTypeRes>(`/ledger/entries${qs ? `?${qs}` : ''}`);
  },
  integrity: () => http.get<LedgerIntegrityTypeRes>('/ledger/integrity'),
};
