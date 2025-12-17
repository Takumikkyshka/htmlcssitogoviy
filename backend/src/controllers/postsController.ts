import { Response } from 'express'
import db from '../database/init'
import { AuthRequest } from '../middleware/auth'

interface Post {
  id: number
  user_id: number
  title: string
  content: string
  category: string
  created_at: string
  updated_at: string
}

// GET /api/posts - получить все отзывы (можно фильтровать по product_id)
export const getAllPosts = (req: AuthRequest, res: Response) => {
  const productId = req.query.product_id as string | undefined
  
  let query = `
    SELECT p.*, u.email, u.name as user_name, pr.title as product_title
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    LEFT JOIN products pr ON p.product_id = pr.id
  `
  const params: any[] = []
  
  if (productId) {
    query += ' WHERE p.product_id = ?'
    params.push(parseInt(productId, 10))
  }
  
  query += ' ORDER BY p.created_at DESC'
  
  db.all(query, params, (err, rows: any[]) => {
    if (err) {
      console.error('Ошибка получения отзывов:', err)
      return res.status(500).json({ error: 'Ошибка получения отзывов' })
    }
    res.json(rows)
  })
}

// GET /api/posts/:id - получить один отзыв
export const getPostById = (req: AuthRequest, res: Response) => {
  const { id } = req.params

  db.get(
    `SELECT p.*, u.email, u.name as user_name 
     FROM posts p 
     JOIN users u ON p.user_id = u.id 
     WHERE p.id = ?`,
    [id],
    (err, row: any) => {
      if (err) {
        console.error('Ошибка получения отзыва:', err)
        return res.status(500).json({ error: 'Ошибка получения отзыва' })
      }

      if (!row) {
        return res.status(404).json({ error: 'Отзыв не найден' })
      }

      res.json(row)
    }
  )
}

// POST /api/posts - создать отзыв (только авторизованные)
export const createPost = (req: AuthRequest, res: Response) => {
  const { title, content, category } = req.body
  const userId = req.userId

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  if (!title || !content) {
    return res.status(400).json({ error: 'Заголовок и содержание обязательны' })
  }

  const { product_id } = req.body
  
  db.run(
    'INSERT INTO posts (user_id, title, content, category, product_id) VALUES (?, ?, ?, ?, ?)',
    [userId, title, content, category || 'review', product_id || null],
    function(err) {
      if (err) {
        console.error('Ошибка создания отзыва:', err)
        return res.status(500).json({ error: 'Ошибка создания отзыва' })
      }

      // Получаем созданный отзыв
      db.get(
        `SELECT p.*, u.email, u.name as user_name 
         FROM posts p 
         JOIN users u ON p.user_id = u.id 
         WHERE p.id = ?`,
        [this.lastID],
        (err, row: any) => {
          if (err) {
            console.error('Ошибка получения созданного отзыва:', err)
            return res.status(500).json({ error: 'Отзыв создан, но не удалось получить данные' })
          }
          res.status(201).json(row)
        }
      )
    }
  )
}

// PUT /api/posts/:id - обновить отзыв (только автор)
export const updatePost = (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { title, content, category } = req.body
  const userId = req.userId

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  // Проверяем, существует ли отзыв и принадлежит ли он пользователю
  db.get(
    'SELECT * FROM posts WHERE id = ?',
    [id],
    (err, post: any) => {
      if (err) {
        console.error('Ошибка проверки отзыва:', err)
        return res.status(500).json({ error: 'Ошибка сервера' })
      }

      if (!post) {
        return res.status(404).json({ error: 'Отзыв не найден' })
      }

      if (post.user_id !== userId) {
        return res.status(403).json({ error: 'Нет доступа к редактированию этого отзыва' })
      }

      // Обновляем отзыв
      db.run(
        'UPDATE posts SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title || post.title, content || post.content, category || post.category, id],
        function(err) {
          if (err) {
            console.error('Ошибка обновления отзыва:', err)
            return res.status(500).json({ error: 'Ошибка обновления отзыва' })
          }

          // Получаем обновленный отзыв
          db.get(
            `SELECT p.*, u.email, u.name as user_name 
             FROM posts p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = ?`,
            [id],
            (err, row: any) => {
              if (err) {
                console.error('Ошибка получения обновленного отзыва:', err)
                return res.status(500).json({ error: 'Отзыв обновлен, но не удалось получить данные' })
              }
              res.json(row)
            }
          )
        }
      )
    }
  )
}

// DELETE /api/posts/:id - удалить отзыв (только автор)
export const deletePost = (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const userId = req.userId

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  // Проверяем, существует ли отзыв и принадлежит ли он пользователю
  db.get(
    'SELECT * FROM posts WHERE id = ?',
    [id],
    (err, post: any) => {
      if (err) {
        console.error('Ошибка проверки отзыва:', err)
        return res.status(500).json({ error: 'Ошибка сервера' })
      }

      if (!post) {
        return res.status(404).json({ error: 'Отзыв не найден' })
      }

      if (post.user_id !== userId) {
        return res.status(403).json({ error: 'Нет доступа к удалению этого отзыва' })
      }

      // Удаляем отзыв
      db.run(
        'DELETE FROM posts WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            console.error('Ошибка удаления отзыва:', err)
            return res.status(500).json({ error: 'Ошибка удаления отзыва' })
          }

          res.json({ message: 'Отзыв успешно удален' })
        }
      )
    }
  )
}

