import { Role } from '@/app/constants/type';
import {
  BookOpenText,
  Home,
  LineChart,
  ShoppingCart,
  Users2,
  Salad,
  Table,
  Warehouse,
  AlarmSmoke,
  ClipboardClock,
  Wallet,
  ScrollText,
  Percent,
  Landmark,
  TicketPercent,
  FolderTree,
  Wallet2,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    Icon: Home,
    href: '/manage/dashboard',
    group: 'Tổng quan',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Báo cáo doanh thu',
    Icon: LineChart,
    href: '/manage/reports',
    group: 'Tổng quan',
    roles: [Role.ADMIN],
  },
  {
    title: 'Sổ quỹ',
    Icon: Wallet2,
    href: '/manage/cash-book',
    group: 'Tài chính',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Sổ cái',
    Icon: BookOpenText,
    href: '/manage/ledger-accounts',
    group: 'Tài chính',
    roles: [Role.ADMIN],
  },
  {
    title: 'Nhật ký sổ cái',
    Icon: ScrollText,
    href: '/manage/ledger',
    group: 'Tài chính',
    roles: [Role.ADMIN],
  },
  {
    title: 'Nhật ký thao tác',
    Icon: ScrollText,
    href: '/manage/audit-logs',
    group: 'Vận hành',
    roles: [Role.ADMIN],
  },
  {
    title: 'Đối soát',
    Icon: Landmark,
    href: '/manage/reconciliation',
    group: 'Tài chính',
    roles: [Role.ADMIN],
  },
  {
    title: 'Danh mục',
    Icon: FolderTree,
    href: '/manage/categories',
    group: 'Thực đơn',
    roles: [Role.ADMIN],
  },
  {
    title: 'Mã giảm giá',
    Icon: TicketPercent,
    href: '/manage/vouchers',
    group: 'Tài chính',
    roles: [Role.ADMIN],
  },
  {
    title: 'Thuế & phí',
    Icon: Percent,
    href: '/manage/tax-settings',
    group: 'Tài chính',
    roles: [Role.ADMIN],
  },
  {
    title: 'Ca & két tiền',
    Icon: Wallet,
    href: '/manage/cash-shifts',
    group: 'Bán hàng',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Đơn hàng',
    Icon: ShoppingCart,
    href: '/manage/orders',
    group: 'Bán hàng',
    roles: [Role.STAFF, Role.ADMIN],
  },
  {
    title: 'Bàn ăn',
    Icon: Table,
    href: '/manage/tables',
    group: 'Bán hàng',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Món ăn',
    Icon: Salad,
    href: '/manage/products',
    group: 'Thực đơn',
    roles: [Role.ADMIN],
  },
  {
    title: 'Lời Nhắc',
    Icon: ClipboardClock,
    href: '/manage/reminders',
    group: 'Vận hành',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Nguyên Liệu',
    Icon: Warehouse,
    href: '/manage/ingredients',
    group: 'Thực đơn',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Quản Lý Định Lượng',
    Icon: AlarmSmoke,
    href: '/manage/recipes',
    group: 'Thực đơn',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Nhân viên',
    Icon: Users2,
    href: '/manage/accounts',
    group: 'Vận hành',
    roles: [Role.ADMIN],
  },
];

export type MenuItem = (typeof menuItems)[number]

/** Thứ tự nhóm trên navbar: khai báo tường minh, không phụ thuộc thứ tự item ở trên */
const GROUP_ORDER = ['Tổng quan', 'Bán hàng', 'Thực đơn', 'Tài chính', 'Vận hành']

/** Gom mục theo `group`; nhóm không có item nào (do role bị lọc) thì bỏ */
export const menuGroups: { label: string; items: MenuItem[] }[] = GROUP_ORDER.map((label) => ({
  label,
  items: menuItems.filter((item) => item.group === label),
})).filter((group) => group.items.length > 0)

export default menuItems;
