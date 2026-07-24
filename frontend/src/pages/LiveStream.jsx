// src/pages/LiveStream.jsx
import { useState } from 'react'
import { useLiveLogs } from '../hooks/useData'
import { SevBadge } from '../components/UI'

const SEV_COLOR = {
  CRITICAL: 'text-red-400 bg-red-950/50',
  HIGH:     'text-orange-400 bg-orange-950/50',
  MEDIUM:   'text-amber-400 bg-amber-950/30',
  LOW:      'text-green-400',
}

const LVL_COLOR = {
  FATAL:'text-red-500', ERROR:'text-orange-400',
  WARN:'text-amber-400', INFO:'text-cyan-400', DEBUG:'text-slate-500',
}

export default function LiveStream() {
  const { logs, connected } = useLiveLogs(200)
  const [filter, setFilter]   = useState('ALL')
  const [search, setSearch]   = useState('')
  const [paused, setPaused]   = useState(false)

  const FILTERS = ['ALL','CRITICAL','HIGH','MEDIUM','LOW']

  const visible = logs.filter(l => {
    if (filter !== 'ALL' && l.severity !== filter) return false
    if (search && !l.message?.toLowerCase().includes(search.toLowerCase()) &&
        !l.source?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const anomalyCount = logs.filter(l => l.is_anomaly).length
  const critCount    = logs.filter(l => l.severity === 'CRITICAL').length

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Header stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Total Streamed',   value:logs.length,    color:'text-cyan-400'   },
          { label:'Anomalies',        value:anomalyCount,   color:'text-red-400'    },
          { label:'Critical',         value:critCount,      color:'text-orange-400' },
          { label:'Stream Rate',      value:'~1/sec',       color:'text-green-400'  },
        ].map((s,i) => (
          <div key={i} className="card">
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3">
          {/* Connection status */}
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-semibold
            ${connected ? 'bg-green-900/30 text-green-400 border-green-700/40'
                        : 'bg-slate-800 text-slate-500 border-slate-600'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse-dot' : 'bg-slate-500'}`} />
            {connected ? 'WebSocket LIVE' : 'Connecting...'}
          </div>

          {/* Filters */}
          <div className="flex gap-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors
                  ${filter === f ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                 : 'text-slate-500 hover:text-slate-300 hover:bg-dark-700'}`}>
                {f}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="flex-1 min-w-40 bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5
                       text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none
                       focus:border-cyan-500/50" />

          {/* Pause */}
          <button onClick={() => setPaused(p => !p)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors
              ${paused ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                       : 'bg-dark-700 text-slate-400 border-dark-600 hover:text-slate-200'}`}>
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
      </div>

      {/* Log stream */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-dark-600 bg-dark-900">
          <span className="text-xs font-semibold text-slate-400">
            ⚡ Live Log Stream — {visible.length} logs
          </span>
          <span className="text-xs text-slate-600">
            Real-time from Dataproc HDFS via WebSocket
          </span>
        </div>

        <div className="h-[520px] overflow-y-auto font-mono text-xs">
          {visible.slice(0, paused ? visible.length : 100).map((log, i) => (
            <div key={log.id || i}
              className={`flex items-start gap-3 px-4 py-2 border-b border-dark-700/50
                         hover:bg-dark-700/30 transition-colors animate-slide-up
                         ${log.is_anomaly ? 'border-l-2 border-l-red-600/60' : ''}`}>

              {/* Time */}
              <span className="text-slate-600 shrink-0 w-20">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>

              {/* Source */}
              <span className="text-cyan-500/80 shrink-0 w-20 truncate">{log.source}</span>

              {/* Level */}
              <span className={`font-bold shrink-0 w-12 ${LVL_COLOR[log.level]||'text-slate-400'}`}>
                {log.level}
              </span>

              {/* Message */}
              <span className={`flex-1 ${log.is_anomaly ? 'text-slate-200' : 'text-slate-400'}`}>
                {log.message}
              </span>

              {/* Score + severity */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-bold ${
                  log.score > 0.8 ? 'text-red-400' :
                  log.score > 0.6 ? 'text-amber-400' : 'text-slate-600'}`}>
                  {log.score?.toFixed(3)}
                </span>
                {log.is_anomaly && <SevBadge sev={log.severity} />}
              </div>
            </div>
          ))}

          {visible.length === 0 && (
            <div className="flex items-center justify-center h-40 text-slate-600">
              {connected ? 'Waiting for logs...' : 'Connecting to stream...'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
