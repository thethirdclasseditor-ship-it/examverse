import React, { useSyncExternalStore } from 'react';
import * as RawSupabase from '../lib/supabase';
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

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  targetClass: string;
  targetGroup: string;
  xp: number;
  streak: number;
  accuracy: number;
  status: 'active' | 'banned';
  joinedAt: string;
}

/* Required by src/lib/supabase.ts line 3 */
export function getLevelProgress(xp: number) {
  const safeXp = Math.max(0, Number(xp) || 0);
  const level = Math.floor(safeXp / 250) + 1;
  const currentLevelXp = safeXp % 250;
  const xpForNextLevel = 250;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / xpForNextLevel) * 100));
  return { level, currentLevelXp, xpForNextLevel, progressPercent };
}

/* Multi-Factor Rank Progression Engine (Bronze -> Silver -> Gold -> Platinum -> Elite) */
export function calculateUserRank(params: {
  xp: number;
  accuracyPct: number;
  masteredChaptersCount: number;
  totalChaptersCount?: number;
  streakDays: number;
  examsCompleted: number;
}): RankProgressInfo {
  const { xp, accuracyPct, masteredChaptersCount, totalChaptersCount = 20, streakDays, examsCompleted } = params;
  const xpComponent = Math.min(400, Math.round((xp / 4000) * 400));
  const accWeight = examsCompleted > 0 ? Math.min(1, examsCompleted / 5) : 0;
  const accuracyComponent = Math.round((Math.min(100, accuracyPct) / 100) * 250 * accWeight);
  const masteryPct = Math.min(100, Math.round((masteredChaptersCount / Math.max(1, totalChaptersCount)) * 100));
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

function makeChap(
  id: string,
  bn: string,
  en: string,
  formulas: [string, string, string][],
  mcqs: MCQQuestion[] = [],
  cqs: CQQuestion[] = []
): ChapterData {
  return {
    id,
    name: { bn, en },
    mcqs,
    cqs,
    formulas: formulas.map(([titleBn, eq, noteBn], idx): ChapterFormula => ({
      id: `${id}-f-${idx + 1}`,
      title: { bn: titleBn, en: titleBn },
      formula: eq,
      note: { bn: noteBn, en: noteBn },
    })),
  };
}

function makeMcq(id: string, qBn: string, optsBn: string[], ans: number, board?: string, expBn?: string): MCQQuestion {
  return {
    id,
    q: { bn: qBn, en: qBn },
    options: { bn: optsBn, en: optsBn },
    ans,
    boardTag: board,
    explanation: expBn ? { bn: expBn, en: expBn } : undefined,
  };
}

/* HSC -> Business Studies -> Accounting 2nd Paper (10 Chapters from Uploaded Excel) */
const HSC_ACCOUNTING_2ND_PAPER: SubjectData = {
  id: 'hsc-acc-2',
  name: { bn: 'হিসাববিজ্ঞান ২য় পত্র', en: 'Accounting 2nd Paper' },
  icon: '📊',
  color: '#4D7C0F',
  rgb: '77, 124, 15',
  chapters: [
    makeChap(
      'acc2-ch1',
      'অধ্যায় ১: অব্যবসায়ী প্রতিষ্ঠানের হিসাব',
      'Ch 1: Non-Trading Concerns',
      [
        ['প্রারম্ভিক মূলধন তহবিল', 'মূলধন তহবিল = প্রারম্ভিক মোট সম্পদ - প্রারম্ভিক মোট দায়', 'প্রারম্ভিক হাতে নগদ, বকেয়া চাঁদা ও স্থায়ী সম্পদ যোগ করে প্রারম্ভিক দায় বাদ দিতে হয়।'],
        ['চলতি বছরের নিট চাঁদা আয়', 'চাঁদা আয় = প্রাপ্ত চাঁদা + চলতি বকেয়া + বিগত অগ্রিম - বিগত বকেয়া - পরবর্তী অগ্রিম', 'আয়-ব্যয় বিবরণীর ক্রেডিট দিকে বসে।'],
        ['ব্যয়াতিরিক্ত আয় (Surplus)', 'উদ্বৃত্ত = মোট মুনাফাজাতীয় আয় - মোট মুনাফাজাতীয় ব্যয়', 'উদ্বৃত্ত মূলধন তহবিলের সাথে যোগ হয়।'],
      ],
      [
        makeMcq('ACC2-001', 'অব্যবসায়ী প্রতিষ্ঠানসমূহের আয়ের প্রধান উৎস কোনটি?', ['পণ্য বিক্রয়', 'সেবা প্রদান', 'চাঁদা', 'অনুদান'], 2, "য. বো. '১৯", 'অব্যবসায়ী প্রতিষ্ঠানের প্রধান আয়ের উৎস সদস্যদের চাঁদা।'),
        makeMcq('ACC2-002', 'অব্যবসায়ী প্রতিষ্ঠানের উদ্দেশ্য কোনটি?', ['পণ্য ক্রয়-বিক্রয়', 'পণ্য উৎপাদন', 'সদস্যদের সেবা ও জনকল্যাণমূলক কাজ', 'শেয়ার ক্রয়-বিক্রয়'], 2, "দি. বো. '১৭", 'অব্যবসায়ী প্রতিষ্ঠান সদস্য ও সমাজের কল্যাণে পরিচালিত হয়।'),
        makeMcq('ACC2-005', 'প্রাপ্তি ও প্রদান হিসাবের উদ্বৃত্তকে কী বলা হয়?', ['আয়', 'খরচ', 'দায়', 'সম্পদ'], 3, "সকল বোর্ড '১৮", 'প্রাপ্তি ও প্রদান হিসাবের সমাপনী উদ্বৃত্ত সমাপনী হাতে নগদ বা ব্যাংক জের নির্দেশ করে, যা সম্পদ।'),
        makeMcq('ACC2-006', 'চলতি বছরের বকেয়া বেতন ৫,০০০ টাকা এবং বিগত বছরের বকেয়া বেতন ২,৫০০ টাকা সমন্বয়ের পর আয়-ব্যয় হিসাবে বেতন ১৮,০০০ টাকা দেখানো হলে প্রদত্ত বেতন কত ছিল?', ['১২,৫০০ টাকা', '১৩,০০০ টাকা', '১৫,৫০০ টাকা', '২০,৫০০ টাকা'], 2, 'বোর্ড প্রশ্ন', 'প্রদত্ত বেতন = ১৮,০০০ - ৫,০০০ + ২,৫০০ = ১৫,৫০০ টাকা।'),
        makeMcq('ACC2-012', 'নয় মাসের অফিস ভাড়া প্রদত্ত হয়েছে ২৯,২৫০ টাকা। এক বছরে বকেয়া ভাড়ার পরিমাণ কত?', ['৮,৪৫০ টাকা', '৯,৫৫০ টাকা', '৯,৭৫০ টাকা', '১০,২৫০ টাকা'], 2, "রা. বো. '১৭", 'মাসিক ভাড়া = ২৯,২৫০ ÷ ৯ = ৩,২৫০ টাকা; ৩ মাসের বকেয়া = ৯,৭৫০ টাকা।'),
        makeMcq('ACC2-013', 'পরবর্তী বছরের চাঁদা চলতি বছর পাওয়া গেলে অব্যবসায়ী প্রতিষ্ঠানের কাছে কী হিসাবে বিবেচিত হয়?', ['আয়', 'ব্যয়', 'সম্পদ', 'দায়'], 3, "য. বো. '১৭", 'অগ্রিম প্রাপ্ত চাঁদা চলতি দায়।'),
      ]
    ),
    makeChap(
      'acc2-ch2',
      'অধ্যায় ২: অংশীদারি ব্যবসায়ের হিসাব',
      'Ch 2: Partnership Accounts',
      [
        ['প্রতি মাসের শুরুতে উত্তোলনের সুদ', 'সুদ = মাসিক উত্তোলন × সুদের হার × ৬.৫/১২', 'মাসের প্রথম তারিখে উত্তোলন করলে গড়ে ৬.৫ মাসের সুদ ধার্য হয়।'],
        ['প্রতি মাসের মাঝামাঝি ও শেষে উত্তোলনের সুদ', 'মাঝামাঝি = মাসিক উত্তোলন × হার × ৬/১২ | শেষে = মাসিক উত্তোলন × হার × ৫.৫/১২', 'চুক্তির অবর্তমানে অংশীদারের প্রদত্ত ঋণের ওপর ৬% হারে সুদ প্রদেয়।'],
      ],
      [
        makeMcq('ACC2-029', 'চুক্তির অবর্তমানে অংশীদারের প্রদত্ত ঋণের ওপর কত হারে সুদ ধার্য হয়?', ['৫%', '৬%', '৮%', '১০%'], 1, "ঢা. বো. '১৯", '১৯৩২ সালের অংশীদারি আইন অনুযায়ী ঋণের ওপর ৬% সুদ প্রদেয়।'),
        makeMcq('ACC2-030', 'প্রতি মাসের প্রথম তারিখে ১,০০০ টাকা করে উত্তোলন করলে ১০% হারে বার্ষিক উত্তোলনের সুদ কত?', ['৫৫০ টাকা', '৬০০ টাকা', '৬৫০ টাকা', '১,২০০ টাকা'], 2, "চ. বো. '১৯", '১,০০০ × ১০% × ৬.৫ = ৬৫০ টাকা।'),
      ]
    ),
    makeChap(
      'acc2-ch3',
      'অধ্যায় ৩: নগদ প্রবাহ বিবরণী',
      'Ch 3: Cash Flow Statement',
      [
        ['পরিচালন কার্যক্রম হতে নিট নগদ প্রবাহ', 'নিট আয় + অবচয় + স্থায়ী সম্পদ বিক্রয় ক্ষতি - বিক্রয় লাভ - চলতি সম্পদ বৃদ্ধি + চলতি দায় বৃদ্ধি', 'IAS-7 অনুযায়ী নগদ প্রবাহ বিবরণীতে ৩টি খাত থাকে: পরিচালন, বিনিয়োগ ও অর্থায়ন।'],
      ],
      [
        makeMcq('ACC2-062', 'নগদ প্রবাহ বিবরণীতে কয়টি খাতের নগদ প্রবাহ দেখানো হয়?', ['২টি', '৩টি', '৪টি', '৫টি'], 1, "ঢা. বো. '১৯", 'পরিচালন, বিনিয়োগ ও অর্থায়ন কার্যক্রম।'),
        makeMcq('ACC2-063', 'অবচয় নগদ প্রবাহ বিবরণীর কোন কার্যক্রমে সমন্বয় করা হয়?', ['পরিচালন', 'বিনিয়োগ', 'অর্থায়ন', 'নগদ সমতুল্য'], 0, "রা. বো. '১৯", 'অবচয় অনগদ ব্যয় হওয়ায় পরিচালন কার্যক্রমে যোগ হয়।'),
      ]
    ),
    makeChap(
      'acc2-ch4',
      'অধ্যায় ৪: যৌথমূলধনী কোম্পানির মূলধন',
      'Ch 4: Share Capital',
      [
        ['শেয়ার অধিহার ও অবহার বিধি', 'কোম্পানি আইন ১৯৯৪ এর ১৫৩ ধারা মতে সর্বোচ্চ ১০% অবহারে শেয়ার ইস্যু করা যায়', 'বাজেয়াপ্ত শেয়ারের অবশিষ্ট লাভ মূলধন সঞ্চিতি হিসাবে স্থানান্তরিত হয়।'],
      ],
      [
        makeMcq('ACC2-096', 'বাংলাদেশে প্রচলিত কোম্পানি আইন কত সালের?', ['১৯১৩ সালের', '১৯৩২ সালের', '১৯৯৪ সালের', '২০০৪ সালের'], 2, "ঢা. বো. '১৯", 'বাংলাদেশে ১৯৯৪ সালের কোম্পানি আইন প্রচলিত।'),
        makeMcq('ACC2-098', 'বাজেয়াপ্ত শেয়ার পুনঃইস্যুর পর অবশিষ্ট উদ্বৃত্ত কোন হিসাবে স্থানান্তরিত হয়?', ['সাধারণ সঞ্চিতি', 'মূলধন সঞ্চিতি', 'শেয়ার অধিহার', 'লাভ-লোকসান হিসাব'], 1, "সকল বোর্ড '১৮", 'মূলধন সঞ্চিতি হিসাবে স্থানান্তরিত হয়।'),
      ]
    ),
    makeChap(
      'acc2-ch5',
      'অধ্যায় ৫: যৌথমূলধনী কোম্পানির আর্থিক বিবরণী',
      'Ch 5: Company Financial Statements',
      [
        ['মোট মুনাফা ও কার্যকরী মূলধন', 'মোট মুনাফা = নিট বিক্রয় - বিক্রীত পণ্যের ব্যয় | কার্যকরী মূলধন = চলতি সম্পদ - চলতি দায়', '১৯৯৪ সালের কোম্পানি আইনের ১৮৫ ধারা মোতাবেক আর্থিক বিবরণী প্রস্তুত হয়।'],
      ],
      [
        makeMcq('ACC2-127', 'দাবিহীন লভ্যাংশ আর্থিক অবস্থার বিবরণীতে কোন খাতে দেখানো হয়?', ['চলতি সম্পদ', 'চলতি দায়', 'সঞ্চিতি ও উদ্বৃত্ত', 'ভুয়া সম্পত্তি'], 1, "রা. বো. '১৯", 'দাবিহীন লভ্যাংশ কোম্পানির একটি চলতি দায়।'),
      ]
    ),
    makeChap(
      'acc2-ch6',
      'অধ্যায় ৬: আর্থিক বিবরণী বিশ্লেষণ',
      'Ch 6: Financial Statement Analysis',
      [
        ['চলতি অনুপাত ও তড়িৎ অনুপাত', 'চলতি অনুপাত = চলতি সম্পদ ÷ চলতি দায় (আদর্শ ২:১) | তড়িৎ অনুপাত = তড়িৎ সম্পদ ÷ চলতি দায় (আদর্শ ১:১)', 'তড়িৎ সম্পদ = চলতি সম্পদ - সমাপনী মজুদ - অগ্রিম খরচ।'],
        ['মজুদ আবর্তন ও লাভ অনুপাত', 'মজুদ আবর্তন = বিক্রীত পণ্যের ব্যয় ÷ গড় মজুদ (আদর্শ ৮ বার) | মোট লাভ অনুপাত = (মোট লাভ ÷ নিট বিক্রয়) × ১০০', 'গড় মজুদ = (প্রারম্ভিক মজুদ + সমাপনী মজুদ) ÷ ২।'],
      ],
      [
        makeMcq('ACC2-157', 'চলতি অনুপাতের আদর্শ মান কোনটি?', ['১ : ১', '২ : ১', '১ : ২', '৩ : ১'], 1, "সকল বোর্ড '১৮", 'চলতি অনুপাতের আদর্শ মান ২ : ১।'),
        makeMcq('ACC2-158', 'তড়িৎ অনুপাতের আদর্শ মান কত?', ['১ : ১', '২ : ১', '১.৫ : ১', '০.৫ : ১'], 0, "ঢা. বো. '১৯", 'তড়িৎ অনুপাতের আদর্শ মান ১ : ১।'),
      ]
    ),
    makeChap(
      'acc2-ch7',
      'অধ্যায় ৭: উৎপাদন ব্যয় হিসাব',
      'Ch 7: Cost Accounting',
      [
        ['উৎপাদন ব্যয় বিবরণীর স্তরসমূহ', 'মুখ্য ব্যয় = প্রত্যক্ষ কাঁচামাল + প্রত্যক্ষ মজুরি + প্রত্যক্ষ খরচ | উৎপাদন ব্যয় = মুখ্য ব্যয় + কারখানা উপরি ব্যয়', 'মোট ব্যয় = উৎপাদন ব্যয় + প্রশাসনিক উপরি ব্যয় + বিক্রয় উপরি ব্যয়।'],
      ],
      [
        makeMcq('ACC2-187', 'প্রত্যক্ষ কাঁচামাল, প্রত্যক্ষ শ্রম ও প্রত্যক্ষ খরচের সমষ্টিকে কী বলে?', ['কারখানা ব্যয়', 'মুখ্য ব্যয়', 'উৎপাদন ব্যয়', 'মোট ব্যয়'], 1, "ঢা. বো. '১৯", 'সকল প্রত্যক্ষ ব্যয়ের সমষ্টি মুখ্য ব্যয় (Prime Cost)।'),
      ]
    ),
    makeChap(
      'acc2-ch8',
      'অধ্যায় ৮: মজুদ পণ্যর হিসাবরক্ষণ পদ্ধতি',
      'Ch 8: Inventory Accounting',
      [
        ['FIFO ও ভারযুক্ত গড় পদ্ধতি', 'ভারযুক্ত গড় একক দর = উদ্বৃত্ত মালের মোট মূল্য ÷ উদ্বৃত্ত মালের মোট একক | পুনঃফরমায়েশ স্তর = সর্বোচ্চ ব্যবহার × সর্বোচ্চ লিড টাইম', 'বিন কার্ডে শুধুমাত্র মালের পরিমাণের হিসাব রাখা হয়।'],
      ],
      [
        makeMcq('ACC2-218', 'মূল্যস্ফীতির সময় কোন পদ্ধতিতে সমাপনী মজুদের মূল্য সর্বাধিক হয়?', ['LIFO পদ্ধতি', 'FIFO পদ্ধতি', 'ভারযুক্ত গড় পদ্ধতি', 'সরল গড় পদ্ধতি'], 1, "ঢা. বো. '১৭", 'FIFO পদ্ধতিতে সমাপনী মজুদ সাম্প্রতিক মূল্যে মূল্যায়িত হয়।'),
      ]
    ),
    makeChap(
      'acc2-ch9',
      'অধ্যায় ৯: ব্যয় ও ব্যয়ের শ্রেণিবিভাগ',
      'Ch 9: Classification of Cost',
      [
        ['রূপান্তর ব্যয় (Conversion Cost)', 'রূপান্তর ব্যয় = প্রত্যক্ষ মজুরি + কারখানা উপরি ব্যয়', 'উৎপাদন বৃদ্ধির সাথে একক প্রতি স্থির ব্যয় হ্রাস পায় কিন্তু মোট স্থির ব্যয় অপরিবর্তিত থাকে।'],
      ],
      [
        makeMcq('ACC2-254', 'রূপান্তর ব্যয়ের সূত্র কোনটি?', ['প্রত্যক্ষ মাল + প্রত্যক্ষ মজুরি', 'প্রত্যক্ষ মজুরি + কারখানা উপরি ব্যয়', 'মুখ্য ব্যয় + প্রশাসনিক ব্যয়', 'কারখানা ব্যয় + বিক্রয় ব্যয়'], 1, "সকল বোর্ড '১৮", 'রূপান্তর ব্যয় = প্রত্যক্ষ শ্রম + কারখানা উপরি ব্যয়।'),
      ]
    ),
    makeChap(
      'acc2-ch10',
      'অধ্যায় ১০: ব্যবস্থাপনা হিসাববিজ্ঞান পরিচিতি',
      'Ch 10: Management Accounting',
      [
        ['সমচ্ছেদ বিন্দু (Break-Even Point) ও নিরাপত্তা প্রান্ত', 'BEP (একক) = স্থির ব্যয় ÷ একক প্রতি দত্তাংশ | দত্তাংশ = বিক্রয় - পরিবর্তনশীল ব্যয় | নিরাপত্তা প্রান্ত = প্রকৃত বিক্রয় - সমচ্ছেদ বিক্রয়', 'সমচ্ছেদ বিন্দুতে প্রতিষ্ঠানের লাভ বা ক্ষতি শূন্য (০) হয়।'],
      ],
      [
        makeMcq('ACC2-277', 'সমচ্ছেদ বিন্দুতে প্রতিষ্ঠানের মুনাফার পরিমাণ কত থাকে?', ['সর্বোচ্চ মুনাফা', 'সর্বনিম্ন মুনাফা', 'লাভ-ক্ষতি শূন্য (০)', 'স্থির ব্যয়ের সমান'], 2, "ঢা. বো. '১৯", 'সমচ্ছেদ বিন্দুতে মোট আয় ও মোট ব্যয় সমান হওয়ায় লাভ-ক্ষতি শূন্য থাকে।'),
      ]
    ),
  ],
};

/* Common Compulsory Subjects for HSC (Bangla 1st & 2nd, English 1st & 2nd, and SINGLE ICT) */
const COMMON_HSC_SUBJECTS: SubjectData[] = [
  {
    id: 'hsc-ban-1',
    name: { bn: 'বাংলা ১ম পত্র', en: 'Bangla 1st Paper' },
    icon: '📖',
    color: '#B91C1C',
    rgb: '185, 28, 28',
    chapters: [
      makeChap('ban1-ch1', 'গদ্য: অপরিচিতা, বিলাসী, আমার পথ, মাসি-পিসি, বায়ান্নর দিনগুলো, রেইনকোট', 'Selected Prose', [
        ['অপরিচিতা ও বিলাসী তথ্যসূত্র', 'অপরিচিতা (১৯১৪, সবুজপত্র): অনুপম (২৭), কল্যাণী (১৫) | বিলাসী (১৯১৮, ভারতী): ন্যাড়া ও মৃত্যুঞ্জয়', 'রেইনকোট (১৯৯৫, আখতারুজ্জামান ইলিয়াস): নুরুল হুদা ও আবদুস সাত্তার মৃধা।'],
      ]),
      makeChap('ban1-ch2', 'পদ্য ও সহপাঠ: সোনার তরী, বিদ্রোহী, আঠারো বছর বয়স, লালসালু ও সিরাজউদ্দৌলা', 'Poetry, Novel & Drama', [
        ['ছন্দ ও প্রকাশকাল', 'সোনার তরী (মাত্রাবৃত্ত ছন্দ, ১৮৯৪) | বিদ্রোহী (অগ্নিবীণা, ১৯২২) | আঠারো বছর বয়স (ছাড়পত্র, ১৯৪৮, ৬ মাত্রার মাত্রাবৃত্ত)', 'লালসালু (১৯৪৮, মহব্বতনগর) ও সিরাজউদ্দৌলা নাটক (১৯৬৫, ৪ অঙ্ক ১২ দৃশ্য)।'],
      ]),
    ],
  },
  {
    id: 'hsc-ban-2',
    name: { bn: 'বাংলা ২য় পত্র', en: 'Bangla 2nd Paper' },
    icon: '✍️',
    color: '#DC2626',
    rgb: '220, 38, 38',
    chapters: [
      makeChap('ban2-ch1', 'অধ্যায় ১: বাংলা উচ্চারণ ও প্রমিত বাংলা বানানের নিয়ম', 'Pronunciation & Orthography Rules', [
        ['আদ্য ‘অ’ সংবৃত উচ্চারণ ও বানান বিধি', 'শব্দের শুরুতে ‘অ’-এর পরে ই/ঈ/উ/ঊ/য-ফলা/ক্ষ/জ্ঞ থাকলে ‘অ’ → ‘ও’ উচ্চারিত হয় (অতি → ওতি, দক্ষ → দোক্খো)', 'সকল অতৎসম শব্দে এবং -আলি/-অলি প্রত্যয়ে হ্রস্ব ই-কার (ি) বসে (বাড়ি, পাখি, সোনালি, গীতাঞ্জলি)।'],
      ]),
      makeChap('ban2-ch2', 'অধ্যায় ২: ব্যাকরণিক শব্দশ্রেণি, উপসর্গ, প্রত্যয়, সমাস ও বাক্যতত্ত্ব', 'Grammar, Samas & Syntax', [
        ['সমাস ও উপসর্গের মূল সূত্র', 'দ্বন্দ্ব (উভয় পদ প্রধান) | কর্মধারয় (পরপদ প্রধান) | বহুব্রীহি (অন্য পদ প্রধান) | দ্বিগু (সংখ্যাবাচক পূর্বপদ)', 'খাঁটি বাংলা উপসর্গ ২১টি এবং তৎসম উপসর্গ ২০টি (স, সু, বি, নি উভয়তেই আছে)।'],
      ]),
    ],
  },
  {
    id: 'hsc-eng-1',
    name: { bn: 'ইংরেজি ১ম পত্র (English 1st Paper)', en: 'English 1st Paper' },
    icon: '🇬🇧',
    color: '#BE185D',
    rgb: '190, 24, 93',
    chapters: [
      makeChap('eng1-ch1', 'Comprehension, Flow Chart, Summary & Cloze Test Rules', 'EFT Comprehension & Writing Rules', [
        ['Flow Chart ও Summary লেখার নিয়ম', 'Flow Chart-এ কখনোই পূর্ণ বাক্য লেখা যাবে না (Verb+ing / To+V1 / Noun Phrase ব্যবহার করতে হবে)', 'Summary মূল প্যাসেজের ১/৩ অংশে (৫০–৬০ শব্দে) নিজের ভাষায় ১ প্যারায় লিখতে হবে।'],
      ]),
    ],
  },
  {
    id: 'hsc-eng-2',
    name: { bn: 'ইংরেজি ২য় পত্র (English 2nd Paper)', en: 'English 2nd Paper' },
    icon: '📝',
    color: '#9D174D',
    rgb: '157, 23, 77',
    chapters: [
      makeChap('eng2-ch1', 'Right Form of Verbs, Conditionals, Modifiers & Connectors', 'HSC Grammar Rules', [
        ['3 Conditional Structures', '1st: If + Present, S + will + V1 | 2nd: If + Past, S + would + V1 | 3rd: If + had + V3, S + would have + V3', 'It is high time + S + V2 | With a view to / look forward to + Verb+ing | Lest + S + should + V1।'],
      ]),
    ],
  },
  {
    id: 'hsc-ict',
    name: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', en: 'ICT (Single Paper)' },
    icon: '💻',
    color: '#0369A1',
    rgb: '3, 105, 161',
    chapters: [
      makeChap('ict-ch1', 'অধ্যায় ১ ও ২: বিশ্ব ও বাংলাদেশ প্রেক্ষিত এবং কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং', 'Ch 1 & 2: ICT & Networking', [
        ['নেটওয়ার্ক মোড ও টপোলজি সূত্র', 'Simplex (রেডিও) | Half-Duplex (ওয়াকিটকি) | Full-Duplex (মোবাইল) | Mesh টপোলজিতে তারের সংখ্যা = n(n - 1) / 2', 'অপটিক্যাল ফাইবারে পূর্ণ অভ্যন্তরীণ প্রতিফলন নীতি ব্যবহৃত হয়; ন্যানোটেকনোলজি পাল্লা: 1 – 100 nm।'],
      ]),
      makeChap('ict-ch3', 'অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', 'Ch 3: Number Systems & Logic Gates', [
        ['ডি-মরগ্যানের উপপাদ্য ও লজিক গেইট', '(A + B)′ = A′ · B′  এবং  (A · B)′ = A′ + B′  |  XOR: A ⊕ B = A′B + AB′  |  Half Adder: S = A ⊕ B, C = AB', 'NAND ও NOR সার্বজনীন গেইট; ২-এর পরিপূরক = ১-এর পরিপূরক + ১।'],
      ]),
      makeChap('ict-ch4', 'অধ্যায় ৪, ৫ ও ৬: HTML, C প্রোগ্রামিং এবং ডেটাবেজ (SQL)', 'Ch 4–6: HTML, C & DBMS', [
        ['HTML, C ও SQL মৌলিক সিনট্যাক্স', 'HTML লিংক: <a href="url">Text</a> | C লিপ ইয়ার: (y%400==0)||(y%4==0 && y%100!=0) | SQL: SELECT * FROM table WHERE cond;', 'C ভাষায় int (%d), float (%f), double (%lf), char (%c) ফরম্যাট স্পেসিফায়ার ব্যবহৃত হয়।'],
      ]),
    ],
  },
];

export const BUILTIN_SYLLABUS: Record<string, Record<string, SubjectData[]>> = {
  HSC: {
    Science: [
      {
        id: 'hsc-phy-1',
        name: { bn: 'পদার্থবিজ্ঞান ১ম পত্র', en: 'Physics 1st Paper' },
        icon: '⚛️',
        color: '#1D4ED8',
        rgb: '29, 78, 216',
        chapters: [
          makeChap('phy1-ch1', 'অধ্যায় ১ ও ২: ভৌত জগৎ ও পরিমাপ এবং ভেক্টর', 'Ch 1 & 2: Measurement & Vectors', [
            ['ভেক্টর লব্ধি ও ডট/ক্রস গুণন', 'R = √(P² + Q² + 2PQ cosα) | tanθ = (Q sinα)/(P + Q cosα) | A·B = AB cosθ | |A×B| = AB sinθ', 'লম্ব হলে A·B = 0; সমান্তরাল হলে A×B = 0; গোলকের আয়তনে শতকরা ত্রুটি = 3 × ব্যাসার্ধের ত্রুটি।'],
          ]),
          makeChap('phy1-ch3', 'অধ্যায় ৩ ও ৪: গতিবিদ্যা ও নিউটনীয় বলবিদ্যা', 'Ch 3 & 4: Dynamics & Newtonian Mechanics', [
            ['প্রাসের গতি ও ব্যাংকিং কোণ', 'H = (u² sin²α)/(2g) | T = (2u sinα)/g | R = (u² sin2α)/g | ব্যাংকিং কোণ tanθ = v²/(rg) = h/d', 'কেন্দ্রমুখী বল F = mv²/r = mω²r; কৌণিক ভরবেগ L = Iω এবং টর্ক τ = Iα।'],
          ]),
          makeChap('phy1-ch5', 'অধ্যায় ৫, ৬ ও ৭: কাজ-শক্তি-ক্ষমতা, মহাকর্ষ ও পদার্থের গাঠনিক ধর্ম', 'Ch 5–7: Work, Gravitation & Matter', [
            ['শক্তি, মুক্তিবেগ ও স্থিতিস্থাপকতা', 'E_k = ½mv² = p²/(2m) | মুক্তিবেগ v_e = √(2gR) = 11.2 km/s | ইয়ং গুণাঙ্ক Y = (FL)/(Al) | কৈশিক উচ্চতা h = (2T cosθ)/(rρg)', 'h উচ্চতায় অভিকর্ষজ ত্বরণ g′ = g(1 - 2h/R) এবং d গভীরতায় g′ = g(1 - d/R)।'],
          ]),
          makeChap('phy1-ch8', 'অধ্যায় ৮, ৯ ও ১০: পর্যাবৃত্ত গতি, তরঙ্গ এবং আদর্শ গ্যাস', 'Ch 8–10: Periodic Motion, Waves & Ideal Gas', [
            ['সরল দোলক, বিট, তীব্রতা লেভেল ও গ্যাসের গতিতত্ত্ব', 'T = 2π√(L/g) | v = ω√(A² - x²) | β = 10 log₁₀(I/I₀) dB | PV = nRT = (1/3)mNc² | c_rms = √(3RT/M)', 'সেকেন্ড দোলকের দোলনকাল 2s (L ≈ 0.993m); গ্যাসের গতিশক্তি E = (3/2)nRT।'],
          ]),
        ],
      },
      {
        id: 'hsc-phy-2',
        name: { bn: 'পদার্থবিজ্ঞান ২য় পত্র', en: 'Physics 2nd Paper' },
        icon: '⚡',
        color: '#2563EB',
        rgb: '37, 99, 235',
        chapters: [
          makeChap('phy2-ch1', 'অধ্যায় ১, ২ ও ৩: তাপগতিবিদ্যা, স্থির তড়িৎ ও চল তড়িৎ', 'Ch 1–3: Thermodynamics & Electricity', [
            ['কার্নো ইঞ্জিন, কুলম্ব, ধারকত্ব ও শান্ট', 'η = (1 - T₂/T₁)×100% | PV^γ = ধ্রুবক | C = ε₀A/d | U = ½CV² | I = E/(R + r) | শান্ট S = G/(n - 1)', 'রুদ্ধতাপীয় প্রক্রিয়ায় কাজ W = nR(T₁ - T₂)/(γ - 1) এবং এনট্রপি dS = dQ/T।'],
          ]),
          makeChap('phy2-ch4', 'অধ্যায় ৪–৭: চৌম্বক ক্রিয়া, আবেশ এবং জ্যামিতিক ও ভৌত আলোকবিজ্ঞান', 'Ch 4–7: Magnetism & Optics', [
            ['চৌম্বক বল, ট্রান্সফরমার, লেন্স ও ব্যতিচার', 'F = qvB sinθ | ε = -N(dΦ/dt) | E_p/E_s = N_p/N_s = I_s/I_p | 1/f = (μ - 1)(1/r₁ - 1/r₂) | ডোরা ব্যবধান Δx = λD/a', 'লেন্সের ক্ষমতা P = 1/f (ডায়োপ্টার)।'],
          ]),
          makeChap('phy2-ch8', 'অধ্যায় ৮–১০: আধুনিক পদার্থবিজ্ঞান, নিউক্লিয়ার ও সেমিকন্ডাক্টর', 'Ch 8–10: Modern, Nuclear & Semiconductor', [
            ['ফটোতড়িৎ, তেজস্ক্রিয় অর্ধায়ু ও ট্রানজিস্টর', 'E = mc² | hf = hf₀ + ½mv_max² | T_½ = 0.693 / λ | I_E = I_B + I_C | β = I_C / I_B', 'তেজস্ক্রিয় ক্ষয় সূত্র N = N₀ e^(-λt)।'],
          ]),
        ],
      },
      {
        id: 'hsc-chem-1',
        name: { bn: 'রসায়ন ১ম পত্র', en: 'Chemistry 1st Paper' },
        icon: '🧪',
        color: '#0F766E',
        rgb: '15, 118, 110',
        chapters: [
          makeChap('chem1-ch2', 'অধ্যায় ২, ৩ ও ৪: গুণগত রসায়ন, পর্যায়বৃত্ত ধর্ম ও রাসায়নিক পরিবর্তন', 'Qualitative, Periodic & Chemical Changes', [
            ['দ্রাব্যতা গুণফল, সংকরায়ন, Kp-Kc ও বাফার pH', '1/λ = R_H(1/n₁² - 1/n₂²) | K_p = K_c(RT)^Δn | pH = -log[H⁺] | pH = pK_a + log([লবণ]/[অম্ল])', 'সংকরায়ন সংখ্যা X = ½[যোজ্যতা ইলেকট্রন + একযোজী পরমাণু - ক্যাটায়ন + অ্যানায়ন]।'],
          ]),
        ],
      },
      {
        id: 'hsc-chem-2',
        name: { bn: 'রসায়ন ২য় পত্র', en: 'Chemistry 2nd Paper' },
        icon: '⚗️',
        color: '#059669',
        rgb: '5, 150, 105',
        chapters: [
          makeChap('chem2-ch1', 'অধ্যায় ১, ৩ ও ৪: পরিবেশ রসায়ন, পরিমাণগত রসায়ন ও তড়িৎ রসায়ন', 'Environmental, Quantitative & Electrochemistry', [
            ['ব্যাপন, মোলারিটি, ফ্যারাডে ও নার্নস্ট সমীকরণ', 'r₁/r₂ = √(M₂/M₁) | S = (1000×w)/(M×V) | V₁S₁e₁ = V₂S₂e₂ | W = (MIt)/(nF) | E_cell = E°_cell - (RT/nF)lnQ', 'শতকরা ঘনমাত্রা থেকে মোলারিটি S = (10 × x% × d) / M; 1F = 96500 C।'],
          ]),
        ],
      },
      {
        id: 'hsc-math-1',
        name: { bn: 'উচ্চতর গণিত ১ম পত্র', en: 'Higher Math 1st Paper' },
        icon: '📐',
        color: '#6D28D9',
        rgb: '109, 40, 217',
        chapters: [
          makeChap('math1-ch1', 'ম্যাট্রিক্স, ভেক্টর, সরলরেখা, বৃত্ত, বিন্যাস-সমাবেশ ও ত্রিকোণমিতি', 'Algebra, Geometry & Trigonometry', [
            ['সরলরেখা, বৃত্ত ও সমাবেশ সূত্র', 'A⁻¹ = adj(A)/|A| | লম্ব দূরত্ব d = |ax₁+by₁+c|/√(a²+b²) | বৃত্তের ব্যাসার্ধ r = √(g²+f²-c) | ⁿC_r + ⁿC_(r-1) = ⁿ⁺¹C_r', 'লম্ব রেখার শর্ত m₁m₂ = -1; 1 + cos2A = 2cos²A এবং 1 - cos2A = 2sin²A।'],
          ]),
          makeChap('math1-ch9', 'অধ্যায় ৯ ও ১০: অন্তরীকরণ ও যোগজীকরণ (Calculus)', 'Differentiation & Integration', [
            ['ক্যালকুলাসের মৌলিক সূত্রাবলি', 'd/dx(xⁿ) = nx^(n-1) | d/dx(ln x) = 1/x | lim(x→0)(sin x)/x = 1 | ∫xⁿdx = x^(n+1)/(n+1)+c | ∫[f′(x)/f(x)]dx = ln|f(x)|+c', '∫u v dx = u∫v dx - ∫[du/dx ∫v dx]dx।'],
          ]),
        ],
      },
      {
        id: 'hsc-math-2',
        name: { bn: 'উচ্চতর গণিত ২য় পত্র', en: 'Higher Math 2nd Paper' },
        icon: '♾️',
        color: '#7C3AED',
        rgb: '124, 58, 237',
        chapters: [
          makeChap('math2-ch1', 'জটিল সংখ্যা, বহুপদী, কণিক, বিপরীত ত্রিকোণমিতি, স্থিতিবিদ্যা ও গতিবিদ্যা', 'Complex Numbers, Conics & Mechanics', [
            ['এককের ঘনমূল, বহুপদী, কণিক ও লামির সূত্র', '1 + ω + ω² = 0, ω³ = 1 | α+β = -b/a, αβ = c/a | উপবৃত্তের উৎকেন্দ্রিকতা e = √(1 - b²/a²) | P/sinα = Q/sinβ = R/sinγ', 'tan⁻¹x + tan⁻¹y = tan⁻¹[(x+y)/(1-xy)] এবং sin⁻¹x + cos⁻¹x = π/2।'],
          ]),
        ],
      },
      {
        id: 'hsc-bio-1',
        name: { bn: 'জীববিজ্ঞান ১ম পত্র', en: 'Biology 1st Paper' },
        icon: '🌿',
        color: '#15803D',
        rgb: '21, 128, 61',
        chapters: [
          makeChap('bio1-ch1', 'কোষের গঠন, কোষ বিভাজন, অণুজীব ও উদ্ভিদ শারীরতত্ত্ব', 'Botany Core Formulas & Ratios', [
            ['শ্বসন, সালোকসংশ্লেষণ ও RQ সূত্র', 'সবাত শ্বসনে ১ অণু গ্লুকোজ থেকে ৩৬/৩৮টি ATP উৎপন্ন হয় | শ্বসনিক হার RQ = নির্গত CO₂ ÷ গৃহীত O₂ (গ্লুকোজের RQ = 1)', 'গ্লাইকোলাইসিসে নিট ২টি ATP এবং ক্রেবস চক্রে ২৪টি ATP উৎপন্ন হয়।'],
          ]),
        ],
      },
      {
        id: 'hsc-bio-2',
        name: { bn: 'জীববিজ্ঞান ২য় পত্র', en: 'Biology 2nd Paper' },
        icon: '🧬',
        color: '#16A34A',
        rgb: '22, 163, 74',
        chapters: [
          makeChap('bio2-ch1', 'পরিপাক, রক্ত সংবহন, শ্বসন এবং জিনতত্ত্ব ও বিবর্তন', 'Zoology & Genetics Ratios', [
            ['BMI, দন্ত সংকেত ও মেন্ডেলের জেনেটিক অনুপাত', 'BMI = ওজন (kg) ÷ [উচ্চতা (m)]² | ১ম সূত্র: 3:1 (লিথাল জিন 2:1, অসম্পূর্ণ প্রকটতা 1:2:1) | ২য় সূত্র: 9:3:3:1 (পরিপূরক জিন 9:7, এপিস্ট্যাসিস 13:3)', 'পূর্ণবয়স্ক মানুষের দন্ত সংকেত: I₂C₁P₂M₃ / I₂C₁P₂M₃ × 2 = 32।'],
          ]),
        ],
      },
      ...COMMON_HSC_SUBJECTS,
    ],

    'Business Studies': [
      {
        id: 'hsc-acc-1',
        name: { bn: 'হিসাববিজ্ঞান ১ম পত্র', en: 'Accounting 1st Paper' },
        icon: '📒',
        color: '#65A30D',
        rgb: '101, 163, 13',
        chapters: [
          makeChap('acc1-ch1', 'হিসাব সমীকরণ, ব্যাংক সমন্বয় বিবরণী, রেওয়ামিল ও অবচয়', 'Accounting 1st Paper Formulas', [
            ['বর্ধিত হিসাব সমীকরণ ও অবচয় সূত্র', 'A = L + (C + R - E - D) | সরলরৈখিক অবচয় = (সম্পত্তির ক্রয়মূল্য - ভগ্নাবশেষ মূল্য) ÷ আয়ুষ্কাল | ক্রমহ্রাসমান হার = (১০০% ÷ আয়ুষ্কাল) × ২', 'সমাপনী মজুদ পণ্য এবং প্রারম্ভিক হাতে নগদ/ব্যাংক জের সাধারণত রেওয়ামিলে বসে না।'],
          ]),
        ],
      },
      HSC_ACCOUNTING_2ND_PAPER,
      {
        id: 'hsc-fin-1',
        name: { bn: 'ফিন্যান্স, ব্যাংকিং ও বিমা ১ম পত্র', en: 'Finance, Banking & Insurance 1st Paper' },
        icon: '💰',
        color: '#D97706',
        rgb: '217, 119, 6',
        chapters: [
          makeChap('fin1-ch1', 'অর্থের সময়মূল্য, মূলধন ব্যয় (CAPM), মূলধন বাজেটিং ও ঝুঁকি', 'Finance 1st Paper Formulas', [
            ['FV, PV, EAR, CAPM, CV ও NPV সূত্র', 'FV = PV(1 + i/m)^(n×m) | EAR = (1 + i/m)ᵐ - 1 | CAPM: K_e = R_f + β(R_m - R_f) | বিভেদাঙ্ক CV = (σ / R̄) × 100', 'পে-ব্যাক সময় PBP = বিনিয়োগ ÷ বার্ষিক নগদ আন্তঃপ্রবাহ; গড় মুনাফার হার ARR = (গড় নিট মুনাফা ÷ গড় বিনিয়োগ) × ১০০।'],
          ]),
        ],
      },
      {
        id: 'hsc-fin-2',
        name: { bn: 'ফিন্যান্স, ব্যাংকিং ও বিমা ২য় পত্র', en: 'Finance, Banking & Insurance 2nd Paper' },
        icon: '🏦',
        color: '#B45309',
        rgb: '180, 83, 9',
        chapters: [
          makeChap('fin2-ch1', 'কেন্দ্রীয় ব্যাংক, বাণিজ্যিক ব্যাংক, ই-ব্যাংকিং ও বিমার মূলনীতি', 'Banking & Insurance Rules', [
            ['ঋণ নিয়ন্ত্রণ ও বিমার নীতিমালা', 'কেন্দ্রীয় ব্যাংকের ঋণ নিয়ন্ত্রণ: ব্যাংক হার নীতি, খোলা বাজার নীতি, জমার হার পরিবর্তন (CRR ও SLR)', 'জীবন বিমা "নিশ্চয়তার চুক্তি" এবং নৌ/অগ্নি বিমা "ক্ষতিপূরণের চুক্তি"।'],
          ]),
        ],
      },
      {
        id: 'hsc-bom-1',
        name: { bn: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র', en: 'Business Org. & Mgmt 1st Paper' },
        icon: '🏢',
        color: '#0284C7',
        rgb: '2, 132, 199',
        chapters: [
          makeChap('bom1-ch1', 'একমালিকানা, অংশীদারি, যৌথমূলধনী কোম্পানি ও সমবায় সমিতি', 'Business Organization Rules & Laws', [
            ['সদস্য সংখ্যা ও প্রযোজ্য আইন', 'অংশীদারি (১৯৩২ আইন): সাধারণ ২–২০ জন, ব্যাংকিং ২–১০ জন | প্রাইভেট লি.: ২–৫০ জন | পাবলিক লি.: ৭–শেয়ার সংখ্যা দ্বারা সীমাবদ্ধ | সমবায় (২০০১ আইন): ন্যূনতম ২০ জন', 'ব্যবসায় = শিল্প + বাণিজ্য + প্রত্যক্ষ সেবা।'],
          ]),
        ],
      },
      {
        id: 'hsc-bom-2',
        name: { bn: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র', en: 'Business Org. & Mgmt 2nd Paper' },
        icon: '📋',
        color: '#0369A1',
        rgb: '3, 105, 161',
        chapters: [
          makeChap('bom2-ch1', 'ব্যবস্থাপনার নীতি, পরিকল্পনা, সংগঠন, নেতৃত্ব, প্রেষণা ও নিয়ন্ত্রণ', 'Management Principles & Theories', [
            ['হেনরি ফেয়লের ১৪ নীতি ও মাসলোর চাহিদা সোপান', 'POSDCORB | মাসলোর ৫টি চাহিদা: জৈবিক → নিরাপত্তা → সামাজিক → আত্মতৃপ্তি → আত্মপ্রতিষ্ঠা', 'আধুনিক ব্যবস্থাপনার জনক হেনরি ফেয়ল এবং বৈজ্ঞানিক ব্যবস্থাপনার জনক এফ. ডব্লিউ. টেইলর।'],
          ]),
        ],
      },
      {
        id: 'hsc-pmm-1',
        name: { bn: 'উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম পত্র', en: 'Production Mgmt & Marketing 1st Paper' },
        icon: '🏭',
        color: '#4F46E5',
        rgb: '79, 70, 229',
        chapters: [
          makeChap('pmm1-ch1', 'উৎপাদন, উৎপাদনশীলতা ও উৎপাদনের উপকরণ', 'Production & Productivity Formulas', [
            ['উৎপাদনশীলতার সূত্রাবলি', 'মোট উৎপাদনশীলতা = মোট উৎপাদনের মূল্য ÷ মোট উপকরণের মূল্য | শ্রমের উৎপাদনশীলতা = মোট উৎপাদন ÷ মোট শ্রমঘণ্টা', 'উৎপাদনের ৪টি উপকরণ: ভূমি, শ্রম, মূলধন ও সংগঠন।'],
          ]),
        ],
      },
      {
        id: 'hsc-pmm-2',
        name: { bn: 'উৎপাদন ব্যবস্থাপনা ও বিপণন ২য় পত্র', en: 'Production Mgmt & Marketing 2nd Paper' },
        icon: '🛍️',
        color: '#6366F1',
        rgb: '99, 102, 241',
        chapters: [
          makeChap('pmm2-ch1', 'বিপণন পরিচিতি, বিপণন কার্যাবলি ও বিপণন মিশ্রণ (4Ps)', 'Marketing Mix & Functions', [
            ['বিপণন মিশ্রণ (4Ps)', 'Product (পণ্য) | Price (মূল্য) | Place (স্থান/বণ্টন) | Promotion (প্রসার)', 'ই. জেরোম ম্যাককার্থি বিপণন মিশ্রণের 4P ধারণা প্রদান করেন।'],
          ]),
        ],
      },
      ...COMMON_HSC_SUBJECTS,
    ],

    Humanities: [
      {
        id: 'hsc-eco-1',
        name: { bn: 'অর্থনীতি ১ম পত্র', en: 'Economics 1st Paper' },
        icon: '📈',
        color: '#A21CAF',
        rgb: '162, 28, 175',
        chapters: [
          makeChap('eco1-ch1', 'চাহিদা, যোগান, স্থিতিস্থাপকতা, উৎপাদন ব্যয় ও জাতীয় আয়', 'Micro & Macroeconomics Formulas', [
            ['চাহিদা সমীকরণ, স্থিতিস্থাপকতা ও জাতীয় আয়', 'Q_d = a - bP | Q_s = c + dP | E_d = -(ΔQ/ΔP)×(P/Q) | GDP = C + I + G + (X - M) | গুণক k = 1/(1 - MPC)', 'MPC + MPS = 1 এবং NNP = GNP - অবচয় (CCA)।'],
          ]),
        ],
      },
      {
        id: 'hsc-eco-2',
        name: { bn: 'অর্থনীতি ২য় পত্র', en: 'Economics 2nd Paper' },
        icon: '🌏',
        color: '#86198F',
        rgb: '134, 25, 143',
        chapters: [
          makeChap('eco2-ch1', 'জনসংখ্যা তত্ত্ব, কৃষি, শিল্প ও মুদ্রাস্ফীতি', 'Bangladesh Economy Formulas', [
            ['জনসংখ্যার ঘনত্ব ও মুদ্রাস্ফীতির হার', 'জনসংখ্যার ঘনত্ব = মোট জনসংখ্যা ÷ মোট ক্ষেত্রফল | মুদ্রাস্ফীতির হার = [(CPI₂ - CPI₁) ÷ CPI₁] × 100%', 'ম্যালথাসের মতে জনসংখ্যা জ্যামিতিক হারে (১, ২, ৪, ৮) এবং খাদ্য গাণিতিক হারে (১, ২, ৩, ৪) বাড়ে।'],
          ]),
        ],
      },
      {
        id: 'hsc-civ-1',
        name: { bn: 'পৌরনীতি ও সুশাসন ১ম পত্র', en: 'Civics & Good Governance 1st Paper' },
        icon: '⚖️',
        color: '#0F766E',
        rgb: '15, 118, 110',
        chapters: [
          makeChap('civ1-ch1', 'পৌরনীতি, সুশাসন, আইন, স্বাধীনতা, সংবিধান ও সরকারের অঙ্গসমূহ', 'Civics 1st Paper Core Rules', [
            ['উৎপত্তি ও ক্ষমতা স্বতন্ত্রীকরণ নীতি', 'Civics শব্দটি ল্যাটিন Civis ও Civitas থেকে এসেছে | মন্টেস্কুর ক্ষমতা স্বতন্ত্রীকরণ নীতি (১৭৪৮)', 'বিশ্বব্যাংক ১৯৮৯ সালে সর্বপ্রথম সুশাসন (Good Governance) ধারণাটি প্রবর্তন করে।'],
          ]),
        ],
      },
      {
        id: 'hsc-civ-2',
        name: { bn: 'পৌরনীতি ও সুশাসন ২য় পত্র', en: 'Civics & Good Governance 2nd Paper' },
        icon: '🏛️',
        color: '#115E59',
        rgb: '17, 94, 89',
        chapters: [
          makeChap('civ2-ch1', 'ব্রিটিশ ভারত, ভাষা আন্দোলন, মুক্তিযুদ্ধ ও বাংলাদেশের সংবিধান', 'Civics 2nd Paper Milestones', [
            ['ঐতিহাসিক সনদ ও সংবিধান', 'লাহোর প্রস্তাব: ১৯৪০ | ৬ দফা: ১৯৬৬ | সংবিধান গৃহীত: ৪ নভেম্বর ১৯৭২ (কার্যকর: ১৬ ডিসেম্বর ১৯৭২)', 'বাংলাদেশের সংবিধানে ১১টি ভাগ, ১৫৩টি অনুচ্ছেদ ও ৭টি তফসিল আছে।'],
          ]),
        ],
      },
      ...COMMON_HSC_SUBJECTS,
    ],
  },

  SSC: {
    Science: [
      {
        id: 'ssc-phy',
        name: { bn: 'পদার্থবিজ্ঞান (Physics)', en: 'Physics' },
        icon: '⚛️',
        color: '#1D4ED8',
        rgb: '29, 78, 216',
        chapters: [
          makeChap('ssc-phy-1', 'গতি, বল, কাজ-ক্ষমতা-শক্তি, চাপ, তাপ, তরঙ্গ, আলো ও চল তড়িৎ', 'SSC Physics All Formulas', [
            ['গতি, বল, তাপ, আলো ও তড়িৎ সূত্র', 'v = u + at | s = ut + ½at² | v² = u² + 2as | F = ma | P = hρg | C/5 = (F-32)/9 | 1/u + 1/v = 1/f | V = IR', 'বৈদ্যুতিক ইউনিট BOT = (P × t) / 1000 kWh।'],
          ]),
        ],
      },
      {
        id: 'ssc-chem',
        name: { bn: 'রসায়ন (Chemistry)', en: 'Chemistry' },
        icon: '🧪',
        color: '#059669',
        rgb: '5, 150, 105',
        chapters: [
          makeChap('ssc-chem-1', 'পদার্থের গঠন, মোলের ধারণা ও রাসায়নিক গণনা', 'SSC Chemistry Formulas', [
            ['মোল ও মোলারিটি সূত্র', 'n = w / M = V / 22.4 L | S = (1000 × w) / (M × V) | কক্ষপথে সর্বোচ্চ ইলেকট্রন = 2n²', 'শতকরা সংযুতি = (পারমাণবিক ভর × পরমাণু সংখ্যা × ১০০) ÷ আণবিক ভর।'],
          ]),
        ],
      },
      {
        id: 'ssc-math',
        name: { bn: 'গণিত (General Math)', en: 'General Mathematics' },
        icon: '📐',
        color: '#D97706',
        rgb: '217, 119, 6',
        chapters: [
          makeChap('ssc-math-1', 'বীজগণিত, ধারা, ত্রিকোণমিতি ও পরিমিতি', 'SSC General Math Formulas', [
            ['ধারা, মুনাফা ও ত্রিকোণমিতি', 'সমান্তর সমষ্টি S_n = (n/2)[2a + (n-1)d] | সরল মুনাফা I = Pnr | চক্রবৃদ্ধি মূলধন C = P(1+r)ⁿ | sin²θ + cos²θ = 1', 'সমবাহু ত্রিভুজের ক্ষেত্রফল = (√3 / 4)a²।'],
          ]),
        ],
      },
      {
        id: 'ssc-hmath',
        name: { bn: 'উচ্চতর গণিত (Higher Math)', en: 'Higher Mathematics' },
        icon: '♾️',
        color: '#7C3AED',
        rgb: '124, 58, 237',
        chapters: [
          makeChap('ssc-hmath-1', 'ফাংশন, দ্বিপদী বিস্তৃতি, স্থানাঙ্ক জ্যামিতি ও সম্ভাবনা', 'SSC Higher Math Formulas', [
            ['দ্বিপদী ও সম্ভাবনা সূত্র', 'T_(r+1) = ⁿC_r xʳ | ঢাল m = (y₂ - y₁)/(x₂ - x₁) | সম্ভাবনা P(A) = অনুকূল ফলাফল ÷ মোট ফলাফল', '0 ≤ P(A) ≤ 1 এবং P(A) + P(A′) = 1।'],
          ]),
        ],
      },
      {
        id: 'ssc-bio',
        name: { bn: 'জীববিজ্ঞান (Biology)', en: 'Biology' },
        icon: '🧬',
        color: '#16A34A',
        rgb: '22, 163, 74',
        chapters: [
          makeChap('ssc-bio-1', 'জীবনীশক্তি, খাদ্য ও পুষ্টি (BMI ও BMR) এবং বংশগতি', 'SSC Biology Formulas', [
            ['BMI ও BMR সূত্র', 'BMI = ওজন (kg) ÷ [উচ্চতা (m)]² | পুরুষ BMR = 66 + (13.7×ওজন) + (5×উচ্চতা cm) - (6.8×বয়স)', 'নারী BMR = 655 + (9.6×ওজন) + (1.8×উচ্চতা cm) - (4.7×বয়স)।'],
          ]),
        ],
      },
      {
        id: 'ssc-ict',
        name: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', en: 'ICT (Single Paper)' },
        icon: '💻',
        color: '#0369A1',
        rgb: '3, 105, 161',
        chapters: [
          makeChap('ssc-ict-1', 'ই-লার্নিং, কম্পিউটার রক্ষণাবেক্ষণ ও স্প্রেডশিট', 'SSC ICT Formulas', [
            ['স্প্রেডশিট সূত্রাবলি', 'যোগফল: =SUM(A1:A10) | গড়: =AVERAGE(A1:A10) | গুণফল: =PRODUCT(A1:B1)', 'সকল ফর্মুলার শুরুতে সমান (=) চিহ্ন দিতে হয়।'],
          ]),
        ],
      },
    ],

    'Business Studies': [
      {
        id: 'ssc-acc',
        name: { bn: 'হিসাববিজ্ঞান (Accounting)', en: 'Accounting' },
        icon: '📊',
        color: '#4D7C0F',
        rgb: '77, 124, 15',
        chapters: [
          makeChap('ssc-acc-1', 'লেনদেন, দুতরফা দাখিলা, রেওয়ামিল ও আর্থিক বিবরণী', 'SSC Accounting Formulas', [
            ['হিসাব সমীকরণ', 'A = L + E  |  E = C + R - Ex - D', 'সম্পদ ও ব্যয় বৃদ্ধি পেলে ডেবিট; আয়, দায় ও মালিকানা স্বত্ব বৃদ্ধি পেলে ক্রেডিট।'],
          ]),
        ],
      },
      {
        id: 'ssc-fin',
        name: { bn: 'ফিন্যান্স ও ব্যাংকিং', en: 'Finance & Banking' },
        icon: '💰',
        color: '#D97706',
        rgb: '217, 119, 6',
        chapters: [
          makeChap('ssc-fin-1', 'অর্থের সময়মূল্য, ঝুঁকি ও মূলধন বাজেটিং', 'SSC Finance Formulas', [
            ['সময়মূল্য ও গড় মুনাফার হার', 'FV = PV(1 + i)ⁿ | PV = FV / (1 + i)ⁿ | গড় মুনাফার হার = (গড় নিট মুনাফা ÷ গড় বিনিয়োগ) × ১০০', 'পে-ব্যাক সময় = বিনিয়োগ ÷ বার্ষিক নগদ আন্তঃপ্রবাহ।'],
          ]),
        ],
      },
    ],

    Humanities: [
      {
        id: 'ssc-eco',
        name: { bn: 'অর্থনীতি ও পৌরনীতি', en: 'Economics & Civics' },
        icon: '📈',
        color: '#A21CAF',
        rgb: '162, 28, 175',
        chapters: [
          makeChap('ssc-eco-1', 'চাহিদা, যোগান, জাতীয় আয় ও নাগরিকতা', 'SSC Humanities Formulas', [
            ['জাতীয় আয় ও চাহিদা বিধি', 'GDP = C + I + G + (X - M) | NNP = GNP - অবচয়', 'দাম বাড়লে চাহিদা কমে এবং দাম কমলে চাহিদা বাড়ে।'],
          ]),
        ],
      },
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
  const clsObj = BUILTIN_SYLLABUS[selectedClass] || BUILTIN_SYLLABUS.HSC;
  const baseSubjects = clsObj[selectedGroup] || clsObj.Science || [];

  const customMap = storeState?.customSubjects?.[selectedClass]?.[selectedGroup] || [];
  if (customMap.length === 0) return baseSubjects;

  const merged = baseSubjects.map((b) => {
    const customMatch = customMap.find((c) => c.id === b.id);
    if (!customMatch) return b;
    return {
      ...b,
      chapters: customMatch.chapters.length > 0 ? customMatch.chapters : b.chapters,
    };
  });

  customMap.forEach((c) => {
    if (!merged.some((m) => m.id === c.id)) {
      merged.push(c);
    }
  });

  return merged;
}

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
        id: data?.user?.id || `user-${Date.now()}`,
        name: params.name || data?.user?.user_metadata?.full_name || params.email.split('@')[0],
        email: params.email,
      };
    } else {
      const { data, error } = await client.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });
      if (error) throw error;
      if (data?.user) {
        return {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || params.email.split('@')[0],
          email: params.email,
        };
      }
    }
  }

  return {
    id: `user-${Date.now()}`,
    name: params.name || params.email.split('@')[0],
    email: params.email,
  };
}

