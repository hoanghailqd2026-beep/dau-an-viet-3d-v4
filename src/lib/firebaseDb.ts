import {
  doc,
  getDocFromServer,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { firebaseApp, firebaseAuth } from './firebaseAuth';

export enum FirestoreOperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: FirestoreOperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

let cachedDb: Firestore | null = null;
let connectionProbeStarted = false;

export function getAppFirestore(): Firestore | null {
  if (cachedDb) return cachedDb;
  try {
    cachedDb = initializeFirestore(firebaseApp, {
      experimentalAutoDetectLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
    return cachedDb;
  } catch {
    try {
      cachedDb = getFirestore(firebaseApp);
      return cachedDb;
    } catch {
      return null;
    }
  }
}

export function buildFirestoreErrorInfo(
  error: unknown,
  operationType: FirestoreOperationType,
  path: string | null
): FirestoreErrorInfo {
  const currentUser = firebaseAuth.currentUser;
  return {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
  };
}

export function reportFirestoreError(
  error: unknown,
  operationType: FirestoreOperationType,
  path: string | null,
  options?: { rethrow?: boolean }
): FirestoreErrorInfo {
  const errInfo = buildFirestoreErrorInfo(error, operationType, path);
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  if (options?.rethrow) {
    throw new Error(JSON.stringify(errInfo));
  }
  return errInfo;
}

export function withFirestoreTimeout<T>(
  promise: Promise<T>,
  ms = 12000,
  label = 'firestore_op'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer =
      typeof window !== 'undefined'
        ? window.setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms)
        : setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms);

    promise.then(
      (value) => {
        if (typeof window !== 'undefined') window.clearTimeout(timer as number);
        else clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        if (typeof window !== 'undefined') window.clearTimeout(timer as number);
        else clearTimeout(timer);
        reject(err);
      }
    );
  });
}

export async function testFirestoreConnectionOnce(): Promise<void> {
  if (connectionProbeStarted || typeof window === 'undefined') return;
  connectionProbeStarted = true;
  const db = getAppFirestore();
  if (!db) return;
  try {
    await withFirestoreTimeout(
      getDocFromServer(doc(db, 'test', 'connection')),
      12000,
      'test_connection'
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or long-polling handshake pending.');
    }
  }
}

export function sanitizeSafeHttpOrImageUrl(rawUrl: string | undefined, allowDataImage = false): string {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) return '';
  if (allowDataImage && /^data:image\/(png|jpe?g|webp|gif);base64,[a-zA-Z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    // Allow relative public paths like /images/...
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
  }
  return '';
}
