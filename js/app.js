/* ==========================================================================
   ExamVerse — Main Application Controller & View Renderer (js/app.js)
   Step 1 Audit Fixes Applied:
   - XSS HTML escaping helper (escapeHtml) on all dynamic strings
   - Dynamic real question counts across Home, Subjects, Categories & Chapters
   - Empty Chapter state with "Back to Chapters" action
   - Active Exam Navigation guard modal & Unanswered Submit confirmation modal
   - Safe Mode Switching confirmation modal (restarts session cleanly)
   - Full Historical Attempt Review & Exact Snapshot Retry from Quiz History
   - Search input cursor preservation (no full-page input replacement on typing)
   - Fixed Keyboard Shortcut precedence bug (Ctrl+B no longer triggers Option B)
   - Added Vibration support (navigator.vibrate) & Notification Mark Read / Clear
   ========================================================================== */

(function () {
  /* XSS Protection Helper (Audit 10.1) */
  function escapeHtml(str) {
    if (str === null || typeof str === 'undefined') return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  var App = {
    currentView: 'home',
    selectedExamCategory: 'uni',
    examSearchQuery: '',
    examSubjectFilter: 'all',
    examDifficultyFilter: 'all',
    leaderboardScope: 'global',
    leaderboardPeriod: 'week',
    pendingNavigationTarget: null,
    pendingModeSwitchTarget: null,
    audioCtx: null,

    init: function () {
      window.ExamVerseStorage.init();
      window.ExamVerseQuiz.restoreFromStorage();

      this.syncHeaderAndThemeUI();
      this.renderCurrentView();
      this.bindGlobalKeyboardShortcuts();
    },

    /* Haptic Vibration Feedback (Audit Section 6) */
    triggerHaptic: function (pattern) {
      var settings = window.ExamVerseStorage.state.settings;
      if (!settings || !settings.vibrationEnabled) return;
      try {
        if (window.navigator && typeof window.navigator.vibrate === 'function') {
          window.navigator.vibrate(pattern || 20);
        }
      } catch (e) {}
    },

    /* Synthesized Web Audio API Effects */
    playSound: function (type) {
      var settings = window.ExamVerseStorage.state.settings;
      if (!settings || !settings.soundEnabled) return;
      try {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!this.audioCtx) {
          this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        var osc = this.audioCtx.createOscillator();
        var gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        var now = this.audioCtx.currentTime;
        if (type === 'correct') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);
          osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.22);
        } else if (type === 'wrong') {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(240, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.22);
        } else if (type === 'complete') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        } else {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          gain.gain.setValueAtTime(0.03, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
        }
      } catch (e) {}
    },

    showToast: function (message) {
      var toast = document.getElementById('ev-toast');
      var toastText = document.getElementById('ev-toast-text');
      if (!toast || !toastText) return;
      toastText.textContent = message;
      toast.classList.add('is-visible');
      if (this._toastTimer) {
        window.clearTimeout(this._toastTimer);
      }
      this._toastTimer = window.setTimeout(function () {
        toast.classList.remove('is-visible');
      }, 2600);
    },

    /* Navigation with Active Exam Integrity Guard (Audit 2.4) */
    navigate: function (viewName, bypassExamGuard) {
      var s = window.ExamVerseQuiz.session;
      if (
        !bypassExamGuard &&
        this.currentView === 'quiz' &&
        viewName !== 'quiz' &&
        s &&
        !s.isSubmitted &&
        !s.isEmpty &&
        s.mode === 'exam'
      ) {
        this.pendingNavigationTarget = viewName;
        var leaveModal = document.getElementById('ev-leave-exam-modal');
        if (leaveModal) {
          leaveModal.classList.add('is-open');
          return;
        }
      }

      this.currentView = viewName;

      /* If user navigates to Quiz tab when no active session exists, start a fresh practice set */
      if (viewName === 'quiz' && (!window.ExamVerseQuiz.session || window.ExamVerseQuiz.session.isSubmitted)) {
        var pack = window.EXAMVERSE_DATA.recommendedQuizzes[0];
        window.ExamVerseQuiz.startSession({
          title: pack.title,
          categoryLabel: 'University & Engineering Track',
          categoryId: 'uni',
          subjectId: 'all',
          questionIds: pack.questionIds,
          mode: 'practice',
          isDailyChallenge: false
        });
      }

      /* Audit 2.4 Fix: Do NOT stop the deadline timer when leaving the page; ensure timer runs if active */
      if (
        window.ExamVerseQuiz.session &&
        !window.ExamVerseQuiz.session.isSubmitted &&
        !window.ExamVerseQuiz.session.isEmpty &&
        window.ExamVerseStorage.state.settings.timerEnabled
      ) {
        window.ExamVerseQuiz.startTimer();
      }

      this.syncHeaderAndThemeUI();
      this.renderCurrentView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    syncHeaderAndThemeUI: function () {
      var state = window.ExamVerseStorage.state;
      var isDark = state.theme === 'dark';

      /* Update html lang attribute based on selected language (Audit Section 8) */
      document.documentElement.setAttribute('lang', state.settings.language === 'bn' ? 'bn' : 'en');

      /* Update Theme Icon in Topbar */
      var themeIconWrap = document.getElementById('ev-theme-icon-wrap');
      if (themeIconWrap) {
        themeIconWrap.innerHTML = isDark
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
      }

      /* Update Streak Pill in Topbar */
      var streakPill = document.getElementById('ev-header-streak');
      var streakCountEl = document.getElementById('ev-header-streak-count');
      if (streakPill && streakCountEl) {
        streakCountEl.textContent = state.user.streakDays + 'd';
        if (state.user.streakActive && state.user.streakDays > 0) {
          streakPill.classList.add('is-active');
          streakPill.classList.remove('is-muted');
          streakPill.title = state.user.streakDays + ' Day Active Study Streak';
        } else {
          streakPill.classList.remove('is-active');
          streakPill.classList.add('is-muted');
          streakPill.title = 'Complete a quiz today to start your study streak!';
        }
      }

      /* Update Unread Notification Dot (Audit Section 6) */
      var notifDot = document.getElementById('ev-notif-dot');
      if (notifDot) {
        var hasUnread = state.settings.notificationsEnabled && (state.notifications || []).some(function (n) { return n.unread; });
        notifDot.style.display = hasUnread ? 'block' : 'none';
      }

      /* Update Greeting & Profile in Topbar */
      var firstName = (state.user.name || 'Student').split(' ')[0];
      var greetingTitle = document.getElementById('ev-greeting-title');
      if (greetingTitle) {
        greetingTitle.textContent = (state.isDemoMode ? '[Demo] ' : '') + 'Welcome, ' + firstName;
      }
      var avatarEl = document.getElementById('ev-header-avatar');
      if (avatarEl) {
        avatarEl.textContent = state.user.avatarInitials || 'SS';
      }
      var profileNameEl = document.getElementById('ev-header-username');
      if (profileNameEl) {
        profileNameEl.textContent = firstName;
      }

      /* Update Sidebar Badges */
      var bmCountEl = document.getElementById('ev-nav-count-bookmarks');
      if (bmCountEl) bmCountEl.textContent = state.bookmarks.length;
      var mkCountEl = document.getElementById('ev-nav-count-mistakes');
      if (mkCountEl) mkCountEl.textContent = state.mistakes.length;

      /* Update Active Nav States (Sidebar + Mobile Bottom Nav) */
      var activeNavKey = this.currentView;
      if (activeNavKey === 'results' || activeNavKey === 'review') {
        activeNavKey = 'quiz';
      }
      var navBtns = document.querySelectorAll('[data-nav-target]');
      for (var i = 0; i < navBtns.length; i++) {
        var btn = navBtns[i];
        var target = btn.getAttribute('data-nav-target');
        if (target === activeNavKey) {
          btn.classList.add('is-active');
          btn.setAttribute('aria-current', 'page');
        } else {
          btn.classList.remove('is-active');
          btn.removeAttribute('aria-current');
        }
      }
    },

    getIconSvg: function (name) {
      var icons = {
        atom: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)"/></svg>',
        flask: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 3h6m-5 0v5.2L4.6 18.4A2 2 0 0 0 6.4 21h11.2a2 2 0 0 0 1.8-2.6L14 8.2V3"/><path d="M7.5 14h9"/></svg>',
        sigma: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M18 4H6l6 8-6 8h12"/></svg>',
        dna: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 4c8 0 8 16 16 16"/><path d="M20 4c-8 0-8 16-16 16"/><path d="M6.5 7h11M6.5 17h11M9 12h6"/></svg>',
        feather: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>',
        scroll: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M8 7h8M8 11h6"/></svg>',
        globe: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        cpu: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>',
        cap: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
        compass: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
        landmark: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>',
        briefcase: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
        shield: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        book: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        layers: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
      };
      return icons[name] || icons.book;
    },

    getMetallicBadgeSvg: function (tier) {
      var colors = {
        gold: { outer: '#EAB308', inner: '#FEF08A', stroke: '#A16207' },
        silver: { outer: '#64748B', inner: '#E2E8F0', stroke: '#334155' },
        bronze: { outer: '#D97706', inner: '#FED7AA', stroke: '#9A3412' }
      };
      var c = colors[tier] || colors.silver;
      return (
        '<svg viewBox="0 0 48 48" width="44" height="44" fill="none" aria-hidden="true">' +
        '<polygon points="24,3 43,14 43,34 24,45 5,34 5,14" fill="' + c.inner + '" stroke="' + c.outer + '" stroke-width="2.5"/>' +
        '<polygon points="24,9 37,17 37,31 24,39 11,31 11,17" fill="none" stroke="' + c.stroke + '" stroke-width="1.2" stroke-dasharray="3 2"/>' +
        '<circle cx="24" cy="24" r="6" fill="' + c.outer + '"/>' +
        '<path d="M21.5 24l1.8 1.8 3.5-3.6" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>'
      );
    },

    formatQuestionDisplay: function (q) {
      var lang = window.ExamVerseStorage.state.settings.language || 'bilingual';
      var qEn = escapeHtml(q.question);
      var qBn = escapeHtml(q.questionBn || q.question);
      if (lang === 'en') {
        return '<div>' + qEn + '</div>';
      }
      if (lang === 'bn') {
        return '<div class="font-bn">' + qBn + '</div>';
      }
      if (q.questionBn && q.questionBn !== q.question) {
        return (
          '<div>' + qEn + '</div>' +
          '<div class="font-bn" style="font-size:0.95rem; font-weight:500; color:var(--text-secondary); margin-top:0.4rem;">' +
          qBn +
          '</div>'
        );
      }
      return '<div>' + qEn + '</div>';
    },

    renderCurrentView: function () {
      var container = document.getElementById('ev-main-content');
      if (!container) return;

      var html = '';
      switch (this.currentView) {
        case 'home':
          html = this.renderHomeView();
          break;
        case 'exams':
          html = this.renderExamsView();
          break;
        case 'quiz':
          html = this.renderQuizView();
          break;
        case 'results':
          html = this.renderResultsView();
          break;
        case 'review':
          html = this.renderReviewView();
          break;
        case 'stats':
          html = this.renderStatsView();
          break;
        case 'leaderboard':
          html = this.renderLeaderboardView();
          break;
        case 'profile':
          html = this.renderProfileView();
          break;
        case 'bookmarks':
          html = this.renderBookmarksView();
          break;
        case 'mistakes':
          html = this.renderMistakesView();
          break;
        case 'history':
          html = this.renderHistoryView();
          break;
        case 'daily':
          html = this.renderDailyChallengeView();
          break;
        case 'settings':
          html = this.renderSettingsView();
          break;
        case 'about':
          html = this.renderAboutView();
          break;
        case 'privacy':
          html = this.renderPrivacyView();
          break;
        default:
          html = this.renderHomeView();
      }

      container.innerHTML = '<div class="ev-view-animate">' + html + '</div>';
    },

    /* ======================================================================
       VIEW 1: HOME PAGE (With Dynamic Counts & Real Session/Result Resume)
       ====================================================================== */
    renderHomeView: function () {
      var state = window.ExamVerseStorage.state;
      var user = state.user;
      var daily = state.dailyChallenge;
      var cont = state.continueLearning;
      var xpPct = Math.min(100, Math.round((user.xp / user.xpForNextLevel) * 100));
      var dailyPct = Math.min(100, Math.round((daily.completedQuestions / daily.totalQuestions) * 100));
      var self = this;

      /* Explore Subjects Cards with Real Dynamic Question Counts (Audit 2.1 & 3.1) */
      var subjectsHtml = window.EXAMVERSE_DATA.subjects.map(function (subj) {
        var mastery = state.stats.subjectMastery[subj.id] || 0;
        var realCount = window.EXAMVERSE_DATA.getSubjectQuestionCount(subj.id);
        var subjStat = (state.stats.subjectStats && state.stats.subjectStats[subj.id]) || { attempted: 0, correct: 0 };
        var masteryLabel = subjStat.attempted > 0 ? (mastery + '%') : 'Not Started (0%)';
        return (
          '<button type="button" class="ev-card ev-card-interactive ev-subject-card" style="text-align:left; width:100%; font-family:inherit;" onclick="window.evStartSubjectQuiz(\'' + subj.id + '\', \'practice\')">' +
            '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; width:100%;">' +
              '<div class="ev-subject-icon-box">' + self.getIconSvg(subj.icon) + '</div>' +
              '<span class="ev-badge-pill ev-badge-neutral">' + realCount + ' Verified MCQs</span>' +
            '</div>' +
            '<div>' +
              '<div style="font-size:0.96rem; font-weight:700; color:var(--text-primary);">' + escapeHtml(subj.name) + '</div>' +
              '<div class="font-bn" style="font-size:0.8rem; color:var(--text-muted);">' + escapeHtml(subj.nameBn) + '</div>' +
            '</div>' +
            '<div style="width:100%;">' +
              '<div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:600; color:var(--text-secondary); margin-bottom:0.35rem;">' +
                '<span>Mastery</span>' +
                '<span>' + masteryLabel + '</span>' +
              '</div>' +
              '<div class="ev-progress-track">' +
                '<div class="ev-progress-fill" style="width:' + mastery + '%;"></div>' +
              '</div>' +
            '</div>' +
          '</button>'
        );
      }).join('');

      /* Recommended Quizzes */
      var recommendedHtml = window.EXAMVERSE_DATA.recommendedQuizzes.slice(1).map(function (pack) {
        return (
          '<div class="ev-card ev-card-interactive" style="display:flex; flex-direction:column; justify-content:space-between; gap:0.9rem;">' +
            '<div>' +
              '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; margin-bottom:0.55rem;">' +
                '<span class="ev-badge-pill ev-badge-indigo">' + escapeHtml(pack.badgeText) + '</span>' +
                '<span style="font-size:0.75rem; font-weight:600; color:var(--text-muted);">' + pack.questionIds.length + ' MCQs</span>' +
              '</div>' +
              '<h4 style="font-size:0.98rem; font-weight:700; color:var(--text-primary); margin-bottom:0.2rem;">' + escapeHtml(pack.title) + '</h4>' +
              '<div class="font-bn" style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.45rem;">' + escapeHtml(pack.titleBn) + '</div>' +
              '<p style="font-size:0.82rem; color:var(--text-secondary);">' + escapeHtml(pack.subtitle) + '</p>' +
            '</div>' +
            '<div style="display:flex; align-items:center; gap:0.5rem; padding-top:0.5rem; border-top:1px solid var(--border-subtle);">' +
              '<button type="button" class="ev-btn ev-btn-primary ev-btn-sm" style="flex:1;" onclick="window.evStartPackQuiz(\'' + pack.id + '\', \'practice\')">Practice</button>' +
              '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" style="flex:1;" onclick="window.evStartPackQuiz(\'' + pack.id + '\', \'exam\')">Exam Mode</button>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      /* Continue Learning Section (Audit 4.1 & 4.2 — Accurately distinguishes active vs completed vs fresh) */
      var continueHtml = '';
      if (state.activeSession && !state.activeSession.isSubmitted && !state.activeSession.isEmpty) {
        var act = state.activeSession;
        var ansCount = Object.keys(act.answers || {}).length;
        var totCount = act.questions.length || 1;
        var actPct = Math.round((ansCount / totCount) * 100);
        continueHtml = (
          '<div class="ev-card" style="display:flex; align-items:center; justify-content:space-between; gap:1.25rem; flex-wrap:wrap; padding:1.1rem 1.25rem;">' +
            '<div style="display:flex; align-items:center; gap:0.95rem; min-width:240px; flex:1;">' +
              '<div class="ev-subject-icon-box">' + this.getIconSvg(act.primarySubjectId || 'physics') + '</div>' +
              '<div style="flex:1; min-width:180px;">' +
                '<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem;">' +
                  '<span style="font-size:0.98rem; font-weight:700; color:var(--text-primary);">' + escapeHtml(act.title) + '</span>' +
                  '<span class="ev-badge-pill ev-badge-indigo">' + (act.mode === 'exam' ? 'Exam In Progress' : 'Practice In Progress') + '</span>' +
                '</div>' +
                '<div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.45rem;">' +
                  'Question ' + (act.currentIndex + 1) + ' of ' + totCount + ' • ' + ansCount + ' answered' +
                '</div>' +
                '<div class="ev-progress-track" style="max-width:340px;">' +
                  '<div class="ev-progress-fill is-success" style="width:' + actPct + '%;"></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex; align-items:center; gap:0.6rem;">' +
              '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evNavigate(\'quiz\')">Resume Active Session</button>' +
              '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evNavigate(\'mistakes\')">Mistake Bank (' + state.mistakes.length + ')</button>' +
            '</div>' +
          '</div>'
        );
      } else if (state.lastResult && cont) {
        continueHtml = (
          '<div class="ev-card" style="display:flex; align-items:center; justify-content:space-between; gap:1.25rem; flex-wrap:wrap; padding:1.1rem 1.25rem;">' +
            '<div style="display:flex; align-items:center; gap:0.95rem; min-width:240px; flex:1;">' +
              '<div class="ev-subject-icon-box">' + this.getIconSvg(cont.subjectId || 'physics') + '</div>' +
              '<div style="flex:1; min-width:180px;">' +
                '<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem;">' +
                  '<span style="font-size:0.98rem; font-weight:700; color:var(--text-primary);">' + escapeHtml(cont.title) + '</span>' +
                  '<span class="ev-badge-pill ev-badge-success">Completed</span>' +
                '</div>' +
                '<div style="font-size:0.8rem; color:var(--text-muted);">' +
                  'Last Score: ' + state.lastResult.correct + '/' + state.lastResult.total + ' (' + state.lastResult.scorePct + '% Score)' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">' +
              '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evNavigate(\'results\')">View Last Result &amp; Review</button>' +
              '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evRetryLastQuiz()">Retry Session</button>' +
            '</div>' +
          '</div>'
        );
      } else {
        continueHtml = (
          '<div class="ev-card" style="display:flex; align-items:center; justify-content:space-between; gap:1.25rem; flex-wrap:wrap; padding:1.1rem 1.25rem;">' +
            '<div>' +
              '<div style="font-size:0.96rem; font-weight:700; color:var(--text-primary); margin-bottom:0.2rem;">No Active Session Yet</div>' +
              '<div style="font-size:0.82rem; color:var(--text-secondary);">Start any subject practice or chapter exam below—your progress will autosave automatically.</div>' +
            '</div>' +
            '<div style="display:flex; gap:0.6rem;">' +
              '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evStartSubjectQuiz(\'physics\', \'practice\')">Start Physics Practice</button>' +
              '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evNavigate(\'exams\')">Browse Chapters</button>' +
            '</div>' +
          '</div>'
        );
      }

      /* Recent Activity */
      var recentItems = state.quizHistory.slice(0, 3);
      var recentHtml = recentItems.length === 0
        ? '<div class="ev-card" style="text-align:center; padding:1.75rem; color:var(--text-muted);">No quizzes completed yet. Complete your first practice or exam session to see your history here!</div>'
        : recentItems.map(function (item) {
            var badgeClass = item.scorePct >= 80 ? 'ev-badge-success' : (item.scorePct >= 50 ? 'ev-badge-warning' : 'ev-badge-danger');
            return (
              '<div class="ev-card" style="padding:0.95rem 1.15rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">' +
                '<div style="display:flex; align-items:center; gap:0.85rem;">' +
                  '<div class="ev-subject-icon-box" style="width:38px; height:38px;">' + self.getIconSvg(item.subjectId || 'atom') + '</div>' +
                  '<div>' +
                    '<div style="font-size:0.92rem; font-weight:700; color:var(--text-primary);">' + escapeHtml(item.title) + '</div>' +
                    '<div style="font-size:0.78rem; color:var(--text-muted);">' + escapeHtml(item.category) + ' • ' + (item.mode === 'exam' ? 'Timed Exam' : 'Practice') + ' • Attempted ' + (item.attempted || 0) + '/' + item.total + ' • ' + escapeHtml(item.date) + '</div>' +
                  '</div>' +
                '</div>' +
                '<div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">' +
                  '<span class="ev-badge-pill ' + badgeClass + '">' + item.score + '/' + item.total + ' (' + (item.scorePct || 0) + '%)</span>' +
                  '<span class="ev-badge-pill ev-badge-indigo">+' + item.xpEarned + ' XP</span>' +
                  '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" onclick="window.evReviewHistoryItem(\'' + item.id + '\')">Review</button>' +
                '</div>' +
              '</div>'
            );
          }).join('');

      return (
        '<div class="ev-home-top-grid">' +
          '<div class="ev-card ev-welcome-card">' +
            '<svg class="ev-academic-watermark" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
              '<circle cx="60" cy="60" r="46"/><ellipse cx="60" cy="60" rx="46" ry="18" transform="rotate(30 60 60)"/><ellipse cx="60" cy="60" rx="46" ry="18" transform="rotate(-30 60 60)"/>' +
            '</svg>' +
            '<div>' +
              '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; margin-bottom:0.5rem; flex-wrap:wrap;">' +
                '<span class="ev-badge-pill ev-badge-indigo">Target Track: ' + escapeHtml(user.targetTrack) + '</span>' +
                '<span class="ev-badge-pill ev-badge-violet">Level ' + user.level + ' Scholar</span>' +
              '</div>' +
              '<h1 style="font-size:1.35rem; font-weight:800; letter-spacing:-0.02em; color:var(--text-primary); margin-bottom:0.3rem;">' +
                'Consistent deliberate practice builds exam mastery.' +
              '</h1>' +
              '<p style="font-size:0.86rem; color:var(--text-secondary);">' +
                'Every question count, streak day, and mastery metric is calculated directly from your real attempts.' +
              '</p>' +
            '</div>' +
            '<div class="ev-xp-strip">' +
              '<div style="display:flex; align-items:center; justify-content:space-between; font-size:0.8rem; font-weight:700; margin-bottom:0.4rem;">' +
                '<span style="color:var(--text-primary);">Level ' + user.level + ' Progress</span>' +
                '<span class="font-mono" style="color:var(--brand-primary);">' + user.xp.toLocaleString() + ' / ' + user.xpForNextLevel.toLocaleString() + ' XP (' + xpPct + '%)</span>' +
              '</div>' +
              '<div class="ev-progress-track">' +
                '<div class="ev-progress-fill" style="width:' + xpPct + '%;"></div>' +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="ev-card ev-daily-card">' +
            '<svg class="ev-academic-watermark" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">' +
              '<polygon points="60,10 105,35 105,85 60,110 15,85 15,35"/><circle cx="60" cy="60" r="22"/>' +
            '</svg>' +
            '<div>' +
              '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; margin-bottom:0.5rem;">' +
                '<span class="ev-badge-pill ev-badge-warning">Daily Merit Challenge (' + escapeHtml(daily.date) + ')</span>' +
                '<span class="ev-badge-pill ev-badge-indigo">' + (daily.isCompleted ? 'Claimed Today ✓' : ('+' + daily.rewardXp + ' XP Bonus')) + '</span>' +
              '</div>' +
              '<h2 style="font-size:1.15rem; font-weight:800; color:var(--text-primary); margin-bottom:0.25rem;">' +
                'ExamVerse Daily Merit Sprint' +
              '</h2>' +
              '<p style="font-size:0.83rem; color:var(--text-secondary);">' +
                '8 curated interdisciplinary MCQs across all 8 subjects. Complete all 8 questions in the Daily Challenge to claim your daily bonus.' +
              '</p>' +
            '</div>' +
            '<div>' +
              '<div style="display:flex; justify-content:space-between; font-size:0.78rem; font-weight:700; margin-bottom:0.35rem;">' +
                '<span>Daily Progress</span>' +
                '<span>' + daily.completedQuestions + ' / ' + daily.totalQuestions + ' Questions</span>' +
              '</div>' +
              '<div class="ev-progress-track" style="margin-bottom:0.85rem;">' +
                '<div class="ev-progress-fill is-accent" style="width:' + dailyPct + '%;"></div>' +
              '</div>' +
              '<div style="display:flex; gap:0.5rem;">' +
                '<button type="button" class="ev-btn ev-btn-primary" style="flex:1;" onclick="window.evStartDailyChallenge()">' +
                  (daily.isCompleted ? 'Practice Daily Set Again' : 'Start Challenge') +
                '</button>' +
                '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evNavigate(\'daily\')">Details</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div style="margin-bottom:1.65rem;">' +
          '<div class="ev-section-header">' +
            '<h3 class="ev-section-title">Continue Learning</h3>' +
            '<button type="button" class="ev-section-link" onclick="window.evNavigate(\'exams\')">Browse All Exam Tracks →</button>' +
          '</div>' +
          continueHtml +
        '</div>' +

        '<div style="margin-bottom:1.65rem;">' +
          '<div class="ev-section-header">' +
            '<h3 class="ev-section-title">Explore Subjects (' + window.EXAMVERSE_DATA.questions.length + ' Verified MCQs in Bank)</h3>' +
            '<button type="button" class="ev-section-link" onclick="window.evNavigate(\'exams\')">View All 32 Chapters →</button>' +
          '</div>' +
          '<div class="ev-grid-4">' +
            subjectsHtml +
          '</div>' +
        '</div>' +

        '<div style="margin-bottom:1.65rem;">' +
          '<div class="ev-section-header">' +
            '<h3 class="ev-section-title">Recommended Model Sets</h3>' +
            '<button type="button" class="ev-section-link" onclick="window.evNavigate(\'leaderboard\')">View Leaderboard →</button>' +
          '</div>' +
          '<div class="ev-grid-3">' +
            recommendedHtml +
          '</div>' +
        '</div>' +

        '<div>' +
          '<div class="ev-section-header">' +
            '<h3 class="ev-section-title">Recent Activity</h3>' +
            '<button type="button" class="ev-section-link" onclick="window.evNavigate(\'history\')">Full Quiz History →</button>' +
          '</div>' +
          '<div style="display:flex; flex-direction:column; gap:0.65rem;">' +
            recentHtml +
          '</div>' +
        '</div>'
      );
    },

    /* ======================================================================
       VIEW 2: EXAMS PAGE (With Dynamic Real Question Counts & Cursor-Safe Search)
       ====================================================================== */
    buildExamsFilteredChaptersHtml: function () {
      var self = this;
      var categories = window.EXAMVERSE_DATA.examCategories;
      var activeCat = categories.find(function (c) { return c.id === self.selectedExamCategory; }) || categories[0];

      var catSubjects = window.EXAMVERSE_DATA.subjects.filter(function (s) {
        if (self.examSubjectFilter !== 'all' && s.id !== self.examSubjectFilter) return false;
        return activeCat.subjects.indexOf(s.id) !== -1;
      });

      var chaptersHtml = '';
      var query = (this.examSearchQuery || '').trim().toLowerCase();

      catSubjects.forEach(function (subj) {
        var filteredChapters = subj.chapters.filter(function (ch) {
          var matchDiff = self.examDifficultyFilter === 'all' || ch.difficulty.toLowerCase() === self.examDifficultyFilter.toLowerCase();
          var matchQuery = !query ||
            ch.title.toLowerCase().indexOf(query) !== -1 ||
            ch.titleBn.toLowerCase().indexOf(query) !== -1 ||
            subj.name.toLowerCase().indexOf(query) !== -1 ||
            subj.nameBn.toLowerCase().indexOf(query) !== -1;
          return matchDiff && matchQuery;
        });

        if (filteredChapters.length === 0) return;

        var chRows = filteredChapters.map(function (ch) {
          var diffClass = ch.difficulty === 'Easy' ? 'ev-badge-success' : (ch.difficulty === 'Hard' ? 'ev-badge-danger' : 'ev-badge-indigo');
          var realChCount = window.EXAMVERSE_DATA.getChapterQuestionCount(ch.id);
          return (
            '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.85rem; padding:0.85rem 1rem; border:1px solid var(--border-subtle); border-radius:var(--radius-sm); background-color:var(--bg-surface-hover); flex-wrap:wrap;">' +
              '<div>' +
                '<div style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">' + escapeHtml(ch.title) + '</div>' +
                '<div class="font-bn" style="font-size:0.8rem; color:var(--text-muted);">' + escapeHtml(ch.titleBn) + ' • <strong>' + realChCount + ' Verified Question(s)</strong></div>' +
              '</div>' +
              '<div style="display:flex; align-items:center; gap:0.5rem;">' +
                '<span class="ev-badge-pill ' + diffClass + '">' + escapeHtml(ch.difficulty) + '</span>' +
                '<button type="button" class="ev-btn ev-btn-soft ev-btn-sm" onclick="window.evStartChapterQuiz(\'' + subj.id + '\', \'' + ch.id + '\', \'practice\')">Practice</button>' +
                '<button type="button" class="ev-btn ev-btn-primary ev-btn-sm" onclick="window.evStartChapterQuiz(\'' + subj.id + '\', \'' + ch.id + '\', \'exam\')">Exam</button>' +
              '</div>' +
            '</div>'
          );
        }).join('');

        var realSubjCount = window.EXAMVERSE_DATA.getSubjectQuestionCount(subj.id);
        chaptersHtml += (
          '<div class="ev-card" style="margin-bottom:1rem;">' +
            '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; margin-bottom:0.9rem; flex-wrap:wrap;">' +
              '<div style="display:flex; align-items:center; gap:0.75rem;">' +
                '<div class="ev-subject-icon-box">' + self.getIconSvg(subj.icon) + '</div>' +
                '<div>' +
                  '<h4 style="font-size:1rem; font-weight:700; color:var(--text-primary);">' + escapeHtml(subj.name) + ' <span class="font-bn" style="font-weight:500; color:var(--text-muted);">(' + escapeHtml(subj.nameBn) + ')</span></h4>' +
                  '<div style="font-size:0.78rem; color:var(--text-secondary);">Track: ' + escapeHtml(activeCat.name) + ' • ' + filteredChapters.length + ' Chapters • ' + realSubjCount + ' Total Subject MCQs</div>' +
                '</div>' +
              '</div>' +
              '<div style="display:flex; gap:0.5rem;">' +
                '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" onclick="window.evStartSubjectQuiz(\'' + subj.id + '\', \'practice\')">Subject Practice (' + realSubjCount + ')</button>' +
                '<button type="button" class="ev-btn ev-btn-primary ev-btn-sm" onclick="window.evStartSubjectQuiz(\'' + subj.id + '\', \'exam\')">Subject Exam</button>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex; flex-direction:column; gap:0.6rem;">' +
              chRows +
            '</div>' +
          '</div>'
        );
      });

      if (!chaptersHtml) {
        chaptersHtml = (
          '<div class="ev-card" style="text-align:center; padding:2.5rem 1.5rem;">' +
            '<div style="font-size:1rem; font-weight:700; margin-bottom:0.35rem;">No matching chapters found</div>' +
            '<p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Try clearing your search keyword or switching the difficulty/subject filter.</p>' +
            '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" onclick="window.evResetExamFilters()">Reset All Filters</button>' +
          '</div>'
        );
      }
      return chaptersHtml;
    },

    renderExamsView: function () {
      var self = this;
      var categories = window.EXAMVERSE_DATA.examCategories;
      var activeCat = categories.find(function (c) { return c.id === self.selectedExamCategory; }) || categories[0];

      var categoryCardsHtml = categories.map(function (cat) {
        var isSelected = cat.id === activeCat.id;
        var taggedCount = window.EXAMVERSE_DATA.getCategoryQuestionCount(cat.id);
        var chCount = window.EXAMVERSE_DATA.getCategoryChapterCount(cat.id);
        return (
          '<button type="button" class="ev-card ev-card-interactive ev-category-card ' + (isSelected ? 'is-selected' : '') + '" onclick="window.evSelectExamCategory(\'' + cat.id + '\')">' +
            '<div class="ev-subject-icon-box" style="width:40px; height:40px;">' + self.getIconSvg(cat.iconType) + '</div>' +
            '<div style="flex:1; min-width:0;">' +
              '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.4rem;">' +
                '<span style="font-size:0.95rem; font-weight:700;">' + escapeHtml(cat.name) + '</span>' +
                '<span class="ev-badge-pill ev-badge-neutral">' + escapeHtml(cat.badge) + '</span>' +
              '</div>' +
              '<div class="font-bn" style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.25rem;">' + escapeHtml(cat.nameBn) + '</div>' +
              '<div style="font-size:0.76rem; color:var(--text-secondary);">' + taggedCount + ' Tagged MCQs • ' + chCount + ' Chapters</div>' +
            '</div>' +
          '</button>'
        );
      }).join('');

      var subjectOptionsHtml = '<option value="all">All Subjects in ' + escapeHtml(activeCat.name) + '</option>' +
        window.EXAMVERSE_DATA.subjects
          .filter(function (s) { return activeCat.subjects.indexOf(s.id) !== -1; })
          .map(function (s) {
            var sel = self.examSubjectFilter === s.id ? 'selected' : '';
            return '<option value="' + s.id + '" ' + sel + '>' + escapeHtml(s.name) + ' (' + window.EXAMVERSE_DATA.getSubjectQuestionCount(s.id) + ' MCQs)</option>';
          }).join('');

      var activeCatCount = window.EXAMVERSE_DATA.getCategoryQuestionCount(activeCat.id);

      return (
        '<div style="margin-bottom:1.25rem;">' +
          '<h1 style="font-size:1.35rem; font-weight:800; color:var(--text-primary); margin-bottom:0.25rem;">Examination Categories &amp; Verified Syllabus Bank</h1>' +
          '<p style="font-size:0.86rem; color:var(--text-secondary);">Every subject and chapter count reflects the exact number of verified questions currently loaded in the bank.</p>' +
        '</div>' +

        '<div class="ev-category-grid">' +
          categoryCardsHtml +
        '</div>' +

        '<div class="ev-card" style="margin-bottom:1.25rem; background:linear-gradient(135deg, var(--bg-surface) 0%, var(--brand-primary-soft) 100%); border-color:var(--brand-primary-border); display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">' +
          '<div>' +
            '<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">' +
              '<span class="ev-badge-pill ev-badge-indigo">' + escapeHtml(activeCat.badge) + '</span>' +
              '<span class="font-bn" style="font-size:0.82rem; font-weight:700; color:var(--brand-primary);">' + escapeHtml(activeCat.nameBn) + '</span>' +
            '</div>' +
            '<h2 style="font-size:1.18rem; font-weight:800; color:var(--text-primary);">' + escapeHtml(activeCat.name) + ' — ' + escapeHtml(activeCat.fullTitle) + '</h2>' +
            '<p style="font-size:0.84rem; color:var(--text-secondary);">' + escapeHtml(activeCat.description) + '</p>' +
          '</div>' +
          '<div style="display:flex; gap:0.6rem; flex-wrap:wrap;">' +
            '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evStartCategoryQuiz(\'' + activeCat.id + '\', \'practice\')">Practice Track (' + activeCatCount + ')</button>' +
            '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evStartCategoryQuiz(\'' + activeCat.id + '\', \'exam\')">Start Timed Track Exam</button>' +
          '</div>' +
        '</div>' +

        '<div class="ev-filter-bar">' +
          '<div class="ev-search-wrap" style="display:flex; align-items:center; gap:0.4rem;">' +
            '<svg class="ev-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
            '<input type="text" id="ev-exam-search" class="ev-input" aria-label="Search chapters or topics" placeholder="Search chapter or topic (e.g., Calculus, Vector, সমাস, সংবিধান)..." value="' + escapeHtml(this.examSearchQuery) + '" oninput="window.evUpdateExamSearch(this.value)" />' +
            (this.examSearchQuery
              ? '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" onclick="window.evResetExamFilters()">Clear</button>'
              : '') +
          '</div>' +
          '<div style="min-width:210px;">' +
            '<select id="ev-exam-subject-filter" class="ev-select" aria-label="Filter by subject" onchange="window.evUpdateExamSubject(this.value)">' +
              subjectOptionsHtml +
            '</select>' +
          '</div>' +
          '<div style="min-width:155px;">' +
            '<select id="ev-exam-diff-filter" class="ev-select" aria-label="Filter by difficulty" onchange="window.evUpdateExamDifficulty(this.value)">' +
              '<option value="all" ' + (this.examDifficultyFilter === 'all' ? 'selected' : '') + '>All Difficulties</option>' +
              '<option value="Easy" ' + (this.examDifficultyFilter === 'Easy' ? 'selected' : '') + '>Easy</option>' +
              '<option value="Medium" ' + (this.examDifficultyFilter === 'Medium' ? 'selected' : '') + '>Medium</option>' +
              '<option value="Hard" ' + (this.examDifficultyFilter === 'Hard' ? 'selected' : '') + '>Hard</option>' +
            '</select>' +
          '</div>' +
        '</div>' +

        '<div id="ev-exams-chapters-container">' +
          this.buildExamsFilteredChaptersHtml() +
        '</div>'
      );
    },

    /* ======================================================================
       VIEW 3: QUIZ & EXAMINATION INTERFACE (With Empty Chapter Guard & Honest XP)
       ====================================================================== */
    renderQuizView: function () {
      var session = window.ExamVerseQuiz.session;
      if (!session) {
        return '<div class="ev-card">Initializing Quiz Session...</div>';
      }

      /* Audit 2.2 Fix: Proper Empty State when a selected chapter/filter has 0 questions */
      if (session.isEmpty || !session.questions || session.questions.length === 0) {
        return (
          '<div class="ev-card" style="text-align:center; padding:3rem 1.5rem; max-width:620px; margin:1.5rem auto;">' +
            '<div class="ev-subject-icon-box" style="margin:0 auto 1rem;">' + this.getIconSvg('book') + '</div>' +
            '<h2 style="font-size:1.25rem; font-weight:800; margin-bottom:0.4rem;">No questions available in this chapter yet.</h2>' +
            '<p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:1.25rem;">' +
              'We never substitute unrelated questions from other subjects. Please return to the chapter list or choose another topic.' +
            '</p>' +
            '<div style="display:flex; justify-content:center; gap:0.65rem; flex-wrap:wrap;">' +
              '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evNavigate(\'exams\', true)">← Back to Chapters</button>' +
              '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evNavigate(\'home\', true)">Go to Home</button>' +
            '</div>' +
          '</div>'
        );
      }

      var qIndex = session.currentIndex;
      var total = session.questions.length;
      var q = session.questions[qIndex];
      var isPractice = session.mode === 'practice';
      var isRevealed = Boolean(session.revealed[q.id]);
      var selectedOption = session.answers[q.id];
      var hasSelected = typeof selectedOption !== 'undefined' && selectedOption !== null;
      var isBookmarked = window.ExamVerseStorage.isBookmarked(q.id);
      var progressPct = Math.round(((qIndex + 1) / total) * 100);
      var optionLetters = ['A', 'B', 'C', 'D'];

      /* Build 4 Options */
      var optionsHtml = q.options.map(function (optText, idx) {
        var stateClass = '';
        if (isPractice && isRevealed) {
          if (idx === q.correctIndex) {
            stateClass = 'is-correct';
          } else if (idx === selectedOption && selectedOption !== q.correctIndex) {
            stateClass = 'is-incorrect';
          }
        } else if (hasSelected && idx === selectedOption) {
          stateClass = 'is-selected';
        }

        return (
          '<button type="button" class="ev-option-btn ' + stateClass + '" onclick="window.evSelectQuizOption(' + idx + ')">' +
            '<span class="ev-option-key">' + optionLetters[idx] + '</span>' +
            '<span style="flex:1;" class="font-bn">' + escapeHtml(optText) + '</span>' +
            (stateClass === 'is-correct'
              ? '<span class="ev-badge-pill ev-badge-success">Correct</span>'
              : (stateClass === 'is-incorrect' ? '<span class="ev-badge-pill ev-badge-danger">Your Answer</span>' : '')) +
          '</button>'
        );
      }).join('');

      /* Practice Mode Immediate Explanation Box (Audit 4.5 Fix: Honest XP wording) */
      var explanationHtml = '';
      if (isPractice && isRevealed) {
        var isRight = selectedOption === q.correctIndex;
        explanationHtml = (
          '<div class="ev-explanation-box" role="status" aria-live="polite">' +
            '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.35rem; flex-wrap:wrap; gap:0.4rem;">' +
              '<strong style="color:' + (isRight ? 'var(--status-success)' : 'var(--status-danger)') + '; font-size:0.9rem;">' +
                (isRight ? '✓ Correct Answer! (+20 XP credited upon session completion)' : '✕ Incorrect — Logged to your Mistake Bank for revision') +
              '</strong>' +
              '<span class="ev-badge-pill ev-badge-neutral">Correct Option: ' + optionLetters[q.correctIndex] + '</span>' +
            '</div>' +
            '<div><strong>Concept Explanation:</strong> ' + escapeHtml(q.explanation) + '</div>' +
          '</div>'
        );
      }

      /* Question Palette Dots */
      var paletteHtml = session.questions.map(function (item, idx) {
        var ans = session.answers[item.id];
        var rev = session.revealed[item.id];
        var bm = window.ExamVerseStorage.isBookmarked(item.id);
        var cls = [];
        if (idx === qIndex) cls.push('is-current');
        if (isPractice && rev) {
          cls.push(ans === item.correctIndex ? 'is-correct' : 'is-incorrect');
        } else if (typeof ans !== 'undefined' && ans !== null) {
          cls.push('is-answered');
        }
        if (bm) cls.push('is-bookmarked');
        return (
          '<button type="button" class="ev-palette-dot ' + cls.join(' ') + '" aria-label="Go to question ' + (idx + 1) + '" onclick="window.evJumpToQuestion(' + idx + ')">' +
            (idx + 1) +
          '</button>'
        );
      }).join('');

      var answeredTotal = Object.keys(session.answers).length;
      var negBadge = (!isPractice && session.negativeMark > 0)
        ? '<span class="ev-badge-pill ev-badge-danger">Negative Marking: -' + session.negativeMark + ' / wrong</span>'
        : '';

      return (
        '<div class="ev-card ev-quiz-header-bar">' +
          '<div>' +
            '<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.2rem; flex-wrap:wrap;">' +
              '<span class="ev-badge-pill ' + (isPractice ? 'ev-badge-indigo' : 'ev-badge-warning') + '">' +
                (isPractice ? 'Practice Mode • Instant Feedback' : 'Exam Mode • Timed Simulation') +
              '</span>' +
              negBadge +
              '<span class="ev-badge-pill ev-badge-neutral">' + escapeHtml(q.examTag) + '</span>' +
            '</div>' +
            '<h2 style="font-size:1.05rem; font-weight:800; color:var(--text-primary);">' + escapeHtml(session.title) + '</h2>' +
          '</div>' +
          '<div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">' +
            (window.ExamVerseStorage.state.settings.timerEnabled
              ? '<div id="ev-timer-badge" class="ev-timer-badge font-mono" title="Session Countdown Timer">' +
                  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
                  '<span id="ev-live-timer">' + window.ExamVerseQuiz.formatTime(session.remainingSec) + '</span>' +
                '</div>'
              : '<span class="ev-badge-pill ev-badge-neutral">Untimed Session</span>') +
            '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" onclick="window.evRequestSwitchQuizMode(\'' + (isPractice ? 'exam' : 'practice') + '\')">' +
              'Restart in ' + (isPractice ? 'Exam Mode' : 'Practice Mode') +
            '</button>' +
            '<button type="button" class="ev-btn ev-btn-primary ev-btn-sm" onclick="window.evRequestSubmitQuiz()">Submit &amp; Finish</button>' +
          '</div>' +
        '</div>' +

        '<div class="ev-quiz-layout">' +
          '<div class="ev-card ev-question-card">' +
            '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; margin-bottom:0.65rem;">' +
              '<span style="font-size:0.84rem; font-weight:700; color:var(--brand-primary);">Question ' + (qIndex + 1) + ' of ' + total + '</span>' +
              '<div style="display:flex; align-items:center; gap:0.5rem;">' +
                '<span class="ev-badge-pill ev-badge-neutral">' + escapeHtml(q.difficulty) + '</span>' +
                '<button type="button" class="ev-btn ' + (isBookmarked ? 'ev-btn-soft' : 'ev-btn-secondary') + ' ev-btn-sm" aria-pressed="' + (isBookmarked ? 'true' : 'false') + '" onclick="window.evToggleBookmark(\'' + q.id + '\')">' +
                  '<svg viewBox="0 0 24 24" width="15" height="15" fill="' + (isBookmarked ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>' +
                  (isBookmarked ? 'Bookmarked' : 'Bookmark') +
                '</button>' +
              '</div>' +
            '</div>' +

            '<div class="ev-progress-track" style="margin-bottom:1.1rem;">' +
              '<div class="ev-progress-fill" style="width:' + progressPct + '%;"></div>' +
            '</div>' +

            '<div class="ev-question-text">' +
              this.formatQuestionDisplay(q) +
            '</div>' +

            '<div class="ev-options-list">' +
              optionsHtml +
            '</div>' +

            explanationHtml +

            '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.75rem; margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--border-subtle);">' +
              '<button type="button" class="ev-btn ev-btn-secondary" ' + (qIndex === 0 ? 'disabled' : '') + ' onclick="window.evPrevQuestion()">← Previous</button>' +
              '<div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">' +
                answeredTotal + ' of ' + total + ' Answered (' + (total - answeredTotal) + ' Remaining)' +
              '</div>' +
              (qIndex < total - 1
                ? '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evNextQuestion()">Next Question →</button>'
                : '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evRequestSubmitQuiz()">Submit Quiz ✓</button>') +
            '</div>' +
          '</div>' +

          '<div style="display:flex; flex-direction:column; gap:1rem;">' +
            '<div class="ev-card">' +
              '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.35rem;">' +
                '<h3 style="font-size:0.92rem; font-weight:700; color:var(--text-primary);">Question Navigator</h3>' +
                '<span style="font-size:0.76rem; color:var(--text-muted);">' + answeredTotal + '/' + total + '</span>' +
              '</div>' +
              '<p style="font-size:0.76rem; color:var(--text-muted);">Jump to any question directly. Amber dot indicates bookmarked items.</p>' +
              '<div class="ev-palette-grid">' +
                paletteHtml +
              '</div>' +
              '<div style="margin-top:1rem; padding-top:0.85rem; border-top:1px solid var(--border-subtle); display:flex; flex-direction:column; gap:0.5rem;">' +
                '<button type="button" class="ev-btn ev-btn-primary" style="width:100%;" onclick="window.evRequestSubmitQuiz()">' +
                  'Submit ' + (isPractice ? 'Practice' : 'Examination') +
                '</button>' +
              '</div>' +
            '</div>' +

            '<div class="ev-card" style="padding:1rem;">' +
              '<div style="font-size:0.82rem; font-weight:700; margin-bottom:0.35rem; color:var(--text-primary);">Keyboard Shortcuts</div>' +
              '<div style="font-size:0.76rem; color:var(--text-secondary); display:grid; grid-template-columns:1fr 1fr; gap:0.35rem;">' +
                '<span><kbd class="font-mono">1-4</kbd> Select Option</span>' +
                '<span><kbd class="font-mono">N / →</kbd> Next</span>' +
                '<span><kbd class="font-mono">P / ←</kbd> Previous</span>' +
                '<span><kbd class="font-mono">B</kbd> Bookmark</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    },

    /* ======================================================================
       VIEW 4: RESULTS PAGE (With Attempted vs Skipped, Net Score & XP Breakdown)
       ====================================================================== */
    renderResultsView: function () {
      var res = window.ExamVerseQuiz.lastResult;
      if (!res) {
        return (
          '<div class="ev-card" style="text-align:center; padding:2.5rem;">' +
            '<h2 style="font-size:1.15rem; font-weight:700; margin-bottom:0.5rem;">No Recent Quiz Result</h2>' +
            '<p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:1rem;">Complete a Practice or Exam session to see your detailed diagnostic report.</p>' +
            '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evNavigate(\'quiz\')">Go to Active Quiz</button>' +
          '</div>'
        );
      }

      var radius = 48;
      var circumference = Math.round(2 * Math.PI * radius);
      var displayPct = typeof res.scorePct === 'number' ? res.scorePct : res.accuracy;
      var dashOffset = Math.round(circumference * (1 - displayPct / 100));
      var ringColor = displayPct >= 80 ? 'var(--status-success)' : (displayPct >= 50 ? 'var(--brand-primary)' : 'var(--status-danger)');

      var subjRowsHtml = Object.keys(res.subjectBreakdown || {}).map(function (subjId) {
        var item = res.subjectBreakdown[subjId];
        var pct = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
        var subjMeta = window.EXAMVERSE_DATA.subjects.find(function (s) { return s.id === subjId; });
        var name = subjMeta ? subjMeta.name : subjId.toUpperCase();
        return (
          '<div style="margin-bottom:0.85rem;">' +
            '<div style="display:flex; justify-content:space-between; font-size:0.84rem; font-weight:600; margin-bottom:0.3rem;">' +
              '<span>' + escapeHtml(name) + '</span>' +
              '<span>' + item.correct + '/' + item.total + ' Correct • Attempted ' + (item.attempted || 0) + ' (' + pct + '%)</span>' +
            '</div>' +
            '<div class="ev-progress-track">' +
              '<div class="ev-progress-fill ' + (pct >= 80 ? 'is-success' : '') + '" style="width:' + pct + '%;"></div>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      var hasNegative = res.mode === 'exam' && res.negativeMark > 0;

      return (
        '<div class="ev-card" style="margin-bottom:1.25rem; padding:1.5rem;">' +
          '<div style="display:flex; align-items:center; justify-content:space-between; gap:1.25rem; flex-wrap:wrap;">' +
            '<div style="display:flex; align-items:center; gap:1.25rem; flex-wrap:wrap;">' +
              '<div style="position:relative; width:116px; height:116px; display:flex; align-items:center; justify-content:center;">' +
                '<svg width="116" height="116" viewBox="0 0 116 116" aria-hidden="true">' +
                  '<circle cx="58" cy="58" r="' + radius + '" fill="none" stroke="var(--bg-surface-muted)" stroke-width="10"/>' +
                  '<circle cx="58" cy="58" r="' + radius + '" fill="none" stroke="' + ringColor + '" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + circumference + '" stroke-dashoffset="' + dashOffset + '" transform="rotate(-90 58 58)"/>' +
                '</svg>' +
                '<div style="position:absolute; text-align:center;">' +
                  '<div style="font-size:1.35rem; font-weight:800; color:var(--text-primary);">' + displayPct + '%</div>' +
                  '<div style="font-size:0.68rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Score</div>' +
                '</div>' +
              '</div>' +

              '<div>' +
                '<span class="ev-badge-pill ev-badge-indigo" style="margin-bottom:0.4rem;">' + (res.mode === 'exam' ? 'Exam Mode Completed' : 'Practice Completed') + '</span>' +
                '<h1 style="font-size:1.4rem; font-weight:800; color:var(--text-primary); margin-bottom:0.2rem;">' + escapeHtml(res.title) + '</h1>' +
                '<p style="font-size:0.86rem; color:var(--text-secondary);">' +
                  'Attempted <strong>' + (res.attempted || 0) + ' of ' + res.total + '</strong> questions • Correct: <strong>' + res.correct + '</strong> • Accuracy on attempted: <strong>' + res.accuracy + '%</strong> • Earned <strong>+' + res.xpEarned + ' XP</strong>.' +
                '</p>' +
              '</div>' +
            '</div>' +

            '<div style="display:flex; gap:0.6rem; flex-wrap:wrap;">' +
              '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evNavigate(\'review\')">Review Answers</button>' +
              '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evRetryLastQuiz()">Retry Same Quiz</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="ev-grid-4" style="margin-bottom:1.25rem;">' +
          '<div class="ev-card">' +
            '<div style="font-size:0.76rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Score &amp; Net Marks</div>' +
            '<div style="font-size:1.45rem; font-weight:800; color:var(--text-primary); margin-top:0.2rem;">' +
              (hasNegative ? (res.netScore + ' / ' + res.total) : (res.correct + ' / ' + res.total)) +
            '</div>' +
            '<div style="font-size:0.78rem; color:var(--status-success); font-weight:600;">' +
              'Correct: ' + res.correct + (hasNegative ? (' (Penalty: -' + res.penalty + ')') : '') +
            '</div>' +
          '</div>' +
          '<div class="ev-card">' +
            '<div style="font-size:0.76rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Attempted, Wrong &amp; Skipped</div>' +
            '<div style="font-size:1.45rem; font-weight:800; color:var(--status-danger); margin-top:0.2rem;">' + res.incorrect + ' Wrong</div>' +
            '<div style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">Attempted: ' + (res.attempted || 0) + ' • Skipped: ' + res.skipped + '</div>' +
          '</div>' +
          '<div class="ev-card">' +
            '<div style="font-size:0.76rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Time Taken</div>' +
            '<div class="font-mono" style="font-size:1.45rem; font-weight:800; color:var(--text-primary); margin-top:0.2rem;">' + window.ExamVerseQuiz.formatTime(res.timeTakenSec) + '</div>' +
            '<div style="font-size:0.78rem; color:var(--text-secondary);">Exact Elapsed: ' + res.timeTakenSec + 's</div>' +
          '</div>' +
          '<div class="ev-card">' +
            '<div style="font-size:0.76rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">XP Breakdown</div>' +
            '<div style="font-size:1.45rem; font-weight:800; color:var(--brand-primary); margin-top:0.2rem;">+' + res.xpEarned + ' XP</div>' +
            '<div style="font-size:0.76rem; color:var(--text-secondary); font-weight:600;">' +
              'Answers: +' + (res.answerXp || 0) + ' • Bonus: +' + ((res.accuracyBonusXp || 0) + (res.dailyBonusXp || 0)) +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="ev-grid-2">' +
          '<div class="ev-card">' +
            '<h3 style="font-size:1rem; font-weight:700; margin-bottom:1rem;">Subject-wise Performance</h3>' +
            subjRowsHtml +
          '</div>' +
          '<div class="ev-card" style="display:flex; flex-direction:column; justify-content:space-between;">' +
            '<div>' +
              '<h3 style="font-size:1rem; font-weight:700; margin-bottom:0.5rem;">Recommended Next Step</h3>' +
              '<p style="font-size:0.86rem; color:var(--text-secondary); margin-bottom:1rem;">' +
                'Inspect every question in the step-by-step Answer Review or launch a targeted Mistake Recovery session.' +
              '</p>' +
            '</div>' +
            '<div style="display:flex; gap:0.6rem; flex-wrap:wrap;">' +
              '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evNavigate(\'review\')">Step-by-Step Answer Review</button>' +
              '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evNavigate(\'mistakes\')">Open Mistake Bank</button>' +
              '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evNavigate(\'home\')">Back to Home</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    },

    /* ======================================================================
       VIEW 5: ANSWER REVIEW PAGE
       ====================================================================== */
    renderReviewView: function () {
      var res = window.ExamVerseQuiz.lastResult;
      var questions = res ? res.questions : window.EXAMVERSE_DATA.questions.slice(0, 8);
      var answers = res ? res.answers : {};
      var filter = window.ExamVerseQuiz.reviewFilter || 'all';
      var self = this;
      var optionLetters = ['A', 'B', 'C', 'D'];

      var filtered = questions.filter(function (q) {
        var ans = answers[q.id];
        var isSkipped = typeof ans === 'undefined' || ans === null;
        var isCorrect = !isSkipped && ans === q.correctIndex;
        if (filter === 'correct') return isCorrect;
        if (filter === 'incorrect') return !isSkipped && !isCorrect;
        if (filter === 'skipped') return isSkipped;
        return true;
      });

      var cardsHtml = filtered.map(function (q, idx) {
        var ans = answers[q.id];
        var isSkipped = typeof ans === 'undefined' || ans === null;
        var isCorrect = !isSkipped && ans === q.correctIndex;
        var statusBadge = isSkipped
          ? '<span class="ev-badge-pill ev-badge-warning">Skipped</span>'
          : (isCorrect
              ? '<span class="ev-badge-pill ev-badge-success">Correct</span>'
              : '<span class="ev-badge-pill ev-badge-danger">Incorrect</span>');

        var opts = q.options.map(function (optText, oIdx) {
          var cls = '';
          if (oIdx === q.correctIndex) cls = 'is-correct';
          else if (!isSkipped && oIdx === ans) cls = 'is-incorrect';
          return (
            '<div class="ev-option-btn ' + cls + '" style="cursor:default;">' +
              '<span class="ev-option-key">' + optionLetters[oIdx] + '</span>' +
              '<span style="flex:1;" class="font-bn">' + escapeHtml(optText) + '</span>' +
            '</div>'
          );
        }).join('');

        return (
          '<div class="ev-card" style="margin-bottom:1rem;">' +
            '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.65rem;">' +
              '<span style="font-size:0.84rem; font-weight:700; color:var(--brand-primary);">Question ' + (idx + 1) + ' • ' + escapeHtml(q.examTag) + '</span>' +
              statusBadge +
            '</div>' +
            '<div class="ev-question-text" style="margin-top:0.25rem; margin-bottom:1rem; font-size:1.02rem;">' +
              self.formatQuestionDisplay(q) +
            '</div>' +
            '<div class="ev-options-list">' + opts + '</div>' +
            '<div class="ev-explanation-box">' +
              '<strong>Explanation:</strong> ' + escapeHtml(q.explanation) +
            '</div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem;">' +
          '<div>' +
            '<h1 style="font-size:1.35rem; font-weight:800;">Answer Review &amp; Explanations</h1>' +
            '<p style="font-size:0.85rem; color:var(--text-secondary);">Reviewing: <strong>' + escapeHtml(res ? res.title : 'Practice Set') + '</strong></p>' +
          '</div>' +
          '<div style="display:flex; gap:0.5rem; flex-wrap:wrap;">' +
            '<button type="button" class="ev-btn ' + (filter === 'all' ? 'ev-btn-primary' : 'ev-btn-secondary') + ' ev-btn-sm" onclick="window.evSetReviewFilter(\'all\')">All</button>' +
            '<button type="button" class="ev-btn ' + (filter === 'correct' ? 'ev-btn-primary' : 'ev-btn-secondary') + ' ev-btn-sm" onclick="window.evSetReviewFilter(\'correct\')">Correct</button>' +
            '<button type="button" class="ev-btn ' + (filter === 'incorrect' ? 'ev-btn-primary' : 'ev-btn-secondary') + ' ev-btn-sm" onclick="window.evSetReviewFilter(\'incorrect\')">Incorrect</button>' +
            '<button type="button" class="ev-btn ' + (filter === 'skipped' ? 'ev-btn-primary' : 'ev-btn-secondary') + ' ev-btn-sm" onclick="window.evSetReviewFilter(\'skipped\')">Skipped</button>' +
            '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" onclick="window.evNavigate(\'results\')">← Back to Summary</button>' +
          '</div>' +
        '</div>' +
        (cardsHtml || '<div class="ev-card" style="text-align:center; padding:2rem;">No questions match this filter.</div>')
      );
    },

    /* ======================================================================
       VIEW 6: STATS & LEARNING ANALYTICS PAGE (Honest Zero-Start & Rolling 7 Days)
       ====================================================================== */
    renderStatsView: function () {
      var state = window.ExamVerseStorage.state;
      var s = state.stats;
      var accuracy = s.totalAttempted > 0 ? Math.round((s.totalCorrect / s.totalAttempted) * 100) : 0;
      var avgScore = s.completedQuizzes > 0 ? Math.round(s.totalScorePctSum / s.completedQuizzes) : 0;

      var masteryEntries = window.EXAMVERSE_DATA.subjects.map(function (subj) {
        var st = (s.subjectStats && s.subjectStats[subj.id]) || { attempted: 0, correct: 0 };
        return {
          id: subj.id,
          name: subj.name,
          nameBn: subj.nameBn,
          attempted: st.attempted,
          correct: st.correct,
          score: s.subjectMastery[subj.id] || 0
        };
      });

      var attemptedSubjects = masteryEntries.filter(function (m) { return m.attempted > 0; }).sort(function (a, b) { return b.score - a.score; });
      var strongest = attemptedSubjects.length > 0 ? attemptedSubjects[0] : null;
      var weakest = attemptedSubjects.length > 0 ? attemptedSubjects[attemptedSubjects.length - 1] : null;

      /* Rolling 7-Day Activity Chart with Dynamic Scale */
      var maxBarVal = 20;
      s.weeklyActivity.forEach(function (d) {
        if (d.attempted > maxBarVal) maxBarVal = d.attempted;
      });

      var barsSvg = s.weeklyActivity.map(function (dayItem, idx) {
        var x = 48 + idx * 72;
        var totalH = Math.min(140, Math.round((dayItem.attempted / maxBarVal) * 140));
        var corrH = Math.min(totalH, Math.round((dayItem.correct / maxBarVal) * 140));
        var yTotal = 165 - totalH;
        var yCorr = 165 - corrH;
        var shortDate = (dayItem.dateKey || '').slice(5);
        return (
          '<g>' +
            '<rect x="' + x + '" y="' + yTotal + '" width="28" height="' + totalH + '" rx="5" fill="var(--chart-bar-secondary)" opacity="0.35"/>' +
            '<rect x="' + x + '" y="' + yCorr + '" width="28" height="' + corrH + '" rx="5" fill="var(--chart-bar-primary)"/>' +
            '<text x="' + (x + 14) + '" y="' + (yTotal - 6) + '" text-anchor="middle" fill="var(--text-secondary)" font-size="11" font-weight="700">' + dayItem.attempted + '</text>' +
            '<text x="' + (x + 14) + '" y="182" text-anchor="middle" fill="var(--text-muted)" font-size="10" font-weight="700">' + escapeHtml(dayItem.day) + '</text>' +
            '<text x="' + (x + 14) + '" y="196" text-anchor="middle" fill="var(--text-faint)" font-size="9">' + escapeHtml(shortDate) + '</text>' +
          '</g>'
        );
      }).join('');

      var subjectProgressHtml = masteryEntries.map(function (item) {
        return (
          '<div style="margin-bottom:0.85rem;">' +
            '<div style="display:flex; justify-content:space-between; font-size:0.84rem; font-weight:600; margin-bottom:0.3rem;">' +
              '<span>' + escapeHtml(item.name) + ' <span class="font-bn" style="color:var(--text-muted); font-weight:500;">(' + escapeHtml(item.nameBn) + ')</span></span>' +
              '<span class="font-mono">' + (item.attempted > 0 ? (item.correct + '/' + item.attempted + ' (' + item.score + '%)') : '0% (No attempts)') + '</span>' +
            '</div>' +
            '<div class="ev-progress-track">' +
              '<div class="ev-progress-fill ' + (item.score >= 80 ? 'is-success' : '') + '" style="width:' + item.score + '%;"></div>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div style="margin-bottom:1.25rem;">' +
          '<h1 style="font-size:1.35rem; font-weight:800;">Learning Analytics &amp; Performance</h1>' +
          '<p style="font-size:0.86rem; color:var(--text-secondary);">Real-time analytics tracking your attempted vs. skipped questions, rolling 7-day velocity, and subject mastery.</p>' +
        '</div>' +

        '<div class="ev-grid-3" style="margin-bottom:1.25rem;">' +
          '<div class="ev-card">' +
            '<div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Attempted vs Skipped</div>' +
            '<div style="font-size:1.55rem; font-weight:800; margin-top:0.2rem;">' + s.totalAttempted.toLocaleString() + ' Attempted</div>' +
            '<div style="font-size:0.8rem; color:var(--status-success); font-weight:600;">' + s.totalCorrect + ' Correct • ' + (s.totalIncorrect || 0) + ' Wrong • ' + (s.totalSkipped || 0) + ' Skipped</div>' +
          '</div>' +
          '<div class="ev-card">' +
            '<div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Overall Accuracy &amp; Quizzes</div>' +
            '<div style="font-size:1.55rem; font-weight:800; color:var(--brand-primary); margin-top:0.2rem;">' + accuracy + '% Accuracy</div>' +
            '<div style="font-size:0.8rem; color:var(--text-secondary); font-weight:600;">' + s.completedQuizzes + ' Completed Quizzes • Avg ' + avgScore + '%</div>' +
          '</div>' +
          '<div class="ev-card">' +
            '<div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Current Standing</div>' +
            '<div style="font-size:1.55rem; font-weight:800; color:var(--brand-accent); margin-top:0.2rem;">Level ' + state.user.level + '</div>' +
            '<div style="font-size:0.8rem; color:var(--text-secondary); font-weight:600;">' + state.user.xp.toLocaleString() + ' Total XP • ' + state.user.streakDays + 'd Streak</div>' +
          '</div>' +
        '</div>' +

        '<div class="ev-grid-2" style="margin-bottom:1.25rem;">' +
          '<div class="ev-card" style="border-left:4px solid var(--status-success);">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem;">' +
              '<div>' +
                '<span class="ev-badge-pill ev-badge-success" style="margin-bottom:0.35rem;">Strongest Subject</span>' +
                '<h3 style="font-size:1.1rem; font-weight:800;">' + (strongest ? (escapeHtml(strongest.name) + ' (' + strongest.score + '%)') : 'Take a quiz to unlock') + '</h3>' +
                '<p style="font-size:0.82rem; color:var(--text-secondary);">' + (strongest ? (strongest.correct + ' correct out of ' + strongest.attempted + ' attempted questions.') : 'Attempt questions in any subject to calculate your strongest area.') + '</p>' +
              '</div>' +
              '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" onclick="window.evStartSubjectQuiz(\'' + (strongest ? strongest.id : 'physics') + '\', \'exam\')">Challenge</button>' +
            '</div>' +
          '</div>' +
          '<div class="ev-card" style="border-left:4px solid var(--status-warning);">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem;">' +
              '<div>' +
                '<span class="ev-badge-pill ev-badge-warning" style="margin-bottom:0.35rem;">Focus Area (Weakest Subject)</span>' +
                '<h3 style="font-size:1.1rem; font-weight:800;">' + (weakest ? (escapeHtml(weakest.name) + ' (' + weakest.score + '%)') : 'Take a quiz to unlock') + '</h3>' +
                '<p style="font-size:0.82rem; color:var(--text-secondary);">' + (weakest ? 'Recommended for targeted concept practice today.' : 'Your lowest-scoring attempted subject will appear here.') + '</p>' +
              '</div>' +
              '<button type="button" class="ev-btn ev-btn-primary ev-btn-sm" onclick="window.evStartSubjectQuiz(\'' + (weakest ? weakest.id : 'chemistry') + '\', \'practice\')">Boost Now</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="ev-grid-2">' +
          '<div class="ev-card">' +
            '<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">' +
              '<h3 style="font-size:1rem; font-weight:700;">Rolling 7-Day Activity (Attempted vs Correct)</h3>' +
              '<span class="ev-badge-pill ev-badge-indigo">Asia/Dhaka Calendar</span>' +
            '</div>' +
            '<div style="width:100%; overflow-x:auto;">' +
              '<svg viewBox="0 0 560 208" style="width:100%; height:auto; min-width:300px; display:block;" aria-label="Weekly Activity Bar Chart">' +
                '<line x1="36" y1="25" x2="535" y2="25" stroke="var(--chart-grid)" stroke-dasharray="3 3"/>' +
                '<line x1="36" y1="95" x2="535" y2="95" stroke="var(--chart-grid)" stroke-dasharray="3 3"/>' +
                '<line x1="36" y1="165" x2="535" y2="165" stroke="var(--chart-grid)"/>' +
                '<text x="28" y="29" text-anchor="end" fill="var(--text-faint)" font-size="10">' + maxBarVal + '</text>' +
                '<text x="28" y="99" text-anchor="end" fill="var(--text-faint)" font-size="10">' + Math.round(maxBarVal / 2) + '</text>' +
                '<text x="28" y="169" text-anchor="end" fill="var(--text-faint)" font-size="10">0</text>' +
                barsSvg +
              '</svg>' +
            '</div>' +
          '</div>' +

          '<div class="ev-card">' +
            '<h3 style="font-size:1rem; font-weight:700; margin-bottom:0.85rem;">Learning Progress by Subject</h3>' +
            subjectProgressHtml +
          '</div>' +
        '</div>'
      );
    },

    /* ======================================================================
       VIEW 7: LEADERBOARD (Dynamic User Insertion & Sorted Ranking)
       ====================================================================== */
    renderLeaderboardView: function () {
      var self = this;
      var u = window.ExamVerseStorage.state.user;
      var basePeers = (window.EXAMVERSE_DATA.leaderboards.global[this.leaderboardPeriod] || window.EXAMVERSE_DATA.leaderboards.global.week).slice();

      /* Insert the current user dynamically with their actual XP and sort by XP descending (Audit 2.9) */
      var combined = basePeers.map(function (p) { return Object.assign({}, p, { isCurrentUser: false }); });
      combined.push({
        name: u.name,
        handle: u.username,
        avatar: u.avatarInitials || 'SS',
        level: u.level,
        xp: u.xp,
        badge: u.targetTrack.split(' ')[0] + ' Track',
        isCurrentUser: true,
        isFriend: true
      });

      var entries = combined
        .filter(function (item) {
          if (self.leaderboardScope === 'friends') return item.isFriend;
          return true;
        })
        .sort(function (a, b) { return b.xp - a.xp; })
        .map(function (item, idx) {
          item.displayRank = idx + 1;
          return item;
        });

      var topThree = entries.slice(0, 3);
      var podiumHtml = topThree.map(function (p) {
        var medalLabel = p.displayRank === 1 ? '1st • Gold Merit' : (p.displayRank === 2 ? '2nd • Silver Merit' : '3rd • Bronze Merit');
        return (
          '<div class="ev-podium-card rank-' + p.displayRank + '">' +
            '<span class="ev-badge-pill ev-badge-neutral" style="font-weight:800;">' + medalLabel + '</span>' +
            '<div class="ev-avatar-sm" style="width:48px; height:48px; font-size:1rem; margin:0.25rem 0;">' + escapeHtml(p.avatar) + '</div>' +
            '<div style="font-size:0.98rem; font-weight:800; color:var(--text-primary);">' + escapeHtml(p.name) + (p.isCurrentUser ? ' (You)' : '') + '</div>' +
            '<div style="font-size:0.76rem; color:var(--text-secondary);">Level ' + p.level + ' • ' + escapeHtml(p.badge) + '</div>' +
            '<div class="font-mono" style="font-size:0.92rem; font-weight:800; color:var(--brand-primary); margin-top:0.2rem;">' + p.xp.toLocaleString() + ' XP</div>' +
          '</div>'
        );
      }).join('');

      var rowsHtml = entries.map(function (entry) {
        return (
          '<tr class="' + (entry.isCurrentUser ? 'is-current-user' : '') + '">' +
            '<td class="font-mono" style="font-weight:700;">#' + entry.displayRank + '</td>' +
            '<td>' +
              '<div style="display:flex; align-items:center; gap:0.65rem;">' +
                '<div class="ev-avatar-sm">' + escapeHtml(entry.avatar) + '</div>' +
                '<div>' +
                  '<div style="font-weight:700;">' + escapeHtml(entry.name) + (entry.isCurrentUser ? ' <span class="ev-badge-pill ev-badge-indigo">You</span>' : '') + '</div>' +
                  '<div style="font-size:0.75rem; color:var(--text-muted);">' + escapeHtml(entry.handle) + '</div>' +
                '</div>' +
              '</div>' +
            '</td>' +
            '<td><span class="ev-badge-pill ev-badge-neutral">' + escapeHtml(entry.badge) + '</span></td>' +
            '<td>Level ' + entry.level + '</td>' +
            '<td class="font-mono" style="font-weight:700; color:var(--brand-primary);">' + entry.xp.toLocaleString() + ' XP</td>' +
          '</tr>'
        );
      }).join('');

      return (
        '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem;">' +
          '<div>' +
            '<div style="display:flex; align-items:center; gap:0.5rem;">' +
              '<h1 style="font-size:1.35rem; font-weight:800;">Merit Leaderboard</h1>' +
              '<span class="ev-badge-pill ev-badge-neutral">Local + Benchmark Peers</span>' +
            '</div>' +
            '<p style="font-size:0.86rem; color:var(--text-secondary);">Your live XP (' + u.xp.toLocaleString() + ' XP) ranks you dynamically against benchmark peer scores.</p>' +
          '</div>' +
          '<div style="display:flex; gap:0.5rem; flex-wrap:wrap;">' +
            '<button type="button" class="ev-btn ' + (this.leaderboardScope === 'global' ? 'ev-btn-primary' : 'ev-btn-secondary') + ' ev-btn-sm" onclick="window.evSetLeaderboardScope(\'global\')">Global</button>' +
            '<button type="button" class="ev-btn ' + (this.leaderboardScope === 'friends' ? 'ev-btn-primary' : 'ev-btn-secondary') + ' ev-btn-sm" onclick="window.evSetLeaderboardScope(\'friends\')">Friends</button>' +
            '<span style="border-left:1px solid var(--border-default); margin:0 0.2rem;"></span>' +
            '<button type="button" class="ev-btn ' + (this.leaderboardPeriod === 'today' ? 'ev-btn-soft' : 'ev-btn-secondary') + ' ev-btn-sm" onclick="window.evSetLeaderboardPeriod(\'today\')">Today</button>' +
            '<button type="button" class="ev-btn ' + (this.leaderboardPeriod === 'week' ? 'ev-btn-soft' : 'ev-btn-secondary') + ' ev-btn-sm" onclick="window.evSetLeaderboardPeriod(\'week\')">This Week</button>' +
            '<button type="button" class="ev-btn ' + (this.leaderboardPeriod === 'alltime' ? 'ev-btn-soft' : 'ev-btn-secondary') + ' ev-btn-sm" onclick="window.evSetLeaderboardPeriod(\'alltime\')">All Time</button>' +
          '</div>' +
        '</div>' +

        '<div class="ev-podium-grid">' +
          podiumHtml +
        '</div>' +

        '<div class="ev-card" style="padding:0;">' +
          '<div class="ev-table-wrap">' +
            '<table class="ev-table">' +
              '<thead>' +
                '<tr>' +
                  '<th>Rank</th>' +
                  '<th>Candidate</th>' +
                  '<th>Track</th>' +
                  '<th>Level</th>' +
                  '<th>XP</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' +
                rowsHtml +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>'
      );
    },

    /* ======================================================================
       VIEW 8: PROFILE PAGE (With Profile Edit Modal & Real Locked/Unlocked Badges)
       ====================================================================== */
    renderProfileView: function () {
      var state = window.ExamVerseStorage.state;
      var u = state.user;
      var s = state.stats;
      var accuracy = s.totalAttempted > 0 ? Math.round((s.totalCorrect / s.totalAttempted) * 100) : 0;
      var self = this;

      var badgesHtml = window.EXAMVERSE_DATA.achievements.map(function (ach) {
        var unlocked = state.unlockedBadges.indexOf(ach.id) !== -1;
        return (
          '<div class="ev-badge-card ' + (unlocked ? '' : 'is-locked') + '">' +
            '<div class="ev-hex-medal">' + self.getMetallicBadgeSvg(ach.tier) + '</div>' +
            '<div style="flex:1;">' +
              '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.4rem;">' +
                '<span style="font-size:0.9rem; font-weight:700;">' + escapeHtml(ach.title) + '</span>' +
                '<span class="ev-badge-pill ' + (unlocked ? 'ev-badge-success' : 'ev-badge-neutral') + '">' + (unlocked ? 'Unlocked ✓' : 'Locked') + '</span>' +
              '</div>' +
              '<div class="font-bn" style="font-size:0.76rem; color:var(--text-muted);">' + escapeHtml(ach.titleBn) + ' • +' + ach.xpBonus + ' XP Bonus</div>' +
              '<div style="font-size:0.78rem; color:var(--text-secondary); margin-top:0.2rem;">' + escapeHtml(ach.description) + '</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      return (
        '<div class="ev-card" style="margin-bottom:1.25rem; display:flex; align-items:center; justify-content:space-between; gap:1.25rem; flex-wrap:wrap;">' +
          '<div style="display:flex; align-items:center; gap:1.1rem; flex-wrap:wrap;">' +
            '<div class="ev-avatar-sm" style="width:68px; height:68px; font-size:1.45rem;">' + escapeHtml(u.avatarInitials || 'SS') + '</div>' +
            '<div>' +
              '<div style="display:flex; align-items:center; gap:0.55rem; flex-wrap:wrap;">' +
                '<h1 style="font-size:1.35rem; font-weight:800;">' + escapeHtml(u.name) + '</h1>' +
                '<span class="ev-streak-pill ' + (u.streakActive && u.streakDays > 0 ? 'is-active' : 'is-muted') + '" style="cursor:default;">' +
                  '<svg class="ev-flame-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2c1.5 3.5 4.5 5.5 4.5 9.5a4.5 4.5 0 1 1-9 0C7.5 9 9.5 6 12 2zm0 14a2 2 0 0 0 2-2c0-1.5-2-3.5-2-3.5S10 12.5 10 14a2 2 0 0 0 2 2z"/></svg>' +
                  '<span>' + u.streakDays + ' Day Streak</span>' +
                '</span>' +
              '</div>' +
              '<div style="font-size:0.84rem; color:var(--text-muted); margin-bottom:0.35rem;">' + escapeHtml(u.username) + ' • ' + escapeHtml(u.targetTrack) + '</div>' +
              '<div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">' +
                '<span class="ev-badge-pill ev-badge-indigo">Level ' + u.level + ' Scholar</span>' +
                '<span class="ev-badge-pill ev-badge-violet">' + u.xp.toLocaleString() + ' / ' + u.xpForNextLevel.toLocaleString() + ' XP</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; gap:0.55rem; flex-wrap:wrap;">' +
            '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evOpenProfileEditModal()">Edit Profile</button>' +
            '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evNavigate(\'settings\')">Settings</button>' +
            '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evNavigate(\'stats\')">Detailed Analytics</button>' +
          '</div>' +
        '</div>' +

        '<div class="ev-grid-4" style="margin-bottom:1.5rem;">' +
          '<div class="ev-card">' +
            '<div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Completed Quizzes</div>' +
            '<div style="font-size:1.4rem; font-weight:800; margin-top:0.2rem;">' + s.completedQuizzes + '</div>' +
          '</div>' +
          '<div class="ev-card">' +
            '<div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Accuracy Rate</div>' +
            '<div style="font-size:1.4rem; font-weight:800; color:var(--status-success); margin-top:0.2rem;">' + accuracy + '%</div>' +
          '</div>' +
          '<div class="ev-card">' +
            '<div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Saved Bookmarks</div>' +
            '<div style="font-size:1.4rem; font-weight:800; color:var(--brand-primary); margin-top:0.2rem;">' + state.bookmarks.length + '</div>' +
          '</div>' +
          '<div class="ev-card">' +
            '<div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Mistake Bank</div>' +
            '<div style="font-size:1.4rem; font-weight:800; color:var(--status-warning); margin-top:0.2rem;">' + state.mistakes.length + '</div>' +
          '</div>' +
        '</div>' +

        '<div style="margin-bottom:1.5rem;">' +
          '<div class="ev-section-header">' +
            '<h3 class="ev-section-title">Metallic Achievement Badges (' + state.unlockedBadges.length + '/' + window.EXAMVERSE_DATA.achievements.length + ' Unlocked)</h3>' +
            '<span style="font-size:0.8rem; color:var(--text-muted);">Earned automatically from real milestones</span>' +
          '</div>' +
          '<div class="ev-grid-2">' +
            badgesHtml +
          '</div>' +
        '</div>'
      );
    },

    /* ======================================================================
       VIEW 9: BOOKMARKS PAGE
       ====================================================================== */
    renderBookmarksView: function () {
      var bmIds = window.ExamVerseStorage.state.bookmarks;
      var bookmarkedQuestions = window.EXAMVERSE_DATA.questions.filter(function (q) {
        return bmIds.indexOf(q.id) !== -1;
      });
      var self = this;
      var optionLetters = ['A', 'B', 'C', 'D'];

      var listHtml = bookmarkedQuestions.length === 0
        ? '<div class="ev-card" style="text-align:center; padding:2.5rem;">' +
            '<h3 style="font-size:1.05rem; font-weight:700; margin-bottom:0.35rem;">No Bookmarked Questions Yet</h3>' +
            '<p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Click the Bookmark button during any quiz to save important formulas and concepts here.</p>' +
            '<button type="button" class="ev-btn ev-btn-primary ev-btn-sm" onclick="window.evNavigate(\'quiz\')">Start Practicing</button>' +
          '</div>'
        : bookmarkedQuestions.map(function (q) {
            return (
              '<div class="ev-card" style="margin-bottom:0.9rem;">' +
                '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; margin-bottom:0.5rem;">' +
                  '<span class="ev-badge-pill ev-badge-indigo">' + escapeHtml(q.examTag) + ' • ' + escapeHtml(q.difficulty) + '</span>' +
                  '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" onclick="window.evToggleBookmark(\'' + q.id + '\')">Remove Bookmark</button>' +
                '</div>' +
                '<div style="font-size:1rem; font-weight:700; margin-bottom:0.65rem;">' + self.formatQuestionDisplay(q) + '</div>' +
                '<div style="font-size:0.86rem; color:var(--status-success); font-weight:700; margin-bottom:0.4rem;">' +
                  'Correct Answer (' + optionLetters[q.correctIndex] + '): ' + escapeHtml(q.options[q.correctIndex]) +
                '</div>' +
                '<div class="ev-explanation-box" style="margin-top:0.5rem;">' +
                  '<strong>Explanation:</strong> ' + escapeHtml(q.explanation) +
                '</div>' +
              '</div>'
            );
          }).join('');

      return (
        '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem;">' +
          '<div>' +
            '<h1 style="font-size:1.35rem; font-weight:800;">Saved Bookmarks (' + bookmarkedQuestions.length + ')</h1>' +
            '<p style="font-size:0.86rem; color:var(--text-secondary);">Quick-reference vault for high-yield questions and explanations.</p>' +
          '</div>' +
          (bookmarkedQuestions.length > 0
            ? '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evPracticeBookmarks()">Practice Bookmarked Questions</button>'
            : '') +
        '</div>' +
        listHtml
      );
    },

    /* ======================================================================
       VIEW 10: MISTAKE BANK PAGE
       ====================================================================== */
    renderMistakesView: function () {
      var state = window.ExamVerseStorage.state;
      var mistakes = state.mistakes;
      var resolvedCount = state.stats.totalMistakesResolved || 0;
      var self = this;
      var optionLetters = ['A', 'B', 'C', 'D'];

      var itemsHtml = mistakes.length === 0
        ? '<div class="ev-card" style="text-align:center; padding:2.5rem;">' +
            '<h3 style="font-size:1.05rem; font-weight:700; margin-bottom:0.35rem;">Your Mistake Bank is Clear! (' + resolvedCount + ' Resolved)</h3>' +
            '<p style="font-size:0.85rem; color:var(--text-muted);">Any question you answer incorrectly during Practice or Exam Mode is automatically captured here for targeted revision.</p>' +
          '</div>'
        : mistakes.map(function (m) {
            var q = window.EXAMVERSE_DATA.questions.find(function (item) { return item.id === m.questionId; });
            if (!q) return '';
            return (
              '<div class="ev-card" style="margin-bottom:0.9rem; border-left:4px solid var(--status-danger);">' +
                '<div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; margin-bottom:0.5rem; flex-wrap:wrap;">' +
                  '<span class="ev-badge-pill ev-badge-danger">Logged ' + escapeHtml(m.timestamp) + ' • Missed ' + (m.retryCount || 1) + 'x • ' + escapeHtml(q.examTag) + '</span>' +
                  '<button type="button" class="ev-btn ev-btn-soft ev-btn-sm" onclick="window.evResolveMistake(\'' + q.id + '\')">Mark as Mastered ✓</button>' +
                '</div>' +
                '<div style="font-size:1rem; font-weight:700; margin-bottom:0.65rem;">' + self.formatQuestionDisplay(q) + '</div>' +
                '<div style="display:flex; gap:1rem; flex-wrap:wrap; font-size:0.84rem; margin-bottom:0.5rem;">' +
                  '<span style="color:var(--status-danger); font-weight:600;">Your Choice: ' + escapeHtml(q.options[m.selectedIndex] || 'Skipped') + '</span>' +
                  '<span style="color:var(--status-success); font-weight:700;">Correct Answer (' + optionLetters[q.correctIndex] + '): ' + escapeHtml(q.options[q.correctIndex]) + '</span>' +
                '</div>' +
                '<div class="ev-explanation-box" style="margin-top:0.5rem;">' +
                  '<strong>Diagnostic Explanation:</strong> ' + escapeHtml(q.explanation) +
                '</div>' +
              '</div>'
            );
          }).join('');

      return (
        '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem;">' +
          '<div>' +
            '<h1 style="font-size:1.35rem; font-weight:800;">Mistake Bank &amp; Diagnostic Revision (' + mistakes.length + ' Active, ' + resolvedCount + ' Mastered)</h1>' +
            '<p style="font-size:0.86rem; color:var(--text-secondary);">Master at least 3 mistakes and clear your bank to unlock the "Zero Deficit" badge.</p>' +
          '</div>' +
          (mistakes.length > 0
            ? '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evPracticeMistakes()">Start Mistake Recovery Quiz</button>'
            : '') +
        '</div>' +
        itemsHtml
      );
    },

    /* ======================================================================
       VIEW 11: QUIZ HISTORY PAGE (With Exact Historical Snapshot Review & Retry)
       ====================================================================== */
    renderHistoryView: function () {
      var history = window.ExamVerseStorage.state.quizHistory;
      var rowsHtml = history.length === 0
        ? '<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No quiz sessions recorded yet.</td></tr>'
        : history.map(function (h) {
            var pct = typeof h.scorePct === 'number' ? h.scorePct : h.accuracy;
            var badgeCls = pct >= 80 ? 'ev-badge-success' : (pct >= 50 ? 'ev-badge-warning' : 'ev-badge-danger');
            return (
              '<tr>' +
                '<td style="font-weight:700;">' + escapeHtml(h.title) + '<div style="font-size:0.74rem; color:var(--text-muted);">' + escapeHtml(h.date) + '</div></td>' +
                '<td><span class="ev-badge-pill ev-badge-neutral">' + escapeHtml(h.category) + '</span></td>' +
                '<td>' + (h.mode === 'exam' ? 'Exam Mode' : 'Practice') + '</td>' +
                '<td><span class="ev-badge-pill ' + badgeCls + '">' + h.score + '/' + h.total + ' (' + pct + '%)</span></td>' +
                '<td>' + (h.attempted || 0) + ' / ' + h.total + '</td>' +
                '<td class="font-mono">' + window.ExamVerseQuiz.formatTime(h.timeTakenSec) + '</td>' +
                '<td>' +
                  '<div style="display:flex; gap:0.4rem; flex-wrap:wrap;">' +
                    '<button type="button" class="ev-btn ev-btn-soft ev-btn-sm" onclick="window.evReviewHistoryItem(\'' + h.id + '\')">Review Answers</button>' +
                    '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" onclick="window.evRetryHistoryItem(\'' + h.id + '\')">Retry Exact Set</button>' +
                  '</div>' +
                '</td>' +
              '</tr>'
            );
          }).join('');

      return (
        '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:1.25rem;">' +
          '<div>' +
            '<h1 style="font-size:1.35rem; font-weight:800;">Complete Quiz History</h1>' +
            '<p style="font-size:0.86rem; color:var(--text-secondary);">Every completed session preserves its exact question and answer snapshot for historical review and retry.</p>' +
          '</div>' +
          '<button type="button" class="ev-btn ev-btn-primary ev-btn-sm" onclick="window.evNavigate(\'exams\')">New Examination</button>' +
        '</div>' +
        '<div class="ev-card" style="padding:0;">' +
          '<div class="ev-table-wrap">' +
            '<table class="ev-table">' +
              '<thead>' +
                '<tr>' +
                  '<th>Session Title</th>' +
                  '<th>Category</th>' +
                  '<th>Mode</th>' +
                  '<th>Score</th>' +
                  '<th>Attempted</th>' +
                  '<th>Duration</th>' +
                  '<th>Actions</th>' +
                '</tr>' +
              '</thead>' +
              '<tbody>' + rowsHtml + '</tbody>' +
            '</table>' +
          '</div>' +
        '</div>'
      );
    },

    /* ======================================================================
       VIEW 12: DAILY CHALLENGE PAGE
       ====================================================================== */
    renderDailyChallengeView: function () {
      var daily = window.ExamVerseStorage.state.dailyChallenge;
      var user = window.ExamVerseStorage.state.user;
      var pct = Math.min(100, Math.round((daily.completedQuestions / daily.totalQuestions) * 100));

      return (
        '<div class="ev-card ev-daily-card" style="padding:1.75rem; margin-bottom:1.25rem;">' +
          '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">' +
            '<div style="max-width:640px;">' +
              '<div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">' +
                '<span class="ev-badge-pill ev-badge-warning">Daily Merit Sprint • ' + escapeHtml(daily.date) + '</span>' +
                '<span class="ev-badge-pill ev-badge-indigo">' + (daily.isCompleted ? 'Daily Bonus Claimed ✓' : ('+' + daily.rewardXp + ' XP Bonus')) + '</span>' +
              '</div>' +
              '<h1 style="font-size:1.45rem; font-weight:800; margin-bottom:0.35rem;">Today’s Interdisciplinary Merit Challenge</h1>' +
              '<p style="font-size:0.88rem; color:var(--text-secondary); margin-bottom:1rem;">' +
                'Answer all 8 curated questions across Physics, Chemistry, Higher Math, Biology, English, Bangla, GK, and ICT. The +' + daily.rewardXp + ' XP Daily Bonus can be claimed once per calendar day (Asia/Dhaka time).' +
              '</p>' +
              '<div style="max-width:420px; margin-bottom:1.1rem;">' +
                '<div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; margin-bottom:0.35rem;">' +
                  '<span>Completion Status</span>' +
                  '<span>' + daily.completedQuestions + ' / ' + daily.totalQuestions + ' (' + pct + '%)</span>' +
                '</div>' +
                '<div class="ev-progress-track">' +
                  '<div class="ev-progress-fill is-accent" style="width:' + pct + '%;"></div>' +
                '</div>' +
              '</div>' +
              '<div style="display:flex; gap:0.65rem; flex-wrap:wrap;">' +
                '<button type="button" class="ev-btn ev-btn-primary" onclick="window.evStartDailyChallenge()">Start Daily Challenge (Exam Mode)</button>' +
                '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evStartPackQuiz(\'pack-daily\', \'practice\')">Practice Mode</button>' +
              '</div>' +
            '</div>' +

            '<div class="ev-card" style="min-width:230px; text-align:center;">' +
              '<div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); margin-bottom:0.35rem;">Active Study Streak</div>' +
              '<div style="font-size:2rem; font-weight:800; color:var(--status-warning);">' + user.streakDays + ' Days</div>' +
              '<div style="font-size:0.78rem; color:var(--text-secondary); margin-top:0.25rem;">' +
                (user.streakActive && user.streakDays > 0 ? 'Streak active for ' + escapeHtml(user.lastStudyDate || 'today') : 'Complete a quiz today to start your streak') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    },

    /* ======================================================================
       VIEW 13: SETTINGS, ABOUT & PRIVACY POLICY
       ====================================================================== */
    renderSettingsView: function () {
      var state = window.ExamVerseStorage.state;
      var cfg = state.settings;
      var isDark = state.theme === 'dark';

      return (
        '<div style="margin-bottom:1.25rem;">' +
          '<h1 style="font-size:1.35rem; font-weight:800;">Platform Settings &amp; Preferences</h1>' +
          '<p style="font-size:0.86rem; color:var(--text-secondary);">Customize your visual theme, examination timer, negative marking, bilingual display, and local data storage.</p>' +
        '</div>' +

        '<div class="ev-grid-2">' +
          '<div class="ev-card" style="display:flex; flex-direction:column; gap:1.1rem;">' +
            '<h3 style="font-size:1rem; font-weight:700; border-bottom:1px solid var(--border-subtle); padding-bottom:0.55rem;">Appearance &amp; Study Experience</h3>' +

            '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">' +
              '<div>' +
                '<div style="font-size:0.9rem; font-weight:700;">Dark Mode Theme</div>' +
                '<div style="font-size:0.78rem; color:var(--text-muted);">Light Mode is the default. Switch between Light and Dark themes instantly.</div>' +
              '</div>' +
              '<label class="ev-switch" aria-label="Toggle Dark Mode">' +
                '<input type="checkbox" ' + (isDark ? 'checked' : '') + ' onchange="window.evToggleTheme()" />' +
                '<span class="ev-switch-slider"></span>' +
              '</label>' +
            '</div>' +

            '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">' +
              '<div>' +
                '<div style="font-size:0.9rem; font-weight:700;">Question Language Display</div>' +
                '<div style="font-size:0.78rem; color:var(--text-muted);">Show English + বাংলা together or single language.</div>' +
              '</div>' +
              '<select class="ev-select" aria-label="Question Language Display" style="width:auto; min-width:165px;" onchange="window.evUpdateSetting(\'language\', this.value)">' +
                '<option value="bilingual" ' + (cfg.language === 'bilingual' ? 'selected' : '') + '>Bilingual (EN + বাংলা)</option>' +
                '<option value="en" ' + (cfg.language === 'en' ? 'selected' : '') + '>English Only</option>' +
                '<option value="bn" ' + (cfg.language === 'bn' ? 'selected' : '') + '>বাংলা (Bangla)</option>' +
              '</select>' +
            '</div>' +

            '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">' +
              '<div>' +
                '<div style="font-size:0.9rem; font-weight:700;">Sound Effects</div>' +
                '<div style="font-size:0.78rem; color:var(--text-muted);">Subtle Web Audio feedback when answering or completing quizzes.</div>' +
              '</div>' +
              '<label class="ev-switch" aria-label="Toggle Sound">' +
                '<input type="checkbox" ' + (cfg.soundEnabled ? 'checked' : '') + ' onchange="window.evUpdateSetting(\'soundEnabled\', this.checked)" />' +
                '<span class="ev-switch-slider"></span>' +
              '</label>' +
            '</div>' +

            '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">' +
              '<div>' +
                '<div style="font-size:0.9rem; font-weight:700;">Vibration Feedback</div>' +
                '<div style="font-size:0.78rem; color:var(--text-muted);">Triggers navigator.vibrate() haptic feedback on supported mobile devices.</div>' +
              '</div>' +
              '<label class="ev-switch" aria-label="Toggle Vibration">' +
                '<input type="checkbox" ' + (cfg.vibrationEnabled ? 'checked' : '') + ' onchange="window.evUpdateSetting(\'vibrationEnabled\', this.checked)" />' +
                '<span class="ev-switch-slider"></span>' +
              '</label>' +
            '</div>' +
          '</div>' +

          '<div class="ev-card" style="display:flex; flex-direction:column; gap:1.1rem;">' +
            '<h3 style="font-size:1rem; font-weight:700; border-bottom:1px solid var(--border-subtle); padding-bottom:0.55rem;">Examination Rules, Demo Data &amp; Reset</h3>' +

            '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">' +
              '<div>' +
                '<div style="font-size:0.9rem; font-weight:700;">Examination Countdown Timer</div>' +
                '<div style="font-size:0.78rem; color:var(--text-muted);">Deadline-timestamp timer that auto-submits when time reaches 00:00.</div>' +
              '</div>' +
              '<label class="ev-switch" aria-label="Toggle Timer">' +
                '<input type="checkbox" ' + (cfg.timerEnabled ? 'checked' : '') + ' onchange="window.evUpdateSetting(\'timerEnabled\', this.checked)" />' +
                '<span class="ev-switch-slider"></span>' +
              '</label>' +
            '</div>' +

            '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">' +
              '<div>' +
                '<div style="font-size:0.9rem; font-weight:700;">Negative Marking in Exam Mode</div>' +
                '<div style="font-size:0.78rem; color:var(--text-muted);">Deducts track-specific marks (-0.25 or -0.50) per wrong answer in Exam Mode.</div>' +
              '</div>' +
              '<label class="ev-switch" aria-label="Toggle Negative Marking">' +
                '<input type="checkbox" ' + (cfg.negativeMarkingEnabled ? 'checked' : '') + ' onchange="window.evUpdateSetting(\'negativeMarkingEnabled\', this.checked)" />' +
                '<span class="ev-switch-slider"></span>' +
              '</label>' +
            '</div>' +

            '<div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">' +
              '<div>' +
                '<div style="font-size:0.9rem; font-weight:700;">Notifications</div>' +
                '<div style="font-size:0.78rem; color:var(--text-muted);">Enable in-app achievement &amp; study notifications.</div>' +
              '</div>' +
              '<label class="ev-switch" aria-label="Toggle Notifications">' +
                '<input type="checkbox" ' + (cfg.notificationsEnabled ? 'checked' : '') + ' onchange="window.evUpdateSetting(\'notificationsEnabled\', this.checked)" />' +
                '<span class="ev-switch-slider"></span>' +
              '</label>' +
            '</div>' +

            '<div style="padding-top:0.5rem; border-top:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between; gap:0.75rem; flex-wrap:wrap;">' +
              '<div style="display:flex; gap:0.5rem; flex-wrap:wrap;">' +
                '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" onclick="window.evNavigate(\'about\')">About</button>' +
                '<button type="button" class="ev-btn ev-btn-secondary ev-btn-sm" onclick="window.evNavigate(\'privacy\')">Privacy Policy</button>' +
                '<button type="button" class="ev-btn ev-btn-soft ev-btn-sm" onclick="window.evLoadDemoProfile()">Load Sample Demo Data</button>' +
              '</div>' +
              '<button type="button" class="ev-btn ev-btn-danger ev-btn-sm" onclick="window.evOpenResetModal()">Reset All Progress</button>' +
            '</div>' +
          '</div>' +
        '</div>'
      );
    },

    renderAboutView: function () {
      return (
        '<div class="ev-card" style="max-width:820px; margin:0 auto; padding:1.75rem;">' +
          '<span class="ev-badge-pill ev-badge-indigo" style="margin-bottom:0.5rem;">About ExamVerse Platform</span>' +
          '<h1 style="font-size:1.45rem; font-weight:800; margin-bottom:0.65rem;">Precision Digital Examination &amp; MCQ Mastery</h1>' +
          '<p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1rem;">' +
            'ExamVerse is an educational examination and deliberate-practice platform designed for students preparing for SSC, HSC, University Admission (DU, BUET, Medical, GST), BCS Preliminary, and Bank/Government career examinations.' +
          '</p>' +
          '<div class="ev-grid-2" style="margin-bottom:1.25rem;">' +
            '<div style="padding:1rem; border-radius:var(--radius-sm); background-color:var(--bg-surface-muted);">' +
              '<h3 style="font-size:0.95rem; font-weight:700; margin-bottom:0.3rem;">Verified Examination Engine</h3>' +
              '<p style="font-size:0.82rem; color:var(--text-secondary);">Features deadline-timestamp timers, configurable negative marking (-0.25 / -0.50), randomized question and option ordering, and automatic Mistake Bank logging.</p>' +
            '</div>' +
            '<div style="padding:1rem; border-radius:var(--radius-sm); background-color:var(--bg-surface-muted);">' +
              '<h3 style="font-size:0.95rem; font-weight:700; margin-bottom:0.3rem;">Current Storage Architecture</h3>' +
              '<p style="font-size:0.82rem; color:var(--text-secondary);">Operates in Local-First mode using browser LocalStorage, with a modular PostgreSQL schema (supabase/schema.sql) ready for cloud deployment.</p>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evNavigate(\'settings\')">← Back to Settings</button>' +
        '</div>'
      );
    },

    renderPrivacyView: function () {
      return (
        '<div class="ev-card" style="max-width:820px; margin:0 auto; padding:1.75rem;">' +
          '<span class="ev-badge-pill ev-badge-neutral" style="margin-bottom:0.5rem;">Student Privacy &amp; Data Protection</span>' +
          '<h1 style="font-size:1.45rem; font-weight:800; margin-bottom:0.65rem;">Privacy Policy</h1>' +
          '<p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0.85rem;">' +
            '1. <strong>Data Controller &amp; Local Storage:</strong> ExamVerse stores your profile name, XP, streak, bookmarks, mistake bank, and quiz history locally inside your browser’s <code>localStorage</code> (`examverse_state_v2`). No personal data is transmitted to external servers in local mode.' +
          '</p>' +
          '<p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0.85rem;">' +
            '2. <strong>Third-Party Font Delivery:</strong> This web application loads typography (`Plus Jakarta Sans`, `Hind Siliguri`, and `JetBrains Mono`) from Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`), with automatic fallback to system fonts when offline.' +
          '</p>' +
          '<p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:1.25rem;">' +
            '3. <strong>Data Retention &amp; Complete Deletion:</strong> Clicking "Reset All Progress" in Settings permanently clears all local quiz records, XP, streaks, mastery scores, bookmarks, mistakes, and active sessions while retaining only your visual theme and preference toggles.' +
          '</p>' +
          '<button type="button" class="ev-btn ev-btn-secondary" onclick="window.evNavigate(\'settings\')">← Back to Settings</button>' +
        '</div>'
      );
    },

    /* Fixed Keyboard Shortcut Precedence & Escape Key Handling (Audit Section 6 & 7.5) */
    bindGlobalKeyboardShortcuts: function () {
      var self = this;
      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          window.evCloseNotifModal();
          window.evCloseResetModal();
          window.evCloseSubmitConfirmModal();
          window.evCloseLeaveExamModal();
          window.evCloseModeSwitchModal();
          window.evCloseProfileEditModal();
          return;
        }

        /* Never intercept modified browser shortcuts (Ctrl, Alt, Meta) */
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        if (self.currentView !== 'quiz') return;

        var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button') return;

        if (e.key === '1' || e.key === 'a' || e.key === 'A') window.evSelectQuizOption(0);
        else if (e.key === '2') window.evSelectQuizOption(1);
        else if (e.key === '3') window.evSelectQuizOption(2);
        else if (e.key === '4') window.evSelectQuizOption(3);
        else if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') window.evNextQuestion();
        else if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowLeft') window.evPrevQuestion();
        else if (e.key === 'b' || e.key === 'B') {
          var s = window.ExamVerseQuiz.session;
          if (s && s.questions && s.questions[s.currentIndex]) {
            window.evToggleBookmark(s.questions[s.currentIndex].id);
          }
        }
      });
    }
  };

  /* ========================================================================
     GLOBAL ACTION HANDLERS
     ======================================================================== */
  window.ExamVerseApp = App;

  window.evNavigate = function (viewName, bypassGuard) {
    App.playSound('click');
    App.navigate(viewName, bypassGuard);
  };

  window.evToggleTheme = function () {
    var next = window.ExamVerseStorage.toggleTheme();
    App.syncHeaderAndThemeUI();
    App.renderCurrentView();
    App.showToast('Switched to ' + (next === 'dark' ? 'Dark Mode' : 'Light Mode'));
  };

  window.evSelectExamCategory = function (catId) {
    App.selectedExamCategory = catId;
    App.examSubjectFilter = 'all';
    App.renderCurrentView();
  };

  /* Audit 7.6 Fix: Update only the chapters container so typing never loses input focus/cursor */
  window.evUpdateExamSearch = function (val) {
    App.examSearchQuery = val;
    var chaptersContainer = document.getElementById('ev-exams-chapters-container');
    if (chaptersContainer) {
      chaptersContainer.innerHTML = App.buildExamsFilteredChaptersHtml();
    } else {
      App.renderCurrentView();
    }
  };

  window.evUpdateExamSubject = function (val) {
    App.examSubjectFilter = val;
    App.renderCurrentView();
  };

  window.evUpdateExamDifficulty = function (val) {
    App.examDifficultyFilter = val;
    App.renderCurrentView();
  };

  window.evResetExamFilters = function () {
    App.examSearchQuery = '';
    App.examSubjectFilter = 'all';
    App.examDifficultyFilter = 'all';
    App.renderCurrentView();
  };

  window.evStartDailyChallenge = function () {
    var pack = window.EXAMVERSE_DATA.recommendedQuizzes[0];
    window.ExamVerseQuiz.startSession({
      title: pack.title,
      categoryLabel: 'Daily Merit Challenge',
      categoryId: 'uni',
      subjectId: 'all',
      questionIds: pack.questionIds,
      mode: 'exam',
      negativeMark: pack.negativeMark,
      durationSec: pack.durationSec,
      xpReward: pack.xpReward,
      isDailyChallenge: true
    });
    App.navigate('quiz', true);
    App.showToast('Daily Challenge started in Exam Mode');
  };

  window.evStartPackQuiz = function (packId, mode) {
    var pack = window.EXAMVERSE_DATA.recommendedQuizzes.find(function (p) { return p.id === packId; }) || window.EXAMVERSE_DATA.recommendedQuizzes[0];
    window.ExamVerseQuiz.startSession({
      title: pack.title,
      categoryLabel: pack.badgeText,
      categoryId: pack.category || 'uni',
      subjectId: pack.subjectId,
      questionIds: pack.questionIds,
      mode: mode,
      negativeMark: pack.negativeMark,
      durationSec: pack.durationSec,
      xpReward: pack.xpReward,
      isDailyChallenge: packId === 'pack-daily'
    });
    App.navigate('quiz', true);
  };

  window.evStartSubjectQuiz = function (subjectId, mode) {
    var subj = window.EXAMVERSE_DATA.subjects.find(function (s) { return s.id === subjectId; });
    window.ExamVerseQuiz.startSession({
      title: (subj ? subj.name : 'Subject') + ' Mastery Set',
      categoryLabel: subj ? subj.nameBn : 'Academic Track',
      categoryId: App.selectedExamCategory || 'uni',
      subjectId: subjectId,
      mode: mode
    });
    App.navigate('quiz', true);
  };

  window.evStartChapterQuiz = function (subjectId, chapterId, mode) {
    var subj = window.EXAMVERSE_DATA.subjects.find(function (s) { return s.id === subjectId; });
    var ch = subj ? subj.chapters.find(function (c) { return c.id === chapterId; }) : null;
    window.ExamVerseQuiz.startSession({
      title: ch ? ch.title : 'Chapter Practice',
      categoryLabel: subj ? subj.name : 'Exam Track',
      categoryId: App.selectedExamCategory || 'uni',
      subjectId: subjectId,
      chapterId: chapterId,
      mode: mode
    });
    App.navigate('quiz', true);
  };

  window.evStartCategoryQuiz = function (catId, mode) {
    var cat = window.EXAMVERSE_DATA.examCategories.find(function (c) { return c.id === catId; });
    window.ExamVerseQuiz.startSession({
      title: (cat ? cat.name : 'Category') + ' Comprehensive Test',
      categoryLabel: cat ? cat.fullTitle : 'National Track',
      categoryId: catId,
      negativeMark: cat ? cat.defaultNegativeMark : 0.25,
      mode: mode
    });
    App.navigate('quiz', true);
  };

  window.evSelectQuizOption = function (idx) {
    window.ExamVerseQuiz.selectOption(idx);
  };

  window.evNextQuestion = function () {
    window.ExamVerseQuiz.nextQuestion();
  };

  window.evPrevQuestion = function () {
    window.ExamVerseQuiz.prevQuestion();
  };

  window.evJumpToQuestion = function (idx) {
    window.ExamVerseQuiz.goToQuestion(idx);
  };

  /* Audit 4.3 Fix: Safe Mode Switch with Confirmation & Clean Session Restart */
  window.evRequestSwitchQuizMode = function (newMode) {
    if (!window.ExamVerseQuiz.session) return;
    App.pendingModeSwitchTarget = newMode === 'exam' ? 'exam' : 'practice';
    var modal = document.getElementById('ev-mode-switch-modal');
    if (modal) {
      modal.classList.add('is-open');
    }
  };

  window.evConfirmSwitchQuizMode = function () {
    var targetMode = App.pendingModeSwitchTarget || 'practice';
    window.evCloseModeSwitchModal();
    var s = window.ExamVerseQuiz.session;
    if (!s) return;
    var qIds = (s.questions || []).map(function (q) { return q.id; });
    window.ExamVerseQuiz.startSession({
      title: s.title,
      categoryLabel: s.categoryLabel,
      categoryId: s.categoryId,
      subjectId: s.primarySubjectId,
      chapterId: s.chapterId,
      questionIds: qIds,
      mode: targetMode,
      isDailyChallenge: s.isDailyChallenge
    });
    App.renderCurrentView();
    App.showToast('Session restarted cleanly in ' + (targetMode === 'exam' ? 'Exam Mode' : 'Practice Mode'));
  };

  window.evCloseModeSwitchModal = function () {
    var modal = document.getElementById('ev-mode-switch-modal');
    if (modal) modal.classList.remove('is-open');
  };

  /* Audit 4.7 Fix: Unanswered Questions Confirmation Modal Before Submit */
  window.evRequestSubmitQuiz = function () {
    var unanswered = window.ExamVerseQuiz.getUnansweredCount();
    if (unanswered > 0) {
      var msgEl = document.getElementById('ev-submit-confirm-msg');
      if (msgEl) {
        msgEl.textContent = 'You have ' + unanswered + ' unanswered question' + (unanswered > 1 ? 's' : '') + '. Unanswered questions will be marked as Skipped (0 marks). Submit your quiz anyway?';
      }
      var modal = document.getElementById('ev-submit-confirm-modal');
      if (modal) {
        modal.classList.add('is-open');
        return;
      }
    }
    window.ExamVerseQuiz.submitQuiz();
  };

  window.evConfirmSubmitQuiz = function () {
    window.evCloseSubmitConfirmModal();
    window.ExamVerseQuiz.submitQuiz();
  };

  window.evCloseSubmitConfirmModal = function () {
    var modal = document.getElementById('ev-submit-confirm-modal');
    if (modal) modal.classList.remove('is-open');
  };

  /* Leave Active Exam Confirmation Handlers */
  window.evConfirmLeaveExam = function () {
    var target = App.pendingNavigationTarget || 'home';
    window.evCloseLeaveExamModal();
    App.navigate(target, true);
  };

  window.evCloseLeaveExamModal = function () {
    var modal = document.getElementById('ev-leave-exam-modal');
    if (modal) modal.classList.remove('is-open');
    App.pendingNavigationTarget = null;
  };

  window.evRetryLastQuiz = function () {
    var last = window.ExamVerseQuiz.lastResult;
    if (!last) {
      App.navigate('quiz', true);
      return;
    }
    window.ExamVerseQuiz.startSession({
      title: last.title,
      categoryLabel: last.categoryLabel,
      categoryId: last.categoryId,
      subjectId: last.primarySubjectId,
      questionsSnapshot: last.questions,
      preserveOrder: true,
      mode: last.mode
    });
    App.navigate('quiz', true);
  };

  /* Audit 4.8 Fix: Review & Retry Exact Historical Attempt Snapshot */
  window.evReviewHistoryItem = function (historyId) {
    var h = window.ExamVerseStorage.state.quizHistory.find(function (item) { return item.id === historyId; });
    if (!h) return;
    window.ExamVerseQuiz.lastResult = {
      sessionId: h.id,
      title: h.title,
      categoryLabel: h.category,
      categoryId: h.categoryId || 'uni',
      primarySubjectId: h.subjectId,
      mode: h.mode,
      negativeMark: h.negativeMark || 0,
      penalty: Number((((h.incorrect || 0) * (h.negativeMark || 0))).toFixed(2)),
      netScore: typeof h.netScore === 'number' ? h.netScore : h.score,
      total: h.total,
      attempted: typeof h.attempted === 'number' ? h.attempted : h.score,
      correct: h.score,
      incorrect: h.incorrect || 0,
      skipped: h.skipped || 0,
      accuracy: h.accuracy,
      scorePct: typeof h.scorePct === 'number' ? h.scorePct : h.accuracy,
      timeTakenSec: h.timeTakenSec,
      answerXp: h.xpEarned,
      accuracyBonusXp: 0,
      dailyBonusXp: 0,
      xpEarned: h.xpEarned,
      subjectBreakdown: h.subjectBreakdown || {},
      questions: (h.questionsSnapshot && h.questionsSnapshot.length > 0)
        ? h.questionsSnapshot
        : window.EXAMVERSE_DATA.questions.filter(function (q) { return (h.questionIds || []).indexOf(q.id) !== -1; }),
      answers: h.answersSnapshot || {}
    };
    App.navigate('review', true);
  };

  window.evRetryHistoryItem = function (historyId) {
    var h = window.ExamVerseStorage.state.quizHistory.find(function (item) { return item.id === historyId; });
    if (!h) return;
    window.ExamVerseQuiz.startSession({
      title: h.title,
      categoryLabel: h.category,
      categoryId: h.categoryId || 'uni',
      subjectId: h.subjectId,
      questionsSnapshot: h.questionsSnapshot,
      questionIds: h.questionIds,
      preserveOrder: true,
      mode: h.mode
    });
    App.navigate('quiz', true);
    App.showToast('Loaded exact historical question set');
  };

  window.evSetReviewFilter = function (filter) {
    window.ExamVerseQuiz.reviewFilter = filter;
    App.renderCurrentView();
  };

  window.evToggleBookmark = function (questionId) {
    var added = window.ExamVerseStorage.toggleBookmark(questionId);
    App.syncHeaderAndThemeUI();
    App.renderCurrentView();
    App.showToast(added ? 'Saved to Bookmarks' : 'Removed from Bookmarks');
  };

  window.evPracticeBookmarks = function () {
    var bmIds = window.ExamVerseStorage.state.bookmarks;
    if (!bmIds || bmIds.length === 0) return;
    window.ExamVerseQuiz.startSession({
      title: 'Bookmarked Questions Review',
      categoryLabel: 'Saved Vault',
      questionIds: bmIds,
      mode: 'practice'
    });
    App.navigate('quiz', true);
  };

  window.evResolveMistake = function (questionId) {
    window.ExamVerseStorage.removeMistake(questionId);
    App.syncHeaderAndThemeUI();
    App.renderCurrentView();
    App.showToast('Question marked as mastered!');
  };

  window.evPracticeMistakes = function () {
    var mistakeIds = window.ExamVerseStorage.state.mistakes.map(function (m) { return m.questionId; });
    if (mistakeIds.length === 0) return;
    window.ExamVerseQuiz.startSession({
      title: 'Mistake Bank Recovery Session',
      categoryLabel: 'Diagnostic Revision',
      questionIds: mistakeIds,
      mode: 'practice'
    });
    App.navigate('quiz', true);
  };

  window.evSetLeaderboardScope = function (scope) {
    App.leaderboardScope = scope;
    App.renderCurrentView();
  };

  window.evSetLeaderboardPeriod = function (period) {
    App.leaderboardPeriod = period;
    App.renderCurrentView();
  };

  window.evUpdateSetting = function (key, value) {
    window.ExamVerseStorage.state.settings[key] = value;
    window.ExamVerseStorage.save();
    App.syncHeaderAndThemeUI();
    App.renderCurrentView();
    App.showToast('Preference saved');
  };

  /* Notifications Modal with Mark All Read & Clear All (Audit Section 6) */
  window.evOpenNotifModal = function () {
    if (!window.ExamVerseStorage.state.settings.notificationsEnabled) {
      App.showToast('Notifications are disabled in Settings');
      return;
    }
    var modal = document.getElementById('ev-notif-modal');
    var listEl = document.getElementById('ev-notif-list');
    if (!modal || !listEl) return;

    window.ExamVerseStorage.markAllNotificationsRead();
    App.syncHeaderAndThemeUI();

    var notifs = window.ExamVerseStorage.state.notifications || [];
    if (notifs.length === 0) {
      listEl.innerHTML = '<div style="text-align:center; padding:1.5rem; color:var(--text-muted);">No notifications.</div>';
    } else {
      listEl.innerHTML = notifs.map(function (n) {
        return (
          '<div style="padding:0.85rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle); background-color:var(--bg-surface-hover);">' +
            '<div style="display:flex; justify-content:space-between; font-size:0.86rem; font-weight:700; margin-bottom:0.2rem;">' +
              '<span>' + escapeHtml(n.title) + '</span>' +
              '<span style="font-size:0.74rem; color:var(--text-muted);">' + escapeHtml(n.time) + '</span>' +
            '</div>' +
            '<div style="font-size:0.8rem; color:var(--text-secondary);">' + escapeHtml(n.body) + '</div>' +
          '</div>'
        );
      }).join('');
    }
    modal.classList.add('is-open');
  };

  window.evClearNotifications = function () {
    window.ExamVerseStorage.clearNotifications();
    window.evOpenNotifModal();
    App.syncHeaderAndThemeUI();
  };

  window.evCloseNotifModal = function () {
    var modal = document.getElementById('ev-notif-modal');
    if (modal) modal.classList.remove('is-open');
  };

  /* Profile Edit Modal Handlers (Audit Section 6) */
  window.evOpenProfileEditModal = function () {
    var u = window.ExamVerseStorage.state.user;
    var nameInput = document.getElementById('ev-profile-name-input');
    var handleInput = document.getElementById('ev-profile-handle-input');
    var trackSelect = document.getElementById('ev-profile-track-select');
    if (nameInput) nameInput.value = u.name || '';
    if (handleInput) handleInput.value = u.username || '';
    if (trackSelect) trackSelect.value = u.targetTrack || 'University & Engineering Admission';
    var modal = document.getElementById('ev-profile-edit-modal');
    if (modal) modal.classList.add('is-open');
  };

  window.evSaveProfileEdit = function () {
    var nameInput = document.getElementById('ev-profile-name-input');
    var handleInput = document.getElementById('ev-profile-handle-input');
    var trackSelect = document.getElementById('ev-profile-track-select');
    var newName = (nameInput ? nameInput.value.trim() : '') || 'Student Scholar';
    var newHandle = (handleInput ? handleInput.value.trim() : '') || '@student_ev';
    if (newHandle.charAt(0) !== '@') newHandle = '@' + newHandle;
    var parts = newName.split(/\s+/);
    var initials = (parts[0] ? parts[0].charAt(0) : 'S') + (parts[1] ? parts[1].charAt(0) : (parts[0].charAt(1) || 'S'));

    var u = window.ExamVerseStorage.state.user;
    u.name = newName;
    u.username = newHandle;
    u.avatarInitials = initials.toUpperCase();
    if (trackSelect) u.targetTrack = trackSelect.value;

    window.ExamVerseStorage.save();
    window.evCloseProfileEditModal();
    App.syncHeaderAndThemeUI();
    App.renderCurrentView();
    App.showToast('Profile updated');
  };

  window.evCloseProfileEditModal = function () {
    var modal = document.getElementById('ev-profile-edit-modal');
    if (modal) modal.classList.remove('is-open');
  };

  /* Demo Mode Loader & Complete Reset Handlers */
  window.evLoadDemoProfile = function () {
    window.ExamVerseStorage.loadSampleDemoProfile();
    App.syncHeaderAndThemeUI();
    App.renderCurrentView();
    App.showToast('Loaded Sample Demo Profile (marked [Demo])');
  };

  window.evOpenResetModal = function () {
    var modal = document.getElementById('ev-reset-modal');
    if (modal) modal.classList.add('is-open');
  };

  window.evCloseResetModal = function () {
    var modal = document.getElementById('ev-reset-modal');
    if (modal) modal.classList.remove('is-open');
  };

  window.evConfirmResetProgress = function () {
    window.ExamVerseStorage.resetProgress();
    window.evCloseResetModal();
    App.syncHeaderAndThemeUI();
    App.renderCurrentView();
    App.showToast('All progress, sessions, mastery, and history reset to 0');
  };

  document.addEventListener('DOMContentLoaded', function () {
    App.init();
  });
})();
