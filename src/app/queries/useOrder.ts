import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import orderApiRequest from '@/apiRequest/order';
import {
  OrderQueryType,
  GuestCreateNewOrderType,
  OrdersListResType,
  UpdateOrderType,
} from '@/app/ValidationSchemas/order.schema';

export const useGetOrderListQuery = (params?: OrderQueryType) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderApiRequest.getOrdersList(params),
    enabled: true,
  });
};

export const useGetOrderDetailQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => orderApiRequest.getOrderDetail(id),
    enabled: enabled && !!id,
  });
};

export const useUpdateOrderMutation = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateOrderType }) =>
      orderApiRequest.updateOrder(id, data),
  });
};

export const useCreateGuestOrderMutation = () => {
  return useMutation({
    mutationFn: ({ data, voucherCode }: { data: GuestCreateNewOrderType; voucherCode?: string }) =>
      orderApiRequest.createGuestOrder(data, voucherCode),
  });
};

export const useCreateOrderForGuestMutation = () => {
  return useMutation({
    mutationFn: ({
      guestId,
      orders,
      voucherCode,
    }: {
      guestId: number;
      orders: GuestCreateNewOrderType;
      voucherCode?: string;
    }) => orderApiRequest.createOrderForGuest(guestId, orders, voucherCode),
  });
};

/**
 * Thu tiền (tiền mặt). Sau khi thu, mọi màn hình tiền phải được làm mới: nếu chỉ refetch danh sách
 * đơn thì sổ quỹ / sổ cái / báo cáo / dashboard vẫn hiện số cũ tới hết `staleTime`.
 */
export const usePayOrdersByGuestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ guestId, note }: { guestId: number; note?: string }) =>
      orderApiRequest.payOrdersByGuest(guestId, { method: 'CASH', note }),
    onSuccess: () => {
      for (const queryKey of [
        ['orders'],
        ['order-detail'],
        ['cash-shifts'],
        ['cash-book'],
        ['cash-book-lines'],
        ['ledger-entries'],
        ['ledger-integrity'],
        ['revenue-report'],
      ]) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
};
