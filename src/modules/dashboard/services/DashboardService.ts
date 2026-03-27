import { pool } from '../../../infra/database/pool'

export interface DashboardCliente {
  id_cliente: number
  nome: string
  email: string
  whatsapp?: string
  dt_cadastro: string
  pontos_saldo: number
}

export interface DashboardResgate {
  id_resgate: number
  id_cliente: number
  cliente_nome: string
  item_nome: string
  pontos: number
  dt_resgate: string
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'entregue'
}

export interface LojaRankingClientes {
  id_loja: number
  nome_loja: string
  quantidade: number
  posicao: number
}

export interface DashboardResponse {
  clientes_total: number
  clientes_7d: number
  clientes_7d_variacao: number
  pontos_creditados_7d: number
  pontos_resgatados_7d: number
  itens_resgatados_7d: number
  lojas_ranking_novos_clientes: LojaRankingClientes[]
  ultimos_resgates: DashboardResgate[]
}

export class DashboardService {
  async getDashboardData(schema: string, lojaIds?: number[]): Promise<DashboardResponse> {
    const client = await pool.connect()
    try {
      // Nota: Este é um exemplo básico. A implementação completa dependeria das tabelas específicas do sistema
      // Por enquanto, retornamos dados básicos. Você pode expandir isso conforme necessário.

      // Construir condição de filtro por lojas
      const lojaCondition = lojaIds && lojaIds.length > 0
        ? `WHERE id_loja = ANY($1::int[])`
        : ''
      const lojaParams = lojaIds && lojaIds.length > 0 ? [lojaIds] : []

      // Total de clientes
      const totalClientesQuery = `SELECT COUNT(*) as count FROM "${schema}".clientes ${lojaCondition}`
      const totalClientesResult = await client.query<{ count: string }>(
        totalClientesQuery,
        lojaParams
      )
      const clientes_total = parseInt(totalClientesResult.rows[0]?.count || '0', 10)

      // Clientes dos últimos 7 dias
      const clientes7dCondition = lojaIds && lojaIds.length > 0
        ? `AND id_loja = ANY($1::int[])`
        : ''
      const clientes7dQuery = `SELECT COUNT(*) as count FROM "${schema}".clientes 
           WHERE dt_cadastro >= NOW() - INTERVAL '7 days' ${clientes7dCondition}`
      const clientes7dResult = await client.query<{ count: string }>(
        clientes7dQuery,
        lojaParams
      )
      const clientes_7d = parseInt(clientes7dResult.rows[0]?.count || '0', 10)

      // Clientes dos 7 dias anteriores (para calcular variação)
      const clientes7dAnteriorCondition = lojaIds && lojaIds.length > 0
        ? `AND id_loja = ANY($1::int[])`
        : ''
      const clientes7dAnteriorQuery = `SELECT COUNT(*) as count FROM "${schema}".clientes 
           WHERE dt_cadastro >= NOW() - INTERVAL '14 days' 
             AND dt_cadastro < NOW() - INTERVAL '7 days' ${clientes7dAnteriorCondition}`
      const clientes7dAnteriorResult = await client.query<{ count: string }>(
        clientes7dAnteriorQuery,
        lojaParams
      )
      const clientes_7d_anterior = parseInt(clientes7dAnteriorResult.rows[0]?.count || '0', 10)
      const clientes_7d_variacao = clientes_7d_anterior > 0
        ? ((clientes_7d - clientes_7d_anterior) / clientes_7d_anterior) * 100
        : clientes_7d > 0 ? 100 : 0

      // Pontos creditados nos últimos 7 dias (da tabela cliente_pontos_movimentacao)
      const pontosCreditadosCondition = lojaIds && lojaIds.length > 0
        ? `AND COALESCE(m.id_loja, c.id_loja) = ANY($1::int[])`
        : ''
      const pontosCreditadosQuery = `SELECT COALESCE(SUM(m.pontos), 0) as sum 
           FROM "${schema}".cliente_pontos_movimentacao m
           INNER JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente
           WHERE m.tipo = 'CREDITO' 
             AND m.dt_cadastro >= NOW() - INTERVAL '7 days' ${pontosCreditadosCondition}`
      const pontosCreditadosResult = await client.query<{ sum: string | null }>(
        pontosCreditadosQuery,
        lojaParams
      )
      const pontos_creditados_7d = parseInt(pontosCreditadosResult.rows[0]?.sum || '0', 10)

      // Pontos resgatados nos últimos 7 dias (da tabela cliente_pontos_movimentacao com tipo DEBITO e origem RESGATE)
      const pontosResgatadosCondition = lojaIds && lojaIds.length > 0
        ? `AND COALESCE(m.id_loja, c.id_loja) = ANY($1::int[])`
        : ''
      const pontosResgatadosQuery = `SELECT COALESCE(SUM(m.pontos), 0) as sum 
           FROM "${schema}".cliente_pontos_movimentacao m
           INNER JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente
           WHERE m.tipo = 'DEBITO' 
             AND m.origem = 'RESGATE'
             AND m.dt_cadastro >= NOW() - INTERVAL '7 days' ${pontosResgatadosCondition}`
      const pontosResgatadosResult = await client.query<{ sum: string | null }>(
        pontosResgatadosQuery,
        lojaParams
      )
      const pontos_resgatados_7d = parseInt(pontosResgatadosResult.rows[0]?.sum || '0', 10)

      // Itens resgatados nos últimos 7 dias
      const itensResgatadosCondition = lojaIds && lojaIds.length > 0
        ? `AND COALESCE(m.id_loja, c.id_loja) = ANY($1::int[])`
        : ''
      const itensResgatadosQuery = `SELECT COUNT(*) as count 
           FROM "${schema}".cliente_pontos_movimentacao m
           INNER JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente
           WHERE m.tipo = 'DEBITO' 
             AND m.origem = 'RESGATE'
             AND m.dt_cadastro >= NOW() - INTERVAL '7 days' ${itensResgatadosCondition}`
      const itensResgatadosResult = await client.query<{ count: string }>(
        itensResgatadosQuery,
        lojaParams
      )
      const itens_resgatados_7d = parseInt(itensResgatadosResult.rows[0]?.count || '0', 10)

      // Ranking de Lojas por Novos Clientes (7 dias) independente do filtro de loja atual
      const rankingLojasQuery = `
           SELECT 
             l.id_loja, 
             l.nome_loja, 
             COUNT(c.id_cliente)::int as quantidade
           FROM "${schema}".lojas l
           LEFT JOIN "${schema}".clientes c ON c.id_loja = l.id_loja AND c.dt_cadastro >= NOW() - INTERVAL '7 days'
           GROUP BY l.id_loja, l.nome_loja
           ORDER BY quantidade DESC, l.nome_loja ASC
      `

      let lojas_ranking_novos_clientes: LojaRankingClientes[] = []
      try {
        const rankingLojasResult = await client.query<{ id_loja: number, nome_loja: string, quantidade: number }>(rankingLojasQuery)
        lojas_ranking_novos_clientes = rankingLojasResult.rows.map((row, index) => ({
          id_loja: row.id_loja,
          nome_loja: row.nome_loja,
          quantidade: row.quantidade,
          posicao: index + 1
        }))
      } catch (error) {
        console.warn('Erro ao buscar ranking de lojas:', error)
      }

      // Últimos resgates (da tabela cliente_pontos_movimentacao com LEFT JOIN em clientes_itens_recompensa)
      // Usa LEFT JOIN porque a tabela clientes_itens_recompensa pode não existir em schemas antigos
      const ultimosResgatesCondition = lojaIds && lojaIds.length > 0
        ? `AND COALESCE(m.id_loja, c.id_loja) = ANY($1::int[])`
        : ''
      const ultimosResgatesQuery = `SELECT 
             COALESCE(cir.id_cliente_item_recompensa, m.id_movimentacao) as id_resgate,
             m.id_cliente,
             c.nome_completo as cliente_nome,
             COALESCE(ir.nome_item, 'Item não encontrado') as item_nome,
             m.pontos,
             m.dt_cadastro::text as dt_resgate,
             CASE 
               WHEN cir.resgate_utilizado = true THEN 'entregue'
               WHEN cir.resgate_utilizado = false THEN 'pendente'
               ELSE 'pendente'
             END as status
           FROM "${schema}".cliente_pontos_movimentacao m
           INNER JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente
           LEFT JOIN "${schema}".clientes_itens_recompensa cir ON cir.id_movimentacao = m.id_movimentacao
           LEFT JOIN "${schema}".itens_recompensa ir ON m.id_item_recompensa = ir.id_item_recompensa
           WHERE m.tipo = 'DEBITO' 
             AND m.origem = 'RESGATE' ${ultimosResgatesCondition}
           ORDER BY m.dt_cadastro DESC LIMIT 10`

      let ultimos_resgates: DashboardResgate[] = []
      try {
        const ultimosResgatesResult = await client.query<DashboardResgate>(
          ultimosResgatesQuery,
          lojaParams
        )
        ultimos_resgates = ultimosResgatesResult.rows
      } catch (error) {
        // Se a tabela clientes_itens_recompensa não existir, retornar array vazio
        console.warn('Erro ao buscar últimos resgates (tabela pode não existir):', error)
        ultimos_resgates = []
      }

      return {
        clientes_total,
        clientes_7d,
        clientes_7d_variacao: Math.round(clientes_7d_variacao * 100) / 100,
        pontos_creditados_7d,
        pontos_resgatados_7d,
        itens_resgatados_7d,
        lojas_ranking_novos_clientes,
        ultimos_resgates,
      }
    } catch (error: any) {
      // Log do erro para debug
      console.error(`[DashboardService] Erro ao buscar dados do dashboard para schema ${schema}:`, error)

      // Se as tabelas não existirem, retornar dados vazios
      // Mas tentar pelo menos buscar total de clientes se a tabela existir
      try {
        const lojaCondition = lojaIds && lojaIds.length > 0
          ? `WHERE id_loja = ANY($1::int[])`
          : ''
        const lojaParams = lojaIds && lojaIds.length > 0 ? [lojaIds] : []
        const totalClientesQuery = `SELECT COUNT(*) as count FROM "${schema}".clientes ${lojaCondition}`
        const totalResult = await client.query<{ count: string }>(
          totalClientesQuery,
          lojaParams
        )
        const clientes_total = parseInt(totalResult.rows[0]?.count || '0', 10)

        return {
          clientes_total,
          clientes_7d: 0,
          clientes_7d_variacao: 0,
          pontos_creditados_7d: 0,
          pontos_resgatados_7d: 0,
          itens_resgatados_7d: 0,
          lojas_ranking_novos_clientes: [],
          ultimos_resgates: [],
        }
      } catch (fallbackError) {
        // Se nem a tabela de clientes existir, retornar tudo zero
        console.error(`[DashboardService] Erro ao buscar total de clientes:`, fallbackError)
        return {
          clientes_total: 0,
          clientes_7d: 0,
          clientes_7d_variacao: 0,
          pontos_creditados_7d: 0,
          pontos_resgatados_7d: 0,
          itens_resgatados_7d: 0,
          lojas_ranking_novos_clientes: [],
          ultimos_resgates: [],
        }
      }
    } finally {
      client.release()
    }
  }

