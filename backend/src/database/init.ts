import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = path.join(__dirname, '../../database.db')
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message)
  } else {
    console.log('✅ Подключение к SQLite базе данных установлено')
  }
})

// Включение поддержки внешних ключей
db.run('PRAGMA foreign_keys = ON')

export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Таблица пользователей
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Ошибка создания таблицы users:', err.message)
          reject(err)
        } else {
          console.log('✅ Таблица users создана/проверена')
        }
      })

      // Таблица отзывов/товаров (posts)
      db.run(`
        CREATE TABLE IF NOT EXISTS posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT DEFAULT 'review',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Ошибка создания таблицы posts:', err.message)
          reject(err)
        } else {
          console.log('✅ Таблица posts создана/проверена')
        }
      })

      // Индексы для оптимизации
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)
      `, (err) => {
        if (err) {
          console.error('Ошибка создания индекса idx_posts_user_id:', err.message)
        } else {
          console.log('✅ Индекс idx_posts_user_id создан/проверен')
        }
      })

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)
      `, (err) => {
        if (err) {
          console.error('Ошибка создания индекса idx_posts_created_at:', err.message)
        } else {
          console.log('✅ Индекс idx_posts_created_at создан/проверен')
        }
      })

      db.run(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
      `, (err) => {
        if (err) {
          console.error('Ошибка создания индекса idx_users_email:', err.message)
        } else {
          console.log('✅ Индекс idx_users_email создан/проверен')
        }
      })

      // Триггеры для автоматического обновления updated_at
      db.run(`
        CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
        AFTER UPDATE ON users
        BEGIN
          UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `, (err) => {
        if (err) {
          console.error('Ошибка создания триггера update_users_timestamp:', err.message)
        } else {
          console.log('✅ Триггер update_users_timestamp создан/проверен')
        }
      })

      db.run(`
        CREATE TRIGGER IF NOT EXISTS update_posts_timestamp 
        AFTER UPDATE ON posts
        BEGIN
          UPDATE posts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END
      `, (err) => {
        if (err) {
          console.error('Ошибка создания триггера update_posts_timestamp:', err.message)
        } else {
          console.log('✅ Триггер update_posts_timestamp создан/проверен')
          resolve()
        }
      })
    })
  })
}

export default db

