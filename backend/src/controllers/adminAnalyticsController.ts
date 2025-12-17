import { Response } from 'express'
import db from '../database/init'
import { AuthRequest } from '../middleware/auth'

// Получить общую аналитику
export const getAnalytics = (_req: AuthRequest, res: Response) => {
  db.serialize(() => {
    const analytics: any = {}

    // Общее количество заказов
    db.get('SELECT COUNT(*) as total FROM orders', [], (err, row: any) => {
      if (!err) analytics.totalOrders = row.total

      // Заказы по статусам
      db.all(
        `SELECT status, COUNT(*) as count 
         FROM orders 
         GROUP BY status`,
        [],
        (err, rows: any[]) => {
          if (!err) {
            analytics.ordersByStatus = rows.reduce((acc: any, row: any) => {
              acc[row.status] = row.count
              return acc
            }, {})
          }

          // Общая сумма продаж
          db.get(
            `SELECT SUM(price * quantity) as total 
             FROM orders 
             WHERE status != 'cancelled'`,
            [],
            (err, row: any) => {
              if (!err) analytics.totalRevenue = row.total || 0

              // Топ товаров по продажам
              db.all(
                `SELECT p.id, p.title, 
                        SUM(o.quantity) as total_sold,
                        SUM(o.price * o.quantity) as total_revenue
                 FROM orders o
                 JOIN products p ON o.product_id = p.id
                 WHERE o.status != 'cancelled'
                 GROUP BY p.id
                 ORDER BY total_sold DESC
                 LIMIT 10`,
                [],
                (err, rows: any[]) => {
                  if (!err) analytics.topProducts = rows

                  // Продажи по месяцам
                  db.all(
                    `SELECT 
                       strftime('%Y-%m', created_at) as month,
                       COUNT(*) as count,
                       SUM(price * quantity) as revenue
                     FROM orders
                     WHERE status != 'cancelled'
                     GROUP BY month
                     ORDER BY month DESC
                     LIMIT 12`,
                    [],
                    (err, rows: any[]) => {
                      if (!err) analytics.salesByMonth = rows

                      // Статистика пользователей
                      db.get('SELECT COUNT(*) as total FROM users', [], (err, row: any) => {
                        if (!err) analytics.totalUsers = row.total

                        // Статистика обзоров
                        db.get(
                          `SELECT 
                             COUNT(*) as total,
                             AVG(rating) as avg_rating,
                             COUNT(CASE WHEN approved = 1 THEN 1 END) as approved
                           FROM reviews`,
                          [],
                          (err, row: any) => {
                            if (!err) {
                              analytics.reviews = {
                                total: row.total,
                                avgRating: row.avg_rating ? parseFloat(row.avg_rating.toFixed(2)) : 0,
                                approved: row.approved
                              }
                            }

                            res.json({ data: analytics })
                          }
                        )
                      })
                    }
                  )
                }
              )
            }
          )
        }
      )
    })
  })
}

// Получить график продаж
export const getSalesChart = (req: AuthRequest, res: Response) => {
  const { period = 'month' } = req.query

  let dateFormat = '%Y-%m'
  if (period === 'day') dateFormat = '%Y-%m-%d'
  else if (period === 'week') dateFormat = '%Y-%W'

  db.all(
    `SELECT 
       strftime('${dateFormat}', created_at) as period,
       COUNT(*) as orders_count,
       SUM(price * quantity) as revenue
     FROM orders
     WHERE status != 'cancelled'
     GROUP BY period
     ORDER BY period DESC
     LIMIT 30`,
    [],
    (err, rows: any[]) => {
      if (err) {
        console.error('Ошибка получения графика продаж:', err)
        return res.status(500).json({ error: 'Ошибка получения графика продаж' })
      }
      res.json({ data: rows })
    }
  )
}

