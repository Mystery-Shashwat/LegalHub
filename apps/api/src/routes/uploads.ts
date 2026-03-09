import { Router, Request, Response } from 'express'
import { requireAuth } from '../middleware/guards'
import { getPresignedUploadUrl, deleteFile, getSignedDownloadUrl } from '../services/storage'
import { prisma } from '../lib/prisma'

export const uploadRouter = Router()

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_DOC_TYPES   = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

// POST /uploads/avatar — upload profile photo
uploadRouter.post('/avatar', requireAuth, async (req: any, res: Response) => {
  const { fileType, fileSize } = req.body
  if (!ALLOWED_IMAGE_TYPES.includes(fileType))
    return res.status(400).json({ error: 'Only JPEG, PNG, or WebP allowed for avatars' })
  if (fileSize && fileSize > MAX_SIZE)
    return res.status(400).json({ error: 'Max file size is 5MB' })

  const result = await getPresignedUploadUrl(`avatar-${req.user.userId}`, fileType, 'avatars')

  // After frontend uploads, it should call PUT /users/me/avatar with publicUrl
  res.json(result)
})

// POST /uploads/document — upload legal document / certificate
uploadRouter.post('/document', requireAuth, async (req: any, res: Response) => {
  const { fileName, fileType, fileSize, folder } = req.body
  if (!fileName) return res.status(400).json({ error: 'fileName is required' })
  if (!ALLOWED_DOC_TYPES.includes(fileType))
    return res.status(400).json({ error: 'Only PDF, JPEG, PNG allowed for documents' })
  if (fileSize && fileSize > MAX_SIZE)
    return res.status(400).json({ error: 'Max file size is 5MB' })

  const validFolders = ['docs', 'certificates', 'degrees', 'govt-ids', 'case-files']
  const targetFolder = validFolders.includes(folder) ? folder : 'docs'

  const result = await getPresignedUploadUrl(fileName, fileType, targetFolder)
  res.json(result)
})

// POST /uploads/presign — generic presigned URL (kept for backwards compat)
uploadRouter.post('/presign', requireAuth, async (req: any, res: Response) => {
  const { fileName, fileType, fileSize, folder } = req.body
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'image/webp']
  if (!ALLOWED_TYPES.includes(fileType))
    return res.status(400).json({ error: 'Only PDF, JPG, PNG, WebP allowed' })
  if (fileSize && fileSize > MAX_SIZE)
    return res.status(400).json({ error: 'Max file size is 5MB' })

  const result = await getPresignedUploadUrl(fileName || 'file', fileType, folder || 'docs')
  res.json(result)
})

// DELETE /uploads/:key — delete a file from R2
uploadRouter.delete('/:key(*)', requireAuth, async (req: any, res: Response) => {
  const key = req.params.key
  if (!key) return res.status(400).json({ error: 'File key is required' })

  // Security: only allow deleting their own files (key should start with a folder they own)
  // Admins can delete any file
  const allowedPrefixes = [
    `avatars/avatar-${req.user.userId}`,
    'docs/', 'certificates/', 'degrees/', 'govt-ids/', 'case-files/'
  ]
  const isAdmin = req.user.role === 'ADMIN'
  const isOwned = allowedPrefixes.some(p => key.startsWith(p))

  if (!isAdmin && !isOwned) {
    return res.status(403).json({ error: 'You can only delete your own files' })
  }

  try {
    await deleteFile(key)
    res.json({ message: 'File deleted successfully' })
  } catch {
    res.status(500).json({ error: 'Failed to delete file' })
  }
})

// GET /uploads/signed/:key — get temporary signed download URL (for private files)
uploadRouter.get('/signed/:key(*)', requireAuth, async (req: any, res: Response) => {
  const key = req.params.key
  if (!key) return res.status(400).json({ error: 'File key is required' })
  try {
    const url = await getSignedDownloadUrl(key)
    res.json({ url, expiresIn: 3600 })
  } catch {
    res.status(500).json({ error: 'Failed to generate signed URL' })
  }
})

// PUT /uploads/avatar/confirm — called after successful upload to update user's avatar in DB
uploadRouter.put('/avatar/confirm', requireAuth, async (req: any, res: Response) => {
  const { publicUrl } = req.body
  if (!publicUrl) return res.status(400).json({ error: 'publicUrl is required' })

  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatar: publicUrl }
    })
    res.json({ message: 'Avatar updated', avatar: publicUrl })
  } catch {
    res.status(500).json({ error: 'Failed to update avatar' })
  }
})
