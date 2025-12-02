import { Router } from 'express'
import { itemRecompensaController } from '../controllers/ItemRecompensaController'
import { tenantSchema } from '../../../core/middlewares/tenantSchema'

export const itemRecompensaRoutes = Router()

// Rotas com schema no path
itemRecompensaRoutes.get('/:schema/itens-recompensa', tenantSchema, itemRecompensaController.index)
itemRecompensaRoutes.get('/:schema/itens-recompensa/:id', tenantSchema, itemRecompensaController.show)
itemRecompensaRoutes.post('/:schema/itens-recompensa', tenantSchema, itemRecompensaController.store)
itemRecompensaRoutes.put('/:schema/itens-recompensa/:id', tenantSchema, itemRecompensaController.update)
itemRecompensaRoutes.delete('/:schema/itens-recompensa/:id', tenantSchema, itemRecompensaController.destroy)

