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
   REQUIRED BY src/lib/supabase.ts (Line 3: import { getLevelProgress })
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
  const progressPercent = Math.min(
    100,
    Math.round(((safeXp - currentLevelBase) / 250) * 100)
  );
  return {
    level,
    currentXp: safeXp,
    xpForNextLevel,
    progressPercent,
  };
}

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
   SYLLABUS ADAPTER (Directly maps SUBJECTS, QUESTIONS_MCQ & CREATIVE_QUESTIONS
   from your src/data/syllabusData.ts)
   ===================================================================== */
const SUBJECT_ICONS: Record<string, string> = {
  physics: '⚛️',
  chemistry: '🧪',
  math: '📐',
  biology: '🧬',
  accounting: '📊',
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
  const mod = RawSyllabus as any;
  if (Array.isArray(mod?.EXAM_CATEGORIES) && mod.EXAM_CATEGORIES.length > 0) {
    return mod.EXAM_CATEGORIES.map((c: any) => c.name || String(c.id).toUpperCase());
  }
  return ['HSC', 'SSC', 'Admission', 'BCS'];
}

export function getAvailableGroups(_selectedClass: string): string[] {
  return ['Science', 'Commerce', 'Arts', 'All'];
}

export function getSubjectsForSelection(selectedClass: string, selectedGroup: string): SubjectData[] {
  const mod = RawSyllabus as any;
  const rawSubjects = Array.isArray(mod?.SUBJECTS) ? mod.SUBJECTS : [];
  const allMcqs = Array.isArray(mod?.QUESTIONS_MCQ) ? mod.QUESTIONS_MCQ : [];
  const allCqs = Array.isArray(mod?.CREATIVE_QUESTIONS) ? mod.CREATIVE_QUESTIONS : [];

  if (rawSubjects.length === 0) return [];

  const grpNorm = selectedGroup.toLowerCase();
  const filteredSubjects = rawSubjects.filter((s: any) => {
    if (grpNorm === 'all') return true;
    const sGrp = String(s.group || '').toLowerCase();
    return sGrp === grpNorm || sGrp === 'common';
  });

  const targetSubjects = filteredSubjects.length > 0 ? filteredSubjects : rawSubjects;

  return targetSubjects.map((rawSubj: any): SubjectData => {
    const subjId = String(rawSubj.id);
    const chapters: ChapterData[] = (rawSubj.chapters || []).map((rawCh: any): ChapterData => {
      const chId = String(rawCh.id);

      const chMcqs: MCQQuestion[] = allMcqs
        .filter((q: any) => q.subjectId === subjId && q.chapterId === chId)
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
          stem: {
            en: c.stemEn || c.stemBn || '',
            bn: c.stemBn || c.stemEn || '',
          },
          a: {
            en: c.parts?.ka?.question || '',
            bn: c.parts?.ka?.question || '',
          },
          b: {
            en: c.parts?.kha?.question || '',
            bn: c.parts?.kha?.question || '',
          },
          c: {
            en: c.parts?.ga?.question || '',
            bn: c.parts?.ga?.question || '',
          },
          d: {
            en: c.parts?.gha?.question || '',
            bn: c.parts?.gha?.question || '',
          },
          ansA: {
            en: c.parts?.ka?.answer || '',
            bn: c.parts?.ka?.answer || '',
          },
          ansB: {
            en: c.parts?.kha?.answer || '',
            bn: c.parts?.kha?.answer || '',
          },
          ansC: {
            en: c.parts?.ga?.answer || '',
            bn: c.parts?.ga?.answer || '',
          },
          ansD: {
            en: c.parts?.gha?.answer || '',
            bn: c.parts?.gha?.answer || '',
          },
          boardTag: c.boardTag,
        }));

      return {
        id: chId,
        name: {
          en: rawCh.title || rawCh.name || 'Chapter',
          bn: rawCh.titleBn || rawCh.title || 'অধ্যায়',
        },
        mcqs: chMcqs,
        cqs: chCqs,
      };
    });

    return {
      id: subjId,
      name: {
        en: rawSubj.name || 'Subject',
        bn: rawSubj.nameBn || rawSubj.name || 'বিষয়',
      },
      icon: rawSubj.icon || SUBJECT_ICONS[subjId] || '📘',
      color: rawSubj.color || '#4F46E5',
      chapters,
    };
  });
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
   PURE REACT EXTERNAL STORE
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
    // Ignore storage errors
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
      chapterName: 'ভেক্টর ও নিউটনিয়ান বলবিদ্যা',
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

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};
