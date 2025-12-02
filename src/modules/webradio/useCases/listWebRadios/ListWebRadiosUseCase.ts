import type { IWebRadioRepository } from '../../repositories/IWebRadioRepository'

export class ListWebRadiosUseCase {
  constructor(private readonly webRadioRepository: IWebRadioRepository) {}

  async execute(schema: string, filters: { limit: number; offset: number; search?: string }) {
    return await this.webRadioRepository.findAll(schema, filters)
  }
}

