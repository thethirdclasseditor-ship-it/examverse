import React, { useSyncExternalStore } from 'react';
import { HSC_ACCOUNTING_2ND_PAPER_CHAPTERS } from '../data/syllabusData';
import * as RawSupabase from '../lib/supabase';
import { HSC_ACCOUNTING_1ST_PAPER_CHAPTERS } from '../data/accounting1Data';
import { HSC_BANGLA_1ST_ALL_2000_CHAPTERS } from '../data/bangla1Batch4PoetryData';
import { HSC_ICT_CHAPTERS } from '../data/hscIctData';
import { ActiveQuizConfig, ChapterData, ChapterFormula, CommunityPost, CQQuestion, ExamHistoryItem, FlashcardItem, LanguageMode, LocalizedText, MCQQuestion, MistakeItem, RankProgressInfo, StudyTask, SubjectData,
} from '../types';
export type NavTabId = | 'dashboard'
| 'subjects'
| 'Analytics'
| 'mistakes'
| 'flashcards'
| 'formulas'
| 'planner'
| 'battle'
| 'community'
| 'leaderboard'
| 'achievements'
| 'admin';
export interface QuestionErrorReport { id: string;
questionId: string;
subjectId: string;
subjectName: string;
chapterId: string;
chapterName: string;
questionText: string;
options: string[];
currentAns: number;
currentCorrectIndex: number;
suggestedCorrectIndex: number;
issueType: string;
comment: string;
note: string;
reportedBy: string;
reportedAt: string;
createdAt: string;
status: 'pending' | 'verified' | 'rejected' | 'resolved'; }
export interface MCQ { id: string;
question: string;
options: [string, string, string, string];
correctIndex: number;
explanation: string;
board?: string; }
export interface CQ { id: string;
stem: string;
board?: string;
qA: string;
ansA: string;
qB: string;
ansB: string;
qC: string;
ansC: string;
qD: string;
ansD: string; }
export interface Chapter { id: string;
name: string;
mcqs: MCQ[];
cqs: CQ[];
formulas?: string[]; }
export { HSC_ACCOUNTING_1ST_PAPER_CHAPTERS, HSC_ICT_CHAPTERS };
const NON_MATH_CHAPTER_IDS = new Set(['acc1-c5']);
function convertLegacyChapters( chapters: Chapter[], subjPrefix: string, allowFormulas = true ): ChapterData[] { return (chapters || []).map((ch, cIdx): ChapterData => { const rawFormulas =
allowFormulas && !NON_MATH_CHAPTER_IDS.has(ch.id) ? ch.formulas || [] : [];
const formulas: ChapterFormula[] = rawFormulas.map((fStr, fIdx) => { const parts = fStr.split(':');
const hasTitle = parts.length > 1 && parts[0].length < 52;
const titleText = hasTitle ? parts[0].trim() : `গাণিতিক সূত্র #${fIdx + 1}`;
const bodyText = hasTitle ? parts.slice(1).join(':').trim() : fStr;
return { id: `${subjPrefix}-f-${cIdx + 1}-${fIdx + 1}`, title: { bn: titleText, en: titleText }, formula: bodyText, }; });
const mcqs: MCQQuestion[] = (ch.mcqs || []).map((m): MCQQuestion => ({ id: m.id, q: { bn: m.question, en: m.question }, options: { bn: [...m.options], en: [...m.options] }, ans: m.correctIndex,
explanation: { bn: m.explanation || '', en: m.explanation || '' }, boardTag: m.board, }));
const cqs: CQQuestion[] = (ch.cqs || []).map((c): CQQuestion => ({ id: c.id, stem: { bn: c.stem, en: c.stem }, a: { bn: c.qA, en: c.qA }, b: { bn: c.qB, en: c.qB }, c: { bn: c.qC, en: c.qC }, d: { bn: c.qD, en: c.qD },
ansA: { bn: c.ansA, en: c.ansA }, ansB: { bn: c.ansB, en: c.ansB }, ansC: { bn: c.ansC, en: c.ansC }, ansD: { bn: c.ansD, en: c.ansD }, boardTag: c.board, }));
return { id: ch.id, name: { bn: ch.name, en: ch.name }, mcqs, cqs, formulas, }; }); }
const ch = (id: string, name: string, formulas: string[] = []): Chapter => ({ id, name, mcqs: [], cqs: [], formulas, });
const mkSubj = ( id: string, bn: string, en: string, icon: string, color: string, rgb: string, chapters: Chapter[], allowFormulas = true ): SubjectData => ({ id, name: { bn, en }, icon, color, rgb,
chapters: convertLegacyChapters(chapters, id, allowFormulas), });
const _S01 = { id: 'hsc-bn-1', name: { bn: 'বাংলা ১ম পত্র (Code: 101)', en: 'Bangla 1st Paper (HSC - 101)' }, icon: '📖', color: '#E11D48', rgb: '225, 29, 72',
chapters: convertLegacyChapters(HSC_BANGLA_1ST_ALL_2000_CHAPTERS, 'bn1', false), };
const _S02 = mkSubj('hsc-bn-2', 'বাংলা ২য় পত্র (Code: 102)', 'Bangla 2nd Paper (HSC - 102)', '✍️', '#059669', '5, 150, 105', [ ch('bn2-c1', '১ম ও ২য় অধ্যায়: বাংলা উচ্চারণের নিয়ম ও বাংলা বানানের নিয়ম'),
ch('bn2-c2', '৩য় ও ৪র্থ অধ্যায়: ব্যাকরণিক শব্দশ্রেণি, উপসর্গ, প্রত্যয় ও সমাস'), ch('bn2-c3', '৫ম ও ৬ষ্ঠ অধ্যায়: বাক্যতত্ত্ব এবং বাংলা ভাষার অপপ্রয়োগ ও শুদ্ধ প্রয়োগ'),
ch('bn2-c4', 'নির্মিতি অংশ: পারিভাষিক শব্দ, অনুবাদ, দিনলিপি, প্রতিবেদন, ই-মেইল, আবেদনপত্র, সারাংশ, ভাবসম্প্রসারণ ও প্রবন্ধ'), ], false);
const _S03 = mkSubj('hsc-en-1', 'English 1st Paper (Code: 107)', 'English 1st Paper (HSC - 107)', '🌐', '#2563EB', '37, 99, 235', [
ch('en1-c1', 'Unit 1–5: People Making History, Dreams, Lifestyle, Adolescence & Youthful Achievers'), ch('en1-c2', 'Unit 6–10: Relationships, Human Rights, Environment & Nature, Folk Art & Myths'),
ch('en1-c3', 'Part B: Flow Chart, Summary Writing, Cloze Test, Rearranging & Graph/Chart Analysis'), ], false);
const _S04 = mkSubj('hsc-en-2', 'English 2nd Paper (Code: 108)', 'English 2nd Paper (HSC - 108)', '🔤', '#1D4ED8', '29, 78, 216', [
ch('en2-c1', 'Grammar Part 1: Articles, Prepositions, Special Phrases & Completing Sentences'), ch('en2-c2', 'Grammar Part 2: Right Form of Verbs, Narration, Modifiers, Connectors, Synonym-Antonym & Punctuation'),
ch('en2-c3', 'Composition Part: Formal Application, E-mail, Report Writing, Paragraph & Essay'), ], false);
const _S05 = { id: 'hsc-ict', name: { bn: 'তথ্য ও যোগাযোগ প্রযুক্তি - ICT (Code: 275)', en: 'ICT (HSC - 275)' }, icon: '💻', color: '#0284C7', rgb: '2, 132, 199',
chapters: convertLegacyChapters(HSC_ICT_CHAPTERS, 'h-ict', true), };
const _S06 = { id: 'acc-1', name: { bn: 'হিসাববিজ্ঞান ১ম পত্র (Code: 253)', en: 'Accounting 1st Paper (HSC - 253)' }, icon: '📘', color: '#4F46E5', rgb: '79, 70, 229',
chapters: convertLegacyChapters(HSC_ACCOUNTING_1ST_PAPER_CHAPTERS, 'acc1', true), };
const _S07 = { id: 'acc-2', name: { bn: 'হিসাববিজ্ঞান ২য় পত্র (Code: 254)', en: 'Accounting 2nd Paper (HSC - 254)' }, icon: '📊', color: '#D97706', rgb: '217, 119, 6',
chapters: convertLegacyChapters(HSC_ACCOUNTING_2ND_PAPER_CHAPTERS, 'acc2', true), };
const _S08 = mkSubj('bom-1', 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র (Code: 277)', 'Business Org. & Management 1st Paper (HSC - 277)', '🏢', '#059669', '5, 150, 105', [
ch('bom1-c1', '১ম–৪র্থ অধ্যায়: ব্যবসায়ের মৌলিক ধারণা, পরিবেশ, একমালিকানা ও অংশীদারি ব্যবসায়'), ch('bom1-c2', '৫ম–৭ম অধ্যায়: যৌথ মূলধনী ব্যবসায় (কোম্পানি), সমবায় সমিতি ও রাষ্ট্রীয় ব্যবসায়'),
ch('bom1-c3', '৮ম–১২শ অধ্যায়: আইনগত দিক, সহায়ক সেবা, ব্যবসায় উদ্যোগ, তথ্যপ্রযুক্তি ও ব্যবসায় নৈতিকতা (CSR)'), ], false);
const _S09 = mkSubj('bom-2', 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র (Code: 278)', 'Business Org. & Management 2nd Paper (HSC - 278)', '📋', '#0D9488', '13, 148, 136', [
ch('bom2-c1', '১ম–৩য় অধ্যায়: ব্যবস্থাপনার ধারণা, ব্যবস্থাপনার নীতি ও পরিকল্পনা প্রণয়ন'), ch('bom2-c2', '৪র্থ–৭ম অধ্যায়: সাংগঠনিক কাঠামো, কর্মীসংস্থান, নেতৃত্ব ও প্রেষণা'),
ch('bom2-c3', '৮ম–১০ম অধ্যায়: যোগাযোগ, সমন্বয় সাধন ও নিয়ন্ত্রণ'), ], false);
const _S10 = mkSubj('fin-1', 'ফিন্যান্স, ব্যাংকিং ও বিমা ১ম পত্র (Code: 292)', 'Finance, Banking & Insurance 1st Paper (HSC - 292)', '💰', '#7C3AED', '124, 58, 237', [
ch('fin1-c1', '১ম ও ২য় অধ্যায়: অর্থায়নের সূচনা ও আর্থিক বাজারের আইনগত দিক'),
ch('fin1-c3', '৩য় অধ্যায়: অর্থের সময়মূল্য (Time Value of Money)', [ 'এককালীন ভবিষ্যৎ ও বর্তমান মূল্য: FV = PV(1 + i)ⁿ এবং PV = FV ÷ (1 + i)ⁿ', 'একাধিকবার চক্রবৃদ্ধি ও প্রকৃত সুদের হার (EAR): FV = PV(1 + i/m)^(n×m) | EAR = (1 + i/m)ᵐ - 1', 'সাধারণ বার্ষিকী (Ordinary Annuity): PVA = A × [{1 - (1 + i)⁻ⁿ} ÷ i] | FVA = A × [{(1 + i)ⁿ - 1} ÷ i]', 'অগ্রিম বার্ষিকী (Annuity Due): PVA(due) = PVA(ordinary) × (1 + i) | FVA(due) = FVA(ordinary) × (1 + i)', 'চিরস্থায়ী বৃত্তি ও বিধি ৭২ (Rule 72): চিরস্থায়ী বৃত্তি PV = A ÷ i | টাকা দ্বিগুণ হওয়ার সময় n = 72 ÷ সুদের হার (%)', ]),
ch('fin1-c4', '৪র্থ অধ্যায়: আর্থিক বিশ্লেষণ (সমচ্ছেদ ও লিভারেজ বিশ্লেষণ)', [ 'সমচ্ছেদ বিন্দু (একক ও টাকায়): BEP (একক) = FC ÷ (P - VC) | BEP (টাকা) = FC ÷ CMR', 'নিরাপত্তা প্রান্ত ও লিভারেজ: MS = প্রকৃত বিক্রয় - সমচ্ছেদ বিক্রয় | DOL = CM ÷ EBIT | DFL = EBIT ÷ (EBIT - I)', ]),
ch('fin1-c5', '৫ম অধ্যায়: স্বল্প ও মধ্যমেয়াদি অর্থায়ন', [ 'ব্যবসায় ঋণের ব্যয় (Cost of Trade Credit): Ktc = [d ÷ (100 - d)] × [360 ÷ (CP - DP)] × 100%', 'মিতব্যয়ী ফরমাস পরিমাণ (EOQ): EOQ = √(2AO ÷ C) | পুনঃফরমাস স্তর ROL = দৈনিক গড় ব্যবহার × লিড টাইম', ]),
ch('fin1-c6', '৬ষ্ঠ অধ্যায়: দীর্ঘমেয়াদি অর্থায়ন (বন্ড ও শেয়ার মূল্যায়ন)', [ 'বন্ডের বর্তমান মূল্য: চিরস্থায়ী বন্ড Vb = I ÷ kd | পরিশোধযোগ্য বন্ড Vb = I × [{1 - (1 + kd)⁻ⁿ} ÷ kd] + [MV ÷ (1 + kd)ⁿ]', 'মেয়াদপূর্তিতে আয়ের হার (YTM): YTM ≈ [I + {(RV - SV) ÷ n}] ÷ [(RV + SV) ÷ 2] × 100%', ]),
ch('fin1-c7', '৭ম অধ্যায়: মূলধন ব্যয় (Cost of Capital)', [ 'ঋণ ও অগ্রাধিকার শেয়ার ব্যয়: করপরবর্তী ঋণ ব্যয় Kd = Ki(1 - t) | অগ্রাধিকার শেয়ার ব্যয় Kp = Dp ÷ (P₀ - F) × 100%', 'সাধারণ শেয়ার ব্যয় ও WACC: Ke = [D₁ ÷ (P₀ - F)] + g | ভারযুক্ত গড় মূলধন ব্যয় WACC = WeKe + WpKp + WdKd', ]),
ch('fin1-c8', '৮ম অধ্যায়: মূলধন বাজেটিং ও বিনিয়োগ সিদ্ধান্ত', [ 'গড় মুনাফার হার (ARR) ও পে-ব্যাক সময় (PBP): ARR = (গড় নিট মুনাফা ÷ গড় বিনিয়োগ) × ১০০% | PBP = NCO ÷ NCB', 'নিট বর্তমান মূল্য (NPV) ও আন্তঃআয়ের হার (IRR): NPV = Σ[CFt ÷ (1 + k)ᵗ] - NCO | IRR = LR + [NPV_LR ÷ (NPV_LR - NPV_HR)] × (HR - LR)', ]),
ch('fin1-c9', '৯ম অধ্যায়: ঝুঁকি ও মুনাফার হার', [ 'আদর্শ বিচ্যুতি (σ) ও বিভেদাঙ্ক (CV): σ = √[Σ(Ri - R̄)² ÷ (n - 1)] | CV = (σ ÷ R̄) × 100%', 'CAPM মডেল: প্রত্যাশিত আয়ের হার E(Ri) = Rf + βi(Rm - Rf)', ]), ]);
const _S11 = mkSubj('fin-2', 'ফিন্যান্স, ব্যাংকিং ও বিমা ২য় পত্র (Code: 293)', 'Finance, Banking & Insurance 2nd Paper (HSC - 293)', '🏦', '#2563EB', '37, 99, 235', [
ch('fin2-c1', '১ম–৫ম অধ্যায়: ব্যাংক ব্যবস্থা, কেন্দ্রীয় ব্যাংক, বাণিজ্যিক ব্যাংক, ব্যাংক হিসাব ও হস্তান্তরযোগ্য দলিল'),
ch('fin2-c2', '৬ষ্ঠ–৯ম অধ্যায়: চেক-বিনিময় বিল, ব্যাংক তহবিল, বৈদেশিক বিনিময় (L/C) ও ইলেকট্রনিক ব্যাংকিং'), ch('fin2-c3', '১০ম–১৪শ অধ্যায়: বিমার মৌলিক ধারণা, জীবন বিমা, নৌ বিমা, অগ্নি বিমা ও বিবিধ বিমা'), ], false);
const _S12 = mkSubj('mkt-1', 'উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম পত্র (Code: 286)', 'Production Management & Marketing 1st Paper (HSC - 286)', '🏭', '#D97706', '217, 119, 6', [
ch('mkt1-c1', '১ম অধ্যায়: উৎপাদন ও উৎপাদনশীলতা (গাণিতিক অধ্যায়)', [ 'মোট ও আর্থিক উৎপাদনশীলতা: মোট উৎপাদনশীলতা = মোট উৎপাদনের মূল্য ÷ মোট উপাদানের মূল্য', 'শ্রম, যন্ত্র ও কাঁচামালের উৎপাদনশীলতা: শ্রম উৎপাদনশীলতা = মোট উৎপাদন একক ÷ মোট শ্রম ঘণ্টা | কাঁচামালের উৎপাদনশীলতা = উৎপাদনের মূল্য ÷ কাঁচামালের মূল্য', ]),
ch('mkt1-c2', '২য় ও ৩য় অধ্যায়: উৎপাদনের উপকরণ ও উৎপাদনের মাত্রা'),
ch('mkt1-c4', '৪র্থ অধ্যায়: সামষ্টিক ও ব্যষ্টিক পর্যায়ে উৎপাদন (জাতীয় আয় অংক)', [ 'জাতীয় আয় নির্ণয় সূত্র: GDP = C + I + G + (X - M) | GNP = GDP + (X - M বা নিট বৈদেশিক আয়) | NNP = GNP - অবচয় (CCA)', ]),
ch('mkt1-c5', '৫ম, ৬ষ্ঠ ও ৭ম অধ্যায়: উৎপাদন ব্যবস্থাপনা, পণ্য ডিজাইন ও মান ব্যবস্থাপনা'),
ch('mkt1-c8', '৮ম অধ্যায়: উৎপাদন ক্ষমতা (গাণিতিক অধ্যায়)', [ 'উৎপাদন ক্ষমতা ব্যবহারের হার: দক্ষতা = (প্রকৃত উৎপাদন ÷ কার্যকর ক্ষমতা) × ১০০% | ক্ষমতা সদ্ব্যবহার = (প্রকৃত উৎপাদন ÷ সর্বোচ্চ ক্ষমতা) × ১০০%', ]),
ch('mkt1-c9', '৯ম ও ১০ম অধ্যায়: ব্যবসায়ের অবস্থান ও বিন্যাস'), ]);
const _S13 = mkSubj('mkt-2', 'উৎপাদন ব্যবস্থাপনা ও বিপণন ২য় পত্র (Code: 287)', 'Production Management & Marketing 2nd Paper (HSC - 287)', '🛒', '#EA580C', '234, 88, 12', [
ch('mkt2-c1', '১ম–৫ম অধ্যায়: বিপণন পরিচিতি, বিপণন পরিবেশ, কার্যাবলি, বাজার বিভক্তিকরণ ও বিপণন মিশ্রণ (4Ps)'),
ch('mkt2-c2', '৬ষ্ঠ–১০ম অধ্যায়: পণ্য বণ্টন প্রণালি, পাইকারি ও খুচরা ব্যবসায়, বিজ্ঞাপন, ব্যক্তিক বিক্রয় ও সমসাময়িক বিপণন'), ], false);
const _S14 = mkSubj('phy-1', 'পদার্থবিজ্ঞান ১ম পত্র (Code: 174)', 'Physics 1st Paper (HSC - 174)', '⚛️', '#4F46E5', '79, 70, 229', [
ch('phy1-c1', '১ম ও ২য় অধ্যায়: ভৌত জগৎ ও পরিমাপ এবং ভেক্টর', [ 'ভেক্টর লব্ধির মান ও দিক: R = √(P² + Q² + 2PQ cosα), tanθ = (Q sinα) ÷ (P + Q cosα)', 'ডট ও ক্রস গুণন এবং নদী-নৌকা: A · B = AB cosθ, |A × B| = AB sinθ | ন্যূনতম সময়ে নদী পারাপার t_min = d ÷ v', ]),
ch('phy1-c2', '৩য় ও ৪র্থ অধ্যায়: গতিবিদ্যা ও নিউটনীয় বলবিদ্যা', [ 'প্রাসের সমীকরণ: সর্বাধিক উচ্চতা H = (v₀² sin²θ₀) ÷ 2g, বিচরণকাল T = (2v₀ sinθ₀) ÷ g, পাল্লা R = (v₀² sin 2θ₀) ÷ g', 'বলবিদ্যা, টর্ক ও ব্যাংকিং কোণ: F = ma, L = Iω, τ = Iα, কেন্দ্রমুখী বল Fc = mv² ÷ r, ব্যাংকিং কোণ tanθ = v² ÷ rg = h ÷ w', ]),
ch('phy1-c3', '৫ম, ৬ষ্ঠ ও ৭ম অধ্যায়: কাজ-শক্তি-ক্ষমতা, মহাকর্ষ ও অভিকর্ষ এবং পদার্থের গাঠনিক ধর্ম', [ 'কাজ, গতিশক্তি ও কর্মদক্ষতা: W = Fs cosθ, Ek = ½mv² = p² ÷ 2m, স্প্রিং শক্তি Ep = ½kx², দক্ষতা η = (কার্যকর ক্ষমতা ÷ প্রদত্ত ক্ষমতা) × 100%', 'মহাকর্ষ ও স্থিতিস্থাপকতা: মুক্তিবেগ ve = √(2gR) ≈ 11.2 km/s, উচ্চতায় g′ = g[R/(R+h)]², গভীরতায় g′ = g(1 - d/R) | ইয়ংয়ের গুণাঙ্ক Y = FL ÷ (AΔl)', ]),
ch('phy1-c4', '৮ম, ৯ম ও ১০ম অধ্যায়: পর্যায়বৃত্ত গতি, তরঙ্গ এবং আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', [ 'সরল ছন্দিত গতি ও দোলক: বেগ v = ω√(A² - x²), ত্বরণ a = -ω²x, সরল দোলকের দোলনকাল T = 2π√(L ÷ g)', 'তরঙ্গ ও আদর্শ গ্যাস: v = fλ, বিট N = |f₁ - f₂|, তীব্রতা লেভেল β = 10 log₁₀(I/I₀) dB | PV = nRT, RMS বেগ c = √(3RT/M) = √(3P/ρ), গতিশক্তি E = (3/2)nRT', ]),
]);
const _S15 = mkSubj('phy-2', 'পদার্থবিজ্ঞান ২য় পত্র (Code: 175)', 'Physics 2nd Paper (HSC - 175)', '⚡', '#0284C7', '2, 132, 199', [
ch('phy2-c1', '১ম, ২য় ও ৩য় অধ্যায়: তাপগতিবিদ্যা, স্থির তড়িৎ ও চল তড়িৎ', [ 'তাপগতিবিদ্যা ও কার্নো ইঞ্জিন: dQ = dU + P dV, রুদ্ধতাপীয় প্রক্রিয়া PV^γ = ধ্রুবক, দক্ষতা η = (1 - T₂/T₁) × 100%, এনট্রপি dS = dQ ÷ T', 'স্থির ও চল তড়িৎ: কুলম্ব বল F = (1/4πε₀)(q₁q₂/r²), ধারকের শক্তি U = ½CV², জুলের তাপ H = I²Rt, শান্ট প্রবাহ Is = IG ÷ (G + S), হুইটস্টোন ব্রিজ P/Q = R/S', ]),
ch('phy2-c2', '৪র্থ, ৫ম, ৬ষ্ঠ ও ৭ম অধ্যায়: চৌম্বক ক্রিয়া, তাড়িতচৌম্বক আবেশ, জ্যামিতিক ও ভৌত আলোকবিজ্ঞান', [ 'চুম্বক ও পরিবর্তী প্রবাহ: B = μ₀I ÷ (2πa), লরেন্টজ বল F = qvB sinθ, ফ্যারাডের সূত্র ε = -N(dΦ/dt), RMS প্রবাহ I_rms = I₀ ÷ √2 = 0.707 I₀', 'লেন্স, প্রিজম ও ব্যতিচার: 1/f = (μ - 1)(1/r₁ - 1/r₂), প্রিজম μ = sin[(A+δm)/2] ÷ sin(A/2) | ডোরার ব্যবধান Δx = λD ÷ a, প্রস্থ = λD ÷ 2a', ]),
ch('phy2-c3', '৮ম–১১শ অধ্যায়: আধুনিক পদার্থবিজ্ঞান, নিউক্লিয়ার পদার্থবিজ্ঞান, সেমিকন্ডাক্টর ও জ্যোতির্বিজ্ঞান', [ 'আপেক্ষিকতা ও কোয়ান্টাম: কাল দীর্ঘায়ন t = t₀ ÷ √(1 - v²/c²), E = mc², ফটোইলেকট্রিক সমীকরণ hf = hf₀ + Ek(max), ডি ব্রগলি λ = h ÷ mv', 'তেজস্ক্রিয়তা ও ট্রানজিস্টর: N = N₀e^(-λt), অর্ধায়ু T_½ = 0.693 ÷ λ, গড় আয়ু τ = 1 ÷ λ | ট্রানজিস্টর IE = IB + IC, প্রবাহ বিবর্ধন β = IC ÷ IB', ]),
]);
const _S16 = mkSubj('chem-1', 'রসায়ন ১ম পত্র (Code: 176)', 'Chemistry 1st Paper (HSC - 176)', '🧪', '#059669', '5, 150, 105', [ ch('chem1-c1', '১ম অধ্যায়: ল্যাবরেটরির নিরাপদ ব্যবহার'),
ch('chem1-c2', '২য় অধ্যায়: গুণগত রসায়ন (গাণিতিক অধ্যায়)', [ 'বোর মডেল ও রিডবার্গ সমীকরণ: কৌণিক ভরবেগ mvr = nh ÷ 2π | 1/λ = R_H × Z² × (1/n₁² - 1/n₂²) [যেখানে R_H = 109678 cm⁻¹]', 'দ্রাব্যতা ও দ্রাব্যতা গুণফল: AxBy লবণের জন্য Ksp = x^x · y^y · S^(x+y) [AB এর জন্য S², AB₂ এর জন্য 4S³, AB₃ এর জন্য 27S⁴]', ]),
ch('chem1-c3', '৩য় অধ্যায়: মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', [ 'সংকরায়ন (Hybridization) সংখ্যা নির্ণয়: H = ½ [কেন্দ্রীয় পরমাণুর যোজ্যতা ইলেকট্রন + একযোজী পরমাণু - ক্যাটায়ন চার্জ + অ্যানায়ন চার্জ]', ]),
ch('chem1-c4', '৪র্থ অধ্যায়: রাসায়নিক পরিবর্তন (গাণিতিক অধ্যায়)', [ 'সাম্যধ্রুবক ও pH সমীকরণ: Kp = Kc(RT)^Δn | pH = -log₁₀[H⁺], pOH = -log₁₀[OH⁻], pH + pOH = 14', 'হেন্ডারসন-হ্যাসেলবাক বাফার সমীকরণ: অম্লীয় বাফার pH = pKa + log₁₀([লবণ] ÷ [অম্ল]) | ক্ষারীয় বাফার pOH = pKb + log₁₀([লবণ] ÷ [ক্ষার])', ]),
ch('chem1-c5', '৫ম অধ্যায়: কর্মমুখী রসায়ন'), ]);
const _S17 = mkSubj('chem-2', 'রসায়ন ২য় পত্র (Code: 177)', 'Chemistry 2nd Paper (HSC - 177)', '⚗️', '#0D9488', '13, 148, 136', [
ch('chem2-c1', '১ম অধ্যায়: পরিবেশ রসায়ন (গাণিতিক অধ্যায়)', [ 'গ্যাস সূত্রসমূহ: P₁V₁ ÷ T₁ = P₂V₂ ÷ T₂ | আদর্শ গ্যাস PV = nRT = (w/M)RT | ঘনত্ব d = PM ÷ RT', 'গ্রাহামের ব্যাপন ও ভ্যানডার ওয়ালস সূত্র: r₁ ÷ r₂ = √(M₂ ÷ M₁) = √(d₂ ÷ d₁) | (P + n²a/V²)(V - nb) = nRT', ]),
ch('chem2-c2', '২য় অধ্যায়: জৈব রসায়ন'),
ch('chem2-c3', '৩য় অধ্যায়: পরিমাণগত রসায়ন (গাণিতিক অধ্যায়)', [ 'মোলারিটি, শতকরা হার ও পিপিএম: S = (1000 × w) ÷ (M × V_mL) | S = (10 × x%) ÷ M | ppm = S × M × 1000', 'টাইট্রেশন ও বিয়ার-ল্যাম্বার্ট সূত্র: e₁V₁S₁ = e₂V₂S₂ | শোষণ A = log₁₀(I₀ ÷ I) = ε c l', ]),
ch('chem2-c4', '৪র্থ অধ্যায়: তড়িৎ রসায়ন (গাণিতিক অধ্যায়)', [ 'ফ্যারাডের তড়িৎ বিশ্লেষণ সূত্র: W = ZIt = (M × I × t) ÷ (n × F) [যেখানে 1 Faraday (F) = 96500 কুলম্ব]', 'প্রমাণ কোষ বিভব ও নার্নস্ট সমীকরণ (25°C): E°_cell = E°_anode(ox) + E°_cathode(red) | E_cell = E°_cell - (0.0592 ÷ n) log₁₀ Q', ]),
ch('chem2-c5', '৫ম অধ্যায়: অর্থনৈতিক রসায়ন'), ]);
const _S18 = mkSubj('math-1', 'উচ্চতর গণিত ১ম পত্র (Code: 265)', 'Higher Math 1st Paper (HSC - 265)', '📐', '#D97706', '217, 119, 6', [
ch('math1-c1', '১ম–৫ম অধ্যায়: ম্যাট্রিক্স ও নির্ণায়ক, ভেক্টর, সরলরেখা, বৃত্ত এবং বিন্যাস ও সমাবেশ', [ 'ম্যাট্রিক্স ও সরলরেখা: A⁻¹ = adj(A) ÷ |A|, ঢাল m = (y₂ - y₁) ÷ (x₂ - x₁), লম্ব দূরত্ব d = |ax₁ + by₁ + c| ÷ √(a² + b²)', 'বৃত্ত ও বিন্যাস-সমাবেশ: x² + y² + 2gx + 2fy + c = 0 বৃত্তের কেন্দ্র (-g,-f) ও ব্যাসার্ধ r = √(g² + f² - c) | ⁿPᵣ = n!/(n-r)!, ⁿCᵣ = n!/[r!(n-r)!]', ]),
ch('math1-c2', '৬ষ্ঠ–১০ম অধ্যায়: ত্রিকোণমিতিক অনুপাত, ফাংশন, অন্তরীকরণ (Differentiation) ও যোগজীকরণ (Integration)', [ 'ত্রিকোণমিতিক সূত্র: s = rθ, ক্ষেত্রফল = ½r²θ | sin(A±B) = sinA cosB ± cosA sinB, sin 2A = 2sinA cosA, cos 2A = cos²A - sin²A', 'অন্তরীকরণ ও যোগজীকরণ: lim(x→0)(sin x/x) = 1, d/dx(xⁿ) = nxⁿ⁻¹, d/dx(ln x) = 1/x | ∫ xⁿ dx = xⁿ⁺¹/(n+1) + c, ∫ u v dx = u∫v dx - ∫[(du/dx)∫v dx]dx', ]),
]);
const _S19 = mkSubj('math-2', 'উচ্চতর গণিত ২য় পত্র (Code: 266)', 'Higher Math 2nd Paper (HSC - 266)', '♾️', '#E11D48', '225, 29, 72', [
ch('math2-c1', '১ম–৬ষ্ঠ অধ্যায়: বাস্তব সংখ্যা, যোগাশ্রয়ী প্রোগ্রাম, জটিল সংখ্যা, বহুপদী, দ্বিপদী বিস্তৃতি ও কণিক', [ 'জটিল সংখ্যা, বহুপদী ও দ্বিপদী: মডুলাস r = √(x² + y²), 1 + ω + ω² = 0, ω³ = 1 | α + β = -b/a, αβ = c/a, D = b² - 4ac | সাধারণ পদ T_(r+1) = ⁿCᵣ aⁿ⁻ʳ xʳ', 'কণিক (পরাবৃত্ত, উপবৃত্ত ও অধিবৃত্ত): পরাবৃত্ত y² = 4ax এর উপকেন্দ্র (a,0) ও উপকেন্দ্রিক লম্ব 4a | উপবৃত্তের উৎকেন্দ্রিকতা e = √(1 - b²/a²) < 1', ]),
ch('math2-c2', '৭ম–১০ম অধ্যায়: বিপরীত ত্রিকোণমিতিক ফাংশন, স্থিতিবিদ্যা, সমতলে বস্তুকণার গতি ও সম্ভাবনা', [ 'বিপরীত ত্রিকোণমিতি ও স্থিতিবিদ্যা: tan⁻¹x + tan⁻¹y = tan⁻¹[(x + y) ÷ (1 - xy)] | লামির উপপাদ্য P/sinα = Q/sinβ = R/sinγ', 'গতিবিদ্যা ও সম্ভাবনা: প্রাসের উচ্চতা H = (u² sin²α)/2g, পাল্লা R = (u² sin 2α)/g | পরিমিত ব্যবধান σ = √[Σx²/n - (Σx/n)²]', ]),
]);
const _S20 = mkSubj('bio-1', 'জীববিজ্ঞান ১ম পত্র - উদ্ভিদবিজ্ঞান (Code: 178)', 'Biology 1st Paper - Botany (HSC - 178)', '🌿', '#10B981', '16, 185, 129', [
ch('bio1-c1', '১ম–৬ষ্ঠ অধ্যায়: কোষ ও এর গঠন, কোষ বিভাজন, কোষ রসায়ন, অণুজীব, শৈবাল-ছত্রাক ও ব্রায়োফাইটা-টেরিডোফাইটা'),
ch('bio1-c2', '৭ম–১২শ অধ্যায়: নগ্নবীজী ও আবৃতবীজী, টিস্যুতন্ত্র, উদ্ভিদ শারীরতত্ত্ব, প্রজনন, জীবপ্রযুক্তি ও পরিবেশ'), ], false);
const _S21 = mkSubj('bio-2', 'জীববিজ্ঞান ২য় পত্র - প্রাণিবিজ্ঞান (Code: 179)', 'Biology 2nd Paper - Zoology (HSC - 179)', '🧬', '#059669', '5, 150, 105', [
ch('bio2-c1', '১ম–৬ষ্ঠ অধ্যায়: প্রাণীর শ্রেণিবিন্যাস, হাইড্রা-ঘাসফড়িং-রুই মাছ, পরিপাক ও শোষণ, রক্ত সংবহন, শ্বসন ও রেচন'),
ch('bio2-c2', '৭ম–১২শ অধ্যায়: চলন ও অঙ্গচালনা, সমন্বয় ও নিয়ন্ত্রণ, প্রতিরক্ষা, জিনতত্ত্ব ও বিবর্তন এবং প্রাণীর আচরণ'), ], false);
const _S22 = mkSubj('eco-1', 'অর্থনীতি ১ম পত্র (Code: 109)', 'Economics 1st Paper (HSC - 109)', '📈', '#4F46E5', '79, 70, 229', [ ch('eco1-c1', '১ম অধ্যায়: মৌলিক অর্থনৈতিক সমস্যা এবং এর সমাধান'),
ch('eco1-c2', '২য় অধ্যায়: ভোক্তা ও উৎপাদকের আচরণ — চাহিদা ও যোগান (গাণিতিক অধ্যায়)', [ 'চাহিদা, যোগান ও ভারসাম্য সমীকরণ: Qd = a - bP এবং Qs = c + dP (বাজার ভারসাম্যে Qd = Qs)', 'চাহিদার স্থিতিস্থাপকতা: দাম স্থিতিস্থাপকতা Ed = (ΔQ ÷ ΔP) × (P ÷ Q) | প্রান্তিক উপযোগ MU = ΔTU ÷ ΔQ', ]),
ch('eco1-c3', '৩য় অধ্যায়: উৎপাদন, উৎপাদন ব্যয় ও আয় (গাণিতিক অধ্যায়)', [ 'ব্যয় ও আয় সমীকরণ: TC = TFC + TVC, গড় ব্যয় AC = TC ÷ Q, প্রান্তিক ব্যয় MC = ΔTC ÷ ΔQ | মোট আয় TR = P × Q, MR = ΔTR ÷ ΔQ', ]),
ch('eco1-c4', '৪র্থ–৮ম অধ্যায়: বাজার, শ্রমবাজার, মূলধন, সংগঠন ও খাজনা'),
ch('eco1-c9', '৯ম ও ১০ম অধ্যায়: সামগ্রিক আয় ও ব্যয় (জাতীয় আয়) এবং মুদ্রা ও ব্যাংক (গাণিতিক অধ্যায়)', [ 'জাতীয় আয় ও বিনিয়োগ গুণক: GDP = C + I + G + (X - M), ভোগ অপেক্ষক C = a + bY, গুণক k = 1 ÷ (1 - MPC) = 1 ÷ MPS', 'ফিশারের মুদ্রার পরিমাণ তত্ত্ব: MV = PT বা MV + M′V′ = PT (অর্থের মূল্য Vm = 1 ÷ P)', ]),
]);
const _S23 = mkSubj('eco-2', 'অর্থনীতি ২য় পত্র (Code: 110)', 'Economics 2nd Paper (HSC - 110)', '🌾', '#059669', '5, 150, 105', [ ch('eco2-c1', '১ম, ২য় ও ৩য় অধ্যায়: বাংলাদেশের অর্থনীতি পরিচয়, কৃষি ও শিল্প'),
ch('eco2-c4', '৪র্থ অধ্যায়: জনসংখ্যা, মানবসম্পদ ও আত্মকর্মসংস্থান (গাণিতিক অধ্যায়)', [ 'জনসংখ্যার ঘনত্ব ও স্বাভাবিক বৃদ্ধির হার: জনসংখ্যার ঘনত্ব = মোট জনসংখ্যা ÷ মোট ভূমির আয়তন (বর্গ কিমি) | বৃদ্ধির হার = (CBR - CDR) ÷ 10', ]),
ch('eco2-c5', '৫ম ও ৬ষ্ঠ অধ্যায়: খাদ্য নিরাপত্তা ও অর্থায়ন'),
ch('eco2-c7', '৭ম অধ্যায়: মুদ্রাস্ফীতি (গাণিতিক অধ্যায়)', [ 'মুদ্রাস্ফীতির হার নির্ণয়: মুদ্রাস্ফীতির হার = [(চলতি বছরের দাম সূচক CPI₂ - ভিত্তি বছরের দাম সূচক CPI₁) ÷ CPI₁] × ১০০%', ]),
ch('eco2-c8', '৮ম, ৯ম ও ১০ম অধ্যায়: আন্তর্জাতিক বাণিজ্য, সরকারি অর্থব্যবস্থা ও উন্নয়ন পরিকল্পনা'), ]);
const _S24 = mkSubj('stat-1', 'পরিসংখ্যান ১ম পত্র (Code: 129)', 'Statistics 1st Paper (HSC - 129)', '📊', '#0284C7', '2, 132, 199', [
ch('stat1-c1', '১ম ও ২য় অধ্যায়: চলক, প্রতীক ও তথ্য উপস্থাপন', [ 'শ্রেণিসংখ্যা ও শ্রেণিব্যাপ্তি (স্টার্জেসের সূত্র): k = 1 + 3.322 log₁₀N এবং শ্রেণিব্যাপ্তি c = পরিসর (R) ÷ k', ]),
ch('stat1-c2', '৩য় ও ৪র্থ অধ্যায়: কেন্দ্রীয় প্রবণতা ও বিস্তার পরিমাপ', [ 'গাণিতিক, জ্যামিতিক ও তরঙ্গ গড়: AM = Σx ÷ n, GM = (x₁·x₂...xₙ)^(1/n), HM = n ÷ Σ(1/x) | AM × HM = (GM)² | Mode = 3 Median - 2 Mean', 'পরিমিত ব্যবধান ও বিভেদাঙ্ক: σ = √[Σ(x - x̄)² ÷ n] | প্রথম n স্বাভাবিক সংখ্যার σ = √[(n² - 1) ÷ 12] | বিভেদাঙ্ক CV = (σ ÷ x̄) × 100%', ]),
ch('stat1-c3', '৫ম–৮ম অধ্যায়: পরিঘাত ও বঙ্কিমতা, সংশ্লেষ ও নির্ভরণ, কালীন সারি এবং সূচক সংখ্যা', [ 'সংশ্লেষ ও নির্ভরণ সহগ: -1 ≤ r ≤ +1 এবং r = ±√(b_yx × b_xy) | ফিশারের আদর্শ সূচক সংখ্যা P₀₁(F) = √(L × P)', ]), ]);
const _S25 = mkSubj('stat-2', 'পরিসংখ্যান ২য় পত্র (Code: 130)', 'Statistics 2nd Paper (HSC - 130)', '🎲', '#7C3AED', '124, 58, 237', [
ch('stat2-c1', '১ম, ২য় ও ৩য় অধ্যায়: সম্ভাবনা, দৈব চলক এবং গাণিতিক প্রত্যাশা ও ভেদাঙ্ক', [ 'সম্ভাবনার সংযোজন ও শর্তাধীন সূত্র: P(A∪B) = P(A) + P(B) - P(A∩B) | P(A|B) = P(A∩B) ÷ P(B)', 'গাণিতিক প্রত্যাশা ও ভেদাঙ্ক: E(aX + b) = aE(X) + b | V(X) = E(X²) - [E(X)]² এবং V(aX + b) = a²V(X)', ]),
ch('stat2-c2', '৪র্থ–৯ম অধ্যায়: দ্বিপদী, পঁয়সন ও পরিমিত বিন্যাস, নমুনায়ন ও জীব পরিসংখ্যান', [ 'দ্বিপদী, পঁয়সন ও পরিমিত বিন্যাস: দ্বিপদী P(x) = ⁿCₓ pˣ qⁿ⁻ˣ (গড় = np, ভেদাঙ্ক = npq) | পঁয়সন P(x) = (e⁻ᵐ·mˣ)/x! (গড় = ভেদাঙ্ক = m) | পরিমিত চলক z = (x - μ) ÷ σ', 'নমুনায়ন ও জীব পরিসংখ্যান: নমুনা গড়ের পরিমিত ভ্রান্তি SE(x̄) = σ ÷ √n | স্থূল জন্মহার CBR = (B ÷ P) × 1000', ]),
]);
const _S26 = mkSubj('civ-1', 'পৌরনীতি ও সুশাসন ১ম পত্র (Code: 269)', 'Civics & Good Governance 1st Paper (HSC - 269)', '⚖️', '#7C3AED', '124, 58, 237', [ch('civ1-c1', '১ম–১০ম অধ্যায়: পৌরনীতি ও সুশাসন পরিচিতি, আইন-স্বাধীনতা-সাম্য, ই-গভর্ন্যান্স, মানবাধিকার, সরকার কাঠামো ও আমলাতন্ত্র')], false);
const _S27 = mkSubj('civ-2', 'পৌরনীতি ও সুশাসন ২য় পত্র (Code: 270)', 'Civics & Good Governance 2nd Paper (HSC - 270)', '🏛️', '#4F46E5', '79, 70, 229', [ch('civ2-c1', '১ম–১০ম অধ্যায়: ব্রিটিশ ভারত হতে বাংলাদেশের অভ্যুদয় (১৭৫৭–১৯৭১), সংবিধান, সরকার ও প্রশাসন, স্থানীয় শাসন ও পররাষ্ট্রনীতি')], false);
const _S28 = mkSubj('his-1', 'ইতিহাস ১ম পত্র (Code: 304)', 'History 1st Paper (HSC - 304)', '🏺', '#B45309', '180, 83, 9', [ch('his1-c1', '১ম–৮ম অধ্যায়: ইউরোপীয়দের আগমন, পলাশী ও বক্সারের যুদ্ধ, কোম্পানির ও ব্রিটিশ শাসন, ভাষা আন্দোলন ও মহান মুক্তিযুদ্ধ (১৯৭১)')], false);
const _S29 = mkSubj('his-2', 'ইতিহাস ২য় পত্র (Code: 305)', 'History 2nd Paper (HSC - 305)', '📜', '#9333EA', '147, 51, 234', [ch('his2-c1', '১ম–৯ম অধ্যায়: শিল্প বিপ্লব, ফরাসি বিপ্লব (১৭৮৯), ১ম ও ২য় বিশ্বযুদ্ধ, রুশ বিপ্লব, জাতিসংঘ, স্নায়ুযুদ্ধ ও বর্ণবাদ বিরোধী আন্দোলন')], false);
const _S30 = mkSubj('ihc-1', 'ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র (Code: 267)', 'Islamic History & Culture 1st Paper (HSC - 267)', '🕌', '#059669', '5, 150, 105', [ch('ihc1-c1', '১ম–৭ম অধ্যায়: প্রাক-ইসলামি আরব, হযরত মুহাম্মদ (সা.), খুলাফায়ে রাশেদীন, উমাইয়া, আব্বাসীয়, স্পেনে উমাইয়া ও ফাতেমীয় খিলাফত')], false);
const _S31 = mkSubj('ihc-2', 'ইসলামের ইতিহাস ও সংস্কৃতি ২য় পত্র (Code: 268)', 'Islamic History & Culture 2nd Paper (HSC - 268)', '🌙', '#0D9488', '13, 148, 136', [ch('ihc2-c1', '১ম–৬ষ্ঠ অধ্যায়: ভারতে মুসলিম শাসন, দিল্লি সালতানাত, মুঘল সাম্রাজ্য, বাংলায় কোম্পানির শাসন ও স্বাধীন বাংলাদেশের অভ্যুদয়')], false);
const _S32 = mkSubj('log-1', 'যুক্তিবিদ্যা ১ম পত্র (Code: 121)', 'Logic 1st Paper (HSC - 121)', '🧠', '#4F46E5', '79, 70, 229', [ch('log1-c1', '১ম–৮ম অধ্যায়: যুক্তিবিদ্যা পরিচিতি, পদ ও শব্দ, বিধেয়ক, অনুমান, যুক্তিবাক্য, আবর্তন-প্রতিবর্তন, সহানুমান ও প্রতীকী যুক্তিবিদ্যা')], false);
const _S33 = mkSubj('log-2', 'যুক্তিবিদ্যা ২য় পত্র (Code: 122)', 'Logic 2nd Paper (HSC - 122)', '🔍', '#7C3AED', '124, 58, 237', [ch('log2-c1', '১ম–৮ম অধ্যায়: যৌক্তিক সংজ্ঞা, যৌক্তিক বিভাগ, আরোহের প্রকারভেদ ও ভিত্তি, প্রকল্প, মিলের পরীক্ষামূলক পদ্ধতি ও আরোহমূলক দোষ')], false);
const _S34 = mkSubj('soc-1', 'সমাজবিজ্ঞান ১ম পত্র (Code: 117)', 'Sociology 1st Paper (HSC - 117)', '👥', '#0284C7', '2, 132, 199', [ch('soc1-c1', '১ম–১১শ অধ্যায়: সমাজবিজ্ঞানের উৎপত্তি, গবেষণা পদ্ধতি, মৌল প্রত্যয়, সামাজিক প্রতিষ্ঠান, সামাজিকীকরণ, স্তরবিন্যাস ও সামাজিক পরিবর্তন')], false);
const _S35 = mkSubj('soc-2', 'সমাজবিজ্ঞান ২য় পত্র (Code: 118)', 'Sociology 2nd Paper (HSC - 118)', '🏘️', '#059669', '5, 150, 105', [ch('soc2-c1', '১ম–৯ম অধ্যায়: বাংলাদেশে সমাজবিজ্ঞান বিকাশ, সমাজ ও সংস্কৃতি, প্রত্নতাত্ত্বিক পরিচয়, ক্ষুদ্র নৃ-গোষ্ঠী, গ্রামীণ-শহুরে সমাজ ও সামাজিক সমস্যা')], false);
const _S36 = mkSubj('sw-1', 'সমাজকর্ম ১ম পত্র (Code: 271)', 'Social Work 1st Paper (HSC - 271)', '🤝', '#E11D48', '225, 29, 72', [ch('sw1-c1', '১ম–৮ম অধ্যায়: সমাজকর্মের প্রকৃতি, ঐতিহাসিক প্রেক্ষাপট, মূল্যবোধ, সমাজকর্ম পদ্ধতি (মৌলিক ও সহায়ক) ও সামাজিক নীতি')], false);
const _S37 = mkSubj('sw-2', 'সমাজকর্ম ২য় পত্র (Code: 272)', 'Social Work 2nd Paper (HSC - 272)', '❤️', '#D97706', '217, 119, 6', [ch('sw2-c1', '১ম–৯ম অধ্যায়: মৌলিক মানবিক চাহিদা, সমাজকর্মের শাখা, সামাজিক সমস্যা ও আইন, সরকারি ও বেসরকারি সমাজ উন্নয়ন ও মাঠকর্ম')], false);
const _S38 = mkSubj('geo-1', 'ভূগোল ১ম পত্র - প্রাকৃতিক ভূগোল (Code: 125)', 'Geography 1st Paper - Physical Geography (HSC - 125)', '🌍', '#0284C7', '2, 132, 199', [ch('geo1-c1', '১ম–৯ম অধ্যায়: প্রাকৃতিক ভূগোল, পৃথিবীর গঠন ও শিলা, ভূমিরূপ পরিবর্তন, বায়ুমণ্ডল, জলবায়ু, বারিমণ্ডল, জীবমণ্ডল ও ব্যবহারিক মানচিত্র')], false);
const _S39 = mkSubj('geo-2', 'ভূগোল ২য় পত্র - মানব ও অর্থনৈতিক ভূগোল (Code: 126)', 'Geography 2nd Paper - Human & Economic Geography (HSC - 126)', '🗺️', '#0D9488', '13, 148, 136', [ch('geo2-c1', '১ম–১০ম অধ্যায়: মানব ভূগোল, জনসংখ্যা, বসতি, কৃষি, খনিজ ও শক্তি সম্পদ, শিল্প, পরিবহন ও বন্দর, বাণিজ্য এবং জিআইএস (GIS & GPS)')], false);
const _S40 = mkSubj('isl-1', 'ইসলাম শিক্ষা ১ম পত্র (Code: 249)', 'Islamic Studies 1st Paper (HSC - 249)', '🕋', '#059669', '5, 150, 105', [ch('isl1-c1', '১ম–৭ম অধ্যায়: ইসলামী সংস্কৃতি ও আকাইদ, ইবাদত, আখলাক, সমাজজীবন, অর্থব্যবস্থা, রাষ্ট্রব্যবস্থা ও আন্তর্জাতিক ব্যবস্থা')], false);
const _S41 = mkSubj('isl-2', 'ইসলাম শিক্ষা ২য় পত্র (Code: 250)', 'Islamic Studies 2nd Paper (HSC - 250)', '📖', '#10B981', '16, 185, 129', [ch('isl2-c1', '১ম–৬ষ্ঠ অধ্যায়: আল-কুরআন, আল-হাদিস (সিহাহ সিত্তাহ), ইজমা ও কিয়াস, ইসলামে জ্ঞানচর্চা, মুসলিম মনীষীদের অবদান ও সমকালীন প্রেক্ষাপট')], false);
const _S42 = mkSubj('agr-1', 'কৃষিশিক্ষা ১ম পত্র (Code: 239)', 'Agriculture Studies 1st Paper (HSC - 239)', '🌱', '#10B981', '16, 185, 129', [ch('agr1-c1', '১ম–৬ষ্ঠ অধ্যায়: কৃষি তথ্যপ্রযুক্তি, ভূমি সম্পদ, বিশেষ কৃষি প্রযুক্তি, কৃষি ও জলবায়ু (৩০টি AEZ), মাঠ ও উদ্যান ফসল এবং সংরক্ষণ')], false);
const _S43 = mkSubj('agr-2', 'কৃষিশিক্ষা ২য় পত্র (Code: 240)', 'Agriculture Studies 2nd Paper (HSC - 240)', '🌾', '#059669', '5, 150, 105', [ch('agr2-c1', '১ম–৫ম অধ্যায়: মাৎস্য চাষ, পোল্ট্রি পালন, গবাদিপশু পালন, বনায়ন এবং কৃষি অর্থনীতি ও সমবায়')], false);
const _S44 = mkSubj('ssc-bn-1', 'বাংলা ১ম পত্র (SSC - Code: 101)', 'Bangla 1st Paper (SSC - 101)', '📖', '#E11D48', '225, 29, 72', [ch('s-bn1-c1', 'গদ্য, পদ্য ও সহপাঠ (সুভা, বই পড়া, আম আঁটির ভেঁপু, মানুষ মুহম্মদ (স.), নিমগাছ, বঙ্গবাণী, কপোতাক্ষ নদ, মানুষ, কাকতাড়ুয়া ও বহিপীর)')], false);
const _S45 = mkSubj('ssc-bn-2', 'বাংলা ২য় পত্র (SSC - Code: 102)', 'Bangla 2nd Paper (SSC - 102)', '✍️', '#059669', '5, 150, 105', [ch('s-bn2-c1', 'ধ্বনিতত্ত্ব, সন্ধি, সমাস, উপসর্গ, প্রত্যয়, কারক-বিভক্তি, বাচ্য, উক্তি, বাক্য প্রকরণ ও নির্মিতি')], false);
const _S46 = mkSubj('ssc-en-1', 'English 1st Paper (SSC - Code: 107)', 'English 1st Paper (SSC - 107)', '🌐', '#2563EB', '37, 99, 235', [ch('s-en1-c1', 'Seen & Unseen Passages, Information Transfer, Summarizing, Matching, Rearranging & Writing')], false);
const _S47 = mkSubj('ssc-en-2', 'English 2nd Paper (SSC - Code: 108)', 'English 2nd Paper (SSC - 108)', '🔤', '#1D4ED8', '29, 78, 216', [ch('s-en2-c1', 'Grammar (Right Form of Verbs, Narration, Changing Sentences, Suffix-Prefix, Tag Questions, Connectors) & CV/Composition')], false);
const _S48 = mkSubj('ssc-math', 'সাধারণ গণিত (SSC - Code: 109)', 'General Mathematics (SSC - 109)', '📏', '#D97706', '217, 119, 6', [
ch('s-math-c1', 'বীজগণিত, সূচক-লগারিদম, ত্রিকোণমিতি, সসীম ধারা, জ্যামিতি, পরিমিতি ও পরিসংখ্যান', [ 'বীজগণিত ও লগারিদম: (a+b)² = (a-b)² + 4ab, a³+b³ = (a+b)³ - 3ab(a+b) | logₐ(MN) = logₐM + logₐN, logₐ(Mʳ) = r logₐM', 'ত্রিকোণমিতি, ধারা ও পরিমিতি: sin²θ + cos²θ = 1, sec²θ - tan²θ = 1 | সমান্তর ধারার সমষ্টি Sn = (n/2)[2a + (n-1)d] | বৃত্তের ক্ষেত্রফল = πr²', ]),
]);
const _S49 = mkSubj('ssc-ict', 'তথ্য ও যোগাযোগ প্রযুক্তি - ICT (SSC - Code: 154)', 'ICT (SSC - 154)', '💻', '#0284C7', '2, 132, 199', [ch('s-ict-c1', '১ম হতে ৬ষ্ঠ অধ্যায়: তথ্যপ্রযুক্তি ও বাংলাদেশ, কম্পিউটার রক্ষণাবেক্ষণ, ই-বুক, ওয়ার্ড-স্প্রেডশিট ও মাল্টিমিডিয়া')], false);
const _S50 = mkSubj('ssc-phy', 'পদার্থবিজ্ঞান (SSC - Code: 136)', 'Physics (SSC - 136)', '🔭', '#4F46E5', '79, 70, 229', [
ch('s-phy-c1', 'ভৌত রাশি, গতি, বল, কাজ-ক্ষমতা-শক্তি, পদার্থের অবস্থা ও চাপ, তাপ, তরঙ্গ-শব্দ, আলো ও তড়িৎ', [ 'গতি ও বলের সমীকরণ: v = u + at, s = ut + ½at², v² = u² + 2as | F = ma, Ek = ½mv², Ep = mgh', 'আলো ও চল তড়িৎ: 1/u + 1/v = 1/f, লেন্সের ক্ষমতা P = 1/f | V = IR, তড়িৎ ক্ষমতা P = VI = I²R, বৈদ্যুতিক ইউনিট W = (P × t) ÷ 1000 kWh', ]),
]);
const _S51 = mkSubj('ssc-chem', 'রসায়ন (SSC - Code: 137)', 'Chemistry (SSC - 137)', '🧪', '#059669', '5, 150, 105', [
ch('s-chem-c1', '১ম–৫ম অধ্যায়: রসায়নের ধারণা, পদার্থের অবস্থা, পদার্থের গঠন, পর্যায় সারণি ও রাসায়নিক বন্ধন'),
ch('s-chem-c6', '৬ষ্ঠ অধ্যায়: মোলের ধারণা ও রাসায়নিক গণনা (গাণিতিক অধ্যায়)', [ 'মোল ও মোলারিটি সূত্র: n = w ÷ M = V(L) ÷ 22.4 (STP) = N ÷ (6.023 × 10²³) | মোলারিটি S = (1000 × w) ÷ (M × V_mL)', ]),
ch('s-chem-c7', '৭ম–১২শ অধ্যায়: রাসায়নিক বিক্রিয়া, রসায়ন ও শক্তি, এসিড-ক্ষারক সমতা, খনিজ সম্পদ ও জৈব যৌগ'), ]);
const _S52 = mkSubj('ssc-bio', 'জীববিজ্ঞান (SSC - Code: 138)', 'Biology (SSC - 138)', '🌿', '#10B981', '16, 185, 129', [ch('s-bio-c1', 'জীবন পাঠ, জীবকোষ ও টিস্যু, কোষ বিভাজন, জীবনীশক্তি, খাদ্য ও পরিপাক, পরিবহন, রেচন, সমন্বয় ও বংশগতি')], false);
const _S53 = mkSubj('ssc-hmath', 'উচ্চতর গণিত (SSC - Code: 126)', 'Higher Mathematics (SSC - 126)', '📐', '#E11D48', '225, 29, 72', [
ch('s-hmath-c1', 'সেট-ফাংশন, বীজগাণিতিক রাশি, অসীম ধারা, দ্বিপদী বিস্তৃতি, স্থানাঙ্ক জ্যামিতি, ত্রিকোণমিতি, ভেক্টর, ঘন জ্যামিতি ও সম্ভাবনা', [ 'অসীম ধারা ও স্থানাঙ্ক জ্যামিতি: |r| < 1 হলে অসীমতক সমষ্টি S_∞ = a ÷ (1 - r) | ঢাল m = (y₂ - y₁) ÷ (x₂ - x₁)', 'ঘন জ্যামিতি ও সম্ভাবনা: গোলকের পৃষ্ঠতলের ক্ষেত্রফল = 4πr², আয়তন = (4/3)πr³ | শঙ্কুর আয়তন = ⅓πr²h', ]),
]);
const _S54 = mkSubj('ssc-bgs', 'বাংলাদেশ ও বিশ্বপরিচয় (SSC - Code: 150)', 'Bangladesh & Global Studies (SSC - 150)', '🇧🇩', '#0D9488', '13, 148, 136', [ch('s-bgs-c1', 'স্বাধীন বাংলাদেশের অভ্যুদয়, সৌরজগৎ ও ভূমণ্ডল, ভূপ্রকৃতি, রাষ্ট্র-সংবিধান, জাতিসংঘ ও জাতীয় আয়')], false);
const _S55 = mkSubj('ssc-acc', 'হিসাববিজ্ঞান (SSC - Code: 146)', 'Accounting (SSC - 146)', '📒', '#4F46E5', '79, 70, 229', [
ch('s-acc-c1', 'লেনদেন, দুতরফা দাখিলা পদ্ধতি, জাবেদা, খতিয়ান, নগদান বই, রেওয়ামিল, আর্থিক বিবরণী ও উৎপাদন ব্যয় বিবরণী', [ 'হিসাব সমীকরণ ও ব্যয় বিবরণী: A = L + (C + R - Ex - D) | মুখ্য ব্যয় = প্রত্যক্ষ কাঁচামাল + প্রত্যক্ষ শ্রম + অন্যান্য প্রত্যক্ষ খরচ', ]),
]);
const _S56 = mkSubj('ssc-fin', 'ফিন্যান্স ও ব্যাংকিং (SSC - Code: 152)', 'Finance & Banking (SSC - 152)', '🏦', '#7C3AED', '124, 58, 237', [
ch('s-fin-c1', 'অর্থায়ন অংশ: অর্থের সময়মূল্য, ঝুঁকি ও অনিশ্চয়তা, মূলধন বাজেটিং ও মূলধন ব্যয় (গাণিতিক অধ্যায়)', [ 'অর্থের সময়মূল্য ও মূলধন বাজেটিং: FV = PV(1 + i)ⁿ, EAR = (1 + i/m)ᵐ - 1 | গড় মুনাফার হার ARR = (গড় নিট মুনাফা ÷ গড় বিনিয়োগ) × ১০০%', ]),
ch('s-fin-c2', 'ব্যাংকিং অংশ: মুদ্রা, ব্যাংক ও ব্যাংকিং, বাণিজ্যিক ব্যাংক এবং কেন্দ্রীয় ব্যাংক'), ]);
const _S57 = mkSubj('ssc-ent', 'ব্যবসায় উদ্যোগ (SSC - Code: 143)', 'Business Entrepreneurship (SSC - 143)', '💼', '#D97706', '217, 119, 6', [ch('s-ent-c1', 'ব্যবসায় পরিচিতি, ব্যবসায় উদ্যোগ, আত্মকর্মসংস্থান, একমালিকানা-অংশীদারি-যৌথমূলধনী-সমবায় ব্যবসায়, বিপণন ও ব্যবস্থাপনা')], false);
const _S58 = mkSubj('ssc-gsci', 'বিজ্ঞান (SSC - Code: 127)', 'General Science (SSC - 127)', '🔬', '#0284C7', '2, 132, 199', [ch('s-gsci-c1', 'খাদ্য ও পুষ্টি, পানি, হৃদযন্ত্র ও রক্ত, আলো, পলিমার, অম্ল-ক্ষারক-লবণ, বল, জীবপ্রযুক্তি ও প্রাত্যহিক জীবনে তড়িৎ')], false);
const _S59 = mkSubj('ssc-his', 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা (SSC - Code: 153)', 'History of Bangladesh & World Civilization (SSC - 153)', '🏛️', '#B45309', '180, 83, 9', [ch('s-his-c1', 'বিশ্বসভ্যতা, প্রাচীন বাংলার জনপদ, পাল-সেন যুগ, মধ্যযুগ, ইংরেজ শাসন, ভাষা আন্দোলন ও মুক্তিযুদ্ধ')], false);
const _S60 = mkSubj('ssc-geo', 'ভূগোল ও পরিবেশ (SSC - Code: 110)', 'Geography & Environment (SSC - 110)', '🌍', '#059669', '5, 150, 105', [ch('s-geo-c1', 'মহাবিশ্ব ও পৃথিবী, মানচিত্র পঠন, শিলামণ্ডল, বায়ুমণ্ডল, বারিমণ্ডল, জনসংখ্যা, বসতি ও বাংলাদেশের ভৌগোলিক বিবরণ')], false);
const _S61 = mkSubj('ssc-civ', 'পৌরনীতি ও নাগরিকতা (SSC - Code: 140)', 'Civics & Citizenship (SSC - 140)', '⚖️', '#7C3AED', '124, 58, 237', [ch('s-civ-c1', 'পৌরনীতি ও নাগরিকতা, আইন-স্বাধীনতা-সাম্য, রাষ্ট্র ও সরকার ব্যবস্থা, সংবিধান, রাজনৈতিক দল ও নির্বাচন এবং জাতিসংঘ')], false);
const _S62 = mkSubj('ssc-eco', 'অর্থনীতি (SSC - Code: 141)', 'Economics (SSC - 141)', '📈', '#4F46E5', '79, 70, 229', [ch('s-eco-c1', 'অর্থনীতির পরিচয়, উপযোগ-চাহিদা-যোগান, উৎপাদন, বাজার, জাতীয় আয় (GDP, GNP), অর্থ ও ব্যাংক ব্যবস্থা এবং বাজেট')], false);
const _S63 = mkSubj('ssc-rel', 'ইসলাম ও নৈতিক শিক্ষা (SSC - Code: 111)', 'Islam & Moral Education (SSC - 111)', '🕋', '#10B981', '16, 185, 129', [ch('s-rel-c1', 'আকাইদ ও নৈতিক জীবন, শরীয়তের উৎস, ইবাদত (সালাত, সিয়াম, যাকাত, হজ), আখলাক ও আদর্শ জীবনচরিত')], false);
const _S64 = mkSubj('ssc-agr', 'কৃষিশিক্ষা (SSC - Code: 134)', 'Agriculture Studies (SSC - 134)', '🌱', '#059669', '5, 150, 105', [ch('s-agr-c1', 'কৃষি প্রযুক্তি, কৃষি উপকরণ, কৃষি ও জলবায়ু, কৃষিজ উৎপাদন, বনায়ন, মাৎস্য চাষ, পোল্ট্রি ও গবাদিপশু পালন')], false);
const _S65 = mkSubj('adm-sci', 'Admission: ক ইউনিট ও ইঞ্জিনিয়ারিং (DU, BUET, CKRUET, GST)', 'Admission: Unit A & Engineering', '🎓', '#4F46E5', '79, 70, 229', [
ch('adm-sci-c1', 'পদার্থবিজ্ঞান, রসায়ন ও উচ্চতর গণিত শর্টকাট সূত্রাবলি', [ 'প্রাসের পাল্লা ও ক্যালকুলাস শর্টকাট: R = 4H cotθ (R = H হলে θ = 75°58′) | L’Hôpital’s Rule: lim f(x)/g(x) = lim f′(x)/g′(x)', ]), ]);
const _S66 = mkSubj('adm-med', 'Admission: মেডিকেল ও ডেন্টাল ভর্তি প্রস্তুতি (MBBS & BDS)', 'Admission: Medical & Dental Preparation', '🩺', '#10B981', '16, 185, 129', [ch('adm-med-c1', 'জীববিজ্ঞান (৩০), রসায়ন (২৫), পদার্থবিজ্ঞান (২০), ইংরেজি (১৫) ও সাধারণ জ্ঞান (১০)')], false);
const _S67 = mkSubj('adm-com', 'Admission: গ ইউনিট ও ব্যবসায় শিক্ষা (DU C-Unit, GST, JU, RU, CU)', 'Admission: Business Studies (C-Unit & GST)', '📊', '#D97706', '217, 119, 6', [
ch('adm-com-c1', 'হিসাববিজ্ঞান ও ফিন্যান্স গাণিতিক শর্টকাট', [ 'মুনাফার হার রূপান্তর শর্টকাট: ক্রয়মূল্যের ওপর ২৫% (১/৪) = বিক্রয়মূল্যের ওপর ২০% (১/৫) | ক্রয়মূল্যের ওপর ৩৩.৩৩% (১/৩) = বিক্রয়মূল্যের ওপর ২৫% (১/৪)', ]), ]);
const _S68 = mkSubj('adm-hum', 'Admission: খ ইউনিট ও বিভাগ পরিবর্তন (DU B-Unit, GST, JU, RU, CU)', 'Admission: Humanities & Group Change (B-Unit & GST)', '🏛️', '#7C3AED', '124, 58, 237', [ch('adm-hum-c1', 'বাংলা, সাধারণ ইংরেজি ও সাধারণ জ্ঞান (বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি)')], false);
const _S69 = mkSubj('bcs-preli', 'BCS Preliminary Master (১০ম–৪৬তম বিসিএস প্রশ্ন ব্যাংক ও সিলেবাস)', 'BCS Preliminary Master (200 Marks Syllabus)', '🏆', '#D97706', '217, 119, 6', [
ch('bcs-c1', 'বাংলা ও ইংরেজি সাহিত্য-ব্যাকরণ, বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি, বিজ্ঞান ও আইসিটি'),
ch('bcs-c2', 'গাণিতিক যুক্তি ও মানসিক দক্ষতা (গাণিতিক অধ্যায়)', [ 'শতকরা ও সুদকষা শর্টকাট: মূল্য x% বৃদ্ধি পেয়ে y% হ্রাস পেলে পরিবর্তন = [x - y - (xy ÷ 100)]% | সরল সুদ I = Pnr, চক্রবৃদ্ধি মূলধন C = P(1 + r)ⁿ', ]), ]);
const _S70 = mkSubj('job-bank', 'Bank Job, Primary Teacher & NTRCA Master', 'Bank Job, Primary & NTRCA Preparation', '💼', '#0284C7', '2, 132, 199', [
ch('job-c1', 'Quantitative Aptitude (ঐকিক নিয়ম, সময়-কাজ, ট্রেন ও নৌকা-স্রোত শর্টকাট)', [ 'সময় ও কাজ এবং গড় গতিবেগ: একত্রে কাজ সম্পন্ন = (xy) ÷ (x + y) দিনে | যাতায়াতের গড় গতিবেগ = (2xy) ÷ (x + y)', ]), ]);
const HSC_BUSINESS_STUDIES_LIST: SubjectData[] = [_S06, _S07, _S01, _S02, _S03, _S04, _S05, _S08, _S09, _S10, _S11, _S12, _S13, _S22, _S23, _S24, _S25, _S42, _S43];
const HSC_SCIENCE_LIST: SubjectData[] = [_S01, _S02, _S03, _S04, _S05, _S14, _S15, _S16, _S17, _S18, _S19, _S20, _S21, _S24, _S25, _S42, _S43];
const HSC_HUMANITIES_LIST: SubjectData[] = [_S01, _S02, _S03, _S04, _S05, _S22, _S23, _S26, _S27, _S28, _S29, _S30, _S31, _S32, _S33, _S34, _S35, _S36, _S37, _S38, _S39, _S40, _S41, _S24, _S25, _S42, _S43];
const HSC_ALL_GROUPS_LIST: SubjectData[] = [_S01, _S02, _S03, _S04, _S05, _S06, _S07, _S08, _S09, _S10, _S11, _S12, _S13, _S14, _S15, _S16, _S17, _S18, _S19, _S20, _S21, _S22, _S23, _S26, _S27, _S28, _S29, _S30, _S31, _S32, _S33, _S34, _S35, _S36, _S37, _S38, _S39, _S40, _S41, _S24, _S25, _S42, _S43];
const SSC_SCIENCE_LIST: SubjectData[] = [_S44, _S45, _S46, _S47, _S48, _S49, _S50, _S51, _S52, _S53, _S54, _S63, _S64];
const SSC_BUSINESS_STUDIES_LIST: SubjectData[] = [_S44, _S45, _S46, _S47, _S48, _S49, _S55, _S56, _S57, _S58, _S63, _S64];
const SSC_HUMANITIES_LIST: SubjectData[] = [_S44, _S45, _S46, _S47, _S48, _S49, _S59, _S60, _S61, _S62, _S58, _S63, _S64];
const SSC_ALL_GROUPS_LIST: SubjectData[] = [_S44, _S45, _S46, _S47, _S48, _S49, _S50, _S51, _S52, _S53, _S55, _S56, _S57, _S59, _S60, _S61, _S62, _S54, _S58, _S63, _S64];
const INITIAL_SYLLABUS_DB: Record<string, Record<string, SubjectData[]>> = { HSC: { 'All Groups': HSC_ALL_GROUPS_LIST, 'Business Studies': HSC_BUSINESS_STUDIES_LIST, Science: HSC_SCIENCE_LIST,
Humanities: HSC_HUMANITIES_LIST, }, SSC: { 'All Groups': SSC_ALL_GROUPS_LIST, Science: SSC_SCIENCE_LIST, 'Business Studies': SSC_BUSINESS_STUDIES_LIST, Humanities: SSC_HUMANITIES_LIST, }, Admission: {
'All Units': [_S65, _S66, _S67, _S68], 'Science & Engineering': [_S65, _S66], 'Business Studies (C-Unit)': [_S67], 'Humanities (B-Unit)': [_S68], }, 'Job/BCS': { 'All Tracks': [_S69, _S70], }, };
export function calculateUserRank(params: { xp: number;
accuracyPct: number;
masteredChaptersCount: number;
totalChaptersCount?: number;
streakDays: number;
examsCompleted: number; }): RankProgressInfo { const { xp, accuracyPct, masteredChaptersCount, totalChaptersCount = 24, streakDays, examsCompleted } = params;
const xpComponent = Math.min(400, Math.round((xp / 4000) * 400));
const accWeight = examsCompleted > 0 ? Math.min(1, examsCompleted / 5) : 0;
const accuracyComponent = Math.round((Math.min(100, accuracyPct) / 100) * 250 * accWeight);
const masteryPct = Math.min(100, Math.round((masteredChaptersCount / Math.max(1, totalChaptersCount)) * 100));
const masteryComponent = Math.round((masteryPct / 100) * 200);
const consistencyPct = Math.min(100, Math.round((streakDays / 14) * 100));
const consistencyComponent = Math.round((consistencyPct / 100) * 150);
const rankScore = xpComponent + accuracyComponent + masteryComponent + consistencyComponent;
const tiers: { id: RankProgressInfo['tierId']; en: string; bn: string; min: number; max: number; colorHex: string; bgSoft: string }[] = [
{ id: 'bronze', en: 'Bronze', bn: 'ব্রোঞ্জ', min: 0, max: 199, colorHex: '#B45309', bgSoft: 'rgba(180, 83, 9, 0.13)' },
{ id: 'silver', en: 'Silver', bn: 'সিলভার', min: 200, max: 399, colorHex: '#475569', bgSoft: 'rgba(71, 85, 105, 0.14)' },
{ id: 'gold', en: 'Gold', bn: 'গোল্ড', min: 400, max: 649, colorHex: '#D97706', bgSoft: 'rgba(217, 119, 6, 0.15)' },
{ id: 'platinum', en: 'Platinum', bn: 'প্লাটিনাম', min: 650, max: 849, colorHex: '#0284C7', bgSoft: 'rgba(2, 132, 199, 0.14)' },
{ id: 'elite', en: 'Elite', bn: 'এলিট', min: 850, max: 1000, colorHex: '#7C3AED', bgSoft: 'rgba(124, 58, 237, 0.15)' }, ];
const current = tiers.find((t) => rankScore >= t.min && rankScore <= t.max) || tiers[tiers.length - 1];
const span = Math.max(1, current.max - current.min);
const within = Math.max(0, rankScore - current.min);
const progressPct = current.id === 'elite' && rankScore >= 1000 ? 100 : Math.min(99, Math.round((within / span) * 100));
let division: RankProgressInfo['division'] = 'I';
if (current.id === 'elite' && progressPct >= 95) division = 'MAX';
else if (progressPct >= 67) division = 'III';
else if (progressPct >= 34) division = 'II';
return { tierId: current.id, tierNameEn: current.en, tierNameBn: current.bn, division, fullTitleEn: division === 'MAX' ? `${current.en} Grandmaster` : `${current.en} ${division}`,
fullTitleBn: division === 'MAX' ? `${current.bn} গ্র্যান্ডমাস্টার` : `${current.bn} ${division}`, rankScore, nextTierScore: current.max + 1, progressPct, colorHex: current.colorHex, bgSoft: current.bgSoft, xpScore: xp,
accuracyPct: Math.round(accuracyPct), masteryPct, consistencyPct, }; }
export function getAvailableClasses(): string[] { return Object.keys(storeState?.syllabusDB || INITIAL_SYLLABUS_DB); }
export function getAvailableGroups(selectedClass: string): string[] { const db = storeState?.syllabusDB || INITIAL_SYLLABUS_DB;
if (db[selectedClass]) return Object.keys(db[selectedClass]);
return ['All Groups', 'Business Studies', 'Science', 'Humanities']; }
const formulaFilteredCache = new Map<string, { ref: SubjectData[]; out: SubjectData[] }>();
export function getSubjectsForSelection( selectedClass: string, selectedGroup: string, forceAllSubjects = false ): SubjectData[] { const db = storeState?.syllabusDB || INITIAL_SYLLABUS_DB;
const classEntry = db[selectedClass] || db.HSC;
if (!classEntry) return [];
const rawList = classEntry[selectedGroup] || classEntry[Object.keys(classEntry)[0]] || [];
if (!forceAllSubjects && storeState?.activeTab === 'formulas') { const cacheKey = `${selectedClass}::${selectedGroup}`;
const cached = formulaFilteredCache.get(cacheKey);
if (cached && cached.ref === rawList) return cached.out;
const filtered = rawList .map((subj) => { const mathChaps = subj.chapters.filter((c) => (c.formulas?.length || 0) > 0);
return mathChaps.length > 0 ? { ...subj, chapters: mathChaps } : null; }) .filter(Boolean) as SubjectData[];
formulaFilteredCache.set(cacheKey, { ref: rawList, out: filtered });
return filtered; }
return rawList; }
export async function signInOrSignUpUser(params: { mode: 'signin' | 'signup';
name: string;
email: string;
password: string; }): Promise<{ id: string; name: string; email: string; avatar?: string }> { const supaMod = RawSupabase as any;
const client = supaMod?.supabase;
if (client?.auth) { if (params.mode === 'signup') { const { data, error } = await client.auth.signUp({ email: params.email, password: params.password,
options: { data: { full_name: params.name || params.email.split('@')[0] } }, });
if (error) throw error;
const userObj = { id: data?.user?.id || `local-${Date.now()}`, name: params.name || data?.user?.user_metadata?.full_name || params.email.split('@')[0], email: params.email,
avatar: data?.user?.user_metadata?.avatar_url || '', };
if (typeof supaMod.upsertLiveUserProfile === 'function') { supaMod.upsertLiveUserProfile({ id: userObj.id, name: userObj.name, email: userObj.email, avatar: userObj.avatar, xp: storeState.xp, level: storeState.level,
streak: storeState.streak, selectedClass: storeState.selectedClass, selectedGroup: storeState.selectedGroup, }); }
return userObj; } else { const { data, error } = await client.auth.signInWithPassword({ email: params.email, password: params.password, });
if (error) throw error;
if (data?.user) { const userObj = { id: data.user.id, name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || params.email.split('@')[0], email: data.user.email || params.email,
avatar: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || '', };
if (typeof supaMod.upsertLiveUserProfile === 'function') { supaMod.upsertLiveUserProfile({ id: userObj.id, name: userObj.name, email: userObj.email, avatar: userObj.avatar, xp: storeState.xp, level: storeState.level,
streak: storeState.streak, selectedClass: storeState.selectedClass, selectedGroup: storeState.selectedGroup, }); }
return userObj; } } }
return { id: `local-${Date.now()}`, name: params.name || params.email.split('@')[0], email: params.email, }; }
export const UI_DICT: Record<string, { en: string; bn: string }> = { nav_dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' }, nav_subjects: { en: 'Subjects', bn: 'বিষয়সমূহ' },
nav_analytics: { en: 'Analytics', bn: 'পারফরম্যান্স' }, nav_mistakes: { en: 'Mistake Bank', bn: 'ভুলের খাতা' }, nav_flashcards: { en: 'Flashcards', bn: 'ফ্ল্যাশকার্ড' },
nav_formulas: { en: 'Math Formulas', bn: 'গাণিতিক সূত্রসমূহ' }, nav_planner: { en: 'Study Planner', bn: 'পড়ার রুটিন' }, nav_battle: { en: '1v1 Battle', bn: 'কুইজ ব্যাটল' },
nav_community: { en: 'Doubt Forum', bn: 'প্রশ্নোত্তর ফোরাম' }, nav_leaderboard: { en: 'Leaderboard', bn: 'লিডারবোর্ড' }, nav_achievements: { en: 'Rank & Badges', bn: 'র‍্যাঙ্ক ও ব্যাজ' },
nav_more: { en: 'More', bn: 'আরও' }, welcome_back: { en: 'Welcome back', bn: 'স্বাগতম' }, sign_in: { en: 'Sign In', bn: 'সাইন ইন' }, sign_out: { en: 'Sign Out', bn: 'লগ আউট' },
streak_days: { en: 'Day Streak', bn: 'দিনের স্ট্রিক' }, personal_rank: { en: 'Personal Rank', bn: 'ব্যক্তিগত র‍্যাঙ্ক' }, leaderboard_pos: { en: 'Leaderboard Position', bn: 'লিডারবোর্ড অবস্থান' },
choose_class_group: { en: 'Class & Group', bn: 'শ্রেণি ও বিভাগ' }, all_subjects: { en: 'All Subjects', bn: 'সকল বিষয়' }, chapters_count: { en: 'Chapters', bn: 'অধ্যায়' },
questions_count: { en: 'Questions', bn: 'প্রশ্ন' }, start_practice: { en: 'Start Practice', bn: 'অনুশীলন শুরু করো' }, daily_challenge: { en: 'Daily Challenge', bn: 'আজকের চ্যালেঞ্জ' },
quick_mock: { en: 'Quick Mock Exam', bn: 'কুইক মক টেস্ট' }, mastery: { en: 'Mastery', bn: 'দক্ষতা' }, accuracy: { en: 'Accuracy', bn: 'সঠিকতার হার' }, consistency: { en: 'Consistency', bn: 'ধারাবাহিকতা' },
rank_points: { en: 'Rank Score', bn: 'র‍্যাঙ্ক স্কোর' }, question: { en: 'Question', bn: 'প্রশ্ন' }, time_left: { en: 'Time Left', bn: 'বাকি সময়' }, question_palette: { en: 'Question Navigator', bn: 'প্রশ্ন নেভিগেটর' },
submit_exam: { en: 'Submit Exam', bn: 'পরীক্ষা জমা দাও' }, prev_q: { en: 'Previous', bn: 'পূর্ববর্তী' }, next_q: { en: 'Next', bn: 'পরবর্তী' }, flag_q: { en: 'Flag', bn: 'মার্ক করো' },
answered: { en: 'Answered', bn: 'উত্তর দেওয়া' }, unanswered: { en: 'Unanswered', bn: 'বাকি আছে' }, global_ranking: { en: 'Global Ranking', bn: 'সর্বজনীন র‍্যাঙ্কিং' },
friends_ranking: { en: 'Friends Ranking', bn: 'বন্ধুদের র‍্যাঙ্কিং' }, subject_ranking: { en: 'Subject-wise', bn: 'বিষয়ভিত্তিক' }, filter_today: { en: 'Today', bn: 'আজ' },
filter_weekly: { en: 'Weekly', bn: 'সাপ্তাহিক' }, filter_monthly: { en: 'Monthly', bn: 'মাসিক' }, filter_alltime: { en: 'All-Time', bn: 'সর্বমোট' }, };
export function trKey(key: keyof typeof UI_DICT, lang: LanguageMode): string { const item = UI_DICT[key];
if (!item) return String(key);
if (lang === 'bn') return item.bn;
if (lang === 'bilingual') return `${item.bn} (${item.en})`;
return item.en; }
export function trText(text: LocalizedText | string | undefined, lang: LanguageMode): string { if (!text) return '';
if (typeof text === 'string') return text;
if (lang === 'bn') return text.bn || text.en;
if (lang === 'bilingual') { return text.bn && text.en && text.bn !== text.en ? `${text.bn} (${text.en})` : text.bn || text.en; }
return text.en || text.bn; }
export function getLevelProgress(xp: number) { const xpPerLevel = 250;
const level = Math.max(1, Math.floor(xp / xpPerLevel) + 1);
const currentLevelXp = xp % xpPerLevel;
const pct = Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));
return { level, currentLevelXp, xpForNext: xpPerLevel, progressPct: pct, progressPercent: pct }; }
export interface ExamStoreState { activeTab: NavTabId;
selectedSubjectId: string | null;
formulaSubjectId: string | null;
formulaChapterId: string | null;
language: LanguageMode;
darkMode: boolean;
selectedClass: string;
selectedGroup: string;
userId: string;
userName: string;
userEmail: string;
userAvatar: string;
isAuthenticated: boolean;
xp: number;
level: number;
streak: number;
weeklyActivity: boolean[];
chapterMastery: Record<string, number>;
examHistory: ExamHistoryItem[];
mistakes: MistakeItem[];
flashcards: FlashcardItem[];
studyTasks: StudyTask[];
communityPosts: CommunityPost[];
friendsList: string[];
questionReports: QuestionErrorReport[];
syllabusDB: Record<string, Record<string, SubjectData[]>>;
activeQuiz: ActiveQuizConfig | null;
settingsOpen: boolean;
isSettingsModalOpen: boolean;
authModalOpen: boolean;
isAuthModalOpen: boolean;
isAdminUnlocked: boolean;
adminPin: string;
setActiveTab: (tab: NavTabId) => void;
setSelectedSubjectId: (id: string | null) => void;
setFormulaTarget: (subjectId: string | null, chapterId: string | null) => void;
openSubjectFormulas: (subjectId: string, chapterId?: string) => void;
setLanguage: (lang: LanguageMode) => void;
toggleDarkMode: () => void;
setClassAndGroup: (cls: string, grp: string) => void;
setUserProfile: (profile: { id?: string; name: string; email: string; avatar?: string; isAuthenticated?: boolean }) => void;
logoutUser: () => Promise<void>;
setSettingsOpen: (open: boolean) => void;
setSettingsModalOpen: (open: boolean) => void;
setAuthModalOpen: (open: boolean) => void;
startQuiz: (config: ActiveQuizConfig) => void;
closeQuiz: () => void;
recordExamResult: (result: any, newMistakes?: MistakeItem[]) => void;
markMistakeMastered: (id: string) => void;
addFlashcard: (front: string, back: string, subjectId?: string) => void;
deleteFlashcard: (id: string) => void;
updateFlashcardBox: (id: string, box: 1 | 2 | 3 | 4 | 5) => void;
addStudyTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
toggleStudyTask: (id: string) => void;
deleteStudyTask: (id: string) => void;
addCommunityPost: (post: { authorName?: string; authorAvatar?: string; authorRank?: string; subjectName: string; title: string; body: string }) => void;
addCommunityReply: (postId: string, authorOrText: string, maybeText?: string) => void;
likeCommunityPost: (postId: string) => void;
togglePostLike: (postId: string) => void;
addFriendByCode: (codeOrName: string) => void;
reportQuestionError: (payload: any) => void;
submitQuestionReport: (payload: any) => void;
resolveQuestionReport: (reportId: string, applySuggestedAnswer?: boolean) => void;
deleteQuestionReport: (reportId: string) => void;
unlockAdmin: (pin: string) => boolean;
lockAdmin: () => void;
setAdminPin: (newPin: string) => void;
importBulkMcqs: (params: { targetClass: string; targetGroup: string; subjectId: string; subjectNameBn: string; subjectNameEn: string; rawText: string }) => { addedQuestions: number; addedChapters: number };
addSingleCustomMcq: (params: { targetClass: string; targetGroup: string; subjectId: string; subjectNameBn: string; subjectNameEn: string; chapterNameBn: string; questionBn: string; optionsBn: string[]; ansIndex: number; boardTag?: string; explanationBn?: string }) => void;
updateCustomMcqAnswer: (cls: string, grp: string, subjectId: string, chapterId: string, questionId: string, newAnsIndex: number) => void;
editCustomMcqFull: (params: { targetClass: string; targetGroup: string; subjectId: string; chapterId: string; questionId: string; questionBn: string; optionsBn: string[]; ansIndex: number }) => void;
deleteCustomMcq: (cls: string, grp: string, subjectId: string, chapterId: string, questionId: string) => void;
deleteCustomSubject: (cls: string, grp: string, subjectId: string) => void;
exportProjectSyllabusCode: () => string;
resetAllDemoAndProgress: () => void;
adminAddQuestion: (payload: { className: string; groupName: string; subjectId: string; chapterId: string; question: MCQQuestion }) => void;
adminBulkImportQuestions: (payload: { className: string; groupName: string; subjectId: string; chapterId: string; questions: MCQQuestion[] }) => number;
adminDeleteQuestion: (payload: { className: string; groupName: string; subjectId: string; chapterId: string; questionId: string }) => void;
getRankInfo: () => RankProgressInfo; }
const STORAGE_KEY = 'examverse-v12-storage';
const VALID_TABS: NavTabId[] = [ 'dashboard', 'subjects', 'Analytics', 'mistakes', 'flashcards', 'formulas', 'planner', 'battle', 'community', 'leaderboard', 'achievements', 'admin', ];
function getInitialTabFromHashOrStorage(savedTab?: NavTabId): NavTabId { if (typeof window !== 'undefined') { const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
if (rawHash && !rawHash.startsWith('access_token=') && !rawHash.startsWith('error=')) { if (rawHash === 'analytics') return 'Analytics';
if (VALID_TABS.includes(rawHash as NavTabId)) return rawHash as NavTabId; } }
if (savedTab && VALID_TABS.includes(savedTab)) return savedTab;
return 'dashboard'; }
function applyThemeToDocument(isDark: boolean) { if (typeof document === 'undefined') return;
document.documentElement.classList.toggle('dark', isDark);
document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
try { window.localStorage.setItem('examverse_theme', isDark ? 'dark' : 'light'); } catch { } }
const BUILTIN_SUBJECT_MAP: Record<string, SubjectData> = {};
Object.values(INITIAL_SYLLABUS_DB).forEach((groupObj) => { Object.values(groupObj).forEach((subjList) => { subjList.forEach((subj) => { BUILTIN_SUBJECT_MAP[subj.id] = subj; }); }); });
function sanitizeSubjectList(list: any[], fallbackList: SubjectData[]): SubjectData[] { if (!Array.isArray(list) || list.length === 0) return fallbackList;
const sanitized = list .filter((s) => s && typeof s === 'object' && s.id) .map((s) => { if (BUILTIN_SUBJECT_MAP[s.id]) return BUILTIN_SUBJECT_MAP[s.id];
const nameObj: LocalizedText = typeof s.name === 'object' && s.name !== null ? { bn: String(s.name.bn || s.name.en || s.id), en: String(s.name.en || s.name.bn || s.id) }
: { bn: String(s.name || s.id), en: String(s.name || s.id) };
const chapters: ChapterData[] = Array.isArray(s.chapters) ? s.chapters .filter((c: any) => c && typeof c === 'object') .map((c: any, idx: number) => ({ id: String(c.id || `${s.id}-c${idx + 1}`), name:
typeof c.name === 'object' && c.name !== null ? { bn: String(c.name.bn || c.name.en || ''), en: String(c.name.en || c.name.bn || '') } : { bn: String(c.name || ''), en: String(c.name || '') },
mcqs: Array.isArray(c.mcqs) ? c.mcqs : [], cqs: Array.isArray(c.cqs) ? c.cqs : [], formulas: Array.isArray(c.formulas) ? c.formulas : [], })) : [];
return { id: String(s.id), name: nameObj, icon: String(s.icon || '📘'), color: String(s.color || '#4F46E5'), rgb: String(s.rgb || '79, 70, 229'), chapters, }; });
const existingIds = new Set(sanitized.map((s) => s.id));
const missingBuiltIns = fallbackList.filter((b) => !existingIds.has(b.id));
return [...sanitized, ...missingBuiltIns]; }
function mergeBuiltInSubjects(savedDB?: Record<string, Record<string, SubjectData[]>>) { if (!savedDB || typeof savedDB !== 'object') return INITIAL_SYLLABUS_DB;
const merged: Record<string, Record<string, SubjectData[]>> = {};
Object.keys(INITIAL_SYLLABUS_DB).forEach((cls) => { merged[cls] = {}; Object.keys(INITIAL_SYLLABUS_DB[cls]).forEach((grp) => { const fallback = INITIAL_SYLLABUS_DB[cls][grp]; const savedList = savedDB[cls]?.[grp]; merged[cls][grp] = sanitizeSubjectList(savedList || fallback, fallback); }); });
return merged; }
function loadPersistedState(): Partial<ExamStoreState> { if (typeof window === 'undefined') return {};
try { const v12Raw = window.localStorage.getItem(STORAGE_KEY);
const legacyRaw = window.localStorage.getItem('examverse-v11-storage') || window.localStorage.getItem('examverse-v10-storage') || window.localStorage.getItem('examverse-v9-storage') ||
window.localStorage.getItem('examverse-v8-storage') || window.localStorage.getItem('examverse-v7-storage');
const raw = v12Raw || legacyRaw;
if (!raw) return {};
const parsed = JSON.parse(raw);
if (!parsed || typeof parsed !== 'object') return {};
return { ...parsed, selectedGroup: v12Raw ? parsed.selectedGroup : 'All Groups', activeTab: getInitialTabFromHashOrStorage(parsed.activeTab), syllabusDB: mergeBuiltInSubjects(parsed.syllabusDB), }; } catch { return {}; }
}
let saveTimer: any = null;
function scheduleSavePersisted(state: ExamStoreState) { if (typeof window === 'undefined') return;
if (saveTimer) clearTimeout(saveTimer);
saveTimer = setTimeout(() => { try { const payload = { activeTab: state.activeTab, selectedSubjectId: state.selectedSubjectId, formulaSubjectId: state.formulaSubjectId, formulaChapterId: state.formulaChapterId,
language: state.language, darkMode: state.darkMode, selectedClass: state.selectedClass, selectedGroup: state.selectedGroup, userId: state.userId, userName: state.userName, userEmail: state.userEmail,
userAvatar: state.userAvatar, isAuthenticated: state.isAuthenticated, xp: state.xp, level: state.level, streak: state.streak, weeklyActivity: state.weeklyActivity, chapterMastery: state.chapterMastery,
examHistory: state.examHistory, mistakes: state.mistakes, flashcards: state.flashcards, studyTasks: state.studyTasks, communityPosts: state.communityPosts, friendsList: state.friendsList,
questionReports: state.questionReports, adminPin: state.adminPin, };
window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch { } }, 120); }
const persisted = loadPersistedState();
const initialDark = Boolean(persisted.darkMode);
applyThemeToDocument(initialDark);
const listeners = new Set<() => void>();
let storeState: ExamStoreState = { activeTab: getInitialTabFromHashOrStorage(persisted.activeTab), selectedSubjectId: persisted.selectedSubjectId ?? null, formulaSubjectId: persisted.formulaSubjectId ?? null,
formulaChapterId: persisted.formulaChapterId ?? null, language: persisted.language === 'en' || persisted.language === 'bn' || persisted.language === 'bilingual' ? persisted.language : 'bn', darkMode: initialDark,
selectedClass: typeof persisted.selectedClass === 'string' && persisted.selectedClass ? persisted.selectedClass : 'HSC',
selectedGroup: typeof persisted.selectedGroup === 'string' && persisted.selectedGroup ? persisted.selectedGroup : 'All Groups',
userId: typeof persisted.userId === 'string' && persisted.userId ? persisted.userId : 'guest-user', userName: typeof persisted.userName === 'string' && persisted.userName.trim() ? persisted.userName : 'শিক্ষার্থী',
userEmail: typeof persisted.userEmail === 'string' ? persisted.userEmail : '', userAvatar: typeof persisted.userAvatar === 'string' ? persisted.userAvatar : '', isAuthenticated: Boolean(persisted.isAuthenticated),
xp: typeof persisted.xp === 'number' && !Number.isNaN(persisted.xp) ? persisted.xp : 0, level: typeof persisted.level === 'number' && !Number.isNaN(persisted.level) ? persisted.level : 1,
streak: typeof persisted.streak === 'number' && !Number.isNaN(persisted.streak) ? persisted.streak : 1, weeklyActivity: Array.isArray(persisted.weeklyActivity) ? persisted.weeklyActivity
: [true, false, false, false, false, false, false], chapterMastery: persisted.chapterMastery && typeof persisted.chapterMastery === 'object' ? persisted.chapterMastery : {},
examHistory: Array.isArray(persisted.examHistory) ? persisted.examHistory : [], mistakes: Array.isArray(persisted.mistakes) ? persisted.mistakes : [],
flashcards: Array.isArray(persisted.flashcards) ? persisted.flashcards : [], studyTasks: Array.isArray(persisted.studyTasks) ? persisted.studyTasks : [],
communityPosts: Array.isArray(persisted.communityPosts) ? persisted.communityPosts : [], friendsList: Array.isArray(persisted.friendsList) ? persisted.friendsList : ['তানভীর আহমেদ', 'সাদিয়া ইসলাম', 'রাকিবুল হাসান'],
questionReports: Array.isArray(persisted.questionReports) ? persisted.questionReports : [], syllabusDB: mergeBuiltInSubjects(persisted.syllabusDB), activeQuiz: null, settingsOpen: false, isSettingsModalOpen: false,
authModalOpen: false, isAuthModalOpen: false, isAdminUnlocked: false, adminPin: typeof persisted.adminPin === 'string' && persisted.adminPin ? persisted.adminPin : '1234', setActiveTab: (tab) => {
if (typeof window !== 'undefined' && tab && window.history?.replaceState) { const currHash = window.location.hash.replace(/^#/, '');
if (!currHash.startsWith('access_token=') && currHash !== tab) { window.history.replaceState(null, '', `#${tab}`); } }
setState({ activeTab: tab }); }, setSelectedSubjectId: (id) => setState({ selectedSubjectId: id }), setFormulaTarget: (subjectId, chapterId) => setState({ formulaSubjectId: subjectId, formulaChapterId: chapterId }),
openSubjectFormulas: (subjectId, chapterId = 'all') => { setState({ formulaSubjectId: subjectId, formulaChapterId: chapterId || 'all', selectedSubjectId: null, activeTab: 'formulas', }); },
setLanguage: (language) => setState({ language }), toggleDarkMode: () => { const next = !storeState.darkMode;
applyThemeToDocument(next);
setState({ darkMode: next }); }, setClassAndGroup: (selectedClass, selectedGroup) => { const validGroups = getAvailableGroups(selectedClass);
const resolvedGroup = validGroups.includes(selectedGroup) ? selectedGroup : validGroups[0] || 'All Groups';
setState({ selectedClass, selectedGroup: resolvedGroup, selectedSubjectId: null, formulaSubjectId: null }); }, setUserProfile: ({ id, name, email, avatar, isAuthenticated }) => {
const uid = id || storeState.userId || `user-${Date.now()}`;
const uName = (name || (email ? email.split('@')[0] : '') || 'শিক্ষার্থী').trim();
const uAvatar = avatar ?? storeState.userAvatar ?? '';
setState({ userId: uid, userName: uName, userEmail: email ?? storeState.userEmail, userAvatar: uAvatar, isAuthenticated: isAuthenticated ?? true, authModalOpen: false, isAuthModalOpen: false, });
const supaMod = RawSupabase as any;
if (typeof supaMod?.upsertLiveUserProfile === 'function') { supaMod.upsertLiveUserProfile({ id: uid, name: uName, email: email ?? storeState.userEmail, avatar: uAvatar, xp: storeState.xp, level: storeState.level,
streak: storeState.streak, selectedClass: storeState.selectedClass, selectedGroup: storeState.selectedGroup, chapterMastery: storeState.chapterMastery, }); } }, logoutUser: async () => {
const supaMod = RawSupabase as any;
if (supaMod?.supabase?.auth) { try { await supaMod.supabase.auth.signOut(); } catch { } }
setState({ userId: 'guest-user', userName: 'শিক্ষার্থী', userEmail: '', userAvatar: '', isAuthenticated: false, authModalOpen: false, isAuthModalOpen: false, }); },
setSettingsOpen: (open) => setState({ settingsOpen: open, isSettingsModalOpen: open }), setSettingsModalOpen: (open) => setState({ settingsOpen: open, isSettingsModalOpen: open }),
setAuthModalOpen: (open) => setState({ authModalOpen: open, isAuthModalOpen: open }), startQuiz: (activeQuiz) => setState({ activeQuiz }), closeQuiz: () => setState({ activeQuiz: null }),
recordExamResult: (result, newMistakesArg) => { const accuracy = typeof result.accuracy === 'number' ? result.accuracy : result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
const xpEarned = typeof result.xpEarned === 'number' ? result.xpEarned : Math.max(15, result.score * 12 + (accuracy >= 80 ? 30 : 10));
const newXp = storeState.xp + xpEarned;
const newLevel = getLevelProgress(newXp).level;
const historyItem: ExamHistoryItem = { id: `exam-${Date.now()}`, date: new Date().toISOString().slice(0, 10), subjectId: result.subjectId, subjectName: result.subjectName, chapterId: result.chapterId,
chapterName: result.chapterName, mode: result.mode, score: result.score, total: result.total, accuracy, timeSpentSec: result.timeSpentSec, xpEarned, };
const nextMastery = { ...storeState.chapterMastery };
if (result.chapterId) { const prev = nextMastery[result.chapterId] || 40;
nextMastery[result.chapterId] = Math.min(100, Math.round(prev * 0.4 + accuracy * 0.6)); }
const existingMistakes = [...storeState.mistakes];
if (Array.isArray(newMistakesArg) && newMistakesArg.length > 0) {
newMistakesArg.forEach((nm) => { const idx = existingMistakes.findIndex((m) => m.questionId === nm.questionId); if (idx >= 0) { existingMistakes[idx] = { ...existingMistakes[idx], selectedIndex: nm.selectedIndex, wrongCount: (existingMistakes[idx].wrongCount || 1) + 1, lastMissedAt: new Date().toISOString().slice(0, 10), mastered: false, }; } else { existingMistakes.unshift(nm); } });
}
(result.wrongQuestions || []).forEach(({ question, selectedIndex }: any) => { const idx = existingMistakes.findIndex((m) => m.questionId === question.id); if (idx >= 0) { existingMistakes[idx] = { ...existingMistakes[idx], selectedIndex, wrongCount: existingMistakes[idx].wrongCount + 1, lastMissedAt: new Date().toISOString().slice(0, 10), mastered: false, }; } else { existingMistakes.unshift({ id: `mst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, questionId: question.id, subjectId: result.subjectId, subjectName: result.subjectName, chapterName: result.chapterName || '', question: question.q, options: question.options, correctIndex: question.ans, selectedIndex, explanation: question.explanation, wrongCount: 1, lastMissedAt: new Date().toISOString().slice(0, 10), mastered: false, }); } });
setState({ xp: newXp, level: newLevel, examHistory: [historyItem, ...storeState.examHistory], chapterMastery: nextMastery, mistakes: existingMistakes, });
const supaMod = RawSupabase as any;
if (storeState.isAuthenticated && typeof supaMod?.upsertLiveUserProfile === 'function') { supaMod.upsertLiveUserProfile({ id: storeState.userId, name: storeState.userName, email: storeState.userEmail,
avatar: storeState.userAvatar, xp: newXp, level: newLevel, streak: storeState.streak, selectedClass: storeState.selectedClass, selectedGroup: storeState.selectedGroup, chapterMastery: nextMastery, }); } },
markMistakeMastered: (id) => setState({ mistakes: storeState.mistakes.map((m) => (m.id === id ? { ...m, mastered: true } : m)) }), addFlashcard: (front, back, subjectId = 'general') =>
setState({ flashcards: [ { id: `fc-${Date.now()}`, subjectId, front: { bn: front, en: front }, back: { bn: back, en: back }, box: 1, nextReviewDate: new Date().toISOString().slice(0, 10) }, ...storeState.flashcards, ],
}), deleteFlashcard: (id) => setState({ flashcards: storeState.flashcards.filter((f) => f.id !== id) }),
updateFlashcardBox: (id, box) => setState({ flashcards: storeState.flashcards.map((f) => (f.id === id ? { ...f, box } : f)) }),
addStudyTask: (task) => setState({ studyTasks: [{ ...task, id: `task-${Date.now()}`, completed: false }, ...storeState.studyTasks] }),
toggleStudyTask: (id) => setState({ studyTasks: storeState.studyTasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)) }),
deleteStudyTask: (id) => setState({ studyTasks: storeState.studyTasks.filter((t) => t.id !== id) }), addCommunityPost: ({ authorName, authorAvatar, authorRank, subjectName, title, body }) =>
setState({ communityPosts: [ { id: `post-${Date.now()}`, authorId: storeState.userId, authorName: authorName || storeState.userName || 'শিক্ষার্থী', authorAvatar: authorAvatar || storeState.userAvatar || '🎓',
authorRank: authorRank || storeState.getRankInfo().fullTitleBn, subjectName, title, body, createdAt: 'এইমাত্র', likes: 0, solved: false, replies: [], }, ...storeState.communityPosts, ], }),
addCommunityReply: (postId, authorOrText, maybeText) => { const finalAuthor = maybeText !== undefined ? authorOrText : storeState.userName || 'শিক্ষার্থী';
const finalText = maybeText !== undefined ? maybeText : authorOrText;
setState({ communityPosts: storeState.communityPosts.map((p) =>
p.id !== postId ? p : { ...p, replies: [...p.replies, { id: `rep-${Date.now()}`, authorName: finalAuthor, text: finalText, createdAt: 'এইমাত্র' }], } ), }); },
likeCommunityPost: (postId) => setState({ communityPosts: storeState.communityPosts.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)) }),
togglePostLike: (postId) => setState({ communityPosts: storeState.communityPosts.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)) }), addFriendByCode: (codeOrName) => {
const clean = (codeOrName || '').trim();
if (!clean) return;
if (!storeState.friendsList.includes(clean)) { setState({ friendsList: [...storeState.friendsList, clean] }); } }, reportQuestionError: (payload) => { const nowStr = new Date().toLocaleString('bn-BD');
const newReport: QuestionErrorReport = { id: `qrep-${Date.now()}`, questionId: payload.questionId || '', subjectId: payload.subjectId || '', subjectName: payload.subjectName || '', chapterId: payload.chapterId || '',
chapterName: payload.chapterName || '', questionText: payload.questionText || '', options: Array.isArray(payload.options) ? payload.options : [], currentAns: payload.currentAns ?? payload.currentCorrectIndex ?? 0,
currentCorrectIndex: payload.currentCorrectIndex ?? payload.currentAns ?? 0, suggestedCorrectIndex: payload.suggestedCorrectIndex ?? payload.currentAns ?? 0, issueType: payload.issueType || 'উত্তর ভুল',
comment: payload.comment || payload.note || '', note: payload.note || payload.comment || '', reportedBy: payload.reportedBy || storeState.userName || 'শিক্ষার্থী', reportedAt: nowStr, createdAt: nowStr,
status: 'pending', };
setState({ questionReports: [newReport, ...storeState.questionReports] }); }, submitQuestionReport: (payload) => storeState.reportQuestionError(payload),
resolveQuestionReport: (reportId, applySuggestedAnswer = false) => { const target = storeState.questionReports.find((r) => r.id === reportId);
let nextDB = storeState.syllabusDB;
if (target && applySuggestedAnswer) { nextDB = { ...storeState.syllabusDB };
Object.keys(nextDB).forEach((cls) => { nextDB[cls] = { ...nextDB[cls] }; Object.keys(nextDB[cls]).forEach((grp) => { nextDB[cls][grp] = nextDB[cls][grp].map((subj) => subj.id !== target.subjectId ? subj : { ...subj, chapters: subj.chapters.map((ch) => ch.id !== target.chapterId ? ch : { ...ch, mcqs: ch.mcqs.map((m) => (m.id === target.questionId ? { ...m, ans: target.suggestedCorrectIndex } : m)) } ), } ); }); });
}
setState({ syllabusDB: nextDB, questionReports: storeState.questionReports.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r)), }); },
deleteQuestionReport: (reportId) => setState({ questionReports: storeState.questionReports.filter((r) => r.id !== reportId) }), unlockAdmin: (pin) => {
const valid = pin.trim() === storeState.adminPin || pin.trim() === '1234';
if (valid) setState({ isAdminUnlocked: true });
return valid; }, lockAdmin: () => setState({ isAdminUnlocked: false, activeTab: 'dashboard' }), setAdminPin: (newPin) => { if (newPin.trim().length >= 4) setState({ adminPin: newPin.trim() }); },
importBulkMcqs: ({ targetClass, targetGroup, subjectId, subjectNameBn, subjectNameEn, rawText }) => { const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
let addedQuestions = 0;
const chapterSet = new Set<string>();
const nextDB = { ...storeState.syllabusDB };
const clsMap = { ...(nextDB[targetClass] || {}) };
const grpList = [...(clsMap[targetGroup] || [])];
let subjIdx = grpList.findIndex((s) => s.id === subjectId);
if (subjIdx < 0) { grpList.push({ id: subjectId, name: { bn: subjectNameBn, en: subjectNameEn || subjectNameBn }, icon: '📚', color: '#4F46E5', rgb: '79, 70, 229', chapters: [], });
subjIdx = grpList.length - 1; }
const targetSubj = { ...grpList[subjIdx], chapters: [...grpList[subjIdx].chapters] };
const ansMap: Record<string, number> = { ক: 0, খ: 1, গ: 2, ঘ: 3, A: 0, B: 1, C: 2, D: 3, a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3, '0': 0 };
lines.forEach((line, idx) => { const cols = line.includes('\t') ? line.split('\t') : line.split(','); if (cols.length < 6) return; const chapName = (cols[0] || 'অধ্যায় ১').trim(); const qText = (cols[1] || '').trim(); if (!qText || qText === 'প্রশ্ন' || qText.toLowerCase() === 'question') return; const [optA, optB, optC, optD] = [(cols[2] || '').trim(), (cols[3] || '').trim(), (cols[4] || '').trim(), (cols[5] || '').trim()]; const ansIdx = ansMap[(cols[6] || 'ক').trim()] ?? 0; const boardTag = (cols[7] || '').trim(); let chIdx = targetSubj.chapters.findIndex((c) => c.name.bn === chapName || c.name.en === chapName); if (chIdx < 0) { const newChId = `${subjectId}-ch-${targetSubj.chapters.length + 1}`; targetSubj.chapters.push({ id: newChId, name: { bn: chapName, en: chapName }, mcqs: [], cqs: [], formulas: [] }); chIdx = targetSubj.chapters.length - 1; chapterSet.add(newChId); } else { targetSubj.chapters[chIdx] = { ...targetSubj.chapters[chIdx], mcqs: [...targetSubj.chapters[chIdx].mcqs] }; } targetSubj.chapters[chIdx].mcqs.push({ id: `${subjectId}-q-${Date.now()}-${idx}`, q: { bn: qText, en: qText }, options: { bn: [optA, optB, optC, optD], en: [optA, optB, optC, optD] }, ans: ansIdx, boardTag: boardTag || undefined, }); addedQuestions++; });
grpList[subjIdx] = targetSubj;
clsMap[targetGroup] = grpList;
nextDB[targetClass] = clsMap;
setState({ syllabusDB: nextDB });
return { addedQuestions, addedChapters: chapterSet.size }; },
addSingleCustomMcq: ({ targetClass, targetGroup, subjectId, subjectNameBn, subjectNameEn, chapterNameBn, questionBn, optionsBn, ansIndex, boardTag, explanationBn }) => { const nextDB = { ...storeState.syllabusDB };
const clsMap = { ...(nextDB[targetClass] || {}) };
const grpList = [...(clsMap[targetGroup] || [])];
let subjIdx = grpList.findIndex((s) => s.id === subjectId);
if (subjIdx < 0) { grpList.push({ id: subjectId, name: { bn: subjectNameBn, en: subjectNameEn || subjectNameBn }, icon: '📚', color: '#4F46E5', rgb: '79, 70, 229', chapters: [], });
subjIdx = grpList.length - 1; }
const targetSubj = { ...grpList[subjIdx], chapters: [...grpList[subjIdx].chapters] };
const chapTitle = chapterNameBn || 'অধ্যায় ১';
let chIdx = targetSubj.chapters.findIndex((c) => c.name.bn === chapTitle || c.name.en === chapTitle);
if (chIdx < 0) { targetSubj.chapters.push({ id: `${subjectId}-ch-${targetSubj.chapters.length + 1}`, name: { bn: chapTitle, en: chapTitle }, mcqs: [], cqs: [], formulas: [] });
chIdx = targetSubj.chapters.length - 1; } else { targetSubj.chapters[chIdx] = { ...targetSubj.chapters[chIdx], mcqs: [...targetSubj.chapters[chIdx].mcqs] }; }
targetSubj.chapters[chIdx].mcqs.push({ id: `${subjectId}-q-${Date.now()}`, q: { bn: questionBn, en: questionBn }, options: { bn: optionsBn, en: optionsBn }, ans: ansIndex, boardTag: boardTag || undefined,
explanation: explanationBn ? { bn: explanationBn, en: explanationBn } : undefined, });
grpList[subjIdx] = targetSubj;
clsMap[targetGroup] = grpList;
nextDB[targetClass] = clsMap;
setState({ syllabusDB: nextDB }); }, updateCustomMcqAnswer: (cls, grp, subjectId, chapterId, questionId, newAnsIndex) => { const nextDB = { ...storeState.syllabusDB };
if (!nextDB[cls]?.[grp]) return;
nextDB[cls] = { ...nextDB[cls], [grp]: nextDB[cls][grp].map((s) =>
s.id !== subjectId ? s : { ...s, chapters: s.chapters.map((c) => (c.id !== chapterId ? c : { ...c, mcqs: c.mcqs.map((m) => (m.id === questionId ? { ...m, ans: newAnsIndex } : m)) })) } ), };
setState({ syllabusDB: nextDB }); }, editCustomMcqFull: ({ targetClass, targetGroup, subjectId, chapterId, questionId, questionBn, optionsBn, ansIndex }) => { const nextDB = { ...storeState.syllabusDB };
if (!nextDB[targetClass]?.[targetGroup]) return;
nextDB[targetClass] = { ...nextDB[targetClass], [targetGroup]: nextDB[targetClass][targetGroup].map((s) =>
s.id !== subjectId ? s : { ...s, chapters: s.chapters.map((c) =>
c.id !== chapterId ? c : { ...c, mcqs: c.mcqs.map((m) => (m.id === questionId ? { ...m, q: { bn: questionBn, en: questionBn }, options: { bn: optionsBn, en: optionsBn }, ans: ansIndex } : m)) } ), } ), };
setState({ syllabusDB: nextDB }); }, deleteCustomMcq: (cls, grp, subjectId, chapterId, questionId) => { storeState.adminDeleteQuestion({ className: cls, groupName: grp, subjectId, chapterId, questionId }); },
deleteCustomSubject: (cls, grp, subjectId) => { const nextDB = { ...storeState.syllabusDB };
if (!nextDB[cls]?.[grp]) return;
const defaultList = INITIAL_SYLLABUS_DB[cls]?.[grp] || [];
const defaultSubj = defaultList.find((s) => s.id === subjectId);
nextDB[cls] = { ...nextDB[cls], [grp]: defaultSubj ? nextDB[cls][grp].map((s) => (s.id === subjectId ? defaultSubj : s)) : nextDB[cls][grp].filter((s) => s.id !== subjectId), };
setState({ syllabusDB: nextDB }); }, exportProjectSyllabusCode: () => {
return `// ExamVerse Exported Syllabus Backup (${new Date().toISOString()})\nexport const EXPORTED_SYLLABUS_DB = ${JSON.stringify(storeState.syllabusDB, null, 2)};\n`; }, resetAllDemoAndProgress: () => { try {
window.localStorage.removeItem(STORAGE_KEY);
window.localStorage.removeItem('examverse-v11-storage');
window.localStorage.removeItem('examverse-v10-storage');
window.localStorage.removeItem('examverse-v9-storage');
window.localStorage.removeItem('examverse-v8-storage');
window.localStorage.removeItem('examverse-v7-storage'); } catch { }
setState({ xp: 0, level: 1, streak: 1, chapterMastery: {}, examHistory: [], mistakes: [], flashcards: [], studyTasks: [], communityPosts: [], questionReports: [], syllabusDB: INITIAL_SYLLABUS_DB, }); },
adminAddQuestion: ({ className, groupName, subjectId, chapterId, question }) => { const nextDB = { ...storeState.syllabusDB };
const groups = nextDB[className];
if (!groups || !groups[groupName]) return;
nextDB[className] = { ...groups, [groupName]: groups[groupName].map((s) => (s.id !== subjectId ? s : { ...s, chapters: s.chapters.map((c) => (c.id !== chapterId ? c : { ...c, mcqs: [question, ...c.mcqs] })) })), };
setState({ syllabusDB: nextDB }); }, adminBulkImportQuestions: ({ className, groupName, subjectId, chapterId, questions }) => { if (!questions.length) return 0;
const nextDB = { ...storeState.syllabusDB };
const groups = nextDB[className];
if (!groups || !groups[groupName]) return 0;
nextDB[className] = { ...groups, [groupName]: groups[groupName].map((s) => (s.id !== subjectId ? s : { ...s, chapters: s.chapters.map((c) => (c.id !== chapterId ? c : { ...c, mcqs: [...c.mcqs, ...questions] })) })), };
setState({ syllabusDB: nextDB });
return questions.length; }, adminDeleteQuestion: ({ className, groupName, subjectId, chapterId, questionId }) => { const nextDB = { ...storeState.syllabusDB };
const groups = nextDB[className];
if (!groups || !groups[groupName]) return;
nextDB[className] = { ...groups, [groupName]: groups[groupName].map((s) =>
s.id !== subjectId ? s : { ...s, chapters: s.chapters.map((c) => (c.id !== chapterId ? c : { ...c, mcqs: c.mcqs.filter((m) => m.id !== questionId) })) } ), };
setState({ syllabusDB: nextDB }); }, getRankInfo: () => { const avgAcc = storeState.examHistory.length > 0 ? storeState.examHistory.reduce((acc, e) => acc + e.accuracy, 0) / storeState.examHistory.length : 78;
const masteredCount = Object.values(storeState.chapterMastery).filter((v) => v >= 75).length;
return calculateUserRank({ xp: storeState.xp, accuracyPct: avgAcc, masteredChaptersCount: masteredCount, totalChaptersCount: 24, streakDays: storeState.streak, examsCompleted: storeState.examHistory.length, }); }, };
function setState(partial: Partial<ExamStoreState>) { storeState = { ...storeState, ...partial };
scheduleSavePersisted(storeState);
listeners.forEach((l) => l()); }
function subscribe(listener: () => void) { listeners.add(listener);
return () => listeners.delete(listener); }
function getSnapshot() { return storeState; }
export function useExamStore(): ExamStoreState { return useSyncExternalStore(subscribe, getSnapshot, getSnapshot); }
export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { return React.createElement(React.Fragment, null, children); };
let authSyncInitialized = false;
function initSupabaseAuthAndHashSync() { if (authSyncInitialized || typeof window === 'undefined') return;
authSyncInitialized = true;
window.addEventListener('hashchange', () => { const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
if (rawHash && !rawHash.startsWith('access_token=') && !rawHash.startsWith('error=')) { const normalized = rawHash === 'analytics' ? 'Analytics' : rawHash;
if (VALID_TABS.includes(normalized as NavTabId) && storeState.activeTab !== normalized) { setState({ activeTab: normalized as NavTabId }); } } });
const supaMod = RawSupabase as any;
const client = supaMod?.supabase;
if (!client?.auth) return;
const applySupabaseSessionUser = async (user: any) => { if (!user) return;
const meta = user.user_metadata || {};
const resolvedName = meta.full_name || meta.name || (user.email ? user.email.split('@')[0] : 'শিক্ষার্থী');
const resolvedEmail = user.email || '';
const resolvedAvatar = meta.avatar_url || meta.picture || '';
let nextXp = storeState.xp;
let nextLevel = storeState.level;
let nextStreak = storeState.streak;
let nextMastery = storeState.chapterMastery;
try { const { data: prof } = await client.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
if (prof) { if (typeof prof.xp === 'number' && prof.xp > nextXp) nextXp = prof.xp;
if (typeof prof.level === 'number' && prof.level > nextLevel) nextLevel = prof.level;
if (typeof prof.streak === 'number' && prof.streak > nextStreak) nextStreak = prof.streak;
if (prof.chapter_mastery && typeof prof.chapter_mastery === 'object') { nextMastery = { ...prof.chapter_mastery, ...nextMastery }; } } } catch { }
setState({ userId: user.id, userName: resolvedName, userEmail: resolvedEmail, userAvatar: resolvedAvatar, isAuthenticated: true, authModalOpen: false, isAuthModalOpen: false, xp: nextXp,
level: getLevelProgress(nextXp).level, streak: nextStreak, chapterMastery: nextMastery, });
if (typeof supaMod.upsertLiveUserProfile === 'function') { supaMod.upsertLiveUserProfile({ id: user.id, name: resolvedName, email: resolvedEmail, avatar: resolvedAvatar, xp: nextXp, level: getLevelProgress(nextXp).level,
streak: nextStreak, selectedClass: storeState.selectedClass, selectedGroup: storeState.selectedGroup, chapterMastery: nextMastery, }); }
if (window.location.hash.includes('access_token=') && window.history?.replaceState) { window.history.replaceState(null, '', `#${storeState.activeTab || 'dashboard'}`); } };
client.auth.getSession().then(({ data }: any) => { if (data?.session?.user) applySupabaseSessionUser(data.session.user); });
client.auth.onAuthStateChange((_event: string, session: any) => { if (session?.user) applySupabaseSessionUser(session.user); }); }
initSupabaseAuthAndHashSync();
