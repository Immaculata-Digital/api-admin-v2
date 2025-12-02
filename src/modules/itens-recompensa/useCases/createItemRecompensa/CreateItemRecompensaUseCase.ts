import { AppError } from '../../../../core/errors/AppError'
import type { IItemRecompensaRepository } from '../../repositories/IItemRecompensaRepository'
import type { CreateItemRecompensaDTO } from '../../dto/CreateItemRecompensaDTO'
import { ItemRecompensa } from '../../entities/ItemRecompensa'

export class CreateItemRecompensaUseCase {
  constructor(private readonly itemRecompensaRepository: IItemRecompensaRepository) {}

  async execute(schema: string, data: CreateItemRecompensaDTO) {
    if (data.quantidade_pontos <= 0) {
      throw new AppError('Quantidade de pontos deve ser maior que zero', 400)
    }

    const item = ItemRecompensa.create({
      nome_item: data.nome_item,
      descricao: data.descricao,
      quantidade_pontos: data.quantidade_pontos,
      imagem_item: data.imagem_item ?? null,
      nao_retirar_loja: data.nao_retirar_loja ?? false,
      usu_cadastro: data.usu_cadastro ?? 0,
    })

    return await this.itemRecompensaRepository.create(schema, item.toJSON())
  }
}

