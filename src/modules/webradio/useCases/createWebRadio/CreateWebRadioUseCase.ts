import type { IWebRadioRepository } from '../../repositories/IWebRadioRepository'
import type { CreateWebRadioDTO } from '../../dto/CreateWebRadioDTO'
import { WebRadio } from '../../entities/WebRadio'

export class CreateWebRadioUseCase {
  constructor(private readonly webRadioRepository: IWebRadioRepository) {}

  async execute(schema: string, data: CreateWebRadioDTO) {
    const webradio = WebRadio.create({
      nome_audio: data.nome_audio,
      arquivo_audio_base64: data.arquivo_audio_base64 ?? null,
      duracao_segundos: data.duracao_segundos ?? null,
      ordem: data.ordem ?? 1,
      usu_cadastro: data.usu_cadastro ?? 0,
    })

    return await this.webRadioRepository.create(schema, webradio.toJSON())
  }
}

