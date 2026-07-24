# 🛡️ AI-Powered Log Analytics Platform

> Intelligent cybersecurity log analytics platform for real-time anomaly detection, graph-based threat correlation, concept drift adaptation, and explainable AI.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![Apache Spark](https://img.shields.io/badge/Apache-Spark-orange)
![Google Cloud](https://img.shields.io/badge/Google-Cloud-blue)
![License](https://img.shields.io/badge/License-MIT-success)

---

# 📖 Overview

Modern organizations generate millions of log events every day from servers, applications, cloud infrastructure, and security devices. Traditional monitoring systems often struggle to identify sophisticated cyber threats in real time.

The **AI-Powered Log Analytics Platform** is a scalable Security Operations Center (SOC) solution that combines distributed big data processing with deep learning and explainable AI to analyze large-scale log streams. The platform supports anomaly detection, graph-based threat correlation, online concept drift detection, and interactive visual analytics through a modern web dashboard.

---

# 🎯 Objectives

- Detect anomalies from real-time log streams
- Process large-scale logs using distributed computing
- Correlate security events across multiple log sources
- Detect concept drift and trigger adaptive model updates
- Explain AI predictions using SHAP
- Provide interactive dashboards for SOC analysts
- Enable scalable cloud deployment using GCP Dataproc

---

# 🚀 Features

- Real-Time Log Streaming
- AI-Based Anomaly Detection
- LSTM & Transformer Models
- Graph-Based Event Correlation (GNN)
- Online Concept Drift Detection (ADWIN)
- Explainable AI with SHAP
- Interactive React Dashboard
- FastAPI REST & WebSocket APIs
- Google Cloud Dataproc Integration
- Distributed Processing with Spark & HDFS

---

# 🏗️ System Architecture

```
System Logs
      │
      ▼
Google Cloud Storage
      │
      ▼
Apache Spark + Dataproc
      │
      ▼
Feature Engineering
      │
      ▼
────────────────────────────
AI Models
────────────────────────────

• LSTM

• Transformer

• Graph Neural Network

────────────────────────────
      │
      ▼
Concept Drift Detection (ADWIN)
      │
      ▼
SHAP Explainability
      │
      ▼
FastAPI Backend
      │
      ▼
React SOC Dashboard
```

---

# 📂 Project Structure

```
ai-log-analytics-platform
│
├── backend
│   ├── main.py
│   ├── anomaly_detection.py
│   ├── graph_correlation.py
│   ├── drift_detector.py
│   ├── xai.py
│   ├── websocket.py
│   ├── requirements.txt
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── hooks
│   └── utils
│
├── datasets
├── models
├── notebooks
├── docs
├── README.md
```

---

# 🧠 AI Models

## LSTM

Captures temporal patterns in log sequences for anomaly detection.

### Advantages

- Sequential modeling
- Time-series learning
- High anomaly detection accuracy

---

## Transformer

Models long-range dependencies between log events.

### Advantages

- Self-attention
- Better contextual understanding
- Parallel processing

---

## Graph Neural Network (GNN)

Builds relationships between events from multiple log sources.

Supports:

- Threat propagation analysis
- Cross-source event correlation
- Attack path identification

---

# 📈 Online Concept Drift Detection

The platform continuously monitors prediction performance using **ADWIN**.

Capabilities:

- Detects sudden and gradual drift
- Automatically triggers model retraining
- Maintains long-term prediction accuracy

---

# 🔍 Explainable AI

SHAP is used to explain model predictions by highlighting the most influential log features contributing to anomaly detection.

---

# 🌐 Dashboard Modules

- Overview Dashboard
- Live Log Stream
- AI Model Comparison
- Threat Correlation Graph
- Concept Drift Monitoring
- SHAP Explanations
- Cluster Health Monitoring

---

# ⚙️ Technology Stack

| Layer | Technology |
|---------|------------|
| Backend | FastAPI |
| Frontend | React + Vite |
| Cloud | Google Cloud Platform |
| Big Data | Apache Spark, Hadoop, HDFS |
| Cluster | Dataproc, YARN |
| AI Models | LSTM, Transformer, GNN |
| Drift Detection | ADWIN |
| Explainability | SHAP |
| Communication | REST API, WebSockets |

---

# 📊 API Endpoints

| Method | Endpoint | Purpose |
|---------|----------|---------|
| GET | /health | Health Check |
| GET | /metrics | System Metrics |
| GET | /anomalies | Detected Anomalies |
| GET | /graph | Threat Correlation Graph |
| GET | /drift | Drift Detection |
| GET | /xai | SHAP Explanations |
| POST | /predict | Live Prediction |
| WS | /ws/logs | Live Log Stream |
| WS | /ws/metrics | Live Metrics |

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/ai-log-analytics-platform.git

cd ai-log-analytics-platform
```

Install backend dependencies

```bash
pip install -r backend/requirements.txt
```

Run backend

```bash
uvicorn backend.main:app --reload
```

Run frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📊 Applications

- Security Operations Centers (SOC)
- Threat Intelligence
- Cloud Security Monitoring
- Enterprise Log Analytics
- Intrusion Detection
- Infrastructure Monitoring
- Compliance Monitoring
- IT Operations

---

# 🔮 Future Enhancements

- Kubernetes Deployment
- Multi-cloud Support
- Real-Time Threat Intelligence Integration
- Reinforcement Learning for Adaptive Detection
- Large Language Model Assisted Incident Response
- Zero-Day Attack Detection
- Automated Alert Prioritization
- Mobile SOC Dashboard

---

# 🌟 Research Highlights

- Real-Time Cybersecurity Analytics
- AI-Based Anomaly Detection
- Distributed Big Data Processing
- Graph Neural Network Correlation
- Online Concept Drift Detection
- Explainable AI with SHAP
- Interactive SOC Dashboard
- Scalable Cloud Deployment

---

# 👨‍💻 Authors

**Challa Abhiram**

B.Tech Artificial Intelligence Engineering

Amrita School of Computing

Amrita Vishwa Vidyapeetham

---

**Team 9 – Big Data Analytics**

Amrita Vishwa Vidyapeetham

---

# 🙏 Acknowledgement

We thank **Amrita Vishwa Vidyapeetham** for providing the academic environment and computational resources required for this project. We also acknowledge the open-source communities behind FastAPI, React, Apache Spark, Hadoop, Google Cloud Platform, SHAP, and the deep learning frameworks used in this work.

---

# 📜 License

This project is intended for academic and research purposes.

Feel free to fork, improve, and contribute.

⭐ If you find this project useful, please consider giving it a star!
