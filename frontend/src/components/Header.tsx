import { Link, useLocation } from 'react-router-dom'
import { smoothScrollTo } from '../utils/smoothScroll'

function Header() {
  const location = useLocation()

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    if (location.pathname === '/') {
      e.preventDefault()
      smoothScrollTo(anchor, 100)
    }
  }

  return (
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
          <Link to="/dashboard" className="links">Личный кабинет</Link>
        </div>
      </nav>
    </header>
  )
}

export default Header

