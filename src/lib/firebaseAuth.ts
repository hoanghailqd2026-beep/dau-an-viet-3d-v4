import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  type Auth,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
export const firebaseConfig = {
  apiKey: 'AIzaSyC0Omy3b0rvauKrkhQSt_U7Y8h8hzaI-VA',
  authDomain: 'dau-an-viet-3d-f8d63.firebaseapp.com',
  databaseURL: 'https://dau-an-viet-3d-f8d63-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'dau-an-viet-3d-f8d63',
  storageBucket: 'dau-an-viet-3d-f8d63.firebasestorage.app',
  messagingSenderId: '1083050313770',
  appId: '1:1083050313770:web:ec75439f3ac58ff5b25b53',
  measurementId: 'G-9XP7KNFG5G',
};

export type SupportedAuthLanguage = 'vi' | 'en' | 'zh';
export type FirebaseOAuthProviderName = 'google' | 'facebook' | 'password';

export interface FirebaseSignedInProfile {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL?: string;
  providerId: string;
  providerIds: string[];
}

export type FirebaseAuthSignInResult =
  | { ok: true; profile: FirebaseSignedInProfile }
  | {
      ok: false;
      cancelled?: boolean;
      redirecting?: boolean;
      code?: string;
      error: string;
    };

export type FirebaseGoogleSignInResult = FirebaseAuthSignInResult;

const PENDING_REDIRECT_PROVIDER_KEY = 'dau_an_viet_pending_redirect_provider_v1';

function savePendingRedirectProvider(provider: 'google' | 'facebook'): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(PENDING_REDIRECT_PROVIDER_KEY, provider);
  } catch {
    // ignore storage errors
  }
}

function consumePendingRedirectProvider(): 'google' | 'facebook' | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = window.sessionStorage.getItem(PENDING_REDIRECT_PROVIDER_KEY);
    window.sessionStorage.removeItem(PENDING_REDIRECT_PROVIDER_KEY);
    if (val === 'google' || val === 'facebook') return val;
  } catch {
    // ignore storage errors
  }
  return null;
}

function withErrorCodeSuffix(message: string, code?: string): string {
  const cleanCode = (code || '').trim();
  if (!cleanCode || !message) return message;
  if (message.includes(`[${cleanCode}]`)) return message;
  return `${message} [${cleanCode}]`;
}

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth: Auth = getAuth(firebaseApp);

if (typeof window !== 'undefined') {
  void setPersistence(firebaseAuth, browserLocalPersistence).catch(() => undefined);
}

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('email');
googleAuthProvider.addScope('profile');
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

export const facebookAuthProvider = new FacebookAuthProvider();
facebookAuthProvider.addScope('email');
facebookAuthProvider.addScope('public_profile');
facebookAuthProvider.setCustomParameters({
  display: 'popup',
});

