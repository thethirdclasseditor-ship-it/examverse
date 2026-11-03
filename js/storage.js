/* ==========================================================================
   ExamVerse — LocalStorage Persistence & Honest Progress Engine (js/storage.js)
   Step 1 + Step 2 + Step 3 Updates:
   - Supports all 10 Core Subjects (Science, Business Studies, Humanities, Common)
   - Tracks Creative Question (CQ) self-evaluated scores & completion count
   - Fresh Zero Default State, Asia/Dhaka date-based streak, rolling 7-day chart
   ========================================================================== */

(function () {
  var STORAGE_KEY = 'examverse_state_v2';
  var THEME_KEY = 'examverse_theme';
  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function getDhakaDateStr(dateObj) {
    var d = dateObj || new Date();
    try {
      var parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).formatToParts(d);
      var y = '', m = '', day = '';
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === 'year') y = parts[i].value;
        if (parts[i].type === 'month') m = parts[i].value;
        if (parts[i].type === 'day') day = parts[i].value;
      }
      if (y && m && day) return y + '-' + m + '-' + day;
    } catch (e) {}
    var utcMs = d.getTime() + (d.getTimezoneOffset() * 60000);
    var dhakaDate = new Date(utcMs + 6 * 3600000);
    var yr = dhakaDate.getFullYear();
    var mo = String(dhakaDate.getMonth() + 1).padStart(2, '0');
    var da = String(dhakaDate.getDate()).padStart(2, '0');
    return yr + '-' + mo + '-' + da;
  }

  function buildRolling7Days(existingArray) {
    var existingMap = {};
    if (Array.isArray(existingArray)) {
      existingArray.forEach(function (item) {
        if (item && item.dateKey) {
          existingMap[item.dateKey] = item;
        }
      });
    }
    var result = [];
    var now = new Date();
    for (var i = 6; i >= 0; i--) {
      var target = new Date(now.getTime() - i * 86400000);
      var key = getDhakaDateStr(target);
      var parts = key.split('-');
      var localDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      var dayLabel = DAY_NAMES[localDate.getDay()];
      var prev = existingMap[key];
      result.push({
        dateKey: key,
        day: dayLabel,
        attempted: prev ? Number(prev.attempted || 0) : 0,
        correct: prev ? Number(prev.correct || 0) : 0,
        xp: prev ? Number(prev.xp || 0) : 0
      });
    }
    return result;
  }

  function getXpForNextLevel(level) {
    var lv = Math.max(1, Number(level) || 1);
    return lv * 500;
  }

  function createFreshDefaultState() {
    var todayKey = getDhakaDateStr();
    return {
      theme: 'light',
      isDemoMode: false,
      user: {
        name: 'Student Scholar',
        username: '@student_ev',
        avatarInitials: 'SS',
        targetTrack: 'University & Engineering Admission',
        level: 1,
        xp: 0,
        xpForNextLevel: 500,
        streakDays: 0,
        streakActive: false,
        lastStudyDate: null
      },
      stats: {
        totalQuestionsSeen: 0,
        totalAttempted: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        totalSkipped: 0,
        completedQuizzes: 0,
        totalScorePctSum: 0,
        totalMistakesResolved: 0,
        stemQuestionsSolved: 0,
        cqCompletedCount: 0,
        weeklyActivity: buildRolling7Days([]),
        subjectMastery: {
          physics: 0,
          chemistry: 0,
          math: 0,
          biology: 0,
          english: 0,
          bangla: 0,
          gk: 0,
          ict: 0,
          accounting: 0,
          economics: 0
        },
        subjectStats: {
          physics: { attempted: 0, correct: 0 },
          chemistry: { attempted: 0, correct: 0 },
          math: { attempted: 0, correct: 0 },
          biology: { attempted: 0, correct: 0 },
          english: { attempted: 0, correct: 0 },
          bangla: { attempted: 0, correct: 0 },
          gk: { attempted: 0, correct: 0 },
          ict: { attempted: 0, correct: 0 },
          accounting: { attempted: 0, correct: 0 },
          economics: { attempted: 0, correct: 0 }
        }
      },
      dailyChallenge: {
        date: todayKey,
        totalQuestions: 8,
        completedQuestions: 0,
        isCompleted: false,
        completedDate: null,
        rewardXp: 150
      },
      continueLearning: null,
      activeSession: null,
      lastResult: null,
      bookmarks: [],
      bookmarkNotes: {},
      cqScores: {},
      mistakes: [],
      quizHistory: [],
      unlockedBadges: [],
      notifications: [
        {
          id: 'notif-welcome',
          title: 'Welcome to ExamVerse!',
          body: 'Explore all 10 subjects, Multi-Statement (i, ii, iii) MCQs, Creative Questions (CQ), or build a Custom Exam.',
          time: 'Today',
          unread: true
        }
      ],
      settings: {
        soundEnabled: true,
        soundVolume: 0.75,
        vibrationEnabled: true,
        timerEnabled: true,
        defaultDurationPerQuestionSec: 45,
        negativeMarkingEnabled: true,
        language: 'bilingual',
        notificationsEnabled: true
      }
    };
  }

  var StorageManager = {
    state: createFreshDefaultState(),

    getTodayDateStr: function () {
      return getDhakaDateStr();
    },

    init: function () {
      var fresh = createFreshDefaultState();
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          this.state = Object.assign({}, fresh, parsed);
          this.state.user = Object.assign({}, fresh.user, parsed.user || {});
          this.state.stats = Object.assign({}, fresh.stats, parsed.stats || {});
          this.state.stats.subjectMastery = Object.assign({}, fresh.stats.subjectMastery, (parsed.stats && parsed.stats.subjectMastery) || {});
          this.state.stats.subjectStats = Object.assign({}, fresh.stats.subjectStats, (parsed.stats && parsed.stats.subjectStats) || {});
          this.state.settings = Object.assign({}, fresh.settings, parsed.settings || {});
          this.state.dailyChallenge = Object.assign({}, fresh.dailyChallenge, parsed.dailyChallenge || {});
          this.state.bookmarkNotes = Object.assign({}, fresh.bookmarkNotes, parsed.bookmarkNotes || {});
          this.state.cqScores = Object.assign({}, fresh.cqScores, parsed.cqScores || {});
        }
        var savedTheme = window.localStorage.getItem(THEME_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          this.state.theme = savedTheme;
        } else {
          this.state.theme = 'light';
          window.localStorage.setItem(THEME_KEY, 'light');
        }
      } catch (e) {
        this.state = fresh;
      }

      this.syncCalendarState();
      this.applyTheme(this.state.theme);
      return this.state;
    },

    syncCalendarState: function () {
      var todayKey = getDhakaDateStr();
      var yesterdayKey = getDhakaDateStr(new Date(Date.now() - 86400000));

      this.state.stats.weeklyActivity = buildRolling7Days(this.state.stats.weeklyActivity);

      if (this.state.dailyChallenge.date !== todayKey) {
        this.state.dailyChallenge.date = todayKey;
        this.state.dailyChallenge.completedQuestions = 0;
        this.state.dailyChallenge.isCompleted = (this.state.dailyChallenge.completedDate === todayKey);
      }

      var lastDate = this.state.user.lastStudyDate;
      if (!lastDate) {
        this.state.user.streakDays = 0;
        this.state.user.streakActive = false;
      } else if (lastDate === todayKey || lastDate === yesterdayKey) {
        this.state.user.streakActive = true;
      } else {
        this.state.user.streakDays = 0;
        this.state.user.streakActive = false;
      }

      this.recalculateLevelProgress();
      this.save();
    },

    recalculateLevelProgress: function () {
      var u = this.state.user;
      u.xp = Math.max(0, Number(u.xp) || 0);
      var level = 1;
      while (u.xp >= getXpForNextLevel(level)) {
        level += 1;
      }
      u.level = level;
      u.xpForNextLevel = getXpForNextLevel(level);
    },

    save: function () {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        window.localStorage.setItem(THEME_KEY, this.state.theme);
      } catch (e) {}
    },

    saveActiveSession: function (sessionData) {
      this.state.activeSession = sessionData ? JSON.parse(JSON.stringify(sessionData)) : null;
      if (sessionData && !sessionData.isSubmitted && !sessionData.isEmpty) {
        var answeredCount = Object.keys(sessionData.answers || {}).length;
        var totalCount = (sessionData.questions || []).length || 1;
        this.state.continueLearning = {
          title: sessionData.title,
          subjectId: sessionData.primarySubjectId === 'all' ? 'physics' : (sessionData.primarySubjectId || 'physics'),
          categoryId: sessionData.categoryId || 'uni',
          progressPct: Math.min(100, Math.round((answeredCount / totalCount) * 100)),
          completedCount: answeredCount,
          totalCount: totalCount,
          mode: sessionData.mode,
          hasActiveSession: true
        };
      }
      this.save();
    },

    applyTheme: function (themeName) {
      var validTheme = themeName === 'dark' ? 'dark' : 'light';
      this.state.theme = validTheme;
      document.documentElement.setAttribute('data-theme', validTheme);
      var metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', validTheme === 'dark' ? '#0B1120' : '#4338CA');
      }
      try {
        window.localStorage.setItem(THEME_KEY, validTheme);
      } catch (e) {}
      this.save();
    },

    toggleTheme: function () {
      var next = this.state.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme(next);
      return next;
    },

    isBookmarked: function (questionId) {
      return this.state.bookmarks.indexOf(questionId) !== -1;
    },

    toggleBookmark: function (questionId) {
      var idx = this.state.bookmarks.indexOf(questionId);
      var added = false;
      if (idx === -1) {
        this.state.bookmarks.unshift(questionId);
        added = true;
      } else {
        this.state.bookmarks.splice(idx, 1);
      }
      this.save();
      return added;
    },

    saveBookmarkNote: function (questionId, noteText) {
      if (!this.state.bookmarkNotes) {
        this.state.bookmarkNotes = {};
      }
      var clean = String(noteText || '').trim();
      if (clean) {
        this.state.bookmarkNotes[questionId] = clean;
      } else {
        delete this.state.bookmarkNotes[questionId];
      }
      this.save();
    },

    /* Save Creative Question (CQ) 10-Mark Self-Evaluation Score */
    saveCqSelfScore: function (cqId, marksOutOf10) {
      if (!this.state.cqScores) {
        this.state.cqScores = {};
      }
      var isFirstTime = typeof this.state.cqScores[cqId] === 'undefined';
      var validMarks = Math.max(0, Math.min(10, Number(marksOutOf10) || 0));
      this.state.cqScores[cqId] = {
        marks: validMarks,
        date: getDhakaDateStr()
      };
      if (isFirstTime && validMarks > 0) {
        this.state.stats.cqCompletedCount = (this.state.stats.cqCompletedCount || 0) + 1;
        this.state.user.xp += validMarks * 3;
        this.recalculateLevelProgress();
      }
      this.save();
    },

    addMistake: function (questionId, selectedIndex, customNote) {
      var existingIdx = -1;
      for (var i = 0; i < this.state.mistakes.length; i++) {
        if (this.state.mistakes[i].questionId === questionId) {
          existingIdx = i;
          break;
        }
      }
      var prevRetries = existingIdx !== -1 ? (this.state.mistakes[existingIdx].retryCount || 0) + 1 : 1;
      var entry = {
        questionId: questionId,
        selectedIndex: selectedIndex,
        timestamp: getDhakaDateStr(),
        status: 'Needs Review',
        retryCount: prevRetries,
        note: customNote || 'Review concept explanation and formula application.'
      };
      if (existingIdx !== -1) {
        this.state.mistakes[existingIdx] = entry;
      } else {
        this.state.mistakes.unshift(entry);
      }
      this.save();
    },

    removeMistake: function (questionId) {
      var beforeLen = this.state.mistakes.length;
      this.state.mistakes = this.state.mistakes.filter(function (m) {
        return m.questionId !== questionId;
      });
      if (this.state.mistakes.length < beforeLen) {
        this.state.stats.totalMistakesResolved = (this.state.stats.totalMistakesResolved || 0) + 1;
      }
      this.evaluateAndAwardBadges(null);
      this.save();
    },

    addNotification: function (title, body) {
      this.state.notifications.unshift({
        id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        body: body,
        time: 'Just now',
        unread: true
      });
      if (this.state.notifications.length > 20) {
        this.state.notifications = this.state.notifications.slice(0, 20);
      }
    },

    markAllNotificationsRead: function () {
      this.state.notifications.forEach(function (n) {
        n.unread = false;
      });
      this.save();
    },

    clearNotifications: function () {
      this.state.notifications = [];
      this.save();
    },

    evaluateAndAwardBadges: function (resultPayload) {
      var self = this;
      var s = this.state.stats;
      var u = this.state.user;
      var unlocked = this.state.unlockedBadges;

      var conditions = {
        'badge-first-step': s.completedQuizzes >= 1 && s.totalAttempted >= 1,
        'badge-streak-7': u.streakDays >= 7,
        'badge-precision-90': Boolean(resultPayload && resultPayload.attempted >= 3 && resultPayload.accuracy >= 90),
        'badge-stem-scholar': (s.stemQuestionsSolved || 0) >= 20,
        'badge-mistake-conqueror': (s.totalMistakesResolved || 0) >= 3 && this.state.mistakes.length === 0,
        'badge-centurion': u.level >= 10 && u.xp >= 4500
      };

      var newlyUnlocked = [];
      window.EXAMVERSE_DATA.achievements.forEach(function (ach) {
        if (unlocked.indexOf(ach.id) === -1 && conditions[ach.id]) {
          unlocked.push(ach.id);
          u.xp += (ach.xpBonus || 0);
          newlyUnlocked.push(ach);
          self.addNotification(
            'Achievement Unlocked: ' + ach.title,
            'You earned the "' + ach.title + '" badge and +' + ach.xpBonus + ' Bonus XP!'
          );
        }
      });

      if (newlyUnlocked.length > 0) {
        this.recalculateLevelProgress();
      }
      return newlyUnlocked;
    },

    recordQuizCompletion: function (resultPayload) {
      var s = this.state.stats;
      var todayKey = getDhakaDateStr();
      var yesterdayKey = getDhakaDateStr(new Date(Date.now() - 86400000));

      this.state.activeSession = null;
      this.state.lastResult = JSON.parse(JSON.stringify(resultPayload));

      s.totalQuestionsSeen = (s.totalQuestionsSeen || 0) + resultPayload.total;
      s.totalAttempted += resultPayload.attempted;
      s.totalCorrect += resultPayload.correct;
      s.totalIncorrect = (s.totalIncorrect || 0) + resultPayload.incorrect;
      s.totalSkipped = (s.totalSkipped || 0) + resultPayload.skipped;

      if (resultPayload.attempted > 0) {
        s.completedQuizzes += 1;
        s.totalScorePctSum += resultPayload.accuracy;
      }

      this.state.stats.weeklyActivity = buildRolling7Days(this.state.stats.weeklyActivity);
      for (var i = 0; i < this.state.stats.weeklyActivity.length; i++) {
        if (this.state.stats.weeklyActivity[i].dateKey === todayKey) {
          this.state.stats.weeklyActivity[i].attempted += resultPayload.attempted;
          this.state.stats.weeklyActivity[i].correct += resultPayload.correct;
          this.state.stats.weeklyActivity[i].xp += resultPayload.xpEarned;
          break;
        }
      }

      if (resultPayload.subjectBreakdown) {
        Object.keys(resultPayload.subjectBreakdown).forEach(function (subjId) {
          var item = resultPayload.subjectBreakdown[subjId];
          if (!s.subjectStats[subjId]) {
            s.subjectStats[subjId] = { attempted: 0, correct: 0 };
          }
          var subjAttempted = item.attempted || 0;
          if (subjAttempted > 0) {
            s.subjectStats[subjId].attempted += subjAttempted;
            s.subjectStats[subjId].correct += item.correct;
            var totalSubjAtt = s.subjectStats[subjId].attempted;
            var totalSubjCorr = s.subjectStats[subjId].correct;
            s.subjectMastery[subjId] = Math.min(100, Math.round((totalSubjCorr / totalSubjAtt) * 100));

            if (subjId === 'physics' || subjId === 'chemistry' || subjId === 'math') {
              s.stemQuestionsSolved = (s.stemQuestionsSolved || 0) + item.correct;
            }
          }
        });
      }

      if (resultPayload.attempted > 0) {
        var lastDate = this.state.user.lastStudyDate;
        if (lastDate === todayKey) {
          this.state.user.streakActive = true;
        } else if (lastDate === yesterdayKey) {
          this.state.user.streakDays += 1;
          this.state.user.streakActive = true;
          this.state.user.lastStudyDate = todayKey;
        } else {
          this.state.user.streakDays = 1;
          this.state.user.streakActive = true;
          this.state.user.lastStudyDate = todayKey;
        }
      }

      if (resultPayload.isDailyChallenge && resultPayload.attempted > 0) {
        this.state.dailyChallenge.date = todayKey;
        this.state.dailyChallenge.completedQuestions = Math.max(
          this.state.dailyChallenge.completedQuestions,
          resultPayload.attempted
        );
        if (resultPayload.attempted >= this.state.dailyChallenge.totalQuestions) {
          this.state.dailyChallenge.isCompleted = true;
          this.state.dailyChallenge.completedDate = todayKey;
        }
      }

      this.state.user.xp += resultPayload.xpEarned;
      this.recalculateLevelProgress();
      this.evaluateAndAwardBadges(resultPayload);

      this.state.continueLearning = {
        title: resultPayload.title,
        subjectId: resultPayload.primarySubjectId === 'all' ? 'physics' : (resultPayload.primarySubjectId || 'physics'),
        categoryId: resultPayload.categoryId || 'uni',
        progressPct: 100,
        completedCount: resultPayload.attempted,
        totalCount: resultPayload.total,
        mode: resultPayload.mode,
        hasActiveSession: false
      };

      this.state.quizHistory.unshift({
        id: resultPayload.sessionId || ('hist-' + Date.now()),
        title: resultPayload.title,
        category: resultPayload.categoryLabel || 'Practice Set',
        categoryId: resultPayload.categoryId || 'uni',
        subjectId: resultPayload.primarySubjectId || 'physics',
        mode: resultPayload.mode,
        score: resultPayload.correct,
        netScore: resultPayload.netScore,
        negativeMark: resultPayload.negativeMark || 0,
        total: resultPayload.total,
        attempted: resultPayload.attempted,
        incorrect: resultPayload.incorrect,
        skipped: resultPayload.skipped,
        accuracy: resultPayload.accuracy,
        scorePct: resultPayload.scorePct,
        timeTakenSec: resultPayload.timeTakenSec,
        xpEarned: resultPayload.xpEarned,
        date: todayKey,
        questionIds: (resultPayload.questions || []).map(function (q) { return q.id; }),
        questionsSnapshot: JSON.parse(JSON.stringify(resultPayload.questions || [])),
        answersSnapshot: JSON.parse(JSON.stringify(resultPayload.answers || {})),
        subjectBreakdown: JSON.parse(JSON.stringify(resultPayload.subjectBreakdown || {}))
      });

      this.save();
    },

    resetProgress: function () {
      var preservedTheme = this.state.theme;
      var preservedSettings = JSON.parse(JSON.stringify(this.state.settings));
      var fresh = createFreshDefaultState();
      fresh.theme = preservedTheme;
      fresh.settings = preservedSettings;
      this.state = fresh;

      if (window.ExamVerseQuiz) {
        window.ExamVerseQuiz.stopTimer();
        window.ExamVerseQuiz.session = null;
        window.ExamVerseQuiz.lastResult = null;
      }

      this.save();
    },

    loadSampleDemoProfile: function () {
      var todayKey = getDhakaDateStr();
      var yesterdayKey = getDhakaDateStr(new Date(Date.now() - 86400000));
      var fresh = createFreshDefaultState();
      fresh.theme = this.state.theme;
      fresh.settings = JSON.parse(JSON.stringify(this.state.settings));
      fresh.isDemoMode = true;
      fresh.user = {
        name: 'Arian Chowdhury (Demo)',
        username: '@arian_demo',
        avatarInitials: 'AC',
        targetTrack: 'University & Engineering Admission',
        level: 7,
        xp: 3480,
        xpForNextLevel: 3500,
        streakDays: 5,
        streakActive: true,
        lastStudyDate: yesterdayKey
      };
      fresh.stats.totalQuestionsSeen = 48;
      fresh.stats.totalAttempted = 45;
      fresh.stats.totalCorrect = 38;
      fresh.stats.totalIncorrect = 7;
      fresh.stats.totalSkipped = 3;
      fresh.stats.completedQuizzes = 6;
      fresh.stats.totalScorePctSum = 504;
      fresh.stats.stemQuestionsSolved = 24;
      fresh.stats.subjectMastery = {
        physics: 85,
        chemistry: 78,
        math: 88,
        biology: 75,
        english: 80,
        bangla: 82,
        gk: 70,
        ict: 86,
        accounting: 80,
        economics: 76
      };
      fresh.bookmarks = ['q-phy-101', 'q-chem-203'];
      fresh.bookmarkNotes = {
        'q-phy-101': 'Equal magnitude vectors with resultant P always have θ = 120°.'
      };
      fresh.mistakes = [
        {
          questionId: 'q-phy-102',
          selectedIndex: 2,
          timestamp: yesterdayKey,
          status: 'Needs Review',
          retryCount: 1,
          note: 'Convert Celsius (327°C and 27°C) to Kelvin before applying η = 1 - T2/T1.'
        }
      ];
      fresh.unlockedBadges = ['badge-first-step', 'badge-stem-scholar'];
      fresh.dailyChallenge.date = todayKey;
      this.state = fresh;
      this.recalculateLevelProgress();
      this.save();
    }
  };

  window.ExamVerseStorage = StorageManager;
})();
