import { Response } from 'express'
import db from '../database/init'
import { AuthRequest } from '../middleware/auth'

// Получить все товары с количеством обзоров
export const getAllProducts = (_req: AuthRequest, res: Response) => {
  db.all(
    `SELECT p.*, 
     COALESCE(COUNT(r.id), 0) as review_count
     FROM products p
     LEFT JOIN reviews r ON p.id = r.product_id AND r.approved = 1
     GROUP BY p.id
     ORDER BY p.created_at DESC`,
    [],
    (err, rows: any[]) => {
      if (err) {
        console.error('Ошибка получения товаров:', err)
        return res.status(500).json({ error: 'Ошибка получения товаров' })
      }
      res.json({ data: rows })
    }
  )
}

// Получить товар по ID
export const getProductById = (req: AuthRequest, res: Response) => {
  const { id } = req.params

  db.get(
    `SELECT p.*, 
     COALESCE(COUNT(r.id), 0) as review_count
     FROM products p
     LEFT JOIN reviews r ON p.id = r.product_id AND r.approved = 1
     WHERE p.id = ?
     GROUP BY p.id`,
    [id],
    (err, row: any) => {
      if (err) {
        console.error('Ошибка получения товара:', err)
        return res.status(500).json({ error: 'Ошибка получения товара' })
      }

      if (!row) {
        return res.status(404).json({ error: 'Товар не найден' })
      }

      res.json({ data: row })
    }
  )
}

// Создать товар
export const createProduct = (req: AuthRequest, res: Response) => {
  const { title, description, price, category, video, poster, image } = req.body

  if (!title || !description || !price) {
    return res.status(400).json({ error: 'Название, описание и цена обязательны' })
  }

  db.run(
    `INSERT INTO products (title, description, price, category, video, poster, image, review_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    [title, description, price, category || 'other', video || null, poster || null, image || null],
    function (err) {
      if (err) {
        console.error('Ошибка создания товара:', err)
        return res.status(500).json({ error: 'Ошибка создания товара' })
      }

      db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, product: any) => {
        if (err) {
          return res.status(500).json({ error: 'Товар создан, но не удалось получить данные' })
        }
        res.status(201).json({ data: product })
      })
    }
  )
}

// Обновить товар
export const updateProduct = (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { title, description, price, category, video, poster, image } = req.body

  db.run(
    `UPDATE products 
     SET title = COALESCE(?, title),
         description = COALESCE(?, description),
         price = COALESCE(?, price),
         category = COALESCE(?, category),
         video = COALESCE(?, video),
         poster = COALESCE(?, poster),
         image = COALESCE(?, image),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, description, price, category, video, poster, image, id],
    function (err) {
      if (err) {
        console.error('Ошибка обновления товара:', err)
        return res.status(500).json({ error: 'Ошибка обновления товара' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Товар не найден' })
      }

      db.get('SELECT * FROM products WHERE id = ?', [id], (err, product: any) => {
        if (err) {
          return res.status(500).json({ error: 'Товар обновлён, но не удалось получить данные' })
        }
        res.json({ data: product })
      })
    }
  )
}

// Удалить товар
export const deleteProduct = (req: AuthRequest, res: Response) => {
  const { id } = req.params

  db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Ошибка удаления товара:', err)
      return res.status(500).json({ error: 'Ошибка удаления товара' })
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Товар не найден' })
    }

    res.json({ message: 'Товар успешно удалён' })
  })
}

