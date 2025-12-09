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

export interface DashboardResponse {
  clientes_total: number
  clientes_7d: number
  clientes_7d_variacao: number
  pontos_creditados_7d: number
  pontos_resgatados_7d: number
  novos_clientes_7d: DashboardCliente[]
  ultimos_resgates: DashboardResgate[]
}

export class DashboardService {
  async getDashboardData(schema: string, lojaId?: number): Promise<DashboardResponse> {
    const client = await pool.connect()
    try {
      // Nota: Este é um exemplo básico. A implementação completa dependeria das tabelas específicas do sistema
      // Por enquanto, retornamos dados básicos. Você pode expandir isso conforme necessário.

      // Total de clientes
      const totalClientesQuery = lojaId
        ? `SELECT COUNT(*) as count FROM "${schema}".clientes WHERE id_loja = $1`
        : `SELECT COUNT(*) as count FROM "${schema}".clientes`
      const totalClientesResult = await client.query<{ count: string }>(
        totalClientesQuery,
        lojaId ? [lojaId] : []
      )
      const clientes_total = parseInt(totalClientesResult.rows[0]?.count || '0', 10)

      // Clientes dos últimos 7 dias
      const clientes7dQuery = lojaId
        ? `SELECT COUNT(*) as count FROM "${schema}".clientes 
           WHERE dt_cadastro >= NOW() - INTERVAL '7 days' 
             AND id_loja = $1`
        : `SELECT COUNT(*) as count FROM "${schema}".clientes 
           WHERE dt_cadastro >= NOW() - INTERVAL '7 days'`
      const clientes7dResult = await client.query<{ count: string }>(
        clientes7dQuery,
        lojaId ? [lojaId] : []
      )
      const clientes_7d = parseInt(clientes7dResult.rows[0]?.count || '0', 10)

      // Clientes dos 7 dias anteriores (para calcular variação)
      const clientes7dAnteriorQuery = lojaId
        ? `SELECT COUNT(*) as count FROM "${schema}".clientes 
           WHERE dt_cadastro >= NOW() - INTERVAL '14 days' 
             AND dt_cadastro < NOW() - INTERVAL '7 days'
             AND id_loja = $1`
        : `SELECT COUNT(*) as count FROM "${schema}".clientes 
           WHERE dt_cadastro >= NOW() - INTERVAL '14 days' 
             AND dt_cadastro < NOW() - INTERVAL '7 days'`
      const clientes7dAnteriorResult = await client.query<{ count: string }>(
        clientes7dAnteriorQuery,
        lojaId ? [lojaId] : []
      )
      const clientes_7d_anterior = parseInt(clientes7dAnteriorResult.rows[0]?.count || '0', 10)
      const clientes_7d_variacao = clientes_7d_anterior > 0
        ? ((clientes_7d - clientes_7d_anterior) / clientes_7d_anterior) * 100
        : clientes_7d > 0 ? 100 : 0

      // Pontos creditados nos últimos 7 dias (da tabela cliente_pontos_movimentacao)
      const pontosCreditadosQuery = lojaId
        ? `SELECT COALESCE(SUM(m.pontos), 0) as sum 
           FROM "${schema}".cliente_pontos_movimentacao m
           INNER JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente
           WHERE m.tipo = 'CREDITO' 
             AND m.dt_cadastro >= NOW() - INTERVAL '7 days'
             AND c.id_loja = $1`
        : `SELECT COALESCE(SUM(pontos), 0) as sum 
           FROM "${schema}".cliente_pontos_movimentacao 
           WHERE tipo = 'CREDITO' 
             AND dt_cadastro >= NOW() - INTERVAL '7 days'`
      const pontosCreditadosResult = await client.query<{ sum: string | null }>(
        pontosCreditadosQuery,
        lojaId ? [lojaId] : []
      )
      const pontos_creditados_7d = parseInt(pontosCreditadosResult.rows[0]?.sum || '0', 10)

      // Pontos resgatados nos últimos 7 dias (da tabela cliente_pontos_movimentacao com tipo DEBITO e origem RESGATE)
      const pontosResgatadosQuery = lojaId
        ? `SELECT COALESCE(SUM(m.pontos), 0) as sum 
           FROM "${schema}".cliente_pontos_movimentacao m
           INNER JOIN "${schema}".clientes c ON m.id_cliente = c.id_cliente
           WHERE m.tipo = 'DEBITO' 
             AND m.origem = 'RESGATE'
             AND m.dt_cadastro >= NOW() - INTERVAL '7 days'
             AND c.id_loja = $1`
        : `SELECT COALESCE(SUM(pontos), 0) as sum 
           FROM "${schema}".cliente_pontos_movimentacao 
           WHERE tipo = 'DEBITO' 
             AND origem = 'RESGATE'
             AND dt_cadastro >= NOW() - INTERVAL '7 days'`
      const pontosResgatadosResult = await client.query<{ sum: string | null }>(
        pontosResgatadosQuery,
        lojaId ? [lojaId] : []
      )
      const pontos_resgatados_7d = parseInt(pontosResgatadosResult.rows[0]?.sum || '0', 10)

      // Novos clientes dos últimos 7 dias
      const novosClientesQuery = lojaId
        ? `SELECT c.id_cliente, c.nome_completo as nome, c.email, c.whatsapp, 
                  c.dt_cadastro::text, COALESCE(c.saldo, 0) as pontos_saldo 
           FROM "${schema}".clientes c
           WHERE c.dt_cadastro >= NOW() - INTERVAL '7 days' 
             AND c.id_loja = $1
           ORDER BY c.dt_cadastro DESC LIMIT 10`
        : `SELECT c.id_cliente, c.nome_completo as nome, c.email, c.whatsapp, 
                  c.dt_cadastro::text, COALESCE(c.saldo, 0) as pontos_saldo 
           FROM "${schema}".clientes c
           WHERE c.dt_cadastro >= NOW() - INTERVAL '7 days' 
           ORDER BY c.dt_cadastro DESC LIMIT 10`
      
      const novosClientesResult = await client.query<DashboardCliente>(
        novosClientesQuery,
        lojaId ? [lojaId] : []
      )
      const novos_clientes_7d = novosClientesResult.rows

      // Últimos resgates (da tabela cliente_pontos_movimentacao com LEFT JOIN em clientes_itens_recompensa)
      // Usa LEFT JOIN porque a tabela clientes_itens_recompensa pode não existir em schemas antigos
      const ultimosResgatesQuery = lojaId
        ? `SELECT 
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
             AND m.origem = 'RESGATE'
             AND c.id_loja = $1
           ORDER BY m.dt_cadastro DESC LIMIT 10`
        : `SELECT 
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
             AND m.origem = 'RESGATE'
           ORDER BY m.dt_cadastro DESC LIMIT 10`
      
      let ultimos_resgates: DashboardResgate[] = []
      try {
        const ultimosResgatesResult = await client.query<DashboardResgate>(
          ultimosResgatesQuery,
          lojaId ? [lojaId] : []
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
        novos_clientes_7d,
        ultimos_resgates,
      }
    } catch (error: any) {
      // Log do erro para debug
      console.error(`[DashboardService] Erro ao buscar dados do dashboard para schema ${schema}:`, error)
      
      // Se as tabelas não existirem, retornar dados vazios
      // Mas tentar pelo menos buscar total de clientes se a tabela existir
      try {
        const totalClientesQuery = lojaId
          ? `SELECT COUNT(*) as count FROM "${schema}".clientes WHERE id_loja = $1`
          : `SELECT COUNT(*) as count FROM "${schema}".clientes`
        const totalResult = await client.query<{ count: string }>(
          totalClientesQuery,
          lojaId ? [lojaId] : []
        )
        const clientes_total = parseInt(totalResult.rows[0]?.count || '0', 10)
        
        return {
          clientes_total,
          clientes_7d: 0,
          clientes_7d_variacao: 0,
          pontos_creditados_7d: 0,
          pontos_resgatados_7d: 0,
          novos_clientes_7d: [],
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
          novos_clientes_7d: [],
          ultimos_resgates: [],
        }
      }
    } finally {
      client.release()
    }
  }

  async getLojaIdForUserInSchema(userId: number, schema: string): Promise<number | null> {
    const client = await pool.connect()
    try {
      // Assumindo uma tabela de relacionamento usuário-loja
      const result = await client.query<{ id_loja: number }>(
        `SELECT id_loja FROM "${schema}".usuarios_lojas 
         WHERE id_usuario = $1 LIMIT 1`,
        [userId]
      )
      return result.rows[0]?.id_loja ?? null
    } catch {
      return null
    } finally {
      client.release()
    }
  }
}

