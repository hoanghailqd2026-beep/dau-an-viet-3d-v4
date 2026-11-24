import React, { useRef } from 'react';
import { HeritageSite, TourRoute } from '../../types/heritage';
import { TOUR_ROUTES } from '../../data/tours';
import { calculateTourDistanceKm } from '../../utils/coordinateConversion';
import { useI18n } from '../../i18n/I18nContext';
import {
  getHeritageColorBlock,
  getTourRouteIndochineColor,
} from '../../utils/indochinePalette';
import { HeritageSmoothImage } from '../common/HeritageSmoothImage';
import { HeritageTypographicPlate } from '../common/HeritageTypographicPlate';
import {
  ChevronUp,
  ChevronDown,
  MapPin,
  Route,
  RotateCcw,
} from 'lucide-react';

interface MapMobileBottomSheetProps {
  isExpanded: boolean;
  onToggleExpanded: (expanded: boolean) => void;
  mapSubView: 'gis' | 'routes';
  onChangeMapSubView: (view: 'gis' | 'routes') => void;
  sites: HeritageSite[];
  allSites: HeritageSite[];
  selectedSite: HeritageSite | null;
  activeTour: TourRoute | null;
  filterRanking: string;
  onFilterRankingChange: (val: string) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onSelectSite: (site: HeritageSite) => void;
  onSelectTour: (tour: TourRoute) => void;
}

