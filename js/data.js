/* ==========================================================================
   ExamVerse — Verified Syllabus & Question Bank (js/data.js)
   Audit Fixes Applied:
   - All 32 chapters across all 8 subjects have verified questions
   - Dynamic question & model test count helpers (zero fake inflated numbers)
   - Fixed q-bio-401 animal cell specificity & added textbook source references
   - All achievement badges start locked (unlockedByDefault: false)
   ========================================================================== */

window.EXAMVERSE_DATA = {
  /* 9 Exam Categories (Counts computed dynamically via helper methods below) */
  examCategories: [
    {
      id: 'ssc',
      name: 'SSC',
      nameBn: 'এসএসসি (SSC)',
      fullTitle: 'Secondary School Certificate',
      badge: 'Class 9–10',
      description: 'Board syllabus chapter-wise MCQ mastery for Science, Humanities & Business Studies.',
      subjects: ['physics', 'chemistry', 'math', 'biology', 'english', 'bangla', 'gk', 'ict'],
      defaultNegativeMark: 0,
      iconType: 'book'
    },
    {
      id: 'hsc',
      name: 'HSC',
      nameBn: 'এইচএসসি (HSC)',
      fullTitle: 'Higher Secondary Certificate',
      badge: 'Class 11–12',
      description: 'First & Second Paper board standard MCQs with analytical problem explanations.',
      subjects: ['physics', 'chemistry', 'math', 'biology', 'english', 'bangla', 'ict'],
      defaultNegativeMark: 0,
      iconType: 'layers'
    },
    {
      id: 'uni',
      name: 'University Admission',
      nameBn: 'বিশ্ববিদ্যালয় ভর্তি',
      fullTitle: 'DU, JU, RU, CU & GST Cluster',
      badge: 'A, B, C & D Unit',
      description: 'Conceptual MCQs curated from public university admission tests with optional -0.25 negative marking.',
      subjects: ['physics', 'chemistry', 'math', 'biology', 'english', 'bangla', 'gk', 'ict'],
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
      fullTitle: 'Bangladesh Civil Service Preliminary',
      badge: '-0.50 Negative Mark',
      description: 'Coverage of BCS Preliminary syllabus pillars with -0.50 negative marking in Exam Mode.',
      subjects: ['bangla', 'english', 'gk', 'math', 'ict', 'biology', 'physics', 'chemistry'],
      defaultNegativeMark: 0.5,
      iconType: 'landmark'
    },
    {
      id: 'bank',
      name: 'Bank Jobs',
      nameBn: 'ব্যাংক জব প্রিপারেশন',
      fullTitle: 'Bangladesh Bank & Combined Banks',
      badge: 'Officer & Cash',
      description: 'Quantitative aptitude, analytical puzzles, high-level English vocabulary, and financial ICT.',
      subjects: ['math', 'english', 'ict', 'gk', 'bangla'],
      defaultNegativeMark: 0.25,
      iconType: 'briefcase'
    },
    {
      id: 'gov',
      name: 'Government Jobs',
      nameBn: 'সরকারি চাকরি প্রস্তুতি',
      fullTitle: 'NTRCA, Primary & Ministry Exams',
      badge: '9th–16th Grade',
      description: 'Targeted preparation for teacher registration, directorate exams, and ministerial recruitment.',
      subjects: ['bangla', 'english', 'math', 'gk', 'ict', 'biology'],
      defaultNegativeMark: 0.25,
      iconType: 'shield'
    },
    {
      id: 'gk',
      name: 'General Knowledge',
      nameBn: 'সাধারণ জ্ঞান ও সাম্প্রতিক',
      fullTitle: 'Bangladesh, International & Current Affairs',
      badge: 'Verified Facts',
      description: 'Liberation war history, constitution, geopolitics, economic surveys, and scientific discoveries.',
      subjects: ['gk', 'ict', 'bangla', 'english'],
      defaultNegativeMark: 0,
      iconType: 'globe'
    }
  ],

  /* 8 Core Subjects with 4 Chapters each (32 Chapters Total — Every Chapter Populated) */
  subjects: [
    {
      id: 'physics',
      name: 'Physics',
      nameBn: 'পদার্থবিজ্ঞান (Physics)',
      icon: 'atom',
      accent: 'indigo',
      chapters: [
        { id: 'phy-1', title: 'Vectors & Classical Mechanics', titleBn: 'ভেক্টর ও নিউটনিয়ান বলবিদ্যা', difficulty: 'Medium' },
        { id: 'phy-2', title: 'Thermodynamics & Ideal Gas', titleBn: 'তাপগতিবিদ্যা ও আদর্শ গ্যাস', difficulty: 'Hard' },
        { id: 'phy-3', title: 'Current Electricity & Magnetism', titleBn: 'চল তড়িৎ ও চুম্বকত্ব', difficulty: 'Medium' },
        { id: 'phy-4', title: 'Modern Physics & Semiconductors', titleBn: 'আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স', difficulty: 'Easy' }
      ]
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      nameBn: 'রসায়ন (Chemistry)',
      icon: 'flask',
      accent: 'violet',
      chapters: [
        { id: 'chem-1', title: 'Atomic Structure & Periodic Table', titleBn: 'পরমাণুর গঠন ও পর্যায় সারণি', difficulty: 'Easy' },
        { id: 'chem-2', title: 'Chemical Equilibrium & Acids-Bases', titleBn: 'রাসায়নিক সাম্যবস্থা ও অম্ল-ক্ষারক', difficulty: 'Medium' },
        { id: 'chem-3', title: 'Organic Chemistry & Hydrocarbons', titleBn: 'জৈব রসায়ন ও হাইড্রোকার্বন', difficulty: 'Hard' },
        { id: 'chem-4', title: 'Electrochemistry & Quantitative Analysis', titleBn: 'তড়িৎ রসায়ন ও পরিমাণগত রসায়ন', difficulty: 'Medium' }
      ]
    },
    {
      id: 'math',
      name: 'Higher Mathematics',
      nameBn: 'উচ্চতর গণিত ও গাণিতিক যুক্তি',
      icon: 'sigma',
      accent: 'indigo',
      chapters: [
        { id: 'math-1', title: 'Differential & Integral Calculus', titleBn: 'অন্তরীকরণ ও যোগজীকরণ (Calculus)', difficulty: 'Hard' },
        { id: 'math-2', title: 'Matrices, Determinants & Vectors', titleBn: 'ম্যাট্রিক্স, নির্ণায়ক ও ভেক্টর', difficulty: 'Easy' },
        { id: 'math-3', title: 'Trigonometry & Complex Numbers', titleBn: 'ত্রিকোণমিতি ও জটিল সংখ্যা', difficulty: 'Medium' },
        { id: 'math-4', title: 'Combinatorics, Probability & Aptitude', titleBn: 'বিন্যাস, সমাবেশ ও সম্ভাব্যতা', difficulty: 'Medium' }
      ]
    },
    {
      id: 'biology',
      name: 'Biology',
      nameBn: 'জীববিজ্ঞান (Biology)',
      icon: 'dna',
      accent: 'emerald',
      chapters: [
        { id: 'bio-1', title: 'Cell Structure, Division & Biochemistry', titleBn: 'কোষ ও এর গঠন এবং কোষ বিভাজন', difficulty: 'Easy' },
        { id: 'bio-2', title: 'Human Physiology: Blood & Circulation', titleBn: 'মানব শারীরতত্ত্ব: রক্ত ও সঞ্চালন', difficulty: 'Medium' },
        { id: 'bio-3', title: 'Genetics, Evolution & Biotechnology', titleBn: 'জিনতত্ত্ব, বিবর্তন ও জীবপ্রযুক্তি', difficulty: 'Hard' },
        { id: 'bio-4', title: 'Plant Physiology & Taxonomy', titleBn: 'উদ্ভিদ শারীরতত্ত্ব ও শ্রেণিবিন্যাস', difficulty: 'Medium' }
      ]
    },
    {
      id: 'english',
      name: 'English Language & Literature',
      nameBn: 'ইংরেজি ভাষা ও সাহিত্য',
      icon: 'feather',
      accent: 'violet',
      chapters: [
        { id: 'eng-1', title: 'Parts of Speech, Clauses & Modifiers', titleBn: 'Parts of Speech, Clauses & Phrases', difficulty: 'Medium' },
        { id: 'eng-2', title: 'Right Form of Verbs & Subject-Verb Agreement', titleBn: 'Subject-Verb Agreement & Tense', difficulty: 'Easy' },
        { id: 'eng-3', title: 'English Literary Periods & Masterpieces', titleBn: 'Renaissance to Modern English Literature', difficulty: 'Hard' },
        { id: 'eng-4', title: 'High-Frequency Vocabulary & Idioms', titleBn: 'Synonyms, Antonyms & Idiomatic Usage', difficulty: 'Medium' }
      ]
    },
    {
      id: 'bangla',
      name: 'Bangla Sahitya & Grammar',
      nameBn: 'বাংলা সাহিত্য ও ব্যাকরণ',
      icon: 'scroll',
      accent: 'indigo',
      chapters: [
        { id: 'bn-1', title: 'ধ্বনিতত্ত্ব, সন্ধি ও বানান রীতি (Phonology & Sandhi)', titleBn: 'ধ্বনিতত্ত্ব, সন্ধি ও প্রমিত বাংলা বানান', difficulty: 'Easy' },
        { id: 'bn-2', title: 'সমাস, কারক-বিভক্তি ও প্রত্যয় (Samas & Karaka)', titleBn: 'সমাস, কারক-বিভক্তি ও প্রকৃতি-প্রত্যয়', difficulty: 'Medium' },
        { id: 'bn-3', title: 'প্রাচীন ও মধ্যযুগের বাংলা সাহিত্য (Ancient & Medieval)', titleBn: 'চর্যাপদ, শ্রীকৃষ্ণকীর্তন ও মঙ্গলকাব্য', difficulty: 'Medium' },
        { id: 'bn-4', title: 'আধুনিক যুগের সাহিত্য: রবীন্দ্র-নজরুল ও মুক্তিযুদ্ধ', titleBn: 'আধুনিক বাংলা সাহিত্য ও মুক্তিযুদ্ধভিত্তিক রচনা', difficulty: 'Easy' }
      ]
    },
    {
      id: 'gk',
      name: 'Bangladesh & Global Affairs',
      nameBn: 'বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী',
      icon: 'globe',
      accent: 'emerald',
      chapters: [
        { id: 'gk-1', title: '1952 Language Movement to 1971 Liberation War', titleBn: 'ভাষা আন্দোলন থেকে ১৯৭১ মহান মুক্তিযুদ্ধ', difficulty: 'Easy' },
        { id: 'gk-2', title: 'Constitution of Bangladesh & State Organs', titleBn: 'বাংলাদেশের সংবিধান ও রাষ্ট্রীয় কাঠামো', difficulty: 'Hard' },
        { id: 'gk-3', title: 'Global Organizations, Treaties & Geopolitics', titleBn: 'জাতিসংঘ, আন্তর্জাতিক সংস্থা ও ভূ-রাজনীতি', difficulty: 'Medium' },
        { id: 'gk-4', title: 'Geography, Climate & Sustainable Development', titleBn: 'ভূগোল, জলবায়ু পরিবর্তন ও সুনীল অর্থনীতি', difficulty: 'Medium' }
      ]
    },
    {
      id: 'ict',
      name: 'ICT & Analytical Ability',
      nameBn: 'তথ্যপ্রযুক্তি ও মানসিক দক্ষতা',
      icon: 'cpu',
      accent: 'violet',
      chapters: [
        { id: 'ict-1', title: 'Number Systems, Boolean Algebra & Logic Gates', titleBn: 'সংখ্যা পদ্ধতি, বুলিয়ান বীজগণিত ও লজিক গেট', difficulty: 'Easy' },
        { id: 'ict-2', title: 'Networking, Cyber Security & Cloud Computing', titleBn: 'নেটওয়ার্কিং, সাইবার নিরাপত্তা ও ক্লাউড', difficulty: 'Medium' },
        { id: 'ict-3', title: 'C Programming, Algorithms & DBMS SQL', titleBn: 'সি প্রোগ্রামিং, অ্যালগরিদম ও ডেটাবেজ (SQL)', difficulty: 'Hard' },
        { id: 'ict-4', title: 'Analytical Puzzles, Coding-Decoding & Spatial Logic', titleBn: 'মানসিক দক্ষতা ও গাণিতিক বিশ্লেষণ', difficulty: 'Medium' }
      ]
    }
  ],

  /* Verified Question Bank Covering All 32 Chapters */
  questions: [
    /* --- PHYSICS (phy-1 to phy-4) --- */
    {
      id: 'q-phy-101',
      subjectId: 'physics',
      chapterId: 'phy-1',
      categories: ['hsc', 'uni', 'eng', 'ssc'],
      difficulty: 'Medium',
      examTag: 'BUET / DU A-Unit • NCTB Physics 1st Paper Ch-2',
      question: 'If the magnitude of the resultant of two forces of equal magnitude P acting at a point is also P, what is the angle θ between the two forces?',
      questionBn: 'কোনো বিন্দুতে ক্রিয়াশীল দুটি সমান বল P-এর লব্ধির মানও যদি P হয়, তবে বলদ্বয়ের মধ্যবর্তী কোণ θ কত?',
      options: ['60°', '90°', '120°', '180°'],
      correctIndex: 2,
      explanation: 'Using the parallelogram law of vectors: R² = P² + Q² + 2PQ cosθ. Since R = P and Q = P, we have P² = P² + P² + 2P² cosθ ⇒ 2P² cosθ = −P² ⇒ cosθ = −1/2. Therefore, θ = 120°.'
    },
    {
      id: 'q-phy-105',
      subjectId: 'physics',
      chapterId: 'phy-1',
      categories: ['ssc', 'hsc', 'uni', 'eng'],
      difficulty: 'Easy',
      examTag: 'DU A-Unit • Classical Mechanics Ch-4',
      question: 'At what launch angle θ with the horizontal does a projectile achieve its maximum horizontal range R_max (neglecting air resistance)?',
      questionBn: 'বায়ুর বাধা উপেক্ষা করলে অনুভূমিকের সাথে কত কোণে (θ) কোনো প্রাসকে নিক্ষেপ করলে তার অনুভূমিক পাল্লা (Horizontal Range) সর্বাধিক হবে?',
      options: ['30°', '45°', '60°', '90°'],
      correctIndex: 1,
      explanation: 'Horizontal range R = (v₀² sin 2θ) / g. Since the maximum value of sin 2θ is 1 (when 2θ = 90°), maximum range occurs at θ = 45°.'
    },
    {
      id: 'q-phy-102',
      subjectId: 'physics',
      chapterId: 'phy-2',
      categories: ['hsc', 'uni', 'med', 'eng'],
      difficulty: 'Hard',
      examTag: 'HSC / Medical • Physics 2nd Paper Ch-1',
      question: 'A Carnot heat engine operates between a source at 327°C and a sink at 27°C. What is the maximum thermal efficiency (η) of this engine?',
      questionBn: 'একটি কার্নো ইঞ্জিন 327°C তাপমাত্রার উৎস এবং 27°C তাপমাত্রার গ্রাহকের মধ্যে কাজ করে। ইঞ্জিনটির সর্বোচ্চ কর্মদক্ষতা (η) কত?',
      options: ['45%', '50%', '60%', '75%'],
      correctIndex: 1,
      explanation: 'Convert temperatures to Kelvin first: T₁ = 327 + 273 = 600 K and T₂ = 27 + 273 = 300 K. Carnot efficiency η = (1 − T₂ / T₁) × 100% = (1 − 300 / 600) × 100% = 50%.'
    },
    {
      id: 'q-phy-103',
      subjectId: 'physics',
      chapterId: 'phy-3',
      categories: ['ssc', 'hsc', 'uni', 'bcs'],
      difficulty: 'Easy',
      examTag: 'SSC / HSC • Current Electricity Ch-3',
      question: 'Three resistors of 6 Ω each are connected in parallel across a 12 V ideal battery. What is the total current drawn from the battery?',
      questionBn: '৬ Ω মানের তিনটি রোধ সমান্তরালে যুক্ত করে ১২ V তড়িৎচালক শক্তির আদর্শ কোষে যুক্ত করলে বর্তনীর মূল প্রবাহ কত হবে?',
      options: ['2 A', '4 A', '6 A', '18 A'],
      correctIndex: 2,
      explanation: 'For three identical 6 Ω resistors in parallel, equivalent resistance R_eq = 6 / 3 = 2 Ω. By Ohm’s law, total current I = V / R_eq = 12 V / 2 Ω = 6 A.'
    },
    {
      id: 'q-phy-104',
      subjectId: 'physics',
      chapterId: 'phy-4',
      categories: ['hsc', 'uni', 'eng'],
      difficulty: 'Medium',
      examTag: 'Engineering & DU • Modern Physics Ch-9',
      question: 'The half-life of a radioactive isotope is 15 days. How many days will it take for 87.5% of the initial sample to decay?',
      questionBn: 'একটি তেজস্ক্রিয় মৌলের অর্ধায়ু ১৫ দিন। মৌলটির প্রারম্ভিক পরিমাণের ৮৭.৫% ক্ষয় হতে কত দিন সময় লাগবে?',
      options: ['30 days', '45 days', '60 days', '75 days'],
      correctIndex: 1,
      explanation: 'If 87.5% decays, the remaining undecayed fraction is 12.5% = 1/8 = (1/2)³ of the original sample. That requires 3 half-lives: t = 3 × T_(1/2) = 3 × 15 days = 45 days.'
    },

    /* --- CHEMISTRY (chem-1 to chem-4) --- */
    {
      id: 'q-chem-202',
      subjectId: 'chemistry',
      chapterId: 'chem-1',
      categories: ['hsc', 'uni', 'med', 'eng'],
      difficulty: 'Medium',
      examTag: 'DU / Medical • Chemistry 1st Paper Ch-3',
      question: 'Which of the following species has an sp³d² hybridization and a regular octahedral molecular geometry?',
      questionBn: 'নিচের কোন যৌগটিতে sp³d² সংকরায়ণ এবং সুষম অষ্টতলকীয় (Octahedral) জ্যামিতিক গঠন বিদ্যমান?',
      options: ['PCl₅', 'SF₆', 'BF₃', 'NH₃'],
      correctIndex: 1,
      explanation: 'In SF₆ (Sulfur hexafluoride), the central sulfur atom forms 6 sigma bonds with 6 fluorine atoms and has 0 lone pairs, giving steric number 6, sp³d² hybridization, and a regular octahedral shape.'
    },
    {
      id: 'q-chem-201',
      subjectId: 'chemistry',
      chapterId: 'chem-2',
      categories: ['hsc', 'med', 'uni', 'ssc'],
      difficulty: 'Easy',
      examTag: 'Medical & HSC • Chemistry 1st Paper Ch-4',
      question: 'What is the pH of a 0.005 M aqueous solution of sulfuric acid (H₂SO₄), assuming complete dissociation at 25°C?',
      questionBn: '২৫°C তাপমাত্রায় সম্পূর্ণ বিয়োজিত ধরে 0.005 M H₂SO₄ জলীয় দ্রবণের pH কত?',
      options: ['1.0', '2.0', '2.3', '3.0'],
      correctIndex: 1,
      explanation: 'H₂SO₄ is a diprotic strong acid (H₂SO₄ → 2H⁺ + SO₄²⁻). Thus [H⁺] = 2 × 0.005 M = 0.01 M = 10⁻² M. Therefore, pH = −log₁₀(10⁻²) = 2.0.'
    },
    {
      id: 'q-chem-203',
      subjectId: 'chemistry',
      chapterId: 'chem-3',
      categories: ['hsc', 'uni', 'med', 'eng'],
      difficulty: 'Hard',
      examTag: 'Organic Chemistry • Chemistry 2nd Paper Ch-2',
      question: 'Which reagent is used in the Clemmensen reduction to convert an aldehyde or ketone carbonyl group (>C=O) directly into a methylene group (−CH₂−)?',
      questionBn: 'ক্লিমেনসেন বিজারণে (Clemmensen Reduction) অ্যালডিহাইড বা কিটোনের কার্বনিল মূলককে (>C=O) মিথিলিন মূলকে (−CH₂−) রূপান্তর করতে কোন বিকারক ব্যবহৃত হয়?',
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
      examTag: 'Electrochemistry • Chemistry 2nd Paper Ch-4',
      question: 'How many Faradays (F) of electricity are required to deposit 1 mole of metallic Aluminum (Al) from molten Al₂O₃ at the cathode?',
      questionBn: 'গলিত Al₂O₃ থেকে ক্যাথোডে ১ মোল ধাতব অ্যালুমিনিয়াম (Al) জমা করতে কত ফ্যারাডে (F) তড়িৎ প্রয়োজন?',
      options: ['1 F', '2 F', '3 F', '6 F'],
      correctIndex: 2,
      explanation: 'The cathode half-reaction for aluminum reduction is Al³⁺ + 3e⁻ → Al(s). Reducing 1 mole of Al³⁺ ions requires 3 moles of electrons, which equals 3 Faradays (3 × 96,500 C).'
    },

    /* --- HIGHER MATHEMATICS (math-1 to math-4) --- */
    {
      id: 'q-math-301',
      subjectId: 'math',
      chapterId: 'math-1',
      categories: ['hsc', 'uni', 'eng'],
      difficulty: 'Medium',
      examTag: 'Calculus • Higher Math 1st Paper Ch-9',
      question: 'What is the value of lim (x → 0) [ (e^(3x) − 1) / x ]?',
      questionBn: 'lim (x → 0) [ (e^(3x) − 1) / x ] -এর মান কত?',
      options: ['0', '1', '3', 'e³'],
      correctIndex: 2,
      explanation: 'Using the standard limit lim(u→0) (eᵘ − 1)/u = 1 or L’Hôpital’s rule: differentiating numerator and denominator with respect to x gives lim(x→0) (3e^(3x) / 1) = 3(1) = 3.'
    },
    {
      id: 'q-math-302',
      subjectId: 'math',
      chapterId: 'math-2',
      categories: ['hsc', 'uni', 'eng'],
      difficulty: 'Easy',
      examTag: 'Matrices • Higher Math 1st Paper Ch-1',
      question: 'For what value of k is the matrix A = [[k, 4], [9, k]] singular (non-invertible)?',
      questionBn: 'k-এর মান কত হলে [[k, 4], [9, k]] ম্যাট্রিক্সটি ব্যতিক্রমী (Singular) হবে?',
      options: ['±4', '±6', '±9', '±12'],
      correctIndex: 1,
      explanation: 'A square matrix is singular when its determinant is 0. Here det(A) = k² − (4 × 9) = k² − 36 = 0 ⇒ k² = 36 ⇒ k = ±6.'
    },
    {
      id: 'q-math-304',
      subjectId: 'math',
      chapterId: 'math-3',
      categories: ['hsc', 'uni', 'eng', 'ssc'],
      difficulty: 'Medium',
      examTag: 'Complex Numbers & Trig • Higher Math 2nd Paper Ch-1',
      question: 'If i = √(−1), what is the modulus |z| and principal argument of the complex number z = 1 + √3 i?',
      questionBn: 'i = √(−1) হলে z = 1 + √3 i জটিল সংখ্যাটির মডুলাস |z| এবং মুখ্য আর্গুমেন্ট কত?',
      options: ['|z| = 2, arg(z) = π/6', '|z| = 2, arg(z) = π/3', '|z| = 4, arg(z) = π/3', '|z| = √2, arg(z) = π/4'],
      correctIndex: 1,
      explanation: 'Modulus |z| = √(1² + (√3)²) = √(1 + 3) = 2. Since both real and imaginary parts are positive (1st quadrant), principal argument θ = tan⁻¹(√3 / 1) = π/3 (or 60°).'
    },
    {
      id: 'q-math-303',
      subjectId: 'math',
      chapterId: 'math-4',
      categories: ['bcs', 'bank', 'gov', 'uni', 'ssc', 'hsc'],
      difficulty: 'Medium',
      examTag: 'Combinatorics • BCS & Admission Standard',
      question: 'In how many distinct ways can the letters of the word "DIRECTOR" be arranged so that the three vowels (I, E, O) always remain together?',
      questionBn: '"DIRECTOR" শব্দটির স্বরবর্ণগুলোকে (I, E, O) সর্বদা একত্রে রেখে অক্ষরগুলোকে মোট কত প্রকারে সাজানো যায়?',
      options: ['720', '1080', '2160', '4320'],
      correctIndex: 2,
      explanation: '"DIRECTOR" has 8 letters: 5 consonants (D, R, C, T, R — note R appears twice) and 3 distinct vowels (I, E, O). Treating (IEO) as 1 block gives 6 units with R repeated twice: 6! / 2! = 720 / 2 = 360. The 3 vowels can arrange internally in 3! = 6 ways. Total = 360 × 6 = 2160.'
    },

    /* --- BIOLOGY (bio-1 to bio-4) --- */
    {
      id: 'q-bio-401',
      subjectId: 'biology',
      chapterId: 'bio-1',
      categories: ['ssc', 'hsc', 'med', 'uni', 'bcs'],
      difficulty: 'Easy',
      examTag: 'Medical Admission • Biology 1st Paper Ch-1',
      question: 'Which organelle in animal cells contains its own circular DNA and 70S ribosomes, enabling semi-autonomous protein synthesis?',
      questionBn: 'প্রাণীকোষের কোন কোষীয় অঙ্গাণুতে নিজস্ব বৃত্তাকার DNA এবং 70S রাইবোজোম থাকায় এটি আধা-স্বায়ত্তশাসিতভাবে প্রোটিন সংশ্লেষণ করতে পারে?',
      options: ['Golgi Apparatus (গলগি বডি)', 'Mitochondria (মাইটোকন্ড্রিয়া)', 'Lysosome (লাইসোজোম)', 'Endoplasmic Reticulum (এন্ডোপ্লাজমিক রেটিকুলাম)'],
      correctIndex: 1,
      explanation: 'In animal cells (which lack plastids/chloroplasts), Mitochondria are the only organelles possessing their own circular DNA and prokaryotic-type 70S ribosomes for semi-autonomous protein synthesis.'
    },
    {
      id: 'q-bio-402',
      subjectId: 'biology',
      chapterId: 'bio-2',
      categories: ['hsc', 'med', 'uni', 'ssc'],
      difficulty: 'Medium',
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
      examTag: 'Genetics • Biology 2nd Paper Ch-11',
      question: 'What is the phenotypic ratio in the F₂ generation when a lethal gene causes the death of homozygous dominant (AA) individuals in a monohybrid cross (Aa × Aa)?',
      questionBn: 'মারণ জিন (Lethal Gene)-এর প্রভাবে হোমোজাইগাস প্রকট (AA) জীবের মৃত্যু ঘটলে মনোহাইব্রিড ক্রসের (Aa × Aa) F₂ জনুতে ফিনোটাইপিক অনুপাত কত হয়?',
      options: ['3 : 1', '2 : 1', '1 : 2 : 1', '9 : 7'],
      correctIndex: 1,
      explanation: 'In a cross between two heterozygotes (Aa × Aa), the expected genotypic ratio is 1 AA : 2 Aa : 1 aa. Because the homozygous dominant (AA) embryos die due to the lethal gene (e.g., yellow coat color in mice studied by Cuénot), the surviving ratio is 2 Aa : 1 aa (2 : 1).'
    },
    {
      id: 'q-bio-404',
      subjectId: 'biology',
      chapterId: 'bio-4',
      categories: ['hsc', 'med', 'uni', 'ssc'],
      difficulty: 'Medium',
      examTag: 'Plant Physiology • Biology 1st Paper Ch-9',
      question: 'In C₄ plants (such as sugarcane and maize), what is the first stable 4-carbon compound formed during the Hatch and Slack photosynthetic pathway?',
      questionBn: 'C₄ উদ্ভিদে (যেমন ইক্ষু ও ভুট্টা) হ্যাচ ও স্ল্যাক চক্রে কার্বন বিজারণের ফলে উৎপন্ন প্রথম স্থায়ী ৪-কার্বনবিশিষ্ট যৌগ কোনটি?',
      options: ['3-Phosphoglyceric Acid (3-PGA)', 'Oxaloacetic Acid (OAA)', 'Ribulose-1,5-bisphosphate (RuBP)', 'Pyruvic Acid'],
      correctIndex: 1,
      explanation: 'In the mesophyll cells of C₄ plants, phosphoenolpyruvate (PEP, 3C) fixes CO₂ via the enzyme PEP carboxylase to form Oxaloacetic Acid (OAA), a 4-carbon dicarboxylic acid.'
    },

    /* --- ENGLISH (eng-1 to eng-4) --- */
    {
      id: 'q-eng-503',
      subjectId: 'english',
      chapterId: 'eng-1',
      categories: ['ssc', 'hsc', 'uni', 'bcs', 'bank', 'gov'],
      difficulty: 'Medium',
      examTag: 'Clauses & Parts of Speech • DU / BCS',
      question: 'Identify the type of underlined clause in the sentence: "I know the place where he was born."',
      questionBn: '"I know the place where he was born." — বাক্যে "where he was born" অংশটি কোন ধরনের Clause?',
      options: ['Noun Clause', 'Adjective (Relative) Clause', 'Adverbial Clause of Place', 'Coordinate Clause'],
      correctIndex: 1,
      explanation: 'Because "where he was born" modifies the preceding noun antecedent "the place" (telling us which place), it functions as an Adjective (Relative) Clause. If "the place" were omitted ("I know where he was born"), it would be a Noun Clause.'
    },
    {
      id: 'q-eng-501',
      subjectId: 'english',
      chapterId: 'eng-2',
      categories: ['bcs', 'bank', 'uni', 'med', 'gov', 'hsc', 'ssc'],
      difficulty: 'Easy',
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
      explanation: 'In "One of the [plural noun] who [plural verb]... [singular main verb]", the relative pronoun "who" refers to the plural antecedent "scholars" (so "have won" is correct), while the main subject is "One" (so "is from Dhaka" is correct).'
    },
    {
      id: 'q-eng-502',
      subjectId: 'english',
      chapterId: 'eng-3',
      categories: ['bcs', 'bank', 'uni', 'gov', 'gk'],
      difficulty: 'Hard',
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
      explanation: '"Ephemeral" (from Greek ephemeros, lasting only one day) means short-lived or transient. "Swan song" refers to the final work, performance, or achievement of a poet, musician, or person before retirement or death.'
    },

    /* --- BANGLA (bn-1 to bn-4) --- */
    {
      id: 'q-bn-603',
      subjectId: 'bangla',
      chapterId: 'bn-1',
      categories: ['ssc', 'hsc', 'uni', 'bcs', 'bank', 'gov'],
      difficulty: 'Easy',
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
      explanation: 'নিপাতনে বা স্বরসন্ধির নিয়মানুসারে (ও-কারের পর স্বরধ্বনি থাকলে "অব্" হয়): গো + এষণা = গবেষণা। আর ব্যঞ্জনসন্ধির নিয়মে: ষট্ + ঋতু = ষড়ঋতু।'
    },
    {
      id: 'q-bn-601',
      subjectId: 'bangla',
      chapterId: 'bn-2',
      categories: ['bcs', 'uni', 'gov', 'ssc', 'hsc', 'bank'],
      difficulty: 'Medium',
      examTag: 'সমাস ও কারক • বিসিএস ও বিশ্ববিদ্যালয় ভর্তি',
      question: '"উপকূল" ও "যথাবিধি" শব্দ দুটি কোন সমাসের উদাহরণ?',
      questionBn: '"উপকূল" (কূলের সমীপে) ও "যথাবিধি" (বিধিকে অতিক্রম না করে) কোন সমাসের অন্তর্ভুক্ত?',
      options: ['অব্যয়ীভাব সমাস', 'কর্মধারয় সমাস', 'বহুব্রীহি সমাস', 'তৎপুরুষ সমাস'],
      correctIndex: 0,
      explanation: 'পূর্বপদে অব্যয় যোগে নিষ্পন্ন সমাসে যদি অব্যয়েরই অর্থের প্রাধান্য থাকে, তবে তাকে অব্যয়ীভাব সমাস বলে। যেমন: কূলের সমীপে = উপকূল (সামীপ্য অর্থে), বিধিকে অতিক্রম না করে = যথাবিধি (অনতিক্রম্যতা অর্থে)।'
    },
    {
      id: 'q-bn-604',
      subjectId: 'bangla',
      chapterId: 'bn-3',
      categories: ['bcs', 'uni', 'gov', 'bank'],
      difficulty: 'Medium',
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
      examTag: 'আধুনিক সাহিত্য ও ভাষা আন্দোলন • ১৯৫৩',
      question: '১৯৫২ সালের ভাষা আন্দোলনের পটভূমিতে রচিত মুনীর চৌধুরীর বিখ্যাত নাটক "কবর" কোন কারাগারে বসে রচিত হয়েছিল?',
      questionBn: 'ভাষা আন্দোলনের পটভূমিতে রচিত মুনীর চৌধুরীর বিখ্যাত একাঙ্কিকা নাটক "কবর" (১৯৫৩) কোন কারাগারে বসে রচিত হয়?',
      options: ['রাজশাহী কেন্দ্রীয় কারাগার', 'ঢাকা কেন্দ্রীয় কারাগার', 'কুমিল্লা কারাগার', 'সিলেট কারাগার'],
      correctIndex: 1,
      explanation: '১৯৫২ সালের ভাষা আন্দোলনে অংশগ্রহণের কারণে কারাবন্দী অবস্থায় ১৯৫৩ সালে ঢাকা কেন্দ্রীয় কারাগারে বসে মুনীর চৌধুরী "কবর" নাটকটি রচনা করেন এবং কারাবন্দীদের দ্বারা তা মঞ্চস্থ হয়।'
    },

    /* --- GENERAL KNOWLEDGE (gk-1 to gk-4) --- */
    {
      id: 'q-gk-701',
      subjectId: 'gk',
      chapterId: 'gk-1',
      categories: ['bcs', 'uni', 'med', 'gov', 'bank', 'gk', 'ssc'],
      difficulty: 'Easy',
      examTag: '1971 Liberation War • Bangladesh Affairs',
      question: 'During the 1971 Liberation War of Bangladesh, under which operational sector was Dhaka City and its surrounding industrial belt placed?',
      questionBn: '১৯৭১ সালের মহান মুক্তিযুদ্ধে ঢাকা শহর ও এর পার্শ্ববর্তী এলাকা কত নম্বর সেক্টরের অধীনে ছিল?',
      options: ['Sector 1 (সেক্টর ১)', 'Sector 2 (সেক্টর ২)', 'Sector 3 (সেক্টর ৩)', 'Sector 11 (সেক্টর ১১)'],
      correctIndex: 1,
      explanation: 'Sector 2 comprised Dhaka, Comilla, Noakhali, and parts of Faridpur. It was commanded by Major Khaled Mosharraf and later Major ATM Haider, famous for the Crack Platoon urban guerrilla operations.'
    },
    {
      id: 'q-gk-702',
      subjectId: 'gk',
      chapterId: 'gk-2',
      categories: ['bcs', 'uni', 'gov', 'bank', 'gk'],
      difficulty: 'Hard',
      examTag: 'Constitution of Bangladesh • Fundamental Rights',
      question: 'Which Article of the Constitution of the People’s Republic of Bangladesh guarantees "Equality of opportunity in public employment"?',
      questionBn: 'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধানের কোন অনুচ্ছেদে "সরকারি নিয়োগ-লাভে সুযোগের সমতা" নিশ্চিত করা হয়েছে?',
      options: ['Article 27 (অনুচ্ছেদ ২৭)', 'Article 28 (অনুচ্ছেদ ২৮)', 'Article 29 (অনুচ্ছেদ ২৯)', 'Article 32 (অনুচ্ছেদ ৩২)'],
      correctIndex: 2,
      explanation: 'Article 27 guarantees equality before law, Article 28 prohibits discrimination on grounds of religion/race/sex, Article 29 guarantees equality of opportunity in public employment, and Article 32 protects the right to life and personal liberty.'
    },
    {
      id: 'q-gk-703',
      subjectId: 'gk',
      chapterId: 'gk-3',
      categories: ['bcs', 'uni', 'gov', 'bank', 'gk'],
      difficulty: 'Medium',
      examTag: 'International Affairs • UN & Bretton Woods',
      question: 'Where is the headquarters of the International Court of Justice (ICJ), the principal judicial organ of the United Nations, located?',
      questionBn: 'জাতিসংঘের মূল বিচারিক সংস্থা "আন্তর্জাতিক বিচার আদালত" (ICJ)-এর সদর দপ্তর (Peace Palace) কোথায় অবস্থিত?',
      options: ['Geneva, Switzerland', 'The Hague, Netherlands', 'Vienna, Austria', 'New York, USA'],
      correctIndex: 1,
      explanation: 'Among the six principal organs of the United Nations, the International Court of Justice (ICJ) is the only one located outside New York—situated at the Peace Palace in The Hague, Netherlands.'
    },
    {
      id: 'q-gk-704',
      subjectId: 'gk',
      chapterId: 'gk-4',
      categories: ['bcs', 'uni', 'gov', 'gk', 'ssc'],
      difficulty: 'Medium',
      examTag: 'Geography & Blue Economy • Bangladesh',
      question: 'What is the name of the submarine canyon located in the Bay of Bengal that serves as a major breeding ground for marine biodiversity and cetaceans?',
      questionBn: 'বঙ্গোপসাগরে অবস্থিত গভীর সামুদ্রিক গিরিখাত (Submarine Canyon) কোনটি, যা তিমি ও ডলফিনসহ সামুদ্রিক জীববৈচিত্র্যের প্রধান প্রজনন ক্ষেত্র?',
      options: ['Sunda Trench', 'Swatch of No Ground (সোয়াচ অব নো গ্রাউন্ড)', 'Mariana Trough', 'Bengal Delta Shelf'],
      correctIndex: 1,
      explanation: 'The Swatch of No Ground (সোয়াচ অব নো গ্রাউন্ড) is a 14-km-wide deep-sea submarine canyon in the northern Bay of Bengal, south of the Sundarbans, declared Bangladesh’s first Marine Protected Area in 2014.'
    },

    /* --- ICT & ANALYTICAL ABILITY (ict-1 to ict-4) --- */
    {
      id: 'q-ict-801',
      subjectId: 'ict',
      chapterId: 'ict-1',
      categories: ['hsc', 'bcs', 'bank', 'uni', 'gov', 'eng'],
      difficulty: 'Easy',
      examTag: 'HSC ICT Ch-3 • Number Systems',
      question: 'What is the hexadecimal equivalent of the binary number (10111101)₂?',
      questionBn: '(10111101)₂ বাইনারি সংখ্যাটির সমতুল্য হেক্সাডেসিমেল (Hexadecimal) মান কোনটি?',
      options: ['(9D)₁₆', '(BD)₁₆', '(CD)₁₆', '(B5)₁₆'],
      correctIndex: 1,
      explanation: 'Grouping into 4-bit nibbles from right to left: 1011₂ = 8 + 0 + 2 + 1 = 11 = B₁₆, and 1101₂ = 8 + 4 + 0 + 1 = 13 = D₁₆. Combining them gives (BD)₁₆.'
    },
    {
      id: 'q-ict-802',
      subjectId: 'ict',
      chapterId: 'ict-2',
      categories: ['hsc', 'bcs', 'bank', 'uni', 'gov'],
      difficulty: 'Medium',
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
      examTag: 'BCS & Bank • Analytical Ability',
      question: 'Find the missing number in the analytical progression: 3, 7, 15, 31, 63, ?',
      questionBn: 'নিচের গাণিতিক ধারাটির পরবর্তী সংখ্যাটি কত? ৩, ৭, ১৫, ৩১, ৬৩, ?',
      options: ['95', '125', '127', '129'],
      correctIndex: 2,
      explanation: 'Each term follows the pattern Tₙ = 2 × T_(n−1) + 1 (or 2^(n+1) − 1): 3×2+1 = 7; 7×2+1 = 15; 15×2+1 = 31; 31×2+1 = 63; therefore the next term is 63×2 + 1 = 127.'
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
      subtitle: 'Bangla Literature, Constitution, Geopolitics, English Grammar, ICT & Analytical Ability',
      category: 'bcs',
      subjectId: 'gk',
      questionIds: ['q-bn-601', 'q-bn-604', 'q-eng-501', 'q-eng-502', 'q-gk-701', 'q-gk-702', 'q-gk-703', 'q-ict-804'],
      durationSec: 360,
      negativeMark: 0.5,
      xpReward: 120,
      badgeText: 'BCS Standard (-0.50)'
    },
    {
      id: 'pack-stem-admission',
      title: 'BUET & DU A-Unit STEM Diagnostic',
      titleBn: 'বুয়েট ও ঢাবি ক-ইউনিট ডায়াগনস্টিক',
      subtitle: 'Vectors, Thermodynamics, Calculus, Complex Numbers, Hybridization & Electrochemistry',
      category: 'eng',
      subjectId: 'physics',
      questionIds: ['q-phy-101', 'q-phy-102', 'q-phy-104', 'q-chem-202', 'q-chem-204', 'q-math-301', 'q-math-302', 'q-math-304'],
      durationSec: 420,
      negativeMark: 0.25,
      xpReward: 140,
      badgeText: 'STEM High-Yield'
    },
    {
      id: 'pack-medical-rapid',
      title: 'Medical MBBS Admission Standard Set',
      titleBn: 'মেডিকেল ভর্তি স্ট্যান্ডার্ড মডেল সেট',
      subtitle: 'Cell Organelles, Cardiac Pacemaker, Lethal Genes, C4 Pathway, pH & Liberation War',
      category: 'med',
      subjectId: 'biology',
      questionIds: ['q-bio-401', 'q-bio-402', 'q-bio-403', 'q-bio-404', 'q-chem-201', 'q-phy-103', 'q-eng-501', 'q-gk-701'],
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

  /* Reference Peer Leaderboard Data (Clearly labeled as Community Benchmark until Cloud Auth is active) */
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

  /* Dynamic Real Count Helpers (Guarantees UI Always Matches Actual Question Bank) */
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
