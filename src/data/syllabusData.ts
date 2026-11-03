import {
  ExamCategory,
  Subject,
  QuestionMCQ,
  QuestionCQ,
  RecommendedPack,
  AchievementBadge,
  LeaderboardEntry
} from '../types';

export const EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: 'ssc',
    name: 'SSC',
    nameBn: 'এসএসসি বোর্ড প্রস্তুতি',
    fullTitle: 'Secondary School Certificate (Class 9–10)',
    badge: 'NCTB Board',
    description: 'বিজ্ঞান, ব্যবসায় শিক্ষা ও মানবিক বিভাগের পূর্ণাঙ্গ অধ্যায়ভিত্তিক MCQ ও সৃজনশীল প্রস্তুতি।',
    subjects: ['physics', 'chemistry', 'math', 'biology', 'accounting', 'management', 'finance', 'marketing', 'economics', 'civics', 'history', 'sociology', 'bangla', 'english', 'ict', 'gk'],
    defaultNegativeMark: 0
  },
  {
    id: 'hsc',
    name: 'HSC',
    nameBn: 'এইচএসসি ১ম ও ২য় পত্র',
    fullTitle: 'Higher Secondary Certificate (Class 11–12)',
    badge: '1st & 2nd Paper',
    description: 'এইচএসসি বিজ্ঞান, কমার্স ও আর্টস বিভাগের ১ম ও ২য় পত্রের বোর্ড ও বহুপদী প্রশ্ন ব্যাংক।',
    subjects: ['physics', 'chemistry', 'math', 'biology', 'accounting', 'management', 'finance', 'marketing', 'economics', 'civics', 'history', 'logic', 'sociology', 'bangla', 'english', 'ict'],
    defaultNegativeMark: 0
  },
  {
    id: 'uni',
    name: 'University Admission',
    nameBn: 'বিশ্ববিদ্যালয় ভর্তি (ক, খ, গ ইউনিট)',
    fullTitle: 'DU, JU, RU, CU & GST Cluster Admission',
    badge: 'A, B, C & GST Units',
    description: 'ঢাকা বিশ্ববিদ্যালয় ও গুচ্ছ ভর্তি পরীক্ষার বিজ্ঞান (A), মানবিক (B) ও ব্যবসায় শিক্ষা (C) ইউনিট।',
    subjects: ['physics', 'chemistry', 'math', 'biology', 'accounting', 'management', 'finance', 'marketing', 'economics', 'civics', 'history', 'logic', 'sociology', 'bangla', 'english', 'ict', 'gk'],
    defaultNegativeMark: 0.25
  },
  {
    id: 'med',
    name: 'Medical Admission',
    nameBn: 'মেডিকেল ও ডেন্টাল ভর্তি',
    fullTitle: 'MBBS & BDS National Merit Track',
    badge: '-0.25 Negative Mark',
    description: 'জীববিজ্ঞান, রসায়ন, পদার্থবিজ্ঞান, ইংরেজি ও সাধারণ জ্ঞানের হাই-ইল্ড মেডিকেল প্রশ্ন ব্যাংক।',
    subjects: ['biology', 'chemistry', 'physics', 'english', 'gk'],
    defaultNegativeMark: 0.25
  },
  {
    id: 'eng',
    name: 'Engineering Admission',
    nameBn: 'ইঞ্জিনিয়ারিং ও প্রযুক্তি ভর্তি',
    fullTitle: 'BUET, CKRUET, BUTEX & MIST',
    badge: 'STEM Analytical',
    description: 'বুয়েট ও প্রকৌশল বিশ্ববিদ্যালয়ের গাণিতিক ও বিশ্লেষণধর্মী পদার্থ, রসায়ন ও উচ্চতর গণিত।',
    subjects: ['math', 'physics', 'chemistry', 'english', 'ict'],
    defaultNegativeMark: 0.25
  },
  {
    id: 'bcs',
    name: 'BCS Preliminary',
    nameBn: 'বিসিএস প্রিলিমিনারি (২০০ নম্বর)',
    fullTitle: 'Bangladesh Civil Service Cadre Preparation',
    badge: '-0.50 Negative Mark',
    description: 'বাংলা, ইংরেজি, বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী, গণিত, বিজ্ঞান, আইসিটি ও মানসিক দক্ষতা।',
    subjects: ['bangla', 'english', 'gk', 'math', 'ict', 'biology', 'physics', 'chemistry', 'economics', 'civics', 'history', 'sociology'],
    defaultNegativeMark: 0.5
  },
  {
    id: 'bank',
    name: 'Bank Jobs',
    nameBn: 'ব্যাংক জব প্রিপারেশন',
    fullTitle: 'Bangladesh Bank & Combined Banks',
    badge: 'Officer & Cash',
    description: 'ব্যাংক নিয়োগ পরীক্ষার গণিত, ইংরেজি, হিসাববিজ্ঞান, ফিন্যান্স, অর্থনীতি ও আইসিটি।',
    subjects: ['math', 'english', 'accounting', 'finance', 'management', 'economics', 'ict', 'gk', 'bangla'],
    defaultNegativeMark: 0.25
  },
  {
    id: 'gov',
    name: 'Government Jobs',
    nameBn: 'সরকারি চাকরি ও নিবন্ধন',
    fullTitle: 'NTRCA, Primary & Ministry Recruitment',
    badge: '9th–16th Grade',
    description: 'শিক্ষক নিবন্ধন, প্রাথমিক সহকারী শিক্ষক ও বিভিন্ন মন্ত্রণালয়ের নিয়োগ পরীক্ষা।',
    subjects: ['bangla', 'english', 'math', 'gk', 'ict', 'economics', 'civics', 'history', 'biology'],
    defaultNegativeMark: 0.25
  },
  {
    id: 'gk',
    name: 'General Knowledge',
    nameBn: 'সাধারণ জ্ঞান ও সাম্প্রতিক',
    fullTitle: 'Bangladesh, Geopolitics & Current Affairs',
    badge: 'Verified Facts',
    description: 'ভাষা আন্দোলন, মুক্তিযুদ্ধ, সংবিধান, অর্থনীতি, ভূ-রাজনীতি ও আন্তর্জাতিক সংস্থা।',
    subjects: ['gk', 'history', 'civics', 'economics', 'sociology', 'ict', 'bangla', 'english'],
    defaultNegativeMark: 0
  }
];

