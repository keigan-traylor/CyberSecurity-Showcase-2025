# IAM Policy Analyzer (Simulated)

**Purpose:** Analyze AWS IAM policy JSON files for overly-permissive statements and produce remediation suggestions.

**Concepts Demonstrated:**
- Cloud security and least privilege
- Parsing and analyzing IAM JSON documents
- Generating remediation suggestions and policies

**How to run (locally, simulated):**
```bash
python analyzer.py sample_policies/policy_full_access.json
```

**What it does:** Reads JSON policy(s), detects wildcard resources or actions (e.g., `*`), flags `Action: "iam:*"` or `Resource: "*"`, and produces a report in `reports/`.
