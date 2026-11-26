import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryTable from '@/app/manage/categories/category-table';
import { T } from '@/components/t';

export default function CategoriesPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <T>Danh mục</T>
          </CardTitle>
          <CardDescription>
            <T>Danh mục và bản dịch tên/mô tả.</T>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <CategoryTable />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
