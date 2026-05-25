import { createContext, useContext, useState, useEffect } from 'react'
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, addDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const MyBooksContext = createContext()

const STORAGE_KEY = 'nextread_mybooks'

export const READING_STATUS = {
  WANT_TO_READ: 'want_to_read',
  CURRENTLY_READING: 'currently_reading',
  FINISHED: 'finished'
}

const toDocId = (key) => key.replace(/\//g, '_')

export function MyBooksProvider({ children }) {
  const { user } = useAuth()
  const [myBooks, setMyBooks] = useState([])
  const [loading, setLoading] = useState(true)

  //Subscribe to Firestore when logged in, fall back to localStorage when not
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem(STORAGE_KEY)
      setMyBooks(saved ? JSON.parse(saved) : [])
      setLoading(false)
      return
    }

    const booksRef = collection(db, 'users', user.uid, 'books')
    const unsubscribe = onSnapshot(booksRef, (snapshot) => {
      const books = snapshot.docs.map(d => d.data())
      setMyBooks(books)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  //Persist to localStorage only when not authenticated
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(myBooks))
    }
  }, [myBooks, user])

  //Migrate localStorage books to Firestore on first login
  useEffect(() => {
    if (!user) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    const localBooks = JSON.parse(saved)
    if (localBooks.length === 0) return

    Promise.all(localBooks.map(book =>
      setDoc(doc(db, 'users', user.uid, 'books', toDocId(book.key)), book)
    )).then(() => {
      localStorage.removeItem(STORAGE_KEY)
    })
  }, [user])

  const writeActivity = async (book, action) => {
    if (!user) return
    await addDoc(collection(db, 'activity'), {
      userId: user.uid,
      userName: user.displayName || user.email.split('@')[0],
      action,
      book: {
        key: book.key,
        title: book.title,
        author: book.author || 'Unknown',
        coverUrl: book.coverUrl || null,
      },
      timestamp: Date.now(),
    })
  }

  const addBook = async (book, status = READING_STATUS.WANT_TO_READ) => {
    if (myBooks.some(b => b.key === book.key)) return

    const bookData = { ...book, status, addedAt: Date.now() }

    if (user) {
      await setDoc(doc(db, 'users', user.uid, 'books', toDocId(book.key)), bookData)
      await writeActivity(book, status)
    } else {
      setMyBooks(prev => [...prev, bookData])
    }
  }

  const removeBook = async (bookKey) => {
    if (user) {
      await deleteDoc(doc(db, 'users', user.uid, 'books', toDocId(bookKey)))
    } else {
      setMyBooks(prev => prev.filter(b => b.key !== bookKey))
    }
  }

  const updateStatus = async (bookKey, status) => {
    if (user) {
      await updateDoc(doc(db, 'users', user.uid, 'books', toDocId(bookKey)), { status })
      const book = myBooks.find(b => b.key === bookKey)
      if (book) await writeActivity(book, status)
    } else {
      setMyBooks(prev => prev.map(b =>
        b.key === bookKey ? { ...b, status } : b
      ))
    }
  }

  const isInMyBooks = (bookKey) => myBooks.some(b => b.key === bookKey)

  const getBooksByStatus = (status) => myBooks.filter(b => b.status === status)

  return (
    <MyBooksContext.Provider value={{
      myBooks,
      addBook,
      removeBook,
      updateStatus,
      isInMyBooks,
      getBooksByStatus,
      loading
    }}>
      {children}
    </MyBooksContext.Provider>
  )
}

export function useMyBooks() {
  const context = useContext(MyBooksContext)
  if (!context) {
    throw new Error('useMyBooks must be used within a MyBooksProvider')
  }
  return context
}
