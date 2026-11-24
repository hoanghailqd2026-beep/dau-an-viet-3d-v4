/**
 * Real-Time VietQR Payment Orders Engine
 * - Strict Per-Account Isolation (`uid`):
 *   - Buyer local storage is isolated strictly under `tgds_orders_${uid}` & `tgds_tickets_${uid}`.
 *   - Buyer Firestore queries always filter with `where("uid", "==", uid)`.
 *   - Admin Studio reads across Cloud Firestore `payment_orders` + all `tgds_orders_*` keys.
 * - Strict Unlock Gate: creating/submitting an order NEVER unlocks tickets; tickets & entitlements
 *   unlock ONLY when Admin approves an order (`status: "paid"`).
 * - Bounded 3000ms cloud timeouts guarantee UI never hangs in AI Studio Preview or offline modes.
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  type Firestore,
  type Unsubscribe as FirestoreUnsubscribe,
} from 'firebase/firestore';
import { onValue, ref, remove, set, update, type Unsubscribe as RtdbUnsubscribe } from 'firebase/database';
import { firebaseAuth } from '../lib/firebaseAuth';
import { getAppFirestore } from '../lib/firebaseDb';
import { getRealtimeDb } from './realtimeCloudSync';
import {
  FIREBASE_DB_URL,
  isFirebaseDbConfigured,
  sanitizeFirebaseUserKey,
} from './firebaseRestSync';
import {
  PRIMARY_ADMIN_EMAIL,
  activateUserSchoolPackage,
  getUserSubscriptionTier,
  recordIssuedPass,
  setUserSubscriptionTier,
  type IssuedPassRecord,
} from './adminPlatformStore';
import {
  PAYMENT_ORDERS_UPDATED_EVENT,
  SUBSCRIPTION_GATING_UPDATED_EVENT,
  expandUnlockedSitesFromRoutes,
  generateSchoolActivationCode,
  loadLocalUserSubscription,
  recordPaymentOrder,
  saveUserSubscription,
  type PaymentOrderRecord,
  type SubscriptionPlanLevel,
  type UserSubscriptionRecord,
} from './subscriptionGatingStore';
import {
  pushSuQuanPurchaseNotice,
  sendOrderThankYouEmail,
  type EmailSendResult,
} from './emailAutoSender';
import { ensureClassroomLicenseForTeacher } from './classroomLicenseStore';

export type PaymentPackageId = 'student_25k' | 'self_guided_59k' | 'classroom_500k';

export type PaymentOrderStatus = 'pending' | 'waiting_approval' | 'paid' | 'rejected';

export interface PaymentPackageOption {
  packageId: PaymentPackageId;
  planTier: 'plus' | 'pro' | 'school';
  shortLabel: string;
  badgeTitle: string;
  packageName: string;
  unitPrice: number;
  priceShort: string;
  durationLabel: string;
  benefits: string[];
}

export interface RealtimePaymentOrder {
  orderId: string;
  uid: string;
  email: string;
  displayName: string;
  packageId: PaymentPackageId;
  packageName: string;
  quantity: number;
  amount: number;
  transferContent: string;
  status: PaymentOrderStatus;
  receiptImage: string;
  createdAt: string;
  planTier?: 'plus' | 'pro' | 'school';
  routeId?: string;
  siteId?: string;
  scopeLabel?: string;
  schoolName?: string;
  schoolProvince?: string;
  ticketCode?: string;
  rejectionReason?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  emailSent?: boolean;
  notificationSent?: boolean;
  popupNotified?: boolean;
  updatedAt?: string;
}

export interface UserTicketsBundle {
  uid: string;
  email: string;
  displayName?: string;
  tier: SubscriptionPlanLevel;
  unlockedSiteIds: string[];
  unlockedRouteIds: string[];
  hasSchoolPackage: boolean;
  schoolName?: string;
  schoolCode?: string;
  ticketCodes: string[];
  activeOrderIds: string[];
  notifiedOrderIds: string[];
  updatedAt: string;
}

export const VIETQR_RECIPIENT = {
  accountHolder: 'HOANG DI THUY AN',
  channelLabel: 'MoMo / VietQR Napas 247',
  accountMasked: '*******040',
  qrPublicPath: '/images/qr-thanh-toan.png',
  qrGithubFallbackPath:
    'https://raw.githubusercontent.com/hoanghailqd2026-beep/dau-an-viet-3dv4/main/public/images/qr-thanh-toan.png',
} as const;

export const PAYMENT_PACKAGES: Record<PaymentPackageId, PaymentPackageOption> = {
  student_25k: {
    packageId: 'student_25k',
    planTier: 'plus',
    shortLabel: 'Gói Học sinh · 25k',
    badgeTitle: 'GÓI HỌC SINH',
    packageName: 'Gói Học sinh (1 tuyến chuyên đề)',
    unitPrice: 25_000,
    priceShort: '25k',
    durationLabel: '30 ngày',
    benefits: [
      'Mở khóa trọn vẹn 1 tuyến di tích chuyên đề (dùng trong 30 ngày)',
      'Bóc tách 3D 4 tầng, chế độ X-Ray & thuyết minh âm thanh 3 ngôn ngữ',
      'Sử Quan Dấu Ấn nâng cao (Gemini 3.5) & lưu dấu chứng nhận hành trình',
    ],
  },
  self_guided_59k: {
    packageId: 'self_guided_59k',
    planTier: 'pro',
    shortLabel: 'Gói Tự túc · 59k',
    badgeTitle: 'GÓI TỰ TÚC',
    packageName: 'Gói Tự túc (Toàn bộ 17 di tích & 9 tuyến)',
    unitPrice: 59_000,
    priceShort: '59k',
    durationLabel: '90 ngày',
    benefits: [
      'Mở khóa toàn bộ 17 di tích & 9 hành trình di sản (dùng trong 90 ngày)',
      'Bóc tách kiến trúc 3D, X-Ray kết cấu & thuyết minh đa ngữ không giới hạn',
      'Sử Quan Dấu Ấn chuyên sâu (Gemini 4 Hydrogen) & Hộ chiếu Di sản số',
    ],
  },
  classroom_500k: {
    packageId: 'classroom_500k',
    planTier: 'school',
    shortLabel: 'Gói Ultra (Lớp học · 500k)',
    badgeTitle: 'GÓI ULTRA',
    packageName: 'Gói Ultra (Lớp học · 35 tài khoản học sinh / học kỳ)',
    unitPrice: 500_000,
    priceShort: '500k',
    durationLabel: '1 học kỳ',
    benefits: [
      'Cấp quyền Gói Pro cho 35 tài khoản học sinh & giáo viên trong 1 học kỳ',
      'Độc quyền xem, làm bài, in & tải Ngân hàng 100 câu hỏi kèm đáp án (6 chuyên đề · THCS đến Đại học · 3 ngôn ngữ VI/EN/ZH)',
      'Trung tâm Quản lý Lớp Ultra: giao nhiệm vụ, theo dõi tiến độ & xuất CSV',
    ],
  },
};

export const PAYMENT_PACKAGE_LIST: PaymentPackageOption[] = [
  PAYMENT_PACKAGES.student_25k,
  PAYMENT_PACKAGES.self_guided_59k,
  PAYMENT_PACKAGES.classroom_500k,
];

export const TGDS_USER_ORDERS_PREFIX = 'tgds_orders_';
export const TGDS_USER_TICKETS_PREFIX = 'tgds_tickets_';
export const ACTIVE_WATCHING_ORDER_PREFIX = 'dau_an_viet_active_payment_order_';
export const APPLIED_PAID_ORDERS_PREFIX = 'dau_an_viet_applied_paid_orders_';

// Legacy shared keys cleared on first run to enforce strict per-uid isolation
const LEGACY_SHARED_ORDERS_KEY = 'tgds_payment_orders';
const LEGACY_SHARED_CACHE_KEY = 'dau_an_viet_rtdb_payment_orders_cache_v1';
const LEGACY_ACTIVE_WATCHING_KEY = 'dau_an_viet_active_payment_order_v1';
const LEGACY_APPLIED_ORDERS_KEY = 'dau_an_viet_applied_paid_orders_v1';

export const RTDB_ORDERS_UPDATED_EVENT = 'dau-an-viet-rtdb-payment-orders-updated';
export const USER_TICKETS_UPDATED_EVENT = 'dau-an-viet-user-tickets-updated';

const ORDER_RATE_STORAGE_PREFIX = 'tgds_order_rate_';
const ORDER_NOTIFY_SENT_PREFIX = 'tgds_order_notify_sent_';
export const ORDER_CREATION_COOLDOWN_SEC = 60;
export const MAX_UNPAID_ORDERS_PER_DAY = 5;
export const MIN_ORDER_AMOUNT_VND = 25_000;
export const MAX_ORDER_AMOUNT_VND = 5_000_000;
export const MAX_ORDER_QUANTITY = 50;

const CLOUD_OP_TIMEOUT_MS = 3000;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
  };
}

function logFirestoreDiagnostic(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: firebaseAuth.currentUser?.uid,
      email: firebaseAuth.currentUser?.email,
      emailVerified: firebaseAuth.currentUser?.emailVerified,
    },
  };
  console.warn('[VietQR Firestore Diagnostic]', JSON.stringify(errInfo));
}

function getOrdersFirestore(): Firestore | null {
  return getAppFirestore();
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = CLOUD_OP_TIMEOUT_MS, label = 'cloud'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = globalThis.setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms (${label})`));
    }, timeoutMs);
    promise.then(
      (val) => {
        globalThis.clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        globalThis.clearTimeout(timer);
        reject(err);
      }
    );
  });
}

function emitWindowEvent<T = unknown>(name: string, detail?: T): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(name, detail !== undefined ? { detail } : undefined));
  }
}

function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

function normalizeUidScope(uid?: string | null): string {
  const raw = (uid || '').trim();
  if (!raw || raw === 'guest') return '';
  return raw;
}

export function getUserOrdersStorageKey(uid: string): string {
  return `${TGDS_USER_ORDERS_PREFIX}${normalizeUidScope(uid)}`;
}

export function getUserTicketsStorageKey(uid: string): string {
  return `${TGDS_USER_TICKETS_PREFIX}${normalizeUidScope(uid)}`;
}

function getActiveWatchingOrderStorageKey(uid: string): string {
  return `${ACTIVE_WATCHING_ORDER_PREFIX}${normalizeUidScope(uid)}`;
}

function getAppliedPaidOrdersStorageKey(uid: string): string {
  return `${APPLIED_PAID_ORDERS_PREFIX}${normalizeUidScope(uid)}`;
}

let hasMigratedLegacyStorage = false;

/**
 * One-time cleanup: attributes any legacy shared localStorage orders strictly
 * to their own `tgds_orders_${order.uid}` bucket and deletes legacy shared keys.
 */
