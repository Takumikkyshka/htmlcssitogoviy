import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react'

export interface CartItem {
  id: number
  title: string
  price: string
  image?: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (id: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const value = useMemo(() => ({
    items,
    addToCart,
    removeFromCart,
    clearCart
  }), [items, addToCart, removeFromCart, clearCart])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}


