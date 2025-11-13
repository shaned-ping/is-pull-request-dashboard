import { useState } from 'react'
import PullRequestList from './components/PullRequestList'

function App() {
  const [teamName] = useState('is-ping-core')

  return (
    <div className="app">
      <header className="header">
        <h1>Pull Request Dashboard</h1>
        <p className="subtitle">Team: {teamName}</p>
      </header>
      <main className="main">
        <PullRequestList teamName={teamName} />
      </main>
    </div>
  )
}

export default App
