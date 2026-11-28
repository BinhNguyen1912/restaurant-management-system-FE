import { Suspense } from 'react';
import CustomerTable from '@/app/manage/customers/customer-table';
import CustomerInsightCards from '@/app/manage/customers/customer-insight-cards';
import { T } from '@/components/t';

export default function CustomersPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">
          <T>Khách hàng</T>
        </h1>
        <p className="text-sm text-muted-foreground">
          <T>
            Hồ sơ khách nhận diện bằng số điện thoại: số đơn, tổng chi, lần cuối tới và điểm thưởng. Một khách
            là một hồ sơ trên mọi chi nhánh, nên khách quay lại chi nhánh khác vẫn được nhận ra.
          </T>
        </p>
      </div>
      <Suspense>
        <CustomerInsightCards />
      </Suspense>
      <Suspense>
        <CustomerTable />
      </Suspense>
    </main>
  );
}