export function mapFirebaseAuthErrorMessage(
  error: unknown,
  lang: SupportedAuthLanguage = 'vi',
  provider: FirebaseOAuthProviderName = 'google'
): { code?: string; cancelled?: boolean; message: string } {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code || '')
      : '';

  const providerLabel = provider === 'facebook' ? 'Facebook' : 'Google';

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return {
      code,
      cancelled: true,
      message: '',
    };
  }

  const formatResult = (message: string) => ({
    code: code || undefined,
    message: withErrorCodeSuffix(message, code),
  });

  if (code === 'auth/account-exists-with-different-credential') {
    return formatResult(
      lang === 'en'
        ? 'The email address linked to this Facebook account was previously registered with Google. Please sign in with Google to keep all your tickets and progress.'
        : lang === 'zh'
        ? '此 Facebook 账号关联的邮箱此前已通过 Google 注册。请使用 Google 登录以保留您的全部门票与探索进度。'
        : 'Địa chỉ email gắn với tài khoản Facebook này đã được đăng ký bằng Google trước đó. Vui lòng đăng nhập bằng Google để giữ nguyên toàn bộ gói vé và tiến độ của bạn.'
    );
  }

  if (code === 'auth/popup-blocked') {
    return formatResult(
      lang === 'en'
        ? `Your browser blocked the ${providerLabel} sign-in popup. Please allow popups for this site and try again.`
        : lang === 'zh'
        ? `浏览器拦截了 ${providerLabel} 登录弹窗，请允许此网站弹出窗口后重试。`
        : `Trình duyệt đang chặn cửa sổ bật lên của ${providerLabel}. Vui lòng cho phép popup cho trang web này rồi thử lại.`
    );
  }

  if (code === 'auth/unauthorized-domain') {
    return formatResult(
      lang === 'en'
        ? 'This domain has not been added to Authorized domains in Firebase Authentication settings yet.'
        : lang === 'zh'
        ? '当前域名尚未添加到 Firebase Authentication 的授权域名（Authorized domains）列表中。'
        : 'Tên miền hiện tại chưa được thêm vào Authorized domains trên Firebase Console. Quản trị viên cần bổ sung tên miền này trong Firebase Authentication.'
    );
  }

  if (code === 'auth/network-request-failed') {
    return formatResult(
      lang === 'en'
        ? `Network error while connecting to ${providerLabel} authentication service.`
        : lang === 'zh'
        ? `连接 ${providerLabel} 身份验证服务时发生网络错误。`
        : `Lỗi kết nối mạng khi liên hệ máy chủ xác thực ${providerLabel}.`
    );
  }

  if (code === 'auth/user-disabled') {
    return formatResult(
      lang === 'en'
        ? `This ${providerLabel} account has been disabled in Firebase Authentication.`
        : lang === 'zh'
        ? `该 ${providerLabel} 账号已在 Firebase Authentication 中被停用。`
        : `Tài khoản ${providerLabel} này hiện đang bị vô hiệu hóa trên hệ thống xác thực.`
    );
  }

  if (code === 'auth/operation-not-allowed') {
    if (provider === 'facebook') {
      return formatResult(
        lang === 'en'
          ? 'Facebook Sign-In is not enabled in Firebase Console yet. The administrator must enable the Facebook provider and configure App ID/App Secret.'
          : lang === 'zh'
          ? 'Firebase Console 尚未启用 Facebook 登录。管理员需要启用 Facebook 提供程序并填写 App ID / App Secret。'
          : 'Đăng nhập Facebook chưa được bật trên Firebase Console. Quản trị viên cần kích hoạt nhà cung cấp Facebook và điền App ID/App Secret.'
      );
    }
    if (provider === 'password') {
      return formatResult(
        lang === 'en'
          ? 'Email & Password authentication is not enabled in Firebase Console yet. The administrator must enable the Email/Password provider.'
          : lang === 'zh'
          ? 'Firebase Console 尚未启用邮箱与密码登录。管理员需在 Firebase Authentication 中开启 Email/Password 提供程序。'
          : 'Phương thức đăng nhập bằng Email & Mật khẩu chưa được bật trên Firebase Console. Quản trị viên cần bật nhà cung cấp Email/Password trong Firebase Authentication.'
      );
    }
    return formatResult(
      lang === 'en'
        ? 'Google Sign-In provider is not enabled for this Firebase project.'
        : lang === 'zh'
        ? '此 Firebase 项目尚未启用 Google 登录提供程序。'
        : 'Phương thức Google Sign-In chưa được bật trong Firebase Console của dự án.'
    );
  }

  if (code === 'auth/email-already-in-use') {
    return formatResult(
      lang === 'en'
        ? 'This email address is already registered. Please switch to Sign In or use Forgot Password.'
        : lang === 'zh'
        ? '该邮箱已被注册。请切换到“登录”标签或使用“忘记密码”。'
        : 'Địa chỉ email này đã được đăng ký trước đó. Vui lòng chuyển sang tab Đăng nhập hoặc dùng tính năng Quên mật khẩu.'
    );
  }

  if (code === 'auth/invalid-email') {
    return formatResult(
      lang === 'en'
        ? 'Please enter a valid email address.'
        : lang === 'zh'
        ? '请输入有效的电子邮箱地址。'
        : 'Định dạng địa chỉ email chưa hợp lệ. Vui lòng kiểm tra lại.'
    );
  }

  if (code === 'auth/user-not-found') {
    return formatResult(
      lang === 'en'
        ? 'No account found with this email address.'
        : lang === 'zh'
        ? '未找到使用此邮箱注册的账户。'
        : 'Không tìm thấy tài khoản nào khớp với địa chỉ email này.'
    );
  }

  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return formatResult(
      provider === 'password'
        ? lang === 'en'
          ? 'Incorrect email or password. Please check and try again.'
          : lang === 'zh'
          ? '邮箱或密码不正确，请检查后重试。'
          : 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
        : lang === 'en'
        ? 'Current password is incorrect. Please check and try again.'
        : lang === 'zh'
        ? '当前密码不正确，请检查后重试。'
        : 'Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại.'
    );
  }

  if (code === 'auth/weak-password') {
    return formatResult(
      lang === 'en'
        ? 'Password is too weak. Please use at least 6 characters.'
        : lang === 'zh'
        ? '密码强度不足，请至少输入 6 个字符。'
        : 'Mật khẩu quá yếu. Vui lòng đặt mật khẩu tối thiểu 6 ký tự.'
    );
  }

  if (code === 'auth/too-many-requests') {
    return formatResult(
      lang === 'en'
        ? 'Too many failed attempts. Access is temporarily paused; please wait a few minutes or reset your password.'
        : lang === 'zh'
        ? '尝试次数过多，账户已暂时受限。请稍后再试或重设密码。'
        : 'Bạn đã thử quá nhiều lần. Hệ thống tạm khóa trong ít phút để bảo vệ tài khoản — vui lòng đợi hoặc dùng Quên mật khẩu.'
    );
  }

  if (code === 'auth/requires-recent-login') {
    return formatResult(
      lang === 'en'
        ? 'For security, please sign out and sign in again before changing your password.'
        : lang === 'zh'
        ? '为了账户安全，请重新登录后再修改密码。'
        : 'Vì lý do bảo mật, vui lòng đăng xuất và đăng nhập lại trước khi đổi mật khẩu.'
    );
  }

  const rawMsg =
    error instanceof Error && error.message
      ? error.message
      : lang === 'en'
      ? 'Unable to complete authentication request.'
      : lang === 'zh'
      ? '无法完成身份验证请求。'
      : 'Không thể hoàn tất thao tác xác thực.';

  return formatResult(rawMsg);
}

