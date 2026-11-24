import React, { useMemo, useState } from 'react';
import { HeritageSite, TourRoute } from '../../types/heritage';
import { HERITAGE_SITES } from '../../data/heritageSites';
import { useI18n } from '../../i18n/I18nContext';
import {
  getIndochineCategoryMeta,
  getTourRouteIndochineColor,
  getHeritageColorBlock,
} from '../../utils/indochinePalette';
import { HeritageTypographicPlate } from '../common/HeritageTypographicPlate';
import { HeritageSmoothImage } from '../common/HeritageSmoothImage';
import { HeritageSearchCombobox } from '../common/HeritageSiteDropdown';
import { HeritageOptionSearchSelect } from '../common/HeritageSiteSearchSelect';
import { RotateCcw, SlidersHorizontal, ChevronDown } from 'lucide-react';

export type HeritageLocalityFilter = 'all' | 'hcm' | 'binhduong' | 'vungtau';

interface FloatingExplorerProps {
  sites: HeritageSite[];
  allSites?: HeritageSite[];
  selectedSite: HeritageSite | null;
  onSelectSite: (site: HeritageSite) => void;
  onOpen3D: (site: HeritageSite) => void;
  onOpenARAudio: (site: HeritageSite) => void;
  onOpenDetailModal: (site: HeritageSite) => void;
  onOpenVideo?: (site: HeritageSite) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filterLocality: HeritageLocalityFilter;
  onFilterLocalityChange: (val: HeritageLocalityFilter) => void;
  filterRanking: string;
  onFilterRankingChange: (val: string) => void;
  filterDistrict: string;
  onFilterDistrictChange: (val: string) => void;
  filterType: string;
  onFilterTypeChange: (val: string) => void;
  filterTech: string;
  onFilterTechChange: (val: string) => void;
  uniqueDistricts: string[];
  totalSitesCount: number;
  hiddenSiteIds?: string[];
  activeTour?: TourRoute | null;
  onSelectTour?: (tour: TourRoute | null) => void;
}

interface ExplorerSiteCardProps {
  site: HeritageSite;
  canonicalIdx: number;
  isSelected: boolean;
  officialName: string;
  chronologyYear: string | number;
  districtLabel: string;
  rankingLabel: string;
  lang: 'vi' | 'en' | 'zh';
  isHiddenForVisitors?: boolean;
  onSelectSite: (site: HeritageSite) => void;
  onOpenDetailModal: (site: HeritageSite) => void;
  onOpen3D: (site: HeritageSite) => void;
  onOpenARAudio: (site: HeritageSite) => void;
}

