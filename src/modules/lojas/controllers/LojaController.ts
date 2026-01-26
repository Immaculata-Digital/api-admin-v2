import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { lojaRepository } from '../repositories'
import { ListLojasUseCase } from '../useCases/listLojas/ListLojasUseCase'
import { GetLojaUseCase } from '../useCases/getLoja/GetLojaUseCase'
import { CreateLojaUseCase } from '../useCases/createLoja/CreateLojaUseCase'
import { UpdateLojaUseCase } from '../useCases/updateLoja/UpdateLojaUseCase'
import { DeleteLojaUseCase } from '../useCases/deleteLoja/DeleteLojaUseCase'
import { createLojaSchema, updateLojaSchema } from '../validators/loja.schema'
import type { UpdateLojaDTO } from '../dto/UpdateLojaDTO'
import type { CreateLojaDTO } from '../dto/CreateLojaDTO'

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

      const params: { limit: number; offset: number; search?: string } = { limit, offset }
      if (search !== undefined) params.search = search

      const result = await this.listLojas.execute(schema, params)
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
      
      // Sempre usar o ID do usuário logado
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401)
      }

      // Tentar obter o userId de diferentes formas
      let usuCadastro: number | undefined
      
      if (req.user.userId) {
        usuCadastro = typeof req.user.userId === 'string' 
          ? parseInt(req.user.userId, 10) 
          : Number(req.user.userId)
      } else if (req.user.sub) {
        usuCadastro = typeof req.user.sub === 'string'
          ? parseInt(req.user.sub, 10)
          : Number(req.user.sub)
      }

      // Validar se conseguiu obter um ID válido
      if (!usuCadastro || isNaN(usuCadastro) || usuCadastro <= 0) {
        throw new AppError('Não foi possível obter o ID do usuário autenticado', 400)
      }

      const createData: CreateLojaDTO = {
        nome_loja: data.nome_loja,
        numero_identificador: data.numero_identificador,
        nome_responsavel: data.nome_responsavel,
        cnpj: data.cnpj,
        endereco_completo: data.endereco_completo,
        usu_cadastro: usuCadastro.toString(),
      }
      
      if (data.telefone_responsavel !== undefined) {
        createData.telefone_responsavel = data.telefone_responsavel
      }

      const loja = await this.createLoja.execute(schema, createData)

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
      let usuAltera: string | null | undefined
      
      if (req.user?.userId) {
        usuAltera = typeof req.user.userId === 'string' 
          ? req.user.userId 
          : String(req.user.userId)
      } else {
        usuAltera = data.usu_altera
      }

      const updateData: UpdateLojaDTO = {
        usu_altera: usuAltera ?? null,
      }
      if (data.nome_loja !== undefined) updateData.nome_loja = data.nome_loja
      if (data.numero_identificador !== undefined) updateData.numero_identificador = data.numero_identificador
      if (data.nome_responsavel !== undefined) updateData.nome_responsavel = data.nome_responsavel
      if (data.telefone_responsavel !== undefined) updateData.telefone_responsavel = data.telefone_responsavel
      if (data.cnpj !== undefined) updateData.cnpj = data.cnpj
      if (data.endereco_completo !== undefined) updateData.endereco_completo = data.endereco_completo

      const loja = await this.updateLoja.execute(schema, id, updateData)

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

  getResponsaveis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      // TODO: Implementar lógica para buscar responsáveis da loja
      // Por enquanto retorna array vazio
      return res.json({ userIds: [] })
    } catch (error) {
      return next(error)
    }
  }

  updateResponsaveis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      const { userIds } = req.body
      // TODO: Implementar lógica para atualizar responsáveis da loja
      // Por enquanto retorna sucesso
      return res.json({ message: 'Responsáveis atualizados com sucesso' })
    } catch (error) {
      return next(error)
    }
  }
}

export const lojaController = new LojaController()

