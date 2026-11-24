import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { firebaseAuth } from '../lib/firebaseAuth';
import {
  FirestoreOperationType,
  getAppFirestore,
  reportFirestoreError,
  withFirestoreTimeout,
} from '../lib/firebaseDb';
import {
  getCurrentSessionLoginAudit,
  parseUserAgentDeviceInfo,
} from '../utils/accountActivityStore';

export type ActivityLogAction =
  | 'REGISTER_PASSWORD'
  | 'LOGIN_PASSWORD'
  | 'LOGIN_OAUTH'
  | 'PASSWORD_RESET_SENT'
  | 'USER_SUSPEND_TOGGLE'
  | 'CMS_EVENT_UPDATE'
  | 'CMS_TOGGLE_3D'
  | 'SYSTEM_ADMIN_ACTION';

export interface ActivityLogRecord {
  id: string;
  action: ActivityLogAction;
  actorUid: string;
  actorEmail: string;
  actorName: string;
  targetId?: string;
  detail: string;
  deviceLabel: string;
  locationDisplay: string;
  createdAt: string;
}

const LOCAL_ACTIVITY_LOGS_KEY = 'dau_an_viet_activity_logs_v1';
export const ACTIVITY_LOGS_UPDATED_EVENT = 'dau-an-viet-activity-logs-updated';
const MAX_LOCAL_LOGS = 150;

function readLocalActivityLogs(): ActivityLogRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_ACTIVITY_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ActivityLogRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocalActivityLogs(items: ActivityLogRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      LOCAL_ACTIVITY_LOGS_KEY,
      JSON.stringify(items.slice(0, MAX_LOCAL_LOGS))
    );
    window.dispatchEvent(new CustomEvent(ACTIVITY_LOGS_UPDATED_EVENT));
  } catch {
    // ignore storage quota errors
  }
}

export function loadLocalActivityLogs(): ActivityLogRecord[] {
  return readLocalActivityLogs();
}

export async function recordActivityLog(params: {
  action: ActivityLogAction;
  actorUid?: string;
  actorEmail?: string;
  actorName?: string;
  targetId?: string;
  detail: string;
  deviceLabel?: string;
  locationDisplay?: string;
}): Promise<ActivityLogRecord> {
  const nowIso = new Date().toISOString();
  const fbUser = firebaseAuth.currentUser;
  const deviceInfo = parseUserAgentDeviceInfo();
  const currentAudit = getCurrentSessionLoginAudit();
  const tz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh'
      : 'Asia/Ho_Chi_Minh';

  const id = `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record: ActivityLogRecord = {
    id,
    action: params.action,
    actorUid: (params.actorUid || fbUser?.uid || 'anonymous').slice(0, 160),
    actorEmail: (params.actorEmail || fbUser?.email || '').toLowerCase().trim().slice(0, 254),
    actorName: (params.actorName || fbUser?.displayName || 'Hệ thống').trim().slice(0, 160),
    ...(params.targetId ? { targetId: params.targetId.slice(0, 120) } : {}),
    detail: params.detail.trim().slice(0, 1000),
    deviceLabel: (
      params.deviceLabel ||
      `${deviceInfo.deviceLabel} · ${deviceInfo.os} · ${deviceInfo.browser}`
    ).slice(0, 160),
    locationDisplay: (
      params.locationDisplay ||
      currentAudit?.locationDisplay ||
      `Múi giờ ${tz}`
    ).slice(0, 160),
    createdAt: nowIso,
  };

  const existing = readLocalActivityLogs();
  writeLocalActivityLogs([record, ...existing.filter((x) => x.id !== record.id)]);

  const db = getAppFirestore();
  const signedInUid = firebaseAuth.currentUser?.uid || '';
  if (db && signedInUid && record.actorUid === signedInUid) {
    try {
      await withFirestoreTimeout(
        setDoc(doc(collection(db, 'activity_logs'), id), record),
        12000,
        `record_activity_${params.action}`
      );
    } catch (err) {
      console.warn(
        `[activity_logs] Background log skipped (${params.action}):`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  return record;
}

export function subscribeActivityLogs(
  onUpdate: (logs: ActivityLogRecord[]) => void,
  maxItems = 100
): Unsubscribe {
  onUpdate(readLocalActivityLogs());

  const onLocalEvent = () => onUpdate(readLocalActivityLogs());
  if (typeof window !== 'undefined') {
    window.addEventListener(ACTIVITY_LOGS_UPDATED_EVENT, onLocalEvent);
  }

  const db = getAppFirestore();
  if (!db || !firebaseAuth.currentUser) {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(ACTIVITY_LOGS_UPDATED_EVENT, onLocalEvent);
      }
    };
  }

  const q = query(
    collection(db, 'activity_logs'),
    orderBy('createdAt', 'desc'),
    limit(Math.min(150, Math.max(10, maxItems)))
  );

  const unsubFs = onSnapshot(
    q,
    (snap) => {
      const remote: ActivityLogRecord[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as Partial<ActivityLogRecord>;
        if (!data || !data.action) return;
        remote.push({
          id: data.id || docSnap.id,
          action: data.action,
          actorUid: data.actorUid || '',
          actorEmail: data.actorEmail || '',
          actorName: data.actorName || 'Người dùng',
          targetId: data.targetId,
          detail: data.detail || '',
          deviceLabel: data.deviceLabel || '',
          locationDisplay: data.locationDisplay || '',
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      const mergedMap = new Map<string, ActivityLogRecord>();
      for (const item of [...readLocalActivityLogs(), ...remote]) {
        mergedMap.set(item.id, item);
      }
      const merged = Array.from(mergedMap.values())
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, MAX_LOCAL_LOGS);

      writeLocalActivityLogs(merged);
      onUpdate(merged);
    },
    (error) => {
      reportFirestoreError(error, FirestoreOperationType.LIST, 'activity_logs');
    }
  );

  return () => {
    unsubFs();
    if (typeof window !== 'undefined') {
      window.removeEventListener(ACTIVITY_LOGS_UPDATED_EVENT, onLocalEvent);
    }
  };
}
