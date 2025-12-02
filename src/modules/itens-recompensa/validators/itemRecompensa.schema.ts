import { z } from 'zod'

export const createItemRecompensaSchema = z.object({
  nome_item: z.string().min(1, 'Nome do item é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidade_pontos: z.number().int().positive('Quantidade de pontos deve ser maior que zero'),
  imagem_item: z.string().nullable().optional(),
  nao_retirar_loja: z.boolean().optional(),
  usu_cadastro: z.number().int().positive().optional(),
})

export const updateItemRecompensaSchema = z.object({
  nome_item: z.string().min(1).optional(),
  descricao: z.string().min(1).optional(),
  quantidade_pontos: z.number().int().positive().optional(),
  imagem_item: z.string().nullable().optional(),
  nao_retirar_loja: z.boolean().optional(),
  usu_altera: z.number().int().positive().nullable().optional(),
})

