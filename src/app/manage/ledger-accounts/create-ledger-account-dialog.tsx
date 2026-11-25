'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreateLedgerAccountBodyType,
  LEDGER_ACCOUNT_TYPE_LABEL,
  createLedgerAccountBodySchema,
} from '@/app/ValidationSchemas/ledger-account.schema';
import { useCreateLedgerAccount } from '@/app/queries/useLedgerAccount';
import { handleErrorApi } from '@/lib/utils';
import { useI18n } from '@/i18n/locale-provider';

const TYPES = ['EXPENSE', 'REVENUE', 'ASSET', 'LIABILITY', 'EQUITY'] as const;

export default function CreateLedgerAccountDialog() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateLedgerAccount();

  const form = useForm<CreateLedgerAccountBodyType>({
    resolver: zodResolver(createLedgerAccountBodySchema),
    defaultValues: { code: '', name: '', type: 'EXPENSE' },
  });

  const onSubmit = async (values: CreateLedgerAccountBodyType) => {
    if (isPending) return;
    try {
      await mutateAsync(values);
      toast.success(`Đã thêm tài khoản ${values.code}`);
      form.reset({ code: '', name: '', type: 'EXPENSE' });
      setOpen(false);
    } catch (error) {
      handleErrorApi({ error, setError: form.setError });
      toast.error(t("Không thêm được tài khoản"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Thêm tài khoản chi tiết
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("Thêm tài khoản chi tiết")}</DialogTitle>
          <DialogDescription>
            Chỉ dùng cho tài khoản phân loại báo cáo (chi phí, doanh thu khác).
            Tài khoản hệ thống (CASH, VNPAY_CLEARING, …) đã có sẵn và không xoá
            được.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            id="create-ledger-account-form"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Mã tài khoản")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="EXPENSE_ELECTRIC"
                      {...field}
                      onChange={(event) =>
                        field.onChange(event.target.value.toUpperCase())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Tên hiển thị")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("Tiền điện")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Loại tài khoản")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("Chọn loại")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {LEDGER_ACCOUNT_TYPE_LABEL[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="submit"
            form="create-ledger-account-form"
            disabled={isPending}
          >
            {isPending ? 'Đang lưu…' : 'Thêm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
