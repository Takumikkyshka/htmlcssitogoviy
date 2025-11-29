import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import './Products.css'

interface Product {
  id: number
  title: string
  description: string
  price: string
  video: string
  poster: string
}

function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiService.getProducts()
        if (response.data) {
          setProducts(response.data)
        }
      } catch (error) {
        console.error('Ошибка загрузки товаров:', error)
        // Fallback на пустой массив
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

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
        {products.length > 0 ? (
          products.map((product) => (
            <article key={product.id}>
              {product.video && (
                <video width="320" height="240" controls poster={product.poster}>
                  <source src={product.video} type="video/mp4" />
                </video>
              )}
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

