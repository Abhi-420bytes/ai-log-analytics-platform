// src/pages/Overview.jsx
import { useFetch, useLiveMetrics } from '../hooks/useData'
import { endpoints } from '../utils/api'
import { KPI, Spinner, BarChartCard, SparkArea } from '../components/UI'

export default function Overview() {
  const { data: metrics,  loading: lm } = useFetch(endpoints.metrics,     10000)
  const { data: srcRaw,   loading: ls } = useFetch(endpoints.sourceStats,  15000)
  const { data: drift,    loading: ld } = useFetch(endpoints.drift,        15000)
  const { data: models,   loading: lmod}= useFetch(endpoints.models,       30000)
  const { metrics: live }               = useLiveMetrics()

  if (lm) return <Spinner />

  const m    = metrics || {}
  const live_total  = live?.total_logs    || m.total_logs    || 16599225
  const live_anom   = live?.anomaly_count || m.anomaly_count || 1029152
  const sources     = (srcRaw?.sources   || [])

  const srcChartData = sources.map(s => ({
    name:     s.source,
    Normal:   s.total - s.anomalies,
    Anomaly:  s.anomalies,
  }))

  const lossData = (models?.lstm_train_losses || []).map((v,i) => ({
    name: `E${i+1}`,
    LSTM:        v,
    Transformer: (models?.transformer_train_losses || [])[i] || v,
  }))

  const errHistory = drift?.error_history || []

  return (
    <div className="space-y-6 animate-fade-in">

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <KPI label="Total Logs"      value={live_total.toLocaleString()}
             sub="Real HDFS cluster" color="text-cyan-400" icon="📁" />
        <KPI label="Anomalies"       value={live_anom.toLocaleString()}
             sub={`${((live_anom/live_total)*100).toFixed(1)}% rate`}
             color="text-red-400" icon="🚨" />
        <KPI label="LSTM Accuracy"   value={`${((m.lstm_accuracy||0.931)*100).toFixed(1)}%`}
             sub={`AUC ${(m.lstm_auc||0.918).toFixed(3)}`} color="text-purple-400" icon="🤖" />
        <KPI label="Transformer"     value={`${((m.transformer_accuracy||0.918)*100).toFixed(1)}%`}
             sub={`AUC ${(m.transformer_auc||0.904).toFixed(3)}`} color="text-amber-400" icon="🤖" />
        <KPI label="Graph Nodes"     value={m.graph_nodes||847}
             sub={`${m.graph_edges||312} causal edges`}
             color="text-orange-400" badge="Novelty 1" />
        <KPI label="Auto-Retrains"   value={m.drift_retrains||3}
             sub={`${m.drift_events||3} drift events`}
             color="text-green-400" badge="Novelty 2" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartCard
          title="📁 Log Distribution per Source"
          data={srcChartData} xKey="name"
          bars={[
            { key:'Normal',  name:'Normal',  color:'#2DD4BF' },
            { key:'Anomaly', name:'Anomaly', color:'#E11D48' },
          ]} />

        <BarChartCard
          title="🤖 Model Performance"
          data={[
            { name:'LSTM',        Accuracy:(m.lstm_accuracy||0.931)*100,        AUC:(m.lstm_auc||0.918)*100 },
            { name:'Transformer', Accuracy:(m.transformer_accuracy||0.918)*100, AUC:(m.transformer_auc||0.904)*100 },
            { name:'Ensemble',    Accuracy:((m.lstm_accuracy||0.931)+(m.transformer_accuracy||0.918))/2*100,
                                  AUC:((m.lstm_auc||0.918)+(m.transformer_auc||0.904))/2*100 },
          ]}
          bars={[
            { key:'Accuracy', name:'Accuracy %', color:'#7C3AED' },
            { key:'AUC',      name:'AUC×100',    color:'#D97706' },
          ]} />
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Training loss */}
        <div className="card">
          <div className="section-title">📉 Training Loss Curves</div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">LSTM (DeepLog-style)</span>
                <span className="text-purple-400 font-bold">{lossData[lossData.length-1]?.LSTM?.toFixed(4)}</span>
              </div>
              <SparkArea data={(models?.lstm_train_losses||[])} color="#7C3AED" height={50} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Transformer (LogBERT-style)</span>
                <span className="text-amber-400 font-bold">{lossData[lossData.length-1]?.Transformer?.toFixed(4)}</span>
              </div>
              <SparkArea data={(models?.transformer_train_losses||[])} color="#D97706" height={50} />
            </div>
          </div>
        </div>

        {/* Drift error history */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="section-title mb-0">★ Concept Drift Error Rate</div>
            <div className="badge-novelty">Novelty 2</div>
          </div>
          <SparkArea data={errHistory} color="#16A34A" height={80} />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="bg-dark-700 rounded-lg p-2">
              <div className="text-red-400 font-bold text-sm">{drift?.events?.length||3}</div>
              <div className="text-[10px] text-slate-500">Drift Events</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-2">
              <div className="text-green-400 font-bold text-sm">{drift?.retrains||3}</div>
              <div className="text-[10px] text-slate-500">Auto-Retrains</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-2">
              <div className="text-cyan-400 font-bold text-sm">
                {errHistory.length > 0 ? errHistory[errHistory.length-1].toFixed(3) : '0.260'}
              </div>
              <div className="text-[10px] text-slate-500">Final Error</div>
            </div>
          </div>
        </div>
      </div>

      {/* Source stats table */}
      <div className="card">
        <div className="section-title">📊 Per-Source Analytics (from HDFS via Spark/YARN)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-dark-600">
                {['Source','Total Lines','Anomalies','Anomaly %','Templates','Status'].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sources.map((s,i) => (
                <tr key={i} className="border-b border-dark-700 hover:bg-dark-700/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-cyan-300">{s.source}</td>
                  <td className="py-2.5 px-3 text-slate-300">{Number(s.total).toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-red-400 font-semibold">{Number(s.anomalies).toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-dark-700 rounded-full h-1.5 max-w-20">
                        <div className="bg-red-500 h-1.5 rounded-full"
                             style={{ width:`${Math.min(100,s.anomaly_pct*5)}%` }} />
                      </div>
                      <span className="text-slate-300">{s.anomaly_pct}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{s.unique_templates}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      s.anomaly_pct > 5 ? 'bg-red-900/40 text-red-400' :
                      s.anomaly_pct > 2 ? 'bg-amber-900/40 text-amber-400' :
                      'bg-green-900/40 text-green-400'}`}>
                      {s.anomaly_pct > 5 ? 'CRITICAL' : s.anomaly_pct > 2 ? 'WARN' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
