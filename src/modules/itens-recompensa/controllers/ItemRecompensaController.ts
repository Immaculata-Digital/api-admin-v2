import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { itemRecompensaRepository } from '../repositories'
import { ListItensRecompensaUseCase } from '../useCases/listItensRecompensa/ListItensRecompensaUseCase'
import { GetItemRecompensaUseCase } from '../useCases/getItemRecompensa/GetItemRecompensaUseCase'
import { CreateItemRecompensaUseCase } from '../useCases/createItemRecompensa/CreateItemRecompensaUseCase'
import { UpdateItemRecompensaUseCase } from '../useCases/updateItemRecompensa/UpdateItemRecompensaUseCase'
import { DeleteItemRecompensaUseCase } from '../useCases/deleteItemRecompensa/DeleteItemRecompensaUseCase'
import { createItemRecompensaSchema, updateItemRecompensaSchema } from '../validators/itemRecompensa.schema'

export class ItemRecompensaController {
  private readonly listItensRecompensa: ListItensRecompensaUseCase
  private readonly getItemRecompensa: GetItemRecompensaUseCase
  private readonly createItemRecompensa: CreateItemRecompensaUseCase
  private readonly updateItemRecompensa: UpdateItemRecompensaUseCase
  private readonly deleteItemRecompensa: DeleteItemRecompensaUseCase

  constructor() {
    this.listItensRecompensa = new ListItensRecompensaUseCase(itemRecompensaRepository)
    this.getItemRecompensa = new GetItemRecompensaUseCase(itemRecompensaRepository)
    this.createItemRecompensa = new CreateItemRecompensaUseCase(itemRecompensaRepository)
    this.updateItemRecompensa = new UpdateItemRecompensaUseCase(itemRecompensaRepository)
    this.deleteItemRecompensa = new DeleteItemRecompensaUseCase(itemRecompensaRepository)
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const limit = Math.min(Number(req.query.limit || 50), 200)
      const offset = Number(req.query.offset || 0)
      const search = typeof req.query.search === 'string' ? req.query.search : undefined

      const result = await this.listItensRecompensa.execute(schema, { limit, offset, search })
      return res.json({ total: result.count, itens: result.rows })
    } catch (error) {
      return next(error)
    }
  }

  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      const item = await this.getItemRecompensa.execute(schema, id)
      return res.json(item)
    } catch (error) {
      return next(error)
    }
  }

  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const parseResult = createItemRecompensaSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuCadastro = req.user?.userId ? parseInt(req.user.userId, 10) : data.usu_cadastro

      if (!usuCadastro || usuCadastro <= 0) {
        throw new AppError('usu_cadastro obrigatório e deve ser > 0', 400)
      }

      const item = await this.createItemRecompensa.execute(schema, {
        ...data,
        usu_cadastro: usuCadastro,
      })

      return res.status(201).json(item)
    } catch (error) {
      return next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      const parseResult = updateItemRecompensaSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuAltera = req.user?.userId ? parseInt(req.user.userId, 10) : data.usu_altera

      const item = await this.updateItemRecompensa.execute(schema, id, {
        ...data,
        usu_altera: usuAltera ?? null,
      })

      return res.json(item)
    } catch (error) {
      return next(error)
    }
  }

  destroy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      await this.deleteItemRecompensa.execute(schema, id)
      return res.status(204).send()
    } catch (error) {
      return next(error)
    }
  }
}

export const itemRecompensaController = new ItemRecompensaController()

