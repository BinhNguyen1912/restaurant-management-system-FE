'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetCustomers } from '@/app/queries/useCustomers';
import CustomerDetailDialog from '@/app/manage/customers/customer-detail-dialog';
import { useI18n } from '@/i18n/locale-provider';

const money = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const dateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

/**
 * Danh sách hồ sơ khách. Tìm theo SĐT là đường đi chính (quầy thu ngân hỏi số điện thoại), nên ô
 * tìm kiếm đứng đầu và BE chuẩn hoá cả phần số (gõ "0901 234" vẫn ra).
 */
export default function CustomerTable() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const limit = 10;

  const params = useMemo(
    () => ({ page, limit, search: search.trim() || undefined, sort: 'newest' as const }),
    [page, search],
  );
  const { data, isLoading, isError } = useGetCustomers(params);

  const customers = data?.payload?.data ?? [];
  const totalItems = data?.payload?.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  /** xoá dòng cuối của trang cuối -> trang hiện tại vượt quá tổng số trang, lùi lại cho khỏi trống */
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <Card>
      <CardContent className="grid gap-4 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('Tìm theo số điện thoại hoặc tên')}
              className="pl-9"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('{count} khách', { count: totalItems })}
          </p>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Khách')}</TableHead>
                <TableHead className="text-right">{t('Đơn đã trả')}</TableHead>
                <TableHead className="text-right">{t('Tổng chi')}</TableHead>
                <TableHead>{t('Lần cuối tới')}</TableHead>
                <TableHead className="text-right">{t('Điểm')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && isError && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-destructive">
                    {t('Không tải được danh sách khách')}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    {search
                      ? t('Không tìm thấy khách khớp từ khoá')
                      : t('Chưa có hồ sơ khách nào — hồ sơ được tạo khi khách đặt bàn')}
                  </TableCell>
                </TableRow>
              )}

              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">{customer.phone}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{customer.stats.orderCount}</TableCell>
                  <TableCell className="text-right tabular-nums">{money(customer.stats.totalSpend)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {dateTime(customer.stats.lastVisitAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={customer.points.balance > 0 ? 'default' : 'outline'} className="tabular-nums">
                      {customer.points.balance}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedId(customer.id);
                        setDialogOpen(true);
                      }}
                    >
                      {t('Hồ sơ')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t('Trang {page}/{total}', { page, total: totalPages })}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {t('Trước')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t('Sau')}
            </Button>
          </div>
        </div>
      </CardContent>

      <CustomerDetailDialog customerId={selectedId} open={dialogOpen} onOpenChange={setDialogOpen} />
    </Card>
  );
}
