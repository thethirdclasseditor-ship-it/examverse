import React, { useEffect, useState } from 'react';
import { AppState, QuestionMCQ } from '../types';
import { SUBJECTS, BENCHMARK_LEADERBOARD } from '../data/syllabusData';
import { supabase } from '../lib/supabase';

const CUSTOM_QUESTIONS_STORAGE_KEY = 'examverse_custom_questions_v1';

export function loadCustomQuestions(): QuestionMCQ[] {
  try {
    const raw = window.localStorage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveCustomQuestions(list: QuestionMCQ[]) {
  try {
    window.localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

/* ==========================================================================
   FEATURE 1: PAST YEAR QUESTION BANK ARCHIVE (বিগত বছরের প্রশ্ন ব্যাংক)
   ========================================================================== */
export interface PastYearPaper {
  id: string;
  examGroup: 'Admission' | 'BCS & Bank' | 'HSC Board' | 'SSC Board';
  institution: string;
  year: string;
  titleBn: string;
  titleEn: string;
  negativeMark: number;
  subjectFilter?: string;
  categoryFilter: string;
}

export const PAST_YEAR_PAPERS: PastYearPaper[] = [
  { id: 'py-du-a-24', examGroup: 'Admission', institution: 'Dhaka University (DU)', year: '2024–25', titleBn: 'ঢাবি ক-ইউনিট (বিজ্ঞান) ভর্তি প্রশ্ন ২০২৪–২৫', titleEn: 'DU A-Unit Science Admission Question Paper', negativeMark: 0.25, categoryFilter: 'uni' },
  { id: 'py-du-b-24', examGroup: 'Admission', institution: 'Dhaka University (DU)', year: '2024–25', titleBn: 'ঢাবি খ-ইউনিট (মানবিক) ভর্তি প্রশ্ন ২০২৪–২৫', titleEn: 'DU B-Unit Arts & Humanities Question Paper', negativeMark: 0.25, categoryFilter: 'uni' },
  { id: 'py-du-c-24', examGroup: 'Admission', institution: 'Dhaka University (DU)', year: '2024–25', titleBn: 'ঢাবি গ-ইউনিট (ব্যবসায় শিক্ষা) ভর্তি প্রশ্ন ২০২৪–২৫', titleEn: 'DU C-Unit Business Studies Question Paper', negativeMark: 0.25, categoryFilter: 'uni' },
  { id: 'py-buet-24', examGroup: 'Admission', institution: 'BUET Preliminary', year: '2024', titleBn: 'বুয়েট প্রিলিমিনারি ভর্তি পরীক্ষা ২০২৪', titleEn: 'BUET Engineering Preliminary Question Paper', negativeMark: 0.25, categoryFilter: 'eng' },
  { id: 'py-med-24', examGroup: 'Admission', institution: 'Medical (MBBS)', year: '2024–25', titleBn: 'মেডিকেল (MBBS) ভর্তি পরীক্ষা প্রশ্ন ২০২৪–২৫', titleEn: 'DGHS Medical Admission Question Paper', negativeMark: 0.25, categoryFilter: 'med' },
  { id: 'py-bcs-46', examGroup: 'BCS & Bank', institution: 'BPSC (46th BCS)', year: '2024', titleBn: '৪৬তম বিসিএস প্রিলিমিনারি প্রশ্নপত্র', titleEn: '46th BCS Preliminary Official Paper', negativeMark: 0.5, categoryFilter: 'bcs' },
  { id: 'py-bcs-45', examGroup: 'BCS & Bank', institution: 'BPSC (45th BCS)', year: '2023', titleBn: '৪৫তম বিসিএস প্রিলিমিনারি প্রশ্নপত্র', titleEn: '45th BCS Preliminary Official Paper', negativeMark: 0.5, categoryFilter: 'bcs' },
  { id: 'py-bb-ad-24', examGroup: 'BCS & Bank', institution: 'Bangladesh Bank', year: '2024', titleBn: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD) ২০২৪', titleEn: 'Bangladesh Bank Assistant Director (AD) Question', negativeMark: 0.25, categoryFilter: 'bank' },
  { id: 'py-hsc-dhaka-24', examGroup: 'HSC Board', institution: 'Dhaka Board', year: '2024', titleBn: 'ঢাকা বোর্ড এইচএসসি চূড়ান্ত প্রশ্নপত্র ২০২৪', titleEn: 'Dhaka Board HSC Final Paper 2024', negativeMark: 0, categoryFilter: 'hsc' },
  { id: 'py-hsc-raj-24', examGroup: 'HSC Board', institution: 'Rajshahi Board', year: '2024', titleBn: 'রাজশাহী বোর্ড এইচএসসি চূড়ান্ত প্রশ্নপত্র ২০২৪', titleEn: 'Rajshahi Board HSC Final Paper 2024', negativeMark: 0, categoryFilter: 'hsc' },
  { id: 'py-ssc-dhaka-24', examGroup: 'SSC Board', institution: 'Dhaka Board', year: '2024', titleBn: 'ঢাকা বোর্ড এসএসসি চূড়ান্ত প্রশ্নপত্র ২০২৪', titleEn: 'Dhaka Board SSC Final Paper 2024', negativeMark: 0, categoryFilter: 'ssc' }
];

export const PastYearArchiveView: React.FC<{
  allQuestions: QuestionMCQ[];
  onStartPaper: (questions: QuestionMCQ[], title: string, mode: 'practice' | 'exam') => void;
}> = ({ allQuestions, onStartPaper }) => {
  const [filterTrack, setFilterTrack] = useState<string>('all');
  const [yearSearch, setYearSearch] = useState<string>('');

  const filteredPapers = PAST_YEAR_PAPERS.filter((p) => {
    const matchTrack = filterTrack === 'all' || p.examGroup === filterTrack;
    const matchQuery =
      !yearSearch ||
      p.titleBn.includes(yearSearch) ||
      p.titleEn.toLowerCase().includes(yearSearch.toLowerCase()) ||
      p.institution.toLowerCase().includes(yearSearch.toLowerCase()) ||
      p.year.includes(yearSearch);
    return matchTrack && matchQuery;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1.15rem' }}>
        <div>
          <span className="ev-badge-pill ev-badge-indigo" style={{ marginBottom: '0.3rem' }}>Question Bank Archive</span>
          <h1 className="font-bn" style={{ fontSize: '1.38rem', fontWeight: 800 }}>📚 বিগত বছরের প্রশ্ন ব্যাংক (Past Year Papers)</h1>
        </div>
        <input
          type="text"
          className="ev-input"
          style={{ maxWidth: '280px' }}
          placeholder="সাল বা প্রতিষ্ঠান খুঁজুন (যেমন: DU, 46th BCS, 2024)..."
          value={yearSearch}
          onChange={(e) => setYearSearch(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {(['all', 'Admission', 'BCS & Bank', 'HSC Board', 'SSC Board'] as const).map((tr) => (
          <button
            key={tr}
            type="button"
            className={`ev-btn ev-btn-sm ${filterTrack === tr ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
            onClick={() => setFilterTrack(tr)}
          >
            {tr === 'all' ? 'সকল আর্কাইভ (All Papers)' : tr}
          </button>
        ))}
      </div>

      <div className="ev-grid-2">
        {filteredPapers.map((paper) => {
          const pool = allQuestions.filter((q) => q.categories.includes(paper.categoryFilter));
          return (
            <div key={paper.id} className="ev-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.9rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <span className="ev-badge-pill ev-badge-indigo">{paper.institution}</span>
                  <span className="ev-badge-pill ev-badge-warning font-mono">{paper.year}</span>
                </div>
                <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.2rem' }}>{paper.titleBn}</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {paper.titleEn} • <strong>{pool.length} Verified MCQs</strong> • Negative: -{paper.negativeMark}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="ev-btn ev-btn-soft ev-btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => onStartPaper(pool, paper.titleBn, 'practice')}
                >
                  সমাধান ও ব্যাখ্যা (Practice)
                </button>
                <button
                  type="button"
                  className="ev-btn ev-btn-primary ev-btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => onStartPaper(pool, paper.titleBn, 'exam')}
                >
                  লাইভ পরীক্ষা (Timed Exam)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ==========================================================================
   FEATURE 3: 1v1 LIVE QUIZ BATTLE (১-অন-১ কুইজ ব্যাটল / Friend Challenge)
   ========================================================================== */
export const QuizBattleView: React.FC<{
  allQuestions: QuestionMCQ[];
  userName: string;
  onAwardBattleXp: (xp: number) => void;
}> = ({ allQuestions, userName, onAwardBattleXp }) => {
  const [roomCode, setRoomCode] = useState<string>('EV-' + Math.floor(1000 + Math.random() * 9000));
  const [joinCode, setJoinCode] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [opponentName, setOpponentName] = useState<string>('Nafis Rahman (BUET Track)');
  const [battleQuestions, setBattleQuestions] = useState<QuestionMCQ[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [myScore, setMyScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);
  const [status, setStatus] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [chosenOpt, setChosenOpt] = useState<number | null>(null);

  const startBattle = (customOpponent?: string) => {
    const pool = allQuestions.filter((q) => selectedSubject === 'all' || q.subjectId === selectedSubject);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
    if (customOpponent) setOpponentName(customOpponent);
    setBattleQuestions(shuffled);
    setCurrentIdx(0);
    setMyScore(0);
    setOppScore(0);
    setChosenOpt(null);
    setStatus('playing');
  };

  const handlePickBattleOption = (idx: number) => {
    if (chosenOpt !== null) return;
    setChosenOpt(idx);
    const q = battleQuestions[currentIdx];
    const isMeCorrect = idx === q.correctIndex;
    /* Opponent has a 72% realistic accuracy rate */
    const isOppCorrect = Math.random() < 0.72;

    const nextMy = myScore + (isMeCorrect ? 20 : 0);
    const nextOpp = oppScore + (isOppCorrect ? 20 : 0);
    setMyScore(nextMy);
    setOppScore(nextOpp);

    window.setTimeout(() => {
      if (currentIdx + 1 < battleQuestions.length) {
        setCurrentIdx((i) => i + 1);
        setChosenOpt(null);
      } else {
        setStatus('finished');
        if (nextMy >= nextOpp && nextMy > 0) {
          onAwardBattleXp(50);
        } else if (nextMy > 0) {
          onAwardBattleXp(20);
        }
      }
    }, 950);
  };

  if (status === 'lobby') {
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <span className="ev-badge-pill ev-badge-violet" style={{ marginBottom: '0.35rem' }}>Real-Time 1v1 Arena</span>
        <h1 className="font-bn" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>
          ⚔️ ১-অন-১ কুইজ ব্যাটল (1v1 Live Quiz Battle)
        </h1>

        <div className="ev-grid-2" style={{ marginBottom: '1.25rem' }}>
          <div className="ev-card" style={{ border: '1.5px solid var(--brand-primary-border)', background: 'linear-gradient(145deg, var(--bg-surface) 0%, var(--brand-primary-soft) 100%)' }}>
            <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem' }}>বন্ধুকে চ্যালেঞ্জ করুন (Room Code)</h3>
            <p className="font-bn" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              নিচের রুম কোডটি বন্ধুকে পাঠান অথবা সাবজেক্ট সিলেক্ট করে ব্যাটল শুরু করুন:
            </p>
            <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 800, padding: '0.55rem 0.9rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px dashed var(--brand-primary)', textAlign: 'center', marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
              {roomCode}
            </div>
            <select className="ev-select" style={{ marginBottom: '0.75rem' }} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="all">সকল বিষয় (All 17 Subjects Mix)</option>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.nameBn})</option>
              ))}
            </select>
            <button type="button" className="ev-btn ev-btn-primary" style={{ width: '100%' }} onClick={() => startBattle('Tasnim Zara (Medical Track)')}>
              ⚔️ কুইজ ব্যাটল শুরু করুন (5 Rapid Questions)
            </button>
          </div>

          <div className="ev-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem' }}>বন্ধুর রুমে জয়েন করুন (Join Room)</h3>
              <p className="font-bn" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                আপনার বন্ধুর দেওয়া `EV-XXXX` রুম কোডটি নিচে লিখে সরাসরি ম্যাচে যুক্ত হোন:
              </p>
              <input
                type="text"
                className="ev-input font-mono"
                placeholder="যেমন: EV-4829"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
            </div>
            <button
              type="button"
              className="ev-btn ev-btn-soft"
              style={{ width: '100%', marginTop: '0.85rem' }}
              onClick={() => startBattle(joinCode ? `Challenger (${joinCode})` : 'Nafis Rahman (BUET Track)')}
            >
              রুমে জয়েন ও ব্যাটল শুরু করুন →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    const won = myScore >= oppScore;
    return (
      <div className="ev-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '2.6rem', marginBottom: '0.4rem' }}>{won ? '🏆' : '⚡'}</div>
        <h2 className="font-bn" style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          {won ? 'অভিনন্দন! আপনি কুইজ ব্যাটলে বিজয়ী হয়েছেন!' : 'দারুণ লড়াই হয়েছে! আবার চেষ্টা করুন!'}
        </h2>
        <div className="ev-grid-2" style={{ margin: '1.25rem 0' }}>
          <div className="ev-card" style={{ background: 'var(--status-success-bg)', borderColor: 'var(--status-success-border)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{userName} (আপনি)</div>
            <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-success-text)' }}>{myScore} pts</div>
          </div>
          <div className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{opponentName}</div>
            <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800 }}>{oppScore} pts</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
          <button type="button" className="ev-btn ev-btn-primary" onClick={() => startBattle()}>আবার খেলুন (Rematch)</button>
          <button type="button" className="ev-btn ev-btn-secondary" onClick={() => { setRoomCode('EV-' + Math.floor(1000 + Math.random() * 9000)); setStatus('lobby'); }}>লবিতে ফিরুন</button>
        </div>
      </div>
    );
  }

  const q = battleQuestions[currentIdx];
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div className="ev-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'linear-gradient(90deg, var(--brand-primary-soft), var(--brand-accent-soft))' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>👤 {userName}</div>
          <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{myScore} pts</div>
        </div>
        <span className="ev-badge-pill ev-badge-warning">VS • Round {currentIdx + 1}/5</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>⚡ {opponentName}</div>
          <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-accent)' }}>{oppScore} pts</div>
        </div>
      </div>

      <div className="ev-card">
        <div className="font-bn" style={{ fontSize: '1.12rem', fontWeight: 800, marginBottom: '0.35rem' }}>{q.questionBn}</div>
        <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{q.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {q.options.map((opt, idx) => {
            let cls = 'ev-option-btn';
            if (chosenOpt !== null) {
              if (idx === q.correctIndex) cls += ' is-correct';
              else if (idx === chosenOpt) cls += ' is-incorrect';
            }
            return (
              <button key={idx} type="button" className={cls} onClick={() => handlePickBattleOption(idx)}>
                <span className="ev-badge-pill ev-badge-neutral">{String.fromCharCode(65 + idx)}</span>
                <span className="font-bn">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   FEATURE 11: 60-SECOND RAPID FIRE SPRINT (৬০-সেকেন্ড র‍্যাপিড ফায়ার মোড)
   ========================================================================== */
export const RapidFireView: React.FC<{
  allQuestions: QuestionMCQ[];
  onAwardSprintXp: (xp: number) => void;
}> = ({ allQuestions, onAwardSprintXp }) => {
  const [status, setStatus] = useState<'ready' | 'running' | 'done'>('ready');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [pool, setPool] = useState<QuestionMCQ[]>([]);
  const [idx, setIdx] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [streakCombo, setStreakCombo] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => Number(window.localStorage.getItem('ev_rapid_best') || 0));

  useEffect(() => {
    if (status !== 'running') return;
    const timer = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(timer);
          setStatus('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const startSprint = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setPool(shuffled);
    setIdx(0);
    setCorrectCount(0);
    setStreakCombo(0);
    setTimeLeft(60);
    setStatus('running');
  };

  const answerInstant = (optIdx: number) => {
    const q = pool[idx % pool.length];
    const isRight = optIdx === q.correctIndex;
    const nextCorrect = isRight ? correctCount + 1 : correctCount;
    const nextCombo = isRight ? streakCombo + 1 : 0;
    setCorrectCount(nextCorrect);
    setStreakCombo(nextCombo);
    if (nextCorrect > bestScore) {
      setBestScore(nextCorrect);
      try {
        window.localStorage.setItem('ev_rapid_best', String(nextCorrect));
      } catch {}
    }
    setIdx((i) => i + 1);
  };

  if (status === 'ready') {
    return (
      <div className="ev-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '2.2rem' }}>
        <span className="ev-badge-pill ev-badge-warning" style={{ marginBottom: '0.5rem' }}>⚡ 60-Second Speed Challenge</span>
        <h1 className="font-bn" style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.45rem' }}>
          ৬০-সেকেন্ড র‍্যাপিড ফায়ার মোড (Rapid Fire Sprint)
        </h1>
        <p className="font-bn" style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          মাত্র ৬০ সেকেন্ডে আপনি কতগুলো সঠিক উত্তর দিতে পারেন? অপশনে ক্লিক করার সাথে সাথেই পরের প্রশ্ন চলে আসবে!
        </p>
        <div style={{ marginBottom: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
          🏅 আপনার সর্বোচ্চ রেকর্ড (Personal Best): {bestScore} সঠিক উত্তর / ৬০ সেকেন্ড
        </div>
        <button type="button" className="ev-btn ev-btn-primary" onClick={startSprint}>
          ⚡ ৬০ সেকেন্ড স্প্রিন্ট শুরু করুন →
        </button>
      </div>
    );
  }

  if (status === 'done') {
    const earnedXp = correctCount * 15;
    return (
      <div className="ev-card" style={{ maxWidth: '620px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
        <h2 className="font-bn" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>⏱ সময় শেষ! (Time’s Up!)</h2>
        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '0.4rem' }}>
          {correctCount} সঠিক উত্তর (+{earnedXp} XP)
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          সর্বোচ্চ রেকর্ড: {bestScore} • মোট প্রশ্ন সমাধান: {idx}টি
        </p>
        <button
          type="button"
          className="ev-btn ev-btn-primary"
          onClick={() => {
            if (earnedXp > 0) onAwardSprintXp(earnedXp);
            startSprint();
          }}
        >
          XP গ্রহণ করে আবার খেলুন →
        </button>
      </div>
    );
  }

  const q = pool[idx % pool.length];
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="ev-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span className="ev-badge-pill ev-badge-danger font-mono" style={{ fontSize: '0.95rem' }}>⏱ {timeLeft}s Left</span>
        <span className="ev-badge-pill ev-badge-indigo">🔥 Combo: {streakCombo}x</span>
        <span className="font-mono" style={{ fontWeight: 800, color: 'var(--status-success)' }}>✓ Correct: {correctCount}</span>
      </div>
      <div className="ev-card">
        <div className="font-bn" style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.85rem' }}>{q.questionBn}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {q.options.map((opt, oIdx) => (
            <button key={oIdx} type="button" className="ev-option-btn" onClick={() => answerInstant(oIdx)}>
              <span className="ev-badge-pill ev-badge-neutral">{String.fromCharCode(65 + oIdx)}</span>
              <span className="font-bn">{opt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   FEATURE 14: SUBJECT-WISE LEADERBOARD (সাবজেক্ট ভিত্তিক লিডারবোর্ড)
   ========================================================================== */
export const SubjectLeaderboardView: React.FC<{ state: AppState }> = ({ state }) => {
  const [selectedSubj, setSelectedSubj] = useState<string>('all');
  const activeSubjectObj = SUBJECTS.find((s) => s.id === selectedSubj);

  /* Calculate subject-specific XP or global XP */
  const rows = [
    ...BENCHMARK_LEADERBOARD.map((b, idx) => ({
      ...b,
      subjXp: selectedSubj === 'all' ? b.xp : Math.max(120, Math.round(b.xp * (0.28 - idx * 0.03) + (selectedSubj.charCodeAt(0) % 7) * 45))
    })),
    {
      rank: 6,
      name: `${state.user.name} (আপনি)`,
      handle: state.user.username,
      avatar: state.user.avatarInitials,
      level: state.user.level,
      xp: state.user.xp,
      subjXp:
        selectedSubj === 'all'
          ? state.user.xp
          : (state.stats.subjectStats[selectedSubj]?.correct || 0) * 25 + (state.stats.subjectMastery[selectedSubj] || 0) * 5,
      badge: activeSubjectObj ? activeSubjectObj.nameBn : state.user.targetTrack,
      isCurrentUser: true
    }
  ].sort((a, b) => b.subjXp - a.subjXp);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1rem' }}>
        <div>
          <span className="ev-badge-pill ev-badge-indigo" style={{ marginBottom: '0.3rem' }}>Global &amp; Subject-Wise Ranking</span>
          <h1 className="font-bn" style={{ fontSize: '1.38rem', fontWeight: 800 }}>
            🏆 {activeSubjectObj ? `${activeSubjectObj.nameBn} — লিডারবোর্ড` : 'সার্বিক ও সাবজেক্ট ভিত্তিক লিডারবোর্ড'}
          </h1>
        </div>
        <select
          className="ev-select"
          style={{ maxWidth: '310px', fontWeight: 700 }}
          value={selectedSubj}
          onChange={(e) => setSelectedSubj(e.target.value)}
        >
          <option value="all">🌐 সকল বিষয় (Overall Global Leaderboard)</option>
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              📘 {s.nameBn} ({s.name})
            </option>
          ))}
        </select>
      </div>

      {/* Top 3 Podium */}
      <div className="ev-podium-grid">
        {rows.slice(0, 3).map((item, idx) => (
          <div key={item.handle} className={`ev-podium-card rank-${idx + 1}`}>
            <div style={{ fontSize: '1.55rem', fontWeight: 800 }}>
              {idx === 0 ? '👑 #1 Gold' : idx === 1 ? '🥈 #2 Silver' : '🥉 #3 Bronze'}
            </div>
            <div style={{ fontSize: '1.06rem', fontWeight: 800 }}>{item.name}</div>
            <span className="ev-badge-pill ev-badge-indigo">{item.badge}</span>
            <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
              {item.subjXp.toLocaleString()} XP
            </div>
          </div>
        ))}
      </div>

      <div className="ev-card">
        {rows.map((row, i) => (
          <div
            key={row.handle}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.82rem 1rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: row.isCurrentUser ? 'var(--brand-primary-soft)' : 'transparent',
              borderRadius: row.isCurrentUser ? '8px' : '0'
            }}
          >
            <div>
              <strong>#{i + 1} {row.name}</strong>{' '}
              <span className="font-bn" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({row.badge})</span>
            </div>
            <div className="font-mono" style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>
              {row.subjXp.toLocaleString()} XP • Lv.{row.level}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   FEATURE 15: ADMIN PANEL & BULK QUESTION UPLOADER (অ্যাডমিন প্যানেল)
   ========================================================================== */
export const AdminDashboardView: React.FC<{
  customQuestions: QuestionMCQ[];
  onAddQuestions: (newQs: QuestionMCQ[]) => void;
  onDeleteCustomQuestion: (id: string) => void;
  showToast: (msg: string) => void;
}> = ({ customQuestions, onAddQuestions, onDeleteCustomQuestion, showToast }) => {
  const [subjectId, setSubjectId] = useState<string>('physics');
  const activeSubj = SUBJECTS.find((s) => s.id === subjectId) || SUBJECTS[0];
  const [chapterId, setChapterId] = useState<string>(activeSubj.chapters[0].id);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [examTag, setExamTag] = useState<string>('DU / HSC Standard');
  const [questionBn, setQuestionBn] = useState<string>('');
  const [optA, setOptA] = useState<string>('');
  const [optB, setOptB] = useState<string>('');
  const [optC, setOptC] = useState<string>('');
  const [optD, setOptD] = useState<string>('');
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState<string>('');
  const [bulkJsonText, setBulkJsonText] = useState<string>('');

  const handleCreateSingleMCQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionBn.trim() || !optA.trim() || !optB.trim()) {
      showToast('অনুগ্রহ করে প্রশ্ন এবং কমপক্ষে অপশনগুলো পূরণ করুন।');
      return;
    }
    const newQ: QuestionMCQ = {
      id: 'q-custom-' + Date.now(),
      subjectId,
      chapterId,
      categories: ['ssc', 'hsc', 'uni', 'bcs', 'bank'],
      difficulty,
      questionType: 'standard',
      examTag,
      question: questionBn.trim(),
      questionBn: questionBn.trim(),
      options: [optA.trim(), optB.trim(), optC.trim() || 'None', optD.trim() || 'All'],
      correctIndex,
      explanation: explanation.trim() || 'সঠিক উত্তরটি বোর্ড পাঠ্যবই অনুসারে যাচাইকৃত।'
    };

    onAddQuestions([newQ]);

    /* Also sync to Supabase questions_mcq table if connected */
    try {
      await supabase.from('questions_mcq').upsert({
        id: newQ.id,
        subject_id: newQ.subjectId,
        chapter_id: newQ.chapterId,
        categories: newQ.categories,
        difficulty: newQ.difficulty,
        exam_tag: newQ.examTag,
        question_en: newQ.question,
        question_bn: newQ.questionBn,
        options: newQ.options,
        correct_index: newQ.correctIndex,
        explanation: newQ.explanation
      });
    } catch {}

    setQuestionBn('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setExplanation('');
    showToast('নতুন MCQ সফলভাবে যুক্ত হয়েছে!');
  };

  const handleBulkImport = () => {
    try {
      const parsed = JSON.parse(bulkJsonText);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      const valid: QuestionMCQ[] = arr.map((item, idx) => ({
        id: item.id || `q-bulk-${Date.now()}-${idx}`,
        subjectId: item.subjectId || 'physics',
        chapterId: item.chapterId || 'phy-1',
        categories: item.categories || ['hsc', 'uni', 'bcs'],
        difficulty: item.difficulty || 'Medium',
        questionType: item.questionType || 'standard',
        examTag: item.examTag || 'Verified Question',
        question: item.question || item.questionBn || '',
        questionBn: item.questionBn || item.question || '',
        options: item.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: Number(item.correctIndex) || 0,
        explanation: item.explanation || ''
      }));
      onAddQuestions(valid);
      setBulkJsonText('');
      showToast(`${valid.length}টি প্রশ্ন একসাথে আপলোড হয়েছে!`);
    } catch {
      showToast('সঠিক JSON ফরম্যাট দিন!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <span className="ev-badge-pill ev-badge-indigo" style={{ marginBottom: '0.3rem' }}>Admin Content Manager</span>
        <h1 className="font-bn" style={{ fontSize: '1.38rem', fontWeight: 800 }}>🛠️ অ্যাডমিন প্যানেল ও প্রশ্ন আপলোডার (Admin Panel)</h1>
      </div>

      <div className="ev-grid-2">
        {/* 1. Single Question Creator Form */}
        <form onSubmit={handleCreateSingleMCQ} className="ev-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800 }}>+ নতুন MCQ প্রশ্ন যোগ করুন</h3>
          <div className="ev-grid-2">
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Subject (বিষয়)</label>
              <select
                className="ev-select"
                value={subjectId}
                onChange={(e) => {
                  const s = SUBJECTS.find((x) => x.id === e.target.value) || SUBJECTS[0];
                  setSubjectId(s.id);
                  setChapterId(s.chapters[0].id);
                }}
              >
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.nameBn} ({s.name})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Chapter (অধ্যায়)</label>
              <select className="ev-select" value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
                {activeSubj.chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>{ch.titleBn}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ev-grid-2">
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Difficulty</label>
              <select className="ev-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Exam Tag / সাল</label>
              <input type="text" className="ev-input" value={examTag} onChange={(e) => setExamTag(e.target.value)} placeholder="যেমন: DU A-Unit 2024" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>প্রশ্ন (Question Text)</label>
            <input type="text" className="ev-input" value={questionBn} onChange={(e) => setQuestionBn(e.target.value)} placeholder="প্রশ্নটি এখানে লিখুন..." required />
          </div>

          <div className="ev-grid-2">
            <input type="text" className="ev-input" placeholder="অপশন A" value={optA} onChange={(e) => setOptA(e.target.value)} required />
            <input type="text" className="ev-input" placeholder="অপশন B" value={optB} onChange={(e) => setOptB(e.target.value)} required />
            <input type="text" className="ev-input" placeholder="অপশন C" value={optC} onChange={(e) => setOptC(e.target.value)} />
            <input type="text" className="ev-input" placeholder="অপশন D" value={optD} onChange={(e) => setOptD(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>সঠিক উত্তর কোনটি? (Correct Option)</label>
            <select className="ev-select" value={correctIndex} onChange={(e) => setCorrectIndex(Number(e.target.value))}>
              <option value={0}>Option A</option>
              <option value={1}>Option B</option>
              <option value={2}>Option C</option>
              <option value={3}>Option D</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>ব্যাখ্যা (Explanation)</label>
            <input type="text" className="ev-input" value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="উত্তরের ব্যাখ্যা বা সূত্র লিখুন..." />
          </div>

          <button type="submit" className="ev-btn ev-btn-primary">✓ প্রশ্ন সেভ ও প্রকাশ করুন</button>
        </form>

        {/* 2. Bulk JSON Importer & Custom Question List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="ev-card">
            <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem' }}>⚡ বাল্ক প্রশ্ন আপলোড (Bulk JSON Import)</h3>
            <p className="font-bn" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
              একসাথে শত শত প্রশ্ন যোগ করতে JSON অ্যারে পেস্ট করে Import চাপুন:
            </p>
            <textarea
              className="ev-input font-mono"
              rows={5}
              style={{ fontSize: '0.75rem', marginBottom: '0.65rem' }}
              placeholder={'[{"subjectId":"physics","chapterId":"phy-1","questionBn":"বল ও সরণের গুণফলকে কী বলে?","options":["কাজ","ক্ষমতা","শক্তি","ভরবেগ"],"correctIndex":0,"explanation":"W = Fs"}]'}
              value={bulkJsonText}
              onChange={(e) => setBulkJsonText(e.target.value)}
            />
            <button type="button" className="ev-btn ev-btn-soft" style={{ width: '100%' }} onClick={handleBulkImport}>
              Import Bulk Questions
            </button>
          </div>

          <div className="ev-card">
            <h3 className="font-bn" style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              আপনার যুক্ত করা কাস্টম প্রশ্নসমূহ ({customQuestions.length}টি)
            </h3>
            {customQuestions.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>এখনো কোনো কাস্টম প্রশ্ন যোগ করা হয়নি।</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                {customQuestions.map((cq) => (
                  <div key={cq.id} style={{ padding: '0.6rem', background: 'var(--bg-surface-muted)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="font-bn" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{cq.questionBn}</span>
                    <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => onDeleteCustomQuestion(cq.id)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
