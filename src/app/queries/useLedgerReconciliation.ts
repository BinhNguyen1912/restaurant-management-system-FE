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
