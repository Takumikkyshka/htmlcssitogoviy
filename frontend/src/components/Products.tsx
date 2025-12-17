import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
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
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name')
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiService.getProducts()
        if (response.data) {
          setProducts(response.data)
        }
      } catch (error) {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

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

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image || product.poster,
    })

    setToastMessage(`«${product.title}» добавлен в корзину`)
    setTimeout(() => {
      setToastMessage(null)
    }, 1500)
  }

  // Фильтрация и сортировка
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]

    // Поиск
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(p => {
        const titleMatch = p.title?.toLowerCase().includes(query) || false
        const descMatch = p.description?.toLowerCase().includes(query) || false
        return titleMatch || descMatch
      })
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
              
              <Link to={`/product/${product.id}`} className="product-link">
                {product.video ? (
                  <video width="320" height="240" controls poster={product.poster}>
                    <source src={product.video} type="video/mp4" />
                  </video>
                ) : product.image || product.poster ? (
                  <img 
                    src={product.image || product.poster} 
                    alt={product.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
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
              </Link>
              <p>{product.description}</p>
              <div className="costbutton">
                <b>{product.price}</b>
                <button onClick={() => handleAddToCart(product)}>В корзину</button>
              </div>
            </article>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
            {searchQuery || selectedCategory !== 'all' 
              ? 'Товары не найдены по заданным критериям' 
              : 'Товары не найдены'}
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="cart-toast">
          {toastMessage}
        </div>
      )}

      {/* Модальное окно покупки больше не используется, оформляем заказ через корзину */}
    </section>
  )
}

export default Products
