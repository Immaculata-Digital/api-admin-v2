import type { NextFunction, Request, Response } from 'express'
import { DashboardService } from '../services/DashboardService'

export class DashboardController {
  private readonly dashboardService: DashboardService

  constructor() {
    this.dashboardService = new DashboardService()
  }

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const lojaIdParam = req.query.idLoja as string | undefined
      let lojaIds: number[] | undefined

      // Se idLoja foi passado como parâmetro, usar ele (pode ser múltiplos separados por vírgula)
      if (lojaIdParam) {
        const parsedIds = lojaIdParam.split(',').map(id => Number(id.trim())).filter(id => !Number.isNaN(id) && id > 0)
        if (parsedIds.length > 0) {
          lojaIds = parsedIds
        } else {
          return res.status(400).json({ message: 'Parâmetro idLoja inválido' })
        }
      }

      // Se o usuário estiver autenticado, buscar lojas gestoras dele
      if (req.user?.userId && !lojaIds) {
        const userId = req.user.userId // userId é UUID (string)
        const lojasGestoras = await this.dashboardService.getLojasGestorasForUserInSchema(userId, schema)
        if (lojasGestoras.length > 0) {
          lojaIds = lojasGestoras
        }
      }

      const data = await this.dashboardService.getDashboardData(schema, lojaIds)
      return res.json(data)
    } catch (error) {
      return next(error)
    }
  }
}

export const dashboardController = new DashboardController()

