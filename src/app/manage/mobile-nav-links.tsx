/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { groupMenu, visibleMenu } from '@/app/manage/menuItems';
import { useMeProfile } from '@/app/queries/useAccount';
import { useAppStore } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Package2, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/locale-provider';

export default function MobileNavLinks() {
  const { t } = useI18n();
  const pathname = usePathname();
  const role = useAppStore((state) => state.role);
  const { data: profile } = useMeProfile();
  const permissions = (profile?.payload as { role?: { permissions?: { module: string; method: string }[] } })
    ?.role?.permissions;
  const groups = groupMenu(visibleMenu(permissions, role));
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <nav className="grid gap-6 text-lg font-medium">
          <Link
            href="#"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
          >
            <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Acme Inc</span>
          </Link>
          {groups.map((group) => {
            const items = group.items;
            if (!items.length) return null;
            return (
              <div key={group.label} className="grid gap-2">
                <p className="px-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(group.label)}
                </p>
                {items.map((Item) => {
                  const isActive = pathname === Item.href;
                  return (
                    <Link
                      key={Item.href}
                      href={Item.href}
                      className={cn(
                        'flex items-center gap-4 px-2.5 hover:text-foreground',
                        {
                          'text-foreground': isActive,
                          'text-muted-foreground': !isActive,
                        }
                      )}
                    >
                      <Item.Icon className="h-5 w-5" />
                      {t(Item.title)}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
