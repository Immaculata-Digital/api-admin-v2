import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Admin v2',
      version: '2.0.0',
      description: 'API Admin v2 - Gerenciamento de configurações, lojas, combos, itens de recompensa, clientes, dashboard, webradio e schemas',
      contact: {
        name: 'Concordia',
      },
    },
    servers: [
      {
        url: 'http://localhost:3335/api',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/modules/**/routes/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)

