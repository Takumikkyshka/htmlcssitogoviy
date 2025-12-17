import { Router, Response, NextFunction } from 'express'
import { authenticateToken, isAdmin, AuthRequest } from '../middleware/auth'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/adminProductsController'
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/adminOrdersController'
import {
  getAllUsers,
  getUserById,
  updateUser,
  resetUserPassword,
  toggleUserBlock
} from '../controllers/adminUsersController'
import {
  getAllReviews,
  getReviewById,
  createReview,
  toggleReviewApproval,
  addAdminResponse,
  deleteReview,
  generateReviewsForAllProducts
} from '../controllers/adminReviewsController'

const router = Router()

// Комбинированный middleware для проверки админ прав
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('🔐 Admin route accessed:', req.method, req.path)
  authenticateToken(req, res, () => {
    console.log('✅ Token authenticated, checking admin role...')
    isAdmin(req, res, next)
  })
}

// Все роуты требуют авторизации и прав администратора
router.use(requireAdmin)

// Товары
router.get('/products', getAllProducts)
router.get('/products/:id', getProductById)
router.post('/products', createProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)

// Заказы
router.get('/orders', getAllOrders)
router.get('/orders/:id', getOrderById)
router.patch('/orders/:id/status', updateOrderStatus)

// Пользователи
router.get('/users', getAllUsers)
router.get('/users/:id', getUserById)
router.put('/users/:id', updateUser)
router.post('/users/:id/reset-password', resetUserPassword)
router.patch('/users/:id/block', toggleUserBlock)

    // Обзоры
    router.get('/reviews', getAllReviews)
    router.get('/reviews/:id', getReviewById)
    router.post('/reviews', createReview)
    router.patch('/reviews/:id/approval', toggleReviewApproval)
    router.post('/reviews/:id/response', addAdminResponse)
    router.delete('/reviews/:id', deleteReview)
    router.post('/reviews/generate', generateReviewsForAllProducts)

export default router

