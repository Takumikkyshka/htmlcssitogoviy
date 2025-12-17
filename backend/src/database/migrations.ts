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
    name: '002_add_name_column_to_users',
    up: async () => {
      return new Promise((resolve, reject) => {
        // Проверяем, существует ли колонка name
        db.get("PRAGMA table_info(users)", [], (err, rows: any) => {
          if (err) {
            return reject(err)
          }
          
          // Проверяем, есть ли колонка name
          const hasNameColumn = Array.isArray(rows) && rows.some((row: any) => row.name === 'name')
          
          if (!hasNameColumn) {
            db.run('ALTER TABLE users ADD COLUMN name TEXT', (err) => {
              if (err) reject(err)
              else resolve()
            })
          } else {
            resolve()
          }
        })
      })
    },
    down: async () => {
      return new Promise((resolve, reject) => {
        // SQLite не поддерживает DROP COLUMN напрямую
        resolve()
      })
    }
  },
  {
    name: '003_create_posts_table',
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
    name: '004_create_indexes',
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
  },
  {
    name: '005_create_orders_table',
    up: async () => {
      return new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER,
            product_title TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER DEFAULT 1,
            status TEXT DEFAULT 'processing',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
          )
        `, (err) => {
          if (err) {
            console.error('Ошибка создания таблицы orders:', err)
            return reject(err)
          }
          console.log('✅ Таблица orders создана/проверена')
          resolve()
        })
      })
    },
    down: async () => {
      return new Promise((resolve, reject) => {
        db.run('DROP TABLE IF EXISTS orders', (err) => {
          if (err) return reject(err)
          else resolve()
        })
      })
    }
  },
  {
    name: '006_create_favorites_table',
    up: async () => {
      return new Promise((resolve, reject) => {
        db.run(`
          CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) return reject(err)
          resolve()
        })
      })
    },
    down: async () => {
      return new Promise((resolve, reject) => {
        db.run('DROP TABLE IF EXISTS favorites', (err) => {
          if (err) return reject(err)
          else resolve()
        })
      })
    }
  },
  {
    name: '007_create_products_and_music',
    up: async () => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          // Таблица товаров
          db.run(`
            CREATE TABLE IF NOT EXISTS products (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              description TEXT NOT NULL,
              price TEXT NOT NULL,
              category TEXT DEFAULT 'other',
              video TEXT,
              poster TEXT,
              image TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) return reject(err)
          })

          // Таблица музыки
          db.run(`
            CREATE TABLE IF NOT EXISTS music (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              title TEXT NOT NULL,
              price TEXT NOT NULL,
              image TEXT,
              audio TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) return reject(err)
          })

          // Добавляем товары (проверяем каждый перед добавлением)
          const products = [
            {
              title: 'Клавиатура mchose jet75',
              description: 'Высококачественные датчики Холла обеспечивают точное линейное считывание, сверхвысокую чувствительность и исключительную отзывчивость. Идеальна для геймеров и профессионалов.',
              price: '9000 рублей',
              category: 'клавиатура',
              video: '/assets/videos/Распаковка MCHOSE JET75 НЕОЖИДАННО mchose magnetickeyboard keyboard review [get-speed.com].mp4',
              poster: '/assets/imgs/mchosejet75.webp',
              image: '/assets/imgs/mchosejet75.webp'
            },
            {
              title: 'Компьютерная мышь mchose k7 ultra',
              description: 'Сверхлёгкая беспроводная игровая мышь MCHOSE K7 Ultra - это идеальный выбор для тех, кто любит играть в компьютерные игры. Она обладает максимальным разрешением датчика 42000 DPI, что позволяет вам быстро перемещаться по экрану и точно контролировать курсор.',
              price: '8500 рублей',
              category: 'компьютерная мышь',
              video: '/assets/videos/mchosek7.mp4',
              poster: '/assets/imgs/mchosek7ultra.webp',
              image: '/assets/imgs/mchosek7ultra.webp'
            },
            {
              title: 'HyperX Cloud Mini 3.5 мм',
              description: 'Компактные игровые наушники с превосходным звуком и удобной посадкой. Идеальны для длительных игровых сессий благодаря мягким амбушюрам и легкому весу. Совместимы с ПК, консолями и мобильными устройствами.',
              price: '3500 рублей',
              category: 'наушники',
              video: null,
              poster: '/assets/imgs/hyperx.webp',
              image: '/assets/imgs/hyperx.webp'
            },
            {
              title: 'Logitech G G435',
              description: 'Беспроводные игровые наушники с технологией Lightspeed и Bluetooth. Легкие и удобные, с отличным качеством звука и микрофоном. Подходят для игр, музыки и звонков.',
              price: '4500 рублей',
              category: 'наушники',
              video: null,
              poster: '/assets/imgs/logitechg435.webp',
              image: '/assets/imgs/logitechg435.webp'
            },
            {
              title: 'Видеокабель HDMI - Type C',
              description: 'Высококачественный кабель для подключения устройств с USB-C к мониторам и телевизорам с HDMI. Поддерживает разрешение до 4K и передачу звука. Идеален для ноутбуков, планшетов и смартфонов.',
              price: '1200 рублей',
              category: 'аксессуары',
              video: null,
              poster: '/assets/imgs/hdmirexant.webp',
              image: '/assets/imgs/hdmirexant.webp'
            }
          ]

          // Добавляем товары последовательно
          let currentIndex = 0
          
          const insertNextProduct = () => {
            if (currentIndex >= products.length) {
              console.log(`✅ Все товары обработаны (${products.length})`)
              insertMusic()
              return
            }
            
            const product = products[currentIndex]
            
            // Проверяем, существует ли товар
            db.get('SELECT id FROM products WHERE title = ?', [product.title], (err, row: any) => {
              if (err) {
                console.error(`Ошибка проверки товара "${product.title}":`, err)
                currentIndex++
                insertNextProduct()
                return
              }
              
              if (!row) {
                // Товара нет, добавляем
                db.run(
                  'INSERT INTO products (title, description, price, category, video, poster, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  [product.title, product.description, product.price, product.category, product.video, product.poster, product.image],
                  (err) => {
                    if (err) {
                      console.error(`Ошибка добавления товара "${product.title}":`, err)
                    } else {
                      console.log(`✅ Товар добавлен: ${product.title}`)
                    }
                    currentIndex++
                    insertNextProduct()
                  }
                )
              } else {
                console.log(`⏭️  Товар уже существует: ${product.title}`)
                currentIndex++
                insertNextProduct()
              }
            })
          }
          
          insertNextProduct()

          const insertMusic = () => {
            const musicTracks = [
              {
                title: 'Дора - Кьют рок',
                price: '19 рублей',
                image: '/assets/imgs/Dora kiut rok.webp',
                audio: '/assets/audios/Dora - kiut rok.mp3'
              },
              {
                title: 'Дора - Втюрилась',
                price: '19 рублей',
                image: '/assets/imgs/Dora kiut rok.webp',
                audio: '/assets/audios/Dora - vturilas.mp3'
              }
            ]

            db.get('SELECT COUNT(*) as count FROM music', [], (err, row: any) => {
              if (err) {
                console.error('Ошибка проверки музыки:', err)
                return resolve()
              }

              if (row && row.count > 0) {
                console.log('⏭️  Музыка уже существует, пропускаем вставку')
                return resolve()
              }

              let musicInserted = 0
              musicTracks.forEach((track) => {
                db.run(
                  'INSERT INTO music (title, price, image, audio) VALUES (?, ?, ?, ?)',
                  [track.title, track.price, track.image, track.audio],
                  (err) => {
                    if (err) {
                      console.error('Ошибка добавления музыки:', err)
                    } else {
                      console.log(`✅ Трек добавлен: ${track.title}`)
                    }
                    musicInserted++
                    if (musicInserted === musicTracks.length) {
                      resolve()
                    }
                  }
                )
              })
            })
          }
        })
      })
    },
    down: async () => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('DROP TABLE IF EXISTS products', (err) => {
            if (err) reject(err)
            else console.log('✅ Таблица products удалена')
          })
          db.run('DROP TABLE IF EXISTS music', (err) => {
            if (err) reject(err)
            else console.log('✅ Таблица music удалена')
            resolve()
          })
        })
      })
    }
  },
  {
    name: '008_add_admin_and_reviews',
    up: async () => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          // Добавляем поле role в users (если его нет)
          db.get("PRAGMA table_info(users)", [], (err, rows: any) => {
            if (err) return reject(err)
            
            const hasRoleColumn = Array.isArray(rows) && rows.some((row: any) => row.name === 'role')
            
            if (!hasRoleColumn) {
              db.run('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"', (err) => {
                if (err) return reject(err)
                console.log('✅ Поле role добавлено в users')
              })
            }
            
            // Добавляем поле review_count в products (если его нет)
            db.get("PRAGMA table_info(products)", [], (err, rows: any) => {
              if (err) return reject(err)
              
              const hasReviewCountColumn = Array.isArray(rows) && rows.some((row: any) => row.name === 'review_count')
              
              if (!hasReviewCountColumn) {
                db.run('ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0', (err) => {
                  if (err) return reject(err)
                  console.log('✅ Поле review_count добавлено в products')
                })
              }
              
              // Создаем таблицу reviews
              db.run(`
                CREATE TABLE IF NOT EXISTS reviews (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER NOT NULL,
                  product_id INTEGER NOT NULL,
                  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                  text TEXT NOT NULL,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  approved INTEGER DEFAULT 0,
                  likes INTEGER DEFAULT 0,
                  admin_response TEXT,
                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
                )
              `, (err) => {
                if (err) return reject(err)
                console.log('✅ Таблица reviews создана')
                
                // Создаем индексы для reviews
                db.run('CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)', (err) => {
                  if (err) return reject(err)
                  db.run('CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)', (err) => {
                    if (err) return reject(err)
                    db.run('CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved)', (err) => {
                      if (err) return reject(err)
                      resolve()
                    })
                  })
                })
              })
            })
          })
        })
      })
    },
    down: async () => {
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('DROP TABLE IF EXISTS reviews', (err) => {
            if (err) return reject(err)
            resolve()
          })
        })
      })
    }
  },
  {
    name: '009_add_product_id_to_posts',
    up: async () => {
      return new Promise((resolve, reject) => {
        db.get("PRAGMA table_info(posts)", [], (err, rows: any) => {
          if (err) return reject(err)
          
          const hasProductIdColumn = Array.isArray(rows) && rows.some((row: any) => row.name === 'product_id')
          
          if (!hasProductIdColumn) {
            db.run('ALTER TABLE posts ADD COLUMN product_id INTEGER', (err) => {
              if (err) return reject(err)
              console.log('✅ Поле product_id добавлено в posts')
              resolve()
            })
          } else {
            resolve()
          }
        })
      })
    },
    down: async () => {
      return new Promise((resolve) => {
        resolve()
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
