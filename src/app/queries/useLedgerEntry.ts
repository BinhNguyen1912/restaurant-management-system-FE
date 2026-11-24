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
