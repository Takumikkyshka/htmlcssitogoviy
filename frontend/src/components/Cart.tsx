import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { apiService } from '../services/api'
import CheckoutModal from './CheckoutModal'
import './Cart.css'

function Cart() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { items, removeFromCart, clearCart } = useCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0
    return sum + price * item.quantity
  }, 0)

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      alert('Войдите в аккаунт, чтобы оформить заказ')
      return
    }
    if (items.length === 0) return
    setCheckoutOpen(true)
  }

  const handleCheckoutConfirm = async (address: string, cardNumber: string) => {
    try {
      for (const item of items) {
        await apiService.createOrder(item.id, item.quantity, address, cardNumber)
      }
      alert('Заказ(ы) успешно оформлены!')
      clearCart()
      setCheckoutOpen(false)
      navigate('/dashboard')
    } catch (error) {
      console.error('Ошибка оформления заказа из корзины:', error)
      alert('Произошла ошибка при оформлении заказа')
    }
  }

  return (
    <section className="cart-section">
      <h2>Корзина</h2>

      {items.length === 0 ? (
        <div className="cart-empty">
          <p>Ваша корзина пуста.</p>
          <button className="links" onClick={() => navigate('/catalog')}>
            Перейти в каталог
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map(item => (
              <article key={item.id} className="cart-item">
                {item.image && (
                  <img src={item.image} alt={item.title} className="cart-item-image" />
                )}
                <div className="cart-item-info">
                  <h3>{item.title}</h3>
                  <p>{item.price}</p>
                  <p>Количество: {item.quantity}</p>
                  <button
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="cart-summary">
            <p className="cart-total">Итого: {total.toLocaleString('ru-RU')} ₽</p>
            <button className="links cart-checkout-btn" onClick={handleCheckoutClick}>
              Оформить заказ
            </button>
          </div>
        </>
      )}

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={handleCheckoutConfirm}
      />
    </section>
  )
}

export default Cart


