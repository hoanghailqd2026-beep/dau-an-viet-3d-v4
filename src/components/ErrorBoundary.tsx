import React from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  variant?: 'app' | 'spatial3d';
  lang?: 'vi' | 'en' | 'zh';
  onReset?: () => void;
  onReturnHome?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

const ERROR_COPY = {
  vi: {
    kickerApp: 'BẢO VỆ PHIÊN TRUY CẬP',
    kicker3d: 'KHÔNG GIAN TRIỂN LÃM 3D',
    titleApp: 'Trạng thái hiển thị đã được bảo toàn',
    title3d: 'Không gian 3D tạm thời gián đoạn',
    descApp:
      'Một thành phần giao diện vừa gặp sự cố ngoài dự kiến. Hệ thống đã ngăn trắng trang và bảo toàn dữ liệu phiên tham quan của bạn.',
    desc3d:
      'Trình duyệt hiện tại hoặc kết nối mạng vừa làm gián đoạn quá trình dựng mô hình 3D WebGL. Bạn có thể tải lại khung 3D mà không ảnh hưởng đến các phần khác của bảo tàng.',
    retryBtn: 'Thử tải lại',
    homeBtn: 'Về trang Khám phá',
  },
  en: {
    kickerApp: 'SESSION SAFEGUARD',
    kicker3d: '3D EXHIBITION VIEWPORT',
    titleApp: 'Display session safely preserved',
    title3d: '3D viewport temporarily interrupted',
    descApp:
      'An unexpected interface issue occurred. Our safeguard prevented a blank screen and preserved your museum session.',
    desc3d:
      'Your browser WebGL context or network connection interrupted 3D rendering. Reload the 3D frame below without affecting the rest of the site.',
    retryBtn: 'Thử tải lại',
    homeBtn: 'Return to Explore',
  },
  zh: {
    kickerApp: '访问状态保护',
    kicker3d: '3D 展厅视窗',
    titleApp: '当前浏览会话已安全保护',
    title3d: '3D 视图暂时中断',
    descApp:
      '界面组件发生意外异常，系统已防止白屏并完整保留您的浏览状态。',
    desc3d:
      '当前浏览器的 WebGL 图形渲染或网络连接出现短暂中断。请点击下方按钮重新加载 3D 视窗，网站其余功能不受影响。',
    retryBtn: 'Thử tải lại',
    homeBtn: '返回探索首页',
  },
} as const;

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected rendering error',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn('[ErrorBoundary] Caught rendering error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onReset) {
      this.props.onReset();
    } else if (this.props.variant === 'app') {
      window.location.reload();
    }
  };

  private handleReturnHome = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onReturnHome) {
      this.props.onReturnHome();
    }
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const lang = this.props.lang || 'vi';
    const t = ERROR_COPY[lang] || ERROR_COPY.vi;
    const is3D = this.props.variant === 'spatial3d';

    return (
      <div
        className={`w-full flex items-center justify-center p-5 sm:p-8 ${
          is3D ? 'min-h-[480px] h-full bg-[#EFE8DA]' : 'min-h-screen bg-[#EFE8DA]'
        } text-[#2C241E]`}
      >
        <div
          role="alert"
          className="w-full max-w-lg rounded-2xl bg-[#F7F2E9] border border-[#DCD3C3] p-6 sm:p-8 shadow-[0_18px_48px_rgba(44,36,30,0.08)]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#DCD3C3] bg-[#EFE8DA] text-[#8F3D2E]">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>

            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8F3D2E]">
              {is3D ? t.kicker3d : t.kickerApp}
            </span>

            <h2 className="mt-2 font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#2C241E]">
              {is3D ? t.title3d : t.titleApp}
            </h2>

            <div className="my-4 w-16 border-t border-[#DCD3C3]" />

            <p className="text-sm leading-relaxed text-[#5C4E42] max-w-md">
              {is3D ? t.desc3d : t.descApp}
            </p>

            {this.state.errorMessage && (
              <div className="mt-4 w-full rounded-lg border border-[#DCD3C3] bg-[#EFE8DA]/75 px-3.5 py-2 font-mono text-[11px] text-[#6B5E52] line-clamp-2 tabular-nums">
                {this.state.errorMessage}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 rounded-full bg-[#2C241E] hover:bg-[#8F3D2E] px-5 py-2.5 text-xs font-semibold text-[#F7F2E9] transition-colors cursor-pointer active:scale-[0.98]"
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{t.retryBtn}</span>
              </button>

              {this.props.onReturnHome && (
                <button
                  type="button"
                  onClick={this.handleReturnHome}
                  className="inline-flex items-center gap-2 rounded-full border border-[#DCD3C3] bg-[#EFE8DA] hover:bg-[#E6DEC9] px-4 py-2.5 text-xs font-medium text-[#2C241E] transition-colors cursor-pointer"
                >
                  <Home className="h-3.5 w-3.5 text-[#8F3D2E] shrink-0" aria-hidden="true" />
                  <span>{t.homeBtn}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
