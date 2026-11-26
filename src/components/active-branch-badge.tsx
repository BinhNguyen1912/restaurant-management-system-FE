'use client';

import Link from 'next/link';
import { Building2, ChevronRight } from 'lucide-react';
import { useMeProfile } from '@/app/queries/useAccount';
import { useAppStore } from '@/components/app-provider';
import { useI18n } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';

/**
 * Chi nhánh đang làm việc — khối riêng bên TRÁI header, to và rõ hơn các icon.
 *
 * Vì sao phải to: sai chi nhánh là sai số liệu mà **không có lỗi nào báo**, nên đây là thông tin
 * quan trọng nhất trên header. Đọc `GET /profile` để còn đúng sau F5.
 *
 * Phân biệt 2 ý khác nhau (trước đây gộp làm một, hiện chữ đỏ "Chưa gán chi nhánh" cả với admin):
 *  - ADMIN, không gán chi nhánh  → "Tất cả chi nhánh" (đúng: admin là cấp tổng)
 *  - nhân viên **chưa** gán       → cảnh báo đỏ (cấu hình sai, sẽ bị 403 khi đọc dữ liệu)
 */
export function ActiveBranchBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  const role = useAppStore((state) => state.role);
  const { data, isLoading } = useMeProfile();
  const profile = data?.payload as
    | { branch?: { id: number; name: string; code: string; isActive: boolean } | null }
    | undefined;

  const base =
    'inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors';

  if (isLoading) {
    return <div className={cn('h-10 w-40 animate-pulse rounded-lg bg-muted', className)} />;
  }

  const branch = profile?.branch;

  if (!branch) {
    // ADMIN là cấp tổng: không thuộc một chi nhánh nào, và điều đó là BÌNH THƯỜNG
    if (role === 'ADMIN') {
      return (
        <Link
          href="/manage/branches"
          title={t('Bạn đang xem dữ liệu của tất cả chi nhánh')}
          className={cn(base, 'border-border bg-secondary/60 hover:bg-secondary', className)}
        >
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">{t('Tất cả chi nhánh')}</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Link>
      );
    }

    return (
      <Link
        href="/manage/accounts"
        title={t('Chưa gán chi nhánh: tài khoản này sẽ bị từ chối khi đọc dữ liệu chi nhánh')}
        className={cn(
          base,
          'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15',
          className,
        )}
      >
        <Building2 className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">{t('Chưa gán chi nhánh')}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/manage/branches"
      title={`${t('Chi nhánh đang làm việc')}: ${branch.name} (${branch.code})`}
      className={cn(base, 'border-border bg-background hover:bg-accent', className)}
    >
      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="grid leading-tight">
        <span className="text-[10px] font-normal uppercase tracking-wide text-muted-foreground">
          {t('Chi nhánh')}
        </span>
        <span className="whitespace-nowrap">{branch.name}</span>
      </span>
      {!branch.isActive && (
        <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] text-destructive">
          {t('ngừng hoạt động')}
        </span>
      )}
    </Link>
  );
}
