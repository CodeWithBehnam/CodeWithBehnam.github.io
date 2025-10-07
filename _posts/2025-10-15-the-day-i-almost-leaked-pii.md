---
layout: post
title: "Day 154: The Day I Almost Leaked PII (And How I Caught It Just in Time)"
date: 2025-10-15
categories: [Data Ethics, Security, Data Privacy]
tags: [data-privacy, security, pii, ethics, compliance, gdpr, data-governance]
---

**October 15, 2025 – Today's Vibe: Heart-Pounding, Cold-Sweat Terror**

There are mistakes that cost you time. There are mistakes that cost you money. And then there are mistakes that could cost you your job, your company's reputation, and potentially violate federal privacy laws. Today, I almost made that third kind of mistake. I almost sent a CSV file containing 50,000 customer records (including names, emails, phone numbers, and purchase histories) to our marketing vendor without anonymizing it first.

I caught it 30 seconds before hitting "send." Thirty. Seconds.

## The Hardship: When Routine Tasks Become Legal Nightmares

My task was straightforward: our marketing team needed a customer dataset for an email campaign. They'd requested purchase patterns by product category, which I'd done a dozen times before. I ran my SQL query, exported the results to CSV, and was about to email it to the vendor.

Then, out of paranoia (or maybe divine intervention), I opened the CSV one last time. And there it was: the `customer_email` column, sitting right next to `customer_name`. Both fields I'd explicitly been told NOT to include in external datasets per our data governance policy.

My stomach dropped. If I'd sent that file, I would've violated GDPR (we have EU customers), potentially exposed sensitive PII to a third party without consent, and absolutely gotten fired. I sat there for five minutes, hands shaking, before I could even figure out what to do next.

## The Investigation: How Did This Happen?