const ExplorerSiteCard: React.FC<ExplorerSiteCardProps> = React.memo(({
  site,
  canonicalIdx,
  isSelected,
  officialName,
  chronologyYear,
  districtLabel,
  rankingLabel,
  lang,
  isHiddenForVisitors = false,
  onSelectSite,
  onOpenDetailModal,
  onOpen3D,
  onOpenARAudio,
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);
  const rawPhoto = site.photos?.[0] || '';
  React.useEffect(() => {
    setImgFailed(false);
  }, [rawPhoto]);
  const hasRealPhoto = Boolean(rawPhoto && !imgFailed);
  const colorBlock = getHeritageColorBlock(site, lang);

  return (
    <div
      onClick={() => onSelectSite(site)}
      style={{
        borderLeftColor: colorBlock.bg,
        borderLeftWidth: '4px',
      }}
      className={`group p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
        isSelected
          ? 'bg-[#F5EBD8] border-[#A63A2B] shadow-sm'
          : 'bg-[#FFFDF9] border-[#D5CBB8] hover:bg-[#F5EFE4] text-[#1C1917]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative w-20 aspect-video shrink-0 rounded-lg bg-[#1C1917] border border-[#D5CBB8] overflow-hidden">
          {hasRealPhoto ? (
            <>
              <HeritageSmoothImage
                src={rawPhoto}
                alt={officialName}
                loading="lazy"
                waitTone="dark"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-[opacity,transform] duration-500"
              />
              <span
                className="absolute top-0.5 left-0.5 px-1.5 py-0.5 rounded bg-[#1C1917]/90 text-[#FFFDF9] text-[10px] font-bold tabular-nums leading-none"
              >
                {String(canonicalIdx + 1).padStart(2, '0')}
              </span>
            </>
          ) : (
            <HeritageTypographicPlate site={site} index={canonicalIdx} variant="compact" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1.5">
            <span
              className={`text-[10.5px] font-semibold truncate ${
                site.rankingLevel === 'Special National'
                  ? 'text-[#A63A2B]'
                  : site.rankingLevel === 'National'
                  ? 'text-[#3A665B]'
                  : 'text-[#6B5E4F]'
              }`}
            >
              {rankingLabel}
            </span>
            <span className="text-[10.5px] shrink-0 tabular-nums text-[#7C7061]">
              {chronologyYear}
            </span>
          </div>

          <h3 className="text-[13.5px] font-serif font-semibold text-[#1C1917] leading-snug line-clamp-1 mt-0.5">
            {officialName}
          </h3>

          <div className="flex items-center justify-between gap-2 mt-0.5">
            <div className="text-[11px] truncate text-[#5C5347]">
              {districtLabel}
            </div>
            {isHiddenForVisitors && (
              <span className="px-2 py-0.5 rounded bg-[#1C1917] text-[#C9A46A] text-[9px] font-semibold shrink-0">
                {lang === 'zh'
                  ? '隐藏草稿'
                  : lang === 'en'
                  ? 'Hidden'
                  : 'Đang ẩn'}
              </span>
            )}
          </div>
        </div>
      </div>

      {isSelected && (
        <div
          className="pt-2 border-t border-[#D5CBB8] flex items-center gap-1.5 text-[11px] font-semibold"
          onClick={(e) => e.stopPropagation()}
        >
          {site.has3D && (
            <button
              type="button"
              onClick={() => onOpen3D(site)}
              className="flex-1 min-h-[34px] px-2.5 rounded-lg bg-[#3A665B] hover:bg-[#2F544B] text-[#FFFDF9] cursor-pointer transition-colors"
            >
              {lang === 'vi' ? 'Xem 3D' : lang === 'zh' ? '3D模型' : 'View 3D'}
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenARAudio(site)}
            className="flex-1 min-h-[34px] px-2.5 rounded-lg bg-[#FFFDF9] hover:bg-[#FDF2EF] text-[#A63A2B] border border-[#A63A2B] cursor-pointer transition-colors"
          >
            {lang === 'vi' ? 'Thuyết minh' : lang === 'zh' ? '语音讲解' : 'Audio'}
          </button>
          <button
            type="button"
            onClick={() => onOpenDetailModal(site)}
            className="min-h-[34px] px-2.5 rounded-lg bg-[#FAF6EE] hover:bg-[#EDE4D3] text-[#1C1917] border border-[#D5CBB8] cursor-pointer transition-colors shrink-0"
          >
            {lang === 'vi' ? 'Chi tiết' : lang === 'zh' ? '详情' : 'Details'}
          </button>
        </div>
      )}
    </div>
  );
});

export const FloatingExplorer: React.FC<FloatingExplorerProps> = React.memo(({
  sites,
  allSites,
  selectedSite,
  onSelectSite,
  onOpen3D,
  onOpenARAudio,
  onOpenDetailModal,
  searchQuery,
  onSearchChange,
  filterLocality,
  onFilterLocalityChange,
  filterRanking,
  onFilterRankingChange,
  filterDistrict,
  onFilterDistrictChange,
  filterType,
  onFilterTypeChange,
  filterTech,
  onFilterTechChange,
  uniqueDistricts,
  totalSitesCount,
  hiddenSiteIds = [],
  activeTour = null,
  onSelectTour,
}) => {
  const { lang, t, getLocalizedSite, getLocalizedTour, formatDistrictName } = useI18n();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const advancedFilterCount =
    (filterRanking !== 'all' ? 1 : 0) +
    (filterDistrict !== 'all' ? 1 : 0) +
    (filterType !== 'all' ? 1 : 0);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    filterLocality !== 'all' ||
    filterRanking !== 'all' ||
    filterDistrict !== 'all' ||
    filterType !== 'all' ||
    filterTech !== 'all';

  const resetAllFilters = () => {
    onSearchChange('');
    onFilterLocalityChange('all');
    onFilterRankingChange('all');
    onFilterDistrictChange('all');
    onFilterTypeChange('all');
    onFilterTechChange('all');
  };

  const locActiveTour = activeTour ? getLocalizedTour(activeTour) : null;
  const activeTourColor = getTourRouteIndochineColor(activeTour);
  const canonicalPool = allSites && allSites.length > 0 ? allSites : HERITAGE_SITES;
  const visibleBaseSites = useMemo(
    () => canonicalPool.filter((s) => !hiddenSiteIds.includes(s.id)),
    [canonicalPool, hiddenSiteIds]
  );

  const localityOptions: ReadonlyArray<{ id: HeritageLocalityFilter; label: string }> = [
    { id: 'all', label: lang === 'en' ? 'All' : lang === 'zh' ? '全部' : 'Tất cả' },
    { id: 'hcm', label: lang === 'en' ? 'HCMC' : lang === 'zh' ? '胡志明市' : 'TP.HCM' },
    { id: 'binhduong', label: lang === 'en' ? 'Binh Duong' : lang === 'zh' ? '平阳' : 'Bình Dương' },
    { id: 'vungtau', label: lang === 'en' ? 'Vung Tau' : lang === 'zh' ? '头顿' : 'Vũng Tàu' },
  ];

  const rankingOptions: ReadonlyArray<{ id: string; label: string }> = [
    { id: 'all', label: lang === 'en' ? 'All' : lang === 'zh' ? '全部' : 'Tất cả' },
    { id: 'Special National', label: lang === 'en' ? 'Special' : lang === 'zh' ? '特级' : 'Đặc biệt' },
    { id: 'National', label: lang === 'en' ? 'National' : lang === 'zh' ? '国家级' : 'Quốc gia' },
    { id: 'City Level', label: lang === 'en' ? 'City' : lang === 'zh' ? '市级' : 'Cấp TP' },
  ];

  return (
    <aside
      aria-label="Khám phá theo Bản đồ"
      className="w-full h-full bg-[#FAF6EE] flex flex-col z-20 select-none overflow-visible text-[#1C1917]"
    >
      {/* 1. COMPACT HEADER */}
      <div className="px-3.5 pt-2.5 pb-2 border-b border-[#E2D9C8] bg-[#F5EFE4] shrink-0 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-[15.5px] font-serif font-semibold text-[#1C1917] tracking-tight tabular-nums truncate">
            {lang === 'vi'
              ? `${sites.length}/${totalSitesCount} Di tích đang hiển thị`
              : lang === 'zh'
              ? `当前显示 ${sites.length}/${totalSitesCount} 处遗迹`
              : `Showing ${sites.length}/${totalSitesCount} Monuments`}
          </h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="h-7 px-2.5 rounded-lg border border-[#A63A2B]/35 bg-[#FFFDF9] hover:bg-[#A63A2B] text-[#A63A2B] hover:text-[#FFFDF9] text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            title={lang === 'en' ? 'Reset filters' : lang === 'zh' ? '重置筛选' : 'Đặt lại bộ lọc'}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{lang === 'en' ? 'Reset' : lang === 'zh' ? '重置' : 'Đặt lại'}</span>
          </button>
        )}
      </div>

      {/* 2. STREAMLINED SEARCH + 1 ROW LOCALITY CHIPS + COLLAPSIBLE ADVANCED FILTER TOGGLE */}
      <div className="relative z-30 px-3.5 py-2.5 border-b border-[#E2D9C8] bg-[#FAF6EE] space-y-2 shrink-0 overflow-visible">
        <HeritageSearchCombobox
          sites={visibleBaseSites}
          canonicalSites={canonicalPool}
          selectedSiteId={selectedSite?.id}
          value={searchQuery}
          onChange={onSearchChange}
          onSelectSite={(site) => {
            onSelectSite(site);
            onSearchChange('');
          }}
          placeholder={
            lang === 'en'
              ? 'Search monument name or address...'
              : lang === 'zh'
              ? '搜索遗迹名称或地址...'
              : 'Tìm tên di tích hoặc địa điểm...'
          }
          tone="light"
          hiddenSiteIds={hiddenSiteIds}
          dropdownWidthClass="w-full"
        />

        {/* Single Row: 4 Quick Locality Buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {localityOptions.map((loc) => {
            const active = filterLocality === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  onFilterLocalityChange(active && loc.id !== 'all' ? 'all' : loc.id);
                  if (loc.id !== 'all') onFilterDistrictChange('all');
                }}
                className={`min-h-[32px] px-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer truncate ${
                  active
                    ? 'bg-[#A63A2B] border-[#A63A2B] text-[#FFFDF9] shadow-xs'
                    : 'bg-[#FFFDF9] border-[#D5CBB8] text-[#453E36] hover:bg-[#F2EAE0] hover:text-[#1C1917]'
                }`}
              >
                {loc.label}
              </button>
            );
          })}
        </div>

        {/* Compact Advanced Filter Toggle (Collapsed by default) */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            aria-expanded={showAdvancedFilters}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
              showAdvancedFilters || advancedFilterCount > 0
                ? 'bg-[#F5EBD8] border-[#A63A2B]/40 text-[#A63A2B]'
                : 'bg-[#FFFDF9] border-[#D5CBB8] text-[#5C5347] hover:text-[#1C1917] hover:bg-[#F2EAE0]'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3 shrink-0" />
            <span>
              {lang === 'en'
                ? 'Advanced filters'
                : lang === 'zh'
                ? '高级筛选'
                : 'Bộ lọc nâng cao'}
            </span>
            {advancedFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-[#A63A2B] text-[#FFFDF9] text-[10px] font-bold tabular-nums">
                {advancedFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${
                showAdvancedFilters ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Expanded Advanced Filters (Ranking, District, Type) */}
        {showAdvancedFilters && (
          <div className="pt-2 border-t border-[#E2D9C8] space-y-2">
            <div className="space-y-1">
              <span className="text-[10.5px] font-semibold text-[#6B5E4F] block">
                {lang === 'en' ? 'Monument Ranking' : lang === 'zh' ? '遗迹级别' : 'Xếp hạng di tích'}
              </span>
              <div className="grid grid-cols-4 p-0.5 rounded-lg bg-[#EDE4D3] border border-[#D5CBB8]">
                {rankingOptions.map((rank) => {
                  const active = filterRanking === rank.id;
                  return (
                    <button
                      key={rank.id}
                      type="button"
                      onClick={() => onFilterRankingChange(active && rank.id !== 'all' ? 'all' : rank.id)}
                      className={`min-h-[28px] px-1 rounded-md text-[10.5px] font-semibold transition-colors cursor-pointer truncate ${
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
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <HeritageOptionSearchSelect
                  value={filterDistrict}
                  defaultValue="all"
                  onChange={(val) => {
                    onFilterDistrictChange(val);
                    if (val !== 'all') onFilterLocalityChange('all');
                  }}
                  size="sm"
                  tone="dark"
                  ariaLabel={
                    lang === 'vi'
                      ? 'Lọc theo quận, huyện'
                      : lang === 'zh'
                      ? '按郡县筛选'
                      : 'Filter by district'
                  }
                  options={[
                    {
                      value: 'all',
                      label:
                        lang === 'vi'
                          ? 'Quận / Huyện: Tất cả'
                          : lang === 'zh'
                          ? '全部郡县'
                          : 'All Districts',
                    },
                    ...uniqueDistricts.map((d) => ({
                      value: d,
                      label: formatDistrictName(d),
                    })),
                  ]}
                />
              </div>

              <div className="flex-1 min-w-0">
                <HeritageOptionSearchSelect
                  value={filterType}
                  defaultValue="all"
                  onChange={onFilterTypeChange}
                  size="sm"
                  tone="dark"
                  searchable={false}
                  ariaLabel={
                    lang === 'vi'
                      ? 'Lọc theo loại hình'
                      : lang === 'zh'
                      ? '按类别筛选'
                      : 'Filter by type'
                  }
                  options={[
                    {
                      value: 'all',
                      label:
                        lang === 'vi'
                          ? 'Loại hình: Tất cả'
                          : lang === 'zh'
                          ? '全部类别'
                          : 'All Types',
                    },
                    { value: 'Architecture', label: t('types.Architecture') },
                    { value: 'History', label: t('types.History') },
                    { value: 'Archaeology', label: t('types.Archaeology') },
                  ]}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. ACTIVE ROUTE BANNER (IF ANY) */}
      {activeTour && locActiveTour && (
        <div
          className="px-3.5 py-2 bg-[#F5EFE4] border-b border-[#E2D9C8] flex items-center justify-between gap-2 shrink-0"
          style={{ borderLeft: `4px solid ${activeTourColor.primaryHex}` }}
        >
          <div className="min-w-0">
            <span className="block text-[10.5px] font-semibold text-[#A63A2B]">
              {lang === 'vi'
                ? 'Hành trình đang bật'
                : lang === 'zh'
                ? '当前激活路线'
                : 'Active journey'}
            </span>
            <div className="text-xs font-semibold text-[#1C1917] truncate">
              {locActiveTour.title}
            </div>
          </div>
          {onSelectTour && (
            <button
              type="button"
              onClick={() => onSelectTour(null)}
              className="px-2.5 py-1 rounded-lg text-[10.5px] font-semibold bg-[#1C1917] text-[#FFFDF9] hover:bg-[#A63A2B] cursor-pointer shrink-0 transition-colors"
            >
              {lang === 'vi' ? 'Tắt tuyến' : lang === 'zh' ? '关闭' : 'Clear'}
            </button>
          )}
        </div>
      )}

      {/* 4. SCROLLABLE HERITAGE SITES LIST (Immediately prominent from upper half) */}
      <div className="flex-1 min-h-0 overflow-y-auto modal-scrollbar p-3 pb-24 space-y-2 bg-[#FAF6EE]">
        {sites.length > 0 ? (
          sites.map((site) => {
            const canonicalIdx = Math.max(
              0,
              canonicalPool.findIndex((s) => s.id === site.id)
            );
            const isSelected = selectedSite?.id === site.id;
            const locSite = getLocalizedSite(site);
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
                ? 'Municipal'
                : lang === 'zh'
                ? '市级'
                : 'Cấp TP';

            return (
              <ExplorerSiteCard
                key={site.id}
                site={site}
                canonicalIdx={canonicalIdx}
                isSelected={isSelected}
                officialName={locSite.officialName}
                chronologyYear={
                  site.commencementYear
                    ? site.commencementYear < 0
                      ? `${Math.abs(site.commencementYear)} TCN`
                      : site.commencementYear
                    : locSite.chronology.split('(')[0].trim()
                }
                districtLabel={formatDistrictName(site.address.district)}
                rankingLabel={rankingLabel}
                lang={lang}
                isHiddenForVisitors={hiddenSiteIds.includes(site.id)}
                onSelectSite={onSelectSite}
                onOpenDetailModal={onOpenDetailModal}
                onOpen3D={onOpen3D}
                onOpenARAudio={onOpenARAudio}
              />
            );
          })
        ) : (
          <div className="p-8 text-center space-y-2.5">
            <p className="text-sm text-[#453E36]">{t('explorer.emptyTitle')}</p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-4 py-2 rounded-xl bg-[#A63A2B] text-[#FFFDF9] text-xs font-semibold cursor-pointer"
            >
              {t('explorer.clearFilterBtn')}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
});