export function toFirebaseSignedInProfile(
  fbUser: User | null | undefined
): FirebaseSignedInProfile | null {
  if (!fbUser || !fbUser.uid) return null;

  const providerIds = fbUser.providerData
    .map((p) => p?.providerId || '')
    .filter(Boolean);

  const primaryProviderId = providerIds.includes('facebook.com')
    ? 'facebook.com'
    : providerIds.includes('google.com')
    ? 'google.com'
    : providerIds.includes('password')
    ? 'password'
    : providerIds[0] || 'password';

  const primaryEmail = (
    fbUser.email ||
    fbUser.providerData.find((p) => Boolean(p?.email))?.email ||
    ''
  )
    .toLowerCase()
    .trim();

  // Google sign-in always expects an email; Facebook accounts created with phone numbers may have email === null.
  if (!primaryEmail && primaryProviderId !== 'facebook.com') {
    return null;
  }

  const displayName =
    (fbUser.displayName || '').trim() ||
    (fbUser.providerData.find((p) => Boolean(p?.displayName))?.displayName || '').trim() ||
    (primaryEmail ? primaryEmail.split('@')[0] || primaryEmail : 'Người dùng Facebook');

  const photoURL =
    fbUser.photoURL ||
    fbUser.providerData.find((p) => Boolean(p?.photoURL))?.photoURL ||
    undefined;

  return {
    uid: fbUser.uid,
    email: primaryEmail,
    emailVerified: Boolean(fbUser.emailVerified),
    displayName,
    photoURL,
    providerId: primaryProviderId,
    providerIds: providerIds.length > 0 ? providerIds : [primaryProviderId],
  };
}

export function getCurrentFirebaseProviderIds(): string[] {
  const current = firebaseAuth.currentUser;
  if (!current) return [];
  return current.providerData.map((p) => p?.providerId || '').filter(Boolean);
}

export async function updateFirebaseDisplayName(
  displayName: string
): Promise<{ ok: boolean; syncedAuth: boolean; error?: string }> {
  const current = firebaseAuth.currentUser;
  if (!current) {
    return { ok: true, syncedAuth: false };
  }
  try {
    await updateProfile(current, { displayName: displayName.trim() });
    return { ok: true, syncedAuth: true };
  } catch (err) {
    const mapped = mapFirebaseAuthErrorMessage(err, 'vi');
    return { ok: false, syncedAuth: false, error: mapped.message };
  }
}

