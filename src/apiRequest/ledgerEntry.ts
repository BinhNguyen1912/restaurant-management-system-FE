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

/** Sổ quỹ: 2 tài khoản quỹ + dòng tổng, mỗi dòng 4 con số của kỳ */
export type CashBookAccountType = {
  code: string;
  name: string;
  opening: number;
  inflow: number;
  outflow: number;
  closing: number;
};

export type CashBookResType = {
  message: string;
  data: {
    fromDate: string;
    toDate: string;
    branchId: number | null;
    accounts: CashBookAccountType[];
    total: Omit<CashBookAccountType, 'code' | 'name'>;
  };
};

export type CashBookLineType = {
  id: number;
  occurredAt: string;
  refType: string;
  refId: number;
  memo: string | null;
  accountCode: string;
  accountName: string;
  direction: 'DEBIT' | 'CREDIT';
  amount: number;
  orderId: number | null;
  paymentId: number | null;
};

export type CashBookLinesResType = {
  message: string;
  data: {
    fromDate: string;
    toDate: string;
    branchId: number | null;
    totalItems: number;
    page: number;
    limit: number;
    inflow: number;
    outflow: number;
    lines: CashBookLineType[];
  };
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
  /** Các dòng của sổ quỹ — chứng minh cho 4 thẻ số */
  cashBookLines: (query: {
    fromDate?: string;
    toDate?: string;
    branchId?: number;
    account?: 'CASH' | 'BANK';
    page?: number;
    limit?: number;
  } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    const qs = params.toString();
    return http.get<CashBookLinesResType>(`/ledger/cash-book/lines${qs ? `?${qs}` : ''}`);
  },
  cashBook: (query: { fromDate?: string; toDate?: string; branchId?: number } = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    const qs = params.toString();
    return http.get<CashBookResType>(`/ledger/cash-book${qs ? `?${qs}` : ''}`);
  },
};
