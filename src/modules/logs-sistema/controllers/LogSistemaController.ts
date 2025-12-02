import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { logSistemaRepository } from '../repositories'
import { ListLogsSistemaUseCase } from '../useCases/listLogsSistema/ListLogsSistemaUseCase'
import { CreateLogSistemaUseCase } from '../useCases/createLogSistema/CreateLogSistemaUseCase'
import { createLogSistemaSchema } from '../validators/logSistema.schema'

export class LogSistemaController {
  private readonly listLogsSistema: ListLogsSistemaUseCase
  private readonly createLogSistema: CreateLogSistemaUseCase

  constructor() {
    this.listLogsSistema = new ListLogsSistemaUseCase(logSistemaRepository)
    this.createLogSistema = new CreateLogSistemaUseCase(logSistemaRepository)
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const limit = Math.min(Number(req.query.limit || 50), 200)
      const offset = Number(req.query.offset || 0)
      const nivel = typeof req.query.nivel === 'string' ? req.query.nivel : undefined
      const operacao = typeof req.query.operacao === 'string' ? req.query.operacao : undefined
      const tabela = typeof req.query.tabela === 'string' ? req.query.tabela : undefined
      const dataInicio = req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined
      const dataFim = req.query.dataFim ? new Date(req.query.dataFim as string) : undefined

      const result = await this.listLogsSistema.execute(schema, {
        limit,
        offset,
        nivel,
        operacao,
        tabela,
        dataInicio,
        dataFim,
      })
      return res.json({ total: result.count, itens: result.rows })
    } catch (error) {
      return next(error)
    }
  }

  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const parseResult = createLogSistemaSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const log = await this.createLogSistema.execute(schema, data)

      return res.status(201).json(log)
    } catch (error) {
      return next(error)
    }
  }
}

export const logSistemaController = new LogSistemaController()

