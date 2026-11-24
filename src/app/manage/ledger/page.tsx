import { Suspense } from 'react';
import LedgerJournal from '@/app/manage/ledger/ledger-journal';

export default function LedgerPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">Sổ cái — nhật ký & kiểm tra cân đối</h1>
        <p className="text-sm text-muted-foreground">
          Từng bút toán kèm dòng Nợ/Có (audit trail). Tổng Nợ phải bằng Tổng Có — lệch là dữ liệu
          ghi sai.
        </p>
      </div>
      <Suspense>
        <LedgerJournal />
      </Suspense>
    </main>
  );
}
