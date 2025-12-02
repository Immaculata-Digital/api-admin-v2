import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { configuracaoGlobalRepository } from '../repositories'
import { ListConfiguracoesGlobaisUseCase } from '../useCases/listConfiguracoesGlobais/ListConfiguracoesGlobaisUseCase'
import { GetConfiguracaoGlobalUseCase } from '../useCases/getConfiguracaoGlobal/GetConfiguracaoGlobalUseCase'
import { CreateConfiguracaoGlobalUseCase } from '../useCases/createConfiguracaoGlobal/CreateConfiguracaoGlobalUseCase'
import { UpdateConfiguracaoGlobalUseCase } from '../useCases/updateConfiguracaoGlobal/UpdateConfiguracaoGlobalUseCase'
import { DeleteConfiguracaoGlobalUseCase } from '../useCases/deleteConfiguracaoGlobal/DeleteConfiguracaoGlobalUseCase'
import { createConfiguracaoGlobalSchema, updateConfiguracaoGlobalSchema } from '../validators/configuracaoGlobal.schema'

export class ConfiguracaoGlobalController {
  private readonly listConfiguracoesGlobais: ListConfiguracoesGlobaisUseCase
  private readonly getConfiguracaoGlobal: GetConfiguracaoGlobalUseCase
  private readonly createConfiguracaoGlobal: CreateConfiguracaoGlobalUseCase
  private readonly updateConfiguracaoGlobal: UpdateConfiguracaoGlobalUseCase
  private readonly deleteConfiguracaoGlobal: DeleteConfiguracaoGlobalUseCase

  constructor() {
    this.listConfiguracoesGlobais = new ListConfiguracoesGlobaisUseCase(configuracaoGlobalRepository)
    this.getConfiguracaoGlobal = new GetConfiguracaoGlobalUseCase(configuracaoGlobalRepository)
    this.createConfiguracaoGlobal = new CreateConfiguracaoGlobalUseCase(configuracaoGlobalRepository)
    this.updateConfiguracaoGlobal = new UpdateConfiguracaoGlobalUseCase(configuracaoGlobalRepository)
    this.deleteConfiguracaoGlobal = new DeleteConfiguracaoGlobalUseCase(configuracaoGlobalRepository)
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const limit = Math.min(Number(req.query.limit || 50), 200)
      const offset = Number(req.query.offset || 0)

      const result = await this.listConfiguracoesGlobais.execute(schema, { limit, offset })
      return res.json({ total: result.count, itens: result.rows })
    } catch (error) {
      return next(error)
    }
  }

  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      const config = await this.getConfiguracaoGlobal.execute(schema, id)
      return res.json(config)
    } catch (error) {
      return next(error)
    }
  }

  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const parseResult = createConfiguracaoGlobalSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuCadastro = req.user?.userId ? parseInt(req.user.userId, 10) : data.usu_cadastro

      if (!usuCadastro || usuCadastro <= 0) {
        throw new AppError('usu_cadastro obrigatório e deve ser > 0', 400)
      }

      const config = await this.createConfiguracaoGlobal.execute(schema, {
        ...data,
        usu_cadastro: usuCadastro,
      })

      return res.status(201).json(config)
    } catch (error) {
      return next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      const parseResult = updateConfiguracaoGlobalSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuAltera = req.user?.userId ? parseInt(req.user.userId, 10) : data.usu_altera

      const config = await this.updateConfiguracaoGlobal.execute(schema, id, {
        ...data,
        usu_altera: usuAltera ?? null,
      })

      return res.json(config)
    } catch (error) {
      return next(error)
    }
  }

  destroy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      await this.deleteConfiguracaoGlobal.execute(schema, id)
      return res.status(204).send()
    } catch (error) {
      return next(error)
    }
  }
}

export const configuracaoGlobalController = new ConfiguracaoGlobalController()

