import type { IWebRadioRepository } from '../../repositories/IWebRadioRepository'

export class GetNextWebRadioUseCase {
  constructor(private readonly webRadioRepository: IWebRadioRepository) {}

  async execute(schema: string, currentAudioId: number) {
    return await this.webRadioRepository.findNextByOrder(schema, currentAudioId)
  }
}

