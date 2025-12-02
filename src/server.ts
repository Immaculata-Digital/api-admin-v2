import { env } from './config/env'
import { app } from './app'

const { port } = env.app

app.listen(port, () => {
  console.log(`🚀 API Admin v2 iniciada em http://localhost:${port}/api`)
  console.log(`📚 Documentação Swagger: http://localhost:${port}/docs`)
})

