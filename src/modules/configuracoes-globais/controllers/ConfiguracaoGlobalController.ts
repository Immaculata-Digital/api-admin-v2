import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { getUserIdFromRequest } from '../../../core/utils/getUserIdFromRequest'
import { configuracaoGlobalRepository } from '../repositories'
import { ListConfiguracoesGlobaisUseCase } from '../useCases/listConfiguracoesGlobais/ListConfiguracoesGlobaisUseCase'
import { GetConfiguracaoGlobalUseCase } from '../useCases/getConfiguracaoGlobal/GetConfiguracaoGlobalUseCase'
import { CreateConfiguracaoGlobalUseCase } from '../useCases/createConfiguracaoGlobal/CreateConfiguracaoGlobalUseCase'
import { UpdateConfiguracaoGlobalUseCase } from '../useCases/updateConfiguracaoGlobal/UpdateConfiguracaoGlobalUseCase'
import { DeleteConfiguracaoGlobalUseCase } from '../useCases/deleteConfiguracaoGlobal/DeleteConfiguracaoGlobalUseCase'
import { createConfiguracaoGlobalSchema, updateConfiguracaoGlobalSchema } from '../validators/configuracaoGlobal.schema'
import type { CreateConfiguracaoGlobalDTO } from '../dto/CreateConfiguracaoGlobalDTO'
import type { UpdateConfiguracaoGlobalDTO } from '../dto/UpdateConfiguracaoGlobalDTO'

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
      const usuCadastro = getUserIdFromRequest(req)

      const createData: CreateConfiguracaoGlobalDTO & { usu_cadastro: number } = {
        usu_cadastro: usuCadastro,
      }
      if (data.logo_base64 !== undefined) createData.logo_base64 = data.logo_base64
      if (data.cor_fundo !== undefined) createData.cor_fundo = data.cor_fundo
      if (data.cor_card !== undefined) createData.cor_card = data.cor_card
      if (data.cor_texto_card !== undefined) createData.cor_texto_card = data.cor_texto_card
      if (data.cor_valor_card !== undefined) createData.cor_valor_card = data.cor_valor_card
      if (data.cor_botao !== undefined) createData.cor_botao = data.cor_botao
      if (data.cor_texto_botao !== undefined) createData.cor_texto_botao = data.cor_texto_botao
      if (data.fonte_titulos !== undefined) createData.fonte_titulos = data.fonte_titulos
      if (data.fonte_textos !== undefined) createData.fonte_textos = data.fonte_textos

      const config = await this.createConfiguracaoGlobal.execute(schema, createData)

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

      const updateData: UpdateConfiguracaoGlobalDTO = {
        usu_altera: usuAltera ?? null,
      }
      if (data.logo_base64 !== undefined) updateData.logo_base64 = data.logo_base64
      if (data.cor_fundo !== undefined) updateData.cor_fundo = data.cor_fundo
      if (data.cor_card !== undefined) updateData.cor_card = data.cor_card
      if (data.cor_texto_card !== undefined) updateData.cor_texto_card = data.cor_texto_card
      if (data.cor_valor_card !== undefined) updateData.cor_valor_card = data.cor_valor_card
      if (data.cor_botao !== undefined) updateData.cor_botao = data.cor_botao
      if (data.cor_texto_botao !== undefined) updateData.cor_texto_botao = data.cor_texto_botao
      if (data.fonte_titulos !== undefined) updateData.fonte_titulos = data.fonte_titulos
      if (data.fonte_textos !== undefined) updateData.fonte_textos = data.fonte_textos

      const config = await this.updateConfiguracaoGlobal.execute(schema, id, updateData)

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

