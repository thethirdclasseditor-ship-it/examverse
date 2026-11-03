import {
  AppState,
  QuestionMCQ,
  QuizHistoryItem,
  QuizSession,
  WeeklyDayActivity,
  MistakeEntry
} from '../types';
import { SUBJECTS, EXAM_CATEGORIES, ACHIEVEMENTS } from '../data/syllabusData';

const GUEST_STORAGE_KEY = 'examverse_state_guest_v3';
const USER_STORAGE_PREFIX = 'examverse_state_user_v3_';
const THEME_KEY = 'examverse_theme';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getStorageKeyForUser(userId?: string | null): string {
  return userId ? `${USER_STORAGE_PREFIX}${userId}` : GUEST_STORAGE_KEY;
}

/* Asia/Dhaka Calendar Date Formatter (YYYY-MM-DD) */
export function getDhakaDateStr(dateObj?: Date): string {
  const d = dateObj || new Date();
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(d);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    if (y && m && day) return `${y}-${m}-${day}`;
  } catch {}
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const dhaka = new Date(utcMs + 6 * 3600000);
  return dhaka.toISOString().slice(0, 10);
}

export function getYesterdayDhakaDateStr(): string {
  return getDhakaDateStr(new Date(Date.now() - 86400000));
}

export function buildRolling7Days(existing: WeeklyDayActivity[] = []): WeeklyDayActivity[] {
  const map: Record<string, WeeklyDayActivity> = {};
  existing.forEach((item) => {
    if (item?.dateKey) map[item.dateKey] = item;
  });
  const res: WeeklyDayActivity[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const target = new Date(now.getTime() - i * 86400000);
    const key = getDhakaDateStr(target);
    const [yr, mo, da] = key.split('-').map(Number);
    const dayLabel = DAY_NAMES[new Date(yr, mo - 1, da).getDay()];
    const prev = map[key];
    res.push({
      dateKey: key,
      day: dayLabel,
      attempted: prev?.attempted || 0,
      correct: prev?.correct || 0,
      xp: prev?.xp || 0
    });
  }
  return res;
}

/* BUG-09 FIX: Accurate Current-Level Progress Calculation (0% to 100% within current level bracket) */
export function getLevelProgress(totalXp: number): {
  level: number;
  currentLevelXp: number;
  neededForLevel: number;
  xpForNextLevel: number;
  progressPct: number;
} {
  const safeXp = Math.max(0, Math.floor(Number(totalXp) || 0));
  const level = Math.floor(safeXp / 500) + 1;
  const levelFloor = (level - 1) * 500;
  const xpForNextLevel = level * 500;
  const currentLevelXp = safeXp - levelFloor;
  const neededForLevel = 500;
  const progressPct = Math.min(100, Math.round((currentLevelXp / neededForLevel) * 100));
  return { level, currentLevelXp, neededForLevel, xpForNextLevel, progressPct };
}

/* BUG-02 FIX: Category-Aware Negative Marking Resolver */
export function resolveNegativeMark(
  mode: 'practice' | 'exam',
  categoryId: string,
  negativeMarkingEnabled: boolean,
  explicitNegativeMark?: number
): number {
  if (mode !== 'exam' || !negativeMarkingEnabled) return 0;
  if (typeof explicitNegativeMark === 'number' && !isNaN(explicitNegativeMark)) {
    return explicitNegativeMark;
  }
  const cat = EXAM_CATEGORIES.find((c) => c.id === categoryId);
  return cat ? cat.defaultNegativeMark : 0.25;
}

