// backend/data/targetedProjects.js

const targetedProjects = [
  // Beginner Web + JavaScript
  {
    title: "Student Task Tracker Web App",
    description:
      "A beginner-friendly web application where students can create, update, filter, and complete daily academic tasks using a simple JavaScript interface.",
    difficulty: "easy",
    projectType: "web application",
    technologies: ["javascript", "html", "css", "localStorage"],
    categories: ["web", "frontend", "productivity"],
    features:
      "Task creation, completion status, category filters, due dates, simple local persistence, and responsive layout.",
    learning:
      "Practice DOM manipulation, event handling, form validation, array methods, localStorage, and basic responsive UI design."
  },
  {
    title: "Personal Portfolio Website Builder",
    description:
      "A simple web app that helps users generate a clean personal portfolio page from form inputs such as name, skills, projects, and contact links.",
    difficulty: "easy",
    projectType: "web application",
    technologies: ["javascript", "html", "css"],
    categories: ["web", "frontend", "ui/ux"],
    features:
      "Live preview, editable sections, project cards, contact block, downloadable HTML preview, and responsive design.",
    learning:
      "Learn forms, state handling in vanilla JavaScript, layout structure, reusable components, and basic UI polish."
  },
  {
    title: "Recipe Finder Web App",
    description:
      "A beginner web application where users search recipes by ingredient and view simple recipe cards with cooking instructions and tags.",
    difficulty: "easy",
    projectType: "web application",
    technologies: ["javascript", "html", "css", "api"],
    categories: ["web", "frontend", "productivity"],
    features:
      "Search bar, recipe cards, ingredient filters, saved favorites, empty states, and API result rendering.",
    learning:
      "Practice fetch API, async JavaScript, rendering dynamic lists, error handling, and beginner-friendly UI states."
  },
  {
    title: "Simple Budget Planner",
    description:
      "A small web app for tracking income, expenses, and remaining balance using beginner JavaScript and browser storage.",
    difficulty: "easy",
    projectType: "web application",
    technologies: ["javascript", "html", "css", "localStorage"],
    categories: ["web", "frontend", "finance"],
    features:
      "Income input, expense list, balance calculation, category tags, delete actions, and monthly summary.",
    learning:
      "Learn JavaScript calculations, arrays, localStorage, form validation, and simple financial dashboard logic."
  },
  {
    title: "Study Timer and Habit Tracker",
    description:
      "A beginner productivity web app that combines a Pomodoro study timer with habit tracking for daily learning sessions.",
    difficulty: "easy",
    projectType: "web application",
    technologies: ["javascript", "html", "css"],
    categories: ["web", "frontend", "productivity", "education"],
    features:
      "Pomodoro timer, habit checklist, daily streak counter, session history, and simple progress cards.",
    learning:
      "Practice timers, intervals, browser state, UI updates, local persistence, and small productivity app design."
  },

  // Beginner AI + Python
  {
    title: "Movie Review Sentiment Classifier",
    description:
      "A beginner AI tool that classifies short movie reviews as positive or negative using Python text preprocessing and a simple machine learning model.",
    difficulty: "easy",
    projectType: "ai tool",
    technologies: ["python", "scikit-learn", "pandas"],
    categories: ["ai", "machine learning", "data science"],
    features:
      "Dataset loading, text cleaning, model training, prediction form, accuracy report, and sample review testing.",
    learning:
      "Learn text preprocessing, train/test split, classification, accuracy metrics, and basic machine learning workflow."
  },
  {
    title: "Beginner Image Label Classifier",
    description:
      "A simple Python AI project that trains a basic classifier to recognize image categories using a small dataset and beginner-friendly model evaluation.",
    difficulty: "easy",
    projectType: "ai tool",
    technologies: ["python", "tensorflow", "numpy"],
    categories: ["ai", "machine learning", "computer vision"],
    features:
      "Image loading, preprocessing, model training, prediction output, confidence display, and simple evaluation metrics.",
    learning:
      "Practice image preprocessing, neural network basics, model fitting, prediction confidence, and evaluation."
  },
  {
    title: "Spam Email Detector",
    description:
      "A beginner-friendly Python machine learning tool that detects whether a message looks like spam using text features and classification.",
    difficulty: "easy",
    projectType: "ai tool",
    technologies: ["python", "scikit-learn", "pandas"],
    categories: ["ai", "machine learning", "data science"],
    features:
      "CSV import, text vectorization, classifier training, spam prediction, and confusion matrix display.",
    learning:
      "Learn classification, feature extraction, model evaluation, and how AI tools process text data."
  },
  {
    title: "Student Score Predictor",
    description:
      "A Python regression project that predicts student exam scores based on study hours, attendance, and practice activity.",
    difficulty: "easy",
    projectType: "ai tool",
    technologies: ["python", "pandas", "scikit-learn"],
    categories: ["ai", "machine learning", "education", "data science"],
    features:
      "Dataset cleaning, regression model, score prediction, input form, error metrics, and simple visualization.",
    learning:
      "Practice regression, feature selection, model training, prediction, MAE/RMSE, and education-focused AI analysis."
  },
  {
    title: "Simple Chat Intent Classifier",
    description:
      "A beginner AI tool that classifies short user messages into intents such as greeting, complaint, question, or request.",
    difficulty: "easy",
    projectType: "ai tool",
    technologies: ["python", "scikit-learn", "pandas"],
    categories: ["ai", "machine learning", "natural language processing"],
    features:
      "Intent dataset, text preprocessing, classifier training, prediction function, and test message interface.",
    learning:
      "Learn basic NLP, labels, text features, classification, and how simple chatbot intent systems work."
  },

  // Intermediate Mobile + Flutter
  {
    title: "Flutter Study Planner App",
    description:
      "A mobile application for students to plan weekly study sessions, track completed tasks, and view simple learning progress.",
    difficulty: "medium",
    projectType: "mobile application",
    technologies: ["flutter", "dart", "firebase"],
    categories: ["mobile", "education", "productivity"],
    features:
      "Weekly planner, task reminders, progress tracking, Firebase sync, and clean mobile UI screens.",
    learning:
      "Practice Flutter widgets, navigation, state management, Firebase integration, and mobile productivity workflows."
  },
  {
    title: "Flutter Expense Tracker",
    description:
      "A mobile app for recording daily expenses, categorizing spending, and viewing monthly financial summaries.",
    difficulty: "medium",
    projectType: "mobile application",
    technologies: ["flutter", "dart", "firebase"],
    categories: ["mobile", "finance", "productivity"],
    features:
      "Expense input, category filters, monthly charts, Firebase storage, and mobile dashboard screens.",
    learning:
      "Learn Flutter forms, charts, persistent storage, Firebase, state management, and financial app structure."
  },
  {
    title: "Mobile Habit Coach",
    description:
      "A Flutter productivity app that helps users build habits through streaks, reminders, and simple daily progress feedback.",
    difficulty: "medium",
    projectType: "mobile application",
    technologies: ["flutter", "dart", "firebase"],
    categories: ["mobile", "productivity", "health"],
    features:
      "Habit creation, streak tracking, reminders, progress calendar, Firebase sync, and user-friendly mobile UI.",
    learning:
      "Practice Flutter state, notifications, calendar UI, Firebase data models, and habit tracking logic."
  },
  {
    title: "Flutter Language Flashcards",
    description:
      "A mobile education app where users practice vocabulary using flashcards, quizzes, and spaced repetition.",
    difficulty: "medium",
    projectType: "mobile application",
    technologies: ["flutter", "dart", "firebase"],
    categories: ["mobile", "education", "learning"],
    features:
      "Flashcard decks, quiz mode, spaced repetition, progress tracking, and Firebase user data.",
    learning:
      "Learn mobile education app design, Flutter navigation, data persistence, quiz logic, and progress tracking."
  },
  {
    title: "Campus Event Finder Mobile App",
    description:
      "A Flutter mobile app that helps students discover campus events, filter by category, and save events they want to attend.",
    difficulty: "medium",
    projectType: "mobile application",
    technologies: ["flutter", "dart", "firebase"],
    categories: ["mobile", "education", "productivity"],
    features:
      "Event list, category filters, saved events, event details, Firebase backend, and mobile-first UI.",
    learning:
      "Practice list rendering, filtering, Firebase CRUD, app navigation, and event-based mobile product design."
  },

  // Advanced Cybersecurity
  {
    title: "Network Intrusion Detection Dashboard",
    description:
      "An advanced cybersecurity project that analyzes network traffic logs and visualizes suspicious activity through a web dashboard.",
    difficulty: "hard",
    projectType: "research project",
    technologies: ["python", "pandas", "scikit-learn", "react"],
    categories: ["cybersecurity", "networks", "machine learning", "data visualization"],
    features:
      "Traffic log ingestion, anomaly detection, alert scoring, dashboard visualization, and suspicious pattern summaries.",
    learning:
      "Study network security, anomaly detection, log analysis, ML-based classification, and security dashboard design."
  },
  {
    title: "Web Vulnerability Scanner",
    description:
      "A security tool that scans web applications for common vulnerabilities such as missing headers, exposed paths, and weak configurations.",
    difficulty: "hard",
    projectType: "research project",
    technologies: ["python", "javascript", "node.js"],
    categories: ["cybersecurity", "web", "security"],
    features:
      "URL scanner, security header checks, exposed route detection, risk report, and vulnerability summary.",
    learning:
      "Learn web security basics, HTTP analysis, scanning logic, vulnerability reporting, and responsible security testing."
  },
  {
    title: "Phishing URL Detection System",
    description:
      "A cybersecurity machine learning project that classifies suspicious URLs using lexical features and risk indicators.",
    difficulty: "hard",
    projectType: "research project",
    technologies: ["python", "scikit-learn", "pandas"],
    categories: ["cybersecurity", "machine learning", "security"],
    features:
      "URL feature extraction, phishing classifier, model metrics, risk score output, and suspicious URL report.",
    learning:
      "Practice cybersecurity data analysis, feature engineering, classification metrics, and phishing detection methods."
  },
  {
    title: "Log Anomaly Detection Tool",
    description:
      "An advanced security analytics tool that detects abnormal login and server log patterns using Python and anomaly detection.",
    difficulty: "hard",
    projectType: "research project",
    technologies: ["python", "pandas", "scikit-learn"],
    categories: ["cybersecurity", "systems", "data science"],
    features:
      "Log parser, anomaly scoring, suspicious activity timeline, user risk summary, and exportable security report.",
    learning:
      "Learn log analysis, anomaly detection, security monitoring, feature extraction, and incident investigation basics."
  },
  {
    title: "Secure File Sharing System",
    description:
      "A secure web system for uploading, encrypting, sharing, and revoking access to sensitive files.",
    difficulty: "hard",
    projectType: "web application",
    technologies: ["javascript", "node.js", "mongodb", "crypto"],
    categories: ["cybersecurity", "web", "security"],
    features:
      "Encrypted uploads, access tokens, permission revocation, audit logs, and secure download links.",
    learning:
      "Practice encryption concepts, secure backend design, access control, file handling, and audit logging."
  },

  // Game Dev + C#
  {
    title: "Unity 2D Platformer with Level Editor",
    description:
      "A C# and Unity game project where players complete platform levels and the developer can build custom levels with a simple editor.",
    difficulty: "medium",
    projectType: "game",
    technologies: ["unity", "c#"],
    categories: ["games", "game development", "simulation"],
    features:
      "Player movement, enemies, collectibles, level editor, checkpoints, and level save/load system.",
    learning:
      "Learn Unity physics, C# scripts, collision handling, prefab design, level structure, and game loop logic."
  },
  {
    title: "Unity Survival Crafting Prototype",
    description:
      "A Unity survival game prototype where players collect resources, craft items, manage health, and survive simple environmental threats.",
    difficulty: "medium",
    projectType: "game",
    technologies: ["unity", "c#"],
    categories: ["games", "game development", "simulation"],
    features:
      "Resource gathering, crafting recipes, health system, inventory, day cycle, and survival mechanics.",
    learning:
      "Practice Unity systems, C# object interactions, inventory modeling, crafting logic, and gameplay balancing."
  },
  {
    title: "Turn-Based Strategy Game in C#",
    description:
      "A grid-based strategy game where players control units, move across tiles, and fight enemies using turn-based combat.",
    difficulty: "medium",
    projectType: "game",
    technologies: ["unity", "c#"],
    categories: ["games", "game development", "strategy"],
    features:
      "Grid movement, unit turns, attack ranges, enemy AI, health system, and win/loss conditions.",
    learning:
      "Learn turn systems, grid algorithms, C# classes, enemy logic, and strategy game architecture."
  },
  {
    title: "3D Physics Puzzle Game",
    description:
      "A Unity 3D puzzle game where players solve physics-based challenges using movement, triggers, platforms, and interactive objects.",
    difficulty: "medium",
    projectType: "game",
    technologies: ["unity", "c#"],
    categories: ["games", "game development", "simulation"],
    features:
      "3D player controller, physics puzzles, pressure plates, moving platforms, and level progression.",
    learning:
      "Practice Unity physics, Rigidbody behavior, triggers, level design, puzzle logic, and C# scripting."
  },
  {
    title: "Procedural Dungeon Generator",
    description:
      "A Unity game systems project that generates random dungeon maps with rooms, corridors, enemies, and loot placement.",
    difficulty: "medium",
    projectType: "game",
    technologies: ["unity", "c#"],
    categories: ["games", "game development", "procedural generation"],
    features:
      "Room generation, corridor connection, enemy spawning, loot placement, seed-based maps, and minimap preview.",
    learning:
      "Learn procedural generation, randomization, map algorithms, Unity tile systems, and replayable game design."
  },

  // Data Dashboard + React/Node
  {
    title: "Sales Analytics Dashboard",
    description:
      "A React and Node.js dashboard that visualizes sales revenue, top products, monthly trends, and customer segments.",
    difficulty: "medium",
    projectType: "data dashboard",
    technologies: ["react", "node.js", "mongodb", "charts"],
    categories: ["data visualization", "analytics", "dashboard", "e-commerce"],
    features:
      "Sales charts, product filters, customer segments, KPI cards, backend API, and dashboard layout.",
    learning:
      "Practice dashboard design, REST APIs, chart rendering, data aggregation, filters, and analytics storytelling."
  },
  {
    title: "Student Performance Analytics Dashboard",
    description:
      "A data dashboard for visualizing student grades, attendance, risk levels, and subject performance trends.",
    difficulty: "medium",
    projectType: "data dashboard",
    technologies: ["react", "node.js", "mongodb", "charts"],
    categories: ["data visualization", "analytics", "dashboard", "education"],
    features:
      "Student KPIs, grade trends, attendance charts, risk flags, filters, and exportable reports.",
    learning:
      "Learn analytics dashboards, education data modeling, chart components, backend aggregation, and UX for insights."
  },
  {
    title: "IoT Sensor Data Dashboard",
    description:
      "A dashboard that receives simulated IoT sensor readings and visualizes temperature, humidity, and device status in real time.",
    difficulty: "medium",
    projectType: "data dashboard",
    technologies: ["react", "node.js", "mongodb", "charts"],
    categories: ["data visualization", "analytics", "dashboard", "iot"],
    features:
      "Live sensor feed, time-series charts, device status cards, alert thresholds, and backend API.",
    learning:
      "Practice real-time data display, charting, API design, time-series storage, and monitoring dashboard logic."
  },
  {
    title: "Financial KPI Dashboard",
    description:
      "A React and Node.js dashboard for tracking revenue, expenses, profit margin, and monthly financial performance.",
    difficulty: "medium",
    projectType: "data dashboard",
    technologies: ["react", "node.js", "mongodb", "charts"],
    categories: ["data visualization", "analytics", "dashboard", "finance"],
    features:
      "KPI cards, trend charts, expense breakdown, monthly filters, backend aggregation, and CSV-style summaries.",
    learning:
      "Learn finance analytics, chart design, REST APIs, data grouping, and dashboard-based decision support."
  },
  {
    title: "Social Media Metrics Dashboard",
    description:
      "A dashboard that tracks follower growth, post engagement, reach, and content performance across simulated social media data.",
    difficulty: "medium",
    projectType: "data dashboard",
    technologies: ["react", "node.js", "mongodb", "charts"],
    categories: ["data visualization", "analytics", "dashboard"],
    features:
      "Engagement charts, follower trends, post ranking, platform filters, KPI cards, and performance summaries.",
    learning:
      "Practice analytics UI, chart components, filtering, metric definitions, and data-driven product reporting."
  },

  // E-commerce Full Stack
  {
    title: "Inventory Management Dashboard",
    description:
      "A full-stack e-commerce dashboard for tracking products, stock levels, suppliers, and low-inventory alerts.",
    difficulty: "medium",
    projectType: "web application",
    technologies: ["react", "node.js", "mongodb"],
    categories: ["e-commerce", "inventory", "dashboard"],
    features:
      "Product CRUD, stock alerts, supplier fields, inventory filters, dashboard metrics, and backend API.",
    learning:
      "Learn full-stack CRUD, inventory logic, MongoDB schemas, API design, and admin dashboard workflows."
  },
  {
    title: "Multi-vendor Marketplace MVP",
    description:
      "A full-stack marketplace where vendors can list products and customers can browse, filter, and save items.",
    difficulty: "medium",
    projectType: "web application",
    technologies: ["react", "node.js", "mongodb"],
    categories: ["e-commerce", "marketplace", "web"],
    features:
      "Vendor accounts, product listings, search filters, saved products, order mockup, and admin controls.",
    learning:
      "Practice multi-role systems, product catalogs, MongoDB relationships, REST APIs, and marketplace workflows."
  },
  {
    title: "Product Review Sentiment Analyzer",
    description:
      "An e-commerce AI tool that analyzes customer product reviews and summarizes positive and negative sentiment trends.",
    difficulty: "medium",
    projectType: "ai tool",
    technologies: ["python", "javascript", "react", "node.js"],
    categories: ["e-commerce", "ai", "machine learning"],
    features:
      "Review upload, sentiment classification, product sentiment score, keyword summary, and dashboard display.",
    learning:
      "Learn sentiment analysis, review data processing, AI-backed dashboards, and e-commerce analytics."
  },
  {
    title: "Order Tracking System",
    description:
      "A full-stack web application where customers track orders and admins update delivery statuses through a simple dashboard.",
    difficulty: "medium",
    projectType: "web application",
    technologies: ["react", "node.js", "mongodb"],
    categories: ["e-commerce", "web", "productivity"],
    features:
      "Order list, status updates, customer tracking page, admin dashboard, search, and delivery timeline.",
    learning:
      "Practice full-stack status workflows, REST APIs, MongoDB modeling, conditional rendering, and admin UX."
  },
  {
    title: "Abandoned Cart Recovery Dashboard",
    description:
      "An e-commerce analytics dashboard that tracks abandoned carts, customer segments, and recovery campaign performance.",
    difficulty: "medium",
    projectType: "data dashboard",
    technologies: ["react", "node.js", "mongodb", "charts"],
    categories: ["e-commerce", "analytics", "dashboard"],
    features:
      "Abandoned cart list, recovery rate charts, customer filters, KPI cards, and campaign performance metrics.",
    learning:
      "Learn e-commerce analytics, dashboard KPIs, customer segmentation, backend aggregation, and chart storytelling."
  },

  // Education + AI Tools
  {
    title: "AI Tutor for Programming Basics",
    description:
      "An education AI tool that helps beginners understand programming concepts by generating explanations, hints, and practice questions.",
    difficulty: "medium",
    projectType: "ai tool",
    technologies: ["javascript", "python", "react", "api"],
    categories: ["education", "ai", "productivity"],
    features:
      "Concept explanations, hint generation, quiz prompts, progress notes, and beginner-friendly learning flow.",
    learning:
      "Practice AI prompt design, educational UX, API integration, state handling, and learning support workflows."
  },
  {
    title: "Adaptive Quiz Generator",
    description:
      "An AI-powered education tool that generates quizzes based on subject, difficulty, and previous learner performance.",
    difficulty: "medium",
    projectType: "ai tool",
    technologies: ["javascript", "python", "react", "api"],
    categories: ["education", "ai", "learning"],
    features:
      "Quiz generation, difficulty adjustment, answer checking, score tracking, and personalized retry suggestions.",
    learning:
      "Learn AI-assisted content generation, quiz logic, learner modeling, API integration, and educational feedback design."
  },
  {
    title: "Lecture Notes Summarizer",
    description:
      "An education AI tool that summarizes lecture notes into key points, flashcards, and revision questions.",
    difficulty: "medium",
    projectType: "ai tool",
    technologies: ["javascript", "python", "react", "api"],
    categories: ["education", "ai", "productivity"],
    features:
      "Text upload, summary generation, flashcards, revision questions, saved notes, and study mode.",
    learning:
      "Practice AI summarization, text processing, frontend forms, API usage, and study-focused UX."
  },
  {
    title: "Math Practice Recommendation System",
    description:
      "An AI education tool that recommends math exercises based on student level, weak topics, and past mistakes.",
    difficulty: "medium",
    projectType: "ai tool",
    technologies: ["python", "javascript", "react"],
    categories: ["education", "ai", "machine learning"],
    features:
      "Topic diagnostics, exercise recommendations, mistake tracking, progress dashboard, and adaptive practice flow.",
    learning:
      "Learn recommendation logic, education data modeling, adaptive learning design, and AI-assisted practice systems."
  },
  {
    title: "AI Study Planner",
    description:
      "A productivity-focused education AI tool that generates weekly study plans from goals, deadlines, subjects, and available time.",
    difficulty: "medium",
    projectType: "ai tool",
    technologies: ["javascript", "react", "api"],
    categories: ["education", "ai", "productivity"],
    features:
      "Goal input, weekly plan generation, task breakdown, reminders, progress tracking, and study schedule editing.",
    learning:
      "Practice AI planning prompts, productivity app design, calendar-style UI, user goals, and structured output handling."
  }
];

module.exports = targetedProjects;