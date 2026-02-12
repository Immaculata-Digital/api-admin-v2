import type { LojaProps } from '../entities/Loja'

export interface ILojaRepository {
  findAll(schema: string, filters: { limit: number; offset: number; search?: string }): Promise<{ rows: LojaProps[]; count: number }>
  findById(schema: string, id: number): Promise<LojaProps | null>
  create(schema: string, data: Omit<LojaProps, 'id_loja' | 'dt_cadastro' | 'dt_altera'>): Promise<LojaProps>
  update(schema: string, id: number, data: Partial<LojaProps>): Promise<LojaProps | null>
  delete(schema: string, id: number): Promise<boolean>
  findResponsaveis(schema: string, idLoja: number): Promise<string[]>
  syncResponsaveis(schema: string, idLoja: number, userIds: string[]): Promise<void>
  findByUniqueFields(schema: string, fields: { numero_identificador?: string; cnpj?: string }, excludeId?: number): Promise<LojaProps | null>
}