export const UI_DICT: Record<string, { en: string; bn: string }> = {
  nav_dashboard: { en: 'Dashboard', bn: 'হোম ড্যাশবোর্ড' },
  nav_subjects: { en: 'Subjects', bn: 'বিষয়সমূহ' },
  nav_analytics: { en: 'Analytics', bn: 'পারফরম্যান্স' },
  nav_mistakes: { en: 'Mistake Bank', bn: 'ভুলের খাতা' },
  nav_flashcards: { en: 'Flashcards', bn: 'ফ্ল্যাশকার্ড' },
  nav_formulas: { en: 'Formula Sheet', bn: 'সূত্রসমূহ' },
  nav_planner: { en: 'Study Planner', bn: 'পড়ার রুটিন' },
  nav_battle: { en: '1v1 Battle', bn: '১v১ কুইজ ব্যাটল' },
  nav_community: { en: 'Doubt Forum', bn: 'প্রশ্নোত্তর ফোরাম' },
  nav_leaderboard: { en: 'Leaderboard', bn: 'লিডারবোর্ড' },
  nav_achievements: { en: 'Rank & Badges', bn: 'র‍্যাঙ্ক ও ব্যাজ' },
  nav_more: { en: 'More', bn: 'আরও' },

  welcome_back: { en: 'Welcome', bn: 'স্বাগতম' },
  sign_in: { en: 'Sign In', bn: 'সাইন ইন' },
  sign_out: { en: 'Sign Out', bn: 'লগ আউট' },
  streak_days: { en: 'Day Streak', bn: 'দিনের স্ট্রিক' },
  personal_rank: { en: 'Personal Rank', bn: 'ব্যক্তিগত র‍্যাঙ্ক' },
  leaderboard_pos: { en: 'Leaderboard Position', bn: 'লিডারবোর্ড অবস্থান' },

  choose_class_group: { en: 'Class & Group', bn: 'শ্রেণি ও বিভাগ' },
  all_subjects: { en: 'Your Subjects', bn: 'তোমার বিষয়সমূহ' },
  chapters_count: { en: 'Chapters', bn: 'অধ্যায়' },
  questions_count: { en: 'MCQs', bn: 'প্রশ্ন' },
  start_practice: { en: 'Start Practice', bn: 'অনুশীলন শুরু' },
  daily_challenge: { en: 'Daily Merit Sprint', bn: 'ডেইলি মেরিট স্প্রিন্ট' },
  quick_mock: { en: 'Quick Mock Exam', bn: 'কুইক মক টেস্ট' },
  mastery: { en: 'Mastery', bn: 'দক্ষতা' },
  accuracy: { en: 'Accuracy', bn: 'সঠিকতা' },
  consistency: { en: 'Consistency', bn: 'ধারাবাহিকতা' },
  rank_points: { en: 'Rank Score', bn: 'র‍্যাঙ্ক স্কোর' },

  question: { en: 'Question', bn: 'প্রশ্ন' },
  time_left: { en: 'Time Left', bn: 'বাকি সময়' },
  question_palette: { en: 'Question Navigator', bn: 'প্রশ্ন নেভিগেটর' },
  submit_exam: { en: 'Submit Exam', bn: 'জমা দাও' },
  prev_q: { en: 'Previous', bn: 'পূর্ববর্তী' },
  next_q: { en: 'Next', bn: 'পরবর্তী' },
  flag_q: { en: 'Mark', bn: 'মার্ক' },
  answered: { en: 'Answered', bn: 'উত্তরকৃত' },
  unanswered: { en: 'Unanswered', bn: 'বাকি' },

  global_ranking: { en: 'Global', bn: 'সর্বজনীন' },
  friends_ranking: { en: 'Friends', bn: 'বন্ধু তালিকা' },
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
    return text.bn && text.en && text.bn !== text.en ? `${text.bn} • ${text.en}` : text.bn || text.en;
  }
  return text.en || text.bn;
}

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

  adminPin: string;
  isAdminUnlocked: boolean;
  customSubjects: Record<string, Record<string, SubjectData[]>>;
  questionReports: QuestionReportItem[];
  adminUsersList: AdminUserRecord[];

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

  submitQuestionReport: (payload: Omit<QuestionReportItem, 'id' | 'createdAt' | 'status'>) => void;
  resolveQuestionReport: (reportId: string) => void;
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
    icon?: string;
    color?: string;
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
    optionsBn: [string, string, string, string];
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
    explanationBn?: string;
  }) => void;
  deleteCustomMcq: (
    targetClass: string,
    targetGroup: string,
    subjectId: string,
    chapterId: string,
    questionId: string
  ) => void;
  deleteCustomSubject: (targetClass: string, targetGroup: string, subjectId: string) => void;
  updateAdminUserRecord: (userId: string, updates: Partial<AdminUserRecord>) => void;
  exportProjectSyllabusCode: () => string;
  resetAllDemoAndProgress: () => void;
}

