import { AppError } from '../../../../core/errors/AppError'
import type { IConfiguracaoGlobalRepository } from '../../repositories/IConfiguracaoGlobalRepository'
import type { UpdateConfiguracaoGlobalDTO } from '../../dto/UpdateConfiguracaoGlobalDTO'

export class UpdateConfiguracaoGlobalUseCase {
  constructor(private readonly configuracaoGlobalRepository: IConfiguracaoGlobalRepository) {}

  async execute(schema: string, id: number, data: UpdateConfiguracaoGlobalDTO) {
    const existing = await this.configuracaoGlobalRepository.findById(schema, id)
    if (!existing) {
      throw new AppError('Configuração global não encontrada', 404)
    }

    const updated = await this.configuracaoGlobalRepository.update(schema, id, {
      logo_base64: data.logo_base64,
      cor_fundo: data.cor_fundo,
      cor_card: data.cor_card,
      cor_texto_card: data.cor_texto_card,
      cor_valor_card: data.cor_valor_card,
      cor_botao: data.cor_botao,
      cor_texto_botao: data.cor_texto_botao,
      fonte_titulos: data.fonte_titulos,
      fonte_textos: data.fonte_textos,
      usu_altera: data.usu_altera ?? null,
    })

    return updated || existing
  }
}

