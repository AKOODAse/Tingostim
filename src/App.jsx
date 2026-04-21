import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import CapacityView from './components/CapacityView.jsx'
import RentalView from './components/RentalView.jsx'
import TrendingView from './components/TrendingView.jsx'
import LeaderboardView from './components/LeaderboardView.jsx'
import MachineComparison from './components/MachineComparison.jsx'
import StatusBar from './components/StatusBar.jsx'

// ── CONFIG: change these to your real server URLs ──────────────────────────
const FACTORY_SOURCES = [
  { id: 'a', name: 'Factory A', url: 'http://localhost:3001', color: '#00e5a0' },
  { id: 'b', name: 'Factory B', url: 'http://localhost:3002', color: '#4d9fff' },
]
const REFRESH_INTERVAL = 30000 // 30 seconds
// ───────────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView]         = useState('dashboard')
  const [machines, setMachines] = useState([])
  const [trending, setTrending] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [lastSync, setLastSync] = useState(null)
  const [syncStatus, setSyncStatus] = useState({}) // { factoryId: 'ok'|'error'|'loading' }

  const fetchAll = useCallback(async () => {
    const results   = []
    const trendingResults = []
    const leaderboardResults = []

    await Promise.allSettled(
      FACTORY_SOURCES.map(async (factory) => {
        setSyncStatus(s => ({ ...s, [factory.id]: 'loading' }))
        try {
          // Fetch machines, trending, and leaderboard in parallel per factory
          const [machinesRes, trendingRes, leaderboardRes] = await Promise.allSettled([
            fetch(`${factory.url}/machines`),
            fetch(`${factory.url}/trending`),
            fetch(`${factory.url}/leaderboard`),
          ])

          // Machines
          if (machinesRes.status === 'fulfilled' && machinesRes.value.ok) {
            const data = await machinesRes.value.json()
            const list = Array.isArray(data) ? data : (data.machines || [])
            list.forEach(m => results.push({ ...m, _factory: factory }))
          }

          // Trending
          if (trendingRes.status === 'fulfilled' && trendingRes.value.ok) {
            const data = await trendingRes.value.json()
            const list = Array.isArray(data) ? data : []
            trendingResults.push(...list)
          }

          // Leaderboard
          if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.ok) {
            const data = await leaderboardRes.value.json()
            const list = Array.isArray(data) ? data : []
            leaderboardResults.push(...list)
          }

          setSyncStatus(s => ({ ...s, [factory.id]: 'ok' }))
        } catch {
          setSyncStatus(s => ({ ...s, [factory.id]: 'error' }))
        }
      })
    )

    setMachines(results)
    setTrending(trendingResults)
    setLeaderboard(leaderboardResults)
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
        {view === 'dashboard'  && <Dashboard machines={machines} factories={factories} />}
        {view === 'capacity'   && <CapacityView machines={machines} factories={factories} />}
        {view === 'rental'     && <RentalView machines={machines} />}
        {view === 'trending'   && <TrendingView trending={trending} />}
        {view === 'leaderboard' && <LeaderboardView leaderboard={leaderboard} machines={machines} />}
        {view === 'compare'    && <MachineComparison machines={machines} />}
      </main>
    </div>
  )
}
