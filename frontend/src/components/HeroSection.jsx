import { useState } from 'react'
import homeImage from '../assets/homeImage.jpg'

function HeroSection() {
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/api/search?q=${encodeURIComponent(query)}&limit=8`)
      const data = await response.json()
      setBooks(data)
    } catch (error) {
      console.error('Search failed:', error)
    }
    setLoading(false)
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8 mb-12">
          <div className="flex-1 max-w-xl">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Discover Your Next <span className="text-orange">Favorite Book</span>
            </h1>
            <p className="text-[--text-gray] text-lg mb-8">
              Track your reading journey, get personalized recommendations,
              and connect with a community of book lovers.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 mb-8">
              <input
                type="text"
                placeholder="Search books..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 outline-none"
              />
              <button onClick={handleSearch} className="btn btn-orange">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end">
            <img src={homeImage} alt="Person reading" className="w-full max-w-lg" />
          </div>
        </div>

        {books.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Search Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {books.map((book) => (
                <div key={book.key} className="bg-white rounded-lg shadow p-4">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-48 object-cover rounded mb-3" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-400">
                      No Cover
                    </div>
                  )}
                  <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                  <p className="text-[--text-gray] text-xs">{book.author || 'Unknown'}</p>
                  {book.firstPublishYear && (
                    <p className="text-[--text-gray] text-xs">{book.firstPublishYear}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroSection
