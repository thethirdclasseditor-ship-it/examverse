/* ==========================================================================
   ExamVerse — Production Quiz & Examination Engine (js/quiz.js)
   Audit Fixes Applied:
   - Removed empty chapter fallback bug (shows proper empty state)
   - Added Fisher-Yates question & option randomization with snapshot persistence
   - Implemented Date.now() deadline timestamp timer (no pause exploit on tab/nav change)
   - Fixed Practice Mode timer 00:00 auto-completion & real elapsedSec (no 4s floor)
   - Blocked 0-attempt XP farming (0 XP when correct === 0 or attempted === 0)
   - Separated Total, Attempted (Correct + Incorrect), Skipped, Accuracy & Score %
   - Added Negative Marking (-0.25 / -0.50) calculation for Exam Mode
   - Added Full Session Autosave & Restore across page reloads
   ========================================================================== */

(function () {
  /* Helper: Fisher-Yates Shuffle (Returns a new shuffled array) */
  function shuffleArray(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  /* Helper: Clone and shuffle options of a question while updating correctIndex */
  function prepareQuestionWithShuffledOptions(q, shouldShuffleOptions) {
    var copy = JSON.parse(JSON.stringify(q));
    if (!shouldShuffleOptions || !Array.isArray(copy.options)) {
      return copy;
    }
    var indexedOptions = copy.options.map(function (optText, idx) {
      return { text: optText, isCorrect: idx === copy.correctIndex };
    });
    var shuffled = shuffleArray(indexedOptions);
    copy.options = shuffled.map(function (item) { return item.text; });
    for (var i = 0; i < shuffled.length; i++) {
      if (shuffled[i].isCorrect) {
        copy.correctIndex = i;
        break;
      }
    }
    return copy;
  }

  var QuizEngine = {
    session: null,
    timerInterval: null,
    lastResult: null,
    reviewFilter: 'all',

    /* Restore autosaved active session or lastResult from Storage on startup (Audit 4.1) */
    restoreFromStorage: function () {
      var st = window.ExamVerseStorage.state;
      if (st.lastResult) {
        this.lastResult = JSON.parse(JSON.stringify(st.lastResult));
      }
      if (st.activeSession && !st.activeSession.isSubmitted && !st.activeSession.isEmpty) {
        this.session = JSON.parse(JSON.stringify(st.activeSession));
        var now = Date.now();
        if (this.session.deadlineMs) {
          this.session.remainingSec = Math.max(0, Math.ceil((this.session.deadlineMs - now) / 1000));
        }
        if (this.session.startedAtMs) {
          this.session.elapsedSec = Math.max(0, Math.floor((now - this.session.startedAtMs) / 1000));
        }
        if (window.ExamVerseStorage.state.settings.timerEnabled) {
          this.startTimer();
        }
        return true;
      }
      return false;
    },

    /* Start a Quiz Session with Strict Validation & No Cross-Subject Fallback (Audit 2.2, 4.6, 4.10) */
    startSession: function (config) {
      this.stopTimer();
      var cfg = config || {};
      var allQuestions = window.EXAMVERSE_DATA.questions;
      var pool = [];

      if (Array.isArray(cfg.questionsSnapshot) && cfg.questionsSnapshot.length > 0) {
        /* Exact historical retry with preserved snapshot */
        pool = JSON.parse(JSON.stringify(cfg.questionsSnapshot));
      } else if (Array.isArray(cfg.questionIds)) {
        if (cfg.questionIds.length === 0) {
          pool = [];
        } else {
          pool = allQuestions.filter(function (q) {
            return cfg.questionIds.indexOf(q.id) !== -1;
          });
        }
      } else {
        pool = allQuestions.filter(function (q) {
          var matchSubject = !cfg.subjectId || cfg.subjectId === 'all' || q.subjectId === cfg.subjectId;
          var matchChapter = !cfg.chapterId || cfg.chapterId === 'all' || q.chapterId === cfg.chapterId;
          var matchCategory = !cfg.categoryId || cfg.categoryId === 'all' || (q.categories && q.categories.indexOf(cfg.categoryId) !== -1);
          var matchDifficulty = !cfg.difficulty || cfg.difficulty === 'all' || q.difficulty.toLowerCase() === cfg.difficulty.toLowerCase();
          return matchSubject && matchChapter && matchCategory && matchDifficulty;
        });
      }

      /* Audit 2.2 Fix: NEVER fall back to Physics/global questions when a chapter/filter has 0 questions */
      if (pool.length === 0) {
        this.session = {
          id: 'quiz-empty-' + Date.now(),
          isEmpty: true,
          title: cfg.title || 'Selected Topic',
          categoryLabel: cfg.categoryLabel || 'Exam Track',
          categoryId: cfg.categoryId || 'uni',
          primarySubjectId: cfg.subjectId || 'physics',
          chapterId: cfg.chapterId || null,
          mode: cfg.mode === 'exam' ? 'exam' : 'practice',
          questions: [],
          answers: {},
          revealed: {},
          isSubmitted: false
        };
        window.ExamVerseStorage.saveActiveSession(null);
        return this.session;
      }

      /* Audit 4.6 Fix: Randomize question order and option order unless preserveOrder is true */
      var orderedPool = cfg.preserveOrder ? pool.slice() : shuffleArray(pool);

      /* Audit 4.10 Fix: Validate requested question count */
      var requestedCount = Number(cfg.count);
      var validCount = (!isNaN(requestedCount) && requestedCount > 0)
        ? Math.min(orderedPool.length, Math.floor(requestedCount))
        : orderedPool.length;

      var selectedQuestions = orderedPool.slice(0, validCount).map(function (q) {
        return prepareQuestionWithShuffledOptions(q, !cfg.preserveOrder);
      });

      var settings = window.ExamVerseStorage.state.settings;
      var perQuestionSec = Math.max(10, Number(settings.defaultDurationPerQuestionSec) || 45);
      var totalSec = (cfg.durationSec && Number(cfg.durationSec) > 0)
        ? Number(cfg.durationSec)
        : (selectedQuestions.length * perQuestionSec);

      var mode = cfg.mode === 'exam' ? 'exam' : 'practice';

      /* Determine Negative Marking per wrong answer (Audit 3.3 & 3.4) */
      var negativeMark = 0;
      if (mode === 'exam' && settings.negativeMarkingEnabled) {
        if (typeof cfg.negativeMark === 'number') {
          negativeMark = cfg.negativeMark;
        } else if (cfg.categoryId) {
          var catObj = window.EXAMVERSE_DATA.examCategories.find(function (c) { return c.id === cfg.categoryId; });
          negativeMark = catObj && typeof catObj.defaultNegativeMark === 'number' ? catObj.defaultNegativeMark : 0.25;
        } else {
          negativeMark = 0.25;
        }
      }

      var now = Date.now();
      this.session = {
        id: 'quiz-' + now,
        isEmpty: false,
        title: cfg.title || 'Academic Practice Session',
        categoryLabel: cfg.categoryLabel || 'General Practice',
        categoryId: cfg.categoryId || 'uni',
        primarySubjectId: cfg.subjectId || selectedQuestions[0].subjectId,
        chapterId: cfg.chapterId || null,
        mode: mode,
        negativeMark: negativeMark,
        packXpReward: Number(cfg.xpReward) || 0,
        isDailyChallenge: Boolean(cfg.isDailyChallenge),
        questions: selectedQuestions,
        currentIndex: 0,
        answers: {},
        revealed: {},
        startedAtMs: now,
        deadlineMs: now + (totalSec * 1000),
        durationSec: totalSec,
        remainingSec: totalSec,
        elapsedSec: 0,
        isSubmitted: false
      };

      window.ExamVerseStorage.saveActiveSession(this.session);

      if (settings.timerEnabled) {
        this.startTimer();
      }
      return this.session;
    },

    /* Deadline-Timestamp Driven Timer (Audit 2.3, 2.4, 4.9) */
    startTimer: function () {
      var self = this;
      this.stopTimer();
      if (!this.session || this.session.isSubmitted || this.session.isEmpty) return;

      /* Ensure deadlineMs is initialized */
      if (!this.session.deadlineMs) {
        this.session.deadlineMs = Date.now() + (this.session.remainingSec * 1000);
      }

      this.timerInterval = window.setInterval(function () {
        if (!self.session || self.session.isSubmitted || self.session.isEmpty) {
          self.stopTimer();
          return;
        }
        var now = Date.now();
        self.session.elapsedSec = Math.max(0, Math.floor((now - self.session.startedAtMs) / 1000));
        self.session.remainingSec = Math.max(0, Math.ceil((self.session.deadlineMs - now) / 1000));

        var timerEl = document.getElementById('ev-live-timer');
        var timerBadge = document.getElementById('ev-timer-badge');
        if (timerEl) {
          timerEl.textContent = self.formatTime(self.session.remainingSec);
        }
        if (timerBadge) {
          if (self.session.remainingSec <= 30) {
            timerBadge.classList.add('is-urgent');
          } else {
            timerBadge.classList.remove('is-urgent');
          }
        }

        /* Audit 2.3 Fix: Auto-submit when timer hits 00:00 in both Exam Mode and Timed Practice Mode */
        if (self.session.remainingSec <= 0 && window.ExamVerseStorage.state.settings.timerEnabled) {
          self.stopTimer();
          if (window.ExamVerseApp && window.ExamVerseApp.showToast) {
            window.ExamVerseApp.showToast('Time is up! Submitting session automatically.');
          }
          self.submitQuiz(true);
        }
      }, 500);
    },

    stopTimer: function () {
      if (this.timerInterval) {
        window.clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    formatTime: function (sec) {
      var s = Math.max(0, Math.floor(Number(sec) || 0));
      var mins = Math.floor(s / 60);
      var rem = s % 60;
      return (mins < 10 ? '0' + mins : mins) + ':' + (rem < 10 ? '0' + rem : rem);
    },

    selectOption: function (optionIdx) {
      if (!this.session || this.session.isSubmitted || this.session.isEmpty) return;
      var q = this.session.questions[this.session.currentIndex];
      if (!q) return;

      /* In Practice Mode, once revealed, lock changes to preserve honest accuracy */
      if (this.session.mode === 'practice' && this.session.revealed[q.id]) {
        return;
      }

      this.session.answers[q.id] = optionIdx;

      if (this.session.mode === 'practice') {
        this.session.revealed[q.id] = true;
        var isCorrect = optionIdx === q.correctIndex;
        if (window.ExamVerseApp) {
          window.ExamVerseApp.playSound(isCorrect ? 'correct' : 'wrong');
          window.ExamVerseApp.triggerHaptic(isCorrect ? 30 : [40, 60, 40]);
        }
        if (!isCorrect) {
          window.ExamVerseStorage.addMistake(q.id, optionIdx, q.explanation);
        }
      } else {
        if (window.ExamVerseApp) {
          window.ExamVerseApp.playSound('click');
          window.ExamVerseApp.triggerHaptic(15);
        }
      }

      window.ExamVerseStorage.saveActiveSession(this.session);

      if (window.ExamVerseApp) {
        window.ExamVerseApp.renderCurrentView();
      }
    },

    goToQuestion: function (index) {
      if (!this.session || this.session.isEmpty) return;
      if (index >= 0 && index < this.session.questions.length) {
        this.session.currentIndex = index;
        window.ExamVerseStorage.saveActiveSession(this.session);
        if (window.ExamVerseApp) {
          window.ExamVerseApp.renderCurrentView();
        }
      }
    },

    nextQuestion: function () {
      if (!this.session || this.session.isEmpty) return;
      if (this.session.currentIndex < this.session.questions.length - 1) {
        this.session.currentIndex += 1;
        window.ExamVerseStorage.saveActiveSession(this.session);
        if (window.ExamVerseApp) {
          window.ExamVerseApp.renderCurrentView();
        }
      }
    },

    prevQuestion: function () {
      if (!this.session || this.session.isEmpty) return;
      if (this.session.currentIndex > 0) {
        this.session.currentIndex -= 1;
        window.ExamVerseStorage.saveActiveSession(this.session);
        if (window.ExamVerseApp) {
          window.ExamVerseApp.renderCurrentView();
        }
      }
    },

    getUnansweredCount: function () {
      if (!this.session || this.session.isEmpty) return 0;
      var total = this.session.questions.length;
      var answered = Object.keys(this.session.answers || {}).length;
      return Math.max(0, total - answered);
    },

    /* Submit & Score Quiz with Strict Anti-Farming & Negative Marking Rules (Audit 2.5, 4.4, 4.9) */
    submitQuiz: function () {
      if (!this.session || this.session.isSubmitted || this.session.isEmpty) return;
      this.stopTimer();
      this.session.isSubmitted = true;

      var now = Date.now();
      var actualElapsedSec = this.session.startedAtMs
        ? Math.max(0, Math.floor((now - this.session.startedAtMs) / 1000))
        : Math.max(0, this.session.elapsedSec || 0);

      var total = this.session.questions.length;
      var correct = 0;
      var incorrect = 0;
      var skipped = 0;
      var subjectBreakdown = {};
      var self = this;

      this.session.questions.forEach(function (q) {
        if (!subjectBreakdown[q.subjectId]) {
          subjectBreakdown[q.subjectId] = { correct: 0, attempted: 0, total: 0 };
        }
        subjectBreakdown[q.subjectId].total += 1;

        var chosen = self.session.answers[q.id];
        if (typeof chosen === 'undefined' || chosen === null) {
          skipped += 1;
        } else if (chosen === q.correctIndex) {
          correct += 1;
          subjectBreakdown[q.subjectId].attempted += 1;
          subjectBreakdown[q.subjectId].correct += 1;
        } else {
          incorrect += 1;
          subjectBreakdown[q.subjectId].attempted += 1;
          window.ExamVerseStorage.addMistake(q.id, chosen, q.explanation);
        }
      });

      var attempted = correct + incorrect;
      /* Accuracy among attempted questions vs Overall Score Percentage */
      var accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      var scorePct = total > 0 ? Math.round((correct / total) * 100) : 0;

      /* Negative Marking Calculation */
      var negPerWrong = Number(this.session.negativeMark) || 0;
      var penalty = Number((incorrect * negPerWrong).toFixed(2));
      var netScore = Number(Math.max(0, correct - penalty).toFixed(2));

      /* Audit 2.5 Fix: Zero XP if no questions attempted or 0 correct answers (Blocks Blank Quiz XP Farming) */
      var answerXp = 0;
      var accuracyBonusXp = 0;
      var dailyBonusXp = 0;
      var todayKey = window.ExamVerseStorage.getTodayDateStr();
      var dailyAlreadyClaimed = window.ExamVerseStorage.state.dailyChallenge.completedDate === todayKey;

      if (attempted > 0 && correct > 0) {
        answerXp = correct * 20;
        if (attempted >= 3 && scorePct >= 80) {
          accuracyBonusXp = 35;
        } else if (attempted >= 3 && scorePct >= 50) {
          accuracyBonusXp = 15;
        }
        if (this.session.isDailyChallenge && attempted >= total && !dailyAlreadyClaimed) {
          dailyBonusXp = window.ExamVerseStorage.state.dailyChallenge.rewardXp || 150;
        }
      }

      var totalXpEarned = answerXp + accuracyBonusXp + dailyBonusXp;

      this.lastResult = {
        sessionId: this.session.id,
        title: this.session.title,
        categoryLabel: this.session.categoryLabel,
        categoryId: this.session.categoryId,
        primarySubjectId: this.session.primarySubjectId,
        mode: this.session.mode,
        negativeMark: negPerWrong,
        penalty: penalty,
        netScore: netScore,
        isDailyChallenge: this.session.isDailyChallenge,
        total: total,
        attempted: attempted,
        correct: correct,
        incorrect: incorrect,
        skipped: skipped,
        accuracy: accuracy,
        scorePct: scorePct,
        timeTakenSec: actualElapsedSec,
        answerXp: answerXp,
        accuracyBonusXp: accuracyBonusXp,
        dailyBonusXp: dailyBonusXp,
        xpEarned: totalXpEarned,
        subjectBreakdown: subjectBreakdown,
        questions: JSON.parse(JSON.stringify(this.session.questions)),
        answers: Object.assign({}, this.session.answers)
      };

      window.ExamVerseStorage.recordQuizCompletion(this.lastResult);

      if (window.ExamVerseApp) {
        window.ExamVerseApp.playSound('complete');
        window.ExamVerseApp.navigate('results', true);
      }
    }
  };

  window.ExamVerseQuiz = QuizEngine;
})();
