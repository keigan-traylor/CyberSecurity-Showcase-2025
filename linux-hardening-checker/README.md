# Linux System Hardening Checker (Simulated)

**Purpose:** Analyze configuration files and suggest CIS-aligned hardening recommendations. This tool is read-only and safe to run locally against the provided sample configuration files.

**High-level Concepts Demonstrated:**
- Secure baseline configuration analysis
- Automated remediation suggestions and documentation for engineers
- System hardening principles without making changes

**How to run:**
```bash
python harden_check.py sample_configs/sysctl.conf sample_configs/sshd_config
```
