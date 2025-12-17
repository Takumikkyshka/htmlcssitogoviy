import { Response } from 'express'
import db from '../database/init'
import { AuthRequest } from '../middleware/auth'

// Создать обзор (для обычных пользователей)
export const createReview = (req: AuthRequest, res: Response) => {
  const { productId, rating, text } = req.body
  const userId = req.userId

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  if (!productId || !rating || !text) {
    return res.status(400).json({ error: 'Все поля обязательны: productId, rating, text' })
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' })
  }

  // Проверяем, существует ли товар
  db.get('SELECT id FROM products WHERE id = ?', [productId], (err, product: any) => {
    if (err) {
      console.error('Ошибка проверки товара:', err)
      return res.status(500).json({ error: 'Ошибка проверки товара' })
    }

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' })
    }

    // Проверяем, не оставлял ли пользователь уже обзор на этот товар
    db.get(
      'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
      [userId, productId],
      (err, existingReview: any) => {
        if (err) {
          console.error('Ошибка проверки существующего обзора:', err)
          return res.status(500).json({ error: 'Ошибка проверки обзора' })
        }

        if (existingReview) {
          return res.status(409).json({ error: 'Вы уже оставили обзор на этот товар' })
        }

        // Создаем обзор (не одобрен по умолчанию, требует модерации)
        db.run(
          'INSERT INTO reviews (user_id, product_id, rating, text, approved) VALUES (?, ?, ?, ?, ?)',
          [userId, productId, rating, text, 0], // Не одобрен по умолчанию
          function(insertErr) {
            if (insertErr) {
              console.error('Ошибка создания обзора:', insertErr)
              return res.status(500).json({ error: 'Ошибка создания обзора' })
            }

            // Получаем созданный обзор
            db.get(
              `SELECT r.*, u.email as user_email, u.name as user_name, p.title as product_title
               FROM reviews r
               LEFT JOIN users u ON r.user_id = u.id
               LEFT JOIN products p ON r.product_id = p.id
               WHERE r.id = ?`,
              [this.lastID],
              (err, row: any) => {
                if (err) {
                  console.error('Ошибка получения созданного обзора:', err)
                  return res.status(500).json({ error: 'Обзор создан, но не удалось получить данные' })
                }
                res.status(201).json(row)
              }
            )
          }
        )
      }
    )
  })
}

// Получить обзоры для товара (публичный доступ)
export const getProductReviews = (req: AuthRequest, res: Response) => {
  const { productId } = req.params

  db.all(
    `SELECT r.*, u.email as user_email, u.name as user_name
     FROM reviews r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.product_id = ? AND r.approved = 1
     ORDER BY r.created_at DESC`,
    [productId],
    (err, rows: any[]) => {
      if (err) {
        console.error('Ошибка получения обзоров:', err)
        return res.status(500).json({ error: 'Ошибка получения обзоров' })
      }
      res.json(rows)
    }
  )
}

