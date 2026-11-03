import React, { useState } from 'react';
import { Subject, QuestionMCQ, QuizSession, QuizHistoryItem } from '../types';
import { SUBJECTS, CREATIVE_QUESTIONS, getSubjectQuestionCount } from '../data/syllabusData';
import {
  signInWithOAuthProvider,
  signInWithVerifiedEmail,
  signUpWithVerifiedEmail,
  sendPasswordResetEmail,
  updateAccountCredentials
} from '../lib/supabase';

/* 17 Distinct Subject Icons + Subject-Specific Card Background Sketch Watermarks */
export const SubjectVisual: React.FC<{ subjectId: string; mode: 'icon' | 'art' }> = ({ subjectId, mode }) => {
  if (mode === 'art') {
    switch (subjectId) {
      case 'physics':
        return (
          <svg className="ev-subj-bg-art" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="50" cy="50" r="36" />
            <ellipse cx="50" cy="50" rx="36" ry="13" transform="rotate(35 50 50)" />
            <ellipse cx="50" cy="50" rx="36" ry="13" transform="rotate(-35 50 50)" />
            <text x="20" y="92" fontSize="14" fontWeight="800" fill="currentColor" stroke="none">E=mc²</text>
          </svg>
        );
      case 'chemistry':
        return (
          <svg className="ev-subj-bg-art" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="50,14 80,32 80,68 50,86 20,68 20,32" />
            <circle cx="50" cy="50" r="18" />
            <text x="32" y="55" fontSize="14" fontWeight="800" fill="currentColor" stroke="none">H₂O</text>
          </svg>
        );
      case 'math':
        return (
          <svg className="ev-subj-bg-art" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 80 Q 38 15, 55 50 T 90 20" />
            <line x1="15" y1="80" x2="90" y2="80" />
            <line x1="20" y1="15" x2="20" y2="85" />
            <text x="50" y="72" fontSize="18" fontWeight="800" fill="currentColor" stroke="none">∫dx</text>
          </svg>
        );
      case 'biology':
        return (
          <svg className="ev-subj-bg-art" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M25 15c25 0 25 70 50 70M75 15c-25 0-25 70-50 70" />
            <line x1="33" y1="30" x2="67" y2="30" />
            <line x1="38" y1="50" x2="62" y2="50" />
            <line x1="33" y1="70" x2="67" y2="70" />
          </svg>
        );
      case 'accounting':
        return (
          <svg className="ev-subj-bg-art" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="20" y="40" width="12" height="42" />
            <rect x="42" y="26" width="12" height="56" />
            <rect x="64" y="14" width="12" height="68" />
            <text x="16" y="28" fontSize="12" fontWeight="800" fill="currentColor" stroke="none">A=L+OE</text>
          </svg>
        );
      case 'finance':
        return (
          <svg className="ev-subj-bg-art" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,75 38,52 55,62 82,24" />
            <polyline points="66,24 82,24 82,40" />
            <text x="20" y="90" fontSize="13" fontWeight="800" fill="currentColor" stroke="none">NPV•IRR</text>
          </svg>
        );
      case 'bangla':
        return (
          <svg className="ev-subj-bg-art" viewBox="0 0 100 100">
            <text x="28" y="74" fontSize="54" fontWeight="800" fill="currentColor">অ</text>
          </svg>
        );
      case 'english':
        return (
          <svg className="ev-subj-bg-art" viewBox="0 0 100 100">
            <text x="20" y="72" fontSize="44" fontWeight="800" fill="currentColor">Aa</text>
          </svg>
        );
      case 'ict':
        return (
          <svg className="ev-subj-bg-art" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="26" y="26" width="48" height="48" rx="6" />
            <text x="34" y="56" fontSize="16" fontWeight="800" fill="currentColor" stroke="none">101</text>
          </svg>
        );
      default:
        return (
          <svg className="ev-subj-bg-art" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="50" cy="50" r="34" />
            <polygon points="50,18 82,40 18,40" />
            <line x1="26" y1="40" x2="26" y2="76" />
            <line x1="50" y1="40" x2="50" y2="76" />
            <line x1="74" y1="40" x2="74" y2="76" />
          </svg>
        );
    }
  }

  switch (subjectId) {
    case 'physics':
      return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9"><circle cx="12" cy="12" r="2.2" fill="currentColor"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(-30 12 12)"/></svg>;
    case 'chemistry':
      return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 3h6m-5 0v5.2L4.6 18.4A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.8-2.6L14 8.2V3"/><path d="M6.8 14.5h10.4"/></svg>;
    case 'math':
      return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 4H6l6.5 8L6 20h12"/></svg>;
    case 'biology':
      return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M4 3c8 0 8 18 16 18M20 3c-8 0-8 18-16 18M6.5 6.5h11M6.5 17.5h11"/></svg>;
    case 'accounting':
    case 'finance':
      return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="16" x2="16" y2="16"/></svg>;
    case 'management':
    case 'marketing':
      return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
    case 'ict':
      return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>;
    default:
      return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
  }
};

