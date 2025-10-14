# train_detector.py - Train IsolationForest on mock telemetry
import sys
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

def main():
    if len(sys.argv)<2:
        print('Usage: python train_detector.py mock_data/telemetry.csv')
        sys.exit(1)
    p = Path(sys.argv[1])
    df = pd.read_csv(p)
    features = ['cpu', 'mem', 'net_in', 'net_out']
    X = df[features].fillna(0)
    model = IsolationForest(contamination=0.02, random_state=42)
    model.fit(X)
    preds = model.predict(X)
    df['anomaly'] = preds == -1
    out = Path('reports'); out.mkdir(exist_ok=True)
    out_model = Path('models'); out_model.mkdir(exist_ok=True)
    joblib.dump(model, out_model/'isolation_model.pkl')
    df[df['anomaly']].to_csv(out/'anomalies.csv', index=False)
    print('Model saved to models/isolation_model.pkl and anomalies written to reports/anomalies.csv')

if __name__ == '__main__':
    main()
