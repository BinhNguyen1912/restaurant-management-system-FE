'use client';

import { Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useDashboardOverview } from '@/app/queries/useIndicator';
import { useI18n } from '@/i18n/locale-provider';
import { MONEY_COLORS } from '@/app/manage/dashboard/chart-palette';

/** Tỷ trọng tiền vào quỹ theo phương thức: Tiền mặt vs Chuyển khoản (VNPay) */
export default function PaymentMethodChart({ fromDate, toDate }: { fromDate?: string; toDate?: string }) {
  const { t, locale } = useI18n();
  const { data, isLoading } = useDashboardOverview({ fromDate, toDate });
  const overview = data?.payload?.data;

  const fmt = (value: number) =>
    `${Math.round(value).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}đ`;

  const data2 = [
    { key: 'cash', label: t('Tiền mặt'), value: overview?.cashIn ?? 0, color: MONEY_COLORS.cash },
    { key: 'vnpay', label: t('Chuyển khoản'), value: overview?.vnpayIn ?? 0, color: MONEY_COLORS.vnpay },
  ].filter((item) => item.value > 0);

  const total = data2.reduce((sum, item) => sum + item.value, 0);
  const chartConfig: ChartConfig = Object.fromEntries(
    data2.map((item) => [item.key, { label: item.label, color: item.color }]),
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{t('Phương thức thanh toán')}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t('Tiền vào quỹ chia theo cách khách trả')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="h-[220px] animate-pulse rounded-full bg-muted" />
        ) : data2.length === 0 ? (
          <p className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            {t('Chưa có khoản thu nào trong kỳ này')}
          </p>
        ) : (
          <div className="grid gap-2">
            <ChartContainer config={chartConfig} className="mx-auto h-[200px] w-full">
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel formatter={(value) => [fmt(Number(value)), '']} />}
                />
                <Pie
                  data={data2}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                  strokeWidth={2}
                >
                  {data2.map((item) => (
                    <Cell key={item.key} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="grid gap-1.5 text-sm">
              {data2.map((item) => (
                <li key={item.key} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span className="tabular-nums">
                    {fmt(item.value)}
                    {total > 0 && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {Math.round((item.value / total) * 100)}%
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
