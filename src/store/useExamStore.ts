import React, { useSyncExternalStore } from 'react';
import { HSC_ACCOUNTING_2ND_PAPER_CHAPTERS } from '../data/syllabusData';
import * as RawSupabase from '../lib/supabase';
import {
  ActiveQuizConfig,
  ChapterData,
  ChapterFormula,
  CommunityPost,
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

// Exported types required by src/data/syllabusData.ts
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
  qA: string; ansA: string;
  qB: string; ansB: string;
  qC: string; ansC: string;
  qD: string; ansD: string;
}

export interface Chapter {
  id: string;
  name: string;
  mcqs: MCQ[];
  cqs: CQ[];
  formulas?: string[];
}

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

export interface QuestionReportItem {
  id: string;
  questionId: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  questionText: string;
  options: string[];
  currentAns: number;
  issueType: string;
  comment: string;
  reportedBy: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}

/* =====================================================================
   LEVEL & RANK PROGRESSION ENGINE
   ===================================================================== */
export function getLevelProgress(xp: number): {
  level: number;
  currentLevelXp: number;
  xpForNextLevel: number;
  progressPct: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, Number(xp) || 0);
  const level = Math.max(1, Math.floor(safeXp / 250) + 1);
  const xpForNextLevel = level * 250;
  const prevLevelXp = (level - 1) * 250;
  const currentLevelXp = safeXp - prevLevelXp;
  const pct = Math.min(100, Math.round((currentLevelXp / 250) * 100));
  return {
    level,
    currentLevelXp,
    xpForNextLevel,
    progressPct: pct,
    progressPercent: pct,
  };
}

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
  const progressPct = current.id === 'elite' && rankScore >= 1000 ? 100 : Math.min(99, Math.round((within / span) * 100));

  let division: RankProgressInfo['division'] = 'I';
  if (current.id === 'elite' && progressPct >= 95) division = 'MAX';
  else if (progressPct >= 67) division = 'III';
  else if (progressPct >= 34) division = 'II';

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

/* =====================================================================
   CONVERT 297 MCQs FROM syllabusData.ts INTO SubjectData
   ===================================================================== */
const ACCOUNTING_2ND_PAPER_SUBJECT: SubjectData = {
  id: 'hsc-acc-2',
  name: {
    en: 'Accounting 2nd Paper (HSC)',
    bn: 'হিসাববিজ্ঞান ২য় পত্র',
  },
  icon: '📊',
  color: '#D97706',
  chapters: (HSC_ACCOUNTING_2ND_PAPER_CHAPTERS || []).map((ch, chIdx): ChapterData => {
    const mappedMcqs: MCQQuestion[] = (ch.mcqs || []).map((m): MCQQuestion => ({
      id: m.id,
      q: { en: m.question, bn: m.question },
      options: { en: [...m.options], bn: [...m.options] },
      ans: m.correctIndex,
      explanation: {
        en: m.explanation || 'NCTB Accounting 2nd Paper standard solution.',
        bn: m.explanation || 'NCTB হিসাববিজ্ঞান ২য় পত্র বোর্ড স্ট্যান্ডার্ড সমাধান।',
      },
      boardTag: m.board || 'NCTB ও বোর্ড প্রশ্ন',
    }));

    const mappedFormulas: ChapterFormula[] = (ch.formulas || []).map((fStr, fIdx): ChapterFormula => {
      const parts = fStr.split(/[:=]/);
      const titleBn = parts.length > 1 ? parts[0].trim() : `${ch.name} — সূত্র ${fIdx + 1}`;
      return {
        id: `${ch.id}-f-${fIdx + 1}`,
        title: { en: titleBn, bn: titleBn },
        formula: fStr,
        note: { en: ch.name, bn: `অধ্যায় ${chIdx + 1}: ${ch.name}` },
      };
    });

    return {
      id: ch.id,
      name: {
        en: `Chapter ${chIdx + 1}: ${ch.name}`,
        bn: `অধ্যায় ${chIdx + 1}: ${ch.name}`,
      },
      mcqs: mappedMcqs,
      cqs: [],
      formulas: mappedFormulas,
    };
  }),
};

function makeSimpleSubj(
  id: string,
  nameBn: string,
  nameEn: string,
  icon: string,
  color: string,
  chaptersRaw: { id: string; nameBn: string; formulas: string[]; mcqs?: { id: string; q: string; opts: [string, string, string, string]; ans: number; exp: string; board?: string }[] }[]
): SubjectData {
  return {
    id,
    name: { en: nameEn, bn: nameBn },
    icon,
    color,
    chapters: chaptersRaw.map((c, idx) => ({
      id: c.id,
      name: { en: c.nameBn, bn: c.nameBn },
      mcqs: (c.mcqs || []).map((m) => ({
        id: m.id,
        q: { en: m.q, bn: m.q },
        options: { en: [...m.opts], bn: [...m.opts] },
        ans: m.ans,
        explanation: { en: m.exp, bn: m.exp },
        boardTag: m.board || 'NCTB Board',
      })),
      cqs: [],
      formulas: c.formulas.map((f, fIdx) => {
        const parts = f.split(/[:=]/);
        const titleBn = parts.length > 1 ? parts[0].trim() : `সূত্র ${fIdx + 1}`;
        return {
          id: `${c.id}_f_${fIdx + 1}`,
          title: { en: titleBn, bn: titleBn },
          formula: f,
          note: { en: c.nameBn, bn: `অধ্যায় ${idx + 1}: ${c.nameBn}` },
        };
      }),
    })),
  };
}

