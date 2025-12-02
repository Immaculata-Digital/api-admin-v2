import { AppError } from '../../../../core/errors/AppError'
import type { IWebRadioRepository } from '../../repositories/IWebRadioRepository'
import type { UpdateWebRadioDTO } from '../../dto/UpdateWebRadioDTO'
import { WebRadio } from '../../entities/WebRadio'

export class UpdateWebRadioUseCase {
  constructor(private readonly webRadioRepository: IWebRadioRepository) {}

  async execute(schema: string, id: number, data: UpdateWebRadioDTO) {
    const existing = await this.webRadioRepository.findById(schema, id)
    if (!existing) {
      throw new AppError('Áudio não encontrado', 404)
    }

    const webradio = WebRadio.restore(existing)
    webradio.update({
      nome_audio: data.nome_audio,
      arquivo_audio_base64: data.arquivo_audio_base64,
      duracao_segundos: data.duracao_segundos,
      ordem: data.ordem,
      usu_altera: data.usu_altera ?? null,
    })

    const updated = await this.webRadioRepository.update(schema, id, webradio.toJSON())
    return updated || existing
  }
}

