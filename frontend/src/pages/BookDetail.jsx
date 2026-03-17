import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { useMyBooks } from '../context/MyBooksContext'
import { useAuth } from '../context/AuthContext'

function StarRating({ average, count }) {
  const filled = Math.round(average)
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <svg key={i} className="w-5 h-5" fill={i <= filled ? 'var(--orange)' : '#D1D5DB'} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-gray-500">{average.toFixed(1)} <span className="text-sm">({count.toLocaleString()} ratings)</span></span>
    </div>
  )
}

function BookDetail() {
  const { workId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { addBook, isInMyBooks } = useMyBooks()
  const { user } = useAuth()

  const bookFromState = state?.book || null
  const bookKey = `/works/${workId}`

  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  const inLibrary = isInMyBooks(bookKey)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [worksRes, ratingsRes] = await Promise.allSettled([
          fetch(`https://openlibrary.org/works/${workId}.json`),
          fetch(`https://openlibrary.org/works/${workId}/ratings.json`),
        ])
        const worksData = worksRes.status === 'fulfilled' ? await worksRes.value.json() : {}
        const ratingsData = ratingsRes.status === 'fulfilled' ? await ratingsRes.value.json() : {}

        const rawDesc = worksData.description
        const fullDescription = typeof rawDesc === 'string' ? rawDesc : rawDesc?.value || ''

        setDetails({
          title: worksData.title || bookFromState?.title || 'Unknown Title',
          author: bookFromState?.author || null,
          coverUrl: bookFromState?.coverUrl || null,
          fullDescription: fullDescription || null,
          subjects: (worksData.subjects || []).slice(0, 12),
          firstPublishDate: worksData.first_publish_date || null,
          rating: ratingsData.summary?.average && ratingsData.summary?.count
            ? { average: ratingsData.summary.average, count: ratingsData.summary.count }
            : null,
        })
      } catch {
        setDetails(bookFromState ? {
          title: bookFromState.title,
          author: bookFromState.author,
          coverUrl: bookFromState.coverUrl,
          fullDescription: null,
          subjects: [],
          firstPublishDate: null,
          rating: null,
        } : null)
      }
      setLoading(false)
    }

    fetchDetails()
  }, [workId])

  const handleAddToLibrary = () => {
    if (!user) {
      navigate(`/login?redirect=/book/${workId}`)
      return
    }
    const book = {
      key: bookKey,
      title: details?.title || bookFromState?.title,
      author: details?.author || bookFromState?.author,
      coverUrl: details?.coverUrl || bookFromState?.coverUrl,
    }
    addBook(book)
  }

  return (
    <div className="min-h-screen">
      <NavBar />

      <div className="container-main py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="back-btn"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="spinner spinner-lg" />
            <p className="text-gray-500">Loading book details...</p>
          </div>
        ) : !details ? (
          <div className="text-center py-32">
            <p className="text-gray-500 text-lg">Could not load book details.</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-10">
            {/* Cover */}
            <div className="flex-shrink-0 flex flex-col items-center md:items-start gap-4">
              {details.coverUrl ? (
                <img
                  src={details.coverUrl}
                  alt={details.title}
                  className="book-detail-cover"
                />
              ) : (
                <div className="book-detail-cover-placeholder">
                  <span className="text-gray-500 text-sm text-center font-medium">{details.title}</span>
                </div>
              )}

              <button
                onClick={handleAddToLibrary}
                className={`book-detail-add-btn ${inLibrary ? 'active' : ''}`}
              >
                <svg className="w-4 h-4" fill={inLibrary ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {inLibrary ? 'In My Books' : 'Add to My Books'}
              </button>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h1 className="book-detail-title">{details.title}</h1>
              {details.author && (
                <p className="book-detail-author">{details.author}</p>
              )}

              <div className="space-y-4">
                {details.rating && <StarRating average={details.rating.average} count={details.rating.count} />}

                {details.firstPublishDate && (
                  <p className="text-sm text-gray-500">
                    First published: <span className="text-[--navy] font-medium">{details.firstPublishDate}</span>
                  </p>
                )}

                {details.subjects.length > 0 && (
                  <div>
                    <p className="book-detail-section-label">Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {details.subjects.map((s, i) => (
                        <span key={i} className="tooltip-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {details.fullDescription && (
                  <div>
                    <p className="book-detail-section-label">About this book</p>
                    <p className="book-detail-description">{details.fullDescription}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookDetail
