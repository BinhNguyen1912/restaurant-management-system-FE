'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
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
  LEDGER_REF_TYPE_LABEL,
  LedgerRefTypeValue,
} from '@/app/ValidationSchemas/ledger-entry.schema';
import {
  useGetLedgerEntries,
  useGetLedgerIntegrity,
} from '@/app/queries/useLedgerEntry';
import { formatCurrency } from '@/lib/utils';
import { useI18n } from '@/i18n/locale-provider';
import { T } from '@/components/t';

const REF_TYPES: LedgerRefTypeValue[] = [
  'ORDER_PAID_CASH',
  'ORDER_PAID_VNPAY',
  'RESERVATION_DEPOSIT',
  'DEPOSIT_SETTLED',
  'REFUND',
  'REVERSAL',
  'CASH_VARIANCE',
];

const formatTime = (value: string | null) =>
  value ? new Date(value).toLocaleString('vi-VN') : '—';

export default function LedgerJournal() {
  const { t } = useI18n();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [refType, setRefType] = useState<'' | LedgerRefTypeValue>('');
  const [accountCode, setAccountCode] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number[]>([]);

  const query = {
    page,
    limit: 20,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    refType: refType || undefined,
    accountCode: accountCode.trim() ? accountCode.trim().toUpperCase() : undefined,
    search: search.trim() || undefined,
  };

  const integrity = useGetLedgerIntegrity();
  const entries = useGetLedgerEntries(query);

  const report = integrity.data?.payload;
  const rows = entries.data?.payload?.data ?? [];
  const totals = entries.data?.payload?.totals;
  const totalPages = entries.data?.payload?.totalPages ?? 1;

  const toggle = (id: number) =>
    setExpanded((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const resetFilters = () => {
    setFromDate('');
    setToDate('');
    setRefType('');
    setAccountCode('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {report?.ok ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            Sổ cái có cân không?
          </CardTitle>
          <CardDescription>
            Sổ kép phải luôn <b>{t("Tổng Nợ = Tổng Có")}</b>. Nếu chênh lệch ≠ 0 hoặc có bút toán lệch,
            dữ liệu đã bị ghi sai và phải tìm đúng bút toán trong nhật ký bên dưới.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-muted-foreground">{t("Tổng Nợ (Debit)")}</div>
              <div className="text-xl font-semibold">
                {formatCurrency(report?.totalDebit ?? 0)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-muted-foreground">{t("Tổng Có (Credit)")}</div>
              <div className="text-xl font-semibold">
                {formatCurrency(report?.totalCredit ?? 0)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-muted-foreground">{t("Chênh lệch")}</div>
              <div
                className={
                  (report?.difference ?? 0) === 0
                    ? 'text-xl font-semibold text-emerald-600'
                    : 'text-xl font-semibold text-destructive'
                }
              >
                {formatCurrency(report?.difference ?? 0)}
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-xs uppercase text-muted-foreground">{t("Bút toán")}</div>
              <div className="text-xl font-semibold">
                {report?.postedEntries ?? 0}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}
                  posted · {report?.lineCount ?? 0} dòng
                </span>
              </div>
            </div>
          </div>

          {report && !report.ok ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" /> Phát hiện bất thường
              </div>
              <ul className="mt-1 list-inside list-disc text-muted-foreground">
                {report.unbalancedEntries > 0 ? (
                  <li>
                    <b>{report.unbalancedEntries}</b> bút toán lệch (Σ Nợ ≠ Σ Có hoặc &lt; 2 dòng)
                  </li>
                ) : null}
                {report.staleDrafts > 0 ? (
                  <li>
                    <b>{report.staleDrafts}</b> bút toán DRAFT treo quá 5 phút
                  </li>
                ) : null}
                {report.paidPaymentsWithoutEntry > 0 ? (
                  <li>
                    <b>{report.paidPaymentsWithoutEntry}</b> payment đã SUCCESS nhưng chưa có bút toán
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                integrity.refetch();
                entries.refetch();
              }}
              disabled={integrity.isFetching || entries.isFetching}
            >
              <RefreshCw className="mr-1 h-3 w-3" /> Kiểm lại
            </Button>
            {report?.checkedAt ? <>lúc {formatTime(report.checkedAt)}</> : null}
            {report && report.draftEntries > 0 ? (
              <span className="text-amber-600">{report.draftEntries} bút toán DRAFT</span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Nhật ký bút toán (audit)")}</CardTitle>
          <CardDescription>
            Bấm vào dòng để xem các dòng Nợ/Có của bút toán. Sổ cái là append-only: sai thì ghi
            bút toán đảo, không sửa/xoá.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="grid gap-1">
              <Label htmlFor="from">{t("Từ ngày")}</Label>
              <Input
                id="from"
                type="date"
                value={fromDate}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="to">{t("Đến ngày")}</Label>
              <Input
                id="to"
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="refType">{t("Loại nghiệp vụ")}</Label>
              <select
                id="refType"
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={refType}
                onChange={(event) => {
                  setRefType(event.target.value as '' | LedgerRefTypeValue);
                  setPage(1);
                }}
              >
                <option value="">{t("Tất cả")}</option>
                {REF_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {LEDGER_REF_TYPE_LABEL[value]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="account">{t("Tài khoản (mã)")}</Label>
              <Input
                id="account"
                placeholder="CASH, TAX_PAYABLE…"
                className="w-40"
                value={accountCode}
                onChange={(event) => {
                  setAccountCode(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="grid min-w-[12rem] flex-1 gap-1">
              <Label htmlFor="search">{t("Tìm")}</Label>
              <Input
                id="search"
                placeholder="memo / eventKey / refId"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Button variant="ghost" onClick={resetFilters}>
              <T>Xoá lọc</T>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {entries.data?.payload?.totalItems ?? 0} bút toán khớp lọc · tổng Nợ{' '}
            {formatCurrency(totals?.debit ?? 0)} · tổng Có {formatCurrency(totals?.credit ?? 0)}
            {(totals?.difference ?? 0) !== 0 ? (
              <span className="text-destructive">
                {' '}
                · lệch {formatCurrency(totals?.difference ?? 0)}
              </span>
            ) : null}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>{t("Bút toán")}</TableHead>
                <TableHead>{t("Ngày")}</TableHead>
                <TableHead>{t("Nghiệp vụ")}</TableHead>
                <TableHead>{t("Ghi chú")}</TableHead>
                <TableHead className="text-right">{t("Nợ")}</TableHead>
                <TableHead className="text-right">{t("Có")}</TableHead>
                <TableHead>{t("Cân")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-sm text-muted-foreground">
                    <T>Đang tải nhật ký…</T>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-sm text-muted-foreground">
                    <T>Không có bút toán nào khớp bộ lọc</T>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((entry) => {
                  const isOpen = expanded.includes(entry.id);
                  return (
                    <>
                      <TableRow
                        key={entry.id}
                        className="cursor-pointer"
                        onClick={() => toggle(entry.id)}
                      >
                        <TableCell>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">#{entry.id}</TableCell>
                        <TableCell>{formatTime(entry.occurredAt)}</TableCell>
                        <TableCell>
                          {LEDGER_REF_TYPE_LABEL[entry.refType]}{' '}
                          <span className="text-xs text-muted-foreground">
                            #{entry.refId}
                          </span>
                          {entry.status === 'DRAFT' ? (
                            <Badge variant="secondary" className="ml-1">
                              DRAFT
                            </Badge>
                          ) : null}
                          {entry.reversalOfId ? (
                            <Badge variant="outline" className="ml-1">
                              đảo #{entry.reversalOfId}
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell className="max-w-[18rem] truncate text-sm text-muted-foreground">
                          {entry.memo ?? '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(entry.debitTotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(entry.creditTotal)}
                        </TableCell>
                        <TableCell>
                          {entry.balanced ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                        </TableCell>
                      </TableRow>
                      {isOpen ? (
                        <TableRow key={`${entry.id}-lines`}>
                          <TableCell />
                          <TableCell colSpan={7} className="bg-muted/40">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("Tài khoản")}</TableHead>
                                  <TableHead>{t("Diễn giải")}</TableHead>
                                  <TableHead className="text-right">{t("Nợ")}</TableHead>
                                  <TableHead className="text-right">{t("Có")}</TableHead>
                                  <TableHead>{t("Tham chiếu")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {entry.lines.map((line) => (
                                  <TableRow key={line.id}>
                                    <TableCell className="font-mono text-xs">
                                      {line.accountCode}
                                    </TableCell>
                                    <TableCell>{line.accountName}</TableCell>
                                    <TableCell className="text-right">
                                      {line.direction === 'DEBIT'
                                        ? formatCurrency(line.amount)
                                        : ''}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {line.direction === 'CREDIT'
                                        ? formatCurrency(line.amount)
                                        : ''}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                      {line.orderId ? `đơn #${line.orderId} ` : ''}
                                      {line.paymentId ? `thanh toán #${line.paymentId}` : ''}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <div className="mt-2 text-xs text-muted-foreground">
                              eventKey: <span className="font-mono">{entry.idempotencyKey}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Trang {entries.data?.payload?.page ?? page}/{totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <T>Trước</T>
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
