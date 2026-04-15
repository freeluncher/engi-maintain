import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'

const app = express()

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'http://localhost:5000'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  })
)
app.use(cors())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

import path from 'path'
// Serve static upload elements using robust process.cwd() since we run out of backend root
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    }
  }
}))

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API backend', status: 'ok' })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes API
import authRoutes from './routes/auth.routes'
import assetRoutes from './routes/asset.routes'
import analyticsRoutes from './routes/analytics.routes'
import scheduleRoutes from './routes/schedule.routes'
import userRoutes from './routes/user.routes'
import sparePartRoutes from './routes/sparePart.routes'

// Mount routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/assets', assetRoutes)
app.use('/api/v1/analytics', analyticsRoutes)
app.use('/api/v1/schedules', scheduleRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/spare-parts', sparePartRoutes)

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Terjadi kesalahan server internal.';
  res.status(status).json({ message, ...(process.env.NODE_ENV === 'development' && { detail: err.stack }) })
})

export default app