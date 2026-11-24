import {
  QUIZ_AUDIENCE_LEVELS,
  QUIZ_QUESTIONS,
  QUIZ_TOPICS,
  type QuizAudience,
  type QuizAudienceLevel,
  type QuizDifficulty,
  type QuizQuestion,
  type QuizTopic,
  type QuizTopicId,
} from './quizQuestions';
import { QUIZ_TRANSLATIONS_EN } from './quizTranslations.en';
import { QUIZ_TRANSLATIONS_ZH } from './quizTranslations.zh';

export type QuizLang = 'vi' | 'en' | 'zh';

export interface LocalizedQuizAudienceLevel extends QuizAudienceLevel {
  localizedDifficulty: string;
}

export interface LocalizedQuizQuestion extends QuizQuestion {
  localizedDifficulty: string;
}

const DIFFICULTY_LABELS: Record<QuizDifficulty, Record<QuizLang, string>> = {
  'Nhận biết': {
    vi: 'Nhận biết',
    en: 'Basic',
    zh: '基础',
  },
  'Thông hiểu': {
    vi: 'Thông hiểu',
    en: 'Intermediate',
    zh: '理解',
  },
  'Vận dụng': {
    vi: 'Vận dụng',
    en: 'Advanced',
    zh: '应用',
  },
};

const TOPIC_TRANSLATIONS: Record<
  QuizTopicId,
  {
    en: Pick<QuizTopic, 'title' | 'shortTitle' | 'regionScope' | 'description'>;
    zh: Pick<QuizTopic, 'title' | 'shortTitle' | 'regionScope' | 'description'>;
  }
> = {
  'CD-01': {
    en: {
      title: 'Topic 1: Civic, Public & Urban Architecture of Saigon – Gia Dinh',
      shortTitle: 'Saigon Urban & Civic Landmarks',
      regionScope: 'Ho Chi Minh City',
      description:
        'Explore 5 urban symbols of Saigon – HCMC (Independence Palace, Municipal Theatre, Central Post Office, Ben Thanh Market, Nha Rong Wharf) through history, urban planning, and tropical architecture.',
    },
    zh: {
      title: '专题 1：西贡–嘉定行政、公共与城市建筑遗产',
      shortTitle: '西贡城市与公共建筑',
      regionScope: '胡志明市',
      description:
        '从历史、城市规划与热带建筑视角，深入探索西贡–胡志明市五大标志性建筑（独立宫、市立大剧院、中央邮政局、滨城市场、龙屋港）。',
    },
  },
  'CD-02': {
    en: {
      title: 'Topic 2: Museums, Fine Arts & Protohistoric Archaeology of Southern Vietnam',
      shortTitle: 'Museums, Fine Arts & Archaeology',
      regionScope: 'Ho Chi Minh City',
      description:
        'Examine Indochine style, Art Deco architecture, and coastal protohistoric settlements through the HCMC History Museum, Museum of Fine Arts, and Giong Ca Vo Archaeological Site.',
    },
    zh: {
      title: '专题 2：南越博物馆建筑、美术与史前末期考古学',
      shortTitle: '博物馆、美术与考古遗存',
      regionScope: '胡志明市',
      description:
        '通过胡志明市历史博物馆、美术博物馆及榕卡沃考古遗址，研习印支风格、装饰艺术派建筑与沿海先民遗存。',
    },
  },
  'CD-03': {
    en: {
      title: 'Topic 3: Beliefs, Religion & Cultural Exchange in Saigon – Cho Lon',
      shortTitle: 'Beliefs & Cultural Exchange',
      regionScope: 'Ho Chi Minh City',
      description:
        'Study sacred spatial layouts, timber joinery, Cay Mai ceramic reliefs, and porcelain mosaic art at Giac Lam Pagoda, Lang Ong Ba Chieu, and Nghia An Assembly Hall.',
    },
    zh: {
      title: '专题 3：西贡–堤岸信仰、宗教与多元文化交融',
      shortTitle: '传统信仰与文化交融',
      regionScope: '胡志明市',
      description:
        '围绕觉林寺、巴沼翁陵与义安会馆，考察宗教空间格局、木构雕饰、梅树窑陶瓷与嵌瓷工艺。',
    },
  },
  'CD-04': {
    en: {
      title: 'Topic 4: Tunnel Systems & People’s War Engineering in Southeast Vietnam',
      shortTitle: 'Southeast Vietnam Tunnel Systems',
      regionScope: 'Inter-provincial (HCMC – Binh Duong – BR-VT)',
      description:
        'Analyze geological strata, subterranean military engineering, and historical value across three tunnel networks: Cu Chi, Iron Triangle (Ben Cat), and Long Phuoc (Ba Ria).',
    },
    zh: {
      title: '专题 4：越南东南部地道系统与人民战争地下工程',
      shortTitle: '东南部地道工程体系',
      regionScope: '跨省市（胡志明市 – 平阳 – 巴地头顿）',
      description:
        '剖析古芝、铁三角（笨葛）与龙福（巴地）三大地道群的地质结构、地下军事工程与历史意义。',
    },
  },
  'CD-05': {
    en: {
      title: 'Topic 5: Southern Vernacular Timber Houses & Thu Dau Mot Woodcarving',
      shortTitle: 'Southern Heritage House – Binh Duong',
      regionScope: 'Binh Duong Province',
      description:
        'Examine Tran Cong Vang Ancient House with its reversed-T ("Chu Dinh") plan, 48 mortise-and-tenon hardwood columns, and traditional mother-of-pearl inlay craftsmanship.',
    },
    zh: {
      title: '专题 5：南部传统木构古宅与土龙木雕刻艺术',
      shortTitle: '平阳南部古宅与木雕',
      regionScope: '平阳省',
      description:
        '深入考察陈公黄古宅的倒丁字形平面布局、48 根榫卯硬木柱架结构与传统螺钿镶嵌工艺。',
    },
  },
  'CD-06': {
    en: {
      title: 'Topic 6: Maritime Defense, Colonial Villas & Indigenous Heritage of Ba Ria – Vung Tau',
      shortTitle: 'Coastal & Cultural Heritage of Vung Tau',
      regionScope: 'Ba Ria – Vung Tau Province',
      description:
        'Explore coastal defense history, French architecture at Bach Dinh (Villa Blanche), and the communal belief model of Long Son Big House (Dao Ong Tran).',
    },
    zh: {
      title: '专题 6：巴地–头顿海防遗迹、殖民建筑与本土社区文化',
      shortTitle: '头顿海洋遗产与本土文化',
      regionScope: '巴地–头顿省',
      description:
        '探究海岸防务历史、白宫（Villa Blanche）法式建筑美学以及龙山大屋（翁陈教）独特的社区与信仰体系。',
    },
  },
};

