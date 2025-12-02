import { Router } from 'express'
import { schemaController } from '../controllers/SchemaController'

export const schemaRoutes = Router()

// Rotas de gerenciamento de schemas
schemaRoutes.get('/admin/schemas', schemaController.list)
schemaRoutes.get('/admin/schemas/:schemaName/exists', schemaController.checkExists)
schemaRoutes.post('/admin/schemas', schemaController.createCompleteTenant)
schemaRoutes.post('/admin/schemas/:schemaName/tables', schemaController.createSchemaTables)

