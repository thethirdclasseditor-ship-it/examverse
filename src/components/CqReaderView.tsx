import React, { useEffect, useState } from 'react';
import { trText, useExamStore } from '../store/useExamStore';
import { ActiveQuizConfig, CQFormat, CQQuestion, LanguageMode } from '../types';

interface CqReaderViewProps {
  activeQuiz: ActiveQuizConfig;
  onClose: () => void;
}

type PartKey = 'a' | 'b' | 'c' | 'd';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function toBnNumber(n: number): string {
  return String(n)
    .split('')
    .map((ch) => (ch >= '0' && ch <= '9' ? BN_DIGITS[Number(ch)] : ch))
    .join('');
}

function resolveCqFormat(cq: CQQuestion, subjectId: string): CQFormat {
  if (cq.format) return cq.format;
  const id = (subjectId || '').toLowerCase();
  if (id.includes('en-') || id.includes('eng')) return 'english';
  if (id.includes('bn-2') || id.includes('ban2')) return 'written';
  const hasD = Boolean(cq.d?.bn?.trim() || cq.d?.en?.trim());
  const hasB = Boolean(cq.b?.bn?.trim() || cq.b?.en?.trim());
  const hasC = Boolean(cq.c?.bn?.trim() || cq.c?.en?.trim());
  if (!hasB && !hasC && !hasD) return 'written';
  if (!hasD) return 'cq3';
  return 'cq4';
}

function getCleanCqBoard(cq: CQQuestion): string | null {
  const raw = String(cq.boardTag || cq.board || '').trim();
  if (!raw || raw === 'বোর্ড প্রশ্ন' || raw === 'NCTB ও বোর্ড প্রশ্ন') return null;
  return raw;
}

function buildCqParts(cq: CQQuestion, format: CQFormat, language: LanguageMode) {
  const isBn = language !== 'en';
  const defaultMarks: Record<PartKey, number | undefined> =
    format === 'cq3'
      ? { a: 2, b: 4, c: 4, d: undefined }
      : format === 'cq4'
      ? { a: 1, b: 2, c: 3, d: 4 }
      : { a: undefined, b: undefined, c: undefined, d: undefined };

  const labels: Record<PartKey, string> =
    format === 'english'
      ? { a: 'a', b: 'b', c: 'c', d: 'd' }
      : format === 'written'
      ? { a: isBn ? 'প্রশ্ন' : 'Prompt', b: isBn ? 'অংশ ২' : 'Part 2', c: isBn ? 'অংশ ৩' : 'Part 3', d: isBn ? 'অংশ ৪' : 'Part 4' }
      : isBn
      ? { a: 'ক', b: 'খ', c: 'গ', d: 'ঘ' }
      : { a: 'a', b: 'b', c: 'c', d: 'd' };

  const candidates: { key: PartKey; qText: string; aText: string; mark?: number }[] = [
    {
      key: 'a',
      qText: trText(cq.a, language).trim(),
      aText: trText(cq.ansA, language).trim(),
      mark: cq.marks?.a ?? defaultMarks.a,
    },
    {
      key: 'b',
      qText: trText(cq.b, language).trim(),
      aText: trText(cq.ansB, language).trim(),
      mark: cq.marks?.b ?? defaultMarks.b,
    },
    {
      key: 'c',
      qText: trText(cq.c, language).trim(),
      aText: trText(cq.ansC, language).trim(),
      mark: cq.marks?.c ?? defaultMarks.c,
    },
    {
      key: 'd',
      qText: trText(cq.d, language).trim(),
      aText: trText(cq.ansD, language).trim(),
      mark: cq.marks?.d ?? defaultMarks.d,
    },
  ];

  return candidates
    .filter((item) => Boolean(item.qText || item.aText))
    .map((item) => ({
      ...item,
      label: labels[item.key],
    }));
}

