import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { comboRepository } from '../repositories'
import { ListCombosUseCase } from '../useCases/listCombos/ListCombosUseCase'
import { GetComboUseCase } from '../useCases/getCombo/GetComboUseCase'
import { CreateComboUseCase } from '../useCases/createCombo/CreateComboUseCase'
import { UpdateComboUseCase } from '../useCases/updateCombo/UpdateComboUseCase'
import { DeleteComboUseCase } from '../useCases/deleteCombo/DeleteComboUseCase'
import { GetComboValuesUseCase } from '../useCases/getComboValues/GetComboValuesUseCase'
import { createComboSchema, updateComboSchema } from '../validators/combo.schema'
import type { UpdateComboDTO } from '../dto/UpdateComboDTO'

export class ComboController {
  private readonly listCombos: ListCombosUseCase
  private readonly getCombo: GetComboUseCase
  private readonly createCombo: CreateComboUseCase
  private readonly updateCombo: UpdateComboUseCase
  private readonly deleteCombo: DeleteComboUseCase
  private readonly getComboValues: GetComboValuesUseCase

  constructor() {
    this.listCombos = new ListCombosUseCase(comboRepository)
    this.getCombo = new GetComboUseCase(comboRepository)
    this.createCombo = new CreateComboUseCase(comboRepository)
    this.updateCombo = new UpdateComboUseCase(comboRepository)
    this.deleteCombo = new DeleteComboUseCase(comboRepository)
    this.getComboValues = new GetComboValuesUseCase(comboRepository)
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Math.min(Number(req.query.limit || 50), 200)
      const offset = Number(req.query.offset || 0)
      const search = typeof req.query.search === 'string' ? req.query.search : undefined

      const params: { limit: number; offset: number; search?: string } = { limit, offset }
      if (search !== undefined) params.search = search

      const result = await this.listCombos.execute(params)
      return res.json({ total: result.count, itens: result.rows })
    } catch (error) {
      return next(error)
    }
  }

  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id)
      const combo = await this.getCombo.execute(id)
      return res.json(combo)
    } catch (error) {
      return next(error)
    }
  }

  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = createComboSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuCadastro = req.user?.userId ? parseInt(req.user.userId, 10) : data.usu_cadastro

      if (!usuCadastro || usuCadastro <= 0) {
        throw new AppError('usu_cadastro obrigatório e deve ser > 0', 400)
      }

      const combo = await this.createCombo.execute({
        ...data,
        usu_cadastro: usuCadastro,
      })

      return res.status(201).json(combo)
    } catch (error) {
      return next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id)
      const parseResult = updateComboSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuAltera = req.user?.userId ? parseInt(req.user.userId, 10) : data.usu_altera

      const updateData: UpdateComboDTO = {
        usu_altera: usuAltera ?? null,
      }
      if (data.descricao !== undefined) updateData.descricao = data.descricao
      if (data.chave !== undefined) updateData.chave = data.chave
      if (data.script !== undefined) updateData.script = data.script

      const combo = await this.updateCombo.execute(id, updateData)

      return res.json(combo)
    } catch (error) {
      return next(error)
    }
  }

  destroy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id)
      await this.deleteCombo.execute(id)
      return res.status(204).send()
    } catch (error) {
      return next(error)
    }
  }

  getValues = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chave = req.params.chave
      if (!chave) {
        throw new AppError('Chave é obrigatória', 400)
      }
      const values = await this.getComboValues.execute(chave)
      return res.json(values)
    } catch (error) {
      return next(error)
    }
  }
}

export const comboController = new ComboController()

