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
      const lojaIds = await this.getEffectiveLojaIds(req, schema)
      const data = await this.dashboardService.getDashboardData(schema, lojaIds)
      return res.json(data)
    } catch (error) {
      return next(error)
    }
  }

  getChartData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const kpi = req.query.kpi as string
      const period = Number(req.query.period)
      const lojaIds = await this.getEffectiveLojaIds(req, schema)

      if (!kpi || !period) {
        return res.status(400).json({ message: 'Parâmetros kpi e period são obrigatórios' })
      }

      const data = await this.dashboardService.getChartData(schema, kpi, period, lojaIds)
      return res.json(data)
    } catch (error) {
      return next(error)
    }
  }

  getFidelidadeKPIs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const period = req.query.period !== undefined ? Number(req.query.period) : 30
      const startDate = req.query.startDate as string | undefined
      const endDate = req.query.endDate as string | undefined
      const lojaIds = await this.getEffectiveLojaIds(req, schema)
      const data = await this.dashboardService.getFidelidadeKPIs(schema, period, lojaIds, startDate, endDate)
      return res.json(data)
    } catch (error) {
      return next(error)
    }
  }

  getFidelidadeStoresData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const kpi = req.query.kpi as string
      const period = req.query.period !== undefined ? Number(req.query.period) : 30
      const startDate = req.query.startDate as string | undefined
      const endDate = req.query.endDate as string | undefined
      const lojaIds = await this.getEffectiveLojaIds(req, schema)
      const data = await this.dashboardService.getFidelidadeStoresData(schema, kpi, period, lojaIds, startDate, endDate)
      return res.json(data)
    } catch (error) {
      return next(error)
    }
  }

  getClienteKPIs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const period = req.query.period !== undefined ? Number(req.query.period) : 30
      const startDate = req.query.startDate as string | undefined
      const endDate = req.query.endDate as string | undefined
      const lojaIds = await this.getEffectiveLojaIds(req, schema)
      const data = await this.dashboardService.getClienteKPIs(schema, period, lojaIds, startDate, endDate)
      return res.json(data)
    } catch (error) {
      return next(error)
    }
  }

  getClienteStoresData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const kpi = req.query.kpi as string
      const period = req.query.period !== undefined ? Number(req.query.period) : 30
      const startDate = req.query.startDate as string | undefined
      const endDate = req.query.endDate as string | undefined
      const lojaIds = await this.getEffectiveLojaIds(req, schema)
      const data = await this.dashboardService.getClienteStoresData(schema, kpi, period, lojaIds, startDate, endDate)
      return res.json(data)
    } catch (error) {
      return next(error)
    }
  }

  getMapData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const lojaIds = await this.getEffectiveLojaIds(req, schema)
      if (!lojaIds || lojaIds.length === 0) {
        return res.status(400).json({ message: 'idLoja é obrigatório para o mapa' })
      }
      const data = await this.dashboardService.getMapData(schema, lojaIds)
      return res.json(data)
    } catch (error) {
      return next(error)
    }
  }

  private async getEffectiveLojaIds(req: Request, schema: string): Promise<number[] | undefined> {
    const userId = req.user?.userId
    const lojaIdParam = req.query.idLoja as string | undefined
    let requestedIds: number[] | undefined

    if (lojaIdParam) {
      requestedIds = lojaIdParam.split(',').map(id => Number(id.trim())).filter(id => !Number.isNaN(id) && id > 0)
    }

    if (userId) {
      const allowedLojas = await this.dashboardService.getLojasGestorasForUserInSchema(userId, schema)
      if (allowedLojas.length > 0) {
        // Se o usuário tem restrição de lojas, garantir que ele só peça as que pode
        if (requestedIds && requestedIds.length > 0) {
          const filtered = requestedIds.filter(id => allowedLojas.includes(id))
          return filtered.length > 0 ? filtered : [-1]
        }
        // Se não pediu nenhuma específica, retornar todas as que ele tem acesso
        return allowedLojas
      }
    }

    return requestedIds
  }
}

export const dashboardController = new DashboardController()

