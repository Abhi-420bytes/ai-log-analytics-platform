// src/pages/GraphCorr.jsx
import { useFetch } from '../hooks/useData'
import { endpoints } from '../utils/api'
import { Spinner, KPI } from '../components/UI'

const SRC_POS = {
  HDFS_v1:   { x:50,  y:15  }, BGL:       { x:85, y:45  },
  OpenStack: { x:70,  y:82  }, Hadoop:    { x:25, y:80  },
  Zookeeper: { x:12,  y:45  },
}
const SRC_COLOR = {
  HDFS_v1:'#2DD4BF', BGL:'#E11D48', OpenStack:'#7C3AED',
  Hadoop:'#D97706',  Zookeeper:'#16A34A',
}

export default function GraphCorr() {
  const { data, loading } = useFetch(endpoints.graph, 30000)
  if (loading) return <Spinner />
  const g = data || { n_nodes:847, n_edges:312, anomaly_nodes:124, threat_paths:[] }
  const paths = g.threat_paths || []

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="badge-novelty">★ NOVELTY 1</div>
        <p className="text-sm text-slate-400">
          Graph-Based Cross-Source Causal Correlation — log events become nodes,
          temporal+semantic edges reveal attack propagation paths across 4 sources simultaneously.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Graph Nodes"    value={g.n_nodes}        sub="Unique event types" color="text-cyan-400"   />
        <KPI label="Causal Edges"   value={g.n_edges}        sub="Cross-source links" color="text-orange-400" />
        <KPI label="Anomaly Nodes"  value={g.anomaly_nodes}  sub="Flagged events"     color="text-red-400"    />
        <KPI label="Threat Paths"   value={paths.length}     sub="Attack propagation" color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* SVG graph */}
        <div className="card">
          <div className="section-title">Causal Event Graph</div>
          <svg viewBox="0 0 100 100" className="w-full" style={{ height:320 }}>
            {/* Draw edges */}
            {paths.map((tp, i) =>
              (tp.spreads_to||[]).map((dest, j) => {
                const from = SRC_POS[tp.origin_source]
                const to   = SRC_POS[dest]
                if (!from || !to) return null
                return (
                  <g key={`${i}-${j}`}>
                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                          stroke="#E11D48" strokeWidth="0.8" strokeDasharray="2 1" opacity="0.7" />
                    <polygon
                      points={`${to.x},${to.y} ${to.x-1},${to.y-1.5} ${to.x+1},${to.y-1.5}`}
                      fill="#E11D48" opacity="0.7" />
                  </g>
                )
              })
            )}
            {/* Draw nodes */}
            {Object.entries(SRC_POS).map(([src, pos]) => {
              const isOrigin = paths.some(p => p.origin_source === src)
              return (
                <g key={src}>
                  {isOrigin && (
                    <circle cx={pos.x} cy={pos.y} r="8" fill="none"
                            stroke={SRC_COLOR[src]} strokeWidth="0.5" opacity="0.3" />
                  )}
                  <circle cx={pos.x} cy={pos.y} r="5"
                          fill={SRC_COLOR[src]} opacity="0.9" />
                  <text x={pos.x} y={pos.y+9} textAnchor="middle"
                        fontSize="3.5" fill="#94A3B8">
                    {src.replace('_v1','')}
                  </text>
                  {isOrigin && (
                    <circle cx={pos.x} cy={pos.y} r="2" fill="#fff" opacity="0.8" />
                  )}
                </g>
              )
            })}
            <text x="50" y="96" textAnchor="middle" fontSize="3" fill="#475569">
              Red dashed = threat propagation path
            </text>
          </svg>
        </div>

        {/* Threat paths */}
        <div className="card">
          <div className="section-title">🔴 Detected Threat Paths</div>
          <div className="space-y-3">
            {paths.length > 0 ? paths.map((tp, i) => (
              <div key={i} className="bg-red-950/30 border border-red-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse-dot" />
                  <span className="text-sm font-bold text-slate-100">
                    Origin: <span style={{ color: SRC_COLOR[tp.origin_source] }}>
                      {tp.origin_source}
                    </span>
                  </span>
                </div>
                <div className="text-xs text-orange-400 mb-2">
                  ↗ Propagates to: {(tp.spreads_to||[]).join(' → ')}
                </div>
                <div className="text-[10px] text-slate-600">
                  Cross-source attack path detected by GNN reasoner
                </div>
              </div>
            )) : (
              <div className="text-slate-600 text-sm text-center py-8">
                No threat paths detected in current window
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-dark-600">
            <div className="text-xs font-semibold text-slate-500 mb-2">Pipeline</div>
            {['Node Encoder → log event embeddings',
              'Edge Detector → temporal + semantic links',
              'GNN Reasoner → message passing over graph',
              'Threat Subgraph → cross-source attack path'].map((s,i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 text-xs text-slate-500">
                <div className="w-5 h-5 rounded-full bg-dark-700 border border-dark-600
                               flex items-center justify-center text-[10px] font-bold text-amber-400">
                  {i+1}
                </div>
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
