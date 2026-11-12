import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChapterFormulaItem,
  getAvailableClasses,
  getAvailableGroups,
  getSubjectsForSelection,
  subjectSupportsFormulas,
  trKey,
  trText,
  useExamStore,
} from '../store/useExamStore';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { MCQ, SubjectData } from '../types';
import { getComplexMathOrRuleExplanation } from './ModalsAndQuiz';

function MetallicBadgeSvg({ color, label }: { color: string; label: string }) {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <polygon
        points="20,2 35,10 35,28 20,38 5,28 5,10"
        fill={color}
        fillOpacity="0.16"
        stroke={color}
        strokeWidth="2.4"
      />
      <polygon points="20,6 31,12 31,26 20,34 9,26 9,12" fill={color} />
      <text x="20" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
        {label}
      </text>
    </svg>
  );
}

/**
 * Curated High-Yield Board & Admission MCQs by Group & Subject
 * Ensures every Group (Science, Business Studies, Humanities, Admission, BCS) and Subject
 * has authentic, top-tier Board & mathematical/analytical MCQs for 1v1 Quiz Battles.
 */
const ELITE_GROUP_BATTLE_BANK: Record<string, MCQ[]> = {
  science: [
    {
      id: 'eb-sci-1',
      q: { bn: 'একটি প্রাসের প্রক্ষেপণ কোণ কত হলে আনুভূমিক পাল্লা (R) এবং সর্বাধিক উচ্চতা (H) সমান হবে?', en: 'At what projection angle is horizontal range (R) equal to maximum height (H)?' },
      options: { bn: ['45°', '60°', '75.96° (tan⁻¹4)', '30°'], en: ['45°', '60°', '75.96° (tan⁻¹4)', '30°'] },
      ans: 2,
      board: "ঢা. বো. '২৩ • BUET",
      explanation: { bn: 'আমরা জানি, R = 4H cotθ। যেহেতু R = H, তাই 4 cotθ = 1 ⇒ tanθ = 4 ⇒ θ = tan⁻¹(4) = 75.96°।', en: 'R = H => tanθ = 4 => θ = 75.96°.' },
    },
    {
      id: 'eb-sci-2',
      q: { bn: 'পৃথিবীর মুক্তিবেগ (Escape Velocity) কত?', en: 'What is the escape velocity of Earth?' },
      options: { bn: ['9.8 km/s', '11.2 km/s', '7.9 km/s', '15.4 km/s'], en: ['9.8 km/s', '11.2 km/s', '7.9 km/s', '15.4 km/s'] },
      ans: 1,
      board: "রা. বো. '২৩ • DU",
      explanation: { bn: 'সূত্র: v_e = √(2gR) = √(2 × 9.8 × 6.4×10⁶) ≈ 11.2 km/s।', en: 'v_e = sqrt(2gR) = 11.2 km/s.' },
    },
    {
      id: 'eb-sci-3',
      q: { bn: '0.01 M HCl দ্রবণের pH মান কত?', en: 'What is the pH of a 0.01 M HCl solution?' },
      options: { bn: ['1', '2', '3', '12'], en: ['1', '2', '3', '12'] },
      ans: 1,
      board: "চ. বো. '২৩ • Medical",
      explanation: { bn: 'pH = -log[H⁺] = -log(0.01) = -log(10⁻²) = 2।', en: 'pH = -log(10^-2) = 2.' },
    },
    {
      id: 'eb-sci-4',
      q: { bn: '∫ (1 / x) dx এর সমাকলন মান নিচের কোনটি?', en: 'What is the integral of ∫ (1 / x) dx?' },
      options: { bn: ['ln|x| + c', '-1/x² + c', 'x ln(x) + c', 'eˣ + c'], en: ['ln|x| + c', '-1/x² + c', 'x ln(x) + c', 'eˣ + c'] },
      ans: 0,
      board: "য. বো. '২২",
      explanation: { bn: 'ক্যালকুলাসের মৌলিক সূত্রানুসারে d/dx (ln|x|) = 1/x, তাই ∫(1/x)dx = ln|x| + c।', en: '∫(1/x)dx = ln|x| + c.' },
    },
    {
      id: 'eb-sci-5',
      q: { bn: 'মাইটোকন্ড্রিয়াকে কোষের ‘পাওয়ার হাউস’ (Powerhouse) বলার প্রধান কারণ কী?', en: 'Why is Mitochondria called the powerhouse of the cell?' },
      options: { bn: ['প্রোটিন সংশ্লেষণ করে', 'ক্রেবস চক্র ও ইলেকট্রন ট্রান্সপোর্টের মাধ্যমে ATP উৎপাদন করে', 'বংশগতির বৈশিষ্ট্য বহন করে', 'কোষ বিভাজন নিয়ন্ত্রণ করে'], en: ['Synthesizes protein', 'Produces ATP via Krebs cycle & ETC', 'Carries genetic traits', 'Controls cell division'] },
      ans: 1,
      board: "সকল বোর্ড '২২ • Medical",
      explanation: { bn: 'মাইটোকন্ড্রিয়ায় সবাত শ্বসনের ক্রেবস চক্র ও ETC সম্পন্ন হয়ে দেহের প্রয়োজনীয় শক্তির প্রধান উৎস ATP উৎপন্ন হয়।', en: 'Produces ATP through cellular respiration.' },
    },
  ],
  business: [
    {
      id: 'eb-bus-1',
      q: { bn: 'প্রারম্ভিক মজুদ পণ্য ৪০,০০০ টাকা, ক্রয় ২,০০,০০০ টাকা, ক্রয় পরিবহন ১০,০০০ টাকা এবং সমাপনী মজুদ ৫০,০০০ টাকা হলে বিক্রীত পণ্যের ব্যয় (COGS) কত?', en: 'Opening inventory 40,000, Purchase 2,00,000, Carriage inward 10,000, Closing inventory 50,000. What is Cost of Goods Sold?' },
      options: { bn: ['১,৯০,০০০ টাকা', '২,০০,০০০ টাকা', '২,৫০,০০০ টাকা', '১,৮০,০০০ টাকা'], en: ['1,90,000 Tk', '2,00,000 Tk', '2,50,000 Tk', '1,80,000 Tk'] },
      ans: 1,
      board: "ঢা. বো. '২৩ • DU C-Unit",
      explanation: { bn: 'বিক্রীত পণ্যের ব্যয় = প্রারম্ভিক মজুদ (৪০,০০০) + নিট ক্রয় (২,০০,০০০) + ক্রয় পরিবহন (১০,০০০) - সমাপনী মজুদ (৫০,০০০) = ২,০০,০০০ টাকা।', en: 'COGS = 40,000 + 2,00,000 + 10,000 - 50,000 = 2,00,000 Tk.' },
    },
    {
      id: 'eb-bus-2',
      q: { bn: 'একটি প্রতিষ্ঠানের চলতি সম্পদ ১,৫০,০০০ টাকা, মজুদ পণ্য ৩০,০০০ টাকা এবং চলতি দায় ৭৫,০০০ টাকা হলে তড়িৎ অনুপাত (Quick Ratio) কত?', en: 'Current Assets 1,50,000, Inventory 30,000, Current Liabilities 75,000. What is the Quick Ratio?' },
      options: { bn: ['২ : ১', '১.৬ : ১', '১.২ : ১', '১ : ১'], en: ['2 : 1', '1.6 : 1', '1.2 : 1', '1 : 1'] },
      ans: 1,
      board: "রা. বো. '২৩",
      explanation: { bn: 'তড়িৎ সম্পদ = চলতি সম্পদ - মজুদ পণ্য = ১,৫০,০০০ - ৩০,০০০ = ১,২০,০০০ টাকা। তড়িৎ অনুপাত = ১,২০,০০০ ÷ ৭৫,০০০ = ১.৬ : ১।', en: 'Quick Ratio = (150,000 - 30,000) / 75,000 = 1.6 : 1.' },
    },
    {
      id: 'eb-bus-3',
      q: { bn: 'বার্ষিক ১২% চক্রবৃদ্ধি সুদে ‘বিধি-৭২’ (Rule-72) অনুযায়ী কত বছরে বিনিয়োগকৃত অর্থ দ্বিগুণ হবে?', en: 'At 12% annual interest, in how many years will an investment double according to Rule-72?' },
      options: { bn: ['৫ বছরে', '৬ বছরে', '৮ বছরে', '১২ বছরে'], en: ['5 years', '6 years', '8 years', '12 years'] },
      ans: 1,
      board: "চ. বো. '২৩ • ফিন্যান্স",
      explanation: { bn: 'বিধি-৭২ অনুযায়ী অর্থ দ্বিগুণ হওয়ার সময় n = ৭২ ÷ সুদের হার (i) = ৭২ ÷ ১২ = ৬ বছর।', en: 'n = 72 / 12 = 6 years.' },
    },
    {
      id: 'eb-bus-4',
      q: { bn: 'আধুনিক ব্যবস্থাপনার জনক (Father of Modern Management) কে?', en: 'Who is the Father of Modern Management?' },
      options: { bn: ['এফ. ডব্লিউ. টেইলর', 'হেনরি ফেয়ল (Henri Fayol)', 'এলটন মেয়ো', 'পিটার ড্রাকার'], en: ['F.W. Taylor', 'Henri Fayol', 'Elton Mayo', 'Peter Drucker'] },
      ans: 1,
      board: "সকল বোর্ড '২২",
      explanation: { bn: 'হেনরি ফেয়লকে আধুনিক ব্যবস্থাপনার জনক এবং এফ. ডব্লিউ. টেইলরকে বৈজ্ঞানিক ব্যবস্থাপনার জনক বলা হয়।', en: 'Henri Fayol is the Father of Modern Management.' },
    },

আগের মেসেজে **`src/App.tsx`**-এর সম্পূর্ণ কোড এবং ৫টি স্ক্রিনশটের সবগুলো সমস্যার সমাধান দেওয়া হয়েছে। মেসেজ বড় হওয়ায় **`src/components/ExtraFeatures.tsx`** ফাইলটি নিচে **১০০% সম্পূর্ণ (শুরু থেকে শেষ লাইন পর্যন্ত)** দিয়ে দিলাম।

### এক নজরে `ExtraFeatures.tsx`-এ যেসব নতুন ফিচার ও বাগ ফিক্স করা হয়েছে:
* **কুইজ ব্যাটল (All Subjects বা যেকোনো ১টি বিষয়)**: ব্যাটল লবিতে শ্রেণি ও বিভাগ (`Science` / `Business Studies` / `Humanities`) পরিবর্তনের অপশন এবং **`📚 সকল বিষয় — সেরা MCQ মিশ্রণ (All Subjects)`** অথবা **যেকোনো ১টি নির্দিষ্ট বিষয়** সিলেক্ট করার অপশন যুক্ত করা হয়েছে।
* **স্মার্ট Best-MCQ বাছাই লজিক (`scoreMcqForBattle` ও `prepareBattleQuestions`)**: ইউজার যে গ্রুপ বা বিষয় সিলেক্ট করবে, সেই গ্রুপের সবগুলো বিষয়ের (বা নির্দিষ্ট বিষয়ের সব অধ্যায়ের) **বোর্ড প্রশ্ন (`ঢা. বো.`, `রা. বো.`, `DU`, `BUET`, `Medical`, `GST`), গাণিতিক হিসাব ও নিয়মভিত্তিক সেরা MCQ গুলোকে** সর্বোচ্চ অগ্রাধিকার দিয়ে রাউন্ড-রবিন পদ্ধতিতে সাজানো হবে।
* **মোবাইল বাটন ও কার্ড ওভারফ্লো ফিক্স**: `⚡ অনলাইন ম্যাচ শুরু করুন`, `🔑 রুম কোড তৈরি করো`, এবং `🚀 রুমে জয়েন ও ব্যাটল শুরু` বাটনগুলো মোবাইলে আর কখনোই বক্সের বাইরে বেরিয়ে যাবে না এবং রুম কার্ড দুটি মোবাইলে ফুল-উইডথে ওপর-নিচে বসবে।
* **লিডারবোর্ড ফিক্স**: নিচে `#1 শিক্ষার্থী (তুমি)` সারি কেটে যাওয়া, পডিয়ামের নাম কেটে যাওয়া ও `0 XP` সমস্যা এবং ওপরের কার্ডের ওভারল্যাপিং স্কেচ সম্পূর্ণ ফিক্স করা হয়েছে।

---

### ফাইল ২: `src/components/ExtraFeatures.tsx` (১০০% সম্পূর্ণ কোড)
তোমার প্রজেক্টের **`src/components/ExtraFeatures.tsx`** ফাইলটি ওপেন করে নিচের সম্পূর্ণ কোডটি দিয়ে রিপ্লেস (`Ctrl+A` চাপার পর `Ctrl+V`) করে দাও:

```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChapterFormulaItem,
  getAvailableClasses,
  getAvailableGroups,
  getSubjectsForSelection,
  subjectSupportsFormulas,
  trKey,
  trText,
  useExamStore,
} from '../store/useExamStore';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { MCQ, SubjectData } from '../types';
import { getComplexMathOrRuleExplanation } from './ModalsAndQuiz';

function MetallicBadgeSvg({ color, label }: { color: string; label: string }) {
  return (
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <polygon points="20,2 35,10 35,28 20,38 5,28 5,10" fill={color} fillOpacity="0.16" stroke={color} strokeWidth="2.4" />
      <polygon points="20,6 31,12 31,26 20,34 9,26 9,12" fill={color} />
      <text x="20" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
        {label}
      </text>
    </svg>
  );
}

/**
 * Curated High-Yield Board & Admission MCQs by Group & Subject
 * Ensures every Group (Science, Business Studies, Humanities) and Subject has top-tier Board & analytical MCQs.
 */
const ELITE_GROUP_BATTLE_BANK: Record<string, MCQ[]> = {
  science: [
    {
      id: 'eb-sci-1',
      q: { bn: 'একটি প্রাসের প্রক্ষেপণ কোণ কত হলে আনুভূমিক পাল্লা (R) এবং সর্বাধিক উচ্চতা (H) সমান হবে?', en: 'At what projection angle is horizontal range (R) equal to maximum height (H)?' },
      options: { bn: ['45°', '60°', '75.96° (tan⁻¹4)', '30°'], en: ['45°', '60°', '75.96° (tan⁻¹4)', '30°'] },
      ans: 2,
      board: "ঢা. বো. '২৩ • BUET",
      explanation: { bn: 'আমরা জানি, R = 4H cotθ। যেহেতু R = H, তাই 4 cotθ = 1 ⇒ tanθ = 4 ⇒ θ = tan⁻¹(4) = 75.96°।', en: 'R = H => tanθ = 4 => θ = 75.96°.' },
    },
    {
      id: 'eb-sci-2',
      q: { bn: 'পৃথিবীর মুক্তিবেগ (Escape Velocity) কত?', en: 'What is the escape velocity of Earth?' },
      options: { bn: ['9.8 km/s', '11.2 km/s', '7.9 km/s', '15.4 km/s'], en: ['9.8 km/s', '11.2 km/s', '7.9 km/s', '15.4 km/s'] },
      ans: 1,
      board: "রা. বো. '২৩ • DU",
      explanation: { bn: 'সূত্র: v_e = √(2gR) = √(2 × 9.8 × 6.4×10⁶) ≈ 11.2 km/s।', en: 'v_e = sqrt(2gR) = 11.2 km/s.' },
    },
    {
      id: 'eb-sci-3',
      q: { bn: '0.01 M HCl দ্রবণের pH মান কত?', en: 'What is the pH of a 0.01 M HCl solution?' },
      options: { bn: ['1', '2', '3', '12'], en: ['1', '2', '3', '12'] },
      ans: 1,
      board: "চ. বো. '২৩ • Medical",
      explanation: { bn: 'pH = -log[H⁺] = -log(0.01) = -log(10⁻²) = 2।', en: 'pH = -log(10^-2) = 2.' },
    },
    {
      id: 'eb-sci-4',
      q: { bn: '∫ (1 / x) dx এর সমাকলন মান নিচের কোনটি?', en: 'What is the integral of ∫ (1 / x) dx?' },
      options: { bn: ['ln|x| + c', '-1/x² + c', 'x ln(x) + c', 'eˣ + c'], en: ['ln|x| + c', '-1/x² + c', 'x ln(x) + c', 'eˣ + c'] },
      ans: 0,
      board: "য. বো. '২২",
      explanation: { bn: 'ক্যালকুলাসের মৌলিক সূত্রানুসারে d/dx (ln|x|) = 1/x, তাই ∫(1/x)dx = ln|x| + c।', en: '∫(1/x)dx = ln|x| + c.' },
    },
    {
      id: 'eb-sci-5',
      q: { bn: 'মাইটোকন্ড্রিয়াকে কোষের ‘পাওয়ার হাউস’ (Powerhouse) বলার প্রধান কারণ কী?', en: 'Why is Mitochondria called the powerhouse of the cell?' },
      options: { bn: ['প্রোটিন সংশ্লেষণ করে', 'ক্রেবস চক্র ও ইলেকট্রন ট্রান্সপোর্টের মাধ্যমে ATP উৎপাদন করে', 'বংশগতির বৈশিষ্ট্য বহন করে', 'কোষ বিভাজন নিয়ন্ত্রণ করে'], en: ['Synthesizes protein', 'Produces ATP via Krebs cycle & ETC', 'Carries genetic traits', 'Controls cell division'] },
      ans: 1,
      board: "সকল বোর্ড '২২ • Medical",
      explanation: { bn: 'মাইটোকন্ড্রিয়ায় সবাত শ্বসনের ক্রেবস চক্র ও ETC সম্পন্ন হয়ে দেহের প্রয়োজনীয় শক্তির প্রধান উৎস ATP উৎপন্ন হয়।', en: 'Produces ATP through cellular respiration.' },
    },
  ],
  business: [
    {
      id: 'eb-bus-1',
      q: { bn: 'প্রারম্ভিক মজুদ ৪০,০০০ টাকা, ক্রয় ২,০০,০০০ টাকা, ক্রয় পরিবহন ১০,০০০ টাকা এবং সমাপনী মজুদ ৫০,০০০ টাকা হলে বিক্রীত পণ্যের ব্যয় (COGS) কত?', en: 'Opening inventory 40,000, Purchase 2,00,000, Carriage inward 10,000, Closing inventory 50,000. What is COGS?' },
      options: { bn: ['১,৯০,০০০ টাকা', '২,০০,০০০ টাকা', '২,৫০,০০০ টাকা', '১,৮০,০০০ টাকা'], en: ['1,90,000 Tk', '2,00,000 Tk', '2,50,000 Tk', '1,80,000 Tk'] },
      ans: 1,
      board: "ঢা. বো. '২৩ • DU C-Unit",
      explanation: { bn: 'বিক্রীত পণ্যের ব্যয় = প্রারম্ভিক মজুদ (৪০,০০০) + ক্রয় (২,০০,০০০) + ক্রয় পরিবহন (১০,০০০) - সমাপনী মজুদ (৫০,০০০) = ২,০০,০০০ টাকা।', en: 'COGS = 40,000 + 2,00,000 + 10,000 - 50,000 = 2,00,000 Tk.' },
    },
    {
      id: 'eb-bus-2',
      q: { bn: 'একটি প্রতিষ্ঠানের চলতি সম্পদ ১,৫০,০০০ টাকা, মজুদ পণ্য ৩০,০০০ টাকা এবং চলতি দায় ৭৫,০০০ টাকা হলে তড়িৎ অনুপাত (Quick Ratio) কত?', en: 'Current Assets 1,50,000, Inventory 30,000, Current Liabilities 75,000. What is the Quick Ratio?' },
      options: { bn: ['২ : ১', '১.৬ : ১', '১.২ : ১', '১ : ১'], en: ['2 : 1', '1.6 : 1', '1.2 : 1', '1 : 1'] },
      ans: 1,
      board: "রা. বো. '২৩",
      explanation: { bn: 'তড়িৎ সম্পদ = ১,৫০,০০০ - ৩০,০০০ = ১,২০,০০০ টাকা। তড়িৎ অনুপাত = ১,২০,০০০ ÷ ৭৫,০০০ = ১.৬ : ১।', en: 'Quick Ratio = (150,000 - 30,000) / 75,000 = 1.6 : 1.' },
    },
    {
      id: 'eb-bus-3',
      q: { bn: 'বার্ষিক ১২% চক্রবৃদ্ধি সুদে ‘বিধি-৭২’ (Rule-72) অনুযায়ী কত বছরে বিনিয়োগকৃত অর্থ দ্বিগুণ হবে?', en: 'At 12% annual interest, in how many years will an investment double according to Rule-72?' },
      options: { bn: ['৫ বছরে', '৬ বছরে', '৮ বছরে', '১২ বছরে'], en: ['5 years', '6 years', '8 years', '12 years'] },
      ans: 1,
      board: "চ. বো. '২৩ • ফিন্যান্স",
      explanation: { bn: 'বিধি-৭২ অনুযায়ী অর্থ দ্বিগুণ হওয়ার সময় n = ৭২ ÷ সুদের হার (i) = ৭২ ÷ ১২ = ৬ বছর।', en: 'n = 72 / 12 = 6 years.' },
    },
    {
      id: 'eb-bus-4',
      q: { bn: 'আধুনিক ব্যবস্থাপনার জনক (Father of Modern Management) কে?', en: 'Who is the Father of Modern Management?' },
      options: { bn: ['এফ. ডব্লিউ. টেইলর', 'হেনরি ফেয়ল (Henri Fayol)', 'এলটন মেয়ো', 'পিটার ড্রাকার'], en: ['F.W. Taylor', 'Henri Fayol', 'Elton Mayo', 'Peter Drucker'] },
      ans: 1,
      board: "সকল বোর্ড '২২",
      explanation: { bn: 'হেনরি ফেয়লকে আধুনিক ব্যবস্থাপনার জনক এবং এফ. ডব্লিউ. টেইলরকে বৈজ্ঞানিক ব্যবস্থাপনার জনক বলা হয়।', en: 'Henri Fayol is the Father of Modern Management.' },
    },
    {
      id: 'eb-bus-5',
      q: { bn: 'নগদে যন্ত্রপাতি ক্রয় ৫০,০০০ টাকা — এর সঠিক জাবেদা দাখিলা কোনটি?', en: 'Purchased machinery for cash 50,000 Tk — which is the correct journal entry?' },
      options: { bn: ['ক্রয় হিসাব ডেবিট, নগদান ক্রেডিট', 'যন্ত্রপাতি হিসাব ডেবিট, নগদান হিসাব ক্রেডিট', 'নগদান ডেবিট, যন্ত্রপাতি ক্রেডিট', 'যন্ত্রপাতি ডেবিট, প্রদেয় হিসাব ক্রেডিট'], en: ['Purchase Dr, Cash Cr', 'Machinery A/c Dr, Cash A/c Cr', 'Cash Dr, Machinery Cr', 'Machinery Dr, Accounts Payable Cr'] },
      ans: 1,
      board: "কু. বো. '২৩",
      explanation: { bn: 'স্থায়ী সম্পত্তি (যন্ত্রপাতি) বৃদ্ধি পাওয়ায় যন্ত্রপাতি হিসাব ডেবিট এবং নগদ অর্থ হ্রাস পাওয়ায় নগদান হিসাব ক্রেডিট।', en: 'Asset (Machinery) increases -> Debit; Cash decreases -> Credit.' },
    },
  ],
  humanities: [
    {
      id: 'eb-hum-1',
      q: { bn: 'চাহিদা সমীকরণ Q_d = 40 - 2P এবং যোগান সমীকরণ Q_s = 10 + 3P হলে ভারসাম্য দাম (Equilibrium Price, P) কত?', en: 'If Qd = 40 - 2P and Qs = 10 + 3P, what is the Equilibrium Price (P)?' },
      options: { bn: ['5 টাকা', '6 টাকা', '8 টাকা', '10 টাকা'], en: ['5 Tk', '6 Tk', '8 Tk', '10 Tk'] },
      ans: 1,
      board: "ঢা. বো. '২৩ • অর্থনীতি",
      explanation: { bn: 'ভারসাম্য অবস্থায় Q_d = Q_s ⇒ 40 - 2P = 10 + 3P ⇒ 5P = 30 ⇒ P = 6 টাকা।', en: '40 - 2P = 10 + 3P => 5P = 30 => P = 6.' },
    },
    {
      id: 'eb-hum-2',
      q: { bn: 'ঐতিহাসিক লাহোর প্রস্তাব কত সালে এবং কার কর্তৃক উত্থাপিত হয়?', en: 'In which year and by whom was the historic Lahore Resolution presented?' },
      options: { bn: ['১৯৪০ সালের ২৩ মার্চ, এ. কে. ফজলুল হক', '১৯৪০ সালের ২৪ মার্চ, মোহাম্মদ আলী জিন্নাহ', '১৯৪৭ সালের ১৪ আগস্ট, লিয়াকত আলী খান', '১৯৩৫ সালে, লর্ড মাউন্টব্যাটেন'], en: ['23 March 1940, A.K. Fazlul Huq', '24 March 1940, M.A. Jinnah', '14 August 1947, Liaquat Ali Khan', '1935, Lord Mountbatten'] },
      ans: 0,
      board: "রা. বো. '২৩ • ইতিহাস ও পৌরনীতি",
      explanation: { bn: '', en: '' },
    },
    {
      id: 'eb-hum-3',
      q: { bn: 'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান কবে থেকে কার্যকর হয়?', en: 'When did the Constitution of Bangladesh come into effect?' },
      options: { bn: ['৪ নভেম্বর ১৯৭২', '১৬ ডিসেম্বর ১৯৭২', '২৬ মার্চ ১৯৭২', '১৭ এপ্রিল ১৯৭১'], en: ['4 Nov 1972', '16 Dec 1972', '26 Mar 1972', '17 Apr 1971'] },
      ans: 1,
      board: "সকল বোর্ড '২৩ • BCS",
      explanation: { bn: '', en: '' },
    },
    {
      id: 'eb-hum-4',
      q: { bn: 'কোনো দ্রব্যের দাম ১০% বৃদ্ধি পাওয়ায় চাহিদার পরিমাণ ২০% হ্রাস পেলে চাহিদার দাম স্থিতিস্থাপকতা (E_p) কত?', en: 'If price rises by 10% and quantity demanded falls by 20%, what is the price elasticity of demand?' },
      options: { bn: ['0.5', '2.0 (স্থিতিস্থাপক)', '1.0', '10'], en: ['0.5', '2.0 (Elastic)', '1.0', '10'] },
      ans: 1,
      board: "চ. বো. '২২ • অর্থনীতি",
      explanation: { bn: 'সূত্র: E_p = (%ΔQ) ÷ (%ΔP) = ২০% ÷ ১০% = ২.০ (একক অপেক্ষা অধিক স্থিতিস্থাপক)।', en: 'Ep = 20% / 10% = 2.0.' },
    },
  ],
  common: [
    {
      id: 'eb-com-1',
      q: { bn: '(101101)₂ বাইনারি সংখ্যাটির দশমিক (Decimal) মান কত?', en: 'What is the decimal value of the binary number (101101)₂?' },
      options: { bn: ['(43)₁₀', '(45)₁₀', '(47)₁₀', '(53)₁₀'], en: ['(43)₁₀', '(45)₁₀', '(47)₁₀', '(53)₁₀'] },
      ans: 1,
      board: "ঢা. বো. '২৩ • ICT",
      explanation: { bn: '(101101)₂ = 1×2⁵ + 0×2⁴ + 1×2³ + 1×2² + 0×2¹ + 1×2⁰ = 32 + 0 + 8 + 4 + 0 + 1 = (45)₁₀।', en: '32 + 8 + 4 + 1 = 45.' },
    },
    {
      id: 'eb-com-2',
      q: { bn: 'কোনো 3-input বিশিষ্ট সত্যক সারণিতে (Truth Table) মোট কয়টি ইনপুট কম্বিনেশন বা সারি থাকে?', en: 'How many rows are in a 3-input Truth Table?' },
      options: { bn: ['6টি', '8টি', '9টি', '16টি'], en: ['6', '8', '9', '16'] },
      ans: 1,
      board: "রা. বো. '২৩ • ICT",
      explanation: { bn: 'n-সংখ্যক ইনপুটের জন্য সত্যক সারণির সারি সংখ্যা = 2ⁿ। এখানে n = 3 হওয়ায় 2³ = 8টি সারি থাকে।', en: '2^n = 2^3 = 8 rows.' },
    },
    {
      id: 'eb-com-3',
      q: { bn: 'HTML-এ সবচেয়ে বড় আকারের হেডিং (Heading) ট্যাগ কোনটি?', en: 'Which is the largest heading tag in HTML?' },
      options: { bn: ['<h6>', '<head>', '<h1>', '<header>'], en: ['<h6>', '<head>', '<h1>', '<header>'] },
      ans: 2,
      board: "সকল বোর্ড '২২ • ICT",
      explanation: { bn: 'HTML-এ হেডিং ট্যাগ ৬টি (<h1> থেকে <h6>), যার মধ্যে <h1> সবচেয়ে বড় এবং <h6> সবচেয়ে ছোট।', en: '<h1> is the largest and <h6> is the smallest heading tag.' },
    },
  ],
};

/**
 * Scores an MCQ on competitive quality so 1v1 Quiz Battles always pick the "Best of the Best" MCQs
 */
function scoreMcqForBattle(q: MCQ): number {
  let score = 0;
  const qText = (q.q?.bn || q.q?.en || '').trim();
  const board = (q.board || '').trim();
  const exp = getComplexMathOrRuleExplanation(q, 'bn');

  if (!qText || (q.options?.bn?.length || 0) < 4) return -999;

  if (
    board &&
    !board.includes('NCTB ও বোর্ড প্রশ্ন') &&
    /(বো\.|বোর্ড|Board|BUET|DU|Medical|GST|BCS|RU|CU|JU|CKRUET|সকল)/i.test(board)
  ) {
    score += 40;
  }

  if (exp.length > 0) {
    score += 35;
  } else if (/[0-9০-৯]{2,}|[=+\-×÷/%√^₂₈₁₀₁₆]|টাকা|অনুপাত|হার|কত|সমীকরণ|বেগ|বল|রোধ|বাইনারি|গেট|ট্যাগ/.test(qText)) {
    score += 25;
  }

  if (qText.length >= 18 && qText.length <= 165) {
    score += 15;
  }

  return score;
}

/**
 * Deterministic shuffle for Room Codes so two friends joining the same room get the exact same curated Best MCQs
 */
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

export const ExtraFeaturesView: React.FC = () => {
  const {
    language,
    activeTab,
    selectedClass,
    selectedGroup,
    setClassAndGroup,
    formulaSubjectId,
    formulaChapterId,
    setFormulaFilter,
    userName,
    userAvatar,
    userId,
    xp,
    streak,
    mistakes,
    markMistakeMastered,
    flashcards,
    addFlashcard,
    deleteFlashcard,
    studyTasks,
    addStudyTask,
    toggleStudyTask,
    deleteStudyTask,
    communityPosts,
    addCommunityPost,
    togglePostLike,
    addCommunityReply,
    examHistory,
    addXp,
    getRankInfo,
    friendList,
    addFriendByCode,
    removeFriend,
    isAdminUnlocked,
    unlockAdmin,
    lockAdmin,
    setAdminPin,
    importBulkMcqs,
    addSingleCustomMcq,
    updateCustomMcqAnswer,
    editCustomMcqFull,
    deleteCustomMcq,
    deleteCustomSubject,
    questionReports,
    resolveQuestionReport,
    deleteQuestionReport,
    exportProjectSyllabusCode,
    fetchLeaderboardUsers,
  } = useExamStore();

  const isBn = language !== 'en';
  const myRank = getRankInfo();
  const subjects: SubjectData[] = getSubjectsForSelection(selectedClass, selectedGroup);

  /* 1. FORMULAS STATE */
  const mathSubjects = useMemo(() => subjects.filter((s) => subjectSupportsFormulas(s)), [subjects]);
  const [formulaSearch, setFormulaSearch] = useState('');
  const activeFormulaSubjId =
    formulaSubjectId && (formulaSubjectId === 'all' || mathSubjects.some((s) => s.id === formulaSubjectId))
      ? formulaSubjectId
      : mathSubjects[0]?.id || 'all';
  const activeFormulaChapId = formulaChapterId || 'all';

  /* 2. LEADERBOARD STATE */
  const [lbMode, setLbMode] = useState<'global' | 'friends'>('global');
  const [lbTimeframe, setLbTimeframe] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [lbSubjectFilter, setLbSubjectFilter] = useState<string>('all');
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friendNameInput, setFriendNameInput] = useState('');
  const [liveCloudLb, setLiveCloudLb] = useState<any[]>([]);
  const [loadingLb, setLoadingLb] = useState(false);

  const refreshLiveLeaderboard = async () => {
    setLoadingLb(true);
    try {
      const list = await fetchLeaderboardUsers();
      setLiveCloudLb(list || []);
    } finally {
      setLoadingLb(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      refreshLiveLeaderboard();
    }
  }, [activeTab, xp]);

  /* 3. 1v1 QUIZ BATTLE STATE */
  const [battleModeTab, setBattleModeTab] = useState<'online' | 'friend'>('online');
  const [battleStage, setBattleStage] = useState<'lobby' | 'searching' | 'waiting_room' | 'playing' | 'finished'>('lobby');
  const [battleSubjId, setBattleSubjId] = useState<string>('all');
  const [battleQuestionCount, setBattleQuestionCount] = useState<number>(10);
  const [battleRoomCode, setBattleRoomCode] = useState<string>('');
  const [joinRoomInput, setJoinRoomInput] = useState<string>('');
  const [opponentName, setOpponentName] = useState<string>('রাকিব হাসান (DU Aspirant)');
  const [opponentRankTitle, setOpponentRankTitle] = useState<string>('গোল্ড II');
  const [battleQuestions, setBattleQuestions] = useState<MCQ[]>([]);
  const [battleQIdx, setBattleQIdx] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [battleTimeLeft, setBattleTimeLeft] = useState(15);
  const [battleLockedAns, setBattleLockedAns] = useState<number | null>(null);
  const battleChannelRef = useRef<any>(null);

  useEffect(() => {
    if (battleSubjId !== 'all' && !subjects.some((s) => s.id === battleSubjId)) {
      setBattleSubjId('all');
    }
  }, [selectedClass, selectedGroup, subjects, battleSubjId]);

  const prepareBattleQuestions = (subjId: string, count: number, seedKey?: string): MCQ[] => {
    const grpLower = selectedGroup.toLowerCase();
    const groupEliteFallback = grpLower.includes('bus')
      ? [...ELITE_GROUP_BATTLE_BANK.business, ...ELITE_GROUP_BATTLE_BANK.common]
      : grpLower.includes('hum')
      ? [...ELITE_GROUP_BATTLE_BANK.humanities, ...ELITE_GROUP_BATTLE_BANK.common]
      : [...ELITE_GROUP_BATTLE_BANK.science, ...ELITE_GROUP_BATTLE_BANK.common];

    const seenTexts = new Set<string>();
    const pickUnique = (list: MCQ[]): MCQ[] => {
      const out: MCQ[] = [];
      for (const item of list) {
        const key = (item.q?.bn || item.q?.en || '').trim();
        if (!key || seenTexts.has(key)) continue;
        seenTexts.add(key);
        out.push(item);
      }
      return out;
    };

    if (subjId === 'all') {
      const perSubjectBuckets: MCQ[][] = [];
      for (const s of subjects) {
        const rawSubjMcqs = s.chapters.flatMap((c) => c.mcqs || []);
        if (rawSubjMcqs.length === 0) continue;
        const ranked = [...rawSubjMcqs]
          .filter((q) => scoreMcqForBattle(q) > 0)
          .sort((a, b) => scoreMcqForBattle(b) - scoreMcqForBattle(a));
        if (ranked.length > 0) {
          perSubjectBuckets.push(seedKey ? seededShuffle(ranked.slice(0, 25), `${seedKey}-${s.id}`) : ranked.slice(0, 25));
        }
      }

      const curatedPool: MCQ[] = [];
      let round = 0;
      while (curatedPool.length < count * 3 && round < 20) {
        let addedAny = false;
        for (const bucket of perSubjectBuckets) {
          if (round < bucket.length) {
            curatedPool.push(bucket[round]);
            addedAny = true;
          }
        }
        if (!addedAny) break;
        round++;
      }

      const combined = pickUnique([...curatedPool, ...groupEliteFallback]);
      const finalPool = seedKey
        ? seededShuffle(combined, seedKey)
        : [...combined.slice(0, Math.min(combined.length, count * 2))].sort(() => Math.random() - 0.5);
      return finalPool.slice(0, count);
    }

    const targetSubj = subjects.find((s) => s.id === subjId) || subjects[0];
    if (!targetSubj) return groupEliteFallback.slice(0, count);

    const chapterBuckets: MCQ[][] = [];
    for (const ch of targetSubj.chapters) {
      const chMcqs = (ch.mcqs || []).filter((q) => scoreMcqForBattle(q) > 0);
      if (chMcqs.length > 0) {
        const sortedCh = [...chMcqs].sort((a, b) => scoreMcqForBattle(b) - scoreMcqForBattle(a));
        chapterBuckets.push(seedKey ? seededShuffle(sortedCh.slice(0, 20), `${seedKey}-${ch.id}`) : sortedCh.slice(0, 20));
      }
    }

    const subjCurated: MCQ[] = [];
    let r = 0;
    while (subjCurated.length < count * 3 && r < 25) {
      let added = false;
      for (const b of chapterBuckets) {
        if (r < b.length) {
          subjCurated.push(b[r]);
          added = true;
        }
      }
      if (!added) break;
      r++;
    }

    const uniqueSubjPool = pickUnique([...subjCurated, ...groupEliteFallback]);
    const finalSubjSelection = seedKey
      ? seededShuffle(uniqueSubjPool, seedKey)
      : [...uniqueSubjPool.slice(0, Math.min(uniqueSubjPool.length, count * 2))].sort(() => Math.random() - 0.5);
    return finalSubjSelection.slice(0, count);
  };

  const activeBattlePoolStats = useMemo(() => {
    if (battleSubjId === 'all') {
      const totalRaw = subjects.reduce((acc, s) => acc + s.chapters.reduce((cAcc, c) => cAcc + (c.mcqs?.length || 0), 0), 0);
      return {
        labelBn: `সকল বিষয় (${selectedGroup}) — ${subjects.length}টি বিষয়ের সেরা বোর্ড MCQ`,
        labelEn: `All Subjects (${selectedGroup}) — Best Board MCQs across ${subjects.length} subjects`,
        totalAvailable: Math.max(totalRaw, 50),
      };
    }
    const s = subjects.find((item) => item.id === battleSubjId);
    const rawCount = s ? s.chapters.reduce((acc, c) => acc + (c.mcqs?.length || 0), 0) : 0;
    return {
      labelBn: s ? `${s.icon} ${s.name.bn} (${s.chapters.length}টি অধ্যায়ের সেরা বোর্ড MCQ)` : 'নির্বাচিত বিষয়',
      labelEn: s ? `${s.icon} ${s.name.en} (Best Board MCQs from ${s.chapters.length} chapters)` : 'Selected Subject',
      totalAvailable: Math.max(rawCount, 25),
    };
  }, [battleSubjId, subjects, selectedGroup]);

  useEffect(() => {
    return () => {
      if (battleChannelRef.current && supabase) {
        supabase.removeChannel(battleChannelRef.current);
      }
    };
  }, []);

  const startOnlineSearch = () => {
    const qList = prepareBattleQuestions(battleSubjId, battleQuestionCount);
    setBattleQuestions(qList);
    setBattleStage('searching');

    const rivalPool = [
      { name: 'তানভীর আহমেদ (NDC)', rank: 'গোল্ড III' },
      { name: 'সাদিয়া ইসলাম (Viqarunnisa)', rank: 'প্লাটিনাম I' },
      { name: 'মাহমুদুল হাসান (DRMC)', rank: 'সিলভার II' },
      { name: 'ফারহানা আক্তার (Holy Cross)', rank: 'গোল্ড I' },
      { name: 'নাফিস ইকবাল (Rajshahi College)', rank: 'প্লাটিনাম II' },
    ];
    const picked = rivalPool[Math.floor(Math.random() * rivalPool.length)];

    setTimeout(() => {
      setOpponentName(picked.name);
      setOpponentRankTitle(picked.rank);
      setMyScore(0);
      setOppScore(0);
      setBattleQIdx(0);
      setBattleLockedAns(null);
      setBattleTimeLeft(15);
      setBattleStage('playing');
    }, 1400);
  };

  const createFriendBattleRoom = () => {
    const code = `EV-${Math.floor(1000 + Math.random() * 9000)}`;
    setBattleRoomCode(code);
    const qList = prepareBattleQuestions(battleSubjId, battleQuestionCount, code);
    setBattleQuestions(qList);
    setBattleStage('waiting_room');

    if (isSupabaseConfigured && supabase) {
      if (battleChannelRef.current) supabase.removeChannel(battleChannelRef.current);
      const ch = supabase.channel(`ev_battle_${code}`);
      ch.on('broadcast', { event: 'player_join' }, (payload) => {
        setOpponentName(payload.payload?.name || 'বন্ধু (Friend)');
        setOpponentRankTitle(payload.payload?.rank || 'ব্রোঞ্জ I');
        setMyScore(0);
        setOppScore(0);
        setBattleQIdx(0);
        setBattleLockedAns(null);
        setBattleTimeLeft(15);
        setBattleStage('playing');
      })
        .on('broadcast', { event: 'score_update' }, (payload) => {
          if (typeof payload.payload?.score === 'number') setOppScore(payload.payload.score);
        })
        .subscribe();
      battleChannelRef.current = ch;
    }
  };

  const joinFriendBattleRoom = () => {
    const clean = joinRoomInput.trim().toUpperCase();
    if (!clean) return;
    setBattleRoomCode(clean);
    const qList = prepareBattleQuestions(battleSubjId, battleQuestionCount, clean);
    setBattleQuestions(qList);
    setOpponentName(`রুম হোস্ট (${clean})`);
    setOpponentRankTitle('গোল্ড I');

    if (isSupabaseConfigured && supabase) {
      if (battleChannelRef.current) supabase.removeChannel(battleChannelRef.current);
      const ch = supabase.channel(`ev_battle_${clean}`);
      ch.on('broadcast', { event: 'score_update' }, (payload) => {
        if (typeof payload.payload?.score === 'number') setOppScore(payload.payload.score);
      }).subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          ch.send({
            type: 'broadcast',
            event: 'player_join',
            payload: { name: userName, rank: isBn ? myRank.fullTitleBn : myRank.fullTitleEn },
          });
        }
      });
      battleChannelRef.current = ch;
    }

    setMyScore(0);
    setOppScore(0);
    setBattleQIdx(0);
    setBattleLockedAns(null);
    setBattleTimeLeft(15);
    setBattleStage('playing');
  };

  useEffect(() => {
    if (battleStage !== 'playing') return;
    const timer = window.setInterval(() => {
      setBattleTimeLeft((prev) => {
        if (prev <= 1) {
          handleBattleNextQuestion(null);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [battleStage, battleQIdx]);

  const handleBattleNextQuestion = (chosenIdx: number | null) => {
    const currentQ = battleQuestions[battleQIdx];
    if (!currentQ) return;

    let nextMyScore = myScore;
    if (chosenIdx !== null && chosenIdx === currentQ.ans) {
      nextMyScore = myScore + 10 + Math.max(0, battleTimeLeft);
      setMyScore(nextMyScore);
    }

    if (battleChannelRef.current) {
      battleChannelRef.current.send({ type: 'broadcast', event: 'score_update', payload: { score: nextMyScore } });
    } else if (Math.random() > 0.34) {
      setOppScore((s) => s + 10 + Math.floor(Math.random() * 9));
    }

    if (battleQIdx + 1 >= battleQuestions.length) {
      setBattleStage('finished');
      addXp(nextMyScore >= oppScore ? 60 : 25);
    } else {
      setBattleQIdx((i) => i + 1);
      setBattleLockedAns(null);
      setBattleTimeLeft(15);
    }
  };

  const handleSelectBattleOption = (idx: number) => {
    if (battleLockedAns !== null) return;
    setBattleLockedAns(idx);
    setTimeout(() => handleBattleNextQuestion(idx), 550);
  };

  /* 4. FLASHCARDS, PLANNER, COMMUNITY & ADMIN STATES */
  const [fcIndex, setFcIndex] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [newFcFront, setNewFcFront] = useState('');
  const [newFcBack, setNewFcBack] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState(subjects[0]?.name.bn || 'পদার্থবিজ্ঞান');
  const [taskMinutes, setTaskMinutes] = useState(30);

  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postSubj, setPostSubj] = useState(subjects[0]?.name.bn || 'পদার্থবিজ্ঞান');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'bulk' | 'single' | 'reports' | 'manage' | 'users'>('bulk');
  const [admClass, setAdmClass] = useState<string>(selectedClass || 'HSC');
  const [admGroup, setAdmGroup] = useState<string>(selectedGroup || 'Science');
  const admSubjects = getSubjectsForSelection(admClass, admGroup);
  const [admSubjectId, setAdmSubjectId] = useState<string>(admSubjects[0]?.id || 'hsc-phy1');
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
      setCloudUsers(list);
    } finally {
      setLoadingUsers(false);
    }
  };

  /* VIEW 1: FORMULAS (Math & Quantitative Only) */
  if (activeTab === 'formulas') {
    const filteredSubjects =
      activeFormulaSubjId === 'all' ? mathSubjects : mathSubjects.filter((s) => s.id === activeFormulaSubjId);
    const activeSingleSubject =
      activeFormulaSubjId !== 'all' ? mathSubjects.find((s) => s.id === activeFormulaSubjId) : null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="ev-card">
          <div className="ev-section-header" style={{ marginBottom: 12 }}>
            <div>
              <h2 className="ev-section-title">
                📐 {isBn ? 'গাণিতিক ও হিসাবভিত্তিক সূত্রাবলি (Math & Formula Vault)' : 'Math & Quantitative Formula Vault'}
              </h2>
              <p className="ev-section-subtitle">
                {isBn
                  ? `${selectedClass} • ${selectedGroup} — শুধুমাত্র গাণিতিক সমীকরণ ও হিসাবযুক্ত বিষয়সমূহের অধ্যায়ভিত্তিক সূত্র`
                  : `${selectedClass} • ${selectedGroup} — Formulas strictly for mathematical & quantitative chapters`}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            <select className="ev-select" value={activeFormulaSubjId} onChange={(e) => setFormulaFilter(e.target.value, 'all')}>
              <option value="all">📚 {isBn ? 'সকল গাণিতিক বিষয়' : 'All Math Subjects'}</option>
              {mathSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {trText(s.name, language)}
                </option>
              ))}
            </select>

            <select
              className="ev-select"
              value={activeFormulaChapId}
              onChange={(e) => setFormulaFilter(activeFormulaSubjId, e.target.value)}
              disabled={!activeSingleSubject}
            >
              <option value="all">📑 {isBn ? 'সকল গাণিতিক অধ্যায়' : 'All Quantitative Chapters'}</option>
              {activeSingleSubject?.chapters
                .filter((ch) => (ch.formulas?.length || 0) > 0)
                .map((ch, idx) => (
                  <option key={ch.id} value={ch.id}>
                    {idx + 1}. {trText(ch.name, language)}
                  </option>
                ))}
            </select>

            <input
              type="text"
              className="ev-input"
              placeholder={isBn ? '🔍 সূত্র, প্রতীক বা অধ্যায় খুঁজুন...' : '🔍 Search formula or symbol...'}
              value={formulaSearch}
              onChange={(e) => setFormulaSearch(e.target.value)}
            />
          </div>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="ev-card" style={{ textAlign: 'center', padding: 28 }}>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {isBn ? 'এই বিভাগে কোনো গাণিতিক সূত্রযুক্ত বিষয় নেই।' : 'No mathematical formula subjects in this group.'}
            </p>
          </div>
        ) : (
          filteredSubjects.map((subj) => {
            const chaptersToShow = (
              activeFormulaChapId === 'all' ? subj.chapters : subj.chapters.filter((c) => c.id === activeFormulaChapId)
            ).filter((c) => (c.formulas?.length || 0) > 0);

            if (chaptersToShow.length === 0) return null;

            return (
              <div key={subj.id} className="ev-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: 10,
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{subj.icon}</span>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 800 }}>{trText(subj.name, language)}</h3>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {chaptersToShow.length} {isBn ? 'টি গাণিতিক অধ্যায়' : 'Math Chapters'}
                      </span>
                    </div>
                  </div>
                </div>

                {chaptersToShow.map((chap) => {
                  const formulas: ChapterFormulaItem[] = (chap.formulas || []).filter((f) => {
                    if (!formulaSearch.trim()) return true;
                    const q = formulaSearch.toLowerCase();
                    return (
                      f.title.bn.toLowerCase().includes(q) ||
                      f.title.en.toLowerCase().includes(q) ||
                      f.equation.toLowerCase().includes(q) ||
                      f.note.bn.toLowerCase().includes(q) ||
                      chap.name.bn.toLowerCase().includes(q)
                    );
                  });

                  if (formulas.length === 0) return null;

                  return (
                    <div
                      key={chap.id}
                      style={{
                        background: 'var(--bg-surface-muted)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 14,
                        padding: 14,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 14.5,
                          color: 'var(--brand-primary)',
                          marginBottom: 10,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 6,
                        }}
                      >
                        <span>📘 {trText(chap.name, language)}</span>
                        <span className="ev-badge-pill ev-badge-indigo">{formulas.length}টি সূত্র</span>
                      </div>

                      <div className="ev-grid-2">
                        {formulas.map((f) => (
                          <div
                            key={f.id}
                            style={{
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-default)',
                              borderRadius: 12,
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 6,
                            }}
                          >
                            <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-primary)' }}>
                              {trText(f.title, language)}
                            </div>
                            <div
                              className="font-mono"
                              style={{
                                padding: '8px 10px',
                                borderRadius: 8,
                                background: 'var(--brand-primary-soft)',
                                color: 'var(--brand-primary)',
                                fontWeight: 800,
                                fontSize: 13.5,
                                borderLeft: '3px solid var(--brand-primary)',
                                overflowX: 'auto',
                              }}
                            >
                              {f.equation}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                              💡 {trText(f.note, language)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    );
  }

  /* VIEW 2: 1v1 LIVE QUIZ BATTLE (⚔️ activeTab === 'battle') */
  if (activeTab === 'battle') {
    const currentQ = battleQuestions[battleQIdx];
    const currentQExplanation = currentQ ? getComplexMathOrRuleExplanation(currentQ, language) : '';
    const availableGroupsForBattle = getAvailableGroups(selectedClass);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
        <div className="ev-card" style={{ overflow: 'hidden' }}>
          <div className="ev-section-header" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h2 className="ev-section-title">⚔️ {isBn ? 'কুইজ ব্যাটল (1v1 Live Arena)' : '1v1 Live Quiz Battle'}</h2>
              <p className="ev-section-subtitle">
                {isBn
                  ? `${selectedClass} (${selectedGroup}) — সেরা বোর্ড ও গাণিতিক MCQ দিয়ে লাইভ প্রতিযোগিতা`
                  : `${selectedClass} (${selectedGroup}) — Compete live with curated top Board MCQs`}
              </p>
            </div>
            <span className="ev-badge-pill ev-badge-indigo">
              🛡️ {isBn ? myRank.fullTitleBn : myRank.fullTitleEn}
            </span>
          </div>

          {battleStage === 'lobby' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                <button
                  type="button"
                  className={`ev-btn ${battleModeTab === 'online' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                  style={{ width: '100%', whiteSpace: 'normal', padding: '10px 12px', fontSize: 13.5 }}
                  onClick={() => setBattleModeTab('online')}
                >
                  🌐 {isBn ? 'অনলাইন প্লেয়ার (Online)' : 'Search Online'}
                </button>
                <button
                  type="button"
                  className={`ev-btn ${battleModeTab === 'friend' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                  style={{ width: '100%', whiteSpace: 'normal', padding: '10px 12px', fontSize: 13.5 }}
                  onClick={() => setBattleModeTab('friend')}
                >
                  👥 {isBn ? 'বন্ধুর সাথে 1v1 (Friend)' : 'Play with Friend'}
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: 10,
                  background: 'var(--bg-surface-muted)',
                  padding: 12,
                  borderRadius: 14,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 4, color: 'var(--text-secondary)' }}>
                    🎓 {isBn ? 'শ্রেণি ও বিভাগ (Group)' : 'Class & Group'}
                  </label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select
                      className="ev-select"
                      style={{ width: '42%', padding: '0 8px', fontSize: 13, fontWeight: 700 }}
                      value={selectedClass}
                      onChange={(e) => {
                        const nextCls = e.target.value;
                        const firstGrp = getAvailableGroups(nextCls)[0] || 'Science';
                        setClassAndGroup(nextCls, firstGrp);
                        setBattleSubjId('all');
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
                      style={{ flex: 1, padding: '0 8px', fontSize: 13, fontWeight: 700 }}
                      value={selectedGroup}
                      onChange={(e) => {
                        setClassAndGroup(selectedClass, e.target.value);
                        setBattleSubjId('all');
                      }}
                    >
                      {availableGroupsForBattle.map((grp) => (
                        <option key={grp} value={grp}>
                          {grp}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 4, color: 'var(--text-secondary)' }}>
                    📖 {isBn ? 'ব্যাটলের বিষয় (সকল বিষয় বা যেকোনো ১টি)' : 'Battle Subject (All or 1 Subject)'}
                  </label>
                  <select
                    className="ev-select"
                    style={{ width: '100%', fontSize: 13, fontWeight: 700 }}
                    value={battleSubjId}
                    onChange={(e) => setBattleSubjId(e.target.value)}
                  >
                    <option value="all">
                      📚 {isBn ? `সকল বিষয় — ${selectedGroup} সেরা MCQ মিশ্রণ` : `All Subjects (${selectedGroup} Best Mix)`}
                    </option>
                    {subjects.map((s) => {
                      const cnt = s.chapters.reduce((sum, c) => sum + (c.mcqs?.length || 0), 0);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.icon} {trText(s.name, language)} ({cnt > 0 ? `${cnt} MCQs` : 'Board Curated'})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 4, color: 'var(--text-secondary)' }}>
                    🎯 {isBn ? 'প্রশ্ন সংখ্যা (Questions)' : 'Question Count'}
                  </label>
                  <select
                    className="ev-select"
                    style={{ width: '100%', fontSize: 13, fontWeight: 700 }}
                    value={battleQuestionCount}
                    onChange={(e) => setBattleQuestionCount(Number(e.target.value))}
                  >
                    <option value={5}>⚡ 5টি সেরা MCQ (Rapid Battle)</option>
                    <option value={10}>🔥 10টি সেরা MCQ (Standard Battle)</option>
                    <option value={15}>🏆 15টি সেরা MCQ (Championship)</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'var(--brand-primary-soft)',
                  border: '1px solid var(--brand-primary-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  fontSize: 12.5,
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  ✨ <strong>{isBn ? 'স্মার্ট প্রশ্ন সিলেকশন:' : 'Smart Curated Pool:'}</strong>{' '}
                  {isBn ? activeBattlePoolStats.labelBn : activeBattlePoolStats.labelEn}
                </div>
                <span className="ev-badge-pill ev-badge-indigo" style={{ fontSize: 11.5 }}>
                  🎯 {activeBattlePoolStats.totalAvailable}+ Top Board MCQs
                </span>
              </div>

              {battleModeTab === 'online' ? (
                <div
                  style={{
                    padding: '20px 16px',
                    borderRadius: 16,
                    background: 'var(--bg-surface-muted)',
                    border: '1px solid var(--border-default)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <h3 style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.35 }}>
                    🌐 {isBn ? 'তোমার র‍্যাঙ্ক টিয়ার অনুযায়ী অনলাইন প্রতিদ্বন্দ্বী খুঁজুন' : 'Find an Online Opponent in Your Rank Tier'}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 460, lineHeight: 1.5 }}>
                    {isBn
                      ? `নির্বাচিত ${battleSubjId === 'all' ? `${selectedGroup} বিভাগের সকল বিষয়ের` : 'বিষয়ের'} সবচেয়ে গুরুত্বপূর্ণ বোর্ড ও গাণিতিক MCQ দিয়ে কুইজ সাজানো হবে। প্রতিটি প্রশ্নের জন্য ১৫ সেকেন্ড সময় পাবে!`
                      : 'Each question has a 15-second timer. Answer fast with high accuracy to earn Speed Bonus points and +60 XP!'}
                  </p>
                  <button
                    type="button"
                    className="ev-btn ev-btn-primary"
                    style={{
                      width: '100%',
                      maxWidth: 340,
                      whiteSpace: 'normal',
                      lineHeight: 1.3,
                      padding: '12px 18px',
                      fontSize: 14.5,
                      marginTop: 4,
                    }}
                    onClick={startOnlineSearch}
                  >
                    ⚡ {isBn ? 'অনলাইন ম্যাচ শুরু করুন' : 'Find Online Match'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      background: 'var(--bg-surface-muted)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                        ➕ {isBn ? 'বন্ধুর জন্য ব্যাটল রুম তৈরি করো' : 'Create a Battle Room'}
                      </div>
                      <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        {isBn
                          ? 'একটি রুম কোড তৈরি করে বন্ধুকে শেয়ার করো। দুজনেই একই সেরা বোর্ড প্রশ্নে লাইভ ব্যাটল খেলবে!'
                          : 'Generate a room code and share it with your friend for a synchronized 1v1 match.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="ev-btn ev-btn-primary"
                      style={{ width: '100%', whiteSpace: 'normal', padding: '10px 14px' }}
                      onClick={createFriendBattleRoom}
                    >
                      🔑 {isBn ? 'রুম কোড তৈরি করো' : 'Create Room Code'}
                    </button>
                  </div>

                  <div
                    style={{
                      padding: 16,
                      borderRadius: 14,
                      background: 'var(--bg-surface-muted)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>
                        🔗 {isBn ? 'বন্ধুর রুম কোডে জয়েন করো' : 'Join Friend Room Code'}
                      </div>
                      <input
                        type="text"
                        className="ev-input font-mono"
                        placeholder="EV-4829"
                        value={joinRoomInput}
                        onChange={(e) => setJoinRoomInput(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="ev-btn ev-btn-primary"
                      style={{ width: '100%', whiteSpace: 'normal', padding: '10px 14px' }}
                      onClick={joinFriendBattleRoom}
                    >
                      🚀 {isBn ? 'রুমে জয়েন ও ব্যাটল শুরু' : 'Join & Start Battle'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {battleStage === 'searching' && (
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>🔎</div>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                {isBn ? 'অনলাইন প্রতিদ্বন্দ্বী খোঁজা হচ্ছে ও সেরা প্রশ্ন সাজানো হচ্ছে...' : 'Matching Opponent & Curating Best MCQs...'}
              </h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                {isBn ? activeBattlePoolStats.labelBn : activeBattlePoolStats.labelEn}
              </p>
            </div>
          )}

          {battleStage === 'waiting_room' && (
            <div style={{ textAlign: 'center', padding: '26px 16px', background: 'var(--bg-surface-muted)', borderRadius: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                {isBn ? 'তোমার ব্যাটল রুম কোড (বন্ধুকে পাঠাও):' : 'Your Battle Room Code (Share with friend):'}
              </div>
              <div
                className="font-mono"
                style={{ fontSize: 28, fontWeight: 900, color: 'var(--brand-primary)', margin: '10px 0', letterSpacing: '0.08em' }}
              >
                {battleRoomCode}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                {isBn
                  ? 'বন্ধু এই কোড দিয়ে জয়েন করলেই অটোমেটিক কুইজ শুরু হবে। অথবা এখনই প্র্যাকটিস সিমুলেশন শুরু করতে পারো:'
                  : 'Battle starts automatically when your friend joins, or start now:'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="ev-btn ev-btn-primary"
                  onClick={() => {
                    setOpponentName('বন্ধু (Live Opponent)');
                    setMyScore(0);
                    setOppScore(0);
                    setBattleQIdx(0);
                    setBattleStage('playing');
                  }}
                >
                  ⚔️ {isBn ? 'এখনই ব্যাটল শুরু করো' : 'Start Battle Now'}
                </button>
                <button type="button" className="ev-btn ev-btn-secondary" onClick={() => setBattleStage('lobby')}>
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </div>
          )}

          {battleStage === 'playing' && currentQ && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 14,
                  background: 'var(--bg-surface-muted)',
                  border: '1px solid var(--border-default)',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                    {userName} ({isBn ? 'তুমি' : 'You'})
                  </div>
                  <div className="font-mono" style={{ fontSize: 20, fontWeight: 900, color: 'var(--brand-primary)' }}>
                    {myScore} pts
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <span className="ev-badge-pill ev-badge-warning" style={{ fontSize: 13 }}>
                    ⏱️ {battleTimeLeft}s • Q {battleQIdx + 1}/{battleQuestions.length}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                    {opponentName} ({opponentRankTitle})
                  </div>
                  <div className="font-mono" style={{ fontSize: 20, fontWeight: 900, color: 'var(--status-danger)' }}>
                    {oppScore} pts
                  </div>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: 14, border: '1px solid var(--border-default)' }}>
                {currentQ.board && !currentQ.board.includes('NCTB ও বোর্ড প্রশ্ন') && (
                  <div style={{ marginBottom: 8 }}>
                    <span className="ev-badge-pill ev-badge-warning" style={{ fontSize: 11.5 }}>
                      🏅 {currentQ.board}
                    </span>
                  </div>
                )}

                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, lineHeight: 1.5 }}>
                  {trText(currentQ.q, language)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(currentQ.options.bn?.length ? currentQ.options.bn : currentQ.options.en).map((opt, idx) => {
                    const isPicked = battleLockedAns === idx;
                    const isRight = battleLockedAns !== null && idx === currentQ.ans;
                    const isWrong = isPicked && idx !== currentQ.ans;

                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`ev-option-btn ${isRight ? 'is-correct' : ''} ${isWrong ? 'is-wrong' : ''} ${isPicked ? 'is-selected' : ''}`}
                        onClick={() => handleSelectBattleOption(idx)}
                      >
                        <span className="ev-option-index">{['ক', 'খ', 'গ', 'ঘ'][idx]}</span>
                        <span className="ev-option-text">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {battleLockedAns !== null && currentQExplanation && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'var(--bg-surface-muted)',
                      borderLeft: '3px solid var(--brand-primary)',
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>💡 {isBn ? 'গাণিতিক ও নিয়মভিত্তিক ব্যাখ্যা:' : 'Explanation:'}</strong> {currentQExplanation}
                  </div>
                )}
              </div>
            </div>
          )}

          {battleStage === 'finished' && (
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <div style={{ fontSize: 44, marginBottom: 8 }}>{myScore >= oppScore ? '🏆' : '⚔️'}</div>
              <h3 style={{ fontSize: 21, fontWeight: 800 }}>
                {myScore > oppScore
                  ? isBn
                    ? 'অভিনন্দন! তুমি ব্যাটলে জয়ী হয়েছ!'
                    : 'Victory! You won the Quiz Battle!'
                  : myScore === oppScore
                  ? isBn
                    ? 'হাড্ডাহাড্ডি লড়াই! ম্যাচ ড্র হয়েছে!'
                    : 'Match Tied!'
                  : isBn
                  ? 'ভালো খেলেছ! পরের ম্যাচেই জয় আসবে!'
                  : 'Good effort! Try again!'}
              </h3>
              <p className="font-mono" style={{ fontSize: 16, fontWeight: 800, margin: '10px 0 18px' }}>
                {isBn ? 'তোমার স্কোর' : 'Your Score'}: {myScore} pts &nbsp;|&nbsp; {opponentName}: {oppScore} pts
              </p>
              <button type="button" className="ev-btn ev-btn-primary" style={{ width: '100%', maxWidth: 280 }} onClick={() => setBattleStage('lobby')}>
                🔄 {isBn ? 'আবার ব্যাটল খেলো' : 'Play Another Battle'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* VIEW 3: LEADERBOARD (🏆 activeTab === 'leaderboard') */
  if (activeTab === 'leaderboard') {
    const timeMult = lbTimeframe === 'weekly' ? 0.35 : lbTimeframe === 'monthly' ? 0.72 : 1;
    const subjSeed = lbSubjectFilter === 'all' ? 1 : Math.max(0.45, ((lbSubjectFilter.charCodeAt(4) || 68) % 10) / 10);
    const myComputedXp = Math.max(0, Math.round(xp * timeMult * subjSeed));

    const cloudEntries = liveCloudLb
      .filter((u) => u.id !== userId && u.full_name !== userName)
      .map((u, idx) => {
        const rawUserXp = Number(u.xp || 0) > 0 ? Number(u.xp) : Math.max(15, 35 - idx * 8);
        const scaledXp = Math.max(5, Math.round(rawUserXp * timeMult * subjSeed));
        const rScore = Math.min(1000, Math.round(scaledXp / 10));
        const tierBn = rScore >= 850 ? 'এলিট' : rScore >= 650 ? 'প্লাটিনাম I' : rScore >= 400 ? 'গোল্ড I' : rScore >= 200 ? 'সিলভার I' : 'ব্রোঞ্জ I';
        const tierEn = rScore >= 850 ? 'Elite' : rScore >= 650 ? 'Platinum I' : rScore >= 400 ? 'Gold I' : rScore >= 200 ? 'Silver I' : 'Bronze I';

        return {
          id: u.id,
          name: u.full_name || u.username || 'Scholar',
          avatar: u.avatar_url || '',
          xp: scaledXp,
          rankScore: rScore,
          tierBn,
          tierEn,
          streak: Number(u.streak_days || 1),
          isMe: false,
        };
      });

    const friendEntries = friendList.map((f) => ({
      id: f.id,
      name: f.name,
      avatar: f.avatar,
      xp: Math.round(f.xp * timeMult * subjSeed),
      rankScore: f.rankScore,
      tierBn: f.rankTitleBn,
      tierEn: f.rankTitleEn,
      streak: f.streak,
      isMe: false,
    }));

    const meEntry = {
      id: userId || 'me',
      name: `${userName} (${isBn ? 'তুমি' : 'You'})`,
      shortName: userName,
      avatar: userAvatar,
      xp: myComputedXp,
      rankScore: myRank.rankScore,
      tierBn: myRank.fullTitleBn,
      tierEn: myRank.fullTitleEn,
      streak,
      isMe: true,
    };

    const fallbackPeers =
      cloudEntries.length > 0
        ? cloudEntries
        : [
            { id: 'peer-1', name: 'তানভীর আহমেদ', avatar: '', xp: Math.round(32 * timeMult), rankScore: 15, tierBn: 'ব্রোঞ্জ I', tierEn: 'Bronze I', streak: 2, isMe: false },
            { id: 'peer-2', name: 'সাদিয়া ইসলাম', avatar: '', xp: Math.round(24 * timeMult), rankScore: 12, tierBn: 'ব্রোঞ্জ I', tierEn: 'Bronze I', streak: 1, isMe: false },
          ];

    const combined = (lbMode === 'friends' ? [...friendEntries, meEntry] : [...fallbackPeers, meEntry]).sort(
      (a, b) => b.xp - a.xp || b.rankScore - a.rankScore
    );

    const myPosition = combined.findIndex((item) => item.isMe) + 1;
    const topThree = combined.slice(0, 3);

    const renderAvatarCircle = (entry: any, size = 38) => {
      const hasPhoto = entry.avatar && String(entry.avatar).startsWith('http');
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: 'var(--brand-primary)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {hasPhoto ? (
            <img src={entry.avatar} alt={entry.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{String(entry.shortName || entry.name || 'S').charAt(0).toUpperCase()}</span>
          )}
        </div>
      );
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 32 }}>
        <div className="ev-card ev-hero" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="font-mono" style={{ fontSize: 22, fontWeight: 900, color: 'var(--brand-primary)', minWidth: 38 }}>
                #{myPosition}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  {userName} • <span style={{ color: myRank.color }}>🛡️ {isBn ? myRank.fullTitleBn : myRank.fullTitleEn} ({myRank.rankScore} RP)</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {myComputedXp} XP • {trKey('accuracy', language)}: {myRank.accuracyPct}% • 🔥 {streak}d
                </div>
              </div>
            </div>

            <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={refreshLiveLeaderboard}>
              {loadingLb ? '...' : isBn ? '↻ রিফ্রেশ' : '↻ Refresh'}
            </button>
          </div>
        </div>

        <div className="ev-card" style={{ paddingBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`ev-btn ev-btn-sm ${lbMode === 'global' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                onClick={() => setLbMode('global')}
              >
                🌍 {trKey('global_board', language)}
              </button>
              <button
                type="button"
                className={`ev-btn ev-btn-sm ${lbMode === 'friends' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                onClick={() => setLbMode('friends')}
              >
                👥 {trKey('friends_board', language)}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                className="ev-select"
                style={{ width: 'auto', minHeight: 36, padding: '0 10px', fontSize: 13 }}
                value={lbTimeframe}
                onChange={(e) => setLbTimeframe(e.target.value as any)}
              >
                <option value="all">📅 {trKey('all_time', language)}</option>
                <option value="monthly">🗓️ {trKey('monthly', language)}</option>
                <option value="weekly">⚡ {trKey('weekly', language)}</option>
              </select>

              <select
                className="ev-select"
                style={{ width: 'auto', minHeight: 36, padding: '0 10px', fontSize: 13 }}
                value={lbSubjectFilter}
                onChange={(e) => setLbSubjectFilter(e.target.value)}
              >
                <option value="all">📚 {isBn ? 'সকল বিষয় (All)' : 'All Subjects'}</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {trText(s.name, language)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {topThree.length >= 1 && (
            <div className="ev-podium-stage" style={{ marginBottom: 18 }}>
              {[topThree[1], topThree[0], topThree[2]].map((p, idx) => {
                if (!p) return <div key={idx} style={{ width: 96 }} />;
                const place = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                const displayName = p.shortName || p.name;
                return (
                  <div key={p.id} className={`ev-podium-col is-${place}`}>
                    <div className="ev-podium-avatar-wrap">
                      {place === 1 && (
                        <svg className="ev-podium-crown" width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B">
                          <path d="M2 19h20v3H2v-3zM2 7l5 5 5-7 5 7 5-5v10H2V7z" />
                        </svg>
                      )}
                      {renderAvatarCircle(p, place === 1 ? 52 : 42)}
                    </div>
                    <div
                      className="ev-podium-name"
                      style={{
                        maxWidth: 115,
                        whiteSpace: 'normal',
                        lineHeight: 1.2,
                        fontSize: 12.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {displayName}
                    </div>
                    <div className="ev-podium-xp">{p.xp} XP</div>
                    <div className="ev-podium-pedestal">{place}</div>
                  </div>
                );
              })}
            </div>
          )}

          {lbMode === 'friends' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: 12, borderRadius: 12, background: 'var(--bg-surface-muted)', marginBottom: 14 }}>
              <input
                type="text"
                className="ev-input"
                style={{ flex: 1, minWidth: 140 }}
                placeholder={isBn ? 'বন্ধুর কোড (যেমন: EV-204)' : 'Friend Code (EV-204)'}
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value)}
              />
              <input
                type="text"
                className="ev-input"
                style={{ flex: 1, minWidth: 140 }}
                placeholder={isBn ? 'বন্ধুর নাম' : 'Friend Name'}
                value={friendNameInput}
                onChange={(e) => setFriendNameInput(e.target.value)}
              />
              <button
                type="button"
                className="ev-btn ev-btn-primary ev-btn-sm"
                onClick={() => {
                  if (!friendCodeInput.trim()) return;
                  addFriendByCode(friendCodeInput, friendNameInput);
                  setFriendCodeInput('');
                  setFriendNameInput('');
                }}
              >
                + {trKey('add_friend', language)}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {combined.map((entry, idx) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: entry.isMe ? 'var(--brand-primary-soft)' : 'var(--bg-surface-muted)',
                  border: entry.isMe ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                  <span className="font-mono" style={{ width: 26, fontWeight: 900, color: 'var(--text-muted)', flexShrink: 0 }}>
                    #{idx + 1}
                  </span>
                  {renderAvatarCircle(entry, 36)}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {isBn ? entry.tierBn : entry.tierEn} • 🔥 {entry.streak}d
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-mono" style={{ fontWeight: 800, fontSize: 14, color: 'var(--brand-primary)' }}>
                      {entry.xp} XP
                    </div>
                    <div className="font-mono" style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 700 }}>
                      {entry.rankScore} RP
                    </div>
                  </div>
                  {lbMode === 'friends' && !entry.isMe && (
                    <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => removeFriend(entry.id)}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* VIEW 4: SECRET ADMIN PANEL (🔐 activeTab === 'admin') */
  if (activeTab === 'admin') {
    if (!isAdminUnlocked) {
      return (
        <div className="ev-card" style={{ maxWidth: 440, margin: '32px auto', textAlign: 'center', padding: 28 }}>
          <div style={{ fontSize: 38, marginBottom: 8 }}>🔐</div>
          <h2 className="ev-section-title" style={{ justifyContent: 'center' }}>
            {isBn ? 'অ্যাডমিন সিকিউরিটি ভেরিফিকেশন' : 'Admin Security Verification'}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 16px' }}>
            {isBn ? 'শুধুমাত্র অনুমোদিত অ্যাডমিনের জন্য। গোপন পিন কোড প্রবেশ করান:' : 'Authorized administrators only. Enter master PIN:'}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const ok = unlockAdmin(adminPinInput);
              if (!ok) {
                setAdminPinError(isBn ? '❌ ভুল পিন কোড!' : '❌ Invalid PIN!');
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
              placeholder="••••••••"
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
            />
            {adminPinError && <div style={{ color: 'var(--status-danger)', fontSize: 13, fontWeight: 700 }}>{adminPinError}</div>}
            <button type="submit" className="ev-btn ev-btn-primary">
              🔓 {isBn ? 'আনলক করুন' : 'Unlock Admin Panel'}
            </button>
          </form>
        </div>
      );
    }

    const admGroupOptions = getAvailableGroups(admClass);
    const selectedAdmSubj = admSubjects.find((s) => s.id === admSubjectId) || admSubjects[0];

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
      a.download = 'syllabusData.ts';
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="ev-card">
          <div className="ev-section-header">
            <h2 className="ev-section-title">🔐 ExamVerse Master Admin Control Center</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={handleDownloadProjectCode}>
                📦 প্রজেক্ট কোড ডাউনলোড (syllabusData.ts)
              </button>
              <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={lockAdmin}>
                🔒 অ্যাডমিন লক ও হাইড করুন
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <button type="button" className={`ev-btn ev-btn-sm ${adminSubTab === 'bulk' ? 'ev-btn-primary' : 'ev-btn-secondary'}`} onClick={() => setAdminSubTab('bulk')}>
              📥 এক্সেল / CSV বাল্ক আপলোড
            </button>
            <button type="button" className={`ev-btn ev-btn-sm ${adminSubTab === 'single' ? 'ev-btn-primary' : 'ev-btn-secondary'}`} onClick={() => setAdminSubTab('single')}>
              ➕ একক প্রশ্ন যোগ
            </button>
            <button type="button" className={`ev-btn ev-btn-sm ${adminSubTab === 'reports' ? 'ev-btn-primary' : 'ev-btn-secondary'}`} onClick={() => setAdminSubTab('reports')}>
              🚨 ভুল প্রশ্নের রিপোর্ট ({questionReports.filter((r) => r.status === 'pending').length})
            </button>
            <button type="button" className={`ev-btn ev-btn-sm ${adminSubTab === 'manage' ? 'ev-btn-primary' : 'ev-btn-secondary'}`} onClick={() => setAdminSubTab('manage')}>
              🗂️ প্রশ্ন ও উত্তর সংশোধন
            </button>
            <button
              type="button"
              className={`ev-btn ev-btn-sm ${adminSubTab === 'users' ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
              onClick={() => {
                setAdminSubTab('users');
                fetchAdminCloudUsers();
              }}
            >
              👥 ইউজার ও সিকিউরিটি
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
                fontWeight: 800,
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
                <label style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 4 }}>শ্রেণি (Class)</label>
                <select
                  className="ev-select"
                  value={admClass}
                  onChange={(e) => {
                    const nextC = e.target.value;
                    const firstG = getAvailableGroups(nextC)[0] || 'Science';
                    const firstS = getSubjectsForSelection(nextC, firstG)[0]?.id || '';
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
                <label style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 4 }}>বিভাগ (Group)</label>
                <select
                  className="ev-select"
                  value={admGroup}
                  onChange={(e) => {
                    const nextG = e.target.value;
                    const firstS = getSubjectsForSelection(admClass, nextG)[0]?.id || '';
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
                <label style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 4 }}>বিষয় ও পত্র (Subject & Paper)</label>
                <select className="ev-select" value={admSubjectId} onChange={(e) => setAdmSubjectId(e.target.value)}>
                  {admSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name.bn}
                    </option>
                  ))}
                  <option value="new-custom-subject">➕ নতুন বিষয় তৈরি করুন</option>
                </select>
              </div>
            </div>
          )}

          {adminSubTab === 'bulk' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {admSubjectId === 'new-custom-subject' && (
                <div className="ev-grid-2">
                  <input type="text" className="ev-input" placeholder="নতুন বিষয়ের বাংলা নাম" value={admCustomSubjNameBn} onChange={(e) => setAdmCustomSubjNameBn(e.target.value)} />
                  <input type="text" className="ev-input" placeholder="ইংরেজি নাম" value={admCustomSubjNameEn} onChange={(e) => setAdmCustomSubjNameEn(e.target.value)} />
                </div>
              )}

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, display: 'block', marginBottom: 6 }}>
                  📂 CSV / TSV ফাইল সিলেক্ট করুন অথবা নিচের বক্সে সরাসরি Microsoft Excel থেকে সারিগুলো কপি (`Ctrl+C`) করে পেস্ট (`Ctrl+V`) করুন:
                </label>
                <input type="file" accept=".csv,.tsv,.txt" className="ev-input" onChange={handleFileUpload} style={{ marginBottom: 8 }} />
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
                    const finalId = admSubjectId === 'new-custom-subject' ? `custom-${Date.now()}` : selectedAdmSubj?.id || admSubjectId;
                    const finalBn = admSubjectId === 'new-custom-subject' ? admCustomSubjNameBn || 'নতুন বিষয়' : selectedAdmSubj?.name.bn || 'বিষয়';
                    const finalEn = admSubjectId === 'new-custom-subject' ? admCustomSubjNameEn || finalBn : selectedAdmSubj?.name.en || finalBn;

                    const res = importBulkMcqs({
                      targetClass: admClass,
                      targetGroup: admGroup,
                      subjectId: finalId,
                      subjectNameBn: finalBn,
                      subjectNameEn: finalEn,
                      rawText: admRawText,
                    });
                    setAdmRawText('');
                    setAdmStatusBanner(`✅ ${admClass} (${admGroup}) → ${finalBn}-এ ${res.addedQuestions}টি প্রশ্ন এবং ${res.addedChapters}টি অধ্যায় যুক্ত হয়েছে!`);
                  }}
                >
                  🚀 ডাটাবেস ও প্রজেক্টে আপলোড করুন
                </button>
                <button type="button" className="ev-btn ev-btn-secondary" onClick={handleDownloadProjectCode}>
                  💾 প্রজেক্ট ফাইল (syllabusData.ts) ডাউনলোড
                </button>
              </div>
            </div>
          )}

          {adminSubTab === 'single' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input type="text" className="ev-input" placeholder="অধ্যায়ের নাম" value={singleChap} onChange={(e) => setSingleChap(e.target.value)} />
              <input type="text" className="ev-input" placeholder="প্রশ্নটি লিখুন..." value={singleQ} onChange={(e) => setSingleQ(e.target.value)} />
              <div className="ev-grid-2">
                <input type="text" className="ev-input" placeholder="অপশন ক" value={singleOptA} onChange={(e) => setSingleOptA(e.target.value)} />
                <input type="text" className="ev-input" placeholder="অপশন খ" value={singleOptB} onChange={(e) => setSingleOptB(e.target.value)} />
                <input type="text" className="ev-input" placeholder="অপশন গ" value={singleOptC} onChange={(e) => setSingleOptC(e.target.value)} />
                <input type="text" className="ev-input" placeholder="অপশন ঘ" value={singleOptD} onChange={(e) => setSingleOptD(e.target.value)} />
              </div>
              <div className="ev-grid-3">
                <select className="ev-select" value={singleAns} onChange={(e) => setSingleAns(Number(e.target.value))}>
                  <option value={0}>সঠিক উত্তর: ক</option>
                  <option value={1}>সঠিক উত্তর: খ</option>
                  <option value={2}>সঠিক উত্তর: গ</option>
                  <option value={3}>সঠিক উত্তর: ঘ</option>
                </select>
                <input type="text" className="ev-input" placeholder="বোর্ড ট্যাগ" value={singleBoard} onChange={(e) => setSingleBoard(e.target.value)} />
                <input type="text" className="ev-input" placeholder="ব্যাখ্যা (ঐচ্ছিক)" value={singleExp} onChange={(e) => setSingleExp(e.target.value)} />
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
                  setAdmStatusBanner('✅ প্রশ্নটি সফলভাবে যুক্ত হয়েছে!');
                }}
              >
                ➕ প্রশ্ন যুক্ত করুন
              </button>
            </div>
          )}

          {adminSubTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {questionReports.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>বর্তমানে স্টুডেন্টদের কোনো অমীমাংসিত প্রশ্ন রিপোর্ট নেই।</p>
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
                        🚩 {rep.issueType} • {rep.subjectName} ({rep.chapterName})
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
                        রিপোর্টকারী: {rep.reportedBy} • {rep.createdAt} • {rep.status === 'resolved' ? '✅ সমাধানকৃত' : '⏳ অপেক্ষমাণ'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 4 }}>প্রশ্ন: {rep.questionText}</div>
                    <div style={{ fontSize: 13, color: 'var(--status-danger-text)', fontWeight: 700, marginBottom: 8 }}>
                      স্টুডেন্টের মন্তব্য: &ldquo;{rep.comment}&rdquo;
                    </div>

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
                          <span style={{ fontSize: 13, fontWeight: 700 }}>সঠিক উত্তর:</span>
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
                              ['HSC', 'SSC'].forEach((cls) => {
                                getAvailableGroups(cls).forEach((grp) => {
                                  editCustomMcqFull({
                                    targetClass: cls,
                                    targetGroup: grp,
                                    subjectId: rep.subjectId,
                                    chapterId: rep.chapterId,
                                    questionId: rep.questionId,
                                    questionBn: editRepQ,
                                    optionsBn: editRepOpts,
                                    ansIndex: editRepAns,
                                  });
                                });
                              });
                              resolveQuestionReport(rep.id);
                              setEditingReportId(null);
                              setAdmStatusBanner('✅ প্রশ্নটি সংশোধন করা হয়েছে এবং রিপোর্ট সমাধানকৃত মার্ক হয়েছে!');
                            }}
                          >
                            💾 সেভ ও সমাধান করুন
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
                          ✏️ প্রশ্ন ও উত্তর সংশোধন করুন
                        </button>
                        {rep.status !== 'resolved' && (
                          <button type="button" className="ev-btn ev-btn-soft ev-btn-sm" onClick={() => resolveQuestionReport(rep.id)}>
                            ✅ সমাধানকৃত মার্ক করুন
                          </button>
                        )}
                        <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => deleteQuestionReport(rep.id)}>
                          🗑️ মুছুন
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
                  {selectedAdmSubj.icon} {selectedAdmSubj.name.bn} — মোট অধ্যায়: {selectedAdmSubj.chapters.length}
                </div>
                <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => deleteCustomSubject(admClass, admGroup, selectedAdmSubj.id)}>
                  🗑️ কাস্টম পরিবর্তন রিসেট
                </button>
              </div>

              {selectedAdmSubj.chapters.map((ch) => (
                <div key={ch.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 8 }}>
                    {ch.name.bn} ({ch.mcqs.length} MCQs)
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
                        <div style={{ flex: 1, minWidth: 220, fontSize: 13.5, fontWeight: 600 }}>
                          {qIdx + 1}. {q.q.bn}
                        </div>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          {['ক', 'খ', 'গ', 'ঘ'].map((optLbl, oIdx) => (
                            <button
                              key={optLbl}
                              type="button"
                              className={`ev-btn ev-btn-sm ${q.ans === oIdx ? 'ev-btn-primary' : 'ev-btn-secondary'}`}
                              style={{ minWidth: 32, padding: '0 8px' }}
                              onClick={() => updateCustomMcqAnswer(admClass, admGroup, selectedAdmSubj.id, ch.id, q.id, oIdx)}
                            >
                              {optLbl}
                            </button>
                          ))}
                          <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => deleteCustomMcq(admClass, admGroup, selectedAdmSubj.id, ch.id, q.id)}>
                            🗑️
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
                  <div style={{ fontWeight: 800, fontSize: 15 }}>👥 রেজিস্টার্ড ইউজার তালিকা (Supabase Cloud Users)</div>
                  <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={fetchAdminCloudUsers}>
                    {loadingUsers ? '...' : '🔄 রিফ্রেশ'}
                  </button>
                </div>

                {cloudUsers.length === 0 ? (
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>বর্তমানে ক্লাউড টেবিলে কোনো ইউজার পাওয়া যায়নি অথবা লোড হচ্ছে।</p>
                ) : (
                  <div className="ev-table-wrap">
                    <table className="ev-table">
                      <thead>
                        <tr>
                          <th>নাম</th>
                          <th>ইউজারনেম</th>
                          <th>ট্র্যাক</th>
                          <th>XP / Level</th>
                          <th>স্ট্রিক</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cloudUsers.map((u) => (
                          <tr key={u.id}>
                            <td style={{ fontWeight: 700 }}>{u.full_name || 'Scholar'}</td>
                            <td>{u.username || '—'}</td>
                            <td>{u.target_track || 'HSC'}</td>
                            <td className="font-mono">{u.xp || 0} XP (Lv.{u.level || 1})</td>
                            <td>🔥 {u.streak_days || 0}d</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>🔑 অ্যাডমিন গোপন পিন পরিবর্তন</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input
                    type="password"
                    className="ev-input"
                    style={{ flex: 1, minWidth: 200 }}
                    placeholder="নতুন পিন লিখুন (কমপক্ষে ৪ অক্ষর)"
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
                        setAdmStatusBanner('✅ অ্যাডমিন পিন সফলভাবে পরিবর্তন করা হয়েছে!');
                      }
                    }}
                  >
                    আপডেট পিন
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* VIEW 5: RANK & BADGES (🛡️ activeTab === 'achievements') */
  if (activeTab === 'achievements') {
    const allTiers = [
      { id: 'bronze', nameBn: 'ব্রোঞ্জ র‍্যাঙ্ক (I – III)', nameEn: 'Bronze Rank (I – III)', range: '0 – 199 RP', color: '#B45309', div: 'I' },
      { id: 'silver', nameBn: 'সিলভার র‍্যাঙ্ক (I – III)', nameEn: 'Silver Rank (I – III)', range: '200 – 399 RP', color: '#475569', div: 'II' },
      { id: 'gold', nameBn: 'গোল্ড র‍্যাঙ্ক (I – III)', nameEn: 'Gold Rank (I – III)', range: '400 – 649 RP', color: '#D97706', div: 'III' },
      { id: 'platinum', nameBn: 'প্লাটিনাম র‍্যাঙ্ক (I – III)', nameEn: 'Platinum Rank (I – III)', range: '650 – 849 RP', color: '#0284C7', div: 'IV' },
      { id: 'elite', nameBn: 'এলিট গ্র্যান্ডমাস্টার', nameEn: 'Elite Grandmaster', range: '850 – 1000 RP', color: '#7C3AED', div: 'MAX' },
    ];

    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">🛡️ {isBn ? 'র‍্যাঙ্ক প্রগ্রেশন (Bronze → Elite)' : 'Rank Progression (Bronze → Elite)'}</h3>
          <span className="ev-badge-pill ev-badge-indigo">
            {isBn ? myRank.fullTitleBn : myRank.fullTitleEn} • {myRank.rankScore} / 1000 RP
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allTiers.map((t) => {
            const isCurrent = t.id === myRank.tierId;
            return (
              <div
                key={t.id}
                className="ev-badge-card"
                style={{ border: isCurrent ? `2px solid ${t.color}` : '1px solid var(--border-subtle)', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <MetallicBadgeSvg color={t.color} label={t.div} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: t.color }}>
                      {isBn ? t.nameBn : t.nameEn} {isCurrent ? (isBn ? '• (বর্তমান র‍্যাঙ্ক)' : '• (Current Rank)') : ''}
                    </div>
                    <div className="font-mono" style={{ fontSize: 12.5, color: 'var(--text-muted)', fontWeight: 700 }}>
                      {t.range}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* VIEW 6: ANALYTICS (📊 activeTab === 'Analytics') */
  if (activeTab === 'Analytics') {
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">📊 {trKey('nav_analytics', language)}</h3>
        </div>

        <div className="ev-grid-4" style={{ marginBottom: 18 }}>
          <div className="ev-card ev-stat">
            <div>
              <div className="ev-stat-lab">{isBn ? 'মোট পরীক্ষা' : 'Total Exams'}</div>
              <div className="ev-stat-val">{examHistory.length}</div>
            </div>
          </div>
          <div className="ev-card ev-stat">
            <div>
              <div className="ev-stat-lab">{trKey('accuracy', language)}</div>
              <div className="ev-stat-val">{myRank.accuracyPct}%</div>
            </div>
          </div>
          <div className="ev-card ev-stat">
            <div>
              <div className="ev-stat-lab">{trKey('mastery', language)}</div>
              <div className="ev-stat-val">{myRank.masteryPct}%</div>
            </div>
          </div>
          <div className="ev-card ev-stat">
            <div>
              <div className="ev-stat-lab">{trKey('rank_points', language)}</div>
              <div className="ev-stat-val">{myRank.rankScore} RP</div>
            </div>
          </div>
        </div>

        {examHistory.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isBn ? 'তুমি এখনো কোনো পরীক্ষায় অংশ নাওনি। যেকোনো বিষয়ে ক্লিক করে কুইজ শুরু করো!' : 'You have not taken any exams yet. Click any subject to start practicing!'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {examHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-surface-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14.5 }}>{item.subjectName}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    {item.chapterName} • {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-mono" style={{ textAlign: 'right', fontWeight: 800 }}>
                  <div style={{ color: 'var(--status-success)' }}>
                    {item.score}/{item.total} ({item.accuracy}%)
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--brand-primary)' }}>+{item.xpEarned} XP</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* VIEW 7: MISTAKE BANK (🎯 activeTab === 'mistakes') */
  if (activeTab === 'mistakes') {
    const activeMistakes = mistakes.filter((m) => !m.mastered);
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">
            🎯 {trKey('nav_mistakes', language)} ({activeMistakes.length})
          </h3>
        </div>
        {activeMistakes.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isBn ? 'ভুলের খাতায় বর্তমানে কোনো প্রশ্ন নেই। কুইজে কোনো প্রশ্ন ভুল হলে তা এখানে অটোমেটিক জমা হবে।' : 'No pending mistakes in your Mistake Bank.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeMistakes.map((m) => (
              <div key={m.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--status-danger)', marginBottom: 4 }}>
                  {m.subjectName} • {m.chapterName}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{trText(m.question, language)}</div>
                <div style={{ fontSize: 13.5, color: 'var(--status-success)', fontWeight: 700 }}>
                  ✅ {isBn ? 'সঠিক উত্তর:' : 'Correct Answer:'} {(m.options.bn?.length ? m.options.bn : m.options.en)[m.correctIndex]}
                </div>
                <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" style={{ marginTop: 8 }} onClick={() => markMistakeMastered(m.id)}>
                  ✔️ {isBn ? 'আয়ত্ত করেছি (Remove)' : 'Mastered (Remove)'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* VIEW 8: FLASHCARDS (🗂️ activeTab === 'flashcards') */
  if (activeTab === 'flashcards') {
    const card = flashcards[fcIndex % Math.max(1, flashcards.length)];
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">🗂️ {trKey('nav_flashcards', language)}</h3>
        </div>

        <div className="ev-grid-2" style={{ marginBottom: 16 }}>
          <input
            type="text"
            className="ev-input"
            placeholder={isBn ? 'ফ্ল্যাশকার্ডের প্রশ্ন / সূত্রের নাম...' : 'Flashcard Front (Question / Term)...'}
            value={newFcFront}
            onChange={(e) => setNewFcFront(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="ev-input"
              placeholder={isBn ? 'উত্তর / সমীকরণ...' : 'Flashcard Back (Answer / Formula)...'}
              value={newFcBack}
              onChange={(e) => setNewFcBack(e.target.value)}
            />
            <button
              type="button"
              className="ev-btn ev-btn-primary"
              onClick={() => {
                if (!newFcFront.trim() || !newFcBack.trim()) return;
                addFlashcard(newFcFront.trim(), newFcBack.trim());
                setNewFcFront('');
                setNewFcBack('');
              }}
            >
              + {isBn ? 'যোগ' : 'Add'}
            </button>
          </div>
        </div>

        {flashcards.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isBn ? 'তোমার নিজস্ব ফ্ল্যাশকার্ড তৈরি করতে ওপরে প্রশ্ন ও উত্তর লিখে "+ যোগ" বাটনে ক্লিক করো।' : 'Create your own flashcards above to review key formulas and concepts.'}
          </p>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div
              onClick={() => setFcFlipped(!fcFlipped)}
              style={{
                maxWidth: 500,
                margin: '0 auto',
                minHeight: 170,
                padding: 24,
                borderRadius: 16,
                background: 'var(--bg-surface-muted)',
                border: '1.5px solid var(--border-default)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: 8,
              }}
            >
              <span className="ev-badge-pill ev-badge-indigo">{fcFlipped ? (isBn ? 'উত্তর' : 'Answer') : isBn ? 'প্রশ্ন' : 'Question'}</span>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{trText(fcFlipped ? card.back : card.front, language)}</div>
              <small style={{ color: 'var(--text-muted)' }}>({isBn ? 'ট্যাপ করে উল্টাও' : 'Tap to flip'})</small>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                className="ev-btn ev-btn-secondary ev-btn-sm"
                onClick={() => {
                  setFcFlipped(false);
                  setFcIndex((i) => (i + 1) % flashcards.length);
                }}
              >
                {isBn ? 'পরবর্তী কার্ড →' : 'Next Card →'}
              </button>
              <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => deleteFlashcard(card.id)}>
                🗑️ {isBn ? 'মুছুন' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* VIEW 9: STUDY PLANNER (📅 activeTab === 'planner') */
  if (activeTab === 'planner') {
    return (
      <div className="ev-card">
        <div className="ev-section-header">
          <h3 className="ev-section-title">📅 {trKey('nav_planner', language)}</h3>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <input
            type="text"
            className="ev-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder={isBn ? 'আজকের পড়ার টার্গেট লেখো...' : 'Write your study goal...'}
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <select className="ev-select" style={{ width: 'auto' }} value={taskSubject} onChange={(e) => setTaskSubject(e.target.value)}>
            {subjects.map((s) => (
              <option key={s.id} value={s.name.bn}>
                {trText(s.name, language)}
              </option>
            ))}
          </select>
          <select className="ev-select" style={{ width: 'auto' }} value={taskMinutes} onChange={(e) => setTaskMinutes(Number(e.target.value))}>
            <option value={25}>25 {isBn ? 'মিনিট' : 'mins'}</option>
            <option value={40}>40 {isBn ? 'মিনিট' : 'mins'}</option>
            <option value={60}>60 {isBn ? 'মিনিট' : 'mins'}</option>
          </select>
          <button
            type="button"
            className="ev-btn ev-btn-primary"
            onClick={() => {
              if (!taskTitle.trim()) return;
              addStudyTask({
                title: taskTitle.trim(),
                subjectName: taskSubject,
                dueDate: new Date().toISOString().slice(0, 10),
                targetMinutes: taskMinutes,
              });
              setTaskTitle('');
            }}
          >
            + {isBn ? 'যোগ করো' : 'Add Goal'}
          </button>
        </div>

        {studyTasks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {isBn ? 'তোমার পড়ার রুটিনে এখনো কোনো টাস্ক নেই। ওপরে টার্গেট লিখে যোগ করো!' : 'No study tasks yet. Add your daily study goals above!'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {studyTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'var(--bg-surface-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontWeight: 700 }}>
                  <input type="checkbox" checked={t.completed} onChange={() => toggleStudyTask(t.id)} />
                  <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>
                    {t.title} — <small style={{ color: 'var(--brand-primary)' }}>{t.subjectName} ({t.targetMinutes}m)</small>
                  </span>
                </label>
                <button type="button" className="ev-btn ev-btn-danger ev-btn-sm" onClick={() => deleteStudyTask(t.id)}>
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* VIEW 10: DOUBT FORUM (💬 activeTab === 'community') */
  return (
    <div className="ev-card">
      <div className="ev-section-header">
        <h3 className="ev-section-title">💬 {trKey('nav_community', language)}</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="ev-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder={isBn ? 'তোমার প্রশ্নের শিরোনাম...' : 'Question Title...'}
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
          />
          <select className="ev-select" style={{ width: 'auto' }} value={postSubj} onChange={(e) => setPostSubj(e.target.value)}>
            {subjects.map((s) => (
              <option key={s.id} value={s.name.bn}>
                {trText(s.name, language)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            className="ev-input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder={isBn ? 'বিস্তারিত প্রশ্ন বা সমস্যা লেখো...' : 'Describe your academic question...'}
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
          />
          <button
            type="button"
            className="ev-btn ev-btn-primary"
            onClick={() => {
              if (!postTitle.trim()) return;
              addCommunityPost({
                authorName: userName,
                authorAvatar: '🎓',
                authorRank: isBn ? myRank.fullTitleBn : myRank.fullTitleEn,
                subjectName: postSubj,
                title: postTitle.trim(),
                body: postBody.trim(),
              });
              setPostTitle('');
              setPostBody('');
            }}
          >
            {isBn ? 'পোস্ট করো' : 'Post'}
          </button>
        </div>
      </div>

      {communityPosts.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {isBn ? 'ফোরামে এখনো কোনো প্রশ্ন পোস্ট করা হয়নি। তোমার যেকোনো একাডেমিক প্রশ্ন ওপরে লিখে পোস্ট করতে পারো!' : 'No questions posted yet. Ask your first academic doubt above!'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {communityPosts.map((post) => (
            <div key={post.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, flexWrap: 'wrap', gap: 4 }}>
                <span>
                  {post.authorAvatar || '🎓'} {post.authorName} • <strong style={{ color: 'var(--brand-primary)' }}>{post.authorRank}</strong> • {post.subjectName}
                </span>
                <span>{post.createdAt}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{post.title}</div>
              {post.body && <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 8 }}>{post.body}</p>}

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <button type="button" className="ev-btn ev-btn-secondary ev-btn-sm" onClick={() => togglePostLike(post.id)}>
                  👍 {post.likes}
                </button>
              </div>

              {post.replies.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid var(--brand-primary-border)' }}>
                  {post.replies.map((r) => (
                    <div key={r.id} style={{ fontSize: 13 }}>
                      <strong>{r.authorName}:</strong> {r.text}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  className="ev-input"
                  placeholder={isBn ? 'উত্তর বা মন্তব্য লেখো...' : 'Write a reply...'}
                  value={replyTextMap[post.id] || ''}
                  onChange={(e) => setReplyTextMap((p) => ({ ...p, [post.id]: e.target.value }))}
                />
                <button
                  type="button"
                  className="ev-btn ev-btn-soft ev-btn-sm"
                  onClick={() => {
                    const txt = (replyTextMap[post.id] || '').trim();
                    if (!txt) return;
                    addCommunityReply(post.id, userName, txt);
                    setReplyTextMap((p) => ({ ...p, [post.id]: '' }));
                  }}
                >
                  {isBn ? 'উত্তর দাও' : 'Reply'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
