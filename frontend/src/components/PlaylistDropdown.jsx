import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlaylists } from '../context/PlaylistContext'
import { useAuth } from '../context/AuthContext'

const ListIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8" />
  </svg>
)

function PlaylistDropdown({ book }) {
  const { user } = useAuth()
  const { playlists, createPlaylist, addBookToPlaylist, removeBookFromPlaylist, isInPlaylist } = usePlaylists()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setCreating(false)
        setNewName('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleToggleOpen = (e) => {
    e.stopPropagation()
    if (!user) { navigate('/login'); return }
    setOpen(v => !v)
  }

  const handleTogglePlaylist = async (e, playlistId) => {
    e.stopPropagation()
    if (isInPlaylist(playlistId, book.key)) {
      await removeBookFromPlaylist(playlistId, book.key)
    } else {
      await addBookToPlaylist(playlistId, book)
    }
  }

  const handleCreate = async (e) => {
    e.stopPropagation()
    if (!newName.trim()) return
    await createPlaylist(newName)
    setNewName('')
    setCreating(false)
  }

  return (
    <div ref={ref} className="absolute top-8 left-1 z-20" onClick={e => e.stopPropagation()}>
      <button
        onClick={handleToggleOpen}
        className="w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-white transition-colors text-[--navy]"
        title="Save to playlist"
      >
        <ListIcon />
      </button>

      {open && (
        <div className="absolute top-8 left-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
          <p className="dropdown-label">Save to playlist</p>

          {playlists.length === 0 && !creating && (
            <p className="text-xs text-gray-400 px-3 py-1">No playlists yet</p>
          )}

          {playlists.map(p => {
            const inList = isInPlaylist(p.id, book.key)
            return (
              <button key={p.id} onClick={(e) => handleTogglePlaylist(e, p.id)} className="dropdown-item">
                <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${inList ? 'bg-[--orange] border-[--orange]' : 'border-gray-300'}`}>
                  {inList && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span className="truncate">{p.name}</span>
              </button>
            )
          })}

          <div className="border-t border-gray-100 mt-1 pt-1">
            {creating ? (
              <div className="px-2 pb-1.5 flex gap-1" onClick={e => e.stopPropagation()}>
                <input
                  autoFocus
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreate(e)
                    if (e.key === 'Escape') { setCreating(false); setNewName('') }
                  }}
                  placeholder="Playlist name"
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-[--orange]"
                />
                <button onClick={handleCreate} className="text-xs bg-[--orange] text-white rounded-lg px-2 py-1 font-medium">
                  Add
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setCreating(true) }}
                className="dropdown-item text-orange font-medium text-xs"
              >
                + New playlist
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaylistDropdown
