# analyzer.py - Simulated IAM Policy Analyzer
import json
import sys
from pathlib import Path

def analyze_policy(policy):
    findings = []
    statements = policy.get('Statement', [])
    for idx, stmt in enumerate(statements):
        effect = stmt.get('Effect','')
        actions = stmt.get('Action', [])
        resources = stmt.get('Resource', [])
        if isinstance(actions, str):
            actions = [actions]
        if isinstance(resources, str):
            resources = [resources]
        # Flag overly permissive actions/resources
        for a in actions:
            if a == '*' or a.endswith(':*'):
                findings.append((idx, 'Overly permissive Action', a))
        for r in resources:
            if r == '*' or r == 'arn:aws:s3:::*':
                findings.append((idx, 'Overly permissive Resource', r))
    return findings

def main():
    if len(sys.argv) < 2:
        print('Usage: python analyzer.py <policy.json>')
        sys.exit(1)
    p = Path(sys.argv[1])
    data = json.loads(p.read_text())
    findings = analyze_policy(data)
    out = Path('reports')
    out.mkdir(exist_ok=True)
    report_file = out / (p.stem + '_report.txt')
    with report_file.open('w') as fh:
        if not findings:
            fh.write('No critical findings.\n')
            print('No critical findings. Report written to', report_file)
        else:
            fh.write('Findings:\n')
            for f in findings:
                fh.write(str(f)+'\n')
            print('Findings detected. Report written to', report_file)

if __name__ == '__main__':
    main()
