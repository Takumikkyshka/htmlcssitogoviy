import { useState, useMemo } from 'react'
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
  // Данные для демонстрации
  const [orders] = useState<Order[]>([
    { id: 1, date: '2024-01-15', product: 'Клавиатура mchose jet75', price: 9000, status: 'completed', quantity: 1 },
    { id: 2, date: '2024-01-20', product: 'Компьютерная мышь mchose k7 ultra', price: 8500, status: 'completed', quantity: 2 },
    { id: 3, date: '2024-02-01', product: 'Дора - Кьют рок', price: 19, status: 'processing', quantity: 1 },
    { id: 4, date: '2024-02-05', product: 'Клавиатура mchose jet75', price: 9000, status: 'completed', quantity: 1 },
    { id: 5, date: '2024-02-10', product: 'Дора - Втюрилась', price: 19, status: 'cancelled', quantity: 1 },
    { id: 6, date: '2024-02-15', product: 'Компьютерная мышь mchose k7 ultra', price: 8500, status: 'completed', quantity: 1 },
  ])

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

  // Данные для графиков
  const salesData = {
    labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'],
    datasets: [
      {
        label: 'Продажи (руб.)',
        data: [17500, 26500, 18000, 22000, 19000, 24000],
        borderColor: '#1E90FF',
        backgroundColor: 'rgba(30, 144, 255, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const ordersData = {
    labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'],
    datasets: [
      {
        label: 'Количество заказов',
        data: [2, 4, 3, 5, 4, 6],
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
  }

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
  }

  const totalSpent = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.price * order.quantity, 0)

  const totalOrders = orders.length
  const completedOrders = orders.filter(o => o.status === 'completed').length

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
            <label htmlFor="sort-by">Сортировать по:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'product')}
              className="sort-select"
            >
              <option value="date">Дате</option>
              <option value="price">Цене</option>
              <option value="product">Товару</option>
            </select>
          </div>

          <button
            className="sort-order-button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
          </button>
        </div>

        {/* Таблица */}
        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Дата</th>
                <th>Товар</th>
                <th>Количество</th>
                <th>Цена</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{new Date(order.date).toLocaleDateString('ru-RU')}</td>
                  <td>{order.product}</td>
                  <td>{order.quantity}</td>
                  <td>{order.price.toLocaleString('ru-RU')} ₽</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status === 'completed' && 'Завершено'}
                      {order.status === 'processing' && 'В обработке'}
                      {order.status === 'cancelled' && 'Отменено'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Dashboard

