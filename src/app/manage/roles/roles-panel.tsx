'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGetRoleListQuery } from '@/app/queries/useRole';
import PermissionMatrix from '@/app/manage/roles/permission-matrix';
import { useI18n } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';

/** Chọn vai trò (tab) rồi sửa ma trận quyền của vai trò đó */
export default function RolesPanel() {
  const { t } = useI18n();
  const { data, isLoading } = useGetRoleListQuery();
  const roles = (data?.payload?.data ?? []).filter((role: any) => role.isActive !== false);
  const [roleId, setRoleId] = useState<number | null>(null);

  // mặc định chọn role đầu tiên KHÔNG phải ADMIN: ADMIN bị khoá, mở vào đó thì không làm gì được
  useEffect(() => {
    if (roleId !== null || roles.length === 0) return;
    const firstEditable = roles.find((role: any) => role.name !== 'ADMIN') ?? roles[0];
    setRoleId(firstEditable.id);
  }, [roles, roleId]);

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('Đang tải...')}</p>;
  if (roles.length === 0) return <p className="text-sm text-muted-foreground">{t('Chưa có vai trò nào')}</p>;

  const current = roles.find((role: any) => role.id === roleId) ?? roles[0];

  return (
    <div className="grid gap-4">
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
      <PermissionMatrix key={current.id} roleId={current.id} roleName={current.name} />
    </div>
  );
}
