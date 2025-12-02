import { AppError } from '../../../../core/errors/AppError'
import type { IClienteConcordiaRepository } from '../../repositories/IClienteConcordiaRepository'
import type { UpdateClienteConcordiaDTO } from '../../dto/UpdateClienteConcordiaDTO'
import { ClienteConcordia } from '../../entities/ClienteConcordia'

export class UpdateClienteConcordiaUseCase {
  constructor(private readonly clienteConcordiaRepository: IClienteConcordiaRepository) {}

  async execute(id: number, data: UpdateClienteConcordiaDTO) {
    const existing = await this.clienteConcordiaRepository.findById(id)
    if (!existing) {
      throw new AppError('Cliente Concordia não encontrado', 404)
    }

    const cliente = ClienteConcordia.restore(existing)
    cliente.update({
      nome: data.nome,
      email: data.email,
      whatsapp: data.whatsapp,
      schema: data.schema,
      ativo: data.ativo,
      usu_altera: data.usu_altera ?? null,
    })

    const updated = await this.clienteConcordiaRepository.update(id, cliente.toJSON())
    return updated || existing
  }
}

