import { z } from 'zod'

export const createComboSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  chave: z.string().min(1, 'Chave é obrigatória').max(100),
  script: z.string().min(1, 'Script é obrigatório'),
  usu_cadastro: z.number().int().positive().optional(),
})

export const updateComboSchema = z.object({
  descricao: z.string().min(1).optional(),
  chave: z.string().min(1).max(100).optional(),
  script: z.string().min(1).optional(),
  usu_altera: z.number().int().positive().nullable().optional(),
})

