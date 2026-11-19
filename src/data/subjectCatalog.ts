import { HSC_ACCOUNTING_2ND_PAPER_CHAPTERS } from './syllabusData';
import { HSC_ACCOUNTING_1ST_PAPER_CHAPTERS } from './accounting1Data';
import { HSC_BANGLA_1ST_ALL_2000_CHAPTERS } from './bangla1Batch4PoetryData';
import { HSC_ICT_CHAPTERS } from './hscIctData';
import { HSC_FINANCE_1ST_PART1_CHAPTERS } from './Finance1part1data';
import { HSC_FINANCE_1ST_PART2_CHAPTERS } from './Finance1part2data';
import { HSC_FINANCE_2ND_PART1_CHAPTERS } from './Finance2part1data';
import { HSC_FINANCE_2ND_PART2_CHAPTERS } from './Finance2part2data';
import { HSC_BOM_1ST_PAPER_CHAPTERS } from './bom1Part3Data';
import { HSC_MKT_1ST_PAPER_CHAPTERS } from './mkt1Data';
import { HSC_MATH1_ALL_CHAPTERS } from './math1CqPart3Data';
import {
  ChapterData,
  ChapterFormula,
  CQFormat,
  CQMarks,
  CQQuestion,
  MCQQuestion,
  SubjectData,
} from '../types';

export interface MCQ {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  board?: string;
}

export interface CQ {
  id: string;
  format?: CQFormat;
  title?: string;
  stem: string;
  board?: string;
  qA: string;
  ansA: string;
  qB?: string;
  ansB?: string;
  qC?: string;
  ansC?: string;
  qD?: string;
  ansD?: string;
  marks?: CQMarks;
}

export interface Chapter {
  id: string;
  name: string;
  mcqs: MCQ[];
  cqs: CQ[];
  formulas?: string[];
}

export const HSC_FINANCE_1ST_PAPER_CHAPTERS: Chapter[] = [
  ...HSC_FINANCE_1ST_PART1_CHAPTERS,
  ...HSC_FINANCE_1ST_PART2_CHAPTERS,
];

export const HSC_FINANCE_2ND_PAPER_CHAPTERS: Chapter[] = [
  ...HSC_FINANCE_2ND_PART1_CHAPTERS,
  ...HSC_FINANCE_2ND_PART2_CHAPTERS,
];

export { HSC_ACCOUNTING_1ST_PAPER_CHAPTERS, HSC_ICT_CHAPTERS, HSC_MATH1_ALL_CHAPTERS };

const NON_MATH_CHAPTER_IDS = new Set(['acc1-c5', 'fin1-c1', 'fin1-c2']);

export function subjectSupportsFormulas(subj?: SubjectData | null): boolean {
  if (!subj || !Array.isArray(subj.chapters)) return false;
  return subj.chapters.some((c) => Array.isArray(c.formulas) && c.formulas.length > 0);
}

export function convertLegacyChapters(
  chapters: Chapter[],
  subjPrefix: string,
  allowFormulas = true
): ChapterData[] {
  return (chapters || []).map((ch, cIdx): ChapterData => {
    const rawFormulas = allowFormulas && !NON_MATH_CHAPTER_IDS.has(ch.id) ? ch.formulas || [] : [];
    const formulas: ChapterFormula[] = rawFormulas.map((fStr, fIdx) => {
      const parts = fStr.split(':');
      const hasTitle = parts.length > 1 && parts[0].length < 52;
      const titleText = hasTitle ? parts[0].trim() : `সূত্র #${fIdx + 1}`;
      const bodyText = hasTitle ? parts.slice(1).join(':').trim() : fStr;
      return {
        id: `${subjPrefix}-f-${cIdx + 1}-${fIdx + 1}`,
        title: { bn: titleText, en: titleText },
        formula: bodyText,
        equation: bodyText,
      };
    });

    const mcqs: MCQQuestion[] = (ch.mcqs || []).map((m): MCQQuestion => ({
      id: m.id,
      q: { bn: m.question, en: m.question },
      options: { bn: [...m.options], en: [...m.options] },
      ans: m.correctIndex,
      explanation: { bn: m.explanation || '', en: m.explanation || '' },
      boardTag: m.board,
      board: m.board,
    }));

    const cqs: CQQuestion[] = (ch.cqs || []).map((c): CQQuestion => ({
      id: c.id,
      format: c.format,
      title: c.title ? { bn: c.title, en: c.title } : undefined,
      stem: { bn: c.stem, en: c.stem },
      a: { bn: c.qA, en: c.qA },
      b: c.qB ? { bn: c.qB, en: c.qB } : undefined,
      c: c.qC ? { bn: c.qC, en: c.qC } : undefined,
      d: c.qD ? { bn: c.qD, en: c.qD } : undefined,
      ansA: { bn: c.ansA, en: c.ansA },
      ansB: c.ansB ? { bn: c.ansB, en: c.ansB } : undefined,
      ansC: c.ansC ? { bn: c.ansC, en: c.ansC } : undefined,
      ansD: c.ansD ? { bn: c.ansD, en: c.ansD } : undefined,
      marks: c.marks,
      boardTag: c.board,
      board: c.board,
    }));

    return {
      id: ch.id,
      name: { bn: ch.name, en: ch.name },
      mcqs,
      cqs,
      formulas,
    };
  });
}

const ch = (id: string, name: string, formulas: string[] = []): Chapter => ({
  id,
  name,
  mcqs: [],
  cqs: [],
  formulas,
});

const mkSubj = (
  id: string,
  bn: string,
  en: string,
  icon: string,
  color: string,
  rgb: string,
  chapters: Chapter[],
  allowFormulas = true
): SubjectData => ({
  id,
  name: { bn, en },
  icon,
  color,
  rgb,
  chapters: convertLegacyChapters(chapters, id, allowFormulas),
});

const _S01: SubjectData = {
  id: 'hsc-bn-1',
  name: { bn: 'বাংলা ১ম পত্র', en: 'Bangla 1st Paper' },
  icon: '📖',
  color: '#E11D48',
  rgb: '225, 29, 72',
  chapters: convertLegacyChapters(HSC_BANGLA_1ST_ALL_2000_CHAPTERS, 'bn1', false),
};

const _S02 = mkSubj(
  'hsc-bn-2',
  'বাংলা ২য় পত্র',
  'Bangla 2nd Paper',
  '✍️',
  '#059669',
  '5, 150, 105',
  [
    ch('bn2-c1', '১ম ও ২য় অধ্যায়: বাংলা উচ্চারণের নিয়ম ও বাংলা বানানের নিয়ম'),
    ch('bn2-c2', '৩য় ও ৪র্থ অধ্যায়: ব্যাকরণিক শব্দশ্রেণি, উপসর্গ, প্রত্যয় ও সমাস'),
    ch('bn2-c3', '৫ম ও ৬ষ্ঠ অধ্যায়: বাক্যতত্ত্ব এবং বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ'),
    ch('bn2-c4', 'নির্মিতি অংশ: পারিভাষিক শব্দ, অনুবাদ, দিনলিপি, প্রতিবেদন, ই-মেইল, আবেদনপত্র, সারাংশ, ভাবসম্প্রসারণ ও প্রবন্ধ'),
  ],
  false
);

const _S03 = mkSubj(
  'hsc-en-1',
  'ইংরেজি ১ম পত্র',
  'English 1st Paper',
  '🌐',
  '#2563EB',
  '37, 99, 235',
  [
    ch('en1-c1', 'Unit 1–5: People Making History, Dreams, Lifestyle, Adolescence & Youthful Achievers'),
    ch('en1-c2', 'Unit 6–10: Relationships, Human Rights, Environment & Nature, Folk Art & Myths'),
    ch('en1-c3', 'Part B: Flow Chart, Summary Writing, Cloze Test, Rearranging & Graph/Chart Analysis'),
  ],
  false
);

