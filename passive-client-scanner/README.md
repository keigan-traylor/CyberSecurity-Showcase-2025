# Passive Client-Side Scanner (Safe & Read-Only)

## Overview
This folder contains a **safe, passive client-side vulnerability pattern scanner** implemented in JavaScript. The scanner performs **read-only** analysis of HTML/JS content or the browser DOM to surface patterns commonly associated with client-side vulnerabilities (e.g., XSS vectors like `innerHTML`, inline `<script>`, `eval`, inline event handlers, and `javascript:` URIs).

**Important:** This tool is intentionally non-invasive. It **does not** inject payloads, modify the DOM, or perform network requests. It is suitable for public GitHub repositories and educational/demo purposes.

## Files
- `passive-client-scanner.js` — main analyzer module (Node.js compatible and browser-friendly)
- `README.md` — this file
- `sample_inputs/sample_page.html` — safe sample HTML for local testing
- `sample_inputs/sample_script.js` — safe sample JS for local testing

## Usage (Browser - DOM inspection)
1. Open a **safe, authorized** test page (e.g., a local HTML file served via `http-server` or a dev server).
2. Open Developer Tools → Console.
3. Paste the contents of `passive-client-scanner.js` (or include it as a dev-only script).
4. Run:
   ```javascript
   // Inspect current page DOM (read-only)
   const report = PassiveClientScanner.scanDom();
   console.log(JSON.stringify(report, null, 2));
   ```

## Usage (Node.js - analyze file strings)
```bash
# Example Node.js one-liner to analyze an HTML file
node -e "const fs=require('fs'); const scanner=require('./passive-client-scanner'); const html=fs.readFileSync('sample_inputs/sample_page.html','utf8'); console.log(scanner.scanHtmlString(html));"
```

## Interpretation of findings
Each finding object has:
- `type` — the detector name (e.g., `innerHTMLUsage`, `InlineScript_DOM`)
- `severity` — `INFO`, `WARNING`, or `HIGH`
- `excerpt` — a short excerpt showing the context
- `explanation` — guidance on why it may be risky

Use these reports for developer education, code review, or CI pre-commit checks. For active testing of websites you own, follow authorized testing procedures and responsible disclosure. For pentesting or active scanning, use established tools and obtain explicit permission.

## How to add to your GitHub repo
1. Create a folder in your repo, e.g. `webapp-vuln-scanner/passive/`
2. Copy `passive-client-scanner.js` and `README.md` into that folder.
3. Add sample inputs in `sample_inputs/` (optional).
4. Commit and push using GitHub Desktop or the web uploader:
   - GitHub Desktop: File → Add Local Repository → select the repo folder → Commit changes → Publish
   - Web uploader: Repo → Add file → Upload files → drag & drop files → Commit changes
5. Add a short note in the top-level README linking to this folder.

## Extending this tool (safe ideas)
- Integrate as a lightweight **pre-commit** static checker for HTML/JS using Node scripts.
- Convert detectors into ESLint rules for CI-based checks.
- Add richer parsing using an HTML parser (e.g., `jsdom`) instead of regex heuristics.

## License
MIT
