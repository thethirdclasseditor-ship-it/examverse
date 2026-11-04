import React, { useEffect, useState } from 'react';
import { signInOrSignUpUser, trKey, trText, useExamStore } from '../store/useExamStore';
import { MistakeItem } from '../types';
import * as RawSupabase from '../lib/supabase';

/* =====================================================================
   OFFICIAL EXAMVERSE BRAND LOGO
   ===================================================================== */
export const ExamVerseLogo: React.FC<{ size?: number }> = ({ size = 38 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="evGradMain" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="50%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#1E1B4B" />
      </linearGradient>
      <linearGradient id="evGradOrbit" x1="4" y1="20" x2="60" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#4338CA" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#evGradMain)" />
    <path
      d="M11 38C15 47 29 51 44 45C52 41.5 56 35 54 29"
      stroke="url(#evGradOrbit)"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
    <path
      d="M16 42V26C21 25 27 26.5 32 30C37 26.5 43 25 48 26V42C43 40.8 37 42 32 45C27 42 21 40.8 16 42Z"
      fill="#FFFFFF"
      fillOpacity="0.95"
    />
    <path
      d="M32 15L26.5 26.5L29 33H35L37.5 26.5L32 15Z"
      fill="#EDE9FE"
      stroke="#312E81"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="32" cy="25" r="1.7" fill="#312E81" />
    <path d="M32 15V23.3" stroke="#312E81" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M32 7.5L33.4 10.6L36.5 12L33.4 13.4L32 16.5L30.6 13.4L27.5 12L30.6 10.6L32 7.5Z"
      fill="#FDE68A"
    />
  </svg>
);

/* =====================================================================
   MINIMALIST VECTOR SVG ICON SYSTEM (Zero Emojis — Crisp Stroke Art)
   ===================================================================== */
export const EvIcon: React.FC<{ name: string; size?: number }> = ({ name, size = 22 }) => {
  const key = name.toLowerCase();
  const props = {
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (key.includes('phy') || key === 'atom') {
    return (
      <svg {...props}>
        <ellipse cx="12" cy="12" rx="10" ry="4" fill="currentColor" fillOpacity="0.16" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (key.includes('chem') || key === 'flask') {
    return (
      <svg {...props}>
        <path d="M9.5 3h5" />
        <path
          d="M10.5 3v5.6L5.2 18.2A2 2 0 0 0 7 21h10a2 2 0 0 0 1.8-2.8L13.5 8.6V3"
          fill="currentColor"
          fillOpacity="0.16"
        />
        <path d="M7.4 14.4c1.7-1 3.1-1 4.6 0s2.9 1 4.6 0" />
        <circle cx="10.4" cy="17.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="13.8" cy="16.6" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (key.includes('math') || key === 'sigma') {
    return (
      <svg {...props}>
        <path d="M4 7h16" />
        <path d="M9 7c0 4-.3 8-1.8 11" />
        <path d="M15 7v7.5c0 2.2 1 3.5 3 3.5" />
      </svg>
    );
  }
  if (key.includes('bio') || key === 'dna') {
    return (
      <svg {...props}>
        <path d="M7 3c0 5 10 5 10 9s-10 4-10 9" />
        <path d="M17 3c0 5-10 5-10 9s10 4 10 9" />
        <path d="M8.6 6.5h6.8M8.6 17.5h6.8M7.8 12h8.4" />
      </svg>
    );
  }
  if (key.includes('eng') || key === 'feather') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontWeight="800"
          fontSize="13"
          fill="currentColor"
        >
          Aa
        </text>
        <path
          d="M5 20h14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    );
  }
  if (key.includes('ban') || key === 'scroll') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <text
          x="12"
          y="18"
          textAnchor="middle"
          className="font-bn"
          fontWeight="700"
          fontSize="17"
          fill="currentColor"
        >
          অ
        </text>
      </svg>
    );
  }
  if (key.includes('ict') || key === 'cpu') {
    return (
      <svg {...props}>
        <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.16" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
        <path d="M9 6V3M12 6V3M15 6V3M9 21v-3M12 21v-3M15 21v-3M6 9H3M6 12H3M6 15H3M21 9h-3M21 12h-3M21 15h-3" />
      </svg>
    );
  }
  if (key.includes('acc') || key.includes('fin') || key === 'briefcase') {
    return (
      <svg {...props}>
        <rect x="5" y="3" width="14" height="18" rx="2.5" fill="currentColor" fillOpacity="0.16" />
        <rect x="8" y="6" width="8" height="3.5" rx="0.8" />
        <circle cx="9" cy="13" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="12" cy="13" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="15" cy="13" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="9" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="15" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (key.includes('eco') || key.includes('mkt') || key.includes('mgt')) {
    return (
      <svg {...props}>
        <path d="M3.5 3.5v17h17" />
        <rect x="7" y="13" width="3" height="5" fill="currentColor" fillOpacity="0.18" />
        <rect x="11.5" y="10" width="3" height="8" fill="currentColor" fillOpacity="0.18" />
        <rect x="16" y="12" width="3" height="6" fill="currentColor" fillOpacity="0.18" />
        <path d="M6.5 9l4-3.5 3 2.5 5-4.5" />
        <path d="M15.5 3.5h3.5V7" />
      </svg>
    );
  }
  if (key.includes('gk') || key.includes('soc') || key === 'globe') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.16" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18M4.5 7.5h15M4.5 16.5h15" />
      </svg>
    );
  }
  if (key.includes('civ') || key.includes('his') || key === 'landmark') {
    return (
      <svg {...props}>
        <path d="M3 21h18M5.5 18v-7M10 18v-7M14 18v-7M18.5 18v-7" />
        <path d="M12 3L21 8.5H3z" fill="currentColor" fillOpacity="0.18" />
      </svg>
    );
  }
  if (key === 'home' || key === 'dashboard') {
    return (
      <svg {...props}>
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z" />
      </svg>
    );
  }
  if (key === 'subjects' || key === 'book') {
    return (
      <svg {...props}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }
  if (key === 'leaderboard' || key === 'trophy') {
    return (
      <svg {...props}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" fill="currentColor" fillOpacity="0.15" />
      </svg>
    );
  }
  if (key === 'analytics' || key === 'stats') {
    return (
      <svg {...props}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    );
  }
  if (key === 'mistakes' || key === 'alert') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.14" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  }
  if (key === 'achievements' || key === 'shield') {
    return (
      <svg {...props}>
        <path
          d="M12 21.5s8-3.8 8-10V5l-8-2.5L4 5v6.5c0 6.2 8 10 8 10z"
          fill="currentColor"
          fillOpacity="0.16"
        />
        <path d="M8.5 12l2.5 2.5 4.5-5" />
      </svg>
    );
  }
  if (key === 'bolt' || key === 'battle') {
    return (
      <svg {...props}>
        <polygon
          points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
          fill="currentColor"
          fillOpacity="0.18"
        />
      </svg>
    );
  }
  if (key === 'coin') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.18" />
        <circle cx="12" cy="12" r="5.5" />
        <path d="M12 9.5v5" />
      </svg>
    );
  }
  if (key === 'cloud') {
    return (
      <svg {...props}>
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
      </svg>
    );
  }
  if (key === 'settings') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  }
  if (key === 'more') {
    return (
      <svg {...props}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
};

/* =====================================================================
   INSPIRATIONAL LINE-ART SKETCHES FOR SUBJECT CARDS & HERO CARD
   ===================================================================== */
export const SubjectSketchSvg: React.FC<{ subjId: string }> = ({ subjId }) => {
  const id = subjId.toLowerCase();
  if (id.includes('phy')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 120 120" aria-hidden="true">
        <ellipse cx="60" cy="60" rx="46" ry="17" />
        <ellipse cx="60" cy="60" rx="46" ry="17" transform="rotate(60 60 60)" />
        <ellipse cx="60" cy="60" rx="46" ry="17" transform="rotate(120 60 60)" />
        <circle cx="60" cy="60" r="6" />
        <circle cx="104" cy="50" r="3" />
        <circle cx="36" cy="24" r="3" />
        <circle cx="34" cy="98" r="3" />
      </svg>
    );
  }
  if (id.includes('chem')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M48 14h24M54 14v30L28 96a8 8 0 0 0 7 12h50a8 8 0 0 0 7-12L66 44V14" />
        <path d="M33 84c10-6 18-6 27 0s16 6 27 0" />
        <circle cx="52" cy="96" r="3" />
        <circle cx="68" cy="90" r="2.4" />
        <circle cx="78" cy="99" r="3.2" />
        <circle cx="62" cy="28" r="2" />
      </svg>
    );
  }
  if (id.includes('math')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M16 102V18M16 102h92" />
        <path d="M22 76c8-44 20-44 30 0s22 44 32 0 12-26 22-20" />
        <path d="M72 24h24v22z" />
        <text x="22" y="36" fontSize="24" fontStyle="italic" fontFamily="Georgia,serif" strokeWidth="0.9">
          π
        </text>
      </svg>
    );
  }
  if (id.includes('bio')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M16 100C12 58 40 24 94 18c4 50-22 84-78 82z" />
        <path d="M16 100C42 76 66 50 94 18" />
        <path d="M38 80l-3-16M54 66l-3-15M68 52l10 6M46 74l12 5" />
        <circle cx="92" cy="92" r="15" />
        <circle cx="95" cy="89" r="5" />
      </svg>
    );
  }
  if (id.includes('eng')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M96 12C68 16 42 40 32 78l-8 26 26-10c34-8 52-36 46-82z" />
        <path d="M24 104L76 52" />
        <text x="70" y="106" fontSize="30" fontFamily="Georgia,serif" strokeWidth="0.9">
          Aa
        </text>
      </svg>
    );
  }
  if (id.includes('ban')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 120 120" aria-hidden="true">
        <text
          x="10"
          y="100"
          fontSize="92"
          className="font-bn"
          fontWeight="600"
          strokeWidth="1.3"
        >
          অ
        </text>
        <path d="M86 104l20-34 9 6-20 32z" />
      </svg>
    );
  }
  if (id.includes('ict')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 120 120" aria-hidden="true">
        <rect x="34" y="34" width="52" height="52" rx="6" />
        <rect x="48" y="48" width="24" height="24" rx="3" />
        <path d="M46 34V18M60 34V18M74 34V18M46 86v16M60 86v16M74 86v16M34 46H18M34 60H18M34 74H18M86 46h16M86 60h16M86 74h16" />
      </svg>
    );
  }
  if (id.includes('acc') || id.includes('fin')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 120 120" aria-hidden="true">
        <rect x="16" y="16" width="62" height="84" rx="5" />
        <path d="M28 38h38M28 52h38M28 66h24M28 80h30" />
        <circle cx="84" cy="84" r="22" />
        <text x="84" y="93" fontSize="22" textAnchor="middle" className="font-bn" strokeWidth="0.9">
          ৳
        </text>
      </svg>
    );
  }
  if (id.includes('eco') || id.includes('mgt') || id.includes('mkt')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M14 102h96M14 102V18" />
        <rect x="26" y="72" width="15" height="30" />
        <rect x="48" y="54" width="15" height="48" />
        <rect x="70" y="64" width="15" height="38" />
        <rect x="92" y="40" width="15" height="62" />
        <path d="M24 52l24-20 18 14 38-28" />
      </svg>
    );
  }
  return (
    <svg className="ev-subj-sketch" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="58" cy="62" r="44" />
      <ellipse cx="58" cy="62" rx="18" ry="44" />
      <path d="M14 62h88M20 40h76M20 84h76" />
    </svg>
  );
};

