import type { IItemRecompensaRepository } from '../../repositories/IItemRecompensaRepository'

export class ListItensRecompensaUseCase {
  constructor(private readonly itemRecompensaRepository: IItemRecompensaRepository) {}

  async execute(schema: string, filters: { limit: number; offset: number; search?: string }) {
    return await this.itemRecompensaRepository.findAll(schema, filters)
  }
}

