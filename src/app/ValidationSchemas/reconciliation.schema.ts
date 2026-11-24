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