const HSC_COMMON_SUBJECTS: SubjectData[] = [
  makeSimpleSubj('hsc-bn-1', 'বাংলা ১ম পত্র', 'Bangla 1st Paper', '📖', '#059669', [
    {
      id: 'h-bn1-c1',
      nameBn: 'গদ্য: অপরিচিতা, বিলাসী, আমার পথ, মানব-কল্যাণ, মাসি-পিসি, বায়ান্নর দিনগুলো, রেইনকোট',
      formulas: [
        'অপরিচিতা: রবীন্দ্রনাথ ঠাকুর (সবুজপত্র পত্রিকা, ১৯১৪; বিয়ের সময় অনুপমের বয়স ২৭ বছর, কল্যাণীর ১৫ বছর)',
        'বিলাসী: শরৎচন্দ্র চট্টোপাধ্যায় (ভারতী পত্রিকা, ১৯১৮; ন্যাড়ার মাদুলি ও সাপুড়ে জীবন)',
        'বায়ান্নর দিনগুলো: শেখ মুজিবুর রহমান (অসমাপ্ত আত্মজীবনী; ১৬ ফেব্রুয়ারি অনশন শুরু)',
      ],
      mcqs: [
        { id: 'bn1-1', q: "'অপরিচিতা' গল্পে বিয়ের সময় অনুপমের বয়স কত ছিল?", opts: ['২৩ বছর', '২৫ বছর', '২৭ বছর', '২৮ বছর'], ans: 2, exp: 'বিয়ের সময় অনুপমের বয়স ছিল ২৭ বছর এবং কল্যাণীর বয়স ছিল ১৫ বছর।' },
      ],
    },
    {
      id: 'h-bn1-c2',
      nameBn: 'পদ্য: সোনার তরী, বিদ্রোহী, প্রতিদান, তাহারেই পড়ে মনে, আঠারো বছর বয়স, ফেব্রুয়ারি ১৯৬৯',
      formulas: [
        'সোনার তরী: মাত্রাবৃত্ত ছন্দ (৮+৫ মাত্রা, রবীন্দ্রনাথ ঠাকুর, কাব্যগ্রন্থ: সোনার তরী ১৮৯৪)',
        'বিদ্রোহী: কাজী নজরুল ইসলাম (অগ্নিবীণা কাব্যগ্রন্থ ১৯২২, বিজলী পত্রিকা)',
        'আঠারো বছর বয়স: সুকান্ত ভট্টাচার্য (ছাড়পত্র কাব্যগ্রন্থ ১৯৪৮, মাত্রাবৃত্ত ছন্দ)',
      ],
      mcqs: [
        { id: 'bn1-2', q: "'সোনার তরী' কবিতাটি কোন ছন্দে রচিত?", opts: ['স্বরবৃত্ত', 'মাত্রাবৃত্ত', 'অক্ষরবৃত্ত', 'গদ্যছন্দ'], ans: 1, exp: 'সোনার তরী কবিতাটি ৮+৫ মাত্রার মাত্রাবৃত্ত ছন্দে রচিত।' },
      ],
    },
  ]),
  makeSimpleSubj('hsc-bn-2', 'বাংলা ২য় পত্র', 'Bangla 2nd Paper', '✍️', '#059669', [
    {
      id: 'h-bn2-c1',
      nameBn: 'বাংলা উচ্চারণ, বানান রীতি, উপসর্গ, সমাস ও বাক্যতত্ত্ব',
      formulas: [
        'অ-ধ্বনির সংবৃত উচ্চারণ: শব্দের আদিতে অ-এর পরে ই/ঈ/উ/ঊ থাকলে অ-এর উচ্চারণ ও-কারের মতো হয় (অতি -> ওতি)',
        'বাংলা উপসর্গ: ২১টি (অ, অঘা, অজ, অনা, আ, আড়, আন, আব, ইতি, ঊন, কদ, কু, নি, পাতি, বি, ভর, রাম, স, সা, সু, হা)',
        'তৎসম উপসর্গ: ২০টি (প্র, পরা, অপ, সম, নি, অব, অনু, নির, দুর, বি, অধি, সু, উৎ, পরি, প্রতি, অভি, অতি, অপি, উপ, আ)',
      ],
      mcqs: [
        { id: 'bn2-1', q: "'সিংহাসন' কোন সমাসের উদাহরণ?", opts: ['দ্বন্দ্ব সমাস', 'মধ্যপদলোপী কর্মধারয়', 'বহুব্রীহি সমাস', 'তৎপুরুষ সমাস'], ans: 1, exp: 'সিংহ চিহ্নিত আসন = সিংহাসন (মধ্যপদলোপী কর্মধারয় সমাস)।' },
      ],
    },
  ]),
  makeSimpleSubj('hsc-en-1', 'English 1st Paper', 'English 1st Paper', '🌐', '#2563EB', [
    {
      id: 'h-en1-c1',
      nameBn: 'Seen Comprehension, Flow Chart & Summary Writing',
      formulas: [
        'Flow Chart Rule: Start each box with a Capital letter using Infinitive (To + V1), Gerund (V1+ing), or Noun Phrase.',
      ],
      mcqs: [
        { id: 'en1-1', q: 'What does the word "emancipation" mean in Mandela’s speech?', opts: ['Enslavement', 'Liberation / Freedom', 'Restriction', 'Confinement'], ans: 1, exp: 'Emancipation means freeing someone from political or legal restrictions.' },
      ],
    },
  ]),
  makeSimpleSubj('hsc-en-2', 'English 2nd Paper', 'English 2nd Paper', '🔤', '#2563EB', [
    {
      id: 'h-en2-c1',
      nameBn: 'Right Form of Verbs, Prepositions, Modifiers, Connectors & Narration',
      formulas: [
        '3rd Conditional: If + Past Perfect (had + V3) -> would/could/might + have + V3',
        '2nd Conditional: If + Past Indefinite (V2/were) -> would/could/might + V1',
        'Lest Rule: Clause + lest + Subject + should/might + V1',
        'Subjunctive Rule: It is high time / It is time + Subject + Past Indefinite (V2)',
      ],
      mcqs: [
        { id: 'en2-1', q: 'It is high time we ___ our bad habits.', opts: ['change', 'changed', 'have changed', 'changing'], ans: 1, exp: 'After "It is high time + subject", the past subjunctive (V2) is used.' },
      ],
    },
  ]),
  makeSimpleSubj('hsc-ict', 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', 'ICT (Single Paper)', '💻', '#4F46E5', [
    {
      id: 'h-ict-c1',
      nameBn: '১ম ও ২য় অধ্যায়: বিশ্ব ও বাংলাদেশ প্রেক্ষিত এবং নেটওয়ার্কিং',
      formulas: [
        'ন্যানোটেকনোলজি স্কেল: 1 nm = 10⁻⁹ m (1 থেকে 100 nm)',
        'টপোলজি সংযোগ সংখ্যা: Mesh সংযোগ = n(n - 1) / 2',
        'অপটিক্যাল ফাইবার: পূর্ণ অভ্যন্তরীণ প্রতিফলন নীতিতে আলোর গতিতে ডেটা স্থানান্তর',
      ],
      mcqs: [
        { id: 'ict-1', q: 'অপটিক্যাল ফাইবার ক্যাবল আলোর কোন ধর্মের ওপর ভিত্তি করে ডেটা স্থানান্তর করে?', opts: ['প্রতিফলন', 'প্রতিসরণ', 'পূর্ণ অভ্যন্তরীণ প্রতিফলন', 'ব্যতিচার'], ans: 2, exp: 'অপটিক্যাল ফাইবারে আলোর পূর্ণ অভ্যন্তরীণ প্রতিফলন ব্যবহৃত হয়।' },
      ],
    },
    {
      id: 'h-ict-c3',
      nameBn: '৩য়, ৪র্থ ও ৫ম অধ্যায়: সংখ্যা পদ্ধতি, ডিজিটাল ডিভাইস, HTML ও C প্রোগ্রামিং',
      formulas: [
        "De Morgan’s Law: (A + B)' = A' · B' এবং (A · B)' = A' + B'",
        'Half Adder: Sum S = A ⊕ B, Carry C = A · B',
        'লিপ ইয়ার শর্ত (C): (year % 400 == 0) || (year % 4 == 0 && year % 100 != 0)',
      ],
      mcqs: [
        { id: 'ict-2', q: 'সার্বজনীন গেট (Universal Gate) কোনগুলো?', opts: ['AND ও OR', 'NAND ও NOR', 'XOR ও XNOR', 'NOT ও AND'], ans: 1, exp: 'NAND এবং NOR গেট দিয়ে যেকোনো গেট বাস্তবায়ন করা যায় বলে এদের সার্বজনীন গেট বলে।' },
      ],
    },
  ]),
];

