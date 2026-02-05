import { z } from 'zod'

const hexColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/, 'Cor deve estar no formato hexadecimal (#RRGGBB ou #RRGGBBAA)').nullable().optional()

export const createConfiguracaoGlobalSchema = z.object({
  logo_base64: z.string().nullable().optional(),
  cor_fundo: hexColorSchema,
  cor_card: hexColorSchema,
  cor_texto_card: hexColorSchema,
  cor_valor_card: hexColorSchema,
  cor_botao: hexColorSchema,
  cor_texto_botao: hexColorSchema,
  fonte_titulos: z.string().max(100).nullable().optional(),
  fonte_textos: z.string().max(100).nullable().optional(),
  arquivo_politica_privacidade: z.string().nullable().optional(),
  arquivo_termos_uso: z.string().nullable().optional(),
})

export const updateConfiguracaoGlobalSchema = z.object({
  logo_base64: z.string().nullable().optional(),
  cor_fundo: hexColorSchema,
  cor_card: hexColorSchema,
  cor_texto_card: hexColorSchema,
  cor_valor_card: hexColorSchema,
  cor_botao: hexColorSchema,
  cor_texto_botao: hexColorSchema,
  fonte_titulos: z.string().max(100).nullable().optional(),
  fonte_textos: z.string().max(100).nullable().optional(),
  arquivo_politica_privacidade: z.string().nullable().optional(),
  arquivo_termos_uso: z.string().nullable().optional(),
  usu_altera: z.string().uuid().nullable().optional(),
})

