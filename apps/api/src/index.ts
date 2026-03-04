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
import { setupSocket }    from './services/socket'
import { rateLimiter }    from './middleware/rateLimit'

dotenv.config()
const app    = express()
const server = createServer(app)
const io     = new Server(server, { cors: { origin: process.env.FRONTEND_URL } })

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
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
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }))

setupSocket(io)

const PORT = process.env.PORT || 3001
server.listen(PORT, () => console.log(`✅ API on http://localhost:${PORT}`))
