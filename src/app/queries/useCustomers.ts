import { customerApiRequest } from '@/apiRequest/customers';
import { RedeemPointsBodyType } from '@/app/ValidationSchemas/customer.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/** Một khoá gốc cho cả cụm: đổi điểm làm đổi số dư ⇒ phải làm mới danh sách, hồ sơ và lịch sử. */
const QUERY_KEY = ['customers'];

export const useGetCustomers = (params: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'newest' | 'name';
}) => {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', params],
    queryFn: () => customerApiRequest.list(params),
  });
};

export const useGetCustomerDetail = (id: number | null) => {
  return useQuery({
    queryKey: [...QUERY_KEY, 'detail', id],
    queryFn: () => customerApiRequest.detail(id as number),
    enabled: id !== null,
  });
};

export const useGetCustomerPoints = (id: number | null) => {
  return useQuery({
    queryKey: [...QUERY_KEY, 'points', id],
    queryFn: () => customerApiRequest.points(id as number),
    enabled: id !== null,
  });
};

export const useGetCustomerReport = (params: { fromDate?: string; toDate?: string; branchId?: number }) => {
  return useQuery({
    queryKey: [...QUERY_KEY, 'report', params],
    queryFn: () => customerApiRequest.report(params),
  });
};

export const useRedeemPoints = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: RedeemPointsBodyType }) =>
      customerApiRequest.redeemPoints(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateCustomerNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string | null }) =>
      customerApiRequest.updateNote(id, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
