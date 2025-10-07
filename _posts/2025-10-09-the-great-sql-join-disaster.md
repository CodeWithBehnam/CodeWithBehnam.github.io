---
layout: post
title: "Day 148: The Great SQL JOIN Disaster (Or: Why I Got 10x More Rows Than Expected)"
date: 2025-10-09
categories: [Data Analysis, SQL, Database]
tags: [sql, joins, data-quality, debugging, database]
---

**October 9, 2025 – Today's Vibe: Existential Dread in Database Form**

Have you ever confidently written a SQL query, executed it, and then watched in horror as your result set exploded from 50,000 expected rows to 547,000 actual rows? No? Just me? Well, buckle up, because today I learned the hard way that SQL joins have zero chill when your data isn't as clean as you think.

## The Hardship: When One Order Becomes Many

My task seemed straightforward: join our `orders` table with our `customers` table to analyze purchasing patterns by customer segment. I wrote what I thought was a textbook INNER JOIN:

```sql
SELECT 
    o.order_id,
    o.order_date,
    c.customer_name,
    c.segment,
    o.total_amount
FROM orders o
INNER JOIN customers c ON o.customer_email = c.email
WHERE o.order_date >= '2025-01-01';
```

I ran it, expecting about 50K orders. I got 547K rows. My heart sank. Did we suddenly have 10x more orders? (Spoiler: we did not.) My manager was waiting for this report, and I was sitting there with a dataset that made absolutely no sense.

## The Investigation: Down the Rabbit Hole at 11 PM

After three cups of coffee and a mild panic attack, I started debugging. First, I checked for duplicates in the base tables:

```sql
-- Check for duplicate emails in customers table
SELECT email, COUNT(*) as count
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;
```

Bingo. We had 147 customers with duplicate email addresses. Turns out, our CRM system had been creating new customer records instead of updating existing ones when people changed their names or addresses. Each duplicate email in the `customers` table caused the join to create a Cartesian product of sorts, multiplying my rows.

But wait, there's more! I also discovered duplicate `order_id` values in the `orders` table because of a failed ETL job that had re-imported the same batch twice last week. So I was getting duplicates *on both sides* of my join. It was a data quality nightmare sandwich, and I was taking big bites.

## The Lesson: Trust No One (Especially Not Your Data)

Here's what I should've done *before* writing any joins:

**1. Always Profile Your Tables First**
```sql
-- Check table row counts
SELECT 'orders' as table_name, COUNT(*) as row_count FROM orders
UNION ALL
SELECT 'customers', COUNT(*) FROM customers;

-- Check for duplicates on join keys
SELECT 
    customer_email,
    COUNT(*) as order_count,
    COUNT(DISTINCT order_id) as unique_orders
FROM orders
GROUP BY customer_email
HAVING COUNT(*) != COUNT(DISTINCT order_id);
```

**2. Use CTEs to Clean Before Joining**
I rewrote my query with Common Table Expressions to deduplicate first:

```sql
WITH clean_orders AS (
    SELECT DISTINCT 
        order_id,
        customer_email,
        order_date,
        total_amount
    FROM orders
    WHERE order_date >= '2025-01-01'
),
clean_customers AS (
    SELECT DISTINCT ON (email)
        email,
        customer_name,
        segment
    FROM customers
    ORDER BY email, last_updated DESC  -- Keep most recent record
)
SELECT 
    o.order_id,
    o.order_date,
    c.customer_name,
    c.segment,
    o.total_amount
FROM clean_orders o
INNER JOIN clean_customers c ON o.customer_email = c.email;
```

Result? Exactly 49,847 rows. *Chef's kiss.*

## Mistakes I Vow Not to Repeat

1. **Assuming clean data in production databases**. I've learned that data quality issues are the rule, not the exception.
2. **Not validating row counts before and after joins**. Now I always check: `expected_rows ≈ actual_rows`.
3. **Skipping exploratory queries**. Five minutes of profiling saves hours of debugging.
4. **Not documenting data quality issues**. I immediately filed tickets for the CRM duplicate problem and the ETL failure, so future analysts won't hit the same landmine.

## Your Automation Toolkit: JOIN Safety Checklist

Here's my new pre-join ritual that I'm templating for all future queries:

**1. Sanity Check Script**
```sql
-- Save this as check_join_integrity.sql
-- Before joining orders <> customers

-- Step 1: Check for duplicate keys
SELECT 'Duplicate customer emails' as issue, COUNT(*) as count
FROM (
    SELECT email FROM customers GROUP BY email HAVING COUNT(*) > 1
) duplicates

UNION ALL

SELECT 'Duplicate order IDs', COUNT(*)
FROM (
    SELECT order_id FROM orders GROUP BY order_id HAVING COUNT(*) > 1
) duplicates;

-- Step 2: Preview join size
SELECT 
    (SELECT COUNT(*) FROM orders) * 
    (SELECT AVG(cnt) FROM (SELECT COUNT(*) as cnt FROM customers GROUP BY email) t)
    as estimated_join_rows;
```

**2. Create a Data Quality Alert**
I set up a weekly cron job to email me if duplicates appear:

```bash
# Add to crontab -e
0 9 * * MON psql -d production -f /path/to/check_join_integrity.sql | mail -s "Weekly Data Quality Report" me@company.com
```

**3. Use EXPLAIN to Catch Expensive Joins Early**
```sql
EXPLAIN ANALYZE
SELECT ... FROM orders o INNER JOIN customers c ON ...;
```

If you see "Nested Loop" with millions of rows, something's wrong.

## The Takeaway

Today I learned that joins are only as good as the data you're joining. The SQL syntax is easy; the data integrity is hard. I spent more time debugging data quality than actually analyzing data, which is, sadly, the reality of this job. But hey, at least now I have a checklist that'll save me from future 11 PM debugging sessions.

**What's your most memorable JOIN disaster? Drop it in the comments!** Misery loves company, and I'd love to hear I'm not alone in this struggle.

---

*Tomorrow's entry: "When Tableau Lied to Me (And How I Caught It)." Spoiler: It wasn't Tableau's fault.*
