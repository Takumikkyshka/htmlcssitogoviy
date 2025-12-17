import { Router } from 'express'
import { createReview, getProductReviews } from '../controllers/reviewsController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// GET /api/reviews/product/:productId - получить обзоры для товара (публичный доступ)
router.get('/product/:productId', getProductReviews)

// POST /api/reviews - создать обзор (требует авторизации)
router.post('/', authenticateToken, createReview)

export default router

