import type { IConfiguracaoGlobalRepository } from '../../repositories/IConfiguracaoGlobalRepository'
import type { CreateConfiguracaoGlobalDTO } from '../../dto/CreateConfiguracaoGlobalDTO'
import { ConfiguracaoGlobal } from '../../entities/ConfiguracaoGlobal'

export class CreateConfiguracaoGlobalUseCase {
  constructor(private readonly configuracaoGlobalRepository: IConfiguracaoGlobalRepository) { }

  async execute(schema: string, data: CreateConfiguracaoGlobalDTO) {
    const config = ConfiguracaoGlobal.create({
      logo_base64: data.logo_base64 ?? null,
      cor_fundo: data.cor_fundo ?? null,
      cor_card: data.cor_card ?? null,
      cor_texto_card: data.cor_texto_card ?? null,
      cor_valor_card: data.cor_valor_card ?? null,
      cor_botao: data.cor_botao ?? null,
      cor_texto_botao: data.cor_texto_botao ?? null,
      fonte_titulos: data.fonte_titulos ?? null,
      fonte_textos: data.fonte_textos ?? null,
      arquivo_politica_privacidade: data.arquivo_politica_privacidade ?? null,
      arquivo_termos_uso: data.arquivo_termos_uso ?? null,
      usu_cadastro: data.usu_cadastro ?? null,
    })

    return await this.configuracaoGlobalRepository.create(schema, config.toJSON())
  }
}

