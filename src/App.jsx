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
    admin: { password: 'adminpass' },
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
  const entries = getEntries();
  let entryChanged = false;
  for (const entry of demoEntries) {
    if (!entries.some(e => e.username === entry.username && e.golflinkId === entry.golflinkId && e.date === entry.date)) {
      entries.push(entry);
      entryChanged = true;
    }
  }
  if (entryChanged) localStorage.setItem('entries', JSON.stringify(entries));
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
    <div className="w-full max-w-md golf-card p-8 flex flex-col items-center">
      <h1 className="golf-heading text-3xl mb-2 text-center font-serif">{authMode === 'login' ? 'Login' : 'Register'}</h1>
      <form className="w-full flex flex-col gap-6" onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
        <div>
          <label htmlFor="username" className="block text-green-900 font-semibold mb-1">Username</label>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600 text-lg"
            placeholder="Enter username"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-green-900 font-semibold mb-1">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600 text-lg"
            placeholder="Enter password"
          />
        </div>
        {authError && <div className="text-red-600 text-center">{authError}</div>}
        <button
          type="submit"
          className="w-full py-3 bg-green-700 text-white font-bold rounded-lg text-lg shadow-md hover:bg-green-800 transition golf-btn"
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
    winnersSection = (
      <div className="mt-8 w-full">
        <div className="mb-2 font-bold text-green-800">Winners for {showWinnersDate}:</div>
        <div className="mb-2 text-green-900">Entrants: {numEntrants}, Pool: ${pool.toFixed(2)}, Payout Pool: ${payoutPool.toFixed(2)}, Winners: {numWinners}, Payout per Winner: ${payoutPerWinner.toFixed(2)}</div>
        <table className="w-full border border-green-200 rounded-lg mb-4">
          <thead>
            <tr className="bg-green-100">
              <th className="py-2 px-4 text-left">Username</th>
              <th className="py-2 px-4 text-left">Golflink ID</th>
              <th className="py-2 px-4 text-left">Score</th>
              <th className="py-2 px-4 text-left">Payout</th>
            </tr>
          </thead>
          <tbody>
            {winners.map((p, i) => (
              <tr key={p.golflinkId + i} className="border-t border-green-100">
                <td className="py-2 px-4">{p.username}</td>
                <td className="py-2 px-4">{p.golflinkId}</td>
                <td className="py-2 px-4">{p.score ?? 'N/A'}</td>
                <td className="py-2 px-4 golf-gold">${payoutPerWinner.toFixed(2)}</td>
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
              <div className="w-full max-w-md golf-card p-8 flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold text-green-800 font-serif">Welcome, {user}!</h1>
                  <div className="flex gap-2">
                    {user === 'admin' && (
                      <Link
                        to="/admin"
                        className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition text-sm"
                      >
                        Admin
                      </Link>
                    )}
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
                  <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div>
                      <label htmlFor="golflinkId" className="block text-green-900 font-semibold mb-1">Golflink ID</label>
                      <input
                        id="golflinkId"
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        value={golflinkId}
                        onChange={e => setGolflinkId(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600 text-lg"
                        placeholder="Enter your Golflink ID"
                      />
                    </div>
                    <div>
                      <label htmlFor="date" className="block text-green-900 font-semibold mb-1">Competition Date</label>
                      <input
                        id="date"
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600 text-lg"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-green-700 text-white font-bold rounded-lg text-lg shadow-md hover:bg-green-800 transition golf-btn"
                    >
                      Enter Competition
                    </button>
                  </form>
                )}
                {/* Winners section for participants */}
                <div className="w-full mt-8">
                  <label htmlFor="winners-date-select" className="block font-semibold text-green-900 mb-2">View Winners for Competition Date:</label>
                  <select
                    id="winners-date-select"
                    value={showWinnersDate}
                    onChange={e => setShowWinnersDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600 text-lg mb-4"
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
      <Route path="/admin" element={<AdminPage user={user} />} />
    </Routes>
  )
}

function AdminPage({ user }) {
  const [entries, setEntries] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (user !== 'admin') return;
    const allEntries = getEntries();
    setEntries(allEntries);
    // Fetch scores for each Golflink ID
    async function fetchScores() {
      const newScores = {};
      for (const entry of allEntries) {
        // Replace this with the real API call to www.golf.org.au
        // Example: const res = await fetch(`https://www.golf.org.au/api/score/${entry.golflinkId}`)
        // const data = await res.json();
        // newScores[entry.golflinkId] = data.score;
        // For demo, use a random score:
        newScores[entry.golflinkId] = Math.floor(Math.random() * 100) + 60;
      }
      setScores(newScores);
      setLoading(false);
    }
    fetchScores();
  }, [user]);

  if (user !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-green-500 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Access Denied</h2>
          <p className="text-green-900">You must be logged in as <b>admin</b> to view this page.</p>
          <Link to="/" className="text-green-700 underline mt-4 block">Go Home</Link>
        </div>
      </div>
    );
  }

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});
  const allDates = Object.keys(entriesByDate).sort();

  // Set default selected date
  useEffect(() => {
    if (allDates.length > 0 && !selectedDate) {
      setSelectedDate(allDates[0]);
    }
  }, [allDates, selectedDate]);

  // Payout calculation
  let payoutInfo = null;
  if (selectedDate && entriesByDate[selectedDate]) {
    const participants = entriesByDate[selectedDate].map(p => ({ ...p, score: scores[p.golflinkId] })).sort((a, b) => (a.score ?? 999) - (b.score ?? 999));
    const numEntrants = participants.length;
    const pool = numEntrants * 5;
    const payoutPool = pool * 0.4;
    const numWinners = Math.max(1, Math.ceil(numEntrants * 0.1));
    const payoutPerWinner = numWinners > 0 ? (payoutPool / numWinners) : 0;
    payoutInfo = (
      <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200 text-green-900">
        <div><b>Entrants:</b> {numEntrants}</div>
        <div><b>Total Pool:</b> ${pool.toFixed(2)}</div>
        <div><b>Payout Pool (40%):</b> ${payoutPool.toFixed(2)}</div>
        <div><b>Winners (Top 10%):</b> {numWinners}</div>
        <div><b>Payout per Winner:</b> ${payoutPerWinner.toFixed(2)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-green-500 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-800 mb-6 text-center font-serif">Competition Participants</h1>
        {loading ? (
          <div className="text-center text-green-700">Loading scores...</div>
        ) : allDates.length === 0 ? (
          <div className="text-center text-green-700">No entries yet.</div>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-2">
              <label htmlFor="date-select" className="font-semibold text-green-900">Select Competition Date:</label>
              <select
                id="date-select"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-600 text-lg"
              >
                {allDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
            {payoutInfo}
            {selectedDate && entriesByDate[selectedDate] && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-green-700 mb-2">Date: {selectedDate}</h2>
                <table className="w-full border border-green-200 rounded-lg mb-4">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="py-2 px-4 text-left">Username</th>
                      <th className="py-2 px-4 text-left">Golflink ID</th>
                      <th className="py-2 px-4 text-left">Score</th>
                      <th className="py-2 px-4 text-left">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      if (!selectedDate) return null;
                      const participants = entriesByDate[selectedDate]
                        .map(p => ({ ...p, score: scores[p.golflinkId] }))
                        .sort((a, b) => (a.score ?? 999) - (b.score ?? 999));
                      const numEntrants = participants.length;
                      const numWinners = Math.max(1, Math.ceil(numEntrants * 0.1));
                      return participants.map((p, i) => (
                        <tr key={p.golflinkId + i} className="border-t border-green-100">
                          <td className="py-2 px-4">{p.username}</td>
                          <td className="py-2 px-4">{p.golflinkId}</td>
                          <td className="py-2 px-4">{p.score ?? 'N/A'}</td>
                          <td className="py-2 px-4 golf-gold">${payoutPerWinner.toFixed(2)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
        <div className="text-center mt-4">
          <Link to="/" className="text-green-700 underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default App
