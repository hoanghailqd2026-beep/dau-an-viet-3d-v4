import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  HeritageSite,
  BaseMapMode,
  WGS84Coordinate,
  TourRoute,
} from '../../types/heritage';
import {
  formatWGS84,
  calculateDistanceKm,
} from '../../utils/coordinateConversion';
import {
  ZoomIn,
  ZoomOut,
  Compass,
  LocateFixed,
  X,
  Crosshair,
  Map as MapIcon,
  Satellite,
  History,
  Pin,
  MousePointer2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Clock,
  Box,
  Volume2,
  BookOpen,
} from 'lucide-react';
import { LayerControlMenu } from './LayerControlMenu';
import { MapSiteQuickCard } from './MapSiteQuickCard';
import { DragScrollRow } from '../common/DragScrollRow';
import { SectionGuideButton } from '../guide/InteractiveUserGuideModal';
import { useI18n } from '../../i18n/I18nContext';
import { Language } from '../../i18n/types';
import {
  getIndochineCategoryMeta,
  getTourRouteIndochineColor,
  getHeritageColorBlock,
} from '../../utils/indochinePalette';
import { resolveHeritageVideoId, HeritageVideoKey } from '../../data/heritageFilms';
import { trackPlatformInteraction } from '../../utils/adminPlatformStore';

interface MapCanvasProps {
  sites: HeritageSite[];
  allCanonicalSites?: HeritageSite[];
  selectedSite: HeritageSite | null;
  focusTick?: number;
  tourFocusTick?: number;
  localityFocusTick?: number;
  onSelectSite: (site: HeritageSite | null) => void;
  activeTour: TourRoute | null;
  onClearTour?: () => void;
  baseMapMode: BaseMapMode;
  onChangeBaseMapMode: (mode: BaseMapMode) => void;
  onOpenARAudio: (site: HeritageSite) => void;
  onTriggerAudioGuide?: (site: HeritageSite) => void;
  onOpen3D: (site: HeritageSite) => void;
  onOpenDetailModal?: (site: HeritageSite) => void;
  onOpenPhotoManager?: (site: HeritageSite) => void;
  onOpenVideo?: (site: HeritageSite) => void;
  activeMapHeritageId?: HeritageVideoKey;
  className?: string;
  showInspectorDrawer?: boolean;
  onOpenGuide?: () => void;
  isTimelineOpen?: boolean;
  onTimelineOpenChange?: (open: boolean) => void;
  onQuickCardVisibilityChange?: (visible: boolean) => void;
}

const HCMC_CENTER_WGS84: WGS84Coordinate = { lat: 10.7769, lng: 106.6983 }; // District 1 Saigon Center
const DEFAULT_ZOOM = 14;

// Tile image cache for fast smooth rendering
const tileImageCache = new Map<string, HTMLImageElement>();

export interface HeritageCategoryStyle {
  color: string;
  glowColor: string;
  iconText: string;
  categoryLabel: string;
  badgeBg: string;
}

export const getSiteCategoryStyle = (site: HeritageSite): HeritageCategoryStyle => {
  const meta = getIndochineCategoryMeta(site, 'vi');
  const block = getHeritageColorBlock(site, 'vi');
  return {
    color: block.bg,
    glowColor: 'rgba(201, 164, 106, 0.5)',
    iconText: site.rankingLevel === 'Special National' ? '★' : '●',
    categoryLabel: meta.badgeLabel,
    badgeBg: block.badgeBg,
  };
};

interface MarkerCluster {
  id: string;
  count: number;
  centerGeo: WGS84Coordinate;
  screenX: number;
  screenY: number;
  sites: HeritageSite[];
}

type HistoricalLensRegion =
  | 'saigon_core'
  | 'cholon_giadinh'
  | 'cuchi_binhduong'
  | 'vungtau_cangio';

interface RegionalLensMeta {
  region: HistoricalLensRegion;
  label: string;
  eraRange: string;
  layerMode: BaseMapMode;
}

