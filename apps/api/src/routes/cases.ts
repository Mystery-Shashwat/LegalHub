import { Router } from 'express'
export const caseRouter = Router()
caseRouter.get('/', (req, res) => { res.json({ message: 'Cases list' }) })
