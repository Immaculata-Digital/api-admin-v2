import { Router } from 'express'
import { lojaController } from '../controllers/LojaController'
import { tenantSchema } from '../../../core/middlewares/tenantSchema'

export const lojaRoutes = Router()

// Rotas com schema no path
lojaRoutes.get('/:schema/lojas', tenantSchema, lojaController.index)
lojaRoutes.get('/:schema/lojas/:id', tenantSchema, lojaController.show)
lojaRoutes.post('/:schema/lojas', tenantSchema, lojaController.store)
lojaRoutes.put('/:schema/lojas/:id', tenantSchema, lojaController.update)
lojaRoutes.delete('/:schema/lojas/:id', tenantSchema, lojaController.destroy)
lojaRoutes.get('/:schema/lojas/:id/responsaveis', tenantSchema, lojaController.getResponsaveis)
lojaRoutes.put('/:schema/lojas/:id/responsaveis', tenantSchema, lojaController.updateResponsaveis)

