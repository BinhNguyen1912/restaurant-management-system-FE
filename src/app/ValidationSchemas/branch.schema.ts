import { z } from 'zod';

export const branchSettingsSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  taxRate: z.number(),
  serviceChargeRate: z.number(),
  pricesIncludeTax: z.boolean(),
});
export type BranchSettingsTypeRes = z.infer<typeof branchSettingsSchema>;

export const branchListSchema = z.object({
  data: z.array(branchSettingsSchema),
});
export type BranchListTypeRes = z.infer<typeof branchListSchema>;

export const updateBranchSettingsBodySchema = z.object({
  taxRate: z.coerce.number().min(0, 'VAT không âm').max(100, 'VAT tối đa 100%'),
  serviceChargeRate: z.coerce
    .number()
    .min(0, 'Phí phục vụ không âm')
    .max(100, 'Phí phục vụ tối đa 100%'),
  pricesIncludeTax: z.boolean(),
});
export type UpdateBranchSettingsBodyType = z.infer<
  typeof updateBranchSettingsBodySchema
>;

/**
 * Số nhân viên / bàn / đơn đang gắn với chi nhánh — dùng để cảnh báo trước khi cho ngừng
 * hoạt động một chi nhánh đang có dữ liệu.
 */
export const branchUsageSchema = z
  .object({ users: z.number(), tables: z.number(), orders: z.number() })
  .optional();
export type BranchUsageType = z.infer<typeof branchUsageSchema>;

export const branchRowSchema = branchSettingsSchema.extend({ usage: branchUsageSchema });
export type BranchRowType = z.infer<typeof branchRowSchema>;

export const createBranchBodySchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Mã chi nhánh tối thiểu 2 ký tự')
    .max(50, 'Mã chi nhánh tối đa 50 ký tự'),
  name: z.string().trim().min(2, 'Tên chi nhánh tối thiểu 2 ký tự').max(255),
  address: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional(),
});
export type CreateBranchBodyType = z.infer<typeof createBranchBodySchema>;

export const updateBranchBodySchema = createBranchBodySchema.partial();
export type UpdateBranchBodyType = z.infer<typeof updateBranchBodySchema>;
