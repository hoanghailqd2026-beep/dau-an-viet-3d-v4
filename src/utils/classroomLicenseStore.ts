/**
 * Ultra Classroom (Gói Ultra · 500.000đ) Licensing & 35-Seat Student Pro Entitlement Store
 * - Teacher (buyer of Gói Ultra 500.000đ) gets automatic `ULTRA-XXXXXX` invite code
 *   and can distribute "Gói Pro (Tài trợ bởi Lớp học)" to up to 35 students via invite code
 *   OR single/bulk Gmail entry, lock/rotate invite codes, edit student displayName/groupName,
 *   suspend/unsuspend or kick students, view analytics + CSV export, and pin class assignments.
 * - Students enter `ULTRA-XXXXXX` (or legacy `PRO-LOP-XXXXX`) in "Vé & Học liệu" to instantly
 *   unlock Gói Pro (35 seats max), protected by anti-spam rate limiting (max 5 failed attempts / 10 min)
 *   and strict 1-seat-per-account deduplication.
 * - Syncs with Cloud Firestore (`classroom_licenses`, `classroom_invites`, `classroom_grants`)
 *   with bounded 3000ms timeouts + full localStorage fallback.
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
  updateDoc,
  where,
  writeBatch,
  type Firestore,
  type Unsubscribe as FirestoreUnsubscribe,
} from 'firebase/firestore';
import { firebaseAuth } from '../lib/firebaseAuth';
import { getAppFirestore } from '../lib/firebaseDb';

export const CLASSROOM_MAX_SEATS = 35;
export const INVITE_MAX_FAILED_ATTEMPTS = 5;
export const INVITE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const CLOUD_OP_TIMEOUT_MS = 3000;

export const CLASSROOM_UPDATED_EVENT = 'dau-an-viet-classroom-license-updated';

const KEY_LICENSES = 'tgds_classroom_licenses_v1';
const KEY_INVITES = 'tgds_classroom_invites_v1';
const KEY_GRANTS = 'tgds_classroom_grants_v1';
const KEY_ATTEMPTS_PREFIX = 'tgds_classroom_invite_attempts_';

export type AssignmentRegionTopic = 'all' | 'hcm' | 'bd' | 'brvt';

export interface ClassroomAssignment {
  id: string;
  title: string;
  regionTopic: AssignmentRegionTopic;
  requiredQuizCount: number;
  deadline: string;
  updatedAt: string;
}

export interface ClassroomLicenseRecord {
  teacherUid: string;
  teacherEmail: string;
  teacherName: string;
  orderId?: string;
  schoolName?: string;
  className?: string;
  classNote?: string;
  inviteCode: string;
  inviteCodeLocked?: boolean;
  assignment?: ClassroomAssignment | null;
  maxSeats: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomInviteRecord {
  inviteCode: string;
  teacherUid: string;
  teacherName: string;
  schoolName?: string;
  className?: string;
  classNote?: string;
  inviteCodeLocked?: boolean;
  assignment?: ClassroomAssignment | null;
  maxSeats: number;
  seatCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ClassroomGrantStatus = 'active' | 'pending' | 'suspended' | 'revoked';

export interface ClassroomGrantRecord {
  grantId: string;
  teacherUid: string;
  teacherName: string;
  schoolName?: string;
  className?: string;
  inviteCode: string;
  studentEmail: string;
  studentUid?: string;
  studentName?: string;
  displayName?: string;
  groupName?: string;
  method: 'teacher_email' | 'invite_code';
  status: ClassroomGrantStatus;
  exploredSiteIds?: string[];
  exploredCount?: number;
  quizAttempts?: number;
  bestQuizScore?: number;
  activatedAt?: string;
  grantedAt: string;
  updatedAt: string;
}

export interface InviteAttemptGuardStatus {
  allowed: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  remainingAttempts: number;
  retryAfterSec: number;
}

export interface BulkAddStudentsResult {
  addedCount: number;
  errors: string[];
  addedGrants: ClassroomGrantRecord[];
}

export interface StudentClassroomRealtimeState {
  activeGrant: ClassroomGrantRecord | null;
  inviteMeta: ClassroomInviteRecord | null;
  statusChangeNotice: 'suspended' | 'removed' | null;
}

function getClassroomFirestore(): Firestore | null {
  return getAppFirestore();
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = CLOUD_OP_TIMEOUT_MS, label = 'classroom'): Promise<T> {
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

function emitClassroomUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CLASSROOM_UPDATED_EVENT));
  }
}

function readLocalMap<T>(key: string): Record<string, T> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, T>)
      : {};
  } catch {
    return {};
  }
}

function writeLocalMap<T>(key: string, map: Record<string, T>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // ignore storage quota errors
  }
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export function normalizeEmailLower(email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

export function isValidGmailOrEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function sanitizeEmailForDocId(email: string): string {
  return normalizeEmailLower(email)
    .replace(/@/g, '_at_')
    .replace(/[^a-z0-9._-]/g, '_')
    .slice(0, 100);
}

export function buildClassroomGrantId(teacherUid: string, studentEmail: string): string {
  const safeTeacher = teacherUid.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 48);
  const safeStudent = sanitizeEmailForDocId(studentEmail);
  return `${safeTeacher}__${safeStudent}`;
}

export function generateClassroomInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `ULTRA-${suffix}`;
}

export function isValidInviteCodeFormat(rawCode: string): boolean {
  const clean = rawCode.trim().toUpperCase();
  return /^(?:ULTRA|PRO-LOP)-[A-Z0-9]{4,12}$/.test(clean);
}

export function getInviteByCodeLocally(inviteCode?: string | null): ClassroomInviteRecord | null {
  const clean = (inviteCode || '').trim().toUpperCase();
  if (!clean) return null;
  const map = readLocalMap<ClassroomInviteRecord>(KEY_INVITES);
  return map[clean] || null;
}

function saveLicenseLocally(license: ClassroomLicenseRecord): void {
  const map = readLocalMap<ClassroomLicenseRecord>(KEY_LICENSES);
  map[license.teacherUid] = license;
  writeLocalMap(KEY_LICENSES, map);
}

function saveInviteLocally(invite: ClassroomInviteRecord): void {
  const map = readLocalMap<ClassroomInviteRecord>(KEY_INVITES);
  map[invite.inviteCode] = invite;
  writeLocalMap(KEY_INVITES, map);
}

function saveGrantLocally(grant: ClassroomGrantRecord): void {
  const map = readLocalMap<ClassroomGrantRecord>(KEY_GRANTS);
  map[grant.grantId] = grant;
  writeLocalMap(KEY_GRANTS, map);
}

function deleteGrantLocally(grantId: string): void {
  const map = readLocalMap<ClassroomGrantRecord>(KEY_GRANTS);
  if (map[grantId]) {
    delete map[grantId];
    writeLocalMap(KEY_GRANTS, map);
  }
}

export function loadLocalLicenseForTeacher(teacherUid?: string | null): ClassroomLicenseRecord | null {
  if (!teacherUid) return null;
  const map = readLocalMap<ClassroomLicenseRecord>(KEY_LICENSES);
  return map[teacherUid] || null;
}

/**
 * Loads all non-revoked students occupying seats in the teacher's Ultra roster
 * (`active`, `pending`, `suspended` all count toward the 35-seat quota until kicked).
 */
export function loadLocalGrantsForTeacher(teacherUid?: string | null): ClassroomGrantRecord[] {
  if (!teacherUid) return [];
  const map = readLocalMap<ClassroomGrantRecord>(KEY_GRANTS);
  return Object.values(map)
    .filter((g) => g && g.teacherUid === teacherUid && g.status !== 'revoked')
    .sort((a, b) => Date.parse(b.grantedAt) - Date.parse(a.grantedAt));
}

/**
 * Fast synchronous check for whether the signed-in student currently has an ACTIVE
 * Classroom Pro grant (suspended/pending/revoked grants do NOT unlock Pro).
 */
