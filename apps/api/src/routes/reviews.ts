import { Router } from 'express'
export const reviewRouter = Router()
reviewRouter.get('/', (req, res) => { res.json({ message: 'Reviews list' }) })
