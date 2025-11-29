import { Router } from 'express'
import { getAllMusic, getMusicById } from '../controllers/musicController'

const router = Router()

router.get('/', getAllMusic)
router.get('/:id', getMusicById)

export default router

