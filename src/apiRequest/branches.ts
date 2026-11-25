import {
  BranchListTypeRes,
  BranchRowType,
  CreateBranchBodyType,
  UpdateBranchBodyType,
  UpdateBranchSettingsBodyType,
} from '@/app/ValidationSchemas/branch.schema';
import http from '@/lib/http';

export const branchApiRequest = {
  list: () => http.get<BranchListTypeRes>('/branches'),
  updateSettings: (id: number, body: UpdateBranchSettingsBodyType) =>
    http.put<{ data: unknown }>(`/branches/${id}/settings`, body),
  create: (body: CreateBranchBodyType) => http.post<{ data: BranchRowType }>('/branches', body),
  update: (id: number, body: UpdateBranchBodyType) =>
    http.put<{ data: BranchRowType }>(`/branches/${id}`, body),
};
