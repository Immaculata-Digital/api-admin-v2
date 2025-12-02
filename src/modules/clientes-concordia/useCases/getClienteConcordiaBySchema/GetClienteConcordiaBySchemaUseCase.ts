import type { IClienteConcordiaRepository } from '../../repositories/IClienteConcordiaRepository'

export class GetClienteConcordiaBySchemaUseCase {
  constructor(private readonly clienteConcordiaRepository: IClienteConcordiaRepository) {}

  async execute(schema: string) {
    return await this.clienteConcordiaRepository.findBySchema(schema)
  }
}