const _S04 = mkSubj(
  'hsc-en-2',
  'ইংরেজি ২য় পত্র',
  'English 2nd Paper',
  '🔤',
  '#1D4ED8',
  '29, 78, 216',
  [
    ch('en2-c1', 'Grammar Part 1: Articles, Prepositions, Special Phrases & Completing Sentences'),
    ch('en2-c2', 'Grammar Part 2: Right Form of Verbs, Narration, Modifiers, Connectors, Synonym-Antonym & Punctuation'),
    ch('en2-c3', 'Composition Part: Formal Application, E-mail, Report Writing, Paragraph & Essay'),
  ],
  false
);

const _S05: SubjectData = {
  id: 'hsc-ict',
  name: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি', en: 'ICT' },
  icon: '💻',
  color: '#0284C7',
  rgb: '2, 132, 199',
  chapters: convertLegacyChapters(HSC_ICT_CHAPTERS, 'h-ict', true),
};

const _S06: SubjectData = {
  id: 'acc-1',
  name: { bn: 'হিসাববিজ্ঞান ১ম পত্র', en: 'Accounting 1st Paper' },
  icon: '📘',
  color: '#4F46E5',
  rgb: '79, 70, 229',
  chapters: convertLegacyChapters(HSC_ACCOUNTING_1ST_PAPER_CHAPTERS, 'acc1', true),
};

const _S07: SubjectData = {
  id: 'acc-2',
  name: { bn: 'হিসাববিজ্ঞান ২য় পত্র', en: 'Accounting 2nd Paper' },
  icon: '📊',
  color: '#D97706',
  rgb: '217, 119, 6',
  chapters: convertLegacyChapters(HSC_ACCOUNTING_2ND_PAPER_CHAPTERS, 'acc2', true),
};

