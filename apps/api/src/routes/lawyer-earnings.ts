import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireVerifiedLawyer } from '../middleware/guards'

export const lawyerEarningsRouter = Router()

// GET /lawyers/me/earnings — lawyer views their earnings + payout history
lawyerEarningsRouter.get('/me/earnings', requireVerifiedLawyer, async (req: any, res: any) => {
  try {
    const lawyerProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.userId }
    })
    if (!lawyerProfile) return res.status(404).json({ error: 'Lawyer profile not found' })

    // All completed payments for this lawyer
    const payments = await prisma.payment.findMany({
      where: {
        booking: { lawyerProfileId: lawyerProfile.id },
        status: 'PAID'
      },
      include: {
        booking: {
          include: {
            client: { select: { name: true } }
          }
        }
      },
      orderBy: { paidAt: 'desc' }
    })

    // Summary stats
    const totalEarnings = payments.reduce((sum, p) => sum + p.lawyerPayout, 0)
    const totalBookings = payments.length
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    const monthlyEarnings = payments
      .filter(p => p.paidAt && p.paidAt >= thisMonth)
      .reduce((sum, p) => sum + p.lawyerPayout, 0)

    const pendingPayments = await prisma.booking.count({
      where: {
        lawyerProfileId: lawyerProfile.id,
        status: 'COMPLETED',
        isPaid: true,
        payment: { status: 'PAID' }
      }
    })

    res.json({
      totalEarnings,
      totalBookings,
      monthlyEarnings,
      pendingPayout: 0,
      avgRating: lawyerProfile.avgRating,
      payments: payments.map(p => ({
        id: p.id,
        clientName: p.booking.client.name,
        amount: p.amount,
        platformFee: p.commissionAmount,
        lawyerPayout: p.lawyerPayout,
        paidAt: p.paidAt,
        scheduledAt: p.booking.scheduledAt,
        type: p.booking.type
      }))
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch earnings' })
  }
})

// POST /lawyers/me/withdraw — request payout (placeholder until Razorpay transfer integration)
lawyerEarningsRouter.post('/me/withdraw', requireVerifiedLawyer, async (req: any, res: any) => {
  try {
    const { amount, accountNumber, ifscCode } = req.body

    if (!amount || amount < 500) {
      return res.status(400).json({ error: 'Minimum withdrawal is ₹500' })
    }

    // In production this would trigger Razorpay payout transfer
    // For now we create a notification and log the request
    const lawyerProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.userId }
    })
    if (!lawyerProfile) return res.status(404).json({ error: 'Profile not found' })

    await prisma.notification.create({
      data: {
        userId: req.user.userId,
        type: 'PAYMENT',
        title: 'Withdrawal Request Received',
        body: `Your withdrawal request for ₹${amount} has been submitted and will be processed within 2 business days.`,
        link: '/lawyer/earnings'
      }
    })

    res.json({ message: `Withdrawal request for ₹${amount} submitted successfully. Processing in 2 business days.` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to process withdrawal' })
  }
})

// GET /lawyers/me/analytics
lawyerEarningsRouter.get('/me/analytics', requireVerifiedLawyer, async (req: any, res: any) => {
  try {
    const lawyerProfile = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.userId }
    })
    if (!lawyerProfile) return res.status(404).json({ error: 'Not found' })

    // Last 6 months bookings by month
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const bookings = await prisma.booking.findMany({
      where: {
        lawyerProfileId: lawyerProfile.id,
        createdAt: { gte: sixMonthsAgo }
      },
      select: {
        createdAt: true,
        status: true,
        amount: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // Group by month
    const byMonth: Record<string, { bookings: number; revenue: number }> = {}
    bookings.forEach(b => {
      const month = b.createdAt.toISOString().slice(0, 7) // YYYY-MM
      if (!byMonth[month]) byMonth[month] = { bookings: 0, revenue: 0 }
      byMonth[month].bookings++
      if (b.status === 'COMPLETED') byMonth[month].revenue += b.amount * 0.85 // after commission
    })

    const reviews = await prisma.review.findMany({
      where: { lawyerProfileId: lawyerProfile.id },
      select: { rating: true, createdAt: true }
    })

    res.json({
      monthlyData: Object.entries(byMonth).map(([month, data]) => ({ month, ...data })),
      totalBookings: bookings.length,
      completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
      avgRating: lawyerProfile.avgRating,
      totalReviews: lawyerProfile.totalReviews,
      recentReviews: reviews.slice(-5)
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})
