-- ============================================================
-- DATA ANALYST MISSION OS — COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS & PROFILES
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  current_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  current_xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 500,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  sprint_mode_enabled BOOLEAN DEFAULT FALSE,
  focus_mode_enabled BOOLEAN DEFAULT FALSE,
  internship_readiness_score INTEGER DEFAULT 0,
  job_readiness_score INTEGER DEFAULT 0,
  interview_readiness_score INTEGER DEFAULT 0,
  total_time_invested_minutes INTEGER DEFAULT 0,
  study_goal_minutes_per_day INTEGER DEFAULT 60,
  target_internship_date DATE,
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Level definitions
CREATE TABLE levels (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  min_xp INTEGER NOT NULL,
  max_xp INTEGER NOT NULL,
  badge_color TEXT NOT NULL,
  description TEXT,
  unlock_message TEXT
);

INSERT INTO levels VALUES
  (1, 'beginner', 'Beginner', 0, 499, '#6B7280', 'You are just getting started.', 'Welcome to your Data Analyst journey!'),
  (2, 'sql_apprentice', 'SQL Apprentice', 500, 1499, '#3B82F6', 'You understand data querying.', 'SQL foundations unlocked!'),
  (3, 'data_explorer', 'Data Explorer', 1500, 3499, '#8B5CF6', 'You can explore and analyze datasets.', 'Python & Pandas unlocked!'),
  (4, 'business_analyst', 'Business Analyst', 3500, 6999, '#F59E0B', 'You can translate data to business insights.', 'Business Analytics unlocked!'),
  (5, 'data_analyst', 'Data Analyst', 7000, 12999, '#10B981', 'You have core Data Analyst skills.', 'Project portfolio unlocked!'),
  (6, 'internship_ready', 'Internship Ready', 13000, 22999, '#00D4FF', 'You are ready for internship interviews.', 'Internship Sprint complete!'),
  (7, 'job_ready', 'Job Ready', 23000, 999999, '#39FF14', 'You are ready for full-time positions.', 'Full-time job ready!');

-- ============================================================
-- SKILL DOMAINS & NODES
-- ============================================================

CREATE TABLE skill_domains (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INTEGER,
  phase INTEGER, -- 1=Foundation, 2=Python, 3=Analytics, 4=Portfolio, 5=Interview
  is_sprint_priority BOOLEAN DEFAULT FALSE,
  market_demand_score INTEGER DEFAULT 50 -- 0-100
);

INSERT INTO skill_domains VALUES
  ('sql', 'SQL', 'Structured Query Language for data retrieval', '🗄️', '#3B82F6', 1, 1, TRUE, 95),
  ('excel', 'Excel', 'Spreadsheet analysis and business reporting', '📊', '#10B981', 2, 1, TRUE, 85),
  ('python', 'Python', 'Programming fundamentals for data work', '🐍', '#F59E0B', 3, 2, TRUE, 90),
  ('pandas', 'Pandas', 'Python data manipulation and analysis', '🐼', '#8B5CF6', 4, 2, TRUE, 88),
  ('statistics', 'Statistics', 'Statistical thinking and analysis', '📈', '#EF4444', 5, 3, FALSE, 75),
  ('business_analytics', 'Business Analytics', 'KPIs, metrics, and business problem solving', '💼', '#F97316', 6, 3, TRUE, 82),
  ('power_bi', 'Power BI', 'Data visualization and dashboards', '⚡', '#EC4899', 7, 3, FALSE, 78),
  ('projects', 'Projects', 'Portfolio projects for hiring managers', '🚀', '#06B6D4', 8, 4, TRUE, 92),
  ('resume', 'Resume', 'Data Analyst resume optimization', '📄', '#84CC16', 9, 4, TRUE, 88),
  ('linkedin', 'LinkedIn', 'LinkedIn profile for recruiter visibility', '🔗', '#0EA5E9', 10, 4, FALSE, 70),
  ('interviews', 'Mock Interviews', 'Technical and behavioral interview practice', '🎯', '#A855F7', 11, 5, TRUE, 95),
  ('job_applications', 'Job Applications', 'Application strategy and outreach', '📮', '#F43F5E', 12, 5, FALSE, 85);