/* BUG-04 FIX: Deterministic Date-Seeded Daily Challenge Question Selector */
export function getDailyChallengeQuestions(allQuestions: QuestionMCQ[], dateStr?: string): QuestionMCQ[] {
  const key = dateStr || getDhakaDateStr();
  let seed = 0;
  for (let i = 0; i < key.length; i++) {
    seed = (seed * 31 + key.charCodeAt(i)) >>> 0;
  }
  const copy = [...allQuestions];
  for (let i = copy.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy.slice(0, Math.min(8, copy.length));
}

/* Section 3.3 FIX: Question & Option Shuffling (preserves i, ii, iii order on multi-statement MCQs) */
export function prepareQuizQuestions(
  pool: QuestionMCQ[],
  count?: number,
  shouldShuffle = true
): QuestionMCQ[] {
  const list = [...pool];
  if (shouldShuffle) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = list[i];
      list[i] = list[j];
      list[j] = tmp;
    }
  }
  const sliced = count && count > 0 ? list.slice(0, count) : list;
  return sliced.map((q) => {
    const copy: QuestionMCQ = JSON.parse(JSON.stringify(q));
    if (!shouldShuffle || copy.questionType === 'multi' || !Array.isArray(copy.options)) {
      return copy;
    }
    const indexed = copy.options.map((text, idx) => ({ text, isCorrect: idx === copy.correctIndex }));
    for (let i = indexed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = indexed[i];
      indexed[i] = indexed[j];
      indexed[j] = t;
    }
    copy.options = indexed.map((item) => item.text);
    copy.correctIndex = indexed.findIndex((item) => item.isCorrect);
    return copy;
  });
}

export function createFreshState(): AppState {
  const today = getDhakaDateStr();
  const mastery: Record<string, number> = {};
  const subjStats: Record<string, { attempted: number; correct: number }> = {};
  SUBJECTS.forEach((s) => {
    mastery[s.id] = 0;
    subjStats[s.id] = { attempted: 0, correct: 0 };
  });

  return {
    theme: 'light',
    user: {
      name: 'Student Scholar',
      username: '@student_ev',
      avatarInitials: 'SS',
      targetTrack: 'Science (বিজ্ঞান বিভাগ)',
      level: 1,
      xp: 0,
      xpForNextLevel: 500,
      streakDays: 0,
      streakActive: false,
      lastStudyDate: null,
      joinedDate: today,
      isAdmin: false
    },
    stats: {
      totalQuestionsSeen: 0,
      totalAttempted: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalSkipped: 0,
      completedQuizzes: 0,
      totalScorePctSum: 0,
      totalMistakesResolved: 0,
      stemQuestionsSolved: 0,
      cqCompletedCount: 0,
      weeklyActivity: buildRolling7Days([]),
      subjectMastery: mastery,
      subjectStats: subjStats
    },
    dailyChallenge: {
      date: today,
      totalQuestions: 8,
      completedQuestions: 0,
      isCompleted: false,
      completedDate: null,
      rewardXp: 150
    },
    activeSession: null,
    bookmarks: [],
    bookmarkNotes: {},
    cqScores: {},
    mistakes: [],
    quizHistory: [],
    unlockedBadges: [],
    settings: {
      soundEnabled: true,
      soundVolume: 0.75,
      vibrationEnabled: true,
      timerEnabled: true,
      defaultDurationPerQuestionSec: 45,
      negativeMarkingEnabled: true,
      notificationsEnabled: true,
      dailyReminderTime: '20:00',
      language: 'bilingual'
    }
  };
}

/* Syncs Dhaka Date, Resets Daily Challenge on New Day, and Resets Broken Streak (BUG-04 & BUG-10) */
export function syncCalendarAndStreak(state: AppState): AppState {
  const today = getDhakaDateStr();
  const yesterday = getYesterdayDhakaDateStr();
  const next = { ...state, user: { ...state.user }, dailyChallenge: { ...state.dailyChallenge }, stats: { ...state.stats } };

  next.stats.weeklyActivity = buildRolling7Days(next.stats.weeklyActivity);

  /* Reset Daily Challenge when a new Dhaka calendar day starts */
  if (next.dailyChallenge.date !== today) {
    next.dailyChallenge.date = today;
    next.dailyChallenge.completedQuestions = 0;
    next.dailyChallenge.isCompleted = next.dailyChallenge.completedDate === today;
  }

  /* BUG-10 FIX: Reset streak to 0 if user missed yesterday and hasn't studied today */
  const lastDate = next.user.lastStudyDate;
  if (!lastDate) {
    next.user.streakDays = 0;
    next.user.streakActive = false;
  } else if (lastDate === today || lastDate === yesterday) {
    next.user.streakActive = true;
  } else {
    next.user.streakDays = 0;
    next.user.streakActive = false;
  }

  const lv = getLevelProgress(next.user.xp);
  next.user.level = lv.level;
  next.user.xpForNextLevel = lv.xpForNextLevel;
  return next;
}

