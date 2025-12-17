import { Request, Response } from 'express'
import db from '../database/init'
import { hashPassword, comparePassword } from '../utils/password'
import { generateToken } from '../utils/jwt'

interface RegisterRequest extends Request {
  body: {
    email: string
    password: string
    name?: string
  }
}

interface LoginRequest extends Request {
  body: {
    email: string
    password: string
  }
}

export const register = async (req: RegisterRequest, res: Response) => {
  try {
    const { email, password, name } = req.body

    // Валидация
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email и пароль обязательны для заполнения' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Пароль должен содержать минимум 6 символов' 
      })
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Некорректный формат email' 
      })
    }

    // Проверка существования пользователя
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, row: any) => {
        if (err) {
          console.error('Ошибка проверки пользователя:', err)
          return res.status(500).json({ error: 'Ошибка сервера' })
        }

        if (row) {
          return res.status(409).json({ error: 'Пользователь с таким email уже существует' })
        }

        // Хеширование пароля
        const hashedPassword = await hashPassword(password)

        // Создание пользователя
        db.run(
          'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
          [email, hashedPassword, name || null],
          function(err) {
            if (err) {
              console.error('Ошибка создания пользователя:', err)
              // Проверяем тип ошибки
              if (err.message && err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Пользователь с таким email уже существует' })
              }
              return res.status(500).json({ error: `Ошибка создания пользователя: ${err.message}` })
            }

            const userId = this.lastID

            // Получаем роль пользователя
            db.get('SELECT role FROM users WHERE id = ?', [userId], (err, userRow: any) => {
              if (err) {
                console.error('Ошибка получения роли пользователя:', err)
              }
              
              // Генерация токена
              const token = generateToken({
                id: userId,
                email: email
              })

              res.status(201).json({
                message: 'Пользователь успешно зарегистрирован',
                token,
                user: {
                  id: userId,
                  email,
                  name: name || null,
                  role: userRow?.role || 'user'
                }
              })
            })
          }
        )
      }
    )
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
}

export const login = async (req: LoginRequest, res: Response) => {
  try {
    const { email, password } = req.body

    // Валидация
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email и пароль обязательны для заполнения' 
      })
    }

    // Поиск пользователя
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, row: any) => {
        if (err) {
          console.error('Ошибка поиска пользователя:', err)
          return res.status(500).json({ error: 'Ошибка сервера' })
        }

        if (!row) {
          return res.status(401).json({ error: 'Неверный email или пароль' })
        }

        // Проверка пароля
        const isPasswordValid = await comparePassword(password, row.password)
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Неверный email или пароль' })
        }

        // Генерация токена
        const token = generateToken({
          id: row.id,
          email: row.email
        })

        // Убеждаемся, что роль правильно возвращается
        const userRole = row.role || 'user'
        console.log('Login - User role from DB:', userRole, 'for email:', row.email)
        
        res.json({
          message: 'Успешный вход в систему',
          token,
          user: {
            id: row.id,
            email: row.email,
            name: row.name,
            role: userRole
          }
        })
      }
    )
  } catch (error) {
    console.error('Ошибка входа:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
}
