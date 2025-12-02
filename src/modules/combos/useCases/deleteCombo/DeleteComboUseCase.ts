import { AppError } from '../../../../core/errors/AppError'
import type { IComboRepository } from '../../repositories/IComboRepository'

export class DeleteComboUseCase {
  constructor(private readonly comboRepository: IComboRepository) {}

  async execute(id: number) {
    const deleted = await this.comboRepository.delete(id)
    if (!deleted) {
      throw new AppError('Combo não encontrada', 404)
    }
  }
}

