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
    item.update({
      nome_item: data.nome_item,
      descricao: data.descricao,
      quantidade_pontos: data.quantidade_pontos,
      imagem_item: data.imagem_item,
      nao_retirar_loja: data.nao_retirar_loja,
      usu_altera: data.usu_altera ?? null,
    })

    const updated = await this.itemRecompensaRepository.update(schema, id, item.toJSON())
    return updated || existing
  }
}

