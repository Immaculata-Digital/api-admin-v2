import { AppError } from '../../../../core/errors/AppError'
import type { ILojaRepository } from '../../repositories/ILojaRepository'

export class GetLojaUseCase {
  constructor(private readonly lojaRepository: ILojaRepository) {}

  async execute(schema: string, id: number) {
    const loja = await this.lojaRepository.findById(schema, id)
    if (!loja) {
      throw new AppError('Loja não encontrada', 404)
    }
    return loja
  }
}

