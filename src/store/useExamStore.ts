import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ActiveQuizConfig,
  CommunityPost,
  ExamHistoryItem,
  FlashcardItem,
  LanguageMode,
  LocalizedText,
  MistakeItem,
  RankProgressInfo,
  StudyTask,
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

  // Normalize components into a 0–1000 Composite Rank Score
  const xpComponent = Math.min(400, Math.round((xp / 4000) * 400)); // Max 400 pts
  const accWeight = examsCompleted > 0 ? Math.min(1, examsCompleted / 5) : 0;
  const accuracyComponent = Math.round((Math.min(100, accuracyPct) / 100) * 250 * accWeight); // Max 250 pts
  const masteryPct = Math.min(
    100,
    Math.round((masteredChaptersCount / Math.max(1, totalChaptersCount)) * 100)
  );
  const masteryComponent = Math.round((masteryPct / 100) * 200); // Max 200 pts
  const consistencyPct = Math.min(100, Math.round((streakDays / 14) * 100));
  const consistencyComponent = Math.round((consistencyPct / 100) * 150); // Max 150 pts

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
  const progressPct = current.id === 'elite' && rankScore >= 1000 ? 100 : Math.min(99, Math.round((within / span) * 100));

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
   COMPLETE BILINGUAL UI DICTIONARY (English & বাংলা)
   ===================================================================== */
export const UI_DICT: Record<string, { en: string; bn: string }> = {
  // Navigation
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

  // Header & Greeting
  welcome_back: { en: 'Welcome back', bn: 'স্বাগতম' },
  sign_in: { en: 'Sign In', bn: 'সাইন ইন' },
  sign_out: { en: 'Sign Out', bn: 'লগ আউট' },
  streak_days: { en: 'Day Streak', bn: 'দিনের স্ট্রিক' },
  personal_rank: { en: 'Personal Rank', bn: 'ব্যক্তিগত র‍্যাঙ্ক' },
  leaderboard_pos: { en: 'Leaderboard Position', bn: 'লিডারবোর্ড অবস্থান' },

  // Dashboard & Subjects
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

  // Quiz & Bottom Sheet
  question: { en: 'Question', bn: 'প্রশ্ন' },
  time_left: { en: 'Time Left', bn: 'বাকি সময়' },
  question_palette: { en: 'Question Navigator', bn: 'প্রশ্ন নেভিগেটর' },
  submit_exam: { en: 'Submit Exam', bn: 'পরীক্ষা জমা দাও' },
  prev_q: { en: 'Previous', bn: 'পূর্ববর্তী' },
  next_q: { en: 'Next', bn: 'পরবর্তী' },
  flag_q: { en: 'Flag', bn: 'মার্ক করো' },
  answered: { en: 'Answered', bn: 'উত্তর দেওয়া' },
  unanswered: { en: 'Unanswered', bn: 'বাকি আছে' },

  // Leaderboard
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
    return text.bn && text.en && text.bn !== text.en ? `${text.bn} • ${text.en}` : text.bn || text.en;
  }
  return text.en || text.bn;
}

interface ExamStoreState {
  // User & Auth
  userId: string | null;
  userName: string;
  userEmail: string;
  userAvatar: string;
  isAuthenticated: boolean;

  // Preferences
  language: LanguageMode;
  darkMode: boolean;
  selectedClass: string;
  selectedGroup: string;
  activeTab: NavTabId;

  // Progression & Stats
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

  // Modals & Active Quiz
  isAuthModalOpen: boolean;
  isSettingsModalOpen: boolean;
  activeQuiz: ActiveQuizConfig | null;