  async getLojasGestorasForUserInSchema(userId: string, schema: string): Promise<number[]> {
    const client = await pool.connect()
    try {
      // Buscar lojas gestoras do usuário na tabela user_lojas_gestoras
      const result = await client.query<{ id_loja: number }>(
        `SELECT id_loja FROM "${schema}".user_lojas_gestoras 
         WHERE user_id = $1`,
        [userId]
      )
      return result.rows.map(row => row.id_loja)
    } catch (error) {
      console.error('Erro ao buscar lojas gestoras do usuário:', error)
      return []
    } finally {
      client.release()
    }
  }

  async getChartData(schema: string, kpi: string, periodDays: number, lojaIds?: number[]): Promise<any[]> {
    const client = await pool.connect()
    try {
      const lojaCondition = lojaIds && lojaIds.length > 0
        ? `AND id_loja = ANY($1::int[])`
        : ''
      const lojaParams = lojaIds && lojaIds.length > 0 ? [lojaIds] : []

      if (kpi === 'itens-resgatados') {
        // Ranking of items (ranking doesn't need generate_series for time gaps, just the top items)
        const query = `
          SELECT 
            COALESCE(ir.nome_item, 'Item não encontrado') as label,
            COUNT(*)::int as value
          FROM "${schema}".cliente_pontos_movimentacao m
          INNER JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente
          LEFT JOIN "${schema}".itens_recompensa ir ON m.id_item_recompensa = ir.id_item_recompensa
          WHERE m.tipo = 'DEBITO' 
            AND m.origem = 'RESGATE'
            AND m.dt_cadastro >= NOW() - INTERVAL '${periodDays} days'
            ${lojaIds && lojaIds.length > 0 ? `AND COALESCE(m.id_loja, c.id_loja) = ANY($1::int[])` : ''}
          GROUP BY ir.nome_item
          ORDER BY value DESC
        `
        const result = await client.query(query, lojaParams)
        return result.rows
      }

      let seriesInterval = ''
      let grouping = ''
      let startOffset = ''

      if (periodDays === 365) {
        seriesInterval = '1 month'
        grouping = "TO_CHAR(series, 'YYYY-MM')"
        startOffset = "DATE_TRUNC('month', NOW() - INTERVAL '364 days')"
      } else if (periodDays === 90) {
        seriesInterval = '1 week'
        grouping = "TO_CHAR(DATE_TRUNC('week', series), 'YYYY-\"W\"IW')"
        startOffset = "DATE_TRUNC('week', NOW() - INTERVAL '89 days')"
      } else {
        seriesInterval = '1 day'
        grouping = "TO_CHAR(series, 'YYYY-MM-DD')"
        startOffset = `DATE_TRUNC('day', NOW() - INTERVAL '${periodDays - 1} days')`
      }

      let metricQuery = ''
      if (kpi === 'novos-clientes') {
        metricQuery = `
          SELECT 
            ${grouping.replace(/series/g, 'dt_cadastro')} as label,
            COUNT(*)::int as val
          FROM "${schema}".clientes
          WHERE dt_cadastro >= ${startOffset}
            ${lojaCondition}
          GROUP BY label
        `
      } else if (kpi === 'pontos-creditados') {
        metricQuery = `
          SELECT 
            ${grouping.replace(/series/g, 'm.dt_cadastro')} as label,
            COALESCE(SUM(m.pontos), 0)::int as val
          FROM "${schema}".cliente_pontos_movimentacao m
          INNER JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente
          WHERE m.tipo = 'CREDITO' 
            AND m.dt_cadastro >= ${startOffset}
            ${lojaIds && lojaIds.length > 0 ? `AND COALESCE(m.id_loja, c.id_loja) = ANY($1::int[])` : ''}
          GROUP BY label
        `
      } else if (kpi === 'pontos-resgatados') {
        metricQuery = `
          SELECT 
            ${grouping.replace(/series/g, 'm.dt_cadastro')} as label,
            COALESCE(SUM(m.pontos), 0)::int as val
          FROM "${schema}".cliente_pontos_movimentacao m
          INNER JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente
          WHERE m.tipo = 'DEBITO' 
            AND m.origem = 'RESGATE'
            AND m.dt_cadastro >= ${startOffset}
            ${lojaIds && lojaIds.length > 0 ? `AND COALESCE(m.id_loja, c.id_loja) = ANY($1::int[])` : ''}
          GROUP BY label
        `
      }

      const finalQuery = `
        WITH time_series AS (
          SELECT generate_series(
            ${startOffset},
            NOW(),
            '${seriesInterval}'::interval
          ) as series
        ),
        metrics AS (
          ${metricQuery}
        )
        SELECT 
          ${grouping} as label,
          COALESCE(m.val, 0) as value
        FROM time_series ts
        LEFT JOIN metrics m ON ${grouping} = m.label
        ORDER BY ts.series ASC
      `

      const result = await client.query(finalQuery, lojaParams)
      return result.rows
    } catch (error) {
      console.error(`[DashboardService] Erro ao buscar dados do gráfico (${kpi}):`, error)
      throw error
    } finally {
      client.release()
    }
  }

