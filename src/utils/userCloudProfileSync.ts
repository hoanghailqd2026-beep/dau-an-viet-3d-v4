import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { firebaseAuth } from '../lib/firebaseAuth';
import {
  FirestoreOperationType,
  getAppFirestore,
  reportFirestoreError,
  testFirestoreConnectionOnce,
  withFirestoreTimeout,
} from '../lib/firebaseDb';
import {
  getVisitorRecord,
  recordVisitorExploredSite,
} from './adminPlatformStore';
import { fetchUserTicketsFromCloud } from './paymentOrdersRtdb';

export enum UserSyncOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const CLOUD_TIMEOUT_MS = 12000;

function logUserProfileFirestoreError(
  error: unknown,
  operationType: UserSyncOperationType,
  path: string | null
): void {
  reportFirestoreError(
    error,
    operationType as unknown as FirestoreOperationType,
    path
  );
}

function clampExploredIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return Array.from(
    new Set(ids.filter((item): item is string => typeof item === 'string' && item.trim().length > 0))
  ).slice(0, 17);
}

export type CloudUserProvider = 'google' | 'facebook' | 'password';

export interface SyncUserCloudProfileParams {
  uid: string;
  userId: string;
  email: string;
  displayName: string;
  provider: CloudUserProvider;
  photoURL?: string;
}

export interface SyncedUserCloudSnapshot {
  exploredSiteIds: string[];
  bestQuizScore: number;
  quizAttempts: number;
  isSuspended?: boolean;
}

export interface FirestoreUserDirectoryItem {
  uid: string;
  email: string;
  displayName: string;
  provider: CloudUserProvider;
  tier: string;
  hasSchoolPackage: boolean;
  isSuspended: boolean;
  suspendedAt?: string;
  suspendedBy?: string;
  exploredCount: number;
  bestQuizScore: number;
  updatedAt: string;
}

function readLocalBestQuizKey(uid: string): string {
  return `dau_an_viet_quiz_progress_v1_${uid}`;
}

export function readLocalUserQuizStats(uid?: string | null): {
  bestQuizScore: number;
  quizAttempts: number;
} {
  if (typeof window === 'undefined' || !uid) {
    return { bestQuizScore: 0, quizAttempts: 0 };
  }
  try {
    const raw = window.localStorage.getItem(readLocalBestQuizKey(uid));
    if (!raw) return { bestQuizScore: 0, quizAttempts: 0 };
    const parsed = JSON.parse(raw) as { bestQuizScore?: unknown; quizAttempts?: unknown };
    return {
      bestQuizScore:
        typeof parsed.bestQuizScore === 'number' && Number.isFinite(parsed.bestQuizScore)
          ? Math.max(0, Math.min(100, Math.round(parsed.bestQuizScore)))
          : 0,
      quizAttempts:
        typeof parsed.quizAttempts === 'number' && Number.isFinite(parsed.quizAttempts)
          ? Math.max(0, Math.min(10000, Math.round(parsed.quizAttempts)))
          : 0,
    };
  } catch {
    return { bestQuizScore: 0, quizAttempts: 0 };
  }
}

export function writeLocalUserQuizStats(
  uid: string,
  bestQuizScore: number,
  quizAttempts: number
): void {
  if (typeof window === 'undefined' || !uid) return;
  try {
    window.localStorage.setItem(
      readLocalBestQuizKey(uid),
      JSON.stringify({
        bestQuizScore: Math.max(0, Math.min(100, Math.round(bestQuizScore))),
        quizAttempts: Math.max(0, Math.min(10000, Math.round(quizAttempts))),
        updatedAt: new Date().toISOString(),
      })
    );
  } catch {
    // ignore storage errors
  }
}

export async function checkFirestoreUserSuspended(uid: string): Promise<boolean> {
  const cleanUid = uid.trim();
  if (!cleanUid) return false;
  const db = getAppFirestore();
  if (!db || !firebaseAuth.currentUser) return false;
  try {
    const snap = await withFirestoreTimeout(
      getDoc(doc(collection(db, 'users'), cleanUid)),
      CLOUD_TIMEOUT_MS,
      `check_suspended_${cleanUid}`
    );
    if (!snap.exists()) return false;
    return Boolean(snap.data()?.isSuspended);
  } catch {
    return false;
  }
}

