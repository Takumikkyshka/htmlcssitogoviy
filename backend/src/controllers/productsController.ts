import { Response } from 'express'
import db from '../database/init'
import { AuthRequest } from '../middleware/auth'

export const getAllProducts = (_req: AuthRequest, res: Response) => {
  db.all(
    'SELECT * FROM products ORDER BY created_at DESC',
    [],
    (err, rows: any[]) => {
      if (err) {
        console.error('Ошибка получения товаров:', err)
        return res.status(500).json({ error: 'Ошибка получения товаров' })
      }
      res.json(rows)
    }
  )
}

export const getProductById = (req: AuthRequest, res: Response) => {
  const { id } = req.params

  db.get(
    'SELECT * FROM products WHERE id = ?',
    [id],
    (err, row: any) => {
      if (err) {
        console.error('Ошибка получения товара:', err)
        return res.status(500).json({ error: 'Ошибка получения товара' })
      }

      if (!row) {
        return res.status(404).json({ error: 'Товар не найден' })
      }

      res.json(row)
    }
  )
}

