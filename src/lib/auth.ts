import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { inMemoryUsers } from "./user-store"
import { seedMockData } from "./mock-data"

try { seedMockData() } catch {}

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
