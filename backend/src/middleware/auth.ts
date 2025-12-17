import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import db from '../database/init'

export interface AuthRequest extends Request {
  userId?: number
  userEmail?: string
  userRole?: string
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    console.log('❌ No token provided for:', req.method, req.path)
    return res.status(401).json({ error: 'Токен доступа не предоставлен' })
  }

  try {
    const payload = verifyToken(token) as { id: number; email: string }
    req.userId = payload.id
    req.userEmail = payload.email
    
    // Получаем роль пользователя из БД
    db.get('SELECT role FROM users WHERE id = ?', [payload.id], (err, user: any) => {
      if (err) {
        console.error('Ошибка получения роли пользователя:', err)
        req.userRole = 'user'
        return next()
      }
      
      if (!user) {
        req.userRole = 'user'
      } else {
        req.userRole = user.role || 'user'
      }
      console.log('✅ Token verified, user role:', req.userRole, 'for user:', req.userEmail)
      next()
    })
  } catch (error) {
    console.log('❌ Invalid token for:', req.method, req.path, error)
    return res.status(403).json({ error: 'Недействительный или истекший токен' })
  }
}

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.userId) {
    console.log('❌ No userId for admin check')
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  if (req.userRole !== 'admin') {
    console.log('❌ User is not admin. Role:', req.userRole, 'User:', req.userEmail)
    return res.status(403).json({ error: 'Доступ запрещён. Требуются права администратора' })
  }

  console.log('✅ Admin access granted for:', req.userEmail)
  next()
}

