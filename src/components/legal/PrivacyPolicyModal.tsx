import React, { useEffect } from 'react';
import { X, ShieldCheck, Lock, Database, Trash2, Mail } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useI18n();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEn = lang === 'en';
  const isZh = lang === 'zh';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-[1350] bg-[#171817]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[95vw] sm:w-full max-w-2xl max-h-[88vh] flex flex-col rounded-xl bg-[#F4EFE4] border border-[#C9A46A]/65 shadow-2xl overflow-hidden text-[#2C241E] animate-apple-sheet"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#171817] text-[#D8C9A9] border-b border-[#C9A46A]/35 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#C9A46A]/15 border border-[#C9A46A]/55 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#C9A46A]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#C9A46A] block">
                Dấu Ấn Việt 3D ·{' '}
                {isEn
                  ? 'Privacy & Data Governance'
                  : isZh
                  ? '隐私保护与数据规范'
                  : 'Bảo mật & Dữ liệu Người dùng'}
              </span>
              <h2
                id="privacy-policy-modal-title"
                className="font-serif text-base sm:text-lg font-semibold text-[#F4EFE4] truncate"
              >
                {isEn
                  ? 'Privacy Policy & Data Deletion Guide'
                  : isZh
                  ? '隐私政策与用户数据删除指南'
                  : 'Chính sách Quyền riêng tư & Xóa dữ liệu'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? 'Close' : isZh ? '关闭' : 'Đóng'}
            className="w-8 h-8 rounded-full bg-[#D8C9A9]/10 hover:bg-[#A63A2B] text-[#D8C9A9] hover:text-[#F4EFE4] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto heritage-scrollbar p-5 sm:p-6 space-y-5 text-xs sm:text-[13px] leading-relaxed text-[#2C241E]/90">
          <div className="rounded-lg bg-[#EDE3CE] border border-[#DCD3C3] p-4 space-y-1.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A63A2B]">
              {isEn
                ? 'Last Updated · November 2026'
                : isZh
                ? '最后更新 · 2026 年 11 月'
                : 'Cập nhật gần nhất · Tháng 11/2026'}
            </div>
            <p>
              {isEn
                ? 'Dấu Ấn Việt 3D (Digital Museum of Southeastern Vietnam Heritage) respects your privacy. This policy explains what information is collected when you sign in with Google or Facebook via Firebase Authentication and how your learning progress and digital passes are protected.'
                : isZh
                ? 'Dấu Ấn Việt 3D（越南东南部数字遗产博物馆）高度重视您的隐私。本政策说明当您通过 Firebase Authentication 使用 Google 或 Facebook 登录时，我们收集的信息范围及您的学习进度与电子门票保护机制。'
                : 'Nền tảng Bảo tàng số Dấu Ấn Việt 3D tôn trọng tuyệt đối quyền riêng tư của khách tham quan, giáo viên và học sinh. Tài liệu này nêu rõ phạm vi dữ liệu được thu thập khi bạn đăng nhập bằng Google hoặc Facebook qua Firebase Authentication và cách dữ liệu được bảo vệ.'}
            </p>
          </div>

          <section className="space-y-2">
            <div className="flex items-center gap-2 font-serif text-sm sm:text-base font-semibold text-[#171817]">
              <Database className="w-4 h-4 text-[#A63A2B] shrink-0" />
              <h3>
                {isEn
                  ? '1. Information Collected via Google & Facebook Login'
                  : isZh
                  ? '1. 通过 Google 与 Facebook 登录收集的信息'
                  : '1. Dữ liệu thu thập khi đăng nhập Google & Facebook'}
              </h3>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-[#2C241E]/85">
              <li>
                {isEn
                  ? 'Public profile identifier (Firebase UID), display name, and optional profile avatar URL.'
                  : isZh
                  ? '公开账户标识符（Firebase UID）、显示名称及可选头像链接。'
                  : 'Mã định danh duy nhất (Firebase UID), tên hiển thị (Display Name) và ảnh đại diện công khai (nếu có).'}
              </li>
              <li>
                {isEn
                  ? 'Email address (only if provided by your Google or Facebook account; accounts registered via Facebook phone number without email remain fully supported using UID).'
                  : isZh
                  ? '电子邮箱地址（仅在您的 Google 或 Facebook 账户提供时读取；通过手机号注册且未公开邮箱的 Facebook 账户仍可通过 UID 正常使用全部核心功能）。'
                  : 'Địa chỉ email (chỉ đọc khi tài khoản Google hoặc Facebook cung cấp; tài khoản Facebook đăng ký bằng số điện thoại không có email vẫn hoạt động đầy đủ qua UID).'}
              </li>
              <li>
                {isEn
                  ? 'In-museum educational records: 0/17 explored heritage sites, Digital Heritage Passport stamps, quiz attempts, certificates, and QR pass orders linked strictly to your UID.'
                  : isZh
                  ? '馆内学习记录：0/17 遗迹探索进度、数字遗产护照印章、测验成绩、电子证书及与您 UID 严格绑定的门票订单。'
                  : 'Tiến độ tham quan 0/17 di tích, dấu mộc Hộ chiếu Di sản Số, điểm trắc nghiệm, chứng nhận và đơn vé QR được cách ly tuyệt đối theo UID.'}
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2 font-serif text-sm sm:text-base font-semibold text-[#171817]">
              <Lock className="w-4 h-4 text-[#3A665B] shrink-0" />
              <h3>
                {isEn
                  ? '2. How Your Data Is Used & Protected'
                  : isZh
                  ? '2. 数据用途与安全保障'
                  : '2. Mục đích sử dụng & Bảo mật dữ liệu'}
              </h3>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-[#2C241E]/85">
              <li>
                {isEn
                  ? 'Data is stored on Google Cloud Firestore and Firebase Realtime Database strictly to synchronize your tickets, classroom Ultra memberships, and study progress across devices.'
                  : isZh
                  ? '数据仅存储于 Google Cloud Firestore 与 Firebase Realtime Database，用于跨设备同步门票、Ultra 班级成员资格与学习进度。'
                  : 'Dữ liệu chỉ được lưu trên Cloud Firestore và Firebase Realtime Database nhằm đồng bộ vé tham quan, lớp học Ultra và tiến độ học tập giữa máy tính và điện thoại.'}
              </li>
              <li>
                {isEn
                  ? 'We NEVER sell personal data, show third-party behavioral ads, or post anything to your Facebook timeline.'
                  : isZh
                  ? '我们绝不出售您的个人数据、不投放第三方追踪广告，也不会向您的 Facebook 动态发布任何内容。'
                  : 'Dấu Ấn Việt 3D tuyệt đối KHÔNG bán dữ liệu, KHÔNG chạy quảng cáo theo dõi và KHÔNG tự ý đăng bài lên trang cá nhân Facebook của bạn.'}
              </li>
              <li>
                {isEn
                  ? 'Firestore Security Rules enforce strict per-UID isolation so each visitor can only access their own account profile, personal orders, and classroom grants.'
                  : isZh
                  ? 'Firestore 安全规则强制执行基于 UID 的严格隔离，确保每位访客仅能访问本人资料、订单与班级授权。'
                  : 'Hệ thống Firestore Security Rules kiểm soát truy cập theo từng UID, bảo vệ các quyền nâng cao và cách ly hoàn toàn dữ liệu giữa các tài khoản.'}
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2 font-serif text-sm sm:text-base font-semibold text-[#171817]">
              <Trash2 className="w-4 h-4 text-[#A63A2B] shrink-0" />
              <h3>
                {isEn
                  ? '3. How to Delete Your Data or Revoke Facebook Access'
                  : isZh
                  ? '3. 如何删除个人数据或取消 Facebook 授权'
                  : '3. Hướng dẫn xóa dữ liệu & Hủy liên kết Facebook'}
              </h3>
            </div>
            <div className="rounded-lg bg-[#FAF6EE] border border-[#DCD3C3] p-4 space-y-2 text-[#2C241E]/85">
              <p>
                {isEn
                  ? 'You can revoke Facebook login permission at any time from your Facebook Account: Settings & Privacy -> Settings -> Apps and Websites -> Select "Dấu Ấn Việt 3D" -> Remove.'
                  : isZh
                  ? '您可随时在 Facebook 账户中撤回授权：设置与隐私 -> 设置 -> 应用和网站 -> 选择“Dấu Ấn Việt 3D” -> 移除。'
                  : 'Bạn có thể hủy quyền truy cập bất kỳ lúc nào trực tiếp trên Facebook: Cài đặt & Quyền riêng tư -> Cài đặt -> Ứng dụng và trang web -> Chọn "Dấu Ấn Việt 3D" -> Gỡ bỏ.'}
              </p>
              <p className="flex items-start gap-2 pt-1 border-t border-[#DCD3C3]/75">
                <Mail className="w-3.5 h-3.5 text-[#A63A2B] shrink-0 mt-0.5" />
                <span>
                  {isEn ? (
                    <>
                      To request permanent deletion of your Firebase profile, payment history, or
                      certificates from our database, contact the Curatorial Administrator via the
                      Support Desk or email:{' '}
                      <a
                        href="mailto:bivsmoon2023@gmail.com"
                        className="font-semibold text-[#A63A2B] underline decoration-[#A63A2B]/60 underline-offset-2 hover:text-[#171817] transition-colors"
                      >
                        bivsmoon2023@gmail.com
                      </a>
                      .
                    </>
                  ) : isZh ? (
                    <>
                      如需从数据库中永久删除您的 Firebase 个人资料、购票记录或证书，请通过馆内客服中心或发送邮件至{' '}
                      <a
                        href="mailto:bivsmoon2023@gmail.com"
                        className="font-semibold text-[#A63A2B] underline decoration-[#A63A2B]/60 underline-offset-2 hover:text-[#171817] transition-colors"
                      >
                        bivsmoon2023@gmail.com
                      </a>{' '}
                      联系项目管理员。
                    </>
                  ) : (
                    <>
                      Để yêu cầu xóa vĩnh viễn toàn bộ hồ sơ Firebase, lịch sử đơn hàng và chứng
                      nhận khỏi cơ sở dữ liệu, vui lòng liên hệ Quản trị viên qua mục Hỗ trợ hoặc
                      email:{' '}
                      <a
                        href="mailto:bivsmoon2023@gmail.com"
                        className="font-semibold text-[#A63A2B] underline decoration-[#A63A2B]/60 underline-offset-2 hover:text-[#171817] transition-colors"
                      >
                        bivsmoon2023@gmail.com
                      </a>
                      .
                    </>
                  )}
                </span>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#DCD3C3] bg-[#EDE3CE] flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-[#5C5347]">
            © 2026 Dấu Ấn Việt 3D · Le Quy Don Gifted High School Heritage Project
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#171817] hover:bg-[#A63A2B] text-[#F4EFE4] text-xs font-semibold transition-colors cursor-pointer"
          >
            {isEn ? 'Close' : isZh ? '关闭' : 'Đã hiểu & Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
};
