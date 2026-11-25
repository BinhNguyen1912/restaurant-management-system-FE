'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { AlertTriangle, CheckCircle2, Landmark, RefreshCw } from 'lucide-react';
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
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useGetReconciliation,
  useSettleVnpay,
} from '@/app/queries/useLedgerReconciliation';
import { formatCurrency } from '@/lib/utils';
import { useI18n } from '@/i18n/locale-provider';
import { T } from '@/components/t';

const METHOD_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  VNPAY: 'VNPay',
};

const formatTime = (value: string) => new Date(value).toLocaleString('vi-VN');

export default function ReconciliationBoard() {
  const { t } = useI18n();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  const { data, isFetching, refetch } = useGetReconciliation({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });
  const { mutateAsync: settle, isPending } = useSettleVnpay();

  const report = data?.payload;
  const balanced = (report?.totals.difference ?? 0) === 0;

  const handleSettle = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await settle({
        amount: Number(amount),
        reference: reference.trim(),
        note: note.trim() || undefined,
      });
      const created = (result?.payload as any)?.data?.created;
      toast.success(
        created ? 'Đã ghi bút toán chuyển tiền VNPay về ngân hàng' : 'Giao dịch này đã được ghi trước đó (không ghi lặp)',
      );
      setAmount('');
      setReference('');
      setNote('');
    } catch (error: any) {
      toast.error(error?.message ?? 'Không ghi được bút toán đối soát');
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {balanced ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            Đối soát: tiền đã thu vs sổ cái
          </CardTitle>
          <CardDescription>
            Tiền khách đã trả (Payment SUCCESS) theo từng phương thức phải bằng số phát sinh Nợ
            trên tài khoản nhận tiền tương ứng — lệch nghĩa là có giao dịch thu mà chưa ghi sổ.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="grid gap-1">
              <Label htmlFor="from">{t("Từ ngày")}</Label>
              <Input id="from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="to">{t("Đến ngày")}</Label>
              <Input id="to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className="mr-1 h-4 w-4" /> Kiểm lại
            </Button>
            {report?.checkedAt ? (
              <span className="text-xs text-muted-foreground">lúc {formatTime(report.checkedAt)}</span>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-muted-foreground">{t("Tiền đã thu")}</div>
              <div className="text-xl font-semibold">
                {formatCurrency(report?.totals.paymentAmount ?? 0)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-muted-foreground">{t("Ghi sổ (Nợ)")}</div>
              <div className="text-xl font-semibold">
                {formatCurrency(report?.totals.ledgerAmount ?? 0)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-muted-foreground">{t("Chênh lệch")}</div>
              <div
                className={
                  balanced
                    ? 'text-xl font-semibold text-emerald-600'
                    : 'text-xl font-semibold text-destructive'
                }
              >
                {formatCurrency(report?.totals.difference ?? 0)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-muted-foreground">{t("VNPay chờ về")}</div>
              <div className="text-xl font-semibold">
                {formatCurrency(report?.vnpayClearingBalance ?? 0)}
              </div>
              <div className="text-xs text-muted-foreground">{t("tài khoản VNPAY_CLEARING")}</div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Phương thức")}</TableHead>
                <TableHead>{t("Tài khoản nhận tiền")}</TableHead>
                <TableHead className="text-right">{t("Số giao dịch")}</TableHead>
                <TableHead className="text-right">{t("Tiền đã thu")}</TableHead>
                <TableHead className="text-right">{t("Ghi sổ")}</TableHead>
                <TableHead className="text-right">{t("Lệch")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(report?.methods ?? []).map((row) => (
                <TableRow key={row.method}>
                  <TableCell>{METHOD_LABEL[row.method] ?? row.method}</TableCell>
                  <TableCell className="font-mono text-xs">{row.accountCode}</TableCell>
                  <TableCell className="text-right">{row.payments}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.paymentAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(row.ledgerAmount)}</TableCell>
                  <TableCell
                    className={
                      row.difference === 0
                        ? 'text-right'
                        : 'text-right font-medium text-destructive'
                    }
                  >
                    {formatCurrency(row.difference)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(report?.paymentsWithoutEntry.length ?? 0) > 0 ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <div className="font-medium text-destructive">
                {report?.paymentsWithoutEntry.length} giao dịch đã thu nhưng CHƯA ghi sổ
              </div>
              <ul className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {report?.paymentsWithoutEntry.map((payment) => (
                  <li key={payment.paymentId}>
                    <Badge variant="outline">#{payment.paymentId}</Badge> {payment.method}{' '}
                    {formatCurrency(payment.amount)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" /> Ngân hàng báo có tiền VNPay
          </CardTitle>
          <CardDescription>
            Ghi bút toán <b>{t("Nợ BANK / Có VNPAY_CLEARING")}</b> theo sao kê ngân hàng. Mã đối soát là
            khoá chống trùng: bấm lại cùng mã sẽ không ghi lần hai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap items-end gap-2" onSubmit={handleSettle}>
            <div className="grid w-40 gap-1">
              <Label htmlFor="amount">{t("Số tiền báo có")}</Label>
              <Input
                id="amount"
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </div>
            <div className="grid min-w-[12rem] flex-1 gap-1">
              <Label htmlFor="reference">{t("Mã sao kê / giao dịch")}</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="VCB-241124-001"
                required
              />
            </div>
            <div className="grid min-w-[12rem] flex-1 gap-1">
              <Label htmlFor="note">{t("Ghi chú (tuỳ chọn)")}</Label>
              <Input id="note" value={note} onChange={(event) => setNote(event.target.value)} />
            </div>
            <Button type="submit" disabled={isPending}>
              <T>Ghi đối soát</T>
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Không chuyển được nhiều hơn số dư <b>VNPAY_CLEARING</b> hiện có (
            {formatCurrency(report?.vnpayClearingBalance ?? 0)}).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
