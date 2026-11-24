import { auditLogApiRequest, AuditLogQuery } from '@/apiRequest/auditLog';
import { useQuery } from '@tanstack/react-query';

export const useGetAuditLogs = (query: AuditLogQuery) => {
  return useQuery({
    queryKey: ['audit-logs', query],
    queryFn: () => auditLogApiRequest.list(query),
  });
};
