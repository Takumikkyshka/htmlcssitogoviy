import { initDatabase } from './init'
import { runMigrations } from './migrations'
import db from './init'

async function createBlogsForProducts() {
  try {
    await initDatabase()
    await runMigrations()

    // Получаем всех пользователей
    db.all('SELECT id FROM users LIMIT 1', [], (err, users: any[]) => {
      if (err || !users || users.length === 0) {
        console.error('Ошибка получения пользователей или пользователей нет')
        process.exit(1)
      }

      const userId = users[0].id

      // Получаем все товары
      db.all('SELECT * FROM products', [], (err, products: any[]) => {
        if (err) {
          console.error('Ошибка получения товаров:', err)
          process.exit(1)
        }

        if (!products || products.length === 0) {
          console.log('Товары не найдены')
          process.exit(0)
        }

        let completed = 0
        const total = products.length

        products.forEach((product) => {
          // Проверяем, есть ли уже блог для этого товара
          db.get(
            'SELECT id FROM posts WHERE product_id = ?',
            [product.id],
            (err, existingPost: any) => {
              if (err) {
                console.error(`Ошибка проверки поста для товара ${product.id}:`, err)
                completed++
                if (completed === total) process.exit(0)
                return
              }

              if (existingPost) {
                console.log(`⏭️  Блог для товара "${product.title}" уже существует`)
                completed++
                if (completed === total) {
                  console.log('✅ Все блоги проверены')
                  process.exit(0)
                }
                return
              }

              // Создаём блог для товара
              const blogTitle = `Обзор: ${product.title}`
              const blogContent = `Подробный обзор товара ${product.title}.\n\n${product.description}\n\nКатегория: ${product.category || 'не указана'}\nЦена: ${product.price}\n\nЭтот товар отлично подходит для использования в различных сценариях. Рекомендуем к покупке!`

              db.run(
                'INSERT INTO posts (user_id, title, content, category, product_id) VALUES (?, ?, ?, ?, ?)',
                [userId, blogTitle, blogContent, 'product_review', product.id],
                (err) => {
                  if (err) {
                    console.error(`Ошибка создания блога для товара ${product.id}:`, err)
                  } else {
                    console.log(`✅ Блог создан для товара: ${product.title}`)
                  }
                  completed++
                  if (completed === total) {
                    console.log('✅ Все блоги обработаны')
                    process.exit(0)
                  }
                }
              )
            }
          )
        })
      })
    })
  } catch (error) {
    console.error('Ошибка создания блогов:', error)
    process.exit(1)
  }
}

createBlogsForProducts()

