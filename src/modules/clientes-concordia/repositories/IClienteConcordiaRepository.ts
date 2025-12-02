import type { ClienteConcordiaProps } from '../entities/ClienteConcordia'

export interface IClienteConcordiaRepository {
  findAll(filters: { limit: number; offset: number; search?: string; schema?: string; ativo?: boolean }): Promise<{ rows: ClienteConcordiaProps[]; count: number }>
  findById(id: number): Promise<ClienteConcordiaProps | null>
  findBySchema(schema: string): Promise<ClienteConcordiaProps | null>
  create(data: Omit<ClienteConcordiaProps, 'id_cliente_concordia' | 'dt_cadastro' | 'dt_altera'>): Promise<ClienteConcordiaProps>
  update(id: number, data: Partial<ClienteConcordiaProps>): Promise<ClienteConcordiaProps | null>
  delete(id: number): Promise<boolean>
}

