import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}')
}

function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users))
}

function getEntries() {
  return JSON.parse(localStorage.getItem('entries') || '[]')
}

function addEntry(entry) {
  const entries = getEntries()
  entries.push(entry)
  localStorage.setItem('entries', JSON.stringify(entries))
}

function seedDemoData() {
  // Seed users
  const users = getUsers();
  const demoUsers = {
    admin: { password: 'admin' },
    alice: { password: 'alice123' },
    bob: { password: 'bob123' },
    charlie: { password: 'charlie123' },
    dave: { password: 'dave123' },
    eve: { password: 'eve123' },
    frank: { password: 'frank123' },
    grace: { password: 'grace123' },
    heidi: { password: 'heidi123' },
    ivan: { password: 'ivan123' },
    judy: { password: 'judy123' },
    mallory: { password: 'mallory123' },
    oscar: { password: 'oscar123' },
    peggy: { password: 'peggy123' },
    sybil: { password: 'sybil123' },
    trent: { password: 'trent123' },
    victor: { password: 'victor123' },
    wendy: { password: 'wendy123' },
  };
  let changed = false;
  for (const [u, v] of Object.entries(demoUsers)) {
    if (!users[u]) {
      users[u] = v;
      changed = true;
    }
  }
  if (changed) setUsers(users);

  // Seed entries for next 3 days
  const today = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const dates = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  // Generate more entries per date
  const userList = Object.keys(demoUsers);
  let demoEntries = [];
  let idBase = 10000000;
  for (let day = 0; day < dates.length; day++) {
    for (let i = 0; i < userList.length; i++) {
      demoEntries.push({
        username: userList[i],
        golflinkId: (idBase + i + day * 100).toString(),
        date: dates[day],
      });
    }
  }
  
  const existingEntries = getEntries();
  // If entries are missing or the existing array is empty, seed the demo entries
  if (!localStorage.getItem('entries') || existingEntries.length === 0) {
    localStorage.setItem('entries', JSON.stringify(demoEntries));
  } else {
    // Otherwise, add only new entries if they don't exist (previous logic)
    let entryChanged = false;
    const entries = existingEntries.slice(); // Work on a copy
    for (const entry of demoEntries) {
      if (!entries.some(e => e.username === entry.username && e.golflinkId === entry.golflinkId && e.date === entry.date)) {
        entries.push(entry);
        entryChanged = true;
      }
    }
    if (entryChanged) localStorage.setItem('entries', JSON.stringify(entries));
  }
}

