import { pool } from '../../../infra/database/pool'
import type { ComboProps } from '../entities/Combo'
import type { IComboRepository } from './IComboRepository'

type ComboRow = {
  id_combo: number
  descricao: string
  chave: string
  script: string
  dt_cadastro: Date
  usu_cadastro: number
  dt_altera: Date | null
  usu_altera: number | null
}

const mapRowToProps = (row: ComboRow): ComboProps => ({
  id_combo: row.id_combo,
  descricao: row.descricao,
  chave: row.chave,
  script: row.script,
  dt_cadastro: row.dt_cadastro,
  usu_cadastro: row.usu_cadastro,
  dt_altera: row.dt_altera,
  usu_altera: row.usu_altera,
})

export class PostgresComboRepository implements IComboRepository {
  async findAll(filters: { limit: number; offset: number; search?: string }): Promise<{ rows: ComboProps[]; count: number }> {
    const client = await pool.connect()
    try {
      let countQuery = 'SELECT COUNT(*) as count FROM combos'
      let query = 'SELECT * FROM combos'
      const params: unknown[] = []

      if (filters.search) {
        const searchCondition = 'WHERE descricao ILIKE $1 OR chave ILIKE $1'
        countQuery += ` ${searchCondition}`
        query += ` ${searchCondition}`
        params.push(`%${filters.search}%`)
      }

      query += ` ORDER BY id_combo DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(filters.limit, filters.offset)

      const countResult = await client.query<{ count: string }>(countQuery, params.slice(0, filters.search ? 1 : 0))
      const count = parseInt(countResult.rows[0]?.count || '0', 10)

      const result = await client.query<ComboRow>(query, params)

      return {
        rows: result.rows.map(mapRowToProps),
        count,
      }
    } finally {
      client.release()
    }
  }

  async findById(id: number): Promise<ComboProps | null> {
    const client = await pool.connect()
    try {
      const result = await client.query<ComboRow>(
        'SELECT * FROM combos WHERE id_combo = $1',
        [id]
      )
      return result.rows[0] ? mapRowToProps(result.rows[0]) : null
    } finally {
      client.release()
    }
  }

  async create(data: Omit<ComboProps, 'id_combo' | 'dt_cadastro' | 'dt_altera'>): Promise<ComboProps> {
    const client = await pool.connect()
    try {
      const result = await client.query<ComboRow>(
        `INSERT INTO combos (descricao, chave, script, usu_cadastro, dt_cadastro)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [data.descricao, data.chave, data.script, data.usu_cadastro]
      )
      return mapRowToProps(result.rows[0]!)
    } finally {
      client.release()
    }
  }

  async update(id: number, data: Partial<ComboProps>): Promise<ComboProps | null> {
    const client = await pool.connect()
    try {
      const updates: string[] = []
      const values: unknown[] = []
      let paramIndex = 1

      if (typeof data.descricao !== 'undefined') {
        updates.push(`descricao = $${paramIndex++}`)
        values.push(data.descricao)
      }
      if (typeof data.chave !== 'undefined') {
        updates.push(`chave = $${paramIndex++}`)
        values.push(data.chave)
      }
      if (typeof data.script !== 'undefined') {
        updates.push(`script = $${paramIndex++}`)
        values.push(data.script)
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

      const result = await client.query<ComboRow>(
        `UPDATE combos 
         SET ${updates.join(', ')}
         WHERE id_combo = $${paramIndex}
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
      const result = await client.query('DELETE FROM combos WHERE id_combo = $1', [id])
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  }

  async findByChave(chave: string): Promise<ComboProps | null> {
    const client = await pool.connect()
    try {
      const result = await client.query<ComboRow>(
        'SELECT * FROM combos WHERE chave = $1',
        [chave]
      )
      return result.rows[0] ? mapRowToProps(result.rows[0]) : null
    } finally {
      client.release()
    }
  }

  async executeScript(script: string): Promise<any[]> {
    const client = await pool.connect()
    try {
      const result = await client.query(script)
      return result.rows
    } finally {
      client.release()
    }
  }
}

