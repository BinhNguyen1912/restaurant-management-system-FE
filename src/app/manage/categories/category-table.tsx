'use client';

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CategoryTranslationsDialog from '@/app/manage/categories/category-translations-dialog';
import { useGetCategories } from '@/app/queries/useCategory';
import { useI18n } from '@/i18n/locale-provider';

/** Danh sách danh mục + lối vào quản lý bản dịch (tên/mô tả theo ngôn ngữ) */
export default function CategoryTable() {
  const { t } = useI18n();
  const { data, isLoading } = useGetCategories();

  const categories = data?.payload?.data ?? [];
  const byId = useMemo(() => new Map(categories.map((item) => [item.id, item])), [categories]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('Tên danh mục')}</TableHead>
          <TableHead>{t('Danh mục cha')}</TableHead>
          <TableHead className="text-right">{t('Thao tác')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              {t('Đang tải...')}
            </TableCell>
          </TableRow>
        )}
        {!isLoading && categories.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              {t('Chưa có')}
            </TableCell>
          </TableRow>
        )}
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell className="text-muted-foreground">
              {category.parentCategoryId ? (byId.get(category.parentCategoryId)?.name ?? '—') : '—'}
            </TableCell>
            <TableCell className="text-right">
              <CategoryTranslationsDialog categoryId={category.id} categoryName={category.name} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
