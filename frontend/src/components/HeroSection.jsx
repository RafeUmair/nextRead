import { Link } from 'react-router-dom'
import homeImage from '../assets/homeImage.jpg'

function HeroSection() {
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

            <Link to="/discovery" className="btn btn-orange text-lg px-8 py-4 inline-block">
              Start Discovering
            </Link>
          </div>

          <div className="flex-1 flex justify-center lg:justify-end">
            <img src={homeImage} alt="Person reading" className="w-full max-w-lg" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
