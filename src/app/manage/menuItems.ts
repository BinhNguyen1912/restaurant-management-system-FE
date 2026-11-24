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
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    Icon: Home,
    href: '/manage/dashboard',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Báo cáo doanh thu',
    Icon: LineChart,
    href: '/manage/reports',
    roles: [Role.ADMIN],
  },
  {
    title: 'Sổ cái',
    Icon: BookOpenText,
    href: '/manage/ledger-accounts',
    roles: [Role.ADMIN],
  },
  {
    title: 'Nhật ký sổ cái',
    Icon: ScrollText,
    href: '/manage/ledger',
    roles: [Role.ADMIN],
  },
  {
    title: 'Nhật ký thao tác',
    Icon: ScrollText,
    href: '/manage/audit-logs',
    roles: [Role.ADMIN],
  },
  {
    title: 'Đối soát',
    Icon: Landmark,
    href: '/manage/reconciliation',
    roles: [Role.ADMIN],
  },
  {
    title: 'Thuế & phí',
    Icon: Percent,
    href: '/manage/tax-settings',
    roles: [Role.ADMIN],
  },
  {
    title: 'Ca & két tiền',
    Icon: Wallet,
    href: '/manage/cash-shifts',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Đơn hàng',
    Icon: ShoppingCart,
    href: '/manage/orders',
    roles: [Role.STAFF, Role.ADMIN],
  },
  {
    title: 'Bàn ăn',
    Icon: Table,
    href: '/manage/tables',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Món ăn',
    Icon: Salad,
    href: '/manage/products',
    roles: [Role.ADMIN],
  },
  {
    title: 'Lời Nhắc',
    Icon: ClipboardClock,
    href: '/manage/reminders',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Nguyên Liệu',
    Icon: Warehouse,
    href: '/manage/ingredients',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Quản Lý Định Lượng',
    Icon: AlarmSmoke,
    href: '/manage/recipes',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Nhân viên',
    Icon: Users2,
    href: '/manage/accounts',
    roles: [Role.ADMIN],
  },
];

export default menuItems;
