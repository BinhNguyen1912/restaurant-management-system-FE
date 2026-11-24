import { revenueReportApiRequest, ReportRangeQuery } from '@/apiRequest/revenueReport';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEY = ['revenue-report'];

export const useGetRevenueReport = (query: ReportRangeQuery) => {
  return useQuery({
    queryKey: [...QUERY_KEY, query],
    queryFn: () => revenueReportApiRequest.get(query),
  });
};

export const useGetRevenueByItem = (query: ReportRangeQuery) => {
  return useQuery({
    queryKey: [...QUERY_KEY, 'by-item', query],
    queryFn: () => revenueReportApiRequest.byItem(query),
  });
};

export const useRecomputeRevenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReportRangeQuery) => revenueReportApiRequest.recompute(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboardIndicator'] });
      queryClient.invalidateQueries({ queryKey: ['ledger-integrity'] });
    },
  });
};