After calming down (and triple-checking that I hadn't already sent it), I traced back through my process. Here's what went wrong:

**Mistake 1: I Reused an Old Query Without Reviewing It**

I'd copied a SQL script from a previous project and just changed the date range. I didn't review the SELECT clause carefully. The old query had included PII because it was for an *internal* report, not an external one.

```sql
-- What I ran (WRONG)
SELECT 
    customer_id,
    customer_name,       -- PII!
    customer_email,      -- PII!
    product_category,
    purchase_count,
    total_spent
FROM customer_purchases
WHERE purchase_date >= '2025-01-01';
```

**Mistake 2: I Didn't Follow Our Data Classification Policy**

Our company has a data classification system (Public, Internal, Confidential, Restricted), and PII is always classified as Restricted. Restricted data requires explicit approval and anonymization before sharing externally. I'd ignored the workflow because I was in a hurry.

**Mistake 3: No Automated PII Detection**

We had no automated checks to catch PII before it left our systems. It was all manual review, which meant human error (mine) could slip through.

## The Lesson: Data Privacy is Not Optional

Here's what I did immediately after catching my mistake, and what I implemented to prevent it from ever happening again:

**1. Created PII-Free Views in Our Database**

I worked with our data engineering team to create SQL views that *automatically exclude* PII fields for common reporting use cases:

```sql
-- Create a safe view for external reporting
CREATE VIEW customer_purchases_external AS
SELECT 
    -- Use hashed/anonymized IDs instead of real customer info
    MD5(customer_id) as customer_hash,
    product_category,
    purchase_count,
    total_spent,
    purchase_date,
    region,
    customer_segment
FROM customer_purchases;
```

Now, when I (or anyone else) needs data for external use, we query the safe view by default:

```sql
-- Safe query for external partners
SELECT * FROM customer_purchases_external
WHERE purchase_date >= '2025-01-01';
```

No PII, no risk.

**2. Built a PII Detection Script**

I wrote a Python script that scans CSVs for potential PII before they're shared:

```python
import pandas as pd
import re

# Common PII patterns
PII_PATTERNS = {
    'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
    'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
    'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
    'credit_card': r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b'
}

# Suspicious column names
PII_COLUMN_NAMES = [
    'email', 'phone', 'ssn', 'social_security',
    'name', 'first_name', 'last_name', 'address',
    'credit_card', 'password', 'dob', 'birth_date'
]

def scan_for_pii(file_path):
    """
    Scan a CSV file for potential PII.
    Returns True if PII detected, False otherwise.
    """
    df = pd.read_csv(file_path)
    
    # Check column names
    suspicious_columns = [col for col in df.columns 
                         if any(pii in col.lower() for pii in PII_COLUMN_NAMES)]
    
    if suspicious_columns:
        print(f"⚠️  WARNING: Suspicious column names detected: {suspicious_columns}")
        return True
    
    # Check for PII patterns in data
    for col in df.columns:
        sample = df[col].astype(str).head(100)  # Check first 100 rows
        
        for pii_type, pattern in PII_PATTERNS.items():
            matches = sample.str.contains(pattern, regex=True, na=False).sum()
            if matches > 0:
                print(f"⚠️  WARNING: Potential {pii_type} detected in column '{col}'")
                return True
    
    print("✓ No obvious PII detected")
    return False

# Usage
if scan_for_pii('customer_data.csv'):
    print("❌ DO NOT SEND THIS FILE. Review and anonymize first.")
else:
    print("✓ File appears safe to share")
```

Now I run this script before exporting any dataset.

**3. Implemented a Data Request Workflow**

I convinced our team to implement a formal data request process:

1. Requester fills out a form specifying:
   - What data they need
   - Who will receive it (internal/external)
   - Business justification
2. Data analyst (me) reviews and determines data classification
3. If Restricted data is needed, legal/compliance approves
4. Data is anonymized/aggregated before export
5. Export is logged in an audit trail

No more ad-hoc exports based on a Slack message.

**4. Added Pre-Export Checklists**

I created a checklist that I *must* complete before sending any data externally:

```markdown
## External Data Export Checklist

- [ ] Is this data classified as Public or Internal only?
- [ ] Have I removed all PII fields (name, email, phone, address)?
- [ ] Have I aggregated data to prevent re-identification?
- [ ] Have I run the PII detection script?
- [ ] Have I gotten approval from data governance if needed?
- [ ] Have I documented this export in our audit log?
- [ ] Am I using secure file transfer (not plain email)?

If ANY checkbox is unchecked, DO NOT SEND.
```

I printed this out and taped it to my monitor.

**5. Set Up Automated DLP (Data Loss Prevention) Rules**

I worked with IT to configure our email system to flag outgoing emails with attachments containing potential PII:

- Scan attachments for suspicious column names
- Flag emails going to external domains
- Require manager approval for flagged emails

This adds a safety net beyond my own vigilance.

## Mistakes I Vow Not to Repeat

1. **Reusing queries without careful review**. Every query should be treated as new, especially when the context changes.
2. **Skipping the data governance workflow because I was in a hurry**. Privacy compliance is not optional, no matter the deadline.
3. **Assuming I'd catch mistakes manually**. Humans are fallible. Automation is essential.
4. **Not documenting data exports**. We now log every external data share for audit purposes.

## Your Automation Toolkit: PII Protection Workflow

Here's my comprehensive workflow for handling potentially sensitive data:

**1. PII Anonymization Functions**

```python
import hashlib
import pandas as pd
from faker import Faker

fake = Faker()

def anonymize_email(email):
    """Hash email addresses"""
    return hashlib.sha256(email.encode()).hexdigest()[:16]

def anonymize_name(name):
    """Replace real names with fake ones (deterministic)"""
    # Use hash as seed so same name always gets same fake name
    seed = int(hashlib.md5(name.encode()).hexdigest(), 16) % (10 ** 8)
    Faker.seed(seed)
    return fake.name()

def anonymize_dataframe(df, pii_columns):
    """
    Anonymize specified columns in a DataFrame.
    
    Args:
        df: pandas DataFrame
        pii_columns: dict mapping column names to anonymization function
    
    Returns:
        Anonymized DataFrame
    """
    df_anon = df.copy()
    
    for col, anon_func in pii_columns.items():
        if col in df_anon.columns:
            df_anon[col] = df_anon[col].apply(anon_func)
    
    return df_anon

# Usage
df = pd.read_csv('customer_data.csv')

df_safe = anonymize_dataframe(df, {
    'email': anonymize_email,
    'name': anonymize_name
})

# Or better yet, just drop PII columns entirely
df_safe = df.drop(columns=['email', 'name', 'phone', 'address'])

df_safe.to_csv('customer_data_anonymized.csv', index=False)
```

**2. Git Pre-Commit Hook to Block PII**

```bash
#!/bin/bash
# .git/hooks/pre-commit
# Prevents committing files with potential PII

echo "Scanning staged files for PII..."

# Check for suspicious column names in CSV files
for file in $(git diff --cached --name-only | grep -E '\.csv$'); do
    if head -1 "$file" | grep -iE 'email|phone|ssn|credit_card|password'; then
        echo "❌ ERROR: Potential PII detected in $file"
        echo "Please remove PII columns before committing."
        exit 1
    fi
done

echo "✓ No obvious PII detected in staged files"
exit 0
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

**3. Automated Weekly PII Audit**

```python
# pii_audit.py
import os
import pandas as pd
from datetime import datetime

def audit_directory_for_pii(directory):
    """
    Scan a directory for CSV files and check for PII.
    Log results to audit file.
    """
    results = []
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.csv'):
                file_path = os.path.join(root, file)
                has_pii = scan_for_pii(file_path)  # Use function from earlier
                
                results.append({
                    'file': file_path,
                    'has_pii': has_pii,
                    'scan_date': datetime.now()
                })
    
    # Save audit results
    audit_df = pd.DataFrame(results)
    audit_df.to_csv('pii_audit_log.csv', mode='a', header=False, index=False)
    
    # Email results to data governance team
    pii_files = audit_df[audit_df['has_pii'] == True]
    if len(pii_files) > 0:
        print(f"⚠️  Found {len(pii_files)} files with potential PII:")
        print(pii_files['file'].tolist())

# Run weekly via cron
# 0 9 * * MON python pii_audit.py
```

**4. Secure File Sharing**

Never email sensitive files. Use secure alternatives:

```python
# Example: Upload to secure S3 bucket with expiring links
import boto3
from datetime import timedelta

def share_file_securely(file_path, recipient_email):
    """
    Upload file to S3 and generate expiring pre-signed URL.
    """
    s3 = boto3.client('s3')
    bucket = 'secure-data-sharing'
    
    # Upload file
    s3.upload_file(file_path, bucket, file_path)
    
    # Generate pre-signed URL (expires in 24 hours)
    url = s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': bucket, 'Key': file_path},
        ExpiresIn=86400  # 24 hours
    )
    
    # Email the secure link (not the actual file)
    send_email(
        to=recipient_email,
        subject='Secure Data Access',
        body=f'Your data is available here (expires in 24h): {url}'
    )
    
    print(f"✓ Secure link sent to {recipient_email}")