CREATE TABLE skill_nodes (
  id TEXT PRIMARY KEY,
  domain_id TEXT REFERENCES skill_domains(id),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER,
  xp_reward INTEGER DEFAULT 50,
  estimated_minutes INTEGER DEFAULT 30,
  difficulty INTEGER DEFAULT 1, -- 1-5
  career_value_score INTEGER DEFAULT 50, -- 0-100
  interview_frequency_score INTEGER DEFAULT 50, -- 0-100
  market_demand_score INTEGER DEFAULT 50, -- 0-100
  ai_automation_score INTEGER DEFAULT 50, -- how much AI can help
  prerequisites TEXT[] DEFAULT '{}', -- array of skill_node ids
  learning_content JSONB, -- structured lesson content
  exercises JSONB, -- practice exercises
  interview_questions JSONB, -- interview Q&A
  ai_leverage_guide JSONB, -- AI leverage breakdown
  is_sprint_essential BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SQL Nodes
INSERT INTO skill_nodes (id, domain_id, name, description, sort_order, xp_reward, estimated_minutes, difficulty, career_value_score, interview_frequency_score, market_demand_score, prerequisites, is_sprint_essential) VALUES
  ('sql_select', 'sql', 'SELECT Fundamentals', 'Basic data retrieval with SELECT, FROM, LIMIT', 1, 50, 25, 1, 95, 95, 95, '{}', TRUE),
  ('sql_where', 'sql', 'WHERE & Filtering', 'Filter data with WHERE, AND, OR, IN, BETWEEN, LIKE', 2, 75, 30, 1, 95, 95, 95, '{"sql_select"}', TRUE),
  ('sql_groupby', 'sql', 'GROUP BY & Aggregations', 'Aggregate data with COUNT, SUM, AVG, GROUP BY', 3, 100, 45, 2, 95, 90, 95, '{"sql_where"}', TRUE),
  ('sql_having', 'sql', 'HAVING Clause', 'Filter aggregated results with HAVING', 4, 75, 20, 2, 85, 80, 85, '{"sql_groupby"}', TRUE),
  ('sql_joins', 'sql', 'JOINs (INNER, LEFT, RIGHT)', 'Combine tables with different JOIN types', 5, 150, 60, 3, 98, 98, 98, '{"sql_having"}', TRUE),
  ('sql_case', 'sql', 'CASE Statements', 'Conditional logic in SQL queries', 6, 100, 30, 2, 88, 85, 88, '{"sql_joins"}', TRUE),
  ('sql_subqueries', 'sql', 'Subqueries', 'Nested queries and correlated subqueries', 7, 125, 45, 3, 88, 85, 85, '{"sql_case"}', TRUE),
  ('sql_cte', 'sql', 'CTEs (WITH Clause)', 'Common Table Expressions for readable queries', 8, 150, 45, 3, 90, 88, 90, '{"sql_subqueries"}', TRUE),
  ('sql_window', 'sql', 'Window Functions', 'ROW_NUMBER, RANK, LAG, LEAD, running totals', 9, 200, 60, 4, 92, 90, 92, '{"sql_cte"}', TRUE),
  ('sql_dates', 'sql', 'Date & Time Functions', 'Date manipulation, DATEDIFF, DATEPART, formatting', 10, 100, 30, 2, 85, 80, 85, '{"sql_groupby"}', FALSE),
  ('sql_string', 'sql', 'String Functions', 'UPPER, LOWER, TRIM, CONCAT, SUBSTRING', 11, 75, 25, 1, 75, 70, 75, '{"sql_where"}', FALSE),
  ('sql_project', 'sql', 'SQL Business Analysis Project', 'Complete end-to-end SQL analysis project', 12, 500, 180, 4, 98, 95, 98, '{"sql_window"}', TRUE);

-- Excel Nodes
INSERT INTO skill_nodes (id, domain_id, name, description, sort_order, xp_reward, estimated_minutes, difficulty, career_value_score, interview_frequency_score, market_demand_score, prerequisites, is_sprint_essential) VALUES
  ('excel_basics', 'excel', 'Excel Fundamentals', 'Navigation, formulas, cell references, basic functions', 1, 50, 30, 1, 80, 70, 85, '{}', TRUE),
  ('excel_vlookup', 'excel', 'VLOOKUP & XLOOKUP', 'Lookup functions for data matching', 2, 100, 30, 2, 88, 88, 88, '{"excel_basics"}', TRUE),
  ('excel_pivot', 'excel', 'Pivot Tables', 'Summarize and analyze data with pivot tables', 3, 125, 45, 2, 92, 90, 92, '{"excel_vlookup"}', TRUE),
  ('excel_charts', 'excel', 'Charts & Visualizations', 'Bar, line, pie charts; chart formatting', 4, 100, 30, 2, 85, 80, 85, '{"excel_pivot"}', TRUE),
  ('excel_if', 'excel', 'IF & Logical Functions', 'IF, IFS, SUMIF, COUNTIF, AVERAGEIF', 5, 100, 30, 2, 85, 82, 85, '{"excel_basics"}', TRUE),
  ('excel_data_cleaning', 'excel', 'Data Cleaning in Excel', 'Text-to-columns, remove duplicates, data validation', 6, 100, 30, 2, 80, 75, 80, '{"excel_if"}', FALSE),
  ('excel_advanced', 'excel', 'Advanced Excel', 'INDEX/MATCH, dynamic arrays, Power Query intro', 7, 150, 45, 3, 78, 72, 78, '{"excel_data_cleaning"}', FALSE);

-- Python Nodes
INSERT INTO skill_nodes (id, domain_id, name, description, sort_order, xp_reward, estimated_minutes, difficulty, career_value_score, interview_frequency_score, market_demand_score, prerequisites, is_sprint_essential) VALUES
  ('python_basics', 'python', 'Python Basics', 'Variables, data types, operators, print statements', 1, 75, 45, 1, 85, 75, 90, '{}', TRUE),
  ('python_control', 'python', 'Control Flow', 'if/else, for loops, while loops, list comprehensions', 2, 100, 45, 2, 85, 78, 88, '{"python_basics"}', TRUE),
  ('python_functions', 'python', 'Functions & Scope', 'Define functions, parameters, return values, lambda', 3, 100, 45, 2, 88, 80, 88, '{"python_control"}', TRUE),
  ('python_data_structures', 'python', 'Data Structures', 'Lists, dictionaries, sets, tuples', 4, 100, 45, 2, 85, 78, 85, '{"python_functions"}', TRUE),
  ('python_file_io', 'python', 'File I/O & CSV', 'Read/write CSV files, basic file operations', 5, 75, 30, 2, 80, 70, 80, '{"python_data_structures"}', FALSE);

-- Pandas Nodes
INSERT INTO skill_nodes (id, domain_id, name, description, sort_order, xp_reward, estimated_minutes, difficulty, career_value_score, interview_frequency_score, market_demand_score, prerequisites, is_sprint_essential) VALUES
  ('pandas_dataframes', 'pandas', 'DataFrames & Series', 'Create, load, inspect DataFrames; head, info, describe', 1, 100, 45, 2, 92, 88, 92, '{"python_data_structures"}', TRUE),
  ('pandas_selection', 'pandas', 'Selection & Filtering', 'loc, iloc, boolean indexing, query method', 2, 125, 45, 2, 92, 90, 92, '{"pandas_dataframes"}', TRUE),
  ('pandas_cleaning', 'pandas', 'Data Cleaning', 'Handle missing values, duplicates, dtype conversion', 3, 125, 45, 2, 92, 88, 92, '{"pandas_selection"}', TRUE),
  ('pandas_groupby', 'pandas', 'GroupBy & Aggregation', 'groupby, agg, pivot_table, value_counts', 4, 150, 45, 3, 95, 92, 95, '{"pandas_cleaning"}', TRUE),
  ('pandas_merge', 'pandas', 'Merge & Join', 'merge, concat, join DataFrames', 5, 125, 45, 3, 90, 88, 90, '{"pandas_groupby"}', TRUE),
  ('pandas_visualization', 'pandas', 'Visualization', 'matplotlib, seaborn with pandas DataFrames', 6, 100, 45, 2, 85, 80, 85, '{"pandas_merge"}', TRUE),
  ('pandas_eda', 'pandas', 'EDA Project', 'End-to-end exploratory data analysis project', 7, 400, 180, 4, 95, 90, 95, '{"pandas_visualization"}', TRUE);

-- Statistics Nodes
INSERT INTO skill_nodes (id, domain_id, name, description, sort_order, xp_reward, estimated_minutes, difficulty, career_value_score, interview_frequency_score, market_demand_score, prerequisites, is_sprint_essential) VALUES
  ('stats_descriptive', 'statistics', 'Descriptive Statistics', 'Mean, median, mode, variance, std dev, percentiles', 1, 100, 45, 2, 80, 80, 78, '{"pandas_groupby"}', TRUE),
  ('stats_distributions', 'statistics', 'Distributions', 'Normal, skewed, binomial; histograms', 2, 100, 45, 2, 75, 72, 72, '{"stats_descriptive"}', FALSE),
  ('stats_hypothesis', 'statistics', 'Hypothesis Testing', 'A/B testing, p-values, significance; business application', 3, 150, 60, 3, 85, 82, 82, '{"stats_distributions"}', TRUE),
  ('stats_correlation', 'statistics', 'Correlation & Regression', 'Correlation coefficients, linear regression intro', 4, 125, 45, 3, 80, 75, 78, '{"stats_hypothesis"}', FALSE);

-- Business Analytics Nodes
INSERT INTO skill_nodes (id, domain_id, name, description, sort_order, xp_reward, estimated_minutes, difficulty, career_value_score, interview_frequency_score, market_demand_score, prerequisites, is_sprint_essential) VALUES
  ('ba_kpis', 'business_analytics', 'KPIs & Business Metrics', 'Revenue, churn, conversion, retention, CAC, LTV', 1, 125, 45, 2, 90, 88, 88, '{"stats_descriptive"}', TRUE),
  ('ba_cases', 'business_analytics', 'Business Case Framework', 'Structure analysis, hypothesis, insight, recommendation', 2, 150, 60, 3, 92, 90, 90, '{"ba_kpis"}', TRUE),
  ('ba_sql_cases', 'business_analytics', 'SQL for Business', 'Real business queries: cohort, funnel, retention', 3, 150, 60, 3, 92, 88, 92, '{"ba_cases","sql_window"}', TRUE),
  ('ba_storytelling', 'business_analytics', 'Data Storytelling', 'Chart selection, annotation, executive summaries', 4, 125, 45, 3, 85, 80, 82, '{"ba_sql_cases"}', FALSE);

-- Power BI Nodes
INSERT INTO skill_nodes (id, domain_id, name, description, sort_order, xp_reward, estimated_minutes, difficulty, career_value_score, interview_frequency_score, market_demand_score, prerequisites, is_sprint_essential) VALUES
  ('pbi_basics', 'power_bi', 'Power BI Fundamentals', 'Interface, data import, basic visuals, publish', 1, 100, 45, 2, 80, 75, 80, '{"ba_kpis"}', TRUE),
  ('pbi_dax', 'power_bi', 'DAX Basics', 'Calculated columns, measures, CALCULATE, FILTER', 2, 150, 60, 3, 80, 75, 80, '{"pbi_basics"}', FALSE),
  ('pbi_dashboard', 'power_bi', 'Dashboard Project', 'Business dashboard with slicers, KPI cards, trends', 3, 300, 120, 3, 85, 80, 85, '{"pbi_dax"}', TRUE);

-- Portfolio Nodes
INSERT INTO skill_nodes (id, domain_id, name, description, sort_order, xp_reward, estimated_minutes, difficulty, career_value_score, interview_frequency_score, market_demand_score, prerequisites, is_sprint_essential) VALUES
  ('resume_build', 'resume', 'Resume Building', 'Data Analyst resume: format, keywords, bullet writing', 1, 200, 90, 2, 95, 90, 95, '{"sql_project","pandas_eda"}', TRUE),
  ('resume_optimize', 'resume', 'Resume Optimization', 'ATS optimization, keyword targeting, metrics', 2, 150, 45, 2, 90, 85, 90, '{"resume_build"}', TRUE),
  ('linkedin_profile', 'linkedin', 'LinkedIn Profile', 'Headline, About, Experience, Skills optimization', 1, 175, 90, 2, 85, 70, 82, '{"resume_build"}', TRUE),
  ('linkedin_outreach', 'linkedin', 'LinkedIn Outreach', 'Connect with recruiters, cold outreach templates', 2, 100, 45, 2, 80, 65, 78, '{"linkedin_profile"}', FALSE);

-- Interview Nodes
INSERT INTO skill_nodes (id, domain_id, name, description, sort_order, xp_reward, estimated_minutes, difficulty, career_value_score, interview_frequency_score, market_demand_score, prerequisites, is_sprint_essential) VALUES
  ('int_sql', 'interviews', 'SQL Interview Prep', '50 most common SQL interview questions with solutions', 1, 250, 120, 3, 98, 98, 98, '{"sql_window","ba_sql_cases"}', TRUE),
  ('int_pandas', 'interviews', 'Python/Pandas Interview Prep', 'Top Pandas interview questions and coding challenges', 2, 200, 90, 3, 92, 90, 92, '{"pandas_eda"}', TRUE),
  ('int_business', 'interviews', 'Business Case Interview', 'Framework for answering business case questions', 3, 200, 90, 3, 92, 90, 88, '{"ba_cases"}', TRUE),
  ('int_behavioral', 'interviews', 'Behavioral Interview Prep', 'STAR method, 20 most common behavioral questions', 4, 150, 60, 2, 88, 88, 88, '{"resume_build"}', TRUE),
  ('int_mock_1', 'interviews', 'Mock Interview #1', 'Full mock interview: SQL + Business Case', 5, 300, 60, 4, 98, 98, 98, '{"int_sql","int_business"}', TRUE),
  ('int_mock_2', 'interviews', 'Mock Interview #2', 'Full mock interview: Python + Behavioral', 6, 300, 60, 4, 98, 98, 98, '{"int_pandas","int_behavioral"}', TRUE);

-- ============================================================
-- USER SKILL PROGRESS
-- ============================================================

CREATE TABLE user_skill_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_node_id TEXT REFERENCES skill_nodes(id),
  status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed', 'mastered')),
  mastery_score INTEGER DEFAULT 0, -- 0-100
  attempts INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_attempted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_node_id)
);

