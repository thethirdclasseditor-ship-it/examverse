/* ==========================================================================
   ExamVerse — LocalStorage Persistence & Firebase-Ready State Manager (js/storage.js)
   Default Theme: Light Mode ('light') when no preference exists in LocalStorage
   ========================================================================== */

(function () {
  var STORAGE_KEY = 'examverse_state_v1';
  var THEME_KEY = 'examverse_theme';

  var DEFAULT_STATE = {
    theme: 'light', /* Strictly Light Mode by default */
    user: {
      name: 'Arian Chowdhury',
      username: '@arian_ev',
      avatarInitials: 'AC',
      targetTrack: 'University & Engineering Admission',
      level: 14,
      xp: 3480,
      xpForNextLevel: 4000,
      streakDays: 9,
      streakActive: true,
      lastStudyDate: '2026-11-02'
    },
    stats: {
      totalAttempted: 412,
      totalCorrect: 338,
      completedQuizzes: 34,
      totalScorePctSum: 2788,
      weeklyActivity: [
        { day: 'Tue', attempted: 42, correct: 34, xp: 210 },
        { day: 'Wed', attempted: 56, correct: 47, xp: 290 },
        { day: 'Thu', attempted: 38, correct: 30, xp: 185 },
        { day: 'Fri', attempted: 64, correct: 54, xp: 340 },
        { day: 'Sat', attempted: 72, correct: 61, xp: 390 },
        { day: 'Sun', attempted: 48, correct: 39, xp: 245 },
        { day: 'Mon', attempted: 60, correct: 51, xp: 315 }
      ],
      subjectMastery: {
        math: 86,
        bangla: 82,
        ict: 80,
        physics: 78,
        english: 75,
        chemistry: 71,
        biology: 68,
        gk: 64
      }
    },
    dailyChallenge: {
      date: '2026-11-02',
      totalQuestions: 8,
      completedQuestions: 5,
      isCompleted: false,
      rewardXp: 150
    },
    continueLearning: {
      title: 'Vectors & Classical Mechanics',
      subjectId: 'physics',
      categoryId: 'uni',
      progressPct: 68,
      completedCount: 17,
      totalCount: 25,
      mode: 'practice'
    },
    bookmarks: ['q-phy-101', 'q-chem-203', 'q-gk-702'],
    mistakes: [
      {
        questionId: 'q-phy-102',
        selectedIndex: 2,
        timestamp: 'Yesterday, 8:40 PM',
        note: 'Forgot to convert Celsius (327°C and 27°C) to Kelvin before applying η = 1 - T2/T1.'
      },
      {
        questionId: 'q-chem-203',
        selectedIndex: 1,
        timestamp: '2 days ago',
        note: 'Confused Clemmensen reagent (Zn-Hg/HCl) with Wolff-Kishner reagent (NH2NH2/KOH).'
      },
      {
        questionId: 'q-eng-501',
        selectedIndex: 0,
        timestamp: '3 days ago',
        note: 'Relative pronoun antecedent agreement with plural noun before singular head.'
      }
    ],
    quizHistory: [
      {
        id: 'hist-101',
        title: 'BUET & DU A-Unit STEM Diagnostic',
        category: 'Engineering Admission',
        subjectId: 'physics',
        mode: 'exam',
        score: 7,
        total: 8,
        accuracy: 88,
        timeTakenSec: 312,
        xpEarned: 140,
        date: 'Today, 4:15 PM'
      },
      {
        id: 'hist-102',
        title: '47th BCS Preliminary Master Capsule',
        category: 'BCS',
        subjectId: 'gk',
        mode: 'practice',
        score: 6,
        total: 8,
        accuracy: 75,
        timeTakenSec: 275,
        xpEarned: 110,
        date: 'Yesterday, 9:10 PM'
      },
      {
        id: 'hist-103',
        title: 'Medical MBBS Rapid Fire',
        category: 'Medical Admission',
        subjectId: 'biology',
        mode: 'exam',
        score: 6,
        total: 7,
        accuracy: 86,
        timeTakenSec: 240,
        xpEarned: 125,
        date: 'Oct 30, 2026'
      },
      {
        id: 'hist-104',
        title: 'Higher Math Calculus & Matrices',
        category: 'HSC',
        subjectId: 'math',
        mode: 'practice',
        score: 9,
        total: 10,
        accuracy: 90,
        timeTakenSec: 380,
        xpEarned: 160,
        date: 'Oct 28, 2026'
      }
    ],
    unlockedBadges: ['badge-first-step', 'badge-streak-7', 'badge-precision-90', 'badge-stem-scholar'],
    notifications: [
      {
        id: 'notif-1',
        title: 'Daily Merit Sprint Ready',
        body: 'Complete 3 more questions today to claim your +150 XP bonus and extend your 9-day streak.',
        time: '15m ago',
        unread: true
      },
      {
        id: 'notif-2',
        title: 'Leaderboard Rank Up',
        body: 'You moved up to #3 on the Weekly Friends & Global STEM Leaderboard!',
        time: '3h ago',
        unread: true
      },
      {
        id: 'notif-3',
        title: 'Mistake Bank Reminder',
        body: 'You have 3 saved conceptual mistakes ready for a 2-minute revision quiz.',
        time: 'Yesterday',
        unread: false
      }
    ],
    settings: {
      soundEnabled: true,
      vibrationEnabled: true,
      timerEnabled: true,
      defaultDurationPerQuestionSec: 45,
      language: 'bilingual', /* 'en', 'bn', 'bilingual' */
      notificationsEnabled: true,
      cloudSyncReady: false
    }
  };

  function cloneDefault() {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  var StorageManager = {
    state: cloneDefault(),

    init: function () {
      try {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          this.state = Object.assign(cloneDefault(), parsed);
          this.state.user = Object.assign(cloneDefault().user, parsed.user || {});
          this.state.stats = Object.assign(cloneDefault().stats, parsed.stats || {});
          this.state.settings = Object.assign(cloneDefault().settings, parsed.settings || {});
        }
        var savedTheme = window.localStorage.getItem(THEME_KEY);
        if (savedTheme === 'dark' || savedTheme === 'light') {
          this.state.theme = savedTheme;
        } else {
          this.state.theme = 'light';
          window.localStorage.setItem(THEME_KEY, 'light');
        }
      } catch (e) {
        this.state = cloneDefault();
      }
      this.applyTheme(this.state.theme);
      return this.state;
    },

    save: function () {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        window.localStorage.setItem(THEME_KEY, this.state.theme);
      } catch (e) {
        /* Fallback to in-memory state inside restricted sandboxes */
      }
    },

    applyTheme: function (themeName) {
      var validTheme = themeName === 'dark' ? 'dark' : 'light';
      this.state.theme = validTheme;
      document.documentElement.setAttribute('data-theme', validTheme);
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

    addMistake: function (questionId, selectedIndex, customNote) {
      var existingIdx = -1;
      for (var i = 0; i < this.state.mistakes.length; i++) {
        if (this.state.mistakes[i].questionId === questionId) {
          existingIdx = i;
          break;
        }
      }
      var entry = {
        questionId: questionId,
        selectedIndex: selectedIndex,
        timestamp: 'Just now',
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
      this.state.mistakes = this.state.mistakes.filter(function (m) {
        return m.questionId !== questionId;
      });
      if (this.state.unlockedBadges.indexOf('badge-mistake-conqueror') === -1) {
        this.state.unlockedBadges.push('badge-mistake-conqueror');
      }
      this.save();
    },

    recordQuizCompletion: function (resultPayload) {
      var s = this.state.stats;
      s.totalAttempted += resultPayload.total;
      s.totalCorrect += resultPayload.correct;
      s.completedQuizzes += 1;
      s.totalScorePctSum += resultPayload.accuracy;

      /* Update weekly activity today (last bar) */
      if (s.weeklyActivity && s.weeklyActivity.length > 0) {
        var todayBar = s.weeklyActivity[s.weeklyActivity.length - 1];
        todayBar.attempted += resultPayload.total;
        todayBar.correct += resultPayload.correct;
        todayBar.xp += resultPayload.xpEarned;
      }

      /* Update Subject Mastery */
      if (resultPayload.subjectBreakdown) {
        var self = this;
        Object.keys(resultPayload.subjectBreakdown).forEach(function (subjId) {
          var item = resultPayload.subjectBreakdown[subjId];
          if (item.total > 0) {
            var sessionPct = Math.round((item.correct / item.total) * 100);
            var currentMastery = self.state.stats.subjectMastery[subjId] || 70;
            self.state.stats.subjectMastery[subjId] = Math.min(
              99,
              Math.max(35, Math.round(currentMastery * 0.75 + sessionPct * 0.25))
            );
          }
        });
      }

      /* Award XP & Level Up check */
      this.state.user.xp += resultPayload.xpEarned;
      while (this.state.user.xp >= this.state.user.xpForNextLevel) {
        this.state.user.level += 1;
        this.state.user.xpForNextLevel += 600;
      }

      /* Keep streak active */
      if (!this.state.user.streakActive) {
        this.state.user.streakActive = true;
        this.state.user.streakDays = 1;
      }

      /* Update Daily Challenge if applicable */
      if (resultPayload.isDailyChallenge) {
        this.state.dailyChallenge.completedQuestions = this.state.dailyChallenge.totalQuestions;
        this.state.dailyChallenge.isCompleted = true;
      } else {
        this.state.dailyChallenge.completedQuestions = Math.min(
          this.state.dailyChallenge.totalQuestions,
          this.state.dailyChallenge.completedQuestions + resultPayload.correct
        );
        if (this.state.dailyChallenge.completedQuestions >= this.state.dailyChallenge.totalQuestions) {
          this.state.dailyChallenge.isCompleted = true;
        }
      }

      /* Unlock precision badge if accuracy >= 90% */
      if (resultPayload.accuracy >= 90 && this.state.unlockedBadges.indexOf('badge-precision-90') === -1) {
        this.state.unlockedBadges.push('badge-precision-90');
      }

      /* Prepend to Quiz History */
      this.state.quizHistory.unshift({
        id: 'hist-' + Date.now(),
        title: resultPayload.title,
        category: resultPayload.categoryLabel || 'Practice Set',
        subjectId: resultPayload.primarySubjectId || 'physics',
        mode: resultPayload.mode,
        score: resultPayload.correct,
        total: resultPayload.total,
        accuracy: resultPayload.accuracy,
        timeTakenSec: resultPayload.timeTakenSec,
        xpEarned: resultPayload.xpEarned,
        date: 'Just now'
      });

      this.save();
    },

    resetProgress: function () {
      var currentTheme = this.state.theme;
      this.state = cloneDefault();
      this.state.theme = currentTheme;
      this.state.stats.totalAttempted = 0;
      this.state.stats.totalCorrect = 0;
      this.state.stats.completedQuizzes = 0;
      this.state.stats.totalScorePctSum = 0;
      this.state.user.xp = 0;
      this.state.user.level = 1;
      this.state.user.xpForNextLevel = 500;
      this.state.quizHistory = [];
      this.state.mistakes = [];
      this.state.bookmarks = [];
      this.state.dailyChallenge.completedQuestions = 0;
      this.state.dailyChallenge.isCompleted = false;
      this.save();
    },

    /* Frontend-Ready Cloud Adapter Stub for Future Firebase Auth & Firestore Integration */
    firebaseAdapter: {
      isConfigured: false,
      statusMessage: 'Local-first storage active. Ready for Firebase Auth & Cloud Firestore binding.',
      getSyncPayload: function () {
        return {
          schemaVersion: '1.0.0',
          exportedAt: new Date().toISOString(),
          profile: StorageManager.state.user,
          stats: StorageManager.state.stats,
          bookmarks: StorageManager.state.bookmarks,
          mistakes: StorageManager.state.mistakes
        };
      }
    }
  };

  window.ExamVerseStorage = StorageManager;
})();
