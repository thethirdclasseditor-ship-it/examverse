import React, { useSyncExternalStore } from 'react';
import * as RawSupabase from '../lib/supabase';
import {
  INITIAL_SYLLABUS_DB,
  HSC_ACCOUNTING_1ST_PAPER_CHAPTERS,
  HSC_FINANCE_1ST_PAPER_CHAPTERS,
  HSC_FINANCE_2ND_PAPER_CHAPTERS,
  HSC_ICT_CHAPTERS,
  subjectSupportsFormulas,
} from '../data/subjectCatalog';
import type { Chapter, CQ, MCQ } from '../data/subjectCatalog';
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

export type { Chapter, CQ, MCQ };
export type { ChapterFormula as ChapterFormulaItem };
export {
  HSC_ACCOUNTING_1ST_PAPER_CHAPTERS,
  HSC_FINANCE_1ST_PAPER_CHAPTERS,
  HSC_FINANCE_2ND_PAPER_CHAPTERS,
  HSC_ICT_CHAPTERS,
  subjectSupportsFormulas,
};

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

export function hashAdminPin(pin: string): string {
  const clean = pin.trim();
  let h = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    h ^= clean.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `evh_${(h >>> 0).toString(16)}`;
}

const DEFAULT_PIN_HASH = hashAdminPin('1234');

function getBangladeshDateObj(dateObj = new Date()): Date {
  return new Date(dateObj.getTime() + 6 * 60 * 60 * 1000);
}

/**
 * Computes Saturday..Friday index in Bangladesh Time (0 = Saturday, 1 = Sunday, ..., 6 = Friday)
 */
export function getBangladeshWeekdayIndex(dateObj = new Date()): number {
  const bd = getBangladeshDateObj(dateObj);
  return (bd.getUTCDay() + 1) % 7;
}

export function getTodayIsoDate(): string {
  return getBangladeshDateObj(new Date()).toISOString().slice(0, 10);
}

function getYesterdayIsoDate(): string {
  const bd = getBangladeshDateObj(new Date());
  bd.setUTCDate(bd.getUTCDate() - 1);
  return bd.toISOString().slice(0, 10);
}

function getBangladeshWeekStartIso(dateObj = new Date()): string {
  const bd = getBangladeshDateObj(dateObj);
  const weekdayIdx = (bd.getUTCDay() + 1) % 7; // 0 = Saturday
  bd.setUTCDate(bd.getUTCDate() - weekdayIdx);
  return bd.toISOString().slice(0, 10);
}

function normalizeWeeklyActivity(weekly?: boolean[], savedWeekStart?: string): boolean[] {
  const currentWeekStart = getBangladeshWeekStartIso();
  if (
    savedWeekStart === currentWeekStart &&
    Array.isArray(weekly) &&
    weekly.length === 7
  ) {
    return weekly.map(Boolean);
  }
  return [false, false, false, false, false, false, false];
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
  const progressPct =
    current.id === 'elite' && rankScore >= 1000
      ? 100
      : Math.min(99, Math.round((within / span) * 100));

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
    color: current.colorHex,
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
  if (db[selectedClass]) return Object.keys(db[selectedClass]);
  return ['All Groups', 'Business Studies', 'Science', 'Humanities'];
}

const formulaFilteredCache = new Map<string, { ref: SubjectData[]; out: SubjectData[] }>();

export function getSubjectsForSelection(
  selectedClass: string,
  selectedGroup: string,
  forceAllSubjects = true
): SubjectData[] {
  const db = storeState?.syllabusDB || INITIAL_SYLLABUS_DB;
  const classEntry = db[selectedClass] || db.HSC;
  if (!classEntry) return [];
  const rawList = classEntry[selectedGroup] || classEntry[Object.keys(classEntry)[0]] || [];
  if (!forceAllSubjects && storeState?.activeTab === 'formulas') {
    const cacheKey = `${selectedClass}::${selectedGroup}`;
    const cached = formulaFilteredCache.get(cacheKey);
    if (cached && cached.ref === rawList) return cached.out;
    const filtered = rawList
      .map((subj) => {
        const mathChaps = subj.chapters.filter((c) => (c.formulas?.length || 0) > 0);
        return mathChaps.length > 0 ? { ...subj, chapters: mathChaps } : null;
      })
      .filter(Boolean) as SubjectData[];
    formulaFilteredCache.set(cacheKey, { ref: rawList, out: filtered });
    return filtered;
  }
  return rawList;
}

export async function signInOrSignUpUser(params: {
  mode: 'signin' | 'signup';
  name: string;
  email: string;
  password: string;
}): Promise<{ id: string; name: string; email: string; avatar?: string }> {
  const supaMod = RawSupabase as any;
  if (typeof supaMod?.validateAuthenticEmail === 'function') {
    const check = supaMod.validateAuthenticEmail(params.email);
    if (!check.valid) {
      throw new Error(check.reason || 'সঠিক ইমেইল দিন।');
    }
  }
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
          chapterMastery: storeState.chapterMastery,
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
            chapterMastery: storeState.chapterMastery,
          });
        }
        return userObj;
      }
    }
  }
  return { id: `local-${Date.now()}`, name: params.name || params.email.split('@')[0], email: params.email };
}

