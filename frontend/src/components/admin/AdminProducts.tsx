import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../services/api'
import './AdminProducts.css'

interface Product {
  id: number
  title: string
  description: string
  price: string
  category: string
  video?: string
  poster?: string
  image?: string
  review_count: number
}

function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'other',
    video: '',
    poster: '',
    image: '',
  })

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiService.adminGetProducts()
      if (response.error) {
        setError(response.error)
      } else {
        setProducts(response.data || [])
      }
    } catch (err) {
      setError('Ошибка загрузки товаров')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleCreate = () => {
    setEditingProduct(null)
    setFormData({
      title: '',
      description: '',
      price: '',
      category: 'other',
      video: '',
      poster: '',
      image: '',
    })
    setShowForm(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category || 'other',
      video: product.video || '',
      poster: product.poster || '',
      image: product.image || '',
    })
    setShowForm(true)
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const productData = {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      video: formData.video || null,
      poster: formData.poster || null,
      image: formData.image || null,
    }

    try {
      let response
      if (editingProduct) {
        response = await apiService.adminUpdateProduct(editingProduct.id, productData)
      } else {
        response = await apiService.adminCreateProduct(productData)
      }

      if (response.error) {
        setError(response.error)
      } else {
        setShowForm(false)
        loadProducts()
      }
    } catch (err) {
      setError('Ошибка сохранения товара')
    }
  }, [formData, editingProduct, loadProducts])

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm('Удалить этот товар?')) return

    try {
      const response = await apiService.adminDeleteProduct(id)
      if (response.error) {
        setError(response.error)
      } else {
        loadProducts()
      }
    } catch (err) {
      setError('Ошибка удаления товара')
    }
  }, [loadProducts])

  if (loading) {
    return <div className="admin-loading">Загрузка товаров...</div>
  }

  return (
    <div className="admin-products">
      <div className="admin-section-header">
        <h2>Управление товарами</h2>
        <button className="links" onClick={handleCreate}>
          + Добавить товар
        </button>
      </div>

      {error && <div className="admin-error-message">{error}</div>}

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingProduct ? 'Редактировать товар' : 'Создать товар'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-field">
                <label>Название *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-field">
                <label>Описание *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="admin-form-field">
                <label>Цена *</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-field">
                <label>Категория</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="other">Другое</option>
                  <option value="клавиатура">Клавиатура</option>
                  <option value="компьютерная мышь">Компьютерная мышь</option>
                  <option value="наушники">Наушники</option>
                  <option value="аксессуары">Аксессуары</option>
                </select>
              </div>
              <div className="admin-form-field">
                <label>Видео (URL)</label>
                <input
                  type="text"
                  value={formData.video}
                  onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                />
              </div>
              <div className="admin-form-field">
                <label>Постер (URL)</label>
                <input
                  type="text"
                  value={formData.poster}
                  onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                />
              </div>
              <div className="admin-form-field">
                <label>Изображение (URL)</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
              <div className="admin-form-actions">
                <button type="button" className="links" onClick={() => setShowForm(false)}>
                  Отмена
                </button>
                <button type="submit" className="links">
                  {editingProduct ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Цена</th>
              <th>Категория</th>
              <th>Обзоров</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  Товары не найдены
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.title}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td>
                    <a
                      href={`#reviews?productId=${product.id}`}
                      style={{ color: '#1E90FF', textDecoration: 'underline' }}
                    >
                      {product.review_count || 0}
                    </a>
                  </td>
                  <td>
                    <button
                      className="links admin-btn-small"
                      onClick={() => handleEdit(product)}
                    >
                      Редактировать
                    </button>
                    <button
                      className="links admin-btn-small admin-btn-danger"
                      onClick={() => handleDelete(product.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminProducts

