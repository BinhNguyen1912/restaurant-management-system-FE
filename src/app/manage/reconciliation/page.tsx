import { Suspense } from 'react';
import ReconciliationBoard from '@/app/manage/reconciliation/reconciliation-board';
import ReconciliationRuns from '@/app/manage/reconciliation/reconciliation-runs';
import { T } from '@/components/t';

export default function ReconciliationPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl"><T>Đối soát thanh toán ↔ sổ cái</T></h1>
        <p className="text-sm text-muted-foreground">
          So tiền đã thu (tiền mặt, VNPay) với số ghi trên tài khoản nhận tiền, và ghi bút toán
          chuyển tiền VNPay chờ về sang ngân hàng.
        </p>
      </div>
      <Suspense>
        <ReconciliationBoard />
      </Suspense>
      <Suspense>
        <ReconciliationRuns />
      </Suspense>
    </main>
  );
}
