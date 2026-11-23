'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  LEDGER_ACCOUNT_TYPE_LABEL,
  LedgerAccountTypeRes,
} from '@/app/ValidationSchemas/ledger-account.schema';
import {
  useDeleteLedgerAccount,
  useGetLedgerAccounts,
  useUpdateLedgerAccount,
} from '@/app/queries/useLedgerAccount';
import { formatCurrency } from '@/lib/utils';
import CreateLedgerAccountDialog from '@/app/manage/ledger-accounts/create-ledger-account-dialog';

const TYPE_OPTIONS = ['ALL', 'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;

export default function LedgerAccountTable() {
  const { data, isLoading, isError } = useGetLedgerAccounts();
  const { mutateAsync: updateAccount, isPending: isUpdating } =
    useUpdateLedgerAccount();
  const { mutateAsync: deleteAccount, isPending: isDeleting } =
    useDeleteLedgerAccount();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_OPTIONS)[number]>('ALL');
  const [renaming, setRenaming] = useState<LedgerAccountTypeRes | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleting, setDeleting] = useState<LedgerAccountTypeRes | null>(null);

  const accounts = data?.payload?.data ?? [];

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchType = typeFilter === 'ALL' || account.type === typeFilter;
      const matchKeyword =
        !keyword ||
        account.code.toLowerCase().includes(keyword) ||
        account.name.toLowerCase().includes(keyword);
      return matchType && matchKeyword;
    });
  }, [accounts, search, typeFilter]);

  const toggleActive = async (account: LedgerAccountTypeRes) => {
    try {
      await updateAccount({ id: account.id, body: { isActive: !account.isActive } });
      toast.success(account.isActive ? `Đã tắt ${account.code}` : `Đã bật ${account.code}`);
    } catch (error: any) {
      toast.error(error?.payload?.message ?? 'Không đổi được trạng thái');
    }
  };

  const submitRename = async () => {
    if (!renaming) return;
    try {
      await updateAccount({ id: renaming.id, body: { name: renameValue.trim() } });
      toast.success('Đã đổi tên tài khoản');
      setRenaming(null);
    } catch (error: any) {
      toast.error(error?.payload?.message ?? 'Không đổi được tên');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteAccount(deleting.id);
      toast.success(`Đã xoá ${deleting.code}`);
      setDeleting(null);
    } catch (error: any) {
      toast.error(error?.payload?.message ?? 'Không xoá được tài khoản');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Tìm theo mã hoặc tên…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="sm:max-w-xs"
          />
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}
          >
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'ALL' ? 'Tất cả loại' : LEDGER_ACCOUNT_TYPE_LABEL[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CreateLedgerAccountDialog />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[170px]">Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead className="w-[120px]">Loại</TableHead>
              <TableHead className="w-[130px] text-right">Tổng Nợ</TableHead>
              <TableHead className="w-[130px] text-right">Tổng Có</TableHead>
              <TableHead className="w-[130px] text-right">Số dư</TableHead>
              <TableHead className="w-[90px] text-center">Đang dùng</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                  Đang tải danh mục tài khoản…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-destructive">
                  Không tải được danh mục (kiểm tra quyền LEDGER-ACCOUNTS)
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                  Không có tài khoản nào khớp
                </TableCell>
              </TableRow>
            )}
            {filtered.map((account) => (
              <TableRow key={account.id} className={account.isActive ? '' : 'opacity-60'}>
                <TableCell className="font-mono text-xs">
                  <div className="flex items-center gap-2">
                    {account.code}
                    {account.isSystem && (
                      <Badge variant="secondary" className="text-[10px]">
                        hệ thống
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell className="text-xs">
                  {LEDGER_ACCOUNT_TYPE_LABEL[account.type]}
                  {account.isCash && <span className="ml-1 text-muted-foreground">(tiền mặt)</span>}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(account.totalDebit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(account.totalCredit)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(account.balance)}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={account.isActive}
                    disabled={account.isSystem || isUpdating}
                    onCheckedChange={() => toggleActive(account)}
                    title={account.isSystem ? 'Tài khoản hệ thống không tắt được' : ''}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setRenaming(account);
                        setRenameValue(account.name);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={account.isSystem || account.lineCount > 0 || isDeleting}
                      title={
                        account.isSystem
                          ? 'Tài khoản hệ thống không xoá được'
                          : account.lineCount > 0
                            ? 'Đã có bút toán, chỉ được tắt'
                            : 'Xoá tài khoản'
                      }
                      onClick={() => setDeleting(account)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!renaming} onOpenChange={(open) => !open && setRenaming(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đổi tên {renaming?.code}</AlertDialogTitle>
            <AlertDialogDescription>
              Mã tài khoản không đổi được (báo cáo dùng mã).{renaming?.isSystem && ' Đây là tài khoản hệ thống: chỉ sửa được tên.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={renameValue} onChange={(event) => setRenameValue(event.target.value)} />
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={submitRename} disabled={isUpdating || !renameValue.trim()}>
              Lưu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá {deleting?.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tài khoản này chưa có bút toán nào nên xoá được. Nếu sau này cần, hãy tạo lại cùng mã.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
