'use client';

import { useEffect, useState } from 'react';
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
import { useGetCategoryTranslations, useSaveCategoryTranslation } from '@/app/queries/useCategoryTranslations';
import { useI18n } from '@/i18n/locale-provider';
import { SUPPORTED_LOCALES, Locale } from '@/i18n/locale';

const LANGUAGE_LABEL: Record<Locale, string> = { vi: 'Tiếng Việt', en: 'English' };
type Draft = Record<string, { name: string; description: string }>;

/** Quản lý bản dịch tên/mô tả danh mục; khách xem EN thấy tên EN, thiếu thì rơi về tiếng Việt */
export default function CategoryTranslationsDialog({
  categoryId,
  categoryName,
}: {
  categoryId: number;
  categoryName: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { data, isLoading, refetch } = useGetCategoryTranslations(categoryId, open);
  const { mutateAsync: save, isPending } = useSaveCategoryTranslation();
  const [drafts, setDrafts] = useState<Draft>({});

  const translations = data?.payload?.data ?? [];

  // nạp lại form mỗi lần mở: dữ liệu có thể vừa đổi ở nơi khác
  useEffect(() => {
    if (!open) return;
    const next: Draft = {};
    for (const locale of SUPPORTED_LOCALES) {
      const row = translations.find((item) => item.languageId === locale);
      next[locale] = {
        name: row?.name ?? (locale === 'vi' ? categoryName : ''),
        description: row?.description ?? '',
      };
    }
    setDrafts(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, translations.length, categoryName]);

  const patch = (locale: Locale, change: Partial<{ name: string; description: string }>) =>
    setDrafts((current) => ({ ...current, [locale]: { ...current[locale], ...change } }));

  const submit = async () => {
    const changed = SUPPORTED_LOCALES.filter((locale) => {
      const row = translations.find((item) => item.languageId === locale);
      const draft = drafts[locale];
      if (!draft?.name.trim()) return false;
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
          categoryId,
          languageId: locale,
          name: drafts[locale].name.trim(),
          description: drafts[locale].description.trim(),
        });
      }
      await refetch();
      toast.success(t('Đã lưu bản dịch'));
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.payload?.message ?? error?.message ?? t('Không lưu được bản dịch'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Languages className="mr-2 h-4 w-4" />
          {t('Bản dịch')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('Bản dịch')}: {categoryName}
          </DialogTitle>
          <DialogDescription>
            {t(
              'Khách xem menu bằng ngôn ngữ nào sẽ thấy tên/mô tả của ngôn ngữ đó; thiếu bản dịch thì hiện tiếng Việt.',
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('Đang tải...')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {SUPPORTED_LOCALES.map((locale) => (
              <div key={locale} className="grid gap-2 rounded-lg border p-3">
                <p className="text-sm font-semibold">{LANGUAGE_LABEL[locale]}</p>
                <div className="grid gap-1">
                  <Label htmlFor={`category-translation-name-${locale}`}>{t('Tên danh mục')}</Label>
                  <Input
                    id={`category-translation-name-${locale}`}
                    value={drafts[locale]?.name ?? ''}
                    onChange={(event) => patch(locale, { name: event.target.value })}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor={`category-translation-desc-${locale}`}>{t('Mô tả')}</Label>
                  <Textarea
                    id={`category-translation-desc-${locale}`}
                    rows={3}
                    value={drafts[locale]?.description ?? ''}
                    onChange={(event) => patch(locale, { description: event.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('Huỷ')}
          </Button>
          <Button onClick={submit} disabled={isPending || isLoading}>
            {t('Lưu thay đổi')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
