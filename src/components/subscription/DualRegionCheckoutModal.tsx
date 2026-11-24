import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ImagePlus,
  Loader2,
  Minus,
  Plus,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Ticket,
  Trash2,
  X,
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { TOUR_ROUTES } from '../../data/tours';
import { DEFAULT_HERITAGE_SITES } from '../../data/heritageSites';
import {
  OPEN_PLAN_CHECKOUT_EVENT,
  PlanCheckoutRequest,
  PaymentOrderRecord,
  consumePendingCheckoutRequest,
} from '../../utils/subscriptionGatingStore';
import {
  PAYMENT_PACKAGES,
  PAYMENT_PACKAGE_LIST,
  VIETQR_RECIPIENT,
  applyApprovedOrderToCurrentUser,
  buildLocalPendingPaymentOrder,
  buildLocalWaitingPaymentOrder,
  cancelUserUnfinishedOrder,
  compressReceiptImageToBase64,
  fetchUserTicketsFromCloud,
  findActiveUnfinishedOrderForUser,
  formatVnd,
  formatVndCompact,
  getActiveWatchingOrderId,
  getMaxQuantityForPackage,
  getOrderCreationGuardStatus,
  isPaidOrderAlreadyApplied,
  mapPlanTierToPackageId,
  markOrderPopupNotified,
  setActiveWatchingOrderId,
  shouldShowOrderUnlockPopup,
  subscribeToPaymentOrder,
  subscribeToUserPaymentOrders,
  syncPendingPaymentOrderToCloud,
  syncWaitingPaymentOrderToCloud,
  type PaymentPackageId,
  type RealtimePaymentOrder,
} from '../../utils/paymentOrdersRtdb';

interface DualRegionCheckoutModalProps {
  externalRequest?: PlanCheckoutRequest | null;
  onCloseExternal?: () => void;
  onPurchaseSuccess?: (order: PaymentOrderRecord) => void;
}

const GoogleMarkSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3.01h3.87c2.26-2.08 3.56-5.15 3.56-8.66z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.29A12 12 0 0 0 0 12c0 1.94.46 3.77 1.29 5.38l4-3.1z"
    />
    <path
      fill="#EA4335"
      d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77z"
    />
  </svg>
);

