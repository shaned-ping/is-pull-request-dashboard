import { useState } from 'react'
import PullRequestList from './components/PullRequestList'

function App() {
  const [username] = useState('shaned-ping')

  return (
    <div className="app">
      <header className="header">
        <h1>Pull Request Dashboard</h1>
        <p className="subtitle">User: {username}</p>
      </header>
      <main className="main">
        <PullRequestList username={username} />
      </main>
    </div>
  )
}

export default App
