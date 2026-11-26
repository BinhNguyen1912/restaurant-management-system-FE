'use client';

import { useState } from 'react';
import { History, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGetStockReceipts } from '@/app/queries/useStockReceipt';
import { useI18n } from '@/i18n/locale-provider';

/** Lịch sử nhập hàng: ai nhập, bao nhiêu, giá nào, ảnh bằng chứng */
export default function StockReceiptHistory({
  ingredientId,
  ingredientName,
  unitName,
  trigger,
}: {
  ingredientId: number;
  ingredientName: string;
  unitName?: string;
  /** cho phép đặt nút kích hoạt ở nơi khác (vd trong dropdown của bảng) */
  trigger?: React.ReactNode;
}) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetStockReceipts(ingredientId, open);
  const receipts = data?.payload?.data ?? [];

  const money = (value: number) =>
    `${Math.round(value).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}đ`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="ghost">
            <History className="mr-2 h-4 w-4" />
            {t('Lịch sử nhập')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('Lịch sử nhập hàng')}: {ingredientName}
          </DialogTitle>
          <DialogDescription>
            {t('Ai nhập, bao nhiêu, ảnh nào.')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('Đang tải...')}</p>
        ) : receipts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('Chưa có lần nhập nào')}</p>
        ) : (
          <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
            {receipts.map((receipt) => (
              <div key={receipt.id} className="grid gap-2 rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    +{receipt.quantity}
                    {unitName ? ` ${unitName}` : ''}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      → {t('tồn')} {receipt.stockAfter}
                      {unitName ? ` ${unitName}` : ''}
                    </span>
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(receipt.receivedAt).toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {receipt.unitCost > 0 && <span>{t('Giá nhập')}: {money(receipt.unitCost)}</span>}
                  {receipt.supplier && <span>{t('NCC')}: {receipt.supplier}</span>}
                  {receipt.createdByName && <span>{t('Người nhập')}: {receipt.createdByName}</span>}
                </div>
                {receipt.note && <p className="text-sm">{receipt.note}</p>}
                {receipt.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {receipt.images.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer" title={t('Mở ảnh bằng chứng')}>
                        {/* ảnh Cloudinary, không cấu hình next/image host -> dùng <img> */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={t('Ảnh bằng chứng')} className="h-16 w-16 rounded-md border object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {receipts.length > 0 && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon className="h-3 w-3" />
            {t('Bấm ảnh để xem lớn')}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
