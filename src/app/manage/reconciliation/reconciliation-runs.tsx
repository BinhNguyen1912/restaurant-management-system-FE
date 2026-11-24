'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle2, ClipboardList, History, Play, XCircle } from 'lucide-react';
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
  useReconciliationRunDetail,
  useReconciliationRuns,
  useResolveReconciliationItem,
  useRunReconciliation,
} from '@/app/queries/useLedgerReconciliation';
import { formatCurrency } from '@/lib/utils';

const KIND_LABEL: Record<string, string> = {
  MATCHED: 'Khớp',
  MISSING_IN_LEDGER: 'Thiếu bút toán',
  AMOUNT_MISMATCH: 'Lệch số tiền',
  DUPLICATE: 'Ghi trùng',
  STATUS_MISMATCH: 'VNPay báo khác',
};

const KIND_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  MATCHED: 'secondary',
  MISSING_IN_LEDGER: 'destructive',
  AMOUNT_MISMATCH: 'destructive',
  DUPLICATE: 'destructive',
  STATUS_MISMATCH: 'destructive',
};

/** hôm qua, giờ VN — cùng mặc định với BE (đối soát giữa ngày sẽ báo lệch giả) */
const yesterdayISO = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

const formatDay = (value?: string | null) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—');
const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString('vi-VN') : '—');

/**
 * Đối soát LƯU LỊCH SỬ: mỗi lần chạy sinh 1 run + từng sai lệch (item).
 * Khác khối phía trên (tính live): ở đây có bằng chứng để giải trình về sau.
 */
