import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { getUserIdFromRequest } from '../../../core/utils/getUserIdFromRequest'
import { webRadioRepository } from '../repositories'
import { ListWebRadiosUseCase } from '../useCases/listWebRadios/ListWebRadiosUseCase'
import { GetWebRadioUseCase } from '../useCases/getWebRadio/GetWebRadioUseCase'
import { GetNextWebRadioUseCase } from '../useCases/getNextWebRadio/GetNextWebRadioUseCase'
import { CreateWebRadioUseCase } from '../useCases/createWebRadio/CreateWebRadioUseCase'
import { UpdateWebRadioUseCase } from '../useCases/updateWebRadio/UpdateWebRadioUseCase'
import { DeleteWebRadioUseCase } from '../useCases/deleteWebRadio/DeleteWebRadioUseCase'
import { ReorderWebRadiosUseCase } from '../useCases/reorderWebRadios/ReorderWebRadiosUseCase'
import { createWebRadioSchema, updateWebRadioSchema, reorderWebRadioSchema } from '../validators/webRadio.schema'
import type { CreateWebRadioDTO } from '../dto/CreateWebRadioDTO'
import type { UpdateWebRadioDTO } from '../dto/UpdateWebRadioDTO'

export class WebRadioController {
  private readonly listWebRadios: ListWebRadiosUseCase
  private readonly getWebRadio: GetWebRadioUseCase
  private readonly getNextWebRadio: GetNextWebRadioUseCase
  private readonly createWebRadio: CreateWebRadioUseCase
  private readonly updateWebRadio: UpdateWebRadioUseCase
  private readonly deleteWebRadio: DeleteWebRadioUseCase
  private readonly reorderWebRadios: ReorderWebRadiosUseCase

  constructor() {
    this.listWebRadios = new ListWebRadiosUseCase(webRadioRepository)
    this.getWebRadio = new GetWebRadioUseCase(webRadioRepository)
    this.getNextWebRadio = new GetNextWebRadioUseCase(webRadioRepository)
    this.createWebRadio = new CreateWebRadioUseCase(webRadioRepository)
    this.updateWebRadio = new UpdateWebRadioUseCase(webRadioRepository)
    this.deleteWebRadio = new DeleteWebRadioUseCase(webRadioRepository)
    this.reorderWebRadios = new ReorderWebRadiosUseCase(webRadioRepository)
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const limit = Math.min(Number(req.query.limit || 50), 200)
      const offset = Number(req.query.offset || 0)
      const search = typeof req.query.search === 'string' ? req.query.search : undefined

      const params: { limit: number; offset: number; search?: string } = { limit, offset }
      if (search !== undefined) params.search = search

      const result = await this.listWebRadios.execute(schema, params)
      return res.json({ total: result.count, itens: result.rows })
    } catch (error) {
      return next(error)
    }
  }

  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      const webradio = await this.getWebRadio.execute(schema, id)
      return res.json(webradio)
    } catch (error) {
      return next(error)
    }
  }

  getNext = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const currentAudioId = Number(req.params.id)
      const next = await this.getNextWebRadio.execute(schema, currentAudioId)
      if (!next) {
        return res.status(404).json({ message: 'Nenhum próximo áudio encontrado' })
      }
      return res.json(next)
    } catch (error) {
      return next(error)
    }
  }

  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const parseResult = createWebRadioSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuCadastro = getUserIdFromRequest(req)

      const createData: CreateWebRadioDTO & { usu_cadastro: string | null } = {
        nome_audio: data.nome_audio,
        usu_cadastro: usuCadastro ?? null,
      }
      if (data.arquivo_audio_base64 !== undefined) {
        createData.arquivo_audio_base64 = data.arquivo_audio_base64
      }
      if (data.duracao_segundos !== undefined) {
        createData.duracao_segundos = data.duracao_segundos
      }
      if (data.ordem !== undefined) {
        createData.ordem = data.ordem
      }

      const webradio = await this.createWebRadio.execute(schema, createData)

      return res.status(201).json(webradio)
    } catch (error) {
      return next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      const parseResult = updateWebRadioSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuAltera = getUserIdFromRequest(req) ?? data.usu_altera

      const updateData: UpdateWebRadioDTO = {
        usu_altera: usuAltera ?? null,
      }
      if (data.nome_audio !== undefined) updateData.nome_audio = data.nome_audio
      if (data.arquivo_audio_base64 !== undefined) updateData.arquivo_audio_base64 = data.arquivo_audio_base64
      if (data.duracao_segundos !== undefined) updateData.duracao_segundos = data.duracao_segundos
      if (data.ordem !== undefined) updateData.ordem = data.ordem

      const webradio = await this.updateWebRadio.execute(schema, id, updateData)

      return res.json(webradio)
    } catch (error) {
      return next(error)
    }
  }

  destroy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      await this.deleteWebRadio.execute(schema, id)
      return res.status(204).send()
    } catch (error) {
      return next(error)
    }
  }

  reorder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const parseResult = reorderWebRadioSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      await this.reorderWebRadios.execute(schema, parseResult.data.ids)
      return res.status(204).send()
    } catch (error) {
      return next(error)
    }
  }
}

export const webRadioController = new WebRadioController()

