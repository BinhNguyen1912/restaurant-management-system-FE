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
