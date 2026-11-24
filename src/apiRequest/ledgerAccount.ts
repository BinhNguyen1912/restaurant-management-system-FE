import {
  CreateLedgerAccountBodyType,
  GetLedgerAccountsResType,
  UpdateLedgerAccountBodyType,
} from '@/app/ValidationSchemas/ledger-account.schema';
import http from '@/lib/http';

const prefix = '/ledger-accounts';

export const ledgerAccountApiRequest = {
  list: () => http.get<GetLedgerAccountsResType>(prefix),
  create: (body: CreateLedgerAccountBodyType) =>
    http.post<{ message: string; data: unknown }>(prefix, body),
  update: (id: number, body: UpdateLedgerAccountBodyType) =>
    http.put<{ message: string; data: unknown }>(`${prefix}/${id}`, body),
  delete: (id: number) =>
    http.delete<{ message: string; data: unknown }>(`${prefix}/${id}`),
};
