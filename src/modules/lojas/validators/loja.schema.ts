import { z } from 'zod'

export const createLojaSchema = z.object({
  nome_loja: z.string().min(1, 'Nome da loja é obrigatório').max(255),
  nome_loja_publico: z.string().max(255).optional(),
  numero_identificador: z.string().min(1, 'Número identificador é obrigatório').max(50),
  nome_responsavel: z.string().max(255),
  telefone_responsavel: z.string().max(20).optional(),
  cnpj: z.string().min(1, 'CNPJ é obrigatório').max(18),
  endereco_completo: z.string().min(1, 'Endereço completo é obrigatório').max(500),
  usu_cadastro: z.string().uuid().nullable().optional(),
})

export const updateLojaSchema = z.object({
  nome_loja: z.string().min(1).max(255).optional(),
  nome_loja_publico: z.string().max(255).optional(),
  numero_identificador: z.string().min(1).max(50).optional(),
  nome_responsavel: z.string().max(255).optional(),
  telefone_responsavel: z.string().max(20).optional(),
  cnpj: z.string().min(1).max(18).optional(),
  endereco_completo: z.string().min(1).max(500).optional(),
  usu_altera: z.string().uuid().nullable().optional(),
})