export function getActiveClassroomProGrantForUser(
  uid?: string | null,
  email?: string | null
): ClassroomGrantRecord | null {
  const cleanUid = (uid || '').trim();
  const cleanEmail = normalizeEmailLower(email);
  if ((!cleanUid || cleanUid === 'guest') && !cleanEmail) return null;

  const map = readLocalMap<ClassroomGrantRecord>(KEY_GRANTS);
  for (const grant of Object.values(map)) {
    if (!grant || grant.status !== 'active') continue;
    if (cleanUid && cleanUid !== 'guest' && grant.studentUid && grant.studentUid === cleanUid) {
      return grant;
    }
    if (cleanEmail && normalizeEmailLower(grant.studentEmail) === cleanEmail) {
      return grant;
    }
  }
  return null;
}

/**
 * Checks whether the signed-in user has any classroom grant record locally (including suspended/pending)
 * so the UI can display their class membership or notice.
 */
export function getAnyClassroomGrantForUserLocally(
  uid?: string | null,
  email?: string | null
): ClassroomGrantRecord | null {
  const cleanUid = (uid || '').trim();
  const cleanEmail = normalizeEmailLower(email);
  if ((!cleanUid || cleanUid === 'guest') && !cleanEmail) return null;

  const map = readLocalMap<ClassroomGrantRecord>(KEY_GRANTS);
  let fallbackMatch: ClassroomGrantRecord | null = null;
  for (const grant of Object.values(map)) {
    if (!grant) continue;
    const matches =
      (cleanUid && cleanUid !== 'guest' && grant.studentUid === cleanUid) ||
      (cleanEmail && normalizeEmailLower(grant.studentEmail) === cleanEmail);
    if (!matches) continue;
    if (grant.status === 'active') return grant;
    if (!fallbackMatch) fallbackMatch = grant;
  }
  return fallbackMatch;
}

// ============================================================================
// TEACHER PROVISIONING, INVITE CODE ROTATION & SEAT MANAGEMENT (35 SEATS)
// ============================================================================

export async function ensureClassroomLicenseForTeacher(params: {
  teacherUid: string;
  teacherEmail: string;
  teacherName: string;
  orderId?: string;
  schoolName?: string;
}): Promise<ClassroomLicenseRecord | null> {
  const teacherUid = params.teacherUid.trim();
  const teacherEmail = normalizeEmailLower(params.teacherEmail);
  const teacherName = (params.teacherName || teacherEmail || 'Giáo viên').trim();
  if (!teacherUid) return null;

  const firestoreDb = getClassroomFirestore();
  const hasSignedInTeacher = Boolean(
    firebaseAuth.currentUser && firebaseAuth.currentUser.uid === teacherUid
  );
  if (firestoreDb && hasSignedInTeacher) {
    try {
      const snap = await withTimeout(
        getDoc(doc(collection(firestoreDb, 'classroom_licenses'), teacherUid)),
        CLOUD_OP_TIMEOUT_MS,
        'get_classroom_license'
      );
      if (snap.exists()) {
        const remote = snap.data() as ClassroomLicenseRecord;
        saveLicenseLocally(remote);
        const existingGrants = loadLocalGrantsForTeacher(teacherUid);
        const localInv = readLocalMap<ClassroomInviteRecord>(KEY_INVITES)[remote.inviteCode];
        if (!localInv) {
          saveInviteLocally({
            inviteCode: remote.inviteCode,
            teacherUid: remote.teacherUid,
            teacherName: remote.teacherName,
            ...(remote.schoolName ? { schoolName: remote.schoolName } : {}),
            ...(remote.className ? { className: remote.className } : {}),
            ...(remote.classNote ? { classNote: remote.classNote } : {}),
            ...(remote.inviteCodeLocked !== undefined
              ? { inviteCodeLocked: remote.inviteCodeLocked }
              : {}),
            ...(remote.assignment ? { assignment: remote.assignment } : {}),
            maxSeats: remote.maxSeats || CLASSROOM_MAX_SEATS,
            seatCount: existingGrants.length,
            active: remote.active,
            createdAt: remote.createdAt,
            updatedAt: remote.updatedAt,
          });
        }
        emitClassroomUpdated();
        return remote;
      }
    } catch {
      // fall through to local or create
    }
  }

  const localExisting = loadLocalLicenseForTeacher(teacherUid);
  if (localExisting) {
    if (firestoreDb && hasSignedInTeacher) {
      const grantsCount = loadLocalGrantsForTeacher(teacherUid).length;
      const inviteDoc: ClassroomInviteRecord = {
        inviteCode: localExisting.inviteCode,
        teacherUid,
        teacherName: localExisting.teacherName,
        ...(localExisting.schoolName ? { schoolName: localExisting.schoolName } : {}),
        ...(localExisting.className ? { className: localExisting.className } : {}),
        ...(localExisting.classNote ? { classNote: localExisting.classNote } : {}),
        ...(localExisting.inviteCodeLocked !== undefined
          ? { inviteCodeLocked: localExisting.inviteCodeLocked }
          : {}),
        ...(localExisting.assignment ? { assignment: localExisting.assignment } : {}),
        maxSeats: CLASSROOM_MAX_SEATS,
        seatCount: Math.min(CLASSROOM_MAX_SEATS, grantsCount),
        active: localExisting.active,
        createdAt: localExisting.createdAt,
        updatedAt: localExisting.updatedAt,
      };
      saveInviteLocally(inviteDoc);
      void Promise.allSettled([
        withTimeout(
          setDoc(
            doc(collection(firestoreDb, 'classroom_licenses'), teacherUid),
            stripUndefined(localExisting as unknown as Record<string, unknown>),
            { merge: true }
          ),
          CLOUD_OP_TIMEOUT_MS,
          'sync_license'
        ),
        withTimeout(
          setDoc(
            doc(collection(firestoreDb, 'classroom_invites'), localExisting.inviteCode),
            stripUndefined(inviteDoc as unknown as Record<string, unknown>),
            { merge: true }
          ),
          CLOUD_OP_TIMEOUT_MS,
          'sync_invite'
        ),
      ]);
    }
    return localExisting;
  }

  const nowIso = new Date().toISOString();
  const inviteCode = generateClassroomInviteCode();
  const defaultClassName = params.schoolName?.trim()
    ? `Lớp Di sản · ${params.schoolName.trim()}`
    : 'Lớp Học Di Sản Ultra (35 chỗ)';
  const newLicense: ClassroomLicenseRecord = {
    teacherUid,
    teacherEmail,
    teacherName,
    ...(params.orderId ? { orderId: params.orderId } : {}),
    ...(params.schoolName?.trim() ? { schoolName: params.schoolName.trim() } : {}),
    className: defaultClassName,
    classNote: 'Niên khóa 2026 · Dấu Ấn Việt 3D',
    inviteCode,
    inviteCodeLocked: false,
    maxSeats: CLASSROOM_MAX_SEATS,
    active: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  const newInvite: ClassroomInviteRecord = {
    inviteCode,
    teacherUid,
    teacherName,
    ...(params.schoolName?.trim() ? { schoolName: params.schoolName.trim() } : {}),
    className: defaultClassName,
    classNote: 'Niên khóa 2026 · Dấu Ấn Việt 3D',
    inviteCodeLocked: false,
    maxSeats: CLASSROOM_MAX_SEATS,
    seatCount: 0,
    active: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  saveLicenseLocally(newLicense);
  saveInviteLocally(newInvite);
  emitClassroomUpdated();

  if (firestoreDb && hasSignedInTeacher) {
    await Promise.allSettled([
      withTimeout(
        setDoc(
          doc(collection(firestoreDb, 'classroom_licenses'), teacherUid),
          stripUndefined(newLicense as unknown as Record<string, unknown>)
        ),
        CLOUD_OP_TIMEOUT_MS,
        'create_classroom_license'
      ),
      withTimeout(
        setDoc(
          doc(collection(firestoreDb, 'classroom_invites'), inviteCode),
          stripUndefined(newInvite as unknown as Record<string, unknown>)
        ),
        CLOUD_OP_TIMEOUT_MS,
        'create_classroom_invite'
      ),
    ]);
  }

  return newLicense;
}

export async function fetchTeacherClassroomState(
  teacherUid: string
): Promise<{ license: ClassroomLicenseRecord | null; grants: ClassroomGrantRecord[] }> {
  const cleanUid = teacherUid.trim();
  if (!cleanUid) return { license: null, grants: [] };

  let license = loadLocalLicenseForTeacher(cleanUid);
  let grants = loadLocalGrantsForTeacher(cleanUid);

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb && firebaseAuth.currentUser && firebaseAuth.currentUser.uid === cleanUid) {
    try {
      const [licSnap, grantsSnap] = await withTimeout(
        Promise.all([
          getDoc(doc(collection(firestoreDb, 'classroom_licenses'), cleanUid)),
          getDocs(
            query(
              collection(firestoreDb, 'classroom_grants'),
              where('teacherUid', '==', cleanUid)
            )
          ),
        ]),
        CLOUD_OP_TIMEOUT_MS,
        'fetch_teacher_classroom_state'
      );

      if (licSnap.exists()) {
        license = licSnap.data() as ClassroomLicenseRecord;
        saveLicenseLocally(license);
      }

      const remoteGrants: ClassroomGrantRecord[] = [];
      const grantsMap = readLocalMap<ClassroomGrantRecord>(KEY_GRANTS);
      for (const [gid, g] of Object.entries(grantsMap)) {
        if (g && g.teacherUid === cleanUid) {
          delete grantsMap[gid];
        }
      }
      grantsSnap.forEach((docSnap) => {
        const item = docSnap.data() as ClassroomGrantRecord;
        if (item && item.grantId) {
          grantsMap[item.grantId] = item;
          if (item.status !== 'revoked') {
            remoteGrants.push(item);
          }
        }
      });
      writeLocalMap(KEY_GRANTS, grantsMap);
      grants = remoteGrants.sort((a, b) => Date.parse(b.grantedAt) - Date.parse(a.grantedAt));
    } catch {
      // Keep local fallback cleanly
    }
  }

  return { license, grants };
}

export function subscribeTeacherClassroomState(
  teacherUid: string | undefined | null,
  callback: (state: { license: ClassroomLicenseRecord | null; grants: ClassroomGrantRecord[] }) => void
): () => void {
  const cleanUid = (teacherUid || '').trim();
  if (!cleanUid) {
    callback({ license: null, grants: [] });
    return () => {};
  }

  let disposed = false;
  let unsubLic: FirestoreUnsubscribe | null = null;
  let unsubGrants: FirestoreUnsubscribe | null = null;

  const emitLocal = () => {
    if (disposed) return;
    callback({
      license: loadLocalLicenseForTeacher(cleanUid),
      grants: loadLocalGrantsForTeacher(cleanUid),
    });
  };
  emitLocal();

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb && firebaseAuth.currentUser && firebaseAuth.currentUser.uid === cleanUid) {
    try {
      unsubLic = onSnapshot(
        doc(collection(firestoreDb, 'classroom_licenses'), cleanUid),
        (snap) => {
          if (disposed || !snap.exists()) return;
          const lic = snap.data() as ClassroomLicenseRecord;
          saveLicenseLocally(lic);
          emitLocal();
        },
        () => {
          // ignore snapshot permission error in preview
        }
      );

      unsubGrants = onSnapshot(
        query(collection(firestoreDb, 'classroom_grants'), where('teacherUid', '==', cleanUid)),
        (snapshot) => {
          if (disposed) return;
          const map = readLocalMap<ClassroomGrantRecord>(KEY_GRANTS);
          for (const [gid, g] of Object.entries(map)) {
            if (g && g.teacherUid === cleanUid) {
              delete map[gid];
            }
          }
          snapshot.forEach((docSnap) => {
            const g = docSnap.data() as ClassroomGrantRecord;
            if (g && g.grantId) {
              map[g.grantId] = g;
            }
          });
          writeLocalMap(KEY_GRANTS, map);
          emitLocal();
        },
        () => {
          // ignore snapshot permission error in preview
        }
      );
    } catch {
      unsubLic = null;
      unsubGrants = null;
    }
  }

  const onLocalUpdate = () => emitLocal();
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === KEY_LICENSES || e.key === KEY_GRANTS || e.key === KEY_INVITES) {
      emitLocal();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener(CLASSROOM_UPDATED_EVENT, onLocalUpdate);
    window.addEventListener('storage', onStorage);
  }

  return () => {
    disposed = true;
    if (unsubLic) unsubLic();
    if (unsubGrants) unsubGrants();
    if (typeof window !== 'undefined') {
      window.removeEventListener(CLASSROOM_UPDATED_EVENT, onLocalUpdate);
      window.removeEventListener('storage', onStorage);
    }
  };
}

