'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useI18n } from '@/i18n/locale-provider';
import { T } from '@/components/t';

function PaymentSuccessContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<{
    guestId: string | null;
    amount: string | null;
    status: string | null;
    message: string | null;
    bankCode: string | null;
    guestName: string | null;
    tableName: string | null;
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const guestId = searchParams.get('guestId');
    const amount = searchParams.get('amount');
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    const bankCode = searchParams.get('bankCode');
    const guestName = searchParams.get('guestName');
    const tableName = searchParams.get('tableName');

    if (status === 'success') {
      setData({
        guestId,
        amount,
        status,
        message,
        bankCode,
        guestName,
        tableName,
      });
      setIsOpen(true);

      router.replace('/guest/payment-success');
    }
  }, [searchParams, router, mounted]);

  if (!mounted) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    router.push('/guest/orders');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:overflow-y-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center text-green-600">
            <T>Thanh toán thành công!</T>
          </DialogTitle>
          <DialogDescription className="text-sm text-center mt-4">
            <T>Cảm ơn quý khách đã sử dụng dịch vụ của tại B'Restaurant</T>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-600">{t("Tên khách hàng :")}</span>
            <span className="font-semibold">{data?.guestName}</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-600">{t("Mã khách hàng :")}</span>
            <span className="font-semibold">#{data?.guestId}</span>
          </div>

          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-600">{t("Số tiền:")}</span>
            <span className="font-bold text-lg text-green-600">
              {data?.amount ? formatCurrency(Number(data.amount)) : ''}
            </span>
          </div>

          {data?.bankCode && (
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-600">{t("Ngân hàng:")}</span>
              <span className="font-semibold text-blue-600">
                {data.bankCode}
              </span>
            </div>
          )}

          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-600">{t("Chổ ngồi:")}</span>
            <span className="font-semibold">{data?.tableName}</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            <T>Xem đơn hàng</T>
          </Button>
          <Link href="/guest/menu">
            <Button variant="outline" className="w-full">
              <T>Đặt món thêm</T>
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Next yêu cầu useSearchParams() phải nằm trong Suspense boundary khi prerender,
 * nếu không `next build` fail ở bước export (trước đây build đỏ vì thiếu boundary này).
 */
export default function PaymentSuccessPage() {
  const { t } = useI18n();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">{t("Đang tải kết quả thanh toán...")}</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
