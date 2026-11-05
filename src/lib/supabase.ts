import { createClient, User } from '@supabase/supabase-js';
import { getLevelProgress } from '../store/useExamStore';

export const SUPABASE_URL = 'https://muxgoubiqmussyydhekq.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11eGdvdWJpcW11c3N5eWRoZWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2Njg0OTMsImV4cCI6MjEwOTI0NDQ5M30.BesDfzId-3Pewr5EfNXvKwm4--LkpnBIGGqDQS7kDkc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface LeaderboardEntry {
  rank: number;
  name: string;
  handle: string;
  avatar: string;
  level: number;
  xp: number;
  badge: string;
  subjectXp?: Record<string, number>;
}

const BLOCKED_FAKE_DOMAINS = [
  'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com',
  'guerrillamail.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com',
  'getnada.com', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com',
  'throwawaymail.com', 'mohmal.com', 'tempail.com', 'emailondeck.com',
  'fake.com', 'test.com', 'example.com', 'abc.com', 'xyz.com', 'none.com',
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
    options: { redirectTo },
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
        target_track: targetTrack,
      },
    },
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
    password,
  });
  if (error) throw error;
  return data;
}

/* Password Reset Email */
export async function sendPasswordResetEmail(email: string) {
  const check = validateAuthenticEmail(email);
  if (!check.valid || !check.email) {
    throw new Error(check.reason || 'সঠিক ইমেইল দিন।');
  }
  const redirectTo = window.location.origin + window.location.pathname;
  const { error } = await supabase.auth.resetPasswordForEmail(check.email, { redirectTo });
  if (error) throw error;
}

/* Update Password or Email for Logged-in User */
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

/* Sync User Profile with Database */
export async function syncUserProfileWithDatabase(authUser: User, localProfile: any): Promise<any | null> {
  try {
    const { data: existingRows } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    if (existingRows) {
      const mergedXp = Math.max(Number(localProfile?.xp) || 0, Number(existingRows.xp) || 0);
      const lv = getLevelProgress(mergedXp);
      return {
        id: authUser.id,
        name: existingRows.full_name || localProfile?.name,
        username: existingRows.username || localProfile?.username,
        avatarInitials: existingRows.avatar_initials || localProfile?.avatarInitials,
        targetTrack: existingRows.target_track || localProfile?.targetTrack,
        xp: mergedXp,
        level: lv.level,
        xpForNextLevel: lv.xpForNextLevel,
        streakDays: Math.max(Number(localProfile?.streakDays) || 0, Number(existingRows.streak_days) || 0),
        isAdmin: Boolean(existingRows.is_admin || authUser.user_metadata?.role === 'admin'),
      };
    }
    return null;
  } catch {
    return null;
  }
}

/* Fetch Real User Leaderboard from Database */
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
        subjectXp: subjectXpMap,
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
