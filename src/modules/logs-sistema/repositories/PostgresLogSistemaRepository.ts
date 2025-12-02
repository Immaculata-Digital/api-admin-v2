import { pool } from '../../../infra/database/pool'
import type { LogSistemaProps } from '../entities/LogSistema'
import type { ILogSistemaRepository } from './ILogSistemaRepository'

type LogSistemaRow = {
  id_log: number
  dt_log: Date
  nivel: string
  operacao: string
  tabela: string | null
  id_registro: number | null
  usuario_id: number | null
  mensagem: string
  dados_antes: object | null
  dados_depois: object | null
  ip_origem: string | null
  user_agent: string | null
  dados_extras: object | null
}

const mapRowToProps = (row: LogSistemaRow): LogSistemaProps => ({
  id_log: row.id_log,
  dt_log: row.dt_log,
  nivel: row.nivel as 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
  operacao: row.operacao,
  tabela: row.tabela,
  id_registro: row.id_registro,
  usuario_id: row.usuario_id,
  mensagem: row.mensagem,
  dados_antes: row.dados_antes,
  dados_depois: row.dados_depois,
  ip_origem: row.ip_origem,
  user_agent: row.user_agent,
  dados_extras: row.dados_extras,
})

export class PostgresLogSistemaRepository implements ILogSistemaRepository {
  async create(schema: string, data: Omit<LogSistemaProps, 'id_log' | 'dt_log'>): Promise<LogSistemaProps> {
    const client = await pool.connect()
    try {
      const result = await client.query<LogSistemaRow>(
        `INSERT INTO "${schema}".log_sistema 
         (nivel, operacao, tabela, id_registro, usuario_id, mensagem, dados_antes, dados_depois, ip_origem, user_agent, dados_extras, dt_log)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         RETURNING *`,
        [
          data.nivel,
          data.operacao,
          data.tabela ?? null,
          data.id_registro ?? null,
          data.usuario_id ?? null,
          data.mensagem,
          data.dados_antes ? JSON.stringify(data.dados_antes) : null,
          data.dados_depois ? JSON.stringify(data.dados_depois) : null,
          data.ip_origem ?? null,
          data.user_agent ?? null,
          data.dados_extras ? JSON.stringify(data.dados_extras) : null,
        ]
      )
      return mapRowToProps(result.rows[0]!)
    } finally {
      client.release()
    }
  }

  async findAll(schema: string, filters: {
    limit: number
    offset: number
    nivel?: string
    operacao?: string
    tabela?: string
    dataInicio?: Date
    dataFim?: Date
  }): Promise<{ rows: LogSistemaProps[]; count: number }> {
    const client = await pool.connect()
    try {
      let countQuery = `SELECT COUNT(*) as count FROM "${schema}".log_sistema`
      let query = `SELECT * FROM "${schema}".log_sistema`
      const conditions: string[] = []
      const params: unknown[] = []
      let paramIndex = 1

      if (filters.nivel) {
        conditions.push(`nivel = $${paramIndex++}`)
        params.push(filters.nivel)
      }
      if (filters.operacao) {
        conditions.push(`operacao = $${paramIndex++}`)
        params.push(filters.operacao)
      }
      if (filters.tabela) {
        conditions.push(`tabela = $${paramIndex++}`)
        params.push(filters.tabela)
      }
      if (filters.dataInicio) {
        conditions.push(`dt_log >= $${paramIndex++}`)
        params.push(filters.dataInicio)
      }
      if (filters.dataFim) {
        conditions.push(`dt_log <= $${paramIndex++}`)
        params.push(filters.dataFim)
      }

      if (conditions.length > 0) {
        const whereClause = `WHERE ${conditions.join(' AND ')}`
        countQuery += ` ${whereClause}`
        query += ` ${whereClause}`
      }

      query += ` ORDER BY dt_log DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      params.push(filters.limit, filters.offset)

      const countResult = await client.query<{ count: string }>(countQuery, params.slice(0, params.length - 2))
      const count = parseInt(countResult.rows[0]?.count || '0', 10)

      const result = await client.query<LogSistemaRow>(query, params)

      return {
        rows: result.rows.map(mapRowToProps),
        count,
      }
    } finally {
      client.release()
    }
  }
}

