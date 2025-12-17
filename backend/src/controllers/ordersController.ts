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
      res.json({ data: rows })
    }
  )
}

export const createOrder = (req: AuthRequest, res: Response) => {
  const userId = req.userId
  const { productId, quantity = 1, address, cardNumber } = req.body

  console.log('Создание заказа:', { userId, productId, quantity, address: address ? 'указан' : 'не указан', cardNumber: cardNumber ? 'указан' : 'не указан' })

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  if (!productId) {
    return res.status(400).json({ error: 'ID товара обязателен' })
  }

  if (!address || !cardNumber) {
    return res.status(400).json({ error: 'Адрес и номер карты обязательны' })
  }

  // Проверяем существование пользователя
  db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user: any) => {
    if (err) {
      console.error('Ошибка проверки пользователя:', err)
      return res.status(500).json({ error: 'Ошибка проверки пользователя' })
    }

    if (!user) {
      console.error('Пользователь не найден:', userId)
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    // Получаем информацию о товаре
    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product: any) => {
      if (err) {
        console.error('Ошибка получения товара:', err)
        return res.status(500).json({ error: 'Ошибка получения товара' })
      }

      if (!product) {
        return res.status(404).json({ error: 'Товар не найден' })
      }

      // Парсим цену
      const price = parseFloat(product.price.replace(/[^\d.]/g, '')) || 0

      // Преобразуем userId в число, если это строка
      const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId
      const productIdNum = typeof productId === 'string' ? parseInt(productId, 10) : productId

      console.log('Создание заказа с параметрами:', { userIdNum, productIdNum, price, quantity })

      // Создаем заказ
      db.run(
        'INSERT INTO orders (user_id, product_id, product_title, price, quantity, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userIdNum, productIdNum, product.title, price, quantity, 'processing'],
        function(err) {
          if (err) {
            console.error('Ошибка создания заказа:', err)
            console.error('Детали ошибки:', err.message)
            console.error('Параметры:', { userIdNum, productIdNum, price, quantity })
            return res.status(500).json({ error: `Ошибка создания заказа: ${err.message}` })
          }

          // Возвращаем созданный заказ
          db.get(
            `SELECT o.*, p.title as product_title 
             FROM orders o
             LEFT JOIN products p ON o.product_id = p.id
             WHERE o.id = ?`,
            [this.lastID],
            (err, order: any) => {
              if (err) {
                console.error('Ошибка получения созданного заказа:', err)
                return res.status(500).json({ error: 'Заказ создан, но не удалось получить данные' })
              }
              res.status(201).json({ data: order })
            }
          )
        }
      )
    })
  })
}

export const cancelOrder = (req: AuthRequest, res: Response) => {
  const userId = req.userId
  const orderId = parseInt(req.params.id, 10)

  if (!userId) {
    return res.status(401).json({ error: 'Необходима авторизация' })
  }

  if (Number.isNaN(orderId)) {
    return res.status(400).json({ error: 'Некорректный ID заказа' })
  }

  // Разрешаем отменять только свои заказы и только если они не отменены
  db.run(
    `UPDATE orders 
     SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
     WHERE id = ? AND user_id = ? AND status != 'cancelled'`,
    [orderId, userId],
    function (err) {
      if (err) {
        console.error('Ошибка отмены заказа:', err)
        return res.status(500).json({ error: 'Ошибка отмены заказа' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Заказ не найден или уже отменён' })
      }

      db.get(
        `SELECT o.*, p.title as product_title 
         FROM orders o
         LEFT JOIN products p ON o.product_id = p.id
         WHERE o.id = ? AND o.user_id = ?`,
        [orderId, userId],
        (err, order: any) => {
          if (err) {
            console.error('Ошибка получения отменённого заказа:', err)
            return res.status(500).json({ error: 'Заказ отменён, но не удалось получить данные' })
          }

          res.json({ data: order })
        }
      )
    }
  )
}