export default function ReconciliationRuns() {
  const [fromDate, setFromDate] = useState(yesterdayISO());
  const [toDate, setToDate] = useState(yesterdayISO());
  const [openRunId, setOpenRunId] = useState<number | null>(null);

  const { data: runsData, isFetching } = useReconciliationRuns({});
  const { data: detailData, isFetching: isDetailFetching } = useReconciliationRunDetail(openRunId);
  const { mutateAsync: runReconciliation, isPending } = useRunReconciliation();
  const { mutateAsync: resolveItem } = useResolveReconciliationItem();

  const runs = runsData?.payload?.data ?? [];
  const detail = detailData?.payload;

  const handleRun = async () => {
    try {
      const result = await runReconciliation({ fromDate, toDate });
      const run = result.payload?.run;
      const byKind = run?.summary?.byKind ?? {};
      const problems = Object.entries(byKind).filter(([kind]) => kind !== 'MATCHED');
      if (problems.length === 0) {
        toast.success(`Đối soát ${formatDay(run?.periodFrom)}: khớp toàn bộ (${byKind.MATCHED ?? 0} giao dịch)`);
      } else {
        toast.warn(
          `Đối soát xong: ${problems.map(([kind, count]) => `${KIND_LABEL[kind] ?? kind} ${count}`).join(' · ')}`,
        );
      }
      setOpenRunId(run?.id ?? null);
    } catch {
      toast.error('Không chạy được đối soát');
    }
  };

  const handleResolve = async (id: number, status: 'RESOLVED' | 'IGNORED') => {
    try {
      await resolveItem({ id, status });
      toast.success(status === 'RESOLVED' ? 'Đã đánh dấu xử lý' : 'Đã bỏ qua sai lệch');
    } catch {
      toast.error('Không cập nhật được');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="size-4" /> Đối soát lưu lịch sử
        </CardTitle>
        <CardDescription>
          Mỗi lần chạy giữ lại 1 bản ghi: giao dịch nào khớp, giao dịch nào thiếu bút toán / lệch
          tiền / ghi trùng. Đây là bằng chứng để giải trình khi sổ lệch.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1">
            <Label htmlFor="run-from">Từ ngày</Label>
            <Input
              id="run-from"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="run-to">Đến ngày</Label>
            <Input id="run-to" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
          <Button onClick={handleRun} disabled={isPending}>
            <Play className="size-4" /> Chạy đối soát &amp; lưu
          </Button>
          <span className="text-xs text-muted-foreground">
            Cron tự chạy 02:30 mỗi ngày cho hôm qua.
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lần chạy</TableHead>
                <TableHead>Kỳ</TableHead>
                <TableHead>Chi nhánh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Kết quả</TableHead>
                <TableHead className="text-right">Chênh lệch</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => {
                const byKind = run.summary?.byKind ?? {};
                const problems = Object.entries(byKind).filter(([kind]) => kind !== 'MATCHED');
                return (
                  <TableRow key={run.id}>
                    <TableCell className="whitespace-nowrap">#{run.id}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDay(run.periodFrom)}
                      {run.periodTo !== run.periodFrom ? ` – ${formatDay(run.periodTo)}` : ''}
                    </TableCell>
                    <TableCell>{run.branchCode ?? 'Tất cả'}</TableCell>
                    <TableCell>
                      <Badge variant={run.status === 'COMPLETED' ? 'secondary' : 'destructive'}>
                        {run.status === 'COMPLETED' ? 'Hoàn tất' : run.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {run.status === 'FAILED' ? (
                        <span className="text-destructive">{run.error ?? 'Lỗi'}</span>
                      ) : problems.length === 0 ? (
                        <span className="text-emerald-600">Khớp {byKind.MATCHED ?? 0} giao dịch</span>
                      ) : (
                        <span className="text-destructive">
                          {problems
                            .map(([kind, count]) => `${KIND_LABEL[kind] ?? kind} ${count}`)
                            .join(' · ')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {formatCurrency(Number(run.summary?.difference ?? 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenRunId(openRunId === run.id ? null : run.id)}
                      >
                        {openRunId === run.id ? 'Đóng' : 'Xem'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!runs.length && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                    {isFetching ? 'Đang tải…' : 'Chưa có lần đối soát nào — bấm "Chạy đối soát & lưu".'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {openRunId !== null && (
          <div className="grid gap-2 rounded-md border p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ClipboardList className="size-4" /> Chi tiết lần chạy #{openRunId}
              {detail?.run.summary?.vnpay?.skippedReason && (
                <span className="text-xs font-normal text-muted-foreground">
                  VNPay: {detail.run.summary.vnpay.checked}/{detail.run.summary.vnpay.candidates} tra được —{' '}
                  {detail.run.summary.vnpay.skippedReason}
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phân loại</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Bút toán</TableHead>
                    <TableHead className="text-right">Phải có</TableHead>
                    <TableHead className="text-right">Thực tế</TableHead>
                    <TableHead className="text-right">Lệch</TableHead>
                    <TableHead>Xử lý</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(detail?.items ?? []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant={KIND_VARIANT[item.kind] ?? 'outline'}>
                          {KIND_LABEL[item.kind] ?? item.kind}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.paymentId ? `#${item.paymentId}` : '—'}
                        {item.transactionId ? (
                          <span className="ml-1 text-xs text-muted-foreground">{item.transactionId}</span>
                        ) : null}
                      </TableCell>
                      <TableCell>{item.ledgerEntryId ? `#${item.ledgerEntryId}` : '—'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amountExpected)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.amountActual)}</TableCell>
                      <TableCell
                        className={`text-right ${item.amountDelta !== 0 ? 'font-medium text-destructive' : ''}`}
                      >
                        {formatCurrency(item.amountDelta)}
                      </TableCell>
                      <TableCell>
                        {item.status === 'OPEN' ? (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handleResolve(item.id, 'RESOLVED')}>
                              <CheckCircle2 className="size-4" /> Đã xử lý
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleResolve(item.id, 'IGNORED')}>
                              <XCircle className="size-4" /> Bỏ qua
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="outline">
                            {item.status === 'RESOLVED' ? 'Đã xử lý' : 'Đã bỏ qua'}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!detail?.items.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-4 text-center text-sm text-muted-foreground">
                        {isDetailFetching ? 'Đang tải…' : 'Kỳ này không có giao dịch nào'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="text-xs text-muted-foreground">
              Chạy lúc {formatDateTime(detail?.run.startedAt)} · xong lúc {formatDateTime(detail?.run.finishedAt)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
