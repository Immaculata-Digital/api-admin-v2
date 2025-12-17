import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { clienteConcordiaRepository } from '../repositories'
import { ListClientesConcordiaUseCase } from '../useCases/listClientesConcordia/ListClientesConcordiaUseCase'
import { GetClienteConcordiaUseCase } from '../useCases/getClienteConcordia/GetClienteConcordiaUseCase'
import { GetClienteConcordiaBySchemaUseCase } from '../useCases/getClienteConcordiaBySchema/GetClienteConcordiaBySchemaUseCase'
import { CreateClienteConcordiaUseCase } from '../useCases/createClienteConcordia/CreateClienteConcordiaUseCase'
import { UpdateClienteConcordiaUseCase } from '../useCases/updateClienteConcordia/UpdateClienteConcordiaUseCase'
import { DeleteClienteConcordiaUseCase } from '../useCases/deleteClienteConcordia/DeleteClienteConcordiaUseCase'
import { createClienteConcordiaSchema, updateClienteConcordiaSchema } from '../validators/clienteConcordia.schema'
import type { CreateClienteConcordiaDTO } from '../dto/CreateClienteConcordiaDTO'
import type { UpdateClienteConcordiaDTO } from '../dto/UpdateClienteConcordiaDTO'

export class ClienteConcordiaController {
  private readonly listClientesConcordia: ListClientesConcordiaUseCase
  private readonly getClienteConcordia: GetClienteConcordiaUseCase
  private readonly getClienteConcordiaBySchema: GetClienteConcordiaBySchemaUseCase
  private readonly createClienteConcordia: CreateClienteConcordiaUseCase
  private readonly updateClienteConcordia: UpdateClienteConcordiaUseCase
  private readonly deleteClienteConcordia: DeleteClienteConcordiaUseCase

  constructor() {
    this.listClientesConcordia = new ListClientesConcordiaUseCase(clienteConcordiaRepository)
    this.getClienteConcordia = new GetClienteConcordiaUseCase(clienteConcordiaRepository)
    this.getClienteConcordiaBySchema = new GetClienteConcordiaBySchemaUseCase(clienteConcordiaRepository)
    this.createClienteConcordia = new CreateClienteConcordiaUseCase(clienteConcordiaRepository)
    this.updateClienteConcordia = new UpdateClienteConcordiaUseCase(clienteConcordiaRepository)
    this.deleteClienteConcordia = new DeleteClienteConcordiaUseCase(clienteConcordiaRepository)
  }

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Math.min(Number(req.query.limit || 50), 200)
      const offset = Number(req.query.offset || 0)
      const search = typeof req.query.search === 'string' ? req.query.search : undefined
      const schema = typeof req.query.schema === 'string' ? req.query.schema : undefined
      const ativo = req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined

      const params: { limit: number; offset: number; search?: string; schema?: string; ativo?: boolean } = { limit, offset }
      if (search !== undefined) params.search = search
      if (schema !== undefined) params.schema = schema
      if (ativo !== undefined) params.ativo = ativo

      const result = await this.listClientesConcordia.execute(params)
      return res.json({ total: result.count, itens: result.rows })
    } catch (error) {
      return next(error)
    }
  }

  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id)
      const cliente = await this.getClienteConcordia.execute(id)
      return res.json(cliente)
    } catch (error) {
      return next(error)
    }
  }

  getBySchema = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.params.schema
      if (!schema) {
        throw new AppError('Schema é obrigatório', 400)
      }
      const cliente = await this.getClienteConcordiaBySchema.execute(schema)
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado para este schema' })
      }
      return res.json(cliente)
    } catch (error) {
      return next(error)
    }
  }

  store = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = createClienteConcordiaSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuCadastro = req.user?.userId ? parseInt(req.user.userId, 10) : data.usu_cadastro

      if (!usuCadastro || usuCadastro <= 0) {
        throw new AppError('usu_cadastro obrigatório e deve ser > 0', 400)
      }

      const createData: CreateClienteConcordiaDTO & { usu_cadastro: number } = {
        nome: data.nome,
        email: data.email,
        whatsapp: data.whatsapp,
        schema: data.schema,
        usu_cadastro: usuCadastro,
      }
      if (data.ativo !== undefined) {
        createData.ativo = data.ativo
      }

      const cliente = await this.createClienteConcordia.execute(createData)

      return res.status(201).json(cliente)
    } catch (error) {
      return next(error)
    }
  }

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id)
      const parseResult = updateClienteConcordiaSchema.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const data = parseResult.data
      const usuAltera = req.user?.userId ? parseInt(req.user.userId, 10) : data.usu_altera

      const updateData: { nome?: string; email?: string; whatsapp?: string; schema?: string; ativo?: boolean; usu_altera: number | null } = {
        usu_altera: usuAltera ?? null,
      }
      if (data.nome !== undefined) updateData.nome = data.nome
      if (data.email !== undefined) updateData.email = data.email
      if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp
      if (data.schema !== undefined) updateData.schema = data.schema
      if (data.ativo !== undefined) updateData.ativo = data.ativo

      const cliente = await this.updateClienteConcordia.execute(id, updateData)

      return res.json(cliente)
    } catch (error) {
      return next(error)
    }
  }

  destroy = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id)
      await this.deleteClienteConcordia.execute(id)
      return res.status(204).send()
    } catch (error) {
      return next(error)
    }
  }
}

export const clienteConcordiaController = new ClienteConcordiaController()

