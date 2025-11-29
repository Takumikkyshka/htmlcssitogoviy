import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { initDatabase } from './database/init'

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
initDatabase()

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

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`)
  console.log(`📡 API доступен по адресу http://localhost:${PORT}`)
})

export default app

