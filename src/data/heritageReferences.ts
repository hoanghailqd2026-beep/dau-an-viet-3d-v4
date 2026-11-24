import type {
  HeritageAcademicReference,
  HeritageLocalizedText,
  HeritageReferenceCategory,
} from '../types/heritage';
import type { Language } from '../i18n/types';

export interface ChapterSourceMetadata {
  sourceNote: HeritageLocalizedText;
  citationIds: string[];
  primaryCreditId?: string;
  referenceIndexes: number[];
}

export function getReferenceCategoryLabel(
  category: HeritageReferenceCategory,
  lang: Language
): string {
  if (category === 'legal_ranking') {
    return lang === 'en'
      ? 'Legal Dossier & Heritage Ranking'
      : lang === 'zh'
      ? '法定评定档案与文物定级'
      : 'Hồ sơ pháp lý & Xếp hạng di tích';
  }
  if (category === 'archival_literature') {
    return lang === 'en'
      ? 'Historical Archives, Gazetteers & Monographs'
      : lang === 'zh'
      ? '历史档案、地方志与专题文献'
      : 'Thư tịch, Địa chí & Lưu trữ chuyên ngành';
  }
  return lang === 'en'
    ? 'Field Survey & Site Management Board'
    : lang === 'zh'
    ? '实地田野调查与遗迹管理委员会'
    : 'Khảo sát thực địa & Ban Quản lý Di tích';
}

export function getReferenceCategoryShortBadge(
  category: HeritageReferenceCategory,
  lang: Language
): string {
  if (category === 'legal_ranking') {
    return lang === 'en' ? 'Legal Ranking' : lang === 'zh' ? '法定定级' : 'Pháp lý & Xếp hạng';
  }
  if (category === 'archival_literature') {
    return lang === 'en' ? 'Archive & Monograph' : lang === 'zh' ? '档案与方志' : 'Thư tịch & Lưu trữ';
  }
  return lang === 'en' ? 'Field Survey' : lang === 'zh' ? '实地考察' : 'Khảo sát thực địa';
}

/**
 * Hệ thống nguồn dẫn học thuật chuẩn sử học (3 nhóm nguồn) cho trọn bộ 17 di tích Đông Nam Bộ.
 * Tuyệt đối không dùng nguồn chung chung (như "Internet" hay "Wikipedia").
 */
