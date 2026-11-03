export type AcademicGroup = 'Science' | 'Commerce' | 'Arts' | 'Common';

export type ViewName =
  | 'home'
  | 'exams'
  | 'quiz'
  | 'cq'
  | 'results'
  | 'review'
  | 'stats'
  | 'leaderboard'
  | 'profile'
  | 'bookmarks'
  | 'mistakes'
  | 'history'
  | 'daily'
  | 'settings';

export interface Chapter {
  id: string;
  paper: string;
  title: string;
  titleBn: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Subject {
  id: string;
  name: string;
  nameBn: string;
  group: AcademicGroup;
  color: string;
  bgSoft: string;
  borderColor: string;
  tagBn: string;
  chapters: Chapter[];
}

export interface QuestionMCQ {
  id: string;
  subjectId: string;
  chapterId: string;
  categories: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionType: 'standard' | 'multi';
  examTag: string;
  question: string;
  questionBn: string;
  statements?: string[];
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CQPart {
  marks: number;
  label: string;
  question: string;
  answer: string;
}

export interface QuestionCQ {
  id: string;
  subjectId: string;
  chapterId: string;
  categories: string[];
  boardTag: string;
  title: string;
  stemBn: string;
  stemEn: string;
  parts: {
    ka: CQPart;
    kha: CQPart;
    ga: CQPart;
    gha: CQPart;
  };
}

export interface ExamCategory {
  id: string;
  name: string;
  nameBn: string;
  fullTitle: string;
  badge: string;
  description: string;
  subjects: string[];
  defaultNegativeMark: number;
}

export interface RecommendedPack {
  id: string;
  title: string;
  titleBn: string;
  subtitle: string;
  category: string;
  subjectId: string;
  questionIds: string[];
  durationSec: number;
  negativeMark: number;
  xpReward: number;
  badgeText: string;
}

export interface AchievementBadge {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  xpBonus: number;
  tier: 'gold' | 'silver' | 'bronze';
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  handle: string;
  avatar: string;
  level: number;
  xp: number;
  badge: string;
  isCurrentUser?: boolean;
}

export interface UserProfile {
  name: string;
  username: string;
  avatarInitials: string;
  avatarUrl?: string;
  targetTrack: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  streakDays: number;
  streakActive: boolean;
  lastStudyDate: string | null;
}

export interface WeeklyDayActivity {
  dateKey: string;
  day: string;
  attempted: number;
  correct: number;
  xp: number;
}

export interface MistakeEntry {
  questionId: string;
  selectedIndex: number;
  timestamp: string;
  retryCount: number;
  note: string;
}

export interface QuizHistoryItem {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  subjectId: string;
  mode: 'practice' | 'exam';
  score: number;
  netScore: number;
  negativeMark: number;
  total: number;
  attempted: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  scorePct: number;
  timeTakenSec: number;
  xpEarned: number;
  date: string;
  questionsSnapshot: QuestionMCQ[];
  answersSnapshot: Record<string, number>;
}

export interface QuizSession {
  id: string;
  title: string;
  categoryLabel: string;
  categoryId: string;
  primarySubjectId: string;
  mode: 'practice' | 'exam';
  negativeMark: number;
  isDailyChallenge: boolean;
  questions: QuestionMCQ[];
  currentIndex: number;
  answers: Record<string, number>;
  revealed: Record<string, boolean>;
  startedAtMs: number;
  deadlineMs: number;
  durationSec: number;
  remainingSec: number;
  isSubmitted: boolean;
}

export interface AppSettings {
  soundEnabled: boolean;
  soundVolume: number;
  vibrationEnabled: boolean;
  timerEnabled: boolean;
  defaultDurationPerQuestionSec: number;
  negativeMarkingEnabled: boolean;
  language: 'bilingual' | 'en' | 'bn';
}

export interface AppState {
  theme: 'light' | 'dark';
  user: UserProfile;
  stats: {
    totalQuestionsSeen: number;
    totalAttempted: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalSkipped: number;
    completedQuizzes: number;
    totalScorePctSum: number;
    totalMistakesResolved: number;
    stemQuestionsSolved: number;
    cqCompletedCount: number;
    weeklyActivity: WeeklyDayActivity[];
    subjectMastery: Record<string, number>;
    subjectStats: Record<string, { attempted: number; correct: number }>;
  };
  dailyChallenge: {
    date: string;
    totalQuestions: number;
    completedQuestions: number;
    isCompleted: boolean;
    completedDate: string | null;
    rewardXp: number;
  };
  bookmarks: string[];
  bookmarkNotes: Record<string, string>;
  cqScores: Record<string, { marks: number; date: string }>;
  mistakes: MistakeEntry[];
  quizHistory: QuizHistoryItem[];
  unlockedBadges: string[];
  settings: AppSettings;
}
