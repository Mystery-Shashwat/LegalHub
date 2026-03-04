import rateLimit from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per IP per window
  message: { error: 'Too many requests. Try again later.' }
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                    // stricter for login/register
  message: { error: 'Too many auth attempts.' }
})