export const UI_DICT: Record<string, { en: string; bn: string }> = {
  nav_dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  nav_subjects: { en: 'Subjects', bn: 'বিষয়সমূহ' },
  nav_analytics: { en: 'Analytics', bn: 'পারফরম্যান্স' },
  nav_mistakes: { en: 'Mistake Bank', bn: 'ভুলের খাতা' },
  nav_flashcards: { en: 'Flashcards', bn: 'ফ্ল্যাশকার্ড' },
  nav_formulas: { en: 'Math Formulas', bn: 'গাণিতিক সূত্রসমূহ' },
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
  all_subjects: { en: 'All Subjects', bn: 'সকল বিষয়' },
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
  global_board: { en: 'Global Ranking', bn: 'সর্বজনীন র‍্যাঙ্কিং' },
  friends_ranking: { en: 'Friends Ranking', bn: 'বন্ধুদের র‍্যাঙ্কিং' },
  friends_board: { en: 'Friends Ranking', bn: 'বন্ধুদের র‍্যাঙ্কিং' },
  subject_ranking: { en: 'Subject-wise', bn: 'বিষয়ভিত্তিক' },
  filter_today: { en: 'Today', bn: 'আজ' },
  filter_weekly: { en: 'Weekly', bn: 'সাপ্তাহিক' },
  weekly: { en: 'This Week', bn: 'এই সপ্তাহ' },
  filter_monthly: { en: 'Monthly', bn: 'মাসিক' },
  monthly: { en: 'This Month', bn: 'এই মাস' },
  filter_alltime: { en: 'All-Time', bn: 'সর্বমোট' },
  all_time: { en: 'All-Time', bn: 'সর্বমোট' },
  add_friend: { en: 'Add Friend', bn: 'বন্ধু যোগ করো' },
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
  const safeXp = Math.max(0, Number(xp) || 0);
  const xpPerLevel = 250;
  const level = Math.max(1, Math.floor(safeXp / xpPerLevel) + 1);
  const currentLevelXp = safeXp % xpPerLevel;
  const pct = Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));
  return { level, currentLevelXp, xpForNext: xpPerLevel, progressPct: pct, progressPercent: pct };
}

export interface FriendEntry {
  id: string;
  code: string;
  name: string;
  avatar: string;
  xp: number;
  rankScore: number;
  rankTitleBn: string;
  rankTitleEn: string;
  streak: number;
}

export interface CustomSyllabusOverride {
  addedSubjects: Record<string, SubjectData[]>;
  addedChapters?: Record<string, ChapterData[]>;
  addedQuestions: Record<string, MCQQuestion[]>;
  editedQuestions: Record<string, Partial<MCQQuestion>>;
  deletedQuestionIds: string[];
  deletedSubjectIds?: Record<string, string[]>;
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
  lastActiveDate: string;
  weeklyActivity: boolean[];
  weeklyActivityWeekStart: string;
  chapterMastery: Record<string, number>;
  examHistory: ExamHistoryItem[];
  mistakes: MistakeItem[];
  flashcards: FlashcardItem[];
  studyTasks: StudyTask[];
  communityPosts: CommunityPost[];
  friendsList: string[];
  friendList: FriendEntry[];
  questionReports: QuestionErrorReport[];
  customSyllabusPatch: CustomSyllabusOverride;
  syllabusDB: Record<string, Record<string, SubjectData[]>>;
  activeQuiz: ActiveQuizConfig | null;
  settingsOpen: boolean;
  isSettingsModalOpen: boolean;
  authModalOpen: boolean;
  isAuthModalOpen: boolean;
  isAdminUnlocked: boolean;
  adminPinHash: string;
  setActiveTab: (tab: NavTabId) => void;
  setSelectedSubjectId: (id: string | null) => void;
  setFormulaTarget: (subjectId: string | null, chapterId: string | null) => void;
  setFormulaFilter: (subjectId: string | null, chapterId: string | null) => void;
  openSubjectFormulas: (subjectId: string, chapterId?: string) => void;
  setLanguage: (lang: LanguageMode) => void;
  toggleDarkMode: () => void;
  setClassAndGroup: (cls: string, grp: string) => void;
  setUserProfile: (profile: { id?: string; name: string; email?: string; avatar?: string; isAuthenticated?: boolean }) => void;
  logoutUser: () => Promise<void>;
  setSettingsOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  startQuiz: (config: ActiveQuizConfig) => void;
  closeQuiz: () => void;
  addXp: (amount: number) => void;
  recordBattleResult: (params: {
    won: boolean;
    tied?: boolean;
    myScore: number;
    oppScore: number;
    correctCount: number;
    totalQuestions: number;
    subjectId: string;
    subjectName: string;
    timeSpentSec?: number;
  }) => number;
  recordExamResult: (result: any, newMistakes?: MistakeItem[]) => void;
  markMistakeMastered: (id: string) => void;
  addFlashcard: (front: string, back: string, subjectId?: string) => void;
  deleteFlashcard: (id: string) => void;
  updateFlashcardBox: (id: string, box: 1 | 2 | 3 | 4 | 5) => void;
  addStudyTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
  toggleStudyTask: (id: string) => void;
  deleteStudyTask: (id: string) => void;
  addCommunityPost: (post: { authorName?: string; authorAvatar?: string; authorRank?: string; subjectName: string; title: string; body: string }) => void;
  addCommunityReply: (postId: string, authorOrText: string, maybeText?: string) => void;
  likeCommunityPost: (postId: string) => void;
  togglePostLike: (postId: string) => void;
  addFriendByCode: (codeOrName: string, friendName?: string) => boolean;
  removeFriend: (idOrName: string) => void;
  fetchLeaderboardUsers: () => Promise<any[]>;
  reportQuestionError: (payload: any) => void;
  submitQuestionReport: (payload: any) => void;
  resolveQuestionReport: (reportId: string, applySuggestedAnswer?: boolean) => void;
  deleteQuestionReport: (reportId: string) => void;
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;
  setAdminPin: (newPin: string) => void;
  importBulkMcqs: (params: { targetClass: string; targetGroup: string; subjectId: string; subjectNameBn: string; subjectNameEn: string; rawText: string }) => { addedQuestions: number; addedChapters: number };
  addSingleCustomMcq: (params: { targetClass: string; targetGroup: string; subjectId: string; subjectNameBn: string; subjectNameEn: string; chapterNameBn: string; questionBn: string; optionsBn: string[]; ansIndex: number; boardTag?: string; explanationBn?: string }) => void;
  updateCustomMcqAnswer: (cls: string, grp: string, subjectId: string, chapterId: string, questionId: string, newAnsIndex: number) => void;
  editCustomMcqFull: (params: { targetClass: string; targetGroup: string; subjectId: string; chapterId: string; questionId: string; questionBn: string; optionsBn: string[]; ansIndex: number }) => void;
  deleteCustomMcq: (cls: string, grp: string, subjectId: string, chapterId: string, questionId: string) => void;
  deleteCustomSubject: (cls: string, grp: string, subjectId: string) => void;
  exportProjectSyllabusCode: () => string;
  resetAllDemoAndProgress: () => void;
  adminAddQuestion: (payload: { className: string; groupName: string; subjectId: string; chapterId: string; question: MCQQuestion }) => void;
  adminBulkImportQuestions: (payload: { className: string; groupName: string; subjectId: string; chapterId: string; questions: MCQQuestion[] }) => number;
  adminDeleteQuestion: (payload: { className: string; groupName: string; subjectId: string; chapterId: string; questionId: string }) => void;
  getRankInfo: () => RankProgressInfo;
}

