import { useState, useEffect, useMemo } from 'react'

function NewsCard({ article }) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 group"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-orange">
          {article.source}
        </span>
        <span className="text-[10px] text-gray-400">{formatDate(article.pubDate)}</span>
      </div>
      <p className="text-sm font-semibold text-[--navy] leading-snug group-hover:text-orange transition-colors line-clamp-2">
        {article.title}
      </p>
      {article.description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{article.description}</p>
      )}
    </a>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

const PAGE_SIZE = 20

function NewsSection() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [activeSource, setActiveSource] = useState('All')
  const [newestFirst, setNewestFirst] = useState(true)

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/news?offset=0&limit=${PAGE_SIZE}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(data => { setArticles(data.items); setHasMore(data.hasMore); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const loadMore = () => {
    setLoadingMore(true)
    fetch(`${import.meta.env.VITE_API_URL}/api/news?offset=${articles.length}&limit=${PAGE_SIZE}`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(data => {
        setArticles(prev => [...prev, ...data.items])
        setHasMore(data.hasMore)
        setLoadingMore(false)
      })
      .catch(() => setLoadingMore(false))
  }

  const sources = useMemo(() => ['All', ...new Set(articles.map(a => a.source))], [articles])

  const displayed = useMemo(() => {
    const filtered = activeSource === 'All' ? articles : articles.filter(a => a.source === activeSource)
    return newestFirst ? filtered : [...filtered].reverse()
  }, [articles, activeSource, newestFirst])

  return (
    <section className="container-main py-12">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[--navy]">Literary News</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-gray)' }}>
            Latest from the book world
          </p>
        </div>
        {!loading && !error && articles.length > 0 && (
          <button
            onClick={() => setNewestFirst(p => !p)}
            className="text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:border-orange transition-colors"
            style={{ color: 'var(--navy)' }}
          >
            {newestFirst ? '↓ Newest first' : '↑ Oldest first'}
          </button>
        )}
      </div>

      {!loading && !error && sources.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {sources.map(source => (
            <button
              key={source}
              onClick={() => setActiveSource(source)}
              className={`genre-pill ${activeSource === source ? 'active' : ''}`}
            >
              {source}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
          Could not load news — make sure the backend is running with the latest code.
        </p>
      ) : displayed.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-gray)' }}>No articles found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map(article => (
              <NewsCard key={article.link} article={article} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="text-sm font-medium px-4 py-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:border-orange transition-colors disabled:opacity-50"
                style={{ color: 'var(--navy)' }}
              >
                {loadingMore ? 'Loading…' : 'More'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default NewsSection
