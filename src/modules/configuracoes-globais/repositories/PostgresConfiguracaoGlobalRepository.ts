import type { PoolClient } from 'pg'
import { pool } from '../../../infra/database/pool'
import type { ConfiguracaoGlobalProps } from '../entities/ConfiguracaoGlobal'
import type { IConfiguracaoGlobalRepository } from './IConfiguracaoGlobalRepository'

type ConfiguracaoGlobalRow = {
  id_config_global: number
  logo_base64: string | null
  cor_primaria: string | null
  cor_secundaria: string | null
  cor_texto: string | null
  cor_destaque_texto: string | null
  fonte_titulos: string | null
  fonte_textos: string | null
  dt_cadastro: Date
  usu_cadastro: number
  dt_altera: Date | null
  usu_altera: number | null
}

const mapRowToProps = (row: ConfiguracaoGlobalRow): ConfiguracaoGlobalProps => ({
  id_config_global: row.id_config_global,
  logo_base64: row.logo_base64,
  cor_primaria: row.cor_primaria,
  cor_secundaria: row.cor_secundaria,
  cor_texto: row.cor_texto,
  cor_destaque_texto: row.cor_destaque_texto,
  fonte_titulos: row.fonte_titulos,
  fonte_textos: row.fonte_textos,
  dt_cadastro: row.dt_cadastro,
  usu_cadastro: row.usu_cadastro,
  dt_altera: row.dt_altera,
  usu_altera: row.usu_altera,
})

export class PostgresConfiguracaoGlobalRepository implements IConfiguracaoGlobalRepository {
  async findAll(schema: string, filters: { limit: number; offset: number }): Promise<{ rows: ConfiguracaoGlobalProps[]; count: number }> {
    const client = await pool.connect()
    try {
      const countResult = await client.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM "${schema}".configuracoes_globais`
      )
      const count = parseInt(countResult.rows[0]?.count || '0', 10)

      const result = await client.query<ConfiguracaoGlobalRow>(
        `SELECT * FROM "${schema}".configuracoes_globais ORDER BY id_config_global DESC LIMIT $1 OFFSET $2`,
        [filters.limit, filters.offset]
      )

      return {
        rows: result.rows.map(mapRowToProps),
        count,
      }
    } finally {
      client.release()
    }
  }

  async findById(schema: string, id: number): Promise<ConfiguracaoGlobalProps | null> {
    const client = await pool.connect()
    try {
      const result = await client.query<ConfiguracaoGlobalRow>(
        `SELECT * FROM "${schema}".configuracoes_globais WHERE id_config_global = $1`,
        [id]
      )
      return result.rows[0] ? mapRowToProps(result.rows[0]) : null
    } finally {
      client.release()
    }
  }

  async create(schema: string, data: Omit<ConfiguracaoGlobalProps, 'id_config_global' | 'dt_cadastro' | 'dt_altera'>): Promise<ConfiguracaoGlobalProps> {
    const client = await pool.connect()
    try {
      const result = await client.query<ConfiguracaoGlobalRow>(
        `INSERT INTO "${schema}".configuracoes_globais 
         (logo_base64, cor_primaria, cor_secundaria, cor_texto, cor_destaque_texto, fonte_titulos, fonte_textos, usu_cadastro, dt_cadastro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         RETURNING *`,
        [
          data.logo_base64 ?? null,
          data.cor_primaria ?? null,
          data.cor_secundaria ?? null,
          data.cor_texto ?? null,
          data.cor_destaque_texto ?? null,
          data.fonte_titulos ?? null,
          data.fonte_textos ?? null,
          data.usu_cadastro,
        ]
      )
      return mapRowToProps(result.rows[0]!)
    } finally {
      client.release()
    }
  }

  async update(schema: string, id: number, data: Partial<ConfiguracaoGlobalProps>): Promise<ConfiguracaoGlobalProps | null> {
    const client = await pool.connect()
    try {
      const updates: string[] = []
      const values: unknown[] = []
      let paramIndex = 1

      if (typeof data.logo_base64 !== 'undefined') {
        updates.push(`logo_base64 = $${paramIndex++}`)
        values.push(data.logo_base64 ?? null)
      }
      if (typeof data.cor_primaria !== 'undefined') {
        updates.push(`cor_primaria = $${paramIndex++}`)
        values.push(data.cor_primaria ?? null)
      }
      if (typeof data.cor_secundaria !== 'undefined') {
        updates.push(`cor_secundaria = $${paramIndex++}`)
        values.push(data.cor_secundaria ?? null)
      }
      if (typeof data.cor_texto !== 'undefined') {
        updates.push(`cor_texto = $${paramIndex++}`)
        values.push(data.cor_texto ?? null)
      }
      if (typeof data.cor_destaque_texto !== 'undefined') {
        updates.push(`cor_destaque_texto = $${paramIndex++}`)
        values.push(data.cor_destaque_texto ?? null)
      }
      if (typeof data.fonte_titulos !== 'undefined') {
        updates.push(`fonte_titulos = $${paramIndex++}`)
        values.push(data.fonte_titulos ?? null)
      }
      if (typeof data.fonte_textos !== 'undefined') {
        updates.push(`fonte_textos = $${paramIndex++}`)
        values.push(data.fonte_textos ?? null)
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

      const result = await client.query<ConfiguracaoGlobalRow>(
        `UPDATE "${schema}".configuracoes_globais 
         SET ${updates.join(', ')}
         WHERE id_config_global = $${paramIndex}
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
        `DELETE FROM "${schema}".configuracoes_globais WHERE id_config_global = $1`,
        [id]
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  }
}

