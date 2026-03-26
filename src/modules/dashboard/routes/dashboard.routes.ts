import { Router } from 'express'
import { dashboardController } from '../controllers/DashboardController'
import { tenantSchema } from '../../../core/middlewares/tenantSchema'

export const dashboardRoutes = Router()

// Rotas com schema no path
dashboardRoutes.get('/:schema/dashboard', tenantSchema, dashboardController.getDashboard)
dashboardRoutes.get('/:schema/dashboard/charts', tenantSchema, dashboardController.getChartData)

// Novas rotas para Fidelidade e Clientes
dashboardRoutes.get('/:schema/dashboard/fidelidade', tenantSchema, dashboardController.getFidelidadeKPIs)
dashboardRoutes.get('/:schema/dashboard/fidelidade/stores', tenantSchema, dashboardController.getFidelidadeStoresData)
dashboardRoutes.get('/:schema/dashboard/clientes', tenantSchema, dashboardController.getClienteKPIs)
dashboardRoutes.get('/:schema/dashboard/clientes/stores', tenantSchema, dashboardController.getClienteStoresData)
dashboardRoutes.get('/:schema/dashboard/mapa', tenantSchema, dashboardController.getMapData)

