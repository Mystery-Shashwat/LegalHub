import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import { authRouter }     from './routes/auth'
import { lawyerRouter }   from './routes/lawyers'
import { bookingRouter }  from './routes/bookings'
import { clientRouter }   from './routes/clients'
import { paymentRouter }  from './routes/payments'
import { reviewRouter }   from './routes/reviews'
import { caseRouter }     from './routes/cases'
import { messageRouter }  from './routes/messages'
import { uploadRouter }   from './routes/uploads'
import { adminRouter }    from './routes/admin'
import { aiRouter }       from './routes/ai'
import { signatureRouter } from './routes/signatures'
import { forumRouter }    from './routes/forum'
import { rtiRouter }      from './routes/rti'
import { templateRouter } from './routes/templates'
import { referralRouter } from './routes/referrals'
import { notificationRouter } from './routes/notifications'
import { lawyerEarningsRouter } from './routes/lawyer-earnings'
import { planRouter } from './routes/lawyer-plan'
import { verificationRouter } from './routes/verification'
import { blogRouter } from './routes/blog'
import { setupSocket }    from './services/socket'
import { rateLimiter }    from './middleware/rateLimit'

dotenv.config()
const app    = express()
const server = createServer(app)

// Sanitize FRONTEND_URL to remove trailing slashes (CORS requirement)
const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') || 'http://localhost:3000'

const io     = new Server(server, { cors: { origin: frontendUrl } })

app.use(helmet())
app.use(cors({ origin: frontendUrl, credentials: true }))
app.use(express.json({ limit: '5mb' }))
app.use('/api', rateLimiter)

app.use('/api/auth',     authRouter)
app.use('/api/clients',  clientRouter)
app.use('/api/lawyers',  lawyerRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/payments', paymentRouter)
app.use('/api/reviews',  reviewRouter)
app.use('/api/cases',    caseRouter)
app.use('/api/messages', messageRouter)
app.use('/api/uploads',  uploadRouter)
app.use('/api/admin',    adminRouter)
app.use('/api/ai',       aiRouter)
app.use('/api/signatures', signatureRouter)
app.use('/api/forum',      forumRouter)
app.use('/api/rti',        rtiRouter)
app.use('/api/templates',  templateRouter)
app.use('/api/referrals',  referralRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/lawyers',    lawyerEarningsRouter)  // earnings/analytics sub-routes
app.use('/api/lawyers',    planRouter)            // plan upgrade sub-routes
app.use('/api/auth',       verificationRouter)    // OTP + email verification
app.use('/api/blog',       blogRouter)
app.use('/api/users',      clientRouter)          // shared user profile routes (GET/PUT /users/me, PUT /users/me/password)
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }))

setupSocket(io)

const PORT = process.env.PORT || 3001
server.listen(PORT, () => console.log(`✅ API on http://localhost:${PORT}`))
