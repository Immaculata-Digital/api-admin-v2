import { AppError } from '../../../../core/errors/AppError'
import type { ILojaRepository } from '../../repositories/ILojaRepository'

export class DeleteLojaUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) {}

  async execute(schema: string, id: number) {
    const deleted = await this.lojaRepository.delete(schema, id)
    if (!deleted) {
      throw new AppError('Loja não encontrada', 404)
    }
  }
}

