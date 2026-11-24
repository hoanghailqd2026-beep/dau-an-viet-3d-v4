import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Search,
  Check,
  Copy,
  ArrowUpRight,
  ArrowRight,
  Maximize2,
  Play,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { HeritageSite } from '../../types/heritage';
import { useI18n } from '../../i18n/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  MediaCreditCategory,
  MediaCreditItem,
  useMediaCredits,
} from '../../utils/mediaCreditsStore';
import { SITE_ID_TO_VIDEO_KEY } from '../../data/heritageFilms';
import { advanceHeritageImgFallback } from '../../data/heritagePhotos';
import { useHeritageRealPhotos } from '../../utils/wikimediaPhotoService';

/**
 * Safeguard for Vietnamese (Telex/VNI) and Chinese/CJK IME composition:
 * prevents Escape, Enter, or Arrow keys from closing modals or jumping rows while composing.
 */
const isImeKeyEvent = (e: KeyboardEvent | React.KeyboardEvent): boolean =>
  Boolean(
    ('nativeEvent' in e ? e.nativeEvent.isComposing : e.isComposing) ||
      ('nativeEvent' in e ? e.nativeEvent.keyCode : e.keyCode) === 229
  );

export interface MediaCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: HeritageSite[];
  initialSiteId?: string | null;
  initialCategory?: 'ALL' | MediaCreditCategory;
  /** Optional deep-link to a specific MediaCreditItem ID in the 64-item registry */
  initialCreditId?: string | null;
  /** Optional deep-link to a specific ARC-... accession code */
  initialAccessionCode?: string | null;
  /** Optional handler to close this modal and navigate directly to the linked monument dossier */
  onOpenSiteDossier?: (site: HeritageSite) => void;
}

type FilterCategory = 'ALL' | MediaCreditCategory;
type CitationFormat = 'archival' | 'apa';

interface LightboxSpecimen {
  id: string;
  src: string;
  accessionCode: string;
  yearDisplay: string;
  title: string;
  siteDisplay: string;
  sourceAuthor: string;
  licenseNote: string;
  url?: string;
  citation: string;
}

function extractYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (host.includes('youtu.be')) {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0];
      return id && /^[A-Za-z0-9_-]{6,}$/.test(id) ? id : null;
    }
    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      const v = parsed.searchParams.get('v');
      if (v && /^[A-Za-z0-9_-]{6,}$/.test(v)) return v;
      const match = parsed.pathname.match(/\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{6,})/);
      if (match?.[1]) return match[1];
    }
  } catch {
    // Fallback regex handles relative or malformed URLs while preserving leading '-' and '--'
  }
  const fallbackMatch = trimmed.match(
    /(?:(?:[?&]v=)|youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed|shorts|live|v)\/)([A-Za-z0-9_-]{6,})/i
  );
  return fallbackMatch?.[1] || null;
}

function isDirectImageUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:image/')) return true;
  if (trimmed.startsWith('/assets/') || trimmed.startsWith('/images/')) return true;
  const withoutQuery = trimmed.split('?')[0].split('#')[0].toLowerCase();
  if (/\.(jpg|jpeg|png|webp|avif|gif)$/i.test(withoutQuery)) {
    if (
      trimmed.includes('/wiki/File:') ||
      trimmed.includes('/wiki/T%E1%BB%87p:') ||
      trimmed.includes('/wiki/T%E1%BA%ADp_tin:')
    ) {
      return false;
    }
    return true;
  }
  return false;
}

function fallbackCopyText(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => fallbackCopyText(text));
  }
  return Promise.resolve(fallbackCopyText(text));
}

function extractChronologyDisplay(
  item: MediaCreditItem,
  site: HeritageSite | undefined,
  lang: 'vi' | 'en' | 'zh'
): string {
  const raw = (item.yearOrPeriod || '').trim();
  const years = raw.match(/\b(1[6-9]\d{2}|20\d{2})\b/g);
  if (years && years.length >= 2) {
    const first = years[0];
    const last = years[years.length - 1];
    return first.slice(0, 2) === last.slice(0, 2)
      ? `${first}–${last.slice(2)}`
      : `${first}–${last}`;
  }
  if (years && years.length === 1) {
    return years[0];
  }
  if (/^\d{1,2}:\d{2}/.test(raw)) {
    return raw;
  }
  if (/hiện tại|present|current|当代|现代/i.test(raw)) {
    return lang === 'en' ? 'Present' : lang === 'zh' ? '当代' : 'Hiện tại';
  }
  if (site?.commencementYear) {
    return String(site.commencementYear);
  }
  return raw || '—';
}

function extractArchiveCodeLabel(item: MediaCreditItem, lang: 'vi' | 'en' | 'zh'): string {
  const combined = `${item.id} ${item.sourceAuthor} ${item.title}`.toLowerCase();
  if (combined.includes('gallica') || combined.includes('bnf')) {
    return 'BNF GALLICA · TTLTQG II';
  }
  if (combined.includes('anom')) {
    return 'ANOM · TTLTQG II';
  }
  if (combined.includes('efeo')) {
    return 'EFEO · BẢO TÀNG LỊCH SỬ';
  }
  if (combined.includes('openstreetmap') || combined.includes('esri') || combined.includes('gis')) {
    return 'OSM · CARTO · ESRI GIS';
  }
  if (combined.includes('ngô viết thụ') || combined.includes('dinh')) {
    return 'HỘI TRƯỜNG THỐNG NHẤT';
  }
  if (combined.includes('thư viện khoa học')) {
    return 'TVKHTH TP.HCM · COMMONS';
  }
  return lang === 'en'
    ? 'NATIONAL ARCHIVES II'
    : lang === 'zh'
    ? '国家历史舆图馆藏'
    : 'TTLTQG II · ĐỒ BẢN CỔ';
}

function extractVideoChannelLabel(item: MediaCreditItem, lang: 'vi' | 'en' | 'zh'): string {
  const combined = `${item.title} ${item.sourceAuthor} ${item.titleEn || ''}`.toLowerCase();
  if (combined.includes('báo nhân dân') || combined.includes('nhan dan')) {
    return lang === 'en' ? 'Nhan Dan Newspaper' : lang === 'zh' ? '人民报' : 'Báo Nhân Dân';
  }
  if (combined.includes('thvl') || combined.includes('vĩnh long')) return 'THVL';
  if (combined.includes('brtgo')) return 'BRTgo · HTV';
  if (combined.includes('htv')) return 'HTV';
  if (combined.includes('vtv')) return 'VTV';
  if (combined.includes('wander')) return 'WANDER';
  if (combined.includes('quỳnh như') || combined.includes('quynh nhu')) return 'Quỳnh Như';
  if (combined.includes('yêu du lịch')) return 'Yêu Du Lịch VN';
  if (combined.includes('flycam') || combined.includes('aerial') || combined.includes('4k')) {
    return lang === 'en'
      ? '4K Aerial Archive'
      : lang === 'zh'
      ? '4K 航拍档案'
      : 'Flycam 4K · Tư liệu lịch sử';
  }
  return lang === 'en'
    ? 'Historical Documentary'
    : lang === 'zh'
    ? '历史文献纪录片'
    : 'Tư liệu lịch sử';
}

interface CartographicPlateProps {
  yearDisplay: string;
  archiveCode: string;
  accessionCode: string;
  lang: 'vi' | 'en' | 'zh';
}

/**
 * Warm Parchment Archival Cartographic Plate:
 * Ivory-vellum paper tone with crisp jade-teal (#3A665B) latitude/longitude graticule,
 * precision vector compass rose, cinnabar archival stamp seal, and geodesic coordinates.
 */
const AntiqueCartographicPlate: React.FC<CartographicPlateProps> = ({
  yearDisplay,
  archiveCode,
  accessionCode,
  lang,
}) => {
  const regionLabel =
    lang === 'en'
      ? 'SOUTHEAST VIETNAM SURVEY · 10°46′N 106°42′E'
      : lang === 'zh'
      ? '越南东南部历史测绘图 · 10°46′N 106°42′E'
      : 'TRẮC ĐỊA ĐÔNG NAM BỘ · 10°46′B 106°42′Đ';

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#F7F0E1] via-[#EFE3CC] to-[#E5D5B6] select-none overflow-hidden flex items-center justify-center">
      {/* Warm Parchment Graticule, Jade Meridian Lines, Neatline Frame & Vector Compass Rose */}
      <svg
        viewBox="0 0 480 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <radialGradient id="parchmentPlateGlow" cx="50%" cy="48%" r="68%">
            <stop offset="0%" stopColor="#FFFDF9" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#D8C39E" stopOpacity="0.34" />
          </radialGradient>
        </defs>
        <rect width="480" height="300" fill="url(#parchmentPlateGlow)" />

        {/* Fine Jade-Teal (#3A665B) Latitude & Longitude Graticule */}
        <g stroke="#3A665B" strokeOpacity="0.22" strokeWidth="0.65">
          {[48, 96, 144, 192, 240, 288, 336, 384, 432].map((x) => (
            <line key={`v-${x}`} x1={x} y1="14" x2={x} y2="286" />
          ))}
          {[50, 100, 150, 200, 250].map((y) => (
            <line key={`h-${y}`} x1="14" y1={y} x2="466" y2={y} />
          ))}
        </g>

        {/* Geodesic Triangulation Arcs & Crosshair */}
        <g fill="none" stroke="#3A665B" strokeOpacity="0.24" strokeWidth="0.75" strokeDasharray="3 4">
          <circle cx="240" cy="150" r="84" />
          <circle cx="240" cy="150" r="128" />
          <line x1="14" y1="150" x2="466" y2="150" />
          <line x1="240" y1="14" x2="240" y2="286" />
        </g>

        {/* Subtle Stylized River/Coastline Contour */}
        <path
          d="M28 228 C88 212, 132 184, 186 196 C236 206, 268 158, 326 168 C374 176, 412 146, 456 124"
          fill="none"
          stroke="#3A665B"
          strokeOpacity="0.26"
          strokeWidth="1.2"
          strokeDasharray="6 3"
        />

        {/* Double Archival Neatline Frame */}
        <rect
          x="10"
          y="10"
          width="460"
          height="280"
          fill="none"
          stroke="#3A665B"
          strokeOpacity="0.45"
          strokeWidth="1.1"
        />
        <rect
          x="15"
          y="15"
          width="450"
          height="270"
          fill="none"
          stroke="#8E6528"
          strokeOpacity="0.34"
          strokeWidth="0.65"
        />

        {/* Corner Registration Marks */}
        <g stroke="#3A665B" strokeOpacity="0.65" strokeWidth="1.1">
          <path d="M22 29 V22 H29" fill="none" />
          <path d="M458 29 V22 H451" fill="none" />
          <path d="M22 271 V278 H29" fill="none" />
          <path d="M458 271 V278 H451" fill="none" />
        </g>

        {/* Precision Engraved Vector Compass Rose (Top-Right) */}
        <g transform="translate(418 68)" fill="none">
          <circle cx="0" cy="0" r="25" stroke="#3A665B" strokeOpacity="0.42" strokeWidth="0.85" />
          <circle cx="0" cy="0" r="20" stroke="#8E6528" strokeOpacity="0.35" strokeWidth="0.65" strokeDasharray="2 2" />
          <path
            d="M0 -29 L4.5 -4.5 L29 0 L4.5 4.5 L0 29 L-4.5 4.5 L-29 0 L-4.5 -4.5 Z"
            stroke="#3A665B"
            strokeOpacity="0.8"
            strokeWidth="0.9"
            fill="#3A665B"
            fillOpacity="0.14"
          />
          <path
            d="M0 -29 L4.5 -4.5 L0 0 Z"
            fill="#A63A2B"
            fillOpacity="0.82"
          />
          <path
            d="M-14 -14 L-2.5 -2.5 M14 -14 L2.5 -2.5 M14 14 L2.5 2.5 M-14 14 L-2.5 2.5"
            stroke="#8E6528"
            strokeOpacity="0.58"
            strokeWidth="0.8"
          />
          <circle cx="0" cy="0" r="2.3" fill="#A63A2B" fillOpacity="0.9" />
          <text
            x="0"
            y="-32"
            textAnchor="middle"
            fill="#A63A2B"
            fontSize="8.5"
            fontWeight="700"
            fontFamily="serif"
            letterSpacing="1"
          >
            N
          </text>
        </g>
      </svg>

      {/* Top-Left Archival Seal Stamp */}
      <div className="absolute top-4 left-5 z-10 flex flex-col items-start gap-1">
        <span className="font-mono text-[9.5px] font-semibold tracking-[0.16em] uppercase text-[#3A665B]">
          {archiveCode}
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] border border-[#A63A2B]/55 bg-[#FFFDF9]/80 font-mono text-[9.5px] font-semibold tracking-[0.12em] text-[#A63A2B] tabular-nums shadow-[0_1px_2px_rgba(166,58,43,0.1)]">
          {accessionCode}
        </span>
      </div>

      {/* Central Monumental Chronology */}
      <div className="relative z-10 text-center px-6">
        <div className="inline-flex items-center gap-2.5 mb-1.5">
          <span className="w-7 h-[1px] bg-[#3A665B]/55" />
          <span className="font-mono text-[9.5px] font-semibold tracking-[0.2em] uppercase text-[#3A665B]">
            {lang === 'en'
              ? 'CARTOGRAPHIC PLATE'
              : lang === 'zh'
              ? '历史舆图底版'
              : 'ĐỒ BẢN LƯU TRỮ'}
          </span>
          <span className="w-7 h-[1px] bg-[#3A665B]/55" />
        </div>
        <div className="font-serif text-4xl sm:text-[42px] font-semibold text-[#1C1917] tracking-[0.04em] tabular-nums leading-none">
          {yearDisplay}
        </div>
      </div>

      {/* Bottom Geodesic Coordinate Bar */}
      <div className="absolute bottom-4 inset-x-5 z-10 flex items-center justify-between gap-2 text-[9px] font-mono font-medium tracking-[0.12em] text-[#3A665B]">
        <span className="truncate">{regionLabel}</span>
        <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
          <span className="w-4 h-[2px] bg-[#3A665B]/80" />
          <span className="w-4 h-[2px] bg-[#8E6528]/35" />
          <span className="w-4 h-[2px] bg-[#3A665B]/80" />
        </div>
      </div>
    </div>
  );
};

