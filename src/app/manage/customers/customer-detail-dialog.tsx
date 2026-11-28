'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Coins, History, NotebookPen, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMeProfile } from '@/app/queries/useAccount';
import {
  useGetCustomerDetail,
  useGetCustomerPoints,
  useRedeemPoints,
  useUpdateCustomerNote,
} from '@/app/queries/useCustomers';
import { RedeemPointsBody } from '@/app/ValidationSchemas/customer.schema';
import { useI18n } from '@/i18n/locale-provider';

const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

/** Đơn đã chốt tiền thì không trừ điểm được nữa (BE cũng chặn — đây chỉ là ẩn nút). */
const CLOSED_ORDER_STATUS = ['PAID', 'COMPLETED', 'CANCELLED'];

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang làm',
  READY: 'Sẵn sàng',
  PAID: 'Đã thanh toán',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã huỷ',
};

/** Quyền của vai trò hiện tại — cùng nguồn với menu (profile.role.permissions). */
const useGranted = () => {
  const { data: profile } = useMeProfile();
  const permissions =
    (profile?.payload as { role?: { permissions?: { module: string; method: string }[] } })?.role?.permissions ?? [];
  const granted = useMemo(
    () => new Set(permissions.map((item) => `${item.module}:${item.method.toUpperCase()}`)),
    [permissions],
  );
  return (module: string, method: string) => granted.has(`${module}:${method.toUpperCase()}`);
};

/**
 * Hồ sơ một khách: số liệu tích luỹ, điểm thưởng (kiếm/đổi), và chỗ trừ điểm trên hoá đơn chưa thu.
 *
 * Trừ điểm nằm ở đây chứ không ở màn hình đơn hàng: người đứng quầy tra SĐT khách trước, rồi mới
 * chọn hoá đơn của chính khách đó — đúng thứ tự câu chuyện ngoài đời.
 */
