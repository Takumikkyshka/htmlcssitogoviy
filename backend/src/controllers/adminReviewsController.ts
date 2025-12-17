import { Response } from 'express'
import db from '../database/init'
import { AuthRequest } from '../middleware/auth'

// Получить все обзоры с фильтрацией
export const getAllReviews = (req: AuthRequest, res: Response) => {
  const { productId, userId, approved, rating } = req.query

  let query = `
    SELECT r.*,
           u.email as user_email,
           u.name as user_name,
           p.title as product_title
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN products p ON r.product_id = p.id
    WHERE 1=1
  `
  const params: any[] = []

  if (productId) {
    query += ' AND r.product_id = ?'
    params.push(productId)
  }

  if (userId) {
    query += ' AND r.user_id = ?'
    params.push(userId)
  }

  if (approved !== undefined) {
    query += ' AND r.approved = ?'
    params.push(approved === 'true' ? 1 : 0)
  }

  if (rating) {
    query += ' AND r.rating = ?'
    params.push(rating)
  }

  query += ' ORDER BY r.created_at DESC'

  db.all(query, params, (err, rows: any[]) => {
    if (err) {
      console.error('Ошибка получения обзоров:', err)
      return res.status(500).json({ error: 'Ошибка получения обзоров' })
    }
    res.json({ data: rows })
  })
}

// Создать обзор (админ может создать от имени любого пользователя)
export const createReview = (req: AuthRequest, res: Response) => {
  const { userId, productId, rating, text } = req.body

  if (!userId || !productId || !rating || !text) {
    return res.status(400).json({ error: 'Все поля обязательны: userId, productId, rating, text' })
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' })
  }

  // Проверяем, существует ли пользователь и товар
  db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user: any) => {
    if (err) {
      console.error('Ошибка проверки пользователя:', err)
      return res.status(500).json({ error: 'Ошибка проверки пользователя' })
    }

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    db.get('SELECT id FROM products WHERE id = ?', [productId], (err, product: any) => {
      if (err) {
        console.error('Ошибка проверки товара:', err)
        return res.status(500).json({ error: 'Ошибка проверки товара' })
      }

      if (!product) {
        return res.status(404).json({ error: 'Товар не найден' })
      }

      // Создаем обзор
      db.run(
        'INSERT INTO reviews (user_id, product_id, rating, text, approved) VALUES (?, ?, ?, ?, ?)',
        [userId, productId, rating, text, 1], // Одобрен по умолчанию для админа
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
              res.status(201).json({ data: row })
            }
          )
        }
      )
    })
  })
}

// Получить обзор по ID
export const getReviewById = (req: AuthRequest, res: Response) => {
  const { id } = req.params

  db.get(
    `SELECT r.*,
           u.email as user_email,
           u.name as user_name,
           p.title as product_title
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN products p ON r.product_id = p.id
    WHERE r.id = ?`,
    [id],
    (err, row: any) => {
      if (err) {
        console.error('Ошибка получения обзора:', err)
        return res.status(500).json({ error: 'Ошибка получения обзора' })
      }

      if (!row) {
        return res.status(404).json({ error: 'Обзор не найден' })
      }

      res.json({ data: row })
    }
  )
}

