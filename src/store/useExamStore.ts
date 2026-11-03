import { AppState, WeeklyDayActivity } from '../types';
import { SUBJECTS } from '../data/syllabusData';

const STORAGE_KEY = 'examverse_state_v2';
const THEME_KEY = 'examverse_theme';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  return d.toISOString().slice(0, 10);
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
      lastStudyDate: null
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
      language: 'bilingual'
    }
  };
}

export function loadStoredState(): AppState {
  const fresh = createFreshState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
        settings: { ...fresh.settings, ...(parsed.settings || {}) }
      };
      merged.theme = savedTheme === 'dark' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', merged.theme);
      return merged;
    }
  } catch {}
  document.documentElement.setAttribute('data-theme', 'light');
  return fresh;
}

export function saveStoredState(state: AppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.localStorage.setItem(THEME_KEY, state.theme);
    document.documentElement.setAttribute('data-theme', state.theme);
  } catch {}
}
