export interface CreateLogSistemaDTO {
  nivel: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  operacao: string
  tabela?: string | null
  id_registro?: number | null
  usuario_id?: number | null
  mensagem: string
  dados_antes?: object | null
  dados_depois?: object | null
  ip_origem?: string | null
  user_agent?: string | null
  dados_extras?: object | null
}

