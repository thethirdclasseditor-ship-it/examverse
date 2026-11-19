import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getAvailableClasses,
  getAvailableGroups,
  getSubjectsForSelection,
  trText,
  useExamStore,
} from '../store/useExamStore';
import { supabase } from '../lib/supabase';
import { MCQQuestion } from '../types';
import { getComplexMathOrRuleExplanation } from './ModalsAndQuiz';

const QUESTION_TIME_SEC = 15;

const BATTLE_FALLBACK_BANK: Record<'science' | 'business' | 'humanities' | 'common', MCQQuestion[]> = {
  science: [
    {
      id: 'bf-sci-1',
      q: {
        bn: 'একটি প্রাসের প্রক্ষেপণ কোণ কত হলে আনুভূমিক পাল্লা (R) এবং সর্বাধিক উচ্চতা (H) সমান হবে?',
        en: 'At what projection angle is horizontal range (R) equal to maximum height (H)?',
      },
      options: {
        bn: ['45°', '60°', '75.96° (tan⁻¹4)', '30°'],
        en: ['45°', '60°', '75.96° (tan⁻¹4)', '30°'],
      },
      ans: 2,
      boardTag: 'ঢা. বো. ২৩',
      explanation: {
        bn: 'R = 4H cotθ। যেহেতু R = H, তাই tanθ = 4 ⇒ θ = tan⁻¹(4) = 75.96°।',
        en: 'R = 4H cotθ; when R = H, tanθ = 4 ⇒ θ = 75.96°.',
      },
    },
    {
      id: 'bf-sci-2',
      q: {
        bn: '0.005 M H₂SO₄ দ্রবণের pH এর মান কত?',
        en: 'What is the pH of a 0.005 M H₂SO₄ solution?',
      },
      options: { bn: ['1.0', '2.0', '2.3', '3.0'], en: ['1.0', '2.0', '2.3', '3.0'] },
      ans: 1,
      boardTag: 'চ. বো. ২৩',
      explanation: {
        bn: 'H₂SO₄ দ্বি-ক্ষারকীয় এসিড, তাই [H⁺] = 2 × 0.005 = 0.01 M = 10⁻² M ⇒ pH = -log(10⁻²) = 2.0।',
        en: '[H⁺] = 2 × 0.005 = 10⁻² M ⇒ pH = 2.0.',
      },
    },
    {
      id: 'bf-sci-3',
      q: {
        bn: 'একটি কার্নো ইঞ্জিন 127°C এবং 27°C তাপমাত্রার মধ্যে কাজ করলে এর কর্মদক্ষতা কত?',
        en: 'What is the efficiency of a Carnot engine working between 127°C and 27°C?',
      },
      options: { bn: ['20%', '25%', '50%', '75%'], en: ['20%', '25%', '50%', '75%'] },
      ans: 1,
      boardTag: 'রা. বো. ২২',
      explanation: {
        bn: 'T₁ = 400 K, T₂ = 300 K। কর্মদক্ষতা η = (1 - 300/400) × 100% = 25%।',
        en: 'η = (1 - 300/400) × 100% = 25%.',
      },
    },
    {
      id: 'bf-sci-4',
      q: {
        bn: 'd/dx (ln x) এর অন্তরজ কোনটি?',
        en: 'What is the derivative d/dx (ln x)?',
      },
      options: { bn: ['eˣ', '1/x', 'x', 'ln x'], en: ['eˣ', '1/x', 'x', 'ln x'] },
      ans: 1,
      boardTag: 'সকল বোর্ড',
    },
    {
      id: 'bf-sci-5',
      q: {
        bn: 'পৃথিবী পৃষ্ঠ হতে কোনো বস্তুর মুক্তিবেগ (Escape Velocity) প্রায় কত?',
        en: 'What is the approximate escape velocity from Earth?',
      },
      options: { bn: ['7.9 km/s', '9.8 km/s', '11.2 km/s', '15.0 km/s'], en: ['7.9 km/s', '9.8 km/s', '11.2 km/s', '15.0 km/s'] },
      ans: 2,
      boardTag: 'য. বো. ২২',
    },
  ],
  business: [
    {
      id: 'bf-bus-1',
      q: {
        bn: 'বিক্রয়মূল্যের ওপর মুনাফার হার ২০% হলে ক্রয়মূল্যের ওপর মুনাফার হার কত?',
        en: 'If profit is 20% on sales, what is the profit rate on cost?',
      },
      options: { bn: ['১৬.৬৭%', '২০%', '২৫%', '৩৩.৩৩%'], en: ['16.67%', '20%', '25%', '33.33%'] },
      ans: 2,
      boardTag: 'ঢা. বো. ২৩',
      explanation: {
        bn: 'বিক্রয়ের ওপর ২০% (১/৫) হলে ক্রয়মূল্যের ওপর হার = ১ ÷ (৫ - ১) = ১/৪ বা ২৫%।',
        en: '20% on sales = 20 / (100 - 20) = 25% on cost.',
      },
    },
    {
      id: 'bf-bus-2',
      q: {
        bn: 'রক্ষণশীলতার নীতি অনুযায়ী সমাপনী মজুদ পণ্য কোন মূল্যে মূল্যায়ন করা হয়?',
        en: 'Under the conservatism principle, closing inventory is valued at—',
      },
      options: {
        bn: ['ক্রয়মূল্যে', 'বাজারমূল্যে', 'ক্রয়মূল্য ও বাজারমূল্যের মধ্যে যেটি কম', 'ক্রয়মূল্য ও বাজারমূল্যের মধ্যে যেটি বেশি'],
        en: ['Cost price', 'Market price', 'Lower of cost or market price', 'Higher of cost or market price'],
      },
      ans: 2,
      boardTag: 'ঢা. বো. ২২',
    },
    {
      id: 'bf-bus-3',
      q: {
        bn: 'অগ্রাধিকার শেয়ারকে শংকর সিকিউরিটি বলা হয় কেন?',
        en: 'Why is preference share called a hybrid security?',
      },
      options: {
        bn: ['এর মেয়াদ নির্দিষ্ট', 'এতে সাধারণ শেয়ার ও বন্ড উভয়ের বৈশিষ্ট্য রয়েছে', 'এর ভোটাধিকার বেশি', 'এটি ঝুঁকিমুক্ত'],
        en: ['Fixed maturity', 'Has features of both equity and bond', 'Higher voting power', 'Risk-free'],
      },
      ans: 1,
      boardTag: 'দি. বো. ২২',
    },
    {
      id: 'bf-bus-4',
      q: {
        bn: 'বাংলাদেশে প্রচলিত কোম্পানি আইন কত সালের?',
        en: 'Which year Companies Act is effective in Bangladesh?',
      },
      options: { bn: ['১৯১৩', '১৯৩২', '১৯৯৪', '২০০১'], en: ['1913', '1932', '1994', '2001'] },
      ans: 2,
      boardTag: 'ব. বো. ২১',
    },
    {
      id: 'bf-bus-5',
      q: {
        bn: 'একটি প্রকল্পের প্রাথমিক বিনিয়োগ ২,৪০,০০০ টাকা এবং বার্ষিক নগদ আন্তঃপ্রবাহ ৬০,০০০ টাকা হলে পে-ব্যাক সময় কত?',
        en: 'If initial investment is 240,000 and annual cash inflow is 60,000, what is the payback period?',
      },
      options: { bn: ['২ বছর', '৩ বছর', '৪ বছর', '৫ বছর'], en: ['2 yrs', '3 yrs', '4 yrs', '5 yrs'] },
      ans: 2,
      boardTag: 'য. বো. ২১',
      explanation: {
        bn: 'পে-ব্যাক সময় (PBP) = প্রাথমিক বিনিয়োগ ÷ বার্ষিক নগদ প্রবাহ = ২,৪০,০০০ ÷ ৬০,০০০ = ৪ বছর।',
        en: 'PBP = 240,000 / 60,000 = 4 years.',
      },
    },
  ],
  humanities: [
    {
      id: 'bf-hum-1',
      q: {
        bn: 'প্রান্তিক ভোগ প্রবণতা (MPC) = 0.75 হলে বিনিয়োগ গুণকের (k) মান কত?',
        en: 'If MPC = 0.75, what is the investment multiplier (k)?',
      },
      options: { bn: ['2', '3', '4', '5'], en: ['2', '3', '4', '5'] },
      ans: 2,
      boardTag: 'ঢা. বো. ২৩',
      explanation: {
        bn: 'বিনিয়োগ গুণক k = 1 ÷ (1 - MPC) = 1 ÷ (1 - 0.75) = 4।',
        en: 'k = 1 / (1 - 0.75) = 4.',
      },
    },
    {
      id: 'bf-hum-2',
      q: {
        bn: 'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান কবে থেকে কার্যকর হয়?',
        en: 'When did the Constitution of Bangladesh take effect?',
      },
      options: {
        bn: ['৪ নভেম্বর ১৯৭২', '১৬ ডিসেম্বর ১৯৭২', '২৬ মার্চ ১৯৭২', '১০ জানুয়ারি ১৯৭২'],
        en: ['4 Nov 1972', '16 Dec 1972', '26 Mar 1972', '10 Jan 1972'],
      },
      ans: 1,
      boardTag: 'সকল বোর্ড',
    },
    {
      id: 'bf-hum-3',
      q: {
        bn: 'ঐতিহাসিক ৬-দফা কর্মসূচি কত সালে ঘোষণা করা হয়?',
        en: 'In which year was the Six-Point Movement declared?',
      },
      options: { bn: ['১৯৫৪', '১৯৬২', '১৯৬৬', '১৯৬৯'], en: ['1954', '1962', '1966', '1969'] },
      ans: 2,
      boardTag: 'রা. বো. ২২',
    },
    {
      id: 'bf-hum-4',
      q: {
        bn: 'চাহিদা ও দামের মধ্যে সাধারণত কোন ধরনের সম্পর্ক বিদ্যমান?',
        en: 'What relationship normally exists between price and quantity demanded?',
      },
      options: { bn: ['ধনাত্মক', 'ঋণাত্মক (বিপরীতমুখী)', 'সমান্তরাল', 'শূন্য'], en: ['Positive', 'Inverse', 'Parallel', 'Zero'] },
      ans: 1,
      boardTag: 'কু. বো. ২২',
    },
    {
      id: 'bf-hum-5',
      q: {
        bn: 'জাতিসংঘ কত সালে প্রতিষ্ঠিত হয়?',
        en: 'In which year was the United Nations founded?',
      },
      options: { bn: ['১৯১৯', '১৯৪৫', '১৯৪৮', '১৯৫২'], en: ['1919', '1945', '1948', '1952'] },
      ans: 1,
      boardTag: 'চ. বো. ২২',
    },
  ],
  common: [
    {
      id: 'bf-com-1',
      q: {
        bn: 'বাইনারি সংখ্যা (10110)₂ এর দশমিক (Decimal) মান কত?',
        en: 'What is the decimal value of binary (10110)₂?',
      },
      options: { bn: ['20', '22', '24', '26'], en: ['20', '22', '24', '26'] },
      ans: 1,
      boardTag: 'ঢা. বো. ২৩ • ICT',
      explanation: {
        bn: '1×16 + 0×8 + 1×4 + 1×2 + 0×1 = 16 + 4 + 2 = 22।',
        en: '16 + 4 + 2 = 22.',
      },
    },
    {
      id: 'bf-com-2',
      q: {
        bn: 'কোনো 3-input বিশিষ্ট সত্যক সারণিতে (Truth Table) মোট কয়টি সারি থাকে?',
        en: 'How many rows are in a 3-input Truth Table?',
      },
      options: { bn: ['6টি', '8টি', '9টি', '16টি'], en: ['6', '8', '9', '16'] },
      ans: 1,
      boardTag: 'রা. বো. ২৩ • ICT',
      explanation: {
        bn: 'n-ইনপুটের জন্য সারি সংখ্যা = 2ⁿ। এখানে 2³ = 8টি।',
        en: '2³ = 8 rows.',
      },
    },
    {
      id: 'bf-com-3',
      q: {
        bn: 'HTML-এ সবচেয়ে বড় আকারের হেডিং ট্যাগ কোনটি?',
        en: 'Which is the largest heading tag in HTML?',
      },
      options: { bn: ['<h6>', '<head>', '<h1>', '<header>'], en: ['<h6>', '<head>', '<h1>', '<header>'] },
      ans: 2,
      boardTag: 'সকল বোর্ড • ICT',
    },
    {
      id: 'bf-com-4',
      q: {
        bn: 'বুলিয়ান অ্যালজেব্রায় A + A·B এর সরলকৃত মান কোনটি?',
        en: 'What is the simplified value of A + A·B in Boolean algebra?',
      },
      options: { bn: ['A', 'B', 'A·B', '1'], en: ['A', 'B', 'A·B', '1'] },
      ans: 0,
      boardTag: 'য. বো. ২২ • ICT',
      explanation: {
        bn: 'A + A·B = A(1 + B) = A·1 = A।',
        en: 'A(1 + B) = A.',
      },
    },
    {
      id: 'bf-com-5',
      q: {
        bn: 'কোনটি সর্বজনীন গেট (Universal Gate)?',
        en: 'Which of the following is a Universal Gate?',
      },
      options: { bn: ['AND ও OR', 'NAND ও NOR', 'XOR ও XNOR', 'NOT ও AND'], en: ['AND & OR', 'NAND & NOR', 'XOR & XNOR', 'NOT & AND'] },
      ans: 1,
      boardTag: 'কু. বো. ২৩ • ICT',
    },
  ],
};

