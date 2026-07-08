import { createContext, useContext, useState, useEffect } from 'react'
import { collection, doc, addDoc, deleteDoc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const PlaylistContext = createContext()

export function PlaylistProvider({ children }) {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setPlaylists([])
      setLoading(false)
      return
    }

    const ref = collection(db, 'users', user.uid, 'playlists')
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      data.sort((a, b) => b.createdAt - a.createdAt)
      setPlaylists(data)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const createPlaylist = async (name) => {
    if (!user || !name.trim()) return
    await addDoc(collection(db, 'users', user.uid, 'playlists'), {
      name: name.trim(),
      books: [],
      createdAt: Date.now(),
    })
  }

  const deletePlaylist = async (playlistId) => {
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'playlists', playlistId))
  }

  const renamePlaylist = async (playlistId, name) => {
    if (!user || !name.trim()) return
    await updateDoc(doc(db, 'users', user.uid, 'playlists', playlistId), { name: name.trim() })
  }

  const addBookToPlaylist = async (playlistId, book) => {
    if (!user) return
    const playlist = playlists.find(p => p.id === playlistId)
    if (!playlist) return
    if (playlist.books.some(b => b.key === book.key)) return
    const bookData = {
      key: book.key,
      title: book.title,
      author: book.author || 'Unknown',
      coverUrl: book.coverUrl || null,
    }
    await updateDoc(doc(db, 'users', user.uid, 'playlists', playlistId), {
      books: arrayUnion(bookData),
    })
  }

  const removeBookFromPlaylist = async (playlistId, bookKey) => {
    if (!user) return
    const playlist = playlists.find(p => p.id === playlistId)
    if (!playlist) return
    await updateDoc(doc(db, 'users', user.uid, 'playlists', playlistId), {
      books: playlist.books.filter(b => b.key !== bookKey),
    })
  }

  const isInPlaylist = (playlistId, bookKey) => {
    const playlist = playlists.find(p => p.id === playlistId)
    return playlist ? playlist.books.some(b => b.key === bookKey) : false
  }

  return (
    <PlaylistContext.Provider value={{
      playlists,
      loading,
      createPlaylist,
      deletePlaylist,
      renamePlaylist,
      addBookToPlaylist,
      removeBookFromPlaylist,
      isInPlaylist,
    }}>
      {children}
    </PlaylistContext.Provider>
  )
}

export function usePlaylists() {
  const context = useContext(PlaylistContext)
  if (!context) throw new Error('usePlaylists must be used within a PlaylistProvider')
  return context
}
