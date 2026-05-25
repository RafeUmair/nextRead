import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import NavBar from '../components/NavBar'

const ACTION_TEXT = {
  want_to_read: 'wants to read',
  currently_reading: 'started reading',
  finished: 'finished reading',
}

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString()
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

const AVATAR_COLORS = ['#E86F2C', '#1E3A5F', '#7C3AED', '#059669', '#DC2626', '#2563EB', '#D97706']

function avatarColor(name = '') {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function ActivityCard({ event }) {
  const actionText = ACTION_TEXT[event.action] || event.action

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4 max-w-xl">
      <div
        className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold tracking-wide"
        style={{ backgroundColor: avatarColor(event.userName) }}
      >
        {getInitials(event.userName)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm mb-2">
          <span className="font-bold text-[--navy]">{event.userName}</span>
          {' '}<span style={{ color: 'var(--text-gray)' }}>{actionText}</span>
        </p>

        <div className="flex items-center gap-3 bg-[--cream] rounded-lg px-3 py-2 mb-2">
          {event.book.coverUrl ? (
            <img
              src={event.book.coverUrl}
              alt={event.book.title}
              className="w-9 h-14 object-cover rounded flex-shrink-0 shadow-sm"
            />
          ) : (
            <div className="w-9 h-14 rounded flex-shrink-0 bg-gray-200" />
          )}
          <div className="min-w-0">
            <p className="book-title">{event.book.title}</p>
            <p className="book-author">{event.book.author}</p>
          </div>
        </div>

        <p className="text-[11px] text-gray-400">{timeAgo(event.timestamp)}</p>
      </div>
    </div>
  )
}

function Community() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'activity'), orderBy('timestamp', 'desc'), limit(30))
    return onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-[--cream]">
      <NavBar />
      <main className="container-main py-12">
        <h1 className="text-3xl font-bold text-[--navy]">Community</h1>
        <p className="mt-1 mb-8" style={{ color: 'var(--text-gray)' }}>
          See what readers around the world are exploring
        </p>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="spinner spinner-lg" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-lg font-medium mb-2 text-[--navy]">No activity yet</p>
            <p style={{ color: 'var(--text-gray)' }}>Be the first — add a book to your library.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {events.map(event => <ActivityCard key={event.id} event={event} />)}
          </div>
        )}
      </main>
    </div>
  )
}

export default Community
