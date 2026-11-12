import React, { useEffect, useState } from 'react';
import { getLevelProgress, signInOrSignUpUser, trKey, trText, useExamStore } from '../store/useExamStore';
import { sendPasswordResetEmail, signInWithOAuthProvider } from '../lib/supabase';
import { MCQQuestion, MistakeItem } from '../types';
export const ExamVerseLogo: React.FC<{ size?: number }> = ({ size = 36 }) => (
<svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
<rect x="4" y="4" width="56" height="56" rx="15" fill="#4F46E5" />
<path d="M12 38C16 47 29 51 44 45C52 41.5 55 35 53 29" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
<path d="M16 42V26C21 25 27 26.5 32 30C37 26.5 43 25 48 26V42C43 40.8 37 42 32 45C27 42 21 40.8 16 42Z" fill="#FFFFFF" />
<path d="M32 15L26.5 26.5L29 33H35L37.5 26.5L32 15Z" fill="#EDE9FE" stroke="#312E81" strokeWidth="1.5" strokeLinejoin="round" />
<path d="M32 7.5L33.4 10.6L36.5 12L33.4 13.4L32 16.5L30.6 13.4L27.5 12L30.6 10.6L32 7.5Z" fill="#FDE68A" />
</svg> );
export const EvIcon: React.FC<{ name: string; size?: number }> = ({ name, size = 19 }) => {
const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
switch (name) { case 'home': return <svg {...props}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" /></svg>;
case 'book': return <svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
case 'trophy': return <svg {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" /></svg>;
case 'chart': return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
case 'shield': return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>;
case 'alert': return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
case 'layers': return <svg {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 15h10M7 10h6" /></svg>;
case 'formula': return <svg {...props}><path d="M4 7h16M8 7v11M16 7v8a2 2 0 0 0 4 0" /></svg>;
case 'calendar': return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
case 'zap': return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
case 'message': return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
case 'cloud': return <svg {...props}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>;
case 'user': return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
case 'settings': return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
case 'sun': return <svg {...props}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>;
case 'moon': return <svg {...props}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
case 'more': return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>;
default: return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" /></svg>; } };
export const SubjectSketchSvg: React.FC<{ subjKey: string }> = ({ subjKey }) => { const k = subjKey.toLowerCase();
if (k.includes('phy')) return <svg className="ev-subj-sketch" viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(30 50 50)" /><ellipse cx="50" cy="50" rx="40" ry="15" transform="rotate(-30 50 50)" /><circle cx="50" cy="50" r="6" /></svg>;
if (k.includes('chem')) return <svg className="ev-subj-sketch" viewBox="0 0 100 100"><path d="M36 16h28M42 16v22L20 76a6 6 0 0 0 5 9h50a6 6 0 0 0 5-9L58 38V16" /><path d="M28 62h44" /></svg>;
if (k.includes('math')) return <svg className="ev-subj-sketch" viewBox="0 0 100 100"><path d="M18 78L80 22M18 78h62V22" /><path d="M66 78V64h14" /></svg>;
if (k.includes('bio')) return <svg className="ev-subj-sketch" viewBox="0 0 100 100"><path d="M32 16c0 24 36 36 36 68M68 16c0 24-36 36-36 68" /><path d="M36 32h28M36 68h28M34 50h32" /></svg>;
if (k.includes('acc') || k.includes('fin') || k.includes('eco')) return <svg className="ev-subj-sketch" viewBox="0 0 100 100"><rect x="18" y="18" width="64" height="64" rx="8" /><path d="M30 66V48M50 66V34M70 66V42M26 28h48" /></svg>;
return <svg className="ev-subj-sketch" viewBox="0 0 100 100"><rect x="18" y="22" width="64" height="56" rx="8" /><path d="M34 42l10 10-10 10M50 62h16" /></svg>; };
export const HeroSketchSvg: React.FC = () => ( <svg className="ev-hero-sketch" viewBox="0 0 180 140" aria-hidden="true">
<path d="M90 22L28 52l62 30 62-30-62-30z" />
<path d="M52 68v28c0 12 76 12 76 0V68" />
<path d="M148 54v36l-6 12h12l-6-12" />
</svg> );
export const LevelRingSvg: React.FC<{ size?: number; strokeWidth?: number; pct?: number }> = ({ size = 108, strokeWidth = 8, pct = 0 }) => { const r = (size - strokeWidth) / 2;
const c = 2 * Math.PI * r;
const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
return ( <svg className="ev-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
<defs>
<linearGradient id="evRingGradComp" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stopColor="#6366F1" />
<stop offset="60%" stopColor="#A855F7" />
<stop offset="100%" stopColor="#EC4899" />
</linearGradient>
</defs>
<circle className="ev-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={strokeWidth} />
<circle className="ev-ring-prog" cx={size / 2} cy={size / 2} r={r} strokeWidth={strokeWidth} stroke="url(#evRingGradComp)" strokeDasharray={c} strokeDashoffset={offset} />
</svg> ); };
export const FlameMiniSvg: React.FC = () => ( <svg className="ev-flame-svg" viewBox="0 0 24 24" aria-hidden="true">
<path fill="#F97316" d="M12.6 1.8c.5 3.3 4.9 5.6 4.9 10.6a5.5 5.5 0 0 1-11 0c0-2 .9-3.6 2-4.8.3 1.5 1.1 2.4 2 2.7C10 7.6 10.9 4.6 12.6 1.8z" />
<path fill="#FFF3C4" d="M12 21a3.2 3.2 0 0 0 3.2-3.2c0-2-3.2-4.6-3.2-4.6s-3.2 2.6-3.2 4.6A3.2 3.2 0 0 0 12 21z" />
</svg> );
export const FlameBigSvg: React.FC = () => ( <svg className="ev-streak-flame" viewBox="0 0 24 24" aria-hidden="true">
<path fill="#F97316" d="M12.6 1.8c.5 3.3 4.9 5.6 4.9 10.6a5.5 5.5 0 0 1-11 0c0-2 .9-3.6 2-4.8.3 1.5 1.1 2.4 2 2.7C10 7.6 10.9 4.6 12.6 1.8z" />
<path fill="#FDE68A" d="M12 21a3.2 3.2 0 0 0 3.2-3.2c0-2-3.2-4.6-3.2-4.6s-3.2 2.6-3.2 4.6A3.2 3.2 0 0 0 12 21z" />
</svg> );
export const MetallicBadgeSvg: React.FC<{ color?: string; label?: string }> = ({ color = '#6366F1', label = 'I' }) => ( <svg width="48" height="48" viewBox="0 0 54 54" fill="none">
<polygon points="27,3 49,15 49,39 27,51 5,39 5,15" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="2.4" />
<polygon points="27,9 43,18 43,36 27,45 11,36 11,18" fill={color} fillOpacity="0.88" />
<text x="27" y="32" textAnchor="middle" fill="#FFFFFF" fontWeight="800" fontSize="14">{label}</text>
</svg> );
export const AuthModal: React.FC = () => {
const { isAuthModalOpen, setAuthModalOpen, isAuthenticated, userName, userEmail, userAvatar, xp, streak, selectedClass, selectedGroup, getRankInfo, setUserProfile, logoutUser, language } = useExamStore();
const [mode, setMode] = useState<'signin' | 'signup'>('signin');
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [showPass, setShowPass] = useState(false);
const [loading, setLoading] = useState(false);
const [statusMsg, setStatusMsg] = useState<string | null>(null);
const [editProfileName, setEditProfileName] = useState(userName);
useEffect(() => { setEditProfileName(userName); }, [userName, isAuthModalOpen]);
if (!isAuthModalOpen) return null;
const isBn = language !== 'en';
const rank = getRankInfo();
const lvInfo = getLevelProgress(xp);
const hasPhotoAvatar = isAuthenticated && userAvatar && userAvatar.startsWith('http');
const handleOAuth = async (provider: 'google' | 'facebook') => { try {
setStatusMsg(isBn ? `${provider === 'google' ? 'Google' : 'Facebook'}-এ সংযোগ হচ্ছে...` : `Connecting to ${provider}...`);
await signInWithOAuthProvider(provider); } catch (err: any) { setStatusMsg(err?.message || (isBn ? 'OAuth সংযোগ সম্ভব হয়নি, ইমেইল দিয়ে চেষ্টা করুন।' : 'OAuth failed.')); } };
const handleForgotPassword = async () => { if (!email.trim()) { setStatusMsg(isBn ? 'পাসওয়ার্ড রিসেট করতে আগে উপরের বক্সে আপনার ইমেইল লিখুন।' : 'Enter your email address above first.');
return; }
try { setLoading(true);
await sendPasswordResetEmail(email.trim());
setStatusMsg(isBn ? '✅ আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে!' : '✅ Password reset link sent to your email!'); } catch (err: any) {
setStatusMsg(err?.message || (isBn ? 'পাসওয়ার্ড রিসেট ইমেইল পাঠানো যায়নি।' : 'Failed to send reset email.')); } finally { setLoading(false); } };
const handleSubmit = async (e: React.FormEvent) => { e.preventDefault();
if (!email.trim() || !password.trim()) return;
setLoading(true);
setStatusMsg(null);
try { const profile = await signInOrSignUpUser({ mode, name: name.trim(), email: email.trim(), password });
setUserProfile({ id: profile.id, name: profile.name, email: profile.email, isAuthenticated: true });
setAuthModalOpen(false); } catch (err: any) { setStatusMsg(err?.message || (isBn ? 'সঠিক ইমেইল ও পাসওয়ার্ড দিন।' : 'Authentication error')); } finally { setLoading(false); } };
if (isAuthenticated) { return ( <div className="ev-modal-backdrop is-open" onClick={() => setAuthModalOpen(false)}>
<div className="ev-modal-panel" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
<div className="ev-section-header">
<h3 className="ev-section-title">👤 {isBn ? 'আমার প্রোফাইল ও ক্লাউড অ্যাকাউন্ট' : 'My Profile & Cloud Account'}</h3>
<button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => setAuthModalOpen(false)}>✕</button>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, background: 'var(--bg-surface-muted)', border: '1px solid var(--border-default)', marginBottom: 16 }}>
<div className="ev-avatar-sm" style={{ width: 56, height: 56, fontSize: 22, overflow: 'hidden', flexShrink: 0 }}>
{hasPhotoAvatar ? <img src={userAvatar} alt={userName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <EvIcon name="user" size={26} />}
</div>
<div style={{ minWidth: 0, flex: 1 }}>
<div style={{ fontWeight: 800, fontSize: 17 }}>{userName}</div>
{userEmail && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>{userEmail}</div>}
<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
<span className="ev-badge-pill ev-badge-success">☁️ {isBn ? 'ক্লাউড সিঙ্ক সক্রিয়' : 'Cloud Synced'}</span>
<span className="ev-badge-pill ev-badge-indigo">🛡️ {isBn ? rank.fullTitleBn : rank.fullTitleEn} • Lv.{lvInfo.level}</span>
</div>
</div>
</div>
<div className="ev-grid-3" style={{ marginBottom: 16 }}>
<div className="ev-card" style={{ padding: 10, textAlign: 'center', background: 'var(--bg-surface-muted)' }}>
<div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>XP</div>
<div className="font-mono" style={{ fontSize: 16, fontWeight: 800, color: 'var(--brand-primary)' }}>{xp}</div>
</div>
<div className="ev-card" style={{ padding: 10, textAlign: 'center', background: 'var(--bg-surface-muted)' }}>
<div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>{isBn ? 'স্ট্রিক' : 'Streak'}</div>
<div className="font-mono" style={{ fontSize: 16, fontWeight: 800, color: '#D97706' }}>🔥 {streak}d</div>
</div>
<div className="ev-card" style={{ padding: 10, textAlign: 'center', background: 'var(--bg-surface-muted)' }}>
<div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>{isBn ? 'বিভাগ' : 'Track'}</div>
<div style={{ fontSize: 12.5, fontWeight: 800 }}>{selectedClass} • {selectedGroup}</div>
</div>
</div>
<div style={{ marginBottom: 16 }}>
<label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>{isBn ? 'প্রোফাইল নাম পরিবর্তন করুন' : 'Update Display Name'}</label>
<div style={{ display: 'flex', gap: 8 }}>
<input type="text" className="ev-input" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} />
<button type="button" className="ev-btn ev-btn-primary" onClick={() => { if (editProfileName.trim()) setUserProfile({ name: editProfileName.trim() }); }}>{isBn ? 'সেভ' : 'Save'}</button>
</div>
</div>
<button type="button" className="ev-btn ev-btn-danger" style={{ width: '100%' }} onClick={() => logoutUser()}>
🚪 {isBn ? 'অ্যাকাউন্ট থেকে লগ আউট করুন (Sign Out)' : 'Sign Out'}
</button>
</div>
</div> ); }
return ( <div className="ev-modal-backdrop is-open" onClick={() => setAuthModalOpen(false)}>
<div className="ev-auth-card" onClick={(e) => e.stopPropagation()}>
<div className="ev-auth-form-side">
<div style={{ textAlign: 'center', marginBottom: 18 }}>
<h2 style={{ fontSize: 25, fontWeight: 800, color: '#111827' }}>{mode === 'signin' ? (isBn ? 'সাইন ইন করুন' : 'Sign In') : isBn ? 'নতুন অ্যাকাউন্ট' : 'Create Account'}</h2>
<p style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginTop: 4 }}>{isBn ? 'আপনার অগ্রগতি ক্লাউডে সুরক্ষিত রাখুন' : 'Sync your progress securely to the cloud'}</p>
</div>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
<button type="button" onClick={() => handleOAuth('google')} style={{ height: 42, borderRadius: 999, border: '1.5px solid #E5E7EB', background: '#FFFFFF', color: '#111827', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
<svg width="17" height="17" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z" /><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z" /><path fill="#FBBC05" d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z" /><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.4 7.4 24 12 24z" /></svg>
<span>Google</span>
</button>
<button type="button" onClick={() => handleOAuth('facebook')} style={{ height: 42, borderRadius: 999, border: '1.5px solid #1877F2', background: '#1877F2', color: '#FFFFFF', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" /></svg>
<span>Facebook</span>
</button>
</div>
<div style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: '#9CA3AF', marginBottom: 12 }}>— {isBn ? 'অথবা ইমেইল ব্যবহার করুন' : 'OR USE EMAIL'} —</div>
<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
{mode === 'signup' && ( <div className="ev-auth-pill-input">
<span>👤</span>
<input type="text" placeholder={isBn ? 'তোমার পূর্ণ নাম (Full Name)' : 'Full Name'} value={name} onChange={(e) => setName(e.target.value)} required />
</div> )}
<div className="ev-auth-pill-input">
<span>✉️</span>
<input type="email" placeholder={isBn ? 'ইমেইল অ্যাড্রেস (E-mail)' : 'E-mail'} value={email} onChange={(e) => setEmail(e.target.value)} required />
</div>
<div className="ev-auth-pill-input">
<span>🔒</span>
<input type={showPass ? 'text' : 'password'} placeholder={isBn ? 'পাসওয়ার্ড (Password)' : 'Password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
<button type="button" onClick={() => setShowPass(!showPass)} style={{ fontSize: 13, color: '#6D28D9', background: 'none', border: 'none', cursor: 'pointer' }}>{showPass ? '🙈' : '👁️'}</button>
</div>
{mode === 'signin' && ( <div style={{ textAlign: 'right', marginTop: -4 }}>
<button type="button" onClick={handleForgotPassword} style={{ fontSize: 12, fontWeight: 700, color: '#6D28D9', background: 'none', border: 'none', cursor: 'pointer' }}>{isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}</button>
</div> )}
{statusMsg && <div style={{ fontSize: 12.5, fontWeight: 600, color: '#4F46E5', background: 'rgba(79,70,229,0.08)', padding: '8px 12px', borderRadius: 10, textAlign: 'center' }}>{statusMsg}</div>}
<button type="submit" disabled={loading} style={{ marginTop: 4, height: 44, borderRadius: 999, background: 'linear-gradient(90deg, #8B5CF6 0%, #4F46E5 100%)', color: '#FFFFFF', fontSize: 13.5, fontWeight: 800, border: 'none', cursor: 'pointer' }}>
{loading ? '...' : mode === 'signin' ? (isBn ? 'সাইন ইন করুন' : 'SIGN IN') : isBn ? 'অ্যাকাউন্ট খুলুন' : 'CREATE ACCOUNT'}
</button>
</form>
<div style={{ textAlign: 'center', marginTop: 14, fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
{mode === 'signin' ? (
<>{isBn ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}<button type="button" onClick={() => { setMode('signup'); setStatusMsg(null); }} style={{ color: '#5B21B6', fontWeight: 800, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>{isBn ? 'নতুন তৈরি করুন' : 'Create'}</button></>
) : (
<>{isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}<button type="button" onClick={() => { setMode('signin'); setStatusMsg(null); }} style={{ color: '#5B21B6', fontWeight: 800, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>{isBn ? 'সাইন ইন করুন' : 'Sign In'}</button></>
)}
</div>
</div>
<div className="ev-auth-cloud-side">
<button type="button" onClick={() => setAuthModalOpen(false)} style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: 999, background: 'rgba(255,255,255,0.18)', color: '#FFFFFF', fontWeight: 800, border: 'none', cursor: 'pointer' }}>✕</button>
<ExamVerseLogo size={54} />
<h3 style={{ fontSize: 22, fontWeight: 800, marginTop: 12 }}>ExamVerse</h3>
<p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.88)', marginTop: 6 }}>
{isBn ? 'অধ্যায়ভিত্তিক অনুশীলন, সূত্রের খাতা, ১v১ কুইজ ব্যাটল ও রিয়েল-টাইম লিডারবোর্ডে নিজের অবস্থান এগিয়ে নাও।' : 'Practice chapter-wise MCQs, master formulas, and compete on the live leaderboard.'}
</p>
</div>
</div>
</div> ); };
export const SettingsModal: React.FC = () => {
const { isSettingsModalOpen, setSettingsModalOpen, language, setLanguage, darkMode, toggleDarkMode, userName, isAuthenticated, setUserProfile, logoutUser, resetAllDemoAndProgress } = useExamStore();
const [tempName, setTempName] = useState(userName);
useEffect(() => { setTempName(userName); }, [userName, isSettingsModalOpen]);
if (!isSettingsModalOpen) return null;
const isBn = language !== 'en';
return ( <div className="ev-modal-backdrop is-open" onClick={() => setSettingsModalOpen(false)}>
<div className="ev-modal-panel" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
<div className="ev-section-header">
<h3 className="ev-section-title">⚙️ {isBn ? 'সেটিংস ও ভাষা' : 'Settings & Language'}</h3>
<button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => setSettingsModalOpen(false)}>✕</button>
</div>
<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
<div>
<label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>{isBn ? 'তোমার নাম (Display Name)' : 'Display Name'}</label>
<div style={{ display: 'flex', gap: 8 }}>
<input type="text" className="ev-input" value={tempName} onChange={(e) => setTempName(e.target.value)} />
<button className="ev-btn ev-btn-primary" onClick={() => { if (tempName.trim()) setUserProfile({ name: tempName.trim() }); setSettingsModalOpen(false); }}>{isBn ? 'সেভ' : 'Save'}</button>
</div>
</div>
<div>
<label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>{isBn ? 'ভাষা নির্বাচন (Language)' : 'Language'}</label>
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
{(['bn', 'en', 'bilingual'] as const).map((lng) => ( <button key={lng} onClick={() => setLanguage(lng)} className={`ev-btn ${language === lng ? 'ev-btn-primary' : 'ev-btn-secondary'}`}>
{lng === 'bn' ? 'বাংলা' : lng === 'en' ? 'English' : 'বাং + EN'}
</button> ))}
</div>
</div>
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: 'var(--bg-surface-muted)' }}>
<span style={{ fontWeight: 700, fontSize: 13.5 }}>{isBn ? 'ডার্ক থিম (Dark Mode)' : 'Dark Theme'}</span>
<button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={toggleDarkMode}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
</div>
{isAuthenticated && ( <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: 'var(--bg-surface-muted)' }}>
<span style={{ fontWeight: 700, fontSize: 13.5 }}>{isBn ? 'ক্লাউড অ্যাকাউন্ট থেকে লগ আউট' : 'Sign Out of Cloud Account'}</span>
<button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => { logoutUser(); setSettingsModalOpen(false); }}>🚪 {isBn ? 'লগ আউট' : 'Sign Out'}</button>
</div> )}
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)' }}>
<span style={{ fontWeight: 700, fontSize: 13, color: 'var(--status-danger-text)' }}>{isBn ? 'সব পুরনো ডেমো বা লোকাল রেকর্ড মুছুন' : 'Reset Local Progress'}</span>
<button className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => { resetAllDemoAndProgress(); setSettingsModalOpen(false); }}>{isBn ? 'রিসেট' : 'Reset'}</button>
</div>
</div>
</div>
</div> ); };
const EXACT_MATH_EXPLANATIONS: Record<string, string> = { 'ACC1-034': 'স্থায়ী সম্পদ ক্রয়ে ভ্যাট ও সংস্থাপন/বহন খরচ সম্পদের ক্রয়মূল্যের সাথে যুক্ত হয়: ৬৯,০০০ + ১,০০০ = ৭০,০০০ টাকা।',
'ACC1-080': 'নগদান বই অনুযায়ী জের = ব্যাংক বিবরণীর জের ১৫,০০০ - অনুপস্থাপিত চেক ৩,০০০ = ১২,০০০ টাকা।',
'ACC1-081': 'ব্যাংক বিবরণীর জের = ২০,০০০ + সরাসরি জমা ৫,০০০ - প্রত্যাখ্যাত চেক ৪,০০০ - ব্যাংক চার্জ ২০০ = ২০,৮০০ টাকা।',
'ACC1-083': 'আদায় ১০,০০০ টাকা ক্রেডিট না করে ভুলবশত ডেবিট করায় দ্বিগুণ অর্থাৎ ১০,০০০ × ২ = ২০,০০০ টাকা ক্রেডিট করতে হবে।',
'ACC1-084': '২৬০ টাকা ক্রেডিটের পরিবর্তে ভুলক্রমে ৬২০ টাকা ডেবিট করায় মোট গরমিল = ২৬০ + ৬২০ = ৮৮০ টাকা।',
'ACC1-098': 'সমন্বিত ক্রয় = প্রারম্ভিক মজুদ ২৫,০০০ + নিট ক্রয় ১,৫০,০০০ - সমাপনী মজুদ ৩০,০০০ = ১,৪৫,০০০ টাকা।',
'ACC1-101': 'রেওয়ামিলে সমন্বিত ক্রয় থাকলে প্রারম্ভিক মজুদ পণ্য রেওয়ামিলে অন্তর্ভুক্ত হয় না, বরং সমাপনী মজুদ অন্তর্ভুক্ত হয়।',
'ACC1-102': 'ক্রয় = সমন্বিত ক্রয় ১,৫০,০০০ + সমাপনী মজুদ ২০,০০০ - প্রারম্ভিক মজুদ ৩০,০০০ = ১,৪০,০০০ টাকা।',
'ACC1-107': 'ডেবিট দিকে (ক্রয়) ৫,০০০ টাকা কম এবং ক্রেডিট দিকেও (বিক্রয়) ৫,০০০ টাকা কম লেখায় একটি ভুল অপর ভুলকে পূরণ করেছে (পরিপূরক ভুল)।',
'ACC1-108': 'উভয় দিকেই ৫,০০০ টাকা করে কম লেখায় রেওয়ামিলের যোগফলে ৫,০০০ টাকা কম হয়েছে।', 'ACC1-115': 'ক্রয় (ডেবিট) ও বিক্রয় (ক্রেডিট) উভয় দিকেই সমপরিমাণ ৫,০০০ টাকা কম লেখায় এটি পরিপূরক ভুল।',
'ACC1-116': 'যন্ত্রপাতি (স্থায়ী সম্পদ) ক্রয়কে মুনাফাজাতীয় ক্রয় হিসাবে ডেবিট করায় স্থায়ী সম্পদ ১০,০০০ টাকা হ্রাস পাবে (নীতিগত ভুল)।',
'ACC1-120': 'মুনাফাজাতীয় ব্যয়কে (যন্ত্রপাতি মেরামত) মূলধনজাতীয় সম্পদ (যন্ত্রপাতি) হিসাবে দেখানো নীতিগত ভুল।',
'ACC1-143': 'রক্ষণশীলতার নীতি অনুযায়ী সমাপনী মজুদ পণ্যের ক্রয়মূল্য ও বাজারমূল্যের মধ্যে যেটি কম (১৫,৫০,০০০ টাকা) সেটিই হিসাবভুক্ত হয়।',
'ACC1-160': 'নতুন অনাদায়ী পাওনা সঞ্চিতি = পুরাতন সঞ্চিতি ৪,০০০ + বৃদ্ধি ২,০০০ = ৬,০০০ টাকা।',
'ACC1-161': 'অনাদায়ী পাওনা খরচ = অনাদায়ী পাওনা ৫,০০০ + নতুন সঞ্চিতি ৬,০০০ - পুরাতন সঞ্চিতি ৪,০০০ = ৭,০০০ টাকা।',
'ACC1-164': 'সমাপনী প্রাপ্য হিসাব = ৫০,০০০ + ৯০,০০০ - ৬০,০০০ = ৮০,০০০ টাকা। ১০% সঞ্চিতি = ৮০,০০০ × ১০% = ৮,০০০ টাকা।',
'ACC1-165': 'নিট প্রাপ্য হিসাব = সমাপনী প্রাপ্য হিসাব ৮০,০০০ - ১০% সঞ্চিতি ৮,০০০ = ৭২,০০০ টাকা।',
'ACC1-166': 'পুরাতন সঞ্চিতি ৪,০০০ এর স্থলে ৭,০০০ টাকা হলে সঞ্চিতি ৩,০০০ টাকা বাড়বে, ফলে নিট সম্পদ ও দায়/মালিকানাস্বত্ব ৩,০০০ টাকা হ্রাস পাবে।',
'ACC1-173': 'মার্চ মাসের অবশিষ্ট ৩০ দিন + এপ্রিল ৩০ দিন = ৬০ দিন (৩০ এপ্রিল) + ৩ দিন অনুগ্রহ দিবস = ০৩ মে ২০১৬।',
'ACC1-174': 'নতুন সঞ্চিতি = (প্রাপ্য হিসাব ৫০,০০০ - অনাদায়ী পাওনা ২,০০০) × ৫% = ৪৮,০০০ × ৫% = ২,৪০০ টাকা।',
'ACC1-176': 'নতুন অনাদায়ী পাওনা সঞ্চিতি = পুরাতন সঞ্চিতি ৮,০০০ + বৃদ্ধি ৫,০০০ = ১৩,০০০ টাকা।',
'ACC1-178': 'নিট বিক্রয় = ১০,০০,০০০ - ২০,০০০ = ৯,৮০,০০০; ধারে বিক্রয় = ১০,০০,০০০ × ৮০% - ২০,০০০ = ৭,৮০,০০০; ২% সঞ্চিতি = ৭,৮০,০০০ × ২% = ১৫,৬০০ টাকা।',
'ACC1-195': 'ব্যবহৃত সাপ্লাইজ খরচ = প্রারম্ভিক সাপ্লাইজ ১,০০০ - সমাপনী সাপ্লাইজ ৬০০ = ৪০০ টাকা (সাপ্লাইজ খরচ ডেবিট ৪০০; সাপ্লাইজ ক্রেডিট ৪০০)।',
'ACC1-202': 'ব্যবহৃত সাপ্লাইজ খরচ = ১,৩৫০ - ৮০০ = ৫৫০ টাকা (সাপ্লাইজ খরচ ডেবিট ৫৫০; সাপ্লাইজ ক্রেডিট ৫৫০)।',
'ACC1-210': 'মাসিক বেতন = ৪০,০০০ ÷ ১০ = ৪,০০০ টাকা। ১ বছরে (১২ মাসে) বকেয়া ২ মাসের বেতন = ৪,০০০ × ২ = ৮,০০০ টাকা।',
'ACC1-212': 'অবশিষ্ট অনুপার্জিত সেবা আয় = ৫০,০০০ × (১ - ২/৫) = ৫০,০০০ × ৩/৫ = ৩০,০০০ টাকা।', 'ACC1-221': 'মেশিন হিসাবে ডেবিট = ক্রয়মূল্য ২০,০০০ + পরিবহন ৫০০ + সংস্থাপন ২,০০০ = ২২,৫০০ টাকা।',
'ACC1-222': 'যন্ত্রপাতি হিসাবে ডেবিট = ৩০,০০০ + ৩,০০০ + ৭,০০০ = ৪০,০০০ টাকা।', 'ACC1-223': 'যন্ত্রটির ক্রয়মূল্য = পুস্তক মূল্য ২৫,০০০ + পুঞ্জীভূত অবচয় ১৫,০০০ = ৪০,০০০ টাকা।',
'ACC1-224': 'বিক্রয়জনিত লাভ = বিক্রয়মূল্য ৩০,০০০ - পুস্তক মূল্য ২৫,০০০ = ৫,০০০ টাকা লাভ।', 'ACC1-234': 'বার্ষিক অবচয় = (মোট ব্যয় ১,০০,০০০ - ভগ্নাবশেষ ২০,০০০) ÷ ১০ বছর = ৮,০০০ টাকা।',
'ACC1-235': 'অবচয়ের হার = (১০০% ÷ ১০) × ২ = ২০%। ২০২৩ সালের ৬ মাসের অবচয় = ১,০০,০০০ × ২০% × (৬/১২) = ১০,০০০ টাকা।',
'ACC1-252': 'নিট বিক্রয় = ৩,৯০,০০০; মোট লাভ = ৩,৯০,০০০ × ৪০% = ১,৫৬,০০০; নিট লাভ = ১,৫৬,০০০ × ৩০% = ৪৬,৮০০; পরোক্ষ খরচ = ১,৫৬,০০০ - ৪৬,৮০০ = ১,০৯,২০০ টাকা।',
'ACC1-253': 'বিক্রীত পণ্যের ব্যয় = ২২,০০০ + ১,৩৫,০০০ + ১০,০০০ - ৩৬,০০০ = ১,৩১,০০০; মোট লাভ = ৩,৭৫,০০০ - ১,৩১,০০০ = ২,৪৪,০০০ টাকা।',
'ACC1-254': 'বিক্রীত পণ্যের ব্যয় = ২৫,০০০ + ১,০০,০০০ + ৪,০০০ - ২০,০০০ = ১,০৯,০০০ টাকা।',
'ACC1-257': 'নিট ভ্যাটসহ ক্রয় = ৭১,০০০ - ২,০০০ = ৬৯,০০০ টাকা। ক্রয় ভ্যাট = ৬৯,০০০ × ১৫ ÷ ১১৫ = ৯,০০০ টাকা।',
'ACC1-258': 'ক্রয়মূল্যের ওপর ২৫% (১/৪ অংশ) হলে বিক্রয়মূল্যের ওপর লাভের হার = ১ ÷ (৪ + ১) = ১/৫ বা ২০%।',
'ACC1-260': 'বিক্রয়মূল্যের ওপর ২০% (১/৫ অংশ) হলে ক্রয়মূল্যের ওপর মুনাফার হার = ১ ÷ (৫ - ১) = ১/৪ বা ২৫%।',
'ACC1-261': 'বিক্রয় = বিক্রীত পণ্যের ব্যয় ৩,০০,০০০ + মোট লাভ ২,০০,০০০ = ৫,০০,০০০ টাকা।',
'ACC1-262': 'সমাপনী মজুদ = প্রারম্ভিক মজুদ ৩০,০০০ + ক্রয় ৪,০০,০০০ - বিক্রীত পণ্যের ব্যয় ৩,৩০,০০০ = ১,০০,০০০ টাকা।', 'ACC1-263': 'কমিশন = ৪৪,০০০ × ১০ ÷ ১১০ = ৪,০০০ টাকা।',
'ACC1-264': 'সমন্বিত ক্রয় = প্রারম্ভিক মজুদ ৬০,০০০ + নিট ক্রয় ১,৫০,০০০ - সমাপনী মজুদ ৩০,০০০ = ১,৮০,০০০ টাকা।',
'ACC1-265': 'সমাপনী মজুদ ক্রয়মূল্য ৩০,০০০ এর স্থলে বাজারমূল্য ২০,০০০ টাকা ধরা হলে সমাপনী মজুদ ও মোট লাভ উভয়ই ১০,০০০ টাকা হ্রাস পায়।',
'ACC1-268': 'প্রারম্ভিক মূলধন = ৩০,০০০ ÷ ০.৭৫ = ৪০,০০০ টাকা। ৫% হারে সুদ = ৪০,০০০ × ৫% = ২,০০০ টাকা।',
'ACC1-269': 'সমাপনী মূলধন = প্রারম্ভিক মূলধন ১,৭০,০০০ + নিট লাভ ৫০,০০০ - উত্তোলন ২০,০০০ = ২,০০,০০০ টাকা।',
'ACC1-277': 'নিট মুনাফা ২০,০০০ টাকা বৃদ্ধি পেলে মালিকানাস্বত্ব ও মোট সম্পদ ২০,০০০ টাকা বৃদ্ধি পাবে।',
'ACC1-290': 'প্রতি মাসে ১,০০০ টাকা নগদ উত্তোলনের সুদ = ১,০০০ × ১০% × ৬.৫ = ৬৫০ টাকা (অথবা গড় ৬ মাসে ৬০০ টাকা)।',
'ACC1-291': 'প্রতি মাসের শুরুতে উত্তোলনের সুদ = মাসিক উত্তোলন ১,০০০ × সুদের হার ৫% × ৬.৫ = ৩২৫ টাকা।',
'ACC1-292': 'মোট সম্পদ = ২০,০০০ + ২৫,০০০ + ১৫,০০০ + ৩০,০০০ + বকেয়া সুদ ১,৫০০ = ৯১,৫০০; মোট বহির্দায় = ১০,০০০ + ১৫,০০০ + ৫,০০০ + ১০,০০০ = ৪০,০০০; সমাপনী মূলধন = ৫০,০০০ টাকা।',
'ACC1-293': 'নিট লাভ = সমাপনী মূলধন ৭৫,০০০ - প্রারম্ভিক মূলধন ৫০,০০০ = ২৫,০০০ টাকা।',
'ACC1-296': 'অতিরিক্ত মূলধন = নিজ পকেট হতে কারবারের বকেয়া বেতন পরিশোধ ১০,০০০ + ব্যক্তিগত কম্পিউটার প্রদান ২০,০০০ = ৩০,০০০ টাকা।',
'ACC1-297': 'মোট উত্তোলন = নগদ উত্তোলন (৫০০ × ৩ বার = ১,৫০০) + পণ্য উত্তোলন ২,০০০ = ৩,৫০০ টাকা।',
'ACC2-006': 'প্রদত্ত বেতন = বেতন ব্যয় ১৮,০০০ - চলতি বকেয়া ৫,০০০ + বিগত বকেয়া ২,৫০০ = ১৫,৫০০ টাকা।',
'ACC2-012': 'মাসিক ভাড়া = ২৯,২৫০ ÷ ৯ = ৩,২৫০ টাকা। ৩ মাসের বকেয়া ভাড়া = ৩,২৫০ × ৩ = ৯,৭৫০ টাকা।',
'ACC2-015': 'চলতি বছরের প্রদত্ত ভাড়া (৪/৫ অংশ) = ৬৪,০০০ - ৪,০০০ = ৬০,০০০ টাকা। মোট ভাড়া = ৬০,০০০ × ৫ ÷ ৪ = ৭৫,০০০ টাকা।',
'ACC2-016': 'মোট ভাড়া ৭৫,০০০ টাকার ১/৫ অংশ বকেয়া = ৭৫,০০০ ÷ ৫ = ১৫,০০০ টাকা।',
'ACC2-017': '১/৫ অংশ অপ্রদত্ত থাকায় প্রদত্ত ১৮,০০০ টাকা হলো ৪/৫ অংশ। মোট ভাড়া খরচ = ১৮,০০০ × ৫ ÷ ৪ = ২২,৫০০ টাকা।',
'ACC2-018': 'চলতি বছরের বেতন খরচ = প্রদত্ত ১৩,০০০ + চলতি বকেয়া ৩,০০০ - গত বছরের বকেয়া ২,৫০০ = ১৩,৫০০ টাকা।', 'ACC2-025': 'প্রদত্ত বেতন = ১৮,০০০ - ৫,০০০ + ২,৫০০ = ১৫,৫০০ টাকা।',
'ACC2-026': 'প্রারম্ভিক মূলধন তহবিল = প্রারম্ভিক সম্পদ (১২,০০০ + ৪০,০০০ + ৬০,০০০ + বকেয়া চাঁদা ৫,৪০০) - প্রারম্ভিক দায় (৪,০০০ + ১,২০০) = ১,১২,২০০ টাকা।',
'ACC2-028': 'বার্ষিক মোট চাঁদা = ৮০ × ৫০০ = ৪০,০০০ টাকা। চলতি বছরে নগদ প্রাপ্ত চাঁদা = ৩৪,০০০ - ২,৫০০ - ৩,০০০ = ২৮,৫০০; বকেয়া = ৪০,০০০ - (২৮,৫০০ + ২,০০০) = ৯,৫০০ টাকা।',
'ACC2-029': 'কমিশনের হার = (কমিশন ৭০০ ÷ কমিশন-পরবর্তী নিট মুনাফা ৩৫,০০০) × ১০০% = ২%।', 'ACC2-041': 'প্রতি মাসের শেষে উত্তোলন করলে সুদ = মাসিক উত্তোলন ৩০০ × ১০% × ৫.৫ = ১৬৫ টাকা।',
'ACC2-042': 'মোট মূলধনের সুদ = (৫,০০,০০০ + ৩,০০,০০০ + ৪,০০,০০০) × ১০% = ১২,০০,০০০ × ১০% = ১,২০,০০০ টাকা।',
'ACC2-043': 'বণ্টনযোগ্য মুনাফা = ৪,৫১,০০০ - ১,২০,০০০ = ৩,৩১,০০০ টাকা। রুপার কমিশন = ৩,৩১,০০০ × ১০ ÷ ১১০ = ৩০,০৯১ টাকা।', 'ACC2-044': 'Y-এর মুনাফা = ৯০,০০০ × ১/৩ = ৩০,০০০ টাকা।',
'ACC2-045': 'মুনাফা বণ্টনের অনুপাত = ২৭,০০০ : ১৮,০০০ = ৩ : ২।', 'ACC2-047': 'চুক্তির অবর্তমানে ঋণের সুদের হার ৬%। ৩১ মার্চ হতে ৩১ ডিসেম্বর (৯ মাস) সুদ = ১০,০০০ × ৬% × (৯/১২) = ৪৫০ টাকা।',
'ACC2-049': 'চুক্তির অবর্তমানে ৬% হারে ৬ মাসের ঋণের সুদ = ১,০০,০০০ × ৬% × (৬/১২) = ৩,০০০ টাকা।',
'ACC2-051': 'উত্তোলনের তারিখ উল্লেখ না থাকলে গড়ে ৬ মাসের সুদ ধরা হয়: ২০,০০০ × ১০% × (৬/১২) = ১,০০০ টাকা।',
'ACC2-061': 'বার্ষিক মোট উত্তোলন = (৫০০ + ৪০০ + ৩০০) × ১২ মাস = ১,২০০ × ১২ = ১৪,৪০০ টাকা।',
'ACC2-063': 'পরিচালন কার্যক্রম হতে নিট নগদ প্রবাহ = নিট মুনাফা ৭০,০০০ + অবচয় ২০,০০০ + অবলোপন ১০,০০০ = ১,০০,০০০ টাকা।',
'ACC2-064': 'বিনিয়োগ কার্যক্রম হতে নিট নগদ প্রবাহ = মেশিন বিক্রয় ৮০,০০০ - দীর্ঘমেয়াদি বিনিয়োগ ক্রয় ৩০,০০০ = ৫০,০০০ টাকা।',
'ACC2-065': 'নিট নগদ প্রবাহ = নিট আয় ১,৩২,০০০ + প্রদেয় হিসাব বৃদ্ধি ১০,০০০ + মজুদ হ্রাস ৭,০০০ - প্রাপ্য হিসাব বৃদ্ধি ১০,০০০ = ১,৩৯,০০০ টাকা।',
'ACC2-066': 'নগদ প্রদান = পরিচালন খরচ ১,০০,০০০ - অগ্রিম খরচ হ্রাস ৭,৬০০ - বকেয়া খরচ বৃদ্ধি ৩,৪০০ = ৮৯,০০০ টাকা।',
'ACC2-118': 'শেয়ার প্রতি আদায় = ১০ - (১০ × ৫%) = ৯.৫০ টাকা। ৩,৫০০ শেয়ারে মোট আদায় = ৩,৫০০ × ৯.৫০ = ৩৩,২৫০ টাকা।',
'ACC2-120': 'শেয়ার প্রতি অধিহার = ১০ × ১০% = ১ টাকা। ইস্যুকৃত ৮,০০০ শেয়ারে মোট অধিহার = ৮,০০০ × ১ = ৮,০০০ টাকা।',
'ACC2-122': 'ইস্যুকৃত ৭৫,০০০ শেয়ারের ৮৫% বণ্টন = ৭৫,০০০ × ৮৫% = ৬৩,৭৫০টি শেয়ার।', 'ACC2-123': 'মোট অবহার = ৬৩,৭৫০টি শেয়ার × ২ টাকা = ১,২৭,৫০০ টাকা।',
'ACC2-135': 'নিট ভ্যাটসহ ক্রয় = ৩৫,০০০ - ৫০০ = ৩৪,৫০০ টাকা। ক্রয় ভ্যাট = ৩৪,৫০০ × ১৫ ÷ ১১৫ = ৪,৫০০ টাকা।',
'ACC2-136': 'নিট ভ্যাটসহ ক্রয় = ৩৬,৫০০ - ২,০০০ = ৩৪,৫০০ টাকা। ক্রয় ভ্যাট = ৩৪,৫০০ × ১৫ ÷ ১১৫ = ৪,৫০০ টাকা।',
'ACC2-137': 'মোট বিজ্ঞাপন = ১২,০০০ + ৪,০০০ = ১৬,০০০ টাকা। ৩/৪ অংশ বিলম্বিত হওয়ায় চলতি বছরের ব্যয় (১/৪ অংশ) = ১৬,০০০ ÷ ৪ = ৪,০০০ টাকা।',
'ACC2-153': 'মোট বেতন = ১৮,০০০ × ৫ ÷ ৩ = ৩০,০০০ টাকা।', 'ACC2-154': 'মোট ভাড়া = ৬০,০০০ × ৩ ÷ ২ = ৯০,০০০ টাকা।',
'ACC2-155': '৩ মাসের সুদ ৩০০ টাকা হলে বার্ষিক সুদ = ১,২০০ টাকা। ৬% হারে বিনিয়োগ = ১,২০০ ÷ ৬% = ২০,০০০ টাকা।', 'ACC2-156': 'কমিশন = ৫৫,০০০ × ১০ ÷ ১১০ = ৫,০০০ টাকা।',
'ACC2-169': 'চলতি সম্পদ = নগদান ৯০,০০০ + মজুদ পণ্য ২০,০০০ + প্রাপ্য হিসাব ৪০,০০০ = ১,৫০,০০০ টাকা।',
'ACC2-170': 'কার্যকরী মূলধন = চলতি সম্পদ ১,৫০,০০০ - চলতি দায় (২৫,০০০ + ৫০,০০০) = ৭৫,০০০ টাকা।',
'ACC2-172': 'চলতি সম্পদ = ৮,০০,০০০ × ১/৪ = ২,০০,০০০ টাকা। কার্যকরী মূলধন = ২,০০,০০০ - ১,০০,০০০ = ১,০০,০০০ টাকা।',
'ACC2-177': 'মালিকানাস্বত্ব = মোট সম্পদ ৪০,০০,০০০ - মোট বহির্দায় ২৫,০০,০০০ = ১৫,০০,০০০ টাকা।', 'ACC2-178': 'দায়-মোট সম্পত্তি অনুপাত = ২৫,০০,০০০ ÷ ৪০,০০,০০০ = ০.৬২৫ : ১।',
'ACC2-180': 'নিট লাভ = ১০,৫০০ - ২,১০০ = ৮,৪০০ টাকা। নিট লাভের হার = (৮,৪০০ ÷ ৪২,০০০) × ১০০% = ২০%।',
'ACC2-184': 'বিক্রীত পণ্যের ব্যয় = প্রারম্ভিক মজুদ ৪,৫০,০০০ + ক্রয় ১১,০০,০০০ - সমাপনী মজুদ ৩,৫০,০০০ = ১২,০০,০০০ টাকা।',
'ACC2-185': 'গড় মজুদ = (৪,৫০,০০০ + ৩,৫০,০০০) ÷ ২ = ৪,০০,০০০ টাকা। মজুদ আবর্তন = ১২,০০,০০০ ÷ ৪,০০,০০০ = ৩.০০ বার।',
'ACC2-192': 'মুখ্য ব্যয় = ১২,০০০ + ৮,০০০ = ২০,০০০ টাকা। কারখানা উপরিব্যয় = ২০,০০০ × ৩০% = ৬,০০০ টাকা।',
'ACC2-193': 'কারখানা ব্যয় = মুখ্য ব্যয় ২০,০০০ + কারখানা উপরিব্যয় ৬,০০০ = ২৬,০০০ টাকা। প্রশাসনিক উপরিব্যয় = ২৬,০০০ × ২০% = ৫,২০০ টাকা।',
'ACC2-197': 'এককপ্রতি উৎপাদন ব্যয় = ৮০০ ÷ ৪০ = ২০ টাকা। বিক্রয়ের ওপর ২০% মুনাফা হলে বিক্রয়মূল্য = ২০ ÷ ০.৮০ = ২৫ টাকা।',
'ACC2-201': 'বিক্রয়ের ওপর ২৫% (১/৪ অংশ) লাভ হলে ক্রয়মূল্যের ওপর লাভের হার = ১ ÷ (৪ - ১) = ১/৩ বা ৩৩.৩৩%।',
'ACC2-203': 'ব্যবহৃত কাঁচামাল = ৫,০০০ + ১৫,০০০ - ১৩,০০০ = ৭,০০০ টাকা। মুখ্য ব্যয় = ৭,০০০ + প্রত্যক্ষ মজুরি ৫,০০০ = ১২,০০০ টাকা।',
'ACC2-207': 'সপ্তাহে স্বাভাবিক কর্মঘণ্টা = ৭ দিন × ৮ ঘণ্টা = ৫৬ ঘণ্টা। মূল মজুরি = ৫৬ × ১০ = ৫৬০ টাকা।',
'ACC2-208': 'ওভারটাইম ঘণ্টা = ৭০ - ৫৬ = ১৪ ঘণ্টা। দ্বিগুণ হারে (২০ টাকা) ওভারটাইম মজুরি = ১৪ × ২০ = ২৮০ টাকা।',
'ACC2-251': 'মোট ক্রয়মূল্য = (৬০০×৪) + (৪০০×৬) = ৪,৮০০ টাকা; গড় দর = ৪,৮০০ ÷ ১,০০০ = ৪.৮০ টাকা। সমাপনী ২০০ এককের মূল্য = ২০০ × ৪.৮০ = ৯৬০ টাকা।',
'ACC2-252': 'FIFO পদ্ধতিতে ২৫০ একক ইস্যুর মূল্য = (২০০ একক × ২০ টাকা) + (৫০ একক × ৩০ টাকা) = ৪,০০০ + ১,৫০০ = ৫,৫০০ টাকা।',
'ACC2-277': 'মোট বিক্রয় = ১২,০০,০০০ টাকা। পরিবর্তনশীল ব্যয় = বিক্রয় ১২,০০,০০০ - (স্থায়ী ব্যয় ৩,০০,০০০ + মুনাফা ২,০০,০০০) = ৭,০০,০০০ টাকা।',
'ACC2-288': 'এককপ্রতি দত্তাংশ (CM) = এককপ্রতি বিক্রয়মূল্য ৫০ - এককপ্রতি পরিবর্তনশীল ব্যয় ২০ = ৩০ টাকা।',
'ACC2-289': 'দত্তাংশ অনুপাত = (৩০ ÷ ৫০) × ১০০% = ৬০%। সমচ্ছেদ বিক্রয় = স্থায়ী ব্যয় ১,৮০,০০০ ÷ ০.৬০ = ৩,০০,০০০ টাকা।',
'ACC2-290': 'মুনাফা = (বিক্রয় ৫,০০,০০০ × ৬০%) - স্থায়ী ব্যয় ১,৮০,০০০ = ৩,০০,০০০ - ১,৮০,০০০ = ১,২০,০০০ টাকা।',
'ACC2-291': 'সমচ্ছেদ বিন্দু (একক) = স্থায়ী ব্যয় ১,৪০,০০০ ÷ (৬০ - ৪০) = ১,৪০,০০০ ÷ ২০ = ৭,০০০ একক।',
'ACC2-292': 'স্থির ব্যয় = সমচ্ছেদ বিক্রয় ২,০০,০০০ × কন্ট্রিবিউশন মার্জিন অনুপাত ২৫% = ৫০,০০০ টাকা।', 'ACC2-293': 'দত্তাংশ অনুপাত = [(২০০ - ১২০) ÷ ২০০] × ১০০% = (৮০ ÷ ২০০) × ১০০% = ৪০%।', };
function getCleanBoardBadge(boardTag?: string): string | null { if (!boardTag) return null;
const t = boardTag.trim();
if (!t) return null;
if ( t === 'NCTB ও বোর্ড প্রশ্ন' || t === 'বো. প্রশ্ন' || t.startsWith('HSC বাংলা ১ম পত্র') || t.includes('Batch') ) { return null; }
return t; }
export function getComplexMathOrRuleExplanation(q: MCQQuestion | any, lang: 'bn' | 'en' | 'bilingual' = 'bn'): string {
  if (!q) return '';
  if (EXACT_MATH_EXPLANATIONS[q.id]) { return EXACT_MATH_EXPLANATIONS[q.id]; }
  const qText = trText(q.q, 'bn');
  const rawExp = trText(q.explanation, lang).trim();
  if (!rawExp || rawExp.includes('বোর্ড স্ট্যান্ডার্ড সমাধান') || rawExp.startsWith('HSC বাংলা')) { return ''; }
  if (q.id && (q.id.startsWith('BN1-') || q.id.startsWith('bn'))) { return ''; }
  if (q.id && q.id.startsWith('FBI-')) { return rawExp; }
  const isMathOrRule =
    /[০-৯0-9=+÷×%⊕′̅<>]|npv|irr|arr|pbp|capm|ytm|ear|eir|wacc|printf|main\s*\(|for\s*\(|SELECT|WHERE|INSERT|UPDATE|colspan|rowspan|cellpadding|cellspacing|bgcolor|href|src|কম্প্লিমেন্ট|পরিপূরক|বাইনারি|অক্টাল|হেক্সা|গেইট|টপোলজি|ব্যান্ডউইথ|ফ্রিকোয়েন্সি|বাইট|বিট|সমীকরণ|অনুপাত|অবচয়|সুদ|কমিশন|মজুদ|মূলধন|সমচ্ছেদ|চক্রবৃদ্ধি|বাট্টা|বিভেদাঙ্ক|পে-ব্যাক|কিস্তি|উদ্দীপক/i.test(
      qText + ' ' + rawExp
    );
  return isMathOrRule ? rawExp : '';
}
export const QuizRunnerModal: React.FC = () => { const { activeQuiz, closeQuiz, recordExamResult, submitQuestionReport, userName, language } = useExamStore();
const [currentIndex, setCurrentIndex] = useState(0);
const [answers, setAnswers] = useState<Record<number, number>>({});
const [flagged, setFlagged] = useState<Record<number, boolean>>({});
const [timeLeft, setTimeLeft] = useState(600);
const [submitted, setSubmitted] = useState(false);
const [instantFeedback, setInstantFeedback] = useState(true);
const [openCqSolution, setOpenCqSolution] = useState<Record<string, boolean>>({});
const [paletteOpenMobile, setPaletteOpenMobile] = useState(false);
const [reportOpen, setReportOpen] = useState(false);
const [reportIssueType, setReportIssueType] = useState('উত্তর ভুল আছে (Wrong Answer Key)');
const [reportComment, setReportComment] = useState('');
const [reportSentMsg, setReportSentMsg] = useState<string | null>(null);
useEffect(() => { if (activeQuiz) { setCurrentIndex(0);
setAnswers({});
setFlagged({});
setTimeLeft(activeQuiz.durationSec || 600);
setSubmitted(false);
setInstantFeedback(activeQuiz.mode !== 'timed');
setReportOpen(false);
setReportSentMsg(null);
setPaletteOpenMobile(false); } }, [activeQuiz]);
useEffect(() => { if (!activeQuiz || submitted || activeQuiz.examType === 'cq') return;
const timer = setInterval(() => { setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1)); }, 1000);
return () => clearInterval(timer); }, [activeQuiz, submitted]);
const handleSubmitExam = () => { if (!activeQuiz || submitted) return;
setSubmitted(true);
const questions = activeQuiz.questions || [];
let correctCount = 0;
const newMistakes: MistakeItem[] = [];
const attemptedCount = Object.keys(answers).length;
questions.forEach((q, idx) => { const chosen = answers[idx];
if (chosen === q.ans) { correctCount++; } else if (chosen !== undefined) { newMistakes.push({ id: `mistake-${Date.now()}-${idx}`, questionId: q.id, subjectId: activeQuiz.subjectId,
subjectName: trText(activeQuiz.subjectName, language), chapterName: trText(activeQuiz.chapterName, language), question: q.q, options: q.options, correctIndex: q.ans, selectedIndex: chosen,
explanation: q.explanation, wrongCount: 1, lastMissedAt: new Date().toISOString().slice(0, 10), mastered: false, }); } });
const total = Math.max(1, questions.length);
const accuracy = attemptedCount > 0 ? Math.round((correctCount / Math.max(1, attemptedCount)) * 100) : 0;
const xpEarned = attemptedCount > 0 ? correctCount * 12 + (accuracy >= 80 ? 30 : 10) : 0;
recordExamResult( { subjectId: activeQuiz.subjectId, subjectName: trText(activeQuiz.subjectName, language), chapterId: activeQuiz.chapterId,
chapterName: trText(activeQuiz.chapterName, language), mode: 'mcq', score: correctCount, total, accuracy, timeSpentSec: Math.max(5, activeQuiz.durationSec - timeLeft), xpEarned, },
newMistakes ); };
useEffect(() => { if (activeQuiz && activeQuiz.examType !== 'cq' && !submitted && timeLeft === 0) { handleSubmitExam(); } }, [timeLeft, activeQuiz, submitted]);
if (!activeQuiz) return null;
const isBn = language !== 'en';
const questions = activeQuiz.questions || [];
const currentQ = questions[currentIndex];
const formatTimer = (sec: number) => { const m = Math.floor(sec / 60);
const s = sec % 60;
return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; };
const handleSendReport = () => { if (!currentQ) return;
const opts = currentQ.options.bn?.length ? currentQ.options.bn : currentQ.options.en;
submitQuestionReport({ questionId: currentQ.id, subjectId: activeQuiz.subjectId, subjectName: trText(activeQuiz.subjectName, 'bn'), chapterId: activeQuiz.chapterId,
chapterName: trText(activeQuiz.chapterName, 'bn'), questionText: trText(currentQ.q, 'bn'), options: opts, currentAns: currentQ.ans, issueType: reportIssueType,
comment: reportComment.trim() || reportIssueType, reportedBy: userName, });
setReportComment('');
setReportSentMsg(isBn ? '✅ রিপোর্ট অ্যাডমিন প্যানেলে পাঠানো হয়েছে!' : '✅ Report sent to Admin!');
setTimeout(() => { setReportOpen(false);
setReportSentMsg(null); }, 1100); };
if (activeQuiz.examType === 'cq') { return ( <div className="ev-modal-backdrop is-open">
<div className="ev-card" style={{ width: '100%', maxWidth: 860, maxHeight: '90vh', overflowY: 'auto' }}>
<div className="ev-section-header">
<h3 className="ev-section-title">📝 {trText(activeQuiz.subjectName, language)} — {trText(activeQuiz.chapterName, language)}</h3>
<button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={closeQuiz}>✕ {isBn ? 'বন্ধ করো' : 'Close'}</button>
</div>
{activeQuiz.cqs.length === 0 ? (
<p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{isBn ? 'এই অধ্যায়ে এখনো কোনো সৃজনশীল প্রশ্ন যুক্ত করা হয়নি।' : 'No Creative Questions added yet.'}</p> ) : (
<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
{activeQuiz.cqs.map((cq, idx) => ( <div key={cq.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
<div style={{ fontWeight: 800, color: 'var(--brand-primary)', marginBottom: 6 }}>{isBn ? `উদ্দীপক #${idx + 1}` : `Stem #${idx + 1}`}</div>
<p style={{ marginBottom: 12, fontWeight: 600 }}>{trText(cq.stem, language)}</p>
<div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
<div><strong>ক:</strong> {trText(cq.a, language)}</div>
<div><strong>খ:</strong> {trText(cq.b, language)}</div>
<div><strong>গ:</strong> {trText(cq.c, language)}</div>
<div><strong>ঘ:</strong> {trText(cq.d, language)}</div>
</div>
<button className="ev-btn ev-btn-secondary ev-btn-sm" style={{ marginTop: 10 }} onClick={() => setOpenCqSolution((p) => ({ ...p, [cq.id]: !p[cq.id] }))}>
{openCqSolution[cq.id] ? (isBn ? 'উত্তর লুকাও' : 'Hide Answer') : isBn ? 'নমুনা উত্তর দেখো' : 'Model Answer'}
</button>
{openCqSolution[cq.id] && ( <div className="ev-explanation-box">
<div><strong>ক:</strong> {trText(cq.ansA, language)}</div>
<div><strong>খ:</strong> {trText(cq.ansB, language)}</div>
<div><strong>গ:</strong> {trText(cq.ansC, language)}</div>
<div><strong>ঘ:</strong> {trText(cq.ansD, language)}</div>
</div> )}
</div> ))}
</div> )}
</div>
</div> ); }
if (questions.length === 0) { return ( <div className="ev-modal-backdrop is-open" onClick={closeQuiz}>
<div className="ev-modal-panel" style={{ maxWidth: 440, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
<h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{trText(activeQuiz.subjectName, language)} • {trText(activeQuiz.chapterName, language)}</h3>
<p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
{isBn ? 'এই অধ্যায়ে এখনো কোনো MCQ প্রশ্ন আপলোড করা হয়নি। খুব শীঘ্রই প্রশ্ন যুক্ত করা হবে!' : 'No MCQ questions have been uploaded for this chapter yet.'}
</p>
<button className="ev-btn ev-btn-primary" onClick={closeQuiz}>{isBn ? 'ফিরে যাও' : 'Go Back'}</button>
</div>
</div> ); }
const answeredCount = Object.keys(answers).length;
const correctSoFar = Object.entries(answers).filter(([idxStr, ansIdx]) => questions[Number(idxStr)]?.ans === ansIdx).length;
const wrongSoFar = answeredCount - correctSoFar;
const optionLabels = isBn ? ['ক', 'খ', 'গ', 'ঘ'] : ['A', 'B', 'C', 'D'];
const optionsArray = language === 'en' ? currentQ?.options.en || currentQ?.options.bn || [] : currentQ?.options.bn || currentQ?.options.en || [];
const hasAnsweredCurrent = answers[currentIndex] !== undefined;
const showAnswerState = submitted || (instantFeedback && hasAnsweredCurrent);
const cleanBoardBadge = currentQ ? getCleanBoardBadge(currentQ.boardTag) : null;
const complexExplanation = currentQ && showAnswerState ? getComplexMathOrRuleExplanation(currentQ, language) : null;
return ( <div className="ev-modal-backdrop is-open" style={{ alignItems: 'flex-start', padding: '10px', overflowY: 'auto' }}>
<div style={{ width: '100%', maxWidth: 1060, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 28 }}>
<div
className="ev-card"
style={{ position: 'sticky', top: 0, zIndex: 30, padding: '10px 14px', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)', }}
>
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
<div style={{ minWidth: 0, flex: 1 }}>
<div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
{trText(activeQuiz.subjectName, language)}
</div>
<div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
{trText(activeQuiz.chapterName, language)}
</div>
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
{!submitted && ( <button
type="button"
onClick={() => setInstantFeedback((p) => !p)}
style={{ height: 32, padding: '0 10px', borderRadius: 999, border: '1px solid var(--border-default)', background: instantFeedback ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
color: instantFeedback ? '#059669' : '#4F46E5', fontSize: 11.5, fontWeight: 800, cursor: 'pointer', }}
title={isBn ? 'অনুশীলন ও পরীক্ষা মোড পরিবর্তন করো' : 'Switch Practice / Exam Mode'}
>
{instantFeedback ? (isBn ? '⚡ অনুশীলন' : '⚡ Practice') : isBn ? '📝 পরীক্ষা' : '📝 Exam'}
</button> )}
<div className={`ev-timer-badge font-mono ${timeLeft <= 60 && !submitted ? 'is-urgent' : ''}`} style={{ padding: '4px 10px', fontSize: 13 }}>
⏱️ {formatTimer(timeLeft)}
</div>
<button
type="button"
className="ev-btn ev-btn-secondary ev-btn-sm"
style={{ width: 32, height: 32, padding: 0, borderRadius: 10 }}
onClick={closeQuiz}
aria-label="Close Quiz"
>
✕
</button>
</div>
</div>
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
<span>
{isBn ? `প্রশ্ন ${currentIndex + 1} / ${questions.length}` : `Q ${currentIndex + 1} / ${questions.length}`} • {isBn ? `উত্তর প্রদান: ${answeredCount}টি` : `Answered: ${answeredCount}`}
</span>
<button
type="button"
onClick={() => setPaletteOpenMobile((p) => !p)}
style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 800, fontSize: 12, cursor: 'pointer', padding: 0 }}
>
🧭 {isBn ? (paletteOpenMobile ? 'নেভিগেটর লুকাও ▲' : 'প্রশ্ন নেভিগেটর ▼') : 'Navigator'}
</button>
</div>
<div className="ev-progress-track" style={{ height: 5 }}>
<div className="ev-progress-fill" style={{ width: `${Math.round(((currentIndex + 1) / Math.max(1, questions.length)) * 100)}%` }} />
</div>
{paletteOpenMobile && ( <div style={{ paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
<div className="ev-palette-grid" style={{ maxHeight: 150, overflowY: 'auto' }}>
{questions.map((q, idx) => { const chosen = answers[idx];
const reveal = submitted || (instantFeedback && chosen !== undefined);
let dotCls = '';
if (reveal) dotCls = chosen === q.ans ? 'is-correct' : chosen !== undefined ? 'is-incorrect' : '';
else if (idx === currentIndex) dotCls = 'is-current';
else if (chosen !== undefined) dotCls = 'is-answered';
return ( <button
key={q.id}
type="button"
className={`ev-palette-dot ${dotCls} ${flagged[idx] ? 'is-bookmarked' : ''}`}
onClick={() => { setCurrentIndex(idx);
setPaletteOpenMobile(false); }}
>
{idx + 1}
</button> ); })}
</div>
</div> )}
</div>
{submitted && ( <div
className="ev-card"
style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.09) 0%, rgba(16,185,129,0.09) 100%)', border: '1.5px solid rgba(79,70,229,0.28)', padding: '14px 16px', display: 'flex',
alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, }}
>
<div>
<div style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-primary)' }}>
🎉 {isBn ? `ফলাফল: ${correctSoFar} / ${questions.length} সঠিক` : `Score: ${correctSoFar} / ${questions.length}`}
</div>
<div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>
✅ {isBn ? `সঠিক: ${correctSoFar}` : `Correct: ${correctSoFar}`} • ❌ {isBn ? `ভুল: ${wrongSoFar}` : `Wrong: ${wrongSoFar}`} • 🎯{' '}
{isBn ? `সঠিকতার হার: ${answeredCount > 0 ? Math.round((correctSoFar / answeredCount) * 100) : 0}%` : `Accuracy: ${answeredCount > 0 ? Math.round((correctSoFar / answeredCount) * 100) : 0}%`}
</div>
</div>
<button type="button" className="ev-btn ev-btn-primary ev-btn-sm" onClick={closeQuiz}>
{isBn ? 'ড্যাশবোর্ডে ফিরে যাও →' : 'Done →'}
</button>
</div> )}
<div className="ev-quiz-layout">
<div className="ev-card ev-question-card" style={{ padding: '16px' }}>
{currentQ && ( <>
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
<span className="ev-badge-pill ev-badge-indigo">#{currentIndex + 1}</span>
{cleanBoardBadge && <span className="ev-badge-pill ev-badge-warning">{cleanBoardBadge}</span>}
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
<button
type="button"
className="ev-btn ev-btn-secondary ev-btn-sm"
onClick={() => setFlagged((p) => ({ ...p, [currentIndex]: !p[currentIndex] }))}
>
{flagged[currentIndex] ? '🚩 মার্ককৃত' : '🏳️ মার্ক'}
</button>
<button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => setReportOpen(!reportOpen)}>
⚠️ {isBn ? 'ভুল রিপোর্ট' : 'Report'}
</button>
</div>
</div>
{reportOpen && ( <div
style={{ marginTop: 12, padding: 12, borderRadius: 12, background: 'var(--status-danger-bg)', border: '1px solid var(--status-danger-border)', display: 'flex', flexDirection: 'column',
gap: 8, }}
>
<div style={{ fontWeight: 800, fontSize: 13, color: 'var(--status-danger-text)' }}>
🚩 {isBn ? 'এই প্রশ্ন বা উত্তরে ভুল রিপোর্ট করুন (অ্যাডমিন যাচাই করবেন)' : 'Report Question Error'}
</div>
<select className="ev-select" value={reportIssueType} onChange={(e) => setReportIssueType(e.target.value)}>
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
{reportSentMsg ? ( <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--status-success)' }}>{reportSentMsg}</div> ) : (
<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
<button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => setReportOpen(false)}>
{isBn ? 'বাতিল' : 'Cancel'}
</button>
<button type="button" className="ev-btn ev-btn-primary ev-btn-sm" onClick={handleSendReport}>
{isBn ? 'রিপোর্ট পাঠাও' : 'Submit Report'}
</button>
</div> )}
</div> )}
<div className="ev-question-text" style={{ whiteSpace: 'pre-line', marginTop: 12, marginBottom: 14 }}>
{trText(currentQ.q, language)}
</div>
<div className="ev-options-list">
{optionsArray.map((optText, optIdx) => { const isSelected = answers[currentIndex] === optIdx;
let cls = '';
if (showAnswerState) { if (optIdx === currentQ.ans) cls = 'is-correct';
else if (isSelected && optIdx !== currentQ.ans) cls = 'is-incorrect'; } else if (isSelected) { cls = 'is-selected'; }
return ( <button
key={optIdx}
type="button"
disabled={submitted}
className={`ev-option-btn ${cls}`}
style={ !showAnswerState && isSelected
? { borderColor: '#4F46E5', background: 'rgba(79, 70, 229, 0.09)', boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.18)', }
: undefined }
onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }))}
>
<span
className="ev-option-key"
style={ !showAnswerState && isSelected
? { background: '#4F46E5', color: '#FFFFFF', borderColor: '#4F46E5' }
: undefined }
>
{optionLabels[optIdx] || optIdx + 1}
</span>
<span style={{ flex: 1, textAlign: 'left' }}>{optText}</span>
{showAnswerState && optIdx === currentQ.ans && <span>✅</span>}
{showAnswerState && isSelected && optIdx !== currentQ.ans && <span>❌</span>}
</button> ); })}
</div>
{complexExplanation && ( <div className="ev-explanation-box" style={{ marginTop: 14 }}>
💡 <strong>{isBn ? 'গাণিতিক সমাধান ও নিয়ম:' : 'Solution & Rule:'}</strong> {complexExplanation}
</div> )}
<div
style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', }}
>
<button
type="button"
className="ev-btn ev-btn-secondary"
disabled={currentIndex === 0}
onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
>
← {trKey('prev_q', language)}
</button>
{currentIndex < questions.length - 1 ? ( <button
type="button"
className="ev-btn ev-btn-primary"
onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
>
{trKey('next_q', language)} →
</button> ) : !submitted ? ( <button
type="button"
className="ev-btn"
style={{ background: '#059669', color: '#FFFFFF', fontWeight: 800, border: 'none' }}
onClick={handleSubmitExam}
>
✅ {trKey('submit_exam', language)}
</button> ) : ( <button type="button" className="ev-btn ev-btn-primary" onClick={closeQuiz}>
{isBn ? 'সম্পন্ন ✓' : 'Finish ✓'}
</button> )}
</div>
<div style={{ marginTop: 10 }}>
{!submitted ? ( <button
type="button"
className="ev-btn"
style={{ width: '100%', background: 'rgba(5, 150, 105, 0.12)', color: '#059669', border: '1.5px solid rgba(5, 150, 105, 0.35)', fontWeight: 800, }}
onClick={handleSubmitExam}
>
✅ {isBn ? `পরীক্ষা জমা দাও ও ফলাফল দেখো (${answeredCount}/${questions.length})` : `Submit Exam (${answeredCount}/${questions.length})`}
</button> ) : ( <button type="button" className="ev-btn ev-btn-secondary" style={{ width: '100%' }} onClick={closeQuiz}>
{isBn ? 'কুইজ বন্ধ করো' : 'Close Quiz'}
</button> )}
</div>
</> )}
</div>
<div className="ev-card">
<div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>🧭 {trKey('question_palette', language)}</div>
<div className="ev-palette-grid">
{questions.map((q, idx) => { const chosen = answers[idx];
const reveal = submitted || (instantFeedback && chosen !== undefined);
let dotCls = '';
if (reveal) { dotCls = chosen === q.ans ? 'is-correct' : chosen !== undefined ? 'is-incorrect' : ''; } else if (idx === currentIndex) { dotCls = 'is-current';
} else if (chosen !== undefined) { dotCls = 'is-answered'; }
return ( <button
key={q.id}
type="button"
className={`ev-palette-dot ${dotCls} ${flagged[idx] ? 'is-bookmarked' : ''}`}
onClick={() => setCurrentIndex(idx)}
>
{idx + 1}
</button> ); })}
</div>
{!submitted && ( <button
type="button"
className="ev-btn"
style={{ width: '100%', marginTop: 14, background: '#059669', color: '#FFFFFF', fontWeight: 800, border: 'none' }}
onClick={handleSubmitExam}
>
✅ {trKey('submit_exam', language)}
</button> )}
</div>
</div>
</div>
</div> ); };