function ensureLegacySharedOrdersIsolated(): void {
  if (hasMigratedLegacyStorage || typeof window === 'undefined') return;
  hasMigratedLegacyStorage = true;
  try {
    const legacyPrimary = readLocalJson<unknown>(LEGACY_SHARED_ORDERS_KEY, null);
    const legacyCache = readLocalJson<unknown>(LEGACY_SHARED_CACHE_KEY, null);
    const combined = {
      ...parseRawOrdersCollection(legacyCache),
      ...parseRawOrdersCollection(legacyPrimary),
    };
    for (const order of Object.values(combined)) {
      const uid = normalizeUidScope(order.uid);
      if (!uid) continue;
      const key = getUserOrdersStorageKey(uid);
      const existing = parseRawOrdersCollection(readLocalJson<unknown>(key, []));
      existing[order.orderId] = pickFresherOrder(existing[order.orderId], order);
      writeLocalJson(
        key,
        Object.values(existing).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      );
    }
    window.localStorage.removeItem(LEGACY_SHARED_ORDERS_KEY);
    window.localStorage.removeItem(LEGACY_SHARED_CACHE_KEY);
    window.localStorage.removeItem(LEGACY_ACTIVE_WATCHING_KEY);
    window.localStorage.removeItem(LEGACY_APPLIED_ORDERS_KEY);
  } catch {
    // ignore migration cleanup errors
  }
}

export function formatVnd(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return `${safe.toLocaleString('vi-VN')} đ`;
}

export function formatVndCompact(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return `${safe.toLocaleString('vi-VN')}Đ`;
}

export function mapPlanTierToPackageId(tier?: 'plus' | 'pro' | 'school'): PaymentPackageId {
  if (tier === 'school') return 'classroom_500k';
  if (tier === 'plus') return 'student_25k';
  return 'self_guided_59k';
}

export function generateTgdsOrderId(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `TGDS-${suffix}`;
}

export function getActiveWatchingOrderId(uid?: string | null): string | null {
  if (typeof window === 'undefined') return null;
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return null;
  try {
    const raw = window.localStorage.getItem(getActiveWatchingOrderStorageKey(cleanUid));
    return raw && raw.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

export function setActiveWatchingOrderId(orderId: string | null, uid?: string | null): void {
  if (typeof window === 'undefined') return;
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return;
  try {
    const key = getActiveWatchingOrderStorageKey(cleanUid);
    if (!orderId) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, orderId);
    }
  } catch {
    // ignore
  }
}

export function isPaidOrderAlreadyApplied(orderId: string, uid?: string | null): boolean {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid || !orderId) return false;
  const ids = readLocalJson<string[]>(getAppliedPaidOrdersStorageKey(cleanUid), []);
  return Array.isArray(ids) && ids.includes(orderId);
}

export function markPaidOrderApplied(orderId: string, uid?: string | null): void {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid || !orderId) return;
  const key = getAppliedPaidOrdersStorageKey(cleanUid);
  const ids = readLocalJson<string[]>(key, []);
  const next = Array.from(new Set([orderId, ...(Array.isArray(ids) ? ids : [])])).slice(0, 100);
  writeLocalJson(key, next);
}

export function loadUserTicketsBundle(uid?: string | null): UserTicketsBundle | null {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return null;
  const raw = readLocalJson<Partial<UserTicketsBundle> | null>(
    getUserTicketsStorageKey(cleanUid),
    null
  );
  if (!raw || typeof raw !== 'object') return null;
  return {
    uid: typeof raw.uid === 'string' && raw.uid ? raw.uid : cleanUid,
    email: typeof raw.email === 'string' ? raw.email : '',
    displayName: typeof raw.displayName === 'string' ? raw.displayName : undefined,
    tier:
      raw.tier === 'school' || raw.tier === 'pro' || raw.tier === 'plus' || raw.tier === 'basic'
        ? raw.tier
        : 'basic',
    unlockedSiteIds: Array.isArray(raw.unlockedSiteIds) ? raw.unlockedSiteIds.filter(Boolean) : [],
    unlockedRouteIds: Array.isArray(raw.unlockedRouteIds) ? raw.unlockedRouteIds.filter(Boolean) : [],
    hasSchoolPackage: Boolean(raw.hasSchoolPackage),
    schoolName: typeof raw.schoolName === 'string' ? raw.schoolName : undefined,
    schoolCode: typeof raw.schoolCode === 'string' ? raw.schoolCode : undefined,
    ticketCodes: Array.isArray(raw.ticketCodes) ? raw.ticketCodes.filter(Boolean) : [],
    activeOrderIds: Array.isArray(raw.activeOrderIds) ? raw.activeOrderIds.filter(Boolean) : [],
    notifiedOrderIds: Array.isArray(raw.notifiedOrderIds) ? raw.notifiedOrderIds.filter(Boolean) : [],
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

function writeUserTicketsBundle(uid: string, bundle: UserTicketsBundle): void {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return;
  writeLocalJson(getUserTicketsStorageKey(cleanUid), bundle);
  emitWindowEvent(USER_TICKETS_UPDATED_EVENT, { uid: cleanUid });
}

export function shouldShowOrderUnlockPopup(
  order: RealtimePaymentOrder,
  currentUid?: string | null
): boolean {
  const cleanUid = normalizeUidScope(currentUid);
  if (!cleanUid || order.uid !== cleanUid) return false;
  if (order.status !== 'paid') return false;
  if (order.popupNotified) return false;
  const bundle = loadUserTicketsBundle(cleanUid);
  if (bundle?.notifiedOrderIds.includes(order.orderId)) {
    return false;
  }
  return true;
}

export async function markOrderPopupNotified(
  order: RealtimePaymentOrder,
  currentUid?: string | null
): Promise<void> {
  const targetUid = normalizeUidScope(currentUid || order.uid);
  if (!targetUid || order.uid !== targetUid) return;
  const nowIso = new Date().toISOString();

  // 1. Immediate per-user localStorage update so reload never repeats popup
  const updatedOrder: RealtimePaymentOrder = {
    ...order,
    popupNotified: true,
    updatedAt: nowIso,
  };
  upsertOrderForUser(targetUid, updatedOrder);

  const prevBundle = loadUserTicketsBundle(targetUid);
  const nextBundle: UserTicketsBundle = {
    uid: targetUid,
    email: prevBundle?.email || order.email,
    displayName: prevBundle?.displayName || order.displayName,
    tier: prevBundle?.tier || PAYMENT_PACKAGES[order.packageId].planTier,
    unlockedSiteIds: prevBundle?.unlockedSiteIds || [],
    unlockedRouteIds: prevBundle?.unlockedRouteIds || [],
    hasSchoolPackage: Boolean(
      prevBundle?.hasSchoolPackage || PAYMENT_PACKAGES[order.packageId].planTier === 'school'
    ),
    schoolName: prevBundle?.schoolName || order.schoolName,
    schoolCode: prevBundle?.schoolCode,
    ticketCodes: prevBundle?.ticketCodes || (order.ticketCode ? [order.ticketCode] : []),
    activeOrderIds: Array.from(new Set([order.orderId, ...(prevBundle?.activeOrderIds || [])])),
    notifiedOrderIds: Array.from(new Set([order.orderId, ...(prevBundle?.notifiedOrderIds || [])])),
    updatedAt: nowIso,
  };
  writeUserTicketsBundle(targetUid, nextBundle);

  // 2. Non-blocking Cloud Firestore popupNotified flag update
  const firestoreDb = getOrdersFirestore();
  if (firestoreDb) {
    const docPath = `payment_orders/${order.orderId}`;
    try {
      await withTimeout(
        setDoc(
          doc(collection(firestoreDb, 'payment_orders'), order.orderId),
          { popupNotified: true, updatedAt: nowIso },
          { merge: true }
        ),
        CLOUD_OP_TIMEOUT_MS,
        `firestore_popup_notified_${order.orderId}`
      );
    } catch (err) {
      logFirestoreDiagnostic(err, OperationType.UPDATE, docPath);
    }
  }
}

const STATUS_PRIORITY: Record<PaymentOrderStatus, number> = {
  pending: 1,
  waiting_approval: 2,
  rejected: 3,
  paid: 4,
};

function pickFresherOrder(
  existing: RealtimePaymentOrder | undefined,
  incoming: RealtimePaymentOrder
): RealtimePaymentOrder {
  if (!existing) return incoming;
  const existingRank = STATUS_PRIORITY[existing.status] || 0;
  const incomingRank = STATUS_PRIORITY[incoming.status] || 0;

  const existingTs =
    Date.parse(existing.updatedAt || existing.approvedAt || existing.submittedAt || existing.createdAt || '') ||
    0;
  const incomingTs =
    Date.parse(incoming.updatedAt || incoming.approvedAt || incoming.submittedAt || incoming.createdAt || '') ||
    0;

  const mergedPopupNotified = Boolean(existing.popupNotified || incoming.popupNotified);
  const mergedNotificationSent = Boolean(existing.notificationSent || incoming.notificationSent);

  if (existing.status === 'paid' && incoming.status !== 'paid') {
    return {
      ...existing,
      popupNotified: mergedPopupNotified,
      notificationSent: mergedNotificationSent,
    };
  }
  if (incoming.status === 'paid' && existing.status !== 'paid') {
    return {
      ...incoming,
      popupNotified: mergedPopupNotified,
      notificationSent: mergedNotificationSent,
    };
  }
  if (incomingTs > existingTs) {
    return {
      ...incoming,
      popupNotified: mergedPopupNotified,
      notificationSent: mergedNotificationSent,
    };
  }
  if (existingTs > incomingTs) {
    return {
      ...existing,
      popupNotified: mergedPopupNotified,
      notificationSent: mergedNotificationSent,
    };
  }
  const chosen = incomingRank >= existingRank ? incoming : existing;
  return {
    ...chosen,
    popupNotified: mergedPopupNotified,
    notificationSent: mergedNotificationSent,
  };
}

function parseRawOrdersCollection(raw: unknown): Record<string, RealtimePaymentOrder> {
  const out: Record<string, RealtimePaymentOrder> = {};
  if (!raw || typeof raw !== 'object') return out;
  const entries = Array.isArray(raw) ? raw : Object.values(raw as Record<string, unknown>);
  for (const item of entries) {
    const norm = normalizeRawOrder(item);
    if (norm) {
      out[norm.orderId] = pickFresherOrder(out[norm.orderId], norm);
    }
  }
  return out;
}

function loadUserOrderMap(uid: string): Record<string, RealtimePaymentOrder> {
  ensureLegacySharedOrdersIsolated();
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return {};
  const raw = readLocalJson<unknown>(getUserOrdersStorageKey(cleanUid), []);
  const map = parseRawOrdersCollection(raw);
  const filtered: Record<string, RealtimePaymentOrder> = {};
  for (const [id, order] of Object.entries(map)) {
    if (order.uid === cleanUid) {
      filtered[id] = order;
    }
  }
  return filtered;
}

export function loadLocalOrdersForUser(uid?: string | null): RealtimePaymentOrder[] {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return [];
  return Object.values(loadUserOrderMap(cleanUid)).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
}

function writeUserOrderMap(uid: string, map: Record<string, RealtimePaymentOrder>): void {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return;
  const sortedList = Object.values(map)
    .filter((o) => o.uid === cleanUid)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  writeLocalJson(getUserOrdersStorageKey(cleanUid), sortedList);
}

function upsertOrderForUser(uid: string, order: RealtimePaymentOrder): void {
  const cleanUid = normalizeUidScope(uid || order.uid);
  if (!cleanUid) return;
  const map = loadUserOrderMap(cleanUid);
  map[order.orderId] = pickFresherOrder(map[order.orderId], { ...order, uid: cleanUid });
  writeUserOrderMap(cleanUid, map);
  emitWindowEvent(RTDB_ORDERS_UPDATED_EVENT, { uid: cleanUid, order: map[order.orderId] });
}

function mergeRemoteOrdersForUser(
  uid: string,
  remoteOrders: RealtimePaymentOrder[]
): RealtimePaymentOrder[] {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return [];
  const map = loadUserOrderMap(cleanUid);
  for (const item of remoteOrders) {
    if (item && item.orderId && item.uid === cleanUid) {
      map[item.orderId] = pickFresherOrder(map[item.orderId], item);
    }
  }
  writeUserOrderMap(cleanUid, map);
  emitWindowEvent(RTDB_ORDERS_UPDATED_EVENT, { uid: cleanUid });
  return Object.values(map).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/**
 * Admin-only local aggregation across all per-uid storage keys (`tgds_orders_*`).
 */
function readAllLocalOrdersMapAcrossUids(): Record<string, RealtimePaymentOrder> {
  ensureLegacySharedOrdersIsolated();
  const merged: Record<string, RealtimePaymentOrder> = {};
  if (typeof window === 'undefined') return merged;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(TGDS_USER_ORDERS_PREFIX)) continue;
      const map = parseRawOrdersCollection(readLocalJson<unknown>(key, []));
      for (const [id, order] of Object.entries(map)) {
        merged[id] = pickFresherOrder(merged[id], order);
      }
    }
  } catch {
    // ignore storage iteration errors
  }
  return merged;
}

