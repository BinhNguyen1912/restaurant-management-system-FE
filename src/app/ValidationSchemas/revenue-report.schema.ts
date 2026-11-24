import { z } from 'zod';

/**
 * Báo cáo doanh thu đọc từ projection `DailyBranchSummary` (BE ticket #09).
 * Số liệu lấy từ sổ cái → trang này và trang Nhật ký sổ cái luôn khớp nhau.
 */
export const revenueReportRowSchema = z.object({
  date: z.string(),
  branchId: z.number(),
  branchCode: z.string(),
  branchName: z.string(),
  currency: z.string(),
  gross: z.number(),
  discount: z.number(),
  serviceCharge: z.number(),
  tip: z.number(),
  tax: z.number(),
  net: z.number(),
  grandTotal: z.number(),
  cashIn: z.number(),
  vnpayIn: z.number(),
  refund: z.number(),
  cogs: z.number(),
  orderCount: z.number(),
});
export type RevenueReportRowType = z.infer<typeof revenueReportRowSchema>;

export const revenueReportSchema = z.object({
  message: z.string(),
  fromDate: z.string(),
  toDate: z.string(),
  branchId: z.number().nullable(),
  rows: z.array(revenueReportRowSchema),
  totals: z.object({
    gross: z.number(),
    discount: z.number(),
    serviceCharge: z.number(),
    tip: z.number(),
    tax: z.number(),
    net: z.number(),
    grandTotal: z.number(),
    cashIn: z.number(),
    vnpayIn: z.number(),
    refund: z.number(),
    cogs: z.number(),
    orderCount: z.number(),
  }),
  byMethod: z.array(
    z.object({
      method: z.enum(['CASH', 'VNPAY']),
      amount: z.number(),
    }),
  ),
});
export type RevenueReportTypeRes = z.infer<typeof revenueReportSchema>;

export const revenueByItemSchema = z.object({
  message: z.string(),
  fromDate: z.string(),
  toDate: z.string(),
  branchId: z.number().nullable(),
  rows: z.array(
    z.object({
      productId: z.number().nullable(),
      name: z.string(),
      quantity: z.number(),
      revenue: z.number(),
    }),
  ),
});
export type RevenueByItemTypeRes = z.infer<typeof revenueByItemSchema>;
