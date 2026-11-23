import { ledgerAccountApiRequest } from '@/apiRequest/ledgerAccount';
import {
  CreateLedgerAccountBodyType,
  UpdateLedgerAccountBodyType,
} from '@/app/ValidationSchemas/ledger-account.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEY = ['ledger-accounts'];

export const useGetLedgerAccounts = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: ledgerAccountApiRequest.list,
  });
};

export const useCreateLedgerAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateLedgerAccountBodyType) =>
      ledgerAccountApiRequest.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateLedgerAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: UpdateLedgerAccountBodyType;
    }) => ledgerAccountApiRequest.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteLedgerAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ledgerAccountApiRequest.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
