import { Router } from 'express'
import { getUserOrders, createOrder, cancelOrder } from '../controllers/ordersController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/', authenticateToken, getUserOrders)
router.post('/', authenticateToken, createOrder)
router.patch('/:id/cancel', authenticateToken, cancelOrder)

export default router