/**
 * Automatically creates or loads `users/{uid}` in Cloud Firestore on Google/Facebook/Password login
 * or Firebase session restoration, merging explored monuments, quiz scores, and ticket bundles.
 */
export async function syncUserCloudProfileOnAuth(
  params: SyncUserCloudProfileParams
): Promise<SyncedUserCloudSnapshot | null> {
  const cleanUid = params.uid.trim();
  if (!cleanUid) return null;

  await testFirestoreConnectionOnce();

  const db = getAppFirestore();
  const visitor = getVisitorRecord(params.userId);
  const localExplored = clampExploredIds(visitor?.exploredSiteIds);
  const localQuiz = readLocalUserQuizStats(cleanUid);

  if (!db || !firebaseAuth.currentUser || firebaseAuth.currentUser.uid !== cleanUid) {
    return {
      exploredSiteIds: localExplored,
      bestQuizScore: localQuiz.bestQuizScore,
      quizAttempts: localQuiz.quizAttempts,
      isSuspended: false,
    };
  }

  const docPath = `users/${cleanUid}`;
  const userDocRef = doc(collection(db, 'users'), cleanUid);
  const nowIso = new Date().toISOString();

  try {
    const snap = await withFirestoreTimeout(
      getDoc(userDocRef),
      CLOUD_TIMEOUT_MS,
      `get_user_profile_${cleanUid}`
    );

    if (!snap.exists()) {
      const safeEmail = (params.email || '').toLowerCase().trim().slice(0, 254);
      const safeDisplayName = (params.displayName || '').trim().slice(0, 160) || 'Du khách';
      const safePhotoUrl =
        typeof params.photoURL === 'string' && params.photoURL.trim()
          ? params.photoURL.trim().slice(0, 1024)
          : '';
      const initialPayload: Record<string, unknown> = {
        uid: cleanUid,
        email: safeEmail,
        displayName: safeDisplayName,
        provider: params.provider,
        ...(safePhotoUrl ? { photoURL: safePhotoUrl } : {}),
        tier: 'basic',
        unlockedSiteIds: [],
        unlockedRouteIds: [],
        hasSchoolPackage: false,
        isSuspended: false,
        ticketCodes: [],
        activeOrderIds: [],
        exploredSiteIds: localExplored,
        bestQuizScore: localQuiz.bestQuizScore,
        quizAttempts: localQuiz.quizAttempts,
        updatedAt: nowIso,
      };
      await withFirestoreTimeout(
        setDoc(userDocRef, initialPayload),
        CLOUD_TIMEOUT_MS,
        `create_user_profile_${cleanUid}`
      );
      return {
        exploredSiteIds: localExplored,
        bestQuizScore: localQuiz.bestQuizScore,
        quizAttempts: localQuiz.quizAttempts,
        isSuspended: false,
      };
    }

    const remoteData = snap.data() as Record<string, unknown>;
    const isSuspended = Boolean(remoteData.isSuspended);
    const remoteExplored = clampExploredIds(remoteData.exploredSiteIds);
    const mergedExplored = clampExploredIds([...remoteExplored, ...localExplored]);

    for (const siteId of mergedExplored) {
      if (!localExplored.includes(siteId)) {
        recordVisitorExploredSite(params.userId, siteId);
      }
    }

    const remoteBestQuiz =
      typeof remoteData.bestQuizScore === 'number' && Number.isFinite(remoteData.bestQuizScore)
        ? Math.max(0, Math.min(100, Math.round(remoteData.bestQuizScore)))
        : 0;
    const remoteAttempts =
      typeof remoteData.quizAttempts === 'number' && Number.isFinite(remoteData.quizAttempts)
        ? Math.max(0, Math.min(10000, Math.round(remoteData.quizAttempts)))
        : 0;

    const mergedBestQuiz = Math.max(localQuiz.bestQuizScore, remoteBestQuiz);
    const mergedAttempts = Math.max(localQuiz.quizAttempts, remoteAttempts);
    writeLocalUserQuizStats(cleanUid, mergedBestQuiz, mergedAttempts);

    // Sync approved passes & tier snapshot locally
    void fetchUserTicketsFromCloud(cleanUid);

    if (!isSuspended) {
      const safeEmail = (params.email || '').toLowerCase().trim().slice(0, 254);
      const safeDisplayName = (params.displayName || '').trim().slice(0, 160);
      const safePhotoUrl =
        typeof params.photoURL === 'string' && params.photoURL.trim()
          ? params.photoURL.trim().slice(0, 1024)
          : '';
      const safeUpdatePayload: Record<string, unknown> = {
        email: safeEmail || String(remoteData.email || '').slice(0, 254),
        displayName: safeDisplayName || String(remoteData.displayName || 'Du khách').slice(0, 160),
        provider: params.provider,
        ...(safePhotoUrl ? { photoURL: safePhotoUrl } : {}),
        exploredSiteIds: mergedExplored,
        bestQuizScore: mergedBestQuiz,
        quizAttempts: mergedAttempts,
        updatedAt: nowIso,
      };

      await withFirestoreTimeout(
        setDoc(userDocRef, safeUpdatePayload, { merge: true }),
        CLOUD_TIMEOUT_MS,
        `update_user_profile_${cleanUid}`
      );
    }

    return {
      exploredSiteIds: mergedExplored,
      bestQuizScore: mergedBestQuiz,
      quizAttempts: mergedAttempts,
      isSuspended,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('timeout')) {
      console.warn(`[user_profile] Firestore sync timed out (${docPath}):`, msg);
    } else {
      logUserProfileFirestoreError(err, UserSyncOperationType.WRITE, docPath);
    }
    return {
      exploredSiteIds: localExplored,
      bestQuizScore: localQuiz.bestQuizScore,
      quizAttempts: localQuiz.quizAttempts,
      isSuspended: false,
    };
  }
}

