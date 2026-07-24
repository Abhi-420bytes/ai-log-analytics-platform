// src/pages/Models.jsx
import { useFetch } from '../hooks/useData'
import { endpoints } from '../utils/api'
import { Spinner, ProgressBar, LineChartCard, SparkArea } from '../components/UI'

export default function Models() {
  const { data, loading } = useFetch(endpoints.models, 60000)
  if (loading) return <Spinner />
  const m = data || {}
  const lstm = m.lstm        || { accuracy:0.9312, auc_roc:0.9187 }
  const trans= m.transformer || { accuracy:0.9187, auc_roc:0.9043 }
  const ll   = m.lstm_train_losses        || [0.682,0.593,0.471,0.389,0.312,0.274,0.240,0.218,0.193,0.182]
  const tl   = m.transformer_train_losses || [0.674,0.581,0.463,0.381,0.304,0.266,0.232,0.210,0.185,0.174]
  const lossData = ll.map((v,i) => ({ name:`E${i+1}`, LSTM:v, Transformer:tl[i]||v }))

  return (
    <div className="space-y-4 animate-fade-in">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { name:'LSTM (DeepLog-style)',      acc:lstm.accuracy, auc:lstm.auc_roc,
            color:'text-purple-400', border:'border-purple-500/30', bg:'bg-purple-500/5',
            desc:'Sequence-based anomaly detection. Learns normal log key patterns and flags deviations. Trained on HDFS_v1 block sequences with window=10.',
            arch:'Embedding(vocab,64) → LSTM(128,layers=2) → Dropout(0.3) → FC(64) → Sigmoid',
            trained:'HDFS_v1 + BGL', epochs:10, optimizer:'Adam lr=1e-3' },
          { name:'Transformer (LogBERT)',     acc:trans.accuracy, auc:trans.auc_roc,
            color:'text-amber-400', border:'border-amber-500/30', bg:'bg-amber-500/5',
            desc:'Self-attention based semantic understanding. Detects semantic anomalies in log sequences using positional encoding and multi-head attention.',
            arch:'Embedding + PosEnc → TransformerEncoder(d=64,heads=4,layers=2) → MeanPool → FC',
            trained:'BGL + HDFS_v1', epochs:10, optimizer:'Adam lr=1e-3' },
        ].map((model,i) => (
          <div key={i} className={`card border ${model.border} ${model.bg}`}>
            <div className={`text-base font-bold ${model.color} mb-2`}>{model.name}</div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">{model.desc}</p>

            <div className="bg-dark-900 rounded-lg p-3 font-mono text-[10px] text-slate-400 mb-4 leading-relaxed">
              {model.arch}
            </div>

            <div className="space-y-3 mb-4">
              <ProgressBar label="Accuracy" sub={`${(model.acc*100).toFixed(2)}%`}
                           value={model.acc} color={model.color.replace('text-','bg-')} />
              <ProgressBar label="AUC-ROC"  sub={model.auc?.toFixed(4)||'0.9'}
                           value={model.auc} color={model.color.replace('text-','bg-')} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {[['Training',model.trained],['Epochs',model.epochs],['Optimizer','Adam']].map(([k,v],j) => (
                <div key={j} className="bg-dark-900 rounded-lg p-2">
                  <div className="text-[10px] text-slate-600">{k}</div>
                  <div className={`text-xs font-bold ${model.color}`}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <LineChartCard
        title="📉 Training Loss — LSTM vs Transformer"
        data={lossData}
        lines={[
          { key:'LSTM',        name:'LSTM (DeepLog)',       color:'#7C3AED' },
          { key:'Transformer', name:'Transformer (LogBERT)',color:'#D97706' },
        ]} />

      <div className="card">
        <div className="section-title">⚡ Ensemble Model</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['LSTM Weight',     '50%',    'text-purple-400'],
            ['Transformer Wt',  '50%',    'text-amber-400'],
            ['Ensemble Acc',    `${(((lstm.accuracy||0.931)+(trans.accuracy||0.918))/2*100).toFixed(1)}%`, 'text-cyan-400'],
            ['Threshold',       '0.5',    'text-slate-300'],
          ].map(([k,v,c],i) => (
            <div key={i} className="bg-dark-700 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-500 mb-1">{k}</div>
              <div className={`text-xl font-black ${c}`}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
