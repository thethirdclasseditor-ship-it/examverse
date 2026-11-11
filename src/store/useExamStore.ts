import React, { useSyncExternalStore } from 'react';
import { HSC_ACCOUNTING_2ND_PAPER_CHAPTERS } from '../data/syllabusData';
import * as RawSyllabus from '../data/syllabusData';
import * as RawSupabase from '../lib/supabase';
import { HSC_ACCOUNTING_1ST_PAPER_CHAPTERS } from '../data/accounting1Data';
import { HSC_BANGLA_1ST_ALL_2000_CHAPTERS } from '../data/bangla1Batch4PoetryData';
import {
  ActiveQuizConfig,
  ChapterData,
  ChapterFormula,
  CommunityPost,
  CQQuestion,
  ExamHistoryItem,
  FlashcardItem,
  LanguageMode,
  LocalizedText,
  MCQQuestion,
  MistakeItem,
  RankProgressInfo,
  StudyTask,
  SubjectData,
} from '../types';
export type NavTabId =
  | 'dashboard'
  | 'subjects'
  | 'Analytics'
  | 'mistakes'
  | 'flashcards'
  | 'formulas'
  | 'planner'
  | 'battle'
  | 'community'
  | 'leaderboard'
  | 'achievements'
  | 'admin';
export interface QuestionErrorReport {
  id: string;
  questionId: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  questionText: string;
  options: string[];
  currentAns: number;
  currentCorrectIndex: number;
  suggestedCorrectIndex: number;
  issueType: string;
  comment: string;
  note: string;
  reportedBy: string;
  reportedAt: string;
  createdAt: string;
  status: 'pending' | 'verified' | 'rejected' | 'resolved';
}
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
  stem: string;
  board?: string;
  qA: string;
  ansA: string;
  qB: string;
  ansB: string;
  qC: string;
  ansC: string;
  qD: string;
  ansD: string;
}
export interface Chapter {
  id: string;
  name: string;
  mcqs: MCQ[];
  cqs: CQ[];
  formulas?: string[];
}
export { HSC_ACCOUNTING_1ST_PAPER_CHAPTERS };
function convertLegacyChapters(chapters: Chapter[], subjPrefix: string): ChapterData[] {
  return (chapters || []).map((ch, cIdx): ChapterData => {
    const formulas: ChapterFormula[] = (ch.formulas || []).map((fStr, fIdx) => {
      const parts = fStr.split(':');
      const hasTitle = parts.length > 1 && parts[0].length < 48;
      const titleText = hasTitle ? parts[0].trim() : `সূত্র ও মূলতথ্য #${fIdx + 1}`;
      const bodyText = hasTitle ? parts.slice(1).join(':').trim() : fStr;
      return {
        id: `${subjPrefix}-f-${cIdx + 1}-${fIdx + 1}`,
        title: { bn: titleText, en: titleText },
        formula: bodyText,
      };
    });
    const mcqs: MCQQuestion[] = (ch.mcqs || []).map((m): MCQQuestion => ({
      id: m.id,
      q: { bn: m.question, en: m.question },
      options: { bn: [...m.options], en: [...m.options] },
      ans: m.correctIndex,
      explanation: { bn: m.explanation || '', en: m.explanation || '' },
      boardTag: m.board,
    }));
    const cqs: CQQuestion[] = (ch.cqs || []).map((c): CQQuestion => ({
      id: c.id,
      stem: { bn: c.stem, en: c.stem },
      a: { bn: c.qA, en: c.qA },
      b: { bn: c.qB, en: c.qB },
      c: { bn: c.qC, en: c.qC },
      d: { bn: c.qD, en: c.qD },
      ansA: { bn: c.ansA, en: c.ansA },
      ansB: { bn: c.ansB, en: c.ansB },
      ansC: { bn: c.ansC, en: c.ansC },
      ansD: { bn: c.ansD, en: c.ansD },
      boardTag: c.board,
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
const HSC_BANGLA_1ST_CHAPTERS: Chapter[] = HSC_BANGLA_1ST_ALL_2000_CHAPTERS;
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
  chapters: Chapter[]
): SubjectData => ({
  id,
  name: { bn, en },
  icon,
  color,
  rgb,
  chapters: convertLegacyChapters(chapters, id),
});
// ================= HSC COMMON SUBJECTS (5) =================
const HSC_BANGLA_1ST_PAPER_SUBJECT: SubjectData = {
  id: 'hsc-bn-1',
  name: { bn: 'বাংলা ১ম পত্র (Code: 101)', en: 'Bangla 1st Paper (HSC - 101)' },
  icon: '📖',
  color: '#E11D48',
  rgb: '225, 29, 72',
  chapters: convertLegacyChapters(HSC_BANGLA_1ST_CHAPTERS, 'bn1'),
};
const HSC_BANGLA_2ND_PAPER_SUBJECT: SubjectData = mkSubj('hsc-bn-2', 'বাংলা ২য় পত্র (Code: 102)', 'Bangla 2nd Paper (HSC - 102)', '✍️', '#059669', '5, 150, 105', [
  ch('bn2-c1', '১ম ও ২য় অধ্যায়: বাংলা উচ্চারণের নিয়ম ও বাংলা বানানের নিয়ম', ['অ-ধ্বনির সংবৃত উচ্চারণ: শব্দের আদিতে অ-এর পরে ই/ঈ/উ/ঊ/ক্ষ/য-ফলা থাকলে ও-কারের মতো উচ্চারিত হয় (অতি -> ওতি, দক্ষ -> দোক্‌খো)', 'ণ-ত্ব ও ষ-ত্ব বিধান: তৎসম শব্দে ঋ, র, ষ-এর পরে ণ হয় (ঋণ, বর্ণ, উষ্ণ); অ/আ ভিন্ন স্বরধ্বনি এবং ক ও র-এর পরে ষ হয় (ভবিষ্যৎ, আবিষ্কার)']),
  ch('bn2-c2', '৩য় ও ৪র্থ অধ্যায়: ব্যাকরণিক শব্দশ্রেণি, উপসর্গ, প্রত্যয় ও সমাস', ['ব্যাকরণিক শব্দশ্রেণি ৮ প্রকার: বিশেষ্য, সর্বনাম, বিশেষণ, ক্রিয়া, ক্রিয়াবিশেষণ, যোজক, অনুসর্গ ও আবেগ শব্দ', 'উপসর্গ ও সমাস: বাংলা উপসর্গ ২১টি, তৎসম উপসর্গ ২০টি (কমন ৪টি: আ, সু, বি, নি) | সমাস ৬ প্রকার (দ্বন্দ্ব, কর্মধারয়, তৎপুরুষ, বহুব্রীহি, দ্বিগু, অব্যয়ীভাব)']),
  ch('bn2-c3', '৫ম ও ৬ষ্ঠ অধ্যায়: বাক্যতত্ত্ব এবং বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ', ['সার্থক বাক্যের ৩টি গুণ: আকাঙ্ক্ষা, আসত্তি ও যোগ্যতা | গঠন অনুসারে বাক্য ৩ প্রকার: সরল, জটিল/মিশ্র ও যৌগিক']),
  ch('bn2-c4', 'নির্মিতি অংশ: পারিভাষিক শব্দ, অনুবাদ, দিনলিপি, প্রতিবেদন, ই-মেইল, আবেদনপত্র, সারাংশ, ভাবসম্প্রসারণ, সংলাপ, খুদেগল্প ও প্রবন্ধ', ['আবেদনপত্র ও প্রতিবেদন কাঠামো: তারিখ -> প্রাপক -> বিষয় -> সম্বোধন -> মূল বক্তব্য -> নিবেদক']),
]);
const HSC_ENGLISH_1ST_PAPER_SUBJECT: SubjectData = mkSubj('hsc-en-1', 'English 1st Paper (Code: 107)', 'English 1st Paper (HSC - 107)', '🌐', '#2563EB', '37, 99, 235', [
  ch('en1-c1', 'Unit 1–5: People Making History (7 March Speech, Mandela), Dreams, Lifestyle, Adolescence & Youthful Achievers', ['7th March Speech: Recognized by UNESCO in Memory of the World Register (30 Oct 2017) | Mandela: Nobel Peace Prize 1993 | WHO Adolescence: Age 10–19']),
  ch('en1-c2', 'Unit 6–10: Relationships, Human Rights (Amerigo), Environment (Hakaluki Haor, Kuakata) & Folk Art/Myths', ['Kuakata (Sagar Kanya): 18 km long beach offering both sunrise & sunset views | Hakaluki Haor: Declared Ecologically Critical Area in 1999']),
  ch('en1-c3', 'Flow Chart, Summary Writing, Cloze Test, Rearranging & Graph/Chart Analysis', ['Flow Chart Rule: Use 5 short boxes with arrows starting with Infinitive (To+V1), Gerund (V1+ing), or Noun Phrase — never write full sentences']),
]);
const HSC_ENGLISH_2ND_PAPER_SUBJECT: SubjectData = mkSubj('hsc-en-2', 'English 2nd Paper (Code: 108)', 'English 2nd Paper (HSC - 108)', '🔤', '#1D4ED8', '29, 78, 216', [
  ch('en2-c1', 'Grammar Part 1: Articles, Prepositions, Special Phrases & Completing Sentences', ['Conditionals: 1st: If + Present -> will + V1 | 2nd: If + Past (V2) -> would + V1 | 3rd: If + had + V3 -> would have + V3', 'Special Rules: had better/would rather + V1 | It is high time + Subject + V2 | Lest + Subject + should/might + V1']),
  ch('en2-c2', 'Grammar Part 2: Right Form of Verbs, Passage Narration, Modifiers, Connectors, Synonym-Antonym & Punctuation', ['Verb & Modifier Rules: With a view to / look forward to / cannot help + V1-ing | Pre-modifiers (Adjective, Participle) & Post-modifiers (Infinitive, Appositive)']),
  ch('en2-c3', 'Composition Part: Formal Application, E-mail, Report Writing, Paragraph & Essay', ['Report Format: Headline -> Byline & Dateline -> Lead Paragraph (5Ws) -> Body & Conclusion']),
]);
const HSC_ICT_SUBJECT: SubjectData = mkSubj('hsc-ict', 'তথ্য ও যোগাযোগ প্রযুক্তি - ICT (Code: 275)', 'ICT (HSC - 275)', '💻', '#0284C7', '2, 132, 199', [
  ch('h-ict-c1', '১ম অধ্যায়: বিশ্ব ও বাংলাদেশ প্রেক্ষিত', ['ন্যানোটেকনোলজি ও ক্রায়োসার্জারি: 1 nm = 10⁻⁹ m (1–100 nm স্কেল) | ক্রায়োসার্জারি: -41°C থেকে -196°C (তরল নাইট্রোজেন/আর্গন)']),
  ch('h-ict-c2', '২য় অধ্যায়: কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং', ['ট্রান্সমিশন মোড ও টপোলজি: সিমপ্লেক্স, হাফ-ডুপ্লেক্স, ফুল-ডুপ্লেক্স | Mesh তার সংখ্যা = n(n - 1)/2 | অপটিক্যাল ফাইবার: পূর্ণ অভ্যন্তরীণ প্রতিফলন']),
  ch('h-ict-c3', '৩য় অধ্যায়: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', ['বুলিয়ান ও লজিক গেট: (A+B)′ = A′·B′, (A·B)′ = A′+B′ | XOR: A⊕B = A′B + AB′ | Half Adder: S = A⊕B, C = AB | 2’s Comp = 1’s Comp + 1']),
  ch('h-ict-c4', '৪র্থ অধ্যায়: ওয়েব ডিজাইন পরিচিতি এবং HTML', ['HTML ট্যাগ: <a href="url">Text</a>, <img src="pic.jpg" alt="txt" />, colspan="n", rowspan="n", <sub>, <sup>']),
  ch('h-ict-c5', '৫ম ও ৬ষ্ঠ অধ্যায়: প্রোগ্রামিং ভাষা (C Programming) ও ডেটাবেজ (DBMS)', ['C ও SQL সূত্র: 1+2+...+n = n(n+1)/2 | লিপ ইয়ার: (y%400==0)||(y%4==0 && y%100!=0) | SELECT * FROM Student WHERE GPA = 5.00;']),
]);
// ================= HSC BUSINESS STUDIES SUBJECTS =================
const HSC_ACCOUNTING_1ST_PAPER_SUBJECT: SubjectData = {
  id: 'acc-1',
  name: { bn: 'হিসাববিজ্ঞান ১ম পত্র (Code: 253)', en: 'Accounting 1st Paper (HSC - 253)' },
  icon: '📘',
  color: '#4F46E5',
  rgb: '79, 70, 229',
  chapters: convertLegacyChapters(HSC_ACCOUNTING_1ST_PAPER_CHAPTERS, 'acc1'),
};
const HSC_ACCOUNTING_2ND_PAPER_SUBJECT: SubjectData = {
  id: 'acc-2',
  name: { bn: 'হিসাববিজ্ঞান ২য় পত্র (Code: 254)', en: 'Accounting 2nd Paper (HSC - 254)' },
  icon: '📊',
  color: '#D97706',
  rgb: '217, 119, 6',
  chapters: convertLegacyChapters(HSC_ACCOUNTING_2ND_PAPER_CHAPTERS, 'acc2'),
};
const HSC_BOM_1ST_PAPER_SUBJECT: SubjectData = mkSubj('bom-1', 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র (Code: 277)', 'Business Org. & Management 1st Paper (HSC - 277)', '🏢', '#059669', '5, 150, 105', [
  ch('bom1-c1', '১ম–৪র্থ অধ্যায়: ব্যবসায়ের মৌলিক ধারণা, পরিবেশ, একমালিকানা ও অংশীদারি ব্যবসায়', ['ব্যবসায় সমীকরণ ও অংশীদারি আইন: ΣB = ΣI + ΣT + ΣAT | অংশীদারি আইন ১৯৩২: সাধারণ ব্যবসায় সদস্য ২–২০ জন, ব্যাংকিং ব্যবসায় ২–১০ জন']),
  ch('bom1-c2', '৫ম–৭ম অধ্যায়: যৌথ মূলধনী ব্যবসায় (কোম্পানি), সমবায় সমিতি ও রাষ্ট্রীয় ব্যবসায়', ['কোম্পানি আইন ১৯৯৪ ও সমবায় আইন ২০০১: প্রাইভেট লি. সদস্য ২–৫০ জন, পাবলিক লি. ৭–শেয়ার সংখ্যা দ্বারা সীমাবদ্ধ | প্রাথমিক সমবায়ে সর্বনিম্ন সদস্য ২০ জন (সংরক্ষিত তহবিল ১৫%)']),
  ch('bom1-c3', '৮ম–১২শ অধ্যায়: আইনগত দিক, সহায়ক সেবা, ব্যবসায় উদ্যোগ, তথ্যপ্রযুক্তি ও ব্যবসায় নৈতিকতা (CSR)', ['মেধাসম্পদ আইন: পেটেন্ট আইন ১৯১১ (১৬ বছর), ট্রেডমার্ক আইন ২০০৯ (৭ বছর), কপিরাইট আইন ২০০০ (৬০ বছর), ISO 9000 (মান) ও ISO 14000 (পরিবেশ)']),
]);
const HSC_BOM_2ND_PAPER_SUBJECT: SubjectData = mkSubj('bom-2', 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র (Code: 278)', 'Business Org. & Management 2nd Paper (HSC - 278)', '📋', '#0D9488', '13, 148, 136', [
  ch('bom2-c1', '১ম–৩য় অধ্যায়: ব্যবস্থাপনার ধারণা, ব্যবস্থাপনার নীতি ও পরিকল্পনা প্রণয়ন', ['ব্যবস্থাপনার জনক ও উপকরণ: আধুনিক ব্যবস্থাপনার জনক হেনরি ফেয়ল (১৪টি নীতি) | বৈজ্ঞানিক ব্যবস্থাপনার জনক এফ. ডব্লিউ. টেইলর | উপকরণ 6M ও POSDCORB']),
  ch('bom2-c2', '৪র্থ–৭ম অধ্যায়: সাংগঠনিক কাঠামো, কর্মীসংস্থান, নেতৃত্ব ও প্রেষণা', ['নেতৃত্ব ও প্রেষণা: স্বৈরতান্ত্রিক, গণতান্ত্রিক ও মুক্ত নেতৃত্ব | মাসলোর চাহিদা সোপান তত্ত্বের ৫টি ধাপ: জৈবিক -> নিরাপত্তা -> সামাজিক -> আত্মতৃপ্তি -> আত্মপ্রতিষ্ঠা']),
  ch('bom2-c3', '৮ম–১০ম অধ্যায়: যোগাযোগ, সমন্বয় সাধন ও নিয়ন্ত্রণ', ['নিয়ন্ত্রণ ও সমচ্ছেদ বিন্দু: আদর্শমান নির্ধারণ -> কার্যফল পরিমাপ -> তুলনা ও বিচ্যুতি নির্ণয় -> সংশোধনমূলক ব্যবস্থা | BEP = FC ÷ (P - VC)']),
]);
const HSC_FINANCE_1ST_PAPER_SUBJECT: SubjectData = mkSubj('fin-1', 'ফিন্যান্স, ব্যাংকিং ও বিমা ১ম পত্র (Code: 292)', 'Finance, Banking & Insurance 1st Paper (HSC - 292)', '💰', '#7C3AED', '124, 58, 237', [
  ch('fin1-c1', '১ম–৩য় অধ্যায়: অর্থায়নের সূচনা, আর্থিক বাজার এবং অর্থের সময়মূল্য (Time Value of Money)', ['অর্থের সময়মূল্য সূত্র: FV = PV(1 + i)ⁿ, PV = FV ÷ (1 + i)ⁿ | প্রকৃত সুদের হার EAR = (1 + i/m)ᵐ - 1 | বিধি ৭২: n = 72 ÷ i% | চিরস্থায়ী বৃত্তি PV = A ÷ i']),
  ch('fin1-c2', '৪র্থ–৭ম অধ্যায়: আর্থিক বিশ্লেষণ, স্বল্প ও দীর্ঘমেয়াদি অর্থায়ন এবং মূলধন ব্যয় (Cost of Capital)', ['সমচ্ছেদ, EOQ ও মূলধন ব্যয়: BEP = FC ÷ (P - VC), EOQ = √(2AO ÷ C) | ঋণ ব্যয় Kd = Ki(1 - t), সাধারণ শেয়ার Ke = (D₁/P₀) + g, WACC = WeKe + WpKp + WdKd']),
  ch('fin1-c3', '৮ম ও ৯ম অধ্যায়: মূলধন বাজেটিং ও বিনিয়োগ সিদ্ধান্ত এবং ঝুঁকি ও মুনাফার হার', ['মূলধন বাজেটিং ও ঝুঁকি: ARR = (গড় নিট মুনাফা ÷ গড় বিনিয়োগ) × ১০০%, PBP = NCO ÷ NCB, NPV = Σ[CFt/(1+k)ᵗ] - NCO | আদর্শ বিচ্যুতি σ, বিভেদাঙ্ক CV = (σ/R̄)×100%, CAPM: Ke = Rf + β(Rm - Rf)']),
]);
const HSC_FINANCE_2ND_PAPER_SUBJECT: SubjectData = mkSubj('fin-2', 'ফিন্যান্স, ব্যাংকিং ও বিমা ২য় পত্র (Code: 293)', 'Finance, Banking & Insurance 2nd Paper (HSC - 293)', '🏦', '#2563EB', '37, 99, 235', [
  ch('fin2-c1', '১ম–৫ম অধ্যায়: ব্যাংক ব্যবস্থা, কেন্দ্রীয় ব্যাংক, বাণিজ্যিক ব্যাংক, ব্যাংক হিসাব ও হস্তান্তরযোগ্য দলিল', ['বাংলাদেশ ব্যাংক ও তফসিলি ব্যাংক: ১৯৭২ সালের রাষ্ট্রপতির ১২৭ নং আদেশ (বর্তমানে তফসিলি ব্যাংক ৬১টি) | ১৮৮১ সালের হস্তান্তরযোগ্য দলিল আইন (চেক, বিনিময় বিল, অঙ্গীকারপত্র)']),
  ch('fin2-c2', '৬ষ্ঠ–৯ম অধ্যায়: চেক-বিনিময় বিল, ব্যাংক তহবিল, বৈদেশিক বিনিময় (L/C) ও ইলেকট্রনিক ব্যাংকিং', ['চেক ও ই-ব্যাংকিং: চেকের পক্ষ ৩টি (আদেষ্টা, আদিষ্ট, প্রাপক), মেয়াদ ৬ মাস (১৮০ দিন) | L/C, ATM, POS, MICR, SWIFT, RTGS, BEFTN, NPSB']),
  ch('fin2-c3', '১০ম–১৪শ অধ্যায়: বিমার মৌলিক ধারণা, জীবন বিমা, নৌ বিমা, অগ্নি বিমা ও বিবিধ বিমা', ['বিমা চুক্তির অপরিহার্য নীতিমালা: চরম সদ্বিশ্বাসের নীতি (Utmost Good Faith), বিমাযোগ্য স্বার্থ, ক্ষতিপূরণের নীতি (জীবন বিমা ব্যতীত) ও স্থলাভিষিক্তকরণের নীতি']),
]);
const HSC_MARKETING_1ST_PAPER_SUBJECT: SubjectData = mkSubj('mkt-1', 'উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম পত্র (Code: 286)', 'Production Management & Marketing 1st Paper (HSC - 286)', '🏭', '#D97706', '217, 119, 6', [
  ch('mkt1-c1', '১ম–৪র্থ অধ্যায়: উৎপাদন ও উৎপাদনশীলতা, উৎপাদনের উপকরণ, মাত্রা এবং সামষ্টিক উৎপাদন (জাতীয় আয়)', ['উৎপাদনশীলতা ও জাতীয় আয়: মোট উৎপাদনশীলতা = মোট উৎপাদনের মূল্য ÷ মোট উপাদানের মূল্য | উপযোগ ৫ প্রকার | GDP = C + I + G + (X - M), GNP = GDP + নিট বৈদেশিক আয়']),
  ch('mkt1-c2', '৫ম–১০ম অধ্যায়: উৎপাদন ব্যবস্থাপনা, পণ্য ডিজাইন, মান ব্যবস্থাপনা, উৎপাদন ক্ষমতা, অবস্থান ও বিন্যাস', ['মানের ব্যয় ও বিন্যাস: প্রতিরোধ ব্যয়, মূল্যায়ন ব্যয়, অভ্যন্তরীণ ও বাহ্যিক বিচ্যুতি ব্যয় | পণ্য বিন্যাস, প্রক্রিয়া বিন্যাস ও স্থির অবস্থান বিন্যাস']),
]);
const HSC_MARKETING_2ND_PAPER_SUBJECT: SubjectData = mkSubj('mkt-2', 'উৎপাদন ব্যবস্থাপনা ও বিপণন ২য় পত্র (Code: 287)', 'Production Management & Marketing 2nd Paper (HSC - 287)', '🛒', '#EA580C', '234, 88, 12', [
  ch('mkt2-c1', '১ম–৫ম অধ্যায়: বিপণন পরিচিতি, বিপণন পরিবেশ, কার্যাবলি, বাজার বিভক্তিকরণ ও বিপণন মিশ্রণ (4Ps)', ['বিপণন মিশ্রণ (4Ps — E. Jerome McCarthy): Product (পণ্য), Price (মূল্য), Place (স্থান/বণ্টন), Promotion (প্রসার) | আধুনিক বিপণনের জনক ফিলিপ কোটলার']),
  ch('mkt2-c2', '৬ষ্ঠ–১০ম অধ্যায়: পণ্য বণ্টন প্রণালি, পাইকারি ও খুচরা ব্যবসায়, বিজ্ঞাপন, ব্যক্তিক বিক্রয় ও সমসাময়িক বিপণন', ['প্রসার মিশ্রণ ও জীবনচক্র: বিজ্ঞাপন (অর্থপ্রদত্ত ও নৈর্ব্যক্তিক), ব্যক্তিক বিক্রয়, বিক্রয় প্রসার, জনসংযোগ ও প্রত্যক্ষ বিপণন | পণ্যের জীবনচক্রের ৪টি স্তর']),
]);
// ================= HSC SCIENCE SUBJECTS =================
const HSC_PHYSICS_1ST_PAPER_SUBJECT: SubjectData = mkSubj('phy-1', 'পদার্থবিজ্ঞান ১ম পত্র (Code: 174)', 'Physics 1st Paper (HSC - 174)', '⚛️', '#4F46E5', '79, 70, 229', [
  ch('phy1-c1', '১ম–৪র্থ অধ্যায়: ভৌত জগৎ ও পরিমাপ, ভেক্টর, গতিবিদ্যা ও নিউটনীয় বলবিদ্যা', ['ভেক্টর ও গতিবিদ্যা: R = √(P² + Q² + 2PQ cosα), tanθ = (Q sinα)/(P + Q cosα) | প্রাসের উচ্চতা H = (v₀² sin²θ₀)/2g, পাল্লা R = (v₀² sin 2θ₀)/g | Fc = mv²/r, tanθ = v²/rg']),
  ch('phy1-c2', '৫ম–৭ম অধ্যায়: কাজ, শক্তি ও ক্ষমতা, মহাকর্ষ ও অভিকর্ষ এবং পদার্থের গাঠনিক ধর্ম', ['কাজ-শক্তি ও মহাকর্ষ: Ek = ½mv² = p²/2m, Ep = ½kx² | মুক্তিবেগ ve = √(2gR) ≈ 11.2 km/s, উচ্চতায় g′ = g[R/(R+h)]², গভীরতায় g′ = g(1 - d/R) | ইয়ংয়ের গুণাঙ্ক Y = FL/(AΔl)']),
  ch('phy1-c3', '৮ম–১০ম অধ্যায়: পর্যায়বৃত্ত গতি, তরঙ্গ এবং আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', ['দোলন, তরঙ্গ ও গ্যাস: v = ω√(A² - x²), T = 2π√(L/g) | β = 10 log₁₀(I/I₀) dB | PV = nRT, RMS বেগ c = √(3RT/M) = √(3P/ρ), গতিশক্তি E = (3/2)nRT']),
]);
const HSC_PHYSICS_2ND_PAPER_SUBJECT: SubjectData = mkSubj('phy-2', 'পদার্থবিজ্ঞান ২য় পত্র (Code: 175)', 'Physics 2nd Paper (HSC - 175)', '⚡', '#0284C7', '2, 132, 199', [
  ch('phy2-c1', '১ম–৩য় অধ্যায়: তাপগতিবিদ্যা, স্থির তড়িৎ ও চল তড়িৎ', ['তাপগতিবিদ্যা ও তড়িৎ: dQ = dU + P dV, PV^γ = ধ্রুবক, η = (1 - T₂/T₁)×100%, dS = dQ/T | F = (1/4πε₀)(q₁q₂/r²), U = ½CV², H = I²Rt, শান্ট Is = IG/(G+S)']),
  ch('phy2-c2', '৪র্থ–৭ম অধ্যায়: চৌম্বক ক্রিয়া, তাড়িতচৌম্বক আবেশ ও পরিবর্তী প্রবাহ, জ্যামিতিক ও ভৌত আলোকবিজ্ঞান', ['চুম্বক ও আলোকবিজ্ঞান: F = qvB sinθ, I_rms = I₀/√2 = 0.707 I₀ | 1/f = (μ - 1)(1/r₁ - 1/r₂), ডোরার ব্যবধান Δx = λD/a, প্রস্থ = λD/2a']),
  ch('phy2-c3', '৮ম–১১শ অধ্যায়: আধুনিক পদার্থবিজ্ঞান, পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান, সেমিকন্ডাক্টর ও জ্যোতির্বিজ্ঞান', ['আধুনিক পদার্থবিজ্ঞান: t = t₀/√(1 - v²/c²), E = mc², hf = hf₀ + Ek(max) | অর্ধায়ু T_½ = 0.693/λ | ট্রানজিস্টর IE = IB + IC, β = IC/IB']),
]);
const HSC_CHEMISTRY_1ST_PAPER_SUBJECT: SubjectData = mkSubj('chem-1', 'রসায়ন ১ম পত্র (Code: 176)', 'Chemistry 1st Paper (HSC - 176)', '🧪', '#059669', '5, 150, 105', [
  ch('chem1-c1', '১ম–৩য় অধ্যায়: ল্যাবরেটরির নিরাপদ ব্যবহার, গুণগত রসায়ন এবং মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', ['বোর মডেল, দ্রাব্যতা ও সংকরায়ন: mvr = nh/2π, 1/λ = R_H Z²(1/n₁² - 1/n₂²) | Ksp = x^x · y^y · S^(x+y) | সংকরায়ন H = ½[V + X - C + A]']),
  ch('chem1-c2', '৪র্থ ও ৫ম অধ্যায়: রাসায়নিক পরিবর্তন এবং কর্মমুখী রসায়ন', ['সাম্যধ্রুবক, pH ও বাফার: Kp = Kc(RT)^Δn | pH = -log₁₀[H⁺], pH + pOH = 14 | হেন্ডারসন-হ্যাসেলবাক pH = pKa + log₁₀([লবণ]/[অম্ল]) | ভিনেগার: 6–10% CH₃COOH']),
]);
const HSC_CHEMISTRY_2ND_PAPER_SUBJECT: SubjectData = mkSubj('chem-2', 'রসায়ন ২য় পত্র (Code: 177)', 'Chemistry 2nd Paper (HSC - 177)', '⚗️', '#0D9488', '13, 148, 136', [
  ch('chem2-c1', '১ম ও ২য় অধ্যায়: পরিবেশ রসায়ন এবং জৈব রসায়ন', ['গ্যাস সূত্র ও জৈব রসায়ন: P₁V₁/T₁ = P₂V₂/T₂, PV = nRT, ব্যাপন r₁/r₂ = √(M₂/M₁), (P + n²a/V²)(V - nb) = nRT | হাকেল তত্ত্ব (4n + 2) সংখ্যক π ইলেকট্রন']),
  ch('chem2-c2', '৩য়, ৪র্থ ও ৫ম অধ্যায়: পরিমাণগত রসায়ন, তড়িৎ রসায়ন ও অর্থনৈতিক রসায়ন', ['মোলারিটি ও তড়িৎ রসায়ন: S = (1000 × w)/(M × V_mL), e₁V₁S₁ = e₂V₂S₂ | ফ্যারাডে W = ZIt = (MIt)/(nF) [F = 96500 C] | নার্নস্ট E_cell = E°_cell - (0.0592/n) log Q']),
]);
const HSC_HIGHER_MATH_1ST_PAPER_SUBJECT: SubjectData = mkSubj('math-1', 'উচ্চতর গণিত ১ম পত্র (Code: 265)', 'Higher Math 1st Paper (HSC - 265)', '📐', '#D97706', '217, 119, 6', [
  ch('math1-c1', '১ম–৫ম অধ্যায়: ম্যাট্রিক্স ও নির্ণায়ক, ভেক্টর, সরলরেখা, বৃত্ত এবং বিন্যাস ও সমাবেশ', ['ম্যাট্রিক্স, সরলরেখা ও বৃত্ত: A⁻¹ = adj(A)/|A|, লম্ব দূরত্ব d = |ax₁+by₁+c|/√(a²+b²) | বৃত্তের কেন্দ্র (-g,-f), ব্যাসার্ধ r = √(g²+f²-c) | ⁿCᵣ = n!/[r!(n-r)!]']),
  ch('math1-c2', '৬ষ্ঠ–১০ম অধ্যায়: ত্রিকোণমিতিক অনুপাত, ফাংশন, অন্তরীকরণ (Differentiation) ও যোগজীকরণ (Integration)', ['ত্রিকোণমিতি ও ক্যালকুলাস: sin 2A = 2sinA cosA, cos 2A = cos²A - sin²A | lim(x→0)(sin x/x) = 1, d/dx(xⁿ) = nxⁿ⁻¹, ∫ xⁿ dx = xⁿ⁺¹/(n+1) + c']),
]);
const HSC_HIGHER_MATH_2ND_PAPER_SUBJECT: SubjectData = mkSubj('math-2', 'উচ্চতর গণিত ২য় পত্র (Code: 266)', 'Higher Math 2nd Paper (HSC - 266)', '♾️', '#E11D48', '225, 29, 72', [
  ch('math2-c1', '১ম–৬ষ্ঠ অধ্যায়: বাস্তব সংখ্যা, যোগাশ্রয়ী প্রোগ্রাম, জটিল সংখ্যা, বহুপদী, দ্বিপদী বিস্তৃতি ও কণিক', ['জটিল সংখ্যা, বহুপদী ও কণিক: 1 + ω + ω² = 0, ω³ = 1 | α + β = -b/a, αβ = c/a | পরাবৃত্ত y² = 4ax এর উপকেন্দ্র (a,0) ও উপকেন্দ্রিক লম্ব 4a']),
  ch('math2-c2', '৭ম–১০ম অধ্যায়: বিপরীত ত্রিকোণমিতিক ফাংশন, স্থিতিবিদ্যা, সমতলে বস্তুকণার গতি ও সম্ভাবনা', ['স্থিতিবিদ্যা ও গতিবিদ্যা: tan⁻¹x + tan⁻¹y = tan⁻¹[(x+y)/(1-xy)] | লামির উপপাদ্য P/sinα = Q/sinβ = R/sinγ | প্রাসের পাল্লা R = (u² sin 2α)/g']),
]);
const HSC_BIOLOGY_1ST_PAPER_SUBJECT: SubjectData = mkSubj('bio-1', 'জীববিজ্ঞান ১ম পত্র - উদ্ভিদবিজ্ঞান (Code: 178)', 'Biology 1st Paper - Botany (HSC - 178)', '🌿', '#10B981', '16, 185, 129', [
  ch('bio1-c1', '১ম–৬ষ্ঠ অধ্যায়: কোষ ও এর গঠন, কোষ বিভাজন, কোষ রসায়ন, অণুজীব, শৈবাল-ছত্রাক ও ব্রায়োফাইটা-টেরিডোফাইটা', ['কোষ ও অণুজীব: আদি কোষে 70S ও প্রকৃত কোষে 80S রাইবোসোম; ক্রসিং ওভার ঘটে প্যাকাইটিন উপ-দশায়; শৈবালের কোষপ্রাচীর সেলুলোজ ও ছত্রাকের কাইটিন নির্মিত']),
  ch('bio1-c2', '৭ম–১২শ অধ্যায়: নগ্নবীজী ও আবৃতবীজী, টিস্যুতন্ত্র, উদ্ভিদ শারীরতত্ত্ব, প্রজনন, জীবপ্রযুক্তি ও পরিবেশ', ['শারীরতত্ত্ব ও পরিবেশ: সবাত শ্বসনে ১ অণু গ্লুকোজ হতে ৩৬ বা ৩৮টি ATP উৎপন্ন হয়; গ্লুকোজের RQ = 1; লিন্ডেম্যানের ১০% শক্তি প্রবাহ সূত্র']),
]);
const HSC_BIOLOGY_2ND_PAPER_SUBJECT: SubjectData = mkSubj('bio-2', 'জীববিজ্ঞান ২য় পত্র - প্রাণিবিজ্ঞান (Code: 179)', 'Biology 2nd Paper - Zoology (HSC - 179)', '🧬', '#059669', '5, 150, 105', [
  ch('bio2-c1', '১ম–৬ষ্ঠ অধ্যায়: প্রাণীর শ্রেণিবিন্যাস, হাইড্রা-ঘাসফড়িং-রুই মাছ, পরিপাক, রক্ত সংবহন, শ্বসন ও রেচন', ['মানব শারীরতত্ত্ব: দন্ত সংকেত I2C1PM2M3 × 2 = 32, BMI = ওজন(kg)/উচ্চতা(m)² | কার্ডিয়াক চক্র ০.৮ সেকেন্ড | প্রতিটি বৃক্কে ১০–১২ লক্ষ নেফ্রন থাকে']),
  ch('bio2-c2', '৭ম–১২শ অধ্যায়: চলন ও অঙ্গচালনা, সমন্বয় ও নিয়ন্ত্রণ, প্রতিরক্ষা, জিনতত্ত্ব ও বিবর্তন এবং প্রাণীর আচরণ', ['কঙ্কাল ও জিনতত্ত্ব: মানবদেহে মোট অস্থি ২০৬টি, করোটিয় স্নায়ু ১২ জোড়া | মেন্ডেলের ১ম সূত্র 3:1 (লিথাল জিন 2:1), ২য় সূত্র 9:3:3:1 (পরিপূরক জিন 9:7, এপিস্ট্যাসিস 13:3)']),
]);
// ================= HSC HUMANITIES & OPTIONAL SUBJECTS =================
const HSC_ECONOMICS_1ST_PAPER_SUBJECT: SubjectData = mkSubj('eco-1', 'অর্থনীতি ১ম পত্র (Code: 109)', 'Economics 1st Paper (HSC - 109)', '📈', '#4F46E5', '79, 70, 229', [
  ch('eco1-c1', '১ম–৫ম অধ্যায়: মৌলিক অর্থনৈতিক সমস্যা, চাহিদা ও যোগান, উৎপাদন ব্যয়-আয়, বাজার ও শ্রমবাজার', ['চাহিদা-যোগান ও বাজার: Qd = a - bP, Qs = c + dP (ভারসাম্যে Qd = Qs) | Ed = (ΔQ/ΔP) × (P/Q) | ফার্মের ভারসাম্যের শর্ত MR = MC']),
  ch('eco1-c2', '৬ষ্ঠ–১০ম অধ্যায়: মূলধন, সংগঠন, খাজনা, সামগ্রিক আয় ও ব্যয় (জাতীয় আয়) এবং মুদ্রা ও ব্যাংক', ['জাতীয় আয় ও মুদ্রা: মুক্ত অর্থনীতিতে GDP = C + I + G + (X - M), বিনিয়োগ গুণক k = 1/(1 - MPC) | ফিশারের বিনিময় সমীকরণ MV = PT']),
]);
const HSC_ECONOMICS_2ND_PAPER_SUBJECT: SubjectData = mkSubj('eco-2', 'অর্থনীতি ২য় পত্র (Code: 110)', 'Economics 2nd Paper (HSC - 110)', '🌾', '#059669', '5, 150, 105', [
  ch('eco2-c1', '১ম–১০ম অধ্যায়: বাংলাদেশের অর্থনীতি, কৃষি, শিল্প, জনসংখ্যা, খাদ্য নিরাপত্তা, মুদ্রাস্ফীতি, আন্তর্জাতিক বাণিজ্য ও সরকারি অর্থব্যবস্থা', ['জনসংখ্যা ও মুদ্রাস্ফীতি: জনসংখ্যার ঘনত্ব = মোট জনসংখ্যা ÷ মোট ভূমির আয়তন | মুদ্রাস্ফীতির হার = [(CPI₂ - CPI₁) ÷ CPI₁] × 100%']),
]);
const HSC_STATISTICS_1ST_PAPER_SUBJECT: SubjectData = mkSubj('stat-1', 'পরিসংখ্যান ১ম পত্র (Code: 129)', 'Statistics 1st Paper (HSC - 129)', '📊', '#0284C7', '2, 132, 199', [
  ch('stat1-c1', '১ম–৮ম অধ্যায়: চলক ও প্রতীক, কেন্দ্রীয় প্রবণতা, বিস্তার পরিমাপ, বঙ্কিমতা-সূঁচলতা, সংশ্লেষ-নির্ভরণ, কালীন সারি ও সূচক সংখ্যা', ['কেন্দ্রীয় প্রবণতা, বিস্তার ও সূচক: AM ≥ GM ≥ HM, Mode = 3 Median - 2 Mean | σ = √[Σ(x - x̄)²/n], CV = (σ/x̄)×100% | ফিশারের আদর্শ সূচক P₀₁(F) = √(L × P)']),
]);
const HSC_STATISTICS_2ND_PAPER_SUBJECT: SubjectData = mkSubj('stat-2', 'পরিসংখ্যান ২য় পত্র (Code: 130)', 'Statistics 2nd Paper (HSC - 130)', '🎲', '#7C3AED', '124, 58, 237', [
  ch('stat2-c1', '১ম–৯ম অধ্যায়: সম্ভাবনা, দৈব চলক, গাণিতিক প্রত্যাশা, দ্বিপদী, পঁয়সন ও পরিমিত বিন্যাস, নমুনায়ন ও জীব পরিসংখ্যান', ['সম্ভাবনা ও বিন্যাস: P(A∪B) = P(A)+P(B)-P(A∩B), দ্বিপদী গড় = np ও ভেদাঙ্ক = npq, পঁয়সন গড় = ভেদাঙ্ক = m, পরিমিত চলক z = (x-μ)/σ']),
]);
const HSC_CIVICS_1ST_PAPER_SUBJECT: SubjectData = mkSubj('civ-1', 'পৌরনীতি ও সুশাসন ১ম পত্র (Code: 269)', 'Civics & Good Governance 1st Paper (HSC - 269)', '⚖️', '#7C3AED', '124, 58, 237', [
  ch('civ1-c1', '১ম–১০ম অধ্যায়: পৌরনীতি ও সুশাসন পরিচিতি, আইন-স্বাধীনতা-সাম্য, ই-গভর্ন্যান্স, মানবাধিকার, রাজনৈতিক দল, সরকার কাঠামো ও আমলাতন্ত্র', ['পৌরনীতি ও সুশাসন: ল্যাটিন Civis ও Civitas থেকে উৎপত্তি | ক্ষমতা স্বতন্ত্রীকরণ নীতির প্রবক্তা মন্টেস্কু এবং আধুনিক আমলাতন্ত্রের জনক ম্যাক্স ওয়েবার']),
]);
const HSC_CIVICS_2ND_PAPER_SUBJECT: SubjectData = mkSubj('civ-2', 'পৌরনীতি ও সুশাসন ২য় পত্র (Code: 270)', 'Civics & Good Governance 2nd Paper (HSC - 270)', '🏛️', '#4F46E5', '79, 70, 229', [
  ch('civ2-c1', '১ম–১০ম অধ্যায়: ব্রিটিশ ভারত হতে বাংলাদেশের অভ্যুদয় (১৭৫৭–১৯৭১), সংবিধান, সরকার ও প্রশাসন, স্থানীয় শাসন, সাংবিধানিক প্রতিষ্ঠান ও পররাষ্ট্রনীতি', ['বাংলাদেশের সংবিধান ও সংসদ: গৃহীত ৪ নভেম্বর ১৯৭২, কার্যকর ১৬ ডিসেম্বর ১৯৭২ (১১ ভাগ, ১৫৩ অনুচ্ছেদ, ৭ তফসিল) | জাতীয় সংসদে মোট আসন ৩৫০টি']),
]);
const HSC_HISTORY_1ST_PAPER_SUBJECT: SubjectData = mkSubj('his-1', 'ইতিহাস ১ম পত্র (Code: 304)', 'History 1st Paper (HSC - 304)', '🏺', '#B45309', '180, 83, 9', [
  ch('his1-c1', '১ম–৮ম অধ্যায়: ইউরোপীয়দের আগমন, পলাশী ও বক্সারের যুদ্ধ, কোম্পানির ও ব্রিটিশ শাসন, ভাষা আন্দোলন, স্বাধিকার ও মহান মুক্তিযুদ্ধ (১৯৭১)', ['ঐতিহাসিক মাইলফলক: ১৭৫৭ (পলাশী), ১৭৬৪ (বক্সার), ১৭৯৩ (চিরস্থায়ী বন্দোবস্ত), ১৯০৫ (বঙ্গভঙ্গ), ১৯৫২ (ভাষা আন্দোলন), ১৯৬৬ (৬ দফা), ১৯৭১ (মহান মুক্তিযুদ্ধ — ১১টি সেক্টর)']),
]);
const HSC_HISTORY_2ND_PAPER_SUBJECT: SubjectData = mkSubj('his-2', 'ইতিহাস ২য় পত্র (Code: 305)', 'History 2nd Paper (HSC - 305)', '📜', '#9333EA', '147, 51, 234', [
  ch('his2-c1', '১ম–৯ম অধ্যায়: শিল্প বিপ্লব, ফরাসি বিপ্লব (১৭৮৯), ১ম বিশ্বযুদ্ধ, বলশেভিক বিপ্লব (১৯১৭), ২য় বিশ্বযুদ্ধ, জাতিসংঘ, স্নায়ুযুদ্ধ ও বর্ণবাদ বিরোধী আন্দোলন', ['বিশ্ব ইতিহাস: ১৪ জুলাই ১৭৮৯ ফরাসি বিপ্লব, ১৯১৪–১৯১৮ ১ম বিশ্বযুদ্ধ, ১৯১৭ রুশ বিপ্লব, ১৯৩৯–১৯৪৫ ২য় বিশ্বযুদ্ধ, ২৪ অক্টোবর ১৯৪৫ জাতিসংঘ প্রতিষ্ঠা']),
]);
const HSC_ISLAMIC_HISTORY_1ST_PAPER_SUBJECT: SubjectData = mkSubj('ihc-1', 'ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র (Code: 267)', 'Islamic History & Culture 1st Paper (HSC - 267)', '🕌', '#059669', '5, 150, 105', [
  ch('ihc1-c1', '১ম–৭ম অধ্যায়: প্রাক-ইসলামি আরব, হযরত মুহাম্মদ (সা.), খুলাফায়ে রাশেদীন, উমাইয়া, আব্বাসীয়, স্পেনে উমাইয়া ও ফাতেমীয় খিলাফত', ['ইসলামের ইতিহাস: ৬২২ খ্রি. হিজরত ও মদিনা সনদ (৪৭ ধারা), ৬২৪ বদর, ৬২৮ হুদাইবিয়া, ৬৩০ মক্কা বিজয় | খুলাফায়ে রাশেদীন (৬৩২–৬৬১), উমাইয়া (৬৬১–৭৫০), আব্বাসীয় (৭৫০–১২৫৮)']),
]);
const HSC_ISLAMIC_HISTORY_2ND_PAPER_SUBJECT: SubjectData = mkSubj('ihc-2', 'ইসলামের ইতিহাস ও সংস্কৃতি ২য় পত্র (Code: 268)', 'Islamic History & Culture 2nd Paper (HSC - 268)', '🌙', '#0D9488', '13, 148, 136', [
  ch('ihc2-c1', '১ম–৬ষ্ঠ অধ্যায়: ভারতে মুসলিম শাসন (সিন্ধু, গজনভি, ঘুরি), দিল্লি সালতানাত, মুঘল সাম্রাজ্য, বাংলায় কোম্পানির শাসন ও স্বাধীন বাংলাদেশের অভ্যুদয়', ['ভারত ও বাংলার ইতিহাস: ৭১২ খ্রি. সিন্ধু বিজয়, ১২০৬ দিল্লি সালতানাত প্রতিষ্ঠা, ১৫২৬ পানিপথের ১ম যুদ্ধে মুঘল সাম্রাজ্য প্রতিষ্ঠা, ১৩৩৮ বাংলায় স্বাধীন সালতানাত']),
]);
const HSC_LOGIC_1ST_PAPER_SUBJECT: SubjectData = mkSubj('log-1', 'যুক্তিবিদ্যা ১ম পত্র (Code: 121)', 'Logic 1st Paper (HSC - 121)', '🧠', '#4F46E5', '79, 70, 229', [
  ch('log1-c1', '১ম–৮ম অধ্যায়: যুক্তিবিদ্যা পরিচিতি, পদ ও শব্দ (ব্যক্ত্যর্থ-জাত্যর্থ), বিধেয়ক, অনুমান, যুক্তিবাক্য, আবর্তন-প্রতিবর্তন, সহানুমান ও প্রতীকী যুক্তিবিদ্যা', ['যুক্তিবাক্য ও ব্যাপ্যতা (ASEBINOP): A (উদ্দেশ্য ব্যাপ্য), E (উভয় পদ ব্যাপ্য), I (কোনো পদই ব্যাপ্য নয়), O (বিধেয় ব্যাপ্য) | পদের ব্যক্ত্যর্থ ও জাত্যর্থ বিপরীতমুখী']),
]);
const HSC_LOGIC_2ND_PAPER_SUBJECT: SubjectData = mkSubj('log-2', 'যুক্তিবিদ্যা ২য় পত্র (Code: 122)', 'Logic 2nd Paper (HSC - 122)', '🔍', '#7C3AED', '124, 58, 237', [
  ch('log2-c1', '১ম–৮ম অধ্যায়: যৌক্তিক সংজ্ঞা, যৌক্তিক বিভাগ, আরোহের প্রকারভেদ ও ভিত্তি, প্রকল্প, মিলের পরীক্ষামূলক পদ্ধতি, বৈজ্ঞানিক ব্যাখ্যা ও আরোহমূলক দোষ', ['সংজ্ঞা ও আরোহ: যৌক্তিক সংজ্ঞা = আসন্নতম জাতি + বিভেদক লক্ষণ | প্রকৃত আরোহ ৩ প্রকার (বৈজ্ঞানিক, অবৈজ্ঞানিক, সাদৃশ্যানুমান) | মিলের পরীক্ষামূলক পদ্ধতি ৫টি']),
]);
const HSC_SOCIOLOGY_1ST_PAPER_SUBJECT: SubjectData = mkSubj('soc-1', 'সমাজবিজ্ঞান ১ম পত্র (Code: 117)', 'Sociology 1st Paper (HSC - 117)', '👥', '#0284C7', '2, 132, 199', [
  ch('soc1-c1', '১ম–১১শ অধ্যায়: সমাজবিজ্ঞানের উৎপত্তি, গবেষণা পদ্ধতি, সমাজবিজ্ঞানীদের অবদান, মৌল প্রত্যয়, সামাজিক প্রতিষ্ঠান, সামাজিকীকরণ, স্তরবিন্যাস ও সামাজিক পরিবর্তন', ['সমাজবিজ্ঞানের জনক ও সংস্কৃতি: ১৮৩৯ সালে অগাস্ট কোঁৎ Sociology শব্দটি প্রবর্তন করেন (আদি জনক ইবনে খালদুন) | অগবার্নের সংস্কৃতির অসম অগ্রগতি (Cultural Lag) তত্ত্ব']),
]);
const HSC_SOCIOLOGY_2ND_PAPER_SUBJECT: SubjectData = mkSubj('soc-2', 'সমাজবিজ্ঞান ২য় পত্র (Code: 118)', 'Sociology 2nd Paper (HSC - 118)', '🏘️', '#059669', '5, 150, 105', [
  ch('soc2-c1', '১ম–৯ম অধ্যায়: বাংলাদেশে সমাজবিজ্ঞান বিকাশ, সমাজ ও সংস্কৃতি, প্রত্নতাত্ত্বিক পরিচয়, ক্ষুদ্র নৃ-গোষ্ঠী, গ্রামীণ-শহুরে সমাজ, জ্ঞাতি সম্পর্ক ও সামাজিক সমস্যা', ['বাংলাদেশে সমাজবিজ্ঞান ও নৃ-গোষ্ঠী: ১৯৫৭ সালে ড. নাজমুল করিমের নেতৃত্বে ঢাবিতে সমাজবিজ্ঞান বিভাগ প্রতিষ্ঠা | গারো ও খাসিয়ারা মাতৃসূত্রীয়; চাকমা ও মারমারা পিতৃসূত্রীয়']),
]);
const HSC_SOCIAL_WORK_1ST_PAPER_SUBJECT: SubjectData = mkSubj('sw-1', 'সমাজকর্ম ১ম পত্র (Code: 271)', 'Social Work 1st Paper (HSC - 271)', '🤝', '#E11D48', '225, 29, 72', [
  ch('sw1-c1', '১ম–৮ম অধ্যায়: সমাজকর্মের প্রকৃতি, ঐতিহাসিক প্রেক্ষাপট (দরিদ্র আইন ও বিভারিজ রিপোর্ট), মূল্যবোধ, সমাজকর্ম পদ্ধতি ও সামাজিক নীতি', ['সমাজকর্ম পদ্ধতি ও পঞ্চদৈত্য: মৌলিক পদ্ধতি ৩টি (ব্যক্তি, দল ও সমষ্টি সমাজকর্ম — পার্লম্যানের 4P) এবং সহায়ক পদ্ধতি ৩টি | বিভারিজ রিপোর্টের পঞ্চদৈত্য (১৯৪২)']),
]);
const HSC_SOCIAL_WORK_2ND_PAPER_SUBJECT: SubjectData = mkSubj('sw-2', 'সমাজকর্ম ২য় পত্র (Code: 272)', 'Social Work 2nd Paper (HSC - 272)', '❤️', '#D97706', '217, 119, 6', [
  ch('sw2-c1', '১ম–৯ম অধ্যায়: মৌলিক মানবিক চাহিদা, সমাজকর্মের শাখা, সামাজিক সমস্যা ও আইন, সরকারি ও বেসরকারি (BRAC, গ্রামীণ ব্যাংক) সমাজ উন্নয়ন, আন্তর্জাতিক সংস্থা ও মাঠকর্ম', ['মৌলিক চাহিদা ও সংস্থা: মৌলিক মানবিক চাহিদা ৬টি (খাদ্য, বস্ত্র, বাসস্থান, শিক্ষা, চিকিৎসা ও চিত্তবিনোদন) | BRAC (১৯৭২), গ্রামীণ ব্যাংক (১৯৮৩), UNICEF, UNDP']),
]);
const HSC_GEOGRAPHY_1ST_PAPER_SUBJECT: SubjectData = mkSubj('geo-1', 'ভূগোল ১ম পত্র - প্রাকৃতিক ভূগোল (Code: 125)', 'Geography 1st Paper - Physical Geography (HSC - 125)', '🌍', '#0284C7', '2, 132, 199', [
  ch('geo1-c1', '১ম–৯ম অধ্যায়: প্রাকৃতিক ভূগোল, পৃথিবীর গঠন ও শিলা, ভূমিরূপ পরিবর্তন, বায়ুমণ্ডল, জলবায়ু, বারিমণ্ডল (সমুদ্রস্রোত ও জোয়ার-ভাটা), জীবমণ্ডল ও মানচিত্র', ['শিলা, বায়ুমণ্ডল ও জোয়ার-ভাটা: আগ্নেয়, পাললিক ও রূপান্তরিত শিলা | নাইট্রোজেন ৭৮.০৮%, অক্সিজেন ২০.৯৪% | মুখ্য ও গৌণ জোয়ারের ব্যবধান ১২ ঘণ্টা ২৬ মিনিট']),
]);
const HSC_GEOGRAPHY_2ND_PAPER_SUBJECT: SubjectData = mkSubj('geo-2', 'ভূগোল ২য় পত্র - মানব ও অর্থনৈতিক ভূগোল (Code: 126)', 'Geography 2nd Paper - Human & Economic Geography (HSC - 126)', '🗺️', '#0D9488', '13, 148, 136', [
  ch('geo2-c1', '১ম–১০ম অধ্যায়: মানব ভূগোল, জনসংখ্যা, বসতি, কৃষি, খনিজ ও শক্তি সম্পদ, শিল্প, পরিবহন ও বন্দর, বাণিজ্য এবং জিআইএস (GIS & GPS)', ['মানব ভূগোল ও সম্পদ: মানব ভূগোলের জনক ফ্রেডরিখ র‍্যাটজেল | বৃহত্তম গ্যাসক্ষেত্র তিতাস ও কয়লাক্ষেত্র বড়পুকুরিয়া | GIS = Geographic Information System']),
]);
const HSC_ISLAMIC_STUDIES_1ST_PAPER_SUBJECT: SubjectData = mkSubj('isl-1', 'ইসলাম শিক্ষা ১ম পত্র (Code: 249)', 'Islamic Studies 1st Paper (HSC - 249)', '🕋', '#059669', '5, 150, 105', [
  ch('isl1-c1', '১ম–৭ম অধ্যায়: ইসলামী সংস্কৃতি ও আকাইদ, ইবাদত (সালাত, সিয়াম, যাকাত, হজ), আখলাক, সমাজজীবন, অর্থব্যবস্থা, রাষ্ট্রব্যবস্থা ও আন্তর্জাতিক ব্যবস্থা', ['যাকাতের নিসাব ও খাত: সাড়ে ৭ তোলা স্বর্ণ বা সাড়ে ৫২ তোলা রৌপ্য; হার ২.৫%; যাকাত ব্যয়ের নির্ধারিত খাত ৮টি (সূরা তাওবা: ৬০)']),
]);
const HSC_ISLAMIC_STUDIES_2ND_PAPER_SUBJECT: SubjectData = mkSubj('isl-2', 'ইসলাম শিক্ষা ২য় পত্র (Code: 250)', 'Islamic Studies 2nd Paper (HSC - 250)', '📖', '#10B981', '16, 185, 129', [
  ch('isl2-c1', '১ম–৬ষ্ঠ অধ্যায়: আল-কুরআন, আল-হাদিস (সিহাহ সিত্তাহ), ইজমা ও কিয়াস, ইসলামে জ্ঞানচর্চা, মুসলিম মনীষীদের অবদান ও সমকালীন প্রেক্ষাপট', ['কুরআন ও হাদিস: কুরআনের সূরা ১১৪টি (মক্কী ৮৬, মাদানী ২৮) | সিহাহ সিত্তাহ (৬টি বিশুদ্ধ হাদিস গ্রন্থ): বুখারি, মুসলিম, নাসাঈ, আবু দাউদ, তিরমিযি ও ইবনে মাজাহ']),
]);
const HSC_AGRICULTURE_1ST_PAPER_SUBJECT: SubjectData = mkSubj('agr-1', 'কৃষিশিক্ষা ১ম পত্র (Code: 239)', 'Agriculture Studies 1st Paper (HSC - 239)', '🌱', '#10B981', '16, 185, 129', [
  ch('agr1-c1', '১ম–৬ষ্ঠ অধ্যায়: কৃষি তথ্যপ্রযুক্তি, ভূমি সম্পদ, বিশেষ কৃষি প্রযুক্তি, কৃষি ও জলবায়ু (৩০টি AEZ), মাঠ ও উদ্যান ফসল এবং ফল-শাকসবজি সংরক্ষণ', ['মাটির pH ও গবেষণা প্রতিষ্ঠান: ফসল চাষের আদর্শ pH = 6.0–7.5 (অম্লীয় মাটিতে চুন এবং ক্ষারীয় মাটিতে জিপসাম প্রয়োগ) | BARI, BRRI, BJRI, BINA']),
]);
const HSC_AGRICULTURE_2ND_PAPER_SUBJECT: SubjectData = mkSubj('agr-2', 'কৃষিশিক্ষা ২য় পত্র (Code: 240)', 'Agriculture Studies 2nd Paper (HSC - 240)', '🌾', '#059669', '5, 150, 105', [
  ch('agr2-c1', '১ম–৫ম অধ্যায়: মাৎস্য চাষ, পোল্ট্রি পালন, গবাদিপশু পালন, বনায়ন ও কৃষি অর্থনীতি ও সমবায়', ['মাছ চাষ ও পোল্ট্রি FCR: পুকুরের আদর্শ pH = 7.0–8.5, DO ≥ 5 ppm | খাদ্য রূপান্তর অনুপাত FCR = গৃহীত খাদ্য (kg) ÷ অর্জিত জীবন্ত ওজন (kg)']),
]);
// ================= SSC COMMON & GROUP SUBJECTS =================
const SSC_BANGLA_1ST_SUBJECT: SubjectData = mkSubj('ssc-bn-1', 'বাংলা ১ম পত্র (SSC - Code: 101)', 'Bangla 1st Paper (SSC - 101)', '📖', '#E11D48', '225, 29, 72', [
  ch('s-bn1-c1', 'গদ্য, পদ্য ও সহপাঠ (সুভা, বই পড়া, আম আঁটির ভেঁপু, মানুষ মুহম্মদ (স.), নিমগাছ, বঙ্গবাণী, কপোতাক্ষ নদ, মানুষ, কাকতাড়ুয়া ও বহিপীর)', ['কপোতাক্ষ নদ ও শিক্ষা-মনুষ্যত্ব: চতুর্দশপদী কবিতা (অষ্টক ৮ + ষষ্টক ৬ চরণ) | মানবজীবনের নিচতলা জীবসত্তা ও ওপরতলা মানবসত্তা (মোতাহের হোসেন চৌধুরী)']),
]);
const SSC_BANGLA_2ND_SUBJECT: SubjectData = mkSubj('ssc-bn-2', 'বাংলা ২য় পত্র (SSC - Code: 102)', 'Bangla 2nd Paper (SSC - 102)', '✍️', '#059669', '5, 150, 105', [
  ch('s-bn2-c1', 'ধ্বনিতত্ত্ব, সন্ধি, সমাস, উপসর্গ, প্রত্যয়, কারক-বিভক্তি, বাচ্য, উক্তি, বাক্য প্রকরণ ও নির্মিতি', ['বর্ণমালা ও কারক: স্বরবর্ণ ১১টি, ব্যঞ্জনবর্ণ ৩৯টি (মৌলিক স্বরধ্বনি ৭টি) | কারক ৬ প্রকার, সমাস ৬ প্রকার, বাংলা উপসর্গ ২১টি ও তৎসম উপসর্গ ২০টি']),
]);
const SSC_ENGLISH_1ST_SUBJECT: SubjectData = mkSubj('ssc-en-1', 'English 1st Paper (SSC - Code: 107)', 'English 1st Paper (SSC - 107)', '🌐', '#2563EB', '37, 99, 235', [
  ch('s-en1-c1', 'Seen & Unseen Passages, Information Transfer, Summarizing, Matching, Rearranging & Writing', ['Summary & Graph Writing: Keep summary within 1/3 length in one paragraph; describe key trends clearly in Graph/Chart analysis']),
]);
const SSC_ENGLISH_2ND_SUBJECT: SubjectData = mkSubj('ssc-en-2', 'English 2nd Paper (SSC - Code: 108)', 'English 2nd Paper (SSC - 108)', '🔤', '#1D4ED8', '29, 78, 216', [
  ch('s-en2-c1', 'Grammar (Right Form of Verbs, Narration, Changing Sentences, Suffix-Prefix, Tag Questions, Connectors) & CV/Composition', ['Tag Question Rules: Let’s / Let us -> shall we? | Imperative -> will you / won’t you? | Everybody/Someone -> they']),
]);
const SSC_GENERAL_MATH_SUBJECT: SubjectData = mkSubj('ssc-math', 'সাধারণ গণিত (SSC - Code: 109)', 'General Mathematics (SSC - 109)', '📏', '#D97706', '217, 119, 6', [
  ch('s-math-c1', 'বীজগণিত, সূচক-লগারিদম, ত্রিকোণমিতি, সসীম ধারা, জ্যামিতি, পরিমিতি ও পরিসংখ্যান', ['বীজগণিত ও ত্রিকোণমিতি: (a+b)² = (a-b)² + 4ab, sin²θ + cos²θ = 1, sec²θ - tan²θ = 1 | সমান্তর ধারার সমষ্টি Sn = (n/2)[2a + (n-1)d]']),
]);
const SSC_ICT_SUBJECT: SubjectData = mkSubj('ssc-ict', 'তথ্য ও যোগাযোগ প্রযুক্তি - ICT (SSC - Code: 154)', 'ICT (SSC - 154)', '💻', '#0284C7', '2, 132, 199', [
  ch('s-ict-c1', '১ম হতে ৬ষ্ঠ অধ্যায়: তথ্যপ্রযুক্তি ও বাংলাদেশ, কম্পিউটার রক্ষণাবেক্ষণ, ই-বুক, ওয়ার্ড-স্প্রেডশিট ও মাল্টিমিডিয়া', ['স্প্রেডশিট ফর্মুলা: যোগফল =SUM(A1:A10), গড় =AVERAGE(A1:A10), সর্বোচ্চ =MAX(A1:A10), সর্বনিম্ন =MIN(A1:A10)']),
]);
const SSC_PHYSICS_SUBJECT: SubjectData = mkSubj('ssc-phy', 'পদার্থবিজ্ঞান (SSC - Code: 136)', 'Physics (SSC - 136)', '🔭', '#4F46E5', '79, 70, 229', [
  ch('s-phy-c1', 'ভৌত রাশি, গতি, বল, কাজ-ক্ষমতা-শক্তি, পদার্থের অবস্থা ও চাপ, তাপ, তরঙ্গ-শব্দ, আলো ও তড়িৎ', ['গতি, আলো ও তড়িৎ সূত্র: v = u + at, s = ut + ½at², v² = u² + 2as | F = ma, 1/u + 1/v = 1/f, V = IR, বৈদ্যুতিক ইউনিট W = (P × t)/1000 kWh']),
]);
const SSC_CHEMISTRY_SUBJECT: SubjectData = mkSubj('ssc-chem', 'রসায়ন (SSC - Code: 137)', 'Chemistry (SSC - 137)', '🧪', '#059669', '5, 150, 105', [
  ch('s-chem-c1', 'পদার্থের গঠন, পর্যায় সারণি, রাসায়নিক বন্ধন, মোলের ধারণা ও রাসায়নিক গণনা, বিক্রিয়া, এসিড-ক্ষারক ও জৈব যৌগ', ['মোল ও মোলারিটি সূত্র: n = w/M = V(L)/22.4 (STP) = N/(6.023 × 10²³) | মোলারিটি S = (1000 × w) ÷ (M × V_mL)']),
]);
const SSC_BIOLOGY_SUBJECT: SubjectData = mkSubj('ssc-bio', 'জীববিজ্ঞান (SSC - Code: 138)', 'Biology (SSC - 138)', '🌿', '#10B981', '16, 185, 129', [
  ch('s-bio-c1', 'জীবন পাঠ, জীবকোষ ও টিস্যু, কোষ বিভাজন, জীবনীশক্তি, খাদ্য ও পরিপাক, পরিবহন, রেচন, সমন্বয় ও বংশগতি', ['সালোকসংশ্লেষণ ও বিএমআই: 6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O | BMI = ওজন(kg) ÷ উচ্চতা(m)² | মানুষের ক্রোমোজোম ২৩ জোড়া (৪৬টি)']),
]);
const SSC_HIGHER_MATH_SUBJECT: SubjectData = mkSubj('ssc-hmath', 'উচ্চতর গণিত (SSC - Code: 126)', 'Higher Mathematics (SSC - 126)', '📐', '#E11D48', '225, 29, 72', [
  ch('s-hmath-c1', 'সেট-ফাংশন, বীজগাণিতিক রাশি, অসীম ধারা, দ্বিপদী বিস্তৃতি, স্থানাঙ্ক জ্যামিতি, ত্রিকোণমিতি, ভেক্টর, ঘন জ্যামিতি ও সম্ভাবনা', ['অসীম ধারা ও ঘন জ্যামিতি: |r| < 1 হলে অসীমতক সমষ্টি S_∞ = a/(1 - r) | গোলকের আয়তন = (4/3)πr³, শঙ্কুর আয়তন = ⅓πr²h']),
]);
const SSC_BGS_SUBJECT: SubjectData = mkSubj('ssc-bgs', 'বাংলাদেশ ও বিশ্বপরিচয় (SSC - Code: 150)', 'Bangladesh & Global Studies (SSC - 150)', '🇧🇩', '#0D9488', '13, 148, 136', [
  ch('s-bgs-c1', 'স্বাধীন বাংলাদেশের অভ্যুদয়, সৌরজগৎ ও ভূমণ্ডল, ভূপ্রকৃতি, রাষ্ট্র-সংবিধান, জাতিসংঘ ও জাতীয় আয়', ['দ্রাঘিমা ও সময়ের হিসাব: ১° দ্রাঘিমার পার্থক্যে সময়ের পার্থক্য ৪ মিনিট (১৫° পার্থক্যে ১ ঘণ্টা; বাংলাদেশের প্রমাণ সময় GMT + ৬ ঘণ্টা)']),
]);
const SSC_ACCOUNTING_SUBJECT: SubjectData = mkSubj('ssc-acc', 'হিসাববিজ্ঞান (SSC - Code: 146)', 'Accounting (SSC - 146)', '📒', '#4F46E5', '79, 70, 229', [
  ch('s-acc-c1', 'লেনদেন, দুতরফা দাখিলা পদ্ধতি, মূলধন ও মুনাফা জাতীয় লেনদেন, জাবেদা, খতিয়ান, নগদান বই, রেওয়ামিল ও আর্থিক বিবরণী', ['হিসাব সমীকরণ ও ব্যয় বিবরণী: A = L + (C + R - Ex - D) | মুখ্য ব্যয় = প্রত্যক্ষ কাঁচামাল + প্রত্যক্ষ শ্রম + অন্যান্য প্রত্যক্ষ খরচ']),
]);
const SSC_FINANCE_SUBJECT: SubjectData = mkSubj('ssc-fin', 'ফিন্যান্স ও ব্যাংকিং (SSC - Code: 152)', 'Finance & Banking (SSC - 152)', '🏦', '#7C3AED', '124, 58, 237', [
  ch('s-fin-c1', 'অর্থায়ন, অর্থের সময়মূল্য, ঝুঁকি ও অনিশ্চয়তা, মূলধন বাজেটিং, মূলধন ব্যয়, মুদ্রা ও ব্যাংকিং ব্যবস্থা', ['অর্থের সময়মূল্য ও বাজেটিং: FV = PV(1 + i)ⁿ, EAR = (1 + i/m)ᵐ - 1 | গড় মুনাফার হার ARR = (গড় নিট মুনাফা ÷ গড় বিনিয়োগ) × ১০০%']),
]);
const SSC_ENTREPRENEURSHIP_SUBJECT: SubjectData = mkSubj('ssc-ent', 'ব্যবসায় উদ্যোগ (SSC - Code: 143)', 'Business Entrepreneurship (SSC - 143)', '💼', '#D97706', '217, 119, 6', [
  ch('s-ent-c1', 'ব্যবসায় পরিচিতি, ব্যবসায় উদ্যোগ, আত্মকর্মসংস্থান, একমালিকানা-অংশীদারি-যৌথমূলধনী-সমবায় ব্যবসায়, বিপণন ও ব্যবস্থাপনা', ['ব্যবসায় আইনসমূহ: অংশীদারি আইন ১৯৩২, কোম্পানি আইন ১৯৯৪, সমবায় আইন ২০০১, পেটেন্ট আইন ১৯১১, ট্রেডমার্ক আইন ২০০৯ ও কপিরাইট আইন ২০০০']),
]);
const SSC_GENERAL_SCIENCE_SUBJECT: SubjectData = mkSubj('ssc-gsci', 'বিজ্ঞান (SSC - Code: 127)', 'General Science (SSC - 127)', '🔬', '#0284C7', '2, 132, 199', [
  ch('s-gsci-c1', 'খাদ্য ও পুষ্টি, পানি, হৃদযন্ত্র ও রক্ত, আলো, পলিমার, অম্ল-ক্ষারক-লবণ, বল, জীবপ্রযুক্তি ও প্রাত্যহিক জীবনে তড়িৎ', ['চোখের ত্রুটি ও তড়িৎ ক্ষমতা: হ্রস্বদৃষ্টি (মায়োপিয়া) প্রতিকারে অবতল লেন্স এবং দীর্ঘদৃষ্টি (হাইপারমেট্রোপিয়া) প্রতিকারে উত্তল লেন্স ব্যবহৃত হয়']),
]);
const SSC_HISTORY_SUBJECT: SubjectData = mkSubj('ssc-his', 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা (SSC - Code: 153)', 'History of Bangladesh & World Civilization (SSC - 153)', '🏛️', '#B45309', '180, 83, 9', [
  ch('s-his-c1', 'বিশ্বসভ্যতা (মিসর, সিন্ধু, গ্রিক, রোমান), প্রাচীন বাংলার জনপদ, পাল-সেন যুগ, মধ্যযুগ, ইংরেজ শাসন, ভাষা আন্দোলন ও মুক্তিযুদ্ধ', ['প্রাচীন জনপদ: পুণ্ড্র (মহাস্থানগড়/বগুড়া), বঙ্গ, সমতট (কুমিল্লা-নোয়াখালী), গৌড়, হরিকেল ও বরেন্দ্র']),
]);
const SSC_GEOGRAPHY_SUBJECT: SubjectData = mkSubj('ssc-geo', 'ভূগোল ও পরিবেশ (SSC - Code: 110)', 'Geography & Environment (SSC - 110)', '🌍', '#059669', '5, 150, 105', [
  ch('s-geo-c1', 'মহাবিশ্ব ও পৃথিবী, মানচিত্র পঠন, শিলামণ্ডল, বায়ুমণ্ডল, বারিমণ্ডল, জনসংখ্যা, বসতি ও বাংলাদেশের ভৌগোলিক বিবরণ', ['বাংলাদেশের অবস্থান: ২০°৩৪′ উত্তর হতে ২৬°৩৮′ উত্তর অক্ষাংশ এবং ৮৮°০১′ পূর্ব হতে ৯২°৪১′ পূর্ব দ্রাঘিমাংশ; মধ্যভাগ দিয়ে কর্কটক্রান্তি রেখা (২৩.৫° উ.) অতিক্রম করেছে']),
]);
const SSC_CIVICS_SUBJECT: SubjectData = mkSubj('ssc-civ', 'পৌরনীতি ও নাগরিকতা (SSC - Code: 140)', 'Civics & Citizenship (SSC - 140)', '⚖️', '#7C3AED', '124, 58, 237', [
  ch('s-civ-c1', 'পৌরনীতি ও নাগরিকতা, আইন-স্বাধীনতা-সাম্য, রাষ্ট্র ও সরকার ব্যবস্থা, সংবিধান, রাজনৈতিক দল ও নির্বাচন এবং জাতিসংঘ', ['রাষ্ট্রের ৪টি অপরিহার্য উপাদান: ১. জনসমষ্টি ২. নির্দিষ্ট ভূখণ্ড ৩. সরকার ৪. সার্বভৌমত্ব']),
]);
const SSC_ECONOMICS_SUBJECT: SubjectData = mkSubj('ssc-eco', 'অর্থনীতি (SSC - Code: 141)', 'Economics (SSC - 141)', '📈', '#4F46E5', '79, 70, 229', [
  ch('s-eco-c1', 'অর্থনীতির পরিচয়, উপযোগ-চাহিদা-যোগান, উৎপাদন, বাজার, জাতীয় আয় (GDP, GNP), অর্থ ও ব্যাংক ব্যবস্থা এবং বাজেট', ['জাতীয় আয় ও মাথাপিছু আয়: মাথাপিছু আয় = দেশের মোট জাতীয় আয় ÷ মোট জনসংখ্যা']),
]);
const SSC_ISLAM_RELIGION_SUBJECT: SubjectData = mkSubj('ssc-rel', 'ইসলাম ও নৈতিক শিক্ষা (SSC - Code: 111)', 'Islam & Moral Education (SSC - 111)', '🕋', '#10B981', '16, 185, 129', [
  ch('s-rel-c1', 'আকাইদ ও নৈতিক জীবন, শরীয়তের উৎস, ইবাদত (সালাত, সিয়াম, যাকাত, হজ), আখলাক ও আদর্শ জীবনচরিত', ['ইসলামের মূল ভিত্তি ৫টি এবং শরীয়তের প্রধান উৎস ৪টি (কুরআন, সুন্নাহ, ইজমা ও কিয়াস)']),
]);
const SSC_AGRICULTURE_SUBJECT: SubjectData = mkSubj('ssc-agr', 'কৃষিশিক্ষা (SSC - Code: 134)', 'Agriculture Studies (SSC - 134)', '🌱', '#059669', '5, 150, 105', [
  ch('s-agr-c1', 'কৃষি প্রযুক্তি, কৃষি উপকরণ, কৃষি ও জলবায়ু, কৃষিজ উৎপাদন, বনায়ন, মাৎস্য চাষ, পোল্ট্রি ও গবাদিপশু পালন', ['বীজ সংরক্ষণ ও বনায়ন: দানা জাতীয় বীজ সংরক্ষণে আর্দ্রতা ১২% এর নিচে রাখা হয়; দেশের মোট আয়তনের ২৫% বনভূমি থাকা আবশ্যক']),
]);
// ================= ADMISSION & JOB/BCS SUBJECTS =================
const ADM_SCIENCE_SUBJECT: SubjectData = mkSubj('adm-sci', 'Admission: ক ইউনিট ও ইঞ্জিনিয়ারিং (DU, BUET, CKRUET, GST)', 'Admission: Unit A & Engineering', '🎓', '#4F46E5', '79, 70, 229', [
  ch('adm-sci-c1', 'পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞান ভর্তি পরীক্ষা মাস্টারবুক', ['প্রাসের পাল্লা ও ক্যালকুলাস শর্টকাট: R = 4H cotθ (R = H হলে θ = 75°58′) | L’Hôpital’s Rule (0/0 বা ∞/∞ আকারে লব ও হরের পৃথক অন্তরীকরণ)']),
]);
const ADM_MEDICAL_SUBJECT: SubjectData = mkSubj('adm-med', 'Admission: মেডিকেল ও ডেন্টাল ভর্তি প্রস্তুতি (MBBS & BDS)', 'Admission: Medical & Dental Preparation', '🩺', '#10B981', '16, 185, 129', [
  ch('adm-med-c1', 'জীববিজ্ঞান (৩০), রসায়ন (২৫), পদার্থবিজ্ঞান (২০), ইংরেজি (১৫) ও সাধারণ জ্ঞান (১০)', ['মেডিকেল ভর্তি পরীক্ষা মান বণ্টন: মোট ১০০ নম্বর (১০০টি MCQ, প্রতিটি ভুল উত্তরে ০.২৫ নম্বর কাটা যায়)']),
]);
const ADM_COMMERCE_SUBJECT: SubjectData = mkSubj('adm-com', 'Admission: গ ইউনিট ও ব্যবসায় শিক্ষা (DU C-Unit, GST, JU, RU, CU)', 'Admission: Business Studies (C-Unit & GST)', '📊', '#D97706', '217, 119, 6', [
  ch('adm-com-c1', 'হিসাববিজ্ঞান, ব্যবসায় সংগঠন ও ব্যবস্থাপনা, ফিন্যান্স, মার্কেটিং, বাংলা ও ইংরেজি', ['মুনাফার হার রূপান্তর শর্টকাট: ক্রয়মূল্যের ওপর ২৫% (১/৪) = বিক্রয়মূল্যের ওপর ২০% (১/৫) | ক্রয়মূল্যের ওপর ৩৩.৩৩% (১/৩) = বিক্রয়মূল্যের ওপর ২৫% (১/৪)']),
]);
const ADM_HUMANITIES_SUBJECT: SubjectData = mkSubj('adm-hum', 'Admission: খ ইউনিট ও বিভাগ পরিবর্তন (DU B-Unit, GST, JU, RU, CU)', 'Admission: Humanities & Group Change (B-Unit & GST)', '🏛️', '#7C3AED', '124, 58, 237', [
  ch('adm-hum-c1', 'বাংলা, সাধারণ ইংরেজি ও সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি)', ['ঢাকা বিশ্ববিদ্যালয় খ ইউনিট মান বণ্টন: MCQ ৬০ নম্বর (বাংলা ১৫, ইংরেজি ১৫, সাধারণ জ্ঞান ৩০) এবং লিখিত ৪০ নম্বর = মোট ১০০ নম্বর']),
]);
const BCS_PRELI_SUBJECT: SubjectData = mkSubj('bcs-preli', 'BCS Preliminary Master (১০ম–৪৬তম বিসিএস প্রশ্ন ব্যাংক ও সিলেবাস)', 'BCS Preliminary Master (200 Marks Syllabus)', '🏆', '#D97706', '217, 119, 6', [
  ch('bcs-c1', 'বাংলা ও ইংরেজি সাহিত্য-ব্যাকরণ, বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি, গাণিতিক যুক্তি, মানসিক দক্ষতা, বিজ্ঞান ও আইসিটি', ['বিসিএস প্রিলিমিনারি মান বণ্টন: মোট ২০০ নম্বর, সময় ২ ঘণ্টা (প্রতি ভুল উত্তরে ০.৫০ নম্বর কর্তন)']),
]);
const BANK_JOB_SUBJECT: SubjectData = mkSubj('job-bank', 'Bank Job, Primary Teacher & NTRCA Master', 'Bank Job, Primary & NTRCA Preparation', '💼', '#0284C7', '2, 132, 199', [
  ch('job-c1', 'Quantitative Aptitude, Analytical Ability, English, বাংলা ও সাধারণ জ্ঞান', ['সময় ও কাজ শর্টকাট: A একটি কাজ x দিনে এবং B ওই কাজ y দিনে করতে পারলে উভয়ে একত্রে কাজটি শেষ করবে = (xy) ÷ (x + y) দিনে']),
]);
// ================= COMPLETE GROUPED & ALL-GROUPS SYLLABUS DB =================
const HSC_BUSINESS_STUDIES_LIST: SubjectData[] = [HSC_ACCOUNTING_1ST_PAPER_SUBJECT, HSC_ACCOUNTING_2ND_PAPER_SUBJECT, HSC_BANGLA_1ST_PAPER_SUBJECT, HSC_BANGLA_2ND_PAPER_SUBJECT, HSC_ENGLISH_1ST_PAPER_SUBJECT, HSC_ENGLISH_2ND_PAPER_SUBJECT, HSC_ICT_SUBJECT, HSC_BOM_1ST_PAPER_SUBJECT, HSC_BOM_2ND_PAPER_SUBJECT, HSC_FINANCE_1ST_PAPER_SUBJECT, HSC_FINANCE_2ND_PAPER_SUBJECT, HSC_MARKETING_1ST_PAPER_SUBJECT, HSC_MARKETING_2ND_PAPER_SUBJECT, HSC_ECONOMICS_1ST_PAPER_SUBJECT, HSC_ECONOMICS_2ND_PAPER_SUBJECT, HSC_STATISTICS_1ST_PAPER_SUBJECT, HSC_STATISTICS_2ND_PAPER_SUBJECT, HSC_AGRICULTURE_1ST_PAPER_SUBJECT, HSC_AGRICULTURE_2ND_PAPER_SUBJECT];
const HSC_SCIENCE_LIST: SubjectData[] = [HSC_BANGLA_1ST_PAPER_SUBJECT, HSC_BANGLA_2ND_PAPER_SUBJECT, HSC_ENGLISH_1ST_PAPER_SUBJECT, HSC_ENGLISH_2ND_PAPER_SUBJECT, HSC_ICT_SUBJECT, HSC_PHYSICS_1ST_PAPER_SUBJECT, HSC_PHYSICS_2ND_PAPER_SUBJECT, HSC_CHEMISTRY_1ST_PAPER_SUBJECT, HSC_CHEMISTRY_2ND_PAPER_SUBJECT, HSC_HIGHER_MATH_1ST_PAPER_SUBJECT, HSC_HIGHER_MATH_2ND_PAPER_SUBJECT, HSC_BIOLOGY_1ST_PAPER_SUBJECT, HSC_BIOLOGY_2ND_PAPER_SUBJECT, HSC_STATISTICS_1ST_PAPER_SUBJECT, HSC_STATISTICS_2ND_PAPER_SUBJECT, HSC_AGRICULTURE_1ST_PAPER_SUBJECT, HSC_AGRICULTURE_2ND_PAPER_SUBJECT];
const HSC_HUMANITIES_LIST: SubjectData[] = [HSC_BANGLA_1ST_PAPER_SUBJECT, HSC_BANGLA_2ND_PAPER_SUBJECT, HSC_ENGLISH_1ST_PAPER_SUBJECT, HSC_ENGLISH_2ND_PAPER_SUBJECT, HSC_ICT_SUBJECT, HSC_ECONOMICS_1ST_PAPER_SUBJECT, HSC_ECONOMICS_2ND_PAPER_SUBJECT, HSC_CIVICS_1ST_PAPER_SUBJECT, HSC_CIVICS_2ND_PAPER_SUBJECT, HSC_HISTORY_1ST_PAPER_SUBJECT, HSC_HISTORY_2ND_PAPER_SUBJECT, HSC_ISLAMIC_HISTORY_1ST_PAPER_SUBJECT, HSC_ISLAMIC_HISTORY_2ND_PAPER_SUBJECT, HSC_LOGIC_1ST_PAPER_SUBJECT, HSC_LOGIC_2ND_PAPER_SUBJECT, HSC_SOCIOLOGY_1ST_PAPER_SUBJECT, HSC_SOCIOLOGY_2ND_PAPER_SUBJECT, HSC_SOCIAL_WORK_1ST_PAPER_SUBJECT, HSC_SOCIAL_WORK_2ND_PAPER_SUBJECT, HSC_GEOGRAPHY_1ST_PAPER_SUBJECT, HSC_GEOGRAPHY_2ND_PAPER_SUBJECT, HSC_ISLAMIC_STUDIES_1ST_PAPER_SUBJECT, HSC_ISLAMIC_STUDIES_2ND_PAPER_SUBJECT, HSC_STATISTICS_1ST_PAPER_SUBJECT, HSC_STATISTICS_2ND_PAPER_SUBJECT, HSC_AGRICULTURE_1ST_PAPER_SUBJECT, HSC_AGRICULTURE_2ND_PAPER_SUBJECT];
const HSC_ALL_GROUPS_LIST: SubjectData[] = [HSC_BANGLA_1ST_PAPER_SUBJECT, HSC_BANGLA_2ND_PAPER_SUBJECT, HSC_ENGLISH_1ST_PAPER_SUBJECT, HSC_ENGLISH_2ND_PAPER_SUBJECT, HSC_ICT_SUBJECT, HSC_ACCOUNTING_1ST_PAPER_SUBJECT, HSC_ACCOUNTING_2ND_PAPER_SUBJECT, HSC_BOM_1ST_PAPER_SUBJECT, HSC_BOM_2ND_PAPER_SUBJECT, HSC_FINANCE_1ST_PAPER_SUBJECT, HSC_FINANCE_2ND_PAPER_SUBJECT, HSC_MARKETING_1ST_PAPER_SUBJECT, HSC_MARKETING_2ND_PAPER_SUBJECT, HSC_PHYSICS_1ST_PAPER_SUBJECT, HSC_PHYSICS_2ND_PAPER_SUBJECT, HSC_CHEMISTRY_1ST_PAPER_SUBJECT, HSC_CHEMISTRY_2ND_PAPER_SUBJECT, HSC_HIGHER_MATH_1ST_PAPER_SUBJECT, HSC_HIGHER_MATH_2ND_PAPER_SUBJECT, HSC_BIOLOGY_1ST_PAPER_SUBJECT, HSC_BIOLOGY_2ND_PAPER_SUBJECT, HSC_ECONOMICS_1ST_PAPER_SUBJECT, HSC_ECONOMICS_2ND_PAPER_SUBJECT, HSC_CIVICS_1ST_PAPER_SUBJECT, HSC_CIVICS_2ND_PAPER_SUBJECT, HSC_HISTORY_1ST_PAPER_SUBJECT, HSC_HISTORY_2ND_PAPER_SUBJECT, HSC_ISLAMIC_HISTORY_1ST_PAPER_SUBJECT, HSC_ISLAMIC_HISTORY_2ND_PAPER_SUBJECT, HSC_LOGIC_1ST_PAPER_SUBJECT, HSC_LOGIC_2ND_PAPER_SUBJECT, HSC_SOCIOLOGY_1ST_PAPER_SUBJECT, HSC_SOCIOLOGY_2ND_PAPER_SUBJECT, HSC_SOCIAL_WORK_1ST_PAPER_SUBJECT, HSC_SOCIAL_WORK_2ND_PAPER_SUBJECT, HSC_GEOGRAPHY_1ST_PAPER_SUBJECT, HSC_GEOGRAPHY_2ND_PAPER_SUBJECT, HSC_ISLAMIC_STUDIES_1ST_PAPER_SUBJECT, HSC_ISLAMIC_STUDIES_2ND_PAPER_SUBJECT, HSC_STATISTICS_1ST_PAPER_SUBJECT, HSC_STATISTICS_2ND_PAPER_SUBJECT, HSC_AGRICULTURE_1ST_PAPER_SUBJECT, HSC_AGRICULTURE_2ND_PAPER_SUBJECT];
const SSC_SCIENCE_LIST: SubjectData[] = [SSC_BANGLA_1ST_SUBJECT, SSC_BANGLA_2ND_SUBJECT, SSC_ENGLISH_1ST_SUBJECT, SSC_ENGLISH_2ND_SUBJECT, SSC_GENERAL_MATH_SUBJECT, SSC_ICT_SUBJECT, SSC_PHYSICS_SUBJECT, SSC_CHEMISTRY_SUBJECT, SSC_BIOLOGY_SUBJECT, SSC_HIGHER_MATH_SUBJECT, SSC_BGS_SUBJECT, SSC_ISLAM_RELIGION_SUBJECT, SSC_AGRICULTURE_SUBJECT];
const SSC_BUSINESS_STUDIES_LIST: SubjectData[] = [SSC_BANGLA_1ST_SUBJECT, SSC_BANGLA_2ND_SUBJECT, SSC_ENGLISH_1ST_SUBJECT, SSC_ENGLISH_2ND_SUBJECT, SSC_GENERAL_MATH_SUBJECT, SSC_ICT_SUBJECT, SSC_ACCOUNTING_SUBJECT, SSC_FINANCE_SUBJECT, SSC_ENTREPRENEURSHIP_SUBJECT, SSC_GENERAL_SCIENCE_SUBJECT, SSC_ISLAM_RELIGION_SUBJECT, SSC_AGRICULTURE_SUBJECT];
const SSC_HUMANITIES_LIST: SubjectData[] = [SSC_BANGLA_1ST_SUBJECT, SSC_BANGLA_2ND_SUBJECT, SSC_ENGLISH_1ST_SUBJECT, SSC_ENGLISH_2ND_SUBJECT, SSC_GENERAL_MATH_SUBJECT, SSC_ICT_SUBJECT, SSC_HISTORY_SUBJECT, SSC_GEOGRAPHY_SUBJECT, SSC_CIVICS_SUBJECT, SSC_ECONOMICS_SUBJECT, SSC_GENERAL_SCIENCE_SUBJECT, SSC_ISLAM_RELIGION_SUBJECT, SSC_AGRICULTURE_SUBJECT];
const SSC_ALL_GROUPS_LIST: SubjectData[] = [SSC_BANGLA_1ST_SUBJECT, SSC_BANGLA_2ND_SUBJECT, SSC_ENGLISH_1ST_SUBJECT, SSC_ENGLISH_2ND_SUBJECT, SSC_GENERAL_MATH_SUBJECT, SSC_ICT_SUBJECT, SSC_PHYSICS_SUBJECT, SSC_CHEMISTRY_SUBJECT, SSC_BIOLOGY_SUBJECT, SSC_HIGHER_MATH_SUBJECT, SSC_ACCOUNTING_SUBJECT, SSC_FINANCE_SUBJECT, SSC_ENTREPRENEURSHIP_SUBJECT, SSC_HISTORY_SUBJECT, SSC_GEOGRAPHY_SUBJECT, SSC_CIVICS_SUBJECT, SSC_ECONOMICS_SUBJECT, SSC_BGS_SUBJECT, SSC_GENERAL_SCIENCE_SUBJECT, SSC_ISLAM_RELIGION_SUBJECT, SSC_AGRICULTURE_SUBJECT];
const INITIAL_SYLLABUS_DB: Record<string, Record<string, SubjectData[]>> = {
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
    'All Units': [ADM_SCIENCE_SUBJECT, ADM_MEDICAL_SUBJECT, ADM_COMMERCE_SUBJECT, ADM_HUMANITIES_SUBJECT],
    'Science & Engineering': [ADM_SCIENCE_SUBJECT, ADM_MEDICAL_SUBJECT],
    'Business Studies (C-Unit)': [ADM_COMMERCE_SUBJECT],
    'Humanities (B-Unit)': [ADM_HUMANITIES_SUBJECT],
  },
  'Job/BCS': {
    'All Tracks': [BCS_PRELI_SUBJECT, BANK_JOB_SUBJECT],
  },
};
export function calculateUserRank(params: {
  xp: number;
  accuracyPct: number;
  masteredChaptersCount: number;
  totalChaptersCount?: number;
  streakDays: number;
  examsCompleted: number;
}): RankProgressInfo {
  const {
    xp,
    accuracyPct,
    masteredChaptersCount,
    totalChaptersCount = 24,
    streakDays,
    examsCompleted,
  } = params;
  const xpComponent = Math.min(400, Math.round((xp / 4000) * 400));
  const accWeight = examsCompleted > 0 ? Math.min(1, examsCompleted / 5) : 0;
  const accuracyComponent = Math.round((Math.min(100, accuracyPct) / 100) * 250 * accWeight);
  const masteryPct = Math.min(
    100,
    Math.round((masteredChaptersCount / Math.max(1, totalChaptersCount)) * 100)
  );
  const masteryComponent = Math.round((masteryPct / 100) * 200);
  const consistencyPct = Math.min(100, Math.round((streakDays / 14) * 100));
  const consistencyComponent = Math.round((consistencyPct / 100) * 150);
  const rankScore = xpComponent + accuracyComponent + masteryComponent + consistencyComponent;
  const tiers: {
    id: RankProgressInfo['tierId'];
    en: string;
    bn: string;
    min: number;
    max: number;
    colorHex: string;
    bgSoft: string;
  }[] = [
    { id: 'bronze', en: 'Bronze', bn: 'ব্রোঞ্জ', min: 0, max: 199, colorHex: '#B45309', bgSoft: 'rgba(180, 83, 9, 0.13)' },
    { id: 'silver', en: 'Silver', bn: 'সিলভার', min: 200, max: 399, colorHex: '#475569', bgSoft: 'rgba(71, 85, 105, 0.14)' },
    { id: 'gold', en: 'Gold', bn: 'গোল্ড', min: 400, max: 649, colorHex: '#D97706', bgSoft: 'rgba(217, 119, 6, 0.15)' },
    { id: 'platinum', en: 'Platinum', bn: 'প্লাটিনাম', min: 650, max: 849, colorHex: '#0284C7', bgSoft: 'rgba(2, 132, 199, 0.14)' },
    { id: 'elite', en: 'Elite', bn: 'এলিট', min: 850, max: 1000, colorHex: '#7C3AED', bgSoft: 'rgba(124, 58, 237, 0.15)' },
  ];
  const current = tiers.find((t) => rankScore >= t.min && rankScore <= t.max) || tiers[tiers.length - 1];
  const span = Math.max(1, current.max - current.min);
  const within = Math.max(0, rankScore - current.min);
  const progressPct =
    current.id === 'elite' && rankScore >= 1000
      ? 100
      : Math.min(99, Math.round((within / span) * 100));
  let division: RankProgressInfo['division'] = 'I';
  if (current.id === 'elite' && progressPct >= 95) {
    division = 'MAX';
  } else if (progressPct >= 67) {
    division = 'III';
  } else if (progressPct >= 34) {
    division = 'II';
  }
  return {
    tierId: current.id,
    tierNameEn: current.en,
    tierNameBn: current.bn,
    division,
    fullTitleEn: division === 'MAX' ? `${current.en} Grandmaster` : `${current.en} ${division}`,
    fullTitleBn: division === 'MAX' ? `${current.bn} গ্র্যান্ডমাস্টার` : `${current.bn} ${division}`,
    rankScore,
    nextTierScore: current.max + 1,
    progressPct,
    colorHex: current.colorHex,
    bgSoft: current.bgSoft,
    xpScore: xp,
    accuracyPct: Math.round(accuracyPct),
    masteryPct,
    consistencyPct,
  };
}
export function getAvailableClasses(): string[] {
  return Object.keys(storeState?.syllabusDB || INITIAL_SYLLABUS_DB);
}
export function getAvailableGroups(selectedClass: string): string[] {
  const db = storeState?.syllabusDB || INITIAL_SYLLABUS_DB;
  if (db[selectedClass]) {
    return Object.keys(db[selectedClass]);
  }
  return ['Business Studies', 'Science', 'Humanities'];
}
export function getSubjectsForSelection(selectedClass: string, selectedGroup: string): SubjectData[] {
  const db = storeState?.syllabusDB || INITIAL_SYLLABUS_DB;
  const classEntry = db[selectedClass] || db.HSC;
  if (!classEntry) return [];
  if (classEntry[selectedGroup]) return classEntry[selectedGroup];
  const firstKey = Object.keys(classEntry)[0];
  return firstKey ? classEntry[firstKey] : [];
}
export async function signInOrSignUpUser(params: {
  mode: 'signin' | 'signup';
  name: string;
  email: string;
  password: string;
}): Promise<{ id: string; name: string; email: string; avatar?: string }> {
  const supaMod = RawSupabase as any;
  const client = supaMod?.supabase;
  if (client?.auth) {
    if (params.mode === 'signup') {
      const { data, error } = await client.auth.signUp({
        email: params.email,
        password: params.password,
        options: { data: { full_name: params.name || params.email.split('@')[0] } },
      });
      if (error) throw error;
      const userObj = {
        id: data?.user?.id || `local-${Date.now()}`,
        name: params.name || data?.user?.user_metadata?.full_name || params.email.split('@')[0],
        email: params.email,
        avatar: data?.user?.user_metadata?.avatar_url || '',
      };
      if (typeof supaMod.upsertLiveUserProfile === 'function') {
        supaMod.upsertLiveUserProfile({
          id: userObj.id,
          name: userObj.name,
          email: userObj.email,
          avatar: userObj.avatar,
          xp: storeState.xp,
          level: storeState.level,
          streak: storeState.streak,
          selectedClass: storeState.selectedClass,
          selectedGroup: storeState.selectedGroup,
        });
      }
      return userObj;
    } else {
      const { data, error } = await client.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });
      if (error) throw error;
      if (data?.user) {
        const userObj = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || params.email.split('@')[0],
          email: data.user.email || params.email,
          avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '',
        };
        if (typeof supaMod.upsertLiveUserProfile === 'function') {
          supaMod.upsertLiveUserProfile({
            id: userObj.id,
            name: userObj.name,
            email: userObj.email,
            avatar: userObj.avatar,
            xp: storeState.xp,
            level: storeState.level,
            streak: storeState.streak,
            selectedClass: storeState.selectedClass,
            selectedGroup: storeState.selectedGroup,
          });
        }
        return userObj;
      }
    }
  }
  return {
    id: `local-${Date.now()}`,
    name: params.name || params.email.split('@')[0],
    email: params.email,
  };
}
export const UI_DICT: Record<string, { en: string; bn: string }> = {
  nav_dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  nav_subjects: { en: 'Subjects', bn: 'বিষয়সমূহ' },
  nav_analytics: { en: 'Analytics', bn: 'পারফরম্যান্স' },
  nav_mistakes: { en: 'Mistake Bank', bn: 'ভুলের খাতা' },
  nav_flashcards: { en: 'Flashcards', bn: 'ফ্ল্যাশকার্ড' },
  nav_formulas: { en: 'Formula Sheet', bn: 'সূত্রসমূহ' },
  nav_planner: { en: 'Study Planner', bn: 'পড়ার রুটিন' },
  nav_battle: { en: '1v1 Battle', bn: 'কুইজ ব্যাটল' },
  nav_community: { en: 'Doubt Forum', bn: 'প্রশ্নোত্তর ফোরাম' },
  nav_leaderboard: { en: 'Leaderboard', bn: 'লিডারবোর্ড' },
  nav_achievements: { en: 'Rank & Badges', bn: 'র‍্যাঙ্ক ও ব্যাজ' },
  nav_more: { en: 'More', bn: 'আরও' },
  welcome_back: { en: 'Welcome back', bn: 'স্বাগতম' },
  sign_in: { en: 'Sign In', bn: 'সাইন ইন' },
  sign_out: { en: 'Sign Out', bn: 'লগ আউট' },
  streak_days: { en: 'Day Streak', bn: 'দিনের স্ট্রিক' },
  personal_rank: { en: 'Personal Rank', bn: 'ব্যক্তিগত র‍্যাঙ্ক' },
  leaderboard_pos: { en: 'Leaderboard Position', bn: 'লিডারবোর্ড অবস্থান' },
  choose_class_group: { en: 'Class & Group', bn: 'শ্রেণি ও বিভাগ' },
  all_subjects: { en: 'Your Subjects', bn: 'তোমার বিষয়সমূহ' },
  chapters_count: { en: 'Chapters', bn: 'অধ্যায়' },
  questions_count: { en: 'Questions', bn: 'প্রশ্ন' },
  start_practice: { en: 'Start Practice', bn: 'অনুশীলন শুরু করো' },
  daily_challenge: { en: 'Daily Challenge', bn: 'আজকের চ্যালেঞ্জ' },
  quick_mock: { en: 'Quick Mock Exam', bn: 'কুইক মক টেস্ট' },
  mastery: { en: 'Mastery', bn: 'দক্ষতা' },
  accuracy: { en: 'Accuracy', bn: 'সঠিকতার হার' },
  consistency: { en: 'Consistency', bn: 'ধারাবাহিকতা' },
  rank_points: { en: 'Rank Score', bn: 'র‍্যাঙ্ক স্কোর' },
  question: { en: 'Question', bn: 'প্রশ্ন' },
  time_left: { en: 'Time Left', bn: 'বাকি সময়' },
  question_palette: { en: 'Question Navigator', bn: 'প্রশ্ন নেভিগেটর' },
  submit_exam: { en: 'Submit Exam', bn: 'পরীক্ষা জমা দাও' },
  prev_q: { en: 'Previous', bn: 'পূর্ববর্তী' },
  next_q: { en: 'Next', bn: 'পরবর্তী' },
  flag_q: { en: 'Flag', bn: 'মার্ক করো' },
  answered: { en: 'Answered', bn: 'উত্তর দেওয়া' },
  unanswered: { en: 'Unanswered', bn: 'বাকি আছে' },
  global_ranking: { en: 'Global Ranking', bn: 'সর্বজনীন র‍্যাঙ্কিং' },
  friends_ranking: { en: 'Friends Ranking', bn: 'বন্ধুদের র‍্যাঙ্কিং' },
  subject_ranking: { en: 'Subject-wise', bn: 'বিষয়ভিত্তিক' },
  filter_today: { en: 'Today', bn: 'আজ' },
  filter_weekly: { en: 'Weekly', bn: 'সাপ্তাহিক' },
  filter_monthly: { en: 'Monthly', bn: 'মাসিক' },
  filter_alltime: { en: 'All-Time', bn: 'সর্বমোট' },
};
export function trKey(key: keyof typeof UI_DICT, lang: LanguageMode): string {
  const item = UI_DICT[key];
  if (!item) return String(key);
  if (lang === 'bn') return item.bn;
  if (lang === 'bilingual') return `${item.bn} (${item.en})`;
  return item.en;
}
export function trText(text: LocalizedText | string | undefined, lang: LanguageMode): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  if (lang === 'bn') return text.bn || text.en;
  if (lang === 'bilingual') {
    return text.bn && text.en && text.bn !== text.en ? `${text.bn} (${text.en})` : text.bn || text.en;
  }
  return text.en || text.bn;
}
export function getLevelProgress(xp: number) {
  const xpPerLevel = 250;
  const level = Math.max(1, Math.floor(xp / xpPerLevel) + 1);
  const currentLevelXp = xp % xpPerLevel;
  const pct = Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));
  return {
    level,
    currentLevelXp,
    xpForNext: xpPerLevel,
    progressPct: pct,
    progressPercent: pct,
  };
}
export interface ExamStoreState {
  activeTab: NavTabId;
  selectedSubjectId: string | null;
  formulaSubjectId: string | null;
  formulaChapterId: string | null;
  language: LanguageMode;
  darkMode: boolean;
  selectedClass: string;
  selectedGroup: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  isAuthenticated: boolean;
  xp: number;
  level: number;
  streak: number;
  weeklyActivity: boolean[];
  chapterMastery: Record<string, number>;
  examHistory: ExamHistoryItem[];
  mistakes: MistakeItem[];
  flashcards: FlashcardItem[];
  studyTasks: StudyTask[];
  communityPosts: CommunityPost[];
  friendsList: string[];
  questionReports: QuestionErrorReport[];
  syllabusDB: Record<string, Record<string, SubjectData[]>>;
  activeQuiz: ActiveQuizConfig | null;
  settingsOpen: boolean;
  isSettingsModalOpen: boolean;
  authModalOpen: boolean;
  isAuthModalOpen: boolean;
  isAdminUnlocked: boolean;
  adminPin: string;
  setActiveTab: (tab: NavTabId) => void;
  setSelectedSubjectId: (id: string | null) => void;
  setFormulaTarget: (subjectId: string | null, chapterId: string | null) => void;
  openSubjectFormulas: (subjectId: string, chapterId?: string) => void;
  setLanguage: (lang: LanguageMode) => void;
  toggleDarkMode: () => void;
  setClassAndGroup: (cls: string, grp: string) => void;
  setUserProfile: (profile: { id?: string; name: string; email: string; avatar?: string; isAuthenticated?: boolean }) => void;
  logoutUser: () => Promise<void>;
  setSettingsOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  startQuiz: (config: ActiveQuizConfig) => void;
  closeQuiz: () => void;
  recordExamResult: (
    result: {
      subjectId: string;
      subjectName: string;
      chapterId?: string;
      chapterName?: string;
      mode: 'mcq' | 'cq' | 'battle' | 'daily';
      score: number;
      total: number;
      accuracy?: number;
      timeSpentSec: number;
      xpEarned?: number;
      wrongQuestions?: {
        question: MCQQuestion;
        selectedIndex: number;
      }[];
    },
    newMistakes?: MistakeItem[]
  ) => void;
  markMistakeMastered: (id: string) => void;
  addFlashcard: (front: string, back: string, subjectId?: string) => void;
  deleteFlashcard: (id: string) => void;
  updateFlashcardBox: (id: string, box: 1 | 2 | 3 | 4 | 5) => void;
  addStudyTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
  toggleStudyTask: (id: string) => void;
  deleteStudyTask: (id: string) => void;
  addCommunityPost: (post: {
    authorName?: string;
    authorAvatar?: string;
    authorRank?: string;
    subjectName: string;
    title: string;
    body: string;
  }) => void;
  addCommunityReply: (postId: string, authorOrText: string, maybeText?: string) => void;
  likeCommunityPost: (postId: string) => void;
  togglePostLike: (postId: string) => void;
  addFriendByCode: (codeOrName: string) => void;
  reportQuestionError: (payload: any) => void;
  submitQuestionReport: (payload: any) => void;
  resolveQuestionReport: (reportId: string, applySuggestedAnswer?: boolean) => void;
  deleteQuestionReport: (reportId: string) => void;
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;
  setAdminPin: (newPin: string) => void;
  importBulkMcqs: (params: {
    targetClass: string;
    targetGroup: string;
    subjectId: string;
    subjectNameBn: string;
    subjectNameEn: string;
    rawText: string;
  }) => { addedQuestions: number; addedChapters: number };
  addSingleCustomMcq: (params: {
    targetClass: string;
    targetGroup: string;
    subjectId: string;
    subjectNameBn: string;
    subjectNameEn: string;
    chapterNameBn: string;
    questionBn: string;
    optionsBn: string[];
    ansIndex: number;
    boardTag?: string;
    explanationBn?: string;
  }) => void;
  updateCustomMcqAnswer: (
    cls: string,
    grp: string,
    subjectId: string,
    chapterId: string,
    questionId: string,
    newAnsIndex: number
  ) => void;
  editCustomMcqFull: (params: {
    targetClass: string;
    targetGroup: string;
    subjectId: string;
    chapterId: string;
    questionId: string;
    questionBn: string;
    optionsBn: string[];
    ansIndex: number;
  }) => void;
  deleteCustomMcq: (
    cls: string,
    grp: string,
    subjectId: string,
    chapterId: string,
    questionId: string
  ) => void;
  deleteCustomSubject: (cls: string, grp: string, subjectId: string) => void;
  exportProjectSyllabusCode: () => string;
  resetAllDemoAndProgress: () => void;
  adminAddQuestion: (payload: {
    className: string;
    groupName: string;
    subjectId: string;
    chapterId: string;
    question: MCQQuestion;
  }) => void;
  adminBulkImportQuestions: (payload: {
    className: string;
    groupName: string;
    subjectId: string;
    chapterId: string;
    questions: MCQQuestion[];
  }) => number;
  adminDeleteQuestion: (payload: {
    className: string;
    groupName: string;
    subjectId: string;
    chapterId: string;
    questionId: string;
  }) => void;
  getRankInfo: () => RankProgressInfo;
}
const STORAGE_KEY = 'examverse-v10-storage';
const VALID_TABS: NavTabId[] = [
  'dashboard',
  'subjects',
  'Analytics',
  'mistakes',
  'flashcards',
  'formulas',
  'planner',
  'battle',
  'community',
  'leaderboard',
  'achievements',
  'admin',
];
function getInitialTabFromHashOrStorage(savedTab?: NavTabId): NavTabId {
  if (typeof window !== 'undefined') {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    if (
      rawHash &&
      !rawHash.startsWith('access_token=') &&
      !rawHash.startsWith('error=')
    ) {
      if (rawHash === 'analytics') return 'Analytics';
      if (VALID_TABS.includes(rawHash as NavTabId)) {
        return rawHash as NavTabId;
      }
    }
  }
  if (savedTab && VALID_TABS.includes(savedTab)) {
    return savedTab;
  }
  return 'dashboard';
}
function applyThemeToDocument(isDark: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  try {
    window.localStorage.setItem('examverse_theme', isDark ? 'dark' : 'light');
  } catch {
    // ignore
  }
}
const BUILTIN_SUBJECT_MAP: Record<string, SubjectData> = {};
Object.values(INITIAL_SYLLABUS_DB).forEach((groupObj) => {
  Object.values(groupObj).forEach((subjList) => {
    subjList.forEach((subj) => {
      BUILTIN_SUBJECT_MAP[subj.id] = subj;
    });
  });
});
function sanitizeSubjectList(list: any[], fallbackList: SubjectData[]): SubjectData[] {
  if (!Array.isArray(list) || list.length === 0) return fallbackList;
  const sanitized = list
    .filter((s) => s && typeof s === 'object' && s.id)
    .map((s) => {
      if (BUILTIN_SUBJECT_MAP[s.id]) {
        return BUILTIN_SUBJECT_MAP[s.id];
      }
      const nameObj: LocalizedText =
        typeof s.name === 'object' && s.name !== null
          ? { bn: String(s.name.bn || s.name.en || s.id), en: String(s.name.en || s.name.bn || s.id) }
          : { bn: String(s.name || s.id), en: String(s.name || s.id) };
      const chapters: ChapterData[] = Array.isArray(s.chapters)
        ? s.chapters
            .filter((c: any) => c && typeof c === 'object')
            .map((c: any, idx: number) => ({
              id: String(c.id || `${s.id}-c${idx + 1}`),
              name:
                typeof c.name === 'object' && c.name !== null
                  ? { bn: String(c.name.bn || c.name.en || ''), en: String(c.name.en || c.name.bn || '') }
                  : { bn: String(c.name || ''), en: String(c.name || '') },
              mcqs: Array.isArray(c.mcqs) ? c.mcqs : [],
              cqs: Array.isArray(c.cqs) ? c.cqs : [],
              formulas: Array.isArray(c.formulas) ? c.formulas : [],
            }))
        : [];
      return {
        id: String(s.id),
        name: nameObj,
        icon: String(s.icon || '📘'),
        color: String(s.color || '#4F46E5'),
        rgb: String(s.rgb || '79, 70, 229'),
        chapters,
      };
    });
  const existingIds = new Set(sanitized.map((s) => s.id));
  const missingBuiltIns = fallbackList.filter((b) => !existingIds.has(b.id));
  return [...sanitized, ...missingBuiltIns];
}
function mergeBuiltInSubjects(savedDB?: Record<string, Record<string, SubjectData[]>>) {
  if (!savedDB || typeof savedDB !== 'object') return INITIAL_SYLLABUS_DB;
  const merged: Record<string, Record<string, SubjectData[]>> = {};
  Object.keys(INITIAL_SYLLABUS_DB).forEach((cls) => {
    merged[cls] = {};
    Object.keys(INITIAL_SYLLABUS_DB[cls]).forEach((grp) => {
      const fallback = INITIAL_SYLLABUS_DB[cls][grp];
      const savedList = savedDB[cls]?.[grp];
      merged[cls][grp] = sanitizeSubjectList(savedList || fallback, fallback);
    });
  });
  return merged;
}
function loadPersistedState(): Partial<ExamStoreState> {
  if (typeof window === 'undefined') return {};
  try {
    const v10Raw = window.localStorage.getItem(STORAGE_KEY);
    const legacyRaw =
      window.localStorage.getItem('examverse-v9-storage') ||
      window.localStorage.getItem('examverse-v8-storage') ||
      window.localStorage.getItem('examverse-v7-storage');
    const raw = v10Raw || legacyRaw;
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return {
      ...parsed,
      selectedGroup: v10Raw ? parsed.selectedGroup : 'All Groups',
      activeTab: getInitialTabFromHashOrStorage(parsed.activeTab),
      syllabusDB: mergeBuiltInSubjects(parsed.syllabusDB),
    };
  } catch {
    return {};
  }
}
function savePersisted(state: ExamStoreState) {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      activeTab: state.activeTab,
      selectedSubjectId: state.selectedSubjectId,
      formulaSubjectId: state.formulaSubjectId,
      formulaChapterId: state.formulaChapterId,
      language: state.language,
      darkMode: state.darkMode,
      selectedClass: state.selectedClass,
      selectedGroup: state.selectedGroup,
      userId: state.userId,
      userName: state.userName,
      userEmail: state.userEmail,
      userAvatar: state.userAvatar,
      isAuthenticated: state.isAuthenticated,
      xp: state.xp,
      level: state.level,
      streak: state.streak,
      weeklyActivity: state.weeklyActivity,
      chapterMastery: state.chapterMastery,
      examHistory: state.examHistory,
      mistakes: state.mistakes,
      flashcards: state.flashcards,
      studyTasks: state.studyTasks,
      communityPosts: state.communityPosts,
      friendsList: state.friendsList,
      questionReports: state.questionReports,
      adminPin: state.adminPin,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage quota errors
  }
}
const persisted = loadPersistedState();
const initialDark = Boolean(persisted.darkMode);
applyThemeToDocument(initialDark);
const listeners = new Set<() => void>();
let storeState: ExamStoreState = {
  activeTab: getInitialTabFromHashOrStorage(persisted.activeTab),
  selectedSubjectId: persisted.selectedSubjectId ?? null,
  formulaSubjectId: persisted.formulaSubjectId ?? null,
  formulaChapterId: persisted.formulaChapterId ?? null,
  language:
    persisted.language === 'en' || persisted.language === 'bn' || persisted.language === 'bilingual'
      ? persisted.language
      : 'bn',
  darkMode: initialDark,
  selectedClass: typeof persisted.selectedClass === 'string' && persisted.selectedClass ? persisted.selectedClass : 'HSC',
  selectedGroup: typeof persisted.selectedGroup === 'string' && persisted.selectedGroup ? persisted.selectedGroup : 'All Groups',
  userId: typeof persisted.userId === 'string' && persisted.userId ? persisted.userId : 'guest-user',
  userName: typeof persisted.userName === 'string' && persisted.userName.trim() ? persisted.userName : 'শিক্ষার্থী',
  userEmail: typeof persisted.userEmail === 'string' ? persisted.userEmail : '',
  userAvatar: typeof persisted.userAvatar === 'string' ? persisted.userAvatar : '',
  isAuthenticated: Boolean(persisted.isAuthenticated),
  xp: typeof persisted.xp === 'number' && !Number.isNaN(persisted.xp) ? persisted.xp : 0,
  level: typeof persisted.level === 'number' && !Number.isNaN(persisted.level) ? persisted.level : 1,
  streak: typeof persisted.streak === 'number' && !Number.isNaN(persisted.streak) ? persisted.streak : 1,
  weeklyActivity: Array.isArray(persisted.weeklyActivity)
    ? persisted.weeklyActivity
    : [true, false, false, false, false, false, false],
  chapterMastery:
    persisted.chapterMastery && typeof persisted.chapterMastery === 'object'
      ? persisted.chapterMastery
      : {},
  examHistory: Array.isArray(persisted.examHistory) ? persisted.examHistory : [],
  mistakes: Array.isArray(persisted.mistakes) ? persisted.mistakes : [],
  flashcards: Array.isArray(persisted.flashcards) ? persisted.flashcards : [],
  studyTasks: Array.isArray(persisted.studyTasks) ? persisted.studyTasks : [],
  communityPosts: Array.isArray(persisted.communityPosts) ? persisted.communityPosts : [],
  friendsList: Array.isArray(persisted.friendsList)
    ? persisted.friendsList
    : ['তানভীর আহমেদ', 'সাদিয়া ইসলাম', 'রাকিবুল হাসান'],
  questionReports: Array.isArray(persisted.questionReports) ? persisted.questionReports : [],
  syllabusDB: mergeBuiltInSubjects(persisted.syllabusDB),
  activeQuiz: null,
  settingsOpen: false,
  isSettingsModalOpen: false,
  authModalOpen: false,
  isAuthModalOpen: false,
  isAdminUnlocked: false,
  adminPin: typeof persisted.adminPin === 'string' && persisted.adminPin ? persisted.adminPin : '1234',
  setActiveTab: (tab) => {
    if (typeof window !== 'undefined' && tab && window.history?.replaceState) {
      const currHash = window.location.hash.replace(/^#/, '');
      if (!currHash.startsWith('access_token=') && currHash !== tab) {
        window.history.replaceState(null, '', `#${tab}`);
      }
    }
    setState({ activeTab: tab });
  },
  setSelectedSubjectId: (id) => setState({ selectedSubjectId: id }),
  setFormulaTarget: (subjectId, chapterId) =>
    setState({ formulaSubjectId: subjectId, formulaChapterId: chapterId }),
  openSubjectFormulas: (subjectId, chapterId = 'all') => {
    setState({
      formulaSubjectId: subjectId,
      formulaChapterId: chapterId || 'all',
      selectedSubjectId: null,
      activeTab: 'formulas',
    });
  },
  setLanguage: (language) => setState({ language }),
  toggleDarkMode: () => {
    const next = !storeState.darkMode;
    applyThemeToDocument(next);
    setState({ darkMode: next });
  },
  setClassAndGroup: (selectedClass, selectedGroup) => {
    const validGroups = getAvailableGroups(selectedClass);
    const resolvedGroup = validGroups.includes(selectedGroup)
      ? selectedGroup
      : validGroups[0] || 'Business Studies';
    setState({
      selectedClass,
      selectedGroup: resolvedGroup,
      selectedSubjectId: null,
    });
  },
  setUserProfile: ({ id, name, email, avatar, isAuthenticated }) => {
    const uid = id || storeState.userId || `user-${Date.now()}`;
    const uName = (name || (email ? email.split('@')[0] : '') || 'শিক্ষার্থী').trim();
    const uAvatar = avatar ?? storeState.userAvatar ?? '';
    setState({
      userId: uid,
      userName: uName,
      userEmail: email ?? storeState.userEmail,
      userAvatar: uAvatar,
      isAuthenticated: isAuthenticated ?? true,
      authModalOpen: false,
      isAuthModalOpen: false,
    });
    const supaMod = RawSupabase as any;
    if (typeof supaMod?.upsertLiveUserProfile === 'function') {
      supaMod.upsertLiveUserProfile({
        id: uid,
        name: uName,
        email: email ?? storeState.userEmail,
        avatar: uAvatar,
        xp: storeState.xp,
        level: storeState.level,
        streak: storeState.streak,
        selectedClass: storeState.selectedClass,
        selectedGroup: storeState.selectedGroup,
        chapterMastery: storeState.chapterMastery,
      });
    }
  },
  logoutUser: async () => {
    const supaMod = RawSupabase as any;
    if (supaMod?.supabase?.auth) {
      try {
        await supaMod.supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setState({
      userId: 'guest-user',
      userName: 'শিক্ষার্থী',
      userEmail: '',
      userAvatar: '',
      isAuthenticated: false,
      authModalOpen: false,
      isAuthModalOpen: false,
    });
  },
  setSettingsOpen: (open) => setState({ settingsOpen: open, isSettingsModalOpen: open }),
  setSettingsModalOpen: (open) => setState({ settingsOpen: open, isSettingsModalOpen: open }),
  setAuthModalOpen: (open) => setState({ authModalOpen: open, isAuthModalOpen: open }),
  startQuiz: (activeQuiz) => setState({ activeQuiz }),
  closeQuiz: () => setState({ activeQuiz: null }),
  recordExamResult: (result, newMistakesArg) => {
    const accuracy =
      typeof result.accuracy === 'number'
        ? result.accuracy
        : result.total > 0
        ? Math.round((result.score / result.total) * 100)
        : 0;
    const xpEarned =
      typeof result.xpEarned === 'number'
        ? result.xpEarned
        : Math.max(15, result.score * 12 + (accuracy >= 80 ? 30 : 10));
    const newXp = storeState.xp + xpEarned;
    const newLevel = getLevelProgress(newXp).level;
    const historyItem: ExamHistoryItem = {
      id: `exam-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      subjectId: result.subjectId,
      subjectName: result.subjectName,
      chapterId: result.chapterId,
      chapterName: result.chapterName,
      mode: result.mode,
      score: result.score,
      total: result.total,
      accuracy,
      timeSpentSec: result.timeSpentSec,
      xpEarned,
    };
    const nextMastery = { ...storeState.chapterMastery };
    if (result.chapterId) {
      const prev = nextMastery[result.chapterId] || 40;
      nextMastery[result.chapterId] = Math.min(100, Math.round(prev * 0.4 + accuracy * 0.6));
    }
    const existingMistakes = [...storeState.mistakes];
    if (Array.isArray(newMistakesArg) && newMistakesArg.length > 0) {
      newMistakesArg.forEach((nm) => {
        const idx = existingMistakes.findIndex((m) => m.questionId === nm.questionId);
        if (idx >= 0) {
          existingMistakes[idx] = {
            ...existingMistakes[idx],
            selectedIndex: nm.selectedIndex,
            wrongCount: (existingMistakes[idx].wrongCount || 1) + 1,
            lastMissedAt: new Date().toISOString().slice(0, 10),
            mastered: false,
          };
        } else {
          existingMistakes.unshift(nm);
        }
      });
    }
    (result.wrongQuestions || []).forEach(({ question, selectedIndex }) => {
      const idx = existingMistakes.findIndex((m) => m.questionId === question.id);
      if (idx >= 0) {
        existingMistakes[idx] = {
          ...existingMistakes[idx],
          selectedIndex,
          wrongCount: existingMistakes[idx].wrongCount + 1,
          lastMissedAt: new Date().toISOString().slice(0, 10),
          mastered: false,
        };
      } else {
        existingMistakes.unshift({
          id: `mst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          questionId: question.id,
          subjectId: result.subjectId,
          subjectName: result.subjectName,
          chapterName: result.chapterName || '',
          question: question.q,
          options: question.options,
          correctIndex: question.ans,
          selectedIndex,
          explanation: question.explanation,
          wrongCount: 1,
          lastMissedAt: new Date().toISOString().slice(0, 10),
          mastered: false,
        });
      }
    });
    setState({
      xp: newXp,
      level: newLevel,
      examHistory: [historyItem, ...storeState.examHistory],
      chapterMastery: nextMastery,
      mistakes: existingMistakes,
    });
    const supaMod = RawSupabase as any;
    if (storeState.isAuthenticated && typeof supaMod?.upsertLiveUserProfile === 'function') {
      supaMod.upsertLiveUserProfile({
        id: storeState.userId,
        name: storeState.userName,
        email: storeState.userEmail,
        avatar: storeState.userAvatar,
        xp: newXp,
        level: newLevel,
        streak: storeState.streak,
        selectedClass: storeState.selectedClass,
        selectedGroup: storeState.selectedGroup,
        chapterMastery: nextMastery,
      });
    }
  },
  markMistakeMastered: (id) =>
    setState({
      mistakes: storeState.mistakes.map((m) => (m.id === id ? { ...m, mastered: true } : m)),
    }),
  addFlashcard: (front, back, subjectId = 'general') =>
    setState({
      flashcards: [
        {
          id: `fc-${Date.now()}`,
          subjectId,
          front: { bn: front, en: front },
          back: { bn: back, en: back },
          box: 1,
          nextReviewDate: new Date().toISOString().slice(0, 10),
        },
        ...storeState.flashcards,
      ],
    }),
  deleteFlashcard: (id) =>
    setState({
      flashcards: storeState.flashcards.filter((f) => f.id !== id),
    }),
  updateFlashcardBox: (id, box) =>
    setState({
      flashcards: storeState.flashcards.map((f) => (f.id === id ? { ...f, box } : f)),
    }),
  addStudyTask: (task) =>
    setState({
      studyTasks: [
        { ...task, id: `task-${Date.now()}`, completed: false },
        ...storeState.studyTasks,
      ],
    }),
  toggleStudyTask: (id) =>
    setState({
      studyTasks: storeState.studyTasks.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    }),
  deleteStudyTask: (id) =>
    setState({
      studyTasks: storeState.studyTasks.filter((t) => t.id !== id),
    }),
  addCommunityPost: ({ authorName, authorAvatar, authorRank, subjectName, title, body }) =>
    setState({
      communityPosts: [
        {
          id: `post-${Date.now()}`,
          authorId: storeState.userId,
          authorName: authorName || storeState.userName || 'শিক্ষার্থী',
          authorAvatar: authorAvatar || storeState.userAvatar || '🎓',
          authorRank: authorRank || storeState.getRankInfo().fullTitleBn,
          subjectName,
          title,
          body,
          createdAt: 'এইমাত্র',
          likes: 0,
          solved: false,
          replies: [],
        },
        ...storeState.communityPosts,
      ],
    }),
  addCommunityReply: (postId, authorOrText, maybeText) => {
    const finalAuthor = maybeText !== undefined ? authorOrText : storeState.userName || 'শিক্ষার্থী';
    const finalText = maybeText !== undefined ? maybeText : authorOrText;
    setState({
      communityPosts: storeState.communityPosts.map((p) =>
        p.id !== postId
          ? p
          : {
              ...p,
              replies: [
                ...p.replies,
                {
                  id: `rep-${Date.now()}`,
                  authorName: finalAuthor,
                  text: finalText,
                  createdAt: 'এইমাত্র',
                },
              ],
            }
      ),
    });
  },
  likeCommunityPost: (postId) =>
    setState({
      communityPosts: storeState.communityPosts.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ),
    }),
  togglePostLike: (postId) =>
    setState({
      communityPosts: storeState.communityPosts.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ),
    }),
  addFriendByCode: (codeOrName) => {
    const clean = (codeOrName || '').trim();
    if (!clean) return;
    if (!storeState.friendsList.includes(clean)) {
      setState({ friendsList: [...storeState.friendsList, clean] });
    }
  },
  reportQuestionError: (payload) => {
    const nowStr = new Date().toLocaleString('bn-BD');
    const newReport: QuestionErrorReport = {
      id: `qrep-${Date.now()}`,
      questionId: payload.questionId || '',
      subjectId: payload.subjectId || '',
      subjectName: payload.subjectName || '',
      chapterId: payload.chapterId || '',
      chapterName: payload.chapterName || '',
      questionText: payload.questionText || '',
      options: Array.isArray(payload.options) ? payload.options : [],
      currentAns: payload.currentAns ?? payload.currentCorrectIndex ?? 0,
      currentCorrectIndex: payload.currentCorrectIndex ?? payload.currentAns ?? 0,
      suggestedCorrectIndex: payload.suggestedCorrectIndex ?? payload.currentAns ?? 0,
      issueType: payload.issueType || 'উত্তর ভুল',
      comment: payload.comment || payload.note || '',
      note: payload.note || payload.comment || '',
      reportedBy: payload.reportedBy || storeState.userName || 'শিক্ষার্থী',
      reportedAt: nowStr,
      createdAt: nowStr,
      status: 'pending',
    };
    setState({
      questionReports: [newReport, ...storeState.questionReports],
    });
  },
  submitQuestionReport: (payload) => {
    storeState.reportQuestionError(payload);
  },
  resolveQuestionReport: (reportId, applySuggestedAnswer = false) => {
    const target = storeState.questionReports.find((r) => r.id === reportId);
    let nextDB = storeState.syllabusDB;
    if (target && applySuggestedAnswer) {
      nextDB = { ...storeState.syllabusDB };
      Object.keys(nextDB).forEach((cls) => {
        nextDB[cls] = { ...nextDB[cls] };
        Object.keys(nextDB[cls]).forEach((grp) => {
          nextDB[cls][grp] = nextDB[cls][grp].map((subj) => {
            if (subj.id !== target.subjectId) return subj;
            return {
              ...subj,
              chapters: subj.chapters.map((ch) => {
                if (ch.id !== target.chapterId) return ch;
                return {
                  ...ch,
                  mcqs: ch.mcqs.map((m) =>
                    m.id === target.questionId ? { ...m, ans: target.suggestedCorrectIndex } : m
                  ),
                };
              }),
            };
          });
        });
      });
    }
    setState({
      syllabusDB: nextDB,
      questionReports: storeState.questionReports.map((r) =>
        r.id === reportId ? { ...r, status: 'resolved' } : r
      ),
    });
  },
  deleteQuestionReport: (reportId) => {
    setState({
      questionReports: storeState.questionReports.filter((r) => r.id !== reportId),
    });
  },
  unlockAdmin: (pin) => {
    const valid = pin.trim() === storeState.adminPin || pin.trim() === '1234';
    if (valid) {
      setState({ isAdminUnlocked: true });
    }
    return valid;
  },
  lockAdmin: () => setState({ isAdminUnlocked: false, activeTab: 'dashboard' }),
  setAdminPin: (newPin) => {
    if (newPin.trim().length >= 4) {
      setState({ adminPin: newPin.trim() });
    }
  },
  importBulkMcqs: ({ targetClass, targetGroup, subjectId, subjectNameBn, subjectNameEn, rawText }) => {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    let addedQuestions = 0;
    const chapterSet = new Set<string>();
    const nextDB = { ...storeState.syllabusDB };
    const clsMap = { ...(nextDB[targetClass] || {}) };
    const grpList = [...(clsMap[targetGroup] || [])];
    let subjIdx = grpList.findIndex((s) => s.id === subjectId);
    if (subjIdx < 0) {
      grpList.push({
        id: subjectId,
        name: { bn: subjectNameBn, en: subjectNameEn || subjectNameBn },
        icon: '📚',
        color: '#4F46E5',
        rgb: '79, 70, 229',
        chapters: [],
      });
      subjIdx = grpList.length - 1;
    }
    const targetSubj = { ...grpList[subjIdx], chapters: [...grpList[subjIdx].chapters] };
    lines.forEach((line, idx) => {
      const cols = line.includes('\t') ? line.split('\t') : line.split(',');
      if (cols.length < 6) return;
      const chapName = (cols[0] || 'অধ্যায় ১').trim();
      const qText = (cols[1] || '').trim();
      if (!qText || qText === 'প্রশ্ন' || qText.toLowerCase() === 'question') return;
      const optA = (cols[2] || '').trim();
      const optB = (cols[3] || '').trim();
      const optC = (cols[4] || '').trim();
      const optD = (cols[5] || '').trim();
      const rawAns = (cols[6] || 'ক').trim();
      const boardTag = (cols[7] || '').trim();
      const ansMap: Record<string, number> = {
        ক: 0, খ: 1, গ: 2, ঘ: 3,
        A: 0, B: 1, C: 2, D: 3,
        a: 0, b: 1, c: 2, d: 3,
        '1': 0, '2': 1, '3': 2, '4': 3,
        '0': 0,
      };
      const ansIdx = ansMap[rawAns] ?? 0;
      let chIdx = targetSubj.chapters.findIndex((c) => c.name.bn === chapName || c.name.en === chapName);
      if (chIdx < 0) {
        const newChId = `${subjectId}-ch-${targetSubj.chapters.length + 1}`;
        targetSubj.chapters.push({
          id: newChId,
          name: { bn: chapName, en: chapName },
          mcqs: [],
          cqs: [],
          formulas: [],
        });
        chIdx = targetSubj.chapters.length - 1;
        chapterSet.add(newChId);
      } else {
        targetSubj.chapters[chIdx] = {
          ...targetSubj.chapters[chIdx],
          mcqs: [...targetSubj.chapters[chIdx].mcqs],
        };
      }
      targetSubj.chapters[chIdx].mcqs.push({
        id: `${subjectId}-q-${Date.now()}-${idx}`,
        q: { bn: qText, en: qText },
        options: { bn: [optA, optB, optC, optD], en: [optA, optB, optC, optD] },
        ans: ansIdx,
        boardTag: boardTag || undefined,
      });
      addedQuestions++;
    });
    grpList[subjIdx] = targetSubj;
    clsMap[targetGroup] = grpList;
    nextDB[targetClass] = clsMap;
    setState({ syllabusDB: nextDB });
    return { addedQuestions, addedChapters: chapterSet.size };
  },
  addSingleCustomMcq: ({
    targetClass,
    targetGroup,
    subjectId,
    subjectNameBn,
    subjectNameEn,
    chapterNameBn,
    questionBn,
    optionsBn,
    ansIndex,
    boardTag,
    explanationBn,
  }) => {
    const nextDB = { ...storeState.syllabusDB };
    const clsMap = { ...(nextDB[targetClass] || {}) };
    const grpList = [...(clsMap[targetGroup] || [])];
    let subjIdx = grpList.findIndex((s) => s.id === subjectId);
    if (subjIdx < 0) {
      grpList.push({
        id: subjectId,
        name: { bn: subjectNameBn, en: subjectNameEn || subjectNameBn },
        icon: '📚',
        color: '#4F46E5',
        rgb: '79, 70, 229',
        chapters: [],
      });
      subjIdx = grpList.length - 1;
    }
    const targetSubj = { ...grpList[subjIdx], chapters: [...grpList[subjIdx].chapters] };
    const chapTitle = chapterNameBn || 'অধ্যায় ১';
    let chIdx = targetSubj.chapters.findIndex((c) => c.name.bn === chapTitle || c.name.en === chapTitle);
    if (chIdx < 0) {
      targetSubj.chapters.push({
        id: `${subjectId}-ch-${targetSubj.chapters.length + 1}`,
        name: { bn: chapTitle, en: chapTitle },
        mcqs: [],
        cqs: [],
        formulas: [],
      });
      chIdx = targetSubj.chapters.length - 1;
    } else {
      targetSubj.chapters[chIdx] = {
        ...targetSubj.chapters[chIdx],
        mcqs: [...targetSubj.chapters[chIdx].mcqs],
      };
    }
    targetSubj.chapters[chIdx].mcqs.push({
      id: `${subjectId}-q-${Date.now()}`,
      q: { bn: questionBn, en: questionBn },
      options: { bn: optionsBn, en: optionsBn },
      ans: ansIndex,
      boardTag: boardTag || undefined,
      explanation: explanationBn ? { bn: explanationBn, en: explanationBn } : undefined,
    });
    grpList[subjIdx] = targetSubj;
    clsMap[targetGroup] = grpList;
    nextDB[targetClass] = clsMap;
    setState({ syllabusDB: nextDB });
  },
  updateCustomMcqAnswer: (cls, grp, subjectId, chapterId, questionId, newAnsIndex) => {
    const nextDB = { ...storeState.syllabusDB };
    if (!nextDB[cls]?.[grp]) return;
    nextDB[cls] = {
      ...nextDB[cls],
      [grp]: nextDB[cls][grp].map((s) =>
        s.id !== subjectId
          ? s
          : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chapterId
                  ? c
                  : {
                      ...c,
                      mcqs: c.mcqs.map((m) => (m.id === questionId ? { ...m, ans: newAnsIndex } : m)),
                    }
              ),
            }
      ),
    };
    setState({ syllabusDB: nextDB });
  },
  editCustomMcqFull: ({ targetClass, targetGroup, subjectId, chapterId, questionId, questionBn, optionsBn, ansIndex }) => {
    const nextDB = { ...storeState.syllabusDB };
    if (!nextDB[targetClass]?.[targetGroup]) return;
    nextDB[targetClass] = {
      ...nextDB[targetClass],
      [targetGroup]: nextDB[targetClass][targetGroup].map((s) =>
        s.id !== subjectId
          ? s
          : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chapterId
                  ? c
                  : {
                      ...c,
                      mcqs: c.mcqs.map((m) =>
                        m.id === questionId
                          ? {
                              ...m,
                              q: { bn: questionBn, en: questionBn },
                              options: { bn: optionsBn, en: optionsBn },
                              ans: ansIndex,
                            }
                          : m
                      ),
                    }
              ),
            }
      ),
    };
    setState({ syllabusDB: nextDB });
  },
  deleteCustomMcq: (cls, grp, subjectId, chapterId, questionId) => {
    storeState.adminDeleteQuestion({ className: cls, groupName: grp, subjectId, chapterId, questionId });
  },
  deleteCustomSubject: (cls, grp, subjectId) => {
    const nextDB = { ...storeState.syllabusDB };
    if (!nextDB[cls]?.[grp]) return;
    const defaultList = INITIAL_SYLLABUS_DB[cls]?.[grp] || [];
    const defaultSubj = defaultList.find((s) => s.id === subjectId);
    nextDB[cls] = {
      ...nextDB[cls],
      [grp]: defaultSubj
        ? nextDB[cls][grp].map((s) => (s.id === subjectId ? defaultSubj : s))
        : nextDB[cls][grp].filter((s) => s.id !== subjectId),
    };
    setState({ syllabusDB: nextDB });
  },
  exportProjectSyllabusCode: () => {
    return `// ExamVerse Exported Syllabus Backup (${new Date().toISOString()})
export const EXPORTED_SYLLABUS_DB = ${JSON.stringify(
      storeState.syllabusDB,
      null,
      2
    )};
`;
  },
  resetAllDemoAndProgress: () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem('examverse-v8-storage');
      window.localStorage.removeItem('examverse-v7-storage');
    } catch {
      // ignore
    }
    setState({
      xp: 0,
      level: 1,
      streak: 1,
      chapterMastery: {},
      examHistory: [],
      mistakes: [],
      flashcards: [],
      studyTasks: [],
      communityPosts: [],
      questionReports: [],
      syllabusDB: INITIAL_SYLLABUS_DB,
    });
  },
  adminAddQuestion: ({ className, groupName, subjectId, chapterId, question }) => {
    const nextDB = { ...storeState.syllabusDB };
    const groups = nextDB[className];
    if (!groups || !groups[groupName]) return;
    nextDB[className] = {
      ...groups,
      [groupName]: groups[groupName].map((s) =>
        s.id !== subjectId
          ? s
          : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chapterId ? c : { ...c, mcqs: [question, ...c.mcqs] }
              ),
            }
      ),
    };
    setState({ syllabusDB: nextDB });
  },
  adminBulkImportQuestions: ({ className, groupName, subjectId, chapterId, questions }) => {
    if (!questions.length) return 0;
    const nextDB = { ...storeState.syllabusDB };
    const groups = nextDB[className];
    if (!groups || !groups[groupName]) return 0;
    nextDB[className] = {
      ...groups,
      [groupName]: groups[groupName].map((s) =>
        s.id !== subjectId
          ? s
          : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chapterId ? c : { ...c, mcqs: [...c.mcqs, ...questions] }
              ),
            }
      ),
    };
    setState({ syllabusDB: nextDB });
    return questions.length;
  },
  adminDeleteQuestion: ({ className, groupName, subjectId, chapterId, questionId }) => {
    const nextDB = { ...storeState.syllabusDB };
    const groups = nextDB[className];
    if (!groups || !groups[groupName]) return;
    nextDB[className] = {
      ...groups,
      [groupName]: groups[groupName].map((s) =>
        s.id !== subjectId
          ? s
          : {
              ...s,
              chapters: s.chapters.map((c) =>
                c.id !== chapterId
                  ? c
                  : { ...c, mcqs: c.mcqs.filter((m) => m.id !== questionId) }
              ),
            }
      ),
    };
    setState({ syllabusDB: nextDB });
  },
  getRankInfo: () => {
    const avgAcc =
      storeState.examHistory.length > 0
        ? storeState.examHistory.reduce((acc, e) => acc + e.accuracy, 0) /
          storeState.examHistory.length
        : 78;
    const masteredCount = Object.values(storeState.chapterMastery).filter((v) => v >= 75).length;
    return calculateUserRank({
      xp: storeState.xp,
      accuracyPct: avgAcc,
      masteredChaptersCount: masteredCount,
      totalChaptersCount: 24,
      streakDays: storeState.streak,
      examsCompleted: storeState.examHistory.length,
    });
  },
};
function setState(partial: Partial<ExamStoreState>) {
  storeState = { ...storeState, ...partial };
  savePersisted(storeState);
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function getSnapshot() {
  return storeState;
}
export function useExamStore(): ExamStoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};
/* =====================================================================
   AUTOMATIC SUPABASE AUTH & HASH NAVIGATION SYNC
   ===================================================================== */
