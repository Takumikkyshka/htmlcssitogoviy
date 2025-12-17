import { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import { Line, Bar, Pie } from 'react-chartjs-2'
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
import './AdminAnalytics.css'

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

interface Analytics {
  totalOrders: number
  ordersByStatus: Record<string, number>
  totalRevenue: number
  topProducts: Array<{ id: number; title: string; total_sold: number; total_revenue: number }>
  salesByMonth: Array<{ month: string; count: number; revenue: number }>
  totalUsers: number
  reviews: { total: number; avgRating: number; approved: number }
}

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    setError('')
    const response = await apiService.adminGetAnalytics()
    if (response.error) {
      setError(response.error)
    } else {
      setAnalytics(response.data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="admin-loading">Загрузка аналитики...</div>
  }

  if (error) {
    return <div className="admin-error-message">{error}</div>
  }

  if (!analytics) {
    return <div className="admin-loading">Данные не найдены</div>
  }

  const salesChartData = {
    labels: analytics.salesByMonth.map((item) => item.month),
    datasets: [
      {
        label: 'Продажи (руб.)',
        data: analytics.salesByMonth.map((item) => item.revenue),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const ordersChartData = {
    labels: analytics.salesByMonth.map((item) => item.month),
    datasets: [
      {
        label: 'Количество заказов',
        data: analytics.salesByMonth.map((item) => item.count),
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
      },
    ],
  }

  const statusChartData = {
    labels: Object.keys(analytics.ordersByStatus),
    datasets: [
      {
        label: 'Заказы по статусам',
        data: Object.values(analytics.ordersByStatus),
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
      },
    ],
  }

  return (
    <div className="admin-analytics">
      <h2>Аналитика маркетплейса</h2>

      <div className="analytics-stats-grid">
        <div className="stat-card">
          <h3>Всего заказов</h3>
          <p className="stat-value">{analytics.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Общая выручка</h3>
          <p className="stat-value">{Math.round(analytics.totalRevenue || 0).toLocaleString()} ₽</p>
        </div>
        <div className="stat-card">
          <h3>Пользователей</h3>
          <p className="stat-value">{analytics.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Обзоров</h3>
          <p className="stat-value">{analytics.reviews.total}</p>
        </div>
      </div>

      <div className="analytics-charts-grid">
        <div className="chart-card">
          <h3>Динамика продаж</h3>
          <Line data={salesChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="chart-card">
          <h3>Количество заказов по месяцам</h3>
          <Bar data={ordersChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="chart-card">
          <h3>Заказы по статусам</h3>
          <Pie data={statusChartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      <div className="analytics-top-products">
        <h3>Топ товаров по продажам</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Продано</th>
                <th>Выручка</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                    Нет данных
                  </td>
                </tr>
              ) : (
                analytics.topProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.title}</td>
                    <td>{product.total_sold}</td>
                    <td>{Math.round(product.total_revenue).toLocaleString()} ₽</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics

