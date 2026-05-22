'use client';

/**
 * Diagnosis & Billing — List of Invoices.
 * Layout matches Patient Registry, Referring Doctors, and Test Packages listing pages.
 */
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import InvoiceFilters from './InvoiceHeader';
import InvoiceTable from './InvoiceTable';
import { BookingDetails } from './booking_details';
import CancelOrder, { type CancelOrderFormValues } from './cancel-order';
import ProcessPayment, { type ProcessPaymentFormValues } from './payment';
import { TransactionDetails } from './transaction';
import { CancelDetails } from './cancel-details';
import AddNewReceipt from './AddNewReceipt';
import type { Invoice } from './types';
import type { TestOrder } from '@/app/Apis/booking/testOrderApi';
import {
  useBulkDeleteTestOrders,
  useDeleteTestOrder,
  useTestOrderByOrderNumber,
  useTestOrdersByPatientId,
  useTestOrdersByDateRange,
  useTestOrdersByProcessingType,
  useTestOrdersByStatus,
  useTestOrdersList,
  useTestOrderDetail,
} from '@/app/Apis/booking/useTestOrders';
import { useCancelTestOrder, useProcessOrderPayment } from '@/app/Apis/booking/useOrderLifecycle';
import { mapTestOrderToInvoice } from '@/app/Apis/booking/mapTestOrderToInvoice';
import { usePatientsByIds } from '@/app/Apis/Patients/usePatientsByIds';
import { useTestsByIds } from '@/app/Apis/lab/useTestsByIds';
import {
  DEFAULT_PROCESSING_TYPE_FILTER,
  DEFAULT_SEARCH_BY,
  getDefaultInvoiceDateRange,
  isOrderStatusApiFilter,
  isPaymentStatusFilter,
  isProcessingTypeApiFilter,
  processingTypeToSearchTerm,
  SEARCH_TYPE_PLACEHOLDER,
  type InvoiceOrderStatus,
  type InvoiceProcessingTypeFilter,
  type InvoiceSearchBy,
  type InvoiceStatusFilter,
} from './constants';

const PAGE_SIZE = 10;
const MIN_PATIENT_SEARCH_LEN = 2;

const defaultDateRange = getDefaultInvoiceDateRange();

function getPatientOrdersLookup(searchTerm: string): string | null {
  const trimmed = searchTerm.trim();
  if (trimmed.length < MIN_PATIENT_SEARCH_LEN) return null;
  return trimmed;
}

type DeleteMode = 'single' | 'bulk';

