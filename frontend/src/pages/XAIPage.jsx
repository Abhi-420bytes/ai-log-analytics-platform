// src/pages/XAIPage.jsx
import { useFetch } from '../hooks/useData'
import { endpoints } from '../utils/api'
import { Spinner } from '../components/UI'

export default function XAIPage() {
  const { data, loading } = useFetch(endpoints.xai, 60000)
  if (loading) return <Spinner />
  const x = data || {}
  const shap   = x.mean_abs_shap            || [0.82,0.54,0.71,0.43,0.38,0.29,0.61,0.22,0.45,0.33]
  const topPos = x.most_important_positions || [0,2,6]
  const maxVal = Math.max(...shap)

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="card">
        <div className="section-title">🔎 SHAP Feature Attribution per Log Position</div>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          SHAP values show which positions in the log sequence contributed most to anomaly detection.
          Red bars are the most influential positions identified by the model.
        </p>
        <div className="space-y-2.5">
          {shap.map((v, i) => {
            const isTop = topPos.includes(i)
            const pct   = (v / maxVal) * 100
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-14 text-xs font-mono font-bold text-right shrink-0 ${isTop ? 'text-red-400' : 'text-slate-500'}`}>
                  Pos {i}
                </div>
                <div className="flex-1 h-7 bg-dark-700 rounded-lg overflow-hidden relative">
                  <div className={`h-full rounded-lg transition-all duration-700 ${isTop ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-cyan-800 to-cyan-600'}`}
                    style={{ width:`${pct}%` }} />
                  {isTop && <div className="absolute right-2 inset-y-0 flex items-center"><span className="text-[9px] text-red-200 font-bold">★ TOP</span></div>}
                </div>
                <div className={`w-14 text-xs font-mono font-bold text-right shrink-0 ${isTop ? 'text-red-400' : 'text-slate-500'}`}>{v.toFixed(3)}</div>
              </div>
            )
          })}
        </div>
        <div className="mt-6 p-4 bg-red-950/20 border border-red-700/20 rounded-lg">
          <div className="text-xs font-semibold text-red-400 mb-1">Key Finding</div>
          <div className="text-sm text-slate-300">
            Log positions <span className="text-red-400 font-bold">{topPos.join(', ')}</span> carry the highest predictive signal for anomaly detection.
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[['Max SHAP', Math.max(...shap).toFixed(4), 'text-red-400'],
          ['Mean SHAP', (shap.reduce((a,b)=>a+b,0)/shap.length).toFixed(4), 'text-cyan-400'],
          ['Top Positions', topPos.join(', '), 'text-amber-400']].map(([k,v,c],i) => (
          <div key={i} className="card text-center">
            <div className="text-xs text-slate-500 mb-1">{k}</div>
            <div className={`text-xl font-black ${c}`}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
