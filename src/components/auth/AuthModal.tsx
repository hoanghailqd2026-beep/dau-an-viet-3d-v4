import React, { useEffect, useState } from 'react';
import {
  X,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Mail,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  Sparkles,
  Smartphone,
  Send,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n/I18nContext';

type EmailTabMode = 'login' | 'register';
type ModalViewMode = 'main' | 'forgot' | 'transfer';

export const AuthModal: React.FC = () => {
  const { lang } = useI18n();
  const {
    isAuthModalOpen,
    authGatePrompt,
    authRedirectError,
    dismissAuthRedirectError,
    closeAuthModal,
    signInWithFirebaseGoogleAccount,
    signInWithFirebaseFacebookAccount,
    registerWithEmailPassword,
    loginWithEmailPassword,
    requestPasswordReset,
    loginAsJudge,
    loginWithTransferCode,
  } = useAuth();

  const [viewMode, setViewMode] = useState<ModalViewMode>('main');
  const [emailTab, setEmailTab] = useState<EmailTabMode>('login');
  const [transferCodeInput, setTransferCodeInput] = useState('');

  // Email Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Email Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot Password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  const [isFirebaseGoogleSubmitting, setIsFirebaseGoogleSubmitting] = useState(false);
  const [isFirebaseFacebookSubmitting, setIsFirebaseFacebookSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJudgeSubmitting, setIsJudgeSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthModalOpen && authRedirectError) {
      setErrorMsg(authRedirectError);
    }
  }, [isAuthModalOpen, authRedirectError]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      dismissAuthRedirectError();
      setViewMode('main');
      setEmailTab('login');
      setTransferCodeInput('');
      setErrorMsg(null);
      setResetSuccessMsg(null);
      setShowLoginPassword(false);
      setShowRegPassword(false);
      setIsFirebaseGoogleSubmitting(false);
      setIsFirebaseFacebookSubmitting(false);
      setIsSubmitting(false);
      setIsJudgeSubmitting(false);
      setLoginPassword('');
      setRegPassword('');
      setRegConfirmPassword('');
    }
  }, [isAuthModalOpen, dismissAuthRedirectError]);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const isAnyBusy =
    isFirebaseGoogleSubmitting ||
    isFirebaseFacebookSubmitting ||
    isSubmitting ||
    isJudgeSubmitting;

  const handleFirebaseGoogleSignIn = async () => {
    setErrorMsg(null);
    dismissAuthRedirectError();
    setIsFirebaseGoogleSubmitting(true);
    try {
      const res = await signInWithFirebaseGoogleAccount(lang);
      if (res.redirecting) return;
      if (!res.ok && !res.cancelled) {
        setErrorMsg(
          res.error ||
            (lang === 'en'
              ? 'Unable to sign in with Google.'
              : lang === 'zh'
              ? '无法通过 Google 登录。'
              : 'Không thể hoàn tất đăng nhập qua Google.')
        );
      }
    } finally {
      setIsFirebaseGoogleSubmitting(false);
    }
  };

  const handleFirebaseFacebookSignIn = async () => {
    setErrorMsg(null);
    dismissAuthRedirectError();
    setIsFirebaseFacebookSubmitting(true);
    try {
      const res = await signInWithFirebaseFacebookAccount(lang);
      if (res.redirecting) return;
      if (!res.ok && !res.cancelled) {
        setErrorMsg(
          res.error ||
            (lang === 'en'
              ? 'Unable to sign in with Facebook.'
              : lang === 'zh'
              ? '无法通过 Facebook 登录。'
              : 'Không thể hoàn tất đăng nhập qua Facebook.')
        );
      }
    } finally {
      setIsFirebaseFacebookSubmitting(false);
    }
  };

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail || !loginPassword) {
      setErrorMsg(
        lang === 'en'
          ? 'Please enter both email and password.'
          : lang === 'zh'
          ? '请输入邮箱和密码。'
          : 'Vui lòng nhập đầy đủ Email và mật khẩu.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithEmailPassword({
        email: trimmedEmail,
        password: loginPassword,
        lang,
      });
      if (!res.ok) {
        setErrorMsg(
          res.error ||
            (lang === 'en'
              ? 'Email or password is incorrect.'
              : lang === 'zh'
              ? '邮箱或密码不正确。'
              : 'Email hoặc mật khẩu không chính xác.')
        );
      } else {
        setLoginPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmedName = regName.trim();
    const trimmedEmail = regEmail.trim();

    if (!trimmedName) {
      setErrorMsg(
        lang === 'en'
          ? 'Please enter your full name.'
          : lang === 'zh'
          ? '请输入您的姓名。'
          : 'Vui lòng nhập Họ và tên hiển thị.'
      );
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg(
        lang === 'en'
          ? 'Password must be at least 6 characters.'
          : lang === 'zh'
          ? '密码长度至少为 6 个字符。'
          : 'Mật khẩu phải có tối thiểu 6 ký tự.'
      );
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg(
        lang === 'en'
          ? 'Password confirmation does not match.'
          : lang === 'zh'
          ? '两次输入的密码不一致。'
          : 'Mật khẩu xác nhận chưa trùng khớp.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerWithEmailPassword({
        displayName: trimmedName,
        email: trimmedEmail,
        password: regPassword,
        lang,
      });
      if (!res.ok) {
        setErrorMsg(
          res.error ||
            (lang === 'en'
              ? 'Unable to create account right now.'
              : lang === 'zh'
              ? '暂时无法创建账户。'
              : 'Không thể tạo tài khoản lúc này.')
        );
      } else {
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setResetSuccessMsg(null);
    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(resetEmail, lang);
      if (!res.ok) {
        setErrorMsg(
          res.error ||
            (lang === 'en'
              ? 'Unable to send password reset email.'
              : lang === 'zh'
              ? '无法发送重设密码邮件。'
              : 'Không thể gửi email đặt lại mật khẩu.')
        );
      } else {
        setResetSuccessMsg(
          lang === 'en'
            ? `A password reset link has been sent to ${resetEmail.trim()}. Please check your inbox or spam folder.`
            : lang === 'zh'
            ? `已向 ${resetEmail.trim()} 发送重设密码链接，请检查收件箱或垃圾邮件箱。`
            : `Đã gửi liên kết đặt lại mật khẩu tới ${resetEmail.trim()}. Vui lòng kiểm tra hộp thư đến hoặc mục Spam.`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJudgeQuickLogin = async () => {
    setErrorMsg(null);
    setIsJudgeSubmitting(true);
    try {
      const res = await loginAsJudge();
      if (!res.ok) {
        setErrorMsg(
          res.error ||
            (lang === 'en'
              ? 'Unable to activate Judge Quick Access.'
              : lang === 'zh'
              ? '无法启用评委快速体验模式。'
              : 'Không thể kích hoạt chế độ trải nghiệm nhanh.')
        );
      }
    } finally {
      setIsJudgeSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        lang === 'zh'
          ? '登录 / 注册 Dấu Ấn Việt 3D'
          : lang === 'en'
          ? 'Sign in / Register to Dấu Ấn Việt 3D'
          : 'Đăng nhập / Đăng ký Dấu Ấn Việt 3D'
      }
      onClick={closeAuthModal}
      className="fixed inset-0 z-[1320] flex items-center justify-center p-3 sm:p-4 bg-[#171817]/85 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[94vw] sm:w-full max-w-md max-h-[88vh] sm:max-h-[90dvh] flex flex-col bg-[#171817] border border-[#C9A46A]/45 rounded-2xl overflow-hidden text-[#D8C9A9] animate-apple-sheet"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#C9A46A]/20 bg-[#171817] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {viewMode !== 'main' && (
              <button
                type="button"
                onClick={() => {
                  setViewMode('main');
                  setErrorMsg(null);
                  setResetSuccessMsg(null);
                }}
                className="w-7 h-7 rounded-full bg-[#D8C9A9]/10 hover:bg-[#D8C9A9]/20 text-[#D8C9A9] flex items-center justify-center cursor-pointer transition-colors shrink-0"
                aria-label={lang === 'en' ? 'Back' : lang === 'zh' ? '返回' : 'Quay lại'}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#C9A46A] block">
                {lang === 'zh'
                  ? 'Dấu Ấn Việt 3D · Firebase 多设备同步认证'
                  : lang === 'en'
                  ? 'Dấu Ấn Việt 3D · Firebase Multi-Device Auth'
                  : 'Dấu Ấn Việt 3D · Xác thực & Đồng bộ Đa thiết bị Firebase'}
              </span>
              <h2 className="text-lg font-serif font-semibold text-[#D8C9A9] truncate">
                {viewMode === 'transfer'
                  ? lang === 'en'
                    ? 'Restore via Sync Code'
                    : lang === 'zh'
                    ? '通过同步码恢复'
                    : 'Khôi phục bằng Mã Đồng Bộ'
                  : viewMode === 'forgot'
                  ? lang === 'en'
                    ? 'Reset Account Password'
                    : lang === 'zh'
                    ? '重设账户密码'
                    : 'Đặt lại Mật khẩu Email'
                  : lang === 'zh'
                  ? '登录或创建账户'
                  : lang === 'en'
                  ? 'Sign In or Create Account'
                  : 'Đăng nhập Không gian Di sản'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-[#D8C9A9]/10 hover:bg-[#A94F3D] text-[#D8C9A9] flex items-center justify-center cursor-pointer transition-colors shrink-0"
            aria-label={lang === 'en' ? 'Close' : lang === 'zh' ? '关闭' : 'Đóng'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-5 sm:px-6 sm:pt-4 sm:pb-6 space-y-3.5 flex-1 min-h-0 overflow-y-auto heritage-scrollbar">
          {/* Contextual Auth Gate Prompt (only shown for gated actions like Thư ngỏ / Nguồn tư liệu) */}
          {authGatePrompt && (
            <div className="rounded-xl border px-3.5 py-2.5 flex items-start gap-2.5 bg-[#C9A46A]/15 border-[#C9A46A]/55">
              <Lock className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-[#F4EFE4] leading-relaxed min-w-0">
                {authGatePrompt}
              </p>
            </div>
          )}

          {viewMode === 'transfer' ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setErrorMsg(null);
                setIsSubmitting(true);
                try {
                  const res = await loginWithTransferCode(transferCodeInput);
                  if (!res.ok) {
                    setErrorMsg(
                      res.error ||
                        (lang === 'en'
                          ? 'Unable to restore account from the provided code.'
                          : lang === 'zh'
                          ? '无法通过所输入的同步码恢复账户。'
                          : 'Không thể khôi phục tài khoản từ mã đã nhập.')
                    );
                  } else {
                    setTransferCodeInput('');
                    setViewMode('main');
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-transfer-code"
                  className="block text-xs font-medium text-[#C9A46A]"
                >
                  {lang === 'en'
                    ? 'Account Sync Code (DAV3D-...) *'
                    : lang === 'zh'
                    ? '跨设备同步码（DAV3D-...）*'
                    : 'Mã Đồng Bộ Tài Khoản (DAV3D-...) *'}
                </label>
                <textarea
                  id="auth-transfer-code"
                  required
                  autoFocus
                  rows={4}
                  value={transferCodeInput}
                  onChange={(e) => setTransferCodeInput(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Paste the DAV3D-... sync code from My Account & Tickets on your previous device...'
                      : lang === 'zh'
                      ? '请粘贴原设备“我的账户与门票”页面生成的 DAV3D-... 同步码...'
                      : 'Dán chuỗi mã DAV3D-... từ mục Tài khoản & Vé của tôi trên thiết bị cũ...'
                  }
                  className="w-full p-3 rounded-xl bg-[#171817] border border-[#C9A46A]/35 focus:border-[#C9A46A] focus:outline-none text-xs font-sans tabular-nums text-[#D8C9A9] placeholder:text-[#D8C9A9]/45 resize-none"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-[#A94F3D]/20 border border-[#A94F3D]/60 px-3.5 py-2.5 text-xs text-[#D8C9A9]">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isAnyBusy || !transferCodeInput.trim()}
                className="w-full h-11 rounded-full bg-[#C9A46A] hover:bg-[#D8C9A9] text-[#171817] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {lang === 'en'
                    ? 'Activate Now'
                    : lang === 'zh'
                    ? '立即激活'
                    : 'Kích hoạt ngay'}
                </span>
              </button>
            </form>
          ) : viewMode === 'forgot' ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-reset-email"
                  className="block text-xs font-medium text-[#C9A46A]"
                >
                  {lang === 'en'
                    ? 'Registered Email Address *'
                    : lang === 'zh'
                    ? '注册邮箱地址 *'
                    : 'Địa chỉ Email đã đăng ký *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#D8C9A9]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth-reset-email"
                    type="email"
                    required
                    autoFocus
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-[#D8C9A9]/[0.05] border border-[#C9A46A]/30 focus:border-[#C9A46A] focus:outline-none text-xs sm:text-sm text-[#D8C9A9] placeholder:text-[#D8C9A9]/40"
                  />
                </div>
                <p className="text-[11px] text-[#D8C9A9]/65 leading-relaxed">
                  {lang === 'en'
                    ? 'Firebase Authentication will automatically email you a secure password reset link.'
                    : lang === 'zh'
                    ? 'Firebase Authentication 将自动向您的邮箱发送安全的重设密码链接。'
                    : 'Firebase Authentication sẽ tự động gửi liên kết đặt lại mật khẩu an toàn tới hộp thư của bạn.'}
                </p>
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-[#A94F3D]/20 border border-[#A94F3D]/60 px-3.5 py-2.5 text-xs text-[#D8C9A9]">
                  {errorMsg}
                </div>
              )}

              {resetSuccessMsg && (
                <div className="rounded-xl bg-[#47796D]/25 border border-[#47796D]/65 px-3.5 py-2.5 text-xs text-[#D8C9A9] flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#47796D] shrink-0 mt-0.5" />
                  <span>{resetSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isAnyBusy || !resetEmail.trim()}
                className="w-full h-11 rounded-full bg-[#C9A46A] hover:bg-[#D8C9A9] text-[#171817] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {lang === 'en'
                    ? 'Send Reset Link'
                    : lang === 'zh'
                    ? '发送重设密码链接'
                    : 'Gửi email đặt lại mật khẩu'}
                </span>
              </button>
            </form>
          ) : (
            <>
              {/* Primary OAuth 1-Click Sign-In Card */}
              <div className="rounded-2xl border border-[#C9A46A]/40 bg-[#D8C9A9]/[0.04] p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2 pb-0.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C9A46A]">
                    {lang === 'en'
                      ? '1-Click Sign-In'
                      : lang === 'zh'
                      ? '一键快速登录'
                      : 'Đăng nhập nhanh 1 chạm'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#47796D]/25 border border-[#47796D]/55 text-[10px] font-medium text-[#D8C9A9]">
                    Firebase Auth
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isAnyBusy}
                  onClick={handleFirebaseGoogleSignIn}
                  className="w-full h-11 rounded-full bg-[#D8C9A9] hover:bg-[#C9A46A] text-[#171817] border border-[#C9A46A]/70 text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isFirebaseGoogleSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#171817]" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-[#171817]/10 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
                        />
                      </svg>
                    </span>
                  )}
                  <span>
                    {isFirebaseGoogleSubmitting
                      ? lang === 'en'
                        ? 'Connecting to Google...'
                        : lang === 'zh'
                        ? '正在连接 Google...'
                        : 'Đang kết nối Google...'
                      : lang === 'en'
                      ? 'Continue with Google'
                      : lang === 'zh'
                      ? '使用 Google 继续'
                      : 'Tiếp tục với Google'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isAnyBusy}
                  onClick={handleFirebaseFacebookSignIn}
                  className="w-full h-11 rounded-full bg-[#1877F2] hover:bg-[#166FE5] text-[#FFFFFF] border border-[#1877F2] text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isFirebaseFacebookSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="#1877F2"
                          d="M15.12 5.32H17V2.14A26.11 26.11 0 0 0 14.26 2c-2.72 0-4.58 1.66-4.58 4.7v2.62H6.61v3.56h3.07V22h3.68v-9.12h3.06l.46-3.56h-3.52V7.05c0-1.05.29-1.73 1.76-1.73z"
                        />
                      </svg>
                    </span>
                  )}
                  <span>
                    {isFirebaseFacebookSubmitting
                      ? lang === 'en'
                        ? 'Connecting to Facebook...'
                        : lang === 'zh'
                        ? '正在连接 Facebook...'
                        : 'Đang kết nối Facebook...'
                      : lang === 'en'
                      ? 'Continue with Facebook'
                      : lang === 'zh'
                      ? '使用 Facebook 继续'
                      : 'Tiếp tục với Facebook'}
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#C9A46A]/25" />
                <span className="text-[11px] font-medium text-[#D8C9A9]/70">
                  {lang === 'en'
                    ? 'Or use Email & Password'
                    : lang === 'zh'
                    ? '或使用邮箱与密码'
                    : 'Hoặc dùng Email & Mật khẩu'}
                </span>
                <div className="h-px flex-1 bg-[#C9A46A]/25" />
              </div>

              {/* 2-Tab Email & Password Section */}
              <div className="rounded-2xl border border-[#C9A46A]/30 bg-[#1B1C1B] p-4 space-y-3.5">
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#D8C9A9]/[0.05] border border-[#C9A46A]/20">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setEmailTab('login');
                    }}
                    className={`h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      emailTab === 'login'
                        ? 'bg-[#C9A46A] text-[#171817]'
                        : 'text-[#D8C9A9]/75 hover:text-[#D8C9A9]'
                    }`}
                  >
                    {lang === 'en' ? 'Sign In' : lang === 'zh' ? '登录' : 'Đăng nhập'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setEmailTab('register');
                    }}
                    className={`h-9 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      emailTab === 'register'
                        ? 'bg-[#C9A46A] text-[#171817]'
                        : 'text-[#D8C9A9]/75 hover:text-[#D8C9A9]'
                    }`}
                  >
                    {lang === 'en'
                      ? 'Create Account'
                      : lang === 'zh'
                      ? '创建新账户'
                      : 'Tạo tài khoản mới'}
                  </button>
                </div>

                {emailTab === 'login' ? (
                  <form onSubmit={handleEmailLoginSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="auth-email-login-email"
                        className="block text-xs font-medium text-[#C9A46A]"
                      >
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#D8C9A9]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="auth-email-login-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-[#D8C9A9]/[0.05] border border-[#C9A46A]/25 focus:border-[#C9A46A] focus:outline-none text-xs sm:text-sm text-[#D8C9A9] placeholder:text-[#D8C9A9]/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <label
                          htmlFor="auth-email-login-password"
                          className="block text-xs font-medium text-[#C9A46A]"
                        >
                          {lang === 'en' ? 'Password *' : lang === 'zh' ? '密码 *' : 'Mật khẩu *'}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMsg(null);
                            setResetSuccessMsg(null);
                            setResetEmail(loginEmail.trim());
                            setViewMode('forgot');
                          }}
                          className="text-[11px] font-medium text-[#C9A46A] hover:text-[#D8C9A9] underline underline-offset-2 cursor-pointer"
                        >
                          {lang === 'en'
                            ? 'Forgot password?'
                            : lang === 'zh'
                            ? '忘记密码？'
                            : 'Quên mật khẩu?'}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#D8C9A9]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="auth-email-login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          autoComplete="current-password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder={
                            lang === 'en'
                              ? 'Enter your password...'
                              : lang === 'zh'
                              ? '输入密码...'
                              : 'Nhập mật khẩu...'
                          }
                          className="w-full h-10 pl-10 pr-10 rounded-xl bg-[#D8C9A9]/[0.05] border border-[#C9A46A]/25 focus:border-[#C9A46A] focus:outline-none text-xs sm:text-sm text-[#D8C9A9] placeholder:text-[#D8C9A9]/40"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8C9A9]/55 hover:text-[#D8C9A9] cursor-pointer"
                        >
                          {showLoginPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="rounded-xl bg-[#A94F3D]/20 border border-[#A94F3D]/60 px-3.5 py-2.5 text-xs text-[#D8C9A9] leading-relaxed">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAnyBusy}
                      className="w-full h-10 rounded-full bg-[#C9A46A] hover:bg-[#D8C9A9] text-[#171817] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <KeyRound className="w-4 h-4" />
                      )}
                      <span>
                        {lang === 'en'
                          ? 'Sign In'
                          : lang === 'zh'
                          ? '立即登录'
                          : 'Đăng nhập'}
                      </span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleEmailRegisterSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="auth-email-reg-name"
                        className="block text-xs font-medium text-[#C9A46A]"
                      >
                        {lang === 'en'
                          ? 'Full Name *'
                          : lang === 'zh'
                          ? '姓名 *'
                          : 'Họ và tên *'}
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-[#D8C9A9]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="auth-email-reg-name"
                          type="text"
                          required
                          autoComplete="name"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="VD: Nguyễn Minh Anh"
                          className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-[#D8C9A9]/[0.05] border border-[#C9A46A]/25 focus:border-[#C9A46A] focus:outline-none text-xs sm:text-sm text-[#D8C9A9] placeholder:text-[#D8C9A9]/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="auth-email-reg-email"
                        className="block text-xs font-medium text-[#C9A46A]"
                      >
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#D8C9A9]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="auth-email-reg-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-[#D8C9A9]/[0.05] border border-[#C9A46A]/25 focus:border-[#C9A46A] focus:outline-none text-xs sm:text-sm text-[#D8C9A9] placeholder:text-[#D8C9A9]/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="auth-email-reg-password"
                        className="block text-xs font-medium text-[#C9A46A]"
                      >
                        {lang === 'en'
                          ? 'Password (min 6 chars) *'
                          : lang === 'zh'
                          ? '密码（至少6位）*'
                          : 'Mật khẩu (tối thiểu 6 ký tự) *'}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#D8C9A9]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="auth-email-reg-password"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder={
                            lang === 'en'
                              ? 'Minimum 6 characters...'
                              : lang === 'zh'
                              ? '至少输入6个字符...'
                              : 'Tối thiểu 6 ký tự...'
                          }
                          className="w-full h-10 pl-10 pr-10 rounded-xl bg-[#D8C9A9]/[0.05] border border-[#C9A46A]/25 focus:border-[#C9A46A] focus:outline-none text-xs sm:text-sm text-[#D8C9A9] placeholder:text-[#D8C9A9]/40"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword((prev) => !prev)}
                          aria-label={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D8C9A9]/55 hover:text-[#D8C9A9] cursor-pointer"
                        >
                          {showRegPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label
                        htmlFor="auth-email-reg-confirm"
                        className="block text-xs font-medium text-[#C9A46A]"
                      >
                        {lang === 'en'
                          ? 'Confirm Password *'
                          : lang === 'zh'
                          ? '确认密码 *'
                          : 'Xác nhận mật khẩu *'}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#D8C9A9]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="auth-email-reg-confirm"
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          autoComplete="new-password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder={
                            lang === 'en'
                              ? 'Re-enter password...'
                              : lang === 'zh'
                              ? '再次输入密码...'
                              : 'Nhập lại mật khẩu...'
                          }
                          className="w-full h-10 pl-10 pr-3.5 rounded-xl bg-[#D8C9A9]/[0.05] border border-[#C9A46A]/25 focus:border-[#C9A46A] focus:outline-none text-xs sm:text-sm text-[#D8C9A9] placeholder:text-[#D8C9A9]/40"
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="rounded-xl bg-[#A94F3D]/20 border border-[#A94F3D]/60 px-3.5 py-2.5 text-xs text-[#D8C9A9] leading-relaxed">
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAnyBusy}
                      className="w-full h-10 rounded-full bg-[#47796D] hover:bg-[#C9A46A] text-[#F4EFE4] hover:text-[#171817] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>
                        {lang === 'en'
                          ? 'Create Account & Sign In'
                          : lang === 'zh'
                          ? '创建账户并登录'
                          : 'Tạo tài khoản & Đăng nhập'}
                      </span>
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          {/* Secondary Quick Actions */}
          <div className="pt-2 border-t border-[#C9A46A]/15 space-y-2.5 text-[11px] text-[#D8C9A9]/65">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {viewMode !== 'transfer' && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setViewMode('transfer');
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#D8C9A9]/[0.07] hover:bg-[#D8C9A9]/[0.14] border border-[#C9A46A]/35 text-[11px] text-[#D8C9A9] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3 h-3 text-[#C9A46A]" />
                  <span>
                    {lang === 'en'
                      ? 'Restore via Sync Code'
                      : lang === 'zh'
                      ? '通过同步码恢复'
                      : 'Khôi phục bằng Mã Đồng Bộ'}
                  </span>
                </button>
              )}

              <button
                type="button"
                disabled={isAnyBusy}
                onClick={handleJudgeQuickLogin}
                className="px-3 py-1.5 rounded-full bg-[#D8C9A9]/[0.06] hover:bg-[#D8C9A9]/[0.14] border border-[#C9A46A]/30 hover:border-[#C9A46A]/65 text-[11px] text-[#D8C9A9]/85 hover:text-[#D8C9A9] inline-flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 ml-auto"
              >
                {isJudgeSubmitting ? (
                  <Loader2 className="w-3 h-3 animate-spin text-[#C9A46A]" />
                ) : (
                  <Sparkles className="w-3 h-3 text-[#C9A46A]" />
                )}
                <span>
                  {lang === 'en'
                    ? 'Quick Demo (Judge)'
                    : lang === 'zh'
                    ? '快速体验（评委通道）'
                    : 'Trải nghiệm nhanh (Ban Giám Khảo)'}
                </span>
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 text-[10px] text-[#D8C9A9]/60">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#47796D] shrink-0 mt-0.5" />
                <span>
                  {lang === 'en'
                    ? 'Passwords are encrypted by Firebase Authentication and never stored in plain text.'
                    : lang === 'zh'
                    ? '密码由 Firebase Authentication 加密保护，绝不以明文形式存储。'
                    : 'Mật khẩu được Firebase Authentication mã hóa an toàn và đồng bộ đa thiết bị.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('dau-an-viet-open-privacy'));
                }}
                className="shrink-0 underline decoration-[#C9A46A]/60 underline-offset-2 text-[#C9A46A] hover:text-[#D8C9A9] cursor-pointer transition-colors"
              >
                {lang === 'en'
                  ? 'Privacy Policy'
                  : lang === 'zh'
                  ? '隐私政策'
                  : 'Chính sách Quyền riêng tư'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
