import { pool } from '../../../infra/database/pool'
import type { WebRadioProps } from '../entities/WebRadio'
import type { IWebRadioRepository } from './IWebRadioRepository'

type WebRadioRow = {
  id_webradio: number
  nome_audio: string
  arquivo_audio_base64: string | null
  duracao_segundos: number | null
  ordem: number
  dt_cadastro: Date
  usu_cadastro: string | null
  dt_altera: Date | null
  usu_altera: string | null
}

const mapRowToProps = (row: WebRadioRow): WebRadioProps => ({
  id_webradio: row.id_webradio,
  nome_audio: row.nome_audio,
  arquivo_audio_base64: row.arquivo_audio_base64,
  duracao_segundos: row.duracao_segundos,
  ordem: row.ordem,
  dt_cadastro: row.dt_cadastro,
  usu_cadastro: row.usu_cadastro,
  dt_altera: row.dt_altera,
  usu_altera: row.usu_altera,
})

export class PostgresWebRadioRepository implements IWebRadioRepository {
  async findAll(schema: string, filters: { limit: number; offset: number; search?: string }): Promise<{ rows: WebRadioProps[]; count: number }> {
    const client = await pool.connect()
    try {
      let countQuery = `SELECT COUNT(*) as count FROM "${schema}".webradio`
      let query = `SELECT * FROM "${schema}".webradio`
      const params: unknown[] = []

      if (filters.search) {
        const searchCondition = `WHERE nome_audio ILIKE $1`
        countQuery += ` ${searchCondition}`
        query += ` ${searchCondition}`
        params.push(`%${filters.search}%`)
      }

      query += ` ORDER BY ordem ASC, id_webradio ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(filters.limit, filters.offset)

      const countResult = await client.query<{ count: string }>(countQuery, params.slice(0, filters.search ? 1 : 0))
      const count = parseInt(countResult.rows[0]?.count || '0', 10)

      const result = await client.query<WebRadioRow>(query, params)

      return {
        rows: result.rows.map(mapRowToProps),
        count,
      }
    } finally {
      client.release()
    }
  }

  async findById(schema: string, id: number): Promise<WebRadioProps | null> {
    const client = await pool.connect()
    try {
      const result = await client.query<WebRadioRow>(
        `SELECT * FROM "${schema}".webradio WHERE id_webradio = $1`,
        [id]
      )
      return result.rows[0] ? mapRowToProps(result.rows[0]) : null
    } finally {
      client.release()
    }
  }

  async findNextByOrder(schema: string, currentAudioId: number): Promise<WebRadioProps | null> {
    const client = await pool.connect()
    try {
      // Buscar o áudio atual para pegar a ordem
      const current = await client.query<{ ordem: number }>(
        `SELECT ordem FROM "${schema}".webradio WHERE id_webradio = $1`,
        [currentAudioId]
      )

      if (current.rows.length === 0) {
        // Se não encontrou, retorna o primeiro
        const first = await client.query<WebRadioRow>(
          `SELECT * FROM "${schema}".webradio 
           WHERE arquivo_audio_base64 IS NOT NULL 
           ORDER BY ordem ASC, id_webradio ASC LIMIT 1`
        )
        return first.rows[0] ? mapRowToProps(first.rows[0]) : null
      }

      const currentOrder = current.rows[0]!.ordem

      // Buscar próximo com ordem maior
      let next = await client.query<WebRadioRow>(
        `SELECT * FROM "${schema}".webradio 
         WHERE ordem > $1 AND arquivo_audio_base64 IS NOT NULL 
         ORDER BY ordem ASC, id_webradio ASC LIMIT 1`,
        [currentOrder]
      )

      if (next.rows.length > 0) {
        return mapRowToProps(next.rows[0]!)
      }

      // Se não encontrou, buscar com mesma ordem mas id maior
      next = await client.query<WebRadioRow>(
        `SELECT * FROM "${schema}".webradio 
         WHERE ordem = $1 AND id_webradio > $2 AND arquivo_audio_base64 IS NOT NULL 
         ORDER BY id_webradio ASC LIMIT 1`,
        [currentOrder, currentAudioId]
      )

      if (next.rows.length > 0) {
        return mapRowToProps(next.rows[0]!)
      }

      // Se não encontrou próximo, retorna o primeiro (loop)
      const first = await client.query<WebRadioRow>(
        `SELECT * FROM "${schema}".webradio 
         WHERE arquivo_audio_base64 IS NOT NULL 
         ORDER BY ordem ASC, id_webradio ASC LIMIT 1`
      )
      return first.rows[0] ? mapRowToProps(first.rows[0]) : null
    } finally {
      client.release()
    }
  }

  async create(schema: string, data: Omit<WebRadioProps, 'id_webradio' | 'dt_cadastro' | 'dt_altera'>): Promise<WebRadioProps> {
    const client = await pool.connect()
    try {
      // Obter próxima ordem se não fornecida
      let ordem = data.ordem
      if (!ordem) {
        const maxOrder = await client.query<{ max: number | null }>(
          `SELECT MAX(ordem) as max FROM "${schema}".webradio`
        )
        ordem = (maxOrder.rows[0]?.max || 0) + 1
      }

      const result = await client.query<WebRadioRow>(
        `INSERT INTO "${schema}".webradio 
         (nome_audio, arquivo_audio_base64, duracao_segundos, ordem, usu_cadastro, dt_cadastro)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING *`,
        [
          data.nome_audio,
          data.arquivo_audio_base64 ?? null,
          data.duracao_segundos ?? null,
          ordem,
          data.usu_cadastro,
        ]
      )
      return mapRowToProps(result.rows[0]!)
    } finally {
      client.release()
    }
  }

  async update(schema: string, id: number, data: Partial<WebRadioProps>): Promise<WebRadioProps | null> {
    const client = await pool.connect()
    try {
      const updates: string[] = []
      const values: unknown[] = []
      let paramIndex = 1

      if (typeof data.nome_audio !== 'undefined') {
        updates.push(`nome_audio = $${paramIndex++}`)
        values.push(data.nome_audio)
      }
      if (typeof data.arquivo_audio_base64 !== 'undefined') {
        updates.push(`arquivo_audio_base64 = $${paramIndex++}`)
        values.push(data.arquivo_audio_base64 ?? null)
      }
      if (typeof data.duracao_segundos !== 'undefined') {
        updates.push(`duracao_segundos = $${paramIndex++}`)
        values.push(data.duracao_segundos ?? null)
      }
      if (typeof data.ordem !== 'undefined') {
        updates.push(`ordem = $${paramIndex++}`)
        values.push(data.ordem)
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

      const result = await client.query<WebRadioRow>(
        `UPDATE "${schema}".webradio 
         SET ${updates.join(', ')}
         WHERE id_webradio = $${paramIndex}
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
        `DELETE FROM "${schema}".webradio WHERE id_webradio = $1`,
        [id]
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  }

  async reorder(schema: string, ids: number[]): Promise<void> {
    const client = await pool.connect()
    try {
      for (let i = 0; i < ids.length; i++) {
        await client.query(
          `UPDATE "${schema}".webradio SET ordem = $1 WHERE id_webradio = $2`,
          [i + 1, ids[i]]
        )
      }
    } finally {
      client.release()
    }
  }
}

