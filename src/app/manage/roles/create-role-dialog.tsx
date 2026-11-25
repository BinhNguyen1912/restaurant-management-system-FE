'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCreateRole, useGetRoleListQuery } from '@/app/queries/useRole';
import { rolePermissionApiRequest, RolePermissionItem } from '@/apiRequest/role';
import { useI18n } from '@/i18n/locale-provider';
import { getApiErrorMessage } from '@/lib/api-error';

/**
 * Tạo vai trò mới + **gán quyền ngay**.
 *
 * Vai trò mới mặc định **0 quyền**: nếu chỉ tạo rồi để đó, người được gán vai trò đó đăng nhập
 * vào sẽ thấy menu nhưng mọi request 403. Vì vậy có thêm "sao chép quyền từ vai trò khác" —
 * thực chất là đọc ma trận của vai trò mẫu rồi ghi đè sang vai trò mới (đúng API sẵn có).
 */
export default function CreateRoleDialog({ onCreated }: { onCreated?: (roleId: number) => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [copyFrom, setCopyFrom] = useState<number | ''>('');
  const [busy, setBusy] = useState(false);
  const createRole = useCreateRole();
  const { data } = useGetRoleListQuery();
  const roles = data?.payload?.data ?? [];

  useEffect(() => {
    if (open) return;
    setName('');
    setDescription('');
    setCopyFrom('');
  }, [open]);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t('Tên vai trò không được để trống'));
      return;
    }
    setBusy(true);
    try {
      // tên role phải là UPPER_SNAKE: BE dùng tên để so sánh với role hệ thống
      const normalised = trimmed.toUpperCase().replace(/\s+/g, '_');
      const created = await createRole.mutateAsync({
        name: normalised,
        description: description.trim() || normalised,
        isActive: true,
      });
      const newRoleId = (created.payload as unknown as { id: number }).id;

      if (copyFrom) {
        const source = await rolePermissionApiRequest.matrix(Number(copyFrom));
        const grantedIds = (source.payload?.data.permissions ?? [])
          .filter((permission: RolePermissionItem) => permission.granted)
          .map((permission: RolePermissionItem) => permission.id);
        await rolePermissionApiRequest.save(newRoleId, grantedIds);
        toast.success(
          t('Đã tạo vai trò {role} với {count} quyền sao chép từ vai trò mẫu', {
            role: normalised,
            count: grantedIds.length,
          }),
        );
      } else {
        toast.info(t('Đã tạo vai trò {role} — chưa có quyền nào, hãy tick ở bảng bên dưới', { role: normalised }));
      }

      setOpen(false);
      onCreated?.(newRoleId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('Không tạo được vai trò')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {t('Thêm vai trò')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            {t('Thêm vai trò')}
          </DialogTitle>
          <DialogDescription>
            {t('Vai trò mới bắt đầu với 0 quyền. Sao chép từ vai trò có sẵn rồi sửa lại cho nhanh.')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label htmlFor="role-name">{t('Tên vai trò')}</Label>
            <Input
              id="role-name"
              value={name}
              placeholder="ACCOUNTANT"
              onChange={(event) => setName(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('Không dấu, không khoảng trắng (sẽ tự đổi thành chữ hoa, gạch dưới).')}
            </p>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="role-description">{t('Mô tả')}</Label>
            <Textarea
              id="role-description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="role-copy">{t('Sao chép quyền từ')}</Label>
            <select
              id="role-copy"
              className="h-9 w-full rounded-md border bg-background px-2 text-sm"
              value={copyFrom}
              onChange={(event) => setCopyFrom(event.target.value ? Number(event.target.value) : '')}
            >
              <option value="">{t('Không sao chép (bắt đầu với 0 quyền)')}</option>
              {roles.map((role: any) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('Huỷ')}
          </Button>
          <Button onClick={submit} disabled={busy}>
            {t('Tạo vai trò')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
