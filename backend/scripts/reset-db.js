const fs = require('fs')
const path = require('path')

const dbPath = path.join(__dirname, '../database.db')

if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath)
    console.log('✅ База данных успешно удалена')
  } catch (error) {
    console.error('❌ Ошибка удаления базы данных:', error.message)
    console.log('💡 Закройте все процессы, использующие базу данных, и попробуйте снова')
  }
} else {
  console.log('ℹ️  База данных не найдена')
}

