'use client';

import { ArrowDownRight, ArrowUpRight, Minus, Receipt, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardOverview } from '@/app/queries/useIndicator';
import { useI18n } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';

const money = (value: number, locale: string) =>
  `${Math.round(value).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}đ`;

/** % thay đổi: tăng xanh, giảm đỏ, không đổi xám; null = kỳ trước chưa có số */
function ChangeBadge({ value, label }: { value: number | null; label: string }) {
  const { t } = useI18n();
  if (value === null) {
    return (
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        {t('Chưa có số để so sánh')} · {label}
      </p>
    );
  }
  const up = value > 0;
  const flat = value === 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <p
      className={cn('flex items-center gap-1 text-xs', {
        'text-emerald-600': up && !flat,
        'text-rose-600': !up && !flat,
        'text-muted-foreground': flat,
      })}
    >
      <Icon className="h-3 w-3" />
      {up ? '+' : ''}
      {value.toFixed(2)}% · {label}
    </p>
  );
}

/**
 * 4 ô tổng quan + 2 dòng so sánh doanh thu thuần.
 *
 * Số lấy từ `GET /dashboard/overview` (đọc projection từ sổ cái) — cùng nguồn với báo cáo doanh thu,
 * nên không bao giờ lệch với trang Báo cáo. Gọi **một** request cho cả kỳ hiện tại và 2 kỳ so sánh.
 */
export default function OverviewCards({ fromDate, toDate }: { fromDate?: string; toDate?: string }) {
  const { t, locale } = useI18n();
  const { data, isLoading } = useDashboardOverview({ fromDate, toDate });
  const overview = data?.payload?.data;

  const value = (input?: number) => (isLoading ? '…' : money(input ?? 0, locale));

  return (
    <div className="grid gap-4" data-testid="dashboard-overview">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ArrowDownRight className="h-4 w-4" />
              {t('Doanh thu')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{value(overview?.gross)}</p>
            <p className="text-xs text-muted-foreground">
              {t('Sau thuế')}: {value(overview?.grandTotal)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Receipt className="h-4 w-4" />
              {t('Hoá đơn')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {isLoading ? '…' : (overview?.orderCount ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('Thuế')}: {value(overview?.tax)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <RotateCcw className="h-4 w-4" />
              {t('Trả hàng')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{value(overview?.refund)}</p>
            <p className="text-xs text-muted-foreground">
              {t('Sau thuế')}: {value(overview?.refund)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ArrowUpRight className="h-4 w-4" />
              {t('Doanh thu thuần')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{value(overview?.net)}</p>
            <p className="text-xs text-muted-foreground">
              {t('Không gồm thuế và tip')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2 rounded-lg border bg-card p-3">
        <p className="text-sm font-medium">{t('Doanh thu thuần')}</p>
        <ChangeBadge
          value={overview?.changeVsPrevious ?? null}
          label={t('so với kỳ trước ({from} → {to})', {
            from: overview?.previous.fromDate ?? '—',
            to: overview?.previous.toDate ?? '—',
          })}
        />
        <ChangeBadge
          value={overview?.changeVsLastMonth ?? null}
          label={t('so với cùng kỳ tháng trước ({from} → {to})', {
            from: overview?.lastMonth.fromDate ?? '—',
            to: overview?.lastMonth.toDate ?? '—',
          })}
        />
      </div>
    </div>
  );
}
