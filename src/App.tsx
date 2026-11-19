import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  NavTabId,
  VALID_TABS,
  getAvailableClasses,
  getAvailableGroups,
  getLevelProgress,
  getSubjectsForSelection,
  getTodayIsoDate,
  subjectSupportsFormulas,
  trKey,
  trText,
  useExamStore,
} from './store/useExamStore';
import { MCQQuestion, SubjectData } from './types';
import {
  AuthModal,
  EvIcon,
  ExamVerseLogo,
  FlameBigSvg,
  FlameMiniSvg,
  HeroSketchSvg,
  LevelRingSvg,
  QuizRunnerModal,
  SettingsModal,
  SubjectSketchSvg,
} from './components/ModalsAndQuiz';
import { ExtraFeaturesView } from './components/ExtraFeatures';

function getSubjectThemeAttr(subjId: string): string {
  const id = subjId.toLowerCase();
  if (id.includes('phy')) return 'physics';
  if (id.includes('chem')) return 'chemistry';
  if (id.includes('math') || id.includes('stat')) return 'math';
  if (id.includes('bio') || id.includes('agr') || id.includes('gsci') || id.includes('med')) return 'biology';
  if (id.includes('eng') || id.includes('en-')) return 'english';
  if (id.includes('ban') || id.includes('bn-')) return 'bangla';
  if (id.includes('ict')) return 'ict';
  if (
    id.includes('acc') ||
    id.includes('fin') ||
    id.includes('bom') ||
    id.includes('mkt') ||
    id.includes('pmm') ||
    id.includes('ent') ||
    id.includes('com')
  ) {
    return 'accounting';
  }
  if (
    id.includes('eco') ||
    id.includes('civ') ||
    id.includes('his') ||
    id.includes('isl') ||
    id.includes('ihc') ||
    id.includes('soc') ||
    id.includes('sw-') ||
    id.includes('geo') ||
    id.includes('log')
  ) {
    return 'economics';
  }
  return 'physics';
}

function getSubjectIconName(subjId: string): string {
  const id = subjId.toLowerCase();
  if (id.includes('phy')) return 'zap';
  if (id.includes('chem')) return 'layers';
  if (id.includes('math') || id.includes('stat')) return 'formula';
  if (id.includes('bio') || id.includes('agr') || id.includes('med')) return 'shield';
  if (id.includes('ict')) return 'cloud';
  if (id.includes('acc') || id.includes('fin')) return 'chart';
  if (id.includes('bom') || id.includes('mkt') || id.includes('pmm') || id.includes('ent')) return 'calendar';
  return 'book';
}

function selectDailySprintQuestions(subjects: SubjectData[], dateSeed: string, count = 10): MCQQuestion[] {
  const pool: MCQQuestion[] = [];
  for (const s of subjects) {
    for (const c of s.chapters) {
      if (Array.isArray(c.mcqs) && c.mcqs.length > 0) {
        pool.push(...c.mcqs);
      }
    }
  }
  if (pool.length <= count) return pool;

  let seed = 0;
  for (let i = 0; i < dateSeed.length; i++) {
    seed = (seed * 31 + dateSeed.charCodeAt(i)) >>> 0;
  }

  const picked: MCQQuestion[] = [];
  const used = new Set<number>();
  let attempts = 0;
  while (picked.length < count && attempts < count * 8) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const idx = seed % pool.length;
    if (!used.has(idx)) {
      used.add(idx);
      picked.push(pool[idx]);
    }
    attempts++;
  }
  return picked;
}

