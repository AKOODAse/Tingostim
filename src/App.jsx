import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header.jsx'
import Dashboard from './components/Dashboard.jsx'
import CapacityView from './components/CapacityView.jsx'
import RentalView from './components/RentalView.jsx'
import TrendingView from './components/TrendingView.jsx'
import LeaderboardView from './components/LeaderboardView.jsx'
import MachineComparison from './components/MachineComparison.jsx'
import LoginScreen from './components/LoginScreen.jsx'
import { fetchTingostim, getSession, logout } from './api.js'

const REFRESH_INTERVAL = 10000

function uniqueFactories(machines) {
  const seen = new Map()
  for (const m of machines) {
    const f = m._factory
    if (f && !seen.has(f.id)) seen.set(f.id, f)
  }
  return Array.from(seen.values())
}

function isAuthed(session) {
  return !!(session && session.uid)
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [view, setView] = useState('dashboard')
  const [machines, setMachines] = useState([])
  const [trending, setTrending] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [factories, setFactories] = useState([])

  useEffect(() => {
    getSession().then((s) => {
      setSession(s)
      setAuthChecked(true)
    })
  }, [])

  const fetchAll = useCallback(async () => {
    const [machinesRes, trendingRes, leaderboardRes] = await Promise.allSettled([
      fetchTingostim('/machines'),
      fetchTingostim('/trending'),
      fetchTingostim('/leaderboard'),
    ])

    let lostAuth = false

    if (machinesRes.status === 'fulfilled') {
      const list = machinesRes.value || []
      setMachines(list)
      setFactories(uniqueFactories(list))
    } else {
      if (machinesRes.reason?.code === 'AUTH') lostAuth = true
      console.warn('[Tingostim] machines fetch failed:', machinesRes.reason?.message)
    }

    if (trendingRes.status === 'fulfilled') {
      setTrending(trendingRes.value || [])
    } else if (trendingRes.reason?.code === 'AUTH') {
      lostAuth = true
    }

    if (leaderboardRes.status === 'fulfilled') {
      setLeaderboard(leaderboardRes.value || [])
    } else if (leaderboardRes.reason?.code === 'AUTH') {
      lostAuth = true
    }

    if (lostAuth) setSession(null)
  }, [])

  useEffect(() => {
    if (!isAuthed(session)) return
    fetchAll()
    const interval = setInterval(fetchAll, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [session, fetchAll])

  async function handleLogout() {
    await logout()
    setSession(null)
    setMachines([])
    setTrending([])
    setLeaderboard([])
    setFactories([])
  }

  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0C',
        color: '#8A8688',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Space Mono, monospace',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>
        Loading…
      </div>
    )
  }

  if (!isAuthed(session)) {
    return <LoginScreen onAuthenticated={setSession} />
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header view={view} setView={setView} session={session} onLogout={handleLogout} />
      <main style={{ flex: 1, padding: '28px 24px', maxWidth: 1440, margin: '0 auto', width: '100%' }}>
        {view === 'dashboard'  && <Dashboard machines={machines} factories={factories} setView={setView} />}
        {view === 'capacity'   && <CapacityView machines={machines} factories={factories} />}
        {view === 'rental'     && <RentalView machines={machines} />}
        {view === 'trending'   && <TrendingView trending={trending} />}
        {view === 'leaderboard' && <LeaderboardView leaderboard={leaderboard} machines={machines} factories={factories} />}
        {view === 'compare'    && <MachineComparison machines={machines} />}
      </main>
    </div>
  )
}
