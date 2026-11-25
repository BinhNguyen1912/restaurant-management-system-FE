import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BranchTable from '@/app/manage/branches/branch-table';
import { T } from '@/components/t';

export default function BranchesPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <T>Chi nhánh</T>
          </CardTitle>
          <CardDescription>
            <T>
              Mỗi chi nhánh có bàn, đơn, nhân viên và báo cáo riêng. Nhân viên đăng nhập sẽ làm việc trên
              chi nhánh được gán.
            </T>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <BranchTable />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