  async getFidelidadeKPIs(schema: string, periodDays: number, lojaIds?: number[], startDate?: string, endDate?: string): Promise<any> {
    const client = await pool.connect()
    try {
      const lojaConditionM = lojaIds && lojaIds.length > 0 ? `AND COALESCE(NULLIF(m.id_loja, 0), c.id_loja) = ANY($1::int[])` : ''
      const lojaConditionC = lojaIds && lojaIds.length > 0 ? `AND c.id_loja = ANY($1::int[])` : ''
      
      let periodConditionC = ''
      let periodConditionM = ''

      if (startDate && endDate) {
        periodConditionC = `AND c.dt_cadastro >= '${startDate} 00:00:00' AND c.dt_cadastro <= '${endDate} 23:59:59'`
        periodConditionM = `AND m.dt_cadastro >= '${startDate} 00:00:00' AND m.dt_cadastro <= '${endDate} 23:59:59'`
      } else if (periodDays > 0) {
        periodConditionC = `AND c.dt_cadastro >= NOW() - INTERVAL '${periodDays} days'`
        periodConditionM = `AND m.dt_cadastro >= NOW() - INTERVAL '${periodDays} days'`
      }
      const lojaParams = lojaIds && lojaIds.length > 0 ? [lojaIds] : []

      const cardsQuery = `
        SELECT 
          (SELECT COUNT(*)::int FROM "${schema}".clientes c WHERE 1=1 ${periodConditionC} ${lojaConditionC}) as clientes,
          (SELECT COUNT(*)::int FROM "${schema}".cliente_pontos_movimentacao m JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente WHERE m.tipo = 'CREDITO' ${periodConditionM} ${lojaConditionM}) as vendas,
          (SELECT COALESCE(SUM(m.pontos), 0)::int FROM "${schema}".cliente_pontos_movimentacao m JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente WHERE m.tipo = 'CREDITO' ${periodConditionM} ${lojaConditionM}) as creditos,
          (SELECT COALESCE(SUM(m.pontos), 0)::int FROM "${schema}".cliente_pontos_movimentacao m JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente WHERE m.tipo = 'DEBITO' AND m.origem = 'RESGATE' ${periodConditionM} ${lojaConditionM}) as resgates
      `
      const cardsResult = await client.query(cardsQuery, lojaParams)
      
      const resUltimos = await client.query(`
        SELECT 
          m.id_movimentacao as id_resgate, 
          c.nome_completo as cliente_nome, 
          COALESCE(ir.nome_item, 'Resgate') as item_nome, 
          m.pontos, 
          m.dt_cadastro::text as dt_resgate,
          COALESCE(l.nome_loja, 'Unidade ' || COALESCE(NULLIF(m.id_loja, 0), c.id_loja)) as loja_nome
        FROM "${schema}".cliente_pontos_movimentacao m 
        JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente 
        LEFT JOIN "${schema}".itens_recompensa ir ON m.id_item_recompensa = ir.id_item_recompensa
        LEFT JOIN "${schema}".lojas l ON l.id_loja = COALESCE(NULLIF(m.id_loja, 0), c.id_loja)
        WHERE m.tipo = 'DEBITO' AND m.origem = 'RESGATE' ${periodConditionM} ${lojaConditionM}
        ORDER BY m.dt_cadastro DESC LIMIT 10`, lojaParams)

      const row = cardsResult.rows[0] || { clientes: 0, vendas: 0, creditos: 0, resgates: 0 }
      const ticketMedio = row.vendas > 0 ? (row.creditos / row.vendas) / 10 : 0

      return {
        cards: {
          clientes: { value: row.clientes },
          pontos_creditados: { value: row.creditos },
          pontos_resgatados: { value: row.resgates },
          ticket_medio: { value: Math.round(ticketMedio * 100) / 100 },
          vendas: { value: row.vendas }
        },
        ultimos_resgates: resUltimos.rows
      }
    } finally {
      client.release()
    }
  }

  async getFidelidadeStoresData(schema: string, kpi: string, periodDays: number, lojaIds?: number[], startDate?: string, endDate?: string): Promise<any[]> {
    const client = await pool.connect()
    try {
      if (kpi === 'clientes' || kpi === 'pontos_creditados' || kpi === 'pontos_resgatados' || kpi === 'vendas' || kpi === 'ticket_medio') {
        let periodCondition = ''
        let clientPeriodCondition = ''

        if (startDate && endDate) {
          periodCondition = `AND m.dt_cadastro >= '${startDate} 00:00:00' AND m.dt_cadastro <= '${endDate} 23:59:59'`
          clientPeriodCondition = `AND c.dt_cadastro >= '${startDate} 00:00:00' AND c.dt_cadastro <= '${endDate} 23:59:59'`
        } else if (periodDays > 0) {
          periodCondition = `AND m.dt_cadastro >= NOW() - INTERVAL '${periodDays} days'`
          clientPeriodCondition = `AND c.dt_cadastro >= NOW() - INTERVAL '${periodDays} days'`
        }
        
        let query = ''
        if (kpi === 'clientes') {
          if (lojaIds && lojaIds.length > 0) {
            query = `
              SELECT COALESCE(l.nome_loja, 'Unidade ' || ids.id) as label, COUNT(c.id_cliente)::int as value 
              FROM (SELECT unnest($1::int[]) as id) ids
              LEFT JOIN "${schema}".lojas l ON l.id_loja = ids.id
              LEFT JOIN "${schema}".clientes c ON c.id_loja = ids.id ${clientPeriodCondition}
              GROUP BY ids.id, l.nome_loja
            `
          } else {
            query = `SELECT l.nome_loja as label, COUNT(c.id_cliente)::int as value FROM "${schema}".lojas l LEFT JOIN "${schema}".clientes c ON c.id_loja = l.id_loja ${clientPeriodCondition} GROUP BY l.id_loja, l.nome_loja`
          }
        } else {
          let metricSql = ''
          if (kpi === 'pontos_creditados') metricSql = 'COALESCE(SUM(m.pontos), 0)::int'
          else if (kpi === 'pontos_resgatados') metricSql = 'COALESCE(SUM(m.pontos), 0)::int'
          else if (kpi === 'vendas') metricSql = 'COUNT(m.id_movimentacao)::int'
          else if (kpi === 'ticket_medio') metricSql = '(CASE WHEN COUNT(m.id_movimentacao) > 0 THEN ROUND((SUM(m.pontos)::numeric / COUNT(m.id_movimentacao)) / 10, 2) ELSE 0 END)::float'

          const moveTypeCondition = kpi === 'pontos_resgatados' 
            ? "m.tipo = 'DEBITO' AND m.origem = 'RESGATE'" 
            : "m.tipo = 'CREDITO'"

          if (lojaIds && lojaIds.length > 0) {
            query = `
              SELECT COALESCE(l.nome_loja, 'Unidade ' || ids.id) as label, ${metricSql} as value 
              FROM (SELECT unnest($1::int[]) as id) ids
              LEFT JOIN "${schema}".lojas l ON l.id_loja = ids.id
              LEFT JOIN (
                SELECT m1.*, c1.id_loja as client_loja 
                FROM "${schema}".cliente_pontos_movimentacao m1 
                JOIN "${schema}".clientes c1 ON m1.id_cliente = c1.id_cliente
              ) m ON ids.id = COALESCE(NULLIF(m.id_loja, 0), m.client_loja) 
                AND ${moveTypeCondition} 
                ${periodCondition}
              GROUP BY ids.id, l.nome_loja
            `
          } else {
            query = `
              SELECT l.nome_loja as label, ${metricSql} as value 
              FROM "${schema}".lojas l 
              LEFT JOIN (
                SELECT m1.*, c1.id_loja as client_loja 
                FROM "${schema}".cliente_pontos_movimentacao m1 
                JOIN "${schema}".clientes c1 ON m1.id_cliente = c1.id_cliente
              ) m ON l.id_loja = COALESCE(NULLIF(m.id_loja, 0), m.client_loja) 
                AND ${moveTypeCondition} 
                ${periodCondition}
              GROUP BY l.id_loja, l.nome_loja
            `
          }
        }
        const lojaParams = lojaIds && lojaIds.length > 0 ? [lojaIds] : []
        const res = await client.query(query, lojaParams)
        return res.rows
      }
      return []
    } finally {
      client.release()
    }
  }

  async getClienteKPIs(schema: string, periodDays: number, lojaIds?: number[], startDate?: string, endDate?: string): Promise<any> {
    const client = await pool.connect()
    try {
      let periodCondition = ''
      if (startDate && endDate) {
        periodCondition = `AND c.dt_cadastro >= '${startDate} 00:00:00' AND c.dt_cadastro <= '${endDate} 23:59:59'`
      } else if (periodDays > 0) {
        periodCondition = `AND c.dt_cadastro >= NOW() - INTERVAL '${periodDays} days'`
      }
      
      const lojaCondition = lojaIds && lojaIds.length > 0 ? `AND c.id_loja = ANY($1::int[])` : ''
      const lojaParams = lojaIds && lojaIds.length > 0 ? [lojaIds] : []

      // Filtros para movimentação (Ativos)
      let periodConditionM = ''
      if (startDate && endDate) {
        periodConditionM = `AND m.dt_cadastro >= '${startDate} 00:00:00' AND m.dt_cadastro <= '${endDate} 23:59:59'`
      } else if (periodDays > 0) {
        periodConditionM = `AND m.dt_cadastro >= NOW() - INTERVAL '${periodDays} days'`
      }
      const lojaConditionM = lojaIds && lojaIds.length > 0 ? `AND COALESCE(NULLIF(m.id_loja, 0), c.id_loja) = ANY($1::int[])` : ''

      const cardsQuery = `
        SELECT 
          (
            SELECT COUNT(DISTINCT m.id_cliente)::int 
            FROM "${schema}".cliente_pontos_movimentacao m
            JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente
            WHERE m.tipo = 'CREDITO' 
            ${periodConditionM}
            ${lojaConditionM}
          ) as ativos,
          (
            SELECT COUNT(DISTINCT c.id_cliente)::int 
            FROM "${schema}".clientes c
            WHERE 1=1
            ${lojaCondition}
            AND NOT EXISTS (
              SELECT 1 FROM "${schema}".cliente_pontos_movimentacao m
              WHERE m.id_cliente = c.id_cliente
              AND m.tipo = 'CREDITO'
              ${periodConditionM}
              ${lojaConditionM}
            )
          ) as inativos
      `
      const cardsResult = await client.query(cardsQuery, lojaParams)
      const cards = cardsResult.rows[0] || { ativos: 0, inativos: 0 }

      const resSexo = await client.query(`SELECT c.sexo, COUNT(*)::int as count FROM "${schema}".clientes c WHERE c.sexo IS NOT NULL ${periodCondition} ${lojaCondition} GROUP BY c.sexo`, lojaParams)
      const resIdades = await client.query(`
        SELECT 
          CASE 
            WHEN (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM c.data_nascimento)) BETWEEN 10 AND 20 THEN '10-20 ANOS'
            WHEN (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM c.data_nascimento)) BETWEEN 21 AND 30 THEN '21-30 ANOS'
            WHEN (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM c.data_nascimento)) BETWEEN 31 AND 40 THEN '31-40 ANOS'
            WHEN (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM c.data_nascimento)) BETWEEN 41 AND 50 THEN '41-50 ANOS'
            WHEN (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM c.data_nascimento)) BETWEEN 51 AND 60 THEN '51-60 ANOS'
            ELSE '60+ ANOS'
          END as range,
          COUNT(*)::int as count
        FROM "${schema}".clientes c 
        WHERE c.data_nascimento IS NOT NULL ${periodCondition} ${lojaCondition}
        GROUP BY range ORDER BY range`, lojaParams)
      const freqQuery = `
        SELECT AVG(store_freq) as value
        FROM (
          SELECT (COUNT(m.id_movimentacao)::float / NULLIF(COUNT(DISTINCT m.id_cliente), 0)::float) as store_freq
          FROM "${schema}".lojas l
          LEFT JOIN "${schema}".cliente_pontos_movimentacao m ON m.id_loja = l.id_loja AND m.tipo = 'CREDITO' ${periodCondition.replace(/c\./g, 'm.')}
          WHERE 1=1 ${lojaCondition.replace(/c\./g, 'l.')}
          GROUP BY l.id_loja
        ) as store_freqs
      `
      const freqRes = await client.query(freqQuery, lojaParams)
      const frequenciaValue = freqRes.rows[0]?.value || 0

      return {
        cards: {
          ativos: { value: cards.ativos },
          inativos: { value: cards.inativos },
          frequencia: { value: Math.round(frequenciaValue * 10) / 10 }, 
          sexo: resSexo.rows,
          faixa_etaria: resIdades.rows
        }
      }
    } finally {
      client.release()
    }
  }

