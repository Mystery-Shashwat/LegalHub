import { Router } from 'express'
import { requireAuth } from '../middleware/guards'
import { prisma } from '../lib/prisma'

export const planRouter = Router()

const PLAN_PRICES: Record<string, number> = {
  FREE:       0,
  BASIC:   999,   // ₹999/month
  PRO:    2499,   // ₹2499/month
  ENTERPRISE: 4999 // ₹4999/month
}

const PLAN_FEATURES: Record<string, string[]> = {
  FREE:       ['5 bookings/month', 'Basic profile', 'Standard listing'],
  BASIC:      ['50 bookings/month', 'Enhanced profile', 'Priority listing', 'Analytics'],
  PRO:        ['Unlimited bookings', 'Featured profile', 'Top listing', 'Analytics', 'Blog posts', 'Dispute priority'],
  ENTERPRISE: ['Unlimited everything', 'Dedicated support', 'Custom branding', 'API access'],
}

// GET /lawyers/me/plan — get current plan info
planRouter.get('/me/plan', requireAuth, async (req: any, res: any) => {
  try {
    const profile = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.userId },
      select: { plan: true, planExpiresAt: true }
    })
    if (!profile) return res.status(404).json({ error: 'Lawyer profile not found' })

    const now = new Date()
    const isActive = !profile.planExpiresAt || profile.planExpiresAt > now
    const effectivePlan = isActive ? profile.plan : 'FREE'

    res.json({
      plan: effectivePlan,
      planExpiresAt: profile.planExpiresAt,
      isActive,
      features: PLAN_FEATURES[effectivePlan],
      availablePlans: Object.entries(PLAN_PRICES).map(([name, price]) => ({
        name,
        price,
        features: PLAN_FEATURES[name],
        isCurrent: name === effectivePlan,
      }))
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get plan info' })
  }
})

// PUT /lawyers/me/plan — upgrade or downgrade plan
planRouter.put('/me/plan', requireAuth, async (req: any, res: any) => {
  try {
    const { plan } = req.body
    const validPlans = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE']
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: `Invalid plan. Must be one of: ${validPlans.join(', ')}` })
    }

    const profile = await prisma.lawyerProfile.findUnique({ where: { userId: req.user.userId } })
    if (!profile) return res.status(404).json({ error: 'Lawyer profile not found' })

    // For paid plans: in a real app, this would trigger a Razorpay payment flow first.
    // Here we activate the plan directly (payment verification should happen before this in production).
    const planExpiresAt = plan === 'FREE'
      ? null
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    const updated = await prisma.lawyerProfile.update({
      where: { userId: req.user.userId },
      data: { plan, planExpiresAt },
      select: { plan: true, planExpiresAt: true }
    })

    // Notify the lawyer
    await prisma.notification.create({
      data: {
        userId: req.user.userId,
        type: 'SYSTEM',
        title: `Plan ${plan === 'FREE' ? 'downgraded' : 'upgraded'} to ${plan}`,
        body: plan === 'FREE'
          ? 'Your plan has been changed to FREE.'
          : `Your ${plan} plan is active until ${planExpiresAt?.toLocaleDateString('en-IN')}. Enjoy your new features!`
      }
    })

    res.json({
      message: `Plan updated to ${plan}`,
      plan: updated.plan,
      planExpiresAt: updated.planExpiresAt,
      features: PLAN_FEATURES[plan],
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update plan' })
  }
})