const STORAGE_KEY = 'examverse-v15-storage';
const DAILY_BATTLE_REWARD_LIMIT = 5;

export const VALID_TABS: NavTabId[] = [
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
    if (rawHash && !rawHash.startsWith('access_token=') && !rawHash.startsWith('error=')) {
      if (rawHash === 'analytics') return 'Analytics';
      if (VALID_TABS.includes(rawHash as NavTabId)) return rawHash as NavTabId;
    }
  }
  if (savedTab && VALID_TABS.includes(savedTab)) return savedTab;
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

const EMPTY_PATCH: CustomSyllabusOverride = {
  addedSubjects: {},
  addedChapters: {},
  addedQuestions: {},
  editedQuestions: {},
  deletedQuestionIds: [],
  deletedSubjectIds: {},
};

function applyCustomPatchToSyllabus(
  patch: CustomSyllabusOverride = EMPTY_PATCH
): Record<string, Record<string, SubjectData[]>> {
  const deletedSet = new Set(patch.deletedQuestionIds || []);
  const editedMap = patch.editedQuestions || {};
  const addedQMap = patch.addedQuestions || {};
  const addedSubjMap = patch.addedSubjects || {};
  const addedChapMap = patch.addedChapters || {};
  const deletedSubjMap = patch.deletedSubjectIds || {};

  const out: Record<string, Record<string, SubjectData[]>> = {};
  for (const cls of Object.keys(INITIAL_SYLLABUS_DB)) {
    out[cls] = {};
    for (const grp of Object.keys(INITIAL_SYLLABUS_DB[cls])) {
      const grpKey = `${cls}::${grp}`;
      const baseList = INITIAL_SYLLABUS_DB[cls][grp];
      const extraSubjs = addedSubjMap[grpKey] || [];
      const removedIds = new Set(deletedSubjMap[grpKey] || []);

      const combinedList: SubjectData[] = [...baseList];
      extraSubjs.forEach((es) => {
        if (!combinedList.some((b) => b.id === es.id)) {
          combinedList.push(es);
        }
      });

      out[cls][grp] = combinedList
        .filter((subj) => !removedIds.has(subj.id))
        .map((subj) => {
          const extraChaps = addedChapMap[subj.id] || [];
          const mergedChaps: ChapterData[] = [...subj.chapters];
          extraChaps.forEach((ec) => {
            if (!mergedChaps.some((c) => c.id === ec.id)) {
              mergedChaps.push(ec);
            }
          });

          return {
            ...subj,
            chapters: mergedChaps.map((chap) => {
              const addedForChap = addedQMap[`${subj.id}::${chap.id}`] || [];
              const mergedMcqs = [...chap.mcqs, ...addedForChap]
                .filter((m) => !deletedSet.has(m.id))
                .map((m) => (editedMap[m.id] ? { ...m, ...editedMap[m.id] } : m));
              return {
                ...chap,
                mcqs: mergedMcqs,
              };
            }),
          };
        });
    }
  }
  return out;
}

/**
 * Proper CSV / TSV Line Parser that respects quoted strings containing commas
 */
export function parseDelimitedLine(line: string): string[] {
  if (line.includes('\t')) {
    return line.split('\t').map((cell) => cell.trim().replace(/^"|"$/g, ''));
  }
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function loadPersistedState(): Partial<ExamStoreState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem('examverse-v14-storage') ||
      window.localStorage.getItem('examverse-v13-storage') ||
      window.localStorage.getItem('examverse-v12-storage') ||
      window.localStorage.getItem('examverse-v11-storage') ||
      window.localStorage.getItem('examverse-v10-storage');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const rawPatch = parsed.customSyllabusPatch || {};
    const patch: CustomSyllabusOverride = {
      addedSubjects: rawPatch.addedSubjects || {},
      addedChapters: rawPatch.addedChapters || {},
      addedQuestions: rawPatch.addedQuestions || {},
      editedQuestions: rawPatch.editedQuestions || {},
      deletedQuestionIds: Array.isArray(rawPatch.deletedQuestionIds) ? rawPatch.deletedQuestionIds : [],
      deletedSubjectIds: rawPatch.deletedSubjectIds || {},
    };
    return {
      ...parsed,
      customSyllabusPatch: patch,
      activeTab: getInitialTabFromHashOrStorage(parsed.activeTab),
      syllabusDB: applyCustomPatchToSyllabus(patch),
    };
  } catch {
    return {};
  }
}

let saveTimer: any = null;
function scheduleSavePersisted(state: ExamStoreState) {
  if (typeof window === 'undefined') return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
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
        lastActiveDate: state.lastActiveDate,
        weeklyActivity: state.weeklyActivity,
        weeklyActivityWeekStart: state.weeklyActivityWeekStart,
        chapterMastery: state.chapterMastery,
        examHistory: state.examHistory,
        mistakes: state.mistakes,
        flashcards: state.flashcards,
        studyTasks: state.studyTasks,
        communityPosts: state.communityPosts,
        friendsList: state.friendsList,
        friendList: state.friendList,
        questionReports: state.questionReports,
        customSyllabusPatch: state.customSyllabusPatch,
        adminPinHash: state.adminPinHash,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage quota errors
    }
  }, 120);
}

const persisted = loadPersistedState();
const initialDark = Boolean(persisted.darkMode);
applyThemeToDocument(initialDark);
const listeners = new Set<() => void>();

const currentWeekStart = getBangladeshWeekStartIso();
const initialWeekly = normalizeWeeklyActivity(
  persisted.weeklyActivity,
  persisted.weeklyActivityWeekStart || (persisted.lastActiveDate ? currentWeekStart : '')
);

