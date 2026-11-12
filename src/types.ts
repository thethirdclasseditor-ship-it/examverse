export type LanguageMode = 'en' | 'bn' | 'bilingual';

export interface LocalizedText {
  en: string;
  bn: string;
}

export interface MCQQuestion {
  id: string;
  q: LocalizedText;
  options: {
    en: string[];
    bn: string[];
  };
  ans: number;
  explanation?: LocalizedText;
  boardTag?: string;
  board?: string;
}

export type MCQ = MCQQuestion;

export interface CQQuestion {
  id: string;
  stem: LocalizedText;
  a: LocalizedText;
  b: LocalizedText;
  c: LocalizedText;
  d: LocalizedText;
  ansA: LocalizedText;
  ansB: LocalizedText;
  ansC: LocalizedText;
  ansD: LocalizedText;
  boardTag?: string;
  board?: string;
}

export interface ChapterFormula {
  id: string;
  title: LocalizedText;
  formula: string;
  equation?: string;
  note?: LocalizedText;
}

export type ChapterFormulaItem = ChapterFormula;

export interface ChapterData {
  id: string;
  name: LocalizedText;
  mcqs: MCQQuestion[];
  cqs: CQQuestion[];
  formulas?: ChapterFormula[];
}

export interface SubjectData {
  id: string;
  name: LocalizedText;
  icon: string;
  color: string;
  rgb: string;
  chapters: ChapterData[];
}

export interface ExamHistoryItem {
  id: string;
  date: string;
  timestamp?: number;
  subjectId: string;
  subjectName: string;
  chapterId?: string;
  chapterName?: string;
  mode: 'mcq' | 'cq' | 'battle' | 'daily' | 'practice' | 'timed';
  score: number;
  rawCorrect?: number;
  wrongCount?: number;
  negativePenalty?: number;
  total: number;
  accuracy: number;
  timeSpentSec: number;
  xpEarned: number;
}

export interface MistakeItem {
  id: string;
  questionId: string;
  subjectId: string;
  subjectName: string;
  chapterName: string;
  question: LocalizedText;
  options: { en: string[]; bn: string[] };
  correctIndex: number;
  selectedIndex: number;
  explanation?: LocalizedText;
  wrongCount: number;
  lastMissedAt: string;
  mastered: boolean;
}

export interface FlashcardItem {
  id: string;
  subjectId: string;
  front: LocalizedText;
  back: LocalizedText;
  box: 1 | 2 | 3 | 4 | 5;
  nextReviewDate: string;
}

export interface StudyTask {
  id: string;
  title: string;
  subjectName: string;
  dueDate: string;
  targetMinutes: number;
  completed: boolean;
}

export interface CommunityReply {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRank: string;
  subjectName: string;
  title: string;
  body: string;
  createdAt: string;
  createdAtIso?: string;
  likes: number;
  likedBy?: string[];
  solved: boolean;
  replies: CommunityReply[];
}

export interface RankProgressInfo {
  tierId: 'bronze' | 'silver' | 'gold' | 'platinum' | 'elite';
  tierNameEn: string;
  tierNameBn: string;
  division: 'I' | 'II' | 'III' | 'MAX';
  fullTitleEn: string;
  fullTitleBn: string;
  rankScore: number;
  nextTierScore: number;
  progressPct: number;
  colorHex: string;
  color?: string;
  bgSoft: string;
  xpScore: number;
  accuracyPct: number;
  masteryPct: number;
  consistencyPct: number;
}

export interface ActiveQuizConfig {
  mode: 'practice' | 'timed' | 'daily' | 'mistakes';
  examType: 'mcq' | 'cq';
  subjectId: string;
  subjectName: LocalizedText;
  chapterId?: string;
  chapterName?: LocalizedText;
  questions: MCQQuestion[];
  cqs: CQQuestion[];
  durationSec: number;
  negativeMarking: number;
}
