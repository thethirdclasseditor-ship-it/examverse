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

const HSC_BANGLA_1ST_PAPER_SUBJECT: SubjectData = {
  id: 'hsc-bn-1',
  name: { bn: 'বাংলা ১ম পত্র (HSC)', en: 'Bangla 1st Paper (HSC)' },
  icon: '📖',
  color: '#E11D48',
  rgb: '225, 29, 72',
  chapters: convertLegacyChapters(HSC_BANGLA_1ST_CHAPTERS, 'bn1'),
};

const HSC_BANGLA_2ND_PAPER_SUBJECT: SubjectData = {
  id: 'hsc-bn-2',
  name: { bn: 'বাংলা ২য় পত্র (HSC)', en: 'Bangla 2nd Paper (HSC)' },
  icon: '✍️',
  color: '#059669',
  rgb: '5, 150, 105',
  chapters: [
    {
      id: 'h-bn2-c1',
      name: { bn: 'বাংলা উচ্চারণের নিয়ম ও বানানের নিয়ম', en: 'Bangla Pronunciation & Spelling Rules' },
      mcqs: [],
      cqs: [],
      formulas: [
        { id: 'bn2-f1', title: { bn: 'অ-ধ্বনির সংবৃত উচ্চারণ', en: 'Pronunciation of O' }, formula: 'শব্দের আদিতে অ-এর পরে ই/ঈ/উ/ঊ থাকলে অ-এর উচ্চারণ ও-কারের মতো হয় (যেমন: অতি -> ওতি, নদী -> নোদি)' },
        { id: 'bn2-f2', title: { bn: 'ণ-ত্ব বিধান', en: 'Rules of N-tva' }, formula: 'ঋ, র, ষ-এর পরে মূর্ধন্য ণ হয় (যেমন: ঋণ, তৃণ, বর্ণ, উষ্ণ)' },
      ],
    },
    {
      id: 'h-bn2-c2',
      name: { bn: 'ব্যাকরণিক শব্দশ্রেণি, উপসর্গ, সমাস ও বাক্যতত্ত্ব', en: 'Word Classes, Prefixes, Compounds & Syntax' },
      mcqs: [],
      cqs: [],
      formulas: [
        { id: 'bn2-f3', title: { bn: 'বাংলা ও তৎসম উপসর্গ', en: 'Prefixes' }, formula: 'খাঁটি বাংলা উপসর্গ ২১টি এবং সংস্কৃত/তৎসম উপসর্গ ২০টি' },
      ],
    },
  ],
};

