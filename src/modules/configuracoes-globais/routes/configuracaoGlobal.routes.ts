import { Router } from 'express'
import { configuracaoGlobalController } from '../controllers/ConfiguracaoGlobalController'
import { tenantSchema } from '../../../core/middlewares/tenantSchema'

export const configuracaoGlobalRoutes = Router()

// Rotas com schema no path
configuracaoGlobalRoutes.get('/:schema/configuracoes-globais', tenantSchema, configuracaoGlobalController.index)
configuracaoGlobalRoutes.get('/:schema/configuracoes-globais/:id', tenantSchema, configuracaoGlobalController.show)
configuracaoGlobalRoutes.post('/:schema/configuracoes-globais', tenantSchema, configuracaoGlobalController.store)
configuracaoGlobalRoutes.put('/:schema/configuracoes-globais/:id', tenantSchema, configuracaoGlobalController.update)
configuracaoGlobalRoutes.delete('/:schema/configuracoes-globais/:id', tenantSchema, configuracaoGlobalController.destroy)

