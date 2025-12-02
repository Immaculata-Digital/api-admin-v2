import type { IWebRadioRepository } from '../../repositories/IWebRadioRepository'

export class ReorderWebRadiosUseCase {
  constructor(private readonly webRadioRepository: IWebRadioRepository) {}

  async execute(schema: string, ids: number[]) {
    await this.webRadioRepository.reorder(schema, ids)
  }
}

