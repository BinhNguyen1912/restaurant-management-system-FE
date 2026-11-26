'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Camera, PackageCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCreateStockReceipt } from '@/app/queries/useStockReceipt';
import { mediaApiRequest } from '@/apiRequest/media';
import { useI18n } from '@/i18n/locale-provider';
import { getApiErrorMessage } from '@/lib/api-error';

type Props = {
  ingredientId: number;
  ingredientName: string;
  /** đơn vị + tồn hiện tại để hiện "10 kg → 15 kg" ngay khi gõ */
  unitName?: string;
  currentStock?: number;
  trigger?: React.ReactNode;
};

/**
 * Nhập hàng: số lượng + giá nhập + nhà cung cấp + ghi chú + **ảnh bằng chứng**.
 *
 * `capture="environment"` để mở thẳng camera sau trên điện thoại — nhập hàng thường làm tại
 * kho, không phải ngồi máy tính. BE cộng dồn tồn kho (không ghi đè) nên form chỉ cần số nhập thêm.
 */
export default function StockReceiptDialog({
  ingredientId,
  ingredientName,
  unitName,
  currentStock,
  trigger,
}: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [supplier, setSupplier] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createReceipt = useCreateStockReceipt();

  useEffect(() => {
    if (open) return;
    setQuantity('');
    setUnitCost('');
    setSupplier('');
    setNote('');
    setFiles([]);
  }, [open]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    // tối đa 5 ảnh: BE cũng chặn, nhưng chặn sớm để không phải upload rồi mới biết
    setFiles((current) => [...current, ...Array.from(list)].slice(0, 5));
  };

  const submit = async () => {
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      toast.error(t('Số lượng nhập phải lớn hơn 0'));
      return;
    }

    setUploading(true);
    try {
      const images = files.length ? await mediaApiRequest.uploadMany(files) : [];
      const result = await createReceipt.mutateAsync({
        ingredientId,
        body: {
          quantity: parsedQuantity,
          unitCost: unitCost === '' ? undefined : Number(unitCost),
          supplier: supplier.trim() || undefined,
          note: note.trim() || undefined,
          images,
        },
      });
      const stock = result.payload?.data.stock ?? 0;
      const unit = unitName ? ` ${unitName}` : '';
      toast.success(
        t('Đã nhập {quantity}{unit} — tồn mới: {stock}{unit}', {
          quantity: parsedQuantity,
          unit,
          stock,
        }),
      );
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('Không nhập được hàng')));
    } finally {
      setUploading(false);
    }
  };

  const busy = uploading || createReceipt.isPending;
  const nextStock =
    currentStock !== undefined && Number(quantity) > 0 ? currentStock + Number(quantity) : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <PackageCheck className="mr-2 h-4 w-4" />
            {t('Nhập hàng')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="h-5 w-5" />
            {t('Nhập hàng')}: {ingredientName}
          </DialogTitle>
          <DialogDescription>
            {t('Tồn hiện tại: {stock}{unit}. Số nhập sẽ được CỘNG vào tồn kho.', {
              stock: currentStock ?? 0,
              unit: unitName ? ` ${unitName}` : '',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="receipt-quantity">
                {t('Số lượng nhập')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="receipt-quantity"
                type="number"
                min={0}
                step="any"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="0"
              />
              {nextStock !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {t('Tồn sau khi nhập')}: <span className="font-medium text-foreground">{nextStock}</span>
                  {unitName ? ` ${unitName}` : ''}
                </p>
              )}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="receipt-cost">{t('Giá nhập / đơn vị')}</Label>
              <Input
                id="receipt-cost"
                type="number"
                min={0}
                value={unitCost}
                onChange={(event) => setUnitCost(event.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                {t('Dùng để tính giá vốn (bình quân gia quyền)')}
              </p>
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="receipt-supplier">{t('Nhà cung cấp')}</Label>
            <Input
              id="receipt-supplier"
              value={supplier}
              onChange={(event) => setSupplier(event.target.value)}
              placeholder={t('Tên nhà cung cấp / người giao hàng')}
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="receipt-note">{t('Ghi chú')}</Label>
            <Textarea
              id="receipt-note"
              rows={2}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t('Ví dụ: hàng thiếu 1kg, đã báo nhà cung cấp')}
            />
          </div>

          <div className="grid gap-2">
            <Label>{t('Ảnh bằng chứng')}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(event) => addFiles(event.target.files)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Camera className="mr-2 h-4 w-4" />
                {t('Chụp / chọn ảnh')}
              </Button>
              <span className="text-xs text-muted-foreground">
                {t('Tối đa 5 ảnh (phiếu giao hàng, hàng thực tế)')}
              </span>
            </div>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {previews.map((src, index) => (
                  <div key={src} className="relative">
                    {/* dùng <img> vì đây là blob URL xem trước, next/image không nhận */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-16 w-16 rounded-md border object-cover" />
                    <button
                      type="button"
                      onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-white"
                      aria-label={t('Xoá ảnh')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('Huỷ')}
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? t('Đang lưu...') : t('Xác nhận nhập hàng')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