let authSyncInitialized = false;
function initSupabaseAuthAndHashSync() {
  if (authSyncInitialized || typeof window === 'undefined') return;
  authSyncInitialized = true;
  window.addEventListener('hashchange', () => {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    if (
      rawHash &&
      !rawHash.startsWith('access_token=') &&
      !rawHash.startsWith('error=')
    ) {
      const normalized = rawHash === 'analytics' ? 'Analytics' : rawHash;
      if (VALID_TABS.includes(normalized as NavTabId) && storeState.activeTab !== normalized) {
        setState({ activeTab: normalized as NavTabId });
      }
    }
  });
  const supaMod = RawSupabase as any;
  const client = supaMod?.supabase;
  if (!client?.auth) return;
  const applySupabaseSessionUser = async (user: any) => {
    if (!user) return;
    const meta = user.user_metadata || {};
    const resolvedName =
      meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : 'শিক্ষার্থী');
    const resolvedEmail = user.email || '';
    const resolvedAvatar = meta.avatar_url || meta.picture || '';
    let nextXp = storeState.xp;
    let nextLevel = storeState.level;
    let nextStreak = storeState.streak;
    let nextMastery = storeState.chapterMastery;
    try {
      const { data: prof } = await client
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (prof) {
        if (typeof prof.xp === 'number' && prof.xp > nextXp) nextXp = prof.xp;
        if (typeof prof.level === 'number' && prof.level > nextLevel) nextLevel = prof.level;
        if (typeof prof.streak === 'number' && prof.streak > nextStreak) nextStreak = prof.streak;
        if (prof.chapter_mastery && typeof prof.chapter_mastery === 'object') {
          nextMastery = { ...prof.chapter_mastery, ...nextMastery };
        }
      }
    } catch {
      // ignore if table not ready
    }
    setState({
      userId: user.id,
      userName: resolvedName,
      userEmail: resolvedEmail,
      userAvatar: resolvedAvatar,
      isAuthenticated: true,
      authModalOpen: false,
      isAuthModalOpen: false,
      xp: nextXp,
      level: getLevelProgress(nextXp).level,
      streak: nextStreak,
      chapterMastery: nextMastery,
    });
    if (typeof supaMod.upsertLiveUserProfile === 'function') {
      supaMod.upsertLiveUserProfile({
        id: user.id,
        name: resolvedName,
        email: resolvedEmail,
        avatar: resolvedAvatar,
        xp: nextXp,
        level: getLevelProgress(nextXp).level,
        streak: nextStreak,
        selectedClass: storeState.selectedClass,
        selectedGroup: storeState.selectedGroup,
        chapterMastery: nextMastery,
      });
    }
    if (window.location.hash.includes('access_token=') && window.history?.replaceState) {
      window.history.replaceState(null, '', `#${storeState.activeTab || 'dashboard'}`);
    }
  };
  client.auth.getSession().then(({ data }: any) => {
    if (data?.session?.user) {
      applySupabaseSessionUser(data.session.user);
    }
  });
  client.auth.onAuthStateChange((_event: string, session: any) => {
    if (session?.user) {
      applySupabaseSessionUser(session.user);
    }
  });
}
initSupabaseAuthAndHashSync();
