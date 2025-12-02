import type { IClienteConcordiaRepository } from '../../repositories/IClienteConcordiaRepository'
import type { CreateClienteConcordiaDTO } from '../../dto/CreateClienteConcordiaDTO'
import { ClienteConcordia } from '../../entities/ClienteConcordia'

export class CreateClienteConcordiaUseCase {
  constructor(private readonly clienteConcordiaRepository: IClienteConcordiaRepository) {}

  async execute(data: CreateClienteConcordiaDTO) {
    const cliente = ClienteConcordia.create({
      nome: data.nome,
      email: data.email,
      whatsapp: data.whatsapp,
      schema: data.schema,
      ativo: data.ativo ?? true,
      usu_cadastro: data.usu_cadastro ?? 0,
    })

    return await this.clienteConcordiaRepository.create(cliente.toJSON())
  }
}

