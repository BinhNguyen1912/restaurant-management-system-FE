import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import LedgerAccountTable from '@/app/manage/ledger-accounts/ledger-account-table';
import { Suspense } from 'react';
import { T } from '@/components/t';

export default function LedgerAccountsPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle><T>Sổ cái — Danh mục tài khoản</T></CardTitle>
          <CardDescription>
            Tài khoản <b><T>hệ thống</T></b> do code dùng trực tiếp (CASH, VNPAY_CLEARING,
            REVENUE_FOOD, …): không đổi mã/loại, không tắt, không xoá — chỉ đổi tên
            hiển thị. Tài khoản <b><T>chi tiết</T></b> tự tạo được để phân loại chi phí /
            doanh thu khác. Số dư chỉ tính bút toán đã POSTED.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LedgerAccountTable />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
