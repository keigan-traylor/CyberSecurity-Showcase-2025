# WebApp Vulnerability Scanner (Simulated)

**Purpose:** Static analysis of HTML/JS files to identify insecure coding patterns that can lead to XSS or injection vulnerabilities. This is a safe, local tool—no active scanning of internet hosts.

**Concepts Demonstrated:**
- Input sanitization and secure coding practices
- Static code analysis heuristics for XSS/SQLi
- Producing remediation guidance for developers

**How to run:**
```bash
python scan_site.py sample_site/index.html sample_site/app.js
```
