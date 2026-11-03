import React, { useEffect, useState } from 'react';
import { AcademicGroup, AppState, QuestionMCQ, QuizHistoryItem, QuizSession } from './types';
import {
  EXAM_CATEGORIES,
  SUBJECTS,
  QUESTIONS_MCQ,
  RECOMMENDED_PACKS,
  ACHIEVEMENTS
} from './data/syllabusData';
import { getDhakaDateStr, loadStoredState, saveStoredState, createFreshState } from './store/useExamStore';
import {
  supabase,
  syncUserProfileWithDatabase,
  pushProfileUpdateToCloud,
  submitServerQuizAttempt
} from './lib/supabase';
import { SubjectCard, AuthModal, QuizSection, CreativeQuestionsView } from './components/ModalsAndQuiz';
import {
  loadCustomQuestions,
  saveCustomQuestions,
  PastYearArchiveView,
  QuizBattleView,
  RapidFireView,
  SubjectLeaderboardView,
  AdminDashboardView
} from './components/ExtraFeatures';

type ExtendedViewName =
  | 'home'
  | 'exams'
  | 'archive'
  | 'battle'
  | 'rapid'
  | 'quiz'
  | 'cq'
  | 'stats'
  | 'leaderboard'
  | 'profile'
  | 'bookmarks'
  | 'mistakes'
  | 'settings'
  | 'admin';

