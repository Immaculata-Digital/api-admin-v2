import { Router } from 'express'
import { webRadioController } from '../controllers/WebRadioController'
import { tenantSchema } from '../../../core/middlewares/tenantSchema'

export const webRadioRoutes = Router()

// Rotas com schema no path
webRadioRoutes.get('/:schema/webradio', tenantSchema, webRadioController.index)
webRadioRoutes.get('/:schema/webradio/:id', tenantSchema, webRadioController.show)
webRadioRoutes.get('/:schema/webradio/:id/next', tenantSchema, webRadioController.getNext)
webRadioRoutes.post('/:schema/webradio', tenantSchema, webRadioController.store)
webRadioRoutes.put('/:schema/webradio/:id', tenantSchema, webRadioController.update)
webRadioRoutes.post('/:schema/webradio/reorder', tenantSchema, webRadioController.reorder)
webRadioRoutes.delete('/:schema/webradio/:id', tenantSchema, webRadioController.destroy)

