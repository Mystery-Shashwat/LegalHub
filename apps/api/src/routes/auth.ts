import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { generateTokens, verifyRefresh } from '../lib/tokens'

export const authRouter = Router()

// ── CLIENT REGISTER ─────────────────────────
const clientSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  phone:    z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
})

authRouter.post('/register/client', async (req, res) => {
  const r = clientSchema.safeParse(req.body)
  if (!r.success) return res.status(400).json({ errors: r.error.flatten().fieldErrors })

  const { name, email, phone, password } = r.data
  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } })
  if (exists) return res.status(409).json({ error: 'Email or phone already registered' })

  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash: await bcrypt.hash(password, 12),
            role: 'CLIENT', clientProfile: { create: {} } },
    select: { id: true, name: true, email: true, role: true }
  })
  const tokens = generateTokens(user.id, user.role)
  await saveRefresh(user.id, tokens.refreshToken)
  res.status(201).json({ user, ...tokens })
})

// ── LAWYER REGISTER ─────────────────────────
const lawyerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  barCouncilNumber:  z.string().min(3),
  barCouncilState:   z.string().min(2),
  enrollmentYear:    z.number().int().min(1950).max(new Date().getFullYear()),
  specializations:   z.array(z.string()).min(1).max(5),
  courtsOfPractice:  z.array(z.string()).min(1),
  experienceYears:   z.number().int().min(0).max(50),
  city:              z.string().min(2),
  state:             z.string().min(2),
  languages:         z.array(z.string()).min(1),
  hourlyRate:        z.number().min(500),
  bio:               z.string().max(500).optional(),
  degreeCollege:     z.string().optional(),
  degreeYear:        z.number().int().optional(),
  freeConsultation:  z.boolean().default(false),
  freeConsultMinutes:z.number().default(0),
  linkedinUrl:       z.string().url().optional(),
  websiteUrl:        z.string().url().optional(),
  certificateOfPracticeUrl: z.string().url().optional(),
  degreeDocumentUrl: z.string().url().optional(),
  govtIdUrl:         z.string().url().optional(),
})

authRouter.post('/register/lawyer', async (req, res) => {
  const r = lawyerSchema.safeParse(req.body)
  if (!r.success) return res.status(400).json({ errors: r.error.flatten().fieldErrors })
  const { name, email, phone, password, ...profile } = r.data

  const [e, p, b] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findFirst({ where: { phone } }),
    prisma.lawyerProfile.findUnique({ where: { barCouncilNumber: profile.barCouncilNumber } })
  ])
  if (e) return res.status(409).json({ error: 'Email already registered' })
  if (p) return res.status(409).json({ error: 'Phone already registered' })
  if (b) return res.status(409).json({ error: 'Bar Council number already registered' })

  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash: await bcrypt.hash(password, 12),
            role: 'LAWYER', lawyerProfile: { create: { ...profile, status: 'PENDING' } } },
    include: { lawyerProfile: { select: { id: true, status: true } } }
  })

  // Seed default availability slots (Mon-Fri 09:00 - 17:00) so bookings can happen immediately
  if (user.lawyerProfile) {
      const defaultSlots = [1, 2, 3, 4, 5].map(day => ({
          lawyerProfileId: user.lawyerProfile!.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isActive: true
      }));
      await prisma.availability.createMany({ data: defaultSlots });
  }

  const tokens = generateTokens(user.id, user.role)
  await saveRefresh(user.id, tokens.refreshToken)
  res.status(201).json({
    user: { id: user.id, name, email, role: user.role, lawyerStatus: user.lawyerProfile?.status },
    ...tokens,
    message: 'Registered! Upload your documents to complete verification.'
  })
})

// ── LOGIN ────────────────────────────────────
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({
    where: { email },
    include: { lawyerProfile: { select: { status: true, id: true } } }
  })
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return res.status(401).json({ error: 'Invalid credentials' })
  if (!user.isActive)
    return res.status(403).json({ error: 'Account suspended' })

  const tokens = generateTokens(user.id, user.role)
  await saveRefresh(user.id, tokens.refreshToken)

  res.json({
    user: { id: user.id, name: user.name, email, role: user.role,
            lawyerStatus: user.lawyerProfile?.status || null },
    ...tokens,
    redirectTo: user.role === 'ADMIN' ? '/admin/dashboard'
               : user.role === 'LAWYER' ? '/lawyer/dashboard'
               : '/client/dashboard'
  })
})

// ── REFRESH TOKEN ────────────────────────────
authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' })
  try {
    const { userId } = verifyRefresh(refreshToken)
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.userId !== userId) throw new Error('Invalid')
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const tokens = generateTokens(userId, user!.role)
    await prisma.refreshToken.delete({ where: { token: refreshToken } }) // rotate
    await saveRefresh(userId, tokens.refreshToken)
    res.json(tokens)
  } catch { res.status(401).json({ error: 'Invalid refresh token' }) }
})

// ── LOGOUT ───────────────────────────────────
authRouter.post('/logout', async (req, res) => {
  const { refreshToken } = req.body
  if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
  res.json({ message: 'Logged out' })
})

// ── helper ───────────────────────────────────
async function saveRefresh(userId: string, token: string) {
  await prisma.refreshToken.create({
    data: { userId, token, expiresAt: new Date(Date.now() + 30*24*60*60*1000) }
  })
}
