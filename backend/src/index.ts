import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './database/init'
import { runMigrations } from './database/migrations'
import authRoutes from './routes/authRoutes'
import postsRoutes from './routes/postsRoutes'
import productsRoutes from './routes/productsRoutes'
import musicRoutes from './routes/musicRoutes'
import ordersRoutes from './routes/ordersRoutes'
import favoritesRoutes from './routes/favoritesRoutes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Инициализация базы данных
initDatabase().then(() => {
  // Запуск миграций после инициализации
  runMigrations().then(() => {
    console.log('✅ Все миграции выполнены')
  }).catch((err) => {
    console.error('Ошибка выполнения миграций:', err)
  })
}).catch((err) => {
  console.error('Ошибка инициализации БД:', err)
})

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ 
    message: 'Blueberries API',
    version: '1.0.0',
    status: 'running'
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/music', musicRoutes)
app.use('/api/orders', ordersRoutes)
app.use('/api/favorites', favoritesRoutes)

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`)
  console.log(`📡 API доступен по адресу http://localhost:${PORT}`)
  console.log(`🔐 API авторизации: http://localhost:${PORT}/api/auth`)
})

export default app

