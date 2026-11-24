// ============================================================================
// NGÂN HÀNG 100 CÂU HỎI TRẮC NGHIỆM DI SẢN ĐÔNG NAM BỘ (DẤU ẤN VIỆT 3D)
// Không trùng lặp · Phủ kín 17/17 di tích · Chia 6 Chuyên đề & 3 Cấp độ
// Đối tượng: Học sinh THCS (Cấp 2) -> THPT (Cấp 3) -> Sinh viên Đại học & Giảng viên
// ============================================================================

export type QuizRegion = 'hcm' | 'bd' | 'brvt';
export type QuizDifficulty = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng';
export type QuizAudience = 'thcs' | 'thpt' | 'dai-hoc-giang-vien';
export type QuizTopicId = 'CD-01' | 'CD-02' | 'CD-03' | 'CD-04' | 'CD-05' | 'CD-06';

export interface QuizTopic {
  id: QuizTopicId;
  title: string;
  shortTitle: string;
  regionScope: string;
  description: string;
  questionCount: number;
}

export interface QuizAudienceLevel {
  id: QuizAudience;
  label: string;
  difficulty: QuizDifficulty;
  description: string;
}

export interface QuizQuestion {
  id: number;
  code: string;
  siteId: string;
  siteName: string;
  region: QuizRegion;
  topicId: QuizTopicId;
  topicName: string;
  difficulty: QuizDifficulty;
  audience: QuizAudience;
  audienceLabel: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  sourceRef: string;
}

export const QUIZ_TOPICS: QuizTopic[] = [
  {
    "id": "CD-01",
    "title": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "shortTitle": "Đô thị & Công trình Công cộng Sài Gòn",
    "regionScope": "TP. Hồ Chí Minh",
    "description": "Khám phá 5 biểu tượng đô thị tiêu biểu của Sài Gòn – TP.HCM (Dinh Độc Lập, Nhà hát Thành phố, Bưu điện Trung tâm, Chợ Bến Thành, Bến Nhà Rồng) dưới góc nhìn lịch sử, quy hoạch và kiến trúc nhiệt đới.",
    "questionCount": 25
  },
  {
    "id": "CD-02",
    "title": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "shortTitle": "Bảo tàng, Mỹ thuật & Khảo cổ học",
    "regionScope": "TP. Hồ Chí Minh",
    "description": "Tìm hiểu phong cách kiến trúc Đông Dương, Art Deco và dấu ấn cư dân Tiền Sơ sử vùng cửa biển qua Bảo tàng Lịch sử TP.HCM, Bảo tàng Mỹ thuật TP.HCM và Khu khảo cổ học Giồng Cá Vồ.",
    "questionCount": 15
  },
  {
    "id": "CD-03",
    "title": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "shortTitle": "Tín ngưỡng & Giao lưu Văn hóa",
    "regionScope": "TP. Hồ Chí Minh",
    "description": "Nghiên cứu không gian tâm linh, nghệ thuật chạm khắc gỗ, gốm Cây Mai và khảm sành sứ tại Chùa Giác Lâm, Lăng Ông Bà Chiểu và Hội quán Nghĩa An.",
    "questionCount": 15
  },
  {
    "id": "CD-04",
    "title": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "shortTitle": "Hệ thống Địa đạo Đông Nam Bộ",
    "regionScope": "Liên tỉnh (TP.HCM – Bình Dương – Bà Rịa – Vũng Tàu)",
    "description": "Phân tích cấu tạo địa chất, kỹ thuật quân sự ngầm và giá trị lịch sử của 3 hệ thống địa đạo tiêu biểu: Củ Chi, Tam Giác Sắt (Bến Cát) và Long Phước (Bà Rịa).",
    "questionCount": 21
  },
  {
    "id": "CD-05",
    "title": "Chuyên đề 5: Kiến trúc Nhà cổ Nam Bộ & Nghệ thuật Chạm khắc Thủ Dầu Một",
    "shortTitle": "Nhà cổ Nam Bộ – Bình Dương",
    "regionScope": "Tỉnh Bình Dương",
    "description": "Khảo sát chuyên sâu Nhà cổ Trần Công Vàng với mặt bằng chữ Đinh nghịch, kết cấu 48 cột gỗ mộng chốt và kỹ nghệ khảm ốc xà cừ truyền thống miền Đông Nam Bộ.",
    "questionCount": 8
  },
  {
    "id": "CD-06",
    "title": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "shortTitle": "Di sản Biển & Văn hóa Vũng Tàu",
    "regionScope": "Tỉnh Bà Rịa – Vũng Tàu",
    "description": "Tìm hiểu lịch sử phòng thủ cửa biển, kiến trúc Pháp tại Bạch Dinh (Villa Blanche) và mô hình cộng đồng – tín ngưỡng đặc sắc tại Quần thể Nhà Lớn Long Sơn (Đạo Ông Trần).",
    "questionCount": 16
  }
];