export const SubjectCard: React.FC<{
  subject: Subject;
  mastery: number;
  customCount?: number;
  onStart: (subjectId: string) => void;
}> = ({ subject, mastery, customCount, onStart }) => {
  const count = typeof customCount === 'number' ? customCount : getSubjectQuestionCount(subject.id);
  return (
    <button
      type="button"
      className="ev-card ev-subject-card"
      style={{
        borderColor: subject.borderColor,
        background: `linear-gradient(155deg, var(--bg-surface) 58%, ${subject.bgSoft} 100%)`
      }}
      onClick={() => onStart(subject.id)}
    >
      <div style={{ color: subject.color }}>
        <SubjectVisual subjectId={subject.id} mode="art" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', zIndex: 1 }}>
        <div
          className="ev-subject-icon-box"
          style={{ background: subject.bgSoft, color: subject.color, borderColor: subject.borderColor }}
        >
          <SubjectVisual subjectId={subject.id} mode="icon" />
        </div>
        <span
          className="ev-badge-pill"
          style={{ background: subject.bgSoft, color: subject.color, border: `1px solid ${subject.borderColor}` }}
        >
          {subject.tagBn}
        </span>
      </div>
      <div style={{ zIndex: 1, marginTop: '0.15rem' }}>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{subject.name}</div>
        <div className="font-bn" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {subject.nameBn}
        </div>
      </div>
      <div style={{ width: '100%', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
          <span>{subject.chapters.length} অধ্যায় • {count} MCQ</span>
          <span style={{ color: subject.color }}>{mastery}%</span>
        </div>
        <div className="ev-progress-track">
          <div className="ev-progress-fill" style={{ width: `${mastery}%`, background: subject.color }} />
        </div>
      </div>
    </button>
  );
};

/* Section 3.1 FIX: Complete Auth Modal with Sign In, Sign Up, Password Reset & Account Security */
export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  authEmail: string | null;
  onSignOut: () => void;
  showToast: (msg: string) => void;
}> = ({ isOpen, onClose, authEmail, onSignOut, showToast }) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [fullName, setFullName] = useState('');
  const [group, setGroup] = useState('Science (বিজ্ঞান বিভাগ)');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === 'reset') {
        await sendPasswordResetEmail(email);
        showToast('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে!');
        setTab('signin');
      } else if (tab === 'signup') {
        const res = await signUpWithVerifiedEmail(email, password, fullName, group);
        if (res.session) {
          showToast('একাউন্ট তৈরি ও ডাটাবেসে সিঙ্ক সম্পন্ন হয়েছে!');
          onClose();
        } else {
          showToast('একাউন্ট তৈরি হয়েছে! ইমেইলের ইনবক্স থেকে ভেরিফিকেশন লিংকটি কনফার্ম করুন।');
        }
      } else {
        await signInWithVerifiedEmail(email, password);
        showToast('সফলভাবে লগইন হয়েছে!');
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication error');
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateAccountCredentials({ password: newPassword });
      setNewPassword('');
      showToast('পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!');
    } catch (err: any) {
      showToast(err.message || 'Password update failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ev-modal-backdrop" onClick={onClose}>
      <div className="ev-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.12rem', fontWeight: 800 }}>Account Authentication &amp; Security</h3>
          <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={onClose}>Close</button>
        </div>

        {authEmail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)' }}>
              <div style={{ fontWeight: 800, color: 'var(--status-success-text)', marginBottom: '0.25rem' }}>
                ✓ Signed In as {authEmail}
              </div>
              <p className="font-bn" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                আপনার একাউন্টের প্রগ্রেস, বুকমার্ক, মিসটেক ব্যাংক এবং কুইজ হিস্ট্রি ক্লাউডে সংরক্ষিত আছে।
              </p>
            </div>

            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="password"
                className="ev-input"
                placeholder="নতুন পাসওয়ার্ড দিন (কমপক্ষে ৬ অক্ষর)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit" className="ev-btn ev-btn-soft ev-btn-sm" disabled={busy}>
                Update Password
              </button>
            </form>

            <button type="button" className="ev-btn ev-btn-danger" onClick={onSignOut}>
              Sign Out from This Device
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.95rem' }}>
              <button
                type="button"
                className="ev-btn ev-btn-secondary"
                onClick={() => signInWithOAuthProvider('google').catch((e) => showToast(e.message))}
              >
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"/><path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.8C3.5 21.4 7.4 24 12 24z"/></svg>
                <span>Google Login</span>
              </button>
              <button
                type="button"
                className="ev-btn ev-btn-secondary"
                onClick={() => signInWithOAuthProvider('facebook').catch((e) => showToast(e.message))}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Facebook Login</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem', padding: '0.25rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-sm)', marginBottom: '0.95rem' }}>
              <button type="button" className={`ev-btn ev-btn-sm ${tab === 'signin' ? 'ev-btn-primary' : 'ev-btn-secondary'}`} onClick={() => setTab('signin')}>
                Sign In
              </button>
              <button type="button" className={`ev-btn ev-btn-sm ${tab === 'signup' ? 'ev-btn-primary' : 'ev-btn-secondary'}`} onClick={() => setTab('signup')}>
                Create Account
              </button>
              <button type="button" className={`ev-btn ev-btn-sm ${tab === 'reset' ? 'ev-btn-primary' : 'ev-btn-secondary'}`} onClick={() => setTab('reset')}>
                Reset Password
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {tab === 'signup' && (
                <>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>আপনার পূর্ণ নাম (Full Name)</label>
                    <input type="text" className="ev-input" placeholder="e.g., Tahmid Hasan" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>আপনার বিভাগ (Group)</label>
                    <select className="ev-select" value={group} onChange={(e) => setGroup(e.target.value)}>
                      <option value="Science (বিজ্ঞান বিভাগ)">বিজ্ঞান বিভাগ (Science)</option>
                      <option value="Commerce (ব্যবসায় শিক্ষা বিভাগ)">ব্যবসায় শিক্ষা বিভাগ (Commerce)</option>
                      <option value="Arts (মানবিক বিভাগ)">মানবিক বিভাগ (Arts / Humanities)</option>
                      <option value="BCS & Jobs (বিসিএস ও চাকরি)">বিসিএস ও ব্যাংক জব (BCS &amp; Jobs)</option>
                    </select>
                  </div>
                </>
              )}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>আসল ইমেইল অ্যাড্রেস (Authentic Email)</label>
                <input type="email" className="ev-input" placeholder="yourname@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {tab !== 'reset' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)</label>
                  <input type="password" className="ev-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              )}
              <button type="submit" className="ev-btn ev-btn-primary" disabled={busy} style={{ marginTop: '0.35rem' }}>
                {busy ? 'Processing...' : tab === 'signup' ? 'Create Verified Account' : tab === 'reset' ? 'Send Password Reset Link' : 'Sign In'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

/* Section 3.3 FIX: Complete MCQ Quiz Engine with 1–N Question Navigator Grid, Mark for Review & Pre-Submit Summary */
export const QuizSection: React.FC<{
  session: QuizSession | null;
  lastResult: QuizHistoryItem | null;
  bookmarks: string[];
  onSelectOption: (idx: number) => void;
  onNavigateQuestion: (idx: number) => void;
  onToggleMarkForReview: (qId: string) => void;
  onSubmitQuiz: () => void;
  onToggleBookmark: (qId: string) => void;
  onStartNewQuiz: () => void;
}> = ({
  session,
  lastResult,
  bookmarks,
  onSelectOption,
  onNavigateQuestion,
  onToggleMarkForReview,
  onSubmitQuiz,
  onToggleBookmark,
  onStartNewQuiz
}) => {
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showAnswerReview, setShowAnswerReview] = useState(false);

  if (!session || session.isSubmitted) {
    if (!lastResult) {
      return (
        <div className="ev-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>No Active Exam Session</h2>
          <button type="button" className="ev-btn ev-btn-primary" onClick={onStartNewQuiz}>Start Practice Session</button>
        </div>
      );
    }
    return (
      <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="ev-card">
          <span className="ev-badge-pill ev-badge-success" style={{ marginBottom: '0.5rem' }}>Result Summary</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>{lastResult.title}</h2>
          <div className="ev-grid-4" style={{ marginBottom: '1.25rem' }}>
            <div className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Score</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-success)' }}>
                {lastResult.netScore} / {lastResult.total}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Correct: {lastResult.score} (Neg: -{lastResult.negativeMark})
              </div>
            </div>
            <div className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accuracy</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{lastResult.accuracy}%</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Attempted: {lastResult.attempted}</div>
            </div>
            <div className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wrong / Skipped</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>{lastResult.incorrect} / {lastResult.skipped}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Time: {lastResult.timeTakenSec}s</div>
            </div>
            <div className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>XP Earned</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-primary)' }}>+{lastResult.xpEarned} XP</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button type="button" className="ev-btn ev-btn-primary" onClick={onStartNewQuiz}>Practice Another Set</button>
            <button type="button" className="ev-btn ev-btn-secondary" onClick={() => setShowAnswerReview((r) => !r)}>
              {showAnswerReview ? 'Hide Answer Sheet' : 'Review Answers & Explanations'}
            </button>
          </div>
        </div>

        {showAnswerReview && (
          <div className="ev-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800 }}>Detailed Answer Review</h3>
            {lastResult.questionsSnapshot.map((rq, idx) => {
              const userAns = lastResult.answersSnapshot[rq.id];
              const isOk = userAns === rq.correctIndex;
              return (
                <div key={rq.id} style={{ padding: '0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface-muted)' }}>
                  <div className="font-bn" style={{ fontWeight: 700, marginBottom: '0.35rem' }}>
                    {idx + 1}. {rq.questionBn}
                  </div>
                  <div style={{ fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                    Your Answer:{' '}
                    <strong style={{ color: userAns === undefined ? 'var(--text-muted)' : isOk ? 'var(--status-success)' : 'var(--status-danger)' }}>
                      {userAns === undefined ? 'Skipped' : rq.options[userAns]}
                    </strong>{' '}
                    | Correct Answer: <strong style={{ color: 'var(--status-success)' }}>{rq.options[rq.correctIndex]}</strong>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>💡 {rq.explanation}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const total = session.questions.length;
  const q: QuestionMCQ = session.questions[session.currentIndex];
  const chosen = session.answers[q.id];
  const isRevealed = session.mode === 'practice' && Boolean(session.revealed[q.id]);
  const isBookmarked = bookmarks.includes(q.id);
  const isMarkedReview = Boolean(session.markedForReview?.[q.id]);

  const answeredCount = Object.keys(session.answers).length;
  const unansweredCount = total - answeredCount;
  const markedCount = Object.values(session.markedForReview || {}).filter(Boolean).length;

  const mins = String(Math.floor(session.remainingSec / 60)).padStart(2, '0');
  const secs = String(session.remainingSec % 60).padStart(2, '0');

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
      {/* Top Quiz Status Header (Page 14 Layout) */}
      <div className="ev-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="ev-badge-pill ev-badge-indigo">
              {session.mode === 'exam' ? `Exam Mode (Neg: -${session.negativeMark})` : 'Practice Mode'}
            </span>
            <strong style={{ fontSize: '1rem' }}>{session.title}</strong>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Question {session.currentIndex + 1} / {total} • Answered {answeredCount} • Unanswered {unansweredCount}
            {markedCount > 0 ? ` • Marked for Review ${markedCount}` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span className={`ev-badge-pill ${session.remainingSec <= 30 ? 'ev-badge-danger' : 'ev-badge-warning'} font-mono`} style={{ fontSize: '0.9rem' }}>
            ⏱ {mins}:{secs}
          </span>
          <button type="button" className="ev-btn ev-btn-primary ev-btn-sm" onClick={() => setShowSubmitConfirm(true)}>
            Submit Exam
          </button>
        </div>
      </div>

      {/* Pre-Submit Confirmation & Summary Banner */}
      {showSubmitConfirm && (
        <div className="ev-card" style={{ marginBottom: '1rem', border: '2px solid var(--brand-primary)', background: 'var(--brand-primary-soft)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem' }}>📋 Exam Summary Before Submit</h3>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.86rem', marginBottom: '0.85rem' }}>
            <span>Total Questions: <strong>{total}</strong></span>
            <span style={{ color: 'var(--status-success-text)' }}>Answered: <strong>{answeredCount}</strong></span>
            <span style={{ color: 'var(--status-danger-text)' }}>Unanswered: <strong>{unansweredCount}</strong></span>
            <span style={{ color: 'var(--status-warning-text)' }}>Marked for Review: <strong>{markedCount}</strong></span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              className="ev-btn ev-btn-primary ev-btn-sm"
              onClick={() => {
                setShowSubmitConfirm(false);
                onSubmitQuiz();
              }}
            >
              ✓ Confirm &amp; Submit Final Answers
            </button>
            <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => setShowSubmitConfirm(false)}>
              Return to Quiz
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: '1rem', alignItems: 'start' }}>
        {/* Left: Question & Options Card */}
        <div className="ev-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
              Question {session.currentIndex + 1} of {total} • {q.examTag}
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className={`ev-btn ev-btn-sm ${isMarkedReview ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                onClick={() => onToggleMarkForReview(q.id)}
              >
                {isMarkedReview ? '⚑ Marked for Review' : '⚐ Mark for Review'}
              </button>
              <button
                type="button"
                className={`ev-btn ev-btn-sm ${isBookmarked ? 'ev-btn-soft' : 'ev-btn-secondary'}`}
                onClick={() => onToggleBookmark(q.id)}
              >
                {isBookmarked ? '★ Saved' : '☆ Save'}
              </button>
            </div>
          </div>

          <div className="font-bn" style={{ fontSize: '1.12rem', fontWeight: 700, marginBottom: '0.35rem' }}>{q.questionBn}</div>
          {q.question !== q.questionBn && (
            <div style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{q.question}</div>
          )}

          {q.statements && q.statements.length > 0 && (
            <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-sm)', borderLeft: '3.5px solid var(--brand-accent)', marginBottom: '1rem' }}>
              {q.statements.map((st, i) => (
                <div key={i} className="font-bn" style={{ fontSize: '0.92rem', padding: '0.2rem 0' }}>{st}</div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {q.options.map((opt, idx) => {
              let cls = 'ev-option-btn';
              if (isRevealed) {
                if (idx === q.correctIndex) cls += ' is-correct';
                else if (chosen === idx) cls += ' is-incorrect';
              } else if (chosen === idx) {
                cls += ' is-selected';
              }
              return (
                <button key={idx} type="button" className={cls} onClick={() => onSelectOption(idx)}>
                  <span className="ev-badge-pill ev-badge-neutral">{String.fromCharCode(65 + idx)}</span>
                  <span className="font-bn">{opt}</span>
                </button>
              );
            })}
          </div>

          {isRevealed && (
            <div style={{ marginTop: '1.15rem', padding: '1rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-muted)', borderLeft: '4px solid var(--brand-primary)' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--brand-primary)' }}>Explanation (ব্যাখ্যা):</div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{q.explanation}</div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" className="ev-btn ev-btn-secondary" disabled={session.currentIndex === 0} onClick={() => onNavigateQuestion(session.currentIndex - 1)}>
              ← Previous
            </button>
            {session.currentIndex < total - 1 ? (
              <button type="button" className="ev-btn ev-btn-primary" onClick={() => onNavigateQuestion(session.currentIndex + 1)}>
                Next →
              </button>
            ) : (
              <button type="button" className="ev-btn ev-btn-primary" onClick={() => setShowSubmitConfirm(true)}>
                Review &amp; Submit
              </button>
            )}
          </div>
        </div>

        {/* Right: 1–N Question Navigator Grid (Pages 14–15 Specification) */}
        <div className="ev-card">
          <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            1–{total} Question Navigator
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            {answeredCount} Answered • {unansweredCount} Unanswered
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem', marginBottom: '0.9rem' }}>
            {session.questions.map((item, idx) => {
              const isCurr = idx === session.currentIndex;
              const isAns = session.answers[item.id] !== undefined;
              const isRev = Boolean(session.markedForReview?.[item.id]);
              let bg = 'var(--bg-surface-muted)';
              let col = 'var(--text-secondary)';
              let border = '1px solid var(--border-subtle)';
              if (isRev) {
                bg = 'var(--status-warning-bg)';
                col = 'var(--status-warning-text)';
                border = '1.5px solid var(--status-warning)';
              } else if (isAns) {
                bg = 'var(--brand-primary)';
                col = '#FFFFFF';
                border = '1.5px solid var(--brand-primary)';
              }
              if (isCurr) {
                border = '2.5px solid var(--brand-accent)';
              }
              return (
                <button
                  key={item.id}
                  type="button"
                  style={{
                    height: '36px',
                    borderRadius: '6px',
                    background: bg,
                    color: col,
                    border,
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => onNavigateQuestion(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>🟦 Answered ({answeredCount})</span>
            <span>🟨 Marked for Review ({markedCount})</span>
            <span>⬜ Unanswered ({unansweredCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Section 3.4 FIX: Full Creative Question (CQ) Study Experience (Subject Filter, stemBn + stemEn, Self-Answer Box, Rubric & Progress Save) */
export const CreativeQuestionsView: React.FC<{
  cqScores: Record<string, { marks: number; date: string; userAnswer?: string }>;
  onSaveCqProgress: (cqId: string, marks: number, userAnswer: string) => void;
}> = ({ cqScores, onSaveCqProgress }) => {
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [selectedMarks, setSelectedMarks] = useState<Record<string, number>>({});

  const filteredCqs = CREATIVE_QUESTIONS.filter(
    (cq) => subjectFilter === 'all' || cq.subjectId === subjectFilter
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <span className="ev-badge-pill ev-badge-indigo" style={{ marginBottom: '0.3rem' }}>Board Standard CQ Practice</span>
          <h1 className="font-bn" style={{ fontSize: '1.35rem', fontWeight: 800 }}>✍️ সৃজনশীল প্রশ্ন ও অনুশীলন (Creative Questions — CQ)</h1>
        </div>
        <select className="ev-select" style={{ maxWidth: '260px' }} value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
          <option value="all">সকল বিষয় (All Subjects)</option>
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>{s.nameBn} ({s.name})</option>
          ))}
        </select>
      </div>

      {filteredCqs.map((cq) => {
        const saved = cqScores[cq.id];
        return (
          <div key={cq.id} className="ev-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="ev-badge-pill ev-badge-indigo">{cq.boardTag}</span>
              {saved && (
                <span className="ev-badge-pill ev-badge-success">
                  ✓ Completed ({saved.marks}/10 Marks on {saved.date})
                </span>
              )}
            </div>

            <h3 className="font-bn" style={{ fontSize: '1.14rem', fontWeight: 800, marginBottom: '0.65rem' }}>{cq.title}</h3>

            {/* Stimulus Box showing both stemBn and stemEn (Audit 3.4 fix) */}
            <div style={{ padding: '1rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--brand-primary)', marginBottom: '1rem' }}>
              <div className="font-bn" style={{ fontWeight: 700, marginBottom: '0.35rem' }}>উদ্দীপক: {cq.stemBn}</div>
              {cq.stemEn && (
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Stimulus (EN): {cq.stemEn}</div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {(['ka', 'kha', 'ga', 'gha'] as const).map((partKey) => {
                const pt = cq.parts[partKey];
                const key = `${cq.id}_${partKey}`;
                return (
                  <div key={partKey} style={{ padding: '0.9rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div className="font-bn" style={{ fontWeight: 700 }}>{pt.label}: {pt.question}</div>
                      <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={() => setRevealed((r) => ({ ...r, [key]: !r[key] }))}>
                        {revealed[key] ? 'উত্তর লুকান' : 'আদর্শ উত্তর ও নির্দেশিকা'}
                      </button>
                    </div>
                    <textarea
                      className="ev-input font-bn"
                      rows={2}
                      placeholder="এখানে আপনার নিজের উত্তরটি অনুশীলন হিসেবে লিখুন..."
                      value={draftAnswers[key] ?? ''}
                      onChange={(e) => setDraftAnswers((d) => ({ ...d, [key]: e.target.value }))}
                    />
                    {revealed[key] && (
                      <div className="font-bn" style={{ marginTop: '0.6rem', padding: '0.75rem', background: 'var(--status-success-bg)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                        <strong>বোর্ড আদর্শ উত্তর ও নম্বর বণ্টন ({pt.marks} নম্বর):</strong> {pt.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 10-Mark Self-Evaluation Progress Saver */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span className="font-bn" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                আদর্শ উত্তরের সাথে মিলিয়ে ১০ নম্বরের মধ্যে আপনার প্রাপ্ত নম্বর সংরক্ষণ করুন:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  className="ev-select"
                  style={{ width: '130px' }}
                  value={selectedMarks[cq.id] ?? saved?.marks ?? 8}
                  onChange={(e) => setSelectedMarks((m) => ({ ...m, [cq.id]: Number(e.target.value) }))}
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((mk) => (
                    <option key={mk} value={mk}>{mk} / 10 Marks</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="ev-btn ev-btn-primary ev-btn-sm"
                  onClick={() => onSaveCqProgress(cq.id, selectedMarks[cq.id] ?? 8, draftAnswers[`${cq.id}_gha`] || '')}
                >
                  Save CQ Progress
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
