import { Router } from 'express'
import { requireAuth } from '../middleware/guards'
import { prisma } from '../lib/prisma'
import { sendEmail } from '../services/email'
import crypto from 'crypto'

export const verificationRouter = Router()

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString()
}

// POST /auth/send-otp — send email OTP for verification
verificationRouter.post('/send-otp', requireAuth, async (req: any, res: any) => {
  try {
    const { purpose = 'email_verification' } = req.body
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (purpose === 'email_verification' && user.isEmailVerified) {
      return res.status(400).json({ error: 'Email is already verified' })
    }

    // Invalidate any previous unused OTPs for this purpose
    await prisma.oTPCode.updateMany({
      where: { userId: user.id, purpose, usedAt: null },
      data: { usedAt: new Date() } // mark as used so they're expired
    })

    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.oTPCode.create({
      data: { userId: user.id, code, purpose, expiresAt }
    })

    // Send OTP email
    await sendEmail({
      to: user.email,
      subject: 'Your LegalHub verification code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Verify your email</h2>
          <p>Hi ${user.name},</p>
          <p>Your verification code is:</p>
          <div style="background: #f0f4ff; border: 2px solid #3b82f6; border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #6b7280; font-size: 13px;">If you did not request this, please ignore this email.</p>
        </div>
      `
    })

    res.json({ message: 'OTP sent to your email address', expiresIn: 600 })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send OTP' })
  }
})

// POST /auth/verify-otp — verify the OTP code
verificationRouter.post('/verify-otp', requireAuth, async (req: any, res: any) => {
  try {
    const { code, purpose = 'email_verification' } = req.body
    if (!code) return res.status(400).json({ error: 'OTP code is required' })

    const otp = await prisma.oTPCode.findFirst({
      where: {
        userId: req.user.userId,
        purpose,
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new one.' })
    }

    if (otp.code !== code) {
      return res.status(400).json({ error: 'Incorrect OTP code.' })
    }

    // Mark OTP as used
    await prisma.oTPCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } })

    // Update verification status
    if (purpose === 'email_verification') {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { isEmailVerified: true }
      })
    } else if (purpose === 'phone_verification') {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { isPhoneVerified: true }
      })
    }

    res.json({
      message: purpose === 'email_verification'
        ? 'Email verified successfully!'
        : 'Phone verified successfully!',
      verified: true
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to verify OTP' })
  }
})

// POST /auth/verify-email — legacy: verify via URL token (from email link)
verificationRouter.post('/verify-email', async (req: any, res: any) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Token is required' })

    // For link-based verification: look up the token in password resets (same mechanism)
    const reset = await prisma.passwordReset.findFirst({
      where: { token, usedAt: null, expiresAt: { gt: new Date() } }
    })

    if (!reset) return res.status(400).json({ error: 'Invalid or expired verification link' })

    await prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } })
    await prisma.user.update({ where: { id: reset.userId }, data: { isEmailVerified: true } })

    res.json({ message: 'Email verified successfully!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to verify email' })
  }
})
