// src/lib/data/sql-lessons.ts
// V1 lesson content for the SQL learning path (Phase 1).
// Nodes without an entry fall back to self-study mode in the lesson player.

export interface LessonExercise {
  id: string
  prompt: string
  hint?: string
  solution: string
}

export interface LessonExample {
  title: string
  code: string
  explanation: string
}

export interface Lesson {
  theory: string
  key_concepts: string[]
  examples: LessonExample[]
  exercises: LessonExercise[]
  summary: string
}

export const LESSONS: Record<string, Lesson> = {
  // ----------------------------------------------------------
  sql_select: {
    theory: `SELECT is how you ask a database for data. Every analysis you will ever do starts here.

The anatomy: SELECT picks columns, FROM picks the table, LIMIT caps how many rows come back. Column order in SELECT controls output order. Use * to grab everything — fine for exploring, sloppy in production queries because it pulls data you do not need.

Interviewers use SELECT questions to check if you write clean, intentional queries. Always SELECT only the columns the question asks for.`,
    key_concepts: [
      'SELECT column1, column2 picks specific columns',
      'SELECT * returns all columns (exploration only)',
      'FROM table_name identifies the source table',
      'LIMIT n caps the result to n rows',
      'AS renames columns in output (aliasing)',
      'DISTINCT removes duplicate rows',
    ],
    examples: [
      {
        title: 'Pick specific columns',
        code: `SELECT customer_id, order_date, total_amount\nFROM orders\nLIMIT 10;`,
        explanation: 'Returns 3 columns for the first 10 rows. LIMIT keeps exploration fast on big tables.',
      },
      {
        title: 'Alias for readable output',
        code: `SELECT\n  customer_id AS customer,\n  total_amount AS revenue\nFROM orders;`,
        explanation: 'AS renames columns in the result. Reports and dashboards depend on clear column names.',
      },
      {
        title: 'Unique values with DISTINCT',
        code: `SELECT DISTINCT country\nFROM customers;`,
        explanation: 'Returns each country once. Classic first step when profiling a new dataset.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: 'Write a query that returns the product_name and price columns from a table called products, limited to 5 rows.',
        hint: 'SELECT columns FROM table LIMIT n',
        solution: `SELECT product_name, price\nFROM products\nLIMIT 5;`,
      },
      {
        id: 'ex2',
        prompt: 'Return every unique city from a customers table, with the column renamed to customer_city.',
        hint: 'Combine DISTINCT with AS',
        solution: `SELECT DISTINCT city AS customer_city\nFROM customers;`,
      },
    ],
    summary: 'SELECT chooses columns, FROM chooses the table, LIMIT caps rows, AS renames, DISTINCT dedupes. Select only what you need.',
  },

  // ----------------------------------------------------------
  sql_where: {
    theory: `WHERE filters rows before anything else happens. If SELECT decides which columns you see, WHERE decides which rows.

Conditions can use comparison operators (=, <>, >, <, >=, <=), logical combinations (AND, OR, NOT), set membership (IN), ranges (BETWEEN), pattern matching (LIKE with % and _), and NULL checks (IS NULL / IS NOT NULL — never = NULL).

The #1 beginner trap: NULL comparisons. NULL = NULL is not true in SQL. Always use IS NULL. The #2 trap: mixing AND/OR without parentheses — be explicit.`,
    key_concepts: [
      'WHERE filters individual rows before aggregation',
      'AND requires all conditions; OR requires any',
      'IN (a, b, c) replaces chains of OR',
      'BETWEEN x AND y is inclusive on both ends',
      "LIKE 'A%' matches strings starting with A; _ matches one char",
      'IS NULL / IS NOT NULL — never use = NULL',
    ],
    examples: [
      {
        title: 'Multiple conditions',
        code: `SELECT *\nFROM orders\nWHERE total_amount > 100\n  AND status = 'completed'\n  AND order_date >= '2024-01-01';`,
        explanation: 'All three conditions must be true. Dates compare naturally with >= and <= in ISO format.',
      },
      {
        title: 'IN and BETWEEN',
        code: `SELECT *\nFROM customers\nWHERE country IN ('US', 'CA', 'MX')\n  AND age BETWEEN 25 AND 40;`,
        explanation: 'IN is cleaner than country = US OR country = CA OR... BETWEEN includes both 25 and 40.',
      },
      {
        title: 'Pattern matching and NULLs',
        code: `SELECT *\nFROM customers\nWHERE email LIKE '%@gmail.com'\n  AND phone IS NOT NULL;`,
        explanation: '% matches any sequence of characters. IS NOT NULL excludes rows with missing phone numbers.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: 'From an orders table, return rows where total_amount is between 50 and 200 AND status is either pending or shipped.',
        hint: 'Combine BETWEEN with IN',
        solution: `SELECT *\nFROM orders\nWHERE total_amount BETWEEN 50 AND 200\n  AND status IN ('pending', 'shipped');`,
      },
      {
        id: 'ex2',
        prompt: 'Find all customers whose name starts with the letter J and whose email is missing.',
        hint: "LIKE 'J%' and IS NULL",
        solution: `SELECT *\nFROM customers\nWHERE name LIKE 'J%'\n  AND email IS NULL;`,
      },
    ],
    summary: 'WHERE filters rows. Master the operators, always use IS NULL for missing data, and parenthesize mixed AND/OR logic.',
  },

  // ----------------------------------------------------------
  sql_groupby: {
    theory: `GROUP BY collapses rows into groups and lets aggregate functions summarize each group. This is the core of business analysis: revenue per region, orders per customer, signups per month.

The mental model: GROUP BY column buckets rows by that column's value; COUNT/SUM/AVG/MIN/MAX then compute one number per bucket.

The iron rule interviewers check: every column in SELECT must either be in the GROUP BY or wrapped in an aggregate. Violating this is the most common SQL mistake on the planet.`,
    key_concepts: [
      'GROUP BY buckets rows by column value(s)',
      'COUNT(*) counts rows; COUNT(col) counts non-NULL values',
      'SUM, AVG, MIN, MAX aggregate numeric columns per group',
      'Every SELECT column must be grouped or aggregated',
      'Group by multiple columns for finer breakdowns',
      'ORDER BY on the aggregate to rank groups',
    ],
    examples: [
      {
        title: 'Revenue per category',
        code: `SELECT\n  category,\n  COUNT(*) AS order_count,\n  SUM(total_amount) AS revenue\nFROM orders\nGROUP BY category\nORDER BY revenue DESC;`,
        explanation: 'One row per category with its order count and total revenue, biggest revenue first.',
      },
      {
        title: 'Two-level grouping',
        code: `SELECT\n  country,\n  status,\n  COUNT(*) AS orders\nFROM orders\nGROUP BY country, status;`,
        explanation: 'One row per (country, status) combination — a pivot-table style breakdown.',
      },
      {
        title: 'Average per customer',
        code: `SELECT\n  customer_id,\n  AVG(total_amount) AS avg_order_value\nFROM orders\nGROUP BY customer_id;`,
        explanation: 'AOV (average order value) per customer — a metric you will compute constantly as a DA.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: 'For a sales table with columns region and amount, return each region with its total sales and number of sales, ordered by total sales descending.',
        hint: 'SUM and COUNT(*) with GROUP BY region',
        solution: `SELECT\n  region,\n  SUM(amount) AS total_sales,\n  COUNT(*) AS sale_count\nFROM sales\nGROUP BY region\nORDER BY total_sales DESC;`,
      },
      {
        id: 'ex2',
        prompt: 'From an orders table, show the average order amount per month using a column called order_month.',
        hint: 'GROUP BY order_month, AVG(amount)',
        solution: `SELECT\n  order_month,\n  AVG(amount) AS avg_order_amount\nFROM orders\nGROUP BY order_month\nORDER BY order_month;`,
      },
    ],
    summary: 'GROUP BY + aggregates turn raw rows into business metrics. Grouped or aggregated — every SELECT column, no exceptions.',
  },

  // ----------------------------------------------------------
  sql_having: {
    theory: `HAVING filters groups after aggregation, the way WHERE filters rows before it. "Show me customers with more than 5 orders" is impossible with WHERE alone, because the count does not exist until after grouping.

Execution order to memorize: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. This order explains everything: WHERE cannot see aggregates (they do not exist yet), HAVING can.

"What is the difference between WHERE and HAVING" is a top-5 interview question. Now you can answer it from first principles.`,
    key_concepts: [
      'HAVING filters after GROUP BY; WHERE filters before',
      'HAVING can reference aggregates: HAVING COUNT(*) > 5',
      'WHERE cannot use aggregate functions',
      'Use both: WHERE to pre-filter rows, HAVING to filter groups',
      'Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY',
    ],
    examples: [
      {
        title: 'Filter groups by count',
        code: `SELECT\n  customer_id,\n  COUNT(*) AS order_count\nFROM orders\nGROUP BY customer_id\nHAVING COUNT(*) >= 5;`,
        explanation: 'Only customers with 5+ orders survive. WHERE could never do this — the count is born in GROUP BY.',
      },
      {
        title: 'WHERE and HAVING together',
        code: `SELECT\n  category,\n  SUM(total_amount) AS revenue\nFROM orders\nWHERE order_date >= '2024-01-01'\nGROUP BY category\nHAVING SUM(total_amount) > 10000;`,
        explanation: 'WHERE trims to 2024 rows first; HAVING then keeps only categories with >10k revenue.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: 'Return product categories whose average price exceeds 50, from a products table with category and price columns.',
        hint: 'GROUP BY category HAVING AVG(price) > 50',
        solution: `SELECT\n  category,\n  AVG(price) AS avg_price\nFROM products\nGROUP BY category\nHAVING AVG(price) > 50;`,
      },
      {
        id: 'ex2',
        prompt: 'Find regions with more than 100 completed orders. Filter status = completed efficiently.',
        hint: 'Status filter belongs in WHERE, count filter in HAVING',
        solution: `SELECT\n  region,\n  COUNT(*) AS completed_orders\nFROM orders\nWHERE status = 'completed'\nGROUP BY region\nHAVING COUNT(*) > 100;`,
      },
    ],
    summary: 'WHERE filters rows, HAVING filters groups. Pre-filter with WHERE when possible — it is faster and cleaner.',
  },

  // ----------------------------------------------------------
  sql_joins: {
    theory: `JOINs combine tables. Real data is split across tables (customers here, orders there) and almost every real business question requires stitching them together. This is the single most tested SQL topic in Data Analyst interviews.

INNER JOIN keeps only rows that match in both tables. LEFT JOIN keeps every row from the left table and fills NULLs where the right table has no match. RIGHT JOIN is the mirror. FULL OUTER JOIN keeps everything from both sides.

The interview classic: "find customers who never ordered" = LEFT JOIN orders, then WHERE orders.id IS NULL. Burn that pattern into memory.`,
    key_concepts: [
      'INNER JOIN: only matching rows from both tables',
      'LEFT JOIN: all left rows + matches (NULL where no match)',
      'ON defines the match condition (usually keys)',
      'Table aliases (customers c) keep queries readable',
      'LEFT JOIN ... WHERE right.id IS NULL finds non-matches',
      'Joining one-to-many duplicates the "one" side rows',
    ],
    examples: [
      {
        title: 'INNER JOIN basics',
        code: `SELECT\n  c.name,\n  o.order_date,\n  o.total_amount\nFROM customers c\nINNER JOIN orders o\n  ON c.customer_id = o.customer_id;`,
        explanation: 'One row per order, enriched with the customer name. Customers with zero orders vanish.',
      },
      {
        title: 'LEFT JOIN keeps everyone',
        code: `SELECT\n  c.name,\n  COUNT(o.order_id) AS order_count\nFROM customers c\nLEFT JOIN orders o\n  ON c.customer_id = o.customer_id\nGROUP BY c.name;`,
        explanation: 'Every customer appears; zero-order customers show order_count = 0 because COUNT skips NULLs.',
      },
      {
        title: 'The anti-join pattern',
        code: `SELECT c.*\nFROM customers c\nLEFT JOIN orders o\n  ON c.customer_id = o.customer_id\nWHERE o.order_id IS NULL;`,
        explanation: 'Customers with NO orders. The NULL from the failed match is the signal. Top-3 interview question.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: 'Join an orders table to a products table on product_id and return order_id, product_name, and quantity.',
        hint: 'INNER JOIN ... ON o.product_id = p.product_id',
        solution: `SELECT\n  o.order_id,\n  p.product_name,\n  o.quantity\nFROM orders o\nINNER JOIN products p\n  ON o.product_id = p.product_id;`,
      },
      {
        id: 'ex2',
        prompt: 'Find all products that have never been ordered (products table, order_items table with product_id).',
        hint: 'LEFT JOIN + IS NULL anti-join pattern',
        solution: `SELECT p.*\nFROM products p\nLEFT JOIN order_items oi\n  ON p.product_id = oi.product_id\nWHERE oi.product_id IS NULL;`,
      },
      {
        id: 'ex3',
        prompt: 'Return each customer name with their total spend, including customers who spent nothing (show 0).',
        hint: 'LEFT JOIN + COALESCE(SUM(...), 0)',
        solution: `SELECT\n  c.name,\n  COALESCE(SUM(o.total_amount), 0) AS total_spend\nFROM customers c\nLEFT JOIN orders o\n  ON c.customer_id = o.customer_id\nGROUP BY c.name;`,
      },
    ],
    summary: 'INNER keeps matches, LEFT keeps everything on the left. The LEFT JOIN + IS NULL anti-join answers "who never did X".',
  },

  // ----------------------------------------------------------
  sql_case: {
    theory: `CASE adds if/else logic inside queries. It is how analysts create categories, buckets, and flags directly in SQL: "label orders over $100 as high-value", "bucket ages into ranges", "flag churned customers".

CASE evaluates conditions top-down and returns the first match. Always include ELSE — without it, non-matching rows get NULL and quietly poison downstream aggregates.

Power move interviewers love: CASE inside an aggregate. SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) computes conditional totals without separate queries — a pivot in a single pass.`,
    key_concepts: [
      'CASE WHEN cond THEN val ... ELSE val END',
      'Conditions evaluate top-down; first match wins',
      'Always include ELSE to avoid silent NULLs',
      'CASE inside SUM/COUNT = conditional aggregation',
      'Use CASE in SELECT for labels, in ORDER BY for custom sorts',
    ],
    examples: [
      {
        title: 'Bucketing values',
        code: `SELECT\n  order_id,\n  total_amount,\n  CASE\n    WHEN total_amount >= 200 THEN 'high'\n    WHEN total_amount >= 50 THEN 'medium'\n    ELSE 'low'\n  END AS order_tier\nFROM orders;`,
        explanation: 'Each order gets a tier label. Order of WHENs matters — 250 hits the first true branch.',
      },
      {
        title: 'Conditional aggregation (pivot)',
        code: `SELECT\n  region,\n  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,\n  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled\nFROM orders\nGROUP BY region;`,
        explanation: 'Counts two statuses side by side per region in one scan. The classic SQL pivot pattern.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: "Add a column price_band to a products query: 'budget' under 20, 'standard' 20-99.99, 'premium' 100+.",
        hint: 'Order the WHEN branches carefully',
        solution: `SELECT\n  product_name,\n  price,\n  CASE\n    WHEN price >= 100 THEN 'premium'\n    WHEN price >= 20 THEN 'standard'\n    ELSE 'budget'\n  END AS price_band\nFROM products;`,
      },
      {
        id: 'ex2',
        prompt: 'For each customer, compute completed_revenue and refunded_revenue from an orders table in one query.',
        hint: 'Two SUM(CASE ...) expressions grouped by customer',
        solution: `SELECT\n  customer_id,\n  SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) AS completed_revenue,\n  SUM(CASE WHEN status = 'refunded' THEN total_amount ELSE 0 END) AS refunded_revenue\nFROM orders\nGROUP BY customer_id;`,
      },
    ],
    summary: 'CASE is in-query branching. Bucket with CASE in SELECT, pivot with CASE inside aggregates, and always write ELSE.',
  },

  // ----------------------------------------------------------
  sql_subqueries: {
    theory: `A subquery is a query nested inside another. Three placements matter: in WHERE (filter against a computed value or list), in FROM (treat a result set as a table, called a derived table), and in SELECT (a scalar lookup per row — use sparingly).

The bread-and-butter pattern: WHERE amount > (SELECT AVG(amount) FROM orders) — comparing rows to an aggregate of the whole table.

Correlated subqueries reference the outer query and re-run per row. They read elegantly but can be slow; interviewers may ask you to rewrite one as a JOIN, so practice both directions.`,
    key_concepts: [
      'Subquery in WHERE: compare against computed value or IN-list',
      'Subquery in FROM: derived table (must be aliased)',
      'Scalar subquery in SELECT: one value per row',
      'Correlated subquery references the outer query (runs per row)',
      'Most subqueries can be rewritten as JOINs — know both',
    ],
    examples: [
      {
        title: 'Compare to an aggregate',
        code: `SELECT *\nFROM orders\nWHERE total_amount > (\n  SELECT AVG(total_amount) FROM orders\n);`,
        explanation: 'Inner query computes one number (the average); outer query keeps rows above it.',
      },
      {
        title: 'IN with a subquery',
        code: `SELECT *\nFROM customers\nWHERE customer_id IN (\n  SELECT customer_id\n  FROM orders\n  WHERE total_amount > 500\n);`,
        explanation: 'Customers who placed at least one big order. The subquery produces the qualifying ID list.',
      },
      {
        title: 'Derived table in FROM',
        code: `SELECT\n  AVG(order_count) AS avg_orders_per_customer\nFROM (\n  SELECT customer_id, COUNT(*) AS order_count\n  FROM orders\n  GROUP BY customer_id\n) AS per_customer;`,
        explanation: 'Two-step logic: first count per customer, then average the counts. The alias is mandatory.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: 'Return all products priced above the average product price.',
        hint: 'Scalar subquery in WHERE',
        solution: `SELECT *\nFROM products\nWHERE price > (\n  SELECT AVG(price) FROM products\n);`,
      },
      {
        id: 'ex2',
        prompt: 'Find customers who have NOT placed any order in 2024, using a subquery (not a JOIN).',
        hint: 'NOT IN with a subquery of 2024 customer_ids',
        solution: `SELECT *\nFROM customers\nWHERE customer_id NOT IN (\n  SELECT customer_id\n  FROM orders\n  WHERE order_date >= '2024-01-01'\n    AND customer_id IS NOT NULL\n);`,
      },
    ],
    summary: 'Subqueries nest logic: WHERE for comparisons, FROM for multi-step pipelines. Know the JOIN equivalent of each.',
  },

  // ----------------------------------------------------------
  sql_cte: {
    theory: `CTEs (Common Table Expressions) are named subqueries declared with WITH at the top of a query. They turn nested spaghetti into readable, top-to-bottom steps — which is exactly how analysts think: step 1 compute X, step 2 use X.

Chain multiple CTEs with commas; later CTEs can reference earlier ones. This is how 90% of real analytical SQL is written at companies.

In interviews, reaching for a CTE instead of a triple-nested subquery signals seniority. Same logic, readable structure.`,
    key_concepts: [
      'WITH name AS (SELECT ...) defines a CTE',
      'Reference the CTE like a table in the main query',
      'Chain CTEs: WITH a AS (...), b AS (SELECT ... FROM a)',
      'CTEs exist only for the duration of one query',
      'Prefer CTEs over nested subqueries for readability',
    ],
    examples: [
      {
        title: 'Single CTE',
        code: `WITH customer_totals AS (\n  SELECT customer_id, SUM(total_amount) AS total_spend\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT *\nFROM customer_totals\nWHERE total_spend > 1000;`,
        explanation: 'Step 1 named and isolated; step 2 filters it. Identical result to a derived table, far more readable.',
      },
      {
        title: 'Chained CTEs',
        code: `WITH monthly AS (\n  SELECT order_month, SUM(total_amount) AS revenue\n  FROM orders\n  GROUP BY order_month\n),\nwith_avg AS (\n  SELECT *, AVG(revenue) OVER () AS avg_revenue\n  FROM monthly\n)\nSELECT order_month, revenue\nFROM with_avg\nWHERE revenue > avg_revenue;`,
        explanation: 'Months beating the average monthly revenue. Each CTE is one clean transformation step.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: 'Using a CTE, compute order counts per customer, then return only customers with more than 3 orders.',
        hint: 'WITH counts AS (...) SELECT ... WHERE',
        solution: `WITH counts AS (\n  SELECT customer_id, COUNT(*) AS order_count\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT *\nFROM counts\nWHERE order_count > 3;`,
      },
      {
        id: 'ex2',
        prompt: 'With two chained CTEs: (1) revenue per category, (2) only categories above 5000, then select all from the second.',
        hint: 'Second CTE selects FROM the first',
        solution: `WITH category_revenue AS (\n  SELECT category, SUM(total_amount) AS revenue\n  FROM orders\n  GROUP BY category\n),\nbig_categories AS (\n  SELECT *\n  FROM category_revenue\n  WHERE revenue > 5000\n)\nSELECT *\nFROM big_categories;`,
      },
    ],
    summary: 'CTEs = named steps with WITH. Chain them for multi-stage analysis. Readable SQL is hireable SQL.',
  },

  // ----------------------------------------------------------
  sql_window: {
    theory: `Window functions compute across related rows WITHOUT collapsing them — every row survives, gaining context like its rank, the previous row's value, or a running total. This is the dividing line between basic and advanced SQL, and the #1 differentiator in DA interviews.

Anatomy: function() OVER (PARTITION BY group_col ORDER BY sort_col). PARTITION BY restarts the calculation per group; ORDER BY defines sequence within it.

The must-know functions: ROW_NUMBER (unique sequence), RANK / DENSE_RANK (ties handled differently), LAG / LEAD (previous/next row), and SUM(...) OVER (...) for running totals. "Top N per group" — ROW_NUMBER in a CTE, then filter — is the most asked advanced SQL interview question.`,
    key_concepts: [
      'OVER() turns an aggregate into a window function',
      'PARTITION BY restarts the window per group',
      'ORDER BY inside OVER defines row sequence',
      'ROW_NUMBER vs RANK vs DENSE_RANK: tie behavior',
      'LAG(col) / LEAD(col) access neighboring rows',
      'Running totals: SUM(col) OVER (ORDER BY date)',
      'Top-N per group: ROW_NUMBER in CTE, filter rn <= N',
    ],
    examples: [
      {
        title: 'Rank within groups',
        code: `SELECT\n  category,\n  product_name,\n  price,\n  ROW_NUMBER() OVER (\n    PARTITION BY category\n    ORDER BY price DESC\n  ) AS price_rank\nFROM products;`,
        explanation: 'Every product gets its price rank inside its own category. No rows lost — unlike GROUP BY.',
      },
      {
        title: 'Top 3 per group (the interview classic)',
        code: `WITH ranked AS (\n  SELECT\n    category,\n    product_name,\n    price,\n    ROW_NUMBER() OVER (\n      PARTITION BY category ORDER BY price DESC\n    ) AS rn\n  FROM products\n)\nSELECT category, product_name, price\nFROM ranked\nWHERE rn <= 3;`,
        explanation: 'Window functions cannot live in WHERE directly, so rank in a CTE, filter outside. Memorize this shape.',
      },
      {
        title: 'Month-over-month change with LAG',
        code: `SELECT\n  order_month,\n  revenue,\n  revenue - LAG(revenue) OVER (ORDER BY order_month) AS mom_change\nFROM monthly_revenue;`,
        explanation: 'LAG pulls last month onto this row, making growth math a simple subtraction.',
      },
      {
        title: 'Running total',
        code: `SELECT\n  order_date,\n  total_amount,\n  SUM(total_amount) OVER (\n    ORDER BY order_date\n  ) AS running_revenue\nFROM orders;`,
        explanation: 'Cumulative revenue to date on every row — the backbone of pacing dashboards.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: 'For an employees table (department, name, salary), rank employees by salary within each department, highest first.',
        hint: 'ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC)',
        solution: `SELECT\n  department,\n  name,\n  salary,\n  ROW_NUMBER() OVER (\n    PARTITION BY department\n    ORDER BY salary DESC\n  ) AS salary_rank\nFROM employees;`,
      },
      {
        id: 'ex2',
        prompt: 'Return the top 2 highest-paid employees per department.',
        hint: 'Rank in a CTE, then WHERE rn <= 2',
        solution: `WITH ranked AS (\n  SELECT\n    department,\n    name,\n    salary,\n    ROW_NUMBER() OVER (\n      PARTITION BY department ORDER BY salary DESC\n    ) AS rn\n  FROM employees\n)\nSELECT department, name, salary\nFROM ranked\nWHERE rn <= 2;`,
      },
      {
        id: 'ex3',
        prompt: 'For a daily_sales table (sale_date, amount), show each day with the previous day amount and the day-over-day difference.',
        hint: 'LAG(amount) OVER (ORDER BY sale_date)',
        solution: `SELECT\n  sale_date,\n  amount,\n  LAG(amount) OVER (ORDER BY sale_date) AS prev_day,\n  amount - LAG(amount) OVER (ORDER BY sale_date) AS dod_change\nFROM daily_sales;`,
      },
    ],
    summary: 'Window functions add context without collapsing rows. Own ROW_NUMBER-in-a-CTE for top-N, LAG for change-over-time, SUM OVER for running totals.',
  },

  // ----------------------------------------------------------
  sql_dates: {
    theory: `Date functions slice time — and nearly every business metric is time-based: monthly revenue, weekly signups, days-to-conversion.

Core operations: extract parts (year/month/day), truncate to a period (DATE_TRUNC for monthly grouping), and difference between dates. Exact function names vary by database (Postgres shown here); the patterns transfer.

The pattern to own: GROUP BY DATE_TRUNC('month', date_col) — it powers almost every trend chart you will ever build.`,
    key_concepts: [
      "DATE_TRUNC('month', col) — collapse to period start (Postgres)",
      "EXTRACT(YEAR FROM col) — pull a date part",
      'date_a - date_b — interval/days between dates',
      'CURRENT_DATE / NOW() — today and right now',
      'Group by truncated dates for time-series metrics',
    ],
    examples: [
      {
        title: 'Monthly revenue trend',
        code: `SELECT\n  DATE_TRUNC('month', order_date) AS month,\n  SUM(total_amount) AS revenue\nFROM orders\nGROUP BY 1\nORDER BY 1;`,
        explanation: 'The canonical trend query. GROUP BY 1 references the first SELECT column.',
      },
      {
        title: 'Days since last order',
        code: `SELECT\n  customer_id,\n  CURRENT_DATE - MAX(order_date) AS days_since_last_order\nFROM orders\nGROUP BY customer_id;`,
        explanation: 'Recency per customer — the R in RFM analysis and a core churn signal.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: 'Count signups per month from a users table with a created_at column.',
        hint: "DATE_TRUNC('month', created_at)",
        solution: `SELECT\n  DATE_TRUNC('month', created_at) AS signup_month,\n  COUNT(*) AS signups\nFROM users\nGROUP BY 1\nORDER BY 1;`,
      },
    ],
    summary: 'Truncate to group by period, extract for parts, subtract for durations. Time-series grouping is daily DA work.',
  },

  // ----------------------------------------------------------
  sql_string: {
    theory: `String functions clean and reshape text — and raw business data is always messy text: inconsistent casing, stray whitespace, combined fields needing splitting.

The everyday kit: UPPER/LOWER normalize casing, TRIM strips whitespace, CONCAT (or ||) glues strings, SUBSTRING extracts pieces, and REPLACE swaps content. LOWER(TRIM(col)) before comparing or grouping text prevents 'NYC ' and 'nyc' counting as different values.`,
    key_concepts: [
      'UPPER / LOWER — normalize case before comparing',
      'TRIM — remove leading/trailing whitespace',
      "CONCAT(a, b) or a || b — combine strings",
      'SUBSTRING(col FROM x FOR y) — extract a slice',
      "REPLACE(col, 'old', 'new') — substitute text",
    ],
    examples: [
      {
        title: 'Normalize before grouping',
        code: `SELECT\n  LOWER(TRIM(city)) AS city_clean,\n  COUNT(*) AS customers\nFROM customers\nGROUP BY 1;`,
        explanation: "Without cleaning, ' NYC', 'nyc' and 'NYC' fragment into three groups and wreck your counts.",
      },
      {
        title: 'Build a display field',
        code: `SELECT\n  CONCAT(first_name, ' ', last_name) AS full_name\nFROM customers;`,
        explanation: 'Combining columns for reports — one of the most common cosmetic transforms.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: 'Return emails lowercased and trimmed from a users table, aliased as email_clean.',
        hint: 'LOWER(TRIM(email))',
        solution: `SELECT LOWER(TRIM(email)) AS email_clean\nFROM users;`,
      },
    ],
    summary: 'Normalize text (LOWER + TRIM) before grouping or joining on it. Dirty strings silently corrupt metrics.',
  },

  // ----------------------------------------------------------
  sql_project: {
    theory: `Capstone time: a full SQL business analysis you can put in your portfolio and defend in interviews.

The scenario: you are the analyst for an e-commerce company. Leadership wants a revenue and customer health review. You will design a small schema, load sample data, and answer real business questions using every skill from this path: filtering, aggregation, joins, CASE, CTEs, and window functions.

Deliverable: a single .sql file with commented sections per question, plus 5 written insights ("Revenue is concentrated: top 10% of customers drive X% of revenue..."). Hiring managers care more about your insight narration than your syntax.`,
    key_concepts: [
      'Set up: customers, products, orders, order_items tables',
      'Q1 Revenue: monthly trend + MoM growth (DATE_TRUNC + LAG)',
      'Q2 Customers: top 10 by lifetime spend (JOIN + GROUP BY)',
      'Q3 Segmentation: spend tiers with CASE',
      'Q4 Products: top 3 sellers per category (window + CTE)',
      'Q5 Retention: customers with orders in consecutive months',
      'Write 5 plain-English insights from your results',
    ],
    examples: [
      {
        title: 'Project question template',
        code: `-- Q2: Top 10 customers by lifetime value\nWITH customer_ltv AS (\n  SELECT\n    c.customer_id,\n    c.name,\n    SUM(o.total_amount) AS lifetime_value,\n    COUNT(o.order_id) AS order_count\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.customer_id\n  GROUP BY c.customer_id, c.name\n)\nSELECT *,\n  ROUND(lifetime_value / order_count, 2) AS avg_order_value\nFROM customer_ltv\nORDER BY lifetime_value DESC\nLIMIT 10;`,
        explanation: 'Every project answer should look like this: a commented question, a CTE-structured query, business-named columns.',
      },
    ],
    exercises: [
      {
        id: 'ex1',
        prompt: 'Write the query for Q4: top 3 best-selling products (by quantity) per category, using order_items joined to products.',
        hint: 'JOIN, SUM(quantity), then ROW_NUMBER per category in a CTE',
        solution: `WITH product_sales AS (\n  SELECT\n    p.category,\n    p.product_name,\n    SUM(oi.quantity) AS units_sold\n  FROM order_items oi\n  JOIN products p ON p.product_id = oi.product_id\n  GROUP BY p.category, p.product_name\n),\nranked AS (\n  SELECT *,\n    ROW_NUMBER() OVER (\n      PARTITION BY category ORDER BY units_sold DESC\n    ) AS rn\n  FROM product_sales\n)\nSELECT category, product_name, units_sold\nFROM ranked\nWHERE rn <= 3;`,
      },
      {
        id: 'ex2',
        prompt: 'Write Q3: segment customers into VIP (1000+), Regular (200-999), Casual (<200) by total spend, and count customers per segment.',
        hint: 'CTE for spend, CASE for segments, GROUP BY the segment',
        solution: `WITH spend AS (\n  SELECT customer_id, SUM(total_amount) AS total_spend\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT\n  CASE\n    WHEN total_spend >= 1000 THEN 'VIP'\n    WHEN total_spend >= 200 THEN 'Regular'\n    ELSE 'Casual'\n  END AS segment,\n  COUNT(*) AS customers,\n  SUM(total_spend) AS segment_revenue\nFROM spend\nGROUP BY 1\nORDER BY segment_revenue DESC;`,
      },
    ],
    summary: 'A portfolio SQL project = real questions, CTE-structured queries, and written insights. Finish this and you have interview ammunition.',
  },
}

export function getLessonForNode(nodeId: string): Lesson | null {
  return LESSONS[nodeId] ?? null
}
