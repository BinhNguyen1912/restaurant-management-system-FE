import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CashShiftDetailPanel from '@/app/manage/cash-shifts/[id]/cash-shift-detail-panel';
import { T } from '@/components/t';

export default function CashShiftDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <T>Chi tiết ca</T>
          </CardTitle>
          <CardDescription>
            <T>Tiền mở két, thu từ đơn, thu/chi tay trong ca và chênh lệch khi đóng ca.</T>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <CashShiftDetailPanel shiftId={Number(params.id)} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
