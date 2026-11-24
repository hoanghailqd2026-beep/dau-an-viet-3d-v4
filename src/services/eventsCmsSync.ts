import { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  FirestoreOperationType,
  getAppFirestore,
  reportFirestoreError,
  sanitizeSafeHttpOrImageUrl,
  testFirestoreConnectionOnce,
  withFirestoreTimeout,
} from '../lib/firebaseDb';
import { recordActivityLog } from './activityLogsSync';

export type HeritageEventCategory =
  | 'Triển lãm số'
  | 'Cuộc thi Sử học'
  | 'Hội thảo / Workshop'
  | 'Bảo tồn Di sản'
  | 'Thông báo';

export const HERITAGE_EVENT_CATEGORIES: HeritageEventCategory[] = [
  'Triển lãm số',
  'Cuộc thi Sử học',
  'Hội thảo / Workshop',
  'Bảo tồn Di sản',
  'Thông báo',
];

export interface HeritageEvent {
  id: string;
  title: string;
  titleEn?: string;
  titleZh?: string;
  category: HeritageEventCategory;
  startDate: string;
  endDate: string;
  location: string;
  relatedSiteId?: string;
  coverImageUrl?: string;
  summary: string;
  content: string;
  registrationUrl?: string;
  isFeatured: boolean;
  isHidden: boolean;
  createdBy: string;
  updatedAt: string;
}

export type HeritageEventComputedStatus = 'ongoing' | 'upcoming' | 'ended';

const LOCAL_EVENTS_KEY = 'dau_an_viet_cms_events_v1';
export const HERITAGE_EVENTS_UPDATED_EVENT = 'dau-an-viet-cms-events-updated';

function readLocalEvents(): HeritageEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_EVENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HeritageEvent[]) : [];
  } catch {
    return [];
  }
}

function writeLocalEvents(events: HeritageEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
    window.dispatchEvent(new CustomEvent(HERITAGE_EVENTS_UPDATED_EVENT));
  } catch {
    // ignore storage quota errors
  }
}

export function normalizeHeritageEvent(raw: Partial<HeritageEvent>, fallbackId?: string): HeritageEvent | null {
  const id = (raw.id || fallbackId || '').trim();
  const title = (raw.title || '').trim();
  if (!id || !title) return null;

  const category: HeritageEventCategory = HERITAGE_EVENT_CATEGORIES.includes(
    raw.category as HeritageEventCategory
  )
    ? (raw.category as HeritageEventCategory)
    : 'Thông báo';

  const startDate = (raw.startDate || '').trim() || new Date().toISOString().slice(0, 10);
  const endDate = (raw.endDate || '').trim() || startDate;

  return {
    id: id.slice(0, 120),
    title: title.slice(0, 220),
    ...(raw.titleEn?.trim() ? { titleEn: raw.titleEn.trim().slice(0, 220) } : {}),
    ...(raw.titleZh?.trim() ? { titleZh: raw.titleZh.trim().slice(0, 220) } : {}),
    category,
    startDate: startDate.slice(0, 32),
    endDate: endDate.slice(0, 32),
    location: (raw.location || 'Trực tuyến').trim().slice(0, 200),
    ...(raw.relatedSiteId?.trim() ? { relatedSiteId: raw.relatedSiteId.trim().slice(0, 64) } : {}),
    ...(raw.coverImageUrl
      ? { coverImageUrl: sanitizeSafeHttpOrImageUrl(raw.coverImageUrl, true).slice(0, 280000) }
      : {}),
    summary: (raw.summary || '').trim().slice(0, 1000),
    content: (raw.content || '').trim().slice(0, 12000),
    ...(raw.registrationUrl
      ? { registrationUrl: sanitizeSafeHttpOrImageUrl(raw.registrationUrl, false).slice(0, 1024) }
      : {}),
    isFeatured: Boolean(raw.isFeatured),
    isHidden: Boolean(raw.isHidden),
    createdBy: (raw.createdBy || 'Quản trị viên').trim().slice(0, 160),
    updatedAt: (raw.updatedAt || new Date().toISOString()).slice(0, 64),
  };
}

