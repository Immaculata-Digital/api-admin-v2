import { z } from 'zod'

export const createComboSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  chave: z.string().min(1, 'Chave é obrigatória').max(100),
  script: z.string().min(1, 'Script é obrigatório'),
  usu_cadastro: z.string().uuid().nullable().optional(),
})

export const updateComboSchema = z.object({
  descricao: z.string().min(1).optional(),
  chave: z.string().min(1).max(100).optional(),
  script: z.string().min(1).optional(),
  usu_altera: z.string().uuid().nullable().optional(),
})

