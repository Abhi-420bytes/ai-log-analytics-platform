// src/components/Sidebar.jsx
const NAV = [
  { id:'overview',  icon:'📊', label:'Overview'            },
  { id:'live',      icon:'⚡', label:'Live Stream'          },
  { id:'anomalies', icon:'🚨', label:'Anomalies'            },
  { id:'models',    icon:'🤖', label:'AI Models'            },
  { id:'graph',     icon:'★',  label:'Graph Correlation',  novelty:true },
  { id:'drift',     icon:'★',  label:'Drift Adaptation',   novelty:true },
  { id:'xai',       icon:'🔎', label:'XAI Explainer'        },
  { id:'cluster',   icon:'☁️', label:'Cluster'              },
]

export default function Sidebar({ page, setPage }) {
  return (
    <aside className="w-56 bg-dark-900 border-r border-dark-600 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-4 border-b border-dark-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm font-bold border border-cyan-500/30">
            🔍
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 leading-tight">Log Analytics</div>
            <div className="text-[10px] text-slate-500">SOC Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV.map(n => (
          <button
            key={n.id}
            onClick={() => setPage(n.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all
              ${page === n.id
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25'
                : 'text-slate-400 hover:bg-dark-700 hover:text-slate-200'}`}
          >
            <span className="text-base leading-none">{n.icon}</span>
            <span className="flex-1 text-left font-medium">{n.label}</span>
            {n.novelty && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1 rounded font-bold">
                NEW
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-dark-600">
        <div className="text-[10px] text-slate-600 text-center leading-relaxed">
          Team 9 · BDA<br/>Amrita Vishwa Vidyapeetham
        </div>
      </div>
    </aside>
  )
}