export function getHeritageEventStatus(
  event: Pick<HeritageEvent, 'startDate' | 'endDate'>,
  now: Date = new Date()
): HeritageEventComputedStatus {
  const todayYmd = now.toISOString().slice(0, 10);
  const startYmd = (event.startDate || '').slice(0, 10);
  const endYmd = (event.endDate || startYmd).slice(0, 10);

  if (startYmd && todayYmd < startYmd) return 'upcoming';
  if (endYmd && todayYmd > endYmd) return 'ended';
  return 'ongoing';
}

export function sortHeritageEventsForDisplay(events: HeritageEvent[]): HeritageEvent[] {
  const statusRank: Record<HeritageEventComputedStatus, number> = {
    ongoing: 0,
    upcoming: 1,
    ended: 2,
  };
  return [...events].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    const ra = statusRank[getHeritageEventStatus(a)];
    const rb = statusRank[getHeritageEventStatus(b)];
    if (ra !== rb) return ra - rb;
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  });
}

export function subscribeHeritageEvents(
  onUpdate: (events: HeritageEvent[], syncedFromCloud: boolean) => void
): Unsubscribe {
  onUpdate(sortHeritageEventsForDisplay(readLocalEvents()), false);

  const onLocal = () => onUpdate(sortHeritageEventsForDisplay(readLocalEvents()), false);
  if (typeof window !== 'undefined') {
    window.addEventListener(HERITAGE_EVENTS_UPDATED_EVENT, onLocal);
  }

  void testFirestoreConnectionOnce();
  const db = getAppFirestore();
  if (!db) {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(HERITAGE_EVENTS_UPDATED_EVENT, onLocal);
      }
    };
  }

  const unsubFs = onSnapshot(
    collection(db, 'cms_events'),
    (snapshot) => {
      const remoteEvents: HeritageEvent[] = [];
      snapshot.forEach((docSnap) => {
        const normalized = normalizeHeritageEvent(
          docSnap.data() as Partial<HeritageEvent>,
          docSnap.id
        );
        if (normalized) remoteEvents.push(normalized);
      });
      const sorted = sortHeritageEventsForDisplay(remoteEvents);
      writeLocalEvents(sorted);
      onUpdate(sorted, true);
    },
    (error) => {
      reportFirestoreError(error, FirestoreOperationType.LIST, 'cms_events');
    }
  );

  return () => {
    unsubFs();
    if (typeof window !== 'undefined') {
      window.removeEventListener(HERITAGE_EVENTS_UPDATED_EVENT, onLocal);
    }
  };
}

