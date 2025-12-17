import { AppError } from '../../../../core/errors/AppError'
import type { IComboRepository } from '../../repositories/IComboRepository'
import type { UpdateComboDTO } from '../../dto/UpdateComboDTO'
import { Combo } from '../../entities/Combo'

export class UpdateComboUseCase {
  constructor(private readonly comboRepository: IComboRepository) {}

  async execute(id: number, data: UpdateComboDTO) {
    const existing = await this.comboRepository.findById(id)
    if (!existing) {
      throw new AppError('Combo não encontrada', 404)
    }

    if (data.chave) {
      const conflicting = await this.comboRepository.findByChave(data.chave)
      if (conflicting && conflicting.id_combo !== id) {
        throw new AppError('Já existe outra combo com esta chave', 409)
      }
    }

    const combo = Combo.restore(existing)
    const updateData: UpdateComboDTO = {
      usu_altera: data.usu_altera ?? null,
    }
    if (data.descricao !== undefined) updateData.descricao = data.descricao
    if (data.chave !== undefined) updateData.chave = data.chave
    if (data.script !== undefined) updateData.script = data.script
    combo.update(updateData)

    const updated = await this.comboRepository.update(id, combo.toJSON())
    return updated || existing
  }
}

