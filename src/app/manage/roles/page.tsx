import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RolesPanel from '@/app/manage/roles/roles-panel';
import { T } from '@/components/t';

export default function RolesPage() {
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <T>Phân quyền</T>
          </CardTitle>
          <CardDescription>
            <T>Cấp quyền theo nhóm chức năng cho từng vai trò.</T>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <RolesPanel />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
