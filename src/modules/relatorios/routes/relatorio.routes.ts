import { Router } from 'express'
import { relatorioController } from '../controllers/RelatorioController'
import { tenantSchema } from '../../../core/middlewares/tenantSchema'

export const relatorioRoutes = Router()

// Relatório de Histórico de Compras - Fidelidade
relatorioRoutes.get(
    '/:schema/relatorios/historico-compras',
    tenantSchema,
    relatorioController.historicoFidelidade
)
