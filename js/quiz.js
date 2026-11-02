/* ==========================================================================
   ExamVerse — Quiz & Examination Engine (js/quiz.js)
   Supports Practice Mode (Immediate Feedback + Explanation) & Exam Mode (Timed)
   Includes Full Results Breakdown & Filterable Answer Review
   ========================================================================== */

(function () {
  var QuizEngine = {
    session: null,
    timerInterval: null,
    lastResult: null,
    reviewFilter: 'all', /* 'all', 'correct', 'incorrect', 'skipped' */

    /* Start a Quiz Session */
    startSession: function (config) {
      this.stopTimer();
      var allQuestions = window.EXAMVERSE_DATA.questions;
      var pool = [];

      if (config.questionIds && config.questionIds.length > 0) {
        pool = allQuestions.filter(function (q) {
          return config.questionIds.indexOf(q.id) !== -1;
        });
      } else {
        pool = allQuestions.filter(function (q) {
          var matchSubject = !config.subjectId || config.subjectId === 'all' || q.subjectId === config.subjectId;
          var matchChapter = !config.chapterId || config.chapterId === 'all' || q.chapterId === config.chapterId;
          var matchCategory = !config.categoryId || config.categoryId === 'all' || (q.categories && q.categories.indexOf(config.categoryId) !== -1);
          var matchDifficulty = !config.difficulty || config.difficulty === 'all' || q.difficulty.toLowerCase() === config.difficulty.toLowerCase();
          return matchSubject && matchChapter && matchCategory && matchDifficulty;
        });
      }

      if (pool.length === 0) {
        pool = allQuestions.slice(0, 8);
      }

      var maxCount = config.count || pool.length;
      var selectedQuestions = pool.slice(0, maxCount);

      var perQuestionSec = (window.ExamVerseStorage.state.settings.defaultDurationPerQuestionSec) || 45;
      var totalSec = config.durationSec || (selectedQuestions.length * perQuestionSec);

      this.session = {
        id: 'quiz-' + Date.now(),
        title: config.title || 'Academic Practice Session',
        categoryLabel: config.categoryLabel || 'General Practice',
        primarySubjectId: config.subjectId || selectedQuestions[0].subjectId,
        mode: config.mode === 'exam' ? 'exam' : 'practice',
        isDailyChallenge: Boolean(config.isDailyChallenge),
        questions: selectedQuestions,
        currentIndex: 0,
        answers: {}, /* questionId -> selectedOptionIndex */
        revealed: {}, /* questionId -> boolean (for Practice Mode) */
        durationSec: totalSec,
        remainingSec: totalSec,
        elapsedSec: 0,
        isSubmitted: false
      };

      /* Save Continue Learning state */
      window.ExamVerseStorage.state.continueLearning = {
        title: this.session.title,
        subjectId: this.session.primarySubjectId === 'all' ? 'physics' : this.session.primarySubjectId,
        categoryId: config.categoryId || 'uni',
        progressPct: 12,
        completedCount: 1,
        totalCount: selectedQuestions.length,
        mode: this.session.mode
      };
      window.ExamVerseStorage.save();

      if (window.ExamVerseStorage.state.settings.timerEnabled) {
        this.startTimer();
      }
    },

    startTimer: function () {
      var self = this;
      this.stopTimer();
      this.timerInterval = window.setInterval(function () {
        if (!self.session || self.session.isSubmitted) {
          self.stopTimer();
          return;
        }
        self.session.elapsedSec += 1;
        if (self.session.remainingSec > 0) {
          self.session.remainingSec -= 1;
        }
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
        if (self.session.remainingSec <= 0 && self.session.mode === 'exam') {
          self.submitQuiz();
        }
      }, 1000);
    },

    stopTimer: function () {
      if (this.timerInterval) {
        window.clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    formatTime: function (sec) {
      var s = Math.max(0, Math.floor(sec));
      var mins = Math.floor(s / 60);
      var rem = s % 60;
      return (mins < 10 ? '0' + mins : mins) + ':' + (rem < 10 ? '0' + rem : rem);
    },

    selectOption: function (optionIdx) {
      if (!this.session || this.session.isSubmitted) return;
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
        if (window.ExamVerseApp && window.ExamVerseApp.playSound) {
          window.ExamVerseApp.playSound(isCorrect ? 'correct' : 'wrong');
        }
        if (!isCorrect) {
          window.ExamVerseStorage.addMistake(q.id, optionIdx, q.explanation);
        }
      } else {
        if (window.ExamVerseApp && window.ExamVerseApp.playSound) {
          window.ExamVerseApp.playSound('click');
        }
      }

      /* Update Continue Learning progress */
      var answeredCount = Object.keys(this.session.answers).length;
      window.ExamVerseStorage.state.continueLearning.completedCount = answeredCount;
      window.ExamVerseStorage.state.continueLearning.progressPct = Math.min(
        95,
        Math.max(10, Math.round((answeredCount / this.session.questions.length) * 100))
      );
      window.ExamVerseStorage.save();

      if (window.ExamVerseApp) {
        window.ExamVerseApp.renderCurrentView();
      }
    },

    goToQuestion: function (index) {
      if (!this.session) return;
      if (index >= 0 && index < this.session.questions.length) {
        this.session.currentIndex = index;
        if (window.ExamVerseApp) {
          window.ExamVerseApp.renderCurrentView();
        }
      }
    },

    nextQuestion: function () {
      if (!this.session) return;
      if (this.session.currentIndex < this.session.questions.length - 1) {
        this.session.currentIndex += 1;
        if (window.ExamVerseApp) {
          window.ExamVerseApp.renderCurrentView();
        }
      }
    },

    prevQuestion: function () {
      if (!this.session) return;
      if (this.session.currentIndex > 0) {
        this.session.currentIndex -= 1;
        if (window.ExamVerseApp) {
          window.ExamVerseApp.renderCurrentView();
        }
      }
    },

    submitQuiz: function () {
      if (!this.session || this.session.isSubmitted) return;
      this.stopTimer();
      this.session.isSubmitted = true;

      var total = this.session.questions.length;
      var correct = 0;
      var incorrect = 0;
      var skipped = 0;
      var subjectBreakdown = {};
      var self = this;

      this.session.questions.forEach(function (q) {
        if (!subjectBreakdown[q.subjectId]) {
          subjectBreakdown[q.subjectId] = { correct: 0, total: 0 };
        }
        subjectBreakdown[q.subjectId].total += 1;

        var chosen = self.session.answers[q.id];
        if (typeof chosen === 'undefined' || chosen === null) {
          skipped += 1;
        } else if (chosen === q.correctIndex) {
          correct += 1;
          subjectBreakdown[q.subjectId].correct += 1;
        } else {
          incorrect += 1;
          window.ExamVerseStorage.addMistake(q.id, chosen, q.explanation);
        }
      });

      var accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      var baseXp = correct * 20 + (accuracy >= 80 ? 35 : 15);
      if (this.session.isDailyChallenge) {
        baseXp += 50;
      }

      this.lastResult = {
        sessionId: this.session.id,
        title: this.session.title,
        categoryLabel: this.session.categoryLabel,
        primarySubjectId: this.session.primarySubjectId,
        mode: this.session.mode,
        isDailyChallenge: this.session.isDailyChallenge,
        total: total,
        correct: correct,
        incorrect: incorrect,
        skipped: skipped,
        accuracy: accuracy,
        timeTakenSec: Math.max(4, this.session.elapsedSec),
        xpEarned: baseXp,
        subjectBreakdown: subjectBreakdown,
        questions: this.session.questions,
        answers: Object.assign({}, this.session.answers)
      };

      window.ExamVerseStorage.recordQuizCompletion(this.lastResult);

      if (window.ExamVerseApp) {
        window.ExamVerseApp.playSound('complete');
        window.ExamVerseApp.navigate('results');
      }
    }
  };

  window.ExamVerseQuiz = QuizEngine;
})();
