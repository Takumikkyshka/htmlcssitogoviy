import { initDatabase } from './init'
import { runMigrations } from './migrations'
import db from './init'
import { hashPassword } from '../utils/password'

async function createAdmin() {
  try {
    // Инициализируем БД и запускаем миграции
    await initDatabase()
    await runMigrations()

    const email = 'admin@admin.com'
    const password = 'admin'
    const name = 'Администратор'

    // Проверяем, существует ли уже администратор
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row: any) => {
      if (err) {
        console.error('Ошибка проверки администратора:', err)
        process.exit(1)
      }

      if (row) {
        // Обновляем роль существующего пользователя
        const hashedPassword = await hashPassword(password)
        db.run(
          'UPDATE users SET role = ?, password = ? WHERE email = ?',
          ['admin', hashedPassword, email],
          (err) => {
            if (err) {
              console.error('Ошибка обновления администратора:', err)
              process.exit(1)
            }
            console.log('✅ Администратор обновлён:')
            console.log(`   Email: ${email}`)
            console.log(`   Пароль: ${password}`)
            console.log(`   Роль: admin`)
            process.exit(0)
          }
        )
      } else {
        // Создаём нового администратора
        const hashedPassword = await hashPassword(password)
        db.run(
          'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
          [email, hashedPassword, name, 'admin'],
          (err) => {
            if (err) {
              console.error('Ошибка создания администратора:', err)
              process.exit(1)
            }
            console.log('✅ Администратор создан:')
            console.log(`   Email: ${email}`)
            console.log(`   Пароль: ${password}`)
            console.log(`   Роль: admin`)
            process.exit(0)
          }
        )
      }
    })
  } catch (error) {
    console.error('Ошибка создания администратора:', error)
    process.exit(1)
  }
}

// Запускаем создание администратора
createAdmin()

