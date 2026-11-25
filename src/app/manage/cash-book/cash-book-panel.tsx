'use client';

import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Banknote, Landmark, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetCashBook } from '@/app/queries/useLedgerEntry';
import { useGetBranches } from '@/app/queries/useBranch';
import { useI18n } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';

type TabKey = 'CASH' | 'BANK' | 'TOTAL';

const TABS: { key: TabKey; icon: typeof Banknote }[] = [
  { key: 'CASH', icon: Banknote },
  { key: 'BANK', icon: Landmark },
  { key: 'TOTAL', icon: Wallet },
];

const money = (value: number, locale: string) =>
  `${value.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}đ`;

/**
 * Sổ quỹ: 3 tab (Tiền mặt / Ngân hàng / Tổng quỹ). Bấm tab nào thì hiện 4 thẻ tiền của quỹ đó.
 *
 * Số lấy từ `GET /ledger/cash-book` — tính từ bút toán sổ cái (chỉ bút toán POSTED), nên khớp với
 * báo cáo doanh thu và đối soát, không phải cộng lại từ Order.
 */
export default function CashBookPanel() {
  const { t, locale } = useI18n();
  const [tab, setTab] = useState<TabKey>('CASH');
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const { data, isLoading } = useGetCashBook({ branchId });
  const { data: branchesData } = useGetBranches();

  const branches = branchesData?.payload?.data ?? [];
  const accounts = data?.payload?.data.accounts ?? [];
  const total = data?.payload?.data.total;

  const current = useMemo(() => {
    if (tab === 'TOTAL') return total;
    return accounts.find((account) => account.code === tab);
  }, [accounts, tab, total]);

  const cards = [
    { key: 'opening', label: t('Quỹ đầu kỳ'), value: current?.opening ?? 0, tone: 'text-foreground' },
    { key: 'inflow', label: t('Tổng thu'), value: current?.inflow ?? 0, tone: 'text-emerald-600', icon: ArrowDownLeft },
    { key: 'outflow', label: t('Tổng chi'), value: current?.outflow ?? 0, tone: 'text-rose-600', icon: ArrowUpRight },
    { key: 'closing', label: t('Tồn quỹ'), value: current?.closing ?? 0, tone: 'text-foreground font-semibold' },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1" data-testid="cash-book-tabs">
          {TABS.map((item) => {
            const active = tab === item.key;
            const label = item.key === 'TOTAL' ? t('Tổng quỹ') : item.key === 'CASH' ? t('Tiền mặt') : t('Ngân hàng');
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={active}
                onClick={() => setTab(item.key)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                  active ? 'bg-background font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        {branches.length > 1 && (
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={branchId ?? ''}
            onChange={(event) => setBranchId(event.target.value ? Number(event.target.value) : undefined)}
          >
            <option value="">{t('Tất cả chi nhánh')}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.key}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                {card.icon ? <card.icon className="h-4 w-4" /> : null}
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn('text-2xl tabular-nums', card.tone)}>
                {isLoading ? '…' : money(card.value, locale)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('Kỳ')}: {data?.payload?.data.fromDate ?? '—'} → {data?.payload?.data.toDate ?? '—'}
        {' · '}
        {t('Tồn quỹ = Quỹ đầu kỳ + Tổng thu − Tổng chi')}
      </p>
    </div>
  );
}
