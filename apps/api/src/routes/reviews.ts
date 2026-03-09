import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/guards'

export const reviewRouter = Router()

// POST /reviews — client submits review for a completed booking
reviewRouter.post('/', requireAuth, async (req: any, res: any) => {
  try {
    const { bookingId, rating, comment } = req.body
    const clientId = req.user.userId

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'bookingId and rating (1-5) are required' })
    }

    // Verify the booking belongs to this client and is completed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true }
    })

    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    if (booking.clientId !== clientId) return res.status(403).json({ error: 'Forbidden' })
    if (booking.status !== 'COMPLETED') return res.status(400).json({ error: 'Can only review completed bookings' })
    if (booking.review) return res.status(400).json({ error: 'You have already reviewed this booking' })

    // Create the review
    const review = await prisma.review.create({
      data: {
        bookingId,
        clientId,
        lawyerProfileId: booking.lawyerProfileId,
        rating,
        comment: comment?.trim() || null
      }
    })

    // Recalculate lawyer's avgRating and totalReviews
    const allReviews = await prisma.review.findMany({
      where: { lawyerProfileId: booking.lawyerProfileId },
      select: { rating: true }
    })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.lawyerProfile.update({
      where: { id: booking.lawyerProfileId },
      data: { avgRating, totalReviews: allReviews.length }
    })

    // Notify the lawyer
    await prisma.notification.create({
      data: {
        userId: (await prisma.lawyerProfile.findUnique({ where: { id: booking.lawyerProfileId }, select: { userId: true } }))!.userId,
        type: 'REVIEW',
        title: 'New Review Received',
        body: `A client left you a ${rating}-star review.`,
        link: '/lawyer/profile'
      }
    })

    res.status(201).json({ review })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to submit review' })
  }
})

// GET /reviews/lawyer/:id — list all reviews for a lawyer
reviewRouter.get('/lawyer/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { lawyerProfileId: id },
        include: {
          client: { select: { name: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({ where: { lawyerProfileId: id } })
    ])

    res.json({ reviews, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch reviews' })
  }
})

// PUT /reviews/:id/reply — lawyer posts public reply
reviewRouter.put('/:id/reply', requireAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { reply } = req.body
    const userId = req.user.userId

    if (!reply?.trim()) return res.status(400).json({ error: 'Reply text is required' })

    const review = await prisma.review.findUnique({
      where: { id },
      include: { lawyer: { select: { userId: true } } }
    })

    if (!review) return res.status(404).json({ error: 'Review not found' })
    if (review.lawyer.userId !== userId) return res.status(403).json({ error: 'Only the reviewed lawyer can reply' })

    const updated = await prisma.review.update({
      where: { id },
      data: { lawyerReply: reply.trim() }
    })

    res.json({ review: updated })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to post reply' })
  }
})

// DELETE /reviews/:id — admin removes abusive review
reviewRouter.delete('/:id', requireAuth, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' })

    const review = await prisma.review.findUnique({ where: { id: req.params.id } })
    if (!review) return res.status(404).json({ error: 'Review not found' })

    await prisma.review.delete({ where: { id: req.params.id } })

    // Recalculate lawyer average
    const allReviews = await prisma.review.findMany({
      where: { lawyerProfileId: review.lawyerProfileId },
      select: { rating: true }
    })
    const avgRating = allReviews.length ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length : 0
    await prisma.lawyerProfile.update({
      where: { id: review.lawyerProfileId },
      data: { avgRating, totalReviews: allReviews.length }
    })

    res.json({ message: 'Review deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete review' })
  }
})
