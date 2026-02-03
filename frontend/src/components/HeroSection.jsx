import homeImage from '../assets/homeImage.jpg'

function HeroSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 max-w-xl">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
            Discover Your Next <span className="text-orange">Favorite Book</span>
          </h1>
          <p className="text-[--text-gray] text-lg mb-8">
            Track your reading journey, get personalized recommendations,
            and connect with a community of book lovers.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-8">
            <input type="text" placeholder="Search by title" className="flex-1 px-4 py-3 rounded-lg border border-gray-200 outline-none" />
            <input type="text" placeholder="Author name" className="flex-1 px-4 py-3 rounded-lg border border-gray-200 outline-none" />
            <button className="btn btn-orange">Search</button>
          </div>

          <button className="btn btn-navy mb-8">Learn more</button>

        </div>

        <div className="flex-1 flex justify-center lg:justify-end">
          <img src={homeImage} alt="Person reading" className="w-full max-w-lg" />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
