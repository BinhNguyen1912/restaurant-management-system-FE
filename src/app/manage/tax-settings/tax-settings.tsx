'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Percent, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BranchSettingsTypeRes,
  UpdateBranchSettingsBodyType,
} from '@/app/ValidationSchemas/branch.schema';
import { useGetBranches, useUpdateBranchSettings } from '@/app/queries/useBranch';

type Draft = { taxRate: string; serviceChargeRate: string; pricesIncludeTax: boolean };

const toDraft = (branch: BranchSettingsTypeRes): Draft => ({
  taxRate: String(branch.taxRate),
  serviceChargeRate: String(branch.serviceChargeRate),
  pricesIncludeTax: branch.pricesIncludeTax,
});

export default function TaxSettings() {
  const { data, isLoading } = useGetBranches();
  const { mutateAsync: save, isPending } = useUpdateBranchSettings();
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});

  const branches = data?.payload?.data ?? [];

  useEffect(() => {
    if (!branches.length) return;
    setDrafts((current) => {
      const next = { ...current };
      for (const branch of branches) if (!next[branch.id]) next[branch.id] = toDraft(branch);
      return next;
    });
  }, [branches]);

  const patch = (id: number, change: Partial<Draft>) =>
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...change } }));

  const handleSave = async (branch: BranchSettingsTypeRes) => {
    const draft = drafts[branch.id] ?? toDraft(branch);
    const body: UpdateBranchSettingsBodyType = {
      taxRate: Number(draft.taxRate),
      serviceChargeRate: Number(draft.serviceChargeRate),
      pricesIncludeTax: draft.pricesIncludeTax,
    };
    try {
      await save({ id: branch.id, body });
      toast.success(`Đã lưu cấu hình cho ${branch.name}`);
    } catch (error: any) {
      toast.error(error?.message ?? 'Không lưu được cấu hình');
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" /> VAT & phí phục vụ theo chi nhánh
          </CardTitle>
          <CardDescription>
            Cấu hình chỉ áp cho <b>đơn tạo mới</b>: mỗi đơn lưu lại thuế suất tại thời điểm bán nên
            đổi ở đây <b>không làm sai đơn cũ</b> và báo cáo thuế theo kỳ vẫn đúng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chi nhánh</TableHead>
                <TableHead className="w-28">VAT (%)</TableHead>
                <TableHead className="w-32">Phí phục vụ (%)</TableHead>
                <TableHead className="w-56">Giá menu đã gồm VAT</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    Đang tải…
                  </TableCell>
                </TableRow>
              ) : branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    Chưa có chi nhánh
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch) => {
                  const draft = drafts[branch.id] ?? toDraft(branch);
                  return (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {branch.code}{' '}
                          {branch.isActive ? null : <Badge variant="secondary">đã tắt</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          inputMode="decimal"
                          value={draft.taxRate}
                          onChange={(event) => patch(branch.id, { taxRate: event.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          inputMode="decimal"
                          value={draft.serviceChargeRate}
                          onChange={(event) =>
                            patch(branch.id, { serviceChargeRate: event.target.value })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={draft.pricesIncludeTax}
                            onCheckedChange={(checked) =>
                              patch(branch.id, { pricesIncludeTax: checked })
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            {draft.pricesIncludeTax
                              ? 'Đã gồm VAT — thuế trích ra từ hoá đơn'
                              : 'Chưa gồm VAT — cộng thuế lên trên'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" disabled={isPending} onClick={() => handleSave(branch)}>
                          <Save className="mr-1 h-4 w-4" /> Lưu
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="mt-4 grid gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
            <div className="font-medium">VAT được tính ở đâu?</div>
            <ul className="list-inside list-disc text-muted-foreground">
              <li>
                Trên <b>đơn hàng</b>, tại thời điểm tạo đơn — không tính trên từng món. Món chỉ có
                giá; một hoá đơn có thể gồm nhiều món, nhiều thuế suất sau này.
              </li>
              <li>
                Công thức: <b>VAT = (tiền món − giảm giá + phí phục vụ) × tỷ lệ</b>. Nếu giá menu{' '}
                <b>đã gồm VAT</b> thì thuế được <i>trích ra</i> (tổng khách trả không đổi); nếu{' '}
                <b>chưa gồm</b> thì cộng thêm lên tổng.
              </li>
              <li>
                Làm tròn về <b>đồng nguyên</b> vì VND không có đơn vị lẻ và sổ cái chỉ nhận số
                nguyên.
              </li>
              <li>
                Khi thu tiền, sổ cái ghi: <b>Nợ</b> tiền (CASH/VNPAY) = <b>Có</b> doanh thu thuần +{' '}
                <b>Có</b> phí phục vụ + <b>Có</b> TAX_PAYABLE (thuế phải nộp).
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