export function useHeritageEvents(): {
  events: HeritageEvent[];
  publicEvents: HeritageEvent[];
  loading: boolean;
  syncedFromCloud: boolean;
} {
  const [events, setEvents] = useState<HeritageEvent[]>(() =>
    sortHeritageEventsForDisplay(readLocalEvents())
  );
  const [syncedFromCloud, setSyncedFromCloud] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeHeritageEvents((nextEvents, isCloud) => {
      setEvents(nextEvents);
      if (isCloud) setSyncedFromCloud(true);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const publicEvents = events.filter((ev) => !ev.isHidden);
  return { events, publicEvents, loading, syncedFromCloud };
}

export async function saveHeritageEvent(
  draft: Omit<HeritageEvent, 'id' | 'updatedAt'> & { id?: string },
  actor: { uid?: string; email?: string; displayName?: string }
): Promise<{ ok: boolean; event?: HeritageEvent; syncedCloud: boolean; error?: string }> {
  const nowIso = new Date().toISOString();
  const id =
    draft.id?.trim() ||
    `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

  const normalized = normalizeHeritageEvent(
    {
      ...draft,
      id,
      createdBy: draft.createdBy || actor.email || actor.displayName || 'Quản trị viên',
      updatedAt: nowIso,
    },
    id
  );

  if (!normalized) {
    return { ok: false, syncedCloud: false, error: 'Tiêu đề sự kiện không được để trống.' };
  }

  // Strip undefined fields before Firestore write
  const payload: Record<string, unknown> = {
    id: normalized.id,
    title: normalized.title,
    category: normalized.category,
    startDate: normalized.startDate,
    endDate: normalized.endDate,
    location: normalized.location,
    summary: normalized.summary,
    content: normalized.content,
    isFeatured: normalized.isFeatured,
    isHidden: normalized.isHidden,
    createdBy: normalized.createdBy,
    updatedAt: normalized.updatedAt,
  };
  if (normalized.titleEn) payload.titleEn = normalized.titleEn;
  if (normalized.titleZh) payload.titleZh = normalized.titleZh;
  if (normalized.relatedSiteId) payload.relatedSiteId = normalized.relatedSiteId;
  if (normalized.coverImageUrl) payload.coverImageUrl = normalized.coverImageUrl;
  if (normalized.registrationUrl) payload.registrationUrl = normalized.registrationUrl;

  const existing = readLocalEvents();
  const nextLocal = sortHeritageEventsForDisplay([
    normalized,
    ...existing.filter((e) => e.id !== normalized.id),
  ]);
  writeLocalEvents(nextLocal);

  let syncedCloud = false;
  const db = getAppFirestore();
  if (db) {
    try {
      await withFirestoreTimeout(
        setDoc(doc(collection(db, 'cms_events'), normalized.id), payload),
        5000,
        `save_event_${normalized.id}`
      );
      syncedCloud = true;
    } catch (err) {
      reportFirestoreError(err, FirestoreOperationType.WRITE, `cms_events/${normalized.id}`);
      return {
        ok: false,
        event: normalized,
        syncedCloud: false,
        error:
          err instanceof Error
            ? `Không thể đồng bộ sự kiện lên Cloud Firestore: ${err.message}`
            : 'Không thể đồng bộ sự kiện lên Cloud Firestore.',
      };
    }
  }

  void recordActivityLog({
    action: 'CMS_EVENT_UPDATE',
    actorUid: actor.uid,
    actorEmail: actor.email,
    actorName: actor.displayName,
    targetId: normalized.id,
    detail: `${draft.id ? 'Cập nhật' : 'Tạo mới'} sự kiện "${normalized.title}" (${normalized.category}) · ${normalized.isHidden ? 'Đang ẩn' : 'Công khai'}`,
  });

  return { ok: true, event: normalized, syncedCloud };
}

export async function toggleHeritageEventField(params: {
  event: HeritageEvent;
  patch: Partial<Pick<HeritageEvent, 'isHidden' | 'isFeatured'>>;
  actor: { uid?: string; email?: string; displayName?: string };
}): Promise<{ ok: boolean; error?: string }> {
  const updated: HeritageEvent = {
    ...params.event,
    ...params.patch,
    updatedAt: new Date().toISOString(),
  };
  const res = await saveHeritageEvent(updated, params.actor);
  return { ok: res.ok, error: res.error };
}

export async function deleteHeritageEvent(
  event: HeritageEvent,
  actor: { uid?: string; email?: string; displayName?: string }
): Promise<{ ok: boolean; error?: string }> {
  const existing = readLocalEvents();
  writeLocalEvents(existing.filter((e) => e.id !== event.id));

  const db = getAppFirestore();
  if (db) {
    try {
      await withFirestoreTimeout(
        deleteDoc(doc(collection(db, 'cms_events'), event.id)),
        4500,
        `delete_event_${event.id}`
      );
    } catch (err) {
      reportFirestoreError(err, FirestoreOperationType.DELETE, `cms_events/${event.id}`);
      return {
        ok: false,
        error:
          err instanceof Error
            ? `Không thể xóa sự kiện trên Cloud Firestore: ${err.message}`
            : 'Không thể xóa sự kiện trên Cloud Firestore.',
      };
    }
  }

  void recordActivityLog({
    action: 'CMS_EVENT_UPDATE',
    actorUid: actor.uid,
    actorEmail: actor.email,
    actorName: actor.displayName,
    targetId: event.id,
    detail: `Đã xóa sự kiện "${event.title}" khỏi cms_events`,
  });

  return { ok: true };
}