const BUILTIN_SYLLABUS: Record<string, Record<string, SubjectData[]>> = {
  HSC: {
    'Business Studies': [
      ACCOUNTING_2ND_PAPER_SUBJECT,
      makeSimpleSubj('hsc-acc-1', 'হিসাববিজ্ঞান ১ম পত্র', 'Accounting 1st Paper', '📒', '#D97706', [
        {
          id: 'acc1-c1',
          nameBn: '১ম, ২য়, ৩য় ও ৪র্থ অধ্যায়: হিসাব সমীকরণ, দুতরফা দাখিলা, ব্যাংক সমন্বয় ও রেওয়ামিল',
          formulas: [
            'মৌলিক হিসাব সমীকরণ: A = L + OE',
            'বর্ধিত হিসাব সমীকরণ: A = L + (C + R - E - D)',
            'সরলরৈখিক বার্ষিক অবচয় = (সম্পত্তির মোট মূল্য - ভগ্নাবশেষ মূল্য) / আনুমানিক আয়ুষ্কাল',
            'ক্রমহ্রাসমান জের পদ্ধতিতে অবচয়ের হার = সরলরৈখিক হার × ২',
          ],
          mcqs: [
            { id: 'acc1-q1', q: 'হিসাব সমীকরণের বর্ধিত রূপ কোনটি?', opts: ['A = L + OE', 'A = L + C + R - E - D', 'A + L = C + R', 'OE = A + L'], ans: 1, exp: 'বর্ধিত হিসাব সমীকরণ হলো A = L + C + R - E - D।' },
          ],
        },
      ]),
      makeSimpleSubj('hsc-bom-1', 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র', 'Business Org. & Management 1st Paper', '🏢', '#D97706', [
        {
          id: 'bom1-c1',
          nameBn: 'ব্যবসায়ের মৌলিক ধারণা, একমালিকানা, অংশীদারি, যৌথমূলধনী ও সমবায় সমিতি',
          formulas: [
            'ব্যবসায় সমীকরণ: ΣB = ΣI + ΣT + ΣAT (শিল্প + বাণিজ্য + প্রত্যক্ষ সেবা)',
            'অংশীদারি আইন ১৯৩২: সাধারণ অংশীদারি ব্যবসায় সদস্য ২–২০ জন, ব্যাংকিংয়ে ২–১০ জন',
            'সমবায় সমিতি আইন ২০০১: প্রাথমিক সমবায় সমিতির সর্বনিম্ন সদস্য ২০ জন; ভোটাধিকার: এক ব্যক্তি এক ভোট',
          ],
          mcqs: [
            { id: 'bom1-q1', q: 'সমবায় সমিতির একজন সদস্য সর্বোচ্চ শতকরা কত ভাগ শেয়ার ক্রয় করতে পারেন?', opts: ['১০%', '১৫%', '২০%', '২৫%'], ans: 2, exp: '২০০১ সালের সমবায় আইন অনুযায়ী একজন সদস্য সর্বোচ্চ ২০% বা ১/৫ অংশ শেয়ার ক্রয় করতে পারেন।' },
          ],
        },
      ]),
      makeSimpleSubj('hsc-bom-2', 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র', 'Business Org. & Management 2nd Paper', '📋', '#D97706', [
        {
          id: 'bom2-c1',
          nameBn: 'ব্যবস্থাপনার ধারণা, নীতি, পরিকল্পনা, সংগঠন, নেতৃত্ব, প্রেষণা ও নিয়ন্ত্রণ',
          formulas: [
            'আধুনিক ব্যবস্থাপনার জনক: হেনরি ফেয়ল (১৪টি নীতি)',
            'বৈজ্ঞানিক ব্যবস্থাপনার জনক: এফ. ডব্লিউ. টেইলর',
            'ব্যবস্থাপনার কার্যাবলি (POSDCORB): Planning, Organizing, Staffing, Directing, Coordinating, Reporting, Budgeting',
          ],
          mcqs: [
            { id: 'bom2-q1', q: 'আধুনিক ব্যবস্থাপনার জনক কে?', opts: ['এফ. ডব্লিউ. টেইলর', 'হেনরি ফেয়ল', 'পিটার ড্রাকার', 'এলটন মেয়ো'], ans: 1, exp: 'ফরাসি শিল্পপতি হেনরি ফেয়লকে আধুনিক ব্যবস্থাপনার জনক বলা হয়।' },
          ],
        },
      ]),
      makeSimpleSubj('hsc-fin-1', 'ফিন্যান্স, ব্যাংকিং ও বিমা ১ম পত্র', 'Finance, Banking & Insurance 1st Paper', '💰', '#D97706', [
        {
          id: 'fin1-c1',
          nameBn: 'অর্থের সময়মূল্য, দীর্ঘমেয়াদি অর্থায়ন, মূলধন ব্যয় ও মূলধন বাজেটিং',
          formulas: [
            'ভবিষ্যৎ মূল্য: FV = PV (1 + i)ⁿ এবং বর্তমান মূল্য: PV = FV / (1 + i)ⁿ',
            'কার্যকরী সুদের হার (EAR) = (1 + i/m)^m - 1',
            'Rule of 72 (বিনিয়োগ দ্বিগুণ হওয়ার সময়): n = 72 / সুদের হার (%)',
            'করের পর ঋণ মূলধন ব্যয়: Kd = Ki (1 - t)',
            'CAPM মডেল: Ke = Rf + β (Rm - Rf)',
          ],
          mcqs: [
            { id: 'fin1-q1', q: '৭২ বিধি অনুযায়ী বার্ষিক ১২% চক্রবৃদ্ধি সুদে ১০,০০০ টাকা কত বছরে দ্বিগুণ হবে?', opts: ['৫ বছর', '৬ বছর', '৮ বছর', '১০ বছর'], ans: 1, exp: 'সময় n = ৭২ / ১২ = ৬ বছর।' },
          ],
        },
      ]),
      makeSimpleSubj('hsc-fin-2', 'ফিন্যান্স, ব্যাংকিং ও বিমা ২য় পত্র', 'Finance, Banking & Insurance 2nd Paper', '🏦', '#D97706', [
        {
          id: 'fin2-c1',
          nameBn: 'ব্যাংক ব্যবস্থার প্রাথমিক ধারণা, কেন্দ্রীয় ব্যাংক ও বিমা',
          formulas: [
            'বাংলাদেশ ব্যাংক আদেশ: ১৯৭২ সালের রাষ্ট্রপতির ১২৭ নং আদেশ',
            'বিমা চুক্তির অপরিহার্য উপাদান: চূড়ান্ত সদ্বিশ্বাস (Utmost Good Faith) ও বিমাযোগ্য স্বার্থ',
          ],
          mcqs: [
            { id: 'fin2-q1', q: 'কোন বিমা চুক্তিকে ক্ষতিপূরণের চুক্তি বলা হয় না?', opts: ['নৌ বিমা', 'অগ্নি বিমা', 'জীবন বিমা', 'দুর্ঘটনা বিমা'], ans: 2, exp: 'মানুষের জীবন অর্থের মাপকাঠিতে পরিমাপযোগ্য নয় বলে জীবন বিমা ক্ষতিপূরণের চুক্তি নয়।' },
          ],
        },
      ]),
      makeSimpleSubj('hsc-pmm-1', 'উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম পত্র', 'Production Mgt. & Marketing 1st Paper', '🏭', '#D97706', [
        {
          id: 'pmm1-c1',
          nameBn: 'উৎপাদন, উৎপাদনশীলতা ও উপযোগ',
          formulas: [
            'মোট উৎপাদনশীলতা = মোট উৎপাদনের মূল্য / মোট উপাদানের মূল্য',
            'শ্রম উৎপাদনশীলতা = মোট উৎপাদন একক / মোট শ্রম ঘণ্টা',
          ],
        },
      ]),
      makeSimpleSubj('hsc-pmm-2', 'উৎপাদন ব্যবস্থাপনা ও বিপণন ২য় পত্র', 'Production Mgt. & Marketing 2nd Paper', '🛒', '#D97706', [
        {
          id: 'pmm2-c1',
          nameBn: 'বিপণন পরিচিতি, বিপণন পরিবেশ ও বিপণন মিশ্রণ (4Ps)',
          formulas: [
            'বিপণন মিশ্রণ (4Ps — E. Jerome McCarthy): Product (পণ্য), Price (মূল্য), Place (স্থান/বণ্টন), Promotion (প্রসার)',
          ],
        },
      ]),
      ...HSC_COMMON_SUBJECTS,
    ],
    Science: [
      makeSimpleSubj('hsc-phy-1', 'পদার্থবিজ্ঞান ১ম পত্র', 'Physics 1st Paper', '⚛️', '#4F46E5', [
        {
          id: 'phy1-c1',
          nameBn: 'ভেক্টর, নিউটনীয় বলবিদ্যা, কাজ-শক্তি-ক্ষমতা, মহাকর্ষ ও পর্যায়বৃত্ত গতি',
          formulas: [
            'ভেক্টর লব্ধির মান: R = √(P² + Q² + 2PQ cosα)',
            'কেন্দ্রমুখী বল: Fc = mv² / r = mω²r এবং ব্যাংকিং কোণ: tanθ = v² / rg',
            'মুক্তিবেগ: ve = √(2gR) ≈ 11.2 km/s',
            'সরল দোলকের দোলনকাল: T = 2π √(L / g)',
          ],
        },
      ]),
      makeSimpleSubj('hsc-phy-2', 'পদার্থবিজ্ঞান ২য় পত্র', 'Physics 2nd Paper', '⚡', '#4F46E5', [
        {
          id: 'phy2-c1',
          nameBn: 'তাপগতিবিদ্যা, স্থির তড়িৎ, চল তড়িৎ ও আধুনিক পদার্থবিজ্ঞান',
          formulas: [
            'কার্নো ইঞ্জিনের কর্মদক্ষতা: η = (1 - T₂ / T₁) × 100%',
            'ধারকের সঞ্চিত শক্তি: U = ½ CV² এবং জুলের তাপীয় ক্রিয়া: H = I²Rt',
            'আইনস্টাইনের ভর-শক্তি সমীকরণ: E = mc²',
          ],
        },
      ]),
      makeSimpleSubj('hsc-chem-1', 'রসায়ন ১ম পত্র', 'Chemistry 1st Paper', '🧪', '#0D9488', [
        {
          id: 'chem1-c1',
          nameBn: 'গুণগত রসায়ন, পর্যায়বৃত্ত ধর্ম ও রাসায়নিক পরিবর্তন',
          formulas: [
            'বোর কক্ষপথের কৌণিক ভরবেগ: mvr = nh / 2π',
            'সাম্যধ্রুবক সম্পর্ক: Kp = Kc (RT)^Δn',
            'হেন্ডারসন-হ্যাসেলবালখ সমীকরণ: pH = pKa + log([লবণ] / [অম্ল])',
          ],
        },
      ]),
      makeSimpleSubj('hsc-chem-2', 'রসায়ন ২য় পত্র', 'Chemistry 2nd Paper', '⚗️', '#0D9488', [
        {
          id: 'chem2-c1',
          nameBn: 'পরিবেশ রসায়ন, জৈব রসায়ন, পরিমাণগত রসায়ন ও তড়িৎ রসায়ন',
          formulas: [
            'সমন্বয় সূত্র: P₁V₁ / T₁ = P₂V₂ / T₂ এবং আদর্শ গ্যাস সমীকরণ: PV = nRT',
            'মোলারিটি: S = (w × 1000) / (M × V_mL)',
            'ফ্যারাডের ১ম সূত্র: W = ZIt = (M · I · t) / (n · 96500)',
          ],
        },
      ]),
      makeSimpleSubj('hsc-math-1', 'উচ্চতর গণিত ১ম পত্র', 'Higher Math 1st Paper', '📐', '#E11D48', [
        {
          id: 'math1-c1',
          nameBn: 'ম্যাট্রিক্স ও নির্ণায়ক, সরলরেখা, বৃত্ত, অন্তরীকরণ ও যোগজীকরণ',
          formulas: [
            'বিন্দু হতে রেখার লম্ব দূরত্ব: d = |ax₁ + by₁ + c| / √(a² + b²)',
            'lim(x→0) (sin x / x) = 1, d/dx (xⁿ) = n xⁿ⁻¹ এবং ∫ xⁿ dx = xⁿ⁺¹ / (n + 1) + c',
          ],
        },
      ]),
      makeSimpleSubj('hsc-math-2', 'উচ্চতর গণিত ২য় পত্র', 'Higher Math 2nd Paper', '♾️', '#E11D48', [
        {
          id: 'math2-c1',
          nameBn: 'জটিল সংখ্যা, বহুপদী, কণিক, স্থিতিবিদ্যা ও সমতলে বস্তুকণার গতি',
          formulas: [
            'এককের ঘনমূল ω এর ধর্ম: 1 + ω + ω² = 0 এবং ω³ = 1',
            'প্রাসের সর্বাধিক উচ্চতা: H = (u² sin²α) / 2g এবং অনুভূমিক পাল্লা: R = (u² sin 2α) / g',
          ],
        },
      ]),
      makeSimpleSubj('hsc-bio-1', 'জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)', 'Biology 1st Paper', '🌿', '#059669', [
        {
          id: 'bio1-c1',
          nameBn: 'কোষ ও এর গঠন, কোষ বিভাজন ও উদ্ভিদ শারীরতত্ত্ব',
          formulas: [
            'শ্বসনিক হার (RQ) = নির্গত CO₂ এর আয়তন / গৃহীত O₂ এর আয়তন (গ্লুকোজের RQ = 1)',
          ],
        },
      ]),
      makeSimpleSubj('hsc-bio-2', 'জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)', 'Biology 2nd Paper', '🧬', '#059669', [
        {
          id: 'bio2-c1',
          nameBn: 'প্রাণীর শ্রেণিবিন্যাস, মানব শারীরতত্ত্ব ও জিনতত্ত্ব',
          formulas: [
            'BMI (Body Mass Index) = ওজন (kg) / [উচ্চতা (m)]² (স্বাভাবিক: 18.5 – 24.9)',
            'মেন্ডেলের ১ম সূত্রের অনুপাত = 3 : 1 এবং ২য় সূত্রের অনুপাত = 9 : 3 : 3 : 1',
          ],
        },
      ]),
      ...HSC_COMMON_SUBJECTS,
    ],
    Humanities: [
      makeSimpleSubj('hsc-eco-1', 'অর্থনীতি ১ম পত্র', 'Economics 1st Paper', '📈', '#4F46E5', [
        {
          id: 'eco1-c1',
          nameBn: 'ভোক্তা ও উৎপাদকের আচরণ (চাহিদা ও যোগান) ও জাতীয় আয়',
          formulas: [
            'চাহিদা সমীকরণ: Qd = a - bP এবং যোগান সমীকরণ: Qs = c + dP',
            'চাহিদার দাম স্থিতিস্থাপকতা: Ed = (ΔQ / ΔP) × (P / Q)',
            'জাতীয় আয়: GDP = C + I + G + (X - M)',
          ],
        },
      ]),
      makeSimpleSubj('hsc-eco-2', 'অর্থনীতি ২য় পত্র', 'Economics 2nd Paper', '🌍', '#4F46E5', [
        {
          id: 'eco2-c1',
          nameBn: 'বাংলাদেশের অর্থনীতি, জনসংখ্যা ও মুদ্রাস্ফীতি',
          formulas: [
            'জনসংখ্যার ঘনত্ব = মোট জনসংখ্যা / মোট ভূমির পরিমাণ',
            'মুদ্রাস্ফীতির হার = [(চলতি বছরের দাম সূচক - ভিত্তি বছরের দাম সূচক) / ভিত্তি বছরের দাম সূচক] × ১০০',
          ],
        },
      ]),
      makeSimpleSubj('hsc-civ-1', 'পৌরনীতি ও সুশাসন ১ম পত্র', 'Civics 1st Paper', '⚖️', '#4F46E5', [
        { id: 'civ1-c1', nameBn: 'পৌরনীতি ও সুশাসন পরিচিতি, রাষ্ট্র, সংবিধান ও নাগরিক অধিকার', formulas: ['Civics শব্দটি এসেছে ল্যাটিন শব্দ Civis ও Civitas থেকে।'] },
      ]),
      makeSimpleSubj('hsc-civ-2', 'পৌরনীতি ও সুশাসন ২য় পত্র', 'Civics 2nd Paper', '🏛️', '#4F46E5', [
        { id: 'civ2-c1', nameBn: 'ব্রিটিশ ভারত ও বাংলাদেশের সংবিধান', formulas: ['বাংলাদেশের সংবিধান গৃহীত হয়: ৪ নভেম্বর ১৯৭২; কার্যকর হয়: ১৬ ডিসেম্বর ১৯৭২'] },
      ]),
      makeSimpleSubj('hsc-his-1', 'ইতিহাস ১ম পত্র', 'History 1st Paper', '🏺', '#4F46E5', [
        { id: 'his1-c1', nameBn: 'ভারতবর্ষে ইউরোপীয়দের আগমন হতে ১৯৭১-এর মহান মুক্তিযুদ্ধ', formulas: ['১৭৫৭: পলাশীর যুদ্ধ | ১৯৫২: ভাষা আন্দোলন | ১৯৬৬: ছয় দফা | ১৯৭১: মহান মুক্তিযুদ্ধ'] },
      ]),
      makeSimpleSubj('hsc-his-2', 'ইতিহাস ২য় পত্র', 'History 2nd Paper', '📜', '#4F46E5', [
        { id: 'his2-c1', nameBn: 'শিল্প বিপ্লব, ফরাসি বিপ্লব, বিশ্বযুদ্ধ ও জাতিসংঘ', formulas: ['ফরাসি বিপ্লব: ১৪ জুলাই ১৭৮৯ | জাতিসংঘ প্রতিষ্ঠা: ২৪ অক্টোবর ১৯৪৫'] },
      ]),
      ...HSC_COMMON_SUBJECTS,
    ],
  },
  SSC: {
    Science: [
      makeSimpleSubj('ssc-phy', 'পদার্থবিজ্ঞান (SSC)', 'Physics (SSC)', '⚛️', '#4F46E5', [
        { id: 's-phy-c1', nameBn: 'গতি, বল, কাজ-ক্ষমতা-শক্তি, আলো ও চল তড়িৎ', formulas: ['গতির সমীকরণ: v = u + at, s = ut + ½at², v² = u² + 2as', 'দর্পণ ও লেন্সের সমীকরণ: 1/u + 1/v = 1/f'] },
      ]),
      makeSimpleSubj('ssc-chem', 'রসায়ন (SSC)', 'Chemistry (SSC)', '🧪', '#0D9488', [
        { id: 's-chem-c1', nameBn: 'পদার্থের গঠন, পর্যায় সারণি, রাসায়নিক বন্ধন ও মোলের ধারণা', formulas: ['মোল সংখ্যা n = w / M = V(L) / 22.4 = N / (6.023 × 10²³)'] },
      ]),
      makeSimpleSubj('ssc-math', 'সাধারণ গণিত (SSC)', 'General Math (SSC)', '📏', '#E11D48', [
        { id: 's-math-c1', nameBn: 'বীজগণিত, ত্রিকোণমিতি, পরিমিতি ও জ্যামিতি', formulas: ['(a + b)² = a² + 2ab + b²', 'sin²θ + cos²θ = 1', 'সমান্তর ধারার সমষ্টি Sn = (n/2) [2a + (n - 1)d]'] },
      ]),
      makeSimpleSubj('ssc-bio', 'জীববিজ্ঞান (SSC)', 'Biology (SSC)', '🌿', '#059669', [
        { id: 's-bio-c1', nameBn: 'জীবন পাঠ, কোষ ও টিস্যু, জীবনীশক্তি, খাদ্য ও পরিপাক', formulas: ['সালোকসংশ্লেষণ: 6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O'] },
      ]),
    ],
    'Business Studies': [
      makeSimpleSubj('ssc-acc', 'হিসাববিজ্ঞান (SSC)', 'Accounting (SSC)', '📊', '#D97706', [
        { id: 's-acc-c1', nameBn: 'লেনদেন, দুতরফা দাখিলা, জাবেদা, খতিয়ান, রেওয়ামিল ও আর্থিক বিবরণী', formulas: ['সম্পদ (A) = দায় (L) + মালিকানাস্বত্ব (OE)'] },
      ]),
      makeSimpleSubj('ssc-fin', 'ফিন্যান্স ও ব্যাংকিং (SSC)', 'Finance & Banking (SSC)', '🏦', '#D97706', [
        { id: 's-fin-c1', nameBn: 'অর্থায়ন, অর্থের সময়মূল্য, মূলধন বাজেটিং ও ব্যাংকিং', formulas: ['ভবিষ্যৎ মূল্য FV = PV (1 + i)ⁿ'] },
      ]),
      makeSimpleSubj('ssc-ent', 'ব্যবসায় উদ্যোগ (SSC)', 'Business Entrepreneurship (SSC)', '💼', '#D97706', [
        { id: 's-ent-c1', nameBn: 'ব্যবসায় পরিচিতি, আত্মকর্মসংস্থান, আইনগত দিক ও বিপণন', formulas: ['অংশীদারি আইন ১৯৩২, কোম্পানি আইন ১৯৯৪'] },
      ]),
    ],
    Humanities: [
      makeSimpleSubj('ssc-his', 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা (SSC)', 'History (SSC)', '🏺', '#4F46E5', [
        { id: 's-his-c1', nameBn: 'প্রাচীন বাংলার জনপদ, মধ্যযুগ, ব্রিটিশ শাসন, ভাষা আন্দোলন ও মুক্তিযুদ্ধ', formulas: ['প্রাচীন জনপদ: পুণ্ড্র, বঙ্গ, সমতট, হরিকেল, গৌড়'] },
      ]),
      makeSimpleSubj('ssc-geo', 'ভূগোল ও পরিবেশ (SSC)', 'Geography (SSC)', '🌍', '#4F46E5', [
        { id: 's-geo-c1', nameBn: 'মহাবিশ্ব ও আমাদের পৃথিবী, বায়ুমণ্ডল ও বারিমণ্ডল', formulas: ['১ ডিগ্রি দ্রাঘিমার পার্থক্যে সময়ের পার্থক্য ৪ মিনিট'] },
      ]),
      makeSimpleSubj('ssc-civ', 'পৌরনীতি ও নাগরিকতা (SSC)', 'Civics (SSC)', '⚖️', '#4F46E5', [
        { id: 's-civ-c1', nameBn: 'নাগরিক ও নাগরিকতা, আইন, স্বাধীনতা ও সাম্য, রাষ্ট্র ও সরকার', formulas: ['রাষ্ট্রের ৪টি উপাদান: নির্দিষ্ট ভূখণ্ড, জনসমষ্টি, সরকার এবং সার্বভৌমত্ব'] },
      ]),
    ],
  },
};

