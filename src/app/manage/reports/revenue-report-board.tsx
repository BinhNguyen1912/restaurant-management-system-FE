'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { BarChart3, Calculator, FileDown, RefreshCw, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetRevenueByItem,
  useGetRevenueReport,
  useRecomputeRevenue,
} from '@/app/queries/useRevenueReport';
import { formatCurrency } from '@/lib/utils';
import { useI18n } from '@/i18n/locale-provider';

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  VNPAY: 'VNPay',
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const firstDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
};
const formatDay = (value: string) => {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

/** số liệu 1 dòng của bảng tổng hợp: các cột tiền đều là Decimal ở BE, đã ra number ở FE */
const COLUMNS: { key: string; label: string }[] = [
  { key: 'gross', label: 'Tiền món' },
  { key: 'discount', label: 'Giảm giá' },
  { key: 'serviceCharge', label: 'Phí phục vụ' },
  { key: 'tax', label: 'VAT' },
  { key: 'net', label: 'Doanh thu thuần' },
  { key: 'cashIn', label: 'Tiền mặt' },
  { key: 'vnpayIn', label: 'VNPay' },
  { key: 'refund', label: 'Hoàn tiền' },
  { key: 'cogs', label: 'Giá vốn' },
  { key: 'grandTotal', label: 'Khách đã trả' },
];

export default function RevenueReportBoard() {
  const { t } = useI18n();
  const [fromDate, setFromDate] = useState(firstDayOfMonth());
  const [toDate, setToDate] = useState(todayISO());

  const query = useMemo(() => ({ fromDate, toDate }), [fromDate, toDate]);
  const { data, isFetching, refetch } = useGetRevenueReport(query);
  const { data: byItem } = useGetRevenueByItem(query);
  const { mutateAsync: recompute, isPending } = useRecomputeRevenue();

  const report = data?.payload;
  const items = byItem?.payload?.rows ?? [];

  const handleRecompute = async () => {
    try {
      const result = await recompute({ fromDate, toDate });
      toast.success(`Đã tính lại ${result.payload?.written ?? 0} ô số liệu`);
    } catch {
      toast.error(t("Không tính lại được báo cáo"));
    }
  };

  /** xuất CSV để kế toán mở bằng Excel (không phụ thuộc thư viện ngoài) */
  const handleExport = () => {
    if (!report) return;
    const header = ['Ngày', 'Chi nhánh', ...COLUMNS.map((column) => column.label), 'Số đơn'];
    const lines = report.rows.map((row) => [
      row.date,
      `${row.branchCode} - ${row.branchName}`,
      ...COLUMNS.map((column) => String((row as unknown as Record<string, number>)[column.key] ?? 0)),
      String(row.orderCount),
    ]);
    const totalsLine = [
      'TỔNG',
      '',
      ...COLUMNS.map((column) => String((report.totals as unknown as Record<string, number>)[column.key] ?? 0)),
      String(report.totals.orderCount),
    ];
    const csv = [header, ...lines, totalsLine]
      .map((cells) => cells.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `doanh-thu-${report.fromDate}-${report.toDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="size-4" /> Kỳ báo cáo
          </CardTitle>
          <CardDescription>
            Số liệu đọc từ sổ cái đã ghi (không phải cộng trạng thái đơn), cắt ngày theo giờ Việt
            Nam.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1">
            <Label htmlFor="report-from">{t("Từ ngày")}</Label>
            <Input
              id="report-from"
              type="date"
              className="w-40"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="report-to">{t("Đến ngày")}</Label>
            <Input
              id="report-to"
              type="date"
              className="w-40"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`size-4 ${isFetching ? 'animate-spin' : ''}`} /> Tải lại
          </Button>
          <Button variant="outline" onClick={handleRecompute} disabled={isPending}>
            <Calculator className="size-4" /> Tính lại từ sổ cái
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={!report?.rows.length}>
            <FileDown className="size-4" /> Xuất CSV
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("Khách đã trả")}</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(report?.totals.grandTotal ?? 0)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {report?.totals.orderCount ?? 0} đơn có bút toán thu tiền
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("Doanh thu thuần")}</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(report?.totals.net ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Đã trừ giảm giá và VAT, chưa gồm tip
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("Thuế phải nộp (VAT)")}</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(report?.totals.tax ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Tách riêng khỏi doanh thu theo ADR 0001
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("Giá vốn (COGS)")}</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(report?.totals.cogs ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Từ recipe × giá nhập nguyên liệu
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("Lãi gộp")}</CardDescription>
            <CardTitle
              className={`text-2xl ${(report?.totals.net ?? 0) - (report?.totals.cogs ?? 0) < 0 ? 'text-destructive' : ''}`}
            >
              {formatCurrency((report?.totals.net ?? 0) - (report?.totals.cogs ?? 0))}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Doanh thu thuần − giá vốn (hoàn tiền {formatCurrency(report?.totals.refund ?? 0)})
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="size-4" /> Tiền vào theo phương thức
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {(report?.byMethod ?? []).map((method) => (
            <div key={method.method} className="rounded-md border px-4 py-3">
              <div className="text-xs text-muted-foreground">{METHOD_LABEL[method.method]}</div>
              <div className="text-lg font-semibold">{formatCurrency(method.amount)}</div>
            </div>
          ))}
          {(report?.byMethod ?? []).length === 0 && (
            <span className="text-sm text-muted-foreground">{t("Chưa có giao dịch trong kỳ")}</span>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("Theo ngày và chi nhánh")}</CardTitle>
          <CardDescription>
            {formatDay(report?.fromDate ?? fromDate)} – {formatDay(report?.toDate ?? toDate)}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Ngày")}</TableHead>
                <TableHead>{t("Chi nhánh")}</TableHead>
                {COLUMNS.map((column) => (
                  <TableHead key={column.key} className="text-right">
                    {column.label}
                  </TableHead>
                ))}
                <TableHead className="text-right">{t("Số đơn")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.rows.map((row) => (
                <TableRow key={`${row.date}-${row.branchId}`}>
                  <TableCell className="whitespace-nowrap">{formatDay(row.date)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="font-medium">{row.branchCode}</span>{' '}
                    <span className="text-xs text-muted-foreground">{row.branchName}</span>
                  </TableCell>
                  {COLUMNS.map((column) => {
                    const value = (row as unknown as Record<string, number>)[column.key] ?? 0;
                    return (
                      <TableCell
                        key={column.key}
                        className={`text-right whitespace-nowrap ${
                          column.key === 'grandTotal' ? 'font-medium' : ''
                        } ${value < 0 ? 'text-destructive' : ''}`}
                      >
                        {formatCurrency(value)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right">{row.orderCount}</TableCell>
                </TableRow>
              ))}
              {!report?.rows.length && (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 3} className="py-8 text-center text-sm text-muted-foreground">
                    {isFetching ? 'Đang tải…' : 'Kỳ này chưa có bút toán thu tiền nào'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {!!report?.rows.length && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>{t("Tổng kỳ")}</TableCell>
                  {COLUMNS.map((column) => (
                    <TableCell key={column.key} className="text-right font-semibold whitespace-nowrap">
                      {formatCurrency(
                        (report?.totals as unknown as Record<string, number>)[column.key] ?? 0,
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-semibold">{report?.totals.orderCount}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("Món bán chạy trong kỳ")}</CardTitle>
          <CardDescription>{t("Nguồn: đơn đã thu tiền, giá snapshot tại thời điểm bán")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Món")}</TableHead>
                <TableHead className="text-right">{t("Số lượng")}</TableHead>
                <TableHead className="text-right">Doanh thu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.slice(0, 12).map((row) => (
                <TableRow key={`${row.productId}-${row.name}`}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{row.quantity}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                </TableRow>
              ))}
              {!items.length && (
                <TableRow>
                  <TableCell colSpan={3} className="py-6 text-center text-sm text-muted-foreground">
                    Kỳ này chưa có món nào được bán
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
