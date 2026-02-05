import type { PoolClient } from 'pg'
import { pool } from '../../../infra/database/pool'
import type { ConfiguracaoGlobalProps } from '../entities/ConfiguracaoGlobal'
import type { IConfiguracaoGlobalRepository } from './IConfiguracaoGlobalRepository'

type ConfiguracaoGlobalRow = {
  id_config_global: number
  logo_base64: string | null
  cor_fundo: string | null
  cor_card: string | null
  cor_texto_card: string | null
  cor_valor_card: string | null
  cor_botao: string | null
  cor_texto_botao: string | null
  fonte_titulos: string | null
  fonte_textos: string | null
  arquivo_politica_privacidade: string | null
  arquivo_termos_uso: string | null
  dt_cadastro: Date
  usu_cadastro: string | null
  dt_altera: Date | null
  usu_altera: string | null
}

const mapRowToProps = (row: ConfiguracaoGlobalRow): ConfiguracaoGlobalProps => ({
  id_config_global: row.id_config_global,
  logo_base64: row.logo_base64,
  cor_fundo: row.cor_fundo,
  cor_card: row.cor_card,
  cor_texto_card: row.cor_texto_card,
  cor_valor_card: row.cor_valor_card,
  cor_botao: row.cor_botao,
  cor_texto_botao: row.cor_texto_botao,
  fonte_titulos: row.fonte_titulos,
  fonte_textos: row.fonte_textos,
  arquivo_politica_privacidade: row.arquivo_politica_privacidade,
  arquivo_termos_uso: row.arquivo_termos_uso,
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
         (logo_base64, cor_fundo, cor_card, cor_texto_card, cor_valor_card, cor_botao, cor_texto_botao, fonte_titulos, fonte_textos, arquivo_politica_privacidade, arquivo_termos_uso, usu_cadastro, dt_cadastro)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         RETURNING *`,
        [
          data.logo_base64 ?? null,
          data.cor_fundo ?? null,
          data.cor_card ?? null,
          data.cor_texto_card ?? null,
          data.cor_valor_card ?? null,
          data.cor_botao ?? null,
          data.cor_texto_botao ?? null,
          data.fonte_titulos ?? null,
          data.fonte_textos ?? null,
          data.arquivo_politica_privacidade ?? null,
          data.arquivo_termos_uso ?? null,
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
      if (typeof data.cor_fundo !== 'undefined') {
        updates.push(`cor_fundo = $${paramIndex++}`)
        values.push(data.cor_fundo ?? null)
      }
      if (typeof data.cor_card !== 'undefined') {
        updates.push(`cor_card = $${paramIndex++}`)
        values.push(data.cor_card ?? null)
      }
      if (typeof data.cor_texto_card !== 'undefined') {
        updates.push(`cor_texto_card = $${paramIndex++}`)
        values.push(data.cor_texto_card ?? null)
      }
      if (typeof data.cor_valor_card !== 'undefined') {
        updates.push(`cor_valor_card = $${paramIndex++}`)
        values.push(data.cor_valor_card ?? null)
      }
      if (typeof data.cor_botao !== 'undefined') {
        updates.push(`cor_botao = $${paramIndex++}`)
        values.push(data.cor_botao ?? null)
      }
      if (typeof data.cor_texto_botao !== 'undefined') {
        updates.push(`cor_texto_botao = $${paramIndex++}`)
        values.push(data.cor_texto_botao ?? null)
      }
      if (typeof data.fonte_titulos !== 'undefined') {
        updates.push(`fonte_titulos = $${paramIndex++}`)
        values.push(data.fonte_titulos ?? null)
      }
      if (typeof data.fonte_textos !== 'undefined') {
        updates.push(`fonte_textos = $${paramIndex++}`)
        values.push(data.fonte_textos ?? null)
      }
      if (typeof data.arquivo_politica_privacidade !== 'undefined') {
        updates.push(`arquivo_politica_privacidade = $${paramIndex++}`)
        values.push(data.arquivo_politica_privacidade ?? null)
      }
      if (typeof data.arquivo_termos_uso !== 'undefined') {
        updates.push(`arquivo_termos_uso = $${paramIndex++}`)
        values.push(data.arquivo_termos_uso ?? null)
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

