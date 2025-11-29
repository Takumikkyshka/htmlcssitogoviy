import { useState } from 'react'
import './BuyModal.css'

interface BuyModalProps {
  product: {
    id: number
    title: string
    price: string
  }
  isOpen: boolean
  onClose: () => void
  onConfirm: (address: string, cardNumber: string) => void
}

function BuyModal({ product, isOpen, onClose, onConfirm }: BuyModalProps) {
  const [address, setAddress] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [errors, setErrors] = useState<{ address?: string; cardNumber?: string }>({})

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: { address?: string; cardNumber?: string } = {}
    
    if (!address.trim()) {
      newErrors.address = 'Адрес обязателен'
    }
    
    if (!cardNumber.trim()) {
      newErrors.cardNumber = 'Номер карты обязателен'
    } else if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Номер карты должен содержать 16 цифр'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onConfirm(address.trim(), cardNumber.replace(/\s/g, ''))
    setAddress('')
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
        <div className="buy-modal-product">
          <h3>{product.title}</h3>
          <p className="buy-modal-price">{product.price}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="buy-modal-field">
            <label htmlFor="address">Адрес доставки *</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Введите адрес доставки"
              rows={3}
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
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
            {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
          </div>
          
          <div className="buy-modal-actions">
            <button type="button" onClick={onClose} className="buy-modal-cancel">
              Отмена
            </button>
            <button type="submit" className="buy-modal-submit">
              Оформить заказ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BuyModal

