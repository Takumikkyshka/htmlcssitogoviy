import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import './Dashboard.css'

type OrderStatus = 'completed' | 'processing' | 'cancelled'

interface Order {
  id: number
  date: string
  product: string
  price: number
  status: OrderStatus
  quantity: number
}

function Orders() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'product'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    const fetchOrders = async () => {
      try {
        const response = await apiService.getOrders()
        if (response.error) {
          setError(response.error)
          setOrders([])
          return
        }

        if (response.data) {
          const formattedOrders: Order[] = response.data.map((order: any) => ({
            id: order.id,
            date: order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : order.date,
            product: order.product_title || order.product,
            price: typeof order.price === 'string' ? parseFloat(order.price.replace(/[^\d.]/g, '')) : order.price,
            status: (order.status || 'processing') as OrderStatus,
            quantity: order.quantity || 1,
          }))
          setOrders(formattedOrders)
        }
      } catch (err) {
        setError('Не удалось загрузить заказы. Попробуйте позже.')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated])

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders

    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus)
    }

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'product':
          comparison = a.product.localeCompare(b.product)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [orders, filterStatus, sortBy, sortOrder])

  if (!isAuthenticated) {
    return (
      <section className="dashboard-section">
        <h2>Мои заказы</h2>
        <div style={{ background: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ marginBottom: '12px', color: '#333', fontWeight: 600 }}>Чтобы увидеть заказы, авторизуйтесь.</p>
          <button className="links" onClick={() => navigate('/')}>
            Перейти на главную
          </button>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="dashboard-section">
        <h2>Мои заказы</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
          Загрузка заказов...
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-section">
      <h2>Мои заказы</h2>

      {error && (
        <div style={{ color: '#DC3545', marginBottom: '16px', textAlign: 'center', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div className="dashboard-table-section">
        <h3>История заказов</h3>

        <div className="table-controls">
          <div className="filter-group">
            <label htmlFor="status-filter">Фильтр по статусу:</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">Все</option>
              <option value="completed">Завершено</option>
              <option value="processing">В обработке</option>
              <option value="cancelled">Отменено</option>
            </select>
          </div>

          <div className="sort-group">
            <label htmlFor="sort-select">Сортировка:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'product')}
              className="sort-select"
            >
              <option value="date">По дате</option>
              <option value="product">По товару</option>
              <option value="price">По цене</option>
            </select>
            <button
              className="sort-order-button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Товар</th>
                <th>Количество</th>
                <th>Цена</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders.length > 0 ? (
                filteredAndSortedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.product}</td>
                    <td>{order.quantity}</td>
                    <td>{order.price.toLocaleString('ru-RU')} ₽</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status === 'completed' ? 'Завершено' :
                         order.status === 'processing' ? 'В обработке' : 'Отменено'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                    Заказы не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Orders

