# DATA ANALYST MISSION OS — Product Requirements Document

## Vision
Transform a complete beginner into an internship-ready and job-ready Data Analyst through a single, self-contained operating system that eliminates decision fatigue, course hopping, and tutorial addiction.

## Core Philosophy
Open Website → See Today's Mission → Complete Tasks → Gain XP → Unlock Next Milestone → Build Projects → Pass Assessments → Become Internship Ready → Become Job Ready

## Non-Negotiable Rules
1. User never decides what to learn next — the system decides
2. User never needs external resources (YouTube, courses, roadmaps)
3. Every action must move the user closer to an internship or job
4. System thinks, prioritizes, schedules, and adapts automatically
5. Maximize AI leverage while preserving interview-level competence
6. Judged by internship/job offers, not course completion
7. User's only job: Open system → Complete today's mission → Repeat

## User Personas
- **Primary**: Complete beginner (0-6 months experience) targeting first Data Analyst internship
- **Secondary**: Junior analyst targeting first full-time role
- **Constraint**: Studies only through this platform, no external resources

## Success Metrics
- Internship Readiness Score (0–100)
- Interview Readiness Score (0–100)
- Job Readiness Score (0–100)
- Days to internship-ready (target: 90 days)
- Mock interview pass rate (target: >70%)

## Core Features

### 1. Mission Dashboard
- Today's Primary Mission (highest ROI action)
- Daily/Weekly mission stack
- Readiness scores (internship, interview, job)
- Streak tracking
- XP and level display
- Estimated time to internship-ready

### 2. Mission Engine
- Generates daily missions based on current skill level
- Prioritizes by Career Value Score × Market Demand Score
- Enforces Learn → Practice → Project → Interview loop
- No new content unlocks until current milestone complete

### 3. XP & Gamification Engine
- XP earned for every completed task
- 7 levels: Beginner → SQL Apprentice → Data Explorer → Business Analyst → Data Analyst → Internship Ready → Job Ready
- Achievements and badges
- Streak system with recovery missions

### 4. Skill Tree Engine
- Visual dependency graph
- 12 skill domains: SQL, Excel, Python/Pandas, Statistics, Business Analytics, Power BI, Projects, Resume, LinkedIn, Mock Interviews, Internship Apps, Full-Time Prep
- Node states: locked, available, in-progress, completed, mastered
- Mastery scores per topic

### 5. Readiness Scoring Engine
- Internship Probability Score (0–100)
- Interview Probability Score (0–100)
- Job Offer Probability Score (0–100)
- Recalculates after every completed task
- Factors: skills, assessments, projects, resume, LinkedIn, mock interviews

### 6. Career GPS Engine
- Always surfaces highest ROI next action
- Market demand weighting
- Gap analysis against job posting requirements
- Application probability calculator

### 7. AI Coach Engine
- Powered by Claude API
- Context-aware coaching per task/lesson
- AI leverage guide per skill (what to do yourself vs delegate)
- Mock interview conductor
- Code reviewer
- Business case analyzer

### 8. Interview Engine
- SQL, Excel, Pandas, Business Case, Behavioral banks
- Spaced repetition scheduling
- Weakness detection
- Mock interview sessions with scoring
- Recovery missions for weak areas

### 9. Market Intelligence Engine
- Tracks most-demanded skills from job postings
- Adjusts mission priorities based on market data
- Classifies topics: Must Learn / Useful Later / Ignore For Now

### 10. Sprint Mode
- 80/20 filtered curriculum
- Aggressive ROI prioritization
- Daily sprint targets
- Progress vs. internship-ready benchmark

### 11. Analytics Dashboard
- Learning velocity
- Completion trends
- Skill growth radar
- Readiness trend lines
- Time invested vs. progress correlation

### 12. Project System
- SQL Business Analysis Project
- Python EDA Project
- Dashboard Project
- Completion %, skills used, hiring manager score

## Learning Path (Ordered by ROI for Internship)

### Phase 1: Foundation (Weeks 1–3) — Internship Sprint Priority
1. SQL Fundamentals (SELECT, WHERE, GROUP BY, HAVING)
2. SQL Intermediate (JOINs, CASE, Subqueries)
3. SQL Advanced (CTEs, Window Functions)
4. Excel Fundamentals (VLOOKUP, Pivot Tables, Charts)

### Phase 2: Python (Weeks 4–6)
5. Python Basics (data types, loops, functions)
6. Pandas Core (DataFrames, filtering, groupby)
7. Pandas Advanced (merge, reshape, time series)
8. Matplotlib/Seaborn basics

### Phase 3: Analytics (Weeks 7–9)
9. Statistics (descriptive, distributions, hypothesis testing)
10. Business Analytics (KPIs, metrics, business cases)
11. Power BI (dashboards, DAX basics)

### Phase 4: Portfolio (Weeks 10–12)
12. SQL Business Analysis Project
13. Python EDA Project
14. Power BI Dashboard Project
15. Resume + LinkedIn optimization

### Phase 5: Interview Readiness (Weeks 11–13)
16. SQL interview prep (50 questions)
17. Python/Pandas interview prep
18. Business case practice
19. Behavioral interview prep
20. Mock interviews + scoring

## AI Leverage Framework
For every skill, the system shows:
- ✅ Do Yourself: Core skill, must demonstrate in interview
- 🤖 Claude: Code review, explanation, alternative approaches
- 🤖 ChatGPT: Template generation, draft creation
- ❌ Never Delegate: Interview answers, business logic, final decisions

## Tech Stack
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Anthropic Claude API
- **Charts**: Recharts
- **State**: Zustand
- **Forms**: React Hook Form + Zod
