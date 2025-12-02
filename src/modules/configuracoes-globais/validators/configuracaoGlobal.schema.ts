import { z } from 'zod'

const hexColorSchema = z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/, 'Cor deve estar no formato hexadecimal (#RRGGBB ou #RRGGBBAA)').nullable().optional()

export const createConfiguracaoGlobalSchema = z.object({
  logo_base64: z.string().nullable().optional(),
  cor_primaria: hexColorSchema,
  cor_secundaria: hexColorSchema,
  cor_texto: hexColorSchema,
  cor_destaque_texto: hexColorSchema,
  fonte_titulos: z.string().max(100).nullable().optional(),
  fonte_textos: z.string().max(100).nullable().optional(),
  usu_cadastro: z.number().int().positive().optional(),
})

export const updateConfiguracaoGlobalSchema = z.object({
  logo_base64: z.string().nullable().optional(),
  cor_primaria: hexColorSchema,
  cor_secundaria: hexColorSchema,
  cor_texto: hexColorSchema,
  cor_destaque_texto: hexColorSchema,
  fonte_titulos: z.string().max(100).nullable().optional(),
  fonte_textos: z.string().max(100).nullable().optional(),
  usu_altera: z.number().int().positive().nullable().optional(),
})