export const CqReaderView: React.FC<CqReaderViewProps> = ({ activeQuiz, onClose }) => {
  const { language, userName, submitQuestionReport } = useExamStore();
  const isBn = language !== 'en';
  const cqs = activeQuiz.cqs || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({});
  const [practicedMap, setPracticedMap] = useState<Record<string, boolean>>({});
  const [navOpenMobile, setNavOpenMobile] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportIssueType, setReportIssueType] = useState('উত্তর বা সমাধানে ভুল আছে');
  const [reportComment, setReportComment] = useState('');
  const [reportSentMsg, setReportSentMsg] = useState<string | null>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setRevealedMap({});
    setPracticedMap({});
    setNavOpenMobile(false);
    setReportOpen(false);
    setReportSentMsg(null);
  }, [activeQuiz]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (cqs.length === 0) {
    return (
      <div className="ev-modal-backdrop is-open" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="ev-modal-panel" style={{ maxWidth: 440, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>
            {trText(activeQuiz.subjectName, language)}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            {isBn
              ? 'এই অধ্যায়ে এখনো কোনো সৃজনশীল (CQ) বা লিখিত প্রশ্ন যুক্ত করা হয়নি।'
              : 'No CQ or written questions have been added to this chapter yet.'}
          </p>
          <button type="button" className="ev-btn ev-btn-primary" onClick={onClose}>
            {isBn ? 'বন্ধ করো' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  const currentCq = cqs[Math.min(currentIndex, cqs.length - 1)];
  const format = resolveCqFormat(currentCq, activeQuiz.subjectId);
  const parts = buildCqParts(currentCq, format, language);
  const boardBadge = getCleanCqBoard(currentCq);
  const practicedCount = Object.values(practicedMap).filter(Boolean).length;
  const isCurrentPracticed = Boolean(practicedMap[currentCq.id]);

  const allCurrentPartsRevealed =
    parts.length > 0 && parts.every((p) => Boolean(revealedMap[`${currentCq.id}:${p.key}`]));

  const togglePartAnswer = (partKey: PartKey) => {
    const k = `${currentCq.id}:${partKey}`;
    setRevealedMap((prev) => ({ ...prev, [k]: !prev[k] }));
  };

  const toggleAllAnswersForCurrent = () => {
    const nextVal = !allCurrentPartsRevealed;
    setRevealedMap((prev) => {
      const copy = { ...prev };
      parts.forEach((p) => {
        copy[`${currentCq.id}:${p.key}`] = nextVal;
      });
      return copy;
    });
  };

  const handleSendReport = () => {
    submitQuestionReport({
      questionId: currentCq.id,
      subjectId: activeQuiz.subjectId,
      subjectName: trText(activeQuiz.subjectName, 'bn'),
      chapterId: activeQuiz.chapterId,
      chapterName: trText(activeQuiz.chapterName, 'bn'),
      questionText: `[CQ] ${trText(currentCq.stem, 'bn').slice(0, 180)}`,
      options: parts.map((p) => `${p.label}) ${p.qText}`).slice(0, 4),
      currentAns: 0,
      issueType: reportIssueType,
      comment: reportComment.trim() || reportIssueType,
      reportedBy: userName,
    });
    setReportComment('');
    setReportSentMsg(isBn ? 'রিপোর্ট পাঠানো হয়েছে।' : 'Report submitted.');
    setTimeout(() => {
      setReportOpen(false);
      setReportSentMsg(null);
    }, 1100);
  };

  const formatPillLabel =
    format === 'cq3'
      ? isBn
        ? 'সৃজনশীল • ১০ নম্বর (২+৪+৪)'
        : 'CQ • 10 Marks (2+4+4)'
      : format === 'cq4'
      ? isBn
        ? 'সৃজনশীল • ১০ নম্বর (১+২+৩+৪)'
        : 'CQ • 10 Marks (1+2+3+4)'
      : format === 'english'
      ? 'Passage / Written'
      : isBn
      ? 'লিখিত অনুশীলন'
      : 'Written Practice';

  const stemHeading =
    format === 'english'
      ? 'Passage / Context'
      : format === 'written'
      ? isBn
        ? 'বিষয়বস্তু / নির্দেশনা'
        : 'Context / Instructions'
      : isBn
      ? `উদ্দীপক #${toBnNumber(currentIndex + 1)}`
      : `Stem #${currentIndex + 1}`;

  return (
    <div
      className="ev-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      style={{ alignItems: 'flex-start', padding: '10px', overflowY: 'auto' }}
    >
      <div style={{ width: '100%', maxWidth: 1040, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 28 }}>
        {/* Sticky Header */}
        <div
          className="ev-card"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            padding: '10px 14px',
            marginBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {trText(activeQuiz.subjectName, language)}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {trText(activeQuiz.chapterName, language)}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <button
                type="button"
                className={`ev-btn ev-btn-sm ${allCurrentPartsRevealed ? 'ev-btn-primary' : 'ev-btn-soft'}`}
                onClick={toggleAllAnswersForCurrent}
              >
                {allCurrentPartsRevealed
                  ? isBn
                    ? 'উত্তর লুকাও'
                    : 'Hide All'
                  : isBn
                  ? 'সব উত্তর দেখো'
                  : 'Show All'}
              </button>

              <button
                type="button"
                className="ev-btn ev-btn-secondary ev-btn-sm"
                style={{ width: 32, height: 32, padding: 0, borderRadius: 10 }}
                onClick={onClose}
                aria-label="Close CQ Reader"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              {isBn
                ? `সৃজনশীল ${toBnNumber(currentIndex + 1)} / ${toBnNumber(cqs.length)}`
                : `CQ ${currentIndex + 1} / ${cqs.length}`}{' '}
              • {isBn ? `পড়া হয়েছে: ${toBnNumber(practicedCount)}টি` : `Practiced: ${practicedCount}`}
            </span>

            <button
              type="button"
              onClick={() => setNavOpenMobile((p) => !p)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--brand-primary)',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {isBn ? (navOpenMobile ? 'তালিকা লুকাও ▲' : 'প্রশ্ন তালিকা ▼') : navOpenMobile ? 'Hide ▲' : 'Questions ▼'}
            </button>
          </div>

          <div className="ev-progress-track" style={{ height: 5 }}>
            <div
              className="ev-progress-fill"
              style={{ width: `${Math.round(((currentIndex + 1) / Math.max(1, cqs.length)) * 100)}%` }}
            />
          </div>

          {navOpenMobile && (
            <div style={{ paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
              <div className="ev-palette-grid" style={{ maxHeight: 150, overflowY: 'auto' }}>
                {cqs.map((item, idx) => {
                  const isDone = Boolean(practicedMap[item.id]);
                  const dotCls = idx === currentIndex ? 'is-current' : isDone ? 'is-correct' : '';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`ev-palette-dot ${dotCls}`}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setNavOpenMobile(false);
                        setReportOpen(false);
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main CQ Layout */}
        <div className="ev-quiz-layout">
          <div className="ev-card ev-question-card" style={{ padding: '16px' }}>
            {/* Top Badges & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span className="ev-badge-pill ev-badge-indigo">{formatPillLabel}</span>
                {boardBadge && <span className="ev-badge-pill ev-badge-warning">{boardBadge}</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  type="button"
                  className={`ev-btn ev-btn-sm ${isCurrentPracticed ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                  onClick={() =>
                    setPracticedMap((prev) => ({
                      ...prev,
                      [currentCq.id]: !prev[currentCq.id],
                    }))
                  }
                >
                  {isCurrentPracticed
                    ? isBn
                      ? 'পড়া হয়েছে ✓'
                      : 'Practiced ✓'
                    : isBn
                    ? 'পড়া হয়েছে মার্ক করো'
                    : 'Mark Practiced'}
                </button>
                <button
                  type="button"
                  className="ev-btn ev-btn-danger ev-btn-sm"
                  onClick={() => setReportOpen((p) => !p)}
                >
                  {isBn ? 'রিপোর্ট' : 'Report'}
                </button>
              </div>
            </div>

            {/* Report Panel */}
            {reportOpen && (
              <div
                style={{
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 12,
                  background: 'var(--status-danger-bg)',
                  border: '1px solid var(--status-danger-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--status-danger-text)' }}>
                  {isBn ? 'এই সৃজনশীল প্রশ্নে ভুল রিপোর্ট করো' : 'Report CQ Issue'}
                </div>
                <select className="ev-select" value={reportIssueType} onChange={(e) => setReportIssueType(e.target.value)}>
                  <option value="উত্তর বা সমাধানে ভুল আছে">{isBn ? 'উত্তর বা সমাধানে ভুল আছে' : 'Incorrect Solution'}</option>
                  <option value="উদ্দীপক বা সমীকরণে বানান ভুল">{isBn ? 'উদ্দীপক বা সমীকরণে বানান ভুল' : 'Typo / Equation Error'}</option>
                  <option value="প্রশ্ন অসম্পূর্ণ">{isBn ? 'প্রশ্ন অসম্পূর্ণ' : 'Incomplete Question'}</option>
                </select>
                <input
                  type="text"
                  className="ev-input"
                  placeholder={isBn ? 'বিস্তারিত মন্তব্য লেখো...' : 'Write details...'}
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                />
                {reportSentMsg ? (
                  <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--status-success)' }}>{reportSentMsg}</div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => setReportOpen(false)}>
                      {isBn ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button type="button" className="ev-btn ev-btn-primary ev-btn-sm" onClick={handleSendReport}>
                      {isBn ? 'পাঠাও' : 'Submit'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Optional Custom Title (great for English / Written prompts) */}
            {currentCq.title && trText(currentCq.title, language) && (
              <div style={{ fontWeight: 800, fontSize: 15.5, color: 'var(--text-primary)', marginBottom: 8 }}>
                {trText(currentCq.title, language)}
              </div>
            )}

            {/* Stem / উদ্দীপক Box */}
            {trText(currentCq.stem, language).trim() && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'var(--bg-surface-muted)',
                  border: '1px solid var(--border-default)',
                  borderLeft: '3.5px solid var(--brand-primary)',
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--brand-primary)', marginBottom: 6 }}>
                  {stemHeading}
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    fontWeight: 600,
                    lineHeight: 1.7,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-line',
                    overflowX: 'auto',
                  }}
                >
                  {trText(currentCq.stem, language)}
                </div>
              </div>
            )}

            {/* Sub-questions (ক, খ, গ, ঘ) with Individual Reveal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {parts.map((part) => {
                const isRevealed = Boolean(revealedMap[`${currentCq.id}:${part.key}`]);
                return (
                  <div
                    key={part.key}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 10,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 14.5,
                            fontWeight: 700,
                            lineHeight: 1.6,
                            color: 'var(--text-primary)',
                            whiteSpace: 'pre-line',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 24,
                              height: 24,
                              padding: '0 6px',
                              borderRadius: 7,
                              background: 'var(--brand-primary-soft)',
                              color: 'var(--brand-primary)',
                              fontWeight: 800,
                              fontSize: 12.5,
                              marginRight: 8,
                            }}
                          >
                            {part.label}
                          </span>
                          {part.qText}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {part.mark !== undefined && (
                          <span className="ev-badge-pill ev-badge-neutral font-mono" style={{ fontSize: 11 }}>
                            {isBn ? toBnNumber(part.mark) : part.mark}
                          </span>
                        )}
                        {part.aText && (
                          <button
                            type="button"
                            className={`ev-btn ev-btn-sm ${isRevealed ? 'ev-btn-primary' : 'ev-btn-soft'}`}
                            onClick={() => togglePartAnswer(part.key)}
                          >
                            {isRevealed ? (isBn ? 'লুকাও' : 'Hide') : isBn ? 'উত্তর' : 'Answer'}
                          </button>
                        )}
                      </div>
                    </div>

                    {isRevealed && part.aText && (
                      <div
                        className="ev-explanation-box"
                        style={{
                          marginTop: 10,
                          whiteSpace: 'pre-line',
                          lineHeight: 1.72,
                          overflowX: 'auto',
                        }}
                      >
                        <strong style={{ display: 'block', marginBottom: 4, color: 'var(--brand-primary)' }}>
                          {isBn ? `${part.label}-নং প্রশ্নের উত্তর:` : `Answer (${part.label}):`}
                        </strong>
                        {part.aText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Prev / Next Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                marginTop: 16,
                paddingTop: 14,
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                className="ev-btn ev-btn-secondary"
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex((i) => Math.max(0, i - 1));
                  setReportOpen(false);
                }}
              >
                ← {isBn ? 'পূর্ববর্তী' : 'Previous'}
              </button>

              {currentIndex < cqs.length - 1 ? (
                <button
                  type="button"
                  className="ev-btn ev-btn-primary"
                  onClick={() => {
                    setCurrentIndex((i) => Math.min(cqs.length - 1, i + 1));
                    setReportOpen(false);
                  }}
                >
                  {isBn ? 'পরবর্তী' : 'Next'} →
                </button>
              ) : (
                <button type="button" className="ev-btn ev-btn-primary" onClick={onClose}>
                  {isBn ? 'সম্পন্ন ✓' : 'Done ✓'}
                </button>
              )}
            </div>
          </div>

          {/* Side Navigator */}
          <div className="ev-card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>
              {isBn ? 'সৃজনশীল নেভিগেটর' : 'CQ Navigator'}
            </div>
            <div className="ev-palette-grid">
              {cqs.map((item, idx) => {
                const isDone = Boolean(practicedMap[item.id]);
                const dotCls = idx === currentIndex ? 'is-current' : isDone ? 'is-correct' : '';
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`ev-palette-dot ${dotCls}`}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setReportOpen(false);
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="ev-btn ev-btn-secondary"
              style={{ width: '100%', marginTop: 14 }}
              onClick={onClose}
            >
              {isBn ? 'বন্ধ করো' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CqReaderView;
