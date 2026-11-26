import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CashBookPanel from '@/app/manage/cash-book/cash-book-panel';
import { T } from '@/components/t';

export default function CashBookPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <T>Sổ quỹ</T>
          </CardTitle>
          <CardDescription>
            <T>
              Tiền mặt và tiền gửi ngân hàng trong kỳ.
            </T>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <CashBookPanel />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