export async function updateUltraClassroomInfo(params: {
  license: ClassroomLicenseRecord;
  className: string;
  classNote?: string;
}): Promise<{ ok: boolean; license: ClassroomLicenseRecord }> {
  const nowIso = new Date().toISOString();
  const cleanClassName = params.className.trim().slice(0, 120) || 'Lớp Học Di Sản Ultra';
  const cleanClassNote = (params.classNote || '').trim().slice(0, 240);

  const updatedLicense: ClassroomLicenseRecord = {
    ...params.license,
    className: cleanClassName,
    classNote: cleanClassNote,
    updatedAt: nowIso,
  };

  saveLicenseLocally(updatedLicense);
  const invitesMap = readLocalMap<ClassroomInviteRecord>(KEY_INVITES);
  if (invitesMap[params.license.inviteCode]) {
    invitesMap[params.license.inviteCode] = {
      ...invitesMap[params.license.inviteCode],
      className: cleanClassName,
      classNote: cleanClassNote,
      updatedAt: nowIso,
    };
    writeLocalMap(KEY_INVITES, invitesMap);
  }
  emitClassroomUpdated();

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb && firebaseAuth.currentUser) {
    await Promise.allSettled([
      withTimeout(
        updateDoc(doc(collection(firestoreDb, 'classroom_licenses'), params.license.teacherUid), {
          className: cleanClassName,
          classNote: cleanClassNote,
          updatedAt: nowIso,
        }),
        CLOUD_OP_TIMEOUT_MS,
        'update_ultra_class_info_license'
      ),
      withTimeout(
        updateDoc(doc(collection(firestoreDb, 'classroom_invites'), params.license.inviteCode), {
          className: cleanClassName,
          classNote: cleanClassNote,
          updatedAt: nowIso,
        }),
        CLOUD_OP_TIMEOUT_MS,
        'update_ultra_class_info_invite'
      ),
    ]);
  }

  return { ok: true, license: updatedLicense };
}

export async function toggleUltraInviteCodeLock(params: {
  license: ClassroomLicenseRecord;
  locked: boolean;
}): Promise<{ ok: boolean; license: ClassroomLicenseRecord }> {
  const nowIso = new Date().toISOString();
  const updatedLicense: ClassroomLicenseRecord = {
    ...params.license,
    inviteCodeLocked: params.locked,
    updatedAt: nowIso,
  };

  saveLicenseLocally(updatedLicense);
  const invitesMap = readLocalMap<ClassroomInviteRecord>(KEY_INVITES);
  if (invitesMap[params.license.inviteCode]) {
    invitesMap[params.license.inviteCode] = {
      ...invitesMap[params.license.inviteCode],
      inviteCodeLocked: params.locked,
      updatedAt: nowIso,
    };
    writeLocalMap(KEY_INVITES, invitesMap);
  }
  emitClassroomUpdated();

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb && firebaseAuth.currentUser) {
    await Promise.allSettled([
      withTimeout(
        updateDoc(doc(collection(firestoreDb, 'classroom_licenses'), params.license.teacherUid), {
          inviteCodeLocked: params.locked,
          updatedAt: nowIso,
        }),
        CLOUD_OP_TIMEOUT_MS,
        'toggle_invite_lock_license'
      ),
      withTimeout(
        updateDoc(doc(collection(firestoreDb, 'classroom_invites'), params.license.inviteCode), {
          inviteCodeLocked: params.locked,
          updatedAt: nowIso,
        }),
        CLOUD_OP_TIMEOUT_MS,
        'toggle_invite_lock_invite'
      ),
    ]);
  }

  return { ok: true, license: updatedLicense };
}