/* BUG-06 FIX: Load State Scoped to Specific Authenticated User ID (or Guest) */
export function loadStoredState(userId?: string | null): AppState {
  const fresh = createFreshState();
  const storageKey = getStorageKeyForUser(userId);
  try {
    const raw = window.localStorage.getItem(storageKey);
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged: AppState = {
        ...fresh,
        ...parsed,
        user: { ...fresh.user, ...(parsed.user || {}) },
        stats: {
          ...fresh.stats,
          ...(parsed.stats || {}),
          weeklyActivity: buildRolling7Days(parsed.stats?.weeklyActivity || []),
          subjectMastery: { ...fresh.stats.subjectMastery, ...(parsed.stats?.subjectMastery || {}) },
          subjectStats: { ...fresh.stats.subjectStats, ...(parsed.stats?.subjectStats || {}) }
        },
        dailyChallenge: { ...fresh.dailyChallenge, ...(parsed.dailyChallenge || {}) },
        settings: { ...fresh.settings, ...(parsed.settings || {}) }
      };
      merged.theme = savedTheme === 'dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', merged.theme);
      return syncCalendarAndStreak(merged);
    }
  } catch {}
  document.documentElement.setAttribute('data-theme', fresh.theme);
  return syncCalendarAndStreak(fresh);
}

export function saveStoredState(state: AppState, userId?: string | null) {
  const storageKey = getStorageKeyForUser(userId);
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
    window.localStorage.setItem(THEME_KEY, state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
  } catch {}
}