export function getAvailableClasses(): string[] {
  return ['HSC', 'SSC'];
}

export function getAvailableGroups(selectedClass: string): string[] {
  const cls = BUILTIN_SYLLABUS[selectedClass] || BUILTIN_SYLLABUS.HSC;
  return Object.keys(cls);
}

export function getSubjectsForSelection(selectedClass: string, selectedGroup: string): SubjectData[] {
  const clsMap = BUILTIN_SYLLABUS[selectedClass] || BUILTIN_SYLLABUS.HSC;
  const baseList = clsMap[selectedGroup] || clsMap['Business Studies'] || clsMap.Science || [];
  const customMap = storeState?.customSyllabus?.[selectedClass]?.[selectedGroup] || {};
  const result = baseList.map((subj) => {
    if (customMap[subj.id]) {
      return customMap[subj.id];
    }
    return subj;
  });
  Object.keys(customMap).forEach((k) => {
    if (!result.some((s) => s.id === k)) {
      result.push(customMap[k]);
    }
  });
  return result;
}

/* =====================================================================
   SUPABASE AUTH ADAPTER
   ===================================================================== */
export async function signInOrSignUpUser(params: {
  mode: 'signin' | 'signup';
  name: string;
  email: string;
  password: string;
}): Promise<{ id: string; name: string; email: string }> {
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
      return {
        id: data?.user?.id || `local-${Date.now()}`,
        name: params.name || data?.user?.user_metadata?.full_name || params.email.split('@')[0],
        email: params.email,
      };
    } else {
      const { data, error } = await client.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });
      if (!error && data?.user) {
        return {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || params.email.split('@')[0],
          email: params.email,
        };
      }
    }
  }

  return {
    id: `local-${Date.now()}`,
    name: params.name || params.email.split('@')[0],
    email: params.email,
  };
}

