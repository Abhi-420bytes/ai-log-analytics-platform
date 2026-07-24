// src/pages/Cluster.jsx
import { useFetch } from '../hooks/useData'
import { endpoints } from '../utils/api'
import { Spinner, KPI } from '../components/UI'

export default function Cluster() {
  const { data: c, loading } = useFetch(endpoints.cluster, 30000)
  if (loading) return <Spinner />
  const cl = c || {}

  return (
    <div className="space-y-4 animate-fade-in">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPI label="HDFS Capacity"  value={`${cl.capacity_gb||97.96} GB`} sub="Across 2 DataNodes" color="text-cyan-400" />
        <KPI label="HDFS Used"      value={`${cl.used_pct||0.74}%`}       sub="~480 MB used"       color="text-green-400"/>
        <KPI label="Replication"    value={`${cl.replication||2}x`}       sub="Block replication"  color="text-purple-400"/>
        <KPI label="Spark"          value={cl.spark_version||'3.3.0'}     sub="on YARN cluster"    color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="card">
          <div className="section-title">☁️ GCP Dataproc Cluster</div>
          {[
            ['Cluster Name',   cl.name||'log-cluster'],
            ['Project',        'log-analytics-platform'],
            ['Region',         cl.region||'asia-south1'],
            ['YARN State',     cl.yarn_state||'RUNNING'],
            ['GCS Bucket',     `gs://${cl.bucket||'loganalytics-23043'}`],
            ['HDFS Base',      cl.hdfs_base||'hdfs:///loganalytics'],
            ['Spark Version',  cl.spark_version||'3.3.0'],
          ].map(([k,v],i) => (
            <div key={i} className="stat-row">
              <span className="text-slate-500 text-sm">{k}</span>
              <span className="text-slate-200 font-mono text-xs font-semibold">{v}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">🖥️ Worker Nodes (DataNodes)</div>
          {(cl.workers||['log-cluster-w-0','log-cluster-w-1']).map((w,i) => (
            <div key={i} className="bg-dark-700 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-100">{w}</span>
                <span className="text-xs bg-green-900/40 text-green-400 border border-green-700/40
                               px-2 py-0.5 rounded-full font-semibold">● RUNNING</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {[
                  ['Role',      'DataNode + NodeManager'],
                  ['Capacity',  '48.98 GB'],
                  ['Used',      '240.30 MB (0.48%)'],
                  ['Remaining', '31.42 GB'],
                ].map(([k,v],j) => (
                  <div key={j} className="flex justify-between">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-slate-300 font-mono">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 h-1.5 bg-dark-900 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width:'0.48%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">⚡ Full Pipeline Status</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            ['HDFS Storage',    'Active',  'text-green-400',  'bg-green-900/30'],
            ['YARN Scheduler',  'Running', 'text-green-400',  'bg-green-900/30'],
            ['Spark 3.3.0',     'Ready',   'text-cyan-400',   'bg-cyan-900/30'],
            ['Drain3 Parsing',  'Done',    'text-green-400',  'bg-green-900/30'],
            ['LSTM Model',      'Trained', 'text-purple-400', 'bg-purple-900/30'],
            ['Transformer',     'Trained', 'text-amber-400',  'bg-amber-900/30'],
            ['★ Graph Corr',    'Active',  'text-orange-400', 'bg-orange-900/30'],
            ['★ Drift Adapt',   'Active',  'text-green-400',  'bg-green-900/30'],
            ['XAI (SHAP)',      'Done',    'text-cyan-400',   'bg-cyan-900/30'],
            ['LLM Forensics',   'Done',    'text-purple-400', 'bg-purple-900/30'],
            ['FastAPI :8000',   'Running', 'text-cyan-400',   'bg-cyan-900/30'],
            ['React UI :3000',  'Running', 'text-cyan-400',   'bg-cyan-900/30'],
          ].map(([name,status,tc,bg],i) => (
            <div key={i} className={`${bg} rounded-lg p-2.5 border border-dark-600
                                      flex items-center justify-between`}>
              <span className="text-xs text-slate-400 font-medium">{name}</span>
              <span className={`text-[10px] font-bold ${tc}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