export const HERITAGE_SITE_REFERENCES: Record<string, HeritageAcademicReference[]> = {
  'HCM-DT-001': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 1272/QĐ-TTg về việc xếp hạng Di tích lịch sử Quốc gia Đặc biệt Dinh Độc Lập (Đợt 1)',
        en: 'Prime Minister Decision No. 1272/QD-TTg classifying Independence Palace as a Special National Historical Monument (Batch 1)',
        zh: '越南政府总理第 1272/QĐ-TTg 号决定：将独立宫评定为第一批特别国家级历史遗迹',
      },
      repository: {
        vi: 'Thủ tướng Chính phủ & Bộ Văn hóa, Thể thao và Du lịch (Cục Di sản Văn hóa)',
        en: 'Office of the Prime Minister & Ministry of Culture, Sports and Tourism (Dept. of Cultural Heritage)',
        zh: '越南政府总理府及文化体育与旅游部（文化遗产局）',
      },
      year: '12/08/2009',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Hồ sơ kiến trúc Dinh Độc Lập (KTS. Ngô Viết Thụ, 1962–1966) và phông tư liệu Dinh Norodom (1868–1954)',
        en: 'Architectural Dossier of Independence Palace (Arch. Ngo Viet Thu, 1962–1966) and Norodom Palace Fonds (1868–1954)',
        zh: '独立宫建筑设计档案（建筑师吴曰树，1962–1966）与诺罗敦宫全宗文献（1868–1954）',
      },
      repository: {
        vi: 'Trung tâm Lưu trữ Quốc gia II (TTLTQG II) & Hội trường Thống Nhất',
        en: 'Vietnam National Archives Center II & Reunification Hall Curatorial Archive',
        zh: '越南第二国家档案馆（TTLTQG II）与统一会堂文献库',
      },
      year: '1868–1966',
      arcCode: 'ARC-01-MAP',
      creditId: 'mc-map-1955-1966-dinh',
    },
    {
      index: 3,
      category: 'archival_literature',
      title: {
        vi: 'Địa chí Văn hóa Thành phố Hồ Chí Minh (Tập I: Lịch sử & Tập III: Kiến trúc đô thị Sài Gòn)',
        en: 'Cultural Gazetteer of Ho Chi Minh City (Vol. I: History & Vol. III: Saigon Urban Architecture)',
        zh: '《胡志明市文化志》（第一卷：历史与第三卷：西贡城市建筑）',
      },
      repository: {
        vi: 'Hội đồng Khoa học Xã hội TP. Hồ Chí Minh — NXB Tổng hợp TP.HCM & ANOM (Phông Đông Dương)',
        en: 'Ho Chi Minh City Council of Social Sciences — HCMC General Publishing House & ANOM Indochina Fonds',
        zh: '胡志明市社会科学委员会—胡志明市综合出版社及法国海外档案馆（ANOM）',
      },
      year: '1987–1998',
      arcCode: 'ARC-REG-MAP-02',
      creditId: 'mc-map-1865-coffyn',
    },
    {
      index: 4,
      category: 'field_survey',
      title: {
        vi: 'Biên bản khảo sát thực địa, đo đạc không gian kiến trúc và đối chiếu hiện vật tại Hội trường Thống Nhất',
        en: 'On-site Field Survey, Architectural Spatial Documentation & Artifact Verification at Reunification Hall',
        zh: '统一会堂实地测绘、建筑空间记录与馆藏文物核验报告',
      },
      repository: {
        vi: 'Ban Quản lý Di tích Lịch sử Dinh Độc Lập & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Independence Palace Heritage Management Board & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '独立宫历史遗迹管理委员会与头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-01-IMG-01',
      creditId: 'mc-img-01',
    },
  ],

  'HCM-DT-002': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 54/QĐ-BVHTTDL về việc xếp hạng Di tích kiến trúc nghệ thuật cấp Quốc gia Nhà hát Thành phố Hồ Chí Minh',
        en: 'Decision No. 54/QD-BVHTTDL classifying the Municipal Theatre of Ho Chi Minh City as a National Architectural Art Monument',
        zh: '越南文化体育与旅游部第 54/QĐ-BVHTTDL 号决定：胡志明市大剧院国家级建筑艺术遗迹认定书',
      },
      repository: {
        vi: 'Bộ Văn hóa, Thể thao và Du lịch & Sở Văn hóa và Thể thao TP. Hồ Chí Minh',
        en: 'Ministry of Culture, Sports and Tourism & HCMC Department of Culture and Sports',
        zh: '越南文化体育与旅游部及胡志明市文化体育厅',
      },
      year: '11/01/2012',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Bản vẽ thiết kế và hồ sơ đấu thầu Théâtre Municipal de Saïgon (KTS. Félix Olivier, Ernest Guichard & Eugène Ferret, 1898–1900)',
        en: 'Architectural Drawings & Construction Records of Théâtre Municipal de Saïgon (Arch. F. Olivier, E. Guichard & E. Ferret, 1898–1900)',
        zh: '西贡市立大剧院设计图纸与营造档案（建筑师 F. Olivier、E. Guichard 与 E. Ferret，1898–1900）',
      },
      repository: {
        vi: 'Thư viện Quốc gia Pháp (BnF Gallica), Lưu trữ Hải ngoại Pháp (ANOM) & Trung tâm Lưu trữ Quốc gia II',
        en: 'Bibliothèque nationale de France (BnF Gallica), ANOM & Vietnam National Archives Center II',
        zh: '法国国家图书馆（BnF Gallica）、法国海外档案馆（ANOM）及越南第二国家档案馆',
      },
      year: '1898–1900',
      arcCode: 'ARC-REG-MAP-03',
      creditId: 'mc-map-1898-saigon-cholon',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Hồ sơ khảo sát hiện trạng mặt tiền phù điêu, khán phòng và tư liệu biểu diễn tại Nhà hát Thành phố',
        en: 'Field Documentation of Relief Facade, Auditorium Acoustics & Performance Records at Saigon Opera House',
        zh: '胡志明市大剧院外立面浮雕、观众厅现状实地考察与演艺档案',
      },
      repository: {
        vi: 'Nhà hát Giao hưởng Nhạc Vũ Kịch TP.HCM (HBSO) & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'HCMC Ballet Symphony Orchestra and Opera (HBSO) & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '胡志明市交响乐与歌舞剧院（HBSO）及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-02-IMG-01',
      creditId: 'mc-img-02',
    },
  ],

  'HCM-DT-003': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Hồ sơ khoa học kiểm kê di sản và danh mục bảo tồn công trình kiến trúc nghệ thuật Bưu điện Trung tâm Sài Gòn',
        en: 'Scientific Heritage Inventory Dossier & Architectural Conservation Registry of Saigon Central Post Office',
        zh: '西贡中心邮局建筑艺术遗产科学普查与保护名录档案',
      },
      repository: {
        vi: 'Bộ Văn hóa, Thể thao và Du lịch & Trung tâm Bảo tồn Di tích TP. Hồ Chí Minh (Sở VH&TT TP.HCM)',
        en: 'Ministry of Culture, Sports and Tourism & HCMC Monument Conservation Center',
        zh: '越南文化体育与旅游部及胡志明市遗迹保护中心（胡志明市文化体育厅）',
      },
      year: '1998–2020',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Tài liệu thiết kế Hôtel des Postes et Télégraphes de Saïgon (KTS. Marie-Alfred Foulhoux, 1886–1891) và hai bản đồ điện tín cổ Nam Kỳ',
        en: 'Design Records of Hôtel des Postes et Télégraphes de Saïgon (Arch. M.-A. Foulhoux, 1886–1891) & Historic Cochinchina Telegraph Maps',
        zh: '西贡邮政电报总局建筑档案（建筑师 M.-A. Foulhoux，1886–1891）与南圻历史电报舆图',
      },
      repository: {
        vi: 'Trung tâm Lưu trữ Quốc gia II (Phông Sở Công chính Nam Kỳ) & Thư viện Quốc gia Pháp (BnF Gallica)',
        en: 'Vietnam National Archives Center II (Cochinchina Public Works Fonds) & BnF Gallica',
        zh: '越南第二国家档案馆（南圻工务局全宗）与法国国家图书馆（BnF Gallica）',
      },
      year: '1886–1891',
      arcCode: 'ARC-REG-MAP-03',
      creditId: 'mc-map-1898-saigon-cholon',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa kết cấu mái vòm thép tiền chế, đại sảnh bưu chính và hệ thống bản đồ cổ vẽ tay tại Bưu điện TP.HCM',
        en: 'Field Survey of Prefabricated Wrought-Iron Vaults, Main Hall & Hand-Painted Historic Maps at Saigon Central Post Office',
        zh: '西贡中心邮局钢铁拱顶结构、邮政大厅及手绘历史地图实地测查记录',
      },
      repository: {
        vi: 'Bưu điện TP. Hồ Chí Minh (VNPost) & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Ho Chi Minh City Post Office (VNPost) & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '胡志明市邮政局（VNPost）及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-03-IMG-01',
      creditId: 'mc-img-03',
    },
  ],

  'HCM-DT-004': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 3982/QĐ-UBND về việc xếp hạng Di tích kiến trúc nghệ thuật cấp Thành phố đối với Chợ Bến Thành',
        en: 'Decision No. 3982/QD-UBND classifying Ben Thanh Market as a Municipal Architectural Art Monument',
        zh: '胡志明市人民委员会第 3982/QĐ-UBND 号决定：滨城市场市级建筑艺术遗迹认定书',
      },
      repository: {
        vi: 'Ủy ban Nhân dân TP. Hồ Chí Minh & Sở Văn hóa và Thể thao TP. Hồ Chí Minh',
        en: 'People’s Committee of Ho Chi Minh City & HCMC Department of Culture and Sports',
        zh: '胡志明市人民委员会及胡志明市文化体育厅',
      },
      year: '2012',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Hồ sơ xây dựng Halles Centrales de Saïgon (1912–1914, hãng thầu Brossard et Mopin) & bộ phù điêu gốm Biên Hòa (1952, nghệ nhân Lê Văn Mậu)',
        en: 'Construction Dossier of Halles Centrales de Saïgon (1912–1914, Brossard et Mopin) & Bien Hoa Ceramic Reliefs (1952, Le Van Mau)',
        zh: '西贡中央市场营造档案（1912–1914，Brossard et Mopin 承建）与边和陶艺浮雕资料（1952，黎文茂作）',
      },
      repository: {
        vi: 'Trung tâm Lưu trữ Quốc gia II, Bảo tàng Lịch sử TP.HCM & Lưu trữ Hải ngoại Pháp (ANOM)',
        en: 'Vietnam National Archives Center II, Museum of Vietnamese History HCMC & ANOM',
        zh: '越南第二国家档案馆、胡志明市历史博物馆及法国海外档案馆（ANOM）',
      },
      year: '1912–1952',
      arcCode: 'ARC-REG-MAP-03',
      creditId: 'mc-map-1898-saigon-cholon',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa bốn cửa Đông – Tây – Nam – Bắc, tháp đồng hồ mặt Nam và sinh hoạt thương mại truyền thống Chợ Bến Thành',
        en: 'Field Survey of the Four Cardinal Gates, South Clock Tower & Traditional Market Heritage at Ben Thanh Market',
        zh: '滨城市场东西南北四门、南门钟楼与传统商贸文化实地调查报告',
      },
      repository: {
        vi: 'Ban Quản lý Chợ Bến Thành (UBND Quận 1) & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Ben Thanh Market Management Board (District 1) & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '滨城市场管理委员会（第一郡）及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-04-IMG-01',
      creditId: 'mc-img-04',
    },
  ],

  'HCM-DT-005': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Hồ sơ kiểm kê bảo tồn di sản kiến trúc đô thị đặc biệt và dự án trùng tu Vương cung Thánh đường Đức Bà Sài Gòn',
        en: 'Urban Architectural Heritage Inventory & National Conservation Dossier of Notre-Dame Cathedral Basilica of Saigon',
        zh: '西贡圣母大教堂城市建筑遗产保护名录与专项修缮核定档案',
      },
      repository: {
        vi: 'Sở Văn hóa và Thể thao TP. Hồ Chí Minh & Tòa Tổng Giám mục Tổng Giáo phận TP. Hồ Chí Minh',
        en: 'HCMC Department of Culture and Sports & Archdiocese of Ho Chi Minh City',
        zh: '胡志明市文化体育厅及胡志明市天主教总教区总主教府',
      },
      year: '2017–2026',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Bản vẽ thi công Nhà thờ Chính tòa Sài Gòn (KTS. Jules Bourard, 1877–1880), hồ sơ bổ sung hai tháp nhọn (1895) và gạch trần Marseille',
        en: 'Construction Plans of Saigon Cathedral (Arch. Jules Bourard, 1877–1880), Spire Additions (1895) & Marseille Brick Shipment Records',
        zh: '西贡圣母大教堂施工图（建筑师 Jules Bourard，1877–1880）、双尖塔增建档案（1895）与马赛红砖文献',
      },
      repository: {
        vi: 'Lưu trữ Hải ngoại Pháp (ANOM), Trung tâm Lưu trữ Quốc gia II & Văn khố Tổng Giáo phận TP.HCM',
        en: 'ANOM (Aix-en-Provence), Vietnam National Archives Center II & Archives of the Archdiocese of HCMC',
        zh: '法国海外档案馆（ANOM）、越南第二国家档案馆及胡志明市总教区档案馆',
      },
      year: '1877–1895',
      arcCode: 'ARC-REG-MAP-02',
      creditId: 'mc-map-1865-coffyn',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Tư liệu khảo sát thực địa cấu trúc Roman–Gothic, hệ thống 6 quả chuông đồng và công tác trùng tu mái ngói – tháp chuông',
        en: 'Field Documentation of Romanesque–Gothic Structure, Six Bronze Bells & Roof/Belfry Restoration Works',
        zh: '圣母大教堂罗曼—哥特结构、六口铜钟及屋顶钟楼修缮工程实地考察记录',
      },
      repository: {
        vi: 'Ban Trùng tu Nhà thờ Đức Bà Sài Gòn & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Saigon Notre-Dame Restoration Committee & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '西贡圣母大教堂修缮委员会及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-05-IMG-01',
      creditId: 'mc-img-05',
    },
  ],

  'HCM-DT-006': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định xếp hạng Di tích kiến trúc nghệ thuật cấp Quốc gia đối với Bảo tàng Lịch sử Thành phố Hồ Chí Minh',
        en: 'National Architectural Art Monument Classification Dossier of the Museum of Vietnamese History – Ho Chi Minh City',
        zh: '胡志明市历史博物馆国家级建筑艺术遗迹评定与保护档案',
      },
      repository: {
        vi: 'Bộ Văn hóa, Thể thao và Du lịch & Sở Văn hóa và Thể thao TP. Hồ Chí Minh',
        en: 'Ministry of Culture, Sports and Tourism & HCMC Department of Culture and Sports',
        zh: '越南文化体育与旅游部及胡志明市文化体育厅',
      },
      year: '2012',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Hồ sơ kiến trúc Bảo tàng Blanchard de la Brosse (KTS. Auguste Delaval, 1926–1929) & Kỷ yếu Hội Nghiên cứu Đông Dương (BSEI)',
        en: 'Architectural Dossier of Musée Blanchard de la Brosse (Arch. A. Delaval, 1926–1929) & Bulletin de la Société des Études Indochinoises (BSEI)',
        zh: '布朗夏尔·德·拉·布罗斯博物馆建筑档案（建筑师 A. Delaval，1926–1929）及印支研究学会会刊（BSEI）',
      },
      repository: {
        vi: 'Viện Viễn Đông Bác Cổ (EFEO), Bảo tàng Lịch sử TP.HCM & Trung tâm Lưu trữ Quốc gia II',
        en: 'École française d’Extrême-Orient (EFEO), HCMC Museum of History & National Archives Center II',
        zh: '法国远东学院（EFEO）、胡志明市历史博物馆及越南第二国家档案馆',
      },
      year: '1926–1929',
      arcCode: 'ARC-06-MAP',
      creditId: 'mc-map-1925-indochine',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa kiến trúc phong cách Đông Dương (Indochine), khối bát giác trung tâm và 18 phòng trưng bày chuyên đề',
        en: 'Field Survey of Indochine Architectural Elements, Central Octagonal Pavilion & 18 Thematic Exhibition Galleries',
        zh: '印支建筑风格、中央八角楼及 18 间专题陈列展厅实地考察记录',
      },
      repository: {
        vi: 'Bảo tàng Lịch sử TP. Hồ Chí Minh & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Museum of Vietnamese History HCMC & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '胡志明市历史博物馆及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-06-IMG-01',
      creditId: 'mc-img-06',
    },
  ],

  'HCM-DT-007': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 1288/VH-QĐ về việc xếp hạng Di tích lịch sử cấp Quốc gia Bến Nhà Rồng – Bảo tàng Hồ Chí Minh (Chi nhánh TP.HCM)',
        en: 'Decision No. 1288/VH-QD classifying Nha Rong Wharf – Ho Chi Minh Museum (HCMC Branch) as a National Historical Monument',
        zh: '越南文化部第 1288/VH-QĐ 号决定：龙屋港—胡志明博物馆（胡志明市分馆）国家级历史遗迹认定书',
      },
      repository: {
        vi: 'Bộ Văn hóa – Thông tin (nay là Bộ VH-TT&DL) & Sở Văn hóa và Thể thao TP. Hồ Chí Minh',
        en: 'Ministry of Culture and Information (now MCST) & HCMC Department of Culture and Sports',
        zh: '越南文化信息部（现文化体育与旅游部）及胡志明市文化体育厅',
      },
      year: '16/11/1988',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Tài liệu Thương cảng Sài Gòn – Trụ sở hãng vận tải biển Messageries Maritimes (1863) & Hồ sơ sự kiện 05/06/1911 trên tàu Amiral Latouche-Tréville',
        en: 'Saigon Port & Messageries Maritimes Headquarters Archives (1863) and June 5, 1911 Departure Records aboard SS Amiral Latouche-Tréville',
        zh: '西贡商港与法国邮船公司总部档案（1863）及 1911 年 6 月 5 日拉图什·特雷维尔号启航历史文献',
      },
      repository: {
        vi: 'Bảo tàng Hồ Chí Minh (Chi nhánh TP.HCM), Lưu trữ Hải ngoại Pháp (ANOM) & Trung tâm Lưu trữ Quốc gia II',
        en: 'Ho Chi Minh Museum (HCMC Branch), ANOM & Vietnam National Archives Center II',
        zh: '胡志明博物馆（胡志明市分馆）、法国海外档案馆（ANOM）及越南第二国家档案馆',
      },
      year: '1863–1911',
      arcCode: 'ARC-REG-MAP-02',
      creditId: 'mc-map-1865-coffyn',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa mái ngói Lưỡng Long Chầu Nguyệt, không gian ngã ba sông Sài Gòn – kênh Bến Nghé và hệ thống phòng trưng bày',
        en: 'Field Survey of the Twin-Dragon Roof Ornaments, Saigon River–Ben Nghe Canal Confluence & Exhibition Halls',
        zh: '双龙戏珠屋脊装饰、西贡河与滨义运河交汇处及博物馆展厅实地考察记录',
      },
      repository: {
        vi: 'Bảo tàng Hồ Chí Minh – Chi nhánh TP. Hồ Chí Minh & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Ho Chi Minh Museum – HCMC Branch & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '胡志明博物馆胡志明市分馆及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-07-IMG-01',
      creditId: 'mc-img-07',
    },
  ],

  'HCM-DT-008': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 1288/VH-QĐ công nhận Lăng Tả quân Lê Văn Duyệt (Lăng Ông Bà Chiểu) là Di tích lịch sử – văn hóa cấp Quốc gia',
        en: 'Decision No. 1288/VH-QD classifying the Mausoleum of General Le Van Duyet (Lang Ong Ba Chieu) as a National Historical-Cultural Monument',
        zh: '越南文化部第 1288/VH-QĐ 号决定：左军黎文悦陵（翁陵）国家级历史文化遗迹认定书',
      },
      repository: {
        vi: 'Bộ Văn hóa – Thông tin (nay là Bộ VH-TT&DL) & UBND Quận Bình Thạnh',
        en: 'Ministry of Culture and Information (now MCST) & Binh Thanh District People’s Committee',
        zh: '越南文化信息部（现文化体育与旅游部）及平盛郡人民委员会',
      },
      year: '06/12/1989',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Đại Nam Thực Lục Chính Biên, Gia Định Thành Thông Chí (Trịnh Hoài Đức) & Văn bia Thượng Công Miếu (1894)',
        en: 'Dai Nam Thuc Luc (Veritable Records), Gia Dinh Thanh Thong Chi (Trinh Hoai Duc) & Thuong Cong Temple Stele Inscriptions (1894)',
        zh: '《大南实录正编》、《嘉定城通志》（郑怀德著）及上公庙碑文拓片（1894）',
      },
      repository: {
        vi: 'Trung tâm Lưu trữ Quốc gia II, Thư viện Khoa học Tổng hợp TP.HCM & Đồ bản Thành Bát Quái 1815 (BnF Gallica)',
        en: 'Vietnam National Archives Center II, HCMC General Sciences Library & 1815 Gia Dinh Map (BnF Gallica)',
        zh: '越南第二国家档案馆、胡志明市综合科学图书馆及 1815 年八卦城舆图（BnF Gallica）',
      },
      year: '1815–1894',
      arcCode: 'ARC-REG-MAP-01',
      creditId: 'mc-map-1815-batquai',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa trục kiến trúc Tam quan – Bia ký – Mộ song táng đá ong – Thượng Công Miếu và nghệ thuật khảm sành sứ thời Nguyễn',
        en: 'Field Survey of the Triple Gate, Stele House, Laterite Twin Tomb, Shrine Hall & Nguyen-Dynasty Ceramic Mosaic Craft',
        zh: '三关门、碑亭、红土合葬墓、正殿及阮朝嵌瓷艺术实地测绘与考察记录',
      },
      repository: {
        vi: 'Ban Quản lý Di tích Lịch sử Văn hóa Lăng Lê Văn Duyệt & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Le Van Duyet Mausoleum Management Board & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '黎文悦陵历史文化遗迹管理委员会及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-08-IMG-01',
      creditId: 'mc-img-08',
    },
  ],

  'HCM-DT-009': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 2367/QĐ-TTg xếp hạng Di tích lịch sử Quốc gia Đặc biệt đối với Khu di tích lịch sử Địa đạo Củ Chi',
        en: 'Prime Minister Decision No. 2367/QD-TTg classifying Cu Chi Tunnels Historical Site as a Special National Monument',
        zh: '越南政府总理第 2367/QĐ-TTg 号决定：古芝地道历史遗迹区特别国家级遗迹认定书',
      },
      repository: {
        vi: 'Thủ tướng Chính phủ & Bộ Văn hóa, Thể thao và Du lịch (Cục Di sản Văn hóa)',
        en: 'Office of the Prime Minister & Ministry of Culture, Sports and Tourism',
        zh: '越南政府总理府及文化体育与旅游部（文化遗产局）',
      },
      year: '23/12/2015',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Lịch sử Đảng bộ huyện Củ Chi (1930–1975), Biên niên sử Địa đạo Củ Chi – Đất Thép Thành Đồng & Tư liệu địa chất đất sét pha đá ong vùng Tây Bắc Sài Gòn',
        en: 'History of Cu Chi District (1930–1975), Chronicle of Cu Chi Tunnels & Laterite-Clay Geotechnical Survey of Northwest Saigon',
        zh: '《古芝县党史（1930–1975）》、《古芝地道编年史》及西贡西北红土粘土层地质文献',
      },
      repository: {
        vi: 'Khu Di tích Lịch sử Địa đạo Củ Chi, Viện Lịch sử Quân sự Việt Nam & Trung tâm Lưu trữ Quốc gia II',
        en: 'Cu Chi Tunnels Historical Site Archive, Vietnam Institute of Military History & National Archives Center II',
        zh: '古芝地道历史遗迹区档案室、越南军事历史研究院及越南第二国家档案馆',
      },
      year: '1948–1975',
      arcCode: 'ARC-REG-MAP-04',
      creditId: 'mc-map-gis-tiles',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa hệ thống địa đạo 3 tầng (sâu 3m – 12m), bếp Hoàng Cầm, nắp hầm ngụy trang và khu Bến Dược – Bến Đình',
        en: 'Field Survey of the Three-Tier Tunnel Network (3m–12m depth), Hoang Cam Smokeless Kitchen & Ben Duoc–Ben Dinh Sectors',
        zh: '三层地道结构（深 3 至 12 米）、黄琴无烟灶、伪装井盖及滨药—滨亭展区实地考察报告',
      },
      repository: {
        vi: 'Ban Giám đốc Khu Di tích Lịch sử Địa đạo Củ Chi & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Cu Chi Tunnels Historical Site Directorate & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '古芝地道历史遗迹区管理处及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-09-IMG-01',
      creditId: 'mc-img-09',
    },
  ],

  'HCM-DT-010': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 38/2000/QĐ-BVHTT công nhận Khu di tích khảo cổ học Giồng Cá Vồ (Cần Giờ) là Di tích khảo cổ cấp Quốc gia',
        en: 'Decision No. 38/2000/QD-BVHTT classifying Giong Ca Vo Archaeological Site (Can Gio) as a National Archaeological Monument',
        zh: '越南文化信息部第 38/2000/QĐ-BVHTT 号决定：芹苴榕鱼窝考古遗址国家级考古遗迹认定书',
      },
      repository: {
        vi: 'Bộ Văn hóa – Thông tin (nay là Bộ VH-TT&DL) & UBND Huyện Cần Giờ',
        en: 'Ministry of Culture and Information (now MCST) & Can Gio District People’s Committee',
        zh: '越南文化信息部（现文化体育与旅游部）及芹苴县人民委员会',
      },
      year: '2000',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Báo cáo khai quật khảo cổ học Giồng Cá Vồ (1993–1994, 339 mộ chum, khuyên tai hai đầu thú & niên đại C14 khoảng 2.500 năm BP)',
        en: 'Giong Ca Vo Archaeological Excavation Reports (1993–1994: 339 Jar Burials, Bicephalous Ear Ornaments & ~2,500 BP Radiocarbon Dating)',
        zh: '榕鱼窝遗址考古发掘报告（1993–1994：339 座瓮棺葬、双兽头耳饰及约距今 2500 年碳十四测年）',
      },
      repository: {
        vi: 'Viện Khảo cổ học Việt Nam, Bảo tàng Lịch sử TP.HCM & Tạp chí Khảo cổ học (NXB Khoa học Xã hội)',
        en: 'Vietnam Institute of Archaeology, Museum of Vietnamese History HCMC & Journal of Archaeology',
        zh: '越南考古研究院、胡志明市历史博物馆及《考古学》期刊',
      },
      year: '1993–2002',
      arcCode: 'ARC-REG-MAP-04',
      creditId: 'mc-map-gis-tiles',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa vùng gò cát ven biển Cần Giờ và đối chiếu bộ sưu tập hiện vật mộ chum Giồng Cá Vồ trưng bày tại Bảo tàng Lịch sử TP.HCM',
        en: 'Field Documentation of the Can Gio Coastal Sand Mound & Verification of Giong Ca Vo Artifacts at HCMC Museum of History',
        zh: '芹苴滨海沙丘遗址实地踏查与胡志明市历史博物馆馆藏瓮棺文物核对记录',
      },
      repository: {
        vi: 'Bảo tàng Lịch sử TP.HCM, Phòng VHTT Cần Giờ & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'HCMC Museum of History, Can Gio Culture Office & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '胡志明市历史博物馆、芹苴文化处及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-10-IMG-01',
      creditId: 'mc-img-10',
    },
  ],

  'HCM-DT-011': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 1288/VH-QĐ xếp hạng Tổ đình Chùa Giác Lâm là Di tích kiến trúc nghệ thuật cấp Quốc gia',
        en: 'Decision No. 1288/VH-QD classifying Giac Lam Pagoda as a National Architectural Art Monument',
        zh: '越南文化部第 1288/VH-QĐ 号决定：觉林古寺国家级建筑艺术遗迹认定书',
      },
      repository: {
        vi: 'Bộ Văn hóa – Thông tin (nay là Bộ VH-TT&DL) & Sở Văn hóa và Thể thao TP. Hồ Chí Minh',
        en: 'Ministry of Culture and Information (now MCST) & HCMC Department of Culture and Sports',
        zh: '越南文化信息部（现文化体育与旅游部）及胡志明市文化体育厅',
      },
      year: '16/11/1988',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Gia Định Thành Thông Chí (mục Tự quán), Văn bia trùng tu Chùa Giác Lâm (1798–1906) & Danh mục 113 pho tượng cổ bằng gỗ mít',
        en: 'Gia Dinh Thanh Thong Chi (Temples Chapter), Giac Lam Restoration Steles (1798–1906) & Inventory of 113 Ancient Jackfruit-Wood Statues',
        zh: '《嘉定城通志·寺观志》、觉林寺重修碑记（1798–1906）及 113 尊菠萝蜜木古佛像清册',
      },
      repository: {
        vi: 'Viện Nghiên cứu Hán Nôm, Bảo tàng Lịch sử TP.HCM & Trung tâm Lưu trữ Quốc gia II',
        en: 'Institute of Sino-Nom Studies, HCMC Museum of History & Vietnam National Archives Center II',
        zh: '越南汉喃研究院、胡志明市历史博物馆及越南第二国家档案馆',
      },
      year: '1744–1909',
      arcCode: 'ARC-REG-MAP-01',
      creditId: 'mc-map-1815-batquai',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa kiến trúc chữ Tam (三) truyền thống Nam Bộ, hệ thống 98 cột gỗ quý và hơn 7.400 đĩa sứ cổ ốp tường – mái chùa',
        en: 'Field Survey of the Southern Three-Bay (San-shaped) Timber Plan, 98 Hardwood Pillars & 7,400+ Ceramic Plates Embedded in Walls',
        zh: '南部传统“三”字形木构布局、98 根珍木柱及 7400 余只嵌墙古瓷盘实地考察记录',
      },
      repository: {
        vi: 'Ban Quản trị Tổ đình Giác Lâm & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Giac Lam Pagoda Governing Board & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '觉林祖庭管理委员会及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-11-IMG-01',
      creditId: 'mc-img-11',
    },
  ],

  'HCM-DT-012': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 43-VH/QĐ công nhận Hội quán Nghĩa An (Miếu Quan Đế Chợ Lớn) là Di tích kiến trúc nghệ thuật cấp Quốc gia',
        en: 'Decision No. 43-VH/QD classifying Nghia An Assembly Hall (Quan De Temple, Cho Lon) as a National Architectural Art Monument',
        zh: '越南文化信息部第 43-VH/QĐ 号决定：义安会馆（堤岸关帝庙）国家级建筑艺术遗迹认定书',
      },
      repository: {
        vi: 'Bộ Văn hóa – Thông tin (nay là Bộ VH-TT&DL) & Sở Văn hóa và Thể thao TP. Hồ Chí Minh',
        en: 'Ministry of Culture and Information (now MCST) & HCMC Department of Culture and Sports',
        zh: '越南文化信息部（现文化体育与旅游部）及胡志明市文化体育厅',
      },
      year: '07/11/1993',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Văn bia Hán Nôm Hội quán Nghĩa An (1866–1902), Địa chí Chợ Lớn & Chuyên khảo Di sản kiến trúc cộng đồng người Hoa Triều Châu tại Sài Gòn',
        en: 'Sino-Nom Steles of Nghia An Assembly Hall (1866–1902), Cho Lon Gazetteer & Monograph on Teochew Architectural Heritage in Saigon',
        zh: '义安会馆汉喃碑记（1866–1902）、《堤岸志》及西贡潮州华人会馆建筑遗产专论',
      },
      repository: {
        vi: 'Viện Khoa học Xã hội vùng Nam Bộ, Bảo tàng Lịch sử TP.HCM & Bản đồ Sài Gòn – Chợ Lớn 1898 (BnF Gallica)',
        en: 'Southern Institute of Social Sciences, HCMC Museum of History & 1898 Saigon–Cho Lon Map (BnF Gallica)',
        zh: '越南南部社会科学研究院、胡志明市历史博物馆及 1898 年西贡—堤岸舆图（BnF Gallica）',
      },
      year: '1820–1902',
      arcCode: 'ARC-REG-MAP-03',
      creditId: 'mc-map-1898-saigon-cholon',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa nghệ thuật chạm gỗ sơn son thếp vàng phong cách Triều Châu, bộ tượng gốm Cây Mai và bao lam tại Hội quán Nghĩa An',
        en: 'Field Documentation of Teochew Gilded Woodcarvings, Cay Mai Ceramic Roof Figurines & Ceremonial Archways at Nghia An Hall',
        zh: '义安会馆潮州金漆木雕、梅树古窑陶塑脊饰及正殿格局实地考察报告',
      },
      repository: {
        vi: 'Ban Quản trị Hội quán Nghĩa An (Quận 5) & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Nghia An Assembly Hall Governing Board (District 5) & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '义安会馆理事会（第五郡）及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-12-IMG-01',
      creditId: 'mc-img-12',
    },
  ],

  'BRVT-DT-001': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 983/QĐ-BVHTT công nhận Di tích lịch sử – văn hóa cấp Quốc gia đối với Bạch Dinh (Villa Blanche, Vũng Tàu)',
        en: 'Decision No. 983/QD-BVHTT classifying Bach Dinh (Villa Blanche, Vung Tau) as a National Historical-Cultural Monument',
        zh: '越南文化信息部第 983/QĐ-BVHTT 号决定：头顿白宫（维拉布朗什别墅）国家级历史文化遗迹认定书',
      },
      repository: {
        vi: 'Bộ Văn hóa – Thông tin (nay là Bộ VH-TT&DL) & Sở Văn hóa và Thể thao tỉnh Bà Rịa – Vũng Tàu',
        en: 'Ministry of Culture and Information (now MCST) & Ba Ria – Vung Tau Dept. of Culture and Sports',
        zh: '越南文化信息部（现文化体育与旅游部）及巴地—头顿省文化体育厅',
      },
      year: '04/08/1992',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Hồ sơ xây dựng Villa Blanche trên nền Pháo đài Phước Thắng (1898–1902), tư liệu giai đoạn giam lỏng vua Thành Thái (1907–1916) & Địa chí tỉnh Bà Rịa – Vũng Tàu',
        en: 'Villa Blanche Construction Dossier on Phuoc Thang Fort Site (1898–1902), Emperor Thanh Thai Detention Records (1907–1916) & Ba Ria – Vung Tau Gazetteer',
        zh: '福胜炮台旧址白宫建造档案（1898–1902）、成泰帝幽禁文献（1907–1916）及《巴地—头顿省志》',
      },
      repository: {
        vi: 'Bảo tàng tỉnh Bà Rịa – Vũng Tàu, Trung tâm Lưu trữ Quốc gia II & Lưu trữ Hải ngoại Pháp (ANOM)',
        en: 'Ba Ria – Vung Tau Provincial Museum, Vietnam National Archives Center II & ANOM',
        zh: '巴地—头顿省博物馆、越南第二国家档案馆及法国海外档案馆（ANOM）',
      },
      year: '1898–1916',
      arcCode: 'ARC-REG-MAP-03',
      creditId: 'mc-map-1898-saigon-cholon',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa kiến trúc Tân cổ điển Pháp sườn Núi Lớn, 8 bức tượng bán thân gốm men và bộ sưu tập gốm cổ tàu đắm Hòn Cau trưng bày tại Bạch Dinh',
        en: 'Field Survey of French Neoclassical Architecture on Big Mountain Slope, Eight Ceramic Busts & Hon Cau Shipwreck Porcelain Collection',
        zh: '大山南坡法式新古典主义建筑、八尊彩陶半身像及汉沟沉船古瓷展陈实地考察记录',
      },
      repository: {
        vi: 'Bảo tàng tỉnh Bà Rịa – Vũng Tàu & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Ba Ria – Vung Tau Provincial Museum & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '巴地—头顿省博物馆及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-13-IMG-01',
      creditId: 'mc-img-13',
    },
  ],

  'BRVT-DT-002': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 1371/QĐ-BVHTT công nhận Quần thể kiến trúc nghệ thuật Nhà Lớn Long Sơn là Di tích cấp Quốc gia',
        en: 'Decision No. 1371/QD-BVHTT classifying Long Son Great House Architectural Complex as a National Architectural Art Monument',
        zh: '越南文化信息部第 1371/QĐ-BVHTT 号决定：龙山大屋建筑群国家级建筑艺术遗迹认定书',
      },
      repository: {
        vi: 'Bộ Văn hóa – Thông tin (nay là Bộ VH-TT&DL) & Sở Văn hóa và Thể thao tỉnh Bà Rịa – Vũng Tàu',
        en: 'Ministry of Culture and Information (now MCST) & Ba Ria – Vung Tau Dept. of Culture and Sports',
        zh: '越南文化信息部（现文化体育与旅游部）及巴地—头顿省文化体育厅',
      },
      year: '03/08/1991',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Địa chí tỉnh Bà Rịa – Vũng Tàu (mục Di sản văn hóa xã đảo Long Sơn) & Chuyên khảo lịch sử khai khẩn của ông Lê Văn Mưu (Ông Trần, 1910–1929)',
        en: 'Ba Ria – Vung Tau Gazetteer (Long Son Island Cultural Heritage) & Historical Monograph on Pioneer Le Van Muu (Ong Tran, 1910–1929)',
        zh: '《巴地—头顿省志·龙山岛文化遗产卷》及黎文谋（陈公）拓荒与营造史专论（1910–1929）',
      },
      repository: {
        vi: 'Bảo tàng tỉnh Bà Rịa – Vũng Tàu, Hội Khoa học Lịch sử tỉnh Bà Rịa – Vũng Tàu & NXB Khoa học Xã hội',
        en: 'Ba Ria – Vung Tau Provincial Museum, Provincial Historical Science Association & Social Sciences Publishing House',
        zh: '巴地—头顿省博物馆、巴地—头顿省历史科学协会及社会科学出版社',
      },
      year: '1910–2005',
      arcCode: 'ARC-REG-MAP-04',
      creditId: 'mc-map-gis-tiles',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa quần thể gỗ rộng 2 ha (Đền Thánh, Nhà Hàng, Nhà Hát, trường học, chợ) và lễ hội Trùng Cửu – Vía Ông Trần tại đảo Long Sơn',
        en: 'Field Survey of the 2-Hectare Timber Complex (Sanctuary, Communal Halls, School) & Trung Cuu Festival on Long Son Island',
        zh: '龙山岛二公顷传统木构建筑群（圣殿、公厅、学堂）及重九民俗活动实地考察报告',
      },
      repository: {
        vi: 'Ban Quản lý Di tích Nhà Lớn Long Sơn & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Long Son Great House Management Board & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '龙山大屋遗迹管理委员会及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-14-IMG-01',
      creditId: 'mc-img-14',
    },
  ],

  'BRVT-DT-003': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 09/VH-QĐ về việc xếp hạng Di tích lịch sử cấp Quốc gia Khu di tích Địa đạo Long Phước (TP. Bà Rịa)',
        en: 'Decision No. 09/VH-QD classifying Long Phuoc Tunnels (Ba Ria City) as a National Historical Monument',
        zh: '越南文化部第 09/VH-QĐ 号决定：巴地市龙福地道历史遗迹国家级遗迹认定书',
      },
      repository: {
        vi: 'Bộ Văn hóa – Thông tin (nay là Bộ VH-TT&DL) & Sở Văn hóa và Thể thao tỉnh Bà Rịa – Vũng Tàu',
        en: 'Ministry of Culture and Information (now MCST) & Ba Ria – Vung Tau Dept. of Culture and Sports',
        zh: '越南文化信息部（现文化体育与旅游部）及巴地—头顿省文化体育厅',
      },
      year: '09/01/1990',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Lịch sử Đảng bộ xã Long Phước (1930–1975) & Tư liệu quân sự chiến khu Địa đạo Long Phước trong hai cuộc kháng chiến (1948–1975)',
        en: 'History of Long Phuoc Commune (1930–1975) & Military Archives of Long Phuoc Underground Network (1948–1975)',
        zh: '《龙福乡革命斗争史（1930–1975）》与龙福地道抗战军事档案（1948–1975）',
      },
      repository: {
        vi: 'Bảo tàng tỉnh Bà Rịa – Vũng Tàu & Bộ Chỉ huy Quân sự tỉnh Bà Rịa – Vũng Tàu',
        en: 'Ba Ria – Vung Tau Provincial Museum & Provincial Military Command Historical Archives',
        zh: '巴地—头顿省博物馆及巴地—头顿省军事指挥部史料室',
      },
      year: '1948–2008',
      arcCode: 'ARC-REG-MAP-04',
      creditId: 'mc-map-gis-tiles',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa trục địa đạo liên ấp (Bắc, Đông, Tây, Nam), hệ thống ụ chiến đấu – hầm dự trữ lương thực và Nhà truyền thống Long Phước',
        en: 'Field Survey of the Inter-Hamlet Tunnel Axis (North, East, West, South), Fighting Positions & Long Phuoc Exhibition House',
        zh: '龙福连村地道网络（东、西、南、北四邑）、防御工事及传统陈列馆实地考察报告',
      },
      repository: {
        vi: 'Ban Quản lý Di tích TP. Bà Rịa & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Ba Ria City Heritage Management Board & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '巴地市遗迹管理委员会及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-15-IMG-01',
      creditId: 'mc-img-15',
    },
  ],

  'BD-DT-001': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 43-VH/QĐ công nhận Nhà cổ Trần Công Vàng (TP. Thủ Dầu Một) là Di tích kiến trúc nghệ thuật cấp Quốc gia',
        en: 'Decision No. 43-VH/QD classifying Tran Cong Vang Ancient House (Thu Dau Mot City) as a National Architectural Art Monument',
        zh: '越南文化信息部第 43-VH/QĐ 号决定：土龙木市陈公黄金宅国家级建筑艺术遗迹认定书',
      },
      repository: {
        vi: 'Bộ Văn hóa – Thông tin (nay là Bộ VH-TT&DL) & Sở Văn hóa, Thể thao và Du lịch tỉnh Bình Dương',
        en: 'Ministry of Culture and Information (now MCST) & Binh Duong Dept. of Culture, Sports and Tourism',
        zh: '越南文化信息部（现文化体育与旅游部）及平阳省文化体育与旅游厅',
      },
      year: '07/11/1993',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Địa chí Bình Dương (Tập Di sản kiến trúc dân gian đất Thủ) & Chuyên khảo nghệ thuật chạm khắc gỗ Thủ Dầu Một cuối thế kỷ XIX (1889–1892)',
        en: 'Binh Duong Gazetteer (Vernacular Architecture of Thu Dau Mot) & Monograph on Late-19th-Century Thu Dau Mot Woodcarving (1889–1892)',
        zh: '《平阳省志·土龙木传统民居建筑》及十九世纪末土龙木木雕艺术专论（1889–1892）',
      },
      repository: {
        vi: 'Bảo tàng tỉnh Bình Dương, Hội Sử học tỉnh Bình Dương & Trung tâm Lưu trữ Quốc gia II',
        en: 'Binh Duong Provincial Museum, Binh Duong Historical Association & Vietnam National Archives Center II',
        zh: '平阳省博物馆、平阳省历史学会及越南第二国家档案馆',
      },
      year: '1889–2010',
      arcCode: 'ARC-REG-MAP-03',
      creditId: 'mc-map-1898-saigon-cholon',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa hệ khung 36 cột gỗ quý (căm xe, giáng hương), bố cục chữ Đinh (丁) và câu đối khảm xà cừ tại Nhà cổ Trần Công Vàng',
        en: 'Field Survey of the 36 Hardwood Pillars, T-Shaped (Ding) Floor Plan & Mother-of-Pearl Inlaid Couplets at Tran Cong Vang House',
        zh: '陈公黄金宅 36 根珍木柱、“丁”字形布局及螺钿镶嵌楹联实地测查记录',
      },
      repository: {
        vi: 'Bảo tàng tỉnh Bình Dương, Gia tộc họ Trần & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Binh Duong Provincial Museum, Tran Family Custodians & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '平阳省博物馆、陈氏家族守宅代表及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-16-IMG-01',
      creditId: 'mc-img-16',
    },
  ],

  'BD-DT-002': [
    {
      index: 1,
      category: 'legal_ranking',
      title: {
        vi: 'Quyết định số 776/QĐ-BVHTT công nhận Khu di tích lịch sử Địa đạo Tam Giác Sắt – Tây Nam Bến Cát là Di tích cấp Quốc gia',
        en: 'Decision No. 776/QD-BVHTT classifying the Iron Triangle Tunnels – Southwest Ben Cat as a National Historical Monument',
        zh: '越南文化信息部第 776/QĐ-BVHTT 号决定：槟吉西南铁三角地道国家级历史遗迹认定书',
      },
      repository: {
        vi: 'Bộ Văn hóa – Thông tin (nay là Bộ VH-TT&DL) & Sở Văn hóa, Thể thao và Du lịch tỉnh Bình Dương',
        en: 'Ministry of Culture and Information (now MCST) & Binh Duong Dept. of Culture, Sports and Tourism',
        zh: '越南文化信息部（现文化体育与旅游部）及平阳省文化体育与旅游厅',
      },
      year: '18/03/1996',
    },
    {
      index: 2,
      category: 'archival_literature',
      title: {
        vi: 'Lịch sử đấu tranh cách mạng 3 xã Tây Nam Bến Cát (An Điền, An Tây, Phú An, 1948–1975) & Hồ sơ Chiến khu Tam Giác Sắt – Sông Sài Gòn – Sông Thị Tính',
        en: 'Revolutionary History of Southwest Ben Cat Communes (An Dien, An Tay, Phu An, 1948–1975) & Iron Triangle Strategic Base Archives',
        zh: '《槟吉西南三乡（安田、安西、富安）革命史（1948–1975）》与铁三角战略基地历史档案',
      },
      repository: {
        vi: 'Bảo tàng tỉnh Bình Dương, Viện Lịch sử Quân sự Việt Nam & Trung tâm Lưu trữ Quốc gia II',
        en: 'Binh Duong Provincial Museum, Vietnam Institute of Military History & Vietnam National Archives Center II',
        zh: '平阳省博物馆、越南军事历史研究院及越南第二国家档案馆',
      },
      year: '1948–2011',
      arcCode: 'ARC-REG-MAP-04',
      creditId: 'mc-map-gis-tiles',
    },
    {
      index: 3,
      category: 'field_survey',
      title: {
        vi: 'Khảo sát thực địa cấu trúc địa đạo hình chữ V – chữ Z tại xã An Tây, hệ thống cửa thông hơi và tư liệu di vật chiến khu Tam Giác Sắt',
        en: 'Field Survey of the V-Shaped & Zigzag Tunnel Architecture in An Tay, Ventilation Shafts & Iron Triangle Artifacts',
        zh: '安西乡 V 字形与折线形地道结构、通风口及铁三角遗迹展品实地考察报告',
      },
      repository: {
        vi: 'Ban Quản lý Di tích tỉnh Bình Dương & Nhóm Nghiên cứu Lớp 10 Chuyên Sử (THPT Chuyên Lê Quý Đôn – Vũng Tàu)',
        en: 'Binh Duong Heritage Management Board & Grade 10 History Research Team (Le Quy Don High School – Vung Tau)',
        zh: '平阳省遗迹管理委员会及头顿黎贵惇重点高中十年级历史专业班研究组',
      },
      year: '2025–2026',
      arcCode: 'ARC-17-IMG-01',
      creditId: 'mc-img-17',
    },
  ],
};