export async function rotateTeacherInviteCode(
  license: ClassroomLicenseRecord,
  occupiedSeatCount: number
): Promise<{ ok: boolean; license: ClassroomLicenseRecord; error?: string }> {
  const nowIso = new Date().toISOString();
  const oldCode = license.inviteCode;
  let newCode = generateClassroomInviteCode();
  if (newCode === oldCode) {
    newCode = generateClassroomInviteCode();
  }

  const updatedLicense: ClassroomLicenseRecord = {
    ...license,
    inviteCode: newCode,
    updatedAt: nowIso,
  };
  const boundedSeats = Math.max(0, Math.min(license.maxSeats || CLASSROOM_MAX_SEATS, occupiedSeatCount));
  const nextInvite: ClassroomInviteRecord = {
    inviteCode: newCode,
    teacherUid: license.teacherUid,
    teacherName: license.teacherName,
    ...(license.schoolName ? { schoolName: license.schoolName } : {}),
    ...(license.className ? { className: license.className } : {}),
    ...(license.classNote ? { classNote: license.classNote } : {}),
    ...(license.inviteCodeLocked !== undefined ? { inviteCodeLocked: license.inviteCodeLocked } : {}),
    ...(license.assignment ? { assignment: license.assignment } : {}),
    maxSeats: license.maxSeats || CLASSROOM_MAX_SEATS,
    seatCount: boundedSeats,
    active: true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  saveLicenseLocally(updatedLicense);
  const invitesMap = readLocalMap<ClassroomInviteRecord>(KEY_INVITES);
  if (invitesMap[oldCode]) {
    invitesMap[oldCode] = { ...invitesMap[oldCode], active: false, updatedAt: nowIso };
  }
  invitesMap[newCode] = nextInvite;
  writeLocalMap(KEY_INVITES, invitesMap);
  emitClassroomUpdated();

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb) {
    try {
      await Promise.allSettled([
        withTimeout(
          setDoc(
            doc(collection(firestoreDb, 'classroom_invites'), newCode),
            stripUndefined(nextInvite as unknown as Record<string, unknown>)
          ),
          CLOUD_OP_TIMEOUT_MS,
          'create_new_invite_code'
        ),
        withTimeout(
          updateDoc(doc(collection(firestoreDb, 'classroom_licenses'), license.teacherUid), {
            inviteCode: newCode,
            updatedAt: nowIso,
          }),
          CLOUD_OP_TIMEOUT_MS,
          'update_license_invite_code'
        ),
        oldCode
          ? withTimeout(
              deleteDoc(doc(collection(firestoreDb, 'classroom_invites'), oldCode)),
              CLOUD_OP_TIMEOUT_MS,
              'delete_old_invite_code'
            )
          : Promise.resolve(),
      ]);
    } catch {
      // local mirror preserved
    }
  }

  return { ok: true, license: updatedLicense };
}

export async function grantStudentProByTeacherEmail(params: {
  license: ClassroomLicenseRecord;
  currentGrants: ClassroomGrantRecord[];
  studentEmail: string;
  studentName?: string;
  groupName?: string;
}): Promise<{ ok: boolean; grant?: ClassroomGrantRecord; error?: string }> {
  const normEmail = normalizeEmailLower(params.studentEmail);
  if (!normEmail || !isValidGmailOrEmail(normEmail)) {
    return { ok: false, error: 'Vui lòng nhập địa chỉ Gmail học sinh hợp lệ.' };
  }
  if (normEmail === normalizeEmailLower(params.license.teacherEmail)) {
    return {
      ok: false,
      error: `Không thể thêm Gmail chủ lớp (${normEmail}) vào danh sách học sinh.`,
    };
  }

  const occupiedGrants = params.currentGrants.filter((g) => g.status !== 'revoked');
  const maxSeats = params.license.maxSeats || CLASSROOM_MAX_SEATS;

  if (occupiedGrants.some((g) => normalizeEmailLower(g.studentEmail) === normEmail)) {
    return {
      ok: false,
      error: `Tài khoản ${normEmail} đã nằm trong danh sách lớp học này.`,
    };
  }

  if (occupiedGrants.length >= maxSeats) {
    return {
      ok: false,
      error: `Lớp học đã đạt tối đa ${maxSeats}/${maxSeats} suất học sinh. Vui lòng xóa bớt trước khi thêm mới.`,
    };
  }

  const nowIso = new Date().toISOString();
  const grantId = buildClassroomGrantId(params.license.teacherUid, normEmail);
  const cleanName = params.studentName?.trim();
  const cleanGroup = params.groupName?.trim();
  const nextGrant: ClassroomGrantRecord = {
    grantId,
    teacherUid: params.license.teacherUid,
    teacherName: params.license.teacherName,
    ...(params.license.schoolName ? { schoolName: params.license.schoolName } : {}),
    ...(params.license.className ? { className: params.license.className } : {}),
    inviteCode: params.license.inviteCode,
    studentEmail: normEmail,
    ...(cleanName ? { studentName: cleanName, displayName: cleanName } : {}),
    ...(cleanGroup ? { groupName: cleanGroup } : {}),
    method: 'teacher_email',
    status: 'pending',
    exploredSiteIds: [],
    exploredCount: 0,
    quizAttempts: 0,
    bestQuizScore: 0,
    grantedAt: nowIso,
    updatedAt: nowIso,
  };

  saveGrantLocally(nextGrant);
  const invitesMap = readLocalMap<ClassroomInviteRecord>(KEY_INVITES);
  const nextSeatCount = Math.min(maxSeats, occupiedGrants.length + 1);
  if (invitesMap[params.license.inviteCode]) {
    invitesMap[params.license.inviteCode] = {
      ...invitesMap[params.license.inviteCode],
      seatCount: nextSeatCount,
      updatedAt: nowIso,
    };
    writeLocalMap(KEY_INVITES, invitesMap);
  }
  emitClassroomUpdated();

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb) {
    await Promise.allSettled([
      withTimeout(
        setDoc(
          doc(collection(firestoreDb, 'classroom_grants'), grantId),
          stripUndefined(nextGrant as unknown as Record<string, unknown>)
        ),
        CLOUD_OP_TIMEOUT_MS,
        'create_teacher_grant'
      ),
      withTimeout(
        updateDoc(doc(collection(firestoreDb, 'classroom_invites'), params.license.inviteCode), {
          seatCount: nextSeatCount,
          updatedAt: nowIso,
        }),
        CLOUD_OP_TIMEOUT_MS,
        'increment_invite_seat_teacher'
      ),
    ]);
  }

  return { ok: true, grant: nextGrant };
}

export async function bulkOrSingleAddUltraStudents(params: {
  license: ClassroomLicenseRecord;
  currentGrants: ClassroomGrantRecord[];
  rawEmailsInput: string;
}): Promise<BulkAddStudentsResult> {
  const tokens = params.rawEmailsInput
    .split(/[\n,;]+/)
    .map((s) => normalizeEmailLower(s))
    .filter(Boolean);

  if (tokens.length === 0) {
    return { addedCount: 0, errors: ['Vui lòng nhập ít nhất 1 địa chỉ Gmail học sinh.'], addedGrants: [] };
  }

  const dedupedTokens = Array.from(new Set(tokens));
  const workingGrants = [...params.currentGrants];
  const addedGrants: ClassroomGrantRecord[] = [];
  const errors: string[] = [];

  for (const email of dedupedTokens) {
    const res = await grantStudentProByTeacherEmail({
      license: params.license,
      currentGrants: workingGrants,
      studentEmail: email,
    });
    if (res.ok && res.grant) {
      workingGrants.push(res.grant);
      addedGrants.push(res.grant);
    } else if (res.error) {
      errors.push(`${email}: ${res.error}`);
    }
  }

  return {
    addedCount: addedGrants.length,
    errors,
    addedGrants,
  };
}

export async function updateUltraStudentMeta(params: {
  grant: ClassroomGrantRecord;
  displayName?: string;
  groupName?: string;
}): Promise<{ ok: boolean; grant: ClassroomGrantRecord }> {
  const nowIso = new Date().toISOString();
  const cleanDisplayName = (params.displayName ?? '').trim().slice(0, 120);
  const cleanGroupName = (params.groupName ?? '').trim().slice(0, 60);

  const updatedGrant: ClassroomGrantRecord = {
    ...params.grant,
    displayName: cleanDisplayName,
    studentName: cleanDisplayName || params.grant.studentName || '',
    groupName: cleanGroupName,
    updatedAt: nowIso,
  };

  saveGrantLocally(updatedGrant);
  emitClassroomUpdated();

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb && firebaseAuth.currentUser) {
    await withTimeout(
      updateDoc(doc(collection(firestoreDb, 'classroom_grants'), params.grant.grantId), {
        displayName: cleanDisplayName,
        studentName: cleanDisplayName || params.grant.studentName || '',
        groupName: cleanGroupName,
        updatedAt: nowIso,
      }),
      CLOUD_OP_TIMEOUT_MS,
      'update_student_meta'
    ).catch(() => undefined);
  }

  return { ok: true, grant: updatedGrant };
}

