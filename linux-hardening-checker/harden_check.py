# harden_check.py - Read-only hardening suggestions
import sys
from pathlib import Path

def check_sysctl(path):
    text = Path(path).read_text()
    findings = []
    # simple checks
    if 'net.ipv4.ip_forward = 1' in text:
        findings.append(('ip_forward','Disable IP forwarding unless required'))
    if 'net.ipv4.conf.all.rp_filter' not in text:
        findings.append(('rp_filter','Enable rp_filter to harden against spoofing'))
    return findings

def check_sshd(path):
    text = Path(path).read_text()
    findings = []
    if 'PermitRootLogin yes' in text:
        findings.append(('root_login','Disable PermitRootLogin'))
    if 'PasswordAuthentication yes' in text:
        findings.append(('password_auth','Disable PasswordAuthentication in favor of keys'))
    return findings

def main():
    if len(sys.argv)<3:
        print('Usage: python harden_check.py <sysctl.conf> <sshd_config>')
        sys.exit(1)
    s = Path(sys.argv[1]); ssh = Path(sys.argv[2])
    findings = check_sysctl(s) + check_sshd(ssh)
    out = Path('reports'); out.mkdir(exist_ok=True)
    with (out/'hardening_report.txt').open('w') as fh:
        if not findings:
            fh.write('No recommendations - config looks good.\n')
        else:
            for f in findings:
                fh.write(str(f)+'\n')
    print('Hardening report written to reports/hardening_report.txt')

if __name__ == '__main__':
    main()