function mergeAdminRemoteOrdersIntoPerUidStorage(
  remoteOrders: RealtimePaymentOrder[]
): RealtimePaymentOrder[] {
  const touchedUids = new Set<string>();
  const userBuckets: Record<string, Record<string, RealtimePaymentOrder>> = {};

  for (const item of remoteOrders) {
    if (!item || !item.orderId) continue;
    const cleanUid = normalizeUidScope(item.uid);
    if (!cleanUid) continue;
    if (!userBuckets[cleanUid]) {
      userBuckets[cleanUid] = loadUserOrderMap(cleanUid);
    }
    userBuckets[cleanUid][item.orderId] = pickFresherOrder(userBuckets[cleanUid][item.orderId], item);
    touchedUids.add(cleanUid);
  }

  for (const uid of touchedUids) {
    writeUserOrderMap(uid, userBuckets[uid]);
  }

  const all = readAllLocalOrdersMapAcrossUids();
  for (const item of remoteOrders) {
    if (item && item.orderId) {
      all[item.orderId] = pickFresherOrder(all[item.orderId], item);
    }
  }

  emitWindowEvent(RTDB_ORDERS_UPDATED_EVENT, { scope: 'admin_all' });
  return Object.values(all).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

function normalizeRawOrder(raw: unknown): RealtimePaymentOrder | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<RealtimePaymentOrder>;
  if (!r.orderId || typeof r.orderId !== 'string') return null;

  const pkgId: PaymentPackageId =
    r.packageId === 'student_25k' ||
    r.packageId === 'self_guided_59k' ||
    r.packageId === 'classroom_500k'
      ? r.packageId
      : mapPlanTierToPackageId(r.planTier);
  const pkg = PAYMENT_PACKAGES[pkgId];
  const status: PaymentOrderStatus =
    r.status === 'pending' ||
    r.status === 'waiting_approval' ||
    r.status === 'paid' ||
    r.status === 'rejected'
      ? r.status
      : 'pending';
  const quantity =
    typeof r.quantity === 'number' && Number.isFinite(r.quantity) && r.quantity >= 1
      ? Math.round(r.quantity)
      : 1;
  const amount =
    typeof r.amount === 'number' && Number.isFinite(r.amount) && r.amount > 0
      ? Math.round(r.amount)
      : pkg.unitPrice * quantity;

  return {
    orderId: r.orderId,
    uid: typeof r.uid === 'string' ? r.uid : '',
    email: typeof r.email === 'string' ? r.email.toLowerCase().trim() : '',
    displayName: typeof r.displayName === 'string' ? r.displayName : 'Khách tham quan',
    packageId: pkgId,
    packageName: typeof r.packageName === 'string' && r.packageName ? r.packageName : pkg.packageName,
    quantity,
    amount,
    transferContent:
      typeof r.transferContent === 'string' && r.transferContent ? r.transferContent : r.orderId,
    status,
    receiptImage: typeof r.receiptImage === 'string' ? r.receiptImage : '',
    createdAt: typeof r.createdAt === 'string' && r.createdAt ? r.createdAt : new Date().toISOString(),
    planTier: r.planTier || pkg.planTier,
    routeId: typeof r.routeId === 'string' ? r.routeId : undefined,
    siteId: typeof r.siteId === 'string' ? r.siteId : undefined,
    scopeLabel: typeof r.scopeLabel === 'string' ? r.scopeLabel : undefined,
    schoolName: typeof r.schoolName === 'string' ? r.schoolName : undefined,
    schoolProvince: typeof r.schoolProvince === 'string' ? r.schoolProvince : undefined,
    ticketCode: typeof r.ticketCode === 'string' ? r.ticketCode : undefined,
    rejectionReason: typeof r.rejectionReason === 'string' ? r.rejectionReason : undefined,
    submittedAt: typeof r.submittedAt === 'string' ? r.submittedAt : undefined,
    approvedAt: typeof r.approvedAt === 'string' ? r.approvedAt : undefined,
    approvedBy: typeof r.approvedBy === 'string' ? r.approvedBy : undefined,
    emailSent: Boolean(r.emailSent),
    notificationSent: Boolean(r.notificationSent),
    popupNotified: Boolean(r.popupNotified),
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : undefined,
  };
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

const ALLOWED_RECEIPT_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_RECEIPT_RAW_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Validates MIME type (JPEG/PNG/WEBP only) and raw file size (<= 5MB),
 * then compresses via Canvas so the Base64 Data URI stays under 150 KB.
 */
export function compressReceiptImageToBase64(file: File, maxBytes = 150_000): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_RECEIPT_MIME_TYPES.has(file.type)) {
      reject(new Error('Chỉ chấp nhận ảnh biên lai định dạng JPG, PNG hoặc WEBP.'));
      return;
    }
    if (file.size > MAX_RECEIPT_RAW_BYTES) {
      reject(
        new Error('Ảnh biên lai vượt quá dung lượng tối đa 5MB. Vui lòng chọn ảnh nhẹ hơn.')
      );
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh biên lai.'));
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : '';
      if (!src) {
        reject(new Error('Dữ liệu ảnh biên lai không hợp lệ.'));
        return;
      }
      const img = new Image();
      img.onerror = () => reject(new Error('Không thể giải mã tệp ảnh biên lai.'));
      img.onload = () => {
        const attempts: Array<{ maxDim: number; quality: number }> = [
          { maxDim: 1100, quality: 0.8 },
          { maxDim: 920, quality: 0.7 },
          { maxDim: 760, quality: 0.6 },
          { maxDim: 640, quality: 0.5 },
          { maxDim: 520, quality: 0.42 },
          { maxDim: 420, quality: 0.35 },
          { maxDim: 320, quality: 0.3 },
          { maxDim: 240, quality: 0.25 },
        ];

        let lastResult = '';
        for (const attempt of attempts) {
          const scale = Math.min(1, attempt.maxDim / Math.max(img.width || 1, img.height || 1));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Trình duyệt không hỗ trợ nén ảnh biên lai.'));
            return;
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', attempt.quality);
          lastResult = dataUrl;
          if (dataUrl.length <= maxBytes) {
            resolve(dataUrl);
            return;
          }
        }
        if (lastResult && lastResult.length <= maxBytes) {
          resolve(lastResult);
        } else {
          reject(
            new Error(
              'Ảnh biên lai sau khi nén vẫn vượt quá 150KB. Vui lòng chọn ảnh có độ phân giải thấp hơn.'
            )
          );
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

async function writeOrderToCloudBackends(
  order: RealtimePaymentOrder,
  mode: 'create' | 'merge'
): Promise<boolean> {
  const cleanPayload = stripUndefined(order as unknown as Record<string, unknown>);
  let synced = false;

  const firestoreDb = getOrdersFirestore();
  if (firestoreDb) {
    const docPath = `payment_orders/${order.orderId}`;
    try {
      const orderDocRef = doc(collection(firestoreDb, 'payment_orders'), order.orderId);
      await withTimeout(
        mode === 'create'
          ? setDoc(orderDocRef, cleanPayload)
          : setDoc(orderDocRef, cleanPayload, { merge: true }),
        CLOUD_OP_TIMEOUT_MS,
        `firestore_${mode}_${order.orderId}`
      );
      synced = true;
    } catch (err) {
      logFirestoreDiagnostic(err, mode === 'create' ? OperationType.CREATE : OperationType.UPDATE, docPath);
    }
  }

  if (isFirebaseDbConfigured()) {
    const rtdb = getRealtimeDb();
    if (rtdb) {
      try {
        await withTimeout(
          mode === 'create'
            ? set(ref(rtdb, `payment_orders/${order.orderId}`), cleanPayload)
            : update(ref(rtdb, `payment_orders/${order.orderId}`), cleanPayload),
          CLOUD_OP_TIMEOUT_MS,
          `rtdb_${mode}_${order.orderId}`
        );
        synced = true;
      } catch {
        // Fallback REST below
      }
    }
    if (!synced && typeof fetch === 'function') {
      try {
        const res = await withTimeout(
          fetch(`${FIREBASE_DB_URL}/payment_orders/${order.orderId}.json`, {
            method: mode === 'create' ? 'PUT' : 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanPayload),
          }),
          CLOUD_OP_TIMEOUT_MS,
          `rtdb_rest_${mode}_${order.orderId}`
        );
        if (res.ok) synced = true;
      } catch {
        // ignore REST fallback errors
      }
    }
  }

  return synced;
}

// ============================================================================
// 1. ORDER ANTI-SPAM GUARDS & CREATE PENDING ORDER
// ============================================================================
export function getMaxQuantityForPackage(packageId: PaymentPackageId): number {
  // Keeps order totalAmount <= 5,000,000 VND and quantity <= 50 per Firestore security rules
  return packageId === 'classroom_500k' ? 10 : MAX_ORDER_QUANTITY;
}

function getLocalTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface OrderRateSnapshot {
  lastCreatedAt: number;
  dailyDate: string;
  dailyCreatedCount: number;
}

function readOrderRateSnapshot(uid: string): OrderRateSnapshot {
  const cleanUid = normalizeUidScope(uid);
  const today = getLocalTodayKey();
  if (!cleanUid) {
    return { lastCreatedAt: 0, dailyDate: today, dailyCreatedCount: 0 };
  }
  const raw = readLocalJson<Partial<OrderRateSnapshot> | null>(
    `${ORDER_RATE_STORAGE_PREFIX}${cleanUid}`,
    null
  );
  if (!raw || typeof raw !== 'object' || raw.dailyDate !== today) {
    return {
      lastCreatedAt: typeof raw?.lastCreatedAt === 'number' ? raw.lastCreatedAt : 0,
      dailyDate: today,
      dailyCreatedCount: 0,
    };
  }
  return {
    lastCreatedAt: typeof raw.lastCreatedAt === 'number' ? raw.lastCreatedAt : 0,
    dailyDate: today,
    dailyCreatedCount: typeof raw.dailyCreatedCount === 'number' ? raw.dailyCreatedCount : 0,
  };
}

export interface OrderCreationGuardResult {
  allowed: boolean;
  reason?: 'cooldown' | 'daily_limit';
  retryAfterSec: number;
  dailyCount: number;
  dailyLimit: number;
}

export function getOrderCreationGuardStatus(uid?: string | null): OrderCreationGuardResult {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) {
    return {
      allowed: true,
      retryAfterSec: 0,
      dailyCount: 0,
      dailyLimit: MAX_UNPAID_ORDERS_PER_DAY,
    };
  }

  const rate = readOrderRateSnapshot(cleanUid);
  const todayKey = getLocalTodayKey();
  const unpaidOrdersToday = loadLocalOrdersForUser(cleanUid).filter((o) => {
    if (o.status === 'paid') return false;
    const d = new Date(o.createdAt);
    if (Number.isNaN(d.getTime())) return false;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
    return key === todayKey;
  }).length;

  const dailyCount = Math.max(rate.dailyCreatedCount, unpaidOrdersToday);
  const now = Date.now();
  const cooldownUntil = rate.lastCreatedAt + ORDER_CREATION_COOLDOWN_SEC * 1000;

  if (rate.lastCreatedAt > 0 && cooldownUntil > now) {
    return {
      allowed: false,
      reason: 'cooldown',
      retryAfterSec: Math.max(1, Math.ceil((cooldownUntil - now) / 1000)),
      dailyCount,
      dailyLimit: MAX_UNPAID_ORDERS_PER_DAY,
    };
  }

  if (dailyCount >= MAX_UNPAID_ORDERS_PER_DAY) {
    return {
      allowed: false,
      reason: 'daily_limit',
      retryAfterSec: 0,
      dailyCount,
      dailyLimit: MAX_UNPAID_ORDERS_PER_DAY,
    };
  }

  return {
    allowed: true,
    retryAfterSec: 0,
    dailyCount,
    dailyLimit: MAX_UNPAID_ORDERS_PER_DAY,
  };
}

export function recordOrderCreationTimestamp(uid?: string | null): void {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return;
  const prev = readOrderRateSnapshot(cleanUid);
  const today = getLocalTodayKey();
  const next: OrderRateSnapshot = {
    lastCreatedAt: Date.now(),
    dailyDate: today,
    dailyCreatedCount: (prev.dailyDate === today ? prev.dailyCreatedCount : 0) + 1,
  };
  writeLocalJson(`${ORDER_RATE_STORAGE_PREFIX}${cleanUid}`, next);
}

export function findActiveUnfinishedOrderForUser(uid?: string | null): RealtimePaymentOrder | null {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return null;
  const ownOrders = loadLocalOrdersForUser(cleanUid);
  return (
    ownOrders.find((o) => o.status === 'pending' || o.status === 'waiting_approval') || null
  );
}

export async function cancelUserUnfinishedOrder(
  orderId: string,
  uid?: string | null
): Promise<{ ok: boolean; syncedFirebase: boolean }> {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid || !orderId) return { ok: false, syncedFirebase: false };
  const map = loadUserOrderMap(cleanUid);
  const existing = map[orderId];
  if (!existing || existing.uid !== cleanUid) {
    return { ok: false, syncedFirebase: false };
  }
  if (existing.status === 'paid') {
    return { ok: false, syncedFirebase: false };
  }

  const nowIso = new Date().toISOString();
  const cancelledOrder: RealtimePaymentOrder = {
    ...existing,
    status: 'rejected',
    rejectionReason: 'Người mua chủ động hủy đơn cũ để tạo đơn mới.',
    updatedAt: nowIso,
  };
  upsertOrderForUser(cleanUid, cancelledOrder);
  if (getActiveWatchingOrderId(cleanUid) === orderId) {
    setActiveWatchingOrderId(null, cleanUid);
  }

  const syncedFirebase = await writeOrderToCloudBackends(cancelledOrder, 'merge');
  return { ok: true, syncedFirebase };
}

