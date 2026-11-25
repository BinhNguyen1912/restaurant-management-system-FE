/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import menuItems, { menuGroups } from '@/app/manage/menuItems';
import { useAppStore } from '@/components/app-provider';
import { cn } from '@/lib/utils';
import { Package2, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/locale-provider';

/**
 * Navbar dọc: mặc định chỉ có icon (w-14), **hover vào thì trượt rộng ra** và hiện chữ (w-64),
 * rời chuột thì thu lại. Mục được gom theo nhóm (`menuGroups`), tiêu đề nhóm cũng chỉ hiện khi mở.
 *
 * Dùng `group/nav` + transition width/opacity của CSS, không cần state React -> không re-render
 * khi rê chuột. Tooltip cũ bỏ đi vì chữ đã hiện khi mở.
 */
export default function NavLinks() {
  const { t } = useI18n();
  const pathname = usePathname();
  const role = useAppStore((state) => state.role);

  const renderItem = (Item: (typeof menuItems)[number]) => {
    if (!Item.roles.includes(role as any)) return null;
    // "/manage/orders/123" vẫn phải sáng mục "Đơn hàng"
    const isActive = pathname === Item.href || pathname.startsWith(`${Item.href}/`);
    return (
      <Link
        key={Item.href}
        href={Item.href}
        title={t(Item.title)}
        className={cn(
          'flex h-9 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-accent hover:text-accent-foreground',
          isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
        )}
      >
        <Item.Icon className="h-5 w-5 shrink-0" />
        <span className="overflow-hidden whitespace-nowrap text-sm opacity-0 transition-opacity duration-200 group-hover/nav:opacity-100">
          {t(Item.title)}
        </span>
      </Link>
    );
  };

  return (
    <aside className="group/nav fixed inset-y-0 left-0 z-20 hidden w-14 flex-col overflow-hidden border-r bg-background transition-[width,box-shadow] duration-300 ease-out hover:w-64 hover:shadow-xl sm:flex">
      <div className="flex h-14 items-center gap-3 px-3">
        <Link
          href="/"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Package2 className="h-4 w-4" />
          <span className="sr-only">B'Restaurant</span>
        </Link>
        <span className="overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-opacity duration-200 group-hover/nav:opacity-100">
          B&apos;Restaurant
        </span>
      </div>

      <nav className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
        {menuGroups.map((group) => {
          const items = group.items.filter((item) => item.roles.includes(role as any));
          if (!items.length) return null; // role không xem được mục nào trong nhóm
          return (
            <div key={group.label} className="flex flex-col gap-1">
              {/* Thu gọn: 1 vạch ngăn; mở ra: tiêu đề nhóm. Chỉ đổi hiển thị, không đổi layout. */}
              <div className="px-2 pb-1 pt-3">
                <span className="hidden whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-muted-foreground group-hover/nav:block">
                  {t(group.label)}
                </span>
                <span className="block h-px w-8 bg-border group-hover/nav:hidden" aria-hidden />
              </div>
              {items.map(renderItem)}
            </div>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <Link
          href="/manage/setting"
          title={t('Cài đặt')}
          className={cn(
            'flex h-9 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-accent hover:text-accent-foreground',
            pathname.startsWith('/manage/setting')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground',
          )}
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span className="overflow-hidden whitespace-nowrap text-sm opacity-0 transition-opacity duration-200 group-hover/nav:opacity-100">
            {t('Cài đặt')}
          </span>
        </Link>
      </div>
    </aside>
  );
}
