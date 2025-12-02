import { AppError } from '../../../../core/errors/AppError'
import type { IWebRadioRepository } from '../../repositories/IWebRadioRepository'

export class DeleteWebRadioUseCase {
  constructor(private readonly webRadioRepository: IWebRadioRepository) {}

  async execute(schema: string, id: number) {
    const deleted = await this.webRadioRepository.delete(schema, id)
    if (!deleted) {
      throw new AppError('Áudio não encontrado', 404)
    }
  }
}

