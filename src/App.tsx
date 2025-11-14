import { useState, useEffect } from 'react'
import PullRequestList from './components/PullRequestList'
import FilterControl from './components/FilterControl'

const STORAGE_KEY = 'pr-dashboard-days-filter'
const DEFAULT_DAYS = 14

function App() {
  const [username] = useState('shaned-ping')

  // Load filter preference from localStorage, default to 14 days
  const [days, setDays] = useState<number | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) return DEFAULT_DAYS
    if (stored === 'null') return null
    const parsed = parseInt(stored, 10)
    return isNaN(parsed) ? DEFAULT_DAYS : parsed
  })

  // Persist filter preference to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, days === null ? 'null' : days.toString())
  }, [days])

  return (
    <div className="app">
      <header className="header">
        <h1>Pull Request Dashboard</h1>
        <div className="header-info">
          <p className="subtitle">User: {username}</p>
          <FilterControl days={days} onChange={setDays} />
        </div>
      </header>
      <main className="main">
        <PullRequestList username={username} days={days} />
      </main>
    </div>
  )
}

export default App
