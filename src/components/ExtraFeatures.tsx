import React, { useEffect, useState } from 'react';
import { AppState, LeaderboardEntry, QuestionMCQ } from '../types';
import { SUBJECTS, BENCHMARK_LEADERBOARD } from '../data/syllabusData';
import { supabase, fetchRealCloudLeaderboard } from '../lib/supabase';

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
   FEATURE 1 (Audit 3.5 Fix): PAST YEAR QUESTION BANK ARCHIVE
   ========================================================================== */
export interface PastYearPaper {
  id: string;
  examGroup: 'Admission' | 'BCS & Bank' | 'HSC Board' | 'SSC Board';
  institution: string;
  year: string;
  unit: string;
  titleBn: string;
  titleEn: string;
  negativeMark: number;
  categoryFilter: string;
  subjectIds: string[];
}

export const PAST_YEAR_PAPERS: PastYearPaper[] = [
  { id: 'py-du-a-24', examGroup: 'Admission', institution: 'Dhaka University', year: '2024–25', unit: 'A-Unit (Science)', titleBn: 'ঢাবি ক-ইউনিট (বিজ্ঞান) ভর্তি প্রশ্ন সেট ২০২৪–২৫', titleEn: 'DU A-Unit Science Question Set', negativeMark: 0.25, categoryFilter: 'uni', subjectIds: ['physics', 'chemistry', 'math', 'biology'] },
  { id: 'py-du-b-24', examGroup: 'Admission', institution: 'Dhaka University', year: '2024–25', unit: 'B-Unit (Arts)', titleBn: 'ঢাবি খ-ইউনিট (মানবিক) ভর্তি প্রশ্ন সেট ২০২৪–২৫', titleEn: 'DU B-Unit Arts & Humanities Set', negativeMark: 0.25, categoryFilter: 'uni', subjectIds: ['bangla', 'english', 'gk', 'economics', 'civics', 'history'] },
  { id: 'py-du-c-24', examGroup: 'Admission', institution: 'Dhaka University', year: '2024–25', unit: 'C-Unit (Commerce)', titleBn: 'ঢাবি গ-ইউনিট (ব্যবসায় শিক্ষা) ভর্তি প্রশ্ন সেট ২০২৪–২৫', titleEn: 'DU C-Unit Business Studies Set', negativeMark: 0.25, categoryFilter: 'uni', subjectIds: ['accounting', 'management', 'finance', 'marketing', 'english', 'bangla'] },
  { id: 'py-buet-24', examGroup: 'Admission', institution: 'BUET', year: '2024', unit: 'Preliminary', titleBn: 'বুয়েট প্রিলিমিনারি ভর্তি প্রশ্ন সেট ২০২৪', titleEn: 'BUET Engineering Preliminary Set', negativeMark: 0.25, categoryFilter: 'eng', subjectIds: ['physics', 'chemistry', 'math'] },
  { id: 'py-med-24', examGroup: 'Admission', institution: 'DGHS Medical', year: '2024–25', unit: 'MBBS', titleBn: 'মেডিকেল (MBBS) ভর্তি পরীক্ষা প্রশ্ন সেট ২০২৪–২৫', titleEn: 'Medical Admission Standard Paper', negativeMark: 0.25, categoryFilter: 'med', subjectIds: ['biology', 'chemistry', 'physics', 'english', 'gk'] },
  { id: 'py-bcs-46', examGroup: 'BCS & Bank', institution: 'BPSC', year: '2024', unit: '46th BCS', titleBn: '৪৬তম বিসিএস প্রিলিমিনারি প্রশ্ন সেট', titleEn: '46th BCS Preliminary Paper', negativeMark: 0.5, categoryFilter: 'bcs', subjectIds: ['bangla', 'english', 'gk', 'math', 'ict', 'economics', 'civics'] },
  { id: 'py-bb-ad-24', examGroup: 'BCS & Bank', institution: 'Bangladesh Bank', year: '2024', unit: 'AD General', titleBn: 'বাংলাদেশ ব্যাংক সহকারী পরিচালক (AD) ২০২৪', titleEn: 'Bangladesh Bank AD Paper', negativeMark: 0.25, categoryFilter: 'bank', subjectIds: ['math', 'english', 'accounting', 'finance', 'economics', 'ict', 'gk'] },
  { id: 'py-hsc-dhaka-24', examGroup: 'HSC Board', institution: 'Dhaka Board', year: '2024', unit: 'HSC Final', titleBn: 'ঢাকা বোর্ড এইচএসসি চূড়ান্ত প্রশ্ন সেট ২০২৪', titleEn: 'Dhaka Board HSC Paper 2024', negativeMark: 0, categoryFilter: 'hsc', subjectIds: ['physics', 'chemistry', 'math', 'biology', 'accounting', 'economics', 'bangla', 'english', 'ict'] },
  { id: 'py-ssc-dhaka-24', examGroup: 'SSC Board', institution: 'Dhaka Board', year: '2024', unit: 'SSC Final', titleBn: 'ঢাকা বোর্ড এসএসসি চূড়ান্ত প্রশ্ন সেট ২০২৪', titleEn: 'Dhaka Board SSC Paper 2024', negativeMark: 0, categoryFilter: 'ssc', subjectIds: ['physics', 'chemistry', 'math', 'biology', 'accounting', 'bangla', 'english', 'gk'] }
];