export const QUIZ_AUDIENCE_LEVELS: QuizAudienceLevel[] = [
  {
    "id": "thcs",
    "label": "THCS (Cấp 2)",
    "difficulty": "Nhận biết",
    "description": "Kiến thức lịch sử – địa lý nền tảng, mốc thời gian, vị trí và đặc trưng dễ nhận biết của di sản."
  },
  {
    "id": "thpt",
    "label": "THPT (Cấp 3)",
    "difficulty": "Thông hiểu",
    "description": "Phân tích bối cảnh lịch sử, cấu trúc kiến trúc, kỹ thuật xây dựng và giá trị văn hóa theo Chương trình GDPT 2018."
  },
  {
    "id": "dai-hoc-giang-vien",
    "label": "Đại học & Giảng viên",
    "difficulty": "Vận dụng",
    "description": "Chuyên sâu về bảo tồn di sản, tiếp biến kiến trúc, địa chất – khảo cổ học và phương pháp tiếp cận liên ngành trong giảng dạy."
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    "id": 1,
    "code": "HCM-DT-001",
    "siteId": "dinh-doc-lap",
    "siteName": "Dinh Độc Lập",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Ai là kiến trúc sư thiết kế công trình Dinh Độc Lập (xây dựng giai đoạn 1962–1966) tại TP. Hồ Chí Minh?",
    "options": [
      "Kiến trúc sư Ngô Viết Thụ",
      "Kiến trúc sư Ernest Hébrard",
      "Kiến trúc sư Alfred Foulhoux",
      "Kiến trúc sư Nguyễn Cao Luyện"
    ],
    "correctIndex": 0,
    "explanation": "Dinh Độc Lập do kiến trúc sư Ngô Viết Thụ thiết kế sau khi Dinh Norodom cũ bị hư hại năm 1962. Ông là kiến trúc sư Việt Nam đầu tiên đoạt giải Khôi nguyên La Mã (Grand Prix de Rome) năm 1955.",
    "sourceRef": "Hồ sơ Di tích Quốc gia Đặc biệt Dinh Độc Lập (2009)"
  },
  {
    "id": 2,
    "code": "HCM-DT-001",
    "siteId": "dinh-doc-lap",
    "siteName": "Dinh Độc Lập",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Sự kiện lịch sử trọng đại nào diễn ra tại Dinh Độc Lập lúc 11 giờ 30 phút ngày 30/4/1975?",
    "options": [
      "Khánh thành công trình Dinh Độc Lập mới sau 4 năm thi công",
      "Xe tăng quân Giải phóng tiến vào Dinh, lá cờ cách mạng tung bay trên nóc, kết thúc Chiến dịch Hồ Chí Minh",
      "Ký kết Hiệp định Paris về chấm dứt chiến tranh, lập lại hòa bình ở Việt Nam",
      "Hội nghị Hiệp thương chính trị thống nhất đất nước được khai mạc"
    ],
    "correctIndex": 1,
    "explanation": "Lúc 11 giờ 30 phút ngày 30/4/1975, xe tăng 390 và 843 thuộc Lữ đoàn Tăng thiết giáp 203 tiến vào cổng Dinh Độc Lập, lá cờ Mặt trận Dân tộc Giải phóng tung bay trên nóc Dinh, đánh dấu toàn thắng của Chiến dịch Hồ Chí Minh.",
    "sourceRef": "Lịch sử Việt Nam tập 13 – Viện Sử học Việt Nam"
  },
  {
    "id": 3,
    "code": "HCM-DT-001",
    "siteId": "dinh-doc-lap",
    "siteName": "Dinh Độc Lập",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Hệ thống bức rèm hoa đá bằng bê tông cách điệu hình đốt trúc ở mặt tiền Dinh Độc Lập có tác dụng kép nào về mặt kiến trúc nhiệt đới?",
    "options": [
      "Chỉ dùng để đỡ trọng lượng mái sân đỗ trực thăng phía trên",
      "Ngăn hoàn toàn ánh sáng tự nhiên và thay thế tường chịu lực chính",
      "Vừa che nắng gắt hướng Đông Nam, thông gió tự nhiên, vừa tạo vẻ thanh thoát mang bản sắc phương Đông",
      "Làm khung đỡ cho hệ thống biển quảng cáo và đèn chiếu sáng đô thị"
    ],
    "correctIndex": 2,
    "explanation": "Bức rèm hoa đá lấy cảm hứng từ mành trúc truyền thống của ngôi nhà Việt, giúp giảm bức xạ nhiệt mặt trời trực tiếp vào hành lang nhưng vẫn đảm bảo đối lưu gió và ánh sáng khuếch tán dịu nhẹ.",
    "sourceRef": "Tư liệu Kiến trúc Hiện đại Miền Nam Việt Nam (1954–1975)"
  },
  {
    "id": 4,
    "code": "HCM-DT-001",
    "siteId": "dinh-doc-lap",
    "siteName": "Dinh Độc Lập",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Tổng thể mặt bằng và hình khối kiến trúc Dinh Độc Lập được kiến trúc sư Ngô Viết Thụ lồng ghép biểu tượng của chữ Hán nào mang ý nghĩa tốt lành?",
    "options": [
      "Chữ Phúc (福) và chữ Thọ (壽)",
      "Chữ Vương (王) và chữ Điền (田)",
      "Chữ Sơn (山) và chữ Thủy (水)",
      "Chữ Cát (吉) kết hợp cấu trúc chữ Khẩu (口), Trung (忠), Tam (三) và Hưng (興)"
    ],
    "correctIndex": 3,
    "explanation": "Mặt bằng tổng thể Dinh Độc Lập mang dáng dấp chữ Cát (tốt lành), kết hợp triết lý chữ Khẩu (đề cao giáo dục và tự do ngôn luận), chữ Trung (trung kiên), chữ Tam (nhân – minh – võ) và chữ Hưng (hưng thịnh).",
    "sourceRef": "Ban Quản lý Di tích Lịch sử Dinh Độc Lập"
  },
  {
    "id": 5,
    "code": "HCM-DT-001",
    "siteId": "dinh-doc-lap",
    "siteName": "Dinh Độc Lập",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Dưới góc độ lý luận kiến trúc và quy hoạch đô thị, vì sao Dinh Độc Lập được giới nghiên cứu đánh giá là mẫu mực của khuynh hướng 'Chủ nghĩa Hiện đại Nhiệt đới' (Tropical Modernism) tại Đông Nam Á?",
    "options": [
      "Vì công trình giải quyết đồng bộ bài toán khí hậu nóng ẩm bằng lam chắn nắng, sân trong, mặt nước và tích hợp minh triết phương Đông trong hình khối hiện đại",
      "Vì công trình sử dụng hoàn toàn vật liệu gỗ lim truyền thống thay cho bê tông cốt thép",
      "Vì công trình sao chép nguyên bản tỷ lệ cột thức Cổ điển Hy Lạp – La Mã kết hợp mái vòm kính",
      "Vì công trình áp dụng kết cấu nhà cao tầng khung thép vượt nhịp của trường phái Chicago"
    ],
    "correctIndex": 0,
    "explanation": "Ngô Viết Thụ đã vượt qua lối sao chép kiến trúc phương Tây để dung hòa công năng hiện đại, vật liệu bê tông – kính với vi khí hậu nhiệt đới (rèm đá, hồ bán nguyệt, công viên cây xanh) và triết lý không gian Á Đông.",
    "sourceRef": "Hội Kiến trúc sư Việt Nam – Nghiên cứu Kiến trúc Hiện đại Việt Nam"
  },
  {
    "id": 6,
    "code": "HCM-DT-002",
    "siteId": "nha-hat-thanh-pho",
    "siteName": "Nhà hát Thành phố",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Nhà hát Thành phố Hồ Chí Minh được xây dựng và chính thức khánh thành vào thời gian nào?",
    "options": [
      "Khởi công năm 1862, khánh thành năm 1865",
      "Khởi công năm 1898, khánh thành ngày 01/01/1900",
      "Khởi công năm 1912, khánh thành năm 1914",
      "Khởi công năm 1927, khánh thành năm 1929"
    ],
    "correctIndex": 1,
    "explanation": "Nhà hát Thành phố được khởi công năm 1898 và chính thức khánh thành vào ngày đầu năm mới 01/01/1900 nhằm phục vụ nhu cầu thưởng thức nghệ thuật giao hưởng, kịch nói và opera.",
    "sourceRef": "Trung tâm Bảo tồn Di tích Lịch sử – Văn hóa TP.HCM"
  },
  {
    "id": 7,
    "code": "HCM-DT-002",
    "siteId": "nha-hat-thanh-pho",
    "siteName": "Nhà hát Thành phố",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Phong cách kiến trúc chủ đạo của Nhà hát Thành phố Hồ Chí Minh chịu ảnh hưởng rõ nét từ hai công trình nổi tiếng nào của nước Pháp?",
    "options": [
      "Nhà thờ Đức Bà Paris và Khải Hoàn Môn",
      "Cung điện Versailles và Tháp Eiffel",
      "Bảo tàng Petit Palais và Nhà hát Opéra Garnier",
      "Bảo tàng Louvre và Cầu Alexandre III"
    ],
    "correctIndex": 2,
    "explanation": "Mặt tiền vòm cửa lớn cùng các bức phù điêu tượng nữ thần nâng vòm của Nhà hát Thành phố mang đậm dấu ấn phong cách Beaux-Arts / Flamboyant của Petit Palais và Opéra Garnier tại Paris.",
    "sourceRef": "Sở Văn hóa và Thể thao TP.HCM – Hồ sơ Di tích Quốc gia (2012)"
  },
  {
    "id": 8,
    "code": "HCM-DT-002",
    "siteId": "nha-hat-thanh-pho",
    "siteName": "Nhà hát Thành phố",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Trong giai đoạn 1955–1975, công năng sử dụng của Nhà hát Thành phố đã từng bị chuyển đổi thành địa điểm nào?",
    "options": [
      "Trụ sở Tòa án Tối cao Sài Gòn",
      "Trụ sở Ngân hàng Quốc gia Việt Nam",
      "Khu triển lãm thương mại quốc tế Nam Kỳ",
      "Trụ sở Hạ viện (Quốc hội) của chính quyền Sài Gòn"
    ],
    "correctIndex": 3,
    "explanation": "Từ sau năm 1955 đến tháng 4/1975, Nhà hát bị cải tạo nội thất và gỡ bỏ nhiều chi tiết trang trí mặt tiền để làm trụ sở Quốc hội (sau là Hạ viện) của chính quyền Việt Nam Cộng hòa; đến sau năm 1975 mới khôi phục chức năng biểu diễn nghệ thuật.",
    "sourceRef": "Địa chí Văn hóa TP. Hồ Chí Minh – NXB Tổng hợp TP.HCM"
  },
  {
    "id": 9,
    "code": "HCM-DT-002",
    "siteId": "nha-hat-thanh-pho",
    "siteName": "Nhà hát Thành phố",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Giải pháp kỹ thuật nào giúp khán phòng Nhà hát Thành phố đạt hiệu quả cách âm tốt dù tọa lạc ngay trung tâm giao lộ sầm uất Đồng Khởi – Lê Lợi?",
    "options": [
      "Thiết kế nền khán phòng cao hơn mặt đường 2 mét kết hợp hệ thống hai lớp cửa gỗ dày cách âm",
      "Lắp đặt tường kính cường lực 3 lớp chân không từ năm 1900",
      "Xây dựng toàn bộ khán phòng nằm sâu dưới lòng đất 10 mét",
      "Bao quanh mặt ngoài bằng bức tường bê tông dày đặc không có cửa sổ"
    ],
    "correctIndex": 0,
    "explanation": "Các kiến trúc sư đã nâng cốt sàn nhà hát cao hơn mặt đường 2 mét và bố trí hai lớp cửa dày giữa sảnh đón với khán phòng hình bầu dục nhằm triệt tiêu tạp âm giao thông bên ngoài và tối ưu âm học bên trong.",
    "sourceRef": "Tư liệu Kiến trúc Di sản Đô thị TP.HCM"
  },
  {
    "id": 10,
    "code": "HCM-DT-002",
    "siteId": "nha-hat-thanh-pho",
    "siteName": "Nhà hát Thành phố",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Trong đợt đại trùng tu năm 1998 nhân dịp kỷ niệm 300 năm Sài Gòn – TP.HCM, nguyên tắc bảo tồn di sản nào đã được áp dụng thành công tại Nhà hát Thành phố?",
    "options": [
      "Phá dỡ toàn bộ mặt tiền cũ để mở rộng sức chứa lên 2.500 chỗ ngồi theo chuẩn hiện đại",
      "Phục hồi nguyên trạng các phù điêu Caryatids, đường nét mặt tiền 1900 dựa trên ảnh tư liệu gốc kết hợp nâng cấp kỹ thuật âm thanh – ánh sáng ẩn bên trong",
      "Giữ nguyên trạng thái biến dạng thời kỳ làm trụ sở Hạ viện để tránh tốn kém",
      "Thay thế toàn bộ kết cấu tường gạch bằng hệ khung thép tiền chế ốp đá granite"
    ],
    "correctIndex": 1,
    "explanation": "Đợt trùng tu năm 1998 là ví dụ điển hình về nguyên tắc 'phục nguyên ngoại thất theo tư liệu gốc – hiện đại hóa hạ tầng kỹ thuật nội thất', giúp hồi sinh các phù điêu mỹ thuật đã bị đục bỏ năm 1956 mà vẫn đáp ứng tiêu chuẩn biểu diễn đương đại.",
    "sourceRef": "Viện Nghiên cứu Phát triển TP.HCM – Báo cáo Bảo tồn Di sản Đô thị"
  },
  {
    "id": 11,
    "code": "HCM-DT-003",
    "siteId": "buu-dien-trung-tam",
    "siteName": "Bưu điện Trung tâm Sài Gòn",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Bưu điện Trung tâm Sài Gòn được xây dựng trong khoảng thời gian nào?",
    "options": [
      "Từ năm 1860 đến năm 1865",
      "Từ năm 1910 đến năm 1915",
      "Từ năm 1886 đến năm 1891",
      "Từ năm 1930 đến năm 1935"
    ],
    "correctIndex": 2,
    "explanation": "Bưu điện Trung tâm Sài Gòn được xây dựng từ năm 1886 và khánh thành năm 1891, nằm đối diện Nhà thờ Đức Bà tạo nên quần thể kiến trúc công cộng trung tâm Quận 1.",
    "sourceRef": "Bưu điện TP. Hồ Chí Minh – Tư liệu Lịch sử Ngành Bưu chính"
  },
  {
    "id": 12,
    "code": "HCM-DT-003",
    "siteId": "buu-dien-trung-tam",
    "siteName": "Bưu điện Trung tâm Sài Gòn",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Hai tấm bản đồ cổ quý giá được vẽ trực tiếp trên hai bên vách tường gần cửa chính bên trong sảnh Bưu điện Trung tâm Sài Gòn thể hiện nội dung gì?",
    "options": [
      "Sơ đồ đường sắt Bắc – Nam và hệ thống cảng biển miền Trung",
      "Bản đồ các tuyến hàng hải từ châu Âu qua kênh đào Suez đến Đông Dương",
      "Bản đồ hành chính toàn cõi Đại Nam thời vua Gia Long",
      "Bản đồ Sài Gòn – vùng phụ cận (1892) và mạng lưới đường dây điện tín Nam Việt Nam – Campuchia"
    ],
    "correctIndex": 3,
    "explanation": "Hai bản đồ lịch sử lớn đặt đối xứng ở sảnh chính mô tả 'Saigon et ses environs 1892' và mạng lưới 'Lignes télégraphiques du Sud Vietnam et du Cambodge', phản ánh vai trò đầu mối thông tin liên lạc của Sài Gòn cuối thế kỷ XIX.",
    "sourceRef": "Tư liệu trưng bày tại Bưu điện Trung tâm Sài Gòn"
  },
  {
    "id": 13,
    "code": "HCM-DT-003",
    "siteId": "buu-dien-trung-tam",
    "siteName": "Bưu điện Trung tâm Sài Gòn",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Trên mặt tiền Bưu điện Trung tâm Sài Gòn có các ô khung đắp nổi tên nhiều nhân vật như Volta, Ampère, Morse, Faraday, Ohm... Điểm chung của các nhân vật này là gì?",
    "options": [
      "Họ là các nhà khoa học kiệt xuất trong lĩnh vực điện học và phát minh điện tín",
      "Họ là các kiến trúc sư tham gia thiết kế quy hoạch thành phố Sài Gòn",
      "Họ là các toàn quyền và thống đốc Pháp từng cai trị Nam Kỳ",
      "Họ là các thương gia tài trợ kinh phí xây dựng công trình"
    ],
    "correctIndex": 0,
    "explanation": "Các danh nhân được khắc tên trên mặt tiền (Volta, Ampère, Morse, Faraday, Ohm, Franklin...) đều là những nhà khoa học đặt nền móng cho điện học và kỹ thuật điện tín – biểu trưng cho chức năng viễn thông hiện đại của tòa nhà.",
    "sourceRef": "Hồ sơ Kiểm kê Di tích Kiến trúc TP.HCM"
  },
  {
    "id": 14,
    "code": "HCM-DT-003",
    "siteId": "buu-dien-trung-tam",
    "siteName": "Bưu điện Trung tâm Sài Gòn",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Về tác giả thiết kế Bưu điện Trung tâm Sài Gòn, nhận định nào sau đây là chính xác theo các nghiên cứu lưu trữ hiện nay?",
    "options": [
      "Toàn bộ công trình từ mặt tiền đến nội thất do Gustave Eiffel thiết kế độc lập",
      "Công trình do kiến trúc sư trưởng Sở Công chính Nam Kỳ Alfred Foulhoux chủ trì thiết kế, sử dụng hệ kết cấu vòm khung sắt thép mang dấu ấn kỹ thuật Pháp thế kỷ XIX",
      "Công trình do kiến trúc sư Ngô Viết Thụ thiết kế theo đơn đặt hàng của chính phủ Pháp",
      "Công trình do nhóm nghệ nhân cung đình Huế thực hiện theo lối nhà rường cổ"
    ],
    "correctIndex": 1,
    "explanation": "Các tài liệu lưu trữ quốc gia xác nhận kiến trúc sư Alfred Foulhoux (cùng cộng sự Henri Vildieu) là tác giả thiết kế chính thức của Bưu điện Trung tâm Sài Gòn, thay vì quan niệm phổ biến trước đây gán toàn bộ công trình cho Gustave Eiffel.",
    "sourceRef": "Trung tâm Lưu trữ Quốc gia II – Tư liệu Kiến trúc Sài Gòn thuộc địa"
  },
  {
    "id": 15,
    "code": "HCM-DT-003",
    "siteId": "buu-dien-trung-tam",
    "siteName": "Bưu điện Trung tâm Sài Gòn",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Trong nghiên cứu bảo tồn di sản sống (Living Heritage), giá trị nổi bật bậc nhất của Bưu điện Trung tâm Sài Gòn so với nhiều công trình cùng thời là gì?",
    "options": [
      "Công trình đã đóng cửa hoàn toàn để bảo quản hiện vật trong môi trường chân không",
      "Công trình được tháo dỡ và di dời nguyên khối sang vị trí mới không hư hại",
      "Công trình duy trì liên tục chức năng bưu chính nguyên thủy hơn 130 năm, tạo sự gắn kết giữa di sản vật thể với đời sống thị dân đương đại",
      "Công trình là tòa nhà cao nhất TP. Hồ Chí Minh trong suốt thế kỷ XX"
    ],
    "correctIndex": 2,
    "explanation": "Khác với các di tích chỉ còn chức năng trưng bày tĩnh, Bưu điện Trung tâm Sài Gòn là một 'di sản sống' hiếm hoi khi giữ nguyên vẹn chức năng dịch vụ bưu chính ban đầu song hành cùng hoạt động du lịch di sản.",
    "sourceRef": "UNESCO Asia-Pacific Heritage Conservation Guidelines – Tham chiếu mô hình Living Heritage"
  },
  {
    "id": 16,
    "code": "HCM-DT-004",
    "siteId": "cho-ben-thanh",
    "siteName": "Chợ Bến Thành",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Tên gọi 'Bến Thành' có nguồn gốc lịch sử gắn liền với yếu tố địa lý nào của vùng đất Sài Gòn xưa?",
    "options": [
      "Chợ chuyên buôn bán các sản phẩm gốm sứ mang nhãn hiệu Thành Đô",
      "Chợ được đặt theo tên một vị thương gia tên là Thành xây dựng bến tàu",
      "Chợ nằm ở cuối đường Lê Thánh Tôn nên gọi tắt là Bến Thành",
      "Chợ nằm cạnh một bến sông gần Thành Gia Định (thành Quy / thành Phụng) dành cho thuyền bè và khách vãng lai ra vào thành"
    ],
    "correctIndex": 3,
    "explanation": "Chợ Bến Thành cũ ban đầu nằm ven sông Bến Nghé (khu vực đường Nguyễn Huệ ngày nay), sát bến thủy dẫn vào Thành Gia Định nên dân gian gọi khu chợ gần bến vào thành là 'Chợ Bến Thành'.",
    "sourceRef": "Sài Gòn năm xưa – Học giả Vương Hồng Sển"
  },
  {
    "id": 17,
    "code": "HCM-DT-004",
    "siteId": "cho-ben-thanh",
    "siteName": "Chợ Bến Thành",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Khu Chợ Bến Thành mới tại vị trí hiện nay (Quận 1) được khởi công xây dựng và khánh thành vào khoảng thời gian nào?",
    "options": [
      "Từ năm 1912 đến tháng 3 năm 1914",
      "Từ năm 1875 đến năm 1880",
      "Từ năm 1945 đến năm 1950",
      "Từ năm 1960 đến năm 1965"
    ],
    "correctIndex": 0,
    "explanation": "Do chợ cũ bên rạch Bến Nghé xuống cấp và chật hẹp, chính quyền thành phố đã san lấp ao đầm Boresse và giao hãng Brossard et Mopin xây dựng Chợ Bến Thành mới từ năm 1912 đến cuối tháng 3/1914.",
    "sourceRef": "Địa chí Văn hóa TP. Hồ Chí Minh"
  },
  {
    "id": 18,
    "code": "HCM-DT-004",
    "siteId": "cho-ben-thanh",
    "siteName": "Chợ Bến Thành",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Điểm nhấn kiến trúc mang tính biểu tượng ở Cửa Nam Chợ Bến Thành gồm những thành phần nào?",
    "options": [
      "Tháp chuông Gothic và hai tượng sư tử bằng đồng đen",
      "Tháp đồng hồ ba mặt nhô cao phía trên chữ 'Chợ Bến Thành' cùng các bức phù điêu gốm Biên Hòa ở 4 cửa chính",
      "Cổng Tam quan lợp ngói lưu ly kiểu cung đình Huế",
      "Mái vòm kính hình bán cầu cao 40 mét không có cửa phụ"
    ],
    "correctIndex": 1,
    "explanation": "Tháp đồng hồ Cửa Nam là hình ảnh nhận diện quen thuộc nhất của TP.HCM; ngoài ra năm 1952 khi trùng tu chợ, nghệ nhân trường Mỹ nghệ Biên Hòa (Lê Văn Mậu) đã gắn các bức phù điêu gốm thể hiện đặc sản Nam Bộ (bò, cá đuối, nải chuối, vịt...) trên 4 cổng chính.",
    "sourceRef": "Trung tâm Bảo tồn Di tích TP.HCM – Tư liệu Kiến trúc Chợ Bến Thành"
  },
  {
    "id": 19,
    "code": "HCM-DT-004",
    "siteId": "cho-ben-thanh",
    "siteName": "Chợ Bến Thành",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Giải pháp tổ chức không gian mái nhiều tầng có các ô cửa chớp chạy dài của Chợ Bến Thành nhằm giải quyết vấn đề thực tiễn gì?",
    "options": [
      "Tăng thêm không gian để làm kho chứa hàng hóa trên tầng áp mái",
      "Giúp tích trữ nước mưa phục vụ sinh hoạt cho toàn bộ tiểu thương",
      "Tạo hiệu ứng đối lưu nhiệt tự nhiên (thoát khí nóng lên trên, hút gió mát vào qua 4 cửa chính và 12 cửa phụ) đồng thời lấy sáng tự nhiên",
      "Giảm chi phí nhập khẩu ngói lợp từ châu Âu"
    ],
    "correctIndex": 2,
    "explanation": "Với diện tích hơn 13.000 m² tập trung hàng nghìn người mua bán mỗi ngày, hệ mái cao giật cấp có cửa chớp giúp giải phóng khí nóng tích tụ theo nguyên lý ống khói tự nhiên, đảm bảo thông thoáng không cần điều hòa cơ học.",
    "sourceRef": "Giáo trình Kiến trúc Khí hậu Nhiệt đới – Đại học Kiến trúc TP.HCM"
  },
  {
    "id": 20,
    "code": "HCM-DT-004",
    "siteId": "cho-ben-thanh",
    "siteName": "Chợ Bến Thành",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Trong lịch sử quy hoạch đô thị Sài Gòn – TP.HCM đầu thế kỷ XX đến đầu thế kỷ XXI, vị trí Chợ Bến Thành phản ánh xu hướng phát triển không gian nào?",
    "options": [
      "Thu hẹp diện tích chợ qua từng thời kỳ để nhường đất cho sản xuất nông nghiệp",
      "Tách biệt hoàn toàn khu thương mại truyền thống ra vùng ngoại ô cách xa trung tâm hành chính",
      "Chuyển đổi hoàn toàn chức năng thương mại sang khu căn cứ quân sự phòng thủ",
      "Dịch chuyển trung tâm thương mại từ trục giao thông thủy (ven sông) sang đầu mối giao thông bộ (bến xe, quảng trường tỏa tia) và nay kết nối đa phương thức với nhà ga trung tâm Metro số 1"
    ],
    "correctIndex": 3,
    "explanation": "Sự chuyển dịch từ chợ cũ ven sông sang chợ mới gắn với bến xe, ga xe lửa Sài Gòn cũ (khu Công viên 23/9) và hiện nay là ga ngầm trung tâm Bến Thành (tuyến Metro số 1) minh họa sinh động quy luật tiến hóa của đô thị hiện đại theo hạ tầng giao thông.",
    "sourceRef": "Nghiên cứu Quy hoạch Đô thị TP. Hồ Chí Minh – Viện Quy hoạch Xây dựng"
  },
  {
    "id": 21,
    "code": "HCM-DT-005",
    "siteId": "ben-nha-rong",
    "siteName": "Bến Nhà Rồng",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Vào ngày 05/06/1911, từ Bến Nhà Rồng, người thanh niên Nguyễn Tất Thành đã lên con tàu nào để ra đi tìm đường cứu nước?",
    "options": [
      "Tàu Amiral Latouche-Tréville",
      "Tàu Titanic",
      "Tàu Catinat",
      "Tàu Le Tonkin"
    ],
    "correctIndex": 0,
    "explanation": "Ngày 05/06/1911, người thanh niên yêu nước Nguyễn Tất Thành (với tên gọi Văn Ba) làm phụ bếp trên tàu buôn Pháp Amiral Latouche-Tréville rời Bến Nhà Rồng, bắt đầu hành trình 30 năm bôn ba tìm đường cứu nước.",
    "sourceRef": "Bảo tàng Hồ Chí Minh – Chi nhánh TP. Hồ Chí Minh"
  },
  {
    "id": 22,
    "code": "HCM-DT-005",
    "siteId": "ben-nha-rong",
    "siteName": "Bến Nhà Rồng",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Vì sao trụ sở hãng tàu Messageries Maritimes xây dựng năm 1862–1863 tại ngã ba sông Sài Gòn lại được nhân dân gọi là 'Nhà Rồng'?",
    "options": [
      "Vì tòa nhà sơn màu vàng rực như vảy rồng",
      "Vì trên nóc mái tòa nhà gắn đôi tượng rồng bằng đất nung tráng men xanh theo mô-típ truyền thống phương Đông",
      "Vì hãng tàu này chỉ chuyên chở gỗ quý có chạm hình rồng",
      "Vì bến cảng nằm ngay trên địa bàn huyện Long Thành"
    ],
    "correctIndex": 1,
    "explanation": "Dù được xây dựng bởi hãng vận tải biển Pháp, trên nóc mái tòa nhà lại gắn cặp rồng đất nung tráng men xanh theo kiểu 'Lưỡng long chầu nguyệt' (sau đổi thành chầu hoa cúc/mặt trời), nên người dân địa phương quen gọi là Nhà Rồng.",
    "sourceRef": "Bảo tàng Hồ Chí Minh – Chi nhánh TP. Hồ Chí Minh"
  },
  {
    "id": 23,
    "code": "HCM-DT-005",
    "siteId": "ben-nha-rong",
    "siteName": "Bến Nhà Rồng",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Công năng ban đầu của công trình Nhà Rồng khi mới hoàn thành vào năm 1863 là gì?",
    "options": [
      "Phủ Toàn quyền Đông Dương",
      "Trường đào tạo thủy thủ hàng hải viễn dương",
      "Trụ sở đại diện và nơi ở của Tổng quản lý hãng vận tải biển Pháp Messageries Maritimes tại thương cảng Sài Gòn",
      "Đồn hải quan kiểm soát thuế nhập khẩu của triều Nguyễn"
    ],
    "correctIndex": 2,
    "explanation": "Nhà Rồng là một trong những công trình kiến trúc phương Tây đầu tiên xây dựng tại Sài Gòn (1862–1863), đóng vai trò trụ sở điều hành và nơi lưu trú của lãnh đạo hãng tàu biển Messageries Maritimes ngay bên cảng Sài Gòn.",
    "sourceRef": "Địa chí Văn hóa TP. Hồ Chí Minh"
  },
  {
    "id": 24,
    "code": "HCM-DT-005",
    "siteId": "ben-nha-rong",
    "siteName": "Bến Nhà Rồng",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Hệ thống hành lang vòm cuốn chạy bao quanh cả tầng trệt và tầng lầu của Nhà Rồng thể hiện giải pháp thích nghi nào trong kiến trúc thuộc địa sớm?",
    "options": [
      "Kiến trúc kho lạnh kín gió phục vụ bảo quản nông sản xuất khẩu",
      "Kiến trúc pháo đài phòng thủ có lỗ châu mai bắn đại bác",
      "Kiến trúc nhà kính giữ nhiệt của vùng ôn đới châu Âu",
      "Kiến trúc Veranda (hành lang bao quanh) tạo vùng đệm bóng râm, che mưa tạt và đón gió từ sông Sài Gòn – kênh Tàu Hủ"
    ],
    "correctIndex": 3,
    "explanation": "Hành lang rộng có vòm cuốn chạy quanh khối nhà chính (kiểu Veranda) là giải pháp đặc trưng của kiến trúc nhiệt đới thế kỷ XIX, giúp tường trong không bị nắng chiều chiếu trực tiếp và tận dụng gió sông tự nhiên.",
    "sourceRef": "Kiến trúc Thuộc địa Pháp tại Sài Gòn – Tư liệu Nghiên cứu Kiến trúc"
  },
  {
    "id": 25,
    "code": "HCM-DT-005",
    "siteId": "ben-nha-rong",
    "siteName": "Bến Nhà Rồng",
    "region": "hcm",
    "topicId": "CD-01",
    "topicName": "Chuyên đề 1: Kiến trúc Hành chính, Công cộng & Đô thị Sài Gòn – Gia Định",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Ý nghĩa biểu tượng của sự kiện Nguyễn Tất Thành chọn khởi hành từ Bến Nhà Rồng (cảng Sài Gòn) năm 1911 thay vì đi sang phương Đông như các sĩ phu tiền bối phản ánh bước ngoặt tư duy nào?",
    "options": [
      "Hướng thẳng sang trung tâm các nước tư bản phương Tây để khảo sát bản chất chủ nghĩa thực dân và tìm con đường cứu nước mới vượt ra khỏi khuôn khổ phong kiến – tư sản cũ",
      "Tiếp tục hoàn toàn đường lối cầu viện Nhật Bản của phong trào Đông Du",
      "Chỉ nhằm mục đích học nghề đóng tàu thương mại tại thành phố Marseille",
      "Thực hiện hiệp ước trao đổi sinh viên giữa triều đình Huế và Chính phủ Pháp"
    ],
    "correctIndex": 0,
    "explanation": "Rời Bến Nhà Rồng sang phương Tây trên một con tàu thương mại Pháp thể hiện tầm nhìn độc lập, chủ động khảo sát thực tiễn ngay tại 'chính quốc' và các thuộc địa để từ đó đến với chủ nghĩa Mác – Lênin, mở ra con đường giải phóng dân tộc gắn với cách mạng vô sản.",
    "sourceRef": "Giáo trình Lịch sử Đảng Cộng sản Việt Nam – Bộ Giáo dục và Đào tạo"
  },
  {
    "id": 26,
    "code": "HCM-DT-006",
    "siteId": "bao-tang-lich-su-tphcm",
    "siteName": "Bảo tàng Lịch sử TP.HCM",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Khi mới khánh thành vào ngày 01/01/1929, Bảo tàng Lịch sử TP. Hồ Chí Minh mang tên gọi ban đầu là gì?",
    "options": [
      "Bảo tàng Louis Finot",
      "Bảo tàng Blanchard de la Brosse",
      "Bảo tàng Henri Parmentier",
      "Bảo tàng Paul Doumer"
    ],
    "correctIndex": 1,
    "explanation": "Công trình khởi công năm 1927 và khánh thành ngày 01/01/1929 với tên gọi Bảo tàng Blanchard de la Brosse (đặt theo tên Thống đốc Nam Kỳ đương nhiệm), là bảo tàng đầu tiên ở Nam Bộ.",
    "sourceRef": "Bảo tàng Lịch sử TP. Hồ Chí Minh – Lịch sử hình thành"
  },
  {
    "id": 27,
    "code": "HCM-DT-006",
    "siteId": "bao-tang-lich-su-tphcm",
    "siteName": "Bảo tàng Lịch sử TP.HCM",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Bảo tàng Lịch sử TP.HCM đặc biệt nổi tiếng với việc lưu giữ và trưng bày bộ sưu tập hiện vật phong phú của nền văn hóa cổ nào tại vùng đồng bằng sông Cửu Long?",
    "options": [
      "Văn hóa Hòa Bình",
      "Văn hóa Đông Sơn",
      "Văn hóa Óc Eo (Vương quốc Phù Nam)",
      "Văn hóa Bắc Sơn"
    ],
    "correctIndex": 2,
    "explanation": "Bên cạnh tiến trình lịch sử Việt Nam từ Tiền sử đến năm 1945, Bảo tàng Lịch sử TP.HCM sở hữu một trong những bộ sưu tập điêu khắc đá, tượng gỗ, trang sức vàng và hiện vật khảo cổ văn hóa Óc Eo – Phù Nam đồ sộ bậc nhất cả nước.",
    "sourceRef": "Hệ thống trưng bày thường trực – Bảo tàng Lịch sử TP.HCM"
  },
  {
    "id": 28,
    "code": "HCM-DT-006",
    "siteId": "bao-tang-lich-su-tphcm",
    "siteName": "Bảo tàng Lịch sử TP.HCM",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Kiến trúc của Bảo tàng Lịch sử TP.HCM do kiến trúc sư Auguste Delaval thiết kế thuộc phong cách tiêu biểu nào của thập niên 1920?",
    "options": [
      "Phong cách Brutalism (Bê tông thô mộc)",
      "Phong cách Gothic Phục hưng",
      "Phong cách Hậu hiện đại (Postmodernism)",
      "Phong cách Kiến trúc Đông Dương (Style Indochinois)"
    ],
    "correctIndex": 3,
    "explanation": "Tòa nhà Bảo tàng Lịch sử TP.HCM là công trình đại diện tiêu biểu cho phong cách Kiến trúc Đông Dương (Style Indochinois), kết hợp kết cấu bê tông hiện đại phương Tây với mái ngói lưu ly chồng diêm, đầu đao cong và khối tháp bát giác truyền thống phương Đông.",
    "sourceRef": "Tư liệu Kiến trúc Đông Dương tại Việt Nam"
  },
  {
    "id": 29,
    "code": "HCM-DT-006",
    "siteId": "bao-tang-lich-su-tphcm",
    "siteName": "Bảo tàng Lịch sử TP.HCM",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Khối nhà bát giác đặt ở vị trí trung tâm tòa nhà Bảo tàng Lịch sử TP.HCM có vai trò kiến trúc và công năng gì?",
    "options": [
      "Tạo điểm nhấn thị giác lấy cảm hứng từ lầu bát giác Á Đông, đồng thời đưa ánh sáng tự nhiên và thông gió vào sảnh trưng bày trung tâm",
      "Làm tháp quan sát phòng không cho khu vực trung tâm Sài Gòn",
      "Làm nơi đặt hệ thống máy phát điện dự phòng của Thảo Cầm Viên",
      "Chỉ có tác dụng trang trí bên ngoài, bên trong bị bịt kín trần"
    ],
    "correctIndex": 0,
    "explanation": "Khối bát giác trung tâm với hệ mái chồng diêm hai tầng cửa sổ trời vừa tạo nhịp điệu trang nghiêm kiểu kiến trúc truyền thống Việt – Hoa, vừa đóng vai trò 'giếng sáng' điều hòa ánh sáng tự nhiên cho sảnh chính.",
    "sourceRef": "Hồ sơ Di tích Kiến trúc Nghệ thuật Bảo tàng Lịch sử TP.HCM"
  },
  {
    "id": 30,
    "code": "HCM-DT-006",
    "siteId": "bao-tang-lich-su-tphcm",
    "siteName": "Bảo tàng Lịch sử TP.HCM",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Trong lịch sử bảo tàng học Việt Nam, việc mở rộng cánh nhà trưng bày của Bảo tàng Lịch sử TP.HCM vào năm 1970 do kiến trúc sư Nguyễn Bá Lăng thiết kế thể hiện nguyên tắc ứng xử di sản nào?",
    "options": [
      "Xây dựng khối phụ bằng kính phản quang hiện đại đối lập hoàn toàn với khối cổ 1929",
      "Kế thừa hài hòa ngôn ngữ mái ngói, tỷ lệ mặt đứng và chi tiết trang trí Á Đông của khối kiến trúc gốc năm 1929 để đảm bảo tính toàn vẹn quần thể",
      "Tháo dỡ khối bát giác năm 1929 để mở rộng không gian sân đậu xe",
      "Chuyển toàn bộ hiện vật cổ sang không gian trưng bày ngoài trời"
    ],
    "correctIndex": 1,
    "explanation": "Phần mở rộng hình chữ U phía sau do kiến trúc sư Nguyễn Bá Lăng thiết kế năm 1970 đã tôn trọng tuyệt đối tỷ lệ, cao độ mái và họa tiết của công trình 1929, tạo thành tổng thể thống nhất mà không làm phá vỡ cấu trúc lịch sử.",
    "sourceRef": "Bảo tàng Lịch sử TP.HCM – Kỷ yếu 90 năm hình thành và phát triển"
  },
  {
    "id": 31,
    "code": "HCM-DT-007",
    "siteId": "bao-tang-my-thuat-tphcm",
    "siteName": "Bảo tàng Mỹ thuật TP.HCM",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Tòa nhà chính của Bảo tàng Mỹ thuật TP. Hồ Chí Minh (số 97A Phó Đức Chính, Quận 1) trước năm 1975 vốn là dinh thự của gia tộc thương gia nổi tiếng nào?",
    "options": [
      "Gia tộc ông Lê Văn Mưu",
      "Gia tộc ông Trần Công Vàng",
      "Gia tộc ông Hứa Bổn Hòa (Chú Hỏa)",
      "Gia tộc ông Trương Vĩnh Ký"
    ],
    "correctIndex": 2,
    "explanation": "Tòa nhà xây dựng từ năm 1929 đến năm 1934 từng là tư dinh và trụ sở giao dịch của gia tộc thương gia người Hoa nổi tiếng bậc nhất Sài Gòn xưa – ông Hứa Bổn Hòa (thường gọi là Chú Hỏa).",
    "sourceRef": "Bảo tàng Mỹ thuật TP. Hồ Chí Minh – Giới thiệu Di tích"
  },
  {
    "id": 32,
    "code": "HCM-DT-007",
    "siteId": "bao-tang-my-thuat-tphcm",
    "siteName": "Bảo tàng Mỹ thuật TP.HCM",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Bảo vật quốc gia nổi tiếng nào của danh họa Nguyễn Gia Trí hiện đang được lưu giữ và trưng bày trang trọng tại Bảo tàng Mỹ thuật TP.HCM?",
    "options": [
      "Thiếu nữ bên hoa huệ",
      "Kết nạp Đảng ở Điện Biên Phủ",
      "Em Thúy",
      "Bức tranh sơn mài 'Vườn xuân Trung Nam Bắc'"
    ],
    "correctIndex": 3,
    "explanation": "Tác phẩm sơn mài cỡ lớn 'Vườn xuân Trung Nam Bắc' (hoàn thành giai đoạn 1969–1989) của danh họa Nguyễn Gia Trí là Bảo vật Quốc gia (công nhận năm 2013), hiện là điểm nhấn tiêu biểu nhất tại Bảo tàng Mỹ thuật TP.HCM.",
    "sourceRef": "Danh mục Bảo vật Quốc gia – Cục Di sản Văn hóa Việt Nam"
  },
  {
    "id": 33,
    "code": "HCM-DT-007",
    "siteId": "bao-tang-my-thuat-tphcm",
    "siteName": "Bảo tàng Mỹ thuật TP.HCM",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Kiến trúc tòa nhà chính Bảo tàng Mỹ thuật TP.HCM do kiến trúc sư người Pháp Rivera thiết kế nổi bật với sự kết hợp của hai yếu tố phong cách nào?",
    "options": [
      "Kiến trúc Pháp Tân cổ điển / Art Deco đầu thế kỷ XX kết hợp bố cục sân thiên tỉnh, mái ngói âm dương và trang trí Hoa – Á Đông",
      "Kiến trúc Baroque Tây Ban Nha và nhà sàn Tây Nguyên",
      "Kiến trúc nhà rường cung đình Huế và kết cấu khung sắt kiểu Eiffel",
      "Kiến trúc Hồi giáo Trung Đông và gốm sứ Chăm Pa"
    ],
    "correctIndex": 0,
    "explanation": "Công trình có kết cấu hình khối, cửa vòm, ô kính màu và gạch bông đậm chất Pháp Art Deco nhưng lại tổ chức mặt bằng vây quanh sân thiên tỉnh (giếng trời) và lợp mái ngói âm dương tráng men mang đậm yếu tố phong thủy và mỹ thuật Á Đông.",
    "sourceRef": "Hồ sơ Di tích Kiến trúc Nghệ thuật cấp Thành phố – Bảo tàng Mỹ thuật TP.HCM"
  },
  {
    "id": 34,
    "code": "HCM-DT-007",
    "siteId": "bao-tang-my-thuat-tphcm",
    "siteName": "Bảo tàng Mỹ thuật TP.HCM",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Chi tiết kỹ thuật hiện đại hiếm thấy nào đầu thế kỷ XX được lắp đặt bên trong dinh thự Chú Hỏa và đến nay vẫn được bảo tồn nguyên vẹn?",
    "options": [
      "Hệ thống điều hòa trung tâm chạy bằng năng lượng mặt trời",
      "Hệ thống thang máy lồng gỗ chạm khắc tinh xảo với cửa lưới sắt xếp",
      "Bể bơi bốn mùa trên tầng áp mái bằng kính chịu lực",
      "Đường hầm tàu điện ngầm riêng nối thẳng ra cảng Sài Gòn"
    ],
    "correctIndex": 1,
    "explanation": "Đây là một trong những công trình tư nhân sớm nhất tại Sài Gòn đầu thập niên 1930 sở hữu thang máy cơ khí có buồng cabin bằng gỗ chạm khắc tinh tế, phản ánh mức độ tiện nghi và kỹ thuật xây dựng tiên tiến đương thời.",
    "sourceRef": "Tư liệu Kiến trúc Bảo tàng Mỹ thuật TP.HCM"
  },
  {
    "id": 35,
    "code": "HCM-DT-007",
    "siteId": "bao-tang-my-thuat-tphcm",
    "siteName": "Bảo tàng Mỹ thuật TP.HCM",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Việc chuyển đổi dinh thự gia tộc Hứa Bổn Hòa thành Bảo tàng Mỹ thuật TP.HCM (thành lập 1987, mở cửa 1991) là ví dụ điển hình của giải pháp bảo tồn nào trong đô thị học đương đại?",
    "options": [
      "Bảo tồn nguyên trạng đóng băng không cho công chúng tiếp cận",
      "Tái thiết hoàn toàn bằng vật liệu hiện đại trên nền đất cũ",
      "Tái sử dụng thích ứng (Adaptive Reuse) – tận dụng giá trị không gian thẩm mỹ của di sản tư nhân lịch sử cho thiết chế văn hóa công lập",
      "Di dời di sản sang khu bảo tàng ngoài trời ngoại thành"
    ],
    "correctIndex": 2,
    "explanation": "Chuyển đổi một biệt thự di sản có tính thẩm mỹ cao thành bảo tàng mỹ thuật là mô hình Adaptive Reuse rất thành công, vừa bảo vệ nguyên vẹn cấu trúc kiến trúc 1934, vừa mở cửa cho cộng đồng thụ hưởng giá trị nghệ thuật.",
    "sourceRef": "Nghiên cứu Bảo tồn & Tái sử dụng Thích ứng Di sản Đô thị Việt Nam"
  },
  {
    "id": 36,
    "code": "HCM-DT-012",
    "siteId": "giong-ca-vo",
    "siteName": "Khu khảo cổ học Giồng Cá Vồ",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Khu khảo cổ học Giồng Cá Vồ nằm tại địa phương nào của TP. Hồ Chí Minh?",
    "options": [
      "Xã Tân Kiên, huyện Bình Chánh",
      "Xã Nhuận Đức, huyện Củ Chi",
      "Phường Long Bình, TP. Thủ Đức",
      "Xã Long Hòa, huyện Cần Giờ"
    ],
    "correctIndex": 3,
    "explanation": "Di tích khảo cổ học cấp Quốc gia Giồng Cá Vồ tọa lạc trên một giồng cát cổ thuộc xã Long Hòa, huyện Cần Giờ – vùng ven biển ngập mặn phía Đông Nam TP. Hồ Chí Minh.",
    "sourceRef": "Trung tâm Bảo tồn Di tích Lịch sử – Văn hóa TP.HCM"
  },
  {
    "id": 37,
    "code": "HCM-DT-012",
    "siteId": "giong-ca-vo",
    "siteName": "Khu khảo cổ học Giồng Cá Vồ",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Loại hình di tích mai táng đặc trưng nhất được phát hiện với số lượng hàng trăm ngôi tại Khu khảo cổ học Giồng Cá Vồ là gì?",
    "options": [
      "Mộ chum bằng gốm chôn kèm nhiều đồ tùy táng và trang sức",
      "Mộ thuyền khoét từ thân cây cổ thụ",
      "Mộ xây bằng gạch vồ có mái vòm cuốn",
      "Mộ cự thạch xếp từ các phiến đá hoa cương lớn"
    ],
    "correctIndex": 0,
    "explanation": "Các đợt khai quật khảo cổ học tại Giồng Cá Vồ đã phát hiện hàng trăm mộ chum bằng gốm (hơn 300 mộ chum qua các đợt khai quật lịch sử và 186 mộ chum cùng 12 mộ đất trong khu vực khai quật trưng bày) có niên đại khoảng 2.000 – 2.500 năm.",
    "sourceRef": "Viện Khảo cổ học & Bảo tàng Lịch sử TP.HCM – Báo cáo Khai quật Giồng Cá Vồ"
  },
  {
    "id": 38,
    "code": "HCM-DT-012",
    "siteId": "giong-ca-vo",
    "siteName": "Khu khảo cổ học Giồng Cá Vồ",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Niên đại của Di tích khảo cổ học Giồng Cá Vồ thuộc giai đoạn lịch sử nào ở Nam Bộ?",
    "options": [
      "Thời đại Đá cũ, cách ngày nay khoảng 20.000 năm",
      "Thời đại Sơ kỳ Đồ Sắt (Tiền Sơ sử), cách ngày nay khoảng 2.000 – 2.500 năm",
      "Thời kỳ khai khẩn Đàng Trong thế kỷ XVII",
      "Thời đại Đồ Đồng sớm cách ngày nay khoảng 5.000 năm"
    ],
    "correctIndex": 1,
    "explanation": "Di chỉ Giồng Cá Vồ có niên đại khoảng 2.000 – 2.500 năm cách ngày nay (khoảng thế kỷ V – II TCN), thuộc giai đoạn Sơ kỳ Đồ Sắt – bước chuyển tiếp cực kỳ quan trọng sang thời kỳ Sơ sử và văn hóa Óc Eo ở Nam Bộ.",
    "sourceRef": "Khảo cổ học Nam Bộ – Viện Khoa học Xã hội vùng Nam Bộ"
  },
  {
    "id": 39,
    "code": "HCM-DT-012",
    "siteId": "giong-ca-vo",
    "siteName": "Khu khảo cổ học Giồng Cá Vồ",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Hiện vật trang sức độc đáo nào tìm thấy tại Giồng Cá Vồ chứng minh mối giao lưu văn hóa – thương mại đường biển sớm với văn hóa Sa Huỳnh (miền Trung) và Đông Nam Á?",
    "options": [
      "Trống đồng Đông Sơn cỡ lớn có hình chiến thuyền",
      "Tiền đồng đúc niên hiệu thời nhà Lý – Trần",
      "Khuyên tai hai đầu thú (song thú), khuyên tai ba mấu bằng đá ngọc nephrite và hạt chuỗi thủy tinh, mã não",
      "Gương đồng Hán khắc chữ triện"
    ],
    "correctIndex": 2,
    "explanation": "Việc phát hiện nhiều khuyên tai hai đầu thú và ba mấu (lingling-o) bằng đá quý, mã não, thủy tinh tại Giồng Cá Vồ khẳng định cư dân cổ Cần Giờ đã tham gia sớm vào mạng lưới giao thương hàng hải rộng lớn thời Sơ kỳ Đồ Sắt.",
    "sourceRef": "Nguyễn Thị Hậu – Khảo cổ học vùng đất Sài Gòn – TP.HCM"
  },
  {
    "id": 40,
    "code": "HCM-DT-012",
    "siteId": "giong-ca-vo",
    "siteName": "Khu khảo cổ học Giồng Cá Vồ",
    "region": "hcm",
    "topicId": "CD-02",
    "topicName": "Chuyên đề 2: Bảo tàng, Mỹ thuật & Khảo cổ học Tiền Sơ sử Nam Bộ",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Trong công tác quy hoạch xây dựng Bảo tàng tại chỗ (Site Museum) tại Giồng Cá Vồ hiện nay, thách thức kỹ thuật địa – khảo cổ nào được các nhà khoa học đặc biệt cảnh báo?",
    "options": [
      "Nguy cơ sạt lở đá núi lửa từ độ cao trên 500 mét",
      "Thiếu hoàn toàn hiện vật gốc để tổ chức không gian trưng bày",
      "Nhiệt độ đóng băng vào mùa đông làm nứt vỡ đồ gốm cổ",
      "Độ rung chấn nền đất khi đóng cọc bê tông móng công trình mới kết hợp tác động của môi trường đất cát ven biển nhiễm mặn có thể làm rạn vỡ hố mộ chum đã phát lộ"
    ],
    "correctIndex": 3,
    "explanation": "Nền đất giồng cát cổ ven biển Cần Giờ rất nhạy cảm với rung động cơ học và độ ẩm mặn; do đó khi xây dựng nhà che bảo tàng tại chỗ, giới khảo cổ yêu cầu giải pháp móng ít rung chấn và quy trình bảo quản khẩn cấp tầng văn hóa gốc.",
    "sourceRef": "Tư liệu Trung tâm Bảo tồn Di tích TP.HCM & Phóng sự HTV (2024)"
  },
  {
    "id": 41,
    "code": "HCM-DT-008",
    "siteId": "chua-giac-lam",
    "siteName": "Chùa Giác Lâm",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Chùa Giác Lâm (Tổ đình Giác Lâm, quận Tân Bình) được khởi dựng vào năm nào và được đánh giá vị thế ra sao trong hệ thống chùa cổ TP.HCM?",
    "options": [
      "Khởi dựng năm 1744, là một trong những ngôi cổ tự lâu đời nhất còn bảo lưu nguyên vẹn kiến trúc cổ tại TP.HCM",
      "Khởi dựng năm 1920, là ngôi chùa bê tông cốt thép đầu tiên của Sài Gòn",
      "Khởi dựng năm 1898 cùng thời với Nhà hát Thành phố",
      "Khởi dựng năm 1953 nhân dịp đón xá lợi Phật từ Sri Lanka"
    ],
    "correctIndex": 0,
    "explanation": "Chùa Giác Lâm được cư sĩ Lý Thụy Long dựng vào mùa xuân năm Giáp Tý (1744) thời chúa Nguyễn Phúc Khoát trên gò Cẩm Sơn, là tổ đình tiêu biểu và cổ kính bậc nhất TP. Hồ Chí Minh.",
    "sourceRef": "Hồ sơ Di tích Kiến trúc Nghệ thuật Quốc gia Chùa Giác Lâm (1988)"
  },
  {
    "id": 42,
    "code": "HCM-DT-008",
    "siteId": "chua-giac-lam",
    "siteName": "Chùa Giác Lâm",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Bố cục mặt bằng kiến trúc truyền thống của Chùa Giác Lâm được tổ chức theo hình dạng chữ Hán nào?",
    "options": [
      "Chữ Nhất (一) chỉ gồm một dãy nhà duy nhất",
      "Chữ Tam (三) gồm ba dãy nhà ngang nối liền: Chính điện, Giảng đường và Nhà Trai (Nhà Tổ)",
      "Chữ Công (工) có hành lang kính bao quanh",
      "Chữ Mễ (米) tỏa ra tám hướng"
    ],
    "correctIndex": 1,
    "explanation": "Chùa Giác Lâm là mẫu hình chuẩn mực của kiến trúc chùa cổ Nam Bộ kiểu chữ Tam gồm 3 gian nhà lớn nối tiếp nhau có sân thoáng và mái ngói liên hoàn.",
    "sourceRef": "Kiến trúc Chùa cổ Nam Bộ – NXB Tổng hợp TP.HCM"
  },
  {
    "id": 43,
    "code": "HCM-DT-008",
    "siteId": "chua-giac-lam",
    "siteName": "Chùa Giác Lâm",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Nét trang trí đặc sắc, hiếm có trên các bức tường, mái tháp và mặt tiền của Chùa Giác Lâm sử dụng loại vật liệu thủ công nào?",
    "options": [
      "Các mảng phù điêu đúc bằng gang thép công nghiệp",
      "Các tấm kính màu nhập khẩu từ nhà thờ châu Âu",
      "Hàng nghìn chiếc đĩa gốm sứ cổ (gốm Nam Bộ, gốm Lái Thiêu và gốm Trung Hoa) gắn chìm trên tường và mái",
      "Các tấm đá cẩm thạch trắng khắc chữ Latinh"
    ],
    "correctIndex": 2,
    "explanation": "Từ đầu thế kỷ XX (đợt trùng tu năm 1900), Chùa Giác Lâm đã gắn hơn 7.000 chiếc đĩa gốm sứ cổ trên tường và mái, vừa tạo giá trị mỹ thuật dân gian độc đáo, vừa có tác dụng bảo vệ bề mặt vữa vôi trước mưa nắng nhiệt đới.",
    "sourceRef": "Trung tâm Bảo tồn Di tích TP.HCM – Tư liệu Chùa Giác Lâm"
  },
  {
    "id": 44,
    "code": "HCM-DT-008",
    "siteId": "chua-giac-lam",
    "siteName": "Chùa Giác Lâm",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Hệ thống kết cấu gỗ bên trong Chùa Giác Lâm tiêu biểu cho kỹ thuật kiến trúc truyền thống Nam Bộ ở đặc điểm nào?",
    "options": [
      "Kết cấu khung vòm thép vượt nhịp không có cột giữa",
      "Tường gạch chịu lực dày 1 mét không sử dụng kèo gỗ",
      "Kết cấu nhà sàn tre nứa lợp lá dừa nước",
      "Hệ khung nhà rường tứ trụ bằng gỗ quý với gần 100 cột gỗ chạm khắc câu đối thếp vàng cùng hơn 100 pho tượng gỗ cổ"
    ],
    "correctIndex": 3,
    "explanation": "Không gian nội tự Chùa Giác Lâm sở hữu 98 cột gỗ quý (căm xe, sao, gõ) tạo khung nhà rường vững chãi cùng kho tàng hơn 110 pho tượng cổ (bộ Thập Bát La Hán, Thập Điện Diêm Vương, A Di Đà...) mang giá trị điêu khắc thế kỷ XVIII–XIX.",
    "sourceRef": "Di sản Mỹ thuật Phật giáo Nam Bộ – Viện Nghiên cứu Phật học"
  },
  {
    "id": 45,
    "code": "HCM-DT-008",
    "siteId": "chua-giac-lam",
    "siteName": "Chùa Giác Lâm",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Nghiên cứu hệ thống tượng thờ và long vị tổ sư tại Chùa Giác Lâm cho phép các nhà sử học làm sáng tỏ tiến trình văn hóa nào ở Nam Bộ thế kỷ XVIII–XIX?",
    "options": [
      "Sự du nhập của Phật giáo dòng Lâm Tế Chúc Thánh – Gia Phổ từ miền Trung vào vùng đất mới Gia Định và quá trình bản địa hóa tín ngưỡng dân gian Nam Bộ",
      "Sự thống trị tuyệt đối của kiến trúc Ấn Độ giáo trong cộng đồng cư dân Sài Gòn",
      "Quá trình Tây phương hóa hoàn toàn nghệ thuật tạc tượng gỗ truyền thống ngay từ năm 1744",
      "Sự tách biệt hoàn toàn giữa Phật giáo Đàng Trong với văn hóa nông nghiệp lúa nước"
    ],
    "correctIndex": 0,
    "explanation": "Hệ thống bia ký, long vị các đời Tổ sư (như Thiền sư Viên Quang) và lối bài trí kết hợp thờ Phật với thờ Tổ, thờ tiền hiền khai khẩn tại Giác Lâm là tư liệu gốc vô giá phản ánh hành trình Nam tiến của Phật giáo dòng Lâm Tế và sự dung hợp văn hóa tại Gia Định xưa.",
    "sourceRef": "Nguyễn Hiền Đức – Lịch sử Phật giáo Đàng Trong"
  },
  {
    "id": 46,
    "code": "HCM-DT-010",
    "siteId": "lang-ong-ba-chieu",
    "siteName": "Lăng Ông Bà Chiểu",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Lăng Ông Bà Chiểu (quận Bình Thạnh, TP.HCM) là khu lăng mộ và đền thờ nhân vật lịch sử nào?",
    "options": [
      "Lễ Thành hầu Nguyễn Hữu Cảnh",
      "Tả quân Lê Văn Duyệt",
      "Danh tướng Nguyễn Tri Phương",
      "Bình Tây Đại Nguyên soái Trương Định"
    ],
    "correctIndex": 1,
    "explanation": "Lăng Ông Bà Chiểu là nơi an nghỉ và thờ phụng Tả quân Lê Văn Duyệt (1764–1832), vị công thần hai lần giữ chức Tổng trấn Gia Định Thành, được nhân dân Nam Bộ tôn kính gọi là 'Ông Lớn Thượng' hay 'Đức Ông'.",
    "sourceRef": "Hồ sơ Di tích Lịch sử – Văn hóa Quốc gia Lăng Lê Văn Duyệt (1988)"
  },
  {
    "id": 47,
    "code": "HCM-DT-010",
    "siteId": "lang-ong-ba-chieu",
    "siteName": "Lăng Ông Bà Chiểu",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Lễ hội truyền thống lớn đầu năm tại Lăng Ông Bà Chiểu (tổ chức vào mùng 7 tháng Giêng âm lịch) đã được ghi danh Di sản văn hóa phi vật thể quốc gia năm 2022 có tên là gì?",
    "options": [
      "Lễ hội Nghinh Ông Cần Giờ",
      "Lễ hội Nguyên Tiêu Chợ Lớn",
      "Lễ hội Khai hạ – Cầu an",
      "Lễ hội Vía Bà Chúa Xứ"
    ],
    "correctIndex": 2,
    "explanation": "Lễ hội Khai hạ – Cầu an tại Lăng Đức Tả quân Lê Văn Duyệt diễn ra vào mùng 7 tháng Giêng (nghi thức hạ nêu, khai ấn, cầu quốc thái dân an, hát Bội) đã được Bộ Văn hóa, Thể thao và Du lịch ghi danh Di sản văn hóa phi vật thể quốc gia năm 2022.",
    "sourceRef": "Bộ Văn hóa, Thể thao và Du lịch – Quyết định ghi danh năm 2022"
  },
  {
    "id": 48,
    "code": "HCM-DT-010",
    "siteId": "lang-ong-ba-chieu",
    "siteName": "Lăng Ông Bà Chiểu",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Khu mộ song táng của Tả quân Lê Văn Duyệt và phu nhân Đỗ Thị Phẫn trong khuôn viên Lăng Ông được xây đắp theo hình dáng truyền thống nào?",
    "options": [
      "Hình tháp chuông 7 tầng",
      "Hình mái vòm cầu vồng lợp ngói lưu ly",
      "Hình kim tự tháp bốn mặt bằng đá hoa cương",
      "Hình nấm mộ bán cầu úp hay hình mu rùa (quy bối) bằng hợp chất vữa ô dước bền chắc"
    ],
    "correctIndex": 3,
    "explanation": "Hai ngôi mộ đặt song song nằm gọn trên nền phẳng hình chữ nhật, xây đắp bằng vữa hợp chất (ô dước) có hình dáng giống mu rùa (quy bối) – kiểu mộ quan chức cao cấp đặc trưng thời Nguyễn, tượng trưng cho sự trường tồn.",
    "sourceRef": "Ban Quản lý Di tích Lịch sử – Văn hóa Lăng Lê Văn Duyệt"
  },
  {
    "id": 49,
    "code": "HCM-DT-010",
    "siteId": "lang-ong-ba-chieu",
    "siteName": "Lăng Ông Bà Chiểu",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Kỹ thuật mỹ thuật truyền thống nào tạo nên vẻ rực rỡ, sắc nét cho các hình tượng rồng, phượng, mai – lan – cúc – trúc trên bờ nóc và cổng Tam quan Lăng Ông Bà Chiểu?",
    "options": [
      "Kỹ thuật khảm sành sứ (ghép các mảnh gốm sứ nhiều màu cắt tỉa công phu lên cốt vữa)",
      "Kỹ thuật vẽ sơn dầu trên tường vữa ướt (Fresco)",
      "Kỹ thuật đúc tượng đồng nguyên khối mạ kẽm",
      "Kỹ thuật ghép đá cẩm thạch màu của Ý"
    ],
    "correctIndex": 0,
    "explanation": "Nghệ thuật khảm mảnh sành sứ (thường thấy trong kiến trúc cung đình Huế và các đình miếu lớn Nam Bộ) giúp các đề tài tứ linh, bát tiên trên mái Lăng Ông giữ được độ bền màu hàng trăm năm dưới nắng mưa.",
    "sourceRef": "Mỹ thuật Trang trí Kiến trúc Triều Nguyễn tại Nam Bộ"
  },
  {
    "id": 50,
    "code": "HCM-DT-010",
    "siteId": "lang-ong-ba-chieu",
    "siteName": "Lăng Ông Bà Chiểu",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Khi giảng dạy về lịch sử Nam Bộ nửa đầu thế kỷ XIX, việc đánh giá công lao của Tả quân Lê Văn Duyệt gắn với Lăng Ông Bà Chiểu cần nhấn mạnh thành tựu kinh tế – xã hội nổi bật nào?",
    "options": [
      "Ông thực hiện chính sách 'bế quan tỏa cảng' tuyệt đối, cấm mọi thương thuyền nước ngoài vào Gia Định",
      "Ông chú trọng ổn định trật tự, mở rộng giao thương, khoan dung với các cộng đồng cư dân và chỉ đạo đào các công trình thủy lợi – giao thông lớn như kênh Vĩnh Tế, thúc đẩy vùng đất Nam Bộ phồn thịnh",
      "Ông là người trực tiếp chỉ huy khởi công xây dựng hệ thống đường sắt xuyên Việt",
      "Ông bãi bỏ hoàn toàn chữ Hán và cho ban hành chữ Quốc ngữ làm văn tự hành chính từ năm 1820"
    ],
    "correctIndex": 1,
    "explanation": "Trong hai nhiệm kỳ Tổng trấn Gia Định Thành (1812–1815 và 1820–1832), Lê Văn Duyệt thi hành đường lối cai trị thực tế, khuyến khích khai hoang, phát triển thương cảng, chăm lo thủy lợi (như kênh Vĩnh Tế), qua đó tạo nền tảng phồn vinh và nhận được sự kính ngưỡng sâu sắc của người dân Nam Bộ dù từng vướng bi kịch lịch sử với vua Minh Mạng.",
    "sourceRef": "Đại Nam thực lục & Phan Khoang – Việt sử xứ Đàng Trong"
  },
  {
    "id": 51,
    "code": "HCM-DT-011",
    "siteId": "hoi-quan-nghia-an",
    "siteName": "Hội quán Nghĩa An",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Hội quán Nghĩa An (đường Nguyễn Trãi, Quận 5, TP.HCM) còn có tên gọi dân gian quen thuộc là gì và thờ vị nhân vật nào ở chính điện?",
    "options": [
      "Chùa Bà – thờ Thiên Hậu Thánh Mẫu",
      "Chùa Ngọc Hoàng – thờ Ngọc Hoàng Thượng Đế",
      "Chùa Ông – thờ Quan Thánh Đế Quân (Quan Vũ)",
      "Đình Minh Hương – thờ Tiền hiền khai khẩn"
    ],
    "correctIndex": 2,
    "explanation": "Hội quán Nghĩa An thường được gọi là Chùa Ông (Chùa Ông Quận 5), do cộng đồng người Hoa gốc Triều Châu xây dựng để thờ Quan Thánh Đế Quân – biểu tượng của lòng Trung, Nghĩa, Tín trong cộng đồng thương nhân.",
    "sourceRef": "Hồ sơ Di tích Kiến trúc Nghệ thuật Quốc gia Hội quán Nghĩa An (1993)"
  },
  {
    "id": 52,
    "code": "HCM-DT-011",
    "siteId": "hoi-quan-nghia-an",
    "siteName": "Hội quán Nghĩa An",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Hội quán Nghĩa An do cộng đồng người Hoa thuộc nhóm phương ngữ nào xây dựng và sinh hoạt cộng đồng từ cuối thế kỷ XVIII – đầu thế kỷ XIX?",
    "options": [
      "Cộng đồng người Hoa gốc Quảng Đông",
      "Cộng đồng người Hoa gốc Hải Nam",
      "Cộng đồng người Hoa gốc Phúc Kiến",
      "Cộng đồng người Hoa gốc Triều Châu (và nhóm Hẹ)"
    ],
    "correctIndex": 3,
    "explanation": "Hội quán Nghĩa An là thiết chế văn hóa – tín ngưỡng trung tâm của cộng đồng người Hoa gốc Triều Châu (và Hẹ) tại vùng đất Chợ Lớn, nơi hội họp, tương trợ đồng hương và giữ gìn phong tục truyền thống.",
    "sourceRef": "Ban Quản trị Hội quán Nghĩa An – Tư liệu Di tích"
  },
  {
    "id": 53,
    "code": "HCM-DT-011",
    "siteId": "hoi-quan-nghia-an",
    "siteName": "Hội quán Nghĩa An",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Quần thể tượng gốm men nhiều màu trang trí sinh động trên các bờ nóc mái ngói ống men xanh lục của Hội quán Nghĩa An tiêu biểu cho dòng gốm nổi tiếng nào ở Sài Gòn xưa?",
    "options": [
      "Gốm Cây Mai (vùng Chợ Lớn – Sài Gòn cuối thế kỷ XIX, đầu thế kỷ XX)",
      "Gốm Chu Đậu (Hải Dương)",
      "Gốm Bát Tràng (Hà Nội)",
      "Gốm Phước Tích (Thừa Thiên Huế)"
    ],
    "correctIndex": 0,
    "explanation": "Các tiểu cảnh tượng gốm trên bờ nóc Hội quán Nghĩa An khắc họa các điển tích cổ trang (Phong Thần, Tam Quốc, Bát Tiên...) là kiệt tác của các lò gốm Cây Mai nổi tiếng vùng Chợ Lớn – Sài Gòn xưa (như lò Bửu Nguyên, Đồng Hòa...).",
    "sourceRef": "Bảo tàng Lịch sử TP.HCM – Chuyên khảo Gốm Cây Mai Sài Gòn"
  },
  {
    "id": 54,
    "code": "HCM-DT-011",
    "siteId": "hoi-quan-nghia-an",
    "siteName": "Hội quán Nghĩa An",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Khoảng sân mở không mái nằm ở giữa khuôn viên Hội quán Nghĩa An (sân thiên tỉnh) thực hiện chức năng kiến trúc – sinh thái nào?",
    "options": [
      "Làm khu vực biểu diễn võ thuật ngoài trời có sức chứa hàng nghìn người",
      "Đóng vai trò giếng trời lấy sáng tự nhiên, lưu thông gió và thoát khói nhang từ không gian chính điện",
      "Làm bãi đậu xe cơ giới cho khách thập phương",
      "Làm ao nuôi cá phục vụ ẩm thực lễ hội"
    ],
    "correctIndex": 1,
    "explanation": "Trong kiểu kiến trúc nhà ống đô thị khép kín hình chữ Khẩu (口), sân thiên tỉnh ở trung tâm là giải pháp vi khí hậu rất thông minh giúp lấy sáng, giảm độ ẩm và nhanh chóng thoát khói hương trong các dịp lễ lớn.",
    "sourceRef": "Kiến trúc Hội quán Người Hoa tại TP. Hồ Chí Minh – NXB Văn hóa Dân tộc"
  },
  {
    "id": 55,
    "code": "HCM-DT-011",
    "siteId": "hoi-quan-nghia-an",
    "siteName": "Hội quán Nghĩa An",
    "region": "hcm",
    "topicId": "CD-03",
    "topicName": "Chuyên đề 3: Tín ngưỡng, Tôn giáo & Giao thoa Văn hóa Sài Gòn – Chợ Lớn",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Dưới góc nhìn nhân học đô thị và lịch sử kinh tế, hệ thống các Hội quán người Hoa ở Chợ Lớn (tiêu biểu là Hội quán Nghĩa An) đóng vai trò lịch sử gì ngoài chức năng thờ tự?",
    "options": [
      "Chỉ là nơi cất giữ vũ khí quân sự của các bang hội",
      "Là trụ sở hành chính trực thuộc triều đình nhà Thanh đặt tại Sài Gòn",
      "Đóng vai trò như 'phòng thương mại – tổ chức an sinh tự quản' hỗ trợ vốn, giải quyết tranh chấp thương mại, xây dựng trường học, bệnh viện và gắn kết mạng lưới giao thương Nam Bộ",
      "Là nơi độc quyền thu thuế đất nông nghiệp của toàn bộ vùng đồng bằng sông Cửu Long"
    ],
    "correctIndex": 2,
    "explanation": "Các Hội quán như Nghĩa An mang tính đa chức năng điển hình của xã hội thương cảng: vừa là trung tâm tín ngưỡng tạo 'chữ tín' trong kinh doanh (thờ Quan Công), vừa là thiết chế xã hội dân sự bảo trợ giáo dục, y tế và tương tế cho di dân mới đến lập nghiệp.",
    "sourceRef": "Trần Hồng Liên – Cộng đồng Người Hoa tại TP.HCM và Di sản Hội quán"
  },
  {
    "id": 56,
    "code": "HCM-DT-009",
    "siteId": "dia-dao-cu-chi",
    "siteName": "Địa đạo Củ Chi",
    "region": "hcm",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Hệ thống Địa đạo Củ Chi bắt đầu hình thành từ giai đoạn lịch sử nào và phát triển đạt tổng chiều dài khoảng bao nhiêu km trong kháng chiến chống Mỹ?",
    "options": [
      "Bắt đầu đào từ năm 1968 trong Tết Mậu Thân với chiều dài 30 km",
      "Bắt đầu đào từ năm 1973 sau Hiệp định Paris với chiều dài khoảng 10 km",
      "Bắt đầu đào từ thời triều Nguyễn năm 1859 với chiều dài 50 km",
      "Bắt đầu từ năm 1946–1948 trong kháng chiến chống Pháp, phát triển lên khoảng 250 km trong kháng chiến chống Mỹ"
    ],
    "correctIndex": 3,
    "explanation": "Những đường hầm sơ khai đầu tiên ở Củ Chi được quân dân hai xã Tân Phú Trung và Phước Vĩnh An đào từ năm 1946–1948 thời chống Pháp; đến thời kháng chiến chống Mỹ đã phát triển thành mạng lưới địa đạo liên hoàn dài khoảng 250 km.",
    "sourceRef": "Ban Quản lý Khu Di tích Lịch sử Địa đạo Củ Chi"
  },
  {
    "id": 57,
    "code": "HCM-DT-009",
    "siteId": "dia-dao-cu-chi",
    "siteName": "Địa đạo Củ Chi",
    "region": "hcm",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Thiết bị nấu ăn sáng tạo nào giúp quân dân Củ Chi nấu cơm dưới lòng đất mà không để lộ cột khói lên bầu trời trước máy bay trinh sát địch?",
    "options": [
      "Bếp Hoàng Cầm với hệ thống rãnh dẫn khói làm nguội và tản khói mỏng sát mặt đất",
      "Bếp điện từ chạy bằng máy phát thủy điện",
      "Bếp gas nén công nghiệp đặt trong khoang kín",
      "Bếp năng lượng mặt trời đặt trên ngọn cây cao"
    ],
    "correctIndex": 0,
    "explanation": "Bếp Hoàng Cầm dẫn khói qua các rãnh đất phủ cành lá ẩm giúp khói giảm nhiệt, hòa tan phần lớn bụi muội và chỉ tỏa ra như làn sương mỏng là là mặt đất vào sáng sớm, vô hiệu hóa trinh sát đường không của đối phương.",
    "sourceRef": "Bảo tàng Lịch sử Quân sự Việt Nam – Tư liệu Địa đạo Củ Chi"
  },
  {
    "id": 58,
    "code": "HCM-DT-009",
    "siteId": "dia-dao-cu-chi",
    "siteName": "Địa đạo Củ Chi",
    "region": "hcm",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Đặc điểm địa hình và thổ nhưỡng nào của vùng đất Củ Chi tạo điều kiện thuận lợi để đào hệ thống địa đạo sâu tới 3 tầng mà không bị ngập úng quanh năm?",
    "options": [
      "Nền cát biển rời nằm dưới mực nước triều cường sông Sài Gòn",
      "Vùng đất cao phù sa cổ chứa đất sét pha đá ong (laterite) có độ kết dính cao, thoát nước tốt và cao độ nền đất cao hơn mực nước ngầm mùa mưa",
      "Vùng núi đá vôi có sẵn hàng trăm hang động karst tự nhiên",
      "Vùng đầm lầy đất phèn ngập mặn quanh năm"
    ],
    "correctIndex": 1,
    "explanation": "Củ Chi nằm trên thềm phù sa cổ có tầng đất sét pha đá ong vừa đủ dẻo để đào bằng cuốc xẻng thủ công, vừa đóng cứng chắc sau khi tiếp xúc không khí, đồng thời nền đất cao giúp hầm hạn chế ngập úng ngay cả vào mùa mưa.",
    "sourceRef": "Hồ sơ Di tích Quốc gia Đặc biệt Địa đạo Củ Chi (2015)"
  },
  {
    "id": 59,
    "code": "HCM-DT-009",
    "siteId": "dia-dao-cu-chi",
    "siteName": "Địa đạo Củ Chi",
    "region": "hcm",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Để đối phó với chiến thuật bơm khí độc, bơm nước và thả lính 'chuột cống' (tunnel rats) xuống đường hầm của quân đội Mỹ, cấu trúc Địa đạo Củ Chi đã áp dụng thiết kế thông minh nào?",
    "options": [
      "Đào đường hầm thẳng tắp một mạch rộng 3 mét để xe cơ giới chạy qua",
      "Bọc toàn bộ lòng hầm bằng ống thép không gỉ nhập khẩu",
      "Thiết kế đường hầm uốn lượn gấp khúc, phân tầng sâu dần (3m – 6m – 10m), bố trí nắp hầm sập, nút chặn khí độc và lỗ thông hơi ngụy trang như ụ mối",
      "Xây tường bê tông cốt thép dày 2 mét bịt kín toàn bộ các cửa hầm"
    ],
    "correctIndex": 2,
    "explanation": "Cấu trúc gấp khúc làm giảm sóng xung kích khi bom nổ hoặc lựu đạn ném xuống; các nút chặn hầm hình chữ U/cửa sập cô lập được hơi cay, nước ngập từng đoạn ngắn, biến lòng đất thành mê cung bất khả xâm phạm.",
    "sourceRef": "Lịch sử Nghệ thuật Quân sự Việt Nam – NXB Quân đội Nhân dân"
  },
  {
    "id": 60,
    "code": "HCM-DT-009",
    "siteId": "dia-dao-cu-chi",
    "siteName": "Địa đạo Củ Chi",
    "region": "hcm",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Từ góc độ địa quân sự, vì sao vùng đất Củ Chi ('Đất Thép Thành Đồng') có ý nghĩa chiến lược đặc biệt quan trọng đối với toàn cục chiến trường Nam Bộ giai đoạn 1965–1975?",
    "options": [
      "Vì đây là cảng biển nước sâu duy nhất tiếp nhận tàu vận tải quân sự từ miền Bắc",
      "Vì hoàn toàn nằm ngoài tầm hoạt động của không quân và pháo binh đối phương",
      "Vì tập trung toàn bộ mỏ quặng sắt và nhà máy luyện kim lớn nhất miền Nam",
      "Vì nằm ngay cửa ngõ Tây Bắc sát đầu não Sài Gòn, nối liền chiến khu Dương Minh Châu và hành lang Bến Cát, tạo bàn đạp ém quân trực tiếp cho cuộc Tổng tiến công Mậu Thân 1968 và Chiến dịch Hồ Chí Minh 1975"
    ],
    "correctIndex": 3,
    "explanation": "Nằm chỉ cách trung tâm Sài Gòn khoảng 30–70 km về hướng Tây Bắc, Địa đạo Củ Chi như một 'mũi dao' cắm sát sườn cơ quan đầu não địch, đảm bảo giữ vững bàn đạp hậu cần – chỉ huy và xuất phát điểm cho các mũi tiến công chiến lược vào nội đô.",
    "sourceRef": "Viện Lịch sử Quân sự Việt Nam – Tổng kết Kháng chiến chống Mỹ ở Nam Bộ"
  },
  {
    "id": 61,
    "code": "BD-DT-002",
    "siteId": "dia-dao-tam-giac-sat",
    "siteName": "Địa đạo Tam Giác Sắt – Tây Nam Bến Cát",
    "region": "bd",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Khu di tích Địa đạo Tam Giác Sắt nằm trên địa bàn 3 xã Tây Nam nào trước đây của Bến Cát (tỉnh Bình Dương)?",
    "options": [
      "An Điền, An Tây và Phú An",
      "Phú Cường, Chánh Nghĩa và Hiệp Thành",
      "Lái Thiêu, An Thạnh và Bình Nhâm",
      "Tân Uyên, Uyên Hưng và Bạch Đằng"
    ],
    "correctIndex": 0,
    "explanation": "Vùng Tam Giác Sắt gồm 3 xã An Điền, An Tây và Phú An nằm ở phía Tây Nam Bến Cát (tỉnh Bình Dương), tạo thành hình thế tam giác hiểm yếu kẹp giữa hai con sông lớn.",
    "sourceRef": "Hồ sơ Di tích Lịch sử Quốc gia Địa đạo Tây Nam Bến Cát (1996)"
  },
  {
    "id": 62,
    "code": "BD-DT-002",
    "siteId": "dia-dao-tam-giac-sat",
    "siteName": "Địa đạo Tam Giác Sắt – Tây Nam Bến Cát",
    "region": "bd",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Địa bàn 'Tam Giác Sắt' (Iron Triangle) nằm kẹp giữa hai con sông quan trọng nào của vùng Đông Nam Bộ?",
    "options": [
      "Sông Đồng Nai và sông Bé",
      "Sông Sài Gòn và sông Thị Tính",
      "Sông Vàm Cỏ Đông và sông Vàm Cỏ Tây",
      "Sông Tiền và sông Hậu"
    ],
    "correctIndex": 1,
    "explanation": "Hai cạnh thủy lộ tự nhiên là sông Sài Gòn ở phía Tây và sông Thị Tính ở phía Đông bao bọc lấy ba xã Tây Nam Bến Cát, tạo địa thế phòng thủ hiểm yếu nhưng cũng rất thuận lợi để cơ động liên lạc sang Củ Chi.",
    "sourceRef": "Địa chí tỉnh Bình Dương – NXB Chính trị Quốc gia"
  },
  {
    "id": 63,
    "code": "BD-DT-002",
    "siteId": "dia-dao-tam-giac-sat",
    "siteName": "Địa đạo Tam Giác Sắt – Tây Nam Bến Cát",
    "region": "bd",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Di tích lịch sử Địa đạo Tam Giác Sắt – Tây Nam Bến Cát được Bộ Văn hóa – Thông tin xếp hạng Di tích Lịch sử cấp Quốc gia vào năm nào?",
    "options": [
      "Năm 1979",
      "Năm 1985",
      "Năm 1996",
      "Năm 2010"
    ],
    "correctIndex": 2,
    "explanation": "Ngày 18/03/1996, Bộ Văn hóa – Thông tin đã ban hành quyết định công nhận Địa đạo Tây Nam Bến Cát (Tam Giác Sắt) là Di tích Lịch sử cấp Quốc gia.",
    "sourceRef": "Bảo tàng tỉnh Bình Dương – Danh mục Di tích Quốc gia"
  },
  {
    "id": 64,
    "code": "BD-DT-002",
    "siteId": "dia-dao-tam-giac-sat",
    "siteName": "Địa đạo Tam Giác Sắt – Tây Nam Bến Cát",
    "region": "bd",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Tháng 1 năm 1967, quân đội Mỹ đã huy động lực lượng quy mô lớn (khoảng 30.000 quân cùng xe tăng, máy bay B-52, xe ủi) mở chiến dịch quân sự khét tiếng nào nhằm hủy diệt căn cứ Tam Giác Sắt?",
    "options": [
      "Chiến dịch Biên giới Thu Đông",
      "Chiến dịch Điện Biên Phủ trên không",
      "Chiến dịch Lam Sơn 719",
      "Chiến dịch Cedar Falls (Bóc vỏ Trái Đất)"
    ],
    "correctIndex": 3,
    "explanation": "Chiến dịch Cedar Falls (từ 8/1 đến 26/1/1967) là một trong những cuộc hành quân tìm diệt lớn nhất của Mỹ nhằm xóa sổ vùng Tam Giác Sắt, san phẳng làng mạc và đánh sập địa đạo, song không thể tiêu diệt được lực lượng chủ lực và cơ sở cách mạng tại đây.",
    "sourceRef": "Lịch sử Đảng bộ tỉnh Bình Dương & Tư liệu Chiến dịch Cedar Falls (1967)"
  },
  {
    "id": 65,
    "code": "BD-DT-002",
    "siteId": "dia-dao-tam-giac-sat",
    "siteName": "Địa đạo Tam Giác Sắt – Tây Nam Bến Cát",
    "region": "bd",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Hệ thống Địa đạo Tam Giác Sắt được khởi đào từ thời kỳ nào và có mối liên hệ tác chiến như thế nào với Địa đạo Củ Chi?",
    "options": [
      "Khởi đào từ khoảng năm 1948 thời chống Pháp, mở rộng quy mô lớn thời chống Mỹ và phối hợp chặt chẽ tạo thế liên hoàn vượt sông Sài Gòn với Địa đạo Củ Chi",
      "Đào từ năm 1974 và hoàn toàn độc lập, không có giao liên với các khu vực khác",
      "Do quân đội Pháp xây dựng để bảo vệ đồn điền cao su Bến Cát",
      "Chỉ là hệ thống giao thông hào nổi không có hầm ngầm"
    ],
    "correctIndex": 0,
    "explanation": "Cũng như Củ Chi, địa đạo Tây Nam Bến Cát ra đời từ khoảng năm 1948 trong kháng chiến chống Pháp; qua thời chống Mỹ đã kết nối chặt chẽ với vùng Đất Thép Củ Chi bên kia sông Sài Gòn tạo thành cụm căn cứ địa thép ngay sát cửa ngõ Bắc – Tây Bắc Sài Gòn.",
    "sourceRef": "Lịch sử Lực lượng Vũ trang tỉnh Sông Bé – Bình Dương"
  },
  {
    "id": 66,
    "code": "BD-DT-002",
    "siteId": "dia-dao-tam-giac-sat",
    "siteName": "Địa đạo Tam Giác Sắt – Tây Nam Bến Cát",
    "region": "bd",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Cấu trúc bên trong mạng lưới Địa đạo Tam Giác Sắt bao gồm những hạng mục chức năng chủ yếu nào?",
    "options": [
      "Chỉ gồm các hố cá nhân đơn lẻ không thông nhau",
      "Trục đường hầm xương sống uốn lượn kết nối các hầm chỉ huy, hầm hội họp, hầm quân y, kho lương thực, giếng nước và công sự chiến đấu bí mật",
      "Hệ thống cầu vượt bằng sắt bắc qua sông Thị Tính",
      "Các khu nhà xưởng cơ khí nặng đặt lộ thiên trên mặt đất"
    ],
    "correctIndex": 1,
    "explanation": "Địa đạo Tây Nam Bến Cát được xây dựng như một căn cứ hoàn chỉnh dưới lòng đất với trục đường xương sống liên xã nối liền các kho dự trữ, trạm cứu thương, hầm lãnh đạo và hệ thống giao thông hào, ụ chiến đấu trên mặt đất.",
    "sourceRef": "Ban Quản lý Khu Di tích Địa đạo Tam Giác Sắt – Bình Dương"
  },
  {
    "id": 67,
    "code": "BD-DT-002",
    "siteId": "dia-dao-tam-giac-sat",
    "siteName": "Địa đạo Tam Giác Sắt – Tây Nam Bến Cát",
    "region": "bd",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Tại sao bộ chỉ huy quân sự Mỹ gọi khu vực 3 xã Tây Nam Bến Cát là 'Iron Triangle' (Tam Giác Sắt)?",
    "options": [
      "Vì khu vực này có trữ lượng mỏ quặng sắt công nghiệp lớn nhất Đông Nam Bộ",
      "Vì quân đội Mỹ xây dựng ba căn cứ không quân bằng thép tại ba đỉnh của khu vực",
      "Vì đây là khu vực tam giác địa hình hiểm yếu có thế trận địa đạo và căn cứ cách mạng cực kỳ kiên cố, nhiều lần đánh bại các cuộc hành quân quy mô lớn của địch",
      "Vì nơi đây là trung tâm sản xuất nông cụ bằng sắt từ thế kỷ XIX"
    ],
    "correctIndex": 2,
    "explanation": "Tên gọi 'Tam Giác Sắt' xuất phát từ sự thừa nhận của chính giới quân sự Mỹ về tính bất khả xâm phạm và sức bám trụ kiên cường của thế trận chiến tranh nhân dân tại vùng tam giác An Điền – An Tây – Phú An ngay sát Sài Gòn.",
    "sourceRef": "Từ điển Bách khoa Quân sự Việt Nam & Hồ sơ Quân sử Chiến tranh Việt Nam"
  },
  {
    "id": 68,
    "code": "BD-DT-002",
    "siteId": "dia-dao-tam-giac-sat",
    "siteName": "Địa đạo Tam Giác Sắt – Tây Nam Bến Cát",
    "region": "bd",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "So sánh điểm tương đồng về nền tảng địa – sinh thái học giữa Địa đạo Tam Giác Sắt (Bình Dương) và Địa đạo Củ Chi (TP.HCM) cho thấy kết luận khoa học nào?",
    "options": [
      "Cả hai đều được đào trong tầng bùn nhão ven biển nên phải bơm chống ngập liên tục",
      "Cả hai nằm trên độ cao trên 1.000 mét so với mực nước biển",
      "Cả hai đều tận dụng hệ thống hầm mỏ than đá bỏ hoang từ thế kỷ XIX",
      "Cả hai cùng nằm trên dải thềm phù sa cổ có thành phần đất sét pha đá ong (laterite) độ liên kết cao dọc lưu vực sông Sài Gòn, cho phép kiến tạo hệ thống hầm ngầm bền vững bằng công cụ thô sơ"
    ],
    "correctIndex": 3,
    "explanation": "Sự phân bố của cụm địa đạo Củ Chi – Bến Cát phản ánh tư duy tận dụng triệt để điều kiện địa chất tự nhiên (đất phù sa cổ giàu sét – đá ong ở thềm cao trung du Đông Nam Bộ) vào nghệ thuật quân sự của người Việt.",
    "sourceRef": "Chuyên đề Địa chất & Di sản Quân sự Đông Nam Bộ"
  },
  {
    "id": 69,
    "code": "BRVT-DT-003",
    "siteId": "dia-dao-long-phuoc",
    "siteName": "Địa đạo Long Phước",
    "region": "brvt",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Di tích lịch sử cách mạng Địa đạo Long Phước tọa lạc tại địa phương nào của tỉnh Bà Rịa – Vũng Tàu?",
    "options": [
      "Xã Long Phước, thành phố Bà Rịa",
      "Xã Long Sơn, thành phố Vũng Tàu",
      "Huyện Côn Đảo",
      "Thị trấn Phước Bửu, huyện Xuyên Mộc"
    ],
    "correctIndex": 0,
    "explanation": "Địa đạo Long Phước nằm tại xã Long Phước, thành phố Bà Rịa, cách trung tâm thành phố Bà Rịa khoảng 7 km về phía Đông Bắc.",
    "sourceRef": "Bảo tàng tỉnh Bà Rịa – Vũng Tàu"
  },
  {
    "id": 70,
    "code": "BRVT-DT-003",
    "siteId": "dia-dao-long-phuoc",
    "siteName": "Địa đạo Long Phước",
    "region": "brvt",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Địa đạo Long Phước được quân dân địa phương bắt đầu đào từ năm nào?",
    "options": [
      "Năm 1965",
      "Năm 1948",
      "Năm 1972",
      "Năm 1930"
    ],
    "correctIndex": 1,
    "explanation": "Địa đạo Long Phước hình thành từ năm 1948 trong cuộc kháng chiến chống thực dân Pháp, sau đó liên tục được củng cố và mở rộng qua suốt hai cuộc kháng chiến cho đến năm 1975.",
    "sourceRef": "Hồ sơ Di tích Quốc gia Địa đạo Long Phước (1990)"
  },
  {
    "id": 71,
    "code": "BRVT-DT-003",
    "siteId": "dia-dao-long-phuoc",
    "siteName": "Địa đạo Long Phước",
    "region": "brvt",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Địa đạo Long Phước được Bộ Văn hóa – Thông tin công nhận xếp hạng Di tích lịch sử cách mạng cấp Quốc gia vào ngày tháng năm nào?",
    "options": [
      "Ngày 02/09/1985",
      "Ngày 30/04/1975",
      "Ngày 09/01/1990",
      "Ngày 19/05/2005"
    ],
    "correctIndex": 2,
    "explanation": "Ngày 09/01/1990, Bộ Văn hóa – Thông tin đã ban hành quyết định công nhận Địa đạo Long Phước là Di tích lịch sử cách mạng cấp Quốc gia.",
    "sourceRef": "Quyết định xếp hạng Di tích Quốc gia – Bộ Văn hóa Thông tin (1990)"
  },
  {
    "id": 72,
    "code": "BRVT-DT-003",
    "siteId": "dia-dao-long-phuoc",
    "siteName": "Địa đạo Long Phước",
    "region": "brvt",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Nét cấu trúc rất đặc trưng gắn kết chặt chẽ giữa 'thế trận lòng dân' và đường hầm tại Địa đạo Long Phước là gì?",
    "options": [
      "Đào hầm xuyên qua đáy vịnh Gành Rái ra tận đảo Long Sơn",
      "Chỉ đào một hầm duy nhất trên đỉnh núi Dinh không liên kết với khu dân cư",
      "Tất cả đường hầm đều xây nổi bằng đá ong cao hơn mặt đất 2 mét",
      "Hệ thống hầm bí mật được đào giấu ngay trong nhà dân (từ dưới giường ngủ, vách nhà) nối thẳng ra trục đường xương sống liên thông 5 ấp trong xã"
    ],
    "correctIndex": 3,
    "explanation": "Tại Long Phước, người dân đào hầm bí mật ngay trong không gian sinh hoạt gia đình (như dưới giường ngủ) thông ra trục xương sống nối liền 5 ấp (ấp Bắc, Nam, Đông, Tây, Phước Hữu), giúp cán bộ và du kích cơ động chiến đấu ngay trong lòng dân.",
    "sourceRef": "Phóng sự Tư liệu BRTgo – TP. Bà Rịa Bảo tồn Địa đạo Long Phước (2023)"
  },
  {
    "id": 73,
    "code": "BRVT-DT-003",
    "siteId": "dia-dao-long-phuoc",
    "siteName": "Địa đạo Long Phước",
    "region": "brvt",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Trong đợt trùng tu quy mô lớn triển khai từ năm 2019 tại Di tích Địa đạo Long Phước, những hạng mục tái hiện thực tế nào đã được xây dựng phục vụ giáo dục truyền thống?",
    "options": [
      "Hơn 700 mét đường hầm xương sống, nhà trưng bày truyền thống, nhà ban quản lý và 4 ngôi nhà dân kháng chiến (trong đó có mô hình hầm bí mật nối từ giường ngủ ra địa đạo)",
      "Một khu vui chơi công viên nước hiện đại và khách sạn 5 sao",
      "Ba tòa tháp quan sát bằng thép cao 50 mét",
      "Một tuyến cáp treo nối từ Long Phước ra Bãi Sau Vũng Tàu"
    ],
    "correctIndex": 0,
    "explanation": "Dự án trùng tu tôn tạo Địa đạo Long Phước từ năm 2019 đã phục dựng hơn 700m trục hầm xi măng đắp đất sét, nhà trưng bày truyền thống cùng 4 ngôi nhà dân thời chiến có hệ thống hầm bí mật chân thực.",
    "sourceRef": "Đài PT-TH Bà Rịa – Vũng Tàu (BRTgo, 2023)"
  },
  {
    "id": 74,
    "code": "BRVT-DT-003",
    "siteId": "dia-dao-long-phuoc",
    "siteName": "Địa đạo Long Phước",
    "region": "brvt",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Trận chiến đấu chống địch càn quét nổi tiếng nào của quân dân Long Phước được tái hiện bằng sa bàn tại nhà truyền thống khu di tích?",
    "options": [
      "Trận Rạch Gầm – Xoài Mút năm 1785",
      "Trận đánh chống càn từ ngày 05/03 đến ngày 11/04/1963",
      "Trận Bình Giã cuối năm 1964 tại Châu Đức",
      "Trận tập kích tàu USNS Card tại cảng Sài Gòn năm 1964"
    ],
    "correctIndex": 1,
    "explanation": "Tại khu trưng bày di tích có sa hình tái hiện trận chiến đấu kiên cường chống đợt càn quét dài ngày của địch từ 05/03 đến 11/04/1963 ngay trên địa bàn xã Long Phước.",
    "sourceRef": "Khu Di tích Địa đạo Long Phước – Tư liệu Trưng bày Sa bàn"
  },
  {
    "id": 75,
    "code": "BRVT-DT-003",
    "siteId": "dia-dao-long-phuoc",
    "siteName": "Địa đạo Long Phước",
    "region": "brvt",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Đặt Địa đạo Long Phước trong hệ thống căn cứ địa miền Đông Nam Bộ (cùng Củ Chi và Tam Giác Sắt), vị trí chiến lược của Long Phước có ý nghĩa gì?",
    "options": [
      "Là nơi đặt tổng hành dinh của Bộ Chỉ huy Miền suốt 20 năm",
      "Là chốt chặn duy nhất bảo vệ biên giới Tây Nam giáp Campuchia",
      "Khống chế trực tiếp tuyến giao thông chiến lược nối trung tâm tỉnh lỵ Bà Rịa – cửa biển Vũng Tàu với khu căn cứ Minh Đạm và chiến trường Bà Rịa – Long Khánh",
      "Là khu vực hậu phương an toàn hoàn toàn không bị chiến tranh tác động"
    ],
    "correctIndex": 2,
    "explanation": "Nằm sát trung tâm hành chính quân sự tỉnh lỵ Bà Rịa, xã Long Phước đóng vai trò bàn đạp mũi nhọn áp sát trục giao thông đi Vũng Tàu và kết nối tuyến hành lang xuống chiến khu Minh Đạm – Đất Đỏ, tạo thế gọng kìm lợi hại trong kháng chiến.",
    "sourceRef": "Lịch sử Đảng bộ tỉnh Bà Rịa – Vũng Tàu"
  },
  {
    "id": 76,
    "code": "BRVT-DT-003",
    "siteId": "dia-dao-long-phuoc",
    "siteName": "Địa đạo Long Phước",
    "region": "brvt",
    "topicId": "CD-04",
    "topicName": "Chuyên đề 4: Hệ thống Địa đạo & Nghệ thuật Chiến tranh Nhân dân Đông Nam Bộ",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Khi thiết kế bài dạy trải nghiệm (Experiential Learning) môn Giáo dục địa phương tại Địa đạo Long Phước cho học sinh – sinh viên, phương pháp nào phát huy cao nhất năng lực tìm hiểu lịch sử?",
    "options": [
      "Chỉ yêu cầu học sinh chép thuộc lòng số liệu đầu tư của dự án trùng tu mà không cần quan sát không gian",
      "Chỉ cho xem ảnh minh họa chung về chiến tranh thế giới thay vì hiện vật địa phương",
      "Tách rời hoàn toàn bối cảnh địa đạo khỏi lịch sử chung của hai cuộc kháng chiến toàn quốc",
      "Kết hợp tham quan sa bàn chiến trận 1963, trải nghiệm di chuyển thực tế trong đoạn hầm phục dựng, đối chiếu bản vẽ 3D cấu trúc hầm bí mật trong nhà dân và thảo luận về nghệ thuật bám trụ chiến tranh nhân dân"
    ],
    "correctIndex": 3,
    "explanation": "Kết hợp trải nghiệm không gian thực địa (hầm bí mật – trục xương sống), trực quan hóa mô hình 3D và phân tích tư liệu địa phương giúp người học hiểu sâu cơ chế vận hành của chiến tranh nhân dân thay vì ghi nhớ sự kiện rời rạc.",
    "sourceRef": "Chương trình Giáo dục Phổ thông 2018 – Định hướng Giáo dục Địa phương"
  },
  {
    "id": 77,
    "code": "BD-DT-001",
    "siteId": "nha-co-tran-cong-vang",
    "siteName": "Nhà cổ Trần Công Vàng",
    "region": "bd",
    "topicId": "CD-05",
    "topicName": "Chuyên đề 5: Kiến trúc Nhà cổ Nam Bộ & Nghệ thuật Chạm khắc Thủ Dầu Một",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Nhà cổ Trần Công Vàng tọa lạc tại địa phương nào của tỉnh Bình Dương?",
    "options": [
      "Phường Phú Cường, thành phố Thủ Dầu Một",
      "Phường Lái Thiêu, thành phố Thuận An",
      "Phường Dĩ An, thành phố Dĩ An",
      "Xã An Tây, thành phố Bến Cát"
    ],
    "correctIndex": 0,
    "explanation": "Nhà cổ Trần Công Vàng nằm tại đường Ngô Tùng Châu, phường Phú Cường, trung tâm thành phố Thủ Dầu Một, tỉnh Bình Dương.",
    "sourceRef": "Bảo tàng tỉnh Bình Dương – Hồ sơ Di tích Quốc gia (1993)"
  },
  {
    "id": 78,
    "code": "BD-DT-001",
    "siteId": "nha-co-tran-cong-vang",
    "siteName": "Nhà cổ Trần Công Vàng",
    "region": "bd",
    "topicId": "CD-05",
    "topicName": "Chuyên đề 5: Kiến trúc Nhà cổ Nam Bộ & Nghệ thuật Chạm khắc Thủ Dầu Một",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Nhà cổ Trần Công Vàng được khởi công xây dựng và hoàn thành vào giai đoạn nào?",
    "options": [
      "Từ năm 1744 đến năm 1750 (giữa thế kỷ XVIII)",
      "Từ năm 1889 đến năm 1892 (cuối thế kỷ XIX)",
      "Từ năm 1935 đến năm 1940 (giữa thế kỷ XX)",
      "Từ năm 1962 đến năm 1966"
    ],
    "correctIndex": 1,
    "explanation": "Ngôi nhà được ông Trần Công Vàng (một điền chủ giàu có vùng Thủ Dầu Một) khởi tạo năm 1889 và hoàn thành sau 3 năm thi công vào năm 1892.",
    "sourceRef": "Hồ sơ Di tích Kiến trúc Nghệ thuật Quốc gia Nhà cổ Trần Công Vàng"
  },
  {
    "id": 79,
    "code": "BD-DT-001",
    "siteId": "nha-co-tran-cong-vang",
    "siteName": "Nhà cổ Trần Công Vàng",
    "region": "bd",
    "topicId": "CD-05",
    "topicName": "Chuyên đề 5: Kiến trúc Nhà cổ Nam Bộ & Nghệ thuật Chạm khắc Thủ Dầu Một",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Hệ thống khung chịu lực bằng gỗ quý bên trong Nhà cổ Trần Công Vàng có tổng cộng bao nhiêu cây cột chính?",
    "options": [
      "12 cột",
      "24 cột",
      "48 cột",
      "98 cột"
    ],
    "correctIndex": 2,
    "explanation": "Nhà cổ Trần Công Vàng nổi tiếng với hệ khung kết cấu gỗ bề thế gồm 48 cột gỗ quý kê trên đá tảng, liên kết bằng kỹ thuật mộng chốt truyền thống.",
    "sourceRef": "Sở Văn hóa, Thể thao và Du lịch tỉnh Bình Dương"
  },
  {
    "id": 80,
    "code": "BD-DT-001",
    "siteId": "nha-co-tran-cong-vang",
    "siteName": "Nhà cổ Trần Công Vàng",
    "region": "bd",
    "topicId": "CD-05",
    "topicName": "Chuyên đề 5: Kiến trúc Nhà cổ Nam Bộ & Nghệ thuật Chạm khắc Thủ Dầu Một",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Bố cục mặt bằng hiếm gặp và đặc trưng nhất của Nhà cổ Trần Công Vàng trong hệ thống nhà rường Nam Bộ là kiểu mặt bằng nào?",
    "options": [
      "Kiểu nhà ống hình chữ Nhất không có chái",
      "Kiểu chữ Khẩu (口) khép kín 4 mặt",
      "Kiểu chữ Công (工) hai tầng lầu kiểu Pháp",
      "Kiểu chữ Đinh (丁) nghịch"
    ],
    "correctIndex": 3,
    "explanation": "Khác với kiểu nhà chữ Đinh thông thường (nhà ngang nằm phía trước, nhà dọc nối ra sau), Nhà cổ Trần Công Vàng được thiết kế theo kiểu chữ Đinh nghịch rất độc đáo trong kiến trúc dân gian Nam Bộ thế kỷ XIX.",
    "sourceRef": "Kiến trúc Nhà cổ Bình Dương – Bảo tàng tỉnh Bình Dương"
  },
  {
    "id": 81,
    "code": "BD-DT-001",
    "siteId": "nha-co-tran-cong-vang",
    "siteName": "Nhà cổ Trần Công Vàng",
    "region": "bd",
    "topicId": "CD-05",
    "topicName": "Chuyên đề 5: Kiến trúc Nhà cổ Nam Bộ & Nghệ thuật Chạm khắc Thủ Dầu Một",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Kỹ thuật liên kết các bộ phận khung gỗ (cột, kèo, xuyên, trính) tại Nhà cổ Trần Công Vàng thể hiện trình độ mộc truyền thống cao ở điểm nào?",
    "options": [
      "Sử dụng hoàn toàn hệ thống mộng, chốt gỗ khít sát không dùng đinh sắt, kết hợp chân cột kê trên đá tảng chống mối mọt và ẩm nền",
      "Hàn gắn toàn bộ bằng bản mã thép và bu-lông công nghiệp",
      "Đổ bê tông bọc kín chân cột gỗ xuống sâu 3 mét",
      "Buộc nối các thanh kèo bằng dây mây rừng"
    ],
    "correctIndex": 0,
    "explanation": "Kỹ thuật mộng chốt gỗ giúp khung nhà có độ đàn hồi tự nhiên, dễ tháo lắp từng cấu kiện khi cần tu bổ (như trong đợt đại trùng tu năm 2005–2007), còn chân tảng đá giúp cách ẩm hiệu quả cho gỗ quý.",
    "sourceRef": "Tư liệu Trùng tu Di tích Nhà cổ Trần Công Vàng (2005–2007)"
  },
  {
    "id": 82,
    "code": "BD-DT-001",
    "siteId": "nha-co-tran-cong-vang",
    "siteName": "Nhà cổ Trần Công Vàng",
    "region": "bd",
    "topicId": "CD-05",
    "topicName": "Chuyên đề 5: Kiến trúc Nhà cổ Nam Bộ & Nghệ thuật Chạm khắc Thủ Dầu Một",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Nghệ thuật trang trí nội thất (bao lam, thành vọng, hoành phi, liễn đối, tủ thờ) trong Nhà cổ Trần Công Vàng gắn liền với tinh hoa làng nghề truyền thống nào của vùng đất Thủ Dầu Một?",
    "options": [
      "Nghề dệt lụa tơ tằm và nhuộm chàm",
      "Nghề chạm khắc gỗ mỹ nghệ và khảm ốc xà cừ truyền thống Thủ Dầu Một – Lái Thiêu",
      "Nghề rèn đúc vũ khí đồng thau",
      "Nghề thổi thủy tinh màu châu Âu"
    ],
    "correctIndex": 1,
    "explanation": "Thủ Dầu Một – Bình Dương từ thế kỷ XIX vốn nổi tiếng cả Nam Kỳ về nghề chạm khắc gỗ, cẩn ốc xà cừ và sơn mài; nội thất Nhà cổ Trần Công Vàng hội tụ đỉnh cao tay nghề của các nghệ nhân bản địa qua các bức bao lam tứ linh, tứ quý, mai điểu và liễn đối khảm ốc tinh xảo.",
    "sourceRef": "Địa chí tỉnh Bình Dương – Phần Làng nghề Truyền thống"
  },
  {
    "id": 83,
    "code": "BD-DT-001",
    "siteId": "nha-co-tran-cong-vang",
    "siteName": "Nhà cổ Trần Công Vàng",
    "region": "bd",
    "topicId": "CD-05",
    "topicName": "Chuyên đề 5: Kiến trúc Nhà cổ Nam Bộ & Nghệ thuật Chạm khắc Thủ Dầu Một",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Trong đợt trùng tu bảo tồn lớn giai đoạn 2005–2007 tại Nhà cổ Trần Công Vàng, nguyên tắc khoa học nào đã giúp di tích giữ được tính chân xác (Authenticity) theo Công ước Di sản?",
    "options": [
      "Thay thế toàn bộ khung gỗ cũ bằng bê tông giả gỗ để kéo dài tuổi thọ vĩnh viễn",
      "Xây thêm tầng lầu bê tông bên trên mái ngói âm dương",
      "Hạ giải từng phần có đánh số cấu kiện, xử lý chống mối mọt, tái sử dụng tối đa cột kèo – bao lam gỗ nguyên gốc và chỉ thay thế cục bộ những chi tiết mục nát bằng cùng chủng loại gỗ, kỹ thuật mộng truyền thống",
      "Sơn phủ toàn bộ bề mặt gỗ chạm khắc bằng sơn công nghiệp màu trắng"
    ],
    "correctIndex": 2,
    "explanation": "Phương pháp 'hạ giải kiểm soát – đánh số cấu kiện – bảo tồn tối đa vật liệu gốc' là chuẩn mực quốc tế trong bảo tồn kiến trúc gỗ truyền thống châu Á (tham chiếu Văn kiện Nara về Tính chân xác năm 1994).",
    "sourceRef": "Cục Di sản Văn hóa – Quy chuẩn Bảo quản, Tu bổ Di tích Kiến trúc Gỗ"
  },
  {
    "id": 84,
    "code": "BD-DT-001",
    "siteId": "nha-co-tran-cong-vang",
    "siteName": "Nhà cổ Trần Công Vàng",
    "region": "bd",
    "topicId": "CD-05",
    "topicName": "Chuyên đề 5: Kiến trúc Nhà cổ Nam Bộ & Nghệ thuật Chạm khắc Thủ Dầu Một",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Nghiên cứu cấu trúc không gian sinh hoạt và thờ tự bên trong Nhà cổ Trần Công Vàng phản ánh cấu trúc xã hội – văn hóa nào của tầng lớp đại điền chủ Nam Bộ cuối thế kỷ XIX?",
    "options": [
      "Sự từ bỏ hoàn toàn tín ngưỡng thờ cúng tổ tiên để theo lối sống phương Tây",
      "Mô hình công xã nông nghiệp tập thể không có sở hữu tư nhân",
      "Lối sống du canh du cư không cố định chỗ ở",
      "Sự đề cao trật tự gia tộc Nho giáo (gian giữa trang trọng đặt bàn thờ gia tiên và liễn đối răn dạy đạo lý) kết hợp sự cởi mở đón tiếp giao lưu kinh tế – văn hóa của vùng đất Thủ Dầu Một"
    ],
    "correctIndex": 3,
    "explanation": "Cách phân chia không gian theo trục chính – phụ (gian giữa thờ tổ tiên – tiếp khách danh dự, các gian bên và nhà sau cho sinh hoạt gia đình) cùng nội dung các câu đối khảm ốc phản ánh rõ tâm thức 'uống nước nhớ nguồn' và vị thế văn hóa của tầng lớp điền chủ Nam Bộ cuối thế kỷ XIX.",
    "sourceRef": "Nghiên cứu Văn hóa Gia đình & Nhà cổ Nam Bộ – Viện Khoa học Xã hội"
  },
  {
    "id": 85,
    "code": "BRVT-DT-001",
    "siteId": "bach-dinh",
    "siteName": "Bạch Dinh (Villa Blanche)",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Bạch Dinh (Villa Blanche) tại thành phố Vũng Tàu được xây dựng trong khoảng thời gian nào và nằm trên sườn ngọn núi nào?",
    "options": [
      "Xây dựng từ năm 1898 đến năm 1902 trên sườn Núi Lớn",
      "Xây dựng từ năm 1920 đến năm 1925 trên đỉnh Núi Nhỏ",
      "Xây dựng từ năm 1860 đến năm 1865 trên đảo Long Sơn",
      "Xây dựng từ năm 1955 đến năm 1958 tại Bãi Sau"
    ],
    "correctIndex": 0,
    "explanation": "Bạch Dinh được Toàn quyền Đông Dương Paul Doumer cho khởi công năm 1898 và hoàn thành năm 1902 trên sườn Núi Lớn, hướng mặt ra vịnh Bãi Trước (TP. Vũng Tàu).",
    "sourceRef": "Bảo tàng tỉnh Bà Rịa – Vũng Tàu – Hồ sơ Di tích Bạch Dinh"
  },
  {
    "id": 86,
    "code": "BRVT-DT-001",
    "siteId": "bach-dinh",
    "siteName": "Bạch Dinh (Villa Blanche)",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Vị vua yêu nước nào của triều Nguyễn đã bị thực dân Pháp giam lỏng (an trí) tại Bạch Dinh trong gần 10 năm (từ 1907 đến 1916) trước khi bị đày sang đảo Réunion?",
    "options": [
      "Vua Hàm Nghi",
      "Vua Thành Thái",
      "Vua Duy Tân",
      "Vua Tự Đức"
    ],
    "correctIndex": 1,
    "explanation": "Sau khi phế truất vua Thành Thái vì tinh thần chống Pháp, thực dân Pháp đã đưa nhà vua về giam lỏng tại Bạch Dinh (Vũng Tàu) từ năm 1907 đến năm 1916 rồi đày ông cùng con trai (vua Duy Tân) sang đảo Réunion ở Ấn Độ Dương.",
    "sourceRef": "Lịch sử Việt Nam cận đại – NXB Giáo dục Việt Nam"
  },
  {
    "id": 87,
    "code": "BRVT-DT-001",
    "siteId": "bach-dinh",
    "siteName": "Bạch Dinh (Villa Blanche)",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Tên gọi tiếng Pháp 'Villa Blanche' của Bạch Dinh được Toàn quyền Paul Doumer đặt theo tên của ai?",
    "options": [
      "Tên con tàu đầu tiên cập cảng Bãi Trước Vũng Tàu",
      "Tên một vị nữ hoàng nước Pháp thế kỷ XVII",
      "Tên con gái ông là Blanche Richel Doumer",
      "Tên một loại hoa trắng mọc nhiều trên Núi Lớn"
    ],
    "correctIndex": 2,
    "explanation": "Paul Doumer đặt tên dinh thự nghỉ mát này là Villa Blanche theo tên người con gái ông – Blanche Richel Doumer; người Việt gọi là Bạch Dinh (Dinh Trắng) dựa trên sắc trắng nổi bật của tường vôi tòa nhà giữa rừng giá tỵ.",
    "sourceRef": "Bảo tàng tỉnh Bà Rịa – Vũng Tàu"
  },
  {
    "id": 88,
    "code": "BRVT-DT-001",
    "siteId": "bach-dinh",
    "siteName": "Bạch Dinh (Villa Blanche)",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Trước khi người Pháp xây dựng Bạch Dinh vào năm 1898, nền đất sườn Núi Lớn này từng là vị trí của công trình quân sự phòng thủ biển nào thời triều Nguyễn?",
    "options": [
      "Thành Bát Quái Gia Định",
      "Lũy Thầy Quảng Bình",
      "Đồn Kỳ Hòa",
      "Pháo đài Phước Thắng (xây dựng thời vua Minh Mạng năm 1839)"
    ],
    "correctIndex": 3,
    "explanation": "Năm 1839, vua Minh Mạng cho xây dựng Pháo đài Phước Thắng trên sườn Núi Lớn hướng ra cửa biển Vũng Tàu nhằm phòng thủ thủy lộ trọng yếu vào Gia Định; đến năm 1898 người Pháp san nền pháo đài cũ để dựng Villa Blanche.",
    "sourceRef": "Đại Nam nhất thống chí & Bảo tàng tỉnh Bà Rịa – Vũng Tàu"
  },
  {
    "id": 89,
    "code": "BRVT-DT-001",
    "siteId": "bach-dinh",
    "siteName": "Bạch Dinh (Villa Blanche)",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Bộ sưu tập cổ vật quý giá nổi tiếng nhất hiện đang được trưng bày bên trong Bạch Dinh có nguồn gốc từ đâu?",
    "options": [
      "Bộ sưu tập đồ gốm sứ men lam thời Khang Hy (thế kỷ XVII–XVIII) trục vớt từ xác tàu cổ đắm tại vùng biển Hòn Cau (Côn Đảo)",
      "Bộ sưu tập áo giáp hiệp sĩ thời Trung cổ châu Âu",
      "Bộ sưu tập tượng đất nung thời Tần Thủy Hoàng",
      "Bộ sưu tập tiền vàng La Mã cổ đại"
    ],
    "correctIndex": 0,
    "explanation": "Bạch Dinh hiện trưng bày nhiều cổ vật quý, tiêu biểu nhất là bộ sưu tập gốm sứ men lam thời Khang Hy (nhà Thanh) được trục vớt năm 1990–1992 từ con tàu thương mại cổ bị đắm tại vùng biển Hòn Cau (Côn Đảo).",
    "sourceRef": "Bảo tàng tỉnh Bà Rịa – Vũng Tàu – Danh mục Cổ vật Hòn Cau"
  },
  {
    "id": 90,
    "code": "BRVT-DT-001",
    "siteId": "bach-dinh",
    "siteName": "Bạch Dinh (Villa Blanche)",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Trên mặt tiền kiến trúc châu Âu cuối thế kỷ XIX của Bạch Dinh có sự kết hợp trang trí thú vị nào giữa nghệ thuật phương Tây và phương Đông?",
    "options": [
      "Mái chóp nhọn nhà thờ Gothic kết hợp tượng gỗ Thập Bát La Hán",
      "8 tượng bán thân phong cách cổ đại Hy Lạp – La Mã kết hợp mảng gốm men màu trang trí cặp chim công và cá chép hóa rồng",
      "Cổng Tam quan khảm sành sứ kết hợp tháp đồng hồ cơ khí",
      "Toàn bộ mặt tiền ốp gạch men xanh hiện đại không có phù điêu"
    ],
    "correctIndex": 1,
    "explanation": "Ngoại thất Bạch Dinh mang dáng dấp biệt thự tân cổ điển Pháp với 8 tượng bán thân cổ điển châu Âu nhưng vẫn điểm xuyết các mảng gốm tráng men màu họa tiết chim công, cá chép uốn lượn mang nét mỹ thuật Á Đông tinh tế.",
    "sourceRef": "Hồ sơ Di tích Lịch sử – Văn hóa Quốc gia Bạch Dinh (1992)"
  },
  {
    "id": 91,
    "code": "BRVT-DT-001",
    "siteId": "bach-dinh",
    "siteName": "Bạch Dinh (Villa Blanche)",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Sự kế tiếp tầng di tích tại khu vực Bạch Dinh (từ Pháo đài Phước Thắng 1839 → Villa Blanche 1898 → nơi giam lỏng vua Thành Thái 1907 → Bảo tàng di sản hiện nay) phản ánh quy luật địa – lịch sử nào?",
    "options": [
      "Một vị trí địa lý mang tính ngẫu nhiên không có giá trị quân sự hay kinh tế",
      "Sự đứt gãy hoàn toàn khiến không còn bất kỳ dấu tích lịch sử nào trước năm 1975",
      "Tính đa tầng (Palimpsest) của di sản ven biển: cùng một cao điểm chiến lược khống chế cửa biển đã chuyển hóa công năng qua các giai đoạn phòng thủ phong kiến, cai trị thuộc địa và giáo dục văn hóa đương đại",
      "Xu hướng chuyển dịch toàn bộ các bảo tàng vào sâu trong đất liền"
    ],
    "correctIndex": 2,
    "explanation": "Trong sử học đô thị và di sản học, địa điểm Bạch Dinh là một 'bản ghi đa tầng' (cultural palimpsest) đặc sắc, cho thấy cách mỗi chế độ chính trị định hình lại cùng một điểm cao chiến lược ven biển theo mục tiêu quyền lực và văn hóa của mình.",
    "sourceRef": "Nghiên cứu Di sản Kiến trúc Ven biển Bà Rịa – Vũng Tàu"
  },
  {
    "id": 92,
    "code": "BRVT-DT-001",
    "siteId": "bach-dinh",
    "siteName": "Bạch Dinh (Villa Blanche)",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Bộ sưu tập gốm sứ thời Khang Hy trục vớt từ tàu đắm Hòn Cau trưng bày tại Bạch Dinh cung cấp bằng chứng khoa học quan trọng nào cho nghiên cứu lịch sử biển Việt Nam?",
    "options": [
      "Chứng minh gốm sứ thời Khang Hy được sản xuất trực tiếp ngay trên đỉnh Núi Lớn",
      "Chứng minh người Việt thế kỷ XVIII chưa từng tiếp xúc với thương thuyền quốc tế",
      "Chứng minh tất cả các tàu cổ chỉ đi ven bờ vịnh Bắc Bộ mà không qua biển Đông Nam Bộ",
      "Chứng minh vùng biển Bà Rịa – Vũng Tàu và Côn Đảo nằm trên tuyến 'Con đường tơ lụa trên biển' quốc tế sầm uất kết nối Đông Á – Đông Nam Á – châu Âu từ thế kỷ XVII–XVIII"
    ],
    "correctIndex": 3,
    "explanation": "Những con tàu buôn chở hàng vạn sản phẩm gốm sứ xuất khẩu bị đắm tại Hòn Cau (Côn Đảo) là bằng chứng khảo cổ học dưới nước xác thực về vị trí yết hầu của vùng biển Côn Đảo – Vũng Tàu trên mạng lưới thương mại hàng hải quốc tế cận đại.",
    "sourceRef": "Khảo cổ học Dưới nước Việt Nam – Viện Khảo cổ học"
  },
  {
    "id": 93,
    "code": "BRVT-DT-002",
    "siteId": "nha-lon-long-son",
    "siteName": "Quần thể kiến trúc Nhà Lớn Long Sơn",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Ai là người có công khai hoang lập ấp trên đảo Long Sơn và chủ trì xây dựng Quần thể kiến trúc Nhà Lớn Long Sơn (1910–1929)?",
    "options": [
      "Ông Lê Văn Mưu (được nhân dân kính trọng gọi là Ông Trần)",
      "Ông Nguyễn Hữu Cảnh",
      "Ông Trần Công Vàng",
      "Ông Lê Văn Duyệt"
    ],
    "correctIndex": 0,
    "explanation": "Quần thể Nhà Lớn Long Sơn do ông Lê Văn Mưu (1855–1935, thường gọi là Ông Trần) – người rời vùng Giang Thành (Kiên Giang) ra khai hoang đảo Long Sơn – chủ trì xây dựng từ năm 1910 đến năm 1929.",
    "sourceRef": "Hồ sơ Di tích Lịch sử – Văn hóa Quốc gia Nhà Lớn Long Sơn (1991)"
  },
  {
    "id": 94,
    "code": "BRVT-DT-002",
    "siteId": "nha-lon-long-son",
    "siteName": "Quần thể kiến trúc Nhà Lớn Long Sơn",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Quần thể kiến trúc Nhà Lớn Long Sơn nằm trên tổng diện tích khoảng bao nhiêu hecta và được Bộ Văn hóa công nhận Di tích Quốc gia vào năm nào?",
    "options": [
      "Khoảng 50 hecta, được công nhận Di tích Quốc gia năm 2015",
      "Khoảng 2 hecta, được công nhận Di tích Quốc gia năm 1991",
      "Khoảng 0,2 hecta, được công nhận Di tích Quốc gia năm 1979",
      "Khoảng 10 hecta, được công nhận Di tích Quốc gia năm 2005"
    ],
    "correctIndex": 1,
    "explanation": "Quần thể Nhà Lớn Long Sơn rộng khoảng 2 hecta, gồm cụm đền thờ và hệ thống nhà phục vụ cộng đồng bằng gạch ngói và gỗ quý; công trình được công nhận Di tích Lịch sử – Văn hóa cấp Quốc gia năm 1991.",
    "sourceRef": "Sở Văn hóa và Thể thao tỉnh Bà Rịa – Vũng Tàu"
  },
  {
    "id": 95,
    "code": "BRVT-DT-002",
    "siteId": "nha-lon-long-son",
    "siteName": "Quần thể kiến trúc Nhà Lớn Long Sơn",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Nhận biết",
    "audience": "thcs",
    "audienceLabel": "THCS (Cấp 2)",
    "question": "Trang phục và diện mạo truyền thống đặc trưng của tín đồ Đạo Ông Trần tại Nhà Lớn Long Sơn là gì?",
    "options": [
      "Mặc áo dài gấm thêu rồng và đội mũ cánh chuồn",
      "Mặc áo cà sa vàng và cạo trọc đầu",
      "Mặc áo bà ba đen, để tóc dài búi cao và đi chân đất",
      "Mặc âu phục màu trắng cài hoa đỏ"
    ],
    "correctIndex": 2,
    "explanation": "Tưởng nhớ nếp sống lao động bình dị của Ông Trần trong những ngày đầu khai hoang (cởi trần, đi chân đất, búi tóc cao), tín đồ Đạo Ông Trần giữ lệ mặc áo bà ba đen giản dị, búi tóc cao và đi chân đất khi hành lễ.",
    "sourceRef": "Tư liệu Văn hóa Dân gian Bà Rịa – Vũng Tàu"
  },
  {
    "id": 96,
    "code": "BRVT-DT-002",
    "siteId": "nha-lon-long-son",
    "siteName": "Quần thể kiến trúc Nhà Lớn Long Sơn",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Khu Đền thờ (Nhà Thánh) trong Quần thể Nhà Lớn Long Sơn gồm cụm công trình nổi bật nào nối thông với nhau qua các cầu gỗ và cùng hướng về khoảng sân trung tâm?",
    "options": [
      "Bảo tháp Xá Lợi, Giảng đường và Nhà Trai",
      "Thượng điện, Trung điện, Tiền điện và Nhà bia",
      "Lầu Ngũ Phụng, Điện Thái Hòa và Thế Miếu",
      "Lầu Thánh, Lầu Tiên, Lầu Phật và Lầu Trời"
    ],
    "correctIndex": 3,
    "explanation": "Cụm Nhà thờ tại Nhà Lớn Long Sơn gồm Lầu Thánh, Lầu Tiên, Lầu Phật, Lầu Trời cùng nhiều nhà nối liền nhau bằng các cây cầu gỗ nhỏ và cùng quay mặt về khoảng sân trung tâm, biểu trưng cho sự gắn kết cộng đồng.",
    "sourceRef": "Tư liệu Khảo sát Kiến trúc Nhà Lớn Long Sơn"
  },
  {
    "id": 97,
    "code": "BRVT-DT-002",
    "siteId": "nha-lon-long-son",
    "siteName": "Quần thể kiến trúc Nhà Lớn Long Sơn",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Ngoài khu đền thờ, ông Lê Văn Mưu còn cho xây dựng hệ thống công trình dân sinh nào ngay trong quần thể Nhà Lớn Long Sơn để hỗ trợ cư dân tha hương đến lập nghiệp?",
    "options": [
      "Nhà khách (nhà phố cho dân nghèo ở tạm làm ăn), trường học dạy chữ, chợ, ngân hàng (nhà kho trữ lúa/tiền) và nhà giữ trẻ",
      "Các nhà máy đóng tàu sắt chạy bằng hơi nước",
      "Sân vận động và trường đua ngựa kiểu thuộc địa",
      "Các tòa cao ốc văn phòng cho thuê"
    ],
    "correctIndex": 0,
    "explanation": "Nhà Lớn Long Sơn không chỉ là nơi thờ tự mà còn là một mô hình xã hội tương trợ độc đáo gồm nhà khách cho người nghèo tạm trú đến khi khá giả thì nhường lại cho người khác, kèm trường học, chợ, kho lúa (ngân hàng) phục vụ dân làng.",
    "sourceRef": "Địa chí Bà Rịa – Vũng Tàu – NXB Khoa học Xã hội"
  },
  {
    "id": 98,
    "code": "BRVT-DT-002",
    "siteId": "nha-lon-long-son",
    "siteName": "Quần thể kiến trúc Nhà Lớn Long Sơn",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Thông hiểu",
    "audience": "thpt",
    "audienceLabel": "THPT (Cấp 3)",
    "question": "Quan niệm đạo đức và tập tục tang lễ bình đẳng độc đáo của Đạo Ông Trần được đúc kết qua câu nói nào?",
    "options": [
      "'Phú quý sinh lễ nghĩa' – tổ chức tang lễ linh đình kéo dài một tháng",
      "'Sống đồng tình đồng sàn, chết đồng quan đồng quách' – dùng chung một chiếc bao quan cho cả làng và mộ phần bình đẳng không phân sang hèn",
      "'Nhập gia tùy tục' – xây lăng mộ bằng đá cẩm thạch phân theo chức tước",
      "'Nhất tự vi sư' – chỉ thờ duy nhất các bậc tiến sĩ khoa bảng"
    ],
    "correctIndex": 1,
    "explanation": "Đạo Ông Trần đề cao lòng nhân ái, ngũ thường (Nhân – Lễ – Nghĩa – Trí – Tín) và tinh thần bình đẳng tuyệt đối: lúc sống cùng lao động sẻ chia, lúc mất dùng chung chiếc bao quan của làng đưa đi an táng, mộ phần bình dị bình đẳng không phô trương.",
    "sourceRef": "Nghiên cứu Tín ngưỡng Đạo Ông Trần ở Long Sơn – Viện Nghiên cứu Tôn giáo"
  },
  {
    "id": 99,
    "code": "BRVT-DT-002",
    "siteId": "nha-lon-long-son",
    "siteName": "Quần thể kiến trúc Nhà Lớn Long Sơn",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Xét về lịch sử hình thành các tín ngưỡng nội sinh Nam Bộ cuối thế kỷ XIX – đầu thế kỷ XX, Đạo Ông Trần có mối liên hệ tư tưởng chặt chẽ với mạch nguồn nào?",
    "options": [
      "Hệ thống nghi lễ cung đình khắt khe của triều đình phương Bắc",
      "Các giáo phái Cơ Đốc giáo Cải cách du nhập từ Bắc Âu",
      "Mạch nguồn tín ngưỡng Bửu Sơn Kỳ Hương – Tứ Ân Hiếu Nghĩa (phong trào yêu nước và khai hoang của nông dân miền Tây Nam Bộ) kết hợp tinh thần Tam giáo đồng nguyên",
      "Chủ nghĩa duy lý khoa học thuần túy loại bỏ hoàn toàn yếu tố thờ cúng tổ tiên"
    ],
    "correctIndex": 2,
    "explanation": "Xuất thân từ vùng Hà Tiên – Kiên Giang và gắn bó với truyền thống nghĩa quân nông dân miền Tây, ông Lê Văn Mưu đã mang tinh thần 'Tứ ân' (Ân tổ tiên cha mẹ, Ân đất nước, Ân Tam bảo, Ân đồng bào nhân loại) và Tam giáo đồng nguyên (Nho – Phật – Lão) ra xây dựng cộng đồng tự chủ tại đảo Long Sơn.",
    "sourceRef": "Nguyễn Văn Sâm & Huỳnh Ngọc Trảng – Tín ngưỡng Dân gian Nam Bộ"
  },
  {
    "id": 100,
    "code": "BRVT-DT-002",
    "siteId": "nha-lon-long-son",
    "siteName": "Quần thể kiến trúc Nhà Lớn Long Sơn",
    "region": "brvt",
    "topicId": "CD-06",
    "topicName": "Chuyên đề 6: Di sản Biển đảo, Kiến trúc Thuộc địa & Văn hóa Bản địa Bà Rịa – Vũng Tàu",
    "difficulty": "Vận dụng",
    "audience": "dai-hoc-giang-vien",
    "audienceLabel": "Đại học & Giảng viên",
    "question": "Từ góc độ kiến trúc cộng đồng và xã hội học di sản, Quần thể Nhà Lớn Long Sơn chứng minh mô hình tổ chức không gian nào rất đáng tham khảo cho nghiên cứu di sản bền vững?",
    "options": [
      "Mô hình kiến trúc khép kín tách biệt hoàn toàn với sinh kế của cư dân địa phương",
      "Mô hình sao chép rập khuôn quy hoạch đô thị công nghiệp châu Âu",
      "Mô hình thương mại hóa toàn bộ không gian thờ tự để bán vé trò chơi giải trí",
      "Mô hình 'Thiết chế cộng đồng tổng hợp' (tích hợp tâm linh – giáo dục – cứu tế – cư trú tạm thời – lễ hội bình đẳng), nhờ đó di tích được chính cộng đồng địa phương tự nguyện gìn giữ suốt hơn một thế kỷ"
    ],
    "correctIndex": 3,
    "explanation": "Sức sống bền bỉ hơn 100 năm của Nhà Lớn Long Sơn đến từ việc di sản gắn chặt với phúc lợi, đạo đức và ký ức tập thể của cộng đồng cư dân đảo (như lệ tổ chức miễn phí hoàn toàn ăn uống cho khách hành hương dịp Vía Ông 20/2 và Trùng Cửu 9/9 âm lịch).",
    "sourceRef": "Tạp chí Di sản Văn hóa – Nghiên cứu Bảo tồn dựa vào Cộng đồng (Long Sơn)"
  }
];

export function getQuestionsByTopic(topicId: QuizTopicId | 'all'): QuizQuestion[] {
  if (topicId === 'all') return QUIZ_QUESTIONS;
  return QUIZ_QUESTIONS.filter((q) => q.topicId === topicId);
}

export function getQuestionsByRegion(region: QuizRegion | 'all'): QuizQuestion[] {
  if (region === 'all') return QUIZ_QUESTIONS;
  return QUIZ_QUESTIONS.filter((q) => q.region === region);
}

export function getQuestionsByAudience(audience: QuizAudience | 'all'): QuizQuestion[] {
  if (audience === 'all') return QUIZ_QUESTIONS;
  return QUIZ_QUESTIONS.filter((q) => q.audience === audience);
}

export function getRandomExamQuestions(count = 20, audience: QuizAudience | 'all' = 'all'): QuizQuestion[] {
  const pool = getQuestionsByAudience(audience);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
