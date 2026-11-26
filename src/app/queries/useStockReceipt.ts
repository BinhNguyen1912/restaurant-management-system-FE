import { stockReceiptApiRequest, CreateStockReceiptBodyType } from '@/apiRequest/stockReceipt';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/** Lịch sử nhập hàng của 1 nguyên liệu */
export const useGetStockReceipts = (ingredientId: number, enabled = true) =>
  useQuery({
    queryKey: ['stock-receipts', ingredientId],
    queryFn: () => stockReceiptApiRequest.list(ingredientId),
    enabled: enabled && ingredientId > 0,
  });

export const useCreateStockReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ingredientId, body }: { ingredientId: number; body: CreateStockReceiptBodyType }) =>
      stockReceiptApiRequest.create(ingredientId, body),
    onSuccess: (_data, variables) => {
      // tồn kho + giá vốn đổi -> bảng nguyên liệu và lịch sử nhập phải làm mới
      queryClient.invalidateQueries({ queryKey: ['stock-receipts', variables.ingredientId] });
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    },
  });
};
