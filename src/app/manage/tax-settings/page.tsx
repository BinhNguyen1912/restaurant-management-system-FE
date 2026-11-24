import { Suspense } from 'react';
import TaxSettings from '@/app/manage/tax-settings/tax-settings';

export default function TaxSettingsPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">Thuế & phí phục vụ</h1>
        <p className="text-sm text-muted-foreground">
          Cấu hình VAT và phí phục vụ của từng chi nhánh. Đơn cũ giữ nguyên thuế suất đã bán.
        </p>
      </div>
      <Suspense>
        <TaxSettings />
      </Suspense>
    </main>
  );
}
