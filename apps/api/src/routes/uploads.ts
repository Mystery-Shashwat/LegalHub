import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/guards'
import { getPresignedUploadUrl } from '../services/storage'

export const uploadRouter = Router()

const ALLOWED_TYPES = ['image/jpeg','image/png','application/pdf']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

uploadRouter.post('/presign', requireAuth, async (req: Request, res: Response) => {
  const { fileName, fileType, fileSize, folder } = req.body
  if (!ALLOWED_TYPES.includes(fileType))
    return res.status(400).json({ error: 'Only PDF, JPG, PNG allowed' })
  if (fileSize > MAX_SIZE)
    return res.status(400).json({ error: 'Max file size is 5MB' })

  const result = await getPresignedUploadUrl(fileName, fileType, folder || 'docs')
  res.json(result)
})
