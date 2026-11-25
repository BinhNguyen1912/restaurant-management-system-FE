import {
  GetRolesResType,
  RoleBodyResType,
} from '@/app/ValidationSchemas/role.schema';
import {
  CreateTableBodyType,
  TableDetailResType,
  TableListResType,
  UpdateTableBodyType,
} from '@/app/ValidationSchemas/table.schema';

import http from '@/lib/http';

const prefix = '/role';
export const roleRequestApi = {
  list: () => http.get<GetRolesResType>(`${prefix}`),
  create: (body: { name: string; description: string; isActive: boolean }) =>
    http.post<RoleBodyResType>(`${prefix}`, body),
  update: (id: number, body: { name?: string; description?: string; isActive?: boolean }) =>
    http.put<RoleBodyResType>(`${prefix}/${id}`, body),
  remove: (id: number) => http.delete<{ message: string }>(`${prefix}/${id}`),
  //   getDetail: (id: number) =>
  //     http.get<TableDetailResType>(`${prefix}/getTableDetail/${id}`),
  //   create: (data: CreateTableBodyType) =>
  //     http.post<TableDetailResType>(`${prefix}`, data),
  //   put: (id: number, data: UpdateTableBodyType) =>
  //     http.put<TableDetailResType>(`${prefix}/${id}`, data),
  //   delete: (id: number) => http.delete<TableDetailResType>(`${prefix}/${id}`),
};

export type RolePermissionItem = {
  id: number;
  method: string;
  path: string;
  module: string;
  granted: boolean;
};

export type RolePermissionMatrixType = {
  message: string;
  data: {
    role: { id: number; name: string; isLocked: boolean };
    permissions: RolePermissionItem[];
  };
};

export const rolePermissionApiRequest = {
  matrix: (roleId: number) =>
    http.get<RolePermissionMatrixType>(`/role/${roleId}/permissions`),
  save: (roleId: number, permissionIds: number[]) =>
    http.put<{ message: string }>(`/role/${roleId}/permissions`, { permissionIds }),
};
