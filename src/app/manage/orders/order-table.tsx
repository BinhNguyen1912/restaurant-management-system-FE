'use client';
import { createContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'react-toastify';
import PaymentSuccessDialog from '@/components/payment-success-dialog';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, getVietnameseOrderStatus, handleErrorApi } from '@/lib/utils';
import { useAppStore } from '@/components/app-provider';
import { getAccessTokenFormLocalStorage, generateSocketIo } from '@/lib/utils';
import { OrderStatus, OrderStatusValues } from '@/app/constants/type';
import {
  OrderResType,
  OrdersListResType,
} from '@/app/ValidationSchemas/order.schema';
import orderApiRequest from '@/apiRequest/order';
import { useUpdateOrderMutation } from '@/app/queries/useOrder';
import { useListTableNode } from '@/app/queries/useTableNode';
import { useOrderService } from './order.service';
import AutoPagination from '@/components/auto-pagination';
import orderTableColumns from './order-table-columns';
import TableSkeleton from './table-skeleton';
import OrderStatics from './order-statics';
import NewOrderSound from '@/components/newOrderSound';
import AddOrder from './add-order';
import { useI18n } from '@/i18n/locale-provider';

const PAGE_SIZE = 10;
const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());

export type StatusCountObject = Record<
  (typeof OrderStatusValues)[number],
  number
>;
export type Statics = {
  status: StatusCountObject;
  table: Record<number, Record<number, StatusCountObject>>;
};
export type OrderObjectByGuestID = Record<number, OrdersListResType['data']>;
export type ServingGuestByTableNumber = Record<number, OrderObjectByGuestID>;

export const OrderTableContext = createContext({
  setOrderIdEdit: (value: number | undefined) => {},
  orderIdEdit: undefined as number | undefined,
  changeStatus: (payload: {
    orderId: number;
    dishId: number;
    status: (typeof OrderStatusValues)[number];
    quantity: number;
  }) => {},
  orderObjectByGuestId: {} as OrderObjectByGuestID,
  refetchOrderList: () => {},
});

