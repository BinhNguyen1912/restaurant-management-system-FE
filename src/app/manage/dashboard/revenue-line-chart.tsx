'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { format, parse } from 'date-fns';
import { DashboardIndicatorType } from '@/app/ValidationSchemas/dashboard.model';
import { useI18n } from '@/i18n/locale-provider';
import { colorAt } from '@/app/manage/dashboard/chart-palette';

const chartConfig = {
  revenue: { label: 'Doanh thu', color: colorAt(0) },
} satisfies ChartConfig;

/**
 * Doanh thu theo thời gian: vùng gradient indigo → cyan, đường đậm, điểm active có viền trắng.
 * Trước đây chỉ 1 màu nhạt (`--chart-1`) nên biểu đồ gần như chìm vào nền.
 */
export function RevenueAreaChart({
  revenueByDate = [],
}: {
  revenueByDate?: DashboardIndicatorType['revenueByDate'];
}) {
  const { t, locale } = useI18n();
  const total = revenueByDate.reduce((sum, item) => sum + Number(item.revenue ?? 0), 0);
  const peak = revenueByDate.reduce(
    (best, item) => (Number(item.revenue) > Number(best?.revenue ?? 0) ? item : best),
    revenueByDate[0],
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{t('Biểu đồ doanh thu')}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t('Doanh thu theo thời gian')}
          {peak ? ` · ${t('cao nhất')} ${peak.date}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {revenueByDate.length === 0 ? (
          <p className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            {t('Chưa có doanh thu trong kỳ này')}
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart accessibilityLayer data={revenueByDate} margin={{ left: 8, right: 16, top: 16, bottom: 8 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colorAt(0)} stopOpacity={0.75} />
                  <stop offset="55%" stopColor={colorAt(1)} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={colorAt(1)} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={colorAt(0)} />
                  <stop offset="100%" stopColor={colorAt(1)} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" vertical={false} className="stroke-border" />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => {
                  try {
                    return format(parse(value, 'dd/MM/yyyy', new Date()), 'dd/MM');
                  } catch {
                    return value;
                  }
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={56}
                tickFormatter={(value) => {
                  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
                  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
                  return String(value);
                }}
              />

              <ChartTooltip
                cursor={{ stroke: colorAt(1), strokeDasharray: '5 5', strokeWidth: 1.5 }}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => [
                      `${Number(value).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}đ`,
                      t('Doanh thu'),
                    ]}
                  />
                }
              />

              <Area
                type="monotone"
                dataKey="revenue"
                name={t('Doanh thu')}
                stroke="url(#revenueStroke)"
                strokeWidth={3}
                fill="url(#revenueFill)"
                dot={{ r: 0 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: colorAt(0) }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-6 pb-4 text-xs text-muted-foreground">
        <span>
          {t('Tổng')}:{' '}
          <span className="font-semibold text-foreground">
            {Math.round(total).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}đ
          </span>
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: colorAt(0) }} />
          {t('Doanh thu')}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ background: colorAt(1) }} />
          {t('Xu hướng')}
        </span>
      </div>
    </Card>
  );
}
