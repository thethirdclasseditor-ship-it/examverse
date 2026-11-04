import React, { useState } from 'react';
import {
  calculateUserRank,
  getSubjectsForSelection,
  trKey,
  trText,
  useExamStore,
} from '../store/useExamStore';
import { EvIcon, LevelRingSvg, MetallicBadgeSvg } from './ModalsAndQuiz';

export const ExtraFeaturesView: React.FC = () => {
  const {
    activeTab,
    language,
    userName,
    xp,
    streak,
    examHistory,
    mistakes,
    markMistakeMastered,
    flashcards,
    studyTasks,
    addStudyTask,
    toggleStudyTask,
    deleteStudyTask,
    communityPosts,
    addCommunityPost,
    togglePostLike,
    friendsList,
    addFriendByCode,
    selectedClass,
    selectedGroup,
    getRankInfo,
  } = useExamStore();

  const isBn = language !== 'en';
  const myRank = getRankInfo();

  const [lbScope, setLbScope] = useState<'global' | 'friends' | 'subject'>('global');
  const [lbPeriod, setLbPeriod] = useState<'today' | 'weekly' | 'monthly' | 'alltime'>('weekly');
  const [friendInput, setFriendInput] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [battleStage, setBattleStage] = useState<'lobby' | 'matched'>('lobby');
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  const subjects = getSubjectsForSelection(selectedClass, selectedGroup);

  /* =====================================================================
     1. PREMIUM METALLIC PODIUM (2nd | 1st | 3rd) & LEADERBOARD
     ===================================================================== */
  if (activeTab === 'leaderboard') {
    const mult =
      lbPeriod === 'today' ? 0.2 : lbPeriod === 'weekly' ? 0.6 : lbPeriod === 'monthly' ? 0.85 : 1;

    const rawPeers = [
      { name: 'Tasnim Zara', handle: '@tasnim_dmc', avatar: 'TZ', baseXp: 3420, acc: 94, streak: 14, isFriend: true, badge: 'Medical Track' },
      { name: 'Nafis Rahman', handle: '@nafis_buet', avatar: 'NR', baseXp: 3290, acc: 92, streak: 12, isFriend: true, badge: 'BUET Track' },
      { name: 'Sadia Islam', handle: '@sadia_bcs', avatar: 'SI', baseXp: 2610, acc: 89, streak: 9, isFriend: true, badge: '47th BCS' },
      { name: userName, handle: '@scholar_ev', avatar: userName.slice(0, 2).toUpperCase(), baseXp: Math.max(640, xp), acc: myRank.accuracyPct, streak, isFriend: true, isMe: true, badge: `${selectedClass} • ${selectedGroup}` },
      { name: 'Mahir Labib', handle: '@mahir_du', avatar: 'ML', baseXp: 2490, acc: 86, streak: 8, isFriend: false, badge: 'DU A-Unit' },
      { name: 'Tanvir Ahmed', handle: '@tanvir_hsc', avatar: 'TA', baseXp: 2180, acc: 84, streak: 7, isFriend: true, badge: 'HSC Science' },
    ];

    const entries = rawPeers
      .filter((p) => (lbScope === 'friends' ? p.isFriend || friendsList.includes(p.name) : true))
      .map((p) => {
        const displayXp = Math.round(p.baseXp * mult);
        const rInfo = calculateUserRank({
          xp: p.baseXp,
          accuracyPct: p.acc,
          masteredChaptersCount: Math.round(p.acc / 8),
          streakDays: p.streak,
          examsCompleted: 8,
        });
        return { ...p, displayXp, rankInfo: rInfo };
      })
      .sort((a, b) => b.displayXp - a.displayXp)
      .map((item, idx) => ({ ...item, displayRank: idx + 1 }));

    const topXp = Math.max(1, entries[0]?.displayXp || 1);
    const topThree = entries.slice(0, 3);
    const rest = entries.slice(3);
    const me = entries.find((e) => e.isMe) || entries[0];
    const podOrder = topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {trKey('nav_leaderboard', language)}
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              {isBn
                ? 'তোমার ব্যক্তিগত র‍্যাঙ্ক (Bronze → Elite) এবং লিডারবোর্ড পজিশন এখানে আলাদাভাবে প্রদর্শিত হচ্ছে।'
                : 'Your Personal Rank Tier (Bronze → Elite) and Leaderboard Standing are tracked independently.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
            {(['global', 'friends', 'subject'] as const).map((sc) => (
              <button
                key={sc}
                className={`ev-btn ${lbScope === sc ? 'ev-btn-primary' : 'ev-btn-secondary'} ev-btn-sm`}
                onClick={() => setLbScope(sc)}
              >
                {sc === 'global'
                  ? trKey('global_ranking', language)
                  : sc === 'friends'
                  ? trKey('friends_ranking', language)
                  : trKey('subject_ranking', language)}
              </button>
            ))}
            {(['today', 'weekly', 'monthly', 'alltime'] as const).map((pd) => (
              <button
                key={pd}
                className={`ev-btn ${lbPeriod === pd ? 'ev-btn-soft' : 'ev-btn-secondary'} ev-btn-sm`}
                onClick={() => setLbPeriod(pd)}
              >
                {trKey(`filter_${pd}` as any, language)}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Rank Tier vs Leaderboard Position Banner */}
        <div className="ev-lb-me">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-primary)' }} className="font-mono">
              #{me.displayRank}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                {trKey('leaderboard_pos', language)}: #{me.displayRank} ({me.displayXp.toLocaleString()} XP)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {trKey('personal_rank', language)}:{' '}
                <strong style={{ color: myRank.colorHex }}>
                  {isBn ? myRank.fullTitleBn : myRank.fullTitleEn} ({myRank.rankScore} RP)
                </strong>
              </div>
            </div>
          </div>

          {lbScope === 'friends' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder={isBn ? 'বন্ধুর নাম...' : 'Friend name...'}
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                style={{
                  height: 36,
                  padding: '0 10px',
                  borderRadius: 8,
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)',
                }}
              />
              <button
                className="ev-btn ev-btn-primary ev-btn-sm"
                onClick={() => {
                  if (friendInput.trim()) {
                    addFriendByCode(friendInput.trim());
                    setFriendInput('');
                  }
                }}
              >
                + Add
              </button>
            </div>
          )}
        </div>

        {/* 2nd | 1st | 3rd Metallic Podium with Crown */}
        <div className="ev-podium">
          {podOrder.map((p) => (
            <div key={p.name} className={`ev-pod rank-${p.displayRank}`}>
              <div className="ev-pod-av">
                {p.displayRank === 1 && (
                  <svg className="ev-crown" viewBox="0 0 36 26" aria-hidden="true">
                    <path
                      d="M3 23l-2-17 9 8 8-12 8 12 9-8-2 17z"
                      fill="#FBBF24"
                      stroke="#B45309"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                    <circle cx="1" cy="6" r="2" fill="#F59E0B" />
                    <circle cx="18" cy="2" r="2" fill="#F59E0B" />
                    <circle cx="35" cy="6" r="2" fill="#F59E0B" />
                  </svg>
                )}
                <div className="ev-avatar-sm">{p.avatar}</div>
              </div>
              <div className="ev-pod-name">
                {p.name} {p.isMe ? (isBn ? '(তুমি)' : '(You)') : ''}
              </div>
              <div className="ev-pod-meta" style={{ color: p.rankInfo.colorHex }}>
                {isBn ? p.rankInfo.fullTitleBn : p.rankInfo.fullTitleEn}
              </div>
              <div className="ev-pod-xp font-mono">{p.displayXp.toLocaleString()} XP</div>
              <div className="ev-pod-base">{p.displayRank}</div>
            </div>
          ))}
        </div>

        {/* Ranked List with Animated Progress Bars */}
        <div className="ev-card" style={{ padding: 0 }}>
          {rest.map((entry) => {
            const w = Math.max(8, Math.round((entry.displayXp / topXp) * 100));
            return (
              <div
                key={entry.name}
                className={`ev-lb-row ${entry.isMe ? 'is-current-user' : ''}`}
              >
                <div className="font-mono" style={{ fontWeight: 800, textAlign: 'center', color: 'var(--text-muted)' }}>
                  #{entry.displayRank}
                </div>
                <div className="ev-avatar-sm" style={{ width: 40, height: 40, fontSize: '0.84rem' }}>
                  {entry.avatar}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                    {entry.name}{' '}
                    <span
                      className="ev-badge-pill"
                      style={{
                        background: entry.rankInfo.bgSoft,
                        color: entry.rankInfo.colorHex,
                        marginLeft: 6,
                      }}
                    >
                      {isBn ? entry.rankInfo.fullTitleBn : entry.rankInfo.fullTitleEn}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {entry.handle} • {entry.badge} • {trKey('accuracy', language)} {entry.acc}%
                  </div>
                  <div className="ev-progress-track" style={{ height: 5, marginTop: 6 }}>
                    <div className="ev-progress-fill" style={{ width: `${w}%` }} />
                  </div>
                </div>
                <div className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--brand-primary)' }}>
                  {entry.displayXp.toLocaleString()} XP
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* =====================================================================
     2. STUDENT PROFILE, RANK PROGRESSION (Bronze -> Elite) & METALLIC BADGES
     ===================================================================== */
  if (activeTab === 'achievements') {
    const tiers: {
      id: 'bronze' | 'silver' | 'gold' | 'platinum' | 'elite';
      titleEn: string;
      titleBn: string;
      range: string;
      descBn: string;
      descEn: string;
    }[] = [
      {
        id: 'bronze',
        titleEn: 'Bronze Scholar (I – III)',
        titleBn: 'ব্রোঞ্জ স্কলার (I – III)',
        range: '0 – 199 RP',
        descBn: 'প্রাথমিক অনুশীলন ও নিয়মিত অধ্যায়ভিত্তিক কুইজে অংশগ্রহণ।',
        descEn: 'Foundation practice and regular chapter-wise quiz participation.',
      },
      {
        id: 'silver',
        titleEn: 'Silver Vanguard (I – III)',
        titleBn: 'সিলভার ভ্যানগার্ড (I – III)',
        range: '200 – 399 RP',
        descBn: '৭০%+ সঠিকতার হার এবং মূল অধ্যায়গুলোতে ধারাবাহিক দক্ষতা।',
        descEn: '70%+ accuracy rate and solid mastery across core chapters.',
      },
      {
        id: 'gold',
        titleEn: 'Gold Luminary (I – III)',
        titleBn: 'গোল্ড লুমিনারি (I – III)',
        range: '400 – 649 RP',
        descBn: '৮০%+ সঠিকতা, উচ্চ XP এবং ৭ দিনের অবিচল স্ট্রিক।',
        descEn: '80%+ accuracy, strong XP accumulation, and 7-day consistency.',
      },
      {
        id: 'platinum',
        titleEn: 'Platinum Savant (I – III)',
        titleBn: 'প্লাটিনাম সাভান্ট (I – III)',
        range: '650 – 849 RP',
        descBn: '৮৮%+ সঠিকতা এবং বোর্ড ও ভর্তি স্ট্যান্ডার্ড প্রশ্ন সমাধানে দক্ষতা।',
        descEn: '88%+ accuracy and admission-standard mastery across subjects.',
      },
      {
        id: 'elite',
        titleEn: 'Elite Grandmaster',
        titleBn: 'এলিট গ্র্যান্ডমাস্টার',
        range: '850 – 1000 RP',
        descBn: 'সর্বোচ্চ মেধা র‍্যাঙ্ক! ৯২%+ সঠিকতা, পূর্ণ মাস্টারি ও ধারাবাহিকতা।',
        descEn: 'Apex rank! 92%+ accuracy, complete subject mastery & streak.',
      },
    ];

    return (
      <div>
        <div
          className="ev-card"
          style={{
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 84, height: 84, display: 'grid', placeItems: 'center' }}>
              <LevelRingSvg pct={myRank.progressPct} size={84} stroke={6} />
              <div className="ev-avatar-sm" style={{ width: 60, height: 60, fontSize: '1.2rem' }}>
                {userName.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{userName}</h1>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 6 }}>
                <span
                  className="ev-badge-pill"
                  style={{ background: myRank.bgSoft, color: myRank.colorHex, fontSize: '0.8rem' }}
                >
                  {isBn ? myRank.fullTitleBn : myRank.fullTitleEn} ({myRank.rankScore} / 1000 RP)
                </span>
                <span className="ev-badge-pill ev-badge-indigo">{xp.toLocaleString()} XP</span>
                <span className="ev-badge-pill ev-badge-warning">{streak}d Streak</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ev-section-header">
          <h3 className="ev-section-title">
            {isBn ? 'র‍্যাঙ্ক প্রগ্রেশন ও মেটালিক ব্যাজ (Bronze → Elite)' : 'Rank Progression Tiers & Metallic Badges'}
          </h3>
        </div>

        <div className="ev-grid-2">
          {tiers.map((t) => {
            const isCurrent = t.id === myRank.tierId;
            return (
              <div
                key={t.id}
                className="ev-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  borderColor: isCurrent ? myRank.colorHex : undefined,
                  background: isCurrent ? myRank.bgSoft : undefined,
                }}
              >
                <MetallicBadgeSvg tier={t.id} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                      {isBn ? t.titleBn : t.titleEn}
                    </span>
                    <span className="ev-badge-pill ev-badge-neutral font-mono">{t.range}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {isBn ? t.descBn : t.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* =====================================================================
     3. ANALYTICS & 7-DAY BAR CHART
     ===================================================================== */
  if (activeTab === 'Analytics') {
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">{trKey('nav_analytics', language)}</h3>
        </div>

        <div className="ev-grid-4" style={{ marginBottom: '1.25rem' }}>
          <div className="ev-card" style={{ background: 'var(--bg-surface-hover)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {isBn ? 'সম্পন্ন পরীক্ষা' : 'Completed Quizzes'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{examHistory.length}</div>
          </div>
          <div className="ev-card" style={{ background: 'var(--bg-surface-hover)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {trKey('accuracy', language)}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)' }}>
              {myRank.accuracyPct}%
            </div>
          </div>
          <div className="ev-card" style={{ background: 'var(--bg-surface-hover)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {trKey('mastery', language)}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
              {myRank.masteryPct}%
            </div>
          </div>
          <div className="ev-card" style={{ background: 'var(--bg-surface-hover)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {trKey('rank_points', language)}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: myRank.colorHex }}>
              {myRank.rankScore} RP
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {examHistory.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '12px 16px',
                borderRadius: 14,
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="ev-subject-icon-box" data-subj={item.subjectId}>
                  <EvIcon name={item.subjectId} size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{item.subjectName}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    {item.chapterName} • {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="ev-badge-pill ev-badge-success">
                  {item.score}/{item.total} ({item.accuracy}%)
                </span>
                <span className="ev-badge-pill ev-badge-indigo">+{item.xpEarned} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =====================================================================
     4. MISTAKE BANK
     ===================================================================== */
  if (activeTab === 'mistakes') {
    const activeMistakes = mistakes.filter((m) => !m.mastered);
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">
            {trKey('nav_mistakes', language)} ({activeMistakes.length})
          </h3>
        </div>
        {activeMistakes.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            {isBn
              ? 'দারুণ! তোমার মিসটেক ব্যাংকে বর্তমানে কোনো অমীমাংসিত ভুল প্রশ্ন নেই।'
              : 'Your Mistake Bank is completely clear!'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeMistakes.map((m) => (
              <div key={m.id} className="ev-card" style={{ borderLeft: '4px solid var(--status-danger)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-danger)', marginBottom: 4 }}>
                  {m.subjectName} • {m.chapterName}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 8 }}>
                  {trText(m.question, language)}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--status-success)', fontWeight: 700 }}>
                  ✓ {isBn ? 'সঠিক উত্তর:' : 'Correct Answer:'}{' '}
                  {(language === 'en' ? m.options.en : m.options.bn)[m.correctIndex]}
                </div>
                <button
                  className="ev-btn ev-btn-soft ev-btn-sm"
                  style={{ marginTop: 10 }}
                  onClick={() => markMistakeMastered(m.id)}
                >
                  ✓ {isBn ? 'আয়ত্ত করেছি (Mark as Mastered)' : 'Mark as Mastered'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* =====================================================================
     5. FLASHCARDS
     ===================================================================== */
  if (activeTab === 'flashcards') {
    const card = flashcards[fcIndex % Math.max(1, flashcards.length)];
    return (
      <div className="ev-card" style={{ textAlign: 'center', padding: 28 }}>
        <div className="ev-section-header" style={{ justifyContent: 'center' }}>
          <h3 className="ev-section-title">{trKey('nav_flashcards', language)}</h3>
        </div>
        {card && (
          <div
            onClick={() => setFcFlipped(!fcFlipped)}
            className="ev-card ev-card-interactive"
            style={{
              maxWidth: 520,
              margin: '0 auto',
              minHeight: 190,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <span className="ev-badge-pill ev-badge-indigo">
              {fcFlipped ? (isBn ? 'উত্তর (Answer)' : 'Answer') : isBn ? 'সূত্র / প্রশ্ন (Prompt)' : 'Prompt'}
            </span>
            <div style={{ fontSize: 19, fontWeight: 800 }}>
              {trText(fcFlipped ? card.back : card.front, language)}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {isBn ? 'কার্ডে ক্লিক করে অপর পাশ দেখো' : 'Click card to flip'}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 18 }}>
          <button
            className="ev-btn ev-btn-primary"
            onClick={() => {
              setFcFlipped(false);
              setFcIndex((i) => (i + 1) % flashcards.length);
            }}
          >
            {isBn ? 'পরবর্তী কার্ড →' : 'Next Card →'}
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================================
     6. SUBJECT-WISE FORMULA SHEET
     ===================================================================== */
  if (activeTab === 'formulas') {
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">{trKey('nav_formulas', language)}</h3>
        </div>
        <div className="ev-grid-3">
          {subjects.map((sub) => (
            <div key={sub.id} className="ev-card" data-subj={sub.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div className="ev-subject-icon-box" data-subj={sub.id}>
                  <EvIcon name={sub.id} size={22} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{trText(sub.name, language)}</div>
              </div>
              <div className="font-mono" style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>• R² = P² + Q² + 2PQ cosθ</div>
                <div>• η = (1 - T₂/T₁) × 100%</div>
                <div>• pH = pKa + log([Salt]/[Acid])</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =====================================================================
     7. STUDY PLANNER
     ===================================================================== */
  if (activeTab === 'planner') {
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">{trKey('nav_planner', language)}</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <input
            type="text"
            placeholder={isBn ? 'আজকের পড়ার লক্ষ্য লেখো...' : 'Add study goal...'}
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            style={{
              flex: 1,
              minWidth: 200,
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
              if (!taskTitle.trim()) return;
              addStudyTask({
                title: taskTitle.trim(),
                subjectName: 'পদার্থবিজ্ঞান',
                dueDate: new Date().toISOString().slice(0, 10),
                targetMinutes: 35,
              });
              setTaskTitle('');
            }}
          >
            + {isBn ? 'রুটিনে যোগ করো' : 'Add Goal'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {studyTasks.map((t) => (
            <div
              key={t.id}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--bg-surface-hover)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleStudyTask(t.id)}
                  style={{ width: 18, height: 18, accentColor: 'var(--brand-primary)' }}
                />
                <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>
                  {t.title} ({t.targetMinutes}m)
                </span>
              </label>
              <button className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => deleteStudyTask(t.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =====================================================================
     8. 1v1 QUIZ BATTLE
     ===================================================================== */
  if (activeTab === 'battle') {
    return (
      <div className="ev-card" style={{ textAlign: 'center', padding: 28 }}>
        <div className="ev-section-header" style={{ justifyContent: 'center' }}>
          <h3 className="ev-section-title">{trKey('nav_battle', language)}</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 18 }}>
          {isBn
            ? 'তোমার সমমানের র‍্যাঙ্কের শিক্ষার্থীর সাথে রিয়েল-টাইম স্পিড কুইজ মোকাবিলা!'
            : 'Compete head-to-head against a peer in your Rank Tier!'}
        </p>
        {battleStage === 'lobby' ? (
          <button className="ev-btn ev-btn-primary" onClick={() => setBattleStage('matched')}>
            {isBn ? 'প্রতিদ্বন্দ্বী খুঁজুন (Find Match)' : 'Find Opponent'}
          </button>
        ) : (
          <div className="ev-card" style={{ maxWidth: 460, margin: '0 auto', background: 'var(--bg-surface-hover)' }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
              {userName} ({isBn ? myRank.fullTitleBn : myRank.fullTitleEn}) vs Nafis Rahman (Gold III)
            </div>
            <button className="ev-btn ev-btn-secondary" onClick={() => setBattleStage('lobby')}>
              {isBn ? 'লবিতে ফিরে যাও' : 'Back to Lobby'}
            </button>
          </div>
        )}
      </div>
    );
  }

  /* =====================================================================
     9. DOUBT FORUM / COMMUNITY
     ===================================================================== */
  return (
    <div className="ev-card">
      <div className="ev-section-header">
        <h3 className="ev-section-title">{trKey('nav_community', language)}</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
        <input
          type="text"
          placeholder={isBn ? 'তোমার প্রশ্নের শিরোনাম...' : 'Question title...'}
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          style={{
            height: 42,
            padding: '0 12px',
            borderRadius: 10,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-input)',
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder={isBn ? 'বিস্তারিত লেখো...' : 'Explain your doubt...'}
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
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
              if (!postTitle.trim()) return;
              addCommunityPost({
                authorName: userName,
                authorAvatar: 'SS',
                authorRank: isBn ? myRank.fullTitleBn : myRank.fullTitleEn,
                subjectName: 'পদার্থবিজ্ঞান',
                title: postTitle.trim(),
                body: postBody.trim(),
              });
              setPostTitle('');
              setPostBody('');
            }}
          >
            {isBn ? 'পোস্ট করো' : 'Post'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {communityPosts.map((post) => (
          <div key={post.id} className="ev-card" style={{ background: 'var(--bg-surface-hover)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
              <span>
                {post.authorName} • <strong style={{ color: 'var(--brand-primary)' }}>{post.authorRank || 'Gold II'}</strong>
              </span>
              <span>{post.createdAt}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 15.5, marginBottom: 4 }}>{post.title}</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 10 }}>{post.body}</p>
            <button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => togglePostLike(post.id)}>
              Helpful ({post.likes})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
