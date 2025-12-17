import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import './styles/global.css'

// Убираем StrictMode в production для лучшей производительности
const isDevelopment = import.meta.env.DEV

const AppWrapper = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
)

const root = createRoot(document.getElementById('root')!)

if (isDevelopment) {
  root.render(
    <StrictMode>
      <AppWrapper />
    </StrictMode>
  )
} else {
  root.render(<AppWrapper />)
}

