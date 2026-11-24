import { z } from 'zod';

/**
 * Nhật ký thao tác nhạy cảm (BE ticket #10). Chỉ đọc — không có API sửa/xoá.
 */
export const auditLogSchema = z.object({
  id: z.number(),
  actorId: z.number().nullable(),
  actorRole: z.string().nullable(),
  actorName: z.string().nullable(),
  action: z.enum([
    'ORDER_CANCELLED',
    'ORDER_DISCOUNT_CHANGED',
    'ORDER_PRICE_CHANGED',
    'PRODUCT_PRICE_CHANGED',
    'PAYMENT_REFUNDED',
  ]),
  entityType: z.enum(['ORDER', 'PRODUCT', 'SKU', 'PAYMENT']),
  entityId: z.number(),
  before: z.any().nullable(),
  after: z.any().nullable(),
  reason: z.string().nullable(),
  branchId: z.number().nullable(),
  createdAt: z.string(),
});
export type AuditLogType = z.infer<typeof auditLogSchema>;

export const auditLogListSchema = z.object({
  message: z.string(),
  data: z.array(auditLogSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type AuditLogListTypeRes = z.infer<typeof auditLogListSchema>;