/**
 * Tra cứu danh sách nguồn dẫn học thuật của di tích theo ID.
 */
export function getSiteReferences(siteId: string): HeritageAcademicReference[] {
  return HERITAGE_SITE_REFERENCES[siteId] || [];
}

/**
 * Tạo siêu dữ liệu nguồn biên soạn cụ thể cho từng chương thuyết minh (ch1..ch4) của từng di tích,
 * liên kết trực tiếp tới mã hồ sơ ARC-... và 3 nhóm nguồn chuẩn sử học.
 */
export function getChapterSourceMetadata(
  siteId: string,
  chapterId: string,
  chapterIndex: number
): ChapterSourceMetadata {
  const refs = getSiteReferences(siteId);
  const legal = refs.find((r) => r.category === 'legal_ranking') || refs[0];
  const archive = refs.find((r) => r.category === 'archival_literature') || refs[1] || refs[0];
  const secondaryArchive =
    refs.filter((r) => r.category === 'archival_literature')[1] || archive;
  const survey = refs.find((r) => r.category === 'field_survey') || refs[refs.length - 1];

  const normalizedIdx =
    chapterId === 'ch1'
      ? 0
      : chapterId === 'ch2'
      ? 1
      : chapterId === 'ch3'
      ? 2
      : chapterId === 'ch4'
      ? 3
      : Math.max(0, chapterIndex % 4);

  if (refs.length === 0) {
    return {
      sourceNote: {
        vi: 'Hồ sơ kiểm kê di tích cấp Quốc gia & Trung tâm Lưu trữ Quốc gia II',
        en: 'National Heritage Inventory Dossier & Vietnam National Archives Center II',
        zh: '国家级文物普查档案与越南第二国家档案馆',
      },
      citationIds: ['ARC-REG-MAP-04'],
      primaryCreditId: 'mc-map-gis-tiles',
      referenceIndexes: [1],
    };
  }

  // Chapter I: Origins & Historical Context -> Legal ranking + Archival monograph
  if (normalizedIdx === 0) {
    const ids = [archive?.arcCode, secondaryArchive?.arcCode].filter(
      (v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i
    );
    return {
      sourceNote: {
        vi: `${legal.repository.vi} (${legal.year}) & ${archive.repository.vi}`,
        en: `${legal.repository.en} (${legal.year}) & ${archive.repository.en}`,
        zh: `${legal.repository.zh}（${legal.year}）及${archive.repository.zh}`,
      },
      citationIds: ids.length > 0 ? ids : survey?.arcCode ? [survey.arcCode] : [],
      primaryCreditId: archive?.creditId || survey?.creditId,
      referenceIndexes: [legal.index, archive.index].filter((v, i, a) => a.indexOf(v) === i),
    };
  }

  // Chapter II: Architecture & Materials -> Archival drawings + Field Survey
  if (normalizedIdx === 1) {
    const ids = [archive?.arcCode, survey?.arcCode].filter(
      (v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i
    );
    return {
      sourceNote: {
        vi: `${archive.title.vi.split('(')[0].trim()} — ${archive.repository.vi} & ${survey.repository.vi}`,
        en: `${archive.title.en.split('(')[0].trim()} — ${archive.repository.en} & ${survey.repository.en}`,
        zh: `${archive.repository.zh}与${survey.repository.zh}建筑测绘资料`,
      },
      citationIds: ids,
      primaryCreditId: archive?.creditId || survey?.creditId,
      referenceIndexes: [archive.index, survey.index].filter((v, i, a) => a.indexOf(v) === i),
    };
  }

  // Chapter III: Historical Milestones & Preservation -> Legal decree + Secondary archive / Survey
  if (normalizedIdx === 2) {
    const picked = secondaryArchive || archive;
    const ids = [picked?.arcCode, survey?.arcCode].filter(
      (v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i
    );
    return {
      sourceNote: {
        vi: `Hồ sơ xếp hạng di tích (${legal.year}) & ${picked.repository.vi}`,
        en: `Official Heritage Classification Dossier (${legal.year}) & ${picked.repository.en}`,
        zh: `文物法定评定档案（${legal.year}）及${picked.repository.zh}`,
      },
      citationIds: ids,
      primaryCreditId: survey?.creditId || picked?.creditId,
      referenceIndexes: [legal.index, picked.index, survey.index].filter(
        (v, i, a) => a.indexOf(v) === i
      ),
    };
  }

  // Chapter IV: Regional Heritage Corridor & Contemporary Field Survey
  const ids = [survey?.arcCode, 'ARC-REG-MAP-04'].filter(
    (v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i
  );
  return {
    sourceNote: {
      vi: `${survey.repository.vi} (${survey.year}) & Hồ sơ GIS Di sản Đông Nam Bộ`,
      en: `${survey.repository.en} (${survey.year}) & Southeast Vietnam GIS Heritage Registry`,
      zh: `${survey.repository.zh}（${survey.year}）与越南东南部 GIS 遗产图谱`,
    },
    citationIds: ids,
    primaryCreditId: survey?.creditId || 'mc-map-gis-tiles',
    referenceIndexes: [survey.index, legal.index].filter((v, i, a) => a.indexOf(v) === i),
  };
}

/**
 * Tạo phụ lục "NGUỒN TƯ LIỆU & TÀI LIỆU THAM KHẢO" chuẩn học thuật để đính kèm cuối tệp kịch bản tải về.
 */
export function formatScriptReferencesAppendix(
  siteId: string,
  siteName: string,
  lang: Language
): string {
  const refs = getSiteReferences(siteId);
  if (refs.length === 0) return '';

  const heading =
    lang === 'en'
      ? 'ARCHIVAL SOURCES & SCHOLARLY REFERENCES'
      : lang === 'zh'
      ? '档案文献与学术参考文献'
      : 'NGUỒN TƯ LIỆU & TÀI LIỆU THAM KHẢO';

  const subnote =
    lang === 'en'
      ? `Compiled and verified for ${siteName} (Dau An Viet 3D Heritage Project — Grade 10 History Class, Le Quy Don High School for the Gifted, Vung Tau).`
      : lang === 'zh'
      ? `本导览文稿依据以下法定评定档案、馆藏文献及实地考察资料核校编撰（Dấu Ấn Việt 3D 遗产数字化项目 — 头顿黎贵惇重点高中十年级历史专业班）。`
      : `Hệ thống nguồn dẫn kiểm định cho di tích ${siteName} (Dự án Dấu Ấn Việt 3D — Tập thể Lớp 10 Chuyên Sử, Trường THPT Chuyên Lê Quý Đôn – Vũng Tàu).`;

  const groupedOrder: HeritageReferenceCategory[] = [
    'legal_ranking',
    'archival_literature',
    'field_survey',
  ];

  const lines: string[] = [
    '',
    '============================================================',
    heading,
    '============================================================',
    subnote,
    '',
  ];

  groupedOrder.forEach((cat) => {
    const groupItems = refs.filter((r) => r.category === cat);
    if (groupItems.length === 0) return;
    lines.push(`[ ${getReferenceCategoryLabel(cat, lang).toUpperCase()} ]`);
    groupItems.forEach((ref) => {
      const codeSuffix = ref.arcCode
        ? lang === 'en'
          ? ` | Archival ID: ${ref.arcCode}`
          : lang === 'zh'
          ? ` | 档案编号：${ref.arcCode}`
          : ` | Mã hồ sơ lưu trữ: ${ref.arcCode}`
        : '';
      lines.push(
        `  [${ref.index}] ${ref.title[lang]} (${ref.year}).`
      );
      lines.push(
        `      ${
          lang === 'en' ? 'Repository / Authority' : lang === 'zh' ? '馆藏 / 审定机构' : 'Cơ quan lưu trữ / ban hành'
        }: ${ref.repository[lang]}${codeSuffix}`
      );
    });
    lines.push('');
  });

  lines.push(
    lang === 'en'
      ? 'Note: Non-commercial scholarly and heritage education use only.'
      : lang === 'zh'
      ? '说明：仅供非商业文化遗产教育与学术研究参考。'
      : 'Ghi chú: Tư liệu phục vụ mục đích giáo dục di sản và nghiên cứu khoa học phi thương mại.'
  );

  return lines.join('\n');
}
