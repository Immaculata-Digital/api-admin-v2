export interface UpdateItemRecompensaDTO {
  nome_item?: string
  descricao?: string
  quantidade_pontos?: number
  imagem_item?: string | null
  nao_retirar_loja?: boolean
  usu_altera?: string | null
}

