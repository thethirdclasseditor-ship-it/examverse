import React, { useState } from 'react';
import {
  NavTabId,
  getAvailableClasses,
  getAvailableGroups,
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
    streak,
    xp,
    examHistory,
    mistakes,
    chapterMastery,
    setAuthModalOpen,
    setSettingsModalOpen,
    startQuiz,
    getRankInfo,
  } = useExamStore();

  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const isBn = language !== 'en';
  const rank = getRankInfo();

  const classList = getAvailableClasses();
  const groupList = getAvailableGroups(selectedClass);
  const subjects: SubjectData[] = getSubjectsForSelection(selectedClass, selectedGroup);

  const pendingMistakesCount = mistakes.filter((m) => !m.mastered).length;
  const firstName = (userName || 'Scholar').split(' ')[0];
  const initials = firstName.slice(0, 2).toUpperCase();

  const primaryNav: { id: NavTabId; icon: string; labelKey: string; badge?: number }[] = [
    { id: 'dashboard', icon: 'home', labelKey: 'nav_dashboard' },
    { id: 'subjects', icon: 'subjects', labelKey: 'nav_subjects', badge: subjects.length },
    { id: 'leaderboard', icon: 'leaderboard', labelKey: 'nav_leaderboard' },
    { id: 'Analytics', icon: 'analytics', labelKey: 'nav_analytics' },
    { id: 'achievements', icon: 'achievements', labelKey: 'nav_achievements' },
  ];

  const studyVaultNav: { id: NavTabId; icon: string; labelKey: string; badge?: number }[] = [
    { id: 'mistakes', icon: 'mistakes', labelKey: 'nav_mistakes', badge: pendingMistakesCount || undefined },
    { id: 'flashcards', icon: 'book', labelKey: 'nav_flashcards' },
    { id: 'formulas', icon: 'math', labelKey: 'nav_formulas' },
    { id: 'planner', icon: 'subjects', labelKey: 'nav_planner' },
    { id: 'battle', icon: 'bolt', labelKey: 'nav_battle' },
    { id: 'community', icon: 'eng', labelKey: 'nav_community' },
  ];

  const handleLaunchSubjectPractice = (
    subj: SubjectData,
    chapterIdx = 0,
    examType: 'mcq' | 'cq' = 'mcq',
    mode: 'practice' | 'timed' = 'practice'
  ) => {
    const chap = subj.chapters[chapterIdx] || subj.chapters[0];
    if (!chap) return;
    startQuiz({
      mode,
      examType,
      subjectId: subj.id,
      subjectName: subj.name,
      chapterId: chap.id,
      chapterName: chap.name,
      questions: chap.mcqs || [],
      cqs: chap.cqs || [],
      durationSec: Math.max(300, (chap.mcqs?.length || 10) * 45),
      negativeMarking: mode === 'timed' ? 0.25 : 0,
    });
  };

  // Build 7-day flame chain for the Notepad Hero Card
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const litCount = Math.min(7, Math.max(1, streak));
  const sevenDayChain = Array.from({ length: 7 }).map((_, idx) => {
    const offset = 6 - idx;
    const d = new Date(Date.now() - offset * 86400000);
    const isLit = offset < litCount;
    const isToday = offset === 0;
    return {
      key: idx,
      label: dayNames[d.getDay()],
      isLit,
      isToday,
    };
  });

  // Curated Model Sets for Homepage
  const recommendedPacks = [
    {
      id: 'pack-stem',
      badge: isBn ? 'বিজ্ঞান • Science' : 'Science Track',
      title: isBn ? 'বিজ্ঞান বিভাগ স্পেশাল মডেল টেস্ট' : 'Science STEM Diagnostic Set',
      sub: isBn ? 'পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞান' : 'Physics, Chemistry, Higher Math & Biology',
      subj: subjects[0],
    },
    {
      id: 'pack-bcs',
      badge: isBn ? 'ভর্তি ও বিসিএস (-0.25)' : 'Admission & BCS',
      title: isBn ? 'বিশ্ববিদ্যালয় ও মেডিকেল মেরিট সেট' : 'University & Medical Merit Set',
      sub: isBn ? 'বহুপদী (i, ii, iii) ও বোর্ড স্ট্যান্ডার্ড প্রশ্ন' : 'Multi-statement & high-yield board MCQs',
      subj: subjects[1] || subjects[0],
    },
    {
      id: 'pack-cq',
      badge: isBn ? 'সৃজনশীল • 10 Marks' : 'Creative CQ',
      title: isBn ? 'বোর্ড সৃজনশীল (CQ) ও রুব্রিক অনুশীলন' : 'Board Creative Question (CQ) Bank',
      sub: isBn ? 'উদ্দীপক + ক, খ, গ, ঘ নমুনা উত্তরসহ' : 'Full stems with step-by-step model solutions',
      subj: subjects[0],
      isCq: true,
    },
  ];

  return (
    <>
      {/* =========================================================
          1. NOTEBOOK PAPER BACKGROUND DOODLES & GLOBAL SVG DEFS
          ========================================================= */}
      <div className="ev-bg-art" aria-hidden="true">
        <svg className="ev-doodle ev-doodle-book" viewBox="0 0 200 200">
          <g>
            <path d="M100 58C80 44 48 42 24 50v94c24-8 56-6 76 8 20-14 52-16 76-8V50c-24-8-56-6-76 8z" />
            <path d="M100 58v94" />
            <path d="M38 68c17-4 38-3 54 5M38 86c17-4 38-3 54 5M38 104c17-4 38-3 54 5" />
            <path d="M108 73c16-8 37-9 54-5M108 91c16-8 37-9 54-5" />
          </g>
        </svg>
        <svg className="ev-doodle ev-doodle-pencil" viewBox="0 0 200 200">
          <g>
            <path d="M28 88h112v24H28z" />
            <path d="M140 88l26 12-26 12" />
            <path d="M52 88v24M58 88v24" />
          </g>
        </svg>
        <svg className="ev-doodle ev-doodle-kolom" viewBox="0 0 200 200">
          <g>
            <path d="M100 26l24 52-24 64-24-64z" />
            <path d="M100 54v50" />
            <circle cx="100" cy="72" r="4.5" />
          </g>
        </svg>
        <svg className="ev-doodle ev-doodle-notebook" viewBox="0 0 200 200">
          <g>
            <path d="M54 28h102a8 8 0 0 1 8 8v132a8 8 0 0 1-8 8H54a8 8 0 0 1-8-8V36a8 8 0 0 1 8-8z" />
            <path d="M36 52h22M36 72h22M36 92h22M36 112h22" />
            <path d="M74 60h74M74 80h74M74 100h74" />
          </g>
        </svg>
        <svg className="ev-doodle ev-doodle-cap" viewBox="0 0 200 200">
          <g>
            <path d="M100 48L22 84l78 36 78-36z" />
            <path d="M58 104v36c0 14 84 14 84 0v-36" />
          </g>
        </svg>
        <svg className="ev-doodle ev-doodle-ruler" viewBox="0 0 200 200">
          <g>
            <path d="M24 74h152v40H24z" />
            <path d="M40 74v14M56 74v9M72 74v14M88 74v9M104 74v14M120 74v9M136 74v14" />
          </g>
        </svg>
      </div>

      {/* Shared SVG Gradients for Flame & Ring */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="evFlameGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FBBF24" />
            <stop offset="0.55" stopColor="#F97316" />
            <stop offset="1" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="evRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6366F1" />
            <stop offset="0.6" stopColor="#A855F7" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>

      <div className="ev-app-shell">
        {/* =========================================================
            2. LIQUID GLASS DESKTOP SIDEBAR WITH MINIMALIST SVG ICONS
            ========================================================= */}
        <aside className="ev-sidebar" aria-label="Main Sidebar Navigation">
          <button
            type="button"
            className="ev-brand"
            onClick={() => {
              setSelectedSubject(null);
              setActiveTab('dashboard');
            }}
          >
            <ExamVerseLogo size={40} />
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
                    <EvIcon name={item.icon} size={19} />
                    <span>{trKey(item.labelKey as any, language)}</span>
                  </span>
                  {item.badge ? <span className="ev-nav-count">{item.badge}</span> : null}
                </button>
              </li>
            ))}
          </ul>

          <div className="ev-nav-section-label" style={{ marginTop: '0.75rem' }}>
            {isBn ? 'স্টাডি ভল্ট ও টুলস' : 'Study Vault'}
          </div>
          <ul className="ev-nav-list">
            {studyVaultNav.map((item) => (
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
                    <EvIcon name={item.icon} size={19} />
                    <span>{trKey(item.labelKey as any, language)}</span>
                  </span>
                  {item.badge ? <span className="ev-nav-count">{item.badge}</span> : null}
                </button>
              </li>
            ))}
          </ul>

          <div className="ev-sidebar-footer">
            <button type="button" className="ev-nav-btn" onClick={() => setAuthModalOpen(true)}>
              <span className="ev-nav-btn-left">
                <EvIcon name="cloud" size={19} />
                <span>{isAuthenticated ? firstName : isBn ? 'ক্লাউড সাইন ইন' : 'Cloud Sync & Login'}</span>
              </span>
            </button>
            <button type="button" className="ev-nav-btn" onClick={() => setSettingsModalOpen(true)}>
              <span className="ev-nav-btn-left">
                <EvIcon name="settings" size={19} />
                <span>{isBn ? 'সেটিংস ও ভাষা' : 'Settings'}</span>
              </span>
            </button>
          </div>
        </aside>

        {/* =========================================================
            3. MAIN WRAPPER (Liquid Glass Topbar + Dynamic Content)
            ========================================================= */}
        <div className="ev-main-wrapper">
          <header className="ev-topbar">
            <div className="ev-topbar-left">
              <button
                type="button"
                className="ev-mobile-logo"
                onClick={() => {
                  setSelectedSubject(null);
                  setActiveTab('dashboard');
                }}
              >
                <ExamVerseLogo size={34} />
                <span style={{ fontWeight: 800, fontSize: '1.02rem' }}>ExamVerse</span>
              </button>

              <div className="ev-greeting-wrap">
                <div className="ev-greeting-title">
                  {trKey('welcome_back', language)}, {firstName}
                </div>
                <div className="ev-greeting-sub">
                  <span className="ev-breadcrumb-pill">
                    {isBn ? rank.fullTitleBn : rank.fullTitleEn}
                  </span>
                  <span className="ev-badge-pill ev-badge-neutral" style={{ padding: '0.08rem 0.45rem', fontSize: '0.68rem' }}>
                    {selectedClass} • {selectedGroup}
                  </span>
                </div>
              </div>
            </div>

            <div className="ev-topbar-right">
              {/* Glowing Flame Streak Pill */}
              <button
                type="button"
                className="ev-streak-pill is-active"
                onClick={() => setActiveTab('achievements')}
                title="Active Study Streak"
              >
                <svg className="ev-flame-svg" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="url(#evFlameGrad)"
                    d="M12.6 1.8c.5 3.3 4.9 5.6 4.9 10.6a5.5 5.5 0 0 1-11 0c0-2 .9-3.6 2-4.8.3 1.5 1.1 2.4 2 2.7C10 7.6 10.9 4.6 12.6 1.8z"
                  />
                  <path
                    fill="#FFF3C4"
                    d="M12 21a3.2 3.2 0 0 0 3.2-3.2c0-2-3.2-4.6-3.2-4.6s-3.2 2.6-3.2 4.6A3.2 3.2 0 0 0 12 21z"
                  />
                </svg>
                <span>{streak}d</span>
              </button>

              {/* Language Switcher */}
              <button
                type="button"
                className="ev-icon-btn"
                style={{ width: 'auto', padding: '0 10px' }}
                onClick={() =>
                  setLanguage(language === 'bn' ? 'en' : language === 'en' ? 'bilingual' : 'bn')
                }
                title="Switch Language"
              >
                {language === 'bn' ? 'বাংলা' : language === 'en' ? 'EN' : 'বাং+EN'}
              </button>

              {/* Theme Switch Button */}
              <button
                type="button"
                className="ev-icon-btn"
                onClick={toggleDarkMode}
                title="Switch Light / Dark Theme"
              >
                {darkMode ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>

              {/* Avatar Ring Profile Trigger */}
              <button
                type="button"
                className="ev-profile-trigger"
                onClick={() => setAuthModalOpen(true)}
                title="Profile & Cloud Login"
              >
                <span className="ev-avatar-ring">
                  <LevelRingSvg pct={rank.progressPct} size={38} stroke={3} />
                  <span className="ev-avatar-sm">{initials}</span>
                  <span className="ev-avatar-lv">{rank.division}</span>
                </span>
                <span className="ev-profile-trigger-name">
                  {isAuthenticated ? firstName : trKey('sign_in', language)}
                </span>
              </button>
            </div>
          </header>

          {/* =========================================================
              4. DYNAMIC MAIN CONTENT
              ========================================================= */}
          <main className="ev-content-area">
            <div className="ev-view-animate">
              {activeTab !== 'dashboard' && activeTab !== 'subjects' ? (
                <ExtraFeaturesView />
              ) : selectedSubject ? (
                /* =========================================================
                   SELECTED SUBJECT CHAPTER TREE VIEW
                   ========================================================= */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 10 }}>
                    <button
                      type="button"
                      className="ev-btn ev-btn-secondary ev-btn-sm"
                      onClick={() => setSelectedSubject(null)}
                    >
                      ← {isBn ? 'সব বিষয়ে ফিরে যাও' : 'Back to All Subjects'}
                    </button>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="ev-btn ev-btn-soft ev-btn-sm"
                        onClick={() => handleLaunchSubjectPractice(selectedSubject, 0, 'mcq', 'practice')}
                      >
                        Practice All Chapters
                      </button>
                      <button
                        type="button"
                        className="ev-btn ev-btn-primary ev-btn-sm"
                        onClick={() => handleLaunchSubjectPractice(selectedSubject, 0, 'mcq', 'timed')}
                      >
                        Start Timed Subject Exam
                      </button>
                    </div>
                  </div>

                  <div className="ev-card" data-subj={selectedSubject.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div className="ev-subject-icon-box" data-subj={selectedSubject.id}>
                        <EvIcon name={selectedSubject.id} size={26} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                          {trText(selectedSubject.name, language)}
                        </h2>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {selectedSubject.chapters.length} {trKey('chapters_count', language)} • Standard & Multi-Statement (i, ii, iii) MCQs + Creative CQs
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selectedSubject.chapters.map((chap, idx) => {
                        const chapMastery = chapterMastery[chap.id] || 0;
                        return (
                          <div
                            key={chap.id}
                            style={{
                              padding: '0.95rem 1.1rem',
                              borderRadius: 14,
                              background: 'var(--bg-surface-hover)',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 12,
                              flexWrap: 'wrap',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="ev-badge-pill ev-badge-neutral">Ch {idx + 1}</span>
                                <span style={{ fontWeight: 800, fontSize: '0.96rem' }}>
                                  {trText(chap.name, language)}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                {chap.mcqs?.length || 0} Verified MCQs • {chap.cqs?.length || 0} Creative CQs •{' '}
                                <strong>{chapMastery}% Mastery</strong>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="ev-btn ev-btn-soft ev-btn-sm"
                                onClick={() =>
                                  handleLaunchSubjectPractice(selectedSubject, idx, 'mcq', 'practice')
                                }
                              >
                                Practice
                              </button>
                              <button
                                type="button"
                                className="ev-btn ev-btn-primary ev-btn-sm"
                                onClick={() =>
                                  handleLaunchSubjectPractice(selectedSubject, idx, 'mcq', 'timed')
                                }
                              >
                                Exam Mode
                              </button>
                              {chap.cqs && chap.cqs.length > 0 && (
                                <button
                                  type="button"
                                  className="ev-btn ev-btn-secondary ev-btn-sm"
                                  onClick={() =>
                                    handleLaunchSubjectPractice(selectedSubject, idx, 'cq', 'practice')
                                  }
                                >
                                  সৃজনশীল (CQ)
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* =========================================================
                   HOMEPAGE DASHBOARD & SUBJECTS VIEW
                   ========================================================= */
                <>
                  {activeTab === 'dashboard' && (
                    <>
                      {/* TOP HERO GRID: Notepad Rank Scholar Card + Daily Merit Sprint */}
                      <div className="ev-home-top-grid">
                        {/* Left: Notepad Binding-Hole Hero Card */}
                        <div className="ev-card ev-hero">
                          <HeroSketchSvg />

                          <div className="ev-hero-main">
                            <div className="ev-hero-ring">
                              <LevelRingSvg pct={rank.progressPct} size={108} stroke={9} />
                              <div className="ev-hero-ring-num">
                                <small>{rank.tierNameEn}</small>
                                <b>{rank.division}</b>
                              </div>
                            </div>

                            <div className="ev-hero-copy">
                              <span
                                className="ev-badge-pill"
                                style={{ background: rank.bgSoft, color: rank.colorHex }}
                              >
                                {isBn ? rank.fullTitleBn : rank.fullTitleEn} • {selectedClass} ({selectedGroup})
                              </span>
                              <h1 className="ev-hero-title">
                                {Math.max(0, rank.nextTierScore - rank.rankScore)} RP to Next Rank Tier
                              </h1>
                              <div className="ev-hero-sub">
                                <b className="font-mono">{xp.toLocaleString()} XP</b> • Accuracy{' '}
                                <b>{rank.accuracyPct}%</b> • Mastery <b>{rank.masteryPct}%</b>
                              </div>
                            </div>
                          </div>

                          {/* 10%-Ticked XP & Rank Ruler */}
                          <div>
                            <div className="ev-xp-ruler">
                              <div
                                className="ev-xp-ruler-fill"
                                style={{ width: `${rank.progressPct}%` }}
                              />
                            </div>
                            <div className="ev-xp-caption">
                              <span>Bronze → Silver → Gold → Platinum → Elite</span>
                              <span>
                                {rank.rankScore} / {rank.nextTierScore} RP ({rank.progressPct}%)
                              </span>
                            </div>
                          </div>

                          {/* 7-Day Flame Streak Strip */}
                          <div className="ev-streak-strip">
                            <div className="ev-streak-lead">
                              <FlameBigSvg />
                              <div>
                                <div className="ev-streak-num">
                                  {streak} {streak === 1 ? 'day' : 'days'}
                                </div>
                                <div className="ev-streak-lab">
                                  {isBn ? 'ধারাবাহিক স্ট্রিক সচল আছে!' : 'Streak is alive & burning!'}
                                </div>
                              </div>
                            </div>

                            <div className="ev-wk">
                              {sevenDayChain.map((d) => (
                                <span
                                  key={d.key}
                                  className={`ev-wk-day ${d.isLit ? 'is-lit' : ''} ${
                                    d.isToday ? 'is-today' : ''
                                  }`}
                                >
                                  <i>
                                    <FlameMiniSvg />
                                  </i>
                                  <em>{d.label}</em>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right: Daily Merit Sprint Featured Card */}
                        <div className="ev-card ev-daily-card">
                          <div className="ev-daily-head">
                            <div className="ev-daily-ic">
                              <EvIcon name="bolt" size={26} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="ev-daily-title">
                                {isBn ? 'ডেইলি মেরিট স্প্রিন্ট' : 'Daily Merit Sprint'}
                              </div>
                              <div className="ev-daily-sub">
                                {new Date().toISOString().slice(0, 10)} • 8 Curated MCQs
                              </div>
                            </div>
                            <span className="ev-xp-chip">
                              <EvIcon name="coin" size={15} />
                              <span>+150 XP</span>
                            </span>
                          </div>

                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                            {isBn
                              ? 'প্রতিদিনের বাছাইকৃত ৮টি বোর্ড ও ভর্তি স্ট্যান্ডার্ড প্রশ্নের উত্তর দিয়ে অতিরিক্ত +১৫০ বোনাস XP এবং স্ট্রিক ধরে রাখো।'
                              : 'Solve 8 interdisciplinary questions across subjects to claim today’s +150 XP bonus.'}
                          </p>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                              <span>{isBn ? 'আজকের অগ্রগতি' : 'Daily progress'}</span>
                              <span>5 / 8 Completed</span>
                            </div>
                            <div className="ev-seg" style={{ marginBottom: '0.95rem' }}>
                              {Array.from({ length: 8 }).map((_, i) => (
                                <i key={i} className={i < 5 ? 'is-done' : ''} />
                              ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.55rem' }}>
                              <button
                                type="button"
                                className="ev-btn ev-btn-primary"
                                style={{ flex: 1 }}
                                onClick={() => {
                                  if (subjects[0]) handleLaunchSubjectPractice(subjects[0], 0, 'mcq', 'timed');
                                }}
                              >
                                {isBn ? 'চ্যালেঞ্জ শুরু করো' : 'Start Challenge'}
                              </button>
                              <button
                                type="button"
                                className="ev-btn ev-btn-secondary"
                                onClick={() => {
                                  if (subjects[0]) handleLaunchSubjectPractice(subjects[0], 0, 'mcq', 'practice');
                                }}
                              >
                                {isBn ? 'প্র্যাকটিস' : 'Practice'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CONTINUE LEARNING & TRACK SELECTOR */}
                      <div style={{ marginBottom: '1.65rem' }}>
                        <div className="ev-section-header">
                          <h3 className="ev-section-title">
                            {isBn ? 'পড়াশোনা চালিয়ে যাও (Continue Learning)' : 'Continue Learning & Exam Tools'}
                          </h3>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <select
                              value={selectedClass}
                              onChange={(e) => setClassAndGroup(e.target.value, selectedGroup)}
                              style={{
                                height: 36,
                                padding: '0 10px',
                                borderRadius: 10,
                                border: '1px solid var(--border-default)',
                                background: 'var(--bg-surface)',
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              {classList.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>

                            <select
                              value={selectedGroup}
                              onChange={(e) => setClassAndGroup(selectedClass, e.target.value)}
                              style={{
                                height: 36,
                                padding: '0 10px',
                                borderRadius: 10,
                                border: '1px solid var(--border-default)',
                                background: 'var(--bg-surface)',
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              {groupList.map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {subjects[0] && (
                          <div
                            className="ev-card"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '1.25rem',
                              flexWrap: 'wrap',
                              padding: '1.15rem 1.3rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem', flex: 1, minWidth: 240 }}>
                              <div className="ev-subject-icon-box" data-subj={subjects[0].id}>
                                <EvIcon name={subjects[0].id} size={25} />
                              </div>
                              <div style={{ flex: 1, minWidth: 180 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 3, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.98rem', fontWeight: 800 }}>
                                    {trText(subjects[0].name, language)} —{' '}
                                    {trText(subjects[0].chapters[0]?.name, language)}
                                  </span>
                                  <span className="ev-badge-pill ev-badge-indigo">
                                    {isBn ? 'চলমান অধ্যায়' : 'Active Chapter'}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                                  {isBn
                                    ? 'বোর্ড স্ট্যান্ডার্ড ও বহুপদী (i, ii, iii) প্রশ্ন অনুশীলন এবং সৃজনশীল রুব্রিক'
                                    : 'Board standard MCQs, Multi-Statement (i, ii, iii) & Creative CQ Rubrics'}
                                </div>
                                <div className="ev-progress-track" style={{ maxWidth: 360 }}>
                                  <div className="ev-progress-fill is-success" style={{ width: '78%' }} />
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="ev-btn ev-btn-primary"
                                onClick={() => handleLaunchSubjectPractice(subjects[0], 0, 'mcq', 'practice')}
                              >
                                {isBn ? 'অনুশীলন চালিয়ে যাও →' : 'Resume Practice →'}
                              </button>
                              <button
                                type="button"
                                className="ev-btn ev-btn-secondary"
                                onClick={() => handleLaunchSubjectPractice(subjects[0], 0, 'cq', 'practice')}
                              >
                                {isBn ? 'সৃজনশীল (CQ)' : 'Creative (CQ)'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* EXPLORE ALL SUBJECTS (2-Column Grid on Mobile + Inspirational Corner Art) */}
                  <div style={{ marginBottom: '1.65rem' }}>
                    <div className="ev-section-header">
                      <h3 className="ev-section-title">
                        {trKey('all_subjects', language)} ({subjects.length})
                      </h3>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(['Science', 'Commerce', 'Arts', 'All'] as const).map((grp) => (
                          <button
                            key={grp}
                            type="button"
                            className={`ev-btn ${
                              selectedGroup === grp ? 'ev-btn-primary' : 'ev-btn-secondary'
                            } ev-btn-sm`}
                            onClick={() => setClassAndGroup(selectedClass, grp)}
                          >
                            {grp === 'Science'
                              ? isBn
                                ? 'বিজ্ঞান'
                                : 'Science'
                              : grp === 'Commerce'
                              ? isBn
                                ? 'ব্যবসায়'
                                : 'Commerce'
                              : grp === 'Arts'
                              ? isBn
                                ? 'মানবিক'
                                : 'Arts'
                              : isBn
                              ? 'সকল বিষয়'
                              : 'All'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="ev-grid-4">
                      {subjects.map((subj) => {
                        const totalMcqs = subj.chapters.reduce(
                          (sum, c) => sum + (c.mcqs?.length || 0),
                          0
                        );
                        const mastery = Math.min(
                          100,
                          Math.round(
                            subj.chapters.reduce(
                              (acc, c) => acc + (chapterMastery[c.id] || 65),
                              0
                            ) / Math.max(1, subj.chapters.length)
                          )
                        );

                        return (
                          <button
                            key={subj.id}
                            type="button"
                            className="ev-card ev-card-interactive ev-subject-card"
                            data-subj={subj.id}
                            onClick={() => setSelectedSubject(subj)}
                          >
                            <SubjectSketchSvg subjId={subj.id} />

                            <div className="ev-subject-top">
                              <div className="ev-subject-icon-box" data-subj={subj.id}>
                                <EvIcon name={subj.id} size={25} />
                              </div>
                              <span className="ev-mcq-pill">
                                {subj.chapters.length} {trKey('chapters_count', language)} • {totalMcqs} MCQs
                              </span>
                            </div>

                            <div className="ev-subject-names">
                              <div className="ev-subject-name">{subj.name.en}</div>
                              <div className="font-bn ev-subject-name-bn">{subj.name.bn}</div>
                            </div>

                            <div className="ev-subject-meter">
                              <div className="ev-subject-meter-row">
                                <span>{selectedGroup}</span>
                                <span>{mastery}% mastery</span>
                              </div>
                              <div className="ev-progress-track">
                                <div className="ev-progress-fill" style={{ width: `${mastery}%` }} />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* RECOMMENDED MODEL SETS */}
                  {activeTab === 'dashboard' && (
                    <div style={{ marginBottom: '1.65rem' }}>
                      <div className="ev-section-header">
                        <h3 className="ev-section-title">
                          {isBn ? 'বাছাইকৃত মডেল টেস্ট (Recommended Model Sets)' : 'Recommended Model Sets'}
                        </h3>
                        <button
                          type="button"
                          className="ev-section-link"
                          onClick={() => setActiveTab('subjects')}
                        >
                          {isBn ? 'সকল অধ্যায় দেখো →' : 'Explore All Chapters →'}
                        </button>
                      </div>

                      <div className="ev-grid-3">
                        {recommendedPacks.map((pack) => (
                          <div
                            key={pack.id}
                            className="ev-card ev-card-interactive"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '0.9rem',
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span className="ev-badge-pill ev-badge-indigo">{pack.badge}</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                  +140 XP
                                </span>
                              </div>
                              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginBottom: 4 }}>
                                {pack.title}
                              </h4>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                {pack.sub}
                              </p>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                gap: '0.5rem',
                                paddingTop: '0.55rem',
                                borderTop: '1px solid var(--border-subtle)',
                              }}
                            >
                              <button
                                type="button"
                                className="ev-btn ev-btn-primary ev-btn-sm"
                                style={{ flex: 1 }}
                                onClick={() => {
                                  if (pack.subj) {
                                    handleLaunchSubjectPractice(
                                      pack.subj,
                                      0,
                                      pack.isCq ? 'cq' : 'mcq',
                                      'practice'
                                    );
                                  }
                                }}
                              >
                                {isBn ? 'প্র্যাকটিস' : 'Practice'}
                              </button>
                              <button
                                type="button"
                                className="ev-btn ev-btn-secondary ev-btn-sm"
                                style={{ flex: 1 }}
                                onClick={() => {
                                  if (pack.subj) {
                                    handleLaunchSubjectPractice(
                                      pack.subj,
                                      0,
                                      pack.isCq ? 'cq' : 'mcq',
                                      'timed'
                                    );
                                  }
                                }}
                              >
                                {isBn ? 'পরীক্ষা (Exam)' : 'Exam Mode'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* RECENT ACTIVITY */}
                  {activeTab === 'dashboard' && (
                    <div>
                      <div className="ev-section-header">
                        <h3 className="ev-section-title">
                          {isBn ? 'সাম্প্রতিক অনুশীলন (Recent Activity)' : 'Recent Activity'}
                        </h3>
                        <button
                          type="button"
                          className="ev-section-link"
                          onClick={() => setActiveTab('Analytics')}
                        >
                          {isBn ? 'পূর্ণাঙ্গ পরিসংখ্যান →' : 'Full Analytics →'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {examHistory.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="ev-card"
                            style={{
                              padding: '0.95rem 1.15rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '1rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <div className="ev-subject-icon-box" data-subj={item.subjectId}>
                                <EvIcon name={item.subjectId} size={22} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.94rem' }}>
                                  {item.subjectName} — {item.chapterName}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  {new Date(item.date).toLocaleDateString()} • Accuracy {item.accuracy}%
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                              <span className="ev-badge-pill ev-badge-success">
                                {item.score}/{item.total} ({item.accuracy}%)
                              </span>
                              <span className="ev-badge-pill ev-badge-indigo">
                                +{item.xpEarned} XP
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* =========================================================
          5. LIQUID GLASS MOBILE BOTTOM NAV WITH DARK/INDIGO TOP BAR
          ========================================================= */}
      <nav className="ev-bottom-nav" aria-label="Mobile Bottom Navigation">
        <button
          type="button"
          className={`ev-bottom-nav-btn ${activeTab === 'dashboard' ? 'is-active' : ''}`}
          onClick={() => {
            setSelectedSubject(null);
            setActiveTab('dashboard');
          }}
        >
          <EvIcon name="home" size={20} />
          <span>{trKey('nav_dashboard', language)}</span>
        </button>

        <button
          type="button"
          className={`ev-bottom-nav-btn ${activeTab === 'subjects' ? 'is-active' : ''}`}
          onClick={() => {
            setSelectedSubject(null);
            setActiveTab('subjects');
          }}
        >
          <EvIcon name="subjects" size={20} />
          <span>{trKey('nav_subjects', language)}</span>
        </button>

        <button
          type="button"
          className={`ev-bottom-nav-btn ${activeTab === 'leaderboard' ? 'is-active' : ''}`}
          onClick={() => {
            setSelectedSubject(null);
            setActiveTab('leaderboard');
          }}
        >
          <EvIcon name="leaderboard" size={20} />
          <span>{trKey('nav_leaderboard', language)}</span>
        </button>

        <button
          type="button"
          className={`ev-bottom-nav-btn ${activeTab === 'Analytics' ? 'is-active' : ''}`}
          onClick={() => {
            setSelectedSubject(null);
            setActiveTab('Analytics');
          }}
        >
          <EvIcon name="analytics" size={20} />
          <span>{trKey('nav_analytics', language)}</span>
        </button>

        <button
          type="button"
          className={`ev-bottom-nav-btn ${mobileMoreOpen ? 'is-active' : ''}`}
          onClick={() => setMobileMoreOpen(true)}
        >
          <EvIcon name="more" size={20} />
          <span>{trKey('nav_more', language)}</span>
        </button>
      </nav>

      {/* Mobile "More" Drawer Modal */}
      {mobileMoreOpen && (
        <div className="ev-modal-backdrop" onClick={() => setMobileMoreOpen(false)}>
          <div
            className="ev-card"
            style={{ width: '100%', maxWidth: 480, alignSelf: 'flex-end', borderRadius: '22px 22px 0 0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ev-section-header">
              <h3 className="ev-section-title">{trKey('nav_more', language)}</h3>
              <button className="ev-icon-btn" onClick={() => setMobileMoreOpen(false)}>
                ✕
              </button>
            </div>
            <div className="ev-grid-2" style={{ gap: '0.6rem' }}>
              {[...studyVaultNav, { id: 'achievements' as NavTabId, icon: 'achievements', labelKey: 'nav_achievements' }].map(
                (item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`ev-btn ${
                      activeTab === item.id ? 'ev-btn-primary' : 'ev-btn-secondary'
                    }`}
                    style={{ justifyContent: 'flex-start' }}
                    onClick={() => {
                      setSelectedSubject(null);
                      setActiveTab(item.id);
                      setMobileMoreOpen(false);
                    }}
                  >
                    <EvIcon name={item.icon} size={18} />
                    <span>{trKey(item.labelKey as any, language)}</span>
                  </button>
                )
              )}
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