function App() {
  // Auth state
  const [authMode, setAuthMode] = useState('login') // 'login' | 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(localStorage.getItem('loggedInUser') || null)
  const [authError, setAuthError] = useState('')

  // Competition entry state
  const [golflinkId, setGolflinkId] = useState('')
  const [date, setDate] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showWinnersDate, setShowWinnersDate] = useState('');

  const navigate = useNavigate()

  // Auth handlers
  const handleRegister = (e) => {
    e.preventDefault()
    const users = getUsers()
    if (users[username]) {
      setAuthError('Username already exists')
      return
    }
    users[username] = { password }
    setUsers(users)
    setAuthError('')
    setAuthMode('login')
  }

  const handleLogin = (e) => {
    e.preventDefault()
    const users = getUsers()
    if (!users[username] || users[username].password !== password) {
      setAuthError('Invalid username or password')
      return
    }
    setAuthError('')
    setUser(username)
    localStorage.setItem('loggedInUser', username)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('loggedInUser')
    setGolflinkId('')
    setDate('')
    setSubmitted(false)
    setShowWinnersDate('');
    navigate('/')
  }

  // Competition entry handler
  const handleSubmit = (e) => {
    e.preventDefault()
    addEntry({ username: user, golflinkId, date })
    setSubmitted(true)
  }

  // Auth forms
  const authForm = (
    <div className="w-full max-w-md golf-card p-6 md:p-8 flex flex-col items-center shadow-xl mx-auto">
      <h1 className="golf-heading text-3xl mb-4 flex items-center gap-x-2"><span className="golf-ball"></span>{authMode === 'login' ? 'Login' : 'Register'}</h1>
      <form className="w-full flex flex-col gap-y-3" onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
        <div className="bg-green-50/80 p-3 rounded-xl flex flex-col gap-y-1 shadow-sm">
          <label htmlFor="username" className="font-bold text-green-900 text-base">Username</label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-1/2 mx-auto px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-600 text-lg bg-white/90 shadow-inner"
            placeholder="Enter username"
          />
        </div>
        <div className="bg-green-50/80 p-3 rounded-xl flex flex-col gap-y-1 shadow-sm">
          <label htmlFor="password" className="font-bold text-green-900 text-base">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-1/2 mx-auto px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-600 text-lg bg-white/90 shadow-inner"
            placeholder="Enter password"
          />
        </div>
        {authError && <div className="text-red-600 font-semibold rounded bg-red-50/80 px-3 py-2 mb-2 text-center">{authError}</div>}
        <button
          type="submit"
          className="w-1/2 mx-auto golf-btn py-2 text-base mt-2"
        >
          {authMode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
      <div className="mt-4 text-green-700">
        {authMode === 'login' ? (
          <>
            Don't have an account?{' '}
            <button className="underline" onClick={() => { setAuthMode('register'); setAuthError('') }}>Register</button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button className="underline" onClick={() => { setAuthMode('login'); setAuthError('') }}>Login</button>
          </>
        )}
      </div>
    </div>
  )

  // Main app
  useEffect(() => {
    seedDemoData();
  }, []);

  // Winner listing for participants
  const entries = getEntries();
  const entriesByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});
  const allDates = Object.keys(entriesByDate).sort();

  // Winner calculation for selected date
  let winnersSection = null;
  if (showWinnersDate && entriesByDate[showWinnersDate]) {
    // Use the same score logic as admin
    const participants = entriesByDate[showWinnersDate]
      .map(p => ({ ...p, score: Math.floor(Math.random() * 100) + 60 })) // For demo, random score
      .sort((a, b) => (a.score ?? 999) - (b.score ?? 999));
    const numEntrants = participants.length;
    const pool = numEntrants * 5;
    const payoutPool = pool * 0.4;
    const numWinners = Math.max(1, Math.ceil(numEntrants * 0.1));
    const payoutPerWinner = numWinners > 0 ? (payoutPool / numWinners) : 0;
    const winners = participants.slice(0, numWinners);

    // Conditional rendering for admin vs. participant
    const isadmin = user === 'admin';

    winnersSection = (
      <div className="mt-8 w-full">
        <div className="mb-2 font-bold text-green-800">Winners for {showWinnersDate}:</div>
        {/* Payout Info (Visible to Admin) */}
        {isadmin && (
           <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200 text-green-900">
             <div><b>Entrants:</b> {numEntrants}</div>
             <div><b>Total Pool:</b> ${pool.toFixed(2)}</div>
             <div><b>Payout Pool (40%):</b> ${payoutPool.toFixed(2)}</div>
             <div><b>Winners (Top 10%):</b> {numWinners}</div>
             <div><b>Payout per Winner:</b> ${payoutPerWinner.toFixed(2)}</div>
           </div>
         )}
         {/* Simplified Payout Info (Visible to Participants) */}
         {!isadmin && (
           <div className="mb-4 text-green-900">
             Winners: {numWinners}, Payout per Winner: ${payoutPerWinner.toFixed(2)}
           </div>
         )}
        <table className="w-full border border-green-200 rounded-xl mb-4 shadow bg-white/90 text-base">
          <thead>
            <tr className="bg-green-100">
              <th className="py-2 px-4 text-left">Username</th>
              <th className="py-2 px-4 text-left">Golflink ID</th>
              <th className="py-2 px-4 text-left">Score</th>
              <th className="py-2 px-4 text-left">Payout</th>
            </tr>
          </thead>
          <tbody>
            {(isadmin ? participants : winners).map((p, i) => (
              <tr key={p.golflinkId + i} className="border-t border-green-100">
                <td className="py-2 px-4">{p.username}</td>
                <td className="py-2 px-4">{p.golflinkId}</td>
                <td className="py-2 px-4">{p.score ?? 'N/A'}</td>
                {/* Show payout only for winners regardless of user type */}
                <td className="py-2 px-4 golf-gold">{i < numWinners ? `$${payoutPerWinner.toFixed(2)}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-green-500 p-4">
            {!user ? (
              authForm
            ) : (
              <div className="w-full max-w-md golf-card p-6 md:p-8 flex flex-col items-center shadow-xl mx-auto">
                <div className="w-full flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-green-800 font-serif">Welcome, {user}!</h1>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition text-sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
                <h2 className="text-xl text-green-700 mb-2 text-center">Golf Competition Entry</h2>
                <p className="text-green-700 mb-6 text-center">Enter your Golflink ID and the date you want to play!</p>
                {submitted ? (
                  <div className="text-center">
                    <div className="text-2xl text-green-700 font-semibold mb-2">Entry Submitted!</div>
                    <div className="text-green-900">Golflink ID: <span className="font-mono">{golflinkId}</span></div>
                    <div className="text-green-900">Date: <span className="font-mono">{date}</span></div>
                    <button
                      className="mt-6 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition"
                      onClick={() => setSubmitted(false)}
                    >
                      Enter Another
                    </button>
                  </div>
                ) : (
                  <form className="w-full flex flex-col gap-y-3" onSubmit={handleSubmit}>
                    <div className="bg-green-50/80 p-3 rounded-xl flex flex-col gap-y-1 shadow-sm">
                      <label htmlFor="golflinkId" className="font-bold text-green-900 text-base">Golflink ID</label>
                      <input
                        id="golflinkId"
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        value={golflinkId}
                        onChange={e => setGolflinkId(e.target.value)}
                        className="w-1/2 mx-auto px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-600 text-lg bg-white/90 shadow-inner"
                        placeholder="Enter your Golflink ID"
                      />
                    </div>
                    <div className="bg-green-50/80 p-3 rounded-xl flex flex-col gap-y-1 shadow-sm">
                      <label htmlFor="date" className="font-bold text-green-900 text-base">Competition Date</label>
                      <input
                        id="date"
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-1/2 mx-auto px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-600 text-lg bg-white/90 shadow-inner"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-1/2 mx-auto golf-btn py-2 text-base mt-2"
                    >
                      Enter Competition
                    </button>
                  </form>
                )}
                {/* Winners section for participants */}
                <div className="w-full mt-24 pt-6 border-t border-green-200">
                  <label htmlFor="winners-date-select" className="block font-semibold text-green-900 mb-2">View Winners for Competition Date:</label>
                  <select
                    id="winners-date-select"
                    value={showWinnersDate}
                    onChange={e => setShowWinnersDate(e.target.value)}
                    className="w-1/2 mx-auto px-4 py-3 border-2 border-green-200 rounded-xl focus:outline-none focus:border-green-600 text-lg mb-4 bg-white/90 shadow-inner"
                  >
                    <option value="">Select a date...</option>
                    {allDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                  {winnersSection}
                </div>
              </div>
            )}
          </div>
        }
      />
    </Routes>
  )
}

export default App
