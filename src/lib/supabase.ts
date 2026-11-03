import { createClient, User } from '@supabase/supabase-js';
import { AppState, LeaderboardEntry, UserProfile } from '../types';
import { getLevelProgress } from '../store/useExamStore';

export const SUPABASE_URL = 'https://muxgoubiqmussyydhekq.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11eGdvdWJpcW11c3N5eWRoZWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2Njg0OTMsImV4cCI6MjEwOTI0NDQ5M30.BesDfzId-3Pewr5EfNXvKwm4--LkpnBIGGqDQS7kDkc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/* Blocked disposable / fake email domains so nobody can create fake accounts */
const BLOCKED_FAKE_DOMAINS = [
  'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com',
  'guerrillamail.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com',
  'getnada.com', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com',
  'throwawaymail.com', 'mohmal.com', 'tempail.com', 'emailondeck.com',
  'fake.com', 'test.com', 'example.com', 'abc.com', 'xyz.com', 'none.com'
];

export function validateAuthenticEmail(email: string): { valid: boolean; email?: string; reason?: string } {
  const clean = String(email || '').trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(clean)) {
    return { valid: false, reason: 'অনুগ্রহ করে একটি সঠিক ইমেইল দিন (যেমন: yourname@gmail.com)।' };
  }
  const [localPart, domain] = clean.split('@');
  if (localPart.length < 3 || /^(test|fake|admin|user|abcd|12345)$/i.test(localPart)) {
    return { valid: false, reason: 'ফেইক বা টেস্ট ইমেইল গ্রহণযোগ্য নয়। আপনার আসল ইমেইল ব্যবহার করুন।' };
  }
  if (BLOCKED_FAKE_DOMAINS.includes(domain)) {
    return { valid: false, reason: 'Temporary বা Fake ইমেইল গ্রহণযোগ্য নয়। আসল Gmail, Yahoo বা Outlook ইমেইল দিন।' };
  }
  return { valid: true, email: clean };
}

/* 1-Click OAuth 2.0 Login with Google or Facebook */
export async function signInWithOAuthProvider(provider: 'google' | 'facebook') {
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo }
  });
  if (error) throw error;
}

/* Verified Email Sign Up */
export async function signUpWithVerifiedEmail(
  email: string,
  password: string,
  fullName: string,
  targetTrack: string
) {
  const check = validateAuthenticEmail(email);
  if (!check.valid || !check.email) {
    throw new Error(check.reason || 'Invalid email');
  }
  const cleanName = fullName.trim();
  if (cleanName.length < 2) {
    throw new Error('অনুগ্রহ করে আপনার আসল নাম লিখুন (কমপক্ষে ২ অক্ষর)।');
  }
  if (!password || password.length < 6) {
    throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
  }
  const handle = '@' + check.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15);

  const { data, error } = await supabase.auth.signUp({
    email: check.email,
    password,
    options: {
      data: {
        full_name: cleanName,
        username: handle,
        target_track: targetTrack
      }
    }
  });
  if (error) throw error;
  return data;
}

/* Verified Email Sign In */
export async function signInWithVerifiedEmail(email: string, password: string) {
  const check = validateAuthenticEmail(email);
  if (!check.valid || !check.email) {
    throw new Error(check.reason || 'Invalid email');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: check.email,
    password
  });
  if (error) throw error;
  return data;
}

/* Section 3.1 FIX: Password Reset Email */
export async function sendPasswordResetEmail(email: string) {
  const check = validateAuthenticEmail(email);
  if (!check.valid || !check.email) {
    throw new Error(check.reason || 'সঠিক ইমেইল দিন।');
  }
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await supabase.auth.resetPasswordForEmail(check.email, { redirectTo });
  if (error) throw error;
}

