'use client';

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useDashboardOverview } from '@/app/queries/useIndicator';
import { useI18n } from '@/i18n/locale-provider';
import { MONEY_COLORS } from '@/app/manage/dashboard/chart-palette';

/**
 * Cơ cấu doanh thu: một thanh xếp chồng, mỗi phần một màu — thấy ngay tiền món, phụ thu, thuế,
 * giảm giá chiếm bao nhiêu. Số lấy từ `GET /dashboard/overview` (đã có sẵn trong projection).
 */
export default function RevenueCompositionChart({ fromDate, toDate }: { fromDate?: string; toDate?: string }) {
  const { t, locale } = useI18n();
  const { data, isLoading } = useDashboardOverview({ fromDate, toDate });
  const overview = data?.payload?.data;

  const fmt = (value: number) =>
    `${Math.round(value).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}đ`;

  const parts = [
    { key: 'gross', label: t('Tiền món'), value: overview?.gross ?? 0, color: MONEY_COLORS.gross },
    { key: 'serviceCharge', label: t('Phụ thu'), value: overview?.serviceCharge ?? 0, color: MONEY_COLORS.serviceCharge },
    { key: 'tax', label: t('Thuế'), value: overview?.tax ?? 0, color: MONEY_COLORS.tax },
    { key: 'tip', label: t('Tip'), value: overview?.tip ?? 0, color: MONEY_COLORS.tip },
    { key: 'discount', label: t('Giảm giá'), value: overview?.discount ?? 0, color: MONEY_COLORS.discount },
  ].filter((item) => item.value > 0);

  const chartData = [{ name: 'composition', ...Object.fromEntries(parts.map((part) => [part.key, part.value])) }];
  const chartConfig: ChartConfig = Object.fromEntries(
    parts.map((part) => [part.key, { label: part.label, color: part.color }]),
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{t('Cơ cấu doanh thu')}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t('Một hoá đơn gồm những phần nào')}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 p-4">
        {isLoading ? (
          <div className="h-[120px] animate-pulse rounded-md bg-muted" />
        ) : parts.length === 0 ? (
          <p className="flex h-[120px] items-center justify-center text-sm text-muted-foreground">
            {t('Chưa có doanh thu trong kỳ này')}
          </p>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[120px] w-full">
              <BarChart accessibilityLayer data={chartData} layout="vertical" margin={{ left: 0, right: 0, top: 8, bottom: 8 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent formatter={(value) => [fmt(Number(value)), '']} />}
                />
                {parts.map((part, index) => (
                  <Bar
                    key={part.key}
                    dataKey={part.key}
                    stackId="composition"
                    fill={part.color}
                    radius={
                      index === 0
                        ? [6, 0, 0, 6]
                        : index === parts.length - 1
                          ? [0, 6, 6, 0]
                          : [0, 0, 0, 0]
                    }
                  />
                ))}
              </BarChart>
            </ChartContainer>

            <ul className="grid gap-1.5 text-sm">
              {parts.map((part) => (
                <li key={part.key} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: part.color }} />
                    {part.label}
                  </span>
                  <span className="tabular-nums">{fmt(part.value)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
