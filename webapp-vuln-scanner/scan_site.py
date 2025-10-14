# scan_site.py - Static vulnerability heuristics scanner
import sys
from pathlib import Path
import re

def scan_html(path):
    text = Path(path).read_text()
    findings = []
    if '<script>' in text and 'src=' not in text:
        findings.append(('InlineScript','Inline <script> found'))
    if re.search(r'innerHTML', text):
        findings.append(('DOMAssign','innerHTML usage detected'))
    return findings

def scan_js(path):
    text = Path(path).read_text()
    findings = []
    if re.search(r'eval\(', text):
        findings.append(('EvalUse','eval() usage'))
    if re.search(r'(SELECT .* FROM|INSERT INTO)', text, re.IGNORECASE):
        findings.append(('SQLInJs','SQL-like string found in JS'))
    return findings

def main():
    if len(sys.argv)<2:
        print('Usage: python scan_site.py <html> [<js> ...]')
        sys.exit(1)
    results = []
    for p in sys.argv[1:]:
        pth = Path(p)
        if pth.suffix=='.html':
            results += [(p,)+f for f in scan_html(pth)]
        elif pth.suffix=='.js':
            results += [(p,)+f for f in scan_js(pth)]
    out = Path('reports'); out.mkdir(exist_ok=True)
    with (out / 'vuln_report.txt').open('w') as fh:
        if not results:
            fh.write('No issues found.\n')
        else:
            for r in results:
                fh.write(str(r)+'\n')
    print('Scan complete. Report at reports/vuln_report.txt')

if __name__ == '__main__':
    main()