export const DualRegionCheckoutModal: React.FC<DualRegionCheckoutModalProps> = ({
  externalRequest,
  onCloseExternal,
  onPurchaseSuccess,
}) => {
  const { lang } = useI18n();
  const {
    user,
    openAuthModal,
    signInWithFirebaseGoogleAccount,
    signInWithFirebaseFacebookAccount,
    refreshEntitlements,
  } = useAuth();

  // Modal visibility & package selection state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<PaymentPackageId>('self_guided_59k');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(TOUR_ROUTES[0]?.id || 'TOUR-01');
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>(undefined);
  const [schoolName, setSchoolName] = useState<string>('');
  const [schoolProvince, setSchoolProvince] = useState<string>('TP. Hồ Chí Minh');

  // Active Firebase payment order & step state (strictly isolated per uid)
  const [activeOrder, setActiveOrder] = useState<RealtimePaymentOrder | null>(null);
  const [watchingOrderId, setWatchingOrderId] = useState<string | null>(null);
  const [editingRejectedOrder, setEditingRejectedOrder] = useState(false);

  // Auth, loading, receipt & feedback states
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [isSigningInFacebook, setIsSigningInFacebook] = useState(false);
  const [authInlineError, setAuthInlineError] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [blockingUnfinishedOrder, setBlockingUnfinishedOrder] =
    useState<RealtimePaymentOrder | null>(null);
  const [orderSpamError, setOrderSpamError] = useState<string | null>(null);
  const [orderCooldownSec, setOrderCooldownSec] = useState<number>(0);
  const [isCancellingOldOrder, setIsCancellingOldOrder] = useState<boolean>(false);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [receiptSizeKb, setReceiptSizeKb] = useState<number>(0);
  const [isCompressingReceipt, setIsCompressingReceipt] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'memo' | 'amount' | 'ticket' | null>(null);
  const [qrImgSrc, setQrImgSrc] = useState<string>(VIETQR_RECIPIENT.qrPublicPath);
  const [qrImageFailed, setQrImageFailed] = useState<boolean>(false);
  const [ticketQrDataUrl, setTicketQrDataUrl] = useState<string>('');

  const receiptInputRef = useRef<HTMLInputElement | null>(null);
  const googleBoxRef = useRef<HTMLDivElement | null>(null);
  const prevAuthScopeRef = useRef<string>('__init__');
  const isConfirmingTransferRef = useRef<boolean>(false);

  // Strict real Firebase Auth check (Google or Facebook): quick-demo Judge mode cannot generate real payment orders
  const isRealGoogleUser = Boolean(
    user && user.authMethod !== 'judge_quick_access' && (user.firebaseUid || user.userId)
  );
  const currentRealUid =
    isRealGoogleUser && user ? user.firebaseUid || user.userId || null : null;

  const activePackage = PAYMENT_PACKAGES[selectedPackageId];
  const maxQuantityForSelectedPkg = getMaxQuantityForPackage(selectedPackageId);
  const totalAmount = activePackage.unitPrice * quantity;

  const selectedRouteLabel = useMemo(() => {
    const found = TOUR_ROUTES.find((r) => r.id === selectedRouteId);
    return found ? found.title : 'Tuyến Di sản 01';
  }, [selectedRouteId]);

  const selectedSiteLabel = useMemo(() => {
    if (!selectedSiteId) return '';
    const found = DEFAULT_HERITAGE_SITES.find((s) => s.id === selectedSiteId);
    return found ? found.officialName : '';
  }, [selectedSiteId]);

  const applyRequestToSheet = useCallback((req: PlanCheckoutRequest) => {
    const nextPkg = req.packageId || mapPlanTierToPackageId(req.planTier);
    const maxQty = getMaxQuantityForPackage(nextPkg);
    setSelectedPackageId(nextPkg);
    setQuantity(Math.max(1, Math.min(maxQty, req.quantity || 1)));
    if (req.routeId) setSelectedRouteId(req.routeId);
    setSelectedSiteId(req.siteId);
    if (req.schoolName) setSchoolName(req.schoolName);
    if (req.schoolProvince) setSchoolProvince(req.schoolProvince);
    setEditingRejectedOrder(false);
    setAuthInlineError(null);
    setOrderSpamError(null);
    setReceiptError(null);
    setQrImgSrc(VIETQR_RECIPIENT.qrPublicPath);
    setQrImageFailed(false);
    // Keep only an order that is already waiting for Admin approval; otherwise allow fresh package selection
    setActiveOrder((prev) => (prev && prev.status === 'waiting_approval' ? prev : null));
    setIsOpen(true);
  }, []);

  // Listen for global OPEN_PLAN_CHECKOUT_EVENT
  useEffect(() => {
    const onOpenCheckout = (e: Event) => {
      const detail = (e as CustomEvent<PlanCheckoutRequest>).detail;
      if (detail) {
        applyRequestToSheet(detail);
      }
    };
    window.addEventListener(OPEN_PLAN_CHECKOUT_EVENT, onOpenCheckout);
    return () => window.removeEventListener(OPEN_PLAN_CHECKOUT_EVENT, onOpenCheckout);
  }, [applyRequestToSheet]);

  // Sync externalRequest prop if provided
  useEffect(() => {
    if (externalRequest) {
      applyRequestToSheet(externalRequest);
    }
  }, [externalRequest, applyRequestToSheet]);

  // If a pending checkout was queued prior to auth, consume when signed in
  useEffect(() => {
    if (isRealGoogleUser) {
      const pending = consumePendingCheckoutRequest();
      if (pending) {
        applyRequestToSheet(pending);
      }
    }
  }, [isRealGoogleUser, applyRequestToSheet]);

  // Strict auth-boundary reset: whenever user signs out, switches account, or enters Judge quick mode,
  // wipe activeOrder, watchingOrderId, receipt state, and close any open payment dialog immediately.
  useEffect(() => {
    const authScope = currentRealUid || `guest:${user?.authMethod || 'none'}`;
    if (prevAuthScopeRef.current !== authScope) {
      prevAuthScopeRef.current = authScope;
      isConfirmingTransferRef.current = false;
      setActiveOrder(null);
      setBlockingUnfinishedOrder(null);
      setOrderSpamError(null);
      setOrderCooldownSec(0);
      setEditingRejectedOrder(false);
      setReceiptImage('');
      setReceiptSizeKb(0);
      setReceiptError(null);
      setAuthInlineError(null);
      setIsCreatingOrder(false);
      setIsSubmittingTransfer(false);
      setIsOpen(false);
      setWatchingOrderId(currentRealUid ? getActiveWatchingOrderId(currentRealUid) : null);
    }
  }, [currentRealUid, user?.authMethod]);

  // Refresh unfinished order notice & cooldown countdown whenever modal opens or account changes
  useEffect(() => {
    if (!isOpen || !currentRealUid) return;
    const guard = getOrderCreationGuardStatus(currentRealUid);
    setOrderCooldownSec(guard.reason === 'cooldown' ? guard.retryAfterSec : 0);
    if (!activeOrder) {
      setBlockingUnfinishedOrder(findActiveUnfinishedOrderForUser(currentRealUid));
    } else {
      setBlockingUnfinishedOrder(null);
    }
  }, [isOpen, currentRealUid, activeOrder]);

  useEffect(() => {
    if (!isOpen || orderCooldownSec <= 0) return;
    const timer = window.setInterval(() => {
      if (!currentRealUid) {
        setOrderCooldownSec(0);
        return;
      }
      const guard = getOrderCreationGuardStatus(currentRealUid);
      setOrderCooldownSec(guard.reason === 'cooldown' ? guard.retryAfterSec : 0);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, orderCooldownSec, currentRealUid]);

  const processPaidOrderUnlock = useCallback(
    async (paidOrder: RealtimePaymentOrder) => {
      if (!currentRealUid || paidOrder.uid !== currentRealUid || paidOrder.status !== 'paid') {
        return;
      }
      const alreadyApplied = isPaidOrderAlreadyApplied(paidOrder.orderId, currentRealUid);
      let newlyApplied = false;
      if (!alreadyApplied) {
        newlyApplied = await applyApprovedOrderToCurrentUser(paidOrder, currentRealUid);
        if (newlyApplied) {
          refreshEntitlements();
        }
      }

      if (shouldShowOrderUnlockPopup(paidOrder, currentRealUid)) {
        void markOrderPopupNotified(paidOrder, currentRealUid);
        setActiveOrder({ ...paidOrder, popupNotified: true });
        setEditingRejectedOrder(false);
        setActiveWatchingOrderId(null, currentRealUid);
        setWatchingOrderId(null);
        setIsOpen(true);
      }

      if (newlyApplied && onPurchaseSuccess) {
        const pkg = PAYMENT_PACKAGES[paidOrder.packageId];
        onPurchaseSuccess({
          orderId: paidOrder.orderId,
          uid: paidOrder.uid,
          email: paidOrder.email,
          customerName: paidOrder.displayName,
          planTier: pkg.planTier,
          planName: paidOrder.packageName,
          scopeLabel: paidOrder.scopeLabel || paidOrder.packageName,
          siteIds: paidOrder.siteId ? [paidOrder.siteId] : [],
          routeIds: paidOrder.routeId ? [paidOrder.routeId] : [],
          region: 'vn_vietqr',
          paymentMethod: 'vietqr',
          paymentMethodLabel: 'MoMo / VietQR Napas 247',
          amountVnd: paidOrder.amount,
          amountUsd: Math.max(1, Math.round(paidOrder.amount / 25_000)),
          amountDisplay: formatVnd(paidOrder.amount),
          transferMemo: paidOrder.transferContent,
          schoolName: paidOrder.schoolName,
          schoolCode: pkg.planTier === 'school' ? paidOrder.ticketCode : undefined,
          emailSent: paidOrder.emailSent,
          status: 'completed',
          createdAt: paidOrder.createdAt,
        });
      }
    },
    [currentRealUid, onPurchaseSuccess, refreshEntitlements]
  );

  // Sync owned ticket bundle from Cloud Firestore `users/{uid}` when signed in
  useEffect(() => {
    if (!currentRealUid) return;
    void fetchUserTicketsFromCloud(currentRealUid).then((bundle) => {
      if (bundle) {
        refreshEntitlements();
      }
    });
  }, [currentRealUid, refreshEntitlements]);

  // Real-time subscription across ALL orders belonging strictly to `currentRealUid`
  useEffect(() => {
    if (!currentRealUid) return;
    const unsubscribe = subscribeToUserPaymentOrders(currentRealUid, (orders) => {
      const ownOrders = orders.filter((o) => o.uid === currentRealUid);
      for (const order of ownOrders) {
        if (order.status === 'paid') {
          void processPaidOrderUnlock(order);
        }
      }
      setActiveOrder((prev) => {
        const targetId = prev?.orderId || watchingOrderId;
        if (!targetId) return prev;
        const matched = ownOrders.find((o) => o.orderId === targetId);
        return matched || prev;
      });
      const unfinished =
        ownOrders.find((o) => o.status === 'pending' || o.status === 'waiting_approval') || null;
      setBlockingUnfinishedOrder(unfinished);
    });
    return () => unsubscribe();
  }, [currentRealUid, watchingOrderId, processPaidOrderUnlock]);

  // Real-time per-order listener for the active/watching order of `currentRealUid`
  useEffect(() => {
    const targetOrderId = activeOrder?.orderId || watchingOrderId;
    if (!targetOrderId || !currentRealUid) return;

    const unsubscribe = subscribeToPaymentOrder(
      targetOrderId,
      (latest) => {
        if (!latest || latest.uid !== currentRealUid) return;
        setActiveOrder(latest);
        if (latest.status === 'paid') {
          void processPaidOrderUnlock(latest);
        }
      },
      currentRealUid
    );

    return () => unsubscribe();
  }, [activeOrder?.orderId, watchingOrderId, currentRealUid, processPaidOrderUnlock]);

  // Generate electronic ticket QR image when order is approved (status === 'paid')
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'paid') {
      setTicketQrDataUrl('');
      return;
    }
    const payload = JSON.stringify({
      app: 'DauAnViet3D',
      orderId: activeOrder.orderId,
      ticket: activeOrder.ticketCode || activeOrder.orderId,
      pkg: activeOrder.packageId,
      qty: activeOrder.quantity,
      email: activeOrder.email,
    });
    void QRCode.toDataURL(payload, {
      width: 240,
      margin: 2,
      color: { dark: '#1C2E2A', light: '#FFFFFF' },
    })
      .then(setTicketQrDataUrl)
      .catch(() => setTicketQrDataUrl(''));
  }, [activeOrder]);

  const handleCloseModal = () => {
    setIsOpen(false);
    // If order is completed, clear active order so next open starts fresh and mark popup notified
    if (activeOrder?.status === 'paid' && currentRealUid) {
      void markOrderPopupNotified(activeOrder, currentRealUid);
      setActiveOrder(null);
      setActiveWatchingOrderId(null, currentRealUid);
      setWatchingOrderId(null);
    }
    if (onCloseExternal) onCloseExternal();
  };

  const handleCloseModalRef = useRef(handleCloseModal);
  handleCloseModalRef.current = handleCloseModal;

  // Escape key to close sheet
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseModalRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleCopyText = async (text: string, field: 'memo' | 'amount' | 'ticket') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      window.setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleDownloadPaymentQr = () => {
    const link = document.createElement('a');
    link.href = qrImgSrc;
    link.download = `VietQR-DauAnViet-${activeOrder?.orderId || 'QR'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGoogleSignIn = async () => {
    setAuthInlineError(null);
    setIsSigningInGoogle(true);
    try {
      const authLang = lang === 'en' ? 'en' : lang === 'zh' ? 'zh' : 'vi';
      const result = await signInWithFirebaseGoogleAccount(authLang);
      if (result.redirecting) return;
      if (!result.ok && !result.cancelled) {
        setAuthInlineError(
          result.error ||
            'Không thể mở cửa sổ đăng nhập Google. Bạn có thể bấm lại hoặc dùng hộp thoại đăng nhập.'
        );
        // Offer standard auth modal if popup was blocked
        if (result.error?.toLowerCase().includes('popup')) {
          openAuthModal({
            prompt: 'Đăng nhập tài khoản Google hoặc Facebook để tạo mã QR thanh toán và lưu vé điện tử.',
          });
        }
      }
    } catch {
      setAuthInlineError('Đã có lỗi khi kết nối Google Auth. Vui lòng thử lại.');
    } finally {
      setIsSigningInGoogle(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setAuthInlineError(null);
    setIsSigningInFacebook(true);
    try {
      const authLang = lang === 'en' ? 'en' : lang === 'zh' ? 'zh' : 'vi';
      const result = await signInWithFirebaseFacebookAccount(authLang);
      if (result.redirecting) return;
      if (!result.ok && !result.cancelled) {
        setAuthInlineError(
          result.error ||
            'Không thể mở cửa sổ đăng nhập Facebook. Bạn có thể bấm lại hoặc dùng hộp thoại đăng nhập.'
        );
        if (result.error?.toLowerCase().includes('popup')) {
          openAuthModal({
            prompt: 'Đăng nhập tài khoản Google hoặc Facebook để tạo mã QR thanh toán và lưu vé điện tử.',
          });
        }
      }
    } catch {
      setAuthInlineError('Đã có lỗi khi kết nối Facebook Auth. Vui lòng thử lại.');
    } finally {
      setIsSigningInFacebook(false);
    }
  };

  const handleReopenBlockedOrder = (order: RealtimePaymentOrder) => {
    if (!currentRealUid || order.uid !== currentRealUid) return;
    setOrderSpamError(null);
    setBlockingUnfinishedOrder(null);
    setActiveOrder(order);
    setWatchingOrderId(order.orderId);
    setActiveWatchingOrderId(order.orderId, currentRealUid);
    setEditingRejectedOrder(false);
  };

  const handleCancelBlockedOrder = async (order: RealtimePaymentOrder) => {
    if (!currentRealUid || order.uid !== currentRealUid || isCancellingOldOrder) return;
    setIsCancellingOldOrder(true);
    try {
      await cancelUserUnfinishedOrder(order.orderId, currentRealUid);
      setBlockingUnfinishedOrder(null);
      setOrderSpamError(null);
      if (activeOrder?.orderId === order.orderId) {
        setActiveOrder(null);
        setWatchingOrderId(null);
      }
    } finally {
      setIsCancellingOldOrder(false);
    }
  };

  const handleCreateQrOrder = async () => {
    setAuthInlineError(null);
    setOrderSpamError(null);
    setReceiptError(null);

    // STRICT AUTH GATE: never create order or show QR unless signed in with real account
    if (!isRealGoogleUser || !user || !currentRealUid) {
      googleBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setAuthInlineError('Vui lòng đăng nhập tài khoản Google hoặc Facebook trước khi tạo mã QR thanh toán.');
      return;
    }

    // ANTI-SPAM GUARD 1: Max 1 active pending/waiting_approval order per uid
    const existingUnfinished = findActiveUnfinishedOrderForUser(currentRealUid);
    if (existingUnfinished) {
      setBlockingUnfinishedOrder(existingUnfinished);
      setOrderSpamError(
        `Tài khoản hiện đang có đơn chờ xử lý (${existingUnfinished.orderId}). Vui lòng mở lại đơn đang chờ hoặc hủy đơn cũ trước khi tạo đơn mới.`
      );
      return;
    }

    // ANTI-SPAM GUARD 2: 60s cooldown & max 5 unpaid orders/day per uid
    const rateGuard = getOrderCreationGuardStatus(currentRealUid);
    if (!rateGuard.allowed) {
      if (rateGuard.reason === 'cooldown') {
        setOrderCooldownSec(rateGuard.retryAfterSec);
        setOrderSpamError(
          `Vui lòng chờ ${rateGuard.retryAfterSec} giây trước khi tạo mã QR đơn hàng mới.`
        );
      } else {
        setOrderSpamError(
          `Bạn đã đạt giới hạn tối đa ${rateGuard.dailyLimit} đơn chưa thanh toán trong ngày hôm nay. Vui lòng quay lại sau hoặc liên hệ Admin.`
        );
      }
      return;
    }

    const scopeLabel =
      selectedPackageId === 'student_25k'
        ? selectedSiteLabel || selectedRouteLabel
        : selectedPackageId === 'classroom_500k'
        ? schoolName.trim()
          ? `${schoolName.trim()} (${schoolProvince})`
          : `Gói Ultra (Lớp học · 500k) · ${quantity} lớp (35 tài khoản/lớp)`
        : 'Toàn bộ 17 di tích & 9 hành trình di sản';

    // 1. Instant local order generation (TGDS-XXXXX) & 0s UI transition to QR view
    const localOrder = buildLocalPendingPaymentOrder({
      uid: currentRealUid,
      email: user.email || '',
      displayName: user.displayName,
      packageId: selectedPackageId,
      quantity,
      routeId: selectedPackageId === 'student_25k' ? selectedRouteId : undefined,
      siteId: selectedPackageId === 'student_25k' ? selectedSiteId : undefined,
      scopeLabel,
      schoolName:
        selectedPackageId === 'classroom_500k' && schoolName.trim()
          ? schoolName.trim()
          : undefined,
      schoolProvince:
        selectedPackageId === 'classroom_500k' ? schoolProvince : undefined,
    });

    const nextGuard = getOrderCreationGuardStatus(currentRealUid);
    setOrderCooldownSec(nextGuard.reason === 'cooldown' ? nextGuard.retryAfterSec : 60);
    setBlockingUnfinishedOrder(null);
    setQrImgSrc(VIETQR_RECIPIENT.qrPublicPath);
    setQrImageFailed(false);
    setActiveOrder(localOrder);
    setWatchingOrderId(localOrder.orderId);
    setEditingRejectedOrder(false);
    setReceiptImage('');
    setReceiptSizeKb(0);

    // 2. Non-blocking Cloud Firestore sync with strict 3000ms timeout guard
    try {
      await Promise.race([
        syncPendingPaymentOrderToCloud(localOrder),
        new Promise<never>((_, reject) =>
          window.setTimeout(() => reject(new Error('Order cloud sync timeout (3000ms)')), 3000)
        ),
      ]);
    } catch (err) {
      console.warn('[VietQR] Fallback to localStorage for pending order:', localOrder.orderId, err);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleSelectReceiptFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptError(null);
    setIsCompressingReceipt(true);
    try {
      const compressed = await compressReceiptImageToBase64(file, 150_000);
      setReceiptImage(compressed);
      setReceiptSizeKb(Math.max(1, Math.round(compressed.length / 1024)));
    } catch (err) {
      setReceiptError(
        err instanceof Error ? err.message : 'Không thể xử lý ảnh biên lai. Vui lòng thử ảnh khác.'
      );
    } finally {
      setIsCompressingReceipt(false);
      if (receiptInputRef.current) receiptInputRef.current.value = '';
    }
  };

  const handleConfirmTransferred = async () => {
    if (!activeOrder || isConfirmingTransferRef.current || isSubmittingTransfer) return;
    if (activeOrder.status === 'waiting_approval' && activeOrder.notificationSent) return;

    isConfirmingTransferRef.current = true;
    setIsSubmittingTransfer(true);

    // 1. Immediate transition to waiting_approval & localStorage persistence
    const waitingOrder = buildLocalWaitingPaymentOrder(activeOrder, receiptImage);
    setActiveOrder({ ...waitingOrder, notificationSent: true });
    setWatchingOrderId(waitingOrder.orderId);
    setEditingRejectedOrder(false);

    // 2. Non-blocking Cloud Firestore update with 3000ms timeout guard (EmailJS sent max 1 time per orderId)
    try {
      await Promise.race([
        syncWaitingPaymentOrderToCloud(waitingOrder),
        new Promise<never>((_, reject) =>
          window.setTimeout(() => reject(new Error('Transfer confirmation timeout (3000ms)')), 3000)
        ),
      ]);
    } catch (err) {
      console.warn('[VietQR] Fallback to localStorage for waiting_approval:', waitingOrder.orderId, err);
    } finally {
      isConfirmingTransferRef.current = false;
      setIsSubmittingTransfer(false);
    }
  };

  const handleStartFreshOrder = () => {
    isConfirmingTransferRef.current = false;
    setActiveOrder(null);
    setWatchingOrderId(null);
    if (currentRealUid) {
      setActiveWatchingOrderId(null, currentRealUid);
      setBlockingUnfinishedOrder(findActiveUnfinishedOrderForUser(currentRealUid));
      const guard = getOrderCreationGuardStatus(currentRealUid);
      setOrderCooldownSec(guard.reason === 'cooldown' ? guard.retryAfterSec : 0);
    }
    setEditingRejectedOrder(false);
    setOrderSpamError(null);
    setReceiptImage('');
    setReceiptSizeKb(0);
    setReceiptError(null);
    setIsCreatingOrder(false);
    setIsSubmittingTransfer(false);
    setQrImgSrc(VIETQR_RECIPIENT.qrPublicPath);
    setQrImageFailed(false);
  };

  // Determine visual step inside Bottom Sheet
  const activeStep: 'select' | 'qr' | 'waiting' | 'paid' | 'rejected' = (() => {
    if (!activeOrder) return 'select';
    if (activeOrder.status === 'paid') return 'paid';
    if (activeOrder.status === 'rejected') {
      return editingRejectedOrder ? 'qr' : 'rejected';
    }
    if (activeOrder.status === 'waiting_approval') return 'waiting';
    return 'qr';
  })();

  const displayedBadgeText =
    activeStep === 'select'
      ? `${quantity} VÉ · ${activePackage.badgeTitle} · ${formatVndCompact(totalAmount)}`
      : `${activeOrder?.quantity || 1} VÉ · ${
          PAYMENT_PACKAGES[activeOrder?.packageId || selectedPackageId].badgeTitle
        } · ${formatVndCompact(activeOrder?.amount || totalAmount)}`;

  // Minimized floating status chip when buyer has an order waiting for Admin approval
  if (!isOpen) {
    if (activeOrder && activeOrder.status === 'waiting_approval' && isRealGoogleUser) {
      return (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-[95] flex items-center gap-2.5 rounded-full bg-[#1C2E2A] text-[#FFFDF9] border border-[#C9A46A]/60 pl-3.5 pr-4 py-2.5 shadow-[0_12px_32px_rgba(20,23,21,0.32)] hover:bg-[#263F39] transition-colors cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#C9A46A] animate-pulse shrink-0" />
          <span className="text-xs font-medium tracking-tight">
            Đơn <strong className="font-mono text-[#E8D5B0]">{activeOrder.orderId}</strong> đang
            chờ duyệt...
          </span>
        </button>
      );
    }
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-end sm:items-center justify-center bg-[#141715]/75 backdrop-blur-sm sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vietqr-bottom-sheet-title"
      onClick={handleCloseModal}
    >
      <div
        className="relative w-full sm:max-w-[460px] max-h-[93vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-[#FFFDF9] border border-[#D5CBB8] shadow-[0_24px_64px_rgba(20,23,21,0.4)] overflow-hidden text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#FAF6EE]">
          <div className="w-10 h-1 rounded-full bg-[#CFC3AE]" />
        </div>

        {/* Sticky Top Header */}
        <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-3.5 bg-[#FAF6EE] border-b border-[#E5DEC9] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#3A665B] text-[#FFFDF9] text-[10px] font-bold tracking-[0.08em] uppercase">
                NAPAS 247 · MOMO VIETQR
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-[4px] bg-[#EFE8D9] text-[#A63A2B] border border-[#A63A2B]/20 text-[10px] font-bold tracking-[0.05em] uppercase tabular-nums">
                {displayedBadgeText}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Đóng cửa sổ thanh toán"
              className="w-8 h-8 rounded-full bg-[#EFE8D9] hover:bg-[#E2D8C3] text-[#1C1917] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2
            id="vietqr-bottom-sheet-title"
            className="font-serif text-lg sm:text-xl font-semibold text-[#1C1917] mt-2.5 leading-snug"
          >
            {activeStep === 'select' && 'Chọn gói Vé & Học liệu Di sản'}
            {activeStep === 'qr' && 'Quét mã VietQR để chuyển khoản'}
            {activeStep === 'waiting' && 'Đang chờ xác nhận giao dịch'}
            {activeStep === 'paid' && 'Thanh toán thành công — Đã mở khóa vé'}
            {activeStep === 'rejected' && 'Giao dịch chưa được xác nhận'}
          </h2>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
          {/* ================================================================
              STEP 1: PACKAGE SELECTOR & QUANTITY STEPPER
             ================================================================ */}
          {activeStep === 'select' && (
            <>
              {/* 3 Quick Package Pills */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5346] block">
                  Chọn gói sử dụng
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PAYMENT_PACKAGE_LIST.map((pkg) => {
                    const active = pkg.packageId === selectedPackageId;
                    return (
                      <button
                        key={pkg.packageId}
                        type="button"
                        onClick={() => {
                          setSelectedPackageId(pkg.packageId);
                          const cap = getMaxQuantityForPackage(pkg.packageId);
                          setQuantity((q) => Math.max(1, Math.min(cap, q)));
                        }}
                        className={`px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer flex sm:flex-col items-center sm:items-start justify-between gap-1 ${
                          active
                            ? 'bg-[#1C2E2A] text-[#FFFDF9] border-[#1C2E2A] shadow-sm'
                            : 'bg-[#FAF6EE] text-[#1C1917] border-[#D8CEBC] hover:border-[#A63A2B]/50'
                        }`}
                      >
                        <span className="text-xs font-semibold leading-tight">
                          {pkg.shortLabel}
                        </span>
                        <span
                          className={`text-[11px] tabular-nums ${
                            active ? 'text-[#E5CFA3]' : 'text-[#6B6153]'
                          }`}
                        >
                          {pkg.durationLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional route selector for Student 25k */}
              {selectedPackageId === 'student_25k' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5346] block">
                    Tuyến hành trình áp dụng
                  </label>
                  <select
                    value={selectedRouteId}
                    onChange={(e) => {
                      setSelectedRouteId(e.target.value);
                      setSelectedSiteId(undefined);
                    }}
                    className="w-full rounded-xl bg-[#FAF6EE] border border-[#D8CEBC] px-3 py-2.5 text-xs text-[#1C1917] focus:outline-none focus:border-[#3A665B] cursor-pointer"
                  >
                    {TOUR_ROUTES.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.title} ({route.sites.length} điểm di tích)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Optional school name for Classroom 500k */}
              {selectedPackageId === 'classroom_500k' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5C5346] block">
                    Tên Lớp học / Trường học (Gói Ultra · không bắt buộc)
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="VD: THPT Chuyên Lê Quý Đôn - Lớp 11 Sử"
                    className="w-full rounded-xl bg-[#FAF6EE] border border-[#D8CEBC] px-3 py-2.5 text-xs text-[#1C1917] placeholder:text-[#8A7F6F] focus:outline-none focus:border-[#3A665B]"
                  />
                </div>
              )}

              {/* Quantity Stepper & Live Price Formula */}
              <div className="rounded-xl bg-[#FAF6EE] border border-[#E2D9C8] p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#5C5346] font-medium">Tính tổng thanh toán</span>
                  <span className="font-semibold text-[#1C1917] tabular-nums">
                    {quantity} vé × {formatVnd(activePackage.unitPrice)} ={' '}
                    <strong className="text-[#A63A2B] text-sm">{formatVnd(totalAmount)}</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#E6DEC9]">
                  <span className="text-xs font-medium text-[#1C1917]">Số lượng vé</span>
                  <div className="inline-flex items-center rounded-lg border border-[#D5CBB8] bg-[#FFFDF9] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Giảm số lượng vé"
                      className="w-9 h-9 flex items-center justify-center text-[#1C1917] hover:bg-[#EFE8D9] disabled:opacity-35 transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-11 text-center text-sm font-bold text-[#1C1917] tabular-nums select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxQuantityForSelectedPkg, q + 1))}
                      disabled={quantity >= maxQuantityForSelectedPkg}
                      aria-label="Tăng số lượng vé"
                      className="w-9 h-9 flex items-center justify-center text-[#1C1917] hover:bg-[#EFE8D9] disabled:opacity-35 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active unfinished order blocker (max 1 active pending/waiting_approval per uid) */}
              {isRealGoogleUser && blockingUnfinishedOrder && (
                <div className="rounded-xl border border-[#C9A46A] bg-[#FAF5E9] p-3.5 space-y-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#A63A2B] shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-xs">
                      <div className="font-semibold text-[#1C1917]">
                        Bạn đang có đơn chưa hoàn tất ({blockingUnfinishedOrder.orderId})
                      </div>
                      <p className="text-[11px] text-[#5C5346] leading-relaxed">
                        Mỗi tài khoản chỉ được giữ tối đa 1 đơn đang chờ tại một thời điểm (
                        {formatVnd(blockingUnfinishedOrder.amount)} ·{' '}
                        {blockingUnfinishedOrder.status === 'waiting_approval'
                          ? 'Đang chờ Admin duyệt'
                          : 'Chờ chuyển khoản'}
                        ).
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => handleReopenBlockedOrder(blockingUnfinishedOrder)}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#1C2E2A] hover:bg-[#13221F] text-[#FFFDF9] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Mở lại đơn đang chờ ({blockingUnfinishedOrder.orderId})
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCancelBlockedOrder(blockingUnfinishedOrder)}
                      disabled={isCancellingOldOrder}
                      className="py-2 px-3 rounded-lg bg-[#EFE8D9] hover:bg-[#E2D8C3] disabled:opacity-60 text-[#A63A2B] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      {isCancellingOldOrder ? 'Đang hủy...' : 'Hủy đơn cũ để tạo đơn mới'}
                    </button>
                  </div>
                </div>
              )}

              {orderSpamError && !blockingUnfinishedOrder && (
                <div className="rounded-xl bg-[#A63A2B]/10 border border-[#A63A2B]/35 px-3.5 py-2.5 text-xs text-[#A63A2B] font-medium">
                  {orderSpamError}
                </div>
              )}

              {/* Primary CTA OR Bronze Google & Facebook Auth Required Box */}
              {isRealGoogleUser && user ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#5C5346] px-0.5">
                    <span>Tài khoản nhận vé:</span>
                    <span className="font-medium text-[#1C1917] truncate max-w-[240px]">
                      {user.email || `${user.displayName} (${user.provider === 'facebook' ? 'Facebook' : 'Google'})`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateQrOrder}
                    disabled={isCreatingOrder || orderCooldownSec > 0 || Boolean(blockingUnfinishedOrder)}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#1C2E2A] hover:bg-[#13221F] disabled:opacity-60 text-[#FFFDF9] text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isCreatingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang khởi tạo mã QR giao dịch...</span>
                      </>
                    ) : orderCooldownSec > 0 ? (
                      <>
                        <Clock className="w-4 h-4 text-[#E5CFA3]" />
                        <span className="tabular-nums">
                          Chờ {orderCooldownSec}s để tạo đơn mới
                        </span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 text-[#E5CFA3]" />
                        <span className="tabular-nums">
                          Tạo mã QR · {formatVnd(totalAmount)}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div
                  ref={googleBoxRef}
                  className="rounded-xl border border-[#C9A46A] bg-[#FAF5E9] p-4 space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#9B7538] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#1C1917]">
                        Đăng nhập tài khoản để tạo mã QR thanh toán.
                      </p>
                      <p className="text-[11px] text-[#5C5346] leading-relaxed">
                        {user?.authMethod === 'judge_quick_access'
                          ? 'Phiên Trải nghiệm nhanh không gắn tài khoản cá nhân để lưu vé điện tử. Vui lòng đăng nhập Google hoặc Facebook để tạo đơn thanh toán thật.'
                          : 'Hệ thống gắn mã vé theo UID tài khoản Google hoặc Facebook (và gửi hóa đơn điện tử nếu tài khoản có email) sau khi xác nhận chuyển khoản.'}
                      </p>
                    </div>
                  </div>

                  {authInlineError && (
                    <div className="rounded-lg bg-[#A63A2B]/10 border border-[#A63A2B]/30 px-3 py-2 text-[11px] text-[#A63A2B] font-medium">
                      {authInlineError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSigningInGoogle || isSigningInFacebook}
                      className="w-full py-3 px-4 rounded-xl bg-[#1C2E2A] hover:bg-[#13221F] disabled:opacity-65 text-[#FFFDF9] text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
                    >
                      {isSigningInGoogle ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                          <GoogleMarkSvg className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span>
                        {isSigningInGoogle
                          ? 'Đang mở đăng nhập Google...'
                          : 'Đăng nhập với Google ngay'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFacebookSignIn}
                      disabled={isSigningInGoogle || isSigningInFacebook}
                      className="w-full py-3 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-65 text-[#FFFFFF] text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
                    >
                      {isSigningInFacebook ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              fill="#1877F2"
                              d="M15.12 5.32H17V2.14A26.11 26.11 0 0 0 14.26 2c-2.72 0-4.58 1.66-4.58 4.7v2.62H6.61v3.56h3.07V22h3.68v-9.12h3.06l.46-3.56h-3.52V7.05c0-1.05.29-1.73 1.76-1.73z"
                            />
                          </svg>
                        </span>
                      )}
                      <span>
                        {isSigningInFacebook
                          ? 'Đang mở đăng nhập Facebook...'
                          : 'Tiếp tục với Facebook'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Concise Benefit Summary & Archival Verification Note */}
              <div className="rounded-xl border border-[#E5DEC9] bg-[#FFFDF9] p-3.5 space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#3A665B]">
                  Quyền lợi {activePackage.packageName}
                </div>
                <ul className="space-y-1.5">
                  {activePackage.benefits.map((line, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#3C362E]">
                      <Check className="w-3.5 h-3.5 text-[#3A665B] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{line}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-2 border-t border-[#EFE8D9] text-[11px] text-[#6B6153] leading-relaxed">
                  Sau khi chuyển khoản đúng nội dung, hệ thống xác nhận giao dịch và bật thông báo
                  popup mở khóa vé ngay trên màn hình.
                </p>
              </div>
            </>
          )}

          {/* ================================================================
              STEP 2: VIETQR PAYMENT VIEW & RECEIPT UPLOAD (status: "pending")
             ================================================================ */}
          {activeStep === 'qr' && activeOrder && (
            <>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleStartFreshOrder}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C5346] hover:text-[#1C1917] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Chọn lại gói</span>
                </button>
                <span className="text-[11px] font-mono font-bold text-[#A63A2B] bg-[#EFE8D9] px-2.5 py-0.5 rounded-sm">
                  {activeOrder.orderId}
                </span>
              </div>

              {editingRejectedOrder && activeOrder.rejectionReason && (
                <div className="rounded-xl bg-[#A63A2B]/8 border border-[#A63A2B]/30 px-3.5 py-2.5 text-xs text-[#A63A2B]">
                  <strong>Lý do từ chối trước đó:</strong> {activeOrder.rejectionReason}
                </div>
              )}

              {/* VietQR Card */}
              <div className="rounded-xl bg-[#FAF6EE] border border-[#DDD3C0] p-4 flex flex-col items-center text-center space-y-3">
                {!qrImageFailed ? (
                  <div className="bg-white p-3 rounded-xl border border-[#E2D9C8] shadow-xs w-[216px] h-[216px] flex items-center justify-center">
                    <img
                      src={qrImgSrc}
                      alt={`Mã VietQR chuyển khoản ${activeOrder.orderId}`}
                      onError={() => {
                        if (qrImgSrc !== VIETQR_RECIPIENT.qrGithubFallbackPath) {
                          setQrImgSrc(VIETQR_RECIPIENT.qrGithubFallbackPath);
                        } else {
                          setQrImageFailed(true);
                        }
                      }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full rounded-xl bg-white border border-[#D5CBB8] p-4 text-left space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#3A665B]">
                        Chuyển khoản thủ công
                      </span>
                      <span className="text-[10px] font-mono text-[#8A7F6F]">
                        {VIETQR_RECIPIENT.channelLabel}
                      </span>
                    </div>
                    <div className="text-xs space-y-1 text-[#1C1917]">
                      <div>
                        Chủ tài khoản: <strong>{VIETQR_RECIPIENT.accountHolder}</strong>
                      </div>
                      <div>
                        Số tài khoản / Ví: <strong className="font-mono">{VIETQR_RECIPIENT.accountMasked}</strong>
                      </div>
                      <div>
                        Số tiền: <strong className="text-[#A63A2B]">{formatVnd(activeOrder.amount)}</strong>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EFE8D9]">
                      <span className="font-mono text-xs font-bold text-[#1C2E2A]">
                        {activeOrder.transferContent}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(activeOrder.transferContent, 'memo')}
                        className="px-2.5 py-1 rounded-md bg-[#1C2E2A] hover:bg-[#13221F] text-[11px] font-semibold text-[#FFFDF9] inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'memo' ? (
                          <>
                            <Check className="w-3 h-3 text-[#E5CFA3]" />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-0.5">
                  <div className="text-xs font-bold tracking-wide text-[#1C1917] uppercase">
                    {VIETQR_RECIPIENT.accountHolder}
                  </div>
                  <div className="text-[11px] text-[#5C5346]">
                    {VIETQR_RECIPIENT.channelLabel} · {VIETQR_RECIPIENT.accountMasked}
                  </div>
                </div>

                {!qrImageFailed && (
                  <button
                    type="button"
                    onClick={handleDownloadPaymentQr}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFDF9] hover:bg-[#EFE8D9] border border-[#D5CBB8] text-[11px] font-semibold text-[#1C1917] transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#3A665B]" />
                    <span>Tải ảnh mã QR</span>
                  </button>
                )}
              </div>

              {/* Exact Transfer Details */}
              <div className="rounded-xl bg-[#FAF6EE] border border-[#E2D9C8] divide-y divide-[#E6DEC9] text-xs">
                <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <span className="text-[#5C5346]">Số tiền cần chuyển</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#A63A2B] tabular-nums">
                      {formatVnd(activeOrder.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(String(activeOrder.amount), 'amount')}
                      className="px-2 py-1 rounded-md bg-[#FFFDF9] border border-[#D5CBB8] hover:border-[#3A665B] text-[11px] font-medium text-[#1C1917] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'amount' ? (
                        <>
                          <Check className="w-3 h-3 text-[#3A665B]" />
                          <span className="text-[#3A665B]">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[#5C5346]">Nội dung chuyển khoản</div>
                    <div className="text-[10px] text-[#8A7F6F]">Ghi đúng mã để đối soát nhanh</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#1C2E2A] tracking-wider">
                      {activeOrder.transferContent}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(activeOrder.transferContent, 'memo')}
                      className="px-2.5 py-1 rounded-md bg-[#1C2E2A] hover:bg-[#13221F] text-[11px] font-semibold text-[#FFFDF9] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'memo' ? (
                        <>
                          <Check className="w-3 h-3 text-[#E5CFA3]" />
                          <span>Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Receipt Screenshot Uploader (< 150KB Base64) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#5C5346]">
                    Ảnh chụp màn hình biên lai (không bắt buộc)
                  </span>
                  {receiptSizeKb > 0 && (
                    <span className="text-[#3A665B] font-medium tabular-nums">
                      Đã nén {receiptSizeKb} KB
                    </span>
                  )}
                </div>

                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleSelectReceiptFile}
                  className="hidden"
                />

                {receiptImage ? (
                  <div className="rounded-xl border border-[#3A665B]/40 bg-[#FAF6EE] p-2.5 flex items-center gap-3">
                    <img
                      src={receiptImage}
                      alt="Ảnh biên lai chuyển khoản"
                      className="w-14 h-14 rounded-lg object-cover border border-[#D5CBB8] bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#1C1917] truncate">
                        Đã đính kèm ảnh biên lai
                      </div>
                      <div className="text-[11px] text-[#5C5346]">
                        Sẽ gửi kèm khi bạn bấm xác nhận bên dưới.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptImage('');
                        setReceiptSizeKb(0);
                      }}
                      aria-label="Xóa ảnh biên lai"
                      className="p-2 rounded-lg text-[#A63A2B] hover:bg-[#A63A2B]/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => receiptInputRef.current?.click()}
                    disabled={isCompressingReceipt}
                    className="w-full py-3 px-3.5 rounded-xl border border-dashed border-[#C9BFA9] hover:border-[#3A665B] bg-[#FAF6EE]/60 hover:bg-[#FAF6EE] text-xs text-[#5C5346] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isCompressingReceipt ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#3A665B]" />
                        <span>Đang tối ưu dung lượng ảnh biên lai...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-4 h-4 text-[#3A665B]" />
                        <span>Tải ảnh biên lai JPG/PNG/WEBP (tối đa 5MB, tự nén &lt;150KB)</span>
                      </>
                    )}
                  </button>
                )}

                {receiptError && (
                  <p className="text-[11px] text-[#A63A2B] font-medium">{receiptError}</p>
                )}
              </div>

              {/* Submit Transfer Confirmation CTA (Moves to waiting_approval, NEVER unlocks yet) */}
              <button
                type="button"
                onClick={handleConfirmTransferred}
                disabled={isSubmittingTransfer || isCompressingReceipt}
                className="w-full py-3.5 px-4 rounded-xl bg-[#3A665B] hover:bg-[#2F554C] disabled:opacity-60 text-[#FFFDF9] text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmittingTransfer ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi yêu cầu xác nhận...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tôi đã chuyển khoản — Gửi xác nhận</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* ================================================================
              STEP 3: WAITING FOR ADMIN VERIFICATION (status: "waiting_approval")
             ================================================================ */}
          {activeStep === 'waiting' && activeOrder && (
            <div className="space-y-4 py-1">
              <div className="rounded-xl bg-[#FAF6EE] border border-[#C9A46A]/60 p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#EFE8D9] border border-[#C9A46A] text-[#9B7538] mx-auto flex items-center justify-center">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9B7538]">
                    Đã ghi nhận yêu cầu đối soát
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
                    Đang chờ xác nhận giao dịch
                  </h3>
                  <p className="text-xs text-[#5C5346] leading-relaxed">
                    Quản trị viên đang kiểm tra giao dịch của bạn. Thời gian xử lý dự kiến{' '}
                    <strong className="text-[#1C1917]">1–3 phút</strong>. Vé sẽ tự động mở khóa
                    và hiển thị thông báo ngay trên màn hình khi được duyệt.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E6DEC9] grid grid-cols-2 gap-2 text-left text-xs">
                  <div className="rounded-lg bg-[#FFFDF9] border border-[#E5DEC9] p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-[#8A7F6F]">
                      Mã đơn hàng
                    </div>
                    <div className="font-mono font-bold text-[#1C2E2A] mt-0.5">
                      {activeOrder.orderId}
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#FFFDF9] border border-[#E5DEC9] p-2.5">
                    <div className="text-[10px] uppercase tracking-wider text-[#8A7F6F]">
                      Tổng thanh toán
                    </div>
                    <div className="font-bold text-[#A63A2B] tabular-nums mt-0.5">
                      {formatVnd(activeOrder.amount)}
                    </div>
                  </div>
                </div>

                {activeOrder.receiptImage && (
                  <div className="flex items-center gap-2.5 text-left rounded-lg bg-[#FFFDF9] border border-[#E5DEC9] p-2">
                    <img
                      src={activeOrder.receiptImage}
                      alt="Biên lai đã gửi"
                      className="w-10 h-10 rounded object-cover border border-[#D5CBB8]"
                    />
                    <div className="text-[11px] text-[#5C5346]">
                      Đã đính kèm ảnh biên lai chuyển khoản để đối soát nhanh.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#3A665B] font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang lắng nghe trạng thái duyệt trực tiếp từ máy chủ...</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#1C2E2A] hover:bg-[#13221F] text-[#FFFDF9] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Thu gọn (vẫn tự động báo khi duyệt)
                </button>
                <button
                  type="button"
                  onClick={handleStartFreshOrder}
                  className="py-3 px-4 rounded-xl bg-[#EFE8D9] hover:bg-[#E2D8C3] text-[#1C1917] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tạo đơn khác
                </button>
              </div>
            </div>
          )}

          {/* ================================================================
              STEP 4: REAL-TIME APPROVED POPUP (status: "paid")
             ================================================================ */}
          {activeStep === 'paid' && activeOrder && (
            <div className="space-y-4 py-1">
              <div className="rounded-xl bg-[#1C2E2A] text-[#FFFDF9] p-5 text-center space-y-3 border border-[#C9A46A]/60">
                <div className="w-12 h-12 rounded-full bg-[#3A665B] border border-[#E5CFA3]/60 text-[#E5CFA3] mx-auto flex items-center justify-center">
                  <Ticket className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#E5CFA3]">
                    Giao dịch đã được xác thực
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-[#FFFDF9]">
                    Thanh toán thành công — Đã mở khóa vé
                  </h3>
                  <p className="text-xs text-[#E8DFCE]/85">
                    {activeOrder.packageName} ({activeOrder.quantity} vé ·{' '}
                    {formatVnd(activeOrder.amount)})
                  </p>
                </div>

                {ticketQrDataUrl && (
                  <div className="mx-auto w-36 h-36 rounded-xl bg-white p-2 border border-[#E5CFA3]/50 shadow-sm">
                    <img
                      src={ticketQrDataUrl}
                      alt={`Mã QR vé điện tử ${activeOrder.ticketCode || activeOrder.orderId}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 border border-[#E5CFA3]/35 px-3 py-1.5">
                  <span className="text-[11px] text-[#E8DFCE]/80">Mã vé:</span>
                  <strong className="font-mono text-xs text-[#E5CFA3] tracking-wider">
                    {activeOrder.ticketCode || activeOrder.orderId}
                  </strong>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(activeOrder.ticketCode || activeOrder.orderId, 'ticket')
                    }
                    className="text-[#E5CFA3] hover:text-white cursor-pointer"
                    aria-label="Sao chép mã vé"
                  >
                    {copiedField === 'ticket' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-[#FAF6EE] border border-[#E2D9C8] p-3.5 text-xs text-[#3C362E] space-y-1">
                <div>
                  <strong>Tài khoản kích hoạt:</strong> {activeOrder.displayName} (
                  {activeOrder.email})
                </div>
                <div className="text-[11px] text-[#5C5346]">
                  Quyền truy cập 3D nâng cao, thuyết minh và học liệu đã được đồng bộ vào tài khoản
                  của bạn.
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full py-3.5 px-4 rounded-xl bg-[#3A665B] hover:bg-[#2F554C] text-[#FFFDF9] text-sm font-semibold transition-colors cursor-pointer"
              >
                Bắt đầu khám phá Di sản ngay
              </button>
            </div>
          )}

          {/* ================================================================
              REJECTED STATE (status: "rejected")
             ================================================================ */}
          {activeStep === 'rejected' && activeOrder && (
            <div className="space-y-4 py-1">
              <div className="rounded-xl bg-[#FDF4F2] border border-[#A63A2B]/35 p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#A63A2B]/12 text-[#A63A2B] mx-auto flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#A63A2B]">
                    Đơn {activeOrder.orderId} chưa được duyệt
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#1C1917]">
                    Chưa thể xác nhận chuyển khoản
                  </h3>
                  <p className="text-xs text-[#5C5346] leading-relaxed">
                    {activeOrder.rejectionReason ||
                      'Hệ thống chưa ghi nhận khoản tiền chuyển khớp nội dung đơn hàng. Vui lòng kiểm tra lại và gửi ảnh biên lai chuyển khoản.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRejectedOrder(true)}
                  className="w-full py-3 px-4 rounded-xl bg-[#1C2E2A] hover:bg-[#13221F] text-[#FFFDF9] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Tải lại ảnh biên lai &amp; Gửi lại xác nhận
                </button>
                <button
                  type="button"
                  onClick={handleStartFreshOrder}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#EFE8D9] hover:bg-[#E2D8C3] text-[#1C1917] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tạo đơn thanh toán mới
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