function hasSentOrderNotificationLocally(uid: string, orderId: string): boolean {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid || !orderId) return false;
  const ids = readLocalJson<string[]>(`${ORDER_NOTIFY_SENT_PREFIX}${cleanUid}`, []);
  return Array.isArray(ids) && ids.includes(orderId);
}

function markOrderNotificationSentLocally(uid: string, orderId: string): void {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid || !orderId) return;
  const key = `${ORDER_NOTIFY_SENT_PREFIX}${cleanUid}`;
  const ids = readLocalJson<string[]>(key, []);
  const next = Array.from(new Set([orderId, ...(Array.isArray(ids) ? ids : [])])).slice(0, 100);
  writeLocalJson(key, next);
}

export function buildLocalPendingPaymentOrder(params: {
  uid: string;
  email: string;
  displayName: string;
  packageId: PaymentPackageId;
  quantity: number;
  routeId?: string;
  siteId?: string;
  scopeLabel?: string;
  schoolName?: string;
  schoolProvince?: string;
}): RealtimePaymentOrder {
  const pkg = PAYMENT_PACKAGES[params.packageId];
  const maxQty = getMaxQuantityForPackage(params.packageId);
  const safeQty = Math.max(1, Math.min(maxQty, Math.round(params.quantity || 1)));
  const rawAmount = pkg.unitPrice * safeQty;
  const safeAmount = Math.max(MIN_ORDER_AMOUNT_VND, Math.min(MAX_ORDER_AMOUNT_VND, rawAmount));
  const orderId = generateTgdsOrderId();
  const nowIso = new Date().toISOString();
  const effectiveUid = firebaseAuth.currentUser?.uid || params.uid;

  const cleanEmail = (params.email || '').toLowerCase().trim();
  const order: RealtimePaymentOrder = {
    orderId,
    uid: effectiveUid,
    email: cleanEmail,
    displayName:
      params.displayName.trim() ||
      (cleanEmail ? cleanEmail.split('@')[0] : '') ||
      'Khách tham quan',
    packageId: pkg.packageId,
    packageName: pkg.packageName,
    quantity: safeQty,
    amount: safeAmount,
    transferContent: orderId,
    status: 'pending',
    receiptImage: '',
    createdAt: nowIso,
    planTier: pkg.planTier,
    routeId: params.routeId,
    siteId: params.siteId,
    scopeLabel: params.scopeLabel || pkg.packageName,
    schoolName: params.schoolName,
    schoolProvince: params.schoolProvince,
    notificationSent: false,
    popupNotified: false,
    updatedAt: nowIso,
  };

  upsertOrderForUser(effectiveUid, order);
  setActiveWatchingOrderId(order.orderId, effectiveUid);
  recordOrderCreationTimestamp(effectiveUid);
  return order;
}

export async function syncPendingPaymentOrderToCloud(
  order: RealtimePaymentOrder
): Promise<boolean> {
  return writeOrderToCloudBackends(order, 'create');
}

