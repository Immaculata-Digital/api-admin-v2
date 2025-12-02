import { AppError } from '../../../../core/errors/AppError'
import type { IConfiguracaoGlobalRepository } from '../../repositories/IConfiguracaoGlobalRepository'

export class GetConfiguracaoGlobalUseCase {
  constructor(private readonly configuracaoGlobalRepository: IConfiguracaoGlobalRepository) {}

  async execute(schema: string, id: number) {
    const config = await this.configuracaoGlobalRepository.findById(schema, id)
    if (!config) {
      throw new AppError('Configuração global não encontrada', 404)
    }
    return config
  }
}

