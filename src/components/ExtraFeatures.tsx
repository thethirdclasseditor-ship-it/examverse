import React, { useState } from 'react';
import {
  calculateUserRank,
  getSubjectsForSelection,
  trKey,
  trText,
  useExamStore,
} from '../store/useExamStore';

export const ExtraFeaturesView: React.FC = () => {
  const {
    activeTab,
    language,
    userName,
    userAvatar,
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
  const [lbSubject] = useState<string>('all');
  const [friendInput, setFriendInput] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject] = useState('পদার্থবিজ্ঞান');
  const [taskMinutes] = useState(30);

  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');

  const [battleStage, setBattleStage] = useState<'lobby' | 'matched'>('lobby');
  const [opponentName, setOpponentName] = useState('আরিফ হোসেন (Gold III)');

  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);

  const subjects = getSubjectsForSelection(selectedClass, selectedGroup);

  if (activeTab === 'leaderboard') {
    const periodMultiplier =
      lbPeriod === 'today' ? 0.18 : lbPeriod === 'weekly' ? 0.55 : lbPeriod === 'monthly' ? 0.82 : 1;

    const basePeers = [
      { name: 'নুসরাত জাহান', avatar: '👩‍🎓', baseXp: 2450, acc: 94, streak: 14, isFriend: true, favSubj: 'physics' },
      { name: 'তানভীর আহমেদ', avatar: '🧑‍🔬', baseXp: 1980, acc: 91, streak: 11, isFriend: true, favSubj: 'chemistry' },
      { name: 'মাহির ফয়সাল', avatar: '🚀', baseXp: 1740, acc: 88, streak: 9, isFriend: false, favSubj: 'math' },
      { name: userName, avatar: userAvatar, baseXp: Math.max(640, xp), acc: myRank.accuracyPct, streak, isFriend: true, isMe: true, favSubj: 'physics' },
      { name: 'রাফি ইসলাম', avatar: '⚡', baseXp: 1320, acc: 84, streak: 7, isFriend: true, favSubj: 'biology' },
      { name: 'সাদিয়া করিম', avatar: '🌟', baseXp: 1150, acc: 82, streak: 6, isFriend: true, favSubj: 'ict' },
      { name: 'নাফিস ইকবাল', avatar: '📘', baseXp: 890, acc: 77, streak: 4, isFriend: false, favSubj: 'physics' },
    ];

    const filteredPeers = basePeers
      .filter((p) => (lbScope === 'friends' ? p.isFriend || friendsList.includes(p.name) : true))
      .filter((p) => (lbScope === 'subject' && lbSubject !== 'all' ? p.favSubj === lbSubject : true))
      .map((p) => {
        const scaledXp = Math.round(p.baseXp * periodMultiplier);
        const peerRank = calculateUserRank({
          xp: p.baseXp,
          accuracyPct: p.acc,
          masteredChaptersCount: Math.round(p.acc / 8),
          streakDays: p.streak,
          examsCompleted: 8,
        });
        return { ...p, displayXp: scaledXp, rankInfo: peerRank };
      })
      .sort((a, b) => b.displayXp - a.displayXp);

    const myPosition = filteredPeers.findIndex((p) => p.isMe) + 1 || 1;
    const top1 = filteredPeers[0];
    const top2 = filteredPeers[1];
    const top3 = filteredPeers[2];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div
          className="ev-card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: myRank.bgSoft,
                color: myRank.colorHex,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              🛡️
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>
                {trKey('personal_rank', language)} (XP + Accuracy + Mastery)
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: myRank.colorHex }}>
                {isBn ? myRank.fullTitleBn : myRank.fullTitleEn} • {myRank.rankScore} RP
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              #{myPosition}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>
                {trKey('leaderboard_pos', language)}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>
                {isBn ? `বর্তমান পজিশন #${myPosition}` : `Current Standing #${myPosition}`}
              </div>
            </div>
          </div>
        </div>

        <div className="ev-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'global', label: trKey('global_ranking', language), icon: '🌍' },
                  { id: 'friends', label: trKey('friends_ranking', language), icon: '👥' },
                  { id: 'subject', label: trKey('subject_ranking', language), icon: '📚' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLbScope(tab.id)}
                  className={`ev-btn ${lbScope === tab.id ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                  style={{ minHeight: 38, padding: '0 14px', fontSize: 13 }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'today', label: trKey('filter_today', language) },
                  { id: 'weekly', label: trKey('filter_weekly', language) },
                  { id: 'monthly', label: trKey('filter_monthly', language) },
                  { id: 'alltime', label: trKey('filter_alltime', language) },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setLbPeriod(p.id)}
                  className={`ev-btn ${lbPeriod === p.id ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                  style={{ minHeight: 36, padding: '0 12px', fontSize: 12.5 }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {lbScope === 'friends' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                placeholder={isBn ? 'বন্ধুর নাম বা কোড লিখুন...' : 'Enter friend name or code...'}
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
                style={{
                  flex: 1,
                  height: 40,
                  padding: '0 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-strong)',
                  background: 'var(--surface-2)',
                }}
              />
              <button
                className="ev-btn ev-btn-primary"
                style={{ minHeight: 40 }}
                onClick={() => {
                  if (friendInput.trim()) {
                    addFriendByCode(friendInput.trim());
                    setFriendInput('');
                  }
                }}
              >
                + {isBn ? 'বন্ধু যোগ করো' : 'Add Friend'}
              </button>
            </div>
          )}

          <div className="ev-podium">
            {top2 && (
              <div className="ev-podium-slot second">
                <div style={{ fontSize: 20 }}>🥈 #2</div>
                <div style={{ fontSize: 28 }}>{top2.avatar}</div>
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>{top2.name}</div>
                <span
                  className="ev-rank-badge-pill"
                  style={{
                    background: top2.rankInfo.bgSoft,
                    color: top2.rankInfo.colorHex,
                    fontSize: 11,
                  }}
                >
                  {isBn ? top2.rankInfo.fullTitleBn : top2.rankInfo.fullTitleEn}
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 13 }}>
                  {top2.displayXp} XP
                </div>
              </div>
            )}

            {top1 && (
              <div className="ev-podium-slot first">
                <div style={{ fontSize: 24 }}>👑 #1</div>
                <div style={{ fontSize: 34 }}>{top1.avatar}</div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{top1.name}</div>
                <span
                  className="ev-rank-badge-pill"
                  style={{
                    background: top1.rankInfo.bgSoft,
                    color: top1.rankInfo.colorHex,
                    fontSize: 11.5,
                  }}
                >
                  {isBn ? top1.rankInfo.fullTitleBn : top1.rankInfo.fullTitleEn}
                </span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: 14.5,
                    color: 'var(--amber)',
                  }}
                >
                  {top1.displayXp} XP
                </div>
              </div>
            )}

            {top3 && (
              <div className="ev-podium-slot third">
                <div style={{ fontSize: 20 }}>🥉 #3</div>
                <div style={{ fontSize: 28 }}>{top3.avatar}</div>
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>{top3.name}</div>
                <span
                  className="ev-rank-badge-pill"
                  style={{
                    background: top3.rankInfo.bgSoft,
                    color: top3.rankInfo.colorHex,
                    fontSize: 11,
                  }}
                >
                  {isBn ? top3.rankInfo.fullTitleBn : top3.rankInfo.fullTitleEn}
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 13 }}>
                  {top3.displayXp} XP
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {filteredPeers.map((peer, idx) => (
              <div
                key={peer.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: peer.isMe ? 'var(--primary-soft)' : 'var(--surface-2)',
                  border: peer.isMe ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <span
                    style={{
                      width: 28,
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--ink-2)',
                    }}
                  >
                    #{idx + 1}
                  </span>
                  <span style={{ fontSize: 22 }}>{peer.avatar}</span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 14.5,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {peer.name} {peer.isMe ? (isBn ? '(তুমি)' : '(You)') : ''}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>
                      {trKey('accuracy', language)}: {peer.acc}% • 🔥 {peer.streak}d
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span
                    className="ev-rank-badge-pill"
                    style={{
                      background: peer.rankInfo.bgSoft,
                      color: peer.rankInfo.colorHex,
                    }}
                  >
                    {isBn ? peer.rankInfo.fullTitleBn : peer.rankInfo.fullTitleEn}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 14 }}>
                    {peer.displayXp} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'achievements') {
    const allTiers = [
      {
        id: 'bronze',
        nameEn: 'Bronze Tier (I – III)',
        nameBn: 'ব্রোঞ্জ র‍্যাঙ্ক (I – III)',
        range: '0 – 199 RP',
        color: '#B45309',
        icon: '🥉',
        descBn: 'প্রাথমিক অনুশীলন ও নিয়মিত অধ্যায় ভিত্তিক কুইজ অংশগ্রহণ।',
        descEn: 'Foundation practice and consistent chapter quiz participation.',
      },
      {
        id: 'silver',
        nameEn: 'Silver Tier (I – III)',
        nameBn: 'সিলভার র‍্যাঙ্ক (I – III)',
        range: '200 – 399 RP',
        color: '#475569',
        icon: '🥈',
        descBn: '৭০%+ সঠিকতার হার এবং অন্তত ৩টি অধ্যায়ে দক্ষতা অর্জন।',
        descEn: '70%+ accuracy rate and solid mastery across core chapters.',
      },
      {
        id: 'gold',
        nameEn: 'Gold Tier (I – III)',
        nameBn: 'গোল্ড র‍্যাঙ্ক (I – III)',
        range: '400 – 649 RP',
        color: '#D97706',
        icon: '🥇',
        descBn: '৮০%+ সঠিকতা, উচ্চ XP এবং ৭ দিনের ধারাবাহিক স্ট্রিক।',
        descEn: '80%+ accuracy, strong XP accumulation, and 7-day consistency.',
      },
      {
        id: 'platinum',
        nameEn: 'Platinum Tier (I – III)',
        nameBn: 'প্লাটিনাম র‍্যাঙ্ক (I – III)',
        range: '650 – 849 RP',
        color: '#0284C7',
        icon: '💎',
        descBn: '৮৮%+ সঠিকতা এবং অধিকাংশ অধ্যায়ে বোর্ড স্ট্যান্ডার্ড দক্ষতা।',
        descEn: '88%+ accuracy and board-standard mastery across subjects.',
      },
      {
        id: 'elite',
        nameEn: 'Elite Grandmaster',
        nameBn: 'এলিট গ্র্যান্ডমাস্টার',
        range: '850 – 1000 RP',
        color: '#7C3AED',
        icon: '👑',
        descBn: 'সর্বোচ্চ র‍্যাঙ্ক! ৯২%+ সঠিকতা, পূর্ণ মাস্টারি ও অবিচল ধারাবাহিকতা।',
        descEn: 'Apex rank! 92%+ accuracy, complete subject mastery & streak.',
      },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="ev-card">
          <div className="ev-section-head">
            <div>
              <h3 className="ev-section-title">
                🏆 {isBn ? 'র‍্যাঙ্ক প্রগ্রেশন সিস্টেম (Bronze → Elite)' : 'Rank Progression System'}
              </h3>
              <p className="ev-section-sub">
                {isBn
                  ? 'XP (40%), সঠিকতার হার (25%), অধ্যায় দক্ষতা (20%) এবং স্ট্রিক ধারাবাহিকতা (15%) মিলে তোমার র‍্যাঙ্ক নির্ধারিত হয়।'
                  : 'Calculated from XP (40%), Accuracy (25%), Subject Mastery (20%), and Consistency (15%).'}
              </p>
            </div>
            <span
              className="ev-rank-badge-pill"
              style={{ background: myRank.bgSoft, color: myRank.colorHex, fontSize: 14 }}
            >
              {isBn ? myRank.fullTitleBn : myRank.fullTitleEn} • {myRank.rankScore} / 1000 RP
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allTiers.map((t) => {
              const isCurrent = t.id === myRank.tierId;
              return (
                <div
                  key={t.id}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: isCurrent ? myRank.bgSoft : 'var(--surface-2)',
                    border: isCurrent ? `2px solid ${t.color}` : '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15.5, color: t.color }}>
                        {isBn ? t.nameBn : t.nameEn}{' '}
                        {isCurrent && (isBn ? '• (তোমার বর্তমান র‍্যাঙ্ক)' : '• (Current Rank)')}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>
                        {isBn ? t.descBn : t.descEn}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 13.5 }}>
                    {t.range}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'Analytics') {
    return (
      <div className="ev-card">
        <div className="ev-section-head">
          <h3 className="ev-section-title">📊 {trKey('nav_analytics', language)}</h3>
        </div>
        <div className="ev-rank-metrics" style={{ marginBottom: 18 }}>
          <div className="ev-rank-metric-box">
            <div className="ev-rank-metric-val">{examHistory.length}</div>
            <div className="ev-rank-metric-lbl">{isBn ? 'মোট পরীক্ষা' : 'Total Exams'}</div>
          </div>
          <div className="ev-rank-metric-box">
            <div className="ev-rank-metric-val">{myRank.accuracyPct}%</div>
            <div className="ev-rank-metric-lbl">{trKey('accuracy', language)}</div>
          </div>
          <div className="ev-rank-metric-box">
            <div className="ev-rank-metric-val">{myRank.masteryPct}%</div>
            <div className="ev-rank-metric-lbl">{trKey('mastery', language)}</div>
          </div>
          <div className="ev-rank-metric-box">
            <div className="ev-rank-metric-val">{myRank.rankScore} RP</div>
            <div className="ev-rank-metric-lbl">{trKey('rank_points', language)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {examHistory.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>{item.subjectName}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
                  {item.chapterName} • {new Date(item.date).toLocaleDateString()}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                <div style={{ color: 'var(--emerald)' }}>
                  {item.score}/{item.total} ({item.accuracy}%)
                </div>
                <div style={{ fontSize: 12, color: 'var(--primary)' }}>+{item.xpEarned} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'mistakes') {
    const activeMistakes = mistakes.filter((m) => !m.mastered);
    return (
      <div className="ev-card">
        <div className="ev-section-head">
          <h3 className="ev-section-title">
            🎯 {trKey('nav_mistakes', language)} ({activeMistakes.length})
          </h3>
        </div>
        {activeMistakes.length === 0 ? (
          <p style={{ color: 'var(--ink-2)', fontWeight: 600 }}>
            {isBn
              ? 'দারুণ! তোমার ভুলের খাতায় বর্তমানে কোনো অমীমাংসিত প্রশ্ন নেই।'
              : 'Great job! You have no pending mistakes to review.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeMistakes.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rose)', marginBottom: 4 }}>
                  {m.subjectName} • {m.chapterName}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
                  {trText(m.question, language)}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--emerald)', fontWeight: 700 }}>
                  ✅ {isBn ? 'সঠিক উত্তর:' : 'Correct Answer:'}{' '}
                  {(language === 'en' ? m.options.en : m.options.bn)[m.correctIndex]}
                </div>
                <button
                  className="ev-btn ev-btn-secondary"
                  style={{ marginTop: 10, minHeight: 38 }}
                  onClick={() => markMistakeMastered(m.id)}
                >
                  ✔️ {isBn ? 'বুঝেছি ও আয়ত্ত করেছি' : 'Mark as Mastered'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'flashcards') {
    const card = flashcards[fcIndex % Math.max(1, flashcards.length)];
    return (
      <div className="ev-card" style={{ textAlign: 'center', padding: 28 }}>
        <h3 className="ev-section-title" style={{ justifyContent: 'center', marginBottom: 14 }}>
          🗂️ {trKey('nav_flashcards', language)}
        </h3>
        {card && (
          <div
            onClick={() => setFcFlipped(!fcFlipped)}
            style={{
              maxWidth: 520,
              margin: '0 auto',
              minHeight: 190,
              padding: 24,
              borderRadius: 18,
              background: 'var(--surface-2)',
              border: '1.5px solid var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
              {fcFlipped ? (isBn ? 'উত্তর (Back)' : 'Answer') : isBn ? 'প্রশ্ন (Front)' : 'Prompt'}
            </span>
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {trText(fcFlipped ? card.back : card.front, language)}
            </div>
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {isBn ? '(কার্ডে ট্যাপ করে উল্টাও)' : '(Tap card to flip)'}
            </span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 18 }}>
          <button
            className="ev-btn ev-btn-secondary"
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

  if (activeTab === 'formulas') {
    return (
      <div className="ev-card">
        <div className="ev-section-head">
          <h3 className="ev-section-title">📐 {trKey('nav_formulas', language)}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {subjects.map((sub) => (
            <div
              key={sub.id}
              style={{
                padding: 16,
                borderRadius: 14,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>
                {sub.icon} {trText(sub.name, language)}
              </div>
              <div style={{ fontSize: 13.5, fontFamily: 'var(--font-mono)', color: 'var(--ink-2)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>• v = u + at | s = ut + ½at²</div>
                <div>• F = G(m₁m₂)/r² | E = mc²</div>
                <div>• W = F·s cosθ | P = W/t</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'planner') {
    return (
      <div className="ev-card">
        <div className="ev-section-head">
          <h3 className="ev-section-title">📅 {trKey('nav_planner', language)}</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <input
            type="text"
            placeholder={isBn ? 'আজকের পড়ার টার্গেট লেখো...' : 'Add study goal...'}
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            style={{
              flex: 1,
              minWidth: 200,
              height: 44,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid var(--border-strong)',
              background: 'var(--surface-2)',
            }}
          />
          <button
            className="ev-btn ev-btn-primary"
            onClick={() => {
              if (!taskTitle.trim()) return;
              addStudyTask({
                title: taskTitle.trim(),
                subjectName: taskSubject,
                dueDate: new Date().toISOString().slice(0, 10),
                targetMinutes: taskMinutes,
              });
              setTaskTitle('');
            }}
          >
            + {isBn ? 'যোগ করো' : 'Add Task'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {studyTasks.map((t) => (
            <div
              key={t.id}
              style={{
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={() => toggleStudyTask(t.id)}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                />
                <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>
                  {t.title} ({t.targetMinutes}m)
                </span>
              </label>
              <button className="ev-btn ev-btn-ghost" onClick={() => deleteStudyTask(t.id)}>
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'battle') {
    return (
      <div className="ev-card" style={{ textAlign: 'center', padding: 28 }}>
        <h3 className="ev-section-title" style={{ justifyContent: 'center', marginBottom: 8 }}>
          ⚔️ {trKey('nav_battle', language)}
        </h3>
        <p className="ev-section-sub" style={{ marginBottom: 18 }}>
          {isBn
            ? 'সমমানের র‍্যাঙ্কের শিক্ষার্থীর সাথে রিয়েল-টাইম স্পিড কুইজ মোকাবিলা!'
            : 'Compete head-to-head against a peer in your Rank Tier!'}
        </p>

        {battleStage === 'lobby' ? (
          <button
            className="ev-btn ev-btn-primary"
            onClick={() => {
              setOpponentName('তানভীর আহমেদ (Gold II)');
              setBattleStage('matched');
            }}
          >
            ⚡ {isBn ? 'প্রতিদ্বন্দ্বী খুঁজুন (Find Match)' : 'Find Opponent'}
          </button>
        ) : (
          <div
            style={{
              maxWidth: 460,
              margin: '0 auto',
              padding: 20,
              borderRadius: 16,
              background: 'var(--surface-2)',
              border: '1px solid var(--border-strong)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>
              {userName} ({isBn ? myRank.fullTitleBn : myRank.fullTitleEn}) 🆚 {opponentName}
            </div>
            <button className="ev-btn ev-btn-secondary" onClick={() => setBattleStage('lobby')}>
              {isBn ? 'লবিতে ফিরে যাও' : 'Back to Lobby'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ev-card">
      <div className="ev-section-head">
        <h3 className="ev-section-title">💬 {trKey('nav_community', language)}</h3>
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
            border: '1px solid var(--border-strong)',
            background: 'var(--surface-2)',
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
              border: '1px solid var(--border-strong)',
              background: 'var(--surface-2)',
            }}
          />
          <button
            className="ev-btn ev-btn-primary"
            onClick={() => {
              if (!postTitle.trim()) return;
              addCommunityPost({
                authorName: userName,
                authorAvatar: userAvatar,
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
          <div
            key={post.id}
            style={{
              padding: 16,
              borderRadius: 14,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 6 }}>
              <span>
                {post.authorAvatar} {post.authorName} •{' '}
                <strong style={{ color: 'var(--primary)' }}>{post.authorRank || 'Gold I'}</strong>
              </span>
              <span>{post.createdAt}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 15.5, marginBottom: 4 }}>{post.title}</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 10 }}>{post.body}</p>
            <button
              className="ev-btn ev-btn-secondary"
              style={{ minHeight: 34, padding: '0 10px', fontSize: 12.5 }}
              onClick={() => togglePostLike(post.id)}
            >
              👍 {post.likes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