export async function createPendingPaymentOrder(params: {
  uid: string;
  email: string;
  displayName: string;
  packageId: PaymentPackageId;
  quantity: number;
  routeId?: string;
  siteId?: string;
  scopeLabel?: string;
  schoolName?: string;
  schoolProvince?: string;
}): Promise<{ ok: boolean; order: RealtimePaymentOrder; syncedFirebase: boolean; error?: string }> {
  const order = buildLocalPendingPaymentOrder(params);
  const syncedFirebase = await syncPendingPaymentOrderToCloud(order);
  return { ok: true, order, syncedFirebase };
}

// ============================================================================
// 2. BUYER SUBMITS TRANSFER CONFIRMATION (status: "waiting_approval")
//    STRICTLY DOES NOT UNLOCK TICKETS! EmailJS sent at most ONCE per orderId.
// ============================================================================
export function buildLocalWaitingPaymentOrder(
  order: RealtimePaymentOrder,
  receiptImage: string
): RealtimePaymentOrder {
  const nowIso = new Date().toISOString();
  const effectiveUid = firebaseAuth.currentUser?.uid || order.uid;
  const updated: RealtimePaymentOrder = {
    ...order,
    uid: effectiveUid,
    status: 'waiting_approval',
    receiptImage: receiptImage || order.receiptImage || '',
    rejectionReason: '',
    submittedAt: nowIso,
    notificationSent: Boolean(order.notificationSent),
    updatedAt: nowIso,
  };

  upsertOrderForUser(effectiveUid, updated);
  setActiveWatchingOrderId(updated.orderId, effectiveUid);
  return updated;
}

export async function syncWaitingPaymentOrderToCloud(
  updated: RealtimePaymentOrder
): Promise<boolean> {
  const effectiveUid = normalizeUidScope(firebaseAuth.currentUser?.uid || updated.uid);
  const alreadySent =
    Boolean(updated.notificationSent) ||
    hasSentOrderNotificationLocally(effectiveUid, updated.orderId);

  const payloadWithFlag: RealtimePaymentOrder = {
    ...updated,
    notificationSent: true,
  };

  if (!alreadySent) {
    markOrderNotificationSentLocally(effectiveUid, updated.orderId);
    upsertOrderForUser(effectiveUid, payloadWithFlag);
  }

  const syncedFirebase = await writeOrderToCloudBackends(payloadWithFlag, 'merge');

  if (!alreadySent) {
    void withTimeout(
      sendOrderThankYouEmail(
        {
          toEmail: PRIMARY_ADMIN_EMAIL,
          customerName: `[CHỜ DUYỆT ĐƠN] ${updated.displayName} (${
            updated.email || `Facebook UID: ${updated.uid.slice(0, 10)}`
          })`,
          planName: `${updated.packageName} × ${updated.quantity} vé`,
          scope: `Khách đã bấm xác nhận chuyển khoản · Nội dung: ${updated.transferContent}`,
          orderCode: updated.orderId,
          amount: formatVnd(updated.amount),
        },
        { requireEnabled: false }
      ),
      CLOUD_OP_TIMEOUT_MS,
      'emailjs_waiting_notify'
    ).catch(() => {
      // ignore non-critical email errors
    });
  }

  return syncedFirebase;
}

export async function submitPaymentTransferConfirmation(
  order: RealtimePaymentOrder,
  receiptImage: string
): Promise<{ ok: boolean; order: RealtimePaymentOrder; syncedFirebase: boolean }> {
  const updated = buildLocalWaitingPaymentOrder(order, receiptImage);
  const syncedFirebase = await syncWaitingPaymentOrderToCloud(updated);
  return { ok: true, order: { ...updated, notificationSent: true }, syncedFirebase };
}

// ============================================================================
// 3. PER-UID USER QUERIES & SUBSCRIPTIONS (STRICT UID ISOLATION)
// ============================================================================
export async function fetchUserPaymentOrders(uid: string): Promise<RealtimePaymentOrder[]> {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return [];

  const firestoreDb = getOrdersFirestore();
  if (firestoreDb && firebaseAuth.currentUser && firebaseAuth.currentUser.uid === cleanUid) {
    try {
      const userOrdersQuery = query(
        collection(firestoreDb, 'payment_orders'),
        where('uid', '==', cleanUid)
      );
      const snap = await withTimeout(
        getDocs(userOrdersQuery),
        CLOUD_OP_TIMEOUT_MS,
        `firestore_user_orders_${cleanUid}`
      );
      const remoteList: RealtimePaymentOrder[] = [];
      snap.forEach((docSnap) => {
        const norm = normalizeRawOrder(docSnap.data());
        if (norm && norm.uid === cleanUid) {
          remoteList.push(norm);
        }
      });
      if (remoteList.length > 0) {
        return mergeRemoteOrdersForUser(cleanUid, remoteList);
      }
    } catch (err) {
      logFirestoreDiagnostic(err, OperationType.LIST, 'payment_orders');
    }
  }

  return loadLocalOrdersForUser(cleanUid);
}

export function subscribeToUserPaymentOrders(
  uid: string | undefined | null,
  callback: (orders: RealtimePaymentOrder[]) => void
): () => void {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) {
    callback([]);
    return () => {};
  }

  let disposed = false;
  let unsubFirestore: FirestoreUnsubscribe | null = null;

  const emitLocal = () => {
    if (disposed) return;
    callback(loadLocalOrdersForUser(cleanUid));
  };
  emitLocal();

  const firestoreDb = getOrdersFirestore();
  if (firestoreDb && firebaseAuth.currentUser && firebaseAuth.currentUser.uid === cleanUid) {
    try {
      const userOrdersQuery = query(
        collection(firestoreDb, 'payment_orders'),
        where('uid', '==', cleanUid)
      );
      unsubFirestore = onSnapshot(
        userOrdersQuery,
        (snapshot) => {
          if (disposed) return;
          const remoteList: RealtimePaymentOrder[] = [];
          snapshot.forEach((docSnap) => {
            const norm = normalizeRawOrder(docSnap.data());
            if (norm && norm.uid === cleanUid) {
              remoteList.push(norm);
            }
          });
          if (remoteList.length > 0) {
            const merged = mergeRemoteOrdersForUser(cleanUid, remoteList);
            if (!disposed) callback(merged);
          } else {
            emitLocal();
          }
        },
        (err) => {
          logFirestoreDiagnostic(err, OperationType.LIST, 'payment_orders');
        }
      );
    } catch {
      unsubFirestore = null;
    }
  }

  void fetchUserPaymentOrders(cleanUid).then((list) => {
    if (!disposed) callback(list);
  });

  const userOrdersKey = getUserOrdersStorageKey(cleanUid);
  const handleLocalEvent = (e: Event) => {
    const detail = (e as CustomEvent<{ uid?: string; scope?: string }>).detail;
    if (!detail || detail.scope === 'admin_all' || detail.uid === cleanUid) {
      emitLocal();
    }
  };
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === null || e.key === userOrdersKey) {
      emitLocal();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(RTDB_ORDERS_UPDATED_EVENT, handleLocalEvent);
    window.addEventListener('storage', handleStorageEvent);
  }

  return () => {
    disposed = true;
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener(RTDB_ORDERS_UPDATED_EVENT, handleLocalEvent);
      window.removeEventListener('storage', handleStorageEvent);
    }
  };
}

export async function fetchSinglePaymentOrderRest(
  orderId: string,
  expectedUid?: string | null
): Promise<RealtimePaymentOrder | null> {
  const cleanUid = normalizeUidScope(expectedUid);
  if (!orderId || !cleanUid) return null;

  const firestoreDb = getOrdersFirestore();
  if (firestoreDb && firebaseAuth.currentUser && firebaseAuth.currentUser.uid === cleanUid) {
    const docPath = `payment_orders/${orderId}`;
    try {
      const snap = await withTimeout(
        getDoc(doc(collection(firestoreDb, 'payment_orders'), orderId)),
        CLOUD_OP_TIMEOUT_MS,
        `firestore_get_${orderId}`
      );
      if (snap.exists()) {
        const normalized = normalizeRawOrder(snap.data());
        if (normalized && normalized.uid === cleanUid) {
          upsertOrderForUser(cleanUid, normalized);
          return loadUserOrderMap(cleanUid)[orderId] || normalized;
        }
      }
    } catch (err) {
      logFirestoreDiagnostic(err, OperationType.GET, docPath);
    }
  }

  return loadUserOrderMap(cleanUid)[orderId] || null;
}

export function subscribeToPaymentOrder(
  orderId: string,
  callback: (order: RealtimePaymentOrder | null) => void,
  expectedUid?: string | null
): () => void {
  const cleanUid = normalizeUidScope(expectedUid);
  if (!orderId || !cleanUid) return () => {};
  let disposed = false;
  let unsubFirestore: FirestoreUnsubscribe | null = null;
  let unsubRtdb: RtdbUnsubscribe | null = null;

  const emitFromLocal = () => {
    if (disposed) return;
    const latest = loadUserOrderMap(cleanUid)[orderId];
    if (latest && latest.uid === cleanUid) {
      callback(latest);
    }
  };
  emitFromLocal();

  const firestoreDb = getOrdersFirestore();
  if (firestoreDb && firebaseAuth.currentUser && firebaseAuth.currentUser.uid === cleanUid) {
    const docPath = `payment_orders/${orderId}`;
    try {
      const docRef = doc(collection(firestoreDb, 'payment_orders'), orderId);
      unsubFirestore = onSnapshot(
        docRef,
        (snapshot) => {
          if (disposed || !snapshot.exists()) return;
          const normalized = normalizeRawOrder(snapshot.data());
          if (normalized && normalized.uid === cleanUid) {
            upsertOrderForUser(cleanUid, normalized);
            emitFromLocal();
          }
        },
        (err) => {
          logFirestoreDiagnostic(err, OperationType.GET, docPath);
        }
      );
    } catch {
      unsubFirestore = null;
    }
  }

  if (isFirebaseDbConfigured()) {
    const rtdb = getRealtimeDb();
    if (rtdb) {
      try {
        const orderRef = ref(rtdb, `payment_orders/${orderId}`);
        unsubRtdb = onValue(
          orderRef,
          (snapshot) => {
            if (disposed) return;
            const normalized = normalizeRawOrder(snapshot.val());
            if (normalized && normalized.uid === cleanUid) {
              upsertOrderForUser(cleanUid, normalized);
              emitFromLocal();
            }
          },
          () => {
            // fallback to Firestore / localStorage
          }
        );
      } catch {
        unsubRtdb = null;
      }
    }
  }

  const userOrdersKey = getUserOrdersStorageKey(cleanUid);
  const handleLocalEvent = (e: Event) => {
    const detail = (e as CustomEvent<{ uid?: string; scope?: string }>).detail;
    if (!detail || detail.scope === 'admin_all' || detail.uid === cleanUid) {
      emitFromLocal();
    }
  };
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === null || e.key === userOrdersKey) {
      emitFromLocal();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(RTDB_ORDERS_UPDATED_EVENT, handleLocalEvent);
    window.addEventListener('storage', handleStorageEvent);
  }

  return () => {
    disposed = true;
    if (unsubFirestore) unsubFirestore();
    if (unsubRtdb) unsubRtdb();
    if (typeof window !== 'undefined') {
      window.removeEventListener(RTDB_ORDERS_UPDATED_EVENT, handleLocalEvent);
      window.removeEventListener('storage', handleStorageEvent);
    }
  };
}

