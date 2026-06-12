-- ============================================================
-- SEED: Interview Questions
-- ============================================================

INSERT INTO interview_questions (category, difficulty, question, sample_answer, key_points, frequency_score) VALUES

-- SQL Questions
('sql', 1, 'What is the difference between WHERE and HAVING?',
'WHERE filters rows before aggregation, HAVING filters after. WHERE is used with individual rows, HAVING is used with grouped results.',
ARRAY['WHERE runs before GROUP BY', 'HAVING runs after GROUP BY', 'HAVING can use aggregate functions like COUNT, SUM', 'WHERE cannot reference aggregate functions'],
95),

('sql', 2, 'Explain the different types of JOINs.',
'INNER JOIN returns matching rows from both tables. LEFT JOIN returns all rows from left table + matches from right. RIGHT JOIN is opposite. FULL OUTER JOIN returns all rows from both tables.',
ARRAY['INNER JOIN = intersection', 'LEFT JOIN = all left + matching right', 'NULL handling for non-matching rows', 'Use case for each type'],
98),

('sql', 2, 'What is a window function? Give an example.',
'Window functions perform calculations across a set of rows related to the current row without collapsing the result set. Example: ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) assigns a rank within each department.',
ARRAY['Does not collapse rows (unlike GROUP BY)', 'OVER clause defines the window', 'PARTITION BY divides into groups', 'ORDER BY orders within partition', 'Common functions: ROW_NUMBER, RANK, LAG, LEAD, SUM'],
88),

('sql', 3, 'Write a query to find the second highest salary.',
'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees); OR use: SELECT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1; OR use DENSE_RANK() window function.',
ARRAY['Multiple valid approaches', 'Subquery approach', 'Window function approach', 'Handle ties with DENSE_RANK'],
90),

('sql', 2, 'What is a CTE and when would you use it?',
'A CTE (Common Table Expression) is a temporary named result set defined with WITH. Use it to: improve readability of complex queries, create recursive queries, avoid repeating subqueries, organize multi-step transformations.',
ARRAY['Defined with WITH keyword', 'Improves readability', 'Scope is only the following query', 'Can be recursive', 'Alternative to subqueries'],
85),

('sql', 3, 'How would you find duplicate records in a table?',
'SELECT column1, column2, COUNT(*) as cnt FROM table GROUP BY column1, column2 HAVING COUNT(*) > 1;',
ARRAY['Use GROUP BY on identifying columns', 'HAVING COUNT(*) > 1 finds duplicates', 'Specify which columns define uniqueness', 'Follow up: how to delete duplicates'],
82),

('sql', 2, 'What is the difference between UNION and UNION ALL?',
'UNION removes duplicate rows and sorts the result (slower). UNION ALL keeps all rows including duplicates (faster). Both require same number of columns with compatible data types.',
ARRAY['UNION = distinct rows only', 'UNION ALL = includes duplicates', 'UNION ALL is faster (no dedup step)', 'Same column count and compatible types required'],
80),

-- Python/Pandas Questions
('pandas', 2, 'How do you handle missing values in Pandas?',
'Check: df.isnull().sum(). Drop: df.dropna(). Fill: df.fillna(value) or df.fillna(df.mean()). For forward/backward fill: df.fillna(method="ffill"). Choice depends on context and % of missing data.',
ARRAY['Always check extent first with isnull().sum()', 'dropna() vs fillna() tradeoffs', 'Domain knowledge determines best approach', 'Document your choice'],
92),

('pandas', 2, 'What is the difference between loc and iloc?',
'loc uses label-based indexing (row/column names). iloc uses integer position-based indexing (0, 1, 2...). loc is inclusive of both endpoints in slices; iloc end is exclusive.',
ARRAY['loc = labels', 'iloc = integer positions', 'Slice behavior differs', 'Boolean indexing works with loc'],
90),

('pandas', 3, 'How do you perform a groupby and aggregate in Pandas?',
'df.groupby("category").agg({"sales": "sum", "quantity": "mean", "date": "count"}). Can use agg() with dict for multiple functions, or apply custom functions.',
ARRAY['groupby creates GroupBy object', 'agg() applies functions', 'Can use multiple functions per column', 'reset_index() to flatten result'],
88),

('pandas', 3, 'How do you merge two DataFrames?',
'pd.merge(df1, df2, on="key", how="inner"). how options: inner, left, right, outer. Can merge on multiple keys: on=["key1","key2"]. left_on/right_on for different column names.',
ARRAY['pd.merge() vs df.join()', 'how parameter mirrors SQL JOINs', 'Validate merges with validate parameter', 'Check for duplicates post-merge'],
85),

-- Business Case Questions
('business_case', 3, 'Metrics for an e-commerce company are declining. How do you investigate?',
'1) Clarify: Which metrics? What time period? What changed recently? 2) Segment: By channel, geography, product category, device, customer type 3) Funnel analysis: Traffic → Add to cart → Checkout → Purchase 4) Hypothesis: Seasonality? Competitor? Product issue? Marketing change? 5) Data: Pull SQL queries to validate each hypothesis 6) Recommendation: Data-driven action',
ARRAY['Ask clarifying questions first', 'Segment before concluding', 'Funnel decomposition', 'Hypothesis-driven approach', 'End with recommendation'],
92),

('business_case', 2, 'How would you measure the success of a new feature launch?',
'Define success metrics upfront: Primary (DAU, conversion, revenue), Secondary (session time, retention), Guardrail (error rate, support tickets). Use A/B test if possible. Track: before/after comparison, user segments, time series. Report: impact on north star metric.',
ARRAY['Define metrics before launch', 'Primary vs guardrail metrics', 'A/B test vs pre/post analysis', 'Segment by user type', 'Statistical significance'],
88),

-- Behavioral Questions
('behavioral', 1, 'Tell me about a time you had to work with messy or incomplete data.',
'Use STAR: Situation (what data, what project), Task (what needed to be done), Action (how you cleaned/handled it - document assumptions, fill strategies, flagged issues), Result (outcome and what you learned).',
ARRAY['STAR framework', 'Show systematic approach', 'Document assumptions', 'Communicate limitations to stakeholders', 'Quantify impact if possible'],
95),

('behavioral', 1, 'Why do you want to be a Data Analyst?',
'Connect your genuine interest in: problem-solving with data, business impact, storytelling with numbers. Mention specific skills you enjoy (SQL, Python). Avoid: "I like math" or "good job market".',
ARRAY['Show genuine interest', 'Connect to specific skills', 'Business impact focus', 'Personal story helps', 'Research the company'],
90),

('behavioral', 2, 'Describe a time you had to explain complex data findings to a non-technical audience.',
'STAR: Project context, stakeholder level (exec, manager, ops), how you simplified (visuals, analogies, focused on business impact not technical details), outcome (decision made, action taken).',
ARRAY['Tailor communication to audience', 'Lead with business impact', 'Use visuals', 'Avoid jargon', 'Check for understanding'],
88),

('behavioral', 2, 'Tell me about a mistake you made in a data analysis.',
'Show self-awareness: describe specific error (wrong join, incorrect metric definition, sampling bias), how you caught it (own review, peer review, stakeholder question), how you fixed it, what you changed to prevent recurrence.',
ARRAY['Be honest and specific', 'Show you caught it and fixed it', 'What you changed afterwards', 'Focus on learning', 'Do not blame others'],
85);
