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
  FlameMiniSvg,
  HeroSketchSvg,
  LevelRingSvg,
  QuizRunnerModal,
  SettingsModal,
  SubjectSketchSvg,
} from './components/ModalsAndQuiz';
import { ExtraFeaturesView } from './components/ExtraFeatures';

const SUBJECT_THEME_MAP: Record<string, string> = {
  'phy-1': 'physics',
  'phy-2': 'physics',
  'ssc-phy': 'physics',
  'adm-sci': 'physics',
  'chem-1': 'chemistry',
  'chem-2': 'chemistry',
  'ssc-chem': 'chemistry',
  'math-1': 'math',
  'math-2': 'math',
  'stat-1': 'math',
  'stat-2': 'math',
  'ssc-math': 'math',
  'ssc-hmath': 'math',
  'bio-1': 'biology',
  'bio-2': 'biology',
  'agr-1': 'biology',
  'agr-2': 'biology',
  'ssc-bio': 'biology',
  'ssc-agr': 'biology',
  'ssc-gsci': 'biology',
  'adm-med': 'biology',
  'hsc-en-1': 'english',
  'hsc-en-2': 'english',
  'ssc-en-1': 'english',
  'ssc-en-2': 'english',
  'hsc-bn-1': 'bangla',
  'hsc-bn-2': 'bangla',
  'ssc-bn-1': 'bangla',
  'ssc-bn-2': 'bangla',
  'hsc-ict': 'ict',
  'ssc-ict': 'ict',
  'acc-1': 'accounting',
  'acc-2': 'accounting',
  'fin-1': 'accounting',
  'fin-2': 'accounting',
  'bom-1': 'accounting',
  'bom-2': 'accounting',
  'mkt-1': 'accounting',
  'mkt-2': 'accounting',
  'ssc-acc': 'accounting',
  'ssc-fin': 'accounting',
  'ssc-ent': 'accounting',
  'adm-com': 'accounting',
};

function getSubjectThemeAttr(subjId: string): string {
  return SUBJECT_THEME_MAP[subjId] || 'economics';
}