// ============================================================================
// 4. ADMIN-ONLY ALL-ORDERS QUERIES & SUBSCRIPTIONS
// ============================================================================
export async function fetchAllPaymentOrdersRest(): Promise<RealtimePaymentOrder[]> {
  const localAllMap = readAllLocalOrdersMapAcrossUids();
  const remoteList: RealtimePaymentOrder[] = [];

  const firestoreDb = getOrdersFirestore();
  if (firestoreDb && firebaseAuth.currentUser) {
    try {
      const snap = await withTimeout(
        getDocs(collection(firestoreDb, 'payment_orders')),
        CLOUD_OP_TIMEOUT_MS,
        'firestore_admin_list_orders'
      );
      snap.forEach((docSnap) => {
        const norm = normalizeRawOrder(docSnap.data());
        if (norm) remoteList.push(norm);
      });
    } catch (err) {
      logFirestoreDiagnostic(err, OperationType.LIST, 'payment_orders');
    }
  }

  if (isFirebaseDbConfigured() && typeof fetch === 'function') {
    try {
      const res = await withTimeout(
        fetch(`${FIREBASE_DB_URL}/payment_orders.json`, {
          method: 'GET',
          cache: 'no-store',
        }),
        CLOUD_OP_TIMEOUT_MS,
        'rtdb_list_orders'
      );
      if (res.ok) {
        const raw = (await res.json()) as Record<string, unknown> | null;
        if (raw && typeof raw === 'object') {
          for (const val of Object.values(raw)) {
            const norm = normalizeRawOrder(val);
            if (norm) remoteList.push(norm);
          }
        }
      }
    } catch {
      // keep local fallback
    }
  }

  if (remoteList.length > 0) {
    return mergeAdminRemoteOrdersIntoPerUidStorage(remoteList);
  }

  return Object.values(localAllMap).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function subscribeToAllPaymentOrders(
  callback: (orders: RealtimePaymentOrder[]) => void
): () => void {
  let disposed = false;
  let unsubFirestore: FirestoreUnsubscribe | null = null;
  let unsubRtdb: RtdbUnsubscribe | null = null;

  const emitFromAllLocal = () => {
    if (disposed) return;
    const latest = Object.values(readAllLocalOrdersMapAcrossUids()).sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
    callback(latest);
  };

  emitFromAllLocal();

  const firestoreDb = getOrdersFirestore();
  if (firestoreDb && firebaseAuth.currentUser) {
    try {
      unsubFirestore = onSnapshot(
        collection(firestoreDb, 'payment_orders'),
        (snapshot) => {
          if (disposed) return;
          const list: RealtimePaymentOrder[] = [];
          snapshot.forEach((docSnap) => {
            const norm = normalizeRawOrder(docSnap.data());
            if (norm) list.push(norm);
          });
          if (list.length > 0) {
            const merged = mergeAdminRemoteOrdersIntoPerUidStorage(list);
            if (!disposed) callback(merged);
          } else {
            emitFromAllLocal();
          }
        },
        (err) => {
          logFirestoreDiagnostic(err, OperationType.LIST, 'payment_orders');
        }
      );
    } catch {
      unsubFirestore = null;
    }
  }

  if (isFirebaseDbConfigured()) {
    const rtdb = getRealtimeDb();
    if (rtdb) {
      try {
        const allRef = ref(rtdb, 'payment_orders');
        unsubRtdb = onValue(
          allRef,
          (snapshot) => {
            if (disposed) return;
            const val = snapshot.val() as Record<string, unknown> | null;
            const list: RealtimePaymentOrder[] = [];
            if (val && typeof val === 'object') {
              for (const entry of Object.values(val)) {
                const norm = normalizeRawOrder(entry);
                if (norm) list.push(norm);
              }
            }
            if (list.length > 0) {
              const merged = mergeAdminRemoteOrdersIntoPerUidStorage(list);
              if (!disposed) callback(merged);
            }
          },
          () => {
            // rely on Firestore / localStorage
          }
        );
      } catch {
        unsubRtdb = null;
      }
    }
  }

  void fetchAllPaymentOrdersRest().then((list) => {
    if (!disposed) callback(list);
  });

  const handleLocalEvent = () => emitFromAllLocal();
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(TGDS_USER_ORDERS_PREFIX)) {
      emitFromAllLocal();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(RTDB_ORDERS_UPDATED_EVENT, handleLocalEvent);
    window.addEventListener('storage', handleStorageEvent);
  }

  return () => {
    disposed = true;
    if (unsubFirestore) unsubFirestore();
    if (unsubRtdb) unsubRtdb();
    if (typeof window !== 'undefined') {
      window.removeEventListener(RTDB_ORDERS_UPDATED_EVENT, handleLocalEvent);
      window.removeEventListener('storage', handleStorageEvent);
    }
  };
}

// ============================================================================
// 5. ADMIN ACTIONS: APPROVE (WRITES BOTH payment_orders & users/{uid}) / REJECT
// ============================================================================
function buildTicketCode(order: RealtimePaymentOrder): string {
  const pkg = PAYMENT_PACKAGES[order.packageId];
  if (pkg.planTier === 'school') {
    return generateSchoolActivationCode();
  }
  const tag = pkg.planTier === 'pro' ? 'PRO' : 'STU';
  const suffix = order.orderId.replace(/^TGDS-/, '') || Math.floor(10000 + Math.random() * 90000);
  return `DAV-${tag}-${suffix}`;
}

export async function fetchUserTicketsFromCloud(uid: string): Promise<UserTicketsBundle | null> {
  const cleanUid = normalizeUidScope(uid);
  if (!cleanUid) return null;

  const firestoreDb = getOrdersFirestore();
  if (firestoreDb && firebaseAuth.currentUser && firebaseAuth.currentUser.uid === cleanUid) {
    const docPath = `users/${cleanUid}`;
    try {
      const snap = await withTimeout(
        getDoc(doc(collection(firestoreDb, 'users'), cleanUid)),
        CLOUD_OP_TIMEOUT_MS,
        `firestore_get_user_${cleanUid}`
      );
      if (snap.exists()) {
        const data = snap.data() as Partial<UserTicketsBundle>;
        const local = loadUserTicketsBundle(cleanUid);
        const merged: UserTicketsBundle = {
          uid: cleanUid,
          email: data.email || local?.email || '',
          displayName: data.displayName || local?.displayName,
          tier:
            data.tier === 'school' ||
            data.tier === 'pro' ||
            data.tier === 'plus' ||
            data.tier === 'basic'
              ? data.tier
              : local?.tier || 'basic',
          unlockedSiteIds: Array.from(
            new Set([
              ...(Array.isArray(data.unlockedSiteIds) ? data.unlockedSiteIds : []),
              ...(local?.unlockedSiteIds || []),
            ])
          ),
          unlockedRouteIds: Array.from(
            new Set([
              ...(Array.isArray(data.unlockedRouteIds) ? data.unlockedRouteIds : []),
              ...(local?.unlockedRouteIds || []),
            ])
          ),
          hasSchoolPackage: Boolean(data.hasSchoolPackage || local?.hasSchoolPackage),
          schoolName: data.schoolName || local?.schoolName,
          schoolCode: data.schoolCode || local?.schoolCode,
          ticketCodes: Array.from(
            new Set([
              ...(Array.isArray(data.ticketCodes) ? data.ticketCodes : []),
              ...(local?.ticketCodes || []),
            ])
          ),
          activeOrderIds: Array.from(
            new Set([
              ...(Array.isArray(data.activeOrderIds) ? data.activeOrderIds : []),
              ...(local?.activeOrderIds || []),
            ])
          ),
          notifiedOrderIds: local?.notifiedOrderIds || [],
          updatedAt: data.updatedAt || local?.updatedAt || new Date().toISOString(),
        };
        writeUserTicketsBundle(cleanUid, merged);
        return merged;
      }
    } catch (err) {
      logFirestoreDiagnostic(err, OperationType.GET, docPath);
    }
  }
  return loadUserTicketsBundle(cleanUid);
}

