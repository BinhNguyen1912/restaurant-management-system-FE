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
  Building2,
  ShieldCheck,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    Icon: Home,
    href: '/manage/dashboard',
    permission: { module: 'DASHBOARD', method: 'GET' },
    group: 'Tổng quan',
  },
  {
    title: 'Báo cáo doanh thu',
    Icon: LineChart,
    href: '/manage/reports',
    permission: { module: 'REPORTS', method: 'GET' },
    group: 'Tổng quan',
  },
  {
    title: 'Sổ quỹ',
    Icon: Wallet2,
    href: '/manage/cash-book',
    permission: { module: 'LEDGER', method: 'GET' },
    group: 'Tài chính',
  },
  {
    title: 'Sổ cái',
    Icon: BookOpenText,
    href: '/manage/ledger-accounts',
    permission: { module: 'LEDGER-ACCOUNTS', method: 'GET' },
    group: 'Tài chính',
  },
  {
    title: 'Nhật ký sổ cái',
    Icon: ScrollText,
    href: '/manage/ledger',
    permission: { module: 'LEDGER', method: 'GET' },
    group: 'Tài chính',
  },
  {
    title: 'Nhật ký thao tác',
    Icon: ScrollText,
    href: '/manage/audit-logs',
    permission: { module: 'AUDIT-LOGS', method: 'GET' },
    group: 'Vận hành',
  },
  {
    title: 'Đối soát',
    Icon: Landmark,
    href: '/manage/reconciliation',
    permission: { module: 'RECONCILIATION', method: 'GET' },
    group: 'Tài chính',
  },
  {
    title: 'Danh mục',
    Icon: FolderTree,
    href: '/manage/categories',
    permission: { module: 'CATEGORY', method: 'GET' },
    /** trang chỉ ADMIN: middleware chặn role khác trước cả khi vào */
    onlyAdmin: true,
    group: 'Thực đơn',
  },
  {
    title: 'Mã giảm giá',
    Icon: TicketPercent,
    href: '/manage/vouchers',
    permission: { module: 'VOUCHERS', method: 'GET' },
    /** trang chỉ ADMIN: middleware chặn role khác trước cả khi vào */
    onlyAdmin: true,
    group: 'Tài chính',
  },
  {
    title: 'Thuế & phí',
    Icon: Percent,
    href: '/manage/tax-settings',
    permission: { module: 'BRANCHES', method: 'GET' },
    /** trang chỉ ADMIN: middleware chặn role khác trước cả khi vào */
    onlyAdmin: true,
    group: 'Tài chính',
  },
  {
    title: 'Ca & két tiền',
    Icon: Wallet,
    href: '/manage/cash-shifts',
    permission: { module: 'CASH-SHIFTS', method: 'GET' },
    group: 'Bán hàng',
  },
  {
    title: 'Đơn hàng',
    Icon: ShoppingCart,
    href: '/manage/orders',
    permission: { module: 'ORDERS', method: 'GET' },
    group: 'Bán hàng',
  },
  {
    title: 'Bàn ăn',
    Icon: Table,
    href: '/manage/tables',
    permission: { module: 'TABLES', method: 'GET' },
    group: 'Bán hàng',
  },
  {
    title: 'Món ăn',
    Icon: Salad,
    href: '/manage/products',
    permission: { module: 'MANAGE-PRODUCT', method: 'GET' },
    /** trang chỉ ADMIN: middleware chặn role khác trước cả khi vào */
    onlyAdmin: true,
    group: 'Thực đơn',
  },
  {
    title: 'Lời Nhắc',
    Icon: ClipboardClock,
    href: '/manage/reminders',
    permission: { module: 'REMINDERS', method: 'GET' },
    group: 'Vận hành',
  },
  {
    title: 'Nguyên Liệu',
    Icon: Warehouse,
    href: '/manage/ingredients',
    permission: { module: 'INGREDIENTS', method: 'GET' },
    group: 'Thực đơn',
  },
  {
    title: 'Quản Lý Định Lượng',
    Icon: AlarmSmoke,
    href: '/manage/recipes',
    permission: { module: 'RECIPES', method: 'GET' },
    group: 'Thực đơn',
  },
  {
    title: 'Chi nhánh',
    Icon: Building2,
    href: '/manage/branches',
    permission: { module: 'BRANCHES', method: 'GET' },
    /** trang chỉ ADMIN: middleware chặn role khác trước cả khi vào */
    onlyAdmin: true,
    group: 'Vận hành',
  },
  {
    title: 'Phân quyền',
    Icon: ShieldCheck,
    href: '/manage/roles',
    permission: { module: 'ROLE', method: 'GET' },
    /** trang chỉ ADMIN: middleware chặn role khác trước cả khi vào */
    onlyAdmin: true,
    group: 'Vận hành',
  },
  {
    title: 'Nhân viên',
    Icon: Users2,
    href: '/manage/accounts',
    permission: { module: 'USERS', method: 'GET' },
    /** trang chỉ ADMIN: middleware chặn role khác trước cả khi vào */
    onlyAdmin: true,
    group: 'Vận hành',
  },
];

export type MenuItem = (typeof menuItems)[number]

/**
 * Menu sinh theo **QUYỀN**, không theo tên role.
 *
 * Lý do: hệ thống cho tạo role tuỳ biến, nên danh sách role cứng không thể biết role mới cần mục
 * nào; trong khi quyền thì biết chính xác. Mỗi mục khai báo quyền tối thiểu để mở (module + method),
 * cộng cờ `onlyAdmin` cho những trang middleware chỉ cho ADMIN.
 */
export function visibleMenu(
  permissions: { module: string; method: string }[] | undefined,
  roleName: string | undefined,
) {
  const granted = new Set((permissions ?? []).map((item) => `${item.module}:${item.method.toUpperCase()}`))
  return menuItems.filter((item) => {
    const rule = item as { permission?: { module: string; method: string }; onlyAdmin?: boolean }
    if (rule.onlyAdmin && roleName !== 'ADMIN') return false
    if (!rule.permission) return true
    return granted.has(`${rule.permission.module}:${rule.permission.method.toUpperCase()}`)
  })
}

/** Thứ tự nhóm trên navbar: khai báo tường minh, không phụ thuộc thứ tự item ở trên */
const GROUP_ORDER = ['Tổng quan', 'Bán hàng', 'Thực đơn', 'Tài chính', 'Vận hành']

/** Gom mục theo `group`; nhóm không có item nào (đã lọc theo quyền) thì bỏ */
export const groupMenu = (items: MenuItem[]) =>
  GROUP_ORDER.map((label) => ({ label, items: items.filter((item) => item.group === label) })).filter(
    (group) => group.items.length > 0,
  )

/** Toàn bộ nhóm (chưa lọc quyền) — dùng cho chỗ không có thông tin người dùng */
export const menuGroups: { label: string; items: MenuItem[] }[] = groupMenu(menuItems)

export default menuItems;
