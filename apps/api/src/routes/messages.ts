import { Router } from 'express'
export const messageRouter = Router()
messageRouter.get('/', (req, res) => { res.json({ message: 'Messages list' }) })