function getRegionalLensMeta(siteId: string | undefined, lang: Language): RegionalLensMeta {
  const key = resolveHeritageVideoId(siteId);

  if (['08', '11', '12'].includes(key)) {
    return {
      region: 'cholon_giadinh',
      eraRange: '1882 – 1920',
      layerMode: 'historical_1898',
      label:
        lang === 'en'
          ? 'CHO LON – GO CAM SON URBAN LENS (1882 – 1920)'
          : lang === 'zh'
          ? '堤岸与古嘉定历史舆图透镜 (1882 – 1920)'
          : 'THẤU KÍNH ĐÔ THỊ CHỢ LỚN – GÒ CẨM SƠN (1882 – 1920)',
    };
  }

  if (['09', '16', '17'].includes(key)) {
    return {
      region: 'cuchi_binhduong',
      eraRange: '1948 – 1975',
      layerMode: 'historical_1966',
      label:
        lang === 'en'
          ? 'TUNNELS & EASTERN WAR ZONE LENS (1948 – 1975)'
          : lang === 'zh'
          ? '地道与东南部战区舆图透镜 (1948 – 1975)'
          : 'THẤU KÍNH ĐỊA ĐẠO & CHIẾN KHU MIỀN ĐÔNG (1948 – 1975)',
    };
  }

  if (['10', '13', '14', '15'].includes(key)) {
    return {
      region: 'vungtau_cangio',
      eraRange: '1895 – 1954',
      layerMode: 'historical_1898',
      label:
        lang === 'en'
          ? 'CAP SAINT-JACQUES & COASTAL LENS (1895 – 1954)'
          : lang === 'zh'
          ? '头顿与沿海历史舆图透镜 (1895 – 1954)'
          : 'THẤU KÍNH CAP SAINT-JACQUES & DUYÊN HẢI (1895 – 1954)',
    };
  }

  return {
    region: 'saigon_core',
    eraRange: '1815 – 1898',
    layerMode: 'historical_1815',
    label:
      lang === 'en'
        ? 'GIA DINH – BAGUA CITADEL LENS (1815 – 1898)'
        : lang === 'zh'
        ? '嘉定八卦城历史舆图透镜 (1815 – 1898)'
        : 'THẤU KÍNH GIA ĐỊNH – THÀNH BÁT QUÁI (1815 – 1898)',
  };
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  sites,
  allCanonicalSites,
  selectedSite,
  focusTick = 0,
  tourFocusTick = 0,
  localityFocusTick = 0,
  onSelectSite,
  activeTour,
  onClearTour,
  baseMapMode,
  onChangeBaseMapMode,
  onOpenARAudio,
  onTriggerAudioGuide,
  onOpen3D,
  onOpenDetailModal,
  activeMapHeritageId,
  className,
  showInspectorDrawer = false,
  onOpenGuide,
  isTimelineOpen: controlledTimelineOpen,
  onTimelineOpenChange,
  onQuickCardVisibilityChange,
}) => {
  const { lang, formatDistrictName, getLocalizedSite, getLocalizedTour } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const lensBufferCanvasRef = useRef<HTMLCanvasElement>(null);
  const lensClipRef = useRef<HTMLDivElement>(null);
  const lensRingRef = useRef<HTMLDivElement>(null);
  const lensOuterRingRef = useRef<HTMLDivElement>(null);
  const lensCrosshairRef = useRef<HTMLDivElement>(null);
  const lensPillRef = useRef<HTMLDivElement>(null);
  const lensPillTextRef = useRef<HTMLSpanElement>(null);

  // Map viewport state
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
  const [center, setCenter] = useState<WGS84Coordinate>(HCMC_CENTER_WGS84);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Popup Quick-Action Card state (click pins it; desktop hover previews with grace delay)
  const [popupSite, setPopupSite] = useState<HeritageSite | null>(null);
  const [hoverPreviewSite, setHoverPreviewSite] = useState<HeritageSite | null>(null);
  const hoverTimerRef = useRef<number | null>(null);

  // Historical split comparison state & Regional Spyglass Lens state
  const [isSplitCompare, setIsSplitCompare] = useState<boolean>(false);
  const [splitSliderX, setSplitSliderX] = useState<number>(50);
  const [historicalOpacity, setHistoricalOpacity] = useState<number>(0.85);
  const [historicalUnderlay, setHistoricalUnderlay] = useState<'admin' | 'satellite'>('admin');
  const [isSpyglassLensMode, setIsSpyglassLensMode] = useState<boolean>(false);
  const [isLensLocked, setIsLensLocked] = useState<boolean>(false);
  const [lensRegionKey, setLensRegionKey] = useState<
    'saigon_core' | 'cholon_giadinh' | 'cuchi_binhduong' | 'vungtau_cangio'
  >('saigon_core');
  const [internalTimelineOpen, setInternalTimelineOpen] = useState<boolean>(false);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);
  const [activeTourStopIdx, setActiveTourStopIdx] = useState<number>(0);
  const isUserSlidingTimelineRef = useRef<boolean>(false);

  const isTimelineOpen =
    controlledTimelineOpen !== undefined ? controlledTimelineOpen : internalTimelineOpen;
  const setTimelineOpen = useCallback(
    (next: boolean) => {
      if (onTimelineOpenChange) onTimelineOpenChange(next);
      else setInternalTimelineOpen(next);
    },
    [onTimelineOpenChange]
  );

  useEffect(() => {
    onQuickCardVisibilityChange?.(Boolean(popupSite));
  }, [popupSite, onQuickCardVisibilityChange]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (baseMapMode === 'satellite') {
      setHistoricalUnderlay('satellite');
    } else if (baseMapMode === 'admin') {
      setHistoricalUnderlay('admin');
    }
  }, [baseMapMode]);

  const HISTORICAL_TIMELINE_MILESTONES: ReadonlyArray<{
    id: '1815' | '1865' | '1925' | '1955' | 'present';
    yearNum: number;
    year: string;
    sliderValue: number;
    layerMode: BaseMapMode;
    eraTitle: { vi: string; en: string; zh: string };
    eraLabel: { vi: string; en: string; zh: string };
    context: { vi: string; en: string; zh: string };
  }> = [
    {
      id: '1815',
      yearNum: 1815,
      year: '1815',
      sliderValue: 0,
      layerMode: 'historical_1815',
      eraTitle: {
        vi: 'Thành Bát Quái (Thành Quy)',
        en: 'Gia Dinh Octagonal Citadel',
        zh: '嘉定八卦城（龟城）',
      },
      eraLabel: {
        vi: '1815 · Thành Bát Quái',
        en: '1815 · Octagonal Citadel',
        zh: '1815 · 嘉定八卦城',
      },
      context: {
        vi: 'Sài Gòn – Gia Định thời Vua Gia Long với Thành Bát Quái và rạch Bến Nghé; lúc này mới chỉ có 2/17 di tích hiện hữu (Chùa Giác Lâm 1744 & Giồng Cá Vồ).',
        en: 'Gia Dinh under Emperor Gia Long featuring the Octagonal Citadel and Ben Nghe Creek; only 2/17 monuments existed then (Giac Lam Pagoda 1744 & Giong Ca Vo).',
        zh: '阮朝嘉隆时期的嘉定八卦城与滨艺涌水系；此时仅有2/17处遗迹存在（觉林古寺1744年与芹椰古丘）。',
      },
    },
    {
      id: '1865',
      yearNum: 1865,
      year: '1865',
      sliderValue: 25,
      layerMode: 'historical_1898',
      eraTitle: {
        vi: 'Quy hoạch Đô thị Sơ kỳ',
        en: 'Early Urban Planning',
        zh: '早期城市规划',
      },
      eraLabel: {
        vi: '1865 · Quy hoạch Đô thị Sơ kỳ',
        en: '1865 · Early Urban Planning',
        zh: '1865 · 早期城市规划',
      },
      context: {
        vi: 'Giai đoạn phá dỡ Thành Phụng, định hình trục đại lộ Norodom (Lê Duẩn), Catinat (Đồng Khởi) và khởi đặt nền móng kiến trúc mới.',
        en: 'Dismantling of Phung Citadel and early layout of Norodom (Le Duan) and Catinat (Dong Khoi) boulevards with foundational civic works.',
        zh: '拆除凤城，初步确立诺罗敦大道（黎笋街）与卡提纳街（同起街）轴线并奠定新建筑基石。',
      },
    },
    {
      id: '1925',
      yearNum: 1925,
      year: '1925',
      sliderValue: 50,
      layerMode: 'historical_1898',
      eraTitle: {
        vi: 'Đỉnh cao Kiến trúc Đông Dương',
        en: 'Peak Indochina Architecture',
        zh: '印支建筑鼎盛时期',
      },
      eraLabel: {
        vi: '1925 · Kiến trúc Đông Dương',
        en: '1925 · Indochina Architecture',
        zh: '1925 · 印支建筑鼎盛',
      },
      context: {
        vi: 'Hoàn thiện hàng loạt công trình biểu tượng như Bưu điện Trung tâm, Nhà thờ Đức Bà, Chợ Bến Thành, Bảo tàng Lịch sử.',
        en: 'Completion of iconic civic landmarks including the Central Post Office, Notre-Dame Cathedral, Ben Thanh Market, and History Museum.',
        zh: '中央邮局、圣母大教堂、滨城市场与历史博物馆等一系列标志性建筑相继落成。',
      },
    },
    {
      id: '1955',
      yearNum: 1955,
      year: '1955',
      sliderValue: 75,
      layerMode: 'historical_1966',
      eraTitle: {
        vi: 'Kiến trúc Hiện đại Nhiệt đới',
        en: 'Tropical Modernist Architecture',
        zh: '热带现代主义建筑',
      },
      eraLabel: {
        vi: '1955 · Hiện đại Nhiệt đới',
        en: '1955 · Tropical Modernism',
        zh: '1955 · 热带现代主义',
      },
      context: {
        vi: 'Sự ra đời của Dinh Độc Lập mới (1962–1966), Thư viện Khoa học Tổng hợp và các công trình mang bản sắc hiện đại bản địa.',
        en: 'Rise of the new Independence Palace (1962–1966), General Sciences Library, and civic architecture rooted in indigenous tropical modernism.',
        zh: '新独立宫（1962–1966）、综合科学图书馆等兼具本土气候与现代美学的建筑诞生。',
      },
    },
    {
      id: 'present',
      yearNum: 2026,
      year: lang === 'en' ? 'Present' : lang === 'zh' ? '现代' : 'Hiện tại',
      sliderValue: 100,
      layerMode: 'admin',
      eraTitle: {
        vi: 'Đô thị Đương đại & Bảo tồn Di sản',
        en: 'Contemporary City & Heritage Conservation',
        zh: '当代都市与遗产保护',
      },
      eraLabel: {
        vi: 'Hiện tại · Bảo tồn Di sản 3D',
        en: 'Present · 3D Heritage Conservation',
        zh: '现代 · 3D 遗产保护',
      },
      context: {
        vi: 'Toàn cảnh 17 di tích lịch sử – văn hóa tiêu biểu được số hóa 3D trong lòng Đông Nam Bộ ngày nay.',
        en: 'Complete panorama of 17 iconic historical and cultural monuments digitized in 3D across Southeast Vietnam today.',
        zh: '当代都市全景下，17处东南部代表性历史文化遗产通过3D数字化得以立体留存。',
      },
    },
  ];

  // Historically accurate site names & predecessor commencement years across eras
  const getSiteHistoricalEraStatus = useCallback(
    (
      site: HeritageSite,
      eraId: '1815' | '1865' | '1925' | '1955' | 'present',
      eraYearNum: number,
      historicalActive: boolean
    ): {
      isBuilt: boolean;
      displayName: string;
      unbuiltNote: string;
      builtYear: number;
    } => {
      const modernName = getLocalizedSite(site).officialName;
      // Dinh Độc Lập stands on the site of Dinh Toàn quyền / Dinh Norodom (begun 1868, rebuilt 1962)
      const effectiveBuiltYear =
        site.id === 'HCM-DT-001' ? 1868 : site.commencementYear;

      if (!historicalActive || eraId === 'present') {
        return {
          isBuilt: true,
          displayName: modernName,
          unbuiltNote: '',
          builtYear: site.commencementYear,
        };
      }

      const isBuilt = effectiveBuiltYear <= eraYearNum;
      const yearLabel =
        effectiveBuiltYear < 0
          ? lang === 'en'
            ? `${Math.abs(effectiveBuiltYear)} BCE`
            : lang === 'zh'
            ? `公元前${Math.abs(effectiveBuiltYear)}年`
            : `${Math.abs(effectiveBuiltYear)} TCN`
          : String(effectiveBuiltYear);

      if (!isBuilt) {
        return {
          isBuilt: false,
          displayName: modernName,
          unbuiltNote:
            lang === 'en'
              ? `Not yet built (Built ${yearLabel})`
              : lang === 'zh'
              ? `尚未动工（建于${yearLabel}年）`
              : `Chưa khởi công (Xây năm ${yearLabel})`,
          builtYear: effectiveBuiltYear,
        };
      }

      const historicalNamesBySite: Record<
        string,
        Partial<Record<'1815' | '1865' | '1925' | '1955', { vi: string; en: string; zh: string }>>
      > = {
        'HCM-DT-001': {
          '1925': {
            vi: 'Dinh Toàn quyền / Dinh Norodom',
            en: 'Norodom Palace (Governor-General)',
            zh: '诺罗敦宫（总督府）',
          },
          '1955': {
            vi: 'Dinh Độc Lập (Tiền thân Dinh Norodom)',
            en: 'Independence Palace (Norodom Era)',
            zh: '独立宫（诺罗敦宫时期）',
          },
        },
        'HCM-DT-002': {
          '1925': {
            vi: 'Théâtre Municipal / Nhà hát Lớn Sài Gòn',
            en: 'Théâtre Municipal de Saïgon',
            zh: '西贡市立大剧院',
          },
          '1955': {
            vi: 'Nhà hát Lớn Sài Gòn',
            en: 'Saigon Municipal Opera House',
            zh: '西贡大剧院',
          },
        },
        'HCM-DT-003': {
          '1925': {
            vi: 'Bưu điện Sài Gòn (Poste Centrale)',
            en: 'Saigon Central Post Office (Poste Centrale)',
            zh: '西贡中央邮政总局',
          },
          '1955': {
            vi: 'Bưu điện Trung tâm Đô thành',
            en: 'Saigon Capital Post Office',
            zh: '西贡都城中央邮局',
          },
        },
        'HCM-DT-004': {
          '1925': {
            vi: 'Chợ Mới Sài Gòn (Halles Centrales)',
            en: 'Halles Centrales / New Saigon Market',
            zh: '西贡新市场（中央市场）',
          },
          '1955': {
            vi: 'Chợ Bến Thành',
            en: 'Ben Thanh Market',
            zh: '滨城市场',
          },
        },
        'HCM-DT-005': {
          '1925': {
            vi: 'Nhà thờ Lớn Sài Gòn (Cathédrale)',
            en: 'Cathédrale Notre-Dame de Saïgon',
            zh: '西贡大教堂',
          },
          '1955': {
            vi: 'Vương cung Thánh đường Đức Bà',
            en: 'Notre-Dame Cathedral Basilica',
            zh: '西贡圣母圣殿大教堂',
          },
        },
        'HCM-DT-006': {
          '1955': {
            vi: 'Bảo tàng Blanchard de la Brosse',
            en: 'Musée Blanchard de la Brosse',
            zh: '布朗夏尔·德·拉·布罗斯博物馆',
          },
        },
        'HCM-DT-007': {
          '1865': {
            vi: 'Thương cảng Messageries Impériales',
            en: 'Messageries Impériales Harbour',
            zh: '法兰西帝国邮船码头',
          },
          '1925': {
            vi: 'Hãng tàu Messageries Maritimes (Nhà Rồng)',
            en: 'Messageries Maritimes (Dragon House)',
            zh: '法国海运邮船公司大楼（龙屋港）',
          },
          '1955': {
            vi: 'Thương cảng Nhà Rồng Sài Gòn',
            en: 'Nha Rong Saigon Port',
            zh: '西贡龙屋商港',
          },
        },
        'HCM-DT-008': {
          '1865': {
            vi: 'Miếu Thượng Công (Lăng Tả quân)',
            en: 'Mieu Thuong Cong (Marshal Le Van Duyet)',
            zh: '上公庙（左军黎文悦陵）',
          },
          '1925': {
            vi: 'Lăng Ông Bà Chiểu / Miếu Thượng Công',
            en: 'Lang Ong Ba Chieu Mausoleum',
            zh: '巴沼翁陵（上公庙）',
          },
        },
        'HCM-DT-010': {
          '1815': {
            vi: 'Gò cổ Giồng Cá Vồ (Cần Giờ)',
            en: 'Giong Ca Vo Ancient Mound',
            zh: '芹椰古丘遗址',
          },
        },
        'HCM-DT-011': {
          '1815': {
            vi: 'Chùa Cẩm Sơn (Tổ đình Giác Lâm)',
            en: 'Cam Son Pagoda (Giac Lam)',
            zh: '锦山寺（觉林祖庭）',
          },
          '1865': {
            vi: 'Chùa Cẩm Sơn (Tổ đình Giác Lâm)',
            en: 'Cam Son Pagoda (Giac Lam)',
            zh: '锦山寺（觉林祖庭）',
          },
          '1925': {
            vi: 'Tổ đình Giác Lâm',
            en: 'Giac Lam Ancestral Pagoda',
            zh: '觉林古寺',
          },
        },
        'HCM-DT-012': {
          '1865': {
            vi: 'Miếu Quan Đế (Chùa Ông Chợ Lớn)',
            en: 'Quan De Temple (Cho Lon)',
            zh: '堤岸关帝庙（义安会馆）',
          },
          '1925': {
            vi: 'Hội quán Nghĩa An / Miếu Quan Đế',
            en: 'Nghia An Assembly Hall (Quan De Temple)',
            zh: '义安会馆（关帝庙）',
          },
        },
        'BRVT-DT-001': {
          '1925': {
            vi: 'Villa Blanche (Dinh Toàn quyền Vũng Tàu)',
            en: 'Villa Blanche (Cap Saint-Jacques)',
            zh: '白别墅（头顿总督行宫）',
          },
          '1955': {
            vi: 'Dinh Bảo Đại / Bạch Dinh',
            en: 'Bao Dai Villa / Bach Dinh',
            zh: '保大行宫 / 白宫',
          },
        },
        'BRVT-DT-002': {
          '1925': {
            vi: 'Đền Ông Trần (Nhà Lớn Long Sơn)',
            en: 'Ong Tran Temple (Long Son)',
            zh: '陈翁庙（龙山大屋）',
          },
        },
      };

      const eraSpecific = historicalNamesBySite[site.id]?.[eraId];
      return {
        isBuilt: true,
        displayName: eraSpecific ? eraSpecific[lang] : modernName,
        unbuiltNote: '',
        builtYear: effectiveBuiltYear,
      };
    },
    [getLocalizedSite, lang]
  );

  const [mobileTimelineSlider, setMobileTimelineSlider] = useState<number>(() =>
    baseMapMode === 'historical_1815'
      ? 0
      : baseMapMode === 'historical_1898'
      ? 25
      : baseMapMode === 'historical_1966'
      ? 75
      : 100
  );

  const activeTimelineMilestone =
    mobileTimelineSlider <= 12
      ? HISTORICAL_TIMELINE_MILESTONES[0]
      : mobileTimelineSlider <= 37
      ? HISTORICAL_TIMELINE_MILESTONES[1]
      : mobileTimelineSlider <= 62
      ? HISTORICAL_TIMELINE_MILESTONES[2]
      : mobileTimelineSlider < 90
      ? HISTORICAL_TIMELINE_MILESTONES[3]
      : HISTORICAL_TIMELINE_MILESTONES[4];

  const builtCountAtActiveEra = sites.reduce((acc, s) => {
    const st = getSiteHistoricalEraStatus(
      s,
      activeTimelineMilestone.id,
      activeTimelineMilestone.yearNum,
      baseMapMode.startsWith('historical') || isSpyglassLensMode
    );
    return acc + (st.isBuilt ? 1 : 0);
  }, 0);

  const applyHistoricalTimelineValue = useCallback(
    (val: number) => {
      setMobileTimelineSlider(val);
      if (val <= 12) {
        if (baseMapMode !== 'historical_1815') onChangeBaseMapMode('historical_1815');
      } else if (val <= 62) {
        if (baseMapMode !== 'historical_1898') onChangeBaseMapMode('historical_1898');
      } else if (val < 90) {
        if (baseMapMode !== 'historical_1966') onChangeBaseMapMode('historical_1966');
      } else {
        setIsSpyglassLensMode(false);
        if (baseMapMode.startsWith('historical')) onChangeBaseMapMode(historicalUnderlay);
      }
    },
    [baseMapMode, historicalUnderlay, onChangeBaseMapMode]
  );

  const handleSelectTimelineMilestone = useCallback(
    (milestoneId: '1815' | '1865' | '1925' | '1955' | 'present', stopPlayback = true) => {
      const target = HISTORICAL_TIMELINE_MILESTONES.find((m) => m.id === milestoneId);
      if (!target) return;
      if (stopPlayback) setIsTimelinePlaying(false);
      isUserSlidingTimelineRef.current = true;
      setMobileTimelineSlider(target.sliderValue);
      if (target.id === 'present') {
        setIsSpyglassLensMode(false);
        onChangeBaseMapMode(historicalUnderlay);
      } else {
        onChangeBaseMapMode(target.layerMode);
        trackPlatformInteraction('tech_map_1815', selectedSite?.id);
      }
      window.setTimeout(() => {
        isUserSlidingTimelineRef.current = false;
      }, 120);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [historicalUnderlay, onChangeBaseMapMode, selectedSite?.id]
  );

  const handleToggleTimelinePlayback = useCallback(() => {
    setIsTimelinePlaying((prev) => {
      if (prev) return false;
      // Starting playback: if currently at Present (or non-historical), jump to 1815 first
      if (activeTimelineMilestone.id === 'present' || !baseMapMode.startsWith('historical')) {
        isUserSlidingTimelineRef.current = true;
        setMobileTimelineSlider(0);
        onChangeBaseMapMode('historical_1815');
        window.setTimeout(() => {
          isUserSlidingTimelineRef.current = false;
        }, 120);
      }
      return true;
    });
  }, [activeTimelineMilestone.id, baseMapMode, onChangeBaseMapMode]);

  useEffect(() => {
    if (!isTimelinePlaying) return;
    const order: Array<'1815' | '1865' | '1925' | '1955' | 'present'> = [
      '1815',
      '1865',
      '1925',
      '1955',
      'present',
    ];
    const timer = window.setInterval(() => {
      const curIdx = order.indexOf(activeTimelineMilestone.id);
      const nextIdx = curIdx + 1;
      if (nextIdx >= order.length) {
        setIsTimelinePlaying(false);
        return;
      }
      handleSelectTimelineMilestone(order[nextIdx], false);
      if (order[nextIdx] === 'present') {
        setIsTimelinePlaying(false);
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [isTimelinePlaying, activeTimelineMilestone.id, handleSelectTimelineMilestone]);

  useEffect(() => {
    if (isUserSlidingTimelineRef.current) return;
    if (baseMapMode === 'historical_1815') setMobileTimelineSlider(0);
    else if (baseMapMode === 'historical_1898') {
      setMobileTimelineSlider((prev) => (prev >= 38 && prev <= 62 ? prev : 25));
    } else if (baseMapMode === 'historical_1966') setMobileTimelineSlider(75);
    else setMobileTimelineSlider(100);
  }, [baseMapMode]);

  useEffect(() => {
    if (!baseMapMode.startsWith('historical')) {
      setIsSpyglassLensMode(false);
    }
  }, [baseMapMode]);

  const lensCurrentPosRef = useRef<{ x: number; y: number } | null>(null);
  const lensTargetPosRef = useRef<{ x: number; y: number } | null>(null);
  const lensPinnedToSiteRef = useRef<boolean>(true);
  const lensLerpRafRef = useRef<number | null>(null);
  const lastPinClientPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastLensRegionRef = useRef<string>('saigon_core');
  const lastLensLabelRef = useRef<string>('');

  // Measurement tool state
  const [measureMode, setMeasureMode] = useState<boolean>(false);
  const [measurePointA, setMeasurePointA] = useState<WGS84Coordinate | null>(null);
  const [measurePointB, setMeasurePointB] = useState<WGS84Coordinate | null>(null);

  // Live mouse readout & hover
  const [cursorWgs84, setCursorWgs84] = useState<WGS84Coordinate>(HCMC_CENTER_WGS84);
  const [hoveredSite, setHoveredSite] = useState<HeritageSite | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<MarkerCluster | null>(null);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);

  // Layer visibility toggles (Mặc định: showProtectionZones = false)
  const [showDistricts, setShowDistricts] = useState<boolean>(true);
  const [showWaterways, setShowWaterways] = useState<boolean>(true);
  const [showProtectionZones, setShowProtectionZones] = useState<boolean>(false);
  const [tileRerenderTick, setTileRerenderTick] = useState<number>(0);

  // Smooth camera animation loop state
  const animFrameRef = useRef<number | null>(null);

  const centerRef = useRef<WGS84Coordinate>(center);
  const zoomRef = useRef<number>(zoom);
  useEffect(() => {
    centerRef.current = center;
  }, [center]);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Global mouse/pointer up listener to prevent dragging getting stuck
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      setIsPanning(false);
    };
    window.addEventListener('mouseup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, []);

  // ESC key closes popup and deselects site
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPopupSite(null);
        onSelectSite(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectSite]);

  // Smooth camera transition (flyTo) respecting prefers-reduced-motion
  const flyTo = useCallback((targetCoord: WGS84Coordinate, targetZoom: number, durationMs = 800) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCenter(targetCoord);
      setZoom(targetZoom);
      return;
    }

    const startCoord = { ...centerRef.current };
    const startZoom = zoomRef.current;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animateStep = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const ease = easeInOutCubic(progress);

      setCenter({
        lat: startCoord.lat + (targetCoord.lat - startCoord.lat) * ease,
        lng: startCoord.lng + (targetCoord.lng - startCoord.lng) * ease,
      });
      setZoom(startZoom + (targetZoom - startZoom) * ease);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateStep);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(animateStep);
  }, []);

  // Automatically frame District 1 Saigon (zoom 14.5) when entering Historical Map mode
  const prevBaseIsHistoricalRef = useRef<boolean>(baseMapMode.startsWith('historical'));
  useEffect(() => {
    const isNowHistorical = baseMapMode.startsWith('historical');
    if (!prevBaseIsHistoricalRef.current && isNowHistorical) {
      flyTo({ lat: 10.7785, lng: 106.6980 }, 14.5, 700);
    }
    prevBaseIsHistoricalRef.current = isNowHistorical;
  }, [baseMapMode, flyTo]);

  // Sync focusTick (when user explicitly selects a monument from list/search/catalog) to smooth flyTo + Quick-Action Card
  const prevSelectedSiteIdRef = useRef<string | null>(selectedSite?.id ?? null);
  const prevFocusTickRef = useRef<number>(focusTick);
  useEffect(() => {
    if (selectedSite) {
      const tickChanged = prevFocusTickRef.current !== focusTick;
      const siteChanged = prevSelectedSiteIdRef.current !== selectedSite.id;
      if (tickChanged) {
        prevSelectedSiteIdRef.current = selectedSite.id;
        prevFocusTickRef.current = focusTick;
        lensPinnedToSiteRef.current = true;
        const isSmallViewport = (containerRef.current?.clientWidth || window.innerWidth) < 768;
        const targetZoom = Math.max(zoomRef.current, 15.2);
        const latOffset = isSmallViewport
          ? 0.0024 / Math.pow(2, Math.max(0, targetZoom - 14.5))
          : 0.0006;
        flyTo({ lat: selectedSite.gps.lat - latOffset, lng: selectedSite.gps.lng }, targetZoom);
        if (!showInspectorDrawer) {
          setPopupSite(selectedSite);
        }
      } else if (siteChanged) {
        prevSelectedSiteIdRef.current = selectedSite.id;
        if (popupSite) {
          setPopupSite(selectedSite);
        }
      }
      if (activeTour) {
        const stopIdx = activeTour.sites.findIndex((id) => id === selectedSite.id);
        if (stopIdx !== -1) {
          setActiveTourStopIdx(stopIdx);
        }
      }
    } else {
      prevSelectedSiteIdRef.current = null;
      setPopupSite(null);
    }
  }, [selectedSite, focusTick, flyTo, showInspectorDrawer, activeTour]);

  // Smoothly fit visible sites when user taps a 1-tap Locality chip (Tất cả / TP.HCM / Bình Dương / Vũng Tàu)
  const prevLocalityTickRef = useRef<number>(localityFocusTick);
  useEffect(() => {
    if (localityFocusTick === prevLocalityTickRef.current) return;
    prevLocalityTickRef.current = localityFocusTick;
    if (sites.length === 0) return;

    setPopupSite(null);
    if (sites.length === 1) {
      flyTo(sites[0].gps, 14.8, 720);
      return;
    }

    const width = Math.max(320, containerRef.current?.clientWidth || 960);
    const height = Math.max(260, containerRef.current?.clientHeight || 620);
    const toMercatorUnit = (coord: WGS84Coordinate) => {
      const x = (coord.lng + 180) / 360;
      const sinLat = Math.sin((coord.lat * Math.PI) / 180);
      const y = 0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI);
      return { x, y };
    };
    const pts = sites.map((s) => toMercatorUnit(s.gps));
    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));
    const midLng = ((minX + maxX) / 2) * 360 - 180;
    const n = Math.PI - 2 * Math.PI * ((minY + maxY) / 2);
    const midLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    const spanX = Math.max(1e-5, maxX - minX);
    const spanY = Math.max(1e-5, maxY - minY);
    const usableWidth = width < 768 ? width * 0.72 : width * 0.66;
    const usableHeight = width < 768 ? height * 0.48 : height * 0.62;
    const zoomX = Math.log2(usableWidth / (spanX * 256));
    const zoomY = Math.log2(usableHeight / (spanY * 256));
    const targetZoom = Math.max(9.6, Math.min(14.5, Math.min(zoomX, zoomY)));
    flyTo({ lat: midLat, lng: midLng }, targetZoom, 780);
  }, [localityFocusTick, sites, flyTo]);

  // Direct GPU-composited DOM transform for 60FPS Spyglass Lens (0 React re-renders, 0 tile redraws)
  const applySpyglassDomTransform = useCallback(
    (lensX: number, lensY: number) => {
      const parentEl = containerRef.current;
      const width = parentEl?.clientWidth || 1000;
      const height = parentEl?.clientHeight || 700;
      const lensRadius = Math.min(160, Math.max(115, Math.min(width, height) * 0.23));
      const diameter = lensRadius * 2;
      const left = lensX - lensRadius;
      const top = lensY - lensRadius;

      if (lensClipRef.current) {
        lensClipRef.current.style.width = `${diameter}px`;
        lensClipRef.current.style.height = `${diameter}px`;
        lensClipRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      }
      if (lensBufferCanvasRef.current) {
        lensBufferCanvasRef.current.style.transform = `translate3d(${-left}px, ${-top}px, 0)`;
      }
      if (lensRingRef.current) {
        lensRingRef.current.style.width = `${diameter}px`;
        lensRingRef.current.style.height = `${diameter}px`;
        lensRingRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      }
      if (lensOuterRingRef.current) {
        const outerDiam = diameter + 10;
        lensOuterRingRef.current.style.width = `${outerDiam}px`;
        lensOuterRingRef.current.style.height = `${outerDiam}px`;
        lensOuterRingRef.current.style.transform = `translate3d(${left - 5}px, ${top - 5}px, 0)`;
      }
      if (lensCrosshairRef.current) {
        lensCrosshairRef.current.style.transform = `translate3d(${lensX - 18}px, ${lensY - 18}px, 0)`;
      }

      // Resolve regional context without triggering React state updates unless crossing regions
      let regionalSite =
        (activeMapHeritageId
          ? sites.find((s) => resolveHeritageVideoId(s.id) === activeMapHeritageId)
          : null) ||
        selectedSite ||
        sites[0];

      if (!isLensLocked && !lensPinnedToSiteRef.current) {
        const numTiles = Math.pow(2, zoomRef.current);
        const cLat = centerRef.current.lat;
        const cLng = centerRef.current.lng;
        const centerWorldX = ((cLng + 180) / 360) * 256 * numTiles;
        const sinCenterLat = Math.sin((cLat * Math.PI) / 180);
        const centerWorldY =
          (0.5 - Math.log((1 + sinCenterLat) / (1 - sinCenterLat)) / (4 * Math.PI)) * 256 * numTiles;

        let bestDist = lensRadius * 0.9;
        for (const candidate of sites) {
          const targetWorldX = ((candidate.gps.lng + 180) / 360) * 256 * numTiles;
          const sinTargetLat = Math.sin((candidate.gps.lat * Math.PI) / 180);
          const targetWorldY =
            (0.5 - Math.log((1 + sinTargetLat) / (1 - sinTargetLat)) / (4 * Math.PI)) * 256 * numTiles;
          const cx = width / 2 + (targetWorldX - centerWorldX);
          const cy = height / 2 + (targetWorldY - centerWorldY);
          const d = Math.hypot(cx - lensX, cy - lensY);
          if (d < bestDist) {
            bestDist = d;
            regionalSite = candidate;
          }
        }
      }

      const regionalMeta = getRegionalLensMeta(regionalSite?.id, lang);
      if (lensPillTextRef.current && lastLensLabelRef.current !== regionalMeta.label) {
        lastLensLabelRef.current = regionalMeta.label;
        lensPillTextRef.current.textContent = regionalMeta.label;
      }
      if (lastLensRegionRef.current !== regionalMeta.region) {
        lastLensRegionRef.current = regionalMeta.region;
        setLensRegionKey(regionalMeta.region);
      }

      if (lensPillRef.current) {
        const pillW = Math.min(width - 20, Math.max(220, lensPillRef.current.offsetWidth || 250));
        const pillX = Math.max(10, Math.min(width - pillW - 10, lensX - pillW / 2));
        const pillY = Math.max(84, top - 30);
        lensPillRef.current.style.transform = `translate3d(${pillX}px, ${pillY}px, 0)`;
      }
    },
    [activeMapHeritageId, sites, selectedSite, isLensLocked, lang]
  );

  // Smooth rAF interpolation for Spyglass Lens cursor tracking (zero React re-renders)
  const startLensLerpLoop = useCallback(() => {
    if (lensLerpRafRef.current !== null) return;
    const step = () => {
      const cur = lensCurrentPosRef.current;
      const target = lensTargetPosRef.current;
      if (!cur || !target) {
        lensLerpRafRef.current = null;
        return;
      }
      const dx = target.x - cur.x;
      const dy = target.y - cur.y;
      if (Math.hypot(dx, dy) < 0.45) {
        lensCurrentPosRef.current = { ...target };
        applySpyglassDomTransform(target.x, target.y);
        lensLerpRafRef.current = null;
        return;
      }
      const next = {
        x: cur.x + dx * 0.26,
        y: cur.y + dy * 0.26,
      };
      lensCurrentPosRef.current = next;
      applySpyglassDomTransform(next.x, next.y);
      lensLerpRafRef.current = requestAnimationFrame(step);
    };
    lensLerpRafRef.current = requestAnimationFrame(step);
  }, [applySpyglassDomTransform]);

  useEffect(() => {
    return () => {
      if (lensLerpRafRef.current !== null) {
        cancelAnimationFrame(lensLerpRafRef.current);
      }
    };
  }, []);

  // Auto-frame map when activeTour changes or tourFocusTick increments:
  // - Routes 1–8 (2+ stops): fitBounds across all stops of the route
  // - Route 9 (1 stop — Bạch Dinh): direct flyTo with positioning halo and destination card (no empty polyline)
  useEffect(() => {
    if (!activeTour || activeTour.sites.length === 0) return;

    const tourSites = activeTour.sites
      .map((id) => sites.find((s) => s.id === id))
      .filter(
        (s): s is HeritageSite =>
          Boolean(s && Number.isFinite(s.gps?.lat) && Number.isFinite(s.gps?.lng))
      );

    if (tourSites.length === 0) return;

    prevSelectedSiteIdRef.current = tourSites[0].id;
    lensPinnedToSiteRef.current = true;

    if (tourSites.length === 1) {
      const singleSite = tourSites[0];
      flyTo({ lat: singleSite.gps.lat - 0.0011, lng: singleSite.gps.lng }, 15.8, 820);
      if (!showInspectorDrawer) {
        setPopupSite(singleSite);
      }
      return;
    }

    // Compute exact Web Mercator bounding box so both stops fit smoothly inside the canvas
    const width = Math.max(320, containerRef.current?.clientWidth || 960);
    const height = Math.max(260, containerRef.current?.clientHeight || 620);

    const toMercatorUnit = (coord: WGS84Coordinate) => {
      const x = (coord.lng + 180) / 360;
      const sinLat = Math.sin((coord.lat * Math.PI) / 180);
      const y = 0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI);
      return { x, y };
    };

    const pts = tourSites.map((s) => toMercatorUnit(s.gps));
    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const midLng = midX * 360 - 180;
    const n = Math.PI - 2 * Math.PI * midY;
    const midLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    const spanX = Math.max(1e-6, maxX - minX);
    const spanY = Math.max(1e-6, maxY - minY);

    // Reserve breathing margin for top/bottom mobile overlays and side HUDs
    const usableWidth = width < 768 ? width * 0.64 : width * 0.58;
    const usableHeight = width < 768 ? height * 0.42 : height * 0.54;

    const zoomX = Math.log2(usableWidth / (spanX * 256));
    const zoomY = Math.log2(usableHeight / (spanY * 256));
    const targetZoom = Math.max(9.8, Math.min(15.6, Math.min(zoomX, zoomY)));

    setPopupSite(null);
    flyTo({ lat: midLat, lng: midLng }, targetZoom, 820);
  }, [activeTour?.id, tourFocusTick, sites, flyTo, showInspectorDrawer]);

  // Standard Web Mercator Projection: Lat/Lng -> Screen Pixels
  const projectToScreen = useCallback(
    (coord: WGS84Coordinate, width: number, height: number) => {
      const numTiles = Math.pow(2, zoom);
      const centerWorldX = ((center.lng + 180) / 360) * 256 * numTiles;
      const sinCenterLat = Math.sin((center.lat * Math.PI) / 180);
      const centerWorldY =
        (0.5 - Math.log((1 + sinCenterLat) / (1 - sinCenterLat)) / (4 * Math.PI)) * 256 * numTiles;

      const targetWorldX = ((coord.lng + 180) / 360) * 256 * numTiles;
      const sinTargetLat = Math.sin((coord.lat * Math.PI) / 180);
      const targetWorldY =
        (0.5 - Math.log((1 + sinTargetLat) / (1 - sinTargetLat)) / (4 * Math.PI)) * 256 * numTiles;

      const screenX = width / 2 + (targetWorldX - centerWorldX);
      const screenY = height / 2 + (targetWorldY - centerWorldY);

      return { x: screenX, y: screenY };
    },
    [center, zoom]
  );

  // Inverse Projection: Screen Pixels -> WGS84
  const projectToGeo = useCallback(
    (screenX: number, screenY: number, width: number, height: number): WGS84Coordinate => {
      const numTiles = Math.pow(2, zoom);
      const centerWorldX = ((center.lng + 180) / 360) * 256 * numTiles;
      const sinCenterLat = Math.sin((center.lat * Math.PI) / 180);
      const centerWorldY =
        (0.5 - Math.log((1 + sinCenterLat) / (1 - sinCenterLat)) / (4 * Math.PI)) * 256 * numTiles;

      const targetWorldX = centerWorldX + (screenX - width / 2);
      const targetWorldY = centerWorldY + (screenY - height / 2);

      const targetLng = (targetWorldX / (256 * numTiles)) * 360 - 180;
      const n = Math.PI - (2 * Math.PI * targetWorldY) / (256 * numTiles);
      const targetLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

      return { lat: targetLat, lng: targetLng };
    },
    [center, zoom]
  );

  const tileRafRef = useRef<number | null>(null);

  // Fast tile loader with caching, automatic fallback, and rAF-batched repaint
  const loadTile = useCallback((url: string, fallbackUrl?: string): HTMLImageElement | null => {
    if (tileImageCache.has(url)) {
      const img = tileImageCache.get(url)!;
      return img.complete && img.naturalWidth > 0 ? img : null;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    let usedFallback = false;
    img.onload = () => {
      if (tileRafRef.current === null) {
        tileRafRef.current = requestAnimationFrame(() => {
          tileRafRef.current = null;
          setTileRerenderTick((t) => t + 1);
        });
      }
    };
    img.onerror = () => {
      if (!usedFallback && fallbackUrl) {
        usedFallback = true;
        img.src = fallbackUrl;
      }
    };
    img.src = url;
    tileImageCache.set(url, img);
    return null;
  }, []);

  // Marker Clustering Algorithm (only in non-route GIS mode when zoom < 14)
  const getClustersAndUnclustered = useCallback(
    (width: number, height: number) => {
      if (zoom >= 14 || activeTour) {
        return { clusters: [], unclustered: sites };
      }

      const clusterRadius = 45; // screen pixels
      const clusters: MarkerCluster[] = [];
      const assigned = new Set<string>();

      sites.forEach((site) => {
        if (assigned.has(site.id)) return;
        const p = projectToScreen(site.gps, width, height);

        const neighbors: HeritageSite[] = [site];
        assigned.add(site.id);

        sites.forEach((other) => {
          if (assigned.has(other.id)) return;
          const otherP = projectToScreen(other.gps, width, height);
          const dist = Math.hypot(p.x - otherP.x, p.y - otherP.y);
          if (dist < clusterRadius) {
            neighbors.push(other);
            assigned.add(other.id);
          }
        });

        if (neighbors.length > 1) {
          const avgLat = neighbors.reduce((acc, cur) => acc + cur.gps.lat, 0) / neighbors.length;
          const avgLng = neighbors.reduce((acc, cur) => acc + cur.gps.lng, 0) / neighbors.length;
          const centerGeo = { lat: avgLat, lng: avgLng };
          const centerScreen = projectToScreen(centerGeo, width, height);

          clusters.push({
            id: `cl-${site.id}`,
            count: neighbors.length,
            centerGeo,
            screenX: centerScreen.x,
            screenY: centerScreen.y,
            sites: neighbors,
          });
        }
      });

      const unclustered = sites.filter(
        (site) => !clusters.some((cl) => cl.sites.some((s) => s.id === site.id))
      );

      return { clusters, unclustered };
    },
    [sites, zoom, activeTour, projectToScreen]
  );

  // Layer 1: Base Slippy Map Tiles (Satellite / Dark / Split Compare — NEVER redraws on Spyglass mousemove or marker hover)
  useEffect(() => {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 1000;
    const height = canvas.parentElement?.clientHeight || 700;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const drawTiles = (
      tileMode: 'standard' | 'satellite' | 'historical',
      clipXStart: number,
      clipWidth: number,
      enableHistoricalOverlay = false,
      applyInlineCanvasFilter = false
    ) => {
      const isSatellite = tileMode === 'satellite';
      const isHistorical = tileMode === 'historical';

      ctx.save();
      ctx.beginPath();
      ctx.rect(clipXStart, 0, clipWidth, height);
      ctx.clip();

      const tileZoom = Math.floor(zoom);
      const numTiles = Math.pow(2, tileZoom);
      const tileSize = 256;

      const centerWorldX = ((center.lng + 180) / 360) * numTiles * tileSize;
      const sinLat = Math.sin((center.lat * Math.PI) / 180);
      const centerWorldY =
        (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * numTiles * tileSize;

      const scaleFraction = Math.pow(2, zoom - tileZoom);
      const scaledTileSize = tileSize * scaleFraction;

      const minTileX = Math.floor((centerWorldX - width / 2 / scaleFraction) / tileSize) - 1;
      const maxTileX = Math.floor((centerWorldX + width / 2 / scaleFraction) / tileSize) + 1;
      const minTileY = Math.floor((centerWorldY - height / 2 / scaleFraction) / tileSize) - 1;
      const maxTileY = Math.floor((centerWorldY + height / 2 / scaleFraction) / tileSize) + 1;

      ctx.fillStyle = isSatellite ? '#1C1917' : '#EFE8DA';
      ctx.fillRect(clipXStart, 0, clipWidth, height);

      ctx.save();
      if (applyInlineCanvasFilter) {
        if (tileMode === 'standard' || isHistorical) {
          ctx.filter = 'brightness(101%) contrast(98%) saturate(88%)';
        } else {
          ctx.filter = 'none';
        }
      }

      for (let tx = minTileX; tx <= maxTileX; tx++) {
        for (let ty = minTileY; ty <= maxTileY; ty++) {
          if (ty < 0 || ty >= numTiles) continue;
          const wrappedTx = ((tx % numTiles) + numTiles) % numTiles;

          const screenX = width / 2 + (tx * tileSize - centerWorldX) * scaleFraction;
          const screenY = height / 2 + (ty * tileSize - centerWorldY) * scaleFraction;

          if (isSatellite) {
            // Satellite: Esri World Imagery + transparent Esri World Boundaries & Places labels overlay
            const satUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${tileZoom}/${ty}/${wrappedTx}`;
            const imgSat = loadTile(satUrl);
            if (imgSat) {
              ctx.drawImage(imgSat, screenX, screenY, scaledTileSize, scaledTileSize);
            }
            const boundariesUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${tileZoom}/${ty}/${wrappedTx}`;
            const imgLabels = loadTile(boundariesUrl);
            if (imgLabels) {
              ctx.drawImage(imgLabels, screenX, screenY, scaledTileSize, scaledTileSize);
            }
          } else {
            // Bright readable Street Map (OpenStreetMap + Esri World Street Map fallback) for BOTH Street & Historical modes
            const osmUrl = `https://tile.openstreetmap.org/${tileZoom}/${wrappedTx}/${ty}.png`;
            const streetFallbackUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${tileZoom}/${ty}/${wrappedTx}`;
            const imgBase = loadTile(osmUrl, streetFallbackUrl);
            if (imgBase) {
              ctx.drawImage(imgBase, screenX, screenY, scaledTileSize, scaledTileSize);
            }
          }
        }
      }
      ctx.restore();

      if (showWaterways) {
        drawWaterwayEnhancement(ctx, width, height, isSatellite);
      }

      if (showDistricts) {
        drawDistrictBorders(ctx, width, height, isSatellite);
      }

      if (enableHistoricalOverlay) {
        const eraOverlayId =
          activeTimelineMilestone.id !== 'present'
            ? activeTimelineMilestone.id
            : baseMapMode === 'historical_1966'
            ? '1955'
            : baseMapMode === 'historical_1898'
            ? '1865'
            : '1815';
        drawHistoricalMapOverlay(ctx, width, height, eraOverlayId, historicalOpacity);
      }

      ctx.restore();
    };

    if (isSplitCompare) {
      const splitPixel = (width * splitSliderX) / 100;
      drawTiles('historical', 0, splitPixel, true, true);
      drawTiles('satellite', splitPixel, width - splitPixel, false, true);

      ctx.save();
      ctx.strokeStyle = '#D8C9A9';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(splitPixel, 0);
      ctx.lineTo(splitPixel, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(splitPixel, height / 2, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#D8C9A9';
      ctx.shadowColor = 'rgba(23,24,23,0.65)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#C9A46A';
      ctx.stroke();

      ctx.fillStyle = '#171817';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('◄ ►', splitPixel, height / 2);

      const splitLeftLabel =
        lang === 'en'
          ? '◄ HISTORICAL 1815/1898'
          : lang === 'zh'
          ? '◄ 1815/1898 古舆图'
          : '◄ BẢN ĐỒ CỔ 1815/1898';
      const splitRightLabel =
        lang === 'en'
          ? 'SATELLITE 2026 ►'
          : lang === 'zh'
          ? '2026 卫星图 ►'
          : 'VỆ TINH 2026 ►';

      ctx.fillStyle = '#171817';
      ctx.fillRect(splitPixel - 155, 58, 142, 24);
      ctx.strokeStyle = '#C9A46A';
      ctx.lineWidth = 1;
      ctx.strokeRect(splitPixel - 155, 58, 142, 24);
      ctx.fillStyle = '#C9A46A';
      ctx.font = 'bold 9.5px monospace';
      ctx.fillText(splitLeftLabel, splitPixel - 84, 70);

      ctx.fillStyle = '#171817';
      ctx.fillRect(splitPixel + 13, 58, 132, 24);
      ctx.strokeStyle = '#C9A46A';
      ctx.strokeRect(splitPixel + 13, 58, 132, 24);
      ctx.fillStyle = '#D8C9A9';
      ctx.fillText(splitRightLabel, splitPixel + 79, 70);
      ctx.restore();
    } else {
      const resolvedTileMode: 'standard' | 'satellite' | 'historical' =
        isSpyglassLensMode || baseMapMode === 'satellite'
          ? 'satellite'
          : baseMapMode.startsWith('historical')
          ? 'historical'
          : 'standard';
      drawTiles(
        resolvedTileMode,
        0,
        width,
        !isSpyglassLensMode && baseMapMode.startsWith('historical'),
        false
      );
    }
  }, [
    center,
    zoom,
    baseMapMode,
    isSplitCompare,
    splitSliderX,
    historicalOpacity,
    isSpyglassLensMode,
    showDistricts,
    showWaterways,
    tileRerenderTick,
    activeTimelineMilestone.id,
    lang,
    loadTile,
  ]);

  // Layer 2: 1:1 Coordinate-Locked Antique Map Buffer for Spyglass (redraws only on pan/zoom/region change, NOT on mousemove)
  useEffect(() => {
    if (!isSpyglassLensMode) return;
    const lensCanvas = lensBufferCanvasRef.current;
    if (!lensCanvas) return;
    const ctx = lensCanvas.getContext('2d');
    if (!ctx) return;

    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 700;
    if (lensCanvas.width !== width) lensCanvas.width = width;
    if (lensCanvas.height !== height) lensCanvas.height = height;

    ctx.fillStyle = '#1D1710';
    ctx.fillRect(0, 0, width, height);

    const tileZoom = Math.floor(zoom);
    const numTiles = Math.pow(2, tileZoom);
    const tileSize = 256;
    const centerWorldX = ((center.lng + 180) / 360) * numTiles * tileSize;
    const sinLat = Math.sin((center.lat * Math.PI) / 180);
    const centerWorldY =
      (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * numTiles * tileSize;
    const scaleFraction = Math.pow(2, zoom - tileZoom);
    const scaledTileSize = tileSize * scaleFraction;

    const minTileX = Math.floor((centerWorldX - width / 2 / scaleFraction) / tileSize) - 1;
    const maxTileX = Math.floor((centerWorldX + width / 2 / scaleFraction) / tileSize) + 1;
    const minTileY = Math.floor((centerWorldY - height / 2 / scaleFraction) / tileSize) - 1;
    const maxTileY = Math.floor((centerWorldY + height / 2 / scaleFraction) / tileSize) + 1;

    ctx.save();
    ctx.filter = 'sepia(0.75) contrast(1.18) brightness(0.88)';
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        if (ty < 0 || ty >= numTiles) continue;
        const wrappedTx = ((tx % numTiles) + numTiles) % numTiles;
        const screenX = width / 2 + (tx * tileSize - centerWorldX) * scaleFraction;
        const screenY = height / 2 + (ty * tileSize - centerWorldY) * scaleFraction;

        const topoUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${tileZoom}/${ty}/${wrappedTx}`;
        const imgTopo = loadTile(topoUrl);
        if (imgTopo) {
          ctx.drawImage(imgTopo, screenX, screenY, scaledTileSize, scaledTileSize);
        } else {
          const satFallbackUrl = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${tileZoom}/${ty}/${wrappedTx}`;
          const imgSatFallback = loadTile(satFallbackUrl);
          if (imgSatFallback) {
            ctx.drawImage(imgSatFallback, screenX, screenY, scaledTileSize, scaledTileSize);
          }
        }
      }
    }
    ctx.restore();

    // Subtle parchment glaze inside lens
    ctx.fillStyle = 'rgba(197, 160, 89, 0.12)';
    ctx.fillRect(0, 0, width, height);

    // World-locked Geodetic Coordinate Grid (1:1 locked to lat/lng)
    const gridStepDeg = zoom >= 15.2 ? 0.004 : zoom >= 13.5 ? 0.01 : 0.04;
    const topLeftGeo = projectToGeo(0, 0, width, height);
    const bottomRightGeo = projectToGeo(width, height, width, height);
    const startLat = Math.floor(bottomRightGeo.lat / gridStepDeg) * gridStepDeg;
    const endLat = Math.ceil(topLeftGeo.lat / gridStepDeg) * gridStepDeg;
    const startLng = Math.floor(topLeftGeo.lng / gridStepDeg) * gridStepDeg;
    const endLng = Math.ceil(bottomRightGeo.lng / gridStepDeg) * gridStepDeg;

    ctx.strokeStyle = 'rgba(197, 160, 89, 0.34)';
    ctx.lineWidth = 0.8;
    for (let gLat = startLat; gLat <= endLat; gLat += gridStepDeg) {
      const pL = projectToScreen({ lat: gLat, lng: startLng }, width, height);
      const pR = projectToScreen({ lat: gLat, lng: endLng }, width, height);
      ctx.beginPath();
      ctx.moveTo(pL.x, pL.y);
      ctx.lineTo(pR.x, pR.y);
      ctx.stroke();
    }
    for (let gLng = startLng; gLng <= endLng; gLng += gridStepDeg) {
      const pT = projectToScreen({ lat: endLat, lng: gLng }, width, height);
      const pB = projectToScreen({ lat: startLat, lng: gLng }, width, height);
      ctx.beginPath();
      ctx.moveTo(pT.x, pT.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.stroke();
    }

    // Regional Historical Cartographic Overlays (World-Projected 1:1)
    if (lensRegionKey === 'saigon_core') {
      drawHistoricalMapOverlay(ctx, width, height, '1815', 0.75);
      drawHistoricalMapOverlay(ctx, width, height, '1865', 0.65);
    } else if (lensRegionKey === 'cholon_giadinh') {
      const pCholon = projectToScreen({ lat: 10.7525, lng: 106.663 }, width, height);
      const pGiacLam = projectToScreen({ lat: 10.7795, lng: 106.6476 }, width, height);
      const pLangOng = projectToScreen({ lat: 10.8025, lng: 106.6974 }, width, height);
      ctx.strokeStyle = 'rgba(243, 202, 110, 0.78)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(pCholon.x, pCholon.y);
      ctx.lineTo(pGiacLam.x, pGiacLam.y);
      ctx.lineTo(pLangOng.x, pLangOng.y);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (lensRegionKey === 'cuchi_binhduong') {
      const pCuChi = projectToScreen({ lat: 11.1436, lng: 106.4628 }, width, height);
      const pBenCat = projectToScreen({ lat: 11.138, lng: 106.578 }, width, height);
      const radZone = Math.max(40, Math.pow(2, zoom - 13) * 75);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.72)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(pCuChi.x, pCuChi.y, radZone, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pBenCat.x, pBenCat.y, radZone * 0.85, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (lensRegionKey === 'vungtau_cangio') {
      const pBachDinh = projectToScreen({ lat: 10.3497, lng: 107.0706 }, width, height);
      const pCanGio = projectToScreen({ lat: 10.415, lng: 106.955 }, width, height);
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.7)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(pBachDinh.x, pBachDinh.y);
      ctx.lineTo(pCanGio.x, pCanGio.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [
    isSpyglassLensMode,
    center,
    zoom,
    tileRerenderTick,
    lensRegionKey,
    loadTile,
    projectToGeo,
    projectToScreen,
  ]);

  // Keep pinned Spyglass position synced on center/zoom/selection changes (0 React re-renders on cursor tracking)
  useEffect(() => {
    if (!isSpyglassLensMode) return;
    const width = containerRef.current?.clientWidth || 1000;
    const height = containerRef.current?.clientHeight || 700;
    const activeSiteForLens =
      (activeMapHeritageId
        ? sites.find((s) => resolveHeritageVideoId(s.id) === activeMapHeritageId)
        : null) ||
      selectedSite ||
      sites[0];
    const activeScreen = activeSiteForLens
      ? projectToScreen(activeSiteForLens.gps, width, height)
      : { x: width * 0.5, y: height * 0.5 };

    const usePinnedPos = isLensLocked || lensPinnedToSiteRef.current || !lensCurrentPosRef.current;
    const pos = usePinnedPos ? activeScreen : lensCurrentPosRef.current!;
    if (usePinnedPos) {
      lensCurrentPosRef.current = pos;
    }
    applySpyglassDomTransform(pos.x, pos.y);
  }, [
    isSpyglassLensMode,
    isLensLocked,
    center,
    zoom,
    selectedSite,
    activeMapHeritageId,
    sites,
    projectToScreen,
    applySpyglassDomTransform,
  ]);

  // Layer 3: Interactive Vector & Marker Overlay Canvas (routes, buffer zones, markers, clusters, GIS [i] pins, measurement)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 1000;
    const height = canvas.parentElement?.clientHeight || 700;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    if (activeTour) {
      drawTourRoute(ctx, width, height, activeTour, sites);
    }

    if (showProtectionZones && selectedSite) {
      drawHeritageProtectionZones(ctx, width, height, selectedSite);
    }

    drawMarkersAndClusters(ctx, width, height);

    if (measureMode && measurePointA) {
      drawMeasurementLine(ctx, width, height);
    }
  }, [
    center,
    zoom,
    sites,
    selectedSite,
    hoveredSite,
    hoveredCluster,
    activeTour,
    measureMode,
    measurePointA,
    measurePointB,
    showProtectionZones,
    projectToScreen,
    getClustersAndUnclustered,
    lang,
    formatDistrictName,
    getLocalizedSite,
    baseMapMode,
    isSpyglassLensMode,
    mobileTimelineSlider,
    getSiteHistoricalEraStatus,
  ]);

  // Enhanced Saigon River & Living Canal Waterways (Nước xanh đen dịu)
  const drawWaterwayEnhancement = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isSatellite: boolean
  ) => {
    ctx.save();
    const riverCoords: WGS84Coordinate[] = [
      { lat: 10.842, lng: 106.726 },
      { lat: 10.825, lng: 106.722 },
      { lat: 10.805, lng: 106.716 },
      { lat: 10.792, lng: 106.711 },
      { lat: 10.781, lng: 106.708 },
      { lat: 10.768, lng: 106.709 },
      { lat: 10.755, lng: 106.717 },
      { lat: 10.738, lng: 106.732 },
    ];

    // Subtle river tint that preserves crisp legibility on warm light map
    ctx.strokeStyle = isSatellite ? 'rgba(30, 58, 80, 0.42)' : 'rgba(82, 109, 139, 0.16)';
    ctx.lineWidth = Math.max(16, Math.pow(2, zoom - 12) * 15);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    riverCoords.forEach((coord, i) => {
      const p = projectToScreen(coord, width, height);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Rạch Bến Nghé / Kênh Tàu Hủ
    const benNgheCanal: WGS84Coordinate[] = [
      { lat: 10.768, lng: 106.708 },
      { lat: 10.764, lng: 106.699 },
      { lat: 10.758, lng: 106.685 },
      { lat: 10.752, lng: 106.669 },
    ];
    ctx.strokeStyle = isSatellite ? 'rgba(30, 58, 80, 0.38)' : 'rgba(82, 109, 139, 0.14)';
    ctx.lineWidth = Math.max(4.5, Math.pow(2, zoom - 13) * 4.5);
    ctx.beginPath();
    benNgheCanal.forEach((c, idx) => {
      const p = projectToScreen(c, width, height);
      if (idx === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    ctx.restore();
  };

  // District Boundaries & Centroid Labels
  const drawDistrictBorders = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isDarkSurface: boolean
  ) => {
    ctx.save();
    const districtCentroids: { name: string; coord: WGS84Coordinate }[] = [
      { name: 'Quận 1', coord: { lat: 10.7756, lng: 106.7004 } },
      { name: 'Quận 3', coord: { lat: 10.7844, lng: 106.6844 } },
      { name: 'Quận 5 (Chợ Lớn)', coord: { lat: 10.7541, lng: 106.6631 } },
      { name: 'Quận 4', coord: { lat: 10.762, lng: 106.705 } },
      { name: 'Bình Thạnh', coord: { lat: 10.803, lng: 106.699 } },
    ];

    districtCentroids.forEach((dist) => {
      const p = projectToScreen(dist.coord, width, height);
      if (p.x < -40 || p.x > width + 40 || p.y < -40 || p.y > height + 40) return;

      if (zoom >= 13 && zoom <= 16) {
        ctx.font = '600 11px sans-serif';
        ctx.textAlign = 'center';
        const label = formatDistrictName(dist.name).toUpperCase();
        if (isDarkSurface) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fillText(label, p.x, p.y);
        } else {
          ctx.strokeStyle = 'rgba(255, 253, 249, 0.85)';
          ctx.lineWidth = 3;
          ctx.strokeText(label, p.x, p.y);
          ctx.fillStyle = 'rgba(28, 25, 23, 0.56)';
          ctx.fillText(label, p.x, p.y);
        }
      }
    });

    ctx.restore();
  };

  // Protection Buffer Zones: Vàng đồng nhạt, opacity 0.12, bỏ nhãn chữ đỏ
  const drawHeritageProtectionZones = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    site: HeritageSite
  ) => {
    const p = projectToScreen(site.gps, width, height);
    ctx.save();
    const scale = Math.pow(2, zoom - 14);
    const r1 = Math.max(22, 38 * scale);
    const r2 = Math.max(48, 85 * scale);

    // Vành đai bảo vệ II
    ctx.beginPath();
    ctx.arc(p.x, p.y, r2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201, 161, 91, 0.3)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]);
    ctx.stroke();

    ctx.fillStyle = 'rgba(201, 161, 91, 0.04)';
    ctx.fill();

    // Vành đai bảo vệ I (Vàng đồng nhạt thay đỏ, opacity 0.12)
    ctx.beginPath();
    ctx.arc(p.x, p.y, r1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(201, 161, 91, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);
    ctx.stroke();

    ctx.fillStyle = 'rgba(201, 161, 91, 0.12)';
    ctx.fill();

    ctx.restore();
  };

  // Crisp High-Contrast Vector Historical Overlays (Zero dark brown canvas wash; street map remains bright & legible)
  const drawCrispMapLabel = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    textColor = '#A63A2B',
    font = '700 11px sans-serif',
    align: CanvasTextAlign = 'center'
  ) => {
    ctx.save();
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    const metrics = ctx.measureText(text);
    const padX = 8;
    const boxW = metrics.width + padX * 2;
    const boxH = 20;
    const boxX =
      align === 'center' ? x - boxW / 2 : align === 'right' ? x - boxW : x;
    const boxY = y - boxH / 2;

    ctx.fillStyle = 'rgba(255, 253, 249, 0.94)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 6);
    ctx.fill();
    ctx.strokeStyle = 'rgba(28, 25, 23, 0.22)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.fillText(text, x, y + 0.5);
    ctx.restore();
  };

  const drawHistoricalMapOverlay = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    eraId: '1815' | '1865' | '1925' | '1955' | 'present' | BaseMapMode,
    opacity: number
  ) => {
    if (opacity <= 0.01) return;

    const normalizedEra =
      eraId === 'historical_1815'
        ? '1815'
        : eraId === 'historical_1898'
        ? '1865'
        : eraId === 'historical_1966'
        ? '1955'
        : eraId;

    if (normalizedEra === 'present' || normalizedEra === 'admin' || normalizedEra === 'satellite') {
      return;
    }

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));

    const pPalace = projectToScreen({ lat: 10.777, lng: 106.6953 }, width, height);
    const pCathedral = projectToScreen({ lat: 10.7798, lng: 106.699 }, width, height);
    const pTheatre = projectToScreen({ lat: 10.7767, lng: 106.7032 }, width, height);
    const pBenThanh = projectToScreen({ lat: 10.7725, lng: 106.698 }, width, height);
    const pNhaRong = projectToScreen({ lat: 10.7683, lng: 106.7068 }, width, height);
    const pMuseum = projectToScreen({ lat: 10.7879, lng: 106.7048 }, width, height);

    if (normalizedEra === '1815') {
      // 1815: Thành Bát Quái (Thành Quy 1790–1835) & Thành Phụng (1836)
      const pCenter = projectToScreen({ lat: 10.7785, lng: 106.6975 }, width, height);
      const rad = Math.max(46, Math.pow(2, zoom - 14) * 130);

      // Outer moat (Hào thành Bát Quái)
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.55)';
      ctx.lineWidth = 6.5;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + Math.PI / 8;
        const x = pCenter.x + (rad + 11) * Math.cos(angle);
        const y = pCenter.y + (rad + 11) * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Octagonal Citadel Rampart (Thành Bát Quái)
      ctx.fillStyle = 'rgba(166, 58, 43, 0.16)';
      ctx.strokeStyle = '#A63A2B';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + Math.PI / 8;
        const x = pCenter.x + rad * Math.cos(angle);
        const y = pCenter.y + rad * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 8 Vauban bastion nodes
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + Math.PI / 8;
        const x = pCenter.x + rad * Math.cos(angle);
        const y = pCenter.y + rad * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#A63A2B';
        ctx.fill();
        ctx.strokeStyle = '#FFFDF9';
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // Thành Phụng (1836) inner square citadel footprint
      const pPhung = projectToScreen({ lat: 10.7812, lng: 106.6992 }, width, height);
      const halfPhung = Math.max(24, Math.pow(2, zoom - 14) * 56);
      ctx.save();
      ctx.setLineDash([7, 4]);
      ctx.fillStyle = 'rgba(58, 102, 91, 0.14)';
      ctx.strokeStyle = '#2D5A4E';
      ctx.lineWidth = 2.2;
      ctx.fillRect(pPhung.x - halfPhung, pPhung.y - halfPhung, halfPhung * 2, halfPhung * 2);
      ctx.strokeRect(pPhung.x - halfPhung, pPhung.y - halfPhung, halfPhung * 2, halfPhung * 2);
      ctx.restore();

      drawCrispMapLabel(
        ctx,
        lang === 'en'
          ? 'GIA DINH OCTAGONAL CITADEL (1790–1835)'
          : lang === 'zh'
          ? '嘉定八卦城（1790–1835）'
          : 'THÀNH BÁT QUÁI (THÀNH QUY · 1790–1835)',
        pCenter.x,
        pCenter.y - rad - 20,
        '#A63A2B',
        '700 11px sans-serif'
      );

      drawCrispMapLabel(
        ctx,
        lang === 'en' ? 'PHUNG CITADEL (1836)' : lang === 'zh' ? '凤城遗址 (1836)' : 'THÀNH PHỤNG (1836)',
        pPhung.x,
        pPhung.y + halfPhung + 14,
        '#2D5A4E',
        '700 10.5px sans-serif'
      );
    } else if (normalizedEra === '1865') {
      // 1865: Early French Colonial Boulevard Grid & Kênh Lớn (Charner / Nguyễn Huệ)
      const pNorodomStart = pPalace;
      const pNorodomEnd = pMuseum;
      const pCharnerTop = projectToScreen({ lat: 10.7764, lng: 106.7008 }, width, height);
      const pCharnerBottom = projectToScreen({ lat: 10.7709, lng: 106.7056 }, width, height);

      // Core administrative planning zone polygon
      ctx.save();
      ctx.fillStyle = 'rgba(58, 102, 91, 0.08)';
      ctx.strokeStyle = 'rgba(58, 102, 91, 0.55)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.moveTo(pPalace.x - 28, pPalace.y - 24);
      ctx.lineTo(pMuseum.x + 28, pMuseum.y - 20);
      ctx.lineTo(pNhaRong.x + 24, pNhaRong.y + 18);
      ctx.lineTo(pBenThanh.x - 32, pBenThanh.y + 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Kênh Lớn / Đại lộ Charner (Nguyễn Huệ)
      ctx.save();
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.72)';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pCharnerTop.x, pCharnerTop.y);
      ctx.lineTo(pCharnerBottom.x, pCharnerBottom.y);
      ctx.stroke();
      ctx.restore();

      // Đại lộ Norodom (Lê Duẩn)
      ctx.save();
      ctx.strokeStyle = '#A63A2B';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(pNorodomStart.x, pNorodomStart.y);
      ctx.lineTo(pNorodomEnd.x, pNorodomEnd.y);
      ctx.stroke();

      // Đường Catinat (Đồng Khởi) & Đại lộ Bonard (Lê Lợi)
      ctx.strokeStyle = '#2D5A4E';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(pCathedral.x, pCathedral.y);
      ctx.lineTo(pTheatre.x, pTheatre.y);
      ctx.lineTo(pNhaRong.x - 10, pNhaRong.y - 12);
      ctx.stroke();

      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(pTheatre.x, pTheatre.y);
      ctx.lineTo(pBenThanh.x, pBenThanh.y);
      ctx.stroke();
      ctx.restore();

      drawCrispMapLabel(
        ctx,
        lang === 'en'
          ? '1865 COLONIAL BOULEVARD GRID'
          : lang === 'zh'
          ? '1865 早期城市林荫大道规划'
          : 'QUY HOẠCH ĐẠI LỘ SƠ KỲ (1865)',
        pCathedral.x,
        pCathedral.y - 26,
        '#A63A2B',
        '700 11px sans-serif'
      );
      drawCrispMapLabel(
        ctx,
        'ĐL. Norodom (Lê Duẩn)',
        (pNorodomStart.x + pNorodomEnd.x) / 2,
        (pNorodomStart.y + pNorodomEnd.y) / 2 - 14,
        '#A63A2B',
        '600 10px sans-serif'
      );
      drawCrispMapLabel(
        ctx,
        'Kênh Charner (Nguyễn Huệ)',
        (pCharnerTop.x + pCharnerBottom.x) / 2 + 18,
        (pCharnerTop.y + pCharnerBottom.y) / 2 + 12,
        '#1D4ED8',
        '600 10px sans-serif'
      );
      drawCrispMapLabel(
        ctx,
        'ĐL. Bonard (Lê Lợi)',
        (pTheatre.x + pBenThanh.x) / 2,
        (pTheatre.y + pBenThanh.y) / 2 + 16,
        '#B45309',
        '600 10px sans-serif'
      );
    } else if (normalizedEra === '1925') {
      // 1925: Sài Gòn – Chợ Lớn Urban Expansion & Regional Corridors
      const pChoLon = projectToScreen({ lat: 10.7525, lng: 106.663 }, width, height);
      const pThuDauMot = projectToScreen({ lat: 10.9804, lng: 106.6519 }, width, height);
      const pVungTau = projectToScreen({ lat: 10.3497, lng: 107.0706 }, width, height);

      // Trục Đại lộ Galliéni (Trần Hưng Đạo) nối Sài Gòn – Chợ Lớn
      ctx.save();
      ctx.strokeStyle = '#A63A2B';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(pBenThanh.x, pBenThanh.y);
      ctx.lineTo(pChoLon.x, pChoLon.y);
      ctx.stroke();

      // Regional corridors toward Thủ Dầu Một & Vũng Tàu
      ctx.setLineDash([8, 5]);
      ctx.strokeStyle = '#2D5A4E';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(pCathedral.x, pCathedral.y);
      ctx.lineTo(pThuDauMot.x, pThuDauMot.y);
      ctx.moveTo(pNhaRong.x, pNhaRong.y);
      ctx.lineTo(pVungTau.x, pVungTau.y);
      ctx.stroke();

      // Core Indochina civic perimeter
      const rad1925 = Math.max(54, Math.pow(2, zoom - 14) * 150);
      ctx.fillStyle = 'rgba(201, 164, 106, 0.14)';
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pCathedral.x, pCathedral.y, rad1925, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      drawCrispMapLabel(
        ctx,
        lang === 'en'
          ? 'SAIGON – CHO LON INDOCHINA AXIS (1925)'
          : lang === 'zh'
          ? '西贡－堤岸印支建筑轴线 (1925)'
          : 'MỞ RỘNG SÀI GÒN – CHỢ LỚN (1925)',
        pCathedral.x,
        pCathedral.y - 28,
        '#B45309',
        '700 11px sans-serif'
      );
      drawCrispMapLabel(
        ctx,
        'ĐL. Galliéni (Trần Hưng Đạo)',
        (pBenThanh.x + pChoLon.x) / 2,
        (pBenThanh.y + pChoLon.y) / 2 - 12,
        '#A63A2B',
        '600 10px sans-serif'
      );
    } else if (normalizedEra === '1955') {
      // 1955: Đô thành Sài Gòn (1955–1966) Ceremonial Axis & Regional Corridors
      const radCore = Math.max(50, Math.pow(2, zoom - 14) * 145);
      ctx.save();
      ctx.strokeStyle = '#A63A2B';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(pCathedral.x, pCathedral.y, radCore, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(166, 58, 43, 0.10)';
      ctx.fill();
      ctx.restore();

      // Trục Đại lộ Thống Nhất (Lê Duẩn) - Tự Do (Đồng Khởi) - Lê Lợi
      ctx.save();
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(pPalace.x, pPalace.y);
      ctx.lineTo(pCathedral.x, pCathedral.y);
      ctx.lineTo(pTheatre.x, pTheatre.y);
      ctx.lineTo(pBenThanh.x, pBenThanh.y);
      ctx.stroke();
      ctx.restore();

      drawCrispMapLabel(
        ctx,
        lang === 'en'
          ? 'SAIGON CAPITAL CEREMONIAL AXIS (1955–1966)'
          : lang === 'zh'
          ? '1955–1966 西贡都城礼仪中轴线'
          : 'TRỤC ĐÔ THÀNH SÀI GÒN (1955–1966)',
        pPalace.x,
        pPalace.y - 26,
        '#A63A2B',
        '700 11px sans-serif'
      );
    }

    ctx.restore();
  };

  // Refined Dashed Route Arc (Routes 1–8) & Golden Positioning Halo (Route 9 single destination)
  const drawTourRoute = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    tour: TourRoute,
    allSites: HeritageSite[]
  ) => {
    const tourSites = tour.sites
      .map((id) => allSites.find((s) => s.id === id))
      .filter(
        (s): s is HeritageSite =>
          Boolean(s && Number.isFinite(s.gps?.lat) && Number.isFinite(s.gps?.lng))
      );

    if (tourSites.length === 0) return;

    const routePalette = getTourRouteIndochineColor(tour);
    const routeHex = routePalette.primaryHex;

    ctx.save();

    // Only draw dashed connecting curve when route has 2+ distinct sites (Routes 1–8)
    if (tourSites.length >= 2) {
      for (let i = 0; i < tourSites.length - 1; i++) {
        const p1 = projectToScreen(tourSites[i].gps, width, height);
        const p2 = projectToScreen(tourSites[i + 1].gps, width, height);

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) continue;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const curveSign = i % 2 === 0 ? 1 : -1;
        const offset = Math.min(48, Math.max(12, dist * 0.18)) * curveSign;
        const cx = mx - (dy / dist) * offset;
        const cy = my + (dx / dist) * offset;

        // High-contrast casing for bright street/historical maps and dark satellite maps
        const isLightMap =
          (baseMapMode === 'admin' || baseMapMode.startsWith('historical')) &&
          !isSpyglassLensMode &&
          !isSplitCompare;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
        ctx.setLineDash([10, 7]);
        ctx.strokeStyle = isLightMap ? 'rgba(255, 253, 249, 0.95)' : 'rgba(23, 24, 23, 0.85)';
        ctx.lineWidth = 6.5;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 0;
        ctx.stroke();

        // Crisp dashed route polyline in the route's heritage pigment
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
        ctx.strokeStyle = routeHex;
        ctx.lineWidth = 3.6;
        ctx.shadowColor = routePalette.softBgRgba;
        ctx.shadowBlur = 4;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Midpoint directional arrow along the curve (1 -> 2)
        const arrowX = 0.25 * p1.x + 0.5 * cx + 0.25 * p2.x;
        const arrowY = 0.25 * p1.y + 0.5 * cy + 0.25 * p2.y;
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);
        ctx.fillStyle = routeHex;
        ctx.strokeStyle = isLightMap ? '#FFFDF9' : '#171817';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(-4.5, -5.2);
        ctx.lineTo(-1.5, 0);
        ctx.lineTo(-4.5, 5.2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Numbered pins 1, 2, 3... (Routes 1–8) or Single-Destination Positioning Halo (Route 9 — Bạch Dinh)
    const isSingleStopRoute = tourSites.length === 1;
    const isLightMap =
      (baseMapMode === 'admin' || baseMapMode.startsWith('historical')) &&
      !isSpyglassLensMode &&
      !isSplitCompare;
    tourSites.forEach((site, idx) => {
      const p = projectToScreen(site.gps, width, height);
      const isCurrentStop = selectedSite?.id === site.id;

      if (isSingleStopRoute) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 34, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(166, 58, 43, 0.14)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, 24, 0, Math.PI * 2);
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = routeHex;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, isCurrentStop ? 22 : 17, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentStop
          ? 'rgba(166, 58, 43, 0.22)'
          : routePalette.softBgRgba;
        ctx.fill();

        if (isCurrentStop) {
          ctx.strokeStyle = routeHex;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Main numbered badge
      ctx.beginPath();
      ctx.arc(p.x, p.y, isCurrentStop || isSingleStopRoute ? 14 : 12, 0, Math.PI * 2);
      ctx.fillStyle = routeHex;
      ctx.fill();
      ctx.strokeStyle = isLightMap ? '#FFFDF9' : '#171817';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Inner stop number (1 -> 2 -> 3)
      ctx.fillStyle = routePalette.fgHex;
      ctx.font = 'bold 11.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${idx + 1}`, p.x, p.y + 0.5);

      // Permanent legible monument label beneath each stop of the active route
      ctx.save();
      const shortName = getLocalizedSite(site).officialName.split(/\s*[-–(（]/)[0].trim();
      ctx.font = isCurrentStop || isSingleStopRoute ? '700 11.5px sans-serif' : '600 10.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const labelY = p.y + (isSingleStopRoute ? 24 : 18);
      if (isLightMap) {
        ctx.strokeStyle = 'rgba(255, 253, 249, 0.96)';
        ctx.lineWidth = 4;
        ctx.strokeText(shortName, p.x, labelY);
        ctx.fillStyle = isCurrentStop ? '#A63A2B' : '#1C1917';
        ctx.fillText(shortName, p.x, labelY);
      } else {
        ctx.strokeStyle = 'rgba(23, 24, 23, 0.94)';
        ctx.lineWidth = 3.5;
        ctx.strokeText(shortName, p.x, labelY);
        ctx.fillStyle = '#FAF6EE';
        ctx.fillText(shortName, p.x, labelY);
      }
      ctx.restore();
    });

    ctx.restore();
  };

  // Draw Custom Map Markers, Clusters & Dimmed 6px Non-Tour Dots
  const drawMarkersAndClusters = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const { clusters, unclustered } = getClustersAndUnclustered(width, height);

    // 1. Draw Cluster Markers (only when activeTour is null)
    clusters.forEach((cl) => {
      const isHovered = hoveredCluster?.id === cl.id;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cl.screenX, cl.screenY, isHovered ? 27 : 23, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201, 164, 106, 0.18)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(201, 164, 106, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cl.screenX, cl.screenY, isHovered ? 21 : 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(23, 24, 23, 0.85)';
      ctx.fill();
      ctx.strokeStyle = '#A94F3D';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cl.screenX, cl.screenY, isHovered ? 15.5 : 13.5, 0, Math.PI * 2);
      ctx.fillStyle = '#171817';
      ctx.fill();
      ctx.strokeStyle = '#C9A46A';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#D8C9A9';
      ctx.font = '800 12px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${cl.count}`, cl.screenX, cl.screenY + 0.5);

      ctx.restore();
    });

    // 2. Draw Individual Sites (Color-blocked by the 4 Heritage Pigments)
    unclustered.forEach((site) => {
      const p = projectToScreen(site.gps, width, height);
      if (p.x < -80 || p.x > width + 80 || p.y < -80 || p.y > height + 80) return;

      const isSelected = selectedSite?.id === site.id;
      const isHovered = hoveredSite?.id === site.id;
      const isInActiveTour = activeTour?.sites.includes(site.id) ?? false;
      const siteBlock = getHeritageColorBlock(site, lang);

      if (activeTour) {
        if (!isInActiveTour) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, isSelected || isHovered ? 4.5 : 3, 0, Math.PI * 2);
          ctx.fillStyle =
            isSelected || isHovered
              ? '#C9A46A'
              : 'rgba(216, 201, 169, 0.36)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(23, 24, 23, 0.85)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }

        if (isSelected || isHovered) {
          ctx.save();
          ctx.font = isSelected ? '600 11.5px sans-serif' : '500 10.5px sans-serif';
          const labelText = getLocalizedSite(site).officialName;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.strokeStyle = 'rgba(23, 24, 23, 0.92)';
          ctx.lineWidth = 3.5;
          const labelY = p.y + (isInActiveTour ? 18 : 8);
          ctx.strokeText(labelText, p.x, labelY);
          ctx.fillStyle = '#D8C9A9';
          ctx.fillText(labelText, p.x, labelY);
          ctx.restore();
        }
        return;
      }

      const historicalFilterActive =
        (baseMapMode.startsWith('historical') || isSpyglassLensMode) &&
        activeTimelineMilestone.id !== 'present';
      const eraStatus = getSiteHistoricalEraStatus(
        site,
        activeTimelineMilestone.id,
        activeTimelineMilestone.yearNum,
        historicalFilterActive
      );

      const isSpecialNational = site.rankingLevel === 'Special National';
      const pinColor = eraStatus.isBuilt ? siteBlock.bg : '#353735';
      const pinRadius = isSpecialNational
        ? isSelected
          ? 12.5
          : isHovered
          ? 11.5
          : eraStatus.isBuilt
          ? 10.5
          : 8
        : isSelected
        ? 11
        : isHovered
        ? 10
        : eraStatus.isBuilt
        ? 8.5
        : 7;

      ctx.save();
      if (!eraStatus.isBuilt) {
        ctx.globalAlpha = isSelected || isHovered ? 0.72 : 0.36;
      }

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, isSpecialNational ? 24 : 21, 0, Math.PI * 2);
        ctx.fillStyle = eraStatus.isBuilt
          ? 'rgba(201, 164, 106, 0.28)'
          : 'rgba(216, 201, 169, 0.14)';
        ctx.fill();
        ctx.strokeStyle = eraStatus.isBuilt ? '#C9A46A' : 'rgba(216, 201, 169, 0.55)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (historicalFilterActive && eraStatus.isBuilt) {
        // Highlight monuments that already existed in the selected historical era
        ctx.beginPath();
        ctx.arc(p.x, p.y, isHovered ? 21 : 17, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201, 164, 106, 0.24)';
        ctx.fill();
        ctx.strokeStyle = '#C9A46A';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, isHovered ? 19 : 15, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(23, 24, 23, 0.35)';
        ctx.fill();
        ctx.strokeStyle = isHovered ? '#D8C9A9' : 'rgba(216, 201, 169, 0.45)';
        ctx.lineWidth = 1.2;
        if (!eraStatus.isBuilt) ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.save();
      ctx.shadowColor = 'rgba(23, 24, 23, 0.75)';
      ctx.shadowBlur = isSelected || isHovered ? 12 : 7;

      ctx.beginPath();
      ctx.arc(p.x, p.y, pinRadius, 0, Math.PI * 2);
      ctx.fillStyle = pinColor;
      ctx.fill();
      ctx.restore();

      const isLightBase =
        (baseMapMode === 'admin' || baseMapMode.startsWith('historical')) &&
        !isSpyglassLensMode &&
        !isSplitCompare;

      ctx.beginPath();
      ctx.arc(p.x, p.y, pinRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isLightBase
        ? '#FFFDF9'
        : eraStatus.isBuilt
        ? '#D8C9A9'
        : 'rgba(216, 201, 169, 0.5)';
      ctx.lineWidth = eraStatus.isBuilt ? 2.2 : 1.2;
      ctx.stroke();

      if (isSpecialNational && eraStatus.isBuilt) {
        ctx.fillStyle = siteBlock.fg;
        ctx.font = 'bold 10.5px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', p.x, p.y + 0.5);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = eraStatus.isBuilt ? siteBlock.fg : 'rgba(216, 201, 169, 0.55)';
        ctx.fill();
      }

      const shouldShowLabel =
        isSelected ||
        isHovered ||
        zoom >= 14.4 ||
        (historicalFilterActive && eraStatus.isBuilt && zoom >= 13.2);
      if (shouldShowLabel) {
        ctx.font = isSelected ? '700 11.5px sans-serif' : '600 10.5px sans-serif';
        const labelText = eraStatus.displayName;

        let line1 = labelText;
        let line2 = '';
        if (labelText.length > 22 && labelText.includes(' ')) {
          const words = labelText.split(' ');
          const mid = Math.ceil(words.length / 2);
          line1 = words.slice(0, mid).join(' ');
          line2 = words.slice(mid).join(' ');
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        if (isLightBase) {
          ctx.strokeStyle = 'rgba(255, 253, 249, 0.96)';
          ctx.lineWidth = 4;
          ctx.strokeText(line1, p.x, p.y + pinRadius + 5);
          if (line2) {
            ctx.strokeText(line2, p.x, p.y + pinRadius + 17);
          }

          ctx.fillStyle = isSelected ? '#A63A2B' : '#1C1917';
          ctx.fillText(line1, p.x, p.y + pinRadius + 5);
          if (line2) {
            ctx.fillText(line2, p.x, p.y + pinRadius + 17);
          }
        } else {
          ctx.strokeStyle = 'rgba(23, 24, 23, 0.94)';
          ctx.lineWidth = 3.5;
          ctx.strokeText(line1, p.x, p.y + pinRadius + 5);
          if (line2) {
            ctx.strokeText(line2, p.x, p.y + pinRadius + 17);
          }

          ctx.fillStyle = !eraStatus.isBuilt
            ? 'rgba(216, 201, 169, 0.75)'
            : isSelected || historicalFilterActive
            ? '#F3CA6E'
            : '#FAF6EE';
          ctx.fillText(line1, p.x, p.y + pinRadius + 5);
          if (line2) {
            ctx.fillText(line2, p.x, p.y + pinRadius + 17);
          }
        }

        if (!eraStatus.isBuilt && eraStatus.unbuiltNote) {
          const noteY = p.y + pinRadius + (line2 ? 30 : 18);
          ctx.font = '600 9.5px sans-serif';
          ctx.strokeStyle = isLightBase ? 'rgba(255, 253, 249, 0.95)' : 'rgba(23, 24, 23, 0.95)';
          ctx.lineWidth = 3;
          ctx.strokeText(eraStatus.unbuiltNote, p.x, noteY);
          ctx.fillStyle = isLightBase ? '#A63A2B' : '#D8C9A9';
          ctx.fillText(eraStatus.unbuiltNote, p.x, noteY);
        }
      }

      ctx.restore();
    });
  };

  // Measurement Line Tool
  const drawMeasurementLine = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    if (!measurePointA) return;
    const pA = projectToScreen(measurePointA, width, height);
    const pB = measurePointB
      ? projectToScreen(measurePointB, width, height)
      : projectToScreen(cursorWgs84, width, height);

    ctx.save();
    ctx.strokeStyle = '#C9A46A';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.stroke();

    ctx.fillStyle = '#A94F3D';
    ctx.beginPath();
    ctx.arc(pA.x, pA.y, 6, 0, Math.PI * 2);
    ctx.arc(pB.x, pB.y, 6, 0, Math.PI * 2);
    ctx.fill();

    const targetPt = measurePointB || cursorWgs84;
    const distKm = calculateDistanceKm(measurePointA, targetPt);
    const distText = distKm < 1 ? `${Math.round(distKm * 1000)} m` : `${distKm.toFixed(2)} km`;

    const midX = (pA.x + pB.x) / 2;
    const midY = (pA.y + pB.y) / 2;

    ctx.fillStyle = '#F4EFE4';
    ctx.beginPath();
    ctx.roundRect(midX - 40, midY - 12, 80, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#A94F3D';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#171817';
    ctx.font = 'bold 10.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(distText, midX, midY);

    ctx.restore();
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (showCoordinates || measureMode) {
      const geo = projectToGeo(screenX, screenY, canvas.width, canvas.height);
      setCursorWgs84(geo);
    }

    if (isSpyglassLensMode && !isLensLocked && !isPanning && animFrameRef.current === null) {
      if (lensPinnedToSiteRef.current) {
        const pinOrigin = lastPinClientPosRef.current;
        if (!pinOrigin) {
          lastPinClientPosRef.current = { x: e.clientX, y: e.clientY };
        } else if (Math.hypot(e.clientX - pinOrigin.x, e.clientY - pinOrigin.y) > 12) {
          lensPinnedToSiteRef.current = false;
          lastPinClientPosRef.current = null;
        }
      }

      if (!lensPinnedToSiteRef.current) {
        if (!lensCurrentPosRef.current) {
          lensCurrentPosRef.current = { x: screenX, y: screenY };
        }
        lensTargetPosRef.current = { x: screenX, y: screenY };
        startLensLerpLoop();
      }
    }

    // Split drag handle
    if (isSplitCompare && e.buttons === 1) {
      const splitPx = (canvas.width * splitSliderX) / 100;
      if (Math.abs(screenX - splitPx) < 25) {
        const newPct = Math.max(5, Math.min(95, (screenX / canvas.width) * 100));
        setSplitSliderX(newPct);
        return;
      }
    }

    // Panning
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;

      const numTiles = Math.pow(2, zoom);
      const oldCenterWorldX = ((center.lng + 180) / 360) * 256 * numTiles;
      const sinLat = Math.sin((center.lat * Math.PI) / 180);
      const oldCenterWorldY =
        (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * 256 * numTiles;

      const newCenterWorldX = oldCenterWorldX - dx;
      const newCenterWorldY = oldCenterWorldY - dy;

      const newLng = (newCenterWorldX / (256 * numTiles)) * 360 - 180;
      const n = Math.PI - (2 * Math.PI * newCenterWorldY) / (256 * numTiles);
      const newLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

      setCenter({ lat: newLat, lng: newLng });
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // Hover test: Clusters first, then individual markers (only update state when hovered ID changes)
    const { clusters, unclustered } = getClustersAndUnclustered(canvas.width, canvas.height);

    let hCl: MarkerCluster | null = null;
    for (const cl of clusters) {
      if (Math.hypot(cl.screenX - screenX, cl.screenY - screenY) < 24) {
        hCl = cl;
        break;
      }
    }
    if ((hCl?.id ?? null) !== (hoveredCluster?.id ?? null)) {
      setHoveredCluster(hCl);
    }

    if (hCl) {
      if (hoveredSite !== null) setHoveredSite(null);
      return;
    }

    const orderedHitSites = activeTour
      ? [
          ...unclustered.filter((s) => activeTour.sites.includes(s.id)),
          ...unclustered.filter((s) => !activeTour.sites.includes(s.id)),
        ]
      : unclustered;

    let hovered: HeritageSite | null = null;
    for (const site of orderedHitSites) {
      const p = projectToScreen(site.gps, canvas.width, canvas.height);
      const dist = Math.hypot(p.x - screenX, p.y - screenY);
      const hitRadius = activeTour && !activeTour.sites.includes(site.id) ? 10 : 22;
      if (dist < hitRadius) {
        hovered = site;
        break;
      }
    }
    if ((hovered?.id ?? null) !== (hoveredSite?.id ?? null)) {
      setHoveredSite(hovered);
      const isDesktop = (containerRef.current?.clientWidth || window.innerWidth) >= 768;
      if (isDesktop && !showInspectorDrawer && !popupSite) {
        if (hoverTimerRef.current !== null) {
          window.clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = null;
        }
        if (hovered) {
          setHoverPreviewSite(hovered);
        } else if (hoverPreviewSite) {
          hoverTimerRef.current = window.setTimeout(() => {
            setHoverPreviewSite(null);
          }, 260);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Measurement tool click
    if (measureMode) {
      const geo = projectToGeo(screenX, screenY, canvas.width, canvas.height);
      if (!measurePointA) {
        setMeasurePointA(geo);
      } else if (!measurePointB) {
        setMeasurePointB(geo);
      } else {
        setMeasurePointA(geo);
        setMeasurePointB(null);
      }
      return;
    }

    // Click on cluster -> Zoom in
    const { clusters, unclustered } = getClustersAndUnclustered(canvas.width, canvas.height);
    for (const cl of clusters) {
      if (Math.hypot(cl.screenX - screenX, cl.screenY - screenY) < 24) {
        flyTo(cl.centerGeo, Math.min(17, zoom + 2.5));
        return;
      }
    }

    // Prioritize active route stops when clicking
    const orderedClickSites = activeTour
      ? [
          ...unclustered.filter((s) => activeTour.sites.includes(s.id)),
          ...unclustered.filter((s) => !activeTour.sites.includes(s.id)),
        ]
      : unclustered;

    // Site marker click
    for (const site of orderedClickSites) {
      const p = projectToScreen(site.gps, canvas.width, canvas.height);
      const dist = Math.hypot(p.x - screenX, p.y - screenY);
      const hitRadius = activeTour && !activeTour.sites.includes(site.id) ? 12 : 24;
      if (dist < hitRadius) {
        lensPinnedToSiteRef.current = true;
        lastPinClientPosRef.current = { x: e.clientX, y: e.clientY };
        const isSmallViewport = (containerRef.current?.clientWidth || window.innerWidth) < 768;
        const targetZoom = Math.max(zoomRef.current, 15.2);
        const latOffset = isSmallViewport
          ? 0.0024 / Math.pow(2, Math.max(0, targetZoom - 14.5))
          : 0.0006;
        flyTo({ lat: site.gps.lat - latOffset, lng: site.gps.lng }, targetZoom, 650);
        onSelectSite(site);
        if (!showInspectorDrawer) {
          setPopupSite(site);
        }
        return;
      }
    }

    // Click on empty canvas closes quick card
    setPopupSite(null);
    setHoverPreviewSite(null);
    onSelectSite(null);
  };

  // Touch gestures for mobile & tablet
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    startTime: number;
    initialDistance?: number;
    initialZoom?: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      if (e.cancelable) e.preventDefault();
      const delta = e.deltaY < 0 ? 0.35 : -0.35;
      setZoom((prev) => Math.max(10, Math.min(18, prev + delta)));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        touchStateRef.current = {
          startX: t.clientX,
          startY: t.clientY,
          lastX: t.clientX,
          lastY: t.clientY,
          startTime: Date.now(),
        };
        setIsPanning(true);
        setPanStart({ x: t.clientX, y: t.clientY });
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStateRef.current = {
          startX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          startY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          lastX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          lastY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          startTime: Date.now(),
          initialDistance: dist,
          initialZoom: zoom,
        };
        setIsPanning(false);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStateRef.current) return;
      if (e.cancelable) e.preventDefault();

      if (e.touches.length === 1 && isPanning) {
        const t = e.touches[0];
        const dx = t.clientX - touchStateRef.current.lastX;
        const dy = t.clientY - touchStateRef.current.lastY;

        touchStateRef.current.lastX = t.clientX;
        touchStateRef.current.lastY = t.clientY;

        const numTiles = Math.pow(2, zoom);
        const oldCenterWorldX = ((center.lng + 180) / 360) * 256 * numTiles;
        const sinLat = Math.sin((center.lat * Math.PI) / 180);
        const oldCenterWorldY =
          (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * 256 * numTiles;

        const newCenterWorldX = oldCenterWorldX - dx;
        const newCenterWorldY = oldCenterWorldY - dy;

        const newLng = (newCenterWorldX / (256 * numTiles)) * 360 - 180;
        const n = Math.PI - (2 * Math.PI * newCenterWorldY) / (256 * numTiles);
        const newLat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

        setCenter({ lat: newLat, lng: newLng });
      } else if (e.touches.length === 2 && touchStateRef.current.initialDistance) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = currentDist / touchStateRef.current.initialDistance;
        const deltaZoom = Math.log2(scale);
        const targetZoom = Math.max(10, Math.min(18, (touchStateRef.current.initialZoom || zoom) + deltaZoom));
        setZoom(targetZoom);
      }
    };

    const onTouchEnd = () => {
      setIsPanning(false);
      if (!touchStateRef.current) return;

      const elapsed = Date.now() - touchStateRef.current.startTime;
      const moved = Math.hypot(
        touchStateRef.current.lastX - touchStateRef.current.startX,
        touchStateRef.current.lastY - touchStateRef.current.startY
      );

      // If quick tap with minimal movement, treat as marker click
      if (elapsed < 350 && moved < 15 && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const screenX = touchStateRef.current.lastX - rect.left;
        const screenY = touchStateRef.current.lastY - rect.top;

        const { clusters, unclustered } = getClustersAndUnclustered(
          canvasRef.current.width,
          canvasRef.current.height
        );
        for (const cl of clusters) {
          if (Math.hypot(cl.screenX - screenX, cl.screenY - screenY) < 28) {
            flyTo(cl.centerGeo, Math.min(17, zoom + 2.5));
            touchStateRef.current = null;
            return;
          }
        }
        const orderedTapSites = activeTour
          ? [
              ...unclustered.filter((s) => activeTour.sites.includes(s.id)),
              ...unclustered.filter((s) => !activeTour.sites.includes(s.id)),
            ]
          : unclustered;
        for (const site of orderedTapSites) {
          const p = projectToScreen(site.gps, canvasRef.current.width, canvasRef.current.height);
          const dist = Math.hypot(p.x - screenX, p.y - screenY);
          if (dist < 28) {
            const targetZoom = Math.max(zoomRef.current, 15.2);
            const latOffset = 0.0024 / Math.pow(2, Math.max(0, targetZoom - 14.5));
            flyTo({ lat: site.gps.lat - latOffset, lng: site.gps.lng }, targetZoom, 650);
            onSelectSite(site);
            if (!showInspectorDrawer) {
              setPopupSite(site);
            }
            touchStateRef.current = null;
            return;
          }
        }
        setPopupSite(null);
        onSelectSite(null);
      }

      touchStateRef.current = null;
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);

    return () => {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [zoom, isPanning, center, sites, showInspectorDrawer]);

  // Active Quick-Action Card site (click pins it; desktop hover previews it smoothly)
  const effectiveQuickSource = popupSite || (!showInspectorDrawer ? hoverPreviewSite : null);
  const activeQuickSite = effectiveQuickSource
    ? sites.find((s) => s.id === effectiveQuickSource.id) || effectiveQuickSource
    : null;

  const canonicalPool = allCanonicalSites && allCanonicalSites.length > 0 ? allCanonicalSites : sites;
  const activeQuickCanonicalIdx = activeQuickSite
    ? Math.max(0, canonicalPool.findIndex((s) => s.id === activeQuickSite.id))
    : 0;

  const isHistoricalMode = baseMapMode.startsWith('historical') || isSpyglassLensMode;

  // Ordered stops of the active route for Prev/Next stepping
  const activeTourSites = activeTour
    ? activeTour.sites
        .map((id) => canonicalPool.find((s) => s.id === id) || sites.find((s) => s.id === id))
        .filter((s): s is HeritageSite => Boolean(s))
    : [];

  const safeTourStopIdx =
    activeTourSites.length > 0
      ? Math.min(activeTourStopIdx, activeTourSites.length - 1)
      : 0;
  const currentTourStopSite = activeTourSites[safeTourStopIdx] || null;

  const handleStepTourStop = (delta: number) => {
    if (activeTourSites.length === 0) return;
    const nextIdx =
      (safeTourStopIdx + delta + activeTourSites.length) % activeTourSites.length;
    setActiveTourStopIdx(nextIdx);
    const target = activeTourSites[nextIdx];
    const isSmallViewport = (containerRef.current?.clientWidth || window.innerWidth) < 768;
    const targetZoom = Math.max(zoomRef.current, 15.2);
    const latOffset = isSmallViewport
      ? 0.0022 / Math.pow(2, Math.max(0, targetZoom - 14.5))
      : 0.0006;
    flyTo({ lat: target.gps.lat - latOffset, lng: target.gps.lng }, targetZoom, 700);
    onSelectSite(target);
  };

  const handlePlaySiteAudio = (site: HeritageSite) => {
    if (onTriggerAudioGuide) {
      onTriggerAudioGuide(site);
    } else {
      onOpenARAudio(site);
    }
  };

  return (
    <div
      ref={containerRef}
      className={
        className ||
        'relative w-full h-full bg-[#EFE8DA] overflow-hidden select-none'
      }
    >
      {/* Layer 1: Base Slippy Map Tiles Canvas (Bright street tiles for both Street & Historical modes; zero sepia murk) */}
      <canvas
        ref={baseCanvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none select-none z-0 transition-[filter] duration-300"
        style={{
          filter: isSplitCompare
            ? 'none'
            : isSpyglassLensMode || baseMapMode === 'satellite'
            ? 'none'
            : 'brightness(101%) contrast(98%) saturate(88%)',
        }}
      />

      {/* Layer 2: GPU-Composited 60FPS Synchronized Regional Spyglass Lens */}
      {isSpyglassLensMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
          <div
            ref={lensClipRef}
            className="absolute top-0 left-0 rounded-full overflow-hidden pointer-events-none"
            style={{ willChange: 'transform' }}
          >
            <canvas
              ref={lensBufferCanvasRef}
              className="absolute top-0 left-0 block pointer-events-none"
              style={{ willChange: 'transform' }}
            />
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(0,0,0,0) 68%, rgba(23,24,23,0.45) 100%)',
              }}
            />
          </div>
          <div
            ref={lensOuterRingRef}
            className="absolute top-0 left-0 rounded-full pointer-events-none"
            style={{
              border: '1.2px dashed rgba(201, 164, 106, 0.7)',
              willChange: 'transform',
            }}
          />
          <div
            ref={lensRingRef}
            className="absolute top-0 left-0 rounded-full pointer-events-none"
            style={{
              border: '2.8px solid #C9A46A',
              boxShadow: '0 0 18px rgba(201, 164, 106, 0.45)',
              willChange: 'transform',
            }}
          />
          <div
            ref={lensCrosshairRef}
            className="absolute top-0 left-0 w-9 h-9 pointer-events-none"
            style={{ willChange: 'transform' }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <line x1="0" y1="18" x2="36" y2="18" stroke="rgba(201,164,106,0.5)" strokeWidth="0.9" />
              <line x1="18" y1="0" x2="18" y2="36" stroke="rgba(201,164,106,0.5)" strokeWidth="0.9" />
            </svg>
          </div>
          <div
            ref={lensPillRef}
            className="absolute top-0 left-0 h-[22px] px-3 rounded-full bg-[#FFFDF9] border border-[#D5CBB8] flex items-center justify-center pointer-events-none whitespace-nowrap shadow-md"
            style={{ willChange: 'transform' }}
          >
            <span
              ref={lensPillTextRef}
              className="text-[11px] font-semibold text-[#1C1917] tracking-normal"
            />
          </div>
        </div>
      )}

      {/* Layer 3: Interactive Slippy Vector & Marker Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          if (!popupSite && hoverPreviewSite) {
            if (hoverTimerRef.current !== null) window.clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = window.setTimeout(() => setHoverPreviewSite(null), 260);
          }
        }}
        onClick={handleClick}
        className={`relative z-[2] w-full h-full block touch-none overscroll-contain select-none ${
          isPanning
            ? 'cursor-grabbing'
            : measureMode
            ? 'cursor-crosshair'
            : hoveredSite || hoveredCluster
            ? 'cursor-pointer'
            : 'cursor-grab'
        }`}
        style={{
          touchAction: 'none',
          overscrollBehavior: 'contain',
          userSelect: 'none',
        }}
      />

      {/* DOCKED ARCHIVAL MAP TOPBAR (Desktop >= 768px): Left 3-mode switcher | Right Lớp bản đồ + Hướng dẫn */}
      <div
        className={`hidden md:flex absolute top-2.5 left-2.5 right-2.5 items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-[#F7F2E9]/95 backdrop-blur-md border border-[#DCD3C3] shadow-[0_6px_18px_rgba(44,36,30,0.12)] ${
          isLayerMenuOpen ? 'z-40' : 'z-30'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Seamless 3-mode switcher */}
        <div
          className="inline-flex items-center p-0.5 rounded-md bg-[#EDE4D3]/85 border border-[#DCD3C3] gap-0.5"
          role="group"
          aria-label="Map View Mode Toggle"
        >
          <button
            type="button"
            onClick={() => {
              onChangeBaseMapMode('admin');
              setIsSpyglassLensMode(false);
              setIsSplitCompare(false);
              setTimelineOpen(false);
              setIsTimelinePlaying(false);
            }}
            aria-pressed={baseMapMode === 'admin' && !isSpyglassLensMode}
            className={`h-7 px-3 rounded-md text-[11.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              baseMapMode === 'admin' && !isSpyglassLensMode
                ? 'bg-[#A63A2B] text-[#FAF6EE]'
                : 'text-[#2C241E]/80 hover:text-[#2C241E] hover:bg-[#F7F2E9]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 shrink-0" />
            <span>
              {lang === 'zh'
                ? '街道地图'
                : lang === 'en'
                ? 'Street Map'
                : 'Bản đồ đường phố'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onChangeBaseMapMode('satellite');
              setIsSpyglassLensMode(false);
              setIsSplitCompare(false);
              setTimelineOpen(false);
              setIsTimelinePlaying(false);
            }}
            aria-pressed={baseMapMode === 'satellite' && !isSpyglassLensMode}
            className={`h-7 px-3 rounded-md text-[11.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              baseMapMode === 'satellite' && !isSpyglassLensMode
                ? 'bg-[#A63A2B] text-[#FAF6EE]'
                : 'text-[#2C241E]/80 hover:text-[#2C241E] hover:bg-[#F7F2E9]'
            }`}
          >
            <Satellite className="w-3.5 h-3.5 shrink-0" />
            <span>
              {lang === 'zh' ? '卫星地图' : lang === 'en' ? 'Satellite' : 'Vệ tinh'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSplitCompare(false);
              setIsSpyglassLensMode(false);
              setMobileTimelineSlider(0);
              onChangeBaseMapMode('historical_1815');
              setTimelineOpen(true);
              flyTo({ lat: 10.7785, lng: 106.6980 }, 14.5, 700);
              trackPlatformInteraction('tech_map_1815', selectedSite?.id);
            }}
            aria-pressed={isHistoricalMode}
            className={`h-7 px-3 rounded-md text-[11.5px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              isHistoricalMode
                ? 'bg-[#A63A2B] text-[#FAF6EE]'
                : 'text-[#2C241E]/80 hover:text-[#2C241E] hover:bg-[#F7F2E9]'
            }`}
          >
            <History className="w-3.5 h-3.5 shrink-0" />
            <span>
              {lang === 'zh'
                ? '历史舆图 (1815 – 今)'
                : lang === 'en'
                ? 'Historical Map (1815 – Now)'
                : 'Bản đồ lịch sử (1815 – Nay)'}
            </span>
          </button>
        </div>

        {/* Right: Synchronized Lớp bản đồ + Hướng dẫn */}
        <div className="flex items-center gap-1.5 shrink-0">
          <LayerControlMenu
            embedded={true}
            baseMapMode={baseMapMode}
            onChangeBaseMapMode={(mode) => {
              onChangeBaseMapMode(mode);
              if (mode.startsWith('historical')) {
                setTimelineOpen(true);
              } else {
                setIsSpyglassLensMode(false);
                setTimelineOpen(false);
                setIsTimelinePlaying(false);
              }
            }}
            showDistricts={showDistricts}
            onToggleDistricts={() => setShowDistricts(!showDistricts)}
            showWaterways={showWaterways}
            onToggleWaterways={() => setShowWaterways(!showWaterways)}
            showProtectionZones={showProtectionZones}
            onToggleProtectionZones={() => setShowProtectionZones(!showProtectionZones)}
            measureMode={measureMode}
            onToggleMeasureMode={() => {
              setMeasureMode(!measureMode);
              setMeasurePointA(null);
              setMeasurePointB(null);
            }}
            isSplitCompare={isSplitCompare}
            onToggleSplitCompare={() => {
              const next = !isSplitCompare;
              setIsSplitCompare(next);
              if (next) setIsSpyglassLensMode(false);
            }}
            historicalOpacity={historicalOpacity}
            onChangeHistoricalOpacity={setHistoricalOpacity}
            isOpen={isLayerMenuOpen}
            onToggleOpen={setIsLayerMenuOpen}
          />
          {onOpenGuide && (
            <SectionGuideButton lang={lang} onClick={onOpenGuide} variant="ivory" />
          )}
        </div>
      </div>

      {/* Spyglass Lens Tracking Toggle (if enabled in layer menu) */}
      {isSpyglassLensMode && (
        <div
          className="hidden md:inline-flex absolute top-[58px] left-2.5 z-20 items-center p-0.5 rounded-lg bg-[#F7F2E9]/95 border border-[#DCD3C3] shadow-sm gap-0.5"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              setIsLensLocked(true);
              lensPinnedToSiteRef.current = true;
              lastPinClientPosRef.current = null;
            }}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              isLensLocked
                ? 'bg-[#A63A2B] text-[#FAF6EE]'
                : 'text-[#2C241E]/80 hover:text-[#2C241E]'
            }`}
          >
            <Pin className="w-3 h-3 shrink-0" />
            <span>{lang === 'zh' ? '锁定中心' : lang === 'en' ? 'Lock Center' : 'Khóa tâm'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLensLocked(false);
              lensPinnedToSiteRef.current = false;
              lastPinClientPosRef.current = null;
            }}
            className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
              !isLensLocked
                ? 'bg-[#A63A2B] text-[#FAF6EE]'
                : 'text-[#2C241E]/80 hover:text-[#2C241E]'
            }`}
          >
            <MousePointer2 className="w-3 h-3 shrink-0" />
            <span>{lang === 'zh' ? '随鼠标探测' : lang === 'en' ? 'Follow Cursor' : 'Soi theo chuột'}</span>
          </button>
        </div>
      )}

      {/* UNIFIED COMPACT HISTORICAL TIMELINE PANEL (Docked directly under the Topbar) */}
      {isTimelineOpen && (
        <div
          className="absolute top-[106px] md:top-[58px] left-2.5 right-2.5 md:left-1/2 md:right-auto md:-translate-x-1/2 z-20 md:w-[min(580px,calc(100%-130px))] pointer-events-auto"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full rounded-xl bg-[#F7F2E9]/95 backdrop-blur-md border border-[#DCD3C3] px-3.5 py-2.5 shadow-[0_12px_32px_rgba(44,36,30,0.16)] space-y-2 text-[#2C241E]">
            {/* Row 1: 5 Milestone Year Buttons + Auto-Play Toggle + Close */}
            <div className="flex items-center gap-1.5">
              <DragScrollRow className="flex-1 flex items-center gap-1.5 overflow-x-auto flex-nowrap">
                {HISTORICAL_TIMELINE_MILESTONES.map((ms) => {
                  const isActive = activeTimelineMilestone.id === ms.id;
                  return (
                    <button
                      key={`hist-ms-${ms.id}`}
                      type="button"
                      onClick={() => handleSelectTimelineMilestone(ms.id)}
                      aria-pressed={isActive}
                      className={`flex-1 min-w-[60px] min-h-[34px] px-2.5 rounded-lg text-[12px] font-bold tabular-nums border transition-colors cursor-pointer whitespace-nowrap text-center ${
                        isActive
                          ? 'bg-[#A63A2B] border-[#A63A2B] text-[#FAF6EE]'
                          : 'bg-[#FAF6EE] border-[#DCD3C3] text-[#2C241E]/80 hover:bg-[#EFE7D8]'
                      }`}
                    >
                      {ms.year}
                    </button>
                  );
                })}
              </DragScrollRow>

              <button
                type="button"
                onClick={handleToggleTimelinePlayback}
                aria-pressed={isTimelinePlaying}
                className={`h-[34px] px-2.5 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors whitespace-nowrap ${
                  isTimelinePlaying
                    ? 'bg-[#3A665B] border-[#3A665B] text-[#FAF6EE]'
                    : 'bg-[#FAF6EE] border-[#DCD3C3] text-[#A63A2B] hover:bg-[#EFE7D8]'
                }`}
              >
                {isTimelinePlaying ? (
                  <Pause className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Play className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="hidden sm:inline">
                  {isTimelinePlaying
                    ? lang === 'en'
                      ? 'Pause'
                      : lang === 'zh'
                      ? '暂停'
                      : 'Tạm dừng'
                    : lang === 'en'
                    ? 'Auto-play'
                    : lang === 'zh'
                    ? '自动播放'
                    : 'Phát tự động'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTimelinePlaying(false);
                  setTimelineOpen(false);
                  setIsSpyglassLensMode(false);
                  onChangeBaseMapMode('admin');
                }}
                aria-label={lang === 'en' ? 'Close historical map' : lang === 'zh' ? '关闭历史舆图' : 'Đóng bản đồ lịch sử'}
                className="w-[34px] h-[34px] rounded-lg bg-[#EFE7D8] hover:bg-[#A63A2B] text-[#2C241E] hover:text-[#FAF6EE] border border-[#DCD3C3] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Row 2: Concise 2-Line Historical Context Box */}
            <div className="rounded-lg bg-[#FAF6EE] border border-[#DCD3C3] px-3 py-1.5 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11.5px] font-semibold text-[#A63A2B] truncate">
                  {activeTimelineMilestone.year} · {activeTimelineMilestone.eraTitle[lang]}
                </span>
                <span className="text-[11px] font-semibold text-[#3A665B] tabular-nums shrink-0">
                  {builtCountAtActiveEra}/{sites.length}{' '}
                  {lang === 'en' ? 'sites built' : lang === 'zh' ? '处已建' : 'di tích hiện hữu'}
                </span>
              </div>
              <p className="text-[11.5px] leading-snug text-[#453E36] line-clamp-2 m-0">
                {activeTimelineMilestone.context[lang]}
              </p>
            </div>

            {/* Row 3: Historical Layer Clarity Slider (Controls ONLY historical vector opacity, keeps street map bright) */}
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold text-[#5C5347] whitespace-nowrap shrink-0">
                {lang === 'en'
                  ? 'Historical layer clarity'
                  : lang === 'zh'
                  ? '历史图层清晰度'
                  : 'Độ rõ lớp sử học'}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(historicalOpacity * 100)}
                onChange={(e) => setHistoricalOpacity(parseInt(e.target.value, 10) / 100)}
                aria-label="Độ rõ lớp sử học"
                className="flex-1 heritage-range-slider"
                style={{
                  background: `linear-gradient(to right, #A63A2B ${Math.round(historicalOpacity * 100)}%, #DDD3C0 ${Math.round(historicalOpacity * 100)}%)`,
                }}
              />
              <span className="text-[11px] font-semibold text-[#A63A2B] tabular-nums w-9 text-right shrink-0">
                {Math.round(historicalOpacity * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT-EDGE ZOOM (+ / -), LOCATE & COMPASS DOCK */}
      <div
        className="absolute top-[112px] right-2.5 md:top-[60px] md:right-2.5 z-20 flex flex-col items-end gap-2 pointer-events-none"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pointer-events-auto flex flex-col rounded-lg border border-[#DCD3C3] bg-[#F7F2E9]/95 backdrop-blur-md divide-y divide-[#DCD3C3]/80 overflow-hidden shadow-[0_6px_18px_rgba(44,36,30,0.12)]">
          <button
            type="button"
            onClick={() => setZoom((prev) => Math.min(18, prev + 0.5))}
            className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center text-[#2C241E] hover:text-[#A63A2B] hover:bg-[#EFE7D8] transition-colors cursor-pointer"
            title={lang === 'zh' ? '放大地图' : lang === 'en' ? 'Zoom in' : 'Phóng to'}
            aria-label={lang === 'zh' ? '放大地图' : lang === 'en' ? 'Zoom in' : 'Phóng to'}
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setZoom((prev) => Math.max(9.5, prev - 0.5))}
            className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center text-[#2C241E] hover:text-[#A63A2B] hover:bg-[#EFE7D8] transition-colors cursor-pointer"
            title={lang === 'zh' ? '缩小地图' : lang === 'en' ? 'Zoom out' : 'Thu nhỏ'}
            aria-label={lang === 'zh' ? '缩小地图' : lang === 'en' ? 'Zoom out' : 'Thu nhỏ'}
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    flyTo({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 16);
                  },
                  () => {
                    flyTo(HCMC_CENTER_WGS84, 15);
                  }
                );
              } else {
                flyTo(HCMC_CENTER_WGS84, 15);
              }
            }}
            className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center text-[#2C241E] hover:text-[#A63A2B] hover:bg-[#EFE7D8] transition-colors cursor-pointer"
            title={lang === 'zh' ? '定位我的当前位置' : lang === 'en' ? 'Locate my position' : 'Định vị vị trí hiện tại'}
            aria-label={lang === 'zh' ? '定位我的当前位置' : lang === 'en' ? 'Locate my position' : 'Định vị vị trí hiện tại'}
          >
            <LocateFixed className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => flyTo(HCMC_CENTER_WGS84, DEFAULT_ZOOM)}
            className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center text-[#2C241E] hover:text-[#A63A2B] hover:bg-[#EFE7D8] transition-colors cursor-pointer"
            title={lang === 'zh' ? '返回西贡中心' : lang === 'en' ? 'Reset to Central Saigon' : 'Trở về trung tâm Sài Gòn'}
            aria-label={lang === 'zh' ? '返回西贡中心' : lang === 'en' ? 'Reset to Central Saigon' : 'Trở về trung tâm Sài Gòn'}
          >
            <Compass className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowCoordinates(!showCoordinates)}
            className={`hidden md:flex w-9 h-9 items-center justify-center transition-colors cursor-pointer ${
              showCoordinates
                ? 'bg-[#A63A2B] text-[#FAF6EE]'
                : 'text-[#2C241E] hover:text-[#A63A2B] hover:bg-[#EFE7D8]'
            }`}
            title={lang === 'zh' ? '显示/隐藏 WGS84 坐标' : lang === 'en' ? 'Toggle WGS84 coordinates' : 'Bật/Tắt tọa độ WGS84'}
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>

        {showCoordinates && (
          <div className="hidden md:block pointer-events-auto px-3 py-1 rounded-lg bg-[#F7F2E9] border border-[#DCD3C3] text-[11px] font-semibold text-[#2C241E] shadow-sm whitespace-nowrap tabular-nums">
            {formatWGS84(cursorWgs84)}
          </div>
        )}
      </div>

      {/* SITE QUICK-ACTION CARD — DESKTOP (>= 768px, shown on click or marker hover) */}
      {activeQuickSite && !showInspectorDrawer && (() => {
        const eraInfo = getSiteHistoricalEraStatus(
          activeQuickSite,
          activeTimelineMilestone.id,
          activeTimelineMilestone.yearNum,
          isHistoricalMode && activeTimelineMilestone.id !== 'present'
        );
        return (
          <div className="hidden md:block absolute top-[60px] right-[52px] z-30 pointer-events-auto">
            <MapSiteQuickCard
              site={activeQuickSite}
              canonicalIndex={activeQuickCanonicalIdx}
              variant="desktop"
              onClose={() => {
                setPopupSite(null);
                setHoverPreviewSite(null);
                onSelectSite(null);
              }}
              onOpen3D={onOpen3D}
              onPlayAudio={handlePlaySiteAudio}
              onOpenDetailModal={onOpenDetailModal}
              onCardMouseEnter={() => {
                if (hoverTimerRef.current !== null) {
                  window.clearTimeout(hoverTimerRef.current);
                  hoverTimerRef.current = null;
                }
              }}
              onCardMouseLeave={() => {
                if (!popupSite) {
                  hoverTimerRef.current = window.setTimeout(() => {
                    setHoverPreviewSite(null);
                  }, 220);
                }
              }}
              eraStatus={{
                isHistoricalActive: isHistoricalMode && activeTimelineMilestone.id !== 'present',
                yearLabel: activeTimelineMilestone.year,
                isBuilt: eraInfo.isBuilt,
                displayName: eraInfo.displayName,
                unbuiltNote: eraInfo.unbuiltNote,
              }}
            />
          </div>
        );
      })()}

      {/* SITE QUICK-ACTION CARD — MOBILE (< 768px, IN THUMB REACH AT BOTTOM) */}
      {popupSite && !showInspectorDrawer && (() => {
        const mobileSite = sites.find((s) => s.id === popupSite.id) || popupSite;
        const mobileCanonicalIdx = Math.max(0, canonicalPool.findIndex((s) => s.id === mobileSite.id));
        const eraInfo = getSiteHistoricalEraStatus(
          mobileSite,
          activeTimelineMilestone.id,
          activeTimelineMilestone.yearNum,
          isHistoricalMode && activeTimelineMilestone.id !== 'present'
        );
        return (
          <div className="md:hidden fixed bottom-3 left-2.5 right-2.5 z-30 pointer-events-auto">
            <MapSiteQuickCard
              site={mobileSite}
              canonicalIndex={mobileCanonicalIdx}
              variant="mobile"
              onClose={() => {
                setPopupSite(null);
                setHoverPreviewSite(null);
                onSelectSite(null);
              }}
              onOpen3D={onOpen3D}
              onPlayAudio={handlePlaySiteAudio}
              onOpenDetailModal={onOpenDetailModal}
              eraStatus={{
                isHistoricalActive: isHistoricalMode && activeTimelineMilestone.id !== 'present',
                yearLabel: activeTimelineMilestone.year,
                isBuilt: eraInfo.isBuilt,
                displayName: eraInfo.displayName,
                unbuiltNote: eraInfo.unbuiltNote,
              }}
            />
          </div>
        );
      })()}

      {/* BOTTOM ROUTE NAVIGATION CARD — 9 HÀNH TRÌNH DI SẢN (DESKTOP & MOBILE) */}
      {activeTour && activeTourSites.length > 0 && (() => {
        const locTour = getLocalizedTour(activeTour);
        const routePalette = getTourRouteIndochineColor(activeTour);
        const cleanRouteTitle = locTour.title.replace(/^(Tuyến|Route|路线)\s*\d+\s*[—:-]\s*/i, '');
        const stopSite = currentTourStopSite || activeTourSites[0];
        const locStop = getLocalizedSite(stopSite);
        const isMultiStop = activeTourSites.length > 1;
        const routeNumMatch = activeTour.id.match(/\d+/);
        const routeNumStr = routeNumMatch ? routeNumMatch[0].padStart(2, '0') : '01';

        return (
          <div
            className={`${
              activeQuickSite ? 'hidden md:block' : 'block'
            } fixed md:absolute bottom-3 md:bottom-4 left-2.5 right-2.5 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[min(520px,calc(100%-32px))] z-30 md:z-20 pointer-events-auto`}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-2xl bg-[#FFFDF9] border border-[#D5CBB8] shadow-[0_16px_44px_rgba(28,25,23,0.22)] overflow-hidden text-[#1C1917]"
              style={{ borderTopColor: routePalette.primaryHex, borderTopWidth: '3px' }}
            >
              {/* Route Info + Current Stop Header */}
              <div className="px-3.5 pt-3 pb-2.5 flex items-start justify-between gap-2.5">
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => setPopupSite(stopSite)}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums"
                      style={{ backgroundColor: routePalette.primaryHex, color: routePalette.fgHex }}
                    >
                      {lang === 'en'
                        ? `Route ${routeNumStr}`
                        : lang === 'zh'
                        ? `路线 ${routeNumStr}`
                        : `Tuyến ${routeNumStr}`}
                    </span>
                    <span className="text-[11px] font-semibold text-[#A63A2B] tabular-nums">
                      {isMultiStop
                        ? lang === 'en'
                          ? `Stop ${safeTourStopIdx + 1} / ${activeTourSites.length}`
                          : lang === 'zh'
                          ? `第 ${safeTourStopIdx + 1} / ${activeTourSites.length} 站`
                          : `Trạm ${safeTourStopIdx + 1} / ${activeTourSites.length}`
                        : lang === 'en'
                        ? 'Single Destination'
                        : lang === 'zh'
                        ? '单一目的地'
                        : 'Điểm đến duy nhất'}
                    </span>
                    <span className="text-[11px] text-[#6B5E4F] truncate hidden sm:inline">
                      · {cleanRouteTitle}
                    </span>
                  </div>

                  <div className="mt-1 font-serif text-[14.5px] sm:text-[15.5px] font-semibold text-[#1C1917] truncate">
                    {safeTourStopIdx + 1}. {locStop.officialName}
                  </div>
                </div>

                {/* Quick Actions for Current Stop + Clear Route */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpen3D(stopSite)}
                    aria-label={lang === 'en' ? 'View 3D Model' : lang === 'zh' ? '查看 3D 模型' : 'Xem mô hình 3D'}
                    title={lang === 'en' ? 'View 3D Model' : lang === 'zh' ? '查看 3D 模型' : 'Xem mô hình 3D'}
                    className="w-10 h-10 md:w-8 md:h-8 rounded-lg bg-[#3A665B] hover:bg-[#2F544B] text-[#FFFDF9] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Box className="w-4 h-4 md:w-3.5 md:h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlaySiteAudio(stopSite)}
                    aria-label={lang === 'en' ? 'Listen Audio' : lang === 'zh' ? '收听讲解' : 'Nghe thuyết minh'}
                    title={lang === 'en' ? 'Listen Audio' : lang === 'zh' ? '收听讲解' : 'Nghe thuyết minh'}
                    className="w-10 h-10 md:w-8 md:h-8 rounded-lg bg-[#FFFDF9] hover:bg-[#FDF2EF] border border-[#A63A2B] text-[#A63A2B] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Volume2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                  </button>
                  {onOpenDetailModal && (
                    <button
                      type="button"
                      onClick={() => onOpenDetailModal(stopSite)}
                      aria-label={lang === 'en' ? 'Full Dossier' : lang === 'zh' ? '详细档案' : 'Hồ sơ chi tiết'}
                      title={lang === 'en' ? 'Full Dossier' : lang === 'zh' ? '详细档案' : 'Hồ sơ chi tiết'}
                      className="w-10 h-10 md:w-8 md:h-8 rounded-lg bg-[#FAF6EE] hover:bg-[#EDE4D3] border border-[#D5CBB8] text-[#1C1917] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <BookOpen className="w-4 h-4 md:w-3.5 md:h-3.5" />
                    </button>
                  )}
                  {onClearTour && (
                    <button
                      type="button"
                      onClick={onClearTour}
                      aria-label={lang === 'en' ? 'Close route' : lang === 'zh' ? '退出路线' : 'Đóng hành trình'}
                      title={lang === 'en' ? 'Close route' : lang === 'zh' ? '退出路线' : 'Đóng hành trình'}
                      className="w-10 h-10 md:w-8 md:h-8 rounded-lg bg-[#FAF6EE] hover:bg-[#EDE4D3] border border-[#D5CBB8] text-[#5C5347] hover:text-[#1C1917] flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <X className="w-4 h-4 md:w-3.5 md:h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2 Large Navigation Buttons: ← Trạm trước | Trạm tiếp theo → */}
              {isMultiStop ? (
                <div className="px-3.5 pb-3 pt-2 border-t border-[#E6DEC9] bg-[#FAF6EE] grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStepTourStop(-1)}
                    className="min-h-[44px] px-3 rounded-xl bg-[#FFFDF9] hover:bg-[#EFE7D8] active:scale-[0.98] border border-[#D5CBB8] text-[#1C1917] text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#A63A2B] shrink-0" />
                    <span>
                      {lang === 'en'
                        ? 'Previous Stop'
                        : lang === 'zh'
                        ? '上一站'
                        : 'Trạm trước'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepTourStop(1)}
                    className="min-h-[44px] px-3 rounded-xl bg-[#A63A2B] hover:bg-[#8E3023] active:scale-[0.98] text-[#FFFDF9] text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>
                      {lang === 'en'
                        ? 'Next Stop'
                        : lang === 'zh'
                        ? '下一站'
                        : 'Trạm tiếp theo'}
                    </span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              ) : (
                <div className="px-3.5 pb-3 pt-2 border-t border-[#E6DEC9] bg-[#FAF6EE] grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onOpen3D(stopSite)}
                    className="min-h-[44px] px-3 rounded-xl bg-[#3A665B] hover:bg-[#2F544B] text-[#FFFDF9] text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Box className="w-4 h-4 shrink-0" />
                    <span>
                      {lang === 'en' ? 'View 3D Model' : lang === 'zh' ? '查看 3D 模型' : 'Xem mô hình 3D'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlaySiteAudio(stopSite)}
                    className="min-h-[44px] px-3 rounded-xl bg-[#FFFDF9] hover:bg-[#FDF2EF] border-[1.5px] border-[#A63A2B] text-[#A63A2B] text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4 shrink-0" />
                    <span>
                      {lang === 'en' ? 'Listen Audio' : lang === 'zh' ? '收听讲解' : 'Nghe thuyết minh'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Subtle Map Attribution Badge (OpenStreetMap / Esri) */}
      <div className="hidden md:flex pointer-events-none absolute bottom-1.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-[#FFFDF9]/85 backdrop-blur-xs border border-[#D5CBB8]/80 text-[10px] font-medium text-[#5C5347] select-none">
        {baseMapMode === 'satellite' || isSpyglassLensMode
          ? '© Esri — World Imagery & Boundaries'
          : baseMapMode.startsWith('historical')
          ? '© OpenStreetMap & Historical GIS Cartography'
          : '© OpenStreetMap contributors'}
      </div>
    </div>
  );
};
