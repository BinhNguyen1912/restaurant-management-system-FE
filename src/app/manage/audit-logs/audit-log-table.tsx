'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ScrollText } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAuditLogs } from '@/app/queries/useAuditLog';
import { AuditLogType } from '@/app/ValidationSchemas/audit-log.schema';
import { useI18n } from '@/i18n/locale-provider';

const ACTION_LABEL: Record<string, string> = {
  ORDER_CANCELLED: 'Huỷ đơn',
  ORDER_DISCOUNT_CHANGED: 'Đổi giảm giá',
  ORDER_PRICE_CHANGED: 'Đổi giá đơn',
  PRODUCT_PRICE_CHANGED: 'Đổi giá sản phẩm',
  PAYMENT_REFUNDED: 'Hoàn tiền',
};

const ACTION_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ORDER_CANCELLED: 'destructive',
  PAYMENT_REFUNDED: 'destructive',
  ORDER_DISCOUNT_CHANGED: 'outline',
  ORDER_PRICE_CHANGED: 'outline',
  PRODUCT_PRICE_CHANGED: 'secondary',
};

const ENTITY_LABEL: Record<string, string> = {
  ORDER: 'Đơn',
  PRODUCT: 'Sản phẩm',
  SKU: 'SKU',
  PAYMENT: 'Thanh toán',
};

const formatDateTime = (value: string) => new Date(value).toLocaleString('vi-VN');

/** hiển thị gọn 1 object Json (before/after) — đủ để đọc, không cần mở JSON thô */
const summarize = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value !== 'object') return String(value);
  const entries = Object.entries(value as Record<string, unknown>).filter(([, item]) => item !== null && item !== undefined);
  if (entries.length === 0) return '—';
  return entries
    .slice(0, 3)
    .map(([key, item]) => `${key}: ${typeof item === 'object' ? JSON.stringify(item) : String(item)}`)
    .join(' · ');
};

/**
 * Nhật ký thao tác nhạy cảm: huỷ đơn, giảm giá, sửa giá, hoàn tiền.
 * Không có nút sửa/xoá — cố ý: nhật ký sửa được thì không còn là bằng chứng.
 */
export default function AuditLogTable() {
  const { t } = useI18n();
  const [action, setAction] = useState<string>('all');
  const [entityType, setEntityType] = useState<string>('all');
  const [entityId, setEntityId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);

  const query = useMemo(
    () => ({
      page,
      limit: 30,
      action: action === 'all' ? undefined : action,
      entityType: entityType === 'all' ? undefined : entityType,
      entityId: entityId.trim() ? Number(entityId) : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [page, action, entityType, entityId, fromDate, toDate],
  );

  const { data, isFetching } = useGetAuditLogs(query);
  const logs = data?.payload?.data ?? [];
  const totalItems = data?.payload?.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / 30));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ScrollText className="size-4" /> Nhật ký thao tác
        </CardTitle>
        <CardDescription>
          Ai làm gì, trước/sau ra sao, vì lý do gì — dùng để giải trình khi đối soát lệch. Bản ghi
          chỉ ghi thêm, không sửa/xoá được.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1">
            <Label>{t("Hành động")}</Label>
            <Select
              value={action}
              onValueChange={(value) => {
                setAction(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("Tất cả")}</SelectItem>
                {Object.entries(ACTION_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label>{t("Đối tượng")}</Label>
            <Select
              value={entityType}
              onValueChange={(value) => {
                setEntityType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("Tất cả")}</SelectItem>
                {Object.entries(ENTITY_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="audit-entity-id">{t("ID đối tượng")}</Label>
            <Input
              id="audit-entity-id"
              inputMode="numeric"
              className="w-28"
              value={entityId}
              onChange={(event) => {
                setEntityId(event.target.value.replace(/[^0-9]/g, ''));
                setPage(1);
              }}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="audit-from">{t("Từ ngày")}</Label>
            <Input
              id="audit-from"
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="audit-to">{t("Đến ngày")}</Label>
            <Input
              id="audit-to"
              type="date"
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>{t("Thời điểm")}</TableHead>
                <TableHead>{t("Hành động")}</TableHead>
                <TableHead>{t("Đối tượng")}</TableHead>
                <TableHead>{t("Người làm")}</TableHead>
                <TableHead>{t("Lý do")}</TableHead>
                <TableHead>{t("Thay đổi")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log: AuditLogType) => (
                <>
                  <TableRow key={log.id} className="cursor-pointer" onClick={() => setExpanded(expanded === log.id ? null : log.id)}>
                    <TableCell className="w-6">
                      {expanded === log.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDateTime(log.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={ACTION_VARIANT[log.action] ?? 'outline'}>
                        {ACTION_LABEL[log.action] ?? log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {ENTITY_LABEL[log.entityType] ?? log.entityType} #{log.entityId}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {log.actorName ?? (log.actorId ? `#${log.actorId}` : 'hệ thống')}
                      {log.actorRole ? (
                        <span className="ml-1 text-xs text-muted-foreground">{log.actorRole}</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="max-w-52 truncate">{log.reason ?? '—'}</TableCell>
                    <TableCell className="max-w-64 truncate text-xs text-muted-foreground">
                      {summarize(log.after)}
                    </TableCell>
                  </TableRow>
                  {expanded === log.id && (
                    <TableRow key={`${log.id}-detail`}>
                      <TableCell colSpan={7} className="bg-muted/40">
                        <div className="grid gap-2 text-xs sm:grid-cols-2">
                          <div>
                            <div className="mb-1 font-medium">{t("Trước")}</div>
                            <pre className="overflow-x-auto rounded bg-background p-2">
                              {JSON.stringify(log.before ?? null, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <div className="mb-1 font-medium">Sau</div>
                            <pre className="overflow-x-auto rounded bg-background p-2">
                              {JSON.stringify(log.after ?? null, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
              {!logs.length && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-sm text-muted-foreground">
                    {isFetching ? 'Đang tải…' : 'Chưa có thao tác nhạy cảm nào được ghi'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {totalItems} bản ghi · trang {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Trước
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Sau
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
