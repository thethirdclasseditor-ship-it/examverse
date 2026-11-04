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
import { AuthModal, ExamVerseLogo, QuizRunnerModal, SettingsModal } from './components/ModalsAndQuiz';
import { ExtraFeaturesView } from './components/ExtraFeatures';

const SUBJECT_STYLE_MAP: Record<string, { rgb: string; badgeEn: string; badgeBn: string }> = {
  phys: { rgb: '79, 70, 229', badgeEn: 'Mechanics & Waves', badgeBn: 'বলবিদ্যা ও তরঙ্গ' },
  chem: { rgb: '5, 150, 105', badgeEn: 'Reactions & Lab', badgeBn: 'বিক্রিয়া ও ল্যাব' },
  math: { rgb: '217, 119, 6', badgeEn: 'Calculus & Algebra', badgeBn: 'ক্যালকুলাস ও বীজগণিত' },
  bio: { rgb: '225, 29, 72', badgeEn: 'Cell & Genetics', badgeBn: 'কোষ ও জিনতত্ত্ব' },
  ict: { rgb: '2, 132, 199', badgeEn: 'Code & Logic', badgeBn: 'প্রোগ্রামিং ও লজিক' },
  eng: { rgb: '124, 58, 237', badgeEn: 'Grammar & Reading', badgeBn: 'গ্রামার ও রিডিং' },
  ban: { rgb: '13, 148, 136', badgeEn: 'Literature & Prose', badgeBn: 'সাহিত্য ও ব্যাকরণ' },
};

