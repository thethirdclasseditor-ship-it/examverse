import React, { useEffect, useState } from 'react';
import { signInOrSignUpUser, trKey, trText, useExamStore } from '../store/useExamStore';
import { signInWithOAuthProvider } from '../lib/supabase';
import { MistakeItem } from '../types';

export const ExamVerseLogo: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <rect x="4" y="4" width="56" height="56" rx="15" fill="#4F46E5" />
    <path d="M12 38C16 47 29 51 44 45C52 41.5 55 35 53 29" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M16 42V26C21 25 27 26.5 32 30C37 26.5 43 25 48 26V42C43 40.8 37 42 32 45C27 42 21 40.8 16 42Z" fill="#FFFFFF" />
    <path d="M32 15L26.5 26.5L29 33H35L37.5 26.5L32 15Z" fill="#EDE9FE" stroke="#312E81" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M32 7.5L33.4 10.6L36.5 12L33.4 13.4L32 16.5L30.6 13.4L27.5 12L30.6 10.6L32 7.5Z" fill="#FDE68A" />
  </svg>
);

export const EvIcon: React.FC<{ name: string; size?: number }> = ({ name, size = 19 }) => {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'home':
      return <svg {...props}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" /></svg>;
    case 'book':
      return <svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
    case 'trophy':
      return <svg {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" /></svg>;
    case 'chart':
      return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    case 'shield':
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>;
    case 'alert':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
    case 'layers':
      return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 15h10M7 10h6" /></svg>;
    case 'formula':
      return <svg {...props}><path d="M4 7h16M8 7v11M16 7v8a2 2 0 0 0 4 0" /></svg>;
    case 'calendar':
      return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case 'zap':
      return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    case 'message':
      return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
    case 'cloud':
      return <svg {...props}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>;
    case 'settings':
      return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    case 'sun':
      return <svg {...props}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>;
    case 'moon':
      return <svg {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
    case 'more':
      return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>;
    default:
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" /></svg>;
  }
};

export const SubjectSketchSvg: React.FC<{ subjKey: string }> = ({ subjKey }) => {
  const k = subjKey.toLowerCase();
  if (k.includes('phy')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(30 50 50)" />
        <ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(-30 50 50)" />
        <circle cx="50" cy="50" r="6" />
      </svg>
    );
  }
  if (k.includes('chem')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 100 100">
        <path d="M36 16h28M42 16v22L20 76a6 6 0 0 0 5 9h50a6 6 0 0 0 5-9L58 38V16" />
        <path d="M28 62h44" />
      </svg>
    );
  }
  if (k.includes('math')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 100 100">
        <path d="M18 78L80 22M18 78h62V22" />
        <path d="M66 78V64h14" />
      </svg>
    );
  }
  if (k.includes('bio')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 100 100">
        <path d="M32 16c0 24 36 36 36 68M68 16c0 24-36 36-36 68" />
        <path d="M36 32h28M36 68h28M34 50h32" />
      </svg>
    );
  }
  if (k.includes('acc') || k.includes('fin') || k.includes('eco')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 100 100">
        <rect x="18" y="18" width="64" height="64" rx="8" />
        <path d="M30 66V48M50 66V34M70 66V42M26 28h48" />
      </svg>
    );
  }
  return (
    <svg className="ev-subj-sketch" viewBox="0 0 100 100">
      <rect x="18" y="22" width="64" height="56" rx="8" />
      <path d="M34 42l10 10-10 10M50 62h16" />
    </svg>
  );
};

export const HeroSketchSvg: React.FC = () => (
  <svg className="ev-hero-sketch" viewBox="0 0 180 140" aria-hidden="true">
    <path d="M90 22L28 52l62 30 62-30-62-30z" />
    <path d="M52 68v28c0 12 76 12 76 0V68" />
    <path d="M148 54v36l-6 12h12l-6-12" />
  </svg>
);

export const LevelRingSvg: React.FC<{ size?: number; strokeWidth?: number; pct?: number }> = ({
  size = 108,
  strokeWidth = 8,
  pct = 0,
}) => {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <svg className="ev-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="evRingGradComp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="60%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <circle className="ev-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={strokeWidth} />
      <circle
        className="ev-ring-prog"
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={strokeWidth}
        stroke="url(#evRingGradComp)"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  );
};

