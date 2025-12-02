import type { ILogSistemaRepository } from '../../repositories/ILogSistemaRepository'
import type { CreateLogSistemaDTO } from '../../dto/CreateLogSistemaDTO'
import { LogSistema } from '../../entities/LogSistema'

export class CreateLogSistemaUseCase {
  constructor(private readonly logSistemaRepository: ILogSistemaRepository) {}

  async execute(schema: string, data: CreateLogSistemaDTO) {
    const log = LogSistema.create({
      nivel: data.nivel,
      operacao: data.operacao,
      tabela: data.tabela ?? null,
      id_registro: data.id_registro ?? null,
      usuario_id: data.usuario_id ?? null,
      mensagem: data.mensagem,
      dados_antes: data.dados_antes ?? null,
      dados_depois: data.dados_depois ?? null,
      ip_origem: data.ip_origem ?? null,
      user_agent: data.user_agent ?? null,
      dados_extras: data.dados_extras ?? null,
    })

    return await this.logSistemaRepository.create(schema, log.toJSON())
  }
}

