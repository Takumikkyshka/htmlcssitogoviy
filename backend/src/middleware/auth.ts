import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export interface AuthRequest extends Request {
  userId?: number
  userEmail?: string
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return res.status(403).json({ error: 'Недействительный токен' })
  }

  req.userId = payload.userId
  req.userEmail = payload.email
  next()
}

