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
  | 'achievements';

/* =====================================================================
   MULTI-FACTOR RANK PROGRESSION ENGINE (Bronze -> Silver -> Gold -> Platinum -> Elite)
   Evaluates: XP (40%) + Accuracy % (25%) + Mastery % (20%) + Consistency (15%)
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
    {
      id: 'bronze',
      en: 'Bronze',
      bn: 'ব্রোঞ্জ',
      min: 0,
      max: 199,
      colorHex: '#B45309',
      bgSoft: 'rgba(180, 83, 9, 0.13)',
    },
    {
      id: 'silver',
      en: 'Silver',
      bn: 'সিলভার',
      min: 200,
      max: 399,
      colorHex: '#475569',
      bgSoft: 'rgba(71, 85, 105, 0.14)',
    },
    {
      id: 'gold',
      en: 'Gold',
      bn: 'গোল্ড',
      min: 400,
      max: 649,
      colorHex: '#D97706',
      bgSoft: 'rgba(217, 119, 6, 0.15)',
    },
    {
      id: 'platinum',
      en: 'Platinum',
      bn: 'প্লাটিনাম',
      min: 650,
      max: 849,
      colorHex: '#0284C7',
      bgSoft: 'rgba(2, 132, 199, 0.14)',
    },
    {
      id: 'elite',
      en: 'Elite',
      bn: 'এলিট',
      min: 850,
      max: 1000,
      colorHex: '#7C3AED',
      bgSoft: 'rgba(124, 58, 237, 0.15)',
    },
  ];

  const current =
    tiers.find((t) => rankScore >= t.min && rankScore <= t.max) || tiers[tiers.length - 1];
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

/* =====================================================================
   SYLLABUS ADAPTER (Works seamlessly with any syllabusData.ts format)
   ===================================================================== */
