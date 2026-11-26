import { cashShiftApiRequest } from '@/apiRequest/cashShift';
import {
  CloseCashShiftBodyType,
  CreateCashMovementBodyType,
  OpenCashShiftBodyType,
} from '@/app/ValidationSchemas/cash-shift.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEY = ['cash-shifts'];

export const useGetCashShiftCurrent = () => {
  return useQuery({
    queryKey: [...QUERY_KEY, 'current'],
    queryFn: cashShiftApiRequest.current,
    // Số két phải phản ánh đơn vừa thu tiền -> làm mới định kỳ
    refetchInterval: 30_000,
  });
};

export const useGetCashShifts = (query: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: [...QUERY_KEY, 'list', query],
    queryFn: () => cashShiftApiRequest.list(query),
  });
};

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: QUERY_KEY });
};

export const useOpenCashShift = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (body: OpenCashShiftBodyType) => cashShiftApiRequest.open(body),
    onSuccess: invalidate,
  });
};

export const useCloseCashShift = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: CloseCashShiftBodyType }) =>
      cashShiftApiRequest.close(id, body),
    onSuccess: invalidate,
  });
};

export const useAddCashMovement = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: CreateCashMovementBodyType;
    }) => cashShiftApiRequest.addMovement(id, body),
    onSuccess: invalidate,
  });
};

/** Chi tiết 1 ca: thu/chi trong ca + các khoản thu tiền mặt */
export const useGetCashShiftDetail = (id: number) =>
  useQuery({
    queryKey: ['cash-shift-detail', id],
    queryFn: () => cashShiftApiRequest.detail(id),
    enabled: id > 0,
  });
