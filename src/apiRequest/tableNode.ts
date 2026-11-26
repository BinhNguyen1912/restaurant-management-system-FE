import {
  GetListTableNodeResType,
  TableNodeBodyType,
  TableNodeDetailResType,
  TableNodeQueryType,
  TableNodeResType,
  UpdateTableNodeBodyType,
  UpdateTableNodeBodyBatchType,
  UpdateTableNodeBodyBatchResType,
} from '@/app/ValidationSchemas/table-node.schema';
import http from '@/lib/http';

const prefix = '/table-node';
export const tableNodeRequestApi = {
  list: (query?: Partial<TableNodeQueryType>) => {
    let qs = '';
    if (query && Object.keys(query).length) {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          params.append(key, String(value));
      });
      const s = params.toString();
      qs = s ? `?${s}` : '';
    }
    return http.get<GetListTableNodeResType>(`${prefix}${qs}`);
  },
  getDetail: (id: number) =>
    http.get<TableNodeDetailResType>(`${prefix}/${id}`),
  create: (data: TableNodeBodyType) =>
    http.post<TableNodeResType>(`${prefix}`, data),
  put: (id: number, data: UpdateTableNodeBodyType) =>
    http.put<TableNodeResType>(`${prefix}/${id}`, data),
  updateManyBatch: (data: UpdateTableNodeBodyBatchType) =>
    http.put<UpdateTableNodeBodyBatchResType>(
      `${prefix}/updateMany/batch`,
      data,
    ),
  /** Mở bàn: khách chỉ quét QR gọi món được khi bàn đang mở */
  open: (id: number) => http.post<{ data: TableNodeResType }>(`${prefix}/${id}/open`, {}),
  /** Đóng bàn: trả bàn về trống, kết thúc phiên của khách */
  close: (id: number) => http.post<{ data: TableNodeResType }>(`${prefix}/${id}/close`, {}),
  delete: (id: number) => http.delete<TableNodeResType>(`${prefix}/${id}`),
  deleteAllByArea: (areaId: number) =>
    http.delete<TableNodeDetailResType>(`${prefix}/area/${areaId}`),
};
