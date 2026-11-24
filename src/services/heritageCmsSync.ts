import { useCallback, useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  FirestoreOperationType,
  getAppFirestore,
  reportFirestoreError,
  testFirestoreConnectionOnce,
  withFirestoreTimeout,
} from '../lib/firebaseDb';
import { recordActivityLog } from './activityLogsSync';
import {
  loadCmsSiteOverrides,
  saveCmsSiteOverride,
} from '../utils/adminPlatformStore';

export const DEFAULT_HIDDEN_3D_REASON =
  'Mô hình 3D đang được nhóm kỹ thuật tối ưu lại chi tiết kiến trúc và sẽ mở lại sớm.';

export const DEFAULT_GLOBAL_HIDDEN_3D_REASON =
  'Hệ thống mô hình 3D đang trong chế độ bảo trì định kỳ để nâng cấp chi tiết kiến trúc. Bài viết lịch sử, ảnh tư liệu 2D, thuyết minh và bản đồ vẫn hoạt động bình thường.';

export interface Heritage3DSiteVisibilityRecord {
  siteId: string;
  is3DModelHidden: boolean;
  hidden3DReason?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface Global3DViewerConfig {
  isGlobal3DHidden: boolean;
  globalHiddenReason: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface Heritage3DVisibilitySnapshot {
  siteMap: Record<string, Heritage3DSiteVisibilityRecord>;
  globalConfig: Global3DViewerConfig;
  syncedFromCloud: boolean;
}

const LOCAL_SITE_3D_VIS_KEY = 'dau_an_viet_cms_heritage_3d_visibility_v1';
const LOCAL_GLOBAL_3D_CONFIG_KEY = 'dau_an_viet_system_viewer_3d_config_v1';
export const HERITAGE_3D_VISIBILITY_UPDATED_EVENT = 'dau-an-viet-heritage-3d-visibility-updated';

function readLocalSite3DMap(): Record<string, Heritage3DSiteVisibilityRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_SITE_3D_VIS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, Heritage3DSiteVisibilityRecord>)
      : {};
  } catch {
    return {};
  }
}

function writeLocalSite3DMap(map: Record<string, Heritage3DSiteVisibilityRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_SITE_3D_VIS_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(HERITAGE_3D_VISIBILITY_UPDATED_EVENT));
  } catch {
    // ignore storage quota errors
  }
}

function readLocalGlobal3DConfig(): Global3DViewerConfig {
  const fallback: Global3DViewerConfig = {
    isGlobal3DHidden: false,
    globalHiddenReason: DEFAULT_GLOBAL_HIDDEN_3D_REASON,
    updatedAt: '',
  };
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(LOCAL_GLOBAL_3D_CONFIG_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Global3DViewerConfig>;
    return {
      isGlobal3DHidden: Boolean(parsed.isGlobal3DHidden),
      globalHiddenReason:
        typeof parsed.globalHiddenReason === 'string' && parsed.globalHiddenReason.trim()
          ? parsed.globalHiddenReason.trim()
          : DEFAULT_GLOBAL_HIDDEN_3D_REASON,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      updatedBy: typeof parsed.updatedBy === 'string' ? parsed.updatedBy : undefined,
    };
  } catch {
    return fallback;
  }
}

function writeLocalGlobal3DConfig(config: Global3DViewerConfig): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_GLOBAL_3D_CONFIG_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(HERITAGE_3D_VISIBILITY_UPDATED_EVENT));
  } catch {
    // ignore
  }
}

// Singleton shared real-time store so multiple components don't duplicate onSnapshot listeners
let sharedSiteMap: Record<string, Heritage3DSiteVisibilityRecord> = readLocalSite3DMap();
let sharedGlobalConfig: Global3DViewerConfig = readLocalGlobal3DConfig();
let sharedSyncedCloud = false;
const subscribers = new Set<(snap: Heritage3DVisibilitySnapshot) => void>();
let activeUnsubs: Unsubscribe[] | null = null;

function notifyAllSubscribers(): void {
  const snap: Heritage3DVisibilitySnapshot = {
    siteMap: { ...sharedSiteMap },
    globalConfig: { ...sharedGlobalConfig },
    syncedFromCloud: sharedSyncedCloud,
  };
  subscribers.forEach((cb) => cb(snap));
}

