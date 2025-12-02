import type { IClienteConcordiaRepository } from '../../repositories/IClienteConcordiaRepository'

export class ListClientesConcordiaUseCase {
  constructor(private readonly clienteConcordiaRepository: IClienteConcordiaRepository) {}

  async execute(filters: { limit: number; offset: number; search?: string; schema?: string; ativo?: boolean }) {
    return await this.clienteConcordiaRepository.findAll(filters)
  }
}

