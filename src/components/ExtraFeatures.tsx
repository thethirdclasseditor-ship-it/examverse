import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChapterFormulaItem,
  getSubjectsForSelection,
  getTodayIsoDate,
  subjectSupportsFormulas,
  trKey,
  trText,
  useExamStore,
} from '../store/useExamStore';
import { SubjectData } from '../types';
import { QuizBattleView } from './QuizBattleView';
import { AdminPanelView } from './AdminPanelView';

function MetallicBadgeSvg({ color, label }: { color: string; label: string }) {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <polygon
        points="20,2 35,10 35,28 20,38 5,28 5,10"
        fill={color}
        fillOpacity="0.16"
        stroke={color}
        strokeWidth="2.4"
      />
      <polygon points="20,6 31,12 31,26 20,34 9,26 9,12" fill={color} />
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="11"
        fontWeight="800"
        fontFamily="Plus Jakarta Sans, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}

export const ExtraFeaturesView: React.FC = () => {
  const {
    language,
    activeTab,
    selectedClass,
    selectedGroup,
    formulaSubjectId,
    formulaChapterId,
    setFormulaFilter,
    userId,
    userName,
    userAvatar,
    xp,
    streak,
    examHistory,
    mistakes,
    markMistakeMastered,
    flashcards,
    addFlashcard,
    deleteFlashcard,
    studyTasks,
    addStudyTask,
    toggleStudyTask,
    deleteStudyTask,
    communityPosts,
    addCommunityPost,
    addCommunityReply,
    togglePostLike,
    friendList,
    addFriendByCode,
    removeFriend,
    fetchLeaderboardUsers,
    getRankInfo,
  } = useExamStore();

  const isBn = language !== 'en';
  const myRank = getRankInfo();
  const rankColor = myRank.colorHex || myRank.color || 'var(--brand-primary)';
  const subjects: SubjectData[] = getSubjectsForSelection(selectedClass, selectedGroup, true);

  // 1. Formulas state
  const [formulaSearch, setFormulaSearch] = useState('');

  // 2. Leaderboard state
  const [lbMode, setLbMode] = useState<'global' | 'friends'>('global');
  const [lbTimeframe, setLbTimeframe] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [lbSubjectFilter, setLbSubjectFilter] = useState<string>('all');
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friendNameInput, setFriendNameInput] = useState('');
  const [friendAddError, setFriendAddError] = useState('');
  const [liveCloudLb, setLiveCloudLb] = useState<any[]>([]);
  const [loadingLb, setLoadingLb] = useState(false);

  // 3. Flashcards state
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [newFcFront, setNewFcFront] = useState('');
  const [newFcBack, setNewFcBack] = useState('');

  // 4. Study Planner state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState(subjects[0]?.name.bn || 'হিসাববিজ্ঞান ১ম পত্র');
  const [taskMinutes, setTaskMinutes] = useState(30);

  // 5. Doubt Forum state
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postSubj, setPostSubj] = useState(subjects[0]?.name.bn || 'হিসাববিজ্ঞান ১ম পত্র');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const mathSubjects = useMemo(
    () => subjects.filter((s) => subjectSupportsFormulas(s)),
    [subjects]
  );

  const refreshLiveLeaderboard = useCallback(async () => {
    setLoadingLb(true);
    try {
      const list = await fetchLeaderboardUsers();
      setLiveCloudLb(Array.isArray(list) ? list : []);
    } finally {
      setLoadingLb(false);
    }
  }, [fetchLeaderboardUsers]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      refreshLiveLeaderboard();
    }
  }, [activeTab, refreshLiveLeaderboard]);

  useEffect(() => {
    if (subjects.length === 0) return;
    if (!subjects.some((s) => s.name.bn === taskSubject)) {
      setTaskSubject(subjects[0].name.bn);
    }
    if (!subjects.some((s) => s.name.bn === postSubj)) {
      setPostSubj(subjects[0].name.bn);
    }
  }, [subjects, taskSubject, postSubj]);

  /* VIEW 1: 1v1 QUIZ BATTLE */
  if (activeTab === 'battle') {
    return <QuizBattleView />;
  }

  /* VIEW 2: SECRET ADMIN PANEL */
  if (activeTab === 'admin') {
    return <AdminPanelView />;
  }

  /* VIEW 3: FORMULAS (Math & Quantitative Only) */
  if (activeTab === 'formulas') {
    const activeFormulaSubjId =
      formulaSubjectId && mathSubjects.some((s) => s.id === formulaSubjectId)
        ? formulaSubjectId
        : 'all';
    const activeFormulaChapId = formulaChapterId || 'all';

    const filteredSubjects =
      activeFormulaSubjId === 'all'
        ? mathSubjects
        : mathSubjects.filter((s) => s.id === activeFormulaSubjId);
    const activeSingleSubject =
      activeFormulaSubjId !== 'all'
        ? mathSubjects.find((s) => s.id === activeFormulaSubjId) || null
        : null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="ev-card">
          <div className="ev-section-header" style={{ marginBottom: 12 }}>
            <div>
              <h2 className="ev-section-title">{trKey('nav_formulas', language)}</h2>
              <p className="ev-section-subtitle">
                {selectedClass} • {selectedGroup}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
            <select
              className="ev-select"
              value={activeFormulaSubjId}
              onChange={(e) => setFormulaFilter(e.target.value, 'all')}
            >
              <option value="all">{isBn ? 'সকল গাণিতিক বিষয়' : 'All Math Subjects'}</option>
              {mathSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {trText(s.name, language)}
                </option>
              ))}
            </select>

            <select
              className="ev-select"
              value={activeFormulaChapId}
              onChange={(e) => setFormulaFilter(activeFormulaSubjId, e.target.value)}
              disabled={!activeSingleSubject}
            >
              <option value="all">{isBn ? 'সকল অধ্যায়' : 'All Chapters'}</option>
              {activeSingleSubject?.chapters
                .filter((ch) => (ch.formulas?.length || 0) > 0)
                .map((ch, idx) => (
                  <option key={ch.id} value={ch.id}>
                    {idx + 1}. {trText(ch.name, language)}
                  </option>
                ))}
            </select>

            <input
              type="text"
              className="ev-input"
              placeholder={isBn ? 'সূত্র বা অধ্যায় খুঁজুন...' : 'Search formula or chapter...'}
              value={formulaSearch}
              onChange={(e) => setFormulaSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="ev-card" style={{ textAlign: 'center', padding: 28 }}>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {isBn ? 'এই বিভাগে কোনো গাণিতিক সূত্রযুক্ত বিষয় নেই।' : 'No formula subjects available in this group.'}
            </p>
          </div>
        ) : (
          filteredSubjects.map((subj) => {
            const chaptersToShow = (
              activeFormulaChapId === 'all'
                ? subj.chapters
                : subj.chapters.filter((c) => c.id === activeFormulaChapId)
            ).filter((c) => (c.formulas?.length || 0) > 0);

            if (chaptersToShow.length === 0) return null;

            return (
              <div key={subj.id} className="ev-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: 10,
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: 16.5, fontWeight: 800 }}>{trText(subj.name, language)}</h3>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                      {chaptersToShow.length} {trKey('chapters_count', language)}
                    </span>
                  </div>
                </div>

                {chaptersToShow.map((chap) => {
                  const chapTitle = trText(chap.name, language);
                  const formulas: ChapterFormulaItem[] = (chap.formulas || []).filter((f) => {
                    if (!formulaSearch.trim()) return true;
                    const q = formulaSearch.toLowerCase();
                    const eq = (f.equation || f.formula || '').toLowerCase();
                    const noteTxt = f.note ? trText(f.note, language).toLowerCase() : '';
                    return (
                      f.title.bn.toLowerCase().includes(q) ||
                      f.title.en.toLowerCase().includes(q) ||
                      eq.includes(q) ||
                      noteTxt.includes(q) ||
                      chapTitle.toLowerCase().includes(q)
                    );
                  });

                  if (formulas.length === 0) return null;

                  return (
                    <div
                      key={chap.id}
                      style={{
                        background: 'var(--bg-surface-muted)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 14,
                        padding: 14,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: 'var(--brand-primary)',
                          marginBottom: 10,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 6,
                        }}
                      >
                        <span>{chapTitle}</span>
                        <span className="ev-badge-pill ev-badge-indigo">
                          {formulas.length} {isBn ? 'সূত্র' : 'Formulas'}
                        </span>
                      </div>

                      <div className="ev-grid-2">
                        {formulas.map((f) => {
                          const noteText = f.note ? trText(f.note, language).trim() : '';
                          const showNote = Boolean(noteText) && noteText !== chapTitle.trim();
                          return (
                            <div
                              key={f.id}
                              style={{
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                borderRadius: 12,
                                padding: '12px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6,
                              }}
                            >
                              <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-primary)' }}>
                                {trText(f.title, language)}
                              </div>
                              <div
                                className="font-mono"
                                style={{
                                  padding: '8px 10px',
                                  borderRadius: 8,
                                  background: 'var(--brand-primary-soft)',
                                  color: 'var(--brand-primary)',
                                  fontWeight: 700,
                                  fontSize: 13,
                                  borderLeft: '3px solid var(--brand-primary)',
                                  overflowX: 'auto',
                                }}
                              >
                                {f.equation || f.formula}
                              </div>
                              {showNote && (
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                                  {noteText}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    );
  }

  /* VIEW 4: REAL LEADERBOARD */
  if (activeTab === 'leaderboard') {
    const nowMs = Date.now();
    const cutoffDays = lbTimeframe === 'weekly' ? 7 : lbTimeframe === 'monthly' ? 30 : 36500;
    const cutoffMs = nowMs - cutoffDays * 86400 * 1000;

    const filteredMyHistory = examHistory.filter((h) => {
      const hTime = h.timestamp || new Date(h.date).getTime() || nowMs;
      const withinTime = lbTimeframe === 'all' ? true : hTime >= cutoffMs;
      const matchesSubject = lbSubjectFilter === 'all' ? true : h.subjectId === lbSubjectFilter;
      return withinTime && matchesSubject;
    });

    const myComputedXp =
      lbTimeframe === 'all' && lbSubjectFilter === 'all'
        ? xp
        : filteredMyHistory.reduce((sum, h) => sum + (h.xpEarned || 0), 0);

    const cloudEntries = liveCloudLb
      .filter((u) => {
        if (!u) return false;
        if (userId && userId !== 'guest-user') return u.id !== userId;
        return (u.full_name || u.name) !== userName;
      })
      .map((u, idx) => {
        const realXp = Math.max(0, Number(u.xp || 0));
        const rScore = Math.min(1000, Math.round(realXp / 10));
        const tierBn =
          rScore >= 850
            ? 'এলিট'
            : rScore >= 650
            ? 'প্লাটিনাম I'
            : rScore >= 400
            ? 'গোল্ড I'
            : rScore >= 200
            ? 'সিলভার I'
            : 'ব্রোঞ্জ I';
        const tierEn =
          rScore >= 850
            ? 'Elite'
            : rScore >= 650
            ? 'Platinum I'
            : rScore >= 400
            ? 'Gold I'
            : rScore >= 200
            ? 'Silver I'
            : 'Bronze I';
        const displayName = u.full_name || u.name || u.username || 'Scholar';
        return {
          id: u.id || `cloud-${idx}`,
          name: displayName,
          shortName: displayName,
          avatar: u.avatar_url || '',
          xp: realXp,
          rankScore: rScore,
          tierBn,
          tierEn,
          streak: Math.max(0, Number(u.streak_days ?? u.streak ?? 0)),
          isMe: false,
        };
      });

    const friendEntries = friendList.map((f) => ({
      id: f.id,
      name: `${f.name} (${f.code})`,
      shortName: f.name,
      avatar: f.avatar,
      xp: f.xp,
      rankScore: f.rankScore,
      tierBn: f.rankTitleBn,
      tierEn: f.rankTitleEn,
      streak: f.streak,
      isMe: false,
    }));

    const meEntry = {
      id: userId || 'me',
      name: `${userName} (${isBn ? 'তুমি' : 'You'})`,
      shortName: userName,
      avatar: userAvatar,
      xp: myComputedXp,
      rankScore: myRank.rankScore,
      tierBn: myRank.fullTitleBn,
      tierEn: myRank.fullTitleEn,
      streak,
      isMe: true,
    };

    const combined = (lbMode === 'friends' ? [...friendEntries, meEntry] : [...cloudEntries, meEntry]).sort(
      (a, b) => b.xp - a.xp || b.rankScore - a.rankScore
    );

    const myPosition = combined.findIndex((item) => item.isMe) + 1;
    const topThree = combined.slice(0, 3);

    const renderAvatarCircle = (entry: any, size = 38) => {
      const hasPhoto = entry.avatar && String(entry.avatar).startsWith('http');
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'var(--brand-primary)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {hasPhoto ? (
            <img src={entry.avatar} alt={entry.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{String(entry.shortName || entry.name || 'S').charAt(0).toUpperCase()}</span>
          )}
        </div>
      );
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 32 }}>
        <div className="ev-card ev-hero" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="font-mono" style={{ fontSize: 22, fontWeight: 900, color: 'var(--brand-primary)', minWidth: 38 }}>
                #{myPosition}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  {userName} •{' '}
                  <span style={{ color: rankColor }}>
                    {isBn ? myRank.fullTitleBn : myRank.fullTitleEn} ({myRank.rankScore} RP)
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {myComputedXp} XP • {trKey('accuracy', language)}: {myRank.accuracyPct}% • {streak}d
                </div>
              </div>
            </div>

            <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={refreshLiveLeaderboard}>
              {loadingLb ? '...' : isBn ? '↻ রিফ্রেশ' : '↻ Refresh'}
            </button>
          </div>
        </div>

        <div className="ev-card" style={{ paddingBottom: 22 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`ev-btn ev-btn-sm ${lbMode === 'global' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                onClick={() => setLbMode('global')}
              >
                {trKey('global_board', language)}
              </button>
              <button
                type="button"
                className={`ev-btn ev-btn-sm ${lbMode === 'friends' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                onClick={() => setLbMode('friends')}
              >
                {trKey('friends_board', language)}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                className="ev-select"
                style={{ width: 'auto', minHeight: 36, padding: '0 10px', fontSize: 13 }}
                value={lbTimeframe}
                onChange={(e) => setLbTimeframe(e.target.value as any)}
              >
                <option value="all">{trKey('all_time', language)}</option>
                <option value="monthly">{trKey('monthly', language)}</option>
                <option value="weekly">{trKey('weekly', language)}</option>
              </select>

              <select
                className="ev-select"
                style={{ width: 'auto', minHeight: 36, padding: '0 10px', fontSize: 13 }}
                value={lbSubjectFilter}
                onChange={(e) => setLbSubjectFilter(e.target.value)}
              >
                <option value="all">{isBn ? 'সকল বিষয়' : 'All Subjects'}</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {trText(s.name, language)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {topThree.length >= 1 && (
            <div className="ev-podium-stage" style={{ marginBottom: 18 }}>
              {[topThree[1], topThree[0], topThree[2]].map((p, idx) => {
                if (!p) return <div key={idx} style={{ width: 96 }} />;
                const place = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                const displayName = p.shortName || p.name;
                return (
                  <div key={p.id} className={`ev-podium-col is-${place}`}>
                    <div className="ev-podium-avatar-wrap">
                      {place === 1 && (
                        <svg className="ev-podium-crown" width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B">
                          <path d="M2 19h20v3H2v-3zM2 7l5 5 5-7 5 7 5-5v10H2V7z" />
                        </svg>
                      )}
                      {renderAvatarCircle(p, place === 1 ? 52 : 42)}
                    </div>
                    <div
                      className="ev-podium-name"
                      style={{
                        maxWidth: 115,
                        whiteSpace: 'normal',
                        lineHeight: 1.2,
                        fontSize: 12.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {displayName}
                    </div>
                    <div className="ev-podium-xp">{p.xp} XP</div>
                    <div className="ev-podium-pedestal">{place}</div>
                  </div>
                );
              })}
            </div>
          )}

          {lbMode === 'friends' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 12,
                borderRadius: 12,
                background: 'var(--bg-surface-muted)',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="ev-input font-mono"
                  style={{ flex: 1, minWidth: 140 }}
                  placeholder={isBn ? 'বন্ধুর কোড (EV-2048)' : 'Friend Code (EV-2048)'}
                  value={friendCodeInput}
                  onChange={(e) => {
                    setFriendCodeInput(e.target.value);
                    setFriendAddError('');
                  }}
                />
                <input
                  type="text"
                  className="ev-input"
                  style={{ flex: 1, minWidth: 140 }}
                  placeholder={isBn ? 'বন্ধুর নাম' : 'Friend Name'}
                  value={friendNameInput}
                  onChange={(e) => {
                    setFriendNameInput(e.target.value);
                    setFriendAddError('');
                  }}
                />
                <button
                  type="button"
                  className="ev-btn ev-btn-primary ev-btn-sm"
                  onClick={() => {
                    const cleanCode = friendCodeInput.trim().toUpperCase();
                    if (!/^EV-\d{3,6}$/i.test(cleanCode)) {
                      setFriendAddError(
                        isBn ? 'সঠিক ফ্রেন্ড কোড দাও (যেমন: EV-2048)' : 'Enter a valid code (e.g. EV-2048)'
                      );
                      return;
                    }
                    const ok = addFriendByCode(cleanCode, friendNameInput.trim());
                    if (!ok) {
                      setFriendAddError(isBn ? 'এই বন্ধু ইতিমধ্যে যুক্ত আছে।' : 'Friend already added.');
                      return;
                    }
                    setFriendCodeInput('');
                    setFriendNameInput('');
                    setFriendAddError('');
                  }}
                >
                  + {trKey('add_friend', language)}
                </button>
              </div>
              {friendAddError && (
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-danger)' }}>{friendAddError}</div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {combined.map((entry, idx) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: entry.isMe ? 'var(--brand-primary-soft)' : 'var(--bg-surface-muted)',
                  border: entry.isMe ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <span className="font-mono" style={{ width: 26, fontWeight: 900, color: 'var(--text-muted)', flexShrink: 0 }}>
                    #{idx + 1}
                  </span>
                  {renderAvatarCircle(entry, 36)}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {entry.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {isBn ? entry.tierBn : entry.tierEn} • {entry.streak}d
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-mono" style={{ fontWeight: 800, fontSize: 14, color: 'var(--brand-primary)' }}>
                      {entry.xp} XP
                    </div>
                    <div className="font-mono" style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700 }}>
                      {entry.rankScore} RP
                    </div>
                  </div>
                  {lbMode === 'friends' && !entry.isMe && (
                    <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => removeFriend(entry.id)}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* VIEW 5: RANK & BADGES */
  if (activeTab === 'achievements') {
    const allTiers = [
      { id: 'bronze', nameBn: 'ব্রোঞ্জ (I – III)', nameEn: 'Bronze (I – III)', range: '0 – 199 RP', color: '#B45309', div: 'I' },
      { id: 'silver', nameBn: 'সিলভার (I – III)', nameEn: 'Silver (I – III)', range: '200 – 399 RP', color: '#475569', div: 'II' },
      { id: 'gold', nameBn: 'গোল্ড (I – III)', nameEn: 'Gold (I – III)', range: '400 – 649 RP', color: '#D97706', div: 'III' },
      { id: 'platinum', nameBn: 'প্লাটিনাম (I – III)', nameEn: 'Platinum (I – III)', range: '650 – 849 RP', color: '#0284C7', div: 'IV' },
      { id: 'elite', nameBn: 'এলিট গ্র্যান্ডমাস্টার', nameEn: 'Elite Grandmaster', range: '850 – 1000 RP', color: '#7C3AED', div: 'MAX' },
    ];

    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">{trKey('nav_achievements', language)}</h3>
          <span className="ev-badge-pill ev-badge-indigo">
            {isBn ? myRank.fullTitleBn : myRank.fullTitleEn} • {myRank.rankScore} / 1000 RP
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allTiers.map((t) => {
            const isCurrent = t.id === myRank.tierId;
            return (
              <div
                key={t.id}
                className="ev-badge-card"
                style={{
                  border: isCurrent ? `2px solid ${t.color}` : '1px solid var(--border-subtle)',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <MetallicBadgeSvg color={t.color} label={t.div} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: t.color }}>
                      {isBn ? t.nameBn : t.nameEn}
                      {isCurrent ? (isBn ? ' • বর্তমান' : ' • Current') : ''}
                    </div>
                    <div className="font-mono" style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 700 }}>
                      {t.range}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* VIEW 6: ANALYTICS */
  if (activeTab === 'Analytics') {
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">{trKey('nav_analytics', language)}</h3>
        </div>

        <div className="ev-grid-4" style={{ marginBottom: 18 }}>
          <div className="ev-card ev-stat">
            <div>
              <div className="ev-stat-lab">{isBn ? 'মোট পরীক্ষা' : 'Total Exams'}</div>
              <div className="ev-stat-val">{examHistory.length}</div>
            </div>
          </div>
          <div className="ev-card ev-stat">
            <div>
              <div className="ev-stat-lab">{trKey('accuracy', language)}</div>
              <div className="ev-stat-val">{myRank.accuracyPct}%</div>
            </div>
          </div>
          <div className="ev-card ev-stat">
            <div>
              <div className="ev-stat-lab">{trKey('mastery', language)}</div>
              <div className="ev-stat-val">{myRank.masteryPct}%</div>
            </div>
          </div>
          <div className="ev-card ev-stat">
            <div>
              <div className="ev-stat-lab">{trKey('rank_points', language)}</div>
              <div className="ev-stat-val">{myRank.rankScore} RP</div>
            </div>
          </div>
        </div>

        {examHistory.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isBn
              ? 'এখনো কোনো পরীক্ষায় অংশ নাওনি। যেকোনো বিষয়ে ক্লিক করে কুইজ শুরু করো।'
              : 'You have not taken any exams yet. Select a subject to start practicing.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {examHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-surface-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5 }}>{item.subjectName}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    {item.chapterName} • {item.mode.toUpperCase()} • {item.date}
                  </div>
                </div>
                <div className="font-mono" style={{ textAlign: 'right', fontWeight: 800, flexShrink: 0 }}>
                  <div style={{ color: 'var(--status-success)' }}>
                    {item.score}/{item.total} ({item.accuracy}%)
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--brand-primary)' }}>+{item.xpEarned} XP</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* VIEW 7: MISTAKE BANK */
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
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isBn
              ? 'ভুলের খাতায় কোনো প্রশ্ন নেই। কুইজে কোনো উত্তর ভুল হলে তা এখানে জমা হবে।'
              : 'No pending mistakes in your Mistake Bank.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeMistakes.map((m) => (
              <div key={m.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-danger)', marginBottom: 4 }}>
                  {m.subjectName} • {m.chapterName}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, whiteSpace: 'pre-line', lineHeight: 1.55 }}>
                  {trText(m.question, language)}
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--status-success)', fontWeight: 700 }}>
                  {isBn ? 'সঠিক উত্তর:' : 'Correct Answer:'}{' '}
                  {(language === 'en' && m.options.en?.length
                    ? m.options.en
                    : m.options.bn?.length
                    ? m.options.bn
                    : m.options.en)[m.correctIndex]}
                </div>
                <button
                  type="button"
                  className="ev-btn ev-btn-secondary ev-btn-sm"
                  style={{ marginTop: 8 }}
                  onClick={() => markMistakeMastered(m.id)}
                >
                  ✓ {isBn ? 'আয়ত্ত করেছি' : 'Mark Mastered'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* VIEW 8: FLASHCARDS */
  if (activeTab === 'flashcards') {
    const safeIdx = flashcards.length > 0 ? fcIndex % flashcards.length : 0;
    const card = flashcards[safeIdx];
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">{trKey('nav_flashcards', language)}</h3>
        </div>

        <div className="ev-grid-2" style={{ marginBottom: 16 }}>
          <input
            type="text"
            className="ev-input"
            placeholder={isBn ? 'প্রশ্ন বা সূত্রের নাম...' : 'Front (Question / Term)...'}
            value={newFcFront}
            onChange={(e) => setNewFcFront(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="ev-input"
              placeholder={isBn ? 'উত্তর বা সমীকরণ...' : 'Back (Answer / Formula)...'}
              value={newFcBack}
              onChange={(e) => setNewFcBack(e.target.value)}
            />
            <button
              type="button"
              className="ev-btn ev-btn-primary"
              onClick={() => {
                if (!newFcFront.trim() || !newFcBack.trim()) return;
                addFlashcard(newFcFront.trim(), newFcBack.trim());
                setNewFcFront('');
                setNewFcBack('');
              }}
            >
              + {isBn ? 'যোগ' : 'Add'}
            </button>
          </div>
        </div>

        {flashcards.length === 0 || !card ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isBn
              ? 'নিজস্ব ফ্ল্যাশকার্ড তৈরি করতে ওপরে প্রশ্ন ও উত্তর লিখে যোগ করো।'
              : 'Create flashcards above to review key formulas and terms.'}
          </p>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div
              onClick={() => setFcFlipped(!fcFlipped)}
              style={{
                maxWidth: 500,
                margin: '0 auto',
                minHeight: 165,
                padding: 22,
                borderRadius: 16,
                background: 'var(--bg-surface-muted)',
                border: '1.5px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: 8,
              }}
            >
              <span className="ev-badge-pill ev-badge-indigo">
                {fcFlipped ? (isBn ? 'উত্তর' : 'Answer') : isBn ? 'প্রশ্ন' : 'Question'} ({safeIdx + 1}/{flashcards.length})
              </span>
              <div style={{ fontSize: 17, fontWeight: 800 }}>
                {trText(fcFlipped ? card.back : card.front, language)}
              </div>
              <small style={{ color: 'var(--text-muted)' }}>
                {isBn ? 'ট্যাপ করে উল্টাও' : 'Tap to flip'}
              </small>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                className="ev-btn ev-btn-secondary ev-btn-sm"
                onClick={() => {
                  setFcFlipped(false);
                  setFcIndex((i) => (i + 1) % Math.max(1, flashcards.length));
                }}
              >
                {isBn ? 'পরবর্তী কার্ড →' : 'Next Card →'}
              </button>
              <button
                type="button"
                className="ev-btn ev-btn-danger ev-btn-sm"
                onClick={() => {
                  setFcFlipped(false);
                  deleteFlashcard(card.id);
                }}
              >
                {isBn ? 'মুছো' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* VIEW 9: STUDY PLANNER */
  if (activeTab === 'planner') {
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">{trKey('nav_planner', language)}</h3>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <input
            type="text"
            className="ev-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder={isBn ? 'আজকের পড়ার টার্গেট লেখো...' : 'Write your study goal...'}
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <select
            className="ev-select"
            style={{ width: 'auto' }}
            value={taskSubject}
            onChange={(e) => setTaskSubject(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.name.bn}>
                {trText(s.name, language)}
              </option>
            ))}
          </select>
          <select
            className="ev-select"
            style={{ width: 'auto' }}
            value={taskMinutes}
            onChange={(e) => setTaskMinutes(Number(e.target.value))}
          >
            <option value={25}>25 {isBn ? 'মিনিট' : 'mins'}</option>
            <option value={40}>40 {isBn ? 'মিনিট' : 'mins'}</option>
            <option value={60}>60 {isBn ? 'মিনিট' : 'mins'}</option>
          </select>
          <button
            type="button"
            className="ev-btn ev-btn-primary"
            onClick={() => {
              if (!taskTitle.trim()) return;
              addStudyTask({
                title: taskTitle.trim(),
                subjectName: taskSubject,
                dueDate: getTodayIsoDate(),
                targetMinutes: taskMinutes,
              });
              setTaskTitle('');
            }}
          >
            + {isBn ? 'যোগ করো' : 'Add Goal'}
          </button>
        </div>

        {studyTasks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isBn
              ? 'পড়ার রুটিনে এখনো কোনো টাস্ক নেই। ওপরে টার্গেট লিখে যোগ করো।'
              : 'No study tasks yet. Add your daily study goals above.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {studyTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-surface-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700 }}>
                  <input type="checkbox" checked={t.completed} onChange={() => toggleStudyTask(t.id)} />
                  <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>
                    {t.title} —{' '}
                    <small style={{ color: 'var(--brand-primary)' }}>
                      {t.subjectName} ({t.targetMinutes}m)
                    </small>
                  </span>
                </label>
                <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => deleteStudyTask(t.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* VIEW 10: DOUBT FORUM */
  return (
    <div className="ev-card">
      <div className="ev-section-header">
        <h3 className="ev-section-title">{trKey('nav_community', language)}</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="ev-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder={isBn ? 'প্রশ্নের শিরোনাম...' : 'Question title...'}
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
          />
          <select
            className="ev-select"
            style={{ width: 'auto' }}
            value={postSubj}
            onChange={(e) => setPostSubj(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.name.bn}>
                {trText(s.name, language)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="ev-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder={isBn ? 'বিস্তারিত প্রশ্ন লেখো...' : 'Describe your question...'}
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
          />
          <button
            type="button"
            className="ev-btn ev-btn-primary"
            onClick={() => {
              if (!postTitle.trim()) return;
              addCommunityPost({
                authorName: userName,
                authorAvatar: '',
                authorRank: isBn ? myRank.fullTitleBn : myRank.fullTitleEn,
                subjectName: postSubj,
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

      {communityPosts.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {isBn
            ? 'ফোরামে এখনো কোনো প্রশ্ন পোস্ট করা হয়নি। তোমার যেকোনো একাডেমিক প্রশ্ন ওপরে পোস্ট করো।'
            : 'No questions posted yet. Ask your first academic doubt above.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {communityPosts.map((post) => {
            const hasLiked = Array.isArray(post.likedBy) && post.likedBy.includes(userId || 'guest-user');
            return (
              <div key={post.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    marginBottom: 4,
                    flexWrap: 'wrap',
                    gap: 4,
                  }}
                >
                  <span>
                    {post.authorName} •{' '}
                    <strong style={{ color: 'var(--brand-primary)' }}>{post.authorRank}</strong> • {post.subjectName}
                  </span>
                  <span>{post.createdAt}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{post.title}</div>
                {post.body && (
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 8 }}>{post.body}</p>
                )}

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <button
                    type="button"
                    className={`ev-btn ${hasLiked ? 'ev-btn-primary' : 'ev-btn-secondary'} ev-btn-sm`}
                    onClick={() => togglePostLike(post.id)}
                  >
                    👍 {post.likes}
                  </button>
                </div>

                {post.replies.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      marginBottom: 8,
                      paddingLeft: 12,
                      borderLeft: '2px solid var(--brand-primary-border)',
                    }}
                  >
                    {post.replies.map((r) => (
                      <div key={r.id} style={{ fontSize: 13 }}>
                        <strong>{r.authorName}:</strong> {r.text}{' '}
                        <small style={{ color: 'var(--text-muted)' }}>({r.createdAt})</small>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    className="ev-input"
                    placeholder={isBn ? 'উত্তর বা মন্তব্য লেখো...' : 'Write a reply...'}
                    value={replyTextMap[post.id] || ''}
                    onChange={(e) => setReplyTextMap((p) => ({ ...p, [post.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="ev-btn ev-btn-soft ev-btn-sm"
                    onClick={() => {
                      const txt = (replyTextMap[post.id] || '').trim();
                      if (!txt) return;
                      addCommunityReply(post.id, userName, txt);
                      setReplyTextMap((p) => ({ ...p, [post.id]: '' }));
                    }}
                  >
                    {isBn ? 'উত্তর দাও' : 'Reply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ExtraFeaturesView;
