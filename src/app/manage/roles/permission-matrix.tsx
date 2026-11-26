'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Lock, Save, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetRolePermissions, useSaveRolePermissions } from '@/app/queries/useRolePermission';
import { useI18n } from '@/i18n/locale-provider';
import { getApiErrorMessage } from '@/lib/api-error';
import { cn } from '@/lib/utils';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

/**
 * Ma trận quyền của một role: dòng = module (đoạn đầu của path), cột = HTTP method.
 *
 * Ô có số nghĩa là module đó có bấy nhiêu route với method đó; bấm để bật/tắt **toàn bộ** nhóm đó
 * (bật từng route lẻ thì không ai dùng nổi 168 route). Lưu gửi **danh sách đầy đủ** quyền muốn có.
 */
export default function PermissionMatrix({ roleId, roleName }: { roleId: number; roleName: string }) {
  const { t } = useI18n();
  const { data, isLoading } = useGetRolePermissions(roleId);
  const save = useSaveRolePermissions(roleId);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const role = data?.payload?.data.role;
  const permissions = useMemo(() => data?.payload?.data.permissions ?? [], [data]);
  const isLocked = role?.isLocked ?? roleName === 'ADMIN';

  useEffect(() => {
    setSelected(new Set(permissions.filter((item) => item.granted).map((item) => item.id)));
  }, [permissions]);

  // module -> method -> danh sách permission id
  const grid = useMemo(() => {
    const map = new Map<string, Map<string, number[]>>();
    for (const item of permissions) {
      if (!map.has(item.module)) map.set(item.module, new Map());
      const byMethod = map.get(item.module)!;
      const list = byMethod.get(item.method) ?? [];
      list.push(item.id);
      byMethod.set(item.method, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const toggleGroup = (ids: number[]) => {
    if (isLocked) return;
    setSelected((current) => {
      const next = new Set(current);
      const allGranted = ids.every((id) => next.has(id));
      ids.forEach((id: number) => (allGranted ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const dirty =
    selected.size !== permissions.filter((item) => item.granted).length ||
    permissions.some((item) => item.granted !== selected.has(item.id));

  const submit = async () => {
    try {
      await save.mutateAsync(Array.from(selected));
      toast.success(t('Đã lưu phân quyền cho {role}', { role: roleName }));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('Không lưu được phân quyền')));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div className="grid gap-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5" />
            {roleName}
            {isLocked && (
              <Badge variant="secondary" className="gap-1 font-normal">
                <Lock className="h-3 w-3" />
                {t('Toàn quyền, không sửa được')}
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t('Đã cấp {granted}/{total} quyền', {
              granted: selected.size,
              total: permissions.length,
            })}
          </p>
        </div>
        {!isLocked && (
          <Button onClick={submit} disabled={!dirty || save.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {t('Lưu phân quyền')}
          </Button>
        )}
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('Đang tải...')}</p>
        ) : (
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                <th className="py-2 pr-3">{t('Nhóm quyền')}</th>
                {METHODS.map((method) => (
                  <th key={method} className="px-2 py-2 text-center">
                    {method}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map(([module, byMethod]) => (
                <tr key={module} className="border-b last:border-0">
                  <td className="py-1.5 pr-3 font-mono text-xs">{module}</td>
                  {METHODS.map((method) => {
                    const ids = byMethod.get(method) ?? [];
                    if (!ids.length) {
                      return (
                        <td key={method} className="px-2 py-1.5 text-center text-muted-foreground/40">
                          ·
                        </td>
                      );
                    }
                    const grantedCount = ids.filter((id) => selected.has(id)).length;
                    const allGranted = grantedCount === ids.length;
                    return (
                      <td key={method} className="px-1 py-1 text-center">
                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() => toggleGroup(ids)}
                          title={`${module} ${method}`}
                          className={cn(
                            'h-7 w-12 rounded text-xs font-medium transition-colors',
                            allGranted
                              ? 'bg-emerald-500/90 text-white'
                              : grantedCount > 0
                                ? 'bg-amber-400/80 text-amber-950'
                                : 'bg-muted text-muted-foreground hover:bg-muted/70',
                            isLocked && 'cursor-not-allowed opacity-70',
                          )}
                        >
                          {grantedCount > 0 ? grantedCount : ids.length}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          {t(
            'Ô xanh: đủ · ô vàng: một phần. Bấm để bật/tắt cả nhóm.',
          )}
        </p>
      </CardContent>
    </Card>
  );
}