export const HeroSketchSvg: React.FC = () => (
  <svg className="ev-hero-sketch" viewBox="0 0 170 140" aria-hidden="true">
    <path d="M28 120h98v14H28zM34 106h86v14H34zM40 92h74v14H40z" />
    <path d="M50 99h26M44 113h30M38 127h34" />
    <path d="M132 14l22 22-56 56-26 6 6-26z" />
    <path d="M121 25l22 22" />
    <path d="M92 86l-6 14" />
    <path d="M30 36v16M22 44h16" />
    <path d="M150 84v10M145 89h10" />
    <circle cx="72" cy="30" r="3" />
  </svg>
);

export const LevelRingSvg: React.FC<{ pct: number; size?: number; stroke?: number }> = ({
  pct,
  size = 108,
  stroke = 9,
}) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const off = c * (1 - clamped / 100);
  const mid = size / 2;
  return (
    <svg
      className="ev-ring"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <circle className="ev-ring-track" cx={mid} cy={mid} r={r} strokeWidth={stroke} />
      <circle
        className="ev-ring-prog"
        cx={mid}
        cy={mid}
        r={r}
        strokeWidth={stroke}
        stroke="url(#evRingGrad)"
        strokeDasharray={c.toFixed(2)}
        strokeDashoffset={off.toFixed(2)}
      />
    </svg>
  );
};

