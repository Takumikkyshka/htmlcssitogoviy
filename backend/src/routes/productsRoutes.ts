import { Router } from 'express'
import { getAllProducts, getProductById, getProductReviews } from '../controllers/productsController'

const router = Router()

router.get('/', getAllProducts)
router.get('/:id', getProductById)
router.get('/:id/reviews', getProductReviews)

export default router

