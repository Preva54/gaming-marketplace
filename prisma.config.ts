import { defineConfig } from "@prisma/config"
import { readFileSync } from "fs"
import { resolve } from "path"

const envPath = resolve(process.cwd(), ".env")
try {
  const envContent = readFileSync(envPath, "utf-8")
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=")
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim()
        let value = trimmed.slice(eq + 1).trim()
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    }
  }
} catch {}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "mysql://root:password@localhost:3306/gaming_marketplace",
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
})
