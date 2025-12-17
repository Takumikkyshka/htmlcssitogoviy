import { Link, useLocation, useNavigate } from 'react-router-dom'
import { smoothScrollTo } from '../utils/smoothScroll'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState, useMemo } from 'react'
import AuthModal from './AuthModal'
import './Header.css'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')
  const [isAdmin, setIsAdmin] = useState(false)

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    if (location.pathname === '/') {
      e.preventDefault()
      smoothScrollTo(anchor, 100)
    } else {
      e.preventDefault()
      navigate('/')
      setTimeout(() => {
        smoothScrollTo(anchor, 100)
      }, 100)
    }
  }

  useEffect(() => {
    setAuthModalMode('login')
  }, [])

  const isAdminValue = useMemo(() => {
    if (!isAuthenticated || !user) {
      return false
    }

    const userRole = (user as any)?.role
    const storedUser = localStorage.getItem('user')
    let parsedRole = null
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        parsedRole = parsedUser.role
      } catch (e) {
        // Игнорируем ошибки парсинга
      }
    }
    
    const storedRole = localStorage.getItem('userRole')
    const finalRole = userRole || parsedRole || storedRole
    
    return finalRole === 'admin'
  }, [isAuthenticated, user?.id, (user as any)?.role])

  useEffect(() => {
    setIsAdmin(isAdminValue)
  }, [isAdminValue])

  const handleAuthClick = () => {
    setAuthModalMode('login')
    setAuthModalOpen(true)
  }

  return (
    <>
      <header>
        <nav className="nav-container">
          <div className="nav-logo">
            <Link to="/">
              <img src="/assets/imgs/logo-no-bg-preview (carve.photos).png" alt="Логотип" />
            </Link>
          </div>
          <div className="nav-links">
            <a 
              href="#popular" 
              className="links"
              onClick={(e) => handleAnchorClick(e, 'popular')}
            >
              Главная
            </a>
            <Link to="/catalog" className="links">Каталог</Link>
            <Link to="/blog" className="links">Блог</Link>
            <Link to="/orders" className="links">Заказы</Link>
            <Link to="/favorites" className="links">Избранное</Link>
            <Link to="/cart" className="links">Корзина</Link>
            {isAuthenticated ? (
              <>
                <button 
                  type="button" 
                  className="links user-info"
                  onClick={() => navigate('/dashboard')}
                >
                  {user?.name || user?.email}
                </button>
                {(isAdmin || 
                  (user as any)?.email === 'admin@gmail.com' || 
                  (user as any)?.email === 'admin@admin.com' ||
                  localStorage.getItem('userRole') === 'admin') && (
                  <Link to="/admin" className="links">Админ-панель</Link>
                )}
                <button onClick={logout} className="links logout-btn">Выйти</button>
              </>
            ) : (
              <button onClick={handleAuthClick} className="links">Войти / Регистрация</button>
            )}
          </div>
        </nav>
      </header>
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  )
}

export default Header
