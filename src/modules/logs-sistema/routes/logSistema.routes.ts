import { Router } from 'express'
import { logSistemaController } from '../controllers/LogSistemaController'
import { tenantSchema } from '../../../core/middlewares/tenantSchema'

export const logSistemaRoutes = Router()

// Rotas com schema no path
logSistemaRoutes.get('/:schema/logs-sistema', tenantSchema, logSistemaController.index)
logSistemaRoutes.post('/:schema/logs-sistema', tenantSchema, logSistemaController.store)