/* 17 Complete Subjects Organized by Group: Science (4), Commerce (4), Arts (5), Common (4) */
export const SUBJECTS: Subject[] = [
  /* ==================== 1. SCIENCE GROUP (বিজ্ঞান বিভাগ — ৪টি বিষয়) ==================== */
  {
    id: 'physics',
    name: 'Physics (1st & 2nd Paper)',
    nameBn: 'পদার্থবিজ্ঞান (১ম ও ২য় পত্র)',
    group: 'Science',
    color: '#4F46E5',
    bgSoft: 'rgba(79,70,229,0.1)',
    borderColor: 'rgba(79,70,229,0.28)',
    tagBn: 'বিজ্ঞান • Science',
    chapters: [
      { id: 'phy-1', paper: '1st Paper', title: 'Vectors & Classical Mechanics', titleBn: 'ভেক্টর ও নিউটনিয়ান বলবিদ্যা (১ম পত্র)', difficulty: 'Medium' },
      { id: 'phy-2', paper: '2nd Paper', title: 'Thermodynamics & Ideal Gas', titleBn: 'তাপগতিবিদ্যা ও আদর্শ গ্যাস (২য় পত্র)', difficulty: 'Hard' },
      { id: 'phy-3', paper: '2nd Paper', title: 'Current Electricity & Magnetism', titleBn: 'চল তড়িৎ ও চুম্বকত্ব (২য় পত্র)', difficulty: 'Medium' },
      { id: 'phy-4', paper: '2nd Paper', title: 'Modern Physics & Semiconductors', titleBn: 'আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স (২য় পত্র)', difficulty: 'Easy' }
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry (1st & 2nd Paper)',
    nameBn: 'রসায়ন (১ম ও ২য় পত্র)',
    group: 'Science',
    color: '#0D9488',
    bgSoft: 'rgba(13,148,136,0.1)',
    borderColor: 'rgba(13,148,136,0.28)',
    tagBn: 'বিজ্ঞান • Science',
    chapters: [
      { id: 'chem-1', paper: '1st Paper', title: 'Atomic Structure & Periodic Table', titleBn: 'পরমাণুর গঠন ও পর্যায় সারণি (১ম পত্র)', difficulty: 'Easy' },
      { id: 'chem-2', paper: '1st Paper', title: 'Chemical Equilibrium & Buffer pH', titleBn: 'রাসায়নিক সাম্যবস্থা ও বাফার দ্রবণ (১ম পত্র)', difficulty: 'Medium' },
      { id: 'chem-3', paper: '2nd Paper', title: 'Organic Chemistry & Hydrocarbons', titleBn: 'জৈব রসায়ন ও হাইড্রোকার্বন (২য় পত্র)', difficulty: 'Hard' },
      { id: 'chem-4', paper: '2nd Paper', title: 'Electrochemistry & Quantitative Analysis', titleBn: 'তড়িৎ রসায়ন ও পরিমাণগত রসায়ন (২য় পত্র)', difficulty: 'Medium' }
    ]
  },
  {
    id: 'math',
    name: 'Higher Mathematics (1st & 2nd)',
    nameBn: 'উচ্চতর গণিত (১ম ও ২য় পত্র)',
    group: 'Science',
    color: '#E11D48',
    bgSoft: 'rgba(225,29,72,0.1)',
    borderColor: 'rgba(225,29,72,0.28)',
    tagBn: 'বিজ্ঞান • Science',
    chapters: [
      { id: 'math-1', paper: '1st Paper', title: 'Differential & Integral Calculus', titleBn: 'অন্তরীকরণ ও যোগজীকরণ (১ম পত্র)', difficulty: 'Hard' },
      { id: 'math-2', paper: '1st Paper', title: 'Matrices, Determinants & Vectors', titleBn: 'ম্যাট্রিক্স, নির্ণায়ক ও ভেক্টর (১ম পত্র)', difficulty: 'Easy' },
      { id: 'math-3', paper: '2nd Paper', title: 'Trigonometry & Complex Numbers', titleBn: 'ত্রিকোণমিতি ও জটিল সংখ্যা (২য় পত্র)', difficulty: 'Medium' },
      { id: 'math-4', paper: '2nd Paper', title: 'Combinatorics, Probability & Conics', titleBn: 'বিন্যাস, সমাবেশ ও সম্ভাব্যতা (২য় পত্র)', difficulty: 'Medium' }
    ]
  },
  {
    id: 'biology',
    name: 'Biology (Botany & Zoology)',
    nameBn: 'জীববিজ্ঞান (১ম ও ২য় পত্র)',
    group: 'Science',
    color: '#16A34A',
    bgSoft: 'rgba(22,163,74,0.1)',
    borderColor: 'rgba(22,163,74,0.28)',
    tagBn: 'বিজ্ঞান • Science',
    chapters: [
      { id: 'bio-1', paper: '1st Paper', title: 'Cell Structure, Division & Biochemistry', titleBn: 'কোষ ও এর গঠন এবং কোষ বিভাজন (১ম পত্র)', difficulty: 'Easy' },
      { id: 'bio-2', paper: '2nd Paper', title: 'Human Physiology: Blood & Circulation', titleBn: 'মানব শারীরতত্ত্ব: রক্ত ও সঞ্চালন (২য় পত্র)', difficulty: 'Medium' },
      { id: 'bio-3', paper: '2nd Paper', title: 'Genetics, Evolution & Biotechnology', titleBn: 'জিনতত্ত্ব, বিবর্তন ও জীবপ্রযুক্তি (২য় পত্র)', difficulty: 'Hard' },
      { id: 'bio-4', paper: '1st Paper', title: 'Plant Physiology & Taxonomy', titleBn: 'উদ্ভিদ শারীরতত্ত্ব ও শ্রেণিবিন্যাস (১ম পত্র)', difficulty: 'Medium' }
    ]
  },

  /* ==================== 2. COMMERCE GROUP (ব্যবসায় শিক্ষা বিভাগ — ৪টি বিষয়) ==================== */
  {
    id: 'accounting',
    name: 'Accounting (1st & 2nd Paper)',
    nameBn: 'হিসাববিজ্ঞান (১ম ও ২য় পত্র)',
    group: 'Commerce',
    color: '#D97706',
    bgSoft: 'rgba(217,119,6,0.1)',
    borderColor: 'rgba(217,119,6,0.28)',
    tagBn: 'ব্যবসায় শিক্ষা • Commerce',
    chapters: [
      { id: 'acc-1', paper: '1st Paper', title: 'Accounting Equation, Double Entry & Trial Balance', titleBn: 'হিসাব সমীকরণ, দুতরফা দাখিলা ও রেওয়ামিল (১ম পত্র)', difficulty: 'Easy' },
      { id: 'acc-2', paper: '1st Paper', title: 'Financial Statements & Adjusting Entries', titleBn: 'আর্থিক বিবরণী ও সমন্বয় দাখিলা (১ম পত্র)', difficulty: 'Medium' },
      { id: 'acc-3', paper: '2nd Paper', title: 'Joint Stock Company Shares & Ratio Analysis', titleBn: 'যৌথ মূলধনী কোম্পানির শেয়ার ও অনুপাত বিশ্লেষণ (২য় পত্র)', difficulty: 'Hard' },
      { id: 'acc-4', paper: '2nd Paper', title: 'Cost Accounting, Inventory (FIFO) & Cash Flow', titleBn: 'উৎপাদন ব্যয় হিসাব ও মজুদ পণ্য (২য় পত্র)', difficulty: 'Medium' }
    ]
  },
  {
    id: 'management',
    name: 'Business Org. & Management',
    nameBn: 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা (১ম ও ২য় পত্র)',
    group: 'Commerce',
    color: '#7C3AED',
    bgSoft: 'rgba(124,58,237,0.1)',
    borderColor: 'rgba(124,58,237,0.28)',
    tagBn: 'ব্যবসায় শিক্ষা • Commerce',
    chapters: [
      { id: 'mgt-1', paper: '1st Paper', title: 'Sole Proprietorship, Partnership & Joint Stock', titleBn: 'এক মালিকানা, অংশীদারি ও যৌথ মূলধনী ব্যবসায় (১ম পত্র)', difficulty: 'Easy' },
      { id: 'mgt-2', paper: '1st Paper', title: 'Co-operative Society, State Enterprise & Ethics', titleBn: 'সমবায় সমিতি, রাষ্ট্রীয় ব্যবসায় ও মূল্যবোধ (১ম পত্র)', difficulty: 'Medium' },
      { id: 'mgt-3', paper: '2nd Paper', title: 'Principles of Management (Fayol & Taylor)', titleBn: 'ব্যবস্থাপনার নীতি ও বৈজ্ঞানিক ব্যবস্থাপনা (২য় পত্র)', difficulty: 'Medium' },
      { id: 'mgt-4', paper: '2nd Paper', title: 'Planning, Organizing, Leadership & Controlling', titleBn: 'পরিকল্পনা, সংগঠন, নেতৃত্ব ও নিয়ন্ত্রণ (২য় পত্র)', difficulty: 'Hard' }
    ]
  },
  {
    id: 'finance',
    name: 'Finance, Banking & Insurance',
    nameBn: 'ফিন্যান্স, ব্যাংকিং ও বিমা (১ম ও ২য় পত্র)',
    group: 'Commerce',
    color: '#0284C7',
    bgSoft: 'rgba(2,132,199,0.1)',
    borderColor: 'rgba(2,132,199,0.28)',
    tagBn: 'ব্যবসায় শিক্ষা • Commerce',
    chapters: [
      { id: 'fin-1', paper: '1st Paper', title: 'Time Value of Money (PV, FV & Rule of 72)', titleBn: 'অর্থের সময়মূল্য ও বার্ষিক বৃত্তি (১ম পত্র)', difficulty: 'Medium' },
      { id: 'fin-2', paper: '1st Paper', title: 'Capital Budgeting (NPV, IRR) & Cost of Capital', titleBn: 'মূলধন বাজেটিং ও মূলধন ব্যয় (১ম পত্র)', difficulty: 'Hard' },
      { id: 'fin-3', paper: '2nd Paper', title: 'Central Banking & Commercial Bank Operations', titleBn: 'কেন্দ্রীয় ব্যাংক ও বাণিজ্যিক ব্যাংকিং (২য় পত্র)', difficulty: 'Easy' },
      { id: 'fin-4', paper: '2nd Paper', title: 'Life, Marine & Fire Insurance Principles', titleBn: 'জীবন, নৌ ও অগ্নি বিমার মূলনীতি (২য় পত্র)', difficulty: 'Medium' }
    ]
  },
  {
    id: 'marketing',
    name: 'Production Mgt. & Marketing',
    nameBn: 'উৎপাদন ব্যবস্থাপনা ও বিপণন (১ম ও ২য় পত্র)',
    group: 'Commerce',
    color: '#EA580C',
    bgSoft: 'rgba(234,88,12,0.1)',
    borderColor: 'rgba(234,88,12,0.28)',
    tagBn: 'ব্যবসায় শিক্ষা • Commerce',
    chapters: [
      { id: 'mkt-1', paper: '1st Paper', title: 'Production, Utility (Form, Place, Time) & Productivity', titleBn: 'উৎপাদন, উপযোগ ও উৎপাদনশীলতা (১ম পত্র)', difficulty: 'Easy' },
      { id: 'mkt-2', paper: '1st Paper', title: 'Factors of Production, Scale & Plant Layout', titleBn: 'উৎপাদনের উপকরণ ও কারখানা বিন্যাস (১ম পত্র)', difficulty: 'Medium' },
      { id: 'mkt-3', paper: '2nd Paper', title: 'Marketing Mix (4Ps) & Market Segmentation', titleBn: 'বিপণন মিশ্রণ (4Ps) ও বাজার বিভক্তিকরণ (২য় পত্র)', difficulty: 'Easy' },
      { id: 'mkt-4', paper: '2nd Paper', title: 'Branding, Packaging, Advertising & Promotion', titleBn: 'ব্র্যান্ডিং, মোড়কীকরণ ও বিজ্ঞাপন (২য় পত্র)', difficulty: 'Medium' }
    ]
  },

  /* ==================== 3. ARTS / HUMANITIES GROUP (মানবিক বিভাগ — ৫টি বিষয়) ==================== */
  {
    id: 'economics',
    name: 'Economics (1st & 2nd Paper)',
    nameBn: 'অর্থনীতি (১ম ও ২য় পত্র)',
    group: 'Arts',
    color: '#059669',
    bgSoft: 'rgba(5,150,105,0.1)',
    borderColor: 'rgba(5,150,105,0.28)',
    tagBn: 'মানবিক • Arts',
    chapters: [
      { id: 'eco-1', paper: '1st Paper', title: 'Consumer Behavior, Demand-Supply & Elasticity', titleBn: 'চাহিদা, যোগান ও স্থিতিস্থাপকতা (১ম পত্র)', difficulty: 'Easy' },
      { id: 'eco-2', paper: '1st Paper', title: 'National Income (GDP/GNP), Inflation & Fiscal Policy', titleBn: 'জাতীয় আয়, মুদ্রাস্ফীতি ও রাজস্ব নীতি (১ম পত্র)', difficulty: 'Medium' },
      { id: 'eco-3', paper: '2nd Paper', title: 'Market Structure: Perfect Competition & Monopoly', titleBn: 'বাজার কাঠামো: পূর্ণ প্রতিযোগিতা ও একচেটিয়া বাজার', difficulty: 'Easy' },
      { id: 'eco-4', paper: '2nd Paper', title: 'Economy of Bangladesh: Agriculture, Industry & Trade', titleBn: 'বাংলাদেশের অর্থনীতি: কৃষি, শিল্প ও আন্তর্জাতিক বাণিজ্য (২য় পত্র)', difficulty: 'Medium' }
    ]
  },
  {
    id: 'civics',
    name: 'Civics & Good Governance',
    nameBn: 'পৌরনীতি ও সুশাসন (১ম ও ২য় পত্র)',
    group: 'Arts',
    color: '#4F46E5',
    bgSoft: 'rgba(79,70,229,0.1)',
    borderColor: 'rgba(79,70,229,0.28)',
    tagBn: 'মানবিক • Arts',
    chapters: [
      { id: 'civ-1', paper: '1st Paper', title: 'Good Governance, Rule of Law, Liberty & Equality', titleBn: 'সুশাসন, আইনের শাসন, স্বাধীনতা ও সাম্য (১ম পত্র)', difficulty: 'Easy' },
      { id: 'civ-2', paper: '1st Paper', title: 'Organs of Government, Constitution & Public Admin', titleBn: 'সরকার কাঠামো, সংবিধান ও জনপ্রশাসন (১ম পত্র)', difficulty: 'Medium' },
      { id: 'civ-3', paper: '2nd Paper', title: 'Political History of British India & Pakistan (1947–1971)', titleBn: 'ব্রিটিশ ভারত ও পাকিস্তান আমলের রাজনীতি (২য় পত্র)', difficulty: 'Medium' },
      { id: 'civ-4', paper: '2nd Paper', title: 'Constitutional Bodies of Bangladesh (EC, PSC, CAG, ACC)', titleBn: 'বাংলাদেশের সাংবিধানিক প্রতিষ্ঠানসমূহ (২য় পত্র)', difficulty: 'Hard' }
    ]
  },
  {
    id: 'history',
    name: 'History & Islamic History',
    nameBn: 'ইতিহাস ও ইসলামের ইতিহাস (১ম ও ২য় পত্র)',
    group: 'Arts',
    color: '#B45309',
    bgSoft: 'rgba(180,83,9,0.1)',
    borderColor: 'rgba(180,83,9,0.28)',
    tagBn: 'মানবিক • Arts',
    chapters: [
      { id: 'his-1', paper: '1st Paper', title: 'Ancient Janapadas of Bengal, Maurya, Gupta & Pala-Sena', titleBn: 'প্রাচীন বাংলার জনপদ, মৌর্য, গুপ্ত ও পাল-সেন যুগ (১ম পত্র)', difficulty: 'Easy' },
      { id: 'his-2', paper: '1st Paper', title: 'Sultanate, Mughal Subah Bangla & Battle of Plassey', titleBn: 'সুলতানি, মুঘল আমল ও পলাশীর যুদ্ধ (১ম পত্র)', difficulty: 'Medium' },
      { id: 'his-3', paper: 'Islamic Hist.', title: 'Prophetic Era, Khulafa-e-Rashidun & Abbasid Golden Age', titleBn: 'খোলাফায়ে রাশেদীন, উমাইয়া ও আব্বাসীয় যুগ', difficulty: 'Medium' },
      { id: 'his-4', paper: '2nd Paper', title: 'French Revolution, World Wars & 1971 Liberation War', titleBn: 'ফরাসি বিপ্লব, বিশ্বযুদ্ধ ও মহান মুক্তিযুদ্ধ (২য় পত্র)', difficulty: 'Hard' }
    ]
  },
  {
    id: 'logic',
    name: 'Logic (1st & 2nd Paper)',
    nameBn: 'যুক্তিবিদ্যা (১ম ও ২য় পত্র)',
    group: 'Arts',
    color: '#9333EA',
    bgSoft: 'rgba(147,51,234,0.1)',
    borderColor: 'rgba(147,51,234,0.28)',
    tagBn: 'মানবিক • Arts',
    chapters: [
      { id: 'log-1', paper: '1st Paper', title: 'Introduction to Logic, Terms, Propositions & Predicables', titleBn: 'যুক্তিবিদ্যার পরিচিতি, পদ, যুক্তিবাক্য ও বিধেয়ক (১ম পত্র)', difficulty: 'Easy' },
      { id: 'log-2', paper: '1st Paper', title: 'Deductive Inference, Syllogism & Venn Diagrams', titleBn: 'অবরোহ অনুমান, সহানুমান ও ভেন চিত্র (১ম পত্র)', difficulty: 'Hard' },
      { id: 'log-3', paper: '2nd Paper', title: 'Logical Definition, Logical Division & Classification', titleBn: 'যৌক্তিক সংজ্ঞা, যৌক্তিক বিভাগ ও শ্রেণিকরণ (২য় পত্র)', difficulty: 'Medium' },
      { id: 'log-4', paper: '2nd Paper', title: 'Inductive Logic, Hypothesis, Causation & Mill’s Methods', titleBn: 'আরোহ অনুমান, প্রকল্প, কার্যকারণ ও মিলের পদ্ধতি (২য় পত্র)', difficulty: 'Medium' }
    ]
  },
  {
    id: 'sociology',
    name: 'Sociology, Social Work & Geography',
    nameBn: 'সমাজবিজ্ঞান, সমাজকর্ম ও ভূগোল (১ম ও ২য় পত্র)',
    group: 'Arts',
    color: '#0284C7',
    bgSoft: 'rgba(2,132,199,0.1)',
    borderColor: 'rgba(2,132,199,0.28)',
    tagBn: 'মানবিক • Arts',
    chapters: [
      { id: 'soc-1', paper: 'Sociology', title: 'Origin of Sociology (Ibn Khaldun, Comte, Durkheim, Weber)', titleBn: 'সমাজবিজ্ঞানের উৎপত্তি, সংস্কৃতি ও সামাজিক স্তরবিন্যাস', difficulty: 'Easy' },
      { id: 'soc-2', paper: 'Sociology', title: 'Social Structure of Bangladesh & Wari-Bateshwar Archaeology', titleBn: 'বাংলাদেশের সমাজ ও সভ্যতা এবং প্রত্নতত্ত্ব', difficulty: 'Medium' },
      { id: 'soc-3', paper: 'Social Work', title: 'Basic & Auxiliary Methods of Social Work & NGOs', titleBn: 'সমাজকর্মের পদ্ধতি, সামাজিক আইন ও উন্নয়ন সংস্থা', difficulty: 'Easy' },
      { id: 'soc-4', paper: 'Geography', title: 'Geomorphology, River Systems of Bangladesh, Climate & GIS', titleBn: 'প্রাকৃতিক ভূগোল, নদ-নদী, জলবায়ু ও জিআইএস (GIS)', difficulty: 'Medium' }
    ]
  },

  /* ==================== 4. COMPULSORY / COMMON GROUP (আবশ্যিক ও সাধারণ — ৪টি বিষয়) ==================== */
  {
    id: 'bangla',
    name: 'Bangla Sahitya & Grammar',
    nameBn: 'বাংলা সাহিত্য ও ব্যাকরণ (১ম ও ২য় পত্র)',
    group: 'Common',
    color: '#E11D48',
    bgSoft: 'rgba(225,29,72,0.1)',
    borderColor: 'rgba(225,29,72,0.28)',
    tagBn: 'আবশ্যিক • Compulsory',
    chapters: [
      { id: 'bn-1', paper: '2nd Paper', title: 'ধ্বনিতত্ত্ব, সন্ধি ও প্রমিত বাংলা বানান রীতি', titleBn: 'ধ্বনিতত্ত্ব, সন্ধি ও প্রমিত বাংলা বানান (২য় পত্র)', difficulty: 'Easy' },
      { id: 'bn-2', paper: '2nd Paper', title: 'সমাস, কারক-বিভক্তি ও প্রকৃতি-প্রত্যয়', titleBn: 'সমাস, কারক-বিভক্তি ও প্রকৃতি-প্রত্যয় (২য় পত্র)', difficulty: 'Medium' },
      { id: 'bn-3', paper: '1st Paper', title: 'প্রাচীন ও মধ্যযুগের বাংলা সাহিত্য (চর্যাপদ ও মঙ্গলকাব্য)', titleBn: 'চর্যাপদ, শ্রীকৃষ্ণকীর্তন ও মঙ্গলকাব্য (১ম পত্র)', difficulty: 'Medium' },
      { id: 'bn-4', paper: '1st Paper', title: 'আধুনিক যুগের সাহিত্য: রবীন্দ্র-নজরুল ও মুক্তিযুদ্ধ', titleBn: 'আধুনিক বাংলা সাহিত্য ও মুক্তিযুদ্ধভিত্তিক রচনা (১ম পত্র)', difficulty: 'Easy' }
    ]
  },
  {
    id: 'english',
    name: 'English Language & Literature',
    nameBn: 'ইংরেজি ভাষা ও সাহিত্য (১ম ও ২য় পত্র)',
    group: 'Common',
    color: '#2563EB',
    bgSoft: 'rgba(37,99,235,0.1)',
    borderColor: 'rgba(37,99,235,0.28)',
    tagBn: 'আবশ্যিক • Compulsory',
    chapters: [
      { id: 'eng-1', paper: '2nd Paper', title: 'Parts of Speech, Clauses & Modifiers', titleBn: 'Parts of Speech, Clauses & Phrases', difficulty: 'Medium' },
      { id: 'eng-2', paper: '2nd Paper', title: 'Right Form of Verbs & Subject-Verb Agreement', titleBn: 'Subject-Verb Agreement & Conditional Sentences', difficulty: 'Easy' },
      { id: 'eng-3', paper: '1st Paper', title: 'English Literary Periods & Masterpieces', titleBn: 'Renaissance to Modern English Literature', difficulty: 'Hard' },
      { id: 'eng-4', paper: '1st & 2nd', title: 'High-Frequency Vocabulary & Idioms', titleBn: 'Synonyms, Antonyms & Idiomatic Usage', difficulty: 'Medium' }
    ]
  },
  {
    id: 'ict',
    name: 'ICT & Analytical Ability',
    nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
    group: 'Common',
    color: '#7C3AED',
    bgSoft: 'rgba(124,58,237,0.1)',
    borderColor: 'rgba(124,58,237,0.28)',
    tagBn: 'আবশ্যিক • Compulsory',
    chapters: [
      { id: 'ict-1', paper: 'Ch 3', title: 'Number Systems, Boolean Algebra & Logic Gates', titleBn: 'সংখ্যা পদ্ধতি, বুলিয়ান বীজগণিত ও লজিক গেট', difficulty: 'Easy' },
      { id: 'ict-2', paper: 'Ch 2', title: 'Networking, Cyber Security & Cloud Computing', titleBn: 'নেটওয়ার্কিং, সাইবার নিরাপত্তা ও ক্লাউড', difficulty: 'Medium' },
      { id: 'ict-3', paper: 'Ch 5–6', title: 'C Programming, Algorithms & DBMS SQL', titleBn: 'সি প্রোগ্রামিং, অ্যালগরিদম ও ডেটাবেজ (SQL)', difficulty: 'Hard' },
      { id: 'ict-4', paper: 'Aptitude', title: 'Analytical Puzzles, Coding-Decoding & Spatial Logic', titleBn: 'মানসিক দক্ষতা ও গাণিতিক বিশ্লেষণ', difficulty: 'Medium' }
    ]
  },
  {
    id: 'gk',
    name: 'Bangladesh & Global Affairs',
    nameBn: 'বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী (GK)',
    group: 'Common',
    color: '#059669',
    bgSoft: 'rgba(5,150,105,0.1)',
    borderColor: 'rgba(5,150,105,0.28)',
    tagBn: 'সাধারণ জ্ঞান • GK & BCS',
    chapters: [
      { id: 'gk-1', paper: 'Bangladesh', title: '1952 Language Movement to 1971 Liberation War', titleBn: 'ভাষা আন্দোলন থেকে ১৯৭১ মহান মুক্তিযুদ্ধ', difficulty: 'Easy' },
      { id: 'gk-2', paper: 'Bangladesh', title: 'Constitution of Bangladesh & State Organs', titleBn: 'বাংলাদেশের সংবিধান ও রাষ্ট্রীয় কাঠামো', difficulty: 'Hard' },
      { id: 'gk-3', paper: 'International', title: 'Global Organizations, Treaties & Geopolitics', titleBn: 'জাতিসংঘ, আন্তর্জাতিক সংস্থা ও ভূ-রাজনীতি', difficulty: 'Medium' },
      { id: 'gk-4', paper: 'Environment', title: 'Geography, Climate & Sustainable Development', titleBn: 'ভূগোল, জলবায়ু পরিবর্তন ও সুনীল অর্থনীতি', difficulty: 'Medium' }
    ]
  }
];

/* Complete Verified Question Bank Across All 17 Subjects & 68 Chapters */
export const QUESTIONS_MCQ: QuestionMCQ[] = [
  /* Physics */
  { id: 'q-phy-101', subjectId: 'physics', chapterId: 'phy-1', categories: ['hsc', 'uni', 'eng', 'ssc'], difficulty: 'Medium', questionType: 'standard', examTag: 'BUET / DU A-Unit • Physics 1st Paper', question: 'If the magnitude of the resultant of two equal forces $P$ acting at a point is also $P$, what is the angle $\\theta$ between them?', questionBn: 'কোনো বিন্দুতে ক্রিয়াশীল দুটি সমান বল $P$-এর লব্ধির মানও যদি $P$ হয়, তবে বলদ্বয়ের মধ্যবর্তী কোণ $\\theta$ কত?', options: ['60°', '90°', '120°', '180°'], correctIndex: 2, explanation: 'Using $R^2 = P^2 + Q^2 + 2PQ\\cos\\theta$ with $R=Q=P$, we get $\\cos\\theta = -1/2 \\Rightarrow \\theta = 120^\\circ$.' },
  { id: 'q-phy-105', subjectId: 'physics', chapterId: 'phy-1', categories: ['ssc', 'hsc', 'uni', 'eng'], difficulty: 'Medium', questionType: 'multi', examTag: 'Board Multi-Statement (বহুপদী)', question: 'For two non-zero vectors $\\vec{A}$ and $\\vec{B}$ acting at angle $\\theta$, which statements are true?', questionBn: 'পরস্পর $\\theta$ কোণে ক্রিয়াশীল দুটি অশূন্য ভেক্টর $\\vec{A}$ ও $\\vec{B}$-এর ক্ষেত্রে নিচের তথ্যগুলো লক্ষ্য করো:', statements: ['i. যদি $\\vec{A} \\cdot \\vec{B} = 0$ হয়, তবে ভেক্টরদ্বয় পরস্পর লম্ব', 'ii. যদি $|\\vec{A} \\times \\vec{B}| = 0$ হয়, তবে ভেক্টরদ্বয় পরস্পর সমান্তরাল', 'iii. স্কেলার গুণন বিনিময় সূত্র মেনে চলে ($\\vec{A} \\cdot \\vec{B} = \\vec{B} \\cdot \\vec{A}$)'], options: ['i ও ii', 'i ও iii', 'ii ও iii', 'i, ii ও iii'], correctIndex: 3, explanation: 'All three vector identities (i, ii, iii) are true.' },
  { id: 'q-phy-102', subjectId: 'physics', chapterId: 'phy-2', categories: ['hsc', 'uni', 'med', 'eng'], difficulty: 'Hard', questionType: 'standard', examTag: 'HSC / Medical • Thermodynamics', question: 'A Carnot engine operates between $327^\\circ\\text{C}$ and $27^\\circ\\text{C}$. What is its maximum thermal efficiency $\\eta$?', questionBn: 'একটি কার্নো ইঞ্জিন $327^\\circ\\text{C}$ ও $27^\\circ\\text{C}$ তাপমাত্রার মধ্যে কাজ করে। এর সর্বোচ্চ কর্মদক্ষতা কত?', options: ['45%', '50%', '60%', '75%'], correctIndex: 1, explanation: '$T_1 = 600\\text{ K}, T_2 = 300\\text{ K} \\Rightarrow \\eta = (1 - 300/600) \\times 100\\% = 50\\%$.' },
  { id: 'q-phy-103', subjectId: 'physics', chapterId: 'phy-3', categories: ['ssc', 'hsc', 'uni', 'bcs'], difficulty: 'Easy', questionType: 'standard', examTag: 'Current Electricity', question: 'Two resistors of $6\\,\\Omega$ and $12\\,\\Omega$ are connected in parallel across a $12\\text{ V}$ battery. What is the total current?', questionBn: '$6\\,\\Omega$ এবং $12\\,\\Omega$ রোধের দুটি তার সমান্তরালে $12\\text{ V}$ কোষের সাথে যুক্ত থাকলে মোট তড়িৎ প্রবাহ কত?', options: ['1.5 A', '2.0 A', '3.0 A', '4.0 A'], correctIndex: 2, explanation: '$R_{eq} = (6 \\times 12)/(6+12) = 4\\,\\Omega \\Rightarrow I = 12/4 = 3.0\\text{ A}$.' },
  { id: 'q-phy-104', subjectId: 'physics', chapterId: 'phy-4', categories: ['hsc', 'uni', 'eng'], difficulty: 'Easy', questionType: 'standard', examTag: 'Modern Physics', question: 'Which particle is the majority charge carrier in a p-type semiconductor?', questionBn: 'p-টাইপ অর্ধপরিবাহীতে (p-type semiconductor) গরিষ্ঠ আধান বাহক কোনটি?', options: ['Free Electrons', 'Positive Holes (হোল)', 'Neutrons', 'Positrons'], correctIndex: 1, explanation: 'Trivalent doping creates positive Holes as majority charge carriers in p-type semiconductors.' },

  /* Chemistry */
  { id: 'q-chem-201', subjectId: 'chemistry', chapterId: 'chem-1', categories: ['ssc', 'hsc', 'uni', 'med'], difficulty: 'Easy', questionType: 'standard', examTag: 'Atomic Structure', question: 'What is the ground-state outer electronic configuration of Chromium ($\\text{Cr}, Z = 24$)?', questionBn: 'ক্রোমিয়াম পরমাণুর ($\\text{Cr}, Z = 24$) সর্ববহিঃস্থ স্তরের সঠিক ইলেকট্রন বিন্যাস কোনটি?', options: ['3d⁴ 4s²', '3d⁵ 4s¹', '3d⁶ 4s⁰', '3d⁵ 4s²'], correctIndex: 1, explanation: 'Half-filled $3d^5$ subshell stability gives $[\\text{Ar}]\\,3d^5 4s^1$.' },
  { id: 'q-chem-202', subjectId: 'chemistry', chapterId: 'chem-2', categories: ['ssc', 'hsc', 'uni', 'med', 'bcs'], difficulty: 'Medium', questionType: 'standard', examTag: 'Chemical Equilibrium', question: 'What is the pH of a $0.005\\text{ M } \\text{H}_2\\text{SO}_4$ aqueous solution assuming complete dissociation?', questionBn: 'পূর্ণ বিয়োজিত অবস্থায় $0.005\\text{ M } \\text{H}_2\\text{SO}_4$ দ্রবণের pH মান কত?', options: ['1.5', '2.0', '2.3', '3.0'], correctIndex: 1, explanation: '$[\\text{H}^+] = 2 \\times 0.005 = 0.01 = 10^{-2}\\text{ M} \\Rightarrow \\text{pH} = 2.0$.' },
  { id: 'q-chem-203', subjectId: 'chemistry', chapterId: 'chem-3', categories: ['hsc', 'uni', 'med', 'eng'], difficulty: 'Hard', questionType: 'standard', examTag: 'Organic Chemistry', question: 'Which reagent distinguishes an aldehyde ($\\text{-CHO}$) from a ketone ($\\text{-CO-}$) via silver mirror formation?', questionBn: 'রৌপ্য দর্পণ পরীক্ষার মাধ্যমে অ্যালডিহাইড ও কিটোনের পার্থক্য নির্ণয়ে কোন বিকারক ব্যবহৃত হয়?', options: ['Lucas Reagent', 'Tollens’ Reagent (টলেন বিকারক)', 'Baeyer’s Reagent', 'Grignard Reagent'], correctIndex: 1, explanation: 'Ammoniacal silver nitrate (Tollens’ reagent) is reduced to metallic silver by aldehydes.' },
  { id: 'q-chem-204', subjectId: 'chemistry', chapterId: 'chem-4', categories: ['hsc', 'uni', 'eng'], difficulty: 'Medium', questionType: 'standard', examTag: 'Electrochemistry', question: 'How many coulombs of charge are in 1 Faraday ($1\\text{ F}$)?', questionBn: '১ ফ্যারাডে ($1\\text{ F}$) তড়িৎ চার্জের মান কত কুলম্ব?', options: ['6.022 × 10²³ C', '96,500 C (৯৬,৫০০ কুলম্ব)', '1.602 × 10⁻¹⁹ C', '9,650 C'], correctIndex: 1, explanation: '$1\\text{ F} \\approx 96,500\\text{ C/mol}$.' },

  /* Higher Math */
  { id: 'q-math-301', subjectId: 'math', chapterId: 'math-1', categories: ['hsc', 'uni', 'eng'], difficulty: 'Medium', questionType: 'standard', examTag: 'Calculus', question: 'Evaluate the limit: $\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}$.', questionBn: '$\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}$ এর মান কত?', options: ['0', '1', '5', '1/5'], correctIndex: 2, explanation: '$5 \\lim_{x \\to 0} \\frac{\\sin(5x)}{5x} = 5 \\times 1 = 5$.' },
  { id: 'q-math-302', subjectId: 'math', chapterId: 'math-2', categories: ['hsc', 'uni', 'eng'], difficulty: 'Easy', questionType: 'standard', examTag: 'Matrices', question: 'For what value of $k$ is the matrix $A = \\begin{bmatrix} k & 4 \\\\ 3 & 6 \\end{bmatrix}$ singular?', questionBn: '$k$-এর মান কত হলে $\\begin{bmatrix} k & 4 \\\\ 3 & 6 \\end{bmatrix}$ ম্যাট্রিক্সটি ব্যতিক্রমী (Singular) হবে?', options: ['1', '2', '3', '4'], correctIndex: 1, explanation: '$6k - 12 = 0 \\Rightarrow k = 2$.' },
  { id: 'q-math-303', subjectId: 'math', chapterId: 'math-3', categories: ['ssc', 'hsc', 'uni', 'bcs', 'bank'], difficulty: 'Medium', questionType: 'standard', examTag: 'Complex Numbers', question: 'If $\\omega$ is a complex cube root of unity, what is the value of $1 + \\omega + \\omega^2$?', questionBn: 'এককের একটি কাল্পনিক ঘনমূল $\\omega$ হলে, $1 + \\omega + \\omega^2$ এর মান কত?', options: ['-1', '0', '1', 'ω'], correctIndex: 1, explanation: 'Sum of the three cube roots of unity is always $0$.' },
  { id: 'q-math-304', subjectId: 'math', chapterId: 'math-4', categories: ['ssc', 'hsc', 'uni', 'bcs', 'bank', 'gov'], difficulty: 'Medium', questionType: 'standard', examTag: 'Probability', question: 'Two fair coins are tossed simultaneously. What is the probability of getting at least one Head?', questionBn: 'দুটি নিখুঁত মুদ্রা একত্রে নিক্ষেপ করলে কমপক্ষে একটি হেড (H) পাওয়ার সম্ভাবনা কত?', options: ['1/4', '1/2', '3/4', '1'], correctIndex: 2, explanation: 'Sample space $\{HH, HT, TH, TT\}$ gives $3/4$.' },

  /* Biology */
  { id: 'q-bio-401', subjectId: 'biology', chapterId: 'bio-1', categories: ['ssc', 'hsc', 'uni', 'med', 'bcs'], difficulty: 'Easy', questionType: 'standard', examTag: 'Cell Biology', question: 'Which organelle is known as the "Powerhouse of the Cell"?', questionBn: 'কোন অঙ্গাণুকে কোষের "শক্তিঘর" (Powerhouse of the Cell) বলা হয়?', options: ['Ribosome', 'Mitochondria (মাইটোকন্ড্রিয়া)', 'Golgi Body', 'Lysosome'], correctIndex: 1, explanation: 'Mitochondria generate ATP via aerobic cellular respiration.' },
  { id: 'q-bio-402', subjectId: 'biology', chapterId: 'bio-2', categories: ['ssc', 'hsc', 'uni', 'med'], difficulty: 'Medium', questionType: 'standard', examTag: 'Human Physiology', question: 'Which node acts as the natural pacemaker of the human heart?', questionBn: 'মানব হৃৎপিণ্ডের প্রাকৃতিক পেসমেকার (Natural Pacemaker) বলা হয় কোনটিকে?', options: ['AV Node', 'SA Node (সাইনো-অ্যাট্রিয়াল নোড)', 'Bundle of His', 'Purkinje Fibers'], correctIndex: 1, explanation: 'The Sinoatrial (SA) node initiates cardiac electrical impulses.' },
  { id: 'q-bio-403', subjectId: 'biology', chapterId: 'bio-3', categories: ['hsc', 'uni', 'med'], difficulty: 'Hard', questionType: 'standard', examTag: 'Genetics', question: 'What is the phenotypic ratio in Mendel’s monohybrid cross when a lethal gene is active?', questionBn: 'মারণ জিন (Lethal Gene)-এর প্রভাবে মেন্ডেলের মনোহাইব্রিড ক্রসের অনুপাত $3:1$ এর পরিবর্তে কত হয়?', options: ['1 : 2 : 1', '2 : 1', '9 : 7', '13 : 3'], correctIndex: 1, explanation: 'Homozygous dominant individuals die in utero, leaving a $2:1$ ratio.' },
  { id: 'q-bio-404', subjectId: 'biology', chapterId: 'bio-4', categories: ['hsc', 'uni', 'med'], difficulty: 'Medium', questionType: 'standard', examTag: 'Plant Physiology', question: 'In $C_4$ plants like maize and sugarcane, what is the first stable product of carbon fixation?', questionBn: '$C_4$ উদ্ভিদে (যেমন ভুট্টা, আখ) সালোকসংশ্লেষণের প্রথম স্থায়ী যৌগ কোনটি?', options: ['3-PGA', 'Oxaloacetic Acid — OAA (অক্সালো অ্যাসিটিক এসিড)', 'RuBP', 'Pyruvic Acid'], correctIndex: 1, explanation: '4-carbon Oxaloacetic Acid (OAA) is the first stable product in $C_4$ plants.' },

  /* Accounting */
  { id: 'q-acc-901', subjectId: 'accounting', chapterId: 'acc-1', categories: ['ssc', 'hsc', 'uni', 'bank'], difficulty: 'Easy', questionType: 'standard', examTag: 'Accounting Equation', question: 'Purchasing office equipment for Tk 45,000 in cash has what effect on the Accounting Equation ($A = L + OE$)?', questionBn: 'নগদে ৪৫,০০০ টাকার অফিস সরঞ্জাম ক্রয় করলে হিসাব সমীকরণে কী প্রভাব পড়বে?', options: ['One asset increases and another asset decreases (একটি সম্পদ বৃদ্ধি ও অপর সম্পদ হ্রাস)', 'Assets and Liabilities both increase', 'Owner’s Equity decreases', 'Total assets increase'], correctIndex: 0, explanation: 'Equipment (+Asset) increases and Cash (-Asset) decreases by the same amount.' },
  { id: 'q-acc-902', subjectId: 'accounting', chapterId: 'acc-2', categories: ['hsc', 'uni', 'bank'], difficulty: 'Medium', questionType: 'standard', examTag: 'Financial Statements', question: 'How is "Prepaid Insurance" (অগ্রিম বিমা সেলামি) classified on a classified Balance Sheet?', questionBn: 'আর্থিক অবস্থার বিবরণীতে "অগ্রিম বিমা সেলামি" কোন ধরনের হিসাব?', options: ['Current Liability', 'Current Asset (চলতি সম্পদ)', 'Operating Expense', 'Intangible Asset'], correctIndex: 1, explanation: 'Prepaid expenses provide future economic benefit within 1 year and are Current Assets.' },
  { id: 'q-acc-903', subjectId: 'accounting', chapterId: 'acc-3', categories: ['hsc', 'uni', 'bank'], difficulty: 'Hard', questionType: 'standard', examTag: 'Ratio Analysis', question: 'What is universally considered the ideal standard benchmark for the Current Ratio (চলতি অনুপাত)?', questionBn: 'একটি প্রতিষ্ঠানের আদর্শ "চলতি অনুপাত" (Current Ratio) কত ধরা হয়?', options: ['1 : 1', '2 : 1', '1 : 2', '3 : 1'], correctIndex: 1, explanation: 'A Current Ratio of $2:1$ is the standard benchmark for short-term solvency.' },
  { id: 'q-acc-904', subjectId: 'accounting', chapterId: 'acc-4', categories: ['hsc', 'uni', 'bank'], difficulty: 'Medium', questionType: 'standard', examTag: 'Cost & Inventory', question: 'Under the FIFO (First-In, First-Out) inventory method, how is ending inventory valued?', questionBn: 'FIFO (আগে আসলে আগে যাবে) পদ্ধতিতে সমাপনী মজুদ পণ্যের মূল্য কোন ক্রয়মূল্যে নির্ধারিত হয়?', options: ['Oldest purchase cost', 'Most recent purchase cost (সর্বশেষ ক্রয়মূল্যে)', 'Simple average', 'Zero value'], correctIndex: 1, explanation: 'Since oldest units are sold first under FIFO, ending inventory consists of the most recently purchased units.' },

  /* Business Org. & Management */
  { id: 'q-mgt-1101', subjectId: 'management', chapterId: 'mgt-1', categories: ['ssc', 'hsc', 'uni', 'bank'], difficulty: 'Easy', questionType: 'standard', examTag: 'Business Org.', question: 'What is the maximum number of partners allowed in a general partnership business under the 1932 Act?', questionBn: '১৯৩২ সালের অংশীদারি আইন অনুযায়ী সাধারণ অংশীদারি ব্যবসায় সর্বোচ্চ সদস্য সংখ্যা কতজন?', options: ['10 persons (১০ জন)', '20 persons (২০ জন)', '50 persons (৫০ জন)', 'Unlimited (অসীম)'], correctIndex: 1, explanation: 'Minimum is 2 and maximum is 20 partners (10 for banking).' },
  { id: 'q-mgt-1102', subjectId: 'management', chapterId: 'mgt-2', categories: ['hsc', 'uni'], difficulty: 'Medium', questionType: 'standard', examTag: 'Co-operative', question: 'What is the core voting principle of a Co-operative Society?', questionBn: 'সমবায় সমিতির ভোটাধিকারের মূলনীতি কোনটি?', options: ['One Share One Vote', 'One Member One Vote (এক ব্যক্তি এক ভোট)', 'Capital Vote', 'Director Vote'], correctIndex: 1, explanation: 'Co-operative societies follow democratic One Member One Vote.' },
  { id: 'q-mgt-1103', subjectId: 'management', chapterId: 'mgt-3', categories: ['hsc', 'uni', 'bank'], difficulty: 'Easy', questionType: 'standard', examTag: 'Management', question: 'Who is the Father of Modern Administrative Management?', questionBn: 'আধুনিক ব্যবস্থাপনার জনক ও ১৪টি নীতির প্রবক্তা কে?', options: ['F.W. Taylor', 'Henri Fayol (হেনরি ফেয়ল)', 'Elton Mayo', 'Peter Drucker'], correctIndex: 1, explanation: 'Henri Fayol is the Father of Modern Management.' },
  { id: 'q-mgt-1104', subjectId: 'management', chapterId: 'mgt-4', categories: ['hsc', 'uni'], difficulty: 'Medium', questionType: 'standard', examTag: 'Management', question: 'Which function bridges the gap between present status and future goals?', questionBn: 'ভবিষ্যৎ লক্ষ্যের সাথে বর্তমানের সেতুবন্ধন রচনা করে কোনটি?', options: ['Organizing', 'Planning (পরিকল্পনা)', 'Staffing', 'Directing'], correctIndex: 1, explanation: 'Planning bridges the gap between where we are and where we want to go.' },

  /* Finance, Banking & Insurance */
  { id: 'q-fin-1201', subjectId: 'finance', chapterId: 'fin-1', categories: ['ssc', 'hsc', 'uni', 'bank'], difficulty: 'Medium', questionType: 'standard', examTag: 'Rule of 72', question: 'By the Rule of 72, how many years will an investment take to double at 12% compound interest?', questionBn: '৭২ বিধি অনুযায়ী ১২% চক্রবৃদ্ধি সুদে আসল কত বছরে দ্বিগুণ হবে?', options: ['4 years', '6 years (৬ বছর)', '8 years', '12 years'], correctIndex: 1, explanation: '$n = 72 / 12 = 6$ years.' },
  { id: 'q-fin-1202', subjectId: 'finance', chapterId: 'fin-2', categories: ['hsc', 'uni', 'bank'], difficulty: 'Hard', questionType: 'standard', examTag: 'Capital Budgeting', question: 'At the Internal Rate of Return (IRR), what is the Net Present Value (NPV)?', questionBn: 'অভ্যন্তরীণ আয়ের হারে (IRR) প্রকল্পের নিট বর্তমান মূল্য (NPV) কত হয়?', options: ['Greater than 1', 'Exactly Zero (NPV = 0)', 'Initial Cost', 'Negative'], correctIndex: 1, explanation: 'IRR is the discount rate where $\\text{NPV} = 0$.' },
  { id: 'q-fin-1203', subjectId: 'finance', chapterId: 'fin-3', categories: ['ssc', 'hsc', 'uni', 'bank'], difficulty: 'Easy', questionType: 'standard', examTag: 'Banking', question: 'Which bank acts as the "Lender of Last Resort" in Bangladesh?', questionBn: 'বাংলাদেশে "ঋণদানের শেষ আশ্রয়স্থল" কোন ব্যাংক?', options: ['Sonali Bank', 'Bangladesh Bank (বাংলাদেশ ব্যাংক)', 'World Bank', 'Agrani Bank'], correctIndex: 1, explanation: 'Bangladesh Bank is the Central Bank and Lender of Last Resort.' },
  { id: 'q-fin-1204', subjectId: 'finance', chapterId: 'fin-4', categories: ['ssc', 'hsc', 'uni'], difficulty: 'Medium', questionType: 'standard', examTag: 'Insurance', question: 'Which insurance is NOT a "Contract of Indemnity"?', questionBn: 'কোন বিমা চুক্তিকে "ক্ষতিপূরণের চুক্তি" বলা হয় না?', options: ['Marine Insurance', 'Fire Insurance', 'Life Insurance (জীবন বিমা)', 'Motor Insurance'], correctIndex: 2, explanation: 'Life Insurance is not a contract of indemnity.' },

  /* Production Management & Marketing */
  { id: 'q-mkt-1301', subjectId: 'marketing', chapterId: 'mkt-1', categories: ['hsc', 'uni'], difficulty: 'Easy', questionType: 'standard', examTag: 'Production', question: 'Turning cotton into cloth creates which economic utility?', questionBn: 'তুলা থেকে কাপড় তৈরি কোন ধরনের উপযোগ সৃষ্টি করে?', options: ['Place Utility', 'Time Utility', 'Form Utility (রূপগত উপযোগ)', 'Possession Utility'], correctIndex: 2, explanation: 'Manufacturing changes physical form and creates Form Utility.' },
  { id: 'q-mkt-1302', subjectId: 'marketing', chapterId: 'mkt-2', categories: ['hsc', 'uni'], difficulty: 'Medium', questionType: 'standard', examTag: 'Production', question: 'Which factor of production is the active risk-bearer?', questionBn: 'উৎপাদনের কোন উপকরণটি ঝুঁকি গ্রহণকারী ও সমন্বয়কারী?', options: ['Land', 'Labor', 'Capital', 'Organization / Entrepreneurship (সংগঠন)'], correctIndex: 3, explanation: 'Organization coordinates all factors and bears risk.' },
  { id: 'q-mkt-1303', subjectId: 'marketing', chapterId: 'mkt-3', categories: ['hsc', 'uni', 'bank'], difficulty: 'Easy', questionType: 'standard', examTag: 'Marketing 4Ps', question: 'Who introduced the 4Ps of Marketing Mix?', questionBn: 'বিপণন মিশ্রণের "4Ps"-এর প্রবক্তা কে?', options: ['E. Jerome McCarthy (ই. জেরোম ম্যাককার্থি)', 'Adam Smith', 'Marshall', 'Ricardo'], correctIndex: 0, explanation: 'E. Jerome McCarthy introduced Product, Price, Place, Promotion.' },
  { id: 'q-mkt-1304', subjectId: 'marketing', chapterId: 'mkt-4', categories: ['hsc', 'uni'], difficulty: 'Medium', questionType: 'standard', examTag: 'Promotion', question: 'Paid non-personal presentation of goods or services by an identified sponsor is:', questionBn: 'অর্থের বিনিময়ে নৈর্ব্যক্তিকভাবে পণ্য বা সেবার তথ্য উপস্থাপনকে কী বলে?', options: ['Personal Selling', 'Advertising (বিজ্ঞাপন)', 'Publicity', 'Packaging'], correctIndex: 1, explanation: 'This is the standard definition of Advertising.' },

  /* Economics */
  { id: 'q-eco-1001', subjectId: 'economics', chapterId: 'eco-1', categories: ['hsc', 'uni', 'bcs', 'bank'], difficulty: 'Easy', questionType: 'standard', examTag: 'Microeconomics', question: 'For Giffen goods, what is the direction of the demand curve?', questionBn: 'গিফেন দ্রব্যের (Giffen Goods) ক্ষেত্রে দাম বাড়লে চাহিদার কী পরিবর্তন ঘটে?', options: ['Demand falls', 'Quantity demanded increases as price rises (দাম বাড়লে চাহিদা বাড়ে)', 'Remains zero', 'Horizontal'], correctIndex: 1, explanation: 'Giffen goods violate the Law of Demand due to a strong negative income effect.' },
  { id: 'q-eco-1002', subjectId: 'economics', chapterId: 'eco-2', categories: ['hsc', 'uni', 'bcs', 'bank', 'gov'], difficulty: 'Medium', questionType: 'standard', examTag: 'Macroeconomics', question: 'Which institution formulates Monetary Policy (মুদ্রানীতি) in Bangladesh?', questionBn: 'বাংলাদেশে মুদ্রাস্ফীতি নিয়ন্ত্রণে "মুদ্রানীতি" প্রণয়ন করে কোন সংস্থা?', options: ['Ministry of Finance', 'Bangladesh Bank (বাংলাদেশ ব্যাংক)', 'NBR', 'Planning Commission'], correctIndex: 1, explanation: 'Bangladesh Bank formulates and announces Monetary Policy.' },
  { id: 'q-eco-1003', subjectId: 'economics', chapterId: 'eco-3', categories: ['hsc', 'uni', 'bcs'], difficulty: 'Easy', questionType: 'standard', examTag: 'Market Structure', question: 'In which market structure is there a single seller with no close substitutes?', questionBn: 'কোন বাজারে কেবল একজন বিক্রেতা থাকে এবং পণ্যের কোনো নিকট পরিবর্তক থাকে না?', options: ['Perfect Competition', 'Monopoly (একচেটিয়া বাজার)', 'Oligopoly', 'Duopoly'], correctIndex: 1, explanation: 'Monopoly has a single seller and no close substitutes.' },
  { id: 'q-eco-1004', subjectId: 'economics', chapterId: 'eco-4', categories: ['ssc', 'hsc', 'uni', 'bcs', 'gk'], difficulty: 'Medium', questionType: 'standard', examTag: 'Bangladesh Economy', question: 'Which sector contributes the largest share to the GDP of Bangladesh?', questionBn: 'বাংলাদেশের মোট দেশজ উৎপাদনে (GDP) কোন খাতের অবদান সবচেয়ে বেশি?', options: ['Agriculture', 'Industry', 'Service Sector (সেবা খাত)', 'Mining'], correctIndex: 2, explanation: 'The Service Sector contributes over 51% to Bangladesh’s GDP.' },

  /* Civics & Good Governance */
  { id: 'q-civ-1401', subjectId: 'civics', chapterId: 'civ-1', categories: ['hsc', 'uni', 'bcs'], difficulty: 'Easy', questionType: 'standard', examTag: 'Civics 1st Paper', question: 'Which organization first introduced the term "Good Governance" in 1989?', questionBn: '১৯৮৯ সালে কোন সংস্থা সর্বপ্রথম "সুশাসন" প্রত্যয়টি ব্যবহার করে?', options: ['IMF', 'World Bank (বিশ্বব্যাংক)', 'UNESCO', 'WTO'], correctIndex: 1, explanation: 'The World Bank coined Good Governance in 1989.' },
  { id: 'q-civ-1402', subjectId: 'civics', chapterId: 'civ-2', categories: ['hsc', 'uni', 'bcs'], difficulty: 'Medium', questionType: 'standard', examTag: 'Rule of Law', question: 'Who popularized the constitutional doctrine of "Rule of Law"?', questionBn: '"আইনের শাসন" (Rule of Law) তত্ত্বের প্রধান প্রবক্তা কে?', options: ['Professor A.V. Dicey (এ. ভি. ডাইসি)', 'Hobbes', 'Bodin', 'Bentham'], correctIndex: 0, explanation: 'A.V. Dicey expounded the Rule of Law in 1885.' },
  { id: 'q-civ-1403', subjectId: 'civics', chapterId: 'civ-3', categories: ['ssc', 'hsc', 'uni', 'bcs'], difficulty: 'Easy', questionType: 'standard', examTag: 'Six Points', question: 'In which year was the historic Six-Point Programme presented?', questionBn: 'ঐতিহাসিক ৬ দফা দাবি কত সালে পেশ করা হয়?', options: ['1954', '1962', '1966 (১৯৬৬ সালে)', '1969'], correctIndex: 2, explanation: 'Presented in February 1966 in Lahore.' },
  { id: 'q-civ-1404', subjectId: 'civics', chapterId: 'civ-4', categories: ['hsc', 'uni', 'bcs'], difficulty: 'Hard', questionType: 'standard', examTag: 'Constitution', question: 'Under which Article of the Constitution is BPSC established?', questionBn: 'সংবিধানের কত নং অনুচ্ছেদে সরকারি কর্ম কমিশন (BPSC) গঠনের কথা বলা হয়েছে?', options: ['Article 118', 'Article 127', 'Article 137 (১৩৭ নং অনুচ্ছেদ)', 'Article 141A'], correctIndex: 2, explanation: 'Article 137 establishes BPSC.' },

  /* History & Islamic History */
  { id: 'q-his-1501', subjectId: 'history', chapterId: 'his-1', categories: ['ssc', 'hsc', 'uni', 'bcs'], difficulty: 'Easy', questionType: 'standard', examTag: 'Ancient Bengal', question: 'Which was the oldest Janapada of ancient Bengal?', questionBn: 'প্রাচীন বাংলার সবচেয়ে প্রাচীন জনপদ কোনটি?', options: ['Vanga', 'Pundra (পুণ্ড্র)', 'Samatata', 'Harikela'], correctIndex: 1, explanation: 'Pundra was the oldest Janapada with capital Pundranagara.' },
  { id: 'q-his-1502', subjectId: 'history', chapterId: 'his-2', categories: ['ssc', 'hsc', 'uni', 'bcs'], difficulty: 'Medium', questionType: 'standard', examTag: 'Mughal Bengal', question: 'Who established Dhaka as the capital of Bengal in 1610 CE?', questionBn: '১৬১০ খ্রিস্টাব্দে কে ঢাকায় বাংলার রাজধানী স্থাপন করেন?', options: ['Shaista Khan', 'Islam Khan Chishti (ইসলাম খান চিশতী)', 'Mir Jumla', 'Murshid Quli'], correctIndex: 1, explanation: 'Subahdar Islam Khan Chishti made Dhaka the capital in 1610 CE.' },
  { id: 'q-his-1503', subjectId: 'history', chapterId: 'his-3', categories: ['hsc', 'uni', 'bcs'], difficulty: 'Medium', questionType: 'standard', examTag: 'Islamic History', question: 'Who founded and expanded "Bayt al-Hikmah" in Baghdad?', questionBn: 'বাগদাদে "বায়তুল হিকমাহ" প্রতিষ্ঠা ও সম্প্রসারণ করেন কে?', options: ['Al-Mansur', 'Harun al-Rashid & Al-Ma’mun (হারুন-অর-রশিদ ও আল-মামুন)', 'Al-Mu’tasim', 'Al-Walid'], correctIndex: 1, explanation: 'Founded by Harun al-Rashid and expanded by Al-Ma’mun.' },
  { id: 'q-his-1504', subjectId: 'history', chapterId: 'his-4', categories: ['hsc', 'uni', 'bcs'], difficulty: 'Easy', questionType: 'standard', examTag: 'World History', question: 'What was the slogan of the 1789 French Revolution?', questionBn: '১৭৮৯ সালের ফরাসি বিপ্লবের মূল স্লোগান কী ছিল?', options: ['Peace, Land, Bread', 'Liberty, Equality, Fraternity (স্বাধীনতা, সাম্য, ভ্রাতৃত্ব)', 'Unity, Faith, Discipline', 'Blood and Iron'], correctIndex: 1, explanation: 'Liberty, Equality, Fraternity.' },

  /* Logic */
  { id: 'q-log-1601', subjectId: 'logic', chapterId: 'log-1', categories: ['hsc', 'uni'], difficulty: 'Easy', questionType: 'standard', examTag: 'Logic', question: 'Who is the Father of Formal Logic?', questionBn: 'যুক্তিবিদ্যার জনক কে?', options: ['Socrates', 'Plato', 'Aristotle (এরিস্টটল)', 'J.S. Mill'], correctIndex: 2, explanation: 'Aristotle is the Father of Logic.' },
  { id: 'q-log-1602', subjectId: 'logic', chapterId: 'log-2', categories: ['hsc', 'uni'], difficulty: 'Medium', questionType: 'standard', examTag: 'Syllogism', question: 'How many terms exist in a categorical syllogism?', questionBn: 'একটি আদর্শ নিরপেক্ষ সহানুমানে মোট কয়টি পদ থাকে?', options: ['2 terms', '3 terms (৩টি পদ)', '4 terms', '5 terms'], correctIndex: 1, explanation: 'Major, Minor, and Middle term (3 terms).' },
  { id: 'q-log-1603', subjectId: 'logic', chapterId: 'log-3', categories: ['hsc', 'uni'], difficulty: 'Medium', questionType: 'standard', examTag: 'Definition', question: 'Using metaphors in a logical definition causes which fallacy?', questionBn: 'যৌক্তিক সংজ্ঞায় রূপক শব্দ ব্যবহার করলে কোন অনুপপত্তি ঘটে?', options: ['Circular Definition', 'Figurative Definition (রূপক সংজ্ঞা অনুপপত্তি)', 'Negative Definition', 'Too Narrow'], correctIndex: 1, explanation: 'Figurative Definition fallacy.' },
  { id: 'q-log-1604', subjectId: 'logic', chapterId: 'log-4', categories: ['hsc', 'uni'], difficulty: 'Hard', questionType: 'standard', examTag: 'Induction', question: 'What is the formal ground of Scientific Induction?', questionBn: 'বৈজ্ঞানিক আরোহের আকারগত ভিত্তি কোনটি?', options: ['Observation', 'Law of Uniformity of Nature & Causation (প্রকৃতির নিয়মানুবর্তিতা ও কার্যকারণ)', 'Analogy', 'Hypothesis'], correctIndex: 1, explanation: 'Uniformity of Nature and Law of Causation.' },

  /* Sociology, Social Work & Geography */
  { id: 'q-soc-1701', subjectId: 'sociology', chapterId: 'soc-1', categories: ['hsc', 'uni', 'bcs'], difficulty: 'Easy', questionType: 'standard', examTag: 'Sociology', question: 'Who coined the term "Sociology" in 1839?', questionBn: '১৮৩৯ সালে "Sociology" শব্দটি কে প্রবর্তন করেন?', options: ['Ibn Khaldun', 'Auguste Comte (অগাস্ট কোঁৎ)', 'Durkheim', 'Max Weber'], correctIndex: 1, explanation: 'Auguste Comte coined Sociology in 1839.' },
  { id: 'q-soc-1702', subjectId: 'sociology', chapterId: 'soc-2', categories: ['hsc', 'uni', 'bcs'], difficulty: 'Medium', questionType: 'standard', examTag: 'Archaeology', question: 'In which district is Wari-Bateshwar located?', questionBn: 'প্রত্নতাত্ত্বিক স্থান "উয়ারী-বটেশ্বর" কোন জেলায় অবস্থিত?', options: ['Bogura', 'Narsingdi (নরসিংদী)', 'Naogaon', 'Cumilla'], correctIndex: 1, explanation: 'Wari-Bateshwar is in Narsingdi district.' },
  { id: 'q-soc-1703', subjectId: 'sociology', chapterId: 'soc-3', categories: ['hsc', 'uni'], difficulty: 'Easy', questionType: 'standard', examTag: 'Social Work', question: 'Which is a Basic Method of professional Social Work?', questionBn: 'পেশাদার সমাজকর্মের মৌলিক পদ্ধতি কোনটি?', options: ['Social Action', 'Social Casework (ব্যক্তি সমাজকর্ম)', 'Social Research', 'Social Admin'], correctIndex: 1, explanation: 'Social Casework is a primary basic method.' },
  { id: 'q-soc-1704', subjectId: 'sociology', chapterId: 'soc-4', categories: ['ssc', 'hsc', 'uni', 'bcs'], difficulty: 'Medium', questionType: 'standard', examTag: 'Geography', question: 'What does "GIS" stand for in geography?', questionBn: 'ভূগোলে ব্যবহৃত "GIS"-এর পূর্ণরূপ কী?', options: ['Global Internet System', 'Geographic Information System (ভৌগোলিক তথ্য ব্যবস্থা)', 'Geological Survey', 'Imaging Satellite'], correctIndex: 1, explanation: 'Geographic Information System.' },

  /* Compulsory: Bangla, English, ICT, GK */
  { id: 'q-bn-601', subjectId: 'bangla', chapterId: 'bn-1', categories: ['ssc', 'hsc', 'uni', 'bcs', 'bank', 'gov'], difficulty: 'Easy', questionType: 'standard', examTag: 'বাংলা ব্যাকরণ • সন্ধি', question: '"গবেষণা" (মনীষা/গবেষণা) শব্দের সঠিক সন্ধি বিচ্ছেদ কোনটি?', questionBn: '"গবেষণা" শব্দের সঠিক সন্ধি বিচ্ছেদ কোনটি?', options: ['গব + এষণা', 'গো + এষণা', 'গৌ + এষণা', 'গবে + ষণা'], correctIndex: 1, explanation: 'নিপাতনে সিদ্ধ ও স্বরসন্ধির নিয়মে গো + এষণা = গবেষণা।' },
  { id: 'q-bn-602', subjectId: 'bangla', chapterId: 'bn-2', categories: ['ssc', 'hsc', 'uni', 'bcs'], difficulty: 'Medium', questionType: 'standard', examTag: 'সমাস', question: '"উপকূল" ও "যথারীতি" কোন সমাসের উদাহরণ?', questionBn: '"উপকূল" ও "যথারীতি" কোন সমাসের উদাহরণ?', options: ['দ্বন্দ্ব সমাস', 'অব্যয়ীভাব সমাস', 'বহুব্রীহি সমাস', 'কর্মধারয় সমাস'], correctIndex: 1, explanation: 'পূর্বপদে অব্যয় যোগে অর্থের প্রাধান্য থাকলে অব্যয়ীভাব সমাস হয়।' },
  { id: 'q-bn-603', subjectId: 'bangla', chapterId: 'bn-3', categories: ['hsc', 'uni', 'bcs'], difficulty: 'Medium', questionType: 'standard', examTag: 'প্রাচীন যুগ', question: 'বাংলা ভাষা ও সাহিত্যের প্রাচীনতম নিদর্শন "চর্যাপদ" কে আবিষ্কার করেন?', questionBn: 'বাংলা সাহিত্যের প্রাচীনতম নিদর্শন "চর্যাপদ" ১৯০৭ সালে নেপালের রাজদরবার থেকে কে আবিষ্কার করেন?', options: ['ড. মুহম্মদ শহীদুল্লাহ', 'মহামহোপাধ্যায় হরপ্রসাদ শাস্ত্রী', 'ড. সুনীতিকুমার চট্টোপাধ্যায়', 'রবীন্দ্রনাথ ঠাকুর'], correctIndex: 1, explanation: '১৯০৭ সালে মহামহোপাধ্যায় হরপ্রসাদ শাস্ত্রী নেপালের রাজদরবারের গ্রন্থাগার থেকে চর্যাপদ আবিষ্কার করেন।' },
  { id: 'q-bn-604', subjectId: 'bangla', chapterId: 'bn-4', categories: ['ssc', 'hsc', 'uni', 'bcs', 'gov'], difficulty: 'Easy', questionType: 'standard', examTag: 'মুক্তিযুদ্ধ ও সাহিত্য', question: 'শওকত ওসমান রচিত মুক্তিযুদ্ধভিত্তিক উপন্যাস কোনটি?', questionBn: 'শওকত ওসমান রচিত মুক্তিযুদ্ধভিত্তিক বিখ্যাত উপন্যাস কোনটি?', options: ['ক্রীতদাসের হাসি', 'জাহান্নাম হইতে বিদায়', 'জননী', 'চৌরসন্ধি'], correctIndex: 1, explanation: '"জাহান্নাম হইতে বিদায়" শওকত ওসমানের মুক্তিযুদ্ধভিত্তিক উপন্যাস।' },
  { id: 'q-eng-501', subjectId: 'english', chapterId: 'eng-1', categories: ['ssc', 'hsc', 'uni', 'bcs', 'bank', 'med'], difficulty: 'Medium', questionType: 'standard', examTag: 'English Grammar', question: 'Identify the underlined clause: "I know the place where he was born."', questionBn: '"I know the place where he was born." — এখানে "where he was born" কোন ধরনের Clause?', options: ['Noun Clause', 'Adjective Clause', 'Adverbial Clause', 'Principal Clause'], correctIndex: 1, explanation: 'It modifies the antecedent noun "the place", functioning as an Adjective Clause.' },
  { id: 'q-eng-502', subjectId: 'english', chapterId: 'eng-2', categories: ['ssc', 'hsc', 'uni', 'bcs', 'bank'], difficulty: 'Easy', questionType: 'standard', examTag: 'Right Form of Verbs', question: 'Choose the correct sentence: "Neither the teacher nor the students ___ present."', questionBn: 'শূন্যস্থানে সঠিক Verb কোনটি বসবে: "Neither the teacher nor the students ___ present."', options: ['was', 'were', 'is', 'has been'], correctIndex: 1, explanation: 'With "Neither...nor", the verb agrees with the closer plural subject "students" -> "were".' },
  { id: 'q-eng-503', subjectId: 'english', chapterId: 'eng-3', categories: ['uni', 'bcs', 'bank'], difficulty: 'Hard', questionType: 'standard', examTag: 'English Literature', question: 'Who wrote the famous dramatic monologue "Ulysses"?', questionBn: 'বিখ্যাত কবিতা "Ulysses" কার লেখা?', options: ['Robert Browning', 'Alfred Lord Tennyson', 'John Keats', 'P.B. Shelley'], correctIndex: 1, explanation: 'Victorian Poet Laureate Alfred Lord Tennyson wrote "Ulysses".' },
  { id: 'q-eng-504', subjectId: 'english', chapterId: 'eng-4', categories: ['hsc', 'uni', 'bcs', 'bank'], difficulty: 'Medium', questionType: 'standard', examTag: 'Vocabulary', question: 'What is the synonym of the word "EPHEMERAL"?', questionBn: '"EPHEMERAL" (ক্ষণস্থায়ী) শব্দের সমার্থক শব্দ কোনটি?', options: ['Eternal', 'Transient (ক্ষণস্থায়ী)', 'Permanent', 'Perpetual'], correctIndex: 1, explanation: 'Ephemeral means short-lived or transient.' },
  { id: 'q-ict-801', subjectId: 'ict', chapterId: 'ict-1', categories: ['hsc', 'uni', 'bcs', 'bank'], difficulty: 'Easy', questionType: 'standard', examTag: 'ICT Ch-3', question: 'Which logic gate is known as a Universal Gate?', questionBn: 'নিচের কোনটি সার্বজনীন গেট (Universal Gate)?', options: ['AND ও OR', 'NAND ও NOR', 'XOR ও XNOR', 'NOT'], correctIndex: 1, explanation: 'NAND and NOR gates can implement any Boolean function.' },
  { id: 'q-ict-802', subjectId: 'ict', chapterId: 'ict-2', categories: ['hsc', 'uni', 'bcs'], difficulty: 'Medium', questionType: 'standard', examTag: 'ICT Ch-2', question: 'Which optical medium uses Total Internal Reflection of light to transmit data?', questionBn: 'আলোর পূর্ণ অভ্যন্তরীণ প্রতিফলন নীতিতে ডেটা স্থানান্তর করে কোনটি?', options: ['Coaxial Cable', 'Twisted Pair', 'Optical Fiber (অপটিক্যাল ফাইবার)', 'Bluetooth'], correctIndex: 2, explanation: 'Optical fiber transmits light pulses via total internal reflection.' },
  { id: 'q-ict-803', subjectId: 'ict', chapterId: 'ict-3', categories: ['hsc', 'uni', 'eng', 'bank'], difficulty: 'Hard', questionType: 'standard', examTag: 'DBMS & SQL', question: 'Which SQL command is a DDL (Data Definition Language) statement?', questionBn: 'নিচের কোনটি SQL-এর DDL (Data Definition Language) কমান্ড?', options: ['SELECT', 'INSERT', 'CREATE TABLE', 'UPDATE'], correctIndex: 2, explanation: 'CREATE, ALTER, DROP, and TRUNCATE are DDL commands.' },
  { id: 'q-ict-804', subjectId: 'ict', chapterId: 'ict-4', categories: ['bcs', 'bank', 'uni'], difficulty: 'Medium', questionType: 'standard', examTag: 'Analytical Ability', question: 'Find the next number in the series: 2, 6, 12, 20, 30, ___?', questionBn: 'ধারাটির পরবর্তী সংখ্যা কত: ২, ৬, ১২, ২০, ৩০, ___?', options: ['38', '40', '42 (৪২)', '44'], correctIndex: 2, explanation: 'Differences are +4, +6, +8, +10, +12 -> 30 + 12 = 42.' },
  { id: 'q-gk-701', subjectId: 'gk', chapterId: 'gk-1', categories: ['ssc', 'hsc', 'uni', 'med', 'bcs', 'bank', 'gov', 'gk'], difficulty: 'Easy', questionType: 'standard', examTag: 'Liberation War', question: 'Under which Sector was Dhaka during the 1971 Liberation War?', questionBn: '১৯৭১ সালের মহান মুক্তিযুদ্ধে ঢাকা কত নম্বর সেক্টরের অধীনে ছিল?', options: ['Sector 1', 'Sector 2 (২ নং সেক্টর)', 'Sector 3', 'Sector 11'], correctIndex: 1, explanation: 'Dhaka, Cumilla, Noakhali, and parts of Faridpur were in Sector 2.' },
  { id: 'q-gk-702', subjectId: 'gk', chapterId: 'gk-2', categories: ['uni', 'bcs', 'bank', 'gov', 'gk'], difficulty: 'Hard', questionType: 'standard', examTag: 'Constitution', question: 'On which date did the Constitution of Bangladesh come into force?', questionBn: 'বাংলাদেশের সংবিধান কবে থেকে কার্যকর হয়?', options: ['4 November 1972', '16 December 1972 (১৬ ডিসেম্বর ১৯৭২)', '26 March 1972', '10 April 1972'], correctIndex: 1, explanation: 'Adopted on 4 November 1972 and effective from 16 December 1972.' },
  { id: 'q-gk-703', subjectId: 'gk', chapterId: 'gk-3', categories: ['uni', 'bcs', 'bank', 'gk'], difficulty: 'Medium', questionType: 'standard', examTag: 'International', question: 'Where is the headquarters of the International Court of Justice (ICJ)?', questionBn: 'আন্তর্জাতিক বিচার আদালত (ICJ)-এর সদর দপ্তর কোথায়?', options: ['Geneva', 'The Hague, Netherlands (দ্য হেগ)', 'New York', 'Vienna'], correctIndex: 1, explanation: 'The Peace Palace in The Hague, Netherlands.' },
  { id: 'q-gk-704', subjectId: 'gk', chapterId: 'gk-4', categories: ['ssc', 'hsc', 'bcs', 'gk'], difficulty: 'Medium', questionType: 'standard', examTag: 'Environment', question: 'How many Sustainable Development Goals (SDGs) were adopted by the UN for 2030?', questionBn: 'জাতিসংঘ ঘোষিত টেকসই উন্নয়ন অভীষ্ট (SDG)-এ মোট কয়টি লক্ষ্যমাত্রা রয়েছে?', options: ['8 Goals', '15 Goals', '17 Goals (১৭টি লক্ষ্যমাত্রা)', '21 Goals'], correctIndex: 2, explanation: 'There are 17 SDGs and 169 targets for 2030.' }
];

export const CREATIVE_QUESTIONS: QuestionCQ[] = [
  {
    id: 'cq-phy-1',
    subjectId: 'physics',
    chapterId: 'phy-1',
    categories: ['ssc', 'hsc'],
    boardTag: 'Dhaka Board • Physics 1st Paper',
    title: 'নদী ও নৌকার আপেক্ষিক বেগ এবং লব্ধি ভেক্টর',
    stemBn: '১.৫ কিমি প্রশস্ত একটি নদীতে স্রোতের বেগ ঘণ্টায় ৪ কিমি ($u = 4\\text{ km/h}$)। দুইজন মাঝি রহিম ও করিম ঘণ্টায় ৮ কিমি ($v = 8\\text{ km/h}$) বেগে নৌকা চালিয়ে নদী পার হতে যাত্রা শুরু করল। রহিম ন্যূনতম সময়ে এবং করিম ন্যূনতম দূরত্বে অপর পাড়ে পৌঁছাতে চায়।',
    stemEn: 'A river is $1.5\\text{ km}$ wide with current $u = 4\\text{ km/h}$. Rahim and Karim row at $v = 8\\text{ km/h}$ for minimum time and minimum distance respectively.',
    parts: {
      ka: { marks: 1, label: 'ক) জ্ঞানমূলক (১ নম্বর)', question: 'বিপ্রতীপ ভেক্টর কাকে বলে?', answer: 'দুটি সমান্তরাল ভেক্টরের একটির মান অপরটির মানের বিপরীত বা ব্যস্তানুপাতিক হলে তাদেরকে পরস্পরের বিপ্রতীপ ভেক্টর বলে।' },
      kha: { marks: 2, label: 'খ) অনুধাবনমূলক (২ নম্বর)', question: 'গুণটানা নৌকার দড়ি যত লম্বা হয় নৌকা তত দ্রুত চলে কেন?', answer: 'দড়ি লম্বা হলে অনুভূমিকের সাথে কোণ $\\theta$ ছোট হয় এবং $\\cos\\theta$ বৃদ্ধি পায়, ফলে সম্মুখমুখী উপাংশ $F\\cos\\theta$ বৃদ্ধি পায়।' },
      ga: { marks: 3, label: 'গ) প্রয়োগমূলক (৩ নম্বর)', question: 'করিমকে স্রোতের সাথে কত কোণে নৌকা চালাতে হবে?', answer: 'সূত্র $\\cos\\alpha = -u/v = -4/8 = -0.5 = \\cos 120^\\circ \\Rightarrow \\alpha = 120^\\circ$।' },
      gha: { marks: 4, label: 'ঘ) উচ্চতর দক্ষতামূলক (৪ নম্বর)', question: 'রহিম ও করিমের মধ্যে কে আগে অপর পাড়ে পৌঁছাবে?', answer: 'রহিমের সময় $t_1 = 1.5 / 8 = 11.25\\text{ min}$ এবং করিমের সময় $t_2 = 1.5 / (8\\sin 120^\\circ) = 12.99\\text{ min}$। তাই রহিম ১.৭৪ মিনিট আগে পৌঁছাবে।' }
    }
  },
  {
    id: 'cq-acc-1',
    subjectId: 'accounting',
    chapterId: 'acc-1',
    categories: ['ssc', 'hsc'],
    boardTag: 'Comilla Board • Accounting 1st Paper',
    title: 'হিসাব সমীকরণে লেনদেনের প্রভাব ($A = L + OE$)',
    stemBn: 'জনাব রাফি নগদ ১,০০,০০০ টাকা এবং ৫০,০০০ টাকার অফিস সরঞ্জাম নিয়ে ব্যবসায় শুরু করেন। উক্ত মাসে ধারে সেবা প্রদান ৩০,০০০ টাকা; অফিস ভাড়া প্রদান ১০,০০০ টাকা; ব্যক্তিগত উত্তোলন ৫,০০০ টাকা।',
    stemEn: 'Mr. Rafi started a firm with Cash Tk 1,00,000 and Equipment Tk 50,000; credit service Tk 30,000; rent paid Tk 10,000; drawings Tk 5,000.',
    parts: {
      ka: { marks: 1, label: 'ক) জ্ঞানমূলক (১ নম্বর)', question: 'প্রারম্ভিক মূলধন কাকে বলে?', answer: 'ব্যবসায়ের শুরুতে মালিক যে নগদ অর্থ ও সম্পত্তি ব্যবসায় আনয়ন করেন তার সমষ্টিকে প্রারম্ভিক মূলধন বলে।' },
      kha: { marks: 2, label: 'খ) অনুধাবনমূলক (২ নম্বর)', question: '"সকল লেনদেনই ঘটনা, কিন্তু সকল ঘটনা লেনদেন নয়"—ব্যাখ্যা করো।', answer: 'কেবল অর্থের অঙ্কে পরিমাপযোগ্য এবং আর্থিক অবস্থার পরিবর্তনকারী ঘটনাই লেনদেন।' },
      ga: { marks: 3, label: 'গ) প্রয়োগমূলক (৩ নম্বর)', question: 'প্রারম্ভিক মূলধন ও নিট সেবা আয়ের পরিমাণ নির্ণয় করো।', answer: 'প্রারম্ভিক মূলধন = ১,৫০,০০০ টাকা এবং নিট সেবা আয় = ৩০,০০০ - ১০,০০০ = ২০,০০০ টাকা।' },
      gha: { marks: 4, label: 'ঘ) উচ্চতর দক্ষতামূলক (৪ নম্বর)', question: 'মাস শেষে $A = L + OE$ সমীকরণটি যাচাই করো।', answer: 'মোট সম্পদ $A = 85,000 + 30,000 + 50,000 = 1,65,000$ টাকা এবং মালিকানা স্বত্ব $OE = 1,65,000$ টাকা ($L=0$)।' }
    }
  }
];

export const RECOMMENDED_PACKS: RecommendedPack[] = [
  { id: 'pack-daily', title: 'ExamVerse Daily Merit Sprint', titleBn: 'ডেইলি মেরিট স্প্রিন্ট চ্যালেঞ্জ', subtitle: 'বিজ্ঞান, কমার্স, মানবিক ও সাধারণ জ্ঞানের সমন্বিত ৮টি প্রশ্ন', category: 'uni', subjectId: 'all', questionIds: ['q-phy-101', 'q-chem-201', 'q-math-301', 'q-bio-401', 'q-acc-901', 'q-eco-1001', 'q-bn-601', 'q-gk-701'], durationSec: 360, negativeMark: 0.25, xpReward: 150, badgeText: 'Daily Challenge' },
  { id: 'pack-science', title: 'Science STEM Model Set (বিজ্ঞান বিভাগ)', titleBn: 'বিজ্ঞান বিভাগ স্পেশাল মডেল টেস্ট', subtitle: 'পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত ও জীববিজ্ঞান', category: 'eng', subjectId: 'physics', questionIds: ['q-phy-101', 'q-phy-102', 'q-chem-201', 'q-chem-202', 'q-math-301', 'q-math-302', 'q-bio-401', 'q-bio-402'], durationSec: 360, negativeMark: 0.25, xpReward: 140, badgeText: 'Science • বিজ্ঞান' },
  { id: 'pack-commerce', title: 'Commerce & Banking Set (ব্যবসায় শিক্ষা)', titleBn: 'ব্যবসায় শিক্ষা ও ব্যাংক জব মডেল সেট', subtitle: 'হিসাববিজ্ঞান, ব্যবস্থাপনা, ফিন্যান্স ও মার্কেটিং', category: 'bank', subjectId: 'accounting', questionIds: ['q-acc-901', 'q-acc-903', 'q-mgt-1101', 'q-mgt-1103', 'q-fin-1201', 'q-fin-1203', 'q-mkt-1301', 'q-mkt-1303'], durationSec: 360, negativeMark: 0.25, xpReward: 130, badgeText: 'Commerce • কমার্স' },
  { id: 'pack-arts', title: 'Arts & BCS Comprehensive (মানবিক ও বিসিএস)', titleBn: 'মানবিক ও বিসিএস সমন্বিত মডেল টেস্ট', subtitle: 'অর্থনীতি, পৌরনীতি, ইতিহাস, যুক্তিবিদ্যা, সমাজবিজ্ঞান ও বাংলা', category: 'bcs', subjectId: 'economics', questionIds: ['q-eco-1001', 'q-eco-1002', 'q-civ-1401', 'q-civ-1403', 'q-his-1501', 'q-log-1601', 'q-soc-1701', 'q-gk-701'], durationSec: 360, negativeMark: 0.5, xpReward: 135, badgeText: 'Arts & BCS' }
];

export const ACHIEVEMENTS: AchievementBadge[] = [
  { id: 'badge-first-step', title: 'First Meridian', titleBn: 'প্রথম পদক্ষেপ', description: 'প্রথম কুইজ বা পরীক্ষা সম্পন্ন করুন।', xpBonus: 50, tier: 'bronze' },
  { id: 'badge-streak-7', title: 'Septenary Flame', titleBn: '৭ দিনের ধারাবাহিকতা', description: 'টানা ৭ দিন পড়াশোনার স্ট্রিক বজায় রাখুন।', xpBonus: 150, tier: 'gold' },
  { id: 'badge-precision-90', title: 'Apex Precision', titleBn: 'নির্ভুল মেধা (৯০%+)', description: 'যেকোনো পরীক্ষায় ৯০% বা তার বেশি নির্ভুল উত্তর দিন।', xpBonus: 200, tier: 'gold' },
  { id: 'badge-centurion', title: 'Centurion Scholar', titleBn: 'মেধা চূড়া (Level 10)', description: 'লেভেল ১০ এবং ৪,৫০০+ XP অর্জন করুন।', xpBonus: 350, tier: 'gold' }
];

export const BENCHMARK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Nafis Rahman', handle: '@nafis_buet', avatar: 'NR', level: 18, xp: 3420, badge: 'Science • BUET' },
  { rank: 2, name: 'Tasnim Zara', handle: '@tasnim_dmc', avatar: 'TZ', level: 17, xp: 3190, badge: 'Science • Medical' },
  { rank: 3, name: 'Sadia Islam', handle: '@sadia_bcs', avatar: 'SI', level: 16, xp: 2810, badge: 'Arts • 47th BCS' },
  { rank: 4, name: 'Tanvir Ahmed', handle: '@tanvir_du', avatar: 'TA', level: 15, xp: 2490, badge: 'Commerce • DU C-Unit' },
  { rank: 5, name: 'Mahir Labib', handle: '@mahir_hsc', avatar: 'ML', level: 13, xp: 1950, badge: 'HSC Scholar' }
];

export function getSubjectQuestionCount(subjectId: string): number {
  return QUESTIONS_MCQ.filter((q) => q.subjectId === subjectId).length;
}

export function getChapterQuestionCount(chapterId: string): number {
  return QUESTIONS_MCQ.filter((q) => q.chapterId === chapterId).length;
}

export function getCategoryQuestionCount(categoryId: string): number {
  return QUESTIONS_MCQ.filter((q) => q.categories.includes(categoryId)).length;
}
