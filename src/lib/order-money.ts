/**
 * Bản mirror công thức tiền của BE (`computeOrderMoney`) để FE hiện breakdown TRƯỚC khi đặt món.
 *
 * Quy tắc (giữ đúng như BE):
 * - subtotal = Σ giá × số lượng
 * - phí phục vụ = (subtotal − giảm giá) × rate%
 * - VAT: giá menu đã gồm VAT -> TRÍCH ra (tổng không đổi); chưa gồm -> cộng thêm
 * - làm tròn về ĐỒNG NGUYÊN (VND không có đơn vị lẻ, sổ cái chỉ nhận số nguyên)
 *
 * Khi đơn đã tạo xong thì LUÔN hiện số của server (order.taxTotal/…), không tính lại.
 */
export type OrderMoneyInput = {
  subtotal: number;
  discountTotal?: number;
  serviceChargeRate?: number;
  taxRate?: number;
  pricesIncludeTax?: boolean;
};

export type OrderMoneyBreakdown = {
  subtotal: number;
  discountTotal: number;
  serviceChargeAmount: number;
  taxRate: number;
  taxTotal: number;
  grandTotal: number;
};

const round = (value: number) => Math.round(value);

export function computeOrderMoney(input: OrderMoneyInput): OrderMoneyBreakdown {
  const subtotal = round(input.subtotal);
  const discountTotal = Math.min(round(input.discountTotal ?? 0), subtotal);
  const serviceChargeRate = input.serviceChargeRate ?? 0;
  const taxRate = input.taxRate ?? 0;

  const net = subtotal - discountTotal;
  const serviceChargeAmount = round((net * serviceChargeRate) / 100);
  const billBeforeTax = net + serviceChargeAmount;

  if (taxRate <= 0) {
    return {
      subtotal,
      discountTotal,
      serviceChargeAmount,
      taxRate,
      taxTotal: 0,
      grandTotal: billBeforeTax,
    };
  }

  if (input.pricesIncludeTax !== false) {
    // giá đã gồm VAT: thuế trích ra, tổng không đổi
    const taxTotal = round((billBeforeTax * taxRate) / (100 + taxRate));
    return {
      subtotal,
      discountTotal,
      serviceChargeAmount,
      taxRate,
      taxTotal,
      grandTotal: billBeforeTax,
    };
  }

  const taxTotal = round((billBeforeTax * taxRate) / 100);
  return {
    subtotal,
    discountTotal,
    serviceChargeAmount,
    taxRate,
    taxTotal,
    grandTotal: billBeforeTax + taxTotal,
  };
}