export function subscribeUserSuspensionState(
  uid: string,
  onStatusChange: (isSuspended: boolean) => void
): Unsubscribe {
  const cleanUid = (uid || '').trim();
  const db = getAppFirestore();
  if (!cleanUid || !db || !firebaseAuth.currentUser || firebaseAuth.currentUser.uid !== cleanUid) {
    return () => undefined;
  }

  return onSnapshot(
    doc(collection(db, 'users'), cleanUid),
    (snap) => {
      if (!snap.exists()) return;
      onStatusChange(Boolean(snap.data()?.isSuspended));
    },
    (error) => {
      logUserProfileFirestoreError(error, UserSyncOperationType.GET, `users/${cleanUid}`);
    }
  );
}

export async function setFirestoreUserSuspended(params: {
  uid: string;
  email?: string;
  displayName?: string;
  provider?: CloudUserProvider;
  isSuspended: boolean;
  adminEmail: string;
}): Promise<{ ok: boolean; error?: string }> {
  const cleanUid = params.uid.trim();
  if (!cleanUid) {
    return { ok: false, error: 'Thiếu UID tài khoản cần cập nhật.' };
  }
  const db = getAppFirestore();
  if (!db) {
    return { ok: false, error: 'Chưa khởi tạo kết nối Cloud Firestore.' };
  }

  const nowIso = new Date().toISOString();
  const docRef = doc(collection(db, 'users'), cleanUid);

  try {
    const existing = await withFirestoreTimeout(
      getDoc(docRef),
      CLOUD_TIMEOUT_MS,
      `read_user_for_suspend_${cleanUid}`
    );

    if (existing.exists()) {
      await withFirestoreTimeout(
        setDoc(
          docRef,
          {
            isSuspended: Boolean(params.isSuspended),
            suspendedAt: params.isSuspended ? nowIso : '',
            suspendedBy: params.isSuspended ? params.adminEmail.slice(0, 254) : '',
            updatedAt: nowIso,
          },
          { merge: true }
        ),
        CLOUD_TIMEOUT_MS,
        `suspend_user_${cleanUid}`
      );
    } else {
      await withFirestoreTimeout(
        setDoc(docRef, {
          uid: cleanUid,
          email: (params.email || '').toLowerCase().trim(),
          displayName: (params.displayName || 'Du khách').trim().slice(0, 160),
          provider: params.provider || 'password',
          tier: 'basic',
          hasSchoolPackage: false,
          isSuspended: Boolean(params.isSuspended),
          suspendedAt: params.isSuspended ? nowIso : '',
          suspendedBy: params.isSuspended ? params.adminEmail.slice(0, 254) : '',
          updatedAt: nowIso,
        }),
        CLOUD_TIMEOUT_MS,
        `create_suspended_user_${cleanUid}`
      );
    }
    return { ok: true };
  } catch (err) {
    logUserProfileFirestoreError(err, UserSyncOperationType.UPDATE, `users/${cleanUid}`);
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Không thể cập nhật trạng thái khóa trên Firestore: ${err.message}`
          : 'Không thể cập nhật trạng thái khóa trên Firestore.',
    };
  }
}

export function subscribeAllFirestoreUsers(
  onUpdate: (users: FirestoreUserDirectoryItem[]) => void
): Unsubscribe {
  const db = getAppFirestore();
  if (!db || !firebaseAuth.currentUser) {
    return () => undefined;
  }

  return onSnapshot(
    collection(db, 'users'),
    (snap) => {
      const list: FirestoreUserDirectoryItem[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data() as Record<string, unknown>;
        const providerRaw = String(d.provider || 'google');
        const provider: CloudUserProvider =
          providerRaw === 'facebook' || providerRaw === 'password' ? providerRaw : 'google';
        list.push({
          uid: String(d.uid || docSnap.id),
          email: String(d.email || '').toLowerCase().trim(),
          displayName: String(d.displayName || d.email || docSnap.id),
          provider,
          tier: String(d.tier || 'basic'),
          hasSchoolPackage: Boolean(d.hasSchoolPackage),
          isSuspended: Boolean(d.isSuspended),
          suspendedAt: typeof d.suspendedAt === 'string' ? d.suspendedAt : undefined,
          suspendedBy: typeof d.suspendedBy === 'string' ? d.suspendedBy : undefined,
          exploredCount: Array.isArray(d.exploredSiteIds) ? d.exploredSiteIds.length : 0,
          bestQuizScore: typeof d.bestQuizScore === 'number' ? d.bestQuizScore : 0,
          updatedAt: typeof d.updatedAt === 'string' ? d.updatedAt : '',
        });
      });
      list.sort((a, b) => Date.parse(b.updatedAt || '0') - Date.parse(a.updatedAt || '0'));
      onUpdate(list);
    },
    (error) => {
      logUserProfileFirestoreError(error, UserSyncOperationType.LIST, 'users');
    }
  );
}

export async function pushUserProgressToFirestore(params: {
  uid?: string | null;
  userId?: string | null;
  quizScorePercent?: number;
  incrementQuizAttempt?: boolean;
}): Promise<void> {
  const cleanUid = (params.uid || '').trim();
  if (!cleanUid) return;

  const prevQuiz = readLocalUserQuizStats(cleanUid);
  const nextBestQuiz =
    typeof params.quizScorePercent === 'number'
      ? Math.max(prevQuiz.bestQuizScore, Math.min(100, Math.round(params.quizScorePercent)))
      : prevQuiz.bestQuizScore;
  const nextAttempts = params.incrementQuizAttempt
    ? Math.min(10000, prevQuiz.quizAttempts + 1)
    : prevQuiz.quizAttempts;
  writeLocalUserQuizStats(cleanUid, nextBestQuiz, nextAttempts);

  const visitor = params.userId ? getVisitorRecord(params.userId) : undefined;
  const exploredSiteIds = clampExploredIds(visitor?.exploredSiteIds);

  const db = getAppFirestore();
  if (!db || !firebaseAuth.currentUser || firebaseAuth.currentUser.uid !== cleanUid) {
    return;
  }

  const docPath = `users/${cleanUid}`;
  try {
    await withFirestoreTimeout(
      setDoc(
        doc(collection(db, 'users'), cleanUid),
        {
          exploredSiteIds,
          bestQuizScore: nextBestQuiz,
          quizAttempts: nextAttempts,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ),
      CLOUD_TIMEOUT_MS,
      `push_user_progress_${cleanUid}`
    );
  } catch (err) {
    logUserProfileFirestoreError(err, UserSyncOperationType.UPDATE, docPath);
  }
}
