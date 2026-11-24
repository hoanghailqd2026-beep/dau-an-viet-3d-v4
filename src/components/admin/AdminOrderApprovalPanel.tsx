import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useAuth, PRIMARY_ADMIN_EMAIL } from '../../contexts/AuthContext';
import {
  approvePaymentOrderByAdmin,
  batchApprovePaymentOrdersByAdmin,
  fetchAllPaymentOrdersRest,
  formatVnd,
  isOrderPurgeable,
  purgeRejectedAndExpiredOrdersByAdmin,
  rejectPaymentOrderByAdmin,
  subscribeToAllPaymentOrders,
  type PaymentOrderStatus,
  type RealtimePaymentOrder,
} from '../../utils/paymentOrdersRtdb';

interface AdminOrderApprovalPanelProps {
  showToast: (msg: string) => void;
}

type OrderFilterTab = 'waiting_approval' | 'pending' | 'paid' | 'rejected' | 'all';

const QUICK_REJECTION_REASONS = [
  'Chưa nhận được tiền chuyển khoản khớp mã đơn.',
  'Chuyển thiếu số tiền hoặc sai nội dung chuyển khoản.',
  'Ảnh biên lai mờ hoặc không khớp giao dịch thực tế.',
];

function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function getStatusBadge(status: PaymentOrderStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'waiting_approval':
      return {
        label: 'Chờ duyệt (Khách đã chuyển)',
        className: 'bg-[#C9A46A]/20 text-[#E5C98E] border border-[#C9A46A]/50',
      };
    case 'pending':
      return {
        label: 'Mới tạo mã QR',
        className: 'bg-[#526D8B]/20 text-[#9FC0E3] border border-[#526D8B]/45',
      };
    case 'paid':
      return {
        label: 'Đã duyệt & Mở khóa',
        className: 'bg-[#47796D]/25 text-[#8DD4C2] border border-[#47796D]/60',
      };
    case 'rejected':
      return {
        label: 'Đã từ chối',
        className: 'bg-[#A94F3D]/25 text-[#F0A495] border border-[#A94F3D]/55',
      };
  }
}