  // Actions
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

export const useExamStore = create<ExamStoreState>()(
  persist(
    (set, get) => ({
      userId: null,
      userName: 'শিক্ষার্থী (Scholar)',
      userEmail: '',
      userAvatar: '🎓',
      isAuthenticated: false,

      language: 'bn',
      darkMode: false,
      selectedClass: 'HSC',
      selectedGroup: 'Science',
      activeTab: 'dashboard',

      xp: 640,
      streak: 5,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      examHistory: [
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
        {
          id: 'demo-2',
          date: new Date(Date.now() - 86400000).toISOString(),
          subjectId: 'chemistry',
          subjectName: 'রসায়ন (Chemistry)',
          chapterId: 'chem-1',
          chapterName: 'ল্যাবরেটরির নিরাপদ ব্যবহার',
          mode: 'mcq',
          score: 16,
          total: 20,
          accuracy: 80,
          timeSpentSec: 460,
          xpEarned: 160,
        },
      ],
      mistakes: [],
      flashcards: [
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
      studyTasks: [
        {
          id: 'st-1',
          title: 'ভেক্টর অধ্যায়ের ২৫টি বোর্ড MCQ সমাধান',
          subjectName: 'পদার্থবিজ্ঞান',
          dueDate: new Date().toISOString().slice(0, 10),
          targetMinutes: 35,
          completed: false,
        },
        {
          id: 'st-2',
          title: 'জৈব রসায়নের নামকরণ রিভিশন',
          subjectName: 'রসায়ন',
          dueDate: new Date().toISOString().slice(0, 10),
          targetMinutes: 45,
          completed: true,
        },
      ],
      communityPosts: [
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
          replies: [
            {
              id: 'r-1',
              authorName: 'নুসরাত জাহান (Platinum I)',
              text: 'হ্যাঁ! সর্বোচ্চ বিন্দুতে বেগ সম্পূর্ণ অনুভূমিক (vx = v cosθ) এবং ত্বরণ g খাড়া নিচের দিকে ক্রিয়া করে, তাই মধ্যবর্তী কোণ ঠিক 90°।',
              createdAt: '১ ঘণ্টা আগে',
              isBestAnswer: true,
            },
          ],
        },
      ],
      bookmarks: [],
      chapterMastery: { 'phy-1': 90, 'chem-1': 80, 'math-1': 75 },
      friendsList: ['তানভীর আহমেদ', 'নুসরাত জাহান', 'রাফি ইসলাম', 'সাদিয়া করিম'],

      isAuthModalOpen: false,
      isSettingsModalOpen: false,
      activeQuiz: null,

      setLanguage: (language) => set({ language }),
      toggleDarkMode: () =>
        set((state) => {
          const next = !state.darkMode;
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', next);
          }
          return { darkMode: next };
        }),
      setClassAndGroup: (selectedClass, selectedGroup) => set({ selectedClass, selectedGroup }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
      setSettingsModalOpen: (isSettingsModalOpen) => set({ isSettingsModalOpen }),
      setUserProfile: (profile) =>
        set((state) => ({
          userId: profile.id !== undefined ? profile.id : state.userId,
          userName: profile.name ?? state.userName,
          userEmail: profile.email ?? state.userEmail,
          userAvatar: profile.avatar ?? state.userAvatar,
          isAuthenticated: profile.isAuthenticated ?? state.isAuthenticated,
        })),

      startQuiz: (activeQuiz) => set({ activeQuiz }),
      closeQuiz: () => set({ activeQuiz: null }),

      recordExamResult: (result, newMistakes) =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          const streakIncrement = state.lastActiveDate !== today ? 1 : 0;
          const item: ExamHistoryItem = {
            ...result,
            id: `exam-${Date.now()}`,
            date: new Date().toISOString(),
          };
          const updatedMastery = { ...state.chapterMastery };
          if (result.chapterId) {
            const prev = updatedMastery[result.chapterId] || 0;
            updatedMastery[result.chapterId] = Math.max(prev, result.accuracy);
          }
          return {
            xp: state.xp + result.xpEarned,
            streak: state.streak + streakIncrement,
            lastActiveDate: today,
            examHistory: [item, ...state.examHistory],
            mistakes: [...newMistakes, ...state.mistakes],
            chapterMastery: updatedMastery,
          };
        }),

      markMistakeMastered: (id) =>
        set((state) => ({
          mistakes: state.mistakes.map((m) => (m.id === id ? { ...m, mastered: true } : m)),
        })),

      addStudyTask: (task) =>
        set((state) => ({
          studyTasks: [
            { ...task, id: `task-${Date.now()}`, completed: false },
            ...state.studyTasks,
          ],
        })),

      toggleStudyTask: (id) =>
        set((state) => ({
          studyTasks: state.studyTasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      deleteStudyTask: (id) =>
        set((state) => ({
          studyTasks: state.studyTasks.filter((t) => t.id !== id),
        })),

      addCommunityPost: (post) =>
        set((state) => ({
          communityPosts: [
            {
              ...post,
              id: `post-${Date.now()}`,
              createdAt: 'এইমাত্র',
              likes: 0,
              solved: false,
              replies: [],
            },
            ...state.communityPosts,
          ],
        })),

      addCommunityReply: (postId, authorName, text) =>
        set((state) => ({
          communityPosts: state.communityPosts.map((p) =>
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
        })),

      togglePostLike: (postId) =>
        set((state) => ({
          communityPosts: state.communityPosts.map((p) =>
            p.id === postId ? { ...p, likes: p.likes + 1 } : p
          ),
        })),

      addFriendByCode: (friendName) =>
        set((state) => ({
          friendsList: state.friendsList.includes(friendName)
            ? state.friendsList
            : [...state.friendsList, friendName],
        })),

      getRankInfo: () => {
        const s = get();
        const avgAcc =
          s.examHistory.length > 0
            ? s.examHistory.reduce((acc, e) => acc + e.accuracy, 0) / s.examHistory.length
            : 78;
        const masteredCount = Object.values(s.chapterMastery).filter((v) => v >= 75).length;
        return calculateUserRank({
          xp: s.xp,
          accuracyPct: avgAcc,
          masteredChaptersCount: masteredCount,
          totalChaptersCount: 16,
          streakDays: s.streak,
          examsCompleted: s.examHistory.length,
        });
      },
    }),
    {
      name: 'examverse-v3-storage',
    }
  )
);
