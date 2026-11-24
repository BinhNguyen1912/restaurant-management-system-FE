import {
  BranchListTypeRes,
  UpdateBranchSettingsBodyType,
} from '@/app/ValidationSchemas/branch.schema';
import http from '@/lib/http';

export const branchApiRequest = {
  list: () => http.get<BranchListTypeRes>('/branches'),
  updateSettings: (id: number, body: UpdateBranchSettingsBodyType) =>
    http.put<{ data: unknown }>(`/branches/${id}/settings`, body),
};
