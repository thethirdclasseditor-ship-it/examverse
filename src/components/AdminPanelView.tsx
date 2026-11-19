import React, { useState } from 'react';
import {
  getAvailableClasses,
  getAvailableGroups,
  getSubjectsForSelection,
  trText,
  useExamStore,
} from '../store/useExamStore';

export const AdminPanelView: React.FC = () => {
  const {
    language,
    selectedClass,
    selectedGroup,
    isAdminUnlocked,
    questionReports,
    unlockAdmin,
    lockAdmin,
    setAdminPin,
    importBulkMcqs,
    addSingleCustomMcq,
    updateCustomMcqAnswer,
    editCustomMcqFull,
    deleteCustomMcq,
    deleteCustomSubject,
    exportProjectSyllabusCode,
    resolveQuestionReport,
    deleteQuestionReport,
    fetchLeaderboardUsers,
  } = useExamStore();

  const isBn = language !== 'en';

  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'bulk' | 'single' | 'reports' | 'manage' | 'users'>('bulk');

  const [admClass, setAdmClass] = useState<string>(selectedClass || 'HSC');
  const [admGroup, setAdmGroup] = useState<string>(selectedGroup || 'Business Studies');
  const admSubjects = getSubjectsForSelection(admClass, admGroup, true);
  const [admSubjectId, setAdmSubjectId] = useState<string>(admSubjects[0]?.id || 'acc-1');
  const [admCustomSubjNameBn, setAdmCustomSubjNameBn] = useState('');
  const [admCustomSubjNameEn, setAdmCustomSubjNameEn] = useState('');
  const [admRawText, setAdmRawText] = useState('');
  const [admStatusBanner, setAdmStatusBanner] = useState('');
  const [newPinValue, setNewPinValue] = useState('');

  const [singleChap, setSingleChap] = useState('অধ্যায় ১');
  const [singleQ, setSingleQ] = useState('');
  const [singleOptA, setSingleOptA] = useState('');
  const [singleOptB, setSingleOptB] = useState('');
  const [singleOptC, setSingleOptC] = useState('');
  const [singleOptD, setSingleOptD] = useState('');
  const [singleAns, setSingleAns] = useState(0);
  const [singleBoard, setSingleBoard] = useState("ঢা. বো. '২৩");
  const [singleExp, setSingleExp] = useState('');

  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [editRepQ, setEditRepQ] = useState('');
  const [editRepOpts, setEditRepOpts] = useState<string[]>(['', '', '', '']);
  const [editRepAns, setEditRepAns] = useState(0);

  const [cloudUsers, setCloudUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchAdminCloudUsers = async () => {
    setLoadingUsers(true);
    try {
      const list = await fetchLeaderboardUsers();
      setCloudUsers(list || []);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!isAdminUnlocked) {
    return (
      <div className="ev-card" style={{ maxWidth: 420, margin: '32px auto', textAlign: 'center', padding: 26 }}>
        <h2 className="ev-section-title" style={{ justifyContent: 'center' }}>
          {isBn ? 'অ্যাডমিন ভেরিফিকেশন' : 'Admin Verification'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '8px 0 16px' }}>
          {isBn ? 'অনুমোদিত অ্যাডমিন পিন প্রবেশ করান:' : 'Enter administrator PIN:'}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const ok = unlockAdmin(adminPinInput);
            if (!ok) {
              setAdminPinError(isBn ? 'ভুল পিন কোড' : 'Invalid PIN');
            } else {
              setAdminPinError('');
              setAdminPinInput('');
              fetchAdminCloudUsers();
            }
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <input
            type="password"
            className="ev-input font-mono"
            style={{ textAlign: 'center', fontSize: 18, letterSpacing: '0.18em' }}
            placeholder="••••"
            value={adminPinInput}
            onChange={(e) => setAdminPinInput(e.target.value)}
          />
          {adminPinError && (
            <div style={{ color: 'var(--status-danger)', fontSize: 13, fontWeight: 700 }}>{adminPinError}</div>
          )}
          <button type="submit" className="ev-btn ev-btn-primary">
            {isBn ? 'আনলক করো' : 'Unlock'}
          </button>
        </form>
      </div>
    );
  }

  const admGroupOptions = getAvailableGroups(admClass);
  const selectedAdmSubj = admSubjects.find((s) => s.id === admSubjectId) || admSubjects[0];
  const pendingReportsCount = questionReports.filter((r) => r.status === 'pending').length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAdmRawText(String(ev.target?.result || ''));
    reader.readAsText(file);
  };

  const handleDownloadProjectCode = () => {
    const code = exportProjectSyllabusCode();
    const blob = new Blob([code], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'syllabusBackup.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="ev-card">
        <div className="ev-section-header">
          <h2 className="ev-section-title">{isBn ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={handleDownloadProjectCode}>
              {isBn ? 'ব্যাকআপ ডাউনলোড' : 'Export Backup'}
            </button>
            <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={lockAdmin}>
              {isBn ? 'লক করো' : 'Lock'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <button
            type="button"
            className={`ev-btn ev-btn-sm ${adminSubTab === 'bulk' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
            onClick={() => setAdminSubTab('bulk')}
          >
            {isBn ? 'বাল্ক আপলোড' : 'Bulk Upload'}
          </button>
          <button
            type="button"
            className={`ev-btn ev-btn-sm ${adminSubTab === 'single' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
            onClick={() => setAdminSubTab('single')}
          >
            {isBn ? 'একক প্রশ্ন যোগ' : 'Add Question'}
          </button>
          <button
            type="button"
            className={`ev-btn ev-btn-sm ${adminSubTab === 'reports' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
            onClick={() => setAdminSubTab('reports')}
          >
            {isBn ? `রিপোর্ট (${pendingReportsCount})` : `Reports (${pendingReportsCount})`}
          </button>
          <button
            type="button"
            className={`ev-btn ev-btn-sm ${adminSubTab === 'manage' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
            onClick={() => setAdminSubTab('manage')}
          >
            {isBn ? 'প্রশ্ন সংশোধন' : 'Manage MCQs'}
          </button>
          <button
            type="button"
            className={`ev-btn ev-btn-sm ${adminSubTab === 'users' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
            onClick={() => {
              setAdminSubTab('users');
              fetchAdminCloudUsers();
            }}
          >
            {isBn ? 'ইউজার ও পিন' : 'Users & PIN'}
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
              fontWeight: 700,
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
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                {isBn ? 'শ্রেণি' : 'Class'}
              </label>
              <select
                className="ev-select"
                value={admClass}
                onChange={(e) => {
                  const nextC = e.target.value;
                  const firstG = getAvailableGroups(nextC)[0] || 'Business Studies';
                  const firstS = getSubjectsForSelection(nextC, firstG, true)[0]?.id || '';
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
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                {isBn ? 'বিভাগ' : 'Group'}
              </label>
              <select
                className="ev-select"
                value={admGroup}
                onChange={(e) => {
                  const nextG = e.target.value;
                  const firstS = getSubjectsForSelection(admClass, nextG, true)[0]?.id || '';
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
              <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 4 }}>
                {isBn ? 'বিষয়' : 'Subject'}
              </label>
              <select className="ev-select" value={admSubjectId} onChange={(e) => setAdmSubjectId(e.target.value)}>
                {admSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {trText(s.name, language)}
                  </option>
                ))}
                <option value="new-custom-subject">+ {isBn ? 'নতুন বিষয় তৈরি করো' : 'Create New Subject'}</option>
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
                  placeholder={isBn ? 'বিষয়ের বাংলা নাম' : 'Subject Name (Bangla)'}
                  value={admCustomSubjNameBn}
                  onChange={(e) => setAdmCustomSubjNameBn(e.target.value)}
                />
                <input
                  type="text"
                  className="ev-input"
                  placeholder={isBn ? 'বিষয়ের ইংরেজি নাম' : 'Subject Name (English)'}
                  value={admCustomSubjNameEn}
                  onChange={(e) => setAdmCustomSubjNameEn(e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                {isBn
                  ? 'CSV / TSV ফাইল আপলোড করো অথবা Excel থেকে কপি করে পেস্ট করো:'
                  : 'Upload a CSV/TSV file or paste rows copied from Excel:'}
              </label>
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                className="ev-input"
                onChange={handleFileUpload}
                style={{ marginBottom: 8 }}
              />
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
                      ? admCustomSubjNameBn.trim() || 'নতুন বিষয়'
                      : selectedAdmSubj?.name.bn || 'বিষয়';
                  const finalEn =
                    admSubjectId === 'new-custom-subject'
                      ? admCustomSubjNameEn.trim() || finalBn
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
                  if (admSubjectId === 'new-custom-subject') {
                    setAdmSubjectId(finalId);
                  }
                  setAdmStatusBanner(
                    isBn
                      ? `${finalBn}-এ ${res.addedQuestions}টি প্রশ্ন ও ${res.addedChapters}টি অধ্যায় সংরক্ষিত হয়েছে।`
                      : `Saved ${res.addedQuestions} questions and ${res.addedChapters} chapters to ${finalEn}.`
                  );
                }}
              >
                {isBn ? 'সেভ করো' : 'Save Questions'}
              </button>
              <button type="button" className="ev-btn ev-btn-secondary" onClick={handleDownloadProjectCode}>
                {isBn ? 'ব্যাকআপ ডাউনলোড' : 'Download Backup'}
              </button>
            </div>
          </div>
        )}

        {adminSubTab === 'single' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="text"
              className="ev-input"
              placeholder={isBn ? 'অধ্যায়ের নাম' : 'Chapter Name'}
              value={singleChap}
              onChange={(e) => setSingleChap(e.target.value)}
            />
            <input
              type="text"
              className="ev-input"
              placeholder={isBn ? 'প্রশ্নটি লেখো...' : 'Question text...'}
              value={singleQ}
              onChange={(e) => setSingleQ(e.target.value)}
            />
            <div className="ev-grid-2">
              <input
                type="text"
                className="ev-input"
                placeholder={isBn ? 'অপশন ক' : 'Option A'}
                value={singleOptA}
                onChange={(e) => setSingleOptA(e.target.value)}
              />
              <input
                type="text"
                className="ev-input"
                placeholder={isBn ? 'অপশন খ' : 'Option B'}
                value={singleOptB}
                onChange={(e) => setSingleOptB(e.target.value)}
              />
              <input
                type="text"
                className="ev-input"
                placeholder={isBn ? 'অপশন গ' : 'Option C'}
                value={singleOptC}
                onChange={(e) => setSingleOptC(e.target.value)}
              />
              <input
                type="text"
                className="ev-input"
                placeholder={isBn ? 'অপশন ঘ' : 'Option D'}
                value={singleOptD}
                onChange={(e) => setSingleOptD(e.target.value)}
              />
            </div>
            <div className="ev-grid-3">
              <select className="ev-select" value={singleAns} onChange={(e) => setSingleAns(Number(e.target.value))}>
                <option value={0}>{isBn ? 'সঠিক উত্তর: ক' : 'Correct: A'}</option>
                <option value={1}>{isBn ? 'সঠিক উত্তর: খ' : 'Correct: B'}</option>
                <option value={2}>{isBn ? 'সঠিক উত্তর: গ' : 'Correct: C'}</option>
                <option value={3}>{isBn ? 'সঠিক উত্তর: ঘ' : 'Correct: D'}</option>
              </select>
              <input
                type="text"
                className="ev-input"
                placeholder={isBn ? 'বোর্ড ট্যাগ' : 'Board Tag'}
                value={singleBoard}
                onChange={(e) => setSingleBoard(e.target.value)}
              />
              <input
                type="text"
                className="ev-input"
                placeholder={isBn ? 'ব্যাখ্যা (ঐচ্ছিক)' : 'Explanation (optional)'}
                value={singleExp}
                onChange={(e) => setSingleExp(e.target.value)}
              />
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
                setSingleExp('');
                setAdmStatusBanner(isBn ? 'প্রশ্নটি সফলভাবে সংরক্ষিত হয়েছে।' : 'Question saved successfully.');
              }}
            >
              {isBn ? 'প্রশ্ন যুক্ত করো' : 'Add Question'}
            </button>
          </div>
        )}

        {adminSubTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {questionReports.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                {isBn ? 'কোনো প্রশ্ন রিপোর্ট নেই।' : 'No question reports found.'}
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
                      {rep.issueType} • {rep.subjectName}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                      {rep.reportedBy} • {rep.createdAt} • {rep.status === 'resolved' ? 'সমাধানকৃত' : 'অপেক্ষমাণ'}
                    </span>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 4, whiteSpace: 'pre-line' }}>
                    {rep.questionText}
                  </div>
                  {rep.comment && (
                    <div style={{ fontSize: 13, color: 'var(--status-danger-text)', fontWeight: 600, marginBottom: 8 }}>
                      &ldquo;{rep.comment}&rdquo;
                    </div>
                  )}

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
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{isBn ? 'সঠিক উত্তর:' : 'Answer:'}</span>
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
                            editCustomMcqFull({
                              targetClass: admClass,
                              targetGroup: admGroup,
                              subjectId: rep.subjectId,
                              chapterId: rep.chapterId,
                              questionId: rep.questionId,
                              questionBn: editRepQ,
                              optionsBn: editRepOpts,
                              ansIndex: editRepAns,
                            });
                            resolveQuestionReport(rep.id);
                            setEditingReportId(null);
                            setAdmStatusBanner(isBn ? 'প্রশ্নটি সংশোধন ও সংরক্ষণ করা হয়েছে।' : 'Question updated.');
                          }}
                        >
                          {isBn ? 'সেভ ও সমাধান' : 'Save & Resolve'}
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
                        {isBn ? 'সংশোধন করো' : 'Edit'}
                      </button>
                      {rep.status !== 'resolved' && (
                        <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={() => resolveQuestionReport(rep.id)}>
                          {isBn ? 'সমাধানকৃত' : 'Mark Resolved'}
                        </button>
                      )}
                      <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => deleteQuestionReport(rep.id)}>
                        {isBn ? 'মুছো' : 'Delete'}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>
                {trText(selectedAdmSubj.name, language)} — {selectedAdmSubj.chapters.length} {isBn ? 'অধ্যায়' : 'Chapters'}
              </div>
              <button
                type="button"
                className="ev-btn ev-btn-danger ev-btn-sm"
                onClick={() => {
                  deleteCustomSubject(admClass, admGroup, selectedAdmSubj.id);
                  setAdmStatusBanner(isBn ? 'নির্বাচিত বিষয়টি সরানো/রিসেট করা হয়েছে।' : 'Subject removed/reset.');
                }}
              >
                {isBn ? 'এই বিষয়টি মুছো' : 'Remove Subject'}
              </button>
            </div>

            {selectedAdmSubj.chapters.map((ch) => (
              <div key={ch.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 8 }}>
                  {trText(ch.name, language)} ({ch.mcqs.length} MCQs)
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
                      <div style={{ flex: 1, minWidth: 220, fontSize: 13.5, fontWeight: 600, whiteSpace: 'pre-line' }}>
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
                          ✕
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
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  {isBn ? 'রেজিস্টার্ড ইউজার তালিকা' : 'Registered Cloud Users'}
                </div>
                <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={fetchAdminCloudUsers}>
                  {loadingUsers ? '...' : isBn ? 'রিফ্রেশ' : 'Refresh'}
                </button>
              </div>

              {cloudUsers.length === 0 ? (
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  {isBn ? 'কোনো ক্লাউড ইউজার পাওয়া যায়নি।' : 'No cloud users found.'}
                </p>
              ) : (
                <div className="ev-table-wrap">
                  <table className="ev-table">
                    <thead>
                      <tr>
                        <th>{isBn ? 'নাম' : 'Name'}</th>
                        <th>{isBn ? 'ইউজারনেম' : 'Handle'}</th>
                        <th>{isBn ? 'ট্র্যাক' : 'Track'}</th>
                        <th>XP / Level</th>
                        <th>{isBn ? 'স্ট্রিক' : 'Streak'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cloudUsers.map((u, idx) => (
                        <tr key={u.id || idx}>
                          <td style={{ fontWeight: 700 }}>{u.full_name || u.name || 'Scholar'}</td>
                          <td>{u.username || u.handle || '—'}</td>
                          <td>{u.target_track || u.badge || 'HSC'}</td>
                          <td className="font-mono">
                            {u.xp || 0} XP (Lv.{u.level || 1})
                          </td>
                          <td>{u.streak_days || u.streak || 0}d</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>
                {isBn ? 'অ্যাডমিন পিন পরিবর্তন' : 'Change Admin PIN'}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="password"
                  className="ev-input"
                  style={{ flex: 1, minWidth: 200 }}
                  placeholder={isBn ? 'নতুন পিন (কমপক্ষে ৪ অক্ষর)' : 'New PIN (min 4 chars)'}
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
                      setAdmStatusBanner(isBn ? 'অ্যাডমিন পিন আপডেট করা হয়েছে।' : 'Admin PIN updated.');
                    }
                  }}
                >
                  {isBn ? 'আপডেট পিন' : 'Update PIN'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanelView;