export default function CustomerDetailDialog({
  customerId,
  open,
  onOpenChange,
}: {
  customerId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const can = useGranted();
  const activeId = open ? customerId : null;

  const { data: detailRes, isLoading } = useGetCustomerDetail(activeId);
  const { data: pointsRes } = useGetCustomerPoints(activeId);
  const { mutateAsync: redeem, isPending: redeeming } = useRedeemPoints();
  const { mutateAsync: saveNote, isPending: savingNote } = useUpdateCustomerNote();

  const detail = detailRes?.payload?.data;
  const points = pointsRes?.payload?.data;

  const [note, setNote] = useState('');
  const [orderId, setOrderId] = useState('');
  const [pointsToUse, setPointsToUse] = useState('');

  useEffect(() => {
    setNote(detail?.note ?? '');
  }, [detail?.id, detail?.note]);

  const openOrders = useMemo(
    () => (detail?.recentOrders ?? []).filter((order) => !CLOSED_ORDER_STATUS.includes(order.status)),
    [detail],
  );

  useEffect(() => {
    if (openOrders.length > 0 && !openOrders.some((order) => String(order.id) === orderId)) {
      setOrderId(String(openOrders[0].id));
    }
    if (openOrders.length === 0) setOrderId('');
  }, [openOrders, orderId]);

  const balance = points?.balance ?? 0;
  const minRedeem = points?.minRedeemPoints ?? 10;
  const pointValue = points?.pointValueVnd ?? 1000;
  const requested = Number(pointsToUse || 0);
  const valueVnd = Number.isFinite(requested) ? requested * pointValue : 0;
  const canRedeem = can('CUSTOMERS', 'POST');
  const canEditNote = can('CUSTOMERS', 'PATCH');

  const submitRedeem = async () => {
    if (!customerId) return;
    const parsed = RedeemPointsBody.safeParse({ orderId, points: pointsToUse });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t('Dữ liệu chưa hợp lệ'));
      return;
    }
    try {
      const res = await redeem({ id: customerId, body: parsed.data });
      const result = res.payload?.data;
      toast.success(
        t('Đã trừ {points} điểm — hoá đơn #{order} còn {total}', {
          points: parsed.data.points,
          order: result?.orderId ?? parsed.data.orderId,
          total: money(result?.orderGrandTotal ?? 0),
        }),
      );
      setPointsToUse('');
    } catch (error) {
      const message = (error as { payload?: { message?: string } })?.payload?.message;
      toast.error(message ?? t('Không đổi được điểm'));
    }
  };

  const submitNote = async () => {
    if (!customerId) return;
    try {
      await saveNote({ id: customerId, note: note.trim() ? note.trim() : null });
      toast.success(t('Đã lưu ghi chú'));
    } catch (error) {
      const message = (error as { payload?: { message?: string } })?.payload?.message;
      toast.error(message ?? t('Không lưu được ghi chú'));
    }
  };

  const history = points?.history ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {isLoading ? t('Đang tải hồ sơ…') : (detail?.name ?? t('Hồ sơ khách'))}
            {detail && <Badge variant="outline" className="tabular-nums">{detail.phone}</Badge>}
          </DialogTitle>
          <DialogDescription>
            {t('Số liệu tính lại từ đơn đã thu tiền của khách này; điểm thưởng là của khách, không theo chi nhánh.')}
          </DialogDescription>
        </DialogHeader>

        {detail && (
          <div className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-4">
              <Stat label={t('Đơn đã trả')} value={String(detail.stats.orderCount)} />
              <Stat label={t('Tổng chi')} value={money(detail.stats.totalSpend)} />
              <Stat label={t('Trung bình / đơn')} value={money(detail.stats.avgSpend)} />
              <Stat label={t('Lần cuối tới')} value={dateTime(detail.stats.lastVisitAt)} />
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Coins className="h-4 w-4" />
                  {t('Điểm thưởng')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  <span className="text-2xl font-semibold tabular-nums">{balance}</span>
                  <span className="text-sm text-muted-foreground">
                    {t('Tích luỹ {earned} · đã dùng {spent}', {
                      earned: points?.earned ?? 0,
                      spent: points?.spent ?? 0,
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('{vnd} chi tiêu = 1 điểm · 1 điểm = {value} · đổi tối thiểu {min} điểm', {
                      vnd: money(points?.vndPerPoint ?? 20000),
                      value: money(pointValue),
                      min: minRedeem,
                    })}
                  </span>
                </div>

                {canRedeem && openOrders.length > 0 && balance >= minRedeem && (
                  <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-[1fr_140px_auto] sm:items-end">
                    <div className="grid gap-1">
                      <Label className="text-xs">{t('Hoá đơn chưa thu tiền')}</Label>
                      <Select value={orderId} onValueChange={setOrderId}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('Chọn hoá đơn')} />
                        </SelectTrigger>
                        <SelectContent>
                          {openOrders.map((order) => (
                            <SelectItem key={order.id} value={String(order.id)}>
                              {`#${order.id} · ${order.tableName ?? order.branchName} · ${money(order.grandTotal)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="points-to-use" className="text-xs">
                        {t('Số điểm')}
                      </Label>
                      <Input
                        id="points-to-use"
                        inputMode="numeric"
                        value={pointsToUse}
                        placeholder={String(minRedeem)}
                        onChange={(event) => setPointsToUse(event.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </div>
                    <Button onClick={submitRedeem} disabled={redeeming || requested <= 0}>
                      {redeeming ? t('Đang đổi…') : t('Đổi điểm')}
                    </Button>
                    <p className="text-xs text-muted-foreground sm:col-span-3">
                      {requested > 0
                        ? t('Giảm {value} cho hoá đơn này', { value: money(valueVnd) })
                        : t('Chỉ trừ được trên hoá đơn CHƯA thanh toán của chính khách này.')}
                    </p>
                  </div>
                )}

                {canRedeem && openOrders.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t('Khách không có hoá đơn nào chưa thanh toán — chưa trừ điểm được.')}
                  </p>
                )}

                {history.length > 0 && (
                  <div className="grid gap-1">
                    <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <History className="h-3.5 w-3.5" />
                      {t('Lịch sử điểm')}
                    </p>
                    <ul className="grid max-h-56 gap-1 overflow-y-auto text-sm">
                      {history.map((entry, index) => (
                        <li
                          key={`${entry.type}-${entry.type === 'EARNED' ? entry.orderId : entry.orderId ?? 'x'}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-md border px-3 py-1.5"
                        >
                          <span className="text-muted-foreground">{dateTime(entry.at)}</span>
                          {entry.type === 'EARNED' ? (
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {t('Đơn #{order} · {amount}', { order: entry.orderId, amount: money(entry.amount) })}
                              </span>
                              <Badge className="tabular-nums">+{entry.points}</Badge>
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {t('Giảm {value} · đơn #{order}', {
                                  value: money(entry.valueVnd),
                                  order: entry.orderId ?? '—',
                                })}
                                {entry.voided ? ` · ${t('đã hoàn điểm')}` : ''}
                              </span>
                              <Badge variant={entry.voided ? 'outline' : 'secondary'} className="tabular-nums">
                                −{entry.points}
                              </Badge>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <NotebookPen className="h-4 w-4" />
                  {t('Ghi chú chăm sóc')}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Textarea
                  value={note}
                  rows={2}
                  placeholder={t('VD: khách VIP, dị ứng hải sản, thích bàn cửa sổ…')}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={!canEditNote}
                />
                {canEditNote ? (
                  <div>
                    <Button variant="outline" size="sm" onClick={submitNote} disabled={savingNote}>
                      <Save className="mr-2 h-4 w-4" />
                      {savingNote ? t('Đang lưu…') : t('Lưu ghi chú')}
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t('Chỉ quản lý (ADMIN) sửa được ghi chú chăm sóc khách.')}
                  </p>
                )}
              </CardContent>
            </Card>

            {detail.recentOrders.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{t('Đơn gần đây')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1 text-sm">
                  {detail.recentOrders.map((order) => (
                    <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-1 last:border-b-0">
                      <span>
                        #{order.id} · {order.tableName ?? order.branchName}
                        <span className="text-muted-foreground"> · {dateTime(order.createdAt)}</span>
                      </span>
                      <span className="flex items-center gap-2 tabular-nums">
                        {money(order.grandTotal)}
                        <Badge variant={order.status === 'PAID' ? 'default' : 'outline'}>
                          {t(ORDER_STATUS_LABEL[order.status] ?? order.status)}
                        </Badge>
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}
