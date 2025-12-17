import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminProducts from './admin/AdminProducts'
import AdminOrders from './admin/AdminOrders'
import AdminUsers from './admin/AdminUsers'
import AdminReviews from './admin/AdminReviews'
import './AdminPanel.css'

type Tab = 'products' | 'orders' | 'users' | 'reviews'

function AdminPanel() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('products')

  // Проверка прав администратора (в реальном приложении это должно проверяться на бэкенде)
  if (!isAuthenticated) {
    return (
      <section className="admin-section">
        <div className="admin-error">
          <h2>Доступ запрещён</h2>
          <p>Для доступа к админ-панели необходимо авторизоваться.</p>
          <button className="links" onClick={() => navigate('/')}>
            На главную
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-section">
      <div className="admin-header">
        <h1>Админ-панель</h1>
        <p>Управление маркетплейсом Blueberries</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Товары
        </button>
        <button
          className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📊 Заказы
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Пользователи
        </button>
        <button
          className={`admin-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          📝 Обзоры
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'products' && <AdminProducts />}
        {activeTab === 'orders' && <AdminOrders />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'reviews' && <AdminReviews />}
      </div>
    </section>
  )
}

export default AdminPanel

