import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { seedMockData } from "./mock-data"
try { seedMockData() } catch {}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createProxy() {
  return new Proxy({} as PrismaClient, {
    get(_, prop) {
      if (prop === "$connect" || prop === "$disconnect" || prop === "$on") {
        return () => Promise.resolve()
      }
      if (prop === "$use") {
        return () => {}
      }
      if (prop === "_baseDmmf" || prop === "_runtimeDataModel") {
        return undefined
      }
      return () => Promise.reject(new Error("Database not available."))
    },
  })
}

function initPrisma(): PrismaClient {
  if (!process.env.DATABASE_URL) return createProxy()
  try {
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL)
    return new PrismaClient({ adapter })
  } catch (e) {
    console.warn("[DB] PrismaClient initialization failed:", (e as Error).message)
    return createProxy()
  }
}

export const prisma = globalForPrisma.prisma ?? initPrisma()

globalForPrisma.prisma = prisma
