import { formatCurrency } from '@/lib/utils';

export type OrderMoneyBreakdownProps = {
  subtotal: number;
  discountTotal?: number;
  serviceChargeAmount: number;
  serviceChargeRate?: number;
  taxTotal: number;
  taxRate?: number;
  pricesIncludeTax?: boolean;
  grandTotal: number;
  /** hiện dòng tổng to hơn (giỏ hàng/thanh toán) */
  emphasizeTotal?: boolean;
};

/**
 * Breakdown tiền dùng chung: Tạm tính → Giảm giá → Phí phục vụ → VAT → Tổng.
 * Thuế hiển thị rõ là "đã gồm trong giá" hay "cộng thêm" để khách không thắc mắc.
 */
export default function OrderMoneyBreakdown({
  subtotal,
  discountTotal = 0,
  serviceChargeAmount,
  serviceChargeRate,
  taxTotal,
  taxRate,
  pricesIncludeTax,
  grandTotal,
  emphasizeTotal,
}: OrderMoneyBreakdownProps) {
  return (
    <div className="grid gap-1 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Tạm tính</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      {discountTotal > 0 ? (
        <div className="flex justify-between text-emerald-600">
          <span>Giảm giá</span>
          <span>-{formatCurrency(discountTotal)}</span>
        </div>
      ) : null}

      {serviceChargeAmount > 0 ? (
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Phí phục vụ{serviceChargeRate ? ` (${serviceChargeRate}%)` : ''}
          </span>
          <span>{formatCurrency(serviceChargeAmount)}</span>
        </div>
      ) : null}

      {taxTotal > 0 ? (
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            VAT{taxRate ? ` ${taxRate}%` : ''}
            {pricesIncludeTax ? ' (đã gồm trong giá)' : ' (cộng thêm)'}
          </span>
          <span>{formatCurrency(taxTotal)}</span>
        </div>
      ) : null}

      <div
        className={
          emphasizeTotal
            ? 'mt-1 flex justify-between border-t pt-2 text-base font-bold'
            : 'mt-1 flex justify-between border-t pt-2 font-semibold'
        }
      >
        <span>Tổng cộng</span>
        <span className="text-red-600">{formatCurrency(grandTotal)}</span>
      </div>
    </div>
  );
}
