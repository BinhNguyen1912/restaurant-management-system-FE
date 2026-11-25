'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteRole, useGetRoleListQuery } from '@/app/queries/useRole';
import CreateRoleDialog from '@/app/manage/roles/create-role-dialog';
import PermissionMatrix from '@/app/manage/roles/permission-matrix';
import { useI18n } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api-error';

/** Role hệ thống không xoá được (BE cũng chặn: SystemRoleDeletionError) */
const SYSTEM_ROLES = ['ADMIN', 'STAFF', 'USER', 'GUEST'];

/** Chọn vai trò (tab) rồi sửa ma trận quyền của vai trò đó */
export default function RolesPanel() {
  const { t } = useI18n();
  const { data, isLoading } = useGetRoleListQuery();
  const roles = (data?.payload?.data ?? []).filter((role: any) => role.isActive !== false);
  // `?role=<id>` để từ bảng Nhân viên bấm thẳng sang vai trò của người đó
  const searchParams = useSearchParams();
  const roleFromUrl = Number(searchParams.get('role') ?? '') || null;
  const [roleId, setRoleId] = useState<number | null>(roleFromUrl);
  const deleteRole = useDeleteRole();

  // mặc định chọn role đầu tiên KHÔNG phải ADMIN: ADMIN bị khoá, mở vào đó thì không làm gì được
  useEffect(() => {
    // URL thắng: mở đúng vai trò được trỏ tới
    if (roleFromUrl && roles.some((role: any) => role.id === roleFromUrl)) {
      setRoleId(roleFromUrl);
      return;
    }
    if (roleId !== null || roles.length === 0) return;
    const firstEditable = roles.find((role: any) => role.name !== 'ADMIN') ?? roles[0];
    setRoleId(firstEditable.id);
  }, [roles, roleId, roleFromUrl]);

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('Đang tải...')}</p>;
  if (roles.length === 0) return <p className="text-sm text-muted-foreground">{t('Chưa có vai trò nào')}</p>;

  const current = roles.find((role: any) => role.id === roleId) ?? roles[0];

  const removeCurrent = async () => {
    if (!window.confirm(t('Xoá vai trò {role}? Người dùng đang mang vai trò này sẽ mất quyền truy cập.', { role: current.name })))
      return;
    try {
      await deleteRole.mutateAsync(current.id);
      setRoleId(null);
      toast.success(t('Đã xoá vai trò {role}', { role: current.name }));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('Không xoá được vai trò')));
    }
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {roles.map((role: any) => (
          <Button
            key={role.id}
            variant="ghost"
            size="sm"
            onClick={() => setRoleId(role.id)}
            className={cn(
              'rounded-md',
              role.id === current.id && 'bg-background font-medium shadow-sm',
            )}
          >
              {role.name}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {!SYSTEM_ROLES.includes(current.name) && (
            <Button variant="outline" size="sm" onClick={removeCurrent} disabled={deleteRole.isPending}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('Xoá vai trò')}
            </Button>
          )}
          <CreateRoleDialog
            onCreated={(newRoleId) => setRoleId(newRoleId)}
          />
        </div>
      </div>
      <PermissionMatrix key={current.id} roleId={current.id} roleName={current.name} />
    </div>
  );
}
