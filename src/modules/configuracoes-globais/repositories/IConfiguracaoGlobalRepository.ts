import type { ConfiguracaoGlobalProps } from '../entities/ConfiguracaoGlobal'

export interface IConfiguracaoGlobalRepository {
  findAll(schema: string, filters: { limit: number; offset: number }): Promise<{ rows: ConfiguracaoGlobalProps[]; count: number }>
  findById(schema: string, id: number): Promise<ConfiguracaoGlobalProps | null>
  create(schema: string, data: Omit<ConfiguracaoGlobalProps, 'id_config_global' | 'dt_cadastro' | 'dt_altera'>): Promise<ConfiguracaoGlobalProps>
  update(schema: string, id: number, data: Partial<ConfiguracaoGlobalProps>): Promise<ConfiguracaoGlobalProps | null>
  delete(schema: string, id: number): Promise<boolean>
}

