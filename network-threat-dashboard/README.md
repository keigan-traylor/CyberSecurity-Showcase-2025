# Network Threat Dashboard (Simulation)

**Purpose:** Parse mock logs, detect suspicious indicators (failed logins spikes, unusual ports), and produce a summary CSV and chart for visualization.

**High-level Concepts Demonstrated:**
- Log parsing and enrichment with Pandas
- Threat detection heuristics (failed login spikes, high request rate)
- Clear reporting for SOC/analyst review

**How to run:**
```bash
python analyze_logs.py mock_logs/logs.csv
```

Output: `reports/threat_summary.csv` and `reports/top_ips.png`
