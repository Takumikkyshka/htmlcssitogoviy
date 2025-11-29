import { Router } from 'express'
import { getUserOrders } from '../controllers/ordersController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/', authenticateToken, getUserOrders)

export default router

