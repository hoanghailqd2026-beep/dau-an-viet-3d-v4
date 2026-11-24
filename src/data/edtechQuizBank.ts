export type EdTechQuizRegion = 'hcm' | 'binhduong' | 'vungtau';

export interface EdTechQuizQuestion {
  id: number;
  siteId: string;
  region: EdTechQuizRegion;
  monumentCode: string;
  monumentCodeEn?: string;
  monumentCodeZh?: string;
  question: string;
  questionEn?: string;
  questionZh?: string;
  options: string[];
  optionsEn?: string[];
  optionsZh?: string[];
  correctIndex: number;
  explanation: string;
  explanationEn?: string;
  explanationZh?: string;
}

export const EDTECH_QUIZ_QUESTIONS: EdTechQuizQuestion[] = [
  // =========================================================================
  // NHÓM TP.HCM (12 CÂU) — PHỦ KÍN 12 DI TÍCH TP. HỒ CHÍ MINH
  // =========================================================================
  {
    id: 1,
    siteId: 'HCM-DT-009',
    region: 'hcm',
    monumentCode: 'HCM-DT-009 · Địa đạo Củ Chi',
    monumentCodeEn: 'HCM-DT-009 · Cu Chi Tunnels',
    monumentCodeZh: 'HCM-DT-009 · 古芝地道',
    question:
      'Vì sao hệ thống Địa đạo Củ Chi sâu tới 3 tầng ngầm (từ -3m đến -10m) có thể chịu được sức ép bom đạn hạng nặng mà không cần gia cố bê tông cốt thép?',
    questionEn:
      'Why could the 3-level subterranean Cu Chi Tunnels (-3m to -10m) withstand heavy aerial bombardment without reinforced concrete lining?',
    questionZh:
      '为什么深达地下三层（-3米至-10米）的古芝地道无需钢筋混凝土加固即可抵御重型炸弹冲击？',
    options: [
      'A. Nhờ đào trong tầng cát biển mềm có độ đàn hồi cao',
      'B. Nhờ cấu tạo địa chất đất sét pha đá ong (laterite clay) trên nền phù sa cổ tự kết cứng khi gặp không khí',
      'C. Nhờ toàn bộ vách hầm được ốp đá hoa cương xanh Biên Hòa',
      'D. Nhờ đào dưới mực nước ngầm của sông Sài Gòn',
    ],
    optionsEn: [
      'A. Dug within soft elastic marine sand strata',
      'B. Carved into ancient alluvial laterite clay that naturally hardens upon exposure to oxygen',
      'C. Lined entirely with Bien Hoa blue granite slabs',
      'D. Excavated below the Saigon River water table',
    ],
    optionsZh: [
      'A. 挖掘于富有弹性的松软海沙层中',
      'B. 依托古冲积台地富含铁铝的红土粘土层（Laterite Clay），遇空气氧化后坚硬如天然混凝土',
      'C. 整个隧道内壁均铺设边和青花岗岩',
      'D. 挖掘于西贡河地下水位以下',
    ],
    correctIndex: 1,
    explanation:
      'Địa đạo Củ Chi nằm trên thềm phù sa cổ Đông Nam Bộ có tầng đất sét pha đá ong (laterite clay) giàu oxit sắt – nhôm. Khi đào thông với không khí, vách hầm tự oxy hóa kết tảng cứng chắc như vòm bê tông tự nhiên.',
    explanationEn:
      'The Cu Chi Tunnels cut through ancient alluvial laterite clay rich in iron and aluminum oxides; once exposed to air, the arched tunnel walls oxidize into a self-supporting natural concrete shell.',
    explanationZh:
      '古芝地道位于东南部古冲积台地的铁铝红土粘土层中，开挖接触空气后表面氧化硬化，形成稳固的天然拱形结构。',
  },
  {
    id: 2,
    siteId: 'HCM-DT-001',
    region: 'hcm',
    monumentCode: 'HCM-DT-001 · Dinh Độc Lập',
    monumentCodeEn: 'HCM-DT-001 · Independence Palace',
    monumentCodeZh: 'HCM-DT-001 · 独立宫（统一宫）',
    question:
      'Mặt tiền Dinh Độc Lập do KTS Ngô Viết Thụ thiết kế (khởi công 1962) sử dụng hệ lam che nắng đặc trưng nào, và công trình gắn với dấu mốc lịch sử trọng đại nào?',
    questionEn:
      'What distinctive sun-shading facade did Architect Ngo Viet Thu design for Independence Palace (1962), and which major historical milestone is tied to it?',
    questionZh:
      '吴日树建筑师于1962年为独立宫设计了何种标志性遮阳立面，这座建筑又见证了哪一重大历史时刻？',
    options: [
      'A. Bức rèm hoa đá hình đốt trúc cách điệu thông gió tự nhiên; chứng kiến Chiến thắng 30/4/1975 thống nhất đất nước',
      'B. Hệ cột thức Corinth Hy Lạp bằng đá cẩm thạch; nơi ký Hiệp định Genève 1954',
      'C. Hệ mái ngói âm dương cung đình; nơi diễn ra phong trào Đông Du 1905',
      'D. Mái vòm thép kính Eiffel; nơi thành lập Nhà máy Ba Son',
    ],
    optionsEn: [
      'A. Stylized bamboo-segment stone brise-soleil for natural ventilation; site of the April 30, 1975 reunification victory',
      'B. Marble Greco-Roman Corinthian columns; site of the 1954 Geneva Accords',
      'C. Imperial yin-yang tiled roof; center of the 1905 Dong Du movement',
      'D. Eiffel glass-and-steel dome; birthplace of the Ba Son Shipyard',
    ],
    optionsZh: [
      'A. 竹节造型石质花格帘实现自然通风遮阳；见证1975年4月30日越南统一胜利',
      'B. 古希腊大理石科林斯柱廊；1954年日内瓦协议签署地',
      'C. 宫廷阴阳瓦大屋顶；1905年东游运动中心',
      'D. 埃菲尔钢结构玻璃穹顶；巴山造船厂旧址',
    ],
    correctIndex: 0,
    explanation:
      'KTS Ngô Viết Thụ tạo nên bức rèm hoa đá hình đốt trúc quanh lầu 2 theo triết lý chữ Cát (吉) giúp giảm bức xạ nhiệt đới. Trưa ngày 30/4/1975, xe tăng Quân giải phóng tiến vào Dinh Độc Lập, hoàn thành sự nghiệp thống nhất đất nước.',
    explanationEn:
      'Architect Ngo Viet Thu combined Tropical Modernism with Eastern philosophy through the bamboo-segment stone curtain facade on an auspicious "Cat" plan. On April 30, 1975, Liberation Army tanks entered the palace, completing national reunification.',
    explanationZh:
      '吴日树以二层竹节花石帘结合汉字“吉”平面实现热带现代主义通风隔热。1975年4月30日中午，解放军坦克冲破大门进入独立宫，标志着民族解放与国家统一。',
  },
  {
    id: 3,
    siteId: 'HCM-DT-002',
    region: 'hcm',
    monumentCode: 'HCM-DT-002 · Nhà hát Thành phố',
    monumentCodeEn: 'HCM-DT-002 · Saigon Opera House',
    monumentCodeZh: 'HCM-DT-002 · 胡志明市大剧院',
    question:
      'Nhà hát Thành phố Hồ Chí Minh (khánh thành năm 1900) là công trình tiêu biểu cho trường phái kiến trúc Pháp nào vào cuối thế kỷ XIX?',
    questionEn:
      'The Ho Chi Minh City Opera House (inaugurated in 1900) is an emblematic monument of which late 19th-century French architectural style?',
    questionZh:
      '1900年落成的胡志明市大剧院是19世纪末哪种法国建筑流派的代表作？',
    options: [
      'A. Kiến trúc Gothic Trung cổ không có phù điêu',
      'B. Kiến trúc Flamboyant (Pháp cuối thế kỷ XIX) lấy cảm hứng từ Petit Palais với vòm cửa chạm khắc phù điêu tinh xảo',
      'C. Kiến trúc Hiện đại chủ nghĩa thô mộc Brutalism',
      'D. Kiến trúc Nhà rường gỗ miền Trung',
    ],
    optionsEn: [
      'A. Austere Medieval Gothic without reliefs',
      'B. Late 19th-century French Flamboyant Beaux-Arts style inspired by the Petit Palais with ornate stone reliefs and arched portal',
      'C. Exposed-concrete Brutalist Modernism',
      'D. Central Vietnamese wooden beam-house architecture',
    ],
    optionsZh: [
      'A. 无浮雕装饰的中世纪哥特式',
      'B. 19世纪末法国华丽学院派（Flamboyant），借鉴巴黎小皇宫设计，正门拱券配有精美女神与花饰浮雕',
      'C. 现代主义粗野派清水混凝土风格',
      'D. 越南中部传统木构厅堂建筑',
    ],
    correctIndex: 1,
    explanation:
      'Do các KTS Eugène Ferret, Félix Olivier và Ernest Guichard thiết kế theo mẫu Tiểu cung điện (Petit Palais) ở Paris, Nhà hát Thành phố mang phong cách Flamboyant rực rỡ với hai tượng nữ thần nâng đỡ vòm sảnh và âm học thính phòng chuẩn mực.',
    explanationEn:
      'Designed by French architects Eugène Ferret, Félix Olivier, and Ernest Guichard after the Petit Palais in Paris, the Opera House exemplifies late-19th-century Flamboyant Beaux-Arts ornamentation and refined acoustic geometry.',
    explanationZh:
      '该剧院由法国建筑师参考巴黎小皇宫设计，以华丽的火焰学院派（Flamboyant）拱门女神像浮雕和卓越的声学空间结构著称。',
  },
  {
    id: 4,
    siteId: 'HCM-DT-003',
    region: 'hcm',
    monumentCode: 'HCM-DT-003 · Bưu điện Trung tâm Sài Gòn',
    monumentCodeEn: 'HCM-DT-003 · Saigon Central Post Office',
    monumentCodeZh: 'HCM-DT-003 · 西贡中心邮局',
    question:
      'Điểm độc đáo trong kỹ thuật kết cấu và trang trí của Bưu điện Trung tâm Sài Gòn (1886–1891, KTS Alfred Foulhoux) là gì?',
    questionEn:
      'What defines the structural engineering and decorative synthesis of Saigon Central Post Office (1886–1891, Architect Alfred Foulhoux)?',
    questionZh:
      '西贡中心邮局（1886–1891年，建筑师阿尔弗雷德·富卢）在结构工程与装饰艺术上有何独到之处？',
    options: [
      'A. Kết cấu vòm thép chịu lực vượt nhịp lớn ở sảnh chính kết hợp họa tiết phù điêu Đông – Tây và hai tấm bản đồ lịch sử cổ',
      'B. Toàn bộ khung chịu lực làm bằng gỗ lim nhập từ Bắc Bộ',
      'C. Hệ thống hầm ngầm bê tông sâu 4 tầng dùng cho tàu điện ngầm',
      'D. Tháp chuông bằng đồng cao 60m ở chính giữa mái vòm',
    ],
    optionsEn: [
      'A. Long-span riveted steel barrel-vault trusses in the main hall paired with East-West decorative reliefs and two antique regional maps',
      'B. Entire load-bearing frame built from northern ironwood',
      'C. Four-level concrete subway basement beneath the hall',
      'D. A 60-meter bronze bell tower crowning the center dome',
    ],
    optionsZh: [
      'A. 中央大厅采用大跨度铆接钢桁架拱顶，结合东西方融合装饰浮雕与两幅历史地图壁画',
      'B. 全部承重框架均采用越南北方铁木建造',
      'C. 地下设有四层混凝土地铁车站结构',
      'D. 屋顶正中矗立60米高青铜钟塔',
    ],
    correctIndex: 0,
    explanation:
      'Alfred Foulhoux (thường bị nhầm với Gustave Eiffel) thiết kế sảnh chính với hệ vì kèo vòm thép công nghiệp thế kỷ XIX thanh mảnh giúp lấy sáng thông thoáng, hai bên vách treo bản đồ bưu chính Nam Kỳ 1892 và Campuchia 1936.',
    explanationEn:
      'Designed by Alfred Foulhoux (often misattributed to Gustave Eiffel), the hall spans wide without interior pillars via 19th-century riveted steel arches, framed by antique postal maps of Cochinchina (1892) and Saigon environs.',
    explanationZh:
      '建筑师富卢设计的中央大厅运用19世纪大型铆接钢拱桁架实现宽敞采光，两侧墙面绘制1892年南圻电信地图与历史装饰浮雕，巧妙融合工业力学与东方细节。',
  },
  {
    id: 5,
    siteId: 'HCM-DT-006',
    region: 'hcm',
    monumentCode: 'HCM-DT-006 · Bảo tàng Lịch sử TP.HCM',
    monumentCodeEn: 'HCM-DT-006 · HCMC Museum of History',
    monumentCodeZh: 'HCM-DT-006 · 胡志明市历史博物馆',
    question:
      'Bảo tàng Lịch sử Thành phố Hồ Chí Minh (khánh thành 1929) do KTS Auguste Delaval thiết kế là cột mốc mở đầu cho phong cách kiến trúc nào tại Sài Gòn?',
    questionEn:
      'Designed by Architect Auguste Delaval and opened in 1929, the HCMC Museum of History marks the debut of which architectural style in Saigon?',
    questionZh:
      '1929年开馆的胡志明市历史博物馆（奥古斯特·德拉瓦尔设计）在西贡开创了哪种建筑风格？',
    options: [
      'A. Kiến trúc Phục hưng Ý (Italian Renaissance)',
      'B. Kiến trúc Đông Dương (Indochine) kết hợp khối tháp bát giác mái chồng diêm Á Đông với không gian trưng bày thông thoáng kiểu Pháp',
      'C. Kiến trúc Hậu hiện đại (Postmodernism) mặt kính phản quang',
      'D. Kiến trúc Art Deco thuần túy kiểu Mỹ',
    ],
    optionsEn: [
      'A. Italian Renaissance Architecture',
      'B. Indochine Architecture uniting an octagonal double-eave East Asian pavilion tower with naturally ventilated French gallery wings',
      'C. Reflective-glass Postmodernism',
      'D. Pure American Art Deco',
    ],
    optionsZh: [
      'A. 意大利文艺复兴风格',
      'B. 印支风格（Indochine），将东方重檐八角中央大厅与法式自然通风展厅合二为一',
      'C. 反射玻璃幕墙后现代主义',
      'D. 纯粹美式装饰艺术风格',
    ],
    correctIndex: 1,
    explanation:
      'Khởi đầu là Bảo tàng Blanchard de la Brosse (1929), công trình áp dụng xuất sắc phong cách Đông Dương do Ernest Hébrard đề xướng và Auguste Delaval cụ thể hóa: mái ngói âm dương, con sơn đấu củng kết hợp cửa sổ lấy sáng nhiệt đới.',
    explanationEn:
      'Originally Musée Blanchard de la Brosse (1929), it exemplifies the Indochine architectural synthesis by uniting traditional Asian octagonal double roofs and bracket consoles with climatic French museum wings.',
    explanationZh:
      '该建筑是西贡印支建筑美学的里程碑，以中央八角重檐亭顶、传统斗拱搭配法式长廊与高窗采光，目前馆藏涵盖从史前至阮朝的丰富东南部文物。',
  },
  {
    id: 6,
    siteId: 'HCM-DT-004',
    region: 'hcm',
    monumentCode: 'HCM-DT-004 · Chợ Bến Thành',
    monumentCodeEn: 'HCM-DT-004 · Ben Thanh Market',
    monumentCodeZh: 'HCM-DT-004 · 滨城市场',
    question:
      'Tháp đồng hồ ba mặt tại cửa Nam Chợ Bến Thành (hoàn thành 1914) cùng các bức phù điêu gốm Biên Hòa trên bốn cổng chính mang ý nghĩa biểu tượng nào?',
    questionEn:
      'What cultural and civic symbolism do the three-faced clock tower at Ben Thanh Market South Gate (1914) and its Bien Hoa ceramic reliefs represent?',
    questionZh:
      '滨城市场南门三面钟楼（1914年建成）及四座大门上的边和釉陶浮雕体现了什么象征意义？',
    options: [
      'A. Biểu tượng trung tâm giao thương sầm uất của Sài Gòn và sản vật nông – ngư nghiệp trù phú vùng Nam Bộ',
      'B. Biểu tượng cảng quân sự độc quyền của hải quân thế kỷ XVII',
      'C. Pháo đài phòng thủ ngoại vi thành Gia Định',
      'D. Đài thiên văn đo thủy triều sông Đồng Nai',
    ],
    optionsEn: [
      'A. Civic landmark of Saigon commerce paired with stylized agricultural and maritime products of Southern Vietnam',
      'B. Exclusive 17th-century naval military bastion',
      'C. Outer fortification watchtower of Gia Dinh Citadel',
      'D. Astronomical observatory for Dong Nai River tides',
    ],
    optionsZh: [
      'A. 象征西贡繁华商贸中心及南部丰饶农渔物产的边和陶艺浮雕',
      'B. 17世纪海军专属军事堡垒',
      'C. 嘉定城外围防御炮台',
      'D. 同奈河潮汐天文观测塔',
    ],
    correctIndex: 0,
    explanation:
      'Chợ Bến Thành mới do hãng Brossard et Mopin thi công (1912–1914) trên khu đất lấp ao Bồ Rệt; đến thập niên 1950 được gắn thêm các bức phù điêu gốm Biên Hòa khắc họa sản vật bốn phương tại 4 cửa Đông – Tây – Nam – Bắc.',
    explanationEn:
      'Constructed between 1912 and 1914 by Brossard et Mopin, Ben Thanh Market became the commercial heart of Saigon, later enriched with Bien Hoa ceramic reliefs portraying Southern agricultural and riverine goods at its four cardinal gates.',
    explanationZh:
      '1914年落成的滨城市场是西贡百年商贸地标，南门钟楼与东西南北四门镶嵌的边和陶瓷浮雕生动展现南部鱼米丰饶景象。',
  },
  {
    id: 7,
    siteId: 'HCM-DT-005',
    region: 'hcm',
    monumentCode: 'HCM-DT-005 · Nhà thờ Chính tòa Đức Bà Sài Gòn',
    monumentCodeEn: 'HCM-DT-005 · Notre-Dame Cathedral Basilica of Saigon',
    monumentCodeZh: 'HCM-DT-005 · 西贡圣母大教堂（红教堂）',
    question:
      'Vật liệu gạch đỏ đặc trưng giúp mặt ngoài Nhà thờ Chính tòa Đức Bà Sài Gòn (1877–1880, KTS Jules Bourard) giữ sắc hồng son bền màu qua hơn 140 năm là kỹ thuật xây dựng nào?',
    questionEn:
      'Which masonry material and technique gives Notre-Dame Cathedral Basilica of Saigon (1877–1880) its enduring terracotta hue without external plaster?',
    questionZh:
      '建于1877–1880年的西贡圣母大教堂经历140多年依然保持红砖本色不褪色的建筑材料工艺是什么？',
    options: [
      'A. Sơn phủ vôi đỏ lên tường đá ong',
      'B. Gạch trần chế tác từ Marseille (Pháp) không tô trát vữa ngoài, phối hợp kiến trúc Roman pha Gothic và cặp tháp chuông cao 57,6m',
      'C. Gạch đất sét nung non bọc tấm đồng lá bên ngoài',
      'D. Đá bazan đen ghép vữa tam hợp mật mía',
    ],
    optionsEn: [
      'A. Red limewash painted over laterite stone blocks',
      'B. Unplastered exposed bricks imported from Marseille, uniting Romanesque and Gothic arches with twin 57.6m bell towers',
      'C. Soft clay bricks clad in bronze sheets',
      'D. Black basalt masonry bonded with molasses lime mortar',
    ],
    optionsZh: [
      'A. 红土石块外墙刷红石灰涂料',
      'B. 采用法国马赛烧制的清水红砖砌筑且不抹灰，融合罗马式圆拱与哥特式双钟楼（高57.6米）',
      'C. 轻烧粘土砖外包铜板',
      'D. 黑玄武岩砌筑配糖蜜三合灰浆',
    ],
    correctIndex: 1,
    explanation:
      'Toàn bộ gạch ốp mặt ngoài được đặt sản xuất từ Marseille không cần tô trát (gạch trần) để chống rêu mốc nhiệt đới; phần khung kết hợp vòm bán nguyệt Roman ở tầng dưới và tháp nhọn Gothic 6 chuông đồng bên trên.',
    explanationEn:
      'Exposed bricks from Marseille resist tropical humidity without plastering, pairing semicircular Romanesque nave arches with Gothic twin spires.',
    explanationZh:
      '教堂外墙全部采用马赛特制清水红砖裸砌抗潮防苔，底层呈现厚重的罗马式半圆拱券，上部则是挺拔的哥特式双尖钟塔。',
  },
  {
    id: 8,
    siteId: 'HCM-DT-011',
    region: 'hcm',
    monumentCode: 'HCM-DT-011 · Chùa Giác Lâm',
    monumentCodeEn: 'HCM-DT-011 · Giac Lam Pagoda',
    monumentCodeZh: 'HCM-DT-011 · 觉林古寺',
    question:
      'Chùa Giác Lâm (quận Tân Bình, lập năm 1744) là ngôi tổ đình cổ nhất TP.HCM mang đặc trưng kiến trúc gỗ truyền thống Nam Bộ nào?',
    questionEn:
      'Founded in 1744 in Tan Binh District, Giac Lam Pagoda—the oldest pagoda in Ho Chi Minh City—exemplifies which traditional Southern wooden architectural layout?',
    questionZh:
      '始建于1744年的胡志明市最古老祖庭——觉林古寺具有哪种典型的南部传统木构建筑特征？',
    options: [
      'A. Kiến trúc chữ Tam (三) ba dãy nối tiếp gồm Chánh điện – Giảng đường – Trai đường với hệ khung gỗ "tứ trụ" và 98 cột gỗ quý',
      'B. Chùa một cột bằng bê tông cốt thép dựng giữa hồ sen',
      'C. Tháp gạch Chăm ba tầng không có mái ngói',
      'D. Nhà thờ ba gian mái tôn kiểu đầu thế kỷ XX',
    ],
    optionsEn: [
      'A. Triple-hall "Tam" (三) plan (Main Sanctuary, Dharma Hall, Dining Hall) framed by 98 timber columns and the Southern "four-pillar" core',
      'B. Single-pillar reinforced concrete pavilion in a lotus pond',
      'C. Three-tier unroofed brick Cham tower',
      'D. Corrugated-iron three-bay 20th-century hall',
    ],
    optionsZh: [
      'A. 呈“三”字形三进布局（正殿—讲堂—斋堂），内部采用南部传统“四柱”中心框架与98根硬木柱',
      'B. 莲花池中央的钢筋混凝土独柱亭',
      'C. 无瓦覆顶的三层占婆红砖塔',
      'D. 20世纪初铁皮屋顶三间厅',
    ],
    correctIndex: 0,
    explanation:
      'Chùa Giác Lâm khởi dựng năm Giáp Tý (1744) bởi cư sĩ Lý Thụy Long, phát triển theo kết cấu chữ Tam (三) đặc trưng của chùa cổ Nam Bộ, nổi bật với hàng trăm pho tượng gỗ quý và tháp Xá Lợi 7 tầng.',
    explanationEn:
      'Established in 1744, Giac Lam Pagoda follows the traditional Southern "Tam" (三) wooden hall sequence with 98 hardwood columns, classical gold-lacquered altars, and a rich legacy of Southern Zen Buddhism.',
    explanationZh:
      '觉林古寺建于1744年，是嘉定地区最早的禅宗祖庭，三进穿斗式木构殿堂内共有98根木柱及百余尊珍贵贴金木雕佛像。',
  },
  {
    id: 9,
    siteId: 'HCM-DT-008',
    region: 'hcm',
    monumentCode: 'HCM-DT-008 · Lăng Tả quân Lê Văn Duyệt',
    monumentCodeEn: 'HCM-DT-008 · Mausoleum of Le Van Duyet',
    monumentCodeZh: 'HCM-DT-008 · 黎文悦左军陵（翁巴沼陵）',
    question:
      'Lăng Tả quân Lê Văn Duyệt (Lăng Ông Bà Chiểu) thể hiện đặc trưng kiến trúc tín ngưỡng thời Nguyễn nào và tôn vinh đóng góp lịch sử nào?',
    questionEn:
      'Which Nguyen Dynasty architectural characteristics does the Mausoleum of Le Van Duyet (Lang Ong Ba Chieu) embody, and what historical contribution does it honor?',
    questionZh:
      '黎文悦左军陵（翁巴沼陵）体现了阮朝哪种陵庙建筑形制，又纪念了他的哪项历史功绩？',
    options: [
      'A. Quần thể lăng mộ song táng có bình phong – nghi môn – miếu thờ chạm khắc tinh xảo, tri ân hai nhiệm kỳ Tổng trấn Gia Định Thành của Lê Văn Duyệt',
      'B. Pháo đài pháo binh bờ biển thời Pháp thuộc',
      'C. Trường đại học y khoa đầu tiên tại Nam Kỳ',
      'D. Nhà xưởng đóng tàu thủy quân thế kỷ XX',
    ],
    optionsEn: [
      'A. Nguyen-era mausoleum complex with screen wall, ceremonial gate, and ornate timber worship hall honoring Le Van Duyet’s two terms as Viceroy of Gia Dinh Citadel',
      'B. French colonial coastal artillery casemate',
      'C. First medical university in Cochinchina',
      'D. Twentieth-century naval dockyard',
    ],
    optionsZh: [
      'A. 融照壁、仪门、双合葬墓丘与木雕正殿为一体的阮朝陵庙建筑群，纪念黎文悦两任嘉定城总镇开垦与安民功绩',
      'B. 法属时期海岸炮兵碉堡',
      'C. 南圻第一所医科大学',
      'D. 20世纪海军造船厂',
    ],
    correctIndex: 0,
    explanation:
      'Lăng Ông Bà Chiểu kết hợp hài hòa bố cục lăng mộ triều Nguyễn với nghệ thuật khảm sành sứ và điêu khắc gỗ truyền thống, ghi dấu công lao bảo hộ an ninh, mở mang thương mại và kênh đào của Tổng trấn Gia Định Thành Lê Văn Duyệt.',
    explanationEn:
      'Lang Ong Ba Chieu pairs Nguyen Dynasty funerary geometry and ceramic mosaic art with wooden worship halls honoring Viceroy Le Van Duyet’s stewardship of Gia Dinh Citadel.',
    explanationZh:
      '翁巴沼陵兼具阮朝陵园礼制格局与南部传统嵌瓷、木雕工艺，彰显黎文悦治理嘉定城时期促进商贸与社会安定的重要地位。',
  },
  {
    id: 10,
    siteId: 'HCM-DT-012',
    region: 'hcm',
    monumentCode: 'HCM-DT-012 · Hội quán Nghĩa An',
    monumentCodeEn: 'HCM-DT-012 · Nghia An Assembly Hall',
    monumentCodeZh: 'HCM-DT-012 · 义安会馆（关帝庙）',
    question:
      'Điểm nhấn nghệ thuật kiến trúc nổi tiếng nhất trên hệ mái ngói và không gian nội thất của Hội quán Nghĩa An (Chùa Ông, Chợ Lớn) là gì?',
    questionEn:
      'What is the most celebrated artistic hallmark of the tiled roofs and interior hall of Nghia An Assembly Hall in Cho Lon?',
    questionZh:
      '堤岸义安会馆（关帝庙）在屋顶建筑与室内艺术装饰方面最具特色的工艺是什么？',
    options: [
      'A. Mái vòm bê tông phẳng kiểu Bauhaus',
      'B. Quần thể tượng gốm men nhiều màu (Lưỡng long tranh châu, Bát tiên, điển tích Tam Quốc) trên bờ nóc kiểu Triều Châu và gỗ chạm thếp vàng',
      'C. Tháp chuông đá granite cao 45 mét theo phong cách Roman',
      'D. Tranh ghép kính màu châu Âu trên toàn bộ bốn vách tường',
    ],
    optionsEn: [
      'A. Flat Bauhaus concrete slab roof',
      'B. Multicolored glazed ceramic roofline figurines (twin dragons, Eight Immortals, Three Kingdoms epics) in Teochew craftsmanship paired with gilded woodcarvings',
      'C. 45-meter Romanesque granite bell tower',
      'D. European stained-glass panels covering all four walls',
    ],
    optionsZh: [
      'A. 包豪斯风格平板混凝土屋顶',
      'B. 潮州嵌瓷屋脊群雕（双龙戏珠、八仙过海、三国典故）配精美贴金木雕神龛与大型木马塑像',
      'C. 45米高罗马式花岗岩钟楼',
      'D. 四面墙壁铺满欧洲彩色玻璃画',
    ],
    correctIndex: 1,
    explanation:
      'Hội quán Nghĩa An do cộng đồng người Hoa gốc Triều Châu xây dựng từ đầu thế kỷ XIX để thờ Quan Công, nổi bật với kỹ thuật khảm gốm men nổi tiếng trên bờ nóc, giếng trời điều hòa ánh sáng và nghệ thuật mộc chạm thếp vàng.',
    explanationEn:
      'Built by the Teochew community in Cho Lon to venerate Quan Cong, Nghia An Assembly Hall is famed for its glazed ceramic roofline tableaux, daylight courtyard well, and gilded timber carvings.',
    explanationZh:
      '义安会馆由潮州先民于19世纪初兴建，主祀关圣帝君，屋脊彩釉嵌瓷人物群像、天井采光与贴金木雕均堪称堤岸华人建筑瑰宝。',
  },
  {
    id: 11,
    siteId: 'HCM-DT-007',
    region: 'hcm',
    monumentCode: 'HCM-DT-007 · Bến Nhà Rồng - Bảo tàng Hồ Chí Minh',
    monumentCodeEn: 'HCM-DT-007 · Nha Rong Wharf - Ho Chi Minh Museum',
    monumentCodeZh: 'HCM-DT-007 · 龙屋港—胡志明博物馆',
    question:
      'Công trình Bến Nhà Rồng (xây dựng 1862–1863) mang tên gọi "Nhà Rồng" từ chi tiết kiến trúc nào và gắn liền với sự kiện lịch sử ngày 5/6/1911 ra sao?',
    questionEn:
      'Where does Nha Rong Wharf (built 1862–1863) derive its name "Dragon House," and how does it connect to June 5, 1911?',
    questionZh:
      '建于1862–1863年的“龙屋港”得名于哪一建筑细节，它又与1911年6月5日的哪一重大历史事件紧密相连？',
    options: [
      'A. Trên nóc mái trụ sở hãng vận tải biển Messageries Maritimes gắn đôi rồng chầu mặt trăng kiểu Á Đông; là nơi người thanh niên Nguyễn Tất Thành ra đi tìm đường cứu nước',
      'B. Có bức tượng rồng bằng đồng nằm dưới lòng sông Bến Nghé; nơi thành lập Xí nghiệp dệt đầu tiên',
      'C. Là cung điện mùa hè của triều đình nhà Nguyễn tại Nam Kỳ',
      'D. Là ga xe lửa đầu tiên nối Sài Gòn – Mỹ Tho',
    ],
    optionsEn: [
      'A. The French Messageries Maritimes roof ridge carries two East Asian dragons flanking the moon; the exact pier from which Nguyen Tat Thanh departed on June 5, 1911 to seek national salvation',
      'B. Submerged bronze dragon statue in the Ben Nghe channel; site of the first textile mill',
      'C. Summer palace of the Nguyen emperors in Cochinchina',
      'D. First railway station connecting Saigon and My Tho',
    ],
    optionsZh: [
      'A. 法国海运公司大楼屋脊饰有东方“双龙朝月”雕塑；1911年6月5日青年阮必成（胡志明）由此乘船出国寻求救国真理',
      'B. 滨义河底沉睡着青铜巨龙雕塑；首家纺织厂旧址',
      'C. 阮朝皇帝在南圻的夏宫',
      'D. 连接西贡与美萩的首座火车站',
    ],
    correctIndex: 0,
    explanation:
      'Tòa nhà do hãng tàu Messageries Maritimes (Pháp) xây làm thương cảng nhưng trang trí đôi rồng gốm men trên mái nên dân gian gọi là Nhà Rồng. Ngày 5/6/1911, từ bến cảng này, Nguyễn Tất Thành lên tàu Amiral Latouche-Tréville bắt đầu hành trình cứu nước.',
    explanationEn:
      'Although built by France’s Messageries Maritimes shipping company, its roof features twin ceramic dragons flanking a moon, earning the name Nha Rong. From this pier on June 5, 1911, Nguyen Tat Thanh embarked on his journey for national liberation.',
    explanationZh:
      '该建筑原为法国海运公司总部，因屋顶装饰中式“双龙朝月”陶雕而被称为“龙屋”。1911年6月5日，青年阮必成从这里登上拉图什·特雷维尔号邮轮踏上救国之路。',
  },
  {
    id: 12,
    siteId: 'HCM-DT-010',
    region: 'hcm',
    monumentCode: 'HCM-DT-010 · Di tích Khảo cổ Giồng Cá Vồ',
    monumentCodeEn: 'HCM-DT-010 · Giong Ca Vo Archaeological Site',
    monumentCodeZh: 'HCM-DT-010 · 榕鱼窝考古遗址（芹耶）',
    question:
      'Khu Di tích Khảo cổ học Giồng Cá Vồ (Cần Giờ) đã phát hiện loại hình táng thức và hiện vật tiêu biểu nào có niên đại khoảng 2.000–2.500 năm cách ngày nay?',
    questionEn:
      'Which burial practice and hallmark artifacts dating back 2,000–2,500 years BP were uncovered at Giong Ca Vo Archaeological Site in Can Gio?',
    questionZh:
      '在胡志明市芹耶县榕鱼窝考古遗址（距今约2000–2500年）发现了哪种典型墓葬形制与随葬文物？',
    options: [
      'A. Quần thể mộ chum gốm chôn cùng khuyên tai hai đầu thú (bằng ngọc nephrite/thủy tinh), hạt cườm đá mã não và đồ sắt sớm của cư dân tiền Óc Eo',
      'B. Lăng mộ đá vôi của thủy thủ Tây Ban Nha thế kỷ XVI',
      'C. Hệ thống tháp gạch Chăm Pa thế kỷ X',
      'D. Hầm chứa vũ khí bằng thép thế kỷ XX',
    ],
    optionsEn: [
      'A. Ceramic jar-burial necropolis containing two-headed animal ear-pendants, agate and glass beads, and early iron tools of pre-Oc Eo coastal communities',
      'B. Limestone tombs of 16th-century Spanish mariners',
      'C. 10th-century Cham brick sanctuary cluster',
      'D. 20th-century steel munitions bunkers',
    ],
    optionsZh: [
      'A. 瓮棺葬墓群及双兽首耳饰、玛瑙与玻璃串珠及早期铁器，实证前奥盖文化时期沿海居民的海洋贸易网络',
      'B. 16世纪西班牙水手石灰岩墓群',
      'C. 10世纪占婆红砖神塔群',
      'D. 20世纪钢制军火地堡',
    ],
    correctIndex: 0,
    explanation:
      'Các cuộc khai quật tại Giồng Cá Vồ (1993–1994) phát lộ hơn 300 mộ chum và nhiều khuyên tai hai đầu thú, minh chứng cho mạng lưới giao thương hàng hải rực rỡ giữa cư dân ven biển Cần Giờ với khu vực Đông Nam Á từ thời sơ kỳ đồ sắt.',
    explanationEn:
      'Excavations at Giong Ca Vo revealed over 300 ceramic jar burials with iconic two-headed animal pendants and beads, testifying to early Iron Age maritime trade networks connecting Can Gio to Southeast Asia.',
    explanationZh:
      '榕鱼窝考古发掘出土300余座瓮棺墓及极具代表性的双兽首耳坠与宝石串珠，印证了早期铁器时代芹耶先民与东南亚地区频繁的海上商贸联系。',
  },

  // =========================================================================
  // NHÓM BÌNH DƯƠNG (6 CÂU) — PHỦ KÍN 2 DI TÍCH TỈNH BÌNH DƯƠNG
  // =========================================================================
  {
    id: 13,
    siteId: 'BD-DT-001',
    region: 'binhduong',
    monumentCode: 'BD-DT-001 · Nhà cổ Trần Công Vàng',
    monumentCodeEn: 'BD-DT-001 · Tran Cong Vang Ancient House',
    monumentCodeZh: 'BD-DT-001 · 陈公黄金木古宅',
    question:
      'Nhà cổ Trần Công Vàng (TP. Thủ Dầu Một, xây dựng 1889–1892) mang mặt bằng kiến trúc truyền thống nào và sở hữu hệ thống cột chịu lực quy mô ra sao?',
    questionEn:
      'What traditional architectural floor plan and timber column structure define the Tran Cong Vang Ancient House (Thu Dau Mot, built 1889–1892)?',
    questionZh:
      '建于1889–1892年的平阳土龙木陈公黄金木古宅采用了何种传统建筑平面及木柱支撑体系？',
    options: [
      'A. Kiểu nhà chữ Đinh (丁) 3 gian 2 chái với 64 cột gỗ quý (căm xe, gỗ đỏ, gõ mật) liên kết hoàn toàn bằng mộng chốt truyền thống',
      'B. Kiểu nhà chữ Công (工) xây bằng đá ong không cột gỗ',
      'C. Kiểu biệt thự Pháp ba tầng có thang máy cơ khí',
      'D. Kiểu nhà dài Tây Nguyên lợp lá tranh dài 50m',
    ],
    optionsEn: [
      'A. Southern "Đinh" (丁) layout with 3 bays and 2 side wings supported by 64 rare hardwood columns joined without nails via mortise-and-tenon',
      'B. Laterite-stone "Cong" (工) house with no wooden columns',
      'C. Three-story French villa with mechanical elevator',
      'D. 50-meter thatch-roofed Central Highlands longhouse',
    ],
    optionsZh: [
      'A. 南部传统“丁”字形三间两厢平面布局，由64根珍贵硬木立柱纯榫卯咬合连接而不使用铁钉',
      'B. 无木柱的红土石“工”字形大屋',
      'C. 装有机械电梯的三层法式别墅',
      'D. 长50米的西原茅草长屋',
    ],
    correctIndex: 0,
    explanation:
      'Nhà cổ Trần Công Vàng là kiệt tác nhà vườn Nam Bộ thế kỷ XIX, gồm hai khối vuông góc tạo thành chữ Đinh (丁) với 3 gian 2 chái, 64 cột gỗ quý (đặc biệt hàng cột cái đường kính lớn) giữ vững kết cấu hơn một thế kỷ.',
    explanationEn:
      'Built between 1889 and 1892, the Tran Cong Vang Ancient House follows the classic Southern "Đinh" (丁) T-shaped layout with 3 central bays, 2 flanking wings, and 64 ironwood columns.',
    explanationZh:
      '陈公黄金木古宅建于1889–1892年，呈典型南部“丁”字形三间两厢格局，64根硬木立柱凭借精湛榫卯结构屹立百余年。',
  },
  {
    id: 14,
    siteId: 'BD-DT-001',
    region: 'binhduong',
    monumentCode: 'BD-DT-001 · Nhà cổ Trần Công Vàng',
    monumentCodeEn: 'BD-DT-001 · Tran Cong Vang Ancient House',
    monumentCodeZh: 'BD-DT-001 · 陈公黄金木古宅',
    question:
      'Nghệ thuật trang trí nội thất trong Nhà cổ Trần Công Vàng phản ánh đỉnh cao của nghề thủ công truyền thống nào tại vùng đất Thủ Dầu Một?',
    questionEn:
      'Which renowned traditional craft heritage of the Thu Dau Mot region is showcased in the interior ornamentation of the Tran Cong Vang Ancient House?',
    questionZh:
      '陈公黄金木古宅的室内木雕与陈设展现了土龙木地区哪项著名传统手工艺的巅峰水准？',
    options: [
      'A. Nghề đúc đồng cổ điển miền Bắc',
      'B. Nghề chạm khắc gỗ Thủ Dầu Một với kỹ thuật chạm lộng đa tầng, sơn son thếp vàng và khảm xà cừ trên bao lam, hoành phi, câu đối',
      'C. Nghề dệt lụa gấm bằng khung cửi hơi nước',
      'D. Nghề vẽ tranh sơn dầu phong cách Ấn tượng',
    ],
    optionsEn: [
      'A. Ancient northern bronze bell casting',
      'B. Thu Dau Mot woodcarving and mother-of-pearl inlay craftsmanship featuring pierced multi-layer carvings, red lacquer, and gold leaf on ceremonial valances and couplets',
      'C. Steam-powered brocade silk weaving',
      'D. Impressionist oil painting on canvas',
    ],
    optionsZh: [
      'A. 越南北方古典青铜铸造工艺',
      'B. 土龙木传统木雕、朱漆贴金及螺钿镶嵌工艺，集中体现在雕花隔扇、横匾与对联之上',
      'C. 蒸汽织机锦缎丝绸织造业',
      'D. 印象派油画装饰艺术',
    ],
    correctIndex: 1,
    explanation:
      'Nghệ nhân mộc – điêu khắc Thủ Dầu Một thế kỷ XIX đã dồn tâm huyết tạo tác hệ thống bao lam "Tứ linh", "Mai – Lan – Cúc – Trúc", liễn đối khảm ốc xà cừ và sơn son thếp vàng lộng lẫy bên trong gian thờ chính của ngôi nhà.',
    explanationEn:
      '19th-century Thu Dau Mot master woodworkers crafted intricate pierced-relief valances depicting the Four Sacred Animals and Four Gentlemen, enriched with gold leaf and mother-of-pearl inlay.',
    explanationZh:
      '19世纪土龙木木雕匠人为正厅打造了极其繁复的镂空“四灵”“四君子”花罩、螺钿镶嵌对联与贴金匾额，是平阳手工艺的活化石。',
  },
  {
    id: 15,
    siteId: 'BD-DT-001',
    region: 'binhduong',
    monumentCode: 'BD-DT-001 · Nhà cổ Trần Công Vàng',
    monumentCodeEn: 'BD-DT-001 · Tran Cong Vang Ancient House',
    monumentCodeZh: 'BD-DT-001 · 陈公黄金木古宅',
    question:
      'Giải pháp lợp mái ngói âm dương kết hợp hệ cửa lá sách và sàn gạch tàu trong Nhà cổ Trần Công Vàng mang lại ưu điểm thích ứng khí hậu nào cho vùng Đông Nam Bộ?',
    questionEn:
      'How do the yin-yang roof tiles, louvered wooden shutters, and terracotta floor tiles of the Tran Cong Vang Ancient House adapt to Southeast Vietnam’s climate?',
    questionZh:
      '陈公黄金木古宅采用阴阳瓦屋顶、百叶木窗与红陶地砖的设计，如何巧妙适应东南部热带气候？',
    options: [
      'A. Tạo lớp đệm không khí đối lưu trên mái giúp chống nóng bức xạ nhiệt đới, thoát ẩm nhanh và tránh mối mọt cho khung gỗ',
      'B. Giữ nhiệt tuyệt đối để sưởi ấm vào mùa đông băng giá',
      'C. Hấp thụ nước mưa trực tiếp xuống nền đất để làm mát',
      'D. Tích hợp máy phát điện gió trên đỉnh nóc nhà',
    ],
    optionsEn: [
      'A. Creates a thermal air-gap under double tiles, encourages cross-breeze ventilation, and regulates ground humidity to protect hardwood columns',
      'B. Traps extreme heat against freezing winter snow',
      'C. Channels rainwater onto an unpaved mud floor',
      'D. Houses a mechanical wind turbine beneath the ridge',
    ],
    optionsZh: [
      'A. 双层阴阳瓦形成隔热空气层，配合木质百叶窗穿堂通风与透水陶砖防潮，有效保护硬木立柱免受潮湿虫蛀',
      'B. 严密封闭以抵御严寒冬季暴雪',
      'C. 将雨水直接引入泥土地面降温',
      'D. 在屋脊下方隐藏风力发电机',
    ],
    correctIndex: 0,
    explanation:
      'Mái ngói âm dương xếp chồng tạo khe thoáng đối lưu nhiệt; kết hợp mái hiên đua rộng che nắng mưa tạt và nền gạch tàu kê chân tảng đá xanh giúp bảo toàn hệ cột gỗ qua nhiều thế hệ.',
    explanationEn:
      'Interlocking yin-yang tiles create insulating air pockets while wide verandas, louvered doors, and granite column plinths shield the hardwood structure from tropical sun and monsoon damp.',
    explanationZh:
      '阴阳瓦层叠形成的空气隙有效阻隔烈日热辐射，深挑檐与青石柱础隔绝地面湿气，构成科学的生态微气候设计。',
  },
  {
    id: 16,
    siteId: 'BD-DT-002',
    region: 'binhduong',
    monumentCode: 'BD-DT-002 · Địa đạo Tam Giác Sắt (Tây Nam Bến Cát)',
    monumentCodeEn: 'BD-DT-002 · Iron Triangle Tunnels (SW Ben Cat)',
    monumentCodeZh: 'BD-DT-002 · 铁三角地道（西南笨葛）',
    question:
      'Hệ thống Địa đạo Tam Giác Sắt được khởi đào từ năm 1948 nằm tại khu vực địa lý chiến lược nào của tỉnh Bình Dương?',
    questionEn:
      'Initiated in 1948, the Iron Triangle Tunnel network lies within which strategic geographic zone of Binh Duong Province?',
    questionZh:
      '始建于1948年的平阳“铁三角”地道位于该省哪一极具战略意义的地理交汇区？',
    options: [
      'A. Vùng Tây Nam Bến Cát (gồm các xã An Điền, An Tây, Phú An), kẹp giữa hợp lưu sông Sài Gòn và sông Thị Tính',
      'B. Khu vực đảo cát ngoài khơi biển Vũng Tàu',
      'C. Vùng núi đá vôi biên giới phía Bắc',
      'D. Khu trung tâm thương mại Chợ Lớn năm 1960',
    ],
    optionsEn: [
      'A. Southwest Ben Cat (An Dien, An Tay, Phu An communes) nestled between the confluence of the Saigon and Thi Tinh rivers',
      'B. Offshore sandbar off the Vung Tau coastline',
      'C. Northern limestone karst highlands',
      'D. Commercial center of Cho Lon in 1960',
    ],
    optionsZh: [
      'A. 西南笨葛地区（安田、安西、富安三乡），位于西贡河与氏性河交汇处的战略三角地带',
      'B. 头顿外海沙洲岛屿区',
      'C. 越北喀斯特石灰岩山地',
      'D. 1960年代堤岸商贸中心区',
    ],
    correctIndex: 0,
    explanation:
      'Tam Giác Sắt là địa danh quân sự chỉ vùng 3 xã Tây Nam Bến Cát (An Điền, An Tây, Phú An) nằm giữa ngã ba sông Sài Gòn – sông Thị Tính, án ngữ cửa ngõ Tây Bắc tiến vào Sài Gòn.',
    explanationEn:
      'The Iron Triangle designates the three communes of Southwest Ben Cat—An Dien, An Tay, and Phu An—framed by the Saigon and Thi Tinh rivers guarding Saigon’s northwestern approach.',
    explanationZh:
      '“铁三角”指笨葛西南的安田、安西、富安三乡，地处西贡河与氏性河合流处，扼守西贡西北门户。',
  },
  {
    id: 17,
    siteId: 'BD-DT-002',
    region: 'binhduong',
    monumentCode: 'BD-DT-002 · Địa đạo Tam Giác Sắt (Tây Nam Bến Cát)',
    monumentCodeEn: 'BD-DT-002 · Iron Triangle Tunnels (SW Ben Cat)',
    monumentCodeZh: 'BD-DT-002 · 铁三角地道（西南笨葛）',
    question:
      'Trong không gian 3D bóc tách của Địa đạo Tam Giác Sắt, hệ thống công sự chiến đấu ngầm được tổ chức liên hoàn như thế nào?',
    questionEn:
      'Inside the 3D cross-section of the Iron Triangle Tunnels, how were its subterranean defensive structures linked together?',
    questionZh:
      '在“铁三角”地道的3D地下剖面结构中，其地下防御与生活坑道是如何串联运作的？',
    options: [
      'A. Chỉ gồm một đường hầm thẳng dài 100m không có cửa thoát hiểm',
      'B. Gồm trục địa đạo chính kết hợp hầm hội họp, hầm cứu thương, kho lương thực, ụ chiến đấu chữ A và nhiều cửa lên bí mật dẫn ra bìa rừng, bờ sông',
      'C. Sử dụng đường ray xe lửa bằng thép chạy suốt lòng địa đạo',
      'D. Được xây nổi trên mặt đất bằng tường gạch cao 3m',
    ],
    optionsEn: [
      'A. A single 100m straight corridor with zero emergency exits',
      'B. Main arterial tunnels connecting command chambers, medical rooms, food depots, A-frame firing bunkers, and camouflaged hatches toward forest edges and riverbanks',
      'C. Steel railway tracks running the length of the tunnel',
      'D. Above-ground 3-meter brick perimeter walls',
    ],
    optionsZh: [
      'A. 仅有一条100米直通道且无任何逃生口',
      'B. 由主干地道串联地下会议室、战地医院、粮仓、A字形火力掩体以及通往林缘与河岸的多重隐蔽出入口',
      'C. 隧道内部铺设全线钢铁小火车轨道',
      'D. 全线均筑于地面以上3米高砖墙内',
    ],
    correctIndex: 1,
    explanation:
      'Địa đạo Tam Giác Sắt đào trong tầng đất sét pha sỏi cơm rắn chắc, tạo nên mạng lưới liên hoàn nhiều ngách cụt – ngách thoát hiểm, nối trực tiếp chiến hào mặt đất với bờ sông Sài Gòn để cơ động lực lượng bất ngờ.',
    explanationEn:
      'Excavated in dense gravelly clay, the Iron Triangle network integrated meeting rooms, aid stations, traps, and concealed hatches linking surface trenches to the Saigon River.',
    explanationZh:
      '该地道开凿于坚实的含砾红土层，形成了主道、分岔掩体、医疗室与通往河岸林缘暗道相连接的立体防御网。',
  },
  {
    id: 18,
    siteId: 'BD-DT-002',
    region: 'binhduong',
    monumentCode: 'BD-DT-002 · Địa đạo Tam Giác Sắt (Tây Nam Bến Cát)',
    monumentCodeEn: 'BD-DT-002 · Iron Triangle Tunnels (SW Ben Cat)',
    monumentCodeZh: 'BD-DT-002 · 铁三角地道（西南笨葛）',
    question:
      'Vai trò lịch sử nổi bật nhất của căn cứ Địa đạo Tam Giác Sắt trong hai cuộc kháng chiến (1945–1975) là gì?',
    questionEn:
      'What was the paramount strategic role of the Iron Triangle base during Vietnam’s resistance wars (1945–1975)?',
    questionZh:
      '1945–1975年期间，“铁三角”地道基地在历史战略上发挥了怎样的核心作用？',
    options: [
      'A. Là bàn đạp chiến lược sát nách Sài Gòn giúp che giấu lực lượng, đứng vững trước nhiều chiến dịch càn quét quy mô lớn (như chiến dịch Cedar Falls 1967)',
      'B. Là thương cảng xuất khẩu cao su thời bình',
      'C. Là trạm trung chuyển đường sắt Bắc – Nam duy nhất',
      'D. Là căn cứ hải quân xa bờ trên Biển Đông',
    ],
    optionsEn: [
      'A. A resilient strategic springboard close to Saigon that sheltered resistance command and withstood massive sweeps such as Operation Cedar Falls (1967)',
      'B. Peacetime commercial rubber-export river port',
      'C. Sole North–South railway junction',
      'D. Offshore naval base in the East Sea',
    ],
    optionsZh: [
      'A. 紧邻西贡的顽强战略支点，成功掩护抗战主力并在1967年“雪松瀑布”等大规模扫荡中屹立不倒',
      'B. 和平时期专门出口橡胶的商业内河港',
      'C. 唯一的南北铁路换乘枢纽',
      'D. 位于东海的远海海军基地',
    ],
    correctIndex: 0,
    explanation:
      'Dù bị đánh phá ác liệt trong các trận càn lớn như Cedar Falls (1967), quân và dân Tam Giác Sắt vẫn bám trụ trong lòng đất, giữ vững tuyến hành lang chiến lược từ Chiến khu Đ nối xuống Củ Chi và nội đô Sài Gòn.',
    explanationEn:
      'Despite massive operations like Cedar Falls in 1967, local forces held the Iron Triangle underground, maintaining the vital strategic corridor linking War Zone D, Cu Chi, and Saigon.',
    explanationZh:
      '即便经历1967年大规模扫荡，军民依然依托地道坚守阵地，保住了连接D战区、古芝与西贡内城的战略走廊。',
  },

  // =========================================================================
  // NHÓM BÀ RỊA – VŨNG TÀU (7 CÂU) — PHỦ KÍN 3 DI TÍCH TỈNH BR-VT
  // =========================================================================
  {
    id: 19,
    siteId: 'BRVT-DT-001',
    region: 'vungtau',
    monumentCode: 'BRVT-DT-001 · Bạch Dinh (Villa Blanche)',
    monumentCodeEn: 'BRVT-DT-001 · White Palace (Villa Blanche)',
    monumentCodeZh: 'BRVT-DT-001 · 白宫（头顿总督行宫）',
    question:
      'Bạch Dinh (Villa Blanche, xây dựng 1898–1902) trên sườn Núi Lớn ở Vũng Tàu có giá trị kiến trúc và bộ sưu tập khảo cổ nào nổi bật nhất?',
    questionEn:
      'Standing on Big Mountain in Vung Tau, what architectural style and major archaeological collection distinguish the White Palace (1898–1902)?',
    questionZh:
      '建于1898–1902年的头顿大山白宫在建筑风格与馆藏考古文物方面有何显著特色？',
    options: [
      'A. Dinh thự Tân cổ điển Pháp 3 tầng phủ vôi trắng với phù điêu gốm men cổ điển, hiện lưu giữ bộ sưu tập gốm sứ cổ tàu đắm Hòn Cau (thế kỷ XVII)',
      'B. Pháo đài đá ngầm dưới mực nước biển vịnh Hàng Dứa',
      'C. Ngôi chùa gỗ bảy tầng tháp dựng từ thế kỷ XVI',
      'D. Nhà ga đường sắt đầu tiên vùng duyên hải',
    ],
    optionsEn: [
      'A. Three-story whitewashed French Neoclassical villa with ceramic medallions, housing the 17th-century Hon Cau shipwreck porcelain collection',
      'B. Subsea stone casemate beneath Bai Dua Bay',
      'C. 16th-century seven-story wooden pagoda',
      'D. First coastal railway terminal',
    ],
    optionsZh: [
      'A. 三层白墙法式新古典主义海滨行宫，外墙嵌古典釉陶半身像与鲤鱼瓷雕，现珍藏17世纪槟岛沉船出水的康熙青花瓷器',
      'B. 位于海湾水位以下的地下石砌堡垒',
      'C. 16世纪七层木结构佛塔',
      'D. 沿海地区第一座火车站',
    ],
    correctIndex: 0,
    explanation:
      'Tọa lạc ở cao độ +27,5m sườn Núi Lớn hướng ra Bãi Trước, Bạch Dinh cao 19m mang dáng dấp biệt thự Pháp cuối thế kỷ XIX và là nơi trưng bày hàng ngàn cổ vật gốm sứ đời Khang Hy vớt từ tàu đắm cổ Hòn Cau – Côn Đảo.',
    explanationEn:
      'Perched at +27.5m on Big Mountain overlooking Front Beach, the 19m-tall Villa Blanche showcases French Neoclassical arcades alongside thousands of Kangxi-era porcelains recovered from the Hon Cau shipwreck.',
    explanationZh:
      '白宫坐落于海拔27.5米的大山山腰俯瞰前滩，以纯白法式拱廊建筑著称，并集中展示从昆仑—槟岛古沉船打捞的康熙青花外销瓷珍品。',
  },
  {
    id: 20,
    siteId: 'BRVT-DT-001',
    region: 'vungtau',
    monumentCode: 'BRVT-DT-001 · Bạch Dinh (Villa Blanche)',
    monumentCodeEn: 'BRVT-DT-001 · White Palace (Villa Blanche)',
    monumentCodeZh: 'BRVT-DT-001 · 白宫（头顿总督行宫）',
    question:
      'Trong giai đoạn 1907–1916, Bạch Dinh gắn liền với câu chuyện lịch sử bi tráng nào của vị vua yêu nước triều Nguyễn?',
    questionEn:
      'Between 1907 and 1916, which patriotic Nguyen Dynasty emperor was confined under house arrest at the White Palace?',
    questionZh:
      '在1907年至1916年间，头顿白宫见证了阮朝哪位爱国皇帝被法殖民当局软禁的历史事件？',
    options: [
      'A. Vua Thành Thái bị thực dân Pháp ép thoái vị và đưa về giam lỏng tại Bạch Dinh trước khi đày đi đảo Réunion',
      'B. Vua Gia Long đặt kinh đô đầu tiên tại Vũng Tàu',
      'C. Vua Quang Trung tổ chức duyệt thủy quân tại Núi Lớn',
      'D. Vua Lý Thái Tổ ban chiếu dời đô tại đây',
    ],
    optionsEn: [
      'A. Emperor Thanh Thai was forced to abdicate by French authorities and confined at Villa Blanche prior to his exile to Réunion Island',
      'B. Emperor Gia Long established his first imperial capital in Vung Tau',
      'C. Emperor Quang Trung reviewed his naval fleet at Big Mountain',
      'D. King Ly Thai To issued the Capital Relocation Edict here',
    ],
    optionsZh: [
      'A. 成泰帝遭法国殖民者逼迫退位后被软禁于白宫，随后流放至留尼汪岛',
      'B. 嘉隆帝在头顿设立首个王朝首都',
      'C. 光中帝在大山检阅海军舰队',
      'D. 李太祖在此颁布《迁都诏》',
    ],
    correctIndex: 0,
    explanation:
      'Ban đầu Bạch Dinh được Toàn quyền Paul Doumer xây làm nơi nghỉ mát (đặt tên theo con gái Blanche), nhưng từ 1907 đến 1916 chính quyền thực dân đã dùng nơi đây giam lỏng Vua Thành Thái do tinh thần chống Pháp của nhà vua.',
    explanationEn:
      'Originally built as a governor-general’s retreat by Paul Doumer, Villa Blanche served from 1907 to 1916 as the confinement residence of Emperor Thanh Thai before his exile.',
    explanationZh:
      '白宫原为法属印度支那总督保罗·杜美修建的避暑行宫，1907–1916年因成泰帝具有强烈反法爱国意识而被软禁于此。',
  },
  {
    id: 21,
    siteId: 'BRVT-DT-002',
    region: 'vungtau',
    monumentCode: 'BRVT-DT-002 · Quần thể kiến trúc Nhà Lớn Long Sơn',
    monumentCodeEn: 'BRVT-DT-002 · Long Son Big House Complex',
    monumentCodeZh: 'BRVT-DT-002 · 龙山大屋建筑群',
    question:
      'Quần thể kiến trúc Nhà Lớn Long Sơn (xã đảo Long Sơn, xây dựng 1910–1929) do ông Lê Văn Mưu (Ông Trần) sáng lập được tổ chức gồm những hạng mục không gian đặc trưng nào?',
    questionEn:
      'Founded by Le Van Muu (Ong Tran) between 1910 and 1929 on Long Son Island, which distinctive architectural structures make up the Long Son Big House Complex?',
    questionZh:
      '由黎文谋（陈翁）于1910–1929年在龙山岛创立的龙山大屋建筑群包含哪些代表性空间单元？',
    options: [
      'A. Quần thể liên hoàn gồm khu đền thờ (Lầu Thánh, Lầu Tiên, Lầu Phật, Lầu Trời), nhà hội, dãy nhà ở tập thể, kho thóc, chợ và lăng mộ Ông Trần',
      'B. Tổ hợp cảng container thép hiện đại thế kỷ XXI',
      'C. Cụm tháp Chăm xây bằng gạch nung đỏ trên đỉnh núi',
      'D. Một ngôi biệt thự Pháp hai tầng có sân golf',
    ],
    optionsEn: [
      'A. An interconnected wooden complex of sacred pavilions (Lau Thanh, Lau Tien, Lau Phat, Lau Troi), communal dining halls, granaries, market, and Ong Tran’s tomb',
      'B. A 21st-century steel container terminal',
      'C. A cluster of fired-brick Cham sanctuary towers',
      'D. A two-story French villa with a private golf course',
    ],
    optionsZh: [
      'A. 由圣楼、仙楼、佛楼、天楼与会馆、集体居住区、粮仓、集市及陈翁陵墓组成的传统全木构社区建筑群',
      'B. 21世纪现代化钢铁集装箱港口群',
      'C. 山顶占婆红砖塔群',
      'D. 带高尔夫球场的法式两层别墅',
    ],
    correctIndex: 0,
    explanation:
      'Nhà Lớn Long Sơn rộng hơn 2ha mang đậm dấu ấn kiến trúc cổ truyền Nam Bộ pha nét đình chùa dân gian, hội tụ các khu Lầu Thánh – Lầu Tiên – Lầu Phật – Lầu Trời và khu sinh hoạt cộng đồng đầm ấm nghĩa tình trên xã đảo.',
    explanationEn:
      'Spanning over two hectares, the Long Son Big House unites sacred wooden halls (Lau Thanh, Lau Tien, Lau Phat, Lau Troi) with communal dining houses, granaries, and welfare spaces built by settlers led by Ong Tran.',
    explanationZh:
      '占地逾两公顷的龙山大屋以“圣、仙、佛、天”四楼及会馆、粮仓构成自给自足的聚落礼制空间，深刻体现垦荒先民守望相助的精神。',
  },
  {
    id: 22,
    siteId: 'BRVT-DT-002',
    region: 'vungtau',
    monumentCode: 'BRVT-DT-002 · Quần thể kiến trúc Nhà Lớn Long Sơn',
    monumentCodeEn: 'BRVT-DT-002 · Long Son Big House Complex',
    monumentCodeZh: 'BRVT-DT-002 · 龙山大屋建筑群',
    question:
      'Trong sinh hoạt văn hóa và kiến trúc Nhà Lớn Long Sơn, giá trị tinh thần – cổ vật nổi bật nào vẫn được bảo lưu nguyên vẹn đến ngày nay?',
    questionEn:
      'Which cultural values and treasured heritage artifacts remain intact inside the Long Son Big House community today?',
    questionZh:
      '龙山大屋至今依然完整保留着哪些珍贵文物与社区文化传统？',
    options: [
      'A. Bộ bàn ghế Bách Niên chạm khảm tinh xảo, tủ thờ cẩn ốc xà cừ cùng triết lý Đạo Ông Trần đề cao đạo hiếu, bình đẳng và tương trợ không phân biệt giàu nghèo',
      'B. Hệ thống tượng đá cẩm thạch La Mã cổ đại',
      'C. Bộ sưu tập máy hơi nước đầu thế kỷ XVIII',
      'D. Tháp đồng hồ điện tử điều khiển từ xa',
    ],
    optionsEn: [
      'A. The "Hundred-Year" carved furniture set, mother-of-pearl inlaid altars, and Ong Tran’s teachings emphasizing filial piety, equality, and mutual community aid',
      'B. Ancient Roman marble bust gallery',
      'C. Early 18th-century steam locomotive depot',
      'D. Remote-controlled digital clock tower',
    ],
    optionsZh: [
      'A. 精美绝伦的“百年桌椅”、螺钿嵌壳神龛，以及崇尚孝道、人人平等与扶弱济贫的“陈翁道”生活准则',
      'B. 古罗马大理石雕塑陈列馆',
      'C. 18世纪初期蒸汽机车库',
      'D. 远程遥控电子钟楼',
    ],
    correctIndex: 0,
    explanation:
      'Nhà Lớn Long Sơn hiện lưu giữ hàng trăm cổ vật quý (như bộ bàn ghế Bách Niên, trường kỷ gỗ trắc) và duy trì nếp sống mộc mạc, hiếu khách của cư dân theo Đạo Ông Trần: vào đền không đốt vàng mã, giữ gìn đoàn kết cộng đồng.',
    explanationEn:
      'The complex preserves rare heirloom timber furniture (notably the Bach Nien set) while upholding Ong Tran’s egalitarian customs of simplicity, hospitality, and community solidarity.',
    explanationZh:
      '大屋内珍藏着百年紫檀木桌椅等数百件传世木器，社区至今保持朴素好客、不烧冥纸、团结互助的独特民俗。',
  },
  {
    id: 23,
    siteId: 'BRVT-DT-003',
    region: 'vungtau',
    monumentCode: 'BRVT-DT-003 · Địa đạo Long Phước',
    monumentCodeEn: 'BRVT-DT-003 · Long Phuoc Tunnels',
    monumentCodeZh: 'BRVT-DT-003 · 龙福地道',
    question:
      'Địa đạo Long Phước (TP. Bà Rịa) được quân và dân địa phương khởi đào vào năm nào và kết cấu mạng lưới tổng thể ra sao?',
    questionEn:
      'When did local troops and residents begin excavating the Long Phuoc Tunnels (Ba Ria City), and how was the overall tunnel network structured?',
    questionZh:
      '巴地市龙福地道始建于哪一年，其整体坑道网络是如何规划连接的？',
    options: [
      'A. Khởi đào năm 1948, gồm trục đường xương sống dài hàng cây số nối liền 5 ấp trong xã Long Phước và liên kết với căn cứ núi Minh Đạm',
      'B. Khởi đào năm 1995 làm đường hầm thủy điện',
      'C. Chỉ gồm một căn hầm tránh bão dài 15m',
      'D. Được xây dựng bởi thủy thủ Bồ Đào Nha thế kỷ XVI',
    ],
    optionsEn: [
      'A. Begun in 1948 with a kilometers-long spine corridor linking all five hamlets of Long Phuoc commune and connecting toward the Minh Dam mountain base',
      'B. Excavated in 1995 for a hydroelectric plant',
      'C. Only a single 15-meter storm shelter',
      'D. Constructed by 16th-century Portuguese mariners',
    ],
    optionsZh: [
      'A. 始挖于1948年，以数公里长的主干脊柱地道串联龙福乡五个村落，并连通明淡山抗战基地',
      'B. 1995年开挖的水电站引水隧洞',
      'C. 仅有一条15米长的单室防风避难洞',
      'D. 16世纪葡萄牙水手修筑',
    ],
    correctIndex: 0,
    explanation:
      'Địa đạo Long Phước khởi công năm 1948 trên nền đất đỏ bazan pha sỏi ong rất cứng chắc, phát triển thành mạng lưới nối thông các ấp Đông, Tây, Nam, Bắc, Phước Hữu để bộ đội cơ động linh hoạt trong lòng địch.',
    explanationEn:
      'Started in 1948 in firm basaltic-laterite earth, Long Phuoc Tunnels expanded into a multi-hamlet arterial network enabling rapid guerrilla movement between village clusters and Minh Dam.',
    explanationZh:
      '龙福地道于1948年开挖于坚硬的红土砾石层，逐渐贯通乡内各村落并连接山区根据地，实现了村村相连的地下机动通道。',
  },
  {
    id: 24,
    siteId: 'BRVT-DT-003',
    region: 'vungtau',
    monumentCode: 'BRVT-DT-003 · Địa đạo Long Phước',
    monumentCodeEn: 'BRVT-DT-003 · Long Phuoc Tunnels',
    monumentCodeZh: 'BRVT-DT-003 · 龙福地道',
    question:
      'Nét đặc thù trong thiết kế sinh tồn và chiến đấu của Địa đạo Long Phước gắn bó với đời sống người dân là chi tiết nào?',
    questionEn:
      'What distinct survival and defensive feature integrated the Long Phuoc Tunnels directly with everyday village households?',
    questionZh:
      '龙福地道在生存设计与群众防卫结合方面最突出的特色细节是什么？',
    options: [
      'A. Mỗi hộ gia đình có hầm bí mật nối thông ra trục xương sống, kèm ụ chiến đấu, hầm cứu thương, lỗ thông hơi ngụy trang dưới bụi tre và nắp hầm bí mật',
      'B. Sử dụng thang cuốn chạy điện ở mỗi ngã ba hầm',
      'C. Đổ bê tông cốt thép dày 2m toàn bộ từ mặt đất xuống',
      'D. Dẫn nước biển vào ngập nửa chiều cao lòng địa đạo',
    ],
    optionsEn: [
      'A. Household secret bunkers tapped directly into the main spine tunnel, complete with fighting positions, medical alcoves, and bamboo-camouflaged air shafts',
      'B. Electric escalators at major tunnel intersections',
      'C. Two-meter-thick reinforced concrete slabs from surface level down',
      'D. Seawater flooded halfway up the tunnel floor',
    ],
    optionsZh: [
      'A. 家家户户掘有秘窖直通主干地道，配套作战掩体、伤员救护室及巧妙伪装于竹丛下的通气孔与暗门',
      'B. 交叉路口装有电动扶梯',
      'C. 全线从地表浇筑两米厚钢筋混凝土',
      'D. 引入海水淹没半高坑道',
    ],
    correctIndex: 0,
    explanation:
      'Tạo nên thế trận "lòng dân dưới lòng đất", hầm bí mật dưới nền nhà dân ở Long Phước kết nối trực tiếp vào đường trục sâu 2–3m, giúp cán bộ, thương binh và nhân dân bám đất giữ làng suốt nhiều thập kỷ.',
    explanationEn:
      'Embodying a village-wide defense network, secret domestic cellars beneath villagers’ homes linked directly to the 2–3m deep main tunnel with camouflaged bamboo ventilation shafts.',
    explanationZh:
      '村民住宅地下秘窖直连两三米深的主干地道，竹丛伪装通气孔保证了长久隐蔽呼吸与军民联防。',
  },
  {
    id: 25,
    siteId: 'BRVT-DT-003',
    region: 'vungtau',
    monumentCode: 'BRVT-DT-003 · Địa đạo Long Phước',
    monumentCodeEn: 'BRVT-DT-003 · Long Phuoc Tunnels',
    monumentCodeZh: 'BRVT-DT-003 · 龙福地道',
    question:
      'Địa đạo Long Phước đóng vai trò hậu phương – bàn đạp trực tiếp hỗ trợ thắng lợi của chiến dịch lịch sử nào tại Bà Rịa – Long Khánh giai đoạn 1964–1965?',
    questionEn:
      'Which landmark 1964–1965 military campaign in Ba Ria – Long Khanh received direct logistical and tactical support from the Long Phuoc Tunnels?',
    questionZh:
      '1964–1965年间，龙福地道作为直接后方与跳板支援了巴地—隆庆地区的哪场著名历史战役？',
    options: [
      'A. Chiến dịch Bình Giã (1964–1965) — đánh bại chiến thuật "Trực thăng vận" và "Thiết xa vận" ở Đông Nam Bộ',
      'B. Trận thủy chiến Bạch Đằng năm 938',
      'C. Chiến dịch Điện Biên Phủ năm 1954 ở Tây Bắc',
      'D. Trận Rạch Gầm – Xoài Mút năm 1785',
    ],
    optionsEn: [
      'A. The Binh Gia Campaign (1964–1965), defeating helicopter-borne and armored-transport tactics in Southeast Vietnam',
      'B. The 938 Battle of Bach Dang River',
      'C. The 1954 Dien Bien Phu Campaign in Northwest Vietnam',
      'D. The 1785 Battle of Rach Gam – Xoai Mut',
    ],
    optionsZh: [
      'A. 平假战役（1964–1965年），在东南部沉重打击“直升机机降”与“装甲车机动”战术',
      'B. 公元938年白藤江水战',
      'C. 1954年西北奠边府战役',
      'D. 1785年沥涔—吹蔑水战',
    ],
    correctIndex: 0,
    explanation:
      'Từ bàn đạp Địa đạo Long Phước, quân và dân Bà Rịa đã giấu quân, tiếp tế lương thực và thương binh, góp phần làm nên Chiến thắng Bình Giã (12/1964–1/1965) và làm phong phú thêm bức tranh "Tam giác địa đạo Đông Nam Bộ" (Củ Chi – Tam Giác Sắt – Long Phước).',
    explanationEn:
      'Acting as a crucial staging and medical base, Long Phuoc Tunnels directly supported the Binh Gia Campaign (1964–1965) and forms the third pillar of Southeast Vietnam’s Underground Tunnel Triangle alongside Cu Chi and the Iron Triangle.',
    explanationZh:
      '龙福地道在1964–1965年平假战役中承担兵力隐蔽与伤员救护核心任务，并与古芝地道、平阳铁三角地道共同构成“东南部地道铁三角”。',
  },
];
