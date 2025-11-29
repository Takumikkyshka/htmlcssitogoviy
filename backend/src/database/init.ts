import sqlite3 from 'sqlite3'
import path from 'path'

const dbPath = path.join(__dirname, '../../database.db')
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err.message)
  } else {
    console.log('✅ Подключение к SQLite базе данных установлено')
  }
})

export const initDatabase = () => {
  // Таблица пользователей
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Ошибка создания таблицы users:', err.message)
      } else {
        console.log('✅ Таблица users создана/проверена')
      }
    })

    // Таблица товаров/отзывов (posts)
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Ошибка создания таблицы posts:', err.message)
      } else {
        console.log('✅ Таблица posts создана/проверена')
      }
    })
  })
}

export default db

