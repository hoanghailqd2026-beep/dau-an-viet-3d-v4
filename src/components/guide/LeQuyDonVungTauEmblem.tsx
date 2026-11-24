import React, { useState } from 'react';
import { SCHOOL_LOGO_FALLBACK_CHAIN } from '../../data/schoolLogo';

export interface LeQuyDonVungTauEmblemProps {
  className?: string;
}

const ALT_TEXT = 'Logo Trường THPT Chuyên Lê Quý Đôn - Vũng Tàu';
const TOOLTIP_TEXT = 'Trường THPT Chuyên Lê Quý Đôn – Vũng Tàu';

export const LeQuyDonVungTauEmblem: React.FC<LeQuyDonVungTauEmblemProps> = ({
  className = 'w-11 h-11 shrink-0',
}) => {
  const [sourceIndex, setSourceIndex] = useState<number>(0);
  const [showMonogramFallback, setShowMonogramFallback] = useState<boolean>(false);

  const currentSrc = SCHOOL_LOGO_FALLBACK_CHAIN[sourceIndex];

  const handleImageError = () => {
    if (sourceIndex + 1 < SCHOOL_LOGO_FALLBACK_CHAIN.length) {
      setSourceIndex((prev) => prev + 1);
    } else {
      setShowMonogramFallback(true);
    }
  };

  if (showMonogramFallback || !currentSrc) {
    return (
      <span
        role="img"
        aria-label={ALT_TEXT}
        title={TOOLTIP_TEXT}
        className={`inline-flex items-center justify-center rounded-full bg-[#1C1D1B] border border-[#C9A46A]/85 ring-1 ring-inset ring-[#A63A2B]/60 text-[#F4EFE4] font-serif font-semibold tracking-[0.06em] text-[11px] leading-none shrink-0 select-none shadow-[0_2px_8px_rgba(0,0,0,0.28)] ${className}`}
      >
        LQD
      </span>
    );
  }

  return (
    <span
      title={TOOLTIP_TEXT}
      className={`inline-flex items-center justify-center rounded-full bg-[#F7F3EB] p-[2px] border border-[#E8DEC8]/85 ring-1 ring-[#C9A46A]/80 overflow-hidden shrink-0 select-none shadow-[0_2px_8px_rgba(0,0,0,0.25)] ${className}`}
    >
      <img
        src={currentSrc}
        alt={ALT_TEXT}
        title={TOOLTIP_TEXT}
        draggable={false}
        onError={handleImageError}
        className="w-full h-full object-cover rounded-full block"
      />
    </span>
  );
};
