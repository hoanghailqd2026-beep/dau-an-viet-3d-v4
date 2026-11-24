import React, { useState, useEffect } from 'react';
import { HeritageSite } from '../../types/heritage';
import { useI18n } from '../../i18n/I18nContext';
import { getHeritageColorBlock } from '../../utils/indochinePalette';
import { HeritageSmoothImage } from '../common/HeritageSmoothImage';
import { HeritageTypographicPlate } from '../common/HeritageTypographicPlate';
import {
  X,
  Box,
  Volume2,
  BookOpen,
  Navigation,
  MapPin,
} from 'lucide-react';

interface MapSiteQuickCardProps {
  site: HeritageSite;
  canonicalIndex: number; // 0-based index in the 17 heritage sites
  onClose: () => void;
  onOpen3D: (site: HeritageSite) => void;
  onPlayAudio: (site: HeritageSite) => void;
  onOpenDetailModal?: (site: HeritageSite) => void;
  onCardMouseEnter?: () => void;
  onCardMouseLeave?: () => void;
  eraStatus?: {
    isHistoricalActive: boolean;
    yearLabel: string;
    isBuilt: boolean;
    displayName: string;
    unbuiltNote: string;
  };
  variant?: 'desktop' | 'mobile';
}

export const MapSiteQuickCard: React.FC<MapSiteQuickCardProps> = ({
  site,
  canonicalIndex,
  onClose,
  onOpen3D,
  onPlayAudio,
  onOpenDetailModal,
  onCardMouseEnter,
  onCardMouseLeave,
  eraStatus,
  variant = 'desktop',
}) => {
  const { lang, formatDistrictName, getLocalizedSite } = useI18n();
  const locSite = getLocalizedSite(site);
  const colorBlock = getHeritageColorBlock(site, lang);

  const [imgFailed, setImgFailed] = useState(false);
  const rawPhoto = site.photos?.[0] || '';

  useEffect(() => {
    setImgFailed(false);
  }, [site.id, rawPhoto]);

  const hasPhoto = Boolean(rawPhoto && !imgFailed);
  const displayIndex = String(Math.max(1, canonicalIndex + 1)).padStart(2, '0');

  const rankingLabel =
    site.rankingLevel === 'Special National'
      ? lang === 'en'
        ? 'Special National'
        : lang === 'zh'
        ? '国家级特别遗迹'
        : 'Đặc biệt'
      : site.rankingLevel === 'National'
      ? lang === 'en'
        ? 'National'
        : lang === 'zh'
        ? '国家级'
        : 'Quốc gia'
      : lang === 'en'
      ? 'City Level'
      : lang === 'zh'
      ? '市级'
      : 'Cấp TP';

  const shortAddress = [
    site.address.street,
    formatDistrictName(site.address.district),
  ]
    .filter(Boolean)
    .join(', ');

  const displayTitle = eraStatus?.isHistoricalActive
    ? eraStatus.displayName
    : locSite.officialName;

  const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${site.gps.lat},${site.gps.lng}`;

  const isMobile = variant === 'mobile';

  return (
    <div
      className={`bg-[#FFFDF9] border border-[#D5CBB8] text-[#1C1917] shadow-[0_18px_48px_rgba(28,25,23,0.22)] overflow-hidden flex flex-col ${
        isMobile
          ? 'w-full rounded-2xl'
          : 'w-[348px] max-w-[calc(100vw-32px)] rounded-2xl'
      }`}
      onMouseEnter={onCardMouseEnter}
      onMouseLeave={onCardMouseLeave}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Top Row: Thumbnail + Commencement Year + Meta + Close */}
      <div className="p-3.5 pb-2.5 flex items-start gap-3">
        {/* Thumbnail with Index Badge */}
        <div className="relative w-[88px] h-[74px] sm:w-[96px] sm:h-[78px] shrink-0 rounded-xl overflow-hidden bg-[#1C1917] border border-[#D5CBB8]">
          {hasPhoto ? (
            <HeritageSmoothImage
              src={rawPhoto}
              alt={displayTitle}
              waitTone="dark"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <HeritageTypographicPlate
              site={site}
              index={canonicalIndex}
              variant="compact"
            />
          )}
          <span
            className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums leading-none shadow-sm"
            style={{ backgroundColor: colorBlock.bg, color: colorBlock.fg }}
          >
            {displayIndex}
          </span>
        </div>

        {/* Title, Ranking, Commencement Year & Short Address */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold tracking-wide uppercase leading-tight ${
                site.rankingLevel === 'Special National'
                  ? 'bg-[#A63A2B] text-[#FFFDF9]'
                  : site.rankingLevel === 'National'
                  ? 'bg-[#3A665B] text-[#FFFDF9]'
                  : 'bg-[#EDE4D3] text-[#1C1917] border border-[#D5CBB8]'
              }`}
            >
              {rankingLabel}
            </span>
            {site.commencementYear ? (
              <span className="text-[11px] font-semibold text-[#6B5E4F] tabular-nums">
                {lang === 'en' ? 'Built' : lang === 'zh' ? '始建' : 'Khởi dựng'}:{' '}
                {site.commencementYear < 0
                  ? `${Math.abs(site.commencementYear)} TCN`
                  : site.commencementYear}
              </span>
            ) : null}
          </div>

          <h3 className="mt-1 font-serif text-[15px] sm:text-base font-semibold text-[#1C1917] leading-snug line-clamp-2">
            {displayTitle}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-[11.5px] text-[#5C5347]">
            <MapPin className="w-3.5 h-3.5 text-[#A63A2B] shrink-0" />
            <span className="truncate">{shortAddress}</span>
          </div>
        </div>

        {/* Close Button (>= 44x44 touch target on mobile) */}
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'en' ? 'Close card' : lang === 'zh' ? '关闭卡片' : 'Đóng thẻ'}
          className={`${
            isMobile ? 'w-11 h-11 -mr-1.5 -mt-1.5' : 'w-8 h-8 -mr-0.5 -mt-0.5'
          } rounded-xl text-[#5C5347] hover:text-[#1C1917] hover:bg-[#F2EAE0] flex items-center justify-center shrink-0 transition-colors cursor-pointer`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Historical Era Context Chip (only when historical overlay active) */}
      {eraStatus?.isHistoricalActive && (
        <div className="px-3.5 pb-1.5">
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium ${
              eraStatus.isBuilt
                ? 'bg-[#F5EBD8] text-[#5C431C] border border-[#D4B886]'
                : 'bg-[#F9ECE9] text-[#A63A2B] border border-[#E5BFB8]'
            }`}
          >
            {eraStatus.isBuilt
              ? `${eraStatus.yearLabel} · ${locSite.officialName}`
              : eraStatus.unbuiltNote}
          </div>
        </div>
      )}

      {/* 2-Line Summary */}
      <div className="px-3.5 pb-3">
        <p className="text-[12.5px] leading-relaxed text-[#453E36] line-clamp-2 m-0">
          {locSite.summary}
        </p>
      </div>

      {/* Action Buttons — Primary: Xem 3D & Chi tiết; Secondary: Thuyết minh & Chỉ đường */}
      <div className="px-3.5 pb-3.5 pt-2.5 border-t border-[#E6DEC9] bg-[#FAF6EE] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpen3D(site)}
            className="min-h-[42px] px-3 rounded-xl bg-[#3A665B] hover:bg-[#2F544B] active:scale-[0.98] text-[#FFFDF9] text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Box className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {lang === 'en' ? 'View 3D' : lang === 'zh' ? '查看 3D' : 'Xem 3D'}
            </span>
          </button>

          {onOpenDetailModal ? (
            <button
              type="button"
              onClick={() => onOpenDetailModal(site)}
              className="min-h-[42px] px-3 rounded-xl bg-[#A63A2B] hover:bg-[#8E3023] active:scale-[0.98] text-[#FFFDF9] text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {lang === 'en' ? 'Details' : lang === 'zh' ? '详细信息' : 'Chi tiết'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onPlayAudio(site)}
              className="min-h-[42px] px-3 rounded-xl bg-[#A63A2B] hover:bg-[#8E3023] active:scale-[0.98] text-[#FFFDF9] text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {lang === 'en' ? 'Audio Guide' : lang === 'zh' ? '语音讲解' : 'Thuyết minh'}
              </span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onPlayAudio(site)}
            className="min-h-[38px] px-3 rounded-xl bg-[#FFFDF9] hover:bg-[#FDF2EF] active:scale-[0.98] border border-[#D5CBB8] text-[#A63A2B] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {lang === 'en' ? 'Listen Audio' : lang === 'zh' ? '收听讲解' : 'Thuyết minh'}
            </span>
          </button>

          <a
            href={googleMapsDirUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[38px] px-3 rounded-xl bg-[#FFFDF9] hover:bg-[#EFE7D8] active:scale-[0.98] border border-[#D5CBB8] text-[#1C1917] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-[#3A665B] shrink-0" />
            <span className="truncate">
              {lang === 'en' ? 'Directions' : lang === 'zh' ? '地图导航' : 'Chỉ đường'}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
