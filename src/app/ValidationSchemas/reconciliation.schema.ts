import { z } from 'zod';

export const reconciliationSchema = z.object({
  fromDate: z.string().nullable(),
  toDate: z.string().nullable(),
  branchId: z.number().nullable(),
  methods: z.array(
    z.object({
      method: z.enum(['CASH', 'VNPAY']),
      accountCode: z.string(),
      payments: z.number(),
      paymentAmount: z.number(),
      ledgerAmount: z.number(),
      difference: z.number(),
    }),
  ),
  totals: z.object({
    paymentAmount: z.number(),
    ledgerAmount: z.number(),
    difference: z.number(),
  }),
  vnpayClearingBalance: z.number(),
  paymentsWithoutEntry: z.array(
    z.object({ paymentId: z.number(), method: z.string().nullable(), amount: z.number() }),
  ),
  checkedAt: z.string(),
});
export type ReconciliationTypeRes = z.infer<typeof reconciliationSchema>;

export const settleVnpayBodySchema = z.object({
  amount: z.coerce.number().positive('Số tiền phải lớn hơn 0'),
  reference: z.string().trim().min(3, 'Mã đối soát quá ngắn').max(120),
  note: z.string().trim().max(500).optional(),
});
export type SettleVnpayBodyType = z.infer<typeof settleVnpayBodySchema>;

/**
 * Đối soát LƯU LỊCH SỬ (BE ticket #13): mỗi lần chạy là 1 run, sai lệch là từng item.
 * Khác với `reconciliationSchema` ở trên (bản tính live, không lưu).
 */
export const reconciliationItemSchema = z.object({
  id: z.number(),
  kind: z.enum(['MATCHED', 'MISSING_IN_LEDGER', 'AMOUNT_MISMATCH', 'DUPLICATE', 'STATUS_MISMATCH']),
  refType: z.enum(['PAYMENT', 'VNPAY']),
  refId: z.number(),
  paymentId: z.number().nullable(),
  ledgerEntryId: z.number().nullable(),
  transactionId: z.string().nullable(),
  amountExpected: z.number(),
  amountActual: z.number(),
  amountDelta: z.number(),
  status: z.enum(['OPEN', 'RESOLVED', 'IGNORED']),
  detail: z.any().nullable(),
});
export type ReconciliationItemType = z.infer<typeof reconciliationItemSchema>;

export const reconciliationRunSchema = z.object({
  id: z.number(),
  periodFrom: z.string(),
  periodTo: z.string(),
  branchId: z.number().nullable(),
  branchCode: z.string().nullable(),
  status: z.enum(['RUNNING', 'COMPLETED', 'FAILED']),
  summary: z
    .object({
      byKind: z.record(z.string(), z.number()).optional(),
      paymentsChecked: z.number().optional(),
      expectedTotal: z.string().optional(),
      actualTotal: z.string().optional(),
      difference: z.string().optional(),
      absDifference: z.string().optional(),
      vnpay: z
        .object({
          candidates: z.number(),
          checked: z.number(),
          skippedReason: z.string().nullable(),
        })
        .optional(),
    })
    .nullable(),
  itemCount: z.number().optional(),
  error: z.string().nullable().optional(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
});
export type ReconciliationRunType = z.infer<typeof reconciliationRunSchema>;

export const reconciliationRunDetailSchema = z.object({
  message: z.string(),
  run: reconciliationRunSchema,
  items: z.array(reconciliationItemSchema),
});
export type ReconciliationRunDetailType = z.infer<typeof reconciliationRunDetailSchema>;