/* =====================================================================
   COMPLETE BILINGUAL UI DICTIONARY (English & বাংলা)
   ===================================================================== */
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
    return text.bn && text.en && text.bn !== text.en
      ? `${text.bn} • ${text.en}`
      : text.bn || text.en;
  }
  return text.en || text.bn;
}

/* =====================================================================
   STORE STATE & ACTIONS
   ===================================================================== */
export interface ExamStoreState {
  userId: string | null;
  userName: string;
  userEmail: string;
  userAvatar: string;
  isAuthenticated: boolean;

  language: LanguageMode;
  darkMode: boolean;
  selectedClass: string;
  selectedGroup: string;
  activeTab: NavTabId;

  xp: number;
  streak: number;
  lastActiveDate: string;
  examHistory: ExamHistoryItem[];
  mistakes: MistakeItem[];
  flashcards: FlashcardItem[];
  studyTasks: StudyTask[];
  communityPosts: CommunityPost[];
  bookmarks: string[];
  chapterMastery: Record<string, number>;
  friendsList: string[];

  isAdminUnlocked: boolean;
  adminPin: string;
  customSyllabus: Record<string, Record<string, Record<string, SubjectData>>>;
  questionReports: QuestionReportItem[];

  isAuthModalOpen: boolean;
  isSettingsModalOpen: boolean;
  activeQuiz: ActiveQuizConfig | null;

