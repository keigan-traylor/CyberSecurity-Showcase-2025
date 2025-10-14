# analyze_logs.py - Mock log analyzer
import pandas as pd
import sys
from pathlib import Path
import matplotlib.pyplot as plt

def load_logs(path):
    df = pd.read_csv(path, parse_dates=['timestamp'])
    return df

def detect_suspicious_ips(df):
    # simple heuristics: failed_login > 5 in 10 min window, high requests
    df['minute'] = df['timestamp'].dt.floor('T')
    failures = df[df['event']=='failed_login'].groupby(['source_ip']).size().reset_index(name='fail_count')
    top_failures = failures[failures['fail_count']>5]
    agg = df.groupby('source_ip').agg({'event':'count'}).rename(columns={'event':'count'}).sort_values('count',ascending=False)
    return top_failures, agg.head(10)

def plot_top_ips(agg, out_path):
    ax = agg.head(10).plot(kind='bar', legend=False)
    ax.set_ylabel('Event Count')
    fig = ax.get_figure()
    fig.tight_layout()
    fig.savefig(out_path)

def main():
    if len(sys.argv)<2:
        print('Usage: python analyze_logs.py mock_logs/logs.csv')
        sys.exit(1)
    p = Path(sys.argv[1])
    df = load_logs(p)
    top_failures, top_ips = detect_suspicious_ips(df)
    out = Path('reports'); out.mkdir(exist_ok=True)
    (out / 'threat_summary.csv').write_text(top_ips.to_csv())
    plot_top_ips(top_ips, out/'top_ips.png')
    print('Reports generated in reports/')

if __name__ == '__main__':
    main()
