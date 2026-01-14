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

    const updateData: Partial<{ logo_base64: string | null; cor_fundo: string | null; cor_card: string | null; cor_texto_card: string | null; cor_valor_card: string | null; cor_botao: string | null; cor_texto_botao: string | null; fonte_titulos: string | null; fonte_textos: string | null; usu_altera: string | null }> = {
      usu_altera: data.usu_altera ?? null,
    }
    if (data.logo_base64 !== undefined) updateData.logo_base64 = data.logo_base64
    if (data.cor_fundo !== undefined) updateData.cor_fundo = data.cor_fundo
    if (data.cor_card !== undefined) updateData.cor_card = data.cor_card
    if (data.cor_texto_card !== undefined) updateData.cor_texto_card = data.cor_texto_card
    if (data.cor_valor_card !== undefined) updateData.cor_valor_card = data.cor_valor_card
    if (data.cor_botao !== undefined) updateData.cor_botao = data.cor_botao
    if (data.cor_texto_botao !== undefined) updateData.cor_texto_botao = data.cor_texto_botao
    if (data.fonte_titulos !== undefined) updateData.fonte_titulos = data.fonte_titulos
    if (data.fonte_textos !== undefined) updateData.fonte_textos = data.fonte_textos

    const updated = await this.configuracaoGlobalRepository.update(schema, id, updateData)

    return updated || existing
  }
}

