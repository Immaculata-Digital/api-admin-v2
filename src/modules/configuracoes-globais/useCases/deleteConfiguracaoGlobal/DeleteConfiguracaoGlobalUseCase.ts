import { AppError } from '../../../../core/errors/AppError'
import type { IConfiguracaoGlobalRepository } from '../../repositories/IConfiguracaoGlobalRepository'

export class DeleteConfiguracaoGlobalUseCase {
  constructor(private readonly configuracaoGlobalRepository: IConfiguracaoGlobalRepository) {}

  async execute(schema: string, id: number) {
    const deleted = await this.configuracaoGlobalRepository.delete(schema, id)
    if (!deleted) {
      throw new AppError('Configuração global não encontrada', 404)
    }
  }
}

