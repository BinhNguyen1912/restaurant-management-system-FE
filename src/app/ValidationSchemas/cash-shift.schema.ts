import { z } from 'zod';

export const cashShiftStatusSchema = z.enum(['OPEN', 'CLOSED']);
export const cashMovementTypeSchema = z.enum(['IN', 'OUT']);

export const cashMovementSchema = z.object({
  id: z.number(),
  shiftId: z.number(),
  type: cashMovementTypeSchema,
  reason: z.string(),
  amount: z.number(),
  /** Ảnh/video chứng từ (hoá đơn, biên nhận) */
  evidenceUrls: z.array(z.string()).default([]),
  createdById: z.number().nullable(),
  createdAt: z.string(),
});
export type CashMovementTypeRes = z.infer<typeof cashMovementSchema>;

export const cashShiftSchema = z.object({
  id: z.number(),
  branchId: z.number(),
  staffId: z.number(),
  status: cashShiftStatusSchema,
  openedAt: z.string(),
  closedAt: z.string().nullable(),
  openingFloat: z.number(),
  countedCash: z.number().nullable(),
  expectedCash: z.number().nullable(),
  variance: z.number().nullable(),
  cashIn: z.number(),
  cashOut: z.number(),
  note: z.string().nullable(),
  ledgerEntryId: z.number().nullable(),
  closedById: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CashShiftTypeRes = z.infer<typeof cashShiftSchema>;

export const cashShiftLiveTotalsSchema = z.object({
  openingFloat: z.number(),
  cashIn: z.number(),
  cashInMovements: z.number(),
  cashOut: z.number(),
  expectedCash: z.number(),
  unpaidCashOrders: z.number(),
});
export type CashShiftLiveTotalsType = z.infer<typeof cashShiftLiveTotalsSchema>;

/** Một khoản thu tiền mặt từ đơn trong ca — giải thích `cashIn` gồm những gì */
export const cashShiftPaymentRowSchema = z.object({
  paymentId: z.number(),
  amount: z.number(),
  paidAt: z.string().nullable(),
  method: z.string().nullable(),
  orderIds: z.array(z.number()),
});
export type CashShiftPaymentRowType = z.infer<typeof cashShiftPaymentRowSchema>;

export const cashShiftDetailSchema = cashShiftSchema.extend({
  movements: z.array(cashMovementSchema),
  liveTotals: cashShiftLiveTotalsSchema.optional(),
  cashPayments: z.array(cashShiftPaymentRowSchema).optional(),
});
export type CashShiftDetailTypeRes = z.infer<typeof cashShiftDetailSchema>;

export const cashShiftListSchema = z.object({
  data: z.array(cashShiftSchema),
  totalItems: z.number(),
  totalPages: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type CashShiftListTypeRes = z.infer<typeof cashShiftListSchema>;

export const openCashShiftBodySchema = z.object({
  openingFloat: z.coerce
    .number()
    .min(0, 'Tiền lẻ đầu ca không âm')
    .max(1_000_000_000, 'Tiền lẻ đầu ca quá lớn'),
  note: z.string().trim().max(500).optional(),
});
export type OpenCashShiftBodyType = z.infer<typeof openCashShiftBodySchema>;

export const closeCashShiftBodySchema = z.object({
  countedCash: z.coerce
    .number()
    .min(0, 'Tiền đếm được không âm')
    .max(10_000_000_000, 'Tiền đếm được quá lớn'),
  note: z.string().trim().max(500).optional(),
});
export type CloseCashShiftBodyType = z.infer<typeof closeCashShiftBodySchema>;

export const createCashMovementBodySchema = z.object({
  type: cashMovementTypeSchema,
  reason: z.string().trim().min(1, 'Phải ghi lý do thu/chi').max(255),
  amount: z.coerce.number().positive('Số tiền phải lớn hơn 0'),
  /** Upload qua POST /media/upload (ảnh ≤5MB, video ≤30MB), tối đa 5 chứng từ */
  evidenceUrls: z.array(z.string()).max(5, 'Tối đa 5 chứng từ').optional(),
});
export type CreateCashMovementBodyType = z.infer<
  typeof createCashMovementBodySchema
>;

export const CASH_MOVEMENT_LABEL: Record<
  z.infer<typeof cashMovementTypeSchema>,
  string
> = {
  IN: 'Thu tiền vào két',
  OUT: 'Chi tiền ra khỏi két',
};