// Одобрить/скрыть обзор
export const toggleReviewApproval = (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { approved } = req.body

  const approvedValue = approved === true || approved === 1 ? 1 : 0

  db.run(
    `UPDATE reviews 
     SET approved = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [approvedValue, id],
    function (err) {
      if (err) {
        console.error('Ошибка обновления обзора:', err)
        return res.status(500).json({ error: 'Ошибка обновления обзора' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Обзор не найден' })
      }

      // Обновляем review_count в products
      db.get('SELECT product_id FROM reviews WHERE id = ?', [id], (err, review: any) => {
        if (!err && review) {
          db.get(
            'SELECT COUNT(*) as count FROM reviews WHERE product_id = ? AND approved = 1',
            [review.product_id],
            (err, result: any) => {
              if (!err && result) {
                db.run(
                  'UPDATE products SET review_count = ? WHERE id = ?',
                  [result.count, review.product_id]
                )
              }
            }
          )
        }
      })

      db.get(
        `SELECT r.*,
               u.email as user_email,
               u.name as user_name,
               p.title as product_title
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.id = ?`,
        [id],
        (err, review: any) => {
          if (err) {
            return res.status(500).json({ error: 'Обзор обновлён, но не удалось получить данные' })
          }
          res.json({ data: review })
        }
      )
    }
  )
}

// Добавить ответ администратора
export const addAdminResponse = (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { admin_response } = req.body

  if (!admin_response || !admin_response.trim()) {
    return res.status(400).json({ error: 'Ответ администратора обязателен' })
  }

  db.run(
    `UPDATE reviews 
     SET admin_response = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [admin_response.trim(), id],
    function (err) {
      if (err) {
        console.error('Ошибка добавления ответа:', err)
        return res.status(500).json({ error: 'Ошибка добавления ответа' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Обзор не найден' })
      }

      db.get(
        `SELECT r.*,
               u.email as user_email,
               u.name as user_name,
               p.title as product_title
        FROM reviews r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN products p ON r.product_id = p.id
        WHERE r.id = ?`,
        [id],
        (err, review: any) => {
          if (err) {
            return res.status(500).json({ error: 'Ответ добавлен, но не удалось получить данные' })
          }
          res.json({ data: review })
        }
      )
    }
  )
}

// Удалить обзор
export const deleteReview = (req: AuthRequest, res: Response) => {
  const { id } = req.params

  // Получаем product_id перед удалением
  db.get('SELECT product_id FROM reviews WHERE id = ?', [id], (err, review: any) => {
    if (err) {
      console.error('Ошибка получения обзора:', err)
      return res.status(500).json({ error: 'Ошибка получения обзора' })
    }

    if (!review) {
      return res.status(404).json({ error: 'Обзор не найден' })
    }

    db.run('DELETE FROM reviews WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Ошибка удаления обзора:', err)
        return res.status(500).json({ error: 'Ошибка удаления обзора' })
      }

      // Обновляем review_count в products
      db.get(
        'SELECT COUNT(*) as count FROM reviews WHERE product_id = ? AND approved = 1',
        [review.product_id],
        (err, result: any) => {
          if (!err && result) {
            db.run(
              'UPDATE products SET review_count = ? WHERE id = ?',
              [result.count, review.product_id]
            )
          }
        }
      )

      res.json({ message: 'Обзор успешно удалён' })
    })
  })
}

// Автогенерация обзоров для всех товаров
export const generateReviewsForAllProducts = (req: AuthRequest, res: Response) => {
  db.all('SELECT * FROM products', [], (err, products: any[]) => {
    if (err) {
      console.error('Ошибка получения товаров:', err)
      return res.status(500).json({ error: 'Ошибка получения товаров' })
    }

    // Получаем первого пользователя (или создаём системного)
    db.get('SELECT id FROM users LIMIT 1', [], (err, user: any) => {
      if (err || !user) {
        return res.status(500).json({ error: 'Не найден пользователь для создания обзоров' })
      }

      const userId = user.id
      let completed = 0
      const total = products.length
      const generatedReviews: any[] = []

      if (total === 0) {
        return res.json({ message: 'Нет товаров для создания обзоров', data: [] })
      }

      products.forEach((product) => {
        // Генерируем обзор на основе характеристик товара
        const rating = 4 // По умолчанию 4 звезды
        const reviewText = `Обзор товара "${product.title}". ${product.description || ''} Ключевые характеристики: категория - ${product.category || 'не указана'}. Рекомендации по использованию: товар подходит для работы и учёбы. Общий рейтинг: ${rating}/5.`

        db.run(
          `INSERT INTO reviews (user_id, product_id, rating, text, approved, likes)
           VALUES (?, ?, ?, ?, 1, 0)`,
          [userId, product.id, rating, reviewText],
          function (err) {
            if (err) {
              console.error(`Ошибка создания обзора для товара ${product.id}:`, err)
            } else {
              generatedReviews.push({
                product_id: product.id,
                product_title: product.title,
                review_id: this.lastID
              })
            }

            completed++
            if (completed === total) {
              // Обновляем review_count для всех товаров
              products.forEach((p) => {
                db.get(
                  'SELECT COUNT(*) as count FROM reviews WHERE product_id = ? AND approved = 1',
                  [p.id],
                  (err, result: any) => {
                    if (!err && result) {
                      db.run(
                        'UPDATE products SET review_count = ? WHERE id = ?',
                        [result.count, p.id]
                      )
                    }
                  }
                )
              })

              res.json({
                message: `Создано ${generatedReviews.length} обзоров для ${total} товаров`,
                data: generatedReviews
              })
            }
          }
        )
      })
    })
  })
}

