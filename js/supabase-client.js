/* ==========================================================================
   ExamVerse — Supabase Auth, Cloud Sync & Server-Side Validation Client (js/supabase-client.js)
   Step 4 Implementation (Audit 2.8, 2.9, 10.2):
   - Supports Email/Password Sign Up, Sign In, Google OAuth, and Sign Out via Supabase Auth REST API
   - Supports dynamic configuration from Settings UI (saved in localStorage) or static constants
   - Syncs User Profile, Bookmarks, Mistakes & Live Leaderboard with Supabase PostgreSQL
   - Submits quiz attempts to Server-Side RPC (submit_quiz_attempt) when authenticated
   - Allows students to submit Question Error Reports ("Report a Typo")
   ========================================================================== */

(function () {
  var CLOUD_CFG_KEY = 'examverse_supabase_cfg_v1';
  var CLOUD_SESSION_KEY = 'examverse_supabase_session_v1';

  var DEFAULT_CONFIG = {
    url: '',
    anonKey: '',
    enabled: false
  };

  var CloudService = {
    config: Object.assign({}, DEFAULT_CONFIG),
    authSession: null, /* { access_token, refresh_token, user: { id, email } } */

    init: function () {
      try {
        var rawCfg = window.localStorage.getItem(CLOUD_CFG_KEY);
        if (rawCfg) {
          var parsed = JSON.parse(rawCfg);
          this.config = Object.assign({}, DEFAULT_CONFIG, parsed);
        }
        var rawSess = window.localStorage.getItem(CLOUD_SESSION_KEY);
        if (rawSess) {
          this.authSession = JSON.parse(rawSess);
        }
      } catch (e) {}
      return this;
    },

    saveConfig: function (url, anonKey) {
      var cleanUrl = String(url || '').trim().replace(/\/+$/, '');
      var cleanKey = String(anonKey || '').trim();
      this.config = {
        url: cleanUrl,
        anonKey: cleanKey,
        enabled: Boolean(cleanUrl && cleanKey && cleanUrl.indexOf('https://') === 0)
      };
      try {
        window.localStorage.setItem(CLOUD_CFG_KEY, JSON.stringify(this.config));
      } catch (e) {}
      return this.config.enabled;
    },

    disconnectConfig: function () {
      this.config = Object.assign({}, DEFAULT_CONFIG);
      this.authSession = null;
      try {
        window.localStorage.removeItem(CLOUD_CFG_KEY);
        window.localStorage.removeItem(CLOUD_SESSION_KEY);
      } catch (e) {}
    },

    isConfigured: function () {
      return Boolean(
        this.config &&
        this.config.enabled &&
        this.config.url &&
        this.config.anonKey &&
        this.config.url.indexOf('YOUR_PROJECT_ID') === -1
      );
    },

    isAuthenticated: function () {
      return Boolean(this.isConfigured() && this.authSession && this.authSession.access_token && this.authSession.user);
    },

    getHeaders: function (useAuthToken) {
      var token = (useAuthToken && this.authSession && this.authSession.access_token)
        ? this.authSession.access_token
        : this.config.anonKey;
      return {
        'Content-Type': 'application/json',
        'apikey': this.config.anonKey,
        'Authorization': 'Bearer ' + token
      };
    },

    /* 1. Email/Password Sign Up */
    signUpWithEmail: async function (email, password, fullName) {
      if (!this.isConfigured()) {
        throw new Error('Please configure your Supabase Project URL and Anon Key first.');
      }
      var res = await window.fetch(this.config.url + '/auth/v1/signup', {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({
          email: email,
          password: password,
          data: { full_name: fullName || 'Student Scholar' }
        })
      });
      var data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || data.error_description || data.message || 'Sign up failed');
      }
      if (data.access_token && data.user) {
        this.setAuthSession(data);
        await this.pullCloudProfile();
      }
      return data;
    },

    /* 2. Email/Password Sign In */
    signInWithEmail: async function (email, password) {
      if (!this.isConfigured()) {
        throw new Error('Please configure your Supabase Project URL and Anon Key first.');
      }
      var res = await window.fetch(this.config.url + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({ email: email, password: password })
      });
      var data = await res.json();
      if (!res.ok) {
        throw new Error(data.error_description || data.msg || data.message || 'Invalid login credentials');
      }
      this.setAuthSession(data);
      await this.pullCloudProfile();
      return data;
    },

    /* 3. Google OAuth Redirect Sign In */
    getGoogleOAuthUrl: function () {
      if (!this.isConfigured()) return null;
      var redirectUrl = window.location.origin + window.location.pathname;
      return this.config.url + '/auth/v1/authorize?provider=google&redirect_to=' + encodeURIComponent(redirectUrl);
    },

    setAuthSession: function (sessionData) {
      this.authSession = {
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
        user: sessionData.user
      };
      try {
        window.localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(this.authSession));
      } catch (e) {}
    },

    signOut: function () {
      this.authSession = null;
      try {
        window.localStorage.removeItem(CLOUD_SESSION_KEY);
      } catch (e) {}
    },

    /* 4. Pull User Profile & Sync with LocalStorage */
    pullCloudProfile: async function () {
      if (!this.isAuthenticated()) return null;
      var uid = this.authSession.user.id;
      var res = await window.fetch(
        this.config.url + '/rest/v1/user_profiles?id=eq.' + encodeURIComponent(uid) + '&select=*',
        { headers: this.getHeaders(true) }
      );
      if (!res.ok) return null;
      var rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && window.ExamVerseStorage) {
        var p = rows[0];
        var u = window.ExamVerseStorage.state.user;
        u.name = p.full_name || u.name;
        u.username = p.username || u.username;
        u.avatarInitials = p.avatar_initials || u.avatarInitials;
        u.targetTrack = p.target_track || u.targetTrack;
        u.level = Number(p.level) || u.level;
        u.xp = Number(p.xp) || u.xp;
        u.streakDays = Number(p.streak_days) || u.streakDays;
        window.ExamVerseStorage.recalculateLevelProgress();
        window.ExamVerseStorage.save();
        return p;
      }
      return null;
    },

    /* 5. Submit Quiz Attempt to Server-Side Validated RPC (submit_quiz_attempt) */
    submitServerValidatedAttempt: async function (resultPayload) {
      if (!this.isAuthenticated()) return null;
      try {
        var qIds = (resultPayload.questions || []).map(function (q) { return q.id; });
        var res = await window.fetch(this.config.url + '/rest/v1/rpc/submit_quiz_attempt', {
          method: 'POST',
          headers: this.getHeaders(true),
          body: JSON.stringify({
            p_title: resultPayload.title,
            p_category_id: resultPayload.categoryId || 'uni',
            p_subject_id: resultPayload.primarySubjectId || 'physics',
            p_mode: resultPayload.mode || 'practice',
            p_negative_mark: Number(resultPayload.negativeMark) || 0,
            p_time_taken_sec: Number(resultPayload.timeTakenSec) || 0,
            p_question_ids: qIds,
            p_answers: resultPayload.answers || {},
            p_is_daily_challenge: Boolean(resultPayload.isDailyChallenge)
          })
        });
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    },

    /* 6. Fetch Real Leaderboard from Supabase View (public.leaderboard_alltime) */
    fetchLiveLeaderboard: async function () {
      if (!this.isConfigured()) return null;
      try {
        var res = await window.fetch(
          this.config.url + '/rest/v1/leaderboard_alltime?select=*&limit=50',
          { headers: this.getHeaders(false) }
        );
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    },

    /* 7. Submit Question Error / Typo Report */
    submitQuestionReport: async function (questionId, issueType, detailsText) {
      var reportEntry = {
        questionId: questionId,
        issueType: issueType,
        details: detailsText,
        createdAt: new Date().toISOString()
      };
      if (this.isConfigured()) {
        try {
          await window.fetch(this.config.url + '/rest/v1/question_reports', {
            method: 'POST',
            headers: this.getHeaders(this.isAuthenticated()),
            body: JSON.stringify({
              question_id: questionId,
              user_id: this.isAuthenticated() ? this.authSession.user.id : null,
              issue_type: issueType,
              details: detailsText
            })
          });
        } catch (e) {}
      }
      return reportEntry;
    }
  };

  CloudService.init();
  window.ExamVerseCloud = CloudService;
})();
