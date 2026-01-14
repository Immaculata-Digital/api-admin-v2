import { AppError } from '../../../../core/errors/AppError'
import type { IComboRepository } from '../../repositories/IComboRepository'
import type { CreateComboDTO } from '../../dto/CreateComboDTO'
import { Combo } from '../../entities/Combo'

export class CreateComboUseCase {
  constructor(private readonly comboRepository: IComboRepository) {}

  async execute(data: CreateComboDTO) {
    const existing = await this.comboRepository.findByChave(data.chave)
    if (existing) {
      throw new AppError('Já existe uma combo com esta chave', 409)
    }

    const combo = Combo.create({
      descricao: data.descricao,
      chave: data.chave,
      script: data.script,
      usu_cadastro: data.usu_cadastro ?? null,
    })

    return await this.comboRepository.create(combo.toJSON())
  }
}

