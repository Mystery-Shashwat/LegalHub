import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/guards'

export const notificationRouter = Router()


// GET /notifications — get current user's notifications
notificationRouter.get('/', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    const [notifications, unreadCount, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.count({ where: { userId } })
    ])

    res.json({ notifications, unreadCount, total, page })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// PUT /notifications/read — mark all as read
notificationRouter.put('/read', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to mark notifications as read' })
  }
})

// PUT /notifications/:id/read — mark one as read
notificationRouter.put('/:id/read', requireAuth, async (req: any, res: any) => {
  try {
    const userId = req.user.userId
    const notif = await prisma.notification.findUnique({ where: { id: req.params.id } })
    if (!notif || notif.userId !== userId) return res.status(404).json({ error: 'Not found' })

    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } })
    res.json({ message: 'Marked as read' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update notification' })
  }
})
