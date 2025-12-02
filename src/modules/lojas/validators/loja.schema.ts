import { z } from 'zod'

export const createLojaSchema = z.object({
  nome_loja: z.string().min(1, 'Nome da loja é obrigatório').max(255),
  numero_identificador: z.string().min(1, 'Número identificador é obrigatório').max(50),
  nome_responsavel: z.string().min(1, 'Nome do responsável é obrigatório').max(255),
  telefone_responsavel: z.string().min(1, 'Telefone do responsável é obrigatório').max(20),
  cnpj: z.string().min(1, 'CNPJ é obrigatório').max(18),
  endereco_completo: z.string().min(1, 'Endereço completo é obrigatório').max(500),
  usu_cadastro: z.number().int().positive().optional(),
})

export const updateLojaSchema = z.object({
  nome_loja: z.string().min(1).max(255).optional(),
  numero_identificador: z.string().min(1).max(50).optional(),
  nome_responsavel: z.string().min(1).max(255).optional(),
  telefone_responsavel: z.string().min(1).max(20).optional(),
  cnpj: z.string().min(1).max(18).optional(),
  endereco_completo: z.string().min(1).max(500).optional(),
  usu_altera: z.number().int().positive().nullable().optional(),
})

