import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { HSC_ACCOUNTING_2ND_PAPER_CHAPTERS } from '../data/syllabusData';

export type AcademicLevel = 'SSC' | 'HSC' | 'Admission' | 'Job/BCS';
export type AcademicGroup = 'Science' | 'Business Studies' | 'Humanities';
export type ThemeMode = 'light' | 'dark' | 'sepia';
export type FontSize = 'small' | 'medium' | 'large';

export interface MCQ {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  board?: string;
}

export interface CQ {
  id: string;
  stem: string;
  board?: string;
  qA: string; ansA: string;
  qB: string; ansB: string;
  qC: string; ansC: string;
  qD: string; ansD: string;
}

export interface Chapter {
  id: string;
  name: string;
  mcqs: MCQ[];
  cqs: CQ[];
  formulas?: string[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  paper: string;
  level: AcademicLevel;
  group: AcademicGroup | 'Common';
  icon: string;
  color: string;
  chapters: Chapter[];
}

export interface ExamHistoryItem {
  id: string;
  date: string;
  timestamp?: number;
  subjectId?: string;
  subjectName: string;
  chapterName: string;
  mode: 'Practice' | 'Exam' | 'Mistakes' | 'Bookmarks' | 'DailySprint' | 'Battle1v1';
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
  timeTakenSec: number;
  wrongQuestionIds: string[];
}

export interface QuestionErrorReport {
  id: string;
  questionId: string;
  subjectId: string;
  subjectName: string;
  chapterId: string;
  chapterName: string;
  questionText: string;
  reportedBy: string;
  reason: string;
  suggestedCorrectIndex?: number;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface RegisteredUserSummary {
  id: string;
  name: string;
  email: string;
  institution: string;
  level: AcademicLevel;
  group: AcademicGroup;
  xp: number;
  totalExams: number;
  joinedAt: string;
  isBanned?: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  institution: string;
  targetGoal: string;
  bio: string;
  level: AcademicLevel;
  group: AcademicGroup;
  xp: number;
  streak: number;
  lastActiveDate?: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

// 100% RealHSC Accounting 2nd Paper with all 297 MCQs across 10 chapters
const HSC_ACCOUNTING_2ND_PAPER: Subject = {
  id: 'acc-2',
  code: '254',
  name: 'হিসাববিজ্ঞান ২য় পত্র',
  paper: '2nd Paper',
  level: 'HSC',
  group: 'Business Studies',
  icon: '📊',
  color: 'amber',
  chapters: HSC_ACCOUNTING_2ND_PAPER_CHAPTERS,
};

// Complete Paper-Separated Subject Structure across SSC & HSC (Common, Science, Business Studies, Humanities)
const INITIAL_SUBJECTS: Subject[] = [
  // ================= HSC COMMON =================
  {
    id: 'hsc-bn-1', code: '101', name: 'বাংলা ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Common', icon: '📖', color: 'emerald',
    chapters: [
      { id: 'h-bn1-c1', name: 'গদ্য: অপরিচিতা, বিলাসী, আমার পথ, মানব-কল্যাণ, মাসি-পিসি, বায়ান্নর দিনগুলো, রেইনকোট', mcqs: [], cqs: [], formulas: ['অপরিচিতা — রবীন্দ্রনাথ ঠাকুর (সবুজপত্র পত্রিকা, ১৯১৪; অনুপম মামার চেয়ে ৬ বছরের ছোট; বিয়ের সময় বয়স ২৭ বছর; কল্যাণীর বয়স ১৫ বছর)', 'বিলাসী — শরৎচন্দ্র চট্টোপাধ্যায় (ভারতী পত্রিকা, ১৯১৮; ন্যাড়ার মাদুলি ও সাপুড়ে জীবন)', 'বায়ান্নর দিনগুলো — শেখ মুজিবুর রহমান (অসমাপ্ত আত্মজীবনী; ১৬ ফেব্রুয়ারি অনশন শুরু)'] },
      { id: 'h-bn1-c2', name: 'পদ্য: সোনার তরী, বিদ্রোহী, প্রতিদান, তাহারেই পড়ে মনে, আঠারো বছর বয়স, ফেব্রুয়ারি ১৯৬৯, আমি কিংবদন্তির কথা বলছি', mcqs: [], cqs: [], formulas: ['সোনার তরী — মাত্রাবৃত্ত ছন্দ (৮+৫ মাত্রা, রবীন্দ্রনাথ ঠাকুর, কাব্যগ্রন্থ: সোনার তরী ১৮৯৪)', 'বিদ্রোহী — কাজী নজরুল ইসলাম (অগ্নিবীণা কাব্যগ্রন্থ ১৯২২, বিজলী পত্রিকা)', 'আঠারো বছর বয়স — সুকান্ত ভট্টাচার্য (ছাড়পত্র কাব্যগ্রন্থ ১৯৪৮, মাত্রাবৃত্ত ছন্দ)'] },
      { id: 'h-bn1-c3', name: 'উপন্যাস (লালসালু) ও নাটক (সিরাজউদ্দৌলা)', mcqs: [], cqs: [], formulas: ['লালসালু — সৈয়দ ওয়ালীউল্লাহ (১৯৪৮; মজিদ, জমিলা, রহিমা, খালেক ব্যাপারী, মহব্বতনগর গ্রাম)', 'সিরাজউদ্দৌলা — সিকান্‌দার আবু জাফর (১৯৬৫; ৪টি অঙ্ক ও ১২টি দৃশ্য; ২৩ জুন ১৭৫৭ পলাশীর যুদ্ধ)'] }
    ]
  },
  {
    id: 'hsc-bn-2', code: '102', name: 'বাংলা ২য় পত্র', paper: '2nd Paper', level: 'HSC', group: 'Common', icon: '✍️', color: 'emerald',
    chapters: [
      { id: 'h-bn2-c1', name: 'বাংলা উচ্চারণের নিয়ম ও বানানের নিয়ম', mcqs: [], cqs: [], formulas: ['অ-ধ্বনির সংবৃত উচ্চারণ: শব্দের আদিতে অ-এর পরে ই/ঈ/উ/ঊ থাকলে অ-এর উচ্চারণ ও-কারের মতো হয় (যেমন: অতি -> ওতি, নদী -> নোদি)', 'ণ-ত্ব বিধান: ঋ, র, ষ-এর পরে মূর্ধন্য ণ হয় (যেমন: ঋণ, তৃণ, বর্ণ, উষ্ণ)'] },
      { id: 'h-bn2-c2', name: 'ব্যাকরণিক শব্দশ্রেণি, শব্দ গঠন (উপসর্গ, সমাস, প্রকৃতি-প্রত্যয়) ও বাক্যতত্ত্ব', mcqs: [], cqs: [], formulas: ['বাংলা উপসর্গ ২১টি (অ, অঘা, অজ, অনা, আ, আড়, আন, আব, ইতি, ঊন, কদ, কু, নি, পাতি, বি, ভর, রাম, স, সা, সু, হা)', 'তৎসম উপসর্গ ২০টি (প্র, পরা, অপ, সম, নি, অব, অনু, নির, দুর, বি, অধি, সু, উৎ, পরি, প্রতি, অভি, অতি, অপি, উপ, আ)'] }
    ]
  },
  {
    id: 'hsc-en-1', code: '107', name: 'English 1st Paper', paper: '1st Paper', level: 'HSC', group: 'Common', icon: '🌐', color: 'blue',
    chapters: [
      { id: 'h-en1-c1', name: 'Seen Comprehension, Flow Chart & Summary Writing', mcqs: [], cqs: [], formulas: ['Flow Chart Rule: Start each box with a Capital letter using Infinitive (To + V1), Gerund (V1+ing), or Noun Phrase — never write full sentences.'] }
    ]
  },
  {
    id: 'hsc-en-2', code: '108', name: 'English 2nd Paper', paper: '2nd Paper', level: 'HSC', group: 'Common', icon: '🔤', color: 'blue',
    chapters: [
      { id: 'h-en2-c1', name: 'Right Form of Verbs, Prepositions, Modifiers, Connectors & Narration', mcqs: [], cqs: [], formulas: ['3rd Conditional: If + Past Perfect (had + V3) -> would/could/might + have + V3', '2nd Conditional: If + Past Indefinite (V2/were) -> would/could/might + V1', '1st Conditional: If + Present Indefinite -> will/can/may + V1', 'Lest + Subject + should/might + V1', 'It is high time / It is time + Subject + V2 (Past Indefinite)'] }
    ]
  },
  {
    id: 'hsc-ict', code: '275', name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', paper: 'Single Paper', level: 'HSC', group: 'Common', icon: '💻', color: 'indigo',
    chapters: [
      { id: 'h-ict-c1', name: '১ম অধ্যায়: বিশ্ব ও বাংলাদেশ প্রেক্ষিত', mcqs: [], cqs: [], formulas: ['ভার্চুয়াল রিয়েলিটি (VR): ত্রিমাত্রিক (3D) সিমুলেশন পরিবেশ', 'ক্রায়োসার্জারি: হিমাঙ্ক তাপমাত্রায় (-41°C থেকে -196°C) তরল নাইট্রোজেন/আর্গন গ্যাস দিয়ে টিউমার ধ্বংস', 'ন্যানোটেকনোলজি: 1 nm = 10⁻⁹ m (1 থেকে 100 nm স্কেল)'] },
      { id: 'h-ict-c2', name: '২য় অধ্যায়: কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং', mcqs: [], cqs: [], formulas: ['ডেটা ট্রান্সমিশন মোড: সিমপ্লেক্স (একমুখী: রেডিও/টিভি), হাফ-ডুপ্লেক্স (ওয়াকিটকি), ফুল-ডুপ্লেক্স (মোবাইল/টেলিফোন)', 'টপোলজি: Mesh সংযোগ সংখ্যা = n(n - 1) / 2', 'অপটিক্যাল ফাইবার: পূর্ণ অভ্যন্তরীণ প্রতিফলন নীতিতে আলোর গতিতে ডেটা স্থানান্তর'] },
      { id: 'h-ict-c3', name: '৩য় অধ্যায়: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস', mcqs: [], cqs: [], formulas: ['De Morgan’s Law 1: (A + B)\' = A\' · B\'', 'De Morgan’s Law 2: (A · B)\' = A\' + B\'', 'XOR Gate: Y = A ⊕ B = A\'B + AB\'', 'XNOR Gate: Y = (A ⊕ B)\' = AB + A\'B\'', 'Half Adder: Sum S = A ⊕ B, Carry C = A · B', 'Full Adder: Sum S = A ⊕ B ⊕ Cin, Carry Cout = AB + BCin + ACin', '2\'s Complement = 1\'s Complement + 1'] },
      { id: 'h-ict-c4', name: '৪র্থ অধ্যায়: ওয়েব ডিজাইন পরিচিতি এবং HTML', mcqs: [], cqs: [], formulas: ['হাইপারলিংক ট্যাগ: <a href="url" target="_blank">Link Text</a>', 'ইমেজ ট্যাগ (Empty Tag): <img src="pic.jpg" alt="text" width="200" height="150" />', 'সাবস্ক্রিপ্ট ও সুপারস্ক্রিপ্ট: H<sub>2</sub>O এবং (a+b)<sup>2</sup>'] },
      { id: 'h-ict-c5', name: '৫ম অধ্যায়: প্রোগ্রামিং ভাষা (C Programming)', mcqs: [], cqs: [], formulas: ['1 + 2 + 3 + ... + n = n(n + 1) / 2', 'ত্রিভুজের ক্ষেত্রফল: Area = 0.5 * base * height বা sqrt(s*(s-a)*(s-b)*(s-c))', 'লিপ ইয়ার শর্ত: (year % 400 == 0) || (year % 4 == 0 && year % 100 != 0)', 'ফরম্যাট স্পেসিফায়ার: int -> %d, float -> %f, double -> %lf, char -> %c, string -> %s'] },
      { id: 'h-ict-c6', name: '৬ষ্ঠ অধ্যায়: ডেটাবেজ ম্যানেজমেন্ট সিস্টেম (DBMS)', mcqs: [], cqs: [], formulas: ['সিলেক্ট কুয়েরি: SELECT * FROM student WHERE gpa = 5.00 ORDER BY roll ASC;', 'ডেটা আপডেট: UPDATE student SET gpa = 5.00 WHERE roll = 101;', 'ডেটা ডিলিট: DELETE FROM student WHERE roll = 101;'] }
    ]
  },

  // ================= HSC SCIENCE =================
  {
    id: 'hsc-phy-1', code: '174', name: 'পদার্থবিজ্ঞান ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Science', icon: '⚛️', color: 'violet',
    chapters: [
      { id: 'h-phy1-c2', name: '২য় অধ্যায়: ভেক্টর', mcqs: [], cqs: [], formulas: ['ভেক্টর লব্ধির মান: R = √(P² + Q² + 2PQ cosα)', 'লব্ধির দিক: tanθ = (Q sinα) / (P + Q cosα)', 'ডট গুণন (স্কেলার গুণন): A · B = AB cosθ', 'ক্রস গুণন (ভেক্টর গুণন): |A × B| = AB sinθ'] },
      { id: 'h-phy1-c4', name: '৪র্থ অধ্যায়: নিউটনীয় বলবিদ্যা', mcqs: [], cqs: [], formulas: ['রৈখিক ভরবেগ ও বল: F = dp/dt = ma', 'কৌণিক ভরবেগ: L = Iω = r × p', 'টর্ক: τ = Iα = rF sinθ', 'কেন্দ্রমুখী বল: Fc = mv² / r = mω²r', 'ব্যাংকিং কোণ: tanθ = v² / rg'] },
      { id: 'h-phy1-c5', name: '৫ম অধ্যায়: কাজ, শক্তি ও ক্ষমতা', mcqs: [], cqs: [], formulas: ['কাজ: W = F · s = Fs cosθ', 'গতিশক্তি: Ek = ½ mv² = p² / 2m', 'স্প্রিংয়ের বিভব শক্তি: Ep = ½ kx²', 'ক্ষমতা ও কর্মদক্ষতা: P = W / t = Fv এবং η = (কার্যকর ক্ষমতা / প্রদত্ত ক্ষমতা) × 100%'] },
      { id: 'h-phy1-c6', name: '৬ষ্ঠ অধ্যায়: মহাকর্ষ ও অভিকর্ষ', mcqs: [], cqs: [], formulas: ['নিউটনের মহাকর্ষ সূত্র: F = G m₁m₂ / r²', 'উচ্চতায় অভিকর্ষজ ত্বরণ: gh = g (R / (R + h))²', 'গভীরতায় অভিকর্ষজ ত্বরণ: gd = g (1 - d / R)', 'মুক্তিবেগ: ve = √(2gR) = √(2GM / R) ≈ 11.2 km/s'] },
      { id: 'h-phy1-c8', name: '৮ম অধ্যায়: পর্যায়বৃত্ত গতি', mcqs: [], cqs: [], formulas: ['সরল ছন্দিত গতির বেগ: v = ω √(A² - x²)', 'ত্বরণ: a = -ω²x', 'সরল দোলকের দোলনকাল: T = 2π √(L / g)'] },
      { id: 'h-phy1-c10', name: '১০ম অধ্যায়: আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব', mcqs: [], cqs: [], formulas: ['আদর্শ গ্যাস সমীকরণ: PV = nRT', 'মূল গড় বর্গবেগ (RMS Speed): c = √(3RT / M) = √(3P / ρ)', 'গড় গতিশক্তি: E = (3/2) nRT (প্রতি অণুর জন্য (3/2) kT)'] }
    ]
  },
  {
    id: 'hsc-phy-2', code: '175', name: 'পদার্থবিজ্ঞান ২য় পত্র', paper: '2nd Paper', level: 'HSC', group: 'Science', icon: '⚡', color: 'violet',
    chapters: [
      { id: 'h-phy2-c1', name: '১ম অধ্যায়: তাপগতিবিদ্যা', mcqs: [], cqs: [], formulas: ['তাপগতিবিদ্যার ১ম সূত্র: dQ = dU + dW = dU + P dV', 'রুদ্ধতাপীয় প্রক্রিয়া: PV^γ = ধ্রুবক এবং TV^(γ-1) = ধ্রুবক', 'কার্নো ইঞ্জিনের কর্মদক্ষতা: η = (1 - T₂ / T₁) × 100%', 'এনট্রপির পরিবর্তন: dS = dQ / T'] },
      { id: 'h-phy2-c2', name: '২য় অধ্যায়: স্থির তড়িৎ', mcqs: [], cqs: [], formulas: ['কুলম্বের সূত্র: F = (1 / 4πε₀) · (q₁q₂ / r²)', 'তড়িৎ বিভব: V = (1 / 4πε₀) · (q / r)', 'ধারকের সঞ্চিত শক্তি: U = ½ CV² = ½ QV = Q² / 2C'] },
      { id: 'h-phy2-c3', name: '৩য় অধ্যায়: চল তড়িৎ', mcqs: [], cqs: [], formulas: ['ওহমের সূত্র: V = IR', 'জুলের তাপীয় ক্রিয়া: H = I²Rt', 'শান্টের তড়িৎ প্রবাহ: Is = I · G / (G + S)', 'হুইটস্টোন ব্রিজের সাম্যাবস্থা: P / Q = R / S'] },
      { id: 'h-phy2-c8', name: '৮ম অধ্যায়: আধুনিক পদার্থবিজ্ঞানের সূচনা', mcqs: [], cqs: [], formulas: ['কাল দীর্ঘায়ন: t = t₀ / √(1 - v²/c²)', 'ভর-শক্তি সমীকরণ: E = mc²', 'আইনস্টাইনের আলোক তড়িৎ সমীকরণ: hf = hf₀ + Ek(max)', 'ডি ব্রগলি তরঙ্গদৈর্ঘ্য: λ = h / p = h / mv'] }
    ]
  },
  {
    id: 'hsc-chem-1', code: '176', name: 'রসায়ন ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Science', icon: '🧪', color: 'teal',
    chapters: [
      { id: 'h-ch1-c2', name: '২য় অধ্যায়: গুণগত রসায়ন', mcqs: [], cqs: [], formulas: ['বোর কক্ষপথের কৌণিক ভরবেগ: mvr = nh / 2π', 'রিডবার্গ সমীকরণ: 1/λ = R_H · Z² · (1/n₁² - 1/n₂²) (R_H = 109678 cm⁻¹)', 'দ্রাব্যতা গুণফল: Ksp = [A^y+]^x · [B^x-]^y (যেমন Ag₂CrO₄ এর জন্য Ksp = 4S³)'] },
      { id: 'h-ch1-c3', name: '৩য় অধ্যায়: মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন', mcqs: [], cqs: [], formulas: ['সংকরায়ন নির্ণয় সূত্র: H = ½ [যোজ্যতা ইলেকট্রন + একযোজী পরমাণু - ক্যাটায়ন চার্জ + অ্যানায়ন চার্জ] (H=2 -> sp, H=3 -> sp², H=4 -> sp³)'] },
      { id: 'h-ch1-c4', name: '৪র্থ অধ্যায়: রাসায়নিক পরিবর্তন', mcqs: [], cqs: [], formulas: ['সাম্যধ্রুবক সম্পর্ক: Kp = Kc (RT)^Δn', 'পানির আয়নিক গুণফল (25°C): Kw = [H⁺][OH⁻] = 10⁻¹⁴ এবং pH + pOH = 14', 'হেন্ডারসন-হ্যাসেলবালখ সমীকরণ (অম্লীয় বাফার): pH = pKa + log([লবণ] / [অম্ল])'] }
    ]
  },
  {
    id: 'hsc-chem-2', code: '177', name: 'রসায়ন ২য় পত্র', paper: '2nd Paper', level: 'HSC', group: 'Science', icon: '⚗️', color: 'teal',
    chapters: [
      { id: 'h-ch2-c1', name: '১ম অধ্যায়: পরিবেশ রসায়ন', mcqs: [], cqs: [], formulas: ['বয়েলের সূত্র: P₁V₁ = P₂V₂', 'সমন্বয় সূত্র: P₁V₁ / T₁ = P₂V₂ / T₂', 'ডাল্টনের আংশিক চাপ সূত্র: P_A = X_A · P_total', 'গ্রাহামের ব্যাপন সূত্র: r₁ / r₂ = √(M₂ / M₁) = √(d₂ / d₁)', 'বাস্তব গ্যাসের ভ্যানডার ওয়ালস সমীকরণ: (P + n²a/V²)(V - nb) = nRT'] },
      { id: 'h-ch2-c3', name: '৩য় অধ্যায়: পরিমাণগত রসায়ন', mcqs: [], cqs: [], formulas: ['মোলারিটি: S = (w × 1000) / (M × V_mL)', 'শতকরা ঘনমাত্রা থেকে মোলারিটি: S = (10 × x% × d) / M', 'প্রশমন/টাইট্রেশন সমীকরণ: e₁ V₁ S₁ = e₂ V₂ S₂', 'বিয়ার-ল্যাম্বার্ট সূত্র: A = log(I₀ / I) = ε c l'] },
      { id: 'h-ch2-c4', name: '৪র্থ অধ্যায়: তড়িৎ রসায়ন', mcqs: [], cqs: [], formulas: ['ফ্যারাডের ১ম সূত্র: W = ZIt = (M · I · t) / (n · F) (এখানে F = 96500 C)', 'কোষ বিভব: E°_cell = E°_anode(ox) + E°_cathode(red)', 'নার্নস্ট সমীকরণ (25°C): E_cell = E°_cell - (0.0592 / n) log Q'] }
    ]
  },
  {
    id: 'hsc-math-1', code: '265', name: 'উচ্চতর গণিত ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Science', icon: '📐', color: 'rose',
    chapters: [
      { id: 'h-m1-c1', name: '১ম অধ্যায়: ম্যাট্রিক্স ও নির্ণায়ক', mcqs: [], cqs: [], formulas: ['2×2 বিপরীত ম্যাট্রিক্স: A⁻¹ = (1 / (ad - bc)) · [d, -b; -c, a]', 'ব্যতিক্রমী ম্যাট্রিক্সের শর্ত: |A| = 0'] },
      { id: 'h-m1-c3', name: '৩য় অধ্যায়: সরলরেখা', mcqs: [], cqs: [], formulas: ['দুই বিন্দুর দূরত্ব: d = √((x₁-x₂)² + (y₁-y₂)²)', 'ঢাল: m = tanθ = (y₂ - y₁) / (x₂ - x₁)', 'বিন্দু হতে রেখার লম্ব দূরত্ব: d = |ax₁ + by₁ + c| / √(a² + b²)'] },
      { id: 'h-m1-c4', name: '৪র্থ অধ্যায়: বৃত্ত', mcqs: [], cqs: [], formulas: ['সাধারণ সমীকরণ x² + y² + 2gx + 2fy + c = 0 এর কেন্দ্র (-g, -f) এবং ব্যাসার্ধ r = √(g² + f² - c)', 'x-অক্ষের খণ্ডিতাংশ = 2√(g² - c) এবং y-অক্ষের খণ্ডিতাংশ = 2√(f² - c)'] },
      { id: 'h-m1-c9', name: '৯ম ও ১০ম অধ্যায়: অন্তরীকরণ ও যোগজীকরণ (Calculus)', mcqs: [], cqs: [], formulas: ['lim(x→0) (sin x / x) = 1', 'd/dx (xⁿ) = n xⁿ⁻¹', 'd/dx (eˣ) = eˣ এবং d/dx (ln x) = 1/x', 'd/dx (uv) = u dv/dx + v du/dx', '∫ xⁿ dx = xⁿ⁺¹ / (n + 1) + c (n ≠ -1)', '∫ u v dx = u ∫v dx - ∫ [ (du/dx) ∫v dx ] dx'] }
    ]
  },
  {
    id: 'hsc-math-2', code: '266', name: 'উচ্চতর গণিত ২য় পত্র', paper: '2nd Paper', level: 'HSC', group: 'Science', icon: '♾️', color: 'rose',
    chapters: [
      { id: 'h-m2-c3', name: '৩য় অধ্যায়: জটিল সংখ্যা', mcqs: [], cqs: [], formulas: ['z = x + iy হলে মডুলাস r = |z| = √(x² + y²) এবং আর্গুমেন্ট θ = tan⁻¹(y/x)', 'এককের ঘনমূল ω এর ধর্ম: 1 + ω + ω² = 0 এবং ω³ = 1'] },
      { id: 'h-m2-c4', name: '৪র্থ অধ্যায়: বহুপদী ও বহুপদী সমীকরণ', mcqs: [], cqs: [], formulas: ['ax² + bx + c = 0 সমীকরণের মূল α, β হলে: α + β = -b/a এবং αβ = c/a', 'নিশ্চায়ক D = b² - 4ac (D = 0 হলে মূলদ্বয় বাস্তব ও সমান)'] },
      { id: 'h-m2-c6', name: '৬ষ্ঠ অধ্যায়: কণিক (পরাবৃত্ত, উপবৃত্ত, অধিবৃত্ত)', mcqs: [], cqs: [], formulas: ['পরাবৃত্ত y² = 4ax এর উপকেন্দ্র (a, 0), নিয়ামক x = -a, উপকেন্দ্রিক লম্বের দৈর্ঘ্য = 4a', 'উপবৃত্ত x²/a² + y²/b² = 1 (a>b) এর উৎকেন্দ্রিকতা e = √(1 - b²/a²), উপকেন্দ্র (±ae, 0)'] },
      { id: 'h-m2-c8', name: '৮ম ও ৯ম অধ্যায়: স্থিতিবিদ্যা ও সমতলে বস্তুকণার গতি', mcqs: [], cqs: [], formulas: ['লামির উপপাদ্য: P / sinα = Q / sinβ = R / sinγ', 'প্রাসের সর্বাধিক উচ্চতা: H = (u² sin²α) / 2g', 'প্রাসের অনুভূমিক পাল্লা: R = (u² sin 2α) / g (সর্বাধিক পাল্লা R_max = u²/g যখন α = 45°)', 'উড্ডয়নকাল: T = (2u sinα) / g'] }
    ]
  },
  {
    id: 'hsc-bio-1', code: '178', name: 'জীববিজ্ঞান ১ম পত্র (উদ্ভিদবিজ্ঞান)', paper: '1st Paper', level: 'HSC', group: 'Science', icon: '🌿', color: 'emerald',
    chapters: [
      { id: 'h-bio1-c1', name: 'কোষ ও এর গঠন, কোষ বিভাজন ও উদ্ভিদ শারীরতত্ত্ব', mcqs: [], cqs: [], formulas: ['শ্বসনিক হার (RQ) = নির্গত CO₂ এর আয়তন / গৃহীত O₂ এর আয়তন (গ্লুকোজের RQ = 1)', 'সবাত শ্বসনে ১ অণু গ্লুকোজ থেকে নীট ৩৬ বা ৩৮টি ATP উৎপন্ন হয়'] }
    ]
  },
  {
    id: 'hsc-bio-2', code: '179', name: 'জীববিজ্ঞান ২য় পত্র (প্রাণিবিজ্ঞান)', paper: '2nd Paper', level: 'HSC', group: 'Science', icon: '🧬', color: 'emerald',
    chapters: [
      { id: 'h-bio2-c1', name: 'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস, মানব শারীরতত্ত্ব ও জিনতত্ত্ব', mcqs: [], cqs: [], formulas: ['BMI (Body Mass Index) = ওজন (kg) / [উচ্চতা (m)]² (স্বাভাবিক: 18.5 – 24.9 kg/m²)', 'মেন্ডেলের ১ম সূত্রের ফিনোটাইপিক অনুপাত = 3 : 1 (অসম্পূর্ণ প্রকটতায় 1 : 2 : 1)', 'মেন্ডেলের ২য় সূত্রের অনুপাত = 9 : 3 : 3 : 1'] }
    ]
  },

  // ================= HSC BUSINESS STUDIES =================
  {
    id: 'acc-1', code: '253', name: 'হিসাববিজ্ঞান ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Business Studies', icon: '📒', color: 'amber',
    chapters: [
      { id: 'acc1-c1', name: 'হিসাববিজ্ঞান পরিচিতি ও হিসাবের বইসমূহ', mcqs: [], cqs: [], formulas: ['মৌলিক হিসাব সমীকরণ: A = L + OE', 'বর্ধিত হিসাব সমীকরণ: A = L + (C + R - E - D)', 'ডেবিট-ক্রেডিট সূত্র: সম্পদ ও ব্যয় বৃদ্ধি পেলে ডেবিট; দায়, মালিকানাস্বত্ব ও আয় বৃদ্ধি পেলে ক্রেডিট'] },
      { id: 'acc1-c2', name: 'ব্যাংক সমন্বয় বিবরণী, রেওয়ামিল ও দৃশ্যমান সম্পদের হিসাবরক্ষণ', mcqs: [], cqs: [], formulas: ['সরলরৈখিক বার্ষিক অবচয় = (সম্পত্তির মোট মূল্য - ভগ্নাবশেষ মূল্য) / আনুমানিক আয়ুষ্কাল', 'অবচয়ের হার = (১০০% / আনুমানিক আয়ুষ্কাল)', 'ক্রমহ্রাসমান জের পদ্ধতিতে অবচয়ের হার = সরলরৈখিক হার × ২'] }
    ]
  },
  // HSC Accounting 2nd Paper (297 MCQs across 10 chapters from user Excel)
  HSC_ACCOUNTING_2ND_PAPER,
  {
    id: 'bom-1', code: '277', name: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Business Studies', icon: '🏢', color: 'amber',
    chapters: [
      { id: 'bom1-c1', name: 'ব্যবসায়ের মৌলিক ধারণা, একমালিকানা, অংশীদারি ও যৌথমূলধনী ব্যবসায়', mcqs: [], cqs: [], formulas: ['ব্যবসায় সমীকরণ: ΣB = ΣI + ΣT + ΣAT (শিল্প + বাণিজ্য + প্রত্যক্ষ সেবা)', 'সমবায় সমিতি আইন: ২০০১ (সংশোধিত ২০০২ ও ২০১৩), সর্বনিম্ন সদস্য ২০ জন'] }
    ]
  },
  {
    id: 'bom-2', code: '278', name: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র', paper: '2nd Paper', level: 'HSC', group: 'Business Studies', icon: '📋', color: 'amber',
    chapters: [
      { id: 'bom2-c1', name: 'ব্যবস্থাপনার ধারণা, নীতি, পরিকল্পনা, সংগঠন, কর্মিসংস্থান, নেতৃত্ব ও নিয়ন্ত্রণ', mcqs: [], cqs: [], formulas: ['আধুনিক ব্যবস্থাপনার জনক — হেনরি ফেয়ল (১৪টি নীতি)', 'বৈজ্ঞানিক ব্যবস্থাপনার জনক — এফ. ডব্লিউ. টেইলর', 'ব্যবস্থাপনার কার্যাবলি (POSDCORB): Planning, Organizing, Staffing, Directing, Coordinating, Reporting, Budgeting'] }
    ]
  },
  {
    id: 'fin-1', code: '292', name: 'ফিন্যান্স, ব্যাংকিং ও বিমা ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Business Studies', icon: '💰', color: 'amber',
    chapters: [
      { id: 'fin1-c3', name: 'অর্থের সময়মূল্য (Time Value of Money)', mcqs: [], cqs: [], formulas: ['ভবিষ্যৎ মূল্য (বার্ষিক চক্রবৃদ্ধি): FV = PV (1 + i)ⁿ', 'একাধিকবার চক্রবৃদ্ধি: FV = PV (1 + i/m)^(n×m)', 'বর্তমান মূল্য: PV = FV / (1 + i)ⁿ', 'কার্যকরী সুদের হার (EAR) = (1 + i/m)^m - 1', 'Rule of 72 (বিনিয়োগ দ্বিগুণ হওয়ার সময়): n = 72 / সুদের হার (%)'] },
      { id: 'fin1-c6', name: 'দীর্ঘমেয়াদি অর্থায়ন, মূলধন ব্যয় ও মূলধন বাজেটিং ও ঝুঁকি', mcqs: [], cqs: [], formulas: ['করের পর ঋণ মূলধন ব্যয়: Kd = Ki (1 - t)', 'সাধারণ শেয়ার মূলধন ব্যয় (স্থির লভ্যাংশ বৃদ্ধি): Ke = (D₁ / P₀) + g', 'CAPM মডেল: Ke = Rf + β (Rm - Rf)', 'পে-ব্যাক সময় (সমান নগদ আন্তঃপ্রবাহ): PBP = প্রাথমিক বিনিয়োগ (NCO) / বার্ষিক নগদ আন্তঃপ্রবাহ (NCB)'] }
    ]
  },
  {
    id: 'fin-2', code: '293', name: 'ফিন্যান্স, ব্যাংকিং ও বিমা ২য় পত্র', paper: '2nd Paper', level: 'HSC', group: 'Business Studies', icon: '🏦', color: 'amber',
    chapters: [
      { id: 'fin2-c1', name: 'ব্যাংক ব্যবস্থার প্রাথমিক ধারণা, কেন্দ্রীয় ব্যাংক ও বিমা', mcqs: [], cqs: [], formulas: ['বাংলাদেশ ব্যাংক আদেশ: ১৯৭২ সালের রাষ্ট্রপতির ১২৭ নং আদেশ (বর্তমানে তফসিলি ব্যাংক ৬১টি)', 'বিমা চুক্তির অপরিহার্য উপাদান: চূড়ান্ত সদ্বিশ্বাস (Utmost Good Faith) ও বিমাযোগ্য স্বার্থ'] }
    ]
  },
  {
    id: 'mkt-1', code: '286', name: 'উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Business Studies', icon: '🏭', color: 'amber',
    chapters: [
      { id: 'mkt1-c1', name: 'উৎপাদন, উৎপাদনশীলতা ও উপযোগ', mcqs: [], cqs: [], formulas: ['মোট উৎপাদনশীলতা = মোট উৎপাদনের মূল্য / মোট উপাদানের মূল্য', 'শ্রম উৎপাদনশীলতা = মোট উৎপাদন একক / মোট শ্রম ঘণ্টা', 'যন্ত্রের উৎপাদনশীলতা = মোট উৎপাদন মূল্য / মোট যন্ত্র সময়'] }
    ]
  },
  {
    id: 'mkt-2', code: '287', name: 'উৎপাদন ব্যবস্থাপনা ও বিপণন ২য় পত্র', paper: '2nd Paper', level: 'HSC', group: 'Business Studies', icon: '🛒', color: 'amber',
    chapters: [
      { id: 'mkt2-c1', name: 'বিপণন পরিচিতি, বিপণন পরিবেশ ও বিপণন মিশ্রণ (4Ps)', mcqs: [], cqs: [], formulas: ['বিপণন মিশ্রণ (4Ps — E. Jerome McCarthy): Product (পণ্য), Price (মূল্য), Place (স্থান/বণ্টন), Promotion (প্রসার)'] }
    ]
  },

  // ================= HSC HUMANITIES =================
  {
    id: 'eco-1', code: '109', name: 'অর্থনীতি ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Humanities', icon: '📈', color: 'indigo',
    chapters: [
      { id: 'eco1-c2', name: 'ভোক্তা ও উৎপাদকের আচরণ (চাহিদা ও যোগান)', mcqs: [], cqs: [], formulas: ['চাহিদা সমীকরণ: Qd = a - bP এবং যোগান সমীকরণ: Qs = c + dP (ভারসাম্যে Qd = Qs)', 'চাহিদার দাম স্থিতিস্থাপকতা: Ed = (ΔQ / ΔP) × (P / Q)', 'মোট আয় ও গড় আয়: TR = P × Q, AR = TR / Q = P, MR = ΔTR / ΔQ', 'জাতীয় আয় (বদ্ধ অর্থনীতি): Y = C + I + G এবং মুক্ত অর্থনীতি: GDP = C + I + G + (X - M)'] }
    ]
  },
  {
    id: 'eco-2', code: '110', name: 'অর্থনীতি ২য় পত্র', paper: '2nd Paper', level: 'HSC', group: 'Humanities', icon: '🌍', color: 'indigo',
    chapters: [
      { id: 'eco2-c1', name: 'বাংলাদেশের অর্থনীতি, জনসংখ্যা ও মুদ্রাস্ফীতি', mcqs: [], cqs: [], formulas: ['জনসংখ্যার ঘনত্ব = মোট জনসংখ্যা / মোট ভূমির পরিমাণ (বর্গ কিমি)', 'মুদ্রাস্ফীতির হার = [(চলতি বছরের দাম সূচক - ভিত্তি বছরের দাম সূচক) / ভিত্তি বছরের দাম সূচক] × ১০০'] }
    ]
  },
  {
    id: 'civ-1', code: '269', name: 'পৌরনীতি ও সুশাসন ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Humanities', icon: '⚖️', color: 'indigo',
    chapters: [
      { id: 'civ1-c1', name: 'পৌরনীতি ও সুশাসন পরিচিতি, রাষ্ট্র, সংবিধান ও নাগরিক অধিকার', mcqs: [], cqs: [], formulas: ['Civics শব্দটি এসেছে ল্যাটিন শব্দ Civis (নাগরিক) এবং Civitas (নগররাষ্ট্র) থেকে।'] }
    ]
  },
  {
    id: 'civ-2', code: '270', name: 'পৌরনীতি ও সুশাসন ২য় পত্র', paper: '2nd Paper', level: 'HSC', group: 'Humanities', icon: '🏛️', color: 'indigo',
    chapters: [
      { id: 'civ2-c1', name: 'ব্রিটিশ ভারতে প্রতিনিধিত্বশীল সরকারের বিকাশ ও বাংলাদেশের সংবিধান', mcqs: [], cqs: [], formulas: ['বাংলাদেশের সংবিধান গৃহীত হয়: ৪ নভেম্বর ১৯৭২; কার্যকর হয়: ১৬ ডিসেম্বর ১৯৭২ (১১টি ভাগ, ১৫৩টি অনুচ্ছেদ, ৭টি তফসিল)'] }
    ]
  },
  {
    id: 'his-1', code: '304', name: 'ইতিহাস ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Humanities', icon: '🏺', color: 'indigo',
    chapters: [
      { id: 'his1-c1', name: 'ভারতবর্ষে ইউরোপীয়দের আগমন হতে ১৯৭১-এর মহান মুক্তিযুদ্ধ', mcqs: [], cqs: [], formulas: ['১৭৫৭: পলাশীর যুদ্ধ | ১৯০৫: বঙ্গভঙ্গ | ১৯৫২: ভাষা আন্দোলন | ১৯৬৬: ছয় দফা | ১৯৭১: মহান মুক্তিযুদ্ধ'] }
    ]
  },
  {
    id: 'his-2', code: '305', name: 'ইতিহাস ২য় পত্র', paper: '2nd Paper', level: 'HSC', group: 'Humanities', icon: '📜', color: 'indigo',
    chapters: [
      { id: 'his2-c1', name: 'শিল্প বিপ্লব, ফরাসি বিপ্লব, ১ম ও ২য় বিশ্বযুদ্ধ এবং জাতিসংঘ', mcqs: [], cqs: [], formulas: ['ফরাসি বিপ্লব: ১৪ জুলাই ১৭৮৯ (মূলমন্ত্র: স্বাধীনতা, সাম্য ও ভ্রাতৃত্ব) | জাতিসংঘ প্রতিষ্ঠা: ২৪ অক্টোবর ১৯৪৫'] }
    ]
  },
  {
    id: 'log-1', code: '121', name: 'যুক্তিবিদ্যা ১ম পত্র', paper: '1st Paper', level: 'HSC', group: 'Humanities', icon: '🧠', color: 'indigo',
    chapters: [
      { id: 'log1-c1', name: 'যুক্তিবিদ্যা পরিচিতি, পদ, যুক্তিবাক্য ও সহানুমান', mcqs: [], cqs: [], formulas: ['যুক্তিবাক্যের ৪টি আকার: A (সকল S হয় P), E (কোনো S নয় P), I (কিছু S হয় P), O (কিছু S নয় P)'] }
    ]
  },
  {
    id: 'log-2', code: '122', name: 'যুক্তিবিদ্যা ২য় পত্র', paper: '2nd Paper', level: 'HSC', group: 'Humanities', icon: '🔍', color: 'indigo',
    chapters: [
      { id: 'log2-c1', name: 'যৌক্তিক সংজ্ঞা, যৌক্তিক বিভাগ, আরোহ ও প্রকল্প', mcqs: [], cqs: [], formulas: ['যৌক্তিক সংজ্ঞা = আসন্নতম জাতি (Proximate Genus) + বিভেদক লক্ষণ (Differentia)'] }
    ]
  },

  // ================= SSC COMMON & GROUPS =================
  {
    id: 'ssc-bn-1', code: '101', name: 'বাংলা ১ম পত্র (SSC)', paper: '1st Paper', level: 'SSC', group: 'Common', icon: '📖', color: 'emerald',
    chapters: [{ id: 's-bn1-c1', name: 'গদ্য ও পদ্য (সুভা, বই পড়া, মানুষ মুহম্মদ (স.), বঙ্গবাণী, কপোতাক্ষ নদ)', mcqs: [], cqs: [], formulas: ['কপোতাক্ষ নদ — মাইকেল মধুসূদন দত্ত (চতুর্দশপদী কবিতাবলি, অষ্টক ও ষষ্টক, মিলবিন্যাস: কখকখ কখখক গঘগঘ গঘ)'] }]
  },
  {
    id: 'ssc-bn-2', code: '102', name: 'বাংলা ২য় পত্র (SSC)', paper: '2nd Paper', level: 'SSC', group: 'Common', icon: '✍️', color: 'emerald',
    chapters: [{ id: 's-bn2-c1', name: 'ধ্বনিতত্ত্ব, সন্ধি, সমাস, কারক ও বিভক্তি, বাচ্য ও উক্তি', mcqs: [], cqs: [], formulas: ['মৌলিক স্বরধ্বনি ৭টি (অ, আ, ই, উ, এ, ও, অ্যা); স্বরবর্ণ ১১টি, ব্যঞ্জনবর্ণ ৩৯টি'] }]
  },
  {
    id: 'ssc-en-1', code: '107', name: 'English 1st Paper (SSC)', paper: '1st Paper', level: 'SSC', group: 'Common', icon: '🌐', color: 'blue',
    chapters: [{ id: 's-en1-c1', name: 'Seen Passage, Unseen Passage & Writing', mcqs: [], cqs: [], formulas: ['Summary Writing: Keep within 1/3 of the passage length in your own words.'] }]
  },
  {
    id: 'ssc-en-2', code: '108', name: 'English 2nd Paper (SSC)', paper: '2nd Paper', level: 'SSC', group: 'Common', icon: '🔤', color: 'blue',
    chapters: [{ id: 's-en2-c1', name: 'Grammar (Tag Questions, Completing Sentences, Suffix-Prefix, Voice)', mcqs: [], cqs: [], formulas: ['Tag Question: Let’s / Let us -> shall we? | Imperative sentence -> will you / won’t you?'] }]
  },
  {
    id: 'ssc-math', code: '109', name: 'সাধারণ গণিত (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Common', icon: '📏', color: 'rose',
    chapters: [{ id: 's-math-c1', name: 'বীজগণিত, ত্রিকোণমিতি, পরিমিতি ও জ্যামিতি', mcqs: [], cqs: [], formulas: ['(a + b)² = a² + 2ab + b² = (a - b)² + 4ab', 'a³ + b³ = (a + b)³ - 3ab(a + b)', 'sin²θ + cos²θ = 1, sec²θ - tan²θ = 1, cosec²θ - cot²θ = 1', 'সমান্তর ধারার n-তম পদ = a + (n - 1)d এবং সমষ্টি Sn = (n/2) [2a + (n - 1)d]'] }]
  },
  {
    id: 'ssc-ict', code: '154', name: 'তথ্য ও যোগাযোগ প্রযুক্তি (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Common', icon: '💻', color: 'indigo',
    chapters: [{ id: 's-ict-c1', name: 'তথ্য ও যোগাযোগ প্রযুক্তি এবং আমাদের বাংলাদেশ', mcqs: [], cqs: [], formulas: ['ই-লার্নিং, ই-গভর্ন্যান্স, ই-সার্ভিস, ই-কমার্স ও কম্পিউটার ট্রাবলশুটিং'] }]
  },
  {
    id: 'ssc-phy', code: '136', name: 'পদার্থবিজ্ঞান (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Science', icon: '⚛️', color: 'violet',
    chapters: [{ id: 's-phy-c1', name: 'গতি, বল, কাজ-ক্ষমতা-শক্তি, আলোর প্রতিফলন ও প্রতিসরণ, চল তড়িৎ', mcqs: [], cqs: [], formulas: ['গতির সমীকরণ: v = u + at, s = ut + ½at², v² = u² + 2as', 'দর্পণ ও লেন্সের সমীকরণ: 1/u + 1/v = 1/f এবং ক্ষমতা P = 1/f (ডায়াপ্টার)'] }]
  },
  {
    id: 'ssc-chem', code: '137', name: 'রসায়ন (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Science', icon: '🧪', color: 'teal',
    chapters: [{ id: 's-chem-c1', name: 'পদার্থের গঠন, পর্যায় সারণি, রাসায়নিক বন্ধন, মোলের ধারণা ও রাসায়নিক গণনা', mcqs: [], cqs: [], formulas: ['মোল সংখ্যা n = w / M = V(L) / 22.4 = N / (6.023 × 10²³)'] }]
  },
  {
    id: 'ssc-bio', code: '138', name: 'জীববিজ্ঞান (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Science', icon: '🌿', color: 'emerald',
    chapters: [{ id: 's-bio-c1', name: 'জীবন পাঠ, কোষ ও টিস্যু, জীবনীশক্তি, খাদ্য ও পরিপাক', mcqs: [], cqs: [], formulas: ['সালোকসংশ্লেষণ: 6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O (সূর্যালোক ও ক্লোরোফিল)'] }]
  },
  {
    id: 'ssc-hmath', code: '126', name: 'উচ্চতর গণিত (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Science', icon: '📐', color: 'rose',
    chapters: [{ id: 's-hm-c1', name: 'সেট ও ফাংশন, দ্বিপদী বিস্তৃতি, স্থানাঙ্ক জ্যামিতি ও সম্ভাবনা', mcqs: [], cqs: [], formulas: ['সম্ভাবনা P(A) = অনুকূল ফলাফল / সমগ্র সম্ভাব্য ফলাফল (0 ≤ P(A) ≤ 1)'] }]
  },
  {
    id: 'ssc-acc', code: '146', name: 'হিসাববিজ্ঞান (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Business Studies', icon: '📊', color: 'amber',
    chapters: [{ id: 's-acc-c1', name: 'লেনদেন, দুতরফা দাখিলা পদ্ধতি, জাবেদা, খতিয়ান, রেওয়ামিল ও আর্থিক বিবরণী', mcqs: [], cqs: [], formulas: ['সম্পদ (A) = দায় (L) + মালিকানাস্বত্ব (OE)'] }]
  },
  {
    id: 'ssc-fin', code: '152', name: 'ফিন্যান্স ও ব্যাংকিং (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Business Studies', icon: '🏦', color: 'amber',
    chapters: [{ id: 's-fin-c1', name: 'অর্থায়ন ও ব্যবসায় অর্থায়ন, অর্থের সময়মূল্য, মূলধন বাজেটিং ও ব্যাংকিং', mcqs: [], cqs: [], formulas: ['ভবিষ্যৎ মূল্য FV = PV (1 + i)ⁿ'] }]
  },
  {
    id: 'ssc-ent', code: '143', name: 'ব্যবসায় উদ্যোগ (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Business Studies', icon: '💼', color: 'amber',
    chapters: [{ id: 's-ent-c1', name: 'ব্যবসায় পরিচিতি, আত্মকর্মসংস্থান, ব্যবসায়ের আইনগত দিক ও বিপণন', mcqs: [], cqs: [], formulas: ['অংশীদারি আইন ১৯৩২, কোম্পানি আইন ১৯৯৪, পেটেন্ট ও ট্রেডমার্ক'] }]
  },
  {
    id: 'ssc-his', code: '153', name: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Humanities', icon: '🏺', color: 'indigo',
    chapters: [{ id: 's-his-c1', name: 'প্রাচীন বাংলার জনপদ, মধ্যযুগ, ব্রিটিশ শাসন, ভাষা আন্দোলন ও মুক্তিযুদ্ধ', mcqs: [], cqs: [], formulas: ['প্রাচীন জনপদ: পুণ্ড্র (মহাস্থানগড়/বগুড়া), বঙ্গ, সমতট (কুমিল্লা-নোয়াখালী), হরিকেল, গৌড়'] }]
  },
  {
    id: 'ssc-geo', code: '110', name: 'ভূগোল ও পরিবেশ (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Humanities', icon: '🌍', color: 'indigo',
    chapters: [{ id: 's-geo-c1', name: 'মহাবিশ্ব ও আমাদের পৃথিবী, পৃথিবীর অভ্যন্তরীণ ও বাহ্যিক গঠন, বায়ুমণ্ডল ও বারিমণ্ডল', mcqs: [], cqs: [], formulas: ['১ ডিগ্রি দ্রাঘিমার পার্থক্যে সময়ের পার্থক্য ৪ মিনিট (১৫ ডিগ্রিতে ১ ঘণ্টা)'] }]
  },
  {
    id: 'ssc-civ', code: '140', name: 'পৌরনীতি ও নাগরিকতা (SSC)', paper: 'Single Paper', level: 'SSC', group: 'Humanities', icon: '⚖️', color: 'indigo',
    chapters: [{ id: 's-civ-c1', name: 'নাগরিক ও নাগরিকতা, আইন, স্বাধীনতা ও সাম্য, রাষ্ট্র ও সরকার ব্যবস্থা', mcqs: [], cqs: [], formulas: ['রাষ্ট্রের ৪টি উপাদান: নির্দিষ্ট ভূখণ্ড, জনসমষ্টি, সরকার এবং সার্বভৌমত্ব'] }]
  },

  // ================= ADMISSION & JOB/BCS =================
  {
    id: 'adm-gk', code: 'ADM-01', name: 'Admission: সাধারণ জ্ঞান, বাংলা ও ইংরেজি', paper: 'Combined', level: 'Admission', group: 'Common', icon: '🎓', color: 'indigo',
    chapters: [{ id: 'adm-c1', name: 'ঢাকা বিশ্ববিদ্যালয়, গুচ্ছ ও মেডিকেল ভর্তি প্রস্তুতি', mcqs: [], cqs: [], formulas: ['মেডিকেল ভর্তি পরীক্ষা: জীববিজ্ঞান ৩০, রসায়ন ২৫, পদার্থবিজ্ঞান ২০, ইংরেজি ১৫, সাধারণ জ্ঞান ১০ = ১০০ নম্বর'] }]
  },
  {
    id: 'bcs-preli', code: 'BCS-01', name: 'BCS Preliminary & Bank Job Master', paper: 'Combined', level: 'Job/BCS', group: 'Common', icon: '🏆', color: 'amber',
    chapters: [{ id: 'bcs-c1', name: 'বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি, গাণিতিক যুক্তি ও মানসিক দক্ষতা', mcqs: [], cqs: [], formulas: ['বিসিএস প্রিলিমিনারি ২০০ নম্বর (প্রতি ভুল উত্তরের জন্য ০.৫০ নম্বর কর্তন)'] }]
  }
];

interface ExamStoreState {
  profile: UserProfile;
  theme: ThemeMode;
  fontSize: FontSize;
  subjects: Subject[];
  bookmarks: string[];
  wrongQuestionIds: string[];
  history: ExamHistoryItem[];
  questionReports: QuestionErrorReport[];
  registeredUsers: RegisteredUserSummary[];

  updateProfile: (partial: Partial<UserProfile>) => void;
  loginUser: (data: { id?: string; name: string; email: string; phone?: string; institution: string; level: AcademicLevel; group: AcademicGroup }) => void;
  logoutUser: () => void;
  setAcademicFilter: (level: AcademicLevel, group: AcademicGroup) => void;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  toggleBookmark: (qId: string) => void;
  recordExamResult: (result: Omit<ExamHistoryItem, 'id' | 'date'>) => void;
  addCustomMCQ: (subjectId: string, chapterId: string, mcq: Omit<MCQ, 'id'>) => void;
  bulkAddMCQs: (target: { level: AcademicLevel; group: AcademicGroup | 'Common'; subjectName: string; paper: string; code?: string }, chapterItems: { chapterName: string; mcq: Omit<MCQ, 'id'> }[]) => number;
  updateMCQAnswer: (subjectId: string, chapterId: string, questionId: string, newCorrectIndex: number, newExplanation?: string, newQuestionText?: string, newOptions?: [string, string, string, string]) => void;
  deleteMCQ: (subjectId: string, chapterId: string, questionId: string) => void;
  reportQuestionError: (report: Omit<QuestionErrorReport, 'id' | 'createdAt' | 'status'>) => void;
  resolveQuestionReport: (reportId: string, status: 'resolved' | 'dismissed', newCorrectIndex?: number) => void;
  addFormulaToChapter: (subjectId: string, chapterId: string, formula: string) => void;
  clearMistakes: () => void;
  syncCloudSubjectData: () => Promise<void>;
}

export const useExamStore = create<ExamStoreState>()(
  persist(
    (set, get) => ({
      profile: {
        name: 'শিক্ষার্থী',
        email: '',
        institution: 'জাতীয় শিক্ষাক্রম (NCTB)',
        targetGoal: 'বোর্ড পরীক্ষায় A+ ও মেধা তালিকায় স্থান',
        bio: 'নিয়মিত অধ্যায়ভিত্তিক অনুশীলন ও মডেল টেস্টের মাধ্যমে নিজের প্রস্তুতি যাচাই করছি।',
        level: 'HSC',
        group: 'Business Studies',
        xp: 0,
        streak: 1,
        isLoggedIn: false,
      },
      theme: 'light',
      fontSize: 'medium',
      subjects: INITIAL_SUBJECTS,
      bookmarks: [],
      wrongQuestionIds: [],
      history: [],
      questionReports: [],
      registeredUsers: [],

      updateProfile: (partial) =>
        set((state) => {
          const updated = { ...state.profile, ...partial };
          if (supabase && updated.id) {
            supabase.from('profiles').upsert({
              id: updated.id,
              name: updated.name,
              email: updated.email,
              institution: updated.institution,
              level: updated.level,
              academic_group: updated.group,
              xp: updated.xp,
              streak: updated.streak,
              updated_at: new Date().toISOString()
            }).then(() => {});
          }
          return { profile: updated };
        }),

      loginUser: (data) =>
        set((state) => {
          const userId = data.id || `usr_${Date.now()}`;
          const newProfile: UserProfile = {
            ...state.profile,
            id: userId,
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            institution: data.institution || 'NCTB',
            level: data.level,
            group: data.group,
            isLoggedIn: true,
          };
          const exists = state.registeredUsers.some((u) => u.email === data.email);
          const nextUsers = exists
            ? state.registeredUsers.map((u) =>
                u.email === data.email ? { ...u, name: data.name, institution: data.institution, level: data.level, group: data.group } : u
              )
            : [
                {
                  id: userId,
                  name: data.name,
                  email: data.email,
                  institution: data.institution,
                  level: data.level,
                  group: data.group,
                  xp: state.profile.xp,
                  totalExams: state.history.length,
                  joinedAt: new Date().toLocaleDateString('bn-BD'),
                },
                ...state.registeredUsers,
              ];

          if (supabase) {
            supabase.from('profiles').upsert({
              id: userId,
              name: data.name,
              email: data.email,
              institution: data.institution,
              level: data.level,
              academic_group: data.group,
              xp: state.profile.xp,
              streak: state.profile.streak,
              updated_at: new Date().toISOString()
            }).then(() => {});
          }
          return { profile: newProfile, registeredUsers: nextUsers };
        }),

      logoutUser: () =>
        set((state) => {
          if (supabase) {
            supabase.auth.signOut().catch(() => {});
          }
          return {
            profile: { ...state.profile, isLoggedIn: false, isAdmin: false },
          };
        }),

      setAcademicFilter: (level, group) =>
        set((state) => ({
          profile: { ...state.profile, level, group },
        })),

      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),

      toggleBookmark: (qId) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(qId)
            ? state.bookmarks.filter((id) => id !== qId)
            : [...state.bookmarks, qId],
        })),

      recordExamResult: (result) =>
        set((state) => {
          const now = Date.now();
          const newHistoryItem: ExamHistoryItem = {
            ...result,
            id: `ex_${now}`,
            date: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }),
            timestamp: now,
          };
          const newWrongSet = new Set([...state.wrongQuestionIds, ...result.wrongQuestionIds]);
          const earnedXp = Math.max(5, Math.round(result.correct * 12));
          const nextXp = state.profile.xp + earnedXp;

          const updatedUsers = state.registeredUsers.map((u) =>
            u.email && u.email === state.profile.email
              ? { ...u, xp: nextXp, totalExams: state.history.length + 1 }
              : u
          );

          if (supabase && state.profile.isLoggedIn) {
            const uid = state.profile.id || state.profile.email || 'anon';
            supabase.from('exam_results').insert({
              user_id: uid,
              user_name: state.profile.name,
              institution: state.profile.institution,
              level: state.profile.level,
              academic_group: state.profile.group,
              subject_id: result.subjectId || '',
              subject_name: result.subjectName,
              chapter_name: result.chapterName,
              score: result.score,
              correct: result.correct,
              wrong: result.wrong,
              total_questions: result.totalQuestions,
              time_taken_sec: result.timeTakenSec,
              xp_earned: earnedXp,
              created_at: new Date().toISOString(),
            }).then(() => {});
          }

          return {
            history: [newHistoryItem, ...state.history],
            wrongQuestionIds: Array.from(newWrongSet),
            profile: {
              ...state.profile,
              xp: nextXp,
            },
            registeredUsers: updatedUsers,
          };
        }),

