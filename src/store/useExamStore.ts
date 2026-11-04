import React, { useSyncExternalStore } from 'react';
import * as RawSyllabus from '../data/syllabusData';
import * as RawSupabase from '../lib/supabase';
import {
  ActiveQuizConfig,
  ChapterData,
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

export interface CustomScopedSubject {
  key: string; // e.g. "HSC__Business Studies__accounting-2nd-paper"
  targetClass: string; // Strict Class lock e.g. "HSC"
  targetGroup: string; // Strict Group lock e.g. "Business Studies"
  paper: string; // e.g. "2nd Paper"
  subject: SubjectData;
}

/* =====================================================================
   REQUIRED BY src/lib/supabase.ts
   ===================================================================== */
export function getLevelProgress(xp: number): {
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, Number(xp) || 0);
  const level = Math.floor(safeXp / 250) + 1;
  const xpForNextLevel = level * 250;
  const currentLevelBase = (level - 1) * 250;
  const progressPercent = Math.min(100, Math.round(((safeXp - currentLevelBase) / 250) * 100));
  return { level, currentXp: safeXp, xpForNextLevel, progressPercent };
}

/* =====================================================================
   MULTI-FACTOR RANK PROGRESSION ENGINE (Bronze -> Silver -> Gold -> Platinum -> Elite)
   ===================================================================== */
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
    current.id === 'elite' && rankScore >= 1000 ? 100 : Math.min(99, Math.round((within / span) * 100));

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
   PRE-LOADED HSC -> BUSINESS STUDIES -> ACCOUNTING 2ND PAPER (10 CHAPTERS)
   ===================================================================== */
type CompactMcqTuple = [string, string, [string, string, string, string], number, string];