export async function approvePaymentOrderByAdmin(
  order: RealtimePaymentOrder,
  adminEmail: string
): Promise<{
  ok: boolean;
  order: RealtimePaymentOrder;
  emailResult: EmailSendResult;
  syncedFirebase: boolean;
}> {
  const nowIso = new Date().toISOString();
  const pkg = PAYMENT_PACKAGES[order.packageId];
  const ticketCode = order.ticketCode || buildTicketCode(order);

  const approvedOrder: RealtimePaymentOrder = {
    ...order,
    status: 'paid',
    ticketCode,
    rejectionReason: '',
    approvedAt: nowIso,
    approvedBy: adminEmail || PRIMARY_ADMIN_EMAIL,
    updatedAt: nowIso,
  };

  // 1. Immediate per-uid localStorage order update
  upsertOrderForUser(order.uid, approvedOrder);

  // 2. Sync approval to Cloud Firestore `payment_orders/{orderId}`
  const syncedFirebase = await writeOrderToCloudBackends(approvedOrder, 'merge');

  // 3. Grant & persist ticket ownership into buyer's `tgds_tickets_${order.uid}` + Firestore `users/${order.uid}`
  const buyerUid = normalizeUidScope(order.uid);
  if (buyerUid) {
    const prevBundle = loadUserTicketsBundle(buyerUid);
    const prevSub = loadLocalUserSubscription(buyerUid, order.email);

    const nextRouteIds = Array.from(
      new Set([
        ...(prevBundle?.unlockedRouteIds || []),
        ...prevSub.unlockedRouteIds,
        ...(order.routeId ? [order.routeId] : []),
      ])
    );
    const nextSiteIds = expandUnlockedSitesFromRoutes(
      [
        ...(prevBundle?.unlockedSiteIds || []),
        ...prevSub.unlockedSiteIds,
        ...(order.siteId ? [order.siteId] : []),
      ],
      nextRouteIds
    );
    const tierRank: Record<SubscriptionPlanLevel, number> = {
      basic: 0,
      plus: 1,
      pro: 2,
      school: 3,
    };
    const prevTier: SubscriptionPlanLevel =
      prevBundle?.tier && tierRank[prevBundle.tier] > tierRank[prevSub.tier]
        ? prevBundle.tier
        : prevSub.tier;
    const hasSchool = Boolean(
      prevBundle?.hasSchoolPackage || prevSub.hasSchoolPackage || pkg.planTier === 'school'
    );
    let nextTier: SubscriptionPlanLevel =
      tierRank[pkg.planTier] > tierRank[prevTier] ? pkg.planTier : prevTier;
    if (hasSchool) nextTier = 'school';

    const nextBundle: UserTicketsBundle = {
      uid: buyerUid,
      email: order.email.toLowerCase().trim(),
      displayName: order.displayName,
      tier: nextTier,
      unlockedSiteIds: nextSiteIds,
      unlockedRouteIds: nextRouteIds,
      hasSchoolPackage: hasSchool,
      schoolName: order.schoolName || prevBundle?.schoolName || prevSub.schoolName,
      schoolCode:
        pkg.planTier === 'school'
          ? ticketCode
          : prevBundle?.schoolCode || prevSub.schoolCode,
      ticketCodes: Array.from(new Set([ticketCode, ...(prevBundle?.ticketCodes || [])])),
      activeOrderIds: Array.from(
        new Set([order.orderId, ...(prevBundle?.activeOrderIds || []), ...prevSub.activeOrderIds])
      ),
      notifiedOrderIds: prevBundle?.notifiedOrderIds || [],
      updatedAt: nowIso,
    };
    writeUserTicketsBundle(buyerUid, nextBundle);

    const firestoreDb = getOrdersFirestore();
    if (firestoreDb) {
      const userDocPath = `users/${buyerUid}`;
      try {
        const firestoreUserPayload = stripUndefined({
          uid: buyerUid,
          email: nextBundle.email,
          displayName: nextBundle.displayName,
          tier: nextBundle.tier,
          unlockedSiteIds: nextBundle.unlockedSiteIds.slice(0, 50),
          unlockedRouteIds: nextBundle.unlockedRouteIds.slice(0, 30),
          hasSchoolPackage: nextBundle.hasSchoolPackage,
          schoolName: nextBundle.schoolName,
          schoolCode: nextBundle.schoolCode,
          ticketCodes: nextBundle.ticketCodes.slice(0, 100),
          activeOrderIds: nextBundle.activeOrderIds.slice(0, 100),
          updatedAt: nowIso,
        });
        await withTimeout(
          setDoc(doc(collection(firestoreDb, 'users'), buyerUid), firestoreUserPayload, {
            merge: true,
          }),
          CLOUD_OP_TIMEOUT_MS,
          `firestore_user_profile_${buyerUid}`
        );
      } catch (err) {
        logFirestoreDiagnostic(err, OperationType.WRITE, userDocPath);
      }
    }

    // Optional RTDB mirror when RTDB is configured
    const safeBuyerUid = sanitizeFirebaseUserKey(buyerUid);
    if (safeBuyerUid && safeBuyerUid !== 'guest' && isFirebaseDbConfigured()) {
      const cleanSubPayload = stripUndefined({
        uid: buyerUid,
        email: nextBundle.email,
        tier: nextBundle.tier,
        unlockedSiteIds: nextBundle.unlockedSiteIds,
        unlockedRouteIds: nextBundle.unlockedRouteIds,
        hasSchoolPackage: nextBundle.hasSchoolPackage,
        schoolName: nextBundle.schoolName,
        schoolCode: nextBundle.schoolCode,
        activeOrderIds: nextBundle.activeOrderIds,
        updatedAt: nowIso,
      });
      const rtdb = getRealtimeDb();
      if (rtdb) {
        try {
          await withTimeout(
            Promise.all([
              set(ref(rtdb, `users/${safeBuyerUid}/subscriptions`), cleanSubPayload),
              set(ref(rtdb, `users/${safeBuyerUid}/entitlements`), cleanSubPayload),
            ]),
            CLOUD_OP_TIMEOUT_MS,
            'rtdb_set_user_sub'
          );
        } catch {
          // ignore
        }
      }
    }
  }

  // 4. Mirror approved order to ledger for revenue analytics
  const legacyOrder: PaymentOrderRecord = {
    orderId: order.orderId,
    uid: order.uid,
    email: order.email,
    customerName: order.displayName,
    planTier: pkg.planTier,
    planName: `${order.packageName}${order.quantity > 1 ? ` × ${order.quantity}` : ''}`,
    scopeLabel: order.scopeLabel || order.packageName,
    siteIds: order.siteId ? [order.siteId] : [],
    routeIds: order.routeId ? [order.routeId] : [],
    region: 'vn_vietqr',
    paymentMethod: 'vietqr',
    paymentMethodLabel: 'MoMo / VietQR Napas 247 (Đã duyệt)',
    amountVnd: order.amount,
    amountUsd: Math.max(1, Math.round(order.amount / 25_000)),
    amountDisplay: formatVnd(order.amount),
    transferMemo: order.transferContent,
    schoolName: order.schoolName,
    schoolCode: pkg.planTier === 'school' ? ticketCode : undefined,
    emailSent: false,
    status: 'completed',
    createdAt: order.createdAt,
  };
  await withTimeout(recordPaymentOrder(legacyOrder), CLOUD_OP_TIMEOUT_MS, 'record_legacy_order').catch(
    () => undefined
  );

  // 4b. Provision 35-seat Gói Lớp học license + PRO-LOP-XXXXX invite code if classroom_500k
  if (pkg.planTier === 'school' && buyerUid) {
    await withTimeout(
      ensureClassroomLicenseForTeacher({
        teacherUid: buyerUid,
        teacherEmail: order.email,
        teacherName: order.displayName,
        orderId: order.orderId,
        schoolName: order.schoolName,
      }),
      CLOUD_OP_TIMEOUT_MS,
      `provision_classroom_${buyerUid}`
    ).catch(() => undefined);
  }

  // 5. Auto-send electronic ticket email via EmailJS when buyer has a valid email address
  let emailResult: EmailSendResult = { ok: false, error: 'EmailJS skipped or timed out' };
  const hasBuyerEmail = Boolean(order.email && order.email.includes('@'));
  if (hasBuyerEmail) {
    try {
      emailResult = await withTimeout(
        sendOrderThankYouEmail(
          {
            toEmail: order.email,
            customerName: order.displayName,
            planName: `${order.packageName} (${order.quantity} vé)`,
            scope: `${order.scopeLabel || order.packageName} · Mã vé điện tử: ${ticketCode}`,
            orderCode: `${order.orderId} / ${ticketCode}`,
            amount: formatVnd(order.amount),
          },
          { requireEnabled: false }
        ),
        CLOUD_OP_TIMEOUT_MS,
        'emailjs_approve_notify'
      );
    } catch {
      emailResult = { ok: false, error: 'EmailJS timeout' };
    }
  } else {
    emailResult = { ok: false, error: 'Tài khoản Facebook chưa cung cấp email nhận hóa đơn.' };
  }

  if (emailResult.ok) {
    approvedOrder.emailSent = true;
    upsertOrderForUser(order.uid, approvedOrder);
    void writeOrderToCloudBackends(approvedOrder, 'merge');
  }

  emitWindowEvent(PAYMENT_ORDERS_UPDATED_EVENT);
  return { ok: true, order: approvedOrder, emailResult, syncedFirebase };
}

export async function batchApprovePaymentOrdersByAdmin(
  orders: RealtimePaymentOrder[],
  adminEmail: string
): Promise<{
  total: number;
  approvedCount: number;
  emailSentCount: number;
  syncedFirebaseCount: number;
  approvedOrders: RealtimePaymentOrder[];
}> {
  const targets = orders.filter(
    (o) => o && (o.status === 'waiting_approval' || o.status === 'pending')
  );
  const approvedOrders: RealtimePaymentOrder[] = [];
  let emailSentCount = 0;
  let syncedFirebaseCount = 0;

  // Process in bounded batches of 4 to avoid flooding Firestore/EmailJS
  for (let i = 0; i < targets.length; i += 4) {
    const slice = targets.slice(i, i + 4);
    const results = await Promise.all(
      slice.map(async (order) => {
        try {
          return await approvePaymentOrderByAdmin(order, adminEmail);
        } catch {
          return null;
        }
      })
    );
    for (const res of results) {
      if (res?.ok) {
        approvedOrders.push(res.order);
        if (res.emailResult.ok) emailSentCount += 1;
        if (res.syncedFirebase) syncedFirebaseCount += 1;
      }
    }
  }

  emitWindowEvent(PAYMENT_ORDERS_UPDATED_EVENT);
  return {
    total: targets.length,
    approvedCount: approvedOrders.length,
    emailSentCount,
    syncedFirebaseCount,
    approvedOrders,
  };
}

