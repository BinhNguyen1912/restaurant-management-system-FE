import DropdownAvatar from '@/app/manage/dropdown-avatar';
import MobileNavLinks from '@/app/manage/mobile-nav-links';
import NavLinks from '@/app/manage/nav-links';
import { ModeToggle } from '@/components/ToggleTheme';
import AdminConversationDialog from '@/components/admin-conversation-dialog';
import { QuickReminderDialog } from '@/components/reminderDialog';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { ActiveBranchBadge } from '@/components/active-branch-badge';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <NavLinks />
      <div id="app-content" className="flex flex-col transition-[padding] duration-300 ease-out sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <MobileNavLinks />

          {/* BÊN TRÁI: chi nhánh đang làm việc — khối riêng, to hơn cụm icon bên phải */}
          <ActiveBranchBadge className="hidden sm:inline-flex" />

          {/* BÊN PHẢI: cụm tiện ích, mọi nút cùng một cỡ (h-9 w-9) và cùng kiểu ghost */}
          <div className="ml-auto flex items-center gap-1">
            <QuickReminderDialog triggerVariant="icon" />
            <AdminConversationDialog />
            <LocaleSwitcher />
            <ModeToggle />
            <span className="mx-1 h-6 w-px bg-border" aria-hidden />
            <DropdownAvatar />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