const HSC_ACC_2ND_PAPER_CHAPTERS: {
  id: string;
  titleEn: string;
  titleBn: string;
  questions: CompactMcqTuple[];
}[] = [
  {
    id: 'hsc-acc2-ch1',
    titleEn: 'Ch 1: Accounts of Non-Trading Concerns (2nd Paper)',
    titleBn: 'অধ্যায় ১: অব্যবসায়ী প্রতিষ্ঠানের হিসাব (২য় পত্র)',
    questions: [
      ['ACC2-001', 'অব্যবসায়ী প্রতিষ্ঠানসমূহের আয়ের প্রধান উৎস কোনটি?', ['পণ্য বিক্রয়', 'সেবা প্রদান', 'চাঁদা', 'অনুদান'], 2, "য. বো. '১৯; রা. বো. '১৭; ঢা. বো. '১৬"],
      ['ACC2-002', 'অব্যবসায়ী প্রতিষ্ঠানের প্রধান উদ্দেশ্য কোনটি?', ['মুনাফা অর্জনের উদ্দেশ্যে পণ্য ক্রয়-বিক্রয় করা', 'মুনাফা অর্জনের উদ্দেশ্যে পণ্য উৎপাদন ও বণ্টন করা', 'সদস্যদের সেবা ও জনকল্যাণমূলক কাজ', 'শেয়ার ও ঋণপত্র ক্রয়-বিক্রয় করা'], 2, "দি. বো. '১৭, '১৫; চ. বো. '১৬"],
      ['ACC2-003', 'অব্যবসায়ী প্রতিষ্ঠানের আয়ের অন্যতম উৎস কোনটি?', ['অনুদান', 'ভর্তি ফি', 'লকার ভাড়া', 'ম্যাগাজিন বিক্রয়'], 1, "রা. বো. '১৯"],
      ['ACC2-004', 'অব্যবসায়ী প্রতিষ্ঠানের আয়ের উৎস হচ্ছে—\ni. আজীবন সদস্যের চাঁদা\nii. সরকারি অনুদান\niii. সদস্যদের চাঁদা', ['i ও ii', 'i ও iii', 'ii ও iii', 'i, ii ও iii'], 3, "রা. বো. '১৫"],
      ['ACC2-005', 'প্রাপ্তি ও প্রদান হিসাবের উদ্বৃত্তকে কী বলা হয়?', ['আয়', 'খরচ', 'দায়', 'সম্পদ'], 3, "সকল বোর্ড '১৮; য. বো. '১৬"],
      ['ACC2-006', 'চলতি বছরের বকেয়া বেতন ৫,০০০ টাকা এবং বিগত বছরের বকেয়া বেতন ২,৫০০ টাকা সমন্বয়সাধনের পর আয়-ব্যয় হিসাবে বেতন বাবদ ব্যয় ১৮,০০০ টাকা দেখানো হয়। প্রাপ্তি ও প্রদান হিসাবে প্রদত্ত বেতন কত টাকা ছিল?', ['১২,৫০০ টাকা', '১৩,০০০ টাকা', '১৫,৫০০ টাকা', '২০,৫০০ টাকা'], 2, 'বোর্ড স্ট্যান্ডার্ড'],
      ['ACC2-007', 'নিচের কোনটি মূলধনজাতীয় প্রাপ্তি ও প্রদান?', ['দায় ও ব্যয়', 'দায় ও সম্পদ', 'আয় ও সম্পদ', 'আয় এবং ব্যয়'], 1, "য. বো. '১৯"],
      ['ACC2-008', 'অব্যবসায়ী প্রতিষ্ঠানের নগদ অবস্থা জানা যায় কোন হিসাবের মাধ্যমে?', ['আয়-ব্যয় হিসাব', 'প্রাপ্তি ও প্রদান হিসাব', 'মূলধন হিসাব', 'উদ্বৃত্তপত্র'], 1, "য. বো. '১৭"],
      ['ACC2-009', 'প্রাপ্তি ও প্রদান হিসাবের ডেবিট উদ্বৃত্ত দ্বারা কী বোঝায়?', ['ব্যয়াতিরিক্ত আয়', 'আয়াতিরিক্ত ব্যয়', 'হাতে নগদ ও ব্যাংকে জমার উদ্বৃত্ত', 'ব্যাংক জমাতিরিক্ত'], 2, "ঢা. বো. '১৬, '১৫; য. বো. '১৫"],
      ['ACC2-010', 'নিচের কোনটি মুনাফাজাতীয় ব্যয়?', ['আসবাবপত্র আনয়ন', 'আসবাবপত্র ক্রয়', 'আসবাবপত্র মেরামত ব্যয়', 'ক্লাবের জন্য টিভি ক্রয়'], 2, "ঢা. বো. '১৬; সি. বো. '১৫"],
      ['ACC2-012', 'নয় মাসের অফিস ভাড়া প্রদত্ত হয়েছে ২৯,২৫০ টাকা। এক বৎসরে বকেয়া ভাড়ার পরিমাণ কত?', ['৮,৪৫০ টাকা', '৯,৫৫০ টাকা', '৯,৭৫০ টাকা', '১০,২৫০ টাকা'], 2, "রা. বো. '১৭"],
      ['ACC2-013', 'পরবর্তী বছরের চাঁদা চলতি বছর পাওয়া গেলে অব্যবসায়ী প্রতিষ্ঠানের কাছে কী হিসাবে বিবেচিত হয়?', ['আয়', 'ব্যয়', 'সম্পদ', 'দায়'], 3, "য. বো. '১৭"],
      ['ACC2-015', 'একতা ক্লাবের প্রাপ্তি ও প্রদান হিসাবে ভাড়া প্রদান ৬৪,০০০ টাকা, এর মধ্যে পরবর্তী বছরের ভাড়া ৪,০০০ টাকা। বছর শেষে মোট ভাড়ার ১/৫ অংশ বকেয়া রয়েছে। সংশ্লিষ্ট বছরে মোট ভাড়ার পরিমাণ কত?', ['৬০,০০০ টাকা', '৬৮,০০০ টাকা', '৭৫,০০০ টাকা', '৭৬,৮০০ টাকা'], 2, 'বোর্ড স্ট্যান্ডার্ড'],
      ['ACC2-020', 'অব্যবসায়ী প্রতিষ্ঠানের মূলধনজাতীয় ব্যয় কোনটি?', ['সচিবের বেতন', 'মনিহারি ক্রয়', 'বিদ্যুৎ খরচ', 'খেলাধুলার সরঞ্জাম ক্রয়'], 3, "ঢা. বো. '১৫"],
      ['ACC2-024', 'মূলধন তহবিল বলতে কী বোঝায়?', ['সম্পত্তি ও দায় হিসাব', 'নগদ প্রাপ্তি ও প্রদানের পার্থক্য', 'আয় ও ব্যয়ের হিসাব', 'সম্পত্তি ও দায়ের পার্থক্য'], 3, 'বোর্ড স্ট্যান্ডার্ড'],
    ],
  },
  {
    id: 'hsc-acc2-ch2',
    titleEn: 'Ch 2: Partnership Business Accounts (2nd Paper)',
    titleBn: 'অধ্যায় ২: অংশীদারি ব্যবসায়ের হিসাব (২য় পত্র)',
    questions: [
      ['ACC2-029', 'কমিশন ধার্য করার পরে একটি অংশীদারি কারবারের নিট মুনাফা হয় ৩৫,০০০ টাকা। একজন অংশীদার কমিশন বাবদ পায় ৭০০ টাকা। উক্ত অংশীদারের কমিশনের হার কত ছিল?', ['২%', '৩%', '৪%', '৫%'], 0, "ঢা. বো. '২৪"],
      ['ACC2-030', 'সাধারণ অংশীদারি ব্যবসায় সর্বোচ্চ সদস্য সংখ্যা কত?', ['১০ জন', '২০ জন', '২৫ জন', '৩০ জন'], 1, "ঢা. বো. '২৪, '২৩; দি. বো. '২৪"],
      ['ACC2-031', 'অংশীদারি ব্যবসায়ের মূলভিত্তি কী?', ['চলতি মূলধন', 'নিবন্ধন', 'ঋণ', 'চুক্তি'], 3, "ঢা. বো. '২১; কু. বো. '২৪; চ. বো. '২৫"],
      ['ACC2-032', 'ব্যাংকিং অংশীদারি ব্যবসায়ের সর্বোচ্চ সদস্যসংখ্যা কত?', ['২ জন', '৭ জন', '১০ জন', '২০ জন'], 2, "ঢা. বো. '১৭; য. বো. '২৫"],
      ['ACC2-033', 'অংশীদারি ব্যবসায়ের সর্বনিম্ন সদস্যসংখ্যা কত?', ['৪ জন', '৩ জন', '২ জন', '১ জন'], 2, "চ. বো. '২৩; দি. বো. '১৯"],
      ['ACC2-035', 'চুক্তির অবর্তমানে অংশীদার কর্তৃক প্রদত্ত ঋণের সুদের হার কত?', ['৬%', '৮%', '১০%', '১২%'], 0, "ঢা. বো. '২৩; য. বো. '২৪; দি. বো. '২৫"],
      ['ACC2-036', 'অংশীদারি কারবারে অংশীদারদের দায়-দেনা কীরূপ?', ['সসীম', 'অসীম', 'লাভ-ক্ষতির অংশ দ্বারা সীমাবদ্ধ', 'মূলধনের পরিমাণ দ্বারা সীমাবদ্ধ'], 1, "রা. বো. '২২; ম. বো. '২৪"],
      ['ACC2-037', 'অংশীদারি ব্যবসায় কত সালের আইন অনুযায়ী পরিচালিত হয়?', ['১৮৮১', '১৯১৩', '১৯৩২', '১৯৯৪'], 2, "কু. বো. '২৪"],
      ['ACC2-046', 'অংশীদারগণ প্রতি মাসের শুরুতে নির্দিষ্ট পরিমাণ অর্থ উত্তোলন করলে উত্তোলনের ওপর গড়ে কত মাসের সুদ ধরতে হবে?', ['৫.৫ মাসের', '৬ মাসের', '৬.৫ মাসের', '১২ মাসের'], 2, "ম. বো. '২১; কু. বো. '১৯"],
      ['ACC2-048', 'অংশীদারগণ যদি প্রতিমাসের শেষ তারিখে উত্তোলন করে তবে গড়ে কত সময়ের সুদ ধরতে হয়?', ['৬.৫ মাসের', '৫.৫ মাসের', '২.৫ মাসের', '১.৫ মাসের'], 1, "সি. বো. '১৬; য. বো. '১৫"],
      ['ACC2-050', 'নগদ উত্তোলনের তারিখ উল্লেখ না থাকলে গড়ে কত মাসের সুদ ধরা হয়?', ['তিন মাসের', 'ছয় মাসের', 'নয় মাসের', 'বারো মাসের'], 1, "ব. বো. '২১"],
      ['ACC2-058', 'চুক্তির অবর্তমানে অংশীদারি কারবারে অংশীদারদের মুনাফা বণ্টন করা হয়—', ['মূলধন অনুপাতে', 'সমান অনুপাতে', 'পরিশ্রমের অনুপাতে', 'অংশীদারদের ইচ্ছা অনুযায়ী'], 1, "কু. বো. '২২; ব. বো. '২৩"],
    ],
  },
  {
    id: 'hsc-acc2-ch3',
    titleEn: 'Ch 3: Cash Flow Statement (2nd Paper)',
    titleBn: 'অধ্যায় ৩: নগদ প্রবাহ বিবরণী (২য় পত্র)',
    questions: [
      ['ACC2-062', 'নিচের কোনটি অ-নগদ (Non-cash) লেনদেন?', ['অধিহারে শেয়ার ইস্যু', 'অবহারে শেয়ার ইস্যু', 'বন্ড ইস্যু', 'বন্ডকে শেয়ারে রূপান্তর'], 3, "ঢা. বো. '১৯"],
      ['ACC2-065', 'পরোক্ষ পদ্ধতিতে নিট আয় ১,৩২,০০০ টাকা, প্রদেয় হিসাব বৃদ্ধি ১০,০০০ টাকা, মজুদ পণ্য হ্রাস ৭,০০০ টাকা এবং প্রাপ্য হিসাব বৃদ্ধি ১০,০০০ টাকা হলে পরিচালন কার্যক্রম হতে নিট নগদ প্রবাহ কত?', ['১,০৪,০০০ টাকা', '১,১২,০০০ টাকা', '১,২৫,০০০ টাকা', '১,৩৯,০০০ টাকা'], 3, "সকল বোর্ড '১৮"],
      ['ACC2-070', 'আন্তর্জাতিক হিসাব মান-৭ (IAS-7) অনুযায়ী কোন বিবরণী প্রস্তুত করা হয়?', ['আয় বিবরণী', 'সংরক্ষিত আয় বিবরণী', 'নগদ প্রবাহ বিবরণী', 'উদ্বৃত্তপত্র'], 2, "কু. বো. '১৬"],
      ['ACC2-073', 'লভ্যাংশ প্রদান, শেয়ার ইস্যু, ঋণপত্র ইস্যু ও ঋণপত্র পরিশোধ ইত্যাদি নগদ প্রবাহ বিবরণীর কোন কার্যাবলিতে অন্তর্ভুক্ত হয়?', ['পরিচালনসংক্রান্ত কার্যক্রম', 'বিনিয়োগসংক্রান্ত কার্যক্রম', 'অর্থায়ন বা আর্থিক কার্যক্রম', 'আয়-ব্যয়সংক্রান্ত কার্যক্রম'], 2, "ঢা. বো. '১৫"],
      ['ACC2-074', 'বিনিয়োগসংক্রান্ত নগদ প্রবাহ কোনটি?', ['শেয়ার ইস্যু', 'চলতি সম্পত্তি হ্রাস', 'স্থায়ী সম্পত্তি ক্রয় ও বিক্রয়', 'চলতি দায় হ্রাস'], 2, "য. বো. '১৫"],
      ['ACC2-076', 'নিচের কোনটি অনগদ লেনদেন?', ['প্রদত্ত বেতন', 'অগ্রিম ভাড়া', 'যন্ত্রপাতি ক্রয়', 'যন্ত্রপাতির অবচয়'], 3, "সি. বো. '১৯; ব. বো. '১৯"],
      ['ACC2-084', 'অর্থায়নসংক্রান্ত কার্যক্রমের নগদ প্রবাহের উদাহরণ কোনটি?', ['খরিদ্দার থেকে প্রাপ্তি', 'নগদে লভ্যাংশ প্রদান', 'যন্ত্রপাতি ক্রয়', 'অবচয় খরচ'], 1, "সকল বোর্ড '১৮"],
    ],
  },
  {
    id: 'hsc-acc2-ch4',
    titleEn: 'Ch 4: Share Capital of Joint Stock Company (2nd Paper)',
    titleBn: 'অধ্যায় ৪: যৌথমূলধনী কোম্পানির মূলধন (২য় পত্র)',
    questions: [
      ['ACC2-096', 'পাবলিক লিমিটেড কোম্পানির ক্ষেত্রে সর্বনিম্ন সদস্য সংখ্যা কত জন?', ['২ জন', '৫ জন', '৭ জন', '৫০ জন'], 2, "ঢা. বো. '২১; দি. বো. '২৪"],
      ['ACC2-097', 'কোনটিকে কোম্পানির মূল সনদ বা সংবিধান বলা হয়?', ['নিবন্ধনপত্র', 'পরিমেল বন্ধ (স্মারকলিপি)', 'পরিমেল নিয়মাবলি', 'ঘোষণাপত্র'], 1, "চ. বো. '২১; য. বো. '১৬"],
      ['ACC2-098', 'বাংলাদেশে বর্তমানে কত সালের কোম্পানি আইন প্রচলিত?', ['১৯১৩', '১৯৩২', '১৯৯৪', '২০০২'], 2, "রা. বো. '১৯; সি. বো. '২১"],
      ['ACC2-100', 'কোম্পানি জনসাধারণের নিকট প্রথমে যে শেয়ার বিক্রি করে তাকে কী বলে?', ['IPO', 'MPO', 'RPO', 'SEC'], 0, "দি. বো. '২৫"],
      ['ACC2-106', 'IPO-এর পূর্ণরূপ কী?', ['International Public Offering', 'Initial Public Offering', 'Initial Price Offering', 'Internal Price Offering'], 1, "সি. বো. '২৪; চ. বো. '২৪"],
      ['ACC2-107', 'কোম্পানির মূলধনের ক্ষুদ্র ও সমান অংশকে কী বলে?', ['স্টক', 'শেয়ার', 'ঋণপত্র', 'বন্ড'], 1, "য. বো. '২৫; চ. বো. '২৫"],
      ['ACC2-113', 'লভ্যাংশ নগদে না দিয়ে শেয়ার দ্বারা পরিশোধ করা হলে তাকে কোন ধরনের শেয়ার বলে?', ['সাধারণ শেয়ার', 'বোনাস শেয়ার', 'রাইট শেয়ার', 'অগ্রাধিকার শেয়ার'], 1, "য. বো. '১৫; দি. বো. '২৪"],
      ['ACC2-114', 'যখন কোম্পানি নিজের ইস্যুকৃত শেয়ার নিজেই ক্রয় করে তখন তাকে কী বলে?', ['বোনাস শেয়ার', 'অগ্রাধিকারযুক্ত শেয়ার', 'ট্রেজারি শেয়ার', 'সাধারণ শেয়ার'], 2, "য. বো. '২২; কু. বো. '১৭"],
      ['ACC2-117', 'রাইট বা অধিকার শেয়ার (Right Share) কাদের মধ্যে বণ্টন করা হয়?', ['পুরাতন শেয়ারহোল্ডারদের মধ্যে', 'নতুন শেয়ারহোল্ডারদের মধ্যে', 'পরিচালকদের মধ্যে', 'কর্মচারীদের মধ্যে'], 0, "ঢা. বো. '১৫; রা. বো. '২১"],
    ],
  },
  {
    id: 'hsc-acc2-ch5',
    titleEn: 'Ch 5: Financial Statements of Joint Stock Company (2nd Paper)',
    titleBn: 'অধ্যায় ৫: যৌথমূলধনী কোম্পানির আর্থিক বিবরণী (২য় পত্র)',
    questions: [
      ['ACC2-127', 'আন্তর্জাতিক হিসাবমান নং ০১ (IAS-1) অনুযায়ী পূর্ণাঙ্গ আর্থিক বিবরণীর অংশ কয়টি?', ['২টি', '৩টি', '৪টি', '৫টি'], 3, "ঢা. বো. '২৫"],
      ['ACC2-130', 'নিচের কোনটি আর্থিক বিবরণীর অংশ নয়?', ['নগদ প্রবাহ বিবরণী', 'আয় বিবরণী', 'রেওয়ামিল', 'সংরক্ষিত আয় বিবরণী'], 2, "সি. বো. '২১; ব. বো. '১৯"],
      ['ACC2-134', 'অনাদায়ী পাওনা সঞ্চিতি ব্যবসায়ের কী ধরনের হিসাব?', ['আয়', 'ব্যয়', 'বিপরীত সম্পদ (Contra Asset)', 'দায়'], 2, "রা. বো. '২৫"],
      ['ACC2-136', '১৫% ভ্যাটসহ পণ্য ক্রয় ৩৬,৫০০ টাকা এবং ক্রয় ফেরত ২,০০০ টাকা হলে ক্রয় ভ্যাটের পরিমাণ কত টাকা?', ['৪,৫০০ টাকা', '৫,১৭৫ টাকা', '৫,৯৭৫ টাকা', '৫,৭৭৫ টাকা'], 0, "ঢা. বো. '১৬"],
      ['ACC2-140', 'নিচের কোনটি মালিকানাস্বত্বের (Shareholders Equity) অংশ নয়?', ['শেয়ার মূলধন', 'সঞ্চিতি ও উদ্বৃত্ত', 'সংরক্ষিত আয়', 'ঋণপত্র'], 3, "য. বো. '২৩; ঢা. বো. '২১"],
      ['ACC2-143', 'অদাবীকৃত লভ্যাংশ (Unclaimed Dividend) কোম্পানির কী?', ['খরচ', 'সম্পত্তি', 'আয়', 'চলতি দায়'], 3, "ঢা. বো. '২৪; রা. বো. '২৪"],
      ['ACC2-145', 'অনুপার্জিত আয় (Unearned Revenue) কী হিসেবে গণ্য হয়?', ['চলতি দায়', 'আয়', 'সম্পদ', 'মালিকানাস্বত্ব'], 0, "রা. বো. '২৩; য. বো. '২৪"],
      ['ACC2-146', 'সুনাম (Goodwill) কী ধরনের সম্পদ?', ['স্থায়ী দৃশ্যমান সম্পদ', 'বিনিয়োগ', 'চলতি সম্পদ', 'অস্পর্শনীয় স্থায়ী সম্পত্তি'], 3, "য. বো. '২০; কু. বো. '২১"],
      ['ACC2-150', 'নিচের কোনটি কাল্পনিক বা অলীক সম্পদ (Fictitious Asset)?', ['সুনাম', 'শেয়ার অবহার', 'ট্রেডমার্ক', 'কপিরাইট'], 1, "রা. বো. '২৫"],
    ],
  },
  {
    id: 'hsc-acc2-ch6',
    titleEn: 'Ch 6: Financial Statement Analysis (2nd Paper)',
    titleBn: 'অধ্যায় ৬: আর্থিক বিবরণী বিশ্লেষণ (২য় পত্র)',
    questions: [
      ['ACC2-157', 'আর্থিক বিবরণী বিশ্লেষণের উদ্দেশ্য হলো—\ni. ব্যবস্থাপনার দক্ষতা যাচাই\nii. ব্যবসায়ের মুনাফা অর্জন ক্ষমতা যাচাই\niii. ব্যবসায়ের তারল্য ক্ষমতা যাচাই', ['i ও ii', 'i ও iii', 'ii ও iii', 'i, ii ও iii'], 3, 'বোর্ড স্ট্যান্ডার্ড'],
      ['ACC2-168', 'তরল অনুপাতের (Quick / Acid-Test Ratio) আদর্শমান কোনটি?', ['২ : ১', '১ : ১', '০.৫ : ১', '০.২৫ : ১'], 1, "ঢা. বো. '২৫"],
      ['ACC2-171', 'চলতি অনুপাতের (Current Ratio) আদর্শ মান কোনটি?', ['০.২৫ : ১', '০.৫০ : ১', '১ : ১', '২ : ১'], 3, "ঢা. বো. '২৪; য. বো. '২৫; চ. বো. '২৫"],
      ['ACC2-174', 'নিচের কোনটি তরল সম্পত্তির অন্তর্ভুক্ত?', ['হাতে নগদ', 'অগ্রিম বেতন', 'দীর্ঘমেয়াদি বিনিয়োগ', 'মজুদ পণ্য'], 0, "কু. বো. '২১; সি. বো. '২১"],
      ['ACC2-176', 'কোন অনুপাতটি দীর্ঘমেয়াদি সচ্ছলতার নির্দেশক?', ['চলতি অনুপাত', 'দায়-মালিকানা অনুপাত', 'মজুদ আবর্তন অনুপাত', 'নিট মুনাফা অনুপাত'], 1, "ঢা. বো. '২৪; রা. বো. '২৫"],
      ['ACC2-177', 'রতন লিমিটেডের মোট সম্পদ ৪০,০০,০০০ টাকার মধ্যে চলতি সম্পদ ৫,০০,০০০ টাকা। মোট বহির্দায়ের পরিমাণ ২৫,০০,০০০ টাকা হলে মালিকানাস্বত্বের পরিমাণ কত?', ['১০,০০,০০০ টাকা', '১৫,০০,০০০ টাকা', '২০,০০,০০০ টাকা', '৬৫,০০,০০০ টাকা'], 1, "ম. বো. '২৫"],
      ['ACC2-183', 'মজুদ আবর্তন অনুপাত কোন ধরনের অনুপাত?', ['মুনাফা অর্জন ক্ষমতা', 'তারল্য অনুপাত', 'সচ্ছলতার অনুপাত', 'পরিচালন দক্ষতা অনুপাত'], 3, "চ. বো. '২৪; সি. বো. '২১"],
      ['ACC2-184', 'শরীফ লি.-এর প্রারম্ভিক মজুদ ৪,৫০,০০০ টাকা, সমাপনী মজুদ ৩,৫০,০০০ টাকা এবং পণ্য ক্রয় ১১,০০,০০০ টাকা হলে বিক্রীত পণ্যের ব্যয় কত?', ['১৫,৫০,০০০ টাকা', '১৪,৫০,০০০ টাকা', '১৩,৮০,০০০ টাকা', '১২,০০,০০০ টাকা'], 3, "রা. বো. '২১"],
    ],
  },
  {
    id: 'hsc-acc2-ch7',
    titleEn: 'Ch 7: Cost Accounting & Production Cost (2nd Paper)',
    titleBn: 'অধ্যায় ৭: উৎপাদন ব্যয় হিসাব (২য় পত্র)',
    questions: [
      ['ACC2-189', 'উৎপাদন ব্যয় হিসাবের প্রধান উদ্দেশ্য কী?', ['ব্যয় নির্ধারণ ও ব্যয় নিয়ন্ত্রণ', 'উৎপাদন ব্যয় নির্ণয় ও তথ্য সরবরাহ', 'তথ্য সরবরাহ ও মুনাফা বৃদ্ধিকরণ', 'লাভ-ক্ষতি নির্ণয়'], 0, "চ. বো. '২২; দি. বো. '১৯"],
      ['ACC2-191', 'পরোক্ষ কাঁচামাল কোন ধরনের উপরিব্যয়?', ['কারখানা উপরিব্যয়', 'প্রশাসনিক উপরিব্যয়', 'অফিস উপরিব্যয়', 'বিক্রয় উপরিব্যয়'], 0, "ঢা. বো. '২৫"],
      ['ACC2-194', 'নিচের কোনটি বিক্রয় উপরিখরচের অন্তর্ভুক্ত?', ['বিজ্ঞাপন খরচ', 'গ্যাস ও জ্বালানি', 'কারখানা বিমা', 'কারখানা ভাড়া'], 0, "রা. বো. '২৫"],
      ['ACC2-197', '৪০ একক পণ্যের উৎপাদন ব্যয় ৮০০ টাকা। কোম্পানি বিক্রয়মূল্যের ওপর ২০% মুনাফা করে। প্রতি একক পণ্যের বিক্রয়মূল্য কত?', ['৪ টাকা', '২০ টাকা', '২৫ টাকা', '১৬০ টাকা'], 2, "কু. বো. '২৫"],
      ['ACC2-200', 'রূপান্তর ব্যয় (Conversion Cost) সমান কোনটি?', ['প্রত্যক্ষ মাল + প্রত্যক্ষ শ্রম', 'প্রত্যক্ষ শ্রম + কারখানা উপরি খরচ', 'মুখ্য ব্যয় + কারখানা উপরি ব্যয়', 'প্রত্যক্ষ মাল + প্রত্যক্ষ শ্রম + প্রত্যক্ষ খরচ'], 1, "ব. বো. '২৩; দি. বো. '২৩"],
      ['ACC2-201', 'বিক্রয়ের ওপর লাভের হার ২৫% হলে, ক্রয়মূল্যের (উৎপাদন ব্যয়ের) ওপর লাভের হার কত?', ['১৬.৬৭%', '২০%', '২৫%', '৩৩.৩৩%'], 3, "ঢা. বো. '১৬; ব. বো. '২৩"],
      ['ACC2-203', 'প্রারম্ভিক কাঁচামাল ৫,০০০ টাকা, সমাপনী কাঁচামাল ১৩,০০০ টাকা, কাঁচামাল ক্রয় ১৫,০০০ টাকা ও প্রত্যক্ষ মজুরি ৫,০০০ টাকা হলে মুখ্য ব্যয় (Prime Cost) কত টাকা?', ['১০,০০০ টাকা', '১১,০০০ টাকা', '১২,০০০ টাকা', '১৩,০০০ টাকা'], 2, "দি. বো. '২২"],
      ['ACC2-205', 'জীবনযাত্রার ব্যয় বৃদ্ধির ফলে কর্মচারীদের যে বিশেষ ভাতা দেওয়া হয় তাকে কী বলে?', ['বিশেষ সুবিধা', 'ওভারটাইম মজুরি', 'বোনাস', 'মহার্ঘ ভাতা (Dearness Allowance)'], 3, "ঢা. বো. '২৫"],
      ['ACC2-209', 'বাংলাদেশের শ্রম আইন অনুযায়ী একজন শ্রমিকের দৈনিক স্বাভাবিক কর্মঘণ্টা কত?', ['৯ ঘণ্টা', '৮ ঘণ্টা', '৭ ঘণ্টা', '৬ ঘণ্টা'], 1, "য. বো. '২৫; সি. বো. '২৩"],
    ],
  },
  {
    id: 'hsc-acc2-ch8',
    titleEn: 'Ch 8: Accounting for Inventory (2nd Paper)',
    titleBn: 'অধ্যায় ৮: মজুদ পণ্য (২য় পত্র)',
    questions: [
      ['ACC2-218', 'চলতি বছরের সমাপনী মজুদকে পরবর্তী বছরের কী হিসেবে গণ্য করা হয়?', ['ক্রয়কৃত পণ্য', 'বিক্রয়যোগ্য পণ্য', 'সমাপনী মজুদ পণ্য', 'প্রারম্ভিক মজুদ পণ্য'], 3, 'বোর্ড স্ট্যান্ডার্ড'],
      ['ACC2-221', 'মজুদ পণ্য কোন ধরনের সম্পদ?', ['চলতি সম্পদ', 'স্থায়ী সম্পদ', 'অস্পর্শনীয় সম্পদ', 'অলীক সম্পদ'], 0, 'বোর্ড স্ট্যান্ডার্ড'],
      ['ACC2-222', 'কোন নীতি অনুসারে মজুদ পণ্যের মূল্যায়ন (ক্রয়মূল্য বা বাজারমূল্যের মধ্যে যেটি কম) করা হয়?', ['ব্যবসায়িক সত্তা নীতি', 'চলমান প্রতিষ্ঠান নীতি', 'হিসাবকাল ধারণা নীতি', 'রক্ষণশীলতার নীতি'], 3, 'বোর্ড স্ট্যান্ডার্ড'],
      ['ACC2-228', 'হিসাবকাল শেষে ভৌত গণনার মাধ্যমে মজুদ পণ্যের মূল্যায়ন ও হিসাবভুক্ত করা হলে তাকে কী পদ্ধতি বলে?', ['কালান্তিক মজুদ পদ্ধতি (Periodic)', 'অবিরত মজুদ পদ্ধতি (Perpetual)', 'প্রক্রিয়াজাত মজুদ পদ্ধতি', 'সমাপ্ত পণ্যের মজুদ পদ্ধতি'], 0, 'বোর্ড স্ট্যান্ডার্ড'],
      ['ACC2-234', 'FOB-এর পূর্ণরূপ কী?', ['Free on Bill', 'Free of Board', 'Free on Board', 'Free of Bill'], 2, 'বোর্ড স্ট্যান্ডার্ড'],
      ['ACC2-236', 'বিন কার্ডে (Bin Card) নিচের কোনটি লিপিবদ্ধ থাকে না?', ['উদ্বৃত্ত মালের পরিমাণ', 'মালের মূল্য বা দর', 'প্রাপ্ত মালের পরিমাণ', 'ইস্যুকৃত মালের পরিমাণ'], 1, 'বোর্ড স্ট্যান্ডার্ড'],
      ['ACC2-245', 'পচনশীল পণ্যের ক্ষেত্রে কোন পদ্ধতিতে মজুদ মাল মূল্যায়ন ও ইস্যু করা সবচেয়ে যুক্তিযুক্ত?', ['FIFO (আগে আসলে আগে যাবে)', 'ভারযুক্ত গড়', 'LIFO', 'সরল গড়'], 0, 'বোর্ড স্ট্যান্ডার্ড'],
      ['ACC2-252', 'জানুয়ারি ১ তারিখে ২০০ একক পণ্য ২০ টাকা দরে এবং জানুয়ারি ৭ তারিখে ৩০০ একক পণ্য ৩০ টাকা দরে ক্রয় করা হয়। জানুয়ারি ৩১ তারিখে ২৫০ একক পণ্য ইস্যু করলে FIFO পদ্ধতিতে ইস্যুকৃত পণ্যের মূল্য কত?', ['৫,০০০ টাকা', '৫,৫০০ টাকা', '৬,২০০ টাকা', '৭,৫০০ টাকা'], 1, 'বোর্ড স্ট্যান্ডার্ড'],
    ],
  },
  {
    id: 'hsc-acc2-ch9',
    titleEn: 'Ch 9: Cost & Classification of Cost (2nd Paper)',
    titleBn: 'অধ্যায় ৯: ব্যয় ও ব্যয়ের শ্রেণিবিভাগ (২য় পত্র)',
    questions: [
      ['ACC2-256', 'ভবিষ্যৎ সিদ্ধান্ত গ্রহণে কোন ব্যয় কখনোই বিবেচনায় আনা হয় না?', ['প্রত্যক্ষ ব্যয়', 'নিমজ্জিত ব্যয় (Sunk Cost)', 'সুযোগ ব্যয়', 'পার্থক্যমূলক ব্যয়'], 1, "কু. বো. '১৭"],
      ['ACC2-258', 'যে ব্যয় ব্যবস্থাপনার সিদ্ধান্ত গ্রহণে সরাসরি ভূমিকা রাখে তাকে কী বলে?', ['প্রাসঙ্গিক ব্যয় (Relevant Cost)', 'সুযোগ ব্যয়', 'প্রত্যক্ষ ব্যয়', 'প্রতিস্থাপন ব্যয়'], 0, "দি. বো. '১৬"],
      ['ACC2-261', 'ব্যয়ের (Cost) অতিবাহিত বা নিঃশেষিত অংশকে কী বলে?', ['সম্পদ', 'খরচ (Expense)', 'ক্ষতি', 'অবচয়'], 1, "য. বো. '১৯"],
      ['ACC2-263', 'নিচের কোনটি মিশ্র বা আধা-পরিবর্তনশীল ব্যয় (Semi-variable Cost)?', ['কারখানা ভাড়া', 'বৈদ্যুতিক ও টেলিফোন খরচ', 'প্রত্যক্ষ শ্রমিকের মজুরি', 'সরলরৈখিক অবচয়'], 1, "রা. বো. '১৯; কু. বো. '১৬"],
      ['ACC2-266', '"নির্দিষ্ট স্তর পর্যন্ত এককপ্রতি ব্যয় পরিবর্তনশীল কিন্তু মোট ব্যয় স্থির"—উক্তিটি নিচের কোন ব্যয়ের সাথে সম্পৃক্ত?', ['স্থির বা স্থায়ী ব্যয় (Fixed Cost)', 'পরিবর্তনশীল ব্যয়', 'সুযোগ ব্যয়', 'মান ব্যয়'], 0, "ঢা. বো. '১৯"],
      ['ACC2-267', 'যন্ত্রপাতির অবচয় কোন ধরনের ব্যয়?', ['বকেয়া ব্যয়', 'নগদ ব্যয়', 'অনগদ ব্যয়', 'প্রত্যক্ষ ব্যয়'], 2, "চ. বো. '১৯"],
      ['ACC2-270', 'উৎপাদন বৃদ্ধির সাথে সাথে কোন ব্যয় মোট পরিমাণে আনুপাতিক হারে বৃদ্ধি পায়?', ['স্থায়ী ব্যয়', 'আধা-পরিবর্তনশীল ব্যয়', 'পরিবর্তনশীল ব্যয় (Variable Cost)', 'পরিচালন ব্যয়'], 2, "ঢা. বো. '১৬, '১৮"],
    ],
  },
  {
    id: 'hsc-acc2-ch10',
    titleEn: 'Ch 10: Management Accounting, Budget & BEP (2nd Paper)',
    titleBn: 'অধ্যায় ১০: ব্যবস্থাপনা হিসাববিজ্ঞান (২য় পত্র)',
    questions: [
      ['ACC2-278', 'ব্যবস্থাপনা হিসাববিজ্ঞানের প্রধান কাজ কোনটি?', ['জাবেদা লিখন', 'খতিয়ান প্রস্তুতকরণ', 'আর্থিক বিবরণীসমূহের নিরীক্ষণ', 'সিদ্ধান্ত গ্রহণে ব্যবস্থাপনাকে তথ্য সরবরাহ'], 3, "ঢা. বো. '১৫; চ. বো. '১৭"],
      ['ACC2-282', "ফরাসি শব্দ 'Bougette' বা 'Budgetee' অর্থ কী?", ['পরিকল্পনা', 'হিসাব', 'চামড়ার ছোট ব্যাগ বা থলে', 'সরকার'], 2, "সকল বোর্ড '১৮"],
      ['ACC2-285', 'সাধারণত নিচের কোন বাজেটটি সর্বপ্রথম তৈরি করতে হয় (সকল বাজেটের ভিত্তি)?', ['উৎপাদন বাজেট', 'বিক্রয় বাজেট (Sales Budget)', 'উৎপাদন ব্যয় বাজেট', 'শ্রম ব্যয় বাজেট'], 1, "ঢা. বো. '১৫; দি. বো. '১৯"],
      ['ACC2-287', 'বিক্রয় - পরিবর্তনশীল ব্যয় = কোনটি?', ['নিরাপত্তা প্রান্ত', 'দত্তাংশ বা কন্ট্রিবিউশন মার্জিন (Contribution Margin)', 'সমচ্ছেদ বিন্দু', 'নিট মুনাফা'], 1, "য. বো. '১৯"],
      ['ACC2-288', 'তাহসিন লি.-এর স্থায়ী খরচ ১,৮০,০০০ টাকা, এককপ্রতি পরিবর্তনশীল ব্যয় ২০ টাকা এবং এককপ্রতি বিক্রয়মূল্য ৫০ টাকা হলে এককপ্রতি দত্তাংশ (CM per unit) কত?', ['২০ টাকা', '৩০ টাকা', '৫০ টাকা', '৭০ টাকা'], 1, "ঢা. বো. '১৭"],
      ['ACC2-289', 'তাহসিন লি.-এর স্থায়ী খরচ ১,৮০,০০০ টাকা, এককপ্রতি পরিবর্তনশীল ব্যয় ২০ টাকা এবং এককপ্রতি বিক্রয়মূল্য ৫০ টাকা হলে সমচ্ছেদ বিক্রয়ের (Break-Even Sales in Tk) পরিমাণ কত?', ['৩,০০,০০০ টাকা', '৪,০০,০০০ টাকা', '৪,৫০,০০০ টাকা', '৫,০০,০০০ টাকা'], 0, "ঢা. বো. '১৭"],
      ['ACC2-291', 'সাকিব ট্রেডার্সের এককপ্রতি পরিবর্তনশীল ব্যয় ৪০ টাকা, স্থায়ী ব্যয় ১,৪০,০০০ টাকা এবং বিক্রয়মূল্য প্রতি একক ৬০ টাকা হলে সমচ্ছেদ বিন্দু (Break-Even Point in Units) কত?', ['১,৪০০ একক', '৩,৫০০ একক', '২,৩৩৩ একক', '৭,০০০ একক'], 3, "চ. বো. '১৯"],
      ['ACC2-298', 'নিচের কোনটি বিবেচনার মাধ্যমে বাজেটিং কার্য শুরু হয়?', ['বিক্রয় পূর্বাভাস (Sales Forecast)', 'পণ্যের মূল্য', 'ব্যবস্থাপনার দক্ষতা', 'মালিকের ইচ্ছা'], 0, "য. বো. '১৭"],
    ],
  },
];

