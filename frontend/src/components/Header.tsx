import { Link } from 'react-router-dom'

function Header() {
  return (
    <header>
      <nav className="nav-container">
        <div className="nav-logo">
          <Link to="/">
            <img src="/assets/imgs/logo-no-bg-preview (carve.photos).png" alt="Логотип" />
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/#popular" className="links">Главная</Link>
          <Link to="/catalog" className="links">Каталог</Link>
          <Link to="/orders" className="links">Заказы</Link>
          <Link to="/#music" className="links">Музыка</Link>
          <Link to="/favorites" className="links">Избранное</Link>
          <Link to="/dashboard" className="links">Личный кабинет</Link>
        </div>
      </nav>
    </header>
  )
}

export default Header

