import "server-only"

function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

// Server-only values. Next.js loads the .env files itself, so dotenv isn't needed
export const env = {
  NODE_ENV: getEnv("NODE_ENV"),
  API_URL: getEnv("API_URL"),
  FRONTEND_SECRET: getEnv("FRONTEND_SECRET"),

  DEMO_ADMIN_EMAIL: getEnv("DEMO_ADMIN_EMAIL"),
  DEMO_ADMIN_PASSWORD: getEnv("DEMO_ADMIN_PASSWORD"),
} as const
