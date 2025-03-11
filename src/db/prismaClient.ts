import { PrismaClient } from '@prisma/client'

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient()

/**
 * Initialize the database connection
 */
export const initDatabase = async () => {
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Successfully connected to the database')
    
    return prisma
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error)
    console.warn('⚠️ Continuing without database connection. Some features may not work.')
    // Don't exit the process, allow the application to continue
    return null
  }
}

export { prisma }