-- ============================================================
-- MISSIONS
-- ============================================================

CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('daily', 'weekly', 'project', 'sprint', 'recovery', 'interview')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'failed', 'skipped')),
  priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
  xp_reward INTEGER DEFAULT 100,
  skill_node_ids TEXT[] DEFAULT '{}',
  tasks JSONB NOT NULL DEFAULT '[]', -- array of task objects
  success_criteria TEXT[],
  estimated_minutes INTEGER DEFAULT 45,
  actual_minutes INTEGER,
  roi_score INTEGER DEFAULT 50, -- 0-100
  career_impact TEXT,
  ai_leverage_tip TEXT,
  scheduled_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mission_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT CHECK (task_type IN ('learn', 'practice', 'exercise', 'project', 'interview', 'review')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'skipped')),
  xp_reward INTEGER DEFAULT 25,
  estimated_minutes INTEGER DEFAULT 15,
  actual_minutes INTEGER,
  content JSONB, -- lesson/exercise content
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- XP TRANSACTIONS
-- ============================================================

CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('task_complete', 'mission_complete', 'skill_unlock', 'streak_bonus', 'assessment_pass', 'project_complete', 'badge_earned', 'level_up', 'recovery_bonus')),
  reference_id TEXT, -- mission_id, task_id, skill_id etc
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ASSESSMENTS
-- ============================================================

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_node_id TEXT REFERENCES skill_nodes(id),
  title TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT CHECK (assessment_type IN ('quiz', 'coding', 'business_case', 'mock_interview', 'project_review')),
  difficulty INTEGER DEFAULT 1,
  time_limit_minutes INTEGER DEFAULT 30,
  passing_score INTEGER DEFAULT 70,
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id),
  skill_node_id TEXT,
  score INTEGER,
  max_score INTEGER,
  percentage INTEGER,
  passed BOOLEAN,
  time_taken_minutes INTEGER,
  answers JSONB DEFAULT '{}',
  feedback TEXT,
  weak_areas TEXT[],
  xp_earned INTEGER DEFAULT 0,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  project_type TEXT NOT NULL CHECK (project_type IN ('sql_analysis', 'python_eda', 'dashboard', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'review', 'completed')),
  completion_percentage INTEGER DEFAULT 0,
  skills_used TEXT[] DEFAULT '{}',
  github_url TEXT,
  demo_url TEXT,
  hiring_manager_score INTEGER, -- 0-100 simulated
  recruiter_keywords TEXT[],
  project_content JSONB DEFAULT '{}', -- stores project steps, code, notes
  feedback JSONB DEFAULT '[]',
  xp_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INTERVIEW SYSTEM
