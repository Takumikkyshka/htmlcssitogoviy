import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchSection.css'

function SearchSection() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`)
      // Скролл к товарам
      setTimeout(() => {
        const element = document.getElementById('popular')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  const handleCategoryClick = (category: string) => {
    navigate(`/?category=${encodeURIComponent(category)}`)
    setTimeout(() => {
      const element = document.getElementById('popular')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  return (
    <section className="search-section">
      <div className="search-container">
        <form className="search-box" onSubmit={handleSearch}>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Искать товары, бренды, категории..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            <img src="/assets/imgs/icons8-поиск-50.png" alt="Поиск" className="search-icon" />
          </button>
        </form>
      </div>

      <div className="search-categories">
        <button 
          type="button"
          className="category-tag" 
          onClick={() => handleCategoryClick('клавиатура')}
        >
          Клавиатуры
        </button>
        <button 
          type="button"
          className="category-tag" 
          onClick={() => handleCategoryClick('компьютерная мышь')}
        >
          Компьютерные мыши
        </button>
        <button 
          type="button"
          className="category-tag" 
          onClick={() => handleCategoryClick('наушники')}
        >
          Наушники
        </button>
        <button 
          type="button"
          className="category-tag" 
          onClick={() => handleCategoryClick('аксессуары')}
        >
          Аксессуары
        </button>
      </div>
    </section>
  )
}

export default SearchSection

