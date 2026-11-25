'use client';

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DashboardIndicatorType } from '@/app/ValidationSchemas/dashboard.model';
import { useMemo } from 'react';
import { useI18n } from '@/i18n/locale-provider';
import { colorAt } from '@/app/manage/dashboard/chart-palette';

/** Top món: mỗi món một màu trong bảng màu, cột bo tròn, số đơn in ngay cuối cột */
export function DishBarChart({
  productIndicator = [],
}: {
  productIndicator?: Pick<
    DashboardIndicatorType['productIndicator'][0],
    'id' | 'name' | 'successOrders'
  >[];
}) {
  const { t } = useI18n();

  // Món bán chạy nhất ở trên: sắp giảm dần và chỉ lấy 8 món để nhãn không bị chồng
  const topDishes = useMemo(
    () =>
      [...productIndicator]
        .filter((item) => Number(item.successOrders) > 0)
        .sort((a, b) => Number(b.successOrders) - Number(a.successOrders))
        .slice(0, 8)
        .map((item, index) => ({
          ...item,
          successOrders: Number(item.successOrders),
          fill: colorAt(index),
        })),
    [productIndicator],
  );

  const chartConfig: ChartConfig = useMemo(
    () =>
      topDishes.reduce((acc, item) => {
        acc[item.name] = { label: item.name, color: item.fill };
        return acc;
      }, {} as ChartConfig),
    [topDishes],
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{t('Xếp hạng món ăn')}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {topDishes.length > 0 ? t('Top {count} món được gọi nhiều nhất', { count: topDishes.length }) : t('Xếp hạng món ăn')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {topDishes.length === 0 ? (
          <p className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            {t('Chưa có món nào được gọi trong kỳ này')}
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={topDishes} layout="vertical" margin={{ left: 8, right: 32, top: 8, bottom: 8 }}>
              <defs>
                {topDishes.map((dish, index) => (
                  <linearGradient key={dish.id} id={`dishGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={dish.fill} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={dish.fill} stopOpacity={0.55} />
                  </linearGradient>
                ))}
              </defs>

              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={96}
                tickFormatter={(value: string) => (value.length > 14 ? `${value.slice(0, 14)}…` : value)}
              />
              <XAxis type="number" hide />
              <ChartTooltip
                cursor={{ fill: 'currentColor', fillOpacity: 0.06 }}
                content={
                  <ChartTooltipContent formatter={(value) => [`${value}`, t('Đơn hàng')]} />
                }
              />
              <Bar dataKey="successOrders" name={t('Đơn hàng')} layout="vertical" radius={[6, 6, 6, 6]} barSize={22}>
                {topDishes.map((dish, index) => (
                  <Cell key={dish.id} fill={`url(#dishGradient-${index})`} />
                ))}
                <LabelList
                  dataKey="successOrders"
                  position="right"
                  className="fill-foreground text-xs font-semibold"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
