'use client';

import { Building2, Users, Table2, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import BranchFormDialog from '@/app/manage/branches/branch-form-dialog';
import { useGetBranches } from '@/app/queries/useBranch';
import { useI18n } from '@/i18n/locale-provider';
import { BranchRowType } from '@/app/ValidationSchemas/branch.schema';

function Usage({ branch }: { branch: BranchRowType }) {
  const { t } = useI18n();
  const items = [
    { icon: Users, label: t('nhân viên'), value: branch.usage?.users ?? 0 },
    { icon: Table2, label: t('bàn'), value: branch.usage?.tables ?? 0 },
    { icon: Receipt, label: t('đơn'), value: branch.usage?.orders ?? 0 },
  ];
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1">
          <item.icon className="h-3.5 w-3.5" />
          {item.value} {item.label}
        </span>
      ))}
    </div>
  );
}

/** Danh sách chi nhánh + tạo/sửa + cấu hình VAT, phí phục vụ ngay tại dòng */
export default function BranchTable() {
  const { t } = useI18n();
  const { data, isLoading } = useGetBranches();
  const branches = (data?.payload?.data ?? []) as BranchRowType[];

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <BranchFormDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('Chi nhánh')}</TableHead>
            <TableHead>{t('Mã')}</TableHead>
            <TableHead>{t('Trạng thái')}</TableHead>
            <TableHead>{t('VAT')}</TableHead>
            <TableHead>{t('Phí phục vụ')}</TableHead>
            <TableHead className="text-right">{t('Thao tác')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                {t('Đang tải...')}
              </TableCell>
            </TableRow>
          )}
          {!isLoading && branches.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                {t('Chưa có chi nhánh nào')}
              </TableCell>
            </TableRow>
          )}
          {branches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell>
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="grid gap-1">
                    <span className="font-medium">{branch.name}</span>
                    <Usage branch={branch} />
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">{branch.code}</TableCell>
              <TableCell>
                <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                  {branch.isActive ? t('Đang hoạt động') : t('Ngừng hoạt động')}
                </Badge>
              </TableCell>
              <TableCell className="tabular-nums">{branch.taxRate}%</TableCell>
              <TableCell className="tabular-nums">{branch.serviceChargeRate}%</TableCell>
              <TableCell className="text-right">
                <BranchFormDialog branch={branch} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p className="text-xs text-muted-foreground">
        {t(
          'VAT và phí phục vụ sửa ở trang Thuế & phí. Cấu hình chỉ áp cho đơn tạo mới, đơn cũ giữ số đã snapshot.',
        )}
      </p>
    </div>
  );
}
