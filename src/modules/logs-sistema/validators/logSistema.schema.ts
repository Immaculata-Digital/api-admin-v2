import { z } from 'zod'

export const createLogSistemaSchema = z.object({
  nivel: z.enum(['INFO', 'WARN', 'ERROR', 'DEBUG']),
  operacao: z.string().min(1, 'Operação é obrigatória').max(50),
  tabela: z.string().max(100).nullable().optional(),
  id_registro: z.number().int().positive().nullable().optional(),
  usuario_id: z.number().int().positive().nullable().optional(),
  mensagem: z.string().min(1, 'Mensagem é obrigatória'),
  dados_antes: z.record(z.string(), z.any()).nullable().optional(),
  dados_depois: z.record(z.string(), z.any()).nullable().optional(),
  ip_origem: z.string().max(45).nullable().optional(),
  user_agent: z.string().nullable().optional(),
  dados_extras: z.record(z.string(), z.any()).nullable().optional(),
})

