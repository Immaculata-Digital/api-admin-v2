import type { ItemRecompensaProps } from '../entities/ItemRecompensa'

export interface IItemRecompensaRepository {
  findAll(schema: string, filters: { limit: number; offset: number; search?: string }): Promise<{ rows: ItemRecompensaProps[]; count: number }>
  findById(schema: string, id: number): Promise<ItemRecompensaProps | null>
  create(schema: string, data: Omit<ItemRecompensaProps, 'id_item_recompensa' | 'dt_cadastro' | 'dt_altera' | 'nao_retirar_loja'> & { nao_retirar_loja?: boolean }): Promise<ItemRecompensaProps>
  update(schema: string, id: number, data: Partial<ItemRecompensaProps>): Promise<ItemRecompensaProps | null>
  delete(schema: string, id: number): Promise<boolean>
}

