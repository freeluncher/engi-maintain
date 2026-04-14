import * as dotenv from 'dotenv'
import path from 'path'

// Resolve explicit path because npm workspaces run from monorepo root CWD
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg' // Import the 'pg' pool

// Create a connection pool using your database URL from the .env file
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

// Global singleton pattern for PrismaClient (as you had before)
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create the PrismaClient instance, passing the adapter
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // <-- This is the crucial addition
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma