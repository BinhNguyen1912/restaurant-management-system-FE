import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import DishTable from '@/app/manage/products/product-table';
import { Suspense } from 'react';
import IngredientTable from '@/app/manage/ingredients/ingredient-table';
import LowStockWarningDialog from '@/components/lowStockWarningDialog';
import { T } from '@/components/t';

export default function DishesPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle><T>Nguyên Liệu</T></CardTitle>
            <CardDescription><T>Quản lý nguyên liệu</T></CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <IngredientTable />
            </Suspense>
          </CardContent>
        </Card>
        <LowStockWarningDialog />
      </div>
    </main>
  );
}