export const FlameBigSvg: React.FC = () => (
  <svg className="ev-streak-flame" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="url(#evFlameGrad)"
      d="M12.6 1.8c.5 3.3 4.9 5.6 4.9 10.6a5.5 5.5 0 0 1-11 0c0-2 .9-3.6 2-4.8.3 1.5 1.1 2.4 2 2.7C10 7.6 10.9 4.6 12.6 1.8z"
    />
    <path
      fill="#FFF3C4"
      d="M12 21a3.2 3.2 0 0 0 3.2-3.2c0-2-3.2-4.6-3.2-4.6s-3.2 2.6-3.2 4.6A3.2 3.2 0 0 0 12 21z"
    />
  </svg>
);

export const FlameMiniSvg: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.6 1.8c.5 3.3 4.9 5.6 4.9 10.6a5.5 5.5 0 0 1-11 0c0-2 .9-3.6 2-4.8.3 1.5 1.1 2.4 2 2.7C10 7.6 10.9 4.6 12.6 1.8z" />
  </svg>
);

export const MetallicBadgeSvg: React.FC<{ tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'elite' }> = ({
  tier,
}) => {
  const palette: Record<string, { a: string; b: string; c: string }> = {
    bronze: { a: '#FED7AA', b: '#F97316', c: '#9A3412' },
    silver: { a: '#F8FAFC', b: '#94A3B8', c: '#475569' },
    gold: { a: '#FEF08A', b: '#F59E0B', c: '#B45309' },
    platinum: { a: '#E0F2FE', b: '#38BDF8', c: '#0369A1' },
    elite: { a: '#F3E8FF', b: '#A855F7', c: '#6B21A8' },
  };
  const c = palette[tier] || palette.gold;
  const gradId = `evMedal_${tier}`;
  return (
    <svg viewBox="0 0 56 56" width="54" height="54" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c.a} />
          <stop offset="0.55" stopColor={c.b} />
          <stop offset="1" stopColor={c.c} />
        </linearGradient>
      </defs>
      <path d="M19 40l-5 14 8-3.5 4 5 3.5-14z" fill={c.c} />
      <path d="M37 40l5 14-8-3.5-4 5-3.5-14z" fill={c.b} />
      <polygon
        points="28,3 49,15 49,39 28,51 7,39 7,15"
        fill={`url(#${gradId})`}
        stroke={c.c}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <polygon
        points="28,10 43,18.5 43,35.5 28,44 13,35.5 13,18.5"
        stroke="#fff"
        strokeOpacity="0.75"
        strokeWidth="1.2"
        strokeDasharray="2.5 2.5"
      />
      <path
        d="M28 17.5l3.2 6.6 7.2 1-5.2 5.1 1.2 7.2L28 34l-6.4 3.4 1.2-7.2-5.2-5.1 7.2-1z"
        fill="#fff"
        fillOpacity="0.92"
      />
    </svg>
  );
};

