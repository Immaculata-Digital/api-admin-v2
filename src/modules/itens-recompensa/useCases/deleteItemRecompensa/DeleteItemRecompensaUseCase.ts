import { AppError } from '../../../../core/errors/AppError'
import type { IItemRecompensaRepository } from '../../repositories/IItemRecompensaRepository'

export class DeleteItemRecompensaUseCase {
  constructor(private readonly itemRecompensaRepository: IItemRecompensaRepository) {}

  async execute(schema: string, id: number) {
    const deleted = await this.itemRecompensaRepository.delete(schema, id)
    if (!deleted) {
      throw new AppError('Item de recompensa não encontrado', 404)
    }
  }
}

