'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  AlertTriangle,
  FileWarning,
  ImagePlus,
  LockKeyhole,
  Plus,
  UnlockKeyhole,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  CASH_MOVEMENT_LABEL,
  CashMovementTypeRes,
} from '@/app/ValidationSchemas/cash-shift.schema';
import {
  useAddCashMovement,
  useCloseCashShift,
  useGetCashShiftCurrent,
  useGetCashShifts,
  useOpenCashShift,
} from '@/app/queries/useCashShift';
import { mediaApiRequest } from '@/apiRequest/media';
import { formatCurrency } from '@/lib/utils';
import { useI18n } from '@/i18n/locale-provider';
import { T } from '@/components/t';

/*
 * Ảnh chứng từ hiển thị bằng <img> thường (không qua next/image): URL Cloudinary do
 * BE trả về, kích thước thumbnail 32–64px nên không cần tối ưu, và tránh phụ thuộc
 * danh sách host của next/image — chứng từ không được phép làm chết trang.
 */
const MAX_EVIDENCE = 5;
const EVIDENCE_ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm';

const isVideoUrl = (url: string) => /\.(mp4|mov|webm)(\?|$)/i.test(url) || url.includes('/video/upload/');

const formatTime = (value: string | null) =>
  value ? new Date(value).toLocaleString('vi-VN') : '—';