function ensureRealtimeListenersStarted(): void {
  if (activeUnsubs !== null) return;
  activeUnsubs = [];

  void testFirestoreConnectionOnce();
  const db = getAppFirestore();
  if (!db) return;

  const unsubSites = onSnapshot(
    collection(db, 'cms_heritage_sites'),
    (snapshot) => {
      const nextMap: Record<string, Heritage3DSiteVisibilityRecord> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Partial<Heritage3DSiteVisibilityRecord>;
        const siteId = (data.siteId || docSnap.id || '').trim();
        if (!siteId) return;
        nextMap[siteId] = {
          siteId,
          is3DModelHidden: Boolean(data.is3DModelHidden),
          hidden3DReason:
            typeof data.hidden3DReason === 'string' && data.hidden3DReason.trim()
              ? data.hidden3DReason.trim()
              : undefined,
          updatedAt:
            typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
          updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
        };
      });
      sharedSiteMap = nextMap;
      sharedSyncedCloud = true;
      writeLocalSite3DMap(nextMap);
      notifyAllSubscribers();
    },
    (error) => {
      reportFirestoreError(error, FirestoreOperationType.LIST, 'cms_heritage_sites');
    }
  );

  const unsubGlobal = onSnapshot(
    doc(collection(db, 'system_settings'), 'viewer_3d_config'),
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<Global3DViewerConfig>;
        sharedGlobalConfig = {
          isGlobal3DHidden: Boolean(data.isGlobal3DHidden),
          globalHiddenReason:
            typeof data.globalHiddenReason === 'string' && data.globalHiddenReason.trim()
              ? data.globalHiddenReason.trim()
              : DEFAULT_GLOBAL_HIDDEN_3D_REASON,
          updatedAt:
            typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
          updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : undefined,
        };
      } else {
        sharedGlobalConfig = {
          isGlobal3DHidden: false,
          globalHiddenReason: DEFAULT_GLOBAL_HIDDEN_3D_REASON,
          updatedAt: '',
        };
      }
      sharedSyncedCloud = true;
      writeLocalGlobal3DConfig(sharedGlobalConfig);
      notifyAllSubscribers();
    },
    (error) => {
      reportFirestoreError(
        error,
        FirestoreOperationType.GET,
        'system_settings/viewer_3d_config'
      );
    }
  );

  activeUnsubs.push(unsubSites, unsubGlobal);
}

export function subscribeHeritage3DVisibility(
  cb: (snap: Heritage3DVisibilitySnapshot) => void
): () => void {
  ensureRealtimeListenersStarted();
  subscribers.add(cb);
  cb({
    siteMap: { ...sharedSiteMap },
    globalConfig: { ...sharedGlobalConfig },
    syncedFromCloud: sharedSyncedCloud,
  });

  const onLocalEvent = () => {
    sharedSiteMap = readLocalSite3DMap();
    sharedGlobalConfig = readLocalGlobal3DConfig();
    cb({
      siteMap: { ...sharedSiteMap },
      globalConfig: { ...sharedGlobalConfig },
      syncedFromCloud: sharedSyncedCloud,
    });
  };
  if (typeof window !== 'undefined') {
    window.addEventListener(HERITAGE_3D_VISIBILITY_UPDATED_EVENT, onLocalEvent);
  }

  return () => {
    subscribers.delete(cb);
    if (typeof window !== 'undefined') {
      window.removeEventListener(HERITAGE_3D_VISIBILITY_UPDATED_EVENT, onLocalEvent);
    }
  };
}

export function getHeritage3DVisibilitySnapshot(): Heritage3DVisibilitySnapshot {
  return {
    siteMap: { ...sharedSiteMap },
    globalConfig: { ...sharedGlobalConfig },
    syncedFromCloud: sharedSyncedCloud,
  };
}

export function useHeritage3DVisibility() {
  const [snapshot, setSnapshot] = useState<Heritage3DVisibilitySnapshot>(() =>
    getHeritage3DVisibilitySnapshot()
  );

  useEffect(() => {
    const unsub = subscribeHeritage3DVisibility((next) => {
      setSnapshot(next);
    });
    return () => unsub();
  }, []);

  const isSite3DModelHidden = useCallback(
    (siteId: string): boolean => {
      if (snapshot.globalConfig.isGlobal3DHidden) return true;
      const cloudRecord = snapshot.siteMap[siteId];
      if (cloudRecord) {
        return Boolean(cloudRecord.is3DModelHidden);
      }
      const legacy = loadCmsSiteOverrides()[siteId];
      return legacy?.modelVisibility === 'hidden';
    },
    [snapshot]
  );

  const isSiteIndividuallyHidden = useCallback(
    (siteId: string): boolean => {
      const cloudRecord = snapshot.siteMap[siteId];
      if (cloudRecord) {
        return Boolean(cloudRecord.is3DModelHidden);
      }
      const legacy = loadCmsSiteOverrides()[siteId];
      return legacy?.modelVisibility === 'hidden';
    },
    [snapshot]
  );

  const getSite3DHiddenReason = useCallback(
    (siteId: string): string => {
      if (snapshot.globalConfig.isGlobal3DHidden) {
        return snapshot.globalConfig.globalHiddenReason || DEFAULT_GLOBAL_HIDDEN_3D_REASON;
      }
      return snapshot.siteMap[siteId]?.hidden3DReason || DEFAULT_HIDDEN_3D_REASON;
    },
    [snapshot]
  );

  return {
    siteMap: snapshot.siteMap,
    globalConfig: snapshot.globalConfig,
    isGlobal3DHidden: snapshot.globalConfig.isGlobal3DHidden,
    syncedFromCloud: snapshot.syncedFromCloud,
    isSite3DModelHidden,
    isSiteIndividuallyHidden,
    getSite3DHiddenReason,
  };
}

