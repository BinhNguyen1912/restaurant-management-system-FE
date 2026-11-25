import { Suspense } from 'react';
import AuditLogTable from '@/app/manage/audit-logs/audit-log-table';
import { T } from '@/components/t';

export default function AuditLogsPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl"><T>Nhật ký thao tác</T></h1>
        <p className="text-sm text-muted-foreground">
          Huỷ đơn, giảm giá, sửa giá sản phẩm, hoàn tiền — ai làm, khi nào, lý do gì. Bản ghi chỉ
          thêm, không sửa hay xoá được.
        </p>
      </div>
      <Suspense>
        <AuditLogTable />
      </Suspense>
    </main>
  );
}