/* Section 3.1 FIX: Update Password or Email for Logged-in User */
export async function updateAccountCredentials(params: { email?: string; password?: string }) {
  const updates: { email?: string; password?: string } = {};
  if (params.email) {
    const check = validateAuthenticEmail(params.email);
    if (!check.valid || !check.email) throw new Error(check.reason);
    updates.email = check.email;
  }
  if (params.password) {
    if (params.password.length < 6) throw new Error('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
    updates.password = params.password;
  }
  const { data, error } = await supabase.auth.updateUser(updates);
  if (error) throw error;
  return data;
}

/* BUG-06 FIX: Full Account Data Restore & Sync (Profile + Bookmarks + Mistakes + History + CQ + Mastery + Settings) */
export async function syncFullAccountStateFromCloud(
  authUser: User,
  localState: AppState
): Promise<Partial<AppState> | null> {
  try {
    const meta = authUser.user_metadata || {};
    const oauthName = meta.full_name || meta.name || localState.user.name || 'Student Scholar';
    const oauthAvatar = meta.avatar_url || meta.picture || localState.user.avatarUrl || '';
    const defaultHandle =
      meta.username ||
      (localState.user.username !== '@student_ev'
        ? localState.user.username
        : '@' + (authUser.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'scholar'));

    const { data: row } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    const cloudSnapshot: Partial<AppState> =
      (row && row.app_state_json && typeof row.app_state_json === 'object' ? row.app_state_json : null) ||
      (meta.app_state_snapshot && typeof meta.app_state_snapshot === 'object' ? meta.app_state_snapshot : {}) ||
      {};

    if (row) {
      const mergedXp = Math.max(Number(localState.user.xp) || 0, Number(row.xp) || 0);
      const lv = getLevelProgress(mergedXp);
      const mergedStreak = Math.max(Number(localState.user.streakDays) || 0, Number(row.streak_days) || 0);
      const nameParts = (row.full_name || oauthName).split(/\s+/);
      const initials = ((nameParts[0]?.[0] || 'S') + (nameParts[1]?.[0] || nameParts[0]?.[1] || 'S')).toUpperCase();
      const isAdminFlag = Boolean(row.is_admin || meta.role === 'admin');

      return {
        ...cloudSnapshot,
        user: {
          ...localState.user,
          ...(cloudSnapshot.user || {}),
          id: authUser.id,
          name: row.full_name || oauthName,
          username: row.username || defaultHandle,
          avatarInitials: row.avatar_initials || initials,
          avatarUrl: oauthAvatar,
          targetTrack: row.target_track || meta.target_track || localState.user.targetTrack,
          xp: mergedXp,
          level: lv.level,
          xpForNextLevel: lv.xpForNextLevel,
          streakDays: mergedStreak,
          lastStudyDate: row.last_active_date || localState.user.lastStudyDate,
          joinedDate: (row.created_at ? String(row.created_at).slice(0, 10) : localState.user.joinedDate) || '2026',
          isAdmin: isAdminFlag
        },
        stats: {
          ...localState.stats,
          ...(cloudSnapshot.stats || {}),
          subjectMastery: {
            ...localState.stats.subjectMastery,
            ...(cloudSnapshot.stats?.subjectMastery || {}),
            ...(row.subject_mastery && typeof row.subject_mastery === 'object' ? row.subject_mastery : {})
          },
          subjectStats: {
            ...localState.stats.subjectStats,
            ...(cloudSnapshot.stats?.subjectStats || {})
          }
        },
        bookmarks: Array.from(new Set([...(localState.bookmarks || []), ...(cloudSnapshot.bookmarks || [])])),
        bookmarkNotes: { ...(cloudSnapshot.bookmarkNotes || {}), ...(localState.bookmarkNotes || {}) },
        cqScores: { ...(cloudSnapshot.cqScores || {}), ...(localState.cqScores || {}) },
        mistakes: (localState.mistakes && localState.mistakes.length > 0)
          ? localState.mistakes
          : (cloudSnapshot.mistakes || []),
        quizHistory: (localState.quizHistory && localState.quizHistory.length > 0)
          ? localState.quizHistory
          : (cloudSnapshot.quizHistory || []),
        unlockedBadges: Array.from(new Set([...(localState.unlockedBadges || []), ...(cloudSnapshot.unlockedBadges || [])])),
        settings: { ...localState.settings, ...(cloudSnapshot.settings || {}) }
      };
    }

    /* First time login: create row in public.user_profiles */
    const nameParts = oauthName.split(/\s+/);
    const initials = ((nameParts[0]?.[0] || 'S') + (nameParts[1]?.[0] || nameParts[0]?.[1] || 'S')).toUpperCase();
    const lv = getLevelProgress(localState.user.xp || 0);
    const newRow = {
      id: authUser.id,
      username: defaultHandle,
      full_name: oauthName,
      avatar_initials: initials,
      target_track: meta.target_track || localState.user.targetTrack || 'Science (বিজ্ঞান বিভাগ)',
      level: lv.level,
      xp: localState.user.xp || 0,
      streak_days: localState.user.streakDays || 0
    };
    await supabase.from('user_profiles').upsert(newRow);

    return {
      user: {
        ...localState.user,
        id: authUser.id,
        name: newRow.full_name,
        username: newRow.username,
        avatarInitials: initials,
        avatarUrl: oauthAvatar,
        targetTrack: newRow.target_track,
        joinedDate: authUser.created_at ? authUser.created_at.slice(0, 10) : localState.user.joinedDate,
        isAdmin: Boolean(meta.role === 'admin')
      }
    };
  } catch {
    return null;
  }
}

/* Backwards-compatible wrapper for syncUserProfileWithDatabase */
export async function syncUserProfileWithDatabase(authUser: User, localProfile: UserProfile): Promise<Partial<UserProfile> | null> {
  try {
    const { data: existingRows } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    if (existingRows) {
      const mergedXp = Math.max(Number(localProfile.xp) || 0, Number(existingRows.xp) || 0);
      const lv = getLevelProgress(mergedXp);
      return {
        id: authUser.id,
        name: existingRows.full_name || localProfile.name,
        username: existingRows.username || localProfile.username,
        avatarInitials: existingRows.avatar_initials || localProfile.avatarInitials,
        targetTrack: existingRows.target_track || localProfile.targetTrack,
        xp: mergedXp,
        level: lv.level,
        xpForNextLevel: lv.xpForNextLevel,
        streakDays: Math.max(Number(localProfile.streakDays) || 0, Number(existingRows.streak_days) || 0),
        isAdmin: Boolean(existingRows.is_admin || authUser.user_metadata?.role === 'admin')
      };
    }
    return null;
  } catch {
    return null;
  }
}

/* Push Full State Snapshot & Profile Row to Supabase */
export async function pushFullStateToCloud(authUser: User, state: AppState) {
  try {
    const compactSnapshot = {
      stats: state.stats,
      dailyChallenge: state.dailyChallenge,
      bookmarks: state.bookmarks,
      bookmarkNotes: state.bookmarkNotes,
      cqScores: state.cqScores,
      mistakes: state.mistakes.slice(0, 100),
      quizHistory: state.quizHistory.slice(0, 50),
      unlockedBadges: state.unlockedBadges,
      settings: state.settings
    };

    /* 1. Upsert core profile columns */
    const baseRow: Record<string, any> = {
      id: authUser.id,
      username: state.user.username,
      full_name: state.user.name,
      avatar_initials: state.user.avatarInitials,
      target_track: state.user.targetTrack,
      level: state.user.level,
      xp: state.user.xp,
      streak_days: state.user.streakDays,
      last_active_date: state.user.lastStudyDate,
      updated_at: new Date().toISOString()
    };

    /* Try saving with app_state_json column first, fallback to base columns if SQL migration not yet run */
    const { error } = await supabase.from('user_profiles').upsert({
      ...baseRow,
      app_state_json: compactSnapshot,
      subject_mastery: state.stats.subjectMastery
    });
    if (error) {
      await supabase.from('user_profiles').upsert(baseRow);
    }
  } catch {}
}

export async function pushProfileUpdateToCloud(authUser: User, profile: UserProfile) {
  try {
    await supabase.from('user_profiles').upsert({
      id: authUser.id,
      username: profile.username,
      full_name: profile.name,
      avatar_initials: profile.avatarInitials,
      target_track: profile.targetTrack,
      level: profile.level,
      xp: profile.xp,
      streak_days: profile.streakDays,
      last_active_date: profile.lastStudyDate,
      updated_at: new Date().toISOString()
    });
  } catch {}
}

/* Section 3.7 FIX: Fetch Real User Leaderboard from Database (with Actual Subject Mastery/XP) */
export async function fetchRealCloudLeaderboard(subjectId = 'all'): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, full_name, avatar_initials, target_track, level, xp, app_state_json, subject_mastery')
      .order('xp', { ascending: false })
      .limit(50);

    if (error || !Array.isArray(data)) return [];

    const mapped: LeaderboardEntry[] = data.map((row: any, idx: number) => {
      const subjStats = row.app_state_json?.stats?.subjectStats || {};
      const subjMastery = row.subject_mastery || row.app_state_json?.stats?.subjectMastery || {};
      const subjectXpMap: Record<string, number> = {};
      Object.keys(subjStats).forEach((sId) => {
        const cor = Number(subjStats[sId]?.correct) || 0;
        const mast = Number(subjMastery[sId]) || 0;
        subjectXpMap[sId] = cor * 20 + mast * 3;
      });

      const displayXp = subjectId === 'all' ? Number(row.xp) || 0 : subjectXpMap[subjectId] || 0;
      return {
        rank: idx + 1,
        name: row.full_name || 'Scholar',
        handle: row.username || '@scholar',
        avatar: row.avatar_initials || 'SS',
        level: Number(row.level) || 1,
        xp: displayXp,
        badge: row.target_track || 'ExamVerse Scholar',
        subjectXp: subjectXpMap
      };
    });

    return mapped
      .filter((item) => (subjectId === 'all' ? item.xp >= 0 : item.xp > 0))
      .sort((a, b) => b.xp - a.xp)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  } catch {
    return [];
  }
}

/* Server-Side Validated Quiz Attempt RPC */
export async function submitServerQuizAttempt(payload: {
  title: string;
  categoryId: string;
  subjectId: string;
  mode: string;
  negativeMark: number;
  timeTakenSec: number;
  questionIds: string[];
  answers: Record<string, number>;
  isDailyChallenge: boolean;
}) {
  try {
    const { data } = await supabase.rpc('submit_quiz_attempt', {
      p_title: payload.title,
      p_category_id: payload.categoryId,
      p_subject_id: payload.subjectId,
      p_mode: payload.mode,
      p_negative_mark: payload.negativeMark,
      p_time_taken_sec: payload.timeTakenSec,
      p_question_ids: payload.questionIds,
      p_answers: payload.answers,
      p_is_daily_challenge: payload.isDailyChallenge
    });
    return data;
  } catch {
    return null;
  }
}