export async function rejectPaymentOrderByAdmin(
  order: RealtimePaymentOrder,
  reason: string,
  adminEmail: string
): Promise<{ ok: boolean; order: RealtimePaymentOrder; syncedFirebase: boolean }> {
  const nowIso = new Date().toISOString();
  const cleanReason =
    reason.trim() || 'Chưa nhận được tiền chuyển khoản khớp mã đơn. Vui lòng kiểm tra lại.';

  const rejectedOrder: RealtimePaymentOrder = {
    ...order,
    status: 'rejected',
    rejectionReason: cleanReason,
    approvedBy: adminEmail || PRIMARY_ADMIN_EMAIL,
    updatedAt: nowIso,
  };

  upsertOrderForUser(order.uid, rejectedOrder);
  const syncedFirebase = await writeOrderToCloudBackends(rejectedOrder, 'merge');

  return { ok: true, order: rejectedOrder, syncedFirebase };
}

export function isOrderPurgeable(order: RealtimePaymentOrder, expiredHours = 24): boolean {
  if (order.status === 'rejected') return true;
  if (order.status === 'pending') {
    const createdMs = Date.parse(order.createdAt || '');
    if (Number.isFinite(createdMs) && Date.now() - createdMs >= expiredHours * 3600 * 1000) {
      return true;
    }
  }
  return false;
}

export async function purgeRejectedAndExpiredOrdersByAdmin(
  expiredHours = 24
): Promise<{ deletedCount: number; syncedFirebaseCount: number; remainingOrders: RealtimePaymentOrder[] }> {
  const allOrdersMap = readAllLocalOrdersMapAcrossUids();
  const firestoreDb = getOrdersFirestore();

  if (firestoreDb) {
    try {
      const snap = await withTimeout(
        getDocs(collection(firestoreDb, 'payment_orders')),
        CLOUD_OP_TIMEOUT_MS,
        'firestore_admin_purge_scan'
      );
      snap.forEach((docSnap) => {
        const norm = normalizeRawOrder(docSnap.data());
        if (norm) {
          allOrdersMap[norm.orderId] = pickFresherOrder(allOrdersMap[norm.orderId], norm);
        }
      });
    } catch (err) {
      logFirestoreDiagnostic(err, OperationType.LIST, 'payment_orders');
    }
  }

  const purgeTargets = Object.values(allOrdersMap).filter((o) =>
    isOrderPurgeable(o, expiredHours)
  );
  if (purgeTargets.length === 0) {
    return {
      deletedCount: 0,
      syncedFirebaseCount: 0,
      remainingOrders: Object.values(allOrdersMap).sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
      ),
    };
  }

  const purgeIdSet = new Set(purgeTargets.map((o) => o.orderId));

  // 1. Clean all per-uid localStorage buckets
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || !key.startsWith(TGDS_USER_ORDERS_PREFIX)) continue;
        const uid = key.slice(TGDS_USER_ORDERS_PREFIX.length);
        const map = loadUserOrderMap(uid);
        let changed = false;
        for (const id of Object.keys(map)) {
          if (purgeIdSet.has(id)) {
            delete map[id];
            changed = true;
          }
        }
        if (changed) {
          writeUserOrderMap(uid, map);
        }
        const watchingId = getActiveWatchingOrderId(uid);
        if (watchingId && purgeIdSet.has(watchingId)) {
          setActiveWatchingOrderId(null, uid);
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }

  // 2. Delete from Cloud Firestore & optional RTDB
  let syncedFirebaseCount = 0;
  await Promise.all(
    purgeTargets.map(async (order) => {
      if (firestoreDb) {
        const docPath = `payment_orders/${order.orderId}`;
        try {
          await withTimeout(
            deleteDoc(doc(collection(firestoreDb, 'payment_orders'), order.orderId)),
            CLOUD_OP_TIMEOUT_MS,
            `firestore_delete_${order.orderId}`
          );
          syncedFirebaseCount += 1;
        } catch (err) {
          logFirestoreDiagnostic(err, OperationType.DELETE, docPath);
        }
      }
      if (isFirebaseDbConfigured()) {
        const rtdb = getRealtimeDb();
        if (rtdb) {
          try {
            await withTimeout(
              remove(ref(rtdb, `payment_orders/${order.orderId}`)),
              CLOUD_OP_TIMEOUT_MS,
              `rtdb_delete_${order.orderId}`
            );
          } catch {
            // ignore RTDB cleanup errors
          }
        }
      }
    })
  );

  emitWindowEvent(RTDB_ORDERS_UPDATED_EVENT, { scope: 'admin_all' });
  const remainingOrders = Object.values(readAllLocalOrdersMapAcrossUids()).sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
  );
  return {
    deletedCount: purgeTargets.length,
    syncedFirebaseCount,
    remainingOrders,
  };
}

// ============================================================================
// 6. APPLY APPROVED ORDER ON BUYER'S DEVICE (ONLY WHEN status === "paid")
// ============================================================================
export async function applyApprovedOrderToCurrentUser(
  order: RealtimePaymentOrder,
  currentUserId?: string
): Promise<boolean> {
  if (order.status !== 'paid') return false;
  const effectiveUserId = normalizeUidScope(currentUserId || order.uid);
  if (!effectiveUserId || order.uid !== effectiveUserId) return false;
  if (isPaidOrderAlreadyApplied(order.orderId, effectiveUserId)) return false;

  const pkg = PAYMENT_PACKAGES[order.packageId];
  const nowIso = new Date().toISOString();
  const ticketCode = order.ticketCode || buildTicketCode(order);

  // 1. Update buyer's subscription entitlements & per-uid tickets bundle
  const prevSub = loadLocalUserSubscription(effectiveUserId, order.email);
  const nextRouteIds = Array.from(
    new Set([...prevSub.unlockedRouteIds, ...(order.routeId ? [order.routeId] : [])])
  );
  const nextSiteIds = expandUnlockedSitesFromRoutes(
    [...prevSub.unlockedSiteIds, ...(order.siteId ? [order.siteId] : [])],
    nextRouteIds
  );
  const hasSchool = prevSub.hasSchoolPackage || pkg.planTier === 'school';
  const tierRank: Record<SubscriptionPlanLevel, number> = {
    basic: 0,
    plus: 1,
    pro: 2,
    school: 3,
  };
  let nextTier: SubscriptionPlanLevel =
    tierRank[pkg.planTier] > tierRank[prevSub.tier] ? pkg.planTier : prevSub.tier;
  if (hasSchool) nextTier = 'school';

  await withTimeout(
    saveUserSubscription({
      uid: effectiveUserId,
      email: order.email,
      tier: nextTier,
      unlockedSiteIds: nextSiteIds,
      unlockedRouteIds: nextRouteIds,
      hasSchoolPackage: hasSchool,
      schoolName: order.schoolName || prevSub.schoolName,
      schoolCode: pkg.planTier === 'school' ? ticketCode : prevSub.schoolCode,
      activeOrderIds: Array.from(new Set([order.orderId, ...prevSub.activeOrderIds])),
      updatedAt: nowIso,
    }),
    CLOUD_OP_TIMEOUT_MS,
    'save_user_subscription'
  ).catch(() => undefined);

  const prevBundle = loadUserTicketsBundle(effectiveUserId);
  writeUserTicketsBundle(effectiveUserId, {
    uid: effectiveUserId,
    email: order.email.toLowerCase().trim(),
    displayName: order.displayName,
    tier: nextTier,
    unlockedSiteIds: nextSiteIds,
    unlockedRouteIds: nextRouteIds,
    hasSchoolPackage: hasSchool,
    schoolName: order.schoolName || prevBundle?.schoolName || prevSub.schoolName,
    schoolCode: pkg.planTier === 'school' ? ticketCode : prevBundle?.schoolCode || prevSub.schoolCode,
    ticketCodes: Array.from(new Set([ticketCode, ...(prevBundle?.ticketCodes || [])])),
    activeOrderIds: Array.from(new Set([order.orderId, ...(prevBundle?.activeOrderIds || [])])),
    notifiedOrderIds: prevBundle?.notifiedOrderIds || [],
    updatedAt: nowIso,
  });

  // 2. Issue QR pass locally for My Tickets modal
  const passKind: IssuedPassRecord['kind'] =
    pkg.planTier === 'school'
      ? 'b2b_school'
      : pkg.planTier === 'pro'
      ? 'vip_ticket'
      : 'route_ticket';
  const passRouteId =
    pkg.planTier === 'plus'
      ? order.routeId || (order.siteId ? `site:${order.siteId}` : undefined)
      : pkg.planTier === 'pro'
      ? 'all-17'
      : 'school-edtech';

  recordIssuedPass({
    code: ticketCode,
    kind: passKind,
    ownerUserId: effectiveUserId,
    ownerEmail: order.email,
    ownerName: order.displayName,
    ownerContactMasked: order.email,
    provider: 'google',
    routeId: passRouteId,
    routeTitle: order.scopeLabel || order.packageName,
    label: `${order.packageName} (${order.quantity} vé · Đã duyệt VietQR)`,
    amountLabel: formatVnd(order.amount),
    status: 'active',
  });

  if (pkg.planTier === 'school') {
    activateUserSchoolPackage({
      userId: effectiveUserId,
      userEmail: order.email,
      schoolName: order.schoolName,
      province: order.schoolProvince,
    });
    setUserSubscriptionTier(effectiveUserId, order.email, 'vip_49k');
    void ensureClassroomLicenseForTeacher({
      teacherUid: effectiveUserId,
      teacherEmail: order.email,
      teacherName: order.displayName,
      orderId: order.orderId,
      schoolName: order.schoolName,
    });
  } else if (pkg.planTier === 'pro') {
    setUserSubscriptionTier(effectiveUserId, order.email, 'vip_49k');
  } else {
    const curLegacy = getUserSubscriptionTier(effectiveUserId, order.email);
    if (curLegacy === 'free') {
      setUserSubscriptionTier(effectiveUserId, order.email, 'route_19k');
    }
  }

  pushSuQuanPurchaseNotice({
    orderId: order.orderId,
    orderCode: ticketCode,
    userId: effectiveUserId,
    toEmail: order.email,
    customerName: order.displayName,
    planName: `${order.packageName} (${order.quantity} vé)`,
    scope: order.scopeLabel || order.packageName,
    amount: formatVnd(order.amount),
    emailSent: Boolean(order.emailSent),
    createdAt: order.approvedAt || nowIso,
  });

  markPaidOrderApplied(order.orderId, effectiveUserId);
  emitWindowEvent(SUBSCRIPTION_GATING_UPDATED_EVENT);
  return true;
}