const STORAGE_KEY = 'examverse-v4-clean-storage';
const listeners = new Set<() => void>();

function loadPersisted(): Partial<ExamStoreState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
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
      isAdminUnlocked: state.isAdminUnlocked,
      customSubjects: state.customSubjects,
      questionReports: state.questionReports,
      adminUsersList: state.adminUsersList,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(subset));
  } catch {}
}

async function syncCustomSubjectsToCloud(customSubjects: Record<string, Record<string, SubjectData[]>>) {
  try {
    const supaMod = RawSupabase as any;
    const client = supaMod?.supabase;
    if (!client) return;
    await client.from('app_config').upsert({
      key: 'custom_syllabus_v4',
      value_json: customSubjects,
      updated_at: new Date().toISOString(),
    });
  } catch {}
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
  selectedGroup: saved.selectedGroup ?? 'Science',
  activeTab: typeof window !== 'undefined' && window.location.hash === '#admin' ? 'admin' : 'dashboard',

  /* ZERO DEMO DATA BY DEFAULT */
  xp: saved.xp ?? 0,
  streak: saved.streak ?? 0,
  lastActiveDate: saved.lastActiveDate ?? '',
  examHistory: saved.examHistory ?? [],
  mistakes: saved.mistakes ?? [],
  flashcards: saved.flashcards ?? [],
  studyTasks: saved.studyTasks ?? [],
  communityPosts: saved.communityPosts ?? [],
  bookmarks: saved.bookmarks ?? [],
  chapterMastery: saved.chapterMastery ?? {},
  friendsList: saved.friendsList ?? [],

  adminPin: saved.adminPin ?? 'admin2026',
  isAdminUnlocked: saved.isAdminUnlocked ?? false,
  customSubjects: saved.customSubjects ?? {},
  questionReports: saved.questionReports ?? [],
  adminUsersList: saved.adminUsersList ?? [],

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
    const streakIncrement = storeState.lastActiveDate !== today && result.total > 0 ? 1 : 0;
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

  addFlashcard: (frontBn, backBn, subjectId = 'general') =>
    setState({
      flashcards: [
        {
          id: `fc-${Date.now()}`,
          subjectId,
          front: { bn: frontBn, en: frontBn },
          back: { bn: backBn, en: backBn },
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
      studyTasks: [{ ...task, id: `task-${Date.now()}`, completed: false }, ...storeState.studyTasks],
    }),

  toggleStudyTask: (id) =>
    setState({
      studyTasks: storeState.studyTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
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
          createdAt: new Date().toLocaleDateString('bn-BD'),
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
              replies: [
                ...p.replies,
                { id: `rep-${Date.now()}`, authorName, text, createdAt: new Date().toLocaleDateString('bn-BD') },
              ],
            }
          : p
      ),
    }),

  togglePostLike: (postId) =>
    setState({
      communityPosts: storeState.communityPosts.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)),
    }),

  addFriendByCode: (friendName) => {
    const clean = friendName.trim();
    if (!clean || storeState.friendsList.includes(clean)) return;
    setState({ friendsList: [...storeState.friendsList, clean] });
  },

  getRankInfo: () => {
    const history = storeState.examHistory;
    const avgAccuracy = history.length > 0 ? history.reduce((sum, h) => sum + h.accuracy, 0) / history.length : 0;
    const masteredCount = Object.values(storeState.chapterMastery).filter((v) => v >= 75).length;

    return calculateUserRank({
      xp: storeState.xp,
      accuracyPct: avgAccuracy,
      masteredChaptersCount: masteredCount,
      streakDays: storeState.streak,
      examsCompleted: history.length,
    });
  },

  submitQuestionReport: (payload) => {
    const report: QuestionReportItem = {
      ...payload,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'pending',
    };
    setState({ questionReports: [report, ...storeState.questionReports] });
    try {
      const supaMod = RawSupabase as any;
      supaMod?.supabase?.from('question_reports')?.insert({
        question_id: payload.questionId,
        subject_id: payload.subjectId,
        issue_type: payload.issueType,
        details: payload.comment,
        reported_by: payload.reportedBy,
      });
    } catch {}
  },

  resolveQuestionReport: (reportId) =>
    setState({
      questionReports: storeState.questionReports.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r)),
    }),

  deleteQuestionReport: (reportId) =>
    setState({
      questionReports: storeState.questionReports.filter((r) => r.id !== reportId),
    }),

  unlockAdmin: (pin) => {
    if (pin.trim() === storeState.adminPin) {
      setState({ isAdminUnlocked: true });
      return true;
    }
    return false;
  },

  lockAdmin: () => setState({ isAdminUnlocked: false, activeTab: 'dashboard' }),

  setAdminPin: (newPin) => {
    if (newPin.trim().length >= 4) {
      setState({ adminPin: newPin.trim() });
    }
  },

  importBulkMcqs: ({
    targetClass,
    targetGroup,
    subjectId,
    subjectNameBn,
    subjectNameEn,
    icon = '📘',
    color = '#4F46E5',
    rawText,
  }) => {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const optMap: Record<string, number> = {
      ক: 0, খ: 1, গ: 2, ঘ: 3,
      a: 0, b: 1, c: 2, d: 3,
      '1': 0, '2': 1, '3': 2, '4': 3,
    };

    const parsedByChapter: Record<string, MCQQuestion[]> = {};
    let addedQuestions = 0;

    lines.forEach((line, idx) => {
      const cols = line.includes('\t')
        ? line.split('\t').map((c) => c.trim())
        : line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());

      if (cols.length < 6) return;
      const firstLower = cols[0].toLowerCase();
      if (firstLower === 'question_id' || firstLower === 'chapter' || firstLower === 'অধ্যায়') return;

      let chName = '';
      let qText = '';
      let optA = '';
      let optB = '';
      let optC = '';
      let optD = '';
      let ansRaw = '';
      let boardTag = '';
      let expText = '';

      if (cols.length >= 9 && (cols[0].includes('-') || /^\d+$/.test(cols[1]))) {
        chName = cols[2] || 'অধ্যায় ১';
        qText = cols[3] || '';
        optA = cols[4] || '';
        optB = cols[5] || '';
        optC = cols[6] || '';
        optD = cols[7] || '';
        ansRaw = (cols[8] || '').toLowerCase();
        boardTag = cols[10] || '';
      } else {
        chName = cols[0] || 'অধ্যায় ১';
        qText = cols[1] || '';
        optA = cols[2] || '';
        optB = cols[3] || '';
        optC = cols[4] || '';
        optD = cols[5] || '';
        ansRaw = (cols[6] || '').toLowerCase();
        boardTag = cols[7] || '';
        expText = cols[8] || '';
      }

      if (!qText || !optA) return;
      const ans = optMap[ansRaw] ?? 0;

      if (!parsedByChapter[chName]) parsedByChapter[chName] = [];
      parsedByChapter[chName].push({
        id: `${subjectId}-q-${Date.now()}-${idx}`,
        q: { bn: qText, en: qText },
        options: { bn: [optA, optB, optC, optD], en: [optA, optB, optC, optD] },
        ans,
        boardTag: boardTag || undefined,
        explanation: expText ? { bn: expText, en: expText } : undefined,
      });
      addedQuestions++;
    });

    const chapterKeys = Object.keys(parsedByChapter);
    if (chapterKeys.length === 0) return { addedQuestions: 0, addedChapters: 0 };

    const nextCustom = { ...storeState.customSubjects };
    if (!nextCustom[targetClass]) nextCustom[targetClass] = {};
    const groupList = [...(nextCustom[targetClass][targetGroup] || [])];

    const existingSubjIdx = groupList.findIndex((s) => s.id === subjectId);
    const builtinSubj = (BUILTIN_SYLLABUS[targetClass]?.[targetGroup] || []).find((s) => s.id === subjectId);

    const baseChapters: ChapterData[] =
      existingSubjIdx >= 0
        ? [...groupList[existingSubjIdx].chapters]
        : builtinSubj
        ? builtinSubj.chapters.map((c) => ({ ...c, mcqs: [...c.mcqs] }))
        : [];

    chapterKeys.forEach((cName, cIdx) => {
      const foundChIdx = baseChapters.findIndex((c) => c.name.bn === cName || c.name.en === cName);
      if (foundChIdx >= 0) {
        baseChapters[foundChIdx] = {
          ...baseChapters[foundChIdx],
          mcqs: [...baseChapters[foundChIdx].mcqs, ...parsedByChapter[cName]],
        };
      } else {
        baseChapters.push({
          id: `${subjectId}-ch-${Date.now()}-${cIdx}`,
          name: { bn: cName, en: cName },
          mcqs: parsedByChapter[cName],
          cqs: [],
          formulas: [],
        });
      }
    });

    const newSubjectObj: SubjectData = {
      id: subjectId,
      name: { bn: subjectNameBn, en: subjectNameEn || subjectNameBn },
      icon: builtinSubj?.icon || icon,
      color: builtinSubj?.color || color,
      chapters: baseChapters,
    };

    if (existingSubjIdx >= 0) groupList[existingSubjIdx] = newSubjectObj;
    else groupList.push(newSubjectObj);

    nextCustom[targetClass][targetGroup] = groupList;
    setState({ customSubjects: nextCustom });
    syncCustomSubjectsToCloud(nextCustom);

    return { addedQuestions, addedChapters: chapterKeys.length };
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
    const rawLine = [
      chapterNameBn,
      questionBn,
      optionsBn[0],
      optionsBn[1],
      optionsBn[2],
      optionsBn[3],
      ['ক', 'খ', 'গ', 'ঘ'][ansIndex] || 'ক',
      boardTag || '',
      explanationBn || '',
    ].join('\t');

    storeState.importBulkMcqs({
      targetClass,
      targetGroup,
      subjectId,
      subjectNameBn,
      subjectNameEn,
      rawText: rawLine,
    });
  },

  updateCustomMcqAnswer: (targetClass, targetGroup, subjectId, chapterId, questionId, newAnsIndex) => {
    const nextCustom = { ...storeState.customSubjects };
    if (!nextCustom[targetClass]) nextCustom[targetClass] = {};
    let groupList = [...(nextCustom[targetClass][targetGroup] || [])];

    if (!groupList.some((s) => s.id === subjectId)) {
      const builtin = (BUILTIN_SYLLABUS[targetClass]?.[targetGroup] || []).find((s) => s.id === subjectId);
      if (builtin) groupList.push(JSON.parse(JSON.stringify(builtin)));
    }

    nextCustom[targetClass][targetGroup] = groupList.map((s) =>
      s.id !== subjectId
        ? s
        : {
            ...s,
            chapters: s.chapters.map((ch) =>
              ch.id !== chapterId
                ? ch
                : { ...ch, mcqs: ch.mcqs.map((q) => (q.id === questionId ? { ...q, ans: newAnsIndex } : q)) }
            ),
          }
    );
    setState({ customSubjects: nextCustom });
    syncCustomSubjectsToCloud(nextCustom);
  },

  editCustomMcqFull: ({
    targetClass,
    targetGroup,
    subjectId,
    chapterId,
    questionId,
    questionBn,
    optionsBn,
    ansIndex,
    explanationBn,
  }) => {
    const nextCustom = { ...storeState.customSubjects };
    if (!nextCustom[targetClass]) nextCustom[targetClass] = {};
    let groupList = [...(nextCustom[targetClass][targetGroup] || [])];

    if (!groupList.some((s) => s.id === subjectId)) {
      const builtin = (BUILTIN_SYLLABUS[targetClass]?.[targetGroup] || []).find((s) => s.id === subjectId);
      if (builtin) groupList.push(JSON.parse(JSON.stringify(builtin)));
    }

    nextCustom[targetClass][targetGroup] = groupList.map((s) =>
      s.id !== subjectId
        ? s
        : {
            ...s,
            chapters: s.chapters.map((ch) =>
              ch.id !== chapterId
                ? ch
                : {
                    ...ch,
                    mcqs: ch.mcqs.map((q) =>
                      q.id === questionId
                        ? {
                            ...q,
                            q: { bn: questionBn, en: questionBn },
                            options: { bn: optionsBn, en: optionsBn },
                            ans: ansIndex,
                            explanation: explanationBn ? { bn: explanationBn, en: explanationBn } : q.explanation,
                          }
                        : q
                    ),
                  }
            ),
          }
    );
    setState({ customSubjects: nextCustom });
    syncCustomSubjectsToCloud(nextCustom);
  },

  deleteCustomMcq: (targetClass, targetGroup, subjectId, chapterId, questionId) => {
    const nextCustom = { ...storeState.customSubjects };
    if (!nextCustom[targetClass]?.[targetGroup]) return;
    nextCustom[targetClass][targetGroup] = nextCustom[targetClass][targetGroup].map((s) =>
      s.id !== subjectId
        ? s
        : {
            ...s,
            chapters: s.chapters.map((ch) =>
              ch.id !== chapterId ? ch : { ...ch, mcqs: ch.mcqs.filter((q) => q.id !== questionId) }
            ),
          }
    );
    setState({ customSubjects: nextCustom });
    syncCustomSubjectsToCloud(nextCustom);
  },

  deleteCustomSubject: (targetClass, targetGroup, subjectId) => {
    const nextCustom = { ...storeState.customSubjects };
    if (!nextCustom[targetClass]?.[targetGroup]) return;
    nextCustom[targetClass][targetGroup] = nextCustom[targetClass][targetGroup].filter((s) => s.id !== subjectId);
    setState({ customSubjects: nextCustom });
    syncCustomSubjectsToCloud(nextCustom);
  },

  updateAdminUserRecord: (userId, updates) => {
    setState({
      adminUsersList: storeState.adminUsersList.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
    });
  },

  exportProjectSyllabusCode: () => {
    const mergedSyllabus: Record<string, Record<string, SubjectData[]>> = {};
    Object.keys(BUILTIN_SYLLABUS).forEach((cls) => {
      mergedSyllabus[cls] = {};
      Object.keys(BUILTIN_SYLLABUS[cls]).forEach((grp) => {
        mergedSyllabus[cls][grp] = getSubjectsForSelection(cls, grp);
      });
    });
    return `// Auto-Generated ExamVerse Project Syllabus File (src/data/syllabusData.ts)\nexport const SYLLABUS_DB = ${JSON.stringify(
      mergedSyllabus,
      null,
      2
    )};\n`;
  },

  resetAllDemoAndProgress: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('examverse-v3-storage');
    }
    setState({
      xp: 0,
      streak: 0,
      lastActiveDate: '',
      examHistory: [],
      mistakes: [],
      flashcards: [],
      studyTasks: [],
      communityPosts: [],
      bookmarks: [],
      chapterMastery: {},
      friendsList: [],
    });
  },
};

function setState(partial: Partial<ExamStoreState>) {
  storeState = { ...storeState, ...partial };
  savePersisted(storeState);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ExamStoreState {
  return storeState;
}

export function useExamStore(): ExamStoreState;
export function useExamStore<T>(selector: (state: ExamStoreState) => T): T;
export function useExamStore<T>(selector?: (state: ExamStoreState) => T) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return selector ? selector(state) : state;
}

export const useAppStore = useExamStore;

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};
