import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'

function MyBooks() {
  return (
    <div className="min-h-screen bg-[--cream]">
      <NavBar />

      <main className="container-main py-12">
        <h1 className="text-3xl font-bold text-[--navy] mb-8">My Books</h1>

        {/* Reading Status Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button className="genre-pill active">Currently Reading</button>
          <button className="genre-pill">Want to Read</button>
          <button className="genre-pill">Finished</button>
        </div>
      </main>
    </div>
  )
}

export default MyBooks
