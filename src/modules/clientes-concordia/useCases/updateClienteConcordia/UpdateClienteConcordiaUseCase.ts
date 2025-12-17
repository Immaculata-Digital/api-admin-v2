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
    const updateData: UpdateClienteConcordiaDTO = {
      usu_altera: data.usu_altera ?? null,
    }
    if (data.nome !== undefined) updateData.nome = data.nome
    if (data.email !== undefined) updateData.email = data.email
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp
    if (data.schema !== undefined) updateData.schema = data.schema
    if (data.ativo !== undefined) updateData.ativo = data.ativo
    cliente.update(updateData)

    const updated = await this.clienteConcordiaRepository.update(id, cliente.toJSON())
    return updated || existing
  }
}