export const AdminOrderApprovalPanel: React.FC<AdminOrderApprovalPanelProps> = ({ showToast }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<RealtimePaymentOrder[]>([]);
  const [filterTab, setFilterTab] = useState<OrderFilterTab>('waiting_approval');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Per-order loading & reject UI states
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionInput, setRejectionInput] = useState<string>(QUICK_REJECTION_REASONS[0]);
  const [isPurgingCleanup, setIsPurgingCleanup] = useState<boolean>(false);
  const [confirmPurgeOpen, setConfirmPurgeOpen] = useState<boolean>(false);

  // Batch multi-select states
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(() => new Set());
  const [isBatchApproving, setIsBatchApproving] = useState<boolean>(false);

  // Lightbox preview for receipt screenshot
  const [lightboxOrder, setLightboxOrder] = useState<RealtimePaymentOrder | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllPaymentOrders((list) => {
      setOrders(list);
      const moderatableIds = new Set(
        list
          .filter((o) => o.status === 'waiting_approval' || o.status === 'pending')
          .map((o) => o.orderId)
      );
      setSelectedOrderIds((prev) => {
        if (prev.size === 0) return prev;
        const next = new Set<string>();
        prev.forEach((id) => {
          if (moderatableIds.has(id)) next.add(id);
        });
        return next.size === prev.size ? prev : next;
      });
    });
    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    let waitingApproval = 0;
    let pendingQr = 0;
    let paid = 0;
    let rejected = 0;
    let revenueVnd = 0;
    for (const o of orders) {
      if (o.status === 'waiting_approval') {
        waitingApproval += 1;
      } else if (o.status === 'pending') {
        pendingQr += 1;
      } else if (o.status === 'paid') {
        paid += 1;
        revenueVnd += o.amount || 0;
      } else if (o.status === 'rejected') {
        rejected += 1;
      }
    }
    return {
      waitingApproval,
      pendingQr,
      paid,
      rejected,
      total: orders.length,
      revenueVnd,
    };
  }, [orders]);

  const purgeableCount = useMemo(
    () => orders.filter((o) => isOrderPurgeable(o, 24)).length,
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      if (filterTab === 'waiting_approval' && o.status !== 'waiting_approval') return false;
      if (filterTab === 'pending' && o.status !== 'pending') return false;
      if (filterTab === 'paid' && o.status !== 'paid') return false;
      if (filterTab === 'rejected' && o.status !== 'rejected') return false;
      if (!q) return true;
      return (
        o.orderId.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.displayName.toLowerCase().includes(q) ||
        o.packageName.toLowerCase().includes(q) ||
        (o.ticketCode || '').toLowerCase().includes(q)
      );
    });
  }, [orders, filterTab, searchQuery]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await fetchAllPaymentOrdersRest();
      setOrders(fresh);
      showToast(`Đã đồng bộ ${fresh.length} đơn hàng từ Cloud Firestore & bộ nhớ cục bộ.`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApprove = async (order: RealtimePaymentOrder) => {
    setBusyOrderId(order.orderId);
    try {
      const adminEmail = user?.email || PRIMARY_ADMIN_EMAIL;
      const res = await approvePaymentOrderByAdmin(order, adminEmail);
      const emailNote = res.emailResult.ok
        ? ' Đã tự động gửi vé điện tử qua EmailJS.'
        : ' Đã mở khóa vé trực tiếp trên tài khoản khách.';
      showToast(
        `Đã duyệt đơn ${order.orderId} (${formatVnd(order.amount)}) · Mã vé ${res.order.ticketCode}.${emailNote}`
      );
      if (rejectingOrderId === order.orderId) {
        setRejectingOrderId(null);
      }
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleConfirmReject = async (order: RealtimePaymentOrder) => {
    setBusyOrderId(order.orderId);
    try {
      const adminEmail = user?.email || PRIMARY_ADMIN_EMAIL;
      await rejectPaymentOrderByAdmin(order, rejectionInput, adminEmail);
      showToast(`Đã từ chối đơn ${order.orderId} và gửi lý do phản hồi tới khách hàng.`);
      setRejectingOrderId(null);
    } finally {
      setBusyOrderId(null);
    }
  };

  const moderatableFilteredOrders = useMemo(
    () =>
      filteredOrders.filter(
        (o) => o.status === 'waiting_approval' || o.status === 'pending'
      ),
    [filteredOrders]
  );

  const selectedVisibleOrders = useMemo(
    () => moderatableFilteredOrders.filter((o) => selectedOrderIds.has(o.orderId)),
    [moderatableFilteredOrders, selectedOrderIds]
  );

  const allVisibleModeratableSelected =
    moderatableFilteredOrders.length > 0 &&
    selectedVisibleOrders.length === moderatableFilteredOrders.length;

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleToggleSelectAllVisible = () => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (allVisibleModeratableSelected) {
        moderatableFilteredOrders.forEach((o) => next.delete(o.orderId));
      } else {
        moderatableFilteredOrders.forEach((o) => next.add(o.orderId));
      }
      return next;
    });
  };

  const handleBatchApproveSelected = async () => {
    if (isBatchApproving || selectedVisibleOrders.length === 0) return;
    setIsBatchApproving(true);
    try {
      const adminEmail = user?.email || PRIMARY_ADMIN_EMAIL;
      const res = await batchApprovePaymentOrdersByAdmin(selectedVisibleOrders, adminEmail);
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        res.approvedOrders.forEach((o) => next.delete(o.orderId));
        return next;
      });
      setRejectingOrderId(null);
      showToast(
        `Đã duyệt hàng loạt ${res.approvedCount}/${res.total} đơn (đồng bộ ${res.syncedFirebaseCount} đơn lên Firestore · gửi ${res.emailSentCount} email xác nhận).`
      );
    } finally {
      setIsBatchApproving(false);
    }
  };

  const handlePurgeCleanup = async () => {
    if (isPurgingCleanup) return;
    setIsPurgingCleanup(true);
    try {
      const res = await purgeRejectedAndExpiredOrdersByAdmin(24);
      setOrders(res.remainingOrders);
      setConfirmPurgeOpen(false);
      if (res.deletedCount === 0) {
        showToast('Không có đơn từ chối hoặc quá hạn (>24h) nào cần dọn dẹp.');
      } else {
        showToast(
          `Đã dọn dẹp ${res.deletedCount} đơn từ chối / quá hạn (đã xóa ${res.syncedFirebaseCount} đơn trên Cloud Firestore).`
        );
      }
    } finally {
      setIsPurgingCleanup(false);
    }
  };

  return (
    <div className="space-y-5 text-[#D8C9A9]">
      {/* Header & Refresh */}
      <div className="rounded-xl bg-[#1B1C1B] border border-[#D8C9A9]/15 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#C9A46A]">
            <ShieldCheck className="w-4 h-4" />
            <span>Đối soát VietQR Napas 247 · Cloud Firestore</span>
          </div>
          <h3 className="font-serif text-xl font-semibold text-[#F4EFE4] mt-1">
            Duyệt đơn thanh toán &amp; Mở khóa vé tức thì
          </h3>
          <p className="text-xs text-[#D8C9A9]/70 mt-1">
            Đọc đồng thời từ Cloud Firestore (<code className="text-[#C9A46A]">payment_orders</code>)
            và bộ nhớ cục bộ. Khi bấm Duyệt, khách hàng lập tức nhận thông báo mở khóa vé và mã QR
            trên màn hình.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {confirmPurgeOpen ? (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#A94F3D]/15 border border-[#A94F3D]/45 px-2.5 py-1.5">
              <span className="text-[11px] font-medium text-[#F4B6AA]">
                Xóa {purgeableCount} đơn?
              </span>
              <button
                type="button"
                onClick={() => void handlePurgeCleanup()}
                disabled={isPurgingCleanup}
                className="px-2.5 py-1 rounded bg-[#A94F3D] hover:bg-[#8E3F30] disabled:opacity-60 text-white text-[11px] font-semibold cursor-pointer"
              >
                {isPurgingCleanup ? 'Đang xóa...' : 'Xác nhận'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmPurgeOpen(false)}
                disabled={isPurgingCleanup}
                className="px-2 py-1 rounded bg-[#252725] hover:bg-[#303330] text-[#D8C9A9] text-[11px] font-medium cursor-pointer"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (purgeableCount === 0) {
                  showToast('Hiện không có đơn từ chối hoặc đơn chờ quá hạn (>24h) để xóa.');
                  return;
                }
                setConfirmPurgeOpen(true);
              }}
              disabled={isPurgingCleanup}
              className="px-3.5 py-2 rounded-lg bg-[#A94F3D]/20 hover:bg-[#A94F3D]/35 border border-[#A94F3D]/45 text-xs font-semibold text-[#F4B6AA] inline-flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                Xóa các đơn từ chối / quá hạn
                {purgeableCount > 0 ? ` (${purgeableCount})` : ''}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-lg bg-[#252725] hover:bg-[#303330] border border-[#D8C9A9]/20 text-xs font-semibold text-[#F4EFE4] inline-flex items-center gap-2 cursor-pointer shrink-0 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C9A46A] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Đồng bộ ngay</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl bg-[#1B1C1B] border border-[#C9A46A]/45 p-3.5">
          <div className="text-[11px] text-[#D8C9A9]/70">Chờ duyệt (Đã chuyển)</div>
          <div className="font-serif text-2xl font-bold text-[#E5C98E] tabular-nums mt-1">
            {stats.waitingApproval}
          </div>
        </div>
        <div className="rounded-xl bg-[#1B1C1B] border border-[#526D8B]/40 p-3.5">
          <div className="text-[11px] text-[#D8C9A9]/70">Chờ chuyển khoản (QR)</div>
          <div className="font-serif text-2xl font-bold text-[#9FC0E3] tabular-nums mt-1">
            {stats.pendingQr}
          </div>
        </div>
        <div className="rounded-xl bg-[#1B1C1B] border border-[#47796D]/40 p-3.5">
          <div className="text-[11px] text-[#D8C9A9]/70">Đã duyệt &amp; Mở khóa</div>
          <div className="font-serif text-2xl font-bold text-[#8DD4C2] tabular-nums mt-1">
            {stats.paid}
          </div>
        </div>
        <div className="rounded-xl bg-[#1B1C1B] border border-[#A94F3D]/35 p-3.5">
          <div className="text-[11px] text-[#D8C9A9]/70">Đơn đã từ chối</div>
          <div className="font-serif text-2xl font-bold text-[#F0A495] tabular-nums mt-1">
            {stats.rejected}
          </div>
        </div>
        <div className="rounded-xl bg-[#1B1C1B] border border-[#D8C9A9]/15 p-3.5 col-span-2 lg:col-span-1">
          <div className="text-[11px] text-[#D8C9A9]/70">Doanh thu đã đối soát</div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-[#F4EFE4] tabular-nums mt-1">
            {formatVnd(stats.revenueVnd)}
          </div>
        </div>
      </div>

      {/* Filter Tabs + Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'waiting_approval', label: `Chờ duyệt (${stats.waitingApproval})` },
              { id: 'pending', label: `Chờ chuyển khoản (${stats.pendingQr})` },
              { id: 'paid', label: `Đã duyệt (${stats.paid})` },
              { id: 'rejected', label: `Từ chối (${stats.rejected})` },
              { id: 'all', label: `Tất cả (${stats.total})` },
            ] as Array<{ id: OrderFilterTab; label: string }>
          ).map((tab) => {
            const active = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#C9A46A] text-[#171817]'
                    : 'bg-[#1B1C1B] text-[#D8C9A9]/80 border border-[#D8C9A9]/15 hover:border-[#C9A46A]/45'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#D8C9A9]/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã đơn TGDS-, Gmail, tên..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#141514] border border-[#D8C9A9]/20 text-xs text-[#F4EFE4] placeholder:text-[#D8C9A9]/45 focus:outline-none focus:border-[#C9A46A]"
          />
        </div>
      </div>

      {/* Batch Selection & Approval Bar */}
      {moderatableFilteredOrders.length > 0 && (
        <div className="rounded-xl bg-[#1B1C1B] border border-[#C9A46A]/35 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2.5 text-xs font-semibold text-[#F4EFE4] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allVisibleModeratableSelected}
              onChange={handleToggleSelectAllVisible}
              disabled={isBatchApproving}
              className="w-4 h-4 accent-[#C9A46A] rounded cursor-pointer"
            />
            <span>
              Chọn tất cả ({moderatableFilteredOrders.length} đơn chờ duyệt)
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] text-[#D8C9A9]/75 tabular-nums">
              Đã chọn: <strong className="text-[#C9A46A]">{selectedVisibleOrders.length}</strong> đơn
            </span>
            <button
              type="button"
              onClick={() => void handleBatchApproveSelected()}
              disabled={selectedVisibleOrders.length === 0 || isBatchApproving || Boolean(busyOrderId)}
              className="px-4 py-2 rounded-lg bg-[#47796D] hover:bg-[#3A665B] disabled:opacity-45 disabled:cursor-not-allowed text-[#FFFDF9] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isBatchApproving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>
                Duyệt hàng loạt
                {selectedVisibleOrders.length > 0 ? ` (${selectedVisibleOrders.length})` : ''}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-xl bg-[#1B1C1B] border border-[#D8C9A9]/15 p-10 text-center space-y-2">
          <Clock className="w-8 h-8 text-[#D8C9A9]/35 mx-auto" />
          <div className="text-sm font-medium text-[#F4EFE4]">
            Không có đơn thanh toán nào trong mục này
          </div>
          <p className="text-xs text-[#D8C9A9]/60">
            Khi người dùng tạo mã QR hoặc bấm xác nhận chuyển khoản, đơn hàng sẽ xuất hiện tại đây
            theo thời gian thực.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const isBusy = busyOrderId === order.orderId || isBatchApproving;
            const isRejectOpen = rejectingOrderId === order.orderId;
            const canModerate = order.status === 'waiting_approval' || order.status === 'pending';
            const isSelected = selectedOrderIds.has(order.orderId);

            return (
              <div
                key={order.orderId}
                className={`rounded-xl bg-[#1B1C1B] border p-4 space-y-3.5 transition-colors ${
                  isSelected ? 'border-[#C9A46A]' : 'border-[#D8C9A9]/18'
                }`}
              >
                {/* Row 1: Order ID + Status + Time + Amount */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#D8C9A9]/12 pb-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {canModerate && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(order.orderId)}
                          disabled={isBatchApproving}
                          aria-label={`Chọn đơn ${order.orderId}`}
                          className="w-4 h-4 accent-[#C9A46A] rounded cursor-pointer shrink-0"
                        />
                      )}
                      <span className="font-mono text-sm font-bold text-[#F4EFE4] tracking-wider">
                        {order.orderId}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      {order.emailSent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#47796D]/20 text-[#8DD4C2] text-[10px] font-medium">
                          <Mail className="w-3 h-3" />
                          <span>Đã gửi Email</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#D8C9A9]/65">
                      Tạo lúc: {formatDateTime(order.createdAt)}
                      {order.submittedAt && ` · Báo chuyển: ${formatDateTime(order.submittedAt)}`}
                      {order.approvedAt && ` · Duyệt lúc: ${formatDateTime(order.approvedAt)}`}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-serif text-xl font-bold text-[#C9A46A] tabular-nums">
                      {formatVnd(order.amount)}
                    </div>
                    <div className="text-[11px] text-[#D8C9A9]/70">
                      {order.quantity} vé · Nội dung:{' '}
                      <strong className="font-mono text-[#F4EFE4]">{order.transferContent}</strong>
                    </div>
                  </div>
                </div>

                {/* Row 2: Buyer Info + Package + Receipt Thumbnail */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 text-xs">
                    <div className="space-y-0.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#D8C9A9]/55">
                        Khách hàng (Gmail)
                      </div>
                      <div className="font-semibold text-[#F4EFE4]">{order.displayName}</div>
                      <div className="text-[#C9A46A] break-all">{order.email}</div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-[10px] uppercase tracking-wider text-[#D8C9A9]/55">
                        Gói đăng ký
                      </div>
                      <div className="font-semibold text-[#F4EFE4]">{order.packageName}</div>
                      {order.scopeLabel && order.scopeLabel !== order.packageName && (
                        <div className="text-[#D8C9A9]/75">{order.scopeLabel}</div>
                      )}
                      {order.ticketCode && (
                        <div className="inline-flex items-center gap-1 text-[11px] text-[#8DD4C2] font-mono pt-0.5">
                          <Ticket className="w-3 h-3" />
                          <span>Mã vé: {order.ticketCode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Receipt Screenshot Thumbnail */}
                  <div className="shrink-0">
                    {order.receiptImage ? (
                      <button
                        type="button"
                        onClick={() => setLightboxOrder(order)}
                        className="group relative flex items-center gap-2.5 p-2 rounded-lg bg-[#141514] border border-[#C9A46A]/40 hover:border-[#C9A46A] transition-colors cursor-pointer"
                      >
                        <img
                          src={order.receiptImage}
                          alt={`Biên lai ${order.orderId}`}
                          className="w-14 h-14 rounded object-cover bg-white"
                        />
                        <div className="text-left pr-1">
                          <div className="text-[11px] font-semibold text-[#F4EFE4] inline-flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-[#C9A46A]" />
                            <span>Xem biên lai</span>
                          </div>
                          <div className="text-[10px] text-[#D8C9A9]/65">Bấm phóng to</div>
                        </div>
                      </button>
                    ) : (
                      <div className="px-3 py-2 rounded-lg bg-[#141514] border border-[#D8C9A9]/12 text-[11px] text-[#D8C9A9]/50">
                        Không đính kèm ảnh biên lai
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection reason if rejected */}
                {order.status === 'rejected' && order.rejectionReason && (
                  <div className="rounded-lg bg-[#A94F3D]/15 border border-[#A94F3D]/35 px-3 py-2 text-xs text-[#F0A495]">
                    <strong>Lý do từ chối:</strong> {order.rejectionReason}
                  </div>
                )}

                {/* Action Buttons for pending/waiting orders */}
                {canModerate && (
                  <div className="pt-2 border-t border-[#D8C9A9]/12 space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleApprove(order)}
                        disabled={isBusy}
                        className="px-4 py-2 rounded-lg bg-[#47796D] hover:bg-[#3A665B] disabled:opacity-60 text-[#FFFDF9] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isBusy ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Duyệt &amp; Mở khóa vé</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isRejectOpen) {
                            setRejectingOrderId(null);
                          } else {
                            setRejectingOrderId(order.orderId);
                            setRejectionInput(QUICK_REJECTION_REASONS[0]);
                          }
                        }}
                        disabled={isBusy}
                        className="px-4 py-2 rounded-lg bg-[#A94F3D]/20 hover:bg-[#A94F3D]/35 border border-[#A94F3D]/50 text-[#F4B6AA] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Từ chối đơn</span>
                      </button>
                    </div>

                    {isRejectOpen && (
                      <div className="rounded-lg bg-[#141514] border border-[#A94F3D]/45 p-3 space-y-2.5">
                        <div className="text-[11px] font-semibold text-[#F0A495]">
                          Chọn hoặc nhập lý do từ chối đơn {order.orderId}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_REJECTION_REASONS.map((reason) => (
                            <button
                              key={reason}
                              type="button"
                              onClick={() => setRejectionInput(reason)}
                              className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                                rejectionInput === reason
                                  ? 'bg-[#A94F3D] text-white'
                                  : 'bg-[#1F211F] text-[#D8C9A9]/80 hover:text-white border border-[#D8C9A9]/15'
                              }`}
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={rejectionInput}
                            onChange={(e) => setRejectionInput(e.target.value)}
                            placeholder="Nhập lý do gửi cho người mua..."
                            className="flex-1 px-3 py-2 rounded-lg bg-[#1B1C1B] border border-[#D8C9A9]/20 text-xs text-[#F4EFE4] focus:outline-none focus:border-[#A94F3D]"
                          />
                          <button
                            type="button"
                            onClick={() => handleConfirmReject(order)}
                            disabled={isBusy}
                            className="px-4 py-2 rounded-lg bg-[#A94F3D] hover:bg-[#8E3F30] text-white text-xs font-semibold cursor-pointer shrink-0"
                          >
                            Xác nhận từ chối
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Zoom Modal for Receipt Screenshot */}
      {lightboxOrder && lightboxOrder.receiptImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxOrder(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl bg-[#1B1C1B] border border-[#C9A46A]/45 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-[#D8C9A9]/15 flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-mono font-bold text-[#C9A46A]">{lightboxOrder.orderId}</span>
                <span className="text-[#D8C9A9]/75 ml-2">
                  {lightboxOrder.displayName} · {formatVnd(lightboxOrder.amount)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOrder(null)}
                aria-label="Đóng xem ảnh biên lai"
                className="w-8 h-8 rounded-full bg-[#2A2C2A] hover:bg-[#3A3D3A] text-[#F4EFE4] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#101110] flex items-center justify-center max-h-[75vh] overflow-auto">
              <img
                src={lightboxOrder.receiptImage}
                alt={`Ảnh biên lai ${lightboxOrder.orderId}`}
                className="max-w-full max-h-[68vh] object-contain rounded-lg border border-[#D8C9A9]/20"
              />
            </div>

            {(lightboxOrder.status === 'waiting_approval' || lightboxOrder.status === 'pending') && (
              <div className="px-4 py-3 border-t border-[#D8C9A9]/15 flex items-center justify-end gap-2 bg-[#1B1C1B]">
                <button
                  type="button"
                  onClick={() => {
                    const target = lightboxOrder;
                    setLightboxOrder(null);
                    void handleApprove(target);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#47796D] hover:bg-[#3A665B] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Duyệt &amp; Mở khóa vé ngay</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