function buildHscAccounting2ndPaperSubject(): SubjectData {
  return {
    id: 'accounting-2nd-paper',
    name: {
      en: 'Accounting — 2nd Paper (HSC Business Studies)',
      bn: 'হিসাববিজ্ঞান — ২য় পত্র (HSC ব্যবসায় শিক্ষা - ১০টি অধ্যায়)',
    },
    icon: '📊',
    color: '#4D7C0F',
    chapters: HSC_ACC_2ND_PAPER_CHAPTERS.map((ch) => ({
      id: ch.id,
      name: { en: ch.titleEn, bn: ch.titleBn },
      mcqs: ch.questions.map(
        ([id, qText, opts, ansIdx, boardTag]): MCQQuestion => ({
          id,
          q: { en: qText, bn: qText },
          options: { en: opts, bn: opts },
          ans: ansIdx,
          explanation: {
            en: `সঠিক উত্তর: (${['ক', 'খ', 'গ', 'ঘ'][ansIdx]}) ${opts[ansIdx]} • উৎস: ${boardTag}`,
            bn: `সঠিক উত্তর: (${['ক', 'খ', 'গ', 'ঘ'][ansIdx]}) ${opts[ansIdx]} • উৎস: ${boardTag}`,
          },
          boardTag,
        })
      ),
      cqs: [],
    })),
  };
}

