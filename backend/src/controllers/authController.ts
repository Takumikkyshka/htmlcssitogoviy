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
              return res.status(500).json({ error: 'Ошибка создания пользователя' })
            }

            // Генерация токена
            const token = generateToken({
              id: this.lastID,
              email: email
            })

            res.status(201).json({
              message: 'Пользователь успешно зарегистрирован',
              token,
              user: {
                id: this.lastID,
                email,
                name: name || null
              }
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

        res.json({
          message: 'Успешный вход в систему',
          token,
          user: {
            id: row.id,
            email: row.email,
            name: row.name
          }
        })
      }
    )
  } catch (error) {
    console.error('Ошибка входа:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
}

