'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Pencil, Plus, TicketPercent, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CreateVoucherBody, VoucherResType } from '@/app/ValidationSchemas/voucher.schema';
import { useI18n } from '@/i18n/locale-provider';
import { T } from '@/components/t';
import {
  useCreateVoucher,
  useDeleteVoucher,
  useGetVouchers,
  useUpdateVoucher,
  useUpdateVoucherStatus,
} from '@/app/queries/useVouchers';

type Draft = {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  startAt: string;
  endAt: string;
  usageLimit: string;
};

type FormErrors = Partial<Record<keyof Draft, string>>;

const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const datetime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

/** input datetime-local cần 'YYYY-MM-DDTHH:mm' theo giờ máy, không phải chuỗi ISO UTC */
const toLocalInput = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const emptyDraft = (): Draft => ({
  code: '',
  discountType: 'PERCENT',
  discountValue: 10,
  startAt: toLocalInput(new Date()),
  endAt: toLocalInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  usageLimit: '',
});

const toDraft = (voucher: VoucherResType): Draft => ({
  code: voucher.code,
  discountType: voucher.discountType,
  discountValue: voucher.discountValue,
  startAt: toLocalInput(new Date(voucher.startAt)),
  endAt: toLocalInput(new Date(voucher.endAt)),
  usageLimit: voucher.usageLimit === null ? '' : String(voucher.usageLimit),
});

const statusBadge = (voucher: VoucherResType, t: (key: string) => string) => {
  if (voucher.status === 'INACTIVE') return <Badge variant="secondary">{t("Đã tắt")}</Badge>;
  if (voucher.status === 'EXPIRED') return <Badge variant="outline">{t("Hết hạn")}</Badge>;
  if (voucher.usableNow) return <Badge>{t("Đang chạy")}</Badge>;
  return <Badge variant="outline">{t("Ngoài giờ / hết lượt")}</Badge>;
};

