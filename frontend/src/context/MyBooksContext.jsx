import { createContext, useContext, useState, useEffect } from 'react'

const MyBooksContext = createContext()

const STORAGE_KEY = 'nextread_mybooks'

export const READING_STATUS = {
  WANT_TO_READ: 'want_to_read',
  CURRENTLY_READING: 'currently_reading',
  FINISHED: 'finished'
}

export function MyBooksProvider({ children }) {
  const [myBooks, setMyBooks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(myBooks))
  }, [myBooks])

  const addBook = (book, status = READING_STATUS.WANT_TO_READ) => {
    setMyBooks(prev => {
      if (prev.some(b => b.key === book.key)) return prev
      return [...prev, { ...book, status, addedAt: Date.now() }]
    })
  }

  const removeBook = (bookKey) => {
    setMyBooks(prev => prev.filter(b => b.key !== bookKey))
  }

  const updateStatus = (bookKey, status) => {
    setMyBooks(prev => prev.map(b =>
      b.key === bookKey ? { ...b, status } : b
    ))
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
      getBooksByStatus
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