export async function setUltraStudentStatus(params: {
  grant: ClassroomGrantRecord;
  suspend: boolean;
}): Promise<{ ok: boolean; grant: ClassroomGrantRecord }> {
  const nowIso = new Date().toISOString();
  const restoredStatus: ClassroomGrantStatus =
    params.grant.studentUid || params.grant.activatedAt ? 'active' : 'pending';
  const nextStatus: ClassroomGrantStatus = params.suspend ? 'suspended' : restoredStatus;

  const updatedGrant: ClassroomGrantRecord = {
    ...params.grant,
    status: nextStatus,
    updatedAt: nowIso,
  };

  saveGrantLocally(updatedGrant);
  emitClassroomUpdated();

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb && firebaseAuth.currentUser) {
    await withTimeout(
      updateDoc(doc(collection(firestoreDb, 'classroom_grants'), params.grant.grantId), {
        status: nextStatus,
        updatedAt: nowIso,
      }),
      CLOUD_OP_TIMEOUT_MS,
      'set_ultra_student_status'
    ).catch(() => undefined);
  }

  return { ok: true, grant: updatedGrant };
}

export async function revokeStudentProByTeacher(params: {
  license: ClassroomLicenseRecord;
  grant: ClassroomGrantRecord;
  currentGrants: ClassroomGrantRecord[];
}): Promise<{ ok: boolean }> {
  const nowIso = new Date().toISOString();
  const remaining = params.currentGrants.filter(
    (g) => g.status !== 'revoked' && g.grantId !== params.grant.grantId
  );

  deleteGrantLocally(params.grant.grantId);
  const invitesMap = readLocalMap<ClassroomInviteRecord>(KEY_INVITES);
  if (invitesMap[params.license.inviteCode]) {
    invitesMap[params.license.inviteCode] = {
      ...invitesMap[params.license.inviteCode],
      seatCount: remaining.length,
      updatedAt: nowIso,
    };
    writeLocalMap(KEY_INVITES, invitesMap);
  }
  emitClassroomUpdated();

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb) {
    await Promise.allSettled([
      withTimeout(
        deleteDoc(doc(collection(firestoreDb, 'classroom_grants'), params.grant.grantId)),
        CLOUD_OP_TIMEOUT_MS,
        'delete_classroom_grant'
      ),
      withTimeout(
        updateDoc(doc(collection(firestoreDb, 'classroom_invites'), params.license.inviteCode), {
          seatCount: remaining.length,
          updatedAt: nowIso,
        }),
        CLOUD_OP_TIMEOUT_MS,
        'decrement_invite_seat_teacher'
      ),
    ]);
  }

  return { ok: true };
}

export async function saveUltraClassroomAssignment(params: {
  license: ClassroomLicenseRecord;
  title: string;
  regionTopic: AssignmentRegionTopic;
  requiredQuizCount: number;
  deadline: string;
}): Promise<{ ok: boolean; license: ClassroomLicenseRecord }> {
  const nowIso = new Date().toISOString();
  const assignment: ClassroomAssignment = {
    id: `assign_${Date.now()}`,
    title: params.title.trim().slice(0, 180) || 'Nhiệm vụ học tập Lịch sử Đông Nam Bộ',
    regionTopic: params.regionTopic,
    requiredQuizCount: Math.max(1, Math.min(100, Math.round(params.requiredQuizCount || 10))),
    deadline: params.deadline.trim().slice(0, 64),
    updatedAt: nowIso,
  };

  const updatedLicense: ClassroomLicenseRecord = {
    ...params.license,
    assignment,
    updatedAt: nowIso,
  };

  saveLicenseLocally(updatedLicense);
  const invitesMap = readLocalMap<ClassroomInviteRecord>(KEY_INVITES);
  if (invitesMap[params.license.inviteCode]) {
    invitesMap[params.license.inviteCode] = {
      ...invitesMap[params.license.inviteCode],
      assignment,
      updatedAt: nowIso,
    };
    writeLocalMap(KEY_INVITES, invitesMap);
  }
  emitClassroomUpdated();

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb && firebaseAuth.currentUser) {
    await Promise.allSettled([
      withTimeout(
        updateDoc(doc(collection(firestoreDb, 'classroom_licenses'), params.license.teacherUid), {
          assignment,
          updatedAt: nowIso,
        }),
        CLOUD_OP_TIMEOUT_MS,
        'save_assignment_license'
      ),
      withTimeout(
        updateDoc(doc(collection(firestoreDb, 'classroom_invites'), params.license.inviteCode), {
          assignment,
          updatedAt: nowIso,
        }),
        CLOUD_OP_TIMEOUT_MS,
        'save_assignment_invite'
      ),
    ]);
  }

  return { ok: true, license: updatedLicense };
}

export async function removeUltraClassroomAssignment(params: {
  license: ClassroomLicenseRecord;
}): Promise<{ ok: boolean; license: ClassroomLicenseRecord }> {
  const nowIso = new Date().toISOString();
  const updatedLicense: ClassroomLicenseRecord = {
    ...params.license,
    assignment: null,
    updatedAt: nowIso,
  };

  saveLicenseLocally(updatedLicense);
  const invitesMap = readLocalMap<ClassroomInviteRecord>(KEY_INVITES);
  if (invitesMap[params.license.inviteCode]) {
    invitesMap[params.license.inviteCode] = {
      ...invitesMap[params.license.inviteCode],
      assignment: null,
      updatedAt: nowIso,
    };
    writeLocalMap(KEY_INVITES, invitesMap);
  }
  emitClassroomUpdated();

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb && firebaseAuth.currentUser) {
    await Promise.allSettled([
      withTimeout(
        updateDoc(doc(collection(firestoreDb, 'classroom_licenses'), params.license.teacherUid), {
          assignment: null,
          updatedAt: nowIso,
        }),
        CLOUD_OP_TIMEOUT_MS,
        'remove_assignment_license'
      ),
      withTimeout(
        updateDoc(doc(collection(firestoreDb, 'classroom_invites'), params.license.inviteCode), {
          assignment: null,
          updatedAt: nowIso,
        }),
        CLOUD_OP_TIMEOUT_MS,
        'remove_assignment_invite'
      ),
    ]);
  }

  return { ok: true, license: updatedLicense };
}