export async function setSite3DModelVisibility(params: {
  siteId: string;
  siteName?: string;
  is3DModelHidden: boolean;
  hidden3DReason?: string;
  actor: { uid?: string; email?: string; displayName?: string };
}): Promise<{ ok: boolean; syncedCloud: boolean; error?: string }> {
  const nowIso = new Date().toISOString();
  const cleanSiteId = params.siteId.trim();
  if (!cleanSiteId) {
    return { ok: false, syncedCloud: false, error: 'Thiếu mã di tích.' };
  }

  const reason = (params.hidden3DReason || '').trim().slice(0, 600) || DEFAULT_HIDDEN_3D_REASON;
  const record: Heritage3DSiteVisibilityRecord = {
    siteId: cleanSiteId,
    is3DModelHidden: Boolean(params.is3DModelHidden),
    hidden3DReason: reason,
    updatedAt: nowIso,
    updatedBy: (params.actor.email || params.actor.displayName || 'admin').slice(0, 160),
  };

  // Update local cache & legacy CMS override immediately
  sharedSiteMap = { ...sharedSiteMap, [cleanSiteId]: record };
  writeLocalSite3DMap(sharedSiteMap);
  saveCmsSiteOverride(
    cleanSiteId,
    { modelVisibility: record.is3DModelHidden ? 'hidden' : 'published' },
    params.actor.email || 'admin'
  );
  notifyAllSubscribers();

  let syncedCloud = false;
  const db = getAppFirestore();
  if (db) {
    try {
      await withFirestoreTimeout(
        setDoc(doc(collection(db, 'cms_heritage_sites'), cleanSiteId), record, { merge: true }),
        4500,
        `toggle_3d_${cleanSiteId}`
      );
      syncedCloud = true;
    } catch (err) {
      reportFirestoreError(
        err,
        FirestoreOperationType.WRITE,
        `cms_heritage_sites/${cleanSiteId}`
      );
      return {
        ok: false,
        syncedCloud: false,
        error:
          err instanceof Error
            ? `Không thể đồng bộ trạng thái 3D lên Cloud Firestore: ${err.message}`
            : 'Không thể đồng bộ trạng thái 3D lên Cloud Firestore.',
      };
    }
  }

  void recordActivityLog({
    action: 'CMS_TOGGLE_3D',
    actorUid: params.actor.uid,
    actorEmail: params.actor.email,
    actorName: params.actor.displayName,
    targetId: cleanSiteId,
    detail: `${record.is3DModelHidden ? 'Ẩn' : 'Hiện'} mô hình 3D di tích ${params.siteName || cleanSiteId}${record.is3DModelHidden ? ` · Lý do: ${reason}` : ''}`,
  });

  return { ok: true, syncedCloud };
}

export async function saveGlobal3DViewerConfig(params: {
  isGlobal3DHidden: boolean;
  globalHiddenReason?: string;
  actor: { uid?: string; email?: string; displayName?: string };
}): Promise<{ ok: boolean; syncedCloud: boolean; error?: string }> {
  const nowIso = new Date().toISOString();
  const reason =
    (params.globalHiddenReason || '').trim().slice(0, 600) || DEFAULT_GLOBAL_HIDDEN_3D_REASON;

  const config: Global3DViewerConfig = {
    isGlobal3DHidden: Boolean(params.isGlobal3DHidden),
    globalHiddenReason: reason,
    updatedAt: nowIso,
    updatedBy: (params.actor.email || params.actor.displayName || 'admin').slice(0, 160),
  };

  sharedGlobalConfig = config;
  writeLocalGlobal3DConfig(config);
  notifyAllSubscribers();

  let syncedCloud = false;
  const db = getAppFirestore();
  if (db) {
    try {
      await withFirestoreTimeout(
        setDoc(doc(collection(db, 'system_settings'), 'viewer_3d_config'), config, { merge: true }),
        4500,
        'save_global_3d_config'
      );
      syncedCloud = true;
    } catch (err) {
      reportFirestoreError(
        err,
        FirestoreOperationType.WRITE,
        'system_settings/viewer_3d_config'
      );
      return {
        ok: false,
        syncedCloud: false,
        error:
          err instanceof Error
            ? `Không thể lưu chế độ bảo trì 3D lên Cloud Firestore: ${err.message}`
            : 'Không thể lưu chế độ bảo trì 3D lên Cloud Firestore.',
      };
    }
  }

  void recordActivityLog({
    action: 'CMS_TOGGLE_3D',
    actorUid: params.actor.uid,
    actorEmail: params.actor.email,
    actorName: params.actor.displayName,
    targetId: 'viewer_3d_config',
    detail: `${config.isGlobal3DHidden ? 'Bật' : 'Tắt'} chế độ ẩn toàn bộ Mô hình 3D (Bảo trì hệ thống 3D)${config.isGlobal3DHidden ? ` · Lý do: ${reason}` : ''}`,
  });

  return { ok: true, syncedCloud };
}
