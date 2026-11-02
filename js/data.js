/* ==========================================================================
   ExamVerse — Educational Question Bank, Categories & Metadata (js/data.js)
   Supports English & Bangla (বাংলা) Content, 9 Exam Tracks, Subjects & Chapters
   ========================================================================== */

window.EXAMVERSE_DATA = {
  /* 9 Required Exam Categories */
  examCategories: [
    {
      id: 'ssc',
      name: 'SSC',
      nameBn: 'এসএসসি (SSC)',
      fullTitle: 'Secondary School Certificate',
      badge: 'Class 9–10',
      description: 'Board syllabus chapter-wise MCQ mastery for Science, Humanities & Business Studies.',
      subjects: ['physics', 'chemistry', 'math', 'biology', 'english', 'bangla'],
      totalQuestions: 1450,
      modelTests: 28,
      iconType: 'book'
    },
    {
      id: 'hsc',
      name: 'HSC',
      nameBn: 'এইচএসসি (HSC)',
      fullTitle: 'Higher Secondary Certificate',
      badge: 'Class 11–12',
      description: 'First & Second Paper board standard MCQs with analytical problem explanations.',
      subjects: ['physics', 'chemistry', 'math', 'biology', 'english', 'ict'],
      totalQuestions: 2100,
      modelTests: 36,
      iconType: 'layers'
    },
    {
      id: 'uni',
      name: 'University Admission',
      nameBn: 'বিশ্ববিদ্যালয় ভর্তি',
      fullTitle: 'DU, JU, RU, CU & GST Cluster',
      badge: 'A, B, C & D Unit',
      description: 'High-yield conceptual MCQs curated from past 15 years of public university admission tests.',
      subjects: ['physics', 'chemistry', 'math', 'english', 'bangla', 'gk'],
      totalQuestions: 2480,
      modelTests: 42,
      iconType: 'cap'
    },
    {
      id: 'med',
      name: 'Medical Admission',
      nameBn: 'মেডিকেল ভর্তি পরীক্ষা',
      fullTitle: 'MBBS & BDS National Admission',
      badge: '100 Marks Standard',
      description: 'High-precision Biology, Chemistry, Physics, English & GK practice with negative-marking simulation.',
      subjects: ['biology', 'chemistry', 'physics', 'english', 'gk'],
      totalQuestions: 1920,
      modelTests: 30,
      iconType: 'dna'
    },
    {
      id: 'eng',
      name: 'Engineering Admission',
      nameBn: 'ইঞ্জিনিয়ারিং ভর্তি',
      fullTitle: 'BUET, CKRUET, MIST & IUT',
      badge: 'Preli & Analytical',
      description: 'Advanced mathematical physics, calculus, vectors, and organic/inorganic chemistry problem sets.',
      subjects: ['math', 'physics', 'chemistry', 'english'],
      totalQuestions: 1680,
      modelTests: 25,
      iconType: 'compass'
    },
    {
      id: 'bcs',
      name: 'BCS',
      nameBn: 'বিসিএস প্রিলিমিনারি',
      fullTitle: 'Bangladesh Civil Service Preliminary',
      badge: '200 Marks Cadre',
      description: 'Comprehensive coverage of 10 BCS Preliminary syllabus pillars from 10th to 46th BCS.',
      subjects: ['bangla', 'english', 'gk', 'math', 'ict', 'biology'],
      totalQuestions: 3200,
      modelTests: 50,
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
      totalQuestions: 1840,
      modelTests: 32,
      iconType: 'briefcase'
    },
    {
      id: 'gov',
      name: 'Government Jobs',
      nameBn: 'সরকারি চাকরি প্রস্তুতি',
      fullTitle: 'NTRCA, Primary & Ministry Exams',
      badge: '9th–16th Grade',
      description: 'Targeted preparation for teacher registration, directorate exams, and ministerial recruitment.',
      subjects: ['bangla', 'english', 'math', 'gk', 'ict'],
      totalQuestions: 2050,
      modelTests: 35,
      iconType: 'shield'
    },
    {
      id: 'gk',
      name: 'General Knowledge',
      nameBn: 'সাধারণ জ্ঞান ও সাম্প্রতিক',
      fullTitle: 'Bangladesh, International & Current Affairs',
      badge: 'Updated Monthly',
      description: 'Liberation war history, constitution, geopolitics, economic surveys, and scientific discoveries.',
      subjects: ['gk', 'ict', 'bangla', 'english'],
      totalQuestions: 1560,
      modelTests: 24,
      iconType: 'globe'
    }
  ],

  /* Core Subjects with Chapters */
  subjects: [
    {
      id: 'physics',
      name: 'Physics',
      nameBn: 'পদার্থবিজ্ঞান (Physics)',
      icon: 'atom',
      accent: 'indigo',
      questionCount: 420,
      defaultMastery: 78,
      chapters: [
        { id: 'phy-1', title: 'Vectors & Classical Mechanics', titleBn: 'ভেক্টর ও নিউটনিয়ান বলবিদ্যা', count: 65, difficulty: 'Medium' },
        { id: 'phy-2', title: 'Thermodynamics & Ideal Gas', titleBn: 'তাপগতিবিদ্যা ও আদর্শ গ্যাস', count: 54, difficulty: 'Hard' },
        { id: 'phy-3', title: 'Current Electricity & Magnetism', titleBn: 'চল তড়িৎ ও চুম্বকত্ব', count: 72, difficulty: 'Medium' },
        { id: 'phy-4', title: 'Modern Physics & Semiconductors', titleBn: 'আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স', count: 48, difficulty: 'Easy' }
      ]
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      nameBn: 'রসায়ন (Chemistry)',
      icon: 'flask',
      accent: 'violet',
      questionCount: 390,
      defaultMastery: 71,
      chapters: [
        { id: 'chem-1', title: 'Atomic Structure & Periodic Table', titleBn: 'পরমাণুর গঠন ও পর্যায় সারণি', count: 68, difficulty: 'Easy' },
        { id: 'chem-2', title: 'Chemical Equilibrium & Acids-Bases', titleBn: 'রাসায়নিক সাম্যবস্থা ও অম্ল-ক্ষারক', count: 62, difficulty: 'Medium' },
        { id: 'chem-3', title: 'Organic Chemistry & Hydrocarbons', titleBn: 'জৈব রসায়ন ও হাইড্রোকার্বন', count: 84, difficulty: 'Hard' },
        { id: 'chem-4', title: 'Electrochemistry & Quantitative Analysis', titleBn: 'তড়িৎ রসায়ন ও পরিমাণগত রসায়ন', count: 55, difficulty: 'Medium' }
      ]
    },
    {
      id: 'math',
      name: 'Higher Mathematics',
      nameBn: 'উচ্চতর গণিত ও গাণিতিক যুক্তি',
      icon: 'sigma',
      accent: 'indigo',
      questionCount: 510,
      defaultMastery: 84,
      chapters: [
        { id: 'math-1', title: 'Differential & Integral Calculus', titleBn: 'অন্তরীকরণ ও যোগজীকরণ (Calculus)', count: 95, difficulty: 'Hard' },
        { id: 'math-2', title: 'Matrices, Determinants & Vectors', titleBn: 'ম্যাট্রিক্স, নির্ণায়ক ও ভেক্টর', count: 64, difficulty: 'Easy' },
        { id: 'math-3', title: 'Trigonometry & Complex Numbers', titleBn: 'ত্রিকোণমিতি ও জটিল সংখ্যা', count: 76, difficulty: 'Medium' },
        { id: 'math-4', title: 'Combinatorics, Probability & Aptitude', titleBn: 'বিন্যাস, সমাবেশ ও সম্ভাব্যতা', count: 68, difficulty: 'Medium' }
      ]
    },
    {
      id: 'biology',
      name: 'Biology',
      nameBn: 'জীববিজ্ঞান (Biology)',
      icon: 'dna',
      accent: 'emerald',
      questionCount: 460,
      defaultMastery: 66,
      chapters: [
        { id: 'bio-1', title: 'Cell Structure, Division & Biochemistry', titleBn: 'কোষ ও এর গঠন এবং কোষ বিভাজন', count: 78, difficulty: 'Easy' },
        { id: 'bio-2', title: 'Human Physiology: Blood & Circulation', titleBn: 'মানব শারীরতত্ত্ব: রক্ত ও সঞ্চালন', count: 86, difficulty: 'Medium' },
        { id: 'bio-3', title: 'Genetics, Evolution & Biotechnology', titleBn: 'জিনতত্ত্ব, বিবর্তন ও জীবপ্রযুক্তি', count: 64, difficulty: 'Hard' },
        { id: 'bio-4', title: 'Plant Physiology & Taxonomy', titleBn: 'উদ্ভিদ শারীরতত্ত্ব ও শ্রেণিবিন্যাস', count: 60, difficulty: 'Medium' }
      ]
    },
    {
      id: 'english',
      name: 'English Language & Literature',
      nameBn: 'ইংরেজি ভাষা ও সাহিত্য',
      icon: 'feather',
      accent: 'violet',
      questionCount: 540,
      defaultMastery: 74,
      chapters: [
        { id: 'eng-1', title: 'Parts of Speech, Clauses & Modifiers', titleBn: 'Parts of Speech, Clauses & Phrases', count: 92, difficulty: 'Medium' },
        { id: 'eng-2', title: 'Right Form of Verbs & Subject-Verb Agreement', titleBn: 'Subject-Verb Agreement & Tense', count: 85, difficulty: 'Easy' },
        { id: 'eng-3', title: 'English Literary Periods & Masterpieces', titleBn: 'Renaissance to Modern English Literature', count: 74, difficulty: 'Hard' },
        { id: 'eng-4', title: 'High-Frequency Vocabulary & Idioms', titleBn: 'Synonyms, Antonyms & Idiomatic Usage', count: 88, difficulty: 'Medium' }
      ]
    },
    {
      id: 'bangla',
      name: 'Bangla Sahitya & Grammar',
      nameBn: 'বাংলা সাহিত্য ও ব্যাকরণ',
      icon: 'scroll',
      accent: 'indigo',
      questionCount: 480,
      defaultMastery: 81,
      chapters: [
        { id: 'bn-1', title: 'ধ্বনিতত্ত্ব, সন্ধি ও বানান রীতি (Phonology & Sandhi)', titleBn: 'ধ্বনিতত্ত্ব, সন্ধি ও প্রমিত বাংলা বানান', count: 78, difficulty: 'Easy' },
        { id: 'bn-2', title: 'সমাস, কারক-বিভক্তি ও প্রত্যয় (Samas & Karaka)', titleBn: 'সমাস, কারক-বিভক্তি ও প্রকৃতি-প্রত্যয়', count: 86, difficulty: 'Medium' },
        { id: 'bn-3', title: 'প্রাচীন ও মধ্যযুগের বাংলা সাহিত্য (Ancient & Medieval)', titleBn: 'চর্যাপদ, শ্রীকৃষ্ণকীর্তন ও মঙ্গলকাব্য', count: 64, difficulty: 'Medium' },
        { id: 'bn-4', title: 'আধুনিক যুগের সাহিত্য: রবীন্দ্র-নজরুল ও মুক্তিযুদ্ধ', titleBn: 'আধুনিক বাংলা সাহিত্য ও মুক্তিযুদ্ধভিত্তিক রচনা', count: 94, difficulty: 'Easy' }
      ]
    },
    {
      id: 'gk',
      name: 'Bangladesh & Global Affairs',
      nameBn: 'বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলী',
      icon: 'globe',
      accent: 'emerald',
      questionCount: 520,
      defaultMastery: 63,
      chapters: [
        { id: 'gk-1', title: '1952 Language Movement to 1971 Liberation War', titleBn: 'ভাষা আন্দোলন থেকে ১৯৭১ মহান মুক্তিযুদ্ধ', count: 96, difficulty: 'Easy' },
        { id: 'gk-2', title: 'Constitution of Bangladesh & State Organs', titleBn: 'বাংলাদেশের সংবিধান ও রাষ্ট্রীয় কাঠামো', count: 74, difficulty: 'Hard' },
        { id: 'gk-3', title: 'Global Organizations, Treaties & Geopolitics', titleBn: 'জাতিসংঘ, আন্তর্জাতিক সংস্থা ও ভূ-রাজনীতি', count: 82, difficulty: 'Medium' },
        { id: 'gk-4', title: 'Geography, Climate & Sustainable Development', titleBn: 'ভূগোল, জলবায়ু পরিবর্তন ও সুনীল অর্থনীতি', count: 60, difficulty: 'Medium' }
      ]
    },
    {
      id: 'ict',
      name: 'ICT & Analytical Ability',
      nameBn: 'তথ্যপ্রযুক্তি ও মানসিক দক্ষতা',
      icon: 'cpu',
      accent: 'violet',
      questionCount: 380,
      defaultMastery: 79,
      chapters: [
        { id: 'ict-1', title: 'Number Systems, Boolean Algebra & Logic Gates', titleBn: 'সংখ্যা পদ্ধতি, বুলিয়ান বীজগণিত ও লজিক গেট', count: 72, difficulty: 'Easy' },
        { id: 'ict-2', title: 'Networking, Cyber Security & Cloud Computing', titleBn: 'নেটওয়ার্কিং, সাইবার নিরাপত্তা ও ক্লাউড', count: 64, difficulty: 'Medium' },
        { id: 'ict-3', title: 'C Programming, Algorithms & DBMS SQL', titleBn: 'সি প্রোগ্রামিং, অ্যালগরিদম ও ডেটাবেজ (SQL)', count: 68, difficulty: 'Hard' },
        { id: 'ict-4', title: 'Analytical Puzzles, Coding-Decoding & Spatial Logic', titleBn: 'মানসিক দক্ষতা ও গাণিতিক বিশ্লেষণ', count: 58, difficulty: 'Medium' }
      ]
    }
  ],

  /* Authentic, Exam-Grade Questions (English & Bangla) with Rich Explanations */
  questions: [
    {
      id: 'q-phy-101',
      subjectId: 'physics',
      chapterId: 'phy-1',
      categories: ['hsc', 'uni', 'eng', 'ssc'],
      difficulty: 'Medium',
      examTag: 'BUET / DU A-Unit Standard',
      question: 'If the magnitude of the resultant of two forces of equal magnitude P acting at a point is also P, what is the angle θ between the two forces?',
      questionBn: 'কোনো বিন্দুতে ক্রিয়াশীল দুটি সমান বল P-এর লব্ধির মানও যদি P হয়, তবে বলদ্বয়ের মধ্যবর্তী কোণ θ কত?',
      options: ['60°', '90°', '120°', '180°'],
      correctIndex: 2,
      explanation: 'Using the parallelogram law of vectors: R² = P² + Q² + 2PQ cosθ. Since R = P and Q = P, we have P² = P² + P² + 2P² cosθ ⇒ 2P² cosθ = −P² ⇒ cosθ = −1/2. Therefore, θ = 120°.'
    },
    {
      id: 'q-phy-102',
      subjectId: 'physics',
      chapterId: 'phy-2',
      categories: ['hsc', 'uni', 'med', 'eng'],
      difficulty: 'Hard',
      examTag: 'HSC / Medical Standard',
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
      examTag: 'SSC / HSC Core',
      question: 'Three resistors of 6 Ω each are connected in parallel across a 12 V ideal battery. What is the total current drawn from the battery?',
      questionBn: '৬ Ω মানের তিনটি রোধ সমান্তরালে যুক্ত করে ১২ V তড়িৎচালক শক্তির কোষে যুক্ত করলে বর্তনীর মূল প্রবাহ কত হবে?',
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
      examTag: 'Engineering & DU Admission',
      question: 'The half-life of a radioactive isotope is 15 days. How many days will it take for 87.5% of the initial sample to decay?',
      questionBn: 'একটি তেজস্ক্রিয় মৌলের অর্ধায়ু ১৫ দিন। মৌলটির প্রারম্ভিক পরিমাণের ৮৭.৫% ক্ষয় হতে কত দিন সময় লাগবে?',
      options: ['30 days', '45 days', '60 days', '75 days'],
      correctIndex: 1,
      explanation: 'If 87.5% decays, the remaining undecayed fraction is 12.5% = 1/8 = (1/2)³ of the original sample. That requires 3 half-lives: t = 3 × T_(1/2) = 3 × 15 days = 45 days.'
    },
    {
      id: 'q-chem-201',
      subjectId: 'chemistry',
      chapterId: 'chem-2',
      categories: ['hsc', 'med', 'uni', 'ssc'],
      difficulty: 'Easy',
      examTag: 'Medical & HSC Standard',
      question: 'What is the pH of a 0.005 M aqueous solution of sulfuric acid (H₂SO₄), assuming complete dissociation?',
      questionBn: 'সম্পূর্ণ বিয়োজিত ধরে 0.005 M H₂SO₄ জলীয় দ্রবণের pH কত?',
      options: ['1.0', '2.0', '2.3', '3.0'],
      correctIndex: 1,
      explanation: 'H₂SO₄ is a diprotic strong acid (H₂SO₄ → 2H⁺ + SO₄²⁻). Thus [H⁺] = 2 × 0.005 M = 0.01 M = 10⁻² M. Therefore, pH = −log₁₀(10⁻²) = 2.0.'
    },
    {
      id: 'q-chem-202',
      subjectId: 'chemistry',
      chapterId: 'chem-1',
      categories: ['hsc', 'uni', 'med', 'eng'],
      difficulty: 'Medium',
      examTag: 'DU / Medical Standard',
      question: 'Which of the following species has an sp³d² hybridization and an octahedral molecular geometry?',
      questionBn: 'নিচের কোন যৌগটিতে sp³d² সংকরায়ণ এবং অষ্টতলকীয় (Octahedral) জ্যামিতিক গঠন বিদ্যমান?',
      options: ['PCl₅', 'SF₆', 'BF₃', 'NH₃'],
      correctIndex: 1,
      explanation: 'In SF₆ (Sulfur hexafluoride), the central sulfur atom forms 6 sigma bonds with 6 fluorine atoms and has 0 lone pairs, giving steric number 6, sp³d² hybridization, and a regular octahedral shape.'
    },
    {
      id: 'q-chem-203',
      subjectId: 'chemistry',
      chapterId: 'chem-3',
      categories: ['hsc', 'uni', 'med', 'eng'],
      difficulty: 'Hard',
      examTag: 'Organic Chemistry Core',
      question: 'Which reagent is used in the Clemmensen reduction to convert an aldehyde or ketone carbonyl group (>C=O) directly into a methylene group (−CH₂−)?',
      questionBn: 'ক্লিমেনসেন বিজারণে (Clemmensen Reduction) অ্যালডিহাইড বা কিটোনের কার্বনিল মূলককে (>C=O) মিথিলিন মূলকে (−CH₂−) রূপান্তর করতে কোন বিকারক ব্যবহৃত হয়?',
      options: ['Zn–Hg + Conc. HCl', 'NH₂–NH₂ + KOH', 'LiAlH₄ in dry ether', 'Pd / BaSO₄ + H₂'],
      correctIndex: 0,
      explanation: 'Clemmensen reduction uses amalgamated zinc (Zn–Hg) and concentrated hydrochloric acid (HCl) to reduce aldehydes and ketones to alkanes. Hydrazine + KOH is used in the Wolff–Kishner reduction.'
    },
    {
      id: 'q-math-301',
      subjectId: 'math',
      chapterId: 'math-1',
      categories: ['hsc', 'uni', 'eng'],
      difficulty: 'Medium',
      examTag: 'Calculus High-Yield',
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
      examTag: 'Matrix & Determinants',
      question: 'For what value of k is the matrix A = [[k, 4], [9, k]] singular (non-invertible)?',
      questionBn: 'k-এর মান কত হলে [[k, 4], [9, k]] ম্যাট্রিক্সটি ব্যতিক্রমী (Singular) হবে?',
      options: ['±4', '±6', '±9', '±12'],
      correctIndex: 1,
      explanation: 'A square matrix is singular when its determinant is 0. Here det(A) = k² − (4 × 9) = k² − 36 = 0 ⇒ k² = 36 ⇒ k = ±6.'
    },
    {
      id: 'q-math-303',
      subjectId: 'math',
      chapterId: 'math-4',
      categories: ['bcs', 'bank', 'gov', 'uni', 'ssc'],
      difficulty: 'Medium',
      examTag: 'BCS & Bank Aptitude',
      question: 'In how many distinct ways can the letters of the word "DIRECTOR" be arranged so that the three vowels (I, E, O) always remain together?',
      questionBn: '"DIRECTOR" শব্দটির স্বরবর্ণগুলোকে (I, E, O) সর্বদা একত্রে রেখে অক্ষরগুলোকে মোট কত প্রকারে সাজানো যায়?',
      options: ['720', '1080', '2160', '4320'],
      correctIndex: 2,
      explanation: '"DIRECTOR" has 8 letters: 5 consonants (D, R, C, T, R — note R appears twice) and 3 distinct vowels (I, E, O). Treating (IEO) as 1 block gives 6 units with R repeated twice: 6! / 2! = 720 / 2 = 360. The 3 vowels can arrange internally in 3! = 6 ways. Total = 360 × 6 = 2160.'
    },
    {
      id: 'q-bio-401',
      subjectId: 'biology',
      chapterId: 'bio-1',
      categories: ['ssc', 'hsc', 'med', 'uni', 'bcs'],
      difficulty: 'Easy',
      examTag: 'Medical Admission Core',
      question: 'Which cellular organelle contains its own circular DNA and 70S ribosomes, enabling semi-autonomous protein synthesis?',
      questionBn: 'কোন কোষীয় অঙ্গাণুতে নিজস্ব বৃত্তাকার DNA এবং 70S রাইবোজোম থাকায় এটি আধা-স্বায়ত্তশাসিতভাবে প্রোটিন সংশ্লেষণ করতে পারে?',
      options: ['Golgi Apparatus (গলগি বডি)', 'Mitochondria (মাইটোকন্ড্রিয়া)', 'Lysosome (লাইসোজোম)', 'Endoplasmic Reticulum (এন্ডোপ্লাজমিক রেটিকুলাম)'],
      correctIndex: 1,
      explanation: 'Both Mitochondria and Chloroplasts possess their own circular DNA and prokaryotic-type 70S ribosomes, allowing them to synthesize a subset of their own proteins independently.'
    },
    {
      id: 'q-bio-402',
      subjectId: 'biology',
      chapterId: 'bio-2',
      categories: ['hsc', 'med', 'uni'],
      difficulty: 'Medium',
      examTag: 'MBBS Admission Standard',
      question: 'Which acts as the natural pacemaker of the human heart by initiating the cardiac electrical impulse?',
      questionBn: 'মানব হৃৎপিণ্ডের প্রাকৃতিক পেসমেকার (Natural Pacemaker) হিসেবে নিচের কোনটি তড়িৎ উদ্দীপনা শুরু করে?',
      options: ['Atrioventricular Node (AVN)', 'Sinoatrial Node (SAN)', 'Bundle of His', 'Purkinje Fibers'],
      correctIndex: 1,
      explanation: 'The Sinoatrial Node (SA Node), located in the upper wall of the right atrium near the superior vena cava opening, spontaneously generates action potentials at 70–80 bpm and serves as the natural cardiac pacemaker.'
    },
    {
      id: 'q-eng-501',
      subjectId: 'english',
      chapterId: 'eng-2',
      categories: ['bcs', 'bank', 'uni', 'med', 'gov', 'hsc'],
      difficulty: 'Medium',
      examTag: 'BCS / DU / Bank Grammar',
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
      categories: ['bcs', 'bank', 'uni', 'gov'],
      difficulty: 'Medium',
      examTag: 'BCS English Literature',
      question: '"All the world’s a stage, And all the men and women merely players" — this famous soliloquy appears in which play by William Shakespeare?',
      questionBn: '"All the world’s a stage, And all the men and women merely players" — উইলিয়াম শেক্সপিয়ারের কোন নাটকের বিখ্যাত উক্তি?',
      options: ['Hamlet', 'As You Like It', 'The Tempest', 'Macbeth'],
      correctIndex: 1,
      explanation: 'Spoken by the melancholic character Jaques in Act II, Scene VII of William Shakespeare’s pastoral comedy "As You Like It", this speech introduces the Seven Ages of Man.'
    },
    {
      id: 'q-bn-601',
      subjectId: 'bangla',
      chapterId: 'bn-2',
      categories: ['bcs', 'uni', 'gov', 'ssc', 'hsc', 'bank'],
      difficulty: 'Medium',
      examTag: 'বিসিএস ও বিশ্ববিদ্যালয় ভর্তি',
      question: '"উপকূল" ও "যথাবিধি" শব্দ দুটি কোন সমাসের উদাহরণ?',
      questionBn: '"উপকূল" (কূলের সমীপে) ও "যথাবিধি" (বিধিকে অতিক্রম না করে) কোন সমাসের অন্তর্ভুক্ত?',
      options: ['অব্যয়ীভাব সমাস', 'কর্মধারয় সমাস', 'বহুব্রীহি সমাস', 'তৎপুরুষ সমাস'],
      correctIndex: 0,
      explanation: 'পূর্বপদে অব্যয় যোগে নিষ্পন্ন সমাসে যদি অব্যয়েরই অর্থের প্রাধান্য থাকে, তবে তাকে অব্যয়ীভাব সমাস বলে। যেমন: কূলের সমীপে = উপকূল (সামীপ্য অর্থে), বিধিকে অতিক্রম না করে = যথাবিধি (অনতিক্রম্যতা অর্থে)।'
    },
    {
      id: 'q-bn-602',
      subjectId: 'bangla',
      chapterId: 'bn-4',
      categories: ['bcs', 'uni', 'gov', 'gk'],
      difficulty: 'Easy',
      examTag: 'বাংলা সাহিত্য ও মুক্তিযুদ্ধ',
      question: '১৯৫২ সালের ভাষা আন্দোলনের পটভূমিতে রচিত মুনীর চৌধুরীর বিখ্যাত নাটক "কবর" কোন কারাগারে বসে রচিত হয়েছিল?',
      questionBn: 'ভাষা আন্দোলনের পটভূমিতে রচিত মুনীর চৌধুরীর বিখ্যাত একাঙ্কিকা নাটক "কবর" (১৯৫৩) কোন কারাগারে বসে রচিত হয়?',
      options: ['রাজশাহী কেন্দ্রীয় কারাগার', 'ঢাকা কেন্দ্রীয় কারাগার', 'কুমিল্লা কারাগার', 'সিলেট কারাগার'],
      correctIndex: 1,
      explanation: '১৯৫২ সালের ভাষা আন্দোলনে অংশগ্রহণের কারণে কারাবন্দী অবস্থায় ১৯৫৩ সালে ঢাকা কেন্দ্রীয় কারাগারে বসে মুনীর চৌধুরী "কবর" নাটকটি রচনা করেন এবং কারাবন্দীদের দ্বারা তা মঞ্চস্থ হয়।'
    },
    {
      id: 'q-gk-701',
      subjectId: 'gk',
      chapterId: 'gk-1',
      categories: ['bcs', 'uni', 'med', 'gov', 'bank', 'gk'],
      difficulty: 'Easy',
      examTag: 'Bangladesh Liberation War',
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
      examTag: 'Constitution of Bangladesh',
      question: 'Which Article of the Constitution of the People’s Republic of Bangladesh guarantees "Equality of opportunity in public employment"?',
      questionBn: 'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধানের কোন অনুচ্ছেদে "সরকারি নিয়োগ-লাভে সুযোগের সমতা" নিশ্চিত করা হয়েছে?',
      options: ['Article 27 (অনুচ্ছেদ ২৭)', 'Article 28 (অনুচ্ছেদ ২৮)', 'Article 29 (অনুচ্ছেদ ২৯)', 'Article 32 (অনুচ্ছেদ ৩২)'],
      correctIndex: 2,
      explanation: 'Article 27 guarantees equality before law, Article 28 prohibits discrimination on grounds of religion/race/sex, Article 29 guarantees equality of opportunity in public employment, and Article 32 protects the right to life and personal liberty.'
    },
    {
      id: 'q-ict-801',
      subjectId: 'ict',
      chapterId: 'ict-1',
      categories: ['hsc', 'bcs', 'bank', 'uni', 'gov'],
      difficulty: 'Easy',
      examTag: 'HSC ICT / BCS / Bank',
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
      examTag: 'Networking & Protocols',
      question: 'Which layer of the OSI 7-Layer Reference Model is responsible for end-to-end packet routing and IP logical addressing?',
      questionBn: 'OSI মডেলের কোন স্তরটি IP অ্যাড্রেসিং এবং ডেটা প্যাকেটের রাউটিং (Routing) নিয়ন্ত্রণ করে?',
      options: ['Data Link Layer (Layer 2)', 'Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Session Layer (Layer 5)'],
      correctIndex: 1,
      explanation: 'The Network Layer (Layer 3) handles logical addressing (IPv4/IPv6) and determines the optimal physical path (routing) for data packets across networks.'
    }
  ],

  /* Curated Preset Quiz Packs for Home & Recommended */
  recommendedQuizzes: [
    {
      id: 'pack-daily',
      title: 'ExamVerse Daily Merit Sprint',
      titleBn: 'ডেইলি মেরিট স্প্রিন্ট চ্যালেঞ্জ',
      subtitle: 'High-yield mixed questions across Physics, Math, English, Bangla & GK',
      category: 'uni',
      subjectId: 'all',
      questionIds: ['q-phy-101', 'q-chem-201', 'q-math-301', 'q-bio-401', 'q-eng-501', 'q-bn-601', 'q-gk-701', 'q-ict-801'],
      durationSec: 480,
      xpReward: 150,
      badgeText: 'Daily Challenge'
    },
    {
      id: 'pack-bcs-core',
      title: '47th BCS Preliminary Master Capsule',
      titleBn: '৪৭তম বিসিএস প্রিলিমিনারি ক্যাপসুল',
      subtitle: 'Bangla Literature, Constitution, English Grammar, ICT & Analytical Aptitude',
      category: 'bcs',
      subjectId: 'gk',
      questionIds: ['q-bn-601', 'q-bn-602', 'q-eng-501', 'q-eng-502', 'q-gk-701', 'q-gk-702', 'q-math-303', 'q-ict-801'],
      durationSec: 480,
      xpReward: 120,
      badgeText: 'BCS Special'
    },
    {
      id: 'pack-stem-admission',
      title: 'BUET & DU A-Unit STEM Diagnostic',
      titleBn: 'বুয়েট ও ঢাবি ক-ইউনিট ডায়াগনস্টিক',
      subtitle: 'Vectors, Thermodynamics, Calculus, Matrices & Chemical Equilibrium',
      category: 'eng',
      subjectId: 'physics',
      questionIds: ['q-phy-101', 'q-phy-102', 'q-phy-104', 'q-chem-201', 'q-chem-202', 'q-chem-203', 'q-math-301', 'q-math-302'],
      durationSec: 540,
      xpReward: 140,
      badgeText: 'STEM High-Yield'
    },
    {
      id: 'pack-medical-rapid',
      title: 'Medical MBBS Rapid Fire',
      titleBn: 'মেডিকেল ভর্তি র‍্যাপিড প্র্যাকটিস',
      subtitle: 'Cell Biology, Human Physiology, pH Calculation, Organic & GK',
      category: 'med',
      subjectId: 'biology',
      questionIds: ['q-bio-401', 'q-bio-402', 'q-chem-201', 'q-chem-202', 'q-phy-103', 'q-eng-501', 'q-gk-701'],
      durationSec: 420,
      xpReward: 110,
      badgeText: 'Medical Track'
    }
  ],

  /* Metallic Geometric Achievement Badges */
  achievements: [
    {
      id: 'badge-first-step',
      title: 'First Meridian',
      titleBn: 'প্রথম পদক্ষেপ',
      description: 'Complete your first diagnostic or practice examination.',
      xpBonus: 50,
      tier: 'bronze',
      unlockedByDefault: true
    },
    {
      id: 'badge-streak-7',
      title: 'Septenary Flame',
      titleBn: '৭ দিনের ধারাবাহিকতা',
      description: 'Maintain an active study streak for 7 consecutive days.',
      xpBonus: 150,
      tier: 'gold',
      unlockedByDefault: true
    },
    {
      id: 'badge-precision-90',
      title: 'Apex Precision',
      titleBn: 'নির্ভুল মেধা (৯০%+)',
      description: 'Score 90% or higher accuracy in any standard quiz session.',
      xpBonus: 200,
      tier: 'gold',
      unlockedByDefault: true
    },
    {
      id: 'badge-stem-scholar',
      title: 'Vector & Calculus Savant',
      titleBn: 'বিজ্ঞান ও গণিত বিশারদ',
      description: 'Solve 50+ Physics, Chemistry, and Higher Math problems.',
      xpBonus: 180,
      tier: 'silver',
      unlockedByDefault: true
    },
    {
      id: 'badge-mistake-conqueror',
      title: 'Zero Deficit',
      titleBn: 'ভুল সংশোধনকারী',
      description: 'Review and clear questions from your personal Mistake Bank.',
      xpBonus: 120,
      tier: 'silver',
      unlockedByDefault: false
    },
    {
      id: 'badge-centurion',
      title: 'Centurion Scholar',
      titleBn: 'শততম কুইজ বিজয়ী',
      description: 'Reach Level 15 and accumulate 5,000+ lifetime XP.',
      xpBonus: 350,
      tier: 'gold',
      unlockedByDefault: false
    }
  ],

  /* Leaderboard Data (Global & Friends across Today, Week, All Time) */
  leaderboards: {
    global: {
      today: [
        { rank: 1, name: 'Nafis Rahman', handle: '@nafis_buet', avatar: 'NR', level: 18, xp: 640, badge: 'BUET Track', isFriend: true },
        { rank: 2, name: 'Tasnim Zara', handle: '@tasnim_dmc', avatar: 'TZ', level: 17, xp: 590, badge: 'Medical Track', isFriend: true },
        { rank: 3, name: 'Mahir Labib', handle: '@mahir_du', avatar: 'ML', level: 15, xp: 520, badge: 'DU A-Unit', isFriend: false },
        { rank: 4, name: 'Arian Chowdhury', handle: '@arian_ev', avatar: 'AC', level: 14, xp: 480, badge: 'Scholar', isCurrentUser: true, isFriend: true },
        { rank: 5, name: 'Sadia Islam', handle: '@sadia_bcs', avatar: 'SI', level: 16, xp: 445, badge: '47th BCS', isFriend: true },
        { rank: 6, name: 'Farhan Sadik', handle: '@farhan_hsc', avatar: 'FS', level: 13, xp: 410, badge: 'HSC 26', isFriend: false },
        { rank: 7, name: 'Nusrat Jahan', handle: '@nusrat_ju', avatar: 'NJ', level: 12, xp: 375, badge: 'University', isFriend: false }
      ],
      week: [
        { rank: 1, name: 'Tasnim Zara', handle: '@tasnim_dmc', avatar: 'TZ', level: 17, xp: 3420, badge: 'Medical Track', isFriend: true },
        { rank: 2, name: 'Nafis Rahman', handle: '@nafis_buet', avatar: 'NR', level: 18, xp: 3290, badge: 'BUET Track', isFriend: true },
        { rank: 3, name: 'Arian Chowdhury', handle: '@arian_ev', avatar: 'AC', level: 14, xp: 2840, badge: 'Scholar', isCurrentUser: true, isFriend: true },
        { rank: 4, name: 'Sadia Islam', handle: '@sadia_bcs', avatar: 'SI', level: 16, xp: 2610, badge: '47th BCS', isFriend: true },
        { rank: 5, name: 'Mahir Labib', handle: '@mahir_du', avatar: 'ML', level: 15, xp: 2490, badge: 'DU A-Unit', isFriend: false },
        { rank: 6, name: 'Tanvir Ahmed', handle: '@tanvir_bank', avatar: 'TA', level: 14, xp: 2180, badge: 'Bank Jobs', isFriend: true },
        { rank: 7, name: 'Farhan Sadik', handle: '@farhan_hsc', avatar: 'FS', level: 13, xp: 1950, badge: 'HSC 26', isFriend: false }
      ],
      alltime: [
        { rank: 1, name: 'Nafis Rahman', handle: '@nafis_buet', avatar: 'NR', level: 18, xp: 18450, badge: 'BUET Track', isFriend: true },
        { rank: 2, name: 'Tasnim Zara', handle: '@tasnim_dmc', avatar: 'TZ', level: 17, xp: 17210, badge: 'Medical Track', isFriend: true },
        { rank: 3, name: 'Sadia Islam', handle: '@sadia_bcs', avatar: 'SI', level: 16, xp: 15890, badge: '47th BCS', isFriend: true },
        { rank: 4, name: 'Mahir Labib', handle: '@mahir_du', avatar: 'ML', level: 15, xp: 14620, badge: 'DU A-Unit', isFriend: false },
        { rank: 5, name: 'Arian Chowdhury', handle: '@arian_ev', avatar: 'AC', level: 14, xp: 13480, badge: 'Scholar', isCurrentUser: true, isFriend: true },
        { rank: 6, name: 'Tanvir Ahmed', handle: '@tanvir_bank', avatar: 'TA', level: 14, xp: 12900, badge: 'Bank Jobs', isFriend: true },
        { rank: 7, name: 'Farhan Sadik', handle: '@farhan_hsc', avatar: 'FS', level: 13, xp: 11400, badge: 'HSC 26', isFriend: false }
      ]
    }
  }
};
