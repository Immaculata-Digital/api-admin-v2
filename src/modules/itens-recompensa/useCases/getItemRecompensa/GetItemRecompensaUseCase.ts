import { AppError } from '../../../../core/errors/AppError'
import type { IItemRecompensaRepository } from '../../repositories/IItemRecompensaRepository'

export class GetItemRecompensaUseCase {
  constructor(private readonly itemRecompensaRepository: IItemRecompensaRepository) {}

  async execute(schema: string, id: number) {
    const item = await this.itemRecompensaRepository.findById(schema, id)
    if (!item) {
      throw new AppError('Item de recompensa não encontrado', 404)
    }
    return item
  }
}

