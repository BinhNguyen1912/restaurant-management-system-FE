/**
 * Tên TIẾNG NGƯỜI cho các nhóm quyền.
 *
 * Ma trận quyền lấy `module` từ đoạn đầu của path API (`/ledger-accounts` → `LEDGER-ACCOUNTS`),
 * nên màn hình từng hiện ra toàn mã kỹ thuật. Người dùng quản trị không đọc được mã đó để biết
 * "tick ô này thì bật cái gì" — map ở đây để hiện tên nghiệp vụ, giữ mã nhỏ bên cạnh cho dev.
 */
export const MODULE_LABELS: Record<string, string> = {
  ORDERS: 'Đơn hàng',
  TABLES: 'Bàn (sơ đồ bàn)',
  'TABLE-NODE': 'Vị trí bàn',
  'TABLE-LAYOUT': 'Sơ đồ bàn',
  AREA: 'Khu vực',
  GUEST: 'Khách tại bàn',
  RESERVATION: 'Đặt bàn',
  PAYMENT: 'Thanh toán',
  'CASH-SHIFTS': 'Ca & két tiền',
  LEDGER: 'Sổ cái, sổ quỹ',
  'LEDGER-ACCOUNTS': 'Danh mục tài khoản kế toán',
  REPORTS: 'Báo cáo doanh thu',
  RECONCILIATION: 'Đối soát',
  PRODUCT: 'Món ăn (menu)',
  'MANAGE-PRODUCT': 'Quản lý món ăn',
  'PRODUCT-TRANSLATION': 'Bản dịch món ăn',
  CATEGORY: 'Danh mục món',
  'CATEGORY-TRANSLATION': 'Bản dịch danh mục',
  LANGUAGES: 'Ngôn ngữ',
  INGREDIENTS: 'Nguyên liệu',
  RECIPES: 'Định lượng',
  UNIT: 'Đơn vị tính',
  'UNIT-CONVERSION': 'Quy đổi đơn vị',
  REMINDERS: 'Lời nhắc',
  MESSAGES: 'Tin nhắn',
  DASHBOARD: 'Tổng quan',
  'AUDIT-LOGS': 'Nhật ký thao tác',
  VOUCHERS: 'Mã giảm giá',
  BRANCHES: 'Chi nhánh',
  AUTH: 'Đăng nhập',
  PROFILE: 'Hồ sơ cá nhân',
  USERS: 'Nhân viên',
  ROLE: 'Vai trò',
  PERMISSIONS: 'Quyền',
  MEDIA: 'Tải ảnh/tệp',
  HEALTH: 'Kiểm tra hệ thống',
};

/** Nhóm tính năng hiển thị trên màn hình Phân quyền (thứ tự có chủ ý: nghiệp vụ → hệ thống) */
export const FEATURE_GROUPS: { label: string; modules: string[] }[] = [
  {
    label: 'Bán hàng',
    modules: ['ORDERS', 'TABLES', 'TABLE-NODE', 'TABLE-LAYOUT', 'AREA', 'GUEST', 'RESERVATION', 'PAYMENT'],
  },
  { label: 'Thực đơn', modules: ['PRODUCT', 'MANAGE-PRODUCT', 'PRODUCT-TRANSLATION', 'CATEGORY', 'CATEGORY-TRANSLATION', 'LANGUAGES'] },
  { label: 'Kho & định lượng', modules: ['INGREDIENTS', 'RECIPES', 'UNIT', 'UNIT-CONVERSION'] },
  { label: 'Tài chính', modules: ['LEDGER', 'LEDGER-ACCOUNTS', 'REPORTS', 'RECONCILIATION', 'CASH-SHIFTS'] },
  { label: 'Vận hành', modules: ['DASHBOARD', 'REMINDERS', 'MESSAGES', 'AUDIT-LOGS', 'VOUCHERS', 'BRANCHES'] },
  { label: 'Hệ thống', modules: ['AUTH', 'PROFILE', 'USERS', 'ROLE', 'PERMISSIONS', 'MEDIA', 'HEALTH'] },
];

export const moduleLabel = (module: string) => MODULE_LABELS[module] ?? module;