export const PastYearArchiveView: React.FC<{
  allQuestions: QuestionMCQ[];
  onStartPaper: (questions: QuestionMCQ[], title: string, mode: 'practice' | 'exam', categoryId: string, negativeMark: number) => void;
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
          <h1 className="font-bn" style={{ fontSize: '1.38rem', fontWeight: 800 }}>📚 বিগত বছরের প্রশ্ন ব্যাংক আর্কাইভ</h1>
        </div>
        <input
          type="text"
          className="ev-input"
          style={{ maxWidth: '280px' }}
          placeholder="সাল, ইউনিট বা প্রতিষ্ঠান খুঁজুন..."
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
          /* Audit 3.5 Fix: Filter by paperId if tagged, or by the exact unit's subjectIds + category */
          const pool = allQuestions.filter(
            (q) =>
              q.paperId === paper.id ||
              (paper.subjectIds.includes(q.subjectId) && q.categories.includes(paper.categoryFilter))
          );
          return (
            <div key={paper.id} className="ev-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.9rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span className="ev-badge-pill ev-badge-indigo">{paper.institution} • {paper.unit}</span>
                  <span className="ev-badge-pill ev-badge-warning font-mono">{paper.year} • Neg: -{paper.negativeMark}</span>
                </div>
                <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.2rem' }}>{paper.titleBn}</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {paper.titleEn} • <strong>{pool.length} Subject-Matched MCQs</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  className="ev-btn ev-btn-soft ev-btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => onStartPaper(pool, paper.titleBn, 'practice', paper.categoryFilter, 0)}
                >
                  Practice &amp; Solution
                </button>
                <button
                  type="button"
                  className="ev-btn ev-btn-primary ev-btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => onStartPaper(pool, paper.titleBn, 'exam', paper.categoryFilter, paper.negativeMark)}
                >
                  Timed Exam (-{paper.negativeMark})
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
   FEATURE 3 (Audit 3.6 Fix): 1v1 QUIZ BATTLE (Supabase Realtime Room + Practice Bot Mode)
   ========================================================================== */
export const QuizBattleView: React.FC<{
  allQuestions: QuestionMCQ[];
  userName: string;
  onAwardBattleXp: (xp: number) => void;
}> = ({ allQuestions, userName, onAwardBattleXp }) => {
  const [battleMode, setBattleMode] = useState<'bot' | 'realtime'>('bot');
  const [roomCode, setRoomCode] = useState<string>('EV-' + Math.floor(1000 + Math.random() * 9000));
  const [joinCode, setJoinCode] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [opponentName, setOpponentName] = useState<string>('Practice AI Bot');
  const [battleQuestions, setBattleQuestions] = useState<QuestionMCQ[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [myScore, setMyScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);
  const [status, setStatus] = useState<'lobby' | 'playing' | 'finished'>('lobby');
  const [chosenOpt, setChosenOpt] = useState<number | null>(null);
  const [activeChannel, setActiveChannel] = useState<any>(null);

  useEffect(() => {
    return () => {
      if (activeChannel) supabase.removeChannel(activeChannel);
    };
  }, [activeChannel]);

  const startBattle = (modeType: 'bot' | 'realtime', customCode?: string) => {
    const code = customCode || roomCode;
    const pool = allQuestions.filter((q) => selectedSubject === 'all' || q.subjectId === selectedSubject);
    /* Deterministic shuffle by room code so two players in the same Realtime room get the exact same 5 questions */
    let seed = 0;
    for (let i = 0; i < code.length; i++) seed = (seed * 31 + code.charCodeAt(i)) >>> 0;
    const ordered = [...pool].sort((a, b) => ((a.id.charCodeAt(2) + seed) % 13) - ((b.id.charCodeAt(2) + seed) % 13)).slice(0, 5);

    setBattleMode(modeType);
    setOpponentName(modeType === 'bot' ? 'Practice AI Challenger (Bot)' : `Room Opponent (${code})`);
    setBattleQuestions(ordered);
    setCurrentIdx(0);
    setMyScore(0);
    setOppScore(0);
    setChosenOpt(null);
    setStatus('playing');

    if (modeType === 'realtime') {
      const ch = supabase.channel(`ev-battle-${code}`);
      ch.on('broadcast', { event: 'score_update' }, (payload: any) => {
        if (payload?.payload?.sender !== userName) {
          setOpponentName(payload.payload.sender || 'Live Challenger');
          setOppScore(Number(payload.payload.score) || 0);
        }
      }).subscribe();
      setActiveChannel(ch);
    }
  };

  const handlePickBattleOption = (idx: number) => {
    if (chosenOpt !== null) return;
    setChosenOpt(idx);
    const q = battleQuestions[currentIdx];
    const isMeCorrect = idx === q.correctIndex;
    const nextMy = myScore + (isMeCorrect ? 20 : 0);
    setMyScore(nextMy);

    if (battleMode === 'realtime' && activeChannel) {
      activeChannel.send({
        type: 'broadcast',
        event: 'score_update',
        payload: { sender: userName, score: nextMy }
      });
    } else {
      const isBotCorrect = Math.random() < 0.7;
      setOppScore((prev) => prev + (isBotCorrect ? 20 : 0));
    }

    window.setTimeout(() => {
      if (currentIdx + 1 < battleQuestions.length) {
        setCurrentIdx((i) => i + 1);
        setChosenOpt(null);
      } else {
        setStatus('finished');
        if (nextMy > 0) onAwardBattleXp(nextMy >= oppScore ? 40 : 15);
      }
    }, 900);
  };

  if (status === 'lobby') {
    return (
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        <span className="ev-badge-pill ev-badge-violet" style={{ marginBottom: '0.35rem' }}>1v1 Challenge &amp; Practice Bot</span>
        <h1 className="font-bn" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>
          ⚔️ ১-অন-১ কুইজ ব্যাটল (Live Room Sync &amp; Practice Bot Battle)
        </h1>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>ব্যাটলের বিষয় নির্বাচন করুন (Select Subject)</label>
          <select className="ev-select" style={{ maxWidth: '340px' }} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            <option value="all">সকল বিষয় (All 17 Subjects)</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>{s.nameBn} ({s.name})</option>
            ))}
          </select>
        </div>

        <div className="ev-grid-2">
          {/* Option 1: Honest Practice Bot Battle (Audit 3.6 recommendation) */}
          <div className="ev-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
            <div>
              <span className="ev-badge-pill ev-badge-indigo" style={{ marginBottom: '0.35rem' }}>Instant Solo Match</span>
              <h3 className="font-bn" style={{ fontSize: '1.08rem', fontWeight: 800 }}>🤖 Practice Bot Battle (তাৎক্ষণিক প্র্যাকটিস ম্যাচ)</h3>
              <p className="font-bn" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                যেকোনো সময় অপেক্ষা ছাড়াই AI Bot প্রতিদ্বন্দ্বীর সাথে ৫টি প্রশ্নের দ্রুতগতির প্র্যাকটিস ম্যাচ খেলুন।
              </p>
            </div>
            <button type="button" className="ev-btn ev-btn-primary" onClick={() => startBattle('bot')}>
              🤖 Start Practice Bot Battle →
            </button>
          </div>

          {/* Option 2: Real-Time Room Sync via Supabase Realtime Channel */}
          <div className="ev-card" style={{ border: '1.5px solid var(--brand-primary-border)', background: 'linear-gradient(145deg, var(--bg-surface) 0%, var(--brand-primary-soft) 100%)' }}>
            <span className="ev-badge-pill ev-badge-success" style={{ marginBottom: '0.35rem' }}>Supabase Realtime Channel</span>
            <h3 className="font-bn" style={{ fontSize: '1.08rem', fontWeight: 800 }}>🌐 Live Friend Room Battle (রুম কোড ম্যাচ)</h3>
            <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, padding: '0.45rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px dashed var(--brand-primary)', textAlign: 'center', margin: '0.55rem 0', color: 'var(--brand-primary)' }}>
              Your Room Code: {roomCode}
            </div>
            <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '0.55rem' }}>
              <input
                type="text"
                className="ev-input font-mono"
                placeholder="বন্ধুর কোড (যেমন: EV-4829)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={() => startBattle('realtime', joinCode || roomCode)}>
                Join / Start
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    const won = myScore >= oppScore;
    return (
      <div className="ev-card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.35rem' }}>{won ? '🏆' : '⚡'}</div>
        <h2 className="font-bn" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
          {won ? 'অভিনন্দন! আপনি ম্যাচে এগিয়ে থেকে জয়ী হয়েছেন!' : 'দারুণ লড়াই হয়েছে! আবার চেষ্টা করুন!'}
        </h2>
        <div className="ev-grid-2" style={{ margin: '1.25rem 0' }}>
          <div className="ev-card" style={{ background: 'var(--status-success-bg)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{userName} (আপনি)</div>
            <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--status-success-text)' }}>{myScore} pts</div>
          </div>
          <div className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{opponentName}</div>
            <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800 }}>{oppScore} pts</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
          <button type="button" className="ev-btn ev-btn-primary" onClick={() => startBattle(battleMode)}>Play Again</button>
          <button type="button" className="ev-btn ev-btn-secondary" onClick={() => setStatus('lobby')}>Back to Lobby</button>
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
        <span className="ev-badge-pill ev-badge-warning">
          {battleMode === 'bot' ? '🤖 Bot Match' : '🌐 Live Room'} • Q {currentIdx + 1}/5
        </span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{opponentName}</div>
          <div className="font-mono" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-accent)' }}>{oppScore} pts</div>
        </div>
      </div>

      <div className="ev-card">
        <div className="font-bn" style={{ fontSize: '1.12rem', fontWeight: 800, marginBottom: '0.85rem' }}>{q.questionBn}</div>
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
   FEATURE 11: 60-SECOND RAPID FIRE SPRINT
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
  const [xpClaimed, setXpClaimed] = useState<boolean>(false);
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
    setPool([...allQuestions].sort(() => Math.random() - 0.5));
    setIdx(0);
    setCorrectCount(0);
    setStreakCombo(0);
    setXpClaimed(false);
    setTimeLeft(60);
    setStatus('running');
  };

  const answerInstant = (optIdx: number) => {
    const q = pool[idx % pool.length];
    const isRight = optIdx === q.correctIndex;
    const nextCorrect = isRight ? correctCount + 1 : correctCount;
    setCorrectCount(nextCorrect);
    setStreakCombo(isRight ? streakCombo + 1 : 0);
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
          ৬০-সেকেন্ড র‍্যাপিড ফায়ার মোড
        </h1>
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
    const earnedXp = correctCount * 10;
    return (
      <div className="ev-card" style={{ maxWidth: '620px', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
        <h2 className="font-bn" style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>⏱ সময় শেষ!</h2>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-primary)', marginBottom: '0.4rem' }}>
          {correctCount} সঠিক উত্তর (+{earnedXp} XP)
        </div>
        <button
          type="button"
          className="ev-btn ev-btn-primary"
          onClick={() => {
            if (!xpClaimed && earnedXp > 0) {
              setXpClaimed(true);
              onAwardSprintXp(earnedXp);
            }
            startSprint();
          }}
        >
          আবার খেলুন →
        </button>
      </div>
    );
  }

  const q = pool[idx % pool.length];
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="ev-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span className="ev-badge-pill ev-badge-danger font-mono">⏱ {timeLeft}s Left</span>
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
   FEATURE 14 (Audit 3.7 Fix): REAL DATABASE & SUBJECT-WISE LEADERBOARD
   ========================================================================== */
export const SubjectLeaderboardView: React.FC<{ state: AppState }> = ({ state }) => {
  const [selectedSubj, setSelectedSubj] = useState<string>('all');
  const [cloudRows, setCloudRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const activeSubjectObj = SUBJECTS.find((s) => s.id === selectedSubj);

  useEffect(() => {
    setLoading(true);
    fetchRealCloudLeaderboard(selectedSubj)
      .then((rows) => setCloudRows(rows))
      .finally(() => setLoading(false));
  }, [selectedSubj, state.user.xp]);

  /* User's real subject score based on actual correct answers & mastery in that subject */
  const mySubjXp =
    selectedSubj === 'all'
      ? state.user.xp
      : (state.stats.subjectStats[selectedSubj]?.correct || 0) * 20 +
        (state.stats.subjectMastery[selectedSubj] || 0) * 3;

  const baseList = cloudRows.length > 0 ? cloudRows : BENCHMARK_LEADERBOARD;
  const combined = [
    ...baseList.filter((r) => r.handle !== state.user.username),
    {
      rank: 0,
      name: `${state.user.name} (আপনি)`,
      handle: state.user.username,
      avatar: state.user.avatarInitials,
      level: state.user.level,
      xp: mySubjXp,
      badge: activeSubjectObj ? `${state.stats.subjectMastery[selectedSubj] || 0}% Mastery` : state.user.targetTrack,
      isCurrentUser: true
    }
  ]
    .sort((a, b) => b.xp - a.xp)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '1rem' }}>
        <div>
          <span className="ev-badge-pill ev-badge-success" style={{ marginBottom: '0.3rem' }}>
            {cloudRows.length > 0 ? `✓ Live Database Ranking (${cloudRows.length} Users)` : 'Merit Leaderboard'}
          </span>
          <h1 className="font-bn" style={{ fontSize: '1.38rem', fontWeight: 800 }}>
            🏆 {activeSubjectObj ? `${activeSubjectObj.nameBn} — সাবজেক্ট লিডারবোর্ড` : 'সার্বিক ও সাবজেক্ট ভিত্তিক লিডারবোর্ড'}
          </h1>
        </div>
        <select
          className="ev-select"
          style={{ maxWidth: '310px', fontWeight: 700 }}
          value={selectedSubj}
          onChange={(e) => setSelectedSubj(e.target.value)}
        >
          <option value="all">🌐 সকল বিষয় (Overall Global XP)</option>
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              📘 {s.nameBn} ({s.name})
            </option>
          ))}
        </select>
      </div>

      {loading && <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>ডাটাবেস থেকে র‍্যাংকিং লোড হচ্ছে...</div>}

      <div className="ev-podium-grid">
        {combined.slice(0, 3).map((item, idx) => (
          <div key={item.handle + idx} className={`ev-podium-card rank-${idx + 1}`}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {idx === 0 ? '👑 #1 Gold' : idx === 1 ? '🥈 #2 Silver' : '🥉 #3 Bronze'}
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{item.name}</div>
            <span className="ev-badge-pill ev-badge-indigo">{item.badge}</span>
            <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
              {item.xp.toLocaleString()} XP • Lv.{item.level}
            </div>
          </div>
        ))}
      </div>

      <div className="ev-card">
        {combined.map((row) => (
          <div
            key={row.handle + row.rank}
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
              <strong>#{row.rank} {row.name}</strong>{' '}
              <span className="font-bn" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({row.badge})</span>
            </div>
            <div className="font-mono" style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>
              {row.xp.toLocaleString()} XP • Lv.{row.level}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ==========================================================================
   FEATURE 15 (BUG-05 Fix): ROLE-PROTECTED ADMIN PANEL & BULK UPLOADER
   ========================================================================== */
export const AdminDashboardView: React.FC<{
  isAdmin: boolean;
  authEmail: string | null;
  customQuestions: QuestionMCQ[];
  onAddQuestions: (newQs: QuestionMCQ[]) => void;
  onDeleteCustomQuestion: (id: string) => void;
  showToast: (msg: string) => void;
}> = ({ isAdmin, authEmail, customQuestions, onAddQuestions, onDeleteCustomQuestion, showToast }) => {
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

  /* BUG-05 Security Gate: Block unauthorized users from Admin Panel */
  if (!authEmail || !isAdmin) {
    return (
      <div className="ev-card" style={{ maxWidth: '580px', margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
        <span className="ev-badge-pill ev-badge-danger" style={{ marginBottom: '0.5rem' }}>🔒 Restricted Admin Area</span>
        <h2 className="font-bn" style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          শুধুমাত্র অনুমোদিত অ্যাডমিন এই প্যানেলে প্রবেশ করতে পারবেন
        </h2>
        <p className="font-bn" style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          আপনার অ্যাডমিন একাউন্ট দিয়ে লগইন করুন এবং নিশ্চিত করুন যে Supabase ডাটাবেসের `user_profiles` টেবিলে আপনার একাউন্টে `is_admin = true` দেওয়া আছে।
        </p>
      </div>
    );
  }

  const handleCreateSingleMCQ = async (e: React.FormEvent) => {
    e.preventDefault();
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
      explanation: explanation.trim() || 'বোর্ড পাঠ্যবই অনুসারে যাচাইকৃত।'
    };

    const { error } = await supabase.from('questions_mcq').upsert({
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

    if (error) {
      showToast('Database RLS Warning: ' + error.message);
    }

    onAddQuestions([newQ]);
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
      showToast(`${valid.length}টি প্রশ্ন আপলোড হয়েছে!`);
    } catch {
      showToast('সঠিক JSON ফরম্যাট দিন!');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <span className="ev-badge-pill ev-badge-success" style={{ marginBottom: '0.3rem' }}>✓ Verified Admin ({authEmail})</span>
        <h1 className="font-bn" style={{ fontSize: '1.38rem', fontWeight: 800 }}>🛠️ অ্যাডমিন প্যানেল ও প্রশ্ন আপলোডার</h1>
      </div>

      <div className="ev-grid-2">
        <form onSubmit={handleCreateSingleMCQ} className="ev-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800 }}>+ নতুন MCQ প্রশ্ন যোগ করুন</h3>
          <div className="ev-grid-2">
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
                <option key={s.id} value={s.id}>{s.nameBn}</option>
              ))}
            </select>
            <select className="ev-select" value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
              {activeSubj.chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>{ch.titleBn}</option>
              ))}
            </select>
          </div>
          <div className="ev-grid-2">
            <select className="ev-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <input type="text" className="ev-input" value={examTag} onChange={(e) => setExamTag(e.target.value)} placeholder="Exam Tag (DU / 46th BCS)" />
          </div>
          <input type="text" className="ev-input" value={questionBn} onChange={(e) => setQuestionBn(e.target.value)} placeholder="প্রশ্নটি লিখুন..." required />
          <div className="ev-grid-2">
            <input type="text" className="ev-input" placeholder="অপশন A" value={optA} onChange={(e) => setOptA(e.target.value)} required />
            <input type="text" className="ev-input" placeholder="অপশন B" value={optB} onChange={(e) => setOptB(e.target.value)} required />
            <input type="text" className="ev-input" placeholder="অপশন C" value={optC} onChange={(e) => setOptC(e.target.value)} />
            <input type="text" className="ev-input" placeholder="অপশন D" value={optD} onChange={(e) => setOptD(e.target.value)} />
          </div>
          <select className="ev-select" value={correctIndex} onChange={(e) => setCorrectIndex(Number(e.target.value))}>
            <option value={0}>সঠিক উত্তর: Option A</option>
            <option value={1}>সঠিক উত্তর: Option B</option>
            <option value={2}>সঠিক উত্তর: Option C</option>
            <option value={3}>সঠিক উত্তর: Option D</option>
          </select>
          <input type="text" className="ev-input" value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="ব্যাখ্যা লিখুন..." />
          <button type="submit" className="ev-btn ev-btn-primary">✓ প্রশ্ন সেভ করুন</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="ev-card">
            <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.4rem' }}>⚡ বাল্ক প্রশ্ন আপলোড (Bulk JSON)</h3>
            <textarea
              className="ev-input font-mono"
              rows={5}
              style={{ fontSize: '0.75rem', marginBottom: '0.65rem' }}
              placeholder={'[{"subjectId":"physics","chapterId":"phy-1","questionBn":"প্রশ্ন?","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]'}
              value={bulkJsonText}
              onChange={(e) => setBulkJsonText(e.target.value)}
            />
            <button type="button" className="ev-btn ev-btn-soft" style={{ width: '100%' }} onClick={handleBulkImport}>
              Import Bulk Questions
            </button>
          </div>

          <div className="ev-card">
            <h3 className="font-bn" style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              কাস্টম প্রশ্নসমূহ ({customQuestions.length}টি)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
              {customQuestions.map((cq) => (
                <div key={cq.id} style={{ padding: '0.6rem', background: 'var(--bg-surface-muted)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-bn" style={{ fontSize: '0.82rem', fontWeight: 700 }}>{cq.questionBn}</span>
                  <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => onDeleteCustomQuestion(cq.id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
