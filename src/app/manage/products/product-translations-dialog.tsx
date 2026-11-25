'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Languages } from 'lucide-react';
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
import { useSaveProductTranslation } from '@/app/queries/useProductTranslations';
import { useI18n } from '@/i18n/locale-provider';
import { SUPPORTED_LOCALES, Locale } from '@/i18n/locale';

type TranslationRow = { id: number; languageId: string; name: string; description: string };

const LANGUAGE_LABEL: Record<Locale, string> = { vi: 'Tiếng Việt', en: 'English' };

/**
 * Quản lý bản dịch tên/mô tả món theo từng ngôn ngữ.
 * Bản dịch tiếng Việt là "bản gốc" (nằm ở cột name/description của sản phẩm), nên ở đây
 * tập trung vào ngôn ngữ khác — nhưng vẫn cho sửa cả vi để đồng bộ khi đã có row.
 */
export default function ProductTranslationsDialog({
  productId,
  productName,
  translations,
}: {
  productId: number;
  productName: string;
  translations: TranslationRow[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { mutateAsync: save, isPending } = useSaveProductTranslation();
  const [drafts, setDrafts] = useState<Record<string, { name: string; description: string }>>(() => {
    const initial: Record<string, { name: string; description: string }> = {};
    for (const locale of SUPPORTED_LOCALES) {
      const row = translations.find((item) => item.languageId === locale);
      initial[locale] = { name: row?.name ?? '', description: row?.description ?? '' };
    }
    return initial;
  });

  const patch = (locale: Locale, change: Partial<{ name: string; description: string }>) =>
    setDrafts((current) => ({ ...current, [locale]: { ...current[locale], ...change } }));

  const submit = async () => {
    const changed = SUPPORTED_LOCALES.filter((locale) => {
      const row = translations.find((item) => item.languageId === locale);
      const draft = drafts[locale];
      if (!draft.name.trim()) return false;
      if (!row) return true;
      return row.name !== draft.name || row.description !== draft.description;
    });
    if (!changed.length) {
      toast.info(t('Không có thay đổi nào'));
      return;
    }
    try {
      for (const locale of changed) {
        const row = translations.find((item) => item.languageId === locale);
        await save({
          id: row?.id,
          productId,
          languageId: locale,
          name: drafts[locale].name.trim(),
          description: drafts[locale].description.trim(),
        });
      }
      toast.success(t('Đã lưu bản dịch'));
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.payload?.message ?? error?.message ?? t('Không lưu được bản dịch'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title={t('Bản dịch')}>
          <Languages className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('Bản dịch')}: {productName}</DialogTitle>
          <DialogDescription>
            {t('Khách xem menu bằng ngôn ngữ nào sẽ thấy tên/mô tả của ngôn ngữ đó; thiếu bản dịch thì hiện tiếng Việt.')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {SUPPORTED_LOCALES.map((locale) => (
            <div key={locale} className="grid gap-2 rounded-lg border p-3">
              <p className="text-sm font-semibold">{LANGUAGE_LABEL[locale]}</p>
              <div className="grid gap-1">
                <Label htmlFor={`translation-name-${locale}`}>{t('Tên món ăn')}</Label>
                <Input
                  id={`translation-name-${locale}`}
                  value={drafts[locale].name}
                  onChange={(event) => patch(locale, { name: event.target.value })}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor={`translation-desc-${locale}`}>{t('Mô tả')}</Label>
                <Textarea
                  id={`translation-desc-${locale}`}
                  rows={3}
                  value={drafts[locale].description}
                  onChange={(event) => patch(locale, { description: event.target.value })}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('Huỷ')}
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {t('Lưu thay đổi')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
