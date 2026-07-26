<div align="center">
# 🧠 AI Project Recommender
 
**A hybrid AI recommendation engine that matches students, creators, and learners with portfolio-worthy project ideas — personalized by Google Gemini and backed by a deterministic scoring engine.**
 
Built as a full-stack thesis demo (MERN + Gemini API)
 
</div>
<p align="center">
  <img src="./assets/home.jpg" alt="AI Project Recommender - Home" width="100%">
</p>

![React](https://img.shields.io/badge/React-18-blue)

![Node.js](https://img.shields.io/badge/Node.js-Express-green)

![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)

![Gemini](https://img.shields.io/badge/Google-Gemini-orange)

![License](https://img.shields.io/badge/License-MIT-yellow)
---
## Table of Contents

- Overview
- Features
- Screenshots
- Architecture
- Dataset
- Installation
- API
- Evaluation
- Roadmap
- License
---
 
## ✨ Overview
 
**AI Project Recommender** helps users discover the right project to build next. A user answers a short questionnaire about their skill level, preferred tech stack, interests, and goals — the system then scores a dataset of projects deterministically, optionally re-ranks and personalizes the top candidates with **Gemini**, and returns a ranked list of recommendations with confidence scores, fit summaries, and a build brief for each.
 
It also ships with a full **Research / Evaluation Lab**: a password-protected developer dashboard for auditing the dataset, replaying test personas, inspecting Gemini vs. fallback performance, and tracking real user feedback per recommendation run.
 
## 🖼️ Preview
 
| Questionnaire | Results |
|---|---|
| ![Questionnaire](./assets/questionnaire.jpg) | ![Results](./assets/results.jpg) |
 
| Project Detail | Research Dashboard |
|---|---|
| ![Project Detail](./assets/project-detail.jpg) | ![Research Insights](./assets/research-insights.jpg) |
 
---
 
## 🚀 Features
 
- **Questionnaire-driven intake** — skill level, difficulty, project type, languages, interests, and optional personal context (portfolio goal, target industry, time available, build style).
- **Hybrid recommendation engine**
  - A deterministic scoring layer ranks the full project dataset against user preferences (skill match, tech alignment, interest fit).
  - The top candidates are sent to **Gemini** for reranking and personalization — generating a custom title, build brief, feature list, milestones, portfolio angle, and fit summary per project.
  - If Gemini is unavailable or fails, the system gracefully falls back to deterministic-only results so recommendations are never blocked.
- **Results dashboard** — ranked cards with AI score, AI confidence, difficulty, tech stack, and a "Gemini Personalized" vs. "Fallback" badge; expandable detail modal per project.
- **Feedback loop** — users can mark a recommendation as *Helpful*, *Not Relevant*, or a *Favorite*; feedback is tied to the exact `runId` for later analysis.
- **Report export** — generate a shareable report of a recommendation run.
- **Research Insights dashboard** — run-based analytics: total recommendations, Gemini vs. fallback split, average confidence, and per-project feedback performance.
- **Dev Lab** — token-protected admin area (password + signed access token) with:
  - **Dataset Editor** — view/edit/audit the project dataset
  - **Evaluation Lab** — replay saved test personas (e.g. *Beginner Web + JavaScript*, *Beginner AI + Python*, *Intermediate Mobile + Flutter*) against the live engine to sanity-check ranking quality
  - **Audit** — flags projects with missing fields or weak scoring
- **Recommendation run persistence** — every run is saved to MongoDB with the normalized preferences, full recommendation payload, and Gemini/fallback metadata for reproducibility.
## 📚 The Dataset
 
The recommender doesn't ask Gemini to invent projects out of thin air — it ranks and personalizes from a **curated corpus of 85 project records**, assembled in three layers:
 
| Source | Role | Records |
|---|---|---|
| `backend/seed.js` | Initial base projects | 15 |
| `backend/data/targetedProjects.js` | Targeted projects by difficulty, tech, category, and type | 40 |
| `backend/scripts/addDatasetExpansionProjects.js` | Expansion into weak-coverage areas (automation, hardware, VR, Web3, Go, Rust, C++, TensorFlow, etc.) | 30 |
 
Each project record carries `title`, `description`, `technologies`, `difficulty`, `categories`, `projectType`, `features`, and `learning` — the shared vocabulary the scoring engine compares against. A **taxonomy normalization layer** (`backend/services/taxonomy.js`) expands and canonicalizes terms (e.g. "JS" ↔ "JavaScript") so matching isn't broken by wording differences.
 
## 🏗️ Architecture
 
```
┌─────────────────┐        POST /recommend        ┌──────────────────────┐
│   React Frontend │ ─────────────────────────────▶│   Express API        │
│  (Questionnaire,  │                                │                      │
│   Results, Dev    │◀───────────────────────────── │  1. Deterministic    │
│   Lab, Research)   │      ranked recommendations   │     scoring          │
└─────────────────┘                                │  2. Gemini rerank /  │
                                                     │     personalize     │
                                                     │  3. Fallback if AI  │
                                                     │     unavailable     │
                                                     │  4. Persist run     │
                                                     └──────────┬───────────┘
                                                                │
                                                        ┌───────▼────────┐
                                                        │    MongoDB     │
                                                        │  Projects,     │
                                                        │  Runs,         │
                                                        │  Feedback      │
                                                        └────────────────┘
```
 
**1. Deterministic baseline scoring** (`scoreBaselineProjects`) — every project is normalized through the taxonomy layer, then scored out of 100:
 
| Signal | Points |
|---|---|
| Difficulty match | 25 |
| Project type match | 25 |
| Category / interest overlap | up to 25 |
| Technology overlap | up to 20 |
| Skill-to-difficulty alignment | 5 |
| No meaningful domain overlap | −15 penalty |
 
Each project keeps a `scoreBreakdown` and human-readable `deterministicSignals` (e.g. *"Tech overlap: react"*) so every ranking is explainable.
 
**2. Shortlisting** (`pickBaselineWindow`) — rather than sending the whole 85-project corpus to Gemini, the top ~10 positive-scoring projects are shortlisted (topped up with best-available candidates if fewer than 10 score positively, or a shuffled sample if nothing matches at all) — keeping prompts fast, cheap, and focused.
 
**3. Gemini personalization** (`buildHybridRecommendations`) — the shortlist is sent to Gemini with the user's preferences. Gemini is only allowed to *improve* — personalized titles, briefs, custom features, milestones, portfolio angle, and a fit summary — never to invent a project outside the curated dataset. If Gemini fails, times out, or isn't configured, the deterministic scores are returned as-is (`fallbackUsed`).
 
**4. Final score** — the API blends `deterministicScore` and `geminiScore` (45/55 weighting) into a final score, always ranks Gemini-personalized results above fallback-only results, and persists the full run (preferences, recommendations, Gemini/fallback metadata) to MongoDB.
 
## 🛠️ Tech Stack
 
**Frontend:** React 18 · React Router · Framer Motion · GSAP · Tailwind CSS
**Backend:** Node.js · Express 5 · Mongoose
**Database:** MongoDB
**AI:** Google Gemini API (configurable model + fallback model)
**Auth:** HMAC-signed access tokens for the Dev Lab
 
## 📁 Project Structure
 
```
AI-project-recommender-main/
├── backend/
│   ├── server.js                    # Express entry point
│   ├── models/                      # Project, RecommendationRun, RecommendationFeedback
│   ├── routes/                      # recommend, feedback, projects, devAuth, recommendationRuns
│   ├── services/
│   │   ├── hybridRecommender.js     # Deterministic scoring + Gemini personalization
│   │   ├── recommendationRunService.js
│   │   └── taxonomy.js
│   ├── scripts/                     # seed, audit, normalize, smoke test, expand dataset
│   └── data/targetedProjects.js     # Extended curated project dataset
├── frontend/
│   └── src/
│       ├── pages/                   # Home, Questionnaire, Results, Report,
│       │                            #   ResearchInsights, EvaluationLab, DatasetAudit, DatasetEditor
│       ├── components/              # ProjectCard, ProjectModal, ScoreBreakdown,
│       │                            #   RecommendationFeedbackBar, DevLabAccessModal, ...
│       └── utils/                   # api clients, taxonomy, evaluation runner/profiles
└── .env.example
```
 
## ⚙️ Getting Started
 
### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a connection URI (e.g. MongoDB Atlas)
- A Gemini API key ([Google AI Studio](https://aistudio.google.com/))
### 1. Clone & configure environment
 
```bash
git clone https://github.com/BEZZARRANYA/AI-Project-Recommender-System.git
cd AI-Project-Recommender-System
cp .env.example .env
```
 
Fill in `.env`:
 
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/project_recommender
 
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite-preview
GEMINI_TIMEOUT_MS=35000
GEMINI_FALLBACK_MODEL=gemini-3-flash-preview
 
DEV_LAB_PASSWORD=choose_a_private_password
DEV_LAB_TOKEN_SECRET=choose_a_long_random_secret
 
REACT_APP_API_BASE_URL=http://127.0.0.1:5001
SMOKE_TEST_API_URL=http://127.0.0.1:5001
```
 
### 2. Install dependencies
 
```bash
# Backend
cd backend
npm install
 
# Frontend
cd ../frontend
npm install
```
 
### 3. Seed and build out the project dataset
 
```bash
cd backend
npm run seed              # base 15 projects
npm run expand:projects   # adds the 30-project expansion set
npm run normalize:projects -- --confirm   # clean up metadata
npm run audit:projects    # sanity-check the dataset
```
 
### 4. Run the app
 
```bash
# Terminal 1 — backend (http://127.0.0.1:5001)
cd backend
npm start
 
# Terminal 2 — frontend (http://localhost:3000)
cd frontend
npm start
```
 
Visit `http://localhost:3000` and click **Start** to try the questionnaire. Before a demo or thesis defense, run `npm run smoke` from `backend/` to confirm the core workflow (recommend → persist → feedback) is alive end-to-end.
 
> **Windows note:** if PowerShell blocks `npm.ps1`, use `npm.cmd` instead (e.g. `npm.cmd run smoke`) — this is an execution-policy issue, not a project bug.
 
## 🔌 API Reference
 
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/recommend` | Submit user preferences → returns ranked, persisted recommendations |
| `POST` | `/feedback` | Submit `helpful` / `not_relevant` / `favorite` feedback for a recommendation |
| `GET` | `/feedback/summary` | Aggregated feedback stats (optionally filtered by `runId`) |
| `GET` | `/feedback` | Raw recent feedback events |
| `GET` | `/projects` | List / audit the project dataset |
| `GET` | `/recommendation-runs` | Fetch saved recommendation runs |
| `POST` | `/dev-auth/unlock` | Exchange the Dev Lab password for a signed access token |
| `GET` | `/dev-auth/verify` | Verify a Dev Lab access token |
 
## 🧪 Backend Scripts
 
Run from `backend/`:
 
| Script | Purpose |
|---|---|
| `npm run seed` | Seed the initial project dataset |
| `npm run smoke` | Smoke-test the live API endpoints |
| `npm run cleanup:smoke` | Dry-run preview of smoke-test data to remove (add `-- --confirm` to actually delete) |
| `npm run normalize:projects` | Normalize/clean project metadata |
| `npm run expand:projects` | Add the extended dataset of targeted projects |
| `npm run audit:projects` | Audit the dataset for missing fields / weak scoring |
 
## 🔬 Research & Evaluation
 
The **Research** tab shows run-based analytics for the current session (Gemini vs. fallback split, average confidence, feedback rates). The **Dev Lab** (unlocked with `DEV_LAB_PASSWORD`) additionally provides:
- **Evaluation Lab** — replay predefined test personas against the live recommender to catch ranking regressions
- **Dataset Audit** — surface projects with missing descriptions/learning paths or weak scores
- **Dataset Editor** — inspect and edit the project catalog directly
## 🗺️ Roadmap
 
Known limitations and the planned engineering upgrade path:
 
| Current limitation | Planned upgrade |
|---|---|
| Matching relies on taxonomy + string overlap, not semantic meaning | Generate embeddings for projects/preferences and add vector search (FAISS/ChromaDB) |
| Gemini calls can be slow or fail under load | Cache recommendations by normalized preference signature; move slow calls to an async queue (BullMQ/Redis) |
| Dev Lab uses a single shared password + signed token | Replace with real user accounts and role-based auth |
| Only a backend smoke test exists | Add unit tests for scoring, integration tests for the API, and end-to-end tests (Playwright/Cypress) |
| Report export relies on browser print | Server-side PDF generation |
| No CI/CD | Enforce build, audit, smoke, and test steps automatically before deploy |
| Dataset has no indexes | Index `projectType`, `difficulty`, `technologies`, `categories`, `createdAt`, `runId` for faster search/audit |
 
## 📄 License
 
This project was built as an academic thesis demo. Add a license of your choice (MIT recommended) if you plan to open it up for reuse.

## Live Demo

Currently available as a local development build.

Deployment to Render/Vercel is planned.
 
## 🙋 Author
 
**Ranya Bezzar** — Computer Science graduate, Hubei University of Technology (HBUT)
GitHub: [@BEZZARRANYA](https://github.com/BEZZARRANYA)
 
