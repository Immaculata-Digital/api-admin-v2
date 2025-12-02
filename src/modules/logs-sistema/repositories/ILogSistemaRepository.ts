import type { LogSistemaProps } from '../entities/LogSistema'

export interface ILogSistemaRepository {
  create(schema: string, data: Omit<LogSistemaProps, 'id_log' | 'dt_log'>): Promise<LogSistemaProps>
  findAll(schema: string, filters: {
    limit: number
    offset: number
    nivel?: string
    operacao?: string
    tabela?: string
    dataInicio?: Date
    dataFim?: Date
  }): Promise<{ rows: LogSistemaProps[]; count: number }>
}

