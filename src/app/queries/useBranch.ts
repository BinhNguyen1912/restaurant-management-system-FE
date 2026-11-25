import { branchApiRequest } from '@/apiRequest/branches';
import {
  CreateBranchBodyType,
  UpdateBranchBodyType,
  UpdateBranchSettingsBodyType,
} from '@/app/ValidationSchemas/branch.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const QUERY_KEY = ['branches'];

export const useGetBranches = () => {
  return useQuery({ queryKey: QUERY_KEY, queryFn: branchApiRequest.list });
};

export const useUpdateBranchSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: UpdateBranchSettingsBodyType;
    }) => branchApiRequest.updateSettings(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBranchBodyType) => branchApiRequest.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateBranchBodyType }) =>
      branchApiRequest.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
