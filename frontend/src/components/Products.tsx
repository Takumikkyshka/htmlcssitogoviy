import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { apiService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Products.css'

interface Product {
  id: number
  title: string
  description: string
  price: string
  category?: string
  video?: string
  poster?: string
  image?: string
}

function Products() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiService.getProducts()
        if (response.data) {
          setProducts(response.data)
        }
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    // Проверяем URL параметры при монтировании и изменении location
    const urlParams = new URLSearchParams(location.search)
    const urlSearch = urlParams.get('search')
    const urlCategory = urlParams.get('category')
    
    if (urlSearch !== null) {
      setSearchQuery(urlSearch)
    }
    if (urlCategory !== null) {
      setSelectedCategory(urlCategory)
    }
  }, [location.search])

  useEffect(() => {
    if (isAuthenticated) {
      const fetchFavorites = async () => {
        try {
          const response = await apiService.getFavorites()
          if (response.data) {
            const favoriteIds = new Set<number>(response.data.map((p: Product) => p.id))
            setFavorites(favoriteIds)
          }
        } catch (error) {
          console.error('Ошибка загрузки избранного:', error)
        }
      }
      fetchFavorites()
    }
  }, [isAuthenticated])

  const toggleFavorite = async (productId: number) => {
    if (!isAuthenticated) {
      alert('Войдите в аккаунт, чтобы добавлять товары в избранное')
      return
    }

    const isFavorite = favorites.has(productId)
    
    try {
      if (isFavorite) {
        await apiService.removeFromFavorites(productId)
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(productId)
          return newSet
        })
      } else {
        await apiService.addToFavorites(productId)
        setFavorites(prev => new Set(prev).add(productId))
      }
    } catch (error) {
      console.error('Ошибка изменения избранного:', error)
    }
  }

  // Фильтрация и сортировка
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    // Поиск
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(p => 
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      )
    }

    // Фильтр по категории
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory)
    }

    // Сортировка
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title, 'ru')
      } else {
        const priceA = parseFloat((a.price || '0').replace(/[^\d.]/g, '')) || 0
        const priceB = parseFloat((b.price || '0').replace(/[^\d.]/g, '')) || 0
        return priceA - priceB
      }
    })

    return sorted
  }, [products, searchQuery, selectedCategory, sortBy])

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)))

  if (loading) {
    return (
      <section className="products">
        <h2 id="popular">Популярные товары</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
          Загрузка товаров...
        </div>
      </section>
    )
  }

  return (
    <section className="products">
      <h2 id="popular">Популярные товары</h2>

      {/* Поиск и фильтры */}
      <div className="products-filters" style={{ 
        padding: '20px', 
        background: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        marginBottom: '20px',
        maxWidth: '1200px',
        margin: '0 auto 20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '2px solid rgba(30, 144, 255, 0.3)',
              fontSize: '1rem'
            }}
          />
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                // Обновляем URL
                const url = new URL(window.location.href)
                if (e.target.value !== 'all') {
                  url.searchParams.set('category', e.target.value)
                } else {
                  url.searchParams.delete('category')
                }
                window.history.pushState({}, '', url.toString())
              }}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid rgba(30, 144, 255, 0.3)',
                fontSize: '0.9rem',
                minWidth: '150px'
              }}
            >
              <option value="all">Все категории</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'name' | 'price')
              }}
              style={{
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid rgba(30, 144, 255, 0.3)',
                fontSize: '0.9rem',
                minWidth: '150px'
              }}
            >
              <option value="name">По названию</option>
              <option value="price">По цене</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        {filteredAndSortedProducts.length > 0 ? (
          filteredAndSortedProducts.map((product: Product) => (
            <article key={product.id} style={{ position: 'relative' }}>
              <button
                onClick={() => toggleFavorite(product.id)}
                className="favorite-btn"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  zIndex: 10,
                  transition: 'all 0.3s ease',
                  color: favorites.has(product.id) ? '#FFD700' : '#999'
                }}
                title={favorites.has(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                ★
              </button>
              
              {product.video ? (
                <video width="320" height="240" controls poster={product.poster}>
                  <source src={product.video} type="video/mp4" />
                </video>
              ) : product.image ? (
                <img 
                  src={product.image} 
                  alt={product.title}
                  style={{
                    width: '100%',
                    height: '240px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    marginBottom: '12px'
                  }}
                />
              ) : null}
              
              <h4>{product.title}</h4>
              <p>{product.description}</p>
              <div className="costbutton">
                <b>{product.price}</b>
                <button>Купить</button>
              </div>
            </article>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
            Товары не найдены
          </div>
        )}
      </div>
    </section>
  )
}

export default Products
