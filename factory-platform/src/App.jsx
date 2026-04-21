import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import CapacityView from './components/CapacityView.jsx'
import RentalView from './components/RentalView.jsx'
import StatusBar from './components/StatusBar.jsx'

// ── CONFIG: change these to your real server URLs ──────────────────────────
const FACTORY_SOURCES = [
  { id: 'a', name: 'Factory A', url: 'http://localhost:3001/machines', color: '#00e5a0' },
  { id: 'b', name: 'Factory B', url: 'http://localhost:3002/machines', color: '#4d9fff' },
]
const REFRESH_INTERVAL = 30000 // 30 seconds
// ───────────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView]         = useState('dashboard')
  const [machines, setMachines] = useState([])
  const [lastSync, setLastSync] = useState(null)
  const [syncStatus, setSyncStatus] = useState({}) // { factoryId: 'ok'|'error'|'loading' }

  const fetchAll = useCallback(async () => {
    const statusMap = {}
    const results   = []

    await Promise.allSettled(
      FACTORY_SOURCES.map(async (factory) => {
        statusMap[factory.id] = 'loading'
        setSyncStatus(s => ({ ...s, [factory.id]: 'loading' }))
        try {
          const res  = await fetch(factory.url)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          // json-server returns array; handle both array and {machines:[]}
          const list = Array.isArray(data) ? data : (data.machines || [])
          list.forEach(m => results.push({ ...m, _factory: factory }))
          statusMap[factory.id] = 'ok'
          setSyncStatus(s => ({ ...s, [factory.id]: 'ok' }))
        } catch {
          statusMap[factory.id] = 'error'
          setSyncStatus(s => ({ ...s, [factory.id]: 'error' }))
        }
      })
    )

    setMachines(results)
    setLastSync(new Date())
  }, [])

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchAll])

  const factories = FACTORY_SOURCES

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header view={view} setView={setView} />
      <StatusBar
        factories={factories}
        syncStatus={syncStatus}
        lastSync={lastSync}
        onRefresh={fetchAll}
      />
      <main style={{ flex: 1, padding: '24px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {view === 'dashboard' && <Dashboard machines={machines} factories={factories} />}
        {view === 'capacity'  && <CapacityView machines={machines} factories={factories} />}
        {view === 'rental'    && <RentalView machines={machines} />}
      </main>
    </div>
  )
}
