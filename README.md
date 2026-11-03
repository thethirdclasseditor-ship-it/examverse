[README.md](https://github.com/user-attachments/files/34302490/README.md)
# ExamVerse — Educational Examination & MCQ Mastery Platform

ExamVerse is a responsive, bilingual (English + বাংলা) examination and MCQ deliberate-practice platform designed for SSC, HSC, University Admission (DU, BUET, Medical, GST), BCS Preliminary, and Bank/Government job preparation.

## Project Structure

```text
examverse/
├── index.html                  # Application shell, modals, and zero-FOUC theme loader
├── manifest.json               # PWA installable manifest with 192x192 & 512x512 maskable icons
├── sw.js                       # Offline-capable Service Worker with cache versioning
├── README.md                   # Architecture, setup, and contribution documentation
├── css/
│   ├── theme.css               # Light Mode (default) & Dark Mode CSS tokens + academic grid
│   ├── main.css                # Layout, accessible focus states, 40px touch targets, responsive rules
│   └── animations.css          # Restrained 180-240ms transitions & reduced-motion support
├── js/
│   ├── data.js                 # Verified syllabus tree (9 categories, 8 subjects, 32 chapters) & MCQs
│   ├── storage.js              # LocalStorage state manager, Asia/Dhaka streak & rolling 7-day stats
│   ├── supabase-client.js      # Cloud REST connector with pagination for Supabase PostgreSQL
│   ├── quiz.js                 # Practice & Timed Exam engine, deadline timer, negative marking
│   └── app.js                  # Hash router (#/home, #/exams, etc.), KaTeX math renderer, modals
└── supabase/
    ├── schema.sql              # Production PostgreSQL schema for 500k+ MCQs & Creative Questions (CQs)
    └── bulk-mcq-template.csv   # Excel / Google Sheets CSV import template
```

## Local Development & Deployment

1. **Local Preview**: Serve the root directory with any static HTTP server (e.g., `npx serve .` or `python3 -m http.server 8080`).
2. **Cloudflare Pages Deployment**: Connect your GitHub repository to Cloudflare Pages with Framework preset `None`, empty build command, and root output directory `/`.
3. **Database Setup**: Run `supabase/schema.sql` in the Supabase SQL Editor and configure your URL and Anon Key in `js/supabase-client.js`.