  setLanguage: (lang: LanguageMode) => void;
  toggleDarkMode: () => void;
  setClassAndGroup: (cls: string, grp: string) => void;
  setActiveTab: (tab: NavTabId) => void;
  setAuthModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setUserProfile: (profile: {
    id?: string | null;
    name?: string;
    email?: string;
    avatar?: string;
    isAuthenticated?: boolean;
  }) => void;
  startQuiz: (config: ActiveQuizConfig) => void;
  closeQuiz: () => void;
  recordExamResult: (result: Omit<ExamHistoryItem, 'id' | 'date'>, newMistakes: MistakeItem[]) => void;
  markMistakeMastered: (id: string) => void;
  addFlashcard: (frontBn: string, backBn: string, subjectId?: string) => void;
  deleteFlashcard: (id: string) => void;
  addStudyTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
  toggleStudyTask: (id: string) => void;
  deleteStudyTask: (id: string) => void;
  addCommunityPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'solved' | 'replies'>) => void;
  addCommunityReply: (postId: string, authorName: string, text: string) => void;
  togglePostLike: (postId: string) => void;
  addFriendByCode: (friendName: string) => void;
  getRankInfo: () => RankProgressInfo;
  resetAllDemoAndProgress: () => void;

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
    optionsBn: [string, string, string, string] | string[];
    ansIndex: number;
    boardTag?: string;
    explanationBn?: string;
  }) => void;
  updateCustomMcqAnswer: (
    targetClass: string,
    targetGroup: string,
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
    targetClass: string,
    targetGroup: string,
    subjectId: string,
    chapterId: string,
    questionId: string
  ) => void;
  deleteCustomSubject: (targetClass: string, targetGroup: string, subjectId: string) => void;
  submitQuestionReport: (report: Omit<QuestionReportItem, 'id' | 'createdAt' | 'status'>) => void;
  resolveQuestionReport: (id: string) => void;
  deleteQuestionReport: (id: string) => void;
  exportProjectSyllabusCode: () => string;
}

const STORAGE_KEY = 'examverse_production_v9';
const listeners = new Set<() => void>();

function loadPersisted(): Partial<ExamStoreState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed?.state || parsed || {};
  } catch {
    return {};
  }
}

function savePersisted(state: ExamStoreState) {
  if (typeof window === 'undefined') return;
  try {
    const subset = {
      userId: state.userId,
      userName: state.userName,
      userEmail: state.userEmail,
      userAvatar: state.userAvatar,
      isAuthenticated: state.isAuthenticated,
      language: state.language,
      darkMode: state.darkMode,
      selectedClass: state.selectedClass,
      selectedGroup: state.selectedGroup,
      xp: state.xp,
      streak: state.streak,
      lastActiveDate: state.lastActiveDate,
      examHistory: state.examHistory,
      mistakes: state.mistakes,
      flashcards: state.flashcards,
      studyTasks: state.studyTasks,
      communityPosts: state.communityPosts,
      bookmarks: state.bookmarks,
      chapterMastery: state.chapterMastery,
      friendsList: state.friendsList,
      adminPin: state.adminPin,
      customSyllabus: state.customSyllabus,
      questionReports: state.questionReports,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subset));
  } catch {
    // Ignore storage quota errors
  }
}

const saved = loadPersisted();