/* =====================================================================
   SMART CSV / EXCEL TSV PARSER FOR ADMIN BULK IMPORT
   Supports both direct Ctrl+C / Ctrl+V from Excel (Tab-separated) and .csv files!
   ===================================================================== */
function parseDelimitedLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseAnswerIndex(rawOpt: string, rawAnsText: string, opts: string[]): number {
  const clean = String(rawOpt || '').trim().toLowerCase();
  if (clean === 'ক' || clean === 'a' || clean === '0' || clean === '1') {
    return clean === '1' ? 0 : 0;
  }
  if (clean === 'খ' || clean === 'b' || clean === '2') return 1;
  if (clean === 'গ' || clean === 'c' || clean === '3') return 2;
  if (clean === 'ঘ' || clean === 'd' || clean === '4') return 3;

  if (rawAnsText) {
    const matchIdx = opts.findIndex((o) => o.trim() === rawAnsText.trim());
    if (matchIdx !== -1) return matchIdx;
  }
  return 0;
}

/* =====================================================================
   STRICT CLASS + GROUP + SUBJECT + PAPER FILTERING
   ===================================================================== */
const SUBJECT_ICONS: Record<string, string> = {
  physics: '⚛️',
  chemistry: '🧪',
  math: '📐',
  biology: '🧬',
  accounting: '📊',
  'accounting-2nd-paper': '📊',
  management: '🏢',
  finance: '🏦',
  marketing: '📣',
  economics: '📈',
  civics: '⚖️',
  history: '🏛️',
  logic: '🧠',
  sociology: '🌐',
  bangla: 'অ',
  english: '🔤',
  ict: '💻',
  gk: '🌍',
};

