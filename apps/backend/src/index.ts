import app from './app'
import { prisma } from './config/database'

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    // Test koneksi database
    await prisma.$connect()
    console.log('✅ Database connected')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()