  async getClienteStoresData(schema: string, kpi: string, periodDays: number, lojaIds?: number[], startDate?: string, endDate?: string): Promise<any[]> {
    const client = await pool.connect()
    try {
      const lojaParams = lojaIds && lojaIds.length > 0 ? [lojaIds] : []
      let periodCondition = ''
      if (startDate && endDate) {
        periodCondition = `AND c.dt_cadastro >= '${startDate} 00:00:00' AND c.dt_cadastro <= '${endDate} 23:59:59'`
      } else if (periodDays > 0) {
        periodCondition = `AND c.dt_cadastro >= NOW() - INTERVAL '${periodDays} days'`
      }

      if (kpi === 'ativos' || kpi === 'inativos') {
        let periodConditionM = ''
        if (startDate && endDate) {
          periodConditionM = `AND m.dt_cadastro >= '${startDate} 00:00:00' AND m.dt_cadastro <= '${endDate} 23:59:59'`
        } else if (periodDays > 0) {
          periodConditionM = `AND m.dt_cadastro >= NOW() - INTERVAL '${periodDays} days'`
        }

        let query = ''
        if (kpi === 'ativos') {
          if (lojaIds && lojaIds.length > 0) {
            query = `
              SELECT COALESCE(l.nome_loja, 'Unidade ' || ids.id) as label, 
                     COUNT(DISTINCT m.id_cliente)::int as value 
              FROM (SELECT unnest($1::int[]) as id) ids
              LEFT JOIN "${schema}".lojas l ON l.id_loja = ids.id
              LEFT JOIN (
                SELECT m1.id_cliente, COALESCE(NULLIF(m1.id_loja, 0), c1.id_loja) as id_loja_final
                FROM "${schema}".cliente_pontos_movimentacao m1
                JOIN "${schema}".clientes c1 ON m1.id_cliente = c1.id_cliente
                WHERE m1.tipo = 'CREDITO' ${periodConditionM.replace(/m\./g, 'm1.')}
              ) m ON m.id_loja_final = ids.id
              GROUP BY ids.id, l.nome_loja
            `
          } else {
            query = `
              SELECT l.nome_loja as label, 
                     COUNT(DISTINCT m.id_cliente)::int as value 
              FROM "${schema}".lojas l 
              LEFT JOIN (
                SELECT m1.id_cliente, COALESCE(NULLIF(m1.id_loja, 0), c1.id_loja) as id_loja_final
                FROM "${schema}".cliente_pontos_movimentacao m1
                JOIN "${schema}".clientes c1 ON m1.id_cliente = c1.id_cliente
                WHERE m1.tipo = 'CREDITO' ${periodConditionM.replace(/m\./g, 'm1.')}
              ) m ON m.id_loja_final = l.id_loja
              GROUP BY l.id_loja, l.nome_loja
            `
          }
        } else {
          // Inativos
          if (lojaIds && lojaIds.length > 0) {
            query = `
              SELECT COALESCE(l.nome_loja, 'Unidade ' || ids.id) as label, 
                     COUNT(DISTINCT c.id_cliente)::int as value 
              FROM (SELECT unnest($1::int[]) as id) ids
              LEFT JOIN "${schema}".lojas l ON l.id_loja = ids.id
              LEFT JOIN "${schema}".clientes c ON c.id_loja = ids.id
                AND NOT EXISTS (
                  SELECT 1 FROM "${schema}".cliente_pontos_movimentacao m
                  WHERE m.id_cliente = c.id_cliente
                  AND m.tipo = 'CREDITO'
                  AND COALESCE(NULLIF(m.id_loja, 0), c.id_loja) = ids.id
                  ${periodConditionM}
                )
              GROUP BY ids.id, l.nome_loja
            `
          } else {
            query = `
              SELECT l.nome_loja as label, 
                     COUNT(DISTINCT c.id_cliente)::int as value 
              FROM "${schema}".lojas l 
              LEFT JOIN "${schema}".clientes c ON c.id_loja = l.id_loja
                AND NOT EXISTS (
                  SELECT 1 FROM "${schema}".cliente_pontos_movimentacao m
                  WHERE m.id_cliente = c.id_cliente
                  AND m.tipo = 'CREDITO'
                  AND COALESCE(NULLIF(m.id_loja, 0), c.id_loja) = l.id_loja
                  ${periodConditionM}
                )
              GROUP BY l.id_loja, l.nome_loja
            `
          }
        }
        const res = await client.query(query, lojaParams)
        return res.rows
      } else if (kpi === 'frequencia') {
        let query = ''
        const mPeriodCondition = periodCondition.replace(/c\./g, 'm.')
        if (lojaIds && lojaIds.length > 0) {
          query = `
            SELECT COALESCE(l.nome_loja, 'Unidade ' || ids.id) as label, 
                   (COUNT(m.id_movimentacao)::float / NULLIF(COUNT(DISTINCT m.id_cliente), 0)::float) as value
            FROM (SELECT unnest($1::int[]) as id) ids
            LEFT JOIN "${schema}".lojas l ON l.id_loja = ids.id
            LEFT JOIN "${schema}".cliente_pontos_movimentacao m ON m.id_loja = ids.id AND m.tipo = 'CREDITO' ${mPeriodCondition}
            GROUP BY ids.id, l.nome_loja
          `
        } else {
          query = `
            SELECT l.nome_loja as label, 
                   (COUNT(m.id_movimentacao)::float / NULLIF(COUNT(DISTINCT m.id_cliente), 0)::float) as value
            FROM "${schema}".lojas l 
            LEFT JOIN "${schema}".cliente_pontos_movimentacao m ON m.id_loja = l.id_loja AND m.tipo = 'CREDITO' ${mPeriodCondition}
            GROUP BY l.id_loja, l.nome_loja
          `
        }
        const res = await client.query(query, lojaParams)
        return res.rows.map(r => ({ label: r.label, value: Math.floor(Number(r.value || 0) * 10) / 10 }))
      } else if (kpi === 'sexo') {
        let query = ''
        if (lojaIds && lojaIds.length > 0) {
           query = `
            SELECT ids.id as loja_id, COALESCE(l.nome_loja, 'Unidade ' || ids.id) as label, c.sexo, COUNT(c.id_cliente)::int as count 
            FROM (SELECT unnest($1::int[]) as id) ids
            LEFT JOIN "${schema}".lojas l ON l.id_loja = ids.id
            LEFT JOIN "${schema}".clientes c ON c.id_loja = ids.id AND c.sexo IS NOT NULL ${periodCondition}
            GROUP BY ids.id, l.nome_loja, c.sexo
          `
        } else {
           query = `
            SELECT l.id_loja as loja_id, l.nome_loja as label, c.sexo, COUNT(c.id_cliente)::int as count 
            FROM "${schema}".lojas l 
            LEFT JOIN "${schema}".clientes c ON c.id_loja = l.id_loja AND c.sexo IS NOT NULL ${periodCondition}
            GROUP BY l.id_loja, l.nome_loja, c.sexo
          `
        }
        const res = await client.query(query, lojaParams)
        const grouped = res.rows.reduce((acc: any, row: any) => {
          if (!acc[row.label]) acc[row.label] = { label: row.label, counts: {} }
          if (row.sexo) {
             const key = row.sexo === 'F' ? 'FEMININO' : row.sexo === 'M' ? 'MASCULINO' : 'OUTROS'
             acc[row.label].counts[key] = (acc[row.label].counts[key] || 0) + row.count
          }
          return acc
        }, {})
        return Object.values(grouped)
      } else if (kpi === 'faixa_etaria') {
        let query = ''
        const ageCase = `
          CASE 
            WHEN (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM c.data_nascimento)) BETWEEN 10 AND 20 THEN '10-20 ANOS'
            WHEN (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM c.data_nascimento)) BETWEEN 21 AND 30 THEN '21-30 ANOS'
            WHEN (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM c.data_nascimento)) BETWEEN 31 AND 40 THEN '31-40 ANOS'
            WHEN (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM c.data_nascimento)) BETWEEN 41 AND 50 THEN '41-50 ANOS'
            WHEN (EXTRACT(YEAR FROM NOW()) - EXTRACT(YEAR FROM c.data_nascimento)) BETWEEN 51 AND 60 THEN '51-60 ANOS'
            ELSE '60+ ANOS'
          END
        `
        if (lojaIds && lojaIds.length > 0) {
           query = `
            SELECT ids.id as loja_id, COALESCE(l.nome_loja, 'Unidade ' || ids.id) as label, ${ageCase} as range, COUNT(c.id_cliente)::int as count 
            FROM (SELECT unnest($1::int[]) as id) ids
            LEFT JOIN "${schema}".lojas l ON l.id_loja = ids.id
            LEFT JOIN "${schema}".clientes c ON c.id_loja = ids.id AND c.data_nascimento IS NOT NULL ${periodCondition}
            GROUP BY ids.id, l.nome_loja, range
          `
        } else {
           query = `
            SELECT l.id_loja as loja_id, l.nome_loja as label, ${ageCase} as range, COUNT(c.id_cliente)::int as count 
            FROM "${schema}".lojas l 
            LEFT JOIN "${schema}".clientes c ON c.id_loja = l.id_loja AND c.data_nascimento IS NOT NULL ${periodCondition}
            GROUP BY l.id_loja, l.nome_loja, range
          `
        }
        const res = await client.query(query, lojaParams)
        const grouped = res.rows.reduce((acc: any, row: any) => {
          if (!acc[row.label]) acc[row.label] = { label: row.label, counts: {} }
          if (row.range && row.count > 0) {
             acc[row.label].counts[row.range] = (acc[row.label].counts[row.range] || 0) + row.count
          }
          return acc
        }, {})
        return Object.values(grouped)
      }
      return []
    } finally {
      client.release()
    }
  }

  async getMapData(schema: string, lojaIds: number[]): Promise<any> {
    const client = await pool.connect()
    try {
      const resLojas = await client.query(`SELECT id_loja, nome_loja, endereco_completo, latitude, longitude FROM "${schema}".lojas WHERE id_loja = ANY($1::int[])`, [lojaIds])
      const resClientes = await client.query(`
        SELECT 
          cep, 
          latitude, 
          longitude, 
          COUNT(*)::int as total,
          json_agg(json_build_object('nome', nome_completo, 'saldo', saldo)) as listagem_clientes
        FROM "${schema}".clientes 
        WHERE id_loja = ANY($1::int[]) AND cep IS NOT NULL 
        GROUP BY cep, latitude, longitude`, [lojaIds])
      return { lojas: resLojas.rows, clientes: resClientes.rows }
    } finally {
      client.release()
    }
  }
}

