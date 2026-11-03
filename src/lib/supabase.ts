import { createClient, User } from '@supabase/supabase-js';
import { UserProfile } from '../types';

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

/* Verified Email Sign Up with Real-Time Profile Creation */
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

/* Pull or Create User Profile Row in Supabase PostgreSQL (public.user_profiles) */
export async function syncUserProfileWithDatabase(authUser: User, localProfile: UserProfile): Promise<Partial<UserProfile> | null> {
  try {
    const meta = authUser.user_metadata || {};
    const oauthName = meta.full_name || meta.name || localProfile.name || 'Student Scholar';
    const oauthAvatar = meta.avatar_url || meta.picture || localProfile.avatarUrl || '';
    const defaultHandle =
      meta.username ||
      (localProfile.username !== '@student_ev' ? localProfile.username : '@' + (authUser.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'scholar'));

    const { data: existingRows } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (existingRows) {
      const mergedXp = Math.max(Number(localProfile.xp) || 0, Number(existingRows.xp) || 0);
      const mergedLevel = Math.max(Number(localProfile.level) || 1, Number(existingRows.level) || 1);
      const mergedStreak = Math.max(Number(localProfile.streakDays) || 0, Number(existingRows.streak_days) || 0);
      const nameParts = (existingRows.full_name || oauthName).split(/\s+/);
      const initials = ((nameParts[0]?.[0] || 'S') + (nameParts[1]?.[0] || nameParts[0]?.[1] || 'S')).toUpperCase();

      return {
        name: existingRows.full_name || oauthName,
        username: existingRows.username || defaultHandle,
        avatarInitials: existingRows.avatar_initials || initials,
        avatarUrl: oauthAvatar,
        targetTrack: existingRows.target_track || meta.target_track || localProfile.targetTrack,
        xp: mergedXp,
        level: mergedLevel,
        xpForNextLevel: mergedLevel * 500,
        streakDays: mergedStreak
      };
    }

    /* Create profile row in real time if first login */
    const nameParts = oauthName.split(/\s+/);
    const initials = ((nameParts[0]?.[0] || 'S') + (nameParts[1]?.[0] || nameParts[0]?.[1] || 'S')).toUpperCase();
    const newRow = {
      id: authUser.id,
      username: defaultHandle,
      full_name: oauthName,
      avatar_initials: initials,
      target_track: meta.target_track || localProfile.targetTrack || 'Science (বিজ্ঞান বিভাগ)',
      level: localProfile.level || 1,
      xp: localProfile.xp || 0,
      streak_days: localProfile.streakDays || 0
    };
    await supabase.from('user_profiles').upsert(newRow);
    return {
      name: newRow.full_name,
      username: newRow.username,
      avatarInitials: initials,
      avatarUrl: oauthAvatar,
      targetTrack: newRow.target_track
    };
  } catch {
    return null;
  }
}

/* Push Updated XP, Level, Streak & Name to Supabase in Real Time */
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
