import { AuditLogListTypeRes } from '@/app/ValidationSchemas/audit-log.schema';
import http from '@/lib/http';

export type AuditLogQuery = {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  entityId?: number;
  actorId?: number;
  fromDate?: string;
  toDate?: string;
};

export const auditLogApiRequest = {
  list: (query: AuditLogQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
    });
    const qs = params.toString();
    return http.get<AuditLogListTypeRes>(`/audit-logs${qs ? `?${qs}` : ''}`);
  },
};
