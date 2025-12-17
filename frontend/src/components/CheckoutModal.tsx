import { useState } from 'react'
import './BuyModal.css'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (address: string, cardNumber: string) => void
}

const PICKUP_POINTS = [
  'Магазин Blueberries - Центральный, г. Ростов-на-Дону, ул. Большая Садовая д. 77',
  'Пункт выдачи заказов - Северный, г. Ростов-на-Дону, пр. Буденновский, 50',
  'Пункт выдачи заказов - Южный, г. Ростов-на-Дону, ул. Красноармейская, 100',
]

function CheckoutModal({ isOpen, onClose, onConfirm }: CheckoutModalProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [selectedPickup, setSelectedPickup] = useState<string>(PICKUP_POINTS[0])
  const [errors, setErrors] = useState<{ cardNumber?: string }>({})

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: { cardNumber?: string } = {}

    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Номер карты обязателен'
    } else if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Номер карты должен содержать 16 цифр'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onConfirm(selectedPickup, cardNumber.replace(/\s/g, ''))
    setCardNumber('')
    setErrors({})
  }

  const handleCardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '')
    if (value.length > 16) return
    value = value.match(/.{1,4}/g)?.join(' ') || value
    setCardNumber(value)
  }

  return (
    <div className="buy-modal-overlay" onClick={onClose}>
      <div className="buy-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Оформление заказа</h2>

        <form onSubmit={handleSubmit}>
          <div className="buy-modal-field">
            <label htmlFor="pickup">Выберите пункт выдачи *</label>
            <select
              id="pickup"
              value={selectedPickup}
              onChange={(e) => setSelectedPickup(e.target.value)}
            >
              {PICKUP_POINTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="buy-modal-field">
            <label htmlFor="cardNumber">Номер банковской карты *</label>
            <input
              type="text"
              id="cardNumber"
              value={cardNumber}
              onChange={handleCardInput}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className={errors.cardNumber ? 'error' : ''}
            />
            {errors.cardNumber && (
              <span className="error-message">{errors.cardNumber}</span>
            )}
          </div>

          <div className="buy-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="buy-modal-cancel"
            >
              Отмена
            </button>
            <button type="submit" className="buy-modal-submit">
              Оплатить и оформить
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CheckoutModal


