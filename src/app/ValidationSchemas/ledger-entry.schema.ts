import { z } from 'zod';

export const ledgerRefTypeSchema = z.enum([
  'ORDER_PAID_CASH',
  'ORDER_PAID_VNPAY',
  'RESERVATION_DEPOSIT',
  'DEPOSIT_SETTLED',
  'REFUND',
  'REVERSAL',
  'CASH_VARIANCE',
]);
export type LedgerRefTypeValue = z.infer<typeof ledgerRefTypeSchema>;

export const ledgerEntryStatusSchema = z.enum(['DRAFT', 'POSTED']);

export const ledgerLineSchema = z.object({
  id: z.number(),
  accountCode: z.string(),
  accountName: z.string(),
  direction: z.enum(['DEBIT', 'CREDIT']),
  amount: z.number(),
  orderId: z.number().nullable(),
  paymentId: z.number().nullable(),
});
export type LedgerLineTypeRes = z.infer<typeof ledgerLineSchema>;

export const ledgerEntrySchema = z.object({
  id: z.number(),
  branchId: z.number(),
  occurredAt: z.string(),
  refType: ledgerRefTypeSchema,
  refId: z.number(),
  memo: z.string().nullable(),
  currency: z.string(),
  idempotencyKey: z.string(),
  status: ledgerEntryStatusSchema,
  postedAt: z.string().nullable(),
  reversalOfId: z.number().nullable(),
  debitTotal: z.number(),
  creditTotal: z.number(),
  balanced: z.boolean(),
  lines: z.array(ledgerLineSchema),
});
export type LedgerEntryTypeRes = z.infer<typeof ledgerEntrySchema>;

export const ledgerEntryListSchema = z.object({
  data: z.array(ledgerEntrySchema),
  totalItems: z.number(),
  totalPages: z.number(),
  page: z.number(),
  limit: z.number(),
  totals: z.object({
    debit: z.number(),
    credit: z.number(),
    difference: z.number(),
  }),
});
export type LedgerEntryListTypeRes = z.infer<typeof ledgerEntryListSchema>;

export const ledgerIntegritySchema = z.object({
  ok: z.boolean(),
  totalDebit: z.number(),
  totalCredit: z.number(),
  difference: z.number(),
  postedEntries: z.number(),
  draftEntries: z.number(),
  lineCount: z.number(),
  unbalancedEntries: z.number(),
  staleDrafts: z.number(),
  paidPaymentsWithoutEntry: z.number(),
  checkedAt: z.string(),
});
export type LedgerIntegrityTypeRes = z.infer<typeof ledgerIntegritySchema>;

export const LEDGER_REF_TYPE_LABEL: Record<LedgerRefTypeValue, string> = {
  ORDER_PAID_CASH: 'Thu tiền mặt',
  ORDER_PAID_VNPAY: 'Thu VNPay',
  RESERVATION_DEPOSIT: 'Cọc đặt bàn',
  DEPOSIT_SETTLED: 'Chốt cọc',
  REFUND: 'Hoàn tiền',
  REVERSAL: 'Bút toán đảo',
  CASH_VARIANCE: 'Lệch két',
};
