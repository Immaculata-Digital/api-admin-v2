import { AppError } from '../../../../core/errors/AppError'
import type { IComboRepository } from '../../repositories/IComboRepository'

export class GetComboUseCase {
  constructor(private readonly comboRepository: IComboRepository) {}

  async execute(id: number) {
    const combo = await this.comboRepository.findById(id)
    if (!combo) {
      throw new AppError('Combo não encontrada', 404)
    }
    return combo
  }
}

