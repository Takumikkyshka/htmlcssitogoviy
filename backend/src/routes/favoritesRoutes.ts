import { Router } from 'express'
import { getFavorites, addToFavorites, removeFromFavorites, checkFavorite } from '../controllers/favoritesController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/', authenticateToken, getFavorites)
router.post('/', authenticateToken, addToFavorites)
router.delete('/:productId', authenticateToken, removeFromFavorites)
router.get('/check/:productId', authenticateToken, checkFavorite)

export default router

