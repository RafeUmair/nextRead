import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import BookCard from '../components/BookCard'
import { useMyBooks } from '../context/MyBooksContext'
import { useAuth } from '../context/AuthContext'

const GENRES = ['Fiction', 'Non-Fiction', 'Fantasy', 'Horror', 'Romance', 'Science Fiction', 'Literature', 'Biography']

const ArrowIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
)

const ChevronIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const SparkleIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l1.8 7.2L21 12l-7.2 1.8L12 22l-1.8-7.2L3 12l7.2-1.8z" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

function Discovery() {
  const { addBook, isInMyBooks } = useMyBooks()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [popularBooks, setPopularBooks] = useState([])
  const [selectedBooks, setSelectedBooks] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingPopular, setLoadingPopular] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const recommendationsRef = useRef(null)

  const showPanel = selectedBooks.length > 0
  const isBookSelected = (book) => selectedBooks.some(b => b.key === book.key)

  useEffect(() => {
    setPage(0)
    fetchPopularBooks(selectedGenres, 0, true)
  }, [selectedGenres])

  const fetchPopularBooks = async (genres, pageNum, replace = false) => {
    replace ? setLoadingPopular(true) : setLoadingMore(true)
    try {
      const genreParams = genres.length ? `&genres=${genres.map(g => encodeURIComponent(g)).join('&genres=')}` : ''
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/popular?page=${pageNum}${genreParams}`)
      const data = await response.json()
      if (replace) {
        setPopularBooks(data)
      } else {
        setPopularBooks(prev => {
          const existingKeys = new Set(prev.map(b => b.key))
          return [...prev, ...data.filter(b => !existingKeys.has(b.key))]
        })
      }
    } catch (error) {
      console.error('Failed to fetch popular books:', error)
    }
    setLoadingPopular(false)
    setLoadingMore(false)
  }

  const searchBooks = async () => {
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(searchQuery)}&limit=12`)
      setSearchResults(await response.json())
    } catch (error) {
      console.error('Search failed:', error)
    }
    setSearchLoading(false)
  }

  const toggleBook = (book) => {
    setSelectedBooks(prev =>
      prev.some(b => b.key === book.key)
        ? prev.filter(b => b.key !== book.key)
        : [...prev, book]
    )
  }

  const toggleGenre = (genre) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? [] : [genre]
    )
  }

  const getRecommendations = async () => {
    if (selectedBooks.length === 0) return
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          books: selectedBooks.map(b => `${b.title}${b.author ? ' by ' + b.author : ''}`),
          genres: []
        })
      })
      setRecommendations(await response.json())
      setTimeout(() => recommendationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (error) {
      console.error('Failed to get recommendations:', error)
    }
    setLoading(false)
  }

  const handleAddToLibrary = (book) => {
    if (!user) {
      navigate('/login?redirect=/discovery')
      return
    }
    addBook(book)
  }

  const clearSearch = () => {
    setShowSearch(false)
    setSearchResults([])
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-[--cream]">
      <NavBar />

      {/*Search/Title Section*/}
      <div className="relative overflow-hidden bg-[--navy] text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-[--navy] to-indigo-900 opacity-90" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-10 w-48 h-48 bg-[--orange] rounded-full blur-3xl" />
          <div className="absolute bottom-4 right-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
        </div>
        <div className="relative container-main py-8 text-center">
          <h1 className="text-3xl font-bold mb-2">What should you read next?</h1>
          <p className="text-base text-gray-300 max-w-xl mx-auto mb-6">
            Pick books you love and we'll find your perfect next read
          </p>
          <div className="max-w-xl mx-auto flex gap-2">
            <input
              type="text"
              placeholder="Search for a book you've read..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
              onFocus={() => setShowSearch(true)}
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 outline-none focus:ring-2 focus:ring-[--orange]"
            />
            <button onClick={searchBooks} disabled={searchLoading} className="btn btn-orange">
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/*Search Results*/}
      {showSearch && searchResults.length > 0 && (
        <div className="bg-white border-b border-gray-200 shadow-lg">
          <div className="container-main py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[--navy]">Search Results</h3>
              <button onClick={clearSearch} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="book-grid">
              {searchResults.map((book, i) => (
                <BookCard
                  key={`search-${book.key}-${i}`}
                  book={book}
                  selected={isBookSelected(book)}
                  onClick={() => toggleBook(book)}
                  showAddToLibrary={true}
                  isInLibrary={isInMyBooks(book.key)}
                  onAddToLibrary={handleAddToLibrary}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/*Genre Filter Section*/}
      <div className="sticky top-0 z-40 bg-[--cream]/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="container-main py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Browse:</span>
            {GENRES.map(genre => (
              <button key={genre} onClick={() => toggleGenre(genre)} className={`genre-pill ${selectedGenres.includes(genre) ? 'active' : ''}`}>
                {genre}
              </button>
            ))}
            {selectedGenres.length > 0 && (
              <button onClick={() => setSelectedGenres([])} className="text-sm text-gray-500 hover:text-gray-700 underline whitespace-nowrap">
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/*Main Content Section*/}
      <div className="container-main py-8">
        {loadingPopular ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="spinner spinner-lg" />
            <p className="text-gray-500">Finding great books...</p>
          </div>
        ) : popularBooks.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-lg">No books found. Try different genres.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">
              Tap books you've enjoyed or want to read
              {selectedGenres.length > 0 && <span> in <span className="font-medium text-[--navy]">{selectedGenres.join(', ')}</span></span>}
            </p>

            <div className="book-grid">
              {popularBooks.map((book, i) => (
                <BookCard
                  key={`${book.key}-${i}`}
                  book={book}
                  selected={isBookSelected(book)}
                  onClick={() => toggleBook(book)}
                  showAddToLibrary={true}
                  isInLibrary={isInMyBooks(book.key)}
                  onAddToLibrary={handleAddToLibrary}
                />
              ))}
            </div>

            <div className="mt-12 text-center">
              <button onClick={() => { setPage(p => p + 1); fetchPopularBooks(selectedGenres, page + 1, false) }} disabled={loadingMore} className="btn btn-pill bg-white text-[--navy] shadow-lg border border-gray-200 hover:border-[--orange]">
                {loadingMore ? <><div className="spinner spinner-sm border-[--navy]" /> Loading...</> : <>Show me more <ChevronIcon /></>}
              </button>
            </div>
          </>
        )}

        {/*Recommendations Sectoin*/}
        {recommendations.length > 0 && (
          <section ref={recommendationsRef} className="mt-16 pt-12 border-t border-gray-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[--navy] mb-2">Your Personalized Picks</h2>
              <p className="text-gray-500">Based on your taste, you might love these</p>
            </div>
            <div className="book-grid">
              {recommendations.map((book, i) => (
                <BookCard
                  key={`rec-${book.key}-${i}`}
                  book={book}
                  selected={false}
                  onClick={() => {}}
                  showBadge={false}
                  showAddToLibrary={true}
                  isInLibrary={isInMyBooks(book.key)}
                  onAddToLibrary={handleAddToLibrary}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/*Floating Panel*/}
      <div className={`floating-panel ${showPanel ? 'visible' : 'hidden'}`}>
        <div className="bg-[--cream] border-t border-gray-300 shadow-2xl">
          <div className="container-main py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                  {selectedBooks.length} book{selectedBooks.length !== 1 ? 's' : ''} selected
                </span>
                <button onClick={() => { setSelectedBooks([]); setRecommendations([]) }} className="text-xs text-red-500 hover:text-red-700 underline">
                  Clear all
                </button>
                <div className="flex gap-2 ml-2">
                  {selectedBooks.slice(0, 8).map(book => (
                    <div key={book.key} onClick={() => toggleBook(book)} className="relative group cursor-pointer flex-shrink-0">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-12 h-16 object-cover rounded shadow-md hover:scale-110 transition-transform" />
                      ) : (
                        <div className="w-12 h-16 bg-gray-200 rounded shadow-md flex items-center justify-center text-xs text-gray-500">?</div>
                      )}
                      <div className="absolute inset-0 bg-black/50 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <CloseIcon />
                      </div>
                    </div>
                  ))}
                  {selectedBooks.length > 8 && (
                    <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500 font-medium">
                      +{selectedBooks.length - 8}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <SparkleIcon /> Powered by Groq AI
                </span>
                <button onClick={getRecommendations} disabled={loading || selectedBooks.length === 0} className="btn btn-orange btn-pill shadow-lg">
                  {loading ? <><div className="spinner spinner-sm border-white" /> Finding...</> : <><SparkleIcon /> Find my next read <ArrowIcon /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPanel && <div className="h-24" />}
    </div>
  )
}

export default Discovery
