'use client';

import { useMemo, useState } from 'react';
import { getApiErrorMessage, isForbidden } from '@/lib/api-error';
import { Input } from '@/components/ui/input';
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
import { LEDGER_ACCOUNT_TYPE_LABEL } from '@/app/ValidationSchemas/ledger-account.schema';
import { useGetLedgerAccounts } from '@/app/queries/useLedgerAccount';
import { formatCurrency } from '@/lib/utils';
import CreateLedgerAccountDialog from '@/app/manage/ledger-accounts/create-ledger-account-dialog';
import { useI18n } from '@/i18n/locale-provider';
import { T } from '@/components/t';

const TYPE_OPTIONS = ['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;

export default function LedgerAccountTable() {
  const { t } = useI18n();
  const { data, isLoading, isError, error } = useGetLedgerAccounts();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_OPTIONS)[number]>('ALL');

  const accounts = data?.payload?.data ?? [];

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchType = typeFilter === 'ALL' || account.type === typeFilter;
      const matchKeyword =
        !keyword ||
        account.code.toLowerCase().includes(keyword) ||
        account.name.toLowerCase().includes(keyword);
      return matchType && matchKeyword;
    });
  }, [accounts, search, typeFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <Input
            placeholder={t("Tìm theo mã hoặc tên…")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:max-w-xs"
          />
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}
          >
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'ALL' ? 'Tất cả loại' : LEDGER_ACCOUNT_TYPE_LABEL[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CreateLedgerAccountDialog />
      </div>

      {/* bảng nay chỉ ĐỌC: mã, tên, loại, tổng Nợ, tổng Có, số dư */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[170px]">{t("Mã")}</TableHead>
              <TableHead>{t("Tên")}</TableHead>
              <TableHead className="w-[120px]">{t("Loại")}</TableHead>
              <TableHead className="w-[130px] text-right">{t("Tổng Nợ")}</TableHead>
              <TableHead className="w-[130px] text-right">{t("Tổng Có")}</TableHead>
              <TableHead className="w-[130px] text-right">{t("Số dư")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  <T>Đang tải danh mục tài khoản…</T>
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-destructive">
                  {/*
                    Hiện NGUYÊN VĂN lỗi (mã HTTP + message) thay vì đoán "kiểm tra quyền X":
                    trước đây mọi lỗi — 500, mất mạng, 401 — đều hiện câu đó, nên người dùng đi
                    kiểm tra quyền trong khi lỗi thật ở chỗ khác.
                  */}
                  {getApiErrorMessage(error, t('Không tải được danh mục tài khoản'))}
                  {isForbidden(error) && (
                    <span className="ml-1">
                      {t('(tài khoản của bạn không có quyền xem danh mục tài khoản kế toán)')}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  <T>Không có tài khoản nào khớp</T>
                </TableCell>
              </TableRow>
            )}
            {filtered.map((account) => (
              <TableRow key={account.id} className={account.isActive ? '' : 'opacity-60'}>
                <TableCell className="font-mono text-xs">{account.code}</TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell className="text-xs">
                  {LEDGER_ACCOUNT_TYPE_LABEL[account.type]}
                  {account.isCash && <span className="ml-1 text-muted-foreground">{t("(tiền mặt)")}</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(account.totalDebit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(account.totalCredit)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(account.balance)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
