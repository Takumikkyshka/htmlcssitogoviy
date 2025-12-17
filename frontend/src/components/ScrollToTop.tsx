import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { smoothScrollToTop } from '../utils/smoothScroll'
import { useCart } from '../context/CartContext'
import './ScrollToTop.css'

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const { items } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className={`floating-actions ${isVisible ? 'visible' : ''}`}>
      <button
        className="scroll-to-top"
        onClick={smoothScrollToTop}
        aria-label="Прокрутить наверх"
      >
        ↑
      </button>
      <button
        className="cart-shortcut"
        onClick={() => navigate('/cart')}
        aria-label="Перейти в корзину"
      >
        🧺
        {cartCount > 0 && (
          <span className="cart-shortcut-badge">{cartCount}</span>
        )}
      </button>
    </div>
  )
}

export default ScrollToTop

