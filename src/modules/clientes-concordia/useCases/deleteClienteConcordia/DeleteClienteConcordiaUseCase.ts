import { AppError } from '../../../../core/errors/AppError'
import type { IClienteConcordiaRepository } from '../../repositories/IClienteConcordiaRepository'

export class DeleteClienteConcordiaUseCase {
  constructor(private readonly clienteConcordiaRepository: IClienteConcordiaRepository) {}

  async execute(id: number) {
    const deleted = await this.clienteConcordiaRepository.delete(id)
    if (!deleted) {
      throw new AppError('Cliente Concordia não encontrado', 404)
    }
  }
}

