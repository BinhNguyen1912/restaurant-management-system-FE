'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMeProfile } from '@/app/queries/useAccount';
import { useI18n } from '@/i18n/locale-provider';
import { cn } from '@/lib/utils';

/**
 * Chi nhánh đang làm việc, hiện trên header admin.
 *
 * Sai chi nhánh là sai số liệu mà **không có lỗi nào báo** — nên người dùng phải luôn thấy mình
 * đang ở chi nhánh nào. Đọc từ `GET /profile` (đã kèm `branch`) để còn đúng sau khi F5, không chỉ
 * ngay sau khi login.
 */
export function ActiveBranchBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  const { data, isLoading } = useMeProfile();
  const profile = data?.payload as { branch?: { id: number; name: string; code: string; isActive: boolean } | null } | undefined;

  if (isLoading) {
    return <div className={cn('h-6 w-28 animate-pulse rounded-full bg-muted', className)} />;
  }

  const branch = profile?.branch;

  if (!branch) {
    return (
      <Link href="/manage/branches" title={t('Chưa gán chi nhánh')}>
        <Badge variant="destructive" className={cn('gap-1 font-normal', className)}>
          <Building2 className="h-3.5 w-3.5" />
          {t('Chưa gán chi nhánh')}
        </Badge>
      </Link>
    );
  }

  return (
    <Link
      href="/manage/branches"
      title={`${t('Chi nhánh đang làm việc')}: ${branch.name} (${branch.code})`}
    >
      <Badge variant={branch.isActive ? 'secondary' : 'outline'} className={cn('gap-1 font-normal', className)}>
        <Building2 className="h-3.5 w-3.5" />
        {branch.name}
        {!branch.isActive && <span className="text-xs">({t('ngừng hoạt động')})</span>}
      </Badge>
    </Link>
  );
}
