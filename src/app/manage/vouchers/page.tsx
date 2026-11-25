import { Suspense } from 'react';
import VoucherTable from '@/app/manage/vouchers/voucher-table';
import { T } from '@/components/t';

export default function VouchersPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl"><T>Mã giảm giá</T></h1>
        <p className="text-sm text-muted-foreground">
          Tạo và quản lý mã khuyến mãi. Khách nhập mã ở giỏ hàng khi đặt món; số tiền đã giảm được lưu vào đơn nên sửa
          mã sau này không làm thay đổi đơn cũ.
        </p>
      </div>
      <Suspense>
        <VoucherTable />
      </Suspense>
    </main>
  );
}
