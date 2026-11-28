'use client';

import { useMemo, useState } from 'react';
import { CakeSlice, Coffee, Repeat, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGetCustomerReport } from '@/app/queries/useCustomers';
import { useI18n } from '@/i18n/locale-provider';

const numberVN = (value: number) => new Intl.NumberFormat('vi-VN').format(value ?? 0);

/** hôm nay theo giờ VN — BE cắt kỳ báo cáo theo ngày VN, không phải UTC */
const vnToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

const daysAgo = (days: number) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(
    new Date(Date.now() - days * 24 * 60 * 60 * 1000),
  );

/**
 * Bốn con số trả lời câu hỏi của quản lý: "tháng này có khách mới không, khách cũ có quay lại không".
 * Tất cả đọc từ `/customers/report/overview` — cùng nguồn với danh sách nên không thể lệch.
 */
export default function CustomerInsightCards() {
  const { t } = useI18n();
  const [range, setRange] = useState<{ fromDate: string; toDate: string }>({
    fromDate: daysAgo(29),
    toDate: vnToday(),
  });
  const { data, isLoading } = useGetCustomerReport(range);
  const report = data?.payload?.data;

  const cards = useMemo(
    () => [
      {
        key: 'active',
        Icon: Coffee,
        label: t('Khách tới trong kỳ'),
        value: report ? numberVN(report.activeCustomers) : '—',
        hint: report ? t('{count} hồ sơ trong hệ thống').replace('{count}', numberVN(report.profileCount)) : '',
      },
      {
        key: 'new',
        Icon: UserPlus,
        label: t('Khách mới'),
        value: report ? numberVN(report.newCustomers) : '—',
        hint: t('Lần đầu tới nằm trong kỳ'),
      },
      {
        key: 'returning',
        Icon: Repeat,
        label: t('Khách quay lại'),
        value: report ? numberVN(report.returningCustomers) : '—',
        hint: report ? t('Đã từng tới trước kỳ') : '',
      },
      {
        key: 'repeat',
        Icon: CakeSlice,
        label: t('Tỉ lệ quay lại'),
        value: report ? `${Math.round(report.repeatRate * 100)}%` : '—',
        hint: t('Càng cao càng tốt: khách cũ chịu quay lại'),
      },
    ],
    [report, t],
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1">
          <Label htmlFor="customer-report-from" className="text-xs text-muted-foreground">
            {t('Từ ngày')}
          </Label>
          <Input
            id="customer-report-from"
            type="date"
            className="h-9 w-40"
            value={range.fromDate}
            onChange={(event) => setRange((prev) => ({ ...prev, fromDate: event.target.value }))}
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="customer-report-to" className="text-xs text-muted-foreground">
            {t('Đến ngày')}
          </Label>
          <Input
            id="customer-report-to"
            type="date"
            className="h-9 w-40"
            value={range.toDate}
            onChange={(event) => setRange((prev) => ({ ...prev, toDate: event.target.value }))}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, Icon, label, value, hint }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-2xl font-semibold tabular-nums">{isLoading ? '…' : value}</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {report && report.topCustomers.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('Top khách chi tiêu trong kỳ')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {report.topCustomers.slice(0, 5).map((customer, index) => (
              <span key={customer.id} className="tabular-nums">
                <span className="text-muted-foreground">{index + 1}. </span>
                {customer.name}
                <span className="text-muted-foreground">
                  {' · '}
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(
                    customer.totalSpend,
                  )}
                </span>
              </span>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
