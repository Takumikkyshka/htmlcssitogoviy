import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'blueberries-secret-key-2024'

export interface TokenPayload {
  id: number
  email: string
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // Токен действителен 7 дней
  })
}

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

