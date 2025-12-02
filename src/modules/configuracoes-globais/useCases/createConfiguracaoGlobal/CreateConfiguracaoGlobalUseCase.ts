import type { IConfiguracaoGlobalRepository } from '../../repositories/IConfiguracaoGlobalRepository'
import type { CreateConfiguracaoGlobalDTO } from '../../dto/CreateConfiguracaoGlobalDTO'
import { ConfiguracaoGlobal } from '../../entities/ConfiguracaoGlobal'

export class CreateConfiguracaoGlobalUseCase {
  constructor(private readonly configuracaoGlobalRepository: IConfiguracaoGlobalRepository) {}

  async execute(schema: string, data: CreateConfiguracaoGlobalDTO) {
    const config = ConfiguracaoGlobal.create({
      logo_base64: data.logo_base64 ?? null,
      cor_primaria: data.cor_primaria ?? null,
      cor_secundaria: data.cor_secundaria ?? null,
      cor_texto: data.cor_texto ?? null,
      cor_destaque_texto: data.cor_destaque_texto ?? null,
      fonte_titulos: data.fonte_titulos ?? null,
      fonte_textos: data.fonte_textos ?? null,
      usu_cadastro: data.usu_cadastro ?? 0,
    })

    return await this.configuracaoGlobalRepository.create(schema, config.toJSON())
  }
}

