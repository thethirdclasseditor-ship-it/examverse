import React, { useEffect, useState } from 'react';
import { getTodayIsoDate, trKey, trText, useExamStore } from '../store/useExamStore';
import { MCQQuestion, MistakeItem } from '../types';

function normalizeLookupText(text: string): string {
  return (text || '')
    .replace(/য়/g, 'য়')
    .replace(/['"’‘`.,?!:;()\-—–\s]/g, '')
    .toLowerCase();
}

const EXACT_MATH_BY_ID: Record<string, string> = {
  'ACC1-034': 'স্থায়ী সম্পদ ক্রয়ে ভ্যাট ও সংস্থাপন/বহন খরচ সম্পদের ক্রয়মূল্যের সাথে যুক্ত হয়: ৬৯,০০০ + ১,০০০ = ৭০,০০০ টাকা।',
  'ACC1-080': 'নগদান বই অনুযায়ী জের = ব্যাংক বিবরণীর জের ১৫,০০০ - অনুপস্থাপিত চেক ৩,০০০ = ১২,০০০ টাকা।',
  'ACC1-081': 'ব্যাংক বিবরণীর জের = ২০,০০০ + সরাসরি জমা ৫,০০০ - প্রত্যাখ্যাত চেক ৪,০০০ - ব্যাংক চার্জ ২০০ = ২০,৮০০ টাকা।',
  'ACC1-083': 'আদায় ১০,০০০ টাকা ক্রেডিট না করে ভুলবশত ডেবিট করায় দ্বিগুণ অর্থাৎ ১০,০০০ × ২ = ২০,০০০ টাকা ক্রেডিট করতে হবে।',
  'ACC1-084': '২৬০ টাকা ক্রেডিটের পরিবর্তে ভুলক্রমে ৬২০ টাকা ডেবিট করায় মোট গরমিল = ২৬০ + ৬২০ = ৮৮০ টাকা।',
  'ACC1-098': 'সমন্বিত ক্রয় = প্রারম্ভিক মজুদ ২৫,০০০ + নিট ক্রয় ১,৫০,০০০ - সমাপনী মজুদ ৩০,০০০ = ১,৪৫,০০০ টাকা।',
  'ACC1-101': 'রেওয়ামিলে সমন্বিত ক্রয় থাকলে প্রারম্ভিক মজুদ পণ্য রেওয়ামিলে অন্তর্ভুক্ত হয় না, বরং সমাপনী মজুদ অন্তর্ভুক্ত হয়।',
  'ACC1-102': 'ক্রয় = সমন্বিত ক্রয় ১,৫০,০০০ + সমাপনী মজুদ ২০,০০০ - প্রারম্ভিক মজুদ ৩০,০০০ = ১,৪০,০০০ টাকা।',
  'ACC1-107': 'ডেবিট দিকে (ক্রয়) ৫,০০০ টাকা কম এবং ক্রেডিট দিকেও (বিক্রয়) ৫,০০০ টাকা কম লেখায় একটি ভুল অপর ভুলকে পূরণ করেছে (পরিপূরক ভুল)।',
  'ACC1-108': 'উভয় দিকেই ৫,০০০ টাকা করে কম লেখায় রেওয়ামিলের যোগফলে ৫,০০০ টাকা কম হয়েছে।',
  'ACC1-115': 'ক্রয় (ডেবিট) ও বিক্রয় (ক্রেডিট) উভয় দিকেই সমপরিমাণ ৫,০০০ টাকা কম লেখায় এটি পরিপূরক ভুল।',
  'ACC1-116': 'যন্ত্রপাতি (স্থায়ী সম্পদ) ক্রয়কে মুনাফাজাতীয় ক্রয় হিসাবে ডেবিট করায় স্থায়ী সম্পদ ১০,০০০ টাকা হ্রাস পাবে (নীতিগত ভুল)।',
  'ACC1-120': 'মুনাফাজাতীয় ব্যয়কে (যন্ত্রপাতি মেরামত) মূলধনজাতীয় সম্পদ (যন্ত্রপাতি) হিসাবে দেখানো নীতিগত ভুল।',
  'ACC1-143': 'রক্ষণশীলতার নীতি অনুযায়ী সমাপনী মজুদ পণ্যের ক্রয়মূল্য ও বাজারমূল্যের মধ্যে যেটি কম (১৫,৫০,০০০ টাকা) সেটিই হিসাবভুক্ত হয়।',
  'ACC1-160': 'নতুন অনাদায়ী পাওনা সঞ্চিতি = পুরাতন সঞ্চিতি ৪,০০০ + বৃদ্ধি ২,০০০ = ৬,০০০ টাকা।',
  'ACC1-161': 'অনাদায়ী পাওনা খরচ = অনাদায়ী পাওনা ৫,০০০ + নতুন সঞ্চিতি ৬,০০০ - পুরাতন সঞ্চিতি ৪,০০০ = ৭,০০০ টাকা।',
  'ACC1-164': 'সমাপনী প্রাপ্য হিসাব = ৫০,০০০ + ৯০,০০০ - ৬০,০০০ = ৮০,০০০ টাকা। ১০% সঞ্চিতি = ৮০,০০০ × ১০% = ৮,০০০ টাকা।',
  'ACC1-165': 'নিট প্রাপ্য হিসাব = সমাপনী প্রাপ্য হিসাব ৮০,০০০ - ১০% সঞ্চিতি ৮,০০০ = ৭২,০০০ টাকা।',
  'ACC1-166': 'পুরাতন সঞ্চিতি ৪,০০০ এর স্থলে ৭,০০০ টাকা হলে সঞ্চিতি ৩,০০০ টাকা বাড়বে, ফলে নিট সম্পদ ও দায়/মালিকানাস্বত্ব ৩,০০০ টাকা হ্রাস পাবে।',
  'ACC1-173': 'মার্চ মাসের অবশিষ্ট ৩০ দিন + এপ্রিল ৩০ দিন = ৬০ দিন (৩০ এপ্রিল) + ৩ দিন অনুগ্রহ দিবস = ০৩ মে ২০১৬।',
  'ACC1-174': 'নতুন সঞ্চিতি = (প্রাপ্য হিসাব ৫০,০০০ - অনাদায়ী পাওনা ২,০০০) × ৫% = ৪৮,০০০ × ৫% = ২,৪০০ টাকা।',
  'ACC1-176': 'নতুন অনাদায়ী পাওনা সঞ্চিতি = পুরাতন সঞ্চিতি ৮,০০০ + বৃদ্ধি ৫,০০০ = ১৩,০০০ টাকা।',
  'ACC1-178': 'নিট বিক্রয় = ১০,০০,০০০ - ২০,০০০ = ৯,৮০,০০০; ধারে বিক্রয় = ১০,০০,০০০ × ৮০% - ২০,০০০ = ৭,৮০,০০০; ২% সঞ্চিতি = ৭,৮০,০০০ × ২% = ১৫,৬০০ টাকা।',
  'ACC1-195': 'ব্যবহৃত সাপ্লাইজ খরচ = প্রারম্ভিক সাপ্লাইজ ১,০০০ - সমাপনী সাপ্লাইজ ৬০০ = ৪০০ টাকা (সাপ্লাইজ খরচ ডেবিট ৪০০; সাপ্লাইজ ক্রেডিট ৪০০)।',
  'ACC1-202': 'ব্যবহৃত সাপ্লাইজ খরচ = ১,৩৫০ - ৮০০ = ৫৫০ টাকা (সাপ্লাইজ খরচ ডেবিট ৫৫০; সাপ্লাইজ ক্রেডিট ৫৫০)।',
  'ACC1-210': 'মাসিক বেতন = ৪০,০০০ ÷ ১০ = ৪,০০০ টাকা। ১ বছরে (১২ মাসে) বকেয়া ২ মাসের বেতন = ৪,০০০ × ২ = ৮,০০০ টাকা।',
  'ACC1-212': 'অবশিষ্ট অনুপার্জিত সেবা আয় = ৫০,০০০ × (১ - ২/৫) = ৫০,০০০ × ৩/৫ = ৩০,০০০ টাকা।',
  'ACC1-221': 'মেশিন হিসাবে ডেবিট = ক্রয়মূল্য ২০,০০০ + পরিবহন ৫০০ + সংস্থাপন ২,০০০ = ২২,৫০০ টাকা।',
  'ACC1-222': 'যন্ত্রপাতি হিসাবে ডেবিট = ৩০,০০০ + ৩,০০০ + ৭,০০০ = ৪০,০০০ টাকা।',
  'ACC1-223': 'যন্ত্রটির ক্রয়মূল্য = পুস্তক মূল্য ২৫,০০০ + পুঞ্জীভূত অবচয় ১৫,০০০ = ৪০,০০০ টাকা।',
  'ACC1-224': 'বিক্রয়জনিত লাভ = বিক্রয়মূল্য ৩০,০০০ - পুস্তক মূল্য ২৫,০০০ = ৫,০০০ টাকা লাভ।',
  'ACC1-234': 'বার্ষিক অবচয় = (মোট ব্যয় ১,০০,০০০ - ভগ্নাবশেষ ২০,০০০) ÷ ১০ বছর = ৮,০০০ টাকা।',
  'ACC1-235': 'অবচয়ের হার = (১০০% ÷ ১০) × ২ = ২০%। ২০২৩ সালের ৬ মাসের অবচয় = ১,০০,০০০ × ২০% × (৬/১২) = ১০,০০০ টাকা।',
  'ACC1-252': 'নিট বিক্রয় = ৩,৯০,০০০; মোট লাভ = ৩,৯০,০০০ × ৪০% = ১,৫৬,০০০; নিট লাভ = ১,৫৬,০০০ × ৩০% = ৪৬,৮০০; পরোক্ষ খরচ = ১,৫৬,০০০ - ৪৬,৮০০ = ১,০৯,২০০ টাকা।',
  'ACC1-253': 'বিক্রীত পণ্যের ব্যয় = ২২,০০০ + ১,৩৫,০০০ + ১০,০০০ - ৩৬,০০০ = ১,৩১,০০০; মোট লাভ = ৩,৭৫,০০০ - ১,৩১,০০০ = ২,৪৪,০০০ টাকা।',
  'ACC1-254': 'বিক্রীত পণ্যের ব্যয় = ২৫,০০০ + ১,০০,০০০ + ৪,০০০ - ২০,০০০ = ১,০৯,০০০ টাকা।',
  'ACC1-257': 'নিট ভ্যাটসহ ক্রয় = ৭১,০০০ - ২,০০০ = ৬৯,০০০ টাকা। ক্রয় ভ্যাট = ৬৯,০০০ × ১৫ ÷ ১১৫ = ৯,০০০ টাকা।',
  'ACC1-258': 'ক্রয়মূল্যের ওপর ২৫% (১/৪ অংশ) হলে বিক্রয়মূল্যের ওপর লাভের হার = ১ ÷ (৪ + ১) = ১/৫ বা ২০%।',
  'ACC1-260': 'বিক্রয়মূল্যের ওপর ২০% (১/৫ অংশ) হলে ক্রয়মূল্যের ওপর মুনাফার হার = ১ ÷ (৫ - ১) = ১/৪ বা ২৫%।',
  'ACC1-261': 'বিক্রয় = বিক্রীত পণ্যের ব্যয় ৩,০০,০০০ + মোট লাভ ২,০০,০০০ = ৫,০০,০০০ টাকা।',
  'ACC1-262': 'সমাপনী মজুদ = প্রারম্ভিক মজুদ ৩০,০০০ + ক্রয় ৪,০০,০০০ - বিক্রীত পণ্যের ব্যয় ৩,৩০,০০০ = ১,০০,০০০ টাকা।',
  'ACC1-263': 'কমিশন = ৪৪,০০০ × ১০ ÷ ১১০ = ৪,০০০ টাকা।',
  'ACC1-264': 'সমন্বিত ক্রয় = প্রারম্ভিক মজুদ ৬০,০০০ + নিট ক্রয় ১,৫০,০০০ - সমাপনী মজুদ ৩০,০০০ = ১,৮০,০০০ টাকা।',
  'ACC1-265': 'সমাপনী মজুদ ক্রয়মূল্য ৩০,০০০ এর স্থলে বাজারমূল্য ২০,০০০ টাকা ধরা হলে সমাপনী মজুদ ও মোট লাভ উভয়ই ১০,০০০ টাকা হ্রাস পায়।',
  'ACC1-268': 'প্রারম্ভিক মূলধন = ৩০,০০০ ÷ ০.৭৫ = ৪০,০০০ টাকা। ৫% হারে সুদ = ৪০,০০০ × ৫% = ২,০০০ টাকা।',
  'ACC1-269': 'সমাপনী মূলধন = প্রারম্ভিক মূলধন ১,৭০,০০০ + নিট লাভ ৫০,০০০ - উত্তোলন ২০,০০০ = ২,০০,০০০ টাকা।',
  'ACC1-277': 'নিট মুনাফা ২০,০০০ টাকা বৃদ্ধি পেলে মালিকানাস্বত্ব ও মোট সম্পদ ২০,০০০ টাকা বৃদ্ধি পাবে।',
  'ACC1-290': 'প্রতি মাসে ১,০০০ টাকা নগদ উত্তোলনের সুদ = ১,০০০ × ১০% × ৬ = ৬০০ টাকা।',
  'ACC1-291': 'প্রতি মাসের শুরুতে উত্তোলনের সুদ = মাসিক উত্তোলন ১,০০০ × সুদের হার ৫% × ৬.৫ = ৩২৫ টাকা।',
  'ACC1-292': 'মোট সম্পদ = ৯১,৫০০; মোট বহির্দায় = ৪০,০০০; সমাপনী মূলধন = ৫০,০০০ টাকা।',
  'ACC1-293': 'নিট লাভ = সমাপনী মূলধন ৭৫,০০০ - প্রারম্ভিক মূলধন ৫০,০০০ = ২৫,০০০ টাকা।',
  'ACC1-296': 'অতিরিক্ত মূলধন = বকেয়া বেতন পরিশোধ ১০,০০০ + ব্যক্তিগত কম্পিউটার প্রদান ২০,০০০ = ৩০,০০০ টাকা।',
  'ACC1-297': 'মোট উত্তোলন = নগদ উত্তোলন (৫০০ × ৩ = ১,৫০০) + পণ্য উত্তোলন ২,০০০ = ৩,৫০০ টাকা।',
};

const EXACT_MATH_BY_TEXT: Record<string, string> = {
  'জাহানট্রেডার্স১জুলাই২০২৪তারিখেঅফিসেব্যবহারেরজন্য১৫%ভ্যাটসহ৬৯০০০টাকায়আসবাবপত্রক্রয়করেএবংবহনখরচবাবদ১০০০টাকাপ্রদানকরে।জাহানট্রেডার্সআসবাবপত্রহিসাবেকতটাকাডেবিটকরবে': EXACT_MATH_BY_ID['ACC1-034'],
  'ব্যাংকবিবরণীঅনুযায়ীব্যাংকজমারউদ্বৃত্ত১৫০০০টাকাইস্যুকৃতচেকযাব্যাংকেউপস্থাপিতহয়নি৩০০০টাকাহলেনগদানবইঅনুযায়ীজেরকত': EXACT_MATH_BY_ID['ACC1-080'],
  'নোমানকোম্পানিরনগদানবহিঅনুযায়ীব্যাংকজমারউদ্বৃত্ত২০০০০টাকা।দেনাদারকর্তৃকসরাসরিব্যাংকেজমা৫০০০টাকাআদায়েরজন্যজমাকৃতচেকপ্রত্যাখ্যাত৪০০০টাকাএবংব্যাংককর্তৃকধার্যকৃতচার্জ২০০টাকাহলেব্যাংকবিবরণীঅনুযায়ীব্যাংকজমারউদ্বৃত্তকত': EXACT_MATH_BY_ID['ACC1-081'],
  'প্রাপ্যনোটেরটাকাআদায়১০০০০টাকাব্যাংকভুলবশতপাসবইয়েডেবিটকরেছে।পাসবইয়েকতটাকাডেবিটবাক্রেডিটকরতেহবে': EXACT_MATH_BY_ID['ACC1-083'],
  'ব্যাংকচার্জ২৬০টাকানগদানবইয়েভুলক্রমে৬২০টাকাডেবিটকরাহয়েছে।এরফলেনগদানবইএবংব্যাংকউদ্বৃত্তেরমধ্যেগরমিলেরপরিমাণকতটাকাহবে': EXACT_MATH_BY_ID['ACC1-084'],
  'প্রারম্ভিকমজুদ২৫০০০টাকাক্রয়১৫০০০০টাকাবিক্রয়২০০০০০টাকাওসমাপনীমজুদ৩০০০০টাকাহলেসমন্বিতক্রয়কতহবে': EXACT_MATH_BY_ID['ACC1-098'],
  'তমালেরব্যবসায়েরহিসাববইহতেনিম্নোক্ততথ্যদেওয়াহলোপ্রারম্ভিকমজুদ৩০০০০টাকাসমাপনীমজুদ২০০০০টাকাসমন্বিতক্রয়১৫০০০০টাকাওপ্রারম্ভিকমনিহারি৫০০০টাকা।কোনটিরেওয়ামিলেঅন্তর্ভুক্তহবেনা': EXACT_MATH_BY_ID['ACC1-101'],
  'তমালেরব্যবসায়েরপ্রারম্ভিকমজুদ৩০০০০টাকাসমাপনীমজুদ২০০০০টাকাএবংসমন্বিতক্রয়১৫০০০০টাকা।এবছরেতমালকতটাকারপণ্যক্রয়করেছিলেন': EXACT_MATH_BY_ID['ACC1-102'],
  'একটিরেওয়ামিলেক্রয়২০০০০টাকারপরিবর্তে১৫০০০টাকাএবংবিক্রয়৫০০০০টাকারপরিবর্তে৪৫০০০টাকালেখাহয়েছে।এইভুলগুলোসত্ত্বেওরেওয়ামিলমিলেগেল।রেওয়ামিলতৈরিতেকোনধরনেরভুলহয়েছে': EXACT_MATH_BY_ID['ACC1-107'],
  'একটিরেওয়ামিলেক্রয়২০০০০টাকারপরিবর্তে১৫০০০টাকাএবংবিক্রয়৫০০০০টাকারপরিবর্তে৪৫০০০টাকালেখাহয়েছে।রেওয়ামিলেরযোগফলেকতটাকাকমবাবেশিলেখাহয়েছে': EXACT_MATH_BY_ID['ACC1-108'],
  'রেওয়ামিলেক্রয়৫০০০০টাকারস্থলে৪৫০০০টাকাএবংবিক্রয়৪০০০০টাকারস্থলে৩৫০০০টাকালেখাহওয়ায়ভুলথাকাসত্ত্বেওরেওয়ামিলমিলেগেল।রেওয়ামিলতৈরিতেকোনধরনেরভুলহয়েছে': EXACT_MATH_BY_ID['ACC1-115'],
  'যন্ত্রপাতিক্রয়১০০০০টাকাক্রয়হিসাবেডেবিটকরাহলেস্থায়ীসম্পদেরওপরকীপ্রভাবপড়বে': EXACT_MATH_BY_ID['ACC1-116'],
  'যন্ত্রপাতিমেরামত১০০০০টাকাযন্ত্রপাতিহিসাবেদেখানোহলোএটিকোনধরনেরভুল': EXACT_MATH_BY_ID['ACC1-120'],
  'সোহেলঅ্যান্ডকোএরসমাপনীমজুদক্রয়মূল্য১৫৫০০০০টাকাএবংবাজারমূল্য২০০০০০০টাকা।কোননীতিঅনুসায়ীসমাপনীমজুদপণ্য১৫৫০০০০টাকাধরাহয়েছে': EXACT_MATH_BY_ID['ACC1-143'],
  'জনাবআজাদেরব্যবসায়েরঅনাদায়ীপাওনাসঞ্চিতি২০০০টাকাদ্বারাবৃদ্ধিকরতেহবে।তারব্যবসায়অনাদায়ীপাওনারপরিমাণ৫০০০টাকাএবংবছরেরশুরুতেপাওনাসঞ্চিতিরউদ্বৃত্তছিল৪০০০টাকা।নতুনঅনাদায়ীপাওনাসঞ্চিতিরপরিমাণকত': EXACT_MATH_BY_ID['ACC1-160'],
  'জনাবআজাদেরব্যবসায়েরঅনাদায়ীপাওনাসঞ্চিতি২০০০টাকাদ্বারাবৃদ্ধিকরতেহবে।তারব্যবসায়অনাদায়ীপাওনারপরিমাণ৫০০০টাকাএবংবছরেরশুরুতেপাওনাসঞ্চিতিরউদ্বৃত্তছিল৪০০০টাকা।আয়ব্যয়হিসাবেঅনাদায়ীপাওনাখরচকতটাকাদেখানোহবে': EXACT_MATH_BY_ID['ACC1-161'],
  'বছরেরশুরুতেপ্রাপ্যহিসাবেরউদ্বৃত্ত৫০০০০টাকা।উক্তবছরেধারেবিক্রয়েরপরিমাণ৯০০০০টাকাএবংপ্রাপ্যহিসাবহতেপ্রাপ্তি৬০০০০টাকা।অনাদায়ীপাওনাসঞ্চিতি১০%রাখাহলেবছরশেষেনতুনঅনাদায়ীপাওনাসঞ্চিতিকত': EXACT_MATH_BY_ID['ACC1-164'],
  'বছরেরশুরুতেপ্রাপ্যহিসাবেরউদ্বৃত্ত৫০০০০টাকা।উক্তবছরেধারেবিক্রয়েরপরিমাণ৯০০০০টাকাএবংপ্রাপ্যহিসাবহতেপ্রাপ্তি৬০০০০টাকা।১০%সঞ্চিতিবাদেআর্থিকঅবস্থারবিবরণীতেপ্রদর্শিতনিটপ্রাপ্যহিসাবেরপরিমাণকত': EXACT_MATH_BY_ID['ACC1-165'],
  'মেসার্সআসলামট্রেডার্সেরঅনাদায়ীপাওনাসঞ্চিতিআরও২০০০টাকাবৃদ্ধিকরতেহবে।হিসাবভুক্তঅনাদায়ীপাওনা৫০০০টাকাএবংবছরশুরুতেঅনাদায়ীপাওনাসঞ্চিতি৪০০০টাকা।যদিবছরেরশুরুতেঅনাদায়ীপাওনাসঞ্চিতি৭০০০টাকাহয়তাহলেপূর্বেরতুলনায়বর্তমানআর্থিকঅবস্থারবিবরণীতেকীপরিবর্তনহবে': EXACT_MATH_BY_ID['ACC1-166'],
  '০১মার্চ২০১৬তারিখে৬০দিনমেয়াদিপ্রদেয়নোটেস্বীকৃতিদেওয়াহলেপরিশোধেরনির্ধারিততারিখকোনটি': EXACT_MATH_BY_ID['ACC1-173'],
  'প্রাপ্যহিসাব৫০০০০টাকাঅনাদায়ীপাওনা২০০০টাকাএবং৫%হারেঅনাদায়ীপাওনাসঞ্চিতিধরতেহলেনতুনসঞ্চিতিকত': EXACT_MATH_BY_ID['ACC1-174'],
  'অনাদায়ীপাওনাসঞ্চিতি৫০০০টাকাদ্বারাবৃদ্ধিকরতেহবে।রেওয়ামিলেঅনাদায়ীপাওনাসঞ্চিতিরউদ্বৃত্ত৮০০০টাকাহলেনতুনঅনাদায়ীপাওনাসঞ্চিতিকত': EXACT_MATH_BY_ID['ACC1-176'],
  'সফিট্রেডার্সেরপ্রারম্ভিকপ্রাপ্যহিসাবেরউদ্বৃত্ত২০০০০০টাকামোটবিক্রয়১০০০০০০টাকাবিক্রয়ফেরত২০০০০টাকা।ধারেবিক্রয়মোটবিক্রয়ের৮০%এবংঅনাদায়ীপাওনাসঞ্চিতিনিটধারেবিক্রয়ের২%হলেসঞ্চিতিকত': EXACT_MATH_BY_ID['ACC1-178'],
  'রেওয়ামিলেঅফিসসাপ্লাইজ১০০০টাকাএবংসাপ্লাইজখরচশূন্যটাকা।সমন্বয়েসমাপনীসাপ্লাইজ৬০০টাকাথাকলেসমন্বয়দাখিলাহবে': EXACT_MATH_BY_ID['ACC1-195'],
  'রেওয়ামিলেসাপ্লাইজ১৩৫০টাকাএবংসাপ্লাইজখরচ০টাকা।যদিনির্দিষ্টসময়শেষে৮০০টাকারসাপ্লাইজমজুতথাকেতবেসমন্বয়জাবেদাকোনটি': EXACT_MATH_BY_ID['ACC1-202'],
  '১০মাসেরবেতনদেওয়াহয়েছে৪০০০০টাকাএকবছরেরবকেয়াবেতনেরপরিমাণকত': EXACT_MATH_BY_ID['ACC1-210'],
  'অনুপার্জিতসেবাআয়েরপরিমাণ৫০০০০টাকা।উহার২/৫অংশউপার্জিতহলেহিসাবকালশেষেঅনুপার্জিতসেবাআয়েরজেরকতহবে': EXACT_MATH_BY_ID['ACC1-212'],
  'নগদে২০০০০টাকারকলকব্জাক্রয়করেএরপরিবহনবাবদ৫০০টাকাএবংসংস্থাপনবাবদ২০০০টাকাপ্রদানকরাহলেমেশিনহিসাবকতটাকায়ডেবিটহবে': EXACT_MATH_BY_ID['ACC1-221'],
  'যন্ত্রপাতিক্রয়৩০০০০টাকাবহনখরচ৩০০০টাকাএবংসংস্থাপনব্যয়৭০০০টাকাহলেযন্ত্রপাতিহিসাবকতটাকাডেবিটহবে': EXACT_MATH_BY_ID['ACC1-222'],
  'লামিছালিএর২৫০০০টাকাপুস্তকমূল্যেরএকটিযন্ত্রপাতিরপুঞ্জীভূতঅবচয়১৫০০০টাকাহলেযন্ত্রটিরক্রয়মূল্যকতটাকা': EXACT_MATH_BY_ID['ACC1-223'],
  'লামিছালিএর২৫০০০টাকাপুস্তকমূল্যেরএকটিযন্ত্রপাতিরপুঞ্জীভূতঅবচয়১৫০০০টাকা।যন্ত্রটিরবর্তমানবিক্রয়মূল্য৩০০০০টাকাহলেকতটাকালাভবাক্ষতিহবে': EXACT_MATH_BY_ID['ACC1-224'],
  'সেলিমট্রেডার্স১জুলাই২০২৩তারিখে৯০০০০টাকামূল্যেরএকটিমেশিনক্রয়করেএবংসংস্থাপনবাবদ১০০০০টাকাব্যয়করে।আয়ুষ্কাল১০বছরএবংভগ্নাবশেষমূল্য২০০০০টাকা।সরলরৈখিকপদ্ধতিতে২০২৪সালেরঅবচয়কতটাকা': EXACT_MATH_BY_ID['ACC1-234'],
  'সেলিমট্রেডার্স১জুলাই২০২৩তারিখে৯০০০০টাকামূল্যেরএকটিমেশিনক্রয়করেএবংসংস্থাপনবাবদ১০০০০টাকাব্যয়করে।আয়ুষ্কাল১০বছরএবংভগ্নাবশেষমূল্য২০০০০টাকা।ক্রমহ্রাসমানজেরপদ্ধতিতে২০%হারে২০২৩সালের৬মাসেরঅবচয়কতটাকা': EXACT_MATH_BY_ID['ACC1-235'],
  'নির্দিষ্টহিসাবকালেরমোটবিক্রয়৪০০০০০টাকাএবংবিক্রয়ফেরত১০০০০টাকা।মোটলাভেরহার৪০%এবংনিটলাভেরহারমোটলাভের৩০%হলেপরোক্ষখরচেরপরিমাণকত': EXACT_MATH_BY_ID['ACC1-252'],
  'প্রারম্ভিকমজুদপণ্য২২০০০টাকাক্রয়১৩৫০০০টাকামজুরি১০০০০টাকাবিক্রয়৩৭৫০০০টাকাএবংসমাপনীমজুদপণ্য৩৬০০০টাকাহলেমোটলাভেরপরিমাণকত': EXACT_MATH_BY_ID['ACC1-253'],
  'প্রারম্ভিকমজুদ২৫০০০টাকানিটক্রয়১০০০০০টাকাক্রয়পরিবহন৪০০০টাকাএবংসমাপনীমজুদ২০০০০টাকাহলেবিক্রীতপণ্যেরব্যয়কত': EXACT_MATH_BY_ID['ACC1-254'],
  'রেওয়ামিলে১৫%ভ্যাটসহক্রয়৭১০০০টাকাএবংক্রয়ফেরত২০০০টাকাদেওয়াআছে।ক্রয়ভ্যাটেরপরিমাণকতটাকা': EXACT_MATH_BY_ID['ACC1-257'],
  'ক্রয়মূল্যেরওপরলাভেরহার২৫%হলেবিক্রয়মূল্যেরওপরলাভেরহারকত': EXACT_MATH_BY_ID['ACC1-258'],
  'বিক্রয়েরওপরমুনাফারহার২০%হলেক্রয়মূল্যেরওপরমুনাফারহারকতহবে': EXACT_MATH_BY_ID['ACC1-260'],
  'পণ্যক্রয়৪০০০০০টাকাপ্রারম্ভিকমজুদপণ্য৩০০০০টাকাবিক্রীতপণ্যেরব্যয়৩০০০০০টাকাওমোটলাভ২০০০০০টাকাহলেবিক্রয়েরপরিমাণকত': EXACT_MATH_BY_ID['ACC1-261'],
  'পণ্যক্রয়৪০০০০০টাকাপ্রারম্ভিকমজুদপণ্য৩০০০০টাকাবিক্রীতপণ্যেরব্যয়৩৩০০০০টাকাওমোটলাভ২০০০০০টাকাহলেসমাপনীমজুদপণ্যেরমূল্যকত': EXACT_MATH_BY_ID['ACC1-262'],
  'ম্যানেজারনিটমুনাফার১০%হারেকমিশনপায়।ম্যানেজারেরকমিশনসহনিটমুনাফা৪৪০০০টাকাহলেকমিশনেরপরিমাণকত': EXACT_MATH_BY_ID['ACC1-263'],
  'প্রারম্ভিকমজুদ৬০০০০টাকানিটক্রয়েরপরিমাণ১৫০০০০টাকাএবংসমাপনীমজুদপণ্যেরক্রয়মূল্য৩০০০০টাকাহলেসমন্বিতক্রয়েরপরিমাণকতটাকা': EXACT_MATH_BY_ID['ACC1-264'],
  'প্রারম্ভিকমজুদ৬০০০০টাকানিটক্রয়১৫০০০০টাকাএবংসমাপনীমজুদপণ্যেরক্রয়মূল্য৩০০০০টাকা।সমাপনীমজুদপণ্যেরবাজারমূল্য২০০০০টাকাহলেমোটলাভেরওপরকীপ্রভাবপড়বে': EXACT_MATH_BY_ID['ACC1-265'],
  'মিসুমনেরসমাপনীমূলধন৩০০০০টাকাযাপ্রারম্ভিকমূলধনেরচেয়ে২৫%কম।মূলধনেরসুদেরহার৫%হলেমূলধনেরসুদেরপরিমাণকত': EXACT_MATH_BY_ID['ACC1-268'],
  'সাগরএন্টারপ্রাইজেরপ্রারম্ভিকমূলধন১৭০০০০টাকাউত্তোলন২০০০০টাকাবিক্রীতপণ্যেরব্যয়১৬০০০০টাকাএবংবিক্রয়২৭০০০০টাকা।এবছরতাদেরনিটলাভহয়েছে৫০০০০টাকা।সমাপনীমূলধনকত': EXACT_MATH_BY_ID['ACC1-269'],
  'নিটমুনাফারপরিমাণ৬০০০০টাকারপরিবর্তে৮০০০০টাকাহয়তবেমোটসম্পদেরপরিমাণকতহবে': EXACT_MATH_BY_ID['ACC1-277'],
  'মালিকব্যবসায়হতেপ্রত্যেকমাসেনগদ১০০০টাকাএবংবছরেমোট১০০০টাকারপণ্যউত্তোলনকরেথাকলে১০%হারেউত্তোলনেরসুদকত': EXACT_MATH_BY_ID['ACC1-290'],
  'প্রতিমাসেরশুরুতেউত্তোলনেরপরিমাণ১০০০টাকাহলে৫%হারেসুদেউত্তোলনেরওপরবার্ষিকসুদেরপরিমাণকত': EXACT_MATH_BY_ID['ACC1-291'],
  'জনাবসাকিবআলহাসান২০১৪সালের১জানুয়ারি৫০০০০টাকানিয়েকারবারআরম্ভকরেন।৩১ডিসেম্বর২০১৪তারিখেতারসম্পদওদায়েরতথ্যব্যাংকজমাতিরিক্ত১০০০০টাকাপ্রদেয়হিসাব১৫০০০টাকাবকেয়াখরচ৫০০০টাকা১৫%ঋণ৩১১২২০১৪১০০০০টাকানগদউদ্বৃত্ত২০০০০টাকাপ্রাপ্যহিসাব২৫০০০টাকামজুদপণ্য১৫০০০টাকা১০%বিনিয়োগ৩০৬২০১৪৩০০০০টাকা।জনাবসাকিবআলহাসানেরসমাপনীমূলধনেরপরিমাণকত': EXACT_MATH_BY_ID['ACC1-292'],
  'জনাবসাকিবআলহাসান২০১৪সালের১জানুয়ারিতারিখে৫০০০০টাকানিয়েকারবারআরম্ভকরেনএবংসমাপনীমূলধননির্ণীতহয়৭৫০০০টাকা।এবছরেনিটলাভকত': EXACT_MATH_BY_ID['ACC1-293'],
  'মিসালামপ্রতিচারমাসপরপর৫০০টাকাকরেনগদএবংবছরেমোট২০০০টাকারপণ্যউত্তোলনকরেছে।সেকর্মচারীদেরবকেয়াবেতন১০০০০টাকানিজপকেটহতেপরিশোধকরেছে।এছাড়াওসেব্যক্তিগত২০০০০টাকামূল্যেরকম্পিউটারকারবারেপ্রদানকরেছে।অতিরিক্তমূলধনেরপরিমাণকত': EXACT_MATH_BY_ID['ACC1-296'],
  'মিসালামপ্রতিচারমাসপরপর৫০০টাকাকরেনগদএবংবছরেমোট২০০০টাকারপণ্যউত্তোলনকরেছে।উত্তোলনেরমোটপরিমাণকত': EXACT_MATH_BY_ID['ACC1-297'],
};

function getCleanBoardBadge(boardTag?: string): string | null {
  if (!boardTag) return null;
  const t = boardTag.trim();
  if (!t) return null;
  if (
    t === 'বোর্ড প্রশ্ন' ||
    t === 'NCTB ও বোর্ড প্রশ্ন' ||
    t === 'বো. প্রশ্ন' ||
    t.startsWith('HSC বাংলা ১ম পত্র') ||
    t.startsWith('HSC ফিন্যান্স') ||
    t.includes('Batch')
  ) {
    return null;
  }
  return t;
}

/**
 * Returns verified explanation for a question (checks explicit explanation, exact ID map,
 * and normalized question-text map so deduplicated Accounting 1st Paper questions still show math solutions).
 */
export function getComplexMathOrRuleExplanation(
  q: MCQQuestion,
  lang: 'bn' | 'en' | 'bilingual' = 'bn'
): string {
  if (!q) return '';

  if (EXACT_MATH_BY_ID[q.id]) {
    return EXACT_MATH_BY_ID[q.id];
  }

  const rawExp = trText(q.explanation, lang).trim();
  if (
    rawExp &&
    !rawExp.includes('বোর্ড স্ট্যান্ডার্ড সমাধান') &&
    !rawExp.includes('Board standard solution')
  ) {
    return rawExp;
  }

  const normKey = normalizeLookupText(q.q?.bn || q.q?.en || '');
  if (normKey && EXACT_MATH_BY_TEXT[normKey]) {
    return EXACT_MATH_BY_TEXT[normKey];
  }

  return '';
}

export const QuizRunnerModal: React.FC = () => {
  const { activeQuiz, closeQuiz, recordExamResult, submitQuestionReport, userName, language } = useExamStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitted, setSubmitted] = useState(false);
  const [instantFeedback, setInstantFeedback] = useState(true);
  const [openCqSolution, setOpenCqSolution] = useState<Record<string, boolean>>({});
  const [paletteOpenMobile, setPaletteOpenMobile] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportIssueType, setReportIssueType] = useState('উত্তর ভুল আছে');
  const [reportComment, setReportComment] = useState('');
  const [reportSentMsg, setReportSentMsg] = useState<string | null>(null);

  useEffect(() => {
    if (activeQuiz) {
      setCurrentIndex(0);
      setAnswers({});
      setFlagged({});
      setTimeLeft(activeQuiz.durationSec || 600);
      setSubmitted(false);
      setInstantFeedback(activeQuiz.mode === 'practice');
      setReportOpen(false);
      setReportSentMsg(null);
      setPaletteOpenMobile(false);
    }
  }, [activeQuiz]);

  useEffect(() => {
    if (!activeQuiz || submitted || activeQuiz.examType === 'cq') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, submitted]);

  const handleSubmitExam = () => {
    if (!activeQuiz || submitted) return;
    setSubmitted(true);
    const questions = activeQuiz.questions || [];
    let correctCount = 0;
    let wrongCount = 0;
    const newMistakes: MistakeItem[] = [];
    const todayDate = getTodayIsoDate();

    questions.forEach((q, idx) => {
      const chosen = answers[idx];
      if (chosen === q.ans) {
        correctCount++;
      } else if (chosen !== undefined) {
        wrongCount++;
        newMistakes.push({
          id: `mistake-${Date.now()}-${idx}`,
          questionId: q.id,
          subjectId: activeQuiz.subjectId,
          subjectName: trText(activeQuiz.subjectName, language),
          chapterName: trText(activeQuiz.chapterName, language),
          question: q.q,
          options: q.options,
          correctIndex: q.ans,
          selectedIndex: chosen,
          explanation: q.explanation,
          wrongCount: 1,
          lastMissedAt: todayDate,
          mastered: false,
        });
      }
    });

    const total = Math.max(1, questions.length);
    const negRate = activeQuiz.negativeMarking || 0;
    const negativePenalty = Math.round(wrongCount * negRate * 100) / 100;
    const netScore = Math.max(0, Math.round((correctCount - negativePenalty) * 100) / 100);
    const accuracy = Math.min(100, Math.max(0, Math.round((netScore / total) * 100)));
    const xpEarned = Math.max(0, Math.round(netScore * 10 + (accuracy >= 80 && total >= 5 ? 25 : 0)));

    recordExamResult(
      {
        subjectId: activeQuiz.subjectId,
        subjectName: trText(activeQuiz.subjectName, language),
        chapterId: activeQuiz.chapterId,
        chapterName: trText(activeQuiz.chapterName, language),
        mode: activeQuiz.mode === 'daily' ? 'daily' : activeQuiz.mode === 'timed' ? 'timed' : 'mcq',
        score: netScore,
        rawCorrect: correctCount,
        wrongCount,
        negativePenalty,
        total,
        accuracy,
        timeSpentSec: Math.max(5, activeQuiz.durationSec - timeLeft),
        xpEarned,
      },
      newMistakes
    );
  };

  useEffect(() => {
    if (activeQuiz && activeQuiz.examType !== 'cq' && !submitted && timeLeft === 0) {
      handleSubmitExam();
    }
  }, [timeLeft, activeQuiz, submitted]);

  if (!activeQuiz) return null;

  const isBn = language !== 'en';
  const questions = activeQuiz.questions || [];
  const currentQ = questions[currentIndex];
  const negRate = activeQuiz.negativeMarking || 0;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSendReport = () => {
    if (!currentQ) return;
    const opts = currentQ.options.bn?.length ? currentQ.options.bn : currentQ.options.en;
    submitQuestionReport({
      questionId: currentQ.id,
      subjectId: activeQuiz.subjectId,
      subjectName: trText(activeQuiz.subjectName, 'bn'),
      chapterId: activeQuiz.chapterId,
      chapterName: trText(activeQuiz.chapterName, 'bn'),
      questionText: trText(currentQ.q, 'bn'),
      options: opts,
      currentAns: currentQ.ans,
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

  if (activeQuiz.examType === 'cq') {
    return (
      <div className="ev-modal-backdrop is-open" role="dialog" aria-modal="true">
        <div className="ev-card" style={{ width: '100%', maxWidth: 860, maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="ev-section-header">
            <h3 className="ev-section-title">
              {trText(activeQuiz.subjectName, language)} — {trText(activeQuiz.chapterName, language)}
            </h3>
            <button className="ev-btn ev-btn-secondary ev-btn-sm" onClick={closeQuiz}>
              ✕ {isBn ? 'বন্ধ করো' : 'Close'}
            </button>
          </div>
          {activeQuiz.cqs.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {isBn ? 'এই অধ্যায়ে এখনো কোনো সৃজনশীল প্রশ্ন যুক্ত করা হয়নি।' : 'No Creative Questions added yet.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activeQuiz.cqs.map((cq, idx) => (
                <div key={cq.id} className="ev-card" style={{ background: 'var(--bg-surface-muted)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--brand-primary)', marginBottom: 6 }}>
                    {isBn ? `উদ্দীপক #${idx + 1}` : `Stem #${idx + 1}`}
                  </div>
                  <p style={{ marginBottom: 12, fontWeight: 600, whiteSpace: 'pre-line' }}>{trText(cq.stem, language)}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
                    <div><strong>ক:</strong> {trText(cq.a, language)}</div>
                    <div><strong>খ:</strong> {trText(cq.b, language)}</div>
                    <div><strong>গ:</strong> {trText(cq.c, language)}</div>
                    <div><strong>ঘ:</strong> {trText(cq.d, language)}</div>
                  </div>
                  <button
                    className="ev-btn ev-btn-secondary ev-btn-sm"
                    style={{ marginTop: 10 }}
                    onClick={() => setOpenCqSolution((p) => ({ ...p, [cq.id]: !p[cq.id] }))}
                  >
                    {openCqSolution[cq.id] ? (isBn ? 'উত্তর লুকাও' : 'Hide Answer') : isBn ? 'নমুনা উত্তর' : 'Model Answer'}
                  </button>
                  {openCqSolution[cq.id] && (
                    <div className="ev-explanation-box">
                      <div><strong>ক:</strong> {trText(cq.ansA, language)}</div>
                      <div><strong>খ:</strong> {trText(cq.ansB, language)}</div>
                      <div><strong>গ:</strong> {trText(cq.ansC, language)}</div>
                      <div><strong>ঘ:</strong> {trText(cq.ansD, language)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="ev-modal-backdrop is-open" role="dialog" aria-modal="true" onClick={closeQuiz}>
        <div className="ev-modal-panel" style={{ maxWidth: 420, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
          <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>
            {trText(activeQuiz.subjectName, language)}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            {isBn
              ? 'এই অধ্যায়ে এখনো কোনো MCQ প্রশ্ন যুক্ত করা হয়নি।'
              : 'No MCQ questions available for this chapter yet.'}
          </p>
          <button className="ev-btn ev-btn-primary" onClick={closeQuiz}>
            {isBn ? 'বন্ধ করো' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const correctSoFar = Object.entries(answers).filter(
    ([idxStr, ansIdx]) => questions[Number(idxStr)]?.ans === ansIdx
  ).length;
  const wrongSoFar = answeredCount - correctSoFar;
  const netPenaltySoFar = Math.round(wrongSoFar * negRate * 100) / 100;
  const netScoreSoFar = Math.max(0, Math.round((correctSoFar - netPenaltySoFar) * 100) / 100);
  const overallAccuracyPct = Math.min(100, Math.max(0, Math.round((netScoreSoFar / Math.max(1, questions.length)) * 100)));

  const optionLabels = isBn ? ['ক', 'খ', 'গ', 'ঘ'] : ['A', 'B', 'C', 'D'];
  const optionsArray =
    language === 'en' && currentQ?.options.en?.length
      ? currentQ.options.en
      : currentQ?.options.bn?.length
      ? currentQ.options.bn
      : currentQ?.options.en || [];
  const hasAnsweredCurrent = answers[currentIndex] !== undefined;
  const showAnswerState = submitted || (instantFeedback && hasAnsweredCurrent);
  const cleanBoardBadge = currentQ ? getCleanBoardBadge(currentQ.boardTag || currentQ.board) : null;
  const explanationText = currentQ && showAnswerState ? getComplexMathOrRuleExplanation(currentQ, language) : '';
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div
      className="ev-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      style={{ alignItems: 'flex-start', padding: '10px', overflowY: 'auto' }}
    >
      <div style={{ width: '100%', maxWidth: 1060, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 28 }}>
        {/* Sticky Top Header */}
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
                {negRate > 0 ? ` • (-${negRate} Neg)` : ''}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {!submitted && (
                <button
                  type="button"
                  onClick={() => setInstantFeedback((p) => !p)}
                  style={{
                    height: 32,
                    padding: '0 10px',
                    borderRadius: 999,
                    border: '1px solid var(--border-default)',
                    background: instantFeedback ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
                    color: instantFeedback ? '#059669' : '#4F46E5',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {instantFeedback ? (isBn ? 'অনুশীলন' : 'Practice') : isBn ? 'পরীক্ষা' : 'Exam'}
                </button>
              )}

              <div
                className={`ev-timer-badge font-mono ${timeLeft <= 60 && !submitted ? 'is-urgent' : ''}`}
                style={{ padding: '4px 10px', fontSize: 13 }}
              >
                {formatTimer(timeLeft)}
              </div>

              <button
                type="button"
                className="ev-btn ev-btn-secondary ev-btn-sm"
                style={{ width: 32, height: 32, padding: 0, borderRadius: 10 }}
                onClick={closeQuiz}
                aria-label="Close Quiz"
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
              {isBn ? `প্রশ্ন ${currentIndex + 1} / ${questions.length}` : `Q ${currentIndex + 1} / ${questions.length}`} •{' '}
              {isBn ? `উত্তর: ${answeredCount}টি` : `Answered: ${answeredCount}`}
            </span>

            <button
              type="button"
              onClick={() => setPaletteOpenMobile((p) => !p)}
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
              {isBn ? (paletteOpenMobile ? 'নেভিগেটর লুকাও ▲' : 'নেভিগেটর ▼') : paletteOpenMobile ? 'Hide ▲' : 'Navigator ▼'}
            </button>
          </div>

          <div className="ev-progress-track" style={{ height: 5 }}>
            <div
              className="ev-progress-fill"
              style={{ width: `${Math.round(((currentIndex + 1) / Math.max(1, questions.length)) * 100)}%` }}
            />
          </div>

          {paletteOpenMobile && (
            <div style={{ paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
              <div className="ev-palette-grid" style={{ maxHeight: 150, overflowY: 'auto' }}>
                {questions.map((q, idx) => {
                  const chosen = answers[idx];
                  const reveal = submitted || (instantFeedback && chosen !== undefined);
                  let dotCls = '';
                  if (reveal) dotCls = chosen === q.ans ? 'is-correct' : chosen !== undefined ? 'is-incorrect' : '';
                  else if (idx === currentIndex) dotCls = 'is-current';
                  else if (chosen !== undefined) dotCls = 'is-answered';

                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={`ev-palette-dot ${dotCls} ${flagged[idx] ? 'is-bookmarked' : ''}`}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setPaletteOpenMobile(false);
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

        {/* Result Summary Card */}
        {submitted && (
          <div
            className="ev-card"
            style={{
              background: 'linear-gradient(135deg, rgba(79,70,229,0.09) 0%, rgba(16,185,129,0.09) 100%)',
              border: '1.5px solid rgba(79,70,229,0.28)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-primary)' }}>
                {isBn
                  ? `নিট স্কোর: ${netScoreSoFar} / ${questions.length}`
                  : `Net Score: ${netScoreSoFar} / ${questions.length}`}
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>
                {isBn ? `সঠিক: ${correctSoFar}` : `Correct: ${correctSoFar}`} •{' '}
                {isBn ? `ভুল: ${wrongSoFar}` : `Wrong: ${wrongSoFar}`}
                {negRate > 0 ? ` • -${netPenaltySoFar}` : ''} • {overallAccuracyPct}%
              </div>
            </div>
            <button type="button" className="ev-btn ev-btn-primary ev-btn-sm" onClick={closeQuiz}>
              {isBn ? 'সম্পন্ন →' : 'Done →'}
            </button>
          </div>
        )}

        <div className="ev-quiz-layout">
          <div className="ev-card ev-question-card" style={{ padding: '16px' }}>
            {currentQ && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="ev-badge-pill ev-badge-indigo">#{currentIndex + 1}</span>
                    {cleanBoardBadge && <span className="ev-badge-pill ev-badge-warning">{cleanBoardBadge}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      className="ev-btn ev-btn-secondary ev-btn-sm"
                      onClick={() => setFlagged((p) => ({ ...p, [currentIndex]: !p[currentIndex] }))}
                    >
                      {flagged[currentIndex] ? (isBn ? 'মার্ককৃত' : 'Flagged') : isBn ? 'মার্ক' : 'Flag'}
                    </button>
                    <button
                      type="button"
                      className="ev-btn ev-btn-danger ev-btn-sm"
                      onClick={() => setReportOpen(!reportOpen)}
                    >
                      {isBn ? 'রিপোর্ট' : 'Report'}
                    </button>
                  </div>
                </div>

                {reportOpen && (
                  <div
                    style={{
                      marginTop: 12,
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
                      {isBn ? 'প্রশ্ন বা উত্তরে ভুল রিপোর্ট করো' : 'Report Question Error'}
                    </div>
                    <select className="ev-select" value={reportIssueType} onChange={(e) => setReportIssueType(e.target.value)}>
                      <option value="উত্তর ভুল আছে">{isBn ? 'উত্তর ভুল আছে' : 'Wrong Answer'}</option>
                      <option value="বানান বা টাইপিং ভুল">{isBn ? 'বানান বা টাইপিং ভুল' : 'Spelling / Typo'}</option>
                      <option value="ব্যাখ্যায় সমস্যা">{isBn ? 'ব্যাখ্যায় সমস্যা' : 'Explanation Issue'}</option>
                    </select>
                    <input
                      type="text"
                      className="ev-input"
                      placeholder={isBn ? 'সঠিক উত্তর বা মন্তব্য লেখো...' : 'Write correct answer or note...'}
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

                <div className="ev-question-text" style={{ whiteSpace: 'pre-line', marginTop: 12, marginBottom: 14 }}>
                  {trText(currentQ.q, language)}
                </div>

                <div className="ev-options-list">
                  {optionsArray.map((optText, optIdx) => {
                    const isSelected = answers[currentIndex] === optIdx;
                    let cls = '';
                    if (showAnswerState) {
                      if (optIdx === currentQ.ans) cls = 'is-correct';
                      else if (isSelected && optIdx !== currentQ.ans) cls = 'is-incorrect';
                    } else if (isSelected) {
                      cls = 'is-selected';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        disabled={submitted}
                        className={`ev-option-btn ${cls}`}
                        style={
                          !showAnswerState && isSelected
                            ? {
                                borderColor: '#4F46E5',
                                background: 'rgba(79, 70, 229, 0.09)',
                                boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.18)',
                              }
                            : undefined
                        }
                        onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }))}
                      >
                        <span
                          className="ev-option-key"
                          style={
                            !showAnswerState && isSelected
                              ? { background: '#4F46E5', color: '#FFFFFF', borderColor: '#4F46E5' }
                              : undefined
                          }
                        >
                          {optionLabels[optIdx] || optIdx + 1}
                        </span>
                        <span style={{ flex: 1, textAlign: 'left' }}>{optText}</span>
                        {showAnswerState && optIdx === currentQ.ans && <span>✓</span>}
                        {showAnswerState && isSelected && optIdx !== currentQ.ans && <span>✕</span>}
                      </button>
                    );
                  })}
                </div>

                {explanationText && (
                  <div className="ev-explanation-box" style={{ marginTop: 14 }}>
                    <strong>{isBn ? 'ব্যাখ্যা:' : 'Explanation:'}</strong> {explanationText}
                  </div>
                )}

                {/* Navigation Row — Single Clean Submit Action */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    marginTop: 18,
                    paddingTop: 14,
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    type="button"
                    className="ev-btn ev-btn-secondary"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  >
                    ← {trKey('prev_q', language)}
                  </button>

                  {!isLastQuestion ? (
                    <button
                      type="button"
                      className="ev-btn ev-btn-primary"
                      onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                    >
                      {trKey('next_q', language)} →
                    </button>
                  ) : !submitted ? (
                    <button
                      type="button"
                      className="ev-btn"
                      style={{ background: '#059669', color: '#FFFFFF', fontWeight: 800, border: 'none' }}
                      onClick={handleSubmitExam}
                    >
                      {trKey('submit_exam', language)}
                    </button>
                  ) : (
                    <button type="button" className="ev-btn ev-btn-primary" onClick={closeQuiz}>
                      {isBn ? 'সম্পন্ন ✓' : 'Finish ✓'}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="ev-card">
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>{trKey('question_palette', language)}</div>
            <div className="ev-palette-grid">
              {questions.map((q, idx) => {
                const chosen = answers[idx];
                const reveal = submitted || (instantFeedback && chosen !== undefined);
                let dotCls = '';
                if (reveal) {
                  dotCls = chosen === q.ans ? 'is-correct' : chosen !== undefined ? 'is-incorrect' : '';
                } else if (idx === currentIndex) {
                  dotCls = 'is-current';
                } else if (chosen !== undefined) {
                  dotCls = 'is-answered';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    className={`ev-palette-dot ${dotCls} ${flagged[idx] ? 'is-bookmarked' : ''}`}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            {!submitted ? (
              <button
                type="button"
                className="ev-btn"
                style={{ width: '100%', marginTop: 14, background: '#059669', color: '#FFFFFF', fontWeight: 800, border: 'none' }}
                onClick={handleSubmitExam}
              >
                {trKey('submit_exam', language)} ({answeredCount}/{questions.length})
              </button>
            ) : (
              <button type="button" className="ev-btn ev-btn-secondary" style={{ width: '100%', marginTop: 14 }} onClick={closeQuiz}>
                {isBn ? 'বন্ধ করো' : 'Close'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizRunnerModal;
