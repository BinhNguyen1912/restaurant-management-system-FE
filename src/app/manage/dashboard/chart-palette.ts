/**
 * Bảng màu cho biểu đồ dashboard.
 *
 * Không dùng `--chart-1..5` của shadcn vì bộ đó chỉ có 5 màu và khá nhạt; ở đây cần dải màu
 * rõ ràng cho top món (mỗi cột một màu) và 2 màu tương phản cho Tiền mặt / Chuyển khoản.
 * Màu đặt ở một chỗ để 2 biểu đồ không lệch nhau.
 */
export const CHART_PALETTE = [
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
  '#3b82f6', // blue
] as const;

/** Màu cố định cho từng loại tiền, để "Tiền mặt" luôn cùng một màu ở mọi biểu đồ */
export const MONEY_COLORS = {
  cash: '#10b981', // emerald
  vnpay: '#6366f1', // indigo
  gross: '#6366f1',
  discount: '#f43f5e',
  serviceCharge: '#f59e0b',
  tax: '#8b5cf6',
  tip: '#06b6d4',
  net: '#10b981',
} as const;

export const colorAt = (index: number) => CHART_PALETTE[index % CHART_PALETTE.length];
