import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiService } from '../services/api'
import { useCart } from '../context/CartContext'
import './Products.css'
import './ProductDetails.css'

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

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const productRes = await apiService.getProductById(Number(id))

        if (productRes.error || !productRes.data) {
          setError(productRes.error || 'Товар не найден')
        } else {
          setProduct(productRes.data)
        }
      } catch (e) {
        setError('Ошибка загрузки товара')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image || product.poster,
    })
  }


  if (loading) {
    return (
      <section className="product-details-section">
        <h2>Загрузка товара...</h2>
      </section>
    )
  }

  if (error || !product) {
    return (
      <section className="product-details-section">
        <h2>Товар не найден</h2>
        <button className="links" onClick={() => navigate('/catalog')}>
          Вернуться в каталог
        </button>
      </section>
    )
  }

  return (
    <section className="product-details-section">
      <div className="product-details-card">
        <div className="product-details-media">
          {product.video ? (
            <video controls poster={product.poster}>
              <source src={product.video} type="video/mp4" />
            </video>
          ) : product.image || product.poster ? (
            <img src={product.image || product.poster} alt={product.title} />
          ) : null}
        </div>

        <div className="product-details-info">
          <h2>{product.title}</h2>
          <p className="product-details-description">{product.description}</p>
          <p className="product-details-price">{product.price}</p>

          <div className="product-details-actions">
            <button className="links" onClick={handleAddToCart}>
              В корзину
            </button>
            <button className="links" onClick={() => navigate(`/blog?product_id=${product.id}`)}>
              Обзор товара
            </button>
            <button className="links" onClick={() => navigate('/catalog')}>
              Назад в каталог
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductDetails


