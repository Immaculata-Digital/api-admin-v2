import type { IComboRepository } from '../../repositories/IComboRepository'

export class ListCombosUseCase {
  constructor(private readonly comboRepository: IComboRepository) {}

  async execute(filters: { limit: number; offset: number; search?: string }) {
    return await this.comboRepository.findAll(filters)
  }
}

