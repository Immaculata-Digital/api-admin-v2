import { z } from 'zod'

export const createWebRadioSchema = z.object({
  nome_audio: z.string().min(1, 'Nome do áudio é obrigatório'),
  arquivo_audio_base64: z.string().nullable().optional(),
  duracao_segundos: z.number().int().positive().nullable().optional(),
  ordem: z.number().int().positive().optional(),
  usu_cadastro: z.number().int().positive().optional(),
})

export const updateWebRadioSchema = z.object({
  nome_audio: z.string().min(1).optional(),
  arquivo_audio_base64: z.string().nullable().optional(),
  duracao_segundos: z.number().int().positive().nullable().optional(),
  ordem: z.number().int().positive().optional(),
  usu_altera: z.number().int().positive().nullable().optional(),
})

export const reorderWebRadioSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'Lista de IDs é obrigatória'),
})