const todayOnBoot = getTodayIsoDate();
const yesterdayOnBoot = getYesterdayIsoDate();
const savedLastActive = typeof persisted.lastActiveDate === 'string' ? persisted.lastActiveDate : '';
const rawSavedStreak = typeof persisted.streak === 'number' && !Number.isNaN(persisted.streak) ? persisted.streak : 0;
const effectiveBootStreak =
  savedLastActive && (savedLastActive === todayOnBoot || savedLastActive === yesterdayOnBoot)
    ? rawSavedStreak
    : 0;

const initialPatch: CustomSyllabusOverride = persisted.customSyllabusPatch || EMPTY_PATCH;

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
  streak: effectiveBootStreak,
  lastActiveDate: savedLastActive,
  weeklyActivity: initialWeekly,
  weeklyActivityWeekStart: currentWeekStart,
  chapterMastery:
    persisted.chapterMastery && typeof persisted.chapterMastery === 'object'
      ? persisted.chapterMastery
      : {},
  examHistory: Array.isArray(persisted.examHistory) ? persisted.examHistory : [],
  mistakes: Array.isArray(persisted.mistakes) ? persisted.mistakes : [],
  flashcards: Array.isArray(persisted.flashcards) ? persisted.flashcards : [],
  studyTasks: Array.isArray(persisted.studyTasks) ? persisted.studyTasks : [],
  communityPosts: Array.isArray(persisted.communityPosts) ? persisted.communityPosts : [],
  friendsList: Array.isArray(persisted.friendsList) ? persisted.friendsList : [],
  friendList: Array.isArray(persisted.friendList) ? persisted.friendList : [],
  questionReports: Array.isArray(persisted.questionReports) ? persisted.questionReports : [],
  customSyllabusPatch: initialPatch,
  syllabusDB: applyCustomPatchToSyllabus(initialPatch),
  activeQuiz: null,
  settingsOpen: false,
  isSettingsModalOpen: false,
  authModalOpen: false,
  isAuthModalOpen: false,
  isAdminUnlocked: false,
  adminPinHash:
    typeof persisted.adminPinHash === 'string' && persisted.adminPinHash
      ? persisted.adminPinHash
      : DEFAULT_PIN_HASH,

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

  setFormulaFilter: (subjectId, chapterId) =>
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
    const resolvedGroup = validGroups.includes(selectedGroup) ? selectedGroup : validGroups[0] || 'Business Studies';
    setState({ selectedClass, selectedGroup: resolvedGroup, selectedSubjectId: null, formulaSubjectId: null });
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

  addXp: (amount) => {
    const delta = Math.max(0, Math.round(amount || 0));
    if (!delta) return;
    const todayStr = getTodayIsoDate();
    const yesterdayStr = getYesterdayIsoDate();
    const weekStart = getBangladeshWeekStartIso();
    let nextStreak = storeState.streak;
    if (storeState.lastActiveDate !== todayStr) {
      nextStreak = storeState.lastActiveDate === yesterdayStr ? storeState.streak + 1 : 1;
    }
    const nextWeekly = normalizeWeeklyActivity(storeState.weeklyActivity, storeState.weeklyActivityWeekStart);
    nextWeekly[getBangladeshWeekdayIndex()] = true;

    const newXp = storeState.xp + delta;
    const newLevel = getLevelProgress(newXp).level;
    setState({
      xp: newXp,
      level: newLevel,
      streak: nextStreak,
      lastActiveDate: todayStr,
      weeklyActivity: nextWeekly,
      weeklyActivityWeekStart: weekStart,
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
        streak: nextStreak,
        selectedClass: storeState.selectedClass,
        selectedGroup: storeState.selectedGroup,
        chapterMastery: storeState.chapterMastery,
      });
    }
  },

  recordBattleResult: ({ won, tied, correctCount, totalQuestions, subjectId, subjectName, timeSpentSec = 0 }) => {
    const todayStr = getTodayIsoDate();
    const yesterdayStr = getYesterdayIsoDate();
    const weekStart = getBangladeshWeekStartIso();
    const battlesToday = storeState.examHistory.filter((h) => h.date === todayStr && h.mode === 'battle').length;

    const baseXp = won ? 50 : tied ? 30 : 15;
    const xpEarned = battlesToday < DAILY_BATTLE_REWARD_LIMIT ? baseXp : 0;

    const safeTotal = Math.max(1, totalQuestions);
    const safeCorrect = Math.min(safeTotal, Math.max(0, correctCount));
    const accuracy = Math.round((safeCorrect / safeTotal) * 100);

    let nextStreak = storeState.streak;
    if (storeState.lastActiveDate !== todayStr) {
      nextStreak = storeState.lastActiveDate === yesterdayStr ? storeState.streak + 1 : 1;
    }
    const nextWeekly = normalizeWeeklyActivity(storeState.weeklyActivity, storeState.weeklyActivityWeekStart);
    nextWeekly[getBangladeshWeekdayIndex()] = true;

    const newXp = storeState.xp + xpEarned;
    const newLevel = getLevelProgress(newXp).level;

    const historyItem: ExamHistoryItem = {
      id: `battle-${Date.now()}`,
      date: todayStr,
      timestamp: Date.now(),
      subjectId,
      subjectName,
      chapterId: `battle-${subjectId}`,
      chapterName: '1v1 Quiz Battle',
      mode: 'battle',
      score: safeCorrect,
      rawCorrect: safeCorrect,
      wrongCount: safeTotal - safeCorrect,
      total: safeTotal,
      accuracy,
      timeSpentSec,
      xpEarned,
    };

    setState({
      xp: newXp,
      level: newLevel,
      streak: nextStreak,
      lastActiveDate: todayStr,
      weeklyActivity: nextWeekly,
      weeklyActivityWeekStart: weekStart,
      examHistory: [historyItem, ...storeState.examHistory],
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
        streak: nextStreak,
        selectedClass: storeState.selectedClass,
        selectedGroup: storeState.selectedGroup,
        chapterMastery: storeState.chapterMastery,
      });
    }

    return xpEarned;
  },

  recordExamResult: (result, newMistakesArg) => {
    const totalQ = Math.max(1, Number(result.total) || 1);
    const netScore = Math.max(0, Number(result.score) || 0);
    const accuracy =
      typeof result.accuracy === 'number'
        ? Math.min(100, Math.max(0, Math.round(result.accuracy)))
        : Math.min(100, Math.max(0, Math.round((netScore / totalQ) * 100)));

    const todayStr = getTodayIsoDate();
    const yesterdayStr = getYesterdayIsoDate();
    const weekStart = getBangladeshWeekStartIso();

    const alreadyFarmedCount = storeState.examHistory.filter(
      (h) => h.date === todayStr && h.subjectId === result.subjectId && h.chapterId === result.chapterId
    ).length;

    const baseXp =
      typeof result.xpEarned === 'number'
        ? result.xpEarned
        : Math.max(0, Math.round(netScore * 10 + (accuracy >= 80 && totalQ >= 5 ? 25 : 0)));

    const xpEarned = alreadyFarmedCount === 0 ? baseXp : alreadyFarmedCount === 1 ? Math.round(baseXp * 0.25) : 0;
    const newXp = storeState.xp + xpEarned;
    const newLevel = getLevelProgress(newXp).level;

    let nextStreak = storeState.streak;
    if (storeState.lastActiveDate !== todayStr) {
      nextStreak = storeState.lastActiveDate === yesterdayStr ? storeState.streak + 1 : 1;
    }
    const nextWeekly = normalizeWeeklyActivity(storeState.weeklyActivity, storeState.weeklyActivityWeekStart);
    nextWeekly[getBangladeshWeekdayIndex()] = true;

    const historyItem: ExamHistoryItem = {
      id: `exam-${Date.now()}`,
      date: todayStr,
      timestamp: Date.now(),
      subjectId: result.subjectId,
      subjectName: result.subjectName,
      chapterId: result.chapterId,
      chapterName: result.chapterName,
      mode: result.mode || 'mcq',
      score: Math.round(netScore * 100) / 100,
      rawCorrect: result.rawCorrect,
      wrongCount: result.wrongCount,
      negativePenalty: result.negativePenalty,
      total: totalQ,
      accuracy,
      timeSpentSec: result.timeSpentSec,
      xpEarned,
    };

    const nextMastery = { ...storeState.chapterMastery };
    if (result.chapterId) {
      const prev = nextMastery[result.chapterId] || 0;
      nextMastery[result.chapterId] = Math.min(100, Math.round(prev * 0.35 + accuracy * 0.65));
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
            lastMissedAt: todayStr,
            mastered: false,
          };
        } else {
          existingMistakes.unshift(nm);
        }
      });
    }

    (result.wrongQuestions || []).forEach(({ question, selectedIndex }: any) => {
      const idx = existingMistakes.findIndex((m) => m.questionId === question.id);
      if (idx >= 0) {
        existingMistakes[idx] = {
          ...existingMistakes[idx],
          selectedIndex,
          wrongCount: existingMistakes[idx].wrongCount + 1,
          lastMissedAt: todayStr,
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
          lastMissedAt: todayStr,
          mastered: false,
        });
      }
    });

    setState({
      xp: newXp,
      level: newLevel,
      streak: nextStreak,
      lastActiveDate: todayStr,
      weeklyActivity: nextWeekly,
      weeklyActivityWeekStart: weekStart,
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
        streak: nextStreak,
        selectedClass: storeState.selectedClass,
        selectedGroup: storeState.selectedGroup,
        chapterMastery: nextMastery,
      });
    }
  },

  markMistakeMastered: (id) =>
    setState({ mistakes: storeState.mistakes.map((m) => (m.id === id ? { ...m, mastered: true } : m)) }),

  addFlashcard: (front, back, subjectId = 'general') =>
    setState({
      flashcards: [
        {
          id: `fc-${Date.now()}`,
          subjectId,
          front: { bn: front, en: front },
          back: { bn: back, en: back },
          box: 1,
          nextReviewDate: getTodayIsoDate(),
        },
        ...storeState.flashcards,
      ],
    }),

  deleteFlashcard: (id) => setState({ flashcards: storeState.flashcards.filter((f) => f.id !== id) }),

  updateFlashcardBox: (id, box) =>
    setState({ flashcards: storeState.flashcards.map((f) => (f.id === id ? { ...f, box } : f)) }),

  addStudyTask: (task) =>
    setState({ studyTasks: [{ ...task, id: `task-${Date.now()}`, completed: false }, ...storeState.studyTasks] }),

  toggleStudyTask: (id) =>
    setState({ studyTasks: storeState.studyTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)) }),

  deleteStudyTask: (id) => setState({ studyTasks: storeState.studyTasks.filter((t) => t.id !== id) }),

  addCommunityPost: ({ authorName, authorAvatar, authorRank, subjectName, title, body }) => {
    const nowTime = new Date().toLocaleString('bn-BD', { dateStyle: 'short', timeStyle: 'short' });
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
          createdAt: nowTime,
          createdAtIso: new Date().toISOString(),
          likes: 0,
          likedBy: [],
          solved: false,
          replies: [],
        },
        ...storeState.communityPosts,
      ],
    });
  },

  addCommunityReply: (postId, authorOrText, maybeText) => {
    const finalAuthor = maybeText !== undefined ? authorOrText : storeState.userName || 'শিক্ষার্থী';
    const finalText = maybeText !== undefined ? maybeText : authorOrText;
    const nowTime = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
    setState({
      communityPosts: storeState.communityPosts.map((p) =>
        p.id !== postId
          ? p
          : {
              ...p,
              replies: [
                ...p.replies,
                { id: `rep-${Date.now()}`, authorName: finalAuthor, text: finalText, createdAt: nowTime },
              ],
            }
      ),
    });
  },

  likeCommunityPost: (postId) => {
    const uid = storeState.userId || 'guest-user';
    setState({
      communityPosts: storeState.communityPosts.map((p) => {
        if (p.id !== postId) return p;
        const likedBy = Array.isArray(p.likedBy) ? p.likedBy : [];
        const hasLiked = likedBy.includes(uid);
        return {
          ...p,
          likes: hasLiked ? Math.max(0, p.likes - 1) : p.likes + 1,
          likedBy: hasLiked ? likedBy.filter((id) => id !== uid) : [...likedBy, uid],
        };
      }),
    });
  },

  togglePostLike: (postId) => storeState.likeCommunityPost(postId),

  addFriendByCode: (codeOrName, friendName) => {
    const cleanCode = (codeOrName || '').trim().toUpperCase();
    const cleanName = (friendName || '').trim();
    if (!/^EV-\d{3,6}$/i.test(cleanCode) && cleanName.length < 2) {
      return false;
    }
    const resolvedName = cleanName || `Scholar (${cleanCode})`;
    if (storeState.friendList.some((f) => f.code === cleanCode || f.name === resolvedName)) {
      return false;
    }
    const nextFriendObj: FriendEntry = {
      id: `fr-${Date.now()}`,
      code: cleanCode || `EV-${Math.floor(1000 + Math.random() * 9000)}`,
      name: resolvedName,
      avatar: '',
      xp: 0,
      rankScore: 0,
      rankTitleBn: 'ব্রোঞ্জ I',
      rankTitleEn: 'Bronze I',
      streak: 0,
    };
    setState({
      friendsList: [...storeState.friendsList, resolvedName],
      friendList: [...storeState.friendList, nextFriendObj],
    });
    return true;
  },

  removeFriend: (idOrName) => {
    setState({
      friendsList: storeState.friendsList.filter((n) => n !== idOrName),
      friendList: storeState.friendList.filter((f) => f.id !== idOrName && f.name !== idOrName),
    });
  },

  fetchLeaderboardUsers: async () => {
    const supaMod = RawSupabase as any;
    const client = supaMod?.supabase;
    if (client) {
      try {
        const { data, error } = await client
          .from('user_profiles')
          .select('*')
          .order('xp', { ascending: false })
          .limit(50);
        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch {
        // fallback below
      }
    }
    if (typeof supaMod?.fetchRealCloudLeaderboard === 'function') {
      try {
        const list = await supaMod.fetchRealCloudLeaderboard('all');
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    }
    return [];
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
    setState({ questionReports: [newReport, ...storeState.questionReports] });
  },

  submitQuestionReport: (payload) => storeState.reportQuestionError(payload),

  resolveQuestionReport: (reportId, applySuggestedAnswer = false) => {
    const target = storeState.questionReports.find((r) => r.id === reportId);
    const nextPatch: CustomSyllabusOverride = {
      ...storeState.customSyllabusPatch,
      editedQuestions: { ...storeState.customSyllabusPatch.editedQuestions },
    };
    if (target && applySuggestedAnswer) {
      nextPatch.editedQuestions[target.questionId] = {
        ...(nextPatch.editedQuestions[target.questionId] || {}),
        ans: target.suggestedCorrectIndex,
      };
    }
    setState({
      customSyllabusPatch: nextPatch,
      syllabusDB: applyCustomPatchToSyllabus(nextPatch),
      questionReports: storeState.questionReports.map((r) =>
        r.id === reportId ? { ...r, status: 'resolved' } : r
      ),
    });
  },

  deleteQuestionReport: (reportId) =>
    setState({ questionReports: storeState.questionReports.filter((r) => r.id !== reportId) }),

  unlockAdmin: (pin) => {
    const candidateHash = hashAdminPin(pin);
    const valid = candidateHash === storeState.adminPinHash;
    if (valid) setState({ isAdminUnlocked: true });
    return valid;
  },

  lockAdmin: () => setState({ isAdminUnlocked: false, activeTab: 'dashboard' }),

  setAdminPin: (newPin) => {
    if (newPin.trim().length >= 4) {
      setState({ adminPinHash: hashAdminPin(newPin) });
    }
  },

  importBulkMcqs: ({ targetClass, targetGroup, subjectId, subjectNameBn, subjectNameEn, rawText }) => {
    const lines = rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    let addedQuestions = 0;
    const chapterSet = new Set<string>();

    const nextPatch: CustomSyllabusOverride = {
      addedSubjects: { ...storeState.customSyllabusPatch.addedSubjects },
      addedChapters: { ...(storeState.customSyllabusPatch.addedChapters || {}) },
      addedQuestions: { ...storeState.customSyllabusPatch.addedQuestions },
      editedQuestions: { ...storeState.customSyllabusPatch.editedQuestions },
      deletedQuestionIds: [...storeState.customSyllabusPatch.deletedQuestionIds],
      deletedSubjectIds: { ...(storeState.customSyllabusPatch.deletedSubjectIds || {}) },
    };

    const currentList = storeState.syllabusDB[targetClass]?.[targetGroup] || [];
    let existingSubj = currentList.find((s) => s.id === subjectId);

    if (!existingSubj) {
      const newSubj: SubjectData = {
        id: subjectId,
        name: { bn: subjectNameBn, en: subjectNameEn || subjectNameBn },
        icon: '📚',
        color: '#4F46E5',
        rgb: '79, 70, 229',
        chapters: [],
      };
      const grpKey = `${targetClass}::${targetGroup}`;
      nextPatch.addedSubjects[grpKey] = [...(nextPatch.addedSubjects[grpKey] || []), newSubj];
      existingSubj = newSubj;
    }

    const workingChaps: ChapterData[] = [...existingSubj.chapters];
    const ansMap: Record<string, number> = {
      ক: 0, খ: 1, গ: 2, ঘ: 3,
      A: 0, B: 1, C: 2, D: 3,
      a: 0, b: 1, c: 2, d: 3,
      '1': 0, '2': 1, '3': 2, '4': 3, '0': 0,
    };

    lines.forEach((line, idx) => {
      const cols = parseDelimitedLine(line);
      if (cols.length < 7) return;
      const chapName = (cols[0] || 'অধ্যায় ১').trim();
      const qText = (cols[1] || '').trim();
      if (!qText || qText === 'প্রশ্ন' || qText.toLowerCase() === 'question') return;
      const [optA, optB, optC, optD] = [
        (cols[2] || '').trim(),
        (cols[3] || '').trim(),
        (cols[4] || '').trim(),
        (cols[5] || '').trim(),
      ];
      const rawAnsKey = (cols[6] || '').trim();
      if (!(rawAnsKey in ansMap)) return;
      const ansIdx = ansMap[rawAnsKey];
      const boardTag = (cols[7] || '').trim();

      let targetCh = workingChaps.find((c) => c.name.bn === chapName || c.name.en === chapName);
      if (!targetCh) {
        const newCh: ChapterData = {
          id: `${subjectId}-ch-${workingChaps.length + 1}`,
          name: { bn: chapName, en: chapName },
          mcqs: [],
          cqs: [],
          formulas: [],
        };
        workingChaps.push(newCh);
        nextPatch.addedChapters![subjectId] = [...(nextPatch.addedChapters![subjectId] || []), newCh];
        chapterSet.add(newCh.id);
        targetCh = newCh;
      }

      const newQ: MCQQuestion = {
        id: `${subjectId}-q-${Date.now()}-${idx}`,
        q: { bn: qText, en: qText },
        options: { bn: [optA, optB, optC, optD], en: [optA, optB, optC, optD] },
        ans: ansIdx,
        boardTag: boardTag || undefined,
      };
      const chapKey = `${subjectId}::${targetCh.id}`;
      nextPatch.addedQuestions[chapKey] = [...(nextPatch.addedQuestions[chapKey] || []), newQ];
      addedQuestions++;
    });

    setState({
      customSyllabusPatch: nextPatch,
      syllabusDB: applyCustomPatchToSyllabus(nextPatch),
    });
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
    const nextPatch: CustomSyllabusOverride = {
      addedSubjects: { ...storeState.customSyllabusPatch.addedSubjects },
      addedChapters: { ...(storeState.customSyllabusPatch.addedChapters || {}) },
      addedQuestions: { ...storeState.customSyllabusPatch.addedQuestions },
      editedQuestions: { ...storeState.customSyllabusPatch.editedQuestions },
      deletedQuestionIds: [...storeState.customSyllabusPatch.deletedQuestionIds],
      deletedSubjectIds: { ...(storeState.customSyllabusPatch.deletedSubjectIds || {}) },
    };

    const currentList = storeState.syllabusDB[targetClass]?.[targetGroup] || [];
    let existingSubj = currentList.find((s) => s.id === subjectId);

    if (!existingSubj) {
      const newSubj: SubjectData = {
        id: subjectId,
        name: { bn: subjectNameBn, en: subjectNameEn || subjectNameBn },
        icon: '📚',
        color: '#4F46E5',
        rgb: '79, 70, 229',
        chapters: [],
      };
      const grpKey = `${targetClass}::${targetGroup}`;
      nextPatch.addedSubjects[grpKey] = [...(nextPatch.addedSubjects[grpKey] || []), newSubj];
      existingSubj = newSubj;
    }

    const chapTitle = (chapterNameBn || 'অধ্যায় ১').trim();
    let targetCh = existingSubj.chapters.find((c) => c.name.bn === chapTitle || c.name.en === chapTitle);
    if (!targetCh) {
      const newCh: ChapterData = {
        id: `${subjectId}-ch-${existingSubj.chapters.length + 1}`,
        name: { bn: chapTitle, en: chapTitle },
        mcqs: [],
        cqs: [],
        formulas: [],
      };
      nextPatch.addedChapters![subjectId] = [...(nextPatch.addedChapters![subjectId] || []), newCh];
      targetCh = newCh;
    }

    const newQ: MCQQuestion = {
      id: `${subjectId}-q-${Date.now()}`,
      q: { bn: questionBn, en: questionBn },
      options: { bn: optionsBn, en: optionsBn },
      ans: ansIndex,
      boardTag: boardTag || undefined,
      explanation: explanationBn ? { bn: explanationBn, en: explanationBn } : undefined,
    };

    const chapKey = `${subjectId}::${targetCh.id}`;
    nextPatch.addedQuestions[chapKey] = [...(nextPatch.addedQuestions[chapKey] || []), newQ];

    setState({
      customSyllabusPatch: nextPatch,
      syllabusDB: applyCustomPatchToSyllabus(nextPatch),
    });
  },

  updateCustomMcqAnswer: (_cls, _grp, _subjectId, _chapterId, questionId, newAnsIndex) => {
    const nextPatch: CustomSyllabusOverride = {
      ...storeState.customSyllabusPatch,
      editedQuestions: {
        ...storeState.customSyllabusPatch.editedQuestions,
        [questionId]: {
          ...(storeState.customSyllabusPatch.editedQuestions[questionId] || {}),
          ans: newAnsIndex,
        },
      },
    };
    setState({
      customSyllabusPatch: nextPatch,
      syllabusDB: applyCustomPatchToSyllabus(nextPatch),
    });
  },

  editCustomMcqFull: ({ questionId, questionBn, optionsBn, ansIndex }) => {
    const nextPatch: CustomSyllabusOverride = {
      ...storeState.customSyllabusPatch,
      editedQuestions: {
        ...storeState.customSyllabusPatch.editedQuestions,
        [questionId]: {
          q: { bn: questionBn, en: questionBn },
          options: { bn: optionsBn, en: optionsBn },
          ans: ansIndex,
        },
      },
    };
    setState({
      customSyllabusPatch: nextPatch,
      syllabusDB: applyCustomPatchToSyllabus(nextPatch),
    });
  },

  deleteCustomMcq: (cls, grp, subjectId, chapterId, questionId) => {
    storeState.adminDeleteQuestion({ className: cls, groupName: grp, subjectId, chapterId, questionId });
  },

  deleteCustomSubject: (cls, grp, subjectId) => {
    const grpKey = `${cls}::${grp}`;
    const prev = storeState.customSyllabusPatch;
    const nextAddedSubjects = { ...prev.addedSubjects };
    if (Array.isArray(nextAddedSubjects[grpKey])) {
      nextAddedSubjects[grpKey] = nextAddedSubjects[grpKey].filter((s) => s.id !== subjectId);
    }

    const nextAddedChapters = { ...(prev.addedChapters || {}) };
    delete nextAddedChapters[subjectId];

    const nextAddedQuestions: Record<string, MCQQuestion[]> = {};
    Object.keys(prev.addedQuestions || {}).forEach((k) => {
      if (!k.startsWith(`${subjectId}::`)) {
        nextAddedQuestions[k] = prev.addedQuestions[k];
      }
    });

    const isBuiltIn = (INITIAL_SYLLABUS_DB[cls]?.[grp] || []).some((s) => s.id === subjectId);
    const nextDeletedSubjs = { ...(prev.deletedSubjectIds || {}) };
    if (isBuiltIn) {
      nextDeletedSubjs[grpKey] = Array.from(new Set([...(nextDeletedSubjs[grpKey] || []), subjectId]));
    }

    const nextPatch: CustomSyllabusOverride = {
      ...prev,
      addedSubjects: nextAddedSubjects,
      addedChapters: nextAddedChapters,
      addedQuestions: nextAddedQuestions,
      deletedSubjectIds: nextDeletedSubjs,
    };

    setState({
      customSyllabusPatch: nextPatch,
      syllabusDB: applyCustomPatchToSyllabus(nextPatch),
    });
  },

  exportProjectSyllabusCode: () => {
    return `// ExamVerse Exported Syllabus Backup (${new Date().toISOString()})\nexport const EXPORTED_SYLLABUS_DB = ${JSON.stringify(
      storeState.syllabusDB,
      null,
      2
    )};\n`;
  },

  resetAllDemoAndProgress: () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('examverse')) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      // ignore
    }
    setState({
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: '',
      weeklyActivity: [false, false, false, false, false, false, false],
      weeklyActivityWeekStart: getBangladeshWeekStartIso(),
      chapterMastery: {},
      examHistory: [],
      mistakes: [],
      flashcards: [],
      studyTasks: [],
      communityPosts: [],
      friendsList: [],
      friendList: [],
      questionReports: [],
      customSyllabusPatch: EMPTY_PATCH,
      syllabusDB: INITIAL_SYLLABUS_DB,
    });
  },

  adminAddQuestion: ({ subjectId, chapterId, question }) => {
    const chapKey = `${subjectId}::${chapterId}`;
    const nextPatch: CustomSyllabusOverride = {
      ...storeState.customSyllabusPatch,
      addedQuestions: {
        ...storeState.customSyllabusPatch.addedQuestions,
        [chapKey]: [question, ...(storeState.customSyllabusPatch.addedQuestions[chapKey] || [])],
      },
    };
    setState({
      customSyllabusPatch: nextPatch,
      syllabusDB: applyCustomPatchToSyllabus(nextPatch),
    });
  },

  adminBulkImportQuestions: ({ subjectId, chapterId, questions }) => {
    if (!questions.length) return 0;
    const chapKey = `${subjectId}::${chapterId}`;
    const nextPatch: CustomSyllabusOverride = {
      ...storeState.customSyllabusPatch,
      addedQuestions: {
        ...storeState.customSyllabusPatch.addedQuestions,
        [chapKey]: [...(storeState.customSyllabusPatch.addedQuestions[chapKey] || []), ...questions],
      },
    };
    setState({
      customSyllabusPatch: nextPatch,
      syllabusDB: applyCustomPatchToSyllabus(nextPatch),
    });
    return questions.length;
  },

  adminDeleteQuestion: ({ questionId }) => {
    const nextPatch: CustomSyllabusOverride = {
      ...storeState.customSyllabusPatch,
      deletedQuestionIds: Array.from(new Set([...storeState.customSyllabusPatch.deletedQuestionIds, questionId])),
    };
    setState({
      customSyllabusPatch: nextPatch,
      syllabusDB: applyCustomPatchToSyllabus(nextPatch),
    });
  },

  getRankInfo: () => {
    const avgAcc =
      storeState.examHistory.length > 0
        ? storeState.examHistory.reduce((acc, e) => acc + e.accuracy, 0) / storeState.examHistory.length
        : 0;
    const activeSubjects = getSubjectsForSelection(storeState.selectedClass, storeState.selectedGroup, true);
    const dynamicTotalChapters = Math.max(
      1,
      activeSubjects.reduce((sum, s) => sum + (s.chapters?.length || 0), 0)
    );
    const masteredCount = Object.values(storeState.chapterMastery).filter((v) => v >= 75).length;
    return calculateUserRank({
      xp: storeState.xp,
      accuracyPct: avgAcc,
      masteredChaptersCount: masteredCount,
      totalChaptersCount: dynamicTotalChapters,
      streakDays: storeState.streak,
      examsCompleted: storeState.examHistory.length,
    });
  },
};

