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
    const updateData: UpdateWebRadioDTO = {
      usu_altera: data.usu_altera ?? null,
    }
    if (data.nome_audio !== undefined) updateData.nome_audio = data.nome_audio
    if (data.arquivo_audio_base64 !== undefined) updateData.arquivo_audio_base64 = data.arquivo_audio_base64
    if (data.duracao_segundos !== undefined) updateData.duracao_segundos = data.duracao_segundos
    if (data.ordem !== undefined) updateData.ordem = data.ordem
    webradio.update(updateData)

    const updated = await this.webRadioRepository.update(schema, id, webradio.toJSON())
    return updated || existing
  }
}

