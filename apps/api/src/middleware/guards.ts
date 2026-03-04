import { verifyAccess } from '../lib/tokens'
import { prisma } from '../lib/prisma'

const getToken = (req: any) => req.headers.authorization?.split(' ')[1]

export const requireAuth = (req: any, res: any, next: any) => {
  const t = getToken(req)
  if (!t) return res.status(401).json({ error: 'Login required' })
  try   { req.user = verifyAccess(t); next() }
  catch { res.status(401).json({ error: 'Session expired. Please login again.' }) }
}

export const requireAdmin = [
  requireAuth,
  (req: any, res: any, next: any) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' })
    next()
  }
]

export const requireClient = [
  requireAuth,
  (req: any, res: any, next: any) => {
    if (req.user.role !== 'CLIENT') return res.status(403).json({ error: 'Clients only' })
    next()
  }
]

export const requireVerifiedLawyer = [
  requireAuth,
  async (req: any, res: any, next: any) => {
    if (req.user.role !== 'LAWYER') return res.status(403).json({ error: 'Lawyers only' })
    const p = await prisma.lawyerProfile.findUnique({
      where: { userId: req.user.userId }, select: { status: true }
    })
    if (p?.status !== 'VERIFIED')
      return res.status(403).json({ error: 'Account pending verification', status: p?.status })
    next()
  }
]
