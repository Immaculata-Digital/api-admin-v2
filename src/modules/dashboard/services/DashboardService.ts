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
      const totalClientesResult = await client.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM "${schema}".clientes`,
        []
      )
      const clientes_total = parseInt(totalClientesResult.rows[0]?.count || '0', 10)

      // Clientes dos últimos 7 dias
      const clientes7dResult = await client.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM "${schema}".clientes 
         WHERE dt_cadastro >= NOW() - INTERVAL '7 days'`,
        []
      )
      const clientes_7d = parseInt(clientes7dResult.rows[0]?.count || '0', 10)

      // Clientes dos 7 dias anteriores (para calcular variação)
      const clientes7dAnteriorResult = await client.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM "${schema}".clientes 
         WHERE dt_cadastro >= NOW() - INTERVAL '14 days' 
         AND dt_cadastro < NOW() - INTERVAL '7 days'`,
        []
      )
      const clientes_7d_anterior = parseInt(clientes7dAnteriorResult.rows[0]?.count || '0', 10)
      const clientes_7d_variacao = clientes_7d_anterior > 0
        ? ((clientes_7d - clientes_7d_anterior) / clientes_7d_anterior) * 100
        : 0

      // Pontos creditados nos últimos 7 dias (assumindo tabela de transações)
      const pontosCreditadosResult = await client.query<{ sum: string | null }>(
        `SELECT COALESCE(SUM(pontos), 0) as sum FROM "${schema}".transacoes_pontos 
         WHERE tipo = 'credito' AND dt_transacao >= NOW() - INTERVAL '7 days'`,
        []
      )
      const pontos_creditados_7d = parseInt(pontosCreditadosResult.rows[0]?.sum || '0', 10)

      // Pontos resgatados nos últimos 7 dias
      const pontosResgatadosResult = await client.query<{ sum: string | null }>(
        `SELECT COALESCE(SUM(pontos), 0) as sum FROM "${schema}".resgates 
         WHERE dt_resgate >= NOW() - INTERVAL '7 days'`,
        []
      )
      const pontos_resgatados_7d = parseInt(pontosResgatadosResult.rows[0]?.sum || '0', 10)

      // Novos clientes dos últimos 7 dias
      const novosClientesResult = await client.query<DashboardCliente>(
        `SELECT id_cliente, nome, email, whatsapp, dt_cadastro::text, COALESCE(pontos_saldo, 0) as pontos_saldo 
         FROM "${schema}".clientes 
         WHERE dt_cadastro >= NOW() - INTERVAL '7 days' 
         ORDER BY dt_cadastro DESC LIMIT 10`,
        []
      )
      const novos_clientes_7d = novosClientesResult.rows

      // Últimos resgates
      const ultimosResgatesResult = await client.query<DashboardResgate>(
        `SELECT r.id_resgate, r.id_cliente, c.nome as cliente_nome, i.nome_item as item_nome, 
                r.pontos, r.dt_resgate::text, r.status 
         FROM "${schema}".resgates r
         JOIN "${schema}".clientes c ON r.id_cliente = c.id_cliente
         JOIN "${schema}".itens_recompensa i ON r.id_item_recompensa = i.id_item_recompensa
         ORDER BY r.dt_resgate DESC LIMIT 10`,
        []
      )
      const ultimos_resgates = ultimosResgatesResult.rows

      return {
        clientes_total,
        clientes_7d,
        clientes_7d_variacao: Math.round(clientes_7d_variacao * 100) / 100,
        pontos_creditados_7d,
        pontos_resgatados_7d,
        novos_clientes_7d,
        ultimos_resgates,
      }
    } catch (error) {
      // Se as tabelas não existirem, retornar dados vazios
      return {
        clientes_total: 0,
        clientes_7d: 0,
        clientes_7d_variacao: 0,
        pontos_creditados_7d: 0,
        pontos_resgatados_7d: 0,
        novos_clientes_7d: [],
        ultimos_resgates: [],
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

