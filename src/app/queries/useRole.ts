import { accountApiRequests } from '@/apiRequest/account';
import { roleRequestApi } from '@/apiRequest/role';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetRoleListQuery = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => roleRequestApi.list(),
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description: string; isActive: boolean }) =>
      roleRequestApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleRequestApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
};
