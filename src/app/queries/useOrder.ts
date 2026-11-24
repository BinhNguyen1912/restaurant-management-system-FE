import { useMutation, useQuery } from '@tanstack/react-query';
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

export const usePayOrdersByGuestMutation = () => {
  return useMutation({
    mutationFn: (guestId: number) => orderApiRequest.payOrdersByGuest(guestId),
  });
};