const AUDIENCE_TRANSLATIONS: Record<
  QuizAudience,
  {
    en: { label: string; description: string };
    zh: { label: string; description: string };
  }
> = {
  thcs: {
    en: {
      label: 'Lower Secondary (Grades 6–9)',
      description:
        'Foundational historical and geographical knowledge, key dates, locations, and recognizable heritage traits.',
    },
    zh: {
      label: '初中（6–9 年级）',
      description: '掌握历史与地理基础知识、关键年代、地理位置及代表性遗产特征。',
    },
  },
  thpt: {
    en: {
      label: 'Upper Secondary (Grades 10–12)',
      description:
        'Analytical understanding of historical context, architectural structures, construction techniques, and cultural value.',
    },
    zh: {
      label: '高中（10–12 年级）',
      description: '深入分析历史背景、建筑构造、营造技术以及跨区域文化价值。',
    },
  },
  'dai-hoc-giang-vien': {
    en: {
      label: 'University & Lecturers',
      description:
        'Advanced heritage conservation, architectural syncretism, geology-archaeology, and interdisciplinary teaching methodology.',
    },
    zh: {
      label: '大学与高校讲师',
      description: '聚焦遗产保护理论、建筑文化交融、地质考古分析与跨学科教学方法。',
    },
  },
};

export function getLocalizedDifficultyLabel(difficulty: QuizDifficulty, lang: QuizLang): string {
  return DIFFICULTY_LABELS[difficulty]?.[lang] || difficulty;
}

export function getLocalizedQuizTopics(lang: QuizLang): QuizTopic[] {
  if (lang === 'vi') {
    return QUIZ_TOPICS;
  }
  return QUIZ_TOPICS.map((topic) => {
    const tr = TOPIC_TRANSLATIONS[topic.id]?.[lang];
    if (!tr) return topic;
    return {
      ...topic,
      ...tr,
    };
  });
}

export function getLocalizedAudienceLevels(lang: QuizLang): LocalizedQuizAudienceLevel[] {
  return QUIZ_AUDIENCE_LEVELS.map((level) => {
    const tr = lang === 'vi' ? null : AUDIENCE_TRANSLATIONS[level.id]?.[lang];
    return {
      ...level,
      label: tr ? tr.label : level.label,
      description: tr ? tr.description : level.description,
      localizedDifficulty: getLocalizedDifficultyLabel(level.difficulty, lang),
    };
  });
}