/* Full Quiz Grading Engine Fixing BUG-04, BUG-08, BUG-09, BUG-10, BUG-11 */
export function gradeAndApplyQuizSession(
  prevState: AppState,
  session: QuizSession
): { nextState: AppState; resultItem: QuizHistoryItem; newlyUnlockedBadges: string[] } {
  const today = getDhakaDateStr();
  const yesterday = getYesterdayDhakaDateStr();

  let correct = 0;
  let incorrect = 0;
  let skipped = 0;
  let stemCorrectDelta = 0;

  /* BUG-08 FIX: Track attempted & correct separately for EVERY subject in the quiz */
  const subjectBreakdown: Record<string, { attempted: number; correct: number; total: number }> = {};
  const updatedMistakes: MistakeEntry[] = [...prevState.mistakes];
  let resolvedDelta = 0;

  session.questions.forEach((q) => {
    if (!subjectBreakdown[q.subjectId]) {
      subjectBreakdown[q.subjectId] = { attempted: 0, correct: 0, total: 0 };
    }
    subjectBreakdown[q.subjectId].total += 1;

    const chosen = session.answers[q.id];
    const existingMistakeIdx = updatedMistakes.findIndex((m) => m.questionId === q.id);

    if (chosen === undefined || chosen === null) {
      skipped += 1;
    } else if (chosen === q.correctIndex) {
      correct += 1;
      subjectBreakdown[q.subjectId].attempted += 1;
      subjectBreakdown[q.subjectId].correct += 1;
      if (['physics', 'chemistry', 'math'].includes(q.subjectId)) {
        stemCorrectDelta += 1;
      }
      /* BUG-11 FIX: If question was previously in Mistake Bank, mark it Resolved */
      if (existingMistakeIdx !== -1 && updatedMistakes[existingMistakeIdx].status !== 'Resolved') {
        updatedMistakes[existingMistakeIdx] = {
          ...updatedMistakes[existingMistakeIdx],
          status: 'Resolved',
          timestamp: today
        };
        resolvedDelta += 1;
      }
    } else {
      incorrect += 1;
      subjectBreakdown[q.subjectId].attempted += 1;
      /* BUG-11 FIX: Update retryCount, status ('New' -> 'Practicing'), selectedIndex & timestamp */
      if (existingMistakeIdx !== -1) {
        const prevM = updatedMistakes[existingMistakeIdx];
        updatedMistakes[existingMistakeIdx] = {
          ...prevM,
          selectedIndex: chosen,
          timestamp: today,
          retryCount: (prevM.retryCount || 1) + 1,
          status: 'Practicing',
          note: q.explanation
        };
      } else {
        updatedMistakes.unshift({
          questionId: q.id,
          selectedIndex: chosen,
          timestamp: today,
          retryCount: 1,
          status: 'New',
          note: q.explanation
        });
      }
    }
  });

  const attempted = correct + incorrect;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const scorePct = session.questions.length > 0 ? Math.round((correct / session.questions.length) * 100) : 0;
  const penalty = Number((incorrect * (session.negativeMark || 0)).toFixed(2));
  const netScore = Number(Math.max(0, correct - penalty).toFixed(2));

  /* BUG-04 FIX: Daily Challenge One-Time +150 XP Bonus */
  const dailyAlreadyClaimed = prevState.dailyChallenge.completedDate === today;
  let xpEarned = 0;
  if (attempted > 0 && correct > 0) {
    xpEarned = correct * 20;
    if (attempted >= 3 && accuracy >= 80) xpEarned += 35;
    else if (attempted >= 3 && accuracy >= 50) xpEarned += 15;
    if (session.isDailyChallenge && attempted >= session.questions.length && !dailyAlreadyClaimed) {
      xpEarned += prevState.dailyChallenge.rewardXp || 150;
    }
  }

  /* Update Per-Subject Stats & Mastery (BUG-08 FIX) */
  const nextSubjectStats = { ...prevState.stats.subjectStats };
  const nextSubjectMastery = { ...prevState.stats.subjectMastery };
  Object.keys(subjectBreakdown).forEach((subjId) => {
    const b = subjectBreakdown[subjId];
    if (b.attempted > 0) {
      const prevSubj = nextSubjectStats[subjId] || { attempted: 0, correct: 0 };
      const totAtt = prevSubj.attempted + b.attempted;
      const totCor = prevSubj.correct + b.correct;
      nextSubjectStats[subjId] = { attempted: totAtt, correct: totCor };
      nextSubjectMastery[subjId] = Math.min(100, Math.round((totCor / totAtt) * 100));
    }
  });

  /* BUG-10 FIX: Consecutive Day Streak Calculation */
  let nextStreakDays = prevState.user.streakDays;
  let nextStreakActive = prevState.user.streakActive;
  let nextLastStudyDate = prevState.user.lastStudyDate;
  if (attempted > 0) {
    if (prevState.user.lastStudyDate === today) {
      nextStreakActive = true;
    } else if (prevState.user.lastStudyDate === yesterday) {
      nextStreakDays += 1;
      nextStreakActive = true;
      nextLastStudyDate = today;
    } else {
      nextStreakDays = 1;
      nextStreakActive = true;
      nextLastStudyDate = today;
    }
  }

  /* Update Rolling 7-Day Activity */
  const nextWeekly = buildRolling7Days(prevState.stats.weeklyActivity).map((d) =>
    d.dateKey === today
      ? { ...d, attempted: d.attempted + attempted, correct: d.correct + correct, xp: d.xp + xpEarned }
      : d
  );

  const nextCompletedQuizzes = prevState.stats.completedQuizzes + (attempted > 0 ? 1 : 0);
  const nextTotalAttempted = prevState.stats.totalAttempted + attempted;
  const nextStemSolved = (prevState.stats.stemQuestionsSolved || 0) + stemCorrectDelta;
  const nextMistakesResolved = (prevState.stats.totalMistakesResolved || 0) + resolvedDelta;

  let totalXp = prevState.user.xp + xpEarned;

  /* BUG-09 FIX: Evaluate Achievement Badges & Award Badge Bonus XP */
  const nextUnlockedBadges = [...prevState.unlockedBadges];
  const newlyUnlockedBadges: string[] = [];
  const prelimLevel = getLevelProgress(totalXp).level;
  const activeUnresolvedMistakes = updatedMistakes.filter((m) => m.status !== 'Resolved').length;

  const badgeConditions: Record<string, boolean> = {
    'badge-first-step': nextCompletedQuizzes >= 1 && nextTotalAttempted >= 1,
    'badge-streak-7': nextStreakDays >= 7,
    'badge-precision-90': attempted >= 3 && accuracy >= 90,
    'badge-stem-scholar': nextStemSolved >= 20,
    'badge-mistake-conqueror': nextMistakesResolved >= 3 && activeUnresolvedMistakes === 0,
    'badge-centurion': prelimLevel >= 10 && totalXp >= 4500
  };

  ACHIEVEMENTS.forEach((ach) => {
    if (!nextUnlockedBadges.includes(ach.id) && badgeConditions[ach.id]) {
      nextUnlockedBadges.push(ach.id);
      totalXp += ach.xpBonus;
      newlyUnlockedBadges.push(ach.title);
    }
  });

  const finalLv = getLevelProgress(totalXp);

  /* Update Daily Challenge State */
  const nextDaily = { ...prevState.dailyChallenge, date: today };
  if (session.isDailyChallenge && attempted > 0) {
    nextDaily.completedQuestions = Math.max(nextDaily.completedQuestions, attempted);
    if (attempted >= session.questions.length) {
      nextDaily.isCompleted = true;
      nextDaily.completedDate = today;
    }
  }

  const timeTakenSec = Math.max(1, Math.floor((Date.now() - session.startedAtMs) / 1000));
  const resultItem: QuizHistoryItem = {
    id: session.id,
    title: session.title,
    category: session.categoryLabel,
    categoryId: session.categoryId,
    subjectId: session.primarySubjectId,
    mode: session.mode,
    score: correct,
    netScore,
    negativeMark: session.negativeMark,
    total: session.questions.length,
    attempted,
    incorrect,
    skipped,
    accuracy,
    scorePct,
    timeTakenSec,
    xpEarned,
    date: today,
    subjectBreakdown,
    questionsSnapshot: session.questions,
    answersSnapshot: session.answers
  };

  const nextState: AppState = {
    ...prevState,
    activeSession: null,
    user: {
      ...prevState.user,
      xp: totalXp,
      level: finalLv.level,
      xpForNextLevel: finalLv.xpForNextLevel,
      streakDays: nextStreakDays,
      streakActive: nextStreakActive,
      lastStudyDate: nextLastStudyDate
    },
    stats: {
      ...prevState.stats,
      totalQuestionsSeen: prevState.stats.totalQuestionsSeen + session.questions.length,
      totalAttempted: nextTotalAttempted,
      totalCorrect: prevState.stats.totalCorrect + correct,
      totalIncorrect: prevState.stats.totalIncorrect + incorrect,
      totalSkipped: prevState.stats.totalSkipped + skipped,
      completedQuizzes: nextCompletedQuizzes,
      totalScorePctSum: prevState.stats.totalScorePctSum + (attempted > 0 ? accuracy : 0),
      totalMistakesResolved: nextMistakesResolved,
      stemQuestionsSolved: nextStemSolved,
      weeklyActivity: nextWeekly,
      subjectMastery: nextSubjectMastery,
      subjectStats: nextSubjectStats
    },
    dailyChallenge: nextDaily,
    mistakes: updatedMistakes,
    quizHistory: [resultItem, ...prevState.quizHistory],
    unlockedBadges: nextUnlockedBadges
  };

  return { nextState, resultItem, newlyUnlockedBadges };
}