function setState(partial: Partial<ExamStoreState>) {
  storeState = { ...storeState, ...partial };
  scheduleSavePersisted(storeState);
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

let authSyncInitialized = false;
function initSupabaseAuthAndHashSync() {
  if (authSyncInitialized || typeof window === 'undefined') return;
  authSyncInitialized = true;
  window.addEventListener('hashchange', () => {
    const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
    if (rawHash && !rawHash.startsWith('access_token=') && !rawHash.startsWith('error=')) {
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
    let resolvedAvatar = meta.avatar_url || meta.picture || '';
    let nextXp = storeState.xp;
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
        const cloudStreak =
          typeof prof.streak_days === 'number'
            ? prof.streak_days
            : typeof prof.streak === 'number'
            ? prof.streak
            : 0;
        if (cloudStreak > nextStreak) nextStreak = cloudStreak;
        const cloudMastery = prof.subject_mastery || prof.chapter_mastery;
        if (cloudMastery && typeof cloudMastery === 'object') {
          nextMastery = { ...cloudMastery, ...nextMastery };
        }
        if (!resolvedAvatar && typeof prof.avatar_url === 'string' && prof.avatar_url.startsWith('http')) {
          resolvedAvatar = prof.avatar_url;
        }
      }
    } catch {
      // ignore
    }

    const nextLevel = getLevelProgress(nextXp).level;
    setState({
      userId: user.id,
      userName: resolvedName,
      userEmail: resolvedEmail,
      userAvatar: resolvedAvatar,
      isAuthenticated: true,
      authModalOpen: false,
      isAuthModalOpen: false,
      xp: nextXp,
      level: nextLevel,
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
        level: nextLevel,
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
    if (data?.session?.user) applySupabaseSessionUser(data.session.user);
  });
  client.auth.onAuthStateChange((_event: string, session: any) => {
    if (session?.user) applySupabaseSessionUser(session.user);
  });
}

initSupabaseAuthAndHashSync();