export default function InvoiceListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const payOrderIdFromUrl = useMemo(() => {
    const param = Number(searchParams.get('payOrderId') || 0);
    return Number.isFinite(param) && param > 0 ? param : null;
  }, [searchParams]);
  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState('');
  const [searchBy, setSearchBy] = useState<InvoiceSearchBy>(DEFAULT_SEARCH_BY);
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);
  const [status, setStatus] = useState<InvoiceStatusFilter>('Order Status');
  const [processingType, setProcessingType] = useState<InvoiceProcessingTypeFilter>(
    DEFAULT_PROCESSING_TYPE_FILTER
  );
  const [flashApiMessage, setFlashApiMessage] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<TestOrder | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [cancelDetailsOpen, setCancelDetailsOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<TestOrder | null>(null);
  const [orderToPay, setOrderToPay] = useState<TestOrder | null>(null);
  const [orderForTransactions, setOrderForTransactions] = useState<TestOrder | null>(null);
  const [orderForCancelDetails, setOrderForCancelDetails] = useState<TestOrder | null>(null);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('single');
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sampleDrawerOpen, setSampleDrawerOpen] = useState(false);
  const [sampleOrderId, setSampleOrderId] = useState<number | null>(null);

  const deleteTestOrderMutation = useDeleteTestOrder();
  const bulkDeleteTestOrdersMutation = useBulkDeleteTestOrders();
  const cancelTestOrderMutation = useCancelTestOrder();
  const processPaymentMutation = useProcessOrderPayment();
  const { data: payOrderDetail } = useTestOrderDetail(payOrderIdFromUrl);
  const isDeletePending =
    deleteTestOrderMutation.isPending || bulkDeleteTestOrdersMutation.isPending;
  const isCancelling = cancelTestOrderMutation.isPending;
  const isProcessingPayment = processPaymentMutation.isPending;

  const [debouncedOrderNumber, setDebouncedOrderNumber] = useState('');
  const [debouncedPatientSearch, setDebouncedPatientSearch] = useState('');

  const isOrderNumberSearch = searchBy === 'Order Number';
  const isPatientNameSearch = searchBy === 'Patient Name';
  const orderNumberLookup = isOrderNumberSearch ? debouncedOrderNumber : '';
  const patientOrdersLookup = isPatientNameSearch
    ? getPatientOrdersLookup(debouncedPatientSearch)
    : null;
  const usePatientOrdersApi = patientOrdersLookup != null;
  const patientNameSearchInvalid =
    isPatientNameSearch &&
    debouncedPatientSearch.length > 0 &&
    debouncedPatientSearch.length < MIN_PATIENT_SEARCH_LEN;
  /** @deprecated Renamed to patientNameSearchInvalid — kept for any stale references */
  const patientIdSearchInvalid = patientNameSearchInvalid;
  const statusLookup: InvoiceOrderStatus | null = isOrderStatusApiFilter(status)
    ? status
    : null;
  const useStatusOrdersApi =
    statusLookup != null && !orderNumberLookup && !usePatientOrdersApi;
  const processingSearchTerm = isProcessingTypeApiFilter(processingType)
    ? processingTypeToSearchTerm(processingType)
    : null;
  const useProcessingTypeApi =
    processingSearchTerm != null &&
    !orderNumberLookup &&
    !usePatientOrdersApi &&
    !useStatusOrdersApi;
  const usePaymentStatusFilter =
    isPaymentStatusFilter(status) &&
    !orderNumberLookup &&
    !usePatientOrdersApi &&
    !useProcessingTypeApi;

  const dateRangeValid =
    Boolean(startDate && endDate) && startDate <= endDate;
  const dateRangeInvalid = Boolean(startDate && endDate) && startDate > endDate;
  const useDateRangeApi =
    dateRangeValid &&
    !orderNumberLookup &&
    !usePatientOrdersApi &&
    !isPatientNameSearch &&
    !useStatusOrdersApi &&
    !useProcessingTypeApi;

  useEffect(() => {
    setPageNo(0);
  }, [search, searchBy, status, processingType, startDate, endDate]);

  useEffect(() => {
    setSelectedIds([]);
  }, [pageNo]);

  useEffect(() => {
    if (!payOrderIdFromUrl || !payOrderDetail?.data) return;
    setOrderToPay(payOrderDetail.data);
    setPaymentOpen(true);
    router.replace('/diagnosis/invoice-list', { scroll: false });
  }, [payOrderIdFromUrl, payOrderDetail?.data, router]);

  useEffect(() => {
    if (!isOrderNumberSearch) {
      setDebouncedOrderNumber('');
      return;
    }
    const timer = window.setTimeout(() => setDebouncedOrderNumber(search.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [search, isOrderNumberSearch]);

  useEffect(() => {
    if (!isPatientNameSearch) {
      setDebouncedPatientSearch('');
      return;
    }
    const timer = window.setTimeout(() => setDebouncedPatientSearch(search.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [search, isPatientNameSearch]);

  const listQueryEnabled =
    !orderNumberLookup &&
    !usePatientOrdersApi &&
    !isPatientNameSearch &&
    !useStatusOrdersApi &&
    !useProcessingTypeApi &&
    !useDateRangeApi &&
    !dateRangeInvalid;

  const {
    data,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    refetch: refetchList,
    isFetching: isListFetching,
    dataUpdatedAt,
  } = useTestOrdersList({
    pageNo,
    pageSize: PAGE_SIZE,
    sortBy: 'createdAt',
    enabled: listQueryEnabled,
  });

  const {
    data: orderByNumberData,
    isLoading: isOrderNumberLoading,
    isError: isOrderNumberError,
    error: orderNumberError,
    refetch: refetchOrderByNumber,
    isFetching: isOrderNumberFetching,
    dataUpdatedAt: orderNumberDataUpdatedAt,
  } = useTestOrderByOrderNumber(orderNumberLookup || null);

  const {
    data: ordersByPatientData,
    isLoading: isPatientOrdersLoading,
    isError: isPatientOrdersError,
    error: patientOrdersError,
    refetch: refetchPatientOrders,
    isFetching: isPatientOrdersFetching,
    dataUpdatedAt: patientOrdersDataUpdatedAt,
  } = useTestOrdersByPatientId(patientOrdersLookup, pageNo, PAGE_SIZE, {
    enabled: usePatientOrdersApi,
  });

  const {
    data: ordersByStatusData,
    isLoading: isStatusOrdersLoading,
    isError: isStatusOrdersError,
    error: statusOrdersError,
    refetch: refetchStatusOrders,
    isFetching: isStatusOrdersFetching,
    dataUpdatedAt: statusOrdersDataUpdatedAt,
  } = useTestOrdersByStatus(statusLookup, pageNo, PAGE_SIZE);

  const {
    data: ordersByDateRangeData,
    isLoading: isDateRangeLoading,
    isError: isDateRangeError,
    error: dateRangeError,
    refetch: refetchDateRange,
    isFetching: isDateRangeFetching,
    dataUpdatedAt: dateRangeDataUpdatedAt,
  } = useTestOrdersByDateRange(
    useDateRangeApi ? { startDate, endDate, pageNo, pageSize: PAGE_SIZE } : null
  );

  const {
    data: ordersByProcessingData,
    isLoading: isProcessingOrdersLoading,
    isError: isProcessingOrdersError,
    error: processingOrdersError,
    refetch: refetchProcessingOrders,
    isFetching: isProcessingOrdersFetching,
    dataUpdatedAt: processingOrdersDataUpdatedAt,
  } = useTestOrdersByProcessingType(processingSearchTerm, pageNo, PAGE_SIZE, {
    enabled: useProcessingTypeApi,
  });

  const isOrderNumberLookup = Boolean(orderNumberLookup);
  const isLoading = isOrderNumberLookup
    ? isOrderNumberLoading
    : usePatientOrdersApi
      ? isPatientOrdersLoading
      : useStatusOrdersApi
        ? isStatusOrdersLoading
        : useProcessingTypeApi
          ? isProcessingOrdersLoading
          : useDateRangeApi
            ? isDateRangeLoading
            : isListLoading;
  const isError = isOrderNumberLookup
    ? isOrderNumberError
    : usePatientOrdersApi
      ? isPatientOrdersError
      : useStatusOrdersApi
        ? isStatusOrdersError
        : useProcessingTypeApi
          ? isProcessingOrdersError
          : useDateRangeApi
            ? isDateRangeError
            : isListError;
  const error = isOrderNumberLookup
    ? orderNumberError
    : usePatientOrdersApi
      ? patientOrdersError
      : useStatusOrdersApi
        ? statusOrdersError
        : useProcessingTypeApi
          ? processingOrdersError
          : useDateRangeApi
            ? dateRangeError
            : listError;
  const isFetching = isOrderNumberLookup
    ? isOrderNumberFetching
    : usePatientOrdersApi
      ? isPatientOrdersFetching
      : useStatusOrdersApi
        ? isStatusOrdersFetching
        : useProcessingTypeApi
          ? isProcessingOrdersFetching
          : useDateRangeApi
            ? isDateRangeFetching
            : isListFetching;
  const refetch = isOrderNumberLookup
    ? refetchOrderByNumber
    : usePatientOrdersApi
      ? refetchPatientOrders
      : useStatusOrdersApi
        ? refetchStatusOrders
        : useProcessingTypeApi
          ? refetchProcessingOrders
          : useDateRangeApi
            ? refetchDateRange
            : refetchList;

  useEffect(() => {
    const msg = (
      isOrderNumberLookup
        ? orderByNumberData?.message
        : usePatientOrdersApi
          ? ordersByPatientData?.message
          : useStatusOrdersApi
            ? ordersByStatusData?.message
            : useProcessingTypeApi
              ? ordersByProcessingData?.message
              : useDateRangeApi
                ? ordersByDateRangeData?.message
                : data?.message
    )?.trim();
    const updatedAt = isOrderNumberLookup
      ? orderNumberDataUpdatedAt
      : usePatientOrdersApi
        ? patientOrdersDataUpdatedAt
        : useStatusOrdersApi
          ? statusOrdersDataUpdatedAt
          : useProcessingTypeApi
            ? processingOrdersDataUpdatedAt
            : useDateRangeApi
              ? dateRangeDataUpdatedAt
              : dataUpdatedAt;
    if (!msg || !updatedAt) return;
    setFlashApiMessage(msg);
    const timer = window.setTimeout(() => setFlashApiMessage(null), 2000);
    return () => window.clearTimeout(timer);
  }, [
    data?.message,
    dataUpdatedAt,
    isOrderNumberLookup,
    orderByNumberData?.message,
    orderNumberDataUpdatedAt,
    usePatientOrdersApi,
    ordersByPatientData?.message,
    patientOrdersDataUpdatedAt,
    useStatusOrdersApi,
    ordersByStatusData?.message,
    statusOrdersDataUpdatedAt,
    useProcessingTypeApi,
    ordersByProcessingData?.message,
    processingOrdersDataUpdatedAt,
    useDateRangeApi,
    ordersByDateRangeData?.message,
    dateRangeDataUpdatedAt,
  ]);

  const page = usePatientOrdersApi
    ? ordersByPatientData?.data
    : useStatusOrdersApi
      ? ordersByStatusData?.data
      : useProcessingTypeApi
        ? ordersByProcessingData?.data
        : useDateRangeApi
          ? ordersByDateRangeData?.data
          : data?.data;
  const orders = useMemo(() => {
    if (isOrderNumberLookup) {
      const order = orderByNumberData?.data;
      return order ? [order] : [];
    }
    if (usePatientOrdersApi) {
      return ordersByPatientData?.data?.content ?? [];
    }
    if (useStatusOrdersApi) {
      return ordersByStatusData?.data?.content ?? [];
    }
    if (useProcessingTypeApi) {
      return ordersByProcessingData?.data?.content ?? [];
    }
    if (useDateRangeApi) {
      return ordersByDateRangeData?.data?.content ?? [];
    }
    return page?.content ?? [];
  }, [
    isOrderNumberLookup,
    orderByNumberData?.data,
    usePatientOrdersApi,
    ordersByPatientData?.data?.content,
    useStatusOrdersApi,
    ordersByStatusData?.data?.content,
    useProcessingTypeApi,
    ordersByProcessingData?.data?.content,
    useDateRangeApi,
    ordersByDateRangeData?.data?.content,
    page?.content,
  ]);
  const patientIds = useMemo(() => orders.map((o) => o.patientId), [orders]);
  const testIds = useMemo(
    () => orders.flatMap((o) => (o.orderItems ?? []).map((item) => item.testId)),
    [orders]
  );
  const { patientsById, isFetching: isFetchingPatients } = usePatientsByIds(patientIds);
  const { testsById, isFetching: isFetchingTests } = useTestsByIds(testIds);

  const invoices = useMemo(
    () =>
      orders.map((order) =>
        mapTestOrderToInvoice(order, patientsById.get(order.patientId), testsById)
      ),
    [orders, patientsById, testsById]
  );

  const filtered = useMemo(() => {
    let rows = invoices;

    if (usePaymentStatusFilter) {
      const target = status.toLowerCase();
      rows = rows.filter((inv) => {
        const payment = inv.paymentStatus?.toLowerCase() ?? '';
        if (target === 'unpaid') {
          return payment !== 'paid' || (inv.dueAmount ?? 0) > 0;
        }
        return payment.includes(target) || payment === target;
      });
    }

    if (
      isOrderNumberLookup ||
      usePatientOrdersApi ||
      useStatusOrdersApi ||
      useProcessingTypeApi ||
      useDateRangeApi
    ) {
      return rows;
    }

    if (searchBy === SEARCH_TYPE_PLACEHOLDER) return rows;

    return rows;
  }, [
    invoices,
    searchBy,
    status,
    isOrderNumberLookup,
    usePatientOrdersApi,
    useStatusOrdersApi,
    useProcessingTypeApi,
    useDateRangeApi,
    usePaymentStatusFilter,
  ]);

  const totalPages = isOrderNumberLookup
    ? 1
    : (page?.totalPages ??
        Math.max(1, Math.ceil((page?.totalElements ?? 0) / PAGE_SIZE)));
  const totalElements = isOrderNumberLookup ? orders.length : (page?.totalElements ?? 0);
  const canPrev = !isOrderNumberLookup && pageNo > 0;
  const canNext =
    !isOrderNumberLookup &&
    (page?.last != null ? !page.last : pageNo + 1 < totalPages);

  const visibleIds = useMemo(() => filtered.map((inv) => inv.id), [filtered]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allPageSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));
  const somePageSelected =
    visibleIds.some((id) => selectedSet.has(id)) && !allPageSelected;

  const handleToggleSelect = (invoiceId: number) => {
    setSelectedIds((prev) =>
      prev.includes(invoiceId) ? prev.filter((id) => id !== invoiceId) : [...prev, invoiceId]
    );
  };

  const handleToggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const handleViewInvoice = (invoice: (typeof invoices)[0]) => {
    const order = orders.find((o) => o.id === invoice.id) ?? null;
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const selectedInvoice = selectedOrder
    ? invoices.find((inv) => inv.id === selectedOrder.id)
    : undefined;

  const handleDeleteInvoice = (invoice: Invoice) => {
    setDeleteMode('single');
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  const handleCancelInvoice = (invoice: Invoice) => {
    const order = orders.find((o) => o.id === invoice.id) ?? null;
    if (!order) {
      toast.error('Could not load order for cancellation.');
      return;
    }
    setOrderToCancel(order);
    setCancelOpen(true);
  };

  const handleViewCancellationDetails = (invoice: Invoice) => {
    const order = orders.find((o) => o.id === invoice.id) ?? null;
    if (!order) {
      toast.error('Could not load order for cancellation details.');
      return;
    }
    setOrderForCancelDetails(order);
    setCancelDetailsOpen(true);
  };

  const handleTrackOrderLifecycle = (invoice: Invoice) => {
    router.push(`/diagnosis/tracking-order?orderId=${encodeURIComponent(String(invoice.id))}`);
  };

  const handleViewPaymentSummary = (invoice: Invoice) => {
    router.push(`/diagnosis/payment-summary?orderId=${encodeURIComponent(String(invoice.id))}`);
  };

  const handleViewTransactions = (invoice: Invoice) => {
    const order = orders.find((o) => o.id === invoice.id) ?? null;
    if (!order) {
      toast.error('Could not load order for payment transactions.');
      return;
    }
    setOrderForTransactions(order);
    setTransactionsOpen(true);
  };

  const handleProcessPayment = (invoice: Invoice) => {
    const order = orders.find((o) => o.id === invoice.id) ?? null;
    if (!order) {
      toast.error('Could not load order for payment.');
      return;
    }
    setOrderToPay(order);
    setPaymentOpen(true);
  };

  const handleRegisterSample = (invoice: Invoice) => {
    if (!invoice.id || invoice.id < 1) {
      toast.error('Invalid order ID for sample registration.');
      return;
    }
    setSampleOrderId(invoice.id);
    setSampleDrawerOpen(true);
  };

  const closeSampleDrawer = () => {
    setSampleDrawerOpen(false);
    setSampleOrderId(null);
  };

  const closeCancelDrawer = () => {
    if (isCancelling) return;
    setCancelOpen(false);
    setOrderToCancel(null);
  };

  const handleConfirmCancel = async (values: CancelOrderFormValues) => {
    if (!orderToCancel?.id) return;
    if (!values.cancellationReason) {
      throw new Error('Cancellation reason is required.');
    }

    const refundRaw = values.refundAmount.trim();
    const refundAmount = refundRaw ? Number(refundRaw) : 0;
    if (!Number.isFinite(refundAmount) || refundAmount < 0) {
      throw new Error('Refund amount must be a valid number (0 or greater).');
    }

    const response = await cancelTestOrderMutation.mutateAsync({
      orderId: orderToCancel.id,
      payload: {
        cancellationReason: values.cancellationReason,
        cancellationNotes: values.cancellationNotes || undefined,
        refundAmount,
      },
    });

    if (response.response === false) {
      throw new Error(response.message || 'Failed to cancel order.');
    }

    toast.success(
      response.message?.trim() ||
        `Order ${orderToCancel.orderNumber} cancelled successfully.`
    );

    if (selectedOrder?.id === orderToCancel.id) {
      setDetailsOpen(false);
      setSelectedOrder(null);
    }
    setCancelOpen(false);
    setOrderToCancel(null);
  };

  const closePaymentDrawer = () => {
    if (isProcessingPayment) return;
    setPaymentOpen(false);
    setOrderToPay(null);
  };

  const handleConfirmPayment = async (values: ProcessPaymentFormValues) => {
    if (!orderToPay?.id) return;

    const amount = Number(values.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const response = await processPaymentMutation.mutateAsync({
      orderId: orderToPay.id,
      amount,
      paymentMode: values.paymentMode,
      remarks: values.remarks || undefined,
    });

    if (response.response === false) {
      throw new Error(response.message || 'Failed to process payment.');
    }

    toast.success(
      response.message?.trim() ||
        `Payment recorded for order ${orderToPay.orderNumber}.`
    );

    setPaymentOpen(false);
    setOrderToPay(null);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setDeleteMode('bulk');
    setInvoiceToDelete(null);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (isDeletePending) return;
    setDeleteDialogOpen(false);
    setInvoiceToDelete(null);
    setDeleteMode('single');
  };

  const confirmDeleteInvoice = async () => {
    try {
      if (deleteMode === 'bulk') {
        if (selectedIds.length === 0) return;

        const response = await bulkDeleteTestOrdersMutation.mutateAsync({
          orderIds: selectedIds,
        });
        if (response.response === false) {
          throw new Error(response.message || 'Bulk deletion failed');
        }
        toast.success(
          response.message?.trim() ||
            `${selectedIds.length} booking${selectedIds.length === 1 ? '' : 's'} deleted successfully`
        );
        if (selectedOrder && selectedIds.includes(selectedOrder.id)) {
          setDetailsOpen(false);
          setSelectedOrder(null);
        }
        setSelectedIds([]);
      } else {
        if (!invoiceToDelete) return;

        const response = await deleteTestOrderMutation.mutateAsync(invoiceToDelete.id);
        if (response.response === false) {
          throw new Error(response.message || 'Deletion failed');
        }
        toast.success(response.message?.trim() || 'Booking deleted successfully');
        if (selectedOrder?.id === invoiceToDelete.id) {
          setDetailsOpen(false);
          setSelectedOrder(null);
        }
        setSelectedIds((prev) => prev.filter((id) => id !== invoiceToDelete.id));
      }

      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
      setDeleteMode('single');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : deleteMode === 'bulk'
            ? 'Failed to delete selected bookings. Please try again.'
            : 'Failed to delete booking. Please try again.';
      toast.error(message);
      console.error('Error deleting test order(s):', err);
    }
  };

  const deleteDialogTitle =
    deleteMode === 'bulk' ? 'Delete selected bookings' : 'Delete booking';

  const deleteDialogDescription =
    deleteMode === 'bulk'
      ? `Are you sure you want to permanently delete ${selectedIds.length} selected booking${
          selectedIds.length === 1 ? '' : 's'
        }? This action cannot be undone.`
      : invoiceToDelete
        ? `Are you sure you want to permanently delete invoice ${invoiceToDelete.invoiceBarcode}${
            invoiceToDelete.patientName && invoiceToDelete.patientName !== '—'
              ? ` for ${invoiceToDelete.patientName}`
              : ''
          }? This action cannot be undone.`
        : 'Are you sure you want to permanently delete this booking? This action cannot be undone.';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Diagnosis & Billing — <span className="text-[#FF671F]">List of Invoices</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            View and manage diagnostic test orders, billing status, and payment details from the booking service.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/diagnosis/diagnostic-booking">
            <Button type="button" variant="gradient" size="sm" className="gap-2 shadow-sm px-8">
              <Plus size={16} aria-hidden />
              New booking
            </Button>
          </Link>
        </div>
      </div>

      <InvoiceFilters
        search={search}
        onSearchChange={setSearch}
        searchBy={searchBy}
        onSearchByChange={setSearchBy}
        status={status}
        onStatusChange={setStatus}
        processingType={processingType}
        onProcessingTypeChange={setProcessingType}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        dateRangeInvalid={dateRangeInvalid}
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        isLoading={isLoading}
        flashApiMessage={flashApiMessage}
      />

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/80 px-4 py-3">
          <p className="text-sm font-semibold text-rose-900">
            {selectedIds.length} booking{selectedIds.length === 1 ? '' : 's'} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200 bg-white"
              disabled={isDeletePending}
              onClick={() => setSelectedIds([])}
            >
              Clear selection
            </Button>
            <Button
              type="button"
              size="sm"
              className="font-bold gap-2 bg-rose-600 hover:bg-rose-700 text-white"
              disabled={isDeletePending}
              onClick={handleBulkDeleteClick}
            >
              <Trash2 size={14} aria-hidden />
              Delete selected
            </Button>
          </div>
        </div>
      ) : null}

      <InvoiceTable
        invoices={filtered}
        isLoading={isLoading || isFetchingPatients || isFetchingTests}
        isError={isError}
        errorMessage={error?.message}
        onRetry={() => refetch()}
        hasLoadedRows={
          isOrderNumberLookup ||
          usePatientOrdersApi ||
          useStatusOrdersApi ||
          useProcessingTypeApi ||
          useDateRangeApi ||
          patientNameSearchInvalid ||
          (isPatientNameSearch && !debouncedPatientSearch) ||
          dateRangeInvalid
            ? true
            : orders.length > 0
        }
        searchActive={
          Boolean(search.trim()) ||
          isPatientNameSearch ||
          status !== 'Order Status' ||
          processingType !== DEFAULT_PROCESSING_TYPE_FILTER ||
          patientNameSearchInvalid ||
          useDateRangeApi
        }
        emptyMessage={
          dateRangeInvalid
            ? 'Start date must be on or before end date.'
            : patientNameSearchInvalid
              ? 'Enter at least 2 characters of the patient name.'
              : isPatientNameSearch && !debouncedPatientSearch
                ? 'Enter a patient name to search bookings.'
                : isPatientNameSearch && usePatientOrdersApi && orders.length === 0
                  ? `No bookings found for "${patientOrdersLookup}".`
                  : useProcessingTypeApi && orders.length === 0
                    ? `No bookings found for processing type "${processingType}".`
                    : undefined
        }
        onViewInvoice={handleViewInvoice}
        onDeleteInvoice={handleDeleteInvoice}
        onCancelInvoice={handleCancelInvoice}
        onViewCancellationDetails={handleViewCancellationDetails}
        onTrackOrderLifecycle={handleTrackOrderLifecycle}
        onViewPaymentSummary={handleViewPaymentSummary}
        onViewTransactions={handleViewTransactions}
        onProcessPayment={handleProcessPayment}
        onRegisterSample={handleRegisterSample}
        isDeleting={isDeletePending}
        isProcessingPayment={isProcessingPayment}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        allPageSelected={allPageSelected}
        somePageSelected={somePageSelected}
        pagination={{
          pageNo,
          totalPages,
          totalElements,
          canPrev,
          canNext,
          isFetching,
          onPrev: () => setPageNo((p) => Math.max(0, p - 1)),
          onNext: () => setPageNo((p) => p + 1),
        }}
      />

      <BookingDetails
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        patientName={selectedInvoice?.patientName}
        patientCode={selectedInvoice?.patientCode}
      />

      <CancelOrder
        isOpen={cancelOpen}
        onClose={closeCancelDrawer}
        order={orderToCancel}
        isSubmitting={isCancelling}
        onSubmit={handleConfirmCancel}
      />

      <ProcessPayment
        isOpen={paymentOpen}
        onClose={closePaymentDrawer}
        order={orderToPay}
        isSubmitting={isProcessingPayment}
        onSubmit={handleConfirmPayment}
      />

      <TransactionDetails
        isOpen={transactionsOpen}
        onClose={() => {
          setTransactionsOpen(false);
          setOrderForTransactions(null);
        }}
        order={orderForTransactions}
      />

      <CancelDetails
        isOpen={cancelDetailsOpen}
        onClose={() => {
          setCancelDetailsOpen(false);
          setOrderForCancelDetails(null);
        }}
        order={orderForCancelDetails}
      />

      <AddNewReceipt
        isOpen={sampleDrawerOpen}
        onClose={closeSampleDrawer}
        initialOrderId={sampleOrderId}
        onRegistered={() => refetch()}
      />

      <DeleteAlertDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteInvoice}
        isLoading={isDeletePending}
        title={deleteDialogTitle}
        description={deleteDialogDescription}
      />
    </div>
  );
}