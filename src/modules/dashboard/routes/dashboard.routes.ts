import { Router } from 'express'
import { dashboardController } from '../controllers/DashboardController'
import { tenantSchema } from '../../../core/middlewares/tenantSchema'

export const dashboardRoutes = Router()

// Rotas com schema no path
dashboardRoutes.get('/:schema/dashboard', tenantSchema, dashboardController.getDashboard)

