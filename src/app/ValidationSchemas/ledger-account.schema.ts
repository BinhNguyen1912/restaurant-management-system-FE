import { z } from 'zod';

export const ledgerAccountTypeSchema = z.enum([
  'ASSET',
  'LIABILITY',
  'EQUITY',
  'REVENUE',
  'EXPENSE',
]);
export type LedgerAccountType = z.infer<typeof ledgerAccountTypeSchema>;

export const ledgerAccountSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  type: ledgerAccountTypeSchema,
  isCash: z.boolean(),
  isSystem: z.boolean(),
  isActive: z.boolean(),
  currency: z.string(),
  totalDebit: z.number(),
  totalCredit: z.number(),
  balance: z.number(),
  normalSide: z.enum(['DEBIT', 'CREDIT']),
  lineCount: z.number(),
});
export type LedgerAccountTypeRes = z.infer<typeof ledgerAccountSchema>;

export const getLedgerAccountsResSchema = z.object({
  message: z.string(),
  data: z.array(ledgerAccountSchema),
});
export type GetLedgerAccountsResType = z.infer<
  typeof getLedgerAccountsResSchema
>;

export const createLedgerAccountBodySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(
      /^[A-Z][A-Z0-9_]{2,49}$/,
      'Mã chỉ gồm A-Z, 0-9, _ và bắt đầu bằng chữ cái',
    ),
  name: z.string().trim().min(1, 'Nhập tên tài khoản').max(255),
  type: ledgerAccountTypeSchema,
});
export type CreateLedgerAccountBodyType = z.infer<
  typeof createLedgerAccountBodySchema
>;

export const updateLedgerAccountBodySchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  type: ledgerAccountTypeSchema.optional(),
  isActive: z.boolean().optional(),
});
export type UpdateLedgerAccountBodyType = z.infer<
  typeof updateLedgerAccountBodySchema
>;

export const LEDGER_ACCOUNT_TYPE_LABEL: Record<LedgerAccountType, string> = {
  ASSET: 'Tài sản',
  LIABILITY: 'Nợ phải trả',
  EQUITY: 'Vốn chủ',
  REVENUE: 'Doanh thu',
  EXPENSE: 'Chi phí',
};
