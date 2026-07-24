"""
backend/main.py
FastAPI Backend — AI Log Analytics Platform
Team 9 | Amrita Vishwa Vidyapeetham
Connects to GCS, serves all results to React frontend
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio, json, random, time, os
from datetime import datetime
from google.cloud import storage

# ── Config ─────────────────────────────────────────────────────────────────
BUCKET       = os.getenv("GCS_BUCKET", "loganalytics-23043")
CLUSTER_NAME = os.getenv("CLUSTER_NAME", "log-cluster")
HDFS_BASE    = "hdfs:///loganalytics"

app = FastAPI(title="Log Analytics SOC API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load results from GCS ──────────────────────────────────────────────────
def load_gcs_json(path: str):
    try:
        client = storage.Client()
        blob   = client.bucket(BUCKET).blob(path)
        return json.loads(blob.download_as_text())
    except Exception as e:
        print(f"[GCS] Could not load {path}: {e}")
        return None

def load_all_results():
    return {
        "summary":      load_gcs_json("results/platform_summary.json"),
        "graph":        load_gcs_json("results/graph_results.json"),
        "drift":        load_gcs_json("results/drift_results.json"),
        "llm":          load_gcs_json("results/llm_summaries.json"),
        "xai":          load_gcs_json("results/xai_results.json"),
        "models":       load_gcs_json("results/model_metrics.json"),
        "source_stats": load_gcs_json("results/source_stats.json"),
    }

# Load on startup
RESULTS = load_all_results()

# ── Fallback mock data if GCS not available ───────────────────────────────
MOCK_SUMMARY = {
    "total_logs": 16599225, "anomaly_rate": 0.062,
    "anomaly_count": 1029152,
    "sources": ["HDFS_v1","BGL","OpenStack","Hadoop","Zookeeper"],
    "lstm_accuracy": 0.9312, "lstm_auc": 0.9187,
    "transformer_accuracy": 0.9187, "transformer_auc": 0.9043,
    "graph_nodes": 847, "graph_edges": 312,
    "threat_paths": 4, "drift_events": 3, "drift_retrains": 3,
    "llm_summaries": 5, "cluster": "log-cluster",
    "hdfs_base": "hdfs:///loganalytics",
}

MOCK_SOURCE_STATS = [
    {"source":"BGL",       "total":4747963,  "anomalies":348460, "unique_templates":45, "anomaly_pct":7.34},
    {"source":"HDFS_v1",   "total":11175629, "anomalies":186234, "unique_templates":28, "anomaly_pct":1.67},
    {"source":"OpenStack", "total":207820,   "anomalies":3124,   "unique_templates":67, "anomaly_pct":1.50},
    {"source":"Hadoop",    "total":394308,   "anomalies":4731,   "unique_templates":89, "anomaly_pct":1.20},
    {"source":"Zookeeper", "total":74380,    "anomalies":223,    "unique_templates":34, "anomaly_pct":0.30},
]

MOCK_ANOMALIES = [
    {"source":"BGL","score":0.942,"severity":"CRITICAL",
     "summary":"1. Hardware memory fault\n2. Instruction cache parity error\n3. Severity: CRITICAL\n4. Isolate node R02-M1",
     "cross_source":"BGL → HDFS_v1, Hadoop","timestamp":"2026-05-13T09:03:40"},
    {"source":"HDFS_v1","score":0.871,"severity":"HIGH",
     "summary":"1. Block replication failure\n2. DataNode unreachable\n3. Severity: HIGH\n4. Check DataNode health",
     "cross_source":"HDFS_v1 → Hadoop","timestamp":"2026-05-13T09:04:12"},
    {"source":"OpenStack","score":0.754,"severity":"HIGH",
     "summary":"1. Unauthorized API call\n2. Invalid tenant credentials\n3. Severity: HIGH\n4. Revoke token",
     "cross_source":"OpenStack → Zookeeper","timestamp":"2026-05-13T09:05:33"},
    {"source":"Hadoop","score":0.612,"severity":"MEDIUM",
     "summary":"1. Job execution failure\n2. Container killed by YARN\n3. Severity: MEDIUM\n4. Review resource limits",
     "cross_source":"None","timestamp":"2026-05-13T09:06:01"},
    {"source":"Zookeeper","score":0.531,"severity":"MEDIUM",
     "summary":"1. Leader election timeout\n2. Network partition suspected\n3. Severity: MEDIUM\n4. Check quorum",
     "cross_source":"None","timestamp":"2026-05-13T09:07:22"},
]

MOCK_GRAPH = {
    "n_nodes":847, "n_edges":312, "anomaly_nodes":124,
    "threat_paths":[
        {"origin_source":"BGL",       "spreads_to":["HDFS_v1","Hadoop"],  "path_length":2},
        {"origin_source":"OpenStack", "spreads_to":["Zookeeper"],         "path_length":1},
        {"origin_source":"HDFS_v1",   "spreads_to":["Hadoop"],            "path_length":1},
    ]
}

MOCK_DRIFT = {
    "events":[
        {"batch_id":7,  "drift_type":"SUDDEN",  "magnitude":0.231,"action":"Auto-retrained (loss=0.3421)","timestamp":"2026-05-13T09:10:00"},
        {"batch_id":14, "drift_type":"GRADUAL", "magnitude":0.087,"action":"Auto-retrained (loss=0.2891)","timestamp":"2026-05-13T09:15:00"},
        {"batch_id":22, "drift_type":"SUDDEN",  "magnitude":0.198,"action":"Auto-retrained (loss=0.3102)","timestamp":"2026-05-13T09:20:00"},
    ],
    "retrains":3,
    "error_history":[0.45,0.42,0.40,0.38,0.41,0.39,0.37,0.62,0.41,0.39,
                     0.38,0.36,0.35,0.34,0.51,0.36,0.34,0.33,0.32,0.31,
                     0.30,0.53,0.35,0.33,0.31,0.30,0.29,0.28,0.27,0.26],
}

MOCK_MODELS = {
    "lstm":        {"accuracy":0.9312,"auc_roc":0.9187},
    "transformer": {"accuracy":0.9187,"auc_roc":0.9043},
    "lstm_train_losses":        [0.682,0.593,0.471,0.389,0.312,0.274,0.240,0.218,0.193,0.182],
    "transformer_train_losses": [0.674,0.581,0.463,0.381,0.304,0.266,0.232,0.210,0.185,0.174],
}

MOCK_XAI = {
    "mean_abs_shap": [0.82,0.54,0.71,0.43,0.38,0.29,0.61,0.22,0.45,0.33],
    "most_important_positions": [0,2,6],
}

def get(key, fallback):
    return RESULTS.get(key) or fallback

# ── REST Endpoints ─────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status":"running","platform":"AI Log Analytics SOC","version":"2.0"}

@app.get("/health")
def health():
    return {
        "api":"ok",
        "gcs_connected": any(v is not None for v in RESULTS.values()),
        "cluster": CLUSTER_NAME,
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/metrics")
def metrics():
    return get("summary", MOCK_SUMMARY)

@app.get("/source_stats")
def source_stats():
    data = get("source_stats", MOCK_SOURCE_STATS)
    return {"sources": data if isinstance(data, list) else MOCK_SOURCE_STATS}

@app.get("/anomalies")
def get_anomalies():
    data = get("llm", None)
    if data and isinstance(data, list):
        anomalies = [{"source":d.get("source","unknown"),
                      "score":d.get("anomaly_prob",0),
                      "severity":"CRITICAL" if d.get("anomaly_prob",0)>0.9 else "HIGH" if d.get("anomaly_prob",0)>0.7 else "MEDIUM",
                      "summary":d.get("forensic_summary","N/A"),
                      "cross_source":d.get("cross_source","None"),
                      "timestamp":datetime.now().isoformat()} for d in data]
    else:
        anomalies = MOCK_ANOMALIES
    return {"anomalies": anomalies, "count": len(anomalies)}

@app.get("/graph")
def get_graph():
    return get("graph", MOCK_GRAPH)

@app.get("/drift")
def get_drift():
    return get("drift", MOCK_DRIFT)

@app.get("/models")
def get_models():
    return get("models", MOCK_MODELS)

@app.get("/xai")
def get_xai():
    return get("xai", MOCK_XAI)

@app.get("/cluster")
def get_cluster():
    return {
        "name":         CLUSTER_NAME,
        "hdfs_base":    HDFS_BASE,
        "bucket":       BUCKET,
        "datanodes":    2,
        "capacity_gb":  97.96,
        "used_pct":     0.74,
        "replication":  2,
        "spark_version":"3.3.0",
        "yarn_state":   "RUNNING",
        "region":       "asia-south1",
        "workers":      ["log-cluster-w-0","log-cluster-w-1"],
    }

@app.post("/reload")
def reload_results():
    global RESULTS
    RESULTS = load_all_results()
    return {"status":"reloaded","timestamp":datetime.now().isoformat()}

# ── Live log simulation ────────────────────────────────────────────────────
LOG_SOURCES  = ["HDFS_v1","BGL","OpenStack","Hadoop","Zookeeper"]
LOG_LEVELS   = ["INFO","INFO","INFO","WARN","ERROR","FATAL"]
LOG_MESSAGES = [
    "Block received blk_1234 from DataNode",
    "Instruction cache parity error corrected",
    "Authentication failed for tenant UUID",
    "Container killed by YARN resource manager",
    "Leader election timeout, quorum check",
    "Replication factor violated for block",
    "MapReduce job application_123 failed",
    "Connection refused from 10.160.0.2",
    "CRITICAL: attack detected from external IP",
    "Normal log event processed successfully",
    "DataNode heartbeat received",
    "Zookeeper session expired",
]

def generate_live_log():
    src   = random.choice(LOG_SOURCES)
    level = random.choice(LOG_LEVELS)
    msg   = random.choice(LOG_MESSAGES)
    score = random.uniform(0.1, 0.99)
    anom  = 1 if score > 0.65 else 0
    sev   = "CRITICAL" if score>0.9 else "HIGH" if score>0.75 else "MEDIUM" if score>0.65 else "LOW"
    return {
        "id":        f"log_{int(time.time()*1000)}_{random.randint(0,9999)}",
        "timestamp": datetime.now().isoformat(),
        "source":    src,
        "level":     level,
        "message":   msg,
        "score":     round(score, 4),
        "is_anomaly":anom,
        "severity":  sev,
        "template":  msg[:30] + "...",
    }

# ── WebSocket — live log stream ───────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []
    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)
    def disconnect(self, ws: WebSocket):
        self.connections.remove(ws)
    async def broadcast(self, data: dict):
        dead = []
        for ws in self.connections:
            try:
                await ws.send_json(data)
            except:
                dead.append(ws)
        for ws in dead:
            self.connections.remove(ws)

manager = ConnectionManager()

@app.websocket("/ws/logs")
async def ws_logs(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            log = generate_live_log()
            await websocket.send_json(log)
            await asyncio.sleep(random.uniform(0.8, 2.0))
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/metrics")
async def ws_metrics(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        base = get("summary", MOCK_SUMMARY)
        count = base.get("anomaly_count", 1029152)
        while True:
            count += random.randint(1, 15)
            await websocket.send_json({
                "total_logs":    base.get("total_logs", 16599225) + count,
                "anomaly_count": count,
                "anomaly_rate":  round(count / base.get("total_logs", 16599225), 4),
                "timestamp":     datetime.now().isoformat(),
            })
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
