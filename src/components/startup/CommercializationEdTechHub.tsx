import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { HeritageSite } from '../../types/heritage';
import { TOUR_ROUTES } from '../../data/tours';
import {
  getRandomExamQuestions,
  type QuizAudience,
  type QuizTopicId,
} from '../../data/quizQuestions';
import {
  buildQuizWordDocHtml,
  getLocalizedAudienceLevels,
  getLocalizedQuizQuestions,
  getLocalizedQuizTopics,
  type LocalizedQuizQuestion,
} from '../../data/quizLocalization';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { useHeritagePassportStamps } from '../../utils/heritagePassport';
import { HeritageTypographicPlate } from '../common/HeritageTypographicPlate';
import { HeritageSmoothImage } from '../common/HeritageSmoothImage';
import { HeritageSearchCombobox } from '../common/HeritageSiteDropdown';
import { ArchivalSourcesTrigger } from '../common/ArchivalSourcesTrigger';
import { matchesHeritageSiteQuery } from '../../utils/heritageSearch';
import { useMuseumTilt3D } from '../../utils/useMuseumTilt3D';
import {
  PASSES_UPDATED_EVENT,
  PublishedSiteQuizSet,
  QUIZZES_UPDATED_EVENT,
  IssuedPassRecord,
  checkAndRecordSubmissionRate,
  getUserEdTechState,
  listIssuedPasses,
  loadPublishedQuizzes,
  maskEmailForDisplay,
  recordIssuedPass,
  saveUserEdTechState,
} from '../../utils/adminPlatformStore';
import {
  openPlanCheckoutModal,
  openUpgradePrompt,
  useSubscriptionPermissions,
} from '../../utils/subscriptionGatingStore';
import {
  CLASSROOM_MAX_SEATS,
  ensureClassroomLicenseForTeacher,
  getInviteCodeAttemptGuard,
  recordStudentClassroomProgress,
  redeemClassroomInviteCode,
  subscribeTeacherClassroomState,
  type ClassroomGrantRecord,
  type ClassroomLicenseRecord,
} from '../../utils/classroomLicenseStore';
import {
  formatVnd,
  setActiveWatchingOrderId,
  subscribeToUserPaymentOrders,
  type RealtimePaymentOrder,
} from '../../utils/paymentOrdersRtdb';
import { pushUserProgressToFirestore } from '../../utils/userCloudProfileSync';
import { LockGlyph } from '../subscription/LockGlyph';
import { SectionGuideButton } from '../guide/InteractiveUserGuideModal';
import {
  Ticket,
  GraduationCap,
  Check,
  Clock,
  QrCode,
  Download,
  Printer,
  BookOpen,
  Award,
  X,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  Building2,
  Compass,
  ShieldCheck,
  LogIn,
  Lock,
  CheckCircle2,
  Star,
  MessageSquareHeart,
  Copy,
  KeyRound,
  Users,
  Box,
  Shuffle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CommercializationEdTechHubProps {
  sites: HeritageSite[];
  hiddenSiteIds?: string[];
  preselectedGuidedRoute?: {
    mappedTourId: string;
    title: string;
    token: number;
  } | null;
  initialQuizTopic?: {
    region: 'all' | 'hcm' | 'bd' | 'brvt';
    token: number;
  } | null;
  onStart3DVipExperience: (siteId?: string, routeId?: string) => void;
  onNavigateToMap: () => void;
  onOpenAudioGuide: (site: HeritageSite) => void;
  onOpenMyJourney?: () => void;
  onOpenUltraClassroom?: () => void;
  onOpenFeedback?: () => void;
  onOpenGuide?: () => void;
  onOpenMediaCredits?: () => void;
}

type QuizFilterMode = 'mock_20' | 'all' | QuizTopicId;
type QuizAudienceFilter = 'all' | QuizAudience;

const QUIZ_PAGE_SIZE = 10;

export const CommercializationEdTechHub: React.FC<CommercializationEdTechHubProps> = ({
  sites,
  hiddenSiteIds = [],
  preselectedGuidedRoute = null,
  initialQuizTopic = null,
  onStart3DVipExperience,
  onNavigateToMap,
  onOpenMyJourney,
  onOpenUltraClassroom,
  onOpenFeedback,
  onOpenGuide,
  onOpenMediaCredits,
}) => {
  const { lang, getLocalizedSite, getLocalizedTour } = useI18n();
  const {
    user,
    isAdmin,
    isTesterPro,
    userTier,
    refreshEntitlements,
    openAuthModal,
    signInWithFirebaseGoogleAccount,
    signInWithFirebaseFacebookAccount,
  } = useAuth();
  const [quickAuthBusy, setQuickAuthBusy] = useState<'google' | 'facebook' | null>(null);
  const [quickAuthError, setQuickAuthError] = useState<string | null>(null);
  const {
    permissions: globalPerms,
    subscription: userSubscription,
    classroomGrant,
    refreshSubscription,
  } = useSubscriptionPermissions();
  const canPreviewHidden = globalPerms.effectiveRole === 'admin';
  const isClassroomSponsoredStudent = Boolean(classroomGrant);
  const currentUserPlan: 'free' | 'student' | 'pro' | 'ultra' =
    !isClassroomSponsoredStudent &&
    (globalPerms.effectiveRole === 'school' ||
      (!isAdmin && !globalPerms.isPreviewingNonAdmin && userSubscription.hasSchoolPackage))
      ? 'ultra'
      : isClassroomSponsoredStudent || globalPerms.effectiveRole === 'pro'
      ? 'pro'
      : globalPerms.effectiveRole === 'plus'
      ? 'student'
      : 'free';
  const hasUltraQuizAccess =
    (isAdmin && !globalPerms.isPreviewingNonAdmin) || currentUserPlan === 'ultra';
  const tiltHandlers = useMuseumTilt3D(4);
  const passportScope = user?.email || user?.userId;
  const passportStamps = useHeritagePassportStamps(passportScope);
  const unlockedStampCount = Object.keys(passportStamps).length;

  const initialPersonal = getUserEdTechState(user?.userId, user?.email);

  // State cho Gói B2C (19.000đ / Tuyến hoặc 49.000đ / VIP Toàn Vùng)
  const [b2cPlanType, setB2cPlanType] = useState<'route_19k' | 'vip_49k'>(
    initialPersonal.b2cPlanType
  );
  const [selectedRouteId, setSelectedRouteId] = useState<string>(TOUR_ROUTES[0]?.id || 'TOUR-01');

  // State cho Modal Thanh toán VietQR / MoMo & Vé điện tử VIP
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo'>('vietqr');
  const [ticketIssued, setTicketIssued] = useState<boolean>(initialPersonal.ticketIssued);
  const [ticketPassId, setTicketPassId] = useState<string | undefined>(
    initialPersonal.ticketPassId
  );
  const [certPassId, setCertPassId] = useState<string | undefined>(initialPersonal.certPassId);
  const [passesSnapshot, setPassesSnapshot] = useState<IssuedPassRecord[]>(() =>
    listIssuedPasses()
  );
  const [buyerName, setBuyerName] = useState<string>(() => user?.displayName || '');
  const [checkoutQrDataUrl, setCheckoutQrDataUrl] = useState<string>('');
  const [issuedTicketQrDataUrl, setIssuedTicketQrDataUrl] = useState<string>('');
  const [ticketSpamError, setTicketSpamError] = useState<string | null>(null);

  useEffect(() => {
    const onPassesUpdated = () => setPassesSnapshot(listIssuedPasses());
    window.addEventListener(PASSES_UPDATED_EVENT, onPassesUpdated);
    return () => window.removeEventListener(PASSES_UPDATED_EVENT, onPassesUpdated);
  }, []);

  // Strict per-uid personal VietQR order isolation in public "Vé & Học liệu" view
  const currentOrderUid =
    user && user.authMethod !== 'judge_quick_access'
      ? user.firebaseUid || user.userId || null
      : null;
  const [myPersonalOrders, setMyPersonalOrders] = useState<RealtimePaymentOrder[]>([]);

  useEffect(() => {
    if (!currentOrderUid) {
      setMyPersonalOrders([]);
      return;
    }
    const unsubscribe = subscribeToUserPaymentOrders(currentOrderUid, (list) => {
      setMyPersonalOrders(list.filter((o) => o.uid === currentOrderUid));
    });
    return () => {
      unsubscribe();
      setMyPersonalOrders([]);
    };
  }, [currentOrderUid]);

  const [guidedCertCode, setGuidedCertCode] = useState<string | null>(null);

  useEffect(() => {
    if (!preselectedGuidedRoute) return;
    setB2cPlanType('route_19k');
    setSelectedRouteId(preselectedGuidedRoute.mappedTourId);
    setGuidedCertCode(null);
  }, [preselectedGuidedRoute?.token, preselectedGuidedRoute?.mappedTourId]);

  // State cho Modal Đăng ký B2B Trường học
  const [isB2BModalOpen, setIsB2BModalOpen] = useState<boolean>(false);
  const [schoolName, setSchoolName] = useState<string>('Trường THPT Chuyên Lê Quý Đôn');
  const [schoolProvince, setSchoolProvince] = useState<string>('TP. Hồ Chí Minh / Bà Rịa - Vũng Tàu / Bình Dương');
  const [teacherContact, setTeacherContact] = useState<string>('to-lich-su@edu.vn');
  const [b2bSubmitted, setB2bSubmitted] = useState<boolean>(false);

  // State cho Bài kiểm tra tương tác 100 câu hỏi (EdTech Quiz)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>(() => {
    if (typeof window !== 'undefined') {
      const markerKey = `tgds_quiz100_v1_${user?.email || user?.userId || 'guest'}`;
      if (!window.localStorage.getItem(markerKey)) {
        window.localStorage.setItem(markerKey, '1');
        return {};
      }
    }
    return initialPersonal.selectedAnswers;
  });
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(initialPersonal.quizSubmitted);
  const [quizFilterMode, setQuizFilterMode] = useState<QuizFilterMode>('mock_20');
  const [quizAudienceFilter, setQuizAudienceFilter] = useState<QuizAudienceFilter>('all');
  const [quizPage, setQuizPage] = useState<number>(1);
  const [mockQuestionIds, setMockQuestionIds] = useState<number[]>(() =>
    getRandomExamQuestions(20).map((q) => q.id)
  );
  const [worksheetDownloadedToast, setWorksheetDownloadedToast] = useState<string | null>(null);
  const [failedPhotoMap, setFailedPhotoMap] = useState<Record<string, boolean>>({});
  const [passportSearchQuery, setPassportSearchQuery] = useState<string>('');

  // Ultra Classroom (500k · 35 seats) summary & Student Invite Redemption
  const [teacherLicense, setTeacherLicense] = useState<ClassroomLicenseRecord | null>(null);
  const [teacherGrants, setTeacherGrants] = useState<ClassroomGrantRecord[]>([]);
  const [copiedInviteCode, setCopiedInviteCode] = useState<boolean>(false);

  const [inviteCodeInput, setInviteCodeInput] = useState<string>('');
  const [inviteRedeemBusy, setInviteRedeemBusy] = useState<boolean>(false);
  const [inviteRedeemError, setInviteRedeemError] = useState<string | null>(null);
  const [inviteRedeemSuccess, setInviteRedeemSuccess] = useState<string | null>(null);

  useEffect(() => {
    const canManageClassroom = globalPerms.canUseSchoolEdTech;
    if (!canManageClassroom || !currentOrderUid) {
      setTeacherLicense(null);
      setTeacherGrants([]);
      return;
    }

    let cancelled = false;
    void ensureClassroomLicenseForTeacher({
      teacherUid: currentOrderUid,
      teacherEmail: user?.email || '',
      teacherName: user?.displayName || user?.email || 'Giáo viên',
      schoolName: userSubscription.schoolName,
    });

    const unsubscribe = subscribeTeacherClassroomState(currentOrderUid, (state) => {
      if (cancelled) return;
      setTeacherLicense(state.license);
      setTeacherGrants(state.grants);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [
    globalPerms.canUseSchoolEdTech,
    currentOrderUid,
    user?.email,
    user?.displayName,
    userSubscription.schoolName,
  ]);

  // Ngân hàng Thử thách Kiến thức Di sản do Admin AI Curator xuất bản
  const [publishedQuizMap, setPublishedQuizMap] = useState<Record<string, PublishedSiteQuizSet>>(
    () => loadPublishedQuizzes()
  );
  const [activeTopicSiteId, setActiveTopicSiteId] = useState<string>('');
  const [topicAnswers, setTopicAnswers] = useState<Record<string, Record<string, number>>>(
    () => initialPersonal.topicAnswers || {}
  );
  const [topicSubmittedMap, setTopicSubmittedMap] = useState<Record<string, boolean>>(
    () => initialPersonal.topicSubmittedMap || {}
  );
  const [topicCertIds, setTopicCertIds] = useState<Record<string, string>>(
    () => initialPersonal.topicCertIds || {}
  );

  useEffect(() => {
    if (!user) {
      setIsPaymentModalOpen(false);
      setIsB2BModalOpen(false);
    }
    const saved = getUserEdTechState(user?.userId, user?.email);
    setB2cPlanType(saved.b2cPlanType);
    const markerKey = `tgds_quiz100_v1_${user?.email || user?.userId || 'guest'}`;
    if (typeof window !== 'undefined' && !window.localStorage.getItem(markerKey)) {
      window.localStorage.setItem(markerKey, '1');
      setSelectedAnswers({});
      setQuizSubmitted(false);
    } else {
      setSelectedAnswers(saved.selectedAnswers);
      setQuizSubmitted(saved.quizSubmitted);
    }
    setTicketIssued(saved.ticketIssued);
    setTicketPassId(saved.ticketPassId);
    setCertPassId(saved.certPassId);
    setTopicAnswers(saved.topicAnswers || {});
    setTopicSubmittedMap(saved.topicSubmittedMap || {});
    setTopicCertIds(saved.topicCertIds || {});
    setGuidedCertCode(null);
    setTicketSpamError(null);
    setInviteRedeemError(null);
    setInviteRedeemSuccess(null);
    setBuyerName(user?.displayName || '');
  }, [user?.userId, user?.email, user?.displayName]);

  useEffect(() => {
    if (!initialQuizTopic) return;
    const mappedMode: QuizFilterMode =
      initialQuizTopic.region === 'hcm'
        ? 'CD-01'
        : initialQuizTopic.region === 'bd'
        ? 'CD-05'
        : initialQuizTopic.region === 'brvt'
        ? 'CD-06'
        : 'all';
    setQuizFilterMode(mappedMode);
    setQuizAudienceFilter('all');
    setQuizPage(1);
    setQuizSubmitted(false);
    const timer = window.setTimeout(() => {
      document.getElementById('school-edtech-repository')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [initialQuizTopic?.token, initialQuizTopic?.region]);

  useEffect(() => {
    const onQuizzesUpdated = () => setPublishedQuizMap(loadPublishedQuizzes());
    window.addEventListener(QUIZZES_UPDATED_EVENT, onQuizzesUpdated);
    return () => window.removeEventListener(QUIZZES_UPDATED_EVENT, onQuizzesUpdated);
  }, []);

  const visiblePublishedTopics = Object.values(publishedQuizMap).filter(
    (set) =>
      set.questions.length > 0 &&
      sites.some((s) => s.id === set.siteId) &&
      (canPreviewHidden || (!set.isHidden && !hiddenSiteIds.includes(set.siteId)))
  );
  const selectedTopic =
    visiblePublishedTopics.find((t) => t.siteId === activeTopicSiteId) ||
    visiblePublishedTopics[0] ||
    null;

  const localizedQuizTopics = useMemo(() => getLocalizedQuizTopics(lang), [lang]);
  const localizedAudienceLevels = useMemo(() => getLocalizedAudienceLevels(lang), [lang]);
  const localizedQuizQuestions = useMemo(
    () => (hasUltraQuizAccess ? getLocalizedQuizQuestions(lang) : []),
    [hasUltraQuizAccess, lang]
  );

  const displayedQuizQuestions = useMemo(() => {
    if (!hasUltraQuizAccess) return [];
    let pool: LocalizedQuizQuestion[] = localizedQuizQuestions;
    if (quizFilterMode === 'mock_20') {
      const byId = new Map(localizedQuizQuestions.map((q) => [q.id, q]));
      pool = mockQuestionIds
        .map((id) => byId.get(id))
        .filter((q): q is LocalizedQuizQuestion => Boolean(q));
    } else if (quizFilterMode !== 'all') {
      pool = localizedQuizQuestions.filter((q) => q.topicId === quizFilterMode);
    }
    if (quizAudienceFilter !== 'all') {
      pool = pool.filter((q) => q.audience === quizAudienceFilter);
    }
    return pool;
  }, [
    hasUltraQuizAccess,
    localizedQuizQuestions,
    quizFilterMode,
    quizAudienceFilter,
    mockQuestionIds,
  ]);

  const totalQuizPages = Math.max(1, Math.ceil(displayedQuizQuestions.length / QUIZ_PAGE_SIZE));
  const safeQuizPage = Math.min(quizPage, totalQuizPages);
  const paginatedQuizQuestions = useMemo(() => {
    const startIdx = (safeQuizPage - 1) * QUIZ_PAGE_SIZE;
    return displayedQuizQuestions.slice(startIdx, startIdx + QUIZ_PAGE_SIZE);
  }, [displayedQuizQuestions, safeQuizPage]);

  const answeredInViewCount = useMemo(
    () => displayedQuizQuestions.filter((q) => selectedAnswers[q.id] !== undefined).length,
    [displayedQuizQuestions, selectedAnswers]
  );

  const correctInViewCount = useMemo(
    () =>
      displayedQuizQuestions.filter((q) => selectedAnswers[q.id] === q.correctIndex).length,
    [displayedQuizQuestions, selectedAnswers]
  );

  const quizScore =
    displayedQuizQuestions.length > 0
      ? Math.round((correctInViewCount / displayedQuizQuestions.length) * 100)
      : 0;

  const totalAnsweredAllCount = useMemo(
    () =>
      hasUltraQuizAccess
        ? localizedQuizQuestions.filter((q) => selectedAnswers[q.id] !== undefined).length
        : 0,
    [hasUltraQuizAccess, localizedQuizQuestions, selectedAnswers]
  );

  const handleStartMockExam20 = () => {
    if (!hasUltraQuizAccess) return;
    const freshIds = getRandomExamQuestions(20).map((q) => q.id);
    setMockQuestionIds(freshIds);
    setQuizFilterMode('mock_20');
    setQuizAudienceFilter('all');
    setQuizPage(1);
    setQuizSubmitted(false);
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      for (const id of freshIds) {
        delete next[id];
      }
      return next;
    });
  };

  const handleSelectQuizOption = (questionId: number, optionIdx: number) => {
    if (!hasUltraQuizAccess) return;
    const nextAnswers = { ...selectedAnswers, [questionId]: optionIdx };
    setSelectedAnswers(nextAnswers);
    const nextCorrect = displayedQuizQuestions.filter(
      (item) => nextAnswers[item.id] === item.correctIndex
    ).length;
    const nextScorePct =
      displayedQuizQuestions.length > 0
        ? Math.round((nextCorrect / displayedQuizQuestions.length) * 100)
        : 0;
    if (isClassroomSponsoredStudent && currentOrderUid) {
      void recordStudentClassroomProgress({
        uid: currentOrderUid,
        email: user?.email || '',
        quizScorePercent: nextScorePct,
      });
    }
    if (currentOrderUid) {
      void pushUserProgressToFirestore({
        uid: currentOrderUid,
        userId: user?.userId,
        quizScorePercent: nextScorePct,
      });
    }
  };

  const handleChangeQuizFilter = (mode: Exclude<QuizFilterMode, 'mock_20'>) => {
    setQuizFilterMode(mode);
    setQuizPage(1);
    setQuizSubmitted(false);
  };

  const handleChangeAudienceFilter = (audience: QuizAudienceFilter) => {
    setQuizAudienceFilter(audience);
    setQuizPage(1);
    setQuizSubmitted(false);
  };

  const handleChangeQuizPage = (nextPage: number) => {
    const bounded = Math.max(1, Math.min(totalQuizPages, nextPage));
    setQuizPage(bounded);
    document.getElementById('quiz-bank-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePrintUltraQuiz = () => {
    if (!hasUltraQuizAccess) {
      openUpgradePrompt({
        featureKey: 'school_edtech',
        requiredPlan: 'school',
      });
      return;
    }
    window.print();
  };

  const handleDownloadUltraQuizDoc = () => {
    if (!hasUltraQuizAccess) {
      openUpgradePrompt({
        featureKey: 'school_edtech',
        requiredPlan: 'school',
      });
      return;
    }

    const activeFilterTitle =
      quizFilterMode === 'mock_20'
        ? lang === 'en'
          ? 'Random Mock Exam (20 Questions)'
          : lang === 'zh'
          ? '随机模拟测验（20 题）'
          : 'Thi thử ngẫu nhiên (20 câu)'
        : quizFilterMode === 'all'
        ? lang === 'en'
          ? 'All 6 Topics (100 Questions)'
          : lang === 'zh'
          ? '全部 6 大专题（100 题）'
          : 'Tất cả (100 câu · 6 chuyên đề)'
        : localizedQuizTopics.find((t) => t.id === quizFilterMode)?.title || quizFilterMode;

    const activeAudienceTitle =
      quizAudienceFilter === 'all'
        ? lang === 'en'
          ? 'All Audience Levels'
          : lang === 'zh'
          ? '全部学段'
          : 'Tất cả đối tượng'
        : localizedAudienceLevels.find((a) => a.id === quizAudienceFilter)?.label ||
          quizAudienceFilter;

    const docHtml = buildQuizWordDocHtml({
      lang,
      questions: displayedQuizQuestions,
      filterTitle: activeFilterTitle,
      audienceTitle: activeAudienceTitle,
    });

    const blob = new Blob(['\uFEFF' + docHtml], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dau_An_Viet_3D_Quiz_${quizFilterMode.toUpperCase()}_${quizAudienceFilter.toUpperCase()}_${lang.toUpperCase()}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setWorksheetDownloadedToast(
      lang === 'en'
        ? `Downloaded ${displayedQuizQuestions.length}-question bank & answers (.doc)`
        : lang === 'zh'
        ? `已下载 ${displayedQuizQuestions.length} 道题库与解析（.doc）`
        : `Đã tải xuống bộ ${displayedQuizQuestions.length} câu hỏi & đáp án (.doc)!`
    );
    setTimeout(() => setWorksheetDownloadedToast(null), 4000);
  };

  const handleCopyInviteCode = async () => {
    if (!teacherLicense?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(teacherLicense.inviteCode);
      setCopiedInviteCode(true);
      setTimeout(() => setCopiedInviteCode(false), 2400);
    } catch {
      setWorksheetDownloadedToast(`Mã mời lớp học: ${teacherLicense.inviteCode}`);
      setTimeout(() => setWorksheetDownloadedToast(null), 3200);
    }
  };

  const handleQuickSocialSignIn = async (provider: 'google' | 'facebook') => {
    setQuickAuthError(null);
    setQuickAuthBusy(provider);
    try {
      const res =
        provider === 'google'
          ? await signInWithFirebaseGoogleAccount(lang)
          : await signInWithFirebaseFacebookAccount(lang);
      if (res.redirecting) return;
      if (!res.ok && !res.cancelled) {
        setQuickAuthError(
          res.error ||
            (lang === 'en'
              ? 'Unable to complete sign-in.'
              : lang === 'zh'
              ? '无法完成登录。'
              : 'Không thể hoàn tất đăng nhập.')
        );
      }
    } finally {
      setQuickAuthBusy(null);
    }
  };

  const handleRedeemInviteCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteRedeemError(null);
    setInviteRedeemSuccess(null);

    if (!user || user.authMethod === 'judge_quick_access') {
      openAuthModal({
        prompt:
          lang === 'en'
            ? 'Sign in with Google or Facebook to activate Classroom Pro Code'
            : lang === 'zh'
            ? '请登录 Google 或 Facebook 账号以激活班级 Pro 邀请码'
            : 'Đăng nhập Google hoặc Facebook để kích hoạt Mã Lớp Học Gói Pro',
      });
      return;
    }

    const activeUid = (user.firebaseUid || user.userId).trim();
    const guard = getInviteCodeAttemptGuard(activeUid);
    if (!guard.allowed) {
      const mins = Math.ceil(guard.retryAfterSec / 60);
      setInviteRedeemError(
        `Bạn đã nhập sai quá ${guard.maxAttempts} lần. Vui lòng thử lại sau ${mins} phút (${guard.retryAfterSec} giây).`
      );
      return;
    }

    setInviteRedeemBusy(true);
    try {
      const res = await redeemClassroomInviteCode({
        rawCode: inviteCodeInput,
        studentUid: activeUid,
        studentEmail: user.email || '',
        studentName: user.displayName || user.email || 'Học sinh Facebook',
      });
      if (!res.ok) {
        setInviteRedeemError(res.error || 'Không thể kích hoạt Mã Lớp Học.');
        return;
      }
      setInviteCodeInput('');
      setInviteRedeemSuccess(
        `Chúc mừng! Bạn đã nhận thành công Gói Pro (Tài trợ bởi Lớp học · Mã ${res.grant?.inviteCode}). Toàn bộ 17 di tích, 9 hành trình, Bóc tách 3D/X-Ray, Thuyết minh đa ngôn ngữ và Sử Quan Dấu Ấn AI đã mở khóa!`
      );
      setWorksheetDownloadedToast(
        'Kích hoạt thành công Gói Pro (Tài trợ bởi Lớp học)!'
      );
      setTimeout(() => setWorksheetDownloadedToast(null), 4500);
      refreshEntitlements();
      refreshSubscription();
    } finally {
      setInviteRedeemBusy(false);
    }
  };

  useEffect(() => {
    saveUserEdTechState(
      user?.userId,
      {
        selectedAnswers,
        quizSubmitted,
        ticketIssued,
        ticketPassId,
        b2cPlanType,
        certPassId,
        topicAnswers,
        topicSubmittedMap,
        topicCertIds,
      },
      user?.email
    );
  }, [
    user?.userId,
    user?.email,
    selectedAnswers,
    quizSubmitted,
    ticketIssued,
    ticketPassId,
    b2cPlanType,
    certPassId,
    topicAnswers,
    topicSubmittedMap,
    topicCertIds,
  ]);

  const currentTicketRecord = passesSnapshot.find((p) => p.id === ticketPassId);
  const currentCertRecord = passesSnapshot.find((p) => p.id === certPassId);
  const selectedRouteObj =
    TOUR_ROUTES.find((r) => r.id === selectedRouteId) || TOUR_ROUTES[0];
  const authenticatedAccountLabel = user
    ? user.authMethod === 'judge_quick_access'
      ? 'Ban Giám Khảo (Demo)'
      : user.email
      ? `${user.provider === 'google' ? 'Google' : 'Facebook'} · ${user.email}`
      : `${user.provider === 'google' ? 'Google' : 'Facebook'} · ${user.displayName}`
    : '';

  useEffect(() => {
    if (!isPaymentModalOpen || !user) return;
    let cancelled = false;
    const buildQr = async () => {
      try {
        if (!ticketIssued) {
          const payPayload = `${paymentMethod.toUpperCase()}|DAU-AN-VIET-3D|${
            b2cPlanType === 'vip_49k' ? '49000' : '19000'
          }|${user.userId}|${selectedRouteId}`;
          const url = await QRCode.toDataURL(payPayload, {
            width: 180,
            margin: 1,
            color: { dark: '#171817', light: '#F4EFE4' },
          });
          if (!cancelled) setCheckoutQrDataUrl(url);
        } else if (currentTicketRecord) {
          const ticketPayload = JSON.stringify({
            app: 'DAU-AN-VIET-3D',
            code: currentTicketRecord.code,
            holder: currentTicketRecord.ownerName,
            contact: currentTicketRecord.ownerContactMasked,
            route: currentTicketRecord.routeTitle || currentTicketRecord.label,
            issuedAt: currentTicketRecord.issuedAt,
          });
          const url = await QRCode.toDataURL(ticketPayload, {
            width: 200,
            margin: 1,
            color: { dark: '#171817', light: '#F4EFE4' },
          });
          if (!cancelled) setIssuedTicketQrDataUrl(url);
        }
      } catch {
        // ignore QR error
      }
    };
    void buildQr();
    return () => {
      cancelled = true;
    };
  }, [
    isPaymentModalOpen,
    user,
    ticketIssued,
    paymentMethod,
    b2cPlanType,
    selectedRouteId,
    currentTicketRecord,
  ]);

  const handleDownloadWorksheet = (provinceLabel: string) => {
    const content = [
      '========================================================================',
      'BẢO TÀNG SỐ KIẾN TRÚC & DI SẢN ĐÔNG NAM BỘ — DẤU ẤN VIỆT 3D',
      `PHIẾU HỌC TẬP TRẢI NGHIỆM DI SẢN 3D (${provinceLabel.toUpperCase()})`,
      'Chương trình Giáo dục Phổ thông 2018 — Môn Lịch sử & Giáo dục Địa phương',
      '========================================================================',
      '',
      'Họ và tên học sinh: ....................................................',
      'Lớp: .................... Trường: ......................................',
      '',
      'PHẦN I. KHẢO SÁT KHÔNG GIAN 3D & ĐỊA TẦNG LỊCH SỬ:',
      '1. Quan sát chế độ Giải phẫu X-Ray 3D của Dinh Độc Lập (HCM-DT-001):',
      '   - Nhận xét giải pháp thông gió và bức rèm hoa đá chữ Cát của KTS Ngô Viết Thụ:',
      '   .....................................................................',
      '',
      '2. Quan sát Mặt cắt 3 tầng ngầm Địa đạo Củ Chi (HCM-DT-009) & Tam Giác Sắt:',
      '   - Giải thích vai trò của tầng đất sét pha đá ong (laterite clay) trên nền phù sa cổ:',
      '   .....................................................................',
      '',
      '3. So sánh kiến trúc Pháp - Đông Dương (Nhà hát TP, Bảo tàng Lịch sử, Bạch Dinh)',
      '   với kiến trúc gỗ cổ truyền Nam Bộ (Nhà cổ Trần Công Vàng, Nhà Lớn Long Sơn):',
      '   .....................................................................',
      '',
      'PHẦN II. MÃ KÍCH HOẠT HỌC LIỆU SỐ TRƯỜNG HỌC:',
      'Mã truy cập 3D Lab: EDTECH-DNB-2026-VIP',
      '========================================================================',
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Phieu_Hoc_Tap_Di_San_3D_${provinceLabel.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setWorksheetDownloadedToast(
      lang === 'en'
        ? `Downloaded 3D Heritage Worksheet (${provinceLabel}) — Ready for classroom printing!`
        : lang === 'zh'
        ? `已下载 3D 遗产学习单（${provinceLabel}）— 可直接打印分发给班级！`
        : `Đã tải xuống Phiếu Học Tập 3D (${provinceLabel}) — Sẵn sàng in hoặc phát cho lớp học!`
    );
    setTimeout(() => setWorksheetDownloadedToast(null), 4000);
  };

  return (
    <div className="w-full min-h-full bg-[#D8C9A9] text-[#171817] select-none">
      {/* Toast thông báo tải học liệu */}
      {worksheetDownloadedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-sm bg-[#171817] border border-[#C9A46A] text-[#D8C9A9] text-xs font-medium shadow-lg">
          <Check className="w-4 h-4 text-[#C9A46A] shrink-0" />
          <span>{worksheetDownloadedToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12 space-y-16">
        {/* =====================================================================
            HEADER VÉ THAM QUAN & HỌC LIỆU SỐ
           ===================================================================== */}
        <section className="border-b border-[#171817]/20 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs text-[#A94F3D] font-semibold tracking-wide block">
              {lang === 'en'
                ? 'Tickets & Learning Resources'
                : lang === 'zh'
                ? '参观门票与数字教材'
                : 'Vé tham quan & Học liệu'}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#171817] tracking-tight leading-[1.12] text-balance">
              {lang === 'en'
                ? 'Digital Exhibition Tickets & School Learning Packages'
                : lang === 'zh'
                ? '数字展馆门票与学校教学资源包'
                : 'Vé Tham Quan Số & Học Liệu Trường Học'}
            </h1>
            <p className="text-sm sm:text-base text-[#171817]/80 leading-relaxed max-w-2xl">
              {lang === 'en'
                ? 'Choose a pass to explore 3D architectural reconstructions, multilingual audio guides, and teaching materials across 17 monuments in Southeast Vietnam.'
                : lang === 'zh'
                ? '选择适合您的参观方案，探索越南东南部 17 处遗迹的 3D 建筑复原、多语种导览及教学资源。'
                : 'Lựa chọn gói trải nghiệm phù hợp để khám phá không gian kiến trúc 3D, thuyết minh đa ngôn ngữ và tài liệu giảng dạy cho 17 di tích Đông Nam Bộ.'}
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
            {onOpenGuide && (
              <SectionGuideButton lang={lang} onClick={onOpenGuide} />
            )}
            <div className="grid grid-cols-2 rounded-xl border border-[#171817]/20 bg-[#EDE3CE] divide-x divide-[#171817]/15 shrink-0 overflow-hidden">
              <div className="px-5 py-3.5">
                <span className="block font-serif text-xl sm:text-2xl text-[#171817] font-semibold tabular-nums">
                  {lang === 'en' ? '17 Sites' : lang === 'zh' ? '17 处遗迹' : '17 Di tích'}
                </span>
                <span className="block text-xs text-[#171817]/75 mt-0.5">
                  {lang === 'en' ? '3 Provinces' : lang === 'zh' ? '三省市联动' : '3 Tỉnh thành'}
                </span>
              </div>
              <div className="px-5 py-3.5">
                <span className="block font-serif text-xl sm:text-2xl text-[#A94F3D] font-semibold tabular-nums">
                  {lang === 'en' ? '3 Languages' : lang === 'zh' ? '三种语言' : '3 Ngôn ngữ'}
                </span>
                <span className="block text-xs text-[#171817]/75 mt-0.5">
                  {lang === 'en' ? 'VI · EN · ZH Audio' : lang === 'zh' ? '越 · 英 · 中导览' : 'Việt · Anh · Trung'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Thanh cá nhân hóa tài khoản cho Vé & Chứng nhận */}
        <div className="rounded-sm border border-[#171817]/20 bg-[#E4D7BC] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative overflow-hidden w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-[#C9A46A] text-[#171817] border border-[#171817]/20">
              <span>{user ? user.avatarInitials : <Lock className="w-4 h-4" />}</span>
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#171817]">
                {user ? (
                  <>
                    <span className="truncate">
                      {lang === 'en'
                        ? 'Authenticated Pass Holder: '
                        : lang === 'zh'
                        ? '已认证持票与行程账户：'
                        : 'Chủ tài khoản mua vé & hành trình: '}
                      <span className="text-[#171817] font-semibold">{user.displayName}</span>
                    </span>
                    {isAdmin ? (
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide bg-[#C9A46A] text-[#171817] border border-[#171817]/20 shrink-0">
                        {lang === 'en' ? 'Administrator' : lang === 'zh' ? '管理员' : 'Quản trị viên'}
                      </span>
                    ) : isTesterPro ? (
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide bg-[#47796D] text-[#D8C9A9] shrink-0">
                        Tester Pro
                      </span>
                    ) : globalPerms.canUseSchoolEdTech ? (
                      <span className="inline-flex items-center gap-1.5 shrink-0">
                        <span className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider uppercase border border-[#B8860B] bg-[#6E1D15] text-[#F7F2E9]">
                          ULTRA
                        </span>
                        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide bg-[#526D8B] text-[#FFFDF9] border border-[#C9A46A]/60">
                          {lang === 'en'
                            ? 'Ultra Classroom (35 Seats)'
                            : lang === 'zh'
                            ? 'Ultra 班级套餐（35 席位）'
                            : 'Gói Ultra (Lớp học · 35 suất Pro)'}
                        </span>
                      </span>
                    ) : isClassroomSponsoredStudent ? (
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide bg-[#47796D] text-[#FFFDF9] border border-[#C9A46A] shrink-0">
                        {lang === 'en'
                          ? 'Pro Plan (Sponsored by Classroom)'
                          : lang === 'zh'
                          ? 'Pro 套餐（班级赞助）'
                          : 'Gói Pro (Tài trợ bởi Lớp học)'}
                      </span>
                    ) : userTier === 'pro' ? (
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide bg-[#171817] border border-[#C9A46A] text-[#C9A46A] shrink-0">
                        Pro
                      </span>
                    ) : userTier === 'plus' ? (
                      <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide bg-[#526D8B] text-[#D8C9A9] shrink-0">
                        Plus
                      </span>
                    ) : null}
                  </>
                ) : (
                  lang === 'en'
                    ? 'Sign in with Google or Facebook to purchase tickets & save your journey'
                    : lang === 'zh'
                    ? '请登录 Google 或 Facebook 以购买门票并保存探索行程'
                    : 'Đăng nhập để mua vé & lưu hành trình'
                )}
              </div>
              <div className="text-[11px] text-[#171817]/70 truncate mt-0.5">
                {user
                  ? isTesterPro
                    ? lang === 'en'
                      ? `${authenticatedAccountLabel} · Tester Pro · All 3 Core Tiers unlocked at 0đ for QA verification`
                      : lang === 'zh'
                      ? `${authenticatedAccountLabel} · 专业测试版 · 三大核心套餐免费 0 越盾解锁测试`
                      : `${authenticatedAccountLabel} · Người thử nghiệm Pro · Mở khóa miễn phí toàn bộ 3 Gói Cốt lõi`
                    : lang === 'en'
                    ? `${authenticatedAccountLabel} · ${isAdmin ? 'Administrator' : 'Visitor'} · Verified pass holder`
                    : lang === 'zh'
                    ? `${authenticatedAccountLabel} · ${isAdmin ? '管理员' : '访客'} · 持票人信息已锁定`
                    : `${authenticatedAccountLabel} · ${isAdmin ? 'Quản trị viên' : 'Du khách'} · Đã khóa thông tin chủ vé`
                  : lang === 'en'
                  ? 'Sign-in required to issue QR passes, earn EdTech certificates, and sync with Admin Studio'
                  : lang === 'zh'
                  ? '需登录账户以签发专属二维码门票、获取数字教材证书并同步至管理后台'
                  : 'Bắt buộc đăng nhập Google hoặc Facebook để xuất vé QR, cấp chứng nhận và đồng bộ Admin Studio'}
              </div>
            </div>
          </div>

          {!user ? (
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={quickAuthBusy !== null}
                  onClick={() => void handleQuickSocialSignIn('google')}
                  className="px-3.5 py-2 rounded-sm bg-[#F4EFE4] hover:bg-[#FAF6EE] border border-[#171817]/25 text-[#171817] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                >
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" aria-hidden="true">
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
                  <span>
                    {quickAuthBusy === 'google'
                      ? lang === 'en'
                        ? 'Connecting...'
                        : lang === 'zh'
                        ? '连接中...'
                        : 'Đang kết nối...'
                      : 'Google'}
                  </span>
                </button>
                <button
                  type="button"
                  disabled={quickAuthBusy !== null}
                  onClick={() => void handleQuickSocialSignIn('facebook')}
                  className="px-3.5 py-2 rounded-sm bg-[#1877F2] hover:bg-[#166FE5] text-[#FFFFFF] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                >
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#1877F2"
                        d="M15.12 5.32H17V2.14A26.11 26.11 0 0 0 14.26 2c-2.72 0-4.58 1.66-4.58 4.7v2.62H6.61v3.56h3.07V22h3.68v-9.12h3.06l.46-3.56h-3.52V7.05c0-1.05.29-1.73 1.76-1.73z"
                      />
                    </svg>
                  </span>
                  <span>
                    {quickAuthBusy === 'facebook'
                      ? lang === 'en'
                        ? 'Connecting...'
                        : lang === 'zh'
                        ? '连接中...'
                        : 'Đang kết nối Facebook...'
                      : lang === 'en'
                      ? 'Continue with Facebook'
                      : lang === 'zh'
                      ? '使用 Facebook 继续'
                      : 'Tiếp tục với Facebook'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal({ prompt: lang === 'en' ? 'Tickets & EdTech' : lang === 'zh' ? '门票与教材' : 'Vé & Học liệu' })}
                  className="px-3.5 py-2 rounded-sm bg-[#171817] hover:bg-[#A94F3D] text-[#D8C9A9] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'More Options' : lang === 'zh' ? '其他登录方式' : 'Tùy chọn khác'}</span>
                </button>
              </div>
              {quickAuthError && (
                <div className="text-[11px] font-medium text-[#A94F3D] max-w-md text-left sm:text-right">
                  {quickAuthError}
                </div>
              )}
            </div>
          ) : (
            onOpenMyJourney && (
              <button
                type="button"
                onClick={onOpenMyJourney}
                className="px-4 py-2 rounded-sm bg-[#171817] hover:bg-[#A94F3D] text-[#D8C9A9] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en' ? 'My Account & Tickets' : lang === 'zh' ? '我的账户与门票' : 'Tài khoản & Vé của tôi'}
                </span>
              </button>
            )
          )}
        </div>

        {/* Đơn hàng & Vé cá nhân của tài khoản đang đăng nhập (cách ly tuyệt đối theo uid) */}
        {currentOrderUid && myPersonalOrders.length > 0 && (
          <section className="rounded-sm border border-[#171817]/20 bg-[#EDE3CE] p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#171817]/15 pb-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A94F3D]">
                  Theo dõi giao dịch cá nhân ({user?.email || user?.displayName})
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#171817] mt-0.5">
                  Đơn hàng VietQR của bạn
                </h3>
              </div>
              {isAdmin && (
                <span className="text-[11px] text-[#171817]/75 bg-[#E4D7BC] border border-[#171817]/15 px-3 py-1 rounded-sm">
                  Chỉ hiển thị đơn cá nhân của bạn · Đơn khách hàng nằm trong Admin Studio &gt; Duyệt thanh toán
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myPersonalOrders.slice(0, 6).map((order) => {
                const statusMeta =
                  order.status === 'paid'
                    ? {
                        label: 'Đã duyệt · Đã mở khóa vé',
                        cls: 'bg-[#47796D]/18 text-[#2D574C] border-[#47796D]/45',
                      }
                    : order.status === 'waiting_approval'
                    ? {
                        label: 'Đang chờ Admin duyệt',
                        cls: 'bg-[#C9A46A]/25 text-[#7B591E] border-[#C9A46A]/55',
                      }
                    : order.status === 'rejected'
                    ? {
                        label: 'Chưa được duyệt',
                        cls: 'bg-[#A94F3D]/15 text-[#8E3524] border-[#A94F3D]/40',
                      }
                    : {
                        label: 'Chờ chuyển khoản QR',
                        cls: 'bg-[#526D8B]/15 text-[#2E4866] border-[#526D8B]/40',
                      };

                return (
                  <div
                    key={order.orderId}
                    className="rounded-xl bg-[#FAF6EE] border border-[#171817]/15 p-3.5 flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#171817]">
                            {order.orderId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10.5px] font-semibold border ${statusMeta.cls}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-[#171817] mt-1">
                          {order.packageName} × {order.quantity}
                        </div>
                        {order.ticketCode && (
                          <div className="text-[11px] font-mono text-[#3A665B] font-semibold mt-0.5">
                            Mã vé: {order.ticketCode}
                          </div>
                        )}
                        {order.status === 'rejected' && order.rejectionReason && (
                          <div className="text-[11px] text-[#A94F3D] mt-1">
                            Lý do: {order.rejectionReason}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-serif text-base font-bold text-[#A94F3D] tabular-nums">
                          {formatVnd(order.amount)}
                        </div>
                      </div>
                    </div>

                    {order.status !== 'paid' && (
                      <div className="flex items-center justify-end pt-1 border-t border-[#171817]/10">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveWatchingOrderId(order.orderId, currentOrderUid);
                            openPlanCheckoutModal({
                              planTier: order.planTier || 'pro',
                              packageId: order.packageId,
                              quantity: order.quantity,
                              routeId: order.routeId,
                              siteId: order.siteId,
                              schoolName: order.schoolName,
                              schoolProvince: order.schoolProvince,
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1C2E2A] hover:bg-[#13221F] text-[#FFFDF9] text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Clock className="w-3 h-3 text-[#C9A46A]" />
                          <span>
                            {order.status === 'waiting_approval'
                              ? 'Xem trạng thái duyệt'
                              : order.status === 'rejected'
                              ? 'Tải lại biên lai'
                              : 'Mở lại mã VietQR'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {preselectedGuidedRoute && (
          <section className="rounded-sm border border-[#A94F3D]/45 bg-[#EDE3CE] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#A94F3D]">
                {lang === 'en'
                  ? 'Pre-filled from your completed route'
                  : lang === 'zh'
                  ? '已自动填入您刚完成的路线'
                  : 'Đã điền sẵn lộ trình vừa hoàn thành'}
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#171817]">
                {preselectedGuidedRoute.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#171817]/80">
                {guidedCertCode
                  ? lang === 'en'
                    ? `Issued route certificate ${guidedCertCode} and synced to your Profile & Admin Studio.`
                    : lang === 'zh'
                    ? `已签发路线证书 ${guidedCertCode}，并同步至个人档案与管理后台。`
                    : `Đã cấp chứng nhận hành trình mã ${guidedCertCode} và đồng bộ vào Hồ sơ cá nhân & Admin Studio.`
                  : lang === 'en'
                  ? 'Claim your free Heritage Route Certificate immediately or issue a 3D QR Tour Ticket for this route below.'
                  : lang === 'zh'
                  ? '您可立即免费领取遗产路线完成证书，或在下方签发该路线的 3D 二维码门票。'
                  : 'Bạn có thể nhận ngay Chứng nhận Hành trình Di sản miễn phí hoặc xuất Vé Tour 3D QR theo tuyến đã chọn sẵn bên dưới.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {user && !guidedCertCode && (
                <button
                  type="button"
                  onClick={() => {
                    if (!globalPerms.canUseJourneyStampAndCert) {
                      openUpgradePrompt({
                        featureKey: 'digital_certificate',
                        requiredPlan: 'plus_or_pro',
                      });
                      return;
                    }
                    const issued = recordIssuedPass({
                      code: `ROUTE-CERT-${Date.now().toString().slice(-4)}`,
                      kind: 'edtech_cert',
                      ownerUserId: user.userId,
                      ownerEmail: user.email || undefined,
                      ownerName: user.displayName,
                      ownerContactMasked: maskEmailForDisplay(user.email || user.displayName),
                      provider: user.provider,
                      routeId: preselectedGuidedRoute.mappedTourId,
                      routeTitle: preselectedGuidedRoute.title,
                      label: `Chứng nhận Hoàn thành Hành trình · ${preselectedGuidedRoute.title}`,
                      amountLabel: 'Chứng nhận Hành trình · Đã xác thực',
                      score: 100,
                    });
                    setCertPassId(issued.id);
                    setGuidedCertCode(issued.code);
                    refreshEntitlements();
                  }}
                  className={`px-5 py-2.5 rounded-sm bg-[#C9A46A] hover:bg-[#B89258] text-[#171817] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors ${
                    !globalPerms.canUseJourneyStampAndCert ? 'opacity-75' : ''
                  }`}
                >
                  {!globalPerms.canUseJourneyStampAndCert ? (
                    <LockGlyph className="w-4 h-4 text-[#171817] shrink-0" />
                  ) : (
                    <Award className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {lang === 'en'
                      ? 'Claim Route Certificate'
                      : lang === 'zh'
                      ? '立即领取路线证书'
                      : 'Nhận Chứng nhận Hành trình ngay'}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  openPlanCheckoutModal({
                    planTier: 'plus',
                    routeId: preselectedGuidedRoute.mappedTourId,
                    plusScopeType: 'route',
                  });
                }}
                className="px-4 py-2.5 rounded-sm bg-[#A94F3D] hover:bg-[#8E3F30] text-[#D8C9A9] text-xs font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Ticket className="w-4 h-4 shrink-0" />
                <span>
                  {lang === 'en'
                    ? 'Open 3D Ticket for This Route'
                    : lang === 'zh'
                    ? '打开本路线 3D 门票'
                    : 'Mở Vé Tour 3D tuyến này'}
                </span>
              </button>
            </div>
          </section>
        )}

        {/* =====================================================================
            KHU VỰC 1 — 3 GÓI VÉ THAM QUAN & HỌC LIỆU
           ===================================================================== */}
        <section id="pricing-packages-section" className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[13px] tracking-normal text-[#A94F3D] font-semibold block">
                {lang === 'en'
                  ? '01. Admission & Learning Packages'
                  : lang === 'zh'
                  ? '01. 门票与学习套餐'
                  : '01. Vé tham quan & gói học liệu'}
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#171817] tracking-tight mt-1.5">
                {lang === 'en'
                  ? 'Choose Your Museum Pass'
                  : lang === 'zh'
                  ? '选择参观与学习方案'
                  : 'Lựa Chọn Gói Trải Nghiệm'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* THẺ 1: GÓI MIỄN PHÍ — NỀN ĐỎ SON #A94F3D */}
            <div
              onMouseMove={tiltHandlers.onMouseMove}
              onMouseLeave={tiltHandlers.onMouseLeave}
              className="museum-tilt-card relative overflow-hidden rounded-2xl border border-[#171817]/20 bg-[#A94F3D] text-[#D8C9A9] p-7 sm:p-8 flex flex-col justify-between"
            >
              <div className="relative z-20 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3 border-b border-[#D8C9A9]/25 pb-5 min-h-[96px]">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold tracking-wide text-[#C9A46A] block">
                      {lang === 'en' ? 'Free' : lang === 'zh' ? '免费' : 'Miễn phí'}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#D8C9A9] tracking-tight mt-1.5 leading-snug">
                      {lang === 'en'
                        ? 'Basic Visitor Pass'
                        : lang === 'zh'
                        ? '基础参观门票'
                        : 'Vé Tham Quan Cơ Bản'}
                    </h3>
                  </div>
                  <Compass className="w-6 h-6 text-[#C9A46A] shrink-0 mt-1" />
                </div>

                <div className="pt-5 pb-5 min-h-[146px] flex flex-col justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl sm:text-4xl text-[#C9A46A] font-semibold tracking-tight tabular-nums">
                      {lang === 'en' ? '0 VND' : lang === 'zh' ? '0 越盾' : '0đ'}
                    </span>
                    <span className="text-xs text-[#D8C9A9]/80">
                      {lang === 'en' ? '/ Visitor' : lang === 'zh' ? '/ 访客' : '/ Khách tham quan'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#D8C9A9]/90 leading-relaxed">
                    {lang === 'en'
                      ? 'Explore the digital museum and historical records of 17 monuments across Southeast Vietnam.'
                      : lang === 'zh'
                      ? '体验数字展馆并查阅东南部 17 处遗迹的历史文献资料。'
                      : 'Trải nghiệm không gian số và tra cứu tư liệu lịch sử 17 di tích Đông Nam Bộ.'}
                  </p>
                </div>

                <ul className="border-t border-[#D8C9A9]/25 pt-5 space-y-3 text-xs sm:text-sm text-[#D8C9A9] flex-1">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'en'
                        ? 'Browse all 17 monument dossiers and interactive route map'
                        : lang === 'zh'
                        ? '浏览全部 17 处遗迹档案与参观路线地图'
                        : 'Xem toàn bộ 17 hồ sơ di tích và bản đồ tuyến tham quan'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'en'
                        ? 'Rotate 3D architectural models in standard exterior view'
                        : lang === 'zh'
                        ? '以原始外观模式旋转查看 3D 建筑模型'
                        : 'Xoay xem mô hình kiến trúc 3D ở chế độ nguyên bản'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'en'
                        ? 'Read historical chronicles, chronologies, and archival photos'
                        : lang === 'zh'
                        ? '阅读历史文献、建造年代与馆藏历史影像'
                        : 'Đọc tư liệu lịch sử, niên đại và hình ảnh lưu trữ'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'en'
                        ? 'Basic Q&A with Royal Historiographer (Gemini 2.5 Flash)'
                        : lang === 'zh'
                        ? '使用史官讲解基础问答（Gemini 2.5 Flash）'
                        : 'Hỏi đáp cơ bản cùng Sử Quan Dấu Ấn (Gemini 2.5 Flash)'}
                    </span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={onNavigateToMap}
                className="relative z-20 mt-7 w-full py-3.5 px-5 rounded-xl bg-[#171817] hover:bg-[#D8C9A9] text-[#D8C9A9] hover:text-[#171817] text-xs font-semibold transition-colors cursor-pointer"
              >
                {globalPerms.effectiveRole === 'basic' || globalPerms.effectiveRole === 'guest'
                  ? lang === 'en'
                    ? 'Active Plan'
                    : lang === 'zh'
                    ? '当前使用中'
                    : 'Đang sử dụng'
                  : lang === 'en'
                  ? 'Included in Your Higher Plan'
                  : lang === 'zh'
                  ? '已包含在当前高级套餐中'
                  : 'Đã bao gồm trong gói cao hơn'}
              </button>
            </div>

            {/* THẺ 2: GÓI TRẢI NGHIỆM PLUS / PRO — NỀN XANH CỔ #47796D */}
            <div
              onMouseMove={tiltHandlers.onMouseMove}
              onMouseLeave={tiltHandlers.onMouseLeave}
              className="museum-tilt-card relative overflow-hidden rounded-2xl border border-[#171817]/20 bg-[#47796D] text-[#D8C9A9] p-7 sm:p-8 flex flex-col justify-between"
            >
              <div className="relative z-20 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3 border-b border-[#D8C9A9]/25 pb-5 min-h-[96px]">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold tracking-wide text-[#C9A46A] block">
                      {lang === 'en' ? 'Most Popular' : lang === 'zh' ? '热门选择' : 'Được chọn nhiều'}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#D8C9A9] tracking-tight mt-1.5 leading-snug">
                      {lang === 'en'
                        ? '3D Discovery & Audio Pass'
                        : lang === 'zh'
                        ? '3D 探索与语音导览票'
                        : 'Vé Khám Phá 3D & Thuyết Minh'}
                    </h3>
                  </div>
                  <Ticket className="w-6 h-6 text-[#C9A46A] shrink-0 mt-1" />
                </div>

                {/* Bộ chọn 2 mức giá Plus / Pro */}
                <div className="pt-5 pb-5 min-h-[146px] flex flex-col justify-center gap-2.5">
                  <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl bg-[#171817]/25 border border-[#D8C9A9]/30">
                    <button
                      type="button"
                      onClick={() => setB2cPlanType('route_19k')}
                      className={`py-2.5 px-3 rounded-lg text-left transition-colors cursor-pointer ${
                        b2cPlanType === 'route_19k'
                          ? 'bg-[#C9A46A] text-[#171817] font-semibold'
                          : 'text-[#D8C9A9]/85 hover:text-[#D8C9A9]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-serif text-lg font-semibold leading-none tabular-nums">
                          25.000đ
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold bg-[#526D8B] text-[#D8C9A9] shrink-0">
                          Học sinh
                        </span>
                      </div>
                      <span className="block text-[11px] mt-1.5 opacity-90">
                        {lang === 'en'
                          ? '/ 1 route · 30 days'
                          : lang === 'zh'
                          ? '/ 1 条路线 · 30 天'
                          : '/ 1 tuyến · 30 ngày'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setB2cPlanType('vip_49k')}
                      className={`py-2.5 px-3 rounded-lg text-left transition-colors cursor-pointer ${
                        b2cPlanType === 'vip_49k'
                          ? 'bg-[#C9A46A] text-[#171817] font-semibold'
                          : 'text-[#D8C9A9]/85 hover:text-[#D8C9A9]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-serif text-lg font-semibold leading-none tabular-nums">
                          59.000đ
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold bg-[#171817] border border-[#C9A46A] text-[#C9A46A] shrink-0">
                          Tự túc
                        </span>
                      </div>
                      <span className="block text-[11px] mt-1.5 opacity-90">
                        {lang === 'en'
                          ? '/ All 17 sites · 90 days'
                          : lang === 'zh'
                          ? '/ 全 17 处 · 90 天'
                          : '/ Toàn bộ 17 di tích · 90 ngày'}
                      </span>
                    </button>
                  </div>

                  {b2cPlanType === 'route_19k' && (
                    <select
                      value={selectedRouteId}
                      onChange={(e) => setSelectedRouteId(e.target.value)}
                      aria-label={
                        lang === 'en'
                          ? 'Select thematic route'
                          : lang === 'zh'
                          ? '选择专题路线'
                          : 'Chọn tuyến di tích chuyên đề'
                      }
                      className="w-full rounded-lg bg-[#171817] border border-[#D8C9A9]/30 px-3 py-2 text-xs text-[#D8C9A9] focus:outline-none focus:border-[#C9A46A] cursor-pointer"
                    >
                      {TOUR_ROUTES.map((route) => {
                        const loc = getLocalizedTour(route);
                        return (
                          <option key={route.id} value={route.id}>
                            {loc.title} ({route.sites.length}{' '}
                            {lang === 'en' ? 'stops' : lang === 'zh' ? '站' : 'điểm'} · ~
                            {route.distanceKm} km)
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                <ul className="border-t border-[#D8C9A9]/25 pt-5 space-y-3 text-xs sm:text-sm text-[#D8C9A9] flex-1">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'en'
                        ? 'Unlock 4-layer 3D architectural dissection and structural X-Ray mode'
                        : lang === 'zh'
                        ? '解锁四层 3D 建筑剖解与结构透视 X 光模式'
                        : 'Mở khóa chế độ Bóc tách 4 tầng kiến trúc và X-Ray xuyên kết cấu'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'en'
                        ? 'Listen to multilingual audio guides (Vietnamese · English · Chinese)'
                        : lang === 'zh'
                        ? '收听多语种语音导览（越南语 · 英语 · 中文）'
                        : 'Nghe thuyết minh âm thanh đa ngôn ngữ (Việt · Anh · Trung)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
                    <span>
                      {b2cPlanType === 'route_19k'
                        ? lang === 'en'
                          ? 'Unlock enhanced Royal Historiographer (Gemini 3.5 Flash)'
                          : lang === 'zh'
                          ? '解锁进阶史官讲解（Gemini 3.5 Flash）'
                          : 'Mở khóa Sử Quan Dấu Ấn nâng cao (Gemini 3.5 Flash)'
                        : lang === 'en'
                        ? 'Unlock deep Royal Historiographer (Gemini 3.5 Flash & 4 Hydrogen)'
                        : lang === 'zh'
                        ? '解锁深度史官讲解（Gemini 3.5 Flash & 4 Hydrogen）'
                        : 'Mở khóa Sử Quan Dấu Ấn chuyên sâu (Gemini 3.5 Flash & 4 Hydrogen)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'en'
                        ? 'Save your journey and receive a digital visitor certificate'
                        : lang === 'zh'
                        ? '记录参观足迹并领取数字参观证书'
                        : 'Lưu dấu hành trình và nhận thẻ chứng nhận tham quan số'}
                    </span>
                  </li>
                </ul>
              </div>

              {(() => {
                const isProActive =
                  globalPerms.effectiveRole === 'pro' ||
                  globalPerms.effectiveRole === 'school' ||
                  globalPerms.effectiveRole === 'admin';
                const isPlusActive = globalPerms.effectiveRole === 'plus';
                const showingActiveState =
                  (b2cPlanType === 'vip_49k' && isProActive) ||
                  (b2cPlanType === 'route_19k' && isProActive);
                return (
                  <div className="relative z-20 mt-7 space-y-2">
                    {isPlusActive && b2cPlanType === 'route_19k' && (
                      <div className="text-center text-[11px] font-semibold text-[#C9A46A] bg-[#171817]/35 border border-[#C9A46A]/45 rounded-lg py-1.5 px-3">
                        Đang sử dụng Vé Plus ({globalPerms.unlockedSiteIds.length}/17 di tích đã mở)
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (showingActiveState) {
                          onNavigateToMap();
                          return;
                        }
                        openPlanCheckoutModal({
                          planTier: b2cPlanType === 'vip_49k' ? 'pro' : 'plus',
                          packageId:
                            b2cPlanType === 'vip_49k' ? 'self_guided_59k' : 'student_25k',
                          routeId: b2cPlanType === 'route_19k' ? selectedRouteId : undefined,
                          plusScopeType: 'route',
                        });
                      }}
                      className={`w-full py-3.5 px-5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                        showingActiveState
                          ? 'bg-[#171817] text-[#C9A46A] border border-[#C9A46A]/65 hover:bg-[#171817]/85'
                          : 'bg-[#C9A46A] hover:bg-[#D8C9A9] text-[#171817]'
                      }`}
                    >
                      {showingActiveState ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>
                            {lang === 'en'
                              ? 'Active Plan (All 17 Unlocked)'
                              : lang === 'zh'
                              ? '当前使用中（已解锁全 17 处）'
                              : 'Đang sử dụng (Đã mở khóa 17 di tích)'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>
                            {b2cPlanType === 'vip_49k'
                              ? lang === 'en'
                                ? 'Buy Self-Guided Pass (59,000 VND)'
                                : lang === 'zh'
                                ? '购买自助通票（59,000 越盾）'
                                : 'Mua Gói Tự túc (59.000đ)'
                              : lang === 'en'
                              ? 'Buy Student Pass (25,000 VND)'
                              : lang === 'zh'
                              ? '购买学生通票（25,000 越盾）'
                              : 'Mua Gói Học sinh (25.000đ)'}
                          </span>
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* THẺ 3: GÓI ULTRA (LỚP HỌC · 500K) — NỀN CHÀM #526D8B */}
            <div
              onMouseMove={tiltHandlers.onMouseMove}
              onMouseLeave={tiltHandlers.onMouseLeave}
              className="museum-tilt-card relative overflow-hidden rounded-2xl border border-[#171817]/20 bg-[#526D8B] text-[#D8C9A9] p-7 sm:p-8 flex flex-col justify-between"
            >
              <div className="relative z-20 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3 border-b border-[#D8C9A9]/25 pb-5 min-h-[96px]">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#C9A46A]">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border border-[#B8860B] bg-[#6E1D15] text-[#F7F2E9]">
                        ULTRA
                      </span>
                      <span>
                        {lang === 'en'
                          ? 'For Education'
                          : lang === 'zh'
                          ? '教育专用'
                          : 'Dành cho Lớp học'}
                      </span>
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#D8C9A9] tracking-tight mt-1.5 leading-snug">
                      {lang === 'en'
                        ? 'Ultra Classroom Package (500k)'
                        : lang === 'zh'
                        ? 'Ultra 班级教学套餐（500k）'
                        : 'Gói Ultra (Lớp học · 500k)'}
                    </h3>
                  </div>
                  <GraduationCap className="w-6 h-6 text-[#C9A46A] shrink-0 mt-1" />
                </div>

                <div className="pt-5 pb-5 min-h-[146px] flex flex-col justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl sm:text-4xl text-[#C9A46A] font-semibold tracking-tight tabular-nums">
                      500.000đ
                    </span>
                    <span className="text-xs text-[#D8C9A9]/80">
                      {lang === 'en'
                        ? '/ Class / Semester (35 seats)'
                        : lang === 'zh'
                        ? '/ 班级 / 学期（35 账号）'
                        : '/ Lớp / Học kỳ (35 HS)'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#D8C9A9]/90 leading-relaxed">
                    {lang === 'en'
                      ? 'Grant Gói Pro to up to 35 students, manage class roster, pin assignments & export CSV scorecards.'
                      : lang === 'zh'
                      ? '为最多 35 名学生提供 Pro 权限，在线管理班级、布置学习任务并导出成绩单。'
                      : 'Cấp Gói Pro cho tối đa 35 học sinh qua mã ULTRA, quản lý lớp học, giao bài và xuất bảng điểm.'}
                  </p>
                </div>

                <ul className="border-t border-[#D8C9A9]/25 pt-5 space-y-3 text-xs sm:text-sm text-[#D8C9A9] flex-1">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'en'
                        ? 'Ultra Classroom Center: 35 student seats via invite code or Gmail list'
                        : lang === 'zh'
                        ? 'Ultra 班级管理中心：通过邀请码或 Gmail 列表分发 35 个 Pro 席位'
                        : 'Trung tâm Quản lý Lớp Ultra: cấp 35 suất Pro qua mã mời hoặc Gmail'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'en'
                        ? 'Exclusive access to view, take, print & download the 100-question bank & answers (6 topics · Grades 6–University · VI/EN/ZH)'
                        : lang === 'zh'
                        ? '专享查看、作答、打印与下载 100 题库及标准答案（6 大专题 · 初中至大学 · 越/英/中三语）'
                        : 'Độc quyền xem, làm bài, in & tải Ngân hàng 100 câu hỏi kèm đáp án (6 chuyên đề · THCS đến Đại học · 3 ngôn ngữ VI/EN/ZH)'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#C9A46A] shrink-0 mt-0.5" />
                    <span>
                      {lang === 'en'
                        ? 'Track class progress, pin assignments & export CSV score reports'
                        : lang === 'zh'
                        ? '实时跟踪班级进度、布置任务并导出 CSV 成绩报告'
                        : 'Theo dõi tiến độ khám phá 17 di tích, giao nhiệm vụ & xuất bảng điểm CSV'}
                    </span>
                  </li>
                </ul>
              </div>

              {globalPerms.canUseSchoolEdTech ? (
                <div className="relative z-20 mt-7 space-y-2">
                  {teacherLicense?.inviteCode && (
                    <div className="text-center text-[11px] font-mono font-bold text-[#C9A46A] bg-[#171817]/40 border border-[#C9A46A]/45 rounded-lg py-1.5 px-3">
                      Mã lớp Ultra: {teacherLicense.inviteCode} ({teacherGrants.length}/{teacherLicense.maxSeats || CLASSROOM_MAX_SEATS} HS)
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenUltraClassroom) {
                        onOpenUltraClassroom();
                      } else {
                        const el = document.getElementById('school-edtech-repository');
                        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="w-full py-3.5 px-5 rounded-xl bg-[#171817] border border-[#C9A46A]/65 hover:bg-[#6E1D15] text-[#F7F2E9] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4 text-[#C9A46A]" />
                    <span>
                      {lang === 'en'
                        ? 'Open Ultra Classroom Center'
                        : lang === 'zh'
                        ? '打开 Ultra 班级管理中心'
                        : 'Mở Trung tâm Quản lý Lớp Ultra'}
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    openPlanCheckoutModal({
                      planTier: 'school',
                      packageId: 'classroom_500k',
                      schoolName,
                      schoolProvince,
                    });
                  }}
                  className="relative z-20 mt-7 w-full py-3.5 px-5 rounded-xl bg-[#171817] hover:bg-[#D8C9A9] text-[#D8C9A9] hover:text-[#171817] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>
                    {lang === 'en'
                      ? 'Buy Ultra Classroom (500,000 VND)'
                      : lang === 'zh'
                      ? '购买 Ultra 班级套餐（500,000 越盾）'
                      : 'Mua Gói Ultra (500.000đ)'}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* THẺ TÓM TẮT LỚP ULTRA (GIÁO VIÊN) HOẶC Ô NHẬP MÃ MỜI LỚP HỌC (HỌC SINH) */}
          {globalPerms.canUseSchoolEdTech && teacherLicense ? (
            <div className="rounded-xl border border-[#B8860B]/45 bg-[#F7F2E9] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider uppercase border border-[#B8860B] bg-[#6E1D15] text-[#F7F2E9]">
                    ULTRA
                  </span>
                  <span className="text-xs font-semibold text-[#A94F3D]">
                    Trung tâm Quản lý Lớp học (35 suất Gói Pro)
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-[#171817] truncate">
                  {teacherLicense.className || 'Lớp Học Di Sản Ultra'}
                </h3>
                <p className="text-xs text-[#171817]/75">
                  Sĩ số đang dùng:{' '}
                  <strong className="text-[#171817] tabular-nums">
                    {teacherGrants.length} / {teacherLicense.maxSeats || CLASSROOM_MAX_SEATS} học sinh
                  </strong>{' '}
                  · Mã mời lớp học:{' '}
                  <strong className="font-mono text-[#6E1D15]">{teacherLicense.inviteCode}</strong>
                  {teacherLicense.inviteCodeLocked ? ' (Đang khóa nhập mã)' : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyInviteCode}
                  className="px-4 py-2.5 rounded-lg bg-[#EDE3CE] hover:bg-[#E4D7BC] border border-[#DCD3C3] text-[#2C241E] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedInviteCode ? (
                    <Check className="w-3.5 h-3.5 text-[#47796D]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#A94F3D]" />
                  )}
                  <span>{copiedInviteCode ? 'Đã sao chép mã' : 'Sao chép mã'}</span>
                </button>
                {onOpenUltraClassroom && (
                  <button
                    type="button"
                    onClick={onOpenUltraClassroom}
                    className="px-4 py-2.5 rounded-lg bg-[#6E1D15] hover:bg-[#8C281E] border border-[#B8860B] text-[#F7F2E9] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-[#F2D99B]" />
                    <span>Mở Trung tâm Quản lý Lớp Ultra</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#DCD3C3] bg-[#F7F2E9] p-5 sm:p-6">
              {isClassroomSponsoredStudent && classroomGrant ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#47796D]">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Gói Pro (Tài trợ bởi Lớp học) đang hoạt động</span>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-[#171817]">
                      {classroomGrant.className || classroomGrant.schoolName || 'Lớp Học Di Sản Ultra'} · Mã{' '}
                      <span className="font-mono text-[#A94F3D]">{classroomGrant.inviteCode}</span>
                    </h3>
                    <p className="text-xs text-[#171817]/75">
                      {lang === 'en'
                        ? 'You have unlocked all 17 monuments, 9 routes, 3D/X-Ray dissection, multilingual audio, and Royal Historiographer AI. (The 100-question teaching bank & exports are exclusive to the Teacher Ultra Package).'
                        : lang === 'zh'
                        ? '您已解锁全部 17 处遗迹、9 条路线、3D/X光剖解、多语导览及史官 AI。（100 题库与试卷导出仅限教师 Ultra 套餐专享）。'
                        : 'Bạn đã mở khóa toàn bộ 17 di tích, 9 hành trình, Bóc tách 3D/X-Ray, Thuyết minh đa ngôn ngữ và Sử Quan Dấu Ấn AI. (Ngân hàng 100 câu hỏi & tải bộ đề thuộc độc quyền Gói Ultra giáo viên).'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToMap}
                    className="px-4 py-2.5 rounded-lg bg-[#47796D] hover:bg-[#3A655B] text-[#FFFDF9] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto transition-colors"
                  >
                    <Compass className="w-4 h-4" />
                    <span>
                      {lang === 'en'
                        ? 'Explore 17 3D Landmarks'
                        : lang === 'zh'
                        ? '探索 17 处 3D 遗迹'
                        : 'Khám phá 17 Di tích 3D'}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-1 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A94F3D]">
                      <KeyRound className="w-3.5 h-3.5 shrink-0" />
                      <span>Dành cho học sinh tham gia lớp Ultra</span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#171817]">
                      Học sinh có Mã Lớp Học từ Giáo viên?
                    </h3>
                    <p className="text-xs text-[#171817]/75 leading-relaxed">
                      Nhập mã do giáo viên cung cấp (ví dụ <strong className="font-mono">ULTRA-8A4K9B</strong>) để kích hoạt ngay{' '}
                      <strong>Gói Pro (Tài trợ bởi Lớp học)</strong> miễn phí trong suốt học kỳ.
                    </p>
                  </div>

                  <div className="w-full lg:w-[440px] space-y-2 shrink-0">
                    <form onSubmit={handleRedeemInviteCode} className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={inviteCodeInput}
                        onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                        placeholder="Nhập mã lớp (VD: ULTRA-8A4K9B)"
                        className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#FFFDF9] border border-[#DCD3C3] text-xs font-mono uppercase tracking-wider text-[#171817] placeholder:normal-case placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:border-[#A94F3D]"
                      />
                      <button
                        type="submit"
                        disabled={inviteRedeemBusy}
                        className="px-4 py-2.5 rounded-lg bg-[#A94F3D] hover:bg-[#8E3F30] disabled:opacity-60 text-[#FFFDF9] text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{inviteRedeemBusy ? 'Đang kích hoạt...' : 'Kích hoạt Gói Pro'}</span>
                      </button>
                    </form>
                    {(!user || user.authMethod === 'judge_quick_access') && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] text-[#5C5347]">
                          {lang === 'en'
                            ? 'Sign in first:'
                            : lang === 'zh'
                            ? '请先登录：'
                            : 'Đăng nhập nhanh để nhập mã:'}
                        </span>
                        <button
                          type="button"
                          disabled={quickAuthBusy !== null}
                          onClick={() => void handleQuickSocialSignIn('google')}
                          className="px-2.5 py-1 rounded-md bg-[#EDE3CE] hover:bg-[#E4D7BC] border border-[#DCD3C3] text-[#171817] text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <span>Google</span>
                        </button>
                        <button
                          type="button"
                          disabled={quickAuthBusy !== null}
                          onClick={() => void handleQuickSocialSignIn('facebook')}
                          className="px-2.5 py-1 rounded-md bg-[#1877F2] hover:bg-[#166FE5] text-white text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <span>
                            {lang === 'en'
                              ? 'Continue with Facebook'
                              : lang === 'zh'
                              ? 'Facebook 登录'
                              : 'Tiếp tục với Facebook'}
                          </span>
                        </button>
                      </div>
                    )}
                    {inviteRedeemError && (
                      <div className="text-[11.5px] font-medium text-[#A94F3D] bg-[#A94F3D]/10 border border-[#A94F3D]/35 rounded-lg px-3 py-2">
                        {inviteRedeemError}
                      </div>
                    )}
                    {inviteRedeemSuccess && (
                      <div className="text-[11.5px] font-medium text-[#2D574C] bg-[#47796D]/12 border border-[#47796D]/40 rounded-lg px-3 py-2">
                        {inviteRedeemSuccess}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Bảng Dấu mộc Hộ chiếu Di sản Số đồng bộ từ Thử thách Giải mã 3D */}
        <section className="pt-6 border-t border-[#171817]/18">
          <div className="rounded-sm border border-[#171817]/20 bg-[#EDE3CE] p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#171817]/18 pb-4">
              <div>
                <span className="text-[13px] font-semibold text-[#A94F3D] block">
                  {lang === 'en'
                    ? `Digital Heritage Passport · ${user ? user.displayName : '3D Architectural Stamps'}`
                    : lang === 'zh'
                    ? `数字遗产护照 · ${user ? user.displayName : '3D 建筑解密印章'}`
                    : `Hộ chiếu Di sản Số · ${user ? user.displayName : 'Dấu mộc Giải mã 3D'}`}
                </span>
                <h3 className="font-serif text-xl font-semibold text-[#171817] tracking-tight mt-1">
                  {lang === 'en'
                    ? `Digital Heritage Passport ${user ? `— ${user.displayName}` : '(Synced with 3D Architectural Stamps)'}`
                    : lang === 'zh'
                    ? `数字遗产护照 ${user ? `— ${user.displayName}` : '（同步 3D 建筑解剖印章）'}`
                    : `Hộ Chiếu Di Sản Số ${user ? `— ${user.displayName}` : '(Đồng bộ Dấu Mộc Giải Mã Kiến Trúc 3D)'}`}
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <HeritageSearchCombobox
                  sites={sites}
                  canonicalSites={sites}
                  value={passportSearchQuery}
                  onChange={setPassportSearchQuery}
                  onSelectSite={(site) => {
                    const locSite = getLocalizedSite(site);
                    const canStampThisSite =
                      globalPerms.effectiveRole === 'admin' ||
                      globalPerms.effectiveRole === 'pro' ||
                      globalPerms.effectiveRole === 'school' ||
                      (globalPerms.effectiveRole === 'plus' &&
                        globalPerms.unlockedSiteIds.includes(site.id));
                    if (!canStampThisSite) {
                      openUpgradePrompt({
                        featureKey: 'journey_stamp',
                        siteId: site.id,
                        siteName: locSite.officialName,
                        requiredPlan:
                          globalPerms.effectiveRole === 'plus' ? 'pro' : 'plus_or_pro',
                        isPlusScopeMismatch: globalPerms.effectiveRole === 'plus',
                      });
                      return;
                    }
                    onStart3DVipExperience(site.id, 'TOUR-INTER-01');
                  }}
                  placeholder={
                    lang === 'en'
                      ? 'Search 17 monuments...'
                      : lang === 'zh'
                      ? '搜索 17 处遗迹...'
                      : 'Tìm nhanh 17 di tích...'
                  }
                  tone="light"
                  dropdownAlign="right"
                  dropdownWidthClass="w-full sm:w-[360px]"
                  className="w-full sm:w-[240px]"
                />
                <div className="px-4 py-2 rounded-sm bg-[#E4D7BC] border border-[#171817]/25 text-xs font-semibold text-[#171817] tabular-nums whitespace-nowrap text-center">
                  {unlockedStampCount} / {sites.length}{' '}
                  {lang === 'en' ? 'Stamps Unlocked' : lang === 'zh' ? '枚印章已解锁' : 'Dấu mộc đã mở'}
                </div>
              </div>
            </div>

            {(() => {
              const matchedPassportSites = sites.filter((site, idx) => {
                const locSite = getLocalizedSite(site);
                return matchesHeritageSiteQuery({
                  site,
                  canonicalIndex: idx,
                  rawQuery: passportSearchQuery,
                  localizedName: locSite.officialName,
                  localizedFolkName: locSite.folkName,
                  localizedSummary: locSite.summary,
                });
              });
              if (matchedPassportSites.length === 0) {
                return (
                  <div className="py-10 text-center rounded-sm border border-[#171817]/15 bg-[#F4EFE4] text-xs text-[#171817]/70">
                    {lang === 'en'
                      ? 'No monuments match this search keyword'
                      : lang === 'zh'
                      ? '未找到符合该关键词的遗迹'
                      : 'Không tìm thấy di tích phù hợp với từ khóa này'}
                  </div>
                );
              }
              return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {matchedPassportSites.map((site) => {
                const stamp = passportStamps[site.id];
                const isUnlocked = Boolean(stamp);
                const thumbPhoto = site.photos?.[0] || '';
                const hasValidThumb = Boolean(thumbPhoto) && !failedPhotoMap[site.id];
                const locSite = getLocalizedSite(site);
                return (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => {
                      const canStampThisSite =
                        globalPerms.effectiveRole === 'admin' ||
                        globalPerms.effectiveRole === 'pro' ||
                        globalPerms.effectiveRole === 'school' ||
                        (globalPerms.effectiveRole === 'plus' &&
                          globalPerms.unlockedSiteIds.includes(site.id));
                      if (!canStampThisSite) {
                        openUpgradePrompt({
                          featureKey: 'journey_stamp',
                          siteId: site.id,
                          siteName: locSite.officialName,
                          requiredPlan:
                            globalPerms.effectiveRole === 'plus' ? 'pro' : 'plus_or_pro',
                          isPlusScopeMismatch: globalPerms.effectiveRole === 'plus',
                        });
                        return;
                      }
                      onStart3DVipExperience(site.id, 'TOUR-INTER-01');
                    }}
                    className={`text-left p-3.5 rounded-sm border transition-colors cursor-pointer flex flex-col justify-between gap-2.5 group ${
                      isUnlocked
                        ? 'bg-[#C9A46A]/25 border-[#A94F3D] hover:bg-[#C9A46A]/35'
                        : 'bg-[#D8C9A9]/75 border-[#171817]/18 hover:border-[#171817]/45'
                    } ${!globalPerms.canUseJourneyStampAndCert ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-[#171817]/65 tabular-nums">
                        {site.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          isUnlocked ? 'text-[#47796D]' : 'text-[#171817]/60'
                        }`}
                      >
                        {!globalPerms.canUseJourneyStampAndCert && (
                          <LockGlyph className="w-3 h-3 text-[#C9A46A]" />
                        )}
                        {isUnlocked
                          ? `✓ ${stamp.stampCode}`
                          : lang === 'en'
                          ? 'Locked'
                          : lang === 'zh'
                          ? '待解锁'
                          : 'Chưa giải mã'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-16 aspect-video rounded-sm overflow-hidden shrink-0 border border-[#171817]/20 bg-[#171817]">
                        {hasValidThumb ? (
                          <HeritageSmoothImage
                            src={thumbPhoto}
                            alt={locSite.officialName}
                            loading="lazy"
                            waitTone="dark"
                            onError={() =>
                              setFailedPhotoMap((prev) => ({ ...prev, [site.id]: true }))
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          />
                        ) : (
                          <HeritageTypographicPlate site={site} variant="compact" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="text-xs font-semibold text-[#171817] line-clamp-1">
                          {locSite.officialName}
                        </div>
                        <div className="text-[11px] text-[#171817]/70 line-clamp-1">
                          {isUnlocked
                            ? stamp.secretTitle
                            : lang === 'en'
                            ? 'Open 3D & Unlock Stamp ↗'
                            : lang === 'zh'
                            ? '点击开启 3D 沙盘并解锁 ↗'
                            : 'Bấm để mở Sa bàn 3D & Giải mã ↗'}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
              );
            })()}
          </div>
        </section>

        {/* =====================================================================
            KHU VỰC 2 — KHO HỌC LIỆU MỞ & NGÂN HÀNG 100 CÂU HỎI (ĐỘC QUYỀN GÓI ULTRA)
            Tuyệt đối KHÔNG render câu hỏi/đáp án/giải thích/nguồn khi !hasUltraQuizAccess
           ===================================================================== */}
        {!hasUltraQuizAccess && (
          <section
            id="school-edtech-repository"
            className="space-y-6 pt-6 border-t border-[#171817]/18"
          >
            <div className="rounded-2xl border-2 border-[#B8860B] bg-[#F7F2E9] text-[#171817] p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 border-b border-[#DCD3C3] pb-6">
                <div className="space-y-2.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#A63A2B] text-[#F7F2E9] text-[11px] font-bold uppercase tracking-[0.14em]">
                      <LockGlyph className="w-3.5 h-3.5 text-[#F2D99B]" />
                      <span>
                        {lang === 'en'
                          ? 'EXCLUSIVE TO ULTRA PACKAGE'
                          : lang === 'zh'
                          ? 'ULTRA 套餐专享'
                          : 'ĐỘC QUYỀN GÓI ULTRA'}
                      </span>
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8C6407]">
                      {lang === 'en'
                        ? '02. Open EdTech Archive & Interactive Quiz Bank'
                        : lang === 'zh'
                        ? '02. 开放教材库与互动测评题库'
                        : '02. Kho học liệu mở & đánh giá tương tác'}
                    </span>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#171817] leading-snug">
                    {lang === 'en'
                      ? '100-Question Advanced Heritage Bank & Teaching Packs (VI / EN / ZH)'
                      : lang === 'zh'
                      ? '100 题深度遗产题库与教学试卷（VI / EN / ZH）'
                      : 'Ngân hàng 100 Câu hỏi Chuyên sâu & Bộ Đề Giảng dạy (VI / EN / ZH)'}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#4A4136] leading-relaxed">
                    {lang === 'en'
                      ? 'Current account (Free / Student / Pro, including classroom-sponsored Pro) does not have permission to view, take, print, or download the 100-question bank and answer key. Please upgrade to the Ultra Package (500,000 VND) to unlock all 6 topics from Lower Secondary to University & Lecturers.'
                      : lang === 'zh'
                      ? '当前账户（免费版 / 学生版 / Pro 版）暂无权查看、作答、打印或下载 100 题库及标准答案。请升级至 Ultra 套餐（500,000 越盾），解锁从初中到大学讲师的全部 6 大专题。'
                      : 'Tài khoản hiện tại (Miễn phí / Học sinh / Pro) chưa có quyền xem, làm bài hoặc tải bộ 100 câu hỏi và đáp án. Vui lòng nâng cấp lên Gói Ultra (500.000đ) để mở khóa trọn bộ 6 chuyên đề từ cấp THCS đến Đại học & Giảng viên.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const pricingEl = document.getElementById('pricing-packages-section');
                      if (pricingEl) {
                        pricingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else {
                        openUpgradePrompt({
                          featureKey: 'school_edtech',
                          requiredPlan: 'school',
                        });
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#A63A2B] hover:bg-[#8E3023] text-[#F7F2E9] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-[#F2D99B]" />
                    <span>
                      {lang === 'en'
                        ? 'Upgrade to Ultra Package (500,000 VND)'
                        : lang === 'zh'
                        ? '升级至 Ultra 套餐（500,000 越盾）'
                        : 'Nâng cấp Gói Ultra (500.000đ)'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrintUltraQuiz}
                      className="px-3.5 py-2 rounded-lg bg-[#EDE3CE] border border-[#DCD3C3] text-[#5C5347] hover:border-[#B8860B] text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <LockGlyph className="w-3 h-3 text-[#B8860B]" />
                      <Printer className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'en'
                          ? 'Print Syllabus & Quiz'
                          : lang === 'zh'
                          ? '打印教学大纲与测验'
                          : 'In Đề Cương & Trắc Nghiệm'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadUltraQuizDoc}
                      className="px-3.5 py-2 rounded-lg bg-[#EDE3CE] border border-[#DCD3C3] text-[#5C5347] hover:border-[#B8860B] text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <LockGlyph className="w-3 h-3 text-[#B8860B]" />
                      <Download className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'en'
                          ? 'Download Quiz & Key (.doc)'
                          : lang === 'zh'
                          ? '下载题库与答案 (.doc)'
                          : 'Tải Bộ Câu Hỏi & Đáp Án (.doc)'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C5347]">
                <span className="font-semibold text-[#171817]">
                  {lang === 'en'
                    ? 'Locked Catalog: 6 Heritage Topics · 100 Total Questions'
                    : lang === 'zh'
                    ? '锁定目录：6 大专题 · 共 100 道题'
                    : 'Danh mục 6 Chuyên đề bị khóa (Tổng 100 câu hỏi)'}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {localizedAudienceLevels.map((lvl) => (
                    <span
                      key={lvl.id}
                      className="px-2.5 py-0.5 rounded-sm bg-[#EDE3CE] border border-[#DCD3C3] text-[11px] font-medium text-[#2C241E]"
                    >
                      {lvl.label} · {lvl.localizedDifficulty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {localizedQuizTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="rounded-xl bg-[#FAF6EE] border border-[#B8860B]/45 p-4 flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold font-mono text-[#A63A2B]">
                        <LockGlyph className="w-3.5 h-3.5 text-[#B8860B]" />
                        <span>{topic.id}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-sm bg-[#EDE3CE] border border-[#DCD3C3] text-[11px] font-semibold text-[#2C241E] tabular-nums">
                        {topic.questionCount}{' '}
                        {lang === 'en' ? 'questions' : lang === 'zh' ? '题' : 'câu'}
                      </span>
                    </div>
                    <h3 className="font-serif text-sm sm:text-[15px] font-semibold text-[#171817] leading-snug">
                      {topic.title}
                    </h3>
                    <div className="text-[11px] text-[#5C5347] border-t border-[#DCD3C3]/80 pt-2 flex items-center justify-between gap-2">
                      <span className="truncate">{topic.regionScope}</span>
                      <span className="text-[#A63A2B] font-semibold shrink-0">
                        {lang === 'en' ? 'Locked' : lang === 'zh' ? '已锁定' : 'Đã khóa'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {hasUltraQuizAccess && (
        <section id="school-edtech-repository" className="space-y-8 pt-6 border-t border-[#171817]/18">
          <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold tracking-wider uppercase border border-[#B8860B] bg-[#6E1D15] text-[#F7F2E9]">
                  ULTRA
                </span>
                <span className="text-[13px] tracking-normal text-[#A94F3D] font-semibold block">
                  {lang === 'en'
                    ? '02. Open EdTech Repository & Interactive Assessment'
                    : lang === 'zh'
                    ? '02. 开放数字教材库与互动知识测评'
                    : '02. Kho học liệu mở & đánh giá tương tác'}
                </span>
                {isTesterPro && !isAdmin && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#171817] text-[#C9A46A] border border-[#C9A46A]/45 text-[11px] font-semibold tracking-wide">
                    {lang === 'en'
                      ? 'Unlocked via Tester Mode'
                      : lang === 'zh'
                      ? '通过测试模式解锁'
                      : 'Mở khóa qua Chế độ Tester'}
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-semibold text-[#171817] tracking-tight mt-1.5">
                {lang === 'en'
                  ? 'Open EdTech Repository & Interactive Heritage Quiz'
                  : lang === 'zh'
                  ? '开放数字教材库与遗产互动测验'
                  : 'Kho Học Liệu Mở & Bài Kiểm Tra Tương Tác'}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleDownloadWorksheet('TP.HCM - Bình Dương - BRVT')}
                className="px-4 py-2.5 rounded-sm bg-[#47796D] hover:bg-[#3A655B] text-[#D8C9A9] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en'
                    ? 'Download 3-Province Worksheet'
                    : lang === 'zh'
                    ? '下载三省市 3D 学习单'
                    : 'Tải Phiếu Học Tập 3 Tỉnh'}
                </span>
              </button>
              <button
                type="button"
                onClick={handlePrintUltraQuiz}
                className="px-4 py-2.5 rounded-sm bg-[#EDE3CE] hover:bg-[#E4D7BC] text-[#171817] border border-[#171817]/25 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-[#A94F3D]" />
                <span>
                  {lang === 'en'
                    ? 'Print Syllabus & Quiz'
                    : lang === 'zh'
                    ? '打印教学大纲与测验'
                    : 'In Đề Cương & Trắc Nghiệm'}
                </span>
              </button>
              <button
                type="button"
                onClick={handleDownloadUltraQuizDoc}
                className="px-4 py-2.5 rounded-sm bg-[#6E1D15] hover:bg-[#8C281E] text-[#F7F2E9] border border-[#B8860B] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-[#F2D99B]" />
                <span>
                  {lang === 'en'
                    ? 'Download Quiz & Key (.doc)'
                    : lang === 'zh'
                    ? '下载题库与答案 (.doc)'
                    : 'Tải Câu Hỏi & Đáp Án (.doc)'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cột trái (4/12): Danh mục Tài liệu & Giáo án số hóa 3 Tỉnh */}
            <div className="lg:col-span-4 rounded-sm border border-[#171817]/20 bg-[#EDE3CE] p-6 sm:p-7 space-y-5 print:hidden">
              <div className="border-b border-[#171817]/18 pb-3.5">
                <span className="text-[13px] font-semibold text-[#A94F3D] block">
                  {lang === 'en'
                    ? '2018 General Education Curriculum'
                    : lang === 'zh'
                    ? '2018 国家普通教育课程标准'
                    : 'Chương trình Giáo dục Phổ thông 2018'}
                </span>
                <h3 className="font-serif text-xl font-semibold text-[#171817] mt-1">
                  {lang === 'en'
                    ? '3D Worksheets & Lesson Plans'
                    : lang === 'zh'
                    ? '3D 实践学习单与互动教案'
                    : 'Bộ Phiếu Học Tập & Giáo Án 3D'}
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  {
                    code: 'DOC-HCM-01',
                    title:
                      lang === 'en'
                        ? 'Module 1: Saigon – Gia Dinh Architecture & Cu Chi Tunnels (12 HCMC Sites)'
                        : lang === 'zh'
                        ? '专题 1：西贡–嘉定建筑遗产与古芝地道（胡志明市 12 处遗迹）'
                        : 'Chuyên đề 1: Kiến trúc Sài Gòn – Gia Định & Địa đạo Củ Chi (12 Di tích TP.HCM)',
                    region:
                      lang === 'en' ? 'Ho Chi Minh City' : lang === 'zh' ? '胡志明市' : 'TP. Hồ Chí Minh',
                  },
                  {
                    code: 'DOC-BD-02',
                    title:
                      lang === 'en'
                        ? 'Module 2: Southern "Đinh" Timber Houses & Ben Cat Iron Triangle Tunnels'
                        : lang === 'zh'
                        ? '专题 2：南部丁字形古宅与笨葛铁三角地道'
                        : 'Chuyên đề 2: Nhà cổ chữ Đinh Nam Bộ & Địa đạo Tam Giác Sắt Bến Cát',
                    region:
                      lang === 'en' ? 'Binh Duong Province' : lang === 'zh' ? '平阳省' : 'Tỉnh Bình Dương',
                  },
                  {
                    code: 'DOC-BRVT-03',
                    title:
                      lang === 'en'
                        ? 'Module 3: Coastal Heritage, White Palace, Long Son Big House & Long Phuoc Tunnels'
                        : lang === 'zh'
                        ? '专题 3：海洋遗产、头顿白宫、龙山大屋与龙福地道'
                        : 'Chuyên đề 3: Di sản Biển, Bạch Dinh, Nhà Lớn Long Sơn & Địa đạo Long Phước',
                    region:
                      lang === 'en'
                        ? 'Ba Ria - Vung Tau Province'
                        : lang === 'zh'
                        ? '巴地头顿省'
                        : 'Tỉnh Bà Rịa - Vũng Tàu',
                  },
                ].map((doc) => (
                  <div
                    key={doc.code}
                    className="p-4 rounded-sm bg-[#D8C9A9]/75 border border-[#171817]/18 hover:border-[#171817]/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#A94F3D] tabular-nums">
                      <span>{doc.code}</span>
                      <span>{doc.region}</span>
                    </div>
                    <div className="text-sm font-medium text-[#171817] leading-snug">
                      {doc.title}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadWorksheet(doc.region)}
                      className="pt-1 text-xs text-[#47796D] hover:text-[#3A655B] font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'en' ? 'Download Worksheet ↗' : lang === 'zh' ? '下载实践学习单 ↗' : 'Tải phiếu thực hành ↗'}
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Thống kê kết quả làm bài trắc nghiệm */}
              <div className="p-4 rounded-sm bg-[#E4D7BC] border border-[#171817]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#171817]/75">
                    {lang === 'en' ? 'Current Mode Progress:' : lang === 'zh' ? '当前测验进度：' : 'Tiến độ phần đang chọn:'}
                  </span>
                  <span className="text-xs text-[#A94F3D] font-semibold tabular-nums">
                    {answeredInViewCount} / {displayedQuizQuestions.length}{' '}
                    {lang === 'en' ? 'questions' : lang === 'zh' ? '题' : 'câu'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#171817]/70">
                  <span>
                    {lang === 'en' ? 'Full Question Bank:' : lang === 'zh' ? '总题库进度：' : 'Toàn ngân hàng 17 di tích:'}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {totalAnsweredAllCount} / {localizedQuizQuestions.length}{' '}
                    {lang === 'en' ? 'Q' : lang === 'zh' ? '题' : 'câu'}
                  </span>
                </div>
                {quizSubmitted && (
                  <div className="pt-2 border-t border-[#171817]/18 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#171817]/85">
                        {lang === 'en' ? 'Score Achieved:' : lang === 'zh' ? '最终得分：' : 'Điểm số đạt được:'}
                      </span>
                      <span className="font-serif text-2xl text-[#A94F3D] font-semibold tabular-nums">
                        {quizScore} / 100 {lang === 'en' ? 'pts' : lang === 'zh' ? '分' : 'điểm'}
                      </span>
                    </div>
                    <p className="text-xs text-[#171817]/75">
                      {lang === 'en'
                        ? `Correct ${correctInViewCount}/${displayedQuizQuestions.length} questions.`
                        : lang === 'zh'
                        ? `答对 ${correctInViewCount}/${displayedQuizQuestions.length} 题。`
                        : `Đúng ${correctInViewCount}/${displayedQuizQuestions.length} câu.`}{' '}
                      {quizScore >= 80
                        ? lang === 'en'
                          ? 'Excellent mastery of Southeast Vietnam heritage!'
                          : lang === 'zh'
                          ? '优异！您已深入掌握东南部历史与建筑精髓。'
                          : 'Xuất sắc! Nắm vững lịch sử, kiến trúc & địa chất Đông Nam Bộ.'
                        : lang === 'en'
                        ? 'Review explanations and open 3D models on the right.'
                        : lang === 'zh'
                        ? '请查看右侧解析并开启 3D 模型深入研学。'
                        : 'Xem giải thích chi tiết và mở mô hình 3D di tích ở cột phải.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Cột phải (8/12): Ngân hàng 100 Câu hỏi Trắc nghiệm Chuyên sâu (6 Chuyên đề · 3 Cấp độ) */}
            <div
              id="quiz-bank-top"
              className="lg:col-span-8 print:lg:col-span-12 rounded-sm border border-[#171817]/20 bg-[#EDE3CE] p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#171817]/18 pb-4 print:hidden">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border border-[#B8860B] bg-[#6E1D15] text-[#F7F2E9]">
                      ULTRA
                    </span>
                    <span className="text-[13px] font-semibold text-[#A94F3D]">
                      {lang === 'en'
                        ? 'Interactive Assessment · 100 Questions (6 Topics · 3 Levels · Ultra Exclusive)'
                        : lang === 'zh'
                        ? '互动知识测评 · 100 道题（6 大专题 · 3 个学段 · Ultra 专享）'
                        : 'Đánh giá kiến thức tương tác · 100 câu hỏi (6 chuyên đề · 3 cấp độ · Độc quyền Ultra)'}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#171817] tracking-tight mt-1">
                    {lang === 'en'
                      ? 'Southeast Vietnam History, Architecture & Geology Quiz'
                      : lang === 'zh'
                      ? '东南部历史、建筑与地质综合测验'
                      : 'Bài Kiểm Tra Trắc Nghiệm Lịch Sử – Kiến Trúc – Địa Chất Đông Nam Bộ'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnswers({});
                    setQuizSubmitted(false);
                    setQuizPage(1);
                  }}
                  className="px-3.5 py-1.5 rounded-sm border border-[#171817]/25 bg-[#D8C9A9]/75 hover:bg-[#E4D7BC] text-xs text-[#171817]/75 hover:text-[#171817] flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Reset All' : lang === 'zh' ? '全部重做' : 'Làm lại tất cả'}</span>
                </button>
              </div>

              {/* Hàng lọc 1: Chế độ & 6 Chuyên đề (QUIZ_TOPICS CD-01..CD-06) */}
              <div className="space-y-3 print:hidden">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5C5347]">
                  {lang === 'en'
                    ? 'Topic Filter (6 Curated Topics)'
                    : lang === 'zh'
                    ? '专题筛选（6 大专题）'
                    : 'Hàng lọc 1 · Chuyên đề (CD-01 đến CD-06)'}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartMockExam20}
                    className={`px-3.5 py-2 rounded-sm text-xs font-semibold border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                      quizFilterMode === 'mock_20'
                        ? 'bg-[#A94F3D] border-[#A94F3D] text-[#FFFDF9]'
                        : 'bg-[#E4D7BC] border-[#A94F3D]/40 text-[#A94F3D] hover:bg-[#A94F3D] hover:text-[#FFFDF9]'
                    }`}
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'en'
                        ? 'Random Mock Exam (20)'
                        : lang === 'zh'
                        ? '随机模拟测验（20题）'
                        : 'Thi thử ngẫu nhiên (20 câu)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChangeQuizFilter('all')}
                    className={`px-3.5 py-2 rounded-sm text-xs font-semibold border transition-colors cursor-pointer ${
                      quizFilterMode === 'all'
                        ? 'bg-[#171817] border-[#171817] text-[#D8C9A9]'
                        : 'bg-[#FAF6EE] border-[#171817]/20 text-[#171817] hover:border-[#171817]/45'
                    }`}
                  >
                    {lang === 'en'
                      ? 'All (100)'
                      : lang === 'zh'
                      ? '全部（100题）'
                      : 'Tất cả (100 câu)'}
                  </button>

                  {localizedQuizTopics.map((topic) => {
                    const isActive = quizFilterMode === topic.id;
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => handleChangeQuizFilter(topic.id)}
                        title={topic.title}
                        className={`px-3 py-2 rounded-sm text-xs font-semibold border transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-[#171817] border-[#171817] text-[#D8C9A9]'
                            : 'bg-[#FAF6EE] border-[#171817]/20 text-[#171817] hover:border-[#171817]/45'
                        }`}
                      >
                        <span className="font-mono text-[11px] opacity-80">{topic.id}</span>
                        <span>{topic.shortTitle}</span>
                        <span className="tabular-nums opacity-75">({topic.questionCount})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Hàng lọc 2: Cấp độ / Đối tượng */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C5347] mr-1">
                    {lang === 'en'
                      ? 'Audience Level:'
                      : lang === 'zh'
                      ? '适用学段：'
                      : 'Cấp độ:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleChangeAudienceFilter('all')}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold border transition-colors cursor-pointer ${
                      quizAudienceFilter === 'all'
                        ? 'bg-[#47796D] border-[#47796D] text-[#FFFDF9]'
                        : 'bg-[#FAF6EE] border-[#171817]/20 text-[#171817] hover:border-[#171817]/45'
                    }`}
                  >
                    {lang === 'en'
                      ? 'All Levels'
                      : lang === 'zh'
                      ? '全部学段'
                      : 'Tất cả đối tượng'}
                  </button>
                  {localizedAudienceLevels.map((lvl) => {
                    const isActive = quizAudienceFilter === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => handleChangeAudienceFilter(lvl.id)}
                        title={lvl.description}
                        className={`px-3 py-1.5 rounded-sm text-xs font-semibold border transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#47796D] border-[#47796D] text-[#FFFDF9]'
                            : 'bg-[#FAF6EE] border-[#171817]/20 text-[#171817] hover:border-[#171817]/45'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Thanh tiến độ chế độ đang làm */}
              <div className="rounded-sm bg-[#E4D7BC] border border-[#171817]/15 px-4 py-3 space-y-2 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#171817] tabular-nums">
                    {lang === 'en'
                      ? `Answered ${answeredInViewCount}/${displayedQuizQuestions.length} · Correct ${correctInViewCount}`
                      : lang === 'zh'
                      ? `已作答 ${answeredInViewCount}/${displayedQuizQuestions.length} 题 · 正确 ${correctInViewCount} 题`
                      : `Đã làm ${answeredInViewCount}/${displayedQuizQuestions.length} câu · Đúng ${correctInViewCount} câu`}
                  </span>
                  <span className="text-[#47796D] font-semibold tabular-nums">
                    {lang === 'en'
                      ? `Page ${safeQuizPage}/${totalQuizPages} · ${quizScore}%`
                      : lang === 'zh'
                      ? `第 ${safeQuizPage}/${totalQuizPages} 页 · ${quizScore} 分 (%)`
                      : `Trang ${safeQuizPage}/${totalQuizPages} · ${quizScore} điểm (%)`}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#171817]/12 overflow-hidden">
                  <div
                    className="h-full bg-[#47796D] transition-all duration-300"
                    style={{
                      width: `${
                        displayedQuizQuestions.length > 0
                          ? Math.round((answeredInViewCount / displayedQuizQuestions.length) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-5 print:hidden">
                {paginatedQuizQuestions.length === 0 ? (
                  <div className="p-6 rounded-sm bg-[#FAF6EE] border border-[#171817]/18 text-center text-xs text-[#5C5347]">
                    {lang === 'en'
                      ? 'No questions match the current topic and audience filter. Switch to "All Levels" or select another topic.'
                      : lang === 'zh'
                      ? '当前专题与学段筛选暂无匹配题目，请切换“全部学段”或其他专题。'
                      : 'Chưa có câu hỏi khớp với tổ hợp chuyên đề và đối tượng đang chọn. Vui lòng chọn "Tất cả đối tượng" hoặc chuyên đề khác.'}
                  </div>
                ) : (
                  paginatedQuizQuestions.map((q, pageIdx) => {
                    const globalIdx = (safeQuizPage - 1) * QUIZ_PAGE_SIZE + pageIdx;
                    const chosen = selectedAnswers[q.id];
                    const isAnswered = chosen !== undefined;
                    const isCorrect = chosen === q.correctIndex;
                    const difficultyBadgeCls =
                      q.difficulty === 'Vận dụng'
                        ? 'bg-[#A94F3D]/14 text-[#8E3524] border-[#A94F3D]/40'
                        : q.difficulty === 'Thông hiểu'
                        ? 'bg-[#526D8B]/14 text-[#2E4866] border-[#526D8B]/40'
                        : 'bg-[#47796D]/14 text-[#2D574C] border-[#47796D]/40';

                    return (
                      <div
                        key={q.id}
                        className="p-5 sm:p-6 rounded-sm bg-[#D8C9A9]/70 border border-[#171817]/18 space-y-3.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[12px] font-semibold text-[#A94F3D] tabular-nums">
                              {lang === 'en'
                                ? `Q${String(globalIdx + 1).padStart(2, '0')} · ${q.siteName} (${q.code})`
                                : lang === 'zh'
                                ? `第 ${String(globalIdx + 1).padStart(2, '0')} 题 · ${q.siteName} (${q.code})`
                                : `Câu ${String(globalIdx + 1).padStart(2, '0')} · ${q.siteName} (${q.code})`}
                            </span>
                            <span className="text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded-sm border border-[#171817]/20 bg-[#FAF6EE] text-[#2C241E]">
                              {q.topicId}
                            </span>
                            <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-sm border border-[#B8860B]/40 bg-[#F7F2E9] text-[#5C4410]">
                              {q.audienceLabel}
                            </span>
                            <span
                              className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-sm border ${difficultyBadgeCls}`}
                            >
                              {q.localizedDifficulty}
                            </span>
                          </div>
                          {isAnswered && (
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-sm border ${
                                isCorrect
                                  ? 'text-[#47796D] bg-[#47796D]/12 border-[#47796D]/40'
                                  : 'text-[#A94F3D] bg-[#A94F3D]/12 border-[#A94F3D]/40'
                              }`}
                            >
                              {isCorrect
                                ? lang === 'en'
                                  ? 'Correct'
                                  : lang === 'zh'
                                  ? '正确'
                                  : 'Chính xác'
                                : lang === 'en'
                                ? 'Incorrect · See explanation'
                                : lang === 'zh'
                                ? '回答有误 · 查看解析'
                                : 'Chưa đúng · Xem giải thích'}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base sm:text-lg font-medium text-[#171817] leading-snug">
                          {q.question}
                        </h4>

                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const letter = ['A', 'B', 'C', 'D'][oIdx] || String(oIdx + 1);
                            const isThisSelected = chosen === oIdx;
                            const showCorrectHighlight =
                              (quizSubmitted || isAnswered) && oIdx === q.correctIndex;
                            const showWrongHighlight =
                              isThisSelected && oIdx !== q.correctIndex;

                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => handleSelectQuizOption(q.id, oIdx)}
                                className={`w-full text-left px-4 py-3 rounded-sm border text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                                  showCorrectHighlight
                                    ? 'border-[#47796D] bg-[#47796D]/15 text-[#171817] font-semibold'
                                    : showWrongHighlight
                                    ? 'border-[#A94F3D] bg-[#A94F3D]/15 text-[#A94F3D] font-medium'
                                    : isThisSelected
                                    ? 'border-[#526D8B] bg-[#526D8B]/15 text-[#171817]'
                                    : 'border-[#171817]/18 bg-[#F4EFE4]/70 text-[#171817]/90 hover:border-[#171817]/40'
                                }`}
                              >
                                <span>
                                  <strong className="mr-2 font-semibold">{letter}.</strong>
                                  {opt}
                                </span>
                                {showCorrectHighlight && (
                                  <Check className="w-4 h-4 text-[#47796D] shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {(isAnswered || quizSubmitted) && (
                          <div className="p-4 rounded-sm bg-[#E4D7BC] border border-[#C9A46A]/80 text-xs text-[#171817]/90 leading-relaxed space-y-2.5">
                            <div>
                              <strong className="text-[#A94F3D] font-semibold block mb-1">
                                {lang === 'en'
                                  ? 'Historical & Architectural Explanation:'
                                  : lang === 'zh'
                                  ? '史学与建筑解析：'
                                  : 'Giải thích sử học & kiến trúc:'}
                              </strong>
                              {q.explanation}
                            </div>
                            <div className="text-[11px] text-[#5C5347] italic border-t border-[#171817]/10 pt-2">
                              <strong>
                                {lang === 'en'
                                  ? 'Archival Source:'
                                  : lang === 'zh'
                                  ? '文献出处：'
                                  : 'Nguồn tư liệu:'}
                              </strong>{' '}
                              {q.sourceRef}
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => onStart3DVipExperience(q.code)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-[#1C2E2A] hover:bg-[#47796D] text-[#FFFDF9] text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <Box className="w-3.5 h-3.5 text-[#C9A46A]" />
                                <span>
                                  {lang === 'en'
                                    ? 'View 3D Model of This Landmark'
                                    : lang === 'zh'
                                    ? '查看该遗迹 3D 模型'
                                    : 'Xem mô hình 3D di tích này'}
                                </span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Điều hướng phân trang 10 câu/trang */}
              {totalQuizPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
                  <button
                    type="button"
                    disabled={safeQuizPage <= 1}
                    onClick={() => handleChangeQuizPage(safeQuizPage - 1)}
                    className="px-3.5 py-2 rounded-sm border border-[#171817]/20 bg-[#FAF6EE] hover:bg-[#E4D7BC] disabled:opacity-45 disabled:cursor-not-allowed text-xs font-semibold text-[#171817] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'en' ? 'Previous' : lang === 'zh' ? '上一页' : 'Trang trước'}
                    </span>
                  </button>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {Array.from({ length: totalQuizPages }, (_, i) => i + 1).map((pageNum) => {
                      const isCurr = pageNum === safeQuizPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handleChangeQuizPage(pageNum)}
                          className={`w-8 h-8 rounded-sm text-xs font-semibold border tabular-nums transition-colors cursor-pointer ${
                            isCurr
                              ? 'bg-[#A94F3D] border-[#A94F3D] text-[#FFFDF9]'
                              : 'bg-[#FAF6EE] border-[#171817]/20 text-[#171817] hover:border-[#171817]/45'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={safeQuizPage >= totalQuizPages}
                    onClick={() => handleChangeQuizPage(safeQuizPage + 1)}
                    className="px-3.5 py-2 rounded-sm border border-[#171817]/20 bg-[#FAF6EE] hover:bg-[#E4D7BC] disabled:opacity-45 disabled:cursor-not-allowed text-xs font-semibold text-[#171817] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <span>
                      {lang === 'en' ? 'Next' : lang === 'zh' ? '下一页' : 'Trang sau'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Bản in A4 chuẩn theo chuyên đề, cấp độ và ngôn ngữ đang chọn (Chỉ render khi hasUltraQuizAccess === true) */}
              <div className="hidden print:block space-y-5 text-[#171817]">
                <div className="border-b-2 border-[#6E1D15] pb-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#A94F3D]">
                    {lang === 'en'
                      ? 'DAU AN VIET 3D · ULTRA EXCLUSIVE HERITAGE QUESTION BANK'
                      : lang === 'zh'
                      ? 'DAU AN VIET 3D · ULTRA 班级专享文化遗产测评题库'
                      : 'DẤU ẤN VIỆT 3D · NGÂN HÀNG CÂU HỎI ĐỘC QUYỀN GÓI ULTRA'}
                  </div>
                  <h3 className="font-serif text-xl font-bold mt-1">
                    {lang === 'en'
                      ? `HERITAGE SYLLABUS & MULTIPLE-CHOICE TEST (${displayedQuizQuestions.length} QUESTIONS)`
                      : lang === 'zh'
                      ? `文化遗产教学大纲与选择题测验（共 ${displayedQuizQuestions.length} 题）`
                      : `ĐỀ CƯƠNG & BÀI TRẮC NGHIỆM DI SẢN ĐÔNG NAM BỘ (${displayedQuizQuestions.length} CÂU HỎI)`}
                  </h3>
                  <p className="text-xs mt-1">
                    {lang === 'en'
                      ? `Topic: ${
                          quizFilterMode === 'all'
                            ? 'All 6 Topics'
                            : quizFilterMode === 'mock_20'
                            ? 'Random Mock Exam (20)'
                            : localizedQuizTopics.find((t) => t.id === quizFilterMode)?.title || quizFilterMode
                        } · Level: ${
                          quizAudienceFilter === 'all'
                            ? 'All Levels'
                            : localizedAudienceLevels.find((a) => a.id === quizAudienceFilter)?.label || quizAudienceFilter
                        }`
                      : lang === 'zh'
                      ? `专题：${
                          quizFilterMode === 'all'
                            ? '全部 6 大专题'
                            : quizFilterMode === 'mock_20'
                            ? '随机模拟测验（20题）'
                            : localizedQuizTopics.find((t) => t.id === quizFilterMode)?.title || quizFilterMode
                        } · 学段：${
                          quizAudienceFilter === 'all'
                            ? '全部学段'
                            : localizedAudienceLevels.find((a) => a.id === quizAudienceFilter)?.label || quizAudienceFilter
                        }`
                      : `Chuyên đề: ${
                          quizFilterMode === 'all'
                            ? 'Tất cả 6 Chuyên đề'
                            : quizFilterMode === 'mock_20'
                            ? 'Thi thử ngẫu nhiên (20 câu)'
                            : localizedQuizTopics.find((t) => t.id === quizFilterMode)?.title || quizFilterMode
                        } · Đối tượng: ${
                          quizAudienceFilter === 'all'
                            ? 'Tất cả đối tượng'
                            : localizedAudienceLevels.find((a) => a.id === quizAudienceFilter)?.label || quizAudienceFilter
                        }`}
                  </p>
                </div>

                {displayedQuizQuestions.map((q, idx) => (
                  <div
                    key={`print-q-${q.id}`}
                    className="border-b border-[#171817]/15 pb-3 space-y-1.5 text-xs break-inside-avoid"
                  >
                    <div className="font-bold text-[#A94F3D]">
                      {lang === 'en'
                        ? `Q${String(idx + 1).padStart(2, '0')} · ${q.siteName} (${q.code}) · ${q.audienceLabel} · ${q.localizedDifficulty}`
                        : lang === 'zh'
                        ? `第 ${String(idx + 1).padStart(2, '0')} 题 · ${q.siteName} (${q.code}) · ${q.audienceLabel} · ${q.localizedDifficulty}`
                        : `Câu ${String(idx + 1).padStart(2, '0')} · ${q.siteName} (${q.code}) · ${q.audienceLabel} · ${q.localizedDifficulty}`}
                    </div>
                    <div className="font-semibold text-sm">{q.question}</div>
                    <ul className="space-y-0.5 pl-2">
                      {q.options.map((opt, oIdx) => {
                        const letter = ['A', 'B', 'C', 'D'][oIdx] || String(oIdx + 1);
                        return (
                          <li key={oIdx}>
                            {letter}. {opt}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}

                {/* Bảng Đáp án & Nguồn trích dẫn ở cuối bản in */}
                <div className="pt-4 break-before-page space-y-3">
                  <h4 className="font-serif text-lg font-bold border-b-2 border-[#6E1D15] pb-1.5 text-[#6E1D15]">
                    {lang === 'en'
                      ? 'ANSWER KEY, EXPLANATIONS & ARCHIVAL SOURCES'
                      : lang === 'zh'
                      ? '参考答案、详细解析与文献出处'
                      : 'BẢNG ĐÁP ÁN, GIẢI THÍCH & NGUỒN TRÍCH DẪN'}
                  </h4>
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-[#EDE3CE]">
                        <th className="border border-[#171817]/30 px-2 py-1.5 text-center w-10">#</th>
                        <th className="border border-[#171817]/30 px-2 py-1.5 text-left w-28">
                          {lang === 'en' ? 'Code' : lang === 'zh' ? '编号' : 'Mã'}
                        </th>
                        <th className="border border-[#171817]/30 px-2 py-1.5 text-center w-12">
                          {lang === 'en' ? 'Key' : lang === 'zh' ? '答案' : 'Đáp án'}
                        </th>
                        <th className="border border-[#171817]/30 px-2 py-1.5 text-left">
                          {lang === 'en'
                            ? 'Explanation & Source'
                            : lang === 'zh'
                            ? '解析与文献'
                            : 'Giải thích & Nguồn tư liệu'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedQuizQuestions.map((q, idx) => {
                        const letter = ['A', 'B', 'C', 'D'][q.correctIndex] || 'A';
                        return (
                          <tr key={`print-ans-${q.id}`} className="break-inside-avoid">
                            <td className="border border-[#171817]/25 px-2 py-1.5 text-center font-bold">
                              {idx + 1}
                            </td>
                            <td className="border border-[#171817]/25 px-2 py-1.5">
                              <div className="font-mono font-semibold">{q.code}</div>
                              <div className="text-[10px]">{q.siteName}</div>
                            </td>
                            <td className="border border-[#171817]/25 px-2 py-1.5 text-center font-bold text-[#6E1D15]">
                              {letter}
                            </td>
                            <td className="border border-[#171817]/25 px-2 py-1.5 space-y-0.5">
                              <div className="font-semibold">
                                {letter}. {q.options[q.correctIndex]}
                              </div>
                              <div>{q.explanation}</div>
                              <div className="italic text-[10px] text-[#444]">
                                {lang === 'en' ? 'Source:' : lang === 'zh' ? '出处：' : 'Nguồn:'} {q.sourceRef}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-[#171817]/18 print:hidden">
                <div className="text-xs text-[#171817]/75">
                  {user ? (
                    lang === 'en' ? (
                      <>
                        Complete the {displayedQuizQuestions.length} questions in this mode to claim a Digital EdTech Certificate for{' '}
                        <strong className="text-[#171817]">{user.displayName}</strong>
                      </>
                    ) : lang === 'zh' ? (
                      <>
                        完成本组 {displayedQuizQuestions.length} 道测验题即可为 <strong className="text-[#171817]">{user.displayName}</strong> 领取数字教材证书
                      </>
                    ) : (
                      <>
                        Hoàn thành {displayedQuizQuestions.length} câu hỏi trong chế độ hiện tại để nhận Chứng nhận Học liệu Số cho{' '}
                        <strong className="text-[#171817]">{user.displayName}</strong>
                      </>
                    )
                  ) : lang === 'en' ? (
                    'Please sign in to save your Digital EdTech Certificate to your account'
                  ) : lang === 'zh' ? (
                    '请登录以将数字教材证书保存至您的个人账户'
                  ) : (
                    'Vui lòng đăng nhập để lưu Chứng nhận Học liệu Số vào tài khoản của bạn'
                  )}
                </div>
                {!user ? (
                  <button
                    type="button"
                    onClick={() => openAuthModal({ prompt: lang === 'en' ? 'Claim EdTech Certificate' : lang === 'zh' ? '领取数字教材证书' : 'Nhận chứng nhận Học liệu Số' })}
                    className="px-6 py-3 rounded-sm bg-[#171817] hover:bg-[#A94F3D] text-[#D8C9A9] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {lang === 'en' ? 'Sign In to Claim Certificate' : lang === 'zh' ? '登录以领取证书' : 'Đăng nhập để nhận chứng nhận'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setQuizSubmitted(true);
                      if (isClassroomSponsoredStudent && currentOrderUid) {
                        void recordStudentClassroomProgress({
                          uid: currentOrderUid,
                          email: user.email || '',
                          quizScorePercent: quizScore,
                          incrementQuizAttempt: true,
                        });
                      }
                      if (currentOrderUid) {
                        void pushUserProgressToFirestore({
                          uid: currentOrderUid,
                          userId: user.userId,
                          quizScorePercent: quizScore,
                          incrementQuizAttempt: true,
                        });
                      }
                      const certPass = recordIssuedPass({
                        code: `CERT-DNB-2026-${quizScore}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
                        kind: 'edtech_cert',
                        ownerUserId: user.userId,
                        ownerEmail: user.email || undefined,
                        ownerName: user.displayName,
                        ownerContactMasked: maskEmailForDisplay(user.email || user.displayName),
                        provider: user.provider,
                        label: `Chứng nhận Học liệu Số 3D (${displayedQuizQuestions.length} câu)`,
                        amountLabel: 'Miễn phí · EdTech',
                        score: quizScore,
                      });
                      setCertPassId(certPass.id);
                      refreshEntitlements();
                    }}
                    className="px-6 py-3 rounded-sm bg-[#A94F3D] hover:bg-[#8E3F30] text-[#D8C9A9] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" />
                    <span>
                      {lang === 'en' ? 'Grade & Claim Certificate' : lang === 'zh' ? '评分并领取证书' : 'Chấm điểm & nhận chứng nhận'}
                    </span>
                  </button>
                )}
              </div>

              {quizSubmitted && (
                <div className="mt-4 rounded-sm border border-[#C9A46A] bg-[#E4D7BC] p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#171817]/18 pb-3.5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#A94F3D]">
                          {lang === 'en'
                            ? 'Southeast Vietnam Digital EdTech Certificate'
                            : lang === 'zh'
                            ? '东南部数字教材学习认证证书'
                            : 'Chứng nhận Học liệu Số Đông Nam Bộ'}
                        </span>
                        {currentCertRecord && (
                          <span
                            className={`px-2 py-0.5 rounded-sm border text-[11px] font-medium ${
                              currentCertRecord.status === 'verified'
                                ? 'bg-[#47796D]/15 border-[#47796D]/40 text-[#47796D]'
                                : currentCertRecord.status === 'revoked'
                                ? 'bg-[#A94F3D]/15 border-[#A94F3D]/40 text-[#A94F3D]'
                                : 'bg-[#D8C9A9] border-[#171817]/20 text-[#171817]'
                            }`}
                          >
                            {currentCertRecord.status === 'verified'
                              ? lang === 'en'
                                ? 'Admin Verified'
                                : lang === 'zh'
                                ? '管理员已核验'
                                : 'Admin Đã Xác Thực'
                              : currentCertRecord.status === 'revoked'
                              ? lang === 'en'
                                ? 'Revoked'
                                : lang === 'zh'
                                ? '已吊销'
                                : 'Đã Thu Hồi'
                              : lang === 'en'
                              ? 'Active'
                              : lang === 'zh'
                              ? '有效'
                              : 'Đang Hiệu Lực'}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif text-lg sm:text-xl font-semibold text-[#171817] mt-1">
                        {lang === 'en' ? 'Awarded to: ' : lang === 'zh' ? '授予：' : 'Cấp cho: '}
                        <span className="text-[#A94F3D]">{user?.displayName || buyerName}</span>
                      </h4>
                      {user && (
                        <p className="text-[11px] text-[#171817]/70 mt-0.5 tabular-nums">
                          {user.provider === 'google' ? 'Google' : 'Facebook'}
                          {user.email ? ` · ${user.email}` : ''} ·{' '}
                          {isAdmin
                            ? lang === 'en'
                              ? 'Administrator'
                              : lang === 'zh'
                              ? '管理员'
                              : 'Quản trị viên'
                            : lang === 'en'
                            ? 'Visitor'
                            : lang === 'zh'
                            ? '访客'
                            : 'Du khách'}
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-[12px] font-medium text-[#171817]/70">
                        {lang === 'en' ? 'Assessment Score' : lang === 'zh' ? '测评成绩' : 'Kết quả đánh giá'}
                      </div>
                      <div className="font-serif text-2xl font-semibold text-[#A94F3D] tabular-nums">
                        {quizScore} / 100 {lang === 'en' ? 'pts' : lang === 'zh' ? '分' : 'điểm'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#171817]/75">
                    <span>
                      {lang === 'en' ? 'Certificate ID: ' : lang === 'zh' ? '证书编号：' : 'Mã chứng nhận: '}
                      <strong className="text-[#171817] tabular-nums">{currentCertRecord?.code || `CERT-DNB-2026-${quizScore}`}</strong> · Dấu Ấn Việt 3D
                    </span>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3.5 py-1.5 rounded-sm bg-[#171817] hover:bg-[#A94F3D] text-[#D8C9A9] text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C9A46A]" />
                      <span>{lang === 'en' ? 'Print Certificate' : lang === 'zh' ? '打印证书' : 'In chứng nhận'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* THỬ THÁCH KIẾN THỨC DI SẢN — NGÂN HÀNG CÂU HỎI CHUYÊN ĐỀ DO ADMIN XUẤT BẢN */}
          <div className="rounded-sm border border-[#171817]/20 bg-[#EDE3CE] p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#171817]/18 pb-4">
              <div>
                <span className="text-[13px] font-semibold text-[#A94F3D] block">
                  {lang === 'en'
                    ? 'Specialized EdTech Modules · Synced from Admin Studio'
                    : lang === 'zh'
                    ? '深度专题题库 · 同步自管理后台'
                    : 'Chuyên đề học liệu chuyên sâu · Đồng bộ từ Admin Studio'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#171817] tracking-tight mt-1">
                  {lang === 'en'
                    ? 'Heritage Knowledge Challenge'
                    : lang === 'zh'
                    ? '遗产知识专题挑战'
                    : 'Thử thách Kiến thức Di sản'}
                </h3>
                <p className="text-xs sm:text-sm text-[#171817]/75 mt-1">
                  {lang === 'en' ? (
                    <>Complete monument-specific quiz modules with <strong className="text-[#A94F3D]">80% or higher</strong> to earn a <strong className="text-[#171817]">Specialized Module Badge &amp; Certificate</strong>.</>
                  ) : lang === 'zh' ? (
                    <>完成各遗迹专项测验并达到 <strong className="text-[#A94F3D]">80% 及以上</strong>，即可获得 <strong className="text-[#171817]">专题徽章与完成证书</strong>。</>
                  ) : (
                    <>Hoàn thành bộ câu hỏi chuyên đề theo từng di tích đạt từ <strong className="text-[#A94F3D]">80% trở lên</strong> để nhận <strong className="text-[#171817]">Huy hiệu &amp; Chứng nhận Hoàn thành Chuyên đề</strong>.</>
                  )}
                </p>
              </div>
              <span className="px-3 py-1 rounded-sm bg-[#E4D7BC] border border-[#171817]/25 text-[12px] font-semibold text-[#171817] shrink-0 tabular-nums">
                {visiblePublishedTopics.length}{' '}
                {lang === 'en' ? 'modules open' : lang === 'zh' ? '个开放专题' : 'chuyên đề đang mở'}
              </span>
            </div>

            {visiblePublishedTopics.length === 0 ? (
              <div className="p-6 rounded-sm bg-[#D8C9A9]/75 border border-[#171817]/18 text-center space-y-2">
                <GraduationCap className="w-8 h-8 text-[#A94F3D] mx-auto" />
                <div className="text-sm font-medium text-[#171817]">
                  {lang === 'en'
                    ? 'No monument-specific quiz modules published yet'
                    : lang === 'zh'
                    ? '暂未发布按遗迹分类的专项测验题库'
                    : 'Chưa có chuyên đề trắc nghiệm riêng theo di tích nào được xuất bản'}
                </div>
                <p className="text-xs text-[#171817]/75 max-w-lg mx-auto">
                  {lang === 'en'
                    ? 'Administrators can generate 3-question modules with the Royal Historiographer in Admin Studio and publish them directly here.'
                    : lang === 'zh'
                    ? '管理员可在管理后台使用史官讲解生成 3 道深度题目并直接发布至此。'
                    : 'Quản trị viên có thể tạo bộ 3 câu hỏi chuyên sâu bằng Sử Quan Dấu Ấn trong Admin Studio và xuất bản trực tiếp tại đây.'}
                </p>
              </div>
            ) : (
              selectedTopic && (() => {
                const topicSiteObj = sites.find((s) => s.id === selectedTopic.siteId);
                const topicDisplayName = topicSiteObj
                  ? getLocalizedSite(topicSiteObj).officialName
                  : selectedTopic.siteName;
                const currentTopicAnswers = topicAnswers[selectedTopic.siteId] || {};
                const isTopicSubmitted = Boolean(topicSubmittedMap[selectedTopic.siteId]);
                const totalQs = selectedTopic.questions.length;
                const correctCount = selectedTopic.questions.filter(
                  (q) => currentTopicAnswers[q.id] === q.correctIndex
                ).length;
                const scorePct = totalQs > 0 ? Math.round((correctCount / totalQs) * 100) : 0;
                const topicCertRecord = passesSnapshot.find(
                  (p) => p.id === topicCertIds[selectedTopic.siteId]
                );

                return (
                  <div className="space-y-6">
                    {/* Selector Tabs cho các chuyên đề đã xuất bản */}
                    <div className="flex flex-wrap items-center gap-2">
                      {visiblePublishedTopics.map((topic) => {
                        const isActive = topic.siteId === selectedTopic.siteId;
                        const isTopicHidden =
                          hiddenSiteIds.includes(topic.siteId) || Boolean(topic.isHidden);
                        const sObj = sites.find((s) => s.id === topic.siteId);
                        const label = sObj ? getLocalizedSite(sObj).officialName : topic.siteName;
                        return (
                          <button
                            key={topic.siteId}
                            type="button"
                            onClick={() => setActiveTopicSiteId(topic.siteId)}
                            className={`px-3.5 py-2 rounded-sm text-xs font-medium border transition-colors cursor-pointer inline-flex items-center gap-2 ${
                              isActive
                                ? 'bg-[#171817] border-[#171817] text-[#D8C9A9] font-semibold'
                                : 'bg-[#D8C9A9] border-[#171817]/20 text-[#171817] hover:border-[#171817]/45'
                            }`}
                          >
                            <span>{label}</span>
                            <span
                              className={`text-[11px] tabular-nums ${
                                isActive ? 'text-[#C9A46A]' : 'text-[#A94F3D]'
                              }`}
                            >
                              ({topic.questions.length} {lang === 'en' ? 'Q' : lang === 'zh' ? '题' : 'câu'})
                            </span>
                            {isTopicHidden && canPreviewHidden && (
                              <span className="px-1.5 py-0.5 rounded-sm bg-[#171817] border border-[#C9A46A] text-[#C9A46A] text-[9.5px] font-semibold">
                                {lang === 'en'
                                  ? 'Tester Preview · Hidden'
                                  : lang === 'zh'
                                  ? '隐藏草稿 · 测试模式'
                                  : 'Đang ẩn · Chế độ Tester'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Danh sách câu hỏi chuyên đề */}
                    <div className="space-y-4">
                      {selectedTopic.questions.map((q, qIdx) => {
                        const chosen = currentTopicAnswers[q.id];
                        const isAnswered = chosen !== undefined;
                        const isCorrect = chosen === q.correctIndex;
                        return (
                          <div
                            key={q.id}
                            className="p-5 rounded-sm bg-[#D8C9A9]/70 border border-[#171817]/18 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[12px] font-semibold text-[#A94F3D] tabular-nums">
                                {lang === 'en'
                                  ? `Module ${topicDisplayName} · Q${qIdx + 1}/${totalQs}`
                                  : lang === 'zh'
                                  ? `专题 ${topicDisplayName} · 第 ${qIdx + 1}/${totalQs} 题`
                                  : `Chuyên đề ${topicDisplayName} · Câu ${qIdx + 1}/${totalQs}`}
                              </span>
                              {isAnswered && (
                                <span
                                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-sm border ${
                                    isCorrect
                                      ? 'text-[#47796D] bg-[#47796D]/12 border-[#47796D]/40'
                                      : 'text-[#A94F3D] bg-[#A94F3D]/12 border-[#A94F3D]/40'
                                  }`}
                                >
                                  {isCorrect
                                    ? lang === 'en'
                                      ? '✓ Correct'
                                      : lang === 'zh'
                                      ? '✓ 正确'
                                      : '✓ Chính xác'
                                    : lang === 'en'
                                    ? '✕ Incorrect'
                                    : lang === 'zh'
                                    ? '✕ 不正确'
                                    : '✕ Chưa chính xác'}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm sm:text-base font-medium text-[#171817] leading-snug">
                              {q.question}
                            </h4>

                            <div className="grid grid-cols-1 gap-2">
                              {q.options.map((opt, oIdx) => {
                                const isThisSelected = chosen === oIdx;
                                const showCorrect =
                                  (isTopicSubmitted || isAnswered) && oIdx === q.correctIndex;
                                const showWrong = isThisSelected && oIdx !== q.correctIndex;
                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() =>
                                      setTopicAnswers((prev) => ({
                                        ...prev,
                                        [selectedTopic.siteId]: {
                                          ...(prev[selectedTopic.siteId] || {}),
                                          [q.id]: oIdx,
                                        },
                                      }))
                                    }
                                    className={`w-full text-left px-4 py-2.5 rounded-sm border text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                                      showCorrect
                                        ? 'border-[#47796D] bg-[#47796D]/15 text-[#171817] font-semibold'
                                        : showWrong
                                        ? 'border-[#A94F3D] bg-[#A94F3D]/15 text-[#A94F3D] font-medium'
                                        : isThisSelected
                                        ? 'border-[#526D8B] bg-[#526D8B]/15 text-[#171817]'
                                        : 'border-[#171817]/18 bg-[#F4EFE4]/70 text-[#171817]/90 hover:border-[#171817]/40'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {showCorrect && <Check className="w-4 h-4 text-[#47796D] shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>

                            {(isAnswered || isTopicSubmitted) && q.explanation && (
                              <div className="p-3.5 rounded-sm bg-[#E4D7BC] border border-[#C9A46A]/80 text-xs text-[#171817]/90 leading-relaxed">
                                <strong className="text-[#A94F3D] font-semibold block mb-0.5">
                                  {lang === 'en' ? 'Archival Note:' : lang === 'zh' ? '文献解析：' : 'Giải thích tư liệu:'}
                                </strong>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Nút nộp bài chuyên đề */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#171817]/18">
                      <div className="text-xs text-[#171817]/75">
                        {lang === 'en' ? 'Answered ' : lang === 'zh' ? '已作答 ' : 'Đã trả lời '}
                        <strong className="text-[#A94F3D] tabular-nums">
                          {Object.keys(currentTopicAnswers).length}/{totalQs}
                        </strong>{' '}
                        {lang === 'en' ? 'in ' : lang === 'zh' ? '题 · ' : 'câu chuyên đề '}
                        <strong className="text-[#171817]">{topicDisplayName}</strong>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTopicAnswers((prev) => ({
                              ...prev,
                              [selectedTopic.siteId]: {},
                            }));
                            setTopicSubmittedMap((prev) => ({
                              ...prev,
                              [selectedTopic.siteId]: false,
                            }));
                          }}
                          className="px-3.5 py-2 rounded-sm bg-[#D8C9A9] hover:bg-[#E4D7BC] border border-[#171817]/25 text-xs text-[#171817] cursor-pointer transition-colors"
                        >
                          {lang === 'en' ? 'Reset' : lang === 'zh' ? '重做' : 'Làm lại'}
                        </button>
                        {!user ? (
                          <button
                            type="button"
                            onClick={() =>
                              openAuthModal({
                                prompt: lang === 'en' ? 'Claim Module Badge & Certificate' : lang === 'zh' ? '领取专题徽章与证书' : 'Nhận Huy hiệu & Chứng nhận Hoàn thành Chuyên đề',
                              })
                            }
                            className="px-5 py-2.5 rounded-sm bg-[#171817] hover:bg-[#A94F3D] text-[#D8C9A9] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>
                              {lang === 'en' ? 'Sign In to Grade Module' : lang === 'zh' ? '登录以评分' : 'Đăng nhập để chấm điểm chuyên đề'}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setTopicSubmittedMap((prev) => ({
                                ...prev,
                                [selectedTopic.siteId]: true,
                              }));
                              if (scorePct >= 80 && !topicCertIds[selectedTopic.siteId]) {
                                const issued = recordIssuedPass({
                                  code: `BADGE-${selectedTopic.siteId}-${scorePct}-${Math.random()
                                    .toString(36)
                                    .slice(2, 5)
                                    .toUpperCase()}`,
                                  kind: 'edtech_cert',
                                  ownerUserId: user.userId,
                                  ownerEmail: user.email || undefined,
                                  ownerName: user.displayName,
                                  ownerContactMasked: maskEmailForDisplay(
                                    user.email || user.displayName
                                  ),
                                  provider: user.provider,
                                  label: `Huy hiệu & Chứng nhận Hoàn thành Chuyên đề · ${topicDisplayName}`,
                                  routeTitle: `Chuyên đề ${topicDisplayName}`,
                                  amountLabel: 'Huy hiệu Chuyên đề · Miễn phí',
                                  score: scorePct,
                                });
                                setTopicCertIds((prev) => ({
                                  ...prev,
                                  [selectedTopic.siteId]: issued.id,
                                }));
                                refreshEntitlements();
                              }
                            }}
                            className="px-5 py-2.5 rounded-sm bg-[#A94F3D] hover:bg-[#8E3F30] text-[#D8C9A9] text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Award className="w-4 h-4" />
                            <span>
                              {lang === 'en' ? 'Grade Module' : lang === 'zh' ? '提交专题评分' : 'Chấm điểm chuyên đề'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Huy hiệu & Chứng nhận Hoàn thành Chuyên đề (>= 80%) */}
                    {isTopicSubmitted && (
                      <div
                        className={`rounded-sm border p-5 space-y-3 ${
                          scorePct >= 80
                            ? 'border-[#47796D] bg-[#E4D7BC]'
                            : 'border-[#171817]/20 bg-[#D8C9A9]/75'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span
                              className={`text-[13px] font-semibold block ${
                                scorePct >= 80 ? 'text-[#47796D]' : 'text-[#A94F3D]'
                              }`}
                            >
                              {scorePct >= 80
                                ? lang === 'en'
                                  ? '★ Module Completion Badge & Certificate'
                                  : lang === 'zh'
                                  ? '★ 专题完成徽章与认证证书'
                                  : '★ Huy hiệu & Chứng nhận Hoàn thành Chuyên đề'
                                : lang === 'en'
                                ? 'Module Result (80% required for badge)'
                                : lang === 'zh'
                                ? '专题成绩（需达到 ≥ 80% 方可获得徽章）'
                                : 'Kết quả chuyên đề (Cần đạt ≥ 80% để cấp huy hiệu)'}
                            </span>
                            <h4 className="font-serif text-lg font-semibold text-[#171817] mt-1">
                              {scorePct >= 80
                                ? lang === 'en'
                                  ? `Congratulations ${user?.displayName || 'Visitor'} on scoring ${scorePct}% (${correctCount}/${totalQs})!`
                                  : lang === 'zh'
                                  ? `恭喜 ${user?.displayName || '访客'} 获得 ${scorePct}%（${correctCount}/${totalQs} 题）！`
                                  : `Chúc mừng ${user?.displayName || 'Du khách'} đã đạt ${scorePct}% (${correctCount}/${totalQs} câu)!`
                                : lang === 'en'
                                ? `You scored ${scorePct}% (${correctCount}/${totalQs}) — Review and retry to reach ≥ 80%.`
                                : lang === 'zh'
                                ? `您的得分为 ${scorePct}%（${correctCount}/${totalQs} 题）— 请复习后重试以达到 ≥ 80%。`
                                : `Bạn đạt ${scorePct}% (${correctCount}/${totalQs} câu) — Hãy ôn tập và thử lại để đạt ≥ 80%.`}
                            </h4>
                            {topicCertRecord && (
                              <p className="text-xs text-[#171817]/75 mt-1 tabular-nums">
                                {lang === 'en' ? 'Certificate ID: ' : lang === 'zh' ? '证书编号：' : 'Mã chứng nhận: '}
                                <strong className="text-[#A94F3D]">{topicCertRecord.code}</strong>
                              </p>
                            )}
                          </div>
                          {scorePct >= 80 && (
                            <button
                              type="button"
                              onClick={() => window.print()}
                              className="px-4 py-2 rounded-sm bg-[#171817] hover:bg-[#A94F3D] text-[#D8C9A9] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>
                                {lang === 'en' ? 'Print Certificate' : lang === 'zh' ? '打印证书' : 'In chứng nhận chuyên đề'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </section>
        )}

        {/* =====================================================================
            KHU VỰC 4 — THẺ MỜI ĐÁNH GIÁ TRẢI NGHIỆM SAU THAM QUAN
           ===================================================================== */}
        <section className="rounded-sm border border-[#171817]/20 bg-[#EDE3CE] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#A94F3D]">
              <MessageSquareHeart className="w-4 h-4 shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Visitor Experience Feedback · Synced with Curatorial Board'
                  : lang === 'zh'
                  ? '访客体验评价 · 实时同步管理委员会'
                  : 'Đánh giá trải nghiệm du khách · Đồng bộ Ban Quản lý'}
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#171817] tracking-tight">
              {lang === 'en'
                ? 'Rate Your Dấu Ấn Việt 3D Museum & EdTech Experience'
                : lang === 'zh'
                ? '评价您在 Dấu Ấn Việt 3D 数字博物馆的参观与教材体验'
                : 'Đánh giá trải nghiệm tham quan & học liệu Dấu Ấn Việt 3D'}
            </h3>
            <p className="text-xs sm:text-sm text-[#171817]/80 leading-relaxed">
              {lang === 'en'
                ? 'Your feedback on 3D X-Ray models, the 1815 historical map, documentary videos, and multilingual narration is sent directly to Admin Studio to improve the digital museum.'
                : lang === 'zh'
                ? '您对 3D X光模型、1815 古地图、纪录片视频及多语种导览的任何建议都将直接同步至管理后台，助力提升数字博物馆品质。'
                : 'Mọi góp ý về mô hình 3D X-Ray, bản đồ cổ 1815, video Flycam và thuyết minh đa ngôn ngữ của bạn được ghi nhận trực tiếp về Admin Studio để nâng cao chất lượng bảo tàng số.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!user) {
                openAuthModal({
                  prompt: lang === 'en' ? 'Rate Experience' : lang === 'zh' ? '评价体验' : 'Đánh giá trải nghiệm',
                  onSuccess: () => onOpenFeedback && onOpenFeedback(),
                });
              } else if (onOpenFeedback) {
                onOpenFeedback();
              }
            }}
            className="px-6 py-3.5 rounded-sm bg-[#171817] hover:bg-[#A94F3D] text-[#D8C9A9] text-xs font-semibold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 self-start md:self-auto"
          >
            {!user ? <Lock className="w-3.5 h-3.5 shrink-0" /> : <Star className="w-4 h-4 fill-[#C9A46A] text-[#C9A46A] shrink-0" />}
            <span>
              {lang === 'en' ? 'Rate Experience' : lang === 'zh' ? '评价体验' : 'Đánh giá trải nghiệm'}
            </span>
          </button>
        </section>

        <footer className="pt-6 pb-10 md:pb-8 border-t border-[#171817]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#171817]/75">
          <span>
            © 2026 Dấu Ấn Việt 3D ·{' '}
            <span className="font-medium text-[#171817]">Made by Hoang Hai</span>
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {onOpenMediaCredits && (
              <ArchivalSourcesTrigger
                onClick={onOpenMediaCredits}
                tone="light"
                className="self-start sm:self-auto"
              />
            )}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('dau-an-viet-open-privacy'))}
              className="underline decoration-[#171817]/35 underline-offset-4 hover:text-[#A94F3D] font-medium transition-colors cursor-pointer"
            >
              {lang === 'en'
                ? 'Privacy Policy'
                : lang === 'zh'
                ? '隐私政策'
                : 'Chính sách Quyền riêng tư'}
            </button>
            <a
              href="mailto:bivsmoon2023@gmail.com"
              className="underline decoration-[#171817]/35 underline-offset-4 hover:text-[#A94F3D] font-medium transition-colors"
            >
              {lang === 'en'
                ? 'Support: bivsmoon2023@gmail.com'
                : lang === 'zh'
                ? '支持邮箱: bivsmoon2023@gmail.com'
                : 'Hỗ trợ: bivsmoon2023@gmail.com'}
            </a>
          </div>
          <span className="text-[#171817]/60">
            {lang === 'en'
              ? 'Tickets, Digital Passes & EdTech Learning Packages'
              : lang === 'zh'
              ? '参观门票、数字通行证与教育教材中心'
              : 'Trung tâm Vé tham quan & Học liệu Số'}
          </span>
        </footer>
      </div>

      {/* =====================================================================
          MODAL 1: THANH TOÁN VIETQR / MOMO GIẢ LẬP & CẤP VÉ ĐIỆN TỬ QR VIP
         ===================================================================== */}
      {isPaymentModalOpen && user && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#171817]/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsPaymentModalOpen(false)}
        >
          <div
            className="relative w-[94vw] sm:w-full max-w-2xl max-h-[85vh] overflow-y-auto heritage-scrollbar rounded-sm bg-[#D8C9A9] border border-[#171817]/25 p-5 sm:p-8 text-[#171817] space-y-6 animate-apple-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#171817]/18 pb-4">
              <div>
                <span className="text-[13px] font-semibold text-[#A94F3D] block">
                  {ticketIssued
                    ? lang === 'en'
                      ? 'Digital Heritage Passport & QR E-Ticket Issued'
                      : lang === 'zh'
                      ? '数字遗产护照与二维码电子票已签发'
                      : 'Hộ chiếu Di sản Số & Vé điện tử QR đã phát hành'
                    : lang === 'en'
                    ? 'Instant Checkout via VietQR / MoMo'
                    : lang === 'zh'
                    ? 'VietQR / MoMo 快捷支付'
                    : 'Thanh toán nhanh VietQR / Ví MoMo'}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-[#171817] mt-1">
                  {ticketIssued
                    ? lang === 'en'
                      ? 'QR E-Ticket & Digital Heritage Passport'
                      : lang === 'zh'
                      ? '二维码电子票与数字遗产护照'
                      : 'Vé Điện Tử QR & Hộ Chiếu Di Sản Số'
                    : lang === 'en'
                    ? 'VietQR / MoMo Payment Gateway'
                    : lang === 'zh'
                    ? 'VietQR / MoMo 支付网关'
                    : 'Cổng Thanh Toán VietQR / MoMo'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-sm bg-[#EDE3CE] hover:bg-[#171817] border border-[#171817]/20 text-[#171817] hover:text-[#D8C9A9] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!ticketIssued ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  {/* Khung QR thanh toán */}
                  <div className="sm:col-span-5 rounded-sm bg-[#EDE3CE] border border-[#171817]/20 p-4 flex flex-col items-center text-center space-y-3">
                    <div className="flex items-center gap-1.5 w-full bg-[#D8C9A9] border border-[#171817]/18 p-1 rounded-sm">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('vietqr')}
                        className={`flex-1 py-1.5 rounded-sm text-[10px] font-semibold transition-colors cursor-pointer ${
                          paymentMethod === 'vietqr'
                            ? 'bg-[#171817] text-[#D8C9A9]'
                            : 'text-[#171817]/70 hover:text-[#171817]'
                        }`}
                      >
                        VietQR Napas
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('momo')}
                        className={`flex-1 py-1.5 rounded-sm text-[10px] font-semibold transition-colors cursor-pointer ${
                          paymentMethod === 'momo'
                            ? 'bg-[#171817] text-[#D8C9A9]'
                            : 'text-[#171817]/70 hover:text-[#171817]'
                        }`}
                      >
                        MoMo Wallet
                      </button>
                    </div>

                    <div className="w-40 h-40 rounded-sm bg-[#F4EFE4] p-2.5 border-2 border-[#C9A46A] flex items-center justify-center overflow-hidden">
                      {checkoutQrDataUrl ? (
                        <img
                          src={checkoutQrDataUrl}
                          alt="QR Checkout"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <QrCode className="w-20 h-20 text-[#171817]" />
                      )}
                    </div>

                    <div className="text-[12px] font-semibold text-[#A94F3D]">
                      {paymentMethod === 'vietqr'
                        ? 'VietQR · Dấu Ấn Việt 3D'
                        : 'MoMo · Dấu Ấn Việt 3D'}
                    </div>
                  </div>

                  {/* Thông tin đơn hàng (Đã khóa theo tài khoản đã xác thực) */}
                  <div className="sm:col-span-7 space-y-3.5">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="block text-[12px] font-medium text-[#171817]/75">
                          {lang === 'en'
                            ? 'Pass Holder Name (Locked to account):'
                            : lang === 'zh'
                            ? '持票人姓名（已绑定账户）：'
                            : 'Họ tên chủ vé (Đã khóa theo tài khoản):'}
                        </label>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#47796D]">
                          <Lock className="w-3 h-3" />
                          <span>{lang === 'en' ? 'Verified' : lang === 'zh' ? '已认证' : 'Đã xác thực'}</span>
                        </span>
                      </div>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={user.displayName}
                        className="w-full px-3.5 py-2.5 rounded-sm bg-[#F4EFE4] border border-[#171817]/25 text-xs sm:text-sm text-[#171817] cursor-not-allowed opacity-90"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[12px] font-medium text-[#171817]/75">
                        {lang === 'en'
                          ? 'Authenticated Account:'
                          : lang === 'zh'
                          ? '认证账户：'
                          : 'Tài khoản Google / Facebook định danh:'}
                      </label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={authenticatedAccountLabel}
                        className="w-full px-3.5 py-2.5 rounded-sm bg-[#F4EFE4] border border-[#171817]/25 text-xs text-[#171817]/80 cursor-not-allowed opacity-90"
                      />
                    </div>

                    <div className="p-4 rounded-sm bg-[#EDE3CE] border border-[#171817]/20 space-y-2 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="text-[#171817]/70 shrink-0">
                          {lang === 'en' ? 'Selected Plan:' : lang === 'zh' ? '所选套餐：' : 'Gói dịch vụ:'}
                        </span>
                        <span className="font-semibold text-[#171817] text-right">
                          {b2cPlanType === 'vip_49k'
                            ? lang === 'en'
                              ? 'All-Region VIP (17 Monuments)'
                              : lang === 'zh'
                              ? '三省市全区域 VIP（17处遗迹）'
                              : 'VIP Toàn Vùng 3 Tỉnh (17 Di tích)'
                            : getLocalizedTour(selectedRouteObj).title}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#171817]/70 shrink-0">
                          {lang === 'en' ? 'Included Benefits:' : lang === 'zh' ? '包含权益：' : 'Quyền lợi đi kèm:'}
                        </span>
                        <span className="text-[#47796D] font-semibold text-right">3D X-Ray + Audio VI/EN/ZH + QR</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-[#171817]/18 text-sm">
                        <span className="text-[#171817] font-semibold">
                          {lang === 'en' ? 'Total Amount:' : lang === 'zh' ? '应付总额：' : 'Tổng thanh toán:'}
                        </span>
                        <span className="font-serif text-xl text-[#A94F3D] font-semibold tabular-nums">
                          {b2cPlanType === 'vip_49k' ? '49.000 VNĐ' : '19.000 VNĐ'}
                        </span>
                      </div>
                    </div>

                    {ticketSpamError && (
                      <div className="rounded-sm bg-[#A94F3D]/15 border border-[#A94F3D]/50 px-3.5 py-2.5 text-xs text-[#A94F3D] font-medium">
                        {ticketSpamError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setTicketSpamError(null);
                        const rate = checkAndRecordSubmissionRate(
                          'ticket',
                          authenticatedAccountLabel || user.displayName
                        );
                        if (!rate.allowed) {
                          setTicketSpamError(
                            rate.threatLevel === 2
                              ? `CẢNH BÁO AN NINH MỨC 2: Phát hiện thao tác tạo vé ồ ạt bất thường. Trợ lý AI đã kích hoạt Lá chắn Bảo vệ toàn trang & gửi email khẩn cấp về Quản trị viên (${rate.retryAfterSec} giây).`
                              : `Lá chắn AI Mức 1: Phát hiện tạo vé liên tiếp quá nhanh. AI đã tạm khóa 60 giây (${rate.retryAfterSec}s) & gửi báo cáo về Quản trị viên.`
                          );
                          return;
                        }
                        setIsPaymentModalOpen(false);
                        openPlanCheckoutModal({
                          planTier: b2cPlanType === 'vip_49k' ? 'pro' : 'plus',
                          packageId:
                            b2cPlanType === 'vip_49k' ? 'self_guided_59k' : 'student_25k',
                          routeId: b2cPlanType === 'route_19k' ? selectedRouteObj.id : undefined,
                          plusScopeType: 'route',
                        });
                      }}
                      className="w-full py-3.5 px-5 rounded-sm bg-[#A94F3D] hover:bg-[#8E3F30] text-[#D8C9A9] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {lang === 'en'
                          ? 'Continue to VietQR Payment & Verification'
                          : lang === 'zh'
                          ? '前往 VietQR 扫码支付与核验'
                          : 'Tiếp tục tạo mã VietQR & Xác thực chuyển khoản'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TẤM VÉ ĐIỆN TỬ QR ĐỊNH DANH RIÊNG */
              <div className="space-y-6">
                <div className="rounded-sm border border-[#C9A46A] bg-[#EDE3CE] p-6 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#171817]/18 pb-4">
                    <div className="min-w-0">
                      <span
                        className={`px-3 py-1 rounded-sm border text-[11px] font-semibold ${
                          currentTicketRecord?.status === 'revoked'
                            ? 'bg-[#A94F3D]/15 border-[#A94F3D]/40 text-[#A94F3D]'
                            : currentTicketRecord?.status === 'verified'
                            ? 'bg-[#47796D]/15 border-[#47796D]/40 text-[#47796D]'
                            : 'bg-[#C9A46A]/25 border-[#C9A46A] text-[#171817]'
                        }`}
                      >
                        {currentTicketRecord?.status === 'revoked'
                          ? lang === 'en'
                            ? '✕ Ticket Revoked by Administrator'
                            : lang === 'zh'
                            ? '✕ 门票已被管理员吊销'
                            : '✕ Vé đã bị Quản trị viên thu hồi'
                          : currentTicketRecord?.status === 'verified'
                          ? lang === 'en'
                            ? '✓ VIP Pass · Admin Verified'
                            : lang === 'zh'
                            ? '✓ VIP 通行证 · 管理员已核验'
                            : '✓ Vé VIP · Admin đã xác thực'
                          : lang === 'en'
                          ? 'Digital Heritage Pass · Synced with Admin Studio'
                          : lang === 'zh'
                          ? '数字遗产通行证 · 已同步至管理后台'
                          : 'Vé Di sản Số · Đã đồng bộ Admin Studio'}
                      </span>
                      <h4 className="font-serif text-xl sm:text-2xl font-semibold text-[#171817] mt-2">
                        {currentTicketRecord?.routeTitle ||
                          (b2cPlanType === 'vip_49k'
                            ? lang === 'en'
                              ? 'All-Region Southeast Vietnam VIP Pass (HCMC – Binh Duong – BRVT)'
                              : lang === 'zh'
                              ? '东南部三省市全区域 VIP 通行证'
                              : 'Vé VIP Toàn Vùng Đông Nam Bộ (TP.HCM – Bình Dương – BRVT)'
                            : lang === 'en'
                            ? '3D Heritage Route & Audio Guide Pass'
                            : lang === 'zh'
                            ? '3D 遗产路线与语音导览门票'
                            : 'Vé Trải Nghiệm Tuyến Di Sản 3D & Thuyết Minh')}
                      </h4>
                      <p className="text-xs text-[#171817]/75 mt-1">
                        {lang === 'en' ? 'Holder: ' : lang === 'zh' ? '持票人：' : 'Chủ vé: '}
                        <strong className="text-[#171817]">{currentTicketRecord?.ownerName || user.displayName}</strong> ·{' '}
                        <span>{authenticatedAccountLabel}</span>
                      </p>
                    </div>

                    <div className="w-28 h-28 rounded-sm bg-[#F4EFE4] p-2 border-2 border-[#C9A46A] shrink-0 flex items-center justify-center overflow-hidden">
                      {issuedTicketQrDataUrl ? (
                        <img
                          src={issuedTicketQrDataUrl}
                          alt={`QR ${currentTicketRecord?.code || ''}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <QrCode className="w-16 h-16 text-[#171817]" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-[#171817]/18 text-xs">
                    <div>
                      <span className="block text-[12px] font-medium text-[#171817]/70">
                        {lang === 'en' ? 'Personal QR Code' : lang === 'zh' ? '专属二维码编号' : 'Mã vé QR định danh'}
                      </span>
                      <span className="text-sm text-[#A94F3D] font-bold mt-0.5 block tabular-nums">
                        {currentTicketRecord?.code || 'VIP-3D-SYNCED'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[12px] font-medium text-[#171817]/70">
                        {lang === 'en' ? 'X-Ray Anatomy' : lang === 'zh' ? 'X光解剖模式' : 'Giải phẫu X-Ray'}
                      </span>
                      <span className="text-[#171817] font-semibold mt-0.5 block">
                        {lang === 'en' ? '100% Unlocked' : lang === 'zh' ? '100% 已解锁' : 'Mở khóa 100%'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[12px] font-medium text-[#171817]/70">
                        {lang === 'en' ? 'Audio Guide' : lang === 'zh' ? '多语种导览' : 'Thuyết minh đa ngữ'}
                      </span>
                      <span className="text-[#171817] font-semibold mt-0.5 block">
                        {lang === 'en' ? 'VI / EN / ZH Unlimited' : lang === 'zh' ? '越 / 英 / 中 无限制' : 'VI / EN / ZH Không giới hạn'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[12px] font-medium text-[#171817]/70">
                        {lang === 'en' ? 'Account Sync' : lang === 'zh' ? '账户同步' : 'Đồng bộ tài khoản'}
                      </span>
                      <span className="text-[#47796D] font-semibold mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{lang === 'en' ? 'Saved to Profile' : lang === 'zh' ? '已存入档案' : 'Đã lưu hồ sơ'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[#171817]/75">
                      {lang === 'en' ? 'Digital Passport holds ' : lang === 'zh' ? '数字护照已收集 ' : 'Hộ chiếu số hiện có '}
                      <strong className="text-[#A94F3D] tabular-nums">
                        {unlockedStampCount}/{sites.length}
                      </strong>{' '}
                      {lang === 'en'
                        ? '3D Architectural Stamps.'
                        : lang === 'zh'
                        ? '枚 3D 建筑印章。'
                        : 'dấu mộc Giải mã Kiến trúc 3D Đông Nam Bộ.'}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {onOpenMyJourney && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsPaymentModalOpen(false);
                            onOpenMyJourney();
                          }}
                          className="px-4 py-2.5 rounded-sm bg-[#D8C9A9] hover:bg-[#E4D7BC] border border-[#171817]/25 text-[#171817] text-xs font-semibold cursor-pointer transition-colors"
                        >
                          {lang === 'en' ? 'My Account & Tickets' : lang === 'zh' ? '我的账户与门票' : 'Tài khoản & Vé của tôi'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsPaymentModalOpen(false);
                          onStart3DVipExperience(
                            selectedRouteObj.sites[0] || 'HCM-DT-009',
                            selectedRouteObj.id
                          );
                        }}
                        className="px-5 py-2.5 rounded-sm bg-[#47796D] hover:bg-[#3A655B] text-[#D8C9A9] text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors"
                      >
                        <span>
                          {lang === 'en'
                            ? 'Enter 3D Space with QR Pass'
                            : lang === 'zh'
                            ? '持二维码门票进入 3D 空间'
                            : 'Vào Không gian 3D với Vé QR'}
                        </span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: ĐĂNG KÝ DÙNG THỬ HỌC LIỆU SỐ TRƯỜNG HỌC (B2B EDTECH FORM)
         ===================================================================== */}
      {isB2BModalOpen && user && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#171817]/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsB2BModalOpen(false)}
        >
          <div
            className="relative w-[94vw] sm:w-full max-w-xl max-h-[85vh] overflow-y-auto heritage-scrollbar rounded-sm bg-[#D8C9A9] border border-[#171817]/25 p-5 sm:p-8 text-[#171817] space-y-6 animate-apple-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#171817]/18 pb-4">
              <div>
                <span className="text-[13px] font-semibold text-[#526D8B] block">
                  {lang === 'en'
                    ? 'Institutional License · 5,000,000 VND / Year'
                    : lang === 'zh'
                    ? '学校机构授权 · 5,000,000 越盾 / 学年'
                    : 'Bản quyền Trường học · 5.000.000 VNĐ / Năm'}
                </span>
                <h3 className="font-serif text-2xl font-semibold tracking-tight text-[#171817] mt-1">
                  {lang === 'en'
                    ? 'Register 3D Digital EdTech License for Schools'
                    : lang === 'zh'
                    ? '申请学校 3D 数字教材版权授权'
                    : 'Đăng Ký Bản Quyền Học Liệu Số 3D Cho Trường Học'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsB2BModalOpen(false)}
                className="w-8 h-8 rounded-sm bg-[#EDE3CE] hover:bg-[#171817] border border-[#171817]/20 text-[#171817] hover:text-[#D8C9A9] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!b2bSubmitted ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium text-[#171817]/75">
                    {lang === 'en'
                      ? 'Secondary / High School / Institution Name:'
                      : lang === 'zh'
                      ? '中学 / 教育机构名称：'
                      : 'Tên Trường THCS / THPT / Đơn vị giáo dục:'}
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#F4EFE4] border border-[#171817]/25 text-xs sm:text-sm text-[#171817] focus:outline-none focus:border-[#526D8B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium text-[#171817]/75">
                    {lang === 'en'
                      ? 'Department of Education / Province:'
                      : lang === 'zh'
                      ? '教育厅 / 所在省市：'
                      : 'Sở Giáo dục & Đào tạo / Tỉnh thành:'}
                  </label>
                  <input
                    type="text"
                    value={schoolProvince}
                    onChange={(e) => setSchoolProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#F4EFE4] border border-[#171817]/25 text-xs sm:text-sm text-[#171817] focus:outline-none focus:border-[#526D8B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12px] font-medium text-[#171817]/75">
                    {lang === 'en'
                      ? 'Principal / History Department Email or Phone:'
                      : lang === 'zh'
                      ? '校领导或历史教研组联系邮箱 / 电话：'
                      : 'Email / Số điện thoại Ban Giám hiệu hoặc Tổ trưởng Tổ Lịch sử:'}
                  </label>
                  <input
                    type="text"
                    value={teacherContact}
                    onChange={(e) => setTeacherContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#F4EFE4] border border-[#171817]/25 text-xs sm:text-sm text-[#171817] focus:outline-none focus:border-[#526D8B]"
                  />
                </div>

                {ticketSpamError && (
                  <div className="rounded-sm bg-[#A94F3D]/15 border border-[#A94F3D]/50 px-3.5 py-2.5 text-xs text-[#A94F3D] font-medium">
                    {ticketSpamError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setTicketSpamError(null);
                    const rate = checkAndRecordSubmissionRate(
                      'ticket',
                      authenticatedAccountLabel || user.displayName
                    );
                    if (!rate.allowed) {
                      setTicketSpamError(
                        rate.threatLevel === 2
                          ? `CẢNH BÁO AN NINH MỨC 2: Phát hiện đăng ký ồ ạt bất thường. Trợ lý AI đã kích hoạt Lá chắn Bảo vệ & gửi email khẩn cấp về Quản trị viên (${rate.retryAfterSec} giây).`
                          : `Lá chắn AI Mức 1: Phát hiện gửi liên tiếp quá nhanh. AI đã tạm khóa 60 giây (${rate.retryAfterSec}s) & gửi báo cáo về Quản trị viên.`
                      );
                      return;
                    }
                    setIsB2BModalOpen(false);
                    openPlanCheckoutModal({
                      planTier: 'school',
                      packageId: 'classroom_500k',
                      schoolName,
                      schoolProvince,
                    });
                  }}
                  className="w-full py-3.5 px-5 rounded-sm bg-[#526D8B] hover:bg-[#435B76] text-[#D8C9A9] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>
                    {lang === 'en'
                      ? 'Continue to VietQR Payment (500,000 VND)'
                      : lang === 'zh'
                      ? '前往 VietQR 扫码支付（500,000 越盾）'
                      : 'Tạo mã VietQR thanh toán Gói Lớp học (500.000đ)'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-sm bg-[#EDE3CE] border border-[#47796D] space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-7 h-7 text-[#47796D] shrink-0" />
                  <div>
                    <div className="text-[13px] font-semibold text-[#47796D]">
                      {lang === 'en'
                        ? 'School EdTech License Issued'
                        : lang === 'zh'
                        ? '已签发学校数字教材授权码'
                        : 'Đã cấp mã bản quyền học liệu trường học'}
                    </div>
                    <h4 className="font-serif text-xl font-semibold text-[#171817]">{schoolName}</h4>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#171817]/85 leading-relaxed">
                  {lang === 'en' ? (
                    <>3D History Lab Activation Code: <strong className="text-[#A94F3D] tabular-nums">EDTECH-B2B-2026</strong>. All teachers and students can now access the 3D X-Ray Diorama, download 2018 Curriculum Lesson Plans, and take interactive quizzes.</>
                  ) : lang === 'zh' ? (
                    <>3D 历史实验室激活码：<strong className="text-[#A94F3D] tabular-nums">EDTECH-B2B-2026</strong>。全校师生现可使用 3D X光沙盘、下载配套教案并参与互动测验。</>
                  ) : (
                    <>Mã kích hoạt phòng Lab Lịch sử 3D: <strong className="text-[#A94F3D] tabular-nums">EDTECH-B2B-2026</strong>. Toàn bộ giáo viên và học sinh của trường đã có thể sử dụng Sa bàn 3D X-Ray, tải Giáo án GDPT 2018 và làm bài kiểm tra tương tác.</>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsB2BModalOpen(false);
                      onStart3DVipExperience('HCM-DT-001', 'TOUR-INTER-02');
                    }}
                    className="px-5 py-2.5 rounded-sm bg-[#47796D] hover:bg-[#3A655B] text-[#D8C9A9] text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {lang === 'en'
                      ? 'Open 3D Lab for Classroom ↗'
                      : lang === 'zh'
                      ? '开启课堂 3D 沙盘 ↗'
                      : 'Mở Sa bàn 3D cho lớp học ↗'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadWorksheet(schoolName)}
                    className="px-4 py-2.5 rounded-sm bg-[#171817] hover:bg-[#A94F3D] text-[#D8C9A9] text-xs font-semibold cursor-pointer transition-colors"
                  >
                    {lang === 'en'
                      ? 'Download 3D Lesson Plans'
                      : lang === 'zh'
                      ? '下载 3D 教案包'
                      : 'Tải Bộ Giáo Án 3D'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
