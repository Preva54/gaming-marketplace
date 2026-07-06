export interface StoredUser {
  id: string
  name: string
  email: string
  password: string
  role: string
  avatar?: string | null
  verificationStatus?: string
  twoFactorEnabled?: boolean
  twoFactorSecret?: string | null
  createdAt?: Date
}

const globalForUsers = globalThis as unknown as {
  _inMemoryUsers?: StoredUser[]
}

export const inMemoryUsers: StoredUser[] = globalForUsers._inMemoryUsers ?? []

globalForUsers._inMemoryUsers = inMemoryUsers
