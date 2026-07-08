import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import BookCard from '../components/BookCard'
import { useMyBooks, READING_STATUS } from '../context/MyBooksContext'
import { usePlaylists } from '../context/PlaylistContext'

const BookOpenIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const TrashIcon = ({ size = 5 }) => (
  <svg className={`w-${size} h-${size}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const ListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8" />
  </svg>
)

const STATUS_CONFIG = {
  [READING_STATUS.CURRENTLY_READING]: { label: 'Currently Reading', Icon: BookOpenIcon },
  [READING_STATUS.WANT_TO_READ]: { label: 'Want to Read', Icon: ClockIcon },
  [READING_STATUS.FINISHED]: { label: 'Finished', Icon: CheckCircleIcon },
}

// Inline playlist picker that opens upward from the overlay
function PlaylistPicker({ book, open, onClose }) {
  const { playlists, createPlaylist, addBookToPlaylist, removeBookFromPlaylist, isInPlaylist } = usePlaylists()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  const handleToggle = async (e, playlistId) => {
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

  if (!open) return null

  return (
    <div
      ref={ref}
      className="absolute bottom-14 left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[10000]"
      onClick={e => e.stopPropagation()}
    >
      <p className="dropdown-label">Save to playlist</p>
      {playlists.length === 0 && !creating && (
        <p className="text-xs text-gray-400 px-3 py-1">No playlists yet</p>
      )}
      {playlists.map(p => {
        const inList = isInPlaylist(p.id, book.key)
        return (
          <button key={p.id} onClick={(e) => handleToggle(e, p.id)} className="dropdown-item">
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
  )
}


function PlaylistsTab() {
  const { playlists, loading, createPlaylist, deletePlaylist, removeBookFromPlaylist } = usePlaylists()
  const { addBook, isInMyBooks } = useMyBooks()
  const [selectedId, setSelectedId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [openPickerFor, setOpenPickerFor] = useState(null)

  const selected = playlists.find(p => p.id === selectedId)

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createPlaylist(newName)
    setNewName('')
    setCreating(false)
  }

  if (selected) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setSelectedId(null)}
            className="back-btn"
          >
            ← All playlists
          </button>
          <button
            onClick={async () => { await deletePlaylist(selected.id); setSelectedId(null) }}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <TrashIcon size={4} /> Delete playlist
          </button>
        </div>

        <div className="flex items-baseline gap-3 mb-6">
          <h2 className="text-xl font-bold text-[--navy]">{selected.name}</h2>
          <span className="text-sm text-gray-400">{selected.books.length} {selected.books.length === 1 ? 'book' : 'books'}</span>
        </div>

        {selected.books.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-1">This playlist is empty</p>
            <p className="text-sm">Use the playlist button on any book card to add books here</p>
          </div>
        ) : (
          <div className="book-grid">
            {selected.books.map(book => (
              <div key={book.key} className="group relative">
                <BookCard
                  book={book}
                  showBadge={false}
                  onClick={() => {}}
                  showAddToLibrary={true}
                  isInLibrary={isInMyBooks(book.key)}
                  onAddToLibrary={addBook}
                />
                <PlaylistPicker
                  book={book}
                  open={openPickerFor === book.key}
                  onClose={() => setOpenPickerFor(null)}
                />
                <div className="book-action-overlay">
                  <div className="relative">
                    <button
                      onClick={() => setOpenPickerFor(openPickerFor === book.key ? null : book.key)}
                      className="icon-btn"
                      title="Add to playlist"
                    >
                      <ListIcon />
                    </button>
                  </div>
                  <button
                    onClick={() => removeBookFromPlaylist(selected.id, book.key)}
                    className="icon-btn icon-btn-danger"
                    title="Remove from playlist"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">Group your books into themed collections</p>
        <button onClick={() => setCreating(true)} className="btn btn-orange rounded-full text-sm">
          + New Playlist
        </button>
      </div>

      {creating && (
        <div className="mb-6 flex gap-2 max-w-sm">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') { setCreating(false); setNewName('') }
            }}
            placeholder="e.g. Summer Reads, Sci-Fi Favourites"
            className="form-input flex-1"
          />
          <button onClick={handleCreate} className="btn btn-orange rounded-xl text-sm">Create</button>
          <button onClick={() => { setCreating(false); setNewName('') }} className="text-sm text-gray-400 hover:text-gray-600 px-2">
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ListIcon />
          </div>
          <p className="text-gray-500 mb-1">No playlists yet</p>
          <p className="text-sm text-gray-400">Create one to start grouping your books</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {playlists.map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className="playlist-card group"
            >
              <div className="grid grid-cols-4 gap-1 mb-3 h-16 rounded-lg overflow-hidden">
                {p.books.slice(0, 4).map((book, i) =>
                  book.coverUrl ? (
                    <img key={i} src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
                  ) : (
                    <div key={i} className="h-full bg-gray-100 flex items-center justify-center p-0.5">
                      <span className="text-[7px] text-gray-400 text-center leading-tight">{book.title}</span>
                    </div>
                  )
                )}
                {Array.from({ length: Math.max(0, 4 - p.books.length) }).map((_, i) => (
                  <div key={`e${i}`} className="h-full bg-gray-50 border border-dashed border-gray-200" />
                ))}
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[--navy]">{p.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{p.books.length} {p.books.length === 1 ? 'book' : 'books'}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deletePlaylist(p.id) }}
                  className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <TrashIcon size={4} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MyBooks() {
  const { getBooksByStatus, updateStatus, removeBook } = useMyBooks()
  const [activeTab, setActiveTab] = useState(READING_STATUS.CURRENTLY_READING)
  const [openPickerFor, setOpenPickerFor] = useState(null)

  const isPlaylistTab = activeTab === 'playlists'
  const books = isPlaylistTab ? [] : getBooksByStatus(activeTab)
  const otherStatuses = Object.keys(STATUS_CONFIG).filter(k => k !== activeTab)

  return (
    <div className="min-h-screen bg-[--cream]">
      <NavBar />

      <main className="container-main py-12">
        <h1 className="text-3xl font-bold text-[--navy] mb-8">My Books</h1>

        <div className="flex gap-3 mb-8 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([status, { label, Icon }]) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`genre-pill flex items-center gap-2 ${activeTab === status ? 'active' : ''}`}
            >
              <Icon /> {label}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('playlists')}
            className={`genre-pill flex items-center gap-2 ${activeTab === 'playlists' ? 'active' : ''}`}
          >
            <ListIcon /> Playlists
          </button>
        </div>

        {isPlaylistTab ? (
          <PlaylistsTab />
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">
              No books in "{STATUS_CONFIG[activeTab].label}" yet
            </p>
            <Link to="/discovery" className="btn btn-orange">
              Discover Books
            </Link>
          </div>
        ) : (
          <div className="book-grid">
            {books.map(book => (
              <div key={book.key} className={`group relative ${openPickerFor === book.key ? 'z-[10000]' : ''}`}>
                <BookCard book={book} showBadge={false} onClick={() => {}} />
                <PlaylistPicker
                  book={book}
                  open={openPickerFor === book.key}
                  onClose={() => setOpenPickerFor(null)}
                />
                <div className="book-action-overlay">
                  {otherStatuses.map(status => {
                    const { label, Icon } = STATUS_CONFIG[status]
                    return (
                      <button
                        key={status}
                        onClick={() => updateStatus(book.key, status)}
                        className="icon-btn"
                        title={`Move to ${label}`}
                      >
                        <Icon />
                      </button>
                    )
                  })}
                  <button
                    onMouseDown={e => e.stopPropagation()}
                    onClick={() => setOpenPickerFor(openPickerFor === book.key ? null : book.key)}
                    className={`icon-btn ${openPickerFor === book.key ? 'bg-[--orange] text-white' : ''}`}
                    title="Add to playlist"
                  >
                    <ListIcon />
                  </button>
                  <button
                    onClick={() => removeBook(book.key)}
                    className="icon-btn icon-btn-danger"
                    title="Remove from library"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default MyBooks
