'use client';

import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetCashBookLines } from '@/app/queries/useLedgerEntry';
import { useI18n } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

/**
 * Danh sách DÒNG của sổ quỹ — phần chứng minh cho 4 thẻ số phía trên.
 *
 * Thẻ nói "tổng thu X" mà không có dòng thì người dùng không có cách nào kiểm tra. Bảng này liệt kê
 * từng bút toán (ngày, thu/chi, quỹ, diễn giải, số tiền) và **đối chiếu tổng cả kỳ** với thẻ ngay
 * trên đầu bảng, để thấy ngay là khớp hay lệch.
 */
export default function CashBookLinesTable({
  account,
  branchId,
}: {
  /** 'CASH' | 'BANK' theo tab; undefined = cả hai quỹ */
  account?: 'CASH' | 'BANK';
  branchId?: number;
}) {
  const { t, locale } = useI18n();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetCashBookLines({
    account,
    branchId,
    page,
    limit: PAGE_SIZE,
  });

  const payload = data?.payload?.data;
  const lines = payload?.lines ?? [];
  const totalPages = payload ? Math.max(1, Math.ceil(payload.totalItems / payload.limit)) : 1;

  const money = (value: number) =>
    `${Math.round(value).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}đ`;
  const dateTime = (value: string) =>
    new Date(value).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="grid gap-2">
      {/* Đối chiếu với thẻ: cùng kỳ, cùng phạm vi chi nhánh */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="font-medium">{t('Chi tiết phát sinh')}</p>
        {payload && (
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              {t('Tổng thu (cả kỳ)')}:{' '}
              <span className="font-semibold text-emerald-600">{money(payload.inflow)}</span>
            </span>
            <span>
              {t('Tổng chi (cả kỳ)')}:{' '}
              <span className="font-semibold text-rose-600">{money(payload.outflow)}</span>
            </span>
            <span>
              {t('{count} dòng', { count: payload.totalItems })}
            </span>
          </p>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[130px]">{t('Thời điểm')}</TableHead>
              <TableHead className="w-[110px]">{t('Loại')}</TableHead>
              <TableHead className="w-[110px]">{t('Quỹ')}</TableHead>
              <TableHead>{t('Diễn giải')}</TableHead>
              <TableHead className="w-[140px] text-right">{t('Số tiền')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  {t('Đang tải...')}
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-destructive">
                  {t('Không tải được chi tiết phát sinh')}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && lines.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                  {t('Chưa có phát sinh nào trong kỳ này')}
                </TableCell>
              </TableRow>
            )}
            {lines.map((line) => {
              const isInflow = line.direction === 'DEBIT';
              return (
                <TableRow key={line.id}>
                  <TableCell className="tabular-nums text-xs">{dateTime(line.occurredAt)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        isInflow ? 'text-emerald-600' : 'text-rose-600',
                      )}
                    >
                      {isInflow ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {isInflow ? t('Thu') : t('Chi')}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">{line.accountName}</TableCell>
                  <TableCell className="text-sm">
                    {line.memo ?? line.refType}
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">{line.refType}</span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right tabular-nums',
                      isInflow ? 'text-emerald-600' : 'text-rose-600',
                    )}
                  >
                    {isInflow ? '+' : '−'}
                    {money(line.amount)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t('Trang {page}/{total}', { page: payload?.page ?? 1, total: totalPages })}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              {t('Trước')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              {t('Sau')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
