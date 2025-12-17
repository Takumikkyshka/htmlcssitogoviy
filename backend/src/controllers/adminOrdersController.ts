import { Response } from 'express'
import db from '../database/init'
import { AuthRequest } from '../middleware/auth'

// Получить все заказы с фильтрацией
export const getAllOrders = (req: AuthRequest, res: Response) => {
  const { status, userId, productId } = req.query

  let query = `
    SELECT o.*, 
           u.email as user_email,
           u.name as user_name,
           p.title as product_title
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN products p ON o.product_id = p.id
    WHERE 1=1
  `
  const params: any[] = []

  if (status) {
    query += ' AND o.status = ?'
    params.push(status)
  }

  if (userId) {
    query += ' AND o.user_id = ?'
    params.push(userId)
  }

  if (productId) {
    query += ' AND o.product_id = ?'
    params.push(productId)
  }

  query += ' ORDER BY o.created_at DESC'

  db.all(query, params, (err, rows: any[]) => {
    if (err) {
      console.error('Ошибка получения заказов:', err)
      return res.status(500).json({ error: 'Ошибка получения заказов' })
    }
    res.json({ data: rows })
  })
}

// Получить заказ по ID
export const getOrderById = (req: AuthRequest, res: Response) => {
  const { id } = req.params

  db.get(
    `SELECT o.*, 
           u.email as user_email,
           u.name as user_name,
           p.title as product_title
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN products p ON o.product_id = p.id
    WHERE o.id = ?`,
    [id],
    (err, row: any) => {
      if (err) {
        console.error('Ошибка получения заказа:', err)
        return res.status(500).json({ error: 'Ошибка получения заказа' })
      }

      if (!row) {
        return res.status(404).json({ error: 'Заказ не найден' })
      }

      res.json({ data: row })
    }
  )
}

// Обновить статус заказа
export const updateOrderStatus = (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { status } = req.body

  const allowedStatuses = ['processing', 'completed', 'cancelled']
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Некорректный статус заказа' })
  }

  db.run(
    `UPDATE orders 
     SET status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) {
        console.error('Ошибка обновления заказа:', err)
        return res.status(500).json({ error: 'Ошибка обновления заказа' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Заказ не найден' })
      }

      db.get(
        `SELECT o.*, 
               u.email as user_email,
               u.name as user_name,
               p.title as product_title
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN products p ON o.product_id = p.id
        WHERE o.id = ?`,
        [id],
        (err, order: any) => {
          if (err) {
            return res.status(500).json({ error: 'Заказ обновлён, но не удалось получить данные' })
          }
          res.json({ data: order })
        }
      )
    }
  )
}

