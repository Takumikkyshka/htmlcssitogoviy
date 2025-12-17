import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../services/api'
import './AdminReviews.css'

interface Review {
  id: number
  user_id: number
  user_email: string
  user_name: string
  product_id: number
  product_title: string
  rating: number
  text: string
  approved: number
  likes: number
  admin_response?: string
  created_at: string
}

function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [approvedFilter, setApprovedFilter] = useState<string>('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    userId: '',
    productId: '',
    rating: 5,
    text: ''
  })
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  const loadUsersAndProducts = useCallback(async () => {
    if (users.length > 0 && products.length > 0) return // Уже загружены
    
    try {
      const [usersRes, productsRes] = await Promise.all([
        apiService.adminGetUsers(),
        apiService.adminGetProducts()
      ])
      if (usersRes.data) setUsers(usersRes.data)
      if (productsRes.data) setProducts(productsRes.data)
    } catch (err) {
      // Игнорируем ошибки загрузки
    }
  }, [users.length, products.length])

  const loadReviews = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiService.adminGetReviews(
        approvedFilter !== '' ? { approved: approvedFilter === 'true' } : undefined
      )
      if (response.error) {
        setError(response.error)
      } else {
        setReviews(response.data || [])
      }
    } catch (err) {
      setError('Ошибка загрузки обзоров')
    } finally {
      setLoading(false)
    }
  }, [approvedFilter])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  useEffect(() => {
    if (showCreateForm) {
      loadUsersAndProducts()
    }
  }, [showCreateForm, loadUsersAndProducts])

  const handleToggleApproval = useCallback(async (reviewId: number, currentApproved: number) => {
    try {
      const response = await apiService.adminToggleReviewApproval(reviewId, currentApproved === 0)
      if (response.error) {
        setError(response.error)
      } else {
        loadReviews()
      }
    } catch (err) {
      setError('Ошибка обновления обзора')
    }
  }, [loadReviews])


  const handleDelete = useCallback(async (reviewId: number) => {
    if (!confirm('Удалить этот обзор?')) return

    try {
      const response = await apiService.adminDeleteReview(reviewId)
      if (response.error) {
        setError(response.error)
      } else {
        loadReviews()
      }
    } catch (err) {
      setError('Ошибка удаления обзора')
    }
  }, [loadReviews])

  const handleGenerateReviews = useCallback(async () => {
    if (!confirm('Создать обзоры для всех товаров? Это может занять некоторое время.')) return

    setLoading(true)
    try {
      const response = await apiService.adminGenerateReviews()
      if (response.error) {
        setError(response.error)
      } else {
        alert(`Создано ${response.data?.length || 0} обзоров`)
        loadReviews()
      }
    } catch (err) {
      setError('Ошибка генерации обзоров')
    } finally {
      setLoading(false)
    }
  }, [loadReviews])

  const handleCreateReview = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createFormData.userId || !createFormData.productId || !createFormData.text) {
      setError('Все поля обязательны')
      return
    }

    setError('')
    try {
      const response = await apiService.adminCreateReview(
        parseInt(createFormData.userId, 10),
        parseInt(createFormData.productId, 10),
        createFormData.rating,
        createFormData.text
      )

      if (response.error) {
        setError(response.error)
      } else {
        setCreateFormData({ userId: '', productId: '', rating: 5, text: '' })
        setShowCreateForm(false)
        loadReviews()
      }
    } catch (err) {
      setError('Ошибка создания обзора')
    }
  }, [createFormData, loadReviews])

  if (loading) {
    return <div className="admin-loading">Загрузка обзоров...</div>
  }

  return (
    <div className="admin-reviews">
      <div className="admin-section-header">
        <h2>Управление обзорами</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            value={approvedFilter}
            onChange={(e) => setApprovedFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="">Все обзоры</option>
            <option value="true">Одобренные</option>
            <option value="false">Неодобренные</option>
          </select>
          <button className="links" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Отмена' : '+ Создать обзор'}
          </button>
          <button className="links" onClick={handleGenerateReviews}>
            Создать обзоры для всех товаров
          </button>
        </div>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateReview} className="admin-create-form" style={{ marginBottom: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Создать новый обзор</h3>
          <div className="admin-form-field">
            <label>Пользователь *</label>
            <select
              value={createFormData.userId}
              onChange={(e) => setCreateFormData({ ...createFormData, userId: e.target.value })}
              required
            >
              <option value="">Выберите пользователя</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email} (ID: {user.id})
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form-field">
            <label>Товар *</label>
            <select
              value={createFormData.productId}
              onChange={(e) => setCreateFormData({ ...createFormData, productId: e.target.value })}
              required
            >
              <option value="">Выберите товар</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.title} (ID: {product.id})
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form-field">
            <label>Рейтинг *</label>
            <select
              value={createFormData.rating}
              onChange={(e) => setCreateFormData({ ...createFormData, rating: parseInt(e.target.value, 10) })}
              required
            >
              <option value="5">5 звезд</option>
              <option value="4">4 звезды</option>
              <option value="3">3 звезды</option>
              <option value="2">2 звезды</option>
              <option value="1">1 звезда</option>
            </select>
          </div>
          <div className="admin-form-field">
            <label>Текст обзора *</label>
            <textarea
              value={createFormData.text}
              onChange={(e) => setCreateFormData({ ...createFormData, text: e.target.value })}
              rows={4}
              required
              placeholder="Введите текст обзора..."
            />
          </div>
          <button type="submit" className="links">Создать обзор</button>
        </form>
      )}

      {error && <div className="admin-error-message">{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Автор</th>
              <th>Товар</th>
              <th>Рейтинг</th>
              <th>Текст</th>
              <th>Одобрен</th>
              <th>Лайки</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                  Обзоры не найдены
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.id}</td>
                  <td>{review.user_name || review.user_email}</td>
                  <td>{review.product_title}</td>
                  <td>{'★'.repeat(review.rating)}</td>
                  <td className="review-text-cell">
                    <div className="review-text-preview">{review.text.substring(0, 100)}...</div>
                  </td>
                  <td>
                    <span className={review.approved === 1 ? 'status-approved' : 'status-pending'}>
                      {review.approved === 1 ? 'Да' : 'Нет'}
                    </span>
                  </td>
                  <td>{review.likes}</td>
                  <td>{new Date(review.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <button
                      className="links admin-btn-small"
                      onClick={() => handleToggleApproval(review.id, review.approved)}
                    >
                      {review.approved === 1 ? 'Скрыть' : 'Одобрить'}
                    </button>
                    <button
                      className="links admin-btn-small admin-btn-danger"
                      onClick={() => handleDelete(review.id)}
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

export default AdminReviews