const FALLBACK_SUBJECTS: SubjectData[] = [
  {
    id: 'physics',
    name: { en: 'Physics', bn: 'পদার্থবিজ্ঞান' },
    icon: '⚛️',
    color: '#4F46E5',
    chapters: [
      {
        id: 'phy-1',
        name: { en: 'Physical World & Measurement', bn: 'ভৌত জগৎ ও পরিমাপ' },
        mcqs: [
          {
            id: 'q-phy-1',
            q: { en: 'Which is a fundamental unit in SI?', bn: 'নিচের কোনটি মৌলিক একক?' },
            options: {
              en: ['Joule', 'Ampere', 'Newton', 'Watt'],
              bn: ['জুল (Joule)', 'অ্যাম্পিয়ার (Ampere)', 'নিউটন (Newton)', 'ওয়াট (Watt)'],
            },
            ans: 1,
            explanation: {
              en: 'Ampere is one of the 7 SI base units.',
              bn: 'তড়িৎ প্রবাহের একক অ্যাম্পিয়ার হলো ৭টি মৌলিক এককের একটি।',
            },
          },
          {
            id: 'q-phy-2',
            q: { en: 'Dimension of force is —', bn: 'বলের মাত্রা সমীকরণ কোনটি?' },
            options: {
              en: ['MLT⁻²', 'ML²T⁻²', 'MLT⁻¹', 'ML⁻¹T⁻²'],
              bn: ['[MLT⁻²]', '[ML²T⁻²]', '[MLT⁻¹]', '[ML⁻¹T⁻²]'],
            },
            ans: 0,
            explanation: {
              en: 'Force = mass × acceleration = [M][LT⁻²] = [MLT⁻²].',
              bn: 'বল F = ma অনুসারে বলের মাত্রা [MLT⁻²]।',
            },
          },
        ],
        cqs: [
          {
            id: 'cq-phy-1',
            stem: {
              en: 'A slide calipers has main scale reading 4.2 cm and vernier constant 0.01 cm.',
              bn: 'একটি স্লাইড ক্যালিপার্সের প্রধান স্কেল পাঠ 4.2 cm এবং ভার্নিয়ার ধ্রুবক 0.01 cm।',
            },
            a: { en: 'What is vernier constant?', bn: 'ভার্নিয়ার ধ্রুবক কাকে বলে?' },
            b: { en: 'Why is backlight error seen in screw gauge?', bn: 'পিচ ও লঘিষ্ঠ গণনের পার্থক্য লেখো।' },
            c: { en: 'Determine the measured length if vernier coincidence is 6.', bn: 'ভার্নিয়ার সমপাতন 6 হলে দণ্ডটির দৈর্ঘ্য নির্ণয় করো।' },
            d: { en: 'Analyze percentage error in volume measurement.', bn: 'আয়তন পরিমাপে আপেক্ষিক ত্রুটির প্রভাব বিশ্লেষণ করো।' },
          },
        ],
      },
    ],
  },
  {
    id: 'chemistry',
    name: { en: 'Chemistry', bn: 'রসায়ন' },
    icon: '🧪',
    color: '#059669',
    chapters: [
      {
        id: 'chem-1',
        name: { en: 'Safe Use of Laboratory', bn: 'ল্যাবরেটরির নিরাপদ ব্যবহার' },
        mcqs: [
          {
            id: 'q-chem-1',
            q: { en: 'What is the primary reagent in a 4-digit balance?', bn: 'পল-বুঙ্গি ব্যালেন্সে সর্বনিম্ন কত ভর মাপা যায়?' },
            options: {
              en: ['0.1 g', '0.01 g', '0.001 g', '0.0001 g'],
              bn: ['0.1 g', '0.01 g', '0.001 g', '0.0001 g'],
            },
            ans: 2,
            explanation: {
              en: 'Paul-Bunge balance measures down to 0.001 g (1 mg).',
              bn: 'পল-বুঙ্গি ব্যালেন্সে 1 mg বা 0.001 g পর্যন্ত নিখুঁত ভর মাপা যায়।',
            },
          },
        ],
        cqs: [],
      },
    ],
  },
  {
    id: 'math',
    name: { en: 'Higher Math', bn: 'উচ্চতর গণিত' },
    icon: '📐',
    color: '#D97706',
    chapters: [
      {
        id: 'math-1',
        name: { en: 'Matrices & Determinants', bn: 'ম্যাট্রিক্স ও নির্ণায়ক' },
        mcqs: [
          {
            id: 'q-math-1',
            q: { en: 'If |A| = 0, matrix A is called —', bn: 'কোনো বর্গ ম্যাট্রিক্স A-এর নির্ণায়ক |A| = 0 হলে তাকে কী বলে?' },
            options: {
              en: ['Singular Matrix', 'Identity Matrix', 'Scalar Matrix', 'Symmetric Matrix'],
              bn: ['ব্যতিক্রমী ম্যাট্রিক্স', 'অভেদক ম্যাট্রিক্স', 'স্কেলার ম্যাট্রিক্স', 'প্রতিসম ম্যাট্রিক্স'],
            },
            ans: 0,
            explanation: {
              en: 'A square matrix with determinant 0 is a singular matrix.',
              bn: 'নির্ণায়কের মান শূন্য হলে ম্যাট্রিক্সটি ব্যতিক্রমী (Singular)।',
            },
          },
        ],
        cqs: [],
      },
    ],
  },
  {
    id: 'biology',
    name: { en: 'Biology', bn: 'জীববিজ্ঞান' },
    icon: '🧬',
    color: '#E11D48',
    chapters: [
      {
        id: 'bio-1',
        name: { en: 'Cell & Its Structure', bn: 'কোষ ও এর গঠন' },
        mcqs: [
          {
            id: 'q-bio-1',
            q: { en: 'Which organelle is the powerhouse of the cell?', bn: 'কোষের পাওয়ার হাউস বলা হয় কোন অঙ্গাণুকে?' },
            options: {
              en: ['Ribosome', 'Mitochondria', 'Golgi Body', 'Lysosome'],
              bn: ['রাইবোজোম', 'মাইটোকন্ড্রিয়া', 'গলগি বডি', 'লাইসোজোম'],
            },
            ans: 1,
            explanation: {
              en: 'Mitochondria produce ATP through cellular respiration.',
              bn: 'মাইটোকন্ড্রিয়ায় ক্রেবস চক্রের মাধ্যমে ATP শক্তি উৎপন্ন হয়।',
            },
          },
        ],
        cqs: [],
      },
    ],
  },
];

export function getAvailableClasses(): string[] {
  const mod = RawSyllabus as any;
  if (mod?.SYLLABUS_DB && typeof mod.SYLLABUS_DB === 'object') {
    return Object.keys(mod.SYLLABUS_DB);
  }
  return ['HSC', 'SSC', 'Admission'];
}

export function getAvailableGroups(selectedClass: string): string[] {
  const mod = RawSyllabus as any;
  if (mod?.SYLLABUS_DB?.[selectedClass]) {
    return Object.keys(mod.SYLLABUS_DB[selectedClass]);
  }
  return ['Science', 'Business', 'Humanities'];
}

export function getSubjectsForSelection(selectedClass: string, selectedGroup: string): SubjectData[] {
  const mod = RawSyllabus as any;

  // Case 1: Nested SYLLABUS_DB exists
  if (mod?.SYLLABUS_DB?.[selectedClass]?.[selectedGroup]) {
    return mod.SYLLABUS_DB[selectedClass][selectedGroup];
  }

  // Case 2: Flat SUBJECTS + QUESTIONS_DB + CQ_DB in syllabusData.ts
  if (Array.isArray(mod?.SUBJECTS) && mod.SUBJECTS.length > 0) {
    const allQuestions = Array.isArray(mod.QUESTIONS_DB) ? mod.QUESTIONS_DB : [];
    const allCqs = Array.isArray(mod.CQ_DB) ? mod.CQ_DB : [];
    const groupKey = selectedGroup.toLowerCase();

    const filteredRaw = mod.SUBJECTS.filter((s: any) => {
      if (!s.group || s.group === 'common' || s.group === 'all') return true;
      return String(s.group).toLowerCase().includes(groupKey.slice(0, 3));
    });

    const sourceList = filteredRaw.length > 0 ? filteredRaw : mod.SUBJECTS;

    return sourceList.map((rawSubj: any): SubjectData => {
      const chapters: ChapterData[] = (rawSubj.chapters || []).map((rawCh: any): ChapterData => {
        const chQuestions: MCQQuestion[] = allQuestions
          .filter((q: any) => q.subj === rawSubj.id && q.ch === rawCh.id)
          .map((q: any): MCQQuestion => ({
            id: String(q.id),
            q: {
              en: q.qEn || q.q || '',
              bn: q.q || q.qEn || '',
            },
            options: {
              en: Array.isArray(q.optsEn) ? q.optsEn : Array.isArray(q.opts) ? q.opts : [],
              bn: Array.isArray(q.opts) ? q.opts : Array.isArray(q.optsEn) ? q.optsEn : [],
            },
            ans: typeof q.ans === 'number' ? q.ans : 0,
            explanation: {
              en: q.expEn || q.exp || '',
              bn: q.exp || q.expEn || '',
            },
            boardTag: q.board,
          }));

        const chCqs: CQQuestion[] = allCqs
          .filter((c: any) => c.subj === rawSubj.id && c.ch === rawCh.id)
          .map((c: any): CQQuestion => ({
            id: String(c.id),
            stem: { en: c.stemEn || c.stem || '', bn: c.stem || c.stemEn || '' },
            a: { en: c.parts?.a?.qEn || c.parts?.a?.q || '', bn: c.parts?.a?.q || '' },
            b: { en: c.parts?.b?.qEn || c.parts?.b?.q || '', bn: c.parts?.b?.q || '' },
            c: { en: c.parts?.c?.qEn || c.parts?.c?.q || '', bn: c.parts?.c?.q || '' },
            d: { en: c.parts?.d?.qEn || c.parts?.d?.q || '', bn: c.parts?.d?.q || '' },
            ansA: { en: c.parts?.a?.ansEn || c.parts?.a?.ans || '', bn: c.parts?.a?.ans || '' },
            ansB: { en: c.parts?.b?.ansEn || c.parts?.b?.ans || '', bn: c.parts?.b?.ans || '' },
            ansC: { en: c.parts?.c?.ansEn || c.parts?.c?.ans || '', bn: c.parts?.c?.ans || '' },
            ansD: { en: c.parts?.d?.ansEn || c.parts?.d?.ans || '', bn: c.parts?.d?.ans || '' },
            boardTag: c.board,
          }));

        return {
          id: String(rawCh.id),
          name: {
            en: rawCh.nameEn || rawCh.name || 'Chapter',
            bn: rawCh.name || rawCh.nameEn || 'অধ্যায়',
          },
          mcqs: chQuestions.length > 0 ? chQuestions : FALLBACK_SUBJECTS[0].chapters[0].mcqs,
          cqs: chCqs,
        };
      });

      return {
        id: String(rawSubj.id),
        name: {
          en: rawSubj.nameEn || rawSubj.name || 'Subject',
          bn: rawSubj.name || rawSubj.nameEn || 'বিষয়',
        },
        icon: rawSubj.icon || '📘',
        color: rawSubj.color || '#4F46E5',
        chapters: chapters.length > 0 ? chapters : FALLBACK_SUBJECTS[0].chapters,
      };
    });
  }

  return FALLBACK_SUBJECTS;
}

