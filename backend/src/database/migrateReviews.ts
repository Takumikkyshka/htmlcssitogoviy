import { initDatabase } from './init'
import { runMigrations } from './migrations'
import db from './init'

// Временные данные отзывов по товарам (из productsController.ts)
const productReviews: Record<number, { author: string; rating: number; content: string }[]> = {
  1: [
    {
      author: 'Алексей',
      rating: 5,
      content: 'Клавиатура просто пушка. Свитчи плавные, подсветка ровная, печатать и играть одно удовольствие.'
    },
    {
      author: 'Марина',
      rating: 4,
      content: 'Брала для работы и игр. Немного громче, чем ожидала, но по ощущениям топ.'
    },
    {
      author: 'Игорь',
      rating: 5,
      content: 'После этой клавы на ноутбуке печатать невозможно. Реально другой уровень.'
    },
  ],
  2: [
    {
      author: 'Денис',
      rating: 5,
      content: 'Очень лёгкая мышь, рука вообще не устает. Сенсор точный, кабелей нет — кайф.'
    },
    {
      author: 'Сергей',
      rating: 4,
      content: 'Кнопки кликают приятно, форма зашла. Чуть дороговата, но не жалею.'
    },
    {
      author: 'Катя',
      rating: 5,
      content: 'Подарила парню, он в восторге, говорит, лучший апгрейд для шутеров.'
    },
  ],
  3: [
    {
      author: 'Олег',
      rating: 5,
      content: 'Уши сидят удобно, не давят, звук чистый. Для своей цены прям отлично.'
    },
    {
      author: 'Никита',
      rating: 4,
      content: 'Басы нормальные, микрофон для дискорда хватает. Немного греются уши после пары часов.'
    },
    {
      author: 'Анна',
      rating: 5,
      content: 'Играю и смотрю фильмы только в них. Шума вокруг почти не слышно.'
    },
  ],
  4: [
    {
      author: 'Роман',
      rating: 5,
      content: 'Лёгкие, беспроводные, звук чёткий. Для игр и музыки — идеальный вариант.'
    },
    {
      author: 'Влад',
      rating: 4,
      content: 'Немного туговатое оголовье, но звук и микрофон радуют. Брал для PS5 — работает без проблем.'
    },
    {
      author: 'Евгения',
      rating: 5,
      content: 'Смотрятся стильно, батарея держится долго. Очень довольна покупкой.'
    },
  ],
  5: [
    {
      author: 'Илья',
      rating: 5,
      content: 'Подключил ноут к монитору — картинка и звук без артефактов. Длина кабеля удобная.'
    },
    {
      author: 'Павел',
      rating: 4,
      content: 'Качество сборки норм, разъёмы не люфтят. Пользуюсь для презентаций — всё стабильно.'
    },
    {
      author: 'Юлия',
      rating: 5,
      content: 'Брала для подключения планшета к ТВ. Всё работает сразу, без танцев с бубном.'
    },
  ],
}

function createUserIfNotExists(author: string): Promise<number> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM users WHERE name = ? OR email = ?',
      [author, `${author.toLowerCase()}@example.com`],
      (err, user: any) => {
        if (err) {
          return reject(err)
        }

        if (user) {
          return resolve(user.id)
        }

        // Создаем пользователя
        db.run(
          'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
          [`${author.toLowerCase()}@example.com`, '$2a$10$dummy', author],
          function(insertErr) {
            if (insertErr) {
              return reject(insertErr)
            }
            resolve(this.lastID)
          }
        )
      }
    )
  })
}

function createReviewIfNotExists(userId: number, productId: number, rating: number, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ? AND text = ?',
      [productId, userId, text],
      (err, existingReview: any) => {
        if (err) {
          return reject(err)
        }

        if (existingReview) {
          console.log(`⏭️  Обзор уже существует для пользователя ${userId} → товар ${productId}`)
          return resolve()
        }

        // Создаем обзор
        db.run(
          'INSERT INTO reviews (user_id, product_id, rating, text, approved) VALUES (?, ?, ?, ?, ?)',
          [userId, productId, rating, text, 1], // Одобренные по умолчанию
          (insertErr) => {
            if (insertErr) {
              return reject(insertErr)
            }
            console.log(`✅ Обзор создан: пользователь ${userId} → товар ${productId}`)
            resolve()
          }
        )
      }
    )
  })
}

async function migrateReviews() {
  try {
    await initDatabase()
    await runMigrations()

    console.log('🔄 Начинаем миграцию обзоров...')

    // Получаем все товары
    const products: any[] = await new Promise((resolve, reject) => {
      db.all('SELECT id FROM products', [], (err, rows: any[]) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })

    const productIds = products.map(p => p.id)
    console.log(`📦 Найдено товаров: ${productIds.length}`)

    // Обрабатываем каждый товар
    for (const productId of productIds) {
      const reviews = productReviews[productId]
      if (!reviews) {
        console.log(`⏭️  Нет обзоров для товара ${productId}`)
        continue
      }

      console.log(`📝 Обрабатываем товар ${productId} (${reviews.length} обзоров)`)

      for (const review of reviews) {
        try {
          const userId = await createUserIfNotExists(review.author)
          await createReviewIfNotExists(userId, productId, review.rating, review.content)
        } catch (error) {
          console.error(`❌ Ошибка при создании обзора для товара ${productId}, автор ${review.author}:`, error)
        }
      }
    }

    console.log('✅ Миграция обзоров завершена')
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка миграции обзоров:', error)
    process.exit(1)
  }
}

migrateReviews()
