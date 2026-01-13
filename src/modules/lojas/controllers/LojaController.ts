import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../../../core/errors/AppError'
import { getUserIdFromRequest } from '../../../core/utils/getUserIdFromRequest'
import { pool } from '../../../infra/database/pool'
import { lojaRepository } from '../repositories'
import { ListLojasUseCase } from '../useCases/listLojas/ListLojasUseCase'
import { GetLojaUseCase } from '../useCases/getLoja/GetLojaUseCase'
import { CreateLojaUseCase } from '../useCases/createLoja/CreateLojaUseCase'
import { UpdateLojaUseCase } from '../useCases/updateLoja/UpdateLojaUseCase'
import { DeleteLojaUseCase } from '../useCases/deleteLoja/DeleteLojaUseCase'
import { createLojaSchema, updateLojaSchema } from '../validators/loja.schema'
import type { UpdateLojaDTO } from '../dto/UpdateLojaDTO'
import { z } from 'zod'

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
      const usuCadastro = getUserIdFromRequest(req)

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
      const usuAltera = req.user?.userId ? parseInt(req.user.userId, 10) : null

      const updateData: UpdateLojaDTO = {
        usu_altera: usuAltera,
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
      
      const client = await pool.connect()
      try {
        const result = await client.query<{ user_id: string }>(
          `SELECT user_id FROM "${schema}".user_lojas_gestoras WHERE id_loja = $1`,
          [id]
        )
        
        const userIds = result.rows.map(row => row.user_id)
        return res.json({ userIds })
      } finally {
        client.release()
      }
    } catch (error) {
      return next(error)
    }
  }

  updateResponsaveis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = req.schema!
      const id = Number(req.params.id)
      
      const schemaValidation = z.object({
        userIds: z.array(z.string().uuid()).optional().default([]),
      })
      
      const parseResult = schemaValidation.safeParse(req.body)
      if (!parseResult.success) {
        throw new AppError('Falha de validação', 422, parseResult.error.flatten())
      }

      const { userIds } = parseResult.data
      const client = await pool.connect()
      
      try {
        await client.query('BEGIN')
        
        // Buscar usuários atualmente vinculados a esta loja
        const currentResult = await client.query<{ user_id: string }>(
          `SELECT user_id FROM "${schema}".user_lojas_gestoras WHERE id_loja = $1`,
          [id]
        )
        const currentUserIds = new Set(currentResult.rows.map(row => row.user_id))
        const newUserIds = new Set(userIds)
        
        // Remover vínculos de usuários que não estão mais na lista
        const toRemove = Array.from(currentUserIds).filter(userId => !newUserIds.has(userId))
        if (toRemove.length > 0) {
          await client.query(
            `DELETE FROM "${schema}".user_lojas_gestoras WHERE id_loja = $1 AND user_id = ANY($2::uuid[])`,
            [id, toRemove]
          )
        }
        
        // Adicionar vínculos de novos usuários
        const toAdd = Array.from(newUserIds).filter(userId => !currentUserIds.has(userId))
        if (toAdd.length > 0) {
          const values: string[] = []
          const params: unknown[] = [id]
          toAdd.forEach((userId, index) => {
            values.push(`($1, $${index + 2})`)
            params.push(userId)
          })
          
          await client.query(
            `INSERT INTO "${schema}".user_lojas_gestoras (id_loja, user_id) VALUES ${values.join(', ')}`,
            params
          )
        }
        
        await client.query('COMMIT')
        return res.json({ message: 'Responsáveis atualizados com sucesso' })
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    } catch (error) {
      return next(error)
    }
  }
}

export const lojaController = new LojaController()

