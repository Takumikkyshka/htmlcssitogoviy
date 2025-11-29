import db from './init'

export interface Migration {
  name: string
  up: () => Promise<void>
  down: () => Promise<void>
}

const migrations: Migration[] = [
  {
    name: '001_initial_schema',
    up: async () => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
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
            if (err) reject(err)
            else resolve()
          })
        })
      })
    },
    down: async () => {
      return new Promise((resolve, reject) => {
        db.run('DROP TABLE IF EXISTS users', (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    }
  },
  {
    name: '002_create_posts_table',
    up: async () => {
      return new Promise((resolve, reject) => {
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
          if (err) reject(err)
          else resolve()
        })
      })
    },
    down: async () => {
      return new Promise((resolve, reject) => {
        db.run('DROP TABLE IF EXISTS posts', (err) => {
          if (err) reject(err)
          else resolve()
        })
      })
    }
  },
  {
    name: '003_create_indexes',
    up: async () => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)', (err) => {
            if (err) return reject(err)
          })
          db.run('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)', (err) => {
            if (err) return reject(err)
          })
          db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)', (err) => {
            if (err) return reject(err)
            else resolve()
          })
        })
      })
    },
    down: async () => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('DROP INDEX IF EXISTS idx_posts_user_id', (err) => {
            if (err) return reject(err)
          })
          db.run('DROP INDEX IF EXISTS idx_posts_created_at', (err) => {
            if (err) return reject(err)
          })
          db.run('DROP INDEX IF EXISTS idx_users_email', (err) => {
            if (err) return reject(err)
            else resolve()
          })
        })
      })
    }
  }
]

export const runMigrations = async () => {
  return new Promise<void>((resolve) => {
    // Создаем таблицу для отслеживания миграций
    db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, () => {
      let completed = 0
      const total = migrations.length

      if (total === 0) {
        resolve()
        return
      }

      migrations.forEach((migration) => {
        // Проверяем, была ли миграция выполнена
        db.get(
          'SELECT * FROM migrations WHERE name = ?',
          [migration.name],
          (err, row: any) => {
            if (err) {
              console.error(`Ошибка проверки миграции ${migration.name}:`, err)
              completed++
              if (completed === total) resolve()
              return
            }

            if (!row) {
              // Выполняем миграцию
              migration.up()
                .then(() => {
                  db.run(
                    'INSERT INTO migrations (name) VALUES (?)',
                    [migration.name],
                    (err) => {
                      if (err) {
                        console.error(`Ошибка записи миграции ${migration.name}:`, err)
                      } else {
                        console.log(`✅ Миграция ${migration.name} выполнена`)
                      }
                      completed++
                      if (completed === total) resolve()
                    }
                  )
                })
                .catch((err) => {
                  console.error(`Ошибка выполнения миграции ${migration.name}:`, err)
                  completed++
                  if (completed === total) resolve()
                })
            } else {
              console.log(`⏭️  Миграция ${migration.name} уже выполнена`)
              completed++
              if (completed === total) resolve()
            }
          }
        )
      })
    })
  })
}

