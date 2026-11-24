import {
  CashMovementTypeRes,
  CashShiftDetailTypeRes,
  CashShiftListTypeRes,
  CashShiftTypeRes,
  CloseCashShiftBodyType,
  CreateCashMovementBodyType,
  OpenCashShiftBodyType,
} from '@/app/ValidationSchemas/cash-shift.schema';
import http from '@/lib/http';

const prefix = '/cash-shifts';

export const cashShiftApiRequest = {
  /** Ca đang mở của chi nhánh; `payload` là null khi chưa mở ca */
  current: () => http.get<CashShiftDetailTypeRes | null>(`${prefix}/current`),
  list: (query: { page?: number; limit?: number; status?: 'OPEN' | 'CLOSED' } = {}) => {
    const searchParams = new URLSearchParams();
    if (query.page) searchParams.set('page', String(query.page));
    if (query.limit) searchParams.set('limit', String(query.limit));
    if (query.status) searchParams.set('status', query.status);
    const qs = searchParams.toString();
    return http.get<CashShiftListTypeRes>(`${prefix}${qs ? `?${qs}` : ''}`);
  },
  detail: (id: number) => http.get<CashShiftDetailTypeRes>(`${prefix}/${id}`),
  open: (body: OpenCashShiftBodyType) =>
    http.post<CashShiftTypeRes>(prefix, body),
  close: (id: number, body: CloseCashShiftBodyType) =>
    http.post<CashShiftTypeRes>(`${prefix}/${id}/close`, body),
  addMovement: (id: number, body: CreateCashMovementBodyType) =>
    http.post<CashMovementTypeRes>(`${prefix}/${id}/movements`, body),
};