-- ============================================================

CREATE TABLE interview_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('sql', 'excel', 'python', 'pandas', 'statistics', 'business_case', 'behavioral', 'general')),
  difficulty INTEGER DEFAULT 1, -- 1-5
  question TEXT NOT NULL,
  sample_answer TEXT,
  key_points TEXT[],
  common_mistakes TEXT[],
  follow_up_questions TEXT[],
  companies TEXT[], -- companies known to ask this
  frequency_score INTEGER DEFAULT 50, -- how often asked 0-100
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_interview_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID REFERENCES interview_questions(id),
  session_id UUID,
  user_answer TEXT,
  ai_feedback TEXT,
  score INTEGER, -- 0-100
  confidence_level INTEGER, -- 1-5 self-reported
  next_review_date DATE, -- spaced repetition
  interval_days INTEGER DEFAULT 1,
  ease_factor DECIMAL DEFAULT 2.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mock_interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT CHECK (session_type IN ('sql', 'python', 'business_case', 'behavioral', 'full')),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  overall_score INTEGER,
  questions_asked INTEGER DEFAULT 0,
  questions_passed INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  ai_feedback TEXT,
  strengths TEXT[],
  improvements TEXT[],
  readiness_impact INTEGER DEFAULT 0, -- how much this changed readiness score
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================
-- ANALYTICS & TRACKING
-- ============================================================

