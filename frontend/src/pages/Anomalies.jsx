// src/pages/Anomalies.jsx
import { useState } from 'react'
import { useFetch } from '../hooks/useData'
import { endpoints } from '../utils/api'
import { Spinner, SevBadge } from '../components/UI'

const SEV_BORDER = {
  CRITICAL:'border-l-red-500',   HIGH:'border-l-orange-500',
  MEDIUM:'border-l-amber-500',   LOW:'border-l-green-500',
}
const SEV_BG = {
  CRITICAL:'bg-red-950/30',   HIGH:'bg-orange-950/30',
  MEDIUM:'bg-amber-950/20',   LOW:'bg-green-950/20',
}

export default function Anomalies() {
  const { data, loading } = useFetch(endpoints.anomalies, 15000)
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('ALL')

  if (loading) return <Spinner />

  const anomalies = data?.anomalies || []
  const filtered  = filter === 'ALL' ? anomalies
                  : anomalies.filter(a => a.severity === filter)

  const counts = {
    CRITICAL: anomalies.filter(a=>a.severity==='CRITICAL').length,
    HIGH:     anomalies.filter(a=>a.severity==='HIGH').length,
    MEDIUM:   anomalies.filter(a=>a.severity==='MEDIUM').length,
    LOW:      anomalies.filter(a=>a.severity==='LOW').length,
  }

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Severity summary */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(counts).map(([sev, cnt]) => (
          <button key={sev} onClick={() => setFilter(f => f===sev ? 'ALL' : sev)}
            className={`card text-center hover:border-slate-500 transition-colors
              ${filter===sev ? 'border-cyan-500/40 bg-cyan-500/5' : ''}`}>
            <SevBadge sev={sev} />
            <div className="text-3xl font-black mt-2 text-slate-100">{cnt}</div>
            <div className="text-xs text-slate-500 mt-1">detected</div>
          </button>
        ))}
      </div>

      {/* Main panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-300">
              {filtered.length} anomalies {filter !== 'ALL' ? `(${filter})` : ''}
            </span>
            {filter !== 'ALL' && (
              <button onClick={() => setFilter('ALL')} className="btn-ghost text-xs">
                Clear filter
              </button>
            )}
          </div>

          {filtered.map((a, i) => (
            <button key={i} onClick={() => setSelected(a)}
              className={`w-full text-left card border-l-4 ${SEV_BORDER[a.severity]||'border-l-slate-600'}
                         hover:border-slate-500 transition-all
                         ${selected===a ? 'ring-1 ring-cyan-500/40' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <SevBadge sev={a.severity} />
                    <span className="text-xs text-cyan-400 font-semibold">{a.source}</span>
                  </div>
                  {a.cross_source && a.cross_source !== 'None' && (
                    <div className="text-xs text-orange-400 truncate">↗ {a.cross_source}</div>
                  )}
                  <div className="text-[10px] text-slate-600 mt-1">
                    {new Date(a.timestamp || Date.now()).toLocaleString()}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-lg font-black ${
                    a.score > 0.9 ? 'text-red-400' :
                    a.score > 0.7 ? 'text-orange-400' : 'text-amber-400'}`}>
                    {a.score?.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-slate-600">score</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className={`card border-l-4 ${SEV_BORDER[selected.severity]} h-full`}>
              <div className="flex items-center gap-3 mb-4">
                <SevBadge sev={selected.severity} />
                <span className="text-base font-bold text-slate-100">{selected.source}</span>
                <span className="ml-auto text-2xl font-black text-slate-100">
                  {selected.score?.toFixed(4)}
                </span>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  ['Source System',  selected.source,    'text-cyan-400'],
                  ['Anomaly Score',  selected.score?.toFixed(4), 'text-red-400'],
                  ['Severity',       selected.severity,  'text-orange-400'],
                  ['Cross-Source',   selected.cross_source || 'None', 'text-amber-400'],
                ].map(([k,v,c],i) => (
                  <div key={i} className="bg-dark-700 rounded-lg p-3">
                    <div className="text-[10px] text-slate-500 mb-1">{k}</div>
                    <div className={`text-sm font-bold ${c}`}>{v}</div>
                  </div>
                ))}
              </div>

              {/* LLM Forensic summary */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-slate-400 mb-2">
                  🔬 LLM Forensic Summary
                </div>
                <div className="bg-dark-700 rounded-lg p-4 text-sm text-slate-300
                                whitespace-pre-line leading-relaxed border border-dark-600">
                  {selected.summary || 'No forensic summary available.'}
                </div>
              </div>

              {/* Score bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Anomaly Confidence</span>
                  <span className="text-slate-300 font-bold">{(selected.score*100).toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700
                    ${selected.score>0.9?'bg-red-500': selected.score>0.7?'bg-orange-500':'bg-amber-500'}`}
                    style={{ width:`${selected.score*100}%` }} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400
                                   border border-red-500/30 rounded-lg py-2 text-sm font-semibold
                                   transition-colors">
                  🚨 Escalate
                </button>
                <button className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-400
                                   border border-green-500/30 rounded-lg py-2 text-sm font-semibold
                                   transition-colors">
                  ✓ Acknowledge
                </button>
                <button className="flex-1 bg-dark-700 hover:bg-dark-600 text-slate-400
                                   border border-dark-600 rounded-lg py-2 text-sm font-semibold
                                   transition-colors">
                  📋 Report
                </button>
              </div>
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center text-slate-600">
              <div className="text-center">
                <div className="text-4xl mb-3">🔍</div>
                <div className="text-sm">Select an anomaly to view<br/>the LLM forensic analysis</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
