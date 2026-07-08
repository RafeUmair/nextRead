import { useState } from 'react'
import NavBar from '../components/NavBar'
import BookCard from '../components/BookCard'
import { usePlaylists } from '../context/PlaylistContext'
import { useMyBooks } from '../context/MyBooksContext'

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

function PlaylistDetail({ playlist, onBack }) {
  const { removeBookFromPlaylist, deletePlaylist } = usePlaylists()
  const { addBook, isInMyBooks } = useMyBooks()

  const handleDelete = async () => {
    await deletePlaylist(playlist.id)
    onBack()
  }

  return (
    <div className="min-h-screen bg-[--cream]">
      <NavBar />
      <main className="container-main py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[--navy] hover:text-[--orange] transition-colors mb-6"
        >
          ← Back to playlists
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[--navy]">{playlist.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{playlist.books.length} {playlist.books.length === 1 ? 'book' : 'books'}</p>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <TrashIcon /> Delete playlist
          </button>
        </div>

        {playlist.books.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="mb-1">This playlist is empty</p>
            <p className="text-sm">Add books from the Discovery page, AI chat, or any book card</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {playlist.books.map(book => (
              <div key={book.key} className="relative group/card">
                <BookCard
                  book={book}
                  showBadge={false}
                  onClick={() => {}}
                  showAddToLibrary={true}
                  isInLibrary={isInMyBooks(book.key)}
                  onAddToLibrary={addBook}
                />
                <button
                  onClick={() => removeBookFromPlaylist(playlist.id, book.key)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-lg leading-none opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center"
                  title="Remove from playlist"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Playlists() {
  const { playlists, loading, createPlaylist } = usePlaylists()
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const activePlaylist = playlists.find(p => p.id === selected)

  if (activePlaylist) {
    return <PlaylistDetail playlist={activePlaylist} onBack={() => setSelected(null)} />
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createPlaylist(newName)
    setNewName('')
    setCreating(false)
  }

  return (
    <div className="min-h-screen bg-[--cream]">
      <NavBar />
      <main className="container-main py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[--navy]">My Playlists</h1>
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
              placeholder="e.g. Summer Reads"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[--orange] bg-white"
            />
            <button onClick={handleCreate} className="btn btn-orange rounded-xl text-sm">Create</button>
            <button onClick={() => { setCreating(false); setNewName('') }} className="text-sm text-gray-400 hover:text-gray-600 px-3">
              Cancel
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-36 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h8" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium mb-1">No playlists yet</p>
            <p className="text-sm text-gray-300">Group your favourite books into themed collections</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playlists.map(p => (
              <PlaylistCard key={p.id} playlist={p} onOpen={() => setSelected(p.id)} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function PlaylistCard({ playlist, onOpen }) {
  const { deletePlaylist } = usePlaylists()

  return (
    <div
      onClick={onOpen}
      className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-[--orange]/30 group"
    >
      <div className="grid grid-cols-4 gap-1 mb-3 h-16 rounded-lg overflow-hidden">
        {playlist.books.slice(0, 4).map((book, i) =>
          book.coverUrl ? (
            <img key={i} src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
          ) : (
            <div key={i} className="h-full bg-gray-100 flex items-center justify-center p-0.5">
              <span className="text-[7px] text-gray-400 text-center leading-tight">{book.title}</span>
            </div>
          )
        )}
        {Array.from({ length: Math.max(0, 4 - playlist.books.length) }).map((_, i) => (
          <div key={`e${i}`} className="h-full bg-gray-50 border border-dashed border-gray-200" />
        ))}
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-[--navy]">{playlist.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {playlist.books.length} {playlist.books.length === 1 ? 'book' : 'books'}
          </p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); deletePlaylist(playlist.id) }}
          className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}

export default Playlists
