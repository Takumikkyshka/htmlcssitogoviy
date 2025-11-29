import fs from 'fs'
import path from 'path'

const dbPath = path.join(__dirname, '../../database.db')

export const resetDatabase = () => {
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
      console.log('✅ База данных удалена')
    }
    console.log('✅ База данных готова к пересозданию')
  } catch (error) {
    console.error('Ошибка удаления базы данных:', error)
    throw error
  }
}

