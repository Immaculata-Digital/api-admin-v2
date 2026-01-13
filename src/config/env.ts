import { config } from 'dotenv'

config()

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  app: {
    port: Number(process.env.PORT ?? 3335),
    webUrl: process.env.APP_WEB_URL ?? 'http://localhost:5173',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    name: process.env.DB_NAME ?? 'immaculata-v2',
    user: process.env.DB_USER ?? 'developer',
    password: process.env.DB_PASS ?? '',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET ?? 'default-jwt-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '12h',
    cryptoSecret: process.env.CRYPTO_SECRET ?? 'default-crypto-secret',
  },
  apiUsuarios: {
    url: process.env.API_USUARIOS_URL ?? 'http://localhost:3333/api',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
  },
}
