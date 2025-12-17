import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { logSistemaRepository } from '../repositories'
import { ListLogsSistemaUseCase } from '../useCases/listLogsSistema/ListLogsSistemaUseCase'
import { CreateLogSistemaUseCase } from '../useCases/createLogSistema/CreateLogSistemaUseCase'
import { createLogSistemaSchema } from '../validators/logSistema.schema'
import type { CreateLogSistemaDTO } from '../dto/CreateLogSistemaDTO'

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

      const params: { limit: number; offset: number; nivel?: string; operacao?: string; tabela?: string; dataInicio?: Date; dataFim?: Date } = { limit, offset }
      if (nivel !== undefined) params.nivel = nivel
      if (operacao !== undefined) params.operacao = operacao
      if (tabela !== undefined) params.tabela = tabela
      if (dataInicio !== undefined) params.dataInicio = dataInicio
      if (dataFim !== undefined) params.dataFim = dataFim

      const result = await this.listLogsSistema.execute(schema, params)
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
      const createData: CreateLogSistemaDTO = {
        nivel: data.nivel,
        operacao: data.operacao,
        mensagem: data.mensagem,
      }
      if (data.tabela !== undefined) createData.tabela = data.tabela
      if (data.id_registro !== undefined) createData.id_registro = data.id_registro
      if (data.usuario_id !== undefined) createData.usuario_id = data.usuario_id
      if (data.dados_antes !== undefined) createData.dados_antes = data.dados_antes
      if (data.dados_depois !== undefined) createData.dados_depois = data.dados_depois
      if (data.ip_origem !== undefined) createData.ip_origem = data.ip_origem
      if (data.user_agent !== undefined) createData.user_agent = data.user_agent
      if (data.dados_extras !== undefined) createData.dados_extras = data.dados_extras

      const log = await this.createLogSistema.execute(schema, createData)

      return res.status(201).json(log)
    } catch (error) {
      return next(error)
    }
  }
}

export const logSistemaController = new LogSistemaController()

