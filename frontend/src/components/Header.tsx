import { Link, useLocation, useNavigate } from 'react-router-dom'
import { smoothScrollTo } from '../utils/smoothScroll'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import AuthModal from './AuthModal'
import './Header.css'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')

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

  const handleLoginClick = () => {
    setAuthModalMode('login')
    setAuthModalOpen(true)
  }

  const handleRegisterClick = () => {
    setAuthModalMode('register')
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
            <Link to="/orders" className="links">Заказы</Link>
            <a 
              href="#music" 
              className="links"
              onClick={(e) => handleAnchorClick(e, 'music')}
            >
              Музыка
            </a>
            <Link to="/favorites" className="links">Избранное</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="links">Личный кабинет</Link>
                <span className="links user-info">{user?.name || user?.email}</span>
                <button onClick={logout} className="links logout-btn">Выйти</button>
              </>
            ) : (
              <>
                <button onClick={handleLoginClick} className="links">Войти</button>
                <button onClick={handleRegisterClick} className="links">Регистрация</button>
              </>
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
