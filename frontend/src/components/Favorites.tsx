import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
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

function Favorites() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }

    const fetchFavorites = async () => {
      try {
        const response = await apiService.getFavorites()
        if (response.data) {
          setProducts(response.data)
        }
      } catch (error) {
        console.error('Ошибка загрузки избранного:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [isAuthenticated, navigate])

  const removeFromFavorites = async (productId: number) => {
    try {
      await apiService.removeFromFavorites(productId)
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <section className="products">
        <h2>Избранное</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
          Загрузка избранного...
        </div>
      </section>
    )
  }

  return (
    <section className="products">
      <h2>Избранное</h2>
      <div>
        {products.length > 0 ? (
          products.map((product) => (
            <article key={product.id} style={{ position: 'relative' }}>
              <button
                onClick={() => removeFromFavorites(product.id)}
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
                  color: '#FFD700'
                }}
                title="Удалить из избранного"
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
            В избранном пока ничего нет
          </div>
        )}
      </div>
    </section>
  )
}

export default Favorites