const HSC_ICT_SUBJECT: SubjectData = {
  id: 'hsc-ict',
  name: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', en: 'ICT (HSC)' },
  icon: '💻',
  color: '#0284C7',
  rgb: '2, 132, 199',
  chapters: [
    {
      id: 'h-ict-c1',
      name: { bn: '১ম অধ্যায়: বিশ্ব ও বাংলাদেশ প্রেক্ষিত', en: 'Ch 1: World & Bangladesh Perspective' },
      mcqs: [],
      cqs: [],
      formulas: [
        { id: 'ict-f1', title: { bn: 'ন্যানোটেকনোলজি স্কেল', en: 'Nanotechnology Scale' }, formula: '1 nm = 10⁻⁹ m (1 থেকে 100 nm স্কেল)' },
        { id: 'ict-f2', title: { bn: 'ক্রায়োসার্জারি তাপমাত্রা', en: 'Cryosurgery Temp' }, formula: '-41°C থেকে -196°C (তরল নাইট্রোজেন বা আর্গন গ্যাস)' },
      ],
    },
    {
      id: 'h-ict-c2',
      name: { bn: '২য় অধ্যায়: কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং', en: 'Ch 2: Communication Systems & Networking' },
      mcqs: [],
      cqs: [],
      formulas: [
        { id: 'ict-f3', title: { bn: 'Mesh টপোলজি সংযোগ সংখ্যা', en: 'Mesh Topology Links' }, formula: 'মোট সংযোগ তার = n(n - 1) ÷ 2' },
      ],
    },
    {
      id: 'h-ict-c3',
      name: { bn: '৩য় অধ্যায়: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', en: 'Ch 3: Number Systems & Digital Devices' },
      mcqs: [],
      cqs: [],
      formulas: [
        { id: 'ict-f4', title: { bn: 'ডি-মরগ্যানের উপপাদ্য (De Morgan)', en: 'De Morgan Theorems' }, formula: '(A + B)′ = A′ · B′ এবং (A · B)′ = A′ + B′' },
        { id: 'ict-f5', title: { bn: 'XOR ও XNOR সমীকরণ', en: 'XOR & XNOR' }, formula: 'A ⊕ B = A′B + AB′ এবং (A ⊕ B)′ = AB + A′B′' },
        { id: 'ict-f6', title: { bn: 'Half Adder ও Full Adder', en: 'Adder Equations' }, formula: 'Half Adder: S = A ⊕ B, C = AB | Full Adder: S = A ⊕ B ⊕ Cin, Cout = AB + BCin + ACin' },
      ],
    },
    {
      id: 'h-ict-c4',
      name: { bn: '৪র্থ অধ্যায়: ওয়েব ডিজাইন পরিচিতি এবং HTML', en: 'Ch 4: Web Design & HTML' },
      mcqs: [],
      cqs: [],
      formulas: [
        { id: 'ict-f7', title: { bn: 'হাইপারলিংক ও ইমেজ ট্যাগ', en: 'HTML Anchor & Image' }, formula: '<a href="url">Text</a> এবং <img src="file.jpg" alt="text" />' },
      ],
    },
    {
      id: 'h-ict-c5',
      name: { bn: '৫ম অধ্যায়: প্রোগ্রামিং ভাষা (C Programming)', en: 'Ch 5: Programming Language (C)' },
      mcqs: [],
      cqs: [],
      formulas: [
        { id: 'ict-f8', title: { bn: 'সমান্তর ধারার যোগফল', en: 'Series Sum' }, formula: '1 + 2 + 3 + ... + n = n(n + 1) ÷ 2' },
      ],
    },
  ],
};

const HSC_ACCOUNTING_1ST_PAPER_SUBJECT: SubjectData = {
  id: 'acc-1',
  name: { bn: 'হিসাববিজ্ঞান ১ম পত্র', en: 'Accounting 1st Paper' },
  icon: '📘',
  color: '#4F46E5',
  rgb: '79, 70, 229',
  chapters: convertLegacyChapters(HSC_ACCOUNTING_1ST_PAPER_CHAPTERS, 'acc1'),
};

const HSC_ACCOUNTING_2ND_PAPER_SUBJECT: SubjectData = {
  id: 'acc-2',
  name: { bn: 'হিসাববিজ্ঞান ২য় পত্র', en: 'Accounting 2nd Paper' },
  icon: '📊',
  color: '#D97706',
  rgb: '217, 119, 6',
  chapters: convertLegacyChapters(HSC_ACCOUNTING_2ND_PAPER_CHAPTERS, 'acc2'),
};

