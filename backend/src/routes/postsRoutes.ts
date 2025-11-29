import { Router } from 'express'
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
} from '../controllers/postsController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// GET /api/posts - получить все отзывы (публичный доступ)
router.get('/', getAllPosts)

// GET /api/posts/:id - получить один отзыв (публичный доступ)
router.get('/:id', getPostById)

// POST /api/posts - создать отзыв (требует авторизации)
router.post('/', authenticateToken, createPost)

// PUT /api/posts/:id - обновить отзыв (требует авторизации, только автор)
router.put('/:id', authenticateToken, updatePost)

// DELETE /api/posts/:id - удалить отзыв (требует авторизации, только автор)
router.delete('/:id', authenticateToken, deletePost)

export default router

