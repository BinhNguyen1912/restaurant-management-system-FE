'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetCashShiftDetail } from '@/app/queries/useCashShift';
import { useI18n } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';

/**
 * Chi tiết một ca thu ngân: **gồm những thu chi nào**.
 *
 * Ba khối, đúng ba nguồn tiền của một ca:
 *  1. tiền mở két,
 *  2. thu từ ĐƠN đã thanh toán tiền mặt (danh sách từng khoản — trước đây chỉ có con số tổng),
 *  3. thu/chi TAY trong ca (danh sách kèm lý do và ảnh chứng từ).
 * Cuối cùng là chênh lệch khi đóng ca (nếu đã đóng).
 */
export default function CashShiftDetailPanel({ shiftId }: { shiftId: number }) {
  const { t, locale } = useI18n();
  const { data, isLoading, isError } = useGetCashShiftDetail(shiftId);
  const shift = data?.payload;

  const money = (value: number) =>
    `${Math.round(value).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}đ`;
  const dateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN') : '—';

  if (isLoading) return <p className="text-sm text-muted-foreground">{t('Đang tải...')}</p>;
  if (isError || !shift) {
    return (
      <div className="grid gap-2">
        <p className="text-sm text-destructive">{t('Không tải được ca này')}</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/manage/cash-shifts">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('Về danh sách ca')}
          </Link>
        </Button>
      </div>
    );
  }

  const live = shift.liveTotals;
  const cashIn = live?.cashIn ?? shift.cashIn;
  const cashInMovements = live?.cashInMovements ?? 0;
  const cashOut = live?.cashOut ?? shift.cashOut;
  const expected = live?.expectedCash ?? shift.expectedCash ?? shift.openingFloat;
  const variance = shift.countedCash !== null && shift.countedCash !== undefined ? shift.countedCash - expected : null;
  const movements = shift.movements ?? [];
  const cashPayments = shift.cashPayments ?? [];

  const cards = [
    { label: t('Tiền mở két'), value: shift.openingFloat, tone: '' },
    { label: t('Thu từ đơn (tiền mặt)'), value: cashIn, tone: 'text-emerald-600' },
    { label: t('Thu tay trong ca'), value: cashInMovements, tone: 'text-emerald-600' },
    { label: t('Chi tay trong ca'), value: cashOut, tone: 'text-rose-600' },
    { label: t('Số két phải có'), value: expected, tone: '' },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Button asChild variant="ghost" size="sm">
            <Link href="/manage/cash-shifts">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t('Danh sách ca')}
            </Link>
          </Button>
          <span>
            {t('Ca')} #{shift.id}
          </span>
          <span>·</span>
          <span>
            {t('Mở')}: {dateTime(shift.openedAt)}
          </span>
          <span>·</span>
          <span>
            {t('Đóng')}: {dateTime(shift.closedAt)}
          </span>
        </div>
        <Badge variant={shift.status === 'OPEN' ? 'default' : 'secondary'}>
          {shift.status === 'OPEN' ? t('Đang mở') : t('Đã đóng')}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn('text-lg font-semibold tabular-nums', card.tone)}>{money(card.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {shift.countedCash !== null && shift.countedCash !== undefined && (
        <div className="grid gap-1 rounded-lg border p-3 text-sm">
          <p>
            {t('Tiền đếm khi đóng ca')}: <span className="font-semibold">{money(shift.countedCash)}</span>
          </p>
          {variance !== null && (
            <p
              className={cn(
                'font-medium',
                variance === 0 ? 'text-emerald-600' : variance > 0 ? 'text-amber-600' : 'text-rose-600',
              )}
            >
              {variance === 0
                ? t('Khớp két')
                : variance > 0
                  ? `${t('Thừa')} ${money(variance)}`
                  : `${t('Thiếu')} ${money(Math.abs(variance))}`}
            </p>
          )}
        </div>
      )}

      {/* 1. Thu/chi TAY trong ca */}
      <div className="grid gap-2">
        <p className="text-sm font-medium">{t('Thu/chi tay trong ca')}</p>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">{t('Thời điểm')}</TableHead>
                <TableHead className="w-[90px]">{t('Loại')}</TableHead>
                <TableHead>{t('Lý do')}</TableHead>
                <TableHead className="w-[120px]">{t('Chứng từ')}</TableHead>
                <TableHead className="w-[140px] text-right">{t('Số tiền')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-5 text-center text-sm text-muted-foreground">
                    {t('Không có thu/chi tay trong ca này')}
                  </TableCell>
                </TableRow>
              )}
              {movements.map((movement) => {
                const isIn = movement.type === 'IN';
                return (
                  <TableRow key={movement.id}>
                    <TableCell className="text-xs tabular-nums">{dateTime(movement.createdAt)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-medium',
                          isIn ? 'text-emerald-600' : 'text-rose-600',
                        )}
                      >
                        {isIn ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {isIn ? t('Thu') : t('Chi')}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{movement.reason}</TableCell>
                    <TableCell>
                      {movement.evidenceUrls?.length ? (
                        <div className="flex gap-1">
                          {movement.evidenceUrls.map((url) => (
                            <a key={url} href={url} target="_blank" rel="noreferrer" title={t('Mở chứng từ')}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={url} alt={t('Chứng từ')} className="h-9 w-9 rounded border object-cover" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className={cn('text-right tabular-nums', isIn ? 'text-emerald-600' : 'text-rose-600')}>
                      {isIn ? '+' : '−'}
                      {money(movement.amount)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 2. Thu tiền mặt từ ĐƠN trong ca */}
      <div className="grid gap-2">
        <p className="text-sm font-medium">{t('Thu tiền mặt từ đơn trong ca')}</p>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[130px]">{t('Thời điểm')}</TableHead>
                <TableHead>{t('Đơn')}</TableHead>
                <TableHead className="w-[160px] text-right">{t('Số tiền')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-5 text-center text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {t('Chưa thu tiền mặt từ đơn nào trong ca này')}
                    </span>
                  </TableCell>
                </TableRow>
              )}
              {cashPayments.map((payment) => (
                <TableRow key={payment.paymentId}>
                  <TableCell className="text-xs tabular-nums">{dateTime(payment.paidAt)}</TableCell>
                  <TableCell className="text-sm">
                    {payment.orderIds.length
                      ? payment.orderIds.map((orderId) => (
                          <Link
                            key={orderId}
                            href={`/manage/orders?search=${orderId}`}
                            className="mr-2 text-primary underline"
                          >
                            #{orderId}
                          </Link>
                        ))
                      : `#${payment.paymentId}`}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{money(payment.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">
          {t('Tổng thu từ đơn')}: <span className="font-medium text-foreground">{money(cashIn)}</span>
          {' · '}
          {t('Tổng thu tay')}: <span className="font-medium text-foreground">{money(cashInMovements)}</span>
          {' · '}
          {t('Tổng chi')}: <span className="font-medium text-foreground">{money(cashOut)}</span>
        </p>
      </div>
    </div>
  );
}
