import { z } from 'zod';

export const VoucherTypeSchema = z.enum(['PERCENT', 'FIXED']);
export const VoucherStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']);

/** Form tạo/sửa mã giảm giá. Ngày nhập dạng `datetime-local` nên là string. */
export const CreateVoucherBody = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'Mã tối thiểu 3 ký tự')
      .max(50, 'Mã tối đa 50 ký tự')
      .regex(/^[A-Za-z0-9_-]+$/, 'Chỉ dùng chữ, số, gạch ngang/gạch dưới'),
    discountType: VoucherTypeSchema,
    // trần theo cột Decimal(14,2) của BE
    discountValue: z.coerce
      .number()
      .positive('Giá trị giảm phải lớn hơn 0')
      .max(1_000_000_000, 'Giá trị giảm quá lớn'),
    startAt: z.string().min(1, 'Chọn thời gian bắt đầu'),
    endAt: z.string().min(1, 'Chọn thời gian kết thúc'),
    /** chuỗi rỗng = không giới hạn lượt */
    usageLimit: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === 'PERCENT' && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: 'Giảm theo % không được vượt 100',
      });
    }
    if (new Date(data.endAt).getTime() <= new Date(data.startAt).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endAt'],
        message: 'Kết thúc phải sau bắt đầu',
      });
    }
    if (
      data.usageLimit &&
      (!/^\d+$/.test(data.usageLimit) || Number(data.usageLimit) < 1 || Number(data.usageLimit) > 1_000_000)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['usageLimit'],
        message: 'Số lượt phải là số nguyên dương, tối đa 1.000.000 (để trống = không giới hạn)',
      });
    }
  });

export type CreateVoucherBodyType = z.infer<typeof CreateVoucherBody>;

/** body gửi lên BE: ngày đổi sang ISO, số lượt là number|null */
export type VoucherPayloadType = {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  startAt: string;
  endAt: string;
  usageLimit: number | null;
};

export type VoucherResType = {
  id: number;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  startAt: string;
  endAt: string;
  usageLimit: number | null;
  usedCount: number;
  usableNow: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
};

export type VoucherListResType = {
  message: string;
  data: VoucherResType[];
  totalItems: number;
  page: number;
  limit: number;
};
