import { ledgerEntryApiRequest, LedgerEntryQuery } from '@/apiRequest/ledgerEntry';
import { useQuery } from '@tanstack/react-query';

export const useGetLedgerEntries = (query: LedgerEntryQuery) => {
  return useQuery({
    queryKey: ['ledger-entries', query],
    queryFn: () => ledgerEntryApiRequest.list(query),
  });
};

export const useGetLedgerIntegrity = () => {
  return useQuery({
    queryKey: ['ledger-integrity'],
    queryFn: ledgerEntryApiRequest.integrity,
    refetchInterval: 60_000,
  });
};

export const useGetCashBook = (query: { fromDate?: string; toDate?: string; branchId?: number } = {}) =>
  useQuery({
    queryKey: ['cash-book', query.fromDate ?? '', query.toDate ?? '', query.branchId ?? ''],
    queryFn: () => ledgerEntryApiRequest.cashBook(query),
  });

/** Các dòng của sổ quỹ (phân trang, lọc theo tab CASH/BANK) */
export const useGetCashBookLines = (query: {
  fromDate?: string;
  toDate?: string;
  branchId?: number;
  account?: 'CASH' | 'BANK';
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: ['cash-book-lines', query],
    queryFn: () => ledgerEntryApiRequest.cashBookLines(query),
    staleTime: 15_000,
  });
