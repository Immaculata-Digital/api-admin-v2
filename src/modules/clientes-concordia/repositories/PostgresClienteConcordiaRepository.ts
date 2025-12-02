import { pool } from '../../../infra/database/pool'
import type { ClienteConcordiaProps } from '../entities/ClienteConcordia'
import type { IClienteConcordiaRepository } from './IClienteConcordiaRepository'

type ClienteConcordiaRow = {
  id_cliente_concordia: number
  nome: string
  email: string
  whatsapp: string
  schema: string
  ativo: boolean
  dt_cadastro: Date
  usu_cadastro: number
  dt_altera: Date | null
  usu_altera: number | null
}

const mapRowToProps = (row: ClienteConcordiaRow): ClienteConcordiaProps => ({
  id_cliente_concordia: row.id_cliente_concordia,
  nome: row.nome,
  email: row.email,
  whatsapp: row.whatsapp,
  schema: row.schema,
  ativo: row.ativo,
  dt_cadastro: row.dt_cadastro,
  usu_cadastro: row.usu_cadastro,
  dt_altera: row.dt_altera,
  usu_altera: row.usu_altera,
})

export class PostgresClienteConcordiaRepository implements IClienteConcordiaRepository {
  async findAll(filters: { limit: number; offset: number; search?: string; schema?: string; ativo?: boolean }): Promise<{ rows: ClienteConcordiaProps[]; count: number }> {
    const client = await pool.connect()
    try {
      let countQuery = 'SELECT COUNT(*) as count FROM clientes_concordia'
      let query = 'SELECT * FROM clientes_concordia'
      const conditions: string[] = []
      const params: unknown[] = []
      let paramIndex = 1

      if (filters.search) {
        conditions.push(`(nome ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR whatsapp ILIKE $${paramIndex} OR schema ILIKE $${paramIndex})`)
        params.push(`%${filters.search}%`)
        paramIndex++
      }
      if (filters.schema) {
        conditions.push(`schema = $${paramIndex++}`)
        params.push(filters.schema)
      }
      if (filters.ativo !== undefined) {
        conditions.push(`ativo = $${paramIndex++}`)
        params.push(filters.ativo)
      }

      if (conditions.length > 0) {
        const whereClause = `WHERE ${conditions.join(' AND ')}`
        countQuery += ` ${whereClause}`
        query += ` ${whereClause}`
      }

      query += ` ORDER BY id_cliente_concordia DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      params.push(filters.limit, filters.offset)

      const countResult = await client.query<{ count: string }>(countQuery, params.slice(0, params.length - 2))
      const count = parseInt(countResult.rows[0]?.count || '0', 10)

      const result = await client.query<ClienteConcordiaRow>(query, params)

      return {
        rows: result.rows.map(mapRowToProps),
        count,
      }
    } finally {
      client.release()
    }
  }

  async findById(id: number): Promise<ClienteConcordiaProps | null> {
    const client = await pool.connect()
    try {
      const result = await client.query<ClienteConcordiaRow>(
        'SELECT * FROM clientes_concordia WHERE id_cliente_concordia = $1',
        [id]
      )
      return result.rows[0] ? mapRowToProps(result.rows[0]) : null
    } finally {
      client.release()
    }
  }

  async findBySchema(schema: string): Promise<ClienteConcordiaProps | null> {
    const client = await pool.connect()
    try {
      const result = await client.query<ClienteConcordiaRow>(
        'SELECT * FROM clientes_concordia WHERE schema = $1 AND ativo = true',
        [schema]
      )
      return result.rows[0] ? mapRowToProps(result.rows[0]) : null
    } finally {
      client.release()
    }
  }

  async create(data: Omit<ClienteConcordiaProps, 'id_cliente_concordia' | 'dt_cadastro' | 'dt_altera'>): Promise<ClienteConcordiaProps> {
    const client = await pool.connect()
    try {
      const result = await client.query<ClienteConcordiaRow>(
        `INSERT INTO clientes_concordia (nome, email, whatsapp, schema, ativo, usu_cadastro, dt_cadastro)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [data.nome, data.email, data.whatsapp, data.schema, data.ativo, data.usu_cadastro]
      )
      return mapRowToProps(result.rows[0]!)
    } finally {
      client.release()
    }
  }

  async update(id: number, data: Partial<ClienteConcordiaProps>): Promise<ClienteConcordiaProps | null> {
    const client = await pool.connect()
    try {
      const updates: string[] = []
      const values: unknown[] = []
      let paramIndex = 1

      if (typeof data.nome !== 'undefined') {
        updates.push(`nome = $${paramIndex++}`)
        values.push(data.nome)
      }
      if (typeof data.email !== 'undefined') {
        updates.push(`email = $${paramIndex++}`)
        values.push(data.email)
      }
      if (typeof data.whatsapp !== 'undefined') {
        updates.push(`whatsapp = $${paramIndex++}`)
        values.push(data.whatsapp)
      }
      if (typeof data.schema !== 'undefined') {
        updates.push(`schema = $${paramIndex++}`)
        values.push(data.schema)
      }
      if (typeof data.ativo !== 'undefined') {
        updates.push(`ativo = $${paramIndex++}`)
        values.push(data.ativo)
      }
      if (typeof data.usu_altera !== 'undefined') {
        updates.push(`usu_altera = $${paramIndex++}`)
        values.push(data.usu_altera ?? null)
      }

      if (updates.length === 0) {
        return await this.findById(id)
      }

      updates.push(`dt_altera = NOW()`)
      values.push(id)

      const result = await client.query<ClienteConcordiaRow>(
        `UPDATE clientes_concordia 
         SET ${updates.join(', ')}
         WHERE id_cliente_concordia = $${paramIndex}
         RETURNING *`,
        values
      )

      return result.rows[0] ? mapRowToProps(result.rows[0]) : null
    } finally {
      client.release()
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM clientes_concordia WHERE id_cliente_concordia = $1',
        [id]
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  }
}