export const MapMobileBottomSheet: React.FC<MapMobileBottomSheetProps> = ({
  isExpanded,
  onToggleExpanded,
  mapSubView,
  onChangeMapSubView,
  sites,
  allSites,
  selectedSite,
  activeTour,
  filterRanking,
  onFilterRankingChange,
  hasActiveFilters,
  onResetFilters,
  onSelectSite,
  onSelectTour,
}) => {
  const { lang, formatDistrictName, getLocalizedSite, getLocalizedTour } = useI18n();
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartYRef.current = null;
    if (deltaY < -30 && !isExpanded) {
      onToggleExpanded(true);
    } else if (deltaY > 30 && isExpanded) {
      onToggleExpanded(false);
    }
  };

  const collapsedTitle =
    lang === 'en'
      ? `${allSites.length} Monuments & ${TOUR_ROUTES.length} Routes — Tap to open`
      : lang === 'zh'
      ? `${allSites.length}处遗迹与${TOUR_ROUTES.length}条路线 — 点击展开`
      : `Danh sách ${allSites.length} di tích & ${TOUR_ROUTES.length} tuyến — Bấm để mở`;

  return (
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-30 pointer-events-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`w-full bg-[#FFFDF9] border-t border-[#D5CBB8] rounded-t-[20px] shadow-[0_-12px_36px_rgba(28,25,23,0.18)] transition-all duration-300 flex flex-col overflow-hidden ${
          isExpanded ? 'h-[55vh] max-h-[55vh]' : 'h-[76px]'
        }`}
      >
        {/* Drag Handle + Collapsed Header Bar */}
        <button
          type="button"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => onToggleExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="w-full shrink-0 px-4 pt-2 pb-2.5 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-[#FFFDF9] hover:bg-[#FAF6EE] transition-colors"
        >
          <span className="w-10 h-1 rounded-full bg-[#C9BEA8]" aria-hidden="true" />
          <div className="w-full flex items-center justify-between gap-2 min-h-[38px]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A63A2B] shrink-0" />
              <span className="text-[13px] font-semibold text-[#1C1917] truncate">
                {isExpanded
                  ? lang === 'en'
                    ? 'Explore Monuments & Heritage Journeys'
                    : lang === 'zh'
                    ? '探索遗迹名录与遗产路线'
                    : 'Khám phá Di tích & Hành trình Di sản'
                  : collapsedTitle}
              </span>
            </div>
            <span className="w-9 h-9 rounded-xl bg-[#F5EFE4] border border-[#D5CBB8] text-[#1C1917] flex items-center justify-center shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </span>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="flex-1 min-h-0 flex flex-col border-t border-[#E6DEC9]">
            {/* Single Mode Switcher: 17 Điểm Di Tích | 9 Hành Trình Di Sản */}
            <div className="px-3.5 py-2.5 bg-[#FAF6EE] border-b border-[#E6DEC9] shrink-0 space-y-2">
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#EDE4D3] border border-[#D5CBB8] gap-1">
                <button
                  type="button"
                  onClick={() => onChangeMapSubView('gis')}
                  className={`min-h-[40px] px-2 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    mapSubView === 'gis'
                      ? 'bg-[#A63A2B] text-[#FFFDF9] shadow-xs'
                      : 'text-[#453E36] hover:text-[#1C1917]'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {lang === 'en'
                      ? `${allSites.length} Heritage Sites`
                      : lang === 'zh'
                      ? `${allSites.length}处遗迹`
                      : `${allSites.length} Điểm Di Tích`}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeMapSubView('routes')}
                  className={`min-h-[40px] px-2 rounded-lg text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    mapSubView === 'routes'
                      ? 'bg-[#3A665B] text-[#FFFDF9] shadow-xs'
                      : 'text-[#453E36] hover:text-[#1C1917]'
                  }`}
                >
                  <Route className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {lang === 'en'
                      ? `${TOUR_ROUTES.length} Journeys`
                      : lang === 'zh'
                      ? `${TOUR_ROUTES.length}条路线`
                      : `${TOUR_ROUTES.length} Hành Trình`}
                  </span>
                </button>
              </div>

              {/* Ranking Filter Row (only in Sites mode) */}
              {mapSubView === 'gis' && (
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 grid grid-cols-4 p-0.5 rounded-lg bg-[#EDE4D3] border border-[#D5CBB8]">
                    {[
                      { id: 'all', label: lang === 'en' ? 'All' : lang === 'zh' ? '全部' : 'Tất cả' },
                      { id: 'Special National', label: lang === 'en' ? 'Special' : lang === 'zh' ? '特级' : 'Đặc biệt' },
                      { id: 'National', label: lang === 'en' ? 'National' : lang === 'zh' ? '国家级' : 'Quốc gia' },
                      { id: 'City Level', label: lang === 'en' ? 'City' : lang === 'zh' ? '市级' : 'Cấp TP' },
                    ].map((rank) => {
                      const active = filterRanking === rank.id;
                      return (
                        <button
                          key={rank.id}
                          type="button"
                          onClick={() =>
                            onFilterRankingChange(active && rank.id !== 'all' ? 'all' : rank.id)
                          }
                          className={`min-h-[34px] px-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer truncate ${
                            active
                              ? 'bg-[#1C1917] text-[#FFFDF9]'
                              : 'text-[#5C5347] hover:text-[#1C1917]'
                          }`}
                        >
                          {rank.label}
                        </button>
                      );
                    })}
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={onResetFilters}
                      aria-label={lang === 'en' ? 'Reset filters' : lang === 'zh' ? '重置筛选' : 'Đặt lại bộ lọc'}
                      className="w-9 h-9 rounded-lg bg-[#A63A2B] text-[#FFFDF9] flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-3.5 py-2.5 space-y-2 bg-[#FAF6EE]">
              {mapSubView === 'gis' ? (
                sites.length > 0 ? (
                  sites.map((site) => {
                    const canonicalIdx = Math.max(
                      0,
                      allSites.findIndex((s) => s.id === site.id)
                    );
                    const locSite = getLocalizedSite(site);
                    const colorBlock = getHeritageColorBlock(site, lang);
                    const isSelected = selectedSite?.id === site.id;
                    const photoUrl = site.photos?.[0] || '';
                    const rankingLabel =
                      site.rankingLevel === 'Special National'
                        ? lang === 'en'
                          ? 'Special'
                          : lang === 'zh'
                          ? '特级'
                          : 'Đặc biệt'
                        : site.rankingLevel === 'National'
                        ? lang === 'en'
                          ? 'National'
                          : lang === 'zh'
                          ? '国家级'
                          : 'Quốc gia'
                        : lang === 'en'
                        ? 'City'
                        : lang === 'zh'
                        ? '市级'
                        : 'Cấp TP';

                    return (
                      <button
                        key={site.id}
                        type="button"
                        onClick={() => {
                          onSelectSite(site);
                          onToggleExpanded(false);
                        }}
                        style={{
                          borderLeftColor: colorBlock.bg,
                          borderLeftWidth: '4px',
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#F5EBD8] border-[#A63A2B] shadow-xs'
                            : 'bg-[#FFFDF9] border-[#D5CBB8] hover:bg-[#F5EFE4]'
                        }`}
                      >
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-[#1C1917] shrink-0 border border-[#D5CBB8]">
                          {photoUrl ? (
                            <HeritageSmoothImage
                              src={photoUrl}
                              alt={locSite.officialName}
                              loading="lazy"
                              waitTone="dark"
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <HeritageTypographicPlate
                              site={site}
                              index={canonicalIdx}
                              variant="compact"
                            />
                          )}
                          <span className="absolute top-0.5 left-0.5 px-1 rounded bg-[#1C1917]/90 text-[#FFFDF9] text-[9.5px] font-bold tabular-nums">
                            {String(canonicalIdx + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold uppercase text-[#A63A2B]">
                              {rankingLabel}
                            </span>
                            <span className="text-[10px] text-[#8C7E6D]">·</span>
                            <span className="text-[10.5px] text-[#5C5347] truncate">
                              {formatDistrictName(site.address.district)}
                            </span>
                          </div>
                          <div className="text-[13.5px] font-serif font-semibold text-[#1C1917] truncate mt-0.5">
                            {locSite.officialName}
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-[13px] text-[#5C5347]">
                      {lang === 'en'
                        ? 'No matching monuments found.'
                        : lang === 'zh'
                        ? '未找到符合条件的遗迹。'
                        : 'Không có di tích phù hợp với bộ lọc.'}
                    </p>
                    <button
                      type="button"
                      onClick={onResetFilters}
                      className="min-h-[40px] px-4 rounded-xl bg-[#A63A2B] text-[#FFFDF9] text-xs font-semibold cursor-pointer"
                    >
                      {lang === 'en' ? 'Reset Filters' : lang === 'zh' ? '重置筛选' : 'Xóa bộ lọc'}
                    </button>
                  </div>
                )
              ) : (
                TOUR_ROUTES.map((tour, idx) => {
                  const isActive = activeTour?.id === tour.id;
                  const locTour = getLocalizedTour(tour);
                  const cleanTitle = locTour.title.replace(
                    /^(Tuyến|Route|路线)\s*\d+\s*[—:-]\s*/i,
                    ''
                  );
                  const routeColor = getTourRouteIndochineColor(tour);
                  const tourSites = tour.sites
                    .map((id) => allSites.find((s) => s.id === id))
                    .filter((s): s is HeritageSite => Boolean(s));
                  const stopNames = tourSites.map((s) =>
                    getLocalizedSite(s).officialName.split(/\s*[-–(（]/)[0].trim()
                  );
                  const distKm = calculateTourDistanceKm(tour, allSites);

                  return (
                    <button
                      key={tour.id}
                      type="button"
                      onClick={() => {
                        onSelectTour(tour);
                        onToggleExpanded(false);
                      }}
                      style={{
                        borderLeftColor: routeColor.primaryHex,
                        borderLeftWidth: '4px',
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                        isActive
                          ? 'bg-[#F5EBD8] border-[#3A665B] shadow-xs'
                          : 'bg-[#FFFDF9] border-[#D5CBB8] hover:bg-[#F5EFE4]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums"
                          style={{
                            backgroundColor: routeColor.primaryHex,
                            color: routeColor.fgHex,
                          }}
                        >
                          {lang === 'en'
                            ? `Route ${String(idx + 1).padStart(2, '0')}`
                            : lang === 'zh'
                            ? `路线 ${String(idx + 1).padStart(2, '0')}`
                            : `Tuyến ${String(idx + 1).padStart(2, '0')}`}
                        </span>
                        <span className="text-[11px] font-medium text-[#5C5347] tabular-nums">
                          {tourSites.length}{' '}
                          {lang === 'en' ? 'stops' : lang === 'zh' ? '站' : 'trạm'}
                          {tourSites.length > 1 && distKm > 0 ? ` · ~${distKm} km` : ''}
                        </span>
                      </div>
                      <div className="text-[13.5px] font-serif font-semibold text-[#1C1917] leading-snug">
                        {cleanTitle}
                      </div>
                      <div className="text-[11px] text-[#5C5347] truncate">
                        {stopNames.join(' → ')}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