export const FlameMiniSvg: React.FC = () => (
  <svg className="ev-flame-svg" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#F97316" d="M12.6 1.8c.5 3.3 4.9 5.6 4.9 10.6a5.5 5.5 0 0 1-11 0c0-2 .9-3.6 2-4.8.3 1.5 1.1 2.4 2 2.7C10 7.6 10.9 4.6 12.6 1.8z" />
    <path fill="#FFF3C4" d="M12 21a3.2 3.2 0 0 0 3.2-3.2c0-2-3.2-4.6-3.2-4.6s-3.2 2.6-3.2 4.6A3.2 3.2 0 0 0 12 21z" />
  </svg>
);

export const FlameBigSvg: React.FC = () => (
  <svg className="ev-streak-flame" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#F97316" d="M12.6 1.8c.5 3.3 4.9 5.6 4.9 10.6a5.5 5.5 0 0 1-11 0c0-2 .9-3.6 2-4.8.3 1.5 1.1 2.4 2 2.7C10 7.6 10.9 4.6 12.6 1.8z" />
    <path fill="#FDE68A" d="M12 21a3.2 3.2 0 0 0 3.2-3.2c0-2-3.2-4.6-3.2-4.6s-3.2 2.6-3.2 4.6A3.2 3.2 0 0 0 12 21z" />
  </svg>
);

