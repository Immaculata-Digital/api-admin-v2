export interface CreateLojaDTO {
  nome_loja: string
  nome_loja_publico?: string
  numero_identificador: string
  nome_responsavel: string
  telefone_responsavel?: string
  cnpj: string
  endereco_completo: string
  usu_cadastro?: string | null
}

