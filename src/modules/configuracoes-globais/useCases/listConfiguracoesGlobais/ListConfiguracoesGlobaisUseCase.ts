import type { IConfiguracaoGlobalRepository } from '../../repositories/IConfiguracaoGlobalRepository'

export class ListConfiguracoesGlobaisUseCase {
  constructor(private readonly configuracaoGlobalRepository: IConfiguracaoGlobalRepository) {}

  async execute(schema: string, filters: { limit: number; offset: number }) {
    return await this.configuracaoGlobalRepository.findAll(schema, filters)
  }
}

