import jwt from 'jsonwebtoken'

export function generateTokens(userId: string, role: string) {
  const accessToken  = jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ userId },       process.env.JWT_REFRESH_SECRET!, { expiresIn: '30d' })
  return { accessToken, refreshToken }
}

export function verifyAccess(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string }
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string }
}
