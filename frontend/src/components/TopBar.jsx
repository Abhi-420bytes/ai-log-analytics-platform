// src/components/TopBar.jsx
import { useState } from 'react'
import { useLiveMetrics } from '../hooks/useData'
import { endpoints } from '../utils/api'

const PAGE_TITLES = {
  overview:  'Platform Overview',
  live:      'Live Log Stream',
  anomalies: 'Anomaly Detection',
  models:    'AI Models — LSTM + Transformer',
  graph:     '★ Graph-Based Cross-Source Correlation',
  drift:     '★ Concept Drift Adaptation',
  xai:       'XAI — SHAP Explanations',
  cluster:   'GCP Dataproc Cluster',
}

export default function TopBar({ page }) {
  const { metrics, connected } = useLiveMetrics()
  const [reloading, setReloading] = useState(false)

  const reload = async () => {
    setReloading(true)
    try { await endpoints.reload() } catch {}
    setTimeout(() => setReloading(false), 2000)
  }

  return (
    <header className="h-14 bg-dark-900 border-b border-dark-600 flex items-center px-6 gap-4 shrink-0">
      {/* Title */}
      <div className="flex-1">
        <h1 className="text-sm font-bold text-slate-100">{PAGE_TITLES[page]}</h1>
        <div className="text-[10px] text-slate-500">
          GCP Dataproc · HDFS · YARN · Spark 3.3
        </div>
      </div>

      {/* Live metrics ticker */}
      {metrics && (
        <div className="hidden md:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-cyan-400 font-bold">
              {metrics.total_logs?.toLocaleString()}
            </span>
            <span>logs</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-red-400 font-bold">
              {metrics.anomaly_count?.toLocaleString()}
            </span>
            <span>anomalies</span>
          </div>
        </div>
      )}

      {/* Status badges */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium
          ${connected
            ? 'bg-green-900/30 text-green-400 border-green-700/40'
            : 'bg-slate-800 text-slate-500 border-slate-600'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse-dot' : 'bg-slate-500'}`} />
          {connected ? 'LIVE' : 'OFFLINE'}
        </div>

        <button onClick={reload} disabled={reloading}
          className="btn-ghost text-xs disabled:opacity-50">
          {reloading ? '⟳ Loading...' : '↻ Refresh'}
        </button>
      </div>
    </header>
  )
}