export async function updateFirebaseEmailPassword(
  currentPassword: string,
  newPassword: string,
  lang: SupportedAuthLanguage = 'vi'
): Promise<{ ok: boolean; usedFirebaseAuth: boolean; error?: string }> {
  const current = firebaseAuth.currentUser;
  if (!current || !current.email) {
    return { ok: false, usedFirebaseAuth: false };
  }
  const hasPasswordProvider = current.providerData.some((p) => p?.providerId === 'password');
  if (!hasPasswordProvider) {
    return { ok: false, usedFirebaseAuth: false };
  }
  try {
    const credential = EmailAuthProvider.credential(current.email, currentPassword);
    await reauthenticateWithCredential(current, credential);
    await updatePassword(current, newPassword);
    return { ok: true, usedFirebaseAuth: true };
  } catch (err) {
    const mapped = mapFirebaseAuthErrorMessage(err, lang);
    return { ok: false, usedFirebaseAuth: true, error: mapped.message };
  }
}

export async function signInWithFirebaseGoogle(
  lang: SupportedAuthLanguage = 'vi'
): Promise<FirebaseAuthSignInResult> {
  try {
    // Call signInWithPopup synchronously on the very first step (zero await before popup) to preserve browser user gesture
    const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);
    const profile = toFirebaseSignedInProfile(credential.user);
    if (!profile) {
      return {
        ok: false,
        error:
          lang === 'en'
            ? 'Google account did not return a valid email address.'
            : lang === 'zh'
            ? 'Google 账号未返回有效的电子邮件地址。'
            : 'Tài khoản Google chưa cung cấp địa chỉ email hợp lệ.',
      };
    }
    return { ok: true, profile };
  } catch (err) {
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code?: unknown }).code || '')
        : '';
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment'
    ) {
      try {
        savePendingRedirectProvider('google');
        await signInWithRedirect(firebaseAuth, googleAuthProvider);
        return {
          ok: false,
          cancelled: true,
          redirecting: true,
          code,
          error: '',
        };
      } catch (redirectErr) {
        consumePendingRedirectProvider();
        const mappedRedirect = mapFirebaseAuthErrorMessage(redirectErr, lang, 'google');
        return {
          ok: false,
          cancelled: mappedRedirect.cancelled,
          code: mappedRedirect.code || code,
          error: mappedRedirect.message,
        };
      }
    }
    const mapped = mapFirebaseAuthErrorMessage(err, lang, 'google');
    return {
      ok: false,
      cancelled: mapped.cancelled,
      code: mapped.code,
      error: mapped.message,
    };
  }
}

export async function signInWithFacebook(
  lang: SupportedAuthLanguage = 'vi'
): Promise<FirebaseAuthSignInResult> {
  try {
    // Call signInWithPopup synchronously on the very first step (zero await before popup) to prevent auth/popup-blocked
    const credential = await signInWithPopup(firebaseAuth, facebookAuthProvider);
    const profile = toFirebaseSignedInProfile(credential.user);
    if (!profile) {
      return {
        ok: false,
        error:
          lang === 'en'
            ? 'Unable to read Facebook account profile.'
            : lang === 'zh'
            ? '无法读取 Facebook 账号资料。'
            : 'Không thể đọc thông tin tài khoản Facebook.',
      };
    }
    return { ok: true, profile };
  } catch (err) {
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code?: unknown }).code || '')
        : '';
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/operation-not-supported-in-this-environment'
    ) {
      try {
        savePendingRedirectProvider('facebook');
        await signInWithRedirect(firebaseAuth, facebookAuthProvider);
        return {
          ok: false,
          cancelled: true,
          redirecting: true,
          code,
          error: '',
        };
      } catch (redirectErr) {
        consumePendingRedirectProvider();
        const mappedRedirect = mapFirebaseAuthErrorMessage(redirectErr, lang, 'facebook');
        return {
          ok: false,
          cancelled: mappedRedirect.cancelled,
          code: mappedRedirect.code || code,
          error: mappedRedirect.message,
        };
      }
    }
    const mapped = mapFirebaseAuthErrorMessage(err, lang, 'facebook');
    return {
      ok: false,
      cancelled: mapped.cancelled,
      code: mapped.code,
      error: mapped.message,
    };
  }
}