export function getLocalizedQuizQuestions(lang: QuizLang): LocalizedQuizQuestion[] {
  const topicMap = new Map(getLocalizedQuizTopics(lang).map((t) => [t.id, t.title]));
  const audienceMap = new Map(getLocalizedAudienceLevels(lang).map((a) => [a.id, a.label]));

  return QUIZ_QUESTIONS.map((q) => {
    const localizedDifficulty = getLocalizedDifficultyLabel(q.difficulty, lang);
    if (lang === 'vi') {
      return {
        ...q,
        localizedDifficulty,
      };
    }

    const tr = lang === 'en' ? QUIZ_TRANSLATIONS_EN[q.id] : QUIZ_TRANSLATIONS_ZH[q.id];
    return {
      ...q,
      siteName: tr?.siteName || q.siteName,
      topicName: topicMap.get(q.topicId) || q.topicName,
      audienceLabel: audienceMap.get(q.audience) || q.audienceLabel,
      localizedDifficulty,
      question: tr?.question || q.question,
      options: tr?.options || q.options,
      explanation: tr?.explanation || q.explanation,
      sourceRef: tr?.sourceRef || q.sourceRef,
    };
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildQuizWordDocHtml(params: {
  lang: QuizLang;
  questions: LocalizedQuizQuestion[];
  filterTitle: string;
  audienceTitle: string;
}): string {
  const { lang, questions, filterTitle, audienceTitle } = params;
  const letters = ['A', 'B', 'C', 'D'] as const;

  const copy =
    lang === 'en'
      ? {
          docTitle: 'Southeast Vietnam Heritage 100-Question Bank & Teaching Guide',
          systemLabel: 'DAU AN VIET 3D · ULTRA CLASSROOM HERITAGE ASSESSMENT BANK',
          filterLabel: 'Topic Scope',
          levelLabel: 'Audience Level',
          totalLabel: 'Question Count',
          part1Title: 'PART I. MULTIPLE-CHOICE QUESTIONS',
          part2Title: 'PART II. ANSWER KEY, EXPLANATIONS & ARCHIVAL SOURCES',
          colNo: 'No.',
          colCode: 'Site Code',
          colLevel: 'Level',
          colAnswer: 'Key',
          colExplanation: 'Historical / Architectural Explanation & Archival Source',
          sourcePrefix: 'Source',
          questionPrefix: 'Q',
        }
      : lang === 'zh'
      ? {
          docTitle: '越南东南部文化遗产 100 题库与标准答案解析',
          systemLabel: 'DAU AN VIET 3D · ULTRA 班级专享数字遗产测评题库',
          filterLabel: '专题范围',
          levelLabel: '适用学段',
          totalLabel: '题目数量',
          part1Title: '第一部分：选择题试题',
          part2Title: '第二部分：参考答案、详细解析与文献出处',
          colNo: '题号',
          colCode: '遗迹编号',
          colLevel: '级别',
          colAnswer: '答案',
          colExplanation: '史学与建筑解析及文献来源',
          sourcePrefix: '文献出处',
          questionPrefix: '第',
        }
      : {
          docTitle: 'Ngân Hàng 100 Câu Hỏi Trắc Nghiệm Di Sản Đông Nam Bộ & Đáp Án',
          systemLabel: 'DẤU ẤN VIỆT 3D · BỘ HỌC LIỆU ĐỘC QUYỀN GÓI ULTRA',
          filterLabel: 'Phạm vi chuyên đề',
          levelLabel: 'Cấp độ / Đối tượng',
          totalLabel: 'Số lượng câu hỏi',
          part1Title: 'PHẦN I. ĐỀ THI TRẮC NGHIỆM',
          part2Title: 'PHẦN II. BẢNG ĐÁP ÁN, GIẢI THÍCH CHUYÊN SÂU & NGUỒN TƯ LIỆU',
          colNo: 'STT',
          colCode: 'Mã di tích',
          colLevel: 'Cấp độ',
          colAnswer: 'Đáp án',
          colExplanation: 'Giải thích sử học / kiến trúc & Nguồn trích dẫn',
          sourcePrefix: 'Nguồn tư liệu',
          questionPrefix: 'Câu',
        };

  const questionsHtml = questions
    .map((q, index) => {
      const numLabel =
        lang === 'zh'
          ? `第 ${index + 1} 题`
          : `${copy.questionPrefix} ${String(index + 1).padStart(2, '0')}`;
      const optionsHtml = q.options
        .map(
          (opt, idx) =>
            `<p style="margin:2pt 0 2pt 16pt;font-size:11pt;"><strong>${letters[idx]}.</strong> ${escapeHtml(
              opt
            )}</p>`
        )
        .join('');

      return `
        <div style="margin-bottom:11pt;page-break-inside:avoid;">
          <p style="margin:0 0 3pt 0;font-size:11pt;">
            <strong style="color:#6E1D15;">${escapeHtml(numLabel)}</strong>
            <span style="color:#555555;"> [${escapeHtml(q.code)} · ${escapeHtml(
              q.siteName
            )} · ${escapeHtml(q.audienceLabel)} · ${escapeHtml(q.localizedDifficulty)}]</span>
          </p>
          <p style="margin:0 0 4pt 0;font-size:11.5pt;font-weight:bold;">${escapeHtml(
            q.question
          )}</p>
          ${optionsHtml}
        </div>`;
    })
    .join('');

  const answerRowsHtml = questions
    .map((q, index) => {
      const answerLetter = letters[q.correctIndex] || 'A';
      const answerText = q.options[q.correctIndex] || '';
      return `
        <tr>
          <td style="border:1px solid #888;padding:5pt;text-align:center;vertical-align:top;font-weight:bold;">${
            index + 1
          }</td>
          <td style="border:1px solid #888;padding:5pt;vertical-align:top;">${escapeHtml(
            q.code
          )}<br/><span style="font-size:9.5pt;color:#555;">${escapeHtml(
            q.siteName
          )}</span></td>
          <td style="border:1px solid #888;padding:5pt;vertical-align:top;">${escapeHtml(
            q.localizedDifficulty
          )}<br/><span style="font-size:9.5pt;color:#555;">${escapeHtml(
            q.audienceLabel
          )}</span></td>
          <td style="border:1px solid #888;padding:5pt;text-align:center;vertical-align:top;font-weight:bold;color:#6E1D15;">${answerLetter}</td>
          <td style="border:1px solid #888;padding:5pt;vertical-align:top;">
            <p style="margin:0 0 3pt 0;"><strong>${answerLetter}. ${escapeHtml(
              answerText
            )}</strong></p>
            <p style="margin:0 0 3pt 0;">${escapeHtml(q.explanation)}</p>
            <p style="margin:0;font-size:9.5pt;font-style:italic;color:#444;">${escapeHtml(
              copy.sourcePrefix
            )}: ${escapeHtml(q.sourceRef)}</p>
          </td>
        </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(copy.docTitle)}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: "Times New Roman", Times, serif; color: #171817; line-height: 1.42; }
    h1 { font-size: 16pt; color: #6E1D15; margin: 4pt 0 8pt 0; text-transform: uppercase; }
    h2 { font-size: 13pt; color: #171817; border-bottom: 1.5pt solid #6E1D15; padding-bottom: 3pt; margin: 16pt 0 10pt 0; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5pt; }
    th { background: #EDE3CE; border: 1px solid #888; padding: 6pt; text-align: left; }
  </style>
</head>
<body>
  <p style="font-size:10pt;font-weight:bold;letter-spacing:0.6pt;color:#8C281E;margin:0;">${escapeHtml(
    copy.systemLabel
  )}</p>
  <h1>${escapeHtml(copy.docTitle)}</h1>
  <p style="font-size:10.5pt;margin:0 0 12pt 0;padding:8pt;background:#F7F2E9;border:1px solid #DCD3C3;">
    <strong>${escapeHtml(copy.filterLabel)}:</strong> ${escapeHtml(filterTitle)} &nbsp;|&nbsp;
    <strong>${escapeHtml(copy.levelLabel)}:</strong> ${escapeHtml(audienceTitle)} &nbsp;|&nbsp;
    <strong>${escapeHtml(copy.totalLabel)}:</strong> ${questions.length}
  </p>

  <h2>${escapeHtml(copy.part1Title)}</h2>
  ${questionsHtml}

  <br clear="all" style="page-break-before:always;" />
  <h2>${escapeHtml(copy.part2Title)}</h2>
  <table>
    <thead>
      <tr>
        <th style="width:7%;text-align:center;">${escapeHtml(copy.colNo)}</th>
        <th style="width:16%;">${escapeHtml(copy.colCode)}</th>
        <th style="width:15%;">${escapeHtml(copy.colLevel)}</th>
        <th style="width:7%;text-align:center;">${escapeHtml(copy.colAnswer)}</th>
        <th style="width:55%;">${escapeHtml(copy.colExplanation)}</th>
      </tr>
    </thead>
    <tbody>
      ${answerRowsHtml}
    </tbody>
  </table>
</body>
</html>`;
}
