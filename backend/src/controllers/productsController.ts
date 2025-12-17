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

// Временные данные отзывов по товарам (для демонстрации)
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

export const getProductReviews = (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const productId = parseInt(id as string, 10)

  if (Number.isNaN(productId)) {
    return res.status(400).json({ error: 'Некорректный ID товара' })
  }

  const reviews = productReviews[productId] || []
  res.json(reviews)
}

