import { Response } from 'express'
import db from '../database/init'
import { AuthRequest } from '../middleware/auth'

export const getAllMusic = (_req: AuthRequest, res: Response) => {
  db.all(
    'SELECT * FROM music ORDER BY created_at DESC',
    [],
    (err, rows: any[]) => {
      if (err) {
        console.error('Ошибка получения музыки:', err)
        return res.status(500).json({ error: 'Ошибка получения музыки' })
      }
      res.json(rows)
    }
  )
}

export const getMusicById = (req: AuthRequest, res: Response) => {
  const { id } = req.params

  db.get(
    'SELECT * FROM music WHERE id = ?',
    [id],
    (err, row: any) => {
      if (err) {
        console.error('Ошибка получения трека:', err)
        return res.status(500).json({ error: 'Ошибка получения трека' })
      }

      if (!row) {
        return res.status(404).json({ error: 'Трек не найден' })
      }

      res.json(row)
    }
  )
}

