import { pool } from '../../../infra/database/pool'
import type { ItemRecompensaProps } from '../entities/ItemRecompensa'
import type { IItemRecompensaRepository } from './IItemRecompensaRepository'

type ItemRecompensaRow = {
  id_item_recompensa: number
  nome_item: string
  descricao: string
  qtd_pontos: number
  imagem_item: string | null
  nao_retirar_loja: boolean
  dt_cadastro: Date
  usu_cadastro: string | null
  dt_altera: Date | null
  usu_altera: string | null
}

const mapRowToProps = (row: ItemRecompensaRow): ItemRecompensaProps => ({
  id_item_recompensa: row.id_item_recompensa,
  nome_item: row.nome_item,
  descricao: row.descricao,
  quantidade_pontos: row.qtd_pontos,
  imagem_item: row.imagem_item,
  nao_retirar_loja: row.nao_retirar_loja,
  dt_cadastro: row.dt_cadastro,
  usu_cadastro: row.usu_cadastro,
  dt_altera: row.dt_altera,
  usu_altera: row.usu_altera,
})

export class PostgresItemRecompensaRepository implements IItemRecompensaRepository {
  async findAll(schema: string, filters: { limit: number; offset: number; search?: string }): Promise<{ rows: ItemRecompensaProps[]; count: number }> {
    const client = await pool.connect()
    try {
      let countQuery = `SELECT COUNT(*) as count FROM "${schema}".itens_recompensa`
      let query = `SELECT * FROM "${schema}".itens_recompensa`
      const params: unknown[] = []

      if (filters.search) {
        const searchCondition = `WHERE nome_item ILIKE $1 OR descricao ILIKE $1`
        countQuery += ` ${searchCondition}`
        query += ` ${searchCondition}`
        params.push(`%${filters.search}%`)
      }

      query += ` ORDER BY id_item_recompensa DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
      params.push(filters.limit, filters.offset)

      const countResult = await client.query<{ count: string }>(countQuery, params.slice(0, filters.search ? 1 : 0))
      const count = parseInt(countResult.rows[0]?.count || '0', 10)

      const result = await client.query<ItemRecompensaRow>(query, params)

      return {
        rows: result.rows.map(mapRowToProps),
        count,
      }
    } finally {
      client.release()
    }
  }

  async findById(schema: string, id: number): Promise<ItemRecompensaProps | null> {
    const client = await pool.connect()
    try {
      const result = await client.query<ItemRecompensaRow>(
        `SELECT * FROM "${schema}".itens_recompensa WHERE id_item_recompensa = $1`,
        [id]
      )
      return result.rows[0] ? mapRowToProps(result.rows[0]) : null
    } finally {
      client.release()
    }
  }

  async create(schema: string, data: Omit<ItemRecompensaProps, 'id_item_recompensa' | 'dt_cadastro' | 'dt_altera' | 'nao_retirar_loja'> & { nao_retirar_loja?: boolean }): Promise<ItemRecompensaProps> {
    const client = await pool.connect()
    try {
      const result = await client.query<ItemRecompensaRow>(
        `INSERT INTO "${schema}".itens_recompensa 
         (nome_item, descricao, qtd_pontos, imagem_item, nao_retirar_loja, usu_cadastro, dt_cadastro)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [
          data.nome_item,
          data.descricao,
          data.quantidade_pontos,
          data.imagem_item ?? null,
          data.nao_retirar_loja ?? false,
          data.usu_cadastro,
        ]
      )
      return mapRowToProps(result.rows[0]!)
    } finally {
      client.release()
    }
  }

  async update(schema: string, id: number, data: Partial<ItemRecompensaProps>): Promise<ItemRecompensaProps | null> {
    const client = await pool.connect()
    try {
      const updates: string[] = []
      const values: unknown[] = []
      let paramIndex = 1

      if (typeof data.nome_item !== 'undefined') {
        updates.push(`nome_item = $${paramIndex++}`)
        values.push(data.nome_item)
      }
      if (typeof data.descricao !== 'undefined') {
        updates.push(`descricao = $${paramIndex++}`)
        values.push(data.descricao)
      }
      if (typeof data.quantidade_pontos !== 'undefined') {
        updates.push(`qtd_pontos = $${paramIndex++}`)
        values.push(data.quantidade_pontos)
      }
      if (typeof data.imagem_item !== 'undefined') {
        updates.push(`imagem_item = $${paramIndex++}`)
        values.push(data.imagem_item ?? null)
      }
      if (typeof data.nao_retirar_loja !== 'undefined') {
        updates.push(`nao_retirar_loja = $${paramIndex++}`)
        values.push(data.nao_retirar_loja)
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

      const result = await client.query<ItemRecompensaRow>(
        `UPDATE "${schema}".itens_recompensa 
         SET ${updates.join(', ')}
         WHERE id_item_recompensa = $${paramIndex}
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
        `DELETE FROM "${schema}".itens_recompensa WHERE id_item_recompensa = $1`,
        [id]
      )
      return (result.rowCount ?? 0) > 0
    } finally {
      client.release()
    }
  }
}

