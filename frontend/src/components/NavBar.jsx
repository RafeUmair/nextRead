import { Link } from 'react-router-dom'

function NavBar() {
  return (
    <nav className="py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[--navy] rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l6.9 3.45L12 11.09 5.1 7.63 12 4.18zM4 8.82l7 3.5v7.36l-7-3.5V8.82zm9 10.86v-7.36l7-3.5v7.36l-7 3.5z"/>
            </svg>
          </div>
          <span className="text-[--navy] font-bold text-xl">NextReads</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-[--orange] font-medium">Home</Link>
          <Link to="/discovery" className="text-[--navy] hover:text-[--orange]">Discovery</Link>
          <Link to="/my-books" className="text-[--navy] hover:text-[--orange]">My Books</Link>
          <Link to="/community" className="text-[--navy] hover:text-[--orange]">Community</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/signup" className="btn btn-orange rounded-full">Sign Up</Link>
          <button className="text-[--navy] hover:text-[--orange]">
          </button>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
