import { AppError } from '../../../../core/errors/AppError'
import type { IClienteConcordiaRepository } from '../../repositories/IClienteConcordiaRepository'

export class GetClienteConcordiaUseCase {
  constructor(private readonly clienteConcordiaRepository: IClienteConcordiaRepository) {}

  async execute(id: number) {
    const cliente = await this.clienteConcordiaRepository.findById(id)
    if (!cliente) {
      throw new AppError('Cliente Concordia não encontrado', 404)
    }
    return cliente
  }
}

