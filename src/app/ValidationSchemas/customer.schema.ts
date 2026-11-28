import { z } from 'zod';

/**
 * Hồ sơ khách hàng (CRM) — hình dạng dữ liệu BE trả về.
 *
 * Cố ý KHÔNG khai báo lại công thức điểm ở FE: BE gửi kèm `vndPerPoint`, `pointValueVnd`,
 * `minRedeemPoints`. Đổi chính sách tích điểm sau này thì màn hình tự đúng, không phải sửa hai nơi
 * rồi lệch nhau.
 */

export type CustomerStatsType = {
  orderCount: number;
  totalSpend: number;
  avgSpend: number;
  reservationCount: number;
  firstVisitAt: string | null;
  lastVisitAt: string | null;
};

export type CustomerPointsType = {
  earned: number;
  spent: number;
  balance: number;
  vndPerPoint: number;
  pointValueVnd: number;
  minRedeemPoints: number;
};

export type CustomerType = {
  id: number;
  phone: string;
  name: string;
  email: string | null;
  note: string | null;
  userId: number | null;
  stats: CustomerStatsType;
  points: CustomerPointsType;
  createdAt: string;
  updatedAt: string;
};

export type CustomerOrderType = {
  id: number;
  status: string;
  grandTotal: number;
  branchName: string;
  tableName: string | null;
  createdAt: string;
};

export type CustomerReservationType = {
  id: number;
  reservationTime: string;
  guestCount: number;
  status: string;
  branchName: string;
  tableName: string | null;
};

export type CustomerDetailType = CustomerType & {
  recentOrders: CustomerOrderType[];
  recentReservations: CustomerReservationType[];
};

/** Hai loại dòng lịch sử KHÁC hình dạng — union phân biệt theo `type` để không đọc field optional. */
export type CustomerPointEntryType =
  | { type: 'EARNED'; at: string; points: number; orderId: number; amount: number; branchName: string }
  | {
      type: 'REDEEMED';
      at: string;
      points: number;
      orderId: number | null;
      valueVnd: number;
      /** đơn đã huỷ ⇒ điểm được trả lại */
      voided: boolean;
    };

export type CustomerListResType = {
  message: string;
  data: CustomerType[];
  totalItems: number;
  page: number;
  limit: number;
};

export type CustomerDetailResType = { message: string; data: CustomerDetailType };

/**
 * Đơn còn trừ được điểm của khách — BE tính sẵn `maxRedeemPoints` (trần theo hoá đơn) để FE không
 * cho chọn số điểm vượt quá số tiền còn phải trả.
 */
export type CustomerOpenOrderType = {
  id: number;
  status: string;
  grandTotal: number;
  /** còn phải trả = subtotal − discountTotal */
  payable: number;
  maxRedeemPoints: number;
  branchName: string;
  tableName: string | null;
  createdAt: string;
};

export type CustomerOpenOrdersResType = { message: string; data: CustomerOpenOrderType[] };

export type CustomerPointsResType = {
  message: string;
  data: CustomerPointsType & { history: CustomerPointEntryType[] };
};

export type RedeemPointsResType = {
  message: string;
  data: {
    redemptionId: number;
    points: number;
    valueVnd: number;
    orderId: number;
    /** tổng tiền đơn SAU khi trừ điểm */
    orderGrandTotal: number;
    balance: number;
  };
};

export type CustomerReportResType = {
  message: string;
  data: {
    fromDate: string;
    toDate: string;
    branchId: number | null;
    profileCount: number;
    activeCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    repeatRate: number;
    topCustomers: { id: number; name: string; phone: string; orderCount: number; totalSpend: number }[];
  };
};

/** Form đổi điểm: validate ở FE cho phản hồi nhanh, BE vẫn kiểm lại số dư và tính hợp lệ của đơn. */
export const RedeemPointsBody = z.object({
  orderId: z.coerce.number().int().positive('Chọn hoá đơn cần trừ điểm'),
  points: z.coerce.number().int('Số điểm phải là số nguyên').positive('Số điểm phải lớn hơn 0'),
});

export type RedeemPointsBodyType = z.infer<typeof RedeemPointsBody>;
