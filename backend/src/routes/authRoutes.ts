import { Router, Request, Response } from 'express'
import { register, login } from '../controllers/authController'

const router = Router()

// Информация о доступных эндпоинтах
router.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API авторизации',
    endpoints: {
      register: {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Регистрация нового пользователя',
        body: {
          email: 'string (required)',
          password: 'string (required, min 6 chars)',
          name: 'string (optional)'
        }
      },
      login: {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Вход в систему',
        body: {
          email: 'string (required)',
          password: 'string (required)'
        }
      }
    }
  })
})

router.post('/register', register)
router.post('/login', login)

export default router

