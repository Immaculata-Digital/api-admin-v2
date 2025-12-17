import { AppError } from '../../../../core/errors/AppError'
import type { IItemRecompensaRepository } from '../../repositories/IItemRecompensaRepository'
import type { UpdateItemRecompensaDTO } from '../../dto/UpdateItemRecompensaDTO'
import { ItemRecompensa } from '../../entities/ItemRecompensa'

export class UpdateItemRecompensaUseCase {
  constructor(private readonly itemRecompensaRepository: IItemRecompensaRepository) {}

  async execute(schema: string, id: number, data: UpdateItemRecompensaDTO) {
    const existing = await this.itemRecompensaRepository.findById(schema, id)
    if (!existing) {
      throw new AppError('Item de recompensa não encontrado', 404)
    }

    if (data.quantidade_pontos !== undefined && data.quantidade_pontos <= 0) {
      throw new AppError('Quantidade de pontos deve ser maior que zero', 400)
    }

    const item = ItemRecompensa.restore(existing)
    const updateData: UpdateItemRecompensaDTO = {
      usu_altera: data.usu_altera ?? null,
    }
    if (data.nome_item !== undefined) updateData.nome_item = data.nome_item
    if (data.descricao !== undefined) updateData.descricao = data.descricao
    if (data.quantidade_pontos !== undefined) updateData.quantidade_pontos = data.quantidade_pontos
    if (data.imagem_item !== undefined) updateData.imagem_item = data.imagem_item
    if (data.nao_retirar_loja !== undefined) updateData.nao_retirar_loja = data.nao_retirar_loja
    item.update(updateData)

    const updated = await this.itemRecompensaRepository.update(schema, id, item.toJSON())
    return updated || existing
  }
}

