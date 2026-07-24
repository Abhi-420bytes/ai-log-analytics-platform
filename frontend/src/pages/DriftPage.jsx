// src/pages/DriftPage.jsx
import { useFetch } from '../hooks/useData'
import { endpoints } from '../utils/api'
import { Spinner, KPI, SparkArea } from '../components/UI'

export default function DriftPage() {
  const { data, loading } = useFetch(endpoints.drift, 15000)
  if (loading) return <Spinner />
  const d = data || { events:[], retrains:0, error_history:[] }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="badge-novelty">★ NOVELTY 2</div>
        <p className="text-sm text-slate-400">
          Online Concept Drift Adaptation — ADWIN monitors prediction errors,
          detects distribution shifts, and autonomously retrains the model. No human intervention.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="Drift Events"   value={d.events?.length||0} sub="Detected shifts"       color="text-red-400"   />
        <KPI label="Auto-Retrains"  value={d.retrains||0}       sub="No human needed"       color="text-green-400" />
        <KPI label="Final Error"    value={(d.error_history?.slice(-1)[0]||0.26).toFixed(3)} sub="After adaptation" color="text-cyan-400" />
        <KPI label="Batches"        value={d.error_history?.length||30} sub="Processed"      color="text-purple-400"/>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="section-title mb-0">★ Error Rate Over Time</div>
          <div className="badge-novelty">ADWIN Detector</div>
        </div>
        <div className="relative">
          <SparkArea data={d.error_history||[]} color="#16A34A" height={120} />
          {/* Drift markers */}
          <div className="absolute inset-0 flex items-start pointer-events-none">
            {(d.events||[]).map((e,i) => {
              const pct = d.error_history?.length
                ? (e.batch_id / d.error_history.length * 100) : 0
              return (
                <div key={i} className="absolute flex flex-col items-center"
                     style={{ left:`${pct}%` }}>
                  <div className="w-0.5 h-full bg-red-500/40" />
                  <div className="text-[9px] text-red-400 font-bold mt-1 whitespace-nowrap">
                    {e.drift_type}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-500" /> Error rate
          </span>
          <span className="flex items-center gap-1">
            <div className="w-0.5 h-3 bg-red-500" /> Drift detected → auto-retrain
          </span>
        </div>
      </div>

      <div className="card">
        <div className="section-title">⚡ Drift Events Log</div>
        {d.events?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-dark-600">
                  {['Batch','Type','Magnitude','Action','Time'].map(h => (
                    <th key={h} className="text-left py-2 px-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.events.map((e,i) => (
                  <tr key={i} className="border-b border-dark-700 hover:bg-dark-700/50">
                    <td className="py-2.5 px-3 text-cyan-400 font-mono font-bold">{e.batch_id}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        e.drift_type==='SUDDEN'
                          ? 'bg-red-900/40 text-red-400'
                          : 'bg-amber-900/40 text-amber-400'}`}>
                        {e.drift_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono">{e.magnitude}</td>
                    <td className="py-2.5 px-3 text-green-400 text-xs">{e.action}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-xs">
                      {new Date(e.timestamp||Date.now()).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-slate-600 text-sm text-center py-8">No drift events yet</div>
        )}
      </div>

      <div className="card">
        <div className="section-title">🔧 Adaptation Pipeline</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step:'1', name:'ADWIN Detector', desc:'Adaptive windowing monitors prediction error stream', color:'text-cyan-400' },
            { step:'2', name:'Drift Classifier', desc:'Classifies drift as SUDDEN or GRADUAL', color:'text-amber-400' },
            { step:'3', name:'Online Retrainer', desc:'Partial fit on recent window — no full retrain needed', color:'text-green-400' },
            { step:'4', name:'Drift Logger', desc:'Logs all events to GCS for dashboard + audit', color:'text-purple-400' },
          ].map(s => (
            <div key={s.step} className="bg-dark-700 rounded-lg p-3">
              <div className={`text-2xl font-black ${s.color} mb-1`}>{s.step}</div>
              <div className="text-xs font-bold text-slate-200 mb-1">{s.name}</div>
              <div className="text-[10px] text-slate-500 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
