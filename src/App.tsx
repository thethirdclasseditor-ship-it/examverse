import React, { useEffect, useState } from 'react';
import {
  NavTabId,
  getAvailableClasses,
  getAvailableGroups,
  getLevelProgress,
  getSubjectsForSelection,
  trKey,
  trText,
  useExamStore,
} from './store/useExamStore';
import { SubjectData } from './types';
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
  if (id.includes('math')) return 'math';
  if (id.includes('bio')) return 'biology';
  if (id.includes('eng')) return 'english';
  if (id.includes('ban')) return 'bangla';
  if (id.includes('ict')) return 'ict';
  if (id.includes('acc') || id.includes('fin') || id.includes('bom') || id.includes('pmm')) return 'accounting';
  if (id.includes('eco') || id.includes('civ') || id.includes('his')) return 'economics';
  return 'physics';
}

function getSubjectIconName(subjId: string): string {
  const id = subjId.toLowerCase();
  if (id.includes('phy')) return 'zap';
  if (id.includes('chem')) return 'layers';
  if (id.includes('math')) return 'formula';
  if (id.includes('bio')) return 'shield';
  if (id.includes('ict')) return 'cloud';
  if (id.includes('acc') || id.includes('fin')) return 'chart';
  if (id.includes('bom') || id.includes('pmm')) return 'calendar';
  if (id.includes('ban') || id.includes('eng')) return 'book';
  return 'book';
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
    userName,
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

  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [mobileSprintPopupOpen, setMobileSprintPopupOpen] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') setActiveTab('admin');
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setActiveTab('admin');
      }
    };
    window.addEventListener('keydown', onKeyDown);

    if (window.innerWidth <= 820 && !window.sessionStorage.getItem('ev_sprint_dismissed')) {
      setMobileSprintPopupOpen(true);
    }

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [setActiveTab]);

  const handleBrandLogoClick = () => {
    const next = logoTapCount + 1;
    if (next >= 5) {
      setLogoTapCount(0);
      setActiveTab('admin');
    } else {
      setLogoTapCount(next);
      setSelectedSubject(null);
      setActiveTab('dashboard');
    }
  };

  const handleDismissMobileSprint = () => {
    window.sessionStorage.setItem('ev_sprint_dismissed', '1');
    setMobileSprintPopupOpen(false);
  };

  const isBn = language !== 'en';
  const rank = getRankInfo();
  const lvInfo = getLevelProgress(xp);

  const classList = getAvailableClasses();
  const groupList = getAvailableGroups(selectedClass);
  const subjects: SubjectData[] = getSubjectsForSelection(selectedClass, selectedGroup);

  const pendingMistakesCount = mistakes.filter((m) => !m.mastered).length;
  const pendingReportsCount = questionReports.filter((r) => r.status === 'pending').length;

  const primaryNav: { id: NavTabId; icon: string; labelKey: string; count?: number }[] = [
    { id: 'dashboard', icon: 'home', labelKey: 'nav_dashboard' },
    { id: 'subjects', icon: 'book', labelKey: 'nav_subjects', count: subjects.length },
    { id: 'leaderboard', icon: 'trophy', labelKey: 'nav_leaderboard' },
    { id: 'Analytics', icon: 'chart', labelKey: 'nav_analytics' },
    { id: 'achievements', icon: 'shield', labelKey: 'nav_achievements' },
  ];

  const secondaryNav: { id: NavTabId; icon: string; labelKey: string; count?: number }[] = [
    { id: 'formulas', icon: 'formula', labelKey: 'nav_formulas' },
    { id: 'battle', icon: 'zap', labelKey: 'nav_battle' },
    { id: 'mistakes', icon: 'alert', labelKey: 'nav_mistakes', count: pendingMistakesCount || undefined },
    { id: 'flashcards', icon: 'layers', labelKey: 'nav_flashcards' },
    { id: 'planner', icon: 'calendar', labelKey: 'nav_planner' },
    { id: 'community', icon: 'message', labelKey: 'nav_community' },
  ];

  const handleLaunchSubjectPractice = (subj: SubjectData, chapterIdx = 0, examType: 'mcq' | 'cq' = 'mcq') => {
    const chap = subj.chapters[chapterIdx] || subj.chapters[0];
    if (!chap) return;
    startQuiz({
      mode: 'practice',
      examType,
      subjectId: subj.id,
      subjectName: subj.name,
      chapterId: chap.id,
      chapterName: chap.name,
      questions: chap.mcqs || [],
      cqs: chap.cqs || [],
      durationSec: Math.max(300, (chap.mcqs?.length || 10) * 45),
      negativeMarking: 0,
    });
  };

  const handleLaunchDailySprint = () => {
    const allMcqs = subjects.flatMap((s) => s.chapters.flatMap((c) => c.mcqs || []));
    const firstWithMcqs = subjects.find((s) => s.chapters.some((c) => (c.mcqs?.length || 0) > 0)) || subjects[0];
    if (!firstWithMcqs) return;
    startQuiz({
      mode: 'timed',
      examType: 'mcq',
      subjectId: firstWithMcqs.id,
      subjectName: { bn: 'ডেইলি মেরিট স্প্রিন্ট', en: 'Daily Merit Sprint' },
      chapterId: firstWithMcqs.chapters[0]?.id || 'daily',
      chapterName: { bn: `${selectedClass} • ${selectedGroup}`, en: `${selectedClass} • ${selectedGroup}` },
      questions: allMcqs.slice(0, 10),
      cqs: [],
      durationSec: 450,
      negativeMarking: 0.25,
    });
    setMobileSprintPopupOpen(false);
  };

  const weekDaysBn = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];
  const weekDaysEn = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const userInitials = (userName || 'S').slice(0, 2).toUpperCase();

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
                    setSelectedSubject(null);
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
                    setSelectedSubject(null);
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
                  setSelectedSubject(null);
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
                <EvIcon name="cloud" />
                <span>{isAuthenticated ? userName : isBn ? 'ক্লাউড সাইন ইন' : 'Cloud Sign In'}</span>
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

              <button type="button" className="ev-profile-trigger" onClick={() => setAuthModalOpen(true)}>
                <span className="ev-avatar-ring">
                  <LevelRingSvg size={38} strokeWidth={3} pct={lvInfo.progressPercent} />
                  <span className="ev-avatar-sm">{userInitials}</span>
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
                      onClick={() => setSelectedSubject(null)}
                    >
                      ← {isBn ? 'সব বিষয়ে ফিরে যাও' : 'Back to Subjects'}
                    </button>
                    <h2 className="ev-section-title">
                      {trText(selectedSubject.name, language)}
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="ev-btn ev-btn-soft ev-btn-sm"
                    onClick={() => {
                      setSelectedSubject(null);
                      setActiveTab('formulas');
                    }}
                  >
                    📐 {isBn ? 'অধ্যায়ভিত্তিক সূত্র দেখো' : 'Chapter Formulas'}
                  </button>
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
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                            {idx + 1}. {trText(chap.name, language)}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
                            MCQ: {mcqCount} • {isBn ? 'সূত্র' : 'Formulas'}: {formulaCount} • {trKey('mastery', language)}: {chapMastery}%
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="ev-btn ev-btn-soft ev-btn-sm"
                            onClick={() => {
                              setSelectedSubject(null);
                              setActiveTab('formulas');
                            }}
                          >
                            📐 {isBn ? `সূত্র (${formulaCount})` : `Formulas (${formulaCount})`}
                          </button>

                          <button
                            type="button"
                            className="ev-btn ev-btn-primary ev-btn-sm"
                            onClick={() => handleLaunchSubjectPractice(selectedSubject, idx, 'mcq')}
                          >
                            ⚡ MCQ ({mcqCount})
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
                    {/* Compact Notepad Rank & Streak Card */}
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
                                const firstGrp = getAvailableGroups(nextCls)[0] || 'Science';
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
                            const isLit = i < Math.min(7, streak);
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

                    {/* Desktop Daily Merit Sprint Card (Hidden inline on mobile; shown as popup modal on mobile!) */}
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
                          <i key={seg} className={seg < Math.min(10, examHistory.length * 2) ? 'is-done' : ''} />
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" className="ev-btn ev-btn-primary" style={{ flex: 1 }} onClick={handleLaunchDailySprint}>
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
                  <div className="ev-section-header">
                    <h2 className="ev-section-title">
                      {trKey('all_subjects', language)} ({subjects.length})
                    </h2>
                    <button type="button" className="ev-section-link" onClick={() => setActiveTab('formulas')}>
                      📐 {isBn ? 'সূত্রসমূহ →' : 'Formulas →'}
                    </button>
                  </div>

                  <div className="ev-grid-4">
                    {subjects.map((subj) => {
                      const subjAttr = getSubjectThemeAttr(subj.id);
                      const iconName = getSubjectIconName(subj.id);
                      const totalMcqs = subj.chapters.reduce((sum, c) => sum + (c.mcqs?.length || 0), 0);
                      const subjMastery = Math.min(
                        100,
                        Math.round(
                          subj.chapters.reduce((acc, c) => acc + (chapterMastery[c.id] || 0), 0) /
                            Math.max(1, subj.chapters.length)
                        )
                      );

                      return (
                        <div
                          key={subj.id}
                          className="ev-card ev-card-interactive ev-subject-card"
                          data-subj={subjAttr}
                          onClick={() => setSelectedSubject(subj)}
                        >
                          <div className="ev-subject-top">
                            <div className="ev-subject-icon-box" data-subj={subjAttr}>
                              <EvIcon name={iconName} size={20} />
                            </div>
                            <span className="ev-mcq-pill">{totalMcqs} MCQs</span>
                          </div>

                          <div className="ev-subject-names">
                            <div className="ev-subject-name">{subj.name.bn}</div>
                            <div className="ev-subject-name-bn">{subj.name.en}</div>
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
            setSelectedSubject(null);
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
            setSelectedSubject(null);
            setActiveTab('subjects');
          }}
        >
          <EvIcon name="book" />
          <span>{isBn ? 'বিষয়' : 'Subjects'}</span>
        </button>

        <button
          type="button"
          className={`ev-bottom-nav-btn ${activeTab === 'formulas' ? 'is-active' : ''}`}
          onClick={() => {
            setSelectedSubject(null);
            setActiveTab('formulas');
          }}
        >
          <EvIcon name="formula" />
          <span>{isBn ? 'সূত্রসমূহ' : 'Formulas'}</span>
        </button>

        <button
          type="button"
          className={`ev-bottom-nav-btn ${activeTab === 'leaderboard' ? 'is-active' : ''}`}
          onClick={() => {
            setSelectedSubject(null);
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

      {/* Mobile Dismissible "Daily Merit Sprint" Popup Card with ✕ Close Button */}
      {mobileSprintPopupOpen && (
        <div className="ev-modal-backdrop is-open" onClick={handleDismissMobileSprint}>
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
                <i key={seg} className={seg < Math.min(10, examHistory.length * 2) ? 'is-done' : ''} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="ev-btn ev-btn-primary" style={{ flex: 1 }} onClick={handleLaunchDailySprint}>
                🚀 {isBn ? 'এখনই শুরু করো' : 'Start Now'}
              </button>
              <button type="button" className="ev-btn ev-btn-secondary" onClick={handleDismissMobileSprint}>
                {isBn ? 'কেটে দিন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mobileMoreOpen && (
        <div className="ev-modal-backdrop is-open" onClick={() => setMobileMoreOpen(false)}>
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
                ...secondaryNav,
                { id: 'Analytics' as NavTabId, icon: 'chart', labelKey: 'nav_analytics' },
                { id: 'achievements' as NavTabId, icon: 'shield', labelKey: 'nav_achievements' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="ev-more-menu-item"
                  onClick={() => {
                    setSelectedSubject(null);
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
                    setSelectedSubject(null);
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
