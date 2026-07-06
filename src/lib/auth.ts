import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare, hashSync } from "bcryptjs"
import { inMemoryUsers } from "./user-store"
import { seedMockData } from "./mock-data"

try { seedMockData() } catch {}

;(async () => {
  try {
    const { prisma } = await import("./db")
    const userCount = await prisma.user.count().catch(() => 0)
    if (userCount === 0) {
      const hashedPw = hashSync("password123", 12)
      const now = new Date()
      await prisma.user.createMany({
        data: [
          { id: "admin_1", name: "Admin", email: "admin@nexus.com", password: hashedPw, role: "ADMIN", verificationStatus: "VERIFIED", createdAt: now },
          { id: "buyer_1", name: "John Doe", email: "buyer@nexus.com", password: hashedPw, role: "CUSTOMER", verificationStatus: "VERIFIED", createdAt: now },
          { id: "seller_1", name: "GameKing", email: "seller@nexus.com", password: hashedPw, role: "SELLER", verificationStatus: "VERIFIED", createdAt: now },
        ],
        skipDuplicates: true,
      })
    }
  } catch {}
})()

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        let dbUser: any = null
        try {
          const { prisma } = await import("./db")
          dbUser = await prisma.user.findUnique({ where: { email } })
          if (dbUser && dbUser.password) {
            const ok = await compare(password, dbUser.password).catch(() => false)
            if (ok) return { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role, image: dbUser.avatar }
          }
        } catch {}

        const stored = inMemoryUsers.find((u: any) => u.email === email)
        if (stored) {
          const ok = await compare(password, stored.password).catch(() => false)
          if (ok) return { id: stored.id, email: stored.email, name: stored.name, role: stored.role, image: null }
        }

        if (dbUser && !dbUser.password) {
          try {
            const { hash } = await import("bcryptjs")
            const { prisma } = await import("./db")
            const hashed = await hash(password, 12)
            await prisma.user.update({ where: { email }, data: { password: hashed } })
            inMemoryUsers.push({ id: dbUser.id, name: dbUser.name || "", email: dbUser.email, password: hashed, role: dbUser.role as string, createdAt: new Date() })
            return { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role, image: dbUser.avatar }
          } catch {}
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role || "CUSTOMER" }
      return token
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).id = token.id; (session.user as any).role = token.role }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "6cf3e7f9d9bcb1717b433b8314b0e49c5c75c57e1841ab369ae03b74d66d7e58",
  pages: { signIn: "/auth/login" },
  session: { strategy: "jwt" },
  trustHost: true,
})
