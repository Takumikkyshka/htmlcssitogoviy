import { Router } from 'express'
import { getUserOrders, createOrder } from '../controllers/ordersController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/', authenticateToken, getUserOrders)
router.post('/', authenticateToken, createOrder)

export default router

