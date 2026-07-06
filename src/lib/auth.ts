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

        try {
          const { prisma } = await import("./db")
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })
          if (user && user.password && await compare(credentials.password as string, user.password)) {
            return { id: user.id, email: user.email, name: user.name, role: user.role, image: user.avatar }
          }
        } catch {}

        try {
          const stored = inMemoryUsers.find((u: any) => u.email === credentials.email)
          if (!stored) return null
          if (await compare(credentials.password as string, stored.password)) {
            return { id: stored.id, email: stored.email, name: stored.name, role: stored.role, image: null }
          }
        } catch {}

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
  pages: { signIn: "/auth/login" },
  session: { strategy: "jwt" },
  trustHost: true,
})
