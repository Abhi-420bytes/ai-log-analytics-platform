// src/components/UI.jsx — shared reusable components

import { LineChart, Line, BarChart, Bar, AreaChart, Area,
         XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// ── KPI Card ──────────────────────────────────────────────────────────────
export function KPI({ label, value, sub, color='text-cyan-400', icon, badge }) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div className="text-xs text-slate-500 font-medium">{label}</div>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <div className={`text-2xl font-black ${color} leading-tight`}>{value}</div>
      {sub   && <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>}
      {badge && <div className="badge-novelty w-fit mt-1">★ {badge}</div>}
    </div>
  )
}

// ── Severity badge ─────────────────────────────────────────────────────────
export function SevBadge({ sev }) {
  const cls = { CRITICAL:'badge-critical', HIGH:'badge-high',
                MEDIUM:'badge-medium', LOW:'badge-low' }
  return <span className={cls[sev] || 'badge-low'}>{sev}</span>
}

// ── Loading spinner ────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── Error box ──────────────────────────────────────────────────────────────
export function ErrorBox({ msg }) {
  return (
    <div className="card border-red-700/40 text-red-400 text-sm p-4">
      ⚠ {msg || 'Failed to load data'}
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────
export function ProgressBar({ value, max=1, color='bg-cyan-500', label, sub }) {
  const pct = Math.min(100, (value/max)*100)
  return (
    <div className="space-y-1">
      {(label || sub) && (
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">{label}</span>
          <span className="text-slate-300 font-semibold">{sub}</span>
        </div>
      )}
      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`}
             style={{ width:`${pct}%` }} />
      </div>
    </div>
  )
}

// ── Mini area spark ────────────────────────────────────────────────────────
export function SparkArea({ data, color='#2DD4BF', height=60 }) {
  const chartData = (data||[]).map((v,i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top:2, right:2, left:2, bottom:2 }}>
        <defs>
          <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
              fill={`url(#sg-${color.replace('#','')})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Line chart wrapper ────────────────────────────────────────────────────
export function LineChartCard({ data, lines, height=220, title }) {
  return (
    <div className="card">
      {title && <div className="section-title">{title}</div>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top:4, right:8, left:-20, bottom:4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
          <XAxis dataKey="name" tick={{ fill:'#64748B', fontSize:10 }} />
          <YAxis tick={{ fill:'#64748B', fontSize:10 }} />
          <Tooltip contentStyle={{ background:'#161B22', border:'1px solid #30363D',
                                   borderRadius:8, fontSize:11 }} />
          <Legend wrapperStyle={{ fontSize:11, color:'#94A3B8' }} />
          {lines.map(l => (
            <Line key={l.key} type="monotone" dataKey={l.key}
                  name={l.name} stroke={l.color} strokeWidth={2}
                  dot={false} activeDot={{ r:4 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Bar chart wrapper ─────────────────────────────────────────────────────
export function BarChartCard({ data, bars, height=220, title, xKey='name' }) {
  return (
    <div className="card">
      {title && <div className="section-title">{title}</div>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top:4, right:8, left:-20, bottom:4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
          <XAxis dataKey={xKey} tick={{ fill:'#64748B', fontSize:10 }} />
          <YAxis tick={{ fill:'#64748B', fontSize:10 }} />
          <Tooltip contentStyle={{ background:'#161B22', border:'1px solid #30363D',
                                   borderRadius:8, fontSize:11 }} />
          <Legend wrapperStyle={{ fontSize:11, color:'#94A3B8' }} />
          {bars.map(b => (
            <Bar key={b.key} dataKey={b.key} name={b.name}
                 fill={b.color} radius={[3,3,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