export function App() {
  const {
    language,
    setLanguage,
    darkMode,
    toggleDarkMode,
    selectedClass,
    selectedGroup,
    setClassAndGroup,
    activeTab,
    setActiveTab,
    selectedSubjectId,
    setSelectedSubjectId,
    openSubjectFormulas,
    userName,
    userAvatar,
    isAuthenticated,
    xp,
    streak,
    weeklyActivity,
    mistakes,
    examHistory,
    chapterMastery,
    isAdminUnlocked,
    questionReports,
    setAuthModalOpen,
    setSettingsModalOpen,
    startQuiz,
    getRankInfo,
  } = useExamStore();

  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [mobileSprintPopupOpen, setMobileSprintPopupOpen] = useState(false);
  const [, setLogoTapCount] = useState(0);
  const logoResetTimerRef = useRef<any>(null);

  const todayIso = getTodayIsoDate();

  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!rawHash || rawHash.startsWith('access_token=') || rawHash.startsWith('error=')) {
        return;
      }
      const normalized: NavTabId = rawHash === 'analytics' ? 'Analytics' : (rawHash as NavTabId);
      if (VALID_TABS.includes(normalized)) {
        setActiveTab(normalized);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveTab('admin');
      } else if (e.key === 'Escape') {
        setMobileMoreOpen(false);
        setMobileSprintPopupOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('keydown', onKeyDown);
      if (logoResetTimerRef.current) clearTimeout(logoResetTimerRef.current);
    };
  }, [setActiveTab]);

  const handleBrandLogoClick = () => {
    if (logoResetTimerRef.current) clearTimeout(logoResetTimerRef.current);
    setLogoTapCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setSelectedSubjectId(null);
        setActiveTab('admin');
        return 0;
      }
      logoResetTimerRef.current = setTimeout(() => {
        setLogoTapCount(0);
      }, 2500);
      return next;
    });
    setSelectedSubjectId(null);
    if (activeTab !== 'admin') {
      setActiveTab('dashboard');
    }
  };

  const isBn = language !== 'en';
  const rank = getRankInfo();
  const lvInfo = getLevelProgress(xp);

  const classList = getAvailableClasses();
  const groupList = getAvailableGroups(selectedClass);
  const subjects: SubjectData[] = getSubjectsForSelection(selectedClass, selectedGroup, true);
  const selectedSubject: SubjectData | null = selectedSubjectId
    ? subjects.find((s) => s.id === selectedSubjectId) || null
    : null;

  const pendingMistakesCount = mistakes.filter((m) => !m.mastered).length;
  const pendingReportsCount = questionReports.filter((r) => r.status === 'pending').length;

  const dailySprintPool = useMemo(
    () => selectDailySprintQuestions(subjects, `${todayIso}-${selectedClass}-${selectedGroup}`, 10),
    [subjects, todayIso, selectedClass, selectedGroup]
  );

  const todaySprintDoneSegs = useMemo(() => {
    const todayDaily = examHistory.filter(
      (h) => h.date === todayIso && (h.mode === 'daily' || h.chapterId === `daily-${todayIso}`)
    );
    if (todayDaily.length === 0) return 0;
    const best = Math.max(...todayDaily.map((e) => Math.round((e.score / Math.max(1, e.total)) * 10)));
    return Math.min(10, Math.max(1, best));
  }, [examHistory, todayIso]);

  const primaryNav: { id: NavTabId; icon: string; labelKey: string; count?: number }[] = [
    { id: 'dashboard', icon: 'home', labelKey: 'nav_dashboard' },
    { id: 'subjects', icon: 'book', labelKey: 'nav_subjects', count: subjects.length },
    { id: 'battle', icon: 'zap', labelKey: 'nav_battle' },
    { id: 'leaderboard', icon: 'trophy', labelKey: 'nav_leaderboard' },
    { id: 'Analytics', icon: 'chart', labelKey: 'nav_analytics' },
    { id: 'achievements', icon: 'shield', labelKey: 'nav_achievements' },
  ];

  const secondaryNav: { id: NavTabId; icon: string; labelKey: string; count?: number }[] = [
    { id: 'formulas', icon: 'formula', labelKey: 'nav_formulas' },
    { id: 'mistakes', icon: 'alert', labelKey: 'nav_mistakes', count: pendingMistakesCount || undefined },
    { id: 'flashcards', icon: 'layers', labelKey: 'nav_flashcards' },
    { id: 'planner', icon: 'calendar', labelKey: 'nav_planner' },
    { id: 'community', icon: 'message', labelKey: 'nav_community' },
  ];

  const handleLaunchSubjectPractice = (subj: SubjectData, chapterIdx = 0, examType: 'mcq' | 'cq' = 'mcq') => {
    const chap = subj.chapters[chapterIdx] || subj.chapters[0];
    if (!chap) return;
    const rawMcqs = chap.mcqs || [];
    if (examType === 'mcq' && rawMcqs.length === 0) return;
    startQuiz({
      mode: 'practice',
      examType,
      subjectId: subj.id,
      subjectName: subj.name,
      chapterId: chap.id,
      chapterName: chap.name,
      questions: rawMcqs,
      cqs: chap.cqs || [],
      durationSec: Math.max(300, Math.max(1, rawMcqs.length) * 45),
      negativeMarking: 0,
    });
  };

  const handleLaunchDailySprint = () => {
    if (dailySprintPool.length === 0) return;
    const firstWithMcqs = subjects.find((s) => s.chapters.some((c) => (c.mcqs?.length || 0) > 0)) || subjects[0];
    if (!firstWithMcqs) return;
    startQuiz({
      mode: 'daily',
      examType: 'mcq',
      subjectId: firstWithMcqs.id,
      subjectName: { bn: 'আজকের চ্যালেঞ্জ', en: 'Daily Challenge' },
      chapterId: `daily-${todayIso}`,
      chapterName: {
        bn: `${selectedClass} • ${selectedGroup}`,
        en: `${selectedClass} • ${selectedGroup}`,
      },
      questions: dailySprintPool,
      cqs: [],
      durationSec: 450,
      negativeMarking: 0.25,
    });
    setMobileSprintPopupOpen(false);
  };

  const weekDaysBn = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];
  const weekDaysEn = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const hasPhotoAvatar = isAuthenticated && userAvatar && userAvatar.startsWith('http');

  return (
    <>
      <div className="ev-bg-art" aria-hidden="true">
        <svg className="ev-doodle ev-doodle-book" viewBox="0 0 200 200">
          <path d="M100 58C80 44 48 42 24 50v94c24-8 56-6 76 8 20-14 52-16 76-8V50c-24-8-56-6-76 8z" />
          <path d="M100 58v94M38 68c17-4 38-3 54 5M38 86c17-4 38-3 54 5" />
        </svg>
        <svg className="ev-doodle ev-doodle-pencil" viewBox="0 0 200 200">
          <path d="M28 88h112v24H28zM140 88l26 12-26 12M52 88v24" />
        </svg>
      </div>

      <div className="ev-app-shell">
        <aside className="ev-sidebar">
          <button
            type="button"
            className="ev-brand"
            style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--border-subtle)', width: '100%', textAlign: 'left' }}
            onClick={handleBrandLogoClick}
          >
            <ExamVerseLogo size={38} />
            <div className="ev-brand-text">
              <span className="ev-brand-title">ExamVerse</span>
              <span className="ev-brand-subtitle">Learn • Practice • Excel</span>
            </div>
          </button>

          <div className="ev-nav-section-label">{isBn ? 'মূল মেনু' : 'Core'}</div>
          <ul className="ev-nav-list">
            {primaryNav.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`ev-nav-btn ${activeTab === item.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedSubjectId(null);
                    setActiveTab(item.id);
                  }}
                >
                  <span className="ev-nav-btn-left">
                    <EvIcon name={item.icon} />
                    <span>{trKey(item.labelKey as any, language)}</span>
                  </span>
                  {item.count !== undefined && <span className="ev-nav-count">{item.count}</span>}
                </button>
              </li>
            ))}
          </ul>

          <div className="ev-nav-section-label" style={{ marginTop: '0.75rem' }}>
            {isBn ? 'স্টাডি টুলস' : 'Study Tools'}
          </div>
          <ul className="ev-nav-list">
            {secondaryNav.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`ev-nav-btn ${activeTab === item.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedSubjectId(null);
                    setActiveTab(item.id);
                  }}
                >
                  <span className="ev-nav-btn-left">
                    <EvIcon name={item.icon} />
                    <span>{trKey(item.labelKey as any, language)}</span>
                  </span>
                  {item.count !== undefined && <span className="ev-nav-count">{item.count}</span>}
                </button>
              </li>
            ))}
          </ul>

          <div className="ev-sidebar-footer">
            {(isAdminUnlocked || activeTab === 'admin') && (
              <button
                type="button"
                className={`ev-nav-btn ${activeTab === 'admin' ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedSubjectId(null);
                  setActiveTab('admin');
                }}
              >
                <span className="ev-nav-btn-left">
                  <EvIcon name="shield" />
                  <span>{isBn ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
                </span>
                {pendingReportsCount > 0 && <span className="ev-nav-count">{pendingReportsCount}</span>}
              </button>
            )}

            <button type="button" className="ev-nav-btn" onClick={() => setAuthModalOpen(true)}>
              <span className="ev-nav-btn-left">
                <EvIcon name="user" />
                <span>{isAuthenticated ? userName : isBn ? 'সাইন ইন' : 'Sign In'}</span>
              </span>
            </button>

            <button type="button" className="ev-nav-btn" onClick={() => setSettingsModalOpen(true)}>
              <span className="ev-nav-btn-left">
                <EvIcon name="settings" />
                <span>{isBn ? 'সেটিংস' : 'Settings'}</span>
              </span>
            </button>
          </div>
        </aside>

        <div className="ev-main-wrapper">
          <header className="ev-topbar">
            <div className="ev-topbar-left">
              <button
                type="button"
                className="ev-mobile-logo"
                style={{ background: 'none', border: 'none' }}
                onClick={handleBrandLogoClick}
              >
                <ExamVerseLogo size={30} />
                <span style={{ fontWeight: 800, fontSize: '0.98rem' }}>ExamVerse</span>
              </button>

              <div className="ev-greeting-wrap">
                <div className="ev-greeting-title">
                  {trKey('welcome_back', language)}, {userName.split(' ')[0]}
                </div>
                <div className="ev-greeting-sub">
                  <span className="ev-breadcrumb-pill">{isBn ? rank.fullTitleBn : rank.fullTitleEn}</span>
                  <span>
                    {selectedClass} • {selectedGroup}
                  </span>
                </div>
              </div>
            </div>

            <div className="ev-topbar-right">
              <button
                type="button"
                className={`ev-streak-pill ${streak > 0 ? 'is-active' : 'is-muted'}`}
                onClick={() => setActiveTab('achievements')}
                title={trKey('streak_days', language)}
              >
                <FlameMiniSvg />
                <span>{streak}d</span>
              </button>

              <button
                type="button"
                className="ev-icon-btn"
                onClick={() => setLanguage(language === 'bn' ? 'en' : language === 'en' ? 'bilingual' : 'bn')}
                title={isBn ? 'ভাষা পরিবর্তন' : 'Switch Language'}
              >
                {language === 'bn' ? 'বাংলা' : language === 'en' ? 'EN' : 'বাং+EN'}
              </button>

              <button
                type="button"
                className="ev-icon-btn"
                onClick={toggleDarkMode}
                title={isBn ? 'থিম পরিবর্তন' : 'Toggle Theme'}
              >
                <EvIcon name={darkMode ? 'sun' : 'moon'} size={18} />
              </button>

              <button
                type="button"
                className="ev-profile-trigger"
                onClick={() => setAuthModalOpen(true)}
                title={isAuthenticated ? userName : trKey('sign_in', language)}
              >
                <span className="ev-avatar-ring">
                  <LevelRingSvg size={38} strokeWidth={3} pct={lvInfo.progressPct} />
                  <span className="ev-avatar-sm" style={{ overflow: 'hidden' }}>
                    {hasPhotoAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    ) : (
                      <EvIcon name="user" size={15} />
                    )}
                  </span>
                  <span className="ev-avatar-lv">{lvInfo.level}</span>
                </span>
                <span className="ev-profile-trigger-name">
                  {isAuthenticated ? userName.split(' ')[0] : trKey('sign_in', language)}
                </span>
              </button>
            </div>
          </header>

          <main className="ev-content-area ev-view-animate">
            {activeTab !== 'dashboard' && activeTab !== 'subjects' ? (
              <ExtraFeaturesView />
            ) : selectedSubject ? (
              <div className="ev-card">
                <div className="ev-section-header">
                  <div>
                    <button
                      type="button"
                      className="ev-btn ev-btn-secondary ev-btn-sm"
                      style={{ marginBottom: 10 }}
                      onClick={() => setSelectedSubjectId(null)}
                    >
                      ← {isBn ? 'সব বিষয়' : 'All Subjects'}
                    </button>
                    <h2 className="ev-section-title">{trText(selectedSubject.name, language)}</h2>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {subjectSupportsFormulas(selectedSubject) && (
                      <button
                        type="button"
                        className="ev-btn ev-btn-soft ev-btn-sm"
                        onClick={() => openSubjectFormulas(selectedSubject.id, 'all')}
                      >
                        {isBn ? 'সূত্র দেখো' : 'Formulas'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="ev-btn ev-btn-primary ev-btn-sm"
                      onClick={() => setActiveTab('battle')}
                    >
                      {isBn ? '1v1 ব্যাটল' : '1v1 Battle'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedSubject.chapters.map((chap, idx) => {
                    const chapMastery = chapterMastery[chap.id] || 0;
                    const mcqCount = chap.mcqs?.length || 0;
                    const formulaCount = chap.formulas?.length || 0;

                    return (
                      <div
                        key={chap.id}
                        className="ev-card ev-subj-panel"
                        data-subj={getSubjectThemeAttr(selectedSubject.id)}
                        style={{
                          padding: '0.9rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                            {idx + 1}. {trText(chap.name, language)}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
                            {mcqCount > 0 ? `${mcqCount} MCQs` : isBn ? 'প্রশ্ন যোগ হচ্ছে' : 'Coming soon'}
                            {formulaCount > 0 ? ` • ${isBn ? 'সূত্র' : 'Formulas'}: ${formulaCount}` : ''}
                            {mcqCount > 0 ? ` • ${trKey('mastery', language)}: ${chapMastery}%` : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {formulaCount > 0 && (
                            <button
                              type="button"
                              className="ev-btn ev-btn-soft ev-btn-sm"
                              onClick={() => openSubjectFormulas(selectedSubject.id, chap.id)}
                            >
                              {isBn ? `সূত্র (${formulaCount})` : `Formulas (${formulaCount})`}
                            </button>
                          )}

                          <button
                            type="button"
                            className={`ev-btn ${mcqCount > 0 ? 'ev-btn-primary' : 'ev-btn-secondary'} ev-btn-sm`}
                            disabled={mcqCount === 0}
                            onClick={() => handleLaunchSubjectPractice(selectedSubject, idx, 'mcq')}
                          >
                            {mcqCount > 0 ? `MCQ (${mcqCount})` : isBn ? 'শীঘ্রই' : 'Soon'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <div className="ev-home-top-grid">
                    <div className="ev-card ev-hero">
                      <HeroSketchSvg />

                      <div className="ev-hero-main">
                        <div className="ev-hero-ring">
                          <LevelRingSvg size={88} strokeWidth={7} pct={rank.progressPct} />
                          <div className="ev-hero-ring-num">
                            <small>RANK</small>
                            <b>{lvInfo.level}</b>
                          </div>
                        </div>

                        <div className="ev-hero-copy">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span className="ev-badge-pill ev-badge-indigo">
                              🛡️ {isBn ? rank.fullTitleBn : rank.fullTitleEn} • {rank.rankScore} RP
                            </span>
                            <span className="ev-badge-pill ev-badge-warning">🔥 {streak}d</span>
                          </div>

                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                            <select
                              className="ev-select"
                              style={{ width: 'auto', minHeight: 34, padding: '0 8px', fontSize: 12.5, fontWeight: 700 }}
                              value={selectedClass}
                              onChange={(e) => {
                                const nextCls = e.target.value;
                                const firstGrp = getAvailableGroups(nextCls)[0] || 'Business Studies';
                                setClassAndGroup(nextCls, firstGrp);
                              }}
                            >
                              {classList.map((cls) => (
                                <option key={cls} value={cls}>
                                  {cls}
                                </option>
                              ))}
                            </select>

                            <select
                              className="ev-select"
                              style={{ width: 'auto', minHeight: 34, padding: '0 8px', fontSize: 12.5, fontWeight: 700 }}
                              value={selectedGroup}
                              onChange={(e) => setClassAndGroup(selectedClass, e.target.value)}
                            >
                              {groupList.map((grp) => (
                                <option key={grp} value={grp}>
                                  {grp}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="ev-xp-ruler">
                          <div className="ev-xp-ruler-fill" style={{ width: `${Math.max(4, rank.progressPct)}%` }} />
                        </div>
                        <div className="ev-xp-caption">
                          <span>{xp} XP</span>
                          <span>
                            {trKey('accuracy', language)}: {rank.accuracyPct}% • {rank.rankScore}/{rank.nextTierScore} RP
                          </span>
                        </div>
                      </div>

                      <div className={`ev-streak-strip ${streak === 0 ? 'is-cold' : ''}`}>
                        <div className="ev-streak-lead">
                          <FlameBigSvg />
                          <div className="ev-streak-num">
                            {streak} {isBn ? 'দিনের স্ট্রিক' : 'Day Streak'}
                          </div>
                        </div>

                        <div className="ev-wk">
                          {(isBn ? weekDaysBn : weekDaysEn).map((d, i) => {
                            const isLit = Boolean(weeklyActivity[i]);
                            return (
                              <div key={d} className={`ev-wk-day ${isLit ? 'is-lit' : ''}`}>
                                <i>{isLit ? '✓' : '•'}</i>
                                <em>{d}</em>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="ev-card ev-daily-card ev-daily-inline">
                      <div className="ev-daily-head">
                        <div className="ev-daily-ic">
                          <EvIcon name="zap" size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="ev-daily-title">{trKey('daily_challenge', language)}</div>
                          <div className="ev-daily-sub">
                            {dailySprintPool.length} MCQs • {selectedClass}
                          </div>
                        </div>
                        <span className="ev-xp-chip">+120 XP</span>
                      </div>

                      <div className="ev-seg">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((seg) => (
                          <i key={seg} className={seg < todaySprintDoneSegs ? 'is-done' : ''} />
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="ev-btn ev-btn-primary"
                          style={{ flex: 1 }}
                          disabled={dailySprintPool.length === 0}
                          onClick={handleLaunchDailySprint}
                        >
                          {dailySprintPool.length > 0
                            ? isBn
                              ? 'চ্যালেঞ্জ শুরু করো'
                              : 'Start Challenge'
                            : isBn
                            ? 'শীঘ্রই আসছে'
                            : 'Coming Soon'}
                        </button>
                        <button type="button" className="ev-btn ev-btn-secondary" onClick={() => setActiveTab('battle')}>
                          1v1
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="ev-section-header" style={{ flexWrap: 'wrap', gap: 10 }}>
                    <h2 className="ev-section-title">
                      {trKey('all_subjects', language)} ({subjects.length})
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {activeTab === 'subjects' && (
                        <>
                          <select
                            className="ev-select"
                            style={{ width: 'auto', minHeight: 34, padding: '0 8px', fontSize: 12.5, fontWeight: 700 }}
                            value={selectedClass}
                            onChange={(e) => {
                              const nextCls = e.target.value;
                              const firstGrp = getAvailableGroups(nextCls)[0] || 'Business Studies';
                              setClassAndGroup(nextCls, firstGrp);
                            }}
                          >
                            {classList.map((cls) => (
                              <option key={cls} value={cls}>
                                {cls}
                              </option>
                            ))}
                          </select>

                          <select
                            className="ev-select"
                            style={{ width: 'auto', minHeight: 34, padding: '0 8px', fontSize: 12.5, fontWeight: 700 }}
                            value={selectedGroup}
                            onChange={(e) => setClassAndGroup(selectedClass, e.target.value)}
                          >
                            {groupList.map((grp) => (
                              <option key={grp} value={grp}>
                                {grp}
                              </option>
                            ))}
                          </select>
                        </>
                      )}

                      <button type="button" className="ev-section-link" onClick={() => setActiveTab('battle')}>
                        ⚔️ {isBn ? 'কুইজ ব্যাটল (1v1) →' : 'Quiz Battle (1v1) →'}
                      </button>
                    </div>
                  </div>

                  <div className="ev-grid-4">
                    {subjects.map((subj) => {
                      const subjAttr = getSubjectThemeAttr(subj.id);
                      const iconName = getSubjectIconName(subj.id);
                      const rawTotalMcqs = subj.chapters.reduce((sum, c) => sum + (c.mcqs?.length || 0), 0);
                      const subjMastery = Math.min(
                        100,
                        Math.round(
                          subj.chapters.reduce((acc, c) => acc + (chapterMastery[c.id] || 0), 0) /
                            Math.max(1, subj.chapters.length)
                        )
                      );
                      const primaryTitle = language === 'en' ? subj.name.en : subj.name.bn;
                      const secondaryTitle = language === 'en' ? subj.name.bn : subj.name.en;

                      return (
                        <div
                          key={subj.id}
                          role="button"
                          tabIndex={0}
                          className="ev-card ev-card-interactive ev-subject-card"
                          data-subj={subjAttr}
                          onClick={() => setSelectedSubjectId(subj.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedSubjectId(subj.id);
                            }
                          }}
                        >
                          <div className="ev-subject-top">
                            <div className="ev-subject-icon-box" data-subj={subjAttr}>
                              <EvIcon name={iconName} size={20} />
                            </div>
                            <span className="ev-mcq-pill">
                              {rawTotalMcqs > 0 ? `${rawTotalMcqs} MCQs` : isBn ? 'শীঘ্রই' : 'Soon'}
                            </span>
                          </div>

                          <div className="ev-subject-names">
                            <div className="ev-subject-name">{primaryTitle}</div>
                            <div className="ev-subject-name-bn">{secondaryTitle}</div>
                          </div>

                          <div className="ev-subject-meter">
                            <div className="ev-subject-meter-row">
                              <span>
                                {subj.chapters.length} {trKey('chapters_count', language)}
                              </span>
                              <span>{subjMastery}%</span>
                            </div>
                            <div className="ev-progress-track">
                              <div className="ev-progress-fill" style={{ width: `${subjMastery}%` }} />
                            </div>
                          </div>

                          <SubjectSketchSvg subjKey={subj.id} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <nav className="ev-bottom-nav">
        <button
          type="button"
          className={`ev-bottom-nav-btn ${activeTab === 'dashboard' ? 'is-active' : ''}`}
          onClick={() => {
            setSelectedSubjectId(null);
            setActiveTab('dashboard');
          }}
        >
          <EvIcon name="home" />
          <span>{isBn ? 'হোম' : 'Home'}</span>
        </button>

        <button
          type="button"
          className={`ev-bottom-nav-btn ${activeTab === 'subjects' ? 'is-active' : ''}`}
          onClick={() => {
            setSelectedSubjectId(null);
            setActiveTab('subjects');
          }}
        >
          <EvIcon name="book" />
          <span>{isBn ? 'বিষয়' : 'Subjects'}</span>
        </button>

        <button
          type="button"
          className={`ev-bottom-nav-btn ${activeTab === 'battle' ? 'is-active' : ''}`}
          onClick={() => {
            setSelectedSubjectId(null);
            setActiveTab('battle');
          }}
        >
          <EvIcon name="zap" />
          <span>{isBn ? 'কুইজ ব্যাটল' : 'Battle'}</span>
        </button>

        <button
          type="button"
          className={`ev-bottom-nav-btn ${activeTab === 'leaderboard' ? 'is-active' : ''}`}
          onClick={() => {
            setSelectedSubjectId(null);
            setActiveTab('leaderboard');
          }}
        >
          <EvIcon name="trophy" />
          <span>{isBn ? 'র‍্যাঙ্কিং' : 'Ranking'}</span>
        </button>

        <button type="button" className="ev-bottom-nav-btn" onClick={() => setMobileMoreOpen(true)}>
          <EvIcon name="more" />
          <span>{isBn ? 'আরও' : 'More'}</span>
        </button>
      </nav>

      {mobileSprintPopupOpen && (
        <div
          className="ev-modal-backdrop is-open"
          role="dialog"
          aria-modal="true"
          onClick={() => setMobileSprintPopupOpen(false)}
        >
          <div
            className="ev-card ev-daily-card"
            style={{ width: '100%', maxWidth: 380, padding: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ev-daily-head">
              <div className="ev-daily-ic">
                <EvIcon name="zap" size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="ev-daily-title">{trKey('daily_challenge', language)}</div>
                <div className="ev-daily-sub">
                  {selectedClass} • {selectedGroup} • +120 XP
                </div>
              </div>
              <button
                type="button"
                className="ev-icon-btn"
                onClick={() => setMobileSprintPopupOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="ev-seg">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((seg) => (
                <i key={seg} className={seg < todaySprintDoneSegs ? 'is-done' : ''} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="ev-btn ev-btn-primary"
                style={{ flex: 1 }}
                disabled={dailySprintPool.length === 0}
                onClick={handleLaunchDailySprint}
              >
                {dailySprintPool.length > 0
                  ? isBn
                    ? 'এখনই শুরু করো'
                    : 'Start Now'
                  : isBn
                  ? 'শীঘ্রই আসছে'
                  : 'Coming Soon'}
              </button>
              <button
                type="button"
                className="ev-btn ev-btn-secondary"
                onClick={() => setMobileSprintPopupOpen(false)}
              >
                {isBn ? 'বন্ধ করো' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mobileMoreOpen && (
        <div
          className="ev-modal-backdrop is-open"
          role="dialog"
          aria-modal="true"
          onClick={() => setMobileMoreOpen(false)}
        >
          <div className="ev-modal-panel" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="ev-section-header">
              <h3 className="ev-section-title">{isBn ? 'সকল ফিচার' : 'All Features'}</h3>
              <button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => setMobileMoreOpen(false)}>
                ✕
              </button>
            </div>
            <div className="ev-more-menu-grid">
              <button
                type="button"
                className="ev-more-menu-item"
                onClick={() => {
                  setMobileMoreOpen(false);
                  setMobileSprintPopupOpen(true);
                }}
              >
                <EvIcon name="zap" />
                <span>{trKey('daily_challenge', language)}</span>
              </button>

              {[
                { id: 'battle' as NavTabId, icon: 'zap', labelKey: 'nav_battle' },
                ...secondaryNav,
                { id: 'Analytics' as NavTabId, icon: 'chart', labelKey: 'nav_analytics' },
                { id: 'achievements' as NavTabId, icon: 'shield', labelKey: 'nav_achievements' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="ev-more-menu-item"
                  onClick={() => {
                    setSelectedSubjectId(null);
                    setActiveTab(item.id);
                    setMobileMoreOpen(false);
                  }}
                >
                  <EvIcon name={item.icon} />
                  <span>{trKey(item.labelKey as any, language)}</span>
                </button>
              ))}

              {isAdminUnlocked && (
                <button
                  type="button"
                  className="ev-more-menu-item"
                  onClick={() => {
                    setSelectedSubjectId(null);
                    setActiveTab('admin');
                    setMobileMoreOpen(false);
                  }}
                >
                  <EvIcon name="shield" />
                  <span>{isBn ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
                </button>
              )}

              <button
                type="button"
                className="ev-more-menu-item"
                onClick={() => {
                  setMobileMoreOpen(false);
                  setAuthModalOpen(true);
                }}
              >
                <EvIcon name="user" />
                <span>{isAuthenticated ? (isBn ? 'প্রোফাইল' : 'Profile') : isBn ? 'সাইন ইন' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                className="ev-more-menu-item"
                onClick={() => {
                  setMobileMoreOpen(false);
                  setSettingsModalOpen(true);
                }}
              >
                <EvIcon name="settings" />
                <span>{isBn ? 'সেটিংস' : 'Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal />
      <SettingsModal />
      <QuizRunnerModal />
    </>
  );
}

export default App;