export async function consumeFirebaseRedirectResult(
  lang: SupportedAuthLanguage = 'vi'
): Promise<FirebaseAuthSignInResult | null> {
  const pendingProvider = consumePendingRedirectProvider() || 'facebook';
  try {
    const credential = await getRedirectResult(firebaseAuth);
    if (!credential || !credential.user) {
      return null;
    }
    const profile = toFirebaseSignedInProfile(credential.user);
    if (!profile) {
      return {
        ok: false,
        error:
          lang === 'en'
            ? 'Unable to read account profile after redirect.'
            : lang === 'zh'
            ? '跳转登录后无法读取账号资料。'
            : 'Không thể đọc thông tin tài khoản sau khi chuyển hướng đăng nhập.',
      };
    }
    return { ok: true, profile };
  } catch (err) {
    const mapped = mapFirebaseAuthErrorMessage(err, lang, pendingProvider);
    return {
      ok: false,
      cancelled: mapped.cancelled,
      code: mapped.code,
      error: mapped.message,
    };
  }
}

export async function registerWithFirebaseEmailPassword(params: {
  displayName: string;
  email: string;
  password: string;
  lang?: SupportedAuthLanguage;
}): Promise<FirebaseAuthSignInResult> {
  const lang = params.lang || 'vi';
  const cleanEmail = params.email.toLowerCase().trim();
  const cleanName = params.displayName.trim();
  try {
    await setPersistence(firebaseAuth, browserLocalPersistence).catch(() => undefined);
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      cleanEmail,
      params.password
    );
    if (cleanName) {
      await updateProfile(credential.user, { displayName: cleanName }).catch(() => undefined);
    }
    const profile = toFirebaseSignedInProfile(credential.user);
    if (!profile) {
      return {
        ok: false,
        error:
          lang === 'en'
            ? 'Unable to initialize your new account profile.'
            : lang === 'zh'
            ? '无法初始化新账户资料。'
            : 'Không thể khởi tạo thông tin tài khoản mới.',
      };
    }
    return {
      ok: true,
      profile: {
        ...profile,
        displayName: cleanName || profile.displayName,
        providerId: 'password',
        providerIds: Array.from(new Set([...profile.providerIds, 'password'])),
      },
    };
  } catch (err) {
    const mapped = mapFirebaseAuthErrorMessage(err, lang, 'password');
    return {
      ok: false,
      code: mapped.code,
      error: mapped.message,
    };
  }
}

export async function signInWithFirebaseEmailPassword(params: {
  email: string;
  password: string;
  lang?: SupportedAuthLanguage;
}): Promise<FirebaseAuthSignInResult> {
  const lang = params.lang || 'vi';
  const cleanEmail = params.email.toLowerCase().trim();
  try {
    await setPersistence(firebaseAuth, browserLocalPersistence).catch(() => undefined);
    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      cleanEmail,
      params.password
    );
    const profile = toFirebaseSignedInProfile(credential.user);
    if (!profile) {
      return {
        ok: false,
        error:
          lang === 'en'
            ? 'Unable to read account profile.'
            : lang === 'zh'
            ? '无法读取账户资料。'
            : 'Không thể đọc thông tin tài khoản.',
      };
    }
    return {
      ok: true,
      profile: {
        ...profile,
        providerId: profile.providerIds.includes('password') ? 'password' : profile.providerId,
      },
    };
  } catch (err) {
    const mapped = mapFirebaseAuthErrorMessage(err, lang, 'password');
    return {
      ok: false,
      code: mapped.code,
      error: mapped.message,
    };
  }
}

export async function sendFirebasePasswordResetEmail(
  email: string,
  lang: SupportedAuthLanguage = 'vi'
): Promise<{ ok: boolean; code?: string; error?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return {
      ok: false,
      error:
        lang === 'en'
          ? 'Please enter a valid email address to receive the reset link.'
          : lang === 'zh'
          ? '请输入有效的电子邮箱以接收重设密码链接。'
          : 'Vui lòng nhập địa chỉ email hợp lệ để nhận liên kết đặt lại mật khẩu.',
    };
  }
  try {
    await sendPasswordResetEmail(firebaseAuth, cleanEmail);
    return { ok: true };
  } catch (err) {
    const mapped = mapFirebaseAuthErrorMessage(err, lang, 'password');
    return {
      ok: false,
      code: mapped.code,
      error: mapped.message,
    };
  }
}

export async function signOutFirebaseAuth(): Promise<void> {
  try {
    await signOut(firebaseAuth);
  } catch {
    // ignore sign-out errors
  }
}

export function onFirebaseAuthUserChanged(
  callback: (profile: FirebaseSignedInProfile | null) => void
): Unsubscribe {
  return onAuthStateChanged(firebaseAuth, (fbUser) => {
    callback(toFirebaseSignedInProfile(fbUser));
  });
}
