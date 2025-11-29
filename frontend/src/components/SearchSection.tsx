import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './SearchSection.css'

function SearchSection() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')

  // Синхронизация с URL параметрами
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const urlSearch = urlParams.get('search') || ''
    const urlCategory = urlParams.get('category') || 'all'
    const urlSort = (urlParams.get('sort') || 'name') as 'name' | 'price'
    
    setSearchQuery(urlSearch)
    setSelectedCategory(urlCategory)
    setSortBy(urlSort)
  }, [location.search])

  const updateURL = (search: string, category: string, sort: string) => {
    const url = new URL(window.location.href)
    
    if (search.trim()) {
      url.searchParams.set('search', search.trim())
    } else {
      url.searchParams.delete('search')
    }
    
    if (category !== 'all') {
      url.searchParams.set('category', category)
    } else {
      url.searchParams.delete('category')
    }
    
    if (sort !== 'name') {
      url.searchParams.set('sort', sort)
    } else {
      url.searchParams.delete('sort')
    }
    
    navigate(url.pathname + url.search, { replace: true })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL(searchQuery, selectedCategory, sortBy)
    
    // Скролл к товарам
    setTimeout(() => {
      const element = document.getElementById('popular')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    // Обновляем URL в реальном времени
    updateURL(value, selectedCategory, sortBy)
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    updateURL(searchQuery, category, sortBy)
    
    setTimeout(() => {
      const element = document.getElementById('popular')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value
    handleCategoryClick(category)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = e.target.value as 'name' | 'price'
    setSortBy(sort)
    updateURL(searchQuery, selectedCategory, sort)
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
            onChange={handleSearchChange}
          />
          <button type="submit" className="search-button">
            <img src="/assets/imgs/icons8-поиск-50.png" alt="Поиск" className="search-icon" />
          </button>
        </form>
      </div>

      <div className="search-categories">
        <button 
          type="button"
          className={`category-tag ${selectedCategory === 'клавиатура' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('клавиатура')}
        >
          Клавиатуры
        </button>
        <button 
          type="button"
          className={`category-tag ${selectedCategory === 'компьютерная мышь' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('компьютерная мышь')}
        >
          Компьютерные мыши
        </button>
        <button 
          type="button"
          className={`category-tag ${selectedCategory === 'наушники' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('наушники')}
        >
          Наушники
        </button>
        <button 
          type="button"
          className={`category-tag ${selectedCategory === 'аксессуары' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('аксессуары')}
        >
          Аксессуары
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'center', 
        marginTop: '15px',
        flexWrap: 'wrap'
      }}>
        <select
          value={selectedCategory}
          onChange={handleCategorySelect}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '2px solid rgba(30, 144, 255, 0.3)',
            fontSize: '0.9rem',
            minWidth: '150px',
            background: 'white'
          }}
        >
          <option value="all">Все категории</option>
          <option value="клавиатура">Клавиатуры</option>
          <option value="компьютерная мышь">Компьютерные мыши</option>
          <option value="наушники">Наушники</option>
          <option value="аксессуары">Аксессуары</option>
        </select>
        <select
          value={sortBy}
          onChange={handleSortChange}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '2px solid rgba(30, 144, 255, 0.3)',
            fontSize: '0.9rem',
            minWidth: '150px',
            background: 'white'
          }}
        >
          <option value="name">По названию</option>
          <option value="price">По цене</option>
        </select>
      </div>
    </section>
  )
}

export default SearchSection