const MediaCreditsModalInner: React.FC<MediaCreditsModalProps> = ({
  isOpen,
  onClose,
  sites,
  initialSiteId = null,
  initialCategory = 'ALL',
  initialCreditId = null,
  initialAccessionCode = null,
  onOpenSiteDossier,
}) => {
  const { lang, setLang, getLocalizedSite } = useI18n();
  const credits = useMediaCredits();
  const { getSitePhoto } = useHeritageRealPhotos();

  const [activeCategory, setActiveCategory] = useState<FilterCategory>(initialCategory);
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSiteId || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scopePopoverOpen, setScopePopoverOpen] = useState<boolean>(false);
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [citationFormat, setCitationFormat] = useState<CitationFormat>('archival');
  const [failedPrimaryMedia, setFailedPrimaryMedia] = useState<Record<string, boolean>>({});
  const [lightboxItem, setLightboxItem] = useState<LightboxSpecimen | null>(null);
  const [lightboxZoomed, setLightboxZoomed] = useState<boolean>(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const scopeContainerRef = useRef<HTMLDivElement | null>(null);
  const scopeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isComposingRef = useRef<boolean>(false);

  useEffect(() => {
    setPlayingVideoId(null);
  }, [selectedCreditId, isOpen]);

  useEffect(() => {
    if (!copiedId) return;
    const timer = window.setTimeout(() => setCopiedId(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const siteInfoMap = useMemo(() => {
    const map = new Map<string, { code: string; name: string; site: HeritageSite }>();
    sites.forEach((site, idx) => {
      const loc = getLocalizedSite(site);
      const num = SITE_ID_TO_VIDEO_KEY[site.id] || String(idx + 1).padStart(2, '0');
      map.set(site.id, {
        code: num,
        name: loc.officialName,
        site,
      });
    });
    return map;
  }, [sites, getLocalizedSite]);

  // Deterministic archival accession codes (e.g., ARC-REG-MAP-01, ARC-01-IMG-01)
  const accessionCodeMap = useMemo(() => {
    const counts = new Map<string, number>();
    const totals = new Map<string, number>();

    const makeGroupKey = (item: MediaCreditItem) => {
      const siteCode =
        item.siteId === 'ALL' ? 'REG' : siteInfoMap.get(item.siteId)?.code || 'GEN';
      const catTag =
        item.category === 'image' ? 'IMG' : item.category === 'video' ? 'VID' : 'MAP';
      return `${siteCode}-${catTag}`;
    };

    credits.forEach((item) => {
      const key = makeGroupKey(item);
      totals.set(key, (totals.get(key) || 0) + 1);
    });

    const result = new Map<string, string>();
    credits.forEach((item) => {
      const key = makeGroupKey(item);
      const nextIdx = (counts.get(key) || 0) + 1;
      counts.set(key, nextIdx);
      const total = totals.get(key) || 1;
      const suffix = total > 1 ? `-${String(nextIdx).padStart(2, '0')}` : '';
      result.set(item.id, `ARC-${key}${suffix}`);
    });

    return result;
  }, [credits, siteInfoMap]);

  useEffect(() => {
    if (!isOpen) return;

    let targetCredit: MediaCreditItem | undefined;
    if (initialCreditId) {
      targetCredit = credits.find((c) => c.id === initialCreditId);
    }
    if (!targetCredit && initialAccessionCode) {
      const normalizedCode = initialAccessionCode.trim().toUpperCase();
      targetCredit = credits.find(
        (c) => (accessionCodeMap.get(c.id) || '').toUpperCase() === normalizedCode
      );
    }

    if (targetCredit) {
      setSelectedSiteId(targetCredit.siteId === 'ALL' ? 'ALL' : initialSiteId || targetCredit.siteId);
      setActiveCategory('ALL');
      setSelectedCreditId(targetCredit.id);
      window.requestAnimationFrame(() => {
        const container = listContainerRef.current;
        if (!container) return;
        const row = container.querySelector<HTMLElement>(
          `[data-credit-row="${CSS.escape(targetCredit!.id)}"]`
        );
        if (row) {
          row.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      });
    } else {
      setSelectedSiteId(initialSiteId || 'ALL');
      setActiveCategory(initialCategory || 'ALL');
      setSelectedCreditId(null);
    }

    setSearchQuery('');
    setScopePopoverOpen(false);
    setCopiedId(null);
    setLightboxItem(null);
    setLightboxZoomed(false);
    setMobileDrawerOpen(false);
  }, [isOpen, initialSiteId, initialCategory, initialCreditId, initialAccessionCode, credits, accessionCodeMap]);

  const getLocalizedField = useCallback(
    (item: MediaCreditItem, field: 'title' | 'sourceAuthor' | 'licenseNote'): string => {
      if (field === 'title') {
        if (lang === 'en') return item.titleEn || item.title;
        if (lang === 'zh') return item.titleZh || item.title;
        return item.title;
      }
      if (field === 'sourceAuthor') {
        if (lang === 'en') return item.sourceAuthorEn || item.sourceAuthor;
        if (lang === 'zh') return item.sourceAuthorZh || item.sourceAuthor;
        return item.sourceAuthor;
      }
      if (lang === 'en') return item.licenseNoteEn || item.licenseNote;
      if (lang === 'zh') return item.licenseNoteZh || item.licenseNote;
      return item.licenseNote;
    },
    [lang]
  );

  const getCategoryShortLabel = useCallback(
    (category: MediaCreditCategory): string => {
      if (category === 'image') {
        return lang === 'en' ? 'Photograph' : lang === 'zh' ? '影像' : 'Hình ảnh';
      }
      if (category === 'video') {
        return lang === 'en' ? 'Video' : lang === 'zh' ? '视频' : 'Video';
      }
      return lang === 'en' ? 'Map' : lang === 'zh' ? '舆图' : 'Bản đồ';
    },
    [lang]
  );

  const getCategoryDisplayName = useCallback(
    (category: MediaCreditCategory): string => {
      if (category === 'image') {
        return lang === 'en' ? 'Archival Photograph' : lang === 'zh' ? '档案影像' : 'Hình ảnh tư liệu';
      }
      if (category === 'video') {
        return lang === 'en' ? 'Documentary Video' : lang === 'zh' ? '专题影像视频' : 'Video tư liệu';
      }
      return lang === 'en' ? 'Historical Map & Archive' : lang === 'zh' ? '历史舆图与档案' : 'Bản đồ & Đồ bản cổ';
    },
    [lang]
  );

  const getCategoryTextColor = (category: MediaCreditCategory): string => {
    if (category === 'map_archive') return 'text-[#8E6528]';
    if (category === 'image') return 'text-[#3A665B]';
    return 'text-[#A63A2B]';
  };

  const getSiteDisplay = useCallback(
    (item: MediaCreditItem): string => {
      const siteInfo = siteInfoMap.get(item.siteId);
      if (siteInfo) {
        return `${siteInfo.code} · ${siteInfo.name}`;
      }
      return lang === 'en'
        ? 'Southeast Vietnam Regional Archive'
        : lang === 'zh'
        ? '越南东南部区域综合档案'
        : 'Lưu trữ Toàn vùng Đông Nam Bộ';
    },
    [siteInfoMap, lang]
  );

  const resolveSitePhotoFallback = useCallback(
    (targetSiteId: string, slot: 0 | 1 = 0): string | null => {
      const resolved = getSitePhoto(targetSiteId, slot);
      if (resolved) return resolved;
      const siteObj = siteInfoMap.get(targetSiteId)?.site;
      return siteObj?.photos?.[slot] || siteObj?.photos?.[0] || null;
    },
    [getSitePhoto, siteInfoMap]
  );

  /**
   * Resolves media strictly by archival category:
   * - image: exact slot photograph (0 or 1) of the monument
   * - video: YouTube frame (with monument photo fallback)
   * - map_archive: ONLY a true direct map image file if provided — otherwise renders the warm parchment cartographic plate
   */
  const resolveInspectorMedia = useCallback(
    (item: MediaCreditItem): { kind: 'photo' | 'video' | 'cartographic_plate'; src: string | null } => {
      const primaryFailed = Boolean(failedPrimaryMedia[item.id]);

      if (item.category === 'image') {
        if (item.siteId !== 'ALL') {
          const isSecondSlot =
            item.id.endsWith('-b') || item.id.includes('slot-1') || item.id.includes('slot2');
          const slotIndex: 0 | 1 = isSecondSlot ? 1 : 0;
          const slotPhoto = resolveSitePhotoFallback(item.siteId, slotIndex);
          if (slotPhoto && !primaryFailed) {
            return { kind: 'photo', src: slotPhoto };
          }
        }
        if (!primaryFailed && isDirectImageUrl(item.url)) {
          return { kind: 'photo', src: item.url || null };
        }
        if (item.siteId !== 'ALL') {
          const fallback = resolveSitePhotoFallback(item.siteId, 0);
          if (fallback && !primaryFailed) {
            return { kind: 'photo', src: fallback };
          }
        }
        return { kind: 'photo', src: null };
      }

      if (item.category === 'video') {
        const ytId = extractYouTubeVideoId(item.url);
        if (ytId && !primaryFailed) {
          return { kind: 'video', src: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` };
        }
        if (item.siteId !== 'ALL') {
          return { kind: 'video', src: resolveSitePhotoFallback(item.siteId, 0) };
        }
        return { kind: 'video', src: null };
      }

      if (!primaryFailed && isDirectImageUrl(item.url)) {
        return { kind: 'photo', src: item.url || null };
      }
      return { kind: 'cartographic_plate', src: null };
    },
    [failedPrimaryMedia, resolveSitePhotoFallback]
  );

  const buildCitation = useCallback(
    (
      item: MediaCreditItem,
      siteDisplay: string,
      accessionCode: string,
      format: CitationFormat
    ): string => {
      const title = getLocalizedField(item, 'title');
      const source = getLocalizedField(item, 'sourceAuthor');
      const year =
        item.yearOrPeriod ||
        (lang === 'en' ? 'n.d.' : lang === 'zh' ? '年代不详' : 'Khuyết niên đại');

      if (format === 'apa') {
        const mediaTag =
          item.category === 'video'
            ? lang === 'en'
              ? '[Documentary video]'
              : lang === 'zh'
              ? '[专题影像]'
              : '[Phim tư liệu]'
            : item.category === 'map_archive'
            ? lang === 'en'
              ? '[Archival map]'
              : lang === 'zh'
              ? '[历史舆图]'
              : '[Bản đồ lưu trữ]'
            : lang === 'en'
            ? '[Archival photograph]'
            : lang === 'zh'
            ? '[档案照片]'
            : '[Ảnh tư liệu]';

        return `${source} (${year}). ${title} ${mediaTag}. ${siteDisplay}. Dấu Ấn Việt 3D.${
          item.url ? ` ${item.url}` : ''
        }`;
      }

      if (lang === 'en') {
        return `${title} (${year}). Source: ${source}. Archival ID: ${accessionCode}. Digitized heritage archive at Dau An Viet 3D.`;
      }
      if (lang === 'zh') {
        return `${title}（${year}）。来源：${source}。档案编号：${accessionCode}。数字化保存于 Dấu Ấn Việt 3D 项目。`;
      }
      return `${title} (${year}). Nguồn: ${source}. Mã hồ sơ: ${accessionCode}. Lưu trữ số hóa tại Dự án 3D.`;
    },
    [getLocalizedField, lang]
  );

  const { regionalCount, siteCreditCountMap } = useMemo(() => {
    let regional = 0;
    const perSite = new Map<string, number>();
    credits.forEach((item) => {
      if (item.siteId === 'ALL') {
        regional += 1;
      } else {
        perSite.set(item.siteId, (perSite.get(item.siteId) || 0) + 1);
      }
    });
    return { regionalCount: regional, siteCreditCountMap: perSite };
  }, [credits]);

  const orderedScopeSites = useMemo(() => {
    return sites.map((site, idx) => {
      const info = siteInfoMap.get(site.id);
      return {
        id: site.id,
        code: info?.code || String(idx + 1).padStart(2, '0'),
        name: info?.name || site.officialName,
        count: siteCreditCountMap.get(site.id) || 0,
      };
    });
  }, [sites, siteInfoMap, siteCreditCountMap]);

  const activeScopeSummary = useMemo(() => {
    if (selectedSiteId === 'ALL') {
      return lang === 'en'
        ? `All · ${sites.length} monuments`
        : lang === 'zh'
        ? `全部 · ${sites.length} 处古迹`
        : `Toàn bộ · ${sites.length} di tích`;
    }
    if (selectedSiteId === 'REGIONAL') {
      return lang === 'en'
        ? 'Regional archive'
        : lang === 'zh'
        ? '区域综合档案'
        : 'Lưu trữ chung';
    }
    const info = siteInfoMap.get(selectedSiteId);
    if (info) {
      return `${info.code} · ${info.name}`;
    }
    return lang === 'en'
      ? `All · ${sites.length} monuments`
      : lang === 'zh'
      ? `全部 · ${sites.length} 处古迹`
      : `Toàn bộ · ${sites.length} di tích`;
  }, [selectedSiteId, sites.length, siteInfoMap, lang]);

  const categoryCounts = useMemo(() => {
    const scoped =
      selectedSiteId === 'ALL'
        ? credits
        : selectedSiteId === 'REGIONAL'
        ? credits.filter((c) => c.siteId === 'ALL')
        : credits.filter((c) => c.siteId === selectedSiteId);
    return {
      ALL: scoped.length,
      image: scoped.filter((c) => c.category === 'image').length,
      video: scoped.filter((c) => c.category === 'video').length,
      map_archive: scoped.filter((c) => c.category === 'map_archive').length,
    };
  }, [credits, selectedSiteId]);

  const filteredCredits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return credits.filter((item) => {
      if (activeCategory !== 'ALL' && item.category !== activeCategory) {
        return false;
      }
      if (selectedSiteId === 'REGIONAL') {
        if (item.siteId !== 'ALL') return false;
      } else if (selectedSiteId !== 'ALL') {
        if (item.siteId !== selectedSiteId) return false;
      }
      if (!q) return true;
      const siteInfo = siteInfoMap.get(item.siteId);
      const accession = accessionCodeMap.get(item.id) || '';
      const haystack = [
        accession,
        item.title,
        item.titleEn || '',
        item.titleZh || '',
        item.sourceAuthor,
        item.sourceAuthorEn || '',
        item.sourceAuthorZh || '',
        item.licenseNote,
        item.licenseNoteEn || '',
        item.licenseNoteZh || '',
        item.yearOrPeriod || '',
        siteInfo?.name || '',
        siteInfo?.code || '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [credits, activeCategory, selectedSiteId, searchQuery, siteInfoMap, accessionCodeMap]);

  const activeIndex = useMemo(() => {
    if (filteredCredits.length === 0) return -1;
    if (selectedCreditId) {
      const idx = filteredCredits.findIndex((c) => c.id === selectedCreditId);
      if (idx >= 0) return idx;
    }
    return 0;
  }, [filteredCredits, selectedCreditId]);

  const activeItem = activeIndex >= 0 ? filteredCredits[activeIndex] : null;

  useEffect(() => {
    if (filteredCredits.length === 0) {
      if (selectedCreditId !== null) setSelectedCreditId(null);
      return;
    }
    if (!selectedCreditId || !filteredCredits.some((c) => c.id === selectedCreditId)) {
      setSelectedCreditId(filteredCredits[0].id);
    }
  }, [filteredCredits, selectedCreditId]);

  // All inspectable photo specimens in current filter (for Lightbox Prev/Next browsing)
  const lightboxableItems = useMemo(() => {
    return filteredCredits
      .map((item) => {
        const media = resolveInspectorMedia(item);
        if (media.kind !== 'photo' || !media.src) return null;
        const accessionCode = accessionCodeMap.get(item.id) || 'ARC';
        const siteInfo = siteInfoMap.get(item.siteId);
        const siteDisplay = getSiteDisplay(item);
        return {
          id: item.id,
          src: media.src,
          accessionCode,
          yearDisplay: extractChronologyDisplay(item, siteInfo?.site, lang),
          title: getLocalizedField(item, 'title'),
          siteDisplay,
          sourceAuthor: getLocalizedField(item, 'sourceAuthor'),
          licenseNote: getLocalizedField(item, 'licenseNote'),
          url: item.url,
          citation: buildCitation(item, siteDisplay, accessionCode, citationFormat),
        } as LightboxSpecimen;
      })
      .filter((x): x is LightboxSpecimen => x !== null);
  }, [
    filteredCredits,
    resolveInspectorMedia,
    accessionCodeMap,
    siteInfoMap,
    getSiteDisplay,
    lang,
    getLocalizedField,
    buildCitation,
    citationFormat,
  ]);

  const scrollItemIntoView = useCallback((creditId: string) => {
    const container = listContainerRef.current;
    if (!container) return;
    const row = container.querySelector<HTMLElement>(`[data-credit-row="${CSS.escape(creditId)}"]`);
    if (row) {
      row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, []);

  const stepActiveItem = useCallback(
    (delta: -1 | 1) => {
      if (filteredCredits.length === 0 || activeIndex < 0) return;
      const nextIdx = Math.min(Math.max(activeIndex + delta, 0), filteredCredits.length - 1);
      if (nextIdx === activeIndex) return;
      const nextItem = filteredCredits[nextIdx];
      setSelectedCreditId(nextItem.id);
      scrollItemIntoView(nextItem.id);
    },
    [filteredCredits, activeIndex, scrollItemIntoView]
  );

  const stepLightboxItem = useCallback(
    (delta: -1 | 1) => {
      if (!lightboxItem || lightboxableItems.length <= 1) return;
      const currentIdx = lightboxableItems.findIndex((x) => x.id === lightboxItem.id);
      if (currentIdx < 0) return;
      const nextIdx = (currentIdx + delta + lightboxableItems.length) % lightboxableItems.length;
      const nextSpecimen = lightboxableItems[nextIdx];
      setLightboxItem(nextSpecimen);
      setLightboxZoomed(false);
      setSelectedCreditId(nextSpecimen.id);
      scrollItemIntoView(nextSpecimen.id);
    },
    [lightboxItem, lightboxableItems, scrollItemIntoView]
  );

  // Close Scope Popover when clicking outside its container
  useEffect(() => {
    if (!scopePopoverOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        scopeContainerRef.current &&
        !scopeContainerRef.current.contains(e.target as Node)
      ) {
        setScopePopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [scopePopoverOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      // Protect Vietnamese (Telex/VNI) and Chinese/CJK IME composition
      if (isImeKeyEvent(e) || isComposingRef.current) return;

      const target = e.target as HTMLElement | null;
      const isTypingField =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (e.key === 'Escape') {
        if (scopePopoverOpen) {
          e.preventDefault();
          e.stopPropagation();
          setScopePopoverOpen(false);
          scopeTriggerRef.current?.focus();
          return;
        }
        if (lightboxItem) {
          setLightboxItem(null);
          setLightboxZoomed(false);
        } else if (mobileDrawerOpen) {
          setMobileDrawerOpen(false);
        } else {
          onClose();
        }
        return;
      }

      if (lightboxItem) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          stepLightboxItem(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          stepLightboxItem(1);
        }
        return;
      }

      if (isTypingField) return;

      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setScopePopoverOpen(false);
        searchInputRef.current?.focus();
        return;
      }

      if (scopePopoverOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        stepActiveItem(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        stepActiveItem(-1);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [
    isOpen,
    scopePopoverOpen,
    lightboxItem,
    mobileDrawerOpen,
    onClose,
    stepActiveItem,
    stepLightboxItem,
  ]);

  if (!isOpen) return null;

  const categoryTabs: Array<{
    id: FilterCategory;
    label: string;
    count: number;
  }> = [
    {
      id: 'ALL',
      label: lang === 'en' ? 'All' : lang === 'zh' ? '全部' : 'Tất cả',
      count: categoryCounts.ALL,
    },
    {
      id: 'image',
      label: lang === 'en' ? 'Images' : lang === 'zh' ? '影像' : 'Hình ảnh',
      count: categoryCounts.image,
    },
    {
      id: 'video',
      label: lang === 'en' ? 'Video' : lang === 'zh' ? '视频' : 'Video',
      count: categoryCounts.video,
    },
    {
      id: 'map_archive',
      label: lang === 'en' ? 'Maps' : lang === 'zh' ? '舆图' : 'Bản đồ',
      count: categoryCounts.map_archive,
    },
  ];

  const handleCopyCitation = async (itemId: string, citationText: string) => {
    const ok = await copyTextToClipboard(citationText);
    if (ok) {
      setCopiedId(itemId);
    }
  };

  const handleSelectRow = (itemId: string, openMobileSheet: boolean) => {
    setSelectedCreditId(itemId);
    if (openMobileSheet) {
      setMobileDrawerOpen(true);
    }
  };

  const renderInspectorPanel = (item: MediaCreditItem, isMobileSheet = false) => {
    const accessionCode = accessionCodeMap.get(item.id) || 'ARC';
    const siteInfo = siteInfoMap.get(item.siteId);
    const linkedSite = siteInfo?.site;
    const siteDisplay = getSiteDisplay(item);
    const title = getLocalizedField(item, 'title');
    const sourceAuthor = getLocalizedField(item, 'sourceAuthor');
    const licenseNote = getLocalizedField(item, 'licenseNote');
    const yearDisplay = extractChronologyDisplay(item, linkedSite, lang);
    const media = resolveInspectorMedia(item);
    const citationText = buildCitation(item, siteDisplay, accessionCode, citationFormat);
    const isCopied = copiedId === item.id;

    const openLightbox = () => {
      if (media.kind !== 'photo' || !media.src) return;
      setLightboxZoomed(false);
      setLightboxItem({
        id: item.id,
        src: media.src,
        accessionCode,
        yearDisplay,
        title,
        siteDisplay,
        sourceAuthor,
        licenseNote,
        url: item.url,
        citation: citationText,
      });
    };

    const canPrev = activeIndex > 0;
    const canNext = activeIndex >= 0 && activeIndex < filteredCredits.length - 1;
    const positionLabel =
      filteredCredits.length > 0
        ? `${String(activeIndex + 1).padStart(2, '0')} / ${String(filteredCredits.length).padStart(2, '0')}`
        : '00 / 00';

    return (
      <div className="bg-[#FFFDF9] border border-[#DCD2C0] rounded-xl shadow-[0_6px_24px_rgba(28,25,23,0.06)] p-4 sm:p-5 flex flex-col justify-between min-h-full gap-4">
        <div>
          {/* Top Dossier Header Strip */}
          {!isMobileSheet && (
            <div className="flex items-center justify-between gap-2 pb-3 mb-3.5 border-b border-[#1C1917]/10">
              <div className="flex items-center gap-2 min-w-0 text-[10.5px] tracking-[0.16em] uppercase">
                <span className="text-[#A63A2B] font-semibold whitespace-nowrap">
                  {lang === 'en'
                    ? 'Archival Dossier'
                    : lang === 'zh'
                    ? '档案考据卡片'
                    : 'Phiếu khảo cứu tư liệu'}
                </span>
                <span className="text-[#1C1917]/25" aria-hidden="true">
                  ·
                </span>
                <span className="font-mono tabular-nums text-[#5C5349] whitespace-nowrap">
                  {positionLabel}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={!canPrev}
                  onClick={() => stepActiveItem(-1)}
                  aria-label={
                    lang === 'en' ? 'Previous record' : lang === 'zh' ? '上一条记录' : 'Mục tư liệu trước'
                  }
                  className="w-7 h-7 rounded-md border border-[#DCD2C0] bg-[#FAF6EE] hover:border-[#C9A46A] hover:bg-[#FFFFFF] disabled:opacity-35 disabled:cursor-not-allowed text-[#5C5349] hover:text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => stepActiveItem(1)}
                  aria-label={
                    lang === 'en' ? 'Next record' : lang === 'zh' ? '下一条记录' : 'Mục tư liệu kế tiếp'
                  }
                  className="w-7 h-7 rounded-md border border-[#DCD2C0] bg-[#FAF6EE] hover:border-[#C9A46A] hover:bg-[#FFFFFF] disabled:opacity-35 disabled:cursor-not-allowed text-[#5C5349] hover:text-[#1C1917] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          )}

          {/* Exhibition Specimen Frame (16:10) */}
          <div className="aspect-[16/10] w-full rounded-lg overflow-hidden border border-[#DCD2C0] bg-[#EFE9DC] relative mb-4 group">
            {media.kind === 'cartographic_plate' ? (
              <AntiqueCartographicPlate
                yearDisplay={yearDisplay}
                archiveCode={extractArchiveCodeLabel(item, lang)}
                accessionCode={accessionCode}
                lang={lang}
              />
            ) : media.kind === 'video' ? (
              (() => {
                const ytId = extractYouTubeVideoId(item.url);
                const isPlayingInline = Boolean(ytId && playingVideoId === item.id);
                if (isPlayingInline && ytId) {
                  return (
                    <div className="relative w-full h-full bg-[#1C1917]">
                      <iframe
                        key={`credit-yt-${item.id}-${ytId}`}
                        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                        title={title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  );
                }
                return (
                  <div className="relative w-full h-full bg-[#1C1917]">
                    {media.src ? (
                      <img
                        src={media.src}
                        alt={title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          if (media.src && advanceHeritageImgFallback(e.currentTarget, media.src)) {
                            return;
                          }
                          if (!failedPrimaryMedia[item.id]) {
                            setFailedPrimaryMedia((prev) => ({ ...prev, [item.id]: true }));
                          }
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#2B2623] to-[#1C1917]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/85 via-[#1C1917]/25 to-transparent" />

                    {ytId ? (
                      <button
                        type="button"
                        onClick={() => setPlayingVideoId(item.id)}
                        aria-label={
                          lang === 'en'
                            ? `Play archival video inline: ${title}`
                            : lang === 'zh'
                            ? `直接播放档案视频：${title}`
                            : `Phát trực tiếp video tư liệu: ${title}`
                        }
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      >
                        <span className="w-13 h-13 rounded-full border border-[#FFFDF9]/80 bg-[#A63A2B]/90 hover:bg-[#A63A2B] backdrop-blur-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-[0_8px_22px_rgba(28,25,23,0.45)]">
                          <Play
                            className="w-5 h-5 text-[#FFFDF9] translate-x-[1.5px]"
                            strokeWidth={1.7}
                          />
                        </span>
                      </button>
                    ) : item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={
                          lang === 'en'
                            ? `Watch archival video: ${title}`
                            : lang === 'zh'
                            ? `播放档案视频：${title}`
                            : `Mở video tư liệu: ${title}`
                        }
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <span className="w-13 h-13 rounded-full border border-[#FFFDF9]/80 bg-[#A63A2B]/90 hover:bg-[#A63A2B] backdrop-blur-sm flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shadow-[0_8px_22px_rgba(28,25,23,0.45)]">
                          <Play
                            className="w-5 h-5 text-[#FFFDF9] translate-x-[1.5px]"
                            strokeWidth={1.7}
                          />
                        </span>
                      </a>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="w-13 h-13 rounded-full border border-[#FFFDF9]/70 bg-[#1C1917]/70 flex items-center justify-center">
                          <Play
                            className="w-5 h-5 text-[#FFFDF9] translate-x-[1.5px]"
                            strokeWidth={1.7}
                          />
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2 text-[10.5px] font-mono tracking-[0.1em] uppercase text-[#FFFDF9]/95 pointer-events-none">
                      <span className="truncate">{extractVideoChannelLabel(item, lang)}</span>
                      {item.yearOrPeriod && (
                        <span className="text-[#F3DFB8] tabular-nums shrink-0">
                          {item.yearOrPeriod}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : media.src ? (
              <div className="relative w-full h-full bg-[#EFE9DC]">
                <img
                  src={media.src}
                  alt={title}
                  referrerPolicy="no-referrer"
                  onClick={openLightbox}
                  onError={(e) => {
                    if (media.src && advanceHeritageImgFallback(e.currentTarget, media.src)) {
                      return;
                    }
                    if (!failedPrimaryMedia[item.id]) {
                      setFailedPrimaryMedia((prev) => ({ ...prev, [item.id]: true }));
                    }
                  }}
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-[1.02]"
                />

                {/* Subtle museum mat inner border */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-2 border border-[#FFFDF9]/35 rounded-[4px]"
                />

                {/* Zoom / Enlarge button */}
                <button
                  type="button"
                  onClick={openLightbox}
                  aria-label={
                    lang === 'en'
                      ? 'Enlarge image fullscreen'
                      : lang === 'zh'
                      ? '全屏放大查看影像'
                      : 'Phóng to ảnh toàn màn hình'
                  }
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF9]/92 hover:bg-[#FFFFFF] border border-[#D8CEBC] hover:border-[#A63A2B] text-[11px] font-medium text-[#1C1917] hover:text-[#A63A2B] shadow-[0_4px_12px_rgba(28,25,23,0.18)] backdrop-blur-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.7} />
                  <span>
                    {lang === 'en' ? 'Enlarge' : lang === 'zh' ? '放大细览' : 'Phóng to'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#F6F1E7] to-[#EAE1CE]">
                <span className="font-mono text-[10.5px] font-semibold tracking-[0.16em] text-[#A63A2B] uppercase">
                  {accessionCode}
                </span>
                <p className="mt-2 font-serif text-base text-[#1C1917] max-w-xs leading-snug">
                  {title}
                </p>
              </div>
            )}
          </div>

          {/* Full Monograph Serif Title */}
          <h3 className="text-[18px] sm:text-[19px] font-serif font-semibold text-[#1C1917] leading-snug text-balance">
            {title}
          </h3>

          {/* Structured 2-Column Archival Provenance Grid */}
          <dl className="mt-4 py-3.5 border-y border-[#1C1917]/10 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            <div className="min-w-0">
              <dt className="text-[10.5px] uppercase tracking-[0.1em] text-[#7A6F63] font-medium">
                {lang === 'en' ? 'Archival Code' : lang === 'zh' ? '档案编号' : 'Mã ký hiệu'}
              </dt>
              <dd className="mt-0.5 font-mono text-[12px] font-semibold text-[#8C3B2B] tabular-nums break-all">
                {accessionCode}
              </dd>
            </div>

            <div className="min-w-0">
              <dt className="text-[10.5px] uppercase tracking-[0.1em] text-[#7A6F63] font-medium">
                {lang === 'en' ? 'Chronology' : lang === 'zh' ? '年代 / 时长' : 'Niên đại'}
              </dt>
              <dd className="mt-0.5 font-serif text-[14px] font-semibold text-[#1C1917] tabular-nums">
                {item.yearOrPeriod || yearDisplay}
              </dd>
            </div>

            <div className="min-w-0">
              <dt className="text-[10.5px] uppercase tracking-[0.1em] text-[#7A6F63] font-medium">
                {lang === 'en' ? 'Category' : lang === 'zh' ? '文献分类' : 'Phân loại'}
              </dt>
              <dd className={`mt-0.5 font-medium ${getCategoryTextColor(item.category)}`}>
                {getCategoryDisplayName(item.category)}
              </dd>
            </div>

            <div className="min-w-0">
              <dt className="text-[10.5px] uppercase tracking-[0.1em] text-[#7A6F63] font-medium">
                {lang === 'en'
                  ? 'Repository / Source'
                  : lang === 'zh'
                  ? '馆藏机构 / 来源'
                  : 'Cơ quan / Nguồn lưu trữ'}
              </dt>
              <dd className="mt-0.5 text-[#1C1917] leading-snug break-words">{sourceAuthor}</dd>
            </div>

            <div className="col-span-2 pt-2 border-t border-[#1C1917]/[0.07] min-w-0">
              <dt className="text-[10.5px] uppercase tracking-[0.1em] text-[#7A6F63] font-medium">
                {lang === 'en' ? 'Associated Monument' : lang === 'zh' ? '所属文化遗产' : 'Thuộc di tích'}
              </dt>
              <dd className="mt-0.5 text-[13px] font-medium text-[#1C1917] leading-snug break-words">
                {siteDisplay}
              </dd>
            </div>

            {licenseNote && (
              <div className="col-span-2 pt-2 border-t border-[#1C1917]/[0.07] min-w-0 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <dt className="text-[10.5px] uppercase tracking-[0.1em] text-[#7A6F63] font-medium">
                    {lang === 'en'
                      ? 'Rights & Attribution'
                      : lang === 'zh'
                      ? '版权与使用说明'
                      : 'Bản quyền & Ghi nguồn'}
                  </dt>
                  <dd className="mt-0.5 text-[#5C5349] leading-relaxed break-words">{licenseNote}</dd>
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#A63A2B] hover:text-[#7E291D] underline underline-offset-4 whitespace-nowrap"
                  >
                    <span>
                      {lang === 'en' ? 'Source' : lang === 'zh' ? '原出处' : 'Liên kết gốc'}
                    </span>
                    <ArrowUpRight className="w-3 h-3" strokeWidth={2} />
                  </a>
                )}
              </div>
            )}
          </dl>

          {/* Academic Citation Box */}
          <div className="mt-3.5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-medium text-[#5C5349]">
                {lang === 'en'
                  ? 'Academic Citation'
                  : lang === 'zh'
                  ? '标准学术引用'
                  : 'Trích dẫn chuẩn học thuật'}
              </span>
              <div
                role="group"
                aria-label={
                  lang === 'en' ? 'Citation format' : lang === 'zh' ? '引文格式' : 'Định dạng trích dẫn'
                }
                className="inline-flex items-center rounded-md bg-[#ECE5D6] p-0.5 text-[10.5px]"
              >
                <button
                  type="button"
                  onClick={() => setCitationFormat('archival')}
                  className={`px-2 py-0.5 rounded-[4px] transition-colors cursor-pointer whitespace-nowrap ${
                    citationFormat === 'archival'
                      ? 'bg-[#FFFDF9] text-[#1C1917] font-medium shadow-xs'
                      : 'text-[#5C5349] hover:text-[#1C1917]'
                  }`}
                >
                  {lang === 'en' ? 'Archival' : lang === 'zh' ? '馆藏体例' : 'Lưu trữ'}
                </button>
                <button
                  type="button"
                  onClick={() => setCitationFormat('apa')}
                  className={`px-2 py-0.5 rounded-[4px] transition-colors cursor-pointer whitespace-nowrap ${
                    citationFormat === 'apa'
                      ? 'bg-[#FFFDF9] text-[#1C1917] font-medium shadow-xs'
                      : 'text-[#5C5349] hover:text-[#1C1917]'
                  }`}
                >
                  APA 7
                </button>
              </div>
            </div>
            <div className="bg-[#F6F1E7] border border-[#E2D8C5] rounded-lg px-3 py-2.5 text-[11.5px] text-[#433C35] italic leading-relaxed select-all break-words">
              {citationText}
            </div>
          </div>
        </div>

        {/* Bottom Practical Action Buttons */}
        <div
          className={`flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#1C1917]/10 ${
            isMobileSheet ? 'pb-1' : ''
          }`}
        >
          {/* 1. Copy Academic Citation */}
          <button
            type="button"
            onClick={() => void handleCopyCitation(item.id, citationText)}
            className={`flex-1 min-w-[144px] min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap border ${
              isCopied
                ? 'bg-[#3A665B] border-[#3A665B] text-[#FFFDF9]'
                : 'bg-[#FAF6EE] border-[#D5CBB8] text-[#1C1917] hover:bg-[#FFFFFF] hover:border-[#C9A46A]'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
                <span>
                  {lang === 'en' ? 'Copied' : lang === 'zh' ? '已复制' : 'Đã sao chép'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 shrink-0 text-[#A63A2B]" strokeWidth={1.7} />
                <span>
                  {lang === 'en'
                    ? 'Copy citation'
                    : lang === 'zh'
                    ? '复制学术引文'
                    : 'Sao chép trích dẫn'}
                </span>
              </>
            )}
          </button>

          {/* 2. View Corresponding Heritage Monument OR Prev/Next Archive Record Navigation */}
          {linkedSite && onOpenSiteDossier ? (
            <button
              type="button"
              onClick={() => {
                setMobileDrawerOpen(false);
                onClose();
                onOpenSiteDossier(linkedSite);
              }}
              className="flex-1 min-w-[156px] min-h-[40px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#A63A2B] hover:bg-[#8C3023] text-[#FFFDF9] text-xs font-semibold shadow-[0_4px_12px_rgba(166,58,43,0.22)] transition-all duration-200 cursor-pointer whitespace-nowrap group"
            >
              <span>
                {lang === 'en'
                  ? 'View monument'
                  : lang === 'zh'
                  ? '查看对应古迹'
                  : 'Xem di tích tương ứng'}
              </span>
              <ArrowRight
                className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={!canPrev}
                onClick={() => stepActiveItem(-1)}
                aria-label={
                  lang === 'en' ? 'Previous record' : lang === 'zh' ? '上一条记录' : 'Bản ghi trước'
                }
                className="min-h-[40px] px-3 rounded-xl border border-[#D5CBB8] bg-[#FAF6EE] hover:bg-[#FFFFFF] hover:border-[#C9A46A] disabled:opacity-35 disabled:cursor-not-allowed text-xs font-medium text-[#1C1917] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              >
                <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>{lang === 'en' ? 'Prev' : lang === 'zh' ? '上一条' : 'Trước'}</span>
              </button>
              <button
                type="button"
                disabled={!canNext}
                onClick={() => stepActiveItem(1)}
                aria-label={
                  lang === 'en' ? 'Next record' : lang === 'zh' ? '下一条记录' : 'Bản ghi sau'
                }
                className="min-h-[40px] px-3 rounded-xl border border-[#D5CBB8] bg-[#FAF6EE] hover:bg-[#FFFFFF] hover:border-[#C9A46A] disabled:opacity-35 disabled:cursor-not-allowed text-xs font-medium text-[#1C1917] inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>{lang === 'en' ? 'Next' : lang === 'zh' ? '下一条' : 'Sau'}</span>
                <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.8} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const lightboxIndex = lightboxItem
    ? lightboxableItems.findIndex((x) => x.id === lightboxItem.id)
    : -1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={
        lang === 'en'
          ? 'Archival Sources and Copyright Registry'
          : lang === 'zh'
          ? '文献资料与版权目录'
          : 'Nguồn Tư liệu & Bản quyền'
      }
      onClick={onClose}
      className="fixed inset-0 z-[1300] bg-[#1C1917]/55 backdrop-blur-md flex items-center justify-center p-2 sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-6xl w-full h-[92vh] sm:h-[88vh] bg-[#F6F1E7] border border-[#D8CEBC] ring-1 ring-inset ring-white/75 rounded-2xl shadow-[0_28px_84px_rgba(28,25,23,0.32)] flex flex-col overflow-hidden text-[#1C1917] animate-archival-modal"
      >
        {/* Architectural Double Hairline Crown */}
        <div aria-hidden="true" className="w-full shrink-0 flex flex-col">
          <div className="h-[2.5px] w-full bg-[#A63A2B]" />
          <div className="h-[1px] w-full bg-[#F6F1E7]" />
          <div className="h-[1px] w-full bg-[#C9A46A]/65" />
        </div>

        {/* ================================================================
            1. EDITORIAL MUSEUM HEADER
           ================================================================ */}
        <header className="px-5 sm:px-7 py-4 bg-[#FAF6EE] border-b border-[#1C1917]/10 flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <p className="text-[10.5px] tracking-[0.2em] text-[#A63A2B] uppercase font-semibold truncate">
              {lang === 'en'
                ? 'HERITAGE ARCHIVAL ANNEX'
                : lang === 'zh'
                ? '文化遗产档案附录'
                : 'PHỤ LỤC LƯU TRỮ DI SẢN'}
            </p>
            <h2 className="mt-0.5 text-xl sm:text-2xl md:text-[28px] font-serif font-semibold text-[#1C1917] tracking-tight leading-tight">
              {lang === 'en'
                ? 'Archival Sources & Copyright'
                : lang === 'zh'
                ? '文献资料与版权目录'
                : 'Nguồn Tư liệu & Bản quyền'}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Compact Sliding Language Switcher (VI | EN | ZH) */}
            <div
              role="group"
              aria-label="Language"
              className="inline-flex items-center rounded-full bg-[#ECE5D6] p-0.5 border border-[#DDD3C0] text-[11px] font-semibold tracking-[0.08em] uppercase"
            >
              {(['vi', 'en', 'zh'] as const).map((code) => {
                const active = lang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    className={`px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer ${
                      active
                        ? 'bg-[#FFFDF9] text-[#A63A2B] shadow-[0_1px_3px_rgba(28,25,23,0.12)]'
                        : 'text-[#5C5349] hover:text-[#1C1917]'
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>

            {/* Circular Hairline Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label={
                lang === 'en'
                  ? 'Close archival sources'
                  : lang === 'zh'
                  ? '关闭文献资料目录'
                  : 'Đóng cửa sổ nguồn tư liệu'
              }
              className="w-9 h-9 rounded-full border border-[#D8CEBC] bg-[#FFFDF9] hover:border-[#A63A2B] hover:text-[#A63A2B] text-[#5C5349] flex items-center justify-center transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A46A]/50"
            >
              <X className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>
        </header>

        {/* ================================================================
            2. LAYERED CONTROL & FILTER TOOLBAR
           ================================================================ */}
        <div className="relative z-30 px-5 sm:px-7 py-3 bg-[#F6F1E7] border-b border-[#1C1917]/10 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            {/* Left: Segmented Control on #ECE5D6 */}
            <nav
              role="tablist"
              aria-label={
                lang === 'en'
                  ? 'Archive categories'
                  : lang === 'zh'
                  ? '档案分类'
                  : 'Phân loại tư liệu'
              }
              className="inline-flex items-center flex-nowrap overflow-x-auto heritage-scrollbar bg-[#ECE5D6] p-1 rounded-xl border border-[#DFD5C2] gap-1 self-start max-w-full"
            >
              {categoryTabs.map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`relative shrink-0 px-3 sm:px-3.5 py-1.5 rounded-lg text-[12.5px] transition-all duration-150 cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[#FFFDF9] text-[#1C1917] font-semibold shadow-[0_1px_4px_rgba(28,25,23,0.09)]'
                        : 'text-[#5C5349] font-medium hover:text-[#1C1917]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        isActive ? 'text-[#A63A2B] font-semibold' : 'text-[#7A6F63]'
                      }`}
                    >
                      {tab.count}
                    </span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-2.5 right-2.5 bottom-0 h-[2px] rounded-full bg-[#A63A2B]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Unified Editorial Archival Index Bar (Scope Popover + Minimalist Search) */}
            <div
              className={`group relative flex flex-col sm:flex-row sm:items-stretch w-full lg:w-[500px] xl:w-[548px] shrink-0 rounded-[3px] bg-[#FFFDF9] border transition-colors duration-150 ${
                scopePopoverOpen
                  ? 'border-[#1C1917]'
                  : 'border-[#D4C9B6] hover:border-[#BEB098] focus-within:border-[#1C1917]'
              }`}
            >
              {/* Crisp 2px Cinnabar Bottom Hairline Accent on Focus / Popover Open */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -bottom-[1px] left-0 right-0 h-[2px] bg-[#A63A2B] origin-left transition-transform duration-200 ease-out ${
                  scopePopoverOpen
                    ? 'scale-x-100'
                    : 'scale-x-0 group-focus-within:scale-x-100'
                }`}
              />

              {/* Left Compartment: Custom Scope Popover Filter (Zero Landmark Icon, Zero Pill) */}
              <div
                ref={scopeContainerRef}
                className="relative sm:w-[45%] sm:min-w-[214px] shrink-0"
              >
                <button
                  ref={scopeTriggerRef}
                  type="button"
                  onClick={() => setScopePopoverOpen((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (isImeKeyEvent(e)) return;
                    if (e.key === 'Escape' && scopePopoverOpen) {
                      e.preventDefault();
                      e.stopPropagation();
                      setScopePopoverOpen(false);
                    }
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={scopePopoverOpen}
                  aria-label={
                    lang === 'en'
                      ? 'Filter archival scope by monument'
                      : lang === 'zh'
                      ? '按古迹范围筛选文献'
                      : 'Lọc phạm vi tư liệu theo di tích'
                  }
                  className="w-full h-10 sm:h-9 px-3 flex items-center justify-between gap-2 text-left bg-transparent focus:outline-none cursor-pointer"
                >
                  <span className="flex items-baseline gap-2 min-w-0">
                    <span className="font-mono text-[9.5px] font-medium tracking-[0.14em] uppercase text-[#8A7F73] shrink-0 select-none">
                      {lang === 'en' ? 'SCOPE' : lang === 'zh' ? '范围' : 'PHẠM VI'}
                    </span>
                    <span className="text-[12.5px] font-medium text-[#1C1917] truncate">
                      {activeScopeSummary}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8A7F73] shrink-0 transition-transform duration-200 ${
                      scopePopoverOpen ? 'rotate-180 text-[#1C1917]' : ''
                    }`}
                    strokeWidth={1.5}
                  />
                </button>

                {/* Custom Archival Scope Popover */}
                {scopePopoverOpen && (
                  <div
                    role="listbox"
                    aria-label={
                      lang === 'en'
                        ? 'Archival scope options'
                        : lang === 'zh'
                        ? '文献检索范围选项'
                        : 'Danh sách phạm vi lưu trữ'
                    }
                    className="absolute left-0 top-full mt-1.5 z-[60] w-full sm:w-[348px] bg-[#FFFDF9] border border-[#CBBFA9] rounded-[3px] shadow-[0_12px_32px_rgba(28,25,23,0.12),0_2px_6px_rgba(28,25,23,0.06)] overflow-hidden"
                  >
                    {/* Group 1: Global & Regional Archive Scope */}
                    <div className="py-1.5">
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedSiteId === 'ALL'}
                        onClick={() => {
                          setSelectedSiteId('ALL');
                          setScopePopoverOpen(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                          selectedSiteId === 'ALL'
                            ? 'bg-[#F6F1E7] text-[#1C1917] font-semibold'
                            : 'text-[#3B352E] hover:bg-[#FAF6EE] hover:text-[#1C1917]'
                        }`}
                      >
                        <span className="w-2.5 flex items-center justify-center shrink-0">
                          {selectedSiteId === 'ALL' && (
                            <span
                              aria-hidden="true"
                              className="w-1.5 h-1.5 rounded-full bg-[#A63A2B]"
                            />
                          )}
                        </span>
                        <span className="flex-1 min-w-0 text-[12.5px] truncate">
                          {lang === 'en'
                            ? 'All archival records'
                            : lang === 'zh'
                            ? '全部馆藏文献'
                            : 'Tất cả tư liệu'}
                        </span>
                        <span
                          className={`font-mono text-[11px] tabular-nums shrink-0 ${
                            selectedSiteId === 'ALL'
                              ? 'text-[#A63A2B] font-semibold'
                              : 'text-[#8A7F73]'
                          }`}
                        >
                          {credits.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedSiteId === 'REGIONAL'}
                        onClick={() => {
                          setSelectedSiteId('REGIONAL');
                          setScopePopoverOpen(false);
                        }}
                        className={`w-full px-3 py-2 flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                          selectedSiteId === 'REGIONAL'
                            ? 'bg-[#F6F1E7] text-[#1C1917] font-semibold'
                            : 'text-[#3B352E] hover:bg-[#FAF6EE] hover:text-[#1C1917]'
                        }`}
                      >
                        <span className="w-2.5 flex items-center justify-center shrink-0">
                          {selectedSiteId === 'REGIONAL' && (
                            <span
                              aria-hidden="true"
                              className="w-1.5 h-1.5 rounded-full bg-[#A63A2B]"
                            />
                          )}
                        </span>
                        <span className="flex-1 min-w-0 text-[12.5px] truncate">
                          {lang === 'en'
                            ? 'Regional general archive'
                            : lang === 'zh'
                            ? '区域综合通用档案'
                            : 'Lưu trữ chung toàn vùng'}
                        </span>
                        <span
                          className={`font-mono text-[11px] tabular-nums shrink-0 ${
                            selectedSiteId === 'REGIONAL'
                              ? 'text-[#A63A2B] font-semibold'
                              : 'text-[#8A7F73]'
                          }`}
                        >
                          {regionalCount}
                        </span>
                      </button>
                    </div>

                    {/* Hairline Separator */}
                    <div className="border-t border-[#E2D9C8]" />

                    {/* Group 2: Numbered 01–17 Monuments */}
                    <div className="max-h-[284px] overflow-y-auto heritage-scrollbar py-1.5">
                      {orderedScopeSites.map((entry) => {
                        const isSelected = selectedSiteId === entry.id;
                        return (
                          <button
                            key={entry.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedSiteId(entry.id);
                              setScopePopoverOpen(false);
                            }}
                            className={`w-full px-3 py-1.5 flex items-center gap-2.5 text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#F6F1E7] text-[#1C1917] font-semibold'
                                : 'text-[#3B352E] hover:bg-[#FAF6EE] hover:text-[#1C1917]'
                            }`}
                          >
                            <span className="w-2.5 flex items-center justify-center shrink-0">
                              {isSelected && (
                                <span
                                  aria-hidden="true"
                                  className="w-1.5 h-1.5 rounded-full bg-[#A63A2B]"
                                />
                              )}
                            </span>
                            <span
                              className={`w-6 font-mono text-[11px] tabular-nums shrink-0 ${
                                isSelected ? 'text-[#A63A2B]' : 'text-[#8A7F73]'
                              }`}
                            >
                              {entry.code}
                            </span>
                            <span className="flex-1 min-w-0 text-[12.5px] truncate">
                              {entry.name}
                            </span>
                            <span
                              className={`font-mono text-[11px] tabular-nums shrink-0 ${
                                isSelected
                                  ? 'text-[#A63A2B] font-semibold'
                                  : 'text-[#8A7F73]'
                              }`}
                            >
                              {entry.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Hairline Partition Divider */}
              <div aria-hidden="true" className="hidden sm:block w-[1px] bg-[#E2D9C8] shrink-0" />
              <div aria-hidden="true" className="block sm:hidden h-[1px] bg-[#E2D9C8] w-full" />

              {/* Right Compartment: Minimalist IME-Safe Archival Search */}
              <div className="flex-1 min-w-0 flex items-center h-10 sm:h-9 px-3 gap-2">
                <Search
                  className="w-3.5 h-3.5 text-[#8A7F73] shrink-0 pointer-events-none"
                  strokeWidth={1.25}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onCompositionStart={() => {
                    isComposingRef.current = true;
                  }}
                  onCompositionEnd={() => {
                    isComposingRef.current = false;
                  }}
                  onKeyDown={(e) => {
                    if (isImeKeyEvent(e) || isComposingRef.current) return;
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  placeholder={
                    lang === 'en'
                      ? 'Search 1815, BnF, Independence Palace...'
                      : lang === 'zh'
                      ? '检索 1815、BnF、独立宫...'
                      : 'Tìm niên đại 1815, BnF, Dinh Độc Lập...'
                  }
                  className="flex-1 min-w-0 h-full bg-transparent text-[12.5px] text-[#1C1917] placeholder:text-[#8A7F73]/85 focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="text-[11px] font-medium text-[#7A6F63] hover:text-[#A63A2B] transition-colors cursor-pointer shrink-0 whitespace-nowrap px-0.5 focus-visible:outline-none focus-visible:text-[#A63A2B]"
                  >
                    {lang === 'en' ? 'Clear' : lang === 'zh' ? '清除' : 'Xóa'}
                  </button>
                ) : (
                  <kbd
                    aria-hidden="true"
                    title={
                      lang === 'en'
                        ? 'Press / to search'
                        : lang === 'zh'
                        ? '按 / 键快速检索'
                        : 'Nhấn / để tra cứu nhanh'
                    }
                    className="hidden sm:inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-[2px] border border-[#DCD2C0] bg-[#FAF6EE] text-[10px] font-mono text-[#8A7F73] leading-none shrink-0 select-none"
                  >
                    /
                  </kbd>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            3. TWO-COLUMN ARCHIVAL WORKSPACE (60% CATALOG INDEX / 40% DOSSIER CARD)
           ================================================================ */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* LEFT COLUMN (60% Desktop / 100% Mobile): Streamlined Archival Catalog */}
          <div className="w-full md:w-[60%] flex flex-col min-h-0 bg-[#F6F1E7]">
            {/* Clean Column Header */}
            <div className="hidden sm:grid sm:grid-cols-[96px_1fr_auto] items-center gap-4 px-5 sm:px-6 py-2.5 border-b border-[#1C1917]/[0.08] bg-[#EFE9DC]/75 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#6E6458] shrink-0 select-none">
              <span>{lang === 'en' ? 'Period' : lang === 'zh' ? '年代' : 'Niên đại'}</span>
              <span>
                {lang === 'en'
                  ? 'Title & Archival Repository'
                  : lang === 'zh'
                  ? '文献题名与馆藏机构'
                  : 'Nhan đề & Cơ quan lưu trữ'}
              </span>
              <span className="text-right">
                {lang === 'en' ? 'Code' : lang === 'zh' ? '编号' : 'Ký hiệu'}
              </span>
            </div>

            {/* Scrollable Catalog Rows (NO meaningless star icon column) */}
            <div
              ref={listContainerRef}
              className="flex-1 min-h-0 overflow-y-auto heritage-scrollbar divide-y divide-[#1C1917]/[0.08]"
            >
              {filteredCredits.length === 0 ? (
                <div className="py-20 px-6 text-center space-y-3">
                  <p className="font-serif text-lg font-medium text-[#1C1917]">
                    {lang === 'en'
                      ? 'No matching archival records found.'
                      : lang === 'zh'
                      ? '未检索到符合条件的档案记录。'
                      : 'Không tìm thấy mục tư liệu phù hợp.'}
                  </p>
                  <p className="text-xs text-[#5C5349] max-w-sm mx-auto leading-relaxed">
                    {lang === 'en'
                      ? 'Try clearing your keyword filter or switching back to all 17 monuments.'
                      : lang === 'zh'
                      ? '请尝试清除关键词或切换回全部 17 处文化遗产。'
                      : 'Hãy thử xóa từ khóa tìm kiếm hoặc chọn lại toàn bộ 17 di tích.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory('ALL');
                      setSelectedSiteId('ALL');
                      setSearchQuery('');
                    }}
                    className="mt-1 inline-flex items-center px-4 py-2 rounded-xl border border-[#D5CBB8] bg-[#FFFDF9] text-xs font-medium text-[#A63A2B] hover:border-[#A63A2B] transition-colors cursor-pointer"
                  >
                    {lang === 'en'
                      ? 'Reset all filters'
                      : lang === 'zh'
                      ? '重置全部筛选'
                      : 'Đặt lại toàn bộ bộ lọc'}
                  </button>
                </div>
              ) : (
                filteredCredits.map((item) => {
                  const isSelected = activeItem?.id === item.id;
                  const siteInfo = siteInfoMap.get(item.siteId);
                  const siteDisplay = getSiteDisplay(item);
                  const title = getLocalizedField(item, 'title');
                  const sourceAuthor = getLocalizedField(item, 'sourceAuthor');
                  const yearDisplay = extractChronologyDisplay(item, siteInfo?.site, lang);
                  const categoryShort = getCategoryShortLabel(item.category);
                  const accessionCode = accessionCodeMap.get(item.id) || 'ARC';

                  return (
                    <button
                      key={item.id}
                      data-credit-row={item.id}
                      type="button"
                      onClick={() =>
                        handleSelectRow(
                          item.id,
                          typeof window !== 'undefined' && window.innerWidth < 768
                        )
                      }
                      aria-current={isSelected ? 'true' : undefined}
                      className={`relative w-full text-left px-5 sm:px-6 py-4 cursor-pointer transition-all duration-150 grid grid-cols-[1fr_auto] sm:grid-cols-[96px_1fr_auto] items-start gap-3 sm:gap-4 focus-visible:outline-none focus-visible:bg-[#FFFDF9] ${
                        isSelected
                          ? 'bg-[#FFFDF9] shadow-[0_2px_12px_rgba(28,25,23,0.07)] z-10'
                          : 'bg-transparent hover:bg-[#FAF6EE]'
                      }`}
                    >
                      {/* Active Left Vertical Cinnabar Bar */}
                      {isSelected && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#A63A2B]"
                        />
                      )}

                      {/* Layer 1: Left Chronology + Category Micro-Label (Desktop / Tablet) */}
                      <div className="hidden sm:flex flex-col gap-0.5 pt-0.5 shrink-0">
                        <span className="font-serif text-[16px] font-semibold text-[#8C3B2B] tabular-nums leading-tight">
                          {yearDisplay}
                        </span>
                        <span
                          className={`text-[11px] font-medium leading-tight ${getCategoryTextColor(
                            item.category
                          )}`}
                        >
                          {categoryShort}
                        </span>
                      </div>

                      {/* Layer 2: Main Title (15px) + Monument & Repository Provenance */}
                      <div className="min-w-0">
                        {/* Mobile compact top metadata line */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 sm:hidden mb-1 text-[11.5px]">
                          <span className="font-serif font-semibold text-[#8C3B2B] tabular-nums">
                            {yearDisplay}
                          </span>
                          <span className="text-[#1C1917]/25" aria-hidden="true">
                            ·
                          </span>
                          <span className={`font-medium ${getCategoryTextColor(item.category)}`}>
                            {categoryShort}
                          </span>
                          <span className="text-[#1C1917]/25" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-mono text-[10px] text-[#5C5349]">
                            {accessionCode}
                          </span>
                        </div>

                        <div className="text-[15px] font-medium text-[#1C1917] leading-snug break-words">
                          {title}
                        </div>

                        <div className="mt-1.5 text-[12.5px] text-[#5C5349] leading-relaxed break-words">
                          <span className="font-medium text-[#463F37]">{siteDisplay}</span>
                          <span className="mx-1.5 text-[#1C1917]/30" aria-hidden="true">
                            ·
                          </span>
                          <span>{sourceAuthor}</span>
                        </div>
                      </div>

                      {/* Layer 3: Right Monospace Accession Stamp */}
                      <div className="flex items-center gap-2 pt-0.5 shrink-0">
                        <span
                          className={`hidden sm:inline-block font-mono text-[10.5px] tracking-[0.04em] tabular-nums px-2 py-1 rounded-[5px] border whitespace-nowrap transition-colors ${
                            isSelected
                              ? 'border-[#A63A2B]/40 bg-[#FDF6F4] text-[#A63A2B] font-semibold'
                              : 'border-[#D5CBB8] bg-[#FAF6EE] text-[#5C5349]'
                          }`}
                        >
                          {accessionCode}
                        </span>
                        <ChevronRight
                          className="w-4 h-4 text-[#A63A2B]/70 md:hidden shrink-0"
                          strokeWidth={1.7}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (40% Desktop): Archival Dossier Inspection Card */}
          <aside className="hidden md:flex md:w-[40%] bg-[#EFE9DC]/75 border-l border-[#1C1917]/10 p-4 lg:p-5 flex-col overflow-y-auto heritage-scrollbar">
            {activeItem ? (
              renderInspectorPanel(activeItem, false)
            ) : (
              <div className="h-full bg-[#FFFDF9] border border-[#DCD2C0] rounded-xl flex flex-col items-center justify-center text-center px-6">
                <p className="font-serif text-base text-[#5C5349]">
                  {lang === 'en'
                    ? 'Select an entry on the left to inspect its full archival record.'
                    : lang === 'zh'
                    ? '请选择左侧目录中的任意条目以查阅完整档案详情。'
                    : 'Chọn một mục tư liệu bên trái để xem chi tiết phiếu khảo cứu.'}
                </p>
              </div>
            )}
          </aside>
        </div>

        {/* ================================================================
            4. ARCHIVAL FOOTER WITH KEYBOARD KEYCAPS
           ================================================================ */}
        <footer className="px-5 sm:px-7 py-2.5 border-t border-[#1C1917]/10 bg-[#EFE8D9] flex flex-wrap items-center justify-between gap-2 text-[11.5px] text-[#5C5349] shrink-0">
          <div className="flex items-center flex-wrap gap-3">
            <span className="font-medium text-[#1C1917] tabular-nums">
              {lang === 'en'
                ? `Showing ${filteredCredits.length} / ${credits.length} archival records`
                : lang === 'zh'
                ? `显示 ${filteredCredits.length} / ${credits.length} 条馆藏文献`
                : `Hiển thị ${filteredCredits.length} / ${credits.length} tư liệu lưu trữ`}
            </span>

            <span className="hidden md:inline text-[#1C1917]/25" aria-hidden="true">
              ·
            </span>

            <div className="hidden md:inline-flex items-center gap-2 text-[11px] text-[#5C5349]">
              <span className="inline-flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded border border-[#D5CBB8] bg-[#FFFDF9] font-mono text-[10px] text-[#1C1917] shadow-[0_1px_0_rgba(28,25,23,0.08)]">
                  ↑
                </kbd>
                <kbd className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded border border-[#D5CBB8] bg-[#FFFDF9] font-mono text-[10px] text-[#1C1917] shadow-[0_1px_0_rgba(28,25,23,0.08)]">
                  ↓
                </kbd>
                <span>
                  {lang === 'en' ? 'Navigate' : lang === 'zh' ? '切换记录' : 'Chuyển mục'}
                </span>
              </span>

              <span className="inline-flex items-center gap-1 ml-1">
                <kbd className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded border border-[#D5CBB8] bg-[#FFFDF9] font-mono text-[10px] text-[#1C1917] shadow-[0_1px_0_rgba(28,25,23,0.08)]">
                  /
                </kbd>
                <span>{lang === 'en' ? 'Search' : lang === 'zh' ? '检索' : 'Tìm kiếm'}</span>
              </span>

              <span className="inline-flex items-center gap-1 ml-1">
                <kbd className="inline-flex items-center justify-center h-[20px] px-1.5 rounded border border-[#D5CBB8] bg-[#FFFDF9] font-mono text-[10px] text-[#1C1917] shadow-[0_1px_0_rgba(28,25,23,0.08)]">
                  Esc
                </kbd>
                <span>{lang === 'en' ? 'Close' : lang === 'zh' ? '关闭' : 'Đóng'}</span>
              </span>
            </div>
          </div>

          <span className="text-[11px] text-[#5C5349]">
            {lang === 'en'
              ? 'For non-commercial heritage education & scholarly research'
              : lang === 'zh'
              ? '仅供非商业文化遗产教育与学术研究使用'
              : 'Phục vụ giáo dục di sản & nghiên cứu phi thương mại'}
          </span>
        </footer>
      </div>

      {/* ================================================================
          5. MOBILE BOTTOM SHEET DOSSIER DRAWER (< 768px)
         ================================================================ */}
      {mobileDrawerOpen && activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={getLocalizedField(activeItem, 'title')}
          onClick={(e) => {
            e.stopPropagation();
            setMobileDrawerOpen(false);
          }}
          className="fixed inset-0 z-[1380] md:hidden bg-[#1C1917]/60 backdrop-blur-sm flex items-end"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[88vh] bg-[#F6F1E7] border-t border-[#D8CEBC] rounded-t-2xl shadow-[0_-20px_60px_rgba(28,25,23,0.3)] flex flex-col overflow-hidden text-[#1C1917]"
          >
            <div className="pt-2.5 pb-3 px-5 border-b border-[#1C1917]/10 flex flex-col gap-2 shrink-0 bg-[#FAF6EE]">
              <div className="w-10 h-1 rounded-full bg-[#C9A46A]/65 mx-auto" aria-hidden="true" />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#A63A2B]">
                    {lang === 'en'
                      ? 'ARCHIVAL DOSSIER'
                      : lang === 'zh'
                      ? '档案考据卡片'
                      : 'PHIẾU KHẢO CỨU'}
                  </span>
                  <span className="text-[#1C1917]/25" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[10.5px] font-mono tabular-nums text-[#5C5349]">
                    {String(activeIndex + 1).padStart(2, '0')} / {String(filteredCredits.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={activeIndex <= 0}
                    onClick={() => stepActiveItem(-1)}
                    aria-label={
                      lang === 'en' ? 'Previous record' : lang === 'zh' ? '上一条记录' : 'Mục trước'
                    }
                    className="w-8 h-8 rounded-full border border-[#D8CEBC] bg-[#FFFDF9] disabled:opacity-35 text-[#5C5349] hover:text-[#1C1917] flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.7} />
                  </button>
                  <button
                    type="button"
                    disabled={activeIndex >= filteredCredits.length - 1}
                    onClick={() => stepActiveItem(1)}
                    aria-label={
                      lang === 'en' ? 'Next record' : lang === 'zh' ? '下一条记录' : 'Mục kế tiếp'
                    }
                    className="w-8 h-8 rounded-full border border-[#D8CEBC] bg-[#FFFDF9] disabled:opacity-35 text-[#5C5349] hover:text-[#1C1917] flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={1.7} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    aria-label={
                      lang === 'en' ? 'Close detail drawer' : lang === 'zh' ? '关闭详情抽屉' : 'Đóng chi tiết tư liệu'
                    }
                    className="w-8 h-8 rounded-full border border-[#D8CEBC] bg-[#FFFDF9] text-[#5C5349] hover:text-[#A63A2B] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4" strokeWidth={1.7} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto heritage-scrollbar p-4">
              {renderInspectorPanel(activeItem, true)}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          6. FULL-SCREEN ARCHIVAL LIGHTBOX WITH OPTICAL ZOOM
         ================================================================ */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          onClick={(e) => {
            e.stopPropagation();
            setLightboxItem(null);
            setLightboxZoomed(false);
          }}
          className="fixed inset-0 z-[1450] bg-[#1C1917]/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF6EE] border border-[#D8CEBC] rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-[0_32px_96px_rgba(28,25,23,0.55)] text-[#1C1917] animate-archival-modal"
          >
            {/* Top Bar */}
            <div className="px-4 sm:px-6 py-3 border-b border-[#1C1917]/10 flex items-center justify-between gap-3 bg-[#F6F1E7]">
              <div className="flex items-center gap-2.5 min-w-0 text-xs">
                <span className="font-mono text-[11px] font-semibold tracking-[0.08em] text-[#A63A2B] shrink-0">
                  {lightboxItem.accessionCode}
                </span>
                <span className="text-[#1C1917]/25" aria-hidden="true">
                  ·
                </span>
                <span className="font-serif font-semibold text-[#8C3B2B] tabular-nums shrink-0">
                  {lightboxItem.yearDisplay}
                </span>
                <span className="text-[#1C1917]/25 hidden sm:inline" aria-hidden="true">
                  ·
                </span>
                <span className="text-[#5C5349] truncate hidden sm:inline">
                  {lightboxItem.siteDisplay}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {lightboxableItems.length > 1 && lightboxIndex >= 0 && (
                  <span className="hidden sm:inline-block mr-1 font-mono text-[11px] tabular-nums text-[#5C5349]">
                    {String(lightboxIndex + 1).padStart(2, '0')} / {String(lightboxableItems.length).padStart(2, '0')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxZoomed((prev) => !prev)}
                  aria-label={
                    lightboxZoomed
                      ? lang === 'en'
                        ? 'Reset zoom'
                        : lang === 'zh'
                        ? '还原比例'
                        : 'Thu về tỷ lệ gốc'
                      : lang === 'en'
                      ? 'Zoom in'
                      : lang === 'zh'
                      ? '放大细览'
                      : 'Phóng đại chi tiết'
                  }
                  className={`h-8 px-3 rounded-full border text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    lightboxZoomed
                      ? 'border-[#A63A2B] bg-[#FDF6F4] text-[#A63A2B] font-medium'
                      : 'border-[#D8CEBC] bg-[#FFFDF9] text-[#1C1917] hover:border-[#C9A46A]'
                  }`}
                >
                  {lightboxZoomed ? (
                    <ZoomOut className="w-3.5 h-3.5" strokeWidth={1.7} />
                  ) : (
                    <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.7} />
                  )}
                  <span className="font-mono text-[11px] tabular-nums">
                    {lightboxZoomed ? '1.8×' : '1.0×'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLightboxItem(null);
                    setLightboxZoomed(false);
                  }}
                  aria-label={
                    lang === 'en' ? 'Close fullscreen view' : lang === 'zh' ? '关闭全屏预览' : 'Đóng xem phóng to'
                  }
                  className="w-8 h-8 rounded-full border border-[#D8CEBC] bg-[#FFFDF9] hover:border-[#A63A2B] text-[#5C5349] hover:text-[#A63A2B] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            {/* Museum Gallery Stage */}
            <div className="relative bg-[#1C1917] flex items-center justify-center max-h-[62vh] overflow-auto heritage-scrollbar p-4">
              {lightboxableItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => stepLightboxItem(-1)}
                    aria-label={
                      lang === 'en' ? 'Previous photograph' : lang === 'zh' ? '上一张影像' : 'Ảnh tư liệu trước'
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#FFFDF9]/90 hover:bg-[#FFFFFF] border border-[#D8CEBC] text-[#1C1917] hover:text-[#A63A2B] flex items-center justify-center shadow-md transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepLightboxItem(1)}
                    aria-label={
                      lang === 'en' ? 'Next photograph' : lang === 'zh' ? '下一张影像' : 'Ảnh tư liệu kế tiếp'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#FFFDF9]/90 hover:bg-[#FFFFFF] border border-[#D8CEBC] text-[#1C1917] hover:text-[#A63A2B] flex items-center justify-center shadow-md transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" strokeWidth={1.8} />
                  </button>
                </>
              )}

              <img
                src={lightboxItem.src}
                alt={lightboxItem.title}
                referrerPolicy="no-referrer"
                onClick={() => setLightboxZoomed((prev) => !prev)}
                onError={(e) => {
                  advanceHeritageImgFallback(e.currentTarget, lightboxItem.src);
                }}
                className={`rounded shadow-2xl transition-transform duration-300 ease-out select-none ${
                  lightboxZoomed
                    ? 'max-w-none w-[155%] sm:w-[140%] cursor-zoom-out'
                    : 'max-w-full max-h-[56vh] object-contain cursor-zoom-in'
                }`}
              />
            </div>

            {/* Provenance & Actions */}
            <div className="p-4 sm:p-5 space-y-3 bg-[#FFFDF9] border-t border-[#1C1917]/10">
              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1C1917] leading-snug text-balance">
                {lightboxItem.title}
              </h3>
              <p className="text-xs leading-relaxed text-[#5C5349]">
                <span className="text-[#8C3B2B] font-medium">{lightboxItem.siteDisplay}</span>
                <span className="mx-1.5 text-[#1C1917]/25">—</span>
                <span>{lightboxItem.sourceAuthor}</span>
                {lightboxItem.licenseNote && (
                  <>
                    <span className="mx-1.5 text-[#1C1917]/25">·</span>
                    <span>{lightboxItem.licenseNote}</span>
                  </>
                )}
              </p>

              <div className="pt-3 border-t border-[#1C1917]/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => void handleCopyCitation(lightboxItem.id, lightboxItem.citation)}
                  className={`min-h-[38px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                    copiedId === lightboxItem.id
                      ? 'bg-[#3A665B] border-[#3A665B] text-[#FFFDF9]'
                      : 'bg-[#FAF6EE] border-[#D5CBB8] text-[#1C1917] hover:border-[#C9A46A]'
                  }`}
                >
                  {copiedId === lightboxItem.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
                      <span>
                        {lang === 'en' ? 'Copied' : lang === 'zh' ? '已复制' : 'Đã sao chép'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#A63A2B]" strokeWidth={1.7} />
                      <span>
                        {lang === 'en'
                          ? 'Copy citation'
                          : lang === 'zh'
                          ? '复制学术引文'
                          : 'Sao chép trích dẫn'}
                      </span>
                    </>
                  )}
                </button>

                {lightboxItem.url && (
                  <a
                    href={lightboxItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[38px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A63A2B] hover:bg-[#8C3023] text-[#FFFDF9] text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <span>
                      {lang === 'en'
                        ? 'Open original source'
                        : lang === 'zh'
                        ? '打开原始出处'
                        : 'Mở liên kết gốc'}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const MediaCreditsModal: React.FC<MediaCreditsModalProps> = (props) => {
  const { isAuthenticated, isJudgeDemoMode } = useAuth();
  if ((!isAuthenticated && !isJudgeDemoMode) || !props.isOpen) {
    return null;
  }
  return <MediaCreditsModalInner {...props} />;
};

export default MediaCreditsModal;