export function getAvailableClasses(): string[] {
  return ['HSC', 'SSC', 'University Admission', 'Medical Admission', 'Engineering Admission', 'BCS Preliminary', 'Bank Jobs'];
}

export function getAvailableGroups(selectedClass: string): string[] {
  const cls = selectedClass.toLowerCase();
  if (cls.includes('medical') || cls.includes('engineering')) {
    return ['Science'];
  }
  if (cls.includes('bcs') || cls.includes('bank')) {
    return ['All'];
  }
  return ['Science', 'Business Studies', 'Humanities', 'All'];
}

function mapClassNameToCategoryId(selectedClass: string): string {
  const cls = selectedClass.toLowerCase();
  if (cls.includes('ssc')) return 'ssc';
  if (cls.includes('hsc')) return 'hsc';
  if (cls.includes('medical')) return 'med';
  if (cls.includes('engineering')) return 'eng';
  if (cls.includes('bcs')) return 'bcs';
  if (cls.includes('bank')) return 'bank';
  return 'uni';
}

export function getSubjectsForSelection(selectedClass: string, selectedGroup: string): SubjectData[] {
  const mod = RawSyllabus as any;
  const rawSubjects = Array.isArray(mod?.SUBJECTS) ? mod.SUBJECTS : [];
  const allMcqs = Array.isArray(mod?.QUESTIONS_MCQ) ? mod.QUESTIONS_MCQ : [];
  const allCqs = Array.isArray(mod?.CREATIVE_QUESTIONS) ? mod.CREATIVE_QUESTIONS : [];

  const catId = mapClassNameToCategoryId(selectedClass);
  const isHsc = catId === 'hsc';
  const isSsc = catId === 'ssc';
  const grpNorm = selectedGroup.toLowerCase();
  const isBusinessGroup =
    grpNorm.includes('business') || grpNorm.includes('commerce') || grpNorm === 'all';

  const categories = Array.isArray(mod?.EXAM_CATEGORIES) ? mod.EXAM_CATEGORIES : [];
  const activeCatObj = categories.find((c: any) => c.id === catId);
  const allowedSubjIds: string[] | null = activeCatObj?.subjects || null;

  const filteredSubjects = rawSubjects.filter((s: any) => {
    if (allowedSubjIds && !allowedSubjIds.includes(s.id)) return false;
    if (isSsc && s.id === 'logic') return false;

    if (grpNorm === 'all') return true;
    const sGrp = String(s.group || '').toLowerCase();
    if (sGrp === 'common') return true;
    if (grpNorm.includes('science')) return sGrp === 'science';
    if (grpNorm.includes('business') || grpNorm.includes('commerce')) {
      return sGrp === 'commerce' || sGrp.includes('business');
    }
    if (grpNorm.includes('humanities') || grpNorm.includes('arts')) {
      return sGrp === 'arts' || sGrp.includes('humanities');
    }
    return true;
  });

  const mappedList: SubjectData[] = filteredSubjects.map((rawSubj: any): SubjectData => {
    const subjId = String(rawSubj.id);

    let displayTitleEn = String(rawSubj.name || 'Subject');
    let displayTitleBn = String(rawSubj.nameBn || rawSubj.name || 'বিষয়');
    if (isSsc) {
      displayTitleEn = displayTitleEn.replace('(1st & 2nd Paper)', '(SSC Board)').replace('(1st & 2nd)', '(SSC Board)');
      displayTitleBn = displayTitleBn.replace('(১ম ও ২য় পত্র)', '(এসএসসি বোর্ড)');
    } else if (isHsc && subjId === 'accounting') {
      displayTitleEn = 'Accounting — 1st Paper (HSC Business Studies)';
      displayTitleBn = 'হিসাববিজ্ঞান — ১ম পত্র (HSC ব্যবসায় শিক্ষা)';
    }

    const chapters: ChapterData[] = (rawSubj.chapters || []).map((rawCh: any): ChapterData => {
      const chId = String(rawCh.id);

      const chMcqs: MCQQuestion[] = allMcqs
        .filter(
          (q: any) =>
            q.subjectId === subjId &&
            q.chapterId === chId &&
            (!Array.isArray(q.categories) || q.categories.includes(catId))
        )
        .map((q: any): MCQQuestion => {
          const statementsText =
            Array.isArray(q.statements) && q.statements.length > 0
              ? `\n${q.statements.join('\n')}`
              : '';
          const enQ = (q.question || q.questionBn || '') + statementsText;
          const bnQ = (q.questionBn || q.question || '') + statementsText;
          const opts = Array.isArray(q.options) ? q.options : [];

          return {
            id: String(q.id),
            q: { en: enQ, bn: bnQ },
            options: { en: opts, bn: opts },
            ans: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            explanation: {
              en: q.explanation || '',
              bn: q.explanation || '',
            },
            boardTag: q.examTag,
          };
        });

      const chCqs: CQQuestion[] = allCqs
        .filter((c: any) => c.subjectId === subjId && c.chapterId === chId)
        .map((c: any): CQQuestion => ({
          id: String(c.id),
          stem: { en: c.stemEn || c.stemBn || '', bn: c.stemBn || c.stemEn || '' },
          a: { en: c.parts?.ka?.question || '', bn: c.parts?.ka?.question || '' },
          b: { en: c.parts?.kha?.question || '', bn: c.parts?.kha?.question || '' },
          c: { en: c.parts?.ga?.question || '', bn: c.parts?.ga?.question || '' },
          d: { en: c.parts?.gha?.question || '', bn: c.parts?.gha?.question || '' },
          ansA: { en: c.parts?.ka?.answer || '', bn: c.parts?.ka?.answer || '' },
          ansB: { en: c.parts?.kha?.answer || '', bn: c.parts?.kha?.answer || '' },
          ansC: { en: c.parts?.ga?.answer || '', bn: c.parts?.ga?.answer || '' },
          ansD: { en: c.parts?.gha?.answer || '', bn: c.parts?.gha?.answer || '' },
          boardTag: c.boardTag,
        }));

      return {
        id: chId,
        name: {
          en: isSsc ? String(rawCh.title || '').replace(/\(1st Paper\)|\(2nd Paper\)/g, '').trim() : rawCh.title || 'Chapter',
          bn: isSsc ? String(rawCh.titleBn || '').replace(/\(১ম পত্র\)|\(২য় পত্র\)/g, '').trim() : rawCh.titleBn || 'অধ্যায়',
        },
        mcqs: chMcqs,
        cqs: chCqs,
      };
    });

    return {
      id: subjId,
      name: { en: displayTitleEn, bn: displayTitleBn },
      icon: rawSubj.icon || SUBJECT_ICONS[subjId] || '📘',
      color: rawSubj.color || '#4F46E5',
      chapters,
    };
  });

  // Inject pre-loaded HSC -> Business Studies -> Accounting 2nd Paper ONLY when Class=HSC and Group=Business Studies/All
  if (isHsc && isBusinessGroup) {
    const acc2Subject = buildHscAccounting2ndPaperSubject();
    const acc1Index = mappedList.findIndex((s) => s.id === 'accounting');
    if (acc1Index !== -1) {
      mappedList.splice(acc1Index + 1, 0, acc2Subject);
    } else {
      mappedList.unshift(acc2Subject);
    }
  }

  // Merge any Admin-imported Custom Subjects that strictly match this Class AND Group
  const customList = (storeState?.customSubjects || []).filter((cs) => {
    const clsMatch = cs.targetClass.toLowerCase() === selectedClass.toLowerCase();
    const grpMatch =
      grpNorm === 'all' ||
      cs.targetGroup.toLowerCase() === 'all' ||
      cs.targetGroup.toLowerCase() === grpNorm;
    return clsMatch && grpMatch;
  });

  customList.forEach((cs) => {
    const existingIdx = mappedList.findIndex((m) => m.id === cs.subject.id);
    if (existingIdx !== -1) {
      // Merge chapters into existing subject of the same class+group
      const mergedChapters = [...mappedList[existingIdx].chapters];
      cs.subject.chapters.forEach((newCh) => {
        const chIdx = mergedChapters.findIndex(
          (c) => c.id === newCh.id || c.name.bn === newCh.name.bn
        );
        if (chIdx !== -1) {
          const existingIds = new Set(mergedChapters[chIdx].mcqs.map((q) => q.id));
          const uniqueNew = newCh.mcqs.filter((q) => !existingIds.has(q.id));
          mergedChapters[chIdx] = {
            ...mergedChapters[chIdx],
            mcqs: [...mergedChapters[chIdx].mcqs, ...uniqueNew],
          };
        } else {
          mergedChapters.push(newCh);
        }
      });
      mappedList[existingIdx] = { ...mappedList[existingIdx], chapters: mergedChapters };
    } else {
      mappedList.unshift(cs.subject);
    }
  });

  return mappedList;
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
  nav_admin: { en: 'Admin Panel', bn: 'অ্যাডমিন প্যানেল' },
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
   PURE REACT EXTERNAL STORE WITH ADMIN PANEL & BULK EXCEL IMPORTER
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

  // Admin Panel State
  adminPin: string;
  isAdminUnlocked: boolean;
  customSubjects: CustomScopedSubject[];

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
  addStudyTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
  toggleStudyTask: (id: string) => void;
  deleteStudyTask: (id: string) => void;
  addCommunityPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'solved' | 'replies'>) => void;
  addCommunityReply: (postId: string, authorName: string, text: string) => void;
  togglePostLike: (postId: string) => void;
  addFriendByCode: (friendName: string) => void;
  getRankInfo: () => RankProgressInfo;

  // Admin Actions
  unlockAdmin: (pinInput: string) => boolean;
  lockAdmin: () => void;
  setAdminPin: (newPin: string) => void;
  importBulkMcqs: (params: {
    targetClass: string;
    targetGroup: string;
    paper: string;
    subjectId: string;
    subjectNameBn: string;
    subjectNameEn: string;
    rawText: string;
  }) => { importedCount: number; chaptersCount: number };
  addSingleCustomMcq: (params: {
    targetClass: string;
    targetGroup: string;
    paper: string;
    subjectId: string;
    subjectNameBn: string;
    subjectNameEn: string;
    chapterName: string;
    question: string;
    options: [string, string, string, string];
    ans: number;
    boardTag?: string;
    explanation?: string;
  }) => void;
  updateCustomMcqAnswer: (
    scopedKey: string,
    chapterId: string,
    questionId: string,
    newAnsIndex: number
  ) => void;
  deleteCustomMcq: (scopedKey: string, chapterId: string, questionId: string) => void;
  deleteCustomSubject: (scopedKey: string) => void;
}