export const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => loadStoredState());
  const [customQuestions, setCustomQuestions] = useState<QuestionMCQ[]>(() => loadCustomQuestions());
  const [view, setView] = useState<ExtendedViewName>('home');
  const [homeGroup, setHomeGroup] = useState<'all' | AcademicGroup>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('uni');
  const [examGroup, setExamGroup] = useState<'all' | AcademicGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState<QuizSession | null>(null);
  const [lastResult, setLastResult] = useState<QuizHistoryItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  /* Combined Question Pool (Admin Custom Questions + Built-in Verified Questions) */
  const allQuestions: QuestionMCQ[] = [...customQuestions, ...QUESTIONS_MCQ];

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    saveStoredState(state);
  }, [state]);

  useEffect(() => {
    saveCustomQuestions(customQuestions);
  }, [customQuestions]);

  /* Real-Time Supabase Auth Listener (Google, Facebook & Email) */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s?.user) {
        setAuthEmail(s.user.email || 'Verified User');
        syncUserProfileWithDatabase(s.user, state.user).then((merged) => {
          if (merged) {
            setState((prev) => ({ ...prev, user: { ...prev.user, ...merged } }));
          }
        });
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) {
        setAuthEmail(s.user.email || 'Verified User');
        syncUserProfileWithDatabase(s.user, state.user).then((merged) => {
          if (merged) {
            setState((prev) => ({ ...prev, user: { ...prev.user, ...merged } }));
          }
        });
      } else {
        setAuthEmail(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  /* Real-time Exam Countdown Timer */
  useEffect(() => {
    if (!session || session.isSubmitted || !state.settings.timerEnabled) return;
    const interval = window.setInterval(() => {
      const rem = Math.max(0, Math.ceil((session.deadlineMs - Date.now()) / 1000));
      setSession((prev) => (prev ? { ...prev, remainingSec: rem } : null));
      if (rem <= 0) {
        window.clearInterval(interval);
        handleSubmitQuiz();
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [session?.id, session?.isSubmitted]);

  const awardBonusXp = (bonusXp: number, reasonMsg?: string) => {
    if (bonusXp <= 0) return;
    const today = getDhakaDateStr();
    setState((prev) => {
      const newXp = prev.user.xp + bonusXp;
      const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);
      const updatedUser = {
        ...prev.user,
        xp: newXp,
        level: newLevel,
        xpForNextLevel: newLevel * 500,
        streakDays: prev.user.lastStudyDate !== today ? prev.user.streakDays + 1 : prev.user.streakDays,
        streakActive: true,
        lastStudyDate: today
      };
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) pushProfileUpdateToCloud(data.user, updatedUser);
      });
      return { ...prev, user: updatedUser };
    });
    if (reasonMsg) showToast(reasonMsg);
  };

  const startQuiz = (questions: QuestionMCQ[], title: string, mode: 'practice' | 'exam' = 'practice', isDaily = false) => {
    if (questions.length === 0) {
      showToast('এই অধ্যায়ে প্রশ্ন যুক্ত করতে Admin Panel ব্যবহার করুন!');
      return;
    }
    const now = Date.now();
    const dur = questions.length * (state.settings.defaultDurationPerQuestionSec || 45);
    setSession({
      id: 'quiz-' + now,
      title,
      categoryLabel: 'ExamVerse',
      categoryId: selectedCategory,
      primarySubjectId: questions[0].subjectId,
      mode,
      negativeMark: mode === 'exam' && state.settings.negativeMarkingEnabled ? 0.25 : 0,
      isDailyChallenge: isDaily,
      questions,
      currentIndex: 0,
      answers: {},
      revealed: {},
      startedAtMs: now,
      deadlineMs: now + dur * 1000,
      durationSec: dur,
      remainingSec: dur,
      isSubmitted: false
    });
    setView('quiz');
  };

  const handleSelectOption = (idx: number) => {
    if (!session || session.isSubmitted) return;
    const q = session.questions[session.currentIndex];
    if (session.mode === 'practice' && session.revealed[q.id]) return;

    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        answers: { ...prev.answers, [q.id]: idx },
        revealed: prev.mode === 'practice' ? { ...prev.revealed, [q.id]: true } : prev.revealed
      };
    });
  };

  const handleSubmitQuiz = () => {
    if (!session || session.isSubmitted) return;
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;
    const newMistakes = [...state.mistakes];

    session.questions.forEach((q) => {
      const ans = session.answers[q.id];
      if (ans === undefined) skipped++;
      else if (ans === q.correctIndex) correct++;
      else {
        incorrect++;
        if (!newMistakes.some((m) => m.questionId === q.id)) {
          newMistakes.unshift({
            questionId: q.id,
            selectedIndex: ans,
            timestamp: getDhakaDateStr(),
            retryCount: 1,
            note: q.explanation
          });
        }
      }
    });

    const attempted = correct + incorrect;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const scorePct = Math.round((correct / session.questions.length) * 100);
    const xpEarned = attempted > 0 ? correct * 20 + (accuracy >= 80 ? 35 : 0) : 0;
    const today = getDhakaDateStr();

    const resultItem: QuizHistoryItem = {
      id: session.id,
      title: session.title,
      category: session.categoryLabel,
      categoryId: session.categoryId,
      subjectId: session.primarySubjectId,
      mode: session.mode,
      score: correct,
      netScore: Math.max(0, Number((correct - incorrect * session.negativeMark).toFixed(2))),
      negativeMark: session.negativeMark,
      total: session.questions.length,
      attempted,
      incorrect,
      skipped,
      accuracy,
      scorePct,
      timeTakenSec: Math.max(1, Math.floor((Date.now() - session.startedAtMs) / 1000)),
      xpEarned,
      date: today,
      questionsSnapshot: session.questions,
      answersSnapshot: session.answers
    };

    setSession((prev) => (prev ? { ...prev, isSubmitted: true } : null));
    setLastResult(resultItem);

    setState((prev) => {
      const newXp = prev.user.xp + xpEarned;
      const newLevel = Math.max(1, Math.floor(newXp / 500) + 1);
      const prevSubj = prev.stats.subjectStats[session.primarySubjectId] || { attempted: 0, correct: 0 };
      const totSubjAtt = prevSubj.attempted + attempted;
      const totSubjCor = prevSubj.correct + correct;
      const newMastery = totSubjAtt > 0 ? Math.min(100, Math.round((totSubjCor / totSubjAtt) * 100)) : 0;

      const updatedUser = {
        ...prev.user,
        xp: newXp,
        level: newLevel,
        xpForNextLevel: newLevel * 500,
        streakDays: attempted > 0 && prev.user.lastStudyDate !== today ? prev.user.streakDays + 1 : prev.user.streakDays,
        streakActive: attempted > 0 ? true : prev.user.streakActive,
        lastStudyDate: attempted > 0 ? today : prev.user.lastStudyDate
      };

      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          pushProfileUpdateToCloud(data.user, updatedUser);
          submitServerQuizAttempt({
            title: session.title,
            categoryId: session.categoryId,
            subjectId: session.primarySubjectId,
            mode: session.mode,
            negativeMark: session.negativeMark,
            timeTakenSec: resultItem.timeTakenSec,
            questionIds: session.questions.map((q) => q.id),
            answers: session.answers,
            isDailyChallenge: session.isDailyChallenge
          });
        }
      });

      return {
        ...prev,
        user: updatedUser,
        stats: {
          ...prev.stats,
          totalQuestionsSeen: prev.stats.totalQuestionsSeen + session.questions.length,
          totalAttempted: prev.stats.totalAttempted + attempted,
          totalCorrect: prev.stats.totalCorrect + correct,
          totalIncorrect: prev.stats.totalIncorrect + incorrect,
          totalSkipped: prev.stats.totalSkipped + skipped,
          completedQuizzes: prev.stats.completedQuizzes + (attempted > 0 ? 1 : 0),
          subjectMastery: { ...prev.stats.subjectMastery, [session.primarySubjectId]: newMastery },
          subjectStats: { ...prev.stats.subjectStats, [session.primarySubjectId]: { attempted: totSubjAtt, correct: totSubjCor } }
        },
        mistakes: newMistakes,
        quizHistory: [resultItem, ...prev.quizHistory]
      };
    });
  };

  const xpPct = Math.min(100, Math.round((state.user.xp / state.user.xpForNextLevel) * 100));
  const filteredHomeSubjects = SUBJECTS.filter((s) => homeGroup === 'all' || s.group === homeGroup);

  return (
    <div className="ev-app-shell">
      {/* Desktop Sidebar */}
      <aside className="ev-sidebar">
        <button type="button" className="ev-brand" onClick={() => setView('home')}>
          <div className="ev-brand-mark">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>ExamVerse</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)' }}>SCIENCE • COMMERCE • ARTS</div>
          </div>
        </button>

        <div className="ev-nav-section-label">Core Platform</div>
        <ul className="ev-nav-list">
          {([
            ['home', '🏠 Home (হোম)'],
            ['exams', '📘 Syllabus & Exams (সিলেবাস)'],
            ['archive', '📚 বিগত বছরের প্রশ্ন (Archive)'],
            ['battle', '⚔️ ১-অন-১ কুইজ ব্যাটল (1v1)'],
            ['rapid', '⚡ ৬০-সেকেন্ড র‍্যাপিড ফায়ার'],
            ['quiz', '📝 Active Quiz (কুইজ)'],
            ['cq', '✍️ সৃজনশীল প্রশ্ন (CQ)'],
            ['leaderboard', '🏆 সাবজেক্ট লিডারবোর্ড'],
            ['profile', '👤 Profile & Login (প্রোফাইল)'],
            ['admin', '🛠️ Admin Panel (প্রশ্ন আপলোড)']
          ] as const).map(([key, label]) => (
            <li key={key}>
              <button
                type="button"
                className={`ev-nav-btn ${view === key ? 'is-active' : ''}`}
                onClick={() => setView(key)}
              >
                <span className="ev-nav-btn-left font-bn">{label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="button" className="ev-btn ev-btn-primary" style={{ width: '100%' }} onClick={() => setAuthModalOpen(true)}>
            {authEmail ? '✓ Cloud Connected' : 'Sign In / Create Account'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ev-main-wrapper">
        <header className="ev-topbar">
          <div>
            <div style={{ fontSize: '1.02rem', fontWeight: 800 }}>{state.user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{state.user.targetTrack}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <button type="button" className="ev-streak-pill" onClick={() => setView('profile')}>
              🔥 {state.user.streakDays}d Streak
            </button>
            <button
              type="button"
              className="ev-btn ev-btn-secondary ev-btn-sm"
              onClick={() => setState((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))}
            >
              {state.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button type="button" className="ev-btn ev-btn-primary ev-btn-sm" onClick={() => setAuthModalOpen(true)}>
              {authEmail ? '✓ Account' : 'Sign In'}
            </button>
          </div>
        </header>

        <main className="ev-content-area">
          {/* 1. HOME VIEW */}
          {view === 'home' && (
            <div>
              <div className="ev-home-top-grid">
                <div className="ev-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span className="ev-badge-pill ev-badge-indigo">🛡️ Level {state.user.level} Scholar</span>
                      <span className="ev-badge-pill ev-badge-violet">⚡ {state.user.xp.toLocaleString()} XP</span>
                    </div>
                    <h1 className="font-bn" style={{ fontSize: '1.38rem', fontWeight: 800 }}>
                      বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক—পূর্ণাঙ্গ প্রস্তুতি
                    </h1>
                  </div>
                  <div className="ev-xp-strip">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                      <span>Level {state.user.level} Progress</span>
                      <span className="font-mono" style={{ color: 'var(--brand-primary)' }}>
                        {state.user.xp} / {state.user.xpForNextLevel} XP ({xpPct}%)
                      </span>
                    </div>
                    <div className="ev-progress-track">
                      <div className="ev-progress-fill" style={{ width: `${xpPct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="ev-card" style={{ background: 'linear-gradient(145deg, var(--bg-surface) 0%, var(--brand-primary-soft) 100%)', borderColor: 'var(--brand-primary-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span className="ev-badge-pill ev-badge-warning" style={{ marginBottom: '0.4rem' }}>🔥 Daily Merit Challenge (+150 XP)</span>
                    <h2 className="font-bn" style={{ fontSize: '1.18rem', fontWeight: 800 }}>ডেইলি মেরিট স্প্রিন্ট (৮টি বাছাইকৃত MCQ)</h2>
                  </div>
                  <button
                    type="button"
                    className="ev-btn ev-btn-primary"
                    onClick={() => startQuiz(allQuestions.slice(0, 8), 'Daily Merit Challenge', 'practice', true)}
                  >
                    Start Daily Challenge →
                  </button>
                </div>
              </div>

              {/* Quick Launch Bar for New Competitive Modes (Archive, 1v1 Battle, 60s Rapid Fire) */}
              <div className="ev-grid-3" style={{ marginBottom: '1.65rem' }}>
                <div className="ev-card" style={{ borderLeft: '4px solid #4F46E5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <span className="ev-badge-pill ev-badge-indigo">Question Bank</span>
                    <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.3rem' }}>📚 বিগত বছরের প্রশ্ন ব্যাংক</h3>
                    <div className="font-bn" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ঢাবি, বুয়েট, মেডিকেল, বিসিএস ও বোর্ড প্রশ্ন</div>
                  </div>
                  <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={() => setView('archive')}>আর্কাইভ দেখুন →</button>
                </div>

                <div className="ev-card" style={{ borderLeft: '4px solid #7C3AED', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <span className="ev-badge-pill ev-badge-violet">1v1 Multiplayer</span>
                    <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.3rem' }}>⚔️ ১-অন-১ কুইজ ব্যাটল</h3>
                    <div className="font-bn" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>বন্ধুর সাথে রুম কোড দিয়ে সরাসরি কুইজ ম্যাচ</div>
                  </div>
                  <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={() => setView('battle')}>ব্যাটল শুরু করুন →</button>
                </div>

                <div className="ev-card" style={{ borderLeft: '4px solid #D97706', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    <span className="ev-badge-pill ev-badge-warning">Speed Mode</span>
                    <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.3rem' }}>⚡ ৬০-সেকেন্ড র‍্যাপিড ফায়ার</h3>
                    <div className="font-bn" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>৬০ সেকেন্ডে সর্বোচ্চ সঠিক উত্তরের রেকর্ড গড়ুন</div>
                  </div>
                  <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={() => setView('rapid')}>স্প্রিন্ট খেলুন →</button>
                </div>
              </div>

              {/* Group-wise Subject Explorer */}
              <div style={{ marginBottom: '1.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <h2 className="font-bn" style={{ fontSize: '1.12rem', fontWeight: 800 }}>বিভাগ অনুযায়ী বিষয়সমূহ (১৭টি পূর্ণাঙ্গ বিষয়)</h2>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {([
                      ['all', 'সকল বিষয় (17)'],
                      ['Science', 'বিজ্ঞান বিভাগ (Science — 4)'],
                      ['Commerce', 'ব্যবসায় শিক্ষা (Commerce — 4)'],
                      ['Arts', 'মানবিক বিভাগ (Arts — 5)'],
                      ['Common', 'আবশ্যিক ও সাধারণ (4)']
                    ] as const).map(([gId, gLabel]) => (
                      <button
                        key={gId}
                        type="button"
                        className={`ev-btn ev-btn-sm ${homeGroup === gId ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                        onClick={() => setHomeGroup(gId)}
                      >
                        {gLabel}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ev-grid-4">
                  {filteredHomeSubjects.map((subj) => (
                    <SubjectCard
                      key={subj.id}
                      subject={subj}
                      mastery={state.stats.subjectMastery[subj.id] || 0}
                      onStart={(sId) =>
                        startQuiz(
                          allQuestions.filter((q) => q.subjectId === sId),
                          `${subj.name} Practice`
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Curated Model Packs */}
              <div>
                <h2 className="font-bn" style={{ fontSize: '1.12rem', fontWeight: 800, marginBottom: '0.85rem' }}>বিভাগভিত্তিক মডেল টেস্ট (Model Sets)</h2>
                <div className="ev-grid-3">
                  {RECOMMENDED_PACKS.slice(1).map((pack) => (
                    <div key={pack.id} className="ev-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
                      <div>
                        <span className="ev-badge-pill ev-badge-indigo" style={{ marginBottom: '0.4rem' }}>{pack.badgeText}</span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{pack.title}</h3>
                        <div className="font-bn" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{pack.subtitle}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="ev-btn ev-btn-primary ev-btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => startQuiz(allQuestions.filter((q) => pack.questionIds.includes(q.id)), pack.title, 'practice')}
                        >
                          Practice
                        </button>
                        <button
                          type="button"
                          className="ev-btn ev-btn-secondary ev-btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => startQuiz(allQuestions.filter((q) => pack.questionIds.includes(q.id)), pack.title, 'exam')}
                        >
                          Exam Mode
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. EXAMS & SYLLABUS VIEW */}
          {view === 'exams' && (
            <div>
              <div className="ev-grid-3" style={{ marginBottom: '1.25rem' }}>
                {EXAM_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className="ev-card"
                    style={{
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderColor: selectedCategory === cat.id ? 'var(--brand-primary)' : 'var(--border-subtle)',
                      background: selectedCategory === cat.id ? 'var(--brand-primary-soft)' : 'var(--bg-surface)'
                    }}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.96rem' }}>{cat.name}</strong>
                      <span className="ev-badge-pill ev-badge-neutral">{cat.badge}</span>
                    </div>
                    <div className="font-bn" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat.nameBn}</div>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {(['all', 'Science', 'Commerce', 'Arts', 'Common'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`ev-btn ev-btn-sm ${examGroup === g ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                    onClick={() => setExamGroup(g)}
                  >
                    {g === 'all' ? 'All Groups (সকল বিভাগ)' : g}
                  </button>
                ))}
                <input
                  type="text"
                  className="ev-input"
                  style={{ maxWidth: '280px' }}
                  placeholder="অধ্যায় বা বিষয় খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {SUBJECTS.filter((s) => (examGroup === 'all' || s.group === examGroup) && (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nameBn.includes(searchQuery))).map((subj) => (
                <div key={subj.id} className="ev-card" style={{ marginBottom: '1rem', borderLeft: `4px solid ${subj.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span className="ev-badge-pill" style={{ background: subj.bgSoft, color: subj.color, marginBottom: '0.25rem' }}>{subj.tagBn}</span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{subj.name} — <span className="font-bn">{subj.nameBn}</span></h3>
                    </div>
                    <button
                      type="button"
                      className="ev-btn ev-btn-primary ev-btn-sm"
                      onClick={() => startQuiz(allQuestions.filter((q) => q.subjectId === subj.id), subj.name, 'exam')}
                    >
                      Full Subject Exam
                    </button>
                  </div>
                  <div className="ev-grid-2">
                    {subj.chapters.map((ch) => {
                      const chCount = allQuestions.filter((q) => q.chapterId === ch.id).length;
                      return (
                        <div key={ch.id} style={{ padding: '0.8rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{ch.title}</div>
                            <div className="font-bn" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              {ch.titleBn} • {chCount} MCQ
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              type="button"
                              className="ev-btn ev-btn-soft ev-btn-sm"
                              onClick={() => startQuiz(allQuestions.filter((q) => q.chapterId === ch.id), ch.title, 'practice')}
                            >
                              Practice
                            </button>
                            <button
                              type="button"
                              className="ev-btn ev-btn-primary ev-btn-sm"
                              onClick={() => startQuiz(allQuestions.filter((q) => q.chapterId === ch.id), ch.title, 'exam')}
                            >
                              Exam
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. FEATURE 1: PAST YEAR ARCHIVE VIEW */}
          {view === 'archive' && (
            <PastYearArchiveView
              allQuestions={allQuestions}
              onStartPaper={(qs, title, mode) => startQuiz(qs, title, mode)}
            />
          )}

          {/* 4. FEATURE 3: 1v1 QUIZ BATTLE VIEW */}
          {view === 'battle' && (
            <QuizBattleView
              allQuestions={allQuestions}
              userName={state.user.name}
              onAwardBattleXp={(xp) => awardBonusXp(xp, `⚔️ ব্যাটল বোনাস +${xp} XP অর্জিত!`)}
            />
          )}

          {/* 5. FEATURE 11: 60-SECOND RAPID FIRE VIEW */}
          {view === 'rapid' && (
            <RapidFireView
              allQuestions={allQuestions}
              onAwardSprintXp={(xp) => awardBonusXp(xp, `⚡ র‍্যাপিড ফায়ার +${xp} XP যুক্ত হয়েছে!`)}
            />
          )}

          {/* 6. QUIZ VIEW */}
          {view === 'quiz' && (
            <QuizSection
              session={session}
              lastResult={lastResult}
              bookmarks={state.bookmarks}
              onSelectOption={handleSelectOption}
              onNavigateQuestion={(idx) => setSession((s) => (s ? { ...s, currentIndex: idx } : null))}
              onSubmitQuiz={handleSubmitQuiz}
              onToggleBookmark={(qId) =>
                setState((s) => ({
                  ...s,
                  bookmarks: s.bookmarks.includes(qId) ? s.bookmarks.filter((id) => id !== qId) : [qId, ...s.bookmarks]
                }))
              }
              onStartNewQuiz={() => startQuiz(allQuestions.slice(0, 8), 'Quick Practice Set')}
            />
          )}

          {/* 7. CREATIVE QUESTIONS (CQ) VIEW */}
          {view === 'cq' && <CreativeQuestionsView />}

          {/* 8. FEATURE 14: SUBJECT-WISE LEADERBOARD VIEW */}
          {view === 'leaderboard' && <SubjectLeaderboardView state={state} />}

          {/* 9. FEATURE 15: ADMIN PANEL & BULK UPLOADER VIEW */}
          {view === 'admin' && (
            <AdminDashboardView
              customQuestions={customQuestions}
              onAddQuestions={(newQs) => setCustomQuestions((prev) => [...newQs, ...prev])}
              onDeleteCustomQuestion={(id) => setCustomQuestions((prev) => prev.filter((q) => q.id !== id))}
              showToast={showToast}
            />
          )}

          {/* 10. PROFILE & GOOGLE/FACEBOOK LOGIN VIEW */}
          {(view === 'profile' || view === 'stats' || view === 'bookmarks' || view === 'mistakes' || view === 'settings') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="ev-card" style={{ border: '1.5px solid var(--brand-primary-border)', background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--brand-primary-soft) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className={`ev-badge-pill ${authEmail ? 'ev-badge-success' : 'ev-badge-indigo'}`} style={{ marginBottom: '0.35rem' }}>
                    {authEmail ? `✓ Signed In (${authEmail})` : 'Cloud Account & Real-Time Sync'}
                  </span>
                  <h2 className="font-bn" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {authEmail ? 'আপনার প্রোফাইল রিয়েল-টাইম ডাটাবেসে সংযুক্ত আছে' : 'Google, Facebook অথবা Email দিয়ে লগইন করুন'}
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                  <button type="button" className="ev-btn ev-btn-primary" onClick={() => setAuthModalOpen(true)}>
                    {authEmail ? 'Manage Account' : 'Sign In / Create Account'}
                  </button>
                  <button type="button" className="ev-btn ev-btn-soft" onClick={() => setView('admin')}>
                    🛠️ Open Admin Panel
                  </button>
                  <button
                    type="button"
                    className="ev-btn ev-btn-danger"
                    onClick={() => {
                      setState(createFreshState());
                      showToast('Progress reset to 0');
                    }}
                  >
                    Reset Progress
                  </button>
                </div>
              </div>

              <div className="ev-grid-4">
                <div className="ev-card">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total XP &amp; Level</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{state.user.xp} XP (Lv.{state.user.level})</div>
                </div>
                <div className="ev-card">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Attempted MCQs</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800 }}>{state.stats.totalAttempted}</div>
                </div>
                <div className="ev-card">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Correct Answers</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-success)' }}>{state.stats.totalCorrect}</div>
                </div>
                <div className="ev-card">
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Completed Quizzes</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800 }}>{state.stats.completedQuizzes}</div>
                </div>
              </div>

              <div className="ev-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.85rem' }}>🏅 Achievement Badges</h3>
                <div className="ev-grid-2">
                  {ACHIEVEMENTS.map((ach) => (
                    <div key={ach.id} style={{ padding: '0.85rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{ach.title} — <span className="font-bn">{ach.titleBn}</span></div>
                        <div className="font-bn" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ach.description}</div>
                      </div>
                      <span className="ev-badge-pill ev-badge-warning">+{ach.xpBonus} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="ev-bottom-nav">
        {([
          ['home', 'Home'],
          ['archive', 'Archive'],
          ['battle', '1v1 Battle'],
          ['leaderboard', 'Ranks'],
          ['profile', 'Profile']
        ] as const).map(([k, lbl]) => (
          <button
            key={k}
            type="button"
            className={`ev-bottom-nav-btn ${view === k ? 'is-active' : ''}`}
            onClick={() => setView(k)}
          >
            <span>{lbl}</span>
          </button>
        ))}
      </nav>

      {/* Google / Facebook / Email Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        authEmail={authEmail}
        onSignOut={async () => {
          await supabase.auth.signOut();
          setAuthEmail(null);
          showToast('Signed out');
        }}
        showToast={showToast}
      />

      {/* Toast Pill */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '4.8rem', left: '50%', transform: 'translateX(-50%)', zIndex: 99, background: 'var(--text-primary)', color: 'var(--bg-surface)', padding: '0.65rem 1.2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', boxShadow: 'var(--shadow-lg)' }}>
          {toast}
        </div>
      )}
    </div>
  );
};
