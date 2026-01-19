import { PrismaClient } from '../prisma/generated/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit during hot reloading in development.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma v7 with Prisma Postgres (managed database service)
// Use accelerateUrl for connection pooling and proxying
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  accelerateUrl: process.env.PRISMA_DATABASE_URL,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