const SubjectCornerSketch: React.FC<{ subjectId: string }> = ({ subjectId }) => {
  const id = subjectId.toLowerCase();
  if (id.includes('phy')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2">
        <ellipse cx="32" cy="32" rx="24" ry="10" transform="rotate(30 32 32)" />
        <ellipse cx="32" cy="32" rx="24" ry="10" transform="rotate(-30 32 32)" />
        <circle cx="32" cy="32" r="4" fill="currentColor" />
      </svg>
    );
  }
  if (id.includes('chem')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M24 12h16M27 12v14L14 48a4 4 0 003.5 6h29a4 4 0 003.5-6L37 26V12" />
        <path d="M19 40h26" />
      </svg>
    );
  }
  if (id.includes('math')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M14 48L50 16M14 48h36V16" />
        <path d="M42 48v-8h8" />
      </svg>
    );
  }
  if (id.includes('bio')) {
    return (
      <svg className="ev-subj-sketch" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="M20 12c0 16 24 24 24 40M44 12c0 16-24 24-24 40" />
        <path d="M23 22h18M23 42h18" />
      </svg>
    );
  }
  return (
    <svg className="ev-subj-sketch" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="12" y="14" width="40" height="36" rx="6" />
      <path d="M22 26l6 6-6 6M32 38h10" />
    </svg>
  );
};

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
    userAvatar,
    isAuthenticated,
    streak,
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

  const primaryNav: { id: NavTabId; icon: string; labelKey: string; badge?: number }[] = [
    { id: 'dashboard', icon: '🏠', labelKey: 'nav_dashboard' },
    { id: 'subjects', icon: '📚', labelKey: 'nav_subjects' },
    { id: 'leaderboard', icon: '🏆', labelKey: 'nav_leaderboard' },
    { id: 'mistakes', icon: '🎯', labelKey: 'nav_mistakes', badge: pendingMistakesCount || undefined },
    { id: 'Analytics', icon: '📊', labelKey: 'nav_analytics' },
  ];

  const secondaryNav: { id: NavTabId; icon: string; labelKey: string }[] = [
    { id: 'achievements', icon: '🛡️', labelKey: 'nav_achievements' },
    { id: 'flashcards', icon: '🗂️', labelKey: 'nav_flashcards' },
    { id: 'formulas', icon: '📐', labelKey: 'nav_formulas' },
    { id: 'planner', icon: '📅', labelKey: 'nav_planner' },
    { id: 'battle', icon: '⚔️', labelKey: 'nav_battle' },
    { id: 'community', icon: '💬', labelKey: 'nav_community' },
  ];

  const handleLaunchSubjectPractice = (
    subj: SubjectData,
    chapterIdx = 0,
    examType: 'mcq' | 'cq' = 'mcq'
  ) => {
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

  return (
    <div className="ev-shell">
      <aside className="ev-sidebar">
        <div className="ev-brand">
          <ExamVerseLogo size={40} />
          <div>
            <div className="ev-brand-title">ExamVerse</div>
            <div className="ev-brand-sub">Learn • Practice • Excel</div>
          </div>
        </div>

        <div className="ev-nav-section">
          <div className="ev-nav-label">{isBn ? 'মূল মেনু' : 'Core Menu'}</div>
          {primaryNav.map((item) => (
            <button
              key={item.id}
              className={`ev-nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedSubject(null);
                setActiveTab(item.id);
              }}
            >
              <span>{item.icon}</span>
              <span>{trKey(item.labelKey as any, language)}</span>
              {item.badge ? <span className="ev-nav-badge">{item.badge}</span> : null}
            </button>
          ))}
        </div>

        <div className="ev-nav-section">
          <div className="ev-nav-label">{isBn ? 'স্মার্ট টুলস' : 'Study Tools'}</div>
          {secondaryNav.map((item) => (
            <button
              key={item.id}
              className={`ev-nav-btn ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedSubject(null);
                setActiveTab(item.id);
              }}
            >
              <span>{item.icon}</span>
              <span>{trKey(item.labelKey as any, language)}</span>
            </button>
          ))}
        </div>

        <div className="ev-sidebar-rank">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)' }}>
              {trKey('personal_rank', language)}
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                color: rank.colorHex,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {rank.rankScore} RP
            </span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 14.5, color: rank.colorHex, marginBottom: 6 }}>
            🛡️ {isBn ? rank.fullTitleBn : rank.fullTitleEn}
          </div>
          <div className="ev-subject-bar">
            <span style={{ width: `${rank.progressPct}%`, background: rank.colorHex }} />
          </div>
        </div>
      </aside>

      <div className="ev-main-col">
        <header className="ev-topbar">
          <div className="ev-topbar-left">
            <div className="ev-mobile-logo">
              <ExamVerseLogo size={34} />
            </div>
            <div className="ev-greeting">
              {trKey('welcome_back', language)}, {userName.split(' ')[0]} 👋
            </div>
          </div>

          <div className="ev-topbar-right">
            <div className="ev-chip streak" title={trKey('streak_days', language)}>
              🔥 {streak}d
            </div>

            <button
              className="ev-chip"
              onClick={() =>
                setLanguage(language === 'bn' ? 'en' : language === 'en' ? 'bilingual' : 'bn')
              }
              title="Switch Language"
            >
              🌐 {language === 'bn' ? 'বাংলা' : language === 'en' ? 'EN' : 'বাং+EN'}
            </button>

            <button className="ev-icon-btn" onClick={toggleDarkMode} title="Toggle Theme">
              {darkMode ? '☀️' : '🌙'}
            </button>

            <button
              className="ev-icon-btn"
              onClick={() => setSettingsModalOpen(true)}
              title="Settings"
            >
              ⚙️
            </button>

            <button
              className="ev-chip"
              style={{
                background: isAuthenticated ? 'var(--primary-soft)' : 'var(--primary)',
                color: isAuthenticated ? 'var(--primary)' : '#FFFFFF',
                border: 'none',
              }}
              onClick={() => setAuthModalOpen(true)}
            >
              {userAvatar} {isAuthenticated ? userName.split(' ')[0] : trKey('sign_in', language)}
            </button>
          </div>
        </header>

        <main className="ev-content">
          {activeTab !== 'dashboard' && activeTab !== 'subjects' ? (
            <ExtraFeaturesView />
          ) : selectedSubject ? (
            <div className="ev-card">
              <div className="ev-section-head">
                <div>
                  <button
                    className="ev-btn ev-btn-secondary"
                    style={{ minHeight: 36, padding: '0 12px', marginBottom: 10 }}
                    onClick={() => setSelectedSubject(null)}
                  >
                    ← {isBn ? 'সব বিষয়ে ফিরে যাও' : 'Back to Subjects'}
                  </button>
                  <h2 className="ev-section-title">
                    {selectedSubject.icon} {trText(selectedSubject.name, language)}
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedSubject.chapters.map((chap, idx) => {
                  const chapMastery = chapterMastery[chap.id] || 0;
                  return (
                    <div
                      key={chap.id}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15.5 }}>
                          {idx + 1}. {trText(chap.name, language)}
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>
                          MCQ: {chap.mcqs?.length || 0} • CQ: {chap.cqs?.length || 0} •{' '}
                          {trKey('mastery', language)}: {chapMastery}%
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="ev-btn ev-btn-primary"
                          style={{ minHeight: 40, padding: '0 14px' }}
                          onClick={() => handleLaunchSubjectPractice(selectedSubject, idx, 'mcq')}
                        >
                          ⚡ MCQ {isBn ? 'কুইজ' : 'Quiz'}
                        </button>
                        {chap.cqs && chap.cqs.length > 0 && (
                          <button
                            className="ev-btn ev-btn-secondary"
                            style={{ minHeight: 40, padding: '0 14px' }}
                            onClick={() => handleLaunchSubjectPractice(selectedSubject, idx, 'cq')}
                          >
                            📝 CQ {isBn ? 'সৃজনশীল' : 'Practice'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <div className="ev-hero-grid">
                  <div className="ev-hero-card">
                    <div>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: 'var(--primary-soft)',
                          color: 'var(--primary)',
                          fontSize: 12,
                          fontWeight: 800,
                          marginBottom: 10,
                        }}
                      >
                        ✨ {selectedClass} • {selectedGroup}
                      </div>
                      <h1
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          lineHeight: 1.3,
                          letterSpacing: '-0.02em',
                          marginBottom: 6,
                        }}
                      >
                        {isBn
                          ? 'আজকের অনুশীলন শুরু করো এবং নিজের র‍্যাঙ্ক এগিয়ে নাও!'
                          : 'Master your syllabus & climb from Bronze to Elite!'}
                      </h1>
                      <p style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500 }}>
                        {isBn
                          ? 'অধ্যায়ভিত্তিক বোর্ড MCQ, সৃজনশীল (CQ) ও তাৎক্ষণিক ব্যাখ্যাসহ স্মার্ট প্রস্তুতি।'
                          : 'Practice chapter-wise Board MCQs, Creative Questions, and track real-time accuracy.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button
                        className="ev-btn ev-btn-primary"
                        onClick={() => {
                          if (subjects[0]) handleLaunchSubjectPractice(subjects[0], 0, 'mcq');
                        }}
                      >
                        🚀 {trKey('quick_mock', language)}
                      </button>

                      <select
                        value={selectedClass}
                        onChange={(e) => {
                          const nextCls = e.target.value;
                          const firstGrp = getAvailableGroups(nextCls)[0] || 'Science';
                          setClassAndGroup(nextCls, firstGrp);
                        }}
                        style={{
                          height: 44,
                          padding: '0 12px',
                          borderRadius: 12,
                          border: '1px solid var(--border-strong)',
                          background: 'var(--surface-2)',
                          fontWeight: 700,
                          fontSize: 13.5,
                        }}
                      >
                        {classList.map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedGroup}
                        onChange={(e) => setClassAndGroup(selectedClass, e.target.value)}
                        style={{
                          height: 44,
                          padding: '0 12px',
                          borderRadius: 12,
                          border: '1px solid var(--border-strong)',
                          background: 'var(--surface-2)',
                          fontWeight: 700,
                          fontSize: 13.5,
                        }}
                      >
                        {groupList.map((grp) => (
                          <option key={grp} value={grp}>
                            {grp}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="ev-rank-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>
                          {trKey('personal_rank', language)}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: rank.colorHex }}>
                          🛡️ {isBn ? rank.fullTitleBn : rank.fullTitleEn}
                        </div>
                      </div>
                      <span
                        className="ev-rank-badge-pill"
                        style={{ background: rank.bgSoft, color: rank.colorHex }}
                      >
                        {rank.rankScore} / {rank.nextTierScore} RP
                      </span>
                    </div>

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--ink-2)',
                          marginBottom: 5,
                        }}
                      >
                        <span>Bronze → Silver → Gold → Platinum → Elite</span>
                        <span>{rank.progressPct}%</span>
                      </div>
                      <div className="ev-subject-bar" style={{ height: 8 }}>
                        <span style={{ width: `${rank.progressPct}%`, background: rank.colorHex }} />
                      </div>
                    </div>

                    <div className="ev-rank-metrics">
                      <div className="ev-rank-metric-box">
                        <div className="ev-rank-metric-val">{rank.xpScore}</div>
                        <div className="ev-rank-metric-lbl">XP</div>
                      </div>
                      <div className="ev-rank-metric-box">
                        <div className="ev-rank-metric-val">{rank.accuracyPct}%</div>
                        <div className="ev-rank-metric-lbl">{trKey('accuracy', language)}</div>
                      </div>
                      <div className="ev-rank-metric-box">
                        <div className="ev-rank-metric-val">{rank.masteryPct}%</div>
                        <div className="ev-rank-metric-lbl">{trKey('mastery', language)}</div>
                      </div>
                      <div className="ev-rank-metric-box">
                        <div className="ev-rank-metric-val">{streak}d</div>
                        <div className="ev-rank-metric-lbl">{trKey('consistency', language)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="ev-section-head">
                  <div>
                    <h2 className="ev-section-title">📚 {trKey('all_subjects', language)}</h2>
                    <p className="ev-section-sub">
                      {isBn
                        ? 'যেকোনো বিষয়ে ট্যাপ করে অধ্যায়ভিত্তিক MCQ ও সৃজনশীল অনুশীলন শুরু করো'
                        : 'Select a subject to practice chapter-wise MCQs and Creative Questions'}
                    </p>
                  </div>
                </div>

                <div className="ev-subject-grid">
                  {subjects.map((subj) => {
                    const key = Object.keys(SUBJECT_STYLE_MAP).find((k) =>
                      subj.id.toLowerCase().includes(k)
                    );
                    const palette = key
                      ? SUBJECT_STYLE_MAP[key]
                      : { rgb: '79, 70, 229', badgeEn: 'Core Subject', badgeBn: 'মূল বিষয়' };

                    const totalQuestions = subj.chapters.reduce(
                      (sum, c) => sum + (c.mcqs?.length || 0) + (c.cqs?.length || 0),
                      0
                    );
                    const subjMastery = Math.min(
                      100,
                      Math.round(
                        subj.chapters.reduce((acc, c) => acc + (chapterMastery[c.id] || 45), 0) /
                          Math.max(1, subj.chapters.length)
                      )
                    );

                    return (
                      <button
                        key={subj.id}
                        className="ev-subject-card"
                        style={{ '--s': palette.rgb } as React.CSSProperties}
                        onClick={() => setSelectedSubject(subj)}
                      >
                        <div className="ev-subject-top">
                          <div className="ev-subject-icon" style={{ fontSize: 20 }}>
                            {subj.icon || '📘'}
                          </div>
                          <span className="ev-subject-tag">
                            {isBn ? palette.badgeBn : palette.badgeEn}
                          </span>
                        </div>

                        <div className="ev-subject-name">{trText(subj.name, language)}</div>

                        <div className="ev-subject-meta">
                          <span>
                            {subj.chapters.length} {trKey('chapters_count', language)}
                          </span>
                          <span>
                            {totalQuestions} {trKey('questions_count', language)}
                          </span>
                        </div>

                        <div className="ev-subject-bar">
                          <span style={{ width: `${subjMastery}%` }} />
                        </div>

                        <SubjectCornerSketch subjectId={subj.id} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <nav className="ev-bottom-nav">
        <button
          className={`ev-bnav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setSelectedSubject(null);
            setActiveTab('dashboard');
          }}
        >
          <span style={{ fontSize: 18 }}>🏠</span>
          <span>{trKey('nav_dashboard', language)}</span>
        </button>

        <button
          className={`ev-bnav-item ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => {
            setSelectedSubject(null);
            setActiveTab('subjects');
          }}
        >
          <span style={{ fontSize: 18 }}>📚</span>
          <span>{trKey('nav_subjects', language)}</span>
        </button>

        <button
          className={`ev-bnav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => {
            setSelectedSubject(null);
            setActiveTab('leaderboard');
          }}
        >
          <span style={{ fontSize: 18 }}>🏆</span>
          <span>{trKey('nav_leaderboard', language)}</span>
        </button>

        <button
          className={`ev-bnav-item ${activeTab === 'mistakes' ? 'active' : ''}`}
          onClick={() => {
            setSelectedSubject(null);
            setActiveTab('mistakes');
          }}
        >
          <span style={{ fontSize: 18 }}>🎯</span>
          <span>{trKey('nav_mistakes', language)}</span>
        </button>

        <button className="ev-bnav-item" onClick={() => setMobileMoreOpen(true)}>
          <span style={{ fontSize: 18 }}>☰</span>
          <span>{trKey('nav_more', language)}</span>
        </button>
      </nav>

      {mobileMoreOpen && (
        <div className="ev-sheet-backdrop" onClick={() => setMobileMoreOpen(false)}>
          <div className="ev-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ev-sheet-handle" />
            <div className="ev-section-head">
              <div className="ev-section-title">✨ {trKey('nav_more', language)}</div>
              <button className="ev-icon-btn" onClick={() => setMobileMoreOpen(false)}>
                ✕
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {[...secondaryNav, { id: 'Analytics' as NavTabId, icon: '📊', labelKey: 'nav_analytics' }].map(
                (item) => (
                  <button
                    key={item.id}
                    className={`ev-btn ${
                      activeTab === item.id ? 'ev-btn-primary' : 'ev-btn-secondary'
                    }`}
                    style={{ justifyContent: 'flex-start', padding: '0 14px' }}
                    onClick={() => {
                      setSelectedSubject(null);
                      setActiveTab(item.id);
                      setMobileMoreOpen(false);
                    }}
                  >
                    <span>{item.icon}</span>
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
    </div>
  );
}

export default App;