let storeState: ExamStoreState = {
  userId: saved.userId ?? null,
  userName: saved.userName ?? 'শিক্ষার্থী',
  userEmail: saved.userEmail ?? '',
  userAvatar: saved.userAvatar ?? '🎓',
  isAuthenticated: saved.isAuthenticated ?? false,

  language: saved.language ?? 'bn',
  darkMode: saved.darkMode ?? false,
  selectedClass: saved.selectedClass ?? 'HSC',
  selectedGroup: saved.selectedGroup ?? 'Business Studies',
  activeTab: 'dashboard',

  xp: saved.xp ?? 0,
  streak: saved.streak ?? 1,
  lastActiveDate: saved.lastActiveDate ?? new Date().toISOString().slice(0, 10),
  examHistory: saved.examHistory ?? [],
  mistakes: saved.mistakes ?? [],
  flashcards: saved.flashcards ?? [],
  studyTasks: saved.studyTasks ?? [],
  communityPosts: saved.communityPosts ?? [],
  bookmarks: saved.bookmarks ?? [],
  chapterMastery: saved.chapterMastery ?? {},
  friendsList: saved.friendsList ?? [],

  isAdminUnlocked: false,
  adminPin: saved.adminPin ?? 'admin2026',
  customSyllabus: saved.customSyllabus ?? {},
  questionReports: saved.questionReports ?? [],

  isAuthModalOpen: false,
  isSettingsModalOpen: false,
  activeQuiz: null,

  setLanguage: (language) => setState({ language }),
  toggleDarkMode: () => {
    const next = !storeState.darkMode;
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
    }
    setState({ darkMode: next });
  },
  setClassAndGroup: (selectedClass, selectedGroup) => setState({ selectedClass, selectedGroup }),
  setActiveTab: (activeTab) => setState({ activeTab }),
  setAuthModalOpen: (isAuthModalOpen) => setState({ isAuthModalOpen }),
  setSettingsModalOpen: (isSettingsModalOpen) => setState({ isSettingsModalOpen }),
  setUserProfile: (profile) =>
    setState({
      userId: profile.id !== undefined ? profile.id : storeState.userId,
      userName: profile.name ?? storeState.userName,
      userEmail: profile.email ?? storeState.userEmail,
      userAvatar: profile.avatar ?? storeState.userAvatar,
      isAuthenticated: profile.isAuthenticated ?? storeState.isAuthenticated,
    }),

  startQuiz: (activeQuiz) => setState({ activeQuiz }),
  closeQuiz: () => setState({ activeQuiz: null }),

  recordExamResult: (result, newMistakes) => {
    const today = new Date().toISOString().slice(0, 10);
    const streakIncrement = storeState.lastActiveDate !== today ? 1 : 0;
    const item: ExamHistoryItem = {
      ...result,
      id: `exam-${Date.now()}`,
      date: new Date().toISOString(),
    };
    const updatedMastery = { ...storeState.chapterMastery };
    if (result.chapterId) {
      const prev = updatedMastery[result.chapterId] || 0;
      updatedMastery[result.chapterId] = Math.max(prev, result.accuracy);
    }
    setState({
      xp: storeState.xp + (result.xpEarned || 0),
      streak: storeState.streak + streakIncrement,
      lastActiveDate: today,
      examHistory: [item, ...storeState.examHistory],
      mistakes: [...(newMistakes || []), ...storeState.mistakes],
      chapterMastery: updatedMastery,
    });
  },

  markMistakeMastered: (id) =>
    setState({
      mistakes: storeState.mistakes.map((m) => (m.id === id ? { ...m, mastered: true } : m)),
    }),

  addFlashcard: (frontBn, backBn, subjectId = 'general') =>
    setState({
      flashcards: [
        {
          id: `fc-${Date.now()}`,
          subjectId,
          front: { en: frontBn, bn: frontBn },
          back: { en: backBn, bn: backBn },
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

  addCommunityPost: (post) =>
    setState({
      communityPosts: [
        {
          ...post,
          id: `post-${Date.now()}`,
          createdAt: 'এইমাত্র',
          likes: 0,
          solved: false,
          replies: [],
        },
        ...storeState.communityPosts,
      ],
    }),

  addCommunityReply: (postId, authorName, text) =>
    setState({
      communityPosts: storeState.communityPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              solved: true,
              replies: [
                ...p.replies,
                { id: `rep-${Date.now()}`, authorName, text, createdAt: 'এইমাত্র' },
              ],
            }
          : p
      ),
    }),

  togglePostLike: (postId) =>
    setState({
      communityPosts: storeState.communityPosts.map((p) =>
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ),
    }),

  addFriendByCode: (friendName) =>
    setState({
      friendsList: storeState.friendsList.includes(friendName)
        ? storeState.friendsList
        : [...storeState.friendsList, friendName],
    }),

  getRankInfo: () => {
    const avgAcc =
      storeState.examHistory.length > 0
        ? storeState.examHistory.reduce((acc, e) => acc + e.accuracy, 0) /
          storeState.examHistory.length
        : 0;
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

  resetAllDemoAndProgress: () =>
    setState({
      xp: 0,
      streak: 1,
      examHistory: [],
      mistakes: [],
      flashcards: [],
      studyTasks: [],
      communityPosts: [],
      bookmarks: [],
      chapterMastery: {},
      friendsList: [],
    }),

  unlockAdmin: (pin) => {
    if (pin === storeState.adminPin || pin === 'admin2026') {
      setState({ isAdminUnlocked: true });
      return true;
    }
    return false;
  },

  lockAdmin: () => setState({ isAdminUnlocked: false }),
  setAdminPin: (adminPin) => setState({ adminPin }),

  importBulkMcqs: ({ targetClass, targetGroup, subjectId, subjectNameBn, subjectNameEn, rawText }) => {
    const currentList = getSubjectsForSelection(targetClass, targetGroup);
    const existing = currentList.find((s) => s.id === subjectId);
    const subjClone: SubjectData = existing
      ? JSON.parse(JSON.stringify(existing))
      : {
          id: subjectId,
          name: { en: subjectNameEn, bn: subjectNameBn },
          icon: '📚',
          color: '#D97706',
          chapters: [],
        };

    let addedQuestions = 0;
    let addedChapters = 0;

    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    lines.forEach((line, idx) => {
      const cols = line.includes('\t') ? line.split('\t') : line.split(',');
      if (cols.length < 6) return;
      const chapName = cols[0].trim() || 'অধ্যায় ১';
      const qText = cols[1].trim();
      if (!qText || qText === 'প্রশ্ন' || qText.toLowerCase() === 'question') return;
      const optA = (cols[2] || '').trim();
      const optB = (cols[3] || '').trim();
      const optC = (cols[4] || '').trim();
      const optD = (cols[5] || '').trim();
      const ansRaw = (cols[6] || 'ক').trim();
      const boardTag = (cols[7] || 'NCTB').trim();

      const ansMap: Record<string, number> = { ক: 0, খ: 1, গ: 2, ঘ: 3, A: 0, B: 1, C: 2, D: 3, a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
      const ansIdx = ansMap[ansRaw] ?? 0;

      let ch = subjClone.chapters.find((c) => c.name.bn.includes(chapName) || c.name.en.includes(chapName));
      if (!ch) {
        ch = {
          id: `${subjectId}-ch-${subjClone.chapters.length + 1}-${Date.now()}`,
          name: { en: chapName, bn: chapName },
          mcqs: [],
          cqs: [],
          formulas: [],
        };
        subjClone.chapters.push(ch);
        addedChapters++;
      }

      ch.mcqs.push({
        id: `${subjectId}-q-${Date.now()}-${idx}`,
        q: { en: qText, bn: qText },
        options: { en: [optA, optB, optC, optD], bn: [optA, optB, optC, optD] },
        ans: ansIdx,
        explanation: { en: 'Verified board answer.', bn: 'বোর্ড স্ট্যান্ডার্ড সমাধান।' },
        boardTag,
      });
      addedQuestions++;
    });

    const nextCustom = { ...storeState.customSyllabus };
    if (!nextCustom[targetClass]) nextCustom[targetClass] = {};
    if (!nextCustom[targetClass][targetGroup]) nextCustom[targetClass][targetGroup] = {};
    nextCustom[targetClass][targetGroup] = {
      ...nextCustom[targetClass][targetGroup],
      [subjectId]: subjClone,
    };
    setState({ customSyllabus: nextCustom });
    return { addedQuestions, addedChapters };
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
    const currentList = getSubjectsForSelection(targetClass, targetGroup);
    const existing = currentList.find((s) => s.id === subjectId);
    const subjClone: SubjectData = existing
      ? JSON.parse(JSON.stringify(existing))
      : {
          id: subjectId,
          name: { en: subjectNameEn, bn: subjectNameBn },
          icon: '📚',
          color: '#4F46E5',
          chapters: [],
        };

    let ch = subjClone.chapters.find((c) => c.name.bn === chapterNameBn);
    if (!ch) {
      ch = {
        id: `${subjectId}-ch-${subjClone.chapters.length + 1}-${Date.now()}`,
        name: { en: chapterNameBn, bn: chapterNameBn },
        mcqs: [],
        cqs: [],
        formulas: [],
      };
      subjClone.chapters.push(ch);
    }

    ch.mcqs.push({
      id: `${subjectId}-q-${Date.now()}`,
      q: { en: questionBn, bn: questionBn },
      options: { en: [...optionsBn], bn: [...optionsBn] },
      ans: ansIndex,
      explanation: { en: explanationBn || '', bn: explanationBn || 'সঠিক উত্তর যাচাইকৃত।' },
      boardTag: boardTag || 'NCTB',
    });

    const nextCustom = { ...storeState.customSyllabus };
    if (!nextCustom[targetClass]) nextCustom[targetClass] = {};
    if (!nextCustom[targetClass][targetGroup]) nextCustom[targetClass][targetGroup] = {};
    nextCustom[targetClass][targetGroup] = {
      ...nextCustom[targetClass][targetGroup],
      [subjectId]: subjClone,
    };
    setState({ customSyllabus: nextCustom });
  },

  updateCustomMcqAnswer: (targetClass, targetGroup, subjectId, chapterId, questionId, newAnsIndex) => {
    const currentList = getSubjectsForSelection(targetClass, targetGroup);
    const existing = currentList.find((s) => s.id === subjectId);
    if (!existing) return;
    const subjClone: SubjectData = JSON.parse(JSON.stringify(existing));
    subjClone.chapters = subjClone.chapters.map((ch) =>
      ch.id !== chapterId
        ? ch
        : {
            ...ch,
            mcqs: ch.mcqs.map((q) => (q.id === questionId ? { ...q, ans: newAnsIndex } : q)),
          }
    );
    const nextCustom = { ...storeState.customSyllabus };
    if (!nextCustom[targetClass]) nextCustom[targetClass] = {};
    if (!nextCustom[targetClass][targetGroup]) nextCustom[targetClass][targetGroup] = {};
    nextCustom[targetClass][targetGroup] = {
      ...nextCustom[targetClass][targetGroup],
      [subjectId]: subjClone,
    };
    setState({ customSyllabus: nextCustom });
  },

  editCustomMcqFull: ({ targetClass, targetGroup, subjectId, chapterId, questionId, questionBn, optionsBn, ansIndex }) => {
    const currentList = getSubjectsForSelection(targetClass, targetGroup);
    const existing = currentList.find((s) => s.id === subjectId);
    if (!existing) return;
    const subjClone: SubjectData = JSON.parse(JSON.stringify(existing));
    subjClone.chapters = subjClone.chapters.map((ch) =>
      ch.id !== chapterId
        ? ch
        : {
            ...ch,
            mcqs: ch.mcqs.map((q) =>
              q.id === questionId
                ? {
                    ...q,
                    q: { en: questionBn, bn: questionBn },
                    options: { en: [...optionsBn], bn: [...optionsBn] },
                    ans: ansIndex,
                  }
                : q
            ),
          }
    );
    const nextCustom = { ...storeState.customSyllabus };
    if (!nextCustom[targetClass]) nextCustom[targetClass] = {};
    if (!nextCustom[targetClass][targetGroup]) nextCustom[targetClass][targetGroup] = {};
    nextCustom[targetClass][targetGroup] = {
      ...nextCustom[targetClass][targetGroup],
      [subjectId]: subjClone,
    };
    setState({ customSyllabus: nextCustom });
  },

  deleteCustomMcq: (targetClass, targetGroup, subjectId, chapterId, questionId) => {
    const currentList = getSubjectsForSelection(targetClass, targetGroup);
    const existing = currentList.find((s) => s.id === subjectId);
    if (!existing) return;
    const subjClone: SubjectData = JSON.parse(JSON.stringify(existing));
    subjClone.chapters = subjClone.chapters.map((ch) =>
      ch.id !== chapterId ? ch : { ...ch, mcqs: ch.mcqs.filter((q) => q.id !== questionId) }
    );
    const nextCustom = { ...storeState.customSyllabus };
    if (!nextCustom[targetClass]) nextCustom[targetClass] = {};
    if (!nextCustom[targetClass][targetGroup]) nextCustom[targetClass][targetGroup] = {};
    nextCustom[targetClass][targetGroup] = {
      ...nextCustom[targetClass][targetGroup],
      [subjectId]: subjClone,
    };
    setState({ customSyllabus: nextCustom });
  },

  deleteCustomSubject: (targetClass, targetGroup, subjectId) => {
    const nextCustom = { ...storeState.customSyllabus };
    if (nextCustom[targetClass]?.[targetGroup]?.[subjectId]) {
      const grpCopy = { ...nextCustom[targetClass][targetGroup] };
      delete grpCopy[subjectId];
      nextCustom[targetClass] = { ...nextCustom[targetClass], [targetGroup]: grpCopy };
      setState({ customSyllabus: nextCustom });
    }
  },

  submitQuestionReport: (report) => {
    const item: QuestionReportItem = {
      ...report,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('bn-BD'),
      status: 'pending',
    };
    setState({ questionReports: [item, ...storeState.questionReports] });
  },

  resolveQuestionReport: (id) =>
    setState({
      questionReports: storeState.questionReports.map((r) =>
        r.id === id ? { ...r, status: 'resolved' } : r
      ),
    }),

  deleteQuestionReport: (id) =>
    setState({
      questionReports: storeState.questionReports.filter((r) => r.id !== id),
    }),

  exportProjectSyllabusCode: () => {
    const acc2 = getSubjectsForSelection('HSC', 'Business Studies').find((s) => s.id === 'hsc-acc-2');
    return JSON.stringify(acc2 || HSC_ACCOUNTING_2ND_PAPER_CHAPTERS, null, 2);
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
