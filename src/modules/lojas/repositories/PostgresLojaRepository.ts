import { pool } from '../../../infra/database/pool'
import type { LojaProps } from '../entities/Loja'
import type { ILojaRepository } from './ILojaRepository'

type LojaRow = {
  id_loja: number
  nome_loja: string
  numero_identificador: string
  nome_responsavel: string
  telefone_responsavel: string
  cnpj: string
  endereco_completo: string
  dt_cadastro: Date
  usu_cadastro: string | null
  dt_altera: Date | null
  usu_altera: string | null
}

const mapRowToProps = (row: LojaRow): LojaProps => ({
  id_loja: row.id_loja,
  nome_loja: row.nome_loja,
  numero_identificador: row.numero_identificador,
  nome_responsavel: row.nome_responsavel,
  telefone_responsavel: row.telefone_responsavel,
  cnpj: row.cnpj,
  endereco_completo: row.endereco_completo,
  dt_cadastro: row.dt_cadastro,
  usu_cadastro: row.usu_cadastro,
  dt_altera: row.dt_altera,
  usu_altera: row.usu_altera,
})

export class PostgresLojaRepository implements ILojaRepository {
  async findAll(schema: string, filters: { limit: number; offset: number; search?: string }): Promise<{ rows: LojaProps[]; count: number }> {
    const client = await pool.connect()
    try {
      let countQuery = `SELECT COUNT(*) as count FROM "${schema}".lojas`
      let query = `SELECT * FROM "${schema}".lojas`
      const params: unknown[] = []

      if (filters.search) {
        const searchCondition = `WHERE nome_loja ILIKE $1 OR numero_identificador ILIKE $1 OR nome_responsavel ILIKE $1 OR cnpj ILIKE $1`
        countQuery += ` ${searchCondition}`
        query += ` ${searchCondition}`
        params.push(`%${filters.search}%`)
      }

      query += ` ORDER BY id_loja DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(filters.limit, filters.offset)

      const countResult = await client.query<{ count: string }>(countQuery, params.slice(0, filters.search ? 1 : 0))
      const count = parseInt(countResult.rows[0]?.count || '0', 10)

      const result = await client.query<LojaRow>(query, params)

      return {
        rows: result.rows.map(mapRowToProps),
        count,
      }
    } finally {
      client.release()
    }
  }

  async findById(schema: string, id: number): Promise<LojaProps | null> {
    const client = await pool.connect()
    try {
      const result = await client.query<LojaRow>(
        `SELECT * FROM "${schema}".lojas WHERE id_loja = $1`,
        [id]
      )
      return result.rows[0] ? mapRowToProps(result.rows[0]) : null
    } finally {
      client.release()
    }
  }

  async create(schema: string, data: Omit<LojaProps, 'id_loja' | 'dt_cadastro' | 'dt_altera'>): Promise<LojaProps> {
    const client = await pool.connect()
    try {
      const result = await client.query<LojaRow>(
        `INSERT INTO "${schema}".lojas 
         (nome_loja, numero_identificador, nome_responsavel, telefone_responsavel, cnpj, endereco_completo, usu_cadastro, dt_cadastro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [
          data.nome_loja,
          data.numero_identificador,
          data.nome_responsavel,
          data.telefone_responsavel,
          data.cnpj,
          data.endereco_completo,
          data.usu_cadastro,
        ]
      )
      return mapRowToProps(result.rows[0]!)
    } finally {
      client.release()
    }
  }

  async update(schema: string, id: number, data: Partial<LojaProps>): Promise<LojaProps | null> {
    const client = await pool.connect()
    try {
      const updates: string[] = []
      const values: unknown[] = []
      let paramIndex = 1

      if (typeof data.nome_loja !== 'undefined') {
        updates.push(`nome_loja = $${paramIndex++}`)
        values.push(data.nome_loja)
      }
      if (typeof data.numero_identificador !== 'undefined') {
        updates.push(`numero_identificador = $${paramIndex++}`)
        values.push(data.numero_identificador)
      }
      if (typeof data.nome_responsavel !== 'undefined') {
        updates.push(`nome_responsavel = $${paramIndex++}`)
        values.push(data.nome_responsavel)
      }
      if (typeof data.telefone_responsavel !== 'undefined') {
        updates.push(`telefone_responsavel = $${paramIndex++}`)
        values.push(data.telefone_responsavel)
      }
      if (typeof data.cnpj !== 'undefined') {
        updates.push(`cnpj = $${paramIndex++}`)
        values.push(data.cnpj)
      }
      if (typeof data.endereco_completo !== 'undefined') {
        updates.push(`endereco_completo = $${paramIndex++}`)
        values.push(data.endereco_completo)
      }
      if (typeof data.usu_altera !== 'undefined') {
        updates.push(`usu_altera = $${paramIndex++}`)
        values.push(data.usu_altera ?? null)
      }

      if (updates.length === 0) {
        return await this.findById(schema, id)
      }

      updates.push(`dt_altera = NOW()`)
      values.push(id)

      const result = await client.query<LojaRow>(
        `UPDATE "${schema}".lojas 
         SET ${updates.join(', ')}
         WHERE id_loja = $${paramIndex}
         RETURNING *`,
        values
      )

      return result.rows[0] ? mapRowToProps(result.rows[0]) : null
    } finally {
      client.release()
    }
  }

  async delete(schema: string, id: number): Promise<boolean> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        `DELETE FROM "${schema}".lojas WHERE id_loja = $1`,
        [id]
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  }

  async findByUniqueFields(schema: string, fields: { numero_identificador?: string; cnpj?: string }, excludeId?: number): Promise<LojaProps | null> {
    const client = await pool.connect()
    try {
      const conditions: string[] = []
      const params: unknown[] = []
      let paramIndex = 1

      if (fields.numero_identificador) {
        conditions.push(`numero_identificador = $${paramIndex++}`)
        params.push(fields.numero_identificador)
      }
      if (fields.cnpj) {
        conditions.push(`cnpj = $${paramIndex++}`)
        params.push(fields.cnpj)
      }

      if (conditions.length === 0) {
        return null
      }

      let query = `SELECT * FROM "${schema}".lojas WHERE (${conditions.join(' OR ')})`
      if (excludeId) {
        query += ` AND id_loja != $${paramIndex++}`
        params.push(excludeId)
      }
      query += ` LIMIT 1`

      const result = await client.query<LojaRow>(query, params)
      return result.rows[0] ? mapRowToProps(result.rows[0]) : null
    } finally {
      client.release()
    }
  }
}

