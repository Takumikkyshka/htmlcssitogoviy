import { Response } from 'express'
import db from '../database/init'
import { AuthRequest } from '../middleware/auth'

export const getFavorites = (req: AuthRequest, res: Response) => {
  const userId = req.userId

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  db.all(
    `SELECT p.* 
     FROM favorites f
     JOIN products p ON f.product_id = p.id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC`,
    [userId],
    (err, rows: any[]) => {
      if (err) {
        console.error('Ошибка получения избранного:', err)
        return res.status(500).json({ error: 'Ошибка получения избранного' })
      }
      res.json(rows)
    }
  )
}

export const addToFavorites = (req: AuthRequest, res: Response) => {
  const userId = req.userId
  const { productId } = req.body

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  if (!productId) {
    return res.status(400).json({ error: 'ID товара обязателен' })
  }

  db.run(
    'INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)',
    [userId, productId],
    function(err) {
      if (err) {
        console.error('Ошибка добавления в избранное:', err)
        return res.status(500).json({ error: 'Ошибка добавления в избранное' })
      }

      if (this.changes === 0) {
        return res.status(409).json({ error: 'Товар уже в избранном' })
      }

      res.status(201).json({ message: 'Товар добавлен в избранное' })
    }
  )
}

export const removeFromFavorites = (req: AuthRequest, res: Response) => {
  const userId = req.userId
  const { productId } = req.params

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  db.run(
    'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
    [userId, productId],
    function(err) {
      if (err) {
        console.error('Ошибка удаления из избранного:', err)
        return res.status(500).json({ error: 'Ошибка удаления из избранного' })
      }

      res.json({ message: 'Товар удален из избранного' })
    }
  )
}

export const checkFavorite = (req: AuthRequest, res: Response) => {
  const userId = req.userId
  const { productId } = req.params

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  db.get(
    'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?',
    [userId, productId],
    (err, row: any) => {
      if (err) {
        console.error('Ошибка проверки избранного:', err)
        return res.status(500).json({ error: 'Ошибка проверки избранного' })
      }

      res.json({ isFavorite: !!row })
    }
  )
}

