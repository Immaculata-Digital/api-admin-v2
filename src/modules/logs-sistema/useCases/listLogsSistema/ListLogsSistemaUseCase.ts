import type { ILogSistemaRepository } from '../../repositories/ILogSistemaRepository'

export class ListLogsSistemaUseCase {
  constructor(private readonly logSistemaRepository: ILogSistemaRepository) {}

  async execute(schema: string, filters: {
    limit: number
    offset: number
    nivel?: string
    operacao?: string
    tabela?: string
    dataInicio?: Date
    dataFim?: Date
  }) {
    return await this.logSistemaRepository.findAll(schema, filters)
  }
}

