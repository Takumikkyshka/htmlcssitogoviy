import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { apiService } from '../services/api'
import './Dashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface Order {
  id: number
  date: string
  product: string
  price: number
  status: 'completed' | 'processing' | 'cancelled'
  quantity: number
}

function Dashboard() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }

    const fetchOrders = async () => {
      try {
        const response = await apiService.getOrders()
        if (response.data) {
          // Преобразуем данные из API в формат Order
          const formattedOrders: Order[] = response.data.map((order: any) => ({
            id: order.id,
            date: order.created_at ? new Date(order.created_at).toISOString().split('T')[0] : order.date,
            product: order.product_title || order.product,
            price: typeof order.price === 'string' ? parseFloat(order.price.replace(/[^\d.]/g, '')) : order.price,
            status: order.status || 'processing',
            quantity: order.quantity || 1
          }))
          setOrders(formattedOrders)
        }
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, navigate])

  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'product'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Фильтрация и сортировка заказов
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

  // Группировка заказов по месяцам для графиков
  const monthlyData = useMemo(() => {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    const salesByMonth: number[] = new Array(12).fill(0)
    const ordersByMonth: number[] = new Array(12).fill(0)

    orders.forEach(order => {
      const date = new Date(order.date)
      const month = date.getMonth()
      salesByMonth[month] += order.price * order.quantity
      ordersByMonth[month] += 1
    })

    // Берем последние 6 месяцев с данными
    const last6Months = months.slice(-6)
    const last6Sales = salesByMonth.slice(-6)
    const last6Orders = ordersByMonth.slice(-6)

    return { labels: last6Months, sales: last6Sales, orders: last6Orders }
  }, [orders])

  // Данные для графиков
  const salesData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Продажи (руб.)',
        data: monthlyData.sales,
        borderColor: '#1E90FF',
        backgroundColor: 'rgba(30, 144, 255, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const ordersData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Количество заказов',
        data: monthlyData.orders,
        backgroundColor: 'rgba(30, 144, 255, 0.6)',
        borderColor: '#1E90FF',
        borderWidth: 2,
      },
    ],
  }

  const statusData = {
    labels: ['Завершено', 'В обработке', 'Отменено'],
    datasets: [
      {
        data: [
          orders.filter(o => o.status === 'completed').length,
          orders.filter(o => o.status === 'processing').length,
          orders.filter(o => o.status === 'cancelled').length,
        ],
        backgroundColor: [
          'rgba(30, 144, 255, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(220, 53, 69, 0.8)',
        ],
        borderColor: [
          '#1E90FF',
          '#FFC107',
          '#DC3545',
        ],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#333',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  } as const

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#333',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
    },
  } as const

  const totalSpent = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.price * order.quantity, 0)

  const totalOrders = orders.length
  const completedOrders = orders.filter(o => o.status === 'completed').length

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <section className="dashboard-section">
        <h2>Личный кабинет</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>
          Загрузка данных...
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-section">
      <h2>Личный кабинет</h2>

      {/* Статистика */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Всего заказов</h3>
          <p className="stat-value">{totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Завершено</h3>
          <p className="stat-value">{completedOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Потрачено</h3>
          <p className="stat-value">{totalSpent.toLocaleString('ru-RU')} ₽</p>
        </div>
      </div>

      {/* Графики */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Динамика продаж</h3>
          <div className="chart-container">
            <Line data={salesData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Количество заказов</h3>
          <div className="chart-container">
            <Bar data={ordersData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Статус заказов</h3>
          <div className="chart-container">
            <Doughnut data={statusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Таблица заказов */}
      <div className="dashboard-table-section">
        <h3>Мои заказы</h3>
        
        {/* Фильтры и сортировка */}
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

        {/* Таблица */}
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

export default Dashboard
