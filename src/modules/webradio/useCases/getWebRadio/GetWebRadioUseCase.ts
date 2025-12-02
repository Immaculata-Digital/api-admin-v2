import { AppError } from '../../../../core/errors/AppError'
import type { IWebRadioRepository } from '../../repositories/IWebRadioRepository'

export class GetWebRadioUseCase {
  constructor(private readonly webRadioRepository: IWebRadioRepository) {}

  async execute(schema: string, id: number) {
    const webradio = await this.webRadioRepository.findById(schema, id)
    if (!webradio) {
      throw new AppError('Áudio não encontrado', 404)
    }
    return webradio
  }
}