function getMcqBoardLabel(q: MCQQuestion): string {
  const raw = String(q.boardTag || q.board || '').trim();
  if (!raw || raw === 'বোর্ড প্রশ্ন' || raw === 'NCTB ও বোর্ড প্রশ্ন') return '';
  return raw;
}

function scoreMcqForBattle(q: MCQQuestion): number {
  const qText = (q.q?.bn || q.q?.en || '').trim();
  if (!qText || (q.options?.bn?.length || 0) < 4) return -999;

  let score = 10;
  const board = getMcqBoardLabel(q);
  if (board && /(বো\.|বোর্ড|Board|BUET|DU|Medical|GST|BCS|সকল)/i.test(board)) {
    score += 35;
  }
  const exp = getComplexMathOrRuleExplanation(q, 'bn');
  if (exp.length > 0) score += 30;
  if (qText.length >= 16 && qText.length <= 220) score += 15;
  return score;
}

function seededShuffle<T>(items: T[], seedStr: string): T[] {
  const arr = [...items];
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

type BattleStage = 'lobby' | 'waiting_room' | 'joining' | 'playing' | 'finished';

export const QuizBattleView: React.FC = () => {
  const {
    language,
    selectedClass,
    selectedGroup,
    setClassAndGroup,
    userName,
    getRankInfo,
    recordBattleResult,
  } = useExamStore();

  const isBn = language !== 'en';
  const myRank = getRankInfo();
  const subjects = getSubjectsForSelection(selectedClass, selectedGroup, true);
  const availableGroups = getAvailableGroups(selectedClass);

  const [modeTab, setModeTab] = useState<'bot' | 'friend'>('bot');
  const [stage, setStage] = useState<BattleStage>('lobby');
  const [subjId, setSubjId] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);

  const [roomCode, setRoomCode] = useState<string>('');
  const [joinInput, setJoinInput] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string>('');

  const [opponentName, setOpponentName] = useState<string>('AI বট');
  const [opponentRank, setOpponentRank] = useState<string>('প্র্যাকটিস');
  const [isMultiplayer, setIsMultiplayer] = useState<boolean>(false);

  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [qIdx, setQIdx] = useState<number>(0);
  const [myScore, setMyScore] = useState<number>(0);
  const [oppScore, setOppScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME_SEC);
  const [lockedAns, setLockedAns] = useState<number | null>(null);
  const [timeExpired, setTimeExpired] = useState<boolean>(false);
  const [earnedXp, setEarnedXp] = useState<number>(0);

  const channelRef = useRef<any>(null);
  const advanceTimerRef = useRef<any>(null);
  const joinTimeoutRef = useRef<any>(null);
  const matchStartMsRef = useRef<number>(Date.now());
  const advancedForIdxRef = useRef<number>(-1);
  const resultRecordedRef = useRef<boolean>(false);

  // Refs to prevent stale closures when timer fires or battle finishes
  const myScoreRef = useRef<number>(0);
  const oppScoreRef = useRef<number>(0);
  const correctCountRef = useRef<number>(0);
  const questionsRef = useRef<MCQQuestion[]>([]);
  const isMultiplayerRef = useRef<boolean>(false);
  const subjIdRef = useRef<string>('all');
  const subjLabelRef = useRef<string>('');

  useEffect(() => {
    if (subjId !== 'all' && !subjects.some((s) => s.id === subjId)) {
      setSubjId('all');
    }
  }, [selectedClass, selectedGroup, subjects, subjId]);

  const cleanupNetworkAndTimers = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current);
      joinTimeoutRef.current = null;
    }
    if (channelRef.current && supabase) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch {
        // ignore
      }
      channelRef.current = null;
    }
  }, []);

  // Automatically stop timers & leave room if user switches tabs (component unmounts)
  useEffect(() => {
    return () => {
      cleanupNetworkAndTimers();
    };
  }, [cleanupNetworkAndTimers]);

  const currentSubjectLabel = useMemo(() => {
    if (subjId === 'all') {
      return isBn ? `সকল বিষয় (${selectedGroup})` : `All Subjects (${selectedGroup})`;
    }
    const found = subjects.find((s) => s.id === subjId);
    return found ? trText(found.name, language) : isBn ? 'কুইজ ব্যাটল' : 'Quiz Battle';
  }, [subjId, subjects, selectedGroup, isBn, language]);

  const prepareQuestions = useCallback(
    (targetSubjId: string, count: number, seedKey?: string): MCQQuestion[] => {
      const grpLower = selectedGroup.toLowerCase();
      const fallback = grpLower.includes('bus')
        ? [...BATTLE_FALLBACK_BANK.business, ...BATTLE_FALLBACK_BANK.common]
        : grpLower.includes('hum')
        ? [...BATTLE_FALLBACK_BANK.humanities, ...BATTLE_FALLBACK_BANK.common]
        : [...BATTLE_FALLBACK_BANK.science, ...BATTLE_FALLBACK_BANK.common];

      const seen = new Set<string>();
      const dedupe = (arr: MCQQuestion[]): MCQQuestion[] => {
        const out: MCQQuestion[] = [];
        for (const item of arr) {
          const key = (item.q?.bn || item.q?.en || '').trim();
          if (!key || seen.has(key)) continue;
          seen.add(key);
          out.push(item);
        }
        return out;
      };

      const shuffleSeed = seedKey || `battle-${Date.now()}-${Math.random()}`;
      const buckets: MCQQuestion[][] = [];

      if (targetSubjId === 'all') {
        for (const s of subjects) {
          const mcqs = s.chapters.flatMap((c) => c.mcqs || []).filter((q) => scoreMcqForBattle(q) > 0);
          if (mcqs.length > 0) {
            const top = [...mcqs].sort((a, b) => scoreMcqForBattle(b) - scoreMcqForBattle(a)).slice(0, 30);
            buckets.push(seededShuffle(top, `${shuffleSeed}-${s.id}`));
          }
        }
      } else {
        const target = subjects.find((s) => s.id === targetSubjId);
        if (target) {
          for (const ch of target.chapters) {
            const mcqs = (ch.mcqs || []).filter((q) => scoreMcqForBattle(q) > 0);
            if (mcqs.length > 0) {
              const top = [...mcqs].sort((a, b) => scoreMcqForBattle(b) - scoreMcqForBattle(a)).slice(0, 25);
              buckets.push(seededShuffle(top, `${shuffleSeed}-${ch.id}`));
            }
          }
        }
      }

      const roundRobin: MCQQuestion[] = [];
      let round = 0;
      while (roundRobin.length < count * 3 && round < 25) {
        let added = false;
        for (const b of buckets) {
          if (round < b.length) {
            roundRobin.push(b[round]);
            added = true;
          }
        }
        if (!added) break;
        round++;
      }

      const pool = dedupe([...roundRobin, ...fallback]);
      const shuffled = seededShuffle(pool.slice(0, Math.max(count * 2, 20)), shuffleSeed);
      return shuffled.slice(0, count);
    },
    [selectedGroup, subjects]
  );

  const beginMatch = useCallback(
    (params: {
      qList: MCQQuestion[];
      oppName: string;
      oppRank: string;
      multiplayer: boolean;
      subjectIdVal: string;
      subjectLabelVal: string;
    }) => {
      if (advanceTimerRef.current) {
        clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = null;
      }
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = null;
      }

      questionsRef.current = params.qList;
      myScoreRef.current = 0;
      oppScoreRef.current = 0;
      correctCountRef.current = 0;
      isMultiplayerRef.current = params.multiplayer;
      subjIdRef.current = params.subjectIdVal;
      subjLabelRef.current = params.subjectLabelVal;
      advancedForIdxRef.current = -1;
      resultRecordedRef.current = false;
      matchStartMsRef.current = Date.now();

      setQuestions(params.qList);
      setOpponentName(params.oppName);
      setOpponentRank(params.oppRank);
      setIsMultiplayer(params.multiplayer);
      setMyScore(0);
      setOppScore(0);
      setCorrectCount(0);
      setQIdx(0);
      setLockedAns(null);
      setTimeExpired(false);
      setTimeLeft(QUESTION_TIME_SEC);
      setEarnedXp(0);
      setStage('playing');
    },
    []
  );

  const finishMatch = useCallback(() => {
    if (resultRecordedRef.current) return;
    resultRecordedRef.current = true;

    const finalMy = myScoreRef.current;
    const finalOpp = oppScoreRef.current;
    const finalCorrect = correctCountRef.current;
    const totalQ = Math.max(1, questionsRef.current.length);
    const elapsedSec = Math.max(1, Math.round((Date.now() - matchStartMsRef.current) / 1000));

    const xpAwarded = recordBattleResult({
      won: finalMy > finalOpp,
      tied: finalMy === finalOpp,
      myScore: finalMy,
      oppScore: finalOpp,
      correctCount: finalCorrect,
      totalQuestions: totalQ,
      subjectId: subjIdRef.current,
      subjectName: subjLabelRef.current || 'Quiz Battle',
      timeSpentSec: elapsedSec,
    });

    setEarnedXp(xpAwarded);
    setStage('finished');
  }, [recordBattleResult]);

  const advanceToNextQuestion = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setQIdx((currIdx) => {
      if (currIdx + 1 >= questionsRef.current.length) {
        finishMatch();
        return currIdx;
      }
      setLockedAns(null);
      setTimeExpired(false);
      setTimeLeft(QUESTION_TIME_SEC);
      return currIdx + 1;
    });
  }, [finishMatch]);

  const resolveCurrentQuestion = useCallback(
    (chosenIdx: number | null) => {
      if (advancedForIdxRef.current === qIdx) return;
      advancedForIdxRef.current = qIdx;

      const currQ = questionsRef.current[qIdx];
      if (!currQ) return;

      if (chosenIdx !== null) {
        setLockedAns(chosenIdx);
      } else {
        setTimeExpired(true);
      }

      let nextMy = myScoreRef.current;
      if (chosenIdx !== null && chosenIdx === currQ.ans) {
        nextMy = myScoreRef.current + 10 + Math.max(0, timeLeft);
        myScoreRef.current = nextMy;
        setMyScore(nextMy);

        correctCountRef.current += 1;
        setCorrectCount(correctCountRef.current);
      }

      if (isMultiplayerRef.current && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'score_update',
          payload: { score: nextMy },
        });
      } else if (!isMultiplayerRef.current) {
        // AI bot answers with ~68% accuracy
        if (Math.random() < 0.68) {
          const botGain = 10 + Math.floor(Math.random() * 10);
          oppScoreRef.current += botGain;
          setOppScore(oppScoreRef.current);
        }
      }

      const hasExp = Boolean(getComplexMathOrRuleExplanation(currQ, language));
      const delayMs = hasExp ? 2800 : 1100;
      advanceTimerRef.current = setTimeout(() => {
        advanceToNextQuestion();
      }, delayMs);
    },
    [qIdx, timeLeft, language, advanceToNextQuestion]
  );

  // Clean 1-second countdown timer (paused immediately once answered or expired)
  useEffect(() => {
    if (stage !== 'playing' || lockedAns !== null || timeExpired) return;
    if (timeLeft <= 0) {
      resolveCurrentQuestion(null);
      return;
    }
    const id = window.setTimeout(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [stage, lockedAns, timeExpired, timeLeft, resolveCurrentQuestion]);

  const startBotBattle = () => {
    cleanupNetworkAndTimers();
    const qList = prepareQuestions(subjId, questionCount);
    beginMatch({
      qList,
      oppName: isBn ? 'AI বট' : 'AI Rival',
      oppRank: isBn ? myRank.fullTitleBn : myRank.fullTitleEn,
      multiplayer: false,
      subjectIdVal: subjId,
      subjectLabelVal: currentSubjectLabel,
    });
  };

  const createFriendRoom = () => {
    cleanupNetworkAndTimers();
    const code = `EV-${Math.floor(1000 + Math.random() * 9000)}`;
    const qList = prepareQuestions(subjId, questionCount, code);
    const labelVal = currentSubjectLabel;
    const subjVal = subjId;

    setRoomCode(code);
    setCopiedCode(false);
    setQuestions(qList);
    questionsRef.current = qList;
    setStage('waiting_room');

    if (supabase) {
      const ch = supabase.channel(`ev_battle_${code}`);
      ch.on('broadcast', { event: 'player_join' }, (payload) => {
        const guestName = payload.payload?.name || (isBn ? 'বন্ধু' : 'Friend');
        const guestRank = payload.payload?.rank || (isBn ? 'ব্রোঞ্জ I' : 'Bronze I');

        // Broadcast host's exact question list so both players get identical questions
        ch.send({
          type: 'broadcast',
          event: 'match_start',
          payload: {
            hostName: userName,
            hostRank: isBn ? myRank.fullTitleBn : myRank.fullTitleEn,
            subjectId: subjVal,
            subjectLabel: labelVal,
            questions: qList,
          },
        });

        beginMatch({
          qList,
          oppName: guestName,
          oppRank: guestRank,
          multiplayer: true,
          subjectIdVal: subjVal,
          subjectLabelVal: labelVal,
        });
      })
        .on('broadcast', { event: 'score_update' }, (payload) => {
          if (typeof payload.payload?.score === 'number') {
            oppScoreRef.current = payload.payload.score;
            setOppScore(payload.payload.score);
          }
        })
        .subscribe();

      channelRef.current = ch;
    }
  };

  const joinFriendRoom = () => {
    const clean = joinInput.trim().toUpperCase();
    if (!clean) {
      setJoinError(isBn ? 'সঠিক রুম কোড লিখো (যেমন: EV-4829)' : 'Enter a valid room code (e.g. EV-4829)');
      return;
    }
    setJoinError('');
    cleanupNetworkAndTimers();
    setRoomCode(clean);
    setStage('joining');

    const fallbackList = prepareQuestions(subjId, questionCount, clean);
    const fallbackLabel = currentSubjectLabel;
    const fallbackSubj = subjId;

    if (supabase) {
      const ch = supabase.channel(`ev_battle_${clean}`);
      ch.on('broadcast', { event: 'match_start' }, (payload) => {
        const syncedQs =
          Array.isArray(payload.payload?.questions) && payload.payload.questions.length > 0
            ? (payload.payload.questions as MCQQuestion[])
            : fallbackList;
        beginMatch({
          qList: syncedQs,
          oppName: payload.payload?.hostName || `Host (${clean})`,
          oppRank: payload.payload?.hostRank || (isBn ? 'ব্রোঞ্জ I' : 'Bronze I'),
          multiplayer: true,
          subjectIdVal: payload.payload?.subjectId || fallbackSubj,
          subjectLabelVal: payload.payload?.subjectLabel || fallbackLabel,
        });
      })
        .on('broadcast', { event: 'score_update' }, (payload) => {
          if (typeof payload.payload?.score === 'number') {
            oppScoreRef.current = payload.payload.score;
            setOppScore(payload.payload.score);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            ch.send({
              type: 'broadcast',
              event: 'player_join',
              payload: {
                name: userName,
                rank: isBn ? myRank.fullTitleBn : myRank.fullTitleEn,
              },
            });
          }
        });

      channelRef.current = ch;

      // Fallback if host does not respond within 4 seconds
      joinTimeoutRef.current = setTimeout(() => {
        beginMatch({
          qList: fallbackList,
          oppName: `Room ${clean}`,
          oppRank: isBn ? 'লাইভ' : 'Live',
          multiplayer: true,
          subjectIdVal: fallbackSubj,
          subjectLabelVal: fallbackLabel,
        });
      }, 4000);
    } else {
      beginMatch({
        qList: fallbackList,
        oppName: isBn ? 'AI বট' : 'AI Rival',
        oppRank: isBn ? myRank.fullTitleBn : myRank.fullTitleEn,
        multiplayer: false,
        subjectIdVal: fallbackSubj,
        subjectLabelVal: fallbackLabel,
      });
    }
  };

  const handleExitToLobby = () => {
    cleanupNetworkAndTimers();
    setStage('lobby');
  };

  const handleCopyRoomCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const currentQ = questions[qIdx];
  const currentBoard = currentQ ? getMcqBoardLabel(currentQ) : '';
  const currentExp = currentQ ? getComplexMathOrRuleExplanation(currentQ, language) : '';
  const isAnsweredOrExpired = lockedAns !== null || timeExpired;
  const optLabels = isBn ? ['ক', 'খ', 'গ', 'ঘ'] : ['A', 'B', 'C', 'D'];
  const timerPct = Math.max(0, Math.min(100, Math.round((timeLeft / QUESTION_TIME_SEC) * 100)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 20 }}>
      <div className="ev-card">
        <div className="ev-section-header" style={{ marginBottom: 12 }}>
          <h2 className="ev-section-title">
            {isBn ? 'কুইজ ব্যাটল (1v1)' : 'Quiz Battle (1v1)'}
          </h2>
          {stage === 'playing' ? (
            <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={handleExitToLobby}>
              ✕ {isBn ? 'বের হও' : 'Exit'}
            </button>
          ) : (
            <span className="ev-badge-pill ev-badge-indigo">
              {isBn ? myRank.fullTitleBn : myRank.fullTitleEn}
            </span>
          )}
        </div>

        {/* LOBBY */}
        {stage === 'lobby' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                className={`ev-btn ${modeTab === 'bot' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                onClick={() => setModeTab('bot')}
              >
                {isBn ? 'AI প্র্যাকটিস' : 'AI Practice'}
              </button>
              <button
                type="button"
                className={`ev-btn ${modeTab === 'friend' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                onClick={() => setModeTab('friend')}
              >
                {isBn ? 'বন্ধুর সাথে' : 'With Friend'}
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: 10,
                padding: 12,
                borderRadius: 12,
                background: 'var(--bg-surface-muted)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                  {isBn ? 'শ্রেণি ও বিভাগ' : 'Class & Group'}
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select
                    className="ev-select"
                    style={{ width: '40%', minHeight: 36, padding: '0 8px', fontSize: 13, fontWeight: 700 }}
                    value={selectedClass}
                    onChange={(e) => {
                      const nextCls = e.target.value;
                      const firstGrp = getAvailableGroups(nextCls)[0] || 'Business Studies';
                      setClassAndGroup(nextCls, firstGrp);
                      setSubjId('all');
                    }}
                  >
                    {getAvailableClasses().map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                  <select
                    className="ev-select"
                    style={{ flex: 1, minHeight: 36, padding: '0 8px', fontSize: 13, fontWeight: 700 }}
                    value={selectedGroup}
                    onChange={(e) => {
                      setClassAndGroup(selectedClass, e.target.value);
                      setSubjId('all');
                    }}
                  >
                    {availableGroups.map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                  {isBn ? 'বিষয় নির্বাচন' : 'Subject'}
                </label>
                <select
                  className="ev-select"
                  style={{ width: '100%', minHeight: 36, fontSize: 13, fontWeight: 700 }}
                  value={subjId}
                  onChange={(e) => setSubjId(e.target.value)}
                >
                  <option value="all">{isBn ? `সকল বিষয় (${selectedGroup})` : `All Subjects (${selectedGroup})`}</option>
                  {subjects.map((s) => {
                    const cnt = s.chapters.reduce((sum, c) => sum + (c.mcqs?.length || 0), 0);
                    return (
                      <option key={s.id} value={s.id}>
                        {trText(s.name, language)} {cnt > 0 ? `(${cnt})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
                  {isBn ? 'প্রশ্ন সংখ্যা' : 'Questions'}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[5, 10, 15].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`ev-btn ev-btn-sm ${questionCount === num ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                      style={{ minHeight: 36 }}
                      onClick={() => setQuestionCount(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {modeTab === 'bot' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingTop: 4 }}>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center' }}>
                  {isBn
                    ? `প্রতি প্রশ্নে ${QUESTION_TIME_SEC} সেকেন্ড • দ্রুত সঠিক উত্তরে স্পিড বোনাস`
                    : `${QUESTION_TIME_SEC}s per question • Answer fast for speed bonus`}
                </div>
                <button
                  type="button"
                  className="ev-btn ev-btn-primary"
                  style={{ width: '100%', maxWidth: 320, minHeight: 44, fontSize: 14.5 }}
                  onClick={startBotBattle}
                >
                  {isBn ? 'ম্যাচ শুরু করো' : 'Start Battle'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 3 }}>
                      {isBn ? 'নতুন রুম তৈরি করো' : 'Create Room'}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                      {isBn ? 'রুম কোড শেয়ার করলে দুজনে একই প্রশ্নে খেলবে।' : 'Share room code to play the exact same questions.'}
                    </div>
                  </div>
                  <button type="button" className="ev-btn ev-btn-primary" style={{ width: '100%' }} onClick={createFriendRoom}>
                    {isBn ? 'রুম কোড তৈরি করো' : 'Create Room Code'}
                  </button>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>
                      {isBn ? 'কোড দিয়ে জয়েন করো' : 'Join Room'}
                    </div>
                    <input
                      type="text"
                      className="ev-input font-mono"
                      placeholder="EV-4829"
                      value={joinInput}
                      onChange={(e) => {
                        setJoinInput(e.target.value);
                        if (joinError) setJoinError('');
                      }}
                    />
                    {joinError && (
                      <div style={{ fontSize: 11.5, color: 'var(--status-danger)', marginTop: 4, fontWeight: 600 }}>
                        {joinError}
                      </div>
                    )}
                  </div>
                  <button type="button" className="ev-btn ev-btn-primary" style={{ width: '100%' }} onClick={joinFriendRoom}>
                    {isBn ? 'জয়েন করো' : 'Join Battle'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HOST WAITING ROOM */}
        {stage === 'waiting_room' && (
          <div style={{ textAlign: 'center', padding: '20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
              {isBn ? 'বন্ধুকে এই রুম কোডটি পাঠাও' : 'Share this room code with your friend'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                className="font-mono"
                style={{
                  fontSize: 26,
                  fontWeight: 900,
                  color: 'var(--brand-primary)',
                  letterSpacing: '0.08em',
                  padding: '6px 14px',
                  borderRadius: 10,
                  background: 'var(--brand-primary-soft)',
                  border: '1px solid var(--brand-primary-border)',
                }}
              >
                {roomCode}
              </span>
              <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={handleCopyRoomCode}>
                {copiedCode ? (isBn ? 'কপি হয়েছে ✓' : 'Copied ✓') : isBn ? 'কপি' : 'Copy'}
              </button>
            </div>

            <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              {isBn ? 'বন্ধু জয়েন করলেই ম্যাচ শুরু হবে...' : 'Match starts automatically when your friend joins...'}
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
              <button type="button" className="ev-btn ev-btn-primary ev-btn-sm" onClick={startBotBattle}>
                {isBn ? 'AI বটের সাথে শুরু করো' : 'Start AI Match Instead'}
              </button>
              <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={handleExitToLobby}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        {/* GUEST JOINING */}
        {stage === 'joining' && (
          <div style={{ textAlign: 'center', padding: '28px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>
              {isBn ? `রুম ${roomCode}-এ সংযুক্ত হচ্ছে...` : `Connecting to room ${roomCode}...`}
            </div>
            <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={handleExitToLobby}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
          </div>
        )}

        {/* PLAYING */}
        {stage === 'playing' && currentQ && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 3-Column Non-Wrapping VS Scoreboard */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 12,
                background: 'var(--bg-surface-muted)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userName.split(' ')[0]} ({isBn ? 'তুমি' : 'You'})
                </div>
                <div className="font-mono" style={{ fontSize: 19, fontWeight: 900, color: 'var(--brand-primary)' }}>
                  {myScore}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 2 }}>
                  {qIdx + 1}/{questions.length}
                </div>
                <span className={`ev-badge-pill font-mono ${timeLeft <= 5 ? 'ev-badge-danger' : 'ev-badge-warning'}`}>
                  {timeLeft}s
                </span>
              </div>

              <div style={{ textAlign: 'right', minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {opponentName}
                </div>
                <div className="font-mono" style={{ fontSize: 19, fontWeight: 900, color: 'var(--status-danger)' }}>
                  {oppScore}
                </div>
              </div>
            </div>

            {/* Countdown Timer Bar */}
            <div className="ev-progress-track" style={{ height: 5 }}>
              <div
                className="ev-progress-fill"
                style={{
                  width: `${timerPct}%`,
                  background: timeLeft <= 5 ? 'var(--status-danger)' : 'var(--brand-primary)',
                  transition: 'width 0.9s linear',
                }}
              />
            </div>

            {/* Question Card */}
            <div style={{ padding: '14px', borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
              {currentBoard && (
                <div style={{ marginBottom: 8 }}>
                  <span className="ev-badge-pill ev-badge-warning" style={{ fontSize: 11 }}>
                    {currentBoard}
                  </span>
                </div>
              )}

              <div
                style={{
                  fontSize: 15.5,
                  fontWeight: 700,
                  marginBottom: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                }}
              >
                {trText(currentQ.q, language)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(language === 'en' && currentQ.options.en?.length
                  ? currentQ.options.en
                  : currentQ.options.bn?.length
                  ? currentQ.options.bn
                  : currentQ.options.en
                ).map((opt, idx) => {
                  const isPicked = lockedAns === idx;
                  const isRight = isAnsweredOrExpired && idx === currentQ.ans;
                  const isWrong = isPicked && idx !== currentQ.ans;

                  let stateClass = '';
                  if (isRight) stateClass = 'is-correct';
                  else if (isWrong) stateClass = 'is-incorrect';

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnsweredOrExpired}
                      className={`ev-option-btn ${stateClass}`}
                      onClick={() => resolveCurrentQuestion(idx)}
                    >
                      <span className="ev-option-index">{optLabels[idx]}</span>
                      <span className="ev-option-text">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {isAnsweredOrExpired && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentExp && (
                    <div className="ev-explanation-box" style={{ marginTop: 0 }}>
                      <strong>{isBn ? 'ব্যাখ্যা:' : 'Explanation:'}</strong> {currentExp}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="button" className="ev-btn ev-btn-primary ev-btn-sm" onClick={advanceToNextQuestion}>
                      {qIdx + 1 >= questions.length
                        ? isBn
                          ? 'ফলাফল দেখো'
                          : 'View Result'
                        : isBn
                        ? 'পরবর্তী →'
                        : 'Next →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FINISHED */}
        {stage === 'finished' && (
          <div style={{ textAlign: 'center', padding: '18px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <h3 style={{ fontSize: 20, fontWeight: 800 }}>
              {myScore > oppScore
                ? isBn
                  ? 'অভিনন্দন! তুমি জয়ী হয়েছ'
                  : 'Victory! You Won'
                : myScore === oppScore
                ? isBn
                  ? 'ম্যাচ ড্র হয়েছে'
                  : 'Match Tied'
                : isBn
                ? 'ভালো চেষ্টা! পরের বার জয় হবে'
                : 'Good Effort!'}
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                width: '100%',
                maxWidth: 340,
                padding: 12,
                borderRadius: 12,
                background: 'var(--bg-surface-muted)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{isBn ? 'তোমার স্কোর' : 'Your Score'}</div>
                <div className="font-mono" style={{ fontSize: 22, fontWeight: 900, color: 'var(--brand-primary)' }}>
                  {myScore}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>{opponentName}</div>
                <div className="font-mono" style={{ fontSize: 22, fontWeight: 900, color: 'var(--status-danger)' }}>
                  {oppScore}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className="ev-badge-pill ev-badge-neutral">
                {isBn ? 'সঠিক উত্তর' : 'Correct'}: {correctCount}/{questions.length}
              </span>
              <span className={`ev-badge-pill ${earnedXp > 0 ? 'ev-badge-success' : 'ev-badge-neutral'}`}>
                {earnedXp > 0
                  ? `+${earnedXp} XP`
                  : isBn
                  ? 'আজকের ব্যাটল XP লিমিট শেষ'
                  : 'Daily Battle XP Limit Reached'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className="ev-btn ev-btn-primary"
                onClick={isMultiplayer ? handleExitToLobby : startBotBattle}
              >
                {isBn ? 'আবার খেলো' : 'Play Again'}
              </button>
              <button type="button" className="ev-btn ev-btn-secondary" onClick={handleExitToLobby}>
                {isBn ? 'লবিতে ফেরো' : 'Back to Lobby'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBattleView;
