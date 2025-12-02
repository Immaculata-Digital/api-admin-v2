import { z } from 'zod'

export const createClienteConcordiaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  email: z.string().email('Email inválido').max(255),
  whatsapp: z.string().min(1, 'WhatsApp é obrigatório').max(20),
  schema: z.string().min(1, 'Schema é obrigatório').max(255).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Schema inválido'),
  ativo: z.boolean().optional(),
  usu_cadastro: z.number().int().positive().optional(),
})

export const updateClienteConcordiaSchema = z.object({
  nome: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  whatsapp: z.string().min(1).max(20).optional(),
  schema: z.string().min(1).max(255).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/).optional(),
  ativo: z.boolean().optional(),
  usu_altera: z.number().int().positive().nullable().optional(),
})

