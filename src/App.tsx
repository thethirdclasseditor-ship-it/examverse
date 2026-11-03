import React, { useEffect, useRef, useState } from 'react';
import { AcademicGroup, AppState, QuestionMCQ, QuizHistoryItem, QuizSession, ViewName } from './types';
import {
  EXAM_CATEGORIES,
  SUBJECTS,
  QUESTIONS_MCQ,
  RECOMMENDED_PACKS,
  ACHIEVEMENTS
} from './data/syllabusData';
import {
  getDhakaDateStr,
  loadStoredState,
  saveStoredState,
  createFreshState,
  getLevelProgress,
  resolveNegativeMark,
  getDailyChallengeQuestions,
  prepareQuizQuestions,
  gradeAndApplyQuizSession
} from './store/useExamStore';
import {
  supabase,
  syncFullAccountStateFromCloud,
  pushFullStateToCloud,
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

export const App: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [state, setState] = useState<AppState>(() => loadStoredState(null));
  const [customQuestions, setCustomQuestions] = useState<QuestionMCQ[]>(() => loadCustomQuestions());
  const [view, setView] = useState<ViewName>('home');
  const [homeGroup, setHomeGroup] = useState<'all' | AcademicGroup>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('uni');
  const [examGroup, setExamGroup] = useState<'all' | AcademicGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [session, setSession] = useState<QuizSession | null>(() => state.activeSession || null);
  const [lastResult, setLastResult] = useState<QuizHistoryItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  /* Profile Edit Form State (Section 3.2) */
  const [editName, setEditName] = useState(state.user.name);
  const [editHandle, setEditHandle] = useState(state.user.username);
  const [editTrack, setEditTrack] = useState(state.user.targetTrack);
  const [backupJsonInput, setBackupJsonInput] = useState('');

  /* BUG-01 FIX: Keep Latest Session & Submit Callback in Refs so Timer Never Reads Stale Answers */
  const sessionRef = useRef<QuizSession | null>(session);
  sessionRef.current = session;
  const submitQuizRef = useRef<() => void>(() => {});

  const allQuestions: QuestionMCQ[] = [...customQuestions, ...QUESTIONS_MCQ];

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  /* BUG-06 FIX: Save State Scoped to Current Authenticated User ID (or Guest) & Auto-Save Active Exam */
  useEffect(() => {
    const withActive: AppState = {
      ...state,
      activeSession: session && !session.isSubmitted ? session : null
    };
    saveStoredState(withActive, currentUserId);
  }, [state, session, currentUserId]);

  useEffect(() => {
    saveCustomQuestions(customQuestions);
  }, [customQuestions]);

  /* BUG-06 FIX: Per-Account State Isolation & Full Cloud Restore on Sign In / Clear on Sign Out */
  useEffect(() => {
    const handleAuthSession = async (authUser: any) => {
      if (authUser?.id) {
        setCurrentUserId(authUser.id);
        setAuthEmail(authUser.email || 'Verified User');
        const userLocal = loadStoredState(authUser.id);
        const cloudMerged = await syncFullAccountStateFromCloud(authUser, userLocal);
        const nextState: AppState = cloudMerged
          ? {
              ...userLocal,
              ...cloudMerged,
              user: { ...userLocal.user, ...(cloudMerged.user || {}) },
              stats: { ...userLocal.stats, ...(cloudMerged.stats || {}) },
              settings: { ...userLocal.settings, ...(cloudMerged.settings || {}) }
            }
          : userLocal;
        setState(nextState);
        setEditName(nextState.user.name);
        setEditHandle(nextState.user.username);
        setEditTrack(nextState.user.targetTrack);
      } else {
        setCurrentUserId(null);
        setAuthEmail(null);
        const guestState = loadStoredState(null);
        setState(guestState);
      }
    };

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      handleAuthSession(s?.user || null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      handleAuthSession(s?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  /* BUG-02 & Section 3.3 FIX: Start Quiz with Category-Aware Negative Marking & Shuffling */
  const startQuiz = (
    pool: QuestionMCQ[],
    title: string,
    mode: 'practice' | 'exam' = 'practice',
    isDaily = false,
    categoryId = selectedCategory,
    explicitNegativeMark?: number
  ) => {
    const prepared = prepareQuizQuestions(pool, isDaily ? 8 : undefined, !isDaily);
    if (prepared.length === 0) {
      showToast('এই ফিল্টারে কোনো প্রশ্ন পাওয়া যায়নি।');
      return;
    }
    const now = Date.now();
    const dur = prepared.length * (state.settings.defaultDurationPerQuestionSec || 45);
    const negMark = resolveNegativeMark(
      mode,
      categoryId,
      state.settings.negativeMarkingEnabled,
      explicitNegativeMark
    );

    const newSess: QuizSession = {
      id: 'quiz-' + now,
      title,
      categoryLabel: categoryId.toUpperCase(),
      categoryId,
      primarySubjectId: prepared[0].subjectId,
      mode,
      negativeMark: negMark,
      isDailyChallenge: isDaily,
      questions: prepared,
      currentIndex: 0,
      answers: {},
      revealed: {},
      markedForReview: {},
      startedAtMs: now,
      deadlineMs: now + dur * 1000,
      durationSec: dur,
      remainingSec: dur,
      isSubmitted: false
    };
    setSession(newSess);
    setView('quiz');
  };

  /* BUG-01, BUG-04, BUG-08, BUG-09, BUG-10, BUG-11 FIX: Authoritative Grading & Multi-Subject Mastery */
  const handleSubmitQuiz = () => {
    const activeSess = sessionRef.current;
    if (!activeSess || activeSess.isSubmitted) return;

    const { nextState, resultItem, newlyUnlockedBadges } = gradeAndApplyQuizSession(state, activeSess);
    setSession({ ...activeSess, isSubmitted: true });
    setLastResult(resultItem);
    setState(nextState);

    if (newlyUnlockedBadges.length > 0) {
      showToast(`🏅 নতুন ব্যাজ আনলক হয়েছে: ${newlyUnlockedBadges.join(', ')}!`);
    }

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        pushFullStateToCloud(data.user, nextState);
        submitServerQuizAttempt({
          title: activeSess.title,
          categoryId: activeSess.categoryId,
          subjectId: activeSess.primarySubjectId,
          mode: activeSess.mode,
          negativeMark: activeSess.negativeMark,
          timeTakenSec: resultItem.timeTakenSec,
          questionIds: activeSess.questions.map((q) => q.id),
          answers: activeSess.answers,
          isDailyChallenge: activeSess.isDailyChallenge
        });
      }
    });
  };

  submitQuizRef.current = handleSubmitQuiz;

  /* BUG-01 FIX: Timer Interval Always Calls submitQuizRef.current() with Latest Answers */
  useEffect(() => {
    if (!session || session.isSubmitted || !state.settings.timerEnabled) return;
    const interval = window.setInterval(() => {
      const curr = sessionRef.current;
      if (!curr || curr.isSubmitted) {
        window.clearInterval(interval);
        return;
      }
      const rem = Math.max(0, Math.ceil((curr.deadlineMs - Date.now()) / 1000));
      setSession((prev) => (prev ? { ...prev, remainingSec: rem } : null));
      if (rem <= 0) {
        window.clearInterval(interval);
        submitQuizRef.current();
      }
    }, 500);
    return () => window.clearInterval(interval);
  }, [session?.id, session?.isSubmitted, state.settings.timerEnabled]);

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

  const handleToggleMarkForReview = (qId: string) => {
    setSession((prev) => {
      if (!prev) return null;
      const prevMap = prev.markedForReview || {};
      return {
        ...prev,
        markedForReview: { ...prevMap, [qId]: !prevMap[qId] }
      };
    });
  };

  const lvInfo = getLevelProgress(state.user.xp);
  const filteredHomeSubjects = SUBJECTS.filter((s) => homeGroup === 'all' || s.group === homeGroup);
  const activeCatObj = EXAM_CATEGORIES.find((c) => c.id === selectedCategory) || EXAM_CATEGORIES[0];
  const dailyQuestions = getDailyChallengeQuestions(allQuestions, state.dailyChallenge.date);
  const overallAccuracy =
    state.stats.totalAttempted > 0
      ? Math.round((state.stats.totalCorrect / state.stats.totalAttempted) * 100)
      : 0;

  /* BUG-05 FIX: Show Admin Panel nav item only if user is Admin */
  const navItems: [ViewName, string][] = [
    ['home', '🏠 Home (হোম)'],
    ['exams', '📘 Syllabus & Exams (সিলেবাস)'],
    ['archive', '📚 বিগত বছরের প্রশ্ন (Archive)'],
    ['battle', '⚔️ ১-অন-১ কুইজ ব্যাটল'],
    ['rapid', '⚡ ৬০-সেকেন্ড র‍্যাপিড ফায়ার'],
    ['quiz', '📝 Active Quiz (কুইজ)'],
    ['cq', '✍️ সৃজনশীল প্রশ্ন (CQ)'],
    ['leaderboard', '🏆 সাবজেক্ট লিডারবোর্ড'],
    ['stats', '📊 Statistics (পরিসংখ্যান)'],
    ['bookmarks', `🔖 Bookmarks (${state.bookmarks.length})`],
    ['mistakes', `⚠️ Mistake Bank (${state.mistakes.filter((m) => m.status !== 'Resolved').length})`],
    ['history', `🕒 Quiz History (${state.quizHistory.length})`],
    ['profile', '👤 Profile (প্রোফাইল)'],
    ['settings', '⚙️ Settings (সেটিংস)']
  ];
  if (state.user.isAdmin) {
    navItems.push(['admin', '🛠️ Admin Panel']);
  }

  return (
    <div className="ev-app-shell">
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

        <ul className="ev-nav-list">
          {navItems.map(([key, label]) => (
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

      <div className="ev-main-wrapper">
        <header className="ev-topbar">
          <div>
            <div style={{ fontSize: '1.02rem', fontWeight: 800 }}>{state.user.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{state.user.targetTrack}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <button type="button" className="ev-streak-pill" onClick={() => setView('stats')}>
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
              {session && !session.isSubmitted && (
                <div className="ev-card" style={{ marginBottom: '1.15rem', border: '1.5px solid var(--brand-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <span className="ev-badge-pill ev-badge-indigo">Exam In Progress</span>
                    <div style={{ fontWeight: 800, marginTop: '0.2rem' }}>
                      {session.title} ({Object.keys(session.answers).length}/{session.questions.length} Answered)
                    </div>
                  </div>
                  <button type="button" className="ev-btn ev-btn-primary ev-btn-sm" onClick={() => setView('quiz')}>
                    Resume Interrupted Exam →
                  </button>
                </div>
              )}

              <div className="ev-home-top-grid">
                <div className="ev-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <span className="ev-badge-pill ev-badge-indigo">🛡️ Level {lvInfo.level} Scholar</span>
                      <span className="ev-badge-pill ev-badge-violet">⚡ {state.user.xp.toLocaleString()} Total XP</span>
                    </div>
                    <h1 className="font-bn" style={{ fontSize: '1.38rem', fontWeight: 800 }}>
                      বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক—পূর্ণাঙ্গ প্রস্তুতি
                    </h1>
                  </div>
                  {/* BUG-09 FIX: Shows Current Level Bracket Progress */}
                  <div className="ev-xp-strip">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                      <span>Level {lvInfo.level} Progress</span>
                      <span className="font-mono" style={{ color: 'var(--brand-primary)' }}>
                        {lvInfo.currentLevelXp} / {lvInfo.neededForLevel} XP ({lvInfo.progressPct}%)
                      </span>
                    </div>
                    <div className="ev-progress-track">
                      <div className="ev-progress-fill" style={{ width: `${lvInfo.progressPct}%` }} />
                    </div>
                  </div>
                </div>

                {/* BUG-04 FIX: Date-Seeded Daily Challenge */}
                <div className="ev-card" style={{ background: 'linear-gradient(145deg, var(--bg-surface) 0%, var(--brand-primary-soft) 100%)', borderColor: 'var(--brand-primary-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span className="ev-badge-pill ev-badge-warning">🔥 Daily Challenge ({state.dailyChallenge.date})</span>
                      <span className="ev-badge-pill ev-badge-success">
                        {state.dailyChallenge.isCompleted ? '✓ Claimed Today' : `+${state.dailyChallenge.rewardXp} XP`}
                      </span>
                    </div>
                    <h2 className="font-bn" style={{ fontSize: '1.15rem', fontWeight: 800 }}>আজকের ডেইলি মেরিট স্প্রিন্ট ({state.dailyChallenge.completedQuestions}/8 সম্পন্ন)</h2>
                  </div>
                  <button
                    type="button"
                    className="ev-btn ev-btn-primary"
                    onClick={() => startQuiz(dailyQuestions, `Daily Merit Challenge (${state.dailyChallenge.date})`, 'practice', true)}
                  >
                    {state.dailyChallenge.isCompleted ? 'Practice Daily Set Again' : 'Start Today’s Challenge →'}
                  </button>
                </div>
              </div>

              <div className="ev-grid-3" style={{ marginBottom: '1.65rem' }}>
                <div className="ev-card" style={{ borderLeft: '4px solid #4F46E5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.7rem' }}>
                  <div>
                    <span className="ev-badge-pill ev-badge-indigo">Past Papers</span>
                    <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.3rem' }}>📚 বিগত বছরের প্রশ্ন ব্যাংক</h3>
                  </div>
                  <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={() => setView('archive')}>আর্কাইভ দেখুন →</button>
                </div>
                <div className="ev-card" style={{ borderLeft: '4px solid #7C3AED', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.7rem' }}>
                  <div>
                    <span className="ev-badge-pill ev-badge-violet">1v1 &amp; Bot Arena</span>
                    <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.3rem' }}>⚔️ ১-অন-১ কুইজ ব্যাটল</h3>
                  </div>
                  <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={() => setView('battle')}>ব্যাটল শুরু করুন →</button>
                </div>
                <div className="ev-card" style={{ borderLeft: '4px solid #D97706', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.7rem' }}>
                  <div>
                    <span className="ev-badge-pill ev-badge-warning">60s Speed Mode</span>
                    <h3 className="font-bn" style={{ fontSize: '1.05rem', fontWeight: 800, marginTop: '0.3rem' }}>⚡ ৬০-সেকেন্ড র‍্যাপিড ফায়ার</h3>
                  </div>
                  <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={() => setView('rapid')}>স্প্রিন্ট খেলুন →</button>
                </div>
              </div>

              <div style={{ marginBottom: '1.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <h2 className="font-bn" style={{ fontSize: '1.12rem', fontWeight: 800 }}>বিভাগ অনুযায়ী বিষয়সমূহ (১৭টি বিষয়)</h2>
                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                    {([
                      ['all', 'সকল বিষয় (17)'],
                      ['Science', 'বিজ্ঞান বিভাগ (4)'],
                      ['Commerce', 'ব্যবসায় শিক্ষা (4)'],
                      ['Arts', 'মানবিক বিভাগ (5)'],
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
                      customCount={allQuestions.filter((q) => q.subjectId === subj.id).length}
                      onStart={(sId) =>
                        startQuiz(
                          allQuestions.filter((q) => q.subjectId === sId),
                          `${subj.name} Practice`,
                          'practice',
                          false,
                          selectedCategory
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. EXAMS VIEW (BUG-03 & BUG-12 Fixed: Strict Category->Subject->Chapter->Question Filter & Deep Chapter Search) */}
          {view === 'exams' && (
            <div>
              <div className="ev-grid-3" style={{ marginBottom: '1.15rem' }}>
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
                      <span className="ev-badge-pill ev-badge-neutral">Neg: -{cat.defaultNegativeMark}</span>
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
                  style={{ maxWidth: '310px' }}
                  placeholder="অধ্যায় বা বিষয় খুঁজুন (Chapter or Subject)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {SUBJECTS.filter((s) => {
                /* BUG-03 FIX: Filter subjects by active ExamCategory.subjects */
                if (!activeCatObj.subjects.includes(s.id)) return false;
                if (examGroup !== 'all' && s.group !== examGroup) return false;
                if (!searchQuery.trim()) return true;
                const qLow = searchQuery.toLowerCase();
                /* BUG-12 FIX: Match Subject Name OR any Chapter Title inside the Subject */
                const subjMatch = s.name.toLowerCase().includes(qLow) || s.nameBn.includes(searchQuery);
                const chMatch = s.chapters.some(
                  (ch) => ch.title.toLowerCase().includes(qLow) || ch.titleBn.includes(searchQuery)
                );
                return subjMatch || chMatch;
              }).map((subj) => {
                const qLow = searchQuery.toLowerCase();
                const subjNameMatch = subj.name.toLowerCase().includes(qLow) || subj.nameBn.includes(searchQuery);
                const visibleChapters =
                  !searchQuery.trim() || subjNameMatch
                    ? subj.chapters
                    : subj.chapters.filter(
                        (ch) => ch.title.toLowerCase().includes(qLow) || ch.titleBn.includes(searchQuery)
                      );

                /* BUG-03 FIX: Filter questions by both subject AND selectedCategory */
                const subjCatQuestions = allQuestions.filter(
                  (q) => q.subjectId === subj.id && q.categories.includes(selectedCategory)
                );

                return (
                  <div key={subj.id} className="ev-card" style={{ marginBottom: '1rem', borderLeft: `4px solid ${subj.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <span className="ev-badge-pill" style={{ background: subj.bgSoft, color: subj.color, marginBottom: '0.25rem' }}>
                          {subj.tagBn} • {activeCatObj.name}
                        </span>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                          {subj.name} — <span className="font-bn">{subj.nameBn}</span>
                        </h3>
                      </div>
                      <button
                        type="button"
                        className="ev-btn ev-btn-primary ev-btn-sm"
                        onClick={() =>
                          startQuiz(
                            subjCatQuestions.length > 0 ? subjCatQuestions : allQuestions.filter((q) => q.subjectId === subj.id),
                            `${activeCatObj.name} — ${subj.name}`,
                            'exam',
                            false,
                            selectedCategory
                          )
                        }
                      >
                        Full Subject Exam (Neg: -{activeCatObj.defaultNegativeMark})
                      </button>
                    </div>
                    <div className="ev-grid-2">
                      {visibleChapters.map((ch) => {
                        const chQs = allQuestions.filter((q) => q.chapterId === ch.id);
                        return (
                          <div key={ch.id} style={{ padding: '0.8rem', background: 'var(--bg-surface-muted)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{ch.paper}: {ch.title}</div>
                              <div className="font-bn" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                {ch.titleBn} • {chQs.length} MCQ
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button
                                type="button"
                                className="ev-btn ev-btn-soft ev-btn-sm"
                                onClick={() => startQuiz(chQs, ch.title, 'practice', false, selectedCategory)}
                              >
                                Practice
                              </button>
                              <button
                                type="button"
                                className="ev-btn ev-btn-primary ev-btn-sm"
                                onClick={() => startQuiz(chQs, ch.title, 'exam', false, selectedCategory)}
                              >
                                Exam
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. PAST YEAR ARCHIVE */}
          {view === 'archive' && (
            <PastYearArchiveView
              allQuestions={allQuestions}
              onStartPaper={(qs, title, mode, catId, negMark) => startQuiz(qs, title, mode, false, catId, negMark)}
            />
          )}

          {/* 4. 1v1 QUIZ BATTLE */}
          {view === 'battle' && (
            <QuizBattleView
              allQuestions={allQuestions}
              userName={state.user.name}
              onAwardBattleXp={(xp) => {
                setState((s) => ({ ...s, user: { ...s.user, xp: s.user.xp + xp } }));
                showToast(`⚔️ +${xp} XP অর্জিত!`);
              }}
            />
          )}

          {/* 5. 60-SECOND RAPID FIRE */}
          {view === 'rapid' && (
            <RapidFireView
              allQuestions={allQuestions}
              onAwardSprintXp={(xp) => {
                setState((s) => ({ ...s, user: { ...s.user, xp: s.user.xp + xp } }));
                showToast(`⚡ +${xp} XP যুক্ত হয়েছে!`);
              }}
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
              onToggleMarkForReview={handleToggleMarkForReview}
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

          {/* 7. CREATIVE QUESTIONS (CQ) */}
          {view === 'cq' && (
            <CreativeQuestionsView
              cqScores={state.cqScores}
              onSaveCqProgress={(cqId, marks, userAnswer) => {
                const today = getDhakaDateStr();
                setState((prev) => ({
                  ...prev,
                  user: { ...prev.user, xp: prev.user.xp + marks * 3 },
                  cqScores: { ...prev.cqScores, [cqId]: { marks, date: today, userAnswer } }
                }));
                showToast(`সৃজনশীল মূল্যায়ন (${marks}/10) সংরক্ষিত হয়েছে!`);
              }}
            />
          )}

          {/* 8. SUBJECT-WISE LEADERBOARD */}
          {view === 'leaderboard' && <SubjectLeaderboardView state={state} />}

          {/* 9. DEDICATED STATISTICS VIEW (Section 3.2) */}
          {view === 'stats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h1 style={{ fontSize: '1.38rem', fontWeight: 800 }}>📊 Detailed Learning Analytics</h1>
              <div className="ev-grid-4">
                <div className="ev-card"><div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Overall Accuracy</div><div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--status-success)' }}>{overallAccuracy}%</div></div>
                <div className="ev-card"><div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Attempted / Skipped</div><div style={{ fontSize: '1.45rem', fontWeight: 800 }}>{state.stats.totalAttempted} / {state.stats.totalSkipped}</div></div>
                <div className="ev-card"><div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Correct / Wrong</div><div style={{ fontSize: '1.45rem', fontWeight: 800 }}>{state.stats.totalCorrect} / {state.stats.totalIncorrect}</div></div>
                <div className="ev-card"><div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Mistakes Resolved</div><div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{state.stats.totalMistakesResolved}</div></div>
              </div>

              <div className="ev-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>Rolling 7-Day Study Activity (Asia/Dhaka)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                  {state.stats.weeklyActivity.map((d) => (
                    <div key={d.dateKey} style={{ padding: '0.65rem', background: 'var(--bg-surface-muted)', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{d.day}</div>
                      <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--brand-primary)' }}>{d.attempted} Q</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{d.xp} XP</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 10. DEDICATED BOOKMARKS VIEW */}
          {view === 'bookmarks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>🔖 Saved Bookmarks ({state.bookmarks.length})</h1>
                {state.bookmarks.length > 0 && (
                  <button
                    type="button"
                    className="ev-btn ev-btn-primary ev-btn-sm"
                    onClick={() => startQuiz(allQuestions.filter((q) => state.bookmarks.includes(q.id)), 'Saved Bookmarks Practice')}
                  >
                    Practice Saved Questions
                  </button>
                )}
              </div>
              {state.bookmarks.length === 0 ? (
                <div className="ev-card">কোনো প্রশ্ন এখনো বুকমার্ক করা হয়নি।</div>
              ) : (
                allQuestions
                  .filter((q) => state.bookmarks.includes(q.id))
                  .map((q) => (
                    <div key={q.id} className="ev-card">
                      <div className="font-bn" style={{ fontWeight: 800, marginBottom: '0.35rem' }}>{q.questionBn}</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--status-success-text)', marginBottom: '0.5rem' }}>
                        ✓ উত্তর: {q.options[q.correctIndex]} — {q.explanation}
                      </div>
                      <input
                        type="text"
                        className="ev-input font-bn"
                        placeholder="এই প্রশ্নের জন্য আপনার ব্যক্তিগত নোট লিখুন..."
                        value={state.bookmarkNotes[q.id] || ''}
                        onChange={(e) =>
                          setState((s) => ({
                            ...s,
                            bookmarkNotes: { ...s.bookmarkNotes, [q.id]: e.target.value }
                          }))
                        }
                      />
                    </div>
                  ))
              )}
            </div>
          )}

          {/* 11. DEDICATED MISTAKE BANK VIEW (BUG-11 Fixed: New -> Practicing -> Resolved) */}
          {view === 'mistakes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>⚠️ Mistake Bank ({state.mistakes.length})</h1>
                {state.mistakes.some((m) => m.status !== 'Resolved') && (
                  <button
                    type="button"
                    className="ev-btn ev-btn-primary ev-btn-sm"
                    onClick={() => {
                      const ids = state.mistakes.filter((m) => m.status !== 'Resolved').map((m) => m.questionId);
                      startQuiz(allQuestions.filter((q) => ids.includes(q.id)), 'Mistake Recovery Session');
                    }}
                  >
                    Practice Unresolved Mistakes
                  </button>
                )}
              </div>
              {state.mistakes.length === 0 ? (
                <div className="ev-card">আপনার Mistake Bank-এ কোনো ভুল প্রশ্ন নেই!</div>
              ) : (
                state.mistakes.map((m) => {
                  const q = allQuestions.find((x) => x.id === m.questionId);
                  if (!q) return null;
                  const stLabel = m.status || 'New';
                  const stClass = stLabel === 'Resolved' ? 'ev-badge-success' : stLabel === 'Practicing' ? 'ev-badge-warning' : 'ev-badge-danger';
                  return (
                    <div key={m.questionId} className="ev-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span className={`ev-badge-pill ${stClass}`}>{stLabel} (Retries: {m.retryCount})</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last Attempt: {m.timestamp}</span>
                      </div>
                      <div className="font-bn" style={{ fontWeight: 800, marginBottom: '0.3rem' }}>{q.questionBn}</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                        Correct Answer: <strong>{q.options[q.correctIndex]}</strong> — {m.note}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* 12. DEDICATED QUIZ HISTORY VIEW */}
          {view === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>🕒 Complete Quiz History ({state.quizHistory.length})</h1>
              {state.quizHistory.map((h) => (
                <div key={h.id} className="ev-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{h.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {h.date} • {h.mode === 'exam' ? `Exam (Neg: -${h.negativeMark})` : 'Practice'} • Attempted {h.attempted}/{h.total}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="ev-badge-pill ev-badge-success">Net: {h.netScore}/{h.total} ({h.accuracy}%)</span>
                    <button
                      type="button"
                      className="ev-btn ev-btn-secondary ev-btn-sm"
                      onClick={() => {
                        setLastResult(h);
                        setSession(null);
                        setView('quiz');
                      }}
                    >
                      Review Answers
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 13. DEDICATED PROFILE VIEW (Section 3.2 & 3.8 Fixed: Profile Edit + Locked/Unlocked Badges) */}
          {view === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="ev-card" style={{ border: '1.5px solid var(--brand-primary-border)', background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--brand-primary-soft) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span className={`ev-badge-pill ${authEmail ? 'ev-badge-success' : 'ev-badge-indigo'}`} style={{ marginBottom: '0.35rem' }}>
                    {authEmail ? `✓ Cloud Synced (${authEmail})` : 'Local Guest Profile'}
                  </span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{state.user.name} ({state.user.username})</h2>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Joined: {state.user.joinedDate || '2026'} • Last Active: {state.user.lastStudyDate || 'Today'}
                  </div>
                </div>
                <button type="button" className="ev-btn ev-btn-primary" onClick={() => setAuthModalOpen(true)}>
                  {authEmail ? 'Account & Password Settings' : 'Sign In / Create Account'}
                </button>
              </div>

              <div className="ev-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem' }}>✏️ Edit Student Profile</h3>
                <div className="ev-grid-3" style={{ marginBottom: '0.85rem' }}>
                  <input type="text" className="ev-input" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" />
                  <input type="text" className="ev-input" value={editHandle} onChange={(e) => setEditHandle(e.target.value)} placeholder="@username" />
                  <select className="ev-select" value={editTrack} onChange={(e) => setEditTrack(e.target.value)}>
                    <option value="Science (বিজ্ঞান বিভাগ)">Science (বিজ্ঞান বিভাগ)</option>
                    <option value="Commerce (ব্যবসায় শিক্ষা বিভাগ)">Commerce (ব্যবসায় শিক্ষা বিভাগ)</option>
                    <option value="Arts (মানবিক বিভাগ)">Arts (মানবিক বিভাগ)</option>
                    <option value="BCS & Bank Jobs">BCS &amp; Bank Jobs</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="ev-btn ev-btn-primary ev-btn-sm"
                  onClick={() => {
                    const cleanName = editName.trim() || 'Student Scholar';
                    const cleanHandle = editHandle.trim().startsWith('@') ? editHandle.trim() : '@' + editHandle.trim();
                    const parts = cleanName.split(/\s+/);
                    const initials = ((parts[0]?.[0] || 'S') + (parts[1]?.[0] || 'S')).toUpperCase();
                    setState((prev) => {
                      const next = {
                        ...prev,
                        user: { ...prev.user, name: cleanName, username: cleanHandle, avatarInitials: initials, targetTrack: editTrack }
                      };
                      supabase.auth.getUser().then(({ data }) => {
                        if (data?.user) pushFullStateToCloud(data.user, next);
                      });
                      return next;
                    });
                    showToast('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
                  }}
                >
                  Save Profile Changes
                </button>
              </div>

              {/* Section 3.8 FIX: Achievement Badges Showing Unlocked vs Locked Status */}
              <div className="ev-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.85rem' }}>
                  🏅 Achievement Badges ({state.unlockedBadges.length}/{ACHIEVEMENTS.length} Unlocked)
                </h3>
                <div className="ev-grid-2">
                  {ACHIEVEMENTS.map((ach) => {
                    const isUnlocked = state.unlockedBadges.includes(ach.id);
                    return (
                      <div
                        key={ach.id}
                        style={{
                          padding: '0.85rem',
                          border: `1.5px solid ${isUnlocked ? 'var(--status-success-border)' : 'var(--border-subtle)'}`,
                          background: isUnlocked ? 'var(--status-success-bg)' : 'var(--bg-surface-muted)',
                          opacity: isUnlocked ? 1 : 0.65,
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800 }}>
                            {isUnlocked ? '🏅 ' : '🔒 '} {ach.title} — <span className="font-bn">{ach.titleBn}</span>
                          </div>
                          <div className="font-bn" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ach.description}</div>
                        </div>
                        <span className={`ev-badge-pill ${isUnlocked ? 'ev-badge-success' : 'ev-badge-neutral'}`}>
                          {isUnlocked ? `✓ Unlocked (+${ach.xpBonus} XP)` : `Locked (+${ach.xpBonus} XP)`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 14. DEDICATED SETTINGS VIEW (Section 3.9 Fixed: Appearance, Quiz Preferences, Audio & Data) */}
          {view === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h1 style={{ fontSize: '1.38rem', fontWeight: 800 }}>⚙️ Platform Settings &amp; Data Management</h1>

              <div className="ev-grid-2">
                <div className="ev-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>🎨 Appearance &amp; Language</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Theme Mode</span>
                    <button
                      type="button"
                      className="ev-btn ev-btn-secondary ev-btn-sm"
                      onClick={() => setState((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }))}
                    >
                      {state.theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Question Language</span>
                    <select
                      className="ev-select"
                      style={{ width: '160px' }}
                      value={state.settings.language}
                      onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, language: e.target.value as any } }))}
                    >
                      <option value="bilingual">Bilingual (বাংলা + EN)</option>
                      <option value="bn">বাংলা (Bangla Only)</option>
                      <option value="en">English Only</option>
                    </select>
                  </div>
                </div>

                <div className="ev-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>⏱ Quiz &amp; Exam Preferences</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Exam Countdown Timer</span>
                    <input
                      type="checkbox"
                      checked={state.settings.timerEnabled}
                      onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, timerEnabled: e.target.checked } }))}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Default Time per Question</span>
                    <select
                      className="ev-select"
                      style={{ width: '140px' }}
                      value={state.settings.defaultDurationPerQuestionSec}
                      onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, defaultDurationPerQuestionSec: Number(e.target.value) } }))}
                    >
                      <option value={30}>30 Seconds</option>
                      <option value={45}>45 Seconds</option>
                      <option value={60}>60 Seconds</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Negative Marking in Exam Mode</span>
                    <input
                      type="checkbox"
                      checked={state.settings.negativeMarkingEnabled}
                      onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, negativeMarkingEnabled: e.target.checked } }))}
                    />
                  </div>
                </div>
              </div>

              <div className="ev-card">
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.65rem' }}>💾 Data Export, Restore &amp; Reset</h3>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    className="ev-btn ev-btn-soft ev-btn-sm"
                    onClick={() => setBackupJsonInput(JSON.stringify(state, null, 2))}
                  >
                    Generate Backup JSON
                  </button>
                  <button
                    type="button"
                    className="ev-btn ev-btn-primary ev-btn-sm"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(backupJsonInput);
                        if (parsed && parsed.user && parsed.stats) {
                          setState(parsed);
                          showToast('ব্যাকআপ থেকে প্রগ্রেস সফলভাবে রিস্টোর হয়েছে!');
                        }
                      } catch {
                        showToast('সঠিক Backup JSON পেস্ট করুন!');
                      }
                    }}
                  >
                    Restore from JSON
                  </button>
                  <button
                    type="button"
                    className="ev-btn ev-btn-danger ev-btn-sm"
                    onClick={() => {
                      setState(createFreshState());
                      setSession(null);
                      showToast('সকল লোকাল প্রগ্রেস ০-তে রিসেট করা হয়েছে।');
                    }}
                  >
                    Reset All Local Progress
                  </button>
                </div>
                <textarea
                  className="ev-input font-mono"
                  rows={4}
                  style={{ fontSize: '0.75rem' }}
                  placeholder="Export বা Restore করার জন্য JSON এখানে থাকবে..."
                  value={backupJsonInput}
                  onChange={(e) => setBackupJsonInput(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* 15. ROLE-PROTECTED ADMIN PANEL */}
          {view === 'admin' && (
            <AdminDashboardView
              isAdmin={Boolean(state.user.isAdmin)}
              authEmail={authEmail}
              customQuestions={customQuestions}
              onAddQuestions={(newQs) => setCustomQuestions((prev) => [...newQs, ...prev])}
              onDeleteCustomQuestion={(id) => setCustomQuestions((prev) => prev.filter((q) => q.id !== id))}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      <nav className="ev-bottom-nav">
        {([
          ['home', 'Home'],
          ['exams', 'Exams'],
          ['quiz', 'Quiz'],
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        authEmail={authEmail}
        onSignOut={async () => {
          await supabase.auth.signOut();
          setCurrentUserId(null);
          setAuthEmail(null);
          setState(loadStoredState(null));
          setSession(null);
          showToast('Signed out & switched to clean guest session');
        }}
        showToast={showToast}
      />

      {toast && (
        <div style={{ position: 'fixed', bottom: '4.8rem', left: '50%', transform: 'translateX(-50%)', zIndex: 99, background: 'var(--text-primary)', color: 'var(--bg-surface)', padding: '0.65rem 1.2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem', boxShadow: 'var(--shadow-lg)' }}>
          {toast}
        </div>
      )}
    </div>
  );
};