const _S08: SubjectData = {
  id: 'bom-1',
  name: { bn: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম', en: 'Business Org. & Management 1st' },
  icon: '🏢',
  color: '#059669',
  rgb: '5, 150, 105',
  chapters: convertLegacyChapters(HSC_BOM_1ST_PAPER_CHAPTERS, 'bom1', true),
};

const _S09 = mkSubj(
  'bom-2',
  'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য়',
  'Business Org. & Management 2nd',
  '📋',
  '#0D9488',
  '13, 148, 136',
  [
    ch('bom2-c1', '১ম–৩য় অধ্যায়: ব্যবস্থাপনার ধারণা, ব্যবস্থাপনার নীতি ও পরিকল্পনা প্রণয়ন'),
    ch('bom2-c2', '৪র্থ–৭ম অধ্যায়: সাংগঠনিক কাঠামো, কর্মীসংস্থান, নেতৃত্ব ও প্রেষণা'),
    ch('bom2-c3', '৮ম–১০ম অধ্যায়: যোগাযোগ, সমন্বয় সাধন ও নিয়ন্ত্রণ'),
  ],
  false
);

const _S10: SubjectData = {
  id: 'fin-1',
  name: { bn: 'ফিন্যান্স, ব্যাংকিং ও বিমা ১ম', en: 'Finance, Banking & Insurance 1st' },
  icon: '💰',
  color: '#7C3AED',
  rgb: '124, 58, 237',
  chapters: convertLegacyChapters(HSC_FINANCE_1ST_PAPER_CHAPTERS, 'fin1', true),
};

const _S11: SubjectData = {
  id: 'fin-2',
  name: { bn: 'ফিন্যান্স, ব্যাংকিং ও বিমা ২য়', en: 'Finance, Banking & Insurance 2nd' },
  icon: '🏦',
  color: '#2563EB',
  rgb: '37, 99, 235',
  chapters: convertLegacyChapters(HSC_FINANCE_2ND_PAPER_CHAPTERS, 'fin2', false),
};

const _S12: SubjectData = {
  id: 'mkt-1',
  name: { bn: 'উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম', en: 'Production Mgmt. & Marketing 1st' },
  icon: '🏭',
  color: '#D97706',
  rgb: '217, 119, 6',
  chapters: convertLegacyChapters(HSC_MKT_1ST_PAPER_CHAPTERS, 'mkt1', true),
};

const _S13 = mkSubj(
  'mkt-2',
  'উৎপাদন ব্যবস্থাপনা ও বিপণন ২য়',
  'Production Mgmt. & Marketing 2nd',
  '🛒',
  '#EA580C',
  '234, 88, 12',
  [
    ch('mkt2-c1', '১ম–৫ম অধ্যায়: বিপণন পরিচিতি, বিপণন পরিবেশ, কার্যাবলি, বাজার বিভক্তিকরণ ও বিপণন মিশ্রণ (4Ps)'),
    ch('mkt2-c2', '৬ষ্ঠ–১০ম অধ্যায়: পণ্য বণ্টন প্রণালি, পাইকারি ও খুচরা ব্যবসায়, বিজ্ঞাপন, ব্যক্তিক বিক্রয় ও সমসাময়িক বিপণন'),
  ],
  false
);

const _S14 = mkSubj(
  'phy-1',
  'পদার্থবিজ্ঞান ১ম পত্র',
  'Physics 1st Paper',
  '⚛️',
  '#4F46E5',
  '79, 70, 229',
  [
    ch('phy1-c1', '১ম ও ২য় অধ্যায়: ভৌত জগৎ ও পরিমাপ এবং ভেক্টর', [
      'ভেক্টর লব্ধির মান ও দিক: R = √(P² + Q² + 2PQ cosα), tanθ = (Q sinα) ÷ (P + Q cosα)',
      'ডট ও ক্রস গুণন এবং নদী-নৌকা: A · B = AB cosθ, |A × B| = AB sinθ | ন্যূনতম সময়ে নদী পারাপার t_min = d ÷ v',
    ]),
    ch('phy1-c2', '৩য় ও ৪র্থ অধ্যায়: গতিবিদ্যা ও নিউটনীয় বলবিদ্যা', [
      'প্রাসের সমীকরণ: সর্বাধিক উচ্চতা H = (v₀² sin²θ₀) ÷ 2g, বিচরণকাল T = (2v₀ sinθ₀) ÷ g, পাল্লা R = (v₀² sin 2θ₀) ÷ g',
      'বলবিদ্যা, টর্ক ও ব্যাংকিং কোণ: F = ma, L = Iω, τ = Iα, কেন্দ্রমুখী বল Fc = mv² ÷ r, ব্যাংকিং কোণ tanθ = v² ÷ rg = h ÷ w',
    ]),
    ch('phy1-c3', '৫ম, ৬ষ্ঠ ও ৭ম অধ্যায়: কাজ-শক্তি-ক্ষমতা, মহাকর্ষ ও অভিকর্ষ এবং পদার্থের গাঠনিক ধর্ম', [
      'কাজ, গতিশক্তি ও কর্মদক্ষতা: W = Fs cosθ, Ek = ½mv² = p² ÷ 2m, স্প্রিং শক্তি Ep = ½kx², দক্ষতা η = (কার্যকর ক্ষমতা ÷ প্রদত্ত ক্ষমতা) × 100%',
      'মহাকর্ষ ও স্থিতিস্থাপকতা: মুক্তিবেগ ve = √(2gR) ≈ 11.2 km/s, উচ্চতায় g′ = g[R/(R+h)]², গভীরতায় g′ = g(1 - d/R) | ইয়ংয়ের গুণাঙ্ক Y = FL ÷ (AΔl)',
    ]),
    ch('phy1-c4', '৮ম, ৯ম ও ১০ম অধ্যায়: পর্যায়বৃত্ত গতি, তরঙ্গ এবং আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', [
      'সরল ছন্দিত গতি ও দোলক: বেগ v = ω√(A² - x²), ত্বরণ a = -ω²x, সরল দোলকের দোলনকাল T = 2π√(L ÷ g)',
      'তরঙ্গ ও আদর্শ গ্যাস: v = fλ, বিট N = |f₁ - f₂|, তীব্রতা লেভেল β = 10 log₁₀(I/I₀) dB | PV = nRT, RMS বেগ c = √(3RT/M) = √(3P/ρ), গতিশক্তি E = (3/2)nRT',
    ]),
  ]
);

const _S15 = mkSubj(
  'phy-2',
  'পদার্থবিজ্ঞান ২য় পত্র',
  'Physics 2nd Paper',
  '⚡',
  '#0284C7',
  '2, 132, 199',
  [
    ch('phy2-c1', '১ম, ২য় ও ৩য় অধ্যায়: তাপগতিবিদ্যা, স্থির তড়িৎ ও চল তড়িৎ', [
      'তাপগতিবিদ্যা ও কার্নো ইঞ্জিন: dQ = dU + P dV, রুদ্ধতাপীয় প্রক্রিয়া PV^γ = ধ্রুবক, দক্ষতা η = (1 - T₂/T₁) × 100%, এনট্রপি dS = dQ ÷ T',
      'স্থির ও চল তড়িৎ: কুলম্ব বল F = (1/4πε₀)(q₁q₂/r²), ধারকের শক্তি U = ½CV², জুলের তাপ H = I²Rt, শান্ট প্রবাহ Is = IG ÷ (G + S), হুইটস্টোন ব্রিজ P/Q = R/S',
    ]),
    ch('phy2-c2', '৪র্থ, ৫ম, ৬ষ্ঠ ও ৭ম অধ্যায়: চৌম্বক ক্রিয়া, তাড়িতচৌম্বক আবেশ, জ্যামিতিক ও ভৌত আলোকবিজ্ঞান', [
      'চুম্বক ও পরিবর্তী প্রবাহ: B = μ₀I ÷ (2πa), লরেন্টজ বল F = qvB sinθ, ফ্যারাডের সূত্র ε = -N(dΦ/dt), RMS প্রবাহ I_rms = I₀ ÷ √2 = 0.707 I₀',
      'লেন্স, প্রিজম ও ব্যতিচার: 1/f = (μ - 1)(1/r₁ - 1/r₂), প্রিজম μ = sin[(A+δm)/2] ÷ sin(A/2) | ডোরার ব্যবধান Δx = λD ÷ a, প্রস্থ = λD ÷ 2a',
    ]),
    ch('phy2-c3', '৮ম–১১শ অধ্যায়: আধুনিক পদার্থবিজ্ঞান, নিউক্লিয়ার পদার্থবিজ্ঞান, সেমিকন্ডাক্টর ও জ্যোতির্বিজ্ঞান', [
      'আপেক্ষিকতা ও কোয়ান্টাম: কাল দীর্ঘায়ন t = t₀ ÷ √(1 - v²/c²), E = mc², ফটোইলেকট্রিক সমীকরণ hf = hf₀ + Ek(max), ডি ব্রগলি λ = h ÷ mv',
      'তেজস্ক্রিয়তা ও ট্রানজিস্টর: N = N₀e^(-λt), অর্ধায়ু T_½ = 0.693 ÷ λ, গড় আয়ু τ = 1 ÷ λ | ট্রানজিস্টর IE = IB + IC, প্রবাহ বিবর্ধন β = IC ÷ IB',
    ]),
  ]
);

const _S16 = mkSubj(
  'chem-1',
  'রসায়ন ১ম পত্র',
  'Chemistry 1st Paper',
  '🧪',
  '#059669',
  '5, 150, 105',
  [
    ch('chem1-c1', '১ম অধ্যায়: ল্যাবরেটরির নিরাপদ ব্যবহার'),
    ch('chem1-c2', '২য় অধ্যায়: গুণগত রসায়ন', [
      'বোর মডেল ও রিডবার্গ সমীকরণ: কৌণিক ভরবেগ mvr = nh ÷ 2π | 1/λ = R_H × Z² × (1/n₁² - 1/n₂²) [যেখানে R_H = 109678 cm⁻¹]',
      'দ্রাব্যতা ও দ্রাব্যতা গুণফল: AxBy লবণের জন্য Ksp = x^x · y^y · S^(x+y) [AB এর জন্য S², AB₂ এর জন্য 4S³, AB₃ এর জন্য 27S⁴]',
    ]),
    ch('chem1-c3', '৩য় অধ্যায়: মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', [
      'সংকরায়ন (Hybridization) সংখ্যা নির্ণয়: H = ½ [কেন্দ্রীয় পরমাণুর যোজ্যতা ইলেকট্রন + একযোজী পরমাণু - ক্যাটায়ন চার্জ + অ্যানায়ন চার্জ]',
    ]),
    ch('chem1-c4', '৪র্থ অধ্যায়: রাসায়নিক পরিবর্তন', [
      'সাম্যধ্রুবক ও pH সমীকরণ: Kp = Kc(RT)^Δn | pH = -log₁₀[H⁺], pOH = -log₁₀[OH⁻], pH + pOH = 14',
      'হেন্ডারসন-হ্যাসেলবাক বাফার সমীকরণ: অম্লীয় বাফার pH = pKa + log₁₀([লবণ] ÷ [অম্ল]) | ক্ষারীয় বাফার pOH = pKb + log₁₀([লবণ] ÷ [ক্ষার])',
    ]),
    ch('chem1-c5', '৫ম অধ্যায়: কর্মমুখী রসায়ন'),
  ]
);

const _S17 = mkSubj(
  'chem-2',
  'রসায়ন ২য় পত্র',
  'Chemistry 2nd Paper',
  '⚗️',
  '#0D9488',
  '13, 148, 136',
  [
    ch('chem2-c1', '১ম অধ্যায়: পরিবেশ রসায়ন', [
      'গ্যাস সূত্রসমূহ: P₁V₁ ÷ T₁ = P₂V₂ ÷ T₂ | আদর্শ গ্যাস PV = nRT = (w/M)RT | ঘনত্ব d = PM ÷ RT',
      'গ্রাহামের ব্যাপন ও ভ্যানডার ওয়ালস সূত্র: r₁ ÷ r₂ = √(M₂ ÷ M₁) = √(d₂ ÷ d₁) | (P + n²a/V²)(V - nb) = nRT',
    ]),
    ch('chem2-c2', '২য় অধ্যায়: জৈব রসায়ন'),
    ch('chem2-c3', '৩য় অধ্যায়: পরিমাণগত রসায়ন', [
      'মোলারিটি, শতকরা হার ও পিপিএম: S = (1000 × w) ÷ (M × V_mL) | S = (10 × x%) ÷ M | ppm = S × M × 1000',
      'টাইট্রেশন ও বিয়ার-ল্যাম্বার্ট সূত্র: e₁V₁S₁ = e₂V₂S₂ | শোষণ A = log₁₀(I₀ ÷ I) = ε c l',
    ]),
    ch('chem2-c4', '৪র্থ অধ্যায়: তড়িৎ রসায়ন', [
      'ফ্যারাডের তড়িৎ বিশ্লেষণ সূত্র: W = ZIt = (M × I × t) ÷ (n × F) [যেখানে 1 Faraday (F) = 96500 কুলম্ব]',
      'প্রমাণ কোষ বিভব ও নার্নস্ট সমীকরণ (25°C): E°_cell = E°_anode(ox) + E°_cathode(red) | E_cell = E°_cell - (0.0592 ÷ n) log₁₀ Q',
    ]),
    ch('chem2-c5', '৫ম অধ্যায়: অর্থনৈতিক রসায়ন'),
  ]
);

const _S18: SubjectData = {
  id: 'math-1',
  name: { bn: 'উচ্চতর গণিত ১ম পত্র', en: 'Higher Math 1st Paper' },
  icon: '📐',
  color: '#D97706',
  rgb: '217, 119, 6',
  chapters: convertLegacyChapters(HSC_MATH1_ALL_CHAPTERS, 'math1', true),
};

const _S19 = mkSubj(
  'math-2',
  'উচ্চতর গণিত ২য় পত্র',
  'Higher Math 2nd Paper',
  '♾️',
  '#E11D48',
  '225, 29, 72',
  [
    ch('math2-c1', '১ম–৬ষ্ঠ অধ্যায়: বাস্তব সংখ্যা, যোগাশ্রয়ী প্রোগ্রাম, জটিল সংখ্যা, বহুপদী, দ্বিপদী বিস্তৃতি ও কণিক', [
      'জটিল সংখ্যা, বহুপদী ও দ্বিপদী: মডুলাস r = √(x² + y²), 1 + ω + ω² = 0, ω³ = 1 | α + β = -b/a, αβ = c/a, D = b² - 4ac | সাধারণ পদ T_(r+1) = ⁿCᵣ aⁿ⁻ʳ xʳ',
      'কণিক (পরাবৃত্ত, উপবৃত্ত ও অধিবৃত্ত): পরাবৃত্ত y² = 4ax এর উপকেন্দ্র (a,0) ও উপকেন্দ্রিক লম্ব 4a | উপবৃত্তের উৎকেন্দ্রিকতা e = √(1 - b²/a²) < 1',
    ]),
    ch('math2-c2', '৭ম–১০ম অধ্যায়: বিপরীত ত্রিকোণমিতিক ফাংশন, স্থিতিবিদ্যা, সমতলে বস্তুকণার গতি ও সম্ভাবনা', [
      'বিপরীত ত্রিকোণমিতি ও স্থিতিবিদ্যা: tan⁻¹x + tan⁻¹y = tan⁻¹[(x + y) ÷ (1 - xy)] | লামির উপপাদ্য P/sinα = Q/sinβ = R/sinγ',
      'গতিবিদ্যা ও সম্ভাবনা: প্রাসের উচ্চতা H = (u² sin²α)/2g, পাল্লা R = (u² sin 2α)/g | পরিমিত ব্যবধান σ = √[Σx²/n - (Σx/n)²]',
    ]),
  ]
);

const _S20 = mkSubj(
  'bio-1',
  'জীববিজ্ঞান ১ম পত্র',
  'Biology 1st Paper',
  '🌿',
  '#10B981',
  '16, 185, 129',
  [
    ch('bio1-c1', '১ম–৬ষ্ঠ অধ্যায়: কোষ ও এর গঠন, কোষ বিভাজন, কোষ রসায়ন, অণুজীব, শৈবাল-ছত্রাক ও ব্রায়োফাইটা-টেরিডোফাইটা'),
    ch('bio1-c2', '৭ম–১২শ অধ্যায়: নগ্নবীজী ও আবৃতবীজী, টিস্যুতন্ত্র, উদ্ভিদ শারীরতত্ত্ব, প্রজনন, জীবপ্রযুক্তি ও পরিবেশ'),
  ],
  false
);

const _S21 = mkSubj(
  'bio-2',
  'জীববিজ্ঞান ২য় পত্র',
  'Biology 2nd Paper',
  '🧬',
  '#059669',
  '5, 150, 105',
  [
    ch('bio2-c1', '১ম–৬ষ্ঠ অধ্যায়: প্রাণীর শ্রেণিবিন্যাস, হাইড্রা-ঘাসফড়িং-রুই মাছ, পরিপাক ও শোষণ, রক্ত সংবহন, শ্বসন ও রেচন'),
    ch('bio2-c2', '৭ম–১২শ অধ্যায়: চলন ও অঙ্গচালনা, সমন্বয় ও নিয়ন্ত্রণ, প্রতিরক্ষা, জিনতত্ত্ব ও বিবর্তন এবং প্রাণীর আচরণ'),
  ],
  false
);

const _S22 = mkSubj(
  'eco-1',
  'অর্থনীতি ১ম পত্র',
  'Economics 1st Paper',
  '📈',
  '#4F46E5',
  '79, 70, 229',
  [
    ch('eco1-c1', '১ম অধ্যায়: মৌলিক অর্থনৈতিক সমস্যা এবং এর সমাধান'),
    ch('eco1-c2', '২য় অধ্যায়: ভোক্তা ও উৎপাদকের আচরণ — চাহিদা ও যোগান', [
      'চাহিদা, যোগান ও ভারসাম্য সমীকরণ: Qd = a - bP এবং Qs = c + dP (বাজার ভারসাম্যে Qd = Qs)',
      'চাহিদার স্থিতিস্থাপকতা: দাম স্থিতিস্থাপকতা Ed = (ΔQ ÷ ΔP) × (P ÷ Q) | প্রান্তিক উপযোগ MU = ΔTU ÷ ΔQ',
    ]),
    ch('eco1-c3', '৩য় অধ্যায়: উৎপাদন, উৎপাদন ব্যয় ও আয়', [
      'ব্যয় ও আয় সমীকরণ: TC = TFC + TVC, গড় ব্যয় AC = TC ÷ Q, প্রান্তিক ব্যয় MC = ΔTC ÷ ΔQ | মোট আয় TR = P × Q, MR = ΔTR ÷ ΔQ',
    ]),
    ch('eco1-c4', '৪র্থ–৮ম অধ্যায়: বাজার, শ্রমবাজার, মূলধন, সংগঠন ও খাজনা'),
    ch('eco1-c9', '৯ম ও ১০ম অধ্যায়: সামগ্রিক আয় ও ব্যয় এবং মুদ্রা ও ব্যাংক', [
      'জাতীয় আয় ও বিনিয়োগ গুণক: GDP = C + I + G + (X - M), ভোগ অপেক্ষক C = a + bY, গুণক k = 1 ÷ (1 - MPC) = 1 ÷ MPS',
      'ফিশারের মুদ্রার পরিমাণ তত্ত্ব: MV = PT বা MV + M′V′ = PT (অর্থের মূল্য Vm = 1 ÷ P)',
    ]),
  ]
);

const _S23 = mkSubj(
  'eco-2',
  'অর্থনীতি ২য় পত্র',
  'Economics 2nd Paper',
  '🌾',
  '#059669',
  '5, 150, 105',
  [
    ch('eco2-c1', '১ম, ২য় ও ৩য় অধ্যায়: বাংলাদেশের অর্থনীতি পরিচয়, কৃষি ও শিল্প'),
    ch('eco2-c4', '৪র্থ অধ্যায়: জনসংখ্যা, মানবসম্পদ ও আত্মকর্মসংস্থান', [
      'জনসংখ্যার ঘনত্ব ও স্বাভাবিক বৃদ্ধির হার: জনসংখ্যার ঘনত্ব = মোট জনসংখ্যা ÷ মোট ভূমির আয়তন (বর্গ কিমি) | বৃদ্ধির হার = (CBR - CDR) ÷ 10',
    ]),
    ch('eco2-c5', '৫ম ও ৬ষ্ঠ অধ্যায়: খাদ্য নিরাপত্তা ও অর্থায়ন'),
    ch('eco2-c7', '৭ম অধ্যায়: মুদ্রাস্ফীতি', [
      'মুদ্রাস্ফীতির হার নির্ণয়: মুদ্রাস্ফীতির হার = [(চলতি বছরের দাম সূচক CPI₂ - ভিত্তি বছরের দাম সূচক CPI₁) ÷ CPI₁] × ১০০%',
    ]),
    ch('eco2-c8', '৮ম, ৯ম ও ১০ম অধ্যায়: আন্তর্জাতিক বাণিজ্য, সরকারি অর্থব্যবস্থা ও উন্নয়ন পরিকল্পনা'),
  ]
);

const _S24 = mkSubj(
  'stat-1',
  'পরিসংখ্যান ১ম পত্র',
  'Statistics 1st Paper',
  '📊',
  '#0284C7',
  '2, 132, 199',
  [
    ch('stat1-c1', '১ম ও ২য় অধ্যায়: চলক, প্রতীক ও তথ্য উপস্থাপন', [
      'শ্রেণিসংখ্যা ও শ্রেণিব্যাপ্তি (স্টার্জেসের সূত্র): k = 1 + 3.322 log₁₀N এবং শ্রেণিব্যাপ্তি c = পরিসর (R) ÷ k',
    ]),
    ch('stat1-c2', '৩য় ও ৪র্থ অধ্যায়: কেন্দ্রীয় প্রবণতা ও বিস্তার পরিমাপ', [
      'গাণিতিক, জ্যামিতিক ও তরঙ্গ গড়: AM = Σx ÷ n, GM = (x₁·x₂...xₙ)^(1/n), HM = n ÷ Σ(1/x) | AM × HM = (GM)² | Mode = 3 Median - 2 Mean',
      'পরিমিত ব্যবধান ও বিভেদাঙ্ক: σ = √[Σ(x - x̄)² ÷ n] | প্রথম n স্বাভাবিক সংখ্যার σ = √[(n² - 1) ÷ 12] | বিভেদাঙ্ক CV = (σ ÷ x̄) × 100%',
    ]),
    ch('stat1-c3', '৫ম–৮ম অধ্যায়: পরিঘাত ও বঙ্কিমতা, সংশ্লেষ ও নির্ভরণ, কালীন সারি এবং সূচক সংখ্যা', [
      'সংশ্লেষ ও নির্ভরণ সহগ: -1 ≤ r ≤ +1 এবং r = ±√(b_yx × b_xy) | ফিশারের আদর্শ সূচক সংখ্যা P₀₁(F) = √(L × P)',
    ]),
  ]
);

const _S25 = mkSubj(
  'stat-2',
  'পরিসংখ্যান ২য় পত্র',
  'Statistics 2nd Paper',
  '🎲',
  '#7C3AED',
  '124, 58, 237',
  [
    ch('stat2-c1', '১ম, ২য় ও ৩য় অধ্যায়: সম্ভাবনা, দৈব চলক এবং গাণিতিক প্রত্যাশা ও ভেদাঙ্ক', [
      'সম্ভাবনার সংযোজন ও শর্তাধীন সূত্র: P(A∪B) = P(A) + P(B) - P(A∩B) | P(A|B) = P(A∩B) ÷ P(B)',
      'গাণিতিক প্রত্যাশা ও ভেদাঙ্ক: E(aX + b) = aE(X) + b | V(X) = E(X²) - [E(X)]² এবং V(aX + b) = a²V(X)',
    ]),
    ch('stat2-c2', '৪র্থ–৯ম অধ্যায়: দ্বিপদী, পঁয়সন ও পরিমিত বিন্যাস, নমুনায়ন ও জীব পরিসংখ্যান', [
      'দ্বিপদী, পঁয়সন ও পরিমিত বিন্যাস: দ্বিপদী P(x) = ⁿCₓ pˣ qⁿ⁻ˣ (গড় = np, ভেদাঙ্ক = npq) | পঁয়সন P(x) = (e⁻ᵐ·mˣ)/x! (গড় = ভেদাঙ্ক = m) | পরিমিত চলক z = (x - μ) ÷ σ',
      'নমুনায়ন ও জীব পরিসংখ্যান: নমুনা গড়ের পরিমিত ভ্রান্তি SE(x̄) = σ ÷ √n | স্থূল জন্মহার CBR = (B ÷ P) × 1000',
    ]),
  ]
);

const _S26 = mkSubj('civ-1', 'পৌরনীতি ও সুশাসন ১ম পত্র', 'Civics & Good Governance 1st', '⚖️', '#7C3AED', '124, 58, 237', [ch('civ1-c1', '১ম–১০ম অধ্যায়: পৌরনীতি ও সুশাসন পরিচিতি, আইন-স্বাধীনতা-সাম্য, ই-গভর্ন্যান্স, মানবাধিকার, সরকার কাঠামো ও আমলাতন্ত্র')], false);
const _S27 = mkSubj('civ-2', 'পৌরনীতি ও সুশাসন ২য় পত্র', 'Civics & Good Governance 2nd', '🏛️', '#4F46E5', '79, 70, 229', [ch('civ2-c1', '১ম–১০ম অধ্যায়: ব্রিটিশ ভারত হতে বাংলাদেশের অভ্যুদয় (১৭৫৭–১৯৭১), সংবিধান, সরকার ও প্রশাসন, স্থানীয় শাসন ও পররাষ্ট্রনীতি')], false);
const _S28 = mkSubj('his-1', 'ইতিহাস ১ম পত্র', 'History 1st Paper', '🏺', '#B45309', '180, 83, 9', [ch('his1-c1', '১ম–৮ম অধ্যায়: ইউরোপীয়দের আগমন, পলাশী ও বক্সারের যুদ্ধ, কোম্পানির ও ব্রিটিশ শাসন, ভাষা আন্দোলন ও মহান মুক্তিযুদ্ধ (১৯৭১)')], false);
const _S29 = mkSubj('his-2', 'ইতিহাস ২য় পত্র', 'History 2nd Paper', '📜', '#9333EA', '147, 51, 234', [ch('his2-c1', '১ম–৯ম অধ্যায়: শিল্প বিপ্লব, ফরাসি বিপ্লব (১৭৮৯), ১ম ও ২য় বিশ্বযুদ্ধ, রুশ বিপ্লব, জাতিসংঘ, স্নায়ুযুদ্ধ ও বর্ণবাদ বিরোধী আন্দোলন')], false);
const _S30 = mkSubj('ihc-1', 'ইসলামের ইতিহাস ও সংস্কৃতি ১ম', 'Islamic History & Culture 1st', '🕌', '#059669', '5, 150, 105', [ch('ihc1-c1', '১ম–৭ম অধ্যায়: প্রাক-ইসলামি আরব, হযরত মুহাম্মদ (সা.), খুলাফায়ে রাশেদীন, উমাইয়া, আব্বাসীয়, স্পেনে উমাইয়া ও ফাতেমীয় খিলাফত')], false);
const _S31 = mkSubj('ihc-2', 'ইসলামের ইতিহাস ও সংস্কৃতি ২য়', 'Islamic History & Culture 2nd', '🌙', '#0D9488', '13, 148, 136', [ch('ihc2-c1', '১ম–৬ষ্ঠ অধ্যায়: ভারতে মুসলিম শাসন, দিল্লি সালতানাত, মুঘল সাম্রাজ্য, বাংলায় কোম্পানির শাসন ও স্বাধীন বাংলাদেশের অভ্যুদয়')], false);
const _S32 = mkSubj('log-1', 'যুক্তিবিদ্যা ১ম পত্র', 'Logic 1st Paper', '🧠', '#4F46E5', '79, 70, 229', [ch('log1-c1', '১ম–৮ম অধ্যায়: যুক্তিবিদ্যা পরিচিতি, পদ ও শব্দ, বিধেয়ক, অনুমান, যুক্তিবাক্য, আবর্তন-প্রতিবর্তন, সহানুমান ও প্রতীকী যুক্তিবিদ্যা')], false);
const _S33 = mkSubj('log-2', 'যুক্তিবিদ্যা ২য় পত্র', 'Logic 2nd Paper', '🔍', '#7C3AED', '124, 58, 237', [ch('log2-c1', '১ম–৮ম অধ্যায়: যৌক্তিক সংজ্ঞা, যৌক্তিক বিভাগ, আরোহের প্রকারভেদ ও ভিত্তি, প্রকল্প, মিলের পরীক্ষামূলক পদ্ধতি ও আরোহমূলক দোষ')], false);
const _S34 = mkSubj('soc-1', 'সমাজবিজ্ঞান ১ম পত্র', 'Sociology 1st Paper', '👥', '#0284C7', '2, 132, 199', [ch('soc1-c1', '১ম–১১শ অধ্যায়: সমাজবিজ্ঞানের উৎপত্তি, গবেষণা পদ্ধতি, মৌল প্রত্যয়, সামাজিক প্রতিষ্ঠান, সামাজিকীকরণ, স্তরবিন্যাস ও সামাজিক পরিবর্তন')], false);
const _S35 = mkSubj('soc-2', 'সমাজবিজ্ঞান ২য় পত্র', 'Sociology 2nd Paper', '🏘️', '#059669', '5, 150, 105', [ch('soc2-c1', '১ম–৯ম অধ্যায়: বাংলাদেশে সমাজবিজ্ঞান বিকাশ, সমাজ ও সংস্কৃতি, প্রত্নতাত্ত্বিক পরিচয়, ক্ষুদ্র নৃ-গোষ্ঠী, গ্রামীণ-শহুরে সমাজ ও সামাজিক সমস্যা')], false);
const _S36 = mkSubj('sw-1', 'সমাজকর্ম ১ম পত্র', 'Social Work 1st Paper', '🤝', '#E11D48', '225, 29, 72', [ch('sw1-c1', '১ম–৮ম অধ্যায়: সমাজকর্মের প্রকৃতি, ঐতিহাসিক প্রেক্ষাপট, মূল্যবোধ, সমাজকর্ম পদ্ধতি (মৌলিক ও সহায়ক) ও সামাজিক নীতি')], false);
const _S37 = mkSubj('sw-2', 'সমাজকর্ম ২য় পত্র', 'Social Work 2nd Paper', '❤️', '#D97706', '217, 119, 6', [ch('sw2-c1', '১ম–৯ম অধ্যায়: মৌলিক মানবিক চাহিদা, সমাজকর্মের শাখা, সামাজিক সমস্যা ও আইন, সরকারি ও বেসরকারি সমাজ উন্নয়ন ও মাঠকর্ম')], false);
const _S38 = mkSubj('geo-1', 'ভূগোল ১ম পত্র', 'Geography 1st Paper', '🌍', '#0284C7', '2, 132, 199', [ch('geo1-c1', '১ম–৯ম অধ্যায়: প্রাকৃতিক ভূগোল, পৃথিবীর গঠন ও শিলা, ভূমিরূপ পরিবর্তন, বায়ুমণ্ডল, জলবায়ু, বারিমণ্ডল, জীবমণ্ডল ও ব্যবহারিক মানচিত্র')], false);
const _S39 = mkSubj('geo-2', 'ভূগোল ২য় পত্র', 'Geography 2nd Paper', '🗺️', '#0D9488', '13, 148, 136', [ch('geo2-c1', '১ম–১০ম অধ্যায়: মানব ভূগোল, জনসংখ্যা, বসতি, কৃষি, খনিজ ও শক্তি সম্পদ, শিল্প, পরিবহন ও বন্দর, বাণিজ্য এবং জিআইএস (GIS & GPS)')], false);
const _S40 = mkSubj('isl-1', 'ইসলাম শিক্ষা ১ম পত্র', 'Islamic Studies 1st Paper', '🕋', '#059669', '5, 150, 105', [ch('isl1-c1', '১ম–৭ম অধ্যায়: ইসলামী সংস্কৃতি ও আকাইদ, ইবাদত, আখলাক, সমাজজীবন, অর্থব্যবস্থা, রাষ্ট্রব্যবস্থা ও আন্তর্জাতিক ব্যবস্থা')], false);
const _S41 = mkSubj('isl-2', 'ইসলাম শিক্ষা ২য় পত্র', 'Islamic Studies 2nd Paper', '📖', '#10B981', '16, 185, 129', [ch('isl2-c1', '১ম–৬ষ্ঠ অধ্যায়: আল-কুরআন, আল-হাদিস (সিহাহ সিত্তাহ), ইজমা ও কিয়াস, ইসলামে জ্ঞানচর্চা, মুসলিম মনীষীদের অবদান ও সমকালীন প্রেক্ষাপট')], false);
const _S42 = mkSubj('agr-1', 'কৃষিশিক্ষা ১ম পত্র', 'Agriculture Studies 1st', '🌱', '#10B981', '16, 185, 129', [ch('agr1-c1', '১ম–৬ষ্ঠ অধ্যায়: কৃষি তথ্যপ্রযুক্তি, ভূমি সম্পদ, বিশেষ কৃষি প্রযুক্তি, কৃষি ও জলবায়ু (৩০টি AEZ), মাঠ ও উদ্যান ফসল এবং সংরক্ষণ')], false);
const _S43 = mkSubj('agr-2', 'কৃষিশিক্ষা ২য় পত্র', 'Agriculture Studies 2nd', '🌾', '#059669', '5, 150, 105', [ch('agr2-c1', '১ম–৫ম অধ্যায়: মাৎস্য চাষ, পোল্ট্রি পালন, গবাদিপশু পালন, বনায়ন এবং কৃষি অর্থনীতি ও সমবায়')], false);

const _S44 = mkSubj('ssc-bn-1', 'বাংলা ১ম পত্র', 'Bangla 1st Paper', '📖', '#E11D48', '225, 29, 72', [ch('s-bn1-c1', 'গদ্য, পদ্য ও সহপাঠ (সুভা, বই পড়া, আম আঁটির ভেঁপু, মানুষ মুহম্মদ (স.), নিমগাছ, বঙ্গবাণী, কপোতাক্ষ নদ, মানুষ, কাকতাড়ুয়া ও বহিপীর)')], false);
const _S45 = mkSubj('ssc-bn-2', 'বাংলা ২য় পত্র', 'Bangla 2nd Paper', '✍️', '#059669', '5, 150, 105', [ch('s-bn2-c1', 'ধ্বনিতত্ত্ব, সন্ধি, সমাস, উপসর্গ, প্রত্যয়, কারক-বিভক্তি, বাচ্য, উক্তি, বাক্য প্রকরণ ও নির্মিতি')], false);
const _S46 = mkSubj('ssc-en-1', 'ইংরেজি ১ম পত্র', 'English 1st Paper', '🌐', '#2563EB', '37, 99, 235', [ch('s-en1-c1', 'Seen & Unseen Passages, Information Transfer, Summarizing, Matching, Rearranging & Writing')], false);
const _S47 = mkSubj('ssc-en-2', 'ইংরেজি ২য় পত্র', 'English 2nd Paper', '🔤', '#1D4ED8', '29, 78, 216', [ch('s-en2-c1', 'Grammar (Right Form of Verbs, Narration, Changing Sentences, Suffix-Prefix, Tag Questions, Connectors) & CV/Composition')], false);
const _S48 = mkSubj('ssc-math', 'সাধারণ গণিত', 'General Mathematics', '📏', '#D97706', '217, 119, 6', [
  ch('s-math-c1', 'বীজগণিত, সূচক-লগারিদম, ত্রিকোণমিতি, সসীম ধারা, জ্যামিতি, পরিমিতি ও পরিসংখ্যান', [
    'বীজগণিত ও লগারিদম: (a+b)² = (a-b)² + 4ab, a³+b³ = (a+b)³ - 3ab(a+b) | logₐ(MN) = logₐM + logₐN, logₐ(Mʳ) = r logₐM',
    'ত্রিকোণমিতি, ধারা ও পরিমিতি: sin²θ + cos²θ = 1, sec²θ - tan²θ = 1 | সমান্তর ধারার সমষ্টি Sn = (n/2)[2a + (n-1)d] | বৃত্তের ক্ষেত্রফল = πr²',
  ]),
]);
const _S49 = mkSubj('ssc-ict', 'তথ্য ও যোগাযোগ প্রযুক্তি', 'ICT', '💻', '#0284C7', '2, 132, 199', [ch('s-ict-c1', '১ম হতে ৬ষ্ঠ অধ্যায়: তথ্যপ্রযুক্তি ও বাংলাদেশ, কম্পিউটার রক্ষণাবেক্ষণ, ই-বুক, ওয়ার্ড-স্প্রেডশিট ও মাল্টিমিডিয়া')], false);
const _S50 = mkSubj('ssc-phy', 'পদার্থবিজ্ঞান', 'Physics', '🔭', '#4F46E5', '79, 70, 229', [
  ch('s-phy-c1', 'ভৌত রাশি, গতি, বল, কাজ-ক্ষমতা-শক্তি, পদার্থের অবস্থা ও চাপ, তাপ, তরঙ্গ-শব্দ, আলো ও তড়িৎ', [
    'গতি ও বলের সমীকরণ: v = u + at, s = ut + ½at², v² = u² + 2as | F = ma, Ek = ½mv², Ep = mgh',
    'আলো ও চল তড়িৎ: 1/u + 1/v = 1/f, লেন্সের ক্ষমতা P = 1/f | V = IR, তড়িৎ ক্ষমতা P = VI = I²R, বৈদ্যুতিক ইউনিট W = (P × t) ÷ 1000 kWh',
  ]),
]);
const _S51 = mkSubj('ssc-chem', 'রসায়ন', 'Chemistry', '🧪', '#059669', '5, 150, 105', [
  ch('s-chem-c1', '১ম–৫ম অধ্যায়: রসায়নের ধারণা, পদার্থের অবস্থা, পদার্থের গঠন, পর্যায় সারণি ও রাসায়নিক বন্ধন'),
  ch('s-chem-c6', '৬ষ্ঠ অধ্যায়: মোলের ধারণা ও রাসায়নিক গণনা', [
    'মোল ও মোলারিটি সূত্র: n = w ÷ M = V(L) ÷ 22.4 (STP) = N ÷ (6.023 × 10²³) | মোলারিটি S = (1000 × w) ÷ (M × V_mL)',
  ]),
  ch('s-chem-c7', '৭ম–১২শ অধ্যায়: রাসায়নিক বিক্রিয়া, রসায়ন ও শক্তি, এসিড-ক্ষারক সমতা, খনিজ সম্পদ ও জৈব যৌগ'),
]);
const _S52 = mkSubj('ssc-bio', 'জীববিজ্ঞান', 'Biology', '🌿', '#10B981', '16, 185, 129', [ch('s-bio-c1', 'জীবন পাঠ, জীবকোষ ও টিস্যু, কোষ বিভাজন, জীবনীশক্তি, খাদ্য ও পরিপাক, পরিবহন, রেচন, সমন্বয় ও বংশগতি')], false);
const _S53 = mkSubj('ssc-hmath', 'উচ্চতর গণিত', 'Higher Mathematics', '📐', '#E11D48', '225, 29, 72', [
  ch('s-hmath-c1', 'সেট-ফাংশন, বীজগাণিতিক রাশি, অসীম ধারা, দ্বিপদী বিস্তৃতি, স্থানাঙ্ক জ্যামিতি, ত্রিকোণমিতি, ভেক্টর, ঘন জ্যামিতি ও সম্ভাবনা', [
    'অসীম ধারা ও স্থানাঙ্ক জ্যামিতি: |r| < 1 হলে অসীমতক সমষ্টি S_∞ = a ÷ (1 - r) | ঢাল m = (y₂ - y₁) ÷ (x₂ - x₁)',
    'ঘন জ্যামিতি ও সম্ভাবনা: গোলকের পৃষ্ঠতলের ক্ষেত্রফল = 4πr², আয়তন = (4/3)πr³ | শঙ্কুর আয়তন = ⅓πr²h',
  ]),
]);
const _S54 = mkSubj('ssc-bgs', 'বাংলাদেশ ও বিশ্বপরিচয়', 'Bangladesh & Global Studies', '🇧🇩', '#0D9488', '13, 148, 136', [ch('s-bgs-c1', 'স্বাধীন বাংলাদেশের অভ্যুদয়, সৌরজগৎ ও ভূমণ্ডল, ভূপ্রকৃতি, রাষ্ট্র-সংবিধান, জাতিসংঘ ও জাতীয় আয়')], false);
const _S55 = mkSubj('ssc-acc', 'হিসাববিজ্ঞান', 'Accounting', '📒', '#4F46E5', '79, 70, 229', [
  ch('s-acc-c1', 'লেনদেন, দুতরফা দাখিলা পদ্ধতি, জাবেদা, খতিয়ান, নগদান বই, রেওয়ামিল, আর্থিক বিবরণী ও উৎপাদন ব্যয় বিবরণী', [
    'হিসাব সমীকরণ ও ব্যয় বিবরণী: A = L + (C + R - Ex - D) | মুখ্য ব্যয় = প্রত্যক্ষ কাঁচামাল + প্রত্যক্ষ শ্রম + অন্যান্য প্রত্যক্ষ খরচ',
  ]),
]);
const _S56 = mkSubj('ssc-fin', 'ফিন্যান্স ও ব্যাংকিং', 'Finance & Banking', '🏦', '#7C3AED', '124, 58, 237', [
  ch('s-fin-c1', 'অর্থায়ন অংশ: অর্থের সময়মূল্য, ঝুঁকি ও অনিশ্চয়তা, মূলধন বাজেটিং ও মূলধন ব্যয়', [
    'অর্থের সময়মূল্য ও মূলধন বাজেটিং: FV = PV(1 + i)ⁿ, EAR = (1 + i/m)ᵐ - 1 | গড় মুনাফার হার ARR = (গড় নিট মুনাফা ÷ গড় বিনিয়োগ) × ১০০%',
  ]),
  ch('s-fin-c2', 'ব্যাংকিং অংশ: মুদ্রা, ব্যাংক ও ব্যাংকিং, বাণিজ্যিক ব্যাংক এবং কেন্দ্রীয় ব্যাংক'),
]);
const _S57 = mkSubj('ssc-ent', 'ব্যবসায় উদ্যোগ', 'Business Entrepreneurship', '💼', '#D97706', '217, 119, 6', [ch('s-ent-c1', 'ব্যবসায় পরিচিতি, ব্যবসায় উদ্যোগ, আত্মকর্মসংস্থান, একমালিকানা-অংশীদারি-যৌথমূলধনী-সমবায় ব্যবসায়, বিপণন ও ব্যবস্থাপনা')], false);
const _S58 = mkSubj('ssc-gsci', 'বিজ্ঞান', 'General Science', '🔬', '#0284C7', '2, 132, 199', [ch('s-gsci-c1', 'খাদ্য ও পুষ্টি, পানি, হৃদযন্ত্র ও রক্ত, আলো, পলিমার, অম্ল-ক্ষারক-লবণ, বল, জীবপ্রযুক্তি ও প্রাত্যহিক জীবনে তড়িৎ')], false);
const _S59 = mkSubj('ssc-his', 'ইতিহাস ও বিশ্বসভ্যতা', 'History & World Civilization', '🏛️', '#B45309', '180, 83, 9', [ch('s-his-c1', 'বিশ্বসভ্যতা, প্রাচীন বাংলার জনপদ, পাল-সেন যুগ, মধ্যযুগ, ইংরেজ শাসন, ভাষা আন্দোলন ও মুক্তিযুদ্ধ')], false);
const _S60 = mkSubj('ssc-geo', 'ভূগোল ও পরিবেশ', 'Geography & Environment', '🌍', '#059669', '5, 150, 105', [ch('s-geo-c1', 'মহাবিশ্ব ও পৃথিবী, মানচিত্র পঠন, শিলামণ্ডল, বায়ুমণ্ডল, বারিমণ্ডল, জনসংখ্যা, বসতি ও বাংলাদেশের ভৌগোলিক বিবরণ')], false);
const _S61 = mkSubj('ssc-civ', 'পৌরনীতি ও নাগরিকতা', 'Civics & Citizenship', '⚖️', '#7C3AED', '124, 58, 237', [ch('s-civ-c1', 'পৌরনীতি ও নাগরিকতা, আইন-স্বাধীনতা-সাম্য, রাষ্ট্র ও সরকার ব্যবস্থা, সংবিধান, রাজনৈতিক দল ও নির্বাচন এবং জাতিসংঘ')], false);
const _S62 = mkSubj('ssc-eco', 'অর্থনীতি', 'Economics', '📈', '#4F46E5', '79, 70, 229', [ch('s-eco-c1', 'অর্থনীতির পরিচয়, উপযোগ-চাহিদা-যোগান, উৎপাদন, বাজার, জাতীয় আয় (GDP, GNP), অর্থ ও ব্যাংক ব্যবস্থা এবং বাজেট')], false);
const _S63 = mkSubj('ssc-rel', 'ইসলাম ও নৈতিক শিক্ষা', 'Islam & Moral Education', '🕋', '#10B981', '16, 185, 129', [ch('s-rel-c1', 'আকাইদ ও নৈতিক জীবন, শরীয়তের উৎস, ইবাদত (সালাত, সিয়াম, যাকাত, হজ), আখলাক ও আদর্শ জীবনচরিত')], false);
const _S64 = mkSubj('ssc-agr', 'কৃষিশিক্ষা', 'Agriculture Studies', '🌱', '#059669', '5, 150, 105', [ch('s-agr-c1', 'কৃষি প্রযুক্তি, কৃষি উপকরণ, কৃষি ও জলবায়ু, কৃষিজ উৎপাদন, বনায়ন, মাৎস্য চাষ, পোল্ট্রি ও গবাদিপশু পালন')], false);

const _S65 = mkSubj('adm-sci', 'ক ইউনিট ও ইঞ্জিনিয়ারিং', 'Unit A & Engineering', '🎓', '#4F46E5', '79, 70, 229', [
  ch('adm-sci-c1', 'পদার্থবিজ্ঞান, রসায়ন ও উচ্চতর গণিত শর্টকাট সূত্রাবলি', [
    'প্রাসের পাল্লা ও ক্যালকুলাস শর্টকাট: R = 4H cotθ (R = H হলে θ = 75°58′) | L’Hôpital’s Rule: lim f(x)/g(x) = lim f′(x)/g′(x)',
  ]),
]);
const _S66 = mkSubj('adm-med', 'মেডিকেল ও ডেন্টাল ভর্তি', 'Medical & Dental Admission', '🩺', '#10B981', '16, 185, 129', [ch('adm-med-c1', 'জীববিজ্ঞান (৩০), রসায়ন (২৫), পদার্থবিজ্ঞান (২০), ইংরেজি (১৫) ও সাধারণ জ্ঞান (১০)')], false);
const _S67 = mkSubj('adm-com', 'গ ইউনিট (ব্যবসায় শিক্ষা)', 'Unit C (Business Studies)', '📊', '#D97706', '217, 119, 6', [
  ch('adm-com-c1', 'হিসাববিজ্ঞান ও ফিন্যান্স গাণিতিক শর্টকাট', [
    'মুনাফার হার রূপান্তর শর্টকাট: ক্রয়মূল্যের ওপর ২৫% (১/৪) = বিক্রয়মূল্যের ওপর ২০% (১/৫) | ক্রয়মূল্যের ওপর ৩৩.৩৩% (১/৩) = বিক্রয়মূল্যের ওপর ২৫% (১/৪)',
  ]),
]);
const _S68 = mkSubj('adm-hum', 'খ ইউনিট (মানবিক ও বিভাগ পরিবর্তন)', 'Unit B (Humanities)', '🏛️', '#7C3AED', '124, 58, 237', [ch('adm-hum-c1', 'বাংলা, সাধারণ ইংরেজি ও সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি)')], false);
const _S69 = mkSubj('bcs-preli', 'বিসিএস প্রিলিমিনারি', 'BCS Preliminary', '🏆', '#D97706', '217, 119, 6', [
  ch('bcs-c1', 'বাংলা ও ইংরেজি সাহিত্য-ব্যাকরণ, বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি, বিজ্ঞান ও আইসিটি'),
  ch('bcs-c2', 'গাণিতিক যুক্তি ও মানসিক দক্ষতা', [
    'শতকরা ও সুদকষা শর্টকাট: মূল্য x% বৃদ্ধি পেয়ে y% হ্রাস পেলে পরিবর্তন = [x - y - (xy ÷ 100)]% | সরল সুদ I = Pnr, চক্রবৃদ্ধি মূলধন C = P(1 + r)ⁿ',
  ]),
]);
const _S70 = mkSubj('job-bank', 'ব্যাংক, প্রাইমারি ও NTRCA', 'Bank, Primary & NTRCA', '💼', '#0284C7', '2, 132, 199', [
  ch('job-c1', 'Quantitative Aptitude (ঐকিক নিয়ম, সময়-কাজ, ট্রেন ও নৌকা-স্রোত শর্টকাট)', [
    'সময় ও কাজ এবং গড় গতিবেগ: একত্রে কাজ সম্পন্ন = (xy) ÷ (x + y) দিনে | যাতায়াতের গড় গতিবেগ = (2xy) ÷ (x + y)',
  ]),
]);

const HSC_BUSINESS_STUDIES_LIST: SubjectData[] = [_S06, _S07, _S10, _S11, _S01, _S02, _S03, _S04, _S05, _S08, _S09, _S12, _S13, _S22, _S23, _S24, _S25, _S42, _S43];
const HSC_SCIENCE_LIST: SubjectData[] = [_S01, _S02, _S03, _S04, _S05, _S14, _S15, _S16, _S17, _S18, _S19, _S20, _S21, _S24, _S25, _S42, _S43];
const HSC_HUMANITIES_LIST: SubjectData[] = [_S01, _S02, _S03, _S04, _S05, _S22, _S23, _S26, _S27, _S28, _S29, _S30, _S31, _S32, _S33, _S34, _S35, _S36, _S37, _S38, _S39, _S40, _S41, _S24, _S25, _S42, _S43];
const HSC_ALL_GROUPS_LIST: SubjectData[] = [_S01, _S02, _S03, _S04, _S05, _S06, _S07, _S10, _S11, _S08, _S09, _S12, _S13, _S14, _S15, _S16, _S17, _S18, _S19, _S20, _S21, _S22, _S23, _S26, _S27, _S28, _S29, _S30, _S31, _S32, _S33, _S34, _S35, _S36, _S37, _S38, _S39, _S40, _S41, _S24, _S25, _S42, _S43];

const SSC_SCIENCE_LIST: SubjectData[] = [_S44, _S45, _S46, _S47, _S48, _S49, _S50, _S51, _S52, _S53, _S54, _S63, _S64];
const SSC_BUSINESS_STUDIES_LIST: SubjectData[] = [_S44, _S45, _S46, _S47, _S48, _S49, _S55, _S56, _S57, _S58, _S63, _S64];
const SSC_HUMANITIES_LIST: SubjectData[] = [_S44, _S45, _S46, _S47, _S48, _S49, _S59, _S60, _S61, _S62, _S58, _S63, _S64];
const SSC_ALL_GROUPS_LIST: SubjectData[] = [_S44, _S45, _S46, _S47, _S48, _S49, _S50, _S51, _S52, _S53, _S55, _S56, _S57, _S59, _S60, _S61, _S62, _S54, _S58, _S63, _S64];

export const INITIAL_SYLLABUS_DB: Record<string, Record<string, SubjectData[]>> = {
  HSC: {
    'All Groups': HSC_ALL_GROUPS_LIST,
    'Business Studies': HSC_BUSINESS_STUDIES_LIST,
    Science: HSC_SCIENCE_LIST,
    Humanities: HSC_HUMANITIES_LIST,
  },
  SSC: {
    'All Groups': SSC_ALL_GROUPS_LIST,
    Science: SSC_SCIENCE_LIST,
    'Business Studies': SSC_BUSINESS_STUDIES_LIST,
    Humanities: SSC_HUMANITIES_LIST,
  },
  Admission: {
    'All Units': [_S65, _S66, _S67, _S68],
    'Science & Engineering': [_S65, _S66],
    'Business Studies (C-Unit)': [_S67],
    'Humanities (B-Unit)': [_S68],
  },
  'Job/BCS': {
    'All Tracks': [_S69, _S70],
  },
};
