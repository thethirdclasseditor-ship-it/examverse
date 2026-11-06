import React, { useEffect, useState } from 'react';
import {
  calculateUserRank,
  getAvailableClasses,
  getAvailableGroups,
  getSubjectsForSelection,
  trKey,
  trText,
  useExamStore,
} from '../store/useExamStore';
import { fetchRealCloudLeaderboard, supabase } from '../lib/supabase';
import { EvIcon, MetallicBadgeSvg } from './ModalsAndQuiz';
import { MCQQuestion, SubjectData } from '../types';

export const ExtraFeaturesView: React.FC = () => {
  const {
    activeTab,
    language,
    userName,
    userEmail,
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
    friendsList,
    addFriendByCode,
    selectedClass,
    selectedGroup,
    formulaSubjectId,
    formulaChapterId,
    setFormulaTarget,
    startQuiz,
    recordExamResult,
    getRankInfo,
    isAdminUnlocked,
    unlockAdmin,
    lockAdmin,
    setAdminPin,
    importBulkMcqs,
    addSingleCustomMcq,
    updateCustomMcqAnswer,
    editCustomMcqFull,
    deleteCustomMcq,
    deleteCustomSubject,
    questionReports,
    resolveQuestionReport,
    deleteQuestionReport,
    exportProjectSyllabusCode,
  } = useExamStore();

  const isBn = language !== 'en';
  const myRank = getRankInfo();
  const subjects = getSubjectsForSelection(selectedClass, selectedGroup);

  /* =====================================================================
     1. LEADERBOARD & RANKING STATE (With Single-Button Dropdowns!)
     ===================================================================== */
  const [lbScope, setLbScope] = useState<'global' | 'friends'>('global');
  const [lbPeriod, setLbPeriod] = useState<'today' | 'weekly' | 'monthly' | 'alltime'>('alltime');
  const [lbSubject, setLbSubject] = useState<string>('all');
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [friendInput, setFriendInput] = useState('');
  const [cloudPeers, setCloudPeers] = useState<any[]>([]);
  const [loadingLb, setLoadingLb] = useState(false);

  const loadCloudLeaderboard = async (subjFilter = lbSubject) => {
    setLoadingLb(true);
    try {
      const rows = await fetchRealCloudLeaderboard(subjFilter);
      setCloudPeers(Array.isArray(rows) ? rows : []);
    } catch {
      setCloudPeers([]);
    } finally {
      setLoadingLb(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      loadCloudLeaderboard(lbSubject);
    }
  }, [activeTab, lbSubject]);

  /* =====================================================================
     2. CHAPTER-WISE FORMULA MASTERBOOK STATE (Synced with Store!)
     ===================================================================== */
  const [formulaSearch, setFormulaSearch] = useState('');
  const [copiedFormulaId, setCopiedFormulaId] = useState<string | null>(null);

  /* =====================================================================
     3. 1v1 MCQ BATTLE ARENA STATE (Friends Room Code + Online Matchmaking)
     ===================================================================== */
  const [battleModeTab, setBattleModeTab] = useState<'online' | 'friend'>('online');
  const [battleSubjId, setBattleSubjId] = useState<string>(subjects[0]?.id || '');
  const [battleQCount, setBattleQCount] = useState<number>(5);
  const [roomCode, setRoomCode] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [battleStage, setBattleStage] = useState<'lobby' | 'searching' | 'playing' | 'finished'>('lobby');
  const [opponentName, setOpponentName] = useState<string>('অনলাইন প্রতিদ্বন্দ্বী');
  const [battleQuestions, setBattleQuestions] = useState<MCQQuestion[]>([]);
  const [battleQIndex, setBattleQIndex] = useState<number>(0);
  const [myBattleScore, setMyBattleScore] = useState<number>(0);
  const [oppBattleScore, setOppBattleScore] = useState<number>(0);
  const [battleTimeLeft, setBattleTimeLeft] = useState<number>(15);
  const [battleSelectedOpt, setBattleSelectedOpt] = useState<number | null>(null);

  useEffect(() => {
    if (!subjects.some((s) => s.id === battleSubjId)) {
      setBattleSubjId(subjects[0]?.id || '');
    }
  }, [subjects, battleSubjId]);

  const prepareBattleQuestions = (): MCQQuestion[] => {
    const targetSubj = subjects.find((s) => s.id === battleSubjId) || subjects[0];
    let pool = (targetSubj?.chapters || []).flatMap((c) => c.mcqs || []);
    if (pool.length === 0) {
      pool = subjects.flatMap((s) => s.chapters.flatMap((c) => c.mcqs || []));
    }
    if (pool.length === 0) {
      pool = [
        {
          id: 'bt-1',
          q: { bn: 'নিচের কোনটি মৌলিক একক?', en: 'Which is a base unit?' },
          options: { bn: ['জুল', 'অ্যাম্পিয়ার', 'নিউটন', 'ওয়াট'], en: ['Joule', 'Ampere', 'Newton', 'Watt'] },
          ans: 1,
        },
        {
          id: 'bt-2',
          q: { bn: 'প্রাসের সর্বোচ্চ পাল্লার ক্ষেত্রে নিক্ষেপণ কোণ কত?', en: 'Angle for maximum projectile range?' },
          options: { bn: ['30°', '45°', '60°', '90°'], en: ['30°', '45°', '60°', '90°'] },
          ans: 1,
        },
        {
          id: 'bt-3',
          q: { bn: 'সেকেন্ড দোলকের দোলনকাল কত?', en: 'Time period of a second pendulum?' },
          options: { bn: ['1 sec', '2 sec', '4 sec', '9.8 sec'], en: ['1 sec', '2 sec', '4 sec', '9.8 sec'] },
          ans: 1,
        },
        {
          id: 'bt-4',
          q: { bn: 'চলতি অনুপাতের আদর্শ মান কোনটি?', en: 'Standard Current Ratio?' },
          options: { bn: ['১ : ১', '২ : ১', '৩ : ১', '১ : ২'], en: ['1 : 1', '2 : 1', '3 : 1', '1 : 2'] },
          ans: 1,
        },
        {
          id: 'bt-5',
          q: { bn: 'কোন গেইটকে সার্বজনীন গেইট বলা হয়?', en: 'Which is a Universal Gate?' },
          options: { bn: ['AND ও OR', 'NAND ও NOR', 'XOR ও XNOR', 'NOT'], en: ['AND & OR', 'NAND & NOR', 'XOR & XNOR', 'NOT'] },
          ans: 1,
        },
      ];
    }
    return [...pool].sort(() => Math.random() - 0.5).slice(0, battleQCount);
  };

  const startLiveBattle = (oppName: string) => {
    const qList = prepareBattleQuestions();
    setOpponentName(oppName);
    setBattleQuestions(qList);
    setBattleQIndex(0);
    setMyBattleScore(0);
    setOppBattleScore(0);
    setBattleTimeLeft(15);
    setBattleSelectedOpt(null);
    setBattleStage('playing');
  };

  const handleNextBattleQuestion = (chosenIdx: number | null) => {
    const currentQ = battleQuestions[battleQIndex];
    if (!currentQ) return;

    const isCorrect = chosenIdx !== null && chosenIdx === currentQ.ans;
    const speedBonus = isCorrect ? 10 + Math.max(2, battleTimeLeft) : 0;
    const oppGetsRight = Math.random() < 0.68;
    const oppGain = oppGetsRight ? 10 + Math.floor(Math.random() * 10) : 0;

    const nextMyScore = myBattleScore + speedBonus;
    const nextOppScore = oppBattleScore + oppGain;
    setMyBattleScore(nextMyScore);
    setOppBattleScore(nextOppScore);

    if (battleQIndex + 1 < battleQuestions.length) {
      setBattleQIndex((i) => i + 1);
      setBattleTimeLeft(15);
      setBattleSelectedOpt(null);
    } else {
      setBattleStage('finished');
      const won = nextMyScore >= nextOppScore;
      recordExamResult(
        {
          subjectId: battleSubjId || 'battle',
          subjectName: isBn ? '১v১ কুইজ ব্যাটল' : '1v1 Quiz Battle',
          chapterName: `🆚 ${opponentName}`,
          mode: 'battle',
          score: Math.round(nextMyScore / 15),
          total: battleQuestions.length,
          accuracy: Math.min(100, Math.round((nextMyScore / (battleQuestions.length * 20)) * 100)),
          timeSpentSec: battleQuestions.length * 10,
          xpEarned: won ? 60 : 20,
        },
        []
      );
    }
  };

  useEffect(() => {
    if (battleStage !== 'playing') return;
    const timer = setInterval(() => {
      setBattleTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [battleStage, battleQIndex]);

  useEffect(() => {
    if (battleStage === 'playing' && battleTimeLeft === 0 && battleSelectedOpt === null) {
      handleNextBattleQuestion(null);
    }
  }, [battleTimeLeft, battleStage, battleSelectedOpt]);

  /* =====================================================================
     4. FLASHCARDS, PLANNER & FORUM STATE
     ===================================================================== */
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [newFcFront, setNewFcFront] = useState('');
  const [newFcBack, setNewFcBack] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState(subjects[0]?.name.bn || 'হিসাববিজ্ঞান ১ম পত্র');
  const [taskMinutes, setTaskMinutes] = useState(40);

  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postSubj, setPostSubj] = useState(subjects[0]?.name.bn || 'সাধারণ');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  /* =====================================================================
     5. FULL-POWER ADMIN PANEL STATE
     ===================================================================== */
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'bulk' | 'single' | 'reports' | 'manage' | 'users'>('bulk');

  const [admClass, setAdmClass] = useState<string>('HSC');
  const [admGroup, setAdmGroup] = useState<string>('Business Studies');
  const [admSubjectId, setAdmSubjectId] = useState<string>('hsc-acc-1');
  const [admCustomSubjNameBn, setAdmCustomSubjNameBn] = useState<string>('');
  const [admCustomSubjNameEn, setAdmCustomSubjNameEn] = useState<string>('');
  const [admRawText, setAdmRawText] = useState<string>('');
  const [admStatusBanner, setAdmStatusBanner] = useState<string | null>(null);

  const [singleChap, setSingleChap] = useState('অধ্যায় ১');
  const [singleQ, setSingleQ] = useState('');
  const [singleOptA, setSingleOptA] = useState('');
  const [singleOptB, setSingleOptB] = useState('');
  const [singleOptC, setSingleOptC] = useState('');
  const [singleOptD, setSingleOptD] = useState('');
  const [singleAns, setSingleAns] = useState(0);
  const [singleBoard, setSingleBoard] = useState('');
  const [singleExp, setSingleExp] = useState('');

  const [cloudUsers, setCloudUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newPinValue, setNewPinValue] = useState('');

  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editRepQ, setEditRepQ] = useState('');
  const [editRepOpts, setEditRepOpts] = useState<string[]>(['', '', '', '']);
  const [editRepAns, setEditRepAns] = useState(0);

  const fetchAdminCloudUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(100);
      setCloudUsers(Array.isArray(data) ? data : []);
    } catch {
      setCloudUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const renderPeerAvatarContent = (peer: { name: string; avatar?: string; isMe?: boolean }) => {
    if (peer.isMe && userAvatar && userAvatar.startsWith('http')) {
      return (
        <img
          src={userAvatar}
          alt={peer.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      );
    }
    if (peer.isMe && (peer.name === 'শিক্ষার্থী' || peer.name === 'শিক্ষার্থী (Scholar)')) {
      return <EvIcon name="user" size={16} />;
    }
    const clean = (peer.name || 'S').trim();
    const firstAscii = clean.match(/[A-Za-z0-9]/);
    if (firstAscii) return firstAscii[0].toUpperCase();
    return <EvIcon name="user" size={16} />;
  };

  /* =====================================================================
     VIEW 1: LEADERBOARD & RANKING MODE (Single-Button Dropdowns!)
     ===================================================================== */
  if (activeTab === 'leaderboard') {
    const periodLabels: Record<typeof lbPeriod, string> = {
      today: trKey('filter_today', language),
      weekly: trKey('filter_weekly', language),
      monthly: trKey('filter_monthly', language),
      alltime: trKey('filter_alltime', language),
    };

    const selectedSubjObj = subjects.find((s) => s.id === lbSubject);
    const subjectLabel =
      lbSubject === 'all'
        ? isBn
          ? 'সকল বিষয় (All)'
          : 'All Subjects'
        : selectedSubjObj
        ? trText(selectedSubjObj.name, language)
        : lbSubject;

    const periodMultiplier =
      lbPeriod === 'today' ? 0.25 : lbPeriod === 'weekly' ? 0.6 : lbPeriod === 'monthly' ? 0.85 : 1;

    const combinedMap = new Map<string, any>();

    cloudPeers.forEach((p) => {
      combinedMap.set(p.name, {
        name: p.name,
        handle: p.handle || '@scholar',
        avatar: p.avatar || '🎓',
        baseXp: Number(p.xp) || 0,
        acc: 80,
        streak: Number(p.streak) || 1,
        isFriend: friendsList.includes(p.name),
        isMe: p.name === userName,
      });
    });

    const mySubjExams =
      lbSubject === 'all' ? examHistory : examHistory.filter((h) => h.subjectId === lbSubject);
    const mySubjXp =
      lbSubject === 'all' ? xp : mySubjExams.reduce((sum, h) => sum + (h.xpEarned || 0), 0);

    combinedMap.set(userName, {
      name: userName,
      handle: userEmail ? `@${userEmail.split('@')[0]}` : '@scholar',
      avatar: userAvatar,
      baseXp: mySubjXp,
      acc: myRank.accuracyPct,
      streak,
      isFriend: true,
      isMe: true,
    });

    friendsList.forEach((fName) => {
      if (!combinedMap.has(fName)) {
        combinedMap.set(fName, {
          name: fName,
          handle: '@friend',
          avatar: '🧑‍🎓',
          baseXp: 0,
          acc: 0,
          streak: 0,
          isFriend: true,
          isMe: false,
        });
      }
    });

    const filteredPeers = Array.from(combinedMap.values())
      .filter((p) => (lbScope === 'friends' ? p.isFriend || p.isMe : true))
      .map((p) => {
        const displayXp = Math.round(p.baseXp * periodMultiplier);
        const peerRank = p.isMe
          ? myRank
          : calculateUserRank({
              xp: displayXp,
              accuracyPct: p.acc,
              masteredChaptersCount: Math.round(displayXp / 200),
              streakDays: p.streak,
              examsCompleted: displayXp > 0 ? 3 : 0,
            });
        return { ...p, displayXp, rankInfo: peerRank };
      })
      .sort((a, b) => b.displayXp - a.displayXp);

    const myPosition = filteredPeers.findIndex((p) => p.isMe) + 1 || 1;
    const top1 = filteredPeers[0];
    const top2 = filteredPeers[1];
    const top3 = filteredPeers[2];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="ev-lb-me">
          <div className="ev-lb-me-rank">#{myPosition}</div>
          <div className="ev-lb-me-text" style={{ flex: 1 }}>
            <div>
              <b>{userName}</b> •{' '}
              <span style={{ color: myRank.colorHex, fontWeight: 800 }}>
                🛡️ {isBn ? myRank.fullTitleBn : myRank.fullTitleEn} ({myRank.rankScore} RP)
              </span>
            </div>
            <div>
              {xp} XP • {trKey('accuracy', language)}: {myRank.accuracyPct}% • 🔥 {streak}d
            </div>
          </div>
          <button
            type="button"
            className="ev-btn ev-btn-secondary ev-btn-sm"
            onClick={() => loadCloudLeaderboard(lbSubject)}
          >
            {loadingLb ? '...' : '🔄'}
          </button>
        </div>

        <div className="ev-card" style={{ overflow: 'visible' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className={`ev-btn ev-btn-sm ${lbScope === 'global' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                onClick={() => setLbScope('global')}
              >
                🌍 {trKey('global_ranking', language)}
              </button>
              <button
                type="button"
                className={`ev-btn ev-btn-sm ${lbScope === 'friends' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                onClick={() => setLbScope('friends')}
              >
                👥 {trKey('friends_ranking', language)}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div className="ev-dropdown-wrap">
                <button
                  type="button"
                  className="ev-dropdown-trigger"
                  onClick={() => {
                    setPeriodDropdownOpen(!periodDropdownOpen);
                    setSubjectDropdownOpen(false);
                  }}
                >
                  <span>📅 {periodLabels[lbPeriod]}</span>
                  <span>▾</span>
                </button>
                {periodDropdownOpen && (
                  <div className="ev-dropdown-menu">
                    {(['today', 'weekly', 'monthly', 'alltime'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`ev-dropdown-item ${lbPeriod === p ? 'active' : ''}`}
                        onClick={() => {
                          setLbPeriod(p);
                          setPeriodDropdownOpen(false);
                        }}
                      >
                        <span>{periodLabels[p]}</span>
                        {lbPeriod === p && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="ev-dropdown-wrap">
                <button
                  type="button"
                  className="ev-dropdown-trigger"
                  onClick={() => {
                    setSubjectDropdownOpen(!subjectDropdownOpen);
                    setPeriodDropdownOpen(false);
                  }}
                >
                  <span>📚 {subjectLabel}</span>
                  <span>▾</span>
                </button>
                {subjectDropdownOpen && (
                  <div className="ev-dropdown-menu" style={{ minWidth: 250 }}>
                    <button
                      type="button"
                      className={`ev-dropdown-item ${lbSubject === 'all' ? 'active' : ''}`}
                      onClick={() => {
                        setLbSubject('all');
                        setSubjectDropdownOpen(false);
                      }}
                    >
                      <span>{isBn ? 'সকল বিষয় (All Subjects)' : 'All Subjects'}</span>
                      {lbSubject === 'all' && <span>✓</span>}
                    </button>
                    {subjects.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`ev-dropdown-item ${lbSubject === s.id ? 'active' : ''}`}
                        onClick={() => {
                          setLbSubject(s.id);
                          setSubjectDropdownOpen(false);
                        }}
                      >
                        <span>
                          {s.icon} {trText(s.name, language)}
                        </span>
                        {lbSubject === s.id && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {lbScope === 'friends' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <input
                type="text"
                className="ev-input"
                placeholder={isBn ? 'বন্ধুর নাম বা ইউজারনেম লিখুন...' : 'Enter friend name...'}
                value={friendInput}
                onChange={(e) => setFriendInput(e.target.value)}
              />
              <button
                type="button"
                className="ev-btn ev-btn-primary"
                onClick={() => {
                  if (friendInput.trim()) {
                    addFriendByCode(friendInput.trim());
                    setFriendInput('');
                  }
                }}
              >
                + {isBn ? 'যোগ করুন' : 'Add'}
              </button>
            </div>
          )}

          <div className="ev-podium">
            <div className={`ev-pod rank-2 ${top2?.isMe ? 'is-you' : ''}`}>
              <div className="ev-pod-av">
                <div className="ev-avatar-sm" style={{ overflow: 'hidden' }}>
                  {top2 ? renderPeerAvatarContent(top2) : '—'}
                </div>
              </div>
              <div className="ev-pod-name">{top2 ? top2.name : '—'}</div>
              <div className="ev-pod-xp">{top2 ? `${top2.displayXp} XP` : '0 XP'}</div>
              <div className="ev-pod-base">2</div>
            </div>

            <div className={`ev-pod rank-1 ${top1?.isMe ? 'is-you' : ''}`}>
              <div className="ev-pod-av">
                <svg className="ev-crown" viewBox="0 0 36 26" fill="#F59E0B">
                  <path d="M2 22L6 6l12 9 12-9 4 16H2z" />
                </svg>
                <div className="ev-avatar-sm" style={{ overflow: 'hidden' }}>
                  {top1 ? renderPeerAvatarContent(top1) : '—'}
                </div>
              </div>
              <div className="ev-pod-name">{top1 ? top1.name : '—'}</div>
              <div className="ev-pod-xp">{top1 ? `${top1.displayXp} XP` : '0 XP'}</div>
              <div className="ev-pod-base">1</div>
            </div>

            <div className={`ev-pod rank-3 ${top3?.isMe ? 'is-you' : ''}`}>
              <div className="ev-pod-av">
                <div className="ev-avatar-sm" style={{ overflow: 'hidden' }}>
                  {top3 ? renderPeerAvatarContent(top3) : '—'}
                </div>
              </div>
              <div className="ev-pod-name">{top3 ? top3.name : '—'}</div>
              <div className="ev-pod-xp">{top3 ? `${top3.displayXp} XP` : '0 XP'}</div>
              <div className="ev-pod-base">3</div>
            </div>
          </div>

          <div className="ev-lb-list">
            {filteredPeers.map((peer, idx) => (
              <div key={peer.name + idx} className={`ev-lb-row ${peer.isMe ? 'is-current-user' : ''}`}>
                <div className="ev-lb-rank">#{idx + 1}</div>
                <div className="ev-avatar-sm" style={{ width: 36, height: 36, overflow: 'hidden' }}>
                  {renderPeerAvatarContent(peer)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="ev-lb-name">
                    {peer.name} {peer.isMe ? (isBn ? '(তুমি)' : '(You)') : ''}
                  </div>
                  <div className="ev-lb-sub">
                    <span style={{ color: peer.rankInfo.colorHex, fontWeight: 700 }}>
                      {isBn ? peer.rankInfo.fullTitleBn : peer.rankInfo.fullTitleEn}
                    </span>
                    <span className="ev-lb-track">🔥 {peer.streak}d</span>
                  </div>
                </div>
                <div className="ev-lb-xp">
                  {peer.displayXp} XP
                  <small>{peer.rankInfo.rankScore} RP</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================================
     VIEW 2: INTERACTIVE CHAPTER-WISE FORMULA MASTERBOOK (📐 সূত্রসমূহ)
     ===================================================================== */
  if (activeTab === 'formulas') {
    const activeFormulaSubj: SubjectData | undefined = formulaSubjectId
      ? subjects.find((s) => s.id === formulaSubjectId)
      : undefined;

    const searchClean = formulaSearch.trim().toLowerCase();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="ev-card">
          <div className="ev-section-header">
            <div>
              {activeFormulaSubj && (
                <button
                  type="button"
                  className="ev-btn ev-btn-secondary ev-btn-sm"
                  style={{ marginBottom: 8 }}
                  onClick={() => setFormulaTarget(null, 'all')}
                >
                  ← {isBn ? 'সকল বিষয়ে ফিরে যাও' : 'All Subjects'}
                </button>
              )}
              <h2 className="ev-section-title">
                📐{' '}
                {activeFormulaSubj
                  ? `${activeFormulaSubj.icon} ${trText(activeFormulaSubj.name, language)} — ${isBn ? 'অধ্যায়ভিত্তিক সূত্র ও নিয়মাবলি' : 'Chapter-wise Formulas'}`
                  : isBn
                  ? `${selectedClass} (${selectedGroup}) — অধ্যায়ভিত্তিক সূত্র ও নিয়মাবলি`
                  : `${selectedClass} (${selectedGroup}) — Chapter-wise Formula Sheet`}
              </h2>
            </div>

            <div style={{ minWidth: 240 }}>
              <input
                type="text"
                className="ev-input"
                placeholder={isBn ? '🔍 যেকোনো সূত্র বা অধ্যায় খুঁজুন...' : '🔍 Search formulas...'}
                value={formulaSearch}
                onChange={(e) => setFormulaSearch(e.target.value)}
              />
            </div>
          </div>

          {activeFormulaSubj || searchClean ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeFormulaSubj && !searchClean && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`ev-btn ev-btn-sm ${formulaChapterId === 'all' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                    onClick={() => setFormulaTarget(activeFormulaSubj.id, 'all')}
                  >
                    {isBn ? `সকল অধ্যায় (${activeFormulaSubj.chapters.length})` : `All Chapters (${activeFormulaSubj.chapters.length})`}
                  </button>
                  {activeFormulaSubj.chapters.map((ch, idx) => (
                    <button
                      key={ch.id}
                      type="button"
                      className={`ev-btn ev-btn-sm ${formulaChapterId === ch.id ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                      onClick={() => setFormulaTarget(activeFormulaSubj.id, ch.id)}
                    >
                      {isBn ? `অধ্যায় ${idx + 1}` : `Ch ${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}

              {(activeFormulaSubj ? [activeFormulaSubj] : subjects).map((subj) =>
                subj.chapters
                  .filter((ch) => (activeFormulaSubj && formulaChapterId !== 'all' ? ch.id === formulaChapterId : true))
                  .map((ch) => {
                    const formulas = (ch.formulas || []).filter((f) => {
                      if (!searchClean) return true;
                      return (
                        f.title.bn.toLowerCase().includes(searchClean) ||
                        f.title.en.toLowerCase().includes(searchClean) ||
                        f.formula.toLowerCase().includes(searchClean) ||
                        (f.note?.bn || '').toLowerCase().includes(searchClean) ||
                        ch.name.bn.toLowerCase().includes(searchClean)
                      );
                    });

                    if (formulas.length === 0) return null;

                    return (
                      <div
                        key={ch.id}
                        className="ev-card"
                        style={{ background: 'var(--bg-surface-muted)', border: '1px solid var(--border-default)' }}
                      >
                        <div className="ev-section-header" style={{ marginBottom: 10 }}>
                          <div style={{ fontWeight: 800, fontSize: 15.5, color: 'var(--brand-primary)' }}>
                            {subj.icon} {trText(subj.name, language)} • {trText(ch.name, language)}
                          </div>
                          {ch.mcqs && ch.mcqs.length > 0 && (
                            <button
                              type="button"
                              className="ev-btn ev-btn-primary ev-btn-sm"
                              onClick={() =>
                                startQuiz({
                                  mode: 'practice',
                                  examType: 'mcq',
                                  subjectId: subj.id,
                                  subjectName: subj.name,
                                  chapterId: ch.id,
                                  chapterName: ch.name,
                                  questions: ch.mcqs,
                                  cqs: ch.cqs || [],
                                  durationSec: Math.max(300, ch.mcqs.length * 45),
                                  negativeMarking: 0,
                                })
                              }
                            >
                              ⚡ {isBn ? `MCQ অনুশীলন (${ch.mcqs.length})` : `Practice MCQ (${ch.mcqs.length})`}
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {formulas.map((f) => (
                            <div
                              key={f.id}
                              style={{
                                padding: 14,
                                borderRadius: 12,
                                background: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <div style={{ fontWeight: 800, fontSize: 14.5 }}>{trText(f.title, language)}</div>
                                <button
                                  type="button"
                                  className="ev-btn ev-btn-secondary ev-btn-sm"
                                  onClick={() => {
                                    navigator.clipboard?.writeText(`${trText(f.title, language)}: ${f.formula}`);
                                    setCopiedFormulaId(f.id);
                                    setTimeout(() => setCopiedFormulaId(null), 1200);
                                  }}
                                >
                                  {copiedFormulaId === f.id ? (isBn ? '✅ কপি হয়েছে' : '✅ Copied') : isBn ? '📋 কপি' : '📋 Copy'}
                                </button>
                              </div>

                              <div
                                className="font-mono"
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: 9,
                                  background: 'var(--brand-primary-soft)',
                                  color: 'var(--brand-primary)',
                                  fontWeight: 700,
                                  fontSize: 14,
                                  overflowX: 'auto',
                                }}
                              >
                                {f.formula}
                              </div>

                              {f.note && (
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>
                                  💡 {trText(f.note, language)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          ) : (
            <div className="ev-grid-3">
              {subjects.map((sub) => {
                const totalFormulas = sub.chapters.reduce((sum, c) => sum + (c.formulas?.length || 0), 0);
                return (
                  <div
                    key={sub.id}
                    className="ev-card ev-card-interactive"
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}
                    onClick={() => setFormulaTarget(sub.id, 'all')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 26 }}>{sub.icon}</span>
                      <span className="ev-badge-pill ev-badge-indigo">
                        {sub.chapters.length} {isBn ? 'অধ্যায়' : 'Ch'} • {totalFormulas} {isBn ? 'সূত্র' : 'Formulas'}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{sub.name.bn}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{sub.name.en}</div>
                    </div>
                    <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" style={{ width: '100%' }}>
                      📐 {isBn ? 'অধ্যায়ভিত্তিক সূত্রগুলো দেখুন →' : 'Open Chapter Formulas →'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =====================================================================
     VIEW 3: 1v1 MCQ BATTLE ARENA (With Friends Room Code & Online Search)
     ===================================================================== */
  if (activeTab === 'battle') {
    const curBattleQ = battleQuestions[battleQIndex];
    const optionLabels = isBn ? ['ক', 'খ', 'গ', 'ঘ'] : ['A', 'B', 'C', 'D'];

    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h2 className="ev-section-title">⚔️ {trKey('nav_battle', language)} (1v1 Live Arena)</h2>
          <span className="ev-badge-pill ev-badge-indigo">
            🛡️ {isBn ? myRank.fullTitleBn : myRank.fullTitleEn}
          </span>
        </div>

        {battleStage === 'lobby' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`ev-btn ${battleModeTab === 'online' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                onClick={() => setBattleModeTab('online')}
              >
                🌐 {isBn ? 'অনলাইন প্লেয়ার খুঁজুন (Search Online)' : 'Search Online Player'}
              </button>
              <button
                type="button"
                className={`ev-btn ${battleModeTab === 'friend' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                onClick={() => setBattleModeTab('friend')}
              >
                👥 {isBn ? 'বন্ধুর সাথে ১v১ ব্যাটল (Play with Friend)' : 'Play with Friend'}
              </button>
            </div>

            <div className="ev-grid-2">
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  {isBn ? 'ব্যাটলের বিষয় নির্বাচন করো' : 'Select Battle Subject'}
                </label>
                <select
                  className="ev-select"
                  value={battleSubjId}
                  onChange={(e) => setBattleSubjId(e.target.value)}
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {trText(s.name, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  {isBn ? 'প্রশ্ন সংখ্যা (Questions)' : 'Question Count'}
                </label>
                <select
                  className="ev-select"
                  value={battleQCount}
                  onChange={(e) => setBattleQCount(Number(e.target.value))}
                >
                  <option value={5}>5 MCQs (Rapid Battle)</option>
                  <option value={10}>10 MCQs (Standard Match)</option>
                </select>
              </div>
            </div>

            {battleModeTab === 'online' ? (
              <div
                style={{
                  padding: 22,
                  borderRadius: 16,
                  background: 'var(--bg-surface-muted)',
                  border: '1px solid var(--border-default)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
                  🌐 {isBn ? 'তোমার র‍্যাঙ্ক টিয়ার অনুযায়ী অনলাইন প্রতিদ্বন্দ্বী খুঁজুন' : 'Match with an Online Peer'}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                  {isBn
                    ? 'প্রতিটি প্রশ্নের জন্য ১৫ সেকেন্ড সময় পাবে। দ্রুত সঠিক উত্তর দিলে স্পিড বোনাস পয়েন্ট ও +60 XP পাবে!'
                    : '15 seconds per MCQ. Win to earn +60 XP!'}
                </p>
                <button
                  type="button"
                  className="ev-btn ev-btn-primary"
                  onClick={() => {
                    setBattleStage('searching');
                    setTimeout(() => {
                      startLiveBattle(isBn ? 'অনলাইন প্রতিদ্বন্দ্বী' : 'Online Challenger');
                    }, 1200);
                  }}
                >
                  ⚡ {isBn ? 'অনলাইন ম্যাচ শুরু করুন (Find Online Match)' : 'Find Match Now'}
                </button>
              </div>
            ) : (
              <div className="ev-grid-2">
                <div
                  style={{
                    padding: 18,
                    borderRadius: 16,
                    background: 'var(--bg-surface-muted)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 15 }}>
                    ➕ {isBn ? 'বন্ধুর জন্য ব্যাটল রুম তৈরি করো' : 'Create Friend Battle Room'}
                  </div>
                  {!roomCode ? (
                    <button
                      type="button"
                      className="ev-btn ev-btn-primary"
                      onClick={() => setRoomCode(`EV-${Math.floor(1000 + Math.random() * 9000)}`)}
                    >
                      🔑 {isBn ? 'রুম কোড তৈরি করো' : 'Generate Room Code'}
                    </button>
                  ) : (
                    <>
                      <div
                        className="font-mono"
                        style={{
                          padding: 12,
                          borderRadius: 10,
                          background: 'var(--brand-primary-soft)',
                          color: 'var(--brand-primary)',
                          fontSize: 20,
                          fontWeight: 800,
                          textAlign: 'center',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {roomCode}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="ev-btn ev-btn-secondary"
                          style={{ flex: 1 }}
                          onClick={() => navigator.clipboard?.writeText(roomCode)}
                        >
                          📋 {isBn ? 'কোড কপি' : 'Copy Code'}
                        </button>
                        <button
                          type="button"
                          className="ev-btn ev-btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => startLiveBattle(`Friend (${roomCode})`)}
                        >
                          ⚔️ {isBn ? 'ব্যাটল শুরু' : 'Start Battle'}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div
                  style={{
                    padding: 18,
                    borderRadius: 16,
                    background: 'var(--bg-surface-muted)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 15 }}>
                    🔗 {isBn ? 'বন্ধুর রুম কোডে জয়েন করো' : "Join Friend's Room Code"}
                  </div>
                  <input
                    type="text"
                    className="ev-input font-mono"
                    placeholder="EV-4829"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  />
                  <button
                    type="button"
                    className="ev-btn ev-btn-primary"
                    onClick={() => {
                      if (!joinCodeInput.trim()) return;
                      startLiveBattle(`Friend (${joinCodeInput.trim()})`);
                    }}
                  >
                    🚀 {isBn ? 'রুমে জয়েন ও ব্যাটল শুরু' : 'Join & Start Battle'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {battleStage === 'searching' && (
          <div style={{ padding: 36, textAlign: 'center' }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🛰️</div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>
              {isBn ? 'অনলাইন প্রতিদ্বন্দ্বী খোঁজা হচ্ছে...' : 'Searching for online opponent...'}
            </div>
          </div>
        )}

        {battleStage === 'playing' && curBattleQ && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderRadius: 14,
                background: 'var(--bg-surface-muted)',
                border: '1px solid var(--border-default)',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                  {userName} ({isBn ? 'তুমি' : 'You'})
                </div>
                <div className="font-mono" style={{ fontWeight: 800, fontSize: 18, color: 'var(--brand-primary)' }}>
                  {myBattleScore} pts
                </div>
              </div>

              <div className="ev-timer-badge is-urgent font-mono">⏱️ {battleTimeLeft}s</div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>{opponentName}</div>
                <div className="font-mono" style={{ fontWeight: 800, fontSize: 18, color: 'var(--status-danger)' }}>
                  {oppBattleScore} pts
                </div>
              </div>
            </div>

            <div className="ev-question-text">
              #{battleQIndex + 1}/{battleQuestions.length}. {trText(curBattleQ.q, language)}
            </div>

            <div className="ev-options-list">
              {(language === 'en'
                ? curBattleQ.options.en?.length
                  ? curBattleQ.options.en
                  : curBattleQ.options.bn
                : curBattleQ.options.bn?.length
                ? curBattleQ.options.bn
                : curBattleQ.options.en
              ).map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={battleSelectedOpt !== null}
                  className={`ev-option-btn ${
                    battleSelectedOpt !== null
                      ? idx === curBattleQ.ans
                        ? 'is-correct'
                        : battleSelectedOpt === idx
                        ? 'is-incorrect'
                        : ''
                      : ''
                  }`}
                  onClick={() => {
                    setBattleSelectedOpt(idx);
                    setTimeout(() => handleNextBattleQuestion(idx), 550);
                  }}
                >
                  <span className="ev-option-key">{optionLabels[idx]}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {battleStage === 'finished' && (
          <div style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 40 }}>{myBattleScore >= oppBattleScore ? '🏆' : '⚔️'}</div>
            <h3 style={{ fontSize: 22, fontWeight: 800 }}>
              {myBattleScore > oppBattleScore
                ? isBn
                  ? 'অভিনন্দন! তুমি ১v১ ব্যাটলে জয়ী হয়েছো! (+60 XP)'
                  : 'Victory! You won the 1v1 Battle! (+60 XP)'
                : myBattleScore === oppBattleScore
                ? isBn
                  ? 'ম্যাচ ড্র হয়েছে!'
                  : 'Match Tied!'
                : isBn
                ? 'হাড্ডাহাড্ডি লড়াই হয়েছে! (+20 XP)'
                : 'Good Fight! (+20 XP)'}
            </h3>
            <div className="font-mono" style={{ fontSize: 16, fontWeight: 800 }}>
              {userName}: {myBattleScore} pts 🆚 {opponentName}: {oppBattleScore} pts
            </div>
            <button type="button" className="ev-btn ev-btn-primary" onClick={() => setBattleStage('lobby')}>
              🔄 {isBn ? 'আবার খেলুন (Play Again)' : 'Play Again'}
            </button>
          </div>
        )}
      </div>
    );
  }

  /* =====================================================================
     VIEW 4: FULL-POWER HIDDEN ADMIN PANEL (🔐 activeTab === 'admin')
     ===================================================================== */
  if (activeTab === 'admin') {
    if (!isAdminUnlocked) {
      return (
        <div className="ev-card" style={{ maxWidth: 440, margin: '24px auto', textAlign: 'center', padding: 26 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
            {isBn ? 'অ্যাডমিন প্যানেল লগইন' : 'Admin Security Gate'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
            {isBn ? 'শুধুমাত্র অ্যাডমিন প্রবেশের জন্য গোপন পিন দিন' : 'Enter Admin Passcode to unlock'}
          </p>
          <input
            type="password"
            className="ev-input font-mono"
            style={{ textAlign: 'center', marginBottom: 10 }}
            placeholder="Admin PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (!unlockAdmin(pinInput)) setPinError('ভুল পিন! সঠিক অ্যাডমিন পিন দিন।');
                else setPinError('');
              }
            }}
          />
          {pinError && <div style={{ color: 'var(--status-danger)', fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>{pinError}</div>}
          <button
            type="button"
            className="ev-btn ev-btn-primary"
            style={{ width: '100%' }}
            onClick={() => {
              if (!unlockAdmin(pinInput)) setPinError('ভুল পিন! সঠিক অ্যাডমিন পিন দিন।');
              else setPinError('');
            }}
          >
            🔓 {isBn ? 'আনলক করুন' : 'Unlock Admin'}
          </button>
        </div>
      );
    }

    const admGroupOptions = getAvailableGroups(admClass);
    const admSubjects = getSubjectsForSelection(admClass, admGroup);
    const selectedAdmSubj = admSubjects.find((s) => s.id === admSubjectId) || admSubjects[0];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAdmRawText(String(ev.target?.result || ''));
      };
      reader.readAsText(file);
    };

    const handleDownloadProjectCode = () => {
      const code = exportProjectSyllabusCode();
      const blob = new Blob([code], { type: 'text/typescript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'syllabusData.ts';
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="ev-card">
          <div className="ev-section-header">
            <h2 className="ev-section-title">🔐 ExamVerse Master Admin Control Center</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={handleDownloadProjectCode}>
                📦 প্রজেক্ট কোড ডাউনলোড (syllabusData.ts)
              </button>
              <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={lockAdmin}>
                🔒 অ্যাডমিন লক ও হাইড করুন
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <button
              type="button"
              className={`ev-btn ev-btn-sm ${adminSubTab === 'bulk' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
              onClick={() => setAdminSubTab('bulk')}
            >
              📥 এক্সেল / CSV বাল্ক আপলোড
            </button>
            <button
              type="button"
              className={`ev-btn ev-btn-sm ${adminSubTab === 'single' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
              onClick={() => setAdminSubTab('single')}
            >
              ➕ একক প্রশ্ন যোগ
            </button>
            <button
              type="button"
              className={`ev-btn ev-btn-sm ${adminSubTab === 'reports' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
              onClick={() => setAdminSubTab('reports')}
            >
              🚨 ভুল প্রশ্নের রিপোর্ট ({questionReports.filter((r) => r.status === 'pending').length})
            </button>
            <button
              type="button"
              className={`ev-btn ev-btn-sm ${adminSubTab === 'manage' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
              onClick={() => setAdminSubTab('manage')}
            >
              🗂️ প্রশ্ন ও উত্তর সংশোধন
            </button>
            <button
              type="button"
              className={`ev-btn ev-btn-sm ${adminSubTab === 'users' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
              onClick={() => {
                setAdminSubTab('users');
                fetchAdminCloudUsers();
              }}
            >
              👥 ইউজার ও সিকিউরিটি
            </button>
          </div>

          {admStatusBanner && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: 'var(--status-success-bg)',
                border: '1px solid var(--status-success-border)',
                color: 'var(--status-success-text)',
                fontWeight: 800,
                fontSize: 13.5,
                marginBottom: 14,
              }}
            >
              {admStatusBanner}
            </div>
          )}

          {(adminSubTab === 'bulk' || adminSubTab === 'single' || adminSubTab === 'manage') && (
            <div className="ev-grid-3" style={{ marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 4 }}>শ্রেণি (Class)</label>
                <select
                  className="ev-select"
                  value={admClass}
                  onChange={(e) => {
                    const nextC = e.target.value;
                    const firstG = getAvailableGroups(nextC)[0] || 'Science';
                    const firstS = getSubjectsForSelection(nextC, firstG)[0]?.id || '';
                    setAdmClass(nextC);
                    setAdmGroup(firstG);
                    setAdmSubjectId(firstS);
                  }}
                >
                  {getAvailableClasses().map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 4 }}>বিভাগ (Group)</label>
                <select
                  className="ev-select"
                  value={admGroup}
                  onChange={(e) => {
                    const nextG = e.target.value;
                    const firstS = getSubjectsForSelection(admClass, nextG)[0]?.id || '';
                    setAdmGroup(nextG);
                    setAdmSubjectId(firstS);
                  }}
                >
                  {admGroupOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 4 }}>বিষয় ও পত্র (Subject & Paper)</label>
                <select className="ev-select" value={admSubjectId} onChange={(e) => setAdmSubjectId(e.target.value)}>
                  {admSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name.bn}
                    </option>
                  ))}
                  <option value="new-custom-subject">➕ নতুন বিষয় তৈরি করুন</option>
                </select>
              </div>
            </div>
          )}

          {adminSubTab === 'bulk' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {admSubjectId === 'new-custom-subject' && (
                <div className="ev-grid-2">
                  <input
                    type="text"
                    className="ev-input"
                    placeholder="নতুন বিষয়ের বাংলা নাম (যেমন: কৃষিশিক্ষা ১ম পত্র)"
                    value={admCustomSubjNameBn}
                    onChange={(e) => setAdmCustomSubjNameBn(e.target.value)}
                  />
                  <input
                    type="text"
                    className="ev-input"
                    placeholder="ইংরেজি নাম (Agriculture 1st Paper)"
                    value={admCustomSubjNameEn}
                    onChange={(e) => setAdmCustomSubjNameEn(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  📂 CSV / TSV ফাইল সিলেক্ট করুন অথবা নিচের বক্সে সরাসরি Microsoft Excel থেকে সারিগুলো কপি (`Ctrl+C`) করে পেস্ট (`Ctrl+V`) করুন:
                </label>
                <input type="file" accept=".csv,.tsv,.txt" className="ev-input" onChange={handleFileUpload} style={{ marginBottom: 8 }} />
                <textarea
                  className="ev-input font-mono"
                  rows={7}
                  placeholder={'অধ্যায়ের নাম\tপ্রশ্ন\tঅপশন ক\tঅপশন খ\tঅপশন গ\tঅপশন ঘ\tসঠিক উত্তর (ক/খ/গ/ঘ)\tবোর্ড ট্যাগ'}
                  value={admRawText}
                  onChange={(e) => setAdmRawText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="ev-btn ev-btn-primary"
                  onClick={() => {
                    if (!admRawText.trim()) return;
                    const finalId =
                      admSubjectId === 'new-custom-subject'
                        ? `custom-${Date.now()}`
                        : selectedAdmSubj?.id || admSubjectId;
                    const finalBn =
                      admSubjectId === 'new-custom-subject'
                        ? admCustomSubjNameBn || 'নতুন বিষয়'
                        : selectedAdmSubj?.name.bn || 'বিষয়';
                    const finalEn =
                      admSubjectId === 'new-custom-subject'
                        ? admCustomSubjNameEn || finalBn
                        : selectedAdmSubj?.name.en || finalBn;

                    const res = importBulkMcqs({
                      targetClass: admClass,
                      targetGroup: admGroup,
                      subjectId: finalId,
                      subjectNameBn: finalBn,
                      subjectNameEn: finalEn,
                      rawText: admRawText,
                    });
                    setAdmRawText('');
                    setAdmStatusBanner(
                      `✅ ${admClass} (${admGroup}) → ${finalBn}-এ ${res.addedQuestions}টি প্রশ্ন এবং ${res.addedChapters}টি অধ্যায় ডাটাবেস ও অ্যাপে যুক্ত হয়েছে!`
                    );
                  }}
                >
                  🚀 ডাটাবেস ও প্রজেক্টে আপলোড করুন
                </button>

                <button type="button" className="ev-btn ev-btn-secondary" onClick={handleDownloadProjectCode}>
                  💾 প্রজেক্ট ফাইল (syllabusData.ts) ডাউনলোড
                </button>
              </div>
            </div>
          )}

          {adminSubTab === 'single' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                type="text"
                className="ev-input"
                placeholder="অধ্যায়ের নাম (যেমন: অধ্যায় ১: ভৌত জগৎ ও পরিমাপ)"
                value={singleChap}
                onChange={(e) => setSingleChap(e.target.value)}
              />
              <input
                type="text"
                className="ev-input"
                placeholder="প্রশ্নটি লিখুন..."
                value={singleQ}
                onChange={(e) => setSingleQ(e.target.value)}
              />
              <div className="ev-grid-2">
                <input type="text" className="ev-input" placeholder="অপশন ক" value={singleOptA} onChange={(e) => setSingleOptA(e.target.value)} />
                <input type="text" className="ev-input" placeholder="অপশন খ" value={singleOptB} onChange={(e) => setSingleOptB(e.target.value)} />
                <input type="text" className="ev-input" placeholder="অপশন গ" value={singleOptC} onChange={(e) => setSingleOptC(e.target.value)} />
                <input type="text" className="ev-input" placeholder="অপশন ঘ" value={singleOptD} onChange={(e) => setSingleOptD(e.target.value)} />
              </div>
              <div className="ev-grid-3">
                <select className="ev-select" value={singleAns} onChange={(e) => setSingleAns(Number(e.target.value))}>
                  <option value={0}>সঠিক উত্তর: ক</option>
                  <option value={1}>সঠিক উত্তর: খ</option>
                  <option value={2}>সঠিক উত্তর: গ</option>
                  <option value={3}>সঠিক উত্তর: ঘ</option>
                </select>
                <input type="text" className="ev-input" placeholder="বোর্ড ট্যাগ (যেমন: ঢা. বো. '১৯)" value={singleBoard} onChange={(e) => setSingleBoard(e.target.value)} />
                <input type="text" className="ev-input" placeholder="ব্যাখ্যা (ঐচ্ছিক)" value={singleExp} onChange={(e) => setSingleExp(e.target.value)} />
              </div>
              <button
                type="button"
                className="ev-btn ev-btn-primary"
                onClick={() => {
                  if (!singleQ.trim() || !singleOptA.trim()) return;
                  addSingleCustomMcq({
                    targetClass: admClass,
                    targetGroup: admGroup,
                    subjectId: selectedAdmSubj?.id || admSubjectId,
                    subjectNameBn: selectedAdmSubj?.name.bn || 'বিষয়',
                    subjectNameEn: selectedAdmSubj?.name.en || 'Subject',
                    chapterNameBn: singleChap.trim(),
                    questionBn: singleQ.trim(),
                    optionsBn: [singleOptA.trim(), singleOptB.trim(), singleOptC.trim(), singleOptD.trim()],
                    ansIndex: singleAns,
                    boardTag: singleBoard.trim(),
                    explanationBn: singleExp.trim(),
                  });
                  setSingleQ('');
                  setSingleOptA('');
                  setSingleOptB('');
                  setSingleOptC('');
                  setSingleOptD('');
                  setAdmStatusBanner('✅ প্রশ্নটি সফলভাবে যুক্ত হয়েছে!');
                }}
              >
                ➕ প্রশ্ন যুক্ত করুন
              </button>
            </div>
          )}

          {adminSubTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {questionReports.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  বর্তমানে স্টুডেন্টদের কোনো অমীমাংসিত প্রশ্ন রিপোর্ট নেই।
                </p>
              ) : (
                questionReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="ev-card"
                    style={{
                      background: rep.status === 'resolved' ? 'var(--status-success-bg)' : 'var(--bg-surface-muted)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                      <span className="ev-badge-pill ev-badge-danger">
                        🚩 {rep.issueType} • {rep.subjectName} ({rep.chapterName})
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                        রিপোর্টকারী: {rep.reportedBy} • {rep.createdAt} • {rep.status === 'resolved' ? '✅ সমাধানকৃত' : '⏳ অপেক্ষমাণ'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 4 }}>প্রশ্ন: {rep.questionText}</div>
                    <div style={{ fontSize: 13, color: 'var(--status-danger-text)', fontWeight: 700, marginBottom: 8 }}>
                      স্টুডেন্টের মন্তব্য: &ldquo;{rep.comment}&rdquo;
                    </div>

                    {editingReportId === rep.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                        <input type="text" className="ev-input" value={editRepQ} onChange={(e) => setEditRepQ(e.target.value)} />
                        <div className="ev-grid-2">
                          {editRepOpts.map((o, i) => (
                            <input
                              key={i}
                              type="text"
                              className="ev-input"
                              value={o}
                              onChange={(e) => {
                                const next = [...editRepOpts];
                                next[i] = e.target.value;
                                setEditRepOpts(next);
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>সঠিক উত্তর:</span>
                          {['ক', 'খ', 'গ', 'ঘ'].map((lbl, i) => (
                            <button
                              key={lbl}
                              type="button"
                              className={`ev-btn ev-btn-sm ${editRepAns === i ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                              onClick={() => setEditRepAns(i)}
                            >
                              {lbl}
                            </button>
                          ))}
                          <button
                            type="button"
                            className="ev-btn ev-btn-primary ev-btn-sm"
                            onClick={() => {
                              ['HSC', 'SSC'].forEach((cls) => {
                                getAvailableGroups(cls).forEach((grp) => {
                                  editCustomMcqFull({
                                    targetClass: cls,
                                    targetGroup: grp,
                                    subjectId: rep.subjectId,
                                    chapterId: rep.chapterId,
                                    questionId: rep.questionId,
                                    questionBn: editRepQ,
                                    optionsBn: editRepOpts,
                                    ansIndex: editRepAns,
                                  });
                                });
                              });
                              resolveQuestionReport(rep.id);
                              setEditingReportId(null);
                              setAdmStatusBanner('✅ প্রশ্নটি সংশোধন করা হয়েছে এবং রিপোর্ট সমাধানকৃত মার্ক হয়েছে!');
                            }}
                          >
                            💾 সেভ ও সমাধান করুন
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="ev-btn ev-btn-primary ev-btn-sm"
                          onClick={() => {
                            setEditingReportId(rep.id);
                            setEditRepQ(rep.questionText);
                            setEditRepOpts(rep.options?.length === 4 ? rep.options : ['', '', '', '']);
                            setEditRepAns(rep.currentAns || 0);
                          }}
                        >
                          ✏️ প্রশ্ন ও উত্তর সংশোধন করুন
                        </button>
                        {rep.status !== 'resolved' && (
                          <button
                            type="button"
                            className="ev-btn ev-btn-soft ev-btn-sm"
                            onClick={() => resolveQuestionReport(rep.id)}
                          >
                            ✅ সমাধানকৃত মার্ক করুন
                          </button>
                        )}
                        <button
                          type="button"
                          className="ev-btn ev-btn-danger ev-btn-sm"
                          onClick={() => deleteQuestionReport(rep.id)}
                        >
                          🗑️ মুছুন
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {adminSubTab === 'manage' && selectedAdmSubj && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  {selectedAdmSubj.icon} {selectedAdmSubj.name.bn} — মোট অধ্যায়: {selectedAdmSubj.chapters.length}
                </div>
                <button
                  type="button"
                  className="ev-btn ev-btn-danger ev-btn-sm"
                  onClick={() => deleteCustomSubject(admClass, admGroup, selectedAdmSubj.id)}
                >
                  🗑️ কাস্টম পরিবর্তন রিসেট
                </button>
              </div>

              {selectedAdmSubj.chapters.map((ch) => (
                <div key={ch.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 8 }}>
                    {ch.name.bn} ({ch.mcqs.length} MCQs)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
                    {ch.mcqs.map((q, qIdx) => (
                      <div
                        key={q.id}
                        style={{
                          padding: 10,
                          borderRadius: 10,
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 220, fontSize: 13.5, fontWeight: 600 }}>
                          {qIdx + 1}. {q.q.bn}
                        </div>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          {['ক', 'খ', 'গ', 'ঘ'].map((optLbl, oIdx) => (
                            <button
                              key={optLbl}
                              type="button"
                              className={`ev-btn ev-btn-sm ${q.ans === oIdx ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                              style={{ minWidth: 32, padding: '0 8px' }}
                              onClick={() =>
                                updateCustomMcqAnswer(admClass, admGroup, selectedAdmSubj.id, ch.id, q.id, oIdx)
                              }
                            >
                              {optLbl}
                            </button>
                          ))}
                          <button
                            type="button"
                            className="ev-btn ev-btn-danger ev-btn-sm"
                            onClick={() => deleteCustomMcq(admClass, admGroup, selectedAdmSubj.id, ch.id, q.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {adminSubTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>👥 রেজিস্টার্ড ইউজার তালিকা (Supabase Cloud Users)</div>
                  <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={fetchAdminCloudUsers}>
                    {loadingUsers ? '...' : '🔄 রিফ্রেশ'}
                  </button>
                </div>

                {cloudUsers.length === 0 ? (
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                    বর্তমানে ক্লাউড টেবিলে কোনো ইউজার পাওয়া যায়নি অথবা লোড হচ্ছে।
                  </p>
                ) : (
                  <div className="ev-table-wrap">
                    <table className="ev-table">
                      <thead>
                        <tr>
                          <th>নাম</th>
                          <th>ইউজারনেম</th>
                          <th>ট্র্যাক</th>
                          <th>XP / Level</th>
                          <th>স্ট্রিক</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cloudUsers.map((u) => (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 700 }}>{u.full_name || 'Scholar'}</td>
                            <td>{u.username || '—'}</td>
                            <td>{u.target_track || 'HSC'}</td>
                            <td className="font-mono">{u.xp || 0} XP (Lv.{u.level || 1})</td>
                            <td>🔥 {u.streak_days || 0}d</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>🔑 অ্যাডমিন গোপন পিন পরিবর্তন</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="password"
                    className="ev-input"
                    placeholder="নতুন পিন লিখুন (কমপক্ষে ৪ অক্ষর)"
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value)}
                  />
                  <button
                    type="button"
                    className="ev-btn ev-btn-primary"
                    onClick={() => {
                      if (newPinValue.trim().length >= 4) {
                        setAdminPin(newPinValue.trim());
                        setNewPinValue('');
                        setAdmStatusBanner('✅ অ্যাডমিন পিন সফলভাবে পরিবর্তন করা হয়েছে!');
                      }
                    }}
                  >
                    আপডেট পিন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* =====================================================================
     VIEW 5: RANK & BADGES (🛡️ activeTab === 'achievements')
     ===================================================================== */
  if (activeTab === 'achievements') {
    const allTiers = [
      { id: 'bronze', nameBn: 'ব্রোঞ্জ র‍্যাঙ্ক (I – III)', nameEn: 'Bronze Rank (I – III)', range: '0 – 199 RP', color: '#B45309', div: 'I' },
      { id: 'silver', nameBn: 'সিলভার র‍্যাঙ্ক (I – III)', nameEn: 'Silver Rank (I – III)', range: '200 – 399 RP', color: '#475569', div: 'II' },
      { id: 'gold', nameBn: 'গোল্ড র‍্যাঙ্ক (I – III)', nameEn: 'Gold Rank (I – III)', range: '400 – 649 RP', color: '#D97706', div: 'III' },
      { id: 'platinum', nameBn: 'প্লাটিনাম র‍্যাঙ্ক (I – III)', nameEn: 'Platinum Rank (I – III)', range: '650 – 849 RP', color: '#0284C7', div: 'IV' },
      { id: 'elite', nameBn: 'এলিট গ্র্যান্ডমাস্টার', nameEn: 'Elite Grandmaster', range: '850 – 1000 RP', color: '#7C3AED', div: 'MAX' },
    ];

    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">🛡️ {isBn ? 'র‍্যাঙ্ক প্রগ্রেশন (Bronze → Elite)' : 'Rank Progression (Bronze → Elite)'}</h3>
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
                      {isBn ? t.nameBn : t.nameEn} {isCurrent ? (isBn ? '• (বর্তমান র‍্যাঙ্ক)' : '• (Current Rank)') : ''}
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

  /* =====================================================================
     VIEW 6: ANALYTICS (📊 activeTab === 'Analytics')
     ===================================================================== */
  if (activeTab === 'Analytics') {
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">📊 {trKey('nav_analytics', language)}</h3>
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
              ? 'তুমি এখনো কোনো পরীক্ষায় অংশ নাওনি। যেকোনো বিষয়ে ক্লিক করে কুইজ শুরু করো!'
              : 'You have not taken any exams yet. Click any subject to start practicing!'}
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
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14.5 }}>{item.subjectName}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    {item.chapterName} • {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-mono" style={{ textAlign: 'right', fontWeight: 800 }}>
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

  /* =====================================================================
     VIEW 7: MISTAKE BANK (🎯 activeTab === 'mistakes')
     ===================================================================== */
  if (activeTab === 'mistakes') {
    const activeMistakes = mistakes.filter((m) => !m.mastered);
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">
            🎯 {trKey('nav_mistakes', language)} ({activeMistakes.length})
          </h3>
        </div>
        {activeMistakes.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isBn
              ? 'ভুলের খাতায় বর্তমানে কোনো প্রশ্ন নেই। কুইজে কোনো প্রশ্ন ভুল হলে তা এখানে অটোমেটিক জমা হবে।'
              : 'No pending mistakes in your Mistake Bank.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeMistakes.map((m) => (
              <div key={m.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-danger)', marginBottom: 4 }}>
                  {m.subjectName} • {m.chapterName}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{trText(m.question, language)}</div>
                <div style={{ fontSize: 13.5, color: 'var(--status-success)', fontWeight: 700 }}>
                  ✅ {isBn ? 'সঠিক উত্তর:' : 'Correct Answer:'} {(m.options.bn?.length ? m.options.bn : m.options.en)[m.correctIndex]}
                </div>
                <button
                  type="button"
                  className="ev-btn ev-btn-secondary ev-btn-sm"
                  style={{ marginTop: 8 }}
                  onClick={() => markMistakeMastered(m.id)}
                >
                  ✔️ {isBn ? 'আয়ত্ত করেছি (Remove)' : 'Mastered (Remove)'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* =====================================================================
     VIEW 8: FLASHCARDS (🗂️ activeTab === 'flashcards')
     ===================================================================== */
  if (activeTab === 'flashcards') {
    const card = flashcards[fcIndex % Math.max(1, flashcards.length)];
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">🗂️ {trKey('nav_flashcards', language)}</h3>
        </div>

        <div className="ev-grid-2" style={{ marginBottom: 16 }}>
          <input
            type="text"
            className="ev-input"
            placeholder={isBn ? 'ফ্ল্যাশকার্ডের প্রশ্ন / সূত্রের নাম...' : 'Flashcard Front (Question / Term)...'}
            value={newFcFront}
            onChange={(e) => setNewFcFront(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="ev-input"
              placeholder={isBn ? 'উত্তর / সমীকরণ...' : 'Flashcard Back (Answer / Formula)...'}
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

        {flashcards.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isBn
              ? 'তোমার নিজস্ব ফ্ল্যাশকার্ড তৈরি করতে ওপরে প্রশ্ন ও উত্তর লিখে "+ যোগ" বাটনে ক্লিক করো।'
              : 'Create your own flashcards above to review key formulas and concepts.'}
          </p>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div
              onClick={() => setFcFlipped(!fcFlipped)}
              style={{
                maxWidth: 500,
                margin: '0 auto',
                minHeight: 170,
                padding: 24,
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
              <span className="ev-badge-pill ev-badge-indigo">{fcFlipped ? (isBn ? 'উত্তর' : 'Answer') : isBn ? 'প্রশ্ন' : 'Question'}</span>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{trText(fcFlipped ? card.back : card.front, language)}</div>
              <small style={{ color: 'var(--text-muted)' }}>({isBn ? 'ট্যাপ করে উল্টাও' : 'Tap to flip'})</small>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                className="ev-btn ev-btn-secondary ev-btn-sm"
                onClick={() => {
                  setFcFlipped(false);
                  setFcIndex((i) => (i + 1) % flashcards.length);
                }}
              >
                {isBn ? 'পরবর্তী কার্ড →' : 'Next Card →'}
              </button>
              <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => deleteFlashcard(card.id)}>
                🗑️ {isBn ? 'মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* =====================================================================
     VIEW 9: STUDY PLANNER (📅 activeTab === 'planner')
     ===================================================================== */
  if (activeTab === 'planner') {
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">📅 {trKey('nav_planner', language)}</h3>
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
                dueDate: new Date().toISOString().slice(0, 10),
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
              ? 'তোমার পড়ার রুটিনে এখনো কোনো টাস্ক নেই। ওপরে টার্গেট লিখে যোগ করো!'
              : 'No study tasks yet. Add your daily study goals above!'}
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
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700 }}>
                  <input type="checkbox" checked={t.completed} onChange={() => toggleStudyTask(t.id)} />
                  <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>
                    {t.title} — <small style={{ color: 'var(--brand-primary)' }}>{t.subjectName} ({t.targetMinutes}m)</small>
                  </span>
                </label>
                <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => deleteStudyTask(t.id)}>
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* =====================================================================
     VIEW 10: DOUBT FORUM (💬 activeTab === 'community')
     ===================================================================== */
  return (
    <div className="ev-card">
      <div className="ev-section-header">
        <h3 className="ev-section-title">💬 {trKey('nav_community', language)}</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="ev-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder={isBn ? 'তোমার প্রশ্নের শিরোনাম...' : 'Question Title...'}
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

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            className="ev-input"
            placeholder={isBn ? 'বিস্তারিত প্রশ্ন বা সমস্যা লেখো...' : 'Describe your academic question...'}
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
                authorAvatar: '🎓',
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
            ? 'ফোরামে এখনো কোনো প্রশ্ন পোস্ট করা হয়নি। তোমার যেকোনো একাডেমিক প্রশ্ন ওপরে লিখে পোস্ট করতে পারো!'
            : 'No questions posted yet. Ask your first academic doubt above!'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {communityPosts.map((post) => (
            <div key={post.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                <span>
                  {post.authorAvatar || '🎓'} {post.authorName} • <strong style={{ color: 'var(--brand-primary)' }}>{post.authorRank}</strong> • {post.subjectName}
                </span>
                <span>{post.createdAt}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{post.title}</div>
              {post.body && <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 8 }}>{post.body}</p>}

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => togglePostLike(post.id)}>
                  👍 {post.likes}
                </button>
              </div>

              {post.replies.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--brand-primary-border)' }}>
                  {post.replies.map((r) => (
                    <div key={r.id} style={{ fontSize: 13 }}>
                      <strong>{r.authorName}:</strong> {r.text}
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
          ))}
        </div>
      )}
    </div>
  );
};
