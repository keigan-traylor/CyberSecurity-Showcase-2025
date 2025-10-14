# Anomaly ML Detector (Simulated)

**Purpose:** Demonstrate unsupervised anomaly detection on mock telemetry using `IsolationForest`. This project showcases feature engineering, model training, and inference for security analytics.

**High-level Concepts Demonstrated:**
- Data preprocessing with Pandas
- Unsupervised ML for anomaly detection (IsolationForest)
- Exporting model and flagged results for analyst review

**How to run:**
```bash
python train_detector.py mock_data/telemetry.csv
```

Output: `models/isolation_model.pkl`, `reports/anomalies.csv`