export function exportUltraClassroomCsv(
  license: ClassroomLicenseRecord | null,
  grants: ClassroomGrantRecord[]
): void {
  if (typeof window === 'undefined') return;
  const escapeCsv = (val: unknown): string => {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const header = [
    'STT',
    'Họ tên hiển thị',
    'Tên tổ',
    'Gmail',
    'Trạng thái',
    'Di tích đã xem (/17)',
    'Lượt làm bài',
    'Điểm trắc nghiệm (%)',
    'Ngày tham gia',
  ];
  const rows = grants.map((g, idx) => {
    const name =
      g.displayName ||
      g.studentName ||
      (g.studentEmail ? g.studentEmail.split('@')[0] : 'Tài khoản Facebook');
    const statusLabel =
      g.status === 'active'
        ? 'Đang hoạt động'
        : g.status === 'pending'
        ? 'Chờ đăng nhập'
        : g.status === 'suspended'
        ? 'Đang tạm khóa'
        : 'Đã thu hồi';
    const joinedDate = g.activatedAt || g.grantedAt;
    return [
      idx + 1,
      name,
      g.groupName || '',
      g.studentEmail || 'Tài khoản Facebook (chưa cung cấp email)',
      statusLabel,
      g.exploredCount ?? g.exploredSiteIds?.length ?? 0,
      g.quizAttempts ?? 0,
      g.bestQuizScore ?? 0,
      joinedDate ? new Date(joinedDate).toLocaleDateString('vi-VN') : '',
    ];
  });

  const csvContent =
    '\uFEFF' +
    [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (license?.className || license?.inviteCode || 'lop-ultra')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-|-$/g, '');
  a.href = url;
  a.download = `bang-diem-${safeName || 'lop-ultra'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// STUDENT INVITE CODE REDEMPTION, REAL-TIME SYNC & PROGRESS TRACKING
// ============================================================================

function getAttemptsStorageKey(uid: string): string {
  return `${KEY_ATTEMPTS_PREFIX}${uid.trim() || 'guest'}`;
}

function readRecentFailedAttempts(uid: string): number[] {
  if (typeof window === 'undefined') return [];
  const cutoff = Date.now() - INVITE_WINDOW_MS;
  try {
    const raw = window.localStorage.getItem(getAttemptsStorageKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((ts): ts is number => typeof ts === 'number' && ts > cutoff);
  } catch {
    return [];
  }
}

function recordFailedInviteAttempt(uid: string): void {
  if (typeof window === 'undefined') return;
  const recent = [...readRecentFailedAttempts(uid), Date.now()];
  try {
    window.localStorage.setItem(getAttemptsStorageKey(uid), JSON.stringify(recent));
  } catch {
    // ignore storage errors
  }
}

export function getInviteCodeAttemptGuard(uid?: string | null): InviteAttemptGuardStatus {
  const cleanUid = (uid || '').trim() || 'guest';
  const recent = readRecentFailedAttempts(cleanUid);
  const attemptsUsed = recent.length;
  const remainingAttempts = Math.max(0, INVITE_MAX_FAILED_ATTEMPTS - attemptsUsed);
  if (attemptsUsed < INVITE_MAX_FAILED_ATTEMPTS) {
    return {
      allowed: true,
      attemptsUsed,
      maxAttempts: INVITE_MAX_FAILED_ATTEMPTS,
      remainingAttempts,
      retryAfterSec: 0,
    };
  }
  const oldestTs = Math.min(...recent);
  const retryAfterSec = Math.max(1, Math.ceil((oldestTs + INVITE_WINDOW_MS - Date.now()) / 1000));
  return {
    allowed: false,
    attemptsUsed,
    maxAttempts: INVITE_MAX_FAILED_ATTEMPTS,
    remainingAttempts: 0,
    retryAfterSec,
  };
}

async function activatePendingGrantOnLogin(
  firestoreDb: Firestore | null,
  grant: ClassroomGrantRecord,
  cleanUid: string,
  cleanName?: string
): Promise<ClassroomGrantRecord> {
  const nowIso = new Date().toISOString();
  const nextStatus: ClassroomGrantStatus = grant.status === 'pending' ? 'active' : grant.status;
  const boundGrant: ClassroomGrantRecord = {
    ...grant,
    status: nextStatus,
    studentUid: cleanUid,
    ...(cleanName && !grant.studentName ? { studentName: cleanName } : {}),
    activatedAt: grant.activatedAt || nowIso,
    updatedAt: nowIso,
  };
  saveGrantLocally(boundGrant);

  if (firestoreDb && firebaseAuth.currentUser) {
    await withTimeout(
      updateDoc(doc(collection(firestoreDb, 'classroom_grants'), grant.grantId), {
        status: nextStatus,
        studentUid: cleanUid,
        ...(cleanName && !grant.studentName ? { studentName: cleanName } : {}),
        activatedAt: boundGrant.activatedAt,
        updatedAt: nowIso,
      }),
      CLOUD_OP_TIMEOUT_MS,
      'activate_pending_student_grant'
    ).catch(() => undefined);
  }
  return boundGrant;
}

export async function syncStudentClassroomGrantsFromCloud(
  uid?: string | null,
  email?: string | null
): Promise<ClassroomGrantRecord | null> {
  const cleanUid = (uid || '').trim();
  const cleanEmail = normalizeEmailLower(email);
  if ((!cleanUid || cleanUid === 'guest') && !cleanEmail) return null;

  const firestoreDb = getClassroomFirestore();
  if (
    !firestoreDb ||
    !firebaseAuth.currentUser ||
    (cleanUid && firebaseAuth.currentUser.uid !== cleanUid)
  ) {
    // Offline/Preview fallback: promote local pending grant if email matches
    const localMap = readLocalMap<ClassroomGrantRecord>(KEY_GRANTS);
    for (const grant of Object.values(localMap)) {
      if (
        grant &&
        grant.status === 'pending' &&
        cleanEmail &&
        normalizeEmailLower(grant.studentEmail) === cleanEmail
      ) {
        const nowIso = new Date().toISOString();
        const promoted: ClassroomGrantRecord = {
          ...grant,
          status: 'active',
          ...(cleanUid && cleanUid !== 'guest' ? { studentUid: cleanUid } : {}),
          activatedAt: grant.activatedAt || nowIso,
          updatedAt: nowIso,
        };
        saveGrantLocally(promoted);
        emitClassroomUpdated();
        return promoted;
      }
    }
    return getActiveClassroomProGrantForUser(cleanUid, cleanEmail);
  }

  try {
    const queries = [];
    if (cleanEmail) {
      queries.push(
        getDocs(
          query(
            collection(firestoreDb, 'classroom_grants'),
            where('studentEmail', '==', cleanEmail)
          )
        )
      );
    }
    if (cleanUid && cleanUid !== 'guest') {
      queries.push(
        getDocs(
          query(
            collection(firestoreDb, 'classroom_grants'),
            where('studentUid', '==', cleanUid)
          )
        )
      );
    }

    const snapshots = await withTimeout(
      Promise.all(queries),
      CLOUD_OP_TIMEOUT_MS,
      'sync_student_classroom_grants'
    );

    const foundById = new Map<string, ClassroomGrantRecord>();
    for (const snap of snapshots) {
      snap.forEach((docSnap) => {
        const g = docSnap.data() as ClassroomGrantRecord;
        if (g && g.grantId) {
          foundById.set(g.grantId, g);
        }
      });
    }

    const localMap = readLocalMap<ClassroomGrantRecord>(KEY_GRANTS);
    const prevSerialized = JSON.stringify(localMap);
    for (const [gid, g] of Object.entries(localMap)) {
      if (!g) continue;
      const matchesUser =
        (cleanEmail && normalizeEmailLower(g.studentEmail) === cleanEmail) ||
        (cleanUid && g.studentUid === cleanUid);
      if (matchesUser && !foundById.has(gid)) {
        delete localMap[gid];
      }
    }

    let activeGrant: ClassroomGrantRecord | null = null;
    for (const grant of foundById.values()) {
      localMap[grant.grantId] = grant;
      if ((grant.status === 'active' || grant.status === 'pending') && !activeGrant) {
        if (cleanUid && cleanUid !== 'guest' && (grant.status === 'pending' || !grant.studentUid)) {
          const bound = await activatePendingGrantOnLogin(firestoreDb, grant, cleanUid);
          localMap[grant.grantId] = bound;
          activeGrant = bound;
        } else if (grant.status === 'active') {
          activeGrant = grant;
        }
      }
    }

    const nextSerialized = JSON.stringify(localMap);
    if (nextSerialized !== prevSerialized) {
      writeLocalMap(KEY_GRANTS, localMap);
      emitClassroomUpdated();
    }
    return activeGrant;
  } catch {
    return getActiveClassroomProGrantForUser(cleanUid, cleanEmail);
  }
}

export function subscribeStudentClassroomStatus(
  uid: string | undefined | null,
  email: string | undefined | null,
  callback: (state: StudentClassroomRealtimeState) => void
): () => void {
  const cleanUid = (uid || '').trim();
  const cleanEmail = normalizeEmailLower(email);
  if ((!cleanUid || cleanUid === 'guest') && !cleanEmail) {
    callback({ activeGrant: null, inviteMeta: null, statusChangeNotice: null });
    return () => {};
  }

  let disposed = false;
  let unsubEmail: FirestoreUnsubscribe | null = null;
  let unsubUid: FirestoreUnsubscribe | null = null;
  let unsubInvite: FirestoreUnsubscribe | null = null;
  let subscribedInviteCode: string | null = null;
  let lastWasActive = Boolean(getActiveClassroomProGrantForUser(cleanUid, cleanEmail));
  let emailGrantsCache = new Map<string, ClassroomGrantRecord>();
  let uidGrantsCache = new Map<string, ClassroomGrantRecord>();

  const emitState = (notice: 'suspended' | 'removed' | null = null) => {
    if (disposed) return;
    const active = getActiveClassroomProGrantForUser(cleanUid, cleanEmail);
    const anyGrant = getAnyClassroomGrantForUserLocally(cleanUid, cleanEmail);
    const inviteCode = active?.inviteCode || anyGrant?.inviteCode;
    const inviteMeta = inviteCode ? getInviteByCodeLocally(inviteCode) : null;
    callback({
      activeGrant: active,
      inviteMeta,
      statusChangeNotice: notice,
    });
  };

  const ensureInviteListener = (firestoreDb: Firestore, inviteCode?: string) => {
    const cleanCode = (inviteCode || '').trim();
    if (!cleanCode) {
      if (unsubInvite) {
        unsubInvite();
        unsubInvite = null;
        subscribedInviteCode = null;
      }
      return;
    }
    if (subscribedInviteCode === cleanCode) return;
    if (unsubInvite) unsubInvite();
    subscribedInviteCode = cleanCode;
    unsubInvite = onSnapshot(
      doc(collection(firestoreDb, 'classroom_invites'), cleanCode),
      (snap) => {
        if (disposed || !snap.exists()) return;
        const inv = snap.data() as ClassroomInviteRecord;
        saveInviteLocally(inv);
        emitState(null);
      },
      () => undefined
    );
  };

  const reconcileCloudGrants = async (firestoreDb: Firestore) => {
    const merged = new Map<string, ClassroomGrantRecord>([
      ...emailGrantsCache.entries(),
      ...uidGrantsCache.entries(),
    ]);

    const localMap = readLocalMap<ClassroomGrantRecord>(KEY_GRANTS);
    const prevSerialized = JSON.stringify(localMap);
    for (const [gid, g] of Object.entries(localMap)) {
      if (!g) continue;
      const matchesUser =
        (cleanEmail && normalizeEmailLower(g.studentEmail) === cleanEmail) ||
        (cleanUid && g.studentUid === cleanUid);
      if (matchesUser && !merged.has(gid)) {
        delete localMap[gid];
      }
    }

    let nextActive: ClassroomGrantRecord | null = null;
    let foundSuspended = false;
    for (const grant of merged.values()) {
      localMap[grant.grantId] = grant;
      if (grant.status === 'suspended') {
        foundSuspended = true;
      }
      if ((grant.status === 'active' || grant.status === 'pending') && !nextActive) {
        if (cleanUid && cleanUid !== 'guest' && (grant.status === 'pending' || !grant.studentUid)) {
          const bound = await activatePendingGrantOnLogin(firestoreDb, grant, cleanUid);
          localMap[grant.grantId] = bound;
          nextActive = bound;
        } else if (grant.status === 'active') {
          nextActive = grant;
        }
      }
    }

    const nextSerialized = JSON.stringify(localMap);
    if (nextSerialized !== prevSerialized) {
      writeLocalMap(KEY_GRANTS, localMap);
      emitClassroomUpdated();
    }

    let notice: 'suspended' | 'removed' | null = null;
    if (lastWasActive && !nextActive) {
      notice = foundSuspended ? 'suspended' : 'removed';
    }
    lastWasActive = Boolean(nextActive);

    ensureInviteListener(firestoreDb, nextActive?.inviteCode);
    emitState(notice);
  };

  emitState(null);

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb && firebaseAuth.currentUser) {
    try {
      const canQueryVerifiedEmail =
        Boolean(cleanEmail) &&
        Boolean(firebaseAuth.currentUser.emailVerified) &&
        (firebaseAuth.currentUser.email || '').toLowerCase() === cleanEmail;
      if (canQueryVerifiedEmail) {
        unsubEmail = onSnapshot(
          query(collection(firestoreDb, 'classroom_grants'), where('studentEmail', '==', cleanEmail)),
          (snap) => {
            if (disposed) return;
            emailGrantsCache = new Map();
            snap.forEach((docSnap) => {
              const g = docSnap.data() as ClassroomGrantRecord;
              if (g?.grantId) emailGrantsCache.set(g.grantId, g);
            });
            void reconcileCloudGrants(firestoreDb);
          },
          () => undefined
        );
      }
      if (cleanUid && cleanUid !== 'guest' && firebaseAuth.currentUser.uid === cleanUid) {
        unsubUid = onSnapshot(
          query(collection(firestoreDb, 'classroom_grants'), where('studentUid', '==', cleanUid)),
          (snap) => {
            if (disposed) return;
            uidGrantsCache = new Map();
            snap.forEach((docSnap) => {
              const g = docSnap.data() as ClassroomGrantRecord;
              if (g?.grantId) uidGrantsCache.set(g.grantId, g);
            });
            void reconcileCloudGrants(firestoreDb);
          },
          () => undefined
        );
      }
    } catch {
      // keep local fallback
    }
  }

  const onLocalOrStorage = () => {
    const active = getActiveClassroomProGrantForUser(cleanUid, cleanEmail);
    const anyGrant = getAnyClassroomGrantForUserLocally(cleanUid, cleanEmail);
    let notice: 'suspended' | 'removed' | null = null;
    if (lastWasActive && !active) {
      notice = anyGrant?.status === 'suspended' ? 'suspended' : 'removed';
    }
    lastWasActive = Boolean(active);
    emitState(notice);
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === KEY_GRANTS || e.key === KEY_INVITES || e.key === KEY_LICENSES) {
      onLocalOrStorage();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener(CLASSROOM_UPDATED_EVENT, onLocalOrStorage);
    window.addEventListener('storage', onStorage);
  }

  return () => {
    disposed = true;
    if (unsubEmail) unsubEmail();
    if (unsubUid) unsubUid();
    if (unsubInvite) unsubInvite();
    if (typeof window !== 'undefined') {
      window.removeEventListener(CLASSROOM_UPDATED_EVENT, onLocalOrStorage);
      window.removeEventListener('storage', onStorage);
    }
  };
}

export async function recordStudentClassroomProgress(params: {
  uid?: string | null;
  email?: string | null;
  siteIdExplored?: string;
  quizScorePercent?: number;
  incrementQuizAttempt?: boolean;
}): Promise<void> {
  const activeGrant = getActiveClassroomProGrantForUser(params.uid, params.email);
  if (!activeGrant) return;

  const nowIso = new Date().toISOString();
  const prevSites = Array.isArray(activeGrant.exploredSiteIds) ? activeGrant.exploredSiteIds : [];
  const nextSitesSet = new Set(prevSites.filter(Boolean));
  let changed = false;

  if (params.siteIdExplored && !nextSitesSet.has(params.siteIdExplored) && nextSitesSet.size < 17) {
    nextSitesSet.add(params.siteIdExplored);
    changed = true;
  }

  const nextExploredSites = Array.from(nextSitesSet);
  const nextExploredCount = nextExploredSites.length;
  const prevAttempts = Number(activeGrant.quizAttempts || 0);
  const nextAttempts = params.incrementQuizAttempt ? prevAttempts + 1 : prevAttempts;
  if (params.incrementQuizAttempt) changed = true;

  const prevBest = Number(activeGrant.bestQuizScore || 0);
  const nextBest =
    typeof params.quizScorePercent === 'number'
      ? Math.max(prevBest, Math.min(100, Math.round(params.quizScorePercent)))
      : prevBest;
  if (nextBest !== prevBest) changed = true;

  if (!changed) return;

  const updatedGrant: ClassroomGrantRecord = {
    ...activeGrant,
    exploredSiteIds: nextExploredSites,
    exploredCount: nextExploredCount,
    quizAttempts: nextAttempts,
    bestQuizScore: nextBest,
    updatedAt: nowIso,
  };

  saveGrantLocally(updatedGrant);
  emitClassroomUpdated();

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb && firebaseAuth.currentUser) {
    await withTimeout(
      updateDoc(doc(collection(firestoreDb, 'classroom_grants'), activeGrant.grantId), {
        exploredSiteIds: nextExploredSites,
        exploredCount: nextExploredCount,
        quizAttempts: nextAttempts,
        bestQuizScore: nextBest,
        updatedAt: nowIso,
      }),
      CLOUD_OP_TIMEOUT_MS,
      'record_student_classroom_progress'
    ).catch(() => undefined);
  }
}

export async function redeemClassroomInviteCode(params: {
  rawCode: string;
  studentUid: string;
  studentEmail: string;
  studentName: string;
}): Promise<{
  ok: boolean;
  grant?: ClassroomGrantRecord;
  error?: string;
  guardStatus?: InviteAttemptGuardStatus;
}> {
  const cleanCode = params.rawCode.trim().toUpperCase();
  const cleanUid = params.studentUid.trim();
  const cleanEmail = normalizeEmailLower(params.studentEmail);
  const cleanName = (params.studentName || cleanEmail || 'Học sinh').trim();

  if (!cleanUid) {
    return {
      ok: false,
      error: 'Vui lòng đăng nhập tài khoản Google hoặc Facebook trước khi nhập Mã Lớp Học.',
    };
  }

  const guard = getInviteCodeAttemptGuard(cleanUid);
  if (!guard.allowed) {
    const mins = Math.ceil(guard.retryAfterSec / 60);
    return {
      ok: false,
      guardStatus: guard,
      error: `Bạn đã nhập sai mã quá ${guard.maxAttempts} lần. Vui lòng thử lại sau ${mins} phút (${guard.retryAfterSec} giây).`,
    };
  }

  if (!isValidInviteCodeFormat(cleanCode)) {
    recordFailedInviteAttempt(cleanUid);
    const nextGuard = getInviteCodeAttemptGuard(cleanUid);
    return {
      ok: false,
      guardStatus: nextGuard,
      error: `Mã lớp học không đúng định dạng (ví dụ: ULTRA-8A4K9B). Còn ${nextGuard.remainingAttempts} lần thử.`,
    };
  }

  const existingLocalGrant = getActiveClassroomProGrantForUser(cleanUid, cleanEmail);
  if (existingLocalGrant) {
    return {
      ok: false,
      error: `Tài khoản của bạn đã kích hoạt Gói Pro (Tài trợ bởi Lớp học · mã ${existingLocalGrant.inviteCode}). Mỗi tài khoản chỉ nhận tối đa 1 suất.`,
    };
  }

  const anyLocalGrant = getAnyClassroomGrantForUserLocally(cleanUid, cleanEmail);
  if (anyLocalGrant?.status === 'suspended') {
    return {
      ok: false,
      error: 'Tài khoản của bạn hiện đang bị giáo viên tạm khóa quyền truy cập trong lớp học này.',
    };
  }

  const firestoreDb = getClassroomFirestore();
  if (firestoreDb && firebaseAuth.currentUser) {
    try {
      const dupQueries = [
        getDocs(
          query(
            collection(firestoreDb, 'classroom_grants'),
            where('studentUid', '==', cleanUid)
          )
        ),
      ];
      if (cleanEmail) {
        dupQueries.push(
          getDocs(
            query(
              collection(firestoreDb, 'classroom_grants'),
              where('studentEmail', '==', cleanEmail)
            )
          )
        );
      }
      const existingSnaps = await withTimeout(
        Promise.all(dupQueries),
        CLOUD_OP_TIMEOUT_MS,
        'check_duplicate_student_grant'
      );
      let existingRemote: ClassroomGrantRecord | null = null;
      let existingSuspended: ClassroomGrantRecord | null = null;
      for (const existingSnap of existingSnaps) {
        existingSnap.forEach((docSnap) => {
          const g = docSnap.data() as ClassroomGrantRecord;
          if (g && g.status === 'active') existingRemote = g;
          else if (g && g.status === 'suspended') existingSuspended = g;
        });
      }
      if (existingSuspended) {
        saveGrantLocally(existingSuspended);
        return {
          ok: false,
          error: 'Tài khoản của bạn hiện đang bị giáo viên tạm khóa trong lớp học này.',
        };
      }
      if (existingRemote) {
        saveGrantLocally(existingRemote);
        emitClassroomUpdated();
        return {
          ok: false,
          error: `Tài khoản của bạn đã nhận suất Gói Pro từ lớp học (${(existingRemote as ClassroomGrantRecord).inviteCode}). Mỗi tài khoản chỉ nhận tối đa 1 suất.`,
        };
      }
    } catch {
      // continue to invite lookup
    }
  }

  let invite: ClassroomInviteRecord | null =
    readLocalMap<ClassroomInviteRecord>(KEY_INVITES)[cleanCode] || null;
  let fetchedFromCloud = false;

  if (firestoreDb && firebaseAuth.currentUser) {
    try {
      const invSnap = await withTimeout(
        getDoc(doc(collection(firestoreDb, 'classroom_invites'), cleanCode)),
        CLOUD_OP_TIMEOUT_MS,
        'get_classroom_invite'
      );
      if (invSnap.exists()) {
        invite = invSnap.data() as ClassroomInviteRecord;
        saveInviteLocally(invite);
        fetchedFromCloud = true;
      } else if (!invite) {
        recordFailedInviteAttempt(cleanUid);
        const nextGuard = getInviteCodeAttemptGuard(cleanUid);
        return {
          ok: false,
          guardStatus: nextGuard,
          error: `Không tìm thấy Mã Lớp Học "${cleanCode}". Vui lòng kiểm tra lại với giáo viên (còn ${nextGuard.remainingAttempts} lần thử).`,
        };
      }
    } catch {
      // Fall back to local invite if available
    }
  }

  if (!invite || !invite.active) {
    recordFailedInviteAttempt(cleanUid);
    const nextGuard = getInviteCodeAttemptGuard(cleanUid);
    return {
      ok: false,
      guardStatus: nextGuard,
      error: `Mã lớp học "${cleanCode}" không tồn tại hoặc đã bị thu hồi (còn ${nextGuard.remainingAttempts} lần thử).`,
    };
  }

  if (invite.inviteCodeLocked) {
    return {
      ok: false,
      error: `Mã lớp học "${cleanCode}" hiện đang tạm khóa nhận học sinh mới theo thiết lập của giáo viên.`,
    };
  }

  const maxSeats = invite.maxSeats || CLASSROOM_MAX_SEATS;
  const currentSeats = Number(invite.seatCount || 0);
  if (currentSeats >= maxSeats) {
    return {
      ok: false,
      error: `Mã lớp học ${cleanCode} đã đạt giới hạn tối đa ${maxSeats}/${maxSeats} học sinh.`,
    };
  }

  const nowIso = new Date().toISOString();
  const grantId = buildClassroomGrantId(invite.teacherUid, cleanEmail || cleanUid);
  const newGrant: ClassroomGrantRecord = {
    grantId,
    teacherUid: invite.teacherUid,
    teacherName: invite.teacherName,
    ...(invite.schoolName ? { schoolName: invite.schoolName } : {}),
    ...(invite.className ? { className: invite.className } : {}),
    inviteCode: cleanCode,
    studentEmail: cleanEmail,
    studentUid: cleanUid,
    studentName: cleanName,
    displayName: cleanName,
    method: 'invite_code',
    status: 'active',
    exploredSiteIds: [],
    exploredCount: 0,
    quizAttempts: 0,
    bestQuizScore: 0,
    activatedAt: nowIso,
    grantedAt: nowIso,
    updatedAt: nowIso,
  };

  if (firestoreDb && firebaseAuth.currentUser && fetchedFromCloud) {
    try {
      const batch = writeBatch(firestoreDb);
      const inviteRef = doc(collection(firestoreDb, 'classroom_invites'), cleanCode);
      const grantRef = doc(collection(firestoreDb, 'classroom_grants'), grantId);
      batch.update(inviteRef, {
        seatCount: currentSeats + 1,
        updatedAt: nowIso,
      });
      batch.set(grantRef, stripUndefined(newGrant as unknown as Record<string, unknown>));
      await withTimeout(batch.commit(), CLOUD_OP_TIMEOUT_MS, 'commit_invite_redemption');
    } catch {
      // Preserve local redemption in Preview/offline mode so student is not blocked
    }
  }

  saveGrantLocally(newGrant);
  saveInviteLocally({
    ...invite,
    seatCount: Math.min(maxSeats, currentSeats + 1),
    updatedAt: nowIso,
  });
  emitClassroomUpdated();

  return { ok: true, grant: newGrant };
}
