import type { ILojaRepository } from '../../repositories/ILojaRepository'

export class ListLojasUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) {}

  async execute(schema: string, filters: { limit: number; offset: number; search?: string }) {
    return await this.lojaRepository.findAll(schema, filters)
  }
}

