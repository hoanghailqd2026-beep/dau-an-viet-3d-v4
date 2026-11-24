import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import { useMediaCredits } from '../../utils/mediaCreditsStore';

export interface ArchivalSourcesTriggerProps {
  onClick: () => void;
  /** 'light' for warm heritage paper surfaces, 'dark' for dark glass / map / 3D / dark drawers */
  tone?: 'light' | 'dark';
  /** Optional explicit count override (defaults to live archival registry count) */
  count?: number;
  /** Optional full-width row layout for mobile slide-over menus */
  fullWidth?: boolean;
  /** Optional elevated backdrop when floating above canvas/page content */
  floating?: boolean;
  className?: string;
}

/**
 * Editorial Archival Museum Trigger ("Nguồn tư liệu 64" / "Archival Sources 64" / "文献与版权来源 64").
 * Crafted ivory archival paper pill with fine cinnabar stroke book icon, high-contrast cinnabar
 * index counter pill, and smooth diagonal arrow micro-motion on hover.
 * Shows a compact museum padlock when the visitor is not signed in.
 */
export const ArchivalSourcesTrigger: React.FC<ArchivalSourcesTriggerProps> = ({
  onClick,
  tone = 'light',
  count,
  fullWidth = false,
  floating = false,
  className = '',
}) => {
  const { lang } = useI18n();
  const { isAuthenticated } = useAuth();
  const credits = useMediaCredits();
  const resolvedCount = typeof count === 'number' ? count : credits.length;

  const label =
    lang === 'en'
      ? 'Archival Sources'
      : lang === 'zh'
      ? '文献与版权来源'
      : 'Nguồn tư liệu';

  const authSuffix = !isAuthenticated
    ? lang === 'en'
      ? ' · Sign in required'
      : lang === 'zh'
      ? ' · 需登录访问'
      : ' · Cần đăng nhập'
    : '';

  const ariaTitle =
    lang === 'en'
      ? `Archival Sources (${resolvedCount} catalogued items)${authSuffix}`
      : lang === 'zh'
      ? `文献与版权来源（共 ${resolvedCount} 条馆藏记录）${authSuffix}`
      : `Nguồn tư liệu & Bản quyền (${resolvedCount} mục lưu trữ)${authSuffix}`;

  const isLight = tone === 'light';

  const surfaceClasses = isLight
    ? floating
      ? 'bg-[#FAF6EE]/95 backdrop-blur-md border-[rgba(184,74,57,0.25)] text-[#1C1917] shadow-[0_4px_14px_rgba(28,25,23,0.08)] hover:bg-[#FFFFFF] hover:border-[#C9A46A] hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(28,25,23,0.12)]'
      : 'bg-[#FAF6EE] border-[rgba(184,74,57,0.25)] text-[#1C1917] shadow-[0_4px_14px_rgba(28,25,23,0.08)] hover:bg-[#FFFFFF] hover:border-[#C9A46A] hover:-translate-y-[1px] hover:shadow-[0_8px_20px_rgba(28,25,23,0.12)]'
    : 'bg-[#FAF6EE]/95 backdrop-blur-md border-[rgba(184,74,57,0.32)] text-[#1C1917] shadow-[0_6px_18px_rgba(0,0,0,0.28)] hover:bg-[#FFFFFF] hover:border-[#C9A46A] hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(0,0,0,0.34)]';

  return (
    <button
      type="button"
      onClick={onClick}
      title={ariaTitle}
      aria-label={ariaTitle}
      className={`inline-flex items-center ${
        fullWidth ? 'w-full justify-between' : 'justify-center'
      } gap-2.5 min-h-[38px] px-4 py-1.5 rounded-full border transition-all duration-200 ease-out cursor-pointer whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A46A]/60 ${surfaceClasses} ${className}`}
    >
      <span className="inline-flex items-center gap-2 min-w-0">
        {/* Thin-stroke Archival Folio Book SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.55"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 shrink-0 text-[#A63A2B] transition-transform duration-200 group-hover:scale-105"
          aria-hidden="true"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8.5 7h7" />
          <path d="M8.5 11h5" />
        </svg>

        <span className="text-[13px] font-medium tracking-[0.01em] text-[#1C1917] leading-none">
          {label}
        </span>

        {!isAuthenticated && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#A63A2B"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 shrink-0 opacity-90"
            aria-hidden="true"
          >
            <rect x="4.5" y="11" width="15" height="9.5" rx="2.2" />
            <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
            <circle cx="12" cy="15.75" r="0.9" fill="#A63A2B" stroke="none" />
          </svg>
        )}
      </span>

      <span className="inline-flex items-center gap-1.5 shrink-0">
        <span className="inline-flex items-center justify-center min-w-[24px] h-[20px] px-1.5 rounded-full bg-[#A63A2B] text-[#FFFDF9] text-[10.5px] font-mono font-semibold tabular-nums leading-none shadow-[0_1px_2px_rgba(166,58,43,0.28)]">
          {resolvedCount}
        </span>

        <span
          aria-hidden="true"
          className="text-[12.5px] leading-none text-[#5C5349] transition-all duration-200 ease-out group-hover:text-[#A63A2B] group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
        >
          ↗
        </span>
      </span>
    </button>
  );
};

export default ArchivalSourcesTrigger;