/* =====================================================================
   SUPABASE AUTH ADAPTER (Safe even if offline or varied exports)
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
   PURE REACT EXTERNAL STORE (Zero external dependencies — no zustand needed!)
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
  selectedGroup: saved.selectedGroup ?? 'Science',
  activeTab: 'dashboard',

  xp: saved.xp ?? 640,
  streak: saved.streak ?? 5,
  lastActiveDate: saved.lastActiveDate ?? new Date().toISOString().slice(0, 10),
  examHistory: saved.examHistory ?? [
    {
      id: 'demo-1',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      subjectId: 'physics',
      subjectName: 'পদার্থবিজ্ঞান (Physics)',
      chapterId: 'phy-1',
      chapterName: 'ভৌত জগৎ ও পরিমাপ',
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
      subjectId: 'physics',
      front: { en: "Newton's Second Law Formula", bn: 'নিউটনের গতির দ্বিতীয় সূত্র' },
      back: { en: 'F = ma (Force = mass × acceleration)', bn: 'F = ma (বল = ভর × ত্বরণ)' },
      box: 2,
      nextReviewDate: new Date().toISOString().slice(0, 10),
    },
    {
      id: 'fc-2',
      subjectId: 'chemistry',
      front: { en: 'Ideal Gas Equation', bn: 'আদর্শ গ্যাস সমীকরণ' },
      back: { en: 'PV = nRT', bn: 'PV = nRT (চাপ × আয়তন = মোল × ধ্রুবক × তাপমাত্রা)' },
      box: 3,
      nextReviewDate: new Date().toISOString().slice(0, 10),
    },
  ],
  studyTasks: saved.studyTasks ?? [
    {
      id: 'st-1',
      title: 'ভেক্টর অধ্যায়ের ২৫টি বোর্ড MCQ সমাধান',
      subjectName: 'পদার্থবিজ্ঞান',
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
      subjectName: 'পদার্থবিজ্ঞান',
      title: 'প্রাসের গতিপথে সর্বোচ্চ উচ্চতায় বেগ ও ত্বরণের মধ্যবর্তী কোণ কত?',
      body: 'সর্বোচ্চ বিন্দুতে উল্লম্ব বেগ শূন্য হয়ে যায়, শুধুমাত্র অনুভূমিক বেগ থাকে। তাহলে অভিকর্ষজ ত্বরণ g-এর সাথে কোণ কি ৯০ ডিগ্রি হবে?',
      createdAt: '২ ঘণ্টা আগে',
      likes: 14,
      solved: true,
      replies: [],
    },
  ],
  bookmarks: saved.bookmarks ?? [],
  chapterMastery: saved.chapterMastery ?? { 'phy-1': 90, 'chem-1': 80, 'math-1': 75 },
  friendsList: saved.friendsList ?? ['তানভীর আহমেদ', 'নুসরাত জাহান', 'রাফি ইসলাম', 'সাদিয়া করিম'],

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

// Exported so src/main.tsx (<ExamProvider>) works without any modification
export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
