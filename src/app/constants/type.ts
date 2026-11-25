export const TokenType = {
  ForgotPasswordToken: 'ForgotPasswordToken',
  AccessToken: 'AccessToken',
  RefreshToken: 'RefreshToken',
  TableToken: 'TableToken',
} as const;

// export const Role = {
//   Owner: 'Owner',
//   Employee: 'Employee',
//   Guest: 'Guest'
// } as const
export const Role = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  GUEST: 'GUEST',
  USER: 'USER',
  /** vai trò đặt sẵn (seed): kế toán — chỉ đọc sổ cái, sổ quỹ, báo cáo, đối soát */
  KE_TOAN: 'KE_TOAN',
} as const;
export const RoleValues = [
  Role.ADMIN,
  Role.STAFF,
  Role.GUEST,
  Role.USER,
  Role.KE_TOAN,
] as const;

/** Role được vào khu /manage (khách thì không). Role tự tạo cũng vào được, menu lọc theo quyền. */
export const MANAGEMENT_ROLES: string[] = [
  Role.ADMIN,
  Role.STAFF,
  Role.KE_TOAN,
];

export const DishStatus = {
  Available: 'Available',
  Unavailable: 'Unavailable',
  Hidden: 'Hidden',
} as const;

export const DishStatusValues = [
  DishStatus.Available,
  DishStatus.Unavailable,
  DishStatus.Hidden,
] as const;

export const TableStatus = {
  Available: 'Available',
  Hidden: 'Hidden',
  Reserved: 'Reserved',
} as const;

export const TableStatusValues = [
  TableStatus.Available,
  TableStatus.Hidden,
  TableStatus.Reserved,
] as const;

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  READY: 'READY',
  PAID: 'PAID',
} as const;

export const OrderType = {
  ONLINE: 'ONLINE',
  AT_TABLE: 'AT_TABLE',
  RESERVATION: 'RESERVATION',
} as const;

export const OrderStatusValues = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
  OrderStatus.READY,
  OrderStatus.PAID,
] as const;

export const ManagerRoom = 'manager' as const;

export const PaymentStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
} as const;

export const PaymentStatusValues = [
  PaymentStatus.SUCCESS,
  PaymentStatus.FAILED,
  PaymentStatus.PENDING,
] as const;

export const TypeToOrderStatus = {
  AT_TABLE: 'AT_TABLE',
  ONLINE: 'ONLINE',
  RESERVATION: 'RESERVATION',
} as const;

export const TypeToOrderStatusValues = [
  TypeToOrderStatus.AT_TABLE,
  TypeToOrderStatus.ONLINE,
  TypeToOrderStatus.RESERVATION,
] as const;
