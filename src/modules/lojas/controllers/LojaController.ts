import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { lojaRepository } from '../repositories'
import { ListLojasUseCase } from '../useCases/listLojas/ListLojasUseCase'
import { GetLojaUseCase } from '../useCases/getLoja/GetLojaUseCase'
import { CreateLojaUseCase } from '../useCases/createLoja/CreateLojaUseCase'
import { UpdateLojaUseCase } from '../useCases/updateLoja/UpdateLojaUseCase'
import { DeleteLojaUseCase } from '../useCases/deleteLoja/DeleteLojaUseCase'
import { createLojaSchema, updateLojaSchema } from '../validators/loja.schema'

export class LojaController {
  private readonly listLojas: ListLojasUseCase
  private readonly getLoja: GetLojaUseCase
  private readonly createLoja: CreateLojaUseCase
  private readonly updateLoja: UpdateLojaUseCase
  private readonly deleteLoja: DeleteLojaUseCase

  constructor() {
    this.listLojas = new ListLojasUseCase(lojaRepository)
    this.getLoja = new GetLojaUseCase(lojaRepository)
    this.createLoja = new CreateLojaUseCase(lojaRepository)
    this.updateLoja = new UpdateLojaUseCase(lojaRepository)
    this.deleteLoja = new DeleteLojaUseCase(lojaRepository)
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const limit = Math.min(Number(req.query.limit || 50), 200)
      const offset = Number(req.query.offset || 0)
      const search = typeof req.query.search === 'string' ? req.query.search : undefined

      const result = await this.listLojas.execute(schema, { limit, offset, search })
      return res.json({ total: result.count, itens: result.rows })
    } catch (error) {
      return next(error)
    }
  }

  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      const loja = await this.getLoja.execute(schema, id)
      return res.json(loja)
    } catch (error) {
      return next(error)
    }
  }

  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const parseResult = createLojaSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuCadastro = req.user?.userId ? parseInt(req.user.userId, 10) : data.usu_cadastro

      if (!usuCadastro || usuCadastro <= 0) {
        throw new AppError('usu_cadastro obrigatório e deve ser > 0', 400)
      }

      const loja = await this.createLoja.execute(schema, {
        ...data,
        usu_cadastro: usuCadastro,
      })

      return res.status(201).json(loja)
    } catch (error) {
      return next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      const parseResult = updateLojaSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuAltera = req.user?.userId ? parseInt(req.user.userId, 10) : data.usu_altera

      const loja = await this.updateLoja.execute(schema, id, {
        ...data,
        usu_altera: usuAltera ?? null,
      })

      return res.json(loja)
    } catch (error) {
      return next(error)
    }
  }

  destroy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      await this.deleteLoja.execute(schema, id)
      return res.status(204).send()
    } catch (error) {
      return next(error)
    }
  }
}

export const lojaController = new LojaController()