# Usage
share_file_securely('customer_data_anonymized.csv', 'vendor@example.com')
```

**5. Data Retention Policy Automation**

```python
# auto_delete_old_exports.py
import os
from datetime import datetime, timedelta

def cleanup_old_exports(directory, days_to_keep=30):
    """
    Automatically delete exported files older than X days.
    """
    cutoff_date = datetime.now() - timedelta(days=days_to_keep)
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
            
            if file_mtime < cutoff_date:
                os.remove(file_path)
                print(f"Deleted old export: {file_path}")

# Run daily via cron
# 0 2 * * * python auto_delete_old_exports.py
```

## The Takeaway

Today was a wake-up call. I've been doing data analysis for years, and I got complacent. I treated data exports like a routine task, when they should be treated with the same care as handling live explosives.

Data privacy isn't just about following rules. It's about respecting the trust that customers place in us when they share their information. One careless mistake could expose thousands of people to identity theft, harassment, or worse.

The scariest part? This almost happened to me, and I consider myself careful. If it can happen to me, it can happen to anyone. That's why automation, checklists, and formal processes aren't optional. They're the only thing standing between us and disaster.

**Have you ever had a close call with data privacy? Drop it in the comments!** (Anonymously, of course.) Let's learn from each other's near-misses so we can prevent actual disasters.

---

## Series Wrap-Up: Reflections from the Data Trenches

This has been one hell of a week. Six days, six hard lessons, and more coffee than any human should consume. But here's what I've learned:

Data analysis isn't just about writing clever SQL queries or building beautiful dashboards. It's about:
- **Performance**: Because your time (and your company's compute budget) matter
- **Quality**: Because wrong numbers lead to wrong decisions
- **Communication**: Because code doesn't exist in a vacuum
- **Ethics**: Because data represents real people who deserve respect

Every mistake I made this week was avoidable. But I only know that now, in hindsight. The real skill isn't never making mistakes. It's building systems that catch mistakes before they become disasters.

If you're a junior analyst reading this, know that you're not alone. We all struggle with the same issues: messy data, impossible deadlines, tools that don't cooperate, and the constant fear of screwing up something important.

But we're in this together. We learn, we build better workflows, we automate the parts that humans are bad at, and slowly, we get better.

Thanks for following along on this week's journey. Same time next week? I'm sure I'll have plenty more disasters to share.

Until then, may your data be clean, your joins be efficient, and your PII detection scripts be ever-vigilant.

**Keep pushing, keep learning, and never stop questioning your assumptions.**

---

*If this series helped you, consider sharing it with a fellow analyst who might need it. And seriously, what's your best automation hack? I'm always looking to level up.*
