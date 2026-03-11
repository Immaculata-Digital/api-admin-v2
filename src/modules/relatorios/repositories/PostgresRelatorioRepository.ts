import { pool } from '../../../infra/database/pool'
import type { IRelatorioRepository, HistoricoFidelidadeFiltro, HistoricoFidelidadeRow } from './IRelatorioRepository'

export class PostgresRelatorioRepository implements IRelatorioRepository {
    async getHistoricoFidelidade(schema: string, filtros: HistoricoFidelidadeFiltro): Promise<HistoricoFidelidadeRow[]> {
        const client = await pool.connect()
        try {
            let query = `
        SELECT 
          '${schema}' as cliente_concordia,
          c.nome_completo as cliente_nome,
          c.email,
          c.whatsapp,
          TO_CHAR(m.dt_cadastro AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD HH24:MI:SS') as "Data",
          m.tipo as "Operação",
          m.pontos as "Pontos",
          m.saldo_resultante as "Saldo",
          m.origem as "Origem",
          l.nome_loja as "Loja",
          i.nome_item as "Item Resgatado",
          m.observacao as "Observação"
        FROM "${schema}".cliente_pontos_movimentacao m
        JOIN "${schema}".clientes c ON c.id_cliente = m.id_cliente
        LEFT JOIN "${schema}".lojas l ON l.id_loja = m.id_loja
        LEFT JOIN "${schema}".itens_recompensa i ON i.id_item_recompensa = m.id_item_recompensa
        WHERE 1=1
      `
            const params: any[] = []
            let paramIndex = 1

            if (filtros.dataInicial) {
                query += ` AND m.dt_cadastro >= $${paramIndex++}::timestamp`
                params.push(filtros.dataInicial)
            }

            if (filtros.dataFinal) {
                query += ` AND m.dt_cadastro <= $${paramIndex++}::timestamp`
                params.push(filtros.dataFinal)
            }

            if (filtros.id_loja) {
                query += ` AND m.id_loja = $${paramIndex++}`
                params.push(filtros.id_loja)
            }

            query += ` ORDER BY m.dt_cadastro DESC`

            const result = await client.query(query, params)
            return result.rows
        } finally {
            client.release()
        }
    }
}