CREATE TABLE daily_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  skills_practiced TEXT[] DEFAULT '{}',
  internship_score_delta INTEGER DEFAULT 0,
  job_score_delta INTEGER DEFAULT 0,
  streak_day INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE readiness_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  internship_readiness INTEGER DEFAULT 0,
  job_readiness INTEGER DEFAULT 0,
  interview_readiness INTEGER DEFAULT 0,
  internship_probability INTEGER DEFAULT 0,
  job_probability INTEGER DEFAULT 0,
  skills_score INTEGER DEFAULT 0,
  projects_score INTEGER DEFAULT 0,
  interview_score INTEGER DEFAULT 0,
  resume_score INTEGER DEFAULT 0,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACHIEVEMENTS & BADGES
-- ============================================================

CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  badge_color TEXT DEFAULT '#F59E0B',
  xp_reward INTEGER DEFAULT 100,
  condition_type TEXT, -- 'streak', 'skill_complete', 'xp_total', 'level_reach', 'mission_count'
  condition_value INTEGER,
  condition_data JSONB DEFAULT '{}'
);

INSERT INTO achievements VALUES
  ('first_mission', 'Mission Initiated', 'Complete your first mission', '🚀', '#3B82F6', 50, 'mission_count', 1, '{}'),
  ('sql_foundation', 'SQL Foundation', 'Complete all SQL fundamentals', '🗄️', '#3B82F6', 200, 'skill_complete', 1, '{"domain": "sql", "min_nodes": 5}'),
  ('streak_7', '7-Day Warrior', 'Maintain a 7-day streak', '🔥', '#EF4444', 150, 'streak', 7, '{}'),
  ('streak_30', '30-Day Champion', 'Maintain a 30-day streak', '🏆', '#F59E0B', 500, 'streak', 30, '{}'),
  ('first_project', 'Project Builder', 'Complete your first portfolio project', '🎯', '#10B981', 300, 'skill_complete', 1, '{"type": "project"}'),
  ('internship_ready', 'Internship Ready', 'Reach 80% internship readiness', '🎖️', '#00D4FF', 1000, 'internship_score', 80, '{}'),
  ('mock_interview_pass', 'Interview Crusher', 'Pass your first mock interview', '💪', '#8B5CF6', 250, 'mock_interview', 1, '{}'),
  ('sql_master', 'SQL Master', 'Complete all SQL nodes with 80%+ mastery', '⚡', '#00D4FF', 400, 'domain_mastery', 80, '{"domain": "sql"}'),
  ('level_5', 'Data Analyst', 'Reach Level 5', '📊', '#10B981', 500, 'level_reach', 5, '{}'),
  ('no_zero_days', 'No Zero Days', 'Study every day for 14 days straight', '💎', '#A855F7', 300, 'streak', 14, '{}');

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  xp_awarded INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- ============================================================
-- AI COACH CONVERSATIONS
-- ============================================================

