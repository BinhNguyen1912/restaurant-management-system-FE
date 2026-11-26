import http from '@/lib/http';

export type StockReceiptType = {
  id: number;
  ingredientId: number;
  quantity: number;
  unitCost: number;
  supplier: string | null;
  note: string | null;
  images: string[];
  stockAfter: number;
  receivedAt: string;
  createdById: number | null;
  createdByName?: string | null;
};

export type CreateStockReceiptBodyType = {
  quantity: number;
  unitCost?: number;
  supplier?: string;
  note?: string;
  images?: string[];
};

const prefix = '/ingredients';

export const stockReceiptApiRequest = {
  /** Nhập hàng: BE cộng dồn tồn kho, trả tồn mới + giá vốn mới */
  create: (ingredientId: number, body: CreateStockReceiptBodyType) =>
    http.post<{ data: { receipt: StockReceiptType; stock: number; unitCost: number } }>(
      `${prefix}/${ingredientId}/receipts`,
      body,
    ),
  list: (ingredientId: number) =>
    http.get<{ message: string; data: StockReceiptType[] }>(`${prefix}/${ingredientId}/receipts`),
};
