'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Building2, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCreateBranch, useUpdateBranch } from '@/app/queries/useBranch';
import { BranchRowType } from '@/app/ValidationSchemas/branch.schema';
import { useI18n } from '@/i18n/locale-provider';
import { getApiErrorMessage } from '@/lib/api-error';

type FormState = { code: string; name: string; address: string; isActive: boolean };

const EMPTY: FormState = { code: '', name: '', address: '', isActive: true };

/** Tạo mới hoặc sửa một chi nhánh. `branch` rỗng = tạo mới. */
export default function BranchFormDialog({ branch }: { branch?: BranchRowType }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const isEdit = Boolean(branch);
  const isPending = createBranch.isPending || updateBranch.isPending;

  useEffect(() => {
    if (!open) return;
    setForm(
      branch
        ? { code: branch.code, name: branch.name, address: '', isActive: branch.isActive }
        : EMPTY,
    );
  }, [open, branch]);

  const submit = async () => {
    if (form.name.trim().length < 2) {
      toast.error(t('Tên chi nhánh tối thiểu 2 ký tự'));
      return;
    }
    if (!isEdit && form.code.trim().length < 2) {
      toast.error(t('Mã chi nhánh tối thiểu 2 ký tự'));
      return;
    }
    try {
      if (isEdit && branch) {
        // không gửi `code`: mã chi nhánh đã in lên báo cáo, đổi mã làm lệch số liệu cũ
        await updateBranch.mutateAsync({
          id: branch.id,
          body: {
            name: form.name.trim(),
            isActive: form.isActive,
            ...(form.address.trim() ? { address: form.address.trim() } : {}),
          },
        });
        toast.success(t('Đã lưu chi nhánh'));
      } else {
        await createBranch.mutateAsync({
          code: form.code.trim(),
          name: form.name.trim(),
          isActive: form.isActive,
          ...(form.address.trim() ? { address: form.address.trim() } : {}),
        });
        toast.success(t('Đã tạo chi nhánh'));
      }
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('Không lưu được chi nhánh')));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            {t('Sửa')}
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('Thêm chi nhánh')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEdit ? `${t('Sửa chi nhánh')}: ${branch?.name}` : t('Thêm chi nhánh')}
          </DialogTitle>
          <DialogDescription>
            {t('Mỗi chi nhánh có dữ liệu riêng: bàn, đơn, nhân viên và báo cáo.')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label htmlFor="branch-code">{t('Mã chi nhánh')}</Label>
            <Input
              id="branch-code"
              value={form.code}
              disabled={isEdit}
              placeholder="MAIN"
              onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
            />
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                {t('Mã chi nhánh không đổi được vì đã in trên báo cáo cũ.')}
              </p>
            )}
          </div>
          <div className="grid gap-1">
            <Label htmlFor="branch-name">{t('Tên chi nhánh')}</Label>
            <Input
              id="branch-name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="branch-address">{t('Địa chỉ')}</Label>
            <Input
              id="branch-address"
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">{t('Đang hoạt động')}</p>
              <p className="text-xs text-muted-foreground">
                {t('Ngừng hoạt động thì chi nhánh không nhận đơn mới.')}
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('Huỷ')}
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isEdit ? t('Lưu thay đổi') : t('Tạo chi nhánh')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
