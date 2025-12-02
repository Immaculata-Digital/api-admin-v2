import type { ComboProps } from '../entities/Combo'

export interface IComboRepository {
  findAll(filters: { limit: number; offset: number; search?: string }): Promise<{ rows: ComboProps[]; count: number }>
  findById(id: number): Promise<ComboProps | null>
  create(data: Omit<ComboProps, 'id_combo' | 'dt_cadastro' | 'dt_altera'>): Promise<ComboProps>
  update(id: number, data: Partial<ComboProps>): Promise<ComboProps | null>
  delete(id: number): Promise<boolean>
  findByChave(chave: string): Promise<ComboProps | null>
  executeScript(script: string): Promise<any[]>
}

