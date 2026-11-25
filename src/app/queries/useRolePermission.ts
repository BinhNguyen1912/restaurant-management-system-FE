import { rolePermissionApiRequest } from '@/apiRequest/role';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/** Ma trận quyền của 1 role: mọi route + đã cấp hay chưa */
export const useGetRolePermissions = (roleId: number, enabled = true) =>
  useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: () => rolePermissionApiRequest.matrix(roleId),
    enabled: enabled && roleId > 0,
  });

export const useSaveRolePermissions = (roleId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (permissionIds: number[]) => rolePermissionApiRequest.save(roleId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions', roleId] });
      // quyền đổi -> menu/route của người dùng cũng có thể đổi
      queryClient.invalidateQueries({ queryKey: ['account-profile'] });
    },
  });
};