function getSubjectIconName(subjId: string): string {
  if (subjId.startsWith('phy') || subjId === 'ssc-phy') return 'zap';
  if (subjId.startsWith('chem') || subjId === 'ssc-chem') return 'layers';
  if (subjId.startsWith('math') || subjId.startsWith('stat') || subjId.includes('math')) return 'formula';
  if (subjId.startsWith('bio') || subjId.startsWith('agr') || subjId === 'ssc-bio' || subjId === 'adm-med') return 'shield';
  if (subjId.includes('ict')) return 'cloud';
  if (subjId.startsWith('acc') || subjId.startsWith('fin') || subjId === 'ssc-acc' || subjId === 'ssc-fin') return 'chart';
  if (subjId.startsWith('bom') || subjId.startsWith('mkt') || subjId === 'ssc-ent') return 'calendar';
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
  const usedIndices = new Set<number>();
  let attempts = 0;
  while (picked.length < count && attempts < count * 6) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const idx = seed % pool.length;
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
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
        setActiveTab('admin');
        return 0;
      }
      logoResetTimerRef.current = setTimeout(() => {
        setLogoTapCount(0);
      }, 2800);
      return next;
    });
    setSelectedSubjectId(null);
    if (activeTab !== 'admin') {
      setActiveTab('dashboard');
    }
  };

  const handleDismissMobileSprint = () => {
    setMobileSprintPopupOpen(false);
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

  const todayDailyExams = useMemo(
    () => examHistory.filter((h) => h.date === todayIso && (h.mode === 'daily' || h.mode === 'timed')),
    [examHistory, todayIso]
  );
  const todaySprintDoneSegs = useMemo(() => {
    if (todayDailyExams.length === 0) return 0;
    const bestToday = Math.max(...todayDailyExams.map((e) => Math.round((e.score / Math.max(1, e.total)) * 10)));
    return Math.min(10, Math.max(1, bestToday));
  }, [todayDailyExams]);

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
    const sprintQuestions = selectDailySprintQuestions(
      subjects,
      `${todayIso}-${selectedClass}-${selectedGroup}`,
      10
    );
    const firstWithMcqs = subjects.find((s) => s.chapters.some((c) => (c.mcqs?.length || 0) > 0)) || subjects[0];
    if (!firstWithMcqs || sprintQuestions.length === 0) return;
    startQuiz({
      mode: 'daily',
      examType: 'mcq',
      subjectId: firstWithMcqs.id,
      subjectName: { bn: 'ডেইলি মেরিট স্প্রিন্ট', en: 'Daily Merit Sprint' },
      chapterId: `daily-${todayIso}`,
      chapterName: {
        bn: `${selectedClass} • ${selectedGroup}`,
        en: `${selectedClass} • ${selectedGroup}`,
      },
      questions: sprintQuestions,
      cqs: [],
      durationSec: 450,
      negativeMarking: 0.25,
    });
    handleDismissMobileSprint();
  };

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

          <div className="ev-nav-section-label">{isBn ? 'মূল প্ল্যাটফর্ম' : 'Core Platform'}</div>
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
            {isBn ? 'স্টাডি ভল্ট ও টুলস' : 'Study Tools'}
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
                  <span>🔐 {isBn ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
                </span>
                {pendingReportsCount > 0 && <span className="ev-nav-count">{pendingReportsCount}</span>}
              </button>
            )}

            <button type="button" className="ev-nav-btn" onClick={() => setAuthModalOpen(true)}>
              <span className="ev-nav-btn-left">
                <EvIcon name="user" />
                <span>
                  {isAuthenticated
                    ? `${userName} (${isBn ? 'প্রোফাইল' : 'Profile'})`
                    : isBn
                    ? 'সাইন ইন / অ্যাকাউন্ট'
                    : 'Sign In / Account'}
                </span>
              </span>
            </button>

            <button type="button" className="ev-nav-btn" onClick={() => setSettingsModalOpen(true)}>
              <span className="ev-nav-btn-left">
                <EvIcon name="settings" />
                <span>{isBn ? 'সেটিংস ও ভাষা' : 'Settings'}</span>
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
                title="Switch Language"
              >
                {language === 'bn' ? 'বাংলা' : language === 'en' ? 'EN' : 'বাং+EN'}
              </button>

              <button type="button" className="ev-icon-btn" onClick={toggleDarkMode} title="Toggle Theme">
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
                      ← {isBn ? 'সব বিষয়ে ফিরে যাও' : 'Back to Subjects'}
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
                        📐 {isBn ? 'গাণিতিক সূত্র দেখো' : 'Math Formulas'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="ev-btn ev-btn-primary ev-btn-sm"
                      onClick={() => setActiveTab('battle')}
                    >
                      ⚔️ {isBn ? 'এই বিষয়ে 1v1 ব্যাটল' : '1v1 Battle'}
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
                            MCQ: {mcqCount}
                            {formulaCount > 0 ? ` • ${isBn ? 'সূত্র' : 'Formulas'}: ${formulaCount}` : ''}
                            {` • ${trKey('mastery', language)}: ${chapMastery}%`}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {formulaCount > 0 && (
                            <button
                              type="button"
                              className="ev-btn ev-btn-soft ev-btn-sm"
                              onClick={() => openSubjectFormulas(selectedSubject.id, chap.id)}
                            >
                              📐 {isBn ? `সূত্র (${formulaCount})` : `Formulas (${formulaCount})`}
                            </button>
                          )}

                          <button
                            type="button"
                            className={`ev-btn ${mcqCount > 0 ? 'ev-btn-primary' : 'ev-btn-secondary'} ev-btn-sm`}
                            disabled={mcqCount === 0}
                            onClick={() => handleLaunchSubjectPractice(selectedSubject, idx, 'mcq')}
                          >
                            {mcqCount > 0 ? `⚡ MCQ (${mcqCount})` : isBn ? 'শীঘ্রই আসছে' : 'Soon'}
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
                    {/* Compact Notepad Rank Card matching Screenshot 1 */}
                    <div className="ev-card ev-hero">
                      <HeroSketchSvg />

                      <div className="ev-hero-main">
                        <div className="ev-hero-ring">
                          <LevelRingSvg size={78} strokeWidth={6} pct={rank.progressPct} />
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

                          <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', marginTop: 2 }}>
                            <select
                              className="ev-select"
                              style={{ width: 'auto', minHeight: 32, padding: '0 8px', fontSize: 12.5, fontWeight: 700 }}
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
                              style={{ width: 'auto', flex: 1, minWidth: 0, minHeight: 32, padding: '0 8px', fontSize: 12.5, fontWeight: 700 }}
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
                          <div className="ev-xp-ruler-fill" style={{ width: `${Math.max(5, rank.progressPct)}%` }} />
                        </div>
                        <div className="ev-xp-caption">
                          <span>{xp} XP</span>
                          <span>
                            {trKey('accuracy', language)}: {rank.accuracyPct}% • {rank.rankScore}/{rank.nextTierScore} RP
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Daily Merit Sprint Card */}
                    <div className="ev-card ev-daily-card ev-daily-inline">
                      <div className="ev-daily-head">
                        <div className="ev-daily-ic">
                          <EvIcon name="zap" size={24} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="ev-daily-title">{trKey('daily_challenge', language)}</div>
                          <div className="ev-daily-sub">10 MCQs • {selectedClass}</div>
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
                          onClick={handleLaunchDailySprint}
                        >
                          🚀 {isBn ? 'স্প্রিন্ট শুরু করো' : 'Start Sprint'}
                        </button>
                        <button type="button" className="ev-btn ev-btn-secondary" onClick={() => setActiveTab('battle')}>
                          ⚔️ 1v1
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
                            <span className="ev-mcq-pill">{rawTotalMcqs} MCQs</span>
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
          onClick={handleDismissMobileSprint}
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
                onClick={handleDismissMobileSprint}
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
              <button type="button" className="ev-btn ev-btn-primary" style={{ flex: 1 }} onClick={handleLaunchDailySprint}>
                🚀 {isBn ? 'এখনই শুরু করো' : 'Start Now'}
              </button>
              <button type="button" className="ev-btn ev-btn-secondary" onClick={handleDismissMobileSprint}>
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
              <h3 className="ev-section-title">✨ {isBn ? 'সকল ফিচারসমূহ' : 'All Features'}</h3>
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
                <span>⚡ {trKey('daily_challenge', language)}</span>
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
                  <span>🔐 {isBn ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
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
                <span>{isAuthenticated ? (isBn ? 'আমার প্রোফাইল' : 'My Profile') : isBn ? 'সাইন ইন / লগইন' : 'Sign In'}</span>
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
                <span>{isBn ? 'সেটিংস ও ভাষা' : 'Settings'}</span>
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