function Stat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: 'default' | 'danger' | 'success';
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div
        className={
          tone === 'danger'
            ? 'text-xl font-semibold text-destructive'
            : tone === 'success'
              ? 'text-xl font-semibold text-emerald-600'
              : 'text-xl font-semibold'
        }
      >
        {formatCurrency(value)}
      </div>
      {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export default function CashShiftBoard() {
  const { t } = useI18n();
  const current = useGetCashShiftCurrent();
  const history = useGetCashShifts({ limit: 20 });
  const { mutateAsync: openShift, isPending: isOpening } = useOpenCashShift();
  const { mutateAsync: closeShift, isPending: isClosing } = useCloseCashShift();
  const { mutateAsync: addMovement, isPending: isAddingMovement } =
    useAddCashMovement();

  const [openingFloat, setOpeningFloat] = useState('0');
  const [openNote, setOpenNote] = useState('');
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('OUT');
  const [movementReason, setMovementReason] = useState('');
  const [movementAmount, setMovementAmount] = useState('');
  /** Chứng từ đã upload xong (URL Cloudinary) */
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [countedCash, setCountedCash] = useState('');
  const [closeNote, setCloseNote] = useState('');

  const shift = current.data?.payload ?? null;
  const totals = shift?.liveTotals;
  const movements = useMemo<CashMovementTypeRes[]>(
    () => shift?.movements ?? [],
    [shift],
  );
  const historyRows = history.data?.payload?.data ?? [];

  const movementSum = useMemo(() => {
    const sum = { IN: 0, OUT: 0 };
    for (const movement of movements) sum[movement.type] += movement.amount;
    return sum;
  }, [movements]);

  const handleOpen = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await openShift({
        openingFloat: Number(openingFloat),
        note: openNote.trim() || undefined,
      });
      setOpenNote('');
      toast.success(t("Đã mở ca"));
    } catch (error: any) {
      toast.error(error?.message ?? 'Không mở được ca');
    }
  };

  const handleEvidencePick = async (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = MAX_EVIDENCE - evidenceUrls.length;
    if (remaining <= 0) {
      toast.warn(`Tối đa ${MAX_EVIDENCE} chứng từ cho 1 khoản chi`);
      return;
    }
    setIsUploading(true);
    try {
      const urls = await mediaApiRequest.uploadEvidence(
        Array.from(files).slice(0, remaining),
      );
      setEvidenceUrls((current) => [...current, ...urls]);
      toast.success(`Đã tải ${urls.length} chứng từ`);
    } catch (error: any) {
      toast.error(error?.message ?? 'Tải chứng từ thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMovement = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!shift) return;
    try {
      await addMovement({
        id: shift.id,
        body: {
          type: movementType,
          reason: movementReason.trim(),
          amount: Number(movementAmount),
          evidenceUrls: evidenceUrls.length ? evidenceUrls : undefined,
        },
      });
      setMovementReason('');
      setMovementAmount('');
      setEvidenceUrls([]);
      toast.success(movementType === 'IN' ? 'Đã ghi thu tiền' : 'Đã ghi chi tiền');
    } catch (error: any) {
      toast.error(error?.message ?? 'Không ghi được thu/chi');
    }
  };

  const handleClose = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!shift) return;
    try {
      const closed = await closeShift({
        id: shift.id,
        body: {
          countedCash: Number(countedCash),
          note: closeNote.trim() || undefined,
        },
      });
      const variance = closed.payload?.variance ?? 0;
      setCountedCash('');
      setCloseNote('');
      if (variance === 0) toast.success(t("Đóng ca: két khớp"));
      else if (variance < 0)
        toast.warn(`Đóng ca: thiếu ${formatCurrency(Math.abs(variance))} — đã ghi sổ thiếu quỹ`);
      else toast.info(`Đóng ca: thừa ${formatCurrency(variance)} — đã ghi sổ thừa quỹ`);
    } catch (error: any) {
      toast.error(error?.message ?? 'Không đóng được ca');
    }
  };

  return (
    <div className="grid gap-4">
      {current.isLoading ? (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            <T>Đang tải ca làm việc…</T>
          </CardContent>
        </Card>
      ) : shift ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UnlockKeyhole className="h-5 w-5" /> Ca #{shift.id} đang mở
            </CardTitle>
            <CardDescription>
              Mở lúc {formatTime(shift.openedAt)} · nhân viên #{shift.staffId}
              {shift.note ? ` · ${shift.note}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Stat label={t("Tiền lẻ đầu ca")} value={totals?.openingFloat ?? 0} />
              <Stat
                label={t("Thu tiền mặt trong ca")}
                value={(totals?.cashIn ?? 0) + (totals?.cashInMovements ?? 0)}
                hint={
                  movementSum.IN > 0
                    ? `gồm ${formatCurrency(movementSum.IN)} thu tay`
                    : undefined
                }
                tone="success"
              />
              <Stat label="Chi trong ca" value={totals?.cashOut ?? 0} tone="danger" />
              <Stat
                label={t("Két phải có")}
                value={totals?.expectedCash ?? 0}
                hint="tiền lẻ + thu − chi"
              />
              <div className="rounded-lg border p-3">
                <div className="text-xs uppercase text-muted-foreground">
                  <T>Đơn tiền mặt chưa thu</T>
                </div>
                <div
                  className={
                    (totals?.unpaidCashOrders ?? 0) > 0
                      ? 'flex items-center gap-1 text-xl font-semibold text-destructive'
                      : 'text-xl font-semibold'
                  }
                >
                  {(totals?.unpaidCashOrders ?? 0) > 0 ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : null}
                  {totals?.unpaidCashOrders ?? 0}
                </div>
                {(totals?.unpaidCashOrders ?? 0) > 0 ? (
                  <div className="text-xs text-destructive">
                    <T>Phải thu hết mới đóng ca được</T>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h3 className="mb-2 text-sm font-semibold">{t("Thu / chi tiền mặt")}</h3>
                <form className="mb-3 flex flex-wrap items-end gap-2" onSubmit={handleMovement}>
                  <div className="grid gap-1">
                    <Label htmlFor="movement-type">{t("Loại")}</Label>
                    <select
                      id="movement-type"
                      className="h-9 rounded-md border bg-background px-2 text-sm"
                      value={movementType}
                      onChange={(event) =>
                        setMovementType(event.target.value as 'IN' | 'OUT')
                      }
                    >
                      <option value="OUT">Chi ra</option>
                      <option value="IN">{t("Thu vào")}</option>
                    </select>
                  </div>
                  <div className="grid min-w-[12rem] flex-1 gap-1">
                    <Label htmlFor="movement-reason">{t("Lý do")}</Label>
                    <Input
                      id="movement-reason"
                      value={movementReason}
                      onChange={(event) => setMovementReason(event.target.value)}
                      placeholder={t("mua đá, trả tiền rau…")}
                      required
                    />
                  </div>
                  <div className="grid w-32 gap-1">
                    <Label htmlFor="movement-amount">{t("Số tiền")}</Label>
                    <Input
                      id="movement-amount"
                      inputMode="numeric"
                      value={movementAmount}
                      onChange={(event) => setMovementAmount(event.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isAddingMovement || isUploading}>
                    <Plus className="mr-1 h-4 w-4" /> Ghi
                  </Button>

                  <div className="flex w-full flex-wrap items-center gap-2">
                    <label
                      htmlFor="movement-evidence"
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
                    >
                      <ImagePlus className="h-4 w-4" />
                      {isUploading ? 'Đang tải…' : 'Đính kèm ảnh/video chứng từ'}
                    </label>
                    <input
                      id="movement-evidence"
                      type="file"
                      className="hidden"
                      accept={EVIDENCE_ACCEPT}
                      multiple
                      onChange={(event) => {
                        void handleEvidencePick(event.target.files);
                        event.target.value = '';
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      Hoá đơn / biên nhận — tối đa {MAX_EVIDENCE} file, ảnh ≤5MB, video ≤30MB
                    </span>
                  </div>

                  {evidenceUrls.length > 0 ? (
                    <div className="flex w-full flex-wrap gap-2">
                      {evidenceUrls.map((url) => (
                        <div
                          key={url}
                          className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted"
                        >
                          {isVideoUrl(url) ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-full w-full items-center justify-center text-xs"
                            >
                              video
                            </a>
                          ) : (
                            <img
                              src={url}
                              alt="chứng từ"
                              className="absolute inset-0 h-full w-full object-cover"
                              loading="lazy"
                            />
                          )}
                          <button
                            type="button"
                            aria-label={t("Bỏ chứng từ")}
                            className="absolute right-0 top-0 rounded-bl bg-background/90 p-0.5"
                            onClick={() =>
                              setEvidenceUrls((current) => current.filter((item) => item !== url))
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </form>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("Loại")}</TableHead>
                      <TableHead>{t("Lý do")}</TableHead>
                      <TableHead>{t("Chứng từ")}</TableHead>
                      <TableHead className="text-right">{t("Số tiền")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-sm text-muted-foreground">
                          <T>Chưa có khoản thu/chi nào trong ca</T>
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            <Badge variant={movement.type === 'IN' ? 'default' : 'secondary'}>
                              {CASH_MOVEMENT_LABEL[movement.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>{movement.reason}</TableCell>
                          <TableCell>
                            {(movement.evidenceUrls ?? []).length === 0 ? (
                              movement.type === 'OUT' ? (
                                <span className="flex items-center gap-1 text-xs text-amber-600">
                                  <FileWarning className="h-3 w-3" /> thiếu chứng từ
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )
                            ) : (
                              <div className="flex gap-1">
                                {movement.evidenceUrls.map((url) =>
                                  isVideoUrl(url) ? (
                                    <a
                                      key={url}
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex h-8 w-8 items-center justify-center rounded border text-[10px]"
                                    >
                                      video
                                    </a>
                                  ) : (
                                    <a
                                      key={url}
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="relative h-8 w-8 overflow-hidden rounded border"
                                    >
                                      <img
                                        src={url}
                                        alt="chứng từ"
                                        className="absolute inset-0 h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                    </a>
                                  ),
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(movement.amount)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">{t("Đóng ca — đếm két")}</h3>
                <form className="grid gap-3" onSubmit={handleClose}>
                  <div className="grid gap-1">
                    <Label htmlFor="counted-cash">{t("Tiền mặt thực đếm")}</Label>
                    <Input
                      id="counted-cash"
                      inputMode="numeric"
                      value={countedCash}
                      onChange={(event) => setCountedCash(event.target.value)}
                      placeholder={String(totals?.expectedCash ?? '')}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Két phải có {formatCurrency(totals?.expectedCash ?? 0)}. Lệch thừa/thiếu
                      sẽ tự sinh bút toán <b>CASH_OVERAGE</b> / <b>CASH_SHORTAGE</b> vào sổ cái.
                    </p>
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="close-note">{t("Ghi chú (tuỳ chọn)")}</Label>
                    <Textarea
                      id="close-note"
                      value={closeNote}
                      onChange={(event) => setCloseNote(event.target.value)}
                      rows={2}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isClosing || (totals?.unpaidCashOrders ?? 0) > 0}
                  >
                    <LockKeyhole className="mr-1 h-4 w-4" /> Đóng ca
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UnlockKeyhole className="h-5 w-5" /> Mở ca làm việc
            </CardTitle>
            <CardDescription>
              <T>Mỗi chi nhánh chỉ có 1 ca mở. Đếm tiền lẻ có sẵn trong két trước khi mở ca.</T>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-wrap items-end gap-2" onSubmit={handleOpen}>
              <div className="grid w-40 gap-1">
                <Label htmlFor="opening-float">{t("Tiền lẻ đầu ca")}</Label>
                <Input
                  id="opening-float"
                  inputMode="numeric"
                  value={openingFloat}
                  onChange={(event) => setOpeningFloat(event.target.value)}
                  required
                />
              </div>
              <div className="grid min-w-[14rem] flex-1 gap-1">
                <Label htmlFor="open-note">{t("Ghi chú (tuỳ chọn)")}</Label>
                <Input
                  id="open-note"
                  value={openNote}
                  onChange={(event) => setOpenNote(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={isOpening}>
                <T>Mở ca</T>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("Lịch sử ca")}</CardTitle>
          <CardDescription>
            <T>20 ca gần nhất của chi nhánh. Lệch két đã ghi sổ cái ở tài khoản thiếu/thừa quỹ.</T>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ca</TableHead>
                <TableHead>{t("Mở")}</TableHead>
                <TableHead>{t("Đóng")}</TableHead>
                <TableHead className="text-right">{t("Đầu ca")}</TableHead>
                <TableHead className="text-right">{t("Thu tiền mặt")}</TableHead>
                <TableHead className="text-right">Chi</TableHead>
                <TableHead className="text-right">{t("Két phải có")}</TableHead>
                <TableHead className="text-right">{t("Đếm được")}</TableHead>
                <TableHead className="text-right">{t("Lệch")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-sm text-muted-foreground">
                    <T>Chưa có ca nào</T>
                  </TableCell>
                </TableRow>
              ) : (
                historyRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      #{row.id}{' '}
                      <Badge variant={row.status === 'OPEN' ? 'default' : 'outline'}>
                        {row.status === 'OPEN' ? 'đang mở' : 'đã đóng'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatTime(row.openedAt)}</TableCell>
                    <TableCell>{formatTime(row.closedAt)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(row.openingFloat)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(row.cashIn)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.cashOut)}</TableCell>
                    <TableCell className="text-right">
                      {row.expectedCash === null ? '—' : formatCurrency(row.expectedCash)}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.countedCash === null ? '—' : formatCurrency(row.countedCash)}
                    </TableCell>
                    <TableCell
                      className={
                        (row.variance ?? 0) < 0
                          ? 'text-right font-medium text-destructive'
                          : (row.variance ?? 0) > 0
                            ? 'text-right font-medium text-emerald-600'
                            : 'text-right'
                      }
                    >
                      {row.variance === null ? '—' : formatCurrency(row.variance)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