const STORAGE_KEY = 'examverse-v3-storage';
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
      customSubjects: state.customSubjects,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subset));
  } catch {
    // Ignore quota errors
  }
}

const saved = loadPersisted();

let storeState: ExamStoreState = {
  userId: saved.userId ?? null,
  userName: saved.userName ?? 'শিক্ষার্থী (Scholar)',
  userEmail: saved.userEmail ?? '',
  userAvatar: saved.userAvatar ?? '🎓',
  isAuthenticated: saved.isAuthenticated ?? false,

  language: saved.language ?? 'bn',
  darkMode: saved.darkMode ?? false,
  selectedClass: saved.selectedClass ?? 'HSC',
  selectedGroup: saved.selectedGroup ?? 'Business Studies',
  activeTab: 'dashboard',

  xp: saved.xp ?? 640,
  streak: saved.streak ?? 5,
  lastActiveDate: saved.lastActiveDate ?? new Date().toISOString().slice(0, 10),
  examHistory: saved.examHistory ?? [
    {
      id: 'demo-1',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      subjectId: 'accounting-2nd-paper',
      subjectName: 'হিসাববিজ্ঞান — ২য় পত্র (HSC)',
      chapterId: 'hsc-acc2-ch1',
      chapterName: 'অধ্যায় ১: অব্যবসায়ী প্রতিষ্ঠানের হিসাব',
      mode: 'mcq',
      score: 18,
      total: 20,
      accuracy: 90,
      timeSpentSec: 410,
      xpEarned: 180,
    },
  ],
  mistakes: saved.mistakes ?? [],
  flashcards: saved.flashcards ?? [
    {
      id: 'fc-1',
      subjectId: 'accounting-2nd-paper',
      front: { en: 'Ideal Current Ratio & Quick Ratio', bn: 'চলতি অনুপাত ও তরল অনুপাতের আদর্শ মান কত?' },
      back: { en: 'Current Ratio = 2 : 1 | Quick Ratio = 1 : 1', bn: 'চলতি অনুপাত = ২ : ১ এবং তরল অনুপাত = ১ : ১' },
      box: 2,
      nextReviewDate: new Date().toISOString().slice(0, 10),
    },
  ],
  studyTasks: saved.studyTasks ?? [
    {
      id: 'st-1',
      title: 'হিসাববিজ্ঞান ২য় পত্র — অব্যবসায়ী প্রতিষ্ঠানের হিসাব অধ্যায়ের বোর্ড MCQ সমাধান',
      subjectName: 'হিসাববিজ্ঞান ২য় পত্র',
      dueDate: new Date().toISOString().slice(0, 10),
      targetMinutes: 35,
      completed: false,
    },
  ],
  communityPosts: saved.communityPosts ?? [
    {
      id: 'cp-1',
      authorName: 'তানভীর আহমেদ',
      authorAvatar: '🧑‍🔬',
      authorRank: 'Gold II',
      subjectName: 'হিসাববিজ্ঞান ২য় পত্র',
      title: 'চুক্তির অবর্তমানে অংশীদার কর্তৃক প্রদত্ত ঋণের সুদের হার কত?',
      body: '১৯৩২ সালের অংশীদারি আইন অনুযায়ী চুক্তিপত্রে উল্লেখ না থাকলে অংশীদারের প্রদত্ত ঋণের ওপর ৬% হারে সুদ প্রাপ্য হয়।',
      createdAt: '২ ঘণ্টা আগে',
      likes: 14,
      solved: true,
      replies: [],
    },
  ],
  bookmarks: saved.bookmarks ?? [],
  chapterMastery: saved.chapterMastery ?? { 'hsc-acc2-ch1': 92, 'phy-1': 90 },
  friendsList: saved.friendsList ?? ['তানভীর আহমেদ', 'নুসরাত জাহান', 'রাফি ইসলাম', 'সাদিয়া করিম'],

  adminPin: saved.adminPin ?? 'admin2026',
  isAdminUnlocked: false,
  customSubjects: saved.customSubjects ?? [],

  isAuthModalOpen: false,
  isSettingsModalOpen: false,
  activeQuiz: null,

  setLanguage: (language) => setState({ language }),
  toggleDarkMode: () => {
    const next = !storeState.darkMode;
    if (typeof document !== 'undefined') {
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
      xp: storeState.xp + result.xpEarned,
      streak: storeState.streak + streakIncrement,
      lastActiveDate: today,
      examHistory: [item, ...storeState.examHistory],
      mistakes: [...newMistakes, ...storeState.mistakes],
      chapterMastery: updatedMastery,
    });
  },

  markMistakeMastered: (id) =>
    setState({
      mistakes: storeState.mistakes.map((m) => (m.id === id ? { ...m, mastered: true } : m)),
    }),

  addStudyTask: (task) =>
    setState({
      studyTasks: [{ ...task, id: `task-${Date.now()}`, completed: false }, ...storeState.studyTasks],
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
        : 78;
    const masteredCount = Object.values(storeState.chapterMastery).filter((v) => v >= 75).length;
    return calculateUserRank({
      xp: storeState.xp,
      accuracyPct: avgAcc,
      masteredChaptersCount: masteredCount,
      totalChaptersCount: 16,
      streakDays: storeState.streak,
      examsCompleted: storeState.examHistory.length,
    });
  },

  /* =====================================================================
     ADMIN PANEL ACTIONS (Unlock, Bulk CSV/Excel Import, Single Add, Edit/Delete)
     ===================================================================== */
  unlockAdmin: (pinInput) => {
    if (pinInput.trim() === storeState.adminPin) {
      setState({ isAdminUnlocked: true });
      return true;
    }
    return false;
  },

  lockAdmin: () => setState({ isAdminUnlocked: false }),

  setAdminPin: (newPin) => {
    if (newPin.trim().length >= 4) {
      setState({ adminPin: newPin.trim() });
    }
  },

  importBulkMcqs: ({
    targetClass,
    targetGroup,
    paper,
    subjectId,
    subjectNameBn,
    subjectNameEn,
    rawText,
  }) => {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return { importedCount: 0, chaptersCount: 0 };

    // Auto-detect delimiter: Tab (Excel direct copy-paste) vs Comma (.csv file)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    const chapterMap = new Map<string, MCQQuestion[]>();
    let importedCount = 0;

    lines.forEach((line, idx) => {
      const cols = parseDelimitedLine(line, delimiter);
      if (cols.length < 6) return;

      // Skip header row
      const c0 = cols[0].toLowerCase();
      if (c0 === 'question_id' || c0 === 'id' || cols[3]?.toLowerCase() === 'question') {
        return;
      }

      // Support both 14-column Excel format (question_id, pdf_q_no, chapter, question, optA, optB, optC, optD, correct_option, correct_answer, exam_board_source)
      // and simple 7-column format (chapter, question, optA, optB, optC, optD, correct_option)
      let qId = `q-${Date.now()}-${idx}`;
      let chapterTitle = 'অধ্যায় ১';
      let questionText = '';
      let optA = '';
      let optB = '';
      let optC = '';
      let optD = '';
      let rawCorrectOpt = '';
      let rawCorrectAns = '';
      let boardSource = '';

      if (cols.length >= 9) {
        qId = cols[0] || qId;
        chapterTitle = cols[2] || 'সাধারণ অধ্যায়';
        questionText = cols[3] || '';
        optA = cols[4] || '';
        optB = cols[5] || '';
        optC = cols[6] || '';
        optD = cols[7] || '';
        rawCorrectOpt = cols[8] || '';
        rawCorrectAns = cols[9] || '';
        boardSource = cols[10] || '';
      } else {
        chapterTitle = cols[0] || 'সাধারণ অধ্যায়';
        questionText = cols[1] || '';
        optA = cols[2] || '';
        optB = cols[3] || '';
        optC = cols[4] || '';
        optD = cols[5] || '';
        rawCorrectOpt = cols[6] || 'ক';
        boardSource = cols[7] || '';
      }

      if (!questionText || (!optA && !optB)) return;

      const optionsArr = [optA, optB, optC, optD];
      const ansIdx = parseAnswerIndex(rawCorrectOpt, rawCorrectAns, optionsArr);

      const mcq: MCQQuestion = {
        id: qId,
        q: { en: questionText, bn: questionText },
        options: { en: optionsArr, bn: optionsArr },
        ans: ansIdx,
        explanation: {
          en: `সঠিক উত্তর: (${['ক', 'খ', 'গ', 'ঘ'][ansIdx]}) ${optionsArr[ansIdx]}${boardSource ? ` • ${boardSource}` : ''}`,
          bn: `সঠিক উত্তর: (${['ক', 'খ', 'গ', 'ঘ'][ansIdx]}) ${optionsArr[ansIdx]}${boardSource ? ` • ${boardSource}` : ''}`,
        },
        boardTag: boardSource || `${targetClass} • ${paper}`,
      };

      if (!chapterMap.has(chapterTitle)) {
        chapterMap.set(chapterTitle, []);
      }
      chapterMap.get(chapterTitle)!.push(mcq);
      importedCount++;
    });

    if (importedCount === 0) return { importedCount: 0, chaptersCount: 0 };

    const scopedKey = `${targetClass}__${targetGroup}__${subjectId}`;
    const existingList = [...storeState.customSubjects];
    const existingIdx = existingList.findIndex((cs) => cs.key === scopedKey);

    const newChapters: ChapterData[] = Array.from(chapterMap.entries()).map(
      ([chTitle, mcqs], idx) => ({
        id: `${subjectId}-ch-${idx + 1}-${Date.now()}`,
        name: {
          en: `${chTitle} (${paper})`,
          bn: `${chTitle} (${paper})`,
        },
        mcqs,
        cqs: [],
      })
    );

    const fullTitleEn = `${subjectNameEn} — ${paper} (${targetClass} ${targetGroup})`;
    const fullTitleBn = `${subjectNameBn} — ${paper} (${targetClass} • ${targetGroup})`;

    if (existingIdx !== -1) {
      const prevSubj = existingList[existingIdx].subject;
      const mergedChapters = [...prevSubj.chapters];

      newChapters.forEach((nCh) => {
        const matchIdx = mergedChapters.findIndex((c) => c.name.bn === nCh.name.bn);
        if (matchIdx !== -1) {
          const existingQIds = new Set(mergedChapters[matchIdx].mcqs.map((q) => q.id));
          const uniqueAdded = nCh.mcqs.filter((q) => !existingQIds.has(q.id));
          mergedChapters[matchIdx] = {
            ...mergedChapters[matchIdx],
            mcqs: [...mergedChapters[matchIdx].mcqs, ...uniqueAdded],
          };
        } else {
          mergedChapters.push(nCh);
        }
      });

      existingList[existingIdx] = {
        ...existingList[existingIdx],
        subject: {
          ...prevSubj,
          name: { en: fullTitleEn, bn: fullTitleBn },
          chapters: mergedChapters,
        },
      };
    } else {
      existingList.push({
        key: scopedKey,
        targetClass,
        targetGroup,
        paper,
        subject: {
          id: subjectId,
          name: { en: fullTitleEn, bn: fullTitleBn },
          icon: SUBJECT_ICONS[subjectId] || '📘',
          color: '#4F46E5',
          chapters: newChapters,
        },
      });
    }

    setState({
      customSubjects: existingList,
      selectedClass: targetClass,
      selectedGroup: targetGroup,
    });

    return { importedCount, chaptersCount: chapterMap.size };
  },

  addSingleCustomMcq: ({
    targetClass,
    targetGroup,
    paper,
    subjectId,
    subjectNameBn,
    subjectNameEn,
    chapterName,
    question,
    options,
    ans,
    boardTag,
    explanation,
  }) => {
    const csvLine = [
      `Q-${Date.now()}`,
      '1',
      chapterName,
      question,
      options[0],
      options[1],
      options[2],
      options[3],
      ['ক', 'খ', 'গ', 'ঘ'][ans] || 'ক',
      options[ans] || options[0],
      boardTag || explanation || '',
    ].join('\t');

    storeState.importBulkMcqs({
      targetClass,
      targetGroup,
      paper,
      subjectId,
      subjectNameBn,
      subjectNameEn,
      rawText: csvLine,
    });
  },

  updateCustomMcqAnswer: (scopedKey, chapterId, questionId, newAnsIndex) => {
    const updated = storeState.customSubjects.map((cs) => {
      if (cs.key !== scopedKey) return cs;
      return {
        ...cs,
        subject: {
          ...cs.subject,
          chapters: cs.subject.chapters.map((ch) => {
            if (ch.id !== chapterId) return ch;
            return {
              ...ch,
              mcqs: ch.mcqs.map((q) => {
                if (q.id !== questionId) return q;
                const optText = q.options.bn[newAnsIndex] || '';
                return {
                  ...q,
                  ans: newAnsIndex,
                  explanation: {
                    en: `সঠিক উত্তর: (${['ক', 'খ', 'গ', 'ঘ'][newAnsIndex]}) ${optText}`,
                    bn: `সঠিক উত্তর: (${['ক', 'খ', 'গ', 'ঘ'][newAnsIndex]}) ${optText}`,
                  },
                };
              }),
            };
          }),
        },
      };
    });
    setState({ customSubjects: updated });
  },

  deleteCustomMcq: (scopedKey, chapterId, questionId) => {
    const updated = storeState.customSubjects.map((cs) => {
      if (cs.key !== scopedKey) return cs;
      return {
        ...cs,
        subject: {
          ...cs.subject,
          chapters: cs.subject.chapters.map((ch) => {
            if (ch.id !== chapterId) return ch;
            return {
              ...ch,
              mcqs: ch.mcqs.filter((q) => q.id !== questionId),
            };
          }),
        },
      };
    });
    setState({ customSubjects: updated });
  },

  deleteCustomSubject: (scopedKey) => {
    setState({
      customSubjects: storeState.customSubjects.filter((cs) => cs.key !== scopedKey),
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