export const MetallicBadgeSvg: React.FC<{ color?: string; label?: string }> = ({ color = '#6366F1', label = 'I' }) => (
  <svg width="48" height="48" viewBox="0 0 54 54" fill="none">
    <polygon points="27,3 49,15 49,39 27,51 5,39 5,15" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="2.4" />
    <polygon points="27,9 43,18 43,36 27,45 11,36 11,18" fill={color} fillOpacity="0.88" />
    <text x="27" y="32" textAnchor="middle" fill="#FFFFFF" fontWeight="800" fontSize="14">{label}</text>
  </svg>
);

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen, setUserProfile, language } = useExamStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;
  const isBn = language !== 'en';

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    try {
      setStatusMsg(isBn ? `${provider === 'google' ? 'Google' : 'Facebook'}-এ সংযোগ হচ্ছে...` : `Connecting to ${provider}...`);
      await signInWithOAuthProvider(provider);
    } catch (err: any) {
      setStatusMsg(err?.message || (isBn ? 'OAuth সংযোগ সম্ভব হয়নি, ইমেইল দিয়ে চেষ্টা করুন।' : 'OAuth failed.'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const profile = await signInOrSignUpUser({
        mode,
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setUserProfile({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        isAuthenticated: true,
      });
      setAuthModalOpen(false);
    } catch (err: any) {
      setStatusMsg(err?.message || (isBn ? 'সঠিক ইমেইল ও পাসওয়ার্ড দিন।' : 'Authentication error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ev-modal-backdrop is-open" onClick={() => setAuthModalOpen(false)}>
      <div className="ev-auth-card" onClick={(e) => e.stopPropagation()}>
        <div className="ev-auth-form-side">
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 25, fontWeight: 800, color: '#111827' }}>
              {mode === 'signin' ? (isBn ? 'সাইন ইন করুন' : 'Sign In') : isBn ? 'নতুন অ্যাকাউন্ট' : 'Create Account'}
            </h2>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginTop: 4 }}>
              {isBn ? 'আপনার অগ্রগতি ক্লাউডে সুরক্ষিত রাখুন' : 'Sync your progress securely to the cloud'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              style={{
                height: 42,
                borderRadius: 999,
                border: '1.5px solid #E5E7EB',
                background: '#FFFFFF',
                color: '#111827',
                fontWeight: 700,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z" />
                <path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z" />
                <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.4 7.4 24 12 24z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('facebook')}
              style={{
                height: 42,
                borderRadius: 999,
                border: '1.5px solid #1877F2',
                background: '#1877F2',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          <div style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: '#9CA3AF', marginBottom: 12 }}>
            — {isBn ? 'অথবা ইমেইল ব্যবহার করুন' : 'OR USE EMAIL'} —
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <div className="ev-auth-pill-input">
                <span>👤</span>
                <input
                  type="text"
                  placeholder={isBn ? 'তোমার পূর্ণ নাম (Full Name)' : 'Full Name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="ev-auth-pill-input">
              <span>✉️</span>
              <input
                type="email"
                placeholder={isBn ? 'ইমেইল অ্যাড্রেস (E-mail)' : 'E-mail'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="ev-auth-pill-input">
              <span>🔒</span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder={isBn ? 'পাসওয়ার্ড (Password)' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ fontSize: 13, color: '#6D28D9', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            {statusMsg && (
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#4F46E5',
                  background: 'rgba(79,70,229,0.08)',
                  padding: '8px 12px',
                  borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                {statusMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                height: 44,
                borderRadius: 999,
                background: 'linear-gradient(90deg, #8B5CF6 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                fontSize: 13.5,
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {loading ? '...' : mode === 'signin' ? (isBn ? 'সাইন ইন করুন' : 'SIGN IN') : isBn ? 'অ্যাকাউন্ট খুলুন' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
            {mode === 'signin' ? (
              <>
                {isBn ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  style={{ color: '#5B21B6', fontWeight: 800, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {isBn ? 'নতুন তৈরি করুন' : 'Create'}
                </button>
              </>
            ) : (
              <>
                {isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  style={{ color: '#5B21B6', fontWeight: 800, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {isBn ? 'সাইন ইন করুন' : 'Sign In'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="ev-auth-cloud-side">
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              width: 34,
              height: 34,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.18)',
              color: '#FFFFFF',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
          <ExamVerseLogo size={54} />
          <h3 style={{ fontSize: 22, fontWeight: 800, marginTop: 12 }}>ExamVerse</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.88)', marginTop: 6 }}>
            {isBn
              ? 'অধ্যায়ভিত্তিক অনুশীলন, সূত্রের খাতা, ১v১ কুইজ ব্যাটল ও রিয়েল-টাইম লিডারবোর্ডে নিজের অবস্থান এগিয়ে নাও।'
              : 'Practice chapter-wise MCQs, master formulas, and compete on the live leaderboard.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setSettingsModalOpen,
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    userName,
    setUserProfile,
    resetAllDemoAndProgress,
  } = useExamStore();

  const [tempName, setTempName] = useState(userName);

  if (!isSettingsModalOpen) return null;
  const isBn = language !== 'en';

  return (
    <div className="ev-modal-backdrop is-open" onClick={() => setSettingsModalOpen(false)}>
      <div className="ev-modal-panel" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="ev-section-header">
          <h3 className="ev-section-title">⚙️ {isBn ? 'সেটিংস ও ভাষা' : 'Settings & Language'}</h3>
          <button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => setSettingsModalOpen(false)}>
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>
              {isBn ? 'তোমার নাম (Display Name)' : 'Display Name'}
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="ev-input"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
              <button
                className="ev-btn ev-btn-primary"
                onClick={() => {
                  if (tempName.trim()) setUserProfile({ name: tempName.trim() });
                  setSettingsModalOpen(false);
                }}
              >
                {isBn ? 'সেভ' : 'Save'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>
              {isBn ? 'ভাষা নির্বাচন (Language)' : 'Language'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {(['bn', 'en', 'bilingual'] as const).map((lng) => (
                <button
                  key={lng}
                  onClick={() => setLanguage(lng)}
                  className={`ev-btn ${language === lng ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                >
                  {lng === 'bn' ? 'বাংলা' : lng === 'en' ? 'English' : 'বাং + EN'}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 12,
              background: 'var(--bg-surface-muted)',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13.5 }}>{isBn ? 'ডার্ক থিম (Dark Mode)' : 'Dark Theme'}</span>
            <button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={toggleDarkMode}>
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: 12,
              background: 'var(--status-danger-bg)',
              border: '1px solid var(--status-danger-border)',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--status-danger-text)' }}>
              {isBn ? 'সব পুরনো ডেমো বা লোকাল রেকর্ড মুছুন' : 'Reset Local Progress'}
            </span>
            <button
              className="ev-btn ev-btn-danger ev-btn-sm"
              onClick={() => {
                resetAllDemoAndProgress();
                setSettingsModalOpen(false);
              }}
            >
              {isBn ? 'রিসেট' : 'Reset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const QuizRunnerModal: React.FC = () => {
  const { activeQuiz, closeQuiz, recordExamResult, submitQuestionReport, userName, language } = useExamStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitted, setSubmitted] = useState(false);
  const [openCqSolution, setOpenCqSolution] = useState<Record<string, boolean>>({});

  const [reportOpen, setReportOpen] = useState(false);
  const [reportIssueType, setReportIssueType] = useState('উত্তর ভুল আছে (Wrong Answer Key)');
  const [reportComment, setReportComment] = useState('');
  const [reportSentMsg, setReportSentMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeQuiz) {
      setCurrentIndex(0);
      setAnswers({});
      setFlagged({});
      setTimeLeft(activeQuiz.durationSec || 600);
      setSubmitted(false);
      setReportOpen(false);
      setReportSentMsg(null);
    }
  }, [activeQuiz]);

  useEffect(() => {
    if (!activeQuiz || submitted || activeQuiz.examType === 'cq') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, submitted]);

  if (!activeQuiz) return null;
  const isBn = language !== 'en';
  const questions = activeQuiz.questions || [];
  const currentQ = questions[currentIndex];

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSubmitExam = () => {
    if (submitted) return;
    setSubmitted(true);

    let correctCount = 0;
    const newMistakes: MistakeItem[] = [];
    const attemptedCount = Object.keys(answers).length;

    questions.forEach((q, idx) => {
      const chosen = answers[idx];
      if (chosen === q.ans) {
        correctCount++;
      } else if (chosen !== undefined) {
        newMistakes.push({
          id: `mistake-${Date.now()}-${idx}`,
          questionId: q.id,
          subjectId: activeQuiz.subjectId,
          subjectName: trText(activeQuiz.subjectName, language),
          chapterName: trText(activeQuiz.chapterName, language),
          question: q.q,
          options: q.options,
          correctIndex: q.ans,
          selectedIndex: chosen,
          explanation: q.explanation,
          wrongCount: 1,
          lastMissedAt: new Date().toISOString().slice(0, 10),
          mastered: false,
        });
      }
    });

    const total = Math.max(1, questions.length);
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / total) * 100) : 0;
    const xpEarned = attemptedCount > 0 ? correctCount * 12 + (accuracy >= 80 ? 30 : 10) : 0;

    recordExamResult(
      {
        subjectId: activeQuiz.subjectId,
        subjectName: trText(activeQuiz.subjectName, language),
        chapterId: activeQuiz.chapterId,
        chapterName: trText(activeQuiz.chapterName, language),
        mode: 'mcq',
        score: correctCount,
        total,
        accuracy,
        timeSpentSec: Math.max(5, activeQuiz.durationSec - timeLeft),
        xpEarned,
      },
      newMistakes
    );
  };

  const handleSendReport = () => {
    if (!currentQ) return;
    const opts = currentQ.options.bn?.length ? currentQ.options.bn : currentQ.options.en;
    submitQuestionReport({
      questionId: currentQ.id,
      subjectId: activeQuiz.subjectId,
      subjectName: trText(activeQuiz.subjectName, 'bn'),
      chapterId: activeQuiz.chapterId,
      chapterName: trText(activeQuiz.chapterName, 'bn'),
      questionText: trText(currentQ.q, 'bn'),
      options: opts,
      currentAns: currentQ.ans,
      issueType: reportIssueType,
      comment: reportComment.trim() || reportIssueType,
      reportedBy: userName,
    });
    setReportComment('');
    setReportSentMsg(isBn ? '✅ রিপোর্ট অ্যাডমিন প্যানেলে পাঠানো হয়েছে!' : '✅ Report sent to Admin!');
    setTimeout(() => {
      setReportOpen(false);
      setReportSentMsg(null);
    }, 1100);
  };

  if (activeQuiz.examType === 'cq') {
    return (
      <div className="ev-modal-backdrop is-open">
        <div className="ev-card" style={{ width: '100%', maxWidth: 860, maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="ev-section-header">
            <h3 className="ev-section-title">
              📝 {trText(activeQuiz.subjectName, language)} — {trText(activeQuiz.chapterName, language)}
            </h3>
            <button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={closeQuiz}>
              ✕ {isBn ? 'বন্ধ করো' : 'Close'}
            </button>
          </div>
          {activeQuiz.cqs.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {isBn ? 'এই অধ্যায়ে এখনো কোনো সৃজনশীল প্রশ্ন যুক্ত করা হয়নি।' : 'No Creative Questions added yet.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeQuiz.cqs.map((cq, idx) => (
                <div key={cq.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--brand-primary)', marginBottom: 6 }}>
                    {isBn ? `উদ্দীপক #${idx + 1}` : `Stem #${idx + 1}`}
                  </div>
                  <p style={{ marginBottom: 12, fontWeight: 600 }}>{trText(cq.stem, language)}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
                    <div><strong>ক:</strong> {trText(cq.a, language)}</div>
                    <div><strong>খ:</strong> {trText(cq.b, language)}</div>
                    <div><strong>গ:</strong> {trText(cq.c, language)}</div>
                    <div><strong>ঘ:</strong> {trText(cq.d, language)}</div>
                  </div>
                  <button
                    className="ev-btn ev-btn-secondary ev-btn-sm"
                    style={{ marginTop: 10 }}
                    onClick={() => setOpenCqSolution((p) => ({ ...p, [cq.id]: !p[cq.id] }))}
                  >
                    {openCqSolution[cq.id] ? (isBn ? 'উত্তর লুকাও' : 'Hide Answer') : isBn ? 'নমুনা উত্তর দেখো' : 'Model Answer'}
                  </button>
                  {openCqSolution[cq.id] && (
                    <div className="ev-explanation-box">
                      <div><strong>ক:</strong> {trText(cq.ansA, language)}</div>
                      <div><strong>খ:</strong> {trText(cq.ansB, language)}</div>
                      <div><strong>গ:</strong> {trText(cq.ansC, language)}</div>
                      <div><strong>ঘ:</strong> {trText(cq.ansD, language)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="ev-modal-backdrop is-open" onClick={closeQuiz}>
        <div className="ev-modal-panel" style={{ maxWidth: 440, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
            {trText(activeQuiz.subjectName, language)} • {trText(activeQuiz.chapterName, language)}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            {isBn
              ? 'এই অধ্যায়ে এখনো কোনো MCQ প্রশ্ন আপলোড করা হয়নি। খুব শীঘ্রই প্রশ্ন যুক্ত করা হবে!'
              : 'No MCQ questions have been uploaded for this chapter yet.'}
          </p>
          <button className="ev-btn ev-btn-primary" onClick={closeQuiz}>
            {isBn ? 'ফিরে যাও' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const optionLabels = isBn ? ['ক', 'খ', 'গ', 'ঘ'] : ['A', 'B', 'C', 'D'];
  const optionsArray =
    language === 'en'
      ? currentQ?.options.en || currentQ?.options.bn || []
      : currentQ?.options.bn || currentQ?.options.en || [];

  return (
    <div className="ev-modal-backdrop is-open" style={{ alignItems: 'flex-start', paddingTop: 16, overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 1100, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="ev-card ev-quiz-header-bar" style={{ marginBottom: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>
              {trText(activeQuiz.subjectName, language)} • {trText(activeQuiz.chapterName, language)}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600 }}>
              {trKey('question', language)} {currentIndex + 1} / {questions.length} • {trKey('answered', language)}: {answeredCount}/{questions.length}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className={`ev-timer-badge font-mono ${timeLeft <= 60 && !submitted ? 'is-urgent' : ''}`}>
              ⏱️ {formatTimer(timeLeft)}
            </div>
            <button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={closeQuiz}>
              ✕
            </button>
          </div>
        </div>

        <div className="ev-quiz-layout">
          <div className="ev-card ev-question-card">
            {currentQ && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="ev-badge-pill ev-badge-indigo">#{currentIndex + 1}</span>
                    {currentQ.boardTag && (
                      <span className="ev-badge-pill ev-badge-warning">{currentQ.boardTag}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      className="ev-btn ev-btn-secondary ev-btn-sm"
                      onClick={() => setFlagged((p) => ({ ...p, [currentIndex]: !p[currentIndex] }))}
                    >
                      {flagged[currentIndex] ? '🚩 মার্ককৃত' : '🏳️ মার্ক'}
                    </button>
                    <button
                      type="button"
                      className="ev-btn ev-btn-danger ev-btn-sm"
                      onClick={() => setReportOpen(!reportOpen)}
                    >
                      ⚠️ {isBn ? 'ভুল রিপোর্ট' : 'Report'}
                    </button>
                  </div>
                </div>

                {reportOpen && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 12,
                      background: 'var(--status-danger-bg)',
                      border: '1px solid var(--status-danger-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--status-danger-text)' }}>
                      🚩 {isBn ? 'এই প্রশ্ন বা উত্তরে ভুল রিপোর্ট করুন (অ্যাডমিন যাচাই করবেন)' : 'Report Question Error'}
                    </div>
                    <select
                      className="ev-select"
                      value={reportIssueType}
                      onChange={(e) => setReportIssueType(e.target.value)}
                    >
                      <option value="উত্তর ভুল আছে (Wrong Answer)">উত্তর ভুল আছে (Wrong Answer)</option>
                      <option value="প্রশ্নে বা অপশনে বানান ভুল (Typo)">প্রশ্নে বা অপশনে বানান ভুল (Typo)</option>
                      <option value="ব্যাখ্যা অস্পষ্ট বা ভুল (Explanation Issue)">ব্যাখ্যা অস্পষ্ট বা ভুল</option>
                    </select>
                    <input
                      type="text"
                      className="ev-input"
                      placeholder={isBn ? 'সঠিক উত্তর বা মন্তব্য লিখুন...' : 'Write correct answer or note...'}
                      value={reportComment}
                      onChange={(e) => setReportComment(e.target.value)}
                    />
                    {reportSentMsg ? (
                      <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--status-success)' }}>{reportSentMsg}</div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => setReportOpen(false)}>
                          {isBn ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button type="button" className="ev-btn ev-btn-primary ev-btn-sm" onClick={handleSendReport}>
                          {isBn ? 'রিপোর্ট পাঠাও' : 'Submit Report'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="ev-question-text">{trText(currentQ.q, language)}</div>

                <div className="ev-options-list">
                  {optionsArray.map((optText, optIdx) => {
                    const isSelected = answers[currentIndex] === optIdx;
                    let cls = '';
                    if (submitted) {
                      if (optIdx === currentQ.ans) cls = 'is-correct';
                      else if (isSelected && optIdx !== currentQ.ans) cls = 'is-incorrect';
                    } else if (isSelected) {
                      cls = 'is-selected';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={submitted}
                        className={`ev-option-btn ${cls}`}
                        onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }))}
                      >
                        <span className="ev-option-key">{optionLabels[optIdx] || optIdx + 1}</span>
                        <span style={{ flex: 1 }}>{optText}</span>
                        {submitted && optIdx === currentQ.ans && <span>✅</span>}
                        {submitted && isSelected && optIdx !== currentQ.ans && <span>❌</span>}
                      </button>
                    );
                  })}
                </div>

                {submitted && currentQ.explanation && (
                  <div className="ev-explanation-box">
                    💡 <strong>{isBn ? 'ব্যাখ্যা:' : 'Explanation:'}</strong> {trText(currentQ.explanation, language)}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    className="ev-btn ev-btn-secondary"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  >
                    ← {trKey('prev_q', language)}
                  </button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {currentIndex < questions.length - 1 && (
                      <button
                        className="ev-btn ev-btn-primary"
                        onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                      >
                        {trKey('next_q', language)} →
                      </button>
                    )}

                    {!submitted ? (
                      <button className="ev-btn ev-btn-primary" onClick={handleSubmitExam}>
                        ✅ {trKey('submit_exam', language)}
                      </button>
                    ) : (
                      <button className="ev-btn ev-btn-primary" onClick={closeQuiz}>
                        {isBn ? 'সম্পন্ন' : 'Finish'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="ev-card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
              🧭 {trKey('question_palette', language)}
            </div>
            <div className="ev-palette-grid">
              {questions.map((q, idx) => {
                const chosen = answers[idx];
                let dotCls = '';
                if (submitted) {
                  dotCls = chosen === q.ans ? 'is-correct' : chosen !== undefined ? 'is-incorrect' : '';
                } else if (idx === currentIndex) {
                  dotCls = 'is-current';
                } else if (chosen !== undefined) {
                  dotCls = 'is-answered';
                }
                return (
                  <button
                    key={q.id}
                    className={`ev-palette-dot ${dotCls} ${flagged[idx] ? 'is-bookmarked' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {!submitted && (
              <button
                className="ev-btn ev-btn-primary"
                style={{ width: '100%', marginTop: 14 }}
                onClick={handleSubmitExam}
              >
                ✅ {trKey('submit_exam', language)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
