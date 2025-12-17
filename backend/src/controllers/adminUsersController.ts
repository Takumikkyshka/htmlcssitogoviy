import { Response } from 'express'
import db from '../database/init'
import { AuthRequest } from '../middleware/auth'
import { hashPassword } from '../utils/password'

// Получить всех пользователей
export const getAllUsers = (req: AuthRequest, res: Response) => {
  const { search, role } = req.query

  let query = 'SELECT id, email, name, role, created_at FROM users WHERE 1=1'
  const params: any[] = []

  if (search) {
    query += ' AND (email LIKE ? OR name LIKE ?)'
    const searchTerm = `%${search}%`
    params.push(searchTerm, searchTerm)
  }

  if (role) {
    query += ' AND role = ?'
    params.push(role)
  }

  query += ' ORDER BY created_at DESC'

  db.all(query, params, (err, rows: any[]) => {
    if (err) {
      console.error('Ошибка получения пользователей:', err)
      return res.status(500).json({ error: 'Ошибка получения пользователей' })
    }
    res.json({ data: rows })
  })
}

// Получить пользователя по ID
export const getUserById = (req: AuthRequest, res: Response) => {
  const { id } = req.params

  db.get(
    'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
    [id],
    (err, row: any) => {
      if (err) {
        console.error('Ошибка получения пользователя:', err)
        return res.status(500).json({ error: 'Ошибка получения пользователя' })
      }

      if (!row) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }

      res.json({ data: row })
    }
  )
}

// Обновить пользователя
export const updateUser = (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { email, name, role } = req.body

  const updateFields: string[] = []
  const params: any[] = []

  if (email !== undefined) {
    updateFields.push('email = ?')
    params.push(email)
  }

  if (name !== undefined) {
    updateFields.push('name = ?')
    params.push(name)
  }

  if (role !== undefined) {
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Некорректная роль' })
    }
    updateFields.push('role = ?')
    params.push(role)
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'Нет полей для обновления' })
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP')
  params.push(id)

  db.run(
    `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        console.error('Ошибка обновления пользователя:', err)
        return res.status(500).json({ error: 'Ошибка обновления пользователя' })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' })
      }

      db.get(
        'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
        [id],
        (err, user: any) => {
          if (err) {
            return res.status(500).json({ error: 'Пользователь обновлён, но не удалось получить данные' })
          }
          res.json({ data: user })
        }
      )
    }
  )
}

// Сбросить пароль пользователя
export const resetUserPassword = async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const { newPassword } = req.body

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' })
  }

  try {
    const hashedPassword = await hashPassword(newPassword)

    db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id],
      function (err) {
        if (err) {
          console.error('Ошибка сброса пароля:', err)
          return res.status(500).json({ error: 'Ошибка сброса пароля' })
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Пользователь не найден' })
        }

        res.json({ message: 'Пароль успешно сброшен' })
      }
    )
  } catch (error) {
    console.error('Ошибка хеширования пароля:', error)
    return res.status(500).json({ error: 'Ошибка обработки пароля' })
  }
}

// Блокировать/разблокировать пользователя (через роль)
export const toggleUserBlock = (req: AuthRequest, res: Response) => {
  const { id } = req.params

  db.get('SELECT role FROM users WHERE id = ?', [id], (err, user: any) => {
    if (err || !user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    const newRole = user.role === 'banned' ? 'user' : 'banned'

    db.run(
      'UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newRole, id],
      function (err) {
        if (err) {
          console.error('Ошибка изменения статуса пользователя:', err)
          return res.status(500).json({ error: 'Ошибка изменения статуса' })
        }

        res.json({ 
          message: newRole === 'banned' ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
          data: { role: newRole }
        })
      }
    )
  })
}

