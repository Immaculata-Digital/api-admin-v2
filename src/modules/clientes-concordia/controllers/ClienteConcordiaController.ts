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

      const result = await this.listClientesConcordia.execute({ limit, offset, search, schema, ativo })
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

      const cliente = await this.createClienteConcordia.execute({
        ...data,
        usu_cadastro: usuCadastro,
      })

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

      const cliente = await this.updateClienteConcordia.execute(id, {
        ...data,
        usu_altera: usuAltera ?? null,
      })

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