CREATE TABLE coach_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT DEFAULT 'general' CHECK (session_type IN ('general', 'lesson', 'exercise', 'interview', 'project', 'career')),
  context_skill_id TEXT,
  context_mission_id UUID,
  messages JSONB DEFAULT '[]', -- array of {role, content, timestamp}
  summary TEXT,
  insights_extracted JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MARKET INTELLIGENCE
-- ============================================================

CREATE TABLE market_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_name TEXT NOT NULL,
  demand_score INTEGER DEFAULT 50,
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('rising', 'stable', 'declining')),
  job_count_estimate INTEGER,
  avg_salary_usd INTEGER,
  top_companies TEXT[],
  common_job_titles TEXT[],
  data_source TEXT DEFAULT 'synthetic',
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO market_intelligence (skill_name, demand_score, trend, job_count_estimate, avg_salary_usd, top_companies) VALUES
  ('SQL', 95, 'stable', 45000, 72000, ARRAY['Google', 'Meta', 'Amazon', 'Microsoft', 'Deloitte']),
  ('Python', 92, 'rising', 52000, 78000, ARRAY['Amazon', 'Netflix', 'Airbnb', 'Stripe', 'Uber']),
  ('Excel', 88, 'stable', 38000, 65000, ARRAY['McKinsey', 'Goldman Sachs', 'JPMorgan', 'Deloitte', 'PwC']),
  ('Power BI', 80, 'rising', 22000, 70000, ARRAY['Microsoft', 'Accenture', 'EY', 'IBM', 'Cognizant']),
  ('Pandas', 85, 'rising', 30000, 76000, ARRAY['Spotify', 'Reddit', 'DoorDash', 'Lyft', 'Instacart']),
  ('Statistics', 75, 'stable', 18000, 74000, ARRAY['Google', 'Booking.com', 'Expedia', 'Nielsen', 'IRI']),
  ('Tableau', 78, 'stable', 25000, 71000, ARRAY['Salesforce', 'Workday', 'HubSpot', 'ZoomInfo', 'Domo']),
  ('Business Analytics', 82, 'rising', 35000, 73000, ARRAY['McKinsey', 'BCG', 'Bain', 'Amazon', 'Apple']);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_progress_updated_at BEFORE UPDATE ON user_skill_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to initialize skill progress for new user