export default function VoucherTable() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const limit = 10;

  const params = useMemo(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      status: status === 'ALL' ? undefined : status,
    }),
    [page, search, status],
  );

  const { data, isLoading, isError, error } = useGetVouchers(params);
  const listError = error as { payload?: { message?: string }; message?: string } | null;
  const { mutateAsync: createVoucher, isPending: creating } = useCreateVoucher();
  const { mutateAsync: updateVoucher, isPending: updating } = useUpdateVoucher();
  const { mutateAsync: updateStatus } = useUpdateVoucherStatus();
  const { mutateAsync: deleteVoucher } = useDeleteVoucher();

  const vouchers = data?.payload?.data ?? [];
  const totalItems = data?.payload?.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  /** xoá row cuối của trang cuối -> trang hiện tại vượt quá tổng số trang, lùi lại cho khỏi hiện "Chưa có mã nào" */
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VoucherResType | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [errors, setErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<VoucherResType | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDraft(emptyDraft());
    setErrors({});
    setOpen(true);
  };

  const openEdit = (voucher: VoucherResType) => {
    setEditing(voucher);
    setDraft(toDraft(voucher));
    setErrors({});
    setOpen(true);
  };

  const patch = (change: Partial<Draft>) => setDraft((current) => ({ ...current, ...change }));

  const submit = async () => {
    const parsed = CreateVoucherBody.safeParse(draft);
    if (!parsed.success) {
      const next: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Draft;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    const body = {
      code: parsed.data.code,
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
      startAt: new Date(parsed.data.startAt).toISOString(),
      endAt: new Date(parsed.data.endAt).toISOString(),
      usageLimit: parsed.data.usageLimit ? Number(parsed.data.usageLimit) : null,
    };
    try {
      if (editing) {
        await updateVoucher({ id: editing.id, body });
        toast.success(`Đã cập nhật mã ${body.code.toUpperCase()}`);
      } else {
        await createVoucher(body);
        toast.success(`Đã tạo mã ${body.code.toUpperCase()}`);
      }
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.payload?.message ?? error?.message ?? 'Không lưu được mã giảm giá');
    }
  };

  const toggleStatus = async (voucher: VoucherResType) => {
    const next = voucher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateStatus({ id: voucher.id, status: next });
      toast.success(next === 'ACTIVE' ? `Đã bật lại ${voucher.code}` : `Đã tắt ${voucher.code}`);
    } catch (error: any) {
      toast.error(error?.payload?.message ?? error?.message ?? 'Không đổi được trạng thái');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteVoucher(deleteTarget.id);
      toast.success(`Đã xoá mã ${deleteTarget.code}`);
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error?.payload?.message ?? error?.message ?? 'Không xoá được mã');
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-end justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TicketPercent className="h-5 w-5" /> Danh sách mã giảm giá
            </CardTitle>
            <CardDescription>
              {totalItems} mã · muốn ngừng nhận mã mà vẫn giữ lịch sử thì bấm &quot;Tắt&quot; thay vì xoá.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              className="w-52"
              placeholder={t("Tìm theo mã…")}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as typeof status);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("Tất cả")}</SelectItem>
                <SelectItem value="ACTIVE">{t("Đang bật")}</SelectItem>
                <SelectItem value="INACTIVE">{t("Đã tắt")}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Tạo mã
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Mã")}</TableHead>
                <TableHead>{t("Giảm")}</TableHead>
                <TableHead>{t("Hiệu lực")}</TableHead>
                <TableHead className="text-right">{t("Đã dùng")}</TableHead>
                <TableHead>{t("Trạng thái")}</TableHead>
                <TableHead className="text-right">{t("Thao tác")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    <T>Đang tải…</T>
                  </TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-destructive">
                    {listError?.payload?.message ?? listError?.message ?? 'Không tải được danh sách mã'}
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && vouchers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {search.trim() || status !== 'ALL'
                      ? 'Không có mã nào khớp bộ lọc.'
                      : 'Chưa có mã nào. Bấm Tạo mã để bắt đầu.'}
                  </TableCell>
                </TableRow>
              )}
              {vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-mono font-medium">{voucher.code}</TableCell>
                  <TableCell>
                    {voucher.discountType === 'PERCENT'
                      ? `${voucher.discountValue}%`
                      : money(voucher.discountValue)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {datetime(voucher.startAt)} → {datetime(voucher.endAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {voucher.usedCount}
                    {voucher.usageLimit !== null ? ` / ${voucher.usageLimit}` : ' / ∞'}
                  </TableCell>
                  <TableCell>{statusBadge(voucher, t)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(voucher)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(voucher)}>
                        {voucher.status === 'ACTIVE' ? 'Tắt' : 'Bật'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(voucher)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Trang {page}/{totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <T>Trước</T>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Sửa mã ${editing.code}` : 'Tạo mã giảm giá'}</DialogTitle>
            <DialogDescription>
              <T>Giảm theo % áp lên phần tạm tính của đơn; để trống số lượt nghĩa là không giới hạn.</T>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="voucher-code">{t("Mã")}</Label>
              <Input
                id="voucher-code"
                value={draft.code}
                placeholder="VD: KHAITRUONG10"
                onChange={(event) => patch({ code: event.target.value.toUpperCase() })}
              />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label>{t("Loại giảm")}</Label>
                <Select
                  value={draft.discountType}
                  onValueChange={(value) => patch({ discountType: value as 'PERCENT' | 'FIXED' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">{t("Phần trăm (%)")}</SelectItem>
                    <SelectItem value="FIXED">{t("Số tiền (đ)")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="voucher-discount-value">
                  {draft.discountType === 'PERCENT' ? 'Giảm (%)' : 'Giảm (đ)'}
                </Label>
                <Input
                  id="voucher-discount-value"
                  type="number"
                  value={draft.discountValue}
                  onChange={(event) => patch({ discountValue: Number(event.target.value) })}
                />
                {errors.discountValue && <p className="text-xs text-destructive">{errors.discountValue}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="voucher-start-at">{t("Bắt đầu")}</Label>
                <Input
                  id="voucher-start-at"
                  type="datetime-local"
                  value={draft.startAt}
                  onChange={(event) => patch({ startAt: event.target.value })}
                />
                {errors.startAt && <p className="text-xs text-destructive">{errors.startAt}</p>}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="voucher-end-at">{t("Kết thúc")}</Label>
                <Input
                  id="voucher-end-at"
                  type="datetime-local"
                  value={draft.endAt}
                  onChange={(event) => patch({ endAt: event.target.value })}
                />
                {errors.endAt && <p className="text-xs text-destructive">{errors.endAt}</p>}
              </div>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="voucher-usage-limit">{t("Giới hạn lượt (để trống = không giới hạn)")}</Label>
              <Input
                id="voucher-usage-limit"
                inputMode="numeric"
                value={draft.usageLimit}
                onChange={(event) => patch({ usageLimit: event.target.value })}
              />
              {errors.usageLimit && <p className="text-xs text-destructive">{errors.usageLimit}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              <T>Huỷ</T>
            </Button>
            <Button onClick={submit} disabled={creating || updating}>
              {editing ? 'Lưu thay đổi' : 'Tạo mã'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(value) => !value && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xoá mã {deleteTarget?.code}?</DialogTitle>
            <DialogDescription>
              Mã sẽ không dùng được nữa. Đơn cũ đã dùng mã vẫn giữ nguyên số tiền đã giảm — nếu chỉ muốn ngừng nhận
              mã, hãy bấm &quot;Tắt&quot; thay vì xoá.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              <T>Giữ lại</T>
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <T>Xoá</T>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