      addCustomMCQ: (subjectId, chapterId, mcq) =>
        set((state) => {
          const newMcq: MCQ = { ...mcq, id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
          const nextSubjects = state.subjects.map((sub) => {
            if (sub.id !== subjectId) return sub;
            return {
              ...sub,
              chapters: sub.chapters.map((ch) => {
                if (ch.id !== chapterId) return ch;
                return {
                  ...ch,
                  mcqs: [...ch.mcqs, newMcq],
                };
              }),
            };
          });
          return { subjects: nextSubjects };
        }),

      bulkAddMCQs: (target, chapterItems) => {
        let addedCount = 0;
        set((state) => {
          const subjectsCopy = [...state.subjects];
          let subjIndex = subjectsCopy.findIndex(
            (s) =>
              s.level === target.level &&
              s.group === target.group &&
              (s.name.trim() === target.subjectName.trim() || s.id === target.subjectName)
          );

          if (subjIndex === -1) {
            const newSubj: Subject = {
              id: `sub_${Date.now()}`,
              code: target.code || '100',
              name: target.subjectName,
              paper: target.paper,
              level: target.level,
              group: target.group,
              icon: '📚',
              color: target.group === 'Science' ? 'violet' : target.group === 'Business Studies' ? 'amber' : 'indigo',
              chapters: [],
            };
            subjectsCopy.push(newSubj);
            subjIndex = subjectsCopy.length - 1;
          }

          const subj = { ...subjectsCopy[subjIndex], chapters: [...subjectsCopy[subjIndex].chapters] };
          const existingQTexts = new Set<string>();
          subj.chapters.forEach((c) => c.mcqs.forEach((m) => existingQTexts.add(m.question.trim())));

          chapterItems.forEach((item, idx) => {
            const qTrim = item.mcq.question.trim();
            if (!qTrim || existingQTexts.has(qTrim)) return;
            existingQTexts.add(qTrim);

            let chIdx = subj.chapters.findIndex((c) => c.name.trim() === item.chapterName.trim());
            if (chIdx === -1) {
              subj.chapters.push({
                id: `${subj.id}_ch_${subj.chapters.length + 1}_${Date.now()}`,
                name: item.chapterName.trim(),
                mcqs: [],
                cqs: [],
                formulas: [],
              });
              chIdx = subj.chapters.length - 1;
            }

            const ch = { ...subj.chapters[chIdx], mcqs: [...subj.chapters[chIdx].mcqs] };
            ch.mcqs.push({
              ...item.mcq,
              id: `${subj.id}_q_${Date.now()}_${idx}`,
            });
            subj.chapters[chIdx] = ch;
            addedCount++;
          });

          subjectsCopy[subjIndex] = subj;

          if (supabase && addedCount > 0) {
            supabase.from('custom_subjects').upsert({
              id: subj.id,
              level: subj.level,
              academic_group: subj.group,
              name: subj.name,
              paper: subj.paper,
              chapters_json: subj.chapters,
              updated_at: new Date().toISOString(),
            }).then(() => {});
          }

          return { subjects: subjectsCopy };
        });
        return addedCount;
      },

      updateMCQAnswer: (subjectId, chapterId, questionId, newCorrectIndex, newExplanation, newQuestionText, newOptions) =>
        set((state) => {
          const nextSubjects = state.subjects.map((sub) => {
            if (sub.id !== subjectId) return sub;
            const updatedSub = {
              ...sub,
              chapters: sub.chapters.map((ch) => {
                if (ch.id !== chapterId) return ch;
                return {
                  ...ch,
                  mcqs: ch.mcqs.map((m) =>
                    m.id === questionId
                      ? {
                          ...m,
                          correctIndex: newCorrectIndex,
                          explanation: newExplanation !== undefined ? newExplanation : m.explanation,
                          question: newQuestionText !== undefined ? newQuestionText : m.question,
                          options: newOptions !== undefined ? newOptions : m.options,
                        }
                      : m
                  ),
                };
              }),
            };
            if (supabase) {
              supabase.from('custom_subjects').upsert({
                id: updatedSub.id,
                level: updatedSub.level,
                academic_group: updatedSub.group,
                name: updatedSub.name,
                paper: updatedSub.paper,
                chapters_json: updatedSub.chapters,
                updated_at: new Date().toISOString(),
              }).then(() => {});
            }
            return updatedSub;
          });
          return { subjects: nextSubjects };
        }),

      deleteMCQ: (subjectId, chapterId, questionId) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id !== subjectId
              ? sub
              : {
                  ...sub,
                  chapters: sub.chapters.map((ch) =>
                    ch.id !== chapterId ? ch : { ...ch, mcqs: ch.mcqs.filter((m) => m.id !== questionId) }
                  ),
                }
          ),
        })),

      reportQuestionError: (report) =>
        set((state) => {
          const newReport: QuestionErrorReport = {
            ...report,
            id: `rep_${Date.now()}`,
            status: 'pending',
            createdAt: new Date().toLocaleString('bn-BD'),
          };
          if (supabase) {
            supabase.from('question_reports').insert({
              id: newReport.id,
              question_id: newReport.questionId,
              subject_id: newReport.subjectId,
              subject_name: newReport.subjectName,
              chapter_id: newReport.chapterId,
              chapter_name: newReport.chapterName,
              question_text: newReport.questionText,
              reported_by: newReport.reportedBy,
              reason: newReport.reason,
              suggested_correct_index: newReport.suggestedCorrectIndex,
              status: 'pending',
              created_at: new Date().toISOString(),
            }).then(() => {});
          }
          return { questionReports: [newReport, ...state.questionReports] };
        }),

      resolveQuestionReport: (reportId, status, newCorrectIndex) =>
        set((state) => {
          const targetReport = state.questionReports.find((r) => r.id === reportId);
          let nextSubjects = state.subjects;

          if (targetReport && status === 'resolved' && newCorrectIndex !== undefined) {
            nextSubjects = state.subjects.map((sub) => {
              if (sub.id !== targetReport.subjectId) return sub;
              return {
                ...sub,
                chapters: sub.chapters.map((ch) => {
                  if (ch.id !== targetReport.chapterId) return ch;
                  return {
                    ...ch,
                    mcqs: ch.mcqs.map((m) =>
                      m.id === targetReport.questionId ? { ...m, correctIndex: newCorrectIndex } : m
                    ),
                  };
                }),
              };
            });
          }

          return {
            subjects: nextSubjects,
            questionReports: state.questionReports.map((r) =>
              r.id === reportId ? { ...r, status } : r
            ),
          };
        }),

      addFormulaToChapter: (subjectId, chapterId, formula) =>
        set((state) => ({
          subjects: state.subjects.map((sub) =>
            sub.id !== subjectId
              ? sub
              : {
                  ...sub,
                  chapters: sub.chapters.map((ch) =>
                    ch.id !== chapterId
                      ? ch
                      : { ...ch, formulas: [...(ch.formulas || []), formula] }
                  ),
                }
          ),
        })),

      clearMistakes: () => set({ wrongQuestionIds: [] }),

      syncCloudSubjectData: async () => {
        if (!supabase) return;
        try {
          const { data } = await supabase.from('custom_subjects').select('*');
          if (data && Array.isArray(data) && data.length > 0) {
            const currentSubjects = [...get().subjects];
            data.forEach((row: any) => {
              if (!row.id || !Array.isArray(row.chapters_json)) return;
              const idx = currentSubjects.findIndex((s) => s.id === row.id);
              if (idx >= 0) {
                // Only overwrite if cloud has at least as many MCQs as local
                const localMcqs = currentSubjects[idx].chapters.reduce((a, c) => a + c.mcqs.length, 0);
                const cloudMcqs = row.chapters_json.reduce((a: number, c: any) => a + (c.mcqs?.length || 0), 0);
                if (cloudMcqs >= localMcqs) {
                  currentSubjects[idx] = {
                    ...currentSubjects[idx],
                    chapters: row.chapters_json,
                  };
                }
              }
            });
            set({ subjects: currentSubjects });
          }
        } catch {
          // Ignore network errors silently
        }
      },
    }),
    {
      name: 'examverse_production_v8',
      merge: (persistedState: any, currentState) => {
        const merged = { ...currentState, ...(persistedState || {}) };
        // Ensure acc-2 always has all 297 MCQs from syllabusData.ts even if older storage had fewer
        if (Array.isArray(merged.subjects)) {
          merged.subjects = merged.subjects.map((s: Subject) =>
            s.id === 'acc-2' ? HSC_ACCOUNTING_2ND_PAPER : s
          );
        }
        return merged;
      },
    }
  )
);
