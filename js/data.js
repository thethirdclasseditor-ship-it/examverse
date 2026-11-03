/* ==========================================================================
   ExamVerse — Complete Bangladesh Syllabus, MCQ (Standard + Multi-Statement) & CQ Bank (js/data.js)
   Step 3 Expansion:
   - 10 Core Subjects covering Science, Business Studies, Humanities & BCS/Job Tracks
   - 40 Chapters across all 10 subjects (100% populated, 0 empty chapters)
   - Standard MCQs + Multi-Statement (বহুপদী সমাপ্তিসূচক i, ii, iii) MCQs + Stem-based MCQs
   - Creative Question (সৃজনশীল CQ) Bank with উদ্দীপক + ক (1), খ (2), গ (3), ঘ (4) & Model Answers
   ========================================================================== */

window.EXAMVERSE_DATA = {
  /* 9 National Exam Categories */
  examCategories: [
    {
      id: 'ssc',
      name: 'SSC',
      nameBn: 'এসএসসি (SSC)',
      fullTitle: 'Secondary School Certificate (Science, Humanities & Business)',
      badge: 'Class 9–10',
      description: 'Board syllabus chapter-wise MCQ (Standard & Multi-Statement i, ii, iii) and Creative Question (CQ) mastery.',
      subjects: ['physics', 'chemistry', 'math', 'biology', 'english', 'bangla', 'gk', 'ict', 'accounting', 'economics'],
      defaultNegativeMark: 0,
      iconType: 'book'
    },
    {
      id: 'hsc',
      name: 'HSC',
      nameBn: 'এইচএসসি (HSC)',
      fullTitle: 'Higher Secondary Certificate (1st & 2nd Paper)',
      badge: 'Class 11–12',
      description: '1st & 2nd Paper board standard MCQs, Multi-Statement questions, and 10-mark Creative Questions (CQ).',
      subjects: ['physics', 'chemistry', 'math', 'biology', 'english', 'bangla', 'ict', 'accounting', 'economics'],
      defaultNegativeMark: 0,
      iconType: 'layers'
    },
    {
      id: 'uni',
      name: 'University Admission',
      nameBn: 'বিশ্ববিদ্যালয় ভর্তি',
      fullTitle: 'DU (A, B, C Unit), JU, RU, CU & GST Cluster',
      badge: 'A, B & C Unit',
      description: 'Public university admission questions across Science (A), Humanities (B), and Business Studies (C) units.',
      subjects: ['physics', 'chemistry', 'math', 'biology', 'english', 'bangla', 'gk', 'ict', 'accounting', 'economics'],
      defaultNegativeMark: 0.25,
      iconType: 'cap'
    },
    {
      id: 'med',
      name: 'Medical Admission',
      nameBn: 'মেডিকেল ভর্তি পরীক্ষা',
      fullTitle: 'MBBS & BDS National Admission',
      badge: '-0.25 Negative Mark',
      description: 'High-precision Biology, Chemistry, Physics, English & GK practice with -0.25 negative-marking simulation.',
      subjects: ['biology', 'chemistry', 'physics', 'english', 'gk'],
      defaultNegativeMark: 0.25,
      iconType: 'dna'
    },
    {
      id: 'eng',
      name: 'Engineering Admission',
      nameBn: 'ইঞ্জিনিয়ারিং ভর্তি',
      fullTitle: 'BUET, CKRUET, MIST & IUT',
      badge: 'Preli & Analytical',
      description: 'Mathematical physics, calculus, vectors, and organic/inorganic chemistry problem sets.',
      subjects: ['math', 'physics', 'chemistry', 'english', 'ict'],
      defaultNegativeMark: 0.25,
      iconType: 'compass'
    },
    {
      id: 'bcs',
      name: 'BCS',
      nameBn: 'বিসিএস প্রিলিমিনারি',
      fullTitle: 'Bangladesh Civil Service Preliminary (200 Marks)',
      badge: '-0.50 Negative Mark',
      description: 'All 10 BCS Preliminary syllabus pillars with -0.50 negative marking in Exam Mode.',
      subjects: ['bangla', 'english', 'gk', 'math', 'ict', 'biology', 'physics', 'chemistry', 'economics'],
      defaultNegativeMark: 0.5,
      iconType: 'landmark'
    },
    {
      id: 'bank',
      name: 'Bank Jobs',
      nameBn: 'ব্যাংক জব প্রিপারেশন',
      fullTitle: 'Bangladesh Bank & Combined Banks (Officer & Cash)',
      badge: 'Officer & Cash',
      description: 'Quantitative aptitude, accounting & finance, analytical puzzles, high-level English, and ICT.',
      subjects: ['math', 'english', 'accounting', 'economics', 'ict', 'gk', 'bangla'],
      defaultNegativeMark: 0.25,
      iconType: 'briefcase'
    },
    {
      id: 'gov',
      name: 'Government Jobs',
      nameBn: 'সরকারি চাকরি প্রস্তুতি',
      fullTitle: 'NTRCA, Primary & Ministry Recruitment Exams',
      badge: '9th–16th Grade',
      description: 'Targeted preparation for teacher registration, directorate exams, and ministerial recruitment.',
      subjects: ['bangla', 'english', 'math', 'gk', 'ict', 'economics', 'biology'],
      defaultNegativeMark: 0.25,
      iconType: 'shield'
    },
    {
      id: 'gk',
      name: 'General Knowledge',
      nameBn: 'সাধারণ জ্ঞান ও সাম্প্রতিক',
      fullTitle: 'Bangladesh, International, Economics & Current Affairs',
      badge: 'Verified Facts',
      description: 'Liberation war history, constitution, geopolitics, economic surveys, and scientific discoveries.',
      subjects: ['gk', 'economics', 'ict', 'bangla', 'english'],
      defaultNegativeMark: 0,
      iconType: 'globe'
    }
  ],

  /* 10 Core Subjects Covering Science, Business Studies, Humanities & Job Prep (40 Chapters Total) */
  subjects: [
    {
      id: 'physics',
      name: 'Physics (1st & 2nd Paper)',
      nameBn: 'পদার্থবিজ্ঞান (১ম ও ২য় পত্র)',
      group: 'Science',
      icon: 'atom',
      accent: 'indigo',
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
      icon: 'flask',
      accent: 'violet',
      chapters: [
        { id: 'chem-1', paper: '1st Paper', title: 'Atomic Structure & Periodic Table', titleBn: 'পরমাণুর গঠন ও পর্যায় সারণি (১ম পত্র)', difficulty: 'Easy' },
        { id: 'chem-2', paper: '1st Paper', title: 'Chemical Equilibrium & Acids-Bases', titleBn: 'রাসায়নিক সাম্যবস্থা ও অম্ল-ক্ষারক (১ম পত্র)', difficulty: 'Medium' },
        { id: 'chem-3', paper: '2nd Paper', title: 'Organic Chemistry & Hydrocarbons', titleBn: 'জৈব রসায়ন ও হাইড্রোকার্বন (২য় পত্র)', difficulty: 'Hard' },
        { id: 'chem-4', paper: '2nd Paper', title: 'Electrochemistry & Quantitative Analysis', titleBn: 'তড়িৎ রসায়ন ও পরিমাণগত রসায়ন (২য় পত্র)', difficulty: 'Medium' }
      ]
    },
    {
      id: 'math',
      name: 'Higher Math & Aptitude',
      nameBn: 'উচ্চতর গণিত ও গাণিতিক যুক্তি',
      group: 'Science & Common',
      icon: 'sigma',
      accent: 'indigo',
      chapters: [
        { id: 'math-1', paper: '1st Paper', title: 'Differential & Integral Calculus', titleBn: 'অন্তরীকরণ ও যোগজীকরণ (১ম পত্র)', difficulty: 'Hard' },
        { id: 'math-2', paper: '1st Paper', title: 'Matrices, Determinants & Vectors', titleBn: 'ম্যাট্রিক্স, নির্ণায়ক ও ভেক্টর (১ম পত্র)', difficulty: 'Easy' },
        { id: 'math-3', paper: '2nd Paper', title: 'Trigonometry & Complex Numbers', titleBn: 'ত্রিকোণমিতি ও জটিল সংখ্যা (২য় পত্র)', difficulty: 'Medium' },
        { id: 'math-4', paper: '2nd Paper', title: 'Combinatorics, Probability & Aptitude', titleBn: 'বিন্যাস, সমাবেশ ও সম্ভাব্যতা (২য় পত্র)', difficulty: 'Medium' }
      ]
    },
    {
      id: 'biology',
      name: 'Biology (Botany & Zoology)',
      nameBn: 'জীববিজ্ঞান (১ম ও ২য় পত্র)',
      group: 'Science',
      icon: 'dna',
      accent: 'emerald',
      chapters: [
        { id: 'bio-1', paper: '1st Paper', title: 'Cell Structure, Division & Biochemistry', titleBn: 'কোষ ও এর গঠন এবং কোষ বিভাজন (১ম পত্র)', difficulty: 'Easy' },
        { id: 'bio-2', paper: '2nd Paper', title: 'Human Physiology: Blood & Circulation', titleBn: 'মানব শারীরতত্ত্ব: রক্ত ও সঞ্চালন (২য় পত্র)', difficulty: 'Medium' },
        { id: 'bio-3', paper: '2nd Paper', title: 'Genetics, Evolution & Biotechnology', titleBn: 'জিনতত্ত্ব, বিবর্তন ও জীবপ্রযুক্তি (২য় পত্র)', difficulty: 'Hard' },
        { id: 'bio-4', paper: '1st Paper', title: 'Plant Physiology & Taxonomy', titleBn: 'উদ্ভিদ শারীরতত্ত্ব ও শ্রেণিবিন্যাস (১ম পত্র)', difficulty: 'Medium' }
      ]
    },
    {
      id: 'english',
      name: 'English Language & Literature',
      nameBn: 'ইংরেজি ভাষা ও সাহিত্য',
      group: 'Common',
      icon: 'feather',
      accent: 'violet',
      chapters: [
        { id: 'eng-1', paper: '2nd Paper', title: 'Parts of Speech, Clauses & Modifiers', titleBn: 'Parts of Speech, Clauses & Phrases', difficulty: 'Medium' },
        { id: 'eng-2', paper: '2nd Paper', title: 'Right Form of Verbs & Subject-Verb Agreement', titleBn: 'Subject-Verb Agreement & Tense', difficulty: 'Easy' },
        { id: 'eng-3', paper: '1st Paper', title: 'English Literary Periods & Masterpieces', titleBn: 'Renaissance to Modern English Literature', difficulty: 'Hard' },
        { id: 'eng-4', paper: '1st & 2nd', title: 'High-Frequency Vocabulary & Idioms', titleBn: 'Synonyms, Antonyms & Idiomatic Usage', difficulty: 'Medium' }
      ]
    },
    {
      id: 'bangla',
      name: 'Bangla Sahitya & Grammar',
      nameBn: 'বাংলা সাহিত্য ও ব্যাকরণ (১ম ও ২য় পত্র)',
      group: 'Common',
      icon: 'scroll',
      accent: 'indigo',
      chapters: [
        { id: 'bn-1', paper: '2nd Paper', title: 'ধ্বনিতত্ত্ব, সন্ধি ও বানান রীতি (Phonology & Sandhi)', titleBn: 'ধ্বনিতত্ত্ব, সন্ধি ও প্রমিত বাংলা বানান (২য় পত্র)', difficulty: 'Easy' },
        { id: 'bn-2', paper: '2nd Paper', title: 'সমাস, কারক-বিভক্তি ও প্রত্যয় (Samas & Karaka)', titleBn: 'সমাস, কারক-বিভক্তি ও প্রকৃতি-প্রত্যয় (২য় পত্র)', difficulty: 'Medium' },
        { id: 'bn-3', paper: '1st Paper', title: 'প্রাচীন ও মধ্যযুগের বাংলা সাহিত্য (Ancient & Medieval)', titleBn: 'চর্যাপদ, শ্রীকৃষ্ণকীর্তন ও মঙ্গলকাব্য', difficulty: 'Medium' },
        { id: 'bn-4', paper: '1st Paper', title: 'আধুনিক যুগের সাহিত্য: রবীন্দ্র-নজরুল ও মুক্তিযুদ্ধ', titleBn: 'আধুনিক বাংলা সাহিত্য ও মুক্তিযুদ্ধভিত্তিক রচনা', difficulty: 'Easy' }
      ]
    },
    {
      id: 'gk',
      name: 'Bangladesh & Global Affairs',
      nameBn: 'বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী',
      group: 'Common & BCS',
      icon: 'globe',
      accent: 'emerald',
      chapters: [
        { id: 'gk-1', paper: 'Bangladesh', title: '1952 Language Movement to 1971 Liberation War', titleBn: 'ভাষা আন্দোলন থেকে ১৯৭১ মহান মুক্তিযুদ্ধ', difficulty: 'Easy' },
        { id: 'gk-2', paper: 'Bangladesh', title: 'Constitution of Bangladesh & State Organs', titleBn: 'বাংলাদেশের সংবিধান ও রাষ্ট্রীয় কাঠামো', difficulty: 'Hard' },
        { id: 'gk-3', paper: 'International', title: 'Global Organizations, Treaties & Geopolitics', titleBn: 'জাতিসংঘ, আন্তর্জাতিক সংস্থা ও ভূ-রাজনীতি', difficulty: 'Medium' },
        { id: 'gk-4', paper: 'Environment', title: 'Geography, Climate & Sustainable Development', titleBn: 'ভূগোল, জলবায়ু পরিবর্তন ও সুনীল অর্থনীতি', difficulty: 'Medium' }
      ]
    },
    {
      id: 'ict',
      name: 'ICT & Analytical Ability',
      nameBn: 'তথ্যপ্রযুক্তি ও মানসিক দক্ষতা',
      group: 'Common',
      icon: 'cpu',
      accent: 'violet',
      chapters: [
        { id: 'ict-1', paper: 'Ch 3', title: 'Number Systems, Boolean Algebra & Logic Gates', titleBn: 'সংখ্যা পদ্ধতি, বুলিয়ান বীজগণিত ও লজিক গেট', difficulty: 'Easy' },
        { id: 'ict-2', paper: 'Ch 2', title: 'Networking, Cyber Security & Cloud Computing', titleBn: 'নেটওয়ার্কিং, সাইবার নিরাপত্তা ও ক্লাউড', difficulty: 'Medium' },
        { id: 'ict-3', paper: 'Ch 5–6', title: 'C Programming, Algorithms & DBMS SQL', titleBn: 'সি প্রোগ্রামিং, অ্যালগরিদম ও ডেটাবেজ (SQL)', difficulty: 'Hard' },
        { id: 'ict-4', paper: 'Aptitude', title: 'Analytical Puzzles, Coding-Decoding & Spatial Logic', titleBn: 'মানসিক দক্ষতা ও গাণিতিক বিশ্লেষণ', difficulty: 'Medium' }
      ]
    },
    {
      id: 'accounting',
      name: 'Accounting & Finance',
      nameBn: 'হিসাববিজ্ঞান ও ফিন্যান্স (ব্যবসায় শিক্ষা)',
      group: 'Business Studies',
      icon: 'briefcase',
      accent: 'indigo',
      chapters: [
        { id: 'acc-1', paper: '1st Paper', title: 'Accounting Equation, Double Entry & Trial Balance', titleBn: 'হিসাব সমীকরণ, দুতরফা দাখিলা ও রেওয়ামিল (১ম পত্র)', difficulty: 'Easy' },
        { id: 'acc-2', paper: '1st Paper', title: 'Financial Statements & Adjusting Entries', titleBn: 'আর্থিক বিবরণী ও সমন্বয় দাখিলা (১ম পত্র)', difficulty: 'Medium' },
        { id: 'acc-3', paper: '2nd Paper', title: 'Joint Stock Company, Shares & Ratio Analysis', titleBn: 'যৌথ মূলধনী কোম্পানির মূলধন ও অনুপাত বিশ্লেষণ (২য় পত্র)', difficulty: 'Hard' },
        { id: 'acc-4', paper: 'Finance', title: 'Time Value of Money, Capital Budgeting & Banking', titleBn: 'অর্থের সময়মূল্য, মূলধন বাজেটিং ও কেন্দ্রীয় ব্যাংকিং', difficulty: 'Medium' }
      ]
    },
    {
      id: 'economics',
      name: 'Economics, Civics & History',
      nameBn: 'অর্থনীতি, পৌরনীতি ও ইতিহাস (মানবিক)',
      group: 'Humanities',
      icon: 'landmark',
      accent: 'emerald',
      chapters: [
        { id: 'eco-1', paper: '1st Paper', title: 'Consumer Behavior, Demand-Supply & Elasticity', titleBn: 'ভোক্তা ও উৎপাদকের আচরণ: চাহিদা, যোগান ও স্থিতিস্থাপকতা', difficulty: 'Easy' },
        { id: 'eco-2', paper: '1st Paper', title: 'National Income (GDP/GNP), Inflation & Fiscal Policy', titleBn: 'জাতীয় আয় (GDP/GNP), মুদ্রাস্ফীতি ও রাজস্ব নীতি', difficulty: 'Medium' },
        { id: 'eco-3', paper: 'Civics', title: 'Good Governance, Rule of Law & Public Administration', titleBn: 'পৌরনীতি ও সুশাসন: আইনের শাসন ও জনপ্রশাসন', difficulty: 'Easy' },
        { id: 'eco-4', paper: 'History', title: 'Bengal Sultanate, Mughal Era & British Colonial Reforms', titleBn: 'বাংলার ইতিহাস: সুলতানি, মুঘল ও ব্রিটিশ শাসনামল', difficulty: 'Medium' }
      ]
    }
  ],

  /* Verified Question Bank Covering All 40 Chapters (Includes Standard + Multi-Statement i, ii, iii MCQs) */
  questions: [
    /* --- PHYSICS (phy-1 to phy-4) --- */
    {
      id: 'q-phy-101',
      subjectId: 'physics',
      chapterId: 'phy-1',
      categories: ['hsc', 'uni', 'eng', 'ssc'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'BUET / DU A-Unit • Physics 1st Paper Ch-2',
      question: 'If the magnitude of the resultant of two forces of equal magnitude $P$ acting at a point is also $P$, what is the angle $\\theta$ between the two forces?',
      questionBn: 'কোনো বিন্দুতে ক্রিয়াশীল দুটি সমান বল $P$-এর লব্ধির মানও যদি $P$ হয়, তবে বলদ্বয়ের মধ্যবর্তী কোণ $\\theta$ কত?',
      options: ['60°', '90°', '120°', '180°'],
      correctIndex: 2,
      explanation: 'Using the parallelogram law of vectors: $R^2 = P^2 + Q^2 + 2PQ\\cos\\theta$. Since $R = P$ and $Q = P$, we have $P^2 = P^2 + P^2 + 2P^2\\cos\\theta \\Rightarrow \\cos\\theta = -1/2 \\Rightarrow \\theta = 120^\\circ$.'
    },
    {
      id: 'q-phy-105',
      subjectId: 'physics',
      chapterId: 'phy-1',
      categories: ['ssc', 'hsc', 'uni', 'eng'],
      difficulty: 'Medium',
      questionType: 'multi',
      examTag: 'Board Multi-Statement (বহুপদী) • Physics 1st Paper',
      question: 'For two non-zero vectors $\\vec{A}$ and $\\vec{B}$ acting at an angle $\\theta$, which of the following statements are true?',
      questionBn: 'পরস্পর $\\theta$ কোণে ক্রিয়াশীল দুটি অশূন্য ভেক্টর $\\vec{A}$ ও $\\vec{B}$-এর ক্ষেত্রে নিচের তথ্যগুলো লক্ষ্য করো:',
      statements: [
        'i. যদি $\\vec{A} \\cdot \\vec{B} = 0$ হয়, তবে ভেক্টরদ্বয় পরস্পর লম্ব ($\\theta = 90^\\circ$) / If $\\vec{A} \\cdot \\vec{B} = 0$, the vectors are perpendicular',
        'ii. যদি $|\\vec{A} \\times \\vec{B}| = 0$ হয়, তবে ভেক্টরদ্বয় পরস্পর সমান্তরাল / If $|\\vec{A} \\times \\vec{B}| = 0$, the vectors are parallel',
        'iii. স্কেলার গুণন বিনিময় সূত্র মেনে চলে ($\vec{A} \\cdot \\vec{B} = \\vec{B} \\cdot \\vec{A}$) / Dot product obeys the commutative law'
      ],
      options: ['i ও ii (i & ii)', 'i ও iii (i & iii)', 'ii ও iii (ii & iii)', 'i, ii ও iii (i, ii & iii)'],
      correctIndex: 3,
      explanation: 'All three statements (i, ii, and iii) are fundamental vector identities: $\\vec{A}\\cdot\\vec{B} = AB\\cos 90^\\circ = 0$ when perpendicular; $|\\vec{A}\\times\\vec{B}| = AB\\sin 0^\\circ = 0$ when parallel; and scalar dot product is commutative.'
    },
    {
      id: 'q-phy-102',
      subjectId: 'physics',
      chapterId: 'phy-2',
      categories: ['hsc', 'uni', 'med', 'eng'],
      difficulty: 'Hard',
      questionType: 'standard',
      examTag: 'HSC / Medical • Physics 2nd Paper Ch-1',
      question: 'A Carnot heat engine operates between a source at $327^\\circ\\text{C}$ and a sink at $27^\\circ\\text{C}$. What is the maximum thermal efficiency ($\\eta$) of this engine?',
      questionBn: 'একটি কার্নো ইঞ্জিন $327^\\circ\\text{C}$ তাপমাত্রার উৎস এবং $27^\\circ\\text{C}$ তাপমাত্রার গ্রাহকের মধ্যে কাজ করে। ইঞ্জিনটির সর্বোচ্চ কর্মদক্ষতা ($\\eta$) কত?',
      options: ['45%', '50%', '60%', '75%'],
      correctIndex: 1,
      explanation: 'Convert temperatures to Kelvin first: $T_1 = 327 + 273 = 600\\text{ K}$ and $T_2 = 27 + 273 = 300\\text{ K}$. Carnot efficiency $\\eta = (1 - T_2 / T_1) \\times 100\\% = (1 - 300 / 600) \\times 100\\% = 50\\%$.'
    },
    {
      id: 'q-phy-103',
      subjectId: 'physics',
      chapterId: 'phy-3',
      categories: ['ssc', 'hsc', 'uni', 'bcs'],
      difficulty: 'Easy',
      questionType: 'standard',
      examTag: 'SSC / HSC • Current Electricity Ch-3',
      question: 'Three resistors of $6\\text{ }\\Omega$ each are connected in parallel across a $12\\text{ V}$ ideal battery. What is the total current drawn from the battery?',
      questionBn: '$6\\text{ }\\Omega$ মানের তিনটি রোধ সমান্তরালে যুক্ত করে $12\\text{ V}$ তড়িৎচালক শক্তির আদর্শ কোষে যুক্ত করলে বর্তনীর মূল প্রবাহ কত হবে?',
      options: ['2 A', '4 A', '6 A', '18 A'],
      correctIndex: 2,
      explanation: 'For three identical $6\\text{ }\\Omega$ resistors in parallel, equivalent resistance $R_{eq} = 6 / 3 = 2\\text{ }\\Omega$. By Ohm’s law, total current $I = V / R_{eq} = 12\\text{ V} / 2\\text{ }\\Omega = 6\\text{ A}$.'
    },
    {
      id: 'q-phy-104',
      subjectId: 'physics',
      chapterId: 'phy-4',
      categories: ['hsc', 'uni', 'eng'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'Engineering & DU • Modern Physics Ch-9',
      question: 'The half-life of a radioactive isotope is 15 days. How many days will it take for 87.5% of the initial sample to decay?',
      questionBn: 'একটি তেজস্ক্রিয় মৌলের অর্ধায়ু ১৫ দিন। মৌলটির প্রারম্ভিক পরিমাণের ৮৭.৫% ক্ষয় হতে কত দিন সময় লাগবে?',
      options: ['30 days', '45 days', '60 days', '75 days'],
      correctIndex: 1,
      explanation: 'If 87.5% decays, the remaining undecayed fraction is $12.5\\% = 1/8 = (1/2)^3$ of the original sample. That requires 3 half-lives: $t = 3 \\times T_{1/2} = 3 \\times 15 = 45\\text{ days}$.'
    },

    /* --- CHEMISTRY (chem-1 to chem-4) --- */
    {
      id: 'q-chem-202',
      subjectId: 'chemistry',
      chapterId: 'chem-1',
      categories: ['hsc', 'uni', 'med', 'eng'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'DU / Medical • Chemistry 1st Paper Ch-3',
      question: 'Which of the following species has an $sp^3d^2$ hybridization and a regular octahedral molecular geometry?',
      questionBn: 'নিচের কোন যৌগটিতে $sp^3d^2$ সংকরায়ণ এবং সুষম অষ্টতলকীয় (Octahedral) জ্যামিতিক গঠন বিদ্যমান?',
      options: ['PCl₅', 'SF₆', 'BF₃', 'NH₃'],
      correctIndex: 1,
      explanation: 'In $\\text{SF}_6$ (Sulfur hexafluoride), the central sulfur atom forms 6 sigma bonds with 6 fluorine atoms and has 0 lone pairs, giving steric number 6, $sp^3d^2$ hybridization, and a regular octahedral shape.'
    },
    {
      id: 'q-chem-201',
      subjectId: 'chemistry',
      chapterId: 'chem-2',
      categories: ['hsc', 'med', 'uni', 'ssc'],
      difficulty: 'Easy',
      questionType: 'standard',
      examTag: 'Medical & HSC • Chemistry 1st Paper Ch-4',
      question: 'What is the pH of a $0.005\\text{ M}$ aqueous solution of sulfuric acid ($\\text{H}_2\\text{SO}_4$), assuming complete dissociation at $25^\\circ\\text{C}$?',
      questionBn: '$25^\\circ\\text{C}$ তাপমাত্রায় সম্পূর্ণ বিয়োজিত ধরে $0.005\\text{ M H}_2\\text{SO}_4$ জলীয় দ্রবণের pH কত?',
      options: ['1.0', '2.0', '2.3', '3.0'],
      correctIndex: 1,
      explanation: '$\\text{H}_2\\text{SO}_4$ is a diprotic strong acid ($\\text{H}_2\\text{SO}_4 \\to 2\\text{H}^+ + \\text{SO}_4^{2-}$). Thus $[\\text{H}^+] = 2 \\times 0.005\\text{ M} = 0.01\\text{ M} = 10^{-2}\\text{ M}$. Therefore, $\\text{pH} = -\\log_{10}(10^{-2}) = 2.0$.'
    },
    {
      id: 'q-chem-203',
      subjectId: 'chemistry',
      chapterId: 'chem-3',
      categories: ['hsc', 'uni', 'med', 'eng'],
      difficulty: 'Hard',
      questionType: 'standard',
      examTag: 'Organic Chemistry • Chemistry 2nd Paper Ch-2',
      question: 'Which reagent is used in the Clemmensen reduction to convert an aldehyde or ketone carbonyl group ($>\\text{C}=\\text{O}$) directly into a methylene group ($-\\text{CH}_2-$)?',
      questionBn: 'ক্লিমেনসেন বিজারণে (Clemmensen Reduction) অ্যালডিহাইড বা কিটোনের কার্বনিল মূলককে ($>\\text{C}=\\text{O}$) মিথিলিন মূলকে ($-\\text{CH}_2-$) রূপান্তর করতে কোন বিকারক ব্যবহৃত হয়?',
      options: ['Zn–Hg + Conc. HCl', 'NH₂–NH₂ + KOH', 'LiAlH₄ in dry ether', 'Pd / BaSO₄ + H₂'],
      correctIndex: 0,
      explanation: 'Clemmensen reduction uses amalgamated zinc (Zn–Hg) and concentrated hydrochloric acid (HCl) to reduce aldehydes and ketones to alkanes. Hydrazine + KOH is used in the Wolff–Kishner reduction.'
    },
    {
      id: 'q-chem-204',
      subjectId: 'chemistry',
      chapterId: 'chem-4',
      categories: ['hsc', 'uni', 'med', 'eng', 'ssc'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'Electrochemistry • Chemistry 2nd Paper Ch-4',
      question: 'How many Faradays ($F$) of electricity are required to deposit 1 mole of metallic Aluminum ($\\text{Al}$) from molten $\\text{Al}_2\\text{O}_3$ at the cathode?',
      questionBn: 'গলিত $\\text{Al}_2\\text{O}_3$ থেকে ক্যাথোডে ১ মোল ধাতব অ্যালুমিনিয়াম ($\\text{Al}$) জমা করতে কত ফ্যারাডে ($F$) তড়িৎ প্রয়োজন?',
      options: ['1 F', '2 F', '3 F', '6 F'],
      correctIndex: 2,
      explanation: 'The cathode half-reaction for aluminum reduction is $\\text{Al}^{3+} + 3e^- \\to \\text{Al}(s)$. Reducing 1 mole of $\\text{Al}^{3+}$ ions requires 3 moles of electrons, which equals $3\\text{ Faradays}$ ($3 \\times 96,500\\text{ C}$).'
    },

    /* --- HIGHER MATHEMATICS (math-1 to math-4) --- */
    {
      id: 'q-math-301',
      subjectId: 'math',
      chapterId: 'math-1',
      categories: ['hsc', 'uni', 'eng'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'Calculus • Higher Math 1st Paper Ch-9',
      question: 'What is the value of $\\lim_{x \\to 0} \\frac{e^{3x} - 1}{x}$?',
      questionBn: '$\\lim_{x \\to 0} \\frac{e^{3x} - 1}{x}$ -এর মান কত?',
      options: ['0', '1', '3', 'e³'],
      correctIndex: 2,
      explanation: 'Using the standard limit $\\lim_{u \\to 0} \\frac{e^u - 1}{u} = 1$ or L’Hôpital’s rule: differentiating numerator and denominator with respect to $x$ gives $\\lim_{x \\to 0} \\frac{3e^{3x}}{1} = 3$.'
    },
    {
      id: 'q-math-302',
      subjectId: 'math',
      chapterId: 'math-2',
      categories: ['hsc', 'uni', 'eng'],
      difficulty: 'Easy',
      questionType: 'standard',
      examTag: 'Matrices • Higher Math 1st Paper Ch-1',
      question: 'For what value of $k$ is the matrix $A = \\begin{bmatrix} k & 4 \\\\ 9 & k \\end{bmatrix}$ singular (non-invertible)?',
      questionBn: '$k$-এর মান কত হলে $\\begin{bmatrix} k & 4 \\\\ 9 & k \\end{bmatrix}$ ম্যাট্রিক্সটি ব্যতিক্রমী (Singular) হবে?',
      options: ['±4', '±6', '±9', '±12'],
      correctIndex: 1,
      explanation: 'A square matrix is singular when its determinant is 0. Here $\\det(A) = k^2 - (4 \\times 9) = k^2 - 36 = 0 \\Rightarrow k = \\pm 6$.'
    },
    {
      id: 'q-math-304',
      subjectId: 'math',
      chapterId: 'math-3',
      categories: ['hsc', 'uni', 'eng', 'ssc'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'Complex Numbers & Trig • Higher Math 2nd Paper Ch-1',
      question: 'If $i = \\sqrt{-1}$, what is the modulus $|z|$ and principal argument of the complex number $z = 1 + \\sqrt{3}i$?',
      questionBn: '$i = \\sqrt{-1}$ হলে $z = 1 + \\sqrt{3}i$ জটিল সংখ্যাটির মডুলাস $|z|$ এবং মুখ্য আর্গুমেন্ট কত?',
      options: ['|z| = 2, arg(z) = π/6', '|z| = 2, arg(z) = π/3', '|z| = 4, arg(z) = π/3', '|z| = √2, arg(z) = π/4'],
      correctIndex: 1,
      explanation: 'Modulus $|z| = \\sqrt{1^2 + (\\sqrt{3})^2} = 2$. Since both real and imaginary parts are positive (1st quadrant), principal argument $\\theta = \\tan^{-1}(\\sqrt{3} / 1) = \\pi/3$ ($60^\\circ$).'
    },
    {
      id: 'q-math-303',
      subjectId: 'math',
      chapterId: 'math-4',
      categories: ['bcs', 'bank', 'gov', 'uni', 'ssc', 'hsc'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'Combinatorics • BCS & Admission Standard',
      question: 'In how many distinct ways can the letters of the word "DIRECTOR" be arranged so that the three vowels (I, E, O) always remain together?',
      questionBn: '"DIRECTOR" শব্দটির স্বরবর্ণগুলোকে (I, E, O) সর্বদা একত্রে রেখে অক্ষরগুলোকে মোট কত প্রকারে সাজানো যায়?',
      options: ['720', '1080', '2160', '4320'],
      correctIndex: 2,
      explanation: '"DIRECTOR" has 8 letters: 5 consonants (D, R, C, T, R — R appears twice) and 3 distinct vowels (I, E, O). Treating (IEO) as 1 block gives 6 units with R repeated twice: $6! / 2! = 360$. The 3 vowels arrange internally in $3! = 6$ ways. Total $= 360 \\times 6 = 2160$.'
    },

    /* --- BIOLOGY (bio-1 to bio-4) --- */
    {
      id: 'q-bio-401',
      subjectId: 'biology',
      chapterId: 'bio-1',
      categories: ['ssc', 'hsc', 'med', 'uni', 'bcs'],
      difficulty: 'Easy',
      questionType: 'standard',
      examTag: 'Medical Admission • Biology 1st Paper Ch-1',
      question: 'Which organelle in animal cells contains its own circular DNA and 70S ribosomes, enabling semi-autonomous protein synthesis?',
      questionBn: 'প্রাণীকোষের কোন কোষীয় অঙ্গাণুতে নিজস্ব বৃত্তাকার DNA এবং 70S রাইবোজোম থাকায় এটি আধা-স্বায়ত্তশাসিতভাবে প্রোটিন সংশ্লেষণ করতে পারে?',
      options: ['Golgi Apparatus (গলগি বডি)', 'Mitochondria (মাইটোকন্ড্রিয়া)', 'Lysosome (লাইসোজোম)', 'Endoplasmic Reticulum (এন্ডোপ্লাজমিক রেটিকুলাম)'],
      correctIndex: 1,
      explanation: 'In animal cells (which lack plastids/chloroplasts), Mitochondria are the only organelles possessing their own circular DNA and prokaryotic-type 70S ribosomes for semi-autonomous protein synthesis.'
    },
    {
      id: 'q-bio-405',
      subjectId: 'biology',
      chapterId: 'bio-1',
      categories: ['ssc', 'hsc', 'med', 'uni'],
      difficulty: 'Medium',
      questionType: 'multi',
      examTag: 'Board Multi-Statement (বহুপদী) • Biology 1st Paper Ch-2',
      question: 'Which of the following events occur during the Prophase-I (Pachytene sub-stage) of Meiosis cell division?',
      questionBn: 'মিয়োসিস কোষ বিভাজনের প্রোফেজ-১ এর প্যাকাইটিন (Pachytene) উপ-পর্যায়ে নিচের কোন ঘটনাগুলো ঘটে?',
      statements: [
        'i. হোমোলোগাস ক্রোমোজোমের দুটি নন-সিস্টার ক্রোমাটিডের মধ্যে কায়াজমা (Chiasma) সৃষ্টি হয়',
        'ii. ক্রসিং ওভারের (Crossing Over) মাধ্যমে জিনের বিনিময় ঘটে',
        'iii. নিউক্লিওলাস ও নিউক্লিয়ার মেমব্রেনের সম্পূর্ণ বিলুপ্তি ঘটে'
      ],
      options: ['i ও ii (i & ii)', 'i ও iii (i & iii)', 'ii ও iii (ii & iii)', 'i, ii ও iii (i, ii & iii)'],
      correctIndex: 0,
      explanation: 'During Pachytene of Prophase-I, tetrad formation is visible, chiasmata form between non-sister chromatids (i), and crossing over takes place (ii). Complete disappearance of the nuclear membrane and nucleolus (iii) happens later in Diakinesis.'
    },
    {
      id: 'q-bio-402',
      subjectId: 'biology',
      chapterId: 'bio-2',
      categories: ['hsc', 'med', 'uni', 'ssc'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'MBBS Admission • Biology 2nd Paper Ch-4',
      question: 'Which structure acts as the natural pacemaker of the human heart by initiating the cardiac electrical impulse?',
      questionBn: 'মানব হৃৎপিণ্ডের প্রাকৃতিক পেসমেকার (Natural Pacemaker) হিসেবে নিচের কোনটি তড়িৎ উদ্দীপনা শুরু করে?',
      options: ['Atrioventricular Node (AVN)', 'Sinoatrial Node (SAN)', 'Bundle of His', 'Purkinje Fibers'],
      correctIndex: 1,
      explanation: 'The Sinoatrial Node (SA Node), located in the upper wall of the right atrium near the superior vena cava opening, spontaneously generates action potentials at 70–80 bpm and serves as the natural cardiac pacemaker.'
    },
    {
      id: 'q-bio-403',
      subjectId: 'biology',
      chapterId: 'bio-3',
      categories: ['hsc', 'med', 'uni', 'bcs', 'gov'],
      difficulty: 'Hard',
      questionType: 'standard',
      examTag: 'Genetics • Biology 2nd Paper Ch-11',
      question: 'What is the phenotypic ratio in the $F_2$ generation when a lethal gene causes the death of homozygous dominant ($AA$) individuals in a monohybrid cross ($Aa \\times Aa$)?',
      questionBn: 'মারণ জিন (Lethal Gene)-এর প্রভাবে হোমোজাইগাস প্রকট ($AA$) জীবের মৃত্যু ঘটলে মনোহাইব্রিড ক্রসের ($Aa \\times Aa$) $F_2$ জনুতে ফিনোটাইপিক অনুপাত কত হয়?',
      options: ['3 : 1', '2 : 1', '1 : 2 : 1', '9 : 7'],
      correctIndex: 1,
      explanation: 'In a cross between two heterozygotes ($Aa \\times Aa$), the expected genotypic ratio is $1\\text{ }AA : 2\\text{ }Aa : 1\\text{ }aa$. Because the homozygous dominant ($AA$) embryos die due to the lethal gene, the surviving ratio is $2\\text{ }Aa : 1\\text{ }aa$ ($2 : 1$).'
    },
    {
      id: 'q-bio-404',
      subjectId: 'biology',
      chapterId: 'bio-4',
      categories: ['hsc', 'med', 'uni', 'ssc'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'Plant Physiology • Biology 1st Paper Ch-9',
      question: 'In $C_4$ plants (such as sugarcane and maize), what is the first stable 4-carbon compound formed during the Hatch and Slack photosynthetic pathway?',
      questionBn: '$C_4$ উদ্ভিদে (যেমন ইক্ষু ও ভুট্টা) হ্যাচ ও স্ল্যাক চক্রে কার্বন বিজারণের ফলে উৎপন্ন প্রথম স্থায়ী ৪-কার্বনবিশিষ্ট যৌগ কোনটি?',
      options: ['3-Phosphoglyceric Acid (3-PGA)', 'Oxaloacetic Acid (OAA)', 'Ribulose-1,5-bisphosphate (RuBP)', 'Pyruvic Acid'],
      correctIndex: 1,
      explanation: 'In the mesophyll cells of $C_4$ plants, phosphoenolpyruvate (PEP, 3C) fixes $\\text{CO}_2$ via the enzyme PEP carboxylase to form Oxaloacetic Acid (OAA), a 4-carbon dicarboxylic acid.'
    },

    /* --- ENGLISH (eng-1 to eng-4) --- */
    {
      id: 'q-eng-503',
      subjectId: 'english',
      chapterId: 'eng-1',
      categories: ['ssc', 'hsc', 'uni', 'bcs', 'bank', 'gov'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'Clauses & Parts of Speech • DU / BCS',
      question: 'Identify the type of clause in the sentence: "I know the place where he was born."',
      questionBn: '"I know the place where he was born." — বাক্যে "where he was born" অংশটি কোন ধরনের Clause?',
      options: ['Noun Clause', 'Adjective (Relative) Clause', 'Adverbial Clause of Place', 'Coordinate Clause'],
      correctIndex: 1,
      explanation: 'Because "where he was born" modifies the preceding noun antecedent "the place" (telling us which place), it functions as an Adjective (Relative) Clause.'
    },
    {
      id: 'q-eng-501',
      subjectId: 'english',
      chapterId: 'eng-2',
      categories: ['bcs', 'bank', 'uni', 'med', 'gov', 'hsc', 'ssc'],
      difficulty: 'Easy',
      questionType: 'standard',
      examTag: 'BCS / DU / Bank • Subject-Verb Agreement',
      question: 'Choose the grammatically correct sentence following the rules of Subject-Verb Agreement:',
      questionBn: 'Subject-Verb Agreement-এর নিয়ম অনুযায়ী নিচের কোন বাক্যটি শুদ্ধ?',
      options: [
        'Neither the director nor the actors was present at the rehearsal.',
        'The number of applicants have increased significantly this year.',
        'One of the scholars who have won the fellowship is from Dhaka.',
        'Each of the candidates were given twenty minutes to speak.'
      ],
      correctIndex: 2,
      explanation: 'In "One of the [plural noun] who [plural verb]... [singular main verb]", the relative pronoun "who" refers to the plural antecedent "scholars" ("have won"), while the main subject is "One" ("is from Dhaka").'
    },
    {
      id: 'q-eng-502',
      subjectId: 'english',
      chapterId: 'eng-3',
      categories: ['bcs', 'bank', 'uni', 'gov', 'gk'],
      difficulty: 'Hard',
      questionType: 'standard',
      examTag: 'BCS English Literature • Elizabethan Period',
      question: '"All the world’s a stage, And all the men and women merely players" — this famous soliloquy appears in which play by William Shakespeare?',
      questionBn: '"All the world’s a stage, And all the men and women merely players" — উইলিয়াম শেক্সপিয়ারের কোন নাটকের বিখ্যাত উক্তি?',
      options: ['Hamlet', 'As You Like It', 'The Tempest', 'Macbeth'],
      correctIndex: 1,
      explanation: 'Spoken by the melancholic character Jaques in Act II, Scene VII of William Shakespeare’s pastoral comedy "As You Like It", this speech introduces the Seven Ages of Man.'
    },
    {
      id: 'q-eng-504',
      subjectId: 'english',
      chapterId: 'eng-4',
      categories: ['bcs', 'bank', 'uni', 'med', 'eng', 'gov'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'High-Frequency Vocabulary & Idioms • Bank / BCS',
      question: 'What is the closest synonym of the word "EPHEMERAL" and the meaning of the idiom "A Swan Song"?',
      questionBn: '"EPHEMERAL" শব্দটির সমার্থক শব্দ এবং "A Swan Song" বাগধারাটির সঠিক অর্থ কোনটি?',
      options: [
        'Permanent; An inaugural performance',
        'Short-lived (Transient); A final farewell performance or work before retirement/death',
        'Ubiquitous; A joyful celebration of victory',
        'Meticulous; A secret diplomatic agreement'
      ],
      correctIndex: 1,
      explanation: '"Ephemeral" means short-lived or transient. "Swan song" refers to the final work, performance, or achievement of a poet, musician, or person before retirement or death.'
    },

    /* --- BANGLA (bn-1 to bn-4) --- */
    {
      id: 'q-bn-603',
      subjectId: 'bangla',
      chapterId: 'bn-1',
      categories: ['ssc', 'hsc', 'uni', 'bcs', 'bank', 'gov'],
      difficulty: 'Easy',
      questionType: 'standard',
      examTag: 'ধ্বনিতত্ত্ব ও সন্ধি • বাংলা ব্যাকরণ',
      question: '"গবেষণা" এবং "ষড়ঋতু" শব্দ দুটির সঠিক সন্ধি বিচ্ছেদ কোনটি?',
      questionBn: 'বাংলা ব্যাকরণের নিয়ম অনুসারে "গবেষণা" ও "ষড়ঋতু" শব্দ দুটির প্রমিত সন্ধি বিচ্ছেদ কোনটি?',
      options: [
        'গব + এষণা এবং ষড় + ঋতু',
        'গো + এষণা এবং ষট্ + ঋতু',
        'গৌ + এষণা এবং ষড়্ + ঋতু',
        'গো + ষণা এবং ষট + ঋতু'
      ],
      correctIndex: 1,
      explanation: 'স্বরসন্ধির নিয়মানুসারে (ও-কারের পর স্বরধ্বনি থাকলে "অব্" হয়): গো + এষণা = গবেষণা। আর ব্যঞ্জনসন্ধির নিয়মে: ষট্ + ঋতু = ষড়ঋতু।'
    },
    {
      id: 'q-bn-601',
      subjectId: 'bangla',
      chapterId: 'bn-2',
      categories: ['bcs', 'uni', 'gov', 'ssc', 'hsc', 'bank'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'সমাস ও কারক • বিসিএস ও বিশ্ববিদ্যালয় ভর্তি',
      question: '"উপকূল" ও "যথাবিধি" শব্দ দুটি কোন সমাসের উদাহরণ?',
      questionBn: '"উপকূল" (কূলের সমীপে) ও "যথাবিধি" (বিধিকে অতিক্রম না করে) কোন সমাসের অন্তর্ভুক্ত?',
      options: ['অব্যয়ীভাব সমাস', 'কর্মধারয় সমাস', 'বহুব্রীহি সমাস', 'তৎপুরুষ সমাস'],
      correctIndex: 0,
      explanation: 'পূর্বপদে অব্যয় যোগে নিষ্পন্ন সমাসে যদি অব্যয়েরই অর্থের প্রাধান্য থাকে, তবে তাকে অব্যয়ীভাব সমাস বলে। যেমন: কূলের সমীপে = উপকূল, বিধিকে অতিক্রম না করে = যথাবিধি।'
    },
    {
      id: 'q-bn-604',
      subjectId: 'bangla',
      chapterId: 'bn-3',
      categories: ['bcs', 'uni', 'gov', 'bank'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'প্রাচীন ও মধ্যযুগ • বাংলা সাহিত্যের ইতিহাস',
      question: 'বাংলা ভাষার আদি নিদর্শন "চর্যাপদ"-এ মোট কতজন পদকর্তার নাম পাওয়া যায় এবং সবচেয়ে বেশি পদ কে রচনা করেছেন?',
      questionBn: 'মহামহোপাধ্যায় হরপ্রসাদ শাস্ত্রী আবিষ্কৃত "চর্যাপদ"-এ কতজন কবির পদ রয়েছে এবং সর্বাধিক পদ রচয়িতা কে?',
      options: [
        '২২ জন পদকর্তা; লুইপা (১৪টি পদ)',
        '২৩ বা ২৪ জন পদকর্তা; কাহ্নপা (১৩টি পদ)',
        '২০ জন পদকর্তা; ভুসুকুপা (১২টি পদ)',
        '২৫ জন পদকর্তা; শবরপা (১০টি পদ)'
      ],
      correctIndex: 1,
      explanation: 'চর্যাপদে মোট ২৩ জন (ড. মুহম্মদ শহীদুল্লাহর মতে ২৪ জন) পদকর্তার পরিচয় পাওয়া যায়। এর মধ্যে কাহ্নপা সর্বাধিক ১৩টি পদ রচনা করেছেন এবং আদি কবি লুইপা ২টি পদ রচনা করেছেন।'
    },
    {
      id: 'q-bn-602',
      subjectId: 'bangla',
      chapterId: 'bn-4',
      categories: ['bcs', 'uni', 'gov', 'gk', 'ssc', 'hsc'],
      difficulty: 'Easy',
      questionType: 'standard',
      examTag: 'আধুনিক সাহিত্য ও ভাষা আন্দোলন • ১৯৫৩',
      question: '১৯৫২ সালের ভাষা আন্দোলনের পটভূমিতে রচিত মুনীর চৌধুরীর বিখ্যাত নাটক "কবর" কোন কারাগারে বসে রচিত হয়েছিল?',
      questionBn: 'ভাষা আন্দোলনের পটভূমিতে রচিত মুনীর চৌধুরীর বিখ্যাত একাঙ্কিকা নাটক "কবর" (১৯৫৩) কোন কারাগারে বসে রচিত হয়?',
      options: ['রাজশাহী কেন্দ্রীয় কারাগার', 'ঢাকা কেন্দ্রীয় কারাগার', 'কুমিল্লা কারাগার', 'সিলেট কারাগার'],
      correctIndex: 1,
      explanation: '১৯৫২ সালের ভাষা আন্দোলনে অংশগ্রহণের কারণে কারাবন্দী অবস্থায় ১৯৫৩ সালে ঢাকা কেন্দ্রীয় কারাগারে বসে মুনীর চৌধুরী "কবর" নাটকটি রচনা করেন।'
    },

    /* --- GENERAL KNOWLEDGE (gk-1 to gk-4) --- */
    {
      id: 'q-gk-701',
      subjectId: 'gk',
      chapterId: 'gk-1',
      categories: ['bcs', 'uni', 'med', 'gov', 'bank', 'gk', 'ssc'],
      difficulty: 'Easy',
      questionType: 'standard',
      examTag: '1971 Liberation War • Bangladesh Affairs',
      question: 'During the 1971 Liberation War of Bangladesh, under which operational sector was Dhaka City and its surrounding industrial belt placed?',
      questionBn: '১৯৭১ সালের মহান মুক্তিযুদ্ধে ঢাকা শহর ও এর পার্শ্ববর্তী এলাকা কত নম্বর সেক্টরের অধীনে ছিল?',
      options: ['Sector 1 (সেক্টর ১)', 'Sector 2 (সেক্টর ২)', 'Sector 3 (সেক্টর ৩)', 'Sector 11 (সেক্টর ১১)'],
      correctIndex: 1,
      explanation: 'Sector 2 comprised Dhaka, Comilla, Noakhali, and parts of Faridpur. It was commanded by Major Khaled Mosharraf and later Major ATM Haider.'
    },
    {
      id: 'q-gk-702',
      subjectId: 'gk',
      chapterId: 'gk-2',
      categories: ['bcs', 'uni', 'gov', 'bank', 'gk'],
      difficulty: 'Hard',
      questionType: 'standard',
      examTag: 'Constitution of Bangladesh • Fundamental Rights',
      question: 'Which Article of the Constitution of the People’s Republic of Bangladesh guarantees "Equality of opportunity in public employment"?',
      questionBn: 'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধানের কোন অনুচ্ছেদে "সরকারি নিয়োগ-লাভে সুযোগের সমতা" নিশ্চিত করা হয়েছে?',
      options: ['Article 27 (অনুচ্ছেদ ২৭)', 'Article 28 (অনুচ্ছেদ ২৮)', 'Article 29 (অনুচ্ছেদ ২৯)', 'Article 32 (অনুচ্ছেদ ৩২)'],
      correctIndex: 2,
      explanation: 'Article 27 guarantees equality before law, Article 28 prohibits discrimination, Article 29 guarantees equality of opportunity in public employment, and Article 32 protects the right to life and personal liberty.'
    },
    {
      id: 'q-gk-703',
      subjectId: 'gk',
      chapterId: 'gk-3',
      categories: ['bcs', 'uni', 'gov', 'bank', 'gk'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'International Affairs • UN & Bretton Woods',
      question: 'Where is the headquarters of the International Court of Justice (ICJ), the principal judicial organ of the United Nations, located?',
      questionBn: 'জাতিসংঘের মূল বিচারিক সংস্থা "আন্তর্জাতিক বিচার আদালত" (ICJ)-এর সদর দপ্তর (Peace Palace) কোথায় অবস্থিত?',
      options: ['Geneva, Switzerland', 'The Hague, Netherlands', 'Vienna, Austria', 'New York, USA'],
      correctIndex: 1,
      explanation: 'Among the six principal organs of the United Nations, the International Court of Justice (ICJ) is located at the Peace Palace in The Hague, Netherlands.'
    },
    {
      id: 'q-gk-704',
      subjectId: 'gk',
      chapterId: 'gk-4',
      categories: ['bcs', 'uni', 'gov', 'gk', 'ssc'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'Geography & Blue Economy • Bangladesh',
      question: 'What is the name of the submarine canyon located in the Bay of Bengal that serves as a major breeding ground for marine biodiversity and cetaceans?',
      questionBn: 'বঙ্গোপসাগরে অবস্থিত গভীর সামুদ্রিক গিরিখাত (Submarine Canyon) কোনটি, যা তিমি ও ডলফিনসহ সামুদ্রিক জীববৈচিত্র্যের প্রধান প্রজনন ক্ষেত্র?',
      options: ['Sunda Trench', 'Swatch of No Ground (সোয়াচ অব নো গ্রাউন্ড)', 'Mariana Trough', 'Bengal Delta Shelf'],
      correctIndex: 1,
      explanation: 'The Swatch of No Ground (সোয়াচ অব নো গ্রাউন্ড) is a deep-sea submarine canyon in the northern Bay of Bengal, south of the Sundarbans, declared Bangladesh’s first Marine Protected Area in 2014.'
    },

    /* --- ICT & ANALYTICAL ABILITY (ict-1 to ict-4) --- */
    {
      id: 'q-ict-801',
      subjectId: 'ict',
      chapterId: 'ict-1',
      categories: ['hsc', 'bcs', 'bank', 'uni', 'gov', 'eng'],
      difficulty: 'Easy',
      questionType: 'standard',
      examTag: 'HSC ICT Ch-3 • Number Systems',
      question: 'What is the hexadecimal equivalent of the binary number $(10111101)_2$?',
      questionBn: '$(10111101)_2$ বাইনারি সংখ্যাটির সমতুল্য হেক্সাডেসিমেল (Hexadecimal) মান কোনটি?',
      options: ['(9D)₁₆', '(BD)₁₆', '(CD)₁₆', '(B5)₁₆'],
      correctIndex: 1,
      explanation: 'Grouping into 4-bit nibbles from right to left: $1011_2 = 11 = \\text{B}_{16}$, and $1101_2 = 13 = \\text{D}_{16}$. Combining them gives $(\\text{BD})_{16}$.'
    },
    {
      id: 'q-ict-805',
      subjectId: 'ict',
      chapterId: 'ict-1',
      categories: ['hsc', 'uni', 'eng', 'bcs'],
      difficulty: 'Medium',
      questionType: 'multi',
      examTag: 'Board Multi-Statement (বহুপদী) • HSC ICT Ch-3',
      question: 'Which of the following logic gates are known as Universal Gates (সার্বজনীন গেট) and obey De Morgan’s theorems?',
      questionBn: 'ডিজিটাল ইলেকট্রনিক্সে লজিক গেটের ক্ষেত্রে নিচের তথ্যগুলো লক্ষ্য করো:',
      statements: [
        'i. NAND এবং NOR গেটকে সার্বজনীন গেট (Universal Gates) বলা হয়',
        'ii. শুধুমাত্র NAND গেট দিয়েই মৌলিক তিনটি গেট (AND, OR, NOT) বাস্তবায়ন করা সম্ভব',
        'iii. XOR গেট একটি মৌলিক লজিক গেট (Basic Logic Gate)'
      ],
      options: ['i ও ii (i & ii)', 'i ও iii (i & iii)', 'ii ও iii (ii & iii)', 'i, ii ও iii (i, ii & iii)'],
      correctIndex: 0,
      explanation: 'NAND and NOR are Universal Gates (i) because any boolean function or basic gate (AND, OR, NOT) can be constructed using only NAND or only NOR gates (ii). XOR is a derived/compound gate, not a basic gate (iii is false).'
    },
    {
      id: 'q-ict-802',
      subjectId: 'ict',
      chapterId: 'ict-2',
      categories: ['hsc', 'bcs', 'bank', 'uni', 'gov'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'HSC ICT Ch-2 • Networking & OSI Model',
      question: 'Which layer of the OSI 7-Layer Reference Model is responsible for end-to-end packet routing and IP logical addressing?',
      questionBn: 'OSI মডেলের কোন স্তরটি IP অ্যাড্রেসিং এবং ডেটা প্যাকেটের রাউটিং (Routing) নিয়ন্ত্রণ করে?',
      options: ['Data Link Layer (Layer 2)', 'Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Session Layer (Layer 5)'],
      correctIndex: 1,
      explanation: 'The Network Layer (Layer 3) handles logical addressing (IPv4/IPv6) and determines the optimal physical path (routing) for data packets across networks.'
    },
    {
      id: 'q-ict-803',
      subjectId: 'ict',
      chapterId: 'ict-3',
      categories: ['hsc', 'bcs', 'bank', 'uni', 'eng'],
      difficulty: 'Hard',
      questionType: 'standard',
      examTag: 'HSC ICT Ch-5 & Ch-6 • C Programming & SQL',
      question: 'In SQL, which clause is used to filter grouped records after a GROUP BY aggregation has been performed?',
      questionBn: 'SQL ডেটাবেজ কুয়েরিতে GROUP BY ব্যবহারের পর অ্যাগ্রিগেট ফাংশনের (যেমন COUNT, SUM) ওপর শর্ত আরোপ করতে কোন Clause ব্যবহৃত হয়?',
      options: ['WHERE', 'HAVING', 'ORDER BY', 'DISTINCT'],
      correctIndex: 1,
      explanation: 'The WHERE clause filters individual rows before grouping, whereas the HAVING clause filters groups created by the GROUP BY clause based on aggregate conditions (e.g., HAVING COUNT(*) > 5).'
    },
    {
      id: 'q-ict-804',
      subjectId: 'ict',
      chapterId: 'ict-4',
      categories: ['bcs', 'bank', 'gov', 'uni'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'BCS & Bank • Analytical Ability',
      question: 'Find the missing number in the analytical progression: 3, 7, 15, 31, 63, ?',
      questionBn: 'নিচের গাণিতিক ধারাটির পরবর্তী সংখ্যাটি কত? ৩, ৭, ১৫, ৩১, ৬৩, ?',
      options: ['95', '125', '127', '129'],
      correctIndex: 2,
      explanation: 'Each term follows the pattern $T_n = 2 \\times T_{n-1} + 1$: $3\\times 2+1 = 7$; $7\\times 2+1 = 15$; $15\\times 2+1 = 31$; $31\\times 2+1 = 63$; therefore the next term is $63\\times 2 + 1 = 127$.'
    },

    /* --- ACCOUNTING & FINANCE (acc-1 to acc-4 — Business Studies & Bank) --- */
    {
      id: 'q-acc-901',
      subjectId: 'accounting',
      chapterId: 'acc-1',
      categories: ['ssc', 'hsc', 'uni', 'bank'],
      difficulty: 'Easy',
      questionType: 'multi',
      examTag: 'HSC & DU C-Unit • Accounting 1st Paper Ch-1',
      question: 'Which of the following statements accurately describe the Fundamental Accounting Equation ($A = L + OE$)?',
      questionBn: 'মৌলিক হিসাব সমীকরণের ($A = L + OE$) ক্ষেত্রে নিচের তথ্যগুলো লক্ষ্য করো:',
      statements: [
        'i. মালিকের মূলধন বিনিয়োগ ও আয়ের ফলে মালিকানা স্বত্ব ($OE$) বৃদ্ধি পায়',
        'ii. ব্যবসায়িক ব্যয় ও মালিকের উত্তোলনের ফলে মালিকানা স্বত্ব ($OE$) হ্রাস পায়',
        'iii. ধারে যন্ত্রপাতি ক্রয় করলে কেবল সম্পত্তি বৃদ্ধি পায় কিন্তু দায়ের কোনো পরিবর্তন হয় না'
      ],
      options: ['i ও ii (i & ii)', 'i ও iii (i & iii)', 'ii ও iii (ii & iii)', 'i, ii ও iii (i, ii & iii)'],
      correctIndex: 0,
      explanation: 'Owner’s Equity ($OE = C + R - E - D$) increases with Capital ($C$) and Revenue ($R$) (i) and decreases with Expenses ($E$) and Drawings ($D$) (ii). Purchasing equipment on credit increases both Assets and Liabilities (so iii is false).'
    },
    {
      id: 'q-acc-902',
      subjectId: 'accounting',
      chapterId: 'acc-2',
      categories: ['hsc', 'uni', 'bank'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'DU C-Unit & Bank • Financial Statements Ch-9',
      question: 'Under the accrual basis of accounting, how is "Prepaid Insurance" (অগ্রিম বিমা সেলামি) classified on the Balance Sheet?',
      questionBn: 'বকেয়া ধারণা (Accrual Basis) অনুযায়ী আর্থিক অবস্থার বিবরণীতে "অগ্রিম প্রদত্ত বিমা সেলামি" (Prepaid Insurance) কোন শ্রেণির হিসাব?',
      options: ['Current Liability (চলতি দায়)', 'Current Asset (চলতি সম্পদ)', 'Intangible Asset (অস্পর্শনীয় সম্পদ)', 'Operating Expense (পরিচালন ব্যয়)'],
      correctIndex: 1,
      explanation: 'Prepaid expenses (such as Prepaid Insurance or Prepaid Rent) represent future economic benefits to be consumed within one accounting period and are therefore classified as Current Assets (চলতি সম্পদ).'
    },
    {
      id: 'q-acc-903',
      subjectId: 'accounting',
      chapterId: 'acc-3',
      categories: ['hsc', 'uni', 'bank'],
      difficulty: 'Hard',
      questionType: 'standard',
      examTag: 'HSC Accounting 2nd Paper Ch-6 • Ratio Analysis',
      question: 'A company has Current Assets of Tk 4,50,000, Inventory of Tk 1,50,000, and Current Liabilities of Tk 1,50,000. What are its Current Ratio and Quick (Acid-Test) Ratio?',
      questionBn: 'একটি কোম্পানির চলতি সম্পদ ৪,৫০,০০০ টাকা, মজুদ পণ্য ১,৫০,০০০ টাকা এবং চলতি দায় ১,৫০,০০০ টাকা হলে এর চলতি অনুপাত (Current Ratio) ও তড়িৎ অনুপাত (Quick Ratio) কত?',
      options: ['3 : 1 and 2 : 1', '2 : 1 and 1 : 1', '3 : 1 and 1.5 : 1', '2.5 : 1 and 2 : 1'],
      correctIndex: 0,
      explanation: 'Current Ratio $= \\text{Current Assets} / \\text{Current Liabilities} = 4,50,000 / 1,50,000 = 3 : 1$. Quick Assets $= 4,50,000 - 1,50,000 = 3,00,000$. Thus Quick Ratio $= 3,00,000 / 1,50,000 = 2 : 1$.'
    },
    {
      id: 'q-acc-904',
      subjectId: 'accounting',
      chapterId: 'acc-4',
      categories: ['ssc', 'hsc', 'uni', 'bank'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'Finance & Banking • Time Value of Money',
      question: 'According to the Rule of 72, approximately how many years will it take for an investment to double at an annual compound interest rate of 9%?',
      questionBn: 'অর্থের সময়মূল্যের "বিধি-৭২" (Rule of 72) অনুযায়ী বার্ষিক ৯% চক্রবৃদ্ধি সুদে কোনো বিনিয়োগ কত বছরে দ্বিগুণ হবে?',
      options: ['6 years', '8 years', '9 years', '12 years'],
      correctIndex: 1,
      explanation: 'Under the Rule of 72 for compound interest, doubling time $n \\approx 72 / r = 72 / 9 = 8\\text{ years}$.'
    },

    /* --- ECONOMICS, CIVICS & HISTORY (eco-1 to eco-4 — Humanities & BCS/Bank) --- */
    {
      id: 'q-eco-1001',
      subjectId: 'economics',
      chapterId: 'eco-1',
      categories: ['ssc', 'hsc', 'uni', 'bcs', 'bank'],
      difficulty: 'Easy',
      questionType: 'standard',
      examTag: 'HSC Economics 1st Paper Ch-2 • Demand & Elasticity',
      question: 'For a Giffen good (গিফেন দ্রব্য), what is the relationship between the price of the good and the quantity demanded?',
      questionBn: 'গিফেন দ্রব্যের (Giffen Good) ক্ষেত্রে দ্রব্যের দাম ও চাহিদার পরিমাণের মধ্যে কীরূপ সম্পর্ক বিদ্যমান?',
      options: [
        'Inverse relationship (বিপরীতমুখী সম্পর্ক — চাহিদা বিধি মেনে চলে)',
        'Positive/Direct relationship (সমমুখী সম্পর্ক — দাম বাড়লে চাহিদা বাড়ে)',
        'Zero relationship (দামের পরিবর্তনে চাহিদা স্থির থাকে)',
        'Infinite elasticity (পূর্ণ স্থিতিস্থাপক চাহিদা)'
      ],
      correctIndex: 1,
      explanation: 'Introduced by Sir Robert Giffen, Giffen goods are inferior staple goods where the negative income effect outweighs the substitution effect—so when price rises, quantity demanded also rises (an exception to the Law of Demand).'
    },
    {
      id: 'q-eco-1002',
      subjectId: 'economics',
      chapterId: 'eco-2',
      categories: ['hsc', 'uni', 'bcs', 'bank', 'gov', 'gk'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'Macroeconomics • GDP & Fiscal Policy',
      question: 'Which institution in Bangladesh is responsible for formulating and implementing the Monetary Policy (মুদ্রানীতি) to control inflation and credit supply?',
      questionBn: 'বাংলাদেশে মুদ্রাস্ফীতি ও ঋণপ্রবাহ নিয়ন্ত্রণের লক্ষ্যে "মুদ্রানীতি" (Monetary Policy) প্রণয়ন ও বাস্তবায়ন করে কোন সংস্থা?',
      options: ['Ministry of Finance (অর্থ মন্ত্রণালয়)', 'Bangladesh Bank (বাংলাদেশ ব্যাংক)', 'National Board of Revenue (NBR)', 'Planning Commission (পরিকল্পনা কমিশন)'],
      correctIndex: 1,
      explanation: 'As the central bank of the country, Bangladesh Bank formulates and announces the Monetary Policy Statement (MPS) using instruments like Repo rate, Reverse Repo rate, CRR, and SLR, while the Ministry of Finance manages Fiscal Policy.'
    },
    {
      id: 'q-eco-1003',
      subjectId: 'economics',
      chapterId: 'eco-3',
      categories: ['hsc', 'uni', 'bcs', 'gov'],
      difficulty: 'Easy',
      questionType: 'standard',
      examTag: 'BCS & DU B-Unit • Civics & Good Governance',
      question: 'In the spirit of Montesque’s theory of Separation of Powers, what are the three primary organs of a modern democratic state?',
      questionBn: 'মন্টেস্কুর ক্ষমতা স্বতন্ত্রীকরণ নীতি অনুসারে আধুনিক গণতান্ত্রিক রাষ্ট্রের তিনটি মূল বিভাগ কী কী?',
      options: [
        'Executive, Legislature, and Judiciary (শাসন, আইন ও বিচার বিভাগ)',
        'President, Prime Minister, and Cabinet',
        'Local Government, Central Bank, and Election Commission',
        'Civil Service, Defense, and Parliament'
      ],
      correctIndex: 0,
      explanation: 'The three foundational branches of state governance are the Legislature (আইন বিভাগ), the Executive (শাসন/নির্বাহী বিভাগ), and the Judiciary (বিচার বিভাগ).'
    },
    {
      id: 'q-eco-1004',
      subjectId: 'economics',
      chapterId: 'eco-4',
      categories: ['ssc', 'hsc', 'uni', 'bcs', 'gov', 'gk'],
      difficulty: 'Medium',
      questionType: 'standard',
      examTag: 'History of Bengal • BCS & DU B-Unit',
      question: 'Which independent Sultan of Bengal initiated the golden era of the Ilyas Shahi dynasty and unified Sonargaon, Satgaon, and Lakhnauti into "Shah-i-Bangalah"?',
      questionBn: 'কোন সুলতান সোনারগাঁও, সাতগাঁও ও লখনৌতিকে একত্রিত করে সমগ্র বাংলায় ইলিয়াস শাহী বংশের স্বাধীন শাসন প্রতিষ্ঠা করেন এবং "শাহ-ই-বাঙ্গালাহ" উপাধি ধারণ করেন?',
      options: ['Fakhruddin Mubarak Shah', 'Shamsuddin Ilyas Shah (শামসুদ্দীন ইলিয়াস শাহ)', 'Alauddin Husain Shah', 'Ghiyasuddin Azam Shah'],
      correctIndex: 1,
      explanation: 'Sultan Shamsuddin Ilyas Shah unified the three regions of Bengal in 1352 CE, founding the Ilyas Shahi dynasty and earning the title "Shah-i-Bangalah" and "Sultan-i-Bangalah".'
    }
  ],

  /* ========================================================================
     CREATIVE QUESTION (সৃজনশীল প্রশ্ন — CQ) BANK (Step 3 Addition)
     Structure: উদ্দীপক (Stem) + ক (1), খ (2), গ (3), ঘ (4) + Model Answers
     ======================================================================== */
  creativeQuestions: [
    {
      id: 'cq-phy-1',
      subjectId: 'physics',
      chapterId: 'phy-1',
      categories: ['ssc', 'hsc'],
      boardTag: 'Dhaka Board Standard • Physics 1st Paper (Vectors)',
      title: 'নদী ও নৌকার আপেক্ষিক বেগ এবং লব্ধি ভেক্টর (River-Boat Vector Kinematics)',
      stemBn: '১.৫ কিমি প্রশস্ত একটি নদীতে স্রোতের বেগ ঘণ্টায় ৪ কিমি ($u = 4\\text{ km/h}$)। দুইজন মাঝি রহিম ও করিম একই স্থান থেকে ঘণ্টায় ৮ কিমি ($v = 8\\text{ km/h}$) বেগে নৌকা চালিয়ে নদী পার হতে যাত্রা শুরু করল। রহিম ন্যূনতম সময়ে (Minimum Time) এবং করিম ন্যূনতম দূরত্বে (Minimum Distance / সোজাসুজি) অপর পাড়ে পৌঁছাতে চায়।',
      stemEn: 'A river is $1.5\\text{ km}$ wide and flows with a current velocity of $u = 4\\text{ km/h}$. Two boatmen, Rahim and Karim, row with a velocity of $v = 8\\text{ km/h}$ relative to water. Rahim rows to cross in minimum time, while Karim rows to reach the exact opposite point (minimum distance).',
      parts: {
        ka: {
          marks: 1,
          label: 'ক) জ্ঞানমূলক (Knowledge — 1 Mark)',
          question: 'বিপ্রতীপ ভেক্টর (Reciprocal Vector) কাকে বলে?',
          answer: 'দুটি সমান্তরাল ভেক্টরের একটির মান যদি অপরটির মানের বিপরীত বা ব্যস্তানুপাতিক হয় (যেমন $\\vec{A} = 5\\hat{i}$ এবং $\\vec{B} = \\frac{1}{5}\\hat{i}$), তবে তাদেরকে পরস্পরের বিপ্রতীপ ভেক্টর বলে।'
        },
        kha: {
          marks: 2,
          label: 'খ) অনুধাবনমূলক (Comprehension — 2 Marks)',
          question: 'গুণটানা নৌকার দড়ি যত লম্বা হয় নৌকা সামনের দিকে তত দ্রুত চলে কেন? ব্যাখ্যা করো।',
          answer: 'গুণটানার সময় প্রযুক্ত বল $F$ অনুভূমিকের সাথে $\\theta$ কোণ উৎপন্ন করলে নৌকাকে সামনের দিকে গতিশীল করে অনুভূমিক উপাংশ $F\\cos\\theta$। দড়ি লম্বা হলে কোণ $\\theta$-এর মান ছোট হয় এবং $\\cos\\theta$-এর মান বৃদ্ধি পায়। ফলে সম্মুখমুখী কার্যকর বল $F\\cos\\theta$ বেশি হয় এবং নৌকা দ্রুত সামনে এগিয়ে যায়।'
        },
        ga: {
          marks: 3,
          label: 'গ) প্রয়োগমূলক (Application — 3 Marks)',
          question: 'করিমকে স্রোতের সাথে কত কোণে ($\alpha$) নৌকা চালাতে হবে যাতে সে সোজাসুজি অপর পাড়ে পৌঁছাতে পারে? গাণিতিকভাবে নির্ণয় করো।',
          answer: 'ন্যূনতম দূরত্বে বা সোজাসুজি নদী পার হওয়ার শর্তানুসারে, লব্ধি বেগ স্রোতের সাথে $90^\\circ$ কোণ উৎপন্ন করে। সূত্র: $\\cos\\alpha = -\\frac{u}{v}$। এখানে স্রোতের বেগ $u = 4\\text{ km/h}$ এবং নৌকার বেগ $v = 8\\text{ km/h}$। সুতরাং $\\cos\\alpha = -\\frac{4}{8} = -0.5 = \\cos 120^\\circ \\Rightarrow \\alpha = 120^\\circ$। অতএব করিমকে স্রোতের দিকের সাথে $120^\\circ$ কোণে নৌকা চালাতে হবে।'
        },
        gha: {
          marks: 4,
          label: 'ঘ) উচ্চতর দক্ষতামূলক (Higher-Order Analysis — 4 Marks)',
          question: 'রহিম ও করিমের মধ্যে কে আগে অপর পাড়ে পৌঁছাবে এবং তাদের সময়ের পার্থক্য কত হবে? গাণিতিক বিশ্লেষণের মাধ্যমে মতামত দাও।',
          answer: '১) রহিম ন্যূনতম সময়ে নদী পার হওয়ায় সে স্রোতের সাথে $\\alpha_1 = 90^\\circ$ কোণে যাত্রা করে। রহিমের সময় $t_1 = \\frac{d}{v\\sin 90^\\circ} = \\frac{1.5}{8 \\times 1} = 0.1875\\text{ ঘণ্টা} = 11.25\\text{ মিনিট}$।\n২) করিম স্রোতের সাথে $\\alpha_2 = 120^\\circ$ কোণে যাত্রা করে। করিমের সময় $t_2 = \\frac{d}{v\\sin 120^\\circ} = \\frac{1.5}{8 \\times (\\sqrt{3}/2)} = \\frac{1.5}{6.928} \\approx 0.2165\\text{ ঘণ্টা} = 12.99\\text{ মিনিট}$।\nসিদ্ধান্ত: যেহেতু $t_1 < t_2$, তাই রহিম $(12.99 - 11.25) = 1.74\\text{ মিনিট}$ আগে অপর পাড়ে পৌঁছাবে।'
        }
      }
    },
    {
      id: 'cq-chem-1',
      subjectId: 'chemistry',
      chapterId: 'chem-2',
      categories: ['ssc', 'hsc'],
      boardTag: 'Rajshahi Board Standard • Chemistry 1st Paper (Ch-4)',
      title: 'বাফার দ্রবণ ও হেন্ডারসন-হ্যাসেলবাক সমীকরণ (Buffer Solution & pH Resistance)',
      stemBn: 'একটি পরীক্ষাগারে পাত্র-A তে $25\\text{ mL } 0.1\\text{ M CH}_3\\text{COOH}$ ($K_a = 1.8 \\times 10^{-5}$) এবং পাত্র-B তে $15\\text{ mL } 0.1\\text{ M NaOH}$ দ্রবণ রয়েছে। পরবর্তীতে উভয় পাত্রের দ্রবণকে একত্রে মিশ্রিত করে মিশ্রণ-C প্রস্তুত করা হলো।',
      stemEn: 'Container A holds $25\\text{ mL}$ of $0.1\\text{ M CH}_3\\text{COOH}$ ($K_a = 1.8 \\times 10^{-5}$) and Container B holds $15\\text{ mL}$ of $0.1\\text{ M NaOH}$. Both solutions are mixed together to form Mixture C.',
      parts: {
        ka: {
          marks: 1,
          label: 'ক) জ্ঞানমূলক (Knowledge — 1 Mark)',
          question: 'সবুজ রসায়ন (Green Chemistry) কী?',
          answer: 'পরিবেশের ক্ষতি না করে বা ন্যূনতম দূষণ ঘটিয়ে রাসায়নিক দ্রব্য উৎপাদন ও ব্যবহারের পরিবেশবান্ধব প্রযুক্তি ও দর্শনকে সবুজ রসায়ন (Green Chemistry) বলে।'
        },
        kha: {
          marks: 2,
          label: 'খ) অনুধাবনমূলক (Comprehension — 2 Marks)',
          question: 'বিশুদ্ধ পানির pH-এর মান তাপমাত্রা বৃদ্ধির সাথে হ্রাস পায় কেন?',
          answer: 'পানির বিয়োজন একটি তাপহারী (Endothermic) প্রক্রিয়া: $\\text{H}_2\\text{O} \\rightleftharpoons \\text{H}^+ + \\text{OH}^-$। লা-শাতেলিয়ারের নীতি অনুসারে তাপমাত্রা বাড়ালে পানির বিয়োজন মাত্রা বৃদ্ধি পায় এবং $[\\text{H}^+]$ আয়নের ঘনমাত্রা $10^{-7}\\text{ M}$ অপেক্ষা বেশি হয়। ফলে $\\text{pH} = -\\log[\\text{H}^+]$ অনুযায়ী pH-এর মান ৭-এর চেয়ে কিছুটা কমে যায় (তবুও দ্রবণ প্রশম থাকে)।'
        },
        ga: {
          marks: 3,
          label: 'গ) প্রয়োগমূলক (Application — 3 Marks)',
          question: 'মিশ্রণ-C এর pH মান গাণিতিকভাবে নির্ণয় করো।',
          answer: 'বিক্রিয়া: $\\text{CH}_3\\text{COOH} + \\text{NaOH} \\to \\text{CH}_3\\text{COONa} + \\text{H}_2\\text{O}$।\nপ্রাথমিক মিলিমোল: $n_{\\text{acid}} = 25 \\times 0.1 = 2.5\\text{ mmol}$; $n_{\\text{base}} = 15 \\times 0.1 = 1.5\\text{ mmol}$।\nবিক্রিয়ার পর উৎপন্ন লবণ $\\text{CH}_3\\text{COONa} = 1.5\\text{ mmol}$ এবং অবশিষ্ট অম্ল $\\text{CH}_3\\text{COOH} = 2.5 - 1.5 = 1.0\\text{ mmol}$।\nহেন্ডারসন-হ্যাসেলবাক সমীকরণ অনুসারে: $\\text{pH} = \\text{p}K_a + \\log\\left(\\frac{\\text{Salt}}{\\text{Acid}}\\right) = -\\log(1.8 \\times 10^{-5}) + \\log\\left(\\frac{1.5}{1.0}\\right) = 4.7447 + 0.1761 = 4.92$।'
        },
        gha: {
          marks: 4,
          label: 'ঘ) উচ্চতর দক্ষতামূলক (Higher-Order Analysis — 4 Marks)',
          question: 'মিশ্রণ-C তে সামান্য পরিমাণ তীব্র অম্ল ($\\text{HCl}$) বা তীব্র ক্ষার ($\\text{NaOH}$) যোগ করলে pH-এর মানের কোনো লক্ষণীয় পরিবর্তন হবে কি? কৌশলসহ বিশ্লেষণ করো।',
          answer: 'মিশ্রণ-C একটি অম্লীয় বাফার দ্রবণ কারণ এতে দুর্বল অম্ল ($\text{CH}_3\text{COOH}$) ও তার অনুবন্ধী ক্ষারকের লবণ ($\text{CH}_3\text{COONa}$) বিদ্যমান।\n১) সামান্য তীব্র অম্ল ($\text{H}^+$) যোগ করলে দ্রবণের অ্যাসিটেট আয়ন তা প্রশমিত করে: $\\text{CH}_3\\text{COO}^- + \\text{H}^+ \\rightleftharpoons \\text{CH}_3\\text{COOH}$ (মৃদু তড়িৎ বিশ্লেষ্য)।\n২) সামান্য তীব্র ক্ষার ($\text{OH}^-$) যোগ করলে দুর্বল অম্ল তা প্রশমিত করে পানি তৈরি করে: $\\text{CH}_3\\text{COOH} + \\text{OH}^- \\to \\text{CH}_3\\text{COO}^- + \\text{H}_2\\text{O}$।\nফলে মিশ্রণ-C এর pH মানের কোনো লক্ষণীয় পরিবর্তন হবে না।'
        }
      }
    },
    {
      id: 'cq-acc-1',
      subjectId: 'accounting',
      chapterId: 'acc-1',
      categories: ['ssc', 'hsc'],
      boardTag: 'Comilla Board Standard • Accounting 1st Paper',
      title: 'হিসাব সমীকরণে লেনদেনের প্রভাব ও বিবরণী ছক (Accounting Equation Analysis)',
      stemBn: 'জনাব রাফি ২০২৬ সালের ১ জানুয়ারি নগদ ১,০০,০০০ টাকা এবং ৫০,০০০ টাকার অফিস সরঞ্জাম নিয়ে "রাফি কনসালটেন্সি" নামে একটি ব্যবসায় শুরু করেন। উক্ত মাসে তাঁর অন্যান্য লেনদেন: ৫ জানুয়ারি ধারে সেবা প্রদান ৩০,০০০ টাকা; ১২ জানুয়ারি অফিস ভাড়া প্রদান ১০,০০০ টাকা; ২০ জানুয়ারি ব্যক্তিগত প্রয়োজনে নগদ উত্তোলন ৫,০০০ টাকা।',
      stemEn: 'Mr. Rafi started "Rafi Consultancy" on Jan 1, 2026 with Cash Tk 1,00,000 and Office Equipment Tk 50,000. Other transactions: Jan 5 Service provided on credit Tk 30,000; Jan 12 Paid office rent Tk 10,000; Jan 20 Withdrew cash for personal use Tk 5,000.',
      parts: {
        ka: {
          marks: 1,
          label: 'ক) জ্ঞানমূলক (Knowledge — 1 Mark)',
          question: 'প্রারম্ভিক মূলধন (Opening Capital) কাকে বলে?',
          answer: 'ব্যবসায়ের শুরুতে মালিক যে নগদ অর্থ, পণ্যদ্রব্য বা অন্যান্য সম্পত্তি ব্যবসায় সরবরাহ করেন, তার সমষ্টিকে প্রারম্ভিক মূলধন বলে।'
        },
        kha: {
          marks: 2,
          label: 'খ) অনুধাবনমূলক (Comprehension — 2 Marks)',
          question: '"সকল লেনদেনই ঘটনা, কিন্তু সকল ঘটনা লেনদেন নয়"—ব্যাখ্যা করো।',
          answer: 'যেসব ঘটনার ফলে ব্যবসায়ের আর্থিক অবস্থার পরিবর্তন ঘটে এবং যা অর্থের অঙ্কে পরিমাপযোগ্য, কেবল সেগুলোকেই লেনদেন বলা হয়। যেমন কর্মচারী নিয়োগ একটি ঘটনা হলেও সাথে সাথে আর্থিক অবস্থার পরিবর্তন না হওয়ায় তা লেনদেন নয়; কিন্তু বেতন প্রদান ঘটনা ও লেনদেন উভয়ই।'
        },
        ga: {
          marks: 3,
          label: 'গ) প্রয়োগমূলক (Application — 3 Marks)',
          question: 'জনাব রাফির প্রারম্ভিক মূলধন এবং মাস শেষে নিট সেবা আয়ের পরিমাণ নির্ণয় করো।',
          answer: '১) প্রারম্ভিক মূলধন = প্রারম্ভিক নগদ (১,০০,০০০) + অফিস সরঞ্জাম (৫০,০০০) = ১,৫০,০০০ টাকা।\n২) নিট সেবা আয় = সেবা আয় (৩০,০০০) − অফিস ভাড়া ব্যয় (১০,০০০) = ২০,০০০ টাকা।'
        },
        gha: {
          marks: 4,
          label: 'ঘ) উচ্চতর দক্ষতামূলক (Higher-Order Analysis — 4 Marks)',
          question: 'মাস শেষে হিসাব সমীকরণের ($A = L + OE$) উভয় পাশের যোগফল সমান কি না তা গাণিতিকভাবে যাচাই করো।',
          answer: 'মাস শেষে মোট সম্পদ ($A$): নগদ ($1,00,000 - 10,000 - 5,000 = 85,000$) + প্রাপ্য হিসাব ($30,000$) + অফিস সরঞ্জাম ($50,000$) = $1,65,000$ টাকা।\nমোট দায় ($L$) = $0$ টাকা।\nমালিকানা স্বত্ব ($OE$) = মূলধন ($1,50,000$) + সেবা আয় ($30,000$) − ভাড়া ব্যয় ($10,000$) − উত্তোলন ($5,000$) = $1,65,000$ টাকা।\nসুতরাং $A (1,65,000) = L (0) + OE (1,65,000)$ — হিসাব সমীকরণের উভয় পাশ সম্পূর্ণ সমান।'
        }
      }
    }
  ],

  /* Curated Model Test & Daily Challenge Packs */
  recommendedQuizzes: [
    {
      id: 'pack-daily',
      title: 'ExamVerse Daily Merit Sprint',
      titleBn: 'ডেইলি মেরিট স্প্রিন্ট চ্যালেঞ্জ',
      subtitle: '8 interdisciplinary questions across Physics, Chemistry, Math, Biology, English, Bangla, GK & ICT',
      category: 'uni',
      subjectId: 'all',
      questionIds: ['q-phy-101', 'q-chem-201', 'q-math-301', 'q-bio-401', 'q-eng-501', 'q-bn-601', 'q-gk-701', 'q-ict-801'],
      durationSec: 360,
      negativeMark: 0.25,
      xpReward: 150,
      badgeText: 'Daily Challenge'
    },
    {
      id: 'pack-bcs-core',
      title: 'BCS Preliminary Comprehensive Model Test',
      titleBn: 'বিসিএস প্রিলিমিনারি মডেল টেস্ট',
      subtitle: 'Bangla Literature, Constitution, Geopolitics, Economics, English Grammar, ICT & Analytical Ability',
      category: 'bcs',
      subjectId: 'gk',
      questionIds: ['q-bn-601', 'q-bn-604', 'q-eng-501', 'q-eng-502', 'q-gk-701', 'q-gk-702', 'q-eco-1002', 'q-ict-804'],
      durationSec: 360,
      negativeMark: 0.5,
      xpReward: 120,
      badgeText: 'BCS Standard (-0.50)'
    },
    {
      id: 'pack-stem-admission',
      title: 'BUET & DU A-Unit STEM Diagnostic',
      titleBn: 'বুয়েট ও ঢাবি ক-ইউনিট ডায়াগনস্টিক',
      subtitle: 'Vectors, Multi-Statement Mechanics, Thermodynamics, Calculus, Complex Numbers & Electrochemistry',
      category: 'eng',
      subjectId: 'physics',
      questionIds: ['q-phy-101', 'q-phy-105', 'q-phy-102', 'q-chem-202', 'q-chem-204', 'q-math-301', 'q-math-302', 'q-math-304'],
      durationSec: 420,
      negativeMark: 0.25,
      xpReward: 140,
      badgeText: 'STEM High-Yield'
    },
    {
      id: 'pack-medical-rapid',
      title: 'Medical MBBS Admission Standard Set',
      titleBn: 'মেডিকেল ভর্তি স্ট্যান্ডার্ড মডেল সেট',
      subtitle: 'Cell Organelles, Meiosis Crossing Over, Cardiac Pacemaker, Lethal Genes, C4 Pathway & pH',
      category: 'med',
      subjectId: 'biology',
      questionIds: ['q-bio-401', 'q-bio-405', 'q-bio-402', 'q-bio-403', 'q-bio-404', 'q-chem-201', 'q-eng-501', 'q-gk-701'],
      durationSec: 360,
      negativeMark: 0.25,
      xpReward: 125,
      badgeText: 'Medical (-0.25)'
    }
  ],

  /* Metallic Geometric Achievement Badges — Strictly Locked Until Earned */
  achievements: [
    {
      id: 'badge-first-step',
      title: 'First Meridian',
      titleBn: 'প্রথম পদক্ষেপ',
      description: 'Complete your first valid quiz or examination session (at least 1 question answered).',
      xpBonus: 50,
      tier: 'bronze',
      unlockedByDefault: false
    },
    {
      id: 'badge-streak-7',
      title: 'Septenary Flame',
      titleBn: '৭ দিনের ধারাবাহিকতা',
      description: 'Maintain an active study streak for 7 consecutive calendar days.',
      xpBonus: 150,
      tier: 'gold',
      unlockedByDefault: false
    },
    {
      id: 'badge-precision-90',
      title: 'Apex Precision',
      titleBn: 'নির্ভুল মেধা (৯০%+)',
      description: 'Score 90% or higher accuracy in a quiz with at least 3 attempted questions.',
      xpBonus: 200,
      tier: 'gold',
      unlockedByDefault: false
    },
    {
      id: 'badge-stem-scholar',
      title: 'Vector & Calculus Savant',
      titleBn: 'বিজ্ঞান ও গণিত বিশারদ',
      description: 'Correctly solve 20+ Physics, Chemistry, and Higher Mathematics questions.',
      xpBonus: 180,
      tier: 'silver',
      unlockedByDefault: false
    },
    {
      id: 'badge-mistake-conqueror',
      title: 'Zero Deficit',
      titleBn: 'ভুল সংশোধনকারী',
      description: 'Master at least 3 logged mistakes and bring your Mistake Bank count down to 0.',
      xpBonus: 120,
      tier: 'silver',
      unlockedByDefault: false
    },
    {
      id: 'badge-centurion',
      title: 'Centurion Scholar',
      titleBn: 'শততম কুইজ ও মেধা চূড়া',
      description: 'Reach Level 10 and accumulate 4,500+ total XP.',
      xpBonus: 350,
      tier: 'gold',
      unlockedByDefault: false
    }
  ],

  /* Community Benchmark Leaderboard */
  leaderboards: {
    global: {
      today: [
        { rank: 1, name: 'Nafis Rahman', handle: '@nafis_buet', avatar: 'NR', level: 18, xp: 640, badge: 'BUET Track', isFriend: true },
        { rank: 2, name: 'Tasnim Zara', handle: '@tasnim_dmc', avatar: 'TZ', level: 17, xp: 590, badge: 'Medical Track', isFriend: true },
        { rank: 3, name: 'Mahir Labib', handle: '@mahir_du', avatar: 'ML', level: 15, xp: 520, badge: 'DU A-Unit', isFriend: false },
        { rank: 4, name: 'Sadia Islam', handle: '@sadia_bcs', avatar: 'SI', level: 16, xp: 445, badge: '47th BCS', isFriend: true },
        { rank: 5, name: 'Farhan Sadik', handle: '@farhan_hsc', avatar: 'FS', level: 13, xp: 410, badge: 'HSC 26', isFriend: false },
        { rank: 6, name: 'Nusrat Jahan', handle: '@nusrat_ju', avatar: 'NJ', level: 12, xp: 375, badge: 'University', isFriend: false }
      ],
      week: [
        { rank: 1, name: 'Tasnim Zara', handle: '@tasnim_dmc', avatar: 'TZ', level: 17, xp: 3420, badge: 'Medical Track', isFriend: true },
        { rank: 2, name: 'Nafis Rahman', handle: '@nafis_buet', avatar: 'NR', level: 18, xp: 3290, badge: 'BUET Track', isFriend: true },
        { rank: 3, name: 'Sadia Islam', handle: '@sadia_bcs', avatar: 'SI', level: 16, xp: 2610, badge: '47th BCS', isFriend: true },
        { rank: 4, name: 'Mahir Labib', handle: '@mahir_du', avatar: 'ML', level: 15, xp: 2490, badge: 'DU A-Unit', isFriend: false },
        { rank: 5, name: 'Tanvir Ahmed', handle: '@tanvir_bank', avatar: 'TA', level: 14, xp: 2180, badge: 'Bank Jobs', isFriend: true },
        { rank: 6, name: 'Farhan Sadik', handle: '@farhan_hsc', avatar: 'FS', level: 13, xp: 1950, badge: 'HSC 26', isFriend: false }
      ],
      alltime: [
        { rank: 1, name: 'Nafis Rahman', handle: '@nafis_buet', avatar: 'NR', level: 18, xp: 18450, badge: 'BUET Track', isFriend: true },
        { rank: 2, name: 'Tasnim Zara', handle: '@tasnim_dmc', avatar: 'TZ', level: 17, xp: 17210, badge: 'Medical Track', isFriend: true },
        { rank: 3, name: 'Sadia Islam', handle: '@sadia_bcs', avatar: 'SI', level: 16, xp: 15890, badge: '47th BCS', isFriend: true },
        { rank: 4, name: 'Mahir Labib', handle: '@mahir_du', avatar: 'ML', level: 15, xp: 14620, badge: 'DU A-Unit', isFriend: false },
        { rank: 5, name: 'Tanvir Ahmed', handle: '@tanvir_bank', avatar: 'TA', level: 14, xp: 12900, badge: 'Bank Jobs', isFriend: true },
        { rank: 6, name: 'Farhan Sadik', handle: '@farhan_hsc', avatar: 'FS', level: 13, xp: 11400, badge: 'HSC 26', isFriend: false }
      ]
    }
  },

  /* Dynamic Real Count Helpers */
  getSubjectQuestionCount: function (subjectId) {
    return this.questions.filter(function (q) {
      return q.subjectId === subjectId;
    }).length;
  },

  getChapterQuestionCount: function (chapterId) {
    return this.questions.filter(function (q) {
      return q.chapterId === chapterId;
    }).length;
  },

  getCategoryQuestionCount: function (categoryId) {
    return this.questions.filter(function (q) {
      return q.categories && q.categories.indexOf(categoryId) !== -1;
    }).length;
  },

  getCategoryChapterCount: function (categoryId) {
    var cat = this.examCategories.find(function (c) { return c.id === categoryId; });
    if (!cat) return 0;
    var total = 0;
    this.subjects.forEach(function (s) {
      if (cat.subjects.indexOf(s.id) !== -1) {
        total += s.chapters.length;
      }
    });
    return total;
  }
};
