import { AppError } from '../../../../core/errors/AppError'
import type { IComboRepository } from '../../repositories/IComboRepository'

export class GetComboValuesUseCase {
  constructor(private readonly comboRepository: IComboRepository) {}

  async execute(chave: string) {
    const combo = await this.comboRepository.findByChave(chave)
    if (!combo) {
      throw new AppError('Combo não encontrada', 404)
    }

    return await this.comboRepository.executeScript(combo.script)
  }
}

