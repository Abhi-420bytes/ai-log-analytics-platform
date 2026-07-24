// src/App.jsx
import { useState } from 'react'
import Sidebar    from './components/Sidebar'
import TopBar     from './components/TopBar'
import Overview   from './pages/Overview'
import LiveStream from './pages/LiveStream'
import Anomalies  from './pages/Anomalies'
import Models     from './pages/Models'
import GraphCorr  from './pages/GraphCorr'
import DriftPage  from './pages/DriftPage'
import XAIPage    from './pages/XAIPage'
import Cluster    from './pages/Cluster'
import './index.css'

const PAGES = {
  overview:  <Overview  />,
  live:      <LiveStream />,
  anomalies: <Anomalies />,
  models:    <Models    />,
  graph:     <GraphCorr />,
  drift:     <DriftPage />,
  xai:       <XAIPage   />,
  cluster:   <Cluster   />,
}

export default function App() {
  const [page, setPage] = useState('overview')

  return (
    <div className="flex h-screen bg-dark-950 text-slate-200 overflow-hidden">
      <Sidebar page={page} setPage={setPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar page={page} />
        <main className="flex-1 overflow-y-auto p-6">
          {PAGES[page]}
        </main>
      </div>
    </div>
  )
}
