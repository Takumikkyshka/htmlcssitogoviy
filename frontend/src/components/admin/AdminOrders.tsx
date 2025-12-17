import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../services/api'
import './AdminOrders.css'

interface Order {
  id: number
  user_id: number
  user_email: string
  user_name: string
  product_id: number
  product_title: string
  price: number
  quantity: number
  status: string
  created_at: string
}

function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await apiService.adminGetOrders(
        statusFilter ? { status: statusFilter } : undefined
      )
      if (response.error) {
        setError(response.error)
      } else {
        setOrders(response.data || [])
      }
    } catch (err) {
      setError('Ошибка загрузки заказов')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const handleStatusChange = useCallback(async (orderId: number, newStatus: string) => {
    const response = await apiService.adminUpdateOrderStatus(orderId, newStatus)
    if (response.error) {
      setError(response.error)
    } else {
      loadOrders()
    }
  }, [loadOrders])

  if (loading) {
    return <div className="admin-loading">Загрузка заказов...</div>
  }

  return (
    <div className="admin-orders">
      <div className="admin-section-header">
        <h2>Управление заказами</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-filter-select"
        >
          <option value="">Все статусы</option>
          <option value="processing">В обработке</option>
          <option value="completed">Завершён</option>
          <option value="cancelled">Отменён</option>
        </select>
      </div>

      {error && <div className="admin-error-message">{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Пользователь</th>
              <th>Товар</th>
              <th>Количество</th>
              <th>Цена</th>
              <th>Статус</th>
              <th>Дата</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                  Заказы не найдены
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user_name || order.user_email}</td>
                  <td>{order.product_title}</td>
                  <td>{order.quantity}</td>
                  <td>{order.price} ₽</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status === 'processing' && 'В обработке'}
                      {order.status === 'completed' && 'Завершён'}
                      {order.status === 'cancelled' && 'Отменён'}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="admin-status-select"
                    >
                      <option value="processing">В обработке</option>
                      <option value="completed">Завершён</option>
                      <option value="cancelled">Отменён</option>
                    </select>
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

export default AdminOrders

