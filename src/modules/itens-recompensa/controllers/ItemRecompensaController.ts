import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { getUserIdFromRequest } from '../../../core/utils/getUserIdFromRequest'
import { itemRecompensaRepository } from '../repositories'
import { ListItensRecompensaUseCase } from '../useCases/listItensRecompensa/ListItensRecompensaUseCase'
import { GetItemRecompensaUseCase } from '../useCases/getItemRecompensa/GetItemRecompensaUseCase'
import { CreateItemRecompensaUseCase } from '../useCases/createItemRecompensa/CreateItemRecompensaUseCase'
import { UpdateItemRecompensaUseCase } from '../useCases/updateItemRecompensa/UpdateItemRecompensaUseCase'
import { DeleteItemRecompensaUseCase } from '../useCases/deleteItemRecompensa/DeleteItemRecompensaUseCase'
import { createItemRecompensaSchema, updateItemRecompensaSchema } from '../validators/itemRecompensa.schema'
import type { CreateItemRecompensaDTO } from '../dto/CreateItemRecompensaDTO'
import type { UpdateItemRecompensaDTO } from '../dto/UpdateItemRecompensaDTO'

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

      const params: { limit: number; offset: number; search?: string } = { limit, offset }
      if (search !== undefined) params.search = search

      const result = await this.listItensRecompensa.execute(schema, params)
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
      const usuCadastro = getUserIdFromRequest(req)

      const createData: CreateItemRecompensaDTO & { usu_cadastro: string | null } = {
        nome_item: data.nome_item,
        descricao: data.descricao,
        quantidade_pontos: data.quantidade_pontos,
        usu_cadastro: usuCadastro ?? null,
      }
      if (data.imagem_item !== undefined) {
        createData.imagem_item = data.imagem_item
      }
      if (data.nao_retirar_loja !== undefined) {
        createData.nao_retirar_loja = data.nao_retirar_loja
      }

      const item = await this.createItemRecompensa.execute(schema, createData)

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
      const usuAltera = getUserIdFromRequest(req) ?? data.usu_altera

      const updateData: UpdateItemRecompensaDTO = {
        usu_altera: usuAltera ?? null,
      }
      if (data.nome_item !== undefined) updateData.nome_item = data.nome_item
      if (data.descricao !== undefined) updateData.descricao = data.descricao
      if (data.quantidade_pontos !== undefined) updateData.quantidade_pontos = data.quantidade_pontos
      if (data.imagem_item !== undefined) updateData.imagem_item = data.imagem_item
      if (data.nao_retirar_loja !== undefined) updateData.nao_retirar_loja = data.nao_retirar_loja

      const item = await this.updateItemRecompensa.execute(schema, id, updateData)

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

