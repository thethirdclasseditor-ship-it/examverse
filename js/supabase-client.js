/* ==========================================================================
   ExamVerse — Real-Time Supabase Auth (Google, Facebook, Verified Email) & Cloud DB Sync
   File: js/supabase-client.js
   ========================================================================== */

(function () {
  var CLOUD_CFG_KEY = 'examverse_supabase_cfg_v1';
  var CLOUD_SESSION_KEY = 'examverse_supabase_session_v1';

  var DEFAULT_CONFIG = {
    url: 'https://muxgoubiqmussyydhekq.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11eGdvdWJpcW11c3N5eWRoZWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2Njg0OTMsImV4cCI6MjEwOTI0NDQ5M30.BesDfzId-3Pewr5EfNXvKwm4--LkpnBIGGqDQS7kDkc',
    enabled: true
  };

  /* Blocked disposable / fake email domains to prevent fake account creation */
  var BLOCKED_FAKE_DOMAINS = [
    'mailinator.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com',
    'guerrillamail.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com',
    'getnada.com', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com',
    'throwawaymail.com', 'mohmal.com', 'tempail.com', 'emailondeck.com',
    'fake.com', 'test.com', 'example.com', 'abc.com', 'xyz.com', 'none.com'
  ];

  var CloudService = {
    config: Object.assign({}, DEFAULT_CONFIG),
    authSession: null,
    authMode: 'signin',
    isBusy: false,
    oauthJustCompleted: false,

    init: function () {
      try {
        var rawCfg = window.localStorage.getItem(CLOUD_CFG_KEY);
        if (rawCfg) {
          var parsed = JSON.parse(rawCfg);
          if (parsed && parsed.url && parsed.anonKey) {
            this.config = Object.assign({}, DEFAULT_CONFIG, parsed);
          }
        }
        var rawSess = window.localStorage.getItem(CLOUD_SESSION_KEY);
        if (rawSess) {
          this.authSession = JSON.parse(rawSess);
        }
      } catch (e) {}

      /* Immediately inspect URL hash for Google / Facebook OAuth callback tokens BEFORE hash router runs */
      this.captureOAuthHashCallback();
      return this;
    },

    validateAuthenticEmail: function (email) {
      var clean = String(email || '').trim().toLowerCase();
      var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(clean)) {
        return { valid: false, reason: 'অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস দিন (যেমন: yourname@gmail.com)।' };
      }
      var parts = clean.split('@');
      var localPart = parts[0];
      var domain = parts[1];

      if (localPart.length < 3 || /^(test|fake|admin|user|abcd|12345)$/i.test(localPart)) {
        return { valid: false, reason: 'ফেইক বা টেস্ট ইমেইল গ্রহণযোগ্য নয়। আপনার আসল ইমেইল ব্যবহার করুন।' };
      }
      if (BLOCKED_FAKE_DOMAINS.indexOf(domain) !== -1) {
        return { valid: false, reason: 'Temporary বা Fake ইমেইল ডোমেইন গ্রহণযোগ্য নয়। অনুগ্রহ করে আসল Gmail, Yahoo বা Outlook ইমেইল দিন।' };
      }
      return { valid: true, email: clean };
    },

    captureOAuthHashCallback: function () {
      if (!window.location || !window.location.hash) return;
      var hash = window.location.hash;
      if (hash.indexOf('access_token=') === -1 && hash.indexOf('error_description=') === -1) {
        return;
      }

      var queryStr = hash.replace(/^#\/?/, '');
      var params = new URLSearchParams(queryStr);
      var errorDesc = params.get('error_description');
      if (errorDesc) {
        window.history.replaceState(null, '', window.location.pathname + '#/home');
        setTimeout(function () {
          if (window.ExamVerseApp) {
            window.ExamVerseApp.showToast('OAuth Login Error: ' + decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
          }
        }, 400);
        return;
      }

      var accessToken = params.get('access_token');
      var refreshToken = params.get('refresh_token') || '';
      if (!accessToken) return;

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname + '#/home');
      } else {
        window.location.hash = '#/home';
      }

      this.oauthJustCompleted = true;
      this.fetchUserFromAccessToken(accessToken, refreshToken);
    },

    fetchUserFromAccessToken: async function (accessToken, refreshToken) {
      if (!this.isConfigured()) return;
      try {
        var res = await window.fetch(this.config.url + '/auth/v1/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.config.anonKey,
            'Authorization': 'Bearer ' + accessToken
          }
        });
        if (!res.ok) return;
        var userObj = await res.json();
        if (userObj && userObj.id) {
          this.setAuthSession({
            access_token: accessToken,
            refresh_token: refreshToken,
            user: userObj
          });
          await this.syncAuthenticatedUserWithDatabase(userObj);
          if (window.ExamVerseApp) {
            window.ExamVerseApp.syncHeaderAndThemeUI();
            window.ExamVerseApp.renderCurrentView();
            var provider = (userObj.app_metadata && userObj.app_metadata.provider) || 'Cloud';
            var providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1);
            window.ExamVerseApp.showToast('স্বাগতম! ' + providerLabel + ' একাউন্টের মাধ্যমে সফলভাবে লগইন হয়েছে।');
          }
        }
      } catch (e) {}
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
      this.config = { url: '', anonKey: '', enabled: false };
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
        this.config.anonKey.indexOf('এখানে_') === -1 &&
        this.config.url.indexOf('YOUR_PROJECT_ID') === -1
      );
    },

    isAuthenticated: function () {
      return Boolean(this.isConfigured() && this.authSession && this.authSession.access_token && this.authSession.user);
    },

    getAuthProviderLabel: function () {
      if (!this.isAuthenticated()) return 'Local';
      var u = this.authSession.user;
      var prov = (u && u.app_metadata && u.app_metadata.provider) || 'email';
      if (prov === 'google') return 'Google Verified';
      if (prov === 'facebook') return 'Facebook Verified';
      return 'Email Verified';
    },

    getHeaders: function (useAuthToken) {
      var token = (useAuthToken && this.authSession && this.authSession.access_token)
        ? this.authSession.access_token
        : this.config.anonKey;
      var headers = {
        'Content-Type': 'application/json',
        'apikey': this.config.anonKey
      };
      if (token && (token.indexOf('eyJ') === 0 || (useAuthToken && this.authSession && this.authSession.access_token))) {
        headers['Authorization'] = 'Bearer ' + token;
      }
      return headers;
    },

    signUpWithEmail: async function (email, password, fullName, targetGroup) {
      if (!this.isConfigured()) {
        throw new Error('প্রথমে Supabase Project সংযুক্ত করুন।');
      }
      var check = this.validateAuthenticEmail(email);
      if (!check.valid) {
        throw new Error(check.reason);
      }
      var cleanName = String(fullName || '').trim();
      if (cleanName.length < 2) {
        throw new Error('অনুগ্রহ করে আপনার আসল নাম লিখুন (কমপক্ষে ২ অক্ষর)।');
      }
      if (!password || password.length < 6) {
        throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      }

      var handle = '@' + check.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 15);
      var res = await window.fetch(this.config.url + '/auth/v1/signup', {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({
          email: check.email,
          password: password,
          data: {
            full_name: cleanName,
            username: handle,
            target_track: targetGroup || 'Science (বিজ্ঞান বিভাগ)'
          }
        })
      });
      var data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || data.error_description || data.message || 'Sign up failed');
      }

      if (window.ExamVerseStorage) {
        var u = window.ExamVerseStorage.state.user;
        u.name = cleanName;
        u.username = handle;
        u.targetTrack = targetGroup || u.targetTrack;
        var parts = cleanName.split(/\s+/);
        u.avatarInitials = ((parts[0] ? parts[0].charAt(0) : 'S') + (parts[1] ? parts[1].charAt(0) : (parts[0].charAt(1) || 'S'))).toUpperCase();
        window.ExamVerseStorage.save();
      }

      if (data.access_token && data.user) {
        this.setAuthSession(data);
        await this.syncAuthenticatedUserWithDatabase(data.user);
      }
      return data;
    },

    signInWithEmail: async function (email, password) {
      if (!this.isConfigured()) {
        throw new Error('প্রথমে Supabase Project সংযুক্ত করুন।');
      }
      var check = this.validateAuthenticEmail(email);
      if (!check.valid) {
        throw new Error(check.reason);
      }
      if (!password) {
        throw new Error('অনুগ্রহ করে আপনার পাসওয়ার্ড দিন।');
      }
      var res = await window.fetch(this.config.url + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({ email: check.email, password: password })
      });
      var data = await res.json();
      if (!res.ok) {
        throw new Error(data.error_description || data.msg || data.message || 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।');
      }
      this.setAuthSession(data);
      await this.syncAuthenticatedUserWithDatabase(data.user);
      return data;
    },

    getOAuthUrl: function (providerName) {
      if (!this.isConfigured()) return null;
      var prov = (providerName === 'facebook') ? 'facebook' : 'google';
      var redirectUrl = window.location.origin + window.location.pathname;
      return this.config.url + '/auth/v1/authorize?provider=' + encodeURIComponent(prov) + '&redirect_to=' + encodeURIComponent(redirectUrl);
    },

    getGoogleOAuthUrl: function () {
      return this.getOAuthUrl('google');
    },

    getFacebookOAuthUrl: function () {
      return this.getOAuthUrl('facebook');
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

    signOut: async function () {
      if (this.isAuthenticated()) {
        try {
          await window.fetch(this.config.url + '/auth/v1/logout', {
            method: 'POST',
            headers: this.getHeaders(true)
          });
        } catch (e) {}
      }
      this.authSession = null;
      try {
        window.localStorage.removeItem(CLOUD_SESSION_KEY);
      } catch (e) {}
    },

    syncAuthenticatedUserWithDatabase: async function (userObj) {
      if (!this.isAuthenticated()) return null;
      var uAuth = userObj || this.authSession.user;
      if (!uAuth || !uAuth.id) return null;

      var meta = uAuth.user_metadata || {};
      var oauthName = meta.full_name || meta.name || (uAuth.email ? uAuth.email.split('@')[0] : 'Student Scholar');
      var oauthAvatar = meta.avatar_url || meta.picture || '';
      var defaultHandle = meta.username || ('@' + (uAuth.email ? uAuth.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') : 'scholar'));

      var existingProfile = await this.pullCloudProfile();
      if (existingProfile) {
        if (oauthAvatar && window.ExamVerseStorage) {
          window.ExamVerseStorage.state.user.avatarUrl = oauthAvatar;
          window.ExamVerseStorage.save();
        }
        return existingProfile;
      }

      if (window.ExamVerseStorage) {
        var localUser = window.ExamVerseStorage.state.user;
        if (localUser.name === 'Student Scholar' && oauthName) {
          localUser.name = oauthName;
        }
        if (localUser.username === '@student_ev' && defaultHandle) {
          localUser.username = defaultHandle;
        }
        var nameParts = (localUser.name || 'S S').split(/\s+/);
        localUser.avatarInitials = ((nameParts[0] ? nameParts[0].charAt(0) : 'S') + (nameParts[1] ? nameParts[1].charAt(0) : (nameParts[0].charAt(1) || 'S'))).toUpperCase();
        if (oauthAvatar) {
          localUser.avatarUrl = oauthAvatar;
        }
        window.ExamVerseStorage.save();
      }

      return await this.pushCloudProfile();
    },

    pushCloudProfile: async function () {
      if (!this.isAuthenticated() || !window.ExamVerseStorage) return null;
      var uid = this.authSession.user.id;
      var u = window.ExamVerseStorage.state.user;
      var payload = {
        id: uid,
        username: u.username || ('@user_' + uid.slice(0, 6)),
        full_name: u.name || 'Student Scholar',
        avatar_initials: u.avatarInitials || 'SS',
        target_track: u.targetTrack || 'Science (বিজ্ঞান বিভাগ)',
        level: Number(u.level) || 1,
        xp: Number(u.xp) || 0,
        streak_days: Number(u.streakDays) || 0,
        last_active_date: u.lastStudyDate || window.ExamVerseStorage.getTodayDateStr(),
        updated_at: new Date().toISOString()
      };
      try {
        var headers = this.getHeaders(true);
        headers['Prefer'] = 'resolution=merge-duplicates,return=representation';
        var res = await window.fetch(this.config.url + '/rest/v1/user_profiles', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload)
        });
        if (!res.ok) return null;
        var rows = await res.json();
        return Array.isArray(rows) && rows.length > 0 ? rows[0] : payload;
      } catch (e) {
        return null;
      }
    },

    pullCloudProfile: async function () {
      if (!this.isAuthenticated()) return null;
      var uid = this.authSession.user.id;
      try {
        var res = await window.fetch(
          this.config.url + '/rest/v1/user_profiles?id=eq.' + encodeURIComponent(uid) + '&select=*',
          { headers: this.getHeaders(true) }
        );
        if (!res.ok) return null;
        var rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0 && window.ExamVerseStorage) {
          var p = rows[0];
          var u = window.ExamVerseStorage.state.user;
          var meta = (this.authSession.user && this.authSession.user.user_metadata) || {};
          u.name = p.full_name || meta.full_name || meta.name || u.name;
          u.username = p.username || u.username;
          u.avatarInitials = p.avatar_initials || u.avatarInitials;
          if (meta.avatar_url || meta.picture) {
            u.avatarUrl = meta.avatar_url || meta.picture;
          }
          u.targetTrack = p.target_track || u.targetTrack;
          u.level = Math.max(Number(u.level) || 1, Number(p.level) || 1);
          u.xp = Math.max(Number(u.xp) || 0, Number(p.xp) || 0);
          u.streakDays = Math.max(Number(u.streakDays) || 0, Number(p.streak_days) || 0);
          window.ExamVerseStorage.recalculateLevelProgress();
          window.ExamVerseStorage.save();
          return p;
        }
      } catch (e) {}
      return null;
    },

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
        await this.pushCloudProfile();
        if (!res.ok) return null;
        return await res.json();
      } catch (e) {
        return null;
      }
    },

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
