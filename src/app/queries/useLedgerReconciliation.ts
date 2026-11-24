import { ledgerReconciliationApiRequest } from '@/apiRequest/ledgerReconciliation';
import { SettleVnpayBodyType } from '@/app/ValidationSchemas/reconciliation.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEY = ['ledger-reconciliation'];

export const useGetReconciliation = (query: { fromDate?: string; toDate?: string }) => {
  return useQuery({
    queryKey: [...QUERY_KEY, query],
    queryFn: () => ledgerReconciliationApiRequest.get(query),
  });
};

export const useReconciliationRuns = (query: { fromDate?: string; toDate?: string } = {}) => {
  return useQuery({
    queryKey: ['reconciliation-runs', query],
    queryFn: () => ledgerReconciliationApiRequest.runs(query),
  });
};

export const useReconciliationRunDetail = (id: number | null) => {
  return useQuery({
    queryKey: ['reconciliation-run', id],
    queryFn: () => ledgerReconciliationApiRequest.runDetail(id as number),
    enabled: !!id,
  });
};

export const useRunReconciliation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { fromDate?: string; toDate?: string }) =>
      ledgerReconciliationApiRequest.runReconciliation(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-runs'] });
      queryClient.invalidateQueries({ queryKey: ['ledger-reconciliation'] });
    },
  });
};

export const useResolveReconciliationItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'RESOLVED' | 'IGNORED' }) =>
      ledgerReconciliationApiRequest.resolveItem(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliation-run'] });
      queryClient.invalidateQueries({ queryKey: ['reconciliation-runs'] });
    },
  });
};

export const useSettleVnpay = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SettleVnpayBodyType) => ledgerReconciliationApiRequest.settle(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['ledger-integrity'] });
      queryClient.invalidateQueries({ queryKey: ['ledger-entries'] });
    },
  });
};