export default function OrderTable() {
  const { t } = useI18n();
  const searchParam = useSearchParams();
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1;
  const pageIndex = page - 1;

  const socket = useAppStore((state) => state.socket);
  const setSocket = useAppStore((state) => state.setSocket);
  const isAuth = useAppStore((state) => state.isAuth);
  const role = useAppStore((state) => state.role);
  const [openStatusFilter, setOpenStatusFilter] = useState(false);
  const [fromDate, setFromDate] = useState(initFromDate);
  const [toDate, setToDate] = useState(initToDate);
  const [orderIdEdit, setOrderIdEdit] = useState<number | undefined>();
  const [orderList, setOrderList] = useState<OrdersListResType['data']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDialogData, setPaymentDialogData] = useState<{
    guestName?: string;
    tableName?: string;
    orderCount?: number;
    amountText?: string;
    message?: string;
  } | null>(null);

  // API calls
  const fetchOrderList = async () => {
    setIsLoading(true);
    try {
      const response = await orderApiRequest.getOrdersList({
        page: page,
        limit: PAGE_SIZE,
        fromDate: fromDate || initFromDate,
        toDate: toDate || initToDate,
      });
      setOrderList(response.payload?.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refetchOrderList = async () => {
    await fetchOrderList();
  };

  // Table data
  const tableListQuery = useListTableNode();

  // Effects
  useEffect(() => {
    fetchOrderList();
  }, [fromDate, toDate]);

  // Socket effects for new orders
  useEffect(() => {
    if (!socket?.connected) return;

    function onNewOrder(data: any) {
      // Kiểm tra data có tồn tại không
      if (!data) {
        console.error('❌ No data received in new-order event');
        return;
      }

      // Xử lý cả trường hợp data là object đơn hoặc mảng
      let orderData;
      if (Array.isArray(data)) {
        if (data.length === 0) {
          return;
        }
        orderData = data[0]; // Lấy đơn hàng đầu tiên
      } else {
        orderData = data;
      }

      // Kiểm tra orderData có tồn tại không
      if (!orderData) {
        return;
      }

      // Kiểm tra orderData có cấu trúc đúng không
      if (typeof orderData !== 'object') {
        return;
      }

      const guest = orderData?.guest;
      const tableNode = orderData?.tableNode;
      const items = orderData?.items;

      if (!guest) {
        console.error('❌ No guest found in order data');
        return;
      }

      // Báo âm thanh
      setHasNewOrder(true);
      setTimeout(() => setHasNewOrder(false), 1000);

      // Hiển thị toast thông báo
      toast.warning(
        `Khách hàng ${guest?.name} vừa đặt ${items?.length || 1} món mới tại bàn ${tableNode?.name || 'không xác định'}`,
        {
          hideProgressBar: true,
          autoClose: 2000,
          icon: false,
        },
      );

      // Refresh order list
      fetchOrderList();

      // Refetch tableNode để cập nhật số người
      console.log('🔄 Refetching tableNode...');
      tableListQuery.refetch();
    }

    socket.on('new-order', onNewOrder);

    return () => {
      socket.off('new-order', onNewOrder);
    };
  }, [socket, tableListQuery]);

  // Listen for order status updates
  useEffect(() => {
    if (!socket?.connected) {
      console.log(
        '🔌 Socket not connected, skipping order-status-updated listener',
      );
      return;
    }

    console.log('🎧 Setting up order-status-updated listener...');

    function onOrderStatusUpdated(data: any) {
      console.log('📢 Order status updated:', data);

      // Hiển thị toast thông báo cho guest
      toast.success(data.message || 'Trạng thái đơn hàng đã được cập nhật', {
        hideProgressBar: true,
        autoClose: 3000,
      });

      // Cập nhật order trong danh sách nếu có
      if (data.order) {
        setOrderList((prevOrders) =>
          prevOrders.map((order) => {
            if (order.id === data.order.id) {
              return {
                ...order,
                status: data.order.status,
                quantity: data.order.quantity,
              };
            }
            return order;
          }),
        );
      }

      // Refetch tableNode để cập nhật số người
      console.log('🔄 Refetching tableNode...');
      tableListQuery.refetch();
    }

    socket.on('order-status-updated', onOrderStatusUpdated);
    console.log('✅ order-status-updated listener registered');

    return () => {
      socket.off('order-status-updated', onOrderStatusUpdated);
      console.log('🗑️ order-status-updated listener removed');
    };
  }, [socket, tableListQuery]);

  // Listen for payment success
  useEffect(() => {
    if (!socket?.connected) {
      console.log('🔌 Socket not connected, skipping payment-success listener');
      return;
    }

    function onPaymentSuccess(data: any) {
      const orderCount = Array.isArray(data)
        ? data.length
        : data?.orders?.length || 1;
      setPaymentDialogData({
        ...data,
        orderCount,
      });
      setPaymentDialogOpen(true);
      refetchOrderList();
      tableListQuery.refetch();
    }

    socket.on('payment-success', onPaymentSuccess);

    return () => {
      socket.off('payment-success', onPaymentSuccess);
    };
  }, [socket, refetchOrderList, tableListQuery]);

  const tableList = tableListQuery.data?.payload?.data ?? [];
  const tableListSortedByNumber = tableList.sort((a: any, b: any) => {
    const getNumber = (name: string) => {
      const match = name.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };
    return getNumber(a.name) - getNumber(b.name);
  });

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex,
    pageSize: PAGE_SIZE,
  });

  // Mutations
  const updateOrderMutation = useUpdateOrderMutation();

  const confirmCancel = async () => {
    if (!cancelRequest) return;
    if (!cancelRequest.reason.trim()) {
      toast.error(t("Nhập lý do huỷ đơn"));
      return;
    }
    setIsCancelSubmitting(true);
    try {
      await changeStatus({
        orderId: cancelRequest.orderId,
        dishId: cancelRequest.dishId,
        quantity: cancelRequest.quantity,
        status: OrderStatus.CANCELLED,
        reason: cancelRequest.reason,
      });
      setCancelRequest(null);
    } finally {
      setIsCancelSubmitting(false);
    }
  };

  // Order service
  const { statics, orderObjectByGuestId, servingGuestByTableNumber } =
    useOrderService(orderList);

  // Actions
  /**
   * Huỷ đơn: BE BẮT BUỘC có lý do (ticket #10) -> mở hộp thoại để nhập, không gửi request rỗng.
   * Đây là thao tác nhạy cảm: lý do được ghi vào nhật ký thao tác để giải trình sau này.
   */
  const [cancelRequest, setCancelRequest] = useState<{
    orderId: number;
    dishId: number;
    quantity: number;
    reason: string;
  } | null>(null);
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);

  const changeStatus = async (body: {
    orderId: number;
    dishId: number;
    status: (typeof OrderStatusValues)[number];
    quantity: number;
    reason?: string;
  }) => {
    // Chưa có lý do -> hỏi trước, chưa gọi API
    if (body.status === OrderStatus.CANCELLED && !body.reason?.trim()) {
      setCancelRequest({
        orderId: body.orderId,
        dishId: body.dishId,
        quantity: body.quantity,
        reason: '',
      });
      return;
    }

    try {
      // Chuyển đổi sang format mới cho API
      await updateOrderMutation.mutateAsync({
        id: body.orderId,
        data: {
          status: body.status,
          quantity: body.quantity,
          skuId: body.dishId, // dishId được map thành skuId
          ...(body.reason?.trim() ? { reason: body.reason.trim() } : {}),
        },
      });

      // Cập nhật trực tiếp state local thay vì reload toàn bộ
      setOrderList((prevOrders) =>
        prevOrders.map((order) => {
          if (order.id === body.orderId) {
            return {
              ...order,
              status: body.status,
              quantity: body.quantity,
            };
          }
          return order;
        }),
      );
    } catch (error) {
      handleErrorApi({ error });
    }
  };
  // Table setup
  const table = useReactTable({
    data: orderList,
    columns: orderTableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE,
    });
  }, [table, pageIndex]);

  const resetDateFilter = () => {
    setFromDate(initFromDate);
    setToDate(initToDate);
  };

  useEffect(() => {
    if (socket?.connected) {
      onConnect();
    }

    function onConnect() {
      console.log('Socket connected:', socket?.id);
    }

    function onDisconnect() {
      console.log('Socket disconnected');
    }

    function refetch() {
      const now = new Date();
      if (now >= fromDate && now <= toDate) {
        refetchOrderList();
      }
    }

    function onNewOrder(data: OrderResType) {
      console.log('data', data);
      const { guest, tableNode, items } = data;
      // toast(
      //   `${guest?.name} tại bàn ${tableNode?.name} vừa đặt ${items?.length} đơn`,
      // );

      setHasNewOrder(true);

      refetch();

      // Refetch tableNode để cập nhật số người
      console.log('🔄 Refetching tableNode...');
      tableListQuery.refetch();
    }

    function onPayment(data: any) {
      const first = Array.isArray(data) ? data[0] : data;
      const guestName = first?.guest?.name;
      const tableName = first?.guest?.tableNode?.name;
      const orderCount = Array.isArray(data)
        ? data.length
        : first?.orders?.length || 1;
      setPaymentDialogData({ ...first, guestName, tableName, orderCount });
      setPaymentDialogOpen(true);
      refetch();

      // Refetch tableNode để cập nhật số người
      console.log('🔄 Refetching tableNode...');
      tableListQuery.refetch();
    }

    socket?.on('connect', onConnect);
    socket?.on('disconnect', onDisconnect);
    socket?.on('new-order', onNewOrder);
    socket?.on('payment', onPayment);

    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.off('new-order', onNewOrder);
      socket?.off('payment', onPayment);
    };
  }, [refetchOrderList, fromDate, toDate, socket, tableListQuery]);

  useEffect(() => {
    if (hasNewOrder) {
      const timer = setTimeout(() => {
        setHasNewOrder(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasNewOrder]);

  return (
    <OrderTableContext.Provider
      value={{
        orderIdEdit,
        setOrderIdEdit,
        changeStatus,
        orderObjectByGuestId,
        refetchOrderList: refetchOrderList,
      }}
    >
      <div className="w-full">
        {/* Edit Order Modal */}
        {/* <EditOrder
          id={orderIdEdit}
          setId={setOrderIdEdit}
          onSubmitSuccess={() => {}}
        /> */}

        {/* Order Statistics */}

        <div className="flex items-center">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <span className="mr-2">{t("Từ")}</span>
              <Input
                type="datetime-local"
                placeholder={t("Từ ngày")}
                className="text-sm"
                value={format(fromDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                onChange={(event) => setFromDate(new Date(event.target.value))}
              />
            </div>
            <div className="flex items-center">
              <span className="mr-2">{t("Đến")}</span>
              <Input
                type="datetime-local"
                placeholder={t("Đến ngày")}
                value={format(toDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                onChange={(event) => setToDate(new Date(event.target.value))}
              />
            </div>
            <Button variant="outline" onClick={resetDateFilter}>
              Reset
            </Button>
          </div>
          <div className="ml-auto">
            <AddOrder />
          </div>
        </div>
        {/* Table Filters */}
        <div className="flex flex-wrap items-center gap-4 py-4">
          <Input
            placeholder={t("Tên khách")}
            value={
              (table.getColumn('guestName')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('guestName')?.setFilterValue(event.target.value)
            }
            className="max-w-[100px]"
          />
          <Input
            placeholder={t("Số bàn")}
            value={
              (table.getColumn('tableNodeId')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('tableNodeId')?.setFilterValue(event.target.value)
            }
            className="max-w-[80px]"
          />
          <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStatusFilter}
                className="w-[150px] text-sm justify-between"
              >
                {table.getColumn('status')?.getFilterValue()
                  ? getVietnameseOrderStatus(
                      table
                        .getColumn('status')
                        ?.getFilterValue() as (typeof OrderStatusValues)[number],
                    )
                  : 'Trạng thái'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandGroup>
                  <CommandList>
                    {OrderStatusValues.map((status) => (
                      <CommandItem
                        key={status}
                        value={status}
                        onSelect={(currentValue) => {
                          table
                            .getColumn('status')
                            ?.setFilterValue(
                              currentValue ===
                                table.getColumn('status')?.getFilterValue()
                                ? ''
                                : currentValue,
                            );
                          setOpenStatusFilter(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            table.getColumn('status')?.getFilterValue() ===
                              status
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {getVietnameseOrderStatus(status)}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <OrderStatics
          statics={statics}
          tableNodeList={tableListSortedByNumber}
          servingGuestByTableNumber={servingGuestByTableNumber}
          dataOrder={orderList}
        />

        {/* Orders Table */}
        {isLoading && <TableSkeleton />}
        {!isLoading && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={orderTableColumns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        {/* Pagination */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-xs text-muted-foreground py-4 flex-1">
            Hiển thị{' '}
            <strong>{table.getPaginationRowModel().rows.length}</strong> trong{' '}
            <strong>{orderList.length}</strong> kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname="/manage/orders"
            />
          </div>
        </div>
      </div>
      <NewOrderSound hasNewOrder={hasNewOrder} />
      <PaymentSuccessDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        data={paymentDialogData}
      />
    </OrderTableContext.Provider>
  );
}