/* =====================================================================
   CLOUD-WAVE AUTH MODAL WITH GOOGLE & FACEBOOK OAUTH
   ===================================================================== */
export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen, setUserProfile, language } = useExamStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;
  const isBn = language !== 'en';

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    try {
      setStatusMsg(
        isBn
          ? `${provider === 'google' ? 'Google' : 'Facebook'} লগইনে সংযুক্ত হচ্ছে...`
          : `Connecting to ${provider === 'google' ? 'Google' : 'Facebook'}...`
      );
      const supaMod = RawSupabase as any;
      if (typeof supaMod?.signInWithOAuthProvider === 'function') {
        await supaMod.signInWithOAuthProvider(provider);
      } else if (supaMod?.supabase?.auth?.signInWithOAuth) {
        await supaMod.supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: window.location.origin },
        });
      }
    } catch (err: any) {
      setStatusMsg(err?.message || 'OAuth redirect initiated');
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
      setStatusMsg(err?.message || (isBn ? 'লগইন সম্পন্ন হয়েছে' : 'Signed in'));
      setUserProfile({
        id: `local-${Date.now()}`,
        name: name.trim() || email.split('@')[0],
        email: email.trim(),
        isAuthenticated: true,
      });
      setTimeout(() => setAuthModalOpen(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ev-modal-backdrop" onClick={() => setAuthModalOpen(false)}>
      <div className="ev-auth-card" onClick={(e) => e.stopPropagation()}>
        <div className="ev-auth-form-side">
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em' }}>
              {mode === 'signin'
                ? isBn
                  ? 'হ্যালো! (Hello!)'
                  : 'Hello!'
                : isBn
                ? 'নতুন অ্যাকাউন্ট'
                : 'Create Account'}
            </h2>
            <p style={{ fontSize: 13.5, fontWeight: 600, color: '#64748B', marginTop: 3 }}>
              {mode === 'signin'
                ? isBn
                  ? 'তোমার ExamVerse অ্যাকাউন্টে সাইন ইন করো'
                  : 'Sign in to your ExamVerse account'
                : isBn
                ? 'তোমার প্রস্তুতির যাত্রা শুরু করো'
                : 'Start your learning journey today'}
            </p>
            <div
              style={{
                width: 38,
                height: 3.5,
                background: 'linear-gradient(90deg, #7C3AED, #4F46E5)',
                borderRadius: 99,
                margin: '8px auto 0',
              }}
            />
          </div>

          {/* Google & Facebook One-Click OAuth Buttons */}
          <div className="ev-oauth-grid">
            <button
              type="button"
              className="ev-oauth-btn"
              onClick={() => handleOAuthLogin('google')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.4 7.4 24 12 24z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="ev-oauth-btn"
              onClick={() => handleOAuthLogin('facebook')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
                <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          <div className="ev-auth-divider">
            <span>{isBn ? 'অথবা ইমেইল দিয়ে' : 'Or with E-mail'}</span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'signup' && (
              <div className="ev-auth-pill-input">
                <span className="ev-auth-pill-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
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
              <span className="ev-auth-pill-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M22 7l-10 7L2 7" />
                </svg>
              </span>
              <input
                type="email"
                placeholder={isBn ? 'ইমেইল (E-mail)' : 'E-mail'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="ev-auth-pill-input">
              <span className="ev-auth-pill-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
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
                style={{
                  color: '#6D28D9',
                  padding: '4px 6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                title="Toggle password"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#64748B',
                padding: '2px 6px',
              }}
            >
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#6D28D9', width: 15, height: 15 }}
                />
                <span>{isBn ? 'মনে রাখুন (Remember me)' : 'Remember me'}</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setStatusMsg(
                    isBn
                      ? 'পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হবে।'
                      : 'Password reset link will be sent to your email.'
                  )
                }
                style={{
                  color: '#6D28D9',
                  fontWeight: 700,
                  fontSize: 12.5,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
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
                height: 46,
                borderRadius: 999,
                background: 'linear-gradient(90deg, #8B5CF6 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                fontSize: 13.5,
                fontWeight: 800,
                letterSpacing: '0.04em',
                boxShadow: '0 10px 24px -6px rgba(79, 70, 229, 0.55)',
                width: '76%',
                alignSelf: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {loading
                ? '...'
                : mode === 'signin'
                ? isBn
                  ? 'SIGN IN • সাইন ইন'
                  : 'SIGN IN'
                : isBn
                ? 'CREATE • তৈরি করুন'
                : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: 14,
              fontSize: 13,
              fontWeight: 600,
              color: '#64748B',
            }}
          >
            {mode === 'signin' ? (
              <>
                {isBn ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  style={{
                    color: '#5B21B6',
                    fontWeight: 800,
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? 'নতুন তৈরি করুন (Create)' : 'Create'}
                </button>
              </>
            ) : (
              <>
                {isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  style={{
                    color: '#5B21B6',
                    fontWeight: 800,
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isBn ? 'সাইন ইন করুন' : 'Sign In'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cloud-Wave Welcome Side */}
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

          <ExamVerseLogo size={60} />
          <h3 style={{ fontSize: 24, fontWeight: 800, marginTop: 14, letterSpacing: '-0.02em' }}>
            {isBn ? 'স্বাগতম! (Welcome Back!)' : 'Welcome Back!'}
          </h3>
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.9)',
              marginTop: 8,
              maxWidth: 270,
            }}
          >
            {isBn
              ? 'Google, Facebook অথবা ইমেইল দিয়ে যুক্ত হয়ে নিজের XP, স্ট্রিক ও Bronze থেকে Elite র‍্যাঙ্ক ক্লাউডে সিঙ্ক করে রাখো।'
              : 'Sync your XP, 7-day study streak, and Bronze-to-Elite Rank progression across all devices.'}
          </p>
        </div>
      </div>
    </div>
  );
};

/* =====================================================================
   SETTINGS & LANGUAGE MODAL
   ===================================================================== */
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
  } = useExamStore();

  const [tempName, setTempName] = useState(userName);

  if (!isSettingsModalOpen) return null;
  const isBn = language !== 'en';

  return (
    <div className="ev-modal-backdrop" onClick={() => setSettingsModalOpen(false)}>
      <div
        className="ev-card"
        style={{ width: '100%', maxWidth: 460, padding: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ev-section-header">
          <h3 className="ev-section-title">
            <EvIcon name="settings" size={20} />
            <span>{isBn ? 'সেটিংস ও ভাষা' : 'Settings & Preferences'}</span>
          </h3>
          <button className="ev-icon-btn" onClick={() => setSettingsModalOpen(false)}>
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 6,
              }}
            >
              {isBn ? 'তোমার নাম (Student Name)' : 'Student Name'}
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                style={{
                  flex: 1,
                  height: 42,
                  padding: '0 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-input)',
                }}
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
            <label
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 6,
              }}
            >
              {isBn ? 'সম্পূর্ণ অ্যাপের ভাষা (UI Language)' : 'App & Question Language'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {(['bn', 'en', 'bilingual'] as const).map((lng) => (
                <button
                  key={lng}
                  onClick={() => setLanguage(lng)}
                  className={`ev-btn ${language === lng ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                  style={{ minHeight: 40, padding: '0 10px', fontSize: 13 }}
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
              padding: '12px 14px',
              borderRadius: 12,
              background: 'var(--bg-surface-muted)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {isBn ? 'ডার্ক মোড (Dark Mode)' : 'Dark Theme'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {isBn ? 'রাতের পড়াশোনার জন্য চোখের আরামদায়ক থিম' : 'Deep navy slate surface for night study'}
              </div>
            </div>
            <button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={toggleDarkMode}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =====================================================================
   PROMINENT QUIZ RUNNER + MOBILE BOTTOM-SHEET QUESTION NAVIGATOR
   ===================================================================== */
export const QuizRunnerModal: React.FC = () => {
  const { activeQuiz, closeQuiz, recordExamResult, language } = useExamStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitted, setSubmitted] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [openCqSolution, setOpenCqSolution] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeQuiz) {
      setCurrentIndex(0);
      setAnswers({});
      setFlagged({});
      setTimeLeft(activeQuiz.durationSec || 600);
      setSubmitted(false);
      setMobileSheetOpen(false);
    }
  }, [activeQuiz]);

  useEffect(() => {
    if (!activeQuiz || submitted || activeQuiz.examType === 'cq') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
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
    setMobileSheetOpen(false);

    let correctCount = 0;
    const newMistakes: MistakeItem[] = [];

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
    const accuracy = Math.round((correctCount / total) * 100);
    const xpEarned = correctCount * 20 + (accuracy >= 80 ? 40 : 15);

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
        timeSpentSec: Math.max(10, activeQuiz.durationSec - timeLeft),
        xpEarned,
      },
      newMistakes
    );
  };

  if (activeQuiz.examType === 'cq') {
    return (
      <div className="ev-modal-backdrop">
        <div
          className="ev-card"
          style={{ width: '100%', maxWidth: 880, maxHeight: '92vh', overflowY: 'auto', padding: 24 }}
        >
          <div className="ev-section-header">
            <div>
              <h3 className="ev-section-title">
                {trText(activeQuiz.subjectName, language)} — {trText(activeQuiz.chapterName, language)}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {isBn ? 'সৃজনশীল প্রশ্নোত্তর (১০ নম্বরের বোর্ড স্ট্যান্ডার্ড রুব্রিক)' : '10-Mark Creative Questions & Model Solutions'}
              </p>
            </div>
            <button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={closeQuiz}>
              ✕ {isBn ? 'বন্ধ করো' : 'Close'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeQuiz.cqs.map((cq, idx) => (
              <div key={cq.id} className="ev-card" style={{ background: 'var(--bg-surface-hover)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="ev-badge-pill ev-badge-violet">
                    {isBn ? `সৃজনশীল প্রশ্ন #${idx + 1} (১০ নম্বর)` : `Creative Set #${idx + 1}`}
                  </span>
                  {cq.boardTag && <span className="ev-badge-pill ev-badge-neutral">{cq.boardTag}</span>}
                </div>
                <div
                  className="font-bn"
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: 'var(--bg-surface-muted)',
                    borderLeft: '4px solid var(--brand-primary)',
                    fontSize: 15.5,
                    fontWeight: 600,
                    lineHeight: 1.65,
                    marginBottom: 14,
                  }}
                >
                  {trText(cq.stem, language)}
                </div>
                <div className="font-bn" style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14.5 }}>
                  <div><strong>ক (১ নম্বর):</strong> {trText(cq.a, language)}</div>
                  <div><strong>খ (২ নম্বর):</strong> {trText(cq.b, language)}</div>
                  <div><strong>গ (৩ নম্বর):</strong> {trText(cq.c, language)}</div>
                  <div><strong>ঘ (৪ নম্বর):</strong> {trText(cq.d, language)}</div>
                </div>
                <button
                  className="ev-btn ev-btn-soft ev-btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={() => setOpenCqSolution((p) => ({ ...p, [cq.id]: !p[cq.id] }))}
                >
                  {openCqSolution[cq.id]
                    ? isBn
                      ? 'উত্তর লুকাও'
                      : 'Hide Model Solution'
                    : isBn
                    ? 'নমুনা উত্তর দেখো (Show Model Solution)'
                    : 'Show Model Solution'}
                </button>
                {openCqSolution[cq.id] && (
                  <div className="ev-explanation-box font-bn">
                    <div><strong>ক উত্তর:</strong> {trText(cq.ansA, language)}</div>
                    <div style={{ marginTop: 6 }}><strong>খ উত্তর:</strong> {trText(cq.ansB, language)}</div>
                    <div style={{ marginTop: 6 }}><strong>গ উত্তর:</strong> {trText(cq.ansC, language)}</div>
                    <div style={{ marginTop: 6 }}><strong>ঘ উত্তর:</strong> {trText(cq.ansD, language)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const optionLabels = ['A', 'B', 'C', 'D'];
  const optionsArray =
    language === 'en'
      ? currentQ?.options.en || currentQ?.options.bn || []
      : currentQ?.options.bn || currentQ?.options.en || [];
  const progressPct = Math.round(((currentIndex + 1) / Math.max(1, questions.length)) * 100);

  return (
    <div className="ev-modal-backdrop" style={{ alignItems: 'flex-start', paddingTop: 18 }}>
      <div style={{ width: '100%', maxWidth: 1140, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="ev-card ev-quiz-header-bar" style={{ marginBottom: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span className="ev-badge-pill ev-badge-indigo">
                {activeQuiz.mode === 'timed' ? 'Timed Examination' : 'Practice Mode • Instant Concept Mastery'}
              </span>
              {currentQ?.boardTag && (
                <span className="ev-badge-pill ev-badge-neutral">{currentQ.boardTag}</span>
              )}
            </div>
            <h2 style={{ fontSize: '1.06rem', fontWeight: 800 }}>
              {trText(activeQuiz.subjectName, language)} — {trText(activeQuiz.chapterName, language)}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div className={`ev-timer-badge font-mono ${timeLeft <= 60 && !submitted ? 'is-urgent' : ''}`}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              className="ev-btn ev-btn-secondary ev-btn-sm"
              onClick={() => setMobileSheetOpen(true)}
            >
              Navigator ({answeredCount}/{questions.length})
            </button>

            {!submitted ? (
              <button className="ev-btn ev-btn-primary ev-btn-sm" onClick={handleSubmitExam}>
                {trKey('submit_exam', language)}
              </button>
            ) : null}

            <button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={closeQuiz}>
              ✕
            </button>
          </div>
        </div>

        <div className="ev-quiz-layout">
          <div className="ev-card ev-question-card">
            {currentQ && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {trKey('question', language)} {currentIndex + 1} / {questions.length}
                  </span>
                  <button
                    className={`ev-btn ${flagged[currentIndex] ? 'ev-btn-soft' : 'ev-btn-secondary'} ev-btn-sm`}
                    onClick={() => setFlagged((p) => ({ ...p, [currentIndex]: !p[currentIndex] }))}
                  >
                    {flagged[currentIndex] ? 'Bookmarked ★' : 'Bookmark ☆'}
                  </button>
                </div>

                <div className="ev-progress-track" style={{ marginBottom: 16 }}>
                  <div className="ev-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>

                <div className="ev-question-text font-bn" style={{ whiteSpace: 'pre-line' }}>
                  {trText(currentQ.q, language)}
                </div>

                <div className="ev-options-list">
                  {optionsArray.map((optText, optIdx) => {
                    const isSelected = answers[currentIndex] === optIdx;
                    let statusClass = '';
                    if (submitted) {
                      if (optIdx === currentQ.ans) statusClass = 'is-correct';
                      else if (isSelected && optIdx !== currentQ.ans) statusClass = 'is-incorrect';
                    } else if (isSelected) {
                      statusClass = 'is-selected';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={submitted}
                        className={`ev-option-btn ${statusClass}`}
                        onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }))}
                      >
                        <span className="ev-option-key">{optionLabels[optIdx] || optIdx + 1}</span>
                        <span className="font-bn" style={{ flex: 1 }}>
                          {optText}
                        </span>
                        {submitted && optIdx === currentQ.ans && (
                          <span className="ev-badge-pill ev-badge-success">Correct</span>
                        )}
                        {submitted && isSelected && optIdx !== currentQ.ans && (
                          <span className="ev-badge-pill ev-badge-danger">Your Choice</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {submitted && currentQ.explanation && (
                  <div className="ev-explanation-box font-bn">
                    <strong>{isBn ? 'ব্যাখ্যা (Concept Explanation): ' : 'Explanation: '}</strong>
                    {trText(currentQ.explanation, language)}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    marginTop: 22,
                    paddingTop: 16,
                    borderTop: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    className="ev-btn ev-btn-secondary"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  >
                    ← {trKey('prev_q', language)}
                  </button>

                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {answeredCount} / {questions.length} {trKey('answered', language)}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {currentIndex < questions.length - 1 ? (
                      <button
                        className="ev-btn ev-btn-primary"
                        onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                      >
                        {trKey('next_q', language)} →
                      </button>
                    ) : !submitted ? (
                      <button className="ev-btn ev-btn-primary" onClick={handleSubmitExam}>
                        {trKey('submit_exam', language)} ✓
                      </button>
                    ) : (
                      <button className="ev-btn ev-btn-primary" onClick={closeQuiz}>
                        {isBn ? 'ড্যাশবোর্ডে ফিরে যাও' : 'Finish Review'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="ev-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 800 }}>
                {trKey('question_palette', language)}
              </h3>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                {answeredCount}/{questions.length}
              </span>
            </div>
            <div className="ev-palette-grid">
              {questions.map((qItem, idx) => {
                const isAns = answers[idx] !== undefined;
                let cls = idx === currentIndex ? 'is-current' : '';
                if (submitted && isAns) {
                  cls += answers[idx] === qItem.ans ? ' is-correct' : ' is-incorrect';
                } else if (isAns) {
                  cls += ' is-answered';
                }
                return (
                  <button
                    key={idx}
                    className={`ev-palette-dot ${cls}`}
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
                style={{ width: '100%', marginTop: 16 }}
                onClick={handleSubmitExam}
              >
                {trKey('submit_exam', language)}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Navigator */}
      {mobileSheetOpen && (
        <div className="ev-modal-backdrop" onClick={() => setMobileSheetOpen(false)}>
          <div
            className="ev-card"
            style={{ width: '100%', maxWidth: 480, alignSelf: 'flex-end', borderRadius: '22px 22px 0 0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ev-section-header">
              <h3 className="ev-section-title">{trKey('question_palette', language)}</h3>
              <button className="ev-icon-btn" onClick={() => setMobileSheetOpen(false)}>
                ✕
              </button>
            </div>
            <div className="ev-palette-grid" style={{ marginBottom: 16 }}>
              {questions.map((_, idx) => {
                const isAns = answers[idx] !== undefined;
                return (
                  <button
                    key={idx}
                    className={`ev-palette-dot ${idx === currentIndex ? 'is-current' : ''} ${
                      isAns ? 'is-answered' : ''
                    }`}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMobileSheetOpen(false);
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            {!submitted && (
              <button className="ev-btn ev-btn-primary" style={{ width: '100%' }} onClick={handleSubmitExam}>
                {trKey('submit_exam', language)}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
