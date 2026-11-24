import { Suspense } from 'react';
import RevenueReportBoard from '@/app/manage/reports/revenue-report-board';

export default function RevenueReportPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">Báo cáo doanh thu</h1>
        <p className="text-sm text-muted-foreground">
          Doanh thu theo ngày, chi nhánh và phương thức thanh toán — đọc từ sổ cái nên khớp với
          trang Nhật ký sổ cái.
        </p>
      </div>
      <Suspense>
        <RevenueReportBoard />
      </Suspense>
    </main>
  );
}