CREATE OR REPLACE FUNCTION initialize_user_skills(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  node RECORD;
BEGIN
  FOR node IN SELECT id, prerequisites FROM skill_nodes LOOP
    INSERT INTO user_skill_progress (user_id, skill_node_id, status)
    VALUES (
      p_user_id,
      node.id,
      CASE WHEN array_length(node.prerequisites, 1) IS NULL OR array_length(node.prerequisites, 1) = 0 
           THEN 'available' 
           ELSE 'locked' 
      END
    )
    ON CONFLICT (user_id, skill_node_id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate readiness scores
CREATE OR REPLACE FUNCTION calculate_readiness_scores(p_user_id UUID)
RETURNS TABLE(internship_score INTEGER, job_score INTEGER, interview_score INTEGER) AS $$
DECLARE
  v_sql_score DECIMAL := 0;
  v_excel_score DECIMAL := 0;
  v_python_score DECIMAL := 0;
  v_pandas_score DECIMAL := 0;
  v_stats_score DECIMAL := 0;
  v_ba_score DECIMAL := 0;
  v_projects_score DECIMAL := 0;
  v_resume_score DECIMAL := 0;
  v_interview_score DECIMAL := 0;
  v_internship_score INTEGER;
  v_job_score INTEGER;
  v_int_readiness INTEGER;
BEGIN
  -- Calculate domain completion scores
  SELECT COALESCE(AVG(mastery_score), 0) INTO v_sql_score
  FROM user_skill_progress usp
  JOIN skill_nodes sn ON sn.id = usp.skill_node_id
  WHERE usp.user_id = p_user_id AND sn.domain_id = 'sql' AND usp.status IN ('completed', 'mastered');

  SELECT COALESCE(AVG(mastery_score), 0) INTO v_python_score
  FROM user_skill_progress usp
  JOIN skill_nodes sn ON sn.id = usp.skill_node_id
  WHERE usp.user_id = p_user_id AND sn.domain_id IN ('python', 'pandas') AND usp.status IN ('completed', 'mastered');

  SELECT COALESCE(AVG(mastery_score), 0) INTO v_projects_score
  FROM projects WHERE user_id = p_user_id AND status = 'completed';

  SELECT COALESCE(AVG(mastery_score), 0) INTO v_interview_score
  FROM user_skill_progress usp
  JOIN skill_nodes sn ON sn.id = usp.skill_node_id
  WHERE usp.user_id = p_user_id AND sn.domain_id = 'interviews' AND usp.status IN ('completed', 'mastered');

  -- Internship score: weighted average
  v_internship_score := LEAST(100, (
    v_sql_score * 0.30 +
    v_python_score * 0.20 +
    v_projects_score * 0.25 +
    v_interview_score * 0.25
  ))::INTEGER;

  -- Job score: same but higher bar
  v_job_score := LEAST(100, (v_internship_score * 0.85))::INTEGER;

  -- Interview readiness
  v_int_readiness := LEAST(100, (
    v_sql_score * 0.40 +
    v_python_score * 0.30 +
    v_interview_score * 0.30
  ))::INTEGER;

  RETURN QUERY SELECT v_internship_score, v_job_score, v_int_readiness;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interview_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users manage own skill progress" ON user_skill_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own missions" ON missions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own mission tasks" ON mission_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own xp" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own assessments" ON user_assessment_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own interviews" ON user_interview_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own sessions" ON mock_interview_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own activity" ON daily_activity FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own snapshots" ON readiness_snapshots FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own coach" ON coach_conversations FOR ALL USING (auth.uid() = user_id);

-- Public read tables
CREATE POLICY "Public read skill_domains" ON skill_domains FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read skill_nodes" ON skill_nodes FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read levels" ON levels FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read achievements" ON achievements FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read market_intelligence" ON market_intelligence FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "Public read interview_questions" ON interview_questions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Public read assessments" ON assessments FOR SELECT TO authenticated USING (TRUE);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_user_skill_progress_user ON user_skill_progress(user_id);
CREATE INDEX idx_user_skill_progress_status ON user_skill_progress(user_id, status);
CREATE INDEX idx_missions_user_date ON missions(user_id, scheduled_date);
CREATE INDEX idx_missions_status ON missions(user_id, status);
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_daily_activity_user_date ON daily_activity(user_id, date);
CREATE INDEX idx_readiness_snapshots_user ON readiness_snapshots(user_id, snapshot_date);
CREATE INDEX idx_interview_attempts_user ON user_interview_attempts(user_id);
CREATE INDEX idx_interview_questions_category ON interview_questions(category, difficulty);