const INITIAL_SYLLABUS_DB: Record<string, Record<string, SubjectData[]>> = {
  HSC: {
    'Business Studies': [
      HSC_ACCOUNTING_1ST_PAPER_SUBJECT,
      HSC_ACCOUNTING_2ND_PAPER_SUBJECT,
      HSC_BANGLA_1ST_PAPER_SUBJECT,
      HSC_BANGLA_2ND_PAPER_SUBJECT,
      HSC_ICT_SUBJECT,
      {
        id: 'bom-1',
        name: { bn: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র', en: 'Business Org. & Management 1st Paper' },
        icon: '🏢',
        color: '#059669',
        rgb: '5, 150, 105',
        chapters: [
          {
            id: 'bom1-c1',
            name: { bn: 'ব্যবসায়ের মৌলিক ধারণা, অংশীদারি ও যৌথ মূলধনী ব্যবসায়', en: 'Fundamentals, Partnership & Joint Stock Company' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'bom1-f1', title: { bn: 'অংশীদারি ব্যবসায়ের সদস্যসংখ্যা (১৯৩২ সালের আইন)', en: 'Partnership Members' }, formula: 'সাধারণ ব্যবসায়: সর্বনিম্ন ২ জন, সর্বোচ্চ ২০ জন | ব্যাংকিং ব্যবসায়: সর্বনিম্ন ২ জন, সর্বোচ্চ ১০ জন' },
              { id: 'bom1-f2', title: { bn: 'কোম্পানি আইন ১৯৯৪ অনুযায়ী সদস্যসংখ্যা', en: 'Company Members' }, formula: 'প্রাইভেট লিমিটেড: ২ থেকে ৫০ জন | পাবলিক লিমিটেড: সর্বনিম্ন ৭ জন, সর্বোচ্চ শেয়ার সংখ্যা দ্বারা সীমাবদ্ধ' },
            ],
          },
        ],
      },
      {
        id: 'bom-2',
        name: { bn: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র', en: 'Business Org. & Management 2nd Paper' },
        icon: '📋',
        color: '#0D9488',
        rgb: '13, 148, 136',
        chapters: [
          {
            id: 'bom2-c1',
            name: { bn: 'ব্যবস্থাপনার ধারণা, নীতি ও কার্যাবলি (POSDCORB)', en: 'Management Concepts, Principles & POSDCORB' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'bom2-f1', title: { bn: 'হেনরি ফেয়লের ব্যবস্থাপনার ১৪টি নীতি', en: 'Fayol 14 Principles' }, formula: 'আদেশের ঐক্য (একজন কর্মীর একজনই বস), নির্দেশনার ঐক্য, জোড়া-মই শিকল নীতি, নিয়মানুবর্তিতা ও ন্যায়পরায়ণতা' },
            ],
          },
        ],
      },
      {
        id: 'fin-1',
        name: { bn: 'ফিন্যান্স, ব্যাংকিং ও বিমা ১ম পত্র', en: 'Finance, Banking & Insurance 1st Paper' },
        icon: '💰',
        color: '#7C3AED',
        rgb: '124, 58, 237',
        chapters: [
          {
            id: 'fin1-c1',
            name: { bn: 'অর্থের সময়মূল্য (Time Value of Money), ঝুঁকি ও মূলধন বাজেটিং', en: 'Time Value of Money, Risk & Capital Budgeting' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'fin1-f1', title: { bn: 'ভবিষ্যৎ মূল্য ও বর্তমান মূল্য (FV & PV)', en: 'FV & PV' }, formula: 'FV = PV(1 + i)ⁿ এবং PV = FV ÷ (1 + i)ⁿ' },
              { id: 'fin1-f2', title: { bn: 'প্রকৃত সুদের হার (EAR) ও বিধি ৭২ (Rule 72)', en: 'EAR & Rule 72' }, formula: 'EAR = (1 + i/m)ᵐ - 1 | টাকা দ্বিগুণ হওয়ার সময় n = 72 ÷ সুদের হার (%)' },
              { id: 'fin1-f3', title: { bn: 'নিট বর্তমান মূল্য (NPV) ও পে-ব্যাক সময় (PBP)', en: 'NPV & PBP' }, formula: 'NPV = Σ [CFt ÷ (1 + k)ᵗ] - NCO | PBP = প্রাথমিক বিনিয়োগ ÷ বার্ষিক নগদ আন্তঃপ্রবাহ' },
            ],
          },
        ],
      },
      {
        id: 'fin-2',
        name: { bn: 'ফিন্যান্স, ব্যাংকিং ও বিমা ২য় পত্র', en: 'Finance, Banking & Insurance 2nd Paper' },
        icon: '🏦',
        color: '#2563EB',
        rgb: '37, 99, 235',
        chapters: [
          {
            id: 'fin2-c1',
            name: { bn: 'ব্যাংক ব্যবস্থার প্রাথমিক ধারণা, কেন্দ্রীয় ব্যাংক ও বিমা', en: 'Banking Fundamentals, Central Bank & Insurance' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'fin2-f1', title: { bn: 'বিমা চুক্তির অপরিহার্য উপাদান', en: 'Insurance Principles' }, formula: 'চরম সদ্বিশ্বাসের নীতি (Utmost Good Faith), বিমাযোগ্য স্বার্থ ও স্থলাভিষিক্তকরণের নীতি' },
            ],
          },
        ],
      },
    ],
    Science: [
      HSC_BANGLA_1ST_PAPER_SUBJECT,
      HSC_BANGLA_2ND_PAPER_SUBJECT,
      HSC_ICT_SUBJECT,
      {
        id: 'phy-1',
        name: { bn: 'পদার্থবিজ্ঞান ১ম পত্র', en: 'Physics 1st Paper' },
        icon: '⚛️',
        color: '#4F46E5',
        rgb: '79, 70, 229',
        chapters: [
          {
            id: 'phy1-c1',
            name: { bn: 'ভেক্টর, গতিবিদ্যা, নিউটনীয় বলবিদ্যা ও কাজ-শক্তি-ক্ষমতা', en: 'Vectors, Kinematics, Newtonian Mechanics & Work-Power-Energy' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'phy1-f1', title: { bn: 'ভেক্টর লব্ধির মান ও দিক', en: 'Resultant Vector' }, formula: 'R = √(P² + Q² + 2PQ cosα), tanθ = (Q sinα) ÷ (P + Q cosα)' },
              { id: 'phy1-f2', title: { bn: 'প্রাসের পাল্লা ও সর্বাধিক উচ্চতা', en: 'Projectile Motion' }, formula: 'R = (v₀² sin 2θ₀) ÷ g, H = (v₀² sin²θ₀) ÷ 2g, T = (2v₀ sinθ₀) ÷ g' },
              { id: 'phy1-f3', title: { bn: 'গতিশক্তি ও মহাকর্ষীয় মুক্তিবেগ', en: 'Kinetic Energy & Escape Velocity' }, formula: 'Ek = ½mv² = p² ÷ 2m | মুক্তিবেগ ve = √(2gR) = 11.2 km/s' },
            ],
          },
        ],
      },
      {
        id: 'phy-2',
        name: { bn: 'পদার্থবিজ্ঞান ২য় পত্র', en: 'Physics 2nd Paper' },
        icon: '⚡',
        color: '#0284C7',
        rgb: '2, 132, 199',
        chapters: [
          {
            id: 'phy2-c1',
            name: { bn: 'তাপগতিবিদ্যা, স্থির ও চল তড়িৎ এবং আধুনিক পদার্থবিজ্ঞান', en: 'Thermodynamics, Electricity & Modern Physics' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'phy2-f1', title: { bn: 'তাপগতিবিদ্যার ১ম সূত্র ও কার্নো ইঞ্জিনের দক্ষতা', en: '1st Law & Carnot Efficiency' }, formula: 'dQ = dU + dW | দক্ষতা η = (1 - T₂/T₁) × 100%' },
              { id: 'phy2-f2', title: { bn: 'কুলম্বের সূত্র ও জুলের তাপীয় ক্রিয়া', en: 'Coulomb & Joule Law' }, formula: 'F = (1/4πε₀) · (q₁q₂ / r²) | H = I²Rt' },
              { id: 'phy2-f3', title: { bn: 'আইনস্টাইনের ভর-শক্তি ও ফটোইলেকট্রিক সমীকরণ', en: 'Relativity & Photoelectric' }, formula: 'E = mc² | hf = hf₀ + Ek(max)' },
            ],
          },
        ],
      },
      {
        id: 'chem-1',
        name: { bn: 'রসায়ন ১ম পত্র', en: 'Chemistry 1st Paper' },
        icon: '🧪',
        color: '#059669',
        rgb: '5, 150, 105',
        chapters: [
          {
            id: 'chem1-c1',
            name: { bn: 'গুণগত রসায়ন, মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক পরিবর্তন', en: 'Qualitative Chemistry, Periodic Properties & Chemical Change' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'chem1-f1', title: { bn: 'রিডবার্গ সমীকরণ ও বোর কক্ষপথের কৌণিক ভরবেগ', en: 'Rydberg & Bohr' }, formula: '1/λ = R_H (1/n₁² - 1/n₂²) | mvr = nh ÷ 2π' },
              { id: 'chem1-f2', title: { bn: 'হেন্ডারসন-হ্যাসেলবাক বাফার সমীকরণ', en: 'Henderson-Hasselbalch' }, formula: 'pH = pKa + log([লবণ] ÷ [অম্ল]), pH + pOH = 14' },
            ],
          },
        ],
      },
      {
        id: 'chem-2',
        name: { bn: 'রসায়ন ২য় পত্র', en: 'Chemistry 2nd Paper' },
        icon: '⚗️',
        color: '#0D9488',
        rgb: '13, 148, 136',
        chapters: [
          {
            id: 'chem2-c1',
            name: { bn: 'পরিবেশ রসায়ন, জৈব রসায়ন, পরিমাণগত রসায়ন ও তড়িৎ রসায়ন', en: 'Environmental, Organic, Quantitative & Electrochemistry' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'chem2-f1', title: { bn: 'আদর্শ গ্যাস সমীকরণ ও মোলার ঘনমাত্রা', en: 'Ideal Gas & Molarity' }, formula: 'PV = nRT = (w/M)RT | S = (1000 × w) ÷ (M × V)' },
              { id: 'chem2-f2', title: { bn: 'ফ্যারাডের তড়িৎ বিশ্লেষণ সূত্র', en: 'Faraday Law' }, formula: 'W = ZIt = (e × I × t) ÷ 96500' },
            ],
          },
        ],
      },
      {
        id: 'math-1',
        name: { bn: 'উচ্চতর গণিত ১ম পত্র', en: 'Higher Math 1st Paper' },
        icon: '📐',
        color: '#D97706',
        rgb: '217, 119, 6',
        chapters: [
          {
            id: 'math1-c1',
            name: { bn: 'ম্যাট্রিক্স ও নির্ণায়ক, সরলরেখা, বৃত্ত, ত্রিকোণমিতি ও ক্যালকুলাস', en: 'Matrices, Straight Lines, Circles, Trigonometry & Calculus' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'math1-f1', title: { bn: 'বিপরীত ম্যাট্রিক্স ও সরলরেখার ঢাল', en: 'Inverse Matrix & Slope' }, formula: 'A⁻¹ = adj(A) ÷ |A| (যেখানে |A| ≠ 0) | m = (y₂ - y₁) ÷ (x₂ - x₁) = tanθ' },
              { id: 'math1-f2', title: { bn: 'অন্তরীকরণ ও যোগজীকরণ মৌলিক সূত্র', en: 'Differentiation & Integration' }, formula: 'd/dx (xⁿ) = nxⁿ⁻¹, d/dx (sin x) = cos x | ∫ xⁿ dx = xⁿ⁺¹/(n+1) + c' },
            ],
          },
        ],
      },
      {
        id: 'bio-1',
        name: { bn: 'জীববিজ্ঞান ১ম ও ২য় পত্র', en: 'Biology 1st & 2nd Paper' },
        icon: '🧬',
        color: '#10B981',
        rgb: '16, 185, 129',
        chapters: [
          {
            id: 'bio1-c1',
            name: { bn: 'কোষ ও এর গঠন, কোষ বিভাজন, উদ্ভিদ শারীরতত্ত্ব ও মানব শারীরতত্ত্ব', en: 'Cell Structure, Cell Division, Plant & Human Physiology' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'bio1-f1', title: { bn: 'শ্বসন ও সালোকসংশ্লেষণ এবং BMI সূত্র', en: 'Respiration & BMI' }, formula: 'সবাত শ্বসনে ১ অণু গ্লুকোজ থেকে ৩৮টি (বা ৩৬টি) ATP উৎপন্ন হয় | BMI = ওজন (kg) ÷ [উচ্চতা (m)]²' },
            ],
          },
        ],
      },
    ],
    Humanities: [
      HSC_BANGLA_1ST_PAPER_SUBJECT,
      HSC_BANGLA_2ND_PAPER_SUBJECT,
      HSC_ICT_SUBJECT,
      {
        id: 'eco-1',
        name: { bn: 'অর্থনীতি ১ম পত্র', en: 'Economics 1st Paper' },
        icon: '📈',
        color: '#4F46E5',
        rgb: '79, 70, 229',
        chapters: [
          {
            id: 'eco1-c1',
            name: { bn: 'ভোক্তা ও উৎপাদকের আচরণ, চাহিদা-যোগান ও বাজার', en: 'Consumer & Producer Behavior, Demand-Supply & Market' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'eco1-f1', title: { bn: 'চাহিদা অপেক্ষক ও স্থিতিস্থাপকতা', en: 'Demand Function & Elasticity' }, formula: 'Qd = a - bP, Qs = c + dP | Ed = (ΔQ ÷ ΔP) × (P ÷ Q)' },
              { id: 'eco1-f2', title: { bn: 'ভারসাম্য ও জাতীয় আয় সমীকরণ', en: 'Equilibrium & GDP' }, formula: 'বাজার ভারসাম্য: Qd = Qs | Y = C + I + G + (X - M)' },
            ],
          },
        ],
      },
      {
        id: 'eco-2',
        name: { bn: 'অর্থনীতি ২য় পত্র', en: 'Economics 2nd Paper' },
        icon: '🌾',
        color: '#059669',
        rgb: '5, 150, 105',
        chapters: [
          {
            id: 'eco2-c1',
            name: { bn: 'বাংলাদেশের অর্থনীতি, জনসংখ্যা ও মুদ্রাস্ফীতি', en: 'Economy of Bangladesh, Population & Inflation' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'eco2-f1', title: { bn: 'জনসংখ্যার ঘনত্ব ও মুদ্রাস্ফীতির হার', en: 'Population Density & Inflation' }, formula: 'জনসংখ্যার ঘনত্ব = মোট জনসংখ্যা ÷ মোট জমির পরিমাণ | মুদ্রাস্ফীতি = [(CPI₂ - CPI₁) ÷ CPI₁] × 100' },
            ],
          },
        ],
      },
      {
        id: 'civ-1',
        name: { bn: 'পৌরনীতি ও সুশাসন ১ম ও ২য় পত্র', en: 'Civics & Good Governance 1st & 2nd Paper' },
        icon: '⚖️',
        color: '#7C3AED',
        rgb: '124, 58, 237',
        chapters: [
          {
            id: 'civ1-c1',
            name: { bn: 'পৌরনীতি, সুশাসন, সংবিধান ও বাংলাদেশের অভ্যুদয়', en: 'Civics, Good Governance, Constitution & Emergence of Bangladesh' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 'civ1-f1', title: { bn: 'পৌরনীতির উৎপত্তি ও বাংলাদেশের সংবিধান', en: 'Civics Origin & Constitution' }, formula: 'ল্যাটিন Civis (নাগরিক) ও Civitas (নগররাষ্ট্র) | সংবিধান গৃহীত ৪ নভেম্বর ১৯৭২, কার্যকর ১৬ ডিসেম্বর ১৯৭২ (১১ ভাগ, ১৫৩ অনুচ্ছেদ)' },
            ],
          },
        ],
      },
    ],
  },
  SSC: {
    Science: [
      {
        id: 'ssc-phy',
        name: { bn: 'পদার্থবিজ্ঞান (SSC)', en: 'Physics (SSC)' },
        icon: '🔭',
        color: '#4F46E5',
        rgb: '79, 70, 229',
        chapters: [
          {
            id: 's-phy-c1',
            name: { bn: 'ভৌত রাশি ও পরিমাপ, গতি, বল এবং কাজ, ক্ষমতা ও শক্তি', en: 'Physical Quantities, Motion, Force & Work-Power-Energy' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 's-phy-f1', title: { bn: 'গতির সমীকরণসমূহ', en: 'Equations of Motion' }, formula: 'v = u + at, s = ut + ½at², v² = u² + 2as' },
              { id: 's-phy-f2', title: { bn: 'বল, ক্ষমতা ও কর্মদক্ষতা', en: 'Force, Power & Efficiency' }, formula: 'F = ma, P = W/t | কর্মদক্ষতা η = (লভ্য কার্যকর শক্তি ÷ প্রদত্ত মোট শক্তি) × 100%' },
            ],
          },
        ],
      },
      {
        id: 'ssc-chem',
        name: { bn: 'রসায়ন (SSC)', en: 'Chemistry (SSC)' },
        icon: '🧪',
        color: '#059669',
        rgb: '5, 150, 105',
        chapters: [
          {
            id: 's-chem-c1',
            name: { bn: 'পদার্থের গঠন, পর্যায় সারণি, রাসায়নিক বন্ধন ও মোলের ধারণা', en: 'Structure of Matter, Periodic Table, Bonding & Mole Concept' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 's-chem-f1', title: { bn: 'মোল সংখ্যা ও মোলার ঘনমাত্রা', en: 'Mole & Molarity' }, formula: 'n = w/M = V/22.4 (STP) = N / (6.023 × 10²³) | S = (1000 × w) ÷ (M × V)' },
            ],
          },
        ],
      },
      {
        id: 'ssc-math',
        name: { bn: 'সাধারণ গণিত (SSC)', en: 'General Mathematics (SSC)' },
        icon: '📏',
        color: '#D97706',
        rgb: '217, 119, 6',
        chapters: [
          {
            id: 's-math-c1',
            name: { bn: 'বীজগাণিতিক রাশি, সূচক ও লগারিদম, ত্রিকোণমিতি এবং পরিমিতি', en: 'Algebraic Expressions, Exponents, Trigonometry & Mensuration' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 's-math-f1', title: { bn: 'বীজগণিত ও ত্রিকোণমিতিক অভেদাবলি', en: 'Algebra & Trig Identities' }, formula: '(a+b)² = a² + 2ab + b² | sin²θ + cos²θ = 1, sec²θ - tan²θ = 1' },
            ],
          },
        ],
      },
    ],
    'Business Studies': [
      {
        id: 'ssc-acc',
        name: { bn: 'হিসাববিজ্ঞান (SSC)', en: 'Accounting (SSC)' },
        icon: '📒',
        color: '#D97706',
        rgb: '217, 119, 6',
        chapters: [
          {
            id: 's-acc-c1',
            name: { bn: 'লেনদেন, দুতরফা দাখিলা পদ্ধতি, জাবেদা, খতিয়ান ও রেওয়ামিল', en: 'Transactions, Double Entry, Journal, Ledger & Trial Balance' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 's-acc-f1', title: { bn: 'হিসাব সমীকরণ', en: 'Accounting Equation' }, formula: 'A = L + (C + R - E - D)' },
            ],
          },
        ],
      },
      {
        id: 'ssc-fin',
        name: { bn: 'ফিন্যান্স ও ব্যাংকিং (SSC)', en: 'Finance & Banking (SSC)' },
        icon: '💵',
        color: '#7C3AED',
        rgb: '124, 58, 237',
        chapters: [
          {
            id: 's-fin-c1',
            name: { bn: 'অর্থের সময়মূল্য, ঝুঁকি ও অনিশ্চয়তা এবং মূলধন বাজেটিং', en: 'Time Value of Money, Risk & Capital Budgeting' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 's-fin-f1', title: { bn: 'ভবিষ্যৎ ও বর্তমান মূল্য', en: 'FV & PV' }, formula: 'FV = PV(1 + i)ⁿ, PV = FV ÷ (1 + i)ⁿ' },
            ],
          },
        ],
      },
    ],
    Humanities: [
      {
        id: 'ssc-his',
        name: { bn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা (SSC)', en: 'History of Bangladesh & World Civilization (SSC)' },
        icon: '🏛️',
        color: '#4F46E5',
        rgb: '79, 70, 229',
        chapters: [
          {
            id: 's-his-c1',
            name: { bn: 'প্রাচীন বাংলার জনপদ, ব্রিটিশ শাসন, ভাষা আন্দোলন ও মুক্তিযুদ্ধ', en: 'Ancient Bengal, British Rule, Language Movement & Liberation War' },
            mcqs: [],
            cqs: [],
            formulas: [
              { id: 's-his-f1', title: { bn: 'গুরুত্বপূর্ণ ঐতিহাসিক মাইলফলক', en: 'Key Historical Milestones' }, formula: '১৭৫৭: পলাশীর যুদ্ধ | ১৯৫২: ভাষা আন্দোলন | ১৯৬৬: ৬ দফা | ১৯৭১: মহান মুক্তিযুদ্ধ' },
            ],
          },
        ],
      },
    ],
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

const STORAGE_KEY = 'examverse-v9-storage';

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

function sanitizeSubjectList(list: any[], fallbackList: SubjectData[]): SubjectData[] {
  if (!Array.isArray(list) || list.length === 0) return fallbackList;
  return list
    .filter((s) => s && typeof s === 'object' && s.id)
    .map((s) => {
      if (s.id === 'acc-1') return HSC_ACCOUNTING_1ST_PAPER_SUBJECT;
      if (s.id === 'acc-2') return HSC_ACCOUNTING_2ND_PAPER_SUBJECT;
      if (s.id === 'hsc-bn-1') return HSC_BANGLA_1ST_PAPER_SUBJECT;
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
}

function mergeBuiltInSubjects(savedDB?: Record<string, Record<string, SubjectData[]>>) {
  if (!savedDB || typeof savedDB !== 'object') return INITIAL_SYLLABUS_DB;
  const merged: Record<string, Record<string, SubjectData[]>> = {
    HSC: { ...INITIAL_SYLLABUS_DB.HSC },
    SSC: { ...INITIAL_SYLLABUS_DB.SSC },
  };
  const injectBuiltIns = (list: SubjectData[]) => {
    const next = [...list];
    if (!next.some((s) => s.id === 'hsc-bn-1')) {
      next.push(HSC_BANGLA_1ST_PAPER_SUBJECT);
    }
    return next;
  };
  merged.HSC['Business Studies'] = injectBuiltIns(
    sanitizeSubjectList(
      savedDB.HSC?.['Business Studies'] || INITIAL_SYLLABUS_DB.HSC['Business Studies'],
      INITIAL_SYLLABUS_DB.HSC['Business Studies']
    )
  );
  if (!merged.HSC['Business Studies'].some((s) => s.id === 'acc-1')) {
    merged.HSC['Business Studies'].unshift(HSC_ACCOUNTING_1ST_PAPER_SUBJECT);
  }
  if (!merged.HSC['Business Studies'].some((s) => s.id === 'acc-2')) {
    merged.HSC['Business Studies'].splice(1, 0, HSC_ACCOUNTING_2ND_PAPER_SUBJECT);
  }
  merged.HSC.Science = injectBuiltIns(
    sanitizeSubjectList(
      savedDB.HSC?.Science || INITIAL_SYLLABUS_DB.HSC.Science,
      INITIAL_SYLLABUS_DB.HSC.Science
    )
  );
  merged.HSC.Humanities = injectBuiltIns(
    sanitizeSubjectList(
      savedDB.HSC?.Humanities || INITIAL_SYLLABUS_DB.HSC.Humanities,
      INITIAL_SYLLABUS_DB.HSC.Humanities
    )
  );
  return merged;
}

function loadPersistedState(): Partial<ExamStoreState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem('examverse-v8-storage') ||
      window.localStorage.getItem('examverse-v7-storage');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return {
      ...parsed,
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
  selectedGroup: typeof persisted.selectedGroup === 'string' && persisted.selectedGroup ? persisted.selectedGroup : 'Business Studies',
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
