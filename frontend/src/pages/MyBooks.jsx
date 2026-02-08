import { useState } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import BookCard from '../components/BookCard'
import { useMyBooks, READING_STATUS } from '../context/MyBooksContext'

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

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const STATUS_CONFIG = {
  [READING_STATUS.CURRENTLY_READING]: { label: 'Currently Reading', Icon: BookOpenIcon },
  [READING_STATUS.WANT_TO_READ]: { label: 'Want to Read', Icon: ClockIcon },
  [READING_STATUS.FINISHED]: { label: 'Finished', Icon: CheckCircleIcon }
}

function MyBooks() {
  const { getBooksByStatus, updateStatus, removeBook } = useMyBooks()
  const [activeTab, setActiveTab] = useState(READING_STATUS.CURRENTLY_READING)

  const books = getBooksByStatus(activeTab)
  const otherStatuses = Object.keys(STATUS_CONFIG).filter(key => key !== activeTab)

  return (
    <div className="min-h-screen bg-[--cream]">
      <NavBar />

      <main className="container-main py-12">
        <h1 className="text-3xl font-bold text-[--navy] mb-8">My Books</h1>

        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab(READING_STATUS.CURRENTLY_READING)}
            className={`genre-pill flex items-center gap-2 ${activeTab === READING_STATUS.CURRENTLY_READING ? 'active' : ''}`}
          >
            <BookOpenIcon /> Currently Reading
          </button>
          <button
            onClick={() => setActiveTab(READING_STATUS.WANT_TO_READ)}
            className={`genre-pill flex items-center gap-2 ${activeTab === READING_STATUS.WANT_TO_READ ? 'active' : ''}`}
          >
            <ClockIcon /> Want to Read
          </button>
          <button
            onClick={() => setActiveTab(READING_STATUS.FINISHED)}
            className={`genre-pill flex items-center gap-2 ${activeTab === READING_STATUS.FINISHED ? 'active' : ''}`}
          >
            <CheckCircleIcon /> Finished
          </button>
        </div>

        {books.length === 0 ? (
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
            {books.map((book) => (
              <div key={book.key} className="group relative">
                <BookCard book={book} showBadge={false} onClick={() => {}} />
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
