import { Response } from 'express'
import db from '../database/init'
import { AuthRequest } from '../middleware/auth'

export const getUserOrders = (req: AuthRequest, res: Response) => {
  const userId = req.userId

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  db.all(
    `SELECT o.*, p.title as product_title, p.price as product_price
     FROM orders o
     LEFT JOIN products p ON o.product_id = p.id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`,
    [userId],
    (err, rows: any[]) => {
      if (err) {
        console.error('Ошибка получения заказов:', err)
        return res.status(500).json({ error: 'Ошибка получения заказов' })
      }
      res.json(rows)
    }
  )
}

