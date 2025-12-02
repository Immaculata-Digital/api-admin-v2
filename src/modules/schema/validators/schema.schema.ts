import { z } from 'zod'

export const createSchemaSchema = z.object({
  schemaName: z
    .string()
    .min(1, 'Nome do schema é obrigatório')
    .max(63, 'Nome do schema deve ter no máximo 63 caracteres')
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      'Nome do schema deve começar com letra ou underscore e conter apenas letras, números e underscore'
    ),
})

