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

function BookCard({ book, selected, onClick, showBadge = true }) {
  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer transition-all duration-300 ${selected ? 'scale-95' : 'hover:scale-105'}`}
    >
      {showBadge && (
        <div className={`select-badge ${selected ? 'active' : 'inactive'}`}>
          {selected ? <CheckIcon /> : <PlusIcon />}
        </div>
      )}
      <div className={`book-card ${selected ? 'selected' : ''}`}>
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="book-cover" />
        ) : (
          <div className="book-cover-placeholder">
            <span className="text-gray-500 text-center text-sm font-medium">{book.title}</span>
          </div>
        )}
        <div className="book-info">
          <h3 className="book-title">{book.title}</h3>
          <p className="book-author">{book.author || 'Unknown'}</p>
        </div>
      </div>
    </div>
  )
}

export default BookCard
