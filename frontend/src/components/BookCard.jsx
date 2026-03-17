import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const tooltipCache = new Map()
const DESCRIPTION_CUTOFF = 180

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const BookmarkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

const BookmarkFilledIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

function StarRating({ average, count }) {
  const filled = Math.round(average)
  return (
    <div className="flex items-center gap-1 mb-1.5">
      <div className="flex gap-px">
        {[1, 2, 3, 4, 5].map(i => (
          <svg key={i} className="w-3 h-3" fill={i <= filled ? 'var(--orange)' : '#D1D5DB'} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-[11px] text-gray-400">{average.toFixed(1)} · {count.toLocaleString()} ratings</span>
    </div>
  )
}

function BookCard({ book, selected, onClick, showBadge = true, showAddToLibrary = false, isInLibrary = false, onAddToLibrary }) {
  const navigate = useNavigate()
  const [hasHovered, setHasHovered] = useState(false)
  const [tooltipData, setTooltipData] = useState(null)
  const [tooltipLoading, setTooltipLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const hoverTimer = useRef(null)
  const hasFetched = useRef(false)

  const handleMouseEnter = () => {
    setHasHovered(true)
    if (!hasFetched.current) hoverTimer.current = setTimeout(fetchTooltipData, 300)
  }

  const handleMouseLeave = () => clearTimeout(hoverTimer.current)

  const fetchTooltipData = async () => {
    if (hasFetched.current) return
    const workId = (book.key || '').replace('/works/', '')
    if (!workId) return

    if (tooltipCache.has(workId)) {
      setTooltipData(tooltipCache.get(workId))
      hasFetched.current = true
      return
    }

    setTooltipLoading(true)
    try {
      const [worksRes, ratingsRes] = await Promise.allSettled([
        fetch(`https://openlibrary.org/works/${workId}.json`),
        fetch(`https://openlibrary.org/works/${workId}/ratings.json`),
      ])
      const data = worksRes.status === 'fulfilled' ? await worksRes.value.json() : {}
      const ratingsData = ratingsRes.status === 'fulfilled' ? await ratingsRes.value.json() : {}

      const rawDesc = data.description
      const fullDescription = typeof rawDesc === 'string' ? rawDesc : rawDesc?.value || ''

      const result = {
        fullDescription: fullDescription || null,
        subjects: (data.subjects || []).slice(0, 3),
        firstPublishDate: data.first_publish_date || null,
        rating: ratingsData.summary?.average && ratingsData.summary?.count
          ? { average: ratingsData.summary.average, count: ratingsData.summary.count }
          : null,
      }
      tooltipCache.set(workId, result)
      setTooltipData(result)
    } catch {
      tooltipCache.set(workId, null)
    }
    setTooltipLoading(false)
    hasFetched.current = true
  }

  const handleAddToLibrary = (e) => {
    e.stopPropagation()
    if (onAddToLibrary) onAddToLibrary(book)
  }

  const toggleExpanded = (e) => {
    e.stopPropagation()
    setExpanded(v => !v)
  }

  const handleViewDetails = (e) => {
    e.stopPropagation()
    const workId = (book.key || '').replace('/works/', '')
    navigate(`/book/${workId}`, { state: { book } })
  }

  const fullDescription = tooltipData?.fullDescription
  const isLong = fullDescription && fullDescription.length > DESCRIPTION_CUTOFF
  const displayedDescription = expanded || !isLong ? fullDescription : fullDescription?.slice(0, DESCRIPTION_CUTOFF) + '…'

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative cursor-pointer transition-all duration-300 ${selected ? 'scale-95' : 'hover:scale-105 hover:z-[9999]'}`}
    >
      {hasHovered && (
        <div className="book-tooltip" onClick={e => e.stopPropagation()}>
          <div className="book-tooltip-inner">
            <div className="book-tooltip-arrow" />
            <p className="book-title mb-0.5">{book.title}</p>
            <p className="text-xs text-orange mb-2">{book.author || 'Unknown Author'}</p>

            {tooltipLoading ? (
              <div className="flex justify-center py-1">
                <div className="spinner spinner-sm" />
              </div>
            ) : tooltipData ? (
              <>
                {tooltipData.rating && <StarRating average={tooltipData.rating.average} count={tooltipData.rating.count} />}
                {tooltipData.firstPublishDate && (
                  <p className="text-[11px] text-gray-400 mb-1.5">Published: {tooltipData.firstPublishDate}</p>
                )}
                {displayedDescription && (
                  <p className="text-[11px] text-gray-600 leading-relaxed mb-1">
                    {displayedDescription}
                    {isLong && (
                      <button onClick={toggleExpanded} className="ml-1 text-orange font-medium hover:underline">
                        {expanded ? 'less' : 'more'}
                      </button>
                    )}
                  </p>
                )}
                {tooltipData.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tooltipData.subjects.map((s, i) => <span key={i} className="tooltip-tag">{s}</span>)}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {showBadge && (
        <div className={`select-badge ${selected ? 'active' : 'inactive'}`}>
          {selected ? <CheckIcon /> : <PlusIcon />}
        </div>
      )}
      {showAddToLibrary && (
        <button
          onClick={handleAddToLibrary}
          className={`bookmark-btn ${isInLibrary ? 'active' : ''}`}
          title={isInLibrary ? 'In your library' : 'Add to My Books'}
        >
          {isInLibrary ? <BookmarkFilledIcon /> : <BookmarkIcon />}
        </button>
      )}

      <div className={`book-card ${selected ? 'selected' : ''}`}>
        <div className="book-cover-wrapper">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="book-cover" />
          ) : (
            <div className="book-cover-placeholder">
              <span className="text-gray-500 text-center text-sm font-medium">{book.title}</span>
            </div>
          )}
          <button
            onClick={handleViewDetails}
            className="view-details-btn"
            title="View book page"
          >
            View Details
          </button>
        </div>
        <div className="book-info">
          <h3 className="book-title">{book.title}</h3>
          <p className="book-author">{book.author || 'Unknown'}</p>
        </div>
      </div>
    </div>
  )
}

export default BookCard
