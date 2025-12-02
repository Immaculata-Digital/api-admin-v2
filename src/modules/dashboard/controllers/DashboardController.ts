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
      let lojaId: number | undefined

      if (lojaIdParam) {
        const parsed = Number(lojaIdParam)
        if (Number.isNaN(parsed) || parsed <= 0) {
          return res.status(400).json({ message: 'Parâmetro idLoja inválido' })
        }
        lojaId = parsed
      }

      // Se o usuário estiver autenticado, tentar obter a loja dele
      if (req.user?.userId) {
        const userId = parseInt(req.user.userId, 10)
        const lojaDoGestor = await this.dashboardService.getLojaIdForUserInSchema(userId, schema)
        if (typeof lojaDoGestor === 'number') {
          lojaId = lojaDoGestor
        }
      }

      const data = await this.dashboardService.getDashboardData(schema, lojaId)
      return res.json(data)
    } catch (error) {
      return next(error)
    }
  }
}

export const dashboardController = new DashboardController()

