import { Suspense } from 'react';
import CashShiftBoard from '@/app/manage/cash-shifts/cash-shift-board';
import { T } from '@/components/t';

export default function CashShiftsPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl"><T>Ca làm việc & két tiền mặt</T></h1>
        <p className="text-sm text-muted-foreground">
          Mở ca → thu/chi tiền mặt trong ca → đóng ca bằng số tiền thực đếm. Lệch thừa/thiếu tự
          sinh bút toán vào sổ cái để đối chiếu với tài khoản CASH.
        </p>
      </div>
      <Suspense>
        <CashShiftBoard />
      </Suspense>
    </main>
  );
